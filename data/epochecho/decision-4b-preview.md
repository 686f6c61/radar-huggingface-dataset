# EpochEcho/decision-4b-preview

## Resumen

Decision 4B Preview es un modelo de decisión estructurada desarrollado por EpochEcho, obtenido mediante fine-tuning supervisado del modelo base Qwen/Qwen3.5-4B. Su propósito no es la generación libre de texto, sino la clasificación y el enrutamiento: recibe un estado (texto o valor compatible con JSON) y un conjunto de preguntas con criterios explícitos, y devuelve una opción seleccionada más una probabilidad por cada criterio. El modelo no genera explicaciones; emite decisiones con una distribución de probabilidad sobre el espacio de respuestas definido en cada petición.

Con 4.659.865.088 parámetros totales y un contexto de 32.768 tokens, el modelo está pensado para tareas con un espacio de respuesta acotado: clasificación de intención, enrutamiento de flujos de trabajo, selección de herramientas y juicios de evidencia. Al recibir las etiquetas en cada solicitud, no queda restringido a un conjunto fijo de clases, lo que lo hace flexible para integrarse en pipelines de decisión heterogéneos.

La relevancia actual del modelo reside en su enfoque: en lugar de emplear un LLM generativo con prompting para tareas de clasificación, ofrece una interfaz dedicada (`choice` y `noul`) que devuelve probabilidades normalizadas sobre opciones válidas. La licencia Apache 2.0 y la publicación de un checkpoint completo fusionado (sin necesidad de cargar adaptadores) facilitan su evaluación, aunque se trata de una versión preview con un único idioma declarado (inglés) y sin resultados de benchmarks públicos más allá del índice propio del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido derivado de Qwen3.5-4B: capas de atención completa bidireccional sobre la entrada de cada pregunta y capas Gated DeltaNet con comportamiento causal nativo; cabeza de decisión lineal (255 filas de código de respuesta × 2.560 dimensiones ocultas, sin sesgo) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (incluye estado, pregunta, criterios y formato de una pregunta) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos BF16 con cabeza de decisión en FP32) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint completo fusionado, backbone BF16 y cabeza FP32; incluye `manifest.json` con sumas de verificación) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y conserva su estructura híbrida, pero introduce modificaciones específicas para la tarea de decisión. Las capas de atención completa operan de forma bidireccional sobre la entrada completa de cada pregunta, mientras que las capas Gated DeltaNet mantienen su comportamiento causal nativo. Sobre el backbone se añade una cabeza de decisión lineal de 255 filas (códigos de respuesta) por 2.560 dimensiones ocultas, sin sesgo. El renderizador, la máscara bidireccional y la lectura por marcadores son componentes obligatorios: la generación de texto causal ordinaria no reproduce el comportamiento del modelo.

El entrenamiento consistió en fine-tuning supervisado sobre 2 millones de registros de decisión, con adaptación LoRA de rango 64 y alpha 64 que se fusionó en los pesos publicados. Los datos cubren conocimiento y razonamiento, comprensión del lenguaje, recuperación y clasificación, herramientas y automatización, preferencias y decisiones basadas en esquemas; incluyen supervisión de tareas original y anotaciones sintéticas y de preferencia de origen upstream. La selección del modelo se realizó con un conjunto de desarrollo separado de 15.935 solicitudes. El repositorio contiene el checkpoint completo fusionado, el tokenizador, la configuración y la lectura lineal, sin necesidad de descargar el modelo base ni cargar adaptadores.

## Capacidades

- Clasificación de intención y enrutamiento: selección entre 1 y 255 criterios con nombre por pregunta de tipo `choice`, con una probabilidad por cada opción.
- Estimación de probabilidad de proposiciones: preguntas de tipo `noul` que devuelven la probabilidad estimada de que una afirmación sea verdadera, con descripciones verdadero/falso opcionales.
- Evaluación independiente de preguntas: cada pregunta se evalúa de forma aislada con el estado completo y las respuestas se combinan en una única respuesta.
- Procesamiento por lotes: `model.decide_many(requests)` para entradas independientes.
- Soporte de estado estructurado: el campo `state` admite texto o valores compatibles con JSON.
- Criterios explícitos por opción: las etiquetas se proporcionan en cada solicitud, sin conjunto fijo de clases.
- Sin generación libre de texto ni explicaciones: el modelo solo emite opciones y probabilidades.
- Solo texto: no admite entrada de imagen o vídeo.
- Idioma: inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: con un estado que contenga el mensaje del cliente y preguntas de tipo `choice` con criterios como "billing", "technical" o "general", el modelo devuelve la opción más probable y su probabilidad, lo que permite dirigir automáticamente cada solicitud al equipo adecuado y aplicar umbrales de confianza.
- Selección de herramientas en agentes: dado el estado de la conversación y una pregunta `choice` cuyos criterios son las herramientas disponibles, el modelo estima qué herramienta invocar, útil como paso de decisión previo a la ejecución en pipelines de agentes.
- Clasificación de intención en asistentes conversacionales: con preguntas `noul` del tipo "¿el usuario solicita un reembolso?", el modelo estima la probabilidad de la proposición para activar flujos condicionales sin necesidad de generar texto.
- Juicio de evidencia y verificación: para evaluar si un fragmento de contexto respalda una afirmación, se formula una pregunta `noul` con el estado compuesto por la afirmación y la evidencia; la probabilidad resultante puede usarse como señal en sistemas de recuperación aumentada.
- Decisiones basadas en esquemas: el entrenamiento cubre decisiones con esquemas, de modo que el modelo puede validar o seleccionar opciones dentro de estructuras predefinidas en flujos de negocio, como la elección de una categoría de producto o un estado de pedido.
- Moderación y filtrado por criterios: con preguntas `choice` que enumeran categorías de política, el modelo asigna probabilidades a cada categoría para priorizar la revisión humana según el umbral configurado.
- Enrutamiento de correo o documentos: clasificación de mensajes entrantes según criterios definidos por el equipo, aprovechando el contexto de 32.768 tokens para incluir el documento completo en el estado.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor corresponden a su propio índice, "Public Index 0.3", que no es una media simple de categorías ni el "Full Score" privado del leaderboard:

