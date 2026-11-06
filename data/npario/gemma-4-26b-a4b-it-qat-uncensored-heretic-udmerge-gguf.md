# npario/gemma-4-26B-A4B-it-qat-uncensored-heretic-UDmerge-GGUF

## Resumen

Este repositorio contiene una familia de cuantizaciones GGUF derivadas de Gemma 4 26B-A4B-it, un modelo multimodal de Google con arquitectura MoE (mezcla de expertos). El autor, npario, parte de la versión QAT (quantization-aware training) publicada por Unsloth y de la variante "abliterated/heretic" de llmfan46, y realiza una fusión selectiva de tensores: los pesos de `attn_output` de las capas 11 a 22, que habían sido modificados para eliminar el comportamiento de rechazo, se cuantizan por separado y se injertan sobre la cuantización Q4_0 original.

El objetivo es doble. Por un lado, preservar la precisión de la cuantización QAT (que degrada menos que una PTQ equivalente). Por otro, reducir la tasa de rechazo del modelo base sin destruir la coherencia lingüística. El autor publica dos variantes: UDmerge-Q4_K_XL, con los tensores abliterados en Q4_0, y UDmerge-Q4_K_XXL, que los cuantiza a Q8_0 y consigue la tasa de rechazo más baja de la tabla (16%), a costa de un tamaño casi idéntico (14,3 GB frente a 14,2 GB).

Con 25.233.142.046 parámetros totales y una ventana de contexto que la model card no detalla, el modelo se distribuye bajo licencia Apache-2.0 y está pensado para inferencia local en GPUs de consumo. Es relevante porque combina tres técnicas poco habituales juntas: QAT, abliteración selectiva y fusión de tensores cuantizados, con métricas de divergencia (KLD) y de cambio de respuesta (flips) publicadas de forma transparente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (Gemma 4); variante "A4B" con 4B de parámetros activos estimados por el nombre |
| Parámetros totales | 25.233.142.046 |
| Parámetros activos | no disponible (el sufijo A4B sugiere ~4B activos, sin confirmar en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_0 base con tensores abliterados en Q4_0 (XL) o Q8_0 (XXL); también disponibles QAT BF16, Q4_0, Q4_K_M y PTQ BF16/Q4_0/Q4_K_M como referencia |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con enlace a la licencia específica de Gemma 4 de Google) |
| Formato de pesos | GGUF (repositorio de 28,6 GB); requiere `mmproj` y `mtp` GGUF de Unsloth para multimodal y MTP |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B-A4B-it, un transformer con mezcla de expertos y capacidad de entrada imagen-texto (pipeline `image-text-to-text`). El sufijo "it" indica ajuste por instrucciones y el "QAT" que Google aplicó entrenamiento consciente de cuantización, de modo que los pesos están optimizados para funcionar bien a 4 bits. Sobre esa base, llmfan46 aplicó abliteración (eliminación de la dirección de rechazo en el espacio de activaciones) y publicó tanto la versión BF16 como cuantizaciones GGUF.

La innovación de este repositorio es el procedimiento de fusión: en lugar de cuantizar el modelo abliterado completo (lo que degrada la perplejidad, como muestra la columna PTQ Q4_0 con PPL 10,17), se toman los tensores `blk.N.attn_output.weight` de las capas 11 a 22 del modelo abliterado y se injertan en la cuantización QAT de Unsloth, cuantizándolos aparte. El resultado son KLD de 0,0448 (XL) y 0,0291 (XXL) frente a 0,7388 de la PTQ Q4_0 naive, es decir, una divergencia respecto al BF16 entre 16 y 25 veces menor. El autor advierte que el proceso se realizó con asistencia intensiva de LLM (Zoo Code + DeepSeek-V4-Flash) y recomienda usar la plantilla de chat oficial de Google publicada el 2026-07-20 para mejorar velocidad y precisión.

## Capacidades

- Generación de texto conversacional multi-turno, con ajuste por instrucciones.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), siempre que se cargue el `mmproj` GGUF de Unsloth.
- Soporte de MTP (multi-token prediction) mediante el fichero `mtp` GGUF de Unsloth, que acelera la decodificación.
- Razonamiento y respuesta a preguntas de conocimiento general (MMLU-val ~81%).
- Comportamiento de rechazo reducido respecto al modelo base (16-33% según variante, frente al 17% del BF16 QAT de referencia).
- Capacidades multilingües: no detalladas en la información disponible.
- Tool calling y function calling: no confirmado en la información disponible.

