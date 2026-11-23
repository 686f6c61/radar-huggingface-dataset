# iteshxt/spinneret-ablation-t1-no-values

## Resumen

Spinneret ablation T1 (etiquetado internamente como E3 en la model card) es un checkpoint de ablación derivado de `google-t5/t5-small`, ajustado para la tarea de text-to-SQL sobre el conjunto de datos Spider. El modelo recibe una pregunta en inglés junto con el esquema completo de una base de datos SQLite y genera la consulta SQL correspondiente. Lo desarrolla el autor independiente iteshxt como parte del proyecto Spinneret, que compara tres configuraciones: un baseline T5-small, una variante Lite (T5-small con un ranker) y Spinneret (T5-base con ranker).

La particularidad de este checkpoint es metodológica: se entrenó y evaluó sin incluir los valores de la base de datos en la entrada, con el objetivo de medir cuánto aporta el *value matching* al rendimiento final. Por tanto, no está pensado para uso en producción; el propio autor remite a `spinneret-t5-small` para aplicaciones reales. Aun así, sus resultados publicados sobre el dev set de Spider (46,7 % de execution accuracy global) resultan útiles como referencia de lo que consigue un T5-small sin información de valores.

Con 60,5 millones de parámetros y un repositorio de 0,2 GB, es un modelo muy ligero, entrenable en una sola GPU T4 de Kaggle y desplegable en hardware de consumo. Su relevancia actual es principalmente como pieza de investigación reproducible dentro de un estudio de ablación, no como solución lista para integrar en productos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5), secuencia a secuencia |
| Parametros totales | 60.494.336 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el ejemplo de uso trunca la entrada a 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, pero no se documentan variantes) |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `google-t5/t5-small`, un transformer encoder-decoder estándar con atención completa, sin mecanismos híbridos ni decodificación especulativa. La entrada se serializa como una cadena plana con el formato `question | database | table : column , column | …`, con los nombres en minúsculas y sin mostrar ningún valor de la base de datos, que es precisamente la condición experimental de esta ablación. La salida es SQL dialecto SQLite.

El entrenamiento usó `train_spider` (7.000 preguntas) más `train_others` (1.659), excluyendo un 10 % de las bases de datos de entrenamiento reservado para validación con split por base de datos. Se optimizó con Adafactor, tasa de aprendizaje 0,001, batch efectivo de 32 y parada temprana sobre execution accuracy de validación. La mejor época fue la 12, con 42,3 % de exact match y 46,8 % de execution accuracy en validación. El entrenamiento se realizó en una GPU T4 de Kaggle. En evaluación se aplica *execution-guided beam search* con 4 haces: se conserva la primera consulta candidata que se ejecuta correctamente contra la base de datos.

## Capacidades

- Generación de SQL a partir de lenguaje natural en inglés, restringido al dialecto SQLite y a esquemas del estilo Spider.
- Lectura del esquema completo de la base de datos, incluidas tablas y columnas, sin acceso a los valores almacenados.
- Manejo de consultas de búsqueda simple, agregaciones, joins de dos tablas y, con menor fiabilidad, joins múltiples y consultas anidadas o con operaciones de conjuntos.
- Decodificación con múltiples haces y selección guiada por ejecución (requiere acceso a la base de datos para validar candidatos).
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.
- No dispone de modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en text-to-SQL: sirve como punto de comparación controlado para medir la contribución del *value matching* frente a los otros checkpoints del proyecto Spinneret, ya que comparte arquitectura, datos y configuración de entrenamiento con ellos.
- Reproducción de experimentos académicos: al ser un T5-small de 60 M de parámetros, permite reentrenar y evaluar variantes en una sola GPU T4, lo que facilita estudios de ablación con presupuesto reducido.
- Docencia y aprendizaje: su tamaño y su formato de entrada sencillo lo hacen adecuado para explicar pipelines de secuencia a secuencia aplicados a generación de SQL en cursos o talleres.
- Prototipado de asistentes de consulta sobre bases de datos pequeñas: para esquemas simples y preguntas de búsqueda o agregación, puede generar SQL ejecutable que después se revise manualmente antes de lanzarlo.
- Generación de consultas de solo lectura en entornos controlados: el autor lo orienta explícitamente a consultas de lectura e investigación, con verificación previa del SQL generado.
- Evaluación de pipelines de decodificación guiada por ejecución: permite probar estrategias de beam search con validación contra la base de datos y comparar su impacto en exact match y execution accuracy.

