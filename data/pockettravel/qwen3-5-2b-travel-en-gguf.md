# pockettravel/qwen3.5-2b-travel-en-GGUF

vacio en el prompt."

Good. Need maybe mention "Unsloth" etc.

Capacidades bullets:
- Generacion de texto extractiva en ingles basada exclusivamente en el contexto proporcionado.
- Responde en un maximo de tres frases.
- Rechazo explicito cuando el contexto esta vacio, es off-topic o no cubre la pregunta.
- Preguntas sobre guias de paises y ciudades: historia, clima, cultura, cocina, telecomunicaciones, medios.
- Consultas practicas de viaje: moneda, capital, prefijo telefonico, lado de circulacion, numeros de emergencia, vacunas.
- Preguntas "que hay cerca de mi" usando el bloque de puntos de interes cercanos.
- Consultas sobre proximas salidas usando el bloque de departures.
- Consultas sobre distancias entre ciudades.
- Integracion en app Android offline con SQLite FTS, sin conexion.
- No soporta tool calling ni function calling (no mencionado en la informacion disponible).
- No soporta agentes ni razonamiento multi-paso (no mencionado).
- No soporta vision ni audio en este fine-tune GGUF, aunque el modelo base se describe como multimodal en la informacion de busqueda.
- Multilingue: no; solo ingles.
- Modo thinking: desactivado en entrenamiento; debe ejecutarse con enable_thinking=False.
- No es un chatbot general ni una fuente de conocimiento autonomo; sin contexto debe negarse.

Casos de uso: 8 bullets with explanation.

Benchmarks table: include all metrics. Note: "Refusal rates: higher is better on the first block, lower is better on the second." We'll indicate.

Rows:
| Metrica | Este modelo | Modelo base (Qwen3.5-2B) |
| Rechaza cuando el contexto esta vacio | 100% | 100% |
| Rechaza preguntas off-topic | 100% | 92,7% |
| Rechaza preguntas parafraseadas de pais cuyo tema falta en el contexto | 95,1% | 65,9% |
| Rechaza preguntas de ciudad cuyo tema falta en la pagina | 75% | 50% |
| Rechaza preguntas de historia o clima de ciudad no cubiertas por el contexto | 100% | 100% |
| Rechaza preguntas "que hay cerca de mi" sin lugar cercano coincidente | 100% | 50% |
| Rechaza preguntas de salidas sin salida coincidente | 100% | 50% |
| Rechaza incorrectamente preguntas de pais respondibles | 5,9% | 12,6% |
| Rechaza incorrectamente preguntas de ciudad respondibles | 0% | 16% |
| Rechaza incorrectamente preguntas de historia o clima de ciudad respondibles | 0% | 0% |
| Rechaza incorrectamente preguntas "que hay cerca de mi" respondibles | 21,4% | 7,1% |
| Rechaza incorrectamente preguntas de salidas respondibles | 7,1% | 21,4% |

Note: base model evaluated as unsloth/Qwen3.5-2B-GGUF UD-Q4_K_XL. Greedy decoding, same questions and prompt. Test set 584 questions, 11 countries.

Requisitos hardware bullets:
- Archivo GGUF de 1.215 MiB (Q4_K_M con imatrix).
- Memoria en uso medida con llama.cpp en CPU: aproximadamente 1,9 GiB, incluyendo pesos, copia CPU de pesos repackeados, KV cache y buffers de computo, con contexto 4096, batch 512 y KV cache f16.
- RAM sugerida para el dispositivo: 6 GB o mas. Con unos 0,4 GB para la app, modelo y app ocupan aproximadamente el 40% o menos de esa RAM.
- En el ejemplo de despliegue se usa contexto 8192 con llama-server.
- GPU recomendadas: no disponible. No se proporciona una lista de GPU.
- Cabe en GPU consumer: por la memoria en uso (~1,9 GiB), es teoricamente ejecutable en GPU consumer con 3 GB o mas de VRAM, pero no hay datos de rendimiento en GPU en la informacion proporcionada. El autor lo ha medido y orientado a CPU en Android.
- Opciones de despliegue: llama.cpp / llama-server con GGUF. El autor muestra: llama-server -m qwen3.5-2b-travel-en-Q4_K_M.gguf -c 8192 --chat-template-kwargs '{"enable_thinking": false}'. Otros runtimes GGUF como Ollama no se mencionan en la informacion proporcionada.
- Latencia y throughput: no disponible.

