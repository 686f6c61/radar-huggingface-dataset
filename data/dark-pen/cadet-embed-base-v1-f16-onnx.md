# dark-pen/cadet-embed-base-v1-f16-ONNX

## Resumen

cadet-embed-base-v1-f16-ONNX es una version en formato ONNX del modelo de embeddings dark-pen/cadet-embed-base-v1-f16, publicado por el usuario dark-pen en Hugging Face. Se trata de un modelo de extraccion de caracteristicas (pipeline `feature-extraction`), es decir, un encoder disenado para producir representaciones vectoriales de texto en lugar de generar texto. La etiqueta `bert` y la propia model card indican que el modelo subyacente se carga como `BertModel`, por lo que la arquitectura es un transformer encoder-only de la familia BERT.

El artefacto se ha generado de forma automatica mediante el Space de Hugging Face `onnx-community/convert-to-onnx`, y su proposito principal es permitir la ejecucion del modelo en el navegador o en el borde mediante Transformers.js, sin necesidad de un backend Python. Su modelo base inmediato es dark-pen/cadet-embed-base-v1-f16, que a su vez deriva de manveertamber/cadet-embed-base-v1: el autor original cargo ese checkpoint como `BertModel` con Transformers y aplico `torch.nn.Module.half()` para obtener la variante en precision fp16.

La relevancia de esta publicacion es fundamentalmente practica: empaqueta un encoder de embeddings en ONNX con soporte nativo para Transformers.js. Sin embargo, la informacion publicada es muy escasa. No se declara licencia, no se listan idiomas soportados, no hay resultados de benchmarks, el repositorio no tiene descargas ni valoraciones, y no se documentan la longitud de contexto, la dimension del embedding ni el numero exacto de parametros. El repositorio ocupa 0,9 GB. Todo uso en produccion deberia ir precedido de una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT (`BertModel`) |
| Parametros totales | no disponible (la nomenclatura "base" sugiere escala BERT-base, sin confirmar) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el checkpoint base se obtuvo por casteo a fp16 (`half()`), no se documentan niveles int8/int4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (version convertida); el modelo de origen esta en formato PyTorch/Transformers |
| Pipeline | feature-extraction |
| Libreria declarada | transformers.js |
| Tamano del repositorio | 0,9 GB |
| Modelo base | dark-pen/cadet-embed-base-v1-f16 |
| Modelo de origen | manveertamber/cadet-embed-base-v1 |

## Arquitectura y entrenamiento

La unica informacion tecnica aportada por el autor es que el modelo se carga como `BertModel` a traves de Transformers y que se aplico `torch.nn.Module.half()` sobre el modulo PyTorch de nivel superior. Esto confirma una arquitectura transformer con atencion bidireccional (encoder-only), adecuada para tareas de representacion de frases y recuperacion de informacion, y una precision de pesos en fp16. No se especifica el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la dimension del vector de embedding resultante.

Tampoco se documentan los datos de entrenamiento: se desconoce el numero de tokens, la composicion del corpus, si hubo una etapa de contrastive learning, destilacion o ajuste con pares positivos/negativos, y si se aplicaron tecnicas de alineacion como RLHF o DPO (poco habituales en encoders de embeddings, pero no confirmado). El proceso de conversion de formato si esta documentado: la version ONNX se genero automaticamente con el Space `onnx-community/convert-to-onnx`, y los detalles del casteo de precision se registran en el fichero `dtype-conversion.json` del repositorio. No se declara ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, SSM ni hibridaciones).

## Capacidades

