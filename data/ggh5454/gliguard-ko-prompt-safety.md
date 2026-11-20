# ggh5454/gliguard-ko-prompt-safety

## Resumen

GLiGuard Korean prompt safety es un modelo de clasificación de texto derivado de `fastino/gliguard-LLMGuardrails-300M`, afinado por el usuario `ggh5454` para realizar clasificación binaria de seguridad sobre prompts en coreano. El modelo etiqueta cada entrada como `safe` o `unsafe`, agrupando bajo la etiqueta `unsafe` todas las categorías del dataset original `prismdata/guardrail-ko-11class-dataset` que no corresponden a `SAFE`. El foco del conjunto de entrenamiento son el discurso de odio, la discriminación, las insultos y las inyecciones de prompt.

Se distribuye como un extractor basado en la librería `gliner2`, con pesos en formato safetensors y un total de 208.476.821 parámetros, lo que lo sitúa en la franja de modelos pequeños orientados a guardrails desplegables en entornos con recursos limitados. El repositorio ocupa aproximadamente 0,8 GB.

Su relevancia actual radica en la creciente necesidad de filtros de seguridad específicos por idioma en pipelines de LLM: un clasificador binario ligero permite interceptar prompts problemáticos antes de que lleguen al modelo generativo, con una latencia baja y sin requerir un modelo generativo adicional para la tarea de moderación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | extractor GLiNER2 (base: fastino/gliguard-LLMGuardrails-300M) |
| Parametros totales | 208.476.821 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `fastino/gliguard-LLMGuardrails-300M`, un checkpoint de la familia GLiGuard orientado a guardrails, y se ejecuta mediante la librería `gliner2` como extractor de clasificación de texto. La tarea definida en el ajuste fino es `prompt_safety`, con un espacio de etiquetas binario (`safe`, `unsafe`). No se dispone de información sobre la arquitectura interna detallada del checkpoint base (tipo de encoder, número de capas, mecanismo de atención) en la documentación proporcionada.

El ajuste fino utiliza el dataset `prismdata/guardrail-ko-11class-dataset`, en el que la etiqueta `SAFE` se mapea a `safe` y las diez categorías restantes se colapsan en `unsafe`. El conjunto de entrenamiento se centra en contenido coreano de odio, discriminación, insultos e inyección de prompt. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; al tratarse de una tarea de clasificación, estos procedimientos no son habituales.

## Capacidades

- Clasificación binaria de seguridad de prompts en coreano, con las etiquetas `safe` y `unsafe`.
- Detección de discurso de odio, discriminación e insultos en texto coreano.
- Detección de intentos de inyección de prompt.
- Integración con la librería `gliner2` mediante `GLiNER2.from_pretrained` y `classify_text`.
- Salida estructurada por tarea (`prompt_safety`) con el par de etiquetas configurable.
- No se documentan capacidades de generación de texto, tool calling, agentes, vision, audio ni modo de razonamiento extendido; se trata de un clasificador, no de un modelo generativo.

## Casos de uso

- Filtrado previo de prompts en asistentes conversacionales en coreano: el clasificador se coloca delante del LLM generativo para descartar entradas marcadas como `unsafe` antes de consumir tokens del modelo principal, reduciendo coste y riesgo.
- Moderación de comunidades y foros coreanos: clasificación por lotes de mensajes de usuario para derivar a revisión humana aquellos marcados como `unsafe`, aprovechando la precisión reportada del 95,50 % en la clase unsafe.
- Protección frente a inyección de prompt en aplicaciones RAG: intercepción de consultas de usuario que intentan manipular instrucciones del sistema, dado que el entrenamiento incluye ejemplos de prompt injection.
- Pasarela de seguridad en APIs de LLM multiinquilino: integración como microservicio independiente que evalúa cada prompt entrante y devuelve una decisión binaria antes del enrutado al modelo de generación.
- Cumplimiento y auditoría de contenido: registro sistemático de prompts clasificados como inseguros para análisis posterior y elaboración de informes de moderación.
- Enrutado condicional de consultas: derivar prompts `safe` al modelo principal y prompts `unsafe` a un flujo de rechazo controlado o a revisión humana, minimizando falsos positivos en producción.
- Evaluación de calidad de datasets coreanos: uso del clasificador para etiquetar o auditar corpus antes de reutilizarlos en entrenamiento de otros modelos.

## Benchmarks y rendimiento

Evaluación sobre 98.602 ejemplos de un conjunto binario de evaluación (matriz de confusión almacenada en Drive):

| Metrica | Valor |
|---|---|
| Exactitud | 92,81 % |
| Precision (unsafe) | 95,50 % |
| Recall (unsafe) | 96,02 % |
| F1 (unsafe) | 95,76 % |
| Tasa de bloqueo de SAFE | 24,72 % |

Matriz de confusión (real / predicho):

| Real \ Predicho | safe | unsafe |
|---|---|---|
| safe | 11.488 | 3.772 |
| unsafe | 3.316 | 80.026 |

No se han publicado resultados de benchmarks comparativos con otros modelos de guardrails en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 208,5 M parámetros en safetensors (probablemente fp32, ~0,8 GB de pesos), la huella en memoria es del orden de 1 GB en fp32 y menos en fp16/bf16.
- GPU recomendadas: no disponible; por tamaño, cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) y en CPU.
- Cabe en GPU consumer: sí, con amplio margen dado el tamaño del modelo.
- Opciones de despliegue: librería `gliner2` (instalación mediante `pip install "gliner2[local]"`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Tarea |
|---|---|---|---|---|---|
| ggh5454/gliguard-ko-prompt-safety | 208,5 M | no disponible | ko | no disponible | clasificación binaria de seguridad de prompts |
| fastino/gliguard-LLMGuardrails-300M (base) | ~300 M (según nombre) | no disponible | no disponible | no disponible | guardrails (modelo base) |
| prismdata/guardrail-ko-11class-dataset (referencia de datos) | no aplica | no aplica | ko | ver condiciones del dataset | clasificación multietiqueta de 11 clases |

No se dispone de datos de rendimiento comparativos con otros clasificadores de guardrails en la información proporcionada.

## Limitaciones y advertencias

- Falsos positivos documentados: la tasa de bloqueo de entradas `safe` es del 24,72 %, de modo que prompts legítimos pueden clasificarse como `unsafe`.
- La evaluación se limita a un conjunto binario coreano concreto; el rendimiento en otras tareas (seguridad de respuestas, clasificación de rechazos) requiere evaluación independiente.
- Sesgos potenciales derivados del dataset de entrenamiento (`prismdata/guardrail-ko-11class-dataset`), cuyo contenido y composición no están detallados en la información disponible.
- Cobertura lingüística restringida al coreano; no se documenta soporte para otros idiomas.
- Licencia no disponible: no puede confirmarse la viabilidad de uso comercial sin consultar las condiciones de la licencia del modelo base y del dataset.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en entradas ambiguas o fuera de distribución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: modelo reciente y sin validación comunitaria amplia.
- El modelo base es un checkpoint de guardrails de terceros; cualquier restricción de uso del modelo base se hereda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ggh5454/gliguard-ko-prompt-safety
- Modelo base: https://huggingface.co/fastino/gliguard-LLMGuardrails-300M
- Dataset de entrenamiento: https://huggingface.co/datasets/prismdata/guardrail-ko-11class-dataset
