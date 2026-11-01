# finis-est/Laya-421M-Claviger-v0

## Resumen

Laya-421M-Claviger-v0 es un modelo de decisión (no generativo) desarrollado por finis-est que, a partir de un mensaje de Discord y su contexto reciente, determina si algún agente de IA presente en el canal debería responder y cuál de ellos. Se trata de un fine-tune de convaiinnovations/laya, que a su vez emplea un encoder ModernBERT-large con la cabeza de decisión de Laya: 421.293.830 parámetros en total. El modelo no produce texto libre, sino que selecciona una opción de una lista cerrada y devuelve probabilidades por clase.

El problema que aborda es concreto: en configuraciones multiagente dentro de canales de chat compartidos con personas, la regla habitual de responder solo a menciones o replies deja pasar mensajes que sí van dirigidos a un agente. Claviger pretende sustituir esa heurística por una clasificación aprendida que decida entre `none` y los agentes disponibles. Está pensado para el setup personal "citadel" del autor.

La relevancia es limitada y hay que enmarcarla con rigor: el modelo se entrenó y evaluó exclusivamente con conversaciones sintéticas, nunca ha operado sobre tráfico real y sus métricas proceden de un conjunto de test privado de 465 ítems. Es, por tanto, una pieza experimental de triage conversacional, no un componente listo para producción sin validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder) con la cabeza de decisión de Laya |
| Parámetros totales | 421.293.830 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | convaiinnovations/laya (revisión 7b928d828b7b0e022f929d9bd2e44165aa270148) |
| Tamaño del repositorio | 0,8 GB |
| Librería | laya (>= 0.4.9) |

## Arquitectura y entrenamiento

El modelo parte de Laya, que combina un encoder ModernBERT-large con una cabeza de decisión que formula la tarea como una elección entre opciones con criterios textuales. La entrada es texto plano: canal, mensaje, y líneas de mención, reply y contexto reciente; la salida es una opción (`none` o el nombre de un agente) acompañada de un vector de probabilidades. No hay decodificación generativa ni atención lineal ni decodificación especulativa: es un clasificador de elección múltiple condicionado por una lista de opciones definida en tiempo de ejecución.

El entrenamiento se hizo sobre 150 conversaciones inventadas con 1.127 mensajes humanos, divididas por conversación y congeladas por hash. El reparto fue: 532 ítems de entrenamiento (tres redactores, 53 reservados para calibración), 130 de dev (tres redactores), 218 de test-a (tres redactores) y 247 de test-adv (un cuarto redactor, solo casos difíciles). Cuatro agentes Claude escribieron los mensajes y modelos Claude etiquetaron; un segundo agente con otro modelo etiquetó a ciegas, con una concordancia de 1.122 de 1.127 ítems, cifra que el propio autor considera inflada porque los etiquetadores podían ver si un agente respondía a continuación. En una comprobación más estricta sobre 160 ítems con solo contexto previo, la concordancia fue de 156 (97,5 %). Se congelaron 12 de las 28 capas del encoder para ajustar el entrenamiento a 6 GB de VRAM; el autor señala que un fine-tune completo podría rendir mejor. No se detalla el uso de RLHF ni DPO, y el código y los datos de entrenamiento no son públicos.

## Capacidades

- Clasificación de triage: dado un mensaje y su contexto, decide entre `none` y los agentes presentes en el canal.
- Salida probabilística por clase, apta para umbrales de confianza y para modo veto.
- Aceptación de una lista de opciones y criterios en tiempo de ejecución, de modo que los nombres de agentes pueden cambiarse sin reentrenar (con la salvedad de la evaluación reducida que reporta el autor).
- Manejo de contexto conversacional reciente en formato de texto plano (canal, mensaje, mención, reply, líneas previas).
- Uso en CPU según el ejemplo de la model card (`device="cpu"`).
- No genera texto, no hace tool calling, no soporta agentes multi-paso por sí mismo, no tiene visión ni audio y no cubre idiomas distintos del inglés.

## Casos de uso

