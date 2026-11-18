# abacusai/Smaug-Uncensored-GGUF

## Resumen

Smaug-Uncensored-GGUF es la distribucion en formato GGUF del modelo multimodal Smaug-Uncensored, desarrollado por Abacus.AI. Se trata de una cuantizacion pensada para su uso con llama.cpp, Ollama y LM Studio, que conserva la capacidad de entrada de imagen y texto (pipeline image-text-to-text) del modelo original. El repositorio incluye siete niveles de cuantizacion, desde IQ3_M hasta Q8_0, cada uno en dos variantes: un fichero plano y otro que mantiene la cabeza de prediccion multi-token (MTP) para acelerar la generacion, ademas del proyector de vision para la entrada de imagenes.

El modelo base cuenta con 26.895.998.464 parametros (aproximadamente 26,9 mil millones) y esta publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Soporta los idiomas ingles y chino, y esta etiquetado como "uncensored" y "agentic", lo que sugiere un entrenamiento orientado a reducir rechazos y a habilitar flujos de agente multi-paso.

La relevancia de esta ficha radica en que ofrece una via practica para ejecutar un modelo multimodal de ~27B en hardware de consumo mediante cuantizacion GGUF, con opciones de decodificacion especulativa (MTP) y soporte de vision, algo poco habitual en modelos de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal; detalles en la model card principal) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card menciona contextos de 24K y 32K en las recomendaciones de memoria, pero no la ventana maxima oficial) |
| Tipos de cuantizacion | IQ3_M, Q3_K_M, IQ4_XS, y hasta Q8_0 (siete niveles; la informacion detalla IQ3_M, Q3_K_M e IQ4_XS, y menciona Q6_K y Q8_0) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Smaug-Uncensored (tipo de transformer, composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF/DPO). Lo que si se documenta es el proceso de cuantizacion: los ficheros GGUF se generaron con llama.cpp (commit 71a6a11) a partir de los pesos en BF16, utilizando una importance matrix (imatrix.gguf) calibrada con el texto calibration_datav3 de bartowski, que se incluye en el repositorio.

La innovacion tecnica destacable de esta distribucion es la inclusion de una cabeza de prediccion multi-token (MTP) en una variante de cada cuantizacion, que actua como draft head para decodificacion especulativa y acelera la generacion. Ademas, se incluye el proyector de vision para permitir la entrada de imagenes. Cada fichero fue probado con thinking activado, desactivado y con una imagen, y los ficheros planos mas el Q6_K con MTP se evaluaron en GPQA Diamond e IFBench.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Entrada multimodal image-text-to-text (vision) mediante el proyector incluido.
- Modo de razonamiento (thinking) activable y desactivable.
- Capacidades agenticas y tool calling (etiquetas "agentic" y "mtp").
- Decodificacion especulativa mediante cabeza MTP para acelerar la generacion.
- Multilinguee limitado a ingles y chino.
- Orientacion "uncensored": menor tendencia a rechazar peticiones.

## Casos de uso

- Asistencia conversacional con imagenes: el modelo puede recibir una captura o foto junto a una pregunta y responder en el mismo turno, gracias al proyector de vision incluido en el repo GGUF.
- Despliegue en estaciones de trabajo con GPU de consumo: con la cuantizacion IQ3_M (11,7 GiB) cabe en 16 GB de VRAM con contexto de 32K, lo que permite ejecutar un modelo de ~27B en una RTX 4090 o similar.
- Agentes autonomos locales: las etiquetas agentic y la cabeza MTP lo hacen adecuado para bucles de razonamiento multi-paso con generacion acelerada en entornos sin conexion.
- Procesamiento de documentos con imagenes en ingles o chino: extraccion y resumen de contenido visual y textual en pipelines de llama.cpp u Ollama.
- Prototipado rapido con LM Studio u Ollama: los ficheros GGUF se cargan directamente sin conversion, lo que agiliza la evaluacion de un modelo multimodal de gran tamano.
- Evaluacion comparativa de cuantizaciones: el repo incluye metricas KLD y de coincidencia de token top para elegir el equilibrio entre calidad y memoria (por ejemplo, IQ4_XS con KLD medio 0,0179 frente a IQ3_M con 0,0611).
- Investigacion sobre alineacion y censura: al ser un modelo "uncensored" con licencia Apache 2.0, sirve para estudiar el comportamiento de modelos con rechazos reducidos en entornos controlados.

## Benchmarks y rendimiento

La model card indica que los ficheros planos y el Q6_K con MTP se evaluaron en GPQA Diamond e IFBench, pero no se proporcionan los resultados numericos en la informacion disponible. Si se documentan metricas de fidelidad de cuantizacion (KLD y coincidencia de token top):

| Cuantizacion | Tamano (GiB) | KLD medio | KLD 99% | Mismo token top |
|---|---|---|---|---|
| IQ3_M | 11,7 | 0,0611 | 0,628 | 90,3% |
| Q3_K_M | 12,4 | 0,0521 | 0,527 | 90,7% |
| IQ4_XS | 14,0 | 0,0179 | no disponible en el fragmento | no disponible en el fragmento |

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, GPQA Diamond, IFBench) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: IQ3_M ~11,7 GiB (16 GB de GPU con contexto de 32K; una tarjeta de 12 GB requiere parte del modelo en CPU); Q3_K_M ~12,4 GiB (16 GB con contexto de hasta ~24K); IQ4_XS ~14,0 GiB.
- GPU recomendadas: no se especifican modelos concretos; por tamano, encajan tarjetas de 16 GB o mas (RTX 4080/4090, A100, H100) para las cuantizaciones bajas, y de 24 GB o mas para las altas.
- Cabe en GPU de consumo: si, al menos IQ3_M y Q3_K_M en tarjetas de 16 GB; en 12 GB es necesario descargar parte del modelo a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (y cualquier runtime compatible con GGUF).
- Latencia y throughput: no disponibles; la variante con cabeza MTP esta pensada para acelerar la generacion mediante decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de tarea del modelo ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A nivel estructural, se puede senalar:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Smaug-Uncensored-GGUF | ~26,9B | no disponible | Apache 2.0 | GGUF |
| Alternativas de ~27B multimodales | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta etiquetado como "uncensored", lo que implica menor filtrado de contenido; requiere supervision y politicas de uso en produccion.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan datos de calibracion.
- Soporte limitado a ingles y chino; el rendimiento en castellano no esta documentado.
- La ventana de contexto maxima no se especifica en la informacion disponible; las cifras de 24K y 32K corresponden a recomendaciones de memoria, no a la longitud oficial.
- La cuantizacion IQ3_M presenta un KLD medio de 0,0611 y solo un 90,3% de coincidencia de token top, lo que puede degradar la calidad frente a precision completa.
- No se detallan sesgos conocidos ni restricciones adicionales de licencia mas alla de Apache 2.0.
- El tamano del repo (257,8 GB) implica un coste de almacenamiento y descarga considerable.

## Enlaces

- Repositorio GGUF: https://huggingface.co/abacusai/Smaug-Uncensored-GGUF
- Modelo base: https://huggingface.co/abacusai/Smaug-Uncensored
- Pagina de Abacus.AI: https://abacus.ai
- Perfil de Hugging Face de Abacus.AI: https://huggingface.co/abacusai
- Licencia: https://huggingface.co/abacusai/Smaug-Uncensored-GGUF/blob/main/LICENSE
