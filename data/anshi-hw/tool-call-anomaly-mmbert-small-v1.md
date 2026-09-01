# AnShi-HW/tool-call-anomaly-mmbert-small-v1

## Resumen

El modelo `AnShi-HW/tool-call-anomaly-mmbert-small-v1` es un clasificador binario diseñado para detectar llamadas a herramientas anómalas, no autorizadas o desviadas de la tarea dentro de sesiones de agentes. Desarrollado por AnShi-HW, el modelo toma como entrada una sesión serializada (la tarea del usuario más la secuencia de llamadas a herramientas realizadas por el agente) y devuelve la probabilidad de que la sesión contenga una llamada insegura. Está construido como un fine-tune de `jhu-clsp/mmBERT-small`, un encoder multilingüe moderno entrenado sobre 3 billones de tokens en más de 1800 idiomas mediante annealed language learning.

El modelo tiene 140,6 millones de parámetros y una ventana de contexto de 1024 tokens. Su relevancia actual radica en la creciente adopción de agentes autónomos que invocan herramientas externas, donde la supervisión de la seguridad de dichas llamadas se vuelve crítica. El modelo se entrena con una combinación de pérdida de entropía cruzada ponderada por clase y una pérdida suave que alinea sus puntuaciones con las de un modelo de instrucción de 7B (Qwen2.5-7B-Instruct), lo que mejora la calibración en datos benignos. Aunque el repositorio no especifica la licencia, los pesos están disponibles en formato safetensors y el modelo se distribuye a través de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (modernBERT) con cabeza de clasificacion de secuencias |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 1024 tokens (max length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base mmBERT es multilingue, 1833 idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `jhu-clsp/mmBERT-small`, un encoder transformer moderno (basado en la arquitectura modernBERT) preentrenado con annealed language learning sobre 3T tokens en más de 1800 idiomas. La cabeza de clasificación es una capa de clasificación de secuencias binaria (seguro/anómalo). El entrenamiento se realizó durante 4 épocas con una tasa de aprendizaje de 2e-5, batch de 16, warmup de 0.1 y semilla 42, sobre una longitud máxima de 1024 tokens.

Los datos de entrenamiento combinan 227.157 sesiones benignas y 1.102 sesiones de ataque procedentes de fuentes como stepshield, harm_actions y agent_trust, junto con siete corpus benignos de llamadas a herramientas (agent_align, funcdex_mt, glaive_fc_v2, apigen_mt, toolace, hermes_fc, toolmind_toolace_query). La función de pérdida es una entropía cruzada ponderada por clase sobre etiquetas duras, más un término suave (alpha 3.0) que iguala las puntuaciones del modelo con las de Qwen2.5-7B-Instruct en una muestra benigna de 49.000 filas y todos los ataques, excluyendo las filas de stepshield del término suave. Esta combinación busca mejorar la calibración y reducir falsos positivos en tráfico benigno.

## Capacidades

- Clasificacion binaria de sesiones de agentes: detecta si una secuencia de llamadas a herramientas contiene una llamada insegura, no autorizada o desviada de la tarea.
- Serializacion de sesiones: el repositorio incluye el script `score_sessions.py` que convierte una tarea y una lista de llamadas a herramientas en el formato de entrada esperado (con argumentos JSON truncados a 200 caracteres por llamada y truncamiento total a 1024 tokens).
- Evaluacion con umbral configurable: permite fijar un umbral de decisión (recomendado 0.5299) y reporta recall, tasa de falsos positivos y AUROC por fuente de datos.
- Compatibilidad con el ecosistema Hugging Face: se puede cargar con `transformers` para inferencia estándar de clasificación de texto.
- Multilingüismo heredado: al estar basado en mmBERT, el encoder subyacente soporta potencialmente cientos de idiomas, aunque el fine-tune no documenta explícitamente los idiomas de entrenamiento.

## Casos de uso

- Monitorizacion de seguridad en agentes autonomos: el modelo puede integrarse en un pipeline de ejecución de agentes para puntuar cada sesión en tiempo real y alertar cuando la probabilidad de anomalía supere el umbral, permitiendo intervenir antes de que se complete una acción no autorizada.
- Auditoria de logs de sesiones: aplicable a sistemas que registran interacciones de agentes con herramientas; el modelo clasifica sesiones históricas para identificar incidentes de seguridad o desviaciones de tarea.
- Filtrado de datos de entrenamiento: en la construcción de datasets para fine-tuning de agentes, el modelo puede descartar sesiones con llamadas anómalas, mejorando la calidad de los datos de entrenamiento.
- Evaluacion de frameworks de agentes: útil para comparar la seguridad de distintos frameworks o configuraciones de agentes midiendo la tasa de llamadas anómalas detectadas en sus trazas.
- Deteccion de inyeccion de prompts: aunque su recall es bajo en el conjunto agentdojo (especializado en inyección de prompts), el modelo puede complementar otros mecanismos de defensa en entornos donde este tipo de ataque es frecuente.
- Control de acceso en entornos empresariales: en despliegues donde los agentes acceden a APIs internas, el modelo puede actuar como una capa de validación previa a la ejecución de la llamada, reduciendo el riesgo de acciones no autorizadas.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación en el umbral recomendado de 0.5299, sobre conjuntos de datos vistos y no vistos durante el entrenamiento. La tabla siguiente resume los resultados reportados en la model card:

| Fuente | Visto en entrenamiento | Benignos | Ataques | AUROC | Recall | FPR |
|---|---|---|---|---|---|---|
| harm_actions | sí | 23 | 32 | 0.990 | 0.906 | 0.000 |
| agent_trust | sí | 44 | 52 | 0.930 | 1.000 | 0.386 |
| stepshield | sí | 2.562 | 108 | 0.841 | 0.759 | 0.215 |
| agentdyn | no | 9.806 | 1.310 | 0.880 | 0.651 | 0.087 |
| agentdojo | no | 6.413 | 1.217 | 0.751 | 0.064 | 0.021 |
| bfcl (solo benignos) | no | 7.927 | 0 | — | — | 0.050 |
| injecagent (solo benignos) | no | 1.054 | 0 | — | — | 0.000 |

Las filas de fuentes vistas son disjuntas de las de entrenamiento. El autor advierte de una alta tasa de falsos positivos en agent_trust y stepshield, y de una baja recall en agentdojo (ataques de inyección de prompts, familia ausente en el entrenamiento). Los resultados en fuentes no vistas varían entre semillas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140,6 millones de parámetros, en fp32 se necesitan aproximadamente 560 MB; en fp16 unos 280 MB; en int8 unos 140 MB. Cabe holgadamente en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, etc.) es suficiente; incluso CPU es viable para inferencia por lotes pequeños.
- Despliegue: se puede servir con `transformers` (PyTorch), exportar a ONNX para optimización, o usar frameworks como vLLM (aunque al ser un encoder, la inferencia es de baja latencia y no requiere optimizaciones de decodificación).
- Latencia y throughput: al ser un modelo pequeño (140M), la inferencia es rápida; en una GPU consumer se pueden procesar cientos de sesiones por segundo con batch adecuado. No se dispone de cifras exactas publicadas.

