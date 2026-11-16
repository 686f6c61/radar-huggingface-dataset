# LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v15-FP8

## Resumen

LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v15-FP8 es una conversión a FP8 de un fine-tune comunitario sobre una base Qwen, publicada por LTM-Lab. El modelo parte de DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored y añade una arquitectura modificada denominada V15, orientada a memoria episódica persistente entre peticiones. Cuenta con 27.781.427.952 parámetros y un repositorio de 30,9 GB.

La propuesta diferencial no es el ajuste de pesos, sino el sistema de memoria: las claves y valores calculados por las capas de atención se segmentan en eventos de hasta 128 tokens y se almacenan en disco junto con un engram de baja dimensión del estado recurrente. En peticiones posteriores, el modelo recupera esos eventos mediante una votación única para todas las capas y cabezas, compone los engrams en el estado recurrente y relee el prompt con las claves y valores recuperados fusionados en la atención. Nada se recupera como texto ni se inyecta en el prompt.

El modelo se sirve con una imagen Docker de SGLang modificada y soporta modalidad image-text-to-text, decodificación especulativa con cabeza MTP y cuantización FP8 en formato compatible con las publicaciones oficiales de Qwen. La licencia es Apache 2.0 y cubre 16 idiomas. Es relevante para quienes investigan memoria de largo plazo en LLM sin reentrenamiento, aunque su ecosistema de despliegue es muy específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con capas Gated DeltaNet y arquitectura de memoria V15 (`Qwen3_5V15ForConditionalGeneration`); incluye torre de visión y cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3 en bloques de 128×128 con un factor bf16 por bloque, `weight_scale_inv`); pesos sensibles en bf16 |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP8); repo de 30,9 GB frente a 51 GB en bf16 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 27,8 mil millones de parámetros que combina capas de atención con capas Gated DeltaNet (estado recurrente lineal) y una torre de visión, lo que habilita la modalidad image-text-to-text. La conversión a FP8 aplica cuantización E4M3 en bloques de 128×128 a 407 tensores: proyecciones q/k/v/o de atención, MLP, `in_proj_qkv`, `in_proj_z` y `out_proj` de Gated DeltaNet, y las de la capa MTP. Se mantienen en bf16 los embeddings, `lm_head`, todas las normas, `conv1d`, `in_proj_a`, `in_proj_b`, `mtp.fc` y la torre de visión, siguiendo la lista `modules_to_not_convert` de Qwen.

No se ha entrenado ni fusionado nada en esta conversión: los pesos FP8 son idénticos byte a byte a los de la versión V14 FP8 del mismo proyecto. La innovación está en la capa de memoria episódica, implementada en `configuration_qwen_dense_v15.py` y `modeling_qwen_dense_v15.py`, con opciones en `qwen_dense_v15_memory_config` dentro de `config.json`. Respecto a V14 se elimina el "world model" (predictores pequeños ajustados al almacén, que según el autor no aportaban mejora medible) y se añade la función de "sueño": cuando el servidor lleva 10 minutos sin peticiones, el propio modelo, vía su API, reproduce los eventos nuevos, fusiona duplicados, evalúa si un hecho nuevo sustituye a uno antiguo y crea puentes entre notas sobre la misma entidad. Los sueños y juicios no se escriben en memoria ni se borra nada. El fine-tune original emplea datasets de DavidAU (Polar-STRICT, F451-STRICT, THE-DECKARD) y técnicas etiquetadas como Cold Fusion, GAIN Training y multi-stage tuning con Unsloth.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia (`chat_template.jinja` y `chat_template_fixed.jinja`).
- Procesamiento image-text-to-text gracias a la torre de visión incluida.
- Memoria episódica persistente entre peticiones y reinicios del servidor, almacenada en disco.
- Recuperación por atención: los eventos almacenados se reinyectan como claves y valores, no como texto en el prompt.
- Consolidación de memoria en reposo mediante reproducción, fusión, corrección y creación de puentes entre notas.
- Decodificación especulativa mediante la cabeza MTP (`model-mtp-restored.safetensors`).
- Soporte de CUDA graph y caché de prefijos en el servidor SGLang modificado.
- Capacidades multilingües en 16 idiomas.
- Fine-tune "uncensored" y "heretic", orientado a reducir rechazos del modelo base.
- No se documenta soporte explícito de tool calling ni de razonamiento multi-paso en la información disponible.

## Casos de uso

