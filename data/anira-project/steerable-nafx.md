# anira-project/steerable-nafx

## Resumen

Steerable NAFX es un modelo de efectos de audio neuronales (neural audio effects) desarrollado originalmente por Christian Steinmetz y empaquetado por el proyecto anira para su uso con su motor de inferencia de audio en tiempo real. Se trata de una red convolucional temporal (TCN) que procesa senales de audio de forma streaming y permite controlar de forma continua el efecto aplicado mediante un parametro de "steerability", de ahi su nombre. No es un modelo de lenguaje: es un procesador de audio disenado para integrarse en cadenas de procesamiento de senales en tiempo real.

El modelo se distribuye en tres tamanos (completo, 3 bloques y 2 bloques) y en multiples formatos de exportacion: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch (con kernels CPU XNNPACK, Core ML para Apple y Vulkan para GPU) y Core ML nativo. Los pesos ocupan desde unos pocos kilobytes (6,4 KB para la variante de 2 bloques en ONNX) hasta 178 KB en la variante completa para Core ML, lo que lo hace extremadamente ligero y apto para dispositivos empotrados y moviles.

Su relevancia actual radica en que demuestra un flujo de trabajo completo de despliegue multiplataforma de un modelo de audio neuronal en tiempo real, con verificacion de consistencia entre formatos (desviaciones maximas del orden de 1e-07 frente a ONNX Runtime) y soporte para aceleracion por hardware en Apple y GPUs Vulkan. Es un modelo de referencia para el benchmark CNN del motor anira.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional temporal (TCN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesamiento streaming por tramas de audio) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en float32; el formato Core ML es float32) |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, TFLite (LiteRT), LibTorch (.pt), ExecuTorch (.pte), Core ML (.mlpackage) |

## Arquitectura y entrenamiento

El modelo es una red convolucional temporal (TCN) con conexiones residuales y estado recurrente implicito entre llamadas consecutivas, lo que permite procesar audio en streaming manteniendo coherencia temporal. La variante "steerable" anade un mecanismo de control continuo que modula el efecto aplicado sin necesidad de reentrenar el modelo. Se distribuyen tres profundidades: la version completa, una de 3 bloques y una de 2 bloques, con tamanos de fichero que van desde 6,4 KB hasta 178 KB segun formato y profundidad.

Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada. El modelo original procede del repositorio `csteinmetz1/steerable-nafx` y ha sido reexportado por el proyecto anira desde el fork `faressc/steerable-nafx` en el commit `e495467`, concretamente desde `models/model_0/`. La innovacion tecnica destacable es el pipeline de exportacion multi-backend con verificacion de equivalencia numerica: cada exportacion se compara contra ONNX Runtime sobre ocho llamadas consecutivas con realimentacion de estado, con desviaciones maximas entre 9,7e-08 y 2,1e-07 relativas al pico de salida.

## Capacidades

- Procesamiento de efectos de audio neuronales en tiempo real sobre senales de audio.
- Control continuo del efecto mediante parametro de steerability.
- Procesamiento streaming con realimentacion de estado entre llamadas consecutivas (verificado sobre doce llamadas consecutivas).
- Inferencia en CPU (XNNPACK, kernels portables), GPU (Vulkan) y aceleracion Apple (Core ML).
- Despliegue en multiples runtimes: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch y Core ML nativo.
- Tres tamanos de modelo para ajustar coste computacional y calidad.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues (no es un modelo de lenguaje).

## Casos de uso

