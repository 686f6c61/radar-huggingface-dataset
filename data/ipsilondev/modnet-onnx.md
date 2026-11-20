# ipsilondev/modnet-onnx

## Resumen

`ipsilondev/modnet-onnx` es un espejo del export ONNX en fp16 del modelo MODNet, una red neuronal convolucional diseñada específicamente para *matting* de retratos fotográficos (extracción de la máscara alfa de una persona respecto al fondo). El modelo original fue desarrollado por el equipo de investigación de ZHKKKe (Zhanghan Ke et al.) y publicado bajo licencia Apache-2.0; este repositorio concreto es una copia sin modificaciones del archivo `onnx/model_fp16.onnx` presente en el repositorio `Xenova/modnet`, mantenido por el autor `ipsilondev` para su uso en aplicaciones móviles nativas (ID2Spec y Template Studio).

El modelo resuelve el problema de la segmentación fina de primer plano en imágenes de personas, produciendo una máscara alfa con valores en el rango [0, 1] que permite recortar o recomponer retratos sobre nuevos fondos con bordes suaves (pelo, ropa, etc.). Es relevante en el contexto de aplicaciones móviles porque el grafo ONNX está pensado para ejecutarse con ONNX Runtime en Android, sin depender de una capa web ni de servicios en la nube, lo que facilita el procesamiento local y la privacidad.

El repositorio tiene un tamaño declarado de 0.0 GB y cero descargas en el momento de la consulta, lo que refleja que es un artefacto de uso interno más que un modelo de propósito general. La arquitectura subyacente es una CNN (no un transformer), con un único archivo de pesos de aproximadamente 12,98 MB en fp16 y opset 11 de ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (MODNet, red convolucional para matting de retratos) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp16 (pesos); entrada y salida en fp32 |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_fp16.onnx`, opset 11) |

## Arquitectura y entrenamiento

MODNet es una red convolucional diseñada para *matting* de retratos en tiempo real. La información disponible en la model card no detalla la composición interna de la arquitectura (número de capas, bloques, etc.) ni los datos de entrenamiento empleados por el modelo original; únicamente se indica que proviene del repositorio `ZHKKKe/MODNet` y que la versión aquí alojada es el export ONNX en fp16 realizado por Xenova. No se documenta si hubo fases de preentrenamiento, ajuste fino supervisado o técnicas de destilación.

El grafo ONNX tiene una única entrada `input` de tipo FLOAT con forma `['batch_size', 3, 'height', 'width']` y una única salida `output` de tipo FLOAT con forma `['batch_size', 1, 'height', 'width']`. Es importante notar que, aunque los pesos están almacenados en fp16, las entradas y salidas del grafo son tensores fp32 (con conversiones internas), de modo que el código cliente debe construir tensores float32 ordinarios. El preprocesado recomendado por el autor consiste en convertir a RGB, normalizar con `(x - 127.5) / 127.5` y ajustar el tamaño a un múltiplo de 32 en torno a 512 píxeles.

## Capacidades

- Segmentación de primer plano en retratos fotográficos: genera una máscara alfa por píxel con valores en [0, 1].
- *Matting* de bordes suaves: adecuado para pelo, ropa y contornos delicados, gracias a la naturaleza del modelo MODNet.
- Ejecución en dispositivo: pensado para ONNX Runtime en Android (proveedor CPU), sin dependencia de red.
- Entrada RGB de tamaño variable (múltiplo de 32), con resolución de referencia en torno a 512 px.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).
- No incluye modo *thinking*, visión general, audio ni otras modalidades más allá de la segmentación de imagen.

## Casos de uso

- **Reemplazo de fondo en apps móviles**: el modelo genera la máscara alfa del retrato para recomponerlo sobre un fondo nuevo; su tamaño reducido (~13 MB en fp16) y su ejecución vía ONNX Runtime CPU lo hacen viable en Android sin conexión.
- **Videollamadas y conferencias con fondo virtual**: integrado en un pipeline de captura de cámara, permite segmentar al usuario fotograma a fotograma y sustituir o desenfocar el fondo localmente.
- **Edición fotográfica de retratos**: útil en herramientas de retoque que necesitan aislar a la persona para aplicar ajustes selectivos (luz, color, desenfoque) sin intervención manual.
- **Generación de avatares y *stickers***: la máscara alfa permite recortar al sujeto y componerlo en plantillas o escenas, un caso directamente alineado con las apps mencionadas por el autor (ID2Spec, Template Studio).
- **Preprocesado para pipelines de visión**: la máscara puede alimentar etapas posteriores (reconocimiento facial, análisis de pose) que se beneficien de eliminar el fondo.
- **Documentos de identidad y fotos de carné**: el *matting* de retratos permite normalizar el fondo de fotografías de identidad en aplicaciones de tramitación, siempre que se respete la licencia Apache-2.0.
- **Prototipado rápido en investigación**: al ser un ONNX ligero y con I/O bien definidas, sirve como *baseline* para comparar algoritmos de segmentación de retratos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; por el tamaño del archivo (12,98 MB en fp16) y la resolución de entrada (~512 px), el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas**: cualquier GPU moderna es suficiente; el autor indica que el destino principal es la CPU vía ONNX Runtime en Android, no GPU.
- **Consumer GPU**: sí, cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en hardware móvil.
- **Opciones de despliegue**: ONNX Runtime (CPU y otros proveedores), y en general cualquier runtime compatible con ONNX (por ejemplo, conversión a otros formatos). No se mencionan vLLM, llama.cpp ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. El autor señala que la verificación en dispositivo con el proveedor CPU de ORT está pendiente ("not yet verified on a device").

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ipsilondev/modnet-onnx` | CNN de matting (ONNX fp16) | no disponible | Imagen RGB, múltiplo de 32 (~512) | Apache-2.0 | Hugging Face |
| `Xenova/modnet` | CNN de matting (ONNX, upstream) | no disponible | Imagen RGB | Apache-2.0 | Hugging Face |
| `ZHKKKe/MODNet` (original) | CNN de matting (PyTorch) | no disponible | Imagen RGB | Apache-2.0 | GitHub |

