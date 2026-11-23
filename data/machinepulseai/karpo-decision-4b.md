# MachinePulseAI/karpo-decision-4B

## Resumen

Karpo Decision 4B es un modelo de decisión desarrollado por MachinePulseAI, afinado a partir de Qwen/Qwen3.5-4B. A diferencia de un modelo generativo convencional, no produce texto: dado un estado (una página web, un documento, una conversación o cualquier texto o JSON) y un conjunto de preguntas tipadas sobre ese estado, devuelve una probabilidad para cada opción de cada pregunta en una sola pasada hacia delante. El modelo implementa una lectura lineal (readout) sobre las opciones en lugar de decodificación autoregresiva.

Con 4.539.265.536 parámetros en bf16 más un readout de 255 × 2.560 en fp32, el modelo maneja tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (verdadero o falso) y `score` (un nivel en una escala). Soporta entradas de texto o JSON y una captura de pantalla en `state.viewport_screenshot`, con una longitud de contexto de 32.768 tokens por secuencia.

Su relevancia radica en el enfoque: al eliminar la generación de texto, la respuesta siempre es una de las opciones proporcionadas, lo que reduce el riesgo de alucinación en tareas de clasificación y decisión estructurada. Forma parte de la familia Karpo Decision, que abarca modelos desde 0,8B hasta 31B, y se distribuye bajo licencia Apache-2.0 con interfaces de API Python y servidor HTTP en el formato System One.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal) sobre Qwen3.5-4B, con readout lineal |
| Parametros totales | 4.539.265.536 (4,5B en bf16) + readout 255 × 2.560 en fp32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 9,1 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Pipeline | text-classification |
| Tipos de pregunta | choice (hasta 255 opciones), noul (true/false), score (nivel en escala) |
| Entradas | texto o JSON, y captura de pantalla en state.viewport_screenshot |
| Interfaces | API Python y servidor HTTP (POST /v1/systemone, GET /healthz) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-4B y emplea una arquitectura transformer híbrida: las capas de atención completa leen la secuencia completa en ambas direcciones, mientras que las capas de atención lineal la leen en orden, de modo que las preguntas se sitúan antes del estado. La innovación principal es el mecanismo de decisión: cada opción se etiqueta con un código de opción y, en el punto de lectura que cierra cada pregunta, un readout lineal puntúa 255 códigos de opción; una softmax sobre las opciones de esa pregunta concreta produce las probabilidades. No se decodifica nada, por lo que la respuesta es siempre una de las opciones disponibles.

Una solicitud consiste en un estado y cualquier número de preguntas, codificadas como una única secuencia: primero la lista de preguntas, después el estado y luego cada pregunta de nuevo con sus opciones y un punto de lectura. El diseño de lista de preguntas primero sigue a FlexDM y jev-brain. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Decisión estructurada: devuelve probabilidades sobre opciones predefinidas en lugar de generar texto libre.
- Preguntas de tipo `choice` con hasta 255 opciones por pregunta.
- Preguntas de tipo `noul` (verdadero/falso) con probabilidad de verdadero.
- Preguntas de tipo `score` para evaluar un nivel en una escala.
- Procesamiento de múltiples preguntas en una sola pasada hacia delante.
- Entrada de texto o JSON como estado.
- Soporte de captura de pantalla como parte del estado (image-text-to-text).
- Contexto largo de 32.768 tokens por secuencia, con división automática de solicitudes largas por preguntas.
- Interfaz de servidor HTTP compatible con el formato System One.
- No soporta generación de texto, tool calling ni razonamiento multi-paso en el sentido generativo; su función es la clasificación y decisión.

## Casos de uso

- Moderación de contenido con categorías predefinidas: dado un texto y una pregunta `choice` con las categorías de política, el modelo devuelve la probabilidad de cada una sin generar explicaciones, lo que facilita umbrales de decisión auditables.
- Enrutamiento de tickets de soporte: con un estado que contenga la conversación y una pregunta `choice` con los equipos disponibles, el modelo asigna el ticket al equipo más probable en una sola pasada.
- Evaluación de elegibilidad en políticas de devolución: como en el ejemplo de la model card, dado el pedido y la política, responde a preguntas `noul` (¿es elegible?) y `choice` (¿qué acción tomar?) con confianza asociada.
- Clasificación de documentos con capturas de pantalla: al aceptar una imagen en `viewport_screenshot`, puede decidir sobre el contenido visual de una página web o interfaz junto con el texto del estado.
- Puntuación de calidad o riesgo: mediante preguntas `score`, evalúa un nivel en una escala (por ejemplo, gravedad de una incidencia) con probabilidades por nivel.
- Automatización de flujos de decisión en agentes: al no generar texto, encaja como componente de decisión determinista en pipelines donde se requiere que la salida sea siempre una opción válida, reduciendo el riesgo de respuestas fuera de formato.
- Análisis de conversaciones multi-turno: con 32.768 tokens de contexto, puede procesar historiales largos y responder preguntas estructuradas sobre ellos.

