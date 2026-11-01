# RobotLearningLab/hidden-messages-dream-qasc

## Resumen

Hidden Messages Dream-7B QASC es un adaptador de comunicación entrenado por RobotLearningLab para su uso con el modelo de difusión de lenguaje Dream-v0-Instruct-7B. No es un modelo de lenguaje autónomo: se trata de un canal de comunicación supervisado que permite a dos agentes basados en Dream intercambiar información a través de estados ocultos latentes en lugar de texto. El adaptador comprime el estado oculto del agente emisor en cuatro vectores continuos de 128 dimensiones y proyecta los mensajes recibidos como embeddings de prefijo virtual en el agente receptor.

El trabajo acompaña al artículo "Hidden Messages Between Diffusion Language Model Agents: Causal Evidence for Latent Communication", aceptado en el taller DiffuLM de NeurIPS 2026. Su relevancia radica en que proporciona evidencia causal de que los agentes de difusión pueden comunicarse de forma efectiva mediante latentes sin pasar por una interfaz textual, un área de investigación incipiente en sistemas multiagente.

El adaptador está entrenado específicamente para la tarea QASC (Question Answering via Sentence Composition) con evidencia dividida entre agentes, y se distribuye como un espejo de los artefactos del artículo sin reentrenamiento ni conversión de checkpoint. El backbone congelado debe descargarse por separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador de canal latente sobre modelo de difusión de lenguaje (Dream-v0-Instruct-7B) |
| Parámetros totales | No disponible (adaptador; el backbone tiene 7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dictionary (.pt) |

## Arquitectura y entrenamiento

El adaptador implementa un canal de prefijo latente denso (`DenseLatentPrefixChannel`) que opera sobre el backbone Dream-v0-Instruct-7B congelado. El emisor comprime su estado oculto en cuatro vectores continuos de 128 dimensiones; el receptor recibe estos vectores y los proyecta como embeddings de prefijo virtual que se inyectan en el proceso de denoising del modelo de difusión. El adaptador se entrena con supervisión para la tarea QASC con evidencia dividida, donde distintos agentes reciben fragmentos parciales de la información necesaria para responder.

El entrenamiento se realizó sobre el dataset allenai/qasc y los pesos se publican como espejo directo de los artefactos del artículo original, sin reentrenamiento ni validación adicional de inferencia. El checkpoint proviene de `checkpoints/qasc_dense_latent_prefix_channel.pt` del repositorio de código público. No se dispone de información sobre el número de tokens de entrenamiento, composición detallada del dataset ni uso de RLHF o DPO.

## Capacidades

- Comunicación latente entre dos agentes basados en Dream-v0-Instruct-7B mediante cuatro vectores continuos de 128 dimensiones.
- Compresión del estado oculto del emisor y proyección como prefijo virtual en el receptor.
- Entrenado específicamente para razonamiento con evidencia dividida en la tarea QASC.
- Integración en el proceso de denoising del modelo de difusión receptor.
- No implementa generación de texto autónoma ni `AutoModel.from_pretrained`.
- No dispone de endpoint de generación alojado.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes multi-step fuera del esquema evaluado en el artículo.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Investigación en comunicación latente entre agentes: el adaptador permite reproducir el experimento del artículo sobre canales de comunicación no textuales entre modelos de difusión, sirviendo como base para estudiar protocolos emergentes.
- Razonamiento con evidencia dividida: dos agentes Dream reciben fragmentos parciales de información y deben combinarlos mediante el canal latente para responder preguntas de QASC, un escenario útil para estudiar colaboración multiagente.
- Estudio de evidencia causal en sistemas multiagente: el diseño con intervenciones sobre mensajes y receptores designados permite analizar qué información transporta realmente el canal latente.
- Base para experimentos de transferencia: investigadores pueden partir de este adaptador para probar si el canal generaliza a otras tareas o backbones, aunque el propio autor advierte que la transferencia zero-shot no está establecida.
- Análisis de eficiencia comunicativa: comparar el coste de transmitir cuatro vectores de 128 dimensiones frente a una interfaz textual completa en tareas de QA compuesto.
- Reproducibilidad de resultados publicados: el repositorio incluye `config.yaml` con revisiones, arquitectura y ajustes de entrenamiento/evaluación, lo que facilita replicar el pipeline del artículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo referencia `evidence/qasc_results.json` en el repositorio de código para los resultados reportados, pero los valores numéricos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador; el backbone Dream-v0-Instruct-7B requiere aproximadamente 14-16 GB en FP16, aunque no se especifica en la información.
- GPU recomendadas: no disponible; el autor indica que se requiere un entorno CUDA para el flujo de trabajo reportado.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, ya que el adaptador no implementa `AutoModel.from_pretrained` ni endpoint de generación. Se debe usar el código del repositorio original (`DenseLatentPrefixChannel` y el driver de QASC).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hidden Messages Dream-7B QASC (este) | Adaptador de canal latente | No disponible (backbone 7B) | No disponible | Apache-2.0 | HuggingFace |
| Dream-org/Dream-v0-Instruct-7B | Modelo de difusión de lenguaje | 7B | No disponible | No disponible | HuggingFace |
| Alternativas de comunicación multiagente | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros adaptadores de comunicación latente comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: es un adaptador de comunicación que requiere el backbone Dream-v0-Instruct-7B congelado (revisión `05334cb9faaf763692dcf9d8737c642be2b2a6ae`).
- Entrenado exclusivamente para QASC con evidencia dividida; no es un lenguaje emergente ni un protocolo universal de comunicación entre tareas.
- La transferencia zero-shot a otras tareas o backbones no está establecida.
- Un mensaje latente denso no constituye un mecanismo de privacidad.
- La reproducción de resultados requiere contextos y trayectorias independientes de los agentes, el receptor designado, intervenciones sobre mensajes y un calendario de entrega específico.
- Descargar el adaptador por sí solo no reproduce los resultados del artículo.
- No se realizó validación adicional de inferencia ni de benchmarks para este espejo en HuggingFace.
- El repositorio no incluye los pesos completos del backbone ni los datos fuente de QASC.
- Idioma limitado al inglés.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el backbone Dream-v0-Instruct-7B tiene su propia licencia que debe verificarse por separado.

## Enlaces

- [HuggingFace: RobotLearningLab/hidden-messages-dream-qasc](https://huggingface.co/RobotLearningLab/hidden-messages-dream-qasc)
- [Artículo arXiv:2610.28905](https://arxiv.org/abs/2610.28905)
- [Repositorio de código (commit 1d1477b)](https://github.com/alanrbtx/hidden-messages-diffusion-agents/tree/1d1477b423ba4245b564840ce46aee039c79bcc8)
- [Implementación DenseLatentPrefixChannel](https://github.com/alanrbtx/hidden-messages-diffusion-agents/blob/1d1477b423ba4245b564840ce46aee039c79bcc8/code/src/hidden_messages/communication/dense_latent_prefix.py)
- [Driver QASC](https://github.com/alanrbtx/hidden-messages-diffusion-agents/blob/1d1477b423ba4245b564840ce46aee039c79bcc8/code/scripts/phase8_qasc_hiddenbench_dense_prefix.py)
- [Resultados QASC (evidence/qasc_results.json)](https://github.com/alanrbtx/hidden-messages-diffusion-agents/blob/1d1477b423ba4245b564840ce46aee039c79bcc8/evidence/qasc_results.json)
- [Backbone: Dream-org/Dream-v0-Instruct-7B](https://huggingface.co/Dream-org/Dream-v0-Instruct-7B)
- [Dataset: allenai/qasc](https://huggingface.co/datasets/allenai/qasc)
