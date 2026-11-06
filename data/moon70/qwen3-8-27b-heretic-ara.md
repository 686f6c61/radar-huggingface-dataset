# moon70/Qwen3.8-27B-heretic-ara

## Resumen

Qwen3.8-27B-heretic-ara es un ajuste fino (finetune) del modelo multimodal Qwen/Qwen3.8-27B, publicado por el usuario moon70 en Hugging Face. Se trata de una variante "abliterated" o "uncensored": el autor ha aplicado la herramienta Heretic 2.0.0 con la técnica ARA para eliminar los mecanismos de rechazo (refusals) del modelo base, manteniendo en lo posible el resto de capacidades. El resultado es un modelo de 27.356 millones de parámetros (unos 27,4 B) que conserva la arquitectura del original y su licencia Apache 2.0.

El modelo resuelve un problema muy concreto: obtener una versión del Qwen3.8-27B que no se niegue a responder ante peticiones que el modelo base considera dañinas, con una degradación mínima en tareas estándar. Según la model card, la tasa de rechazo frente a 100 comportamientos dañinos cae de 98/100 a 6/100, y la tasa de rechazo por palabra clave en JailbreakBench pasa del 94 % al 1 %. A cambio, la divergencia KL en el primer token (sobre harmless_alpaca) sube de 0 a 0,26, y el rendimiento en MMLU (subconjunto de 1.425 ítems, 5-shot) baja de 0,834 a 0,803.

