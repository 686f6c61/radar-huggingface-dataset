# mradermacher/KODA-35B-GGUF

## Resumen

KODA-35B-GGUF es la distribucion en formato GGUF del modelo KODA-35B desarrollado por Baidu-Baige, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de aproximadamente 34.660 millones de parametros (34,66B) orientado a tareas de codigo y conversacion, segun los tags de la model card (`code`, `fine-tuned`, `conversational`). La version original esta disponible en transformers, y esta publicacion ofrece los pesos cuantizados listos para su uso con llama.cpp y ecosistemas compatibles con GGUF.

La relevancia de esta ficha radica en que el repositorio GGUF permite ejecutar un modelo de ~35B en hardware de consumo mediante cuantizaciones que van desde Q2_K (13,0 GB) hasta Q8_0 (37,0 GB), incluyendo ademas dos ficheros `mmproj` (multi-modal supplement) que indican soporte de entrada multimodal en el modelo base. La licencia Apache 2.0 facilita su adopcion tanto en entornos de investigacion como comerciales.

No obstante, la informacion publicada es limitada: no se detallan la longitud de contexto, la composicion del dataset de entrenamiento, los idiomas soportados ni resultados de benchmarks. Esta ficha refleja exclusivamente los datos disponibles y marca explicitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de la familia KODA-35B; detalles no publicados) |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura interna del modelo base Baidu-Baige/KODA-35B en la informacion disponible. Los tags del repositorio indican `transformers`, `gguf`, `gpu-kernels`, `cuda`, `code`, `fine-tuned` y `conversational`, lo que sugiere un modelo transformer afinado para codigo y dialogo. El recuento de parametros (34,66B) corresponde a un modelo denso de gran tamano, sin indicios de arquitectura MoE.

Respecto al entrenamiento, no se especifican el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La presencia de ficheros `mmproj` (multi-modal supplement) en la publicacion GGUF sugiere que el modelo base incorpora capacidad de proyeccion multimodal (vision-lenguaje), aunque no se detalla el alcance ni el codificador visual empleado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno (tag `conversational`).
- Generacion y asistencia en codigo (tag `code`, `fine-tuned`).
- Entrada multimodal: la presencia de ficheros `mmproj-Q8_0` y `mmproj-f16` indica soporte de proyeccion vision-lenguaje en el modelo base.
- Compatibilidad con endpoints (`endpoints_compatible` segun tags).
- Capacidades de razonamiento, matematicas, tool calling o agentes: no documentadas en la informacion disponible.
- Capacidades multilingues: la model card solo declara `en`; no se confirman otros idiomas.

## Casos de uso

- Asistente de programacion en local: con la cuantizacion Q4_K_M (21,3 GB) el modelo puede ejecutarse en una GPU de 24 GB y emplearse como asistente de codigo en el IDE mediante llama.cpp o servidores compatibles, sin depender de APIs externas.
- Generacion de codigo en pipelines de CI/CD: el modelo puede integrarse en flujos automatizados de revision y generacion de parches gracias a su naturaleza afinada para codigo y su licencia Apache 2.0, que permite uso comercial.
- Chat conversacional autoalojado: la variante Q5_K_M (24,8 GB) permite desplegar un asistente conversacional en infraestructura propia para equipos que requieren confidencialidad de datos.
- Procesamiento de documentacion tecnica: con las cuantizaciones Q6_K o Q8_0 (28,6 GB y 37,0 GB respectivamente) se obtiene la maxima fidelidad para tareas de resumen y extraccion sobre documentacion de ingenieria.
- Analisis de capturas o diagramas tecnicos: los ficheros `mmproj` habilitan el uso del modelo como modelo vision-lenguaje para interpretar imagenes junto a texto, por ejemplo diagramas de arquitectura o capturas de errores.
- Despliegue en hardware de consumo: la variante Q2_K (13,0 GB) permite ejecutar el modelo en GPUs de 16 GB o en configuraciones con RAM suficiente, habilitando pruebas y prototipado en estaciones de trabajo modestas.
- Experimentacion e investigacion: al ser una cuantizacion GGUF de un modelo de 35B con licencia permisiva, resulta util para estudiar el impacto de la cuantizacion en la calidad de salida en tareas de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero, sin overhead de contexto): Q2_K 13,0 GB; Q3_K_S 15,3 GB; Q3_K_M 16,9 GB; Q3_K_L 18,2 GB; IQ4_XS 19,0 GB; Q4_K_S 20,0 GB; Q4_K_M 21,3 GB; Q5_K_S 24,1 GB; Q5_K_M 24,8 GB; Q6_K 28,6 GB; Q8_0 37,0 GB. A estos valores hay que sumar la VRAM del contexto KV y los buffers de ejecucion.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_S; A100 40 GB o H100 para Q6_K y Q8_0; RTX 3090 (24 GB) para Q4_K_M.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones Q4 o Q5; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o servidores de inferencia que acepten GGUF). La model card referencia los README de TheBloke para el uso de ficheros GGUF multiparte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas (contexto, benchmarks) del modelo base en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas de la misma categoria. A modo orientativo, el modelo se situa en la franja de ~35B parametros densos, donde compiten modelos como Qwen2.5-32B o Gemma-2-27B, pero no se dispone de datos que permitan comparar parametros activos, contexto, rendimiento ni calidad de forma verificable.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF disponible |
|---|---|---|---|---|
| KODA-35B (este) | ~34,66B | no disponible | Apache 2.0 | si (esta publicacion) |
| Alternativas de ~30-35B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Informacion incompleta: no se publican contexto, dataset de entrenamiento, idiomas completos ni benchmarks, lo que dificulta evaluar su idoneidad en produccion.
- Idiomas: la model card solo declara ingles (`en`); el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad.
- Sesgos: no se documentan analisis de sesgos ni medidas de mitigacion.
- Cuantizacion: las cuantizaciones bajas (Q2_K, Q3_K) degradan la calidad; para tareas de codigo se recomienda Q4_K_M o superior.
- Multimodalidad: los ficheros `mmproj` indican soporte de proyeccion multimodal, pero no se detalla el codificador ni la calidad de la capacidad vision.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Baidu-Baige/KODA-35B en su repositorio original.
- Repositorio de gran tamano (238,6 GB): requiere descarga selectiva del fichero de cuantizacion deseado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/KODA-35B-GGUF
- Modelo base: https://huggingface.co/Baidu-Baige/KODA-35B
- Pagina de descargas del autor: https://hf.tst.eu/model#KODA-35B-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
