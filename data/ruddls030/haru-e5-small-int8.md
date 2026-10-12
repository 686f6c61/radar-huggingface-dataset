# ruddls030/haru-e5-small-int8

## Resumen

haru-e5-small-int8 es un modelo de embeddings de frases (feature-extraction) desarrollado por el usuario ruddls030 para HaruPet, una mascota de escritorio cuyo modo de conversación funciona únicamente en CPU. Se trata de un ajuste fino de intfloat/multilingual-e5-small sobre pares pregunta-respuesta del dominio conversacional de HaruPet, entrenado con MultipleNegativesRankingLoss durante 8 épocas. El propósito no es generar texto, sino seleccionar, por similitud vectorial, cuál de un conjunto cerrado de 3.575 preguntas públicas se parece más a lo que ha escrito la persona usuaria y devolver la respuesta asociada al personaje activo.

El modelo produce vectores de 384 dimensiones con mean pooling y normalización L2, y sigue la convención de prefijos de la familia E5 (`query: ` para la consulta y `passage: ` para el documento o recuerdo). Se distribuye en formato ONNX en dos variantes: fp32 (470 MB) e int8 con cuantización dinámica por canal (118 MB), esta última es la que consume la aplicación a través de transformers.js y onnxruntime-web sobre WebAssembly.

Su relevancia actual es acotada pero clara: demuestra un patrón de despliegue de recuperación semántica en el navegador o en el escritorio sin GPU ni backend, con latencias de decenas de milisegundos en CPU. Frente a su modelo base, mejora de forma notable la recuperación en el dominio concreto de HaruPet (R@1 de 0,413 a 0,593 en preguntas reales), aunque pierde algo de rendimiento en un benchmark general en coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT, heredada de intfloat/multilingual-e5-small |
| Parametros totales | 118 M (heredados del modelo base; la model card del ajuste no lo explicita) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (heredada del modelo base; no se indica otro valor en la model card) |
| Tipos de cuantizacion | int8 dinamica por canal (uint8) en `onnx/model_quantized.onnx` (118 MB); fp32 en `onnx/model.onnx` (470 MB) |
| Idiomas soportados | Coreano (ko) declarado; el modelo base es multilingue, pero el ajuste esta especializado en coreano |
| Licencia | MIT |
| Formato de pesos | ONNX (fp32 e int8). No se publican safetensors ni GGUF |
| Dimension de embedding | 384 |
| Pooling | Mean pooling seguido de normalizacion L2 |
| Prefijos de entrada | `query: ` para la consulta, `passage: ` para el documento o recuerdo |
| Pipeline | feature-extraction (sentence-similarity) |
| Libreria declarada | transformers.js |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base intfloat/multilingual-e5-small: un encoder transformer de tipo BERT con embeddings de 384 dimensiones y una ventana de 512 tokens. El ajuste no introduce cambios estructurales; se reutilizan los pesos del base y se especializa el espacio de representacion mediante entrenamiento contrastivo sobre pares pregunta-respuesta del dominio HaruPet. La función de perdida empleada es MultipleNegativesRankingLoss (el esquema clasico de negativos en lote usado por sentence-transformers para recuperacion), durante 8 epocas.

El autor no publica el conjunto de entrenamiento, por lo que no es posible auditar su composicion, su tamano, su balance de temas ni si hubo etapas adicionales de RLHF o DPO. Tampoco se documenta el numero de tokens vistos ni si se aplico alguna tecnica de aumento de datos. La innovacion tecnica relevante no esta en el entrenamiento, sino en el empaquetado: el modelo se exporta a ONNX, se cuantiza dinamicamente a int8 por canal y se acompaña de un artefacto auxiliar (`cpu-chat/`) con 3.575 vectores de preguntas en float16 little-endian (2,7 MB) y un JSON de respuestas por personaje (1,6 MB) con un umbral de decision de 0,6, de modo que la inferencia completa cabe en un cliente sin servidor.

## Capacidades

