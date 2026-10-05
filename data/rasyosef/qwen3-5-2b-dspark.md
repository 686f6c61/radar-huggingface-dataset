# rasyosef/Qwen3.5-2B-DSpark

## Resumen

Qwen3.5-2B-DSpark es un modelo borrador (draft model) para decodificacion especulativa, publicado por el usuario rasyosef en HuggingFace. No es un modelo de lenguaje autonomo: se usa junto a Qwen/Qwen3.5-2B, que actua como verificador. El borrador propone 8 tokens por paso y el verificador los comprueba en una sola pasada forward, de modo que la salida es identica a ejecutar el verificador solo. Es, por tanto, una aceleracion sin perdida (lossless) de la inferencia.

El modelo se entreno con la libreria speculators del proyecto vLLM y esta pensado para despliegues con vLLM o llama.cpp. Con temperatura 0, la longitud media de aceptacion es de 3,89 tokens confirmados por paso de verificacion (hasta 5,40 en math_reasoning), lo que se traduce en una mejora de throughput de 2,00x de media frente al verificador sin decodificacion especulativa.

Su relevancia practica es doble: reduce coste de inferencia en produccion sin alterar la distribucion de salida, y supera al borrador MTP nativo del verificador en ocho de los nueve subconjuntos de benchmark evaluados. El borrador tiene unos 452 millones de parametros (451.726.161 segun safetensors) en bfloat16 y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 reducido: 5 capas con sliding-window attention de 2048 tokens; actua como borrador de decodificacion especulativa (DSpark) sobre un verificador |
| Parametros totales | 451.726.161 (~0,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como valor independiente; ventana de atencion de 2048 tokens y longitud de secuencia de entrenamiento de 8192 tokens |
| Tipos de cuantizacion | bfloat16 como formato de entrenamiento; existe repo GGUF (rasyosef/Qwen3.5-2B-DSpark-GGUF) con BF16 y otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo separado) |
| Hidden size | 2048 |
| Intermediate size | 6144 |
| Cabezas de atencion | 16 cabezas sobre 8 cabezas KV, head dim 128 |
| Tamano de bloque (draft) | 8 tokens |
| Vocabulario del borrador | 50.000 tokens (reducido desde los 248.320 del verificador) |
| Capas auxiliares de hidden state | 1/6/11/16/21 |
| Cabecera de confianza | Markov (vanilla, rank 256) |
| Tamano del repositorio | 6,5 GB |
| Descargas / likes | 159 / 1 |

## Arquitectura y entrenamiento

El borrador es un transformer compacto de 5 capas con hidden size 2048, intermediate size 6144, 16 cabezas de atencion sobre 8 cabezas KV y head dim 128. Todas las capas usan sliding-window attention con ventana de 2048 tokens. Incorpora una cabecera de confianza con estructura Markov (variante vanilla, rank 256) y consume hidden states auxiliares de las capas 1, 6, 11, 16 y 21 del verificador. El vocabulario del borrador se redujo a 50.000 tokens partiendo de los 248.320 del verificador, seleccionados por frecuencia de token sobre los datos de entrenamiento, lo que reduce el coste de la proyeccion final.

El entrenamiento se hizo con la libreria speculators sobre 100.000 prompts filtrados de Open PerfectBlend (mlabonne/open-perfectblend) con respuestas regeneradas por el propio verificador. El split fue 96/4 entre entrenamiento y validacion. Se entrenaron 4 epochs con AdamW, learning rate 4e-4 y schedule coseno con 4% de warmup, con una funcion de perdida compuesta {"ce": 0.1, "tv": 0.9}. Las muestras se prepararon a 2048 tokens, la longitud de secuencia de entrenamiento fue de 8192 y se admitieron hasta 1024 anchors por muestra. Los hidden states del verificador se obtenian bajo demanda desde un servidor vLLM en ejecucion y se eliminaban tras su uso, en lugar de almacenarse en disco. La decodificacion especulativa implementada es exacta: el verificador valida cada token propuesto, por lo que la salida greedy coincide con la del verificador en solitario.

## Capacidades