- Asistentes con memoria de usuario a largo plazo: el almacén en disco permite que lo dicho en una conversación se recupere en otra sesión separada, sin reenviar historial en el prompt.
- Atención al cliente multi-sesión: un agente puede recordar incidencias previas de un cliente entre llamadas distintas y consolidarlas durante periodos de inactividad mediante la función de sueño.
- Investigación sobre memoria en LLM: sirve como banco de pruebas para evaluar recuperación por atención frente a RAG textual, ya que los eventos se reinyectan como claves y valores.
- Experimentación con cuantización FP8: permite medir el impacto de FP8 E4M3 por bloques en un modelo de 27,8B con capas híbridas de atención y estado recurrente.
- Procesamiento de documentos con imagen: la modalidad image-text-to-text permite extraer y discutir contenido visual en flujos conversacionales.
- Despliegue de agentes conversacionales personalizados: el ajuste "uncensored" y la licencia Apache 2.0 facilitan prototipos en dominios donde el modelo base rechazaría contenido.
- Evaluación de decodificación especulativa: la cabeza MTP incluida permite medir aceleraciones en SGLang con CUDA graph y caché de prefijos activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 28,5 GB, por lo que se necesita al menos una GPU con 32 GB o más, dejando margen para caché KV, estados recurrentes y memoria episódica.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB; en consumer, RTX 4090 24 GB resulta insuficiente para los pesos completos en FP8.
- No cabe en GPUs de consumo de 24 GB o menos sin cuantización adicional no documentada.
- Despliegue: exclusivamente mediante la imagen Docker `lovewin10/sglang-v15:nightly-dev-cu13-20260924-ffac53d7-v15` (SGLang modificado). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- La memoria episódica requiere esa imagen concreta; la librería `transformers` aparece como dependencia pero no se detalla un flujo de inferencia estándar.
- Latencia y throughput: no disponibles. El autor menciona que CUDA graph, caché de prefijos y decodificación especulativa permanecen activos, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| LTM-Lab/Qwen3.8-27B-...-v15-FP8 | 27,8B | no disponible | Apache 2.0 | SGLang modificado (Docker) | Memoria episódica V15, FP8, visión |
| LTM-Lab/Qwen3.8-27B-...-v14-FP8 | 27,8B | no disponible | Apache 2.0 | SGLang modificado (Docker) | Pesos idénticos; incluye world model, sin sueño |
| LTM-Lab/Qwen3.8-27B-...-v15 (bf16) | 27,8B | no disponible | Apache 2.0 | SGLang modificado (Docker) | Misma arquitectura V15 en bf16, 51 GB |
| Qwen/Qwen3.5-27B-FP8 | 27B (aprox.) | no disponible | no disponible | Ecosistema Qwen estándar | Referencia de formato FP8 citada por el autor |

## Limitaciones y advertencias

- El modelo base es un fine-tune comunitario "uncensored" y "heretic": cabe esperar menor alineación de seguridad y mayor probabilidad de contenido dañino o sesgado.
- Riesgo de alucinación no evaluado; no hay benchmarks publicados que cuantifiquen fiabilidad.
- La recuperación de memoria puede fallar: el autor advierte que una pregunta sin coincidencias en el almacén recupera poco o nada, pero un evento meramente parecido puede pasar la votación.
- La función de sueño puede fusionar o corregir notas de forma incorrecta; aunque no borra datos, las decisiones de sustitución las toma el propio modelo.
- El almacén de memoria se nombra según los pesos y la arquitectura: este directorio abre un almacén propio, incompatible con los de V14 o bf16.
- Dependencia crítica de una imagen Docker no oficial de SGLang; no hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, lo que limita portabilidad y mantenimiento.
- Longitud de contexto no documentada, lo que impide planificar cargas con prompts largos.
- Cero descargas y cero likes en Hugging Face en la fecha de creación: sin validación externa de la comunidad.
- El modelo se publicó el 16 de noviembre de 2026; la información disponible es únicamente la model card del autor.
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento "uncensored" traslada al operador la responsabilidad sobre el contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v15-FP8
- Versión V14 FP8: https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v14-FP8
- Versión V15 bf16: https://huggingface.co/LTM-Lab/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored-v15
- Modelo base (fine-tune): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Referencia de formato FP8 de Qwen: https://huggingface.co/Qwen/Qwen3.5-27B-FP8
- Imagen Docker SGLang modificada: https://hub.docker.com/r/lovewin10/sglang-v15
