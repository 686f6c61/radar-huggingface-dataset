# nuoram/Muse-Glimmer-30B-SOMPOA-heresy-W8A8

## Resumen

Muse-Glimmer-30B-SOMPOA-heresy-W8A8 es una cuantizacion en formato W8A8 (INT8 en pesos y activaciones) del modelo MuXodious/Muse-Glimmer-30B-SOMPOA-heresy, publicada por el usuario nuoram. El modelo subyacente es un fine-tune multimodal de tipo image-text-to-text construido sobre Muse-Glimmer-30B, que ha sido procesado con el motor de ablacion Heretic v1.4.0 de P-E-W empleando la tecnica SOMPOA (Self-Organizing Maps & Magnitude-Preserving Orthogonal Ablation). El objetivo declarado es eliminar el comportamiento de rechazo y las restricciones de alineacion del modelo original, tarea en la que se reduce de 102/104 rechazos iniciales a 4/104 tras la ablacion.

El modelo cuenta con 29.776.626.688 parametros (~29,8 mil millones) segun los pesos en safetensors, y el repositorio ocupa 34,4 GB, coherente con un checkpoint INT8. Su pipeline es image-text-to-text, por lo que acepta entradas de imagen y texto, y esta etiquetado como compatible con endpoints y con vLLM, lo que facilita su despliegue en infraestructura de inferencia de alta concurrencia. La licencia es Apache 2.0.

