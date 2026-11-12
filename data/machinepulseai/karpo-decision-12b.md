# MachinePulseAI/karpo-decision-12B

## Resumen

Karpo Decision 12B es un modelo de decisión desarrollado por MachinePulseAI, fine-tuneado a partir de google/gemma-4-12B-it. No es un modelo generativo al uso: dado un estado (una página web, un documento, una conversación, cualquier texto o JSON) y un conjunto de preguntas tipadas sobre ese estado, devuelve una probabilidad para cada opción de cada pregunta en un único forward pass, sin generar texto. El modelo resuelve el problema de la clasificación y toma de decisiones estructurada de alta cardinalidad, donde los enfoques generativos obligan a decodificar la respuesta y arriesgan salidas fuera del conjunto permitido.

La arquitectura añade a la base Gemma 4 12B un readout lineal de 255 x 3.840 parámetros en fp32 que puntúa códigos de opción en el slot `Answer: (`. Con 11.959.730.224 parámetros totales (12.0B en bf16) y una longitud de contexto de 32.768 tokens por secuencia, el modelo procesa múltiples preguntas en un solo pass gracias a una disposición de atención por ramas donde cada rama lee el bloque compartido (preguntas y estado) y a sí misma, nunca a otra rama. Es relevante para pipelines de producción que necesitan decisiones deterministas y acotadas al conjunto de opciones, con latencia de un único paso hacia delante en lugar de decodificación autoregresiva.

El modelo forma parte de la familia Karpo Decision, que incluye variantes de 31B, 12B, 9B, 4B, 2B y 0.8B. La licencia MachinePulse Community permite uso comercial con atribución obligatoria ("Powered by karpo-decision (MachinePulse)") y requiere acuerdo comercial para entidades con ingresos anuales superiores a 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4) con readout lineal sobre códigos de opción; atención por ramas para preguntas múltiples |
| Parametros totales | 11.959.730.224 (12.0B en bf16) + readout de 255 x 3.840 en fp32 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia; peticiones más largas se dividen por preguntas, cada parte con el estado completo |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MachinePulse Community License (uso comercial permitido con atribución; acuerdo comercial si ingresos > US$10M) |
| Formato de pesos | safetensors |
| Tipo de pregunta | `choice` (hasta 255 opciones), `noul` (verdadero/falso), `score` (nivel en una escala) |
| Modalidad | image-text-to-text (según tags); pipeline declarado: text-classification |
| Modelo base | google/gemma-4-12B-it |
| Tamaño del repo | 24.0 GB |
| Librería | transformers |
| Interfaz | API Python y servidor HTTP en formato System One (`POST /v1/systemone`, `GET /healthz`) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 12B instruct y le añade un readout lineal que puntúa 255 códigos de opción en el slot `Answer: (` que cierra la rama de cada pregunta. Un softmax sobre las opciones propias de la pregunta convierte las puntuaciones en probabilidades. No se decodifica texto, por lo que la respuesta es siempre una de las opciones definidas. La disposición de la secuencia es: lista de preguntas, estado, y una rama por pregunta con sus opciones. La atención por ramas garantiza que cada rama lea el bloque compartido y a sí misma, nunca a otra rama, de modo que el estado se computa una vez por secuencia y ninguna pregunta ve las opciones de otra.

El diseño de lista de preguntas primero sigue a FlexDM y jev-brain, y la regla de bloque compartido y ramas sigue a Sieve-31B-v3. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. El modelo soporta tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (verdadero o falso) y `score` (nivel en una escala).

## Capacidades

- Clasificación y decisión estructurada: devuelve probabilidades por opción para preguntas `choice`, `noul` y `score`.
- Procesamiento de múltiples preguntas en un único forward pass sobre el mismo estado.
- Manejo de estados heterogéneos: texto libre, JSON, documentos, conversaciones y páginas web.
- Hasta 255 opciones por pregunta `choice`.
- Contexto de 32.768 tokens por secuencia, con división automática de peticiones largas por preguntas.
- Probabilidad calibrada por opción, con campo `confidence` en la respuesta.
- Salida acotada al conjunto de opciones (no puede devolver una opción no definida).
- Interfaz Python (`Decider`) y servidor HTTP compatible con formato System One.
- Capacidad image-text-to-text según los tags del modelo (no detallada en la model card).

## Casos de uso

