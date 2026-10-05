# mlnomad/yat-mmbert-base-embedding-v1

## Resumen

YAT mmBERT base embedding v1 es un encoder de 307,8 millones de parametros orientado a recuperacion de informacion (retrieval) sobre texto y codigo, publicado por el usuario mlnomad. Parte del checkpoint `mlnomad/yat-mmbert-base-contrastive-12000` y se afina sobre tripletas dificiles de MS MARCO, tripletas multilingues de MIRACL y pares consulta-codigo de CodeSearchNet. El resultado es un modelo de embeddings que genera vectores FP32 normalizados en L2 para similitud coseno.

El interes tecnico esta en la arquitectura: emplea atencion YAT bidireccional y una red feed-forward YAT GLU en lugar del bloque transformer estandar, con el sesgo YAT fijado en 1, epsilon en 0,01 y alpha entrenable. No es una comparacion aislada de arquitectura frente a mmBERT, porque hereda el entrenamiento previo de mmBERT y de las etapas YAT anteriores. Los pesos se distribuyen como tensores de estado Flax NNX, no como un `transformers.AutoModel` convencional.

Es un modelo de investigacion con 63 descargas y sin likes en el momento de la ficha, publicado bajo licencia MIT y con articulo de release propio. Su relevancia ahora es que demuestra mejoras grandes frente al checkpoint padre en tareas de recuperacion multilingue y de codigo (por ejemplo, de 8,06 a 46,37 en la media de 18 idiomas de MIRACL), aunque su integracion practica exige tooling especifico en JAX/Flax.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional con atencion YAT y feed-forward YAT GLU |
| Parametros totales | 307.786.240 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens en la evaluacion publicada; entrenamiento con truncado a 128 tokens (consultas) y 256 tokens (documentos). Longitud maxima del encoder no declarada explicitamente |
| Tipos de cuantizacion | No disponible (pesos distribuidos en tensores Flax NNX; la recuperacion usa vectores FP32 normalizados en L2) |
| Idiomas soportados | Multilingue; la evaluacion MIRACL cubre 18 idiomas y el entrenamiento incluye 51 subconjuntos de MIRACL |
| Licencia | MIT |
| Formato de pesos | Flax NNX (safetensors). Existe una conversion separada a PyTorch en `mlnomad/yat-mmbert-base-embedding-v1-pytorch` |

## Arquitectura y entrenamiento

El modelo es un encoder de 307,8 millones de parametros que sustituye los bloques habituales por atencion YAT bidireccional y una red feed-forward YAT GLU. El sesgo YAT se fija en 1, el epsilon en 0,01 y el parametro alpha es entrenable. No se trata de una arquitectura aislada, ya que hereda el entrenamiento previo de mmBERT y de las etapas YAT, y afina el checkpoint `yat-mmbert-base-contrastive-12000`.

El ajuste fino se ejecuto durante 14.000 actualizaciones del optimizador con un lote global de 128 pares consulta-positivo sobre 16 chips TPU v5e Spot (cuatro hosts), lo que suma 1.792.000 presentaciones de pares muestreadas, repeticiones incluidas (89 pares de MS MARCO, 13 de MIRACL y 26 de CodeSearchNet por lote). Los conjuntos de entrenamiento preparados contenian 1.250.000 filas de MS MARCO, 144.512 de MIRACL y 300.000 de CodeSearchNet. El objetivo fue InfoNCE simetrico global en el lote, con negativos minados cuando se aportaban y enmascarado de duplicados. Se uso temperatura 0,05, AdamW con estado del optimizador en FP32, tasa de aprendizaje maxima 3e-5, 200 pasos de calentamiento, decaimiento coseno hasta el 10 % del pico, weight decay 0,01 y recorte de norma global en 1. Los checkpoints se guardaban cada 500 pasos y el checkpoint final de 14.000 pasos se completo con exito.

## Capacidades