## Benchmarks y rendimiento

Resultados sobre Spider dev: 1.034 preguntas en 20 bases de datos no vistas en entrenamiento, evaluación oficial con test-suite y beam search guiado por ejecución con 4 haces.

| Dificultad | Exact match % | Execution accuracy % |
|---|---|---|
| Easy | 73,0 | 72,2 |
| Medium | 40,8 | 44,8 |
| Hard | 36,8 | 42,0 |
| Extra | 15,1 | 18,7 |
| Global | 43,7 | 46,7 |

SQL válido (ejecutable): 66,4 %.

| Tipo de pregunta | n | Exact match % |
|---|---|---|
| Búsqueda simple | 252 | 65,5 |
| Agregación | 292 | 65,1 |
| Join de dos tablas | 288 | 25,0 |
| Multi-join | 43 | 2,3 |
| Anidada / operación de conjuntos | 159 | 34,6 |

No se han publicado en la información disponible resultados comparativos con otros modelos externos al proyecto Spinneret.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (60,5 M de parámetros, unos 242 MB de pesos) y en torno a 0,5-1 GB considerando activaciones y buffers de decodificación con haces.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una T4 de Kaggle, suficiente también para inferencia.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3060, RTX 4060 o superiores, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM`, y el propio framework Spinneret (servidor de demo en el puerto 8000). El tag `text-generation-inference` aparece en Hugging Face, pero no se documenta una configuración TGI específica. No se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo de 60 M de parámetros con decodificación de 4 haces, la latencia será baja en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spinneret-ablation-t1-no-values | 60,5 M | no disponible (entrada truncada a 512) | T5-small ajustado en Spider sin valores | cc-by-sa-4.0 | Hugging Face |
| spinneret-t5-small | mismo tamaño base (T5-small) | no disponible | T5-small ajustado en Spider con *value matching* y ranker; recomendado por el autor para uso real | no disponible en la información | Hugging Face |
| spinneret-t5-base | mayor que T5-small (T5-base) | no disponible | T5-base con ranker; configuración principal del proyecto | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Checkpoint de ablación: el propio autor indica que no se usa en la demo y que para uso real debe emplearse `spinneret-t5-small`.
- Sin *value matching*: al no recibir valores de la base de datos, los valores literales de las consultas deben coincidir exactamente con la ortografía de la base de datos; los números escritos en palabras ("100 million") suelen generar errores.
- Rendimiento muy desigual por tipo de consulta: 65,5 % de exact match en búsquedas simples frente a 2,3 % en multi-join y 25,0 % en joins de dos tablas.
- Errores frecuentes en esquemas no vistos: joins incorrectos y columnas equivocadas.
- Solo inglés y solo el estilo de preguntas de Spider; otros dominios y formulaciones son menos fiables.
- La decodificación guiada por ejecución requiere acceso a la base de datos; sin ella, se toma el primer haz y la execution accuracy baja.
- Solo válido para consultas de lectura; el SQL generado debe revisarse antes de confiar en él.
- Licencia cc-by-sa-4.0: permite uso comercial, pero obliga a compartir las obras derivadas bajo la misma licencia y a atribuir tanto el modelo base (Apache-2.0) como el dataset Spider.
- Riesgo de alucinación en nombres de tablas y columnas no presentes en el esquema, especialmente en esquemas grandes.
- No se documentan sesgos específicos más allá de los inherentes al corpus Spider.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iteshxt/spinneret-ablation-t1-no-values
- Modelo recomendado para uso real: https://huggingface.co/iteshxt/spinneret-t5-small
- Repositorio del proyecto Spinneret: https://github.com/iteshxt/spinneret
- Dataset Spider: https://yale-lily.github.io/spider
- Modelo base: https://huggingface.co/google-t5/t5-small
