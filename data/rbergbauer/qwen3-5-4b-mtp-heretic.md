# RBergBauer/Qwen3.5-4B-MTP-Heretic

## Resumen

Qwen3.5-4B-MTP-Heretic es una variante del modelo multimodal Qwen/Qwen3.5-4B publicada por el usuario RBergBauer, en la que se ha eliminado el comportamiento de rechazo (refusal) mediante la herramienta heretic v1.4.0. Se trata, por tanto, de un modelo "abliterated": no se ha reentrenado ni ajustado con datos, sino que se han modificado quirúrgicamente los pesos de las proyecciones de salida del modelo de lenguaje para que no pueda representar una dirección de rechazo. Conserva intacta la arquitectura original Qwen3_5ForConditionalGeneration, de modo que sigue siendo un modelo de visión-lenguaje completo.

El checkpoint cuenta con 4.659.865.088 parámetros y se distribuye en tres shards safetensors que suman 9,3 GB. La particularidad técnica que lo distingue de otras abliteraciones publicadas de Qwen3.5-4B es que mantiene la cabeza de predicción multitoken (MTP, `mtp_num_hidden_layers = 1`, 15 tensores), que la estrategia de exportación `merge` de heretic elimina silenciosamente. Al conservarla, la decodificación especulativa sigue funcionando.

Su relevancia actual es doble: por un lado, sirve como material de investigación sobre direcciones de rechazo y alineación de modelos; por otro, documenta de forma verificable la configuración exacta de la ablación (trial, divergencia KL, pesos aplicados y tasas de rechazo antes y después), algo que el autor señala como ausente en otras variantes publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal visión-lenguaje con cabeza MTP) |
| Parametros totales | 4.659.865.088 (738 tensores: 297 de visión, 426 de lenguaje, 15 de MTP) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 y proyector visual F16 publicados por el autor en repositorio compañero; pesos originales float16 (723 tensores) y bfloat16 (15 tensores MTP) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (3 shards, 9,3 GB) y GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin cambios: `Qwen3_5ForConditionalGeneration`, un transformer multimodal que procesa texto e imagen y que incorpora una cabeza de predicción multitoken de una sola capa (`mtp_num_hidden_layers = 1`). Dicha cabeza se materializa en 15 tensores que ocupan la posición del bloque 32 en la conversión a GGUF, lo que da un `block_count = 33` frente a los 32 de las variantes que la pierden. Los ficheros de procesador y preprocesador (incluido `video_preprocessor_config.json`) son los de serie.

No ha habido entrenamiento ni ajuste fino: no se ha entrenado con datos. La intervención consiste en una ortogonalización de pesos. heretic busca una dirección de rechazo de bajo rango en el residual stream y ortogonaliza contra ella las proyecciones de salida `attn.o_proj` y `mlp.down_proj`, de modo que el modelo no puede representar el rechazo. La optimización se hizo sobre 200 trials con `seed=0`, maximizando la reducción de rechazo con una restricción de divergencia KL respecto al modelo original, evaluando con los conjuntos `mlabonne/harmless_alpaca` (preservar utilidad) y `mlabonne/harmful_behaviors` (eliminar rechazo).

