# EmilyOfOz/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags-i1-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF con imatrix (matriz de importancia) del modelo **sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags**, realizada por mradermacher y republicada por EmilyOfOz. El modelo base es un fine-tuning de 27B parámetros (26.895.998.464 exactos) sobre la familia Qwen3.8, orientado a roleplay en japonés, generación de prompts para Stable Diffusion mediante etiquetas Danbooru y conversación sin restricciones (abliterated/uncensored). Se ha entrenado con datasets como dartags/danbooru-2408-blind-captions y Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted.

Su relevancia reside en la combinación de tres capacidades poco habituales en un mismo modelo: roleplay narrativo en japonés, generación de tags Danbooru para imagen y comportamiento sin filtros de alineamiento. La licencia Apache 2.0 del repositorio permite uso comercial, aunque el contenido del modelo está marcado explícitamente como "not-for-all-audiences". Los cuants disponibles van desde IQ1_S (7,2 GB) hasta Q6_K, cubriendo desde portátiles con poca VRAM hasta estaciones de trabajo con GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3.8); detalles concretos no disponibles |
| Parametros totales | 26.895.998.464 (≈27B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_1, IQ4_NL, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | japones (ja), ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuants con imatrix); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.8 con 27B parámetros densos (no se declara arquitectura MoE en la model card). Sobre ese modelo se aplicó un LoRA entrenado con Unsloth, técnica que permite fine-tuning eficiente en memoria mediante kernels optimizados y recompilación de grafos. El etiquetado "heretic" y "abliterated" indica que se han aplicado técnicas de eliminación de rechazos (abliteration), que modifican direcciones de activación asociadas a la negativa del modelo para eliminar su comportamiento de censura sin reentrenamiento completo.

El entrenamiento se apoyó en dos datasets: dartags/danbooru-2408-blind-captions (captions ciegas de imágenes Danbooru de agosto de 2024, útiles para generación de tags de Stable Diffusion) y Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted (20.000 ejemplos de roleplay en japonés generados sintéticamente con DeepSeek-V3). No se dispone de datos sobre el número total de tokens, hiperparámetros de entrenamiento ni uso de RLHF/DPO.

## Capacidades

- Roleplay conversacional en japonés, con soporte adicional de inglés y chino
- Generación de prompts y etiquetas Danbooru para Stable Diffusion (prompt engineering de imagen a partir de texto)
- Conversación general (tag "conversational"), sin filtros de rechazo por abliteration
- Contenido NSFW sin censura, al haber sido eliminadas las capas de alineamiento
- Soporte de visión: la model card del cuantizador indica que es un vision model y que los archivos mmproj están en el repositorio estático de mradermacher
- No se declara soporte de tool calling, function calling ni agentes en la información disponible

## Casos de uso

- **Roleplay interactivo en japonés**: el modelo puede sostener conversaciones de rol multi-turno en japonés gracias al dataset sintético de 20.000 ejemplos de roleplay; adecuado para chatbots de narrativa interactiva ejecutados localmente.
- **Generación de prompts para Stable Diffusion**: dado un escenario o descripción, el modelo genera etiquetas Danbooru coherentes que pueden inyectarse directamente en pipelines de generación de imagen (A1111, ComfyUI, Forge).
- **Asistente de tagging de imágenes**: combinando su capacidad de visión (mmproj) con el conocimiento de tags Danbooru, puede describir imágenes con vocabulario estandarizado de Danbooru para indexar datasets de arte.
- **Prototipado local de personajes de ficción**: creadores de novelas visuales o juegos pueden definir personajes y probar diálogos sin depender de APIs externas, ejecutando el modelo con llama.cpp en local.
- **Traducción y adaptación creativa entre japonés, inglés y chino**: útil para localizar guiones de roleplay manteniendo el tono narrativo.
- **Investigación sobre abliteration**: sirve como caso de estudio para analizar cómo la eliminación de rechazos afecta a la coherencia y calidad de un modelo de 27B.
- **Backends de frontends de roleplay**: compatible con SillyTavern u otros frontends compatibles con GGUF vía llama.cpp, permitiendo configurar tarjetas de personaje y memoria contextual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada según tamaño del cuant, sin contar KV cache):
  - IQ1_S/IQ1_M: 7,2-7,7 GB — cabe en GPUs de 8 GB
  - IQ2/Q2_K: 8,5-10,8 GB — GPUs de 12 GB
  - IQ3/Q3_K: 11,3-14,4 GB — GPUs de 16 GB
  - IQ4_XS/Q4_0/Q4_1: 15,2-16,5 GB aprox. — GPUs de 16-24 GB
  - Q5_K/Q6_K: 18-23 GB aprox. — GPUs de 24 GB
