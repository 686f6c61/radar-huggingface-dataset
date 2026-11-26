# mradermacher/UAE-GIS-Large-V1-GGUF

## Resumen

UAE-GIS-Large-V1-GGUF es la version cuantizada en formato GGUF del modelo de embeddings UAE-GIS-Large-V1, desarrollado originalmente por SeanLee97 y convertido a GGUF por mradermacher. Se trata de un modelo de extraccion de caracteristicas (feature extraction) disenado especificamente para medir similitud semantica entre issues de GitHub, segun indica el dataset de entrenamiento WhereIsAI/github-issue-similarity. Con 334.092.288 parametros (aproximadamente 334 millones), se situa en la gama de modelos de embeddings de tamano medio-grande, orientado a tareas de recuperacion y comparacion de texto tecnico.

El modelo se distribuye bajo licencia MIT, lo que facilita su uso comercial y su integracion en pipelines de busqueda semantica o sistemas de recomendacion de issues. La version GGUF permite ejecutar el modelo en CPU y en GPUs de consumo mediante llama.cpp y herramientas compatibles, algo relevante para equipos que no disponen de infraestructura de GPU dedicada. El repositorio tiene un tamano de 3,1 GB e incluye multiples niveles de cuantizacion, desde Q2_K (0,2 GB) hasta f16 (0,8 GB).

La relevancia actual de este modelo radica en su especializacion: en lugar de un embedding generico, esta ajustado para el dominio de issues de GitHub, lo que puede mejorar la precision en tareas de deduplicacion de incidencias, busqueda de bugs relacionados y clasificacion automatica de tickets. Al estar disponible en GGUF, se puede desplegar en entornos con recursos limitados sin renunciar a un modelo de 334 millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings tipo transformer, segun modelo base) |
| Parametros totales | 334.092.288 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (version cuantizada); el modelo base original en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Por el tipo de tarea (feature extraction) y el tamano (334 millones de parametros), se trata presumiblemente de un transformer encoder orientado a generar embeddings de frases o documentos. El modelo fue ajustado sobre el dataset WhereIsAI/github-issue-similarity, lo que indica un entrenamiento especifico para similitud entre issues de GitHub, probablemente mediante objetivos contrastivos o de pares similares/no similares.

La version aqui descrita es una cuantizacion estatica realizada por mradermacher con la herramienta de conversion a GGUF. El autor indica que no hay cuantizaciones con imatrix/weighted disponibles en el momento de la publicacion. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO, por lo que estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de embeddings de texto para tareas de similitud semantica y recuperacion de informacion.
- Especializacion en el dominio de issues de GitHub: comparacion de incidencias, deteccion de duplicados y busqueda de problemas relacionados.
- Extraccion de caracteristicas (feature extraction) compatible con la libreria transformers y con el pipeline de embeddings.
- Soporte de inferencia en CPU y GPU mediante el formato GGUF y llama.cpp.
- Capacidad multilingue limitada: solo se declara soporte para ingles.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Deduplicacion de issues en repositorios de GitHub: calcular embeddings de cada issue y agrupar los que superen un umbral de similitud, reduciendo el ruido en la gestion de incidencias.
- Busqueda semantica de bugs relacionados: indexar los embeddings de issues historicos y recuperar los mas cercanos a un nuevo reporte para sugerir soluciones previas.
- Clasificacion automatica de tickets: usar el embedding como entrada a un clasificador ligero que asigne etiquetas o equipos responsables segun la similitud con issues ya etiquetados.
- Sistemas de recomendacion de contribuciones: sugerir issues abiertos a desarrolladores en funcion de la similitud con sus contribuciones previas.
- Monitorizacion de duplicados en foros tecnicos o sistemas de soporte: comparar mensajes entrantes con una base de conocimiento vectorizada para detectar consultas repetidas.
- Construccion de un motor de busqueda interno sobre documentacion tecnica en ingles: generar embeddings de fragmentos y consultas para recuperacion por similitud coseno en un indice vectorial.
- Filtrado de spam o contenido irrelevante en repositorios: medir la distancia semantica entre un issue nuevo y el corpus de issues legitimos para descartar entradas anomalas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en Q2_K, 0,3 GB en Q4_K_M, 0,5 GB en Q8_0 y 0,8 GB en f16 (solo pesos; hay que anadir el overhead de contexto y del runtime).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; para el modelo base original, transformers con sentence-transformers o similares.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser un modelo de 334 millones de parametros, se espera una latencia baja en GPU y moderada en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| UAE-GIS-Large-V1-GGUF (este) | 334 M | no disponible | MIT | GGUF | Especializado en similitud de issues de GitHub |
| Modelos de embeddings genericos de tamano similar (p. ej. familia BGE o E5) | ~300-500 M | variable | variable | safetensors, GGUF | No disponibles en la informacion proporcionada; comparacion no verificada |
| Modelos de embeddings multilingues | variable | variable | variable | variable | No disponibles en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo verificables en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Solo soporta ingles; su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Es un modelo de embeddings, no generativo: no puede responder preguntas ni mantener conversaciones.
- El ajuste esta orientado a issues de GitHub; su rendimiento fuera de ese dominio puede degradarse respecto a modelos de embeddings genericos.
- Riesgo de sesgos inheridos del dataset WhereIsAI/github-issue-similarity, que no se detalla en la informacion disponible.
- No se han publicado evaluaciones de benchmarks, por lo que la calidad real en produccion debe validarse empiricamente.
- Las cuantizaciones de baja precision (Q2_K, Q3_K) pueden degradar la calidad de los embeddings; se recomienda Q4_K_M o superior para uso en produccion.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las condiciones del modelo base original y del dataset de entrenamiento.
- No hay cuantizaciones imatrix/weighted disponibles segun el autor.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/UAE-GIS-Large-V1-GGUF
- Modelo base: https://huggingface.co/SeanLee97/UAE-GIS-Large-V1
- Dataset de entrenamiento: https://huggingface.co/datasets/WhereIsAI/github-issue-similarity
- Pagina de descargas del autor: https://hf.tst.eu/model#UAE-GIS-Large-V1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