La comparativa se limita al linaje directo del modelo, ya que la información proporcionada no incluye datos de rendimiento ni de otros modelos de matting (por ejemplo, BackgroundMattingV2, RVM) que permitan una comparación cuantitativa. No disponible para alternativas fuera de este linaje.

## Limitaciones y advertencias

- **Sin verificación en dispositivo**: el autor indica explícitamente que el grafo no se ha probado aún en un dispositivo real con el proveedor CPU de ONNX Runtime; si falla, se añadirá una variante fp32 (`onnx/model.onnx`, 25,9 MB en el upstream).
- **Entrada/salida en fp32 pese a pesos fp16**: el código cliente debe usar tensores float32; asumir fp16 en la interfaz provocará errores.
- **Preprocesado específico**: la normalización `(x - 127.5) / 127.5` y el ajuste a múltiplos de 32 en torno a 512 son necesarios para obtener resultados correctos; el `preprocessor_config.json` incluido es solo de referencia.
- **Sesgos**: no documentados en la información disponible; al ser un modelo de matting de retratos, puede tener peor comportamiento en sujetos atípicos, fondos complejos o iluminación no estándar.
- **Alucinación**: no aplica en el sentido de generación de texto, pero sí puede producir máscaras incorrectas en casos límite (objetos confundidos con personas, bordes mal definidos).
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero se recomienda conservar los avisos de atribución al proyecto MODNet original.
- **Caveat de producción**: el repositorio tiene 0 descargas y 0 likes, y el tamaño declarado es 0.0 GB, lo que sugiere que es un artefacto de uso interno del autor más que un modelo mantenido para la comunidad; conviene validar el archivo y su hash antes de integrarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ipsilondev/modnet-onnx
- Modelo upstream en Hugging Face: https://huggingface.co/Xenova/modnet
- Repositorio original de MODNet: https://github.com/ZHKKKe/MODNet
- Commit de referencia del upstream: `fa2fa546052fba4c08921230a26cc69a333fca12`
