# GoktugD/Llama-NanoSOC1-8B

## Resumen

Llama-NanoSOC1-8B es un adaptador PEFT (QLoRA) desarrollado por Göktuğ Düşünen sobre el modelo base fdtn-ai/Foundation-Sec-1.1-8B-Instruct, un modelo de 8B parámetros especializado en ciberseguridad. El adaptador está diseñado para asistir a analistas de centros de operaciones de seguridad (SOC) en tareas de respuesta a incidentes, correlación de eventos y mapeo con MITRE ATT&CK. Se presenta como un sistema de "evidencia apilada" (evidence stack) con dos adaptadores enrutados por tarea, un corpus RAG de 5.492 documentos de seguridad, compuertas de seguridad del modelo y registro de auditoría inmutable.

El modelo resuelve el problema de la sobrecarga de alertas en los SOC, proporcionando a los analistas una herramienta conversacional que contextualiza incidentes, correlaciona señales y sugiere acciones, sin actuar como un sistema autónomo de detección o respuesta. Su relevancia actual radica en la creciente demanda de asistentes de IA especializados en seguridad que puedan integrarse en flujos de trabajo existentes con supervisión humana. El acceso es restringido (gated) y la licencia es no comercial, lo que limita su uso en entornos empresariales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base: Foundation-Sec-1.1-8B-Instruct) |
| Parametros totales | 8B (modelo base) + adaptador LoRA (parametros entrenables no especificados) |
| Parametros activos | no disponible (adaptador PEFT, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Adaptador en safetensors; cuantizaciones del modelo base no especificadas |
| Idiomas soportados | Turco (tr), ingles (en) |
| Licencia | other (no comercial) |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador QLoRA (tag `qlora`) sobre Foundation-Sec-1.1-8B-Instruct, un modelo de 8B parámetros derivado de Llama 3.1 y entrenado con un corpus de ciberseguridad curado. Según el paper de Foundation-Sec (arXiv:2504.21039), este modelo base iguala a Llama 3.1-70B y GPT-4o-mini en tareas específicas de ciberseguridad. El adaptador introduce dos rutas de tarea (task-routed adapters) que se activan según el tipo de consulta, junto con un corpus RAG de 5.492 documentos de seguridad para recuperación aumentada. Se mencionan compuertas de seguridad del modelo (model-security gates) y registro de auditoría inmutable, lo que sugiere un diseño orientado a trazabilidad y control de calidad en entornos SOC.

No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO. La información pública se limita a la descripción del espacio "DUSUNEN-AI-Lab" y las etiquetas de la tarjeta del modelo.

## Capacidades

- Asistencia conversacional para analistas de SOC en respuesta a incidentes.
- Correlación de incidentes y alertas de seguridad.
- Mapeo de eventos con la matriz MITRE ATT&CK.
- Recuperación aumentada por generación (RAG) sobre un corpus de 5.492 documentos de seguridad.
- Enrutamiento de tareas mediante dos adaptadores especializados (uno por tipo de tarea).
- Soporte multilingüe limitado a turco e inglés.
- Compuertas de seguridad del modelo y registro de auditoría para trazabilidad.
- Diseñado para asistir, no para actuar de forma autónoma como IDS o motor de respuesta.

## Casos de uso

- Triage de alertas en un SOC: el analista describe una alerta y el modelo la contextualiza con el corpus RAG, sugiriendo posibles causas y pasos de investigación.
- Correlación de eventos entre múltiples fuentes: el modelo cruza indicadores de compromiso (IOCs) y eventos aparentemente aislados para identificar patrones comunes.
- Enriquecimiento de incidentes con MITRE ATT&CK: a partir de una descripción de comportamiento malicioso, el modelo sugiere las técnicas y tácticas relevantes de la matriz.
- Generación de informes de incidentes: el modelo redacta resúmenes ejecutivos y técnicos en inglés o turco, listos para revisión humana.
- Formación de analistas junior: como herramienta de aprendizaje, el modelo explica conceptos de seguridad y metodologías de respuesta a incidentes.
- Auditoría y revisión de procedimientos: gracias al registro de auditoría inmutable, el modelo puede documentar sus recomendaciones para cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Foundation-Sec-1.1-8B-Instruct ha demostrado en el paper original que iguala a Llama 3.1-70B y GPT-4o-mini en tareas específicas de ciberseguridad, pero no hay datos específicos para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador sobre un modelo de 8B, se requieren aproximadamente 16 GB en FP16, unos 8 GB en cuantización 8-bit y unos 6 GB en 4-bit (estimaciones generales para modelos de 8B).
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con al menos 8 GB para cuantización ligera. Para producción, A100 o H100 son adecuadas.
- Compatibilidad con GPU de consumo: sí, con cuantización (por ejemplo, mediante llama.cpp u Ollama), aunque el acceso restringido y la licencia no comercial limitan su uso en entornos productivos.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con bibliotecas como Hugging Face Transformers + PEFT, o exportarse a GGUF para llama.cpp/Ollama. También es compatible con vLLM y TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Llama-NanoSOC1-8B (este) | 8B + adaptador | no disponible | SOC, respuesta a incidentes, MITRE ATT&CK | no comercial |
| Foundation-Sec-1.1-8B-Instruct (base) | 8B | no disponible | Ciberseguridad general | no especificada |
| Llama 3.1 8B Instruct | 8B | 128K | Generico | Llama 3.1 Community License |

La comparación directa con otros adaptadores de ciberseguridad no está disponible en la información pública. El modelo se distingue por su enfoque en SOC con RAG y enrutamiento de tareas, pero carece de benchmarks publicados para una comparación cuantitativa.

## Limitaciones y advertencias

- No es un sistema autónomo de detección o respuesta: debe usarse siempre con supervisión humana.
- Licencia no comercial: no puede utilizarse en entornos empresariales con fines de lucro.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face.
- Idiomas limitados a turco e inglés; no soporta español ni otros idiomas.
- Riesgo de alucinación en recomendaciones de seguridad: el corpus RAG mitiga parcialmente, pero no elimina el riesgo.
- Posibles sesgos derivados del corpus de entrenamiento de Foundation-Sec, no documentados públicamente.
- Longitud de contexto no especificada: puede ser un factor limitante en análisis de incidentes largos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GoktugD/Llama-NanoSOC1-8B
- Espacio DUSUNEN-AI-Lab: https://huggingface.co/spaces/GoktugD/DUSUNEN-AI-Lab
- Paper de Foundation-Sec (modelo base): https://arxiv.org/pdf/2504.21039
