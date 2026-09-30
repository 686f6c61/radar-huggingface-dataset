# mradermacher/Olmo-3-7B-Think-heretic-GGUF

## Resumen

Olmo-3-7B-Think-heretic-GGUF es una version cuantizada en formato GGUF del modelo richardyoung/Olmo-3-7B-Think-heretic, publicada por el usuario mradermacher. El modelo original es un derivado "heretic" (tambien etiquetado como uncensored, decensored y abliterated) de Olmo 3 7B Think, la familia de modelos abiertos de Ai2 (Allen Institute for AI) que incluye variantes Base, Instruct y Think en tamanos de 7B y 32B. La variante Think esta orientada a cadenas de razonamiento largas, lo que mejora tareas de matematicas y codigo.

El repositorio aqui descrito no contiene pesos nuevos: es un conjunto de cuantizaciones estaticas generadas a partir del modelo de richardyoung, con 12 variantes que van desde Q2_K (3,0 GB) hasta f16 (14,7 GB). El objetivo es permitir la ejecucion local del modelo en hardware de consumo mediante llama.cpp y sus derivados (Ollama, LM Studio y otros), reduciendo el peso desde los aproximadamente 14,7 GB en precision completa hasta 3-4,6 GB en cuantizaciones bajas o medias.

El modelo tiene 7.298.011.136 parametros, licencia Apache 2.0 y esta entrenado unicamente en ingles. Esta pensado para desarrolladores que necesitan un modelo de razonamiento de 7B ejecutable en local, sin filtros de contenido conversacional, y que priorizan la portabilidad del formato GGUF sobre la fidelidad absoluta al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3); no se detallan mas particularidades en la informacion disponible |
| Parametros totales | 7.298.011.136 (aproximadamente 7,3B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | richardyoung/Olmo-3-7B-Think-heretic |
| Dataset declarado | allenai/Dolci-Think-RL-7B |
| Etiquetas | heretic, uncensored, decensored, abliterated, reproducible |
| Tamano del repositorio | 65,1 GB |
| Fecha de creacion | 29 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Olmo 3 de Ai2, que segun la documentacion disponible se entreno con un enfoque de entrenamiento por etapas (staged training) sobre el dataset Dolma 3. La variante Think se especializa en cadenas de pensamiento largas, un esquema que incrementa el rendimiento en tareas de razonamiento matematico y de generacion de codigo. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

Sobre esa base, el modelo richardyoung/Olmo-3-7B-Think-heretic aplica una modificacion de tipo "abliteration" (etiquetas heretic, uncensored, decensored), una tecnica de intervencion sobre los pesos o las activaciones que reduce el rechazo ante peticiones que el modelo original filtraria. El dataset declarado en la model card, allenai/Dolci-Think-RL-7B, apunta a un ajuste orientado a razonamiento con refuerzo. Esta version de mradermacher no introduce cambios en la arquitectura ni en los pesos mas alla del proceso de cuantizacion a GGUF; se trata de cuantizaciones estaticas, sin variantes ponderadas ni con imatrix en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno.
- Razonamiento con modo pensamiento (Think), orientado a problemas de matematicas y logica paso a paso.
- Generacion de codigo a partir de lenguaje natural, heredada del entrenamiento de la variante Think de Olmo 3.
- Ejecucion local en CPU y GPU mediante llama.cpp y runtimes compatibles con GGUF.
- Comportamiento "abliterated": menor tasa de rechazos ante peticiones que el modelo base declinaria.
- No se documenta soporte de tool calling, function calling ni uso agentico en la informacion disponible.
- No se documenta soporte multimodal (vision, audio) en la informacion disponible.
- Capacidad multilingue limitada al ingles segun el campo language de la model card.

## Casos de uso

- Asistente local de razonamiento paso a paso: con la cuantizacion Q4_K_M (4,6 GB), el modelo puede ejecutarse en un portatil con GPU de gama media o en CPU, generando cadenas de pensamiento para problemas de matematicas y logica sin enviar datos a la nube.
- Generacion de codigo en entornos air-gapped: al distribuirse en GGUF y pesar entre 3 y 8 GB, es viable desplegarlo en estaciones de trabajo sin conexion externa para autocompletado y explicacion de fragmentos de codigo.
- Desarrollo y evaluacion de sistemas de IA sin filtros: util para investigadores que necesitan estudiar como se comporta un modelo abliterated frente a uno con alineamiento estandar, comparando tasas de rechazo y calidad de respuesta.
- Prototipado rapido con Ollama o LM Studio: el repositorio incluye una variante publicada en Ollama, lo que permite poner el modelo en marcha con un unico comando y evaluar su utilidad antes de invertir en despliegue a mayor escala.
- Procesamiento por lotes de texto en ingles: tareas de resumen, reescritura o extraccion sobre corpus en ingles donde la licencia Apache 2.0 permite uso comercial sin restricciones adicionales.
- Chatbot de soporte interno en ingles: al no requerir infraestructura dedicada, puede desplegarse como servicio interno para equipos que trabajan en ingles y necesitan respuestas con razonamiento explicito.
- Educacion y explicacion tecnica: el modo Think permite mostrar el proceso de resolucion de un problema, aprovechable en herramientas de tutoria o generacion de material didactico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y tampoco se han facilitado datos de rendimiento del modelo base richardyoung/Olmo-3-7B-Think-heretic ni del original allenai/olmo-3-7b-think en los materiales consultados.

## Requisitos de hardware

Los tamanos de fichero son datos publicados en la model card; la VRAM estimada anade un margen aproximado de 1 a 2 GB para el runtime y la cache KV, que depende del contexto configurado (no disponible).

| Cuantizacion | Tamano del fichero | VRAM estimada aproximada |
|---|---|---|
| Q2_K | 3,0 GB | 4-5 GB |
| Q3_K_S | 3,4 GB | 5 GB |
| Q3_K_M | 3,8 GB | 5-6 GB |
| Q3_K_L | 4,1 GB | 5-6 GB |
| IQ4_XS | 4,1 GB | 5-6 GB |
| Q4_K_S | 4,3 GB | 6 GB |
| Q4_K_M | 4,6 GB | 6-7 GB |
| Q5_K_S | 5,2 GB | 7 GB |
| Q5_K_M | 5,3 GB | 7-8 GB |
| Q6_K | 6,1 GB | 8 GB |
| Q8_0 | 7,9 GB | 9-10 GB |
| f16 | 14,7 GB | 16-18 GB |

- Cabe en GPU de consumo en todas las cuantizaciones hasta Q8_0 (por ejemplo, RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4090). La variante f16 exige al menos 16 GB de VRAM.
- En CPU, las cuantizaciones Q2_K a Q4_K_M son viables con 8-16 GB de RAM del sistema, con velocidad dependiente del numero de nucleos.
- GPU de datacenter (A100, H100) no son necesarias para este tamano; solo tendrian sentido para servir muchas peticiones concurrentes.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El repositorio se etiqueta como transformers, pero los ficheros servidos son GGUF.
- No se han publicado datos de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La siguiente tabla recoge unicamente los datos verificables de las variantes relacionadas de este mismo linaje.

| Modelo | Parametros | Formato | Licencia | Contexto | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| mradermacher/Olmo-3-7B-Think-heretic-GGUF | 7,3B | GGUF (12 cuantizaciones) | Apache 2.0 | No disponible | Ingles | HuggingFace, Ollama |
| richardyoung/Olmo-3-7B-Think-heretic | No disponible | Pesos originales (no disponible) | No disponible | No disponible | No disponible | HuggingFace |
| allenai/olmo-3-7b-think | 7B (variante Think) | No disponible | No disponible | No disponible | No disponible | HuggingFace, LM Studio |
| Modelos comparables de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo esta entrenado y documentado unicamente en ingles; no hay evidencia de soporte fiable en castellano ni en otros idiomas.
- La modificacion abliterated reduce los mecanismos de rechazo, lo que implica mayor probabilidad de generar contenido ofensivo, ilegal o danino si no se aplican filtros externos.
- No se han publicado evaluaciones de sesgo, toxicidad ni tasas de alucinacion para esta version cuantizada ni para el modelo heretic del que deriva.
- La cuantizacion degrada la calidad respecto a los pesos originales, especialmente en Q2_K y Q3_K_S; la propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- La longitud de contexto no esta disponible, lo que impide planificar despliegues que dependan de ventanas largas o de cache KV con requisitos concretos de memoria.
- Aunque la licencia declarada es Apache 2.0, conviene verificar la licencia del modelo base richardyoung/Olmo-3-7B-Think-heretic antes de un uso comercial, ya que no figura en la informacion disponible.
- El repositorio no registra descargas ni "likes" en el momento de la consulta, por lo que no existe validacion de la comunidad sobre la fidelidad de las cuantizaciones.
- No hay cuantizaciones ponderadas ni con imatrix publicadas; el autor indica que podria no llegar a generarlas.
- El rendimiento real depende de la eleccion de cuantizacion y del backend; no hay mediciones publicadas de latencia ni de tokens por segundo.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Olmo-3-7B-Think-heretic-GGUF
- Modelo base de las cuantizaciones: https://huggingface.co/richardyoung/Olmo-3-7B-Think-heretic
- Version GGUF alternativa del mismo autor base: https://huggingface.co/richardyoung/Olmo-3-7B-Think-heretic-GGUF
- Pagina de la familia Olmo de Ai2: https://allenai.org/olmo
- Modelo original en LM Studio (allenai/olmo-3-7b-think): https://lmstudio.ai/models/allenai/olmo-3-7b-think
- Version en Ollama: https://ollama.com/richardyoung/olmo-3-7b-think-heretic
- Indice de cuantizaciones de mradermacher para este modelo: https://hf.tst.eu/model#Olmo-3-7B-Think-heretic-GGUF
- Preguntas frecuentes y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
