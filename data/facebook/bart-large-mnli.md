# facebook/bart-large-mnli

## Resumen

facebook/bart-large-mnli es un modelo de clasificacion de texto zero-shot desarrollado por Meta (Facebook) que surge de ajustar el checkpoint de BART-large sobre el dataset MultiNLI (MNLI). En lugar de entrenar un clasificador para etiquetas fijas, el modelo reformula la clasificacion como un problema de inferencia de lenguaje natural (NLI): el texto a clasificar se presenta como premisa y cada etiqueta candidata se convierte en una hipotesis del tipo "This text is about politics". Las probabilidades de entailment y contradiction se convierten en probabilidades de clase, lo que permite clasificar textos en categorias arbitrarias sin necesidad de entrenamiento adicional.

Con 407 millones de parametros y una arquitectura secuencia a secuencia (encoder-decoder), este modelo se ha convertido en un referente dentro del ecosistema de Hugging Face, con mas de 3,2 millones de descargas. Su relevancia actual radica en que sigue siendo una opcion solida y ligera para tareas de clasificacion zero-shot en produccion, especialmente cuando se necesita flexibilidad para cambiar de etiquetas sin reentrenar. El metodo fue propuesto por Yin et al. (2019) y demostro ser sorprendentemente efectivo con modelos preentrenados grandes como BART y RoBERTa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BART-large (Transformer encoder-decoder, seq2seq) |
| Parametros totales | 407.344.133 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (posiciones maximas de BART) |
| Tipos de cuantizacion | No disponible (repo oficial con safetensors en precision completa) |
| Idiomas soportados | Principalmente ingles (entrenado con MNLI, dataset en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BART-large es un modelo transformer secuencia a secuencia con arquitectura encoder-decoder, preentrenado mediante denoising: se corrompen textos de entrada con ruido (eliminacion de tokens, permutacion de frases, etc.) y el modelo debe reconstruir el texto original. El checkpoint base fue entrenado sobre una combinacion de libros y Wikipedia en ingles, y posteriormente se ajusto (fine-tuning) sobre el dataset MultiNLI, que contiene pares premisa-hipotesis etiquetados como entailment, neutral o contradiction.

La innovacion clave no esta en la arquitectura, sino en el metodo de uso propuesto por Yin et al. (2019): al plantear la clasificacion como NLI, el modelo puede generalizar a etiquetas que nunca vio durante el entrenamiento. El proceso consiste en construir una hipotesis a partir de cada etiqueta candidata, pasar el par (premisa, hipotesis) por el modelo, y tomar la probabilidad de entailment como la probabilidad de que la etiqueta sea correcta. El modelo soporta tanto clasificacion de una sola etiqueta como clasificacion multi-etiqueta (con `multi_label=True`), donde cada clase se evalua de forma independiente.

## Capacidades

- Clasificacion de texto zero-shot: clasifica cualquier texto en etiquetas arbitrarias sin entrenamiento previo, simplemente definiendo las etiquetas candidatas en tiempo de inferencia.
- Clasificacion multi-etiqueta: permite asignar varias etiquetas a un mismo texto calculando cada clase de forma independiente.
- Razonamiento de inferencia natural (NLI): capaz de determinar si una hipotesis se deduce, contradice o es neutral respecto a una premisa.
- Generacion de texto: al estar basado en BART, conserva capacidades de generacion secuencia a secuencia, aunque su uso principal es la clasificacion.
- Integracion con el pipeline `zero-shot-classification` de Hugging Face Transformers, lo que simplifica su despliegue en pocas lineas de codigo.
- Soporte multiplataforma: disponible en PyTorch, JAX y Rust, con pesos en safetensors.

## Casos de uso

- Moderacion de contenido: clasificar comentarios de usuarios en categorias como "spam", "discurso de odio" o "contenido ofensivo" sin necesidad de entrenar un clasificador especifico, adaptando las etiquetas sobre la marcha segun las politicas de la plataforma.
- Enrutamiento de tickets de soporte: asignar automaticamente consultas de clientes a departamentos (facturacion, tecnico, reclamaciones) usando etiquetas definidas por el equipo, con la flexibilidad de anadir nuevas categorias sin reentrenar.
- Analisis de sentimiento en redes sociales: clasificar opiniones en positivas, negativas o neutras sobre productos o marcas, pudiendo ajustar el vocabulario de etiquetas segun el contexto (por ejemplo, "entusiasmo", "frustracion", "indiferencia").
- Filtrado de noticias por tematica: categorizar articulos de prensa en politica, economia, deportes, ciencia, etc., para alimentar agregadores de noticias o sistemas de recomendacion.
- Clasificacion de documentos legales o administrativos: organizar contratos, facturas o expedientes en tipos predefinidos, aprovechando que el modelo puede manejar textos largos de hasta 1024 tokens.
- Etiquetado de datos para entrenamiento posterior: generar etiquetas preliminares sobre datasets no anotados para acelerar el etiquetado manual o servir como pseudo-etiquetas en pipelines de aprendizaje semi-supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card oficial no incluye metricas de evaluacion (como exactitud en MNLI, MMLU u otros) ni comparaciones cuantitativas con modelos alternativos. El unico dato de rendimiento disponible es el ejemplo de la model card, donde el modelo asigna una probabilidad de 0,9939 a la etiqueta correcta en una clasificacion de ejemplo, pero esto no constituye un benchmark formal.

## Requisitos de hardware

- VRAM estimada para inferencia: con 407 millones de parametros, el modelo ocupa aproximadamente 1,6 GB en FP32 y 0,8 GB en FP16, por lo que cabe en practicamente cualquier GPU moderna con 4 GB o mas de VRAM.
- GPUs recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia. Para despliegues de alto throughput, una A10, A100 o similar ofrece mejor latencia.
- Compatibilidad con GPU consumer: si, el modelo cabe en GPUs de gama de entrada y media sin problemas.
- Opciones de despliegue: se puede servir con el pipeline `zero-shot-classification` de Transformers, o mediante servidores de inferencia como vLLM, Text Generation Inference (TGI) o Hugging Face Inference Endpoints. Tambien es compatible con SageMaker y Azure (segun los tags del repositorio).
- Latencia y throughput: no se han publicado mediciones oficiales. En una GPU consumer moderna, la inferencia de un texto corto suele completarse en decenas de milisegundos, pero el valor exacto depende del hardware y de la longitud del texto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| facebook/bart-large-mnli | BART-large (seq2seq) | 407 M | 1024 | MIT | NLI zero-shot |
| roberta-large-mnli | RoBERTa-large (encoder) | 355 M | 512 | MIT | NLI zero-shot |
| typeform/distilbert-base-uncased-mnli | DistilBERT (encoder) | 66 M | 512 | Apache-2.0 | NLI zero-shot |

RoBERTa-large-mnli es la alternativa mas directa: misma metodologia NLI pero con arquitectura solo-encoder, lo que la hace mas rapida en inferencia para clasificacion pura, aunque sin capacidades de generacion. DistilBERT-mnli es una opcion mucho mas ligera (66 M de parametros) adecuada para entornos con recursos limitados, a costa de menor precision. BART-large-mnli destaca por su mayor contexto (1024 tokens) y por conservar capacidades de generacion, aunque es el mas pesado de los tres.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado principalmente con datos en ingles (MNLI, libros y Wikipedia en ingles), puede presentar sesgos culturales y linguisticos propios de ese corpus, y su rendimiento en otros idiomas es significativamente inferior.
- Riesgo de alucinacion: aunque su uso principal es clasificacion, al ser un modelo generativo puede producir salidas inconsistentes si se usa fuera del flujo de clasificacion NLI.
- Limitaciones de contexto: la ventana de 1024 tokens limita la clasificacion de documentos largos; textos superiores deben truncarse o dividirse, lo que puede perder informacion relevante.
- Dependencia de la formulacion de hipotesis: el rendimiento depende de como se construyan las hipotesis a partir de las etiquetas; etiquetas ambiguas o mal formuladas degradan la precision.
- Rendimiento en idiomas no ingleses: no se ha evaluado formalmente y se espera una caida notable de precision fuera del ingles.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo puede heredar sesgos de los datos de entrenamiento que deben auditarse antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/facebook/bart-large-mnli
- Pagina del modelo base BART-large: https://huggingface.co/facebook/bart-large
- Paper de BART (Lewis et al., 2019): https://arxiv.org/abs/1910.13461
- Paper del metodo NLI zero-shot (Yin et al., 2019): https://arxiv.org/abs/1909.00161
- Implementacion en fairseq: https://github.com/pytorch/fairseq/tree/master/fairseq/models/bart
- Blog introductorio sobre zero-shot learning: https://joeddav.github.io/blog/2020/05/29/ZSL.html
- Dataset MultiNLI: https://huggingface.co/datasets/multi_nli
