# mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags-GGUF

## Resumen

El modelo `mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags-GGUF` es una version cuantizada en formato GGUF del modelo `sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags`, publicada por mradermacher (nethype GmbH), un autor conocido por generar cuantizaciones estaticas de modelos abiertos. El repositorio no contiene el modelo original en safetensors, sino los pesos convertidos a GGUF para su uso con llama.cpp y derivados. El modelo tiene 26.895.998.464 parametros (aproximadamente 26,9 mil millones) y esta distribuido bajo licencia Apache 2.0.

Se trata de un ajuste fino orientado a roleplay en japones y a la generacion de etiquetas Danbooru para prompts de Stable Diffusion, con un componente de "abliteracion" (eliminacion de direcciones de rechazo) que lo convierte en un modelo sin censura. Los idiomas declarados son japones, ingles y chino. El entrenamiento se apoyo en dos conjuntos de datos: `dartags/danbooru-2408-blind-captions` y `Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted`. El etiquetado del repositorio lo situa en la familia Qwen 3.8 / Qwen 3.5, aunque el autor no documenta la arquitectura con detalle.

Su relevancia practica es acotada y muy especifica: cubre el nicho de generacion de prompts de imagenes (etiquetas Danbooru) y roleplay conversacional sin filtros, en un formato que cabe en GPUs de consumo mediante cuantizaciones de 2 a 5 bits. No hay resultados de benchmarks publicados ni validacion de la comunidad (0 descargas y 0 "likes" en el momento de redactar esta ficha), por lo que cualquier evaluacion debe hacerse de forma empirica antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio hereda la etiqueta Qwen 3.8 / Qwen 3.5; no se documenta si es transformer denso, MoE o hibrida) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 mil millones) |
| Parametros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mas proyector multimodal en mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | Japones (ja), ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |
| Tamano del repositorio | 17,1 GB |
| Dataset de entrenamiento | dartags/danbooru-2408-blind-captions; Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted |
| Modelo base | sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags |
| Fecha de publicacion | 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card del repositorio no describe la arquitectura interna. Los metadatos apuntan a la familia Qwen 3.8 / Qwen 3.5, pero no se confirma si se trata de un transformer denso convencional con atencion completa, de un MoE o de un diseno hibrido con capas de atencion lineal. Tampoco se documenta el numero de tokens de entrenamiento, la composicion exacta del corpus ni la ventana de contexto nativa. Lo unico verificable es el numero de parametros (26,9 mil millones) y el hecho de que el modelo base fue ajustado con LoRA mediante Unsloth, segun las etiquetas `lora` y `unsloth` del repositorio.

El proceso de "abliteracion" (etiquetas `heretic` y `abliterated`) consiste en identificar y eliminar las direcciones del espacio de activaciones asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a generar contenido sensible. Esta tecnica suele aplicarse sin reentrenamiento completo, mediante modificacion de pesos. El ajuste posterior se hizo con dos datasets: uno de captions ciegas de Danbooru (2408) para la generacion de etiquetas, y otro de 20.000 ejemplos sinteticos de roleplay NSFW en japones generados con DeepSeek-V3-0324. Los ficheros `mmproj` incluidos (Q8_0 de 0,7 GB y f16 de 1,0 GB) indican que existe un proyector multimodal, es decir, que el modelo podria aceptar entrada de imagen ademas de texto, aunque el componente de vision no se detalla en la documentacion disponible.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a roleplay en japones.
- Generacion de etiquetas Danbooru y prompts estructurados para modelos de difusion (Stable Diffusion y derivados), a partir del dataset de captions ciegas.
- Soporte multilingue en japones, ingles y chino, con clara especializacion en japones.
- Modo sin censura: el proceso de abliteracion elimina los rechazos por contenido sensible, incluido contenido NSFW.
- Posible entrada multimodal (imagen a texto) por la presencia de ficheros `mmproj`, sin documentacion que lo confirme.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de prompts para Stable Diffusion: el modelo produce etiquetas Danbooru directamente utilizables como prompt positivo o negativo, gracias al ajuste sobre `danbooru-2408-blind-captions`. Es su caso de uso mas directo y mejor respaldado por los datos de entrenamiento.
- Etiquetado inverso de imagenes (auto-tagging): si el proyector multimodal funciona, se podria alimentar una imagen y obtener la lista de etiquetas Danbooru correspondiente para indexar o reentrenar modelos de difusion. Requiere validacion previa.
- Roleplay conversacional en japones: el ajuste con 20.000 dialogos sinteticos NSFW permite mantener personajes y contextos narrativos largos en japones, sin las restricciones de rechazo de un modelo alineado convencional.
- Creacion de personajes y narrativa interactiva: uso en aplicaciones de ficcion interactiva o novelas visuales donde se necesita consistencia de personaje y ausencia de filtros tematicos.
- Traduccion y adaptacion de matices japones-ingles-chino: el modelo maneja los tres idiomas, lo que permite usarlo como traductor de registro coloquial o de contenido culturalmente especifico.
- Prototipado de pipelines de generacion de imagenes: integrado en un flujo que encadene generacion de texto, extraccion de etiquetas y llamada al modelo de difusion, todo en local con llama.cpp y sin dependencia de APIs externas.
- Investigacion sobre alineacion y seguridad: el modelo sirve como objeto de estudio de tecnicas de abliteracion y de sus efectos secundarios sobre la calidad general y la coherencia.
- Despliegue en entornos de investigacion con recursos limitados: las cuantizaciones Q3 y Q4 permiten ejecutarlo en una unica GPU de consumo, algo imposible con el modelo en f16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de roleplay o de calidad de etiquetado. Tampoco hay evaluaciones comparativas frente al modelo base sin cuantizar.

