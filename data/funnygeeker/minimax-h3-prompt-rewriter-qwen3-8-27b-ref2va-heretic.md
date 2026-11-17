# funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic

## Resumen

MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic es una versión "decensored" (sin alineación de rechazo) del modelo lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA, publicada por el usuario funnygeeker. Se trata de un modelo multimodal image-text-to-text de 27.356.728.560 parámetros (unos 27,36 mil millones) construido sobre la familia Qwen 3.5/3.8, especializado en la reescritura de prompts para el sistema MiniMax-H3 (variante Ref2VA). El objetivo declarado del modelo base es tomar una entrada multimodal (imagen y texto) y reescribirla como prompt optimizado para un generador posterior.

La modificación se realizó con la herramienta Heretic v2.1.0 y su modificador ARA (Activation Refusal Alignment), aplicada sobre los pesos completos en BF16 y fusionada directamente en el checkpoint, no como adaptador. El resultado es un checkpoint de 55.563.007.192 bytes, idéntico byte a byte al modelo original, con 12 shards más un fichero adicional `model-mtp.safetensors`. La tasa de rechazo medida baja de 99/100 a 25/100 sobre el conjunto `mlabonne/harmful_behaviors`, a costa de una divergencia KL de 0,0465 nats frente al modelo fuente sobre `mlabonne/harmless_alpaca`.

