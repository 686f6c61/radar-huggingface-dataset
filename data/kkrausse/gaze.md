# kkrausse/gaze

## Resumen

`kkrausse/gaze` es un modelo de estimación de mirada (gaze estimation) diseñado para funcionar con una webcam convencional y ejecutarse íntegramente en el navegador mediante `onnxruntime-web`, con soporte para WebGPU y WASM. A partir de un fotograma de webcam y tras un proceso de calibración de 9 puntos, el modelo predice en qué zona de la pantalla está mirando el usuario. Lo desarrolla el usuario independiente kkrausse y se publica bajo la licencia Sapiens2 de Meta.

Técnicamente, el modelo parte del backbone congelado de Meta Sapiens2 en su variante de 0,4 mil millones de parámetros y añade un mecanismo de cross-attention entrenado específicamente para atender a los fotogramas de calibración. La inferencia se divide en dos grafos ONNX: uno que se ejecuta una vez por calibración para extraer claves y valores de los fotogramas de referencia (`kv.onnx`) y otro que se ejecuta por fotograma (`xattn.onnx`). Los pesos se distribuyen en fp16, con variantes fp32 disponibles.

Su relevancia radica en que propone eye-tracking basado en webcam sin dependencia de servidores ni de hardware especializado, ejecutable en el propio navegador del usuario. El checkpoint publicado corresponde al paso 2000 de entrenamiento (etiqueta `m69`) y el autor advierte de que será sustituido por una versión mejor entrenada. No se han publicado todavía métricas sobre conjuntos de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Sapiens2 (congelado) con cross-attention entrenada a los fotogramas de calibración |
| Parametros totales | 0,4 mil millones (backbone base; el total del modelo compuesto no se detalla) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de imagen por fotograma) |
| Tipos de cuantizacion | fp16 (principal) y fp32 (variantes `xattn.fp32.onnx` y `kv.fp32.onnx`) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Sapiens2 License (Meta); el código del repositorio GitHub es MIT |
| Formato de pesos | ONNX (`xattn.onnx` + `xattn.onnx.data`, `kv.onnx`, `model.json`) |

## Arquitectura y entrenamiento

El modelo reutiliza el backbone de Meta Sapiens2 en su checkpoint de preentrenamiento de 0,4B, que se mantiene congelado durante el ajuste. Sobre esa representación visual se entrena una capa de cross-attention que toma como referencia las claves y valores extraídos de los fotogramas capturados durante la calibración de 9 puntos. Este diseño separa el coste computacional: el grafo `kv.onnx` se ejecuta una sola vez por sesión de calibración para calcular las claves y valores de los fotogramas de referencia, mientras que `xattn.onnx` procesa cada fotograma nuevo en tiempo real.

El autor indica explícitamente que el modelo no se ha entrenado con los conjuntos MPIIFaceGaze, UT Multiview ni EVE por sus restricciones no comerciales, y ofrece una variante separada (`kkrausse/gaze-nc`) para quien necesite esos datos, limitada a uso no comercial. No se detalla en la información disponible el volumen de tokens o imágenes de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente a este tipo de tarea). El checkpoint publicado corresponde al paso 2000 de entrenamiento.

## Capacidades

