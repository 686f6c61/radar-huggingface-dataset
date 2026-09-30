# ldov/Jev-Omni

## Resumen

Jev-Omni es un clasificador multimodal de decisiones desarrollado por el usuario ldov (con el repositorio tambien referenciado como akhilaaa3/Jev-Omni en la propia model card). No es un modelo generativo al uso: recibe un estado o contexto, una pregunta y una lista de opciones, y devuelve una probabilidad calibrada para cada opcion en lugar de una explicacion en lenguaje natural. Esta construido sobre Gemma 4 12B IT de Google y admite cuatro modalidades de entrada: texto, imagen, audio y video.

El modelo tiene 11.959.730.224 parametros (unos 12B) y se distribuye en safetensors bajo licencia Apache-2.0, con un repo de 24 GB. Su entrenamiento consistio en un ajuste fino sobre 30.000 preguntas, y su propuesta de valor es doble: por un lado, cubrir la interfaz de decision tipada (preguntas de si/no, de eleccion y de puntuacion) con probabilidades calibradas; por otro, hacerlo con un coste de inferencia muy bajo, ya que al no generar tokens de salida el gasto se limita a los tokens de entrada.

Es relevante ahora porque los benchmarks multimodales de decision (MMAU, MVBench) han estado dominados por modelos de cientos de billones de parametros, y Jev-Omni reporta 63,10% en MMAU y 53,10% en MVBench con solo 12B, ademas de latencias de decenas o cientos de milisegundos en una H200. La contrapartida es que no es un modelo de proposito general: su salida es una distribucion de probabilidad sobre opciones, no texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag gemma4_unified) con cabeza de clasificacion de decisiones; derivado de google/gemma-4-12B-it |
| Parametros totales | 11.959.730.224 (unos 12B, dato real de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la model card solo menciona pesos en FP32 con autocast BF16 en inferencia) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (siguiendo la de Gemma 4); los derechos del dataset son independientes |
| Formato de pesos | Safetensors (repo de 24 GB); el loader descarga ademas los componentes multimodales originales de Gemma 4 |
| Pipeline declarado | text-classification |
| Modalidades de entrada | Texto, imagen, audio y video |
| Tamano del repo | 24,0 GB |
| Fecha de creacion | 2026-09-29 |

## Arquitectura y entrenamiento

Jev-Omni parte de google/gemma-4-12B-it, un transformer multimodal, y le anade una cabeza de decision que produce una probabilidad por opcion en lugar de tokens de texto. El tag gemma4_unified y la etiqueta image-text-to-text indican que reutiliza los componentes multimodales del modelo base (vision, audio y video), que el loader descarga automaticamente al instanciar el clasificador. Se trata de un modelo fusionado (tag merged), lo que sugiere que los pesos resultan de combinar el modelo base ajustado con sus componentes.

El ajuste fino se realizo sobre unas 30.000 preguntas, segun la model card. No se detalla la composicion del dataset, ni si hubo RLHF o DPO, ni el numero total de tokens de entrenamiento; tampoco se especifica la longitud de contexto soportada. La interfaz cubre tres tipos de pregunta: si/no (noul), eleccion multiple (choice) y puntuacion (score), todas respondidas con probabilidades calibradas. La model card reporta una calibracion con ECE de 0,0400 en DecisionBench Medium (10 bins), lo que respalda que las probabilidades son utilizables como umbral de decision.

La innovacion principal no es arquitectonica sino de interfaz y de coste: al ser un clasificador, no genera tokens de salida, de modo que el coste por consulta se reduce a los tokens de entrada. La model card incluye una advertencia explicita de que Jev-Omni es un modelo independiente que implementa la interfaz de decision tipada y que no esta afiliado, patrocinado ni derivado de TypeSafe AI ni de su modelo Jev, ni entrenado con salidas de este.

## Capacidades

- Clasificacion de decisiones multimodal: responde preguntas de si/no, de eleccion entre opciones y de puntuacion, devolviendo probabilidad por opcion.
- Entrada de texto: maneja estados y contextos textuales de aproximadamente 2.000 tokens en las pruebas de latencia reportadas.
- Entrada de imagen: clasificacion de decisiones a partir de una imagen, con latencia medida de 26 ms en H200.
- Entrada de audio: soporta audio con un limite de 30 segundos por fragmento; la prueba de latencia usa un audio de 13 segundos (31 ms).
- Entrada de video: procesa video mediante muestreo de 16 fotogramas (504 ms en H200 para 16 fotogramas).
- Probabilidades calibradas: la salida es una distribucion por opcion, no texto libre, lo que permite fijar umbrales de confianza y mecanismos de abtencion.
- Capacidad declarada de hasta 20 opciones con calidad establecida; la cabeza acepta hasta 256 opciones, aunque por encima de 20 la calidad no esta demostrada.
- Rendimiento declarado en benchmarks de decision multimodal (MMAU, MVBench) y en conjuntos propios (DecisionBench Medium, JevBench).
- No se documentan capacidades de generacion de texto libre, razonamiento explicito, generacion de codigo, tool calling, function calling, uso como agente ni modo "thinking". Tampoco se documentan idiomas soportados.