Comparativa:
| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque | Rendimiento en rechazo |
| qwen3.5-2b-travel-en-GGUF | 1,88 B | 8192 tokens en ejemplo; 4096 en medicion | Q4_K_M imatrix | cc-by-sa-4.0 | RAG de viajes offline en ingles | Mejores tasas de rechazo en casi todos los grupos; peor falso rechazo en "que hay cerca de mi" (21,4% vs 7,1%) |
| Qwen/Qwen3.5-2B base (unsloth GGUF UD-Q4_K_XL) | 1,88 B | no disponible | UD-Q4_K_XL | no disponible | Modelo general multimodal segun la informacion de busqueda | Menores tasas de rechazo en varios grupos, pero con respuestas desde conocimiento propio o texto no relevante cuando no rechaza |
Maybe third: "No se han identificado otros modelos comparables de viajes offline en la informacion proporcionada." So say "Otras alternativas: no disponible".

Limitaciones:
- Entrenado y evaluado solo en ingles. No hay soporte multilingue declarado para este fine-tune.
- No es un chatbot general ni una fuente de conocimiento: sin contexto debe negarse a responder; su uso fuera de RAG de viajes produce respuestas poco fiables.
- Riesgo de alucinacion si se usa sin contexto o si el contexto es insuficiente, aunque el entrenamiento incluye aproximadamente un 21% de ejemplos de rechazo.
- Limite de respuesta: maximo tres frases.
- Contextos de entrenamiento de hasta 2000 caracteres; el autor recomienda contexto 4096 o 8192 tokens en inferencia.
- Tasas de falso rechazo: 21,4% en preguntas respondibles de "que hay cerca de mi" y 7,1% en preguntas respondibles de salidas; 5,9% en preguntas respondibles de pais.
- Sesgos potenciales derivados de las fuentes: Wikivoyage y Wikipedia en ingles, consejos oficiales de Canada y Reino Unido, traduccion automatica de Wikivoyage italiano, datos de Wikidata. Puede reflejar sesgos geograficos, culturales y de actualidad de esas fuentes.
- Licencia cc-by-sa-4.0: uso comercial permitido con atribucion y compartir bajo la misma licencia las obras derivadas; revisar compatibilidad con el modelo base Qwen3.5-2B, cuya licencia no se detalla en la informacion proporcionada.
- Debe ejecutarse con el pensamiento desactivado (enable_thinking=False); si se activa, el comportamiento puede degradarse.
- No se menciona soporte de tool calling, function calling, agentes, vision ni audio en este fine-tune GGUF.
- No hay datos de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion proporcionada; solo la evaluacion especifica de RAG de viajes.

Enlaces:
- HuggingFace del modelo: https://huggingface.co/pockettravel/qwen3.5-2b-travel-en-GGUF
- Perfil de pockettravel: https://huggingface.co/pockettravel
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- GGUF base de unsloth: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Repositorio de la app Pocket Travel: https://github.com/miracle091/pocket-travel
- Dataset de preguntas de viaje: https://huggingface.co/datasets/soniawmeyer/travel-conversations-finetuning (infer from "soniawmeyer/travel-conversations-finetuning" but full URL maybe not given. We can write the identifier, but requested enlaces. We can say "https://huggingface.co/datasets/soniawmeyer/travel-conversations-finetuning" though it's an inference. Is it safe? The info says "real travel questions from soniawmeyer/travel-conversations-finetuning". Likely HF dataset. We can put with "identificador proporcionado". But to avoid inventing URL, write "soniawmeyer/travel-conversations-finetuning (identificador proporcionado en la model card; URL no disponible)". Better. But they asked enlaces. We can include as text. Maybe "Dataset de preguntas reales de viaje: soniawmeyer/travel-conversations-finetuning (identificador; URL completa no proporcionada)".
- MarianMT: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-it-en
- Wikivoyage: https://www.wikivoyage.org/ (inferred, but not provided. Better avoid? The model card mentions Wikivoyage but no URL. We can include https://www.wikivoyage.org but that's general knowledge. Is that inventing? It's a known site. But to be safe, maybe "Wikivoyage (mencionado en la model card; URL no proporcionada)". But enlaces section should be enlaces. Hmm. We can include known official URLs? The instruction says "todos los enlaces relevantes encontrados en la busqueda web". The search results gave: HF pockettravel, Qwen model, aimodels.fyi, Qualcomm AI Hub, betterstack. Also model card gave GitHub, HF base, unsloth, MarianMT. We can list those. For travel.gc.ca, gov.uk, these are domains mentioned. We can include https://travel.gc.ca and https://www.gov.uk. Wikimedia dumps maybe https://dumps.wikimedia.org but not explicitly URL. Better list only URLs explicitly present or clearly derivable from search results. Search results provided URLs:
- https://huggingface.co/pockettravel
- https://huggingface.co/Qwen/Qwen3.5-2B
- https://www.aimodels.fyi/models/huggingFace/qwen3.5-2b-gguf-unsloth
- https://aihub.qualcomm.com/models/qwen3_5_2b
- https://betterstack.com/community/guides/ai/qwen-35/
Model card URLs:
- https://github.com/miracle091/pocket-travel
- https://huggingface.co/Qwen/Qwen3.5-2B (duplicate)
- https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- https://huggingface.co/pockettravel/qwen3.5-2b-travel-en-GGUF (the model itself)
- Helsinki-NLP/opus-mt-tc-big-it-en (no full URL but likely https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-it-en). We can include full.
- travel.gc.ca, gov.uk (domains)
- Wikidata
- Wikimedia dumps
- soniawmeyer/travel-conversations-finetuning

