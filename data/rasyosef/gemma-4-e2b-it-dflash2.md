# rasyosef/gemma-4-E2B-it-dflash2

## Resumen

DFlash2 es un modelo borrador (draft model) para decodificación especulativa que se usa junto a `google/gemma-4-E2B-it` como verificador. Lo publica el usuario rasyosef y se ha entrenado con la librería `speculators` del proyecto vLLM. Tiene 323.042.560 parámetros (~0,32B) en bfloat16 y una arquitectura decoder de estilo Qwen3 con solo 5 capas: dimensión oculta 1536, MLP de 6144, 12 cabezas de consulta sobre 4 de clave-valor (GQA, dimensión de cabeza 128) y tamaño de bloque 8.

El problema que resuelve es la latencia de la generación autorregresiva. El borrador propone 7 tokens por paso y el verificador los valida en un único forward pass, de modo que la salida es idéntica a la del verificador en solitario: la aceleración es sin pérdida (lossless). La longitud de aceptación media es de 3,09 tokens comprometidos por paso de verificación, con un máximo de 5,41 en math_reasoning, lo que se traduce en 3,57× de aceleración en math_reasoning y 3,06× en HumanEval, y una media de 2,02× sobre los nueve subconjuntos evaluados.

Su relevancia práctica es que reduce el coste de inferencia sin modificar los pesos del modelo grande ni degradar la calidad, y se distribuye con licencia Apache 2.0. El repositorio no registraba descargas ni likes en el momento de la consulta, y el autor no documenta cuantizaciones alternativas ni una lista explícita de idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo Qwen3, 5 capas de borrador; GQA con 12 cabezas de consulta y 4 de clave-valor (dimensión de cabeza 128); ventana deslizante de 2048 en las 4 primeras capas y atención completa en la última; tamaño de bloque 8 |
| Parámetros totales | 323.042.560 (~0,32B), bfloat16 |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No especificada por el autor para el borrador; entrenado con longitud de secuencia 8192 y prompts preparados a 2048 tokens, con ventana deslizante de 2048 en 4 de las 5 capas |
| Tipos de cuantización | No disponible; los pesos se publican en bfloat16 y no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No especificado por el autor. El vocabulario del borrador es el del verificador, sin reducción (262.144 tokens); Google declara para la familia Gemma 4 soporte en más de 140 idiomas |
| Licencia | Apache 2.0 (coincide con la del verificador) |
| Formato de pesos | safetensors en bfloat16, con `custom_code`; carga mediante transformers y vLLM |
| Modelo verificador | google/gemma-4-E2B-it (obligatorio, no intercambiable) |
| Estados ocultos auxiliares | Capas 3, 13, 23 y 33 del verificador |
| Tamaño del repositorio | 4,7 GB |

## Arquitectura y entrenamiento

El borrador es un decoder de 5 capas con atención de consultas agrupadas (12 cabezas de consulta, 4 de clave-valor, dimensión de cabeza 128), dimensión oculta 1536 y MLP de 6144, lo que da los ~0,32B parámetros. Las cuatro primeras capas usan atención de ventana deslizante de 2048 tokens y la última, atención completa. El bloque de decodificación especulativa es de 8 posiciones: el modelo propone 7 tokens y el verificador añade el token de bonificación. El vocabulario del borrador es exactamente el del verificador, 262.144 tokens, sin reducción, y consume estados ocultos auxiliares extraídos de las capas 3, 13, 23 y 33 del verificador.

El entrenamiento se hizo con la librería `speculators` del proyecto vLLM: 4 épocas con AdamW, learning rate 4e-4 y schedule coseno con un 4% de warmup. El conjunto de datos son 100.000 prompts filtrados de Open PerfectBlend regenerados por el propio verificador, divididos 96/4 en entrenamiento y validación, con prompts preparados a 2048 tokens, longitud de secuencia de entrenamiento de 8192 y hasta 512 anclas por muestra. Los estados ocultos del verificador se solicitaban bajo demanda a un servidor vLLM en ejecución y se eliminaban tras su uso, en lugar de almacenarse en disco previamente. No se documenta RLHF ni DPO para el borrador.

