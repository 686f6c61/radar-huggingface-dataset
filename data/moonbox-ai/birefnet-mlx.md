# moonbox-ai/BiRefNet-MLX

## Resumen

BiRefNet-MLX es un port a MLX del modelo BiRefNet (Bilateral Reference for High-Resolution Dichotomous Image Segmentation), un modelo de segmentación de imágenes especializado en extracción de primer plano y eliminación de fondo de alta resolución. Lo desarrolla moonbox-ai como una conversión del modelo original de ZhengPeng7 al framework MLX de Apple, lo que permite ejecutar la inferencia de forma nativa en Apple Silicon (M-series) sin depender de PyTorch ni CUDA.

El modelo original BiRefNet resuelve la tarea de segmentación dicotómica de imágenes (DIS, dichotomous image segmentation), es decir, separar con precisión de píxel el objeto principal del fondo en imágenes de alta resolución. La arquitectura emplea un backbone Swin-L con referencias bilaterales (top-down y bottom-up) y un decodificador ASPP deformable, y está entrenado sobre múltiples datasets de segmentación con supervisión multiescala.

La relevancia de este port concreto reside en su empaquetado: ofrece cinco precisiones (fp16, bf16, 8bit, 6bit, 4bit) con archivos de pesos safetensors de entre 161 MB y 440 MB, un script `mlx_model.py` autocontenido que solo requiere `mlx`, `numpy` y `pillow`, y una verificación documentada de fidelidad frente al modelo PyTorch original (MAE e IoU por precisión). Está pensado para Macs con chip Apple Silicon que necesiten eliminación de fondo local y de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin-L backbone (full y half resolution) con referencias bilaterales y decodificador ASPP deformable; port a MLX |
| Parametros totales | no disponible (pesos fp16 de 440,4 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16, bf16, 8bit, 6bit, 4bit (cuantizacion afín de MLX, group size 64; convoluciones y norms permanecen en bf16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con `config.json` y `mlx_model.py` por carpeta de precision |

## Arquitectura y entrenamiento

BiRefNet es un modelo de segmentación de imágenes construido sobre un backbone Swin-L que opera a resolución completa y media resolución, combinado con un mecanismo de referencia bilateral que propaga información en dos direcciones (de arriba abajo y de abajo arriba) entre las etapas del encoder y el decoder. El decodificador emplea ASPP con convoluciones deformables. En este port MLX se ejecuta la configuración liberada del modelo original, con las BatchNorms plegadas en las convoluciones y la operación `deform_conv2d` de torchvision reimplementada en MLX.

El entrenamiento corresponde al modelo original de ZhengPeng7 (paper arXiv:2401.03407), no a este port. No se dispone en la información proporcionada de detalles sobre el número de tokens, la composición exacta del dataset ni el uso de RLHF/DPO, ya que se trata de un modelo de visión supervisado para segmentación. La innovación técnica de este repositorio es la conversión: los pesos originales se cargan en MLX y se almacenan en bf16/fp16 o se cuantizan con la cuantización afín de MLX (8bit, 6bit, 4bit; group size 64), dejando convoluciones y normas en bf16. Cada build se verificó contra el original antes de subirse, con hashes sha256 documentados.

## Capacidades

- Segmentación dicotómica de imágenes: separa el objeto principal del fondo con precisión de píxel.
- Eliminación de fondo (background removal): genera un canal alfa (matte) a partir de una imagen RGB.
- Extracción de primer plano en alta resolución: la entrada se redimensiona a 1024x1024, como en el `handler.py` original.
- Salida de máscara en escala de grises (uint8, HxW) combinable con la imagen original para producir un cutout PNG.
- Inferencia nativa en Apple Silicon mediante MLX, sin necesidad de CUDA ni PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de segmentación.

## Casos de uso

- Eliminación de fondo en lote para catálogos de e-commerce: el modelo procesa imágenes de producto y genera cutouts con canal alfa listos para fondos neutros, con un coste de unos 1,2 s por imagen a 1024x1024 en un Apple M5.
- Edición fotográfica local en Mac: integrar el port en una app de escritorio o script de automatización que recorte sujetos sin enviar imágenes a la nube, aprovechando que solo requiere `mlx`, `numpy` y `pillow`.
- Preprocesado para pipelines de visión: generar máscaras de primer plano antes de tareas posteriores (reconocimiento, composición, aumentación de datos) en flujos que ya corren sobre Apple Silicon.
- Creación de contenido y diseño gráfico: aislar personas u objetos para montajes, thumbnails o material de marketing con precisión de píxel.
- Automatización de flujos de trabajo en macOS: scripts que procesen carpetas de imágenes y produzcan PNG con transparencia, con la precisión 8bit (IoU >= 0,9971) como compromiso entre tamaño (258 MB) y fidelidad.
- Prototipado e investigación en segmentación: usar las distintas precisiones (fp16, bf16, 8bit, 6bit, 4bit) para estudiar el impacto de la cuantización en la calidad de máscara, con métricas de referencia ya publicadas por el autor.

## Benchmarks y rendimiento

El autor documenta la fidelidad de cada build frente al modelo PyTorch fp32 original sobre las mismas entradas (peor imagen):

| Precision | Tamano | MAE vs PyTorch fp32 (peor imagen) | Mask IoU (peor) | Estado |
|---|---|---|---|---|
| fp16 | 440 MB | 0,00003 | 0,9996 | pasa |
| bf16 | 440 MB | 0,0002 | 0,9978 | pasa |
| 8bit | 258 MB | 0,0003 | 0,9971 | pasa |
| 6bit | 209 MB | 0,0009 | 0,9913 | pasa |
| 4bit | 161 MB | 0,0022 | 0,9772 | por debajo del umbral (IoU >= 0,98), experimental |

Latencia: aproximadamente 1,2 s por imagen (1024x1024) en un Apple M5. No se han publicado en la información disponible resultados de benchmarks estándar de segmentación (por ejemplo, en los datasets de DIS) para este port.

## Requisitos de hardware

- VRAM/memoria unificada estimada: entre 161 MB (4bit) y 440 MB (fp16/bf16) solo para pesos; el pico real depende de la resolución de entrada (1024x1024) y del framework MLX.
- GPU recomendadas: Apple Silicon (M-series); el autor reporta tiempos en un Apple M5. No es compatible con CUDA de forma nativa.
- Cabe en cualquier Mac con Apple Silicon; el build 4bit (161 MB) es el más ligero, aunque experimental.
- Opciones de despliegue: MLX directamente con el script `mlx_model.py` incluido (solo requiere `mlx`, `numpy` y `pillow`); el resto del pipeline proviene del repositorio original de BiRefNet.
- Latencia: ~1,2 s por imagen a 1024x1024 en Apple M5. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| BiRefNet-MLX (este) | no disponible (pesos 161-440 MB) | 1024x1024 | MIT | MLX, Apple Silicon |
| BiRefNet (original, ZhengPeng7) | no disponible | 1024x1024 | MIT | PyTorch, CUDA/CPU |
| Otros modelos de eliminación de fondo | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo con alternativas como rembg, U2-Net o SAM, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- El build 4bit está marcado como experimental y por debajo del umbral de calidad (IoU 0,9772 < 0,98); no se recomienda para producción sin validación propia.
- Es un modelo de segmentación binaria: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- La entrada se redimensiona a 1024x1024, lo que puede perder detalle en imágenes de resolución muy superior o muy inferior.
- Solo se han convertido las partes indicadas; el resto del pipeline (preprocesado, postprocesado) debe tomarse del repositorio original.
- No hay información sobre sesgos específicos del modelo; al ser un modelo visual, puede fallar en sujetos poco representados en sus datos de entrenamiento.
- Licencia MIT, que permite uso comercial, pero los archivos son un derivado del modelo original y heredan su licencia; conviene revisar la model card original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-ai/BiRefNet-MLX
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet
- Paper: https://arxiv.org/abs/2401.03407
- Repositorio original (referenciado en la model card): no disponible en la información proporcionada
