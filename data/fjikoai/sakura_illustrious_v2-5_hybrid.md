# FjikoAI/SAKURA_Illustrious_v2.5_Hybrid

## Resumen

SAKURA_Illustrious_v2.5_Hybrid es un modelo de generación de imágenes texto-a-imagen desarrollado por FjikoAI (usuario también conocido como "ryo"). Se trata de un fine-tune del modelo base OnomaAIResearch/Illustrious-xl-early-release-v0, que a su vez es una variante de Stable Diffusion XL (SDXL) orientada a la generación de ilustración de estilo anime. El modelo se distribuye a través de Hugging Face en formato diffusers y ocupa 6,9 GB en el repositorio.

La propuesta del autor es un merge selectivo por bloques: en lugar de fusionar uniformemente todos los pesos de los modelos implicados, se han combinado únicamente los bloques profundos del U-Net, que son los que más influyen en la estructura facial y el detalle fino. Según la model card, esto busca equilibrar la estabilidad anatómica y la adherencia al prompt del modelo base con la expresividad facial de un modelo especializado en rostros.

Es relevante ahora porque se presenta como una evolución de SAKURA_Illustrious_Hybrid_V1.6 y como modelo hermano de MIKAN y RINGO, dentro de una familia de merges de Illustrious-XL publicada por el mismo autor. El modelo está etiquetado como NSFW y "not-for-all-audiences", y se publica bajo licencia CreativeML OpenRAIL-M. No se han publicado resultados de benchmarks ni métricas cuantitativas de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de difusión (SDXL) con fusión selectiva de bloques profundos; pipeline text-to-image |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (el repo se distribuye en formato diffusers; no se listan variantes GGUF ni fp8) |
| Idiomas soportados | no disponible (prompts en texto; la model card está en inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | diffusers (repo de 6,9 GB); VAE recomendado: sdxl_vae.safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SDXL: un U-Net de difusión latente con codificador de texto CLIP y un VAE. Sobre el checkpoint base Illustrious-xl-early-release-v0 (variante de SDXL especializada en anime), el autor ha aplicado una fusión por bloques ("block weights merging"): en lugar de mezclar todos los pesos de forma uniforme, solo se han integrado los bloques profundos del U-Net, que según la model card son los que más afectan a la estructura facial y al detalle fino. La fuente de esos bloques profundos es, según el autor, un modelo especializado en expresión facial.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF/DPO (no aplicables habitualmente en modelos de difusión de este tipo). Tampoco se detalla el proceso de merge (ratios exactos, herramientas empleadas) más allá de la descripción cualitativa de "ratios específicos" sobre bloques profundos. No se documentan innovaciones como decodificación especulativa ni atención lineal; se trata de un merge de pesos, no de un cambio arquitectónico.

## Capacidades

- Generación de imágenes texto-a-imagen en estilo anime/ilustración, compatible con flujos de trabajo estándar de Illustrious-XL y SDXL.
- Retratos de estilo asiático con sombreado de piel realista, texturas de labios, poros y ojos detallados, según la model card.
- Mejora declarada en el renderizado de manos, dedos y objetos sostenidos, reduciendo distorsiones estructurales en poses complejas.
- Expresividad facial reforzada mediante la incorporación de bloques profundos de un modelo especializado en expresiones.
- Compatible con el ecosistema diffusers y con pipelines SDXL (samplers, schedulers, CLIP skip, VAE externo).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo; es un modelo exclusivamente de imagen.

## Casos de uso

- Ilustración de personajes para cómics y webtoons: el modelo está ajustado para retratos de estilo asiático con detalle en piel, labios y ojos, lo que permite generar hojas de personaje y viñetas con expresividad facial consistente usando 25-35 pasos y CFG 3.5-6.5.
- Creación de arte conceptual para videojuegos de estética anime: la mejora declarada en manos y objetos sostenidos resulta útil para poses de acción y personajes con armas o props, donde los modelos SDXL genéricos suelen fallar.
- Generación de avatares y retratos para comunidades y plataformas: con CFG bajo (3.5-6.5) y el VAE sdxl_vae se obtienen retratos detallados que pueden integrarse en pipelines de generación por lotes mediante diffusers.
- Prototipado rápido de ilustraciones en estudios pequeños: al ser compatible con flujos Illustrious-XL/SDXL, se puede usar con los mismos nodos y ajustes (Euler a, CLIP skip 2) sin reentrenar ni reconfigurar el pipeline.
- Fine-tuning posterior y merges comunitarios: su licencia OpenRAIL-M y su formato diffusers permiten usarlo como base para nuevos merges o LoRAs dentro de la comunidad de Illustrious.
- Exploración de expresión facial en personajes: al incorporar bloques de un modelo especializado en expresiones, es adecuado para generar variaciones de emoción en un mismo personaje manteniendo la estructura anatómica del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño del repo (6,9 GB) y la arquitectura SDXL subyacente, se espera un consumo en el rango habitual de SDXL (aproximadamente 8-12 GB en fp16 según resolución y batch), aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por arquitectura, cabría esperar compatibilidad con GPUs de consumo tipo RTX 3060/4070/4090 y GPUs de datacenter (A100, H100) para lotes grandes, sin confirmación oficial.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del checkpoint es compatible con GPUs de consumo de gama media-alta en fp16, pero no hay datos oficiales de VRAM.
- Opciones de despliegue: diffusers (librería declarada en el repo). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión); para SDXL son habituales ComfyUI y Automatic1111, pero no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAKURA_Illustrious_v2.5_Hybrid (FjikoAI) | Illustrious-xl-early-release-v0 | Merge selectivo por bloques del U-Net | no disponible | creativeml-openrail-m | Hugging Face, TensorHub Art |
| Illustrious-xl-early-release-v0 (OnomaAIResearch) | SDXL | Checkpoint base anime | no disponible | no disponible en la información | Hugging Face |
| SAKURA_Illustrious_Hybrid_V1.6 (FjikoAI) | Illustrious-xl | Versión anterior del mismo linaje | no disponible | no disponible en la información | Hugging Face |
| MIKAN_Illustrious_v2.2_Hybrid (FjikoAI) | Illustrious-xl | Modelo hermano del mismo autor | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks, FID, preferencias humanas) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Contenido NSFW: el modelo está etiquetado explícitamente como `nsfw: true` y `not-for-all-audiences`; no es adecuado para entornos sin filtrado ni para uso con menores.
- Licencia CreativeML OpenRAIL-M: incluye restricciones de uso (cláusulas de uso aceptable) que deben revisarse antes de un despliegue comercial; no es una licencia permisiva sin condiciones.
- Riesgo de alucinación visual y distorsión anatómica: aunque el autor declara mejoras en manos y objetos, no hay métricas que lo respalden; persisten los fallos típicos de SDXL en poses complejas y composiciones con múltiples personajes.
- Sesgos: no documentados. Al ser un fine-tune de un modelo anime con estética "Asian-Style Portraits", es previsible un sesgo hacia rasgos y cánones estéticos concretos, sin que el autor lo analice.
- Idiomas: no se especifican; el rendimiento con prompts en castellano no está documentado y probablemente sea inferior al de prompts en inglés, dado el ecosistema SDXL/Illustrious.
- Cifras de VRAM, latencia y benchmarks no publicadas: cualquier estimación de producción debe validarse empíricamente.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria mínimos; la versión 2.5 se publicó y actualizó el mismo día (7 de noviembre de 2026), lo que sugiere un lanzamiento reciente y poco probado.
- Dependencia de un VAE externo (sdxl_vae.safetensors) y de ajustes concretos (Euler a, CLIP skip 2, CFG 3.5-6.5) para obtener los resultados previstos.

## Enlaces

- Hugging Face: https://huggingface.co/FjikoAI/SAKURA_Illustrious_v2.5_Hybrid
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Perfil del autor en Hugging Face: https://huggingface.co/FjikoAI/models
- Ficha en TensorHub Art: https://tensorhub.art/models/995211320452239314
- Imagen de portada de la model card: https://cdn-uploads.huggingface.co/production/uploads/68d789141aa476c348609d17/xK-qVvsIa4q428tFIqyAD.png
