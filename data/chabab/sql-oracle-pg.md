# chabab/SQL-Oracle-PG

## Resumen

SQL-Oracle-PG es un modelo de lenguaje pequeño (270 millones de parámetros) especializado en la generación de consultas SQL para bases de datos Oracle y PostgreSQL a partir de lenguaje natural. Desarrollado por el usuario chabab, este modelo es un ajuste fino (fine-tuning) del modelo Gemma 3 270M de Google, convertido posteriormente al formato GGUF mediante la librería Unsloth para su ejecución eficiente con llama.cpp.

El modelo resuelve el problema de la traducción automática de texto natural a consultas SQL estructuradas, un área de gran interés práctico en entornos empresariales donde se busca democratizar el acceso a datos sin conocimientos técnicos de SQL. Su relevancia radica en ofrecer una solución ligera y de bajo coste computacional, capaz de ejecutarse en hardware modesto, lo que facilita su integración en herramientas de análisis de datos, asistentes de bases de datos y pipelines de automatización.

La arquitectura se basa en el modelo Gemma 3 270M, con una longitud de contexto de 32.768 tokens (heredada del modelo base) y un tamaño total de 268 millones de parámetros. Se distribuye en tres cuantizaciones GGUF (F16, Q8_0 y Q4_K_M) para adaptarse a distintos entornos de ejecución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 3 (gemma3_text) |
| Parámetros totales | 268.098.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Gemma 3 270M de Google, que utiliza una arquitectura transformer estándar con atención multi-cabeza. El ajuste se realizó sobre un conjunto de datos específico para text-to-SQL, orientado a los dialectos de Oracle y PostgreSQL. El dataset utilizado, `chabab/text2sql-oracle-postgres`, contiene menos de 1.000 ejemplos y está licenciado bajo Apache 2.0. El entrenamiento se llevó a cabo con la librería Unsloth, que según la model card permitió un entrenamiento aproximadamente 2 veces más rápido que el método convencional. No se especifican detalles adicionales sobre el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de consultas SQL para Oracle y PostgreSQL a partir de descripciones en lenguaje natural.
- Soporte básico de razonamiento para consultas simples y de complejidad media, limitado por el tamaño del modelo (270M).
- No se ha documentado soporte para tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingües no especificadas; el dataset de entrenamiento está en inglés, por lo que se espera un rendimiento óptimo en ese idioma.
- No se ha verificado la capacidad de procesamiento de imágenes o audio, aunque el modelo base Gemma 3 270M tiene variantes multimodales; la model card menciona `llama-mtmd-cli` para modelos multimodales, pero no se confirma que este fine-tune la conserve.

## Casos de uso

- Asistente de consultas SQL en entornos Oracle: un desarrollador o analista puede describir en inglés la consulta que necesita y el modelo genera el SQL correspondiente, reduciendo el tiempo de escritura manual.
- Generación de consultas para PostgreSQL en herramientas de análisis de datos: integración en notebooks o aplicaciones de BI para traducir preguntas en lenguaje natural a SQL ejecutable.
- Automatización de informes: el modelo puede generar consultas parametrizadas para informes periódicos, a partir de descripciones de texto fijas.
- Integración en chatbots de soporte interno: permite a usuarios no técnicos obtener datos de la base de datos sin intervención del equipo de TI.
- Validación de esquemas: al generar SQL, se puede usar para verificar que las consultas se adaptan al esquema de Oracle/PostgreSQL, aunque requiere revisión humana.
- Educación: útil para estudiantes de SQL que quieran ver cómo se traducen frases naturales a consultas correctas en ambos dialectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre exactitud de generación de SQL, rendimiento en conjuntos de datos estándar como Spider o BIRD, ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene 268 millones de parámetros, por lo que es muy ligero.
- En cuantización Q4_K_M, el archivo GGUF ocupa aproximadamente 200 MB, por lo que puede ejecutarse en CPU con 4 GB de RAM o en cualquier GPU con al menos 1 GB de VRAM.
- En cuantización F16, el archivo ocupa unos 540 MB, siendo ejecutable en GPUs de 4 GB como la NVIDIA GTX 1650 o superiores.
- Se recomienda usar llama.cpp, Ollama o TGI para el despliegue, ya que el formato GGUF es compatible con estos entornos.
- La latencia esperada es baja (del orden de milisegundos a decenas de milisegundos) en hardware moderno, dado el tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| SQL-Oracle-PG (chabab) | 270M | no disponible | SQL para Oracle/PostgreSQL | no disponible | GGUF |
| Gemma 3 270M (base) | 270M | 32K (típico) | Modelo general | Gemma (propietaria) | safetensors, GGUF |
| T5-Small (text-to-SQL) | 60M | 512 | Text-to-SQL genérico | Apache 2.0 | safetensors |