## Casos de uso

- Triaje de decisiones clinicas asistidas: ante un caso descrito en texto junto con una imagen o un audio de consulta, el modelo puede responder preguntas cerradas del tipo "requiere derivacion urgente: si/no", devolviendo una probabilidad que el sistema puede comparar con un umbral. Su resultado de 63,10% en MMAU (conjunto de comprension multimodal medica) lo situa como candidato para prototipos de apoyo, nunca como sustituto del criterio clinico.
- Moderacion de contenido en video: con 16 fotogramas muestreados y 504 ms de latencia en H200, encaja en pipelines que deban decidir "infringe la politica: si/no" sobre clips cortos, con probabilidad calibrada para escalar solo los casos dudosos a revision humana.
- Enrutamiento de decisiones en centros de contacto: a partir de la transcripcion o del audio (hasta 30 segundos) de una interaccion, el modelo puede clasificar opciones como "reclamacion", "consulta tecnica" o "baja", usando la probabilidad como criterio de enrutamiento automatico.
- Verificacion de respuestas en sistemas de evaluacion automatica: dado un enunciado y una respuesta candidata, el modelo puntua o elige entre opciones, lo que permite construir evaluadores de calidad para conjuntos de preguntas de eleccion multiple con calibracion conocida.
- Filtrado previo en pipelines de RAG multimodal: cuando un sistema recupera imagenes o fragmentos de video, Jev-Omni puede decidir si el material recuperado responde a la pregunta del usuario antes de invocar un modelo generativo, reduciendo coste y latencia del tramo caro.
- Agentes encarnados y robotica de bajo nivel: decisiones discretas tipo "hay un obstaculo: si/no" o "que accion de esta lista procede" sobre imagen o video, con latencias de decenas a cientos de milisegundos en GPU de datacenter.
- Deteccion de abtencion en produccion: al disponer de probabilidades calibradas (ECE 0,0400), es posible definir un umbral por debajo del cual el sistema no decide y escala a un humano o a un modelo mayor, lo que es directamente explotable en flujos con requisitos de auditoria.
- Comparacion y benchmarking interno: sirve como linea base ligera (12B) frente a modelos multimodales mucho mayores en tareas de decision, gracias a que su salida es comparable directamente con etiquetas correctas.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| DecisionBench Medium (80 escenarios / 293 preguntas) | Exactitud | 87,57% |
| DecisionBench Medium | Exactitud micro | 86,01% |
| JevBench (195 grupos emparejados / 231 decisiones) | Exactitud | 86,15% |
| JevBench | Exactitud micro | 87,45% |
| MMAU (1.000 preguntas) | Exactitud micro | 63,10% |
| MVBench (14 tareas evaluadas / 2.786 preguntas) | Exactitud | 53,10% |
| MVBench | Exactitud micro | 53,09% |
| DecisionBench Medium | ECE (10 bins) | 0,0400 |

Notas de la model card: los resultados corresponden al modelo fusionado; la exactitud de DecisionBench Medium y JevBench se calcula como media de escenarios o grupos con el mismo peso. La calibracion se representa en la grafica con cinco bins por legibilidad, aunque el valor de ECE se calcula con diez.

Latencia en H200 con backend optimizado (medianas de 20 peticiones, sin preprocesado ni red):

| Entrada | Latencia mediana |
|---|---|
| Texto (~2.000 tokens) | 83 ms |
| Imagen | 26 ms |
| Audio de 13 segundos | 31 ms |
| Video de 16 fotogramas | 504 ms |

## Requisitos de hardware

- GPU CUDA obligatoria: la model card indica explicitamente que se requiere una GPU CUDA.
- Los pesos en FP32 ocupan unos 50 GB antes del overhead de ejecucion, segun la propia documentacion, por lo que el modelo completo en FP32 no cabe en GPUs de consumo.
- El repo ocupa 24 GB, coherente con pesos almacenados en precision reducida (del orden de 24 GB en BF16, estimacion a partir del tamano del repo, no confirmada por la model card).
- La inferencia se ejecuta con autocast BF16.
- GPU empleada en las mediciones publicadas: NVIDIA H200. Por el rango de memoria requerido, son adecuadas H100 80 GB, A100 80 GB y H200; no hay datos publicados para GPUs de 24 GB o menos.
- No cabe en GPUs de consumo tipo RTX 4090 (24 GB) en la configuracion documentada, dado el requisito de memoria indicado.
- No se documentan opciones de cuantizacion, ni soporte para vLLM, llama.cpp, Ollama o TGI. El unico camino de despliegue descrito es el loader propio `jev_omni` sobre transformers, con descarga del repositorio mediante `snapshot_download`.
- Requisitos de software: `requirements.txt` publicado por el autor y ffmpeg instalado para la entrada de audio.
- Throughput: no disponible (solo se publican latencias medianas por peticion).
- Latencia por modalidad en H200: 83 ms (texto ~2.000 tokens), 26 ms (imagen), 31 ms (audio de 13 s), 504 ms (video de 16 fotogramas).

