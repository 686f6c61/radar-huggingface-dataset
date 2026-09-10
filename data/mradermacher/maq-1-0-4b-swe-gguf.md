# mradermacher/Maq-1.0-4B-SWE-GGUF

## Resumen

Maq-1.0-4B-SWE-GGUF es la versión cuantizada en formato GGUF del modelo WaylonJBrown/Maq-1.0-4B-SWE, publicada por el usuario mradermacher, especializado en generar cuantizaciones estáticas de modelos abiertos. Se trata de un modelo afinado para ingeniería de software y flujos agénticos: las etiquetas del repositorio indican que parte de la familia Gemma (tags `gemma` y `gemma4`) y que se ha entrenado mediante LoRA y SFT sobre datos de código y resolución de tareas SWE (`code`, `swe`, `agentic`, `software-engineering`). Su propósito es servir como motor local para asistentes de programación y agentes que operan sobre repositorios sin depender de APIs externas.

El repositorio ofrece un conjunto amplio de cuantizaciones (desde Q2_K de 4,5 GB hasta f16 de 15,0 GB), lo que permite desplegarlo tanto en portátiles con GPU de gama media como en estaciones de trabajo. Incluye además dos ficheros `mmproj` (proyector multimodal en Q8_0 y f16), lo que indica que el modelo base incorpora entrada multimodal, presumiblemente visión, aunque la model card no lo describe explícitamente.

