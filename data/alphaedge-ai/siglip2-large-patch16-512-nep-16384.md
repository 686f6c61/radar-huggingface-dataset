# alphaedge-ai/siglip2-large-patch16-512-nep-16384

## Resumen

`siglip2-large-patch16-512-nep-16384` es una version "trimmed" (podada) del codificador vision-lenguaje `google/siglip2-large-patch16-512`, publicada por `alphaedge-ai`. El modelo conserva la arquitectura original SigLIP 2 (un par de torres transformer, una de vision con parches de 16x16 a resolucion 512x512 y otra de texto) pero reduce el vocabulario del tokenizador de 256.000 a 16.384 tokens, seleccionados especificamente para nepalí. El resultado es un modelo un 27,81% mas pequeno en parametros (636,9 M frente a 882,3 M) y con una huella de memoria notablemente inferior.

La relevancia de esta ficha es doble. Por un lado, ilustra una tecnica de optimizacion (trimming de vocabulario) que permite adaptar modelos multilingues grandes a un solo idioma reduciendo el coste de despliegue sin reentrenar los pesos. Por otro, es un ejemplo de modelo de nicho: la licencia Apache 2.0 y la reduccion de tamano lo hacen atractivo para despliegues en produccion de clasificacion zero-shot de imagenes en nepalí, pero el recorte de vocabulario degrada severamente su comportamiento en cualquier otro idioma.

El modelo se distribuye en formato safetensors, es compatible con `sentence-transformers` y `transformers`, y esta pensado para tareas de zero-shot image classification y similitud texto-imagen. No es un modelo generativo: no produce texto ni razona, solo genera embeddings alineados de imagen y texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (par de torres transformer: vision + texto) |
| Parametros totales | 636.946.434 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings, no generativo) |
| Tipos de cuantizacion | no disponible (solo safetensors publicado) |
| Idiomas soportados | nepalí (ne) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SigLIP 2 del checkpoint base `google/siglip2-large-patch16-512`: un codificador de vision tipo ViT con parches de 16x16 a resolucion de entrada 512x512 y un codificador de texto transformer, entrenados de forma conjunta con una funcion de perdida sigmoidea sobre pares imagen-texto. SigLIP 2 anade respecto a SigLIP original mejoras en comprension semantica, localizacion y features densas, segun el paper arXiv:2502.14786.

La intervencion de `alphaedge-ai` no es un reentrenamiento, sino un *trimming* del vocabulario. Se usaron 29.721 textos en nepalí del dataset `lbourdois/fineweb-2-trimming` para determinar que tokens del vocabulario original de 256.000 son relevantes para ese idioma; se conservaron 16.384 y se eliminaron el resto. Los pesos de las torres se mantienen (con las filas de embedding correspondientes recortadas), de ahi que el modelo resultante tenga 636,9 M de parametros frente a los 882,3 M del original. No se documenta en la informacion disponible ningun ajuste fino adicional, RLHF ni DPO; es un modelo de embeddings, no generativo, por lo que estas tecnicas no aplican.

## Capacidades

- Generacion de embeddings conjuntos de imagen y texto para similitud y recuperacion.
- Clasificacion zero-shot de imagenes: dado un conjunto de etiquetas en nepalí, devuelve probabilidades por etiqueta.
- Busqueda y recuperacion texto-imagen (image retrieval) mediante similitud coseno en el espacio de embeddings.
- Capacidades densas de localizacion y segmentacion heredadas de SigLIP 2 (según el paper base, aunque no se documenta su verificacion en esta variante trimmed).
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a nepalí; el recorte de vocabulario elimina tokens de otros idiomas y degrada su rendimiento.
- Capacidades especiales: ninguna adicional documentada (sin thinking mode, sin vision generativa, sin audio).

## Casos de uso

- Clasificacion zero-shot de imagenes en nepalí: util para moderacion de contenido o etiquetado automatico de imagenes donde las categorias se definen en nepalí sin necesidad de entrenar un clasificador especifico.
- Busqueda visual en aplicaciones locales: indexar un catalogo de imagenes y recuperarlas mediante consultas de texto en nepalí usando similitud de embeddings.
- Etiquetado de datasets para nepalí: pre-anotar imagenes con etiquetas candidatas en nepalí para acelerar la creacion de datasets supervisados.
- Filtrado de contenido en plataformas nepalíes: clasificar imagenes contra un conjunto de etiquetas de politica (contenido sensible, categorias de producto, etc.) en el idioma local.
- Sistemas de recomendacion visual: calcular similitud entre imagenes y descripciones textuales en nepalí para sugerir productos o contenido.
- Despliegue en entornos con recursos limitados: al ser un 27,81% mas pequeno que el original, permite servir clasificacion zero-shot en hardware mas modesto o con mayor throughput por GPU.
- Investigacion sobre trimming de vocabulario: sirve como referencia reproducible para evaluar el impacto del recorte de vocabulario en modelos vision-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la reduccion de vocabulario (93,60%) y de parametros (27,81%), pero no incluye metricas de calidad (ImageNet zero-shot, retrieval, etc.) ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 2,5 GB para los pesos (636,9 M parametros); en fp16/bf16, alrededor de 1,3 GB. El repo ocupa 2,6 GB, lo que sugiere pesos en fp32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para lotes grandes, A100 o H100 si se busca throughput alto.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 30/40, incluso integradas con suficiente memoria compartida).
- Opciones de despliegue: `transformers` (pipeline de zero-shot-image-classification), `sentence-transformers`, y servidores de embeddings compatibles con la API de sentence-transformers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto / uso |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-large-patch16-512-nep-16384 | 636,9 M | 16.384 | nepalí | apache-2.0 | Embeddings vision-texto |
| google/siglip2-large-patch16-512 | 882,3 M | 256.000 | multilingue | apache-2.0 | Embeddings vision-texto |
| google/siglip2-base-patch16-512 | no disponible en la informacion | no disponible | multilingue | apache-2.0 | Embeddings vision-texto |
| Otros modelos SigLIP 2 trimmed de alphaedge-ai | variable | variable | variable | apache-2.0 | Embeddings vision-texto |

La comparacion directa mas relevante es con el modelo base: la variante trimmed reduce parametros un 27,81% y vocabulario un 93,60%, a cambio de perder cobertura multilingue. Frente a SigLIP 2 base (mas pequeno), el modelo trimmed large conserva la capacidad del large original pero con menos parametros de embedding. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens no usados en nepalí; el modelo "puede no funcionar bien para otros idiomas", segun la propia model card.
- No es un modelo generativo: no produce texto, no razona, no soporta tool calling ni agentes. Su unico uso es generar embeddings y clasificar.
- Riesgo de sesgos heredados del dataset de entrenamiento original de SigLIP 2 (pares imagen-texto web), no documentados en esta variante.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la clasificacion zero-shot puede asignar etiquetas incorrectas con alta confianza si las etiquetas candidatas no cubren bien el dominio.
- La calidad del trimming depende de los 29.721 textos usados para minar el vocabulario; dominios con vocabulario nepalí atipico pueden quedar peor cubiertos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribucion del modelo base y del paper SigLIP 2.
- El modelo tiene muy poca traccion (8 descargas, 0 likes) y no se han publicado benchmarks; para produccion conviene validar su calidad frente al modelo base en el dominio concreto.
- No se documenta soporte de cuantizacion (GGUF, etc.), lo que limita opciones de despliegue en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-large-patch16-512-nep-16384
- Modelo base: https://huggingface.co/google/siglip2-large-patch16-512
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
