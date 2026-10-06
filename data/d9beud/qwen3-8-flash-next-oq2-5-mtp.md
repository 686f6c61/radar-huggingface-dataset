# d9beuD/Qwen3.8-Flash-Next-oQ2.5-mtp

## Resumen

Qwen3.8-Flash-Next-oQ2.5-mtp es una cuantizacion en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario d9beuD. No se trata de un entrenamiento nuevo ni de un ajuste fino, sino de una compresion de pesos con la herramienta oQ (oMLX v0.7.0) mediante cuantizacion de precision mixta de nivel 2.5, con 2 bits por defecto y aproximadamente 3,15 bits efectivos por peso. El resultado ocupa 71 GB en disco y conserva la cabeza de prediccion multi-token (MTP), el codificador de vision y la tabla de embeddings de n-gramas del modelo original.

El problema que resuelve es de tipo practico: el checkpoint base en bfloat16 tiene unos 180.000 millones de parametros y no cabe en la memoria unificada de un Mac de 128 GB, segun indica el propio autor. Esta version reduce el peso a 71 GB para que pueda cargarse en equipos Apple Silicon con 96 GB o mas de memoria unificada, manteniendo la capacidad image-text-to-text del modelo original.

Su relevancia es acotada y experimental. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, no se han publicado resultados de benchmarks ni evaluaciones de degradacion frente al modelo base, y la propia model card advierte de que el mapa de sensibilidad por capas se midio sobre otro checkpoint ya cuantizado a 4 bits, no sobre el bf16 completo. Es, por tanto, una pieza util para investigacion sobre cuantizacion agresiva en local, no un artefacto listo para produccion sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el campo model_type declarado es qwen4_exp; el modelo base es un transformer multimodal con codificador de vision) |
| Parametros totales | 179.999.981.459 (aproximadamente 180.000 millones) |
| Parametros activos | no disponible (no se confirma que sea un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ 2.5 de precision mixta: 2 bits por defecto, group size 64 (algunos modulos usan 32 o 128); ~3,15 bits efectivos por peso. Distribucion: 66,9% de los parametros a 2 bits, 29,0% a 3 bits, 1,4% a 4 bits, 0,3% a 5 bits, 2,5% a 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como other en HuggingFace), heredada del modelo base |
| Formato de pesos | safetensors de MLX (pesos cuantizados; pesos no cuantizados, escalas y sesgos en bfloat16) |

Datos adicionales del repositorio: tamano de 71,0 GB, creado el 5 de octubre de 2026, biblioteca declarada mlx, pipeline image-text-to-text.

## Arquitectura y entrenamiento

El modelo no ha sido entrenado por el autor de esta ficha tecnica. Se trata de una cuantizacion del checkpoint Qwen/Qwen3.8-Flash-Next, del que no se proporcionan en la informacion disponible detalles sobre arquitectura interna, numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO. Lo unico documentado sobre la arquitectura del modelo base es que admite entrada de imagen y texto y que su tipo declarado es qwen4_exp, y que la version cuantizada conserva tres componentes: el codificador de vision, una cabeza de prediccion multi-token (mtp_num_hidden_layers: 1) y una tabla de embeddings de n-gramas.

El proceso de cuantizacion es lo unico descrito con detalle. Se aplico la herramienta oQ en su version oMLX v0.7.0, con nivel 2.5 y precision mixta: la mayor parte de los pesos queda a 2 bits (66,9%) y a 3 bits (29,0%), mientras que una fraccion pequena se mantiene a 4, 5 y 8 bits (1,4%, 0,3% y 2,5% respectivamente) para preservar los modulos mas sensibles. Los pesos no cuantizados, las escalas y los sesgos se almacenan en bfloat16. El mapa de sensibilidad por capas que guia la asignacion de bits no se midio sobre el checkpoint bf16 original, sino sobre Jundot/Qwen3.8-Flash-Next-oQ4e-mtp, con 128 muestras de 256 tokens y el conjunto de calibracion code_multilingual, porque el bf16 completo no cabe en memoria en un Mac de 128 GB. La conservacion de la cabeza MTP es relevante porque habilita decodificacion multi-token, un mecanismo similar a la decodificacion especulativa que puede aumentar el throughput de generacion.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es image-text-to-text con caracter conversacional, de modo que acepta turnos de dialogo y produce respuestas de texto.
- Entrada de imagen: el repositorio incluye el codificador de vision, por lo que el modelo procesa imagenes junto con texto en la misma peticion.
- Prediccion multi-token: la cabeza MTP se conserva intacta, lo que permite generar varios tokens por paso hacia delante y acelera la decodificacion en comparacion con una decodificacion puramente autorregresiva token a token.
- Uso de embeddings de n-gramas: la tabla de n-gramas esta incluida, un componente que en modelos de este tipo suele emplearse para acelerar o estabilizar la generacion.
- Ejecucion local en Apple Silicon: al estar en formato MLX, la inferencia se realiza sobre memoria unificada de Mac, sin necesidad de GPU dedicada.
- Soporte de tool calling o function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no documentadas. El conjunto de calibracion se denomina code_multilingual, pero eso describe el material usado para medir sensibilidad, no los idiomas soportados por el modelo.
- Modo thinking, audio u otras capacidades especiales: no documentado en la informacion disponible.

