# gpjt/8xa100m40-lore-2-both-ordinary-init

## Resumen

`gpjt/8xa100m40-lore-2-both-ordinary-init` es un modelo de lenguaje causal entrenado desde cero por Giles Thomas (gpjt), partiendo del codigo de Sebastian Raschka para su libro "Build a Large Language Model (from Scratch)". Se trata de una arquitectura Transformer decoder-only de estilo GPT-2 a la que se le ha anadido una tecnica propia del autor llamada LoRE (Low Rank Embeddings), que sustituye las matrices de embedding y de la cabeza de salida por factorizaciones de bajo rango. La idea fue sugerida por el usuario AndrewThompson1233 en una discusion de HuggingFace. El modelo tiene 111.460.096 parametros segun los pesos en safetensors, aunque la model card declara 98.877.184.

El objetivo del modelo no es competir con LLM modernos, sino servir como banco de pruebas para estudiar el efecto de LoRE sobre el tamano del modelo y su comportamiento. El autor es explicito al respecto: se trata de un modelo pequeno, entrenado con aproximadamente el numero de tokens considerado optimo segun Chinchilla (unas 20 veces el numero de parametros, en concreto 3.260.252.160 tokens), por lo que "no sabe muchos hechos y no es especialmente listo".

Por su tamano (en torno a 100-111 millones de parametros) y su contexto de 1.024 tokens, es un modelo adecuado para experimentacion, docencia y fine-tuning sobre tareas concretas, no para uso en produccion real. Su licencia Apache 2.0 y el hecho de requerir `trust_remote_code=True` son los dos detalles practicos mas relevantes para quien quiera probarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only estilo GPT-2, con LoRE (low-rank) en embeddings y output head |
| Parametros totales | 111.460.096 (segun safetensors); la model card indica 98.877.184 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre FineWeb, predominantemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |

Datos adicionales de configuracion: dimension de embedding 768, 12 cabezas de atencion multi-head (MHA), 12 capas, sin sesgo en QKV (`QKV bias: False`) y sin weight tying (`Weight tying: False`). Ajustes LoRE: activado tanto en token embeddings como en output head, rango 128 y sin inicializacion inteligente (`Smart initialization: False`). Tamano del repositorio: 0,4 GB.

## Arquitectura y entrenamiento

La arquitectura es un Transformer causal clasico de estilo GPT-2, con 12 capas, dimension oculta de 768 y 12 cabezas de atencion, sin sesgo en las proyecciones QKV y sin atado de pesos entre el embedding y la cabeza de salida. La innovacion principal es LoRE: en lugar de mantener una matriz de embedding de vocabulario completa (V x d) y una matriz de salida de dimensiones similares, estas se factorizan en productos de matrices de bajo rango, con rango 128 en este caso. Segun la model card, esto reduce el numero de parametros respecto a una version equivalente sin LoRE, que tendria aproximadamente 163 millones de parametros (se deduce del objetivo de entrenamiento de 20x el numero de parametros). El modelo no usa weight tying, por lo que embedding y cabeza de salida son matrices independientes, ambas con LoRE activado.

El entrenamiento se realizo desde cero sobre el dataset `gpjt/fineweb-gpt2-tokens`, un derivado de FineWeb tokenizado con el tokenizador de GPT-2. Se procesaron 3.260.252.160 tokens, con un micro-batch de 12 y un batch global de 96, sobre 8 GPU A100 de 40 GiB en Lambda. La tasa de aprendizaje fue de 0,0014 con schedule, weight decay de 0,01, gradient clipping de 3,5 y dropout de 0,0. No se menciona ninguna fase de RLHF, DPO ni ajuste por instrucciones: es un modelo base puro.

## Capacidades

- Generacion de texto causal autoregresiva basica, en ingles principalmente.
- Continuacion de prompts cortos con tecnicas de muestreo configurables (temperatura, top-k).
- Fine-tuning sobre tareas concretas: el autor enlaza un notebook de ejemplo (`hf_train.ipynb`) para ajustar el modelo.
- Compatibilidad con `AutoTokenizer`, `AutoModel` y `AutoModelForCausalLM` a traves de `pipeline` de transformers.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; dado el origen de los datos (FineWeb), es previsible un rendimiento pobre fuera del ingles.
- Vision, audio o modo thinking: no soportados.
- Capacidad especial: uso de LoRE para reducir el numero de parametros en embeddings y cabeza de salida.

## Casos de uso

