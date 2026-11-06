# jaay2/school-management-t5-agent

## Resumen

El modelo `jaay2/school-management-t5-agent` es un checkpoint de ajuste fino por transferencia de aprendizaje sobre `google/flan-t5-small`, desarrollado por el usuario jaay2 para una aplicación concreta: un asistente de base de datos para gestión escolar. Su tarea es traducir consultas en lenguaje natural de administradores, profesorado y alumnado a una especificación en lenguaje específico de dominio (DSL) que se compila a consultas PostgreSQL parametrizadas contra un esquema `school` predefinido.

Arquitecturalmente es un transformer encoder-decoder (seq2seq) de la familia T5, con 76.961.152 parámetros totales y un tamaño de repositorio de 0,3 GB en formato safetensors. Al derivar de `flan-t5-small`, hereda el vocabulario SentencePiece y el contexto limitado de la familia T5 original, sin que la model card documente una longitud de contexto explícita.

La relevancia de esta ficha es acotada: se trata de un experimento de ajuste fino con un conjunto de entrenamiento muy reducido (100 muestras) y una precisión Exact Match en DSL del 0,0 % según los propios datos reportados por el autor. Resulta útil como ejemplo de pipeline text-to-DSL con anclaje estricto a esquema, pero no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (familia T5, derivado de google/flan-t5-small) |
| Parametros totales | 76.961.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de flan-t5-small; no documentada en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precisión completa) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline declarado | text2text-generation (la ficha de Hugging Face indica text-generation) |
| Modelo base | google/flan-t5-small |
| Muestras de entrenamiento | 100 |
| Muestras de validación | 10 |
| Tamaño del repositorio | 0,3 GB |
| Fecha de creación | 2026-11-05 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (no se documenta LoRA ni otra técnica de adaptación paramétrica eficiente) de `google/flan-t5-small`, un transformer encoder-decoder preentrenado y posteriormente instruido por Google con el corpus FLAN. La tarea de destino es seq2seq pura: recibe una consulta en lenguaje natural y emite una cadena DSL que representa una consulta contra vistas y tablas concretas del esquema `school` (`v_student_attendance_report`, `v_exam_report`, `v_pending_leaves`, `v_timetable`, `students`, `faculty`, `marks`).

Los datos de entrenamiento son extremadamente limitados: 100 muestras de entrenamiento y 10 de validación, con un tiempo de entrenamiento declarado de 127,72 segundos. No se especifica en la model card el número de tokens vistos, la composición del dataset, ni si hubo RLHF, DPO o alguna forma de alineación posterior. La pérdida de validación reportada es 1,9191 y la precisión Exact Match en DSL es del 0,0 %, lo que indica que el modelo no reproduce exactamente ninguna de las especificaciones DSL del conjunto de validación. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Traducción de lenguaje natural a DSL de consulta para un esquema PostgreSQL escolar concreto.
- Anclaje estricto a esquema: el modelo está entrenado para apuntar a tablas y vistas verificadas del dominio `school`.
- Resolución de entidades del dominio: nombres de estudiantes, nombres de profesorado, identificadores de curso y sección, tipos de examen y fechas.
- Generación de texto seq2seq genérica, heredada del ajuste fino sobre flan-t5-small.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Prototipado de asistentes text-to-SQL o text-to-DSL: sirve como esqueleto reproducible para validar un pipeline de traducción de lenguaje natural a especificaciones de consulta antes de invertir en un modelo mayor.
- Demostración académica de ajuste fino seq2seq: con 100 muestras y 127 segundos de entrenamiento, es un ejemplo didáctico de transfer learning sobre flan-t5-small para una tarea de dominio cerrado.
- Generación de borradores de consultas en un panel administrativo interno: el modelo puede producir una DSL candidata que un humano revise antes de compilarla a PostgreSQL, dado que su Exact Match es nulo y requiere supervisión.
- Extracción de entidades de dominio en texto libre: al estar entrenado con nombres de estudiantes, profesorado, cursos y fechas, puede emplearse como extractor preliminar en un pipeline de normalización de consultas.
- Integración en un sistema de gestión escolar como capa de sugerencia: conectado a las vistas `v_student_attendance_report` o `v_exam_report`, puede proponer la consulta que el usuario probablemente quiere ejecutar, siempre con confirmación humana.
- Evaluación comparativa de estrategias de anclaje a esquema: útil como línea base de bajo coste frente a modelos mayores al medir Exact Match en DSL sobre el mismo conjunto de validación.
- Experimentación con decodificación restringida: al ser un modelo pequeño y de licencia MIT, se puede envolver con gramáticas o autómatas que fuercen la salida a la DSL válida, compensando su baja precisión intrínseca.

