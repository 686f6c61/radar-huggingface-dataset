# iteshxt/spinneret-ablation-t1-no-train-others

## Resumen

Spinneret ablation E6 es un checkpoint de investigación derivado de `google-t5/t5-small`, afinado para la tarea de text-to-SQL sobre el conjunto de datos Spider. El modelo recibe una pregunta en inglés junto con el esquema completo de una base de datos SQLite y genera la consulta SQL correspondiente. Lo publica el autor independiente iteshxt como parte del proyecto Spinneret, un trabajo que compara tres variantes: Baseline (T5-small), Lite (T5-small más un ranker) y Spinneret (T5-base más un ranker).

Este checkpoint concreto es una ablación: el Baseline entrenado únicamente con el split `train_spider` (7.000 preguntas), sin el split `train_others` (1.659 preguntas) de Spider. Su propósito es medir cuantitativamente qué aporta el corpus adicional, no servir en producción. El autor remite explícitamente a `iteshxt/spinneret-t5-small` para uso real.

Arquitectura T5 estándar (encoder-decoder transformer) con 60,49 millones de parámetros, contexto de entrada limitado a 512 tokens por truncamiento en el código de ejemplo y salida de hasta 256 tokens nuevos. El interés actual es metodológico: ofrece cifras de evaluación oficial sobre Spider dev (49,0 % de execution accuracy global) y un desglose por tipo de pregunta que documenta con precisión dónde falla un T5-small en text-to-SQL.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | 60.494.336 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens de entrada (truncamiento en el ejemplo del autor); salida de hasta 256 tokens nuevos |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

T5-small es un transformer encoder-decoder denso con atención completa, tokenizador SentencePiece y objetivos de span corruption en su preentrenamiento original. En este checkpoint se ha realizado un fine-tuning supervisado seq2seq sobre pares (pregunta + esquema serializado, SQL). No se reporta RLHF, DPO ni ningún ajuste por preferencias.

Los datos de entrenamiento son el split `train_spider` de Spider (7.000 preguntas), excluyendo `train_others` (1.659 preguntas), y restando un 10 % de las bases de datos de entrenamiento reservado como validación con split por base de datos (evitando fuga de esquemas entre train y val). El optimizador es Adafactor con learning rate 0,001, batch efectivo 32 y early stopping sobre execution accuracy de validación. La mejor época fue la 14, con EM de validación del 44,4 % y EX del 48,7 %. El entrenamiento se ejecutó en una GPU Kaggle T4 (evaluación realizada en un portátil). La entrada serializa el esquema como `pregunta | base_de_datos | tabla : columna , columna ( valor_coincidente ) | …` con nombres en minúsculas y valores del esquema que aparecen en la pregunta mostrados entre paréntesis junto a su columna, una técnica de *value matching* que ayuda al modelo a copiar literales correctamente.

## Capacidades

- Generación de SQL ejecutable (dialecto SQLite) a partir de una pregunta en inglés y un esquema de base de datos completo.
- Serialización de esquema con coincidencia de valores (*value matching*): el modelo copia literales que se le muestran entre paréntesis.
- Decodificación con beam search (4 beams en la evaluación) y decodificación guiada por ejecución (*execution-guided decoding*), que descarta candidatos que no se ejecutan.
- Consultas de agregación (AVG, MIN, MAX, COUNT) y filtros con WHERE sobre una tabla.
- Consultas con joins de dos tablas, aunque con rendimiento muy inferior (21,9 % EX).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés; el autor advierte que otras formulaciones y dominios son menos fiables.

## Casos de uso

- Investigación en text-to-SQL: sirve como punto de comparación controlado para medir el efecto de añadir el split `train_others` de Spider, ya que comparte configuración exacta con el Baseline del proyecto Spinneret.
- Reproducción de experimentos académicos: el repositorio incluye `config.yaml` y el pipeline de evaluación oficial, lo que permite replicar las cifras de Spider dev con el test-suite oficial.
- Generación de consultas de solo lectura en prototipos internos: para preguntas de agregación o filtros simples sobre una tabla, con 72,6 % de exact match en agregaciones y 70,2 % en búsquedas simples, puede generar SQL de borrador que un humano revise.
- Docencia y formación: útil para ilustrar las limitaciones de los modelos pequeños en composición de joins y en consultas anidadas, con un desglose por tipo de pregunta ya publicado.
- Análisis de errores automatizado: el desglose por tipo (multi-join 2,3 % EX, nested/set-op 34,0 % EX) permite construir taxonomías de fallo y diseñar mejoras dirigidas (por ejemplo, rankers o retrievers de esquema).
- Evaluación de infraestructura de decodificación guiada por ejecución: el checkpoint requiere la base de datos para descartar candidatos inválidos, lo que lo convierte en un banco de pruebas para pipelines que ejecutan SQL en un entorno aislado.