- Docencia y estudio de arquitecturas Transformer: el modelo reproduce fielmente el diseno GPT-2 del libro de Raschka y anade LoRE, por lo que sirve para comparar variantes con y sin factorizacion de bajo rango en un entorno controlado.
- Investigacion sobre LoRE: dado que el autor publica un articulo sobre matrices de vocabulario de bajo rango, este checkpoint es el punto de partida natural para reproducir sus experimentos y medir el impacto del rango (128 en este caso) en calidad y tamano.
- Fine-tuning sobre dominios muy concretos: con 111M de parametros y licencia Apache 2.0, se puede ajustar sobre corpus pequenos (por ejemplo, clasificacion o generacion de texto legal especializado) y desplegarlo en hardware modesto.
- Generacion de texto creativo experimental: el muestreo con temperatura alta (1,4) y top-k 25 en el ejemplo del autor sugiere usos de generacion divergente o brainstorming de baja exigencia factual.
- Prototipado de pipelines de transformers: sirve como modelo de juguete para probar integraciones con `pipeline`, tokenizacion GPT-2 y carga con `trust_remote_code` antes de pasar a modelos mayores.
- Evaluacion de tecnicas de cuantizacion o compresion: al ser un modelo pequeno con pesos en safetensors fp32 (repo de 0,4 GB), es util para medir como afectan distintas cuantizaciones a un modelo de juguete antes de aplicarlas a modelos grandes.
- Entrenamiento de clasificadores con cabeza adicional: se puede congelar el cuerpo y anadir una capa de clasificacion para tareas de NLP sencillas en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 0,45 GB (111M parametros x 4 bytes). El repo ocupa 0,4 GB, coherente con pesos de 32 bits.
- VRAM estimada en fp16/bf16: en torno a 0,22 GB.
- VRAM estimada en int8: en torno a 0,11 GB; en int4, en torno a 0,06 GB (estimaciones genericas, no publicadas por el autor).
- GPU recomendadas: cualquiera con mas de 1 GB de VRAM. Cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4090 o incluso en integradas modestas.
- Tambien puede ejecutarse en CPU sin problemas dada su escala (aproximadamente 0,1-0,4 GB de pesos).
- Opciones de despliegue: transformers (via `pipeline`, `AutoModelForCausalLM` con `trust_remote_code=True`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; su uso requeriria conversion previa y soporte del codigo custom.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| gpjt/8xa100m40-lore-2-both-ordinary-init | 111M (safetensors) | 1.024 | Apache 2.0 | GPT-2 con LoRE, requiere `trust_remote_code` |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT | Referencia historica, con weight tying |
| Modelo base de Raschka (sin LoRE) | ~163M segun la model card | 1.024 | segun repo original | Base de la que deriva este checkpoint |
| SmolLM-135M (HuggingFace) | 135M | 2.048 | Apache 2.0 | Alternativa pequena moderna |
| Qwen2.5-0.5B (Alibaba) | 494M | 32.768 | Apache 2.0 | Alternativa de mayor tamano y contexto |

No hay datos de rendimiento comparativo publicados para este modelo; la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes ni mantiene conversaciones como un asistente.
- Alto riesgo de alucinacion: el propio autor afirma que el modelo "no sabe muchos hechos y no es especialmente listo".
- Capacidad factual y de razonamiento muy limitada: 111M de parametros y 3.260 millones de tokens de entrenamiento.
- Contexto corto (1.024 tokens): insuficiente para documentos largos o dialogos extensos.
- Idiomas: no se declara soporte multilingue y el entrenamiento sobre FineWeb apunta a un rendimiento casi exclusivamente en ingles.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor: hay que revisarlo antes de usarlo en entornos sensibles.
- Licencia Apache 2.0: permite uso comercial, pero el autor desaconseja explicitamente su uso para trabajo serio.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenar sobre FineWeb hereda los sesgos de la web.
- Fecha de creacion posterior a la fecha de conocimiento del asistente (2026): los enlaces al articulo del autor indican "coming soon", por lo que parte de la documentacion puede no estar disponible.
- Repositorio con 0 descargas y 0 likes: sin comunidad ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gpjt/8xa100m40-lore-2-both-ordinary-init
- Repositorio de codigo: https://github.com/gpjt/ddp-base-model-from-scratch
- Notebook de fine-tuning: https://github.com/gpjt/ddp-base-model-from-scratch/blob/main/hf_train.ipynb
- Articulo sobre matrices de vocabulario de bajo rango (anunciado, no publicado en el momento de la consulta): https://www.gilesthomas.com/2026/10/low-rank-vocab-matrices
- Discusion donde se sugirio la idea de LoRE: https://huggingface.co/gpjt/jax-with-mha-bias-fw-fwedu-5050-DEPRECATED/discussions/1
- Dataset de entrenamiento: https://huggingface.co/datasets/gpjt/fineweb-gpt2-tokens
- Libro de referencia (Sebastian Raschka): https://www.manning.com/books/build-a-large-language-model-from-scratch
- Perfil del autor en HuggingFace: https://huggingface.co/gpjt
