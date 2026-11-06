# mstrasser/jeff-adapter-task-complete

## Resumen

jeff-adapter-task-complete es un adaptador LoRA para el modelo de decisión jeff-base v1.4, un fine-tune de Qwen3.5-0.8B desarrollado por mstrasser. El adaptador resuelve un problema concreto en el ámbito de los agentes: verificar si un agente ha completado realmente la tarea que el usuario le solicitó, comparando la petición original con las llamadas a herramientas, sus resultados y la respuesta final del agente. La salida no es texto generado, sino una distribución de probabilidad calibrada sobre tres etiquetas (complete, incomplete, unclear) obtenida en un único forward pass.

El adaptador se presenta como una pieza de infraestructura para sistemas de agentes en producción, donde la verificación automática del trabajo realizado es crítica antes de mostrar una respuesta al usuario o cerrar una tarea. Su enfoque en calibración (con un umbral de confianza de 0,850 y una precisión reportada del 100% sobre las respuestas confiadas) lo diferencia de aproximaciones basadas en LLM-as-a-judge, que requieren generación de texto y parseo posterior.

El modelo base es un fine-tune de Qwen3.5-0.8B, lo que sitúa al conjunto en la categoría de modelos pequeños orientados a decisiones estructuradas. El adaptador se publica bajo licencia Apache 2.0 y solo es compatible con la revisión v1.4 de jeff-base, ya que el motor rechaza adaptadores entrenados sobre otras bases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre jeff-base v1.4 (fine-tune de Qwen3.5-0.8B); el adaptador en sí es PEFT/LoRA |
| Parametros totales | no disponible (el adaptador LoRA no declara su número de parámetros; el base es de 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) entrenado sobre jeff-base v1.4, un modelo de decisión pequeño derivado de Qwen3.5-0.8B. La tarea se formula como clasificación de opciones múltiples: el modelo recibe un contexto estructurado (aplicación, fecha, petición del usuario y transcripción de llamadas a herramientas) junto con la respuesta final del agente, y devuelve una probabilidad calibrada para cada una de las tres etiquetas (complete, incomplete, unclear) en un único forward pass, sin generación de texto.

El adaptador fue entrenado el 25 de octubre de 2026. La model card reporta dos pruebas internas generadas por el mismo generador que los datos de entrenamiento, con una precisión del 99,7% en 2.000 filas y del 99,7% en una segunda prueba de casos no vistos (número de filas no registrado). La calibración se evaluó sobre 2.000 filas, con un umbral de confianza de 0,850, precisión del 100,0% y cobertura del 100,0%. No se detalla la composición del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Clasificación de finalización de tareas de agentes en tres categorías: complete, incomplete y unclear.
- Verificación de cada parte de la petición del usuario contra las llamadas a herramientas y sus resultados (registros, fechas, importes, personas).
- Detección de respuestas finales que afirman más de lo realmente ejecutado ("el agente puede afirmar más de lo hecho; juzga las llamadas y los resultados en sí").
- Detección de resultados ausentes, truncados, en estado "recibido/encolado" o con estado desconocido, que se clasifican como unclear.
- Salida de probabilidad calibrada por opción en un solo forward pass, sin texto generado que parsear.
- Soporte de contexto estructurado con campos obligatorios: app, today, request, transcript y final_answer.
- Idioma: únicamente inglés.

## Casos de uso

- Verificación previa a la respuesta al usuario: antes de mostrar la respuesta final de un agente, el adaptador clasifica si la tarea está completa; si la etiqueta es incomplete o unclear, el sistema puede bloquear la respuesta o solicitar revisión humana.
- Cierre automático de tickets de soporte: en un asistente que gestiona incidencias con herramientas (consultas a base de datos, envíos de correo), el adaptador comprueba que cada parte de la petición se ejecutó con los detalles correctos antes de marcar el ticket como resuelto.
- Control de calidad en pipelines de agentes: integrado como paso de validación en un orquestador, filtra las ejecuciones donde el agente afirma haber hecho algo que no consta en la transcripción de llamadas.
- Detección de acciones parciales: en tareas con múltiples ítems (por ejemplo, enviar facturas a varios clientes), identifica si se procesaron menos ítems de los solicitados y clasifica como incomplete.
- Gestión de estados inciertos: cuando una herramienta devuelve "solicitud recibida" o "en cola" sin confirmación de éxito, el adaptador emite unclear y evita falsos positivos de completitud.
- Auditoría de trazas de agentes: procesamiento por lotes de transcripciones históricas para medir la tasa real de finalización y detectar patrones de respuestas que exageran el trabajo realizado.
- Enrutamiento a revisión humana: usar la probabilidad calibrada con umbral 0,850 para derivar solo los casos de baja confianza a un operador, manteniendo alta precisión en la automatización.

## Benchmarks y rendimiento

| Prueba | Filas | Precisión |
|---|---:|---:|
| Prueba interna (generador) | 2.000 | 99,7% |
| Segunda prueba interna de casos no vistos (generador) | no registrado | 99,7% |

Calibración (conjunto de calibración de 2.000 filas):

| Función | Umbral | Precisión | Cobertura |
|---|---:|---:|---:|
| `complete` | 0,850 | 100,0% | 100,0% |

La model card advierte que las pruebas de tipo "generator" proceden del mismo generador que los datos de entrenamiento y miden menos que una prueba pública o con documentos reales. No se han publicado resultados en benchmarks públicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un base de 0,8B parámetros, la inferencia completa debería caber holgadamente en GPUs de consumo, pero no se publican cifras concretas.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo base (0,8B), aunque no se confirma en la model card.
- Opciones de despliegue: el adaptador se usa a través del motor y SDK propios de Jeff (`jeff.Jeff.local(["task-complete"])`), que descarga el adaptador y la base desde Hugging Face la primera vez. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks públicos ni de comparaciones directas con otros modelos en la información proporcionada. Como referencia estructural, el adaptador se apoya en jeff-base v1.4 (fine-tune de Qwen3.5-0.8B) y se posiciona frente a enfoques de verificación basados en LLM-as-a-judge, que requieren generación de texto y parseo, mientras que este adaptador devuelve probabilidades calibradas en un único forward pass. No se dispone de cifras comparativas de parámetros, contexto o rendimiento frente a alternativas concretas.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado para otros idiomas.
- El adaptador solo carga sobre la revisión v1.4 de jeff-base; el motor rechaza adaptadores entrenados sobre otras bases.
- Las métricas reportadas (99,7% de precisión) proceden de pruebas internas generadas por el mismo generador que los datos de entrenamiento, lo que puede sobreestimar el rendimiento en casos reales.
- No realiza el trabajo restante: solo evalúa la finalización; no corrige ni completa tareas.
- Riesgo de alucinación no documentado explícitamente, pero al ser un modelo de decisión con salida de probabilidades, el riesgo se traslada a clasificaciones erróneas en casos límite.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se detallan condiciones adicionales del ecosistema Jeff (motor y SDK) que puedan afectar al despliegue.
- Dependencia del ecosistema Jeff: el uso requiere el SDK y el motor propios, con instalación desde GitHub hasta que los paquetes estén en PyPI.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-task-complete
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Página del catálogo: https://jeffhub.ai/catalogue/jeff.agents.task-complete
- Código, servidor y SDK: https://github.com/firelex/jeff
- Guía de instalación del SDK: https://jeffhub.ai/docs/sdk/install