## Comparativa con modelos similares

No se dispone de información pública sobre otros clasificadores específicos de anomalías en tool calls con los que comparar directamente. Como referencia, se puede comparar con el modelo base `jhu-clsp/mmBERT-small` (sin fine-tune) y con otros encoders multilingües como XLM-R, pero no hay datos de rendimiento en esta tarea concreta. La comparativa queda limitada a lo siguiente:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| AnShi-HW/tool-call-anomaly-mmbert-small-v1 | 140,6M | 1024 | Clasificacion de anomalias en tool calls | no disponible |
| jhu-clsp/mmBERT-small (base) | no disponible | no disponible | Encoder multilingue general | no disponible |
| XLM-R (base) | 278M | 512 | Encoder multilingue general | MIT (para XLM-R base) |

No se dispone de benchmarks comparativos entre estos modelos en la tarea de detección de anomalías.

## Limitaciones y advertencias

- Alta tasa de falsos positivos en tráfico benigno de agent_trust (FPR 0.386) y stepshield (FPR 0.215), lo que puede generar alertas excesivas en entornos con esos patrones de uso.
- Baja recall en agentdojo (0.064), un conjunto especializado en ataques de inyección de prompts, familia ausente en el entrenamiento; el modelo no es fiable para detectar este tipo de ataque.
- Los resultados en fuentes no vistas varían entre semillas de entrenamiento, lo que indica cierta inestabilidad en la generalización.
- El umbral recomendado (0.5299) se calibró sobre un conjunto benigno concreto (bfcl); en tráfico diferente será necesario recalibrar el umbral sobre una muestra benigna propia.
- La licencia no está especificada, por lo que el uso comercial puede ser incierto; se recomienda contactar al autor antes de un despliegue productivo.
- La ventana de contexto está limitada a 1024 tokens; sesiones más largas se truncarán, lo que puede perder información relevante.
- No se documentan los idiomas soportados en el fine-tune; aunque el encoder base es multilingüe, el rendimiento en idiomas distintos del inglés no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnShi-HW/tool-call-anomaly-mmbert-small-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/AnShi-HW/tool-call-anomaly-data
- Modelo base mmBERT-small: https://huggingface.co/jhu-clsp/mmBERT-small
- Repositorio GitHub de mmBERT: https://github.com/JHU-CLSP/mmBERT/
- Paper de mmBERT (arXiv): https://arxiv.org/abs/2509.06888
