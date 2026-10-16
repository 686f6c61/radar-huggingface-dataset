# neopolita/Niwaki-Flash-Next-15GB-v5.0-mlx

## Resumen

Niwaki-Flash-Next-15GB-v5.0-mlx es una version podada y cuantizada del modelo Qwen3.8-Flash-Next, publicada por el usuario neopolita bajo el proyecto Niwaki. El objetivo es ejecutar un modelo de arquitectura Mixture-of-Experts de gran tamano en Macs Apple Silicon con 24 GB de memoria unificada: el repositorio ocupa 29,5 GB en disco, pero el modelo mantiene en memoria unos 15 GB, gracias a que la tabla de embeddings n-gram de 14,4 GB permanece en disco y se lee segun la necesidad de cada token. La model card declara 119B parametros totales y unos 5,6B activos, mientras que los metadatos de los ficheros safetensors del repositorio informan de 59.164.945.763 parametros, una discrepancia que no se explica en la documentacion disponible.

La propuesta tecnica se basa en el pruning de expertos enrutados: los expertos se almacenan como codigos trellis a aproximadamente 1,5 bits por peso, en lugar de los codigos de retículo E8 a unos 2 bits de la version de 19 GB (v4.0). Esto reduce el almacenamiento de expertos a 11,9 GB, un 0,16x respecto al modelo de referencia (75,5 GB), a cambio de un aumento de perplejidad del 4-6% frente a la version de 19 GB. Frente a la version v2.4 de 102B, en cambio, mejora en perplejidad WikiText-2 (6,90 frente a 7,84), C4 (13,26 frente a 14,80), divergencia KL (0,83 frente a 0,96) y media de tareas (0,760 frente a 0,738).

El modelo es relevante ahora porque demuestra que la poda selectiva de expertos en un MoE permite reducir el espacio de trabajo hasta un 84% del almacenamiento de expertos sin colapsar el rendimiento en tareas de sentido comun, y manteniendo veinte idiomas dentro de un factor de 1,06-1,65x de la perplejidad del modelo sin podar. Su licencia es "other" y remite al fichero LICENSE de Qwen, y el autor anuncia la publicacion proxima de un paper con el metodo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) derivada de Qwen3.8-Flash-Next, con pruning de expertos enrutados y cuantizacion |
| Parametros totales | 59.164.945.763 segun los metadatos de safetensors del repositorio; la model card declara 119B totales (discrepancia no documentada) |
| Parametros activos | Aproximadamente 5,6B segun la model card |
| Longitud de contexto | No disponible como valor oficial; la model card indica prompts de hasta aproximadamente 8K tokens en un Mac de 24 GB con el limite de GPU por defecto |
| Tipos de cuantizacion | Base de 4 bits; expertos enrutados almacenados como codigos trellis a aproximadamente 1,5 bits por peso; referencia a codigos de reticulo E8 a unos 2 bits en la version v4.0 |
| Idiomas soportados | Veinte idiomas evaluados con FLORES-200: ingles, espanol, frances, aleman, ruso, chino, japones, coreano, arabe, hindi, punyabi, vietnamita, turco, azerbaiyano, griego, bielorruso, hebreo, malayalam, thai e islandes. Los metadatos de HuggingFace no declaran lista de idiomas |
| Licencia | other (license_link apunta a https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE) |
| Formato de pesos | safetensors en formato MLX (library_name: mlx), mas dos ficheros loader incluidos en el repositorio |
| Tamano del repositorio | 29,5 GB en disco; aproximadamente 15 GB residentes en memoria |
| Almacenamiento de expertos | 11,9 GB (0,16x respecto a los 75,5 GB del modelo de referencia) |
| Modelo base | mlx-community/Qwen3.8-Flash-Next-4bit |
| Libreria de ejecucion | mlx-vlm (version estandar) mas los dos ficheros loader del repositorio |
| Fecha de creacion | 2026-10-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una derivacion por poda y recuantizacion del checkpoint mlx-community/Qwen3.8-Flash-Next-4bit, que a su vez es la version cuantizada a 4 bits del Qwen3.8-Flash-Next original. La arquitectura de partida es un transformer con capas Mixture-of-Experts: las capas densas y el resto de componentes se conservan, mientras que el pruning actua sobre los expertos enrutados, que se recodifican con codigos trellis a aproximadamente 1,5 bits por peso. La model card indica que se mantienen "los mismos expertos, capas y todo lo demas" respecto a la version de 19 GB, cambiando unicamente el esquema de codificacion del almacenamiento de expertos (11,9 GB frente a 15,7 GB).

