# AnShi-HW/tool-call-anomaly-mmbert-base-v1

## Resumen

El modelo `AnShi-HW/tool-call-anomaly-mmbert-base-v1` es un clasificador binario diseñado para detectar llamadas a herramientas (tool calls) inseguras, no autorizadas o que se desvían de la tarea en sesiones de agentes autónomos. Desarrollado por AnShi-HW, el modelo toma como entrada una serialización de la sesión completa —la tarea del usuario más la secuencia de tool calls realizadas por el agente— y devuelve la probabilidad de que la sesión contenga una anomalía. Está construido sobre `jhu-clsp/mmBERT-base`, un encoder multilingüe moderno entrenado en 3 billones de tokens en más de 1800 idiomas, al que se añade una cabeza de clasificación de secuencia.

Con 307,5 millones de parámetros y una ventana de contexto de 1024 tokens, este modelo aborda un problema crítico en la seguridad de agentes: la detección de comportamientos maliciosos o erráticos en tiempo de ejecución. Su relevancia actual radica en el auge de los agentes autónomos que ejecutan acciones sobre APIs y herramientas, donde una llamada no autorizada puede tener consecuencias graves. El modelo se complementa con una versión más pequeña (`mmbert-small`) y un script de evaluación incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (mmBERT-base) con cabeza de clasificación de secuencia |
| Parametros totales | 307.531.778 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (truncamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/FP16) |
| Idiomas soportados | no disponible (el modelo base mmBERT soporta 1833 idiomas, pero el clasificador no especifica restricciones) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-base`, un encoder moderno que emplea *annealed language learning* (ALL), una técnica de entrenamiento que combina datos de alta y baja frecuencia de forma progresiva para mejorar el rendimiento en lenguas de pocos recursos. Sobre este encoder se añade una cabeza de clasificación de secuencia (sequence classification head) que procesa la representación del token `[CLS]` para producir una probabilidad binaria.

El entrenamiento se realizó durante 4 épocas con una tasa de aprendizaje de 2e-5, batch de 8, warmup del 10% y semilla 42. Los datos provienen de tres fuentes de ataques (stepshield, harm_actions, agent_trust) y siete corpus benignos de tool calls, totalizando 227.157 sesiones benignas y solo 1.102 sesiones de ataque. Para manejar este fuerte desequilibrio, se empleó una pérdida de cross-entropy ponderada por clase combinada con una pérdida suave (alpha 3.0) que alinea las puntuaciones del modelo con las de Qwen2.5-7B-Instruct en un subconjunto de 49.000 filas benignas y todos los ataques, excluyendo stepshield del término suave. Esta técnica de destilación permite transferir conocimiento de un LLM grande a un encoder compacto.

## Capacidades

- Clasificación binaria de sesiones completas de agente: recibe la tarea del usuario y la secuencia de tool calls serializada como una cadena de texto.
- Detección de llamadas inseguras, no autorizadas o que se desvían de la tarea original.
- Serialización de argumentos JSON truncados a 200 caracteres por llamada, con truncamiento global a 1024 tokens.
- Hereda capacidades multilingües del modelo base mmBERT, aunque no se especifica el comportamiento del clasificador en distintos idiomas.
- No realiza tool calling ni generación de texto; es exclusivamente un clasificador de seguridad.
- Incluye un script `score_sessions.py` que serializa sesiones y evalúa el modelo con métricas como recall, FPR y AUROC.

## Casos de uso

- Monitorización en tiempo real de agentes en producción: el modelo puede analizar cada sesión antes de ejecutar acciones, bloqueando aquellas con alta probabilidad de anomalía. Su baja latencia (encoder de 307M parámetros) permite integrarlo en pipelines de inferencia síncrona.
- Auditoría forense de logs: aplicado sobre registros históricos de sesiones, permite identificar incidentes de seguridad pasados y patrones de abuso.
- Filtrado de sesiones sospechosas en sistemas multi-agente: cuando varios agentes colaboran, el clasificador puede priorizar la revisión humana de las sesiones más arriesgadas.
- Evaluación de seguridad de agentes en benchmarks: el modelo se ha probado en conjuntos como stepshield, agentdojo y agentdyn, y puede usarse como métrica automática para medir la robustez de nuevos agentes frente a inyecciones de prompt.
- Control de acceso en plataformas de automatización: integrado en sistemas como Zapier o n8n, puede rechazar flujos de trabajo que intenten llamadas a herramientas no permitidas.
- Detección de prompt injection en aplicaciones de RAG o asistentes: al analizar la secuencia de llamadas, identifica intentos de manipulación del agente mediante instrucciones maliciosas incrustadas en los argumentos.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación en el umbral recomendado de 0.4967, sobre conjuntos vistos y no vistos durante el entrenamiento. La tabla resume AUROC, recall y tasa de falsos positivos (FPR) por fuente:

| Fuente | Visto en entrenamiento | Benignas | Ataques | AUROC | Recall | FPR |
|---|---|---|---|---|---|---|
| harm_actions | sí | 23 | 32 | 0.988 | 0.875 | 0.043 |
| agent_trust | sí | 44 | 52 | 0.902 | 0.885 | 0.341 |
| stepshield | sí | 2.562 | 108 | 0.839 | 0.731 | 0.233 |
| agentdyn | no | 9.806 | 1.310 | 0.829 | 0.646 | 0.192 |
| agentdojo | no | 6.413 | 1.217 | 0.715 | 0.100 | 0.040 |
| bfcl (solo benignas) | no | 7.927 | 0 | — | — | 0.048 |
| injecagent (solo benignas) | no | 1.054 | 0 | — | — | 0.000 |

Las filas de fuentes vistas son disjuntas de las de entrenamiento. Se observa un rendimiento sólido en harm_actions y agent_trust, pero una FPR elevada en agent_trust y stepshield, y un recall muy bajo en agentdojo, que contiene ataques de inyección de prompt ausentes en el entrenamiento. No se han publicado comparaciones con otros detectores de anomalías en tool calls.

## Requisitos de hardware

- VRAM estimada: con 307,5M parámetros, en FP16 ocupa aproximadamente 615 MB; en int8, unos 307 MB. Cabe holgadamente en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 o RTX 4090.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia en lote pequeño. Para entrenamiento o fine-tuning, se recomienda una GPU con 8-12 GB (p. ej., RTX 3080, A10).
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con Hugging Face Inference Endpoints, ONNX Runtime, o mediante frameworks como FastAPI. No se menciona soporte para vLLM, llama.cpp u Ollama, dado que es un encoder pequeño y no un LLM generativo.
- Latencia y throughput: no disponible en la documentación. Como referencia, un encoder de este tamaño procesa cientos de secuencias por segundo en una GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos específicos de detección de anomalías en tool calls. El propio autor menciona una versión reducida, `AnShi-HW/tool-call-anomaly-mmbert-small-v1`, pero no se publican sus especificaciones ni resultados comparativos. Frente al modelo base mmBERT, este clasificador añade una cabeza de clasificación y un entrenamiento específico, pero no es comparable en tareas generativas. Por tanto, la comparativa directa queda pendiente de datos públicos.

## Limitaciones y advertencias

- Alta tasa de falsos positivos en tráfico benigno de agent_trust (34,1%) y stepshield (23,3%), lo que puede generar alertas excesivas en entornos reales.
- Bajo recall en agentdojo (10%), que contiene ataques de inyección de prompt no vistos en entrenamiento; el modelo no generaliza bien a familias de ataques nuevas.
- El umbral recomendado (0.4967) se calibró sobre un conjunto benigno específico (bfcl); cada despliegue debe ajustar su propio umbral sobre una muestra benigna representativa.
- La licencia no está especificada, lo que introduce incertidumbre legal para uso comercial o redistribución.
- El desequilibrio extremo en los datos de entrenamiento (1.102 ataques frente a 227.157 benignas) puede sesgar el modelo hacia la clase mayoritaria, aunque la pérdida ponderada mitiga parcialmente este efecto.
- La ventana de contexto de 1024 tokens limita el análisis de sesiones muy largas; las llamadas se truncan a 200 caracteres de argumentos, perdiendo potencialmente información relevante.
- No se han documentado sesgos lingüísticos o culturales específicos, pero al ser un modelo multilingüe, el rendimiento puede variar según el idioma de la tarea y las llamadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnShi-HW/tool-call-anomaly-mmbert-base-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/AnShi-HW/tool-call-anomaly-data
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- Paper de mmBERT: https://arxiv.org/abs/2509.06888
- Repositorio GitHub de mmBERT: https://github.com/JHU-CLSP/mmBERT/