- Triage de canal multiagente en Discord: el modelo recibe el mensaje y la lista de agentes del canal y devuelve si debe responder alguno y cuál, sustituyendo la regla de "solo si me mencionan".
- Modo sombra para validar una política de respuesta: ejecutarlo en paralelo a la regla existente sobre mensajes reales y comparar decisiones antes de activarlo, tal como recomienda el autor.
- Veto de respuestas de baja confianza: usar las probabilidades para bloquear respuestas por debajo de un umbral, priorizando no intervenir de más.
- Enrutado entre agentes especializados: distinguir entre un agente "host" que responde preguntas generales y un agente "developer" que atiende código o web, cuando el mensaje va dirigido a uno de ellos.
- Filtrado previo en pipelines de atención automatizada: descartar mensajes que son conversación entre miembros o comentarios sobre un agente antes de invocar un modelo generativo, reduciendo coste y ruido.
- Investigación sobre triage conversacional: servir de punto de partida reproducible para estudiar clasificación de intervención en chats multiagente con datos sintéticos.
- Prototipado de asistentes comunitarios: integrar la decisión de intervención en bots de comunidades pequeñas en inglés, siempre con supervisión humana y recalibración previa.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre un conjunto de test sintético propio, no público (465 ítems de 60 conversaciones). Ninguno está verificado de forma independiente.

| Tarea | Conjunto | Métrica | Valor |
|---|---|---|---|
| Agent reply triage | Synthetic Discord triage test set (test) | Precision | 72,5 |
| Agent reply triage | Synthetic Discord triage test set (test) | Recall | 70,3 |
| Agent reply triage | Synthetic Discord triage test set (test) | F1 | 71,4 |
| Agent reply triage | Synthetic Discord triage test set (test) | Accuracy (agente correcto) | 69,2 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 421 M de parámetros en safetensors (0,8 GB de repositorio), la inferencia en fp32 ronda 1,7 GB y en fp16/bf16 unos 0,85 GB, sin contar activaciones.
- El autor entrenó con 12 de 28 capas congeladas para ajustarse a 6 GB de VRAM, lo que da una referencia del orden de magnitud del entrenamiento.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer con 4 GB o más debería alojar el modelo en precisión reducida, y el ejemplo oficial funciona en CPU.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas tipo RTX 3060, RTX 4060 o superiores, aunque no hay cifras publicadas de latencia ni throughput.
- Opciones de despliegue: la librería `laya` (>= 0.4.9) es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo no encaja en los servidores de inferencia habituales para LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay comparativas publicadas en la información disponible. Como referencias conceptuales de la misma categoría (clasificación de intervención o enrutado en chat), podrían considerarse clasificadores de intención basados en encoders como DeBERTa-v3 o ModernBERT afinados para detección de "respuesta requerida", pero no se dispone de datos que permitan una comparación numérica fiable.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya-421M-Claviger-v0 | 421 M | no disponible | Triage multiagente en Discord | Apache 2.0 | HuggingFace, 12 descargas |
| convaiinnovations/laya (base) | no disponible | no disponible | Decisión genérica con cabeza Laya | no disponible | HuggingFace |
| answerdotai/ModernBERT-large (encoder) | no disponible | no disponible | Encoder de propósito general | no disponible | HuggingFace |

## Limitaciones y advertencias

- Datos completamente sintéticos: cuatro agentes Claude escribieron los mensajes y modelos Claude etiquetaron; el chat real es más desordenado y los redactores comparten una única idea de cómo suena Discord.
- El conjunto de test está construido en torno a casos difíciles; en canales reales, mayoritariamente conversación trivial, la precisión en producción será inferior con la misma tasa de falsas respuestas.
- Conjunto de test pequeño (465 ítems de 60 conversaciones), con intervalos de confianza amplios.
- Sobreconfianza: en el conjunto de dev (130 ítems) la confianza media fue 0,865 frente a una precisión de 0,808; la temperatura ajustada alcanzó el tope de 5,0 sobre una muestra de calibración de solo 53 ítems; las respuestas con confianza ≥ 0,9 acertaron el 86,6 %, no el 90 %.
- Por diseño responde a pocas preguntas de ayuda no dirigidas y las trata como `none`.
- Está atado a su plantilla de agentes: con nombres inventados, una comprobación rápida sobre cuatro mensajes inventados acertó 2.
- Solo inglés; fuera de alcance la moderación o cualquier decisión sobre personas.
- No apto para respuestas automáticas sin fallback ni supervisión humana.
- 12 de 28 capas congeladas por límite de VRAM; un fine-tune completo podría mejorar el rendimiento.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías y recomienda recalibrar sobre un conjunto propio de varios cientos de ítems antes de confiar en las probabilidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/finis-est/Laya-421M-Claviger-v0
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Encoder ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- Paper de referencia citado en los tags (arXiv:2412.13663): https://arxiv.org/abs/2412.13663
