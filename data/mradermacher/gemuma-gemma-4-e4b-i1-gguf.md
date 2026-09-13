# mradermacher/gemuma-gemma-4-E4B-i1-GGUF

## Resumen

`mradermacher/gemuma-gemma-4-E4B-i1-GGUF` es un repositorio de cuantizaciones GGUF generadas con imatrix (calibración ponderada) a partir del modelo `Warspoot/gemuma-gemma-4-E4B`. El trabajo de cuantización lo firma mradermacher, un autor habitual de publicaciones GGUF de terceros, y su objetivo es permitir la ejecución local del modelo base en hardware de gama media mediante formatos comprimidos de 4,5 a 5,3 GB por fichero.

El modelo subyacente declara 7.518.069.290 parámetros (unos 7,5 mil millones) y el repositorio ocupa 14,3 GB en total. La licencia es Apache 2.0, los idiomas declarados en las etiquetas son japonés (ja) e inglés (en), y la etiqueta principal es `conversational`, orientada a diálogo. La model card del cuantizador indica además que se trata de un modelo con capacidades de visión, cuyos ficheros `mmproj` se publican, si existen, en un repositorio hermano de cuantizaciones estáticas.

La relevancia de esta ficha es práctica: se trata de un artefacto de despliegue, no de un modelo nuevo. Su interés radica en que permite probar el modelo base en equipos con GPU de consumo o incluso en CPU, pero con una tracción mínima (0 descargas y 1 like en el momento de la consulta) y sin benchmarks publicados, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la informacion proporcionada no especifica transformer, MoE ni arquitectura hibrida) |
| Parametros totales | 7.518.069.290 (dato reportado por la API de HuggingFace) |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 con imatrix: i1-Q2_K (4,5 GB), i1-IQ3_M (4,8 GB), i1-Q4_K_S (5,3 GB). La lista de cuantizaciones planificadas en los metadatos incluye ademas Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, Q4_0, Q4_1, IQ4_XS, small-IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | japones (ja) e ingles (en), segun las etiquetas del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en los materiales proporcionados. El repositorio es exclusivamente un artefacto de cuantizacion: no incluye descripcion de la arquitectura, del numero de tokens de entrenamiento, de la composicion del dataset ni de las fases de ajuste (RLHF, DPO u otras). Tampoco se detalla si el modelo base es un transformer denso, un MoE o una arquitectura hibrida, ni si emplea tecnicas como atencion lineal o decodificacion especulativa.

La innovacion tecnica destacable de este repositorio es el uso de cuantizacion **i1 con imatrix**, una variante que emplea una matriz de importancia (importancia ponderada por activaciones recogidas sobre un corpus de calibracion) para decidir que pesos se cuantizan con mayor o menor precision. El autor incluye el propio fichero imatrix (`gemuma-gemma-4-E4B.imatrix.gguf`, 0,1 GB) para que otros puedan generar sus propias cuantizaciones. La model card recomienda IQ3_XXS frente a Q2_K y senala i1-Q4_K_S como el punto optimo entre tamano, velocidad y calidad, citando el grafico comparativo de perplejidad de ikawrakow y el analisis de Artefact2 sobre tipos de cuantizacion. No se especifica el corpus de calibracion empleado ni el numero de tokens de calibracion.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica que el modelo esta orientado a dialogos de varios turnos.
- Capacidades de vision: la model card del cuantizador afirma explicitamente "This is a vision model"; los ficheros `mmproj` necesarios para procesar imagenes, si existen, se alojan en el repositorio de cuantizaciones estaticas y no en este.
- Multilinguismo limitado a japones e ingles segun las etiquetas declaradas; no hay informacion sobre el resto de idiomas que pudiera soportar el modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.
- Razonamiento matematico y generacion de codigo: no disponible (sin benchmarks ni declaracion explicita).

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: con las cuantizaciones i1-Q2_K (4,5 GB) o i1-IQ3_M (4,8 GB), el modelo puede ejecutarse en CPU mediante llama.cpp u Ollama, lo que permite prototipar asistentes conversacionales en equipos de oficina. Es adecuado por el reducido peso de los ficheros, aunque la calidad se degrada mas que en Q4_K_S.
- Asistente conversacional en japones sobre GPU de consumo: un modelo de 7,5 mil millones de parametros cuantizado a Q4_K_S ocupa 5,3 GB, lo que permite mantener el modelo completo en VRAM en GPUs de 8-12 GB (por ejemplo RTX 3060 12 GB o RTX 4060 Ti 16 GB) y atender conversaciones multi-turno con latencia interactiva.
- Procesamiento de documentos con imagenes (OCR asistido, descripcion de capturas) en ingles y japones: si se confirma el soporte de vision, se podria desplegar junto con el fichero `mmproj` del repositorio estatico para tareas de extraccion o resumen de contenido visual en local, sin enviar datos a APIs externas.
- Chatbot interno para equipos japoneses: dado que el modelo declara soporte de japones, encaja en escenarios de atencion interna o busqueda asistida sobre documentacion corporativa en ese idioma, con el incentivo de que la licencia Apache 2.0 permite uso comercial.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye el fichero imatrix y varias cuantizaciones del mismo modelo, lo que lo convierte en un banco de pruebas util para medir la degradacion de perplejidad entre IQ2, Q2, IQ3 y Q4_K_S en un mismo modelo base.
- Servicio de inferencia autocontenido en edge o en entornos con requisitos de soberania de datos: al ser GGUF ejecutable sin dependencias de nube, se puede desplegar en un contenedor con llama.cpp o en un servidor TGI/vLLM compatible con GGUF, evitando la salida de datos sensibles.
- Traduccion y asistencia de redaccion japones-ingles: el par de idiomas declarado permite usarlo como ayuda de traduccion o de redaccion bilingue en documentacion tecnica, siempre que se valide la calidad con pruebas propias.
- Fine-tuning posterior o destilacion sobre la variante cuantizada para prototipos: menos recomendable tecnicamente, pero util para experimentacion docente sobre formatos GGUF y despliegue en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion, y tampoco se han encontrado datos de evaluacion en la busqueda web realizada. El unico dato de rendimiento indirecto son los tamanos de fichero y la recomendacion cualitativa del autor (i1-Q4_K_S como mejor relacion tamano/velocidad/calidad), sin cifras de perplejidad ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar cache KV ni overhead del runtime): i1-Q2_K, 4,5 GB; i1-IQ3_M, 4,8 GB; i1-Q4_K_S, 5,3 GB. En la practica, anade entre 0,5 y 2 GB adicionales segun la longitud de contexto y el backend.
- Comparativa con el modelo sin cuantizar: 7.518.069.290 parametros en FP16 equivalen a unos 15 GB solo de pesos, mas cache KV.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4070 Ti para las cuantizaciones de 4-5 GB con contexto moderado; A100, H100 o L40S si se despliega el modelo base sin cuantizar o se sirven multiples replicas.
- Cabe en GPU de consumo: si, con las tres cuantizaciones listadas (i1-Q2_K, i1-IQ3_M, i1-Q4_K_S) en tarjetas de 8 GB o mas. Con 6 GB de VRAM es probable que sea necesario descargar capas a CPU.
- Ejecucion en CPU: viable con llama.cpp y el fichero imatrix o las cuantizaciones i1; el rendimiento dependera del ancho de banda de memoria del sistema.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la libreria declarada en el repositorio es `transformers`, y las etiquetas incluyen `endpoints_compatible`, por lo que tambien es apto para endpoints de inferencia gestionados. vLLM y TGI solo son aplicables si soportan el formato GGUF en la version desplegada.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/gemuma-gemma-4-E4B-i1-GGUF (este) | 7.518.069.290 | GGUF con imatrix (i1) | no disponible | apache-2.0 | 0 descargas, 1 like |
| Warspoot/gemuma-gemma-4-E4B (modelo base) | 7.518.069.290 | safetensors | no disponible | apache-2.0 | repositorio original del autor del modelo |
| mradermacher/gemuma-gemma-4-E4B-GGUF (cuantizaciones estaticas) | 7.518.069.290 (mismo modelo base) | GGUF estatico, incluye ficheros `mmproj` si existen | no disponible | apache-2.0 | repositorio hermano del mismo autor |