- **Enrutamiento de tickets de soporte**: dado el texto de una incidencia y una pregunta `choice` con categorías (facturación, técnico, cuenta, etc.), el modelo devuelve la probabilidad de cada categoría en un solo pass, sin generar texto libre y sin riesgo de categorías inventadas.
- **Moderación de contenido acotada**: con preguntas `noul` (¿viola la política X?) y `score` (gravedad en una escala), se obtienen decisiones con umbral de confianza configurable para pipelines de revisión.
- **Evaluación de elegibilidad y políticas**: como en el ejemplo de la model card, un estado con datos de pedido y política de devoluciones se resuelve con preguntas `noul` (elegible) y `choice` (acción: reembolsar, rechazar, escalar).
- **Clasificación de documentos y extracción de atributos**: sobre un JSON o documento largo, se lanzan varias preguntas tipadas en una sola secuencia, aprovechando el contexto de 32.768 tokens y la atención por ramas para que cada pregunta no contamine a las demás.
- **Toma de decisiones en agentes**: como componente de un agente que necesita elegir entre acciones discretas (herramientas, rutas, respuestas) con probabilidades calibradas, en lugar de un modelo generativo que decodifica la acción.
- **Scoring de riesgo y priorización**: preguntas `score` sobre una escala permiten ordenar casos por nivel de riesgo o urgencia con una única inferencia por lote de preguntas.
- **Validación de conversaciones multi-turno**: el estado puede ser una conversación completa; preguntas `noul` y `choice` permiten evaluar intención, cumplimiento o siguiente acción sin generar respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo 12B en la información disponible. La model card menciona que el modelo mayor de la familia, karpo-decision-31B, está clasificado en el puesto 1 del Decision Index con una puntuación Full de 73.9 en las pruebas privadas de los mantenedores (edición 0.4.1, tablero del 12 de noviembre de 2026, 300 entradas) y un índice público de 75.0, pero no se aportan cifras del 12B.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 23.9 GB en bf16, más memoria adicional para peticiones largas (hasta 32.768 tokens por secuencia).
- GPU recomendadas: una GPU con al menos 24 GB de VRAM para bf16; A100 (40/80 GB) o H100 para mayor margen y throughput.
- Cabe en consumer GPU de 24 GB (por ejemplo RTX 3090/4090) para peticiones cortas, según el requisito declarado de "one GPU" y los 23.9 GB de pesos.
- Opciones de despliegue: API Python `karpo_decision.decider.Decider` y servidor HTTP `karpo_decision.serve.server` (System One, `POST /v1/systemone`); no se documentan soportes para vLLM, llama.cpp, Ollama o TGI.
- Requisitos de software: Python 3.12 o superior.
- Latencia y throughput: no disponibles.
- Advertencia: cargar el checkpoint como un modelo de chat convencional no reproduce sus respuestas.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| karpo-decision-12B | Gemma 4 12B | 12.0B | 32.768 | Decisión por readout, sin generación | MachinePulse Community |
| karpo-decision-31B | Gemma 4 31B | 31.3B | No disponible | Decisión por readout | MachinePulse Community |
| karpo-decision-9B | Qwen3.5 9B | 8.4B | No disponible | Decisión por readout | MachinePulse Community |
| karpo-decision-4B | Qwen3.5 4B | 4.5B | No disponible | Decisión por readout | MachinePulse Community |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre opciones predefinidas; no sirve para tareas generativas.
- Cargarlo como modelo de chat estándar no reproduce sus respuestas; requiere el código de inferencia específico (`karpo-decision`).
- Contexto máximo de 32.768 tokens por secuencia; peticiones más largas se dividen por preguntas, lo que implica múltiples forward passes y coste adicional.
- No se dispone de información sobre sesgos, idiomas soportados ni datos de entrenamiento, por lo que no se puede evaluar su comportamiento multilingüe.
- Riesgo de alucinación no aplicable en el sentido generativo, pero la calibración de probabilidades y el umbral de confianza deben validarse en el dominio de producción.
- Licencia MachinePulse Community: el uso comercial requiere mostrar "Powered by karpo-decision (MachinePulse)" en productos y servicios ofrecidos a terceros, y las entidades con ingresos anuales (con afiliadas) superiores a US$10M necesitan un acuerdo comercial.
- Capacidad image-text-to-text declarada en los tags pero no documentada en la model card; conviene validarla antes de usarla en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia externa sobre su comportamiento en producción.

## Enlaces

- Hugging Face: https://huggingface.co/MachinePulseAI/karpo-decision-12B
- Repositorio de inferencia: https://github.com/machinepulse-ai/karpo-decision
- Licencia: https://huggingface.co/MachinePulseAI/karpo-decision-12B/blob/main/LICENSE
- Modelo 31B: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo 9B: https://huggingface.co/MachinePulseAI/karpo-decision-9B
- Modelo 4B: https://huggingface.co/MachinePulseAI/karpo-decision-4B
- Modelo 2B: https://huggingface.co/MachinePulseAI/karpo-decision-2B
- Modelo 0.8B: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
- FlexDM: https://github.com/1000luca/FlexDM
- jev-brain: https://github.com/wcole3/jev-brain
- Sieve-31B-v3: https://huggingface.co/sthanika-ai/Sieve-31B-v3
