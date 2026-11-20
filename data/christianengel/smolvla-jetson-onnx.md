# christianengel/smolvla-jetson-onnx

## Resumen

SmolVLA Jetson ONNX es una exportación estática a ONNX del modelo visión-lenguaje-acción (VLA) `lerobot/smolvla_base`, publicada por christianengel. El modelo original, desarrollado por Hugging Face en el marco del proyecto LeRobot, resuelve el problema de generar acciones motoras de robot a partir de observaciones visuales (tres cámaras a 512x512) e instrucciones en lenguaje natural. Esta variante concreta no entrena pesos nuevos: convierte el modelo base en grafos ONNX optimizados para inferencia sin PyTorch, con un runtime de I/O binding de copia cero orientado a dispositivos NVIDIA Jetson y GPUs CUDA.

La relevancia de esta ficha reside en el salto de rendimiento medido: la variante FP16 alcanza 78,17 ms de latencia media (639,6 acciones/s) en una RTX 3090, frente a 243,05 ms en PyTorch FP32 CUDA, lo que supone 3,11x de aceleración y una reducción de memoria RSS de entre 3,12 y 3,86 GB. La fidelidad numérica se mantiene con una similitud coseno de 0,999983 en las acciones de 10 pasos frente a la referencia FP32.

El paquete se distribuye en tres variantes (FP16, INT8 W8A32 y FP32) con manifiestos ONNX independientes, licencia Apache-2.0 y un repositorio asociado en GitHub con el harness de pruebas. Está pensado para despliegue en robótica de borde, donde el presupuesto de latencia y memoria es crítico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) exportado a ONNX estático; modelo base SmolVLA con subgrafos de visión, prefijo y experto de difusión (Euler) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16, INT8 (W8A32, MatMulNBits), FP32 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (manifiestos `onnx_manifest.json` por variante) |

## Arquitectura y entrenamiento

Esta publicación no entrena un modelo nuevo: exporta el modelo base `lerobot/smolvla_base` (commit `5e8d12a6`) a grafos ONNX estáticos con lotes fijos de B=1, tres cámaras a 512x512 y 10 pasos de integración Euler. La arquitectura subyacente es un VLA de SmolVLA que se descompone en tres subgrafos exportables: un codificador de visión que produce `vision_image_embeddings`, un prefijo que genera `prefix_past_keys` y `prefix_past_values` (caché de atención), y un experto de difusión que ejecuta los 10 pasos Euler y emite el tensor `actions_10step`. Cada subgrafo tiene su propia paridad numérica verificada frente a la referencia PyTorch FP32.

La innovación técnica principal es el runtime de I/O binding de copia cero (`SmolVLAOnnxRunner`), que elimina copias intermedias entre host y dispositivo y permite ejecutar el pipeline completo sin PyTorch. Se documentan además los umbrales de aceptación numérica por variante: FP32 exige MaxAbsErr < 1e-4 y coseno >= 0,99999; FP16 coseno >= 0,999; INT8 coseno >= 0,995. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens ni si hubo RLHF o DPO en esta información.

## Capacidades

- Generación de acciones motoras de robot a partir de observaciones visuales de tres cámaras (512x512) e instrucciones en lenguaje natural.
- Control de manipulación robótica mediante chunks de acción generados con integración Euler de 10 pasos.
- Inferencia libre de PyTorch: el runner `SmolVLAOnnxRunner` ejecuta todo el pipeline sobre ONNX Runtime.
- Soporte de ejecución en CUDA (RTX 3090 validada) y CPU, con variantes específicas para cada backend.
- Optimización para TensorRT: la variante FP32 sirve como entrada para `trtexec --fp16`.
- Despliegue en dispositivos de borde NVIDIA Jetson (estimaciones para Orin Nano 8 GB).
- Idioma de instrucciones: inglés (`en`).
- No se documentan en esta información capacidades de tool calling, agentes multi-paso, visión general, audio ni modo thinking; el modelo es específico de robótica.

## Casos de uso

