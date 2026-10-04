# gpjt/8xa100m40-lore-11-output-only-corrected-smart-init

# 8xa100m40-lore-11-output-only-corrected-smart-init: modelo de lenguaje causal con cabecera de salida de bajo rango

## Resumen

`gpjt/8xa100m40-lore-11-output-only-corrected-smart-init` es un modelo de lenguaje causal entrenado desde cero por Giles Thomas (usuario `gpjt`), partiendo del codigo de Sebastian Raschka del libro *Build a Large Language Model (from Scratch)*. Se trata de un transformer de estilo GPT-2 con 12 capas, dimension de embedding de 768 y 12 cabezas de atencion multi-cabezal, con una longitud de contexto de 1.024 tokens. Su rasgo distintivo es el uso de LoRE (Low Rank Embeddings), una tecnica propuesta por `AndrewThompson1233` que sustituye la matriz de proyeccion de la cabecera de salida por un producto de dos matrices de bajo rango.

La particularidad de esta variante concreta es que LoRE solo esta activado en la cabecera de salida (no en los embeddings de entrada), con un rango de 128 y una inicializacion "corrected". El objetivo del experimento es comprobar si es posible reducir de forma sustancial el numero de parametros dedicados al vocabulario sin degradar la calidad del modelo, aprovechando que la matriz de salida no esta atada a los embeddings (`weight tying: False`).