We'll list them with full URLs where available, and note "identificador".

Now ensure only first word of titles capital. "Especificaciones tecnicas" - "tecnicas" lowercase. "Arquitectura y entrenamiento" - "y" lowercase. "Capacidades" etc. Good. But inside table headers, "Parametro" and "Valor" - first word capital? It's a table, can capitalize first word only. Fine.

No emojis. No text outside Markdown. Let's produce. Need ensure no "### Informacion" etc. Just ficha.

Check for typos: "España" etc. But content in Spanish. Use "castellano de España". Avoid "máximo" with accent? Yes. "técnicas" with accent. "parámetros" with accent. "tamaño" with ñ. Good.

Potential issue: "Gated Delta Networks" maybe should be "Gated Delta Networks" not translated. Fine.

Potential issue: "Mixture-of-Experts" maybe. Fine.

Potential issue: "modelo base Qwen3.5-2B" - search result says "unsloth" but it's Qwen model. Fine.

Potential issue: The model card says "Qwen3.5 is a thinking model: thinking was disabled in training". So mention.

Potential issue: "base_model:finetune:Qwen/Qwen3.5-2B" tag.

Now final.## Resumen
qwen3.5-2b-travel-en-GGUF es un ajuste fino LoRA de Qwen/Qwen3.5-2B, desarrollado por pockettravel y publicado en HuggingFace con licencia cc-by-sa-4.0 en formato GGUF. Está diseñado como asistente de viaje offline para la aplicación Android Pocket Travel: responde en inglés, en un máximo de tres frases, usando exclusivamente el CONTEXTO de guías Wikivoyage que la app inserta en el prompt, y declara explícitamente cuando ese contexto no contiene la respuesta. El repositorio ocupa 1,3 GB e incluye un único archivo GGUF Q4_K_M con importance matrix (imatrix) de 1.215 MiB. Los parámetros totales son 1.881.825.088 (aproximadamente 1,88 mil millones).

El modelo base Qwen3.5-2B, según la información de búsqueda, es un transformer causal de 24 capas con 2048 dimensiones ocultas, arquitectura híbrida de Gated Delta Networks con Mixture-of-Experts disperso y capacidades multimodales nativas. Sin embargo, este fine-tune es texto a texto, solo inglés, y no está pensado como chatbot general ni como fuente de conocimiento: sin contexto debe negarse a responder. La model card reporta una evaluación sobre 584 preguntas de 11 países no vistos en entrenamiento, con tasas de rechazo y de falsos rechazos comparadas con el modelo base.

