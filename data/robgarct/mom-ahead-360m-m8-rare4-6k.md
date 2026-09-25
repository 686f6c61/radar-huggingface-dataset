# robgarct/mom-ahead-360m-m8-rare4-6k

## Resumen

mom-ahead-360m-m8-rare4-6k es un modelo de lenguaje de tipo Mixture-of-Memories (MoM) desarrollado por el usuario robgarct y publicado en HuggingFace bajo la librería `recurrent-recall-circuits`. Se trata de una arquitectura de attention linear con mecanismos de memoria explícitos, diseñada específicamente para mejorar el recuerdo en contexto (in-context recall) sin renunciar al coste lineal en la longitud de secuencia. El modelo tiene 446,6 millones de parámetros totales (incluyendo 51,5 millones de embeddings y el extractor de características "ahead"), con una dimensión de embedding de 1.024, 24 capas y 16 cabezas de atención.

El modelo incorpora 8 bancos de memoria por capa, una puerta de escritura basada en softmax top-4 con estimación directa (straight-through) y una puerta de lectura densa con softplus (`read_top_k: null`). Esta combinación busca resolver el problema clásico de las arquitecturas de attention linear: su dificultad para recuperar información concreta de secuencias largas. El router de lectura "ahead-feature" es la innovación central del checkpoint, ya que decide qué banco de memoria consultar en cada paso.

El entrenamiento se realizó sobre The Pile durante 6.000 actualizaciones (3.146 mil millones de tokens, batch global de 256 secuencias de 2.048 tokens) con el objetivo `rare4` y semilla 1111, alcanzando una perplejidad de validación de 10,17. Es un modelo de investigación, con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y con resultados de benchmarks limitados a pruebas de recuerdo en contexto (FDA y SWDE).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Memories con attention linear, router de lectura "ahead-feature" y puertas de escritura/lectura por capa |
| Parametros totales | 446,6 M (incluye 51,5 M de embeddings y el extractor de características ahead); la nomenclatura "360M" del nombre hace referencia al backbone sin embeddings |
| Parametros activos | no disponible (no es un MoE de expertos; usa 8 bancos de memoria por capa con escritura dispersa top-4) |
| Longitud de contexto | no disponible de forma explícita; el entrenamiento usó secuencias de 2.048 tokens |
| Tipos de cuantizacion | no disponible (el repositorio no publica versiones cuantizadas) |
| Idiomas soportados | no disponible (entrenado sobre The Pile, corpus mayoritariamente en inglés) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de PyTorch (`final.ckpt`, con el estado del optimizador eliminado); sin safetensors ni GGUF |
| n_embd / n_layer / n_head | 1.024 / 24 / 16 |
| Bancos de memoria | 8 por capa |
| Puerta de escritura | softmax top-4 con straight-through |
| Puerta de lectura | softplus densa (`read_top_k: null`) |
| Objetivo de entrenamiento | `rare4`, semilla 1111 |
| Paso global | 6.000 |
| Tamaño del repositorio | 1,6 GB |
| Librería | `recurrent-recall-circuits` |

## Arquitectura y entrenamiento

La arquitectura se enmarca en la familia de attention linear con memoria recurrente. Cada capa incorpora 8 bancos de memoria y dos puertas diferenciadas: una puerta de escritura que aplica softmax top-4 con straight-through estimator —es decir, solo se actualizan las 4 ranuras más relevantes en cada paso, lo que da nombre al objetivo `rare4`— y una puerta de lectura densa basada en softplus, sin límite superior de ranuras (`read_top_k: null`). El componente "ahead" es un extractor de características que alimenta al router de lectura, encargado de seleccionar qué banco de memoria consultar. Esta separación entre escritura dispersa y lectura densa es un patrón habitual en los circuitos de recuerdo recurrente: la escritura debe ser selectiva para no saturar la memoria, mientras que la lectura puede permitirse ser exhaustiva.

