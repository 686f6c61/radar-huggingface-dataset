# MachinePulseAI/karpo-decision-2B

## Resumen

Karpo Decision 2B es un modelo de decisión desarrollado por MachinePulseAI, afinado a partir de Qwen/Qwen3.5-2B. No es un modelo generativo al uso: recibe un estado (una página web, un documento, una conversación, cualquier texto o JSON) junto con preguntas tipadas sobre ese estado y devuelve, en una sola pasada hacia delante, una probabilidad para cada opción de cada pregunta, sin decodificar texto. La respuesta es siempre una de las opciones predefinidas.

El modelo forma parte de la familia Karpo Decision, que cubre desde 0,8B hasta 31B parámetros y comparte la misma interfaz de decisión. Emplea una arquitectura híbrida de atención (capas de atención completa y capas de atención lineal) sobre el transformer de Qwen3.5, con un readout lineal de 255 × 2.048 en fp32 que puntúa los códigos de opción. El contexto es de 32.768 tokens por secuencia.

Su relevancia actual reside en el enfoque "system one": sustituye la generación de texto por clasificación directa sobre un conjunto cerrado de opciones, lo que elimina el riesgo de respuestas fuera de formato y reduce la latencia en tareas de enrutamiento, clasificación y toma de decisiones estructuradas. La licencia Apache 2.0 facilita su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal) sobre Qwen3.5, con readout lineal |
| Parametros totales | 2.213.241.664 (2,2B) en bf16, más readout de 255 × 2.048 en fp32 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens por secuencia |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B y se afina como modelo de decisión. La arquitectura conserva el transformer de Qwen3.5 con atención híbrida: las capas de atención completa leen la secuencia en ambas direcciones, mientras que las capas de atención lineal la leen en orden, de modo que la lista de preguntas se sitúa antes del estado. Sobre el punto de readout que cierra cada pregunta, un readout lineal puntúa 255 códigos de opción y una softmax restringida a las opciones de esa pregunta produce las probabilidades.

Una petición se codifica como una única secuencia que contiene la lista de preguntas, el estado y, a continuación, cada pregunta de nuevo con sus opciones y su punto de readout, lo que permite resolver muchas preguntas en una sola pasada. El diseño de preguntas-primero sigue a FlexDM y jev-brain. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificación de decisión con preguntas de tipo `choice` (hasta 255 opciones), `noul` (verdadero o falso) y `score` (nivel en una escala).
- Entrada multimodal: acepta texto o JSON y una captura de pantalla en `state.viewport_screenshot`.
- Resolución de múltiples preguntas en una sola pasada hacia delante.
- Salida con probabilidades por opción y nivel de confianza.
- Interfaz Python (`Decider`) y servidor HTTP en formato System One (`POST /v1/systemone`, `GET /healthz`).
- Integración con el kit Decision Index mediante un motor dedicado.
- No genera texto libre: la respuesta está siempre restringida al conjunto de opciones.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo devuelve la probabilidad de cada categoría o cola de destino en una sola pasada, lo que permite automatizar la triage sin generación de texto.
- Evaluación de políticas de devolución o reembolso: con el estado del pedido y la política como entrada, responde a preguntas `noul` (¿es elegible?) y `choice` (¿reembolsar, rechazar o escalar?) con probabilidades, como en el ejemplo de la model card.
- Moderación de contenido estructurada: clasifica un mensaje o publicación contra un conjunto cerrado de etiquetas de riesgo, aprovechando el contexto de 32.768 tokens para incluir historial de conversación.
- Verificación de formularios y documentos: comprueba si un JSON cumple una serie de condiciones booleanas y devuelve la probabilidad de cada una en una única inferencia.
- Análisis de capturas de pantalla: con la imagen en `viewport_screenshot`, decide sobre el estado de una interfaz (por ejemplo, si un flujo de compra está completo o requiere acción).
- Puntuación de calidad o relevancia: usa preguntas de tipo `score` para asignar un nivel en una escala a documentos o respuestas, con distribución de probabilidad sobre los niveles.
- Automatización de decisiones en agentes: actúa como componente "system one" que selecciona la siguiente acción de un conjunto finito antes de que un modelo generativo ejecute el paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la Decision Index 0.3 public suite y que el modelo mayor de la familia (karpo-decision-31B) alcanza 73,9 en Full score y 75,0 en el índice público, pero no se proporcionan cifras concretas para karpo-decision-2B.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 4,4 GB en bf16; las peticiones largas requieren más memoria por el contexto de hasta 32.768 tokens.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM para uso básico; A100 o H100 para mayor throughput y secuencias largas.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante), asumiendo margen para el contexto.
- Opciones de despliegue: API Python (`karpo_decision.decider.Decider`) y servidor HTTP propio con `torchrun` (`karpo_decision.serve.server`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al no decodificar texto, la inferencia se limita a una pasada hacia delante por petición.
- Requisitos de software: Python 3.12 o superior y el extra `qwen` del paquete `karpo-decision`.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| karpo-decision-2B | Qwen3.5 2B | 2,2B | 32.768 | Decisión por readout, sin generación | Apache 2.0 |
| karpo-decision-0.8B | Qwen3.5 0.8B | 0,85B | no disponible | Decisión por readout | Apache 2.0 |
| karpo-decision-4B | Qwen3.5 4B | 4,5B | no disponible | Decisión por readout | Apache 2.0 |
| karpo-decision-9B | Qwen3.5 9B | 8,4B | no disponible | Decisión por readout | Apache 2.0 |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada. Como alternativas de la misma categoría (clasificación y decisión estructurada) podrían considerarse modelos generativos con salida JSON forzada, pero no se aportan cifras que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de chat: cargar el checkpoint como modelo conversacional no reproduce sus respuestas, según advierte la model card.
- La salida está restringida a las opciones proporcionadas; no puede responder preguntas abiertas ni generar texto libre.
- El límite de opciones por pregunta `choice` es de 255; las peticiones que superan los 32.768 tokens se dividen por preguntas, repitiendo el estado completo en cada parte.
- No se han publicado datos sobre sesgos, idiomas soportados ni tasas de alucinación; al no generar texto, el riesgo de alucinación se traslada a la calibración de las probabilidades.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce si el modelo base Qwen3.5-2B impone condiciones adicionales que deban verificarse.
- Requiere Python 3.12 o superior y una GPU; no se documentan rutas de despliegue en CPU ni formatos cuantizados.
- El ecosistema es joven (315 descargas, 0 likes en el momento de la consulta) y depende del repositorio `machinepulse-ai/karpo-decision` para la inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MachinePulseAI/karpo-decision-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de inferencia: https://github.com/machinepulse-ai/karpo-decision
- Modelo hermano mayor: https://huggingface.co/MachinePulseAI/karpo-decision-31B
- Decision Index (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit Decision Index: https://github.com/apolinario/decision-index
- FlexDM: https://github.com/1000luca/FlexDM
- jev-brain: https://github.com/wcole3/jev-brain
- Licencia: https://huggingface.co/MachinePulseAI/karpo-decision-2B/blob/main/LICENSE
