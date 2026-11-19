# softandsweet/depth-anything-depth-anything-v2-small-hf-rngd-fxbx

## Resumen

Depth Anything V2 Small para Furiosa RNGD es una conversión del checkpoint `depth-anything/Depth-Anything-V2-Small-hf` de ByteDance a un paquete compilado para la NPU RNGD de Furiosa, publicada por el usuario `softandsweet`. No se trata de un modelo nuevo ni de un fine-tuning sobre datos adicionales: es una reimplementación del grafo de inferencia (atención, convoluciones y redimensionados bilineales) como multiplicaciones de matrices BF16 ejecutadas íntegramente en la NPU, sin fallbacks a CPU.

El modelo resuelve estimación de profundidad relativa monocular (monocular depth estimation) a partir de una única imagen RGB de 518×518 ya normalizada, devolviendo un mapa de profundidad de la misma resolución. Su relevancia es fundamentalmente de despliegue: el paquete original de esta conversión ejecutaba 246.669 lanzamientos de NPU por imagen y tardaba 55,9 s; la versión actual con el fichero fusionado reduce la latencia a 32 ms con 268 lanzamientos, manteniendo un error L2 relativo de 0,0041–0,0043 frente a la referencia en PyTorch CPU.

El repositorio es de 0,1 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y se publicó el 19 de noviembre de 2026. Está pensado para entornos con Furiosa Torch/TCC 2026.4.0, PyTorch 2.10.0+cpu y el SDK `fxbx` 0.9.2 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo base: Depth Anything V2 Small, transformer con encoder tipo DINOv2 y decoder de profundidad) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 518×518 píxeles) |
| Tipos de cuantizacion | BF16 (único formato soportado por el paquete compilado) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.fxbx` (paquete compilado para NPU RNGD) con ficheros `.fxbx.weights` y `.fxbx.merged`; referencia CPU en `expected-0000-000.safetensors` |

## Arquitectura y entrenamiento

El modelo base Depth Anything V2 Small es un estimador de profundidad monocular que combina un encoder de vision tipo DINOv2 con un decoder de profundidad ligero; el detalle exacto de capas, dimensiones y datos de entrenamiento no se incluye en la informacion proporcionada. Esta publicacion concreta no reentrena el modelo: parte del checkpoint original de `depth-anything/Depth-Anything-V2-Small-hf` (commit `5426e4f0f36572d16453bbda7a8389317b1bef99`) y lo recompila para la NPU RNGD.

La innovacion tecnica de esta ficha es la compilacion: atención, convoluciones y resizes bilineales se traducen a multiplicaciones de matrices BF16 ejecutadas en la NPU, sin operaciones en CPU. El paquete incluye un fichero fusionado (`.fxbx.merged`) con 108 grupos fusionados y 26 pasos individuales; el ancho de fusion de cada bloque se eligio midiendo en la NPU. La fusion solo se aplica si coinciden el hash del plan, la version de Furiosa Torch, la version de TCC y el dataflow; en caso contrario, `fxbx` recurre a la ejecucion paso a paso. Se verifico en la NPU que ningun grupo sobrescribe sus entradas (0 casos).

## Capacidades

- Estimacion de profundidad relativa monocular a partir de una imagen RGB normalizada de 518×518 (`[1,3,518,518]`, BF16).
- Salida de mapa de profundidad con forma `[1,518,518]` (`predicted_depth`).
- Inferencia completa en NPU RNGD: atención, convoluciones y redimensionados bilineales como multiplicaciones de matrices BF16, sin fallbacks a CPU.
- Verificacion de precision contra referencia CPU PyTorch mediante error L2 relativo (criterio de aceptacion ≤ 1e-2).
- Ejecucion por CLI con `fxbx run ./depth-anything-v2-small-bf16.fxbx --sample -o result.safetensors`.
- No soporta tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje: es un modelo puramente de vision.
- No dispone de modo thinking, vision multimodal ni audio.

## Casos de uso

- Despliegue en hardware Furiosa RNGD: el paquete permite ejecutar estimacion de profundidad en la NPU con 32 ms por imagen y 268 lanzamientos, adecuado para entornos que ya operan con el SDK Furiosa Torch/TCC 2026.4.0 y quieren evitar dependencias de GPU.
- Validacion de pipelines de compilacion: `run.py` compara la salida con `expected-0000-000.safetensors` y aplica un criterio de error L2 relativo ≤ 1e-2, lo que sirve como test de regresion al actualizar versiones de Furiosa Torch o TCC.
- Procesamiento de profundidad en lote sobre imagenes prenormalizadas: con 32 ms por imagen y una sola RNGD, el modelo es viable para lotes moderados de imagenes de 518×518 en tareas de reconstruccion 3D, segmentacion por profundidad o generacion de mapas de disparidad.
- Integracion en pipelines de vision por computador existentes: al mantener la interfaz del modelo base (entrada `[1,3,518,518]`, salida `[1,518,518]`), se puede sustituir la inferencia en PyTorch CPU por la NPU sin cambiar el preprocesado.
- Pruebas de rendimiento y benchmarking de hardware: las tablas de latencia y numero de lanzamientos del paquete permiten comparar la ruta vectorial FP32 anterior (55,9 s, 246.669 lanzamientos) con la ruta BF16 fusionada (32 ms, 268 lanzamientos) en la misma RNGD.
- Evaluacion de precision de compiladores para NPU: el error L2 relativo de 0,0041–0,0043 frente a la referencia CPU es un indicador concreto para decidir si la conversion es aceptable en una aplicacion dada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo por peticion, paquete anterior (ruta vectorial FP32) | 55,9 s |
| Lanzamientos de NPU, paquete anterior | 246.669 |
| Tiempo por peticion, paquete actual paso a paso | 63 ms |
| Lanzamientos de NPU, paquete actual paso a paso | 1.404 |
| Tiempo por peticion, paquete actual con `.fxbx.merged` | 32 ms |
| Lanzamientos de NPU, paquete actual con `.fxbx.merged` | 268 |
| Error L2 relativo frente a referencia CPU | 0,0041–0,0043 |
| Criterio de aceptacion | error L2 relativo ≤ 1e-2 |
| Resultado de `fxbx run ... --sample` en servidor RNGD | rel_l2 0,0043 |

No se han publicado resultados de benchmarks de calidad de profundidad (AbsRel, RMSE, delta) en la informacion disponible.

## Requisitos de hardware

- NPU Furiosa RNGD (una unidad para las cifras de latencia publicadas).
- SDK con Furiosa Torch/TCC 2026.4.0 y PyTorch 2.10.0+cpu.
- Paquete `fxbx[weights]>=0.9.2`.
- No se indica VRAM ni memoria de dispositivo requerida; el repositorio ocupa 0,1 GB.
- No cabe en GPU consumer: el paquete `.fxbx` esta compilado para NPU RNGD, no para CUDA ni ROCm.
- Opciones de despliegue: CLI `fxbx run` o el script `run.py` incluido; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia: 32 ms por imagen con el fichero fusionado; 63 ms en ejecucion paso a paso. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (Depth Anything V2 Small para RNGD) | no disponible | imagen 518×518 | `.fxbx` (NPU RNGD) | Apache-2.0 | Hugging Face, 0 descargas |
| depth-anything/Depth-Anything-V2-Small-hf | no disponible | imagen 518×518 | safetensors (PyTorch) | Apache-2.0 | Hugging Face (modelo base) |
| Depth Anything V2 (otras variantes del mismo autor) | no disponible | no disponible | safetensors | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de calidad ni de modelos comparables adicionales en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo puramente de vision: no procesa texto, no soporta tool calling ni agentes; no debe evaluarse como modelo de lenguaje.
- Entrada fija: una imagen RGB de 518×518 ya normalizada en BF16; no se documenta soporte para otras resoluciones ni para lotes mayores que 1.
- Solo BF16: no se ofrecen variantes cuantizadas (INT8, FP16, GGUF) en el repositorio.
- Dependencia estricta de versiones: Furiosa Torch/TCC 2026.4.0, PyTorch 2.10.0+cpu y `fxbx>=0.9.2`; la ruta fusionada solo se activa si coinciden hash del plan, versiones y dataflow, y en caso contrario se degrada a ejecucion paso a paso (63 ms frente a 32 ms).
- Sin fallbacks a CPU: el paquete no puede ejecutarse en hardware sin NPU RNGD.
- La profundidad es relativa, no metrica; no se documenta calibracion absoluta.
- No se han publicado evaluaciones de sesgo, robustez ni alucinacion geometrica para esta conversion.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria independiente.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; conviene verificar los terminos del checkpoint original enlazado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/softandsweet/depth-anything-depth-anything-v2-small-hf-rngd-fxbx
- Modelo base: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Commit del checkpoint original: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf/tree/5426e4f0f36572d16453bbda7a8389317b1bef99
