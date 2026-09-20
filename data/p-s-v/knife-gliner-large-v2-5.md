# P-s-v/knife-gliner-large-v2.5

## Resumen

knife-gliner-large-v2.5 es un modelo de reconocimiento de entidades nombradas (NER) especializado en el dominio del coleccionismo y uso de cuchillos. Lo publica el desarrollador independiente P-s-v y parte de gliner-community/gliner_large-v2.5, un encoder DeBERTa-v3-large de 459 millones de parametros. El modelo etiqueta tres tipos de entidad en comentarios de Reddit: marca de cuchillo (`knife brand`), modelo de cuchillo (`knife model`) y acero de cuchillo (`knife steel`). Por ejemplo, de la frase "picked up a Mazaki in white #2, way better than my old Fibrox" extrae Mazaki como marca, Fibrox como modelo y white #2 como acero.

Se trata de un ajuste fino pequeno y muy acotado: 2.025 ejemplos de entrenamiento y 225 de validacion en formato JSONL de GLiNER, generados a partir de comentarios de ocho subreddits de cuchillos. Las etiquetas de entrenamiento son "plateadas": las escribio Gemini 3.1 Pro en una unica pasada, con un coste de 9 dolares y sin revision humana posterior. Esto es importante para interpretar los resultados, porque todas las metricas publicadas miden concordancia con Gemini, no con la verdad anotada por personas.

Su relevancia es practica y de nicho: demuestra un flujo completo de ajuste de GLiNER para un dominio vertical con un coste total de entorno a 9 dolares en etiquetado mas 2,50 dolares de tiempo de GPU (Tesla T4 en Modal) repartido en diez ejecuciones. El modelo se distribuye bajo licencia Apache 2.0, es solo para ingles y esta pensado como componente de extraccion dentro de un pipeline mayor, no como modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional DeBERTa-v3-large con cabecera de clasificacion de spans de tipo entidad (familia GLiNER) |
| Parametros totales | 459 millones (encoder) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible en la informacion proporcionada (libreria `gliner`; pesos PyTorch) |
| Modelo base | gliner-community/gliner_large-v2.5 |
| Dataset de entrenamiento | P-s-v/reddit-knife-ner |
| Tarea (pipeline) | token-classification |
| Etiquetas soportadas | `knife brand`, `knife model`, `knife steel` |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de publicacion | 2026-09-19 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GLiNER, un esquema de NER generalista que codifica simultaneamente el texto y las etiquetas de entidad como representaciones y puntua los spans candidatos contra cada etiqueta. El backbone es DeBERTa-v3-large, con 459 millones de parametros. Esta eleccion implica que el modelo no genera texto: produce un etiquetado de tokens/spans con una puntuacion de confianza por entidad, y su comportamiento depende de las etiquetas que se le pasen en inferencia.

El ajuste fino se hizo sobre 2.025 ejemplos de entrenamiento y 225 de validacion, en formato JSONL de GLiNER (`tokenized_text` mas spans `ner`). Aproximadamente el 30 % de los ejemplos no contienen entidades. Se incluyeron 51 negativos adversariales (comentarios con terminos genericos como "carbon steel" o "chef knife" sin nombres de producto); una variante con 510 negativos adversariales empeoro el F1 hasta 0,799. El entrenamiento se ejecuto en una Tesla T4 en Modal, con `learning_rate = 1e-5`, `per_device_train_batch_size = 2` y `gradient_accumulation_steps = 8` (lote efectivo de 16); el encoder de 459 M solo cabe en una T4 con acumulacion de gradientes. El mejor checkpoint se alcanzo en la epoca 2 y todas las ejecuciones grandes sobreajustan a partir de ahi. La ejecucion ganadora tardo 24 minutos.

El autor documenta dos fallos relevantes del pipeline, mas costosos que cualquier hiperparametro: `tokenize_inputs` de GLiNER falla en algunas entradas con `encode_batch` del tokenizador de Rust y se sustituyo por una llamada `tokenizer.__call__` ejemplo a ejemplo; y `words_mask` no es una mascara binaria, sino un indice de palabra base 1 por token (0 en tokens especiales), de modo que rellenarlo con unos produce un entrenamiento que no aprende nada, con perdida plana y sin error. Como decision de inferencia, se usan umbrales por clase en lugar de un umbral global de 0,45, lo que elevo el recall de acero de 0,787 a 0,911.

