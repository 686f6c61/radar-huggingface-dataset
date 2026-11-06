# npario/gemma-4-12B-it-qat-uncensored-heretic-UDmerge-GGUF

## Resumen

`npario/gemma-4-12B-it-qat-uncensored-heretic-UDmerge-GGUF` es un modelo derivado de Gemma 4 de 12B parámetros, publicado por el usuario npario en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un *merge* experimental que combina los tensores "abliterated" (sin mecanismos de rechazo) del modelo `llmfan46/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic` con la cuantización Q4_0 sin pérdida de Unsloth (`unsloth/gemma-4-12B-it-qat-GGUF`). El objetivo declarado es obtener una cuantización que preserve mejor la precisión del modelo original mientras reduce la tasa de rechazos.

El modelo mantiene la arquitectura multimodal de Gemma 4 (pipeline `image-text-to-text`), con aproximadamente 11.900 millones de parámetros totales. Se distribuye exclusivamente en formato GGUF, en dos variantes de cuantización (Q4_K_XL y Q4_K_XXL), y está pensado para despliegue local con llama.cpp y herramientas compatibles.

Su relevancia es acotada: es un experimento de la comunidad orientado a usuarios que buscan un Gemma 4 de 12B sin restricciones de contenido y con un equilibrio documentado entre perplejidad, divergencia KL y tasa de rechazo. El propio autor advierte que fue creado con asistencia intensiva de LLM y que debe usarse con criterio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), derivada de Gemma 4 12B IT con QAT |
| Parámetros totales | 11.907.350.576 (~11,9B) |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q4_K_XL (6,72 GB) y Q4_K_XXL (6,81 GB); tensores abliterated en Q4_0 o Q8_0 según variante |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (con ficheros `mmproj` y `mtp` separados para multimodal y MTP) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 12B IT, un transformer multimodal entrenado con Quantization-Aware Training (QAT), lo que permite cuantizar a Q4_0 con pérdida mínima de calidad respecto al BF16. Sobre esa base, npario aplica una operación de *merge*: toma los tensores `blk.N.attn_output.weight` (capas 24 a 34 inclusive) del modelo abliterated de llmfan46 y los injerta en la cuantización Q4_0 de Unsloth. En la variante UDmerge-Q4_K_XL esos tensores se cuantizan a Q4_0; en UDmerge-Q4_K_XXL, a Q8_0.

No hay información sobre datos de entrenamiento adicionales, RLHF, DPO ni procesos de alineación propios: el autor describe el proceso como un "Frankenstein" de grafting de tensores. La innovación técnica es la combinación de QAT sin pérdida con abliteration selectiva en las capas de atención superiores, buscando reducir rechazos sin degradar la precisión. El modelo soporta multimodalidad y MTP (Multi-Token Prediction) mediante los ficheros GGUF auxiliares de Unsloth.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `conversational`).
- Procesamiento de imagen y texto (`image-text-to-text`), usando el `mmproj` de Unsloth.
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado en MMLU).
- Modo de razonamiento desactivable (los tests se ejecutan con "reasoning off").
- Soporte de MTP (Multi-Token Prediction) para acelerar la generación, mediante el fichero `mtp` correspondiente.
- Comportamiento "uncensored"/abliterated: menor tasa de rechazo ante peticiones que el modelo base rechazaría.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre abliteration y cuantización: permite comparar tasas de rechazo, perplejidad y KLD entre variantes Q4_K_XL y Q4_K_XXL frente a BF16 y cuantizaciones PTQ, usando los scripts de test del autor.
- Despliegue local en estaciones de trabajo con GPU de consumo: los ficheros de ~6,7-6,8 GB caben en GPUs de 8-12 GB de VRAM, lo que facilita experimentación sin infraestructura de datacenter.
- Prototipado de asistentes conversacionales sin filtros editoriales: útil para estudiar comportamiento del modelo en dominios donde el modelo base rechazaría responder, siempre con revisión humana.
- Evaluación de pipelines multimodales ligeros: con el `mmproj` de Unsloth se pueden probar tareas imagen-texto en local sin depender de APIs.
- Benchmarking de metodologías de merge: sirve como caso de estudio de grafting de tensores entre modelos con distinto régimen de cuantización.
- Experimentación con MTP: permite medir ganancias de velocidad de decodificación en llama.cpp con el fichero `mtp` habilitado.

## Benchmarks y rendimiento

Datos publicados por el autor (test con temperatura 0.0, razonamiento desactivado, MTP desactivado, sobre `cais/mmlu` validation split, 1531 preguntas):

| Métrica | QAT BF16 | QAT Q4_0 | QAT Q4_K_M | UDmerge-Q4_K_XL | UDmerge-Q4_K_XXL | PTQ BF16 | PTQ Q4_0* | PTQ Q4_K_M |
|---|---|---|---|---|---|---|---|---|
| Tamaño (GB) | 23,9 | 7,60 | 7,38 | 6,72 | 6,81 | 23,9 | 7,00 | 8,54 |
| PPL | 3,423 | 3,716 | 3,734 | 3,343 | 3,400 | 3,941 | 4,733 | 4,950 |
| KLD | 0,0000 | 0,1752 | 0,2463 | 0,1012 | 0,0903 | 0,0000 | 0,3794 | 0,3430 |
| Tasa de rechazo | 10% | 10% | 22% | 24% | 14% | 11% | 10% | 9% |
| MMLU-val | 74,59% | 74,00% | 74,40% | 75,77% | 74,66% | 71,00% | 65,77% | 71,20% |
| MMLU-val %flips | 0,00% | 3,33% | 4,11% | 3,14% | 0,98% | 0,00% | 10,71% | 4,38% |
| MMLU-val %allflips | 0,00% | 4,18% | 5,29% | 3,66% | 1,37% | 0,00% | 13,85% | 5,62% |

