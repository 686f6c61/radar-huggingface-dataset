# artii-ml/dl2-hw2-ner

## Resumen

artii-ml/dl2-hw2-ner es un modelo de clasificacion de tokens (token classification) publicado en Hugging Face Hub por el usuario artii-ml. El repositorio esta etiquetado con la arquitectura `bert` y el pipeline `token-classification`, por lo que se trata de un codificador transformer bidireccional ajustado para tareas de etiquetado a nivel de token, tipicamente reconocimiento de entidades nombradas (NER). El checkpoint ocupa 0,1 GB y contiene 33.215.625 parametros en formato safetensors, un tamano propio de un encoder compacto, inferior al de BERT-base (110 millones de parametros).

La model card publicada es la plantilla autogenerada por Hugging Face y no ha sido cumplimentada: no documenta el desarrollador real, el conjunto de datos de entrenamiento, los hiperparametros, el conjunto de etiquetas ni los resultados de evaluacion. Tampoco se declara licencia ni idiomas soportados. El modelo acumula 0 descargas y 0 likes, por lo que no existe validacion alguna por parte de la comunidad.

Por el nombre del repositorio (`dl2-hw2-ner`) y la ausencia total de documentacion, todo apunta a un ejercicio academico o a una prueba tecnica de fine-tuning, mas que a un modelo destinado a produccion. Su relevancia practica actual es, por tanto, limitada: puede servir como referencia de implementacion o como punto de partida reproducible, pero no como componente fiable en un sistema real sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer bidireccional, segun la etiqueta del repositorio) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | token-classification |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-11 |
| Fecha de actualizacion | 2026-10-11 |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible es la etiqueta `bert` del repositorio. Esto implica un encoder transformer con atencion propia bidireccional y una cabeza de clasificacion por token, que produce una etiqueta para cada posicion de la secuencia de entrada. El recuento de 33,2 millones de parametros es coherente con un BERT de dimension reducida (inferior a BERT-base, que tiene 110 millones), aunque no se especifica la configuracion exacta de capas, dimension oculta ni cabezas de atencion.

No hay ningun dato sobre el procedimiento de entrenamiento: se desconocen el numero de tokens, la composicion del corpus, el esquema de etiquetado (por ejemplo BIO o BILUO), la existencia de ajuste fino supervisado a partir de un checkpoint preentrenado, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (habituales en modelos generativos, no en encoders de clasificacion). La etiqueta `arxiv:1910.09700` que aparece en el repositorio corresponde al articulo de Lacoste et al. (2019) sobre estimacion de emisiones de carbono, incluido por defecto en la plantilla de model card de Hugging Face; no guarda relacion con la metodologia de entrenamiento del modelo.

## Capacidades

- Etiquetado de secuencias (sequence labeling): asigna una etiqueta a cada token de la entrada, que es la base de tareas de extraccion de informacion estructurada.
- Reconocimiento de entidades nombradas (NER): el pipeline declarado corresponde a esta tarea, aunque el conjunto concreto de etiquetas no esta documentado.
- Extraccion de entidades en texto plano, siempre que las categorias de entidad coincidan con las del ajuste fino original (no verificable con la informacion disponible).
- No es un modelo generativo: no produce texto libre, resumentes, traducciones ni respuestas conversacionales.
- Soporte de tool calling / function calling: no disponible (no es una capacidad propia de un clasificador de tokens).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

Todos los casos siguientes presuponen que el modelo realmente realiza NER y que el conjunto de etiquetas encaja con la tarea descrita; esto no esta verificado en la informacion disponible y requeriria una evaluacion previa del checkpoint.

- Deteccion y anonimizacion de datos personales: aplicar el modelo para localizar menciones de personas, organizaciones o ubicaciones en documentos internos y sustituirlas por marcadores antes de compartir el texto con terceros o almacenarlo.
- Analisis de contratos y documentacion legal: extraer las partes firmantes, las jurisdicciones y las entidades mencionadas para alimentar un indice estructurado que acelere la revision documental.
- Analisis de curriculos: identificar nombres, empresas, titulaciones y localizaciones en CV en texto plano para poblar una base de datos de candidatos con campos normalizados.
- Monitorizacion de reputacion de marca: procesar menciones en redes sociales o prensa y etiquetar las entidades citadas para medir con que empresas, productos o personas se asocia una marca.
- Enrutamiento de tickets de soporte: extraer producto, empresa y ubicacion de la descripcion del problema y usarlos como variables de clasificacion para dirigir el ticket al equipo correspondiente.
- Preprocesado para pipelines RAG: anotar entidades en el corpus antes de indexarlo, de forma que las busquedas puedan filtrarse por entidad ademas de por similitud vectorial.
- Investigacion academica: usar el checkpoint como linea base reproducible en experimentos de etiquetado de secuencias y comparar arquitecturas compactas frente a encoders mayores.
- Enriquecimiento de registros estructurados: convertir texto no estructurado (notas, correos, informes) en campos de entidad que alimenten un data warehouse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de memoria que siguen son estimaciones derivadas del recuento de parametros (33.215.625), no datos publicados por el autor.