- Extraccion de caracteristicas: genera embeddings de texto a partir de entradas de una o varias frases, aptos para similitud coseno y busqueda semantica.
- Integracion con Transformers.js: puede ejecutarse en entornos JavaScript, incluido el navegador, mediante la pipeline `feature-extraction`.
- Inferencia en el borde sin backend Python: al distribuirse en ONNX, es desplegable en runtimes ONNX (ONNX Runtime Web, ONNX Runtime, entre otros).
- Base para tareas derivadas: clasificacion, agrupamiento, recuperacion y reordenacion se pueden construir encima de sus embeddings con cabezas o indices externos.
- Generacion de texto: no disponible (no es un modelo generativo).
- Tool calling / function calling: no disponible (no es una capacidad de un encoder de embeddings).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Busqueda semantica en aplicaciones web: los embeddings del modelo se pueden calcular en el propio navegador con Transformers.js y compararse contra un indice vectorial precalculado, evitando enviar las consultas del usuario a un servidor.
- Recuperacion aumentada (RAG) en el borde: uso como codificador de consultas y de fragmentos de documento en un pipeline de recuperacion; conviene fijar el mismo modelo para indexacion y consulta para que el espacio vectorial sea coherente.
- Deduplicacion y near-duplicate detection: agrupando documentos o registros por similitud coseno de sus embeddings, util en limpieza de corpus y en catalogos de contenido repetido.
- Clasificacion de textos mediante embeddings congelados: entrenar un clasificador ligero (regresion logistica, MLP pequeno) sobre los vectores del modelo reduce coste de entrenamiento y de inferencia frente al ajuste completo.
- Agrupamiento y analisis de topicos: aplicar k-means o HDBSCAN sobre los embeddings para descubrir temas en encuestas, tickets de soporte o resenas, sin etiquetas previas.
- Sistemas de recomendacion por contenido: representar items y perfiles de usuario en el mismo espacio vectorial y ordenar candidatos por cercania.
- Filtrado previo en pipelines de moderacion o cribado: primer nivel de recuperacion de candidatos que despues se revisan con un modelo mas costoso.
- Deteccion de anomalias y derivas: monitorizar la distancia media de nuevos documentos respecto a un centroide de referencia del corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MTEB, MMLU, GLUE, HumanEval ni de ninguna otra suite, y no hay datos de latencia o throughput declarados por el autor.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamano del repositorio (0,9 GB) y de la suposicion, no confirmada, de que el modelo es de escala BERT-base; deben validarse antes de planificar un despliegue.

- VRAM estimada para inferencia: del orden de 0,5-1 GB si los pesos activos estan en fp16 y se asume escala BERT-base; en fp32, aproximadamente el doble. La cifra exacta no esta disponible.
- GPU recomendadas: cualquier GPU con 2 GB o mas de memoria deberia ser suficiente para un encoder de este orden; no hay requisitos declarados por el autor.
- GPU de consumo: si la suposicion de escala es correcta, cabe comodamente en tarjetas de gama media y alta (por ejemplo, series RTX 3060, 4060, 4090) e incluso en CPU para lotes pequenos.
- Ejecucion en cliente: el formato ONNX y la libreria transformers.js apuntan a inferencia en navegador con WebGPU o WebAssembly, sin GPU dedicada.
- Opciones de despliegue: transformers.js (objetivo declarado del artefacto), ONNX Runtime y ONNX Runtime Web; no se documenta compatibilidad con vLLM, TGI o llama.cpp, que estan orientados a modelos generativos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada: el repositorio no incluye benchmarks, no declara licencia ni idiomas, y no se han publicado metricas que permitan situarlo frente a otras alternativas. La categoria natural de comparacion serian otros encoders de embeddings de escala base distribuidos en ONNX para Transformers.js, pero no hay cifras verificables para establecer la comparacion.

| Modelo | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|
| cadet-embed-base-v1-f16-ONNX | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explicita no se puede asumir permiso de uso comercial; es necesario contactar con el autor o abstenerse de usarlo en produccion.
- Procedencia del modelo base: el checkpoint del que deriva es `manveertamber/cadet-embed-base-v1`, del que no se aportan datos de entrenamiento, composicion del dataset ni evaluacion; los sesgos de ese modelo se heredan sin documentar.
- Conversion automatica: el artefacto ONNX se genero con un Space automatizado, sin validacion funcional publicada ni tests de equivalencia frente al modelo original.
- Riesgo de alucinacion: aunque un encoder de embeddings no genera texto y por tanto no "alucina" en sentido estricto, si puede producir representaciones poco fiables para dominios o idiomas alejados de su distribucion de entrenamiento, lo que degrada la recuperacion sin aviso visible.
- Idiomas no declarados: se desconoce si el modelo cubre espanol de forma adecuada; conviene medir su rendimiento en el idioma objetivo antes de desplegarlo.
- Contexto no declarado: al no documentarse la longitud maxima de secuencia, existe riesgo de truncamiento silencioso en entradas largas.
- Sin benchmarks ni adopcion: cero descargas y cero valoraciones implican ausencia de validacion por parte de la comunidad.
- Caducidad de la informacion: las fechas de creacion y actualizacion del repositorio son muy proximas entre si, lo que sugiere una publicacion sin mantenimiento posterior conocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dark-pen/cadet-embed-base-v1-f16-ONNX
- Modelo base declarado: https://huggingface.co/dark-pen/cadet-embed-base-v1-f16
- Modelo de origen: https://huggingface.co/manveertamber/cadet-embed-base-v1
- Revision concreta del modelo de origen citada en la model card: https://huggingface.co/manveertamber/cadet-embed-base-v1/tree/0f8d867073d8fc0c239768a1965938889ed4acb2
- Space de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentacion de la pipeline feature-extraction de Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.FeatureExtractionPipeline
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a directorios de anuncios clasificados sin relacion con el artefacto.
