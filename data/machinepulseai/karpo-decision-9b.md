# MachinePulseAI/karpo-decision-9B

## Resumen

Karpo Decision 9B es un modelo de decisión desarrollado por MachinePulseAI, obtenido por ajuste fino supervisado (finetune) sobre Qwen/Qwen3.5-9B. No es un modelo generativo: dado un estado (una página web, un documento, una conversación, cualquier texto o JSON, opcionalmente con una captura de pantalla) y un conjunto de preguntas tipadas, devuelve una probabilidad para cada opción de cada pregunta en un único forward pass, sin decodificar texto.

El modelo resuelve el problema de clasificación y enrutamiento estructurado en pipelines de agentes: en lugar de pedir a un LLM que "responda" con texto libre, expone una cabeza lineal de lectura (readout) de 255 × 4,096 parámetros en fp32 sobre las representaciones del transformer. Cada opción de cada pregunta se etiqueta con un código y la softmax sobre las opciones de la pregunta da la distribución de probabilidad, garantizando que la respuesta sea siempre una de las opciones disponibles.

Pertenece a la familia Karpo Decision (0.8B, 2B, 4B, 9B, 12B y 31B), en la que el modelo mayor, karpo-decision-31B, ocupa el primer puesto del Decision Index de los mantenedores. El 9B cuenta con 8.392.695.024 parámetros en bf16, contexto de 32.768 tokens por secuencia y soporte de entrada multimodal (texto o JSON e imagen de viewport). Es relevante porque ofrece una alternativa determinista y de baja latencia a la generación de texto para tareas de decisión y enrutamiento en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (capas de atención completa + capas de atención lineal) derivado de Qwen3.5-9B, con cabeza de lectura lineal (readout) de 255 × 4.096 en fp32 |
| Parámetros totales | 8.392.695.024 (8,4B en bf16, más el readout de 255 × 4.096) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia |
| Tipos de cuantización | no disponible (pesos publicados en bf16 y readout en fp32) |
| Idiomas soportados | no disponible |
| Licencia | MachinePulse Community License (licencia "other", permisiva con condiciones) |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | Qwen/Qwen3.5-9B |
| Entrada | Texto o JSON, más captura de pantalla opcional en `state.viewport_screenshot` |
| Tipos de pregunta | `choice` (hasta 255 opciones), `noul` (verdadero/falso), `score` (nivel en una escala) |
| Interfaz | API Python y servidor HTTP `POST /v1/systemone`, `GET /healthz` |
| Tamaño del repo | 16,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de 9B parámetros, y lo somete a un ajuste fino con una cabeza de lectura lineal superpuesta. La innovación central es el mecanismo de decisión: en lugar de generar tokens, cada opción se etiqueta con un código de opción; en el punto de lectura que cierra cada pregunta, una capa lineal puntúa 255 códigos y una softmax sobre las opciones de esa pregunta produce las probabilidades. Esto garantiza que la salida sea siempre una de las opciones definidas y elimina el riesgo de respuestas fuera de formato.

La arquitectura mantiene la atención híbrida del modelo base: las capas de atención completa leen toda la secuencia en ambas direcciones, mientras que las capas de atención lineal la leen en orden, de modo que las preguntas quedan antes del estado. La codificación de la petición incluye la lista de preguntas, el estado y de nuevo cada pregunta con sus opciones y su punto de lectura, todo en una sola secuencia, lo que permite resolver múltiples preguntas en un único forward pass. El diseño de layout "preguntas primero" sigue los proyectos FlexDM y jev-brain.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que cargar el checkpoint como un modelo conversacional plano no reproduce sus respuestas, lo que confirma que la cabeza de lectura es imprescindible.

## Capacidades

- Clasificación estructurada: devuelve una probabilidad por cada opción de preguntas de tipo `choice` (hasta 255 opciones), `noul` (verdadero/falso) y `score` (nivel en una escala).
- Decisión sin generación: no decodifica texto, por lo que la salida siempre es una opción válida del conjunto definido.
- Resolución de múltiples preguntas en un solo forward pass, con repetición del estado completo para cada pregunta.
- Procesamiento de entradas de texto o JSON de cualquier estructura.
- Entrada multimodal: acepta una captura de pantalla en el campo `state.viewport_screenshot` como imagen en base64, lo que permite decisiones sobre páginas web renderizadas.
- Manejo de peticiones largas: si se supera el contexto de 32.768 tokens, la petición se divide por preguntas, cada una con el estado completo.
- Soporte de tool calling / function calling: no disponible como capacidad propia; el modelo devuelve decisiones, no llamadas a herramientas.
- Soporte de agentes multi-paso: el modelo actúa como componente de decisión dentro de un bucle de agente, no como generador de planes.
- Capacidades multilingües: no disponibles.
- Servidor HTTP compatible con el formato System One (`POST /v1/systemone`).

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado y una pregunta `choice` con las categorías o departamentos posibles, devolviendo la probabilidad de cada uno. Es adecuado porque la decisión es determinista y no requiere generación.
- Gestión de devoluciones y políticas: con un estado que combina el pedido y la política, se plantea una pregunta `noul` ("¿es elegible la devolución?") y una `choice` con las acciones posibles (reembolsar, rechazar, escalar), como ilustra el ejemplo de la model card.
- Moderación y clasificación de contenido: se define un estado con el texto a evaluar y preguntas `noul` o `choice` sobre categorías de riesgo; la ventaja es que la salida es una distribución de probabilidad auditable y no texto libre.
- Automatización de navegación web: con una captura de pantalla en `viewport_screenshot` y el HTML o texto de la página como estado, el modelo decide la siguiente acción (hacer clic, rellenar, navegar) mediante una pregunta `choice`, integrándose en agentes de navegador.
- Puntuación de leads o riesgo: pregunta de tipo `score` sobre una escala definida, usando el historial o la ficha del cliente como estado, para priorizar colas de trabajo.
- Extracción de decisiones en pipelines de datos: procesamiento por lotes de documentos JSON donde cada registro requiere varias etiquetas; el único forward pass con múltiples preguntas reduce la latencia frente a llamadas repetidas a un LLM generativo.
- Verificación de cumplimiento normativo: preguntas `noul` sobre si un contrato o una transcripción cumple una regla concreta, con la probabilidad asociada como medida de confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para karpo-decision-9B.