El autor no publica datos sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO, ya que el modelo no se reentrena: el trabajo se limita a la compresion del checkpoint existente. Tampoco se detalla el criterio exacto de seleccion de expertos podados ni el procedimiento de ajuste posterior a la cuantizacion. Se anuncia la publicacion de un paper con el metodo completo y las mediciones, pero no hay enlace disponible. La innovacion tecnica destacable es doble: el uso de codigos trellis a 1,5 bits para el almacenamiento de expertos y la estrategia de mantener la tabla de embeddings n-gram de 14,4 GB en disco con lectura bajo demanda, lo que permite que un repositorio de 29,5 GB funcione con unos 15 GB de memoria residente. La obtencion de respuestas se evalua tanto en modo directo como en modo "pensar primero", con diferencias de rendimiento entre ambos.

## Capacidades

- Generacion de texto y conversacion: pipeline declarado text-generation y tag conversational, con generaciones muestreadas de 600 tokens en prompts de codigo, razonamiento, chat y creatividad.
- Razonamiento sobre estado de programa: seguimiento de variables a traves de reasignaciones (0,93 / 0,97 en dos semillas), seguimiento con sentencias distractoras (0,95), aritmetica de dos pasos (0,91) y busquedas multi-hop (1,00).
- Aritmetica de dos pasos: 92,9% de acierto en 2.000 problemas generados de nuevo cuando el modelo "piensa primero"; el rendimiento baja cuando responde de forma directa, como se refleja en la generacion d2 minima de 0,47.
- Conocimiento de sentido comun y comprension lectora: evaluado en arc_easy (0,768), hellaswag (0,698), piqa (0,804), winogrande (0,664) y boolq (0,866).
- Capacidad multilingue: veinte idiomas evaluados en FLORES-200, con perplejidad relativa entre 1,06 (hindi) y 1,65 (islandes) respecto al modelo de referencia.
- Diversidad generativa: indice de bigramas distintos sobre el total de 0,80 de media y 0,47 en el minimo en la bateria de ocho prompts, interpretado por el autor como estadistico de diversidad y no como medida de calidad.
- Ejecucion en Apple Silicon mediante MLX: se ejecuta con mlx-vlm estandar mas los dos ficheros loader del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso en entornos externos: no disponible; solo se documentan tareas sinteticas de estado de programa.
- Capacidades de vision: no disponibles en la model card; el repositorio depende de mlx-vlm, biblioteca de vision-lenguaje, pero no se documenta ninguna tarea de vision.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional local en un Mac de 24 GB: el modelo cabe en unos 15 GB de memoria residente y admite prompts de hasta aproximadamente 8K tokens con el limite de GPU por defecto, lo que permite mantener conversaciones multi-turno con contexto amplio sin conexion a servicios externos ni coste por token.
- Procesamiento de documentos multilingues: con veinte idiomas evaluados en FLORES-200 y perplejidades relativas de 1,06-1,65x, es utilizable para resumir, clasificar o extraer informacion de textos en espanol, ingles, frances, aleman, chino, japones, coreano o arabe, asumiendo una degradacion moderada frente al modelo sin podar.
- Trabajo con datos sensibles sin salida a la red: al ejecutarse integramente en local sobre hardware Apple Silicon, encaja en flujos de analisis de documentacion legal, sanitaria o financiera donde no se permite enviar contenido a APIs externas.
- Analisis de trazas y depuracion de codigo: sus resultados de seguimiento de variables (0,93 / 0,97) y de busqueda multi-hop (1,00) lo hacen adecuado para razonar sobre el estado de un programa a lo largo de reasignaciones, por ejemplo para explicar por que una variable toma un valor inesperado en un fragmento de codigo.
- Generacion de borradores de codigo y texto creativo: el indice de diversidad de bigramas de 0,80 de media indica una salida poco repetitiva, util para producir borradores variados que luego se filtran o revisan.
- Investigacion sobre compresion de MoE: sirve como punto de comparacion reproducible para estudiar el compromiso entre bits por peso en expertos enrutados, perplejidad y rendimiento en tareas, gracias a que el autor publica tablas comparativas con las versiones 141B, 19GB y 102B medidas con el mismo protocolo.
- Despliegue en flotas de portatiles de desarrollo: al no requerir GPU dedicada ni servidor, puede distribuirse como herramienta interna en equipos Mac con 24 GB o mas de memoria unificada, siempre que se acepte el tamano de descarga de 29,5 GB por equipo.
- Evaluacion de robustez en aritmetica con modo de pensamiento: util para experimentar con estrategias de prompting que fuercen razonamiento previo, dado que el acierto en aritmetica de dos pasos pasa de 92,9% con pensamiento previo a valores notablemente inferiores en respuesta directa.