## Capacidades

- Extraccion de entidades nombradas con tres etiquetas cerradas: `knife brand`, `knife model` y `knife steel`.
- Etiquetado sobre texto informal de foros: comentarios de Reddit con jerga, abreviaturas y nombres de producto sin normalizar.
- Umbrales de confianza configurables y ajustables por clase (`knife brand`: 0,35; `knife model`: 0,30; `knife steel`: 0,20), lo que permite priorizar precision o recall segun la etiqueta.
- Manejo de ejemplos sin entidades (aproximadamente el 30 % del set de entrenamiento) y de negativos con vocabulario generico del dominio.
- Capacidad de transferencia limitada a etiquetas nuevas: al derivar de GLiNER, la arquitectura admite en principio etiquetas arbitrarias, pero no hay datos publicados sobre el rendimiento de este checkpoint con etiquetas distintas de las tres entrenadas.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades de agente. Es exclusivamente un clasificador de spans.
- Multilingue: no. Entrenado y evaluado unicamente en ingles.

## Casos de uso

- Indexacion y busqueda facetada en foros de cuchillos: extraer marca, modelo y acero de cada comentario de un subreddit permite construir indices filtrables ("todos los comentarios que mencionan MagnaCut") sin busqueda textual exacta, que falla con abreviaturas y variantes.
- Monitorizacion de menciones de marca: al detectar `knife brand` en volumen, un fabricante puede medir presencia y contexto de sus productos frente a los de la competencia en comunidades como r/knives o r/chefknives.
- Enriquecimiento de catalogos de producto: a partir de resenas y comentarios en lenguaje natural se pueden rellenar campos estructurados (marca, modelo, acero) de una base de datos de cuchillos, con revision humana solo en las entidades de baja confianza.
- Analisis de preferencias de acero: la etiqueta `knife steel` con umbral bajo (0,20) y recall 0,911 permite agregar que aceros se mencionan mas y en que discusiones, util para estudios de mercado o para contenido editorial.
- Recomendadores y sistemas de afiliacion: el resultado del NER alimenta un motor de recomendacion que enlaza menciones de modelos concretos con fichas de tienda.En el proyecto de origen, el modelo se despliega como sidecar junto al scraper de Reddit.
- Moderacion y clasificacion de hilos de compraventa: detectar menciones de marca y modelo ayuda a etiquetar hilos de venta o cambios (r/Knife_Swap) sin intervencion manual.
- Anotacion asistida para conjuntos futuros: el modelo puede pre-etiquetar grandes volumenes de comentarios que despues se corrigen a mano, reduciendo el coste de construir un set con etiquetas humanas en lugar de plateadas.
- Investigacion en NER de dominio vertical: sirve como caso reproducible de ajuste de GLiNER con presupuesto minimo (9 dolares de etiquetado sintetico y 2,50 dolares de GPU), incluidos los fallos documentados del pipeline.

## Benchmarks y rendimiento

Los unicos resultados publicados son de F1 frente a las etiquetas generadas por Gemini sobre un conjunto de validacion de 225 comentarios, reservado antes de la segunda ejecucion de entrenamiento y no modificado despues.

| Modelo | Parametros | F1 vs etiquetas de Gemini |
|---|---|---|
| GLiNER large v2.5, zero-shot | 459 M | ~0,65 (estimado) |
| GLiNER medium v2.5, ajustado | 209 M | 0,800 |
| knife-gliner-large-v2.5 (ejecucion 10) | 459 M | 0,83 |

