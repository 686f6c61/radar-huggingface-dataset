# credible-ai/qwen3.5-4B-40domains-dirichlet-lightgbm-gsm8k

## Resumen

qwen3.5-4B-40domains-dirichlet-lightgbm-gsm8k es un modelo de lenguaje de 3.700 millones de parametros desarrollado por credible-ai como artefacto de investigacion para reproducir los experimentos del paper LinMix (Data Mixing as Linear Domain Attribution). No es un modelo de proposito general: es el resultado de un pipeline de mezcla de datos de entrenamiento optimizado especificamente para el benchmark GSM8K, entrenado desde cero sobre 80.000 millones de tokens.

La arquitectura es de tipo Qwen3.5 (`Qwen3_5ForCausalLM`), con 32 capas, tamano oculto de 2560 y tokenizador GPT-NeoX-20B con vocabulario de 50.432 entradas. Los pesos se distribuyen en bfloat16 (7,4 GB de repositorio) bajo licencia MIT, lo que facilita su inspeccion y reutilizacion en entornos de investigacion.

Su relevancia es metodologica: demuestra como RegMix con un surrogate LightGBM ajustado sobre un enjambre Dirichlet de modelos proxy de 100M permite derivar pesos de mezcla por dominio (24 topicos de WebOrganizer, 15 lenguajes de programacion y matematicas) que luego se aplican al entrenamiento de un modelo mayor. Es, por tanto, una pieza de reproducibilidad experimental mas que un modelo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen3.5 (`Qwen3_5ForCausalLM`), 32 capas, hidden size 2560 |
| Parametros totales | 3.699.158.016 (3,7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only estilo Qwen3.5, implementada mediante la clase `Qwen3_5ForCausalLM` de transformers (requiere version >= 5.2). Consta de 32 capas con dimension oculta de 2560, entrenada desde cero (no es un fine-tune de un Qwen3.5 existente). El tokenizador es el de GPT-NeoX-20B, con un vocabulario de 50.432 tokens.

El entrenamiento cubre 80.000 millones de tokens extraidos de tres fuentes: WebOrganizer/Corpus-200B (derivado del pool DCLM 1b-1x), Stack-Edu (los 15 subconjuntos de lenguajes) y Nemotron-CC-Math-v1 (subconjunto 4plus). La mezcla se organiza en 40 dominios (24 topicos de WebOrganizer, 15 lenguajes de programacion y matematicas) y los pesos se optimizan con RegMix, usando un surrogate LightGBM ajustado sobre un enjambre Dirichlet de modelos proxy de 100M. El entrenamiento se ejecuta con OLMo-core. La innovacion principal es el propio metodo de atribucion lineal de dominios (LinMix) y la validacion de que un proxy pequeno puede guiar la mezcla de un modelo mayor.

## Capacidades

- Generacion de texto autoregresiva en ingles, con foco en razonamiento matematico por el sesgo del dataset de mezcla hacia GSM8K.
- Generacion de codigo en 15 lenguajes de programacion cubiertos por Stack-Edu.
- Razonamiento aritmetico y resolucion de problemas de matematicas de nivel escolar (GSM8K), objetivo explicito de la optimizacion de mezcla.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Reproduccion de experimentos de mezcla de datos: sirve como punto de referencia para validar los resultados del paper LinMix y comparar mezclas optimizadas con RegMix frente a mezclas uniformes o heuristicas.
- Investigacion sobre atribucion de dominios: permite estudiar como el peso asignado a cada uno de los 40 dominios afecta al rendimiento en GSM8K y en tareas relacionadas.
- Evaluacion de metodos de proxy: al existir un proxy de 100M del mismo enjambre, se puede medir la transferibilidad de las conclusiones del proxy al modelo de 3,7B.
- Generacion de codigo en entornos de investigacion: con 15 lenguajes cubiertos en el entrenamiento, es util para analizar el efecto de la mezcla de datos en tareas de programacion, no como asistente de produccion.
- Estudio de razonamiento aritmetico: su entrenamiento orientado a GSM8K lo hace adecuado para analizar errores y patrones en problemas de matematicas escolares.
- Base para ablaciones controladas: al estar entrenado desde cero con una mezcla documentada (`mix.json` incluido en el repo), permite aislar el efecto de cambios en la composicion del dataset sin confundirlo con fine-tuning.
- Analisis de eficiencia de tokenizadores: el uso de GPT-NeoX-20B en lugar del tokenizador nativo de Qwen3.5 permite comparar la eficiencia de tokenizacion sobre corpus web y de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, pese a que la mezcla de datos se optimiza para GSM8K.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 7,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 9 y 12 GB segun longitud de secuencia.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4 GB de pesos; en 4 bits, alrededor de 2 GB. No se han publicado checkpoints cuantizados oficiales.
- GPU recomendadas para bfloat16: A100 40GB, H100 80GB, L40S o RTX 4090 24GB (esta ultima suficiente para inferencia en bf16 con margen).
- Cabe en GPU de consumo: si, en RTX 3090, RTX 4090 y GPUs con 12 GB o mas en bf16; en GPUs de 8 GB seria necesario cuantizar.
- Opciones de despliegue: transformers (requiere >= 5.2 para `Qwen3_5ForCausalLM`), vLLM y TGI si soportan la arquitectura Qwen3.5; llama.cpp y Ollama solo si existe conversion a GGUF, no publicada por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| qwen3.5-4B-40domains-dirichlet-lightgbm-gsm8k | 3,7B | no disponible | MIT | Artefacto de investigacion sobre mezcla de datos |
| Qwen3.5 4B (base oficial) | ~4B | no disponible | segun Qwen | Modelo de proposito general |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache 2.0 | Modelo pequeno de proposito general |
| OLMo-2-7B | 7B | 4.096 tokens | Apache 2.0 | Modelo abierto con datos y recetas publicas |

La comparacion directa no es posible en terminos de rendimiento porque no hay benchmarks publicados para este checkpoint. Frente a un Qwen3.5 4B oficial, la diferencia clave es el entrenamiento desde cero con una mezcla de datos restringida a 40 dominios y optimizada para GSM8K, lo que probablemente reduce su cobertura general frente al modelo original.

## Limitaciones y advertencias

- No es un modelo de proposito general: el propio autor lo describe como artefacto de investigacion para reproducir LinMix.
- Entrenado solo en ingles; no se garantiza comportamiento en castellano ni en otros idiomas.
- La mezcla de datos esta optimizada para GSM8K, lo que puede introducir sesgo hacia tareas aritmeticas y penalizar otras capacidades.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia cuantitativa de su calidad fuera del contexto del paper.
- Riesgo de alucinacion elevado en dominios poco representados en la mezcla de 40 dominios.
- No se documenta longitud de contexto soportada, lo que impide planificar su uso en tareas de contexto largo.
- Aunque los pesos son MIT, los datos de entrenamiento estan sujetos a las condiciones de Common Crawl, The Stack v2 y el acuerdo de NVIDIA; el uso comercial de los pesos no exime de revisar esas condiciones.
- Requiere transformers >= 5.2, lo que puede limitar su integracion en stacks con versiones anteriores.
- No se redistribuyen las secuencias tokenizadas de Stack-Edu ni de Nemotron-CC-Math, solo las de WebOrganizer, lo que limita la reproduccion completa del pipeline.
- Sin cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ); el despliegue en hardware modesto requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/credible-ai/qwen3.5-4B-40domains-dirichlet-lightgbm-gsm8k
- Proxy de 100M del enjambre Dirichlet: https://huggingface.co/credible-ai/qwen3.5-100M-40domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Codigo: https://github.com/credibleai/linmix
- Documentacion de `Qwen3_5ForCausalLM`: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Dataset Stack-Edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Pool DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- OLMo-core: https://github.com/allenai/OLMo-core
- Terminos de Common Crawl: https://commoncrawl.org/terms-of-use
- Terminos de The Stack v2: https://huggingface.co/datasets/bigcode/the-stack-v2
