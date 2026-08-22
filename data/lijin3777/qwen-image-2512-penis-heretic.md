# lijin3777/Qwen-Image-2512-Penis-Heretic

## Resumen

Qwen-Image-2512-Penis-Heretic es un modelo de difusión de texto a imagen derivado de Qwen-Image-2512 de Alibaba, especializado en la generación de imágenes explícitas de anatomía masculina y contenido yaoi (gay) sin censura. Desarrollado por el usuario lijin3777, el modelo fusiona el modelo base Qwen-Image-2512 con una LoRA específica para anatomía masculina y un text encoder modificado llamado "Heretic", una versión abliterada de Qwen2.5-VL-7B que elimina los filtros de contenido. El resultado es un sistema capaz de generar imágenes de alta resolución con un control detallado sobre escenas explícitas, dirigido a un nicho de creadores de contenido para adultos.

Con aproximadamente 20,4 mil millones de parámetros y un tamaño de repositorio de 57,7 GB, el modelo requiere hardware de gama alta para su ejecución. Se distribuye bajo licencia Apache-2.0 y se integra con la librería diffusers, lo que facilita su uso en pipelines estándar. Su relevancia radica en la experimentación con técnicas de abliteración y fusión de LoRA para generar contenido sin restricciones, aunque su uso está limitado a audiencias adultas y puede plantear riesgos legales y éticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (QwenImagePipeline) basado en Qwen-Image-2512, con LoRA fusionada y text encoder abliterado |
| Parametros totales | 20.430.401.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no texto) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo, sin versiones cuantizadas) |
| Idiomas soportados | No disponible (la model card no especifica idiomas; los prompts de ejemplo estan en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una fusion de tres componentes: el modelo base Qwen-Image-2512, una LoRA llamada "Qwen-Image-2512_Penis_lora_v2" y un text encoder "Heretic" (abliterated). El proceso de fusion se realizo mediante tecnicas de mezcla de pesos, aunque no se detalla el metodo exacto. El modelo base Qwen-Image-2512 es un modelo de difusion de tipo transformer, similar a otros modelos modernos como Stable Diffusion 3 o FLUX, con capacidad de generar imagenes de alta resolucion a partir de texto.

La LoRA fue entrenada durante 12.600 pasos en dos fases, segun la informacion de Civitai, y se centra en mejorar la proporcion y el detalle de la anatomia masculina. El text encoder "Heretic" es una version abliterada de Qwen2.5-VL-7B, que elimina los filtros de seguridad para permitir prompts explicitos. No hay informacion sobre el dataset completo de entrenamiento ni sobre el uso de RLHF o DPO. La model card incluye una guia para fine-tuning adicional con la herramienta ai-toolkit, usando configuraciones de LoRA con optimizador AdamW8bit y noise scheduler flowmatch.

## Capacidades

- Generacion de imagenes de alta calidad con contenido explicito de anatomia masculina y escenas yaoi.
- Soporte de prompts largos y detallados (el ejemplo de uso incluye descripciones de mas de 50 palabras).
- Uso de negative prompts para evitar artefactos como baja calidad, malas manos o censura.
- Control de resolucion de salida (el ejemplo usa 1056x1584).
- Integracion con la libreria diffusers, permitiendo cargar el modelo con `DiffusionPipeline.from_pretrained`.
- Posibilidad de fine-tuning adicional mediante LoRA con ai-toolkit.
- Text encoder abliterated que permite generar contenido sin restricciones de seguridad.
- No soporta vision ni audio, solo generacion de imagenes estaticas.

## Casos de uso

- **Generacion de arte erotico personalizado**: el modelo permite crear imagenes explicitas de tematica gay y yaoi con alto detalle anatomico, util para artistas digitales que buscan un control fino sobre el contenido.
- **Investigacion en modelos de difusion sin censura**: puede servir como caso de estudio para analizar el impacto de la abliteracion de text encoders en la calidad de la generacion y en la evasion de filtros de seguridad.
- **Desarrollo de aplicaciones para adultos**: los desarrolladores pueden integrar el modelo en plataformas de generacion de contenido para adultos, usando la API de diffusers y ajustando los parametros de generacion.
- **Fine-tuning para estilos especificos**: con la guia de entrenamiento incluida, se puede ajustar el modelo a estilos artisticos concretos (anime, realismo, etc.) mediante LoRA con datasets propios.
- **Pruebas de robustez de sistemas de moderacion**: el modelo puede usarse para evaluar la capacidad de filtros de contenido en otros sistemas, generando imagenes explicitas que podrian evadir filtros debiles.
- **Creacion de contenido para novelas visuales o juegos**: los desarrolladores de juegos con contenido adulto pueden usar el modelo para generar assets de personajes y escenas de forma rapida y controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay metricas como FID, CLIP score, ni comparaciones con otros modelos de generacion de imagenes. Tampoco se conocen datos de latencia o throughput de inferencia.

## Requisitos de hardware

- **VRAM estimada**: con pesos en bfloat16, se requieren aproximadamente 40 GB de VRAM solo para los parametros del modelo. Con el text encoder y el VAE, el total puede superar los 50 GB.
- **GPU recomendada**: NVIDIA A100 (80 GB) o H100 (80 GB) son adecuadas para inferencia sin offload. Una RTX 4090 (24 GB) no es suficiente en bf16; se necesitaria cuantizacion o usar `enable_model_cpu_offload()` para reducir el pico de VRAM, como se muestra en el ejemplo.
- **Opciones de despliegue**: se puede usar con diffusers en un entorno Python, o mediante servidores de inferencia como Hugging Face Inference Endpoints. No es compatible con llama.cpp (orientado a texto) ni con vLLM para imagenes.
- **Latencia y throughput**: no disponibles. Con 40 pasos de inferencia en una A100, se estima un tiempo de generacion de 30-60 segundos por imagen, similar a otros modelos de difusion de 20B parametros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2512 (base) | 20.4B | No aplica | No publicado | Apache-2.0 | Hugging Face |
| Qwen-Image-2512-Penis-Heretic (este) | 20.4B | No aplica | No publicado | Apache-2.0 | Hugging Face |
| Stable Diffusion XL | 3.5B | No aplica | FID, CLIP conocidos | Apache-2.0 | Hugging Face |
| FLUX (dev) | 12B | No aplica | FID, CLIP conocidos | Apache-2.0 | Hugging Face |

No hay datos objetivos de rendimiento para este modelo, por lo que la comparacion se limita a aspectos estructurales. La principal diferencia con los otros modelos es el enfoque en contenido explicito y la ausencia de filtros de seguridad.

## Limitaciones y advertencias

- **Contenido explicito**: el modelo genera imagenes sexualmente explicitas y pornograficas. No es adecuado para menores ni para entornos profesionales sin politicas de uso adecuadas.
- **Sesgos y alucinaciones**: aunque la LoRA mejora la anatomia, pueden aparecer artefactos en manos, ojos o proporciones, especialmente con prompts complejos.
- **Riesgo de uso indebido**: la generacion de contenido explicito sin consentimiento de las personas representadas (si se usan nombres o apariencias) puede ser ilegal. No hay mecanismos de verificacion de edad.
- **Restricciones de licencia**: aunque la licencia es Apache-2.0, la distribucion de contenido generado puede estar sujeta a leyes locales sobre pornografia. El modelo base Qwen-Image-2512 puede tener terminos adicionales no detallados.
- **Idiomas limitados**: no se especifican idiomas soportados; los prompts de ejemplo estan en ingles y es probable que el modelo funcione mejor en ese idioma.
- **Requisitos de hardware elevados**: no apto para GPUs de consumo sin cuantizacion o offload, lo que limita su uso en entornos de bajos recursos.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/lijin3777/Qwen-Image-2512-Penis-Heretic
- Modelo base Qwen-Image-2512: https://huggingface.co/Qwen/Qwen-Image-2512
- LoRA "Penis LoRa - Qwen Image 2512" en Civitai: https://civitai.red/models/2550440/penis-lora-qwen-image-2512
- Guia de entrenamiento ai-toolkit: https://github.com/ostris/ai-toolkit
- Repositorio alternativo del mismo modelo (Jommarn): https://huggingface.co/Jommarn/Qwen-Image-2512-Penis-Heretic