El checkpoint publicado corresponde al trial 109, el punto de menor rechazo de la frontera de Pareto: 19/100 rechazos en la ejecución interna, divergencia KL de 0,0459 frente al base, `direction_index` 20.24, pesos de `attn.o_proj` entre 1,36 y 1,49 centrados en la capa 20.64 y pesos de `mlp.down_proj` entre 1,33 y 1,40 centrados en la capa 21.71. Los detalles de entrenamiento del modelo base Qwen3.5-4B no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en formato transformers, con plantilla de chat de serie.
- Comprensión de imagen y texto (pipeline `image-text-to-text`), con procesador y proyector visual incluidos; el repositorio compañero publica un `mmproj` F16 necesario para entrada de imagen en llama.cpp.
- Modo de razonamiento configurable: la plantilla de chat es la de Qwen3.5 y sigue parametrizada en `enable_thinking`, por lo que el bloque de pensamiento se comporta como en el modelo original.
- Decodificación especulativa mediante la cabeza MTP conservada (15 tensores reinyectados y el índice corregido).
- Funcionamiento sin el comportamiento de rechazo del modelo original: responde a peticiones que el Qwen3.5-4B de serie rechaza.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación sobre direcciones de rechazo y alineación: el modelo permite reproducir y auditar una ablación concreta, ya que se documentan el trial seleccionado, el presupuesto de divergencia KL, el rango de pesos modificado y la tasa de rechazo antes y después, lo que facilita comparar metodologías de abliteración.
- Desarrollo de arneses de evaluación y clasificadores de rechazo: la diferencia entre 99/100 rechazos del modelo de serie y 13/100 de esta variante sobre los primeros 100 prompts de `mlabonne/harmful_behaviors` lo convierte en un caso de prueba útil para validar clasificadores basados en palabras clave.
- Red-teaming controlado: al eliminar la capa de rechazo, sirve como sujeto de pruebas para medir la eficacia de filtros y políticas externas, siempre en entornos aislados y sin usuarios no confiables.
- Prototipado local multimodal en LM Studio o llama.cpp: con el GGUF Q8_0 más el `mmproj` F16, se puede levantar un servidor local con entrada de imagen mediante `llama-server -m Qwen3.5-4B-MTP-Heretic-Q8_0.gguf --mmproj mmproj-F16.gguf -ngl 99`.
- Experimentación con decodificación especulativa: al conservar la cabeza MTP, permite validar flujos de *drafting* especulativo que se rompen silenciosamente en otras abliteraciones convertidas de forma ingenua.
- Estudio de la relación entre coste de utilidad y supresión de rechazo: la publicación de las curvas de Pareto (200 trials, `seed=0`) permite analizar el compromiso entre reducción de rechazo y divergencia KL respecto al modelo base.
- Generación de texto general asistida por imagen en investigación: al mantener la arquitectura y los procesadores de serie, puede usarse para tareas de descripción y diálogo sobre imágenes en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros) en la información disponible. El propio autor advierte que la única medición publicada es una señal relativa de rechazo obtenida con `llama-server` y un clasificador de palabras clave, no un benchmark de capacidades.

Tasa de rechazo sobre los primeros 100 prompts de `mlabonne/harmful_behaviors` (temperatura 0, `max_tokens` 100, system prompt "You are a helpful assistant."):

| Modelo | Rechazos |
|---|---|
| Qwen/Qwen3.5-4B (de serie) | 99 / 100 |
| Qwen3.5-4B-MTP-Heretic (este modelo) | 13 / 100 |
| Variante con bloque de pensamiento suprimido (publicada aparte) | 10 / 100 |

Datos internos del proceso de ablación en el trial 109:

| Metrica | Valor |
|---|---|
| Rechazos (heretic, en ejecucion) | 19 / 100 |
| Divergencia KL frente al base | 0,0459 |
| `direction_index` | 20.24 |
| Pesos `attn.o_proj` | 1,36 – 1,49, centrados en capa 20.64 |
| Pesos `mlp.down_proj` | 1,33 – 1,40, centrados en capa 21.71 |
| Trials / semilla | 200, `seed=0` |

## Requisitos de hardware

