# maxafanasiev/news-topic-classifier-e5-base

## Resumen

El modelo `news-topic-classifier-e5-base` es un clasificador de texto multietiqueta para articulos de noticias, desarrollado por el usuario maxafanasiev y publicado en HuggingFace. Se trata de un fine-tuning del modelo de embeddings multilingue `intfloat/multilingual-e5-base`, adaptado mediante `AutoModelForSequenceClassification` para predecir 13 topicos periodisticos: Business And Finance, Market And Exchange, Demographics, Scientific Exploration, Labour Dispute, Disaster, Conflicts And War, Politics, Crime, Theft, Assault, Corporate Crime y Fraud. La ausencia de etiquetas se interpreta como "Other".

El modelo resuelve el problema de la clasificacion automatica de noticias en un contexto multilingue (hereda la cobertura linguistica de e5-base), con salida multi-etiqueta en lugar de una unica clase, lo que permite representar articulos que abordan varios temas simultaneamente. Su relevancia practica radica en que ofrece un pipeline cerrado con umbrales calibrados por categoria (`thresholds.json`) y una relacion calidad/latencia favorable en CPU: 0,860 de micro-F1 con 42 ms por articulo a 512 tokens.

Con 278 millones de parametros y un repositorio de 2,0 GB, el modelo esta pensado para inferencia ligera y despliegue local, sin dependencia de servicios en la nube. La model card esta redactada en ingles y describe tanto el uso online como el offline mediante descarga de ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base de `intfloat/multilingual-e5-base`) con cabeza de clasificacion multi-etiqueta |
| Parametros totales | 278.053.645 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (truncado en entrenamiento e inferencia; `max_len=256` como alternativa mas rapida) |
| Tipos de cuantizacion | no disponible (el autor solo documenta fp32 en CPU; el formato safetensors admite cuantizacion a fp16/int8 pero no se especifica) |
| Idiomas soportados | no disponible explicitamente; hereda el caracter multilingue de `multilingual-e5-base` (la model card incluye ejemplos en ingles y castellano) |
| Licencia | other (no se detalla la licencia concreta en la informacion disponible) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `tokenizer.json`, `tokenizer_config.json` y `thresholds.json` |

## Arquitectura y entrenamiento

El modelo parte de `intfloat/multilingual-e5-base`, un encoder transformer de tipo XLM-RoBERTa orientado a embeddings multilingues, y anade una cabeza de clasificacion (`AutoModelForSequenceClassification`) con 13 salidas y activacion sigmoide, lo que configura un esquema multi-etiqueta independiente por categoria. La entrada se construye concatenando el prefijo `"passage: "`, el titulo y el cuerpo del articulo, truncada a 512 tokens. Los umbrales de decision no son fijos a 0,5, sino que se leen de `thresholds.json` y se calibran por categoria. Ademas, se aplica una regla post-proceso que anade la etiqueta padre `Crime` cuando se predice `Theft` o `Assault`.

El entrenamiento se realizo sobre aproximadamente 8.000 articulos de noticias etiquetados por un profesor LLM (identificado como "Sonnet 5.5"), con un conjunto gold construido a partir de tres etiquetadores LLM ciegos mas un juez, sin verificacion manual. Los datos de entrenamiento son privados y no se incluyen en el repositorio. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; el modelo es un clasificador, no un generador.

## Capacidades

