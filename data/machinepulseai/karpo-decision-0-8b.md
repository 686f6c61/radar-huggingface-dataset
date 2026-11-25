# MachinePulseAI/karpo-decision-0.8B

## Resumen

Karpo Decision 0.8B es un modelo de decisión desarrollado por MachinePulseAI, afinado a partir de Qwen/Qwen3.5-0.8B. No es un modelo generativo en el sentido habitual: dado un estado (una página web, un documento, una conversación o cualquier texto o JSON, opcionalmente con una captura de pantalla) y una serie de preguntas tipadas sobre ese estado, devuelve en una única pasada hacia delante una probabilidad para cada opción de cada pregunta, sin decodificar texto. Esto lo convierte en una pieza de infraestructura para sistemas que necesitan clasificar, puntuar o seleccionar entre alternativas discretas con latencia mínima y respuestas siempre restringidas al conjunto de opciones.

El modelo tiene 852.985.920 parámetros (0,85B) en bf16, más un readout lineal de 255 × 1.024 en fp32. Soporta tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (verdadero o falso) y `score` (un nivel en una escala). Admite contexto de 32.768 tokens por secuencia y entrada multimodal mediante captura de pantalla en `state.viewport_screenshot`. Forma parte de una familia que va de 0,8B a 31B, todos con licencia Apache-2.0.

Su relevancia actual radica en que cubre un nicho poco atendido por los LLM generativos: la toma de decisiones estructurada y de bajo coste computacional. En lugar de generar una respuesta y parsearla, el modelo produce directamente distribuciones de probabilidad sobre opciones predefinidas, lo que facilita la integración en pipelines deterministas, la evaluación de confianza y el despliegue en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (capas de atención completa bidireccional y capas de atención lineal) sobre base Qwen3.5, con readout lineal para clasificación |
| Parametros totales | 852.985.920 (0,85B) en bf16, más readout de 255 × 1.024 en fp32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia; las peticiones más largas se dividen por preguntas, cada parte con el estado completo |
| Tipos de cuantizacion | no disponible (el autor solo menciona bf16 para los pesos y fp32 para el readout) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se construye mediante fine-tuning sobre Qwen/Qwen3.5-0.8B. La innovación principal es el mecanismo de decisión: en lugar de generar tokens, cada opción se etiqueta con un código de opción y, en el punto de readout que cierra cada pregunta, un readout lineal puntúa 255 códigos de opción; una softmax sobre las opciones propias de la pregunta produce las probabilidades. Nada se decodifica, por lo que la respuesta es siempre una de las opciones disponibles. Una sola pasada hacia delante procesa el estado y cualquier número de preguntas, codificadas como una secuencia única: primero la lista de preguntas, después el estado, y luego cada pregunta de nuevo con sus opciones y su punto de readout.

La atención es híbrida: las capas de atención completa leen toda la secuencia en ambas direcciones, mientras que las capas de atención lineal la leen en orden, de modo que las preguntas preceden al estado. El diseño de disposición "preguntas primero" sigue a FlexDM y jev-brain. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Clasificación de decisiones mediante preguntas de tipo `choice` con hasta 255 opciones, devolviendo probabilidades por opción y un nivel de confianza.
- Preguntas booleanas de tipo `noul` (verdadero o falso) con probabilidad de verdadero.
- Preguntas de tipo `score` para asignar un nivel en una escala.
- Procesamiento de múltiples preguntas en una sola pasada hacia delante, compartiendo el mismo estado.
- Entrada de texto y JSON como estado.
- Entrada multimodal: captura de pantalla en `state.viewport_screenshot` (imagen codificada en base64 vía `image_url`).
- Contexto largo de hasta 32.768 tokens por secuencia, con división automática por preguntas para peticiones más largas.
- Interfaz Python (`Decider`) y servidor HTTP en formato System One (`POST /v1/systemone`, `GET /healthz`).
- Integración con el kit Decision Index mediante `DecisionIndexEngine`.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso generativo; su salida está restringida a las opciones definidas.

## Casos de uso

