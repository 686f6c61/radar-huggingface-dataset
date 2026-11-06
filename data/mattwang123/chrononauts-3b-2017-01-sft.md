# mattwang123/chrononauts-3b-2017-01-sft

## Resumen

Chrononauts 3B (cutoff 2017-01, etapa SFT) es un agente de búsqueda de 2.796 millones de parámetros desarrollado por mattwang123 en el marco del proyecto Chrononauts, una colaboración entre Johns Hopkins University y Apple. El modelo forma parte de una suite de siete agentes "congelados" en fechas distintas (2013-05, 2015-01, 2017-01, 2019-01, 2021-01, 2023-01 y 2024-07): en cada caso, los datos de preentrenamiento (TiC-LM), los datos de post-entrenamiento y el corpus de recuperación se detienen en la fecha de corte, de modo que el modelo no ha visto nunca información posterior. Esta ficha corresponde a la variante de enero de 2017, tras fine-tuning supervisado sobre trazas de búsqueda generadas por un profesor (gpt-oss-120b) que solo consultó el corpus congelado en esa fecha.

El interés del modelo es metodológico: permite estudiar el comportamiento de un agente de recuperación sin contaminación temporal, evaluar la capacidad de razonamiento con evidencia fechada y construir bancos de prueba controlados sobre qué sabía el mundo (o qué podía recuperarse) en un momento histórico concreto. La arquitectura es TiC-LM (OpenLM), un transformer con LayerNorm y QK-norm, con 2.796.096.000 parámetros totales, contexto útil de hasta 8.192 tokens (RoPE base 48.000) y pesos en safetensors (repo de 5,6 GB). Solo soporta inglés y se distribuye con licencia "other" (no estándar, conviene revisar los términos antes de cualquier uso comercial).

El modelo se usa con `trust_remote_code=True`, ya que requiere el módulo `modeling_open_lm_hf.py` para la LayerNorm con QK-norm. El formato de agente alterna bloques `<think>`, `<search>` e `<information>` y cierra con `<answer>` y una etiqueta de evidencia (`[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` o `[FORECASTING]`). No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer TiC-LM (OpenLM) con LayerNorm y QK-norm (`modeling_open_lm_hf.py`) |
| Parametros totales | 2.796.096.000 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 8.192 tokens (RoPE base 48.000) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Other (licencia no estándar; revisar términos del repositorio) |
| Formato de pesos | Safetensors (repo de 5,6 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura TiC-LM basada en OpenLM, un transformer denso de 2.796 millones de parámetros con LayerNorm que incorpora QK-norm, lo que exige cargar código remoto (`trust_remote_code=True`) mediante el módulo `modeling_open_lm_hf.py`. El contexto operativo es de hasta 8.192 tokens con RoPE de base 48.000. Esta variante es la etapa SFT del cutoff 2017-01: se inicializa desde el modelo `-init` de la misma fecha y se afina de forma supervisada sobre trazas de búsqueda escritas por un profesor (gpt-oss-120b) que operó exclusivamente sobre el corpus congelado en enero de 2017.

El preentrenamiento usa TiC-LM, un corpus detenido en la fecha de corte. Todo el texto de post-entrenamiento pasó tres filtros de control de fuga: construcción únicamente a partir de instantáneas anteriores al cutoff, ausencia de años posteriores al cutoff y un juez LLM de fuga con comprobación de hechos plantados (al menos 36 de 40 hechos post-cutoff plantados detectados). Los conjuntos de entrenamiento y evaluación no se solapan. El corpus de recuperación asociado se compone de Wikipedia en inglés reconstruida por cutoff (última revisión de cada página en o antes de la fecha) más lotes de CC-News rastreados antes del cutoff, embebidos con `BAAI/bge-base-en-v1.5` e indexados con faiss en CPU (OPQ64, IVF32768, PQ64, rerank exacto de 400 candidatos; top-5, máximo 2 pasajes por artículo, 4.000 caracteres por turno). Los títulos de noticias incluyen la marca "(news; dated no later than <mes de rastreo>)".

## Capacidades

- Generación de texto conversacional en inglés con formato de agente de búsqueda.
- Razonamiento multi-turno con bloques explícitos de pensamiento (`<think> ... </think>`).
- Emisión de consultas de búsqueda (`<search> query </search>`) e integración de resultados (`<information> ... </information>`).
- Razonamiento basado en evidencia con etiquetado explícito: `[SUPPORTED]`, `[PREMISES_ONLY]`, `[INSUFFICIENT]` y `[FORECASTING]` (este último para cuestiones que aún no eran cognoscibles en la fecha de corte).
- Anclaje temporal: el primer turno de pensamiento declara el año al que se refiere la pregunta y el turno final indica el año más reciente cubierto por la evidencia.
- Recuperación aumentada sobre un corpus congelado (Wikipedia inglesa y CC-News anteriores a enero de 2017).
- Soporte de tool calling / function calling: no disponible de forma genérica; el único "tool" documentado es el protocolo de búsqueda `<search>`.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: limitadas al inglés.

## Casos de uso

- Evaluación de agentes de búsqueda sin contaminación temporal: el modelo permite medir la calidad de la recuperación y del razonamiento cuando el corpus está estrictamente limitado a enero de 2017, sirviendo como referencia para estudiar cómo afecta la fuga de información a los benchmarks de agentes.
- Investigación sobre razonamiento con evidencia fechada: útil para analizar cómo un modelo distingue entre hechos respaldados por evidencia (`[SUPPORTED]`), premisas sin respaldo (`[PREMISES_ONLY]`), información insuficiente (`[INSUFFICIENT]`) y cuestiones no cognoscibles en su fecha (`[FORECASTING]`).
- Construcción de bancos de prueba históricos: preguntas sobre eventos, personas o publicaciones anteriores a 2017 con respuestas verificables contra el corpus congelado, ideales para evaluar sistemas de QA temporal.
- Análisis de sesgos y cobertura mediática por época: al recuperar solo noticias rastreadas antes de enero de 2017, permite estudiar qué temas y fuentes estaban disponibles en ese momento y cómo condicionan las respuestas.
- Docencia y divulgación sobre limitaciones de los LLM: el contraste entre un modelo congelado en 2017 y uno actual ilustra de forma tangible el efecto de la fecha de corte en el conocimiento y en las respuestas.
- Prototipado de pipelines de recuperación con faiss: el formato de agente y el índice documentado (OPQ64, IVF32768, PQ64, rerank de 400 candidatos) sirven como plantilla reproducible para experimentos de RAG con restricciones temporales.
- Auditoría de protocolos anti-fuga: los tres filtros descritos (instantáneas previas al cutoff, ausencia de años posteriores, juez LLM con hechos plantados) pueden reutilizarse como metodología en la construcción de otros conjuntos de datos libres de contaminación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 5,6 GB en bfloat16 (tamaño del repo en safetensors); en cuantizaciones de 8 bits o 4 bits el requisito se reduciría aproximadamente a la mitad o a un cuarto, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, una GPU con al menos 8-12 GB de VRAM en bfloat16 sería suficiente, y cabría en tarjetas de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB), e incluso en modelos con 8-12 GB ajustando el contexto.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño de 2,8B de parámetros y los 5,6 GB de pesos; no se confirma con pruebas publicadas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `torch_dtype="bfloat16"`; requiere el módulo `modeling_open_lm_hf.py`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.
- Contexto: usar hasta 8.192 tokens; la evaluación del agente se realizó con un máximo de 8 turnos, T=0,8 y top-p 0,95.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo, por lo que la comparación se limita a características estructurales. No se han identificado en la información proporcionada modelos comparables de la misma categoría (agentes de búsqueda con congelación temporal) más allá de los hermanos de la propia suite.

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Chrononauts 3B 2017-01 SFT | 2,796B | 8.192 tokens | Agente de búsqueda congelado en 2017-01 (SFT) | Other | Hugging Face |
| Chrononauts 3B 2017-01 init | No disponible | No disponible | Misma suite, etapa inicial | Other | Hugging Face |
| Chrononauts 3B 2017-01 agent | No disponible | No disponible | Misma suite, etapa agente | Other | Hugging Face |
| Otros cortes de la suite (2013-05 a 2024-07) | No disponible | No disponible | Misma metodología, distinta fecha de corte | Other | Hugging Face |

