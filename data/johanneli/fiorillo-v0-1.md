# johanneli/fiorillo-v0.1

## Resumen

Fiorillo v0.1 es un modelo de decisión tipada de ámbito médico desarrollado por el usuario johanneli. Se trata de un ajuste fino de Laya (convaiinnovations/laya), un modelo de decisión de 421 millones de parámetros construido sobre ModernBERT-large. El modelo responde, en una sola pasada forward, a dos preguntas concretas devolviendo probabilidades calibradas: la respuesta a una pregunta de investigación biomédica a partir de su resumen (PubMedQA, con opciones sí, no o quizá) y el plazo de reingreso hospitalario de un paciente con diabetes (conjunto UCI Diabetes 130-US hospitals, 1999-2008, con opciones sin reingreso, más de 30 días o dentro de 30 días).

Su relevancia radica en que, según la comprobación del propio autor sobre la familia Laya en Hugging Face (27 de septiembre de 2026), sería el primer modelo de decisión tipada de ámbito médico construido sobre Laya con licencia abierta que permite uso comercial. El único otro modelo médico de la familia Laya localizado, Duan (wipen/Duan), está licenciado bajo CC BY-NC 4.0, lo que restringe el uso comercial.

El modelo está pensado exclusivamente para investigación. No es un dispositivo médico y no debe emplearse para tomar decisiones clínicas. Se distribuye bajo licencia Apache 2.0, con pesos de 421.293.830 parámetros y un repositorio de 0,8 GB, lo que lo sitúa en el rango de modelos pequeños desplegables incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large) mediante el framework Laya, modelo de decisión tipada |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo se ejecutó en CPU en la evaluación del autor) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Fiorillo v0.1 parte de Laya, descrito por el autor como un modelo de decisión de 421 millones de parámetros construido sobre ModernBERT-large. ModernBERT es una familia de encoders transformer que incorpora mejoras de eficiencia (atención con soporte de secuencias largas, alternancia de atención local y global, y kernels optimizados). Laya añade sobre esa base un mecanismo de decisión tipada: en lugar de generar texto libre, el modelo emite respuestas clasificadas por tipo (`choice` o `score`) con la probabilidad asociada a cada opción.

El ajuste fino se realizó sobre dos tareas con definiciones fijas, literalmente especificadas y evaluadas con esas mismas definiciones. Para PubMedQA se emplearon la pregunta y las secciones del resumen en su orden original, excluyendo la conclusión (`long_answer`), de modo que el modelo debe inferir la respuesta a partir de los apartados previos. Para la predicción de reingreso se usó el conjunto UCI Diabetes 130-US hospitals (1999-2008) con campos categóricos y numéricos concretos (bandas de edad, tipo de admisión, diagnósticos codificados, resultados de A1C, medicación, etc.). No se documenta en la información disponible el uso de RLHF ni DPO; se trata de un ajuste supervisado sobre tareas cerradas.

Una innovación operativa destacable es el mecanismo de calibración: los pesos se distribuyen con todas las temperaturas fijadas a 1, de modo que Laya devuelve probabilidades sin calibrar hasta que se aplican las temperaturas almacenadas en `calibration.json`. En laya 0.3.20 la temperatura se selecciona por tipo de pregunta y número de opciones, por lo que estos dos ajustes (`choice:3-5` y `score:3-5`) calibran cualquier pregunta de elección o de puntuación con entre 3 y 5 opciones, aunque solo las dos tareas descritas fueron calibradas y probadas.

## Capacidades

- Clasificación de decisión tipada en una sola pasada forward, con probabilidad explícita para cada opción.
- Respuesta a preguntas de investigación biomédica tipo PubMedQA (sí, no, quizá) a partir del resumen sin su conclusión.
- Predicción del plazo de reingreso hospitalario en tres niveles (sin reingreso, más de 30 días, dentro de 30 días) a partir de datos tabulares de encuentros clínicos del conjunto UCI Diabetes 130-US hospitals.
- Salida de probabilidades calibradas una vez aplicadas las temperaturas de `calibration.json`.
- Dos tipos de tarea soportados por el framework: `choice` (elección entre opciones con criterios textuales) y `score` (puntuación por niveles).
- Capacidad de ejecución en CPU, según la propia evaluación del autor.
- No se documentan capacidades de generación de texto libre, razonamiento abierto, código, matemáticas, visión, audio, tool calling, function calling, uso como agente ni modo de pensamiento (thinking mode). El modelo no es un chat ni un generador conversacional.

## Casos de uso

