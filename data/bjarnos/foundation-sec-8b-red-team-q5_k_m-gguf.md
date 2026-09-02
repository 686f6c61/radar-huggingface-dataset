# Bjarnos/foundation-sec-8b-red-team-Q5_K_M-GGUF

## Resumen

Este modelo es una conversión a formato GGUF del checkpoint `Ironcybersec/foundation-sec-8b-red-team`, realizado por el usuario Bjarnos mediante la herramienta GGUF-my-repo de llama.cpp. Se trata de un modelo de 8 mil millones de parámetros, especializado en tareas de ciberseguridad ofensiva, red teaming y pruebas de penetración autorizadas, que ha sido afinado con LoRA sobre la base `fdtn-ai/Foundation-Sec-8B`, una variante de Llama-3.1-8B pre-entrenada de forma continua sobre corpus especializados en seguridad.

La relevancia de este modelo radica en su enfoque específico para el ámbito de la seguridad informática: permite a profesionales y equipos de red team disponer de un modelo de lenguaje capaz de asistir en análisis de vulnerabilidades, generación de informes técnicos y simulaciones de ataques, todo ello bajo un marco de uso autorizado. Al estar disponible en formato GGUF cuantizado (Q5_K_M), puede ejecutarse en hardware de consumo con herramientas como llama.cpp u Ollama, lo que facilita su adopción en entornos de laboratorio y despliegues locales.