- Atención al cliente automatizada: dado el texto de una conversación o un pedido y una política, el modelo responde preguntas como "¿es elegible la devolución?" (`noul`) y "¿qué acción debe tomar el agente?" (`choice` con opciones como reembolsar, rechazar o escalar), con probabilidades que permiten umbrales de confianza y derivación a humano.
- Moderación de contenido: clasificar un texto o una captura de pantalla en categorías predefinidas de riesgo mediante preguntas `choice`, con la ventaja de que la respuesta nunca sale del conjunto de etiquetas.
- Enrutamiento de tickets y correos: puntuar (`score`) la urgencia o complejidad de un mensaje y seleccionar (`choice`) el departamento destino en una sola pasada, sin generación de texto.
- Validación de formularios y documentos: comprobar con preguntas `noul` si un documento cumple condiciones concretas (campos presentes, coherencia de datos) y asignar un nivel de calidad con `score`.
- Automatización de agentes web: procesar el estado de una página (texto más captura de pantalla del viewport) para decidir la siguiente acción entre un conjunto acotado de opciones, útil en pipelines de navegación automatizada.
- Evaluación de respuestas y control de calidad: dado un par pregunta-respuesta, decidir con `noul` o `score` si la respuesta es correcta o su grado de calidad, integrándose en sistemas de anotación o filtrado.
- Sistemas de recomendación con reglas: seleccionar entre alternativas (planes, productos, rutas) puntuando cada opción como nivel en una escala, con la distribución completa de probabilidades para ranking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona el Decision Index 0.3 (suite pública, tablero del 12 de noviembre de 2026) y que el modelo mayor de la familia, karpo-decision-31B, alcanza un índice público de 75,0 y un Full score de 73,9 en tests privados, pero no se proporcionan cifras concretas para el modelo 0.8B.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 1,7 GB en bf16; las peticiones largas requieren más memoria. No se dispone de cifras oficiales de VRAM total.
- GPU recomendadas: no disponible en la información proporcionada; el autor indica "una GPU" sin especificar modelo.
- Compatibilidad con GPU de consumo: por tamaño (0,85B en bf16, 1,7 GB de pesos) es plausible que quepa en GPU de consumo, pero no se confirma en la documentación.
- Opciones de despliegue: API Python (`karpo_decision.decider.Decider`) y servidor HTTP propio (`karpo_decision.serve.server`) lanzado con `torchrun`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; de hecho, el autor advierte que cargar el checkpoint como un modelo de chat convencional no reproduce sus respuestas.
- Latencia y throughput: no disponibles.
- Requisitos de software: Python 3.12 o superior, instalación con extra `qwen` desde el repositorio de GitHub.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| karpo-decision-0.8B | Qwen3.5 0.8B | 0,85B | 32.768 | Apache-2.0 | Hugging Face |
| karpo-decision-2B | Qwen3.5 2B | 2,2B | no disponible | Apache-2.0 | Hugging Face |
| karpo-decision-4B | Qwen3.5 4B | 4,5B | no disponible | Apache-2.0 | Hugging Face |
| karpo-decision-9B | Qwen3.5 9B | 8,4B | no disponible | Apache-2.0 | Hugging Face |
| karpo-decision-12B | Gemma 4 12B | 12,0B | no disponible | Apache-2.0 | Hugging Face |
| karpo-decision-31B | Gemma 4 31B | 31,3B | no disponible | Apache-2.0 | Hugging Face |

No se dispone de información sobre modelos comparables de otros desarrolladores con la misma funcionalidad de decisión sin generación. La comparación natural es dentro de la propia familia Karpo Decision, donde el 0.8B es la variante más pequeña y ligera.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre opciones predefinidas. No sirve para tareas de generación abierta.
- Cargar el checkpoint como un modelo de chat convencional no reproduce sus respuestas; requiere el código de inferencia específico (`karpo-decision`).
- El límite de 255 opciones por pregunta `choice` restringe el tamaño del conjunto de decisión.
- Las peticiones que superan los 32.768 tokens se dividen por preguntas, lo que puede introducir inconsistencia entre partes si el estado es muy largo.
- No se dispone de información sobre sesgos conocidos ni sobre el dataset de entrenamiento, lo que dificulta evaluar riesgos de alucinación o sesgo en las probabilidades.
- No se especifican los idiomas soportados; el rendimiento multilingüe es desconocido.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar el archivo LICENSE del repositorio y las condiciones del modelo base Qwen3.5.
- El modelo tiene 330 descargas y 0 likes en el momento de la consulta; la documentación pública es limitada y no hay benchmarks publicados para esta variante concreta.
- La fecha de creación (noviembre de 2026) y la referencia a "Gemma 4" y "Qwen3.5" en la model card deben tratarse con cautela; no se dispone de verificación independiente de estas versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B
- Repositorio de inferencia: https://github.com/machinepulse-ai/karpo-decision
- Modelo hermano 31B: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Decision Index (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
- FlexDM: https://github.com/1000luca/FlexDM
- jev-brain: https://github.com/wcole3/jev-brain
- Licencia: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B/blob/main/LICENSE
