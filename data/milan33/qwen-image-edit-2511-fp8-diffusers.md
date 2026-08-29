# milan33/Qwen-Image-Edit-2511-FP8-Diffusers

## Resumen

Este repositorio contiene una versión cuantizada en FP8 (formato `torch.float8_e4m3fn`) del modelo de edición de imágenes Qwen/Qwen-Image-Edit-2511, preparada por el usuario milan33 para su uso directo con la librería Diffusers. El modelo original, desarrollado por Alibaba Qwen, permite editar imágenes a partir de instrucciones de texto en tareas de image-to-image e inpainting. La cuantización FP8 reduce el uso de memoria y acelera la inferencia, manteniendo una calidad visual cercana a la versión en precisión completa, lo que facilita su despliegue en entornos con recursos de GPU limitados. Con 20.430 millones de parámetros, esta versión FP8 es una opción práctica para integraciones de edición fotográfica en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para edición de imágenes (basado en Qwen-Image-Edit-2511) |
| Parametros totales | 20.430.401.088 (20,43 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (`torch.float8_e4m3fn`) en el componente transformer |
| Idiomas soportados | No disponibles (el modelo base soporta inglés y chino, no confirmado para esta versión) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, compatible con Diffusers |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Qwen-Image-Edit-2511, un modelo de difusión multimodal que procesa imágenes y texto para generar ediciones guiadas por instrucciones. Esta versión concreta no ha sido reentrenada; se trata de una cuantización posterior al entrenamiento (PTQ) que convierte los pesos del transformer a precisión FP8 de 8 bits en coma flotante (`e4m3fn`). Esto reduce el tamaño en memoria y acelera los cálculos en hardware moderno con soporte nativo para FP8 (por ejemplo, GPUs Hopper o Ada Lovelace). No se dispone de información sobre el dataset de entrenamiento original ni sobre técnicas de alineación (RLHF/DPO) aplicadas al modelo base.

## Capacidades

- Edición de imágenes mediante instrucciones de texto (image-to-image): modifica contenido, estilo, objetos o fondo según un prompt.
- Inpainting: rellena regiones específicas de una imagen (con máscara) de forma coherente con el contexto.
- Generación de variaciones: produce múltiples versiones de una imagen a partir de un mismo prompt.
- Compatibilidad con el pipeline `QwenImageEditPlusPipeline` de Diffusers, que permite controlar pasos de inferencia, escala de guía y dimensiones de salida.
- No se documentan capacidades adicionales como tool calling, agentes o procesamiento de audio/vídeo.

## Casos de uso

- Retoque fotográfico automatizado: integrar el modelo en flujos de edición para corregir imperfecciones, cambiar iluminación o ajustar colores mediante prompts descriptivos, reduciendo el trabajo manual en estudios de fotografía.
- Inpainting para eliminación de objetos: usar la función de máscara para borrar elementos no deseados (personas, vehículos, cables) y rellenar el fondo de forma natural, útil en postproducción de imágenes inmobiliarias o de producto.
- Generación de variaciones de producto para ecommerce: crear múltiples fondos o estilos de un mismo artículo a partir de una foto base, agilizando la preparación de catálogos.
- Asistencia creativa para diseñadores: explorar rápidamente alternativas de composición o paleta cromática enviando prompts de cambio de estilo a partir de un boceto inicial.
- Edición de imágenes médicas o técnicas (con supervisión): aplicar transformaciones controladas a imágenes de diagnóstico o planos técnicos, siempre que se valide la salida.
- Automatización de contenido para marketing: generar versiones adaptadas a distintas plataformas (cambios de texto incrustado, proporciones, fondos) a partir de una imagen original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio remite al modelo base Qwen/Qwen-Image-Edit-2511 para detalles de evaluación, pero no se incluyen métricas específicas para esta versión FP8.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser FP8 y tener 20,43 B de parámetros, se estima un consumo de memoria de aproximadamente 20-24 GB en GPU (frente a ~40 GB en BF16). No hay datos oficiales.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB VRAM) o superior, o GPUs de centro de datos como A100/H100 (con soporte FP8).
- En consumer GPU: cabe en tarjetas con 24 GB de VRAM (RTX 3090, RTX 4090). En GPUs de 16 GB podría ser ajustado dependiendo de la resolución de salida.
- Opciones de despliegue: compatible con Diffusers (Python) y con servidores de inferencia como vLLM o TGI si se adapta el pipeline. También se puede usar con ComfyUI mediante workflows personalizados.
- Latencia y throughput: no disponibles; dependerán de la GPU y de la resolución de imagen (por ejemplo, 1024×768 con 20 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| milan33/Qwen-Image-Edit-2511-FP8-Diffusers | 20,43 B | FP8 | No disponible | Apache 2.0 | HuggingFace |
| 1038lab/Qwen-Image-Edit-2511-FP8 | 20,43 B | FP8 | No disponible | Apache 2.0 | HuggingFace, ModelScope |
| Qwen/Qwen-Image-Edit-2511 (base) | 20,43 B | BF16/FP16 | No disponible | Apache 2.0 | HuggingFace |

La comparativa muestra que esta versión es una alternativa más ligera del modelo base, con la misma licencia y parámetros. No se dispone de datos de rendimiento para contrastar con otros modelos de edición de imágenes como InstructPix2Pix o InstructBLIP.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir una ligera pérdida de calidad en la salida comparada con la versión en BF16, especialmente en texturas finas o detalles pequeños.
- No se ha documentado el comportamiento del modelo en cuanto a sesgos o alucinaciones; como ocurre con otros modelos generativos, puede producir artefactos visuales o cambios no deseados en la imagen.
- El idioma de los prompts no está confirmado; se asume que funciona mejor en inglés y chino, pero no hay garantías para otros idiomas.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución y no se ofrece garantía sobre el comportamiento del modelo.
- Para producción, se recomienda validar las salidas en el dominio específico y considerar un pipeline de control de calidad, ya que la edición automática puede generar resultados inapropiados o incorrectos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/milan33/Qwen-Image-Edit-2511-FP8-Diffusers
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Versión FP8 alternativa: https://huggingface.co/1038lab/Qwen-Image-Edit-2511-FP8
- Página en ModelScope: https://www.modelscope.cn/models/1038lab/Qwen-Image-Edit-2511-FP8
- Discusión en Civitai: https://civitai.com/models/2247803/qwen-image-edit-2511
