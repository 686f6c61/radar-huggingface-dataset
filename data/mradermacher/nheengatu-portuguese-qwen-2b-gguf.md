# mradermacher/nheengatu-portuguese-qwen-2b-GGUF

## Resumen

nheengatu-portuguese-qwen-2b-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo voz-ancestral/nheengatu-portuguese-qwen-2b, un modelo de traduccion automatica orientado al par de idiomas nheengatu (codigo ISO 639-3 `yrl`) y portugues (`pt`). El modelo original lo desarrolla el proyecto voz-ancestral, mientras que las cuantizaciones las genera mradermacher, un autor conocido por publicar versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas compatibles.

El modelo base parte de una arquitectura tipo Qwen (la nomenclatura "qwen-2b" del repositorio apunta a la familia Qwen2) y cuenta con 1.881.825.088 parametros (~1,88 mil millones), lo que lo situa en la gama de modelos pequenos que pueden ejecutarse en hardware de consumo una vez cuantizados. Su interes principal es cubrir un par de lenguas muy poco representadas en los corpus de entrenamiento habituales: el nheengatu es una lengua indigena de la familia tupi-guarani hablada en la cuenca del rio Negro (Brasil, Colombia y Venezuela), con una presencia digital minima.

La relevancia de esta ficha reside en que ofrece un punto de entrada practico para tareas de traduccion y preservacion linguistica en entornos con recursos limitados de computo, ya que los pesos GGUF van desde 1,1 GB (Q2_K) hasta 3,9 GB (f16). Se publica bajo licencia Apache 2.0, lo que facilita su integracion en proyectos de investigacion y productos comerciales, aunque los datos sobre su proceso de entrenamiento y su rendimiento cuantitativo no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura del modelo base sugiere familia Qwen2; no confirmado en la informacion disponible) |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | no procede (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | nheengatu (`yrl`) y portugues (`pt`) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original mas alla de la inferida por su nombre. El repositorio de cuantizacion no incluye notas sobre el tipo de transformer, el mecanismo de atencion, la composicion del dataset ni el numero de tokens de entrenamiento. El nombre del modelo base, `nheengatu-portuguese-qwen-2b`, sugiere que se partio de un checkpoint de la familia Qwen de aproximadamente 2.000 millones de parametros y se ajusto (fine-tuning) para traduccion entre nheengatu y portugues, pero este extremo no se confirma en la documentacion disponible.

En cuanto al proceso de cuantizacion, el autor indica que se trata de cuantizaciones estaticas (sin imatrix ni ponderacion por importancia) y que no tiene previsto publicar variantes ponderadas salvo peticion explicita en la seccion de discusiones. La metadata interna del proceso senala `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, una conversion desde pesos de HuggingFace a GGUF seguida de cuantizacion. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Traduccion bidireccional entre nheengatu (`yrl`) y portugues (`pt`), que es la tarea declarada en el pipeline del repositorio (`translation`).
- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Uso como modelo de traduccion de bajos recursos para lenguas indigenas con escasa representacion digital.
- Ejecucion en entornos con recursos limitados gracias a las cuantizaciones de 1,1 a 2,1 GB.
- Compatibilidad con endpoints mediante la etiqueta `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es una capacidad esperable en un modelo de traduccion de 2B.
- Capacidades multilingues mas alla del par `yrl`-`pt`: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Traduccion de documentacion comunitaria: traduccion de materiales educativos, sanitarios o administrativos del portugues al nheengatu para comunidades de la cuenca del rio Negro, aprovechando que el modelo esta especializado en este par concreto.
- Preservacion linguistica y archivo: generacion de versiones bilingues de textos orales transcritos, facilitando la creacion de corpus paralelos que alimenten futuros trabajos de investigacion en linguistica computacional.
- Etiquetado y preanotacion de corpus: uso del modelo para producir traducciones preliminares que despues se revisan por hablantes nativos, reduciendo el coste de anotacion manual en proyectos academicos.
- Asistencia a traductores humanos: integracion del modelo en una interfaz de traduccion asistida donde el profesional parte de una sugerencia automatica y la corrige, con el modelo ejecutandose en local.
- Investigacion sobre lenguas de bajos recursos: uso como linea base en experimentos de evaluacion de traduccion para pares con menos de un millon de hablantes, comparando su salida con modelos multilingues de mayor tamano.
- Despliegue en hardware modesto: su version Q4_K_M (1,4 GB) permite ejecutar traduccion en un portatil sin GPU dedicada mediante llama.cpp, util para trabajo de campo sin conectividad.
- Educacion y aprendizaje de idiomas: aplicacion de practica de vocabulario y frases para estudiantes de nheengatu, con la cautela de validar las salidas con hablantes nativos.
- Prototipado rapido de servicios de traduccion: al ser Apache 2.0 y ocupar pocos gigabytes, sirve para validar una idea de producto antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de cuantizacion no incluye metricas de BLEU, chrF, MMLU ni de ninguna otra tarea, ni comparaciones cuantitativas con modelos alternativos. Tampoco se proporcionan mediciones de velocidad de inferencia ni de perplejidad de las distintas cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin margen de contexto): Q2_K ~1,1 GB; Q3_K_S ~1,1 GB; Q3_K_M ~1,2 GB; Q3_K_L ~1,3 GB; IQ4_XS ~1,3 GB; Q4_K_S ~1,3 GB; Q4_K_M ~1,4 GB; Q5_K_S ~1,5 GB; Q5_K_M ~1,5 GB; Q6_K ~1,7 GB; Q8_0 ~2,1 GB; f16 ~3,9 GB.
- Margen adicional recomendado: sumar entre 0,5 y 2 GB segun la longitud de contexto configurada y el backend; este dato no se especifica en el repositorio.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede alojar las cuantizaciones bajas y medias; tarjetas como RTX 3060, RTX 4060, RTX 3050 o GTX 1660 son suficientes. Las cuantizaciones Q8_0 y f16 se benefician de 4-6 GB o mas.
- Compatibilidad con GPU de consumo: si, en practicamente toda la gama actual y en muchas generaciones anteriores; la version f16 tambien entra en GPUs de 6 GB o superiores.
- Ejecucion en CPU: viable con llama.cpp en todas las cuantizaciones, particularmente con Q4_K_M y Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros runtimes compatibles con GGUF. vLLM y TGI no estan pensados para GGUF en su flujo habitual; para esos backends seria necesario convertir desde los safetensors del modelo base.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| mradermacher/nheengatu-portuguese-qwen-2b-GGUF | ~1,88 B | no disponible | yrl, pt | Apache 2.0 | GGUF | Cuantizaciones estaticas del modelo de voz-ancestral |
| voz-ancestral/nheengatu-portuguese-qwen-2b | ~1,88 B | no disponible | yrl, pt | Apache 2.0 | safetensors | Modelo base sin cuantizar; mismo origen y licencia |
| Otros modelos de traduccion para lenguas indigenas | no disponible | no disponible | segun modelo | segun modelo | varios | No se dispone de datos verificables en la informacion proporcionada para establecer una comparacion cuantitativa |