Su relevancia actual es doble: por un lado, sirve como caso de estudio de tecnicas de abliteration y de cuantizacion W8A8 aplicada a un modelo multimodal de ~30B; por otro, permite evaluar el impacto de la ablacion sobre capacidades generales (los PIQA reportados se mantienen practicamente identicos al modelo original). No obstante, el propio autor advierte de que el modelo sigue refiriendose a sus politicas internas en el modo de razonamiento, es "bastante obstinado" y requiere trabajo adicional de re-alineacion, con pesos de ablacion en las capas MLP poco ideales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tipo de modelo muse_glimmer en transformers; la informacion proporcionada no detalla la arquitectura interna) |
| Parametros totales | 29.776.626.688 (~29,8 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A8 INT8 (pesos y activaciones a 8 bits), generado con llmcompressor y almacenado con compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base (si es un transformer denso, MoE o hibrido), ni el volumen de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO. Lo que si se detalla es el pipeline de post-procesado en dos etapas. La primera es la abliteration con Heretic v1.4.0, que identifica una direccion de rechazo (direction_index = 30.93) y aplica ablacion ortogonal preservando la magnitud, con pesos de ablacion distribuidos en las proyecciones attn.o_proj y mlp.down_proj a lo largo de las capas. La segunda es la cuantizacion W8A8 mediante llmcompressor, que reduce pesos y activaciones a 8 bits enteros y da como resultado el checkpoint publicado.

El autor documenta la busqueda de hiperparametros como una tabla de "rituales" con 19 ensayos, de los que se selecciono el ensayo 313 (T313): 4 rechazos de 104 y una divergencia KL de 0.0696 respecto al modelo original. La ablacion se concentra en cuatro capas por proyeccion (indices 0 a 4), con un max_weight_position de 27.06 en attn.o_proj y de 42.62 en mlp.down_proj; la distancia minima entre pesos minimos en mlp.down_proj es de solo 1.46, lo que el propio autor senala como indicio de que los pesos de ablacion en las capas MLP son menos ideales. Se incluyen ademas dos referencias arXiv en las etiquetas del repositorio (2504.13181 y 2602.06036), sin que la informacion proporcionada explique su contenido.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarado image-text-to-text.
- Comprension de imagenes combinada con texto (entrada multimodal imagen + texto).
- Razonamiento con modo de pensamiento (thinking): el modelo expone cadenas de razonamiento internas.
- Comportamiento desalineado/abliterado: se reduce el rechazo de peticiones; en la evaluacion del autor, de 102/104 rechazos iniciales a 4/104.
- Compatibilidad con el prompt de jailbreak y la plantilla de chat de jailbreak distribuidas por el autor del modelo base para eliminar la alineacion residual.
- Compatibilidad con vLLM y con el tag endpoints_compatible del repositorio de HuggingFace.
- Soporte de cuantizacion INT8 W8A8 (compressed-tensors), con inferencia en 8 bits.
- No se documenta en la informacion disponible soporte de tool calling, function calling, uso de agentes ni capacidades especificas de audio.

## Casos de uso

- Investigacion sobre mecanismos de rechazo y alineacion: el modelo permite comparar directamente el comportamiento del checkpoint abliterado frente al original, ya que se publican las metricas de rechazo (4/104 frente a 102/104) y la divergencia KL (0.0696).
- Red-teaming y evaluacion de seguridad: al ser un modelo abliterado, es util para comprobar como responden los filtros y clasificadores de una plataforma ante contenido que el modelo base rechazaria, usando la plantilla de jailbreak incluida.
- Validacion de tecnicas de cuantizacion W8A8: sirve para medir la perdida de calidad al pasar pesos y activaciones a INT8 en un modelo multimodal de ~29,8B, comparando la salida con el checkpoint sin cuantizar del modelo base.
- Despliegue multimodal de alto rendimiento en vLLM: el modelo esta etiquetado como compatible con endpoints y vLLM, por lo que se puede servir en un cluster de GPU con batching continuo para tareas de descripcion de imagenes o respuesta a preguntas sobre imagenes.
- Estudio de ablacion ortogonal en capas MLP: dado que el autor documenta pesos de ablacion poco ideales en mlp.down_proj, el modelo es un buen sujeto para investigar el efecto de la ablacion sobre las capas feed-forward.
- Generacion de texto sin restricciones con prompt de sistema personalizado: el autor indica que el modelo es lo bastante compliant como para adherirse a cualquier system prompt, incluyendo la SRP (Supervised Reward Preferencing) de Redaihf.
- Reproducibilidad de pipelines Heretic + llmcompressor: el repositorio incluye los ensayos y parametros concretos, lo que permite replicar el proceso sobre otros modelos base.

## Benchmarks y rendimiento

El autor publica resultados de PIQA para varios ensayos de ablacion comparados con el modelo original. Los datos disponibles son:

| Benchmark | Metrica | T313 (seleccionado) | T289 | Original |
|---|---|---|---|---|
| PIQA | acc | 0.8232 | 0.8226 | 0.8221 |
| PIQA | acc_stderr | 0.0089 | 0.0089 | 0.0089 |
| PIQA | acc_norm | 0.8330 | 0.8319 | 0.8292 |
| PIQA | acc_norm_stderr | 0.0087 | 0.0087 | 0.0088 |

Los resultados de T171 aparecen truncados en la informacion proporcionada y no se pueden reproducir completos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un checkpoint W8A8 de ~29,8B parametros, los pesos ocupan aproximadamente 30 GB; hay que anadir el coste de la cache KV y de las activaciones, por lo que conviene contar con 32-40 GB de VRAM como minimo.
- GPU recomendadas: A100 de 40 GB o 80 GB, H100 de 80 GB, o configuraciones multi-GPU con dos RTX 4090/3090 de 24 GB.
- Cabe en GPU de consumo: no en una unica GPU de 24 GB (RTX 4090, 3090); seria necesario repartir el modelo entre dos tarjetas. Una GPU de 32 GB (por ejemplo, RTX 5090) quedaria muy justa y probablemente limitada por la cache KV.
- Opciones de despliegue: vLLM (el repositorio esta etiquetado como endpoints_compatible y vllm), transformers con las librerias compressed-tensors/llmcompressor. No se documenta compatibilidad con llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Rechazos | PIQA acc_norm | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nuoram/Muse-Glimmer-30B-SOMPOA-heresy-W8A8 | 29,8B | W8A8 INT8 | 4/104 (heredado del base) | 0.8330 (T313) | Apache 2.0 | 0 descargas, 0 likes |
| MuXodious/Muse-Glimmer-30B-SOMPOA-heresy | no disponible | no disponible (checkpoint sin cuantizar) | 4/104 | 0.8292 (referencia "Original") | Apache 2.0 | no disponible |
| Muse-Glimmer-30B (modelo base original) | no disponible | no disponible | 102/104 (antes de ablacion) | 0.8292 (referencia "Original") | no disponible | no disponible |

No se dispone en la informacion proporcionada de otros modelos comparables de la misma categoria (abliterated multimodales de ~30B) con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Alineacion residual: el autor advierte de que el modelo sigue refiriendose a sus politicas y directrices en el modo de pensamiento, y que es "bastante obstinado" y requiere mas trabajo de re-alineacion.
- Pesos de ablacion deficientes: los pesos de ablacion de las capas MLP se describen como menos ideales que los de atencion, con una distancia minima entre pesos minimos de solo 1.46 en mlp.down_proj.
- Contenido sin filtrar: al ser un modelo abliterated/uncensored/decensored, puede generar contenido que el modelo original rechazaria. Esto implica riesgo legal y reputacional en cualquier despliegue publico.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad factual; el unico benchmark publicado es PIQA.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no estan disponibles, lo que impide garantizar un comportamiento correcto en conversaciones largas o en castellano.
- Cobertura de benchmarks muy limitada: solo PIQA (1.838 muestras) y las metricas de rechazo/KL del proceso Heretic; no hay datos de codigo, matematicas, vision o tareas multimodales.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero se ofrece sin garantias; el contenido generado por un modelo desalineado es responsabilidad del usuario final.
- Cuantizacion INT8: no se publica la degradacion de calidad introducida por W8A8 respecto al checkpoint sin cuantizar, mas alla de las cifras de PIQA del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nuoram/Muse-Glimmer-30B-SOMPOA-heresy-W8A8
- Modelo base: https://huggingface.co/MuXodious/Muse-Glimmer-30B-SOMPOA-heresy
- Prompt de jailbreak: https://huggingface.co/MuXodious/Muse-Glimmer-30B-SOMPOA-heresy/blob/main/jailbreak-system-prompt.txt
- Plantilla de chat de jailbreak: https://huggingface.co/MuXodious/Muse-Glimmer-30B-SOMPOA-heresy/blob/main/muse-jailbreak-chat_template.jinja
- Motor de abliteration Heretic: https://github.com/p-e-w/heretic
- Pull request de SOMPOA en Heretic: https://github.com/p-e-w/heretic/pull/196
- Metodo Supervised Reward Preferencing (SRP): https://huggingface.co/MuXodious/gpt-oss-20b-RichardErkhov-heresy/discussions/23
- Perfil de Redaihf: https://huggingface.co/redaihf
- Referencia arXiv 2504.13181: https://arxiv.org/abs/2504.13181
- Referencia arXiv 2602.06036: https://arxiv.org/abs/2602.06036
