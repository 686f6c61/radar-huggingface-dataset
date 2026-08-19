# Allenda/Qwen2.5-7B-Instruct-cognify-BreaK

## Resumen

`Allenda/Qwen2.5-7B-Instruct-cognify-BreaK` es un ajuste fino del modelo `Qwen/Qwen2.5-7B-Instruct` desarrollado por el equipo BreaK para el CognifyChallenge 2026. Su propósito es específico: dado un registro de paciente sintético, el veredicto de un clasificador de demencia y sus cinco atribuciones SHAP principales, el modelo debe generar una nota clínica breve que explique el razonamiento del clasificador, junto con una lista estructurada de los factores (drivers) en los que se apoya dicha nota.

El modelo se entrenó con 450 ejemplos del split de práctica del propio challenge, cuyas salidas fueron generadas por un programa determinista que replica la función de puntuación de la competición. No se trata de un modelo entrenado para diagnosticar, sino de una destilación de un proceso programático en un modelo de lenguaje. Está pensado exclusivamente para su uso en el formato de prompt del harness de la competición y sobre datos sintéticos. Con 7,6 mil millones de parámetros, hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, aunque no se especifican detalles adicionales sobre el contexto o las capacidades multilingües en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-7B-Instruct soporta 128K tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se especifica para este ajuste) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only con 7,6 mil millones de parámetros y atención causal estándar. El ajuste fino se realizó sobre 450 ejemplos del split de práctica del CognifyChallenge 2026 (`cohort_dev.json`). Cada ejemplo consiste en un registro de paciente sintético, el veredicto de un clasificador de demencia y sus cinco atribuciones SHAP, junto con un JSON de campos citables. Las salidas objetivo no fueron escritas por humanos, sino generadas por un programa determinista que ensambla la nota clínica según la lógica de puntuación de la competición: incluye el veredicto y la banda de confianza con la redacción del banco de preguntas, las cinco atribuciones en orden de rango con la dirección de cada una, valores citados solo cuando el registro los respalda, y los hallazgos presentes y ausentes por eliminación.

No se dispone de información sobre hiperparámetros de entrenamiento, número de épocas, tasa de aprendizaje o técnicas de regularización. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación. El proceso se describe como "destilación de un programa en un modelo", no como un entrenamiento médico.

## Capacidades

- Generacion de notas clinicas explicativas: dado un registro de paciente sintetico, el veredicto de un clasificador y sus atribuciones SHAP, produce una nota breve en lenguaje natural que explica el razonamiento del clasificador.
- Generacion de listas estructuradas de drivers: devuelve un objeto JSON con los campos `note` y `drivers`, donde `drivers` es una lista de los factores que sustentan la nota.
- Adherencia a un formato de prompt especifico: el modelo esta optimizado para el renderizado exacto que produce el harness de la competicion (registro, salida del modelo, atribuciones y JSON de campos citables, seguido de una instruccion corta).
- Razonamiento sobre datos sinteticos: capaz de procesar informacion clinica ficticia y extraer los elementos relevantes para la explicacion.
- No se han medido capacidades fuera de este formato de prompt; el autor indica que el modelo respondera, pero su comportamiento no ha sido evaluado.

## Casos de uso

- Investigacion en explicabilidad de modelos de IA en salud: el modelo puede servir como referencia para estudiar como un LLM traduce atribuciones SHAP en explicaciones textuales coherentes, util para comparar metodos de interpretabilidad.
- Desarrollo de sistemas de interpretacion de clasificadores de demencia: en entornos de investigacion con datos sinteticos, el modelo puede generar notas explicativas que ayuden a validar la logica de un clasificador antes de considerar su uso en entornos reales.
- Generacion de datos de entrenamiento para otros modelos: las salidas del modelo (notas y drivers) podrian usarse como datos sinteticos para entrenar modelos mas pequenos en tareas de explicabilidad.
- Evaluacion de pipelines de NLP clinico: el modelo puede integrarse en un pipeline de prueba para verificar que el formato de prompt y la extraccion de atribuciones funcionan correctamente, sin riesgo de usar datos reales.
- Demostraciones educativas: en cursos de IA aplicada a la salud, el modelo puede ilustrar como se construyen explicaciones automaticas a partir de tecnicas de interpretabilidad, usando casos sinteticos.
- Benchmarking de modelos de lenguaje en tareas estructuradas: dado que el modelo responde con JSON estricto, puede usarse para probar la capacidad de otros LLMs de seguir formatos de salida complejos en un dominio restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta metricas de rendimiento, ni comparaciones con otros modelos. La unica referencia es que el modelo fue disenado para la tarea del CognifyChallenge 2026, pero no se proporcionan puntuaciones obtenidas en la competicion.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16, el modelo requiere aproximadamente 15,2 GB de VRAM (tamano del repositorio). Con cuantizacion a 8 bits, se reduciria a unos 8 GB; a 4 bits, a unos 4-5 GB, aunque no se ofrecen archivos cuantizados en el repositorio.
- GPU recomendadas: para FP16, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L4). Para cuantizacion, una GPU de 8 GB (RTX 3070, RTX 4060) podria ser suficiente.
- Si cabe en consumer GPU: si, con cuantizacion a 4 u 8 bits, modelos como RTX 3090 o RTX 4070 pueden ejecutarlo.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o mediante llama.cpp si se convierte a GGUF. No se proporcionan archivos GGUF ni configuraciones especificas.
- Latencia y throughput: no disponibles. Dependera del hardware y del backend de inferencia.

## Comparativa con modelos similares

Dado que el modelo es un ajuste fino muy especifico, la comparacion mas relevante es con su modelo base y con otros LLMs de tamano similar en tareas de generacion de texto estructurado. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Allenda/Qwen2.5-7B-Instruct-cognify-BreaK | 7,6B | No disponible | Apache 2.0 | Explicabilidad clinica en datos sinteticos |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 128K | Apache 2.0 | Generacion de texto general, instrucciones, codigo |
| Meta-Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Generacion de texto general, instrucciones |

La diferencia principal radica en la especializacion: el modelo de Allenda esta limitado a una tarea y un formato concretos, mientras que los otros son modelos generalistas. No se puede afirmar cual rinde mejor sin datos de benchmarks.

## Limitaciones y advertencias

- No debe usarse con registros de pacientes reales: el autor lo indica explicitamente. Todos los datos de entrenamiento son sinteticos y el modelo no tiene capacidad diagnostica.
- Entrenado para un unico formato de prompt: fuera de ese formato, su comportamiento no ha sido medido y podria producir salidas incoherentes o incorrectas.
- Las salidas son una destilacion de un programa determinista, no un razonamiento medico real. Las notas generadas no reflejan conocimiento clinico genuino.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido plausible pero incorrecto, especialmente si se le presentan datos fuera de su distribucion de entrenamiento.
- Sesgos: al estar entrenado con datos sinteticos generados por un programa, podria replicar sesgos del propio programa o del proceso de generacion de datos.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base es multilingue, pero el ajuste fino se realizo probablemente en ingles (el challenge parece estar en ingles). No se recomienda su uso en otros idiomas sin evaluacion.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el autor advierte que el modelo no esta disenado para produccion y su unico proposito es la tarea del challenge.

## Enlaces

- HuggingFace: https://huggingface.co/Allenda/Qwen2.5-7B-Instruct-cognify-BreaK
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- No se proporcionan otros enlaces (papers, blogs, repos) en la informacion disponible.