- VRAM estimada para inferencia en los pesos publicados: aproximadamente 9,3 GB solo de pesos (4.659.865.088 parámetros en float16), más el coste de la caché KV y de las activaciones; en la práctica se necesitan del orden de 10-12 GB. Es una estimación calculada a partir del recuento de parámetros, no un dato publicado.
- VRAM estimada con el GGUF Q8_0 del repositorio compañero: en torno a 5 GB de pesos, más el proyector visual F16 y la caché KV. Estimación calculada, no publicada.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamaño, caben en una sola GPU con 16 GB o más (RTX 4080, RTX 4090, RTX 3090, A100 40 GB, H100) en float16, y en GPU de 8-12 GB con la cuantización Q8_0.
- ¿Cabe en GPU de consumo? Sí, en float16 en tarjetas de 16 GB o más y en Q8_0 en tarjetas de 8-12 GB, sujeto a la longitud de contexto efectiva.
- Opciones de despliegue: `transformers` (formato nativo, `dtype: float16` declarado en `config.json`), llama.cpp / `llama-server` mediante el GGUF Q8_0 y el `mmproj` F16, y LM Studio. El autor menciona aquí el flujo con llama.cpp; soporte en vLLM o TGI no está confirmado en la información disponible.
- Latencia y throughput: no disponibles. Se sabe que la cabeza MTP permite decodificación especulativa, pero no se publican cifras de rendimiento.
- Nota de precisión mixta: 723 tensores están en float16 y los 15 de MTP en bfloat16. `from_pretrained` los convierte al cargar según el `dtype` del `config.json`; si se cargan los shards manualmente, hay que contar con las dos precisiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tensores GGUF / `block_count` | Rechazos (100 prompts) | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-4B-MTP-Heretic (este) | 4.659.865.088 | no disponible | 441 / 33 | 13 / 100 | apache-2.0 |
| Qwen/Qwen3.5-4B (base sin modificar) | no disponible | no disponible | 441 / 33 | 99 / 100 | apache-2.0 |
| Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking | no disponible | no disponible | 426 / 32 | no disponible | no disponible |

La diferencia clave frente a la variante Deckard es que a esta última le faltan los 15 tensores de la cabeza MTP, de modo que su decodificación especulativa no funciona; tampoco publica la configuración de ablación empleada, lo que impide auditar el proceso. No se dispone de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- El filtrado de seguridad está reducido de forma significativa: el modelo cumple peticiones que el Qwen3.5-4B de serie rechaza, incluidas peticiones dañinas. El autor lo advierte de forma explícita.
- No ha pasado ninguna optimización de seguridad. No debe exponerse a entradas de usuarios no confiables sin una capa de política propia por delante.
- Riesgo de alucinación: no hay mediciones de fidelidad factual disponibles; al tratarse de una modificación de pesos sin reentrenamiento, se heredan las limitaciones del modelo base, que no están documentadas en la información proporcionada.
- La única métrica publicada es una tasa de rechazo relativa medida con un clasificador de palabras clave, no un benchmark de capacidades. No hay evidencia publicada sobre el coste en utilidad de la ablación más allá de la divergencia KL de 0,0459.
- Licencia apache-2.0, con enlace a la licencia del modelo base Qwen3.5-4B. No se indican restricciones adicionales, pero el uso previsto declarado es la investigación sobre direcciones de rechazo, la experimentación local con alineación reducida, el red-teaming y el desarrollo de arneses de evaluación.
- Uso previsto explícitamente no apto para despliegues donde usuarios no confiables puedan alcanzar el modelo sin una capa de filtrado.
- Longitud de contexto e idiomas soportados no están documentados en la ficha.
- Precisión mixta deliberada (float16 en 723 tensores, bfloat16 en los 15 de MTP), que puede sorprender al cargar los shards manualmente.
- Cero descargas y cero likes en el momento de la consulta, y ausencia de resultados de benchmarks de terceros: no existe validación externa independiente publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RBergBauer/Qwen3.5-4B-MTP-Heretic
- Repositorio GGUF compañero: https://huggingface.co/RBergBauer/Qwen3.5-4B-MTP-Heretic-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Herramienta heretic: https://github.com/p-e-w/heretic
- Conjunto de prompts `mlabonne/harmless_alpaca`: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Conjunto de prompts `mlabonne/harmful_behaviors`: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Variante con bloque de pensamiento suprimido: no disponible (el autor indica que se publica por separado, sin enlace en la información proporcionada)
- Paper del modelo base y blog oficial: no disponibles en la información proporcionada
