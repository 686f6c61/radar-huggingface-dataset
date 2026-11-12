# MachinePulseAI/karpo-decision-2B

## Resumen

Karpo Decision 2B es un modelo de decisión de la familia Karpo Decision, desarrollado por MachinePulseAI y afinado a partir de Qwen/Qwen3.5-2B. A diferencia de un modelo generativo convencional, no produce texto: dado un estado (una página web, un documento, una conversación o cualquier texto o JSON, opcionalmente con una captura de pantalla) y un conjunto de preguntas tipadas sobre ese estado, devuelve una probabilidad para cada opción de cada pregunta en un único forward pass. La salida es siempre una de las opciones definidas, lo que elimina el riesgo de respuestas fuera de formato.

El modelo incorpora una readout lineal de 255 × 2.048 en fp32 sobre las representaciones del modelo base, lo que le permite puntuar hasta 255 códigos de opción y aplicar softmax sobre las opciones de cada pregunta. Soporta tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (verdadero/falso) y `score` (un nivel en una escala). La ventana de contexto es de 32.768 tokens por secuencia; las peticiones más largas se dividen por preguntas, cada una con el estado completo.

Su relevancia actual radica en que propone un paradigma distinto al de los LLM generativos para tareas de clasificación y enrutamiento: en lugar de generar y parsear, se puntúa directamente, con menor latencia y mayor consistencia. El modelo se distribuye con licencia MachinePulse Community, que permite uso comercial con atribución y exige acuerdo comercial para entidades con ingresos anuales superiores a 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (capas de atención completa bidireccional y capas de atención lineal causal), con readout lineal sobre códigos de opción |
| Parametros totales | 2.213.241.664 (2,2B en bf16) más readout de 255 × 2.048 en fp32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia; peticiones más largas se dividen por preguntas |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | MachinePulse Community License (machinepulse-community) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B y se afina como modelo de decisión. La arquitectura es un transformer con atención híbrida: las capas de atención completa leen la secuencia completa en ambas direcciones, mientras que las capas de atención lineal la leen en orden, de modo que la lista de preguntas precede al estado en la secuencia. La entrada se codifica como una única secuencia que contiene la lista de preguntas, el estado y, a continuación, cada pregunta con sus opciones y un punto de readout. En ese punto, una readout lineal puntúa 255 códigos de opción y un softmax sobre las opciones de la pregunta produce las probabilidades. No se decodifica texto en ningún momento.

El diseño de disposición "preguntas primero" sigue los proyectos FlexDM y jev-brain. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card indica explícitamente que cargar el checkpoint como un modelo de chat convencional no reproduce sus respuestas, lo que confirma que el afinado modifica el comportamiento de forma sustancial respecto al modelo base.

## Capacidades