- Estimación de mirada sobre pantalla a partir de fotogramas de webcam convencional.
- Calibración interactiva de 9 puntos para adaptar la predicción a cada usuario y disposición física.
- Inferencia en el navegador mediante `onnxruntime-web` con backend WebGPU o WASM.
- Ejecución local en el dispositivo del usuario, sin envío de imágenes a servidores externos.
- Procesamiento por fotograma con un grafo ligero (`xattn.onnx`) y un grafo de calibración ejecutado una sola vez (`kv.onnx`).
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Eye-tracking en aplicaciones web: integrar el modelo en una página con `onnxruntime-web` para mover el cursor o seleccionar elementos mediante la mirada, sin instalar software nativo ni enviar vídeo a un servidor.
- Estudios de atención y usabilidad: medir zonas de la pantalla observadas por usuarios durante pruebas de interfaz, aprovechando que la inferencia ocurre en local y reduce problemas de privacidad en la captura de vídeo.
- Accesibilidad para personas con movilidad reducida: control de interfaces mediante la mirada tras la calibración de 9 puntos, ejecutándose en el navegador del propio usuario.
- Analítica de atención en entornos educativos o de formación online: detectar si el alumno mantiene la mirada en la pantalla durante una sesión, con procesamiento en el cliente.
- Prototipado rápido de investigación en interacción persona-ordenador: el formato ONNX y el `model.json` con el diseño de ventanas y bins facilitan montar demos sin infraestructura de GPU dedicada.
- Aplicaciones de señalización visual en videollamadas o presentaciones: resaltar la zona de la pantalla que el usuario está mirando, con latencia baja al ejecutarse en WebGPU.
- Alternativa comercial a datasets restringidos: al no entrenarse con MPIIFaceGaze, UT Multiview ni EVE, el checkpoint principal está pensado para escenarios donde esas licencias no son viables (la variante `gaze-nc` cubre el caso no comercial).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las puntuaciones sobre conjuntos de validación ("held-out scores") están pendientes de publicación.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,9 GB e incluye pesos fp16 y fp32, por lo que la inferencia fp16 requiere del orden de varios cientos de MB a ~1 GB según el grafo cargado.
- GPU recomendadas: no se especifican. El modelo está pensado para ejecutarse en el navegador con WebGPU, lo que incluye GPUs integradas y dedicadas de consumo.
- Compatibilidad con GPU de consumo: sí, por diseño; el backend WASM permite ejecución en CPU cuando no hay WebGPU disponible.
- Opciones de despliegue: `onnxruntime-web` (WebGPU o WASM) en navegador; los ficheros ONNX también pueden ejecutarse con ONNX Runtime nativo u otros runtimes compatibles con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| kkrausse/gaze | 0,4B (backbone) | Imagen por fotograma | Sapiens2 License | ONNX, navegador (WebGPU/WASM) | Calibración de 9 puntos; sin métricas publicadas |
| kkrausse/gaze-nc | 0,4B (backbone) | Imagen por fotograma | No comercial | ONNX | Variante entrenada con MPIIFaceGaze, UT Multiview y EVE |
| Meta Sapiens2 (pretrain 0.4B) | 0,4B | Imagen | Sapiens2 License | Pesos originales | Backbone base; no es un modelo de gaze estimation por sí mismo |

No se dispone de datos de benchmarks para establecer una comparación cuantitativa con otras soluciones de gaze estimation basadas en webcam.

## Limitaciones y advertencias

- El checkpoint publicado (`m69`, paso 2000) es una versión intermedia que el autor sustituirá por una mejor entrenada; no debe considerarse estable para producción.
- No hay métricas de error de estimación (por ejemplo, error angular en grados) publicadas, lo que impide evaluar su precisión frente a alternativas.
- Requiere una calibración de 9 puntos por usuario y configuración; el rendimiento fuera de esa calibración no está documentado.
- La licencia Sapiens2 permite uso comercial bajo sus términos, pero incluye restricciones sobre controles de comercio, usos prohibidos y legislación de privacidad y datos biométricos; la estimación de mirada puede considerarse dato biométrico en algunas jurisdicciones.
- El código del repositorio GitHub es MIT, pero los pesos no; conviene revisar `LICENSE.md` antes de redistribuir.
- Riesgo de sesgo y de generalización limitada: no se documentan la demografía, las condiciones de iluminación ni la diversidad de dispositivos del conjunto de entrenamiento.
- La ejecución en navegador depende de la disponibilidad de WebGPU; en su ausencia, el backend WASM puede ofrecer latencias mayores (no cuantificadas).
- No se especifican idiomas ni capacidades lingüísticas porque el modelo es puramente visual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkrausse/gaze
- Variante no comercial: https://huggingface.co/kkrausse/gaze-nc
- Código y demo en navegador: https://github.com/kkrausse/gaze
- Sapiens2 (Meta): https://github.com/facebookresearch/sapiens2
- Licencia Sapiens2: `LICENSE.md` en el repositorio del modelo