## Benchmarks y rendimiento

Protocolo declarado por el autor: perplejidad en WikiText-2 y C4 sobre 64 ventanas de 2.048 tokens (perdida en fp32, sin plantilla de chat); media de tareas sobre arc_easy, hellaswag, piqa, winogrande y boolq (zero-shot, 500 ejemplos cada una, los mismos ejemplos en todas las filas); divergencia KL de la distribucion del siguiente token respecto a la referencia sobre 16 ventanas de 2.048 tokens; generacion d2 a partir de una bateria de 8 prompts.

| Modelo | Tamano | Almacen. expertos | wt2 ppl (menor mejor) | C4 ppl (menor mejor) | KLD (menor mejor) | Media tareas (mayor mejor) | Generacion d2 (media/min) |
|---|---|---|---|---|---|---|---|
| Referencia Qwen3.8-Flash-Next (4-bit) | 111,5 GB | 75,5 GB | 5,06 | 10,97 | — | 0,759 | 0,78 / 0,62 |
| v4.0, 141B | 44,8 GB | 27,25 GB (0,36x) | 5,70 | 11,72 | 0,62 | 0,794 | 0,76 / 0,55 |
| v4.0, 19 GB | 33,3 GB | 15,7 GB (0,21x) | 6,51 | 12,76 | 0,78 | 0,765 | 0,79 / 0,53 |
| v2.4, 102B | 37,5 GB | 20,0 GB (0,26x) | 7,84 | 14,80 | 0,96 | 0,738 | 0,70 / 0,50 |
| Este modelo | 29,5 GB | 11,9 GB (0,16x) | 6,90 | 13,26 | 0,83 | 0,760 | 0,80 / 0,47 |

Desglose por tarea:

| Modelo | arc_easy | hellaswag | piqa | winogrande | boolq |
|---|---|---|---|---|---|
| Referencia (4-bit) | 0,770 | 0,756 | 0,854 | 0,682 | 0,732 |
| v4.0, 141B | 0,798 | 0,716 | 0,844 | 0,716 | 0,896 |
| v4.0, 19 GB | 0,768 | 0,708 | 0,822 | 0,700 | 0,826 |
| v2.4, 102B | 0,742 | 0,648 | 0,788 | 0,660 | 0,850 |
| Este modelo | 0,768 | 0,698 | 0,804 | 0,664 | 0,866 |

