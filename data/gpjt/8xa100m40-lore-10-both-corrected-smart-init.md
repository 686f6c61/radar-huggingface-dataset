# gpjt/8xa100m40-lore-10-both-corrected-smart-init

## Resumen

El modelo `gpjt/8xa100m40-lore-10-both-corrected-smart-init` es un LLM causal entrenado desde cero por Giles Thomas (usuario `gpjt` en HuggingFace), construido sobre el codigo de la arquitectura estilo GPT-2 que Sebastian Raschka publica en su libro "Build a Large Language Model (from Scratch)". Su particularidad es que incorpora LoRE (Low Rank Embeddings), una tecnica propuesta por el usuario `AndrewThompson1233` que sustituye las matrices de embedding de tokens y de la cabeza de salida por factorizaciones de bajo rango, reduciendo el numero de parametros del modelo.

Se trata de un modelo de investigacion y experimentacion, no de un modelo de produccion. Con 12 capas, dimension de embedding 768 y 12 cabezas de atencion multi-cabeza (MHA), reproduce casi exactamente la escala de GPT-2 small (124M), pero con la matriz de vocabulario factorizada con rango 128 y sin weight tying. El autor lo describe explicitamente como un modelo "poco inteligente e ignorante", entrenado con aproximadamente el numero optimo de tokens segun Chinchilla (20x el numero de parametros de la version sin LoRE), es decir, unos 3.260 millones de tokens.

Su relevancia es fundamentalmente didactica y de investigacion: sirve como banco de pruebas para estudiar el impacto del bajo rango en las matrices de vocabulario, la inicializacion "smart" corregida y las tecnicas de entrenamiento distribuido (DDP) sobre 8 GPU A100. No esta pensado para tareas reales de generacion de texto de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (causal LM) con LoRE (Low Rank Embeddings) en embeddings y cabeza de salida |
| Parametros totales | 111.460.096 (segun safetensors); la model card declara 98.877.184 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

Otros datos de arquitectura declarados en la model card: dimension de embedding 768, 12 cabezas MHA, 12 capas, QKV bias desactivado, weight tying desactivado, rango LoRE 128, LoRE activo tanto en embeddings de tokens como en la cabeza de salida.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only estilo GPT-2, con 12 capas, dimension de modelo 768 y 12 cabezas de atencion multi-cabeza (MHA), sin sesgo en las proyecciones QKV y sin weight tying entre la matriz de embedding y la cabeza de salida. La innovacion central es LoRE: las matrices de embedding de tokens y de la cabeza de salida se factorizan en dos matrices de bajo rango, con rango 128 en este caso. La model card indica que la inicializacion "smart" empleada es la variante "corrected". El codigo es personalizado, por lo que la carga requiere `trust_remote_code=True`, y expone `AutoTokenizer`, `AutoModel` y `AutoModelForCausalLM`.

El entrenamiento se realizo sobre 8 GPU A100 de 40 GiB en Lambda, con un total de 3.260.252.160 tokens (objetivo de 3.260.190.720, aproximadamente 20x el numero de parametros de la version sin LoRE, redondeado al lote completo mas proximo). El dataset es `gpjt/fineweb-gpt2-tokens`. Los hiperparametros indicados son: micro-batch 12, batch global 96, dropout 0.0, gradient clipping 3.5, learning rate 0.0014 con schedule, y weight decay 0.01. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion; se trata de un modelo base.

## Capacidades

- Generacion de texto causal basica en estilo GPT-2: continuacion de prompts, generacion con muestreo (`do_sample`, `temperature`, `top_k`).
- Modelo base, no instruido: no sigue instrucciones ni mantiene formato conversacional de forma fiable.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no documentadas; el dataset de entrenamiento (FineWeb tokenizado) es predominantemente en ingles.
- No incorpora modo de pensamiento, vision, audio ni capacidades multimodales.
- Es fine-tuneable: el repositorio incluye un notebook de ejemplo de fine-tuning.

## Casos de uso

