# joyfox/Qwen3.8-27B-Uncensored-JoyFox-Aggressive

## Resumen

El modelo `Qwen3.8-27B-Uncensored-JoyFox-Aggressive` es una variante de `Qwen/Qwen3.8-27B` desarrollada por el usuario joyfox, cuyo objetivo es reducir los rechazos innecesarios (overrefusal) y los preámbulos de estilo político que suelen aparecer en modelos alineados. El nombre "Aggressive" indica la intensidad de esta intervención: el modelo responde de forma directa y sustantiva a peticiones legítimas, incluso cuando la redacción es sensible o ambigua. No añade conocimiento factual, por lo que conserva las capacidades generales del modelo base, incluida la pila de visión multimodal y el módulo de predicción multi-token (MTP).

La arquitectura es la nativa de Qwen3.8-27B, un transformer multimodal con codificador de visión y proyector, más un módulo MTP para decodificación especulativa. El checkpoint completo tiene 27.781.427.952 parámetros (~27,8B) y una ventana de contexto de 32.768 tokens según los ejemplos de uso. Se distribuye en formato safetensors (BF16) y GGUF con cuantizaciones de Q2_K a Q8_0, además de un proyector de visión F16 separado. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia actual de este modelo radica en su enfoque en la reducción de falsos rechazos, un problema común en modelos de propósito general. Al mantener intactos el tokenizador, la plantilla de chat, la configuración y los tensores de visión y MTP respecto al original, ofrece una alternativa "uncensored" que puede desplegarse en entornos donde se necesita una respuesta directa sin preámbulos, siempre bajo la responsabilidad del usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8) con codificador de vision, proyector y modulo MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | BF16 (safetensors); GGUF: Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0; MTP BF16; mmproj F16 |
| Idiomas soportados | ingles, chino, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3.8-27B`, un transformer autoregresivo con componentes multimodales: un codificador de vision, un proyector que alinea las caracteristicas visuales con el espacio de texto, y un modulo de Multi-Token Prediction (MTP) que permite decodificacion especulativa. El checkpoint publicado conserva exactamente los tensores de vision, el proyector y el MTP del original, verificados por el autor mediante comprobaciones de nombres, formas, dtypes y valores.

El entrenamiento consistio en una intervencion de tipo "abliteration" sobre los pesos del modelo base para reducir la tasa de rechazo ante peticiones legitimas. No se anade conocimiento nuevo ni se modifican las capacidades generales. El autor reporta una evaluacion propia con 1000 prompts: la tasa de rechazo benigno baja del 59,2% en el modelo oficial al 0,0% en esta variante, mientras que la puntuacion de capacidad se mantiene en 59,0% en ambos. No se mencionan datos sobre el dataset de entrenamiento, el numero de tokens ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno con respuesta directa y sin preambulos politicos.
- Razonamiento y comprension de instrucciones complejas, incluyendo peticiones con redaccion sensible o ambigua.
- Soporte multimodal: entrada de imagenes a traves del proyector de vision F16 (mmproj), capaz de describir o analizar contenido visual.
- Decodificacion especulativa mediante el modulo MTP integrado en los GGUF principales, acelerando la inferencia en runtimes compatibles.
- Multilingue: soporta ingles, chino y otros idiomas segun las capacidades del modelo base.
- Compatible con la plantilla de chat oficial y los ajustes de muestreo por defecto del modelo base.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (32K tokens) y responder de forma directa a quejas o consultas sin rechazos innecesarios, reduciendo la friccion en interacciones reales.
- Analisis de imagenes en entornos controlados: gracias al proyector de vision, puede describir o extraer informacion de imagenes en aplicaciones de documentacion o soporte visual, manteniendo la coherencia con el texto.
- Asistencia en redaccion tecnica y creativa: para generar borradores, resumir documentos o reescribir contenido, evitando respuestas evasivas cuando el tema es delicado pero legitimo (por ejemplo, ficcion con violencia o temas adultos).
- Desarrollo de agentes conversacionales en entornos de investigacion: su baja tasa de rechazo permite probar comportamientos de modelo sin los sesgos de seguridad tipicos, util para estudiar alineacion o robustez.
- Generacion de codigo y depuracion: aunque no se especifican capacidades de tool calling, el modelo base de Qwen3.8-27B incluye habilidades de programacion; esta variante las conserva, sirviendo para asistencia en entornos de desarrollo donde se requiere una respuesta directa.
- Despliegue en dispositivos con recursos limitados: las cuantizaciones Q2_K (10,12 GiB) y Q3_K_M (12,57 GiB) permiten ejecutar el modelo en GPUs de consumo con 16 GB de VRAM, habilitando chatbots locales sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta una evaluacion interna con 1000 prompts (800 de rechazo benigno, 100 de control bilingue de respuesta exacta y 100 de diagnostico de comportamiento no bloqueante), con decodificacion greedy. Los resultados son:

| Checkpoint | Tasa de rechazo benigno | Puntuacion de capacidad |
|---|---:|---:|
| Qwen3.8-27B oficial | 59,2% | 59,0% |
| JoyFox BF16 | 0,0% | 59,0% |

Estos datos son generativos y se obtuvieron con el runtime llama.cpp commit `885c5bbe8e04`. No hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion GGUF):
  - Q2_K: ~10,12 GiB de peso, requiere al menos 12-14 GB de VRAM total.
  - Q3_K_M: ~12,57 GiB, requiere ~16 GB de VRAM.
  - Q4_K_M: ~15,66 GiB, requiere ~20 GB de VRAM.
  - Q5_K_M: ~18,19 GiB, requiere ~24 GB de VRAM.
  - Q6_K: ~20,89 GiB, requiere ~28 GB de VRAM.
  - Q8_0: ~27,05 GiB, requiere ~32 GB de VRAM.
  - MTP BF16: ~5,54 GiB adicionales si se usa como modelo de borrador separado.
  - mmproj F16: ~0,86 GiB adicionales para entrada de imagenes.
- GPU recomendadas: para Q4_K_M o inferior, una RTX 3090/4090 (24 GB) es suficiente; para Q5_K_M o superior, se necesitan GPUs de 32 GB o mas (A100, H100, o multiples GPUs).
- Si cabe en consumer GPU: si, con cuantizaciones Q2_K a Q5_K_M en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server) con soporte MTP y mmproj; tambien compatible con backends que acepten GGUF como Ollama o LM Studio. Para el checkpoint safetensors BF16 se puede usar vLLM o TGI, aunque no se menciona compatibilidad explicita.
- Latencia y throughput: no se proporcionan datos concretos; dependen del backend, la cuantizacion y el hardware. Con MTP activo, la velocidad de decodificacion puede mejorar en funcion de la tasa de aceptacion del borrador.

## Comparativa con modelos similares

La comparativa se limita al modelo base y a alternativas "uncensored" de tamano similar, aunque no se dispone de datos publicos de rendimiento para estas ultimas.

| Modelo | Parametros | Contexto | Licencia | Caracteristica principal |
|---|---:|---:|---|---|
| Qwen/Qwen3.8-27B (base) | ~27,8B | 32K | Apache 2.0 | Modelo oficial con alineacion estandar, alta tasa de rechazo (59,2% en la evaluacion del autor) |
| joyfox/Qwen3.8-27B-Uncensored-JoyFox-Aggressive | ~27,8B | 32K | Apache 2.0 | Variante abliterada, rechazo 0,0%, mismas capacidades base |
| Dolphin 3.0 (similar, no verificado) | no disponible | no disponible | no disponible | Alternativa "uncensored" de la comunidad, sin datos publicados |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria.

## Limitaciones y advertencias

- El modelo no anade conocimiento factual; puede alucinar, aceptar premisas falsas o malinterpretar la intencion del usuario, como cualquier LLM.
- La intervencion "aggressive" reduce los rechazos, pero no elimina el riesgo de generar contenido inapropiado, ofensivo o ilegal si se usa sin control. El autor advierte que los usuarios son responsables de los controles de despliegue y de la legislacion aplicable.
- No se especifican sesgos conocidos, pero al ser un fine-tuning del modelo base, hereda los sesgos presentes en los datos de entrenamiento originales de Qwen3.8-27B.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones locales sobre discurso o moderacion.
- El soporte de tool calling o function calling no esta documentado en la model card; se recomienda verificar si el modelo base los incluye antes de usarlo en pipelines de agentes.
- La compatibilidad con backends como vLLM o TGI no esta confirmada para el checkpoint safetensors; el despliegue recomendado es llama.cpp con los archivos GGUF.
- El modelo solo ha sido validado con el runtime llama.cpp commit `885c5bbe8e04`; versiones mas recientes pueden requerir ajustes.

## Enlaces

- HuggingFace: https://huggingface.co/joyfox/Qwen3.8-27B-Uncensored-JoyFox-Aggressive
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- README en chino: https://huggingface.co/joyfox/Qwen3.8-27B-Uncensored-JoyFox-Aggressive/blob/main/README_ZH.md
- Repositorio de llama.cpp (mencionado en la model card, sin URL directa): se recomienda usar el commit `885c5bbe8e04` o posterior.