## Limitaciones y advertencias

- Conocimiento deliberadamente limitado a enero de 2017: el modelo no puede responder sobre hechos posteriores y marcará como `[FORECASTING]` las cuestiones no cognoscibles en su fecha; no debe usarse como fuente de información actual.
- Solo inglés: no se documenta soporte para otros idiomas.
- Riesgo de alucinación: como cualquier LLM, puede generar contenido no respaldado por la evidencia recuperada; las etiquetas de evidencia mitigan pero no eliminan este riesgo.
- Dependencia del corpus congelado: la calidad de las respuestas está acotada por la cobertura de la Wikipedia reconstruida y los lotes de CC-News anteriores a enero de 2017, y por el índice faiss descrito.
- Licencia "other": no es una licencia estándar; es imprescindible revisar los términos del repositorio antes de cualquier uso comercial o redistribución.
- Requiere `trust_remote_code=True`: la carga ejecuta código del repositorio (`modeling_open_lm_hf.py`), lo que implica un riesgo de seguridad que debe evaluarse en entornos de producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que dificulta justificar su elección en producción.
- Sin cuantizaciones oficiales documentadas: el despliegue eficiente en hardware limitado requeriría convertir los pesos, con el riesgo de degradación asociado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.
- Paper en preparación: la documentación metodológica completa aún no está disponible.

## Enlaces

- Hugging Face: https://huggingface.co/mattwang123/chrononauts-3b-2017-01-sft
- Modelo inicial de la misma fecha: https://huggingface.co/mattwang123/chrononauts-3b-2017-01-init
- Modelo en etapa agente de la misma fecha: https://huggingface.co/mattwang123/chrononauts-3b-2017-01-agent
- Modelo de embeddings del corpus: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper: en preparación (Chrononauts, Johns Hopkins University y Apple); no disponible en la información proporcionada.