## Casos de uso

- Investigación sobre alineación y abliteración: el repositorio publica tasas de rechazo, PPL, KLD y porcentajes de flips medidos con metodología reproducible, lo que permite estudiar el compromiso entre supresión del rechazo y degradación de capacidades sin entrenar el modelo desde cero.
- Evaluación de técnicas de cuantización: las dos variantes (Q4_0 y Q8_0 en los tensores injertados) sirven para comparar el efecto de la precisión de un subconjunto de capas sobre la calidad global, con KLD de 0,0448 frente a 0,0291.
- Despliegue local en GPU de consumo: con 14,2-14,3 GB en disco y cuantización de 4 bits, el modelo cabe en tarjetas de 16 GB o más y permite experimentar con un MoE de 25B sin infraestructura de datacenter.
- Prototipado de aplicaciones multimodales: cargando el `mmproj` de Unsloth se puede construir un asistente que describa imágenes o responda preguntas sobre ellas en local.
- Generación de texto creativo sin filtros: la reducción de la tasa de rechazo lo hace adecuado para escribir ficción, guiones o contenido con temáticas que el modelo base rechazaría, siempre con revisión humana.
- Pruebas de robustez y red teaming: sirve como modelo "sin censura" de referencia para comparar con la versión alineada y medir qué comportamientos cambian al eliminar la dirección de rechazo.
- Benchmarking de inferencia GGUF: útil para medir throughput de decodificación con y sin MTP en distintos backends (llama.cpp, Ollama) sobre un modelo MoE cuantizado.

## Benchmarks y rendimiento

Datos publicados por el autor (temperatura 0,0, razonamiento desactivado, MTP desactivado):

| Métrica | QAT BF16 | QAT Q4_0 | QAT Q4_K_M | UDmerge-Q4_K_XL | UDmerge-Q4_K_XXL | PTQ BF16 | PTQ Q4_0 | PTQ Q4_K_M |
|---|---|---|---|---|---|---|---|---|
| Tamaño (GB) | 51,6 | 16,0 | 16,8 | 14,2 | 14,3 | 51,6 | 14,5 | 16,8 |
| PPL | 4,945 | 4,804 | 5,246 | 5,236 | 5,101 | 5,279 | 10,17 | 8,177 |
| KLD | 0,0000 | 0,1158 | 0,1076 | 0,0448 | 0,0291 | 0,0000 | 0,7388 | 0,6130 |
| Rechazo | 17% | 19% | 25% | 33% | 16% | 28% | 27% | 26% |
| MMLU-val | 80,86% | 80,60% | 80,73% | 81,38% | 81,06% | 80,54% | 79,49% | 79,88% |
| MMLU-val %flips | 0,00% | 3,53% | 3,79% | 3,66% | 0,98% | 0,00% | 5,23% | 5,88% |
| MMLU-val %allflips | 0,00% | 4,31% | 4,90% | 4,83% | 1,76% | 0,00% | 7,38% | 7,51% |

Resultados adicionales con la versión antigua del script (MMLU-val-v1, sin restricciones gramaticales):

| Métrica | QAT BF16 | QAT Q4_0 | QAT Q4_K_M | UDmerge-Q4_K_XL | UDmerge-Q4_K_XXL | PTQ BF16 | PTQ Q4_0 | PTQ Q4_K_M |
|---|---|---|---|---|---|---|---|---|
| MMLU-val-v1 | 78,84% | 77,73% | 77,86% | 77,07% | 78,90% | 79,29% | 79,82% | 76,49% |
| %nulls | 3,79% | 4,25% | 5,94% | 7,32% | 3,98% | 3,53% | 1,70% | 7,84% |
| %flips | 0,00% | 3,20% | 4,51% | 5,03% | 1,11% | 0,00% | 5,23% | 7,12% |
| %allflips | 0,00% | 4,31% | 5,68% | 6,47% | 2,02% | 0,00% | 7,45% | 9,54% |

Notas del autor: PPL y KLD se midieron sobre las primeras 100 preguntas del split `test` de `mlabonne/harmless_alpaca`; la tasa de rechazo sobre las primeras 100 preguntas del split `test` de `mlabonne/harmful_behaviors`. Los porcentajes de flips siguen la metodología del paper *Accuracy is Not All You Need* (arXiv:2407.09141). El autor advierte que la tasa de rechazo del 11% que reclamaba el autor original no se reproduce aquí y que las cifras deben tomarse con cautela.