- Generacion de embeddings de frases de 384 dimensiones para similitud semantica y recuperacion densa.
- Recuperacion de la pregunta mas similar dentro de un conjunto cerrado mediante producto interno contra una matriz precalculada.
- Funcionamiento en CPU pura a traves de transformers.js con onnxruntime-web (WASM), sin GPU ni servicio remoto.
- Ejecucion en dos precisiones: fp32 e int8 dinamica, con perdida minima declarada (R@1 de 0,593 a 0,587 en el conjunto de preguntas reales de HaruPet).
- Soporte de la convencion de prefijos de la familia E5 (`query: ` / `passage: `).
- Seleccion entre cuatro personajes (haru, luna, mori, minako) compartiendo un unico espacio vectorial y una lista comun de preguntas.
- Mecanismo de repliegue: si la mejor puntuacion no alcanza el umbral de 0,6, se devuelve una de las tres frases de repregunta del personaje (`fallback`).
- No genera texto, no razona, no ejecuta codigo, no tiene vision ni audio y no soporta tool calling ni uso como agente. Cualquier capacidad generativa atribuida al sistema HaruPet procede de otro componente, no de este modelo.

## Casos de uso

- Seleccion de respuesta en asistentes de escritorio o personajes virtuales: es el caso original. El modelo vectoriza el mensaje con el prefijo `query: `, calcula el producto interno contra 3.575 vectores normalizados y devuelve la respuesta asociada al indice ganador si supera 0,6. Al vivir en 118 MB y ejecutarse en WASM, permite conversacion sin conexion en aplicaciones Electron o de escritorio.
- Busqueda semantica en el navegador: indexar un corpus pequeno o mediano de documentacion y resolver consultas en el cliente con transformers.js, evitando enviar texto a un servidor. El limite practico son los 512 tokens por fragmento, que obliga a trocear los documentos.
- Deduplicacion y agrupacion de tickets de soporte en coreano: vectorizar cada incidencia y agrupar por similitud coseno para detectar consultas repetidas o construir una FAQ consolidada, con un coste de computo marginal en CPU.
- Deteccion de intencion sin entrenamiento supervisado: representar cada intencion del catalogo como un `passage: ` y clasificar el mensaje entrante por vecino mas cercano. Es util cuando no hay suficientes datos etiquetados para entrenar un clasificador dedicado.
- Filtrado y moderacion de texto en coreano: comparar cada mensaje contra un conjunto de patrones problematicos etiquetados y activar una revision cuando la similitud supere un umbral, como prefiltro barato antes de un modelo mayor.
- Recuperacion aumentada de bajo coste en el borde: usar el modelo como recuperador en un dispositivo sin GPU y dejar la generacion a un modelo remoto o a un modelo pequeno local, reduciendo el trafico y la latencia de ida y vuelta.
- Recomendacion de contenido por similitud: representar el historial de la persona usuaria y el catalogo en el mismo espacio para ordenar resultados, util en catalogos pequenos donde un sistema de recomendacion completo no esta justificado.
- Evaluacion de calidad de respuestas: calcular similitud semantica entre respuestas generadas y referencias en coreano como metrica automatica en pruebas de regresion de un producto conversacional.
- Emparejamiento pregunta-respuesta en sistemas de atencion automatizada con catalogo cerrado: en lugar de generar, devolver la respuesta aprobada mas cercana, lo que reduce el riesgo de respuestas inventadas.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Modelo | Haru preguntas reales R@1 | Haru preguntas sinteticas R@1 | Ko-StrategyQA nDCG@10 |
|---|---|---|---|
| intfloat/multilingual-e5-small | 0,413 | 0,657 | 0,752 |
| KoSimCSE-roberta-multitask | 0,440 | 0,514 | 0,639 |
| haru-e5-small-int8 (fp32) | 0,593 | 0,714 | 0,715 |
| haru-e5-small-int8 (int8, onnxruntime-web WASM) | 0,587 | no disponible | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los tres conjuntos reportados son de recuperacion de frases; el tercero, Ko-StrategyQA, es un benchmark general en coreano, donde el ajuste queda por debajo de su modelo base (0,715 frente a 0,752), lo que indica una perdida de generalidad a cambio de especializacion.

## Requisitos de hardware