El entrenamiento se llevó a cabo sobre The Pile con 6.000 actualizaciones, un batch global de 256 secuencias de 2.048 tokens y un total de 3.146 mil millones de tokens procesados, con semilla 1111. No se documenta en la información disponible el uso de RLHF, DPO u otro ajuste por preferencias, ni la composición detallada del dataset más allá de la referencia a The Pile. El resultado de perplejidad de validación sobre cortes uniformes de The Pile es 10,17. La configuración exacta con la que se entrenó el run se publica en el repositorio como `resolved-config.yaml`, junto con `metadata.json`, que incluye el nombre del run, el sha256 de la configuración y el commit de git que lo produjo.

## Capacidades

- Generación de texto autoregresiva: modelo de lenguaje causal entrenado con objetivo estándar de predicción del siguiente token.
- Recuerdo en contexto (in-context recall): capacidad central del diseño, evaluada explícitamente con las tareas FDA y SWDE de las suites `based-*`.
- Manejo de secuencias largas con coste lineal: la attention linear evita el crecimiento cuadrático del coste computacional respecto a la longitud de secuencia.
- Memoria explícita por capas: 8 bancos de memoria por capa con escritura selectiva top-4, lo que permite almacenar y recuperar asociaciones clave-valor fuera del estado recurrente.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta soporte).
- Capacidades multilingües: no disponibles (entrenamiento sobre The Pile, mayoritariamente inglés; no hay evaluación multilingüe publicada).
- Vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Investigación en arquitecturas de attention linear: el modelo sirve como punto de comparación reproducible para estudiar el equilibrio entre recuerdo y throughput, ya que publica la configuración exacta, la semilla y el commit de git del run.
- Evaluación de mecanismos de memoria key-value: los 8 bancos por capa y la puerta top-4 permiten experimentar con políticas de escritura dispersa y medir su impacto en tareas de recuperación de información.
- Extracción de datos estructurados desde HTML: la tarea SWDE (Structured Web Data Extraction) es exactamente este escenario; el modelo obtiene 30,2 en `based-swde-v2`, por lo que puede emplearse como baseline en pipelines de extracción de campos desde páginas web.
- Respuesta a preguntas sobre documentos largos: la arquitectura está optimizada para recuerdo en contexto, de modo que resulta adecuada para prototipos de QA donde la respuesta está literalmente en el texto de entrada (tarea FDA, 38,6 puntos).
- Réplica de experimentos de recuerdo con coste lineal: al publicarse `final.ckpt` sin estado de optimizador, cualquier grupo puede cargar el checkpoint con `utils.checkpoint.load_checkpoint` y reproducir las métricas declaradas.
- Docencia y divulgación sobre MoE frente a memorias mixtas: el modelo ilustra de forma compacta (446,6 M de parámetros, 1,6 GB de repositorio) cómo se implementan puertas de escritura y lectura separadas sin necesidad de infraestructura grande.
- Base para ablation studies de `read_top_k`: la configuración usa lectura densa; el propio framework `recurrent-recall-circuits` permite entrenar variantes para comparar.

Ninguno de estos casos está validado en producción: se trata de un modelo de investigación sin licencia declarada y con cero descargas registradas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Modelo comparable (referencia) |
|---|---|---|
| Perplejidad de validación (The Pile, cortes uniformes) | 10,17 | no disponible |
| FDA (`based-fda`, 1.102 ejemplos) | 38,6 | no disponible |
| SWDE (`based-swde-v2`) | 30,2 | no disponible |

