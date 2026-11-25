# boogieboo/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 es una versión modificada a nivel de pesos del modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicada por el usuario `boogieboo` (el trabajo se atribuye en la model card a `@dealignai`). El objetivo es eliminar el comportamiento de rechazo (refusal) del modelo base mediante una técnica de abliteration aplicada directamente sobre los pesos en FP8 nativo, preservando todas las capacidades originales: visión, vídeo, niveles de esfuerzo de razonamiento, tool calling y una ventana de contexto de 1M de tokens.

Se trata de un transformer MoE de 40 capas con 763.205.315.794 parámetros totales (según los safetensors del repo, ~763 mil millones), pesos en FP8 (e4m3) con escalas de bloque ue8m0 y expertos MoE en FP4. El repositorio ocupa 510,3 GB distribuidos en 48 shards de safetensors, y es byte-compatible con el motor de inferencia de referencia de DeepSeek, por lo que se puede servir con la infraestructura upstream sin cambios de código.

Su relevancia es doble: por un lado, es un ejemplo de modificación de pesos sin fine-tuning, sin LoRA ni jailbreaks de plantilla, lo que resulta técnicamente interesante para quienes investigan alineación y edición de modelos; por otro, su licencia MIT y su tamaño lo hacen inaccesible para hardware de consumo, requiriendo despliegues multi-GPU de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 40 capas (deepseek_v41), multimodal (imagen + vídeo) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 nativo (e4m3) con escalas de bloque ue8m0; expertos MoE en FP4; existe un release hermano EXL3 a 2,9 bpw |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards), FP8 e4m3 + FP4 experts; engine de inferencia de referencia incluido |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) de 40 capas con aproximadamente 763 mil millones de parámetros totales, según los metadatos de safetensors. Emplea pesos en FP8 (formato e4m3fn) con escalas de bloque ue8m0 y expertos en FP4, la misma precisión con la que DeepSeek distribuye el modelo original. Incluye decodificación especulativa DSpark, soporte multimodal de imagen y vídeo, y niveles de esfuerzo de razonamiento configurables (`low`, `high`, `max`).

La modificación de esta versión es exclusivamente a nivel de pesos: se aplica una abliteration sobre el checkpoint FP8 nativo, sin fine-tuning supervisado, sin RLHF, sin DPO, sin LoRA ni adaptadores, sin modificación de la plantilla de chat Jinja, sin prompt de sistema inyectado y sin cambios en el tokenizador. Según la model card, los tensores modificados permanecen en FP8 e4m3 con su granularidad de bloque original, y el formato en disco es byte-compatible con el motor `inference/` de referencia de DeepSeek. No se proporcionan datos sobre el número de tokens de entrenamiento del modelo base ni sobre la composición de su dataset.

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables (`low`, `high`, `max`).
- Procesamiento multimodal de imagen y vídeo (pipeline `image-text-to-text`).
- Tool calling y function calling.
- Razonamiento multi-paso y flujos de agente.
- Ventana de contexto de 1M tokens para documentos y conversaciones extensas.
- Decodificación especulativa DSpark para acelerar la inferencia.
- Capacidades multilingües en inglés, chino, español, francés, ruso, italiano y tailandés.
- Comportamiento sin rechazo (uncensored) sobre los temas que el modelo base declinaba.

## Casos de uso

- Investigación sobre alineación y edición de modelos: permite estudiar cómo una modificación a nivel de pesos afecta al comportamiento de rechazo sin alterar el resto de capacidades, comparando directamente contra el modelo base.
- Análisis de documentos extensos: con 1M tokens de contexto se pueden procesar libros completos, expedientes o bases de código en una sola pasada sin fragmentación.
- Procesamiento de vídeo e imagen en pipelines de inspección: el soporte multimodal permite describir, clasificar o extraer información de material audiovisual en tareas de análisis automatizado.
- Agentes autónomos con tool calling: la combinación de razonamiento por niveles y llamadas a herramientas encaja en orquestadores que necesitan planificar y ejecutar pasos con APIs externas.
- Generación de contenido creativo sin restricciones temáticas: útil en entornos de ficción, guion o narrativa donde el modelo base rechazaría ciertos temas.
- Evaluación comparativa de robustez: sirve como referencia para medir cuánto se degrada el rendimiento (por ejemplo, MMLU) tras una abliteration frente al modelo original.
- Atención al cliente multilingüe: cubre siete idiomas y conversaciones multi-turno largas, aunque su coste de despliegue limita su uso a organizaciones con infraestructura propia.