Se trata de un modelo de investigacion, no de un modelo de produccion: fue entrenado con aproximadamente 3.260 millones de tokens (unas 20 veces el numero de parametros, la cifra "Chinchilla-optimal" segun el autor) sobre el dataset `gpjt/fineweb-gpt2-tokens`, con 0 descargas y 0 likes en HuggingFace en el momento de la consulta. El propio autor advierte que el modelo es "tanto tonto como ignorante" y desaconseja su uso para trabajo serio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de estilo GPT-2 (attention multi-cabeza, 12 capas) |
| Parametros totales | 143.526.272 segun los safetensors; la model card declara 130.943.360 y el texto menciona 163M de forma generica (hay discrepancia entre fuentes) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones publicadas; el repo solo contiene safetensors en precision completa) |
| Idiomas soportados | no disponible (no se declaran idiomas; el dataset FineWeb es predominantemente ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con codigo personalizado (`custom_code`, requiere `trust_remote_code=True`) |

Parametros de configuracion adicionales: dimension de embedding 768, 12 cabezas MHA, 12 capas, `QKV bias` desactivado, `weight tying` desactivado. Configuracion LoRE: embeddings de token con LoRE desactivado, cabecera de salida con LoRE activado, rango 128, inicializacion "corrected".

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 clasica tal como se implementa en el libro de Raschka: bloques transformer con atencion multi-cabeza causal, normalizacion y MLP feed-forward, apilados en 12 capas con dimension oculta de 768. La innovacion respecto al GPT-2 canonico es la capa de salida de bajo rango (LoRE): en lugar de una matriz de proyeccion densa de `vocab_size x d_model`, se factoriza en dos matrices cuyo producto reconstruye la proyeccion, con rango 128. En este modelo el ahorro se aplica unicamente a la cabecera de salida, mientras que los embeddings de entrada permanecen densos. La model card no detalla como afecta la inicializacion "corrected" al entrenamiento mas alla de su nombre, y remite al blog del autor para la explicacion completa.

El entrenamiento se realizo desde cero (sin fine-tuning sobre pesos preentrenados) sobre 3.260.252.160 tokens del dataset `gpjt/fineweb-gpt2-tokens`, una tokenizacion GPT-2 de FineWeb. La infraestructura empleada fue un nodo de 8 GPU A100 de 40 GiB en Lambda. Los hiperparametros documentados son: micro-batch de 12, batch global de 96, dropout 0.0, gradient clipping de 3.5, learning rate de 0.0014 con scheduler activado y weight decay de 0.01. No se menciona ninguna fase de RLHF, DPO ni ajuste por preferencias; se trata por tanto de un modelo base, no de un modelo alineado por instrucciones.

## Capacidades

- Generacion de texto autoregresiva para continuar secuencias de texto en ingles, con decodificacion por muestreo (temperatura, `top_k`) segun el ejemplo de la model card.
- Modelo base sin ajuste por instrucciones: no esta entrenado para seguir ordenes, responder preguntas ni mantener formato conversacional de forma fiable.
- Compatibilidad con la API estandar de `transformers`: soporta `AutoTokenizer`, `AutoModel` y `AutoModelForCausalLM` (con `trust_remote_code=True`).
- Posibilidad de fine-tuning posterior, con un notebook de ejemplo publicado en el repositorio del autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no declaradas; el dataset de entrenamiento es predominantemente ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre factorizacion de bajo rango en cabeceras de vocabulario: el modelo sirve como referencia empirica para estudiar si reducir el rango de la matriz de salida degrada la perplejidad o la coherencia del texto generado en comparacion con una cabecera densa del mismo tamano.
- Reproduccion de experimentos de entrenamiento desde cero: con la configuracion documentada (8xA100, batch, LR, tokens) es posible reproducir o escalar el entrenamiento desde el repositorio `ddp-base-model-from-scratch`.
- Prototipado y ensenanza de arquitecturas transformer: su tamano reducido (repo de 0,6 GB) permite cargarlo en portatiles y usarlo en material docente para ilustrar el funcionamiento interno de un LLM causal.
- Punto de partida para fine-tuning en dominios muy acotados: al ser Apache 2.0 y estar disponible en `transformers`, puede ajustarse en un corpus pequeno (por ejemplo, textos legales o medicos especializados) para tareas de continuacion de texto.
- Pruebas de integracion de `transformers` con codigo personalizado: util para validar pipelines que necesitan `trust_remote_code=True` y modelos con clases propias.
- Comparativa de inicializaciones de matrices de bajo rango: la variante "output-only corrected" frente a otras combinaciones (LoRE en embeddings, sin LoRE, distintos rangos) permite aislar el efecto de cada decision de diseno.
- Generacion de texto creativo a pequena escala en entornos sin GPU dedicada, asumiendo la baja calidad e incoherencia inherente a un modelo de 130-143M de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica cuantitativa, y tampoco ofrece comparaciones numericas con modelos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision completa (fp32) unos 0,55 GB solo para pesos, mas overhead de activaciones y cache KV; en fp16/bf16 unos 0,29 GB para pesos. El repo ocupa 0,6 GB, por lo que cabe en cualquier GPU consumer con al menos 2 GB de VRAM efectivos.
- GPU recomendadas para inferencia: cualquier GPU consumer moderna (GTX 1060 6 GB, RTX 3060, RTX 4090) es mas que suficiente. El entrenamiento original requirio 8xA100 de 40 GiB, pero solo para el preentrenamiento completo.
- Compatibilidad con GPU consumer: si, cabe holgadamente en cualquier GPU con 4 GB o mas, e incluso puede ejecutarse en CPU sin problemas.
- Opciones de despliegue: `transformers` (via `pipeline`, `AutoModelForCausalLM`, con `trust_remote_code=True`). No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni GGUF; cualquier conversion a estos formatos requeriria trabajo adicional no cubierto por la model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 8xa100m40-lore-11-output-only-corrected-smart-init | 130,9M declarados / 143,5M en safetensors | 1.024 | GPT-2 con cabecera LoRE | Apache 2.0 | HuggingFace, `transformers` con `trust_remote_code` |
| GPT-2 124M (OpenAI) | 124M | 1.024 | GPT-2 densa, weight tying activado | licencia MIT modificada | HuggingFace, ampliamente soportado |
| GPT-2 355M (OpenAI) | 355M | 1.024 | GPT-2 densa, 24 capas, dim 1.024 | licencia MIT modificada | HuggingFace, ampliamente soportado |
| Pythia-160M (EleutherAI) | 160M | 2.048 | Transformer causal decoder-only | Apache 2.0 | HuggingFace, usado en investigacion de interpretabilidad |

La diferencia principal frente a GPT-2 124M es la factorizacion de la cabecera de salida: mientras GPT-2 ata la matriz de embeddings y la de salida, este modelo las mantiene separadas y reduce la de salida a rango 128. La comparacion de rendimiento con estos modelos no puede establecerse porque no hay benchmarks publicados para el modelo de `gpjt`.

## Limitaciones y advertencias

- El propio autor advierte que el modelo es "tanto tonto como ignorante": con 130-143M de parametros y solo 3.260 millones de tokens de entrenamiento, no retiene hechos y su capacidad de razonamiento es muy limitada.
- Es un modelo base sin alineacion por instrucciones: no responde adecuadamente a prompts conversacionales ni a tareas de instruccion directa.
- Riesgo elevado de alucinacion y de generar texto incoherente o factualmente incorrecto, especialmente en contextos largos.
- Contexto muy corto (1.024 tokens), lo que impide tareas que requieran mantener informacion a lo largo de documentos extensos.
- Idiomas soportados no declarados; el dataset FineWeb es predominantemente ingles, por lo que el rendimiento en castellano es muy probablemente pobre y no esta documentado.
- No hay datos de sesgos publicados; al entrenarse sobre rastreo web sin filtrado especifico, es previsible que reproduzca sesgos presentes en FineWeb.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, pero al tratarse de un modelo de investigacion de baja calidad, su utilidad comercial practica es muy reducida.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor al cargar el modelo; conviene revisar dicho codigo antes de usarlo en produccion.
- Existe una discrepancia entre el numero de parametros declarado en la model card (130.943.360) y el que figura en los safetensors (143.526.272), lo que puede afectar a estimaciones de memoria y a comparaciones.
- Vocabulario GPT-2 clasico (tokenizacion original), con un tokenizador menos eficiente que los actuales para idiomas distintos del ingles.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion comunitaria ni casos de uso reportados por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gpjt/8xa100m40-lore-11-output-only-corrected-smart-init
- Repositorio del codigo de entrenamiento: https://github.com/gpjt/ddp-base-model-from-scratch
- Notebook de fine-tuning de ejemplo: https://github.com/gpjt/ddp-base-model-from-scratch/blob/main/hf_train.ipynb
- Blog del autor sobre matrices de vocabulario de bajo rango: https://www.gilesthomas.com/2026/10/low-rank-vocab-matrices
- Discusion donde se sugirio la idea de LoRE: https://huggingface.co/gpjt/jax-with-mha-bias-fw-fwedu-5050-DEPRECATED/discussions/1
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/fineweb-gpt2-tokens
- Libro de Sebastian Raschka de referencia: https://www.manning.com/books/build-a-large-language-model-from-scratch