`*` Cuantización realizada con importance matrix; el autor advierte que los resultados pueden no ser fiables. PPL y KLD se miden sobre las primeras 100 preguntas del split `test` de `mlabonne/harmless_alpaca`; las tasas de rechazo, sobre las primeras 100 preguntas del split `test` de `mlabonne/harmful_behaviors`. Las cifras no son comparables con las de otros modelos por diferencias de procesamiento del dataset.

Resultados adicionales (script antiguo, sin restricciones gramaticales en el formato de respuesta):

| Métrica | QAT BF16 | QAT Q4_0 | QAT Q4_K_M | UDmerge-Q4_K_XL | UDmerge-Q4_K_XXL | PTQ BF16 | PTQ Q4_0* | PTQ Q4_K_M |
|---|---|---|---|---|---|---|---|---|
| MMLU-val-v1 | 75,57% | 75,38% | 75,51% | 76,81% | 75,44% | 73,81% | 70,48% | 73,22% |
| %nulls | 0,78% | 0,78% | 3,46% | 1,76% | 0,78% | 0,20% | 0,20% | 0,07% |
| %flips | 0,00% | 2,55% | 5,68% | 3,85% | 0,65% | 0,00% | 8,69% | 4,77% |
| %allflips | 0,00% | 3,46% | 8,23% | 5,36% | 0,78% | 0,00% | 12,21% | 6,92% |

## Requisitos de hardware

- VRAM estimada: ~7-8 GB para el modelo en Q4_K_XL/Q4_K_XXL; sumar ~1-2 GB adicionales para el `mmproj` si se usa multimodalidad y el contexto KV cache.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; A100/H100 no son necesarias para esta cuantización.
- Cabe en GPUs de consumo: sí, en cualquier GPU con 8 GB o más de VRAM para texto; 12 GB o más si se activa visión y contexto largo.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con GGUF; vLLM y TGI no son el formato nativo de estos pesos.
- Latencia y throughput: no disponibles. El autor indica que la variante Q4_K_XXL "básicamente no afecta la velocidad de TG" respecto a Q4_K_XL, pero no publica cifras de tokens/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-val | Licencia | Formato |
|---|---|---|---|---|---|
| npario UDmerge-Q4_K_XL (este) | ~11,9B | no disponible | 75,77% | Apache 2.0 | GGUF |
| npario UDmerge-Q4_K_XXL (este) | ~11,9B | no disponible | 74,66% | Apache 2.0 | GGUF |
| llmfan46 QAT BF16 uncensored heretic | ~11,9B | no disponible | 74,59% | Apache 2.0 | safetensors BF16 |
| llmfan46 QAT Q4_0 uncensored heretic | ~11,9B | no disponible | 74,00% | Apache 2.0 | GGUF |
| mradermacher QAT Q4_K_M | ~11,9B | no disponible | 74,40% | Apache 2.0 | GGUF |
| PTQ BF16 uncensored heretic | ~11,9B | no disponible | 71,00% | Apache 2.0 | safetensors BF16 |

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: elimina parte de los mecanismos de rechazo del Gemma 4 original, lo que puede producir contenido inapropiado, dañino o no alineado con políticas de uso responsables.
- Creado con asistencia intensiva de LLM (Zoo Code + DeepSeek-V4-Flash), según advierte el propio autor; la calidad del merge no está validada por terceros.
- Las cifras de benchmarks son del autor, con metodología propia y datasets reducidos (100 preguntas para PPL/KLD y rechazo); no son comparables con las de otros modelos y deben tomarse con cautela.
- El autor reconoce que la tasa de rechazo del 6-7% reportada originalmente para el 12B no se reproduce en sus tests, posiblemente por diferencias metodológicas.
- Riesgo de alucinación inherente a un modelo de 12B, agravado por la cuantización Q4 y por la modificación de tensores de atención.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe consistente.
- Longitud de contexto no especificada en la información disponible.
- La licencia Apache 2.0 declarada convive con un enlace a la licencia específica de Gemma 4 de Google; conviene revisar los términos de uso de Gemma antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria.
- Requiere ficheros GGUF auxiliares (`mmproj`, `mtp`) de Unsloth para multimodalidad y MTP; sin ellos, esas capacidades no están disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/npario/gemma-4-12B-it-qat-uncensored-heretic-UDmerge-GGUF
- Modelo base (QAT BF16 abliterated): https://huggingface.co/llmfan46/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic
- Modelo base (QAT UD-Q4_K_XL de Unsloth): https://huggingface.co/unsloth/gemma-4-12B-it-qat-GGUF
- QAT Q4_0 uncensored heretic GGUF: https://huggingface.co/llmfan46/gemma-4-12B-it-qat-q4_0-uncensored-heretic-GGUF
- QAT Q4_K_M (mradermacher): https://huggingface.co/mradermacher/gemma-4-12B-it-qat-q4_0-unquantized-uncensored-heretic-GGUF
- PTQ BF16 uncensored heretic: https://huggingface.co/llmfan46/gemma-4-12B-it-uncensored-heretic
- PTQ Q4_0 imatrix (mradermacher): https://huggingface.co/mradermacher/gemma-4-12B-it-uncensored-heretic-i1-GGUF
- PTQ Q4_K_M: https://huggingface.co/llmfan46/gemma-4-12B-it-uncensored-heretic-GGUF
- Plantilla de chat oficial de Gemma 4: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized/blob/main/chat_template.jinja
- Post de Unsloth sobre la plantilla de chat: https://huggingface.co/posts/danielhanchen/849237239454851
- Paper "Accuracy is Not All You Need": https://arxiv.org/abs/2407.09141
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