## Capacidades

- Decodificación especulativa sin pérdida: la distribución de salida es idéntica a la del verificador en solitario, porque este valida cada token propuesto.
- Propuesta de 7 tokens por paso de verificación (bloque de 8, incluido el token de bonificación).
- Aceptación muy alta en contenido estructurado y predecible: 5,41 tokens de media en math_reasoning y 4,20 en HumanEval.
- Aceleración de throughput dependiente de la tarea: 3,57× en math_reasoning, 3,06× en HumanEval, 1,98× en traducción, 1,88× en tool_call, 1,61× en rag, 1,35× en summarization.
- Herencia del vocabulario multilingüe del verificador (262.144 tokens), sin lista de idiomas publicada por el autor.
- Integración con vLLM mediante un endpoint compatible con la API de OpenAI; el verificador se carga automáticamente desde la configuración.
- No es un modelo autónomo: no genera texto por sí solo ni se puede usar sin el verificador.
- No se documentan capacidades de visión, audio, tool calling ni modo de razonamiento propias del borrador; las métricas de tool_call miden el comportamiento del conjunto verificador más borrador.
- Soporte de `custom_code` en transformers, además del soporte nativo en vLLM.

## Casos de uso

- Servicio de razonamiento matemático de alto rendimiento: es el escenario con mayor aceptación (5,41 tokens por paso, 3,57× de aceleración, 597,7 tokens/s en una A100). Adecuado para tutores de matemáticas, verificación de demostraciones o resolución de problemas paso a paso donde el texto generado es muy predecible.
- Asistencia de código en IDE o editor: en HumanEval alcanza 505,1 tokens/s y 3,06× de aceleración, el mayor margen frente al borrador alternativo DSpark (2,42×). El autocompletado y la generación de funciones se benefician de la alta tasa de aceptación en posiciones 1 a 4.
- Generación de código en producción dentro de pipelines de CI/CD: el despliegue con `vllm serve` expone un endpoint compatible con OpenAI, de modo que puede integrarse en tareas de generación de tests, parches o documentación sin cambiar el código del verificador ni la calidad de la salida.
- Traducción automática: 1,98× de aceleración y 2,84 tokens de aceptación media. Útil en servicios de traducción por lotes o en tiempo real donde se quiere reducir el coste por token manteniendo exactamente la salida del verificador.
- Atención al cliente con recuperación aumentada (RAG): 1,61× de aceleración en el subconjunto rag (247,4 tokens/s frente a 153,3 de la línea base). La ganancia es moderada porque el texto de respuesta es menos predecible, pero el coste computacional por consulta baja sin alterar las respuestas.
- Agentes con tool calling: 1,88× de aceleración en el subconjunto tool_call (292,5 tokens/s). Aprovechable en flujos multi-paso donde el modelo emite llamadas a funciones y observaciones con estructura repetitiva.
- Resumen por lotes fuera de línea: 1,35× de aceleración (215,3 tokens/s), la ganancia más baja de todas las tareas evaluadas, pero todavía positiva para procesar grandes volúmenes de documentos.
- Sustitución de infraestructura de inferencia sin reentrenamiento: al ser un borrador independiente con licencia Apache 2.0, se puede añadir a un despliegue existente de `gemma-4-E2B-it` en vLLM para reducir latencia sin tocar el modelo verificado.

## Benchmarks y rendimiento

Longitud de aceptación (tokens comprometidos por paso de verificación, incluido el token de bonificación; suelo 1,0 y techo 8,0 con bloque de 8) sobre los nueve subconjuntos de `RedHatAI/speculator_benchmarks`:

