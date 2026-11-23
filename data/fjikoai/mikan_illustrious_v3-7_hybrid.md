# FjikoAI/MIKAN_Illustrious_v3.7_Hybrid

## Resumen

MIKAN_Illustrious_v3.7_Hybrid es un modelo de difusion texto-a-imagen derivado de SDXL, construido sobre la base OnomaAIResearch/Illustrious-xl-early-release-v0 y publicado por el usuario FjikoAI. No es un modelo de lenguaje: es un checkpoint de generacion de imagenes orientado a ilustracion de estilo anime, con enfasis declarado en rasgos faciales de estetica este-asiatica y en una mayor flexibilidad de vestuario y pose respecto a versiones anteriores de la misma familia.

El modelo se distribuye en formato diffusers a traves de Hugging Face, con un tamano de repositorio de 6,9 GB, coherente con un checkpoint SDXL en precision fp16. La model card describe el uso de una tecnica de *Block Weight merging* para trasplantar la estructura facial de un modelo donante sobre la base Illustrious, preservando texturas e iluminacion del modelo base. El autor lo presenta como la variante centrada en renderizado y seguimiento de prompt dentro de su familia de modelos, frente a la hermana SAKURA, de base Pony.

La relevancia es acotada: se trata de un fine-tune comunitario con 9 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada sobre el dataset de ajuste. Su interes practico se limita a flujos de generacion de ilustracion anime con SDXL y a la experimentacion con tecnicas de merging por bloques.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion (SDXL / Illustrious-xl), pipeline text-to-image |
| Parametros totales | no disponible (checkpoint SDXL, ~2.600 M en UNet mas VAE y text encoders; cifra no publicada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; limitado por la longitud del prompt, ~75 tokens por bloque en CLIP) |
| Tipos de cuantizacion | no disponible (repo en diffusers; no se listan variantes GGUF ni fp8) |
| Idiomas soportados | no disponibles (prompts en ingles por convencion en SDXL; no declarado) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | diffusers (safetensors dentro de la estructura de pipeline) |
| Modelo base | OnomaAIResearch/Illustrious-xl-early-release-v0 |
| Tamano del repositorio | 6,9 GB |
| VAE recomendado | sdxl_vae.safetensors |
| CFG recomendado | 3,5 - 5,0 |
| Pasos de muestreo recomendados | 25 - 30 |
| Etiquetas de contenido | nsfw, not-for-all-audiences |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion XL: un UNet con bloques de atencion cruzada, doble text encoder (CLIP ViT-L y CLIP ViT-bigG) y un VAE para el espacio latente. Sobre esa base, el modelo parte de Illustrious-xl, un derivado de SDXL orientado a anime, y aplica un *Block Weight merging*: se combinan los pesos por bloques entre el modelo base y un modelo donante para transplantar el diseno facial sin degradar las texturas ni la iluminacion del base. La model card no especifica los ratios de mezcla, los bloques afectados ni la identidad del modelo donante.

No hay informacion publicada sobre el dataset de ajuste, el numero de imagenes empleadas, el uso de captions sinteticas, ni sobre si hubo etapas de fine-tuning adicionales tras el merge. Tampoco se documenta el uso de RLHF, DPO ni tecnicas equivalentes, algo que no aplica en el caso de modelos de difusion. La innovacion declarada es exclusivamente el esquema de merging por bloques para desacoplar identidad facial y flexibilidad de prompt, corrigiendo la "convergencia de concepto" y la rigidez de prompt de vestuario que el autor atribuye a las versiones hasta v2.2.

## Capacidades

- Generacion de imagenes texto-a-imagen en estilo ilustracion anime, con estetica este-asiatica suavizada segun el autor.
- Mayor flexibilidad de vestuario y pose respecto a versiones previas de la familia, segun la model card.
- Preservacion de texturas e iluminacion del modelo base gracias al esquema de merging por bloques.
- Generacion de contenido NSFW: el modelo esta etiquetado explicitamente como tal y marcado como no apto para todas las audiencias.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni ninguna capacidad de tipo LLM: es un modelo de difusion.
- No dispone de modo thinking, vision de entrada ni procesamiento de audio.
- Capacidad multilingue en prompts: no declarada; el comportamiento esperado es el de SDXL, con mejor seguimiento en ingles.

## Casos de uso

