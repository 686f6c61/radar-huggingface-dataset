# brurpo/onnx-models

## Resumen

El repositorio `brurpo/onnx-models` es una colección de modelos de visión por computación convertidos al formato ONNX para su despliegue en producción, mantenida por el usuario brurpo y consumida por la aplicación BRP Canvas. No se trata de un único modelo, sino de un catálogo de artefactos orientados a la eliminación de fondo, el matting de alta resolución y el escalado de vídeo. Incluye tres modelos de segmentación (Lucida, FeyNoBg y BiRefNet HR Matting) y un paquete de escalado de vídeo (SeedVR2 3B), todos exportados con ONNX opset 20 y disponibles en precisión FP32 o FP16.

La relevancia de este repositorio radica en su enfoque de despliegue: los modelos se distribuyen como artefactos ONNX independientes de Python y PyTorch, con descargas reanudables, verificación SHA-256 e instalación atómica mediante un manifiesto JSON. La licencia es mixta (`mixed-upstream-licenses`), lo que significa que cada modelo conserva los términos de su fuente original. El repositorio tiene un tamaño de 18,8 GB y fue creado en julio de 2026, con cero descargas y cero likes, lo que indica que es un proyecto reciente o de uso interno.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Segmentación de imagen (CNN) y escalado de vídeo (VAE + Transformer) |
| Parámetros totales | No especificado por modelo; SeedVR2 3B tiene 3.000 millones |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | No aplicable (modelos de visión) |
| Tipos de cuantización | FP32, FP16 |
| Idiomas soportados | No aplicable (modelos de visión) |
| Licencia | mixed-upstream-licenses (cada modelo conserva su licencia original) |
| Formato de pesos | ONNX (opset 20) con shards de datos externos |

### Modelos incluidos

