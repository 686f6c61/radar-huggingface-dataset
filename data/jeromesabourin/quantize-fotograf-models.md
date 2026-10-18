# jeromesabourin/quantize-fotograf-models

## Resumen

`jeromesabourin/quantize-fotograf-models` no es un modelo único, sino un paquete de cuatro grafos ONNX de restauración de imagen que el autor publica como dependencia de la función «Améliorer l'image» de su herramienta Quantize Fotograf. Los pesos proceden de tres proyectos de investigación distintos (Restormer, HAT y OSEDiff) y se han convertido a ONNX con entradas de tamaño fijo en formato RGB 0..1 y disposición NCHW. El repositorio ocupa 2,2 GB y no registra descargas ni valoraciones en el momento de la consulta.

El interés del paquete es práctico: empaqueta en un único artefacto tareas de deblurring (desenfoque de movimiento y de foco), superresolución real x4 y restauración generativa one-step, todo ejecutable con ONNX Runtime en CPU, CUDA o DirectML, lo que permite integrar restauración de fotografía en aplicaciones de escritorio sin depender de PyTorch. Frente a los repositorios originales, la aportación es la conversión y el empaquetado, no el entrenamiento.

La contrapartida es la ausencia casi total de documentación técnica: no se declaran parámetros, datos de entrenamiento, métricas ni rendimiento, y las licencias son heterogéneas (MIT, Apache-2.0 y CreativeML OpenRAIL++-M), con las restricciones de uso de esta última aplicándose al componente derivado de Stable Diffusion 2.1. Cualquier evaluación seria exige medir los grafos por cuenta propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cuatro grafos independientes: Restormer (transformer para restauración de alta resolución) x2, HAT (Hybrid Attention Transformer) x1, OSEDiff sobre Stable Diffusion 2.1 (VAE + UNet + VAE decoder en un solo grafo) x1 |
| Parametros totales | no disponible (no se declara el recuento de ninguno de los cuatro grafos) |
| Parametros activos | no aplica (no son modelos MoE) |
| Longitud de contexto | no aplica; entradas de imagen de tamaño fijo (ver tabla de componentes) |
| Tipos de cuantizacion | ONNX; `osediff_x1_512_fp16.onnx` en fp16, el resto sin precisión declarada en la model card; no se documenta cuantización int8 |
| Idiomas soportados | no disponible; los modelos de restauración no procesan texto y OSEDiff se ejecuta con prompt vacío |
| Licencia | `other`: MIT (Restormer), Apache-2.0 (HAT), Apache-2.0 + CreativeML OpenRAIL++-M (OSEDiff) |
| Formato de pesos | ONNX (entrada fija NCHW, RGB 0..1) |

Componentes del repositorio:

| Fichero | Origen | Licencia | Entrada | Salida |
|---|---|---|---|---|
| `restormer_motion_deblur_512.onnx` | Restormer, desenfoque de movimiento | MIT | 1x3x512x512 | 1x3x512x512 |
| `restormer_defocus_deblur_512.onnx` | Restormer, desenfoque de foco | MIT | 1x3x512x512 | 1x3x512x512 |
| `real_hat_gan_x4_256.onnx` | HAT, Real_HAT_GAN_SRx4 | Apache-2.0 | 1x3x256x256 | 1x3x1024x1024 (x4) |
| `osediff_x1_512_fp16.onnx` | OSEDiff sobre SD 2.1 base, LoRA fusionadas, prompt vacío | Apache-2.0 + CreativeML OpenRAIL++-M | 1x3x512x512 | 1x3x512x512 |

## Arquitectura y entrenamiento

Los cuatro grafos provienen de proyectos upstream y conservan su arquitectura original; este repositorio solo realiza la exportación a ONNX. Los dos modelos de Restormer son transformers con atención por canales pensados para restauración a alta resolución, entrenados por sus autores para dos degradaciones concretas: desenfoque de movimiento y desenfoque de foco (*defocus*). El modelo de HAT es un transformer de atención híbrida en su variante GAN de superresolución real x4, que toma parches de 256x256 y devuelve 1024x1024. OSEDiff es un esquema de difusión de un solo paso que reutiliza Stable Diffusion 2.1 base: el grafo empaqueta el codificador VAE, la UNet evaluada en t = 999 y el decodificador VAE en una única pasada imagen a imagen con prompt vacío y precisión fp16, con las LoRA ya fusionadas en los pesos.

