# mradermacher/EvoLM-8B-Rubric-GGUF

## Resumen

EvoLM-8B-Rubric-GGUF es un repositorio de pesos cuantizados en formato GGUF generado por mradermacher a partir del modelo stellalisy/EvoLM-8B-Rubric, un modelo de 8.190.735.360 parametros (8,19 mil millones) orientado, segun las etiquetas del repositorio, a la generacion de rubricas de evaluacion y al modelado de recompensas (reward modeling). El autor de esta version no entrena ningun modelo: se limita a convertir los pesos originales de safetensors a GGUF y a publicar doce variantes de cuantizacion con distintos niveles de compresion.

La relevancia de esta publicacion es practica: el modelo base original esta pensado para ejecutarse con la libreria transformers, lo que exige GPU y un consumo de VRAM considerable. Las versiones GGUF permiten desplegarlo con llama.cpp, Ollama, LM Studio o llama-cpp-python, tanto en GPU de consumo como en CPU, con tamanos de archivo que van de 3,4 GB (Q2_K) a 16,5 GB (F16). Esto lo hace accesible para flujos de trabajo de evaluacion local, generacion de rubricas en lote o uso como juez dentro de pipelines de anotacion sin depender de servicios en la nube.

Conviene subir el nivel de exigencia antes de adoptarlo: el repositorio es exclusivamente de cuantizacion y su model card no incluye arquitectura, longitud de contexto, composicion del dataset de entrenamiento, resultados de benchmarks ni detalles del proceso de alineacion. Toda la informacion tecnica sobre el modelo subyacente habria que consultarla en la ficha del modelo base, que no forma parte de los datos disponibles en esta busqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo documenta la cuantizacion) |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |
| Identificador del repositorio | mradermacher/EvoLM-8B-Rubric-GGUF |
| Autor de la cuantizacion | mradermacher |
| Modelo base | stellalisy/EvoLM-8B-Rubric |
| Libreria declarada | transformers |
| Tamano del repositorio | 73,4 GB (suma de todas las variantes) |
| Etiquetas funcionales | rubric-generation, reward-modeling, evolm |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo (si es un transformer denso, un MoE o una variante hibrida), sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni sobre innovaciones tecnicas concretas como decodificacion especulativa o mecanismos de atencion lineal. El unico dato estructural confirmado es el recuento de parametros (8.190.735.360), extraido de los tensores en safetensors del modelo base, y que la conversion se ha realizado con una salida de tipo "hf" (convert_type: hf) y cuantizacion de tensores de salida (output_tensor_quantised: 1), segun los metadatos internos del proceso de cuantizacion de mradermacher.

Lo que si se puede afirmar con la informacion disponible es que ninguna de las variantes GGUF incorpora un proyector multimodal (no hay archivo mmproj en la lista de ficheros), por lo que se trata de un modelo puramente de texto. El proceso de cuantizacion es estatico, no ponderado ni con matriz de importancia (imatrix); el propio autor indica que las variantes ponderadas no estan disponibles y que no tiene previsto generarlas, aunque acepta peticiones mediante la seccion de discusiones de la comunidad.

## Capacidades

Las capacidades que se enumeran a continuacion derivan unicamente de las etiquetas declaradas en el repositorio y del nombre del modelo base. No hay documentacion adicional que las detalle o cuantifique.

- Generacion de rubricas de evaluacion: la etiqueta rubric-generation apunta a que el modelo esta ajustado para producir criterios de evaluacion estructurados, presumiblemente con niveles de desempeno y descriptores asociados.
- Modelado de recompensas: la etiqueta reward-modeling indica un posible uso como modelo de recompensa o como juez para puntuar respuestas generadas por otros modelos.
- Generacion de texto conversacional: la etiqueta conversational figura entre las declaradas en el repositorio.
- Soporte de tool calling o function calling: no disponible; no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (en), unico idioma declarado.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponibles; no se documenta ninguna y no hay archivos de proyector multimodal.
- Formato de integracion: compatible con la libreria transformers y con la etiqueta endpoints_compatible, ademas del formato GGUF.

## Casos de uso