| Public Index 0.3 | Puntuación |
|---|---:|
| Overall | 57,72 |
| Knowledge & Reasoning | 42,12 |
| Language Understanding | 65,04 |
| Retrieval & Classification | 64,02 |
| Tools & Automation | 73,38 |
| Arts & Human Taste | 37,83 |
| Successful requests | 140178 / 140178 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica que los archivos completos de resultados se suministran por separado y que no se reclama el Full Score privado ni una cualificación oficial de latencia por solicitud individual.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa aproximadamente 9 GiB (backbone BF16 y cabeza FP32); los contextos largos requieren memoria de trabajo adicional en GPU más allá de esa huella.
- GPU recomendadas: el autor no especifica modelos concretos; la pila de referencia usa una GPU CUDA con PyTorch 2.14.1, CUDA 13.2 y Transformers 5.17.0, y Python 3.13.
- Cabe en GPU de consumo: no disponible como dato explícito; la huella de ~9 GiB sugiere que podría caber en GPUs de consumo con 12 GB o más de VRAM, pero no se confirma en la información proporcionada.
- Opciones de despliegue: la información solo documenta el uso mediante Transformers y PyTorch con el código incluido en el repositorio (`from model import DecisionModel`); no se mencionan vLLM, llama.cpp, Ollama ni TGI. El renderizador, la máscara bidireccional y la lectura por marcadores son obligatorios, por lo que la generación causal estándar no es válida.
- Latencia y throughput: no disponibles; el autor no reclama ninguna cualificación oficial de latencia por solicitud.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables ni de alternativas equivalentes de modelo de decisión en la información proporcionada. Como referencia estructural, el modelo se basa en Qwen3.5-4B:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision 4B Preview | 4.659.865.088 | 32.768 | Clasificación y decisión estructurada | Apache 2.0 | Hugging Face (preview) |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | Generación de texto | no disponible | Hugging Face |

No se han identificado en la información disponible otros modelos de decisión comparables con los que contrastar parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Solo texto: no admite entrada de imagen o vídeo, generación libre ni rúbricas de puntuación arbitrarias.
- Las probabilidades son estimaciones del modelo, no confianza calibrada garantizada; es necesario validar los umbrales con datos propios de validación.
- Las solicitudes con varias preguntas repiten el estado para cada pregunta independiente, y el uso de tokens reportado incluye esa repetición.
- El límite de 32.768 tokens incluye estado, pregunta, criterios y formato de una pregunta; las entradas que lo exceden se rechazan en lugar de truncarse.
- La temperatura está fijada en 1.0 y las probabilidades solo se normalizan sobre las opciones válidas.
- El idioma declarado es únicamente inglés, lo que limita su uso en otros idiomas.
- Los contextos largos requieren memoria de trabajo adicional en GPU más allá de los aproximadamente 9 GiB del checkpoint.
- El autor aplicó comprobaciones de solapamiento exacto y aproximado entre fuentes y grupos, pero no garantizan una descontaminación semántica exhaustiva.
- Se trata de una versión preview; no se reclama el Full Score privado ni una cualificación oficial de latencia.
- Licencia Apache 2.0, con avisos de copyright y licencia del modelo base conservados; los datasets upstream mantienen sus propios términos y no se redistribuyen en el repositorio.
- Riesgo de alucinación y sesgos: no se documentan sesgos conocidos en la información disponible; al no generar texto libre, el riesgo se traslada a la calibración de las probabilidades y a la definición de los criterios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EpochEcho/decision-4b-preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