- Procesamiento de audio en tiempo real en aplicaciones de musica: el modelo puede aplicarse como efecto insertable en una cadena de DAW o en un plugin de audio, aprovechando su naturaleza streaming y su baja latencia.
- Efectos de audio en dispositivos moviles: las variantes LiteRT/TFLite y Core ML permiten ejecutar el efecto en iOS y Android sin conexion, con ficheros de 12-138 KB.
- Procesamiento en GPUs integradas o dedicadas: la exportacion Vulkan de ExecuTorch permite acelerar la inferencia en GPUs no Apple, util en aplicaciones de escritorio multiplataforma.
- Prototipado de efectos de audio neuronales: el modelo sirve como referencia para validar pipelines de exportacion y comparar precision numerica entre backends.
- Benchmark de motores de inferencia de audio: es el modelo de referencia del benchmark CNN de anira, util para medir latencia y throughput de distintos runtimes.
- Educacion e investigacion en procesamiento de senales: su tamano reducido y su licencia Apache 2.0 facilitan su uso en cursos y experimentos de efectos neuronales.
- Integracion en sistemas empotrados: el tamano minimo de 6,4 KB (ONNX, 2 bloques) permite desplegarlo en microcontroladores o dispositivos con memoria muy limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de audio (MOS, PEAQ, etc.) en la informacion disponible. La unica metrica de rendimiento publicada es la desviacion numerica entre formatos respecto a ONNX Runtime:

| Formato | Ficheros | Desviacion maxima |
|---|---|---|
| ExecuTorch, XNNPACK (reexportado) | `executorch/{model}.pte` | 2,1e-07; 1,0e-07; 9,7e-08 |
| LiteRT, TensorFlow Lite (reexportado) | `litert/*.tflite` | 2,1e-07; 1,0e-07; 9,7e-08 |
| ExecuTorch, Core ML (Apple, float32) | `executorch/*_coreml.pte` | 2,0e-07; 9,7e-08; 1,1e-07 |
| ExecuTorch, Vulkan (GPUs) | `executorch/*_vulkan.pte` | exportado; no ejecutado (sin runtime Vulkan) |
| Core ML ML program (motor nativo de anira, v3; macOS 13, iOS 16) | `coreml/*.mlpackage` | 2,0e-07; 9,7e-08; 1,1e-07 |

## Requisitos de hardware

- VRAM estimada para inferencia: minimo, dado el tamano de los pesos (6,4 KB a 178 KB). Cabe holgadamente en cualquier GPU consumer y en memoria de dispositivos moviles.
- GPU recomendadas: cualquier GPU con soporte Vulkan para la variante ExecuTorch Vulkan; Apple Silicon o GPUs Apple para Core ML. No requiere GPUs de datacenter (A100, H100) para su despliegue tipico.
- Cabe en GPU consumer: si, en cualquier GPU consumer, e incluso en CPU y en dispositivos empotrados.
- Opciones de despliegue: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch (CPU XNNPACK, Core ML, Vulkan) y Core ML nativo. El motor anira lo integra como modelo de referencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Steerable NAFX (este modelo) | no disponible (pesos de 6-178 KB) | no aplica (streaming) | desviacion entre formatos ~1e-07 | Apache 2.0 | Hugging Face, GitHub |
| Otros modelos de efectos de audio neuronales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de modelos comparables en la informacion proporcionada. La comparativa con alternativas de la misma categoria (otros efectos de audio neuronales) no esta disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso. Cualquier uso en esos dominios es inaplicable.
- No se han publicado datos sobre sesgos, composicion del dataset de entrenamiento ni evaluacion subjetiva de calidad de audio.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero no hay informacion sobre el comportamiento del modelo ante senales de audio fuera de distribucion.
- Limitaciones de contexto o idioma: no aplica (modelo de audio); se desconoce su robustez ante tipos de senal no representados en el entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y la atribucion correspondiente.
- Caveat para produccion: la variante Vulkan de ExecuTorch se ha exportado pero no se ha ejecutado en el entorno de verificacion (sin runtime Vulkan), por lo que su equivalencia numerica no esta confirmada.
- El modelo depende del motor anira y de sus descripciones de modelo para las formas de entrada con eje temporal dinamico.

## Enlaces

- Hugging Face: https://huggingface.co/anira-project/steerable-nafx
- Repositorio fuente (fork): https://github.com/faressc/steerable-nafx
- Repositorio original: https://github.com/csteinmetz1/steerable-nafx
- Repositorio de modelos de anira: https://github.com/anira-project/models
- Herramienta de conversion ONNX a PyTorch: https://github.com/anira-project/models/blob/main/tools/export/onnx_to_torch.py