No se dispone de datos de rendimiento que permitan comparar este modelo con alternativas de la misma categoria; la comparacion se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en el repositorio, pero al ser un modelo ajustado sobre un par de lenguas con corpus limitados es probable que reproduzca sesgos presentes en los datos de entrenamiento originales, que no se describen.
- Riesgo de alucinacion: no cuantificado; en modelos pequenos de traduccion la generacion de contenido no presente en el texto fuente es un riesgo habitual, especialmente en cuantizaciones agresivas como Q2_K o Q3_K_S.
- Limitaciones de contexto e idioma: el modelo solo declara soporte para `yrl` y `pt`; no se especifica la longitud de contexto, por lo que el comportamiento con entradas largas es desconocido.
- Calidad de las cuantizaciones: el autor indica que Q3_K_M tiene "lower quality"; las cuantizaciones por debajo de Q4 pueden degradar la fidelidad de la traduccion.
- Ausencia de variantes ponderadas: el autor senala que no ha generado cuantizaciones con imatrix/ponderacion por importancia, lo que puede afectar a la calidad relativa de cada tamano. Se pueden solicitar mediante discusiones comunitarias.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y atribuir correctamente tanto al autor de las cuantizaciones como al proyecto voz-ancestral.
- Documentacion escasa: no hay informacion sobre dataset, proceso de ajuste, evaluacion ni contexto de uso previsto, lo que dificulta estimar su calidad en produccion.
- Validacion humana: dado el caracter de lengua de bajos recursos y la falta de benchmarks, cualquier uso en contextos sensibles (sanidad, legal, administracion) deberia pasar por revision de hablantes nativos.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/nheengatu-portuguese-qwen-2b-GGUF
- Modelo base: https://huggingface.co/voz-ancestral/nheengatu-portuguese-qwen-2b
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#nheengatu-portuguese-qwen-2b-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png

Nota: los resultados de la busqueda web proporcionados no guardan relacion con este modelo (contenido sobre plataformas de segunda mano y sobre el servicio de musica Deezer), por lo que no se incluyen como fuentes.