## Casos de uso

- Analisis de documentos escaneados en local: gracias al codificador de vision incluido, el modelo puede recibir una imagen de un documento (factura, informe, captura) junto con una pregunta en texto y devolver la informacion extraida. Resulta adecuado cuando la politica de privacidad impide enviar documentos a una API externa, ya que toda la inferencia ocurre en el Mac.
- Asistencia conversacional con soporte visual: en un Mac con 96 GB o mas de memoria unificada se puede mantener una sesion multi-turno en la que el usuario adjunta capturas de pantalla o fotografias y pide explicaciones, correcciones o resumenes. El caracter conversacional declarado en la model card encaja con este patron de uso.
- Etiquetado y captioning de imagenes en pipelines de datos: el modelo puede generar descripciones textuales de imagenes por lotes para construir datasets de entrenamiento o indexar bibliotecas multimedia. Al ejecutarse en local, no hay coste por token ni limite de peticiones externo.
- Investigacion sobre cuantizacion agresiva: este checkpoint es un objeto de estudio directo para medir como se degrada un modelo de 180.000 millones de parametros al llevarlo a 2 bits en dos tercios de sus pesos. Un grupo de investigacion puede comparar sus salidas con las de Jundot/Qwen3.8-Flash-Next-oQ4e-mtp y con el bf16 base para cuantificar la perdida en tareas concretas.
- Reproduccion y validacion del pipeline oQ: el repositorio documenta nivel, group size, distribucion de bits y metodologia de calibracion, lo que permite reproducir el proceso con la herramienta oMLX y verificar si el mapa de sensibilidad obtenido sobre un checkpoint a 4 bits es una buena aproximacion al que se obtendria midiendo sobre bf16.
- Despliegue de un asistente interno sin conexion: en entornos con red restringida o requisitos de soberania del dato, un servidor MLX local puede exponer este modelo como endpoint compatible con la API de OpenAI y dar servicio a un equipo pequeno, siempre que el rendimiento medido tras la evaluacion resulte suficiente.
- Estudio de decodificacion multi-token: la conservacion de la cabeza MTP permite medir la ganancia real de throughput frente a la decodificacion clasica en hardware Apple Silicon, un dato util para decidir si conviene conservar esta cabeza en futuras cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, y tampoco se proporciona una comparacion cuantitativa de degradacion frente al modelo base en bfloat16 o frente a la cuantizacion a 4 bits. Tampoco se publican mediciones de latencia ni de tokens por segundo.

## Requisitos de hardware