- Generacion de embeddings de frases y documentos para recuperacion semantica (retrieval), con pooling de media sobre los estados de los tokens no de relleno, incluidos los tokens especiales.
- Recuperacion de codigo mediante el ajuste con pares consulta-codigo de CodeSearchNet.
- Recuperacion multilingue, con entrenamiento sobre 51 subconjuntos de MIRACL y evaluacion en 18 idiomas con negativos dificiles.
- Recuperacion sobre consultas y documentos de distinta longitud, rellenando con el ID de token 0 y promediando solo los tokens no de relleno.
- Salida de vectores FP32 normalizados en L2 para similitud coseno.
- No se declaran capacidades de generacion de texto, razonamiento, matematicas, vision, audio, tool calling ni agentes; es un modelo exclusivamente de embeddings (encoder).

## Casos de uso

- Busqueda semantica en documentacion tecnica: el modelo vectoriza consultas y fragmentos de documentacion para un motor de busqueda por similitud coseno, apoyandose en el ajuste sobre MS MARCO y en el pooling de media sobre tokens no de relleno.
- Recuperacion de codigo en repositorios grandes: gracias al ajuste con pares de CodeSearchNet, permite indexar funciones o fragmentos de codigo y recuperarlos a partir de una consulta en lenguaje natural (media de 43,45 en el conjunto CoIR de diez tareas).
- Busqueda multilingue en un unico indice: al compartir espacio de embeddings entre 18 idiomas evaluados en MIRACL, un mismo indice puede responder consultas en varios idiomas sin modelos separados por lengua.
- Deduplicacion y agrupacion de documentos: los embeddings normalizados permiten detectar duplicados casi identicos y agrupar textos por similitud, util en tareas de curacion de datasets.
- Sistemas de recomendacion de contenido: vectorizar articulos y perfiles de usuario para recomendar por similitud semantica en lugar de coincidencia de palabras clave.
- Filtrado y clasificacion cero-disparo (zero-shot): usar similitud entre embeddings de texto y etiquetas describidas en lenguaje natural para clasificar sin entrenamiento adicional.
- Recuperacion aumentada (RAG) para asistentes internos: como recuperador de pasajes antes de un generador, siempre que el pipeline acepte el formato Flax NNX o la conversion a PyTorch.

## Benchmarks y rendimiento

Los resultados del `model-index` estan vacios. La model card declara las siguientes metricas, medidas con MTEB 2.21.8 sobre TPU fisica, con el mismo inventario de tareas, revisiones de dataset, tokenizer, configuracion de modelo, limite de 512 tokens, mean pooling y normalizacion FP32 que la evaluacion del checkpoint padre.

| Benchmark | Este fine-tune | Checkpoint padre | Paper de mmBERT-base |
|---|---:|---:|---:|
| English MTEB v2, 41 tareas, media de siete categorias | 52,78 | 45,86 | 53,9 |
| Multilingual MTEB v2, 131 tareas, media de ocho categorias | 48,21 | 46,63 | 54,1 |
| CoIR, media de diez tareas | 43,45 | 21,03 | 42,2 |
| MIRACL con negativos dificiles, media de 18 idiomas | 46,37 | 8,06 | No reportado |

| Tarea completada | Este fine-tune | Checkpoint padre | Cambio |
|---|---:|---:|---:|
| English STSBenchmark | 74,06 | 66,91 | +7,15 |
| English ArguAna | 45,12 | 41,25 | +3,87 |
| English FiQA2018 | 25,32 | 6,01 | +19,30 |
| English SCIDOCS | 10,59 | 4,02 | +6,57 |

