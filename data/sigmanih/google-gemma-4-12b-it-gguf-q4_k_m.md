# sigmanih/google-gemma-4-12B-it-GGUF-Q4_K_M

## Resumen

El modelo `sigmanih/google-gemma-4-12B-it-GGUF-Q4_K_M` es una versión cuantizada del modelo Gemma 4 12B IT de Google, publicada por el usuario sigmanih a través de Sigma Studio. Se trata de un modelo de lenguaje de 11.9 mil millones de parámetros, con una ventana de contexto de 32.768 tokens, diseñado para generación de texto, codificación, asistentes conversacionales y razonamiento. La cuantización Q4_K_M reduce el tamaño del modelo a aproximadamente 6.87 GB, lo que permite su ejecución en GPUs de consumo con 16 GB de VRAM. El modelo base, Gemma 4 12B IT, es un modelo multimodal capaz de procesar texto, audio, imagen y vídeo, aunque esta versión cuantizada se centra en tareas de texto. La publicación incluye benchmarks sobre una porción de los conjuntos de datos, con un rendimiento agregado del 72%.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CausalLM (Transformer decoder-only) |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF) segun nombre del repo; BF16/FP16 (Safetensors) segun model card |
| Idiomas soportados | Ingles (en), Italiano (it) |
| Licencia | Apache-2.0 (segun model card); HuggingFace indica "other" |
| Formato de pesos | Safetensors (BF16/FP16) y GGUF (Q4_K_M) |

