# Comfy-Org/HiDream-O1-Image

## Resumen

HiDream-O1-Image es un modelo de generación de imágenes de código abierto desarrollado por HiDream-ai y publicado originalmente el 8 de mayo de 2026. Este repositorio de Comfy-Org es un reempaquetado de los archivos del modelo para su uso directo en ComfyUI, sin necesidad de conversiones adicionales. El modelo se basa en una arquitectura de Transformer unificado a nivel de píxel (UiT, Pixel-level Unified Transformer), que opera sin VAEs externos ni codificadores de texto separados, integrando píxeles, texto y condiciones de tarea en un único espacio de tokens compartido.

El modelo soporta múltiples tareas de generación y edición de imágenes: text-to-image, edición por instrucciones, personalización por sujeto y generación de storyboards, todo ello con una resolución máxima de 2048 × 2048 píxeles. Su relevancia radica en su enfoque nativamente unificado, que simplifica el pipeline de generación al eliminar componentes modulares tradicionales, y en su licencia MIT, que permite uso comercial sin restricciones. El repositorio incluye versiones en bf16, fp8 escalado y mxfp8, lo que facilita su despliegue en diferentes rangos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer unificado a nivel de píxel (UiT) sin VAE externo ni codificadores de texto separados |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolución máxima 2048 × 2048 |
| Tipos de cuantizacion | bf16, fp8 escalado, mxfp8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

El modelo emplea un Transformer unificado a nivel de píxel (UiT) que procesa directamente los píxeles de la imagen, el texto y las condiciones específicas de cada tarea en un único espacio de tokens compartido. Esto elimina la necesidad de un VAE externo para codificar/decodificar imágenes y de codificadores de texto separados, simplificando el pipeline y permitiendo que el modelo aprenda representaciones más coherentes entre modalidades. No se dispone de información pública sobre el número de parámetros, el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La arquitectura está diseñada para soportar de forma nativa text-to-image, edición por instrucciones, personalización por sujeto y generación de storyboards, lo que sugiere un entrenamiento multitarea.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución de hasta 2048 × 2048 píxeles.
- Edición de imágenes basada en instrucciones en lenguaje natural, permitiendo modificar contenido existente sin necesidad de máscaras manuales.
- Personalización por sujeto (subject-driven personalization), que permite generar imágenes de un sujeto específico a partir de unas pocas referencias.
- Generación de storyboards, creando secuencias de imágenes coherentes a partir de una descripción narrativa.
- Procesamiento unificado de píxeles y texto en un solo espacio de tokens, lo que facilita tareas multimodales sin componentes externos.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso, ya que es un modelo puramente generativo de imágenes.

## Casos de uso

- Generación de imágenes para diseño conceptual: un estudio de diseño puede generar variaciones de producto a partir de descripciones textuales, acelerando el proceso de iteración creativa. El modelo produce imágenes de alta resolución (2048 × 2048) directamente, sin necesidad de post-procesado de VAE.
- Edición de imágenes en flujos de trabajo de retoque: un fotógrafo puede indicar "cambia el fondo a un atardecer" y el modelo modifica la imagen manteniendo el sujeto, gracias a su capacidad de edición por instrucciones sin máscaras.
- Personalización de avatares o personajes: una empresa de videojuegos puede generar variaciones de un personaje a partir de una imagen de referencia, usando la personalización por sujeto para mantener la identidad visual.
- Creación de storyboards para preproducción audiovisual: un director puede describir escenas secuenciales y el modelo genera una serie de imágenes coherentes que sirven como guion gráfico preliminar.
- Prototipado rápido de campañas publicitarias: un equipo de marketing genera múltiples conceptos visuales a partir de briefs textuales, reduciendo el tiempo de producción de mockups.
- Generación de assets para entornos virtuales: desarrolladores de realidad virtual o videojuegos pueden crear texturas o escenarios a partir de descripciones, aprovechando la resolución máxima para obtener detalles finos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos como FID, CLIP score u otras métricas estándar de generación de imágenes para este modelo.

## Requisitos de hardware

- El repositorio contiene archivos de pesos en distintos formatos: bf16 (~66.7 GB), fp8 escalado y mxfp8 (aproximadamente la mitad del tamaño en fp8, ~33 GB). El tamaño exacto de cada archivo no se detalla en la información proporcionada.
- Para cargar el modelo en bf16 en memoria se necesitan al menos 70 GB de VRAM, lo que requiere GPUs profesionales como NVIDIA A100 (80 GB) o H100 (80 GB). Con cuantización fp8, la VRAM necesaria se reduce a aproximadamente 35-40 GB, permitiendo su uso en GPUs como RTX 4090 (24 GB) solo si se aplica además offloading o se usa una versión aún más ligera.
- No se indica si el modelo cabe en GPUs de consumo sin cuantización adicional. La versión mxfp8 podría caber en una RTX 4090 con 24 GB si el peso total no supera ese límite, pero no hay confirmación.
- Opciones de despliegue: al ser un reempaquetado para ComfyUI, se integra directamente en ese entorno. También puede usarse con el código original del repositorio de HiDream-ai (GitHub) y con librerías de inferencia como diffusers si se adapta el formato.
- No se dispone de datos de latencia o throughput. La inferencia dependerá del hardware y del tamaño de la imagen generada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con modelos alternativos de generación de imágenes de características similares. Se desconoce si existen modelos comparables en cuanto a arquitectura unificada sin VAE externo y licencia MIT.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos del modelo ni sobre su comportamiento en dominios específicos (rostros, minorías, etc.). Al ser un modelo generativo de imágenes, es probable que presente sesgos derivados de sus datos de entrenamiento, pero no hay información al respecto.
- Riesgo de alucinación visual: como cualquier modelo generativo, puede producir imágenes con detalles incoherentes o no fieles a la instrucción, especialmente en escenas complejas o con múltiples objetos.
- La resolución máxima de 2048 × 2048 puede ser insuficiente para aplicaciones que requieran resoluciones mayores (p. ej., impresión de gran formato). No se indica si soporta superresolución.
- No se especifican los idiomas soportados para las instrucciones de texto. Es probable que el modelo funcione mejor en inglés, pero no hay confirmación.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo original de HiDream-ai para asegurar que no hay condiciones adicionales.
- Para producción, es necesario validar el comportamiento del modelo en el dominio específico, ya que no hay benchmarks públicos que garanticen su rendimiento.

## Enlaces

- Repositorio de HuggingFace (Comfy-Org): https://huggingface.co/Comfy-Org/HiDream-O1-Image
- Repositorio original (HiDream-ai): https://huggingface.co/HiDream-ai/HiDream-O1-Image
- Repositorio original Dev (HiDream-ai): https://huggingface.co/HiDream-ai/HiDream-O1-Image-Dev
- GitHub del proyecto original: https://github.com/HiDream-ai/HiDream-O1-Image
- Tutorial de ComfyUI para HiDream-O1-Image: https://docs.comfy.org/tutorials/image/hidream/hidream-o1
