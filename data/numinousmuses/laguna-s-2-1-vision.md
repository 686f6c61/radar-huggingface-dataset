# numinousmuses/laguna-s-2.1-vision

## Resumen

Laguna-S-2.1 Vision es un modelo de lenguaje visual (VLM) que acopla el codificador de vision de Qwen3-VL al modelo de texto Laguna-S-2.1 de poolside, mediante un proyector entrenado de 35,4 millones de parametros. El modelo base Laguna-S-2.1 es un MoE de 117.000 millones de parametros totales con 5.300 millones activos por token, especializado en codificacion y razonamiento, con soporte de contexto de hasta 1M de tokens. Este checkpoint anade entrada de imagen sin modificar ni un solo peso del backbone de texto ni del torre de vision, que permanecen congelados e identicos a sus versiones originales.

La relevancia de este modelo reside en que demuestra que es posible dotar de capacidades visuales a un modelo de texto puro mediante un proyector ligero, manteniendo intactas las garantias de comportamiento del modelo base. Los resultados de los benchmarks muestran una diferencia clara entre la rama con imagen y la rama ciega, lo que confirma que el modelo utiliza efectivamente la informacion visual, aunque su rendimiento absoluto en tareas de alucinacion y razonamiento visual queda por debajo de los VLM entrenados de forma nativa. La licencia es MIT, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (backbone Laguna-S-2.1) + vision tower Qwen3-VL + proyector MLP entrenado |
| Parametros totales | 117B (texto) + vision tower Qwen3-VL + 35,4M (proyector) |
| Parametros activos | 5,3B (texto, segun la model card del autor; el modelo base declara 8B) |
| Longitud de contexto | Hasta 1M tokens (heredado de Laguna-S-2.1); el checkpoint vision no lo especifica |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo combina tres componentes. El backbone de texto es Laguna-S-2.1 de poolside, un MoE de 117B parametros totales y 5,3B activos, con atencion mixta sliding-window y global, entrenado para codificacion agentica y razonamiento intercalado. El torre de vision es el de Qwen3-VL, con 27 capas, embeddings de 1152 dimensiones y parches de 16x16 píxeles, congelado. El proyector es un MLP con la secuencia `norm -> 2x2 concat -> linear_fc1 -> GELU -> linear_fc2`, que mapea los embeddings de parche de 1152 dimensiones al espacio de tokens de 3072 dimensiones de Laguna. Solo se entrenaron los 35,4M de parametros del proyector, durante 900 pasos con batch de 64 (57.600 muestras en total), con una tasa de aprendizaje de 5e-4 y 4 GPU B200, en unas 3,3 horas.

El entrenamiento fue solo de supervisión fina (SFT) con respuestas cortas de QA visual, excluyendo captions largos porque son fuera de politica para un backbone congelado. Se descarta una segunda epoca porque la perdida de entrenamiento bajo de 1,30 a 0,61 pero la precision en validacion cayo del 41,0% al 38,33%. El arranque en caliente es parcial: el merger de Qwen3-VL produce 4096 dimensiones mientras que Laguna usa 3072, por lo que `linear_fc2` se inicializo aleatoriamente y solo 4 de los 6 tensores del proyector se transfirieron.

## Capacidades

- Generacion de texto y codigo con las capacidades completas de Laguna-S-2.1, que incluyen razonamiento intercalado en modo thinking y no-thinking.
- Entrada de imagen: el modelo puede responder preguntas sobre imagenes, incluyendo OCR, comprension de escenas y respuesta visual QA.
- Razonamiento multimodal: la diferencia entre la rama con imagen y la rama ciega en benchmarks confirma que el modelo usa la informacion visual para responder.
- Soporte de tool calling y agentes: heredado del backbone Laguna-S-2.1, disenado para software engineering agentico de largo horizonte.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No soporta generacion libre de descripciones largas de imagenes: el entrenamiento se limito a respuestas cortas, y la generacion libre es debil por diseno.

## Casos de uso

- **QA visual en documentos tecnicos**: el modelo puede responder preguntas concretas sobre diagramas, esquemas o capturas de pantalla de codigo, gracias a la capacidad de razonamiento del backbone y a la entrada visual del proyector.
- **Agente de codigo con contexto visual**: se puede integrar en pipelines de desarrollo donde el agente reciba capturas de pantalla de la interfaz o de errores de compilacion, y deba razonar sobre ellas para proponer fixes.
- **Verificacion de interfaces de usuario**: dado un screenshot de una aplicacion, el modelo puede responder preguntas de QA funcional, como "que elemento esta en la esquina superior derecha" o "hay un error visible".
- **Asistencia en educacion tecnica**: un estudiante puede subir un diagrama de arquitectura o un grafico de rendimiento y hacer preguntas de comprension, aprovechando el razonamiento del modelo base.
- **Extraccion de texto de imagenes en contexto de codigo**: aunque el texto fino es limitado por el merge 2x2, el modelo puede leer texto grande en capturas de pantalla y responder preguntas sobre el.
- **Evaluacion de modelos en investigacion**: el checkpoint es util para estudiar el comportamiento de modelos de texto congelados al recibir caracteristicas visuales, y para experimentar con proyector de bajo coste.

## Benchmarks y rendimiento

Los benchmarks se ejecutaron dos veces: una con imagen real y otra con ruido gaussiano en las posiciones de imagen (rama ciega). La diferencia entre ambas ramas es la medida del uso real de la imagen. 300 preguntas por benchmark y por rama.