## Comparativa con modelos similares

| Modelo | Parametros | MMAU | MVBench | Modalidades | Licencia |
|---|---|---|---|---|---|
| Jev-Omni | 12B | 63,10% | 53,10% | Texto, imagen, audio, video | Apache-2.0 |
| Inkling (thinkingmachines) | 975B totales / 41B activos | 77,20% | No disponible | Texto, imagen, audio | No disponible |
| Qwen3.5-397B-A17B | 397B totales / 17B activos | No disponible | 77,60% | Texto, imagen, video | No disponible |
| google/gemma-4-12B-it | 12B (modelo base, no clasificador) | No disponible | No disponible | Multimodal (modelo base) | No disponible en la informacion proporcionada |

Advertencias sobre la comparativa, tal como las recoge la model card: los resultados de referencia de Inkling y Qwen3.5-397B-A17B estan reportados oficialmente por sus desarrolladores y pueden emplear protocolos de evaluacion distintos; cada modelo solo tiene valor publicado en una de las dos columnas. La ventaja de Jev-Omni no es la precision bruta frente a esos modelos, sino la relacion entre tamano, latencia y coste: en el calculo de coste de la model card, Jev-Omni no genera tokens de salida, mientras que los modelos de chat se tarifican por llamada sobre el estado completo. La model card precisa que dividir un estado en llamadas por pregunta multiplica por 2,82 los tokens de entrada para los modelos de chat en ese conjunto, sin alterar el orden de la comparacion.

## Limitaciones y advertencias

- No es un modelo generativo: no produce explicaciones ni texto libre, solo probabilidades por opcion. Cualquier caso de uso que requiera justificacion textual necesita un modelo adicional.
- Limite de opciones: la calidad solo esta establecida hasta 20 opciones. La cabeza acepta 256, pero por encima de 20 el rendimiento no esta demostrado.
- Limite de audio: los fragmentos de audio estan limitados a 30 segundos.
- Limite de video: el procesado usa 16 fotogramas, lo que puede ser insuficiente para contenido con cambios rapidos o eventos largos.
- Idiomas soportados: no disponible. No hay informacion sobre cobertura multilingue ni sobre el comportamiento en castellano.
- Longitud de contexto: no disponible. La unica referencia es que las pruebas de latencia de texto usan aproximadamente 2.000 tokens.
- Riesgo de alucinacion: al no generar texto, el riesgo se traslada a decisiones erroneas con probabilidad alta; la propia model card publica ECE (0,0400) como indicador de calibracion, que debe validarse en el dominio concreto de despliegue.
- Sesgos: no se documenta ningun analisis de sesgos por parte del autor.
- Restricciones de licencia: los pesos son Apache-2.0, siguiendo la licencia de Gemma 4, pero la model card indica que los derechos del dataset son independientes, por lo que el uso comercial del modelo no cubre necesariamente los datos subyacentes.
- Trazabilidad de repositorio: el identificador de HuggingFace es ldov/Jev-Omni, mientras que el codigo de ejemplo y los enlaces de la model card apuntan a akhilaaa3/Jev-Omni. Conviene verificar cual es el repositorio canonico antes de integrarlo.
- Estado de adopcion: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Despliegue limitado: no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ni formatos cuantizados, lo que restringe las opciones de produccion a la ruta de transformers con el loader del autor.
- Requisito de hardware elevado: FP32 requiere unos 50 GB, lo que excluye GPUs de consumo en la configuracion documentada.
- Independencia respecto a TypeSafe AI: la model card subraya que Jev-Omni no esta afiliado, patrocinado ni derivado de TypeSafe AI ni de su modelo Jev, y que no se entreno con salidas de este. La similitud de nombre puede generar confusion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ldov/Jev-Omni
- Repositorio referenciado en el codigo de ejemplo: https://huggingface.co/akhilaaa3/Jev-Omni
- Requisitos de instalacion: https://huggingface.co/akhilaaa3/Jev-Omni/resolve/main/requirements.txt
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset DecisionBench: https://huggingface.co/datasets/akhilaaa3/decision-bench
- Inkling (comparativa): https://huggingface.co/thinkingmachines/Inkling
- Qwen3.5-397B-A17B (comparativa): https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