Nota del autor: una ejecucion anterior obtuvo 0,879 sobre una particion aleatoria, cifra que no se considera valida porque en particiones aleatorias dos caidas de F1 atribuidas a regresiones provenian en realidad de que comentarios cayeron en el conjunto de validacion. No se han publicado resultados sobre benchmarks estandar (MMLU, HumanEval, GSM8K u otros), ni F1 con etiquetas verificadas por humanos, ni F1 sobre marcas no vistas en entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 los pesos ocupan aproximadamente 0,92 GB; en FP32, aproximadamente 1,84 GB. Hay que sumar activaciones y memoria del tokenizador, por lo que un presupuesto practico de 2 a 4 GB es suficiente para lotes pequenos.
- Cabe sin problema en GPU de consumo: RTX 3060 (12 GB), RTX 4060, RTX 4090, e incluso en GPUs con 4-6 GB de VRAM para inferencia por lotes pequenos.
- Entrenamiento: se realizo en una Tesla T4 (16 GB) con acumulacion de gradientes y tamano de lote por dispositivo de 2. Segun el autor, el encoder de 459 M solo entra en una T4 con acumulacion de gradientes.
- Opciones de despliegue: libreria `gliner` (carga con `GLiNER.from_pretrained`), integracion como sidecar en un servicio propio (patron usado en el proyecto de origen, `sidecar/train_gliner_modal.py`). Otras alternativas de servido no estan documentadas para este checkpoint concreto.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es el de entrenamiento (24 minutos para la ejecucion ganadora en T4).
- Ajuste de rendimiento en produccion: usar umbrales por clase en lugar de un unico umbral; el autor reporta que pasar de un umbral global de 0,45 a umbrales por clase llevo el recall de `knife steel` de 0,787 a 0,911.

## Comparativa con modelos similares

| Modelo | Parametros | Ajuste | Contexto de evaluacion | F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| knife-gliner-large-v2.5 | 459 M | Ajustado en 2.025 ejemplos de Reddit | Validacion de 225 comentarios, etiquetas de Gemini | 0,83 | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| gliner-community/gliner_large-v2.5 | 459 M | Zero-shot | Mismo conjunto, etiquetas de Gemini | ~0,65 (estimado por el autor) | No disponible en la informacion proporcionada | HuggingFace (modelo base) |
| GLiNER medium v2.5 ajustado | 209 M | Ajustado | Mismo conjunto, etiquetas de Gemini | 0,800 | No disponible en la informacion proporcionada | HuggingFace |

La comparacion disponible es interna a la familia GLiNER. No se proporcionan datos frente a otras alternativas de NER (por ejemplo, modelos basados en BERT clasico, spaCy o LLM con prompting) para este dominio, por lo que no es posible situar el modelo frente a ellos con cifras.

## Limitaciones y advertencias

- Etiquetas plateadas sin verificacion humana: las anotaciones las genero Gemini 3.1 Pro en una unica pasada por 9 dolares y nadie las reviso. Donde Gemini se equivoco, el modelo recibe una puntuacion buena por copiar el error. Los 0,83 de F1 miden acuerdo con Gemini, no correccion.
- Dominio cerrado: entrenado con comentarios de ocho subreddits de cuchillos. Las marcas que no aparecieron en entrenamiento (fabricantes pequenos) son el punto debil declarado, y no se ha medido F1 sobre marcas reservadas.
- Solo ingles: no hay soporte multilingue. Ademas, abreviaturas dependientes de contexto fallan fuera de su comunidad; "PM2" es la Spyderco Paramilitary 2 en r/knives y solo letras en otros contextos.
- Sensibilidad a los umbrales: el rendimiento depende de usar umbrales por clase. Con un umbral global alto, el recall de acero cae de forma notable (de 0,911 a 0,787 en las pruebas del autor).
- Riesgo de falsos positivos con vocabulario generico: terminos como "carbon steel" o "chef knife" se usaron como negativos adversariales precisamente porque el modelo tiende a marcarlos.
- Sin datos de sesgo: no se ha publicado ninguna evaluacion de sesgos, robustez ante texto adversario ni comportamiento fuera de dominio.
- Licencia: el checkpoint se publica bajo Apache 2.0, lo que permite uso comercial, pero el modelo base y el dataset derivan de contenido de Reddit; conviene revisar las condiciones de uso de la plataforma y el tratamiento de datos personales si se procesan comentarios reales en produccion.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento posterior documentado ni versionado de modelos mas alla de la ejecucion 10 descrita.
- No es un modelo generativo: no puede usarse para resumir, responder preguntas ni razonar; solo etiqueta spans.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/P-s-v/knife-gliner-large-v2.5
- Modelo base: https://huggingface.co/gliner-community/gliner_large-v2.5
- Dataset de entrenamiento: https://huggingface.co/datasets/P-s-v/reddit-knife-ner
- Articulo del autor: https://petervijeh.com/projects/reddit-ner
- Registro de la ejecucion de entrenamiento: https://new.knife.day/blog/fine-tuning-gliner-knife-ner
- Repositorio con script de entrenamiento y pipeline (`sidecar/train_gliner_modal.py`): https://github.com/pvijeh/reddit-scraper-project

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los incluidos en la model card y listados arriba.