Es relevante ahora porque ejemplifica una práctica creciente en el ecosistema abierto: la publicación de variantes "abliterated" de modelos especializados con licencia Apache 2.0, que preservan la arquitectura y las capacidades del original pero eliminan parcialmente los mecanismos de rechazo. El modelo conserva el torre de visión (0,461B) y la cabeza MTP (0,425B, 810 MB) del original, lo que lo mantiene apto para tareas multimodales de reescritura de prompts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen 3.5/3.8, con torre de visión y cabeza MTP (multi-token prediction) |
| Parametros totales | 27.356.728.560 (~27,36B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 nativo; variantes oQ4e (~5,04 bits/peso BF16) y oQ4e-fp16 (~5,31 bits/peso FP16) publicadas por el mismo autor |
| Idiomas soportados | inglés y chino (según tags de la model card); no se detalla cobertura adicional |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (12 shards + `model-mtp.safetensors`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen 3.5/3.8 multimodal: un transformer con torre de visión separada (0,461B de parámetros) y una cabeza MTP (multi-token prediction) de 0,425B (810 MB) empaquetada en `model-mtp.safetensors`. La estructura de capas documentada en la modificación indica 64 capas totales, con atención y MLP estándar (módulos `attn.o_proj` y `mlp.down_proj`). El checkpoint heretic conserva intactos la capa 0, las capas 44-63 (21 capas), los embeddings de tokens, todas las capas Norm, la torre de visión y la cabeza MTP.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La modificación de alineación se aplicó sobre 86 módulos (43 capas × 2 tipos de módulo: `attn.o_proj` y `mlp.down_proj`), en el rango de capas 1 a 43 (índice final exclusivo 44), con los hiperparámetros `preserve_good_behavior_weight = 0,7683`, `steer_bad_behavior_weight = 0,0001032` (en el límite inferior de búsqueda), `overcorrect_relative_weight = 1,0051` y `neighbor_count = 2`. La búsqueda seleccionó el índice 1 de la frontera de Pareto de 30 ejecuciones.

## Capacidades

- Generación de texto y reescritura de prompts: función principal del modelo, orientada a transformar entradas en prompts optimizados para el sistema MiniMax-H3 Ref2VA.
- Procesamiento multimodal image-text-to-text: acepta imagen y texto como entrada gracias a la torre de visión de 0,461B.
- Descripción y comprensión de imágenes: capacidad heredada del modelo base, útil para enriquecer prompts visuales.
- Predicción multi-token (MTP): la cabeza MTP de 0,425B permite decodificación especulativa o generación acelerada.
- Conversación multi-turno: pipeline etiquetado como conversational en los tags.
- Multilingüismo limitado: inglés y chino según los tags de la model card.
- Modo "heretic"/decensored: reduce la tasa de rechazo de 99/100 a 25/100, lo que permite generar contenido que el modelo base rechazaría.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Reescritura de prompts para generación visual: el modelo toma una imagen de referencia y una instrucción textual y genera un prompt optimizado para el pipeline MiniMax-H3 Ref2VA. Es el caso de uso central declarado del modelo base.
- Investigación sobre alineación y refusal: la diferencia de tasa de rechazo (99/100 frente a 25/100) y la divergencia KL de 0,0465 nats lo convierten en un objeto de estudio controlado para medir el impacto de modificaciones ARA en modelos multimodales.
- Auditoría de sesgos y seguridad en modelos abiertos: permite comparar el comportamiento del modelo fuente y la variante heretic sobre los mismos conjuntos de prompts (`harmful_behaviors` y `harmless_alpaca`), con métricas reproducibles.
- Generación de descripciones detalladas de imágenes en pipelines creativos: la torre de visión y la capacidad de reescritura permiten producir prompts ricos en detalle para herramientas de síntesis de imagen.
- Prototipado de asistentes conversacionales multimodales en entornos controlados: su naturaleza conversacional y su entrada image-text lo hacen apto para pruebas internas de diálogo con soporte visual.
- Experimentación con decodificación especulativa: la cabeza MTP facilita la implementación de técnicas de generación acelerada en investigación sobre latencia.
- Generación de contenido en chino e inglés: útil para equipos que necesitan reescritura de prompts en ambos idiomas sin depender de APIs externas.
- Evaluación de técnicas de cuantización: las variantes oQ4e (~5,04 bits/peso) y oQ4e-fp16 (~5,31 bits/peso) permiten estudiar la degradación de calidad frente al BF16 completo.

## Benchmarks y rendimiento

| Metrica | Modelo fuente | Este modelo |
|---|---|---|
| Tasa de rechazo (KeywordRate, 100 prompts de `mlabonne/harmful_behaviors`) | 99 / 100 | 25 / 100 |
| Divergencia KL (100 prompts de `mlabonne/harmless_alpaca`, `KL(fuente ‖ este modelo)`) | 0 (por definición) | 0,0465 nats |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 64-80 GB para inferencia cómoda.
- VRAM estimada en oQ4e (~5,04 bits/peso): alrededor de 17-18 GB para pesos, viable en GPUs de 24 GB con margen limitado.
- VRAM estimada en oQ4e-fp16 (~5,31 bits/peso): ligeramente superior, pensada para chips Apple M1/M2 sin aceleración BF16.
- GPUs recomendadas: A100 80 GB, H100 80 GB o H200 para BF16; RTX 4090 (24 GB) o RTX 3090 (24 GB) solo con cuantización oQ4e.
- Cabe en GPU de consumo: sí, con las variantes cuantizadas del mismo autor (oQ4e y oQ4e-fp16); en BF16 no cabe en GPUs de 24 GB.
- Opciones de despliegue: transformers (librería declarada), vLLM (referenciado en la model card del modelo fuente) y herramientas compatibles con safetensors. Compatibilidad con llama.cpp, Ollama o TGI no confirmada en la información disponible.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere posibilidad de decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic | ~27,36B | no disponible | Apache 2.0 | Reescritura de prompts multimodal, sin alineación de rechazo | Hugging Face |
| lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA | ~27,36B | no disponible | Apache 2.0 (presumible) | Reescritura de prompts multimodal alineado | Hugging Face |
| funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-oQ4e-mtp | ~27,36B (cuantizado ~5,04 bits/peso) | no disponible | Apache 2.0 | Ídem, cuantizado para GPUs de consumo | Hugging Face |
| funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-oQ4e-fp16-mtp | ~27,36B (cuantizado ~5,31 bits/peso) | no disponible | Apache 2.0 | Ídem, para chips Apple M1/M2 | Hugging Face |

No se dispone de datos de rendimiento comparativo frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Filtrado de seguridad reducido: la tasa de rechazo baja del 99 % al 25 %, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado.
- No apto para audiencias generales: la model card advierte explícitamente que no es adecuado para entornos públicos, usuarios menores de edad o aplicaciones con altos requisitos de seguridad.
- Riesgo de alucinación: no cuantificado en la información disponible; la modificación ARA no corrige este comportamiento.
- Divergencia respecto al original: la KL de 0,0465 nats indica que el modelo se desvía del fuente incluso en prompts benignos, lo que puede afectar a la fidelidad en tareas de reescritura.
- Limitación idiomática: solo inglés y chino están declarados; no hay evidencia de rendimiento en castellano.
- Longitud de contexto no documentada: dificulta planificar despliegues con entradas largas.
- Uso comercial: la licencia Apache 2.0 lo permite técnicamente, pero la model card recomienda limitarlo a investigación, pruebas o entornos controlados y evitar producción o aplicaciones públicas.
- Responsabilidad legal: el autor declina toda responsabilidad sobre las consecuencias del uso; el usuario asume la carga legal y ética.
- Requiere monitorización humana: se recomienda revisión manual en tiempo real de las salidas generadas.
- Ausencia de garantías de seguridad por defecto: a diferencia de modelos estándar, no ha pasado por optimización de seguridad rigurosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic
- Modelo base: https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA
- Variante oQ4e-mtp: https://huggingface.co/funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-oQ4e-mtp
- Variante oQ4e-fp16-mtp: https://huggingface.co/funnygeeker/MiniMax-H3-Prompt-Rewriter-Qwen3.8-27B-Ref2VA-heretic-oQ4e-fp16-mtp
- Herramienta Heretic: https://github.com/junnif/Heretic
- Conjunto `mlabonne/harmful_behaviors`: no disponible como enlace directo en la información proporcionada
- Conjunto `mlabonne/harmless_alpaca`: no disponible como enlace directo en la información proporcionada