## Requisitos de hardware

- VRAM estimada: entre 14 y 16 GB para cargar el modelo completo en Q4 con overhead de contexto; el fichero pesa 14,2 GB (XL) o 14,3 GB (XXL) y el `mmproj` añade aproximadamente 1,2 GB en BF16 si se usa multimodalidad.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 Super (16 GB, justo), RTX 5090 (32 GB), A100 40 GB o H100 para mayor margen de contexto y concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090). En 12 GB no cabe la versión completa sin offloading a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; requiere cargar también los ficheros `mmproj` (multimodal) y `mtp` (multi-token prediction) de Unsloth si se desean esas funciones.
- Latencia y throughput: no se publican cifras concretas. El autor indica que la variante XXL (Q8_0 en los tensores injertados) "no afecta básicamente a la velocidad de TG" frente a la XL.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-val | Rechazo | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este modelo (UDmerge-Q4_K_XXL) | 25,23B totales | no disponible | 81,06% | 16% | Apache-2.0 | GGUF |
| QAT BF16 (llmfan46, base abliterada) | 25,23B totales | no disponible | 80,86% | 17% | Apache-2.0 | safetensors/BF16 |
| QAT Q4_0 (llmfan46) | 25,23B totales | no disponible | 80,60% | 19% | Apache-2.0 | GGUF Q4_0 |
| PTQ Q4_K_M (llmfan46) | 25,23B totales | no disponible | 79,88% | 26% | Apache-2.0 | GGUF Q4_K_M |

La comparación relevante es interna al ecosistema del propio modelo base, ya que la información disponible no incluye alternativas de otros desarrolladores con arquitectura MoE multimodal y contexto comparable. Frente al QAT BF16 de referencia, la variante XXL mantiene el MMLU (81,06% frente a 80,86%), reduce el rechazo solo un punto porcentual (16% frente a 17%) pero rebaja el KLD a 0,0291 y los flips al 0,98%. La variante XL, en cambio, sube el MMLU a 81,38% pero dispara el rechazo al 33%, lo que la hace menos útil si el objetivo es eliminar negativas.

## Limitaciones y advertencias

- La abliteración elimina la dirección de rechazo pero no garantiza la ausencia de contenido dañino; el modelo puede generar respuestas inseguras, incorrectas o sesgadas y requiere filtros externos en producción.
- El autor advierte explícitamente que el modelo se creó con "heavy LLM assistance" y que debe usarse "a discreción propia"; no hay garantía de calidad del proceso de fusión más allá de las métricas publicadas.
- La tasa de rechazo no es cero (16-33%) y los métodos de medición difieren de los del autor original, que reclamaba un 11%; las cifras no son directamente comparables con otras publicaciones.
- La licencia del repositorio es Apache-2.0, pero la model card enlaza a la licencia específica de Gemma 4 de Google; conviene revisar los términos de uso comercial de Gemma antes de desplegar en producto.
- El modelo base es un ajuste por instrucciones; no se documentan sesgos específicos ni composición del dataset de entrenamiento en la información disponible.
- La longitud de contexto y los idiomas soportados no se detallan; no asumir la ventana nativa de Gemma 4 sin verificarla.
- El rendimiento en MMLU se midió con temperatura 0,0 y razonamiento desactivado; el comportamiento con cadenas de pensamiento o muestreo estocástico puede diferir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de los resultados.
- Requiere ficheros adicionales (`mmproj`, `mtp`) para funcionalidad completa; sin ellos se pierde la entrada multimodal y la decodificación acelerada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/npario/gemma-4-26B-A4B-it-qat-uncensored-heretic-UDmerge-GGUF
- Modelo base QAT GGUF (Unsloth): https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Modelo base abliterado BF16 (llmfan46): https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic
- Cuantización Q4_0 abliterada (llmfan46): https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-qat-q4_0-uncensored-heretic-GGUF
- Cuantización Q4_K_M abliterada (mradermacher): https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-GGUF
- Modelo PTQ BF16 abliterado (llmfan46): https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-uncensored-heretic
- Plantilla de chat oficial de Google: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized/blob/main/chat_template.jinja
- Post de Unsloth sobre la plantilla de chat: https://huggingface.co/posts/danielhanchen/849237239454851
- Paper de referencia sobre flips: https://arxiv.org/abs/2407.09141
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