No se aporta ninguna información sobre datos de entrenamiento (número de tokens o imágenes, composición del dataset, uso de RLHF/DPO) ni sobre el proceso de conversión: no se indica la versión de ONNX opset, si hubo simplificación de grafo, plegado de constantes o calibración de cuantización. Tampoco se documenta si los grafos se validaron numéricamente contra los pesos originales en PyTorch. La única nota técnica operativa es que, con el ejecution provider DirectML, debe desactivarse la fusión de grafo (`ep.dml.disable_graph_fusion = 1`), lo que sugiere problemas de compatibilidad del grafo de OSEDiff con las optimizaciones de DirectML.

## Capacidades

- Restauración de desenfoque de movimiento en fotografías (imágenes de 512x512, salida a la misma resolución).
- Restauración de desenfoque de foco / *defocus blur* (512x512, misma resolución).
- Superresolución real x4 con un modelo GAN (entrada 256x256, salida 1024x1024), orientada a fotografía real con degradaciones desconocidas.
- Restauración generativa imagen a imagen de un solo paso (OSEDiff), que sintetiza detalle plausible en lugar de limitarse a interpolar.
- Ejecución sin marco de deep learning: los grafos son autocontenidos y se ejecutan con ONNX Runtime.
- Aceleración por hardware vía CUDA, DirectML, CoreML o CPU, según el *execution provider* disponible.
- Procesamiento por lotes mediante bucle externo; los modelos no gestionan lotes dinámicos por sí mismos.
- No soporta *tool calling*, agentes, razonamiento multi-paso, ni procesamiento de texto, audio o vídeo.
- No hay control por prompt: OSEDiff se exportó con invitación vacía y LoRA fusionadas, por lo que no admite *prompting* ni *guidance* ajustable en tiempo de inferencia.

## Casos de uso

- Restauración de fotografía analógica digitalizada: aplicar `restormer_defocus_deblur_512.onnx` a escaneos con falta de foco, recortando la imagen en ventanas de 512x512 con solapamiento para evitar costuras.
- Fotografía deportiva o de fauna con trepidación: el grafo de desenfoque de movimiento está entrenado específicamente para este tipo de degradación y permite recuperar tomas descartadas sin intervención manual.
- Recuperación de detalle en recortes: usar `real_hat_gan_x4_256.onnx` sobre parches de 256x256 para cuadruplicar la resolución de una zona concreta antes de imprimir o publicar.
- Aplicación de escritorio offline: los cuatro ONNX se pueden distribuir con la aplicación y ejecutar con DirectML o CoreML, sin servicio en la nube ni envío de imágenes del usuario a terceros.
- Preprocesado de datasets de visión: normalizar nitidez y resolución de un corpus de imágenes antes de entrenar o evaluar otros modelos, aplicando los grafos en un pipeline por lotes.
- Mejora de miniaturas y catálogos de e-commerce: pipeline en dos etapas (deblurring Restormer y después upscaling HAT x4) para generar imágenes de ficha de producto a partir de originales de baja calidad.
- Restauración generativa de imágenes antiguas o dañadas: OSEDiff reconstruye texturas verosímiles en un solo paso, lo que reduce el coste frente a pipelines de difusión multi-paso.
- Integración en herramientas de retoque como paso previo: el resultado de los cuatro modelos puede servir como capa base que el retocador corrige después en Photoshop o GIMP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye PSNR, SSIM, LPIPS, ni comparaciones con los pesos originales de Restormer, HAT u OSEDiff, ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia a partir del tamaño de los grafos, no publicada por el autor): 2-4 GB para los dos modelos de Restormer en 512x512; 2-4 GB para HAT x4 en 256x256 con salida 1024x1024; 6-8 GB para OSEDiff en fp16 a 512x512, al incluir VAE, UNet de SD 2.1 y decodificador en un único grafo. Son cifras orientativas que deben verificarse con `onnxruntime` y el *provider* concreto.
- GPU recomendadas: cualquier GPU con 8 GB o más cubre los cuatro grafos; para lotes o resoluciones mayores conviene una RTX 4090, L4, A10G o A100/H100. Los modelos de Restormer y HAT son lo bastante pequeños para GPUs de gama media.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas de 6-8 GB (RTX 3060, RTX 4060, RTX 2070 y superiores) para los cuatro componentes; los dos Restormer y HAT deberían funcionar incluso en GPUs de 4 GB.
- Despliegue: ONNX Runtime (CPU, CUDA, DirectML, CoreML, OpenVINO), conversión adicional a TensorRT o a formato optimizado para el *runtime* objetivo. No aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de modelos de lenguaje.
- Particularidad operativa: con DirectML hay que desactivar la fusión de grafo (`ep.dml.disable_graph_fusion = 1`).
- Latencia y throughput: no disponibles. Como referencia cualitativa, OSEDiff al ser un esquema de un solo paso es sensiblemente más rápido que una difusión multi-paso, pero no se aportan milisegundos por imagen.

