# Navid/tripclick-bert-base-dot

## Resumen

TripClick-BERT-base-dot es un modelo de recuperación densa (dense retrieval) obtenido mediante fine-tuning de `google-bert/bert-base-uncased` sobre el corpus TripClick, un conjunto de datos de búsqueda biomédica construido a partir de los registros de clics del portal Trip Database. Lo desarrolla el usuario Navid y se publica bajo los términos de uso de TripClick, con acceso restringido en Hugging Face.

El modelo se enmarca en la familia de bi-encoders para information retrieval: codifica consultas y documentos en un espacio vectorial común y la relevancia se calcula mediante similitud (en este caso, producto escalar, de ahí el sufijo `dot`). Resuelve el problema de la búsqueda semántica en el dominio de la salud, donde la coincidencia léxica falla por la variabilidad terminológica entre lenguaje natural y jerga médica.

Su relevancia es fundamentalmente académica y de investigación: sirve como baseline reproducible para experimentos de recuperación biomédica sobre TripClick, y su licencia restrictiva y su tamaño (BERT-base, 110 M de parámetros, contexto de 512 tokens) lo limitan a entornos de evaluación más que a despliegues de producción generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base), bi-encoder para recuperación densa |
| Parametros totales | 110 millones (heredados de bert-base-uncased; no confirmado explícitamente en la ficha) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT-base; no confirmado en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | tripclick-terms-of-use (acceso restringido, gated) |
| Formato de pesos | PyTorch (transformers); no se indica GGUF ni safetensors explícitamente |

## Arquitectura y entrenamiento

El modelo parte de `google-bert/bert-base-uncased`, un transformer encoder de 12 capas y 110 M de parámetros, y se ajusta finamente como bi-encoder con función de puntuación de producto escalar (`dot`) para la tarea de recuperación densa. La arquitectura bi-encoder implica que consulta y documento se codifican de forma independiente, lo que permite precomputar los embeddings del corpus y realizar búsquedas por similitud vectorial en tiempo de inferencia.

El entrenamiento se realiza sobre el benchmark TripClick, derivado de los registros de clics de Trip Database y descrito en los papers arXiv:2103.07901 (TripClick: The Log Files of a Large Health Web Search Engine) y arXiv:2201.00365. No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en modelos de recuperación). Tampoco se documentan innovaciones técnicas adicionales más allá del esquema bi-encoder estándar.

## Capacidades

- Extracción de características (feature-extraction): genera embeddings de frases y documentos.
- Recuperación densa de información (dense retrieval): codifica consultas y pasajes para búsqueda semántica.
- Puntuación de relevancia mediante producto escalar entre embeddings de consulta y documento.
- Especialización en dominio biomédico y de salud (health, medical).
- Soporte monolingüe en inglés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Búsqueda semántica en corpus biomédicos: indexar artículos, guías clínicas o resúmenes y recuperar los más relevantes ante una consulta en lenguaje natural, aprovechando el ajuste específico sobre TripClick para manejar terminología médica.
- Baseline de investigación en recuperación: servir como referencia reproducible en experimentos de dense retrieval sobre TripClick, permitiendo comparar nuevas arquitecturas o estrategias de entrenamiento contra un punto de partida conocido.
- Evaluación de sistemas de búsqueda sanitaria: emplear el modelo para generar rankings de documentos y medir métricas de recuperación (nDCG, MRR, Recall@k) en pipelines de evaluación académica.
- Motor de búsqueda interno para documentación clínica: desplegar un índice vectorial sobre notas, protocolos o literatura médica de una organización y ofrecer búsqueda por similitud semántica en inglés.
- Filtrado y re-ranking de candidatos: usar los embeddings para reordenar los resultados de un recuperador léxico previo (por ejemplo, BM25), combinando ambos enfoques en una arquitectura híbrida.
- Análisis de relevancia y estudio de sesgos de recuperación: investigar cómo el modelo puntúa consultas y documentos en distintos subdominios médicos, como parte de estudios sobre equidad y cobertura terminológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,4-0,5 GB para los pesos (110 M de parámetros); en FP16, alrededor de 0,22 GB. El consumo real depende del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en FP16 con lotes pequeños; para indexación a gran escala se recomiendan A100, H100 o L4 por su throughput.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; incluso en CPU es viable para volúmenes moderados.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; también es compatible con sentence-transformers para codificación por lotes, con FAISS o similar para el índice vectorial, y con TGI o vLLM para servir el encoder (aunque estos están más orientados a modelos generativos). No se documenta compatibilidad con llama.cpp u Ollama por tratarse de un encoder BERT.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TripClick-BERT-base-dot | 110 M (BERT-base) | 512 tokens | Biomédico (TripClick) | tripclick-terms-of-use (gated) | Hugging Face, acceso restringido |
| BM25 (recuperador léxico) | no aplica | no aplica | General | Apache 2.0 / similar | Amplia |
| Contriever (Facebook) | 110 M (BERT-base) | 512 tokens | General | CC BY-NC 4.0 | Hugging Face, abierta |
| MedCPT (NCBI) | 110 M (BERT-base) | 512 tokens | Biomédico | Uso no comercial | Hugging Face, abierta |

La comparación con Contriever y MedCPT es orientativa: no se dispone de resultados de benchmarks de TripClick-BERT-base-dot en la información proporcionada para contrastar rendimiento numérico con estas alternativas.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en Hugging Face y requiere aceptar los términos de uso de TripClick antes de descargarlo.
- Licencia restrictiva (`tripclick-terms-of-use`): no es una licencia de código abierto estándar; es imprescindible revisar las condiciones antes de cualquier uso, especialmente comercial.
- Dominio limitado: entrenado sobre registros de clics de un buscador sanitario, por lo que su rendimiento fuera del dominio biomédico o del inglés puede degradarse notablemente.
- Contexto corto: el límite de 512 tokens de BERT-base restringe la longitud de los documentos que pueden codificarse en una sola pasada; los textos largos requieren fragmentación.
- Riesgo de sesgo: los datos de clics reflejan los sesgos de comportamiento de los usuarios de Trip Database (popularidad, posición en los resultados), lo que puede introducir sesgos de exposición en las puntuaciones de relevancia.
- Alucinación: al ser un encoder de recuperación y no un modelo generativo, no produce texto; el riesgo de alucinación no aplica directamente, pero sí el de recuperar documentos irrelevantes con alta puntuación.
- Sin datos de benchmarks publicados en la información disponible: no es posible validar empíricamente su calidad frente a alternativas sin ejecutar evaluaciones propias.
- Idiomas: solo inglés; no se documenta soporte multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/Navid/tripclick-bert-base-dot
- Paper TripClick: https://arxiv.org/abs/2103.07901
- Paper arXiv:2201.00365: https://arxiv.org/abs/2201.00365
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Dataset de referencia: https://huggingface.co/datasets/Navid/tripclick-benchmark
