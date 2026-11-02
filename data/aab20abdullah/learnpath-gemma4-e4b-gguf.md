# aab20abdullah/learnpath-gemma4-e4b-gguf

## Resumen

LearnPath Gemma 4 E4B es un ajuste fino (fine-tuning) del modelo google/gemma-4-E4B-it, desarrollado por el usuario aab20abdullah, orientado a una tarea muy concreta: generar planes de estudio estructurados en formato JSON. El modelo forma parte de la aplicación LearnPath (مسار), un generador de planes de aprendizaje que se ejecuta íntegramente en local: el usuario indica un tema, las horas disponibles al día y el número de días, y el sistema construye una hoja de ruta, una lista de tareas diarias y recursos gratuitos.

El ajuste se realizó con QLoRA de 4 bits sobre la base de Gemma 4 E4B-it, con un total de 7.518.069.290 parámetros en los pesos originales, y se distribuye en formato GGUF con cuantización Q4_K_M (5,0 GB), pensado para ejecutarse con Ollama tanto en CPU como en GPU. El modelo cubre tres tareas encadenadas del pipeline: intake (evaluación de viabilidad del presupuesto de horas), curriculum (descomposición del tema en habilidades ordenadas con dependencias) y rank (selección de los mejores resultados de búsqueda entre candidatos numerados).

