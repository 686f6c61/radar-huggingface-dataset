# oaklight/krino-qwen3-reranker-4b-heads

## Resumen

Krino Adapter Qwen3-Reranker-4B es un conjunto de cabezas de decisión (decision heads) ligeras entrenadas sobre un backbone congelado Qwen/Qwen3-Reranker-4B de 4.000 millones de parámetros. Lo desarrolla el usuario oaklight y se publica bajo licencia MIT. El modelo no genera texto: produce decisiones tipadas y calibradas con tres formatos de salida distintos (noul, choice y score), lo que lo aleja del pipeline estándar de generación y lo sitúa en la categoría de clasificación y decisión estructurada.

La innovación principal es la eficiencia del ajuste. Solo 1,0 millón de parámetros son entrenables (un AttentionHead de rango 64) sobre los 4.000 millones congelados del backbone, es decir, en torno al 0,025 % del total. Esa restricción permite reutilizar íntegramente la representación del reranker de Qwen y añadir una capa de decisión muy barata de entrenar y de distribuir: el repositorio de adaptadores ocupa 0,0 GB porque solo contiene las cabezas, no el backbone.

El modelo alcanza un 65,5 % de precisión agregada en 19 benchmarks de NLU, con resultados muy desiguales según la tarea: 93,8 % en MNLI o 90,8 % en SST-2 frente a 32,4 % en RACE o 33,0 % en STS-B. Es relevante ahora porque demuestra una vía para convertir un modelo de ranking en un decisor estructurado sin reentrenar el backbone, aunque su adopción actual es nula (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3) con backbone congelado y tres cabezas de decisión acopladas: NoulHead (lineal + sigmoide), ChoiceHead (cross-attention + softmax) y ScoreHead (cross-attention + valor esperado) |
| Parámetros totales | 4,0B en el backbone congelado + 1,0M entrenables en las cabezas (aproximadamente 4,001B en total) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 32.768 tokens, heredada del backbone Qwen3-Reranker-4B según su documentación; no se especifica en la model card del adaptador |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (etiqueta de idioma del adaptador: en). El backbone Qwen3-Reranker-4B declara soporte de más de 100 idiomas, pero el adaptador se entrena y evalúa únicamente en inglés |
| Licencia | MIT (adaptador). La licencia del backbone Qwen3-Reranker-4B no se detalla en la información disponible |
| Formato de pesos | No disponible (la carga se realiza mediante el paquete `krino` con `KrinoModel.from_pretrained`) |

## Arquitectura y entrenamiento

El sistema se organiza en dos niveles. El primero es el backbone Qwen/Qwen3-Reranker-4B, un transformer causal denso de 4.000 millones de parámetros derivado de la serie Qwen3 y preentrenado específicamente para tareas de reranking, con ventana de contexto de 32K tokens según la documentación de Qwen. Este backbone permanece congelado durante todo el entrenamiento del adaptador y actúa como extractor de estados ocultos.

El segundo nivel son las cabezas de decisión, con 1,0 millón de parámetros entrenables en total y un AttentionHead de rango 64. Cada tipo de decisión tiene una cabeza distinta: NoulHead usa una proyección lineal seguida de sigmoide para producir P(yes); ChoiceHead emplea cross-attention seguida de softmax para producir P(option_k) sobre un conjunto de opciones definido en tiempo de inferencia; ScoreHead usa cross-attention y calcula un valor esperado para emitir una puntuación continua. El entrenamiento es multi-tarea sobre 19 benchmarks de NLU, con muestreo balanceado por tipo de decisión y 20 épocas. No se documenta en la información disponible el uso de RLHF, DPO ni el volumen exacto de tokens de entrenamiento.

## Capacidades