No se dispone de datos de modelos de terceros comparables (mismo tamano o misma tarea) en la informacion proporcionada; no se han encontrado evaluaciones cruzadas ni referencias a alternativas en la busqueda realizada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay metricas publicadas de MMLU, HumanEval, GSM8K ni de calidad conversacional, por lo que el rendimiento real es desconocido.
- Traccion minima: 0 descargas y 1 like en el momento de la consulta, lo que implica una validacion practicamente nula por parte de la comunidad.
- Riesgo de degradacion por cuantizacion: las cuantizaciones de 2 bits (i1-Q2_K) y las variantes IQ1/IQ2 disponibles en el catalogo de metadatos conllevan perdidas notables de calidad; el propio autor desaconseja Q2_K en favor de IQ3_XXS. Se recomienda i1-Q4_K_S o superior para uso serio.
- Calibracion imatrix opaca: no se especifica el corpus de calibracion ni el numero de tokens usados, lo que impide evaluar si la matriz de importancia esta sesgada hacia un dominio concreto (por ejemplo, codigo o conversacion generica).
- Vision condicionada: el soporte multimodal se afirma en la model card, pero los ficheros `mmproj` no estan en este repositorio; hay que descargarlos del repositorio estatico y verificar que corresponden al mismo modelo base.
- Cobertura idiomatica limitada segun etiquetas: solo japones e ingles. El rendimiento en castellano u otros idiomas no esta declarado ni medido.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no hay evaluaciones de fidelidad ni de tasas de alucinacion.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, pero conviene verificar los terminos del modelo base `Warspoot/gemuma-gemma-4-E4B` y de la familia original de la que derive, ya que el cuantizador no es el titular de los derechos del modelo.
- Artefacto derivado: cualquier problema de sesgo, toxicidad o calidad proviene del modelo base, no de la cuantizacion; este repositorio no documenta ningun proceso de alineacion ni de filtrado adicional.
- Longitud de contexto desconocida: no se puede planificar el uso en escenarios de contexto largo sin verificar experimentalmente el limite real soportado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemuma-gemma-4-E4B-i1-GGUF
- Modelo base: https://huggingface.co/Warspoot/gemuma-gemma-4-E4B
- Cuantizaciones estaticas del mismo modelo (incluye `mmproj` si existen): https://huggingface.co/mradermacher/gemuma-gemma-4-E4B-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/gemuma-gemma-4-E4B-i1-GGUF/resolve/main/gemuma-gemma-4-E4B.imatrix.gguf
- Cuantizacion i1-Q2_K: https://huggingface.co/mradermacher/gemuma-gemma-4-E4B-i1-GGUF/resolve/main/gemuma-gemma-4-E4B.i1-Q2_K.gguf
- Cuantizacion i1-IQ3_M: https://huggingface.co/mradermacher/gemuma-gemma-4-E4B-i1-GGUF/resolve/main/gemuma-gemma-4-E4B.i1-IQ3_M.gguf
- Cuantizacion i1-Q4_K_S: https://huggingface.co/mradermacher/gemuma-gemma-4-E4B-i1-GGUF/resolve/main/gemuma-gemma-4-E4B.i1-Q4_K_S.gguf
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#gemuma-gemma-4-E4B-i1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF citada en la model card (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