- Generacion de tokens como borrador especulativo: propone bloques de 8 tokens que el verificador Qwen3.5-2B acepta o rechaza en una unica pasada forward.
- Aceleracion sin perdida: la salida es identica a la del verificador sin decodificacion especulativa cuando se decodifica de forma greedy.
- Alto indice de aceptacion en tareas de razonamiento matematico (5,405 tokens de media por paso) y generacion de codigo (4,766 en HumanEval).
- Buenos indices de aceptacion en qa (4,074), rag (3,986) y tool_call (3,619), lo que cubre flujos con llamadas a herramientas y recuperacion aumentada.
- Rendimiento inferior en tareas de reescritura y traduccion: 3,107 en writing, 2,548 en summarization y 2,527 en translation.
- Funciona con vLLM (carga automatica del verificador desde la configuracion) y con llama.cpp mediante --spec-type draft-dspark y un maximo de 8 tokens de borrador.
- Reporta metricas de diagnostico por respuesta en llama.cpp (timings con draft_n y draft_n_accepted).
- No genera texto de forma autonoma, no soporta tool calling por si mismo ni dispone de modo de razonamiento propio: todas esas capacidades dependen del verificador.

## Casos de uso

- Servicio de inferencia de codigo asistido: el borrador acelera un 2,62x en HumanEval, por lo que resulta adecuado para autocompletado y generacion de codigo en editores o pipelines de CI/CD donde el coste por token es critico.
- Razonamiento matematico en produccion: con un 2,88x de mejora y 5,405 tokens aceptados por paso, es el escenario de mayor rendimiento y encaja en tutores automaticos o verificacion de calculos.
- Agentes con llamadas a herramientas: el subconjunto tool_call rinde a 2,50x, con 3,619 tokens de aceptacion media, util para orquestadores que encadenan function calling con muchas iteraciones cortas.
- RAG sobre documentacion tecnica: 2,26x en el subconjunto rag, adecuado para asistentes que responden con contexto recuperado y necesitan baja latencia por consulta.
- Atencion al cliente automatizada: 2,07x en qa, permite sostener conversaciones multi-turno con coste reducido por respuesta.
- Despliegue en una sola GPU A100 para servir Qwen3.5-2B con throughput elevado: las mediciones del autor (671,8 tokens/s en math_reasoning) corresponden a una unica peticion concurrente en una A100.
- Reduccion de coste de GPU en despliegues ya existentes de Qwen3.5-2B con vLLM: sustituir el borrador MTP nativo por este modelo mejora el throughput en ocho de los nueve subconjuntos evaluados.
- Inferencia local en llama.cpp con pesos GGUF: permite combinar el verificador en BF16 y el borrador en BF16 con decodificacion especulativa activada mediante flags.

## Benchmarks y rendimiento

Longitud de aceptacion por subconjunto (temperatura 0, decodificacion greedy, conjunto RedHatAI/speculator_benchmarks). El suelo es 1,0 y el techo 9,0 con tamano de bloque 8.

| Subconjunto | Longitud de aceptacion | pos_0 | pos_1 | pos_2 | pos_3 | pos_4 | pos_5 | pos_6 | pos_7 |
|---|---|---|---|---|---|---|---|---|---|
| math_reasoning | 5,405 | 87,4% | 75,8% | 64,9% | 56,1% | 48,5% | 41,5% | 35,9% | 30,3% |
| HumanEval | 4,766 | 84,1% | 69,6% | 57,5% | 47,6% | 39,3% | 32,4% | 25,8% | 20,3% |
| qa | 4,074 | 73,2% | 54,1% | 42,0% | 35,5% | 30,2% | 27,3% | 24,2% | 20,9% |
| rag | 3,986 | 80,1% | 61,9% | 47,6% | 37,4% | 29,1% | 20,3% | 13,0% | 9,2% |
| tool_call | 3,619 | 73,5% | 53,8% | 40,8% | 30,0% | 23,0% | 17,4% | 13,3% | 10,0% |
| question | 3,299 | 69,4% | 46,4% | 32,1% | 24,4% | 19,7% | 15,5% | 12,4% | 10,0% |
| writing | 3,107 | 69,3% | 44,9% | 30,0% | 21,4% | 16,4% | 12,3% | 9,4% | 7,0% |
| summarization | 2,548 | 65,9% | 38,7% | 22,3% | 13,3% | 7,8% | 3,8% | 2,1% | 0,9% |
| translation | 2,527 | 68,2% | 41,0% | 23,5% | 11,0% | 4,7% | 2,3% | 1,3% | 0,7% |