La relevancia actual radica en su enfoque de RAG totalmente offline en dispositivo: con unos 1,9 GiB de memoria en uso y una recomendación de 6 GB de RAM, permite búsqueda y respuesta sobre guías descargadas sin conexión, un caso de uso creciente para viajeros.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de 24 capas con 2048 dimensiones ocultas, arquitectura híbrida de Gated Delta Networks con Mixture-of-Experts disperso (según la información de búsqueda sobre el modelo base Qwen3.5-2B); fine-tune LoRA fusionado |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 B) |
| Parametros activos | no disponible (la arquitectura base se describe como MoE disperso, pero no se especifica el número de parámetros activos en la información proporcionada) |
| Longitud de contexto | 8192 tokens en el ejemplo de llama-server; 4096 tokens en las mediciones de memoria de la model card; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q4_K_M con importance matrix (imatrix); único archivo GGUF publicado |
| Idiomas soportados | Inglés (fine-tune entrenado y evaluado en inglés); el modelo base Qwen3.5-2B se describe como multilingüe en la información de Qualcomm AI Hub, pero este fine-tune no declara soporte multilingüe |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del archivo GGUF | 1.215 MiB |
| Memoria en uso | aproximadamente 1,9 GiB (medida con llama.cpp en CPU, contexto 4096, batch 512, KV cache f16) |
| RAM sugerida para el dispositivo | 6 GB o más |
| Modelo base | Qwen/Qwen3.5-2B |

## Arquitectura y entrenamiento
El fine-tune se realizó con LoRA de 16 bits usando Unsloth, fusionado en los pesos base, durante 1 época. La pérdida se calculó solo sobre los tokens de respuesta y se ponderó por categoría de pregunta. Se usaron 40.935 pares pregunta/respuesta sintéticos con respuestas extractivas, de los cuales aproximadamente el 21% son ejemplos de rechazo. Los datos proceden de los volcados de Wikimedia del 1 de octubre de 2026: Wikivoyage en inglés (páginas de países y ciudades, limpiadas con el mismo código que las guías de la app), Wikipedia en inglés (artículos de países sobre cocina, cultura, telecomunicaciones y medios; historia y clima de ciudades), secciones del Wikivoyage en italiano traducidas automáticamente al inglés con MarianMT Helsinki-NLP/opus-mt-tc-big-it-en (CC BY 4.0, marcadas en ATTRIBUTION.tsv), consejos de viaje del Gobierno de Canadá (travel.gc.ca) y de la Oficina de Asuntos Exteriores del Reino Unido (gov.uk) tal como se publican en las guías en inglés de la app, datos rápidos de Wikidata (capital, moneda, prefijo telefónico, lado de circulación), números de emergencia y resúmenes de vacunación. Los contextos se formaron con 1-3 secciones de guía con secciones distractoras, hasta 2000 caracteres, más los bloques que añade la app (puntos de interés cercanos, próximas salidas, distancias entre ciudades, números de emergencia y notas personales).

Las preguntas son solo preguntas: las respuestas siempre se toman del contexto o son la frase de rechazo. Se usaron preguntas de viaje reales del conjunto soniawmeyer/travel-conversations-finetuning. El pensamiento (thinking) se desactivó en entrenamiento con enable_thinking=False y un bloque `<think></think>` vacío en el prompt. En la información de búsqueda se indica que el modelo base Qwen3.5-2B combina Gated Delta Networks con MoE disperso y tiene 24 capas con 2048 dimensiones ocultas; este fine-tune hereda esa arquitectura, pero se distribuye como GGUF de texto y solo se ha entrenado y evaluado para respuesta extractiva sobre contexto de viajes.

## Capacidades
- Generación de texto extractiva en inglés basada exclusivamente en el contexto proporcionado.
- Respuestas de como máximo tres frases.
- Rechazo explícito cuando el contexto está vacío, es off-topic o no cubre la pregunta.
- Preguntas sobre guías de países y ciudades: historia, clima, cultura, cocina, telecomunicaciones y medios.
- Consultas prácticas de viaje: moneda, capital, prefijo telefónico, lado de circulación, números de emergencia y vacunas.
- Preguntas de tipo "qué hay cerca de mí" usando el bloque de puntos de interés cercanos.
- Consultas sobre próximas salidas usando el bloque de departures.
- Consultas sobre distancias entre ciudades.
- Integración en app Android offline con SQLite FTS, sin conexión.
- No soporta tool calling ni function calling (no mencionado en la información disponible).
- No soporta agentes ni razonamiento multi-paso (no mencionado).
- No soporta visión ni audio en este fine-tune GGUF, aunque el modelo base se describe como multimodal en la información de búsqueda.
- Multilingüe: no; solo inglés.
- Modo thinking: desactivado en entrenamiento; debe ejecutarse con enable_thinking=False.
- No es un chatbot general ni una fuente de conocimiento autónomo; sin contexto debe negarse.