Su relevancia radica en que demuestra un caso de ajuste fino muy especializado con recursos mínimos —una sola GPU T4 de Kaggle, 470 pasos y 96 minutos de entrenamiento— que mejora drásticamente el cumplimiento de restricciones de formato y contenido frente al modelo base, pasando de un 34% a un 98,5% de ejemplos válidos en la evaluación del autor. No obstante, el propio autor advierte de que no es un modelo de chat general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E4B-it); detalles de atención y capas no disponibles |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (el sufijo E4B de la base sugiere un diseño con expertos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | 8k tokens (configurado en el Modelfile de Ollama) |
| Tipos de cuantizacion | GGUF Q4_K_M (única publicada en el repo) |
| Idiomas soportados | en, ar |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (exportado desde un LoRA de 4 bits) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it y se ajusta mediante QLoRA con la librería Unsloth sobre una única GPU Kaggle T4. La configuración del LoRA es r=16, alpha=32, aplicado únicamente a las capas de lenguaje, con la función de pérdida calculada solo sobre las respuestas. El entrenamiento constó de 470 pasos durante 96 minutos, con una pérdida final de entrenamiento de 0,202.

Los datos de entrenamiento son aproximadamente 3.750 ejemplos sintéticos (788 de intake, 1.778 de curriculum y 1.184 de rank), generados por Gemma 4 26B-A4B ejecutándose en local con llama.cpp y conservados solo si superaban las mismas comprobaciones automáticas usadas en la evaluación. Los temas de evaluación quedaron excluidos del conjunto de entrenamiento. El modelo se entrenó con prompts exactos y fijos por tarea, y responde exclusivamente en JSON; no se documentan innovaciones arquitectónicas adicionales más allá del ajuste.

## Capacidades

- Generación de JSON estructurado para tres tareas concretas: evaluación de viabilidad del plan (intake), diseño de currículo con habilidades ordenadas y dependencias (curriculum) y clasificación de resultados de búsqueda (rank).
- Evaluación de presupuestos de tiempo: calcula horas totales, determina si el objetivo es realista y emite advertencias en el idioma del usuario.
- Descomposición de temas en habilidades con identificadores en snake_case, horas estimadas, dependencias entre habilidades y consultas de búsqueda.
- Selección de recursos a partir de listas numeradas de candidatos, sin inventar enlaces (solo devuelve índices).
- Capacidad multilingüe limitada a inglés y árabe, incluyendo nombres de habilidades y advertencias en el idioma del alumno.
- Salida conforme a un esquema JSON cuando se pasa como parámetro `format` de Ollama.
- No soporta tool calling general, agentes multi-paso ni otras capacidades fuera de las tres tareas descritas.

## Casos de uso

- Generación de planes de estudio personalizados en local: la aplicación recibe tema, nivel, horas diarias y días, y el modelo produce el intake y el curriculum en JSON; encaja porque toda la lógica de planificación corre en la máquina del usuario sin enviar datos a la nube.
- Aplicaciones educativas offline: universidades o entornos con conectividad limitada pueden desplegar el modelo con Ollama y ofrecer rutas de aprendizaje sin depender de APIs externas.
- Filtrado y clasificación de resultados de búsqueda: la tarea rank permite seleccionar los mejores recursos gratuitos entre candidatos numerados, evitando que el modelo invente URLs y delegando la búsqueda web al código de la aplicación.
- Prototipado rápido de asistentes de aprendizaje: el pipeline de tres pasos con prompts fijos sirve como base para validar productos de planificación educativa antes de escalar a modelos mayores.
- Evaluación de viabilidad de objetivos formativos: la tarea intake detecta presupuestos de tiempo irreales y genera advertencias en el idioma del usuario, útil en plataformas de orientación académica.
- Generación de currículos con dependencias: la estructura de habilidades con `depends_on` permite construir grafos de aprendizaje y secuenciar contenidos en sistemas de e-learning.
- Despliegue en hardware modesto: al caber en 5,0 GB en Q4_K_M, puede ejecutarse en CPU o en GPU de consumo para demos y pruebas internas.

## Benchmarks y rendimiento

Evaluación del autor sobre 130 ejemplos reservados (50 de intake, 50 de curriculum y 30 de rank), con decodificación greedy y sin restricción de esquema, medida sobre el modelo LoRA de 4 bits antes de la exportación a GGUF:

| Tarea | Ejemplos | JSON valido: base → ajustado | Aprobados: base → ajustado |
|---|---|---|---|
| intake | 50 | 100% → 100% | 0% → 100% |
| curriculum | 50 | 100% → 100% | 88% → 96% |
| rank | 30 | 100% → 100% | 0% → 100% |
| Total | 130 | no disponible | 34% → 98,5% |

El 0% del modelo base en intake y rank se atribuye principalmente a nombres de claves JSON incorrectos; al pasar el esquema como `format` de Ollama se corrigen las claves, por lo que en la aplicación la mejora se concentra en las comprobaciones de contenido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,0 GB para el archivo Q4_K_M, más overhead del runtime; el autor indica que funciona en CPU o GPU.
- GPU recomendadas: no se especifican modelos concretos; el entrenamiento se realizó en una T4 de 16 GB, suficiente para el ajuste con QLoRA de 4 bits.
- Cabe en GPU de consumo: sí, con 5,0 GB en Q4_K_M es viable en tarjetas con 6-8 GB de VRAM, aunque el autor no detalla modelos concretos.
- Opciones de despliegue: Ollama (procedimiento documentado con `ollama create` y `Modelfile`); al ser GGUF, también es compatible con llama.cpp y otros runtimes que lean este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LearnPath Gemma 4 E4B (este) | 7.518.069.290 | 8k | Ajuste fino para planificación de estudio en JSON (en/ar) | apache-2.0 | GGUF en HuggingFace |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | Modelo instructivo general | licencia Gemma 4 | HuggingFace |
| Gemma 4 26B-A4B | no disponible | no disponible | Generación de datos sintéticos del ajuste | no disponible | Uso local con llama.cpp según el autor |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría en parámetros, contexto o rendimiento; la información proporcionada solo permite la comparación con el modelo base y con el generador de datos sintéticos.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para los tres prompts documentados; no es un modelo de chat general y su comportamiento con otras indicaciones es menos fiable.
- Las horas estimadas por habilidad pueden desviarse del presupuesto total; la aplicación las reescala, pero el modelo por sí solo no garantiza la suma exacta.
- Solo puede clasificar los resultados de búsqueda que recibe; no realiza búsquedas ni verifica enlaces.
- Idiomas limitados a inglés y árabe; no se documenta soporte para castellano.
- Riesgo de alucinación en contenido fuera de las tareas entrenadas y posible deriva en las claves JSON si no se aplica la restricción de esquema.
- No se documentan sesgos específicos ni evaluaciones de seguridad; al ser un ajuste sintético sobre una base de Google, hereda los sesgos de esta.
- Licencia apache-2.0 según la model card, con enlace a la licencia de Gemma 4 de Google; conviene revisar las condiciones de uso comercial de la licencia base antes de producción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aab20abdullah/learnpath-gemma4-e4b-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
