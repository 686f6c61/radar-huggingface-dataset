# Qwen/Qwen-Image-Edit-2511

## Resumen

Qwen-Image-Edit-2511 es un modelo de edición de imágenes desarrollado por el equipo Qwen de Alibaba, presentado como una versión mejorada de Qwen-Image-Edit-2509. Está diseñado para realizar ediciones complejas sobre imágenes de entrada mediante instrucciones en lenguaje natural, con especial énfasis en la consistencia del sujeto, la fusión de múltiples personas y la generación de diseños industriales. El modelo integra capacidades de LoRA directamente en el modelo base, lo que amplía su expresividad sin necesidad de ajuste adicional.

Con 20.430 millones de parámetros, Qwen-Image-Edit-2511 es un modelo de difusión de gran tamaño que opera en el dominio imagen-a-imagen. Soporta inglés y chino, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. Su integración con la librería `diffusers` facilita su despliegue en entornos de producción. La versión 2511 introduce mejoras clave como la mitigación del drift de imagen, una mayor consistencia en personajes individuales y grupales, y un razonamiento geométrico más robusto.

El modelo se publicó en diciembre de 2025 y ha acumulado más de 192.000 descargas y 1.270 likes en Hugging Face, lo que refleja un interés significativo de la comunidad. Su arquitectura se basa en un pipeline de difusión con un transformador como backbone, aunque los detalles técnicos completos no se han divulgado en la documentación pública.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para edición de imágenes (basado en transformador, similar a Qwen-Image) |
| Parametros totales | 20.430.401.088 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no se especifica contexto de texto) |
| Tipos de cuantizacion | No disponible (los pesos se ofrecen en bfloat16 según el código de ejemplo) |
| Idiomas soportados | Inglés (en), Chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen-Image-Edit-2511 es un modelo de difusión diseñado específicamente para tareas de edición de imágenes. Aunque no se han publicado detalles exhaustivos sobre su arquitectura interna, se sabe que utiliza un pipeline de difusión con un transformador como componente principal, siguiendo la línea de los modelos Qwen-Image. El modelo acepta una o varias imágenes de entrada junto con un prompt textual y genera una imagen editada que cumple con las instrucciones.

El entrenamiento se ha enfocado en mejorar la consistencia del sujeto, reducir el drift de imagen (desviación de las características originales) y fortalecer el razonamiento geométrico. Además, se han integrado LoRAs populares de la comunidad directamente en el modelo base, lo que permite activar efectos como mejora de iluminación o generación de nuevos puntos de vista sin necesidad de ajuste adicional. No se han revelado datos específicos sobre el conjunto de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO.

## Capacidades

- Edición de imágenes mediante instrucciones en lenguaje natural, tanto en inglés como en chino.
- Acepta múltiples imágenes de entrada, permitiendo fusionar dos o más sujetos en una sola escena coherente.
- Consistencia mejorada del personaje: mantiene la identidad y características visuales del sujeto original al aplicar ediciones imaginativas.
- Consistencia multi-persona: alta fidelidad al fusionar imágenes de varias personas en una foto de grupo.
- Integración de LoRAs de la comunidad directamente en el modelo base, sin necesidad de entrenamiento adicional.
- Generación de diseños industriales en lote y reemplazo de materiales en componentes industriales.
- Razonamiento geométrico mejorado: puede generar líneas auxiliares de construcción para diseño o anotación.
- Control de iluminación realista gracias a LoRAs integrados (por ejemplo, Lighting Enhancement).
- Generación de nuevos puntos de vista de un objeto o escena a partir de una imagen existente.

## Casos de uso