La ficha se basa exclusivamente en la información proporcionada por la model card y los resultados de búsqueda web; algunos parámetros técnicos no están disponibles y se indican explícitamente como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama-3.1-8B, no confirmado directamente) |
| Parametros totales | 8.031.309.888 (8B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible en la model card; el modelo base `Foundation-Sec-8B` soporta 131.072 tokens según fuentes externas |
| Tipos de cuantizacion | Q5_K_M (única versión disponible en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada no especificada en la model card) |
| Formato de pesos | GGUF (archivo `foundation-sec-8b-red-team-q5_k_m.gguf`) |

## Arquitectura y entrenamiento

El modelo es una conversión GGUF del checkpoint `Ironcybersec/foundation-sec-8b-red-team`, que a su vez es un fine-tuning con LoRA del modelo `fdtn-ai/Foundation-Sec-8B`. Este último se describe como una extensión de Llama-3.1-8B mediante pre-entrenamiento continuo sobre un corpus curado de ciberseguridad, que incluye informes de inteligencia de amenazas, bases de datos de vulnerabilidades y otros textos técnicos del dominio. La arquitectura subyacente es la de un transformer decoder-only con atención causal, típico de la familia Llama.

El proceso de fine-tuning para la variante red-team se realizó sobre un dataset denominado `red-team-security`, aunque no se especifican detalles sobre su tamaño, composición ni metodología de entrenamiento (por ejemplo, si se usó RLHF o DPO). La model card del repositorio GGUF no aporta información adicional sobre el entrenamiento; se recomienda consultar la model card del modelo base `Ironcybersec/foundation-sec-8b-red-team` para más detalles, aunque no está disponible en los materiales proporcionados.

## Capacidades

- Especializado en ciberseguridad ofensiva: red teaming, pruebas de penetración, análisis de vulnerabilidades y generación de informes técnicos de seguridad.
- Generación de texto en lenguaje natural orientado a contextos de seguridad informática (descripciones de exploits, recomendaciones de mitigación, etc.).
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno, heredada de la base Llama-3.1-8B (no confirmado explícitamente para esta variante).
- No se documentan capacidades adicionales como tool calling, function calling, soporte multimodal o modo de razonamiento extendido.

## Casos de uso

- Asistencia en pruebas de penetración autorizadas: el modelo puede ayudar a redactar planes de ataque, enumerar vectores de intrusión y sugerir pasos de explotación en entornos controlados, aprovechando su conocimiento específico de seguridad.
- Generación de informes de vulnerabilidades: a partir de descripciones técnicas, puede producir resúmenes ejecutivos y recomendaciones de remediación claras para equipos de desarrollo.
- Análisis de código fuente en busca de fallos de seguridad: aunque no se documenta explícitamente, su entrenamiento en corpus de ciberseguridad lo hace adecuado para revisar fragmentos de código y señalar posibles riesgos.
- Simulación de ataques de phishing o ingeniería social en ejercicios de concienciación: puede generar ejemplos de correos o mensajes para formación interna, siempre bajo supervisión.
- Documentación técnica de seguridad: redacción de playbooks, runbooks y guías de respuesta a incidentes.
- Formación y aprendizaje: como herramienta educativa para estudiantes de ciberseguridad que deseen practicar escenarios de red team en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye métricas de rendimiento, y los resultados de búsqueda web tampoco proporcionan datos comparativos para este modelo específico.

## Requisitos de hardware

- VRAM estimada para inferencia: según fuentes externas, la versión Q4_K_M del modelo base `Foundation-Sec-8B` requiere aproximadamente 5,39 GB de VRAM. Para la cuantización Q5_K_M de este repositorio, se estima un consumo ligeramente superior, en torno a 6 GB, aunque no se dispone de una cifra oficial.
- GPU recomendadas: el modelo cabe en GPUs de consumo con 8 GB o más de VRAM, como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070 (12 GB) o superiores. También puede ejecutarse en GPUs profesionales como A10, A100 o H100 para mayor velocidad.
- Opciones de despliegue: compatible con llama.cpp (CLI y servidor), llama-server, y potencialmente con Ollama (existen versiones del modelo base en ese ecosistema). También puede usarse con bindings de Python como llama-cpp-python.
- Latencia y throughput: no se dispone de datos medidos. En una GPU consumer moderna (por ejemplo, RTX 4060), se puede esperar una velocidad de generación de entre 10 y 30 tokens por segundo, dependiendo del contexto y de la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `Bjarnos/foundation-sec-8b-red-team-Q5_K_M-GGUF` | 8B | no disponible (base: 131K) | other | Red team y seguridad ofensiva (fine-tuning LoRA) |
| `fdtn-ai/Foundation-Sec-8B` | 8B | 131K | Apache 2.0 (según fuentes externas) | Base de ciberseguridad (pre-entrenamiento continuo) |
| `Ironcybersec/foundation-sec-8b-red-team` | 8B | no disponible | other | Fine-tuning red-team sobre Foundation-Sec-8B |
| `FenkoHQ/Foundation-Sec-8B` (Ollama) | 8B | no disponible | no especificada | Variante del modelo base para Ollama |

Nota: la comparativa se basa en información pública de los repositorios; no se han encontrado modelos de la misma categoría (red teaming) con especificaciones detalladas.

## Limitaciones y advertencias

- Uso exclusivo para actividades de seguridad autorizadas: el modelo está diseñado para red teaming y pentesting legítimos; su uso en contextos no autorizados puede violar leyes y normativas.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inexacta sobre vulnerabilidades, exploits o procedimientos técnicos. Es imprescindible verificar cualquier salida con fuentes fiables.
- Sesgos potenciales: el entrenamiento en corpus de ciberseguridad puede introducir sesgos hacia ciertos tipos de ataques o tecnologías, limitando la generalización.
- Licencia restrictiva: la licencia "other" no está especificada; se recomienda revisar los términos del modelo base y del fine-tuning antes de cualquier uso comercial o despliegue en producción.
- Contexto limitado: aunque el modelo base soporta hasta 131K tokens, no se ha confirmado que esta conversión GGUF mantenga esa longitud de contexto; es posible que la ventana efectiva sea menor según la configuración de llama.cpp.
- Sin garantías de soporte: el repositorio tiene 0 descargas y 1 like, lo que sugiere un proyecto de baja adopción; no hay mantenimiento activo documentado.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/Bjarnos/foundation-sec-8b-red-team-Q5_K_M-GGUF
- Modelo base (Ironcybersec): https://huggingface.co/Ironcybersec/foundation-sec-8b-red-team
- Modelo original Foundation-Sec-8B: https://huggingface.co/fdtn-ai/Foundation-Sec-8B
- Página de Ollama con variante del modelo: https://ollama.com/FenkoHQ/Foundation-Sec-8B
- Requisitos de hardware y compatibilidad (fuente externa): https://llmrun.dev/model/fdtn-ai-foundation-sec-8b