- Generacion de rubricas para evaluacion academica o corporativa: el modelo puede producir plantillas de evaluacion con criterios y descriptores de nivel que despues revisa un humano. El formato GGUF permite lanzarlo en lote sobre cientos de consignas sin coste de API.
- Modelo juez en pipelines de RLHF o RLAIF: dado un par de respuestas candidatas, puede emplearse como puntuador para generar preferencias sinteticas o filtrar trayectorias antes de entrenar un modelo de politica.
- Curacion de datos sinteticos: uso como filtro de calidad sobre respuestas generadas por modelos mayores antes de incorporarlas a un dataset de ajuste supervisado, descartando aquellas que no cumplen los criterios de la rubrica.
- Evaluacion automatica en regresion de modelos: integrado en un pipeline de CI/CD, se puede comparar la salida de un modelo candidato contra una linea base historica y detectar degradaciones antes de un despliegue.
- Auditoria de respuestas de asistentes en produccion: puntuacion de conversaciones reales para detectar incumplimientos de politicas, tono inadecuado o contenido incompleto, con la ventaja de ejecutarse en infraestructura propia.
- Investigacion en metaevaluacion: analisis de la correlacion entre las puntuaciones de un juez automatico de 8B y las valoraciones humanas, comparando variantes de cuantizacion para medir cuanto degrada la calidad cada nivel de compresion.
- Despliegue en entornos sin conectividad o con requisitos de soberania del dato: al ser un GGUF de Apache 2.0 y menos de 9 GB en Q8_0, puede ejecutarse por completo en una estacion de trabajo aislada donde no se permite enviar datos a servicios externos.
- Prototipado rapido en portatil: con la variante Q2_K (3,4 GB) cabe en equipos con 8 GB de RAM o VRAM, lo que permite validar el comportamiento del modelo antes de invertir en hardware dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Ni la ficha de este repositorio de cuantizacion ni los metadatos recuperados incluyen resultados de MMLU, HumanEval, GSM8K, MT-Bench, RewardBench ni de cualquier otra suite de evaluacion. El autor no aporta tampoco metricas comparativas de perplejidad entre las distintas variantes de cuantizacion, aunque enlaza un grafico externo de ikawrakow sobre la relacion calidad-perplejidad de los tipos de cuantizacion y un analisis de Artefact2 sobre el mismo tema. Las dos unicas referencias cualitativas que aparecen en la model card son las notas de la tabla de archivos: Q4_K_S y Q4_K_M marcados como "fast, recommended", Q3_K_M como "lower quality", Q6_K como "very good quality" y F16 como "16 bpw, overkill".

## Requisitos de hardware

Las cifras de VRAM que aparecen a continuacion son estimaciones derivadas del tamano de cada archivo mas una reserva orientativa para cache KV y sobrecarga del runtime. No proceden de mediciones publicadas por el autor.

| Variante | Tamano en disco | VRAM estimada para inferencia | Encaje en GPU de consumo |
|---|---|---|---|
| Q2_K | 3,4 GB | ~4-4,5 GB | Si, en GPU de 6 GB o superiores; tambien en CPU |
| Q3_K_S | 3,9 GB | ~4,5-5 GB | Si, en GPU de 6 GB o superiores |
| Q3_K_M | 4,2 GB | ~5-5,5 GB | Si, en GPU de 6 GB o superiores |
| Q3_K_L | 4,5 GB | ~5,5-6 GB | Si, en GPU de 8 GB |
| IQ4_XS | 4,7 GB | ~6 GB | Si, en GPU de 8 GB |
| Q4_K_S | 4,9 GB | ~6-6,5 GB | Si, en GPU de 8 GB |
| Q4_K_M | 5,1 GB | ~6,5-7 GB | Si, en GPU de 8 GB |
| Q5_K_S | 5,8 GB | ~7-7,5 GB | Si, en GPU de 8-10 GB |
| Q5_K_M | 6,0 GB | ~7,5-8 GB | Si, en GPU de 10-12 GB |
| Q6_K | 6,8 GB | ~8,5-9 GB | Si, en GPU de 12 GB |
| Q8_0 | 8,8 GB | ~10,5-11 GB | Si, en GPU de 12-16 GB |
| F16 | 16,5 GB | ~18-19 GB | Si, en GPU de 24 GB |

- GPU recomendadas: para las variantes cuantizadas, cualquier GPU consumer con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). Para F16 se necesita una GPU de 24 GB (RTX 3090, RTX 4090) o una GPU de datacenter (A100 40/80 GB, H100). En despliegues multiusuario con contexto largo, es preferible una A100 o H100 aunque se use una cuantizacion Q4 o Q5, por el margen de cache KV.
- Ejecucion en CPU: viable en todas las variantes, con rendimiento aceptable de Q2_K a Q5_K_M en procesadores modernos con AVX2 o AVX-512. Las variantes Q8_0 y F16 son poco practicas en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y text-generation-webui (llama.cpp). vLLM tiene soporte GGUF experimental, pero no es la ruta recomendada para este repositorio; TGI no soporta GGUF. Para el modelo base en safetensors, las opciones son transformers, vLLM y TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia de primera token para ninguna de las variantes.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables dentro del material proporcionado. La busqueda web asociada no devolvio resultados relacionados con este modelo ni con modelos de recompensa o generacion de rubricas. La unica comparacion que puede establecerse con datos verificables es la del repositorio cuantizado frente a su modelo base.