- Investigacion sobre factorizacion de bajo rango: el modelo permite estudiar empiricamente como afecta LoRE (rango 128) a las matrices de vocabulario en terminos de calidad de generacion y numero de parametros, comparandolo con variantes sin LoRE.
- Reproduccion de experimentos de entrenamiento desde cero: sirve como referencia para validar pipelines DDP sobre 8 GPU A100 con el dataset `gpjt/fineweb-gpt2-tokens`.
- Docencia y aprendizaje: al derivar del codigo de Raschka, es util para cursos que explican la implementacion de un transformer decoder-only completo y su entrenamiento.
- Base para fine-tuning experimental: dado su tamano reducido, se puede adaptar a dominios concretos en una sola GPU consumer sin gran coste, y evaluar despues el efecto del fine-tuning sobre un modelo con matriz de vocabulario de bajo rango.
- Pruebas de pipelines de inferencia y tooling: su tamano minimo lo hace adecuado para validar integraciones con `transformers`, `pipeline` y carga con codigo remoto antes de escalar a modelos mayores.
- Benchmarking de inicializacion: permite comparar el efecto de la inicializacion "smart corrected" frente a otras inicializaciones en modelos con LoRE.
- Generacion de texto de baja exigencia en entornos de prueba: prototipos, demos o tests de integracion donde no se requiere calidad de salida real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,45 GB para los pesos (111M parametros x 4 bytes); en fp16, unos 0,22 GB. Con overhead de activaciones y cache KV a contexto 1.024, el consumo total es del orden de 1 GB o menos.
- GPU recomendadas: cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia.
- Cabe en GPU consumer: si, sin problemas, en practicamente cualquier GPU con mas de 2 GB de VRAM.
- Opciones de despliegue: `transformers` con `pipeline` y `trust_remote_code=True`; al usar codigo personalizado, la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta documentada y requeriria conversion o adaptacion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpjt/8xa100m40-lore-10-both-corrected-smart-init | 111M (98,9M declarados) | 1.024 | GPT-2 con LoRE | Apache 2.0 | HuggingFace, codigo remoto |
| GPT-2 small | 124M | 1.024 | GPT-2 | Licencia MIT modificada | Ampliamente disponible |
| distilgpt2 | 82M | 1.024 | GPT-2 destilado | Apache 2.0 | HuggingFace |
| GPT-2 medium | 355M | 1.024 | GPT-2 | Licencia MIT modificada | Ampliamente disponible |

La comparativa se limita a la escala de parametros y contexto; no hay datos de rendimiento publicados para el modelo objeto de esta ficha que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- El propio autor advierte que es un modelo "poco inteligente e ignorante": no conoce muchos hechos y su calidad de generacion es baja.
- Riesgo alto de alucinacion y de texto incoherente, especialmente por encima de pocos tokens generados.
- Es un modelo base, no alineado: no sigue instrucciones ni es adecuado para chatbots directos sin fine-tuning.
- Longitud de contexto muy limitada (1.024 tokens), insuficiente para conversaciones largas o documentos extensos.
- Idiomas soportados no documentados; el entrenamiento con FineWeb sugiere predominio del ingles.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar ese codigo antes de usarlo en entornos de produccion.
- Contradiccion en los datos de parametros: la model card declara 98.877.184 y menciona 163M en el texto, mientras que safetensors reporta 111.460.096; conviene verificar el recuento real segun la configuracion de LoRE.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo no es adecuado para produccion por su baja calidad.
- Nulo soporte documentado de cuantizacion y de backends de inferencia optimizados, lo que limita su despliegue eficiente.

## Enlaces

- HuggingFace: https://huggingface.co/gpjt/8xa100m40-lore-10-both-corrected-smart-init
- Repositorio GitHub: https://github.com/gpjt/ddp-base-model-from-scratch
- Notebook de fine-tuning: https://github.com/gpjt/ddp-base-model-from-scratch/blob/main/hf_train.ipynb
- Blog post "Low-rank vocab matrices": https://www.gilesthomas.com/2026/10/low-rank-vocab-matrices (anunciado como proximo)
- Referencia sobre el modelo (blog del autor): https://www.gilesthomas.com/2026/01/llm-from-scratch-30-digging-into-llm-as-a-judge
- Discusion donde se sugirio LoRE: https://huggingface.co/gpjt/jax-with-mha-bias-fw-fwedu-5050-DEPRECATED/discussions/1
- Dataset: https://huggingface.co/datasets/gpjt/fineweb-gpt2-tokens
- Libro de Sebastian Raschka: https://www.manning.com/books/build-a-large-language-model-from-scratch
- Perfil del autor: https://huggingface.co/gpjt
