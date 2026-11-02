# mradermacher/Qwen3.5-4B-heretic-2.0-GGUF

## Resumen

Qwen3.5-4B-heretic-2.0-GGUF es una cuantizacion estatica en formato GGUF del modelo p-e-w/Qwen3.5-4B-heretic-2.0, una variante "abliterated" (tambien etiquetada como uncensored, decensored y heretic) del Qwen3.5-4B de Alibaba. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, y mantiene la licencia Apache 2.0 del modelo original. El modelo base cuenta con 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y esta pensado para ejecucion local en hardware de consumo mediante llama.cpp y derivados.

La relevancia de esta ficha reside en dos factores. Por un lado, ofrece el modelo en un abanico amplio de cuantizaciones (desde Q2_K de 2,0 GB hasta f16 de 8,5 GB), lo que permite desplegarlo en GPUs consumer con VRAM limitada. Por otro, la variante heretic/abliterated elimina total o parcialmente los mecanismos de rechazo del modelo original, lo que interesa a quienes investigan alineacion, seguridad de LLM o necesitan un modelo con menos restricciones conductuales para tareas creativas o de analisis de contenido sensible.

Conviene subrayar que la model card del repositorio es fundamentalmente la plantilla estandar de mradermacher para cuantizaciones: no incluye datos de arquitectura especificos, contexto, benchmarks ni detalles del proceso de abliteration. Toda la informacion tecnica adicional que aparece a continuacion se infiere de los metadatos disponibles o se marca explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B; arquitectura transformer segun familia Qwen, sin confirmar en la informacion proporcionada) |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no aplica (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (segun metadatos; el modelo base Qwen suele ser multilingue, pero no se confirma en la informacion proporcionada) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El modelo base es Qwen3.5-4B de Alibaba, integrado en la familia Qwen3.5, que emplea arquitecturas transformer con atencion por grupos (GQA) y decodificacion autoregresiva, si bien estos detalles no se confirman en la model card consultada. El proceso de "abliteration" (eliminacion de la direccion de rechazo en el espacio de activaciones) es el que da lugar a la variante heretic-2.0, pero la model card no documenta la metodologia concreta, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La unica innovacion tecnica documentada es el propio proceso de cuantizacion: mradermacher genera cuantizaciones estaticas (no ponderadas ni con imatrix en esta publicacion, segun indica el autor) y proporciona ficheros mmproj para el componente multimodal. El autor advierte que las cuantizaciones ponderadas/imatrix "no parecen estar disponibles" en el momento de la publicacion y que podrian no planificarse.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el idioma declarado.
- Modo "uncensored/abliterated": reduce o elimina los rechazos del modelo original ante peticiones que el modelo base declinaria.
- Capacidades multimodales: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que sugiere soporte de entrada de imagenes o vision, aunque no se detalla en la model card.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante infraestructura compatible con la API de HuggingFace.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles; no se confirma soporte de otros idiomas.

## Casos de uso

- Investigacion en seguridad y alineacion de LLM: el modelo permite estudiar el comportamiento de un modelo abliterated frente al original, comparando tasas de rechazo, sesgos y calidad de respuesta en el mismo conjunto de prompts.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa con tematicas adultas o sensibles donde el modelo base aplicaria rechazos, ejecutandose localmente con cuantizaciones Q4_K_M (2,8 GB) en una GPU consumer.
- Analisis de contenido sensible: clasificacion, resumen o extraccion de informacion de textos que incluyen lenguaje ofensivo, violencia o material para adultos, sin que el modelo se niegue a procesarlos.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_S o Q4_K_M (2,7-2,8 GB) cabe en GPUs de 8 GB o incluso en CPU mediante llama.cpp, lo que facilita prototipado sin dependencia de la nube.
- Procesamiento multimodal ligero: el fichero mmproj permite experimentar con entrada de imagenes en llama.cpp, util para tareas de descripcion o extraccion de texto de imagenes en local.
- Evaluacion comparativa de cuantizaciones: el amplio abanico (de Q2_K a f16) permite medir el impacto de la cuantizacion en la calidad y la tasa de rechazo, util para equipos que calibran presupuestos de VRAM.
- Red teaming y generacion de prompts adversarios: al carecer de filtros de rechazo, sirve para generar conjuntos de datos de ataques o casos limite para entrenar clasificadores de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB (Q2_K), 2,7-2,8 GB (Q4_K_S/Q4_K_M), 3,6 GB (Q6_K), 4,6 GB (Q8_0) y 8,5 GB (f16), a los que se suma el fichero mmproj si se usa el componente multimodal (0,5-0,8 GB).
- GPU recomendadas: cualquier GPU consumer con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) para cuantizaciones Q4; GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) para Q6/Q8; A100 o H100 no son necesarias para un modelo de 4,2 B.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas usando Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, pero esta version GGUF esta pensada para llama.cpp.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic-2.0-GGUF (este) | 4,2 B | no disponible | Apache 2.0 | GGUF | Variante abliterated, cuantizaciones estaticas |
| p-e-w/Qwen3.5-4B-heretic-2.0 | 4,2 B | no disponible | Apache 2.0 | safetensors | Modelo base del que deriva esta cuantizacion |
| Qwen3.5-4B (original) | 4,2 B | no disponible | Apache 2.0 | safetensors | Modelo sin abliteration, con rechazos estandar |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La abliteration elimina o reduce los rechazos de seguridad: el modelo puede generar contenido ofensivo, ilegal o danino sin filtros, lo que exige supervision humana en produccion.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad ni benchmarks para esta variante; la cuantizacion Q2_K y Q3_K_M degradan aun mas la calidad.
- Sesgos conocidos: no documentados en la model card; el modelo base Qwen puede arrastrar sesgos de sus datos de entrenamiento, pero no hay analisis disponible.
- Limitaciones de idioma: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta verificado.
- Limitaciones de contexto: la longitud de contexto no se especifica en la informacion proporcionada, por lo que no puede garantizarse el comportamiento en conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias; conviene revisar la licencia del modelo base Qwen3.5-4B enlazada en la model card.
- Cuantizaciones estaticas sin imatrix: el autor advierte que las versiones ponderadas no estan disponibles, lo que puede suponer una perdida de calidad mayor que en cuantizaciones con imatrix a igual tamano.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.5-4B-heretic-2.0-GGUF
- Modelo base: https://huggingface.co/p-e-w/Qwen3.5-4B-heretic-2.0
- Modelo original Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Pagina de overview de cuantizaciones del autor: https://hf.tst.eu/model#Qwen3.5-4B-heretic-2.0-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa del autor): https://www.nethype.de/
