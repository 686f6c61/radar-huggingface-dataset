# EpochEcho/decision-4b-v2

## Resumen

Decision 4B v2 es un modelo de decisión textual desarrollado por EpochEcho, afinado a partir de Qwen3.5-4B. A diferencia de un modelo generativo al uso, no produce texto libre: recibe un `state` (contexto de la decisión) y un conjunto de preguntas con criterios explícitos, y devuelve en un único forward pass las probabilidades asociadas a cada opción. Soporta dos tipos de pregunta: `choice` (hasta 255 criterios nombrados, devuelve la opción seleccionada y la distribución completa de probabilidades) y `noul` (probabilidad estimada de que una proposición sea verdadera).

El modelo resuelve el problema del enrutamiento y la clasificación estructurada dentro de pipelines de agentes y automatización: en lugar de pedir a un LLM que emita JSON y parsearlo con tolerancia a errores, expone una interfaz tipada con calibración fija (temperatura 1.0 con softmax sobre opciones válidas) y un límite de contexto de 32.768 tokens renderizados por pregunta, incluyendo estado y criterios. Los inputs que exceden ese límite se rechazan en lugar de truncarse.

Con 4.659.865.088 parámetros totales y pesos en BF16 más una cabeza de decisión lineal en FP32, es un modelo compacto pensado para ejecutarse en GPU única. Su relevancia actual radica en la separación entre razonamiento generativo y decisión determinista: la familia Qwen3.5 aporta la comprensión lingüística y el modelo añade una capa de lectura calibrada sobre representaciones internas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido basado en Qwen3.5-4B: capas de atención completa (bidireccional dentro de cada pregunta renderizada) y capas Gated DeltaNet (causal nativo) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens renderizados por pregunta (estado + criterios); inputs mayores se rechazan |
| Tipos de cuantizacion | no disponible (el repo publica pesos BF16 con cabeza FP32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | fastino-community (GLiDE License), con términos del modelo base en LICENSE |
| Formato de pesos | safetensors (BF16 backbone + cabeza de decisión lineal FP32), tokenizer incluido, código custom |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer híbrido que combina capas de atención completa con capas Gated DeltaNet de comportamiento causal nativo. Sobre esa base, EpochEcho añade una cabeza de decisión lineal sin sesgo de 255 filas (códigos de respuesta) por 2.560 dimensiones ocultas. La particularidad arquitectónica es que las capas de atención completa operan de forma bidireccional dentro de cada pregunta renderizada de forma independiente, mientras que las capas Gated DeltaNet conservan su comportamiento causal; el renderizador, la máscara de atención y la lectura de decisión forman parte del modelo y se distribuyen con el runtime.

El entrenamiento consistió en un LoRA de rango 64 inicializado desde un estudiante destilado de GLiDE. La exportación se realizó promediando a pesos iguales dos checkpoints de adaptador y readout, y después fusionando el adaptador en el modelo base. El resultado son pesos merged en BF16 con la cabeza en FP32. La calibración es fija: temperatura 1.0 con softmax sobre las opciones válidas, sin ajuste por prompt. El runtime de referencia usa Transformers y PyTorch, con Unsloth para la codificación de entrada.

## Capacidades

- Clasificación de elección múltiple con hasta 255 criterios nombrados por pregunta, devolviendo la opción seleccionada y la distribución de probabilidades completa.
- Evaluación de proposiciones booleanas (`noul`) con probabilidad calibrada de veracidad.
- Procesamiento multi-pregunta: cada pregunta ve el estado completo y su propio esquema, y el motor combina las respuestas en una sola llamada.
- Enrutamiento y triaje: asignación de tickets, solicitudes o casos a equipos o categorías definidas por criterios.
- Decisión en un solo forward pass por pregunta, sin generación autoregresiva, lo que reduce latencia frente a esquemas de prompting generativo.
- Soporte de tool calling: no disponible de forma nativa; la integración se hace a nivel de pipeline mediante la salida estructurada.
- Soporte de agentes multi-paso: no disponible de forma nativa; el modelo actúa como componente de decisión dentro de un agente mayor.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión y audio: no disponible.

## Casos de uso

- Triaje de soporte al cliente: definir un `state` con el texto del ticket y preguntas `choice` con criterios como `billing`, `technical` o `account`, obteniendo la asignación y la confianza en una sola pasada. El límite de 32.768 tokens permite incluir historial de conversación extenso.
- Enrutamiento de solicitudes en pipelines internos: clasificar correos, formularios o mensajes entrantes hacia colas o equipos concretos, usando la distribución de probabilidades para derivar a revisión humana cuando la confianza es baja.
- Moderación y verificación de políticas: usar preguntas `noul` para estimar la probabilidad de que un contenido viole una política concreta, con umbrales validados sobre datos propios.
- Extracción de señales booleanas en ETL: encadenar varias preguntas `noul` sobre un mismo estado para poblar campos estructurados (por ejemplo, "¿menciona un problema de pago?", "¿solicita reembolso?") sin generar texto.
- Automatización de back-office: clasificar documentos o incidencias según taxonomías de hasta 255 categorías, aprovechando que la cabeza devuelve la distribución completa para análisis posterior.
- Componente de decisión en agentes: insertar el modelo como paso de selección de herramienta o de ruta antes de invocar un LLM generativo, reduciendo coste y latencia en el bucle del agente.
- Evaluación de respuestas en sistemas RAG: preguntar `noul` si una respuesta candidata satisface un criterio de calidad o de relevancia antes de mostrarla al usuario.

## Benchmarks y rendimiento

Resultados publicados en la model card para Local Public Index 0.3 (release merged), evaluado con un worker por GPU en cuatro H800 NVL:

| Categoria | Puntuacion |
|---|---:|
| Overall | 59,10 |
| Knowledge & Reasoning | 41,81 |
| Language Understanding | 65,48 |
| Retrieval & Classification | 66,54 |
| Tools & Automation | 76,84 |
| Arts & Human Taste | 39,99 |
| Peticiones exitosas | 140.178 / 140.178 |

El mismo modelo antes de la fusión obtuvo 59,06 en su ejecución separada. Los archivos de la ejecución pública están en el dataset `EpochEcho/decision-4b-v2-index-results`. La puntuación oficial Full Score y la latencia de leaderboard para v2 están pendientes según el autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos (4,66 B de parámetros), más overhead de activaciones y del renderizador; presupuesto realista de 12-16 GB en GPU.
- La cabeza de decisión en FP32 añade un consumo marginal (255 × 2.560 × 4 bytes, unos 2,6 MB).
- GPU recomendadas: H800/H100 para las ejecuciones de referencia del autor (cuatro H800 NVL con un worker por GPU); A100 40 GB y RTX 4090 24 GB son suficientes para inferencia en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y previsiblemente en RTX 4080/4070 Ti Super (16 GB) con margen ajustado; no se documentan variantes cuantizadas para GPUs de 8-12 GB.
- Opciones de despliegue: el repo incluye runtime propio (`DecisionModel` de `model.py`) sobre Transformers y PyTorch, con Unsloth para la codificación de entrada; también se integra con el kit Decision Index mediante `engine:Decision4BEngine` y el parámetro `--option "model_dir=..."`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Entorno de referencia: Python 3.13, PyTorch 2.14.1 con CUDA 13.2, Transformers 5.17.0, Unsloth 2026.10.5.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que la latencia de leaderboard está pendiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decision 4B v2 | 4,66 B | 32.768 tokens por pregunta | Decisión estructurada (choice/noul) sobre Qwen3.5-4B | fastino-community | Hugging Face, pesos merged |
| Qwen3.5-4B (base) | ~4 B | no disponible en la informacion | LLM generativo multimodal (image-text-to-text) | términos del modelo base | Hugging Face |
| Decision 4B Preview | no disponible | no disponible | Versión previa con el mismo esquema para `choice` y `noul` | no disponible | Hugging Face |

La comparación con alternativas de clasificación dedicadas (por ejemplo, modelos BERT o DeBERTa afinados) no está disponible en la información proporcionada. Frente a su base Qwen3.5-4B, la diferencia clave es la interfaz: el base genera texto y requiere parsing, mientras que Decision 4B v2 devuelve probabilidades calibradas en un solo forward pass.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el rendimiento en otros idiomas no está evaluado.
- El límite de 32.768 tokens renderizados por pregunta es estricto: los inputs que lo exceden se rechazan, lo que exige preprocesado y control de longitud en producción.
- La calibración es fija (temperatura 1.0); el autor recomienda validar los umbrales de confianza sobre datos propios antes de automatizar decisiones.
- Riesgo de alucinación inherente al backbone generativo subyacente, aunque la salida sea una distribución de probabilidad y no texto libre.
- Sesgos: no documentados en la información disponible; al derivar de Qwen3.5-4B y entrenarse en inglés, se esperan los sesgos del corpus base, sin cuantificar.
- Licencia `fastino-community` (GLiDE License) con términos adicionales del modelo base en `LICENSE`: es necesario revisar ambas antes de uso comercial.
- El modelo depende de código custom (`model.py`, renderizador y máscara de atención propios), lo que limita la portabilidad a otros runtimes y añade superficie de mantenimiento.
- El modelo mide 4,66 B de parámetros pese a la denominación "4B" del nombre comercial; conviene dimensionar el hardware con la cifra real.
- La evaluación disponible corresponde a un índice interno del autor (Local Public Index 0.3), no a benchmarks estándar de la comunidad, y las puntuaciones Full Score y latencia están pendientes.
- No se documentan variantes cuantizadas, lo que restringe el despliegue en GPUs de gama media-baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EpochEcho/decision-4b-v2
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Versión previa Decision 4B Preview: https://huggingface.co/EpochEcho/decision-4b-preview
- Resultados de la evaluación pública: https://huggingface.co/datasets/EpochEcho/decision-4b-v2-index-results/tree/86c050245496b26b2ec8ab7a7cbc2d20f18eb1da/runs/decision_4b_v2_merged
- Licencia GLiDE: https://huggingface.co/EpochEcho/decision-4b-v2/blob/main/GLIDE_LICENSE
- Avisos del profesor (linaje de destilación): https://huggingface.co/EpochEcho/decision-4b-v2/blob/main/GLIDE_NOTICE
- Licencia del modelo base: https://huggingface.co/EpochEcho/decision-4b-v2/blob/main/LICENSE