| Benchmark | Con imagen | Ciego | Diferencia | Azar |
|---|---|---|---|---|
| MMMU-Pro | 38,33% | 13,00% | 25,33 | 25% |
| MMMU_DEV_VAL | 45,33% | 20,00% | 25,33 | 25% |
| MMBench_DEV_EN | 73,67% | 25,67% | 48,00 | 25% |
| SEEDBench_IMG | 68,00% | 19,00% | 49,00 | 25% |
| HallusionBench | 51,67% | 4,33% | 47,34 | 50% |
| TextVQA_VAL | 74,00% | 2,67% | 71,33 | n/a |
| OCRVQA | 43,67% | 6,00% | 37,67 | n/a |

Notas de la model card del autor: HallusionBench es de si/no, por lo que su suelo es 50%; una puntuacion de 51,67% esta en el azar, lo que indica que el modelo lee la imagen pero no resiste preguntas con premisas falsas. TextVQA y OCRVQA se puntuan con containment normalizado, mas laxo que la exactitud oficial de VQA, y no son comparables con leaderboards. Las puntuaciones ciegas por debajo del azar se esperan porque el ruido en los slots de imagen es peor que no tener imagen. El ruido de muestreo es de aproximadamente ±3 puntos con n=300.

No se han publicado resultados de benchmarks comparativos con otros VLM en la informacion disponible.

## Requisitos de hardware

- **Entrenamiento del proyector**: 4x GPU B200 durante unas 3,3 horas para 900 pasos con batch 64.
- **Inferencia**: el modelo completo es de 117B parametros totales, por lo que en precision FP16 requiere aproximadamente 234 GB de VRAM. Con cuantizacion de 4 bits podria caber en un nodo de 2-4 GPU de 80 GB (A100/H100) o en un sistema multi-GPU consumer.
- **No cabe en una GPU consumer individual**: el peso del modelo base Laguna-S-2.1 supera la VRAM de una RTX 4090 (24 GB) o RTX 5090 (32 GB) incluso cuantizado a 4 bits (necesitaria unos 60 GB en 4 bits).
- **Opciones de despliegue**: al ser un modelo transformers con pesos safetensors, se puede servir con vLLM o TGI si soportan la arquitectura del modelo base; llama.cpp/Ollama no estan confirmados para esta arquitectura MoE con vision tower.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Laguna-S-2.1 Vision (este) | 117B total / 5,3B activos | Hasta 1M | Si (via proyector) | MIT | VLM por proyeccion, backbone congelado |
| Laguna-S-2.1 (base) | 118B total / 8B activos | Hasta 1M | No | Apache 2.0 (segun poolside) | Modelo de texto puro, codigo y razonamiento |
| Qwen3-VL-235B-A22B-Instruct | 235B total / 22B activos | 256K | Si, nativo | Apache 2.0 | VLM entrenado de forma nativa, sin proyector |

La comparativa muestra que el modelo fusionado parte de un backbone de codificacion fuerte pero con un proyector pequeno entrenado en solo 57.600 muestras, mientras que un VLM nativo como Qwen3-VL-235B-A22B-Instruct tiene una capacidad multimodal muy superior. La ventaja de Laguna-S-2.1 Vision es que hereda las capacidades de codificacion agentica y el contexto de 1M del modelo base, ademas de la licencia MIT.

## Limitaciones y advertencias

- **No es un VLM entrenado de forma nativa**: el modelo de lenguaje nunca vio imagenes durante su entrenamiento; recibe caracteristicas traducidas a su espacio de embeddings por un MLP pequeno. Los modelos entrenados de extremo a extremo con datos multimodales obtienen puntuaciones considerablemente mas altas en los mismos benchmarks.
- **Solo SFT**: el checkpoint publicado no incluye una etapa de aprendizaje por refuerzo.
- **Entrenado solo en respuestas cortas**: la mezcla de entrenamiento es QA visual corto, con captions excluidos. La generacion libre de descripciones largas sobre imagenes no se entreno y se espera que sea debil.
- **Arranque en caliente parcial**: `linear_fc2` se inicializo aleatoriamente y solo 4 de 6 tensores del proyector se transfirieron desde el merger de Qwen3-VL.
- **Hallucination es la debilidad mas clara**: HallusionBench esta en el azar (51,67% con suelo del 50%), lo que significa que el modelo lee la imagen pero no contradice de forma fiable premisas falsas en la pregunta.
- **Texto fino limitado**: los parches se fusionan 2x2 antes del proyector, por lo que documentos densos y letra pequena pierden resolucion antes de llegar al modelo de lenguaje.
- **Una epoca es la cantidad correcta**: entrenar una segunda epoca baja la perdida de entrenamiento pero empeora la precision de validacion. Loss no es la metrica.
- **Puntuaciones de TextVQA y OCRVQA**: se puntuan con contencion normalizada, mas laxa que la exactitud oficial de VQA, y no son comparables con leaderboards.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/numinousmuses/laguna-s-2.1-vision)
- [Modelo base Laguna-S-2.1 en HuggingFace](https://huggingface.co/poolside/Laguna-S-2.1)
- [Blog de poolside sobre Laguna S 2.1](https://poolside.ai/blog/introducing-laguna-s-2-1)
- [Release notes de modelos de poolside](https://docs.poolside.ai/release-notes/models)
- [Articulo sobre Laguna S 2.1 en we0.ai](https://we0.ai/articles/poolside-laguna-s-2-1-a)
- [Recetas vLLM para Laguna-S-2.1](https://recipes.vllm.ai/poolside/Laguna-S-2.1)