## Requisitos de hardware

- Parametros: 26,9 mil millones, modelo denso. El peso en memoria depende exclusivamente de la cuantizacion elegida.
- Tamano de fichero confirmado: Q4_K_S = 15,7 GB (dato del propio repositorio).
- Estimaciones de tamano de pesos segun bits por parametro habituales (calculadas a partir de los 26,9 mil millones de parametros, no publicadas por el autor):
  - Q2_K: aproximadamente 11 GB.
  - Q3_K_S: aproximadamente 12 GB.
  - Q3_K_M: aproximadamente 13 GB.
  - Q3_K_L: aproximadamente 14,5 GB.
  - IQ4_XS: aproximadamente 14,3 GB.
  - Q4_K_S: 15,7 GB (confirmado).
  - Q4_K_M: aproximadamente 16,3 GB.
  - Q5_K_S: aproximadamente 18,5 GB.
  - Q5_K_M: aproximadamente 19,2 GB.
  - Q6_K: aproximadamente 22 GB.
  - Q8_0: aproximadamente 28,6 GB.
  - f16: aproximadamente 53,8 GB.
- VRAM necesaria: al tamano de los pesos hay que sumar la cache KV y el overhead del contexto. Para una ventana de contexto moderada, una regla practica es dejar entre 2 y 4 GB adicionales sobre el tamano de los pesos.
- GPU de consumo: caben las cuantizaciones Q2_K a Q5_K en GPUs de 24 GB (RTX 3090, RTX 4090, RTX 5090), y Q4_K_M o inferiores en GPUs de 16 GB con contexto reducido y descarga parcial a CPU. Q6_K y Q8_0 no caben en 24 GB con contexto utilizable.
- GPU profesionales: Q6_K y Q8_0 caben en A100 40 GB, L40S 48 GB o H100 80 GB. La version f16 requiere un H100 80 GB o dos A100 40 GB.
- CPU y RAM: las cuantizaciones Q2_K a Q4_K_S pueden ejecutarse en CPU con 16-24 GB de RAM, con velocidad de decodificacion baja (unos pocos tokens por segundo en hardware de consumo).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, Jan, text-generation-webui y cualquier entorno compatible con GGUF. Para el modelo base en safetensors se usaria transformers. vLLM y TGI no ofrecen soporte estable de GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor.

## Comparativa con modelos similares

Los datos de rendimiento comparativo no estan disponibles. La comparacion se limita a parametros, licencia y formato:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags-GGUF | 26,9 mil millones | No disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas y proyector multimodal |
| sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags | 26,9 mil millones | No disponible | Apache 2.0 (segun herencia) | Safetensors | Modelo base sin cuantizar |
| Alternativas de la misma categoria (roleplay sin censura en japones basadas en Qwen) | No disponible | No disponible | Variable | GGUF, safetensors | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de comparaciones frente a modelos de proposito general del mismo tamano con datos de benchmarks verificables, por lo que cualquier comparacion de calidad seria especulativa.

## Limitaciones y advertencias

- Contenido NSFW explicito: el modelo esta explicitamente disenado para generar material para adultos. Su uso requiere control de acceso y verificacion de edad en cualquier producto final.
- Modelo abliterado: la eliminacion de las direcciones de rechazo no solo afecta al contenido sexual, sino que puede degradar la coherencia general, aumentar la obediencia a instrucciones daninas y empeorar el seguimiento de instrucciones benignas.
- Riesgo de alucinacion: no hay evaluaciones publicadas. En tareas de razonamiento, codigo o matematicas el comportamiento es impredecible.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta. No existen informes independientes sobre calidad, estabilidad o sesgos.
- Documentacion muy escasa: la model card del cuantizador es una plantilla generica. No hay informacion sobre contexto nativo, arquitectura, proceso de abliteracion ni evaluaciones.
- Idiomas: aunque se declaran ja, en y zh, el ajuste esta claramente sesgado hacia japones. El rendimiento en castellano no esta soportado ni documentado.
- Sesgos de datos: el entrenamiento con captions de Danbooru 2408 hereda los sesgos de anotacion de esa base de datos (predominio de ciertos estilos, personajes y representaciones).
- Licencia: el repositorio declara Apache 2.0, pero conviene verificar la licencia efectiva del modelo base y de los datasets utilizados. Apache 2.0 cubre el artefacto, no exime de responsabilidades legales sobre el contenido generado.
- Riesgo legal y de plataforma: publicar o distribuir contenido NSFW puede infringir los terminos de servicio de proveedores de nube y plataformas de despliegue.
- Cuantizacion: las cuantizaciones de 2 y 3 bits degradan notablemente la calidad. No se han publicado cuantizaciones ponderadas ni imatrix para este modelo, lo que suele implicar mayor perdida de calidad en los niveles bajos.
- Sin metricas de rendimiento: no hay datos de latencia ni throughput, por lo que el dimensionamiento de infraestructura debe hacerse por prueba y error.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags-GGUF
- Modelo base: https://huggingface.co/sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags-GGUF
- Dataset Danbooru blind captions: https://huggingface.co/datasets/dartags/danbooru-2408-blind-captions
- Dataset de roleplay NSFW en japones: https://huggingface.co/datasets/Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa del autor): https://www.nethype.de/
