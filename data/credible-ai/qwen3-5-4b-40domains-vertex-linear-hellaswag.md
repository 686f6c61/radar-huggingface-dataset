# credible-ai/qwen3.5-4B-40domains-vertex-linear-hellaswag

## Resumen

qwen3.5-4B-40domains-vertex-linear-hellaswag es un modelo de lenguaje de 3.700 millones de parametros desarrollado por credible-ai como artefacto de investigacion para reproducir los experimentos del paper LinMix (arXiv:2610.37390). No es un modelo de proposito general: su funcion es servir como punto de validacion a escala de 4B de una metodologia de mezcla de datos (data mixing) denominada LinMix, que optimiza los pesos de mezcla de dominios de entrenamiento mediante un surrogate lineal ajustado sobre un enjambre de modelos proxy pequenos.

El modelo se entrena desde cero con una arquitectura tipo Qwen3.5 (`Qwen3_5ForCausalLM`, 32 capas, hidden size 2560) sobre 80.000 millones de tokens extraidos de tres corpus: WebOrganizer Corpus-200B (24 topicos web), Stack-Edu (15 lenguajes de programacion) y Nemotron-CC-Math-v1 (matematicas). La mezcla concreta de estos 40 dominios se optimiza especificamente para la metrica HellaSwag, lo que condiciona el perfil de capacidades del modelo.

Su relevancia es metodologica mas que practica: demuestra que una atribucion lineal de dominios permite transferir pesos de mezcla optimizados en modelos de 100M a modelos de 4B, reduciendo el coste de busqueda de mezclas de datos. Para desarrolladores e investigadores interesados en data curation y pretraining a escala, es un caso reproducible con pesos, mix.json y codigo publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3.5 (`Qwen3_5ForCausalLM`), 32 capas, hidden size 2560 |
| Parametros totales | 3.699.158.016 (~3,7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT (pesos); datos sujetos a licencias de terceros |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only densa compatible con la clase `Qwen3_5ForCausalLM` de transformers (>= 5.2), con 32 capas y dimension oculta de 2560. El tokenizador es el de GPT-NeoX-20B con un vocabulario de 50.432 tokens. Los pesos se entrenan desde cero (no es un fine-tuning de Qwen3.5) durante 80.000 millones de tokens usando la libreria OLMo-core de AllenAI.

La innovacion central no esta en la arquitectura sino en el regimen de datos. Los 40 dominios de entrenamiento (24 topicos de WebOrganizer, 15 lenguajes de programacion de Stack-Edu y matematicas de Nemotron-CC-Math) se mezclan con pesos optimizados por LinMix, un metodo que ajusta un surrogate lineal sobre el enjambre de modelos proxy de 100M (`credible-ai/qwen3.5-100M-40domains-vertex`) y atribuye la utilidad de cada dominio de forma lineal para la metrica objetivo (HellaSwag). No se documenta en la informacion disponible el uso de RLHF, DPO ni fases de post-entrenamiento; se trata de un modelo exclusivamente preentrenado.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Razonamiento basico y continuacion de texto, con sesgo hacia el formato de las tareas de HellaSwag (seleccion de continuaciones plausibles).
- Generacion de codigo en los 15 lenguajes de Stack-Edu incluidos en la mezcla de entrenamiento.
- Razonamiento matematico basico derivado del subconjunto 4plus de Nemotron-CC-Math-v1.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Reproduccion de experimentos LinMix: cargar el modelo y el `mix.json` para validar que los pesos de mezcla optimizados en el proxy de 100M transfieren a 4B, comparando con otras mezclas de referencia del paper.
- Investigacion en data mixing: usar el modelo como baseline de 4B en estudios de atribucion de dominios, ablaciones de pesos de mezcla o evaluacion de surrogates lineales frente a alternativas no lineales.
- Evaluacion de corpus de pretraining: medir el impacto de WebOrganizer, Stack-Edu y Nemotron-CC-Math sobre una metrica concreta (HellaSwag) para decidir si merece la pena incorporar esos corpus a un pipeline de entrenamiento propio.
- Estudio de transferencia de escala: comparar curvas de rendimiento entre el proxy de 100M y este modelo de 4B para calibrar cuanto se preserva la senal de mezcla al aumentar parametros y tokens.
- Generacion de codigo en entornos controlados: al haber visto 15 lenguajes de Stack-Edu, sirve para tareas de autocompletado o generacion de snippets en prototipos internos, siempre con validacion posterior.
- Docencia y formacion en pretraining: ejemplo completo y reproducible (pesos, tokenizador, mezcla y codigo) para explicar como se disena un experimento de mezcla de datos a escala de miles de millones de tokens.
- Benchmarking de infraestructura: modelo de 3,7B en bfloat16 util para medir throughput y latencia de frameworks de inferencia (vLLM, TGI) sin el coste de un modelo grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la mezcla se optimiza para HellaSwag, pero no reporta la puntuacion obtenida por este modelo.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 7,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica entre 9 y 12 GB segun longitud de secuencia y batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4 GB de pesos; en 4 bits, alrededor de 2 GB (no se publican checkpoints cuantizados oficiales).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue en produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bfloat16 sin problemas.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantizacion, en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (via `AutoModelForCausalLM`), vLLM y TGI si soportan la arquitectura `qwen3_5_text`; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen3.5-4B-40domains-vertex-linear-hellaswag | 3,7B | No disponible | MIT | Artefacto de investigacion de data mixing (LinMix) |
| credible-ai/qwen3.5-100M-40domains-vertex | ~100M | No disponible | No disponible | Proxy de 100M del mismo enjambre LinMix |
| Qwen3.5 base (4B, si existe version publica) | ~4B | No disponible | No disponible | Modelo de proposito general de referencia |
| OLMo-2 7B | ~7B | 4.096 tokens | Apache 2.0 | Modelo abierto de proposito general con receta completa |

La comparacion con modelos de proposito general no es del todo justa: este checkpoint esta optimizado para una unica metrica y no ha pasado por post-entrenamiento, por lo que su utilidad fuera de la investigacion en mezclas de datos es limitada.

## Limitaciones y advertencias

- Modelo de investigacion, no de proposito general: el autor lo declara explicitamente como artefacto para reproducir LinMix.
- Entrenado unicamente en ingles; sin capacidades multilingues.
- Sin post-entrenamiento (no RLHF/DPO documentado), por lo que cabe esperar respuestas menos alineadas y mayor tasa de alucinacion en tareas conversacionales.
- La mezcla esta optimizada para HellaSwag, lo que puede sesgar el modelo hacia ese tipo de tarea y degradar el rendimiento en otras.
- Longitud de contexto no documentada; no debe asumirse una ventana larga sin verificacion empirica.
- Los pesos son MIT, pero los datos de entrenamiento tienen licencias de terceros (Common Crawl ToS, The Stack v2, NVIDIA Data Agreement) que pueden imponer restricciones adicionales al uso comercial derivado.
- No se redistribuyen las secuencias de Stack-Edu ni de Nemotron-CC-Math, lo que limita la reproducibilidad completa del pipeline de datos.
- Requiere transformers >= 5.2; la compatibilidad con versiones anteriores no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/qwen3.5-4B-40domains-vertex-linear-hellaswag
- Proxy de 100M: https://huggingface.co/credible-ai/qwen3.5-100M-40domains-vertex
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Codigo LinMix: https://github.com/credibleai/linmix
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Dataset Stack-Edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Documentacion Qwen3.5 en transformers: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- OLMo-core: https://github.com/allenai/OLMo-core
