# LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v14-FP8

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v14-FP8 es una cuantización en FP8 del modelo afinado por DavidAU a partir de la familia Qwen3.5, publicada por LTM-Lab. El resultado es un modelo multimodal de tipo image-text-to-text con 27.781 millones de parámetros, convertido a la arquitectura denominada V14 de memoria episódica (`Qwen3_5V14ForConditionalGeneration`) y servido mediante una imagen Docker modificada de SGLang. Su rasgo diferencial no es el tamaño, sino la incorporación de un almacén de memoria persistente en disco que sobrevive entre peticiones y reinicios del servidor.

El modelo base es un finetune "uncensored" (sin filtros de rechazo) sobre Qwen3.5-27B, con entrenamiento multi-etapa y técnicas que el autor etiqueta como Cold Fusion, GAIN Training y multi-stage tuning. Sobre esa base, la conversión añade un mecanismo de memoria que segmenta las claves y valores de atención en eventos de hasta 128 tokens, los persiste junto a un "engrama" de bajo rango del estado recurrente y los recupera por votación en peticiones posteriores, sin insertar texto en el prompt.

Es relevante ahora porque propone un patrón poco habitual en modelos abiertos: memoria episódica a nivel de servidor integrada en el propio modelo, no en una capa de orquestación externa. La cuantización FP8 reduce los pesos de 51 GB (bf16) a 28,5 GB, permitiendo servirlo en una única GPU de 96 GB con decodificación especulativa activa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y capas recurrentes Gated DeltaNet, más torre de visión y cabeza MTP; clase `Qwen3_5V14ForConditionalGeneration` con memoria episódica |
| Parámetros totales | 27.781.427.952 (27,78 B) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (E4M3 en bloques 128×128 con un factor bf16 por bloque, `weight_scale_inv`); pesos originales en bf16 |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (28,75 GiB de pesos en FP8; repo de 30,9 GB) |

## Arquitectura y entrenamiento

La arquitectura combina capas de atención clásica con capas recurrentes Gated DeltaNet, una torre de visión para entrada de imágenes y una cabeza MTP (multi-token prediction) usada para decodificación especulativa EAGLE. La cuantización FP8 afecta a 407 tensores: proyecciones q/k/v/o de atención, MLP, `in_proj_qkv`, `in_proj_z` y `out_proj` de Gated DeltaNet, y las del nivel MTP. Se mantienen en bf16 las embeddings, `lm_head`, todas las normalizaciones, `conv1d`, `in_proj_a`, `in_proj_b`, `mtp.fc` y la torre de visión, siguiendo la lista `modules_to_not_convert` de los lanzamientos FP8 oficiales de Qwen. El error relativo de Frobenius medio por peso cuantizado es del 2,65 % (máximo 2,648 %).

El mecanismo de memoria episódica funciona en dos pasadas: la primera lee el prompt y escribe en disco eventos de hasta 128 tokens con sus claves/valores y un engrama de bajo rango del estado recurrente; la segunda recupera, mediante una votación única para todas las capas y cabezas, los eventos cuyas claves atraerían la atención del prompt actual, compone sus engramas en el estado recurrente de la petición y relee el prompt con esas claves y valores fusionados en la atención. Además, durante la generación el modelo atiende al evento que su "modelo del mundo" predice como siguiente (`foresight`). El almacén se nombra a partir de los pesos, por lo que este directorio no comparte store con la conversión bf16. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta de los datasets (`DavidAU/Polar-STRICT-Datasets`, `DavidAU/F451-STRICT-Datasets`, `DavidAU/THE-DECKARD-Datasets`).

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia (`chat_template.jinja`) y plantilla adicional (`chat_template_fixed.jinja`).
- Entrada image-text-to-text: procesa imágenes junto a texto mediante la torre de visión, que se conserva en bf16.
- Razonamiento con modo thinking, compatible con el parser `qwen3-thinking` de SGLang.
- Tool calling / function calling, con parser `qwen3_coder`.
- Memoria episódica persistente entre peticiones y reinicios del servidor, con almacén en disco.
- Decodificación especulativa EAGLE con cabeza MTP (`model-mtp-restored.safetensors`).
- Capacidades multilingües en 16 idiomas: árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita.
- Comportamiento sin filtros de rechazo (uncensored), orientado a evitar negativas del modelo base.

## Casos de uso

