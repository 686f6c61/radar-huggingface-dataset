# nlpai-lab/MixLID

## Resumen

MixLID es un modelo de identificacion de idioma a nivel de token desarrollado por el grupo nlpai-lab. Su funcion es etiquetar cada token de un texto con el idioma al que pertenece, resolviendo el problema del texto mezclado o code-switching, donde una misma frase combina fragmentos en varios idiomas. Frente a clasificadores de idioma tradicionales que devuelven una unica etiqueta por documento, MixLID localiza spans de idioma dentro del texto, incluidas expresiones cortas embebidas en otro idioma.

El modelo se construye sobre el backbone jhu-clsp/mmBERT-small, un encoder de la familia ModernBERT, al que se aade una cabeza de clasificacion de tokens (token classification). Cuenta con 140.685.426 parametros y una ventana de contexto de 8.192 tokens, lo que permite procesar documentos largos sin truncar. Soporta 111 etiquetas de idioma mas etiquetas auxiliares para numeros (NUM), puntuacion (PUNCT) y simbolos (SYM), y ofrece dos modos de prediccion con el mismo checkpoint: idioma por token y idioma predominante por entrada.

Es relevante ahora porque la identificacion de idioma a nivel fino es una pieza critica en la curación de corpus multilingues, la evaluacion de modelos generativos (detectar mezcla no deseada de idiomas) y el preprocesado de datos para entrenamiento. Su licencia MIT y su tamano reducido (0,6 GB de repositorio) facilitan su integracion en pipelines de produccion sin coste elevado de computo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder (ModernBERT) con cabeza de clasificacion de tokens |
| Parametros totales | 140.685.426 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors) |
| Idiomas soportados | 111 etiquetas de idioma mas NUM, PUNCT y SYM |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | jhu-clsp/mmBERT-small |
| Tarea (pipeline) | token-classification |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

MixLID emplea como backbone mmBERT-small, un modelo encoder de tipo transformer optimizado para eficiencia, y le superpone una cabeza de clasificacion a nivel de token. La salida no es una unica etiqueta por secuencia, sino una secuencia de etiquetas alineadas con los tokens de entrada, que posteriormente se agrupan en spans contiguos con sus offsets de caracteres y sus puntuaciones de confianza. El modelo expone dos modos de inferencia sobre el mismo checkpoint: `predict_tokens()` devuelve predicciones de subpalabra y spans fusionados, mientras que `predict_sentence()` devuelve el idioma predominante de la entrada completa.

Segun la model card, los datos de entrenamiento provienen de los conjuntos HPLT/OpenLID-v3, igorsterner/acs-corpus, google/smol y facebook/belebele. Las metricas declaradas son accuracy y f1. No se especifican en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO; el paper asociado figura como "coming soon". Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal mas alla de las propias del backbone mmBERT.

## Capacidades

- Identificacion de idioma a nivel de token: asigna una etiqueta de idioma a cada token o subpalabra del texto de entrada.
- Localizacion de spans de idioma: agrupa tokens contiguos del mismo idioma en spans, con offsets de caracteres (start, end) y puntuacion de confianza.
- Deteccion de idioma predominante: devuelve el idioma principal de una entrada completa mediante `predict_sentence()`.
- Manejo de texto mezclado y code-switching: detecta expresiones cortas embebidas en otro idioma dentro de una frase.
- Etiquetas auxiliares: clasifica numeros (NUM), puntuacion (PUNCT) y simbolos (SYM) por separado, evitando que contaminen las etiquetas de idioma.
- Cobertura multilingue amplia: 111 etiquetas de idioma con distincion de escritura (por ejemplo, `kor_Hang`, `eng_Latn`, `fra_Latn`).
- Procesamiento por lotes: tanto `predict_tokens()` como `predict_sentence()` aceptan una cadena o una lista de cadenas.
- Contexto largo: ventana de 8.192 tokens, adecuada para documentos extensos.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, vision ni tool calling; es un modelo discriminativo de clasificacion.

## Casos de uso