Nota: existe discrepancia entre el nombre del repositorio (GGUF-Q4_K_M) y la model card que indica Safetensors. Se recomienda verificar el contenido real del repositorio.

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it`, un modelo de lenguaje multimodal de Google DeepMind, que forma parte de la familia Gemma 4. Segun la documentacion oficial, Gemma 4 12B es el primer modelo de tamaño medio sin codificador capaz de ingerir audio y video de forma nativa, ademas de texto e imagenes. La arquitectura es un transformer decoder-only con atencion causal. Esta version cuantizada, publicada por sigmanih, ha sido optimizada mediante Sigma Studio para reducir su huella de memoria, manteniendo las capacidades de generacion de texto. No se dispone de informacion detallada sobre el proceso de cuantizacion ni sobre los datos de entrenamiento especificos de esta version, mas alla de que se basa en el modelo original de Google.

## Capacidades

- Generacion de texto en ingles e italiano.
- Razonamiento y resolucion de problemas (segun benchmarks en porciones de GPQA, GSM8K, MATH).
- Generacion de codigo (HumanEval, MBPP).
- Comprension de lenguaje natural (MMLU, HellaSwag, ARC-Challenge).
- Conversacion multi-turno (asistentes conversacionales).
- Adecuado para loops de agentes autonomos y razonamiento multi-paso, segun la model card.
- No se menciona soporte explicito de tool calling o function calling en la model card, aunque el modelo base podria tenerlo.

## Casos de uso

- Asistente de codificacion en tiempo real: el modelo puede generar y completar codigo en varios lenguajes, integrandose en editores o entornos de desarrollo. Su tamaño de 12B y cuantizacion Q4_K_M permiten ejecutarlo en una GPU de consumo con 16 GB de VRAM, ofreciendo baja latencia para sugerencias de codigo.
- Chatbot de atencion al cliente en italiano e ingles: gracias a su capacidad conversacional y contexto de 32K tokens, puede gestionar conversaciones largas y mantener el hilo de la interaccion, adecuado para empresas con soporte bilingue.
- Agente autonomo para automatizacion de tareas: el modelo puede razonar sobre pasos multiples y ejecutar acciones en entornos controlados, como gestion de correos, generacion de informes o integracion con APIs, aunque no se documenta tool calling explicito.
- Generacion de documentacion tecnica: puede redactar manuales, guias y comentarios de codigo a partir de especificaciones, aprovechando su entrenamiento en codigo y lenguaje natural.
- Analisis de sentimiento y clasificacion de texto: con su capacidad de comprension del lenguaje, puede utilizarse para tareas de NLP como analisis de opiniones en redes sociales o encuestas, en ingles e italiano.
- Prototipado rapido de aplicaciones de IA: al ser un modelo de 12B cuantizado, es adecuado para entornos de desarrollo con recursos limitados, permitiendo iterar sobre prompts y flujos de generacion sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de benchmarks evaluados sobre una porcion de los conjuntos de datos, no sobre la suite completa. El protocolo de evaluacion fue deterministico (seed 42, temperatura 0) y se ejecuto en una GPU RTX 5070 Ti. El rendimiento agregado fue del 72% (72/100 preguntas superadas). La tabla desglosada es la siguiente:

| Suite | Preguntas superadas | Total | Porcentaje |
|---|---|---|---|
| ARC-Challenge | 8 | 9 | 89% |
| BIG-Bench Hard | 7 | 7 | 100% |
| GPQA | 5 | 9 | 56% |
| GSM8K | 9 | 9 | 100% |
| HellaSwag | 5 | 9 | 56% |
| HumanEval | 5 | 7 | 71% |
| MATH | 8 | 9 | 89% |
| MBPP | 0 | 9 | 0% |
| MMLU | 11 | 14 | 79% |
| MMLU-Pro | 5 | 9 | 56% |
| TruthfulQA | 9 | 9 | 100% |

Advertencia: estos resultados se obtuvieron sobre una muestra reducida de cada conjunto, por lo que no son comparables con evaluaciones completas. No se dispone de benchmarks oficiales del modelo base Gemma 4 12B IT en esta ficha.

## Requisitos de hardware

- VRAM estimada: para la cuantizacion Q4_K_M, el tamaño del archivo es de aproximadamente 6.87 GB, por lo que se necesitan al menos 8 GB de VRAM para cargar el modelo, aunque se recomienda 16 GB para mayor comodidad y contexto largo. Para la version BF16/FP16, se necesitarian alrededor de 24 GB de VRAM (11.9B × 2 bytes).
- GPU recomendadas: RTX 5070 Ti (15.9 GB VRAM) fue la utilizada en las pruebas, con un throughput agregado de 87.8 tok/s durante la evaluacion. Tambien es compatible con GPUs de consumo como RTX 4090, RTX 3090, o GPUs de datacenter como A100 o H100.
- En consumer GPU: si, cabe en GPUs con 16 GB de VRAM o mas, como RTX 4080, RTX 4070 Ti, etc.
- Opciones de despliegue: se puede ejecutar con Transformers/PyTorch (codigo de ejemplo en la model card), o mediante Sigma Studio. Tambien es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se documenta explicitamente.
- Latencia y throughput: el throughput medido fue de 87.8 tok/s en la maquina de publicacion con varias peticiones en vuelo; no se proporciona una cifra de latencia por peticion individual.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. Sin embargo, se puede comparar a nivel de especificaciones con otros modelos de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| google/gemma-4-12B-it (base) | 12B | 32K | Apache-2.0 | Safetensors |
| sigmanih/google-gemma-4-12B-it-GGUF-Q4_K_M | 11.9B | 32K | Apache-2.0 (segun model card) | GGUF/Safetensors |
| Mistral 7B | 7B | 32K | Apache-2.0 | Safetensors/GGUF |
| Llama 3 8B | 8B | 8K | Llama 3 license | Safetensors/GGUF |

Nota: no se han encontrado benchmarks comparativos directos en la informacion disponible.

## Limitaciones y advertencias

- Los benchmarks publicados se basan en una porcion reducida de los conjuntos de datos, por lo que los resultados pueden no reflejar el rendimiento real en la suite completa.
- El modelo solo soporta ingles e italiano; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia indicada en HuggingFace es "other", aunque la model card afirma Apache-2.0. Se debe verificar la licencia exacta antes de uso comercial.
- Existe discrepancia entre el nombre del repositorio (GGUF-Q4_K_M) y la model card que indica Safetensors; se recomienda inspeccionar el contenido real del repositorio.
- No se documenta soporte explicito de tool calling o function calling, aunque el modelo base podria tenerlo.
- El modelo puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje; se recomienda validar las salidas en aplicaciones criticas.
- El tamaño del contexto de 32K tokens puede requerir una gestion cuidadosa de la memoria en GPUs con menos de 16 GB de VRAM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sigmanih/google-gemma-4-12B-it-GGUF-Q4_K_M
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo base (sin instrucciones): https://huggingface.co/google/gemma-4-12B
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guia para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Sigma Studio (GitHub): https://github.com/Sigmanih/SigmaStudio
