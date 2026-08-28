# patronus-studio/wolf-defender-threat-classifier

## Resumen

Wolf Defender Threat Classifier es un clasificador de texto multilingüe desarrollado por Patronus Studio, especializado en la detección y clasificación de amenazas de seguridad en interacciones con sistemas de IA, como prompts, llamadas a herramientas o pasos de agentes. Forma parte de la pila de seguridad Patronus Protect y actúa como la contraparte de cabeza única del cabezal de amenazas del modelo Lion Warden. Su objetivo principal es identificar el tipo de ataque o comportamiento malicioso en tiempo real para permitir decisiones de bloqueo, enrutamiento o supervisión.

El modelo se basa en la arquitectura ModernBERT, concretamente en el modelo base jhu-clsp/mmBERT-small, un encoder transformer eficiente diseñado para tareas de clasificación. Con aproximadamente 140 millones de parámetros, es un modelo compacto que puede ejecutarse en dispositivos con recursos limitados, lo que lo hace adecuado para su integración como capa de seguridad on-device. Está entrenado para clasificar entradas en siete categorías: override de instrucciones, acceso a secretos, abuso de herramientas, comportamiento dañino, intento de exfiltración, toxicidad y comportamiento benigno.

La relevancia de este modelo radica en el creciente uso de agentes de IA autónomos y asistentes que interactúan con herramientas y datos sensibles. Wolf Defender ofrece una solución de código abierto (licencia Apache 2.0) para proteger estos sistemas contra ataques de prompt injection, fugas de datos y otros vectores de amenaza, con soporte para inferencia eficiente mediante exportaciones ONNX y cuantizaciones para entornos edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (mmBERT-small) |
| Parametros totales | 140.644.231 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP32 (safetensors), FP16 (ONNX), int8, int8_int4_embeddings (variante Edge) |
| Idiomas soportados | Aleman e ingles (evaluados), backbone multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, joblib |

## Arquitectura y entrenamiento

Wolf Defender Threat Classifier es un modelo encoder transformer basado en ModernBERT, concretamente en la variante pequeña mmBERT-small desarrollada por el JHU CLSP. A diferencia de los modelos generativos, este clasificador procesa la secuencia de entrada completa y produce una distribución de probabilidad sobre siete clases de amenaza. La arquitectura ModernBERT incorpora mejoras sobre BERT clásico, como atención eficiente y optimizaciones para secuencias largas, aunque el contexto máximo específico no se ha documentado en la información disponible.

El entrenamiento se realizó sobre un dataset multilingüe propio de Patronus, construido a partir de fuentes reales limpiadas por jueces humanos (sin heurísticas de palabras clave) y ejemplos generados internamente. Para mejorar la robustez, se aplicaron aumentaciones que incluyen variantes Unicode, ataques de homoglifos, codificaciones como base64, envoltorios de etiquetas (User:, System:), etiquetas HTML, comentarios de código, ruido de espaciado, leetspeak y ruido de mayúsculas. Además, se emplearon regularizadores como envoltorios de lenguaje natural, muestras contrafactuales y corpus de palabras desencadenantes para evitar correlaciones espurias. Se realizó una deduplicación con similitud del 90% y una salvaguarda de fuga entre entrenamiento y validación. Todas las aumentaciones se aplicaron tanto a ejemplos positivos como negativos para que el modelo se centre en el contenido más que en la forma superficial.

## Capacidades

- Clasificacion de amenazas en siete categorias: `instruction_override`, `secrets_access`, `tool_abuse`, `harmful_behavior`, `exfiltration_attempt`, `toxic_or_harmful` y `benign`.
- Deteccion de ataques de prompt injection, incluyendo intentos de anular instrucciones del sistema o guardrails.
- Identificacion de intentos de acceso a secretos, claves API, tokens o archivos de entorno.
- Reconocimiento de abuso de herramientas o comandos para acciones destructivas o no autorizadas.
- Deteccion de intentos de exfiltracion de datos mas alla del limite de confianza local.
- Clasificacion de lenguaje toxico, odioso, acosador o abusivo.
- Soporte multilingue basado en el backbone mmBERT, con validacion principal en aleman e ingles.
- Capacidad de inferencia eficiente mediante exportacion ONNX en FP16 y versiones cuantizadas para entornos edge.

## Casos de uso

