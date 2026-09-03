# Ganesh-Nadkarni/nl2sql-research

## Resumen

Este repositorio, publicado por Ganesh-Nadkarni, recoge los artefactos de un proyecto de investigación sobre traducción de lenguaje natural a SQL (NL2SQL). El trabajo compara cuatro enfoques: un sistema basado en reglas, un clasificador TF-IDF con Random Forest, un modelo LSTM seq2seq con atención y un transformer T5 fine-tuneado. El modelo principal es el T5, que se ofrece como un generador de texto a texto capaz de producir consultas SQL a partir de preguntas en lenguaje natural, entrenado sobre el dataset Spider.

La relevancia de este proyecto radica en que documenta la progresión metodológica desde técnicas clásicas de procesamiento de lenguaje natural hasta arquitecturas transformer, aportando una comparativa práctica para quien investigue en NL2SQL. El repositorio contiene los pesos del T5 en formato safetensors, junto con los artefactos de los otros modelos, lo que facilita la reproducibilidad de los experimentos. No se especifican el tamaño exacto del T5 (número de parámetros) ni la longitud de contexto soportada, pero el tamaño total del repositorio (0,7 GB) sugiere un modelo relativamente compacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (sequence-to-sequence transformer) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos completos en safetensors) |
| Idiomas soportados | no disponible (el dataset Spider es en ingles, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors (para T5), pickle (para Random Forest y rule-based), HDF5 (para LSTM) |

## Arquitectura y entrenamiento

El modelo principal es un T5 (Text-to-Text Transfer Transformer) fine-tuneado para la tarea de generar consultas SQL a partir de preguntas en lenguaje natural. La arquitectura T5 emplea un codificador-decodificador transformer, donde el codificador procesa la pregunta y el decodificador genera la sentencia SQL. El entrenamiento se realizó sobre el dataset Spider, que incluye bases de datos y consultas SQL anotadas. No se detallan en la documentación el número de épocas, el tamaño del batch, la tasa de aprendizaje ni el número total de tokens de entrenamiento para el T5.

El repositorio también incluye los otros enfoques comparados: un sistema basado en reglas que utiliza plantillas y patrones predefinidos, un modelo de Random Forest con vectorización TF-IDF (5000 características, 412 clases, 4100 muestras de entrenamiento) y un LSTM bidireccional con atención (embedding de 128 dimensiones, capa oculta de 256, secuencias de entrada de 50 tokens y salida de 100 tokens, dropout de 0,3, optimizador Adam con tasa inicial de 0,001 y 12 épocas de entrenamiento). Estos artefactos se proporcionan para comparación y reproducibilidad.

## Capacidades

- Generacion de consultas SQL a partir de preguntas en lenguaje natural (text-to-SQL).
- Soporte de generacion de texto a texto mediante la API de transformers (pipeline text2text-generation).
- Capacidad de procesar preguntas sobre esquemas de bases de datos relacionales, limitada al dominio del dataset Spider.
- No se menciona soporte para tool calling, function calling ni razonamiento multi-paso.
- No se indica capacidad multilingue; el dataset Spider esta en ingles.
- No se mencionan capacidades de vision, audio ni modo de pensamiento.

## Casos de uso

- Consulta de bases de datos para usuarios no tecnicos: un analista puede escribir una pregunta en lenguaje natural y obtener la consulta SQL equivalente, reduciendo la barrera de entrada al SQL.
- Generacion automatica de informes: en entornos donde se necesitan extraer datos de una base relacional, el modelo puede traducir preguntas frecuentes a SQL, acelerando la creacion de dashboards.
- Prototipado rapido de asistentes conversacionales: integrando el modelo en un chatbot, los usuarios pueden interactuar con una base de datos mediante dialogo, aunque el alcance esta limitado a las consultas cubiertas por el dataset Spider.
- Educacion y formacion en SQL: estudiantes pueden practicar traduciendo lenguaje natural a SQL y comparar sus respuestas con las generadas por el modelo.
- Investigacion comparativa en NL2SQL: el repositorio permite reproducir y comparar los cuatro enfoques (reglas, Random Forest, LSTM y T5) sobre el dataset Spider, sirviendo como punto de partida para nuevos experimentos.
- Evaluacion de arquitecturas: los artefactos del LSTM y del Random Forest pueden utilizarse como lineas base para medir la mejora que aportan los modelos transformer en tareas de generacion de SQL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el modelo T5 en la informacion disponible. La model card solo incluye resultados para los otros enfoques:

| Enfoque | Metrica | Resultado |
|---|---|---|
| Rule-Based (train) | Exact Match | 95,5% |
| Rule-Based (train) | Template Match | 97,5% |
| Rule-Based (familiar) | Exact Match | 53,0% |
| Rule-Based (familiar) | Template Match | 86,0% |
| Rule-Based (unseen) | Exact Match | 53,0% |
| Rule-Based (unseen) | Template Match | 87,0% |
| LSTM | Training Accuracy | 83,54% |
| LSTM | Validation Accuracy | 48,14% |

Estos datos corresponden a los modelos auxiliares, no al T5. No se aportan metricas como MMLU, HumanEval o GSM8K, ya que no son aplicables a esta tarea especifica.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU recomendadas en la documentacion del modelo.
- Dado que el repositorio ocupa 0,7 GB y el archivo de pesos del T5 (model.safetensors) es parte de ese tamaño, se estima que el modelo podria ejecutarse en una GPU de consumo con al menos 4-6 GB de VRAM si se trata de un T5-small o T5-base, aunque no se confirma el tamano exacto.
- El modelo es compatible con la libreria transformers, por lo que puede desplegarse con vLLM, TGI u Ollama si se convierte a formato GGUF, aunque no se proporcionan cuantizaciones predefinidas.
- Para inferencia en CPU, el T5 pequeno podria funcionar, pero con latencia mayor; no hay datos de throughput medido.
- Los artefactos del Random Forest y del LSTM requieren menos recursos y pueden ejecutarse en CPU sin problema.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria (por ejemplo, otros modelos NL2SQL como T5-base fine-tuneado en Spider, BART o GPT-4 con prompt engineering). La model card no proporciona resultados del T5 en el dataset Spider, ni se indican metricas estandar como exact match o execution accuracy. Por tanto, no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo es un artefacto de investigacion, no un producto listo para produccion. No se han documentado pruebas de robustez ni evaluaciones exhaustivas fuera del dataset Spider.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar con el autor antes de cualquier uso en entornos empresariales.
- No se indican sesgos conocidos, pero al entrenarse sobre Spider, el modelo puede estar limitado a los esquemas y tipos de consultas presentes en ese dataset, con riesgo de bajo rendimiento en bases de datos muy diferentes.
- Existe riesgo de alucinacion en la generacion de SQL, especialmente con consultas complejas o esquemas no vistos durante el entrenamiento.
- La longitud de contexto no se especifica; el T5 original tiene un limite de 512 tokens, pero no se confirma si el fine-tuning lo modifico.
- No se proporcionan metricas de rendimiento del T5, por lo que es dificil evaluar su calidad real para la tarea.
- El repositorio no incluye un pipeline de preprocesamiento completo ni instrucciones claras sobre el formato de entrada exacto del T5, lo que puede dificultar su uso directo.

## Enlaces

- [HuggingFace: Ganesh-Nadkarni/nl2sql-research](https://huggingface.co/Ganesh-Nadkarni/nl2sql-research)
- [Paper en Semantic Scholar: Comparative Study of AI Models for Natural Language to SQL Query](https://www.semanticscholar.org/paper/Comparative-Study-of-AI-Models-for-Natural-Language-Nadkarni-Chavan/91d062ab99a3bdd607e8cf782e6cbc198d1a2fec)
- [Repositorio de GitHub: GANESH-NADKARNI/NL_to_SQL_V2](https://github.com/GANESH-NADKARNI/NL_to_SQL_V2)