## Casos de uso
- Asistente de viaje offline en Android: la app Pocket Travel usa SQLite FTS para buscar en la guía Wikivoyage descargada, inserta 1-3 secciones en el prompt y el modelo responde en inglés con extracción directa del contexto. Es adecuado porque el modelo está entrenado para no responder sin contexto y para limitarse a tres frases.
- Consultas sobre guías de países: capital, moneda, prefijo telefónico, lado de circulación, cultura o cocina. El modelo extrae los datos de los bloques de contexto que la app construye a partir de Wikivoyage, Wikipedia y Wikidata.
- Preguntas sobre historia y clima de ciudades: el fine-tune se entrenó con artículos de Wikipedia en inglés y con secciones de Wikivoyage, y en la evaluación rechaza correctamente cuando el contexto no cubre esos temas.
- Preguntas "qué hay cerca de mí": la app añade un bloque de puntos de interés cercanos y el modelo responde solo si hay un lugar coincidente en el contexto. Es útil para turismo local sin conexión.
- Consultas de próximas salidas: la app inserta un bloque de departures y el modelo responde sobre salidas coincidentes, rechazando cuando no hay ninguna en el contexto.
- Información práctica de emergencia y salud: números de emergencia y resúmenes de vacunación incluidos en las guías en inglés de la app; el modelo los extrae del contexto.
- Cálculo de distancias entre ciudades: la app proporciona un bloque de distancias y el modelo responde a partir de él.
- Modo viajero sin conexión en zonas rurales o con roaming desactivado: al ser un GGUF de 1,2 GB con ~1,9 GiB de memoria en uso, cabe en un teléfono Android de gama media con 6 GB de RAM y funciona íntegramente en local.
- Integración en pipelines de RAG documental: el mismo comportamiento de respuesta extractiva y rechazo puede reutilizarse en otras apps que inserten contexto estructurado, aunque el modelo está especializado en viajes y en inglés.

## Benchmarks y rendimiento
La model card presenta una evaluación sobre un conjunto de prueba reservado de 584 preguntas sobre 11 países nunca vistos en entrenamiento y sus ciudades, con contextos con la misma forma que los de la app. Se evaluaron este modelo y el modelo base como GGUF con llama.cpp (decodificación greedy), con las mismas preguntas y el mismo prompt. El modelo base es la cuantización oficial unsloth/Qwen3.5-2B-GGUF (UD-Q4_K_XL) que la app ofrece en el mismo nivel de memoria. En la primera parte de la tabla, una tasa más alta es mejor; en la segunda, una tasa más baja es mejor.

| Metrica | Este modelo | Modelo base (Qwen3.5-2B) |
|---|---|---|
| Rechaza cuando el contexto está vacío | 100% | 100% |
| Rechaza preguntas off-topic | 100% | 92,7% |
| Rechaza preguntas parafraseadas de país cuyo tema falta en el contexto | 95,1% | 65,9% |
| Rechaza preguntas de ciudad cuyo tema falta en la página | 75% | 50% |
| Rechaza preguntas de historia o clima de ciudad no cubiertas por el contexto | 100% | 100% |
| Rechaza preguntas "qué hay cerca de mí" sin lugar cercano coincidente | 100% | 50% |
| Rechaza preguntas de salidas sin salida coincidente | 100% | 50% |
| Rechaza incorrectamente preguntas de país respondibles | 5,9% | 12,6% |
| Rechaza incorrectamente preguntas de ciudad respondibles | 0% | 16% |
| Rechaza incorrectamente preguntas de historia o clima de ciudad respondibles | 0% | 0% |
| Rechaza incorrectamente preguntas "qué hay cerca de mí" respondibles | 21,4% | 7,1% |
| Rechaza incorrectamente preguntas de salidas respondibles | 7,1% | 21,4% |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card indica que el conjunto de prueba es nuevo en esta versión, con más grupos y contextos con bloques extra de la app, por lo que los números no son comparables con los de la versión anterior de la tarjeta.

