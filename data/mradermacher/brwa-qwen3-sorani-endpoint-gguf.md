# mradermacher/brwa-qwen3-sorani-endpoint-GGUF

## Resumen

brwa-qwen3-sorani-endpoint-GGUF es la version cuantizada en formato GGUF del modelo BRWA-AI/brwa-qwen3-sorani-endpoint, un sistema de reconocimiento automatico del habla (ASR) especializado en kurdo sorani (codigo de idioma ku, tambien etiquetado como ckb). La cuantizacion la ha realizado mradermacher, un autor conocido por publicar versiones GGUF de cientos de modelos para su uso con llama.cpp y herramientas compatibles. El modelo base esta construido sobre la arquitectura Qwen3-ASR, como indican las etiquetas qwen3-asr del repositorio, y cuenta con 1.720.574.976 parametros segun los pesos en safetensors del modelo original.

El interes principal de esta ficha es doble. Por un lado, se trata de un modelo orientado a un idioma de bajos recursos como el kurdo sorani, para el que existen pocas alternativas de ASR de codigo abierto con licencia permisiva. Por otro, el repositorio incluye ficheros mmproj (proyeccion multimodal) en Q8_0 y f16, lo que confirma que el modelo combina un codificador de audio con un decodificador de tipo transformer de lenguaje, y que puede ejecutarse en llama.cpp con soporte multimodal de audio.

La version GGUF es relevante porque permite desplegar el modelo en hardware de consumo, sin GPU de datacenter: la cuantizacion Q4_K_M ocupa 1,2 GB y la f16 completa 3,5 GB, a lo que hay que anadir entre 0,5 y 0,7 GB del fichero mmproj. No obstante, el repositorio no publica resultados de benchmarks, ni longitud de contexto, ni detalles del dataset de entrenamiento, por lo que la evaluacion de calidad debe hacerse de forma empirica sobre el dominio de uso previsto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal para ASR: codificador de audio mas decodificador de lenguaje, basado en Qwen3-ASR (detalle exacto no disponible) |
| Parametros totales | 1.720.574.976 (segun safetensors del modelo base) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ficheros mmproj en Q8_0 y f16 |
| Idiomas soportados | Kurdo sorani (ku / ckb) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 17,0 GB |
| Pipeline declarado | automatic-speech-recognition |
| Etiquetas adicionales | endpoints_compatible, conversational, low-resource-language, base_model:quantized |
| Fecha de creacion | 22 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion publicada no describe la arquitectura en detalle. Las etiquetas del repositorio (qwen3-asr) y la presencia de ficheros mmproj apuntan a un diseno de dos componentes: un codificador acustico que transforma la senal de audio en representaciones, y un decodificador autorregresivo de la familia Qwen3 que genera el texto. El fichero mmproj actua como proyector que adapta las representaciones de audio al espacio de embeddings del decodificador, un esquema habitual en los modelos multimodales soportados por llama.cpp.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas concretas (decodificacion especulativa, atencion lineal, streaming real por ventanas, etc.). El sufijo "endpoint" del nombre del modelo base sugiere un uso orientado a servicio o inferencia en linea, pero no se aporta documentacion que lo confirme. Tampoco se especifica si las cuantizaciones son estaticas o ponderadas por matriz de importancia (imatrix): el propio autor indica que las versiones ponderadas no estan disponibles en el momento de la publicacion.

## Capacidades

- Reconocimiento automatico del habla en kurdo sorani: transcripcion de audio a texto en el dialecto sorani, con salida conversacional segun las etiquetas del repositorio.
- Procesamiento multimodal de audio: el modelo requiere cargar el fichero mmproj junto con el GGUF para poder procesar la entrada de audio en llama.cpp.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que puede exponerse detras de una API compatible con los endpoints de HuggingFace en el ecosistema de despliegue.
- Ejecucion local sin GPU de datacenter: las cuantizaciones de menor tamano permiten inferencia en CPU y en GPUs de consumo.
- Idioma unico documentado (ku): no hay evidencia en la informacion disponible de capacidades multilingues, de traduccion o de generacion de texto general.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio generativo.