- Ilustracion de personajes para proyectos de fan art y doujin: el modelo esta afinado para rostros de estetica este-asiatica y permite variar vestuario sin que la identidad facial colapse, que es precisamente el fallo que el autor dice haber corregido en v3.7.
- Generacion de assets para novelas visuales y prototipado de personajes: con CFG 3,5-5,0 y 25-30 pasos se obtienen resultados estables en pocas iteraciones, adecuado para producir hojas de personaje y variaciones de vestuario.
- Pruebas de concepto de direccion de arte en estudios pequenos: al mantener texturas e iluminacion del base Illustrious, sirve para explorar paletas y esquemas de luz antes de encargar arte final.
- Experimentacion con tecnicas de merging: el checkpoint es un caso de estudio util para quien investigue *Block Weight merging* y quiera comparar el efecto de trasplantar bloques faciales sobre una base SDXL.
- Creacion de contenido para comunidades de Civitai: el autor mantiene una pagina en Civitai con versiones e imagenes de ejemplo, orientada a compartir y recibir feedback.
- Generacion de material NSFW en entornos controlados: el modelo esta etiquetado para ello, aunque su uso queda sujeto a las restricciones de la licencia CreativeML OpenRAIL-M y a la legislacion aplicable.
- Integracion en pipelines de difusion via diffusers: al publicarse en formato diffusers, puede cargarse con `DiffusionPipeline` y encadenarse con otros componentes (ControlNet, LoRA, upscalers) en flujos automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, evaluaciones humanas ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-10 GB en fp16 para SDXL a 1024x1024; en torno a 6-8 GB con cuantizacion fp8 o con offloading parcial a CPU.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para generacion a 1024x1024 sin offloading y con buen throughput.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en tarjetas de 8 GB requiere `enable_model_cpu_offload` o `enable_sequential_cpu_offload`.
- Opciones de despliegue: diffusers (formato nativo del repo), ComfyUI y Automatic1111/Forge (convirtiendo el checkpoint a formato single-file safetensors), y servidores de inferencia compatibles con SDXL.
- Latencia y throughput estimados: no disponibles; dependen del sampler, los pasos (25-30 recomendados) y la GPU. Como referencia orientativa de SDXL, decenas de iteraciones por minuto en una RTX 4090 a 1024x1024, sin datos medidos para este checkpoint concreto.
- VAE: se recomienda usar sdxl_vae.safetensors de forma explicita.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MIKAN_Illustrious_v3.7_Hybrid | Illustrious-xl (SDXL) | no disponible (~2.600 M UNet) | no aplica | sin benchmarks publicados | creativeml-openrail-m | Hugging Face, Civitai |
| OnomaAIResearch/Illustrious-xl-early-release-v0 | SDXL | no disponible | no aplica | sin benchmarks en esta ficha | no disponible en la informacion | Hugging Face |
| SAKURA (modelo hermano del mismo autor) | Pony | no disponible | no aplica | sin benchmarks publicados | no disponible en la informacion | Civitai |
| Stable Diffusion XL base | SDXL | ~2.600 M UNet | no aplica | benchmarks publicos de SDXL en la literatura original | CreativeML OpenRAIL++-M | Hugging Face, diffusers |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible: no hay metricas publicadas para este checkpoint ni para sus hermanos. La diferencia funcional declarada por el autor es que MIKAN se centra en renderizado y seguimiento de prompt (base Illustrious), mientras que SAKURA se centra en color y presencia fisica (base Pony).

## Limitaciones y advertencias

- Sesgos conocidos: al estar afinado sobre Illustrious con enfasis en estetica este-asiatica, el modelo puede reproducir sesgos de representacion en rasgos faciales, tonos de piel y tipos corporales, y presentar dificultades con otras etnias o edades.
- Riesgo de alucinacion visual: como todo modelo de difusion, genera detalles plausibles pero incorrectos (manos, texto, arquitectura, objetos); no hay garantia de fidelidad al prompt.
- Contenido NSFW: el checkpoint esta etiquetado como NSFW y marcado `not-for-all-audiences`; requiere filtros y controles de acceso en cualquier despliegue publico.
- Limitaciones de idioma: no se declaran idiomas soportados; el seguimiento de prompts en castellano no esta verificado y previsiblemente sera inferior al de ingles.
- Restricciones de licencia: CreativeML OpenRAIL-M impone restricciones de uso (prohibicion de usos daninos y de ciertas aplicaciones descritas en el anexo de la licencia) y obliga a propagar las mismas restricciones a los derivados. Revisar el texto completo antes de uso comercial.
- Falta de documentacion: no se detallan dataset, ratios de merge, modelo donante ni evaluaciones; la reproducibilidad del checkpoint es baja.
- Madurez: 9 descargas y 0 likes en el momento de la consulta; sin validacion independiente de la comunidad.
- Aviso temporal: la fecha de creacion registrada (2026-09-02) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio; conviene verificarlo antes de citar el modelo.
- No apto para tareas de NLP: no debe emplearse para generacion de texto, codigo, razonamiento ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FjikoAI/MIKAN_Illustrious_v3.7_Hybrid
- Pagina en Civitai: https://civitai.com/models/2584630/mikanillustrioushybrid?modelVersionId=3483481
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Imagen de portada de la model card: https://cdn-uploads.huggingface.co/production/uploads/68d789141aa476c348609d17/psIjTfE7cYsFQPB6EqHBo.png
- Imagen de ejemplo de la model card: https://cdn-uploads.huggingface.co/production/uploads/68d789141aa476c348609d17/4F9jU8eE1EYBjUbcn_-dW.png
- Texto de la licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Documentacion de diffusers: https://huggingface.co/docs/diffusers
