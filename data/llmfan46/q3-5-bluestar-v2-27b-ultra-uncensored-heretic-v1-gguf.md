# llmfan46/Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v1-GGUF

## Resumen

Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v1-GGUF es la distribucion en formato GGUF del modelo Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v1, publicado por el contribuidor independiente llmfan46. Se trata de una version "decensored" (abliterated) del modelo zerofata/Q3.5-BlueStar-v2-27B, obtenida aplicando la herramienta Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA). El modelo base es de tipo multimodal, ya que el repositorio incluye un proyector de vision (mmproj) en BF16 que debe cargarse junto a la cuantizacion de texto para habilitar capacidades de imagen.

El modelo cuenta con 26.895.998.464 parametros (aproximadamente 26,9 mil millones) y se distribuye bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales. La propuesta de valor principal es la reduccion drastica de rechazos: segun la model card, pasa de 99/100 rechazos en el modelo original a 3/100 en esta version, con una divergencia KL de 0,0712 respecto al original, lo que indica una preservacion razonable de las capacidades del modelo base.

El modelo esta afinado sobre datasets orientados a roleplay de anime y personajes (zerofata/Instruct-Anime, zerofata/Roleplay-Anime-Characters, zerofata/Gemini-3.1-Pro-GLM5-Characters y zerofata/Gemini-3.1-Pro-SmallWiki), lo que lo orienta a generacion creativa, narrativa y conversacion sin restricciones de contenido. El repositorio ocupa 159,9 GB e incluye seis cuantizaciones GGUF mas el proyector de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal con proyector de vision; detalles de la arquitectura del transformer no especificados) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M; proyector de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del transformer subyacente (numero de capas, dimensiones, tipo de atencion o si emplea alguna variante como GQA). La model card del repositorio GGUF solo describe el proceso de decensurado, no la arquitectura original del modelo zerofata/Q3.5-BlueStar-v2-27B. Se sabe que el modelo es multimodal porque el repositorio incluye un proyector de vision (mmproj) que debe cargarse junto a los pesos de texto para habilitar la entrada de imagenes.

El proceso de transformacion se realizo con Heretic v1.2.0 aplicando Arbitrary-Rank Ablation (ARA), una tecnica de abliteration que elimina direcciones de activacion asociadas a comportamientos de rechazo. Los parametros de ablacion documentados son: start_layer_index 13, end_layer_index 34, preserve_good_behavior_weight 0,2694, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 1,1737 y neighbor_count 14. Los componentes objetivo fueron attn.out_proj y attn.o_proj. El ajuste fino posterior se realizo sobre datasets de anime, roleplay y wiki generados con Gemini 3.1 Pro, orientados a conversacion y personajes.

## Capacidades

- Generacion de texto conversacional y narrativo, con enfasis en roleplay y personajes de anime.
- Capacidades multimodales de vision gracias al proyector mmproj en BF16 (entrada de imagenes junto con texto).
- Reduccion de rechazos: 3/100 segun la model card, frente a 99/100 del modelo original.
- Razonamiento fisico basico preservado: PIQA acc_norm de 0,8221 frente a 0,8237 del original.
- Soporte de conversaciones multi-turno (tag conversational en el repositorio).
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documenta soporte explicito de tool calling, function calling ni modo thinking.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta afinado sobre datasets de personajes de anime y roleplay, por lo que puede mantener conversaciones multi-turno con personalidad consistente en aplicaciones de ficcion interactiva.
- Generacion creativa sin filtros: util para escritura de ficcion adulta, terror o tematicas que los modelos alineados rechazan, gracias a la reduccion de rechazos al 3 %.
- Analisis de imagenes en contexto conversacional: el proyector de vision permite describir imagenes, responder preguntas sobre capturas o integrar imagen y dialogo en asistentes especializados.
- Prototipado local en estaciones de trabajo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecutar el modelo en GPUs de consumo con VRAM limitada mediante llama.cpp, LM Studio u Ollama.
- Investigacion sobre alineacion y abliteration: el modelo sirve como caso de estudio reproducible para medir el impacto de ARA en rechazos (3/100) y divergencia KL (0,0712) sobre el modelo original.
- Generacion de dialogos para videojuegos y mods: la licencia MIT y el formato GGUF facilitan la integracion en motores de juego o pipelines de dialogo sin coste de licencia.
- Experimentacion con modelos multimodales en local: la combinacion de pesos de texto cuantizados y proyector BF16 permite probar flujos imagen-texto en hardware de gama alta de consumo.

