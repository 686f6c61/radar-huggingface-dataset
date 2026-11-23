# mrfakename/Ling-3.1-flash-1019-abliterated

## Resumen

Ling-3.1-flash-1019-abliterated es una variante del modelo inclusionAI/Ling-3.1-flash-1019 en la que se ha eliminado el comportamiento de rechazo (refusal) mediante ablación direccional. Lo publica mrfakename, un contribuidor conocido de la comunidad open source, y mantiene intactos los ficheros, el formato y el layout FP8 del modelo original, por lo que se carga en cualquier entorno donde funcione el modelo base. El modelo base pertenece a la familia Ling de inclusionAI (Ant Group), con arquitectura híbrida `bailing_hybrid` y aproximadamente 572.000 millones de parámetros totales.

La relevancia de esta versión radica en el análisis técnico que acompaña a la publicación: el autor demuestra que los rechazos de Ling-3.1 no residen en una única dirección del espacio residual, sino en un subespacio de rango 4 distribuido en distintas capas según el tipo de prompt (inglés en modo chat, inglés en modo think y prompts sensibles a China). La edición se aplica únicamente a las escrituras al residual stream de las capas 16 a 71, con una intensidad por capa obtenida mediante búsqueda multiobjetivo.

El resultado es un modelo sin rechazos en la práctica (3/100 en chat y 7/100 en think mode, frente a 98/100 del original) con una divergencia mínima en prompts inocuos (KL de primer token de 0,1504). La licencia es MIT, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `bailing_hybrid` (híbrida, con capas densas y MoE; incluye capa MTP en la posición 72) |
| Parámetros totales | 572.120.680.768 (572,1 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (layout original del modelo base); GGUF Q8_0 disponible para evaluación |
| Idiomas soportados | no disponible (la model card menciona prompts en inglés y en chino) |
| Licencia | MIT |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base Ling-3.1-flash-1019 emplea la arquitectura `bailing_hybrid`, que combina capas densas con capas de mezcla de expertos (MoE). La model card de esta versión ablacionada menciona explícitamente cuatro capas densas, expertos enrutados (`mlp.shared_experts`), una capa MTP (multi-token prediction) en la posición 72 y 72 capas en el residual stream sobre las que se midieron las direcciones de rechazo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo original en la información proporcionada.

La innovación técnica de esta ficha es el procedimiento de ablación. El autor midió las direcciones de rechazo por separado para prompts en inglés en modo chat, en inglés en modo think y para prompts sensibles a China, en cada una de las 72 capas, como diferencia de medias entre prompts rechazados e inocuos con la media de los inocuos proyectada fuera. Con las 276 direcciones medidas se calculó un subespacio de rechazo de rango 4 (los cuatro primeros vectores singulares sobre las capas 26 a 71) que se proyectó fuera de las escrituras al residual stream de las capas 16 a 71, afectando a `attention.o_proj` y `mlp.shared_experts.down_proj` (o `mlp.down_proj` en las capas densas). La intensidad por capa se obtuvo con una búsqueda multiobjetivo (80 ensayos iniciales solo en chat, más 20 ensayos warm-started desde el frente de Pareto que puntuaron chat, think y prompts sensibles a China conjuntamente). Los tensores editados se recuantizaron a FP8 con sus escalas de bloque originales usando redondeo estocástico. Los expertos enrutados, los embeddings y la capa MTP quedan bit-idénticos al original.

## Capacidades

- Generación de texto y razonamiento en modo chat y en modo think (razonamiento explícito antes de responder).
- Respuesta a prompts en inglés y en chino, incluidos temas políticamente sensibles que el modelo original rechazaba o reformulaba con la narrativa oficial.
- Capacidad de razonamiento multi-paso en modo think, con cadenas de razonamiento que en el modelo original podían revertir un rechazo inicial.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio ni otras capacidades especiales en la información proporcionada.
- El comportamiento de rechazo se ha reducido drásticamente: 3/100 en chat y 7/100 en think mode en la evaluación del autor, frente a 98/100 del original.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve para estudiar cómo se distribuyen las direcciones de rechazo en un transformer híbrido grande y cómo responde el modelo cuando se eliminan, con métricas de divergencia (KL de primer token) publicadas para prompts inocuos.
- Evaluación de robustez de clasificadores de rechazo: al reducir los rechazos a 3/100 en chat, permite probar si los clasificadores de compliance detectan correctamente respuestas que antes se bloqueaban.
- Análisis de sesgo geopolítico: la comparación entre el modelo original y el ablacionado sobre prompts sensibles a China (Tiananmen, Xinjiang, Tibet, Hong Kong) documenta los patrones de rechazo, compliance y reformulación del modelo base.
- Generación de texto sin restricciones de contenido en entornos de investigación controlados, donde se necesita estudiar el comportamiento del modelo sin la capa de refusal.
- Estudio del modo think: el modelo conserva la capacidad de razonamiento extendido, útil para analizar cómo el razonamiento interno interactúa con las políticas de rechazo (el original a veces se razonaba fuera del rechazo).
- Base para experimentos de edición de modelos: el procedimiento de ablación por subespacio de rango 4 con búsqueda multiobjetivo por capa es replicable y sirve como referencia metodológica para otros modelos MoE grandes.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre GGUF Q8_0 con decodificación greedy:

| Métrica | Original | Ablacionado |
|---|---|---|
| Rechazos en chat (100 prompts) | 98/100 | 3/100 |
| Rechazos en think mode, juzgado sobre la respuesta (100 prompts) | 98/100 | 7/100 |
| Prompts sensibles a China en chat (40 prompts) | 14/40 | 0/40 |
| Prompts sensibles a China en think mode (40 prompts) | 9/40 | 3/40 |
| KL de primer token en 100 prompts inocuos | — | 0,1504 |

Las columnas de prompts sensibles a China contabilizan rechazo o reformulación alineada con el estado. Los prompts de evaluación están reservados respecto a los usados para medir las direcciones, con 384 tokens generados (1152 en think mode). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 573,8 GB, lo que refleja el tamaño del modelo en FP8 (572,1 mil millones de parámetros).
- VRAM estimada: en FP8, aproximadamente 572 GB solo para pesos, más overhead de activaciones y KV cache; se necesitan múltiples GPU de 80 GB (por ejemplo, 8× H100 80 GB) como mínimo para inferencia en FP8.
- En cuantizaciones GGUF más agresivas (Q4, Q3) el modelo podría reducirse a rangos de 300-350 GB, todavía fuera del alcance de GPU de consumo individuales.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones multi-GPU de consumo razonables.
- Opciones de despliegue: el autor distribuye GGUF (Q8_0 evaluado) compatible con llama.cpp; el formato safetensors con `custom_code` requiere cargar el código de la arquitectura `bailing_hybrid` del modelo base. No se dispone de información sobre soporte en vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos (chat) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.1-flash-1019-abliterated | 572,1 mil millones | no disponible | 3/100 | MIT | Hugging Face (safetensors, GGUF) |
| inclusionAI/Ling-3.1-flash-1019 (original) | 572,1 mil millones | no disponible | 98/100 | MIT | Hugging Face |
| DeepSeek-V4.1-Flash (mencionado en la model card) | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor compara el procedimiento de ablación con el aplicado a DeepSeek-V4.1-Flash, que según la model card necesitó dos vectores singulares frente a los cuatro de Ling-3.1. No se dispone de datos de rendimiento estándar para comparar con otras alternativas.

## Limitaciones y advertencias

- La eliminación del rechazo no elimina los sesgos subyacentes del modelo; puede generar contenido que el modelo original bloqueaba, incluyendo material sobre temas políticamente sensibles.
- Riesgo de alucinación: no evaluado en la información disponible; la ablación no aborda la veracidad factual.
- El modelo conserva el sesgo de reformulación del original en algunos casos: en think mode sobre prompts sensibles a China quedan 3/40 rechazos, y el autor documenta que el original reformulaba con la narrativa oficial en lugar de rechazar.
- La evaluación se realizó sobre GGUF Q8_0; el comportamiento en FP8 puede diferir ligeramente, aunque el autor recuantizó con redondeo estocástico para preservar la edición.
- Licencia MIT, que permite uso comercial, pero el uso de un modelo sin rechazos en producción conlleva responsabilidad legal y reputacional sobre el contenido generado.
- El tamaño (573,8 GB en FP8) lo hace inviable para despliegues de consumo; requiere infraestructura multi-GPU.
- No se dispone de información sobre el contexto máximo, los idiomas soportados formalmente ni el rendimiento en benchmarks estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrfakename/Ling-3.1-flash-1019-abliterated
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019
- Discord del autor: https://discord.com/invite/foss
