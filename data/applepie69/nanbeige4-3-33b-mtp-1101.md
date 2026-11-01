# applepie69/Nanbeige4.3-33B-MTP-1101

## Resumen

Nanbeige4.3-33B-MTP-1101 es una cabeza de predicción multi-token (MTP, multi-token prediction) entrenada por el usuario applepie69 para el modelo base Nanbeige/Nanbeige4.3-33B. No es un modelo completo: es un adaptador de 694 millones de parámetros (bf16, ~1,29 GB) que se acopla al modelo base congelado y predice el token posterior al siguiente, lo que permite a un runtime de decodificación especulativa generar varios tokens por pasada del modelo grande. La arquitectura sigue el estilo de la MTP de DeepSeek-V3 con profundidad 1.

El interés práctico de esta pieza es que el Nanbeige4.3-33B original no incluye pesos MTP, de modo que esta cabeza añade capacidad de decodificación especulativa sin reentrenar el modelo completo. Se entrenó por autodestilación: la cabeza observa el estado oculto final del modelo base y el embedding del token siguiente, y aprende a reproducir la distribución de salida del propio modelo base para el token t+2 mediante divergencia KL a través de la LM head compartida y congelada.

El repositorio incluye una implementación de referencia (`mtp_head.py`) y un benchmark de velocidad de extremo a extremo (`speed_test.py`). La cabeza está pensada para funcionar mejor con el modelo base cuantizado a 4 bits NF4, que es la precisión con la que se extrajeron las características de entrenamiento. La licencia es Apache 2.0 y el modelo base pertenece a Nanbeige.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP estilo DeepSeek-V3, profundidad 1: `eh_proj` (2*7168 -> 7168) + una capa `LlamaDecoderLayer` + normalización compartida + LM head del modelo base |
| Parametros totales | 694 M (solo la cabeza; no incluye embedding ni LM head) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Nanbeige4.3-33B, no especificada en la información) |
| Tipos de cuantizacion | La cabeza se distribuye en bf16; el modelo base se usa en 4-bit NF4 (precisión nativa de entrenamiento) y también admite bf16/8-bit con menor acuerdo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mtp_head.safetensors) |

## Arquitectura y entrenamiento

La cabeza implementa una MTP de profundidad 1 al estilo DeepSeek-V3. Para cada posición t toma el estado oculto final del modelo base tras `model.norm` (h_t) y el embedding del token x_{t+1} (e_{t+1}); ambos se normalizan (`hnorm`, `enorm`), se concatenan (2*7168 -> 7168) y pasan por `eh_proj`. El resultado atraviesa una capa `LlamaDecoderLayer` adicional con su propia atención y MLP, y finalmente la LM head compartida y congelada del modelo base produce los logits para el token x_{t+2}. Los tensores se nombran con la convención DeepSeek/GLM de una capa extra tras el último bloque (`model.layers.52.*`). La cabeza se inicializó desde una copia de la última capa decodificadora del modelo base.

El entrenamiento congela el modelo base y entrena la cabeza para igualar la distribución de salida del propio modelo base mediante divergencia KL a través de la LM head compartida. Los datos son texto de chat, razonamiento matemático y código formateado con la plantilla de chat del modelo base y empaquetado en filas de 1024 tokens: `HuggingFaceH4/ultrachat_200k` (split train_sft, ~40% de los tokens), `open-r1/OpenR1-Math-220k` (split train, ~40%) y `bigcode/self-oss-instruct-sc2-exec-filter-50k` (split train, ~20%). Se usaron 600.064 tokens de estados ocultos almacenados, 2 épocas, batch de 1 fila, learning rate pico 0,0002 con schedule coseno, AdamW de 8 bits con autocast fp16. Las características se extrajeron del modelo base cuantizado a 4 bits NF4 en 2 x Tesla T4, por lo que la cabeza se ajusta mejor a esa precisión.

## Capacidades

- Predicción del token posterior al siguiente (t+2) a partir del estado oculto del modelo base y del embedding del token t+1.
- Decodificación especulativa de profundidad 1: borrador de un token por posición que el modelo base verifica después.
- Modo greedy sin pérdida (lossless): cada token borrador se verifica contra el modelo base, de modo que la salida es idéntica a la del modelo base.
- Modo de muestreo especulativo real (true speculative sampling), según la implementación de referencia del repositorio.
- Rollback de caché KV durante la verificación, necesario para descartar borradores rechazados.
- No es un modelo generativo autónomo: no genera texto por sí mismo, requiere el modelo base Nanbeige4.3-33B.
- No soporta tool calling, agentes ni multimodalidad por sí misma; esas capacidades dependerían del modelo base.

## Casos de uso

- Aceleración de inferencia en producción del Nanbeige4.3-33B: integrar la cabeza en un runtime de decodificación especulativa para reducir el número de pasadas del modelo grande por token generado, manteniendo la salida idéntica en modo greedy.
- Servicio de chat de baja latencia: usar el modo de muestreo especulativo para reducir el tiempo hasta el primer token y el tiempo por token en conversaciones multi-turno, donde la verificación greedy garantiza consistencia con el modelo base.
- Generación de código asistida: el entrenamiento incluye un 20% de tokens de código (self-oss-instruct), lo que hace a la cabeza especialmente adecuada para pipelines de autocompletado y generación de código sobre el modelo base.
- Razonamiento matemático: con un 40% de tokens de OpenR1-Math, la cabeza está alineada con las distribuciones del modelo base en tareas de matemáticas y razonamiento paso a paso.
- Despliegue en hardware modesto: el benchmark de referencia se ejecuta en 2 x Tesla T4 (16 GB) con el modelo base en 4-bit NF4, lo que permite montar decodificación especulativa en GPUs de gama media.
- Evaluación e investigación de MTP: el repositorio sirve como referencia reproducible para estudiar el impacto de una cabeza MTP de profundidad 1 sobre la velocidad de decodificación y la tasa de aceptación.
- Reducción de coste por token en servicios de inferencia: al aumentar los tokens generados por pasada del modelo base (acceptance length), se reduce el coste computacional por token en despliegues con vLLM u otros runtimes que soporten decodificación especulativa.

