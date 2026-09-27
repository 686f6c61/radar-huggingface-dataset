# mradermacher/Orythos-9B-i1-GGUF

## Resumen

Orythos-9B-i1-GGUF es un repositorio de cuantizaciones GGUF del modelo CloudGoat/Orythos-9B, publicado por el cuantizador mradermacher. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversión a formato GGUF con cuantizaciones de tipo i1 (imatrix) generadas con la herramienta de llama.cpp, pensadas para ejecución local en CPU y GPU con consumidores como llama.cpp, Ollama o LM Studio. El modelo original es, a su vez, un merge construido con mergekit, según la propia model card.

El modelo subyacente tiene 8.953.803.264 parámetros (unos 8,95 mil millones) y está etiquetado como monolingüe en inglés, con orientación conversacional. El repositorio ofrece 25 cuantizaciones distintas más el fichero imatrix, desde i1-IQ1_S (2,8 GB) hasta i1-Q6_K (7,5 GB), lo que permite desplegarlo en hardware muy diverso, desde portátiles con GPU integrada hasta estaciones de trabajo con GPU de gama alta. El repositorio ocupa 110,2 GB en total.

Su relevancia actual es práctica: los merges comunitarios de ~9B suelen publicarse únicamente en safetensors, y este repositorio los hace utilizables en inferencia local con cuantizaciones de baja precisión y calidad optimizada mediante imatrix. La model card indica además que el modelo está marcado como modelo de visión, aunque el propio autor advierte que los ficheros mmproj, si existen, se alojan en el repositorio estático, y los metadatos de la conversión muestran un indicador de omisión de mmproj.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada por el autor; según la model card el modelo original es un merge generado con mergekit. No se documenta la arquitectura interna ni la composición del merge |
| Parametros totales | 8.953.803.264 (unos 8,95 mil millones) |
| Parametros activos | No aplica: no hay indicios de que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; incluye fichero imatrix (0,1 GB) para generar cuantizaciones propias. Existe una version de cuantizaciones estaticas en mradermacher/Orythos-9B-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 110,2 GB |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base mas alla de que CloudGoat/Orythos-9B es un merge construido con mergekit, herramienta que combina los pesos de dos o mas modelos existentes (por ejemplo mediante tecnicas como SLERP, TIES o DARE) sin necesidad de reentrenamiento. La model card del repositorio cuantizado no detalla que modelos se combinaron, ni la receta de merge, ni la arquitectura resultante (transformer denso, MoE o hibrida).

Tampoco se documentan los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. La model card de este repositorio se limita a describir el proceso de cuantizacion: conversion a GGUF (convert_type: hf), cuantizacion de tensores de salida y generacion de cuantizaciones ponderadas mediante fichero imatrix. El autor indica que las cuantizaciones de tipo IQ suelen ofrecer mejor calidad que las no-IQ de tamano similar, e incluye una grafica comparativa de perplejidad por tipo de cuantizacion. El trabajo de cuantizacion cuenta con acceso a un supercomputador facilitado por el usuario nicoboss.

## Capacidades