- Manipulación robótica de borde en Jetson Orin Nano: la variante FP16 (751,57 MB en disco, estimación de memoria total de 1.849,57 MB) cabe en los 8 GB de LPDDR5 del dispositivo dejando margen para el sistema operativo y las cámaras, lo que permite ejecutar políticas VLA a bordo sin GPU de servidor.
- Control de robots en lazo cerrado de alta frecuencia: con 78,17 ms por chunk de 10 acciones (12,79 chunks/s), el modelo puede refrescar la política a más de 12 Hz, adecuado para tareas de pick-and-place que requieren reactividad.
- Investigación en robótica con presupuesto de memoria limitado: la variante INT8 W8A32 (538,52 MB en disco, 1.634,02 MB estimados en Jetson) permite experimentar en CPU o CUDA con una fidelidad de coseno de 0,999727 (CUDA) y 0,999268 (CPU) frente a FP32.
- Validación de paridad numérica en pipelines de despliegue: los manifiestos y el harness del repositorio GitHub permiten comparar subgrafo a subgrafo contra PyTorch FP32 antes de promover una política a producción.
- Aceleración de inferencia en GPUs de consumo: en una RTX 3090 la variante FP16 sin PyTorch alcanza 639,6 acciones/s, útil para entrenamiento por imitación con evaluación masiva de políticas o generación de datasets sintéticos de acciones.
- Exportación a TensorRT para despliegue embebido: la variante FP32 (1.501,61 MB) está pensada como entrada para `trtexec --fp16`, lo que permite generar motores TensorRT específicos para la GPU objetivo.
- Sustitución de stacks PyTorch en producción robótica: al eliminar la dependencia de PyTorch, el runtime reduce el RSS pico a 1.730,90 MB en FP16 iobind frente a 4.848,49 MB en PyTorch FP32, simplificando el empaquetado de contenedores.

## Benchmarks y rendimiento

Host de referencia: Ryzen 9 5950X + RTX 3090. Harness: 8 lotes (seeds 11, 23, 37, 41, 53, 111, 123, 137), B=1, 10 pasos Euler.

| Backend / variante | Media (ms) | p95 (ms) | Chunks/s | Acciones/s | RSS pico (MB) | Disco (MB) |
|---|---:|---:|---:|---:|---:|---:|
| PyTorch FP32 CUDA | 243,05 | 251,23 | 4,11 | 205,7 | 4.848,49 | 864,71 |
| PyTorch BF16 CUDA | 199,41 | 204,54 | 5,02 | 250,8 | 5.590,92 | 864,71 |
| PyTorch FP32 CPU | 1.979,85 | 2.021,18 | 0,51 | 25,3 | 5.947,50 | 864,71 |
| ONNX FP32 CUDA iobind | 132,92 | 155,82 | 7,52 | 376,2 | 1.655,88 | 1.501,61 |
| ONNX FP16 CUDA iobind | 79,85 | 81,86 | 12,52 | 626,2 | 1.730,90 | 751,57 |
| **Runner FP16 CUDA (sin PyTorch)** | **78,17** | **79,73** | **12,79** | **639,6** | — | **751,57** |
| ONNX INT8 CUDA iobind (W8A32) | 102,79 | 105,37 | 9,73 | 486,4 | 1.513,15 | 538,52 |
| ONNX INT8 CPU (W8A32) | 2.689,45 | 3.121,58 | 0,37 | 18,6 | 2.126,59 | 538,52 |
| ONNX FP32 CPU | 3.790,80 | 4.382,89 | 0,26 | 13,2 | 3.184,72 | 1.501,61 |

