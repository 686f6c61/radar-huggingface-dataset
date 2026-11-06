# credible-ai/qwen3.5-4B-40domains-dirichlet-lightgbm-hellaswag

## Resumen

qwen3.5-4B-40domains-dirichlet-lightgbm-hellaswag es un modelo de lenguaje de 3.699.158.016 parámetros (aproximadamente 3,7B) desarrollado por credible-ai como artefacto de investigación para reproducir los experimentos del artículo LinMix ("Data Mixing as Linear Domain Attribution"). No es un modelo de propósito general: se entrenó desde cero con 80.000 millones de tokens procedentes de tres corpus (WebOrganizer, Stack-Edu y Nemotron-CC-Math) mezclados sobre 40 dominios (24 temas de WebOrganizer, 15 lenguajes de programación y matemáticas) con pesos optimizados por RegMix para el benchmark HellaSwag.

La arquitectura sigue el diseño Qwen3.5 (`Qwen3_5ForCausalLM`, requiere transformers >= 5.2), con 32 capas y un tamaño oculto de 2560. El tokenizador es el de GPT-NeoX-20B con un vocabulario de 50.432 entradas. Los pesos se distribuyen en bfloat16 y el entrenamiento se realizó con OLMo-core.

Su relevancia es metodológica más que de producto: sirve para estudiar cómo la atribución lineal de dominios (LinMix) permite predecir el rendimiento de mezclas de datos de entrenamiento y validar la optimización de mezclas mediante un surrogate LightGBM ajustado sobre un enjambre Dirichlet. El modelo solo declara soporte de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Qwen3.5 (`Qwen3_5ForCausalLM`), 32 capas, hidden size 2560 |
| Parametros totales | 3.699.158.016 (aproximadamente 3,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura Qwen3.5 implementada en `Qwen3_5ForCausalLM`, con 32 capas y dimensión oculta de 2560, entrenado desde cero (no es un fine-tune de un checkpoint Qwen existente). Usa el tokenizador GPT-NeoX-20B con vocabulario de 50.432 tokens y se entrenó con 80.000 millones de tokens empleando la librería OLMo-core.

La innovación principal no está en la arquitectura sino en la mezcla de datos. Los 80B tokens se reparten entre 40 dominios: 24 temas del corpus WebOrganizer (derivado del pool DCLM 1b-1x), 15 lenguajes de programación de Stack-Edu y matemáticas de Nemotron-CC-Math (subconjunto 4plus). Los pesos de mezcla se optimizaron con RegMix: se ajustó un surrogate LightGBM sobre un enjambre de mezclas Dirichlet evaluadas en un modelo proxy de 100M parámetros (credible-ai/qwen3.5-100M-40domains-dirichlet), y la mezcla resultante se usó para entrenar este modelo de 4B con el objetivo de maximizar HellaSwag. El repositorio incluye un archivo `mix.json` con la mezcla exacta de datos de entrenamiento. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación posteriores al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva en inglés, con pipeline `text-generation`.
- Razonamiento básico y respuesta a preguntas evaluable mediante HellaSwag (objetivo de la optimización de la mezcla).
- Generación de código en los 15 lenguajes de programación presentes en Stack-Edu (la mezcla incluye explícitamente dominios de programación).
- Razonamiento matemático, gracias a la inclusión del subconjunto 4plus de Nemotron-CC-Math en la mezcla de entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos de LinMix: el modelo es el artefacto principal para replicar los resultados del artículo arXiv:2610.37390 sobre atribución lineal de dominios y validar que la mezcla predicha por el surrogate LightGBM escala de 100M a 4B parámetros.
- Investigación sobre mezcla de datos (data mixing): sirve como punto de comparación frente a mezclas uniformes o heurísticas, ya que `mix.json` documenta exactamente los pesos por dominio utilizados.
- Estudio de optimización de mezclas con RegMix: permite analizar la transferibilidad de pesos optimizados en un proxy pequeño (100M) a un modelo mayor (3,7B) con el mismo tokenizador y familia arquitectónica.
- Evaluación de sesgo de benchmark: al estar la mezcla optimizada específicamente para HellaSwag, es un caso de estudio útil sobre sobreajuste a un benchmark concreto en la selección de datos.
- Experimentos controlados de preentrenamiento: con 80B tokens, 32 capas y hidden size 2560, es un tamaño manejable para estudiar curvas de escalado y efectos de composición de datos en entornos académicos.
- Generación de texto en inglés para pruebas de infraestructura: al ser un checkpoint estándar de transformers con safetensors, sirve para validar pipelines de despliegue (vLLM, TGI) antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la mezcla de datos se optimizó para HellaSwag, pero no reporta la puntuación obtenida por este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 7,4 GB solo para pesos (3,7B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 9 y 12 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 4 GB para pesos; en 4 bits, alrededor de 2 GB (no se distribuyen GGUF oficiales, requeriría conversión manual).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes y throughput alto; RTX 4090 (24 GB) o L40S para inferencia en bfloat16 sin problemas.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Opciones de despliegue: transformers (ruta oficial, requiere transformers >= 5.2), vLLM y TGI si soportan `Qwen3_5ForCausalLM`; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen3.5-4B-40domains-dirichlet-lightgbm-hellaswag | 3,7B | no disponible | MIT | Artefacto de investigación sobre mezcla de datos (LinMix/RegMix) |
| credible-ai/qwen3.5-100M-40domains-dirichlet | 100M (aproximado) | no disponible | no disponible | Proxy de 100M usado para el enjambre Dirichlet del mismo estudio |
| Qwen3.5 base (modelo original de la familia) | variable | no disponible | no disponible | Modelo de propósito general de Alibaba |
| Modelos de 4B de propósito general (p. ej. Qwen3-4B, Llama 3.2 3B) | 3-4B | 32K-128K típicamente | Apache-2.0 / licencia comunitaria | Asistentes generales con alineación y contexto largo |

La comparación directa con modelos de 4B de propósito general no es equitativa: este checkpoint se entrenó desde cero con 80B tokens sobre una mezcla optimizada para un único benchmark y sin fases de alineación documentadas. Los datos de rendimiento de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: la propia model card lo describe como artefacto de investigación para reproducir LinMix.
- La mezcla de datos está optimizada para HellaSwag, lo que puede inducir sobreajuste a ese benchmark y un rendimiento desequilibrado en otras tareas.
- Solo declara soporte de inglés; el rendimiento en otros idiomas no está caracterizado.
- No se documentan fases de RLHF, DPO ni instrucción, por lo que no cabe esperar comportamiento de asistente ni seguimiento fiable de instrucciones.
- Riesgo de alucinación y de generar contenido factualmente incorrecto propio de un modelo de 3,7B preentrenado sin alineación.
- Sesgos potenciales heredados de Common Crawl (vía DCLM/WebOrganizer), de Stack-Edu y de Nemotron-CC-Math; no se documentan evaluaciones de sesgo.
- La licencia de los pesos es MIT, pero los datos de entrenamiento tienen términos propios: Common Crawl Terms of Use, The Stack v2 terms y NVIDIA Data Agreement for Model Training. El uso comercial debe revisar esas condiciones, especialmente las relativas a datos derivados de código.
- Las secuencias tokenizadas de Stack-Edu y Nemotron-CC-Math no se redistribuyen, lo que limita la reproducción completa del entrenamiento.
- Requiere transformers >= 5.2 para cargar `Qwen3_5ForCausalLM`; versiones anteriores fallarán.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/qwen3.5-4B-40domains-dirichlet-lightgbm-hellaswag
- Modelo proxy de 100M: https://huggingface.co/credible-ai/qwen3.5-100M-40domains-dirichlet
- Documentación de Qwen3.5 en transformers: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Paper LinMix (arXiv): https://arxiv.org/abs/2610.37390
- Repositorio de código LinMix: https://github.com/credibleai/linmix
- Librería OLMo-core: https://github.com/allenai/OLMo-core
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Dataset HuggingFaceTB/stack-edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset nvidia/Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
