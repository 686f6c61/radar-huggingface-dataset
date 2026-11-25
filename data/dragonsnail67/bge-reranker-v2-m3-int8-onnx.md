# dragonsnail67/bge-reranker-v2-m3-int8-onnx

## Resumen

`dragonsnail67/bge-reranker-v2-m3-int8-onnx` es una version cuantizada a 8 bits del cross-encoder de reranking `BAAI/bge-reranker-v2-m3`, exportada al formato ONNX y publicada por el usuario dragonsnail67. El modelo original lo desarrolla el Beijing Academy of Artificial Intelligence (BAAI) y se usa en pipelines de recuperacion de informacion para reordenar pares (consulta, documento) segun su relevancia. Esta version concreta no introduce cambios en los pesos mas alla del redondeo a 8 bits; su proposito es reducir el peso y el coste computacional para poder ejecutarlo en servidores CPU modestos.

El repositorio ocupa 0,6 GB y esta pensado como componente de un prototipo academico llamado GreenSearch (asignatura de PLN, segun la model card). No es un modelo generativo: produce un logit de relevancia por par consulta-documento, lo que lo situa en la fase de reranking de un sistema RAG o de busqueda. La licencia declarada es Apache 2.0, heredada del modelo base.

Su relevancia practica es limitada pero concreta: permite desplegar un reranker multilingue de BAAI sin GPU, a cambio de una perdida de precision no documentada. Al no haber benchmarks publicados ni descargas, debe tratarse como un artefacto de prototipo y no como una release validada para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (base: BAAI/bge-reranker-v2-m3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8, cuantizacion dinamica con onnxruntime |
| Idiomas soportados | no disponible (el modelo base es multilingue; el tag `indonesian` figura en el repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8) |
| Tamano del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: recibe un par (consulta, documento) concatenado y emite un unico logit de relevancia. No genera texto ni embeddings reutilizables; su salida es una puntuacion que se usa para reordenar candidatos recuperados por un retriever previo. La arquitectura subyacente corresponde al modelo `BAAI/bge-reranker-v2-m3` de BAAI, del que no se detallan en la informacion disponible el numero de capas, dimension oculta ni volumen de tokens de entrenamiento.

La unica transformacion aplicada por el autor es una cuantizacion dinamica a 8 bits mediante onnxruntime y la exportacion a ONNX. No hay fine-tuning, destilacion ni cambios en los datos de entrenamiento: los pesos son los del modelo base redondeados. La model card no documenta el procedimiento exacto de calibracion ni la perdida de calidad respecto al original.

## Capacidades

- Puntuacion de relevancia para pares (consulta, documento) en pipelines de reranking.
- Uso como segunda etapa en arquitecturas retrieve-and-rerank y en sistemas RAG.
- Capacidad multilingue heredada del modelo base BAAI (no verificada en esta version).
- Ejecucion en CPU mediante ONNX Runtime, sin necesidad de GPU.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso.
- No soporta vision ni audio.
- No soporta modo thinking ni decodificacion especulativa.

## Casos de uso

- Reranking en un RAG sobre CPU: se recuperan N documentos con un retriever vectorial y se reordenan con este cross-encoder en ONNX, aprovechando que la cuantizacion int8 reduce el coste por par y permite desplegarlo en un servidor sin GPU.
- Busqueda documental interna: reordenar resultados de un buscador lexico o denso en una intranet con recursos limitados, donde no es viable servir un reranker en fp16.
- Prototipos academicos y trabajos de asignatura: el caso declarado por el autor (GreenSearch) muestra su uso como componente de bajo coste en un proyecto de PLN sin infraestructura dedicada.
- Filtrado de contexto en asistentes: puntuar fragmentos recuperados antes de pasarlos a un LLM generativo, reduciendo tokens de entrada y ruido en el prompt.
- Evaluacion offline de sistemas de recuperacion: calcular metricas de ranking (nDCG, MRR) sobre conjuntos de pares con un modelo ligero y reproducible en CPU.
- Despliegue en entornos con restricciones de memoria: el repositorio de 0,6 GB y la cuantizacion int8 encajan en contenedores pequenos o dispositivos edge donde el modelo original no cabria.
- Clasificacion ligera de pares pregunta-respuesta en un FAQ: usar el logit como umbral para decidir si una respuesta candidata es suficientemente relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye comparaciones con el modelo base ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, el repositorio de 0,6 GB sugiere un consumo de memoria inferior a 1 GB en int8, aunque no hay cifras publicadas.
- GPU recomendadas: no disponibles. El modelo esta pensado para CPU con ONNX Runtime.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del repositorio, pero no hay datos verificados.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), integrable en pipelines de Python; no se documenta soporte especifico para vLLM, TGI, llama.cpp ni Ollama, que no estan orientados a cross-encoders ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| dragonsnail67/bge-reranker-v2-m3-int8-onnx | no disponible | no disponible | ONNX int8 | Apache 2.0 | Version cuantizada para CPU de un prototipo |
| BAAI/bge-reranker-v2-m3 | no disponible | no disponible | safetensors (original) | Apache 2.0 | Modelo base, precision completa, mantenido por BAAI |
| BAAI/bge-reranker-base | no disponible | no disponible | safetensors | Apache 2.0 | Reranker de menor tamano de la misma familia |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | no disponible | no disponible | safetensors | Apache 2.0 | Alternativa ligera en ingles, muy usada en reranking |

Los datos de parametros y contexto de las alternativas no estan disponibles en la informacion proporcionada; la comparacion se limita a formato, licencia y procedencia.

## Limitaciones y advertencias

- No hay benchmarks ni validacion publicada de la perdida de calidad tras la cuantizacion int8 respecto al modelo base.
- El repositorio tiene 0 descargas y 0 likes: es un artefacto de prototipo sin uso comunitario verificado.
- La model card esta en indonesio y es muy escueta; no documenta el proceso de exportacion, la calibracion ni los ficheros incluidos.
- El tag `indonesian` sugiere un enfoque en ese idioma, aunque el modelo base es multilingue; el rendimiento real por idioma no esta verificado.
- Riesgo de alucinacion no aplica en sentido generativo, pero el logit de relevancia puede ser poco fiable fuera del dominio de entrenamiento del modelo base.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base BAAI antes de un uso comercial.
- No es un modelo generativo: no debe usarse para tareas de generacion, agentes ni tool calling.
- Para produccion se recomienda validar contra el modelo base en el dominio concreto y medir la degradacion introducida por la cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dragonsnail67/bge-reranker-v2-m3-int8-onnx
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Organizacion BAAI en Hugging Face: https://huggingface.co/BAAI
- ONNX Runtime: https://onnxruntime.ai/