- VRAM estimada: practicamente nula. El modelo no necesita GPU; en CPU ocupa 118 MB de pesos en la variante int8 y 470 MB en fp32, mas el coste del runtime ONNX.
- Cabe en cualquier GPU de consumo por tamano, pero no tiene sentido desplegarlo en GPU: no hay datos de rendimiento en GPU publicados.
- CPU: cualquier procesador x86-64 o ARM moderno. La model card reporta unos 16 ms por consulta en WASM con 1 hilo y unos 106 ms si solo se usan nucleos de eficiencia.
- Memoria adicional en cliente: 2,7 MB para la matriz de 3.575 vectores en float16 y 1,6 MB para el JSON de respuestas.
- Opciones de despliegue: transformers.js con onnxruntime-web (WASM) es la ruta documentada y la que usa la aplicacion. ONNX Runtime nativo es viable al ser un grafo ONNX estandar. No se publican pesos en formato sentence-transformers, GGUF ni safetensors, por lo que llama.cpp, Ollama, vLLM o TGI requeririan conversion previa y no estan soportados de fabrica.
- Throughput: no disponible. Solo se documenta la latencia de una seleccion de respuesta (~16 ms en WASM a 1 hilo).
- No se documenta soporte de WebGPU ni aceleracion por GPU en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Rendimiento (Haru real R@1 / Ko-StrategyQA nDCG@10) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| haru-e5-small-int8 | 118 M (heredados) | 384 | 512 tokens | 0,593 / 0,715 | MIT | ONNX fp32 e int8 en HuggingFace |
| intfloat/multilingual-e5-small | 118 M | 384 | 512 tokens | 0,413 / 0,752 | MIT | safetensors y ONNX en HuggingFace |
| KoSimCSE-roberta-multitask | no disponible | no disponible | no disponible | 0,440 / 0,639 | no disponible | HuggingFace |
| paraphrase-multilingual-MiniLM-L12-v2 | no disponible en la informacion disponible | 384 | no disponible | no disponible | no disponible | no disponible |

La comparacion solo es posible con datos de la propia model card. Frente al modelo base, haru-e5-small-int8 gana 0,18 puntos de R@1 en el dominio objetivo y cede 0,037 en nDCG@10 general; frente a KoSimCSE-roberta-multitask gana en los tres conjuntos, aunque este ultimo esta especializado en similitud de frases en coreano y no en recuperacion sobre un catalogo cerrado de respuestas.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce vectores. No puede redactar respuestas, razonar paso a paso ni invocar herramientas.
- Sobreajuste al dominio: la mejora en R@1 procede de pares pregunta-respuesta de HaruPet y el rendimiento general en coreano retrocede frente al base. Su uso fuera de ese dominio no esta respaldado por datos.
- Dataset de entrenamiento no publicado: no es auditable, lo que impide evaluar sesgos, cobertura tematica y posibles filtraciones entre entrenamiento y evaluacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de los resultados declarados.
- El umbral de 0,6 esta calibrado para la lista concreta de 3.575 preguntas y cuatro personajes. Reutilizarlo con otro catalogo o con otro modelo de embeddings requiere recalibrar.
- Los prefijos `query: ` y `passage: ` son obligatorios; omitirlos degrada la calidad de la representacion sin aviso de error.
- Ventana de 512 tokens: los documentos largos deben fragmentarse y agregarse despues, con la consiguiente perdida de contexto.
- Idiomas: aunque el modelo base es multilingue, el ajuste esta optimizado para coreano y no hay evaluacion en otras lenguas.
- Riesgo de falsos positivos: dos frases con alta similitud superficial pueden recibir puntuaciones altas aunque su intencion sea distinta, y el sistema devolvera una respuesta equivocada con aparente confianza. El mecanismo de repliegue mitiga pero no elimina este caso.
- Licencia MIT: permite uso comercial y modificacion, con obligacion de conservar el aviso de copyright y la licencia. Conviene verificar la licencia del modelo base y de los datos de entrenamiento, no publicados.
- Riesgo de sesgos no medido: al no conocerse el corpus, no puede descartarse la presencia de estereotipos de genero, edad u origen en las respuestas asociadas.
- Los metadatos del repositorio declaran fecha de creacion 2026-10-11, posterior a la fecha de consulta, lo que sugiere un posible error de metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ruddls030/haru-e5-small-int8
- Modelo base intfloat/multilingual-e5-small: https://huggingface.co/intfloat/multilingual-e5-small
- Proyecto HaruPet (enlace citado en la model card): https://haru.sarl
- Modelo comparado KoSimCSE-roberta-multitask: https://huggingface.co/BM-K/KoSimCSE-roberta-multitask
- Articulo del modelo base E5, "Text Embeddings by Weakly-Supervised Contrastive Pre-training": https://arxiv.org/abs/2212.03533
- Documentacion de MultipleNegativesRankingLoss en sentence-transformers: https://sbert.net/docs/package_reference/sentence_transformer/losses.html
- Libreria transformers.js: https://github.com/huggingface/transformers.js
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados tecnicos relevantes sobre este modelo; los enlaces obtenidos correspondian a sitios sin relacion con el proyecto y se han descartado.