- Guardrail en agentes de IA autonomos: el modelo puede integrarse en el bucle de ejecucion de un agente para inspeccionar cada prompt o llamada a herramienta antes de que se ejecute, bloqueando acciones maliciosas como intentos de exfiltracion de datos o abuso de herramientas. Su baja latencia permite decisiones en tiempo real.
- Monitorizacion de seguridad en runtime para aplicaciones de IA: se puede desplegar como un servicio de supervision que analiza el trafico de prompts y respuestas en produccion, generando alertas cuando se detecta un intento de ataque. Las siete clases permiten un triage preciso del tipo de amenaza.
- Filtrado de contenido toxico en plataformas de chat o redes sociales: el modelo puede clasificar mensajes de usuarios como `toxic_or_harmful` y activar politicas de moderacion automatica o revision humana. Su naturaleza multilingue (aleman e ingles) lo hace util en entornos internacionales.
- Proteccion de asistentes virtuales empresariales: al integrarse en asistentes que acceden a bases de datos internas, el clasificador puede detectar intentos de `secrets_access` o `exfiltration_attempt` antes de que se ejecuten consultas peligrosas, protegiendo informacion confidencial.
- Auditoria de logs de interacciones con IA: se puede ejecutar de forma offline sobre registros historicos de prompts y respuestas para identificar patrones de ataque, evaluar la eficacia de las defensas existentes y generar informes de seguridad. La clasificacion por tipo de amenaza facilita el analisis forense.
- Enrutamiento de incidentes en centros de operaciones de seguridad (SOC): cuando se detecta una amenaza, el modelo puede asignar automaticamente un nivel de prioridad y un equipo de respuesta segun la clase (por ejemplo, `exfiltration_attempt` como critico, `toxic_or_harmful` como moderado), agilizando la gestion de incidentes.

## Benchmarks y rendimiento

El modelo fue evaluado en un conjunto de prueba retenido (n = 4.078) con etiqueta unica. Los resultados reportados en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Accuracy | 0.960 |
| F1 (macro) | 0.925 |
| Precision (macro) | 0.928 |
| Recall (macro) | 0.922 |

F1 por clase:

| Clase | F1 |
|---|---|
| exfiltration_attempt | 0.988 |
| benign | 0.986 |
| toxic_or_harmful | 0.950 |
| tool_abuse | 0.913 |
| secrets_access | 0.912 |
| instruction_override | 0.890 |
| harmful_behavior | 0.836 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 140 millones de parametros, en FP32 requiere aproximadamente 560 MB de memoria, mientras que en FP16 se reduce a unos 280 MB. Las versiones cuantizadas int8 pueden requerir menos de 150 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3060 o superiores. Tambien puede ejecutarse en CPU con un rendimiento aceptable para inferencia por lotes.
- Compatibilidad con GPU de consumo: si, es perfectamente viable en hardware consumer de gama media y baja.
- Opciones de despliegue: el modelo se puede servir mediante la libreria transformers de Hugging Face, o mediante ONNX Runtime para entornos de produccion. Tambien existen variantes cuantizadas en el repositorio Edge para despliegue en dispositivos con recursos muy limitados.
- Latencia y throughput estimados: no se han publicado cifras oficiales, pero dado el tamano del modelo, se espera una latencia de unos pocos milisegundos por muestra en GPU moderna y decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa directa con modelos equivalentes en la misma categoria. El propio ecosistema de Patronus incluye Lion Warden, que es un clasificador multi-cabeza con capacidades adicionales (deteccion binaria de prompt injection y clasificacion de amenazas), pero no se han publicado datos comparativos entre ambos. Otros detectores de prompt injection comerciales o academicos (como los de Protect AI o Lakera) no han sido evaluados en las mismas condiciones, por lo que no se puede ofrecer una tabla comparativa fiable.

## Limitaciones y advertencias

- Una prediccion positiva describe una propiedad aparente de la entrada, no prueba que la accion se haya ejecutado. El modelo no puede confirmar si un ataque tuvo exito.
- No realiza seguimiento del flujo de informacion a traves de multiples pasos de agente, por lo que puede no detectar ataques distribuidos en varias interacciones.
- Aunque el backbone es multilingue, solo se han validado activamente el aleman y el ingles. Otros idiomas pueden producir resultados menos fiables.
- Existe riesgo de falsos positivos y negativos. Para decisiones de alto impacto, se recomienda combinar el modelo con politicas deterministicas y umbrales calibrados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye tal cual, sin garantias de exactitud o seguridad absoluta.
- El repositorio principal tiene un tamano de 3.4 GB, lo que puede ser excesivo para algunos entornos edge; para esos casos se recomienda usar las variantes cuantizadas del repositorio Edge.

## Enlaces

- [Hugging Face - Wolf Defender Threat Classifier](https://huggingface.co/patronus-studio/wolf-defender-threat-classifier)
- [Blog de Patronus: Today we're releasing our first security model: Wolf Defender](https://patronus.studio/de/posts/today-we%E2%80%99re-releasing-our-first-security-model-wolf-defender)
- [Post: New AI-Security Model: Wolf Defender](https://patronus.studio/posts/new-ai-security-model-wolf-defender)
- [Medium: Our AI-Security Model Zoo Is Now Open Source](https://medium.com/@PatronusProtect/our-ai-security-model-zoo-is-now-open-source-41654d5d7dc6)
- [Wolf Defender Threat Classifier Edge (variantes cuantizadas)](https://huggingface.co/patronus-studio/wolf-defender-threat-classifier-edge)