- VRAM en fp32: aproximadamente 133 MB solo para los pesos (33.215.625 x 4 bytes).
- VRAM en fp16/bf16: aproximadamente 66 MB.
- VRAM en int8: aproximadamente 33 MB.
- Cabe sin problema en cualquier GPU de consumo (RTX 3060, RTX 4090, GTX 1650, incluso iGPU con memoria compartida) y tambien en CPU.
- Inferencia en CPU: viable para uso interactivo; un encoder de este tamano procesa secuencias cortas en el orden de milisegundos a decenas de milisegundos por lote, aunque no se dispone de mediciones reales.
- Opciones de despliegue recomendadas: pipeline de `transformers`, exportacion a ONNX Runtime o TorchScript para reducir latencia, y servidores de inferencia para modelos de clasificacion (Triton, FastAPI, TorchServe).
- vLLM, TGI y llama.cpp no son las herramientas habituales para un encoder de clasificacion de tokens; si se usan, debe verificarse el soporte del pipeline concreto.
- Se desconoce el throughput real y el consumo de memoria en produccion, ya que no hay datos publicados.

## Comparativa con modelos similares

La comparativa se establece con encoders genericos que suelen servir de base para ajustes de NER, ya que no se conocen checkpoints de NER directamente comparables con este. Los valores de los modelos de referencia son los habitualmente publicados por sus autores.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| artii-ml/dl2-hw2-ner | 33,2 M | no disponible | token-classification (NER) | no disponible | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 tokens | encoder generico (requiere ajuste fino para NER) | Apache-2.0 | Hugging Face |
| distilbert/distilbert-base-uncased | 66 M | 512 tokens | encoder generico (requiere ajuste fino para NER) | Apache-2.0 | Hugging Face |
| FacebookAI/roberta-base | 125 M | 512 tokens | encoder generico (requiere ajuste fino para NER) | MIT | Hugging Face |

No es posible comparar rendimiento: este checkpoint no publica metricas de F1, precision o recall, y los modelos de referencia de la tabla no son checkpoints de NER ya ajustados.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial; habria que contactar con el autor antes de integrarlo en un producto.
- Model card vacia: no hay informacion sobre datos de entrenamiento, sesgos, composicion del corpus ni proceso de anotacion, lo que impide evaluar su calidad de forma documental.
- Conjunto de etiquetas desconocido: se ignora que entidades reconoce el modelo, por lo que su utilidad practica solo puede determinarse probandolo.
- Riesgo de errores de etiquetado: aunque no genera texto y por tanto no "alucina" en el sentido generativo, puede producir falsos positivos y falsos negativos en la deteccion de entidades.
- Sesgos potenciales desconocidos: al no documentarse los datos de entrenamiento, no puede descartarse sesgo de genero, nacionalidad, etnia o dominio.
- Cobertura linguistica no declarada: no se especifica en que idiomas funciona ni con que calidad.
- Sin validacion de la comunidad: 0 descargas y 0 likes implican que el checkpoint no ha sido probado ni contrastado por terceros.
- Posible sobreajuste al dataset de origen: el nombre del repositorio sugiere un trabajo academico, contexto en el que es habitual entrenar con un unico corpus pequeno y obtener una generalizacion limitada.
- Metadatos atipicos: las fechas de creacion y actualizacion (2026-10-11) no permiten situar el modelo con precision en una cronologia de publicaciones.
- Longitud de contexto no confirmada: aunque los encoders BERT convencionales suelen limitarse a 512 tokens, no hay confirmacion para este checkpoint y secuencias mas largas requeririan truncado o segmentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/artii-ml/dl2-hw2-ner
- Articulo referenciado en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de carbono; incluido por la plantilla de model card, no relacionado con el modelo): https://arxiv.org/abs/1910.09700
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada.