| Aspecto | stellalisy/EvoLM-8B-Rubric (base) | mradermacher/EvoLM-8B-Rubric-GGUF |
|---|---|---|
| Parametros | 8.190.735.360 | 8.190.735.360 (los mismos) |
| Formato de pesos | safetensors (transformers) | GGUF |
| Variantes publicadas | no disponible | 12 (de Q2_K a F16) |
| Licencia | Apache 2.0 | Apache 2.0 |
| Idiomas | en | en |
| Ejecucion en CPU | no practica | si, en todas las variantes |
| Tamano del repositorio | no disponible | 73,4 GB en total |
| Quants ponderados o con imatrix | no aplica | no disponibles en el momento de la publicacion |
| Benchmarks publicados | no disponibles | no disponibles |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El repositorio no documenta la composicion del dataset de entrenamiento ni se han publicado evaluaciones de sesgo, por lo que no es posible caracterizar el comportamiento diferencial por genero, origen, religion u otras dimensiones.
- Riesgo de alucinacion: no cuantificado. En tareas de generacion de rubricas y de puntuacion, el riesgo relevante no es tanto la fabulacion de hechos como la produccion de criterios plausibles pero inadecuados para la tarea concreta, o la asignacion de puntuaciones inconsistentes entre ejecuciones.
- Riesgo de sesgos de juez: los modelos de recompensa tienden a favorecer respuestas largas, con formato llamativo o con determinados estilos de redaccion. No hay evidencia publicada en esta informacion sobre si EvoLM-8B-Rubric esta corregido frente a estos sesgos, por lo que cualquier uso como evaluador deberia acompanarse de una validacion contra anotaciones humanas.
- Limitacion idiomatica: el unico idioma declarado es el ingles. No hay garantia de comportamiento correcto en castellano ni en ningun otro idioma, y el rendimiento sera previsiblemente inferior.
- Longitud de contexto desconocida: no se indica la ventana de contexto del modelo, lo que impide planificar despliegues que dependan de entradas largas (documentos completos, historiales de conversacion extensos) sin verificacion empirica previa.
- Degradacion por cuantizacion: las variantes Q2_K y Q3_K son las mas agresivas y el propio autor desaconseja Q3_K_M ("lower quality"). Para tareas de evaluacion, donde pequenos cambios en la puntuacion pueden alterar decisiones, se recomienda Q6_K o Q8_0, o directamente el modelo base en safetensors.
- Ausencia de cuantizacion ponderada: el autor indica que no hay variantes con imatrix ni quants ponderados, lo que se traduce en una perdida de calidad algo mayor a igual tamano que en cuantizaciones con matriz de importancia.
- Licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion sin obligacion de compartir derivados, siempre que se conserve el aviso de licencia y la atribucion. Al ser un trabajo derivado de stellalisy/EvoLM-8B-Rubric, conviene verificar que el modelo base mantiene efectivamente la misma licencia.
- Madurez del repositorio: cero descargas y cero likes en la fecha de los datos, sin discusiones de comunidad, lo que implica ausencia de validacion independiente sobre el comportamiento de estas cuantizaciones.
- Model card minima: no hay informacion sobre contexto, plantilla de prompt, formato esperado de salida de las rubricas ni tokens especiales, lo que obliga a inspeccionar el tokenizador del modelo base antes de integrarlo en produccion.
- Uso responsable: emplear un modelo de 8B como juez automatico en decisiones con impacto sobre personas (seleccion de candidatos, evaluacion academica, moderacion) sin supervision humana y sin auditoria de sesgos es desaconsejable.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/EvoLM-8B-Rubric-GGUF
- Modelo base: https://huggingface.co/stellalisy/EvoLM-8B-Rubric
- Pagina de resumen y descargas del autor para este modelo: https://hf.tst.eu/model#EvoLM-8B-Rubric-GGUF
- Peticiones de cuantizacion y preguntas frecuentes del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad-perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre eleccion de cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de la cuantizacion: https://www.nethype.de/

Nota: la busqueda web realizada para esta ficha no devolvio ningun resultado relacionado con el modelo, con modelado de recompensas o con generacion de rubricas; los resultados obtenidos correspondian a productos de red domestica sin relacion con el contenido. Por tanto, no se han podido incorporar papers, blogs tecnicos ni demos adicionales.
