# MachinePulseAI/karpo-decision-4B

## Resumen

Karpo Decision 4B es un modelo de decisión de la familia Karpo Decision, desarrollado por MachinePulseAI. A diferencia de un modelo generativo convencional, no produce texto: dado un estado (una página web, un documento, una conversación, cualquier texto o JSON, y opcionalmente una captura de pantalla) y un conjunto de preguntas tipadas sobre ese estado, devuelve una probabilidad para cada opción de cada pregunta en un único forward pass. Se trata de un fine-tuning de Qwen/Qwen3.5-4B al que se le ha añadido una cabeza de lectura lineal sobre códigos de opción.

El modelo resuelve el problema de la toma de decisiones estructurada y determinista en pipelines automatizados: en lugar de generar texto libre que luego hay que parsear, devuelve directamente distribuciones de probabilidad sobre opciones predefinidas, con tipos de pregunta `choice` (hasta 255 opciones), `noul` (verdadero/falso) y `score` (un nivel en una escala). Esto lo hace adecuado para sistemas de agentes, moderación, enrutamiento y clasificación de alto rendimiento donde la latencia y la consistencia importan.

Con 4.539.265.536 parámetros en bf16 (más una matriz de lectura de 255 × 2.560 en fp32), una ventana de contexto de 32.768 tokens por secuencia y soporte de entrada multimodal (texto/JSON más captura de pantalla), el modelo se posiciona como la variante compacta de una familia que abarca desde 0,85B hasta 31,3B parámetros. Es relevante ahora porque ofrece una alternativa de inferencia sin decodificación generativa, lo que reduce latencia y elimina el riesgo de respuestas fuera del conjunto de opciones permitido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal) con cabeza de lectura lineal, fine-tuned desde Qwen/Qwen3.5-4B |
| Parametros totales | 4.539.265.536 (4,5B en bf16) + matriz de lectura 255 × 2.560 en fp32 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia; peticiones más largas se dividen por preguntas, cada parte con el estado completo |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en bf16; el repo ocupa 9,1 GB) |
| Idiomas soportados | No disponible |
| Licencia | MachinePulse Community License (uso comercial permitido con atribución; uso comercial en producción por entidades con ingresos anuales superiores a 10 M USD requiere acuerdo comercial) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B y se somete a un fine-tuning con una relación de modelo base declarada como `finetune`. La innovación principal es la sustitución de la generación autoregresiva por una cabeza de lectura lineal: cada opción de cada pregunta se etiqueta con un código de opción, y en el punto de lectura que cierra cada pregunta una lectura lineal puntúa 255 códigos de opción; una softmax restringida a las opciones de esa pregunta concreta produce las probabilidades. Nada se decodifica, de modo que la respuesta siempre es una de las opciones permitidas.

La arquitectura combina capas de atención completa, que leen la secuencia en ambas direcciones, con capas de atención lineal, que la leen en orden, de forma que las preguntas se sitúan antes del estado en la secuencia. Una petición se codifica como una única secuencia que contiene la lista de preguntas, el estado y, a continuación, cada pregunta de nuevo con sus opciones y su punto de lectura, lo que permite responder muchas preguntas en un solo forward pass. El diseño de disposición "lista de preguntas primero" sigue los trabajos FlexDM y jev-brain. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Clasificación y decisión estructurada mediante preguntas tipadas: `choice` (hasta 255 opciones), `noul` (verdadero/falso) y `score` (nivel en una escala).
- Entrada de texto o JSON como estado, con soporte opcional de captura de pantalla en `state.viewport_screenshot` (entrada image-text-to-text).
- Respuesta en un único forward pass para múltiples preguntas sobre el mismo estado, sin generación de texto.
- Salida con probabilidades por opción, opción elegida y nivel de confianza.
- Procesamiento de estados largos mediante división por preguntas cuando se supera la ventana de 32.768 tokens.
- Interfaz de servidor HTTP en el formato System One (`POST /v1/systemone`, `GET /healthz`).
- No se documentan capacidades de tool calling, razonamiento multi-paso generativo ni modos de pensamiento, al no ser un modelo generativo.

## Casos de uso