- Generacion de texto conversacional en ingles: el repositorio esta etiquetado como "conversational", lo que apunta a un ajuste orientado a dialogo.
- Ejecucion en inferencia local: al distribuirse en GGUF, es compatible con motores de CPU/GPU de bajo nivel y con cuantizaciones que caben en memoria de sistemas modestos.
- Seleccion de compromiso calidad/rendimiento: la disponibilidad de 25 cuantizaciones permite ajustar el equilibrio entre tamanio, velocidad y fidelidad al modelo original.
- Vision: la model card advierte de que "este es un modelo de vision", pero tambien indica que los ficheros mmproj, si los hay, estarian en el repositorio estatico; los metadatos de la conversion muestran la etiqueta skip_mmproj. La capacidad de vision no esta confirmada en este repositorio concreto y no hay documentacion adicional al respecto.
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado unicamente como ingles.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional local en ingles: desplegado con llama.cpp u Ollama sobre una cuantizacion i1-Q4_K_M (5,7 GB), permite mantener dialogos multi-turno sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado rapido en equipos sin GPU dedicada: las cuantizaciones i1-IQ2_M (3,7 GB) o i1-IQ3_M (4,5 GB) caben en portatiles con 8 GB de RAM y permiten validar ideas de producto antes de invertir en infraestructura.
- Evaluacion comparativa de merges comunitarios: al existir una version estatica de las cuantizaciones en un repositorio separado, es posible comparar el comportamiento de las variantes i1 frente a las estaticas sobre el mismo prompt set, aunque sin benchmarks publicados la comparacion debe hacerse de forma empirica.
- Generacion de texto en pipelines por lotes: las variantes Q4_K_S y Q4_K_M estan etiquetadas por el autor como optimas en relacion tamanio/velocidad/calidad, lo que las hace candidatas para tareas de resumen, clasificacion o reescritura en lotes ejecutadas en una sola GPU de 12 GB.
- Creacion de cuantizaciones propias: el repositorio incluye el fichero imatrix (0,1 GB), lo que permite a un equipo generar cuantizaciones a medida con llama.cpp partiendo del modelo base y reutilizando dicha matriz de importancia.
- Despliegue en el borde o en entornos con memoria muy limitada: la cuantizacion i1-IQ1_S (2,8 GB) esta descrita por el autor como "para desesperados", lo que indica que sacrifica calidad a cambio de ejecutarse en hardware minimo; seria apropiado para demos y pruebas de concepto, no para produccion.
- Integracion en aplicaciones de escritorio: al ser GGUF, el modelo puede embeberse en aplicaciones que usan bindings de llama.cpp (por ejemplo, complementos de editores o asistentes de escritorio) en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se han encontrado datos de rendimiento en la busqueda web realizada. El unico dato cuantitativo disponible son los tamanios de fichero por cuantizacion:

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---|---|
| i1-IQ1_S | 2,8 | Para casos desesperados |
| i1-IQ1_M | 3,0 | Mayormente desesperado |
| i1-IQ2_XXS | 3,2 | - |
| i1-IQ2_XS | 3,4 | - |
| i1-IQ2_S | 3,5 | - |
| i1-IQ2_M | 3,7 | - |
| i1-Q2_K_S | 3,8 | Calidad muy baja |
| i1-Q2_K | 3,9 | IQ3_XXS probablemente mejor |
| i1-IQ3_XXS | 4,0 | Calidad mas baja |
| i1-IQ3_XS | 4,3 | - |
| i1-Q3_K_S | 4,4 | IQ3_XS probablemente mejor |
| i1-IQ3_S | 4,5 | Supera a Q3_K* |
| i1-IQ3_M | 4,5 | - |
| i1-Q3_K_M | 4,7 | IQ3_S probablemente mejor |
| i1-Q3_K_L | 5,0 | IQ3_M probablemente mejor |
| i1-IQ4_XS | 5,3 | - |
| i1-Q4_0 | 5,4 | Rapida, calidad baja |
| i1-Q4_K_S | 5,5 | Tamano, velocidad y calidad optimos |
| i1-IQ4_NL | 5,5 | Preferible IQ4_XS |
| i1-Q4_K_M | 5,7 | Rapida, recomendada |
| i1-Q4_1 | 5,9 | - |
| i1-Q5_K_S | 6,4 | - |
| i1-Q5_K_M | 6,6 | - |
| i1-Q6_K | 7,5 | Practicamente como Q6_K estatica |

## Requisitos de hardware

