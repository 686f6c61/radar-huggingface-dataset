# Kodjaoglanian/omega-squad-v2

## Resumen

System Omega — SQuAD v2 es un modelo de question answering extrativo construido por Kodjaoglanian sobre `answerdotai/ModernBERT-base`. A diferencia de un modelo generativo, no produce texto libre: recibe una pregunta y un contexto, y devuelve un span literal del contexto o una decisión explícita de "sin respuesta". Para ello añade dos cabezas sobre el encoder ModernBERT de ~150M de parámetros: una cabeza de decisión de answerabilidad (pooling [mean-pool; CLS] seguido de un MLP) y una cabeza de extracción de span (una proyección lineal de la dimensión oculta a 2 logits por token, para inicio y fin).

Su relevancia práctica está en el ámbito de los pipelines RAG y de QA sobre documentación cerrada. La mayoría de los sistemas de recuperación aumentada delegan la respuesta final a un modelo generativo, que puede alucinar cuando el contexto recuperado no contiene la respuesta. Este modelo aborda precisamente ese problema: la cabeza de decisión determina si la pregunta es respondible con el contexto dado (87,71 % de accuracy de decisión en el test interno del autor, 50/50 balanceado), lo que permite descartar o derivar consultas antes de invocar a un LLM generativo.

El modelo es muy pequeño (repo de 0,3 GB, pesos en bf16), extremadamente rápido (8,07 ms de latencia en bf16, 622 req/s con batch de 32) y se entrenó en 434 segundos sobre una GPU L40S. Está publicado con licencia Apache 2.0 y con código de modelado propio (`modeling_omega.py`) que hay que descargar junto a los pesos. El uso requiere respetar un formato de entrada muy concreto: `INSTRUCTION: <pregunta> | CONTEXT: <contexto>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-base) con doble cabeza: decisión de answerabilidad ([mean-pool; CLS] -> MLP) y extracción de span (Linear(hidden, 2) por token) |
| Parametros totales | ~150M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; el ejemplo de uso trunca a 512 tokens. El modelo base ModernBERT-base soporta hasta 8192, pero la ficha no confirma ese límite para este fine-tune |
| Tipos de cuantizacion | No disponible. Los pesos se publican en bf16; no se han publicado versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible en los metadatos. El entrenamiento se realizó sobre SQuAD v2 (inglés), por lo que el soporte efectivo es en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado en la ficha; el repositorio (0,3 GB) incluye `modeling_omega.py` y pesos en bf16 para PyTorch/Transformers |

## Arquitectura y entrenamiento

La arquitectura parte de ModernBERT-base y le superpone dos cabezas sobre el mismo encoder en un único forward pass. La cabeza de decisión concatena el mean-pooling de los tokens con el embedding del token CLS y lo pasa por un MLP que produce una clasificación binaria (respondible / no respondible). La cabeza de span aplica una proyección lineal de la dimensión oculta a 2 logits sobre cada token, generando matrices de logits de inicio y fin. La decodificación se realiza mediante `decode_spans`, que hace argmax sobre la matriz de pares (start, end) válidos, reservando la posición (0,0) como marcador de "sin respuesta".

El entrenamiento utilizó el conjunto oficial de SQuAD v2 con 48.000 muestras balanceadas 50/50 (40.800 de entrenamiento y 7.200 de test), durante 4 épocas con batch de 64, learning rate 5e-5, warmup del 5 % y decaimiento lineal. La función de pérdida combina entropía cruzada para la decisión (con label smoothing de 0,05) más la media de las entropías cruzadas de inicio y fin. Se emplearon length bucketing, trim dinámico, autocast en bf16 y semilla 42. No se menciona en la información disponible ninguna fase de RLHF, DPO ni ajuste por preferencias.

Como innovación destacable, el autor señala que el modelo iguala o supera en accuracy de decisión a alternativas mucho mayores (Laya, con 421M de parámetros) con menos de la mitad del tamaño y aproximadamente 4 veces menos latencia, manteniéndose en la clase de arquitecturas encoder de un solo forward pass.

## Capacidades

- Question answering extrativo: localiza y devuelve el fragmento literal del contexto que responde a la pregunta.
- Detección de answerabilidad: clasifica si la pregunta es respondible o no con el contexto proporcionado, mediante una cabeza de decisión dedicada.
- Decodificación de spans con argmax sobre pares (start, end) válidos, con la posición (0,0) reservada para el caso de no respuesta.
- Entrada con formato obligatorio: `INSTRUCTION: <pregunta> | CONTEXT: <contexto>`.
- Inferencia en un único forward pass, sin generación autorregresiva.
- No soporta generación de texto libre, razonamiento multi-paso, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; el entrenamiento es sobre SQuAD v2 en inglés.
- Sin capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Filtrado de answerabilidad en pipelines RAG: antes de invocar a un LLM generativo, se comprueba con este modelo si el contexto recuperado contiene la respuesta. Si la cabeza de decisión devuelve "no respondible", el sistema puede reformular la consulta, ampliar la recuperación o responder que no hay información, reduciendo el riesgo de alucinación.
- QA extractivo con cita verificable: en documentación técnica, normativa o manuales, el modelo devuelve el span literal, lo que permite mostrar la fuente exacta y auditar la respuesta. Es adecuado porque su salida es siempre un fragmento del contexto, no una paráfrasis.
- Extracción de campos en documentos estructurados o semiestructurados: plantear preguntas tipo "¿cuál es la fecha de entrada en vigor?" o "¿quién es el arrendatario?" sobre contratos, facturas o pólizas, y recuperar el valor textual exacto.
- Atención al cliente sobre base de conocimiento cerrada: responder consultas frecuentes a partir de artículos internos, con la ventaja de que el modelo indica explícitamente cuándo la respuesta no está en el artículo recuperado.
- Enrutado y triaje de tickets: usar la salida de la cabeza de decisión para clasificar automáticamente si un ticket puede resolverse con la documentación existente o debe escalarse a un agente humano.
- Servicio de QA a gran escala con requisitos de throughput: sus 622 req/s con batch de 32 y 8,07 ms de latencia en bf16 lo hacen viable para indexado masivo de corpus o para responder consultas en tiempo real sobre catálogos grandes.
- Anotación y evaluación de conjuntos de datos tipo SQuAD: generar spans candidatos y etiquetas de answerabilidad para preanotar corpus de QA antes de la revisión humana.
- Evaluación comparativa de recuperadores: dado un retriever, medir con este modelo qué porcentaje de consultas quedan cubiertas por el contexto recuperado, gracias a la métrica de answerabilidad.

## Benchmarks y rendimiento

Resultados publicados por el autor en su test propio 50/50 de answerability (7.199 muestras):

| Metrica | Valor |
|---|---|
| Accuracy de decisión (vía A) | 87,71 % |
| Macro-F1 de decisión | 87,71 % |
| Recall sin-respuesta | 87,27 % |
| Recall respondible | 88,15 % |
| EM pipeline (decisión + span) | 74,14 % |
| Token-F1 pipeline | 80,42 % |
| EM solo en respondibles | 59,35 % |
| Latencia (bf16) | 8,07 ms |
| Throughput con batch de 32 | 622 req/s |
| Tiempo de entrenamiento | 434 s (GPU L40S) |

Nota del autor recogida en la ficha: el test 50/50 de answerability es el protocolo interno de System Omega, y la comparación con Laya y Jev utiliza los números públicos de esos modelos (typed-decisions). No se han publicado resultados en la información disponible para benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a un modelo extrativo de QA.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en bf16 (150M de parámetros) y alrededor de 0,6 GB en fp32, sin contar el tokenizador ni los buffers de activaciones.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso GPUs antiguas con pocos GB de VRAM. También es viable en CPU para cargas moderadas.
- GPU recomendadas para servicio: cualquier GPU moderna con soporte bf16; para entrenamiento el autor reporta una L40S con 434 s de tiempo total. Para entrenamiento desde cero serían suficientes GPUs de gama media tipo RTX 4090 o A10.
- Opciones de despliegue: PyTorch/Transformers con el fichero `modeling_omega.py` incluido en el repositorio (imprescindible descargarlo al mismo directorio). Es exportable a ONNX o TorchScript para servir con FastAPI, Triton o similares. vLLM, TGI, llama.cpp y Ollama no lo soportan de forma nativa, ya que no es un modelo generativo causal y usa una clase de modelado personalizada.
- Latencia y throughput: 8,07 ms por inferencia en bf16 y 622 req/s con batch de 32, según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Accuracy de decisión | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| System Omega — SQuAD v2 | ~150M | 87,71 % | 8,07 ms (bf16) | Apache 2.0 | HuggingFace (repo de 0,3 GB) |
| Laya (referencia citada por el autor) | 421M | 76,6 % | ~4x la de Omega, según el autor | No disponible | No disponible |
| Jev 1.13 (referencia citada por el autor) | No disponible | 72,7 % | No disponible | No disponible | No disponible |

Advertencia: los datos de Laya y Jev proceden de los números públicos citados en la propia model card y no se han verificado de forma independiente. El autor indica que la comparación es válida porque los tres son encoders de un solo forward pass con clases de arquitectura y latencia comparables. Para benchmarks estándar de SQuAD v2 frente a alternativas consolidadas (por ejemplo, variantes de DeBERTa o RoBERTa ajustadas a SQuAD v2), no hay datos disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documenta ningún análisis de sesgos en la información disponible. Al entrenarse sobre SQuAD v2, hereda las características y sesgos de ese corpus, compuesto por artículos de Wikipedia en inglés.
- Riesgo de alucinación: bajo por diseño, ya que la respuesta es siempre un span literal del contexto. El riesgo se traslada a la extracción: el modelo puede seleccionar un span incorrecto cuando la pregunta es respondible pero el contexto es ambiguo.
- Calibración de la answerabilidad: el test del autor es 50/50 balanceado. En producción, la proporción real de preguntas respondibles puede ser muy distinta, lo que afectaría al umbral óptimo de decisión. No se documentan curvas de calibración ni umbrales recomendados.
- Limitación de idioma: el entrenamiento es sobre SQuAD v2 en inglés. El comportamiento en castellano u otros idiomas no está documentado ni validado.
- Formato de entrada rígido: el modelo espera exactamente `INSTRUCTION: <pregunta> | CONTEXT: <contexto>`. Cualquier desviación del formato puede degradar el rendimiento de forma significativa.
- Longitud de contexto: el ejemplo oficial trunca a 512 tokens. Contextos más largos podrían quedar fuera del rango útil si el fine-tune no generaliza a la ventana completa del modelo base.
- Dependencia de código personalizado: requiere `modeling_omega.py` del repositorio. No es plug-and-play con `AutoModelForQuestionAnswering`, lo que complica su integración en plataformas que esperan arquitecturas estándar.
- Sin soporte en frameworks de servicio habituales: no funciona con vLLM, TGI, llama.cpp ni Ollama sin trabajo adicional de exportación.
- Adopción nula: el modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de los resultados publicados.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia correspondientes. No se documentan restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kodjaoglanian/omega-squad-v2
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset SQuAD v2: https://rajpurkar.github.io/SQuAD-explorer/
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo, su paper ni su repositorio; los únicos resultados obtenidos fueron páginas generales de ChatGPT y OpenAI, sin relación con el modelo descrito.
