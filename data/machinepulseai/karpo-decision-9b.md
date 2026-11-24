# MachinePulseAI/karpo-decision-9B

## Resumen

Karpo Decision 9B es un modelo de decisión desarrollado por MachinePulseAI, afinado a partir de Qwen/Qwen3.5-9B. No es un modelo generativo al uso: dado un estado (una página web, un documento, una conversación, cualquier texto o JSON, opcionalmente con una captura de pantalla) y un conjunto de preguntas tipadas sobre ese estado, devuelve una probabilidad para cada opción de cada pregunta en un único forward pass, sin decodificar texto. Esto lo convierte en una pieza adecuada para integrarse en pipelines de agentes y sistemas de automatización donde se necesita una señal de decisión estructurada y determinista.

La arquitectura parte del transformer híbrido de Qwen3.5-9B (capas de atención completa combinadas con capas de atención lineal) y añade un readout lineal de 255 × 4.096 en fp32 sobre los códigos de opción. El modelo soporta tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (verdadero/falso) y `score` (un nivel en una escala). El contexto es de 32.768 tokens por secuencia, y las peticiones más largas se dividen por preguntas, cada parte con el estado completo.

Es relevante ahora porque propone un patrón distinto al de los LLM generativos para tareas de clasificación y enrutamiento: en lugar de generar texto y parsearlo, el modelo emite directamente distribuciones de probabilidad sobre opciones predefinidas, lo que simplifica la integración, reduce la latencia y elimina el riesgo de respuestas fuera de formato. Forma parte de una familia de seis tamaños (0,8B a 31B) construida sobre distintos modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal) con readout lineal sobre códigos de opción |
| Parametros totales | 8.392.695.024 (8,4B) en bf16, más un readout de 255 × 4.096 en fp32 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia; peticiones más largas se dividen por preguntas |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repo de 16,8 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-9B, un transformer con atención híbrida: las capas de atención completa leen la secuencia completa en ambas direcciones, mientras que las capas de atención lineal la leen en orden. Sobre ese backbone se añade un readout lineal que, en el punto de lectura que cierra cada pregunta, puntúa 255 códigos de opción; una softmax sobre las opciones propias de la pregunta produce las probabilidades. No se decodifica texto, por lo que la respuesta es siempre una de las opciones definidas.

Una petición se codifica como una única secuencia con el siguiente orden: la lista de preguntas, el estado y, a continuación, cada pregunta de nuevo con sus opciones y su punto de lectura. Este diseño permite resolver muchas preguntas en un solo forward pass. El layout con la lista de preguntas al principio sigue los trabajos FlexDM y jev-brain. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Clasificación y decisión estructurada: devuelve probabilidades sobre opciones para preguntas de tipo `choice`, `noul` (verdadero/falso) y `score` (nivel en una escala).
- Entrada multimodal: acepta texto o JSON y, opcionalmente, una captura de pantalla en `state.viewport_screenshot`.
- Resolución de múltiples preguntas en un único forward pass sobre el mismo estado.
- Contexto largo de 32.768 tokens, con división automática por preguntas para peticiones más largas.
- Interfaz de servidor HTTP compatible con el formato System One (`POST /v1/systemone`, `GET /healthz`).
- API de Python mediante la clase `Decider`.
- No genera texto libre: la salida es siempre una distribución sobre opciones predefinidas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes y razonamiento multi-paso: no documentados como capacidades nativas del modelo; su uso en agentes se plantea como componente de decisión.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y un conjunto de categorías, el modelo devuelve la probabilidad de cada categoría en un solo forward pass, lo que permite umbrales de confianza y derivación automática a un humano cuando la probabilidad máxima es baja.
- Evaluación de políticas en atención al cliente: con el estado de un pedido y las reglas de la política, se formulan preguntas `noul` (por ejemplo, si una devolución es elegible) y `choice` (acción a tomar: reembolsar, rechazar, escalar), devolviendo probabilidades por acción.
- Moderación y clasificación de contenido: clasificación de textos o conversaciones en categorías predefinidas con salida probabilística, útil para priorizar revisiones y calibrar umbrales.
- Automatización de flujos con capturas de pantalla: al aceptar una imagen en `state.viewport_screenshot`, puede decidir el siguiente paso en un flujo de navegador o interfaz gráfica a partir del estado visual y textual.
- Puntuación de calidad o riesgo: con preguntas de tipo `score`, asigna un nivel en una escala a documentos o interacciones, aprovechable para priorización y monitorización.
- Componente de decisión en pipelines de agentes: al no generar texto, encaja como módulo determinista que selecciona entre opciones discretas dentro de un agente mayor, con menor latencia y sin riesgo de formato inválido.
- Extracción de señales estructuradas de documentos largos: gracias a los 32.768 tokens de contexto, puede evaluar contratos o informes extensos con varias preguntas en una sola pasada.

