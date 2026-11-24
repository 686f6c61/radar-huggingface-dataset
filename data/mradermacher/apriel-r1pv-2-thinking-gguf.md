# mradermacher/Apriel-R1PV.2-Thinking-GGUF

## Resumen

Apriel-R1PV.2-Thinking es un modelo de lenguaje conversacional de aproximadamente 15 mil millones de parametros, afinado especificamente para role-play (RP) y generacion de narrativa interactiva, con un modo de razonamiento "thinking" heredado de la familia R1. El modelo original fue desarrollado por ConicCat (partiendo de la base Apriel) y esta version concreta es una cuantizacion GGUF estatica producida por mradermacher, un conocido cuantizador de la comunidad open source.

El modelo esta entrenado sobre dos datasets de role-play: `Undi95/R1-RP-ShareGPT3` y `PJMixers-Dev/Gryphe-Aesir-RPG-Charcards-Opus-Mixed-split-v3-0324`, lo que lo orienta a personajes, fichas de personaje (charcards) y conversaciones multi-turno con consistencia narrativa. Su tamano (~15B) lo situa en la franja de modelos que caben en GPUs de consumo con cuantizaciones agresivas (Q4_K_M ~9,2 GB) y en GPUs profesionales con cuantizaciones altas.

La relevancia actual radica en que combina un tamano manejable con el formato GGUF, lo que permite desplegarlo en llama.cpp, Ollama o LM Studio sin infraestructura dedicada, algo atractivo para prototipos de agentes conversacionales y juegos de rol por texto. No obstante, la informacion publica disponible es escasa: no hay benchmarks, no se declara licencia y la model card del cuantizador es puramente tecnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Apriel; detalles no disponibles) |
| Parametros totales | 14.974.182.400 (~15B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix/weighted en repo i1 |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (original en safetensors en el repo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de ~15B parametros, heredado de Apriel (la familia de ServiceNow/ConicCat) y posteriormente afinado por ConicCat para role-play. No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO; la model card solo declara los dos datasets de ajuste: `Undi95/R1-RP-ShareGPT3` (conversaciones de role-play en formato ShareGPT) y `PJMixers-Dev/Gryphe-Aesir-RPG-Charcards-Opus-Mixed-split-v3-0324` (charcards y escenarios RPG).

La innovacion destacable es el sufijo "Thinking": el modelo incorpora un modo de razonamiento previo a la respuesta, tipico de los derivados de DeepSeek-R1, que en el contexto de role-play se traduce en una planificacion interna del personaje y de la escena antes de generar el turno. Esta version concreta es una cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) realizada con las herramientas de mradermacher; existen ademas cuantizaciones ponderadas con imatrix en el repositorio `-i1-GGUF`.

## Capacidades

- Generacion de texto conversacional y narrativo orientado a role-play multi-turno.
- Modo "thinking": razonamiento interno antes de responder, util para mantener coherencia de personaje y trama.
- Manejo de fichas de personaje (charcards) y escenarios RPG estructurados.
- Conversaciones multi-turno con memoria de contexto (longitud exacta no disponible).
- Capacidades multilingues limitadas al ingles segun la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo thinking puede habilitar cadenas de razonamiento.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Role-play por texto en local: el modelo puede gestionar conversaciones con personajes consistentes usando las charcards del dataset de entrenamiento; su tamano (~9 GB en Q4_K_M) permite ejecutarlo en una RTX 4090 o incluso en GPUs de 12 GB con Q3.
- Prototipado de videojuegos narrativos: integrado via llama.cpp u Ollama, puede generar dialogos ramificados y respuestas de NPCs en tiempo real sin depender de APIs externas.
- Asistente de escritura creativa: el modo thinking permite planificar tramas y mantener la voz del personaje a lo largo de capitulos, con la ventaja de privacidad al ejecutarse en local.
- Evaluacion de tecnicas de prompting para RP: util como banco de pruebas para comparar estrategias de system prompt y fichas de personaje en un modelo afinado especificamente para ello.
- Chatbot de compania o entretenimiento: conversaciones largas con contexto narrativo, desplegable en Ollama o LM Studio para uso personal.
- Investigacion sobre alineacion y sesgos en modelos de role-play: al ser un fine-tune sobre R1 con datasets comunitarios, sirve para estudiar como el ajuste conversacional altera el comportamiento del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K (~5,9 GB): cabe en GPUs de 8 GB.
  - Q3_K_M (~7,5 GB): cabe en GPUs de 10-12 GB.
  - IQ4_XS (~8,4 GB) y Q4_K_M (~9,2 GB): recomendadas para GPUs de 12-16 GB (RTX 4080, RTX 4090, A4000).
  - Q5_K_M (~10,8 GB): GPUs de 16 GB o mas.
  - Q6_K (~12,4 GB) y Q8_0 (~16,0 GB): GPUs de 24 GB (RTX 3090, RTX 4090, A10G, L4) o A100/H100 para mayor margen de contexto.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K/Q8_0 con contexto amplio; A100 40/80 GB o H100 para despliegue concurrente o contexto muy largo.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB (Q3/Q4), RTX 4070 Ti Super 16 GB (Q5), RTX 4090 24 GB (Q8_0).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; para el formato original safetensors, vLLM o TGI (sujeto a que la arquitectura base sea compatible).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion. Como referencia cualitativa, la model card marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Apriel-R1PV.2-Thinking (este) | ~15B | no disponible | no disponible | GGUF / safetensors | Fine-tune de role-play con modo thinking |
| Modelos RP de ~13-14B de la comunidad (p. ej. derivados de Mistral/Llama) | 13-14B | 4k-32k segun variante | variable (a menudo Apache 2.0 o Llama) | GGUF, safetensors | Ecosistema maduro, mas benchmarks publicos |
| DeepSeek-R1-Distill de ~14B | ~14B | 32k-128k segun variante | MIT (distills) | safetensors, GGUF | Razonamiento general, no especializado en RP |
| Apriel base (sin fine-tune RP) | ~15B | no disponible | no disponible | safetensors | Referencia del modelo original |

La comparativa cuantitativa no esta disponible por falta de benchmarks publicos del modelo. Los derivados de DeepSeek-R1-Distill y los fine-tunes RP de la comunidad son las alternativas mas directas por tamano y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con datasets comunitarios de RP, puede reproducir estereotipos presentes en esos datos.
- Riesgo de alucinacion: alto en tareas factuales; el modelo esta optimizado para narrativa, no para precision.
- Limitaciones de idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Longitud de contexto: no declarada; conviene validar empiricamente antes de usarlo en produccion con contextos largos.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor del modelo base (ConicCat) antes de desplegarlo en productos.
- El modo thinking incrementa la latencia y el consumo de tokens; en RP puede generar razonamiento interno no deseado si no se controla con el prompt.
- Es una cuantizacion de terceros: la calidad final depende del proceso de mradermacher, no del autor original.
- Repositorio de 103,2 GB con multiples variantes; descargar solo el fichero GGUF necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Apriel-R1PV.2-Thinking-GGUF
- Modelo base: https://huggingface.co/ConicCat/Apriel-R1PV.2-Thinking
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Apriel-R1PV.2-Thinking-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Apriel-R1PV.2-Thinking-GGUF
- Dataset de entrenamiento 1: https://huggingface.co/datasets/Undi95/R1-RP-ShareGPT3
- Dataset de entrenamiento 2: https://huggingface.co/datasets/PJMixers-Dev/Gryphe-Aesir-RPG-Charcards-Opus-Mixed-split-v3-0324
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