- Clasificación y decisión sobre estados de texto o JSON: devuelve probabilidades sobre opciones predefinidas sin generar texto.
- Preguntas de tipo `choice` con hasta 255 opciones por pregunta.
- Preguntas de tipo `noul` (verdadero/falso) con probabilidad de verdadero.
- Preguntas de tipo `score` (nivel en una escala).
- Procesamiento de múltiples preguntas en un único forward pass.
- Entrada multimodal: admite una captura de pantalla en `state.viewport_screenshot` como imagen en base64 (image-text-to-text).
- Soporte de contexto largo de hasta 32.768 tokens por secuencia.
- Interfaz Python (`Decider`) y servidor HTTP con endpoint `POST /v1/systemone` y `GET /healthz`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No soporta tool calling ni generación de texto; no es un modelo de agentes en el sentido generativo.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una reclamación y una política de devoluciones, el modelo devuelve la probabilidad de elegibilidad (`noul`) y la acción recomendada (`choice` entre reembolsar, rechazar o escalar), como muestra el ejemplo de la model card. Es adecuado porque la salida es siempre una de las opciones definidas y no requiere parseo.
- Moderación de contenido: clasificar un mensaje o publicación en categorías predefinidas (permitido, revisar, bloquear) con una sola pasada, sin generación, lo que reduce latencia y coste frente a un LLM generativo.
- Extracción de decisiones en formularios y documentos: dado un JSON o texto de un formulario, responder preguntas tipadas sobre campos y validaciones, con probabilidades que permiten fijar umbrales de confianza.
- Automatización de atención al cliente con capturas de pantalla: usando `viewport_screenshot`, el modelo puede decidir sobre el estado visual de una interfaz (por ejemplo, si un pedido aparece como enviado) combinado con el texto de la conversación.
- Triaje en pipelines de datos: puntuar cada registro con preguntas de tipo `score` para priorizar revisiones humanas según la confianza devuelta.
- Decisión en agentes de navegación web: dado el contenido de una página y una captura, decidir la siguiente acción entre un conjunto acotado de opciones, integrándose en un bucle de agente que no depende de generación de texto libre.
- Clasificación multietiqueta en producción: al devolver probabilidades por opción, permite umbrales configurables y calibración por caso de uso sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para karpo-decision-2B. La model card únicamente menciona que el modelo mayor de la familia, karpo-decision-31B, ocupa el puesto #1 en el Decision Index con una puntuación Full de 73,9 en las pruebas privadas de los mantenedores (edición 0.4.1, tablero del 12 de noviembre de 2026, 300 entradas) y un índice público de 75,0. No se proporcionan cifras para el modelo de 2B.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan 4,4 GB; se recomienda al menos 8 GB de VRAM para acomodar pesos y estados intermedios, y más para peticiones largas (hasta 32.768 tokens).
- GPU recomendadas: una GPU con al menos 8-16 GB de VRAM; para contextos largos, A100 o H100 son adecuadas. Una RTX 4090 (24 GB) es suficiente para la mayoría de casos.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: el paquete oficial `karpo-decision[qwen]` con Python 3.12 o superior y una GPU; servidor HTTP propio con `torchrun` en el puerto 18440. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Al no generar texto y resolver todas las preguntas en un único forward pass, la latencia debería ser menor que la de un modelo generativo del mismo tamaño, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| karpo-decision-2B | 2,2B | 32.768 tokens | Decisión por readout lineal, sin generación | MachinePulse Community | Hugging Face |
| karpo-decision-4B | 4,5B | no disponible | Decisión por readout lineal | MachinePulse Community | Hugging Face |
| karpo-decision-0.8B | 0,85B | no disponible | Decisión por readout lineal | MachinePulse Community | Hugging Face |
| Qwen/Qwen3.5-2B (modelo base) | 2B | no disponible | LLM generativo | según Qwen | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, tool calling ni razonamiento multi-paso; solo puntúa opciones predefinidas.
- Cargar el checkpoint como un modelo de chat convencional no reproduce sus respuestas; es necesario usar el código de inferencia oficial.
- El contexto máximo es de 32.768 tokens por secuencia; las peticiones más largas se dividen por preguntas, lo que puede afectar a la coherencia entre preguntas.
- No se documentan los idiomas soportados; se desconoce el rendimiento en castellano y en otros idiomas distintos del inglés.
- No se han publicado benchmarks para este tamaño, por lo que no hay evidencia pública de su precisión frente a alternativas.
- Riesgo de alucinación: al ser un readout sobre opciones, la salida siempre es una opción válida, pero la probabilidad puede ser incorrecta o mal calibrada; se recomienda usar el campo `confidence` y umbrales.
- Licencia MachinePulse Community: el uso comercial está permitido, pero los productos y servicios ofrecidos a terceros deben mostrar "Powered by karpo-decision (MachinePulse)"; el uso en producción comercial por entidades con ingresos anuales (junto con afiliadas) superiores a 10 millones de dólares requiere un acuerdo comercial.
- Sesgos: no se documentan sesgos conocidos; al derivar de Qwen3.5-2B, puede heredar sesgos del modelo base y de los datos de afinado, no publicados.
- No se documentan cuantizaciones oficiales; el despliegue en hardware limitado requiere verificar la conversión a otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MachinePulseAI/karpo-decision-2B
- Licencia: https://huggingface.co/MachinePulseAI/karpo-decision-2B/blob/main/LICENSE
- Repositorio de inferencia: https://github.com/machinepulse-ai/karpo-decision
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo mayor de la familia: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo 12B: https://huggingface.co/MachinePulseAI/karpo-decision-12B
- Modelo 9B: https://huggingface.co/MachinePulseAI/karpo-decision-9B
- Modelo 4B: https://huggingface.co/MachinePulseAI/karpo-decision-4B
- Modelo 0.8B: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B
- Decision Index (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Decision Index (kit): https://github.com/apolinario/decision-index
- FlexDM: https://github.com/1000luca/FlexDM
- jev-brain: https://github.com/wcole3/jev-brain
