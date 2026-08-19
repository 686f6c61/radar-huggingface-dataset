# mradermacher/Iris-12B-v1.4.1-GGUF

## Resumen

Iris-12B-v1.4.1 es un modelo de lenguaje de 11.900 millones de parametros desarrollado por Lambent y distribuido en formato GGUF por mradermacher, un cuantizador conocido en el ecosistema open source. El repositorio que nos ocupa contiene exclusivamente los pesos cuantizados, no el modelo original en safetensors, que se encuentra en el repositorio base de Lambent.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas, y esta orientado a conversacion en ingles. Un aspecto destacable es la presencia de ficheros mmproj (proyeccion multimodal) en formato f16 y Q8_0, lo que indica que el modelo base incorpora capacidades de vision ademas de texto. La cuantizacion es estatica (sin imatrix) e incluye un amplio abanico de niveles, desde Q2_K (4,9 GB) hasta Q8_0 (12,8 GB), lo que facilita su despliegue en hardware de consumo.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 12B con capacidades multimodales en GPU domesticas, algo que con los pesos originales en fp16 resultaria inviable para la mayoria de usuarios. El repositorio incluye 12 variantes de cuantizacion mas dos ficheros de proyeccion multimodal, cubriendo distintos equilibrios entre calidad y consumo de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16, mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion estatica) |

## Arquitectura y entrenamiento

La informacion disponible en la model card del repositorio GGUF no detalla la arquitectura interna del modelo base. Se sabe que utiliza la libreria transformers de HuggingFace y que el modelo original (Lambent/Iris-12B-v1.4.1) tiene 11.907.350.576 parametros, lo que sugiere una arquitectura densa tipo transformer decoder-only, aunque no se confirma si incorpora alguna innovacion como attention lineal o mezcla de expertos.

La presencia de ficheros mmproj (multi-modal projection) indica que el modelo base incluye un proyector de vision que permite procesar imagenes ademas de texto, aunque la model card no especifica que arquitectura de vision encoder utiliza ni como se integra con el decoder. Tampoco se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF, DPO u otras alineaciones. La cuantizacion realizada por mradermacher es estatica, sin usar imatrix, y se advierte en la propia model card que las cuantizaciones con imatrix podrian estar disponibles bajo peticion en la comunidad.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Procesamiento multimodal: los ficheros mmproj-f16 y mmproj-Q8_0 permiten que el modelo procese imagenes, aunque no se detalla el alcance de esta capacidad (descripcion de imagenes, VQA, etc.).
- Compatible con endpoints de inferencia (etiqueta "endpoints_compatible"), lo que facilita su integracion en servicios de despliegue.
- Ejecucion local eficiente gracias a la variedad de cuantizaciones GGUF, desde 4,9 GB hasta 12,8 GB.
- No se documenta soporte explicito de tool calling, function calling, agentes o razonamiento multi-paso en la informacion proporcionada.

## Casos de uso

- Despliegue local en equipos de consumo: gracias a las cuantizaciones Q4_K_M (7,5 GB) y Q4_K_S (7,1 GB), el modelo puede ejecutarse en GPU con 8 GB de VRAM, lo que lo hace accesible para desarrolladores independientes y pequenos equipos que necesitan un LLM local sin depender de APIs externas.
- Asistentes conversacionales privados: al ser un modelo conversacional en ingles con licencia Apache 2.0, puede integrarse en aplicaciones de chat donde la privacidad de los datos sea critica, ya que la inferencia se realiza en local.
- Prototipado rapido de aplicaciones con vision: los ficheros mmproj permiten experimentar con capacidades multimodales (analisis de imagenes) sin necesidad de un modelo de gran tamano, ideal para validar conceptos antes de escalar a modelos mayores.
- Integracion en pipelines de CI/CD para generacion de documentacion o resumenes de texto en ingles, aprovechando su tamano moderado y su compatibilidad con endpoints.
- Educacion e investigacion: al ser un modelo abierto con pesos cuantizados, sirve como banco de pruebas para estudiar el impacto de distintas cuantizaciones (Q2_K a Q8_0) en la calidad de las respuestas, comparando perplejidad y rendimiento.
- Aplicaciones offline en entornos restringidos: su licencia permisiva y su formato GGUF lo hacen adecuado para entornos corporativos o gubernamentales donde no se permite el envio de datos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar. Para obtener metricas de rendimiento, seria necesario consultar el repositorio base del modelo (Lambent/Iris-12B-v1.4.1) o ejecutar evaluaciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion:
  - Q2_K: 4,9 GB de almacenamiento, cabe en GPU de 6 GB.
  - Q4_K_S / Q4_K_M: 7,1-7,5 GB, recomendado para GPU de 8-10 GB (RTX 3060, RTX 4060, etc.).
  - Q5_K_M: 8,6 GB, requiere GPU de 10-12 GB.
  - Q6_K: 9,9 GB, recomendado para GPU de 12-16 GB (RTX 4070 Ti, RTX 4080).
  - Q8_0: 12,8 GB, requiere GPU de 16 GB o mas (RTX 4090, A100, etc.).
- GPU recomendadas: RTX 3060 12 GB para cuantizaciones Q4-Q5; RTX 4090 o A100 para Q8_0 con margen de contexto amplio.
- El modelo cabe en GPU de consumo desde 8 GB de VRAM con cuantizaciones bajas, y en 12-16 GB con cuantizaciones medias.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Al ser "endpoints_compatible", tambien puede servirse mediante vLLM o TGI si se convierten los pesos.
- Latencia y throughput: no se han publicado datos especificos. Como referencia orientativa, un modelo de 12B en Q4_K_M en una RTX 4090 suele generar entre 30 y 60 tokens por segundo, aunque esto depende del backend y del contexto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas directas con otros modelos en la informacion proporcionada. El modelo comparte categoria con otros LLMs de 12-13B parametros como Llama 3.2 12B o Mistral 12B, pero no se puede establecer una comparacion rigurosa sin datos de evaluacion. Se recomienda consultar el repositorio base de Lambent para obtener mas contexto sobre el posicionamiento del modelo.

## Limitaciones y advertencias

- La informacion tecnica es limitada: la model card no detalla arquitectura, contexto, dataset de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad para tareas especificas.
- Idioma restringido a ingles: no se garantiza un rendimiento adecuado en otros idiomas, incluido el espanol.
- Cuantizacion estatica sin imatrix: las cuantizaciones de menor precision (Q2_K, Q3_K) pueden degradar notablemente la calidad de las respuestas; se recomienda usar Q4_K_M o superior para produccion.
- Riesgo de alucinacion y sesgos: al no disponer de informacion sobre el proceso de alineacion, no se puede descartar la presencia de sesgos en los datos de entrenamiento ni alucinaciones frecuentes, especialmente en cuantizaciones agresivas.
- Capacidades multimodales no documentadas: aunque existen ficheros mmproj, no se especifica que tipo de vision soporta (resolucion, tipos de imagen, tareas) ni su calidad.
- Repositorio sin mantenimiento activo: las descargas y likes son cero, y el autor indica que las cuantizaciones imatrix podrian no llegar a publicarse.
- La fecha de creacion del repositorio (agosto de 2026) es posterior a la fecha actual, lo que sugiere que el modelo es muy reciente o que los metadatos contienen errores.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Iris-12B-v1.4.1-GGUF
- Modelo base (Lambent): https://huggingface.co/Lambent/Iris-12B-v1.4.1
- Pagina de descargas del autor: https://hf.tst.eu/model#Iris-12B-v1.4.1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guia sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
