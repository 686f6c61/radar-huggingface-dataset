# cybertruck32489/lfm3-1.7b-flash

## Resumen

LFM3-1.7B-Flash es una variante optimizada para inferencia del modelo LFM3-1.7B de LiquidAI, publicada por el usuario cybertruck32489 en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un checkpoint base (LiquidAI/LFM3-1.7B) al que se le ha añadido un mecanismo de decodificación especulativa denominado "dflash", compuesto por una cabeza draft de 2 capas (Osprey), verificación mediante Best-First DDTree y lookup de sufijos/prompts. El objetivo es acelerar la generación greedy manteniendo paridad de salida respecto al modelo autorregresivo estándar.

El modelo base pertenece a la familia LFM3 de LiquidAI, orientada a despliegue en dispositivos edge, con arquitectura de tipo "liquid" (no un transformer denso convencional) y aproximadamente 1.869 millones de parámetros (1,87B) según los pesos safetensors. Soporta 16 idiomas (incluido el castellano) y está etiquetado para generación conversacional y tool calling.

La relevancia de esta ficha radica en que propone una vía práctica para reducir la latencia de un modelo pequeño sin cambiar el resultado: el autor declara paridad de decodificación greedy en tool calls, extracción estructurada, RAG local, automatización de navegador, prompts multilingües y prompts fuera de dominio. Al ser un finetune con código personalizado (`trust_remote_code=True`), requiere revisar el código remoto antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base LFM3 de tipo "liquid" (LiquidAI); finetune con cabeza draft Osprey de 2 capas y decodificación especulativa dflash |
| Parametros totales | 1.869.481.227 (~1,87B) según safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un modelo de la familia LFM3 de LiquidAI con arquitectura "liquid" (tipo SSM/estado recurrente híbrido según la familia, aunque la model card no detalla la composición interna). Sobre ese backbone, este checkpoint añade un mecanismo de decodificación especulativa: una cabeza draft Osprey de 2 capas que realiza drafting en una sola pasada, con tap layers del modelo objetivo en `[6, 12, 18, 23]` y capas draft en `[18, 22]`. La verificación se hace con Best-First DDTree (`max_tree_nodes=48` por defecto, `12` en perfil ligero) y con Suffix/Prompt Lookup (`min_match=4, max_len=10`).