La model card únicamente indica que el modelo mayor de la familia, karpo-decision-31B, es el número 1 del Decision Index de los mantenedores, con una puntuación Full de 73,9 en sus pruebas privadas (edición 0.4.1, tablero del 12 de noviembre de 2026, 300 entradas) y un índice público de 75,0. No se proporcionan cifras para el 9B.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 16,8 GB en bf16; se necesita una GPU con al menos 17-20 GB de VRAM, y más para peticiones largas con contexto cercano a 32.768 tokens.
- GPU recomendadas: A100 (40 u 80 GB), H100, L40S o RTX 6000 Ada para producción; una RTX 4090 (24 GB) es suficiente para los pesos, aunque el margen para contexto largo es limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB); no cabe en GPUs de 16 GB o menos sin cuantización, y no se documentan variantes cuantizadas.
- Opciones de despliegue: el autor proporciona la librería `karpo-decision` (extra `qwen`) con Python 3.12 o superior y una GPU, además del servidor HTTP basado en `torchrun`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota importante: cargar el checkpoint como un modelo conversacional plano no reproduce sus respuestas; es necesario usar el código de inferencia específico.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Decisión estructurada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| karpo-decision-9B | Qwen3.5-9B | 8,4B | 32.768 | Sí (readout, choice/noul/score) | MachinePulse Community | Hugging Face |
| karpo-decision-12B | Gemma 4 12B | 12,0B | no disponible | Sí | MachinePulse Community | Hugging Face |
| karpo-decision-31B | Gemma 4 31B | 31,3B | no disponible | Sí (#1 Decision Index de los mantenedores) | MachinePulse Community | Hugging Face |
| karpo-decision-4B | Qwen3.5-4B | 4,5B | no disponible | Sí | MachinePulse Community | Hugging Face |
| Qwen3.5-9B (base) | - | ~9B | no disponible | No: generación de texto libre | según modelo base | Hugging Face |

Las alternativas de la misma categoría fuera de la familia Karpo no están documentadas en la información disponible.

## Limitaciones y advertencias

- Solo admite tres tipos de pregunta (`choice`, `noul`, `score`); no es un modelo generativo y no puede producir texto libre, planes de acción ni explicaciones.
- No puede usarse como modelo conversacional: la model card advierte explícitamente que cargarlo como chat model no reproduce sus respuestas.
- Contexto limitado a 32.768 tokens por secuencia; las peticiones largas se trocean por preguntas y requieren más memoria.
- Idiomas soportados no disponibles, por lo que no se puede confirmar el rendimiento multilingüe.
- No se documentan sesgos conocidos ni tasas de alucinación, pero al ser un ajuste fino de un LLM base hereda los sesgos de Qwen3.5-9B; la probabilidad de cada opción debe calibrarse y validarse en el dominio de producción.
- La licencia permite uso comercial, pero los productos y servicios ofrecidos a terceros deben mostrar "Powered by karpo-decision (MachinePulse)", y el uso en producción con fines comerciales por entidades con ingresos anuales superiores a 10 millones de dólares requiere un acuerdo comercial.
- No hay datos de benchmarks públicos para este tamaño; las cifras de rendimiento de la familia corresponden al modelo de 31B.
- Solo hay soporte documentado para el stack `karpo-decision` con `torchrun`; no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- El modelo se publicó el 12 de noviembre de 2026 con 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MachinePulseAI/karpo-decision-9B
- Licencia: https://huggingface.co/MachinePulseAI/karpo-decision-9B/blob/main/LICENSE
- Repositorio de inferencia: https://github.com/machinepulse-ai/karpo-decision
- Modelo hermano 31B: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo hermano 12B: https://huggingface.co/MachinePulseAI/karpo-decision-12B
- Modelo hermano 4B: https://huggingface.co/MachinePulseAI/karpo-decision-4B
- Modelo hermano 2B: https://huggingface.co/MachinePulseAI/karpo-decision-2B
- Modelo hermano 0.8B: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B
- Decision Index (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
- FlexDM: https://github.com/1000luca/FlexDM
- jev-brain: https://github.com/wcole3/jev-brain
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