- Clasificacion multi-etiqueta de articulos de noticias en 13 topicos predefinidos, con posibilidad de asignar varias etiquetas a un mismo texto.
- Tratamiento de la clase "Other" como ausencia de etiqueta, lo que permite filtrar contenido no categorizable.
- Entrada bilingue en la practica: la model card muestra ejemplos en ingles y en castellano, aunque no se detalla la lista completa de idiomas.
- Inferencia por lotes (recomendado 16-32 articulos) con truncado configurable a 256 o 512 tokens.
- Despliegue offline completo: descarga de ficheros y ejecucion con `HF_HUB_OFFLINE=1` sin acceso a la red.
- Regla de jerarquia de etiquetas incorporada (`Theft`/`Assault` implican `Crime`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un clasificador puro, no un modelo generativo.

## Casos de uso

- Enrutamiento editorial automatizado: clasificar cada noticia entrante en una o varias secciones (Politics, Business And Finance, Crime) para asignarla a la mesa correspondiente, aprovechando la salida multi-etiqueta y los umbrales calibrados por categoria.
- Moderacion y filtrado de contenido sensible: detectar articulos con etiquetas de Crime, Theft, Assault, Fraud o Corporate Crime para derivarlos a revision humana o a colas especializadas.
- Agregadores y lectores de noticias: etiquetar feeds RSS o APIs de medios en tiempo real, con 20-42 ms por articulo en CPU, lo que permite procesar lotes grandes sin GPU.
- Analisis de tendencias y monitorizacion de medios: agregar conteos por topico a lo largo del tiempo (por ejemplo, picos de Disaster o Conflicts And War) para paneles de analitica.
- Investigacion en ciencias sociales y periodismo de datos: clasificar corpus historicos de noticias multilingues para estudios de encuadre o cobertura tematica, con el modelo ejecutandose de forma local y reproducible.
- Sistemas de recomendacion de noticias: usar las etiquetas como senal de perfilado de usuario y filtrado por categoria, combinando la salida multi-etiqueta con reglas de negocio.
- Preprocesado en pipelines de NLP: generar etiquetas topicas como caracteristica de entrada para modelos posteriores (resumen, busqueda semantica, clustering) sin coste de API.

## Benchmarks y rendimiento

| Max tokens | micro-F1 (gold aleatorio, 163) | exact set match | Latencia CPU |
|---|---|---|---|
| 512 | 0,860 | 0,804 | 42 ms/articulo |
| 256 | 0,836 | 0,785 | 20 ms/articulo |

Medido en un Apple M4 Pro en fp32 sobre un conjunto gold de 163 ejemplos. No se han publicado comparaciones con otros clasificadores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 278 M de parametros, en fp32 el modelo ocupa aproximadamente 1,1 GB de pesos, y en fp16 alrededor de 0,56 GB, mas el overhead de activaciones y tokenizacion.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU consumer con 2-4 GB libres es suficiente (por ejemplo, RTX 3060 en adelante).
- Cabe en GPU consumer: si, con margen amplio; tambien se ejecuta en CPU, como demuestran las latencias publicadas (42 ms/articulo a 512 tokens en Apple M4 Pro).
- Opciones de despliegue: `transformers` con PyTorch (documentado), modo offline con `HF_HUB_OFFLINE=1`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a generacion, no a clasificacion).
- Latencia y throughput: 42 ms/articulo a 512 tokens y 20 ms/articulo a 256 tokens en CPU Apple M4 Pro en fp32; el autor recomienda lotes de 16-32 articulos. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `maxafanasiev/news-topic-classifier-e5-base` | 278 M | 512 tokens | Clasificacion multi-etiqueta de noticias (13 topicos) | other | HuggingFace (repo descrito como privado en la model card) |
| `intfloat/multilingual-e5-base` (modelo base) | 278 M | 512 tokens | Embeddings multilingues | no disponible | HuggingFace |
| Clasificadores de topicos alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros clasificadores de noticias en la informacion proporcionada.

## Limitaciones y advertencias

- El conjunto gold no fue verificado manualmente: se construyo con tres etiquetadores LLM ciegos y un juez, por lo que las metricas de F1 y exact set match pueden estar sesgadas respecto a una anotacion humana.
- Los datos de entrenamiento son privados y no se publican, lo que impide auditar la composicion del corpus, su distribucion geografica o posibles sesgos.
- Los umbrales por categoria (`thresholds.json`) son parte critica del pipeline: usarlos con un umbral fijo de 0,5 degrada la calidad de las predicciones.
- La regla de jerarquia (`Theft`/`Assault` implican `Crime`) es una heuristica post-proceso, no una salida nativa del modelo.
- El truncado a 512 tokens descarta el contenido final de articulos largos; a 256 tokens la calidad baja (micro-F1 de 0,860 a 0,836).
- La licencia es "other" y no se detalla su contenido, por lo que el uso comercial no esta garantizado sin consultar los terminos del autor.
- La model card describe el repositorio como privado en los ejemplos de codigo, lo que puede afectar a la disponibilidad publica y a la reproducibilidad.
- No se documentan los idiomas soportados de forma exhaustiva ni los sesgos conocidos del modelo.
- Al ser un clasificador, no genera texto: no debe usarse para tareas generativas, de resumen ni de razonamiento.

## Enlaces

- HuggingFace: https://huggingface.co/maxafanasiev/news-topic-classifier-e5-base
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
