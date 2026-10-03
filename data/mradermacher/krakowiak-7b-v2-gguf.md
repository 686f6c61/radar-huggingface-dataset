# mradermacher/Krakowiak-7B-v2-GGUF

## Resumen

Krakowiak-7B-v2-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo base szymonrucinski/Krakowiak-7B-v2. El modelo original es un modelo de lenguaje de ~7,24 mil millones de parametros orientado al idioma polaco (pl), mientras que este repositorio se limita a ofrecer versiones comprimidas del mismo para su ejecucion eficiente en hardware de consumo mediante llama.cpp y herramientas compatibles.

El valor de este repositorio no reside en un modelo nuevo, sino en la disponibilidad de 12 niveles de cuantizacion distintos (desde Q2_K de 2,8 GB hasta f16 de 14,6 GB), lo que permite desplegar el modelo en un espectro amplio de GPUs y CPUs. Esto lo hace relevante para desarrolladores que necesitan ejecutar un modelo en polaco de forma local, sin depender de APIs externas y con control total sobre el coste y la privacidad de los datos.

La licencia cc-by-sa-4.0 del modelo base se hereda en estas cuantizaciones, lo que permite uso comercial bajo condiciones de atribucion y compartir-igual. No se han publicado en la informacion disponible datos sobre arquitectura interna, contexto maximo, composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada por el autor) |
| Parametros totales | 7.241.732.096 (~7,24 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | polaco (pl) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion proporcionada no documenta la arquitectura interna del modelo base szymonrucinski/Krakowiak-7B-v2. El recuento exacto de parametros (7.241.732.096) coincide con el de arquitecturas tipo Mistral 7B, pero el autor no confirma esta correspondencia y no se debe asumir como un hecho verificado. Tampoco se detalla la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de ajuste como RLHF, DPO o SFT.

Lo que si es verificable es el proceso de conversion realizado por mradermacher: se trata de cuantizaciones estaticas (no ponderadas por imatrix, segun indica el propio autor) con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, partiendo de los pesos en formato Hugging Face del modelo base. No se han publicado cuantizaciones ponderadas por imatrix para este modelo, y el autor deja abierta la posibilidad de generarlas si hay demanda en la seccion de discusiones.

## Capacidades

- Generacion de texto en polaco: es el unico idioma declarado en la model card, por lo que se asume capacidad de generacion, resumen y transformacion de texto en dicho idioma.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no; el modelo declara exclusivamente el idioma polaco (pl).
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- Formato de ejecucion: al estar en GGUF, es compatible con el ecosistema llama.cpp y sus derivados (Ollama, LM Studio, koboldcpp, entre otros).

## Casos de uso

- Generacion de texto local en polaco: el modelo puede ejecutarse integramente en una estacion de trabajo o portatil con GPU de gama media, permitiendo redactar, resumir o reformular contenido en polaco sin enviar datos a servicios externos.
- Asistentes de escritorio sin conexion: al distribuirse en cuantizaciones desde 2,8 GB (Q2_K), es viable empaquetarlo dentro de una aplicacion de escritorio para tareas de asistencia textual en polaco en entornos sin red.
- Procesamiento por lotes de documentos en polaco: con la cuantizacion Q8_0 o Q6_K se puede lanzar un pipeline de procesamiento nocturno sobre grandes volumenes de texto polaco, priorizando calidad sobre velocidad.
- Traduccion asistida polaco-a-otro idioma: aunque el modelo declara solo polaco, puede utilizarse en la fase de comprension o generacion del lado polaco de un sistema de traduccion hibrido combinado con un modelo multilingue.
- Prototipado e investigacion academica en PLN (procesamiento de lenguaje natural en polaco): el repositorio ofrece 12 puntos de compresion distintos, lo que facilita estudios comparativos sobre el efecto de la cuantizacion en la calidad de salida para el idioma polaco.
- Integracion en aplicaciones de chat local: mediante Ollama o llama.cpp se puede exponer una API compatible con OpenAI sobre la cuantizacion Q4_K_M (4,5 GB), adecuada para un asistente conversacional de bajo consumo.
- Despliegue en entornos con recursos muy limitados: la cuantizacion Q2_K (2,8 GB) permite ejecutar el modelo en equipos con 8 GB de RAM o VRAM, asumiendo una perdida notable de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (tamano del fichero, requiere margen adicional para el contexto):
  - Q2_K: 2,8 GB
  - Q3_K_S: 3,3 GB
  - Q3_K_M: 3,6 GB
  - Q3_K_L: 3,9 GB
  - IQ4_XS: 4,0 GB
  - Q4_K_S: 4,2 GB
  - Q4_K_M: 4,5 GB
  - Q5_K_S: 5,1 GB
  - Q5_K_M: 5,2 GB
  - Q6_K: 6,0 GB
  - Q8_0: 7,8 GB
  - f16: 14,6 GB
- GPUs recomendadas: para Q4_K_M y Q5_K_M basta una GPU consumer con 8 GB de VRAM (RTX 3060 Ti, RTX 4060, RTX 2070 o superiores). Para Q6_K y Q8_0 se recomienda 10-12 GB de VRAM (RTX 3080, RTX 4070). Para f16 se recomienda 16 GB o mas (RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU consumer: si, en todas las cuantizaciones hasta Q8_0; f16 requiere una GPU de 16 GB o mas.
- Opciones de despliegue: llama.cpp, llama-cpp-python, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no son la via habitual para GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Krakowiak-7B-v2-GGUF (este modelo) | ~7,24 mil millones | no disponible | pl | cc-by-sa-4.0 | GGUF | Hugging Face |
| Krakowiak-7B-v3-GGUF (mismo cuantizador, version posterior) | no disponible | no disponible | no disponible | no disponible | GGUF | Hugging Face |
| szymonrucinski/Krakowiak-7B-v2 (modelo base) | ~7,24 mil millones | no disponible | pl | cc-by-sa-4.0 | safetensors | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones tecnicas detalladas de las alternativas para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al tratarse de un modelo entrenado predominantemente o exclusivamente en polaco, es probable que herede los sesgos presentes en los corpus de ese idioma, aunque no se documenta.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se han publicado evaluaciones especificas para este modelo.
- Limitaciones de idioma: el modelo declara unicamente el polaco (pl), por lo que su rendimiento en castellano, ingles u otros idiomas no esta garantizado y probablemente sea deficiente.
- Limitacion de contexto: se desconoce la longitud de contexto soportada; conviene verificar la configuracion del modelo base antes de usarlo en tareas que requieran ventanas largas.
- Restricciones de licencia: cc-by-sa-4.0 permite uso comercial, pero obliga a atribuir la autoria y a distribuir cualquier obra derivada bajo la misma licencia (share-alike). Es importante revisar esta condicion antes de integrar el modelo en productos propietarios.
- Cuantizaciones de baja precision: las variantes Q2_K y Q3_K_S introducen degradaciones notables de calidad segun la documentacion del propio autor; para produccion se recomienda Q4_K_M o superior.
- Ausencia de cuantizaciones imatrix: el autor indica que no hay cuantizaciones ponderadas por imatrix, lo que puede suponer una perdida de calidad mayor en los niveles bajos en comparacion con modelos que si las ofrecen.
- Modelo base sin documentacion publica detallada: la falta de informacion sobre datos de entrenamiento y evaluaciones dificulta estimar el comportamiento en produccion.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Krakowiak-7B-v2-GGUF
- Modelo base: https://huggingface.co/szymonrucinski/Krakowiak-7B-v2
- Pagina de vision general del cuantizador: https://hf.tst.eu/model#Krakowiak-7B-v2-GGUF
- Version posterior del mismo autor: https://huggingface.co/mradermacher/Krakowiak-7B-v3-GGUF
- Repositorio de peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Listado de modelos del autor: https://huggingface.co/mradermacher/models
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
