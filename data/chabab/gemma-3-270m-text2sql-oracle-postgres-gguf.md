# chabab/gemma-3-270m-text2sql-oracle-postgres-GGUF

## Resumen

El modelo `chabab/gemma-3-270m-text2sql-oracle-postgres-GGUF` es una conversión a formato GGUF del fine-tune `chabab/gemma-3-270m-text2sql-oracle-postgres`, desarrollado por el usuario chabab. Se basa en Gemma-3 270M, un modelo transformer ligero de Google, y está especializado en la generación de consultas SQL para bases de datos Oracle y PostgreSQL a partir de esquemas y preguntas en lenguaje natural. Su tamaño reducido (268 millones de parámetros) lo hace adecuado para entornos con recursos limitados, como CPUs o GPUs de gama baja, y para integración en pipelines de automatización donde se requiere una respuesta rápida y determinista.

La relevancia de este modelo radica en su enfoque específico: está entrenado para emitir exactamente una sentencia SQL sin comentarios ni marcas de formato, lo que facilita su uso directo en herramientas de línea de comandos o en aplicaciones que necesitan parsear la salida. Al estar disponible en cuantizaciones f16 y q8_0, ofrece flexibilidad entre precisión y eficiencia. La licencia Apache 2.0 permite uso comercial sin restricciones significativas, aunque no se han publicado detalles sobre el dataset de entrenamiento ni métricas de rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-3 270M) |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros .gguf) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Gemma-3 270M, un transformer denso con atención estándar, aunque no se especifican detalles adicionales sobre la arquitectura interna (número de capas, cabezas de atención, etc.) en la información proporcionada. El proceso de entrenamiento se centra en la tarea de text-to-SQL para Oracle y PostgreSQL, pero no se han publicado datos sobre el volumen de tokens, la composición del dataset ni si se utilizaron técnicas como RLHF o DPO. La model card indica que el modelo está entrenado para generar una única sentencia SQL con decodificación greedy (temperatura 0) y sin producir texto adicional como explicaciones o delimitadores.

## Capacidades

- Generación de consultas SQL para bases de datos Oracle y PostgreSQL a partir de un esquema y una pregunta en lenguaje natural.
- Emisión de una sola sentencia SQL sin comentarios, marcas de formato ni texto adicional, lo que facilita su integración en scripts y herramientas automatizadas.
- Soporte para uso con decodificación greedy (temperatura 0) para obtener resultados deterministas.
- Compatible con entornos de ejecución como llama.cpp y Ollama, lo que permite despliegue en CPU y GPU.
- Al ser un modelo pequeño, ofrece baja latencia en inferencia, adecuado para aplicaciones en tiempo real.

## Casos de uso

- Asistente de consultas para analistas de datos: un analista puede escribir una pregunta en lenguaje natural y el modelo genera la consulta SQL correspondiente, reduciendo el tiempo de redacción manual. Su tamaño permite ejecutarlo en portátiles sin GPU dedicada.
- Automatización de reportes periódicos: en un pipeline de generación de informes, el modelo puede traducir preguntas predefinidas a SQL y ejecutarlas contra una base de datos Oracle o PostgreSQL, agilizando la extracción de métricas.
- Generación de consultas para pruebas de integración: en entornos de desarrollo, el modelo puede crear consultas SQL de prueba a partir de descripciones de casos, ayudando a validar esquemas y lógica de negocio.
- Herramienta educativa para aprendizaje de SQL: estudiantes pueden practicar formulando preguntas y comparando la consulta generada con la esperada, gracias a la salida limpia y sin ruido.
- Integración en chatbots de soporte técnico: un bot puede recibir preguntas sobre datos de una base de datos y devolver resultados mediante la consulta generada, siempre que el esquema esté bien definido.
- Migración de consultas entre dialectos: aunque está especializado en Oracle y PostgreSQL, puede usarse para traducir preguntas a SQL estándar, facilitando la portabilidad de aplicaciones entre sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo, ni comparaciones cuantitativas con otros sistemas text-to-SQL.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización q8_0 (292 MB) y f16 (543 MB), el modelo cabe en GPUs con 2 GB de VRAM o menos, incluyendo tarjetas integradas. En CPU, la memoria RAM necesaria es similar al tamaño del fichero más overhead de ejecución.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2050) o incluso CPUs modernas con soporte AVX2 para llama.cpp.
- Compatible con GPUs consumer de gama baja y con ejecución en CPU pura, gracias a su tamaño reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime que soporte GGUF (por ejemplo, llama-cpp-python, text-generation-webui).
- Latencia y throughput: no se han publicado datos específicos, pero por el tamaño del modelo se espera una latencia de milisegundos en GPU y de unos pocos cientos de milisegundos en CPU para consultas cortas.

## Comparativa con modelos similares

No se dispone de información detallada sobre otros modelos comparables en la misma categoría (text-to-SQL con tamaño similar). Existen otros fine-tunes de Gemma-3 270M para text-to-SQL, como `chabab/gemma-3-270m-it-text2sql` o `abidlabs/gemma-3-270m-text2sql`, pero no se han encontrado especificaciones técnicas ni benchmarks públicos que permitan una comparación cuantitativa. Se recomienda evaluar estos modelos directamente en el caso de uso concreto.

## Limitaciones y advertencias

- El modelo es de tamaño muy reducido (268M parámetros), por lo que puede presentar alucinaciones o errores en consultas complejas, especialmente con esquemas grandes o preguntas ambiguas.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconoce su cobertura de dialectos SQL, funciones específicas de Oracle o PostgreSQL, o posibles sesgos en los datos.
- La longitud de contexto no está documentada; aunque Gemma-3 270M soporta hasta 32k tokens según fuentes externas, no se confirma para este fine-tune, lo que limita el tamaño del esquema que puede procesar.
- La salida está restringida a una única sentencia SQL; no es adecuado para tareas que requieran explicaciones, múltiples consultas o interacción conversacional.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no ofrece garantías sobre la precisión o seguridad de las consultas generadas; es responsabilidad del usuario validar los resultados en entornos de producción.
- No se han reportado sesgos específicos, pero al ser un modelo entrenado en datos no documentados, podría reflejar sesgos presentes en el corpus de entrenamiento.

## Enlaces

- [Modelo GGUF en Hugging Face](https://huggingface.co/chabab/gemma-3-270m-text2sql-oracle-postgres-GGUF)
- [Modelo base (fine-tune original)](https://huggingface.co/chabab/gemma-3-270m-text2sql-oracle-postgres)
- [Modelo Gemma-3 270M original (referencia)](https://huggingface.co/google/gemma-3-270m) (enlace no verificado, se infiere del nombre)