## Benchmarks y rendimiento

La model card menciona el Decision Index 0.3 public suite y que el modelo mayor de la familia (karpo-decision-31B) alcanza el puesto #1 con una puntuación Full de 73,9 en tests privados (edición 0.4.1, tablero del 12 de noviembre de 2026, 300 entradas) y un índice público de 75,0. Sin embargo, no se proporcionan resultados numéricos específicos para karpo-decision-4B en la información disponible.

No se han publicado resultados de benchmarks específicos de karpo-decision-4B en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 9,1 GB en bf16; solicitudes largas requieren más memoria.
- GPU recomendadas: se requiere una GPU; no se especifican modelos concretos en la información disponible.
- No se confirma si cabe en GPU de consumo; con 9,1 GB de pesos en bf16, sería ajustado en GPUs de 12 GB y holgado en 16 GB o más, pero no hay dato oficial.
- Opciones de despliegue: API Python (`karpo_decision.decider.Decider`) y servidor HTTP propio (`torchrun ... -m karpo_decision.serve.server`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de software: Python 3.12 o superior y el extra `qwen` del paquete `karpo-decision`.
- Latencia y throughput: no disponibles.
- Nota importante: cargar el checkpoint como un modelo de chat convencional no reproduce sus respuestas.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| karpo-decision-4B | Qwen3.5 4B | 4,5B | 32.768 | Apache-2.0 | Decisión por readout |
| karpo-decision-2B | Qwen3.5 2B | 2,2B | no disponible | Apache-2.0 | Decisión por readout |
| karpo-decision-9B | Qwen3.5 9B | 8,4B | no disponible | Apache-2.0 | Decisión por readout |
| karpo-decision-12B | Gemma 4 12B | 12,0B | no disponible | Apache-2.0 | Decisión por readout |
| karpo-decision-31B | Gemma 4 31B | 31,3B | no disponible | Apache-2.0 | Decisión por readout |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, salvo la mención de que el 31B lidera el Decision Index. No se han identificado en la información disponible modelos de decisión comparables de otros autores.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni responde a instrucciones abiertas; solo devuelve probabilidades sobre opciones predefinidas.
- Cargar el checkpoint como un modelo de chat convencional no reproduce sus respuestas; requiere el código de inferencia específico.
- La respuesta está restringida a las opciones proporcionadas; si las opciones son incorrectas o incompletas, la decisión será incorrecta.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación en el sentido generativo, ni limitaciones idiomáticas.
- Los idiomas soportados no están documentados.
- No se especifican restricciones adicionales de licencia para uso comercial más allá de Apache-2.0.
- El modelo tiene 452 descargas y 0 likes en el momento de la consulta, lo que indica una adopción limitada y poca validación comunitaria.
- No se documentan resultados de benchmarks específicos para esta variante de 4B.
- La fecha de creación (noviembre de 2026) y las referencias a Qwen3.5 y Gemma 4 indican que se apoya en modelos base recientes; conviene verificar su disponibilidad y estabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MachinePulseAI/karpo-decision-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de inferencia: https://github.com/machinepulse-ai/karpo-decision
- Modelo karpo-decision-31B: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo karpo-decision-12B: https://huggingface.co/MachinePulseAI/karpo-decision-12B
- Modelo karpo-decision-9B: https://huggingface.co/MachinePulseAI/karpo-decision-9B
- Modelo karpo-decision-2B: https://huggingface.co/MachinePulseAI/karpo-decision-2B
- Modelo karpo-decision-0.8B: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B
- Decision Index (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
- FlexDM: https://github.com/1000luca/FlexDM
- jev-brain: https://github.com/wcole3/jev-brain
- Licencia: https://huggingface.co/MachinePulseAI/karpo-decision-4B/blob/main/LICENSE