- Atención al cliente automatizada: el modelo puede evaluar el estado de una conversación o de un pedido y decidir entre opciones como reembolsar, rechazar o escalar a un supervisor, devolviendo probabilidades y confianza para cada acción, como se muestra en el ejemplo de la model card con una solicitud de devolución fuera de plazo.
- Enrutamiento y triaje de tickets: dado el texto de una incidencia, preguntas de tipo `choice` permiten asignar categoría, prioridad y equipo responsable en un solo forward pass, reduciendo la latencia frente a un modelo generativo.
- Moderación de contenido: preguntas `noul` (¿viola la política?) y `score` (nivel de gravedad en una escala) permiten obtener una decisión determinista y acotada al conjunto de opciones, sin riesgo de respuestas fuera de formato.
- Automatización de agentes web: con una captura de pantalla en `state.viewport_screenshot` y el DOM o texto de la página como estado, el modelo puede decidir la siguiente acción entre un conjunto acotado de opciones (hacer clic, rellenar, navegar, detenerse).
- Validación de documentos y cumplimiento normativo: dado un contrato o documento JSON, preguntas booleanas y de escala permiten verificar cláusulas y asignar niveles de riesgo de forma consistente y auditable.
- Sistemas de decisión de bajas exigencias de latencia: al no decodificar texto, el coste por petición se limita a un forward pass, lo que resulta adecuado para pipelines de alto volumen con GPU única.
- Clasificación multilingüe de textos o JSON estructurados: siempre que el estado se presente como texto, el modelo puede evaluar preguntas tipadas sobre él; no obstante, no se documentan los idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona que el modelo mayor de la familia, karpo-decision-31B, ocupa el puesto #1 del Decision Index con una puntuación Full de 73,9 en las pruebas privadas de los mantenedores (edición 0.4.1, tablero del 12 de noviembre de 2026, 300 entradas) y un índice público de 75,0. No se proporcionan resultados específicos para karpo-decision-4B.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan 9,1 GB; las peticiones largas requieren memoria adicional. No se especifica una cifra exacta de VRAM total recomendada.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM para cubrir pesos y estados; no se detallan modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Compatibilidad con GPU de consumo: probable en tarjetas con 16 GB o más (por ejemplo, RTX 4090 o RTX 4080), aunque no se confirma oficialmente.
- Opciones de despliegue: API de Python (`karpo_decision.decider.Decider`) y servidor HTTP propio mediante `torchrun` (`karpo_decision.serve.server`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; cargar el checkpoint como modelo de chat convencional no reproduce sus respuestas.
- Requisitos de software: Python 3.12 o superior, una GPU, y el extra `qwen` del paquete `karpo-decision`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| karpo-decision-4B | Qwen3.5 4B | 4,5B | 32.768 tokens | Decisión por lectura lineal | MachinePulse Community |
| karpo-decision-2B | Qwen3.5 2B | 2,2B | No disponible | Decisión por lectura lineal | MachinePulse Community |
| karpo-decision-9B | Qwen3.5 9B | 8,4B | No disponible | Decisión por lectura lineal | MachinePulse Community |
| karpo-decision-31B | Gemma 4 31B | 31,3B | No disponible | Decisión por lectura lineal | MachinePulse Community |

No se dispone de información sobre modelos de decisión comparables de otros desarrolladores ni de resultados de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre y no debe cargarse como un modelo de chat convencional, ya que sus respuestas no se reproducen de esa forma.
- La respuesta está restringida al conjunto de opciones proporcionado; preguntas mal formuladas o con opciones ambiguas degradan la calidad de la decisión.
- Riesgo de sesgos y alucinación no documentado; al no generar texto, el riesgo de alucinación se traslada a la calibración de las probabilidades, sobre la que no hay información publicada.
- Idiomas soportados no disponibles; no se garantiza un rendimiento multilingüe equilibrado.
- Licencia MachinePulse Community: el uso comercial está permitido, pero los productos y servicios ofrecidos a terceros deben mostrar "Powered by karpo-decision (MachinePulse)"; el uso en producción con fines comerciales por entidades con ingresos anuales, junto con sus filiales, superiores a 10 M USD requiere un acuerdo comercial.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 12 de noviembre de 2026; se trata de un modelo reciente con escasa validación externa.
- No se documentan requisitos de memoria para peticiones largas más allá de que "las peticiones largas ocupan más" que los 9,1 GB de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MachinePulseAI/karpo-decision-4B
- Licencia: https://huggingface.co/MachinePulseAI/karpo-decision-4B/blob/main/LICENSE
- Repositorio de inferencia: https://github.com/machinepulse-ai/karpo-decision
- Modelo hermano karpo-decision-31B: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo hermano karpo-decision-12B: https://huggingface.co/MachinePulseAI/karpo-decision-12B
- Modelo hermano karpo-decision-9B: https://huggingface.co/MachinePulseAI/karpo-decision-9B
- Modelo hermano karpo-decision-2B: https://huggingface.co/MachinePulseAI/karpo-decision-2B
- Modelo hermano karpo-decision-0.8B: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B
- Decision Index (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
- FlexDM: https://github.com/1000luca/FlexDM
- jev-brain: https://github.com/wcole3/jev-brain
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