Es relevante ahora porque el pipeline declarado es image-text-to-text, lo que indica que el modelo conserva la capacidad multimodal del base, y porque la comunidad de modelos "sin censura" demanda alternativas que mantengan el rendimiento del original. No obstante, el propio autor advierte de un problema conocido: entre el 5 % y el 10 % de las respuestas a prompts dañinos abordan una pregunta distinta y harmlessly, lo que revela que la ablación no es perfecta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); tag `qwen3_5` en Hugging Face |
| Parametros totales | 27.356.728.560 (~27,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; no se listan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 54,7 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal con pipeline image-text-to-text y tag de arquitectura `qwen3_5` en Hugging Face. El ajuste aplicado no es un entrenamiento supervisado clásico ni RLHF: es una modificación de pesos orientada a eliminar direcciones de rechazo. Concretamente, el autor aplicó Heretic 2.0.0 con la técnica ARA (Ablation of Refusal Activations), usando LoRA de rango 50 con preservación de magnitudes de fila, en el trial 65, con los parámetros `start_layer_index 3`, `end_layer_index 52` y `neighbor_count 13`. Es decir, la intervención abarca desde la capa 3 hasta la 52 del transformer.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, porque el ajuste no es un entrenamiento generativo sino una ablación dirigida de activaciones. La innovación técnica destacable es precisamente ARA combinada con la búsqueda de hiperparámetros de Heretic 2.0.0 (el "trial 65" sugiere una búsqueda automática sobre configuraciones de capas y vecinos). El autor reporta métricas de compromiso entre eliminación de rechazos y preservación de capacidades: KL de 0,26 en el primer token, caída de 3,1 puntos en MMLU y mantenimiento prácticamente intacto de GSM8K (0,965 → 0,960 estricto; 0,965 → 0,978 flexible).

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Procesamiento de imagen y texto (pipeline image-text-to-text), por lo que se espera capacidad de describir imágenes, responder preguntas sobre ellas y tareas visión-lenguaje.
- Razonamiento matemático: GSM8K con 0,960 estricto y 0,978 flexible sobre 400 problemas.
- Conocimiento general: MMLU 0,803 en subconjunto de 1.425 ítems a 5-shot.
- Respuesta sin rechazos ante peticiones que el modelo base rechazaría (6/100 en el conjunto de 100 comportamientos dañinos de Heretic).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio controlado para medir cuánto se degrada un modelo al eliminar sus rechazos, comparando las métricas reportadas (MMLU, GSM8K, KL) con el base. Es adecuado porque el autor publica tanto la configuración de ablación como las métricas de compromiso.
- Red teaming y evaluación de filtros: permite generar respuestas que un modelo alineado bloquearía, lo que facilita probar clasificadores de contenido, guardrails y sistemas de moderación en pipelines de producción.
- Análisis de robustez de sistemas RAG multimodales: al conservar la entrada de imagen y texto, se puede usar para comprobar cómo responde un pipeline documental cuando el generador no aplica rechazos, evaluando si los filtros externos son suficientes.
- Generación de código y matemáticas en entornos de investigación: con GSM8K en torno a 0,96 y MMLU en 0,80, es viable para prototipos de resolución de problemas y generación de scripts donde no se requiere alineación estricta.
- Estudio de fenómenos de "refusal direction" en transformers: los parámetros publicados (capas 3-52, LoRA rango 50, neighbor_count 13) permiten reproducir y comparar la técnica ARA con otras aproximaciones de abliteration.
- Evaluación de sesgos y toxicidad: al eliminar los rechazos, el modelo expone de forma más directa los sesgos latentes del base, lo que resulta útil para auditar la calidad de los datos de entrenamiento originales.
- Despliegue en demos de investigación con `AutoModelForImageTextToText` y `device_map="cuda"`, tal como indica el autor, para experimentos que requieran el modelo completo en GPU.

## Benchmarks y rendimiento

| Benchmark | Base (Qwen3.8-27B) | Este modelo |
|---|---|---|
| Heretic refusals (100 harmful_behaviors) | 98/100 | 6/100 |
| KL divergence, primer token (harmless_alpaca) | 0 | 0,26 |
| JailbreakBench harmful, rechazo por palabra clave | 94 % | 1 % |
| MMLU (subconjunto 1.425 ítems, 5-shot) | 0,834 | 0,803 |
| GSM8K (400 problemas), estricto | 0,965 | 0,960 |
| GSM8K (400 problemas), flexible | 0,965 | 0,978 |

No se han publicado en la información disponible resultados de otros benchmarks (HumanEval, MMLU-Pro, MATH, MMMU, etc.) ni comparaciones con modelos de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: el repo pesa 54,7 GB en safetensors, por lo que se necesitan aproximadamente 55-60 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV.
- En cuantización de 8 bits: en torno a 28-30 GB de VRAM.
- En cuantización de 4 bits: en torno a 15-17 GB de VRAM (no se ofrecen pesos GGUF en el repo; habría que cuantizar localmente).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para FP16 sin offloading; A100 40 GB o dos RTX 4090 (24 GB cada una) con tensor parallelism para FP16; una sola RTX 4090 o RTX 3090 es viable solo con cuantización a 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización 4 bits; en FP16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `device_map="cuda"` (método indicado por el autor); vLLM, TGI y llama.cpp no están confirmados en la información disponible, y llama.cpp requeriría generar primero un GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.8-27B-heretic-ara | ~27,4 B | no disponible | Sí (image-text-to-text) | Apache 2.0 | Finetune abliterated |
| Qwen/Qwen3.8-27B (base) | ~27,4 B | no disponible | Sí | Apache 2.0 | Modelo original alineado |
| Otras variantes abliterated de Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base: misma arquitectura, mismos parámetros y licencia, pero con rechazos reducidos de 98/100 a 6/100 y una caída de 3,1 puntos en MMLU. No se dispone de información sobre otras variantes abliterated comparables ni sobre modelos de tamaño similar con los que contrastar rendimiento.

## Limitaciones y advertencias

- El autor reconoce que entre el 5 % y el 10 % de las respuestas a prompts dañinos abordan una pregunta distinta y harmlessly; es un fallo de coherencia introducido por la ablación.
- La eliminación de rechazos implica que el modelo puede generar contenido dañino, ilegal o inseguro sin filtros; no es apto para despliegues públicos sin guardrails externos.
- Degradación medible en conocimiento general: MMLU baja de 0,834 a 0,803, y la divergencia KL de 0,26 en el primer token indica cambios en la distribución de salida incluso ante prompts harmlessly.
- Riesgo de alucinación: no se han publicado métricas específicas de factualidad; la modificación de pesos puede alterar el comportamiento ante preguntas ambiguas.
- Idiomas soportados no documentados; se desconoce si el ajuste afecta al rendimiento multilingüe del base.
- Longitud de contexto no documentada en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar normativas locales o las políticas de las plataformas de despliegue; la responsabilidad recae en el operador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni revisiones independientes.
- El pipeline image-text-to-text requiere `AutoModelForImageTextToText`; usar `AutoModelForCausalLM` puede fallar o degradar el rendimiento multimodal.

## Enlaces

- Hugging Face: https://huggingface.co/moon70/Qwen3.8-27B-heretic-ara
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteration): no disponible en la información proporcionada
- Paper de ARA: no disponible en la información proporcionada
- Repositorio o demo: no disponible en la información proporcionada