## Benchmarks y rendimiento

Resultados de la cabeza sobre texto retenido, con la misma mezcla de datos que el entrenamiento (teacher-forced sobre texto del dataset):

| Metrica | Valor | Significado |
|---|---|---|
| Acuerdo top-1 | 50,1% | Posiciones en las que la mejor predicción de la cabeza para t+2 coincide con la del modelo base |
| Top-3 contiene el top-1 | 69,8% | Posiciones en las que el mejor token del modelo base está entre los tres mejores de la cabeza |
| Divergencia KL | 1,782 | Distancia media (nats) entre distribuciones de la cabeza y del modelo base |
| Posiciones evaluadas | 10.230 | |

Velocidad de extremo a extremo medida (batch 1, 2 x Tesla T4, modelo base en 4-bit NF4, atención `sdpa`, 5 prompts por dominio: agéntico, chat, chino, código y matemáticas, 128 tokens nuevos; medición intercalada con 2 ejecuciones de calentamiento descartadas). La información proporcionada no incluye los valores numéricos finales de throughput ni de acceptance length, solo el método.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cabeza en la información disponible.

## Requisitos de hardware

- La cabeza en bf16 ocupa ~1,29 GB de VRAM; el modelo base Nanbeige4.3-33B en 4-bit NF4 ocupa aproximadamente 17-18 GB, por lo que el conjunto requiere del orden de 20 GB de VRAM para inferencia en 4 bits.
- El benchmark de referencia se ejecutó en 2 x Tesla T4 (16 GB cada una, Kaggle) con el modelo base en 4-bit NF4 y atención `sdpa`.
- En bf16 el modelo base de 33B requiere ~66 GB de VRAM, lo que exige A100 80 GB, H100 80 GB o múltiples GPUs.
- No cabe en GPUs de consumo de 24 GB (RTX 4090) en bf16; en 4-bit NF4 podría ajustarse en una RTX 4090 de 24 GB, aunque no está verificado en la información disponible.
- Opciones de despliegue: `transformers` con `bitsandbytes` (4-bit NF4) y `accelerate` según el ejemplo del repositorio; la implementación de referencia usa `mtp_head.py` y `speed_test.py`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se proporcionan cifras concretas en la información disponible; el repositorio incluye `speed_test.py` para reproducir las mediciones en cualquier configuración de 2 x 16 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MTP-1101 | 694 M (cabeza) | no disponible | Cabeza MTP para decodificación especulativa | Apache 2.0 | HuggingFace |
| Nanbeige/Nanbeige4.3-33B | 33B | no disponible | LLM base | no disponible en la información | HuggingFace |
| Cabezas MTP de DeepSeek-V3 | no disponible | no disponible | MTP integrada en el modelo | no disponible | Integrada en DeepSeek-V3 |
| EAGLE / EAGLE-2 | no disponible | no disponible | Decodificación especulativa con cabeza entrenada | no disponible | Repositorios públicos |

La comparación directa con otras cabezas MTP (EAGLE, Medusa, cabezas de DeepSeek-V3) no está disponible en la información proporcionada; los datos de rendimiento de esta cabeza solo se comparan contra la decodificación estándar con caché KV del mismo modelo base.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base Nanbeige/Nanbeige4.3-33B y comparte su matriz de embeddings y su LM head.
- El acuerdo top-1 es del 50,1%, lo que implica que aproximadamente la mitad de los borradores serán rechazados en la verificación; la ganancia de velocidad depende de la acceptance length real medida en cada dominio.
- Está entrenada con características extraídas del modelo base en 4-bit NF4; con pesos bf16 o 8-bit el acuerdo con el modelo base será menor, según advierte el autor.
- El entrenamiento usó solo 600.064 tokens de estados ocultos, un volumen reducido, lo que puede limitar la generalización a dominios alejados de chat, matemáticas y código.
- No hay información sobre sesgos, idiomas soportados ni comportamiento multilingüe de la cabeza; el modelo base se entrenó con datos que incluyen chino, pero no se detalla su cobertura.
- Riesgo de alucinación: en modo greedy la salida es idéntica al modelo base, pero en modo de muestreo especulativo la verificación no es lossless y hereda los sesgos y alucinaciones del modelo base.
- La licencia Apache 2.0 aplica a la cabeza; el uso comercial del conjunto depende también de la licencia del modelo base Nanbeige4.3-33B, no especificada en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados.
- La información sobre longitud de contexto, idiomas y benchmarks estándar no está disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/applepie69/Nanbeige4.3-33B-MTP-1101
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Dataset de chat: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de matemáticas: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de código: https://huggingface.co/datasets/bigcode/self-oss-instruct-sc2-exec-filter-50k