| Modelo | Precisión | Entrada | Salida | Fuente original |
|---|---|---|---|---|
| Lucida | FP32 | `1×3×1024×1024` | alpha `1×1×1024×1024` | [egeorcun/lucida](https://huggingface.co/egeorcun/lucida) |
| FeyNoBg | FP32 | `1×3×1024×1024` | alpha `1×1×1024×1024` | [feyninc/FeyNobg](https://huggingface.co/feyninc/FeyNobg) |
| BiRefNet HR Matting | FP32 | `1×3×2048×2048` | alpha `1×1×2048×2048` | [ZhengPeng7/BiRefNet_HR-matting](https://huggingface.co/ZhengPeng7/BiRefNet_HR-matting) |
| SeedVR2 3B | FP16 | dinámica | dinámica | [ByteDance SeedVR2](https://github.com/IceClear/SeedVR2) |

## Arquitectura y entrenamiento

El repositorio no contiene modelos entrenados desde cero, sino conversiones de modelos existentes. Los tres modelos de segmentación producen un matte alfa normalizado mediante sigmoide, y la composición RGB, el redimensionado, el padding y el refinamiento de bordes se delegan en la aplicación consumidora. BiRefNet HR Matting opera a 2048×2048 píxeles, lo que lo hace adecuado para matting de alta resolución. Todos los modelos se exportan con ONNX opset 20.

SeedVR2 3B es un modelo de escalado de vídeo derivado del proyecto ByteDance SeedVR2, con licencia Apache-2.0. Se distribuye como un paquete ONNX FP16 con codificador y decodificador VAE de espacial dinámico, 32 bloques de transformer cargables de forma independiente y proyecciones de entrada/salida. Esto permite al runtime de BRP Canvas transmitir los pesos sin necesidad de Python ni PyTorch. Cada variante incluye un `model.onnx` con shards externos, un `conversion.json` con la revisión de la fuente, el esquema de tensores y hashes SHA-256, un README específico y la licencia original.

## Capacidades

- Eliminación de fondo en imágenes: los tres modelos de segmentación generan un canal alfa de fondo a partir de una imagen de entrada.
- Matting de alta resolución: BiRefNet HR Matting acepta entradas de 2048×2048 píxeles, adecuado para retratos y objetos con bordes complejos.
- Escalado de vídeo: SeedVR2 3B permite escalar vídeo mediante un VAE de espacial dinámico y 32 bloques de transformer.
- Ejecución sin dependencias de Python: el formato ONNX permite usar los modelos con ONNX Runtime, DirectML u otros runtimes compatibles.
- Carga por streaming: los bloques de transformer de SeedVR2 se cargan de forma independiente, lo que reduce el pico de memoria.
- Verificación de integridad: los pesos se comprueban con SHA-256 antes de su uso, garantizando que no haya corrupción durante la descarga.
- Instalación atómica y descargas reanudables: el manifiesto JSON permite actualizaciones seguras de los modelos en la aplicación.

## Casos de uso

- Eliminación de fondo en comercio electrónico: Lucida o FeyNoBg pueden procesar imágenes de producto a 1024×1024 para generar un canal alfa y aislar el objeto sobre cualquier fondo.
- Matting de alta resolución para edición fotográfica: BiRefNet HR Matting permite recortar retratos con pelo, pelaje u otros detalles finos a 2048×2048, ideal para herramientas de edición profesional.
- Escalado de vídeo en postproducción: SeedVR2 3B se puede integrar en un pipeline de procesamiento de vídeo para aumentar la resolución, con la ventaja de que los bloques de transformer se cargan de forma incremental.
- Aplicaciones de escritorio sin servidores: el formato ONNX permite ejecutar los modelos en Windows mediante DirectML, sin necesidad de instalar Python ni PyTorch, lo que facilita la distribución de aplicaciones.
- Procesamiento por lotes automatizado: los modelos pueden integrarse en un backend para eliminar el fondo de miles de imágenes de forma automática, con verificación de integridad y descargas reanudables.
- Prototipado rápido con runtimes ONNX: los modelos se pueden cargar en ONNX Runtime, OpenVINO o TensorRT para evaluar su calidad sin depender del entorno de entrenamiento original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad (IoU, PSNR, SSIM) ni datos de latencia o throughput para los modelos. No es posible comparar el rendimiento real de estos modelos con alternativas sin datos adicionales.

## Requisitos de hardware

- Lucida y FeyNoBg (FP32, 1024×1024): requieren aproximadamente 2-4 GB de VRAM para inferencia. Caben en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 (8 GB).
- BiRefNet HR Matting (FP32, 2048×2048): requiere aproximadamente 8-12 GB de VRAM a partir de la alta resolución de entrada. Se recomienda una GPU con 12 GB o más (RTX 3080, RTX 4070 Ti, A2000).
- SeedVR2 3B (FP16): el modelo de 3.000 millones de parámetros en FP16 ocupa aproximadamente 6 GB de VRAM. Con la carga incremental de bloques, se puede ejecutar en GPU de 8 GB o más.
- Todos los modelos son compatibles con ONNX Runtime y DirectML, por lo que pueden ejecutarse en GPU NVIDIA y AMD en Windows, así como en CPU (con menor rendimiento).
- Para despliegue en servidor, se puede usar ONNX Runtime con aceleración CUDA o TensorRT. No se dispone de datos de latencia ni throughput.
- No se recomienda el uso de vLLM o llama.cpp para estos modelos, ya que no están pensados para esos runtimes.

## Comparativa con modelos similares

No se dispone de benchmarks publicados para comparar directamente estos modelos con alternativas. La siguiente tabla ofrece una comparación cualitativa basada en los modelos originales:

| Modelo | Tipo | Resolución de entrada | Parámetros | Licencia |
|---|---|---|---|---|
| Lucida (egeorcun) | Segmentación / eliminación de fondo | 1024×1024 | no disponible | no disponible |
| FeyNoBg (feyninc) | Segmentación / eliminación de fondo | 1024×1024 | no disponible | no disponible |
| BiRefNet HR Matting (ZhengPeng7) | Matting de alta resolución | 2048×2048 | no disponible | no disponible |
| RMBG-2.0 (BRIA AI) | Segmentación / eliminación de fondo | 1024×1024 | no disponible | licencia comercial |
| U2-Net | Segmentación / eliminación de fondo | 320×320 | 44 M | Apache-2.0 |
| SeedVR2 3B (ByteDance) | Escalado de vídeo | dinámica | 3 B | Apache-2.0 |
| Real-ESRGAN | Escalado de imagen | 1024×1024 | 1 M | BSD-3-Clause |

No se dispone de datos de rendimiento publicados para los modelos originales en este repositorio.

## Limitaciones y advertencias

- Licencia mixta: el repositorio no tiene una licencia única. Cada modelo conserva los términos de su fuente original. Es obligatorio revisar la licencia de cada modelo antes de un uso comercial.
- Sin benchmarks publicados: no hay métricas de calidad ni de rendimiento en el repositorio, lo que dificulta evaluar la idoneidad de los modelos para un caso concreto.
- Repositorio con cero descargas: el proyecto tiene 0 descargas y 0 likes, lo que sugiere que es muy reciente o de uso interno. La fecha de creación (julio de 2026) es posterior a la fecha de actualización (agosto de 2026).
- Dependencia de BRP Canvas: el repositorio está pensado para ser consumido por la aplicación BRP Canvas. El uso independiente requiere comprender el `manifest.json` y las convenciones de conversión.
- Compatibilidad limitada: los modelos ONNX están optimizados para el runtime de BRP Canvas y pueden no funcionar correctamente con otros runtimes sin adaptación.
- Procesado de imagen delegado: los modelos solo producen un matte alfa; el redimensionado, el padding y la composición RGB deben ser implementados por la aplicación consumidora.
- El modelo SeedVR2 3B requiere un paquete de streaming de 32 bloques; no se proporcionan instrucciones para ejecutarlo fuera de BRP Canvas.

## Enlaces

- [Repositorio HuggingFace: brurpo/onnx-models](https://huggingface.co/brurpo/onnx-models)
- [Árbol del repositorio en HuggingFace](https://huggingface.co/brurpo/onnx-models/tree/main)
- [Proyecto original Lucida: egeorcun/lucida](https://huggingface.co/egeorcun/lucida)
- [Proyecto original FeyNoBg: feyninc/FeyNobg](https://huggingface.co/feyninc/FeyNobg)
- [Proyecto original BiRefNet HR Matting: ZhengPeng7/BiRefNet_HR-matting](https://huggingface.co/ZhengPeng7/BiRefNet_HR-matting)
- [Proyecto SeedVR2 de ByteDance (GitHub)](https://github.com/IceClear/SeedVR2)
- [Modelos ONNX en GitHub](https://github.com/onnx/models)
- [Modelos de ONNX Runtime](https://onnxruntime.ai/models)
