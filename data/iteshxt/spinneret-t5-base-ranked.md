# iteshxt/spinneret-t5-base-ranked

## Resumen

Spinneret T5-base + ranker es un modelo de generación texto-a-SQL desarrollado por el usuario de Hugging Face `iteshxt` como parte del proyecto Spinneret. Se trata de un fine-tune de `google-t5/t5-base` (222,9 M de parámetros) especializado en convertir una pregunta en inglés y un esquema de base de datos en una consulta SQLite ejecutable. El modelo forma parte de una familia de tres variantes (Baseline, Lite y Spinneret) y constituye la versión de mayor calidad de la serie.

La particularidad del sistema es su pipeline en dos etapas: un ranker basado en RoBERTa-base (125,8 M de parámetros) selecciona las 4 tablas y 5 columnas más relevantes del esquema, y el T5 genera primero un esqueleto de la consulta y después la consulta completa. Está entrenado sobre el conjunto de datos Spider (7.000 preguntas de entrenamiento) y se evalúa sobre el split de desarrollo con 1.034 preguntas en 20 bases de datos no vistas durante el entrenamiento.

El modelo es relevante para investigación y para prototipos de interfaces en lenguaje natural sobre bases de datos relacionales, con un consumo de memoria muy reducido (1,66 GB de pico en GPU) y una latencia mediana de 1,29 s por pregunta en una GTX 1650. Su licencia CC BY-SA 4.0 y su enfoque execution-guided lo sitúan como una referencia ligera y reproducible dentro del ámbito text-to-SQL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5-base) + ranker RoBERTa-base |
| Parametros totales | 222.885.120 (T5) + 125,8 M (ranker) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de entrada (truncation en el ejemplo de uso); salida máxima 256 tokens nuevos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura T5 estándar (encoder-decoder) con 222,9 M de parámetros, inicializada desde `google-t5/t5-base`. El pipeline completo incorpora un ranker independiente basado en RoBERTa-base que filtra el esquema a las 4 tablas y 5 columnas más relevantes antes de la generación. La entrada se estructura como `question | database | table : column , column ( matched value ) | … | fk : a.x = b.y , …`, con nombres en minúsculas y valores de la base de datos que coinciden con palabras de la pregunta mostrados entre paréntesis junto a su columna. La salida es un formato de dos partes separadas por ` | `: primero el esqueleto de la consulta y después la consulta SQL completa.

El entrenamiento se realizó sobre Spider `train_spider` (7.000 preguntas, incluyendo 1.659 de `train_others`), excluyendo un 10% de validación separado por base de datos. Se usó el optimizador Adafactor con learning rate 0,0001, batch efectivo de 32 y early stopping sobre la exactitud de ejecución (EX) de validación. La mejor época fue la 18, con EM de validación del 59,7% y EX del 67,0%. El entrenamiento se llevó a cabo en GPUs gratuitas de Colab T4 y una GTX 1650 de portátil, reanudando mediante checkpoints del Hub.

## Capacidades

- Generación de SQL a partir de lenguaje natural en inglés sobre esquemas relacionales SQLite.
- Selección de esquema mediante ranker: filtra tablas y columnas relevantes antes de la generación.
- Generación en dos fases: primero el esqueleto de la consulta, después la consulta completa.
- Decodificación con búsqueda por haces (8 beams) y execution-guided decoding: se conserva el primer candidato que se ejecuta correctamente.
- Coincidencia de valores: el modelo copia valores de la base de datos mostrados en la entrada.
- Manejo de joins, agregaciones, subconsultas y operaciones de conjuntos (con distinto nivel de acierto).
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Interfaz de consulta en lenguaje natural sobre bases de datos SQLite: el modelo convierte preguntas de usuario en SQL ejecutable, adecuado para prototipos de asistentes de datos internos con esquemas acotados.
- Investigación en text-to-SQL: sirve como baseline reproducible con evaluación oficial en Spider dev (EX 68,8%), útil para comparar técnicas de ranking de esquema o decodificación guiada por ejecución.
- Generación asistida de consultas en herramientas de BI: el usuario formula la pregunta en inglés y el modelo propone el SQL, que se valida antes de ejecutarse.
- Docencia y formación en SQL: el formato de salida con esqueleto más consulta completa facilita explicar la estructura de una consulta generada.
- Evaluación de pipelines ligeros en hardware modesto: con 1,66 GB de pico y 1,29 s de latencia mediana en una GTX 1650, es viable en portátiles para pruebas de concepto.
- Automatización de informes sobre bases de datos de dominio conocido: para consultas de búsqueda simple y agregación (EX 83,7% y 85,3% respectivamente) el modelo es fiable dentro de su ámbito.
- Filtrado y preprocesado de esquemas: el ranker asociado puede reutilizarse para seleccionar tablas y columnas relevantes en otros sistemas text-to-SQL.