- Filtrado de corpus multilingues: seleccionar documentos escritos en un idioma objetivo y descartar o marcar los fragmentos que esten en otros idiomas, usando las etiquetas por token y los spans devueltos.
- Evaluacion de modelos generativos: medir si las respuestas de un LLM respetan el idioma solicitado y detectar mezcla de idiomas no deseada, con la posibilidad de usar la consistencia linguistica como componente de una funcion de recompensa.
- Anotacion de transcripciones de voz: verificar el idioma de transcripciones y etiquetar transcripciones con mezcla de idiomas durante la preparacion de corpus audio-texto.
- Analisis sociolinguistico y de code-switching: cuantificar la proporcion de cada idioma y localizar los puntos exactos de cambio de idioma en textos de hablantes bilingues.
- Preprocesado para entrenamiento de modelos: segmentar y etiquetar grandes volumenes de datos antes de alimentar pipelines de entrenamiento multilingue, aprovechando la ventana de 8.192 tokens.
- Moderacion y enrutado de contenido: identificar el idioma real de una consulta para dirigirla al modelo o al agente adecuado, incluso cuando la consulta mezcla idiomas.
- Control de calidad en localizacion: comprobar que una traduccion o un contenido localizado no contiene fragmentos residuales en el idioma de origen.
- Analisis de redes sociales y foros: procesar publicaciones con mezcla frecuente de idiomas y determinar el idioma dominante por publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card declara el uso de las metricas accuracy y f1 y menciona los datasets HPLT/OpenLID-v3, igorsterner/acs-corpus, google/smol y facebook/belebele, pero no incluye cifras concretas. El paper asociado figura como pendiente de publicacion.

## Requisitos de hardware

Las estimaciones de VRAM que siguen se derivan del recuento de parametros (140,7 millones) y son aproximadas:

- VRAM en fp32: en torno a 560 MB solo para pesos, mas memoria para activaciones y el contexto de hasta 8.192 tokens.
- VRAM en fp16/bf16: en torno a 280 MB para pesos.
- VRAM en int8: en torno a 140 MB para pesos.
- GPU: cabe con holgura en cualquier GPU de consumo, incluidas RTX 3060, RTX 4060, RTX 4090 o inferiores; tambien puede ejecutarse en CPU para cargas por lotes pequenas.
- Al ser un modelo de 140 millones de parametros, la inferencia en GPU dedicada no es imprescindible; es viable en CPU con latencias mayores.
- Opciones de despliegue: biblioteca transformers de Hugging Face (con `trust_remote_code=True` o mediante el modulo local `mixlid.py`) e integracion en endpoints compatibles con Hugging Face. No se documenta soporte especifico para vLLM, llama.cpp u Ollama en la informacion disponible.
- Versionado recomendado por el autor: torch 2.9.1, transformers 4.57.0 y safetensors 0.7.0.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. La tabla siguiente recoge alternativas del mismo ambito funcional (identificacion de idioma), marcando como "no disponible" los valores que no se pueden confirmar con la informacion facilitada.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MixLID | Encoder + cabeza de token classification, nivel de token | 140.685.426 | 8.192 tokens | MIT | Hugging Face |
| GlotLID | Clasificacion de idioma multilingue | no disponible | no disponible | no disponible | Hugging Face |
| fastText lid.176 | Clasificador lineal sobre embeddings de subpalabras | no disponible | no disponible | no disponible | Repositorio fastText |
| CLD3 | Clasificador neuronal ligero | no disponible | no disponible | no disponible | Repositorio de Google |

La diferencia principal de MixLID frente a clasificadores por documento es su granularidad a nivel de token y su soporte explicito de texto mezclado. No se dispone de cifras que permitan comparar su precision con las alternativas citadas.

## Limitaciones y advertencias

- No se han publicado cifras de rendimiento verificables; el paper esta pendiente, por lo que la calidad real no puede contrastarse con datos externos.
- Riesgo de confusion en idiomas con escrituras o lexicos solapados, especialmente en textos muy cortos o con fragmentos de una o dos palabras.
- La ventana de contexto esta limitada a 8.192 tokens; `predict_sentence()` no divide parrafos en frases, por lo que entradas muy largas pueden verse afectadas segun como se use la API.
- Aunque cubre 111 etiquetas de idioma, no se detalla el rendimiento por idioma; los idiomas con menos recursos podrian tener menor fiabilidad.
- Es un modelo discriminativo: no genera texto ni resuelve tareas de razonamiento, codigo o vision.
- El uso de la API de transformers requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar `mixlid.py` antes de desplegarlo en produccion.
- El repositorio tiene 0 descargas registradas en el momento de la consulta, por lo que su adopcion en produccion es aun incipiente.
- Licencia MIT, que permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la licencia.
- Sesgos conocidos: no se documentan en la informacion disponible; los sesgos dependeran de la composicion de HPLT/OpenLID-v3, acs-corpus, google/smol y facebook/belebele.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nlpai-lab/MixLID
- Demo (Space): https://huggingface.co/spaces/hongst/MixLID
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Paper: pendiente de publicacion ("coming soon")
- Datasets referenciados:
  - https://huggingface.co/datasets/HPLT/OpenLID-v3
  - https://huggingface.co/datasets/igorsterner/acs-corpus
  - https://huggingface.co/datasets/google/smol
  - https://huggingface.co/datasets/facebook/belebele