Media ponderada sobre 120.525 pasos de verificacion: 3,892.

Throughput en tokens/s con una unica peticion concurrente en una A100. La linea base es Qwen3.5-2B sin decodificacion especulativa; MTP es el borrador nativo del verificador a 4 y 8 tokens.

| Subconjunto | Baseline | MTP (4) | MTP (8) | DSpark | Aceleracion DSpark |
|---|---|---|---|---|---|
| math_reasoning | 233,4 | 410,1 | 357,0 | 671,8 | 2,88x |
| HumanEval | 233,5 | 412,8 | 376,4 | 612,2 | 2,62x |
| qa | 228,7 | 386,7 | 311,4 | 472,9 | 2,07x |
| rag | 221,5 | 401,2 | 373,3 | 499,5 | 2,26x |
| tool_call | 224,5 | 360,5 | 376,2 | 560,4 | 2,50x |
| question | 231,6 | 345,4 | 229,3 | 359,7 | 1,55x |
| writing | 233,0 | 345,1 | 229,4 | 365,3 | 1,57x |
| summarization | 219,5 | 293,8 | 220,5 | 316,6 | 1,44x |
| translation | 168,4 | 196,6 | 152,9 | 188,1 | 1,12x |
| Media | 1,00x | 1,57x | 1,31x | 2,00x | 2,00x |

No se han publicado resultados de benchmarks de calidad intrínseca (MMLU, GSM8K u otros) en la informacion disponible, dado que el modelo no es un generador autonomo y su evaluacion se limita a metricas de aceptacion y throughput.

## Requisitos de hardware

- Peso del borrador en bfloat16: aproximadamente 0,9 GB de VRAM (451,7 millones de parametros a 2 bytes por parametro), sin contar overhead de runtime.
- Peso del verificador Qwen3.5-2B en bfloat16: aproximadamente 4 GB de VRAM; la suma de ambos ronda los 5 GB de pesos, mas cache KV y buffers de activaciones.
- GPU recomendadas por el autor: A100 para las mediciones publicadas de throughput (671,8 tokens/s en math_reasoning con una peticion concurrente). H100 y otras GPU de 80 GB son sobredimensionadas para este par de modelos, pero validas para lotes grandes.
- Compatibilidad con GPU de consumo: el par verificador mas borrador en bfloat16 deberia caber en GPUs de 12-16 GB (RTX 4080, RTX 4090, RTX 5080), aunque el autor no publica cifras especificas para hardware de consumo.
- Despliegue con vLLM: vllm serve rasyosef/Qwen3.5-2B-DSpark con --gpu-memory-utilization 0.8 y configuracion de generacion a temperatura 0. El verificador se carga automaticamente desde la configuracion, no debe pasarse por separado.
- Despliegue con llama.cpp: llama-server con el verificador en GGUF, -hfd para el borrador, --spec-type draft-dspark, --spec-draft-n-max 8, --spec-draft-n-min 0, -fa on y -ngl 99. El tamano de bloque se lee de los metadatos sidecar y n-max se recorta a ese valor.
- Latencia y throughput: 2,00x de media frente a la linea base sin borrador, con maximos de 2,88x (math_reasoning) y minimos de 1,12x (translation) sobre A100 y una unica peticion concurrente.
- Uso de memoria en el entrenamiento: el autor menciona extraccion bajo demanda de hidden states del verificador desde un servidor vLLM, sin almacenamiento en disco, lo que reduce el requisito de almacenamiento durante el entrenamiento.

## Comparativa con modelos similares

