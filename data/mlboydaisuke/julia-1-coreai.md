# mlboydaisuke/Julia-1-CoreAI

## Resumen

Julia-1-CoreAI es la conversión a formato Apple Core AI del modelo Julia-1 de Supersonic Labs, un modelo de decisión tipada de 144 millones de parámetros que no genera texto: recibe un estado y una pregunta con entre 2 y 20 opciones y devuelve una probabilidad para cada opción en una sola pasada forward. La conversión la publica el usuario mlboydaisuke como parte del ecosistema Core AI Model Zoo, y produce bundles `.aimodel` ejecutables en la GPU o el Neural Engine de dispositivos Apple con iOS 27 / macOS 27.

El modelo se apoya en un encoder ModernBERT (concretamente mmBERT-small de jhu-clsp), con 22 capas, dimensión oculta 384, 6 cabezas de 64 dimensiones y MLP con activación GLU de 1152. Sobre el encoder se añade un type embedding, dos capas transformer pre-norm y un scorer que reduce a un único logit por marcador de opción. Soporta tres modos de decisión: `choice` (elegir una opción), `score` (situar el estado en una rúbrica ordenada) y `noul` (responder falso o verdadero).

Su relevancia actual radica en que demuestra inferencia de decisión estructurada totalmente on-device: en una GPU M4 Max resuelve cada decisión en 16,00 ms con ventana de 1.024 tokens, con pesos y cómputo en fp32, sin generación de texto y sin necesidad de calibración de temperatura. Es un componente útil como enrutador o clasificador dentro de pipelines de agentes que corren localmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer ModernBERT (mmBERT-small) con atención global alterna y sliding window, más type embedding, dos capas transformer pre-norm y un scorer lineal |
| Parametros totales | 144 M (modelo base Julia-1) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana fija de 512 o 1.024 tokens (S); presupuesto de cabeza (pregunta más opciones) de 256 tokens con S=512 y 512 tokens con S=1.024 |
| Tipos de cuantizacion | fp32 (pesos y cómputo); no se documentan variantes cuantizadas |
| Idiomas soportados | multilingüe (etiqueta del repositorio; sin lista explícita de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | .aimodel (bundle de Apple Core AI), exportado desde PyTorch con coreai-torch (coreai.llm.export) |

## Arquitectura y entrenamiento

El encoder interno es mmBERT-small en disposición ModernBERT: 22 capas, hidden 384, 6 cabezas de 64 dimensiones, MLP GLU de 1152, atención global en las capas 0, 3, ..., 21 y sliding window de radio inclusivo 64 en el resto, RoPE con theta 160.000 y vocabulario de 256.000 tokens. Tras el encoder vienen un type embedding, dos capas transformer pre-norm (384 de ancho, 6 cabezas, FFN ReLU de 1536) y el scorer, que aplica LayerNorm → Linear → GELU → Linear hasta un único logit. El checkpoint contiene además una act head (Linear 388 → 256, GELU, Linear 256 → 2) y un buffer de temperatura de [1, 1, 1], pero ninguno de los dos se incluye en el grafo, porque la API de inferencia del publicador llama a `forward(..., return_actions=False)`, no usa temperatura y declara `calibration: null`.

El contrato del grafo expone tres entradas (`input_ids` [1, S] int32 con padding a la derecha, `attention_mask` [1, S] int32 y `qtype_onehot` [1, 3] fp32 para choice / score / noul) y una salida (`token_logits` [1, S] fp32). La lectura se hace sobre los logits en las posiciones de los marcadores `[MASK]` de cada opción. El modelo no genera texto ni decodifica de forma autorregresiva: devuelve la softmax de los logits crudos a T = 1 sin calibración. La fila de entrada se construye como `[CLS 2] tipo y pregunta [SEP 1] (marcador + opción) [SEP 1] estado [SEP 1]`, con cada pieza tokenizada por separado y los estados en formato JSON cuando son dict o lista. La codificación es estricta: entre 2 y 20 opciones, cada una de 48 tokens como máximo, y una pregunta que requiera cualquier truncamiento se rechaza en lugar de recortarse.

En cuanto al entrenamiento, esta publicación es una conversión de formato (Core AI), no un reentrenamiento. Los datos de entrenamiento del modelo base Julia-1 (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada; la única referencia económica es que el entrenamiento del modelo base costó aproximadamente 104 dólares estadounidenses según la nota de prensa citada.

## Capacidades

- Decisión de elección múltiple (`choice`): dado un estado y una pregunta con 2 a 20 opciones definidas por el llamador, devuelve la opción ganadora como id.
- Puntuación en rúbrica ordenada (`score`): sitúa el estado en una escala ordenada y devuelve el índice esperado de la rúbrica, calculado como suma de i·p_i sin redondear.
- Respuesta booleana (`noul`): responde falso o verdadero y devuelve la probabilidad de verdadero.
- Salida probabilística completa: una probabilidad por opción en una única pasada forward, sin generación de texto.
- Determinismo: la lectura usa softmax a T = 1 y no aplica calibración.
- Multilingüe: el encoder subyacente es mmBERT, marcado como multilingüe en el repositorio.
- Procesamiento de estados estructurados: acepta mensajes de texto o registros JSON (dict o lista) como estado de entrada.
- Ejecución estricta y sin truncamiento: rechaza preguntas que no encajen en el presupuesto de cabeza en lugar de recortarlas.
- No soporta tool calling ni function calling (no genera texto), aunque puede usarse como componente de decisión dentro de un agente.
- Procesamiento por lotes no soportado: el grafo está fijado a batch 1.

## Casos de uso

- Enrutamiento de intenciones on-device: el modelo puede actuar como clasificador de intención en una app iOS, eligiendo entre un conjunto de rutas predefinidas con latencias de 16,00 ms por decisión en GPU M4 Max y sin enviar datos a la nube.
- Puerta de validación booleana: usar el modo `noul` para decidir si una respuesta o acción cumple un criterio (por ejemplo, aprobar o rechazar una solicitud) con una única probabilidad de verdadero.
- Puntuación de calidad o riesgo en rúbricas: en moderación de contenido o evaluación de respuestas, el modo `score` devuelve un índice esperado continuo sobre una escala ordenada definida por el llamador, útil para umbrales ajustables.
- Selección de herramienta o acción en agentes: integrado en un agente que corre localmente, el modelo puede elegir la siguiente acción entre un conjunto de 2 a 20 candidatas a partir del estado en JSON del agente, sin generar texto intermedio.
- Clasificación de registros estructurados: al aceptar estados en formato JSON, permite clasificar o priorizar entradas de sistemas (tickets, eventos, logs) con la misma interfaz de decisión.
- Filtros de baja latencia en el borde: por su tamaño (144 M) y su ventana de decisión, encaja en flujos donde se necesitan muchas decisiones por segundo en un dispositivo Apple sin acelerador dedicado.
- Procesamiento por lotes offline sobre Apple Silicon: las mediciones del publicador cubren 2.120 filas a S=1.024 y 2.100 filas a S=512 en una sola ejecución, lo que permite usarlo en tareas de anotación o evaluación por lotes en un Mac.
- Componente de desambiguación en pipelines multilingües: apoyado en mmBERT, puede resolver decisiones de clasificación en varios idiomas sin depender de un LLM generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (MMLU, HumanEval, GSM8K u otros) en la información disponible. Lo que sí se publica es una tabla de paridad y latencia de la conversión frente a la implementación PyTorch original, medida en un Apple M4 Max con macOS 27.0 build 26A428, coreai-build 3600.83.1 y coreai-core 1.0.0b2 (2026-09-30). `cpu_only` es la opción de paridad. El tiempo por pregunta cubre las entradas NumPy, el grafo y la recolección de marcadores, sin incluir la tokenización.

| Variante | S | Computo | Filas | Argmax | Max abs diff p | Marker max diff | Deriva repetida | Carga | Mediana en caliente |
|---|---:|---|---:|---:|---:|---:|---:|---:|---:|
| fp32 | 1024 | GPU | 2.120 | 2.120/2.120 | 8,58e-5 | 5,71e-4 | 0 | 641 ms | 16,00 ms |
| fp32 | 512 | GPU | 2.100 | 2.100/2.100 | 7,97e-5 | dato truncado en la fuente | no disponible | no disponible | no disponible |

Además, el publicador indica que 2.000 preguntas del test de decisiones tipadas caben en 1.024 tokens (la más larga ocupa 607) y que 1.965 caben en 512 tokens. Las cabeceras de carga y latencia se refieren a la conversión Core AI, no a la precisión de la tarea.

## Requisitos de hardware

- Plataforma objetivo: runtime Apple Core AI en iOS 27 / macOS 27, con ejecución en GPU o Neural Engine; sucesor de Core ML.
- Tamaño del repositorio: 1,2 GB (incluye los bundles `.aimodel` para S=512 y S=1.024).
- Precisión: fp32 tanto en pesos como en cómputo, sin variantes cuantizadas documentadas.
- Latencia medida: 16,00 ms por decisión a S=1.024 en la GPU de un M4 Max, con tiempo de carga de 641 ms y deriva de repetición de 0.
- Memoría y VRAM en GPU discreta: no disponible; el modelo está empaquetado para Apple Silicon y no se publican estimaciones de VRAM para A100, H100 o RTX.
- Opciones de despliegue: bundles `.aimodel` mediante el runtime Core AI; el adapter de host de referencia está en el proyecto julia-coreai. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible más allá de los tiempos por fila de la tabla de paridad (2.120 filas procesadas en la ejecución de S=1.024).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Julia-1-CoreAI (esta ficha) | 144 M | 512 / 1.024 tokens | Modelo de decisión (encoder mmBERT-small) | apache-2.0 | Bundle Core AI; sin fila en DeviceMark |
| laya-multilingual | no disponible | misma interfaz de grafo | Modelo de decisión sobre mmBERT-base | no disponible | Core AI Model Zoo |
| SupersonicLabs/Julia-1 | 144 M | no disponible | Modelo de decisión en PyTorch | apache-2.0 | HuggingFace (modelo fuente) |
| jhu-clsp/mmBERT-small | base del encoder | no disponible | Encoder multilingüe | no disponible | HuggingFace (modelo base) |

La diferencia principal frente a laya-multilingual, que comparte diseño e interfaz de grafo sobre mmBERT-base, está en el formato de las opciones: los hosts de laya renderizan `label: description`, `level i: …` y `false: …` / `true: …`, mientras que Julia usa sus propias filas, de modo que un host de laya construiría filas distintas y obtendría otras respuestas. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta decodificación autorregresiva y no puede usarse para chat ni para generación de código.
- Ventana y presupuesto estrictos: entre 2 y 20 opciones, cada una de 48 tokens como máximo, con un presupuesto de cabeza de 512 tokens en S=1.024 y 256 en S=512. Una pregunta que requiera truncamiento se rechaza directamente.
- Sin calibración: la lectura es la softmax cruda a T = 1 y `calibration: null`, por lo que las probabilidades devueltas pueden no estar bien calibradas para umbrales de producción.
- Batch fijo a 1: el grafo no soporta lotes, lo que limita el throughput en despliegues por lotes.
- Detalles de entrenamiento no disponibles: se desconoce la composición del dataset, el número de tokens y si hubo RLHF o DPO en el modelo base, por lo que no se pueden evaluar sesgos conocidos ni riesgos de alucinación de forma documentada.
- Idiomas: aunque el repositorio se marca como multilingüe, no se publica una lista de idiomas soportados ni evaluaciones por idioma.
- Es una conversión, no un modelo nuevo: los bundles dependen del runtime Core AI (iOS 27 / macOS 27) y no se documentan formatos alternativos como GGUF o safetensors para esta publicación.
- Licencia apache-2.0 en el modelo base y en la conversión, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base y del runtime Core AI antes de un despliegue en producción.
- Cero descargas y cero likes en el repositorio en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlboydaisuke/Julia-1-CoreAI
- Modelo base: https://huggingface.co/SupersonicLabs/Julia-1
- Conversión en GitHub (maxffarrell): https://github.com/maxffarrell/julia-coreai
- Core AI Model Zoo, ficha de Julia-1: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/julia-1/README.md
- Ficha de laya-multilingual en el zoo: https://github.com/john-rocky/coreai-model-zoo/blob/main/models/laya-multilingual/README.md
- Apple coreai-models: https://github.com/apple/coreai-models
- Benchmark de LLM en Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench
- DeviceMark (leaderboard on-device): https://devicemark.github.io/
- Colección Core AI Model Zoo en HuggingFace: https://huggingface.co/collections/mlboydaisuke/core-ai-model-zoo
- Nota de prensa sobre Julia-1 (144 M y coste de entrenamiento): https://dev.to/jamilxt/julia-1-a-144m-parameter-decision-model-trained-for-104-59i2
- Otro modelo del autor en Core AI: https://huggingface.co/mlboydaisuke/Agents-A1-4B-CoreAI/tree/main