## Benchmarks y rendimiento

Resultados en Spider dev (1.034 preguntas, 20 bases de datos no vistas en entrenamiento, evaluación oficial test-suite, execution-guided beam search con 8 beams):

| Metrica | easy | medium | hard | extra | all |
|---|---|---|---|---|---|
| Exact match % | 86,3 | 67,7 | 46,0 | 30,7 | 62,6 |
| Execution accuracy % | 89,1 | 73,3 | 58,0 | 37,3 | 68,8 |

SQL válido (ejecutable): 91,7%.

| Tipo de pregunta | n | EX % |
|---|---|---|
| simple lookup | 252 | 83,7 |
| aggregation | 292 | 85,3 |
| two-table join | 288 | 55,2 |
| multi-join | 43 | 27,9 |
| nested / set-op | 159 | 50,3 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,66 GB de pico en GPU para el pipeline completo (modelo + ranker) según el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta funcionamiento en una NVIDIA GeForce GTX 1650 de portátil y en Colab T4.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: `transformers` (AutoModelForSeq2SeqLM), el código propio del proyecto Spinneret (`spinneret serve`, con demo en el puerto 8000), y text-generation-inference según los tags del repo. No se documentan opciones para vLLM, llama.cpp u Ollama.
- Latencia: mediana de 1,29 s y p95 de 2,50 s por pregunta a batch 1 en GTX 1650.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Spider dev EX | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spinneret T5-base + ranker | 222,9 M + 125,8 M | 512 tokens entrada | 68,8% | cc-by-sa-4.0 | Hugging Face + GitHub |
| Spinneret Lite (T5-small + ranker) | no disponible (T5-small) | no disponible | no disponible | cc-by-sa-4.0 (presumible, misma familia) | Hugging Face + GitHub |
| Spinneret Baseline (T5-small) | no disponible (T5-small) | no disponible | no disponible | cc-by-sa-4.0 (presumible, misma familia) | Hugging Face + GitHub |

No se dispone de datos de benchmarks de las variantes Lite y Baseline en la información proporcionada, ni de comparativas con modelos externos de la misma categoría.

## Limitaciones y advertencias

- Solo funciona con preguntas en inglés y en el estilo de Spider; otras formulaciones y dominios son menos fiables.
- Los errores en esquemas no vistos se concentran en joins y columnas incorrectos; las consultas con tres o más joins y las anidadas o de conjuntos son mucho más débiles (EX 27,9% y 50,3%).
- Los valores deben coincidir con la ortografía de la base de datos; el modelo copia los valores mostrados y falla a menudo con números escritos en palabras ("100 million").
- La decodificación guiada por ejecución requiere acceso a la base de datos; sin ella, se toma el primer beam y la EX baja.
- Uso previsto para consultas de solo lectura e investigación; debe revisarse el SQL generado antes de confiar en él.
- Riesgo de alucinación en nombres de tablas, columnas y valores no presentes en el esquema proporcionado.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia.
- El repositorio ocupa 20,6 GB, lo que puede dificultar la descarga y el despliegue en entornos con poco almacenamiento.
- Modelo con 0 descargas y 0 likes en Hugging Face; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iteshxt/spinneret-t5-base-ranked
- Ranker asociado: https://huggingface.co/iteshxt/spinneret-ranker-roberta-base
- Repositorio del proyecto: https://github.com/iteshxt/spinneret
- Dataset Spider: https://yale-lily.github.io/spider
- Modelo base: https://huggingface.co/google-t5/t5-base
- Paper de Spider (Yu et al., EMNLP 2018): no disponible como enlace directo en la información proporcionada