## Casos de uso

- Digitalizacion de archivos audiovisuales en kurdo sorani: transcripcion masiva de grabaciones historicas, entrevistas o emisiones de radio y television, ejecutando el modelo en lote sobre CPU con la cuantizacion Q4_K_M para reducir coste por hora de audio.
- Subtitulado automatico de video: generacion de pistas de subtitulos en sorani para plataformas de video, con posterior revision humana dado que no hay benchmarks publicados que garanticen la precision.
- Atencion al cliente en centros de contacto kurdo-parlantes: transcripcion de llamadas grabadas para su analisis posterior (categorizacion de motivos, control de calidad, busqueda de texto completo) usando la cuantizacion Q8_0 en una GPU de gama media.
- Asistentes de voz y comandos por voz en sorani: integracion del modelo como modulo ASR de un pipeline de voz local, aprovechando que cabe en GPUs de consumo y que puede ejecutarse integramente en la maquina del usuario.
- Aplicaciones de accesibilidad para personas con discapacidad auditiva: conversion en tiempo casi real de conversaciones presenciales o de aula a texto en kurdo sorani, con latencia dependiente del hardware empleado.
- Investigacion en linguistica y preservacion de lenguas de bajos recursos: generacion de corpus transcritos en sorani para entrenar modelos posteriores, asi como evaluacion comparativa frente a sistemas multilingues genericos.
- Documentacion clinica y administrativa dictada: transcripcion de notas de voz en entornos donde el personal trabaja en sorani, con despliegue en servidor local para no enviar datos sensibles a servicios en la nube.
- Prototipado rapido con Ollama o llama.cpp: gracias al formato GGUF y a los ficheros mmproj, es posible tener una demo funcional de ASR en sorani con una descarga inferior a 2 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del modelo cuantizado no incluye tablas de WER (word error rate), CER, MMLU, HumanEval ni de ningun otro conjunto de evaluacion, y la model card del modelo base tampoco se ha facilitado en la informacion proporcionada. La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden a una tienda de articulos deportivos y no guardan relacion con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas proyector multimodal, sin contar cache KV ni buffers de audio):
  - Q2_K (0,9 GB) + mmproj Q8_0 (0,5 GB): aproximadamente 1,4 GB.
  - Q4_K_M o Q4_K_S (1,2 GB) + mmproj Q8_0 (0,5 GB): aproximadamente 1,7 GB.
  - Q8_0 (1,9 GB) + mmproj Q8_0 (0,5 GB): aproximadamente 2,4 GB.
  - f16 (3,5 GB) + mmproj f16 (0,7 GB): aproximadamente 4,2 GB.
- Cabe holgadamente en GPU de consumo: tarjetas con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 2070, GTX 1660 Super con cuantizaciones bajas) pueden alojar el modelo completo, incluido el proyector de audio.
- GPU profesionales (A100, H100, L40S) no son necesarias para este tamano; solo tendrian sentido para servir muchas peticiones concurrentes o para lote masivo.
- Tambien es viable la inferencia en CPU con llama.cpp, especialmente con Q4_K_M o Q2_K, aunque la latencia dependera del numero de nucleos disponibles.
- Opciones de despliegue: llama.cpp y sus envoltorios (llama-server, Ollama, LM Studio), siempre que la version utilizada soporte entrada de audio con ficheros mmproj. Para el modelo base en safetensors, transformers con el pipeline automatic-speech-recognition. vLLM y TGI no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas para ningun hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparacion se limita a caracteristicas estructurales. Los datos de los modelos alternativos corresponden a su documentacion publica y no a una evaluacion conjunta.