La model card aclara que los datos del paper corresponden a Marone et al., tablas 4 a 6, y que las diferencias de datos de ajuste fino y de revisiones de benchmark no fijadas impiden una comparacion aislada de arquitectura. Tambien senala que los datos de codigo de CoIR requieren una auditoria de solapamiento entre entrenamiento y evaluacion. La tabla detallada de tareas queda cortada en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 307,8 millones de parametros, no declarada por el autor): en FP32 unos 1,23 GB solo de pesos; en FP16/BF16 unos 0,62 GB; en INT8 unos 0,31 GB. Hay que sumar memoria para activaciones y lote.
- Entrenamiento original: 16 chips TPU v5e Spot repartidos en cuatro hosts, con estado del optimizador en FP32.
- Cabe en GPU de consumo: por tamano de pesos si, pero la carga depende del tooling. La model card indica que los pesos son tensores Flax NNX y que `transformers.AutoModel` no carga este formato directamente; existe una conversion a PyTorch como artefacto separado.
- Opciones de despliegue declaradas: `flaxchat.public_encoder.load_public_encoder` con JAX y Flax NNX, mas el tokenizer `tokenizer.json`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card menciona diagnosticos de velocidad y de vectores nativos de octubre de 2026 reportados por separado, pero no se aportan cifras en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | English MTEB v2 | Multilingual MTEB v2 | CoIR | MIRACL | Licencia |
|---|---|---:|---:|---:|---:|---:|---|
| YAT mmBERT base embedding v1 | 307,8 M | 512 tokens (evaluacion) | 52,78 | 48,21 | 43,45 | 46,37 | MIT |
| YAT mmBERT base contrastive 12000 (padre) | No disponible | 512 tokens (evaluacion) | 45,86 | 46,63 | 21,03 | 8,06 | No disponible |
| mmBERT-base (paper Marone et al.) | No disponible | No disponible | 53,9 | 54,1 | 42,2 | No reportado | No disponible |

La model card advierte que, por diferencias en los datos de ajuste fino y en las revisiones de benchmark no fijadas, esta tabla no constituye una comparacion aislada de arquitectura.

## Limitaciones y advertencias

- No es una comparacion de arquitectura aislada: hereda el entrenamiento previo de mmBERT y de las etapas YAT, por lo que las mejoras no pueden atribuirse solo al bloque YAT.
- Los datos de codigo de CoIR necesitan una auditoria de solapamiento entre entrenamiento y evaluacion, segun la propia model card.
- El entrenamiento trunco las consultas a 128 tokens y los documentos a 256; las entradas mas largas requieren una evaluacion de calidad aparte. La evaluacion se hizo con limite de 512 tokens.
- El formato de pesos es Flax NNX y no se carga con `transformers.AutoModel`; hace falta FlaxChat o la conversion a PyTorch, que es un artefacto separado con una comprobacion estrecha de conversion fisica a TPU y cuyos resultados MTEB no se volvieron a medir en PyTorch.
- No se declaran idiomas concretos mas alla de "multilingue" y de los 18 idiomas evaluados en MIRACL; no hay lista explicita de cobertura.
- No se declaran sesgos conocidos ni tasas de alucinacion (es un encoder, no un generador de texto).
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento (MS MARCO, MIRACL, CodeSearchNet) antes de un despliegue en produccion.
- Traccion muy baja (63 descargas, 0 likes) y ausencia de resultados en el `model-index`; el soporte de la comunidad es limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlnomad/yat-mmbert-base-embedding-v1
- Articulo de release: https://huggingface.co/spaces/mlnomad/yat-mmbert-embedding-blog
- Conversion a PyTorch: https://huggingface.co/mlnomad/yat-mmbert-base-embedding-v1-pytorch
- Checkpoint padre: https://huggingface.co/mlnomad/yat-mmbert-base-contrastive-12000
- Repositorio FlaxChat: https://github.com/mlnomadpy/flaxchat
- Paper de mmBERT (Marone et al.): https://arxiv.org/html/2509.06888v1
- Dataset MS MARCO hard triplets: https://huggingface.co/datasets/sentence-transformers/msmarco-co-condenser-margin-mse-sym-mnrl-mean-v1/tree/84ed2d35626f617d890bd493b4d6db69a741e0e2
- Dataset MIRACL multilingual triplets: https://huggingface.co/datasets/nlpai-lab/miracl-multilingual-triplets/tree/71bc9f8e7d86b55203ed3104362b0661789a6c31
- Dataset CodeSearchNet: https://huggingface.co/datasets/sentence-transformers/codesearchnet/tree/079a958b01dc87cf07b66a68414c4b4196d889cc
