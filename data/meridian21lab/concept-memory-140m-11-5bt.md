# Meridian21Lab/concept-memory-140m-11.5bt

## Resumen

concept-memory-140m-11.5bt es un modelo de lenguaje base en ingles de 141,5 millones de parametros desarrollado por Meridian21Lab (proyecto MrCogito) y publicado con licencia Apache 2.0. Se entrena desde cero sobre 11.500 millones de tokens de datos publicos con un presupuesto de aproximadamente 320 dolares, y su aportacion tecnica es una capa de lectura denominada "concept memory": durante la generacion agrupa el texto ya visto en clusters de tokens relacionados (unos 8 tokens por concepto), guarda un resumen de cada uno y, para predecir la siguiente palabra, relee literalmente los pocos clusters relevantes y consulta los resumenes del resto. Cada capa local ve solo los ultimos 128 tokens, pero el modelo aprovecha hasta 64.000 tokens de documento (unas 50.000 palabras, una novela corta).

Es un lanzamiento de investigacion: modelo base, una sola semilla de entrenamiento y sin ajuste por instrucciones. Su interes radica en que demuestra que una arquitectura de memoria conceptual permite a un modelo de 140M competir en prediccion de documentos largos con modelos del doble de tamano y hasta 520 veces mas texto de entrenamiento (Gemma 3 270M), y superar a SmolLM2-135M y Pythia-160M en gramatica y en recuperacion de informacion lejana con un presupuesto de computo dos ordenes de magnitud menor.

Meridian21 entrena varios modelos con los mismos datos, orden, presupuesto y capas, cambiando unicamente la capa de lectura, de modo que las comparaciones entre sus variantes son controladas. El otro modelo publicado hasta ahora es topic-index-140m-11.5bt (Latent Sparse Attention), que empata con este en documentos largos y tareas estandar pero encuentra mas hechos en posiciones lejanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capa de lectura "concept memory" (perceiver_ar, codigo personalizado) |
| Parametros totales | 141.506.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 64k tokens de documento (61k de pasado efectivo); capas locales de 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere trust_remote_code=True) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con una innovacion central en la capa de atencion: en lugar de atencion densa sobre todo el contexto, agrupa los tokens ya procesados en clusters de conceptos de unos 8 tokens, mantiene un resumen por cluster y, en cada paso de decodificacion, selecciona los clusters mas relevantes para releerlos token a token mientras consulta los resumenes del resto. Las capas locales operan sobre una ventana de 128 tokens, pero el mecanismo de memoria permite explotar hasta 61k tokens de pasado efectivo. El identificador de arquitectura en la libreria es `perceiver_ar` y requiere cargar el codigo personalizado del repositorio.

El entrenamiento se realizo desde cero sobre 11.500 millones de tokens (presupuesto etiquetado como 11.5bt) durante unas 40 horas en un nodo de 4 GPU, con un coste estimado de 320 dolares. Las fuentes de datos son todas publicas en Hugging Face: Nemotron-CC-v2, Nemotron-CC-Math-v1, Nemotron-Pretraining-Specialized-v1, dclm-edu, stackv2_edu_filtered, project_gutenberg_filtered, arxiv_papers_filtered, doab_filtered, usgpo_filtered, uk_hansard_filtered, dolma3_longmino_pool y smol-smoltalk. No se menciona RLHF ni DPO: es un modelo base sin ajuste por preferencias. Todas las etapas de entrenamiento estan registradas en W&B publico y cada metrica de la model card tiene su fichero de resultados crudo en el repositorio.

## Capacidades