Las suites `based-fda` y `based-swde-v2` proceden del ecosistema del framework `recurrent-recall-circuits` y evalúan recuerdo en contexto y extracción de datos estructurados respectivamente. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones de conocimiento general, ni comparaciones numéricas directas con otros checkpoints de la misma familia.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 1,79 GB en FP32, 0,89 GB en FP16/BF16, 0,45 GB en int8 y 0,22 GB en int4. Hay que sumar el coste de activaciones, el estado recurrente y los 8 bancos de memoria por capa.
- Cabe sin problemas en GPU de consumo: cualquier tarjeta con 8 GB o más (RTX 3060, RTX 4060, RTX 3070, RTX 4070, RTX 4080, RTX 4090) puede alojarlo en FP16, e incluso tarjetas de 4-6 GB podrían servirlo si se aplica cuantización.
- GPU de centro de datos: A100, H100, L40S o similares no son necesarias para un solo modelo, aunque pueden emplearse para entrenar o hacer fine-tuning con lotes grandes.
- Opciones de despliegue: no disponible mediante vLLM, TGI, llama.cpp u Ollama, ya que la arquitectura no está soportada por esos motores y no se publican pesos en GGUF o safetensors. El único camino documentado es clonar `recurrent-recall-circuits` y ejecutar `python -m recurrent_recall_circuits.evaluation.launch --model-alias mom_ahead_360m_m8`. El framework descarga el checkpoint automáticamente, y `$RRC_CHECKPOINT_DIR/mom_ahead_360m_m8.ckpt` tiene precedencia si existe.
- Latencia y throughput: no disponible. La attention linear implica un coste teórico lineal en la longitud de secuencia y un estado por capa constante, pero no se publican medidas de tokens por segundo ni latencias.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mom-ahead-360m-m8-rare4-6k | 446,6 M (360 M sin embeddings) | 2.048 tokens en entrenamiento | PPL 10,17 (Pile); FDA 38,6; SWDE 30,2 | no disponible | Solo `final.ckpt` en HuggingFace |
| Otros checkpoints de `recurrent-recall-circuits` (misma familia MoM) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de attention linear (Mamba, RWKV, Based) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados en la información proporcionada para establecer una comparación numérica con alternativas de la misma categoría. La comparación relevante sería contra checkpoints de la misma familia (variantes MoM con otro número de bancos de memoria u otro objetivo), pero sus resultados no están incluidos en esta ficha.

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial, lo que impide su adopción en producción sin aclaración previa por parte del autor.
- Modelo de investigación sin validación externa: 0 descargas y 0 likes en el momento de la consulta, sin evaluación de terceros.
- Riesgo de alucinación: es un modelo de lenguaje de 446,6 M de parámetros entrenado con solo 3.146 millones de tokens, muy por debajo de los volúmenes habituales en modelos actuales; la perplejidad de 10,17 indica un ajuste limitado del corpus.
- Idioma: entrenamiento sobre The Pile, corpus predominantemente en inglés. No se documentan capacidades en castellano y probablemente el rendimiento sea bajo.
- Longitud de contexto: entrenado con secuencias de 2.048 tokens. No se documenta capacidad de extrapolación más allá de esa longitud, a pesar de la attention linear.
- Formato de pesos propietario en la práctica: `final.ckpt` requiere el framework `recurrent-recall-circuits` para cargarse; no hay conversión a safetensors, GGUF ni integración con motores de inferencia estándar.
- Ausencia de datos clave: no se especifican composición del dataset de entrenamiento más allá de The Pile, ni si hubo ajuste por preferencias (RLHF/DPO), ni sesgos conocidos.
- Restricciones de contexto de uso: no se documenta si el modelo ha pasado por filtros de seguridad o alineación.

## Enlaces

- HuggingFace: https://huggingface.co/robgarct/mom-ahead-360m-m8-rare4-6k
- Repositorio del framework: la model card referencia `https://github.com/<owner>/recurrent-recall-circuits`, con el propietario sin especificar en la información disponible.
- Configuración del run: `resolved-config.yaml` dentro del repositorio de HuggingFace.
- Metadatos del run: `metadata.json` dentro del repositorio de HuggingFace (nombre del run, sha256 de la configuración y commit de git).
- Paper, blog o demo: no disponible.
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo ni con arquitecturas de attention linear, por lo que no se incluyen.
