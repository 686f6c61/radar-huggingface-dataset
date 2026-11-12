# MachinePulseAI/karpo-decision-0.8B

## Resumen

Karpo Decision 0.8B es un modelo de decisión de la familia Karpo Decision, desarrollado por MachinePulseAI. No es un modelo generativo al uso: dado un estado (una página web, un documento, una conversación, cualquier texto o JSON) y un conjunto de preguntas tipadas sobre ese estado, devuelve una probabilidad para cada opción de cada pregunta en un único forward pass, sin generar texto. Se trata, por tanto, de un modelo de clasificación y puntuación de decisiones, no de un chat.

El modelo se obtiene por fine-tuning de Qwen/Qwen3.5-0.8B e incorpora una cabeza de lectura lineal sobre las opciones. Con 852.985.920 parámetros en bf16 (más un readout de 255 × 1.024 en fp32), está pensado para inferencia de bajo coste en una sola GPU. Soporta tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (verdadero o falso) y `score` (un nivel en una escala), y acepta tanto texto como JSON, además de una captura de pantalla en `state.viewport_screenshot`.

Su relevancia radica en el enfoque: en lugar de decodificar texto libre, restringe la respuesta a un conjunto finito de opciones y devuelve distribuciones de probabilidad calibradas, lo que facilita su integración en pipelines de decisión automatizada (enrutamiento, clasificación, control de agentes) donde se necesita una señal determinista y acotada. Forma parte de una familia que va desde 0,85B hasta 31,3B parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (capas de atención completa y capas de atención lineal) sobre Qwen3.5, con cabeza de lectura lineal (readout) sobre códigos de opción |
| Parametros totales | 852.985.920 (~0,85B) en bf16, más un readout de 255 × 1.024 en fp32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia; las peticiones más largas se dividen por preguntas, cada parte con el estado completo |
| Tipos de cuantizacion | no disponible (los pesos publicados están en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | MachinePulse Community License (comercial permitida con atribución; uso comercial en producción por entidades con ingresos anuales superiores a 10 M USD requiere acuerdo comercial) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y se ajusta como modelo de decisión con una cabeza de lectura lineal. La arquitectura es un transformer híbrido: las capas de atención completa leen la secuencia completa en ambas direcciones, mientras que las capas de atención lineal la leen en orden, de modo que las preguntas preceden al estado en la codificación. Una petición se codifica como una única secuencia: la lista de preguntas, el estado y, a continuación, cada pregunta de nuevo con sus opciones y un punto de lectura. En ese punto de lectura, una capa lineal puntúa 255 códigos de opción y un softmax sobre las opciones propias de la pregunta produce las probabilidades. No se decodifica nada, por lo que la respuesta siempre es una de las opciones disponibles.

El diseño de disposición "preguntas primero" sigue a FlexDM y jev-brain. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. La innovación principal es el propio mecanismo de decisión: múltiples preguntas resueltas en un solo forward pass mediante un readout lineal, en lugar de generación autoregresiva.

## Capacidades

- Clasificación de decisiones: devuelve una probabilidad para cada opción de cada pregunta en una sola pasada.
- Preguntas de tipo `choice` con hasta 255 opciones.
- Preguntas de tipo `noul` (verdadero o falso) con probabilidad P(true).
- Preguntas de tipo `score` (un nivel en una escala).
- Entrada multimodal: acepta texto, JSON y una captura de pantalla en `state.viewport_screenshot` (formato image_url con data URI base64).
- Múltiples preguntas sobre un mismo estado en una única petición.
- Salida con probabilidades por opción y un valor de confianza.
- Interfaz de API Python y servidor HTTP en formato System One (`POST /v1/systemone`, `GET /healthz`).
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso generativo; su función es la puntuación de opciones.

## Casos de uso

- Enrutamiento y triaje de tickets de soporte: dado el texto de una incidencia y un conjunto de categorías (`choice`), el modelo devuelve la probabilidad de cada categoría en un solo forward pass, lo que permite dirigir el ticket al equipo adecuado sin generación de texto.
- Evaluación de políticas y elegibilidad: con un estado que describa un pedido y la política aplicable, una pregunta `noul` responde si el caso es elegible y una pregunta `choice` sugiere la acción (reembolso, rechazo, escalado), como en el ejemplo de la model card.
- Moderación y clasificación de contenido: usar `noul` para decidir si un texto cumple una política concreta y `score` para graduar la severidad, con probabilidades calibradas para umbrales ajustables.
- Control de agentes y sistemas "system one": puntuar acciones candidatas de un agente ante un estado dado (texto o JSON) y seleccionar la de mayor probabilidad, integrándolo vía HTTP en el bucle de decisión.
- Análisis de interfaces mediante capturas: al aceptar una screenshot en `state.viewport_screenshot`, puede puntuar opciones sobre el estado visual de una página o aplicación.
- Extracción de decisiones en pipelines de documentos: dado un documento extenso (hasta 32.768 tokens por secuencia, con división por preguntas para estados mayores), responder múltiples preguntas tipadas sobre él en una sola llamada.
- Señal de confianza para revisión humana: al devolver `confidence` junto con las probabilidades, permite derivar a revisión manual los casos con baja certeza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo 0.8B en la información disponible. La model card únicamente indica que el modelo mayor de la familia, karpo-decision-31B, ocupa el puesto #1 en el Decision Index con una puntuación Full de 73,9 en las pruebas privadas de los mantenedores (edición 0.4.1, tablero del 12 de noviembre de 2026, 300 entradas) y un índice público de 75,0. No se aportan métricas para el modelo de 0,85B.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 1,7 GB en bf16; las peticiones largas requieren más memoria. Una GPU con 8 GB o más es suficiente para secuencias moderadas.
- GPU recomendadas: una sola GPU; válidas tanto consumer (RTX 3090, RTX 4090) como de datacenter (A100, H100). El modelo está pensado para ejecutarse con `torchrun --nproc_per_node 1`.
- Cabe en GPU consumer: sí, dado su tamaño de 0,85B parámetros.
- Opciones de despliegue: servidor HTTP propio incluido en el paquete `karpo-decision` (`POST /v1/systemone`); carga mediante la API `Decider` de la librería. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; cargar el checkpoint como modelo de chat convencional no reproduce sus respuestas.
- Latencia y throughput: no disponibles.
- Requisitos de software: Python 3.12 o superior y una GPU; instalación con el extra `qwen`.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| karpo-decision-0.8B | Qwen3.5 0.8B | 0,85B | 32.768 | Decisión por readout lineal | MachinePulse Community |
| karpo-decision-2B | Qwen3.5 2B | 2,2B | no disponible | Decisión por readout lineal | MachinePulse Community |
| karpo-decision-4B | Qwen3.5 4B | 4,5B | no disponible | Decisión por readout lineal | MachinePulse Community |
| karpo-decision-9B | Qwen3.5 9B | 8,4B | no disponible | Decisión por readout lineal | MachinePulse Community |
| karpo-decision-12B | Gemma 4 12B | 12,0B | no disponible | Decisión por readout lineal | MachinePulse Community |
| karpo-decision-31B | Gemma 4 31B | 31,3B | no disponible | Decisión por readout lineal | MachinePulse Community |

No se dispone de datos de rendimiento comparativo entre los miembros de la familia en la información proporcionada, salvo la posición del modelo de 31B en el Decision Index.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de Qwen3.5, puede heredar sesgos del modelo base.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que la respuesta se restringe a las opciones proporcionadas; el riesgo se traslada a una mala calibración de probabilidades o a la elección de opciones mal definidas por el usuario.
- Limitaciones de contexto o idioma: contexto de 32.768 tokens por secuencia; los estados más largos se dividen por preguntas, lo que puede degradar la coherencia global. Los idiomas soportados no están documentados.
- Restricciones de licencia: la MachinePulse Community License permite uso comercial, pero los productos y servicios ofrecidos a terceros deben mostrar "Powered by karpo-decision (MachinePulse)"; el uso en producción con fines comerciales por entidades cuyos ingresos anuales, junto con sus afiliadas, superen los 10 M USD requiere un acuerdo comercial.
- Caveat de producción: cargar el checkpoint como modelo de chat estándar no reproduce sus respuestas; es necesario usar la librería `karpo-decision` y su formato de petición específico.
- El modelo no genera texto ni realiza razonamiento multi-paso; no debe emplearse como sustituto de un LLM conversacional.
- Sin descargas ni likes en el momento de la consulta; ecosistema y validación externa muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B
- Licencia: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B/blob/main/LICENSE
- Repositorio de inferencia: https://github.com/machinepulse-ai/karpo-decision
- Modelo de la familia karpo-decision-31B: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Decision Index (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
- FlexDM: https://github.com/1000luca/FlexDM
- jev-brain: https://github.com/wcole3/jev-brain
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
