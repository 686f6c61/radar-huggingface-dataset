# rasyosef/gemma-4-E2B-it-dspark

## Resumen

`rasyosef/gemma-4-E2B-it-dspark` es un modelo borrador (draft model) para decodificacion especulativa, disenado exclusivamente para acelerar la inferencia del verificador `google/gemma-4-E2B-it`. No es un modelo autonomo: actua como proponedor de tokens que el verificador valida en una unica pasada forward, de modo que la salida es identica a ejecutar el verificador en solitario (aceleracion sin perdida, o lossless). Lo desarrolla el usuario rasyosef y se entreno con la libreria `speculators` del proyecto vLLM.

El borrador es muy ligero: 249.838.849 parametros en safetensors (aproximadamente 0,25B, descrito como ~0,2B en la model card), con 3 capas draft y precision bfloat16. Propone bloques de 5 tokens y reduce el vocabulario de borrador a 50.000 entradas frente al vocabulario completo del verificador. El modelo base es `google/gemma-4-E2B-it`, que segun las fuentes web consultadas ronda los 2,1B de parametros, es text-only y se describe con 8K de contexto.

Su relevancia radica en que la decodificacion especulativa es una de las tecnicas mas efectivas para reducir la latencia de generacion sin degradar la calidad, y este borrador se publica con licencia Apache 2.0 y pesos en safetensors listos para vLLM. El modelo es muy reciente (creado el 23 de septiembre de 2026) y no registra descargas ni likes en el momento de la consulta, por lo que su adopcion es todavia nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo borrador DSpark para decodificacion especulativa sobre un transformer verificador (`gemma-4-E2B-it`); 3 capas draft con hidden states auxiliares de las capas 2/12/22/32 |
| Parametros totales | 249.838.849 (~0,25B) segun safetensors; la model card indica ~0,2B |
| Longitud de contexto | no disponible (entrenamiento con prompts preparados a 1024 tokens y secuencias de 8192) |
| Tipos de cuantizacion | bfloat16 (unico formato documentado); no se publican GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible (los idiomas efectivos son los del verificador, no documentados) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tag `custom_code`; requiere codigo personalizado) |

Detalles adicionales: tamano del repo 1,3 GB, block size 5, vocabulario de borrador reducido a 50.000, hasta 1024 anchors por muestra durante el entrenamiento.

## Arquitectura y entrenamiento

El modelo es un borrador de tipo DSpark, pensado para trabajar en pareja con un verificador transformer. Consta de 3 capas draft y consume hidden states auxiliares extraidos de las capas 2, 12, 22 y 32 del verificador. En cada paso propone un bloque de 5 tokens (block size 5) y el verificador los comprueba en una sola pasada forward, aceptando el prefijo valido. Como la verificacion no altera la distribucion del verificador, la salida final es identica a la del modelo base (aceleracion lossless). La longitud media de aceptacion es de 2,41 tokens comprometidos por paso de verificacion.

El entrenamiento se realizo con `speculators` sobre 32.000 muestras filtradas de `mlabonne/open-perfectblend`, con los prompts regenerados por el propio verificador y divididos 96/4 en entrenamiento y validacion. Se entreno durante 3 epocas con AdamW, learning rate 3e-4 y schedule cosine con 4% de warmup, usando la funcion de perdida `{"ce": 0.1, "tv": 0.9}`. Los prompts se prepararon a 1024 tokens, con longitud de secuencia de entrenamiento de 8192. Los hidden states del verificador se obtenian bajo demanda desde un servidor vLLM en ejecucion y se eliminaban tras su uso, en lugar de almacenarse en disco con antelacion.

## Capacidades

- Aceleracion de decodificacion especulativa sobre `gemma-4-E2B-it`: propone bloques de 5 tokens que el verificador valida en una pasada.
- Inferencia sin perdida (lossless): la salida es identica a la del verificador, incluidos sus sesgos y comportamiento.
- Mayor ganancia en dominios de alta predictibilidad: razonamiento matematico (acceptance_length 3,922) y codigo (HumanEval, 2,934).
- Rendimiento moderado en prosa: question, writing y tool_call (2,17-2,23) y en translation, qa y rag (1,96-2,05).
- Integracion nativa con vLLM: el servidor carga el verificador automaticamente desde la configuracion.
- Endpoint compatible con OpenAI (`/v1`) al servirse con vLLM.
- No genera texto de forma autonoma, no soporta tool calling por si mismo, no tiene capacidades de vision, audio ni thinking mode, y no es usable como modelo independiente.

## Casos de uso

- Servicio de razonamiento matematico: es el escenario donde el borrador rinde mejor (acceptance_length 3,922, con pos_4 al 37,0%), por lo que tutorizacion de problemas, verificacion de calculos o generacion de soluciones paso a paso se benefician de la mayor tasa de aceptacion.
- Generacion de codigo en produccion: en HumanEval la aceptacion es de 2,934 con pos_0 del 72,1%; encaja en asistentes de autocompletado o generacion de funciones dentro de pipelines de desarrollo donde la latencia importa.
- Agentes con tool calling: con aceptacion de 2,172 en el subset tool_call, puede acelerar bucles de agente multi-paso que invocan funciones, aunque la ganancia es menor que en codigo o matematicas.
- Traduccion automatica: aceptacion de 2,052, adecuada para servicios de traduccion de texto donde el verificador predice con razonable confianza.
- QA sobre documentos y RAG: aceptacion de 1,964 (qa) y 1,963 (rag), util en pipelines de preguntas sobre corpus largos que reutilizan contexto recuperado.
- Chat interactivo de baja latencia: al reducir el numero de pasos de verificacion necesarios, mejora el tiempo hasta el primer token y el throughput en conversaciones multi-turno, siempre que el verificador subyacente este desplegado.
- Resumen de documentos: es el caso menos favorable (acceptance_length 1,652, con caida a 14,6% en pos_1), por lo que solo aporta una mejora marginal respecto a ejecutar el verificador en solitario.

