# AtomicChat/Inkling-2-Mini-Uncensored-GGUF

## Resumen

Inkling-2-Mini-Uncensored-GGUF es una compilación no censurada (uncensored) del modelo thinkingmachines/Inkling-2-Mini, publicada por AtomicChat, el equipo detrás de la aplicación Atomic Chat para ejecutar modelos de pesos abiertos en local y sin conexión. El modelo base es un mixture-of-experts (MoE) de 26,4 mil millones de parámetros con 3,4 mil millones activos y un núcleo recurrente (looped core), capaz de aceptar entrada de texto e imagen. Esta variante elimina la dirección de rechazo (refusal direction) de los pesos que escriben en el residual stream, de modo que el modelo responde a peticiones que el original rechazaría.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de modificación de pesos orientada a eliminar el comportamiento de rechazo, una práctica cada vez más habitual en el ecosistema de modelos abiertos. Por otro, el repositorio se encuentra en estado "in progress": en el momento de la publicación solo están disponibles los metadatos y el adaptador LoRA, mientras que los ficheros GGUF definitivos aún no se han publicado. El tamaño del repositorio es de 1,3 GB y el número de parámetros reportado en safetensors es de 318.256.128, un dato que no coincide con los 26,4B anunciados en la model card y que conviene tratar con cautela.

La licencia es Apache-2.0, la misma que el modelo base. La arquitectura recurrente del modelo base exige una versión de llama.cpp que incluya el PR ggml-org/llama.cpp#32695 (draft en el momento de la publicación); las versiones estándar de llama.cpp no cargan este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con núcleo recurrente (looped core), transformer; entrada texto e imagen |
| Parametros totales | 26,4B (según model card); 318.256.128 reportados en safetensors (dato discrepante) |
| Parametros activos | 3,4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones estándar de llama.cpp; niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF; adaptador LoRA para llama.cpp (`--lora-scaled`) |

## Arquitectura y entrenamiento

El modelo base es un MoE de 26,4B parámetros totales con 3,4B activos y un núcleo recurrente (looped core), lo que implica que el modelo reutiliza bloques de cómputo en varias pasadas internas. Acepta entrada multimodal de texto e imagen, según el pipeline image-text-to-text declarado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La modificación de AtomicChat consiste en eliminar la dirección de rechazo de los pesos que escriben en el residual stream. El repositorio incluye un adaptador LoRA pensado para cargarse con `--lora-scaled` en llama.cpp, además de ficheros GGUF con la edición ya aplicada (aún no publicados en el momento de la ficha). La model card indica que se reportarán métricas de rechazos antes y después, XSTest (falsos rechazos en prompts seguros), MMLU y KLD frente al modelo original, pero estos datos no están disponibles todavía.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imágenes junto con texto (pipeline image-text-to-text).
- Respuesta a peticiones que el modelo base rechazaría, por la eliminación de la dirección de rechazo.
- Carga mediante adaptador LoRA sobre el modelo base en llama.cpp.
- Capacidades de tool calling, agentes o thinking mode: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Investigación sobre alineación y rechazo: el adaptador LoRA permite comparar el comportamiento del modelo con y sin la dirección de rechazo sobre el mismo conjunto de prompts, midiendo tasas de rechazo y falsos rechazos con XSTest.
- Evaluación de robustez de salvaguardas: útil para estudiar hasta qué punto una edición de pesos en el residual stream altera el comportamiento de seguridad de un MoE multimodal.
- Desarrollo de aplicaciones locales de escritorio: al estar empaquetado en GGUF y orientado a llama.cpp, encaja en la app Atomic Chat para ejecución offline en el equipo del usuario.
- Experimentación con arquitecturas recurrentes: el núcleo looped del modelo base permite estudiar el comportamiento de MoE con reutilización de bloques en tareas de razonamiento.
- Prototipado de asistentes multimodales: la entrada de imagen y texto habilita pruebas de descripción de imágenes o respuesta a preguntas visuales en local.
- Análisis de discrepancias de metadatos: el repositorio sirve como caso de estudio sobre la diferencia entre parámetros anunciados (26,4B) y parámetros reportados en safetensors (318M), relevante para pipelines de verificación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que se reportarán rechazos antes y después, XSTest, MMLU y KLD, pero en el momento de la ficha esos datos no están incluidos.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. Con 26,4B parámetros totales y 3,4B activos, una cuantización Q4 requeriría del orden de 15-17 GB de VRAM solo para pesos; el repositorio actual ocupa 1,3 GB, lo que sugiere que los GGUF completos aún no están publicados.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; dependerá del tamaño final de los GGUF publicados.
- Despliegue: llama.cpp con el PR ggml-org/llama.cpp#32695 obligatorio; las versiones sin ese PR no cargan el modelo. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-GGUF | 26,4B totales / 3,4B activos (MoE) | no disponible | Apache-2.0 | Variante uncensored con LoRA y GGUF; requiere llama.cpp con PR #32695 |
| thinkingmachines/Inkling-2-Mini | 26,4B totales / 3,4B activos (MoE) | no disponible | Apache-2.0 | Modelo base original, con comportamiento de rechazo intacto |
| AtomicChat/Inkling-2-Mini-GGUF | 26,4B totales / 3,4B activos (MoE) | no disponible | Apache-2.0 | Cuantizaciones GGUF del modelo original sin modificar |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio está en estado "in progress": los GGUF definitivos y las métricas prometidas (rechazos, XSTest, MMLU, KLD) aún no están publicados.
- Existe una discrepancia entre los 26,4B parámetros anunciados en la model card y los 318.256.128 parámetros reportados en safetensors; conviene verificar el modelo antes de usarlo en producción.
- La eliminación de la dirección de rechazo implica que el modelo responderá a peticiones que el original rechaza; el autor declara que la responsabilidad del uso recae en el usuario.
- Requiere una versión de llama.cpp con el PR #32695, que era un draft en el momento de la publicación; las releases estándar no cargan el modelo.
- No hay información sobre sesgos, riesgo de alucinación, idiomas soportados ni longitud de contexto.
- La licencia Apache-2.0 permite uso comercial, pero la modificación de seguridad puede contravenir políticas de uso aceptable de plataformas que integren el modelo base.
- No se han publicado métricas de degradación (KLD) frente al modelo original, por lo que se desconoce el impacto de la edición en la calidad general.

## Enlaces

- Hugging Face: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones originales: https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
- PR de llama.cpp requerido: https://github.com/ggml-org/llama.cpp/pull/32695
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