Alternativas de la misma categoria (borradores para decodificacion especulativa sobre Qwen3.5-2B). Los datos de DSpark y MTP proceden de la model card; el resto no esta disponible en la informacion proporcionada.

| Modelo | Tipo | Parametros | Tokens de borrador | Aceleracion media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-2B-DSpark | Borrador DSpark (5 capas Qwen3) | 451,7M | 8 | 2,00x | Apache 2.0 | HuggingFace (safetensors y GGUF) |
| MTP nativo del verificador | Borrador multi-token nativo | no disponible | 4 | 1,57x | la del verificador | integrado en Qwen3.5-2B |
| MTP nativo del verificador | Borrador multi-token nativo | no disponible | 8 | 1,31x | la del verificador | integrado en Qwen3.5-2B |
| EAGLE-3 / Medusa / Lookahead | Familias de borradores especulativos | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion disponible |

La ventaja documentada es que DSpark supera al MTP nativo en ocho de los nueve subconjuntos, con la excepcion de translation, donde MTP a 4 tokens alcanza 196,6 frente a 188,1. No se dispone de comparaciones contra borradores de otras familias ni contra verificadores de mayor tamano.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el verificador Qwen/Qwen3.5-2B no produce texto util. Cualquier capacidad de generacion, razonamiento o tool calling procede del verificador.
- La aceleracion depende fuertemente del subconjunto: en translation la mejora es de solo 1,12x y en summarization de 1,44x, por lo que el beneficio en tareas de generacion libre es limitado.
- El subconjunto translation es el mas pequeno del benchmark (menos de 900 pasos de verificacion segun la model card, dato truncado en la informacion disponible), por lo que su medicion es la menos robusta.
- La evaluacion publicada se limita a temperatura 0 con decodificacion greedy y una unica peticion concurrente en una A100. No hay datos sobre lotes grandes, otras GPUs ni temperaturas superiores.
- El modelo solo se ha entrenado sobre 100.000 muestras de Open PerfectBlend con respuestas regeneradas por el verificador, lo que limita la diversidad de dominios y puede sesgar la aceptacion hacia el estilo y la distribucion del verificador.
- El vocabulario del borrador esta reducido a 50.000 tokens seleccionados por frecuencia; los tokens fuera de ese conjunto no pueden proponerse, lo que reduce la aceptacion en dominios con vocabulario especializado o multilingue.
- No se documentan idiomas soportados ni evaluaciones multilingues, a pesar de que la traduccion es uno de los subconjuntos evaluados.
- Riesgo de alucinacion: no aplica directamente al borrador, dado que la verificacion es exacta y la salida greedy coincide con la del verificador; el riesgo de alucinacion es el del verificador.
- Restricciones de licencia: Apache 2.0 permite uso comercial del borrador, pero el verificador Qwen/Qwen3.5-2B y los pesos GGUF derivados pueden tener condiciones propias que deben verificarse por separado.
- El repositorio incluye custom_code, por lo que requiere trust_remote_code o la libreria speculators para cargarse correctamente.
- Fecha de creacion y ultima actualizacion: 18 de septiembre de 2026 y 5 de octubre de 2026 respectivamente; con 159 descargas y 1 like, el modelo tiene una adopcion muy baja y una validacion comunitaria practicamente nula.
- El repositorio ocupa 6,5 GB, un tamano desproporcionado para 451,7 millones de parametros en bfloat16, probablemente por artefactos de entrenamiento incluidos; conviene revisar el contenido antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rasyosef/Qwen3.5-2B-DSpark
- Repo GGUF del borrador: https://huggingface.co/rasyosef/Qwen3.5-2B-DSpark-GGUF
- Modelo verificador: https://huggingface.co/Qwen/Qwen3.5-2B
- Repo GGUF del verificador (usado en el ejemplo de llama.cpp): https://huggingface.co/unsloth/Qwen3.5-2B-GGUF
- Codigo de entrenamiento: https://github.com/rasyosef/train-dspark-draft-models
- Libreria speculators: https://github.com/vllm-project/speculators
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluacion: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks

Nota: la busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo; los unicos enlaces verificables son los incluidos en la model card y en los metadatos de HuggingFace.