## Benchmarks y rendimiento

Tabla de longitud de aceptacion por subset en los nueve conjuntos de `RedHatAI/speculator_benchmarks`. `acceptance_length` es la media de tokens comprometidos por paso de verificacion (incluido el token bonus); el suelo es 1,0 y el techo 6,0 con block size 5.

| Subset | acceptance_length | pos_0 | pos_1 | pos_2 | pos_3 | pos_4 |
|---|---|---|---|---|---|---|
| math_reasoning | 3,922 | 82,9% | 69,0% | 57,1% | 46,3% | 37,0% |
| HumanEval | 2,934 | 72,1% | 50,6% | 34,5% | 22,1% | 14,1% |
| question | 2,234 | 55,1% | 30,8% | 18,2% | 11,7% | 7,6% |
| writing | 2,226 | 54,7% | 30,4% | 18,2% | 11,7% | 7,5% |
| tool_call | 2,172 | 54,7% | 29,7% | 17,0% | 10,5% | 5,3% |
| translation | 2,052 | 48,8% | 27,3% | 15,7% | 8,8% | 4,6% |
| qa | 1,964 | 49,0% | 24,0% | 12,5% | 7,0% | 3,9% |
| rag | 1,963 | 50,3% | 25,1% | 12,0% | 6,0% | 2,7% |
| summarization | 1,652 | 41,9% | 14,6% | 5,3% | 2,3% | 1,1% |

Media ponderada de todos los subsets: 2,415 sobre 139.196 pasos de verificacion. No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K, etc.) en la informacion disponible, ya que al ser una aceleracion lossless la calidad corresponde integramente al verificador.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 0,5 GB en bfloat16 (249,8M parametros x 2 bytes); el repo ocupa 1,3 GB.
- VRAM total: hay que sumar el verificador `gemma-4-E2B-it` (segun fuentes web, ~2,1B de parametros, lo que supone del orden de 4,2 GB en bf16 solo para pesos), mas cache KV y overhead del servidor.
- GPU recomendadas: no disponible de forma explicita. El modelo se sirve con vLLM usando `--gpu-memory-utilization 0.8`; por tamano puede caber en GPU de consumo como RTX 4090 o RTX 5090, pero la viabilidad depende del verificador y de la longitud de contexto concurrente.
- Cabe en GPU de consumo: probablemente si, dado el reducido tamano del borrador y un verificador de ~2B; no se aportan cifras oficiales.
- Opciones de despliegue: vLLM (via recomendada, carga automaticamente el verificador desde la configuracion); el entrenamiento y evaluacion usan `speculators` y `evaluate.py`. No se documentan despliegues con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras medidas. La ganancia depende de la tasa de aceptacion y de la mezcla de trafico; una fuente externa (gemma4all.com) menciona cifras de "60-85% mas rapido" que no se confirman en la model card.

## Comparativa con modelos similares

| Modelo / estrategia | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rasyosef/gemma-4-E2B-it-dspark | 249,8M (borrador) | no disponible | acceptance_length ponderada 2,415 | Apache 2.0 | HF (0 descargas, 0 likes) |
| gemma-4-E2B-it (verificador en solitario) | ~2,1B (segun fuentes web) | 8K (segun fuentes web) | linea base; sin aceleracion | no disponible en la informacion | HF |
| Borradores tipo EAGLE / Medusa | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de otros modelos borrador en la informacion proporcionada, por lo que la comparacion cuantitativa con alternativas de decodificacion especulativa queda como no disponible.

## Limitaciones y advertencias

- Modelo no autonomo: funciona unicamente con `gemma-4-E2B-it` y no puede usarse como modelo independiente.
- La aceptacion cae bruscamente a partir de las dos primeras posiciones en trafico tipo prosa, especialmente en summarization (14,6% en pos_1), de modo que las ganancias se concentran en matematicas y codigo.
- La aceleracion real depende de la mezcla de trafico; no hay una cifra universal de speedup.
- Al ser una verificacion lossless, los sesgos y alucinaciones del verificador se transmiten sin cambios, ya que el borrador no altera la distribucion de salida.
- Sesgos conocidos del borrador: no disponibles de forma especifica, mas alla de los heredados del verificador.
- Idiomas soportados: no disponible; dependen del verificador.
- Requiere codigo personalizado (tag `custom_code`), lo que implica confiar en el codigo remoto si se carga con `trust_remote_code`.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes), con lo que no existe validacion de la comunidad.
- Licencia Apache 2.0, sin restricciones documentadas para uso comercial, pero hereda las condiciones del verificador (no detalladas en la informacion disponible).

## Enlaces

- HuggingFace del modelo: https://huggingface.co/rasyosef/gemma-4-E2B-it-dspark
- Modelo base / verificador: https://huggingface.co/google/gemma-4-E2B-it
- Modelo base (variante no instruct): https://huggingface.co/google/gemma-4-E2B
- Repositorio de entrenamiento: https://github.com/rasyosef/train-dspark-draft-models
- Libreria `speculators`: https://github.com/vllm-project/speculators
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluacion: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guia de benchmarks de Gemma 4 (ai-muninn): https://ai-muninn.com/en/blog/dgx-spark-gemma4-complete-guide
- Ficha de Gemma 4 E2B (gemma4.dev): https://gemma4.dev/models/gemma-4-e2b
- Analisis de DSpark y Gemma 4 (gemma4all.com): https://gemma4all.com/blog/gemma-4-dspark