- Edición de retratos profesionales: el modelo puede modificar la expresión, iluminación o fondo de un retrato manteniendo la identidad del sujeto, gracias a su consistencia de personaje mejorada. Es útil para estudios fotográficos y aplicaciones de retoque automático.
- Fusión de imágenes de grupo: combinar dos fotografías de personas diferentes en una sola imagen coherente, ideal para crear fotos de grupo sintéticas o reunir a personas que no están juntas físicamente.
- Diseño industrial en lote: generar variaciones de productos industriales a partir de una imagen base, cambiando materiales, colores o formas, lo que acelera el proceso de prototipado en ingeniería.
- Reemplazo de materiales en componentes: sustituir el material de un objeto (por ejemplo, de metal a plástico) manteniendo la geometría, útil en visualización de productos y catálogos.
- Generación de vistas alternativas: crear nuevas perspectivas de un objeto o escena a partir de una única imagen, aplicable en comercio electrónico o diseño de interiores.
- Anotación geométrica: generar líneas auxiliares, ejes o guías de construcción sobre una imagen, facilitando tareas de diseño técnico y documentación.
- Control de iluminación: ajustar la iluminación de una escena de forma realista sin necesidad de LoRAs externos, gracias a la integración de efectos de iluminación en el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 20.430 millones de parámetros en bfloat16, se requieren aproximadamente 40 GB de VRAM solo para los pesos del modelo, más memoria adicional para activaciones y overhead. Se estima un mínimo de 48 GB de VRAM para inferencia.
- GPU recomendadas: GPUs de gama alta como NVIDIA A100 (80 GB), H100 (80 GB) o A6000 (48 GB). No es viable en GPUs de consumo como RTX 4090 (24 GB) sin cuantización o técnicas de offloading.
- Opciones de despliegue: el modelo se integra con la librería `diffusers` de Hugging Face mediante el pipeline `QwenImageEditPlusPipeline`. También se puede usar con herramientas como ComfyUI o entornos personalizados que soporten safetensors.
- Latencia y throughput: no se han proporcionado datos oficiales. Dado el tamaño del modelo, se espera una latencia de varios segundos por imagen en GPUs de alta gama, dependiendo del número de pasos de inferencia (típicamente 40 pasos según el ejemplo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen-Image-Edit-2511 | 20.43B | No especificado | Apache-2.0 | Hugging Face, ModelScope |
| Qwen-Image-Edit-2509 | No disponible | No especificado | Apache-2.0 | Hugging Face, ModelScope |
| InstructPix2Pix | ~1.5B | No especificado | Apache-2.0 | Hugging Face |

Qwen-Image-Edit-2511 es una evolución directa de Qwen-Image-Edit-2509, con mejoras en consistencia, LoRA integrado y razonamiento geométrico. Comparado con modelos más pequeños como InstructPix2Pix, ofrece una capacidad de edición mucho más avanzada y soporte multilingüe, aunque requiere recursos de hardware significativamente mayores. No se dispone de datos de rendimiento comparativo en benchmarks.

## Limitaciones y advertencias

- Requiere hardware de gama alta (mínimo 48 GB de VRAM) para inferencia, lo que limita su uso en entornos con recursos limitados.
- No se han documentado sesgos específicos, pero como modelo de generación de imágenes, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinaciones visuales: en escenarios complejos, el modelo puede generar detalles inconsistentes o no deseados.
- La documentación no especifica la longitud máxima de contexto de texto, por lo que prompts muy largos podrían no ser procesados correctamente.
- Aunque la licencia Apache-2.0 permite uso comercial, es recomendable revisar los términos de uso de los datos de entrenamiento si se utiliza en aplicaciones sensibles.
- El modelo está optimizado para inglés y chino; el rendimiento en otros idiomas puede ser inferior.

## Enlaces

- [Hugging Face - Qwen/Qwen-Image-Edit-2511](https://huggingface.co/Qwen/Qwen-Image-Edit-2511)
- [ModelScope - Qwen-Image-Edit-2511](https://www.modelscope.cn/models/Qwen/Qwen-Image-Edit-2511)
- [Tech Report (PDF)](https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen-Image/Qwen_Image.pdf)
- [Blog de Qwen sobre Qwen-Image-Edit-2511](https://qwenlm.github.io/blog/qwen-image-edit-2511/)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/Qwen/Qwen-Image-Edit-2511)
- [Repositorio GitHub de Qwen-Image](https://github.com/QwenLM/Qwen-Image)
- [Artículo arXiv:2508.02324](https://arxiv.org/abs/2508.02324)