## Benchmarks y rendimiento

La model card menciona la Decision Index 0.3 public suite y una gráfica de score frente a tamaño, pero no proporciona resultados numéricos para karpo-decision-9B. El único dato numérico concreto corresponde al modelo mayor de la familia (karpo-decision-31B), que ocupa el puesto #1 de la Decision Index con un Full score de 73,9 en las pruebas privadas de los mantenedores (edición 0.4.1, tablero del 12 de noviembre de 2026, 300 entradas) y un índice público de 75,0. Para el modelo de 9B no se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los pesos ocupan 16,8 GB en bf16; se necesita una GPU con al menos esa capacidad, y más memoria para peticiones largas.
- El readout añade 255 × 4.096 parámetros en fp32, un coste despreciable frente al total.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, una GPU de 24 GB o más (por ejemplo, RTX 4090, A100, H100) es el rango natural para bf16.
- No se documenta soporte de cuantización ni despliegue en GPU de consumo con menos de 16,8 GB de VRAM.
- Opciones de despliegue: API de Python (`Decider`) y servidor HTTP propio lanzado con `torchrun` (`karpo_decision.serve.server`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Requisitos de entorno: Python 3.12 o superior y una GPU.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| karpo-decision-9B | Qwen3.5 9B | 8,4B | 32.768 | Apache-2.0 | Modelo de decisión con readout lineal |
| karpo-decision-12B | Gemma 4 12B | 12,0B | No disponible | No disponible | Misma familia, mayor tamaño |
| karpo-decision-4B | Qwen3.5 4B | 4,5B | No disponible | No disponible | Misma familia, menor tamaño |
| karpo-decision-31B | Gemma 4 31B | 31,3B | No disponible | No disponible | #1 en Decision Index (Full score 73,9) |

No se dispone de datos de benchmarks del modelo de 9B que permitan una comparación cuantitativa con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- No es un modelo de chat: cargar el checkpoint como modelo conversacional no reproduce sus respuestas, según advierte la model card.
- La salida está restringida a las opciones definidas en cada pregunta; no puede generar respuestas abiertas.
- El límite de 255 opciones por pregunta condiciona el diseño de las tareas de clasificación.
- Las peticiones que superan los 32.768 tokens se dividen por preguntas, lo que puede afectar a la coherencia entre preguntas que dependen unas de otras.
- No se documentan sesgos conocidos, tasas de alucinación ni comportamiento multilingüe.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base Qwen3.5-9B para uso comercial en producción.
- No se documentan opciones de cuantización, lo que limita el despliegue en hardware con menos de 16,8 GB de VRAM.
- El proyecto es reciente (creado el 12 de noviembre de 2026) y con pocas descargas (420) y likes (1), por lo que la madurez del ecosistema y el soporte comunitario son limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MachinePulseAI/karpo-decision-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de inferencia: https://github.com/machinepulse-ai/karpo-decision
- Modelo hermano de 31B: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo hermano de 12B: https://huggingface.co/MachinePulseAI/karpo-decision-12B
- Modelo hermano de 4B: https://huggingface.co/MachinePulseAI/karpo-decision-4B
- Modelo hermano de 2B: https://huggingface.co/MachinePulseAI/karpo-decision-2B
- Modelo hermano de 0,8B: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
- FlexDM: https://github.com/1000luca/FlexDM
- jev-brain: https://github.com/wcole3/jev-brain
- Licencia: https://huggingface.co/MachinePulseAI/karpo-decision-9B/blob/main/LICENSE