Es relevante ahora porque cubre un nicho concreto —modelos pequeños orientados a tareas de software engineering ejecutables en local— con licencia Apache 2.0, lo que facilita su integración en productos comerciales. Como contrapartida, el modelo tiene cero descargas y cero valoraciones en el momento de la consulta, solo soporta inglés y no publica resultados de benchmarks, por lo que su calidad real debe validarse de forma empírica. Existe además una discrepancia entre el nombre ("4B") y el recuento de parámetros de los safetensors del repositorio (7.463.013.674), que conviene tener en cuenta al planificar el hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma, segun las etiquetas del repositorio (`gemma`, `gemma4`); la model card no detalla la configuracion de capas ni atencion |
| Parametros totales | 7.463.013.674 (recuento de safetensors del repositorio); el nombre del modelo indica "4B", discrepancia no aclarada por el autor |
| Parametros activos | no disponible (no se ha publicado que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mas proyectores multimodales mmproj-Q8_0 y mmproj-f16. Solo cuantizaciones estaticas, sin variantes imatrix/weighted |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (libreria declarada: transformers; compatible con endpoints) |
| Autor de la cuantizacion | mradermacher |
| Modelo base | WaylonJBrown/Maq-1.0-4B-SWE |
| Tamano del repositorio | 76,4 GB |
| Fecha de publicacion | 2026-09-10 (actualizado el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de las etiquetas del repositorio, que apuntan a la familia Gemma (`gemma4`, `gemma`). El modelo base fue adaptado mediante LoRA y posteriormente sometido a un proceso de SFT (supervised fine-tuning) orientado a codigo y a tareas de ingenieria de software de tipo agente. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documenta el contexto nativo del modelo, dato critico para planificar tareas agentycas de varios pasos.

Esta publicacion es unicamente una recuantizacion: mradermacher convierte los pesos del modelo base a GGUF con cuantizacion estatica (los ficheros `mmproj` indican que el modelo original admite entradas multimodales, probablemente imagenes, ademas de texto). El autor advierte de que las cuantizaciones ponderadas o con imatrix no estan disponibles en el momento de la publicacion y que pueden solicitarse abriendo una discusion en la comunidad del repositorio. Para el uso practico, esto implica que en los niveles mas bajos (Q2_K, Q3_K_S, Q3_K_M) la perdida de calidad puede ser mayor que en cuantizaciones imatrix equivalentes.

## Capacidades

- Generacion de codigo en ingles para tareas de programacion general, con enfasis declarado en ingenieria de software (`code`, `swe`).
- Resolucion de tareas de software engineering de tipo agente: el etiquetado `agentic` sugiere entrenamiento orientado a flujos de varios pasos sobre repositorios.
- Uso conversacional: el repositorio se marca como `conversational` y compatible con endpoints.
- Entrada multimodal: la presencia de ficheros `mmproj` en Q8_0 y f16 indica soporte de proyector multimodal en el modelo base; la model card no detalla que modalidades concretas ni como activarlas.
- Soporte de tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidades multilingues: limitadas al ingles (`language: en`).
- No se documentan capacidades especificas de matematicas, audio o vision mas alla del proyector multimodal.

## Casos de uso

- Agente de resolucion de issues en local: el modelo puede integrarse en un bucle agente que lea un repositorio, localice el fichero afectado y proponga un parche, ejecutandose en una GPU de consumo gracias a las cuantizaciones Q4_K_M (5,4 GB) y Q5_K_M (5,8 GB). Es adecuado por su orientacion declarada a SWE y su bajo coste de despliegue, aunque la ausencia de benchmarks obliga a medir la tasa de exito real.
- Asistente de codigo dentro del IDE sin conexion: al ser un GGUF ejecutable con llama.cpp u Ollama, permite autocompletado y explicaciones de codigo en entornos con requisitos de confidencialidad, sin enviar codigo propiedad a servicios externos.
- Revision automatizada de pull requests: el modelo puede resumir diffs y senalar posibles errores en un pipeline de CI, ejecutandose en el mismo runner o en un servidor interno con una unica GPU.
- Generacion de tests unitarios y de regresion: a partir de una funcion o de un fichero, el modelo produce casos de prueba en el lenguaje del proyecto, tarea repetitiva y bien acotada que encaja con un modelo de este tamano.
- Refactorizacion y migracion de codigo por lotes: procesar cientos de ficheros para actualizar APIs obsoletas o aplicar convenciones de estilo, aprovechando el throughput de las cuantizaciones Q4/Q5 en GPUs de gama media.
- Documentacion tecnica de base de codigo: generar docstrings, README y descripciones de modulos a partir del codigo fuente, en ingles, idioma para el que esta entrenado el modelo.
- Extraccion de informacion de diagramas o capturas de pantalla: si se activa el proyector multimodal (`mmproj`), el modelo podria procesar diagramas de arquitectura o capturas de errores junto con texto, aunque esta capacidad no esta documentada por el autor y requiere validacion previa.
- Despliegue en portatiles sin GPU dedicada: la variante Q2_K (4,5 GB) o Q3_K_S (4,7 GB) permite ejecucion en CPU con llama.cpp para tareas puntuales de asistencia, asumiendo menor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los tamanos de fichero son datos del repositorio; las cifras de VRAM son estimaciones de ingenieria que anaden margen para cache KV y overhead del runtime.

| Cuantizacion | Tamano del fichero | VRAM estimada (inferencia) |
|---|---|---|
| Q2_K | 4,5 GB | ~6 GB |
| Q3_K_S | 4,7 GB | ~6 GB |
| Q3_K_M | 4,9 GB | ~6,5 GB |
| Q3_K_L | 5,1 GB | ~6,5 GB |
| IQ4_XS | 5,2 GB | ~7 GB |
| Q4_K_S | 5,3 GB | ~7 GB |
| Q4_K_M | 5,4 GB | ~7 GB |
| Q5_K_S | 5,7 GB | ~7,5 GB |
| Q5_K_M | 5,8 GB | ~7,5 GB |
| Q6_K | 6,3 GB | ~8 GB |
| Q8_0 | 8,1 GB | ~10 GB |
| f16 | 15,0 GB | ~17 GB |
| mmproj-Q8_0 | 0,7 GB | se suma a la VRAM del modelo |
| mmproj-f16 | 1,1 GB | se suma a la VRAM del modelo |

- Cabe en GPU de consumo: si. Q4_K_M (5,4 GB) y Q5_K_M (5,8 GB) entran en GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) con contexto moderado; Q6_K y Q8_0 requieren 10-12 GB (RTX 3080, RTX 4070 Ti, RTX 4080).
- GPU recomendadas: RTX 4090 o RTX 3090 para Q8_0/f16 con contexto largo; A100 o H100 solo si se busca throughput agregado en servidor; gama media (RTX 4070, RTX 3080) para Q4/Q5.
- Ejecucion en CPU: viable con Q2_K a Q4_K_M mediante llama.cpp, con velocidad dependiente del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El repositorio no incluye pesos safetensors, por lo que vLLM o TGI requeririan convertir el GGUF o usar el modelo base original.
- Latencia y throughput: no disponible (ningun dato publicado).

## Comparativa con modelos similares

La comparacion se limita a especificaciones publicas de las respectivas model cards; no hay datos de benchmarks de Maq-1.0-4B-SWE, por lo que no es posible comparar calidad.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato / disponibilidad |
|---|---|---|---|---|---|
| Maq-1.0-4B-SWE-GGUF | 7,46 B (segun safetensors; nombre indica "4B") | no disponible | Apache 2.0 | en | GGUF (12 cuantizaciones + mmproj) |
| Qwen2.5-Coder-7B-Instruct | 7,6 B (aprox.) | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | multilingue | safetensors y multiples GGUF de terceros |
| DeepSeek-Coder-V2-Lite-Instruct | 16 B totales, 2,4 B activos (MoE) | 128.000 tokens | MIT (con condiciones de uso) | multilingue en codigo | safetensors y GGUF de terceros |
| Granite-8b-code-instruct | 8 B (aprox.) | 128.000 tokens | Apache 2.0 | multilingue en codigo | safetensors y GGUF |

Diferencias clave: Maq-1.0-4B-SWE esta especializado en tareas agentycas de ingenieria de software y solo soporta ingles, mientras que las alternativas cubren contexto mucho mas largo (32k-128k) y son multilingues. La ventaja de Maq es el despliegue ligero con cuantizaciones pequenas y licencia permisiva; su desventaja principal es la ausencia total de datos de rendimiento publicados y de validacion por parte de la comunidad.

## Limitaciones y advertencias

- Solo soporta ingles (`language: en`), lo que limita su uso en proyectos con documentacion, comentarios o requisitos en castellano.
- No se han publicado benchmarks ni evaluaciones independientes; el repositorio tiene 0 descargas y 0 likes, por lo que no existe evidencia publica de su calidad en tareas SWE reales.
- Discrepancia de parametros: el nombre indica "4B" pero el recuento de safetensors es de 7.463.013.674. Conviene verificar el modelo base antes de dimensionar infraestructura.
- Solo hay cuantizaciones estaticas, sin variantes imatrix/weighted. En los niveles bajos (Q2_K, Q3_K_S, Q3_K_M) la degradacion de calidad puede ser notable; el propio autor marca Q3_K_M como "lower quality".
- Riesgo de alucinacion elevado en tareas de codigo complejas: se trata de un modelo de menos de 10.000 millones de parametros, sin contexto documentado y sin datos de entrenamiento publicados que permitan acotar su fiabilidad.
- Longitud de contexto desconocida: no se puede garantizar el procesamiento de repositorios grandes o conversaciones multi-turno largas.
- El soporte multimodal depende de cargar los ficheros `mmproj` por separado y no esta documentado; no debe asumirse que funciona sin pruebas.
- Licencia Apache 2.0 en el repositorio de cuantizacion: es permisiva y permite uso comercial, pero conviene verificar tambien la licencia y las condiciones del modelo base WaylonJBrown/Maq-1.0-4B-SWE y de los datos de entrenamiento (no documentadas en la informacion disponible).
- Modelo no apto como unica salvaguarda en produccion sin evaluacion previa en el dominio concreto: no hay datos de sesgos, ni de robustez frente a prompts maliciosos, ni de comportamiento en tareas fuera de la programacion.
- Si se requiere compatibilidad con vLLM o TGI, sera necesario partir del modelo base en safetensors o convertir el GGUF.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Maq-1.0-4B-SWE-GGUF
- Modelo base: https://huggingface.co/WaylonJBrown/Maq-1.0-4B-SWE
- Pagina resumen del cuantizador para este modelo: https://hf.tst.eu/model#Maq-1.0-4B-SWE-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de los recursos de cuantizacion: https://www.nethype.de/
- No se han encontrado en la busqueda web enlaces adicionales relevantes sobre este modelo (los resultados devueltos correspondian a listados de hoteles y no guardan relacion).
