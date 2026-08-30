# anjadhe/anjadhe-qwen3.5-4b

## Resumen

Anjadhe 4B es un fine-tune LoRA del modelo Qwen/Qwen3.5-4B, desarrollado por el equipo de Anjadhe (anjadhe.ai) como modelo local por defecto para su aplicacion de asistente personal en Macs con 8-16 GB de memoria. El modelo esta especializado en tres tareas concretas: extraer informacion estructurada de correos electronicos, realizar tool-calling contra las APIs de la aplicacion (tareas, objetivos, agenda, notas) y responder preguntas sobre los datos del usuario con respuestas fundamentadas y fechadas.

El entrenamiento se realizo exclusivamente con datos sinteticos generados mediante plantillas y un harness de escenarios que simula el uso real de la aplicacion, con un modelo mayor (Qwen3.6-35B-A3B) como profesor. No se utilizo ningun dato real de usuarios. El modelo incluye deliberadamente ejemplos de prompt-injection en el entrenamiento, con las respuestas de rechazo correctas, dado que un modelo que lee correos procesa texto potencialmente malicioso.

El artefacto distribuido es una cuantizacion GGUF Q4_K_M de aproximadamente 2,6 GB, evaluada en la misma forma cuantizada que se distribuye. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense transformer con atencion lineal hibrida (base Qwen3.5-4B) + adaptadores LoRA |
| Parametros totales | 4B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativa del modelo base) |
| Tipos de cuantizacion | Q4_K_M (GGUF, ~2,6 GB) |
| Idiomas soportados | No disponible (el modelo base Qwen3.5 es multilingue, pero la model card no especifica los idiomas del fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer denso de 4.000 millones de parametros con una arquitectura hibrida que combina atencion lineal con atencion tradicional, disenada para reducir el coste computacional en contextos largos. Es nativamente multimodal (texto, imagen y video) gracias a un encoder de vision integrado, aunque el fine-tune de Anjadhe se centra en tareas de texto.

El entrenamiento del adaptador LoRA se realizo con datos 100% sinteticos: los correos provienen de generadores basados en plantillas, y las conversaciones del asistente se generaron mediante un harness de escenarios que ejecuta la aplicacion real contra datos demo, con Qwen3.6-35B-A3B como modelo profesor. Las etiquetas se sometieron a rejection sampling estricto: se descartaron violaciones de esquema, fechas inventadas (cualquier fecha no presente literalmente en la fuente), elementos de accion inconsistentes y resultados no verificados. No se repararon muestras defectuosas, se eliminaron. Se incluyeron ejemplos de prompt-injection en el corpus con las respuestas de rechazo correctas.

## Capacidades

- Extraccion de informacion estructurada de correos electronicos: identifica elementos de accion, fechas, remitentes y asuntos relevantes, y los convierte en insights estructurados.
- Tool-calling contra APIs de la aplicacion Anjadhe: tareas, objetivos, agenda y notas, con adherencia estricta a los esquemas de las llamadas.
- Respuestas fundamentadas sobre datos del usuario: el modelo responde solo con informacion presente en los datos proporcionados, indicando fechas explicitas y reconociendo cuando no encuentra algo.
- Rechazo de prompt-injection: entrenado para detectar instrucciones embebidas en cuerpos de correo y responder con negativas correctas.
- Comportamiento de chat generico: fuera de los inputs con forma de Anjadhe, se comporta como un Qwen3.5-4B estandar, aunque sin mejoras especificas en tareas generales.
- Capacidades heredadas del modelo base: razonamiento, generacion de codigo y matematicas en la medida que el fine-tune no las degrada, aunque no son el foco del entrenamiento.

## Casos de uso

- Triaje de correo electronico personal: el modelo procesa la bandeja de entrada, extrae elementos de accion, fechas y compromisos, y los convierte en entradas estructuradas para la agenda o el sistema de tareas de la aplicacion. Su entrenamiento especifico en este dominio y su rechazo de prompt-injection lo hacen adecuado para procesar correo no verificado.
- Asistente personal local en Mac: con 2,6 GB en Q4_K_M, cabe en equipos con 8-16 GB de RAM y ejecuta las tareas diarias de la aplicacion Anjadhe sin necesidad de conexion a la nube.
- Gestion de tareas y objetivos por voz o texto: el usuario puede dictar o escribir tareas y el modelo las estructura y las registra via tool-calling en las APIs de la aplicacion, con validacion de esquema.
- Consulta de datos personales con fundamento: el usuario pregunta sobre su propia informacion (reuniones, notas, historial) y el modelo responde solo con datos presentes en el contexto, indicando fechas y admitiendo cuando no encuentra la informacion.
- Automatizacion de agenda: el modelo identifica fechas y horarios en correos o mensajes y los propone como eventos de calendario, descartando fechas que no aparecen explicitamente en la fuente.
- Prototipado de agentes locales con tool-calling: desarrolladores pueden usar este modelo como referencia de un fine-tune LoRA orientado a tool-calling en un dominio especifico, con datos sinteticos y rejection sampling, para replicar el pipeline en otros ambitos.

## Benchmarks y rendimiento

La model card publica una tabla de evaluacion propia, realizada a temperatura 0 mediante llama.cpp sobre el artefacto cuantizado (la forma exacta que se distribuye). Los valores de referencia son el modelo base sin ajustar a la misma cuantizacion:

| Prueba | Qwen3.5-4B base | Anjadhe 4B |
|---|---|---|
| Anjadhe insight eval v1 (17 fixtures de regresion) | 17/17 | 17/17 |
| Anjadhe insight eval v2 (11 fixtures de limites) | 8/11 | 11/11 |
| Agent tool-calling journeys (8) | 7/8 | 7/8 |
| Task-filing floor check | 3/3 | 3/3 |
| General-ability probe (det / juzgado) | 9/14 · 12/12 | 11/14 · 12/12 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La tabla refleja el adaptador v1; el autor indica que se actualizara con los numeros de la version final antes del lanzamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6 GB para el artefacto Q4_K_M, mas overhead de contexto. Con 262.144 tokens de contexto nativo, el uso de memoria crece significativamente con la longitud de la ventana.
- GPU recomendadas: el modelo esta disenado para Macs con 8-16 GB de memoria unificada, por lo que cualquier Apple Silicon con esa configuracion es el objetivo principal. En PC, una GPU con 4-6 GB de VRAM (RTX 3050, RTX 4060, GTX 1660 Super) es suficiente para inferencia en Q4.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM, y tambien en CPU pura via llama.cpp.
- Opciones de despliegue: llama.cpp (usado en la evaluacion oficial), Ollama, LM Studio y cualquier runtime compatible con GGUF. Para despliegue en servidor con mayor throughput, vLLM puede cargar el modelo base con el adaptador LoRA, aunque la model card no documenta esta via.
- Latencia y throughput: no disponible en la informacion proporcionada. El autor indica que el modelo esta optimizado para velocidad a 4B, pero no publica cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Anjadhe 4B | 4B | 262.144 | Apache 2.0 | GGUF | Fine-tune LoRA para asistente personal y tool-calling |
| Qwen3.5-4B (base) | 4B | 262.144 | Apache 2.0 | Safetensors, GGUF | Modelo general multimodal |
| Qwen3.5-9B | 9B | 262.144 | Apache 2.0 | Safetensors, GGUF | Modelo general de mayor capacidad |

La comparativa directa con el base Qwen3.5-4B es la mas relevante: el fine-tune mejora los resultados en las tareas de Anjadhe (insight eval v2 pasa de 8/11 a 11/11, y la sonda general de determinismo sube de 9/14 a 11/14) sin degradar las tareas de tool-calling. Frente a Qwen3.5-9B, el modelo de 4B es mas rapido y ligero, pero el autor reconoce que las generaciones estructuradas complejas y el razonamiento abierto profundo se resuelven mejor con modelos mayores, que Anjadhe ofrece como opciones opt-in.

## Limitaciones y advertencias

- No es un modelo generalista: esta acoplado a los prompts de produccion de Anjadhe. Sus mejoras se concentran en inputs con forma de Anjadhe; en chat generico se comporta como un Qwen3.5-4B estandar sin ventajas adicionales.
- Generaciones estructuradas complejas: las salidas largas y estructuradas, asi como el razonamiento abierto profundo, quedan mejor servidas por modelos locales mayores o servicios alojados.
- Riesgo de alucinacion: aunque el entrenamiento penaliza fechas inventadas, el modelo puede alucinar en tareas fuera de su dominio de especializacion, como cualquier modelo de 4B.
- Datos de entrenamiento sinteticos: al no usar datos reales de usuarios, puede haber desviaciones respecto a la distribucion real de correos y conversaciones personales.
- Evaluacion limitada: los benchmarks publicados son propios del autor y cubren un conjunto reducido de fixtures (17 + 11 + 8 + 3). No hay resultados de benchmarks estandar independientes.
- La tabla de evaluacion corresponde al adaptador v1; el autor indica que se actualizara con los numeros de la version final antes del lanzamiento.
- Idiomas soportados no documentados: la model card no especifica en que idiomas funciona correctamente el fine-tune, aunque el base es multilingue.
- Descargas y adopcion: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un lanzamiento reciente o en fase de validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anjadhe/anjadhe-qwen3.5-4b
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Aplicacion Anjadhe: https://anjadhe.ai
- Guia de Qwen3.5-4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Guia local de Qwen3.5-4B: https://theaibench.ai/models/qwen-3-5-4b/
- Guia completa de la familia Qwen 3.5: https://qwen-ai.com/qwen-3-5/