- VRAM estimada para inferencia: el tamano del fichero GGUF es el componente dominante. Aniadir entre 0,5 y 2 GB adicionales para cache KV, contexto y sobrecarga del runtime. Estimaciones orientativas a partir del tamano de fichero: 4-5 GB para IQ1/IQ2, 5-6 GB para IQ3, 6-8 GB para IQ4 y Q4, 8-9 GB para Q5, 9-10 GB para Q6_K. El modelo en precision completa (16 bits) rondaria los 18 GB, pero no se distribuye en este repositorio.
- Cabe en GPU de consumo: si. Las cuantizaciones i1-IQ2_M (3,7 GB) e i1-IQ3_M (4,5 GB) son viables en GPU de 6-8 GB (RTX 3050, RTX 2060, RTX 3060 Ti, RTX 4060). La recomendada i1-Q4_K_M (5,7 GB) encaja en 8 GB con contexto moderado, y con holgura en 12 GB (RTX 3060 12 GB, RTX 4070). i1-Q6_K (7,5 GB) requiere 10-12 GB o mas.
- Descarga parcial en CPU: para equipos sin GPU suficiente, es posible ejecutar las capas no descargadas a GPU en CPU o usar exclusivamente CPU con cuantizaciones IQ2/IQ3.
- GPU de gama profesional: A100, H100, L40S o RTX 4090 no son necesarias para este modelo; se usarian solo para servir muchas peticiones concurrentes o para trabajar con el modelo base en 16 bits.
- Opciones de despliegue: llama.cpp (soporte nativo de GGUF e imatrix), Ollama, LM Studio, llama-cpp-python y otros bindings, kobold.cpp y text-generation-webui. vLLM tiene soporte parcial de GGUF y TGI no soporta GGUF de forma nativa, por lo que no son las rutas recomendadas para este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No hay benchmarks publicados que permitan comparar el rendimiento de este modelo con alternativas. La comparacion se limita a caracteristicas objetivas del repositorio y a los datos disponibles de repositorios relacionados del mismo cuantizador.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Orythos-9B-i1-GGUF | 8,95 B | No disponible | No disponible | GGUF (i1/imatrix) | Objeto de esta ficha; 25 cuantizaciones |
| mradermacher/Orythos-9B-GGUF | 8,95 B (mismo base) | No disponible | No disponible | GGUF estatico | Mismo modelo base, cuantizaciones estaticas; el autor indica que aqui se alojarian los ficheros mmproj si existieran |
| CloudGoat/Orythos-9B | 8,95 B | No disponible | No disponible | safetensors | Modelo original, merge creado con mergekit |
| mradermacher/Ornith-1.5-9B-i1-GGUF | No disponible | No disponible | MIT | GGUF (i1/imatrix) | Modelo de 9B, ingles, conversacional, cuantizado por el mismo autor; licencia MIT declarada |
| mradermacher/MiMo-Ornith-9B-AGSI-i1-GGUF | No disponible | No disponible | Apache 2.0 | GGUF (81,3 GB de repositorio) | Modelo de 9B cuantizado por el mismo autor; licencia Apache 2.0 declarada |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evaluacion publicada de calidad, razonamiento, codigo o matematicas para este modelo, ni para su base. Cualquier decision de produccion deberia basarse en evaluaciones propias.
- Licencia no disponible: la model card y los metadatos del repositorio no declaran licencia. Esto impide determinar si el uso comercial esta permitido; es un riesgo juridico relevante antes de integrar el modelo en un producto.
- Idioma limitado: el modelo esta etiquetado unicamente como ingles. No hay evidencia de soporte de castellano ni de otros idiomas, por lo que su uso en espanol produciria probablemente resultados degradados.
- Naturaleza de merge sin documentar: al ser un merge con mergekit, no existe informacion sobre los modelos de origen, lo que dificulta atribuir sesgos, trazar procedencia de datos y evaluar riesgos de licencia heredados de los modelos combinados.
- Riesgo de alucinacion: no cuantificado. Como en cualquier modelo de ~9B sin evaluacion publicada, cabe esperar alucinaciones en tareas de conocimiento factual, especialmente con cuantizaciones de 1 a 2 bits.
- Perdida de calidad por cuantizacion: el propio autor etiqueta las variantes IQ1_S, IQ1_M, Q2_K_S e IQ3_XXS como de calidad baja o "para desesperados". Estas cuantizaciones no son adecuadas para tareas que requieran precision.
- Capacidad de vision no confirmada: aunque la model card menciona que el modelo es de vision, los metadatos de la conversion indican skip_mmproj y el autor remite al repositorio estatico para los ficheros mmproj. No se debe asumir soporte multimodal sin verificarlo previamente.
- Tool calling y uso agentico no documentados: no hay evidencia de soporte de function calling, lo que limita su integracion en pipelines que dependan de llamadas a herramientas.
- Contexto desconocido: al no documentarse la longitud de contexto, no es posible planificar casos de uso con ventanas largas sin medirla empiricamente.
- Adopcion nula: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Orythos-9B-i1-GGUF
- Modelo base: https://huggingface.co/CloudGoat/Orythos-9B
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Orythos-9B-GGUF
- Pagina de resumen y listado de descargas del cuantizador: https://hf.tst.eu/model#Orythos-9B-i1-GGUF
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF citado por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Perfil del cuantizador en aimodels.fyi: https://www.aimodels.fyi/creators/huggingFace/mradermacher
- Modelo relacionado del mismo cuantizador: https://huggingface.co/mradermacher/Ornith-1.5-9B-i1-GGUF
- Modelo relacionado del mismo cuantizador: https://huggingface.co/mradermacher/MiMo-Ornith-9B-AGSI-i1-GGUF