Comportamientos de estado de programa (suite sintetica de 964 elementos, eleccion forzada entre respuestas candidatas, medias sobre dos semillas):

| Modelo | Seguimiento de variables | Con distractores | Aritmetica de dos pasos | Multi-hop |
|---|---|---|---|---|
| Referencia (4-bit) | 0,95 / 0,96 | 0,96 | 0,91 | 1,00 |
| v4.0, 141B | 0,96 / 0,97 | 0,96 | 0,93 | 1,00 |
| v4.0, 19 GB | 0,95 / 0,97 | 0,96 | 0,88 | 1,00 |
| v2.4, 102B | 0,95 / 0,96 | 0,96 | 0,87 | 0,97 |
| Este modelo | 0,93 / 0,97 | 0,95 | 0,91 | 1,00 |

Perplejidad relativa por idioma en FLORES-200 (devtest, 1.012 frases por idioma en ventanas de 1.024 tokens, 1,00 equivale a no perder calidad):

| Modelo | Ingles | Espanol | Frances | Aleman | Ruso | Chino | Japones | Coreano | Arabe | Hindi |
|---|---|---|---|---|---|---|---|---|---|---|
| Este modelo | 1,31 | 1,28 | 1,25 | 1,29 | 1,33 | 1,31 | 1,36 | 1,40 | 1,36 | 1,06 |
| v4.0, 19 GB | 1,25 | 1,22 | 1,20 | 1,23 | 1,28 | 1,24 | 1,28 | 1,34 | 1,29 | 1,18 |
| v4.0, 141B | 1,14 | 1,11 | 1,08 | 1,10 | 1,13 | 1,11 | 1,13 | 1,15 | 1,12 | 1,12 |

Otros diez idiomas: punyabi 1,16, vietnamita 1,30, turco 1,32, azerbaiyano 1,35, griego 1,37, bielorruso 1,40, hebreo 1,42, malayalam 1,55, thai 1,64 e islandes 1,65. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Memoria: aproximadamente 15 GB residentes en memoria unificada, con un repositorio de 29,5 GB en disco (la tabla de embeddings n-gram de 14,4 GB se lee desde disco bajo demanda).
- Equipo minimo documentado: Mac Apple Silicon con 24 GB de memoria unificada, con prompts de hasta aproximadamente 8K tokens al limite de GPU por defecto.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles; el formato de pesos es MLX y no se documenta ejecucion en CUDA.
- VRAM estimada por cuantizacion: no disponible; la unica cifra publicada es el uso en memoria unificada de unos 15 GB con la cuantizacion de expertos a aproximadamente 1,5 bits por peso.
- Opciones de despliegue: mlx-vlm estandar junto con los dos ficheros loader incluidos en el repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se distribuyen pesos en GGUF.
- Latencia y throughput: no disponible.
- Almacenamiento adicional: hay que prever 29,5 GB libres por copia del modelo, mas el espacio de la cache de lectura de la tabla de embeddings.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano en disco | Almacen. expertos | wt2 ppl | Media tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Este modelo | 59.164.945.763 segun safetensors (119B / ~5,6B activos segun la model card) | 29,5 GB | 11,9 GB (0,16x) | 6,90 | 0,760 | other (licencia de Qwen) | Publicado en HuggingFace, 0 descargas |
| Niwaki v4.0, 141B | No disponible en la informacion | 44,8 GB | 27,25 GB (0,36x) | 5,70 | 0,794 | No disponible | Publicado en HuggingFace |
| Niwaki v4.0, 19 GB | No disponible en la informacion | 33,3 GB | 15,7 GB (0,21x) | 6,51 | 0,765 | No disponible | Publicado en HuggingFace |
| Niwaki v2.4, 102B (A5B, 3 bits) | 102B totales / 5B activos segun el nombre del repositorio | 37,5 GB | 20,0 GB (0,26x) | 7,84 | 0,738 | No disponible | Publicado en HuggingFace |
| Referencia Qwen3.8-Flash-Next (4-bit) | No disponible | 111,5 GB | 75,5 GB | 5,06 | 0,759 | Licencia de Qwen | Publicado en HuggingFace |