El entrenamiento de la cabeza draft incluye dropout de tamaño de bloque: 75% con K=10 y 25% con K=6. Además, se emplea una shortlist de vocabulario de 48K reordenada por cabeza, con tokens especiales, de tool calling y de thinking al frente, y se permite slicing de la LM head a 16K/24K. No se proporcionan en la información disponible datos sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo RLHF/DPO. El checkpoint se carga con el flujo estándar de `transformers` usando `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` y se conmuta entre modo especulativo y autorregresivo con `use_dflash=True/False`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat (`apply_chat_template`) y conmutador `enable_thinking`.
- Tool calling / function calling: la model card incluye un ejemplo con definición de herramientas en formato JSON (`web_search`), lo que indica soporte de esquemas de funciones.
- Razonamiento multi-paso y agentes: el autor declara paridad greedy en tareas de tool calls, automatización de navegador y RAG local, escenarios típicos de pipelines agénticos.
- Extracción estructurada de información (structured extraction), según las evaluaciones de paridad mencionadas.
- Capacidades multilingües en 16 idiomas, incluidos castellano, inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Modo de pensamiento (thinking) con tokens dedicados en la shortlist del vocabulario.
- Aceleración de inferencia configurable: `dflash_k`, `max_tree_nodes`, `shortlist_limit` y conmutación a baseline autorregresivo.
- No se mencionan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con tool calling para consultar pedidos o bases de conocimiento, y el modo dflash reduce la latencia percibida en respuestas greedy; útil en despliegues edge donde el coste por token importa.
- Automatización de navegador y agentes web: la paridad declarada en browser automation y tool calls permite integrarlo como planificador de acciones que invoca funciones de búsqueda o clics, con verificación de árbol que mantiene la salida idéntica al baseline.
- Extracción estructurada de documentos: para convertir correos, facturas o formularios en JSON, la paridad greedy en structured extraction garantiza que la aceleración no altere el esquema de salida, lo que simplifica la validación en pipelines de ingestión.
- RAG local en dispositivos: con el perfil ligero (`dflash_k=6`, `max_tree_nodes=12`, `shortlist_limit=24576`) se puede desplegar un asistente de consulta sobre documentación interna en hardware modesto, reduciendo memoria de la LM head mediante slicing a 24K.
- Asistente multilingüe de soporte técnico: al cubrir castellano, inglés, alemán, francés, portugués y otros, sirve para triaje de tickets en equipos internacionales, con prompts en el idioma del usuario.
- Generación de código asistida en CI/CD: con tool calling puede invocar linters o APIs de repositorio en pipelines de revisión, usando el baseline autorregresivo (`use_dflash=False`) cuando se requiere reproducibilidad exacta frente a versiones anteriores.
- Moderación y clasificación de contenido conversacional: el modo thinking permite separar el razonamiento interno de la respuesta final, útil para auditar decisiones de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo declara paridad de decodificación greedy frente al baseline autorregresivo en las categorías evaluadas (tool calls, extracción estructurada, RAG local, automatización de navegador, prompts multilingües, tareas de persona/background y prompts fuera de dominio), sin cifras de speedup, throughput ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~1,87B parámetros en fp16 los pesos ocuparían aproximadamente 3,7 GB, a lo que hay que sumar la cabeza draft, la caché KV y overhead del runtime (estimación orientativa, no publicada por el autor).
- GPU recomendadas: no disponible; por tamaño, el modelo es apto para GPU consumer, pero el autor no publica lista de GPUs validadas.
- Cabe en GPU consumer: previsiblemente sí por tamaño (1,87B), aunque no se confirma en la información disponible.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, `device_map="auto"` y `dtype=torch.float16`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y el repo solo contiene safetensors.
- Latencia y throughput: no disponible; la model card no incluye cifras de speedup ni tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| cybertruck32489/lfm3-1.7b-flash | ~1,87B | no disponible | LFM Open License v1.0 | Hugging Face (custom_code) | Finetune con decodificación especulativa dflash sobre LFM3-1.7B |
| LiquidAI/LFM3-1.7B | ~1,7B (según nombre) | no disponible | LFM Open License v1.0 | Hugging Face | Modelo base oficial de LiquidAI |
| Alternativas de ~1-2B (p. ej. familias Qwen, Llama, SmolLM) | ~1-2B | no disponible en esta ficha | variables | Hugging Face | No se dispone de datos comparativos verificados en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- La licencia LFM Open License v1.0 impone condiciones específicas; debe revisarse el archivo LICENSE antes de cualquier uso comercial, ya que no es una licencia permisiva estándar.
- El modelo requiere `trust_remote_code=True` y contiene código personalizado (`custom_code`); es imprescindible auditar ese código antes de ejecutarlo en entornos de producción.
- La paridad declarada se limita a decodificación greedy con `do_sample=False` y `repetition_penalty=1.1`; con sampling, temperature u otros parámetros la paridad no está garantizada.
- No se publican cifras de speedup, latencia ni throughput, por lo que el beneficio real de dflash no puede verificarse con datos del autor.
- Riesgo de alucinación inherente a modelos pequeños de ~1,7B, especialmente en tareas de conocimiento factual y razonamiento matemático complejo; no hay benchmarks que acoten este riesgo.
- Longitud de contexto no documentada en la información disponible, lo que impide planificar cargas de contexto largo.
- No se listan sesgos conocidos ni evaluaciones de seguridad en la model card.
- Al ser un finetune de un tercero con 0 descargas y 0 likes, carece de validación comunitaria; conviene tratarlo como experimental.
- No se ofrecen pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en CPU o GPUs con poca VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cybertruck32489/lfm3-1.7b-flash
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia (referenciada en el repo): https://huggingface.co/cybertruck32489/lfm3-1.7b-flash/blob/main/LICENSE
- Logo del repo: https://huggingface.co/cybertruck32489/lfm3-1.7b-flash/resolve/main/logo.jpg
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