| Modelo | Parametros | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| brwa-qwen3-sorani-endpoint (GGUF) | 1,72 mil millones | Kurdo sorani (ku / ckb) | Apache 2.0 | GGUF y safetensors | ASR especializado en una lengua de bajos recursos |
| Whisper large-v3 | Aproximadamente 1,55 mil millones | Multilingue (decenas de idiomas) | MIT | safetensors, GGUF, otros | ASR multilingue de proposito general |
| Whisper medium | Aproximadamente 769 millones | Multilingue | MIT | safetensors, GGUF, otros | ASR multilingue de menor coste |
| MMS / wav2vec2 para kurdo | Variable segun checkpoint | Kurdo y otras lenguas | Variable (a menudo CC-BY-NC o Apache 2.0) | safetensors, otros | Modelos acusticos por idioma |

La ventaja estructural de este modelo es la licencia Apache 2.0 combinada con un enfoque especifico en sorani y un formato GGUF listo para ejecucion local. La desventaja es la ausencia total de datos de calidad publicados: no es posible afirmar que supere a Whisper large-v3 en sorani sin una evaluacion propia con un conjunto de test representativo.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay ninguna cifra publica de WER ni de CER, ni para el modelo base ni para las cuantizaciones. Cualquier decision de produccion deberia ir precedida de una evaluacion con audio propio del dominio objetivo.
- Modelo de un solo idioma: las etiquetas y el campo language solo declaran kurdo (ku). No hay evidencia de soporte multilingue ni de cambio de idioma dentro de una misma grabacion.
- Riesgo de alucinacion en ASR: es habitual que los modelos de reconocimiento de voz generen texto plausible cuando la entrada es silencio, ruido o habla solapada. No se documenta ningun mecanismo de mitigacion.
- Longitud de contexto no documentada: se desconoce la duracion maxima de audio que el modelo procesa de una sola vez, lo que obliga a segmentar manualmente los ficheros largos.
- Calidad variable segun la cuantizacion: el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S, Q4_K_M y Q8_0. Las cuantizaciones de 2 y 3 bits pueden degradar notablemente la transcripcion.
- Función de los ficheros mmproj: sin cargar el proyector multimodal, el modelo no podra procesar audio; hay que seleccionar la variante compatible con la version de llama.cpp empleada.
- Requisitos de la licencia: Apache 2.0 permite uso comercial y modificacion, pero exige conservar el aviso de licencia y el fichero NOTICE si existe, ademas de indicar los cambios realizados.
- Trazabilidad limitada: la model card del repositorio es una plantilla generada automaticamente por la herramienta de cuantizacion, sin informacion sobre datos de entrenamiento, sesgos o procedencia del corpus de audio.
- Sesgos potenciales: el corpus de entrenamiento no esta documentado, por lo que pueden existir sesgos de dialecto, genero, edad o registro dentro del propio sorani.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, asi que no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/mradermacher/brwa-qwen3-sorani-endpoint-GGUF
- Modelo base: https://huggingface.co/BRWA-AI/brwa-qwen3-sorani-endpoint
- Pagina de resumen y descargas del autor para este modelo: https://hf.tst.eu/model#brwa-qwen3-sorani-endpoint-GGUF
- Ficheros GGUF (ejemplo Q4_K_M): https://huggingface.co/mradermacher/brwa-qwen3-sorani-endpoint-GGUF/resolve/main/brwa-qwen3-sorani-endpoint.Q4_K_M.gguf
- Proyector multimodal Q8_0: https://huggingface.co/mradermacher/brwa-qwen3-sorani-endpoint-GGUF/resolve/main/brwa-qwen3-sorani-endpoint.mmproj-Q8_0.gguf
- Proyector multimodal f16: https://huggingface.co/mradermacher/brwa-qwen3-sorani-endpoint-GGUF/resolve/main/brwa-qwen3-sorani-endpoint.mmproj-f16.gguf
- Guia de uso de ficheros GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos y preguntas frecuentes del autor: https://huggingface.co/mradermacher/model_requests
- Empresa que cede la infraestructura al autor: https://www.nethype.de/
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a un comercio de articulos deportivos y se han descartado.