- GPU recomendadas: RTX 4090 (24 GB) para cuants Q5/Q6 con contexto amplio; RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuants IQ2-IQ4; Apple Silicon con 16-32 GB de memoria unificada también viable
- Cabe en consumer GPU: sí, con cuants IQ1_S a IQ4_XS según la VRAM disponible; para calidad razonable se recomienda al menos IQ3_M o IQ4_XS
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui; el formato GGUF con imatrix está pensado para el ecosistema llama.cpp
- Latencia y throughput: no disponibles; en un 27B denso con cuant Q4 sobre RTX 4090 cabe esperar del orden de 20-40 tokens/s, pero es una estimación no confirmada por el autor

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags (este) | 27B | GGUF (imatrix) | Apache 2.0 | Roleplay japonés, tags Danbooru, uncensored |
| Qwen3-30B-A3B (base oficial) | 30B (MoE, 3B activos) | safetensors/GGUF | Apache 2.0 | Uso general, mayor velocidad por MoE |
| Modelos roleplay japonés tipo ELYZA/Rinna (fine-tunes 7-14B) | 7-14B | safetensors/GGUF | Variable | Roleplay japonés sin especialización en tags Danbooru |

Nota: la comparativa es orientativa; el modelo de este repositorio destaca por su especialización en vocabulario Danbooru y su naturaleza abliterated, algo poco frecuente en modelos base de la familia Qwen.

## Limitaciones y advertencias

- Contenido NSFW sin censura: el repositorio está etiquetado como "not-for-all-audiences"; no es apto para entornos laborales ni para usuarios menores de edad
- La abliteration puede degradar la coherencia general, el razonamiento y la fiabilidad factual respecto al modelo base original
- Riesgo elevado de alucinación, agravado por el fine-tuning sobre datos sintéticos y captions ciegas de Danbooru
- Sin benchmarks publicados: no hay forma objetiva de evaluar su calidad frente a alternativas antes de probarlo
- Longitud de contexto no documentada: habrá que verificarla en la configuración del modelo base antes de planificar conversaciones largas
- Licencia Apache 2.0 permite uso comercial, pero el uso de contenido generado (especialmente NSFW) está sujeto a la legislación aplicable de cada jurisdicción
- Los cuants por debajo de IQ3 (IQ1/IQ2) tienen una pérdida de calidad notable según el propio cuantizador; evitarlos salvo restricciones extremas de VRAM
- Especialización fuerte en japonés: el rendimiento en castellano u otros idiomas no está garantizado ni documentado

## Enlaces

- Repositorio del cuant (este modelo): https://huggingface.co/EmilyOfOz/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags-i1-GGUF
- Modelo base: https://huggingface.co/sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags
- Repositorio estático GGUF (mradermacher): https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags-GGUF
- Página de descargas resumida: https://hf.tst.eu/model#Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags-i1-GGUF
- Dataset Danbooru captions: https://huggingface.co/datasets/dartags/danbooru-2408-blind-captions
- Dataset roleplay japonés: https://huggingface.co/datasets/Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted
- Guía de uso de GGUF referenciada: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