## Benchmarks y rendimiento

La model card incluye una evaluación interna de MMLU en modo logit (57 materias × 20 preguntas, 1140 preguntas totales), con decodificación greedy T=0 y el mismo prompt en ambos casos. El bundle modificado se ejecutó con el motor upstream en 4×H200 (TP4) y el modelo base contra la API oficial de DeepSeek.

| Modelo | MMLU-20×57 | Δ vs base |
|---|---:|---:|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/1140) | — |
| DeepSeek-V4.1-Flash-1017 UNCENSORED FP8 (este repo) | no disponible (dato truncado en la información proporcionada) | no disponible |

No se han publicado en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks.

## Requisitos de hardware

- VRAM estimada: el repo pesa 510,3 GB en FP8; se necesita un conjunto de GPUs cuya memoria agregada supere esa cifra con margen para el estado de inferencia y el contexto.
- GPU recomendadas: la model card reporta ejecución en 4×H200 con tensor parallelism 4 (TP4); configuraciones equivalentes de A100 80 GB o H100 también son viables en teoría, aunque no se documentan en la información disponible.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 3090, etc.) por el tamaño del checkpoint.
- Opciones de despliegue: motor `inference/` de referencia de DeepSeek incluido en el repo; el formato es byte-compatible con el base, por lo que cualquier stack que cargue el modelo original debería cargar este. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. La model card menciona decodificación especulativa DSpark y recomienda `max_tokens ≥ 256K` para el modo razonador, lo que implica generaciones largas y costosas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este) | ~763B | 1M | Sí (imagen + vídeo) | MIT | Abliterated, FP8 nativo, tool calling, razonamiento por niveles |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | ~763B | 1M | Sí | no disponible en la información proporcionada | Modelo original con comportamiento de rechazo |
| dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED | ~763B | 1M | Sí | no disponible en la información proporcionada | Versión uncensored con abliteration rehecha a 2,9 bpw, pensada para menor huella de memoria |
| dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8 | ~763B | 1M | Sí | no disponible en la información proporcionada | Alias del mismo repo según la model card |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido modificado para eliminar el rechazo: puede generar contenido dañino, ilegal o sexualmente explícito. El acceso está condicionado a una puerta de verificación de edad (18+) y a la aceptación de responsabilidad por parte del usuario.
- La abliteration puede degradar capacidades: la propia model card advierte que cuantizar este checkpoint FP8 a bits bajos acumula error sobre la edición y puede hacer que el modelo vuelva a rechazar peticiones; recomienda rehacer el pipeline a la precisión objetivo.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se documentan evaluaciones de factualidad.
- No se han publicado datos sobre sesgos conocidos en la información disponible.
- El tamaño de 510,3 GB y los ~763B parámetros hacen inviable el despliegue en hardware de consumo; requiere clústeres multi-GPU.
- Aunque la licencia es MIT, el uso comercial de un modelo sin rechazo conlleva responsabilidad legal sobre los outputs en la jurisdicción de cada usuario.
- El soporte de idiomas se limita a en, zh, es, fr, ru, it y th; el rendimiento en idiomas no listados no está garantizado.
- La información sobre benchmarks está truncada en la fuente: solo se conoce el resultado del modelo base (87,63 % en MMLU), no el del modelo modificado.

## Enlaces

- Hugging Face: https://huggingface.co/boogieboo/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Alias del mismo repo: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Versión EXL3 2,9 bpw: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Twitter del autor: https://twitter.com/dealignai
- Twitter del proveedor de cómputo: https://twitter.com/jordanschenck
- Ko-fi del autor: https://ko-fi.com/dealignai