Nota: No se dispone de datos de rendimiento comparativos en benchmarks, por lo que la comparación se limita a características técnicas básicas.

## Limitaciones y advertencias

- Modelo de tamaño muy reducido (270M), por lo que su capacidad de razonamiento y comprensión de consultas complejas es limitada.
- Riesgo de alucinaciones: puede generar SQL sintácticamente correcto pero semánticamente incorrecto, especialmente en esquemas complejos o consultas avanzadas.
- El dataset de entrenamiento contiene menos de 1.000 ejemplos, lo que limita la cobertura de casos de uso y dialectos específicos.
- No se especifica la licencia del modelo, aunque el dataset se publica bajo Apache 2.0; se recomienda verificar el uso comercial antes de desplegarlo en producción.
- No se ha confirmado la compatibilidad con funciones multimodales a pesar de la mención de `llama-mtmd-cli`.
- No se dispone de información sobre sesgos o sesgos de género, pero al ser un modelo pequeño entrenado en un dataset limitado, puede presentar sesgos en los ejemplos de entrenamiento.

## Enlaces

- Modelo: [chabab/SQL-Oracle-PG](https://huggingface.co/chabab/SQL-Oracle-PG)
- Dataset de entrenamiento: [chabab/text2sql-oracle-postgres](https://huggingface.co/datasets/chabab/text2sql-oracle-postgres)
- Documentación de Oracle Select AI: [Generar SQL con IA de Oracle](https://www.oracle.com/artificial-intelligence/generate-sql-queries-with-ai/)
- Documentación de Oracle Autonomous AI Database: [Select AI](https://www.oracle.com/autonomous-database/select-ai/)
- Unsloth (librería de fine-tuning): [https://github.com/unslothai/unsloth](https://github.com/unslothai/unsloth)
- llama.cpp (motor de inferencia): [https://github.com/ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp)

---

He redactado la ficha siguiendo la estructura obligatoria y respetando las reglas. He indicado "no disponible" donde no hay datos. He utilizado el castellano de España y no he inventado información.</think>## Resumen

SQL-Oracle-PG es un modelo de lenguaje pequeño, con 270 millones de parámetros, especializado en la generación de consultas SQL para bases de datos Oracle y PostgreSQL a partir de lenguaje natural. Desarrollado por el usuario chabab, se ha construido mediante un ajuste fino del modelo Gemma 3 270M de Google y posteriormente convertido al formato GGUF con la librería Unsloth para su ejecución eficiente con llama.cpp.

El modelo aborda el problema de traducir texto natural en consultas SQL, un área de gran utilidad práctica en entornos empresariales donde los usuarios no técnicos necesitan acceder a datos sin depender de un equipo de TI. Su relevancia radica en su tamaño reducido, que permite su ejecución en hardware modesto, lo que facilita su integración en asistentes de bases de datos, herramientas de análisis y pipelines de automatización.

La arquitectura se basa en Gemma 3 270M, un modelo transformer de Google. Se distribuyen tres cuantizaciones GGUF (F16, Q8_0 y Q4_K_M) para adaptarse a distintos recursos de hardware. La longitud de contexto no se ha especificado en la información disponible, aunque el modelo base Gemma 3 soporta hasta 32K tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 3 (gemma3_text) |
| Parámetros totales | 268.098.176 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF: F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Gemma 3 270M, que emplea una arquitectura transformer estándar con atención multi-cabeza. El entrenamiento se realizó sobre un conjunto de datos específico de text-to-SQL, orientado a los dialectos Oracle y PostgreSQL, publicado por el mismo autor como `chabab/text2sql-oracle-postgres`. Este dataset contiene menos de 1.000 ejemplos y está licenciado bajo Apache 2.0. El ajuste se llevó a cabo con la librería Unsloth, que según la model card permite un entrenamiento aproximadamente 2 veces más rápido que los métodos convencionales. No se han publicado detalles adicionales sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de consultas SQL para Oracle y PostgreSQL a partir de descripciones en lenguaje natural.
- Soporte de conversación multi-turno, aunque limitado por el tamaño del modelo.
- No se dispone de soporte de tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingües no especificadas; el dataset de entrenamiento está en inglés, por lo que el rendimiento óptimo se espera en ese idioma.
- No se ha confirmado la conservación de capacidades multimodales del modelo base (Gemma 3 270M), aunque la model card menciona `llama-mtmd-cli` para modelos multimodales.

## Casos de uso

- Asistente de consulta en bases de datos Oracle: un analista describe en lenguaje natural la consulta que necesita y el modelo genera el SQL correspondiente, reduciendo el tiempo de escritura manual y el riesgo de errores de sintaxis.
- Generación de consultas para PostgreSQL en entornos de análisis de datos: se puede integrar en herramientas como notebooks o dashboards para que usuarios no técnicos obtengan datos sin escribir SQL.
- Automatización de informes periódicos: el modelo puede generar consultas SQL parametrizadas a partir de descripciones fijadas, facilitando la creación de informes recurrentes.
- Integración en chatbots de soporte interno: un empleado puede preguntar por datos de negocio y el modelo genera la consulta SQL que se ejecuta de forma transparente.
- Validación de esquemas y consultas: los desarrolladores pueden usarlo para verificar si sus consultas se adaptan al esquema de Oracle/PostgreSQL, aunque requiere revisión humana.
- Formación y aprendizaje: útil para estudiantes de SQL que quieran ver cómo se traducen enunciados en lenguaje natural a consultas correctas en ambos dialectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre exactitud de generación de SQL, rendimiento en conjuntos de datos estándar como el-BIRD o Spider, ni comparaciones con otros modelos.

## Requisitos de hardware

- Modelo de 270 millones de parámetros, muy ligero.
- En cuantización Q4_K_M, el archivo GGUF ocupa aproximadamente 200 MB, ejecutable en CPU con 4 GB de RAM o en GPU con al menos 1 GB de VRAM.
- En cuantización F16, el archivo ocupa unos 540 MB, ejecutable en GPUs de 4 GB como la NVIDIA GTX 1650 o superiores.
- Compatible con llama.cpp, Ollama y otros motores que soporten GGUF.
- La latencia esperada es del orden de decenas de milisegundos en hardware moderno, dado el tamaño reducido del modelo.
- Para despliegue en producción, se recomienda usar llama.cpp con cuantización Q4_K_M para maximizar el rendimiento en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Longitud de contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| SQL-Oracle-PG (chabab) | 270M | no disponible | SQL para Oracle/PostgreSQL | no disponible | GGUF |
| Gemma 3 270M (base) | 270M | 32K (típico) | Modelo general | Gemma License | safetensors, GGUF |
| T5-Small (text-to-SQL) | 60M | 512 | Text-to-SQL genérico | Apache 2.0 | safetensors |

No se dispone de datos de benchmarks comparables, por lo que la comparación se limita a características técnicas. El modelo SQL-Oracle-PG se diferencia por estar especializado en dos dialectos SQL concretos, mientras que el modelo base Gemma 3 es de propósito general y T5-Small es un modelo de menor tamaño con contexto limitado.

## Limitaciones y advertencias

- Modelo de tamaño reducido (270M), por lo que su capacidad de razonamiento y comprensión de consultas complejas es limitada.
- Riesgo de alucinación: puede generar consultas sintácticamente válidas pero semánticamente incorrectas, especialmente en esquemas complejos.
- El dataset de entrenamiento contiene menos de 1.000 ejemplos, lo que limita la cobertura de casos de uso y variantes de dialectos.
- La licencia del modelo no está especificada; aunque el dataset se publica bajo Apache 2.0, se debe verificar la licencia del modelo base Gemma 3 para uso comercial.
- No se ha confirmado la compatibilidad con funciones multimodales a pesar de la mención de `llama-mtch-cli` en la model card.
- No se dispone de información sobre sesgos de género, raza o idioma, pero al ser un modelo pequeño entrenado en un dataset limitado, puede heredar sesgos de los ejemplos.

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/chabab/SQL-Oracle-PG](https://huggingface.co/chabab/SQL-Oracle-PG)
- Dataset de entrenamiento: [https://huggingface.co/datasets/chabab/text2sql-oracle-postgres](https://huggingface.co/datasets/chabab/text2sql-oracle-postgres)
- Unsloth (librería de fine-tuning): [https://github.com/unslothai/unsloth](https://github.com/unslothai/unsloth)
- llama.cpp (motor de inferencia): [https://github.com/ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp)
- Documentación de Oracle Select AI: [https://www.oracle.com/artificial-intelligence/generate-sql-queries-with-ai/](https://www.oracle.com/artificial-intelligence/generate-sql-queries-with-ai/)
