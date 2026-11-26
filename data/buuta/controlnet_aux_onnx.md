# Buuta/controlnet_aux_onnx

## Resumen

Buuta/controlnet_aux_onnx es una coleccion de modelos preprocesadores para ControlNet convertidos al formato ONNX y empaquetados como un ecosistema modular de pipelines con especificaciones de entrada/salida unificadas. Lo desarrolla el usuario Buuta y se distribuye bajo el paraguas del repositorio original lllyasviel/Annotators, del que hereda los pesos. El objetivo es permitir la ejecucion de todo el pipeline de preprocesamiento de ControlNet (deteccion de bordes, estimacion de profundidad, mapas de normales, segmentacion SAM) fuera del ecosistema Python, en entornos C#, C++, Rust, web o aceleradores NPU/DirectML/CUDA.

El paquete encapsula dentro de los grafos ONNX las operaciones complejas que en la implementacion original requieren codigo Python: test-time augmentation (flip), filtros de post-procesado como safe_step o scribble, conversion de profundidad a normales y umbrales de eliminacion de fondo. Esto reduce la dependencia de PyTorch y facilita el despliegue en produccion sobre hardware heterogeneo.

La relevancia actual radica en que ControlNet sigue siendo una pieza central en pipelines de generacion de imagen condicionada, y la falta de alternativas portables para el preprocesado ha sido un cuello de botella historico. Este repositorio ofrece una via verificada (mas del 97% de coincidencia de pixeles frente a controlnet_aux) con aceleraciones de hasta 13x en CPU y 90x en NPU, aunque con la advertencia de que los pesos subyacentes conservan las licencias de sus autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples modelos (HED, PidiNet, TEED, Lineart, NormalBae, LeReS, ZoeDepth, MiDaS, SAM) convertidos a grafos ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos ONNX, se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | no disponible (modelos de vision, sin procesamiento linguistico) |
| Licencia | other (codigo de conversion Apache 2.0; pesos con licencia de cada autor original) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El repositorio no entrena modelos nuevos: convierte a ONNX los preprocesadores del paquete controlnet_aux, cuyos pesos provienen de lllyasviel/Annotators. Cada componente mantiene la arquitectura de su modelo original: HED y TEED para deteccion de bordes suaves, PidiNet para bordes con control de grosor, Lineart (en variantes base, coarse y anime) para line art, NormalBae y LeReS para normales y profundidad, ZoeDepth y MiDaS para estimacion de profundidad, y SAM (Segment Anything) para segmentacion. La innovacion del paquete no esta en el entrenamiento sino en la ingenieria de conversion: los grafos ONNX encapsulan el preprocesado de imagen, las augmentaciones de test-time (flip horizontal en ZoeDepth), la conversion profundidad-a-normal en MiDaS y los filtros de post-procesado.

La modularidad se materializa en dos decisiones tecnicas. Primero, un contrato de E/S comun: los modelos base aceptan `uint8 [N, H, W, 3]` en BGR (compatible con OpenCV) y devuelven `float32 [N, 3, H, W]` en RGB normalizado a [0, 1], listo para ControlNet o para encadenar con filtros. Segundo, la division de pipelines pesados en etapas: ZoeDepth se parte en preprocesador, inferencia (que se ejecuta dos veces para original y volteada) y postprocesador; SAM se divide en encoder, decoder y postprocesador, permitiendo reutilizar embeddings de imagen entre multiples puntos de consulta. Los filtros (`filter_*.onnx`) comparten el mismo contrato de entrada y salida, de modo que se pueden encadenar de forma arbitraria sin conversion intermedia.

## Capacidades

- Deteccion de bordes: HED, PidiNet, TEED y variantes Lineart (base, coarse y anime) para generar mapas de control tipo canny/lineart.
- Estimacion de profundidad: ZoeDepth en pipeline de tres etapas y MiDaS con salida de profundidad normalizada y profundidad cruda.
- Mapas de normales de superficie: NormalBae, LeReS y conversion profundidad-a-normal desde MiDaS en el propio grafo.
- Segmentacion de imagenes: pipeline SAM en tres etapas (encoder de imagen, decoder de mascaras por punto y postprocesador).
- Filtros de post-procesado: gamma correction, umbral de bordes PidiNet, safe_step para HED/PidiNet/TEED, NMS para scribble, eliminacion de fondo y de primer plano en LeReS.
- Encadenamiento modular: salidas `float32 [N, 3, H, W]` compatibles entre detectores y filtros, sin conversion Python.
- Ejecucion multiplataforma: ONNX Runtime en C#, C++, Rust, web y aceleradores NPU/DirectML/CUDA.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas: es exclusivamente vision por computador.

## Casos de uso