## Benchmarks y rendimiento

Los únicos datos reportados por el autor en la model card son los siguientes. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Valor |
|---|---|
| Muestras de entrenamiento | 100 |
| Muestras de validación | 10 |
| Pérdida de validación | 1,9191 |
| Exact Match DSL (validación) | 0,0 % |
| Tiempo de entrenamiento | 127,72 s |
| Arquitectura base | google/flan-t5-small |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,3 GB de pesos más overhead de activaciones y tokenizador; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- VRAM estimada en fp16/bf16: aproximadamente 0,15 GB de pesos, aunque no se publican pesos en estos formatos en el repositorio.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) es suficiente; también funciona en CPU para inferencia interactiva dado el tamaño reducido.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 4 GB o más, e incluso en entornos sin GPU.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (método documentado por el autor); es compatible con `text-generation-inference` y con `vLLM` en la medida en que estos soporten arquitecturas T5, aunque no se documenta soporte explícito. No se publican pesos GGUF, por lo que `llama.cpp` y `Ollama` requerirían conversión previa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Exact Match DSL |
|---|---|---|---|---|---|
| jaay2/school-management-t5-agent | 76,9 M | no disponible | text-to-DSL escolar | MIT | 0,0 % (validación propia) |
| google/flan-t5-small | 76,9 M | 512 tokens (arquitectura T5 estándar) | seq2seq general e instrucciones | Apache 2.0 | no evaluado en esta tarea |
| google/flan-t5-base | 247,6 M | 512 tokens (arquitectura T5 estándar) | seq2seq general e instrucciones | Apache 2.0 | no evaluado en esta tarea |
| google/t5-small | 60,5 M | 512 tokens (arquitectura T5 estándar) | seq2seq general | Apache 2.0 | no evaluado en esta tarea |

La comparación con `flan-t5-small` es la más directa: el modelo aquí descrito es un ajuste fino del mismo, con la misma arquitectura y tamaño, pero especializado en una DSL concreta y con licencia MIT en lugar de Apache 2.0. Los datos de contexto de la familia T5 estándar se incluyen como referencia arquitectónica; la model card de este checkpoint no los declara explícitamente.

## Limitaciones y advertencias

- Exact Match en DSL del 0,0 % sobre el conjunto de validación: el modelo no reproduce exactamente ninguna especificación correcta en las 10 muestras de validación, según los datos del propio autor.
- Entrenamiento con solo 100 muestras: riesgo alto de sobreajuste y de generalización muy pobre a formulaciones no vistas.
- Pérdida de validación de 1,9191, elevada para una tarea de generación estructurada y corta.
- Sesgos conocidos: no documentados; al derivar de flan-t5-small hereda los sesgos del corpus de preentrenamiento de Google, no evaluados en esta ficha.
- Riesgo de alucinación: alto en la generación de identificadores de tablas, columnas o entidades no presentes en el esquema, dado el bajo Exact Match reportado.
- Limitación de idioma: solo inglés (`en`); no se garantiza comportamiento en castellano ni en otros idiomas.
- Limitación de contexto: no documentada; la familia T5 estándar opera con 512 tokens, lo que restringe consultas largas o conversaciones multi-turno.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero el modelo base `google/flan-t5-small` está bajo Apache 2.0, cuyas condiciones deben respetarse en la redistribución.
- Caveat para producción: no debe desplegarse como generador autónomo de consultas SQL sin validación humana o restricciones gramaticales, dado el riesgo de generar DSL inválida o referencias a objetos inexistentes.
- El pipeline declarado en la ficha de Hugging Face (`text-generation`) no coincide con el de la model card (`text2text-generation`), lo que puede causar problemas de carga automática en algunas herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaay2/school-management-t5-agent
- Modelo base: https://huggingface.co/google/flan-t5-small