- Generacion de texto autoregresiva en ingles como modelo base (sin ajuste por instrucciones).
- Modelado de lenguaje de documentos largos: aprovecha hasta 61k tokens de pasado, con mejora sostenida de la prediccion a medida que crece el contexto (0,051 bits por byte de mejora de 1k a 61k).
- Recuperacion de informacion en contexto largo (needle in a haystack): 1,00 hasta 16k tokens y 0,98 a 32k en ensayos reales; 0,62 a 8k en needles ocultos entre claves similares.
- Razonamiento gramatical y comprension linguistica basica (BLiMP 80,56 %).
- Cuestionarios de ciencia de nivel basico (ARC-Easy 48,95 %).
- Capacidades multilingues: solo ingles.
- Tool calling / function calling: no disponible (modelo base sin instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales: memoria conceptual con relectura selectiva de clusters; sin vision ni audio.

## Casos de uso

- Investigacion en mecanismos de atencion y memoria: el modelo sirve como banco de pruebas reproducible para estudiar alternativas a la atencion densa, ya que comparte datos, orden y presupuesto con topic-index-140m-11.5bt y permite aislar el efecto de la capa de lectura.
- Modelado de documentos largos en local: con una unica RTX 3090 de 24 GB se puntua un documento completo de 64k tokens en una sola pasada, util para calcular perplejidad o puntuar borradores de libros, informes o articulos cientificos sin infraestructura de servidor.
- Recuperacion de hechos en corpus extensos: su rendimiento en RULER (0,98 a 32k) lo hace adecuado para prototipos de busqueda de agujas en textos largos, como localizar una clausula en un contrato o un dato en un informe gubernamental, siempre como componente de investigacion.
- Base para fine-tuning ligero: al ser un modelo base de 141M con licencia Apache 2.0, se puede ajustar para tareas concretas (clasificacion, extraccion, resumen extractivo) con recursos modestos, partiendo de una representacion de contexto largo que modelos de su tamano no ofrecen.
- Evaluacion comparativa de arquitecturas: util para equipos que investigan alternativas a transformers clasicos y necesitan una referencia publica con resultados crudos y trazabilidad completa en W&B.
- Generacion de texto asistida en ingles con contexto extenso: prototipos de continuacion de texto donde el modelo debe mantener coherencia con material lejano del documento, como reescritura de secciones de un libro o generacion de resumenes condicionados por capitulos anteriores.
- Docencia y experimentacion con presupuesto reducido: su coste de entrenamiento (320 dolares) y su carga en una linea con `trust_remote_code=True` lo hacen viable para cursos y laboratorios que quieran reproducir experimentos de memoria en modelos pequenos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Tarea | Metrica | Valor |
|---|---|---|
| BLiMP (67 conjuntos, 0-shot) | accuracy | 80,56 % |
| ARC-Easy (0-shot, test) | accuracy | 48,95 % |
| WikiText-2 | byte perplexity (menor es mejor) | 1,95 |
| Documentos largos de 64k (55 documentos retenidos) | bits por byte (menor es mejor) | 0,795 |
| RULER, needle en ensayos reales | score | 1,00 hasta 16k; 0,98 a 32k; 0,62 a 8k con claves similares |

Comparaciones citadas en la model card (misma arnés de evaluacion):

| Modelo | Parametros | Contexto | Documentos largos (bits/byte) | BLiMP | ARC-Easy |
|---|---|---|---|---|---|
| concept-memory-140m-11.5bt | 141,5M | 64k | 0,795 | 80,56 % | 48,95 % |
| SmolLM2-135M (checkpoint 252B tokens) | 135M | 8k | 0,832 | 79,72 % | no disponible |
| Pythia-160M | 160M | 2k | 0,942 | no disponible | no disponible |
| Gemma 3 270M | 270M | 32k | 0,805 | no disponible | no disponible |
| LFM2.5-350M-Base | 350M | no disponible | 0,879 (mejor contexto) | 80,17 % | no disponible |
| Granite 4.0 350M | 350M | no disponible | 0,776 | no disponible | no disponible |
| topic-index-140m-11.5bt | 141,5M | 64k | 0,797 | no disponible | no disponible |

El autor indica que frente a Pythia-160M con el mismo presupuesto (10,5-12,6B tokens) el modelo va por delante en todas las pruebas, y que Pythia no alcanza su puntuacion de gramatica ni de ciencia en ningun checkpoint hasta 300B tokens. La media de siete tareas estandar es 46,2 % para este modelo frente a 46,5 % de topic-index-140m-11.5bt.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 141,5M parametros (unos 0,57 GB en fp32, 0,28 GB en fp16); el repositorio completo ocupa 0,6 GB. La inferencia de un documento de 64k tokens en una sola pasada cabe en una RTX 3090 de 24 GB, segun el autor.
- GPU recomendadas: una RTX 3090 de 24 GB es suficiente para puntuar documentos completos de 64k; para el entrenamiento se uso un nodo de 4 GPU (modelo no especificado) durante unas 40 horas.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas para contexto completo; con contextos menores es previsible que quepa en GPUs de 8-12 GB, aunque el autor no publica cifras especificas.
- Opciones de despliegue: transformers con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`, que es el unico metodo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI; al requerir codigo personalizado, la compatibilidad con esos motores no esta garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Documentos largos (bits/byte) | BLiMP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| concept-memory-140m-11.5bt | 141,5M | 64k | 0,795 | 80,56 % | Apache 2.0 | Hugging Face |
| topic-index-140m-11.5bt | 141,5M | 64k | 0,797 | no disponible | Apache 2.0 | Hugging Face |
| SmolLM2-135M | 135M | 8k | 0,832 | 79,72 % (252B tokens) | Apache 2.0 | Hugging Face |
| Pythia-160M | 160M | 2k | 0,942 | no disponible | Apache 2.0 | Hugging Face |
| Gemma 3 270M | 270M | 32k | 0,805 | no disponible | Gemma license | Hugging Face |

La ventaja de concept-memory-140m-11.5bt frente a SmolLM2-135M y Pythia-160M es doble: mejor prediccion en documentos largos y mejor gramatica con un presupuesto de entrenamiento mucho menor. Frente a Gemma 3 270M empata en prediccion de documentos largos pese a tener la mitad de parametros y 520 veces menos texto de entrenamiento; Granite 4.0 350M y LFM2.5-350M-Base quedan por delante y por detras respectivamente en esa metrica, con el doble o mas de parametros.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes de forma fiable, no soporta tool calling ni razonamiento multi-paso.
- Solo ingles: no hay capacidades multilingues declaradas.
- Una sola semilla de entrenamiento: los resultados pueden variar con otra inicializacion; es un lanzamiento de investigacion, no un modelo listo para produccion.
- Riesgo de alucinacion: como cualquier modelo de lenguaje generativo, puede producir texto plausible pero incorrecto; no se han publicado evaluaciones de veracidad.
- Sesgos: no se documentan analisis de sesgo; los datos de entrenamiento son corpus publicos con los sesgos inherentes a ellos.
- Requiere `trust_remote_code=True`: la carga ejecuta codigo personalizado del repositorio, lo que implica un riesgo de seguridad que debe evaluarse en entornos controlados.
- Compatibilidad limitada con motores de inferencia estandar (vLLM, llama.cpp, Ollama, TGI): no esta documentada y el codigo personalizado puede impedirla.
- Rendimiento en recuperacion de informacion: aunque bueno en RULER, el score a 8k con claves similares es 0,62, lejos de la perfeccion; no es un sistema de busqueda garantizado.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo base sin garantias, cualquier despliegue en produccion requiere validacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Meridian21Lab/concept-memory-140m-11.5bt
- Pagina del proyecto: https://ai.ksopyla.com/projects/concept-reasoning/
- Codigo: https://github.com/ksopyla/MrCogito/tree/1fddc505
- Detalles de evaluacion: https://huggingface.co/Meridian21Lab/concept-memory-140m-11.5bt/blob/main/EVALUATION.md
- Entrenamiento en W&B: https://wandb.ai/ksopyla/MrCogito/reports/150M-concept-memory-vs-earlier-100M-runs--VmlldzoxODMxMjMwMw
- Modelo hermano topic-index-140m-11.5bt: https://huggingface.co/Meridian21Lab/topic-index-140m-11.5bt
