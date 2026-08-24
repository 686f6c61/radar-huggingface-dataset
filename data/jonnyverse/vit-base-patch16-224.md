# JONNYVERSE/vit-base-patch16-224

## Resumen

El modelo `JONNYVERSE/vit-base-patch16-224` es una conversión a formato ONNX del Vision Transformer (ViT) base de Google (`google/vit-base-patch16-224`), realizada por el usuario JONNYVERSE para hacerlo compatible con la librería Transformers.js. Este modelo resuelve el problema de ejecutar clasificación de imágenes directamente en el navegador o en entornos JavaScript, sin necesidad de un servidor dedicado. Su relevancia radica en que democratiza el uso de modelos de visión por computadora en aplicaciones web, aprovechando la inferencia local y reduciendo la latencia.

El modelo original es un transformer encoder (arquitectura BERT-like) preentrenado en ImageNet-21k y fine-tuneado en ImageNet-1k, con una resolución de entrada de 224x224 píxeles. La conversión a ONNX mantiene las mismas capacidades, pero optimiza los pesos para su ejecución con ONNX Runtime Web, lo que permite su uso en navegadores modernos. El repositorio tiene un tamaño de 1.3 GB, lo que sugiere pesos en precisión fp32 o fp16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con 12 capas, 12 cabezas de atención, 768 dimensiones ocultas |
| Parametros totales | 86 millones (aprox.) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de 224x224 píxeles) |
| Tipos de cuantizacion | No disponible (se proporciona en ONNX, posiblemente fp32) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | No disponible (el modelo base es Apache 2.0, pero no se especifica en esta conversión) |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

El modelo base `google/vit-base-patch16-224` es un Vision Transformer (ViT) que procesa imágenes dividiéndolas en parches de 16x16 píxeles, los cuales se linealmente embeben y se alimentan a un encoder transformer estándar. Se añade un token `[CLS]` al inicio de la secuencia para la tarea de clasificación. El modelo fue preentrenado de forma supervisada en ImageNet-21k (21.000 clases) y posteriormente fine-tuneado en ImageNet-1k (1.000 clases) a una resolución de 224x224.

La conversión a ONNX se realizó utilizando la librería Optimum de Hugging Face, que exporta los pesos del modelo PyTorch original al formato ONNX. Este proceso no modifica la arquitectura ni los pesos, solo los serializa en un formato compatible con ONNX Runtime, lo que permite su ejecución en entornos JavaScript a través de Transformers.js. No se ha aplicado ninguna técnica de cuantización adicional en esta conversión, aunque el formato ONNX admite múltiples precisiones.

## Capacidades

- Clasificación de imágenes en 1.000 categorías de ImageNet (por ejemplo, animales, objetos, vehículos, etc.).
- Procesamiento de imágenes de tamaño fijo 224x224 píxeles, con normalización estándar (media y desviación de ImageNet).
- Inferencia en tiempo real en navegadores web y Node.js mediante Transformers.js y ONNX Runtime Web.
- Soporte para ejecución en CPU, GPU (WebGL/WebGPU) y aceleración por hardware en dispositivos móviles.
- No incluye capacidades de detección de objetos, segmentación ni generación de texto; es exclusivamente un clasificador de imágenes.

## Casos de uso

- Clasificación de imágenes en el navegador: permite etiquetar imágenes subidas por el usuario sin enviarlas a un servidor, garantizando privacidad y reduciendo latencia. Se usa con `pipeline('image-classification', ...)` de Transformers.js.
- Moderación de contenido visual: puede clasificar imágenes en categorías predefinidas (por ejemplo, contenido explícito o inapropiado) directamente en la interfaz web, útil para plataformas de contenido generado por usuarios.
- Etiquetado automático de fotos en aplicaciones de gestión de archivos: integrado en una PWA o extensión de navegador, clasifica imágenes locales y sugiere etiquetas para organizar bibliotecas.
- Asistencia a personas con discapacidad visual: una extensión de navegador puede describir la categoría de una imagen en voz alta, ayudando a entender el contenido de páginas web.
- Análisis de imágenes en tiempo real en aplicaciones de streaming: clasifica fotogramas de una cámara web para detectar objetos o escenas, con baja latencia al ejecutarse localmente.
- Prototipado rápido de aplicaciones de visión: al ser un modelo pequeño (86M parámetros), es ideal para validar conceptos de clasificación en entornos web antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión a ONNX en la información disponible. El modelo base `google/vit-base-patch16-224` tiene un rendimiento conocido en ImageNet-1k (top-1 accuracy alrededor del 85%), pero estos datos no se incluyen en la documentación de este repositorio. Para evaluar el rendimiento real en el navegador, se recomienda ejecutar pruebas locales con el pipeline de Transformers.js y medir la latencia según el hardware del usuario.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 330 MB en fp32 y 165 MB en fp16 (para el modelo completo). En CPU, el uso de memoria es similar, pero la latencia será mayor.
- GPU recomendadas: cualquier GPU moderna con soporte WebGL o WebGPU (por ejemplo, NVIDIA GTX 10xx o superior, AMD RX 5xx o superior, o GPUs integradas Intel Iris Xe). En servidores, una GPU como RTX 3060 o superior es suficiente.
- Compatibilidad con consumer GPU: sí, el modelo cabe en cualquier GPU con al menos 1 GB de VRAM, incluidas las integradas.
- Opciones de despliegue: Transformers.js (navegador y Node.js), ONNX Runtime Web, o servidores con ONNX Runtime (Python, C++, etc.).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Depende del hardware y del backend (WebGL vs WebGPU vs CPU). En una GPU moderna, se espera una latencia de decenas de milisegundos por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|
| JONNYVERSE/vit-base-patch16-224 (ONNX) | 86M | 224x224 | No disponible | ONNX | Clasificación en navegador |
| google/vit-base-patch16-224 (original) | 86M | 224x224 | Apache 2.0 | PyTorch | Clasificación en servidor |
| google/vit-small-patch16-224 | 22M | 224x224 | Apache 2.0 | PyTorch | Clasificación ligera |
| google/vit-large-patch16-224 | 304M | 224x224 | Apache 2.0 | PyTorch | Clasificación de alta precisión |

La conversión a ONNX no altera el rendimiento del modelo original, pero añade la ventaja de poder ejecutarse en entornos JavaScript. Comparado con ViT-small, ofrece mayor precisión a costa de más parámetros; comparado con ViT-large, es más ligero y adecuado para despliegues en el cliente.

## Limitaciones y advertencias

- El modelo solo realiza clasificación de imágenes en 1.000 categorías fijas de ImageNet; no es adecuado para tareas de detección, segmentación o clasificación de clases personalizadas sin fine-tuning.
- La entrada está limitada a imágenes de 224x224 píxeles; imágenes de mayor resolución deben redimensionarse, lo que puede perder detalles.
- La licencia no está especificada en este repositorio. Aunque el modelo base es Apache 2.0, se recomienda verificar los términos de uso antes de un despliegue comercial.
- El modelo puede presentar sesgos inherentes a los datos de ImageNet, como sobrerrepresentación de ciertas categorías o culturas occidentales.
- La inferencia en el navegador depende del hardware del usuario; en dispositivos de gama baja, la latencia puede ser alta y afectar la experiencia de usuario.
- No se han publicado métricas de rendimiento específicas para esta conversión, por lo que se recomienda realizar pruebas de validación antes de usarlo en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JONNYVERSE/vit-base-patch16-224
- Modelo base original: https://huggingface.co/google/vit-base-patch16-224
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Documentación de Optimum para exportación ONNX: https://huggingface.co/docs/optimum/index
