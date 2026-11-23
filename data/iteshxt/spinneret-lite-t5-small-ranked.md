# iteshxt/spinneret-lite-t5-small-ranked

## Resumen

Spinneret Lite es un modelo de generación texto-a-SQL derivado de `google-t5/t5-small` y afinado sobre el conjunto de datos Spider. Lo desarrolla el autor independiente iteshxt como parte del proyecto Spinneret, que ofrece tres variantes: Baseline (T5-small sin ranker), Lite (T5-small con ranker de esquema) y Spinneret (T5-base con ranker). Este checkpoint concreto recibe una pregunta en inglés junto con un esquema de base de datos ya filtrado por un ranker RoBERTa-base (top 4 tablas × 5 columnas) y genera la consulta SQLite correspondiente.

La particularidad técnica del modelo es la decodificación "skeleton-first": primero emite el esqueleto de la consulta (con placeholders `_` para tablas y columnas) y después la consulta completa, separadas por ` | `. El propio autor documenta que esta estrategia no aporta beneficio a un modelo de este tamaño (ablación E4), por lo que el checkpoint se conserva únicamente para fines de evaluación y la demo pública sirve la variante sin esqueleto.

Con 60,5 millones de parámetros, el modelo es extremadamente ligero y está pensado para ejecutarse en hardware modesto: la latencia medida del pipeline completo en una GTX 1650 es de 0,62 s de mediana y 1,18 s en el percentil 95, con un pico de 0,65 GB de VRAM. Su relevancia práctica es acotada: sirve como referencia de investigación y como componente de bajo coste en entornos con esquemas pequeños y preguntas en el estilo de Spider.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parámetros totales | 60.494.336 (60,5 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada (truncado en el ejemplo de uso); longitud de salida máxima configurada a 256 tokens nuevos |
| Tipos de cuantización | no disponible (pesos safetensors en fp32/fp16 según el repo; no se documentan variantes GGUF) |
| Idiomas soportados | inglés |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un T5 estándar (encoder-decoder con atención completa, sin innovaciones arquitectónicas adicionales) afinado sobre `google-t5/t5-small`. La entrada combina la pregunta, el nombre de la base de datos y un esquema serializado con tablas, columnas, valores coincidentes entre corchetes y claves foráneas; el esquema ya viene reducido por el ranker `iteshxt/spinneret-ranker-roberta-base` (125,8 M de parámetros) a las 4 tablas y 5 columnas más relevantes. La salida sigue el formato `esqueleto | consulta SQL completa`.

El entrenamiento usó `train_spider` (7.000 preguntas) más `train_others` (1.659), excluyendo un 10 % de las bases de datos de entrenamiento como validación (split por base de datos). Se optimizó con Adafactor, learning rate 0,001, batch efectivo 32 y early stopping sobre exact match de validación; la mejor época fue la 12 (EM 50,8 %, EX 52,6 %). El cómputo se realizó en GPUs T4 gratuitas de Colab y una GTX 1650 de portátil, reanudando desde checkpoints del Hub. En inferencia se aplica búsqueda por haces con 4 beams y decodificación guiada por ejecución (se conserva el primer candidato que ejecuta correctamente).

## Capacidades

- Generación de SQL para SQLite a partir de preguntas en inglés y un esquema de base de datos.
- Decodificación en dos fases: esqueleto con placeholders y consulta completa.
- Manejo de agregaciones (AVG, MIN, MAX, COUNT), filtros con igualdad y joins de dos tablas.
- Copia de valores literales del esquema cuando aparecen en la pregunta (coincidencia de valores mostrada entre corchetes).
- Integración con decodificación guiada por ejecución para filtrar candidatos inválidos.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.

## Casos de uso

- Consultas analíticas sobre bases de datos SQLite pequeñas: el modelo traduce preguntas de negocio en inglés a SQL ejecutable, adecuado para esquemas de hasta unas pocas tablas donde el ranker puede filtrar el contexto relevante.
- Prototipado de interfaces de lenguaje natural a SQL: sirve como baseline ligero para validar pipelines de text-to-SQL antes de escalar a modelos mayores, con latencia inferior al segundo en GPU de gama baja.
- Evaluación comparativa de investigación: su condición de checkpoint de ablación (skeleton-first vs. sin esqueleto) lo hace útil para reproducir experimentos sobre el efecto del formato de salida en modelos pequeños.
- Asistente de consultas en herramientas internas de BI: con decodificación guiada por ejecución y validación previa, puede generar borradores de SQL que un analista revise antes de ejecutar.
- Docencia y formación en text-to-SQL: el bajo coste de cómputo (0,65 GB de VRAM) permite desplegarlo en portátiles y GPUs de consumo para prácticas sobre el dataset Spider.
- Filtrado previo en pipelines híbridos: puede actuar como primera etapa que propone consultas candidatas, refinadas después por un modelo mayor o por un verificador de ejecución.

## Benchmarks y rendimiento

Resultados en el split de desarrollo de Spider (1.034 preguntas sobre 20 bases de datos no vistas en entrenamiento, evaluación oficial con test-suite, búsqueda por haces de 4 con guiado por ejecución):

| Métrica | easy | medium | hard | extra | all |
|---|---|---|---|---|---|
| Exact match % | 85,1 | 51,3 | 37,9 | 21,7 | 52,4 |
| Execution accuracy % | 82,3 | 54,7 | 39,7 | 27,1 | 54,4 |

SQL válido (ejecutable): 78,3 %.

Desglose por tipo de pregunta:

| Tipo de pregunta | n | EX % |
|---|---|---|
| simple lookup | 252 | 71,8 |
| aggregation | 292 | 75,7 |
| two-table join | 288 | 36,5 |
| multi-join | 43 | 0,0 |
| nested / set-op | 159 | 34,6 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0,65 GB de pico para el pipeline completo (modelo + ranker) según medición del autor en batch 1.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor reporta funcionamiento en NVIDIA GeForce GTX 1650 y T4 de Colab.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4090 y similares; también es viable en CPU para volúmenes bajos.
- Opciones de despliegue: `transformers` (AutoModelForSeq2SeqLM), el servidor propio del proyecto Spinneret (`uv run spinneret serve`) y text-generation-inference según los tags del repo. No se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia medida: mediana 0,62 s y p95 1,18 s por pregunta en GTX 1650 a batch 1. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EX en Spider (all) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spinneret Lite (este) | 60,5 M + 125,8 M ranker | 512 tokens de entrada | 54,4 % | cc-by-sa-4.0 | Hugging Face |
| Spinneret Baseline (T5-small) | 60,5 M | 512 tokens de entrada | no disponible en esta ficha | cc-by-sa-4.0 | Hugging Face |
| Spinneret (T5-base + ranker) | no disponible | no disponible | no disponible en esta ficha | cc-by-sa-4.0 | Hugging Face |

No se dispone de datos de benchmarks de alternativas externas en la información proporcionada; la comparación se limita a las variantes del mismo proyecto.

## Limitaciones y advertencias

- Solo acepta preguntas en inglés con el estilo y dominio de Spider; otras formulaciones y dominios son menos fiables.
- Errores frecuentes en esquemas no vistos: joins incorrectos y columnas equivocadas. Las consultas con tres o más tablas y las anidadas o con operaciones de conjuntos son mucho más débiles (EX del 0 % en multi-join y 34,6 % en nested/set-op).
- Los valores deben coincidir con la ortografía de la base de datos; el modelo copia los valores mostrados y falla a menudo con números escritos en palabras ("100 million").
- La decodificación guiada por ejecución requiere acceso a la base de datos; sin ella, se toma el primer beam y la accuracy de ejecución baja.
- El formato skeleton-first no aporta mejora en este tamaño según la ablación del autor; el checkpoint se conserva para evaluación, no como modelo de producción.
- Riesgo de alucinación de tablas, columnas o valores no presentes en el esquema; validar siempre el SQL generado antes de ejecutarlo.
- Licencia cc-by-sa-4.0: permite uso comercial con atribución y compartir-al-igual de las obras derivadas; los pesos base de T5 son Apache-2.0, pero el modelo resultante hereda la licencia del dataset Spider.
- Diseñado para consultas de solo lectura e investigación; no se recomienda para operaciones de escritura sobre bases de datos.
- Sesgos: no documentados por el autor; al entrenarse solo con Spider, hereda los sesgos de dominio y estilo de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iteshxt/spinneret-lite-t5-small-ranked
- Repositorio del proyecto Spinneret: https://github.com/iteshxt/spinneret
- Ranker de esquema: https://huggingface.co/iteshxt/spinneret-ranker-roberta-base
- Variante sin esqueleto (servida en la demo): https://huggingface.co/iteshxt/spinneret-ablation-t2-no-skeleton
- Modelo base: https://huggingface.co/google-t5/t5-small
- Dataset Spider: https://yale-lily.github.io/spider