Frente a los modelos comparables de la misma familia, este modelo ofrece el menor consumo de disco (29,5 GB) y de almacenamiento de expertos (11,9 GB), a cambio de una perplejidad superior a la referencia y a las versiones v4.0, y con una media de tareas de 0,760 que iguala practicamente a la referencia (0,759). Comparado con v2.4 de 102B gana en todas las metricas de perplejidad, divergencia KL y media de tareas.

## Limitaciones y advertencias

- Discrepancia de parametros: los metadatos de safetensors indican 59.164.945.763 parametros mientras que la model card declara 119B totales; no se explica el motivo, por lo que conviene verificar el dato antes de citarlo.
- Perplejidad sistematicamente peor que el modelo sin podar: 6,90 frente a 5,06 en WikiText-2 y 13,26 frente a 10,97 en C4, con una divergencia KL de 0,83 respecto a la referencia.
- Degradacion multilingue: todos los idiomas evaluados pierden calidad, entre 1,06x y 1,65x de perplejidad relativa; islandes, thai y malayalam son los casos mas afectados.
- Razonamiento aritmetico fragil en respuesta directa: aunque con pensamiento previo alcanza el 92,9% en aritmetica de dos pasos, el minimo de la estadistica de generacion d2 baja a 0,47, lo que sugiere sensibilidad al formato de prompt.
- hellaswag, piqa y winogrande quedan por debajo del modelo de referencia, de modo que la media de tareas de 0,760 se sostiene principalmente por el resultado en boolq (0,866).
- Licencia "other" que remite al fichero LICENSE de Qwen; no se detallan en la informacion disponible las condiciones exactas para uso comercial, por lo que hay que revisar dicho fichero antes de un despliegue en produccion.
- Riesgo de alucinacion: no se publican evaluaciones de veracidad ni de tasas de alucinacion; el modelo no se ha reentrenado y hereda las caracteristicas del checkpoint base.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o seguridad.
- Dependencia de plataforma: solo se documenta ejecucion en Apple Silicon mediante MLX y mlx-vlm; no hay pesos GGUF ni soporte para vLLM, llama.cpp, Ollama o TGI.
- Madurez y validacion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de las metricas publicadas y con el paper del metodo aun pendiente de publicacion.
- Metodo incompleto: no se detalla el criterio de seleccion de expertos podados ni el proceso de ajuste posterior, lo que dificulta la reproducibilidad.
- Longitud de contexto: no se declara una ventana de contexto oficial; la referencia a aproximadamente 8K tokens corresponde al uso practico en un Mac de 24 GB con el limite de GPU por defecto, no necesariamente al maximo soportado por la arquitectura.
- Gestion de disco: la tabla de embeddings de 14,4 GB se lee desde disco; el rendimiento puede depender de la velocidad del almacenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neopolita/Niwaki-Flash-Next-15GB-v5.0-mlx
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Modelo base: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit
- Pagina del proyecto Niwaki: https://niwakiai.com/
- Version Niwaki v4.0 de 19 GB: https://huggingface.co/neopolita/Niwaki-Flash-Next-19GB-v4.0-mlx
- Version Niwaki v4.0 de 141B: https://huggingface.co/neopolita/Niwaki-Qwen3.8-Flash-Next-141B-A6B-v4.0-mlx
- Version Niwaki v2.4 de 102B (A5B, 3 bits): https://huggingface.co/neopolita/Qwen3.8-Flash-Next-102B-A5B-Niwaki-v2.4-3bit-mlx
- Paper con el metodo y las mediciones: anunciado como proximo, sin enlace disponible
- Repositorios de codigo, demos o blogs adicionales: no disponibles en la informacion proporcionada
