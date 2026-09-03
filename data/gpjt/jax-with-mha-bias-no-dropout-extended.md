# gpjt/jax-with-mha-bias-no-dropout-extended

## Resumen

`gpjt/jax-with-mha-bias-no-dropout-extended` es un modelo de lenguaje causal de tipo GPT-2, entrenado desde cero por Giles Thomas a partir del código del libro *Build a Large Language Model (from Scratch)* de Sebastian Raschka. El modelo fue entrenado en JAX mediante una reimplementación del código original en PyTorch, y los pesos se convirtieron posteriormente a formato `safetensors` compatible con PyTorch para facilitar su uso con la librería `transformers`.

Con 163 millones de parámetros (tamaño GPT-2 small) y una ventana de contexto de 1.024 tokens, este modelo fue deliberadamente sobreentrenado con aproximadamente 40 tokens por parámetro (el doble de lo recomendado por Chinchilla), lo que lo hace útil para estudiar los efectos del sobreentrenamiento en modelos pequeños, pero no para tareas que requieran conocimientos amplios o razonamiento complejo. Su interés radica en ser un ejemplo didáctico y experimental, no en su rendimiento práctico.

El modelo se distribuye bajo licencia Apache 2.0, requiere `trust_remote_code=True` para cargarse y está pensado para desarrolladores e investigadores que quieran experimentar con arquitecturas GPT-2, fine-tuning o comparaciones de sobreentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 style (transformers causales), 12 capas, 12 cabezas de atencion, dimension de embedding 768 |
| Parametros totales | 163.009.536 (segun model card; 175.592.448 segun safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, al entrenarse con FineWeb) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 original: un transformer causal con 12 capas, 12 cabezas de atencion multi-cabeza, dimension de embedding de 768 y sin sesgo en las proyecciones QKV. No emplea weight tying entre embeddings y la cabeza de salida, y el dropout se fijo a 0.0 durante el entrenamiento.

Fue entrenado con 6.520.381.440 tokens procedentes del dataset `gpjt/fineweb-gpt2-tokens`, una version tokenizada de FineWeb. El entrenamiento se realizo en una maquina local con una RTX 3090, con un batch global de 96, micro-batch de 6, tasa de aprendizaje 0.0014 con scheduler, weight decay 0.01 y gradiente clipping de 3.5. El numero de tokens equivale a aproximadamente 40 veces el numero de parametros, es decir, el doble del optimo Chinchilla (20x), lo que constituye un sobreentrenamiento deliberado para estudiar sus efectos.

## Capacidades

- Generacion de texto causal: produce continuaciones coherentes de secuencias cortas (hasta 1.024 tokens de contexto).
- Fine-tuning: al ser un modelo base, puede ajustarse para tareas especificas con datasets modestos.
- Experimentacion academica: util para estudiar el comportamiento de modelos GPT-2 pequenos, efectos del sobreentrenamiento y comparaciones con pesos originales de OpenAI.
- No soporta tool calling, ni funciones de agente, ni razonamiento multi-paso estructurado.
- No tiene capacidades multimodales (ni vision, ni audio).
- Capacidad multilingue limitada o nula: al entrenarse con FineWeb, el modelo probablemente solo genera texto en ingles, aunque no se especifica oficialmente.

## Casos de uso