- Peso en disco y en memoria: 71 GB de pesos. El propio autor indica que se necesita un Mac con mas de 71 GB de memoria unificada, por ejemplo 96 GB.
- Memoria recomendada: 96 GB de memoria unificada como minimo. Hay que anadir a los 71 GB de pesos el espacio para la cache KV, el codificador de vision y el resto de estados de inferencia, por lo que un equipo de 96 GB queda con poco margen para contextos largos o sesiones concurrentes.
- Equipos viables: Mac Studio con 192 GB, Mac Studio M3 Ultra con memoria superior, y configuraciones de MacBook Pro con 96 GB o 128 GB de memoria unificada. No cabe en equipos de 16, 24, 32, 48 o 64 GB.
- GPU NVIDIA o AMD: no soportadas de forma directa. El formato es safetensors de MLX y la biblioteca declarada es mlx, de modo que la carga requiere Apple Silicon. En la informacion disponible no consta ninguna version GGUF ni ninguna otra conversion para CUDA.
- Cabe en GPU de consumo: no, en el sentido habitual. No existe una ruta de despliegue documentada sobre una RTX 4090 (24 GB) ni sobre GPUs con menos memoria que los 71 GB de pesos.
- Opciones de despliegue: mlx-lm y mlx-vlm para el pipeline image-text-to-text, el servidor integrado de mlx-lm para exponer una API, y la propia herramienta oMLX/oQ empleada en la cuantizacion. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. No se han publicado mediciones, y la ganancia esperable por la cabeza MTP no esta cuantificada en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ2.5-mtp (este) | ~180.000 millones | oQ 2.5, ~3,15 bits efectivos, 71 GB | no disponible | no disponible | Qwen Community License 1.0 | MLX safetensors, 0 descargas, 0 likes |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | no disponible (mismo modelo base) | oQ nivel 4e, precision mixta | no disponible | no disponible | Qwen Community License 1.0 | MLX; usado como referencia para el mapa de sensibilidad de este modelo |
| Qwen/Qwen3.8-Flash-Next (base) | ~180.000 millones | bfloat16 sin cuantizar | no disponible | no disponible | Qwen Community License 1.0 | safetensors; segun la model card, no cabe en memoria en un Mac de 128 GB |

La comparacion cuantitativa de calidad entre estas tres variantes no puede realizarse con la informacion disponible: no hay benchmarks publicados para ninguna de ellas. Lo unico contrastable es el compromiso entre tamano y precision: la variante oQ4e emplea una precision mayor y la oQ2.5 aqui descrita reduce el peso hasta 71 GB manteniendo la cabeza MTP y el codificador de vision.

## Limitaciones y advertencias

- Cuantizacion muy agresiva: el 66,9% de los parametros esta a 2 bits y el 29,0% a 3 bits. Es esperable una degradacion de calidad frente al bf16 y frente a cuantizaciones a 4 bits, aunque no se ha publicado ninguna medicion que la cuantifique. No debe asumirse un comportamiento equivalente al modelo base.
- Calibracion sobre un checkpoint ya cuantizado: el mapa de sensibilidad por capas se midio sobre Jundot/Qwen3.8-Flash-Next-oQ4e-mtp y no sobre el bf16 completo, con 128 muestras de 256 tokens de un unico conjunto (code_multilingual). Esto puede sesgar la asignacion de bits hacia el dominio de codigo y no reflejar la sensibilidad real de otras tareas, como vision o dialogo general.
- Sin evaluacion publicada: no hay benchmarks, ni comparativas de degradacion, ni analisis de alucinacion. Cualquier uso en produccion deberia ir precedido de una evaluacion propia en las tareas objetivo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. En modelos cuantizados a 2 bits el riesgo de generar contenido plausible pero incorrecto tiende a aumentar, pero no se aportan datos que lo confirmen para este checkpoint.
- Repositorio sin traccion: 0 descargas y 0 likes. No hay issues, validaciones de terceros ni evidencia de que el checkpoint cargue correctamente en todas las configuraciones.
- Dependencia de hardware: requiere Apple Silicon con mas de 71 GB de memoria unificada. No hay ruta documentada para GPUs NVIDIA, AMD o para CPUs x86, lo que limita el despliegue en la mayoria de infraestructuras de servidor.
- Idiomas y contexto no documentados: se desconoce la longitud de contexto soportada y la cobertura linguistica, por lo que no se puede garantizar su comportamiento en castellano ni en conversaciones largas.
- Licencia heredada: el modelo se distribuye bajo Qwen Community License 1.0, etiquetada como other en HuggingFace, con el archivo LICENSE incluido en el repositorio. Antes de cualquier uso comercial es necesario revisar el texto completo de esa licencia, ya que en la informacion disponible no se detallan sus condiciones ni sus umbrales de uso.
- Fecha de publicacion: el repositorio esta fechado en octubre de 2026, con una ventana de creacion y actualizacion de menos de dos minutos, lo que sugiere una publicacion no mantenida posteriormente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ2.5-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizacion de referencia usada para el mapa de sensibilidad: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Listado de modelos etiquetados con oq en HuggingFace: https://huggingface.co/models?other=oq
- Licencia: archivo LICENSE dentro del repositorio del modelo
