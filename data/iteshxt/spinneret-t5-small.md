# iteshxt/spinneret-t5-small

## Resumen

Spinneret Baseline · T5-small es un modelo de generación texto-a-texto especializado en text-to-SQL, desarrollado por el usuario iteshxt. Se trata de un fine-tuning de google-t5/t5-small (60,5 millones de parámetros) entrenado sobre el conjunto de datos Spider para convertir una pregunta en inglés y un esquema de base de datos en una consulta SQL ejecutable sobre SQLite. Forma parte del proyecto Spinneret, que incluye tres variantes: Baseline (este modelo, T5-small), Lite (T5-small con un ranker) y Spinneret (T5-base con ranker).

El modelo resuelve el problema de la traducción automática de lenguaje natural a SQL en un contexto académico y de investigación, leyendo el esquema completo de la base de datos como parte de la entrada. Su relevancia radica en que demuestra que un modelo de tamaño muy reducido (60,5 M de parámetros) puede alcanzar un 49,2 % de exactitud de ejecución en el conjunto de desarrollo de Spider, con una latencia de 0,37 s de mediana y un pico de 0,41 GB de VRAM, lo que lo hace viable en hardware de consumo.

La arquitectura es un transformer encoder-decoder estándar (T5) con una longitud de contexto de 512 tokens en la entrada y 256 tokens nuevos en la generación. El modelo está pensado exclusivamente para preguntas en inglés y para el dominio y el estilo de Spider, por lo que su uso en producción fuera de ese ámbito requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | 60.494.336 (60,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de entrada; 256 tokens nuevos en generación |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a GGUF no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un T5-small estándar, un transformer encoder-decoder con atención completa, fine-tuneado para la tarea de text-to-SQL. La entrada se construye concatenando la pregunta, el nombre de la base de datos y el esquema completo con las tablas y columnas, incluyendo entre paréntesis los valores de la base de datos que coinciden con palabras de la pregunta (value matching). Los nombres se normalizan a minúsculas. La salida es una consulta SQL en dialecto SQLite.

El entrenamiento utilizó el conjunto Spider `train_spider` (7.000 preguntas), incluyendo `train_others` (1.659), menos un 10 % de las bases de datos de entrenamiento reservado para validación (split por base de datos). Se empleó el optimizador Adafactor con learning rate 0,001, batch efectivo de 32 y early stopping sobre la exactitud de ejecución (EX) de validación. La mejor época fue la 18, con un 44,7 % de exact match (EM) y un 49,3 % de EX en validación. El entrenamiento se realizó en GPUs T4 gratuitas de Colab y en una GTX 1650 de portátil, reanudando mediante checkpoints en el Hub. La decodificación en evaluación usa búsqueda por haces con 4 haces y ejecución guiada (execution-guided beam search): se conserva el primer candidato que se ejecuta correctamente contra la base de datos.

## Capacidades

- Generación de SQL a partir de preguntas en inglés y esquemas de base de datos en el estilo de Spider.
- Lectura del esquema completo de la base de datos como parte de la entrada, incluyendo value matching de valores presentes en la pregunta.
- Generación con búsqueda por haces (4 haces) y selección del primer candidato ejecutable (execution-guided decoding) cuando se dispone de la base de datos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés; el autor indica que otras formulaciones y dominios son menos fiables.
- Capacidades especiales: ninguna documentada (sin visión, audio ni modo thinking).

## Casos de uso

- Consultas analíticas sobre bases de datos SQLite en investigación: el modelo traduce preguntas en inglés a SQL ejecutable, lo que permite a investigadores sin conocimiento de SQL interrogar conjuntos de datos estructurados en experimentos controlados.
- Evaluación comparativa de pipelines text-to-SQL: al ser la variante Baseline del proyecto Spinneret, sirve como referencia para medir la mejora que aportan el ranker (Lite) y el modelo base más grande (Spinneret).
- Prototipado de asistentes de datos en entornos de desarrollo: con 0,41 GB de VRAM y 0,37 s de latencia mediana, se puede desplegar en un portátil con GPU de consumo para validar flujos de pregunta-respuesta sobre esquemas pequeños.
- Generación de SQL en pipelines de solo lectura: el autor lo destina a consultas de solo lectura y a investigación, por lo que encaja en herramientas internas de exploración de datos donde las consultas se revisan antes de ejecutarse.
- Docencia y formación en bases de datos: permite ilustrar la correspondencia entre lenguaje natural y SQL, y analizar errores típicos (joins incorrectos, columnas equivocadas) en función del tipo de pregunta.
- Investigación sobre decodificación guiada por ejecución: el modelo y su código permiten reproducir el esquema de execution-guided beam search y estudiar su impacto en la exactitud de ejecución.

## Benchmarks y rendimiento

Resultados en Spider dev (1.034 preguntas sobre 20 bases de datos no vistas en entrenamiento, evaluación oficial con test-suite, búsqueda por haces de 4 con execution-guided decoding):

| Metrica | easy | medium | hard | extra | all |
|---|---|---|---|---|---|
| Exact match % | 79,4 | 43,7 | 41,4 | 22,3 | 48,5 |
| Execution accuracy % | 76,6 | 45,1 | 44,8 | 24,1 | 49,2 |

SQL válido (ejecutable): 67,5 %.

Desglose por tipo de pregunta:

| Tipo de pregunta | n | EX % |
|---|---|---|
| simple lookup | 252 | 65,5 |
| aggregation | 292 | 70,9 |
| two-table join | 288 | 25,3 |
| multi-join | 43 | 14,0 |
| nested / set-op | 159 | 36,5 |

Rendimiento del pipeline completo a batch 1 en una NVIDIA GeForce GTX 1650 de portátil: latencia mediana 0,37 s, p95 0,74 s; pico de memoria GPU 0,41 GB. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,41 GB de pico en el pipeline completo, según el autor.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el autor lo ejecutó en una GTX 1650 de portátil y en T4 de Colab.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 2060, RTX 3060, RTX 4090 y similares; también es viable en CPU para volúmenes bajos.
- Opciones de despliegue: transformers (AutoModelForSeq2SeqLM), text-generation-inference (según los tags del repo), endpoints compatibles; el proyecto Spinneret incluye un servidor de demo (`uv run spinneret serve` en el puerto 8000). No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: mediana de 0,37 s y p95 de 0,74 s por pregunta a batch 1 en GTX 1650; no se proporcionan datos de throughput a mayor batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Spider dev EX | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spinneret Baseline (T5-small) | 60,5 M | 512 | 49,2 % | CC BY-SA 4.0 | Hugging Face |
| Spinneret Lite (T5-small + ranker) | 60,5 M + ranker | 512 | no disponible en la informacion | CC BY-SA 4.0 (presumible, no confirmado) | GitHub del proyecto |
| Spinneret (T5-base + ranker) | T5-base (tamano no especificado) | no disponible | no disponible en la informacion | CC BY-SA 4.0 (presumible, no confirmado) | GitHub del proyecto |
| google-t5/t5-small (base) | 60,5 M | 512 | no aplica (no entrenado para text-to-SQL) | Apache-2.0 | Hugging Face |

No se dispone de resultados de benchmarks de las variantes Lite y Spinneret en la información proporcionada, por lo que la comparación de rendimiento entre ellas no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse solo con Spider, el modelo refleja el estilo, vocabulario y distribución de ese corpus.
- Riesgo de alucinación: el modelo copia valores que se le muestran; los valores deben coincidir con la ortografía de la base de datos y los números escritos en palabras ("100 million") suelen ser incorrectos.
- Limitaciones de contexto e idioma: solo inglés y estilo Spider; otras formulaciones y dominios son menos fiables. La entrada se trunca a 512 tokens, lo que limita esquemas muy grandes.
- Errores típicos en esquemas no vistos: joins incorrectos y columnas equivocadas; las consultas con tres o más tablas (14,0 % EX) y las anidadas o con operaciones de conjuntos (36,5 % EX) son mucho más débiles que las búsquedas simples (65,5 % EX).
- Dependencia de execution-guided decoding: sin acceso a la base de datos hay que quedarse con el primer haz, lo que reduce la exactitud de ejecución.
- Restricciones de licencia: CC BY-SA 4.0, licencia compartida (share-alike) derivada de los datos Spider; el uso comercial exige cumplir las condiciones de atribución y compartir bajo la misma licencia las obras derivadas. Los pesos base de T5-small son Apache-2.0.
- Uso previsto: consultas de solo lectura e investigación; el autor recomienda revisar el SQL generado antes de confiar en él. No apto para producción sin validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iteshxt/spinneret-t5-small
- Repositorio del proyecto Spinneret: https://github.com/iteshxt/spinneret
- Dataset Spider: https://yale-lily.github.io/spider
- Modelo base: https://huggingface.co/google-t5/t5-small
