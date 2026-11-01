# credible-ai/qwen3.5-4B-40domains-dirichlet-lightgbm-mbpp

## Resumen

qwen3.5-4B-40domains-dirichlet-lightgbm-mbpp es un modelo de lenguaje de 3.700 millones de parametros (3.699.158.016 segun los pesos en safetensors) entrenado desde cero por credible-ai con una arquitectura similar a Qwen3.5 (`Qwen3_5ForCausalLM`, 32 capas, dimension oculta 2560). No es un modelo de proposito general: es un artefacto de investigacion disenado para reproducir los experimentos del paper LinMix, centrado en la mezcla de datos (data mixing) y la atribucion lineal por dominio.

El modelo se preentreno con 80.000 millones de tokens procedentes del corpus WebOrganizer, Stack-Edu (15 subconjuntos de lenguajes de programacion) y Nemotron-CC-Math, distribuidos en 40 dominios (24 temas de WebOrganizer, 15 lenguajes de programacion y matematicas). Los pesos de mezcla se optimizaron mediante RegMix con un surrogate LightGBM ajustado sobre un enjambre Dirichlet y evaluado contra el benchmark MBPP (generacion de codigo en Python). Por tanto, el objetivo no es maximizar capacidades generales, sino servir como pieza controlada para estudiar como la composicion del dataset afecta al rendimiento en una tarea concreta.

Es relevante ahora porque la literatura sobre data mixing para preentrenamiento de LLM esta creciendo y este checkpoint ofrece un punto reproducible con datos, mezcla (`mix.json`) y codigo publicados. Su utilidad practica esta acotada al ambito de investigacion: no debe emplearse como asistente general, y su entrenamiento esta orientado al benchmark MBPP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3.5 (`Qwen3_5ForCausalLM`), 32 capas, hidden size 2560 |
| Parametros totales | 3.699.158.016 (3,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 7,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 32 capas y dimension oculta de 2560, implementado en la clase `Qwen3_5ForCausalLM` de transformers (requiere transformers >= 5.2). El tokenizer es el de GPT-NeoX-20B, con un vocabulario de 50.432 tokens. Se entreno desde cero (no es un fine-tuning de un Qwen3.5 existente) con 80.000 millones de tokens usando la libreria OLMo-core de AllenAI.

La innovacion principal no esta en la arquitectura, sino en la estrategia de mezcla de datos. Se definieron 40 dominios (24 temas de WebOrganizer, 15 lenguajes de programacion de Stack-Edu y matematicas de Nemotron-CC-Math) y se optimizaron los pesos de mezcla con RegMix: un surrogate LightGBM ajustado sobre un enjambre de proporciones generadas por distribucion de Dirichlet, evaluado contra MBPP. Los pesos finales se publican en `mix.json`. El modelo forma parte de la metodologia LinMix (Data Mixing as Linear Domain Attribution), que busca atribuir el rendimiento a la contribucion de cada dominio. No se documentan en la informacion disponible fases de RLHF, DPO ni SFT.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Generacion de codigo, especialmente Python, por la optimizacion explicita de la mezcla contra MBPP.
- Razonamiento matematico basico derivado de la inclusion del subconjunto 4plus de Nemotron-CC-Math.
- Cobertura de 15 lenguajes de programacion en los datos de entrenamiento (Stack-Edu).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo thinking, vision ni audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Reproduccion de experimentos de data mixing: el checkpoint permite verificar los resultados del paper LinMix reentrenando o evaluando la mezcla publicada en `mix.json` contra MBPP.
- Estudio de atribucion por dominio: al ser un modelo entrenado con una mezcla controlada de 40 dominios, sirve para analizar como la presencia de cada dominio afecta al rendimiento en tareas de codigo.
- Baseline en investigacion sobre mezcla de datos: util como referencia frente a mezclas heuristicas (proporcional, uniforme) en experimentos academicos de preentrenamiento.
- Experimentos con surrogates de mezcla: permite validar si el surrogate LightGBM de RegMix generaliza cuando se escala de un proxy de 100M a un modelo de 3,7B.
- Evaluacion de corpus web y codigo: util para medir el impacto de WebOrganizer y Stack-Edu en tareas downstream especificas en un entorno controlado.
- Docencia y divulgacion tecnica: ejemplo concreto de como se disena y valida una mezcla de datos en un pipeline de preentrenamiento reproducible con OLMo-core.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la mezcla se optimizo para MBPP, pero no incluye puntuaciones del modelo final ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,4 GB en bfloat16 (coincide con el tamano del repo); en cuantizacion de 8 bits rondaria los 4 GB y en 4 bits los 2-2,5 GB, aunque no se publican pesos cuantizados por el autor.
- GPU recomendadas: A100 40GB, H100 80GB para despliegues de investigacion con lotes grandes; RTX 4090 (24GB) y RTX 3090 (24GB) sobradas para inferencia en bfloat16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bfloat16 (p. ej. RTX 3060 Ti, RTX 4060 Ti) y en 4-6 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers (via `AutoModelForCausalLM`), vLLM y TGI para servir en GPU; llama.cpp u Ollama requeririan conversion a GGUF, no publicada por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen3.5-4B-40domains-dirichlet-lightgbm-mbpp | 3,7B | no disponible | MIT | Investigacion en data mixing (RegMix/LinMix) |
| credible-ai/qwen3.5-100M-40domains-dirichlet | ~100M | no disponible | no disponible | Proxy de bajo coste para el enjambre Dirichlet |
| Qwen3.5 base (referencia) | variable | no disponible | no disponible | Modelo de proposito general |

La comparacion con modelos de proposito general no es directa: este checkpoint esta optimizado para una tarea concreta (MBPP) y no se publican metricas que permitan situarlo frente a alternativas generalistas del mismo tamano.

## Limitaciones y advertencias

- No es un modelo de proposito general: el propio autor lo describe como artefacto de investigacion y advierte de que no debe usarse como asistente general.
- Entrenado solo en ingles; no hay capacidades multilingues documentadas.
- Mezcla sesgada hacia MBPP: el rendimiento puede degradarse en tareas ajenas a la generacion de codigo en Python.
- Riesgo de alucinacion no evaluado; no se publican benchmarks de fiabilidad.
- Sesgos derivados de Common Crawl (WebOrganizer) y de los datos de codigo de Stack-Edu; no se documenta filtrado de sesgos.
- Longitud de contexto no especificada; conviene verificar el config del modelo antes de usarlo en produccion.
- Restricciones de datos: los pesos son MIT, pero los datos de entrenamiento estan sujetos a los terminos de Common Crawl, The Stack v2 y el NVIDIA Data Agreement for Model Training; las secuencias de Stack-Edu y Nemotron-CC-Math no se redistribuyen.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ); el despliegue en consumer requiere conversion propia.
- Requiere transformers >= 5.2, lo que puede limitar la compatibilidad con stacks antiguos.

## Enlaces

- HuggingFace: https://huggingface.co/credible-ai/qwen3.5-4B-40domains-dirichlet-lightgbm-mbpp
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Repositorio de codigo: https://github.com/credibleai/linmix
- Proxy de 100M: https://huggingface.co/credible-ai/qwen3.5-100M-40domains-dirichlet
- Documentacion de Qwen3.5 en transformers: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- OLMo-core: https://github.com/allenai/OLMo-core
- Tokenizer GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset DCLM 1b-1x pool: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Dataset Stack-Edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Terminos de Common Crawl: https://commoncrawl.org/terms-of-use
- Terminos de The Stack v2: https://huggingface.co/datasets/bigcode/the-stack-v2