- Pipeline de generacion de imagen condicionada en produccion: encadenar `hed.onnx` o `lineart.onnx` con el modelo ControlNet correspondiente en un servidor C++ o Rust, eliminando la dependencia de PyTorch y reduciendo el consumo de memoria frente a la implementacion Python.
- Preprocesado en aplicaciones de escritorio: integrar los ONNX en una app C# con ONNX Runtime y DirectML para que el usuario genere mapas de control localmente sin instalar CUDA ni Python.
- Inferencia en el navegador: desplegar los modelos con ONNX Runtime Web para demos de ControlNet que funcionen en cliente, aprovechando la modularidad y el contrato de E/S unico.
- Aceleracion en NPU: usar la division en etapas de ZoeDepth y SAM para ejecutar en NPUs con memoria limitada, evitando los picos de memoria que provoca el flip-augmentation en un solo grafo.
- Segmentacion interactiva en backend: reutilizar `sam_encoder.onnx` una vez por imagen y ejecutar `sam_decoder.onnx` multiples veces con distintos puntos, reduciendo el coste por consulta en herramientas de anotacion.
- Generacion de mapas de normales para renderizado o relighting: usar `midas.onnx` con `midas_postprocessor_normal.onnx` para obtener normales sin reejecutar inferencia, util en pipelines de vision 3D.
- Filtrado de profundidad en escenas: aplicar `filter_remove_background.onnx` o `filter_remove_near.onnx` sobre LeReS para aislar rangos de profundidad en tareas de composicion.

## Benchmarks y rendimiento

La model card reporta validacion frente a la implementacion original de controlnet_aux mediante pytest, con una coincidencia de pixeles superior al 97%, y aceleraciones de hasta 13x en CPU y 90x en NPU. No se publican resultados en benchmarks academicos estandar (MMLU, HumanEval, GSM8K y similares no aplican a modelos de vision de este tipo).

| Metrica | Resultado reportado |
|---|---|
| Coincidencia de pixeles vs controlnet_aux | > 97% |
| Aceleracion en CPU | hasta 13x |
| Aceleracion en NPU | hasta 90x |

No se han publicado resultados de benchmarks academicos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma desglosada por modelo; el repositorio completo ocupa 2,5 GB, por lo que la inferencia individual de cada ONNX es sustancialmente menor.
- GPU recomendadas: no especificadas por el autor; al ser modelos ONNX, funcionan en cualquier GPU con soporte de ONNX Runtime (CUDA, DirectML, ROCm).
- Consumer GPU: si, los modelos individuales son ligeros y caben en GPUs de consumo; SAM y ZoeDepth son los mas exigentes por su pipeline multi-etapa.
- Opciones de despliegue: ONNX Runtime (C#, C++, Rust, Python, web), con execution providers CUDA, DirectML, NPU y CPU.
- Latencia y throughput: el autor reporta hasta 13x en CPU y 90x en NPU frente a la implementacion Python, sin cifras absolutas de milisegundos por imagen.

## Comparativa con modelos similares

| Modelo | Formato | Portabilidad | Encapsula post-procesado | Licencia |
|---|---|---|---|---|
| Buuta/controlnet_aux_onnx | ONNX | Alta (C#, C++, Rust, web, NPU) | Si (filtros y augmentations en grafo) | other (pesos heredados) |
| lllyasviel/Annotators (original) | PyTorch | Baja (requiere Python/PyTorch) | No (logica en Python) | otras licencias por modelo |
| controlnet_aux (paquete Python) | PyTorch | Baja (Python) | Parcial (logica en Python) | Apache 2.0 en codigo |

La ventaja principal frente a las alternativas es la portabilidad y la encapsulacion del post-procesado; la desventaja es la dependencia de las licencias originales de cada peso, que pueden restringir el uso comercial segun el componente.

## Limitaciones y advertencias

- Licencia heterogenea: el codigo de conversion es Apache 2.0, pero cada ONNX conserva la licencia del modelo original (por ejemplo, algunos componentes de Annotators no son Apache 2.0), lo que puede impedir el uso comercial de partes del paquete.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria independiente.
- La validacion del 97% de coincidencia es frente a controlnet_aux, no frente a ground truth humano; puede haber diferencias perceptibles en casos limite.
- No hay informacion sobre cuantizacion ni sobre pesos reducidos, lo que limita el despliegue en dispositivos muy restringidos.
- Al ser modelos de vision, no soportan texto, razonamiento ni agentes; no deben evaluarse con benchmarks de lenguaje.
- Riesgo de deriva si los modelos originales de Annotators se actualizan y la conversion no se sincroniza.
- La fecha de creacion del repositorio (2026) y la ausencia de documentacion adicional impiden verificar mantenimiento a largo plazo.
- No se especifican sesgos; al ser modelos de vision heredan los sesgos de sus datasets de entrenamiento originales (no documentados en esta ficha).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Buuta/controlnet_aux_onnx
- Modelo base: https://huggingface.co/lllyasviel/Annotators
- Repositorio controlnet_aux (referencia de implementacion original): https://github.com/lllyasviel/ControlNet
- Repositorio ControlNet: https://github.com/lllyasviel/ControlNet
- ONNX Runtime: https://onnxruntime.ai/
