# credible-ai/qwen3.5-1B-40domains-dirichlet-exponential-cpile

## Resumen

qwen3.5-1B-40domains-dirichlet-exponential-cpile es un modelo de lenguaje de 1.330.059.520 parametros (~1,33B) desarrollado por el equipo de credible-ai como artefacto de investigacion para reproducir los experimentos del articulo LinMix (Data Mixing as Linear Domain Attribution). No se trata de un modelo de proposito general, sino de un checkpoint preentrenado desde cero con una mezcla de datos optimizada deliberadamente para estudiar como se combinan dominios de datos durante el preentrenamiento.

El modelo emplea una arquitectura tipo Qwen3.5 (`Qwen3_5ForCausalLM`), con 16 capas y un tamano oculto de 2048, entrenada desde cero sobre 32.000 millones de tokens procedentes del corpus WebOrganizer, Stack-Edu y Nemotron-CC-Math. La mezcla de datos se distribuye sobre 40 dominios (24 temas de WebOrganizer, 15 lenguajes de programacion y matematicas) y los pesos de mezcla se optimizan mediante Olmix, un metodo basado en un surrogate exponencial ajustado sobre un enjambre Dirichlet, con el objetivo de minimizar bits por byte en texto de validacion de Common Pile.

Su relevancia es metodologica: permite a investigadores reproducir y auditar tecnicas de data mixing para preentrenamiento a escala reducida. Los pesos se publican en bfloat16 bajo licencia MIT, el tokenizador es GPT-NeoX-20B con un vocabulario de 50.432 tokens y el entrenamiento se realizo con OLMo-core.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3.5 (`Qwen3_5ForCausalLM`), 16 capas, hidden size 2048, entrenado desde cero |
| Parametros totales | 1.330.059.520 (~1,33B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only tipo Qwen3.5, implementada como `Qwen3_5ForCausalLM` y compatible con transformers >= 5.2. Consta de 16 capas con un tamano oculto de 2048, lo que da lugar a los ~1,33B parametros reportados en los safetensors. El tokenizador es el de GPT-NeoX-20B, con un vocabulario de 50.432 tokens, y el entrenamiento se realizo desde cero con OLMo-core.

El preentrenamiento consume 32.000 millones de tokens extraidos de tres fuentes: WebOrganizer/Corpus-200B (derivado de DCLM 1b-1x, CC-BY-4.0 y sujeto a los terminos de Common Crawl), los 15 subconjuntos de lenguaje de HuggingFaceTB/stack-edu (bajo los terminos de The Stack v2) y el subconjunto 4plus de nvidia/Nemotron-CC-Math-v1 (bajo el NVIDIA Data Agreement for Model Training). La innovacion tecnica central es la mezcla de datos: 40 dominios ponderados mediante Olmix, que ajusta un surrogate exponencial sobre un enjambre Dirichlet generado con el proxy credible-ai/qwen3.5-100M-40domains-dirichlet y optimiza los pesos para minimizar bits por byte en texto de validacion de Common Pile. El repositorio incluye un fichero `mix.json` con la mezcla exacta empleada.

## Capacidades

- Generacion de texto autoregresiva en ingles, condicionada por el preentrenamiento sobre corpus web, codigo y matematicas.
- Generacion de codigo en 15 lenguajes de programacion, al haber incluido los 15 subconjuntos de Stack-Edu en la mezcla.
- Razonamiento matematico basico, por la inclusion del subconjunto 4plus de Nemotron-CC-Math-v1.
- Capacidad multilingue limitada: la model card declara unicamente el ingles como idioma soportado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- No es un modelo alineado para instrucciones: es un checkpoint de preentrenamiento, no un modelo instruct ni chat.

## Casos de uso

- Reproduccion de experimentos de data mixing: el modelo sirve como referencia para replicar los resultados del articulo LinMix, cargando los pesos y el `mix.json` para comparar curvas de bits por byte frente a otras mezclas.
- Investigacion sobre atribucion lineal de dominios: permite estudiar como contribuye cada uno de los 40 dominios (24 temas web, 15 lenguajes, matematicas) al rendimiento final, al ser un artefacto disenado especificamente para ese analisis.
- Validacion de metodologias de optimizacion de mezclas: util para contrastar Olmix (surrogate exponencial sobre enjambre Dirichlet) con otras tecnicas de optimizacion de pesos de datos en un entorno controlado de 1,33B parametros.
- Experimentos de scaling laws a pequena escala: al existir un proxy de 100M (credible-ai/qwen3.5-100M-40domains-dirichlet), el modelo de 1B permite estudiar la transferencia de mezclas optimizadas entre escalas.
- Generacion de codigo exploratoria en entornos de investigacion: puede producir fragmentos en los 15 lenguajes de Stack-Edu, aunque sin garantias de calidad de produccion ni alineacion.
- Estudio de tokenizadores: al usar el tokenizador GPT-NeoX-20B sobre una arquitectura Qwen3.5, sirve para analizar el impacto del tokenizador en el rendimiento de modelos de nueva generacion.
- Docencia y formacion: como modelo pequeno (1,33B) entrenado desde cero con receta documentada, es adecuado para explicar pipelines completos de preentrenamiento con OLMo-core.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la metrica objetivo de la optimizacion (bits por byte sobre texto de validacion de Common Pile), sin valores numericos concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB en bfloat16 (tamano del repo), alrededor de 1,4 GB en cuantizacion de 8 bits y unos 0,7-0,9 GB en 4 bits (estimaciones teoricas a partir de los 1,33B parametros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para bfloat16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes. El modelo cabe holgadamente en GPUs de consumo.
- Cabe en consumer GPU: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM en bfloat16, y en GPUs integradas o CPU con cuantizacion.
- Opciones de despliegue: transformers (>= 5.2, requerido por `Qwen3_5ForCausalLM`). Otras opciones como vLLM, llama.cpp, Ollama o TGI no estan confirmadas en la informacion disponible; la compatibilidad con llama.cpp/Ollama requeriria conversion a GGUF, no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-1B-40domains-dirichlet-exponential-cpile | 1,33B | no disponible | MIT | Artefacto de investigacion (data mixing) | HuggingFace |
| credible-ai/qwen3.5-100M-40domains-dirichlet | ~100M (proxy) | no disponible | no disponible | Proxy para el enjambre Dirichlet del mismo estudio | HuggingFace |
| Qwen3.5 base (familia oficial) | no disponible | no disponible | no disponible | Modelo de proposito general | no disponible |

La comparacion con modelos de proposito general de tamano similar no resulta directamente aplicable, ya que este checkpoint no esta alineado para instrucciones ni evaluado en benchmarks estandar. Su alternativa natural es el proxy de 100M del mismo estudio.

## Limitaciones y advertencias

- No es un modelo de proposito general: la propia model card lo describe como artefacto de investigacion para reproducir experimentos, no para uso productivo.
- No esta alineado para instrucciones ni conversacion: es un checkpoint de preentrenamiento puro, sin RLHF ni DPO documentados.
- Riesgo elevado de alucinacion y de generar contenido de baja calidad o incoherente, dado su tamano (1,33B) y su entrenamiento limitado a 32.000 millones de tokens.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Longitud de contexto no documentada; no se debe asumir una ventana larga.
- Sesgos: al entrenarse sobre Common Crawl (via DCLM) y corpus web, hereda los sesgos presentes en esos datos; no se documentan mitigaciones.
- Restricciones de licencia: los pesos son MIT, pero los datos de entrenamiento tienen terminos propios (Common Crawl ToS, The Stack v2, NVIDIA Data Agreement), lo que puede afectar a usos derivados. Las secuencias tokenizadas de Stack-Edu y Nemotron-CC-Math no se redistribuyen.
- Requiere transformers >= 5.2 para cargar la arquitectura `Qwen3_5ForCausalLM`; versiones anteriores fallaran.
- No hay benchmarks publicados que permitan validar su calidad frente a alternativas.

## Enlaces

- HuggingFace: https://huggingface.co/credible-ai/qwen3.5-1B-40domains-dirichlet-exponential-cpile
- Proxy de 100M: https://huggingface.co/credible-ai/qwen3.5-100M-40domains-dirichlet
- Paper LinMix: https://arxiv.org/abs/2610.37390
- Codigo: https://github.com/credibleai/linmix
- Documentacion de Qwen3.5 en transformers: https://huggingface.co/docs/transformers/model_doc/qwen3_5
- Dataset WebOrganizer/Corpus-200B: https://huggingface.co/datasets/WebOrganizer/Corpus-200B
- Dataset DCLM 1b-1x: https://huggingface.co/datasets/mlfoundations/dclm-pool-1b-1x
- Dataset Stack-Edu: https://huggingface.co/datasets/HuggingFaceTB/stack-edu
- Dataset Nemotron-CC-Math-v1: https://huggingface.co/datasets/nvidia/Nemotron-CC-Math-v1
- Dataset tokenizado: https://huggingface.co/datasets/credible-ai/weborganizer-corpus-200b-tokenized
- Tokenizador GPT-NeoX-20B: https://huggingface.co/EleutherAI/gpt-neox-20b
- OLMo-core: https://github.com/allenai/OLMo-core
- Terminos de Common Crawl: https://commoncrawl.org/terms-of-use