| Subconjunto | acceptance_length | pos_0 | pos_1 | pos_2 | pos_3 | pos_4 | pos_5 | pos_6 |
|---|---|---|---|---|---|---|---|---|
| math_reasoning | 5,408 | 88,4% | 78,2% | 69,8% | 61,4% | 54,1% | 47,6% | 41,2% |
| HumanEval | 4,200 | 79,4% | 63,8% | 51,3% | 41,8% | 34,2% | 27,6% | 21,9% |
| tool_call | 2,916 | 65,2% | 43,0% | 29,4% | 21,2% | 15,4% | 10,6% | 6,9% |
| translation | 2,840 | 64,6% | 43,2% | 29,2% | 19,8% | 13,1% | 9,0% | 5,1% |
| rag | 2,792 | 68,1% | 43,8% | 28,1% | 17,5% | 10,9% | 7,1% | 3,6% |
| question | 2,648 | 60,6% | 36,1% | 23,4% | 16,6% | 12,4% | 9,0% | 6,7% |
| writing | 2,647 | 59,7% | 36,1% | 23,5% | 16,8% | 12,6% | 9,3% | 6,8% |
| qa | 2,248 | 55,4% | 29,9% | 16,9% | 10,4% | 6,6% | 3,7% | 2,0% |
| summarization | 2,111 | 56,0% | 27,8% | 13,7% | 7,2% | 3,9% | 1,8% | 0,7% |

Media ponderada de todos los subconjuntos: 3,094 sobre 108.043 pasos de verificación.

Throughput (tokens/s) en una única A100 con concurrencia máxima 1. La línea base es `gemma-4-E2B-it` sin decodificación especulativa:

| Subconjunto | Baseline (sin borrador) | DSpark | DFlash2 (este modelo) |
|---|---|---|---|
| math_reasoning | 167,6 | **626,5 (3,74×)** | 597,7 (3,57×) |
| HumanEval | 164,9 | 399,3 (2,42×) | **505,1 (3,06×)** |
| tool_call | 155,3 | 275,8 (1,78×) | **292,5 (1,88×)** |
| translation | 168,2 | 298,5 (1,77×) | **332,4 (1,98×)** |
| rag | 153,3 | 216,4 (1,41×) | **247,4 (1,61×)** |
| question | 167,3 | **272,2 (1,63×)** | 262,8 (1,57×) |
| writing | 166,7 | **268,3 (1,61×)** | 267,7 (1,61×) |
| qa | 166,2 | **261,6 (1,57×)** | 250,6 (1,51×) |
| summarization | 159,9 | 194,0 (1,21×) | **215,3 (1,35×)** |
| Aceleración media | 1,00× | 1,90× | **2,02×** |

No se han publicado resultados de benchmarks de calidad (MMLU, GSM8K u otros) porque el borrador no altera la salida del verificador: cualquier métrica de calidad es la de `gemma-4-E2B-it`.

## Requisitos de hardware

- Pesos del borrador: 323.042.560 parámetros en bfloat16 equivalen a unos 0,65 GB. Con caché KV (5 capas, 4 cabezas KV por capa) y overhead del runtime, la estimación razonable es de 0,8 a 1,2 GB adicionales sobre el verificador.
- El borrador no se ejecuta solo: hay que sumar el coste del verificador `gemma-4-E2B-it`. El informe técnico de Gemma 4 sitúa la familia entre 2,3B y 31B parámetros; no se detalla el desglose exacto de la variante E2B en la información disponible.
- GPU probada por el autor: una única A100, con concurrencia máxima 1 y `--gpu-memory-utilization 0.8`.
- GPU de consumo: no se publican pruebas. Dado que el borrador solo añade ~0,65 GB de pesos, cabe en cualquier GPU que ya pueda servir el verificador, como una RTX 4090 o una RTX 3090, siempre que la memoria restante sea suficiente para el verificador y su caché KV.
- Opciones de despliegue: vLLM es la vía documentada (`vllm serve rasyosef/gemma-4-E2B-it-dflash2 --port 8000 --gpu-memory-utilization 0.8`), con endpoint compatible con OpenAI en `http://localhost:8000/v1`. También se declara soporte de transformers con `custom_code` y la librería `speculators`. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 155 a 168 tokens/s de línea base en A100 a concurrencia 1; con DFlash2 se alcanzan 597,7 tokens/s en math_reasoning y 505,1 en HumanEval. La aceleración media es 2,02× y la desviación entre tareas es grande (de 1,35× en summarization a 3,57× en math_reasoning).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Bloque | Aceleración media | Licencia |
|---|---|---|---|---|---|
| gemma-4-E2B-it (verificador, sin borrador) | Modelo generativo completo | No disponible el desglose de E2B; familia entre 2,3B y 31B | No aplica | 1,00× | Apache 2.0 |
| gemma-4-E2B-it-dspark | Borrador para el mismo verificador | No disponible | No disponible | 1,90× | Apache 2.0 |
| DFlash2 (este modelo) | Borrador para el mismo verificador | 323.042.560 (~0,32B) | 8 (7 tokens propuestos) | 2,02× | Apache 2.0 |