- Investigacion sobre sobreentrenamiento: el modelo permite reproducir y analizar los efectos de entrenar con el doble de tokens del optimo Chinchilla, comparando su rendimiento con modelos entrenados con la cantidad recomendada.
- Educacion y aprendizaje de arquitecturas LLM: al ser un GPT-2 small con codigo abierto y documentado, es ideal para estudiar internamente como funciona un transformer causal, atencion multi-cabeza, tokenizacion y generacion autoregresiva.
- Fine-tuning experimental: por su tamano reducido (163M) cabe en una sola GPU consumer y puede ajustarse rapidamente para tareas como clasificacion de texto, generacion de respuestas cortas o analisis de sentimiento en dominios especificos.
- Pruebas de pipelines de inferencia: sirve para validar integraciones con `transformers`, `AutoModelForCausalLM`, o herramientas como vLLM u Ollama, sin necesidad de un modelo grande.
- Comparativa de cuantizacion: aunque no se publican cuantizaciones oficiales, se puede cuantizar con `bitsandbytes` o GPTQ para estudiar perdidas de calidad en modelos pequenos.
- Demo de generacion de texto basica: para prototipos donde no se requiera alta calidad, como generacion de frases cortas en entornos de demostracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor advierte explicitamente que el modelo "no sabe muchos datos y no es muy inteligente", por lo que no se esperan resultados competitivos en tareas estandar como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (163M parametros), aproximadamente 650 MB en FP16 o BF16.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1060, RTX 2060, RTX 3060, etc.). El entrenamiento se realizo en una RTX 3090, pero la inferencia es mucho mas ligera.
- Cabe en GPU consumer de gama baja, incluso en CPU con suficiente RAM.
- Opciones de despliegue: compatible con `transformers` (PyTorch), `vLLM`, `llama.cpp` (si se convierte a GGUF), `Ollama` (mediante importacion manual) y `TGI`. Requiere `trust_remote_code=True` en `transformers`.
- Latencia: en una RTX 3090, la generacion de 100 tokens deberia tardar menos de 1 segundo; en CPU, unos pocos segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gpjt/jax-with-mha-bias-no-dropout-extended | 163M | 1.024 | Apache 2.0 | Sobreentrenado (40x), sin benchmarks publicados |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT | Entrenado con 10x tokens, pesos originales |
| GPT-2 medium (OpenAI) | 355M | 1.024 | MIT | Mas parametros, mejor rendimiento general |
| TinyLlama 1.1B | 1.1B | 2.048 | Apache 2.0 | Mucho mas grande, entrenado con 3T tokens |

No se dispone de datos de benchmarks comparativos, por lo que la tabla se limita a parametros, contexto y licencia. El modelo del autor es comparable a GPT-2 small en tamano pero con un regimen de entrenamiento distinto (sobreentrenamiento).

## Limitaciones y advertencias

- El modelo esta deliberadamente sobreentrenado con 40 tokens por parametro, lo que provoca que memorize en exceso el dataset de entrenamiento y generalice peor a nuevos dominios.
- El autor indica que "no sabe muchos datos y no es muy inteligente"; es un modelo base sin instrucciones ni RLHF, por lo que no sigue indicaciones ni produce respuestas utiles de forma fiable.
- Riesgo elevado de alucinacion: al ser pequeno y sobreentrenado, puede generar texto fluido pero factualmente incorrecto o sin sentido.
- Ventana de contexto limitada a 1.024 tokens, insuficiente para tareas que requieran contexto largo.
- Idiomas no especificados; probablemente solo ingles, y con calidad limitada incluso en ese idioma.
- Requiere `trust_remote_code=True` en `transformers`, lo que implica ejecutar codigo arbitrario del repositorio del autor; debe usarse con precaucion en entornos de produccion.
- No es adecuado para uso comercial serio ni para aplicaciones donde se requiera precision o conocimientos actualizados.
- No se proporcionan cuantizaciones oficiales ni benchmarks, lo que dificulta evaluar su rendimiento objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gpjt/jax-with-mha-bias-no-dropout-extended
- Repositorio de entrenamiento en JAX: https://github.com/gpjt/jax-gpt2-from-scratch
- Repositorio para ejecutar el modelo: https://github.com/gpjt/ddp-base-model-from-scratch
- Blog post sobre sobreentrenamiento: https://www.gilesthomas.com/2026/07/why-do-openai-gpt2-weights-beat-mine-3-overtraining
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/fineweb-gpt2-tokens
- Libro de Sebastian Raschka: https://www.manning.com/books/build-a-large-language-model-from-scratch