- Extracción estructurada de conclusiones en revisión sistemática: dado el texto de un resumen biomédico sin su conclusión, el modelo devuelve la respuesta (sí, no, quizá) con probabilidad asociada, útil para triaje automático de literatura antes de la lectura manual.
- Apoyo a la investigación en epidemiología de reingresos: clasificar cohortes de pacientes diabéticos en tres ventanas de reingreso (ninguno, más de 30 días, dentro de 30 días) a partir de campos tabulares compatibles con el esquema UCI, para estudiar factores de riesgo a escala poblacional.
- Etiquetado asistido de datos clínicos anonimizados: generar etiquetas probabilísticas sobre registros estructurados que después un equipo humano revisa, aprovechando la salida calibrada para priorizar los casos de alta incertidumbre.
- Filtro previo en pipelines de cribado documental biomédico: descartar o priorizar resúmenes según la respuesta inferida, reduciendo el volumen que llega a revisores humanos.
- Componente de calibración en investigación sobre incertidumbre: al exponer probabilidades calibradas con temperaturas ajustadas, sirve como caso de estudio de calibración (ECE, AUROC) en modelos de decisión médicos.
- Pruebas de reproducibilidad y auditoría de modelos de decisión tipada: al ser un modelo pequeño desplegable en CPU, permite reproducir sus salidas y verificar la aplicación de la calibración en entornos sin GPU.
- Investigación sobre gobernanza de licencias en IA médica: su condición de primer modelo médico de la familia Laya con licencia que permite uso comercial lo convierte en objeto de análisis comparativo frente a alternativas no comerciales como Duan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona el uso de métricas como ECE (expected calibration error, sobre la respuesta principal con 15 bins de igual anchura) y AUROC (área bajo la curva ROC), pero no se incluyen valores concretos. El único dato de rendimiento reportado es cualitativo: ejecutando el código de ejemplo en CPU, el modelo reprodujo sus probabilidades de evaluación con un margen de 0,001 en los seis elementos de prueba que el autor comprobó.

## Requisitos de hardware

- El modelo tiene 421,3 millones de parámetros y un repositorio de 0,8 GB, por lo que cabe holgadamente en cualquier GPU de consumo actual.
- En `float16`, los pesos ocupan aproximadamente 0,85 GB; en `float32`, alrededor de 1,7 GB.
- VRAM estimada para inferencia: por debajo de 2 GB en precisión completa y del orden de 1 GB o menos en media precisión, sin contar activaciones (que son reducidas por tratarse de un encoder y secuencias tipo resumen).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente (por ejemplo, RTX 3050, RTX 4060, RTX 4090). También tarjetas de datacenter como A100 o H100, aunque resultan sobredimensionadas para este tamaño.
- Cabe en GPU de consumo y se ha verificado su ejecución en CPU por parte del autor.
- Opciones de despliegue: el modelo se carga mediante la librería `laya` (versión 0.3.20, `pip install laya==0.3.20`) y los pesos se sirven desde Hugging Face con `hf_hub_download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al tratarse de un encoder de 421 M ejecutado en CPU, la latencia esperada es del orden de decenas o centenas de milisegundos por elemento, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fiorillo v0.1 (johanneli) | 421,3 M | no disponible | Decisión tipada médica (PubMedQA y reingreso UCI) | apache-2.0 (permite uso comercial) | Hugging Face |
| Duan (wipen/Duan) | no disponible | no disponible | Modelo médico de la familia Laya | CC BY-NC 4.0 (no comercial) | Hugging Face |
| Laya (convaiinnovations/laya) | 421 M (según la model card) | no disponible | Modelo de decisión base (no específicamente médico) | no disponible en la información proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está destinado exclusivamente a investigación. No es un dispositivo médico y no debe utilizarse para tomar decisiones clínicas.
- Solo fue entrenado y evaluado sobre dos preguntas con definiciones literales; cualquier otra pregunta queda fuera de lo probado.
- Aunque las temperaturas de calibración `choice:3-5` y `score:3-5` son genéricas por tipo y número de opciones, solo se calibraron y probaron las dos tareas descritas.
- Los pesos se distribuyen con temperatura 1; si no se aplica `calibration.json`, las probabilidades devueltas no están calibradas.
- Riesgo de alucinación o de inferencia errónea: al operar sobre resúmenes sin su conclusión, el modelo puede producir respuestas plausibles pero incorrectas; no se documentan tasas de error.
- Sesgos conocidos: no documentados explícitamente. Los datos de reingreso proceden de hospitales estadounidenses entre 1999 y 2008, por lo que pueden reflejar sesgos históricos, demográficos y geográficos de esa población, no extrapolables a otros contextos sanitarios.
- Limitación de idioma: únicamente inglés (`en`).
- Limitaciones de contexto: la longitud de contexto no está especificada en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la advertencia de uso exclusivamente investigador y la naturaleza médica de los datos de entrenamiento exigen evaluación legal y ética antes de cualquier despliegue en producción.
- Sin datos de benchmarks publicados: la ausencia de métricas de rendimiento (MMLU, HumanEval, GSM8K u otras) impide una comparación cuantitativa con alternativas.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/johanneli/fiorillo-v0.1
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Modelo comparable Duan: https://huggingface.co/wipen/Duan
- Dataset PubMedQA: https://huggingface.co/datasets/qiaojin/PubMedQA
- DOI de la ficha: https://doi.org/10.57967/hf/10639