Paridad numérica frente a PyTorch FP32 (subgrafo `actions_10step`): coseno 0,999983 (FP16 runner), 0,999975 (PyTorch BF16), 1,000000 (ONNX FP32), 0,999727 en CUDA y 0,999268 en CPU (INT8). El runner FP16 sin PyTorch mide 77,10 ms en cómputo puro, excluyendo 1,024 ms de H2D y 0,047 ms de D2H. No se han publicado resultados de benchmarks de tareas VLA (éxito en manipulación, MMLU, HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM estimada en GPU: 2.126 MB asignados en ONNX FP16 CUDA (2.344 MB con iobind); 2.882 MB en FP32 CUDA (3.138 MB con iobind); 2.334 MB en INT8 CUDA.
- Memoria total estimada en Jetson: 1.849,57 MB (FP16), 1.634,02 MB (INT8), 2.798,11 MB (FP32), todas por debajo de los 6.144 MB de margen sobre 8.192 MB de LPDDR5 del Orin Nano 8 GB.
- GPU validadas: RTX 3090 (24 GB). No se documentan pruebas en A100, H100 ni RTX 4090, aunque por huella de memoria (<3,2 GB) deberían ser compatibles.
- GPU de consumo: cabe holgadamente en cualquier GPU con 4 GB o más de VRAM; la RTX 3090 es la única medida.
- Despliegue: ONNX Runtime (CUDA y CPU), runner `SmolVLAOnnxRunner` del repositorio GitHub, y generación de motores TensorRT vía `trtexec --fp16` a partir de la variante FP32.
- Latencia: 78,17 ms por chunk de 10 acciones en RTX 3090 (FP16, sin PyTorch); 2.689,45 ms en CPU con INT8 (18,6 acciones/s).
- Throughput: hasta 639,6 acciones/s en GPU y 18,6 acciones/s en CPU (INT8).

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Contexto | Latencia medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SmolVLA Jetson ONNX (esta ficha) | ONNX FP16/INT8/FP32 | no disponible | no disponible | 78,17 ms (RTX 3090, FP16) | Apache-2.0 | Hugging Face + GitHub |
| `lerobot/smolvla_base` (PyTorch) | PyTorch | no disponible | no disponible | 243,05 ms (RTX 3090, FP32) | Apache-2.0 | Hugging Face |
| PyTorch BF16 del modelo base | PyTorch | no disponible | no disponible | 199,41 ms (RTX 3090) | Apache-2.0 | Hugging Face |

La comparativa se limita al propio modelo base y sus configuraciones de precisión, ya que la información proporcionada no incluye otros modelos VLA comparables (por ejemplo, OpenVLA, π0 o RT-2) con datos medidos en el mismo harness. No disponible para alternativas externas.

## Limitaciones y advertencias

- Modelo específico de robótica: no es un LLM general; no sirve para generación de texto, código ni razonamiento lingüístico.
- Idioma de instrucciones limitado al inglés (`en`); no se documenta soporte multilingüe.
- Exportación estática con formas fijas: B=1, 3 cámaras a 512x512 y 10 pasos Euler. Cambiar el número de cámaras, la resolución o los pasos requiere reexportar.
- Solo se ha validado en una RTX 3090 y con estimaciones para Jetson Orin Nano 8 GB; el rendimiento en otras GPU no está medido.
- Las cifras de memoria de Jetson son estimaciones, no medidas en dispositivo real.
- La cuantización INT8 introduce degradación numérica (coseno 0,999268 en CPU frente a 0,999983 en FP16); evaluar el impacto en la política antes de usarla en producción.
- Riesgo de alucinación y sesgos del modelo base no documentados en esta información; al ser una política de acciones, el fallo se manifiesta como acciones incorrectas, no como texto inventado.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base `lerobot/smolvla_base` y de los datasets originales.
- Repositorio con 0 descargas y 1 like en el momento de la ficha: ecosistema de validación muy reducido, sin garantías de mantenimiento.
- No se documentan resultados de éxito en tareas de manipulación (tasa de acierto), solo latencia y paridad numérica.

## Enlaces

- Hugging Face: https://huggingface.co/christianengel/smolvla-jetson-onnx
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Commit del modelo base: https://huggingface.co/lerobot/smolvla_base/tree/5e8d12a6e2975b0e5e5fce7c8caf47c371d257b6
- Repositorio de código y harness: https://github.com/protortyp/smolvla-jetson-onnx
- Manifiesto FP16: https://huggingface.co/christianengel/smolvla-jetson-onnx/blob/main/fp16/onnx_manifest.json
- Manifiesto INT8: https://huggingface.co/christianengel/smolvla-jetson-onnx/blob/main/int8/onnx_manifest.json
- Manifiesto FP32: https://huggingface.co/christianengel/smolvla-jetson-onnx/blob/main/fp32/onnx_manifest.json
- Paper de referencia (arXiv:2506.01844): https://arxiv.org/abs/2506.01844