## Requisitos de hardware
- Archivo GGUF de 1.215 MiB en cuantización Q4_K_M con importance matrix.
- Memoria en uso medida con llama.cpp en CPU: aproximadamente 1,9 GiB, incluyendo pesos, copia CPU de pesos repackeados, KV cache y buffers de cómputo, con contexto 4096, batch 512 y KV cache f16.
- RAM sugerida para el dispositivo: 6 GB o más. Con unos 0,4 GB para la app, modelo y app ocupan aproximadamente el 40% o menos de esa RAM, dejando el resto al sistema y a otras aplicaciones.
- En el ejemplo de despliegue se usa contexto 8192 con llama-server.
- GPU recomendadas: no disponible. No se proporciona una lista de GPU en la información.
- Cabe en GPU consumer: por la memoria en uso (~1,9 GiB), es teóricamente ejecutable en GPU consumer con 3 GB o más de VRAM, pero no hay datos de rendimiento en GPU en la información proporcionada. El autor lo ha medido y orientado a CPU en Android.
- Opciones de despliegue: llama.cpp / llama-server con GGUF. El autor muestra el comando: `llama-server -m qwen3.5-2b-travel-en-Q4_K_M.gguf -c 8192 --chat-template-kwargs '{"enable_thinking": false}'`. Otros runtimes GGUF como Ollama no se mencionan en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque | Rendimiento en rechazo |
|---|---|---|---|---|---|---|
| qwen3.5-2b-travel-en-GGUF | 1,88 B | 8192 tokens en ejemplo; 4096 en medición | Q4_K_M imatrix | cc-by-sa-4.0 | RAG de viajes offline en inglés | Mejores tasas de rechazo en casi todos los grupos; peor falso rechazo en "qué hay cerca de mí" (21,4% frente a 7,1%) |
| Qwen/Qwen3.5-2B base (unsloth GGUF UD-Q4_K_XL) | 1,88 B | no disponible | UD-Q4_K_XL | no disponible | Modelo general multimodal según la información de búsqueda | Menores tasas de rechazo en varios grupos, pero con respuestas desde conocimiento propio o texto no relevante cuando no rechaza |
| Otras alternativas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado otros modelos comparables de asistente de viajes offline en la información proporcionada. La comparación principal disponible es contra el modelo base Qwen3.5-2B en la misma franja de memoria.

## Limitaciones y advertencias
- Entrenado y evaluado solo en inglés. No hay soporte multilingüe declarado para este fine-tune.
- No es un chatbot general ni una fuente de conocimiento: sin contexto debe negarse a responder; su uso fuera de RAG de viajes produce respuestas poco fiables.
- Riesgo de alucinación si se usa sin contexto o si el contexto es insuficiente, aunque el entrenamiento incluye aproximadamente un 21% de ejemplos de rechazo.
- Límite de respuesta: como máximo tres frases.
- Contextos de entrenamiento de hasta 2000 caracteres; el autor recomienda contexto 4096 o 8192 tokens en inferencia.
- Tasas de falso rechazo: 21,4% en preguntas respondibles de "qué hay cerca de mí", 7,1% en preguntas respondibles de salidas y 5,9% en preguntas respondibles de país.
- Sesgos potenciales derivados de las fuentes: Wikivoyage y Wikipedia en inglés, consejos oficiales de Canadá y Reino Unido, traducción automática de Wikivoyage italiano y datos de Wikidata. Puede reflejar sesgos geográficos, culturales y de actualidad de esas fuentes.
- Licencia cc-by-sa-4.0: uso comercial permitido con atribución y compartir bajo la misma licencia las obras derivadas; revisar la compatibilidad con el modelo base Qwen3.5-2B, cuya licencia no se detalla en la información proporcionada.
- Debe ejecutarse con el pensamiento desactivado (enable_thinking=False); si se activa, el comportamiento puede degradarse.
- No se menciona soporte de tool calling, function calling, agentes, visión ni audio en este fine-tune GGUF.
- No hay datos de benchmarks generales (MMLU, HumanEval, GSM8K) en la información proporcionada; solo la evaluación específica de RAG de viajes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción fuera del proyecto Pocket Travel.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/pockettravel/qwen3.5-2b-travel-en-GGUF
- Perfil del autor pockettravel: https://huggingface.co/pockettravel
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- GGUF base de unsloth: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Repositorio de la app Pocket Travel: https://github.com/miracle091/pocket-travel
- Dataset de preguntas reales de viaje: soniawmeyer/travel-conversations-finetuning (identificador proporcionado en la model card; URL completa no disponible)
- Modelo de traducción MarianMT: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-it-en
- Consejos de viaje del Gobierno de Canadá: https://travel.gc.ca
- Consejos de viaje del Gobierno del Reino Unido: https://www.gov.uk
- Ficha de Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Guía sobre la serie Qwen 3.5 en Better Stack: https://betterstack.com/community/guides/ai/qwen-35/
- Ficha de Qwen3.5-2B-GGUF en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.5-2b-gguf-unsloth