## Benchmarks y rendimiento

Evaluación sobre Spider dev: 1.034 preguntas sobre 20 bases de datos no vistas en entrenamiento, test-suite oficial, beam search guiado por ejecución con 4 beams.

| Métrica | easy | medium | hard | extra | all |
|---|---|---|---|---|---|
| Exact match % | 81,5 | 45,1 | 41,4 | 20,5 | 49,2 |
| Execution accuracy % | 81,0 | 45,5 | 38,5 | 21,7 | 49,0 |

SQL válido (ejecutable): 67,4 %.

| Tipo de pregunta | n | EX % |
|---|---|---|
| simple lookup | 252 | 70,2 |
| aggregation | 292 | 72,6 |
| two-table join | 288 | 21,9 |
| multi-join | 43 | 2,3 |
| nested / set-op | 159 | 34,0 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 0,24 GB de pesos (60,5 M de parámetros); en fp16, unos 0,12 GB. Con overhead de activaciones y beam search de 4 beams, cabe holgadamente en menos de 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el autor entrenó en una Kaggle T4 y evaluó en un portátil. Una RTX 4090 o A100 están sobredimensionadas para este modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más (GTX 1650, RTX 3060, RTX 4060, etc.). También es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM`; el proyecto Spinneret ofrece un servidor de demo (`uv run spinneret serve` en el puerto 8000) con API. El tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada. El tamaño del modelo (60 M de parámetros) y el beam search de 4 candidatos con hasta 256 tokens nuevos implican un coste bajo, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Spider dev EX | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spinneret-ablation-t1-no-train-others (este) | 60,5 M | 512 tokens de entrada | 49,0 % (all) | CC BY-SA 4.0 | Hugging Face |
| spinneret-t5-small (Baseline del proyecto) | 60,5 M (T5-small) | no disponible | no disponible en esta ficha (el autor lo señala como el modelo para uso real) | no disponible en la información | Hugging Face |
| spinneret (T5-base + ranker) | ~220 M (T5-base, estimado por arquitectura) | no disponible | no disponible en la información | no disponible en la información | Hugging Face / GitHub |
| google-t5/t5-small (base) | 60,5 M | 512 tokens | no aplica (no afinado para SQL) | Apache 2.0 | Hugging Face |

No se dispone de cifras de benchmarks de los otros checkpoints del proyecto en la información proporcionada; no se inventan valores.

## Limitaciones y advertencias

- Checkpoint de ablación: el autor indica explícitamente que no se usa en la demo y que para uso real debe tomarse `iteshxt/spinneret-t5-small`.
- Solo inglés y solo el estilo de formulación de Spider; otras frases y dominios son menos fiables.
- Errores dominantes en esquemas no vistos: joins incorrectos y columnas equivocadas. Las consultas con tres o más joins (2,3 % EX) y las anidadas o con operadores de conjunto (34,0 % EX) son mucho más débiles que las búsquedas simples.
- Los valores deben coincidir con la ortografía de la base de datos; el modelo copia los valores que se le muestran y falla a menudo con números escritos en palabras ("100 million").
- La decodificación guiada por ejecución necesita acceso a la base de datos; sin ella, se toma el primer beam y la execution accuracy baja.
- Solo SQL válido en el 67,4 % de los casos: un tercio de las salidas no se ejecuta.
- Destinado a consultas de solo lectura e investigación; hay que revisar el SQL generado antes de confiar en él.
- Licencia CC BY-SA 4.0: es una obra derivada de Spider (Yu et al., EMNLP 2018), por lo que se comparte bajo la misma licencia; el uso comercial exige cumplir las condiciones de atribución y compartir-al-igual.
- Riesgo de alucinación en nombres de columnas y tablas no presentes en el esquema serializado, y en literales no mostrados en la entrada.
- Sesgos: no se documentan sesgos específicos más allá de los del corpus Spider y del preentrenamiento de T5-small; no hay información adicional disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iteshxt/spinneret-t5-small
- Modelo base: https://huggingface.co/google-t5/t5-small
- Repositorio del proyecto Spinneret: https://github.com/iteshxt/spinneret
- Dataset Spider: https://yale-lily.github.io/spider
- Paper de Spider (Yu et al., EMNLP 2018): no disponible enlace directo en la información proporcionada
- Demo: el repositorio incluye una demo servida en el puerto 8000 (`uv run spinneret serve`)
