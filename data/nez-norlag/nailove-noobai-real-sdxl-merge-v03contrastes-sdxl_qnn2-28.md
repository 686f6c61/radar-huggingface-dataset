# Nez-Norlag/nailove-noobai-real-sdxl-merge-v03contrastes-sdxl_QNN2.28

## Resumen
El modelo `Nez-Norlag/nailove-noobai-real-sdxl-merge-v03contrastes-sdxl_QNN2.28` es una conversión a formato QNN (Qualcomm Neural Network) de un checkpoint de Stable Diffusion XL (SDXL) resultante de la fusión de dos modelos: NoobAI y Real SDXL. El autor, Nez-Norlag, ha adaptado el modelo original creado por wind11 (disponible en Civitai) para su ejecución eficiente en las NPU de los procesadores Snapdragon de gama alta, permitiendo generar imágenes realistas y de estilo anime directamente en el teléfono, con soporte explícito para contenido NSFW. La conversión se realizó mediante la herramienta Local Dream, sin banderas especiales para v-prediction ni modo realista, según indica el autor.

Este modelo es relevante porque democratiza la generación de imágenes de alta calidad en dispositivos móviles, aprovechando la aceleración por hardware dedicado (NPU) y evitando la dependencia de la nube. Su licencia `creativeml-openrail-m` permite uso comercial con atribución, pero limita la responsabilidad del autor sobre el contenido generado.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (UNet + VAE + CLIP) |
| Parámetros totales | no disponible (estimable ~2.6B en SDXL estándar) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imágenes) |
| Tipos de cuantización | QNN (quantized para NPU Qualcomm) |
| Idiomas soportados | no disponible (solo prompts en inglés, típicamente) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | QNN (conversión desde safetensors) |

## Arquitectura y entrenamiento
El modelo es un merge de dos checkpoints de SDXL: NoobAI (especializado en anime) y Realistic (enfocado en realismo). El merge fue realizado por el usuario wind11, que publicó el checkpoint original en Civitai. Posteriormente, Ne-Norlag descargó el modelo y lo convirtió a QNN usando Local Dream, una herramienta que traduce pesos a formato optimizado para la NPU de Qualcomm. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de fine-tuning, ya que se trata de una fusión de modelos preexistentes. La conversión se realizó sin activar las banderas `v_pred` ni `realistic`, según la información del autor, lo que podría afectar la calibración del modelo.

## Capacidades
- Generación de imágenes realistas y estilo anime.
- Soporte para contenido NSFW (no apto para menores).
- Ejecución local en dispositivos móviles con Snapdragon 8 Gen 3, 8 Elite, 8 Gen 5 y 8 Elite Gen 5.
- Compatible con el pipeline `StableDiffusionXLPipeline` de Hugging Face.
- No incluye capacidades de visión, audio ni texto, ya que es exclusivamente un modelo de difusión de imágenes.

## Casos de uso
- Creación de arte digital en el móvil: permite generar ilustraciones de alta calidad directamente en el dispositivo sin depender de servicios en la nube.
- Prototipado rápido de imágenes para diseño: los desarrolladores pueden integrar la generación de imágenes en aplicaciones móviles para previsualizar conceptos.
- Contenido para redes sociales: generación de avatares o fondos personalizados con estilos variados (realista, anime).
- Herramientas de edición de fotos: el modelo puede usarse como base para inpainting o outpainting en aplicaciones de retoque.
- Aplicaciones de entretenimiento para adultos: su soporte NSFW lo hace útil para generación de contenido explícito en plataformas privadas.
- Evaluación de rendimiento de NPU: los desarrolladores pueden usar este modelo para medir la capacidad de la NPU de Qualcomm en tareas de inferencia de difusión.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor proporciona configuraciones empíricas: pasos de 25 a 35, CFG de 7 a 10, sampler Euler o Euler A, pero no se ofrecen métricas de calidad ni velocidad.

## Requisitos de hardware
- Requiere un dispositivo con Snapdragon 8 Gen 3, 8 Elite, 8 Gen 5 o 8 Elite Gen 5 (con NPU compatible).
- No se especifica VRAM, ya que el modelo está diseñado para ejecutarse en la NPU del chip, no en GPU.
- La inferencia se realiza en el dispositivo, sin necesidad de conexión a internet.
- Opciones de despliegue: exclusivamente mediante el pipeline QNN integrado en aplicaciones móviles (no compatible con vLLM, llama.cpp, etc.).
- Latencia y throughput no disponibles; dependerán del hardware concreto.

## Comparativa con modelos similares
| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nailove NoobAI Real SDXL (este) | SDXL | ~2.6B | n/a | creativeml-openrail-m | Hugging Face (QNN) |
| SDXL base | SDXL | ~2.6B | n/a | OpenRAIL++ | Hugging Face |
| SD 1.5 | UNet | ~0.9B | n/a | OpenRAIL++ | Hugging Face |
| NoobAI (original) | SDXL | ~2.6B | n/a | no disponible | Civitai |

La comparativa se basa en el checkpoint original, ya que la conversión QNN no altera los pesos. No se dispone de benchmarks para comparar rendimiento entre estas opciones.

## Limitaciones y advertencias
- El modelo está diseñado para generar contenido NSFW; debe usarse con responsabilidad y cumpliendo las leyes locales.
- Licencia `creativeml-openrail-m` permite uso comercial, pero el autor no se hace responsable del contenido generado.
- La conversión QNN puede perder precisión en comparación con el modelo original en GPU.
- Solo funciona en dispositivos con los chips Snapdragon especificados; no es portátil a otras arquitecturas.
- No se ha verificado la calidad del modelo en el contexto de producción; se recomienda probar antes de un despliegue serio.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Nez-Norlag/nailove-noobai-real-sdxl-merge-v03contrastes-sdxl_QNN2.28
- Modelo original de wind11: https://civitai.com/user/wind11 (fuente del checkpoint)
- Modelo base en Hugging Face (John6666): https://huggingface.co/John6666/nailove-noobai-real-sdxl-merge-v03contrastes-sdxl
- Herramienta de conversión Local Dream: https://github.com/xororz/local-dream
- Archivo de CivitAI: https://civarchive.com/models/1252962?modelVersionId=1412581
- PixAI: https://pixai.art/model/1861654486966379021