## Comparativa con modelos similares

| Modelo | Tarea | Formato de distribucion | Licencia | Parametros | Entrada |
|---|---|---|---|---|---|
| Este paquete (Restormer deblur) | Deblurring 512x512 | ONNX | MIT | no disponible | 1x3x512x512 fija |
| Restormer original (swz30/Restormer) | Deblurring, denoising, deraining | PyTorch | MIT | no disponible en la informacion | dinamica |
| Este paquete (Real_HAT_GAN_SRx4) | Superresolucion real x4 | ONNX | Apache-2.0 | no disponible | 1x3x256x256 fija |
| HAT original (XPixelGroup/HAT) | Superresolucion x2/x3/x4 | PyTorch | Apache-2.0 | no disponible en la informacion | dinamica |
| Este paquete (OSEDiff) | Restauracion generativa one-step | ONNX fp16 | Apache-2.0 + OpenRAIL++-M | no disponible | 1x3x512x512 fija, prompt vacio |
| OSEDiff original (cswry/OSEDiff) | Restauracion generativa one-step | PyTorch + SD 2.1 | Apache-2.0 + OpenRAIL++-M | no disponible en la informacion | dinamica, con prompt |
| Real-ESRGAN, SwinIR | Superresolucion / restauracion | PyTorch, ONNX comunitario | no verificada en la informacion disponible | no disponible | variable |

La diferencia frente a los repositorios upstream no está en la calidad, sino en el formato: entrada de tamaño fijo, grafo único autocontenido y ejecución sin PyTorch, a cambio de perder dinamismo de resolución y control por prompt.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: los pesos provienen de terceros y las licencias originales se aplican por componente. Un uso comercial debe revisar MIT, Apache-2.0 y, sobre todo, CreativeML OpenRAIL++-M.
- CreativeML OpenRAIL++-M impone restricciones de uso sobre OSEDiff (uso lícito, prohibición de determinados fines y obligación de propagar las restricciones a los derivados). No es una licencia de código abierto permisiva al uso.
- Entradas de tamaño fijo: no hay resolución dinámica. Procesar imágenes mayores exige teselado manual con solapamiento, con riesgo de costuras y de inconsistencias entre parches.
- OSEDiff es un modelo generativo: puede inventar detalle que no estaba en la imagen original. En contextos forenses, médicos o documentales el resultado no es una prueba fiable de lo que había en el original.
- Superresolución x4 con GAN tiende a producir texturas sobreenfocadas y artefactos en caras pequeñas o texto, un fallo conocido de esta familia de modelos.
- No se documentan sesgos ni evaluación de robustez; tampoco hay métricas que permitan comparar con los pesos originales.
- El repositorio no tiene descargas ni validación de la comunidad, y la model card está en francés, sin ejemplos, sin versión de opset y sin instrucciones de uso más allá de la nota sobre DirectML.
- Sin soporte de prompt ni de guidance en OSEDiff: no se puede dirigir la restauración hacia un dominio concreto (retrato, paisaje, documento).
- No procesa texto, audio ni vídeo; no sirve para tareas de lenguaje pese a estar publicado en HuggingFace.
- El tamaño del repo (2,2 GB) obliga a descargar los cuatro grafos aunque solo se use uno.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jeromesabourin/quantize-fotograf-models
- Restormer (código y pesos originales, MIT): https://github.com/swz30/Restormer
- HAT (código y pesos originales, Apache-2.0): https://github.com/XPixelGroup/HAT
- OSEDiff (código y pesos originales): https://github.com/cswry/OSEDiff
- Stable Diffusion 2.1 base, del que deriva el componente OSEDiff: https://huggingface.co/stabilityai/stable-diffusion-2-1-base
- Paper de Restormer: https://arxiv.org/abs/2111.09881
- Paper de HAT: https://arxiv.org/abs/2205.04437
- Paper de OSEDiff: https://arxiv.org/abs/2406.08177
- Licencia CreativeML OpenRAIL++-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
