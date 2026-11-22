# edinlong83/zils-flash-k1

## Resumen

Karpo Decision 9B es un modelo de decisión de la familia Karpo Decision, desarrollado por MachinePulse AI y publicado en Hugging Face bajo el identificador `edinlong83/zils-flash-k1`. A diferencia de un modelo generativo convencional, no produce texto: dado un estado (una página web, un documento, una conversación, cualquier texto o JSON, opcionalmente con una captura de pantalla) y un conjunto de preguntas tipadas sobre ese estado, devuelve una probabilidad para cada opción de cada pregunta en un único forward pass. Está afinado a partir de Qwen/Qwen3.5-9B e incorpora un readout lineal sobre los códigos de opción.

El modelo resuelve el problema de la toma de decisiones estructurada y de baja latencia: en lugar de generar una respuesta y parsearla, la salida es siempre una de las opciones definidas por el usuario, con probabilidades calibradas. Soporta tres tipos de pregunta: `choice` (hasta 255 opciones), `noul` (verdadero o falso) y `score` (un nivel en una escala). La ventana de contexto es de 32.768 tokens por secuencia, y las peticiones más largas se dividen por preguntas, cada una con el estado completo.

Es relevante porque propone una arquitectura de "system one" orientada a inferencia rápida y determinista, con interfaces tanto en Python como en servidor HTTP (`POST /v1/systemone`), y porque forma parte de una familia escalonada de 0,8B a 31B que comparte el mismo formato de decisión. La licencia es Apache-2.0 y los pesos están en formato safetensors (16,8 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (capas de atención completa bidireccional y capas de atención lineal secuencial) con readout lineal sobre códigos de opción; fine-tune de Qwen/Qwen3.5-9B |
| Parametros totales | 8.392.695.024 (8,4B en bf16) más un readout de 255 × 4.096 en fp32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia; peticiones más largas se dividen por preguntas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y se afina como modelo de decisión con un readout lineal añadido. La arquitectura combina capas de atención completa, que leen la secuencia completa en ambas direcciones, y capas de atención lineal, que la leen en orden; el diseño coloca primero la lista de preguntas y después el estado, de modo que las preguntas preceden al estado en las capas lineales. Cada opción se etiqueta con un código de opción; en el punto de readout que cierra cada pregunta, un readout lineal puntúa 255 códigos de opción y un softmax sobre las opciones de esa pregunta concreta produce las probabilidades. No se decodifica texto, por lo que la respuesta es siempre una de las opciones.

Una petición se codifica como una única secuencia que contiene la lista de preguntas, el estado y, a continuación, cada pregunta de nuevo con sus opciones y su punto de readout, lo que permite resolver muchas preguntas en un solo forward pass. La disposición de preguntas primero sigue los proyectos FlexDM y jev-brain. No se han publicado en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Clasificación y decisión estructurada: devuelve probabilidades sobre opciones predefinidas para preguntas de tipo `choice` (hasta 255 opciones), `noul` (verdadero/falso) y `score` (nivel en una escala).
- Procesamiento de estados heterogéneos: acepta texto libre, JSON y capturas de pantalla en `state.viewport_screenshot` (formato `image_url` con data URI base64).
- Resolución de múltiples preguntas en un único forward pass, sin generación de texto y con salida siempre restringida al conjunto de opciones.
- Soporte de razonamiento multi-pregunta sobre un mismo estado, útil para pipelines de decisión con varios criterios.
- Interfaz Python (`Decider`) y servidor HTTP con el formato System One (`POST /v1/systemone`, `GET /healthz`).
- Integración con el kit Decision Index para evaluación.
- Capacidades multilingües: no disponible.
- Tool calling, agentes autónomos y modo thinking: no disponible (no es un modelo generativo).

## Casos de uso

- Atención al cliente automatizada: dado el estado de una conversación o un pedido y preguntas tipadas como "¿es elegible la devolución?" (`noul`) y "¿qué acción tomar?" (`choice` con opciones como reembolsar, rechazar o escalar), el modelo devuelve probabilidades calibradas en una sola pasada, lo que permite umbrales de confianza y derivación a un humano.
- Moderación de contenido: clasificar un texto o una captura de pantalla con preguntas `noul` sobre incumplimiento de políticas y preguntas `choice` sobre la categoría de infracción, sin generar texto libre y con salida acotada a las opciones definidas.
- Enrutamiento de tickets y triaje: usar preguntas `choice` para asignar prioridad, departamento o tipo de incidencia a partir del estado del ticket, con la ventaja de resolver varias preguntas simultáneamente en un único forward pass.
- Evaluación de formularios y documentos: preguntas `noul` y `score` sobre campos, cumplimiento normativo o calidad de un documento JSON, con contexto de hasta 32.768 tokens por secuencia.
- Automatización de flujos con interfaz web: procesar capturas de pantalla del viewport junto con el estado textual para decidir la siguiente acción en un flujo de navegación, usando preguntas `choice` sobre las acciones disponibles.
- Decisión sobre políticas internas: dado un caso y el texto de la política, preguntas `noul` sobre elegibilidad y `score` sobre el nivel de riesgo, con probabilidades que permiten auditar la decisión.
- Sistemas de recomendación con criterios múltiples: puntuar opciones candidatas mediante preguntas `score` o `choice` sobre un mismo estado, aprovechando la ventana de contexto para incluir el catálogo o el historial.

## Benchmarks y rendimiento

La model card menciona la Decision Index 0.3 public suite y una gráfica de score frente a tamaño, pero no incluye cifras por modelo para el 9B en la información disponible. El único dato numérico publicado es del modelo hermano karpo-decision-31B, que ocupa el puesto #1 de la Decision Index con un Full score de 73,9 en las pruebas privadas de los mantenedores (edición 0.4.1, tablero del 12 de noviembre de 2026, 300 entradas) y un índice público de 75,0. No se han publicado resultados de benchmarks del modelo 9B (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan 16,8 GB; las peticiones largas requieren más memoria. No se dispone de estimaciones para cuantizaciones inferiores.
- GPU recomendadas: se requiere una GPU; por el tamaño de los pesos, encajan GPU de 24 GB o más (RTX 4090, L40S, A100 40/80 GB, H100). No se especifican modelos concretos en la documentación.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 24 GB de VRAM en bf16, siempre que la longitud de la petición no incremente demasiado el uso de memoria.
- Opciones de despliegue: servidor HTTP propio del repositorio (`torchrun --standalone --nproc_per_node 1 -m karpo_decision.serve.server`) y API Python `Decider`; el paquete se instala con `pip install "karpo-decision[qwen] @ git+https://github.com/machinepulse-ai/karpo-decision"`. Requiere Python 3.12 o superior. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La ventaja declarada es que no hay decodificación, ya que toda la respuesta se obtiene en un forward pass.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| karpo-decision-9B | Qwen3.5 9B | 8,4B | 32.768 tokens | Apache-2.0 | Modelo de decisión con readout lineal; este modelo |
| karpo-decision-31B | Gemma 4 31B | 31,3B | no disponible | Apache-2.0 (según familia) | #1 en Decision Index; Full score 73,9 en pruebas privadas, índice público 75,0 |
| karpo-decision-12B | Gemma 4 12B | 12,0B | no disponible | Apache-2.0 (según familia) | Misma familia, mayor tamaño que el 9B |
| karpo-decision-4B | Qwen3.5 4B | 4,5B | no disponible | Apache-2.0 (según familia) | Alternativa más ligera de la misma familia |

No se dispone de datos de rendimiento comparativo del 9B frente a estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: cargar el checkpoint como modelo conversacional no reproduce sus respuestas, según advierte la propia model card.
- La salida está restringida a las opciones definidas por el usuario; no puede generar texto libre ni explicaciones.
- El límite de 255 opciones por pregunta `choice` acota los espacios de decisión.
- La ventana de 32.768 tokens por secuencia obliga a dividir peticiones largas por preguntas, replicando el estado completo en cada parte, lo que puede aumentar el coste.
- No se han publicado datos sobre sesgos, idiomas soportados, tasas de alucinación ni calibración fuera de la Decision Index.
- El repositorio no registra descargas ni likes en el momento de la consulta, y la fecha de creación indicada es 2026-11-20; conviene verificar la vigencia y el mantenimiento del proyecto.
- La licencia Apache-2.0 permite uso comercial, pero deben revisarse las condiciones del modelo base Qwen/Qwen3.5-9B.
- No se documentan cuantizaciones ni soporte en motores de inferencia estándar (vLLM, llama.cpp, Ollama, TGI), lo que limita las opciones de despliegue a la API y el servidor propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edinlong83/zils-flash-k1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Código de inferencia: https://github.com/machinepulse-ai/karpo-decision
- Modelo hermano karpo-decision-31B: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Modelo hermano karpo-decision-12B: https://huggingface.co/MachinePulseAI/karpo-decision-12B
- Modelo hermano karpo-decision-4B: https://huggingface.co/MachinePulseAI/karpo-decision-4B
- Modelo hermano karpo-decision-2B: https://huggingface.co/MachinePulseAI/karpo-decision-2B
- Modelo hermano karpo-decision-0.8B: https://huggingface.co/MachinePulseAI/karpo-decision-0.8B
- Decision Index (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
- FlexDM: https://github.com/1000luca/FlexDM
- jev-brain: https://github.com/wcole3/jev-brain