## Benchmarks y rendimiento

| Benchmark | Modelo original | Modelo heretic (este) |
|---|---|---|
| PIQA acc (0-shot) | 0,8232 ± 0,0089 | 0,8128 ± 0,0091 |
| PIQA acc_norm (0-shot) | 0,8237 ± 0,0089 | 0,8221 ± 0,0089 |
| Rechazos (100 prompts) | 99/100 | 3/100 |
| Divergencia KL vs original | 0 (por definicion) | 0,0712 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. Los unicos datos verificables son los de PIQA y las metricas de rechazo y divergencia KL reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): BF16 ~54 GB; Q8_0 ~29 GB; Q6_K ~22 GB; Q5_K_M ~19 GB; Q5_K_S ~18 GB; Q4_K_M ~16 GB. El proyector de vision en BF16 anade una cantidad no especificada.
- GPU recomendadas: para BF16, A100 80 GB o H100; para Q8_0, A100 40 GB o dos RTX 4090; para Q5_K_M y Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 es suficiente para los pesos, con margen variable para el contexto.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y GPUs con 16 GB o mas usando Q4_K_M, siempre que se ajuste la ventana de contexto.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier runtime compatible con GGUF. El autor no menciona vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v1 (este) | ~26,9 B | no disponible | MIT | Multimodal decensored (ARA) | GGUF en HF |
| zerofata/Q3.5-BlueStar-v2-27B | ~26,9 B | no disponible | no disponible | Modelo original alineado | HF (modelo base) |
| Otros modelos abliterated de ~27 B | no disponible | no disponible | variable | Decensurado por abliteration | variable |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada, salvo la comparacion directa con el modelo original que figura en la seccion de benchmarks.

## Limitaciones y advertencias

- El proceso de abliteration reduce rechazos pero puede aumentar la probabilidad de contenido toxico, ilegal o danino; no debe desplegarse en produccion sin filtros externos.
- La divergencia KL de 0,0712 indica que el modelo se aleja del original; pueden aparecer degradaciones en tareas de razonamiento no medidas por PIQA.
- El ajuste fino sobre datasets de anime y roleplay puede sesgar el estilo y el contenido hacia ese dominio, con posible perdida de calidad en tareas tecnicas o cientificas.
- No se documentan idiomas soportados; el comportamiento multilingue es incierto.
- No se especifica la longitud de contexto, lo que dificulta planificar despliegues con ventanas largas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el cumplimiento legal del contenido generado en jurisdicciones concretas.
- El repositorio ocupa 159,9 GB y el autor advierte de que ha alcanzado el limite de almacenamiento gratuito de Hugging Face, lo que podria afectar a la disponibilidad futura de archivos.
- La model card incluye llamadas a donaciones y enlaces externos; no deben interpretarse como instrucciones tecnicas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/llmfan46/Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v1-GGUF
- Modelo base (safetensors): https://huggingface.co/llmfan46/Q3.5-BlueStar-v2-27B-ultra-uncensored-heretic-v1
- Modelo original: https://huggingface.co/zerofata/Q3.5-BlueStar-v2-27B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- Pull request de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
- Ko-fi del autor: https://ko-fi.com/llmfan46
- Patreon del autor: https://patreon.com/LLMfan46