- Asistentes conversacionales con memoria de usuario: el almacén episódico permite recordar hechos dichos en una conversación anterior y responderlos en una sesión nueva sin reinyectar historial en el prompt, lo que ahorra tokens de contexto.
- Atención al cliente multi-sesión: un agente puede recuperar incidencias previas del mismo cliente entre llamadas independientes al endpoint, apoyándose en la persistencia en disco del store.
- Análisis de documentos e imágenes en pipelines: la entrada image-text-to-text permite extraer información de capturas, diagramas o formularios junto a instrucciones textuales.
- Automatización con herramientas: el soporte de tool calling y el parser `qwen3_coder` lo hacen integrable en flujos de agentes que invocan APIs o ejecutan código.
- Investigación sobre memoria en LLM: sirve como banco de pruebas para estudiar recuperación por atención (en lugar de RAG textual), engramas de estado recurrente y el efecto de `foresight` en la generación.
- Generación de código asistida en entornos controlados: con decodificación especulativa y backend flashinfer, adecuado para autocompletado y refactorización en herramientas internas.
- Despliegue en una sola GPU para prototipos de investigación: al ocupar 28,5 GB en FP8, cabe en aceleradores de 48-96 GB sin necesidad de sharding.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Decode (bf16, SGLang modificado) | 48,5 tokens/s |
| Decode (FP8, SGLang modificado) | 71,5 tokens/s |
| Incremento de perplejidad frente a bf16 | +0,30 % |
| Error relativo de pesos cuantizados (Frobenius) | 2,65 % medio, 2,648 % máximo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras de decode corresponden a una RTX PRO 6000 Blackwell con los argumentos de servicio indicados por el autor.

## Requisitos de hardware

- VRAM: 28,5 GB de pesos en FP8; el autor indica una GPU de 96 GB y `--mem-fraction-static 0.78`, lo que implica reservar en la práctica buena parte de la memoria para KV cache y estado recurrente.
- GPU recomendadas: RTX PRO 6000 Blackwell (probada por el autor), A100 80 GB, H100 80 GB, H200.
- GPU de consumo: no cabe en RTX 4090 (24 GB) por el tamaño de pesos más caché; sí podría encajar en configuraciones de 48 GB con margen reducido, no verificado en la información disponible.
- Despliegue: exclusivamente SGLang mediante la imagen Docker `lovewin10/sglang-v14:nightly-dev-cu13-20260924-ffac53d7-v14`, con `--trust-remote-code`, backend de atención flashinfer, `linear-attn-backend triton`, `mamba-ssm-dtype float32` y decodificación especulativa EAGLE.
- Almacenamiento: directorio escribible montado para el store de memoria, que persiste entre reinicios.
- Throughput: 71,5 tokens/s en decode con FP8 frente a 48,5 tokens/s en bf16, en la configuración probada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Memoria persistente | Despliegue |
|---|---|---|---|---|---|
| LTM-Lab/Qwen3.8-27B-...-v14-FP8 | 27,78 B | no disponible | Apache 2.0 | Sí (en disco, entre peticiones) | SGLang modificado (Docker) |
| DavidAU/Qwen3.8-27B-...-v14 (bf16) | 27,78 B | no disponible | Apache 2.0 | Sí, formato bf16 | SGLang modificado (Docker) |
| Qwen/Qwen3.5-27B-FP8 | no disponible en la información | no disponible | Apache 2.0 | No | SGLang, vLLM, TGI |
| DavidAU/Qwen3.8-27B-...-ULTRA-HERETIC-Uncensored (base) | 27,78 B (implícito) | no disponible | Apache 2.0 | No | transformers, SGLang |

La comparación con la familia Qwen3.5-27B es la más directa por origen y formato de cuantización; la diferencia principal es el añadido de memoria episódica y el requisito de un runtime modificado. No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Requiere código remoto (`--trust-remote-code`) y una imagen Docker de SGLang modificada; no funciona con SGLang, vLLM o llama.cpp estándar según la información disponible.
- El store de memoria se nombra a partir de los pesos: no es compatible con el de la conversión bf16 ni viceversa, lo que complica migraciones.
- La recuperación por votación puede activar eventos parecidos aunque la pregunta no los requiera, alterando respuestas que deberían ser del modelo base; el autor lo advierte explícitamente.
- Modelo "uncensored": no incorpora filtros de rechazo, lo que implica riesgo de generar contenido inapropiado, dañino o no alineado en producción sin capas de moderación externas.
- Riesgo de alucinación no cuantificado; no hay benchmarks publicados que permitan estimarlo.
- La memoria persistente en disco plantea implicaciones de privacidad y retención de datos: la información de una conversación queda almacenada y puede recuperarse en otra sesión.
- Longitud de contexto no disponible; no se puede planificar el dimensionado de KV cache a partir de la información publicada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es un finetune de terceros y las condiciones de los datasets de entrenamiento (`Polar-STRICT`, `F451-STRICT`, `THE-DECKARD`) no se detallan.
- Métricas de adopción muy bajas (25 descargas, 0 likes) y publicación reciente (noviembre de 2026): no hay validación independiente del comportamiento del mecanismo de memoria.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v14-FP8
- Conversión bf16 v14: https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v14
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Referencia de formato FP8 de Qwen: https://huggingface.co/Qwen/Qwen3.5-27B-FP8
- Imagen Docker de SGLang modificada: https://hub.docker.com/r/lovewin10/sglang-v14
- Dataset Polar-STRICT: https://huggingface.co/datasets/DavidAU/Polar-STRICT-Datasets
- Dataset F451-STRICT: https://huggingface.co/datasets/DavidAU/F451-STRICT-Datasets
- Dataset THE-DECKARD: https://huggingface.co/datasets/DavidAU/THE-DECKARD-Datasets