- Clasificación con opciones cerradas (tipo choice): el usuario define un conjunto de criterios etiquetados y el modelo devuelve una distribución de probabilidad sobre ellos, como en el ejemplo de intenciones `track_order`, `cancel_order` y `report_damage`.
- Decisión binaria verificativa (tipo noul): evaluación de pares premisa-hipótesis y de afirmaciones frente a evidencia, con salida sigmoide P(yes).
- Puntuación continua (tipo score): regresión de calidad o similitud sobre texto, con salida de valor esperado.
- Inferencia de relación entre textos: implicación, contradicción y neutralidad, según los resultados en MNLI y MedNLI.
- Verificación de hechos y atribución: evaluada en FEVER y TabFact.
- Clasificación de intención en dominios específicos: evaluada en Banking77.
- Clasificación de fragmentos de código: evaluada en CodeSearchNet.
- Capacidad multilingüe: no validada en el adaptador; el entrenamiento es monolingüe en inglés.
- Tool calling y function calling: no disponible, el modelo no genera texto ni llamadas a herramientas.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Visión y audio: no disponibles.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el mensaje del cliente y un conjunto cerrado de intenciones, y devuelve la probabilidad de cada una. Es adecuado porque el tipo choice permite declarar los criterios como texto y evita reentrenar el modelo para añadir una intención nueva, aunque la precisión en Banking77 (70,0 %) exige un umbral de confianza y un derivado a revisión humana.
- Filtrado previo en pipelines RAG: dado el contexto recuperado y una afirmación candidata, el tipo noul devuelve P(yes) sobre la relevancia. Encaja porque el backbone ya está preentrenado como reranker y la cabeza solo añade la decisión binaria.
- Comprobación de coherencia documental: comparación de cláusulas de contratos mediante el tipo noul (66,2 % en ContractNLI) y de informes clínicos (88,6 % en MedNLI) para marcar potenciales contradicciones antes de la revisión legal o médica.
- Verificación de hechos en contenidos editoriales: el tipo choice permite contrastar una afirmación contra varias evidencias y seleccionar la que la respalda (74,2 % en FEVER). Adecuado como primera pasada de triaje, no como decisión final.
- Moderación y políticas de contenido con decisión binaria: la cabeza noul es la de mejor rendimiento (80,0 % agregado, 93,8 % en MNLI), lo que la hace la opción más fiable del adaptador para decidir sí/no sobre un texto frente a una política redactada.
- Deduplicación y clustering de fragmentos de código: CodeSearchNet al 68,3 % en modo choice permite asignar un fragmento a una categoría funcional predefinida dentro de un repositorio grande.
- Etiquetado asistido para construcción de datasets: al ser un adaptador de 1,0M de parámetros sobre un backbone congelado, se puede desplegar como preanotador barato y reservar la revisión humana para los casos de baja confianza.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Tipo de decisión | Precisión |
|---|---|
| Choice | 60,8 % |
| Noul | 80,0 % |
| Score | 50,2 % |
| Agregado | 65,5 % |

Desglose por benchmark:

| Benchmark | Tipo | Precisión |
|---|---|---|
| mnli | noul | 93,8 % |
| sst2 | noul | 90,8 % |
| agnews | choice | 90,2 % |
| mednli | noul | 88,6 % |
| multirc | noul | 80,2 % |
| fever | choice | 74,2 % |
| banking77 | choice | 70,0 % |
| codesearchnet | choice | 68,3 % |
| contractnli | noul | 66,2 % |
| typed_decisions | choice | 63,0 % |
| yelp | score | 63,0 % |
| hellaswag | choice | 62,8 % |
| tabfact | noul | 61,0 % |
| swag | choice | 58,2 % |
| sst5 | score | 54,0 % |
| arc | choice | 40,8 % |
| stsb | score | 33,0 % |
| race | choice | 32,4 % |

