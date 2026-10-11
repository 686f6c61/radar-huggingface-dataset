# rasyosef/gemma-4-E4B-it-dspark

## Resumen

Gemma-4-E4B-it-DSpark es un modelo borrador (draft model) para decodificacion especulativa, publicado por el usuario rasyosef en HuggingFace bajo licencia Apache 2.0. No es un modelo de lenguaje autonomo: su unica funcion es proponer tokens que el verificador `google/gemma-4-E4B-it` valida en una sola pasada forward. Al ser el verificador quien acepta o rechaza cada propuesta, la salida final es identica a la del verificador ejecutado en solitario, por lo que la aceleracion es sin perdida de calidad (lossless).

El borrador propone bloques de 8 tokens por paso y esta entrenado con la libreria `speculators` del proyecto vLLM. Cuenta con 546.828.289 parametros (unos 0,55B) en bfloat16, con una arquitectura decoder de estilo Qwen3 de 4 capas. La longitud media de aceptacion es de 3,24 tokens comprometidos por paso de verificacion, con picos de 6,05 en math_reasoning y 4,91 en HumanEval.

Su relevancia actual radica en que demuestra ganancias de throughput medibles sobre hardware existente (hasta 4,66× sobre el verificador solo en math_reasoning, con una A100 de 40 GB) manteniendo exactamente la distribucion de salida del modelo verificado. El modelo se publico el 9 de octubre de 2026 y acumula 19 descargas y 1 like en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Qwen3 de 4 capas (modelo borrador para decodificacion especulativa); hidden size 2560, MLP 8192, 32 cabezas de consulta sobre 8 cabezas KV (GQA, head dim 128) |
| Parametros totales | 546.828.289 (aproximadamente 0,55B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para el borrador; las 3 primeras capas usan atencion de ventana deslizante de 2048 tokens y la ultima atencion completa. Entrenamiento con secuencias de 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (el vocabulario borrador se reduce a 32.000 tokens seleccionados por frecuencia sobre los datos de entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un decoder de 4 capas de estilo Qwen3 con 0,55B parametros en bfloat16. Emplea atencion con consultas agrupadas (GQA) con 32 cabezas de consulta sobre 8 cabezas KV y dimension de cabeza 128. Las tres primeras capas usan atencion de ventana deslizante de 2048 tokens y la cuarta atencion completa. El tamano de bloque es 8. El vocabulario borrador se reduce de los 262.144 tokens del verificador a 32.000, seleccionados por frecuencia sobre los datos de entrenamiento. Los estados ocultos auxiliares se extraen de las capas 2, 10, 20, 30 y 40 del verificador.

El entrenamiento consistio en 3 epocas con learning rate 5e-4, optimizador Muon y schedule coseno con un 4% de warmup, minimizando una combinacion de perdidas `{"ce": 0.1, "tv": 0.9}`. Los datos son 216.000 prompts filtrados de `mlabonne/open-perfectblend` regenerados por el propio verificador y divididos 96/4 en entrenamiento y validacion. Los prompts se prepararon con 2560 tokens, la longitud de secuencia de entrenamiento fue 4096 y se usaron hasta 512 anclas por muestra. Los estados ocultos del verificador se solicitaban bajo demanda a un servidor vLLM en ejecucion y se eliminaban tras su uso, en lugar de almacenarse en disco previamente.

## Capacidades

- Decodificacion especulativa sin perdida: propone 8 tokens por paso que el verificador valida; la salida es identica a la del verificador en solitario.
- Aceptacion media de 3,24 tokens por paso de verificacion sobre el conjunto ponderado de los nueve subsets de `RedHatAI/speculator_benchmarks` (96.410 pasos).
- Mayor rendimiento en dominios predecibles: 6,05 de longitud de aceptacion en math_reasoning y 4,91 en HumanEval.
- Integracion con vLLM: el servidor carga automaticamente el verificador desde la configuracion, por lo que no hay que pasarlo por separado.
- Endpoint compatible con la API de OpenAI (`/v1`).
- No realiza generacion de texto, razonamiento, codigo ni tool calling por si mismo: esas capacidades corresponden al verificador subyacente `google/gemma-4-E4B-it`.
- Capacidades multilingues: no disponibles de forma especifica; dependen del verificador y de la cobertura de los 32.000 tokens del vocabulario borrador.

## Casos de uso

- Aceleracion de razonamiento matematico en produccion: es el escenario con mayor ganancia medida (4,66× de throughput sobre el verificador solo, 456,4 tokens/s en una A100 40 GB), por lo que resulta idoneo para servicios de resolucion de problemas matematicos o generacion de cadenas de razonamiento largas.
- Generacion de codigo asistida en pipelines de CI/CD: con 4,91 de longitud de aceptacion y 3,85× de speedup en HumanEval, permite reducir la latencia de sugerencias de codigo o de generacion en lote sin alterar la salida del verificador.
- Chat de atencion al cliente con latencia reducida: desplegado con vLLM sobre el endpoint compatible con OpenAI, acelera respuestas multi-turno manteniendo exactamente la calidad del modelo verificado.
- RAG en produccion: util cuando el cuello de botella es la generacion de respuestas sobre contexto recuperado; la ganancia medida en el subset rag es de 1,88×.
- Traduccion automatica por lotes: aporta 2,16× de speedup en el subset translation, adecuado para procesamiento offline de grandes volumenes donde el coste por token es critico.
- Agentes con tool calling: acelera la generacion de llamadas a herramientas (1,92× en tool_call) en flujos multi-paso donde la latencia acumulada importa.
- Resumen de documentos a escala: aunque es el subset con menor ganancia (1,57×), reduce el coste de resumir grandes volumenes manteniendo la fidelidad del verificador.
- Evaluacion y benchmarking de LLM: al ser lossless, permite comparar configuraciones de decodificacion especulativa sin riesgo de que el borrador altere las metricas de calidad.

## Benchmarks y rendimiento

Longitud de aceptacion media (tokens comprometidos por paso de verificacion, incluido el token bonus; suelo 1,0, techo 9,0 con tamano de bloque 8) sobre los nueve subsets de `RedHatAI/speculator_benchmarks`:

| Subset | Longitud de aceptacion | pos_0 | pos_1 | pos_2 | pos_3 | pos_4 | pos_5 | pos_6 | pos_7 |
|---|---|---|---|---|---|---|---|---|---|
| math_reasoning | 6,048 | 88,2% | 79,1% | 72,0% | 65,2% | 58,0% | 52,5% | 47,3% | 42,5% |
| HumanEval | 4,905 | 81,8% | 67,9% | 57,2% | 48,9% | 42,5% | 36,2% | 30,6% | 25,5% |
| question | 2,904 | 63,0% | 39,9% | 26,5% | 19,4% | 14,7% | 11,4% | 8,9% | 6,6% |
| writing | 2,882 | 62,5% | 39,4% | 26,3% | 19,1% | 14,6% | 11,2% | 8,5% | 6,6% |
| translation | 2,757 | 59,6% | 38,5% | 27,6% | 18,9% | 13,2% | 8,9% | 5,7% | 3,2% |
| rag | 2,753 | 64,3% | 41,9% | 27,1% | 17,2% | 11,2% | 7,0% | 4,0% | 2,6% |
| tool_call | 2,697 | 60,9% | 38,6% | 24,7% | 16,8% | 11,6% | 8,1% | 5,4% | 3,6% |
| qa | 2,281 | 55,7% | 31,1% | 17,5% | 10,2% | 6,1% | 3,8% | 2,3% | 1,4% |
| summarization | 2,189 | 55,9% | 29,0% | 15,5% | 8,8% | 5,1% | 2,7% | 1,2% | 0,7% |

Ponderado sobre todos los subsets: 3,244, calculado sobre 96.410 pasos de verificacion.

Throughput medio (tokens/s) en una unica A100 de 40 GB a concurrencia maxima 1, comparado con el verificador solo y con el drafter MTP `google/gemma-4-E4B-it-assistant` (8 tokens draft):

| Subset | Sin drafter | MTP | DSpark (este modelo) | Speedup DSpark |
|---|---|---|---|---|
| math_reasoning | 98,0 | 394,5 | **456,4** | 4,66× |
| HumanEval | 97,7 | 362,2 | **376,0** | 3,85× |
| question | 97,9 | 231,1 | **254,0** | 2,59× |
| writing | 97,8 | 225,8 | **257,1** | 2,63× |
| translation | 98,2 | **280,3** | 212,6 | 2,16× |
| rag | 93,7 | **208,6** | 176,5 | 1,88× |
| tool_call | 94,0 | **219,0** | 180,2 | 1,92× |
| qa | 97,7 | 174,6 | **182,5** | 1,87× |
| summarization | 94,5 | **168,5** | 148,4 | 1,57× |
| **Speedup medio** | 1,00× | **2,60×** | 2,57× | 2,57× |

DSpark es el mas rapido en 5 de los 9 subsets y MTP en 4; ambos quedan practicamente empatados en la media (2,57× frente a 2,60×). El mejor resultado de DSpark es math_reasoning con 456,4 tokens/s (4,66× sobre la linea base y un 16% por delante de MTP), y tambien lidera sobre MTP con un 10-14% en question y writing. MTP va por delante en translation, rag, tool_call y summarization.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 1,1 GB con pesos en bfloat16 (0,55B parametros); el tamano completo del repositorio es de 2,2 GB, lo que incluye otros artefactos ademas de los pesos.
- VRAM total: hay que sumar la del verificador `google/gemma-4-E4B-it`, cuyas necesidades no se detallan en la informacion disponible. Los resultados publicados se obtuvieron en una unica A100 de 40 GB.
- GPU de referencia: A100 40 GB (configuracion usada para todas las mediciones de throughput y aceptacion). No se han publicado mediciones en H100, RTX 4090 ni otras GPU.
- Viabilidad en GPU de consumo: no disponible; no se documentan pruebas en tarjetas consumer.
- Opciones de despliegue: vLLM es el metodo soportado y documentado (`vllm serve rasyosef/gemma-4-E4B-it-dspark --port 8000 --gpu-memory-utilization 0.8`). El servidor carga el verificador automaticamente desde la configuracion. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: en una A100 40 GB a concurrencia 1, entre 148,4 tokens/s (summarization) y 456,4 tokens/s (math_reasoning), frente a una linea base de aproximadamente 94-98 tokens/s sin drafter.
- Requisitos de software: libreria `transformers` con `custom_code`, `speculators` y una version de vLLM compatible con modelos borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens draft por paso | Speedup medio | Mejores subsets | Licencia |
|---|---|---|---|---|---|
| gemma-4-E4B-it-DSpark (este modelo) | 0,55B | 8 | 2,57× | math_reasoning (4,66×), HumanEval (3,85×), question (2,59×), writing (2,63×) | apache-2.0 |
| google/gemma-4-E4B-it-assistant (MTP) | no disponible | 8 | 2,60× | translation (2,86×), rag (2,23×), tool_call (2,33×), summarization (1,78×) | no disponible |
| Verificador solo (sin drafter) | no disponible | no aplica | 1,00× | no aplica | no disponible |

Ambos borradores comparten el mismo techo de 9,0 tokens de aceptacion al proponer 8 tokens por paso, pero el coste por paso difiere entre ellos, de modo que la longitud de aceptacion por si sola no determina la velocidad final. No se dispone de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no es autonomo: no puede generar texto sin el verificador `google/gemma-4-E4B-it`, que debe estar disponible y cargado.
- El rendimiento no es uniforme: la mejora va de 4,66× en math_reasoning a 1,57× en summarization. En translation, rag, tool_call y summarization el drafter MTP de Google supera a este modelo.
- El vocabulario borrador esta reducido a 32.000 tokens frente a los 262.144 del verificador, lo que puede limitar la cobertura de tokens poco frecuentes y de idiomas con alfabetos o vocabulario especificos.
- Al ser decodificacion especulativa con verificacion, la salida es identica a la del verificador: no introduce alucinaciones adicionales, pero tampoco las corrige.
- Los datos de entrenamiento proceden de `mlabonne/open-perfectblend` regenerado por el verificador; los sesgos de ese corpus y del modelo base se heredan.
- Requiere `custom_code` y `trust_remote_code` en `transformers`, lo que implica ejecutar codigo del repositorio.
- Dependencia fuerte de la version de vLLM y de la libreria `speculators`; cambios de version pueden romper la integracion.
- No hay informacion publicada sobre idiomas soportados, cuantizaciones GGUF/AWQ/GPTQ ni rendimiento en GPU de consumo.
- La licencia es Apache 2.0, que permite uso comercial, pero no se detallan los terminos aplicables al verificador subyacente, que deben consultarse por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rasyosef/gemma-4-E4B-it-dspark
- Modelo base (verificador): https://huggingface.co/google/gemma-4-E4B-it
- Drafter MTP de Google para comparacion: https://huggingface.co/google/gemma-4-E4B-it-assistant
- Libreria `speculators`: https://github.com/vllm-project/speculators
- Codigo de entrenamiento: https://github.com/rasyosef/train-dspark-draft-models
- Dataset de entrenamiento `mlabonne/open-perfectblend`: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Benchmarks de especuladores `RedHatAI/speculator_benchmarks`: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks
