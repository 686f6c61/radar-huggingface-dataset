# ghananlpcommunity/mmbert-twi-farmer-topics-lora

## Resumen

El modelo `ghananlpcommunity/mmbert-twi-farmer-topics-lora` es un adaptador LoRA publicado por GhanaNLP Community sobre el encoder multilingue `jhu-clsp/mmBERT-base`, que sigue la arquitectura ModernBERT (22 capas, 768 dimensiones ocultas). Su tarea es la clasificacion multi-etiqueta de fragmentos de discusion en twi (akan, codigo `ak`) sobre tematicas agricolas: una misma intervencion puede recibir varias de las 10 categorias canonicas definidas por los autores, desde gestion del suelo hasta control de plagas o manejo poscosecha.

El problema que resuelve es muy concreto: existe abundante material en twi procedente de sesiones de preguntas y respuestas con agricultores, pero carece de estructura tematica explotable. Este adaptador permite etiquetar automaticamente ese material, algo relevante para servicios de extension agraria, cooperativas de cacao y proyectos de investigacion en Ghana y en el resto del area akanohablante, donde la cobertura de herramientas de PLN es escasa.

Tecnicamente no es un modelo generativo, sino un clasificador: entrena aproximadamente el 0,4 % de los parametros (pesos LoRA mas la cabeza de clasificacion) y aplica activacion sigmoide por etiqueta, con un umbral de decision de 0,36 ajustado sobre el conjunto de validacion. En el conjunto de test obtiene un F1 micro de 0,643 y un F1 macro de 0,408, con una variacion muy marcada entre categorias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `jhu-clsp/mmBERT-base` (encoder transformer tipo ModernBERT, 22 capas, 768 dimensiones ocultas); clasificacion multi-etiqueta con activacion sigmoide |
| Parametros totales | No disponible. Se entrena aproximadamente el 0,4 % de los parametros del modelo base (pesos LoRA mas cabeza de clasificacion) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El ejemplo de uso de la model card trunca las entradas a 256 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Twi (akan, codigo `ak`). El modelo base es multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | Adaptador LoRA cargado con la libreria `adapter-transformers` / Adapter-Hub. Formato concreto de los ficheros de pesos: no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es ModernBERT en su variante `mmBERT-base`: un encoder transformer de 22 capas y 768 dimensiones ocultas, concebido para uso multilingue. Sobre el se inserta un adaptador LoRA gestionado con la libreria `adapters` de Adapter-Hub, mas una cabeza de clasificacion multicapa con `problem_type="multi_label_classification"`. Los autores indican que solo se actualiza alrededor del 0,4 % de los parametros totales. La clasificacion es multi-etiqueta, no multiclase, porque un fragmento de discusion suele abordar varios temas simultaneamente.

Los datos de entrenamiento consisten en 15.085 pasajes unicos en twi, transcritos a partir del conjunto de discusiones agricolas y de cacao AfriFarmer, repartidos en 13.577 ejemplos de entrenamiento, 754 de validacion y 754 de test. El entrenamiento duro 15 epocas con programacion de tasa de aprendizaje coseno y precision bf16. Los autores senalan un detalle tecnico relevante: la ruta de atencion SDPA de ModernBERT resulto numericamente inestable en bf16 para esta tarea y producia perdidas NaN durante la primera epoca, por lo que se forzo `attn_implementation="eager"`. Las 10 etiquetas no provienen de un esquema previo validado, sino de un proceso de agrupamiento (k-means sobre embeddings de frases) aplicado a unas 24.000 cadenas de categoria ruidosas generadas originalmente por un LLM por par de preguntas y respuestas, seguidas de fusiones manuales de grupos casi duplicados.

## Capacidades

- Clasificacion de texto multi-etiqueta en twi sobre 10 categorias agricolas: Cocoa, Tree & Root Crops; Crop Growth & Environmental Response; Crop Protection, Shade & Pruning; Crop Rotation & Weed Management; Flowering & Fruit Development; Pest & Disease Control; Planting & Field Establishment; Post-Harvest Handling; Soil Management; Vegetable Farming.
- Asignacion de varias etiquetas simultaneas a un mismo fragmento mediante umbral por etiqueta (0,36), en lugar de una unica clase dominante.
- Procesamiento de fragmentos cortos de discusion agraria transcrita, con truncado a 256 tokens en el ejemplo oficial.
- Funcionamiento como componente de un pipeline de PLN (etiquetado previo, filtrado, enrutado), no como generador de texto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no. El adaptador esta entrenado especificamente sobre twi; el caracter multilingue corresponde al modelo base.
- Capacidades especiales (modo de razonamiento, vision, audio): no disponible.

## Casos de uso

- Enrutado de consultas en lineas de ayuda agraria: cada mensaje entrante en twi se etiqueta y se deriva automaticamente a los equipos o fichas correspondientes. La salida multi-etiqueta es clave porque una consulta sobre cacao puede implicar a la vez poda y control de plagas, y el sistema puede activar ambos flujos.
- Pre-etiquetado para anotacion humana: el adaptador asigna categorias iniciales a grandes volumenes de transcripciones, de modo que el anotador solo revisa y corrige. Es adecuado precisamente porque el F1 macro bajo (0,408) desaconseja el uso sin supervision en las categorias minoritarias.
- Organizacion y busqueda tematica de archivos de preguntas y respuestas: indexar los 15.085 pasajes del corpus AfriFarmer, u otros similares, por tema permite consultas del tipo "todas las discusiones sobre manejo de suelo" sin etiquetado manual previo.
- Analisis de tendencias para investigacion agronomica: agregar la frecuencia de cada etiqueta por campana o por region permite detectar que preocupaciones dominan (por ejemplo, picos de consultas sobre enfermedades) y cuando aparecen.
- Filtrado en pipelines de recuperacion aumentada (RAG): etiquetar la base documental antes de la recuperacion y restringir la busqueda a los temas relevantes para la pregunta, reduciendo el ruido recuperado.
- Cuadros de mando para ONGs, cooperativas y servicios de extension: metricas agregadas de temas por periodo, con categorias fiables como Soil Management o Planting & Field Establishment (F1 superior a 0,8) como base de indicadores operativos.
- Priorizacion de incidencias urgentes: las etiquetas Pest & Disease Control y Post-Harvest Handling pueden usarse para marcar consultas que requieren respuesta rapida, aunque en estos casos conviene un umbral mas laxo y revision humana por el bajo rendimiento en categorias minoritarias.

## Benchmarks y rendimiento

Resultados publicados por los autores sobre el conjunto de test (754 ejemplos), con umbral 0,36 ajustado sobre validacion:

| Metrica | Valor |
|---|---|
| F1 micro | 0,643 |
| F1 macro | 0,408 |
| Umbral de decision | 0,36 |

El F1 por etiqueta varia de forma sustancial segun los autores: categorias bien representadas como Soil Management y Planting & Field Establishment superan 0,8, mientras que Vegetable Farming y Post-Harvest Handling obtienen valores muy inferiores. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos de referencia para esta tarea.

## Requisitos de hardware

- El adaptador en si es de tamano reducido (aproximadamente el 0,4 % de parametros entrenados) y no anade requisitos apreciables de VRAM sobre el modelo base.
- VRAM estimada para inferencia: no disponible de forma oficial. Por la configuracion indicada del modelo base (22 capas, 768 dimensiones ocultas), una estimacion razonable situa la inferencia en bf16/fp16 en el rango de 1 a 3 GB, pero es una estimacion no confirmada por los autores.
- GPU recomendadas: no disponible. Dado el tamano estimado, deberia ejecutarse sin problema en GPUs de consumo (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para lotes pequenos, si bien no hay mediciones publicadas.
- Opciones de despliegue: `transformers` junto con la libreria `adapters` de Adapter-Hub es la via documentada. No se han publicado pesos GGUF ni integraciones con vLLM, TGI u Ollama para este adaptador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| `ghananlpcommunity/mmbert-twi-farmer-topics-lora` | Adaptador LoRA de clasificacion multi-etiqueta en twi, 10 etiquetas | No disponible (0,4 % de parametros entrenados) | No disponible | F1 micro 0,643 / F1 macro 0,408 | Apache-2.0 |
| `jhu-clsp/mmBERT-base` | Modelo base multilingue sin adaptador | No disponible | No disponible | No aplicable: sin la cabeza y el adaptador no reproduce la clasificacion tematica | No disponible |
| Otras propuestas publicas de clasificacion de temas agricolas en twi | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Taxonomia no validada rigurosamente: las 10 etiquetas se obtuvieron agrupando unas 24.000 cadenas de categoria ruidosas generadas por un LLM mediante k-means sobre embeddings y fusiones manuales posteriores. Los propios autores las describen como una taxonomia practica, no como un esquema validado.
- Desbalance de clases acusado: la diferencia entre F1 micro (0,643) y F1 macro (0,408) indica que las categorias frecuentes funcionan bien y las minoritarias, no.
- Umbral dependiente del conjunto de validacion: el valor 0,36 esta ajustado para este corpus y puede no trasladarse a otros dominios, registros o variantes dialectales del twi.
- Sesgo de dominio: los datos provienen de discusiones sobre cacao y agricultura recogidas en el marco del proyecto AfriFarmer, por lo que el rendimiento fuera de ese contexto (otros cultivos, otros paises, texto escrito en lugar de transcrito) no esta caracterizado.
- Monolinguismo: el adaptador solo esta entrenado en twi (akan). No se ha evaluado su comportamiento en otros idiomas, aunque el modelo base sea multilingue.
- Dependencia de la libreria `adapters`: cargar unicamente `jhu-clsp/mmBERT-base` no reproduce estos resultados, ya que los pesos del adaptador y la cabeza de clasificacion son imprescindibles.
- Fragilidad numerica conocida: la ruta de atencion SDPA de ModernBERT en bf16 produjo perdidas NaN durante el entrenamiento, lo que obligo a usar atencion eager. Conviene replicar esa configuracion en inferencia o validar cualquier otra.
- No es un modelo generativo: no produce texto ni puede alucinar contenido, pero si puede generar falsos positivos y falsos negativos en el etiquetado, especialmente en las categorias con menor F1.
- Licencia Apache-2.0 para el adaptador, que permite uso comercial y modificacion con las obligaciones habituales de atribucion; conviene verificar por separado los terminos del modelo base y de los datos de origen antes de un despliegue en produccion.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion indicadas (24 de septiembre de 2026) son posteriores a la fecha actual, lo que sugiere un error en los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ghananlpcommunity/mmbert-twi-farmer-topics-lora
- Modelo base `jhu-clsp/mmBERT-base`: https://huggingface.co/jhu-clsp/mmBERT-base
- Libreria Adapter-Hub `adapters`: https://github.com/Adapter-Hub/adapters
- Conjunto de datos AfriFarmer (mencionado en la model card, sin enlace disponible): no disponible
- Articulo o publicacion asociada: no disponible
- Demo o espacio interactivo: no disponible