No se han publicado comparaciones directas contra otros adaptadores o modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del backbone en fp16/BF16: en torno a 8-9 GB solo para pesos, más activaciones y caché KV, lo que sitúa el consumo práctico en 10-14 GB según longitud de contexto. Cálculo estimado a partir de los 4,0B parámetros; no confirmado por el autor.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4-5 GB de pesos. En 4 bits: aproximadamente 2,5-3 GB. Los formatos de cuantización soportados no están documentados.
- GPU recomendadas: A100 40 GB, H100, L40S y RTX 4090 para fp16; RTX 3090, RTX 4080 y GPUs de 16 GB en cuantización de 8 bits; GPUs de 8 GB en cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con fp16 y en tarjetas de 8-12 GB con cuantización, siempre que el backend utilizado soporte el backbone Qwen3-Reranker-4B.
- Opciones de despliegue: la model card solo documenta la API del paquete `krino` (`KrinoModel.from_pretrained`). No se menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con el pipeline `text-classification` de transformers, a pesar de que la etiqueta del repositorio lo indique.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio del adaptador ocupa 0,0 GB porque solo contiene las cabezas; el backbone Qwen3-Reranker-4B debe descargarse por separado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión agregada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oaklight/krino-qwen3-reranker-4b-heads | 4,0B congelados + 1,0M entrenables | 32K (heredado del backbone) | 65,5 % en 19 benchmarks | MIT | HuggingFace, paquete `krino` |
| oaklight/krino-qwen3.5-4b-heads | 4,2B congelados + 1,0M entrenables | No disponible | 65,4 % en 19 benchmarks | No disponible en la información consultada | HuggingFace |
| Qwen/Qwen3-Reranker-4B | 4,0B | 32K | No disponible (modelo de reranking, no de decisión) | No disponible en la información consultada | HuggingFace, ModelScope |
| Qwen3-Reranker-0.6B / Qwen3-Reranker-8B | 0,6B / 8B | 32K | No disponible | No disponible en la información consultada | HuggingFace |

La comparación con alternativas de la misma categoría (adaptadores de decisión) se limita al modelo hermano de la serie Krino, que obtiene un resultado agregado prácticamente idéntico sobre un backbone distinto. No hay datos públicos de otros adaptadores de decisión tipada que permitan una comparación más amplia.

## Limitaciones y advertencias

- Rendimiento agregado moderado: 65,5 % de precisión media no es suficiente para decisiones automatizadas sin supervisión en la mayoría de dominios productivos.
- Resultados muy dispares por tarea: RACE (32,4 %), STS-B (33,0 %) y ARC (40,8 %) están cerca o por debajo del azar en tareas de elección múltiple y similitud semántica. La cabeza de tipo score es la más débil (50,2 % agregado).
- Idiomas: el adaptador está etiquetado únicamente como inglés. Aunque el backbone declara cobertura de más de 100 idiomas, no hay evidencia de que las cabezas generalicen fuera del inglés.
- Sesgos: no se documentan análisis de sesgo. Al heredar las representaciones de Qwen3-Reranker-4B y entrenarse sobre 19 benchmarks concretos, es esperable que reproduzca los sesgos de esos corpus, pero no hay datos publicados al respecto.
- Riesgo de decisión errónea en lugar de alucinación: el modelo no genera texto libre, por lo que no alucina en el sentido habitual, pero puede emitir decisiones con alta confianza y ser incorrecto. Se recomienda calibrar umbrales por tipo de cabeza y no interpretar las probabilidades como certezas.
- Dependencia de API no estándar: la carga requiere el paquete `krino`. La etiqueta `text-classification` del repositorio no va acompañada de documentación sobre compatibilidad con `transformers`, vLLM o TGI.
- Licencia: el adaptador es MIT, lo que permite uso comercial, pero no se especifica la licencia del backbone Qwen3-Reranker-4B. Conviene verificarla antes de un despliegue comercial.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, con fecha de publicación muy reciente. No hay evidencia de uso en producción ni de validación independiente de los resultados publicados.
- Ausencia de cuantizaciones publicadas: el repositorio solo contiene las cabezas; los formatos GGUF, AWQ o GPTQ para el conjunto no están documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oaklight/krino-qwen3-reranker-4b-heads
- Modelo hermano (Krino sobre Qwen3.5-4B-Base): https://huggingface.co/oaklight/krino-qwen3.5-4b-heads
- Backbone Qwen3-Reranker-4B: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Ficha de Qwen3-Reranker-4B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-Reranker-4B/summary
- Ficha de Qwen3-Reranker-4B en Inferix: https://inferix.co/models/Qwen/Qwen3-Reranker-4B
- Ficha de Qwen3-Reranker-4B en regolo.ai: https://regolo.ai/models-archive/qwen3-reranker-4b/