Frente a DSpark, DFlash2 gana en HumanEval (3,06× frente a 2,42×), traducción (1,98× frente a 1,77×), rag (1,61× frente a 1,41×), summarization (1,35× frente a 1,21×) y tool_call (1,88× frente a 1,78×); pierde en math_reasoning (3,57× frente a 3,74×), question (1,57× frente a 1,63×) y qa (1,51× frente a 1,57×); en writing empatan. La documentación de Google indica que todos los modelos Gemma 4 incluyen un borrador propio para decodificación especulativa, pero no se dispone de datos de parámetros, bloque ni aceleración de ese borrador nativo para compararlo con DFlash2.

## Limitaciones y advertencias

- Solo funciona con `google/gemma-4-E2B-it`; no es utilizable como modelo independiente ni con otros verificadores.
- La aceptación cae bruscamente a partir de las dos primeras posiciones en tráfico tipo prosa: en summarization la posición 6 solo se acepta el 0,7% de las veces y el bloque completo casi nunca se aprovecha. Las ganancias se concentran en matemáticas y código.
- La aceleración real depende de la mezcla de tráfico. Un despliegue con mucho texto libre o resumen verá un 1,2× a 1,4× en lugar del 2,02× medio, mientras que uno centrado en matemáticas o código se acercará o superará el 3×.
- Al ser una verificación sin pérdida, el borrador hereda íntegramente los sesgos, alucinaciones y limitaciones del verificador; no los corrige ni los atenúa.
- No se documentan cuantizaciones (GGUF, AWQ, GPTQ) ni soporte fuera de bfloat16, lo que limita su uso en hardware con poca memoria o en runtimes de CPU.
- No hay lista publicada de idiomas soportados para el borrador; el comportamiento multilingüe es el del verificador, cuyo vocabulario de 262.144 tokens se reutiliza sin reducción.
- El repositorio no registraba descargas ni likes en el momento de la consulta y no está en la pipeline de transformers, lo que indica ausencia de validación por parte de terceros.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar por separado los términos aplicables al verificador en su propia ficha.
- Al requerir el servidor vLLM del verificador para extraer estados ocultos durante el entrenamiento, reproducir el pipeline exige infraestructura de GPU adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rasyosef/gemma-4-E2B-it-dflash2
- Modelo verificador: https://huggingface.co/google/gemma-4-E2B-it
- Borrador alternativo DSpark: https://huggingface.co/rasyosef/gemma-4-E2B-it-dspark
- Código de entrenamiento: https://github.com/rasyosef/train-dspark-draft-models
- Librería speculators (vLLM): https://github.com/vllm-project/speculators
- Dataset de entrenamiento Open PerfectBlend: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de evaluación speculator_benchmarks: https://huggingface.co/datasets/RedHatAI/speculator_benchmarks
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Visión general de Gemma 4 para desarrolladores: https://ai.google.dev/gemma/docs/core
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Informe técnico de Gemma 4: https://arxiv.org/html/2607.02770v2
