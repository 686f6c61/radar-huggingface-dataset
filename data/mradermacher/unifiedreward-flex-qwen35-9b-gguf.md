# mradermacher/UnifiedReward-Flex-qwen35-9b-GGUF

## Resumen

UnifiedReward-Flex-qwen35-9b es un modelo de recompensa (reward model) construido sobre una base Qwen de 9B parametros y afinado por CodeGoat24. Su funcion es evaluar y puntuar respuestas generadas por otros modelos, lo que lo convierte en una pieza clave para pipelines de RLHF, DPO y evaluacion automatica de calidad. El modelo se distribuye originalmente en formato transformers y esta version concreta es la cuantizacion GGUF realizada por mradermacher, pensada para inferencia local con llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que combina dos elementos practicos: por un lado, un modelo de recompensa de tamano medio (8.953.803.264 parametros, es decir, aproximadamente 9B) que puede ejecutarse en hardware de consumo gracias a las cuantizaciones de 4 a 6 bits; por otro, la disponibilidad de un proyector multimodal (mmproj) que sugiere capacidad de evaluacion sobre entradas de imagen ademas de texto. La licencia MIT facilita su uso comercial sin las restricciones habituales de otros modelos de recompensa.

El repositorio ocupa 83,0 GB e incluye desde cuantizaciones Q2_K de 3,9 GB hasta f16 de 18,0 GB, ademas de los ficheros mmproj. Esta pensado para investigadores y desarrolladores que necesitan un juez automatico local, reproducible y sin dependencia de APIs externas, especialmente en tareas de seleccion de respuestas, ranking y filtrado de datos sinteticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen, segun el nombre del modelo; detalles exactos no disponibles) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (esta version); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base es CodeGoat24/UnifiedReward-Flex-qwen35-9b, un reward model derivado de una base Qwen de 9B. La informacion disponible no detalla la arquitectura interna mas alla de la designacion "qwen35" en el nombre, que sugiere una variante de la familia Qwen. El entrenamiento se realizo sobre el dataset CodeGoat24/UnifiedReward-Flex-SFT-90K, un conjunto de 90.000 ejemplos de ajuste supervisado orientado a tareas de recompensa. No se dispone de informacion sobre el numero total de tokens, la composicion del dataset ni si se aplicaron fases de RLHF o DPO adicionales.

La innovacion practica de esta version es la cuantizacion GGUF estatica realizada por mradermacher, que preserva el proyector multimodal en ficheros separados (mmproj-Q8_0 y mmproj-f16). Esto permite desplegar el modelo en llama.cpp con soporte de vision, algo poco habitual en modelos de recompensa. No se documentan tecnicas como decodificacion especulativa, attention linear ni arquitecturas hibridas.

## Capacidades

- Evaluacion y puntuacion de respuestas generadas por otros modelos (reward modeling), incluyendo ranking y seleccion de la mejor respuesta entre varias candidatas.
- Capacidad multimodal: la presencia de ficheros mmproj indica soporte de entrada de imagen ademas de texto, aunque no se detalla el alcance exacto.
- Generacion de texto conversacional, segun la etiqueta `conversational` del repositorio.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su integracion en infraestructuras de inferencia estandar.
- Uso en pipelines de RLHF y DPO como modelo de recompensa para puntuar trayectorias y respuestas.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan explicitamente tool calling, function calling, modo thinking ni soporte de agentes multi-paso.

## Casos de uso

- Filtrado de datos sinteticos: el modelo puntua respuestas generadas por modelos grandes y permite descartar las de baja calidad antes de usarlas en entrenamiento, reduciendo el ruido en datasets de SFT.
- RLHF y DPO a escala local: al caber en GPUs de consumo en cuantizacion Q4_K_M (5,7 GB), permite montar un pipeline de preferencias sin depender de APIs externas ni de GPUs de datacenter.
- Evaluacion automatica de asistentes conversacionales: se usa como juez para comparar respuestas de distintos modelos o versiones y generar rankings reproducibles en pruebas de regresion.
- Seleccion de la mejor respuesta (best-of-N): en sistemas de generacion con muestreo multiple, el reward model elige la candidata con mayor puntuacion antes de devolverla al usuario.
- Evaluacion multimodal de descripciones de imagen: gracias al proyector mmproj, puede puntuar respuestas que describen o razonan sobre imagenes en tareas de captioning y VQA.
- Investigacion academica en alineamiento: su licencia MIT y su tamano manejable lo hacen adecuado para experimentos de investigacion sobre funciones de recompensa y sesgos de evaluacion.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp, los datos de evaluacion no salen de la infraestructura del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB con Q2_K (3,9 GB de pesos), 6-7 GB con Q4_K_M (5,7 GB), 8-9 GB con Q6_K (7,5 GB) y 10-11 GB con Q8_0 (9,6 GB). Añadir 0,7-1,0 GB si se carga el proyector multimodal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 para cuantizaciones altas; A100 y H100 para f16 y despliegues de alto throughput.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_M o inferiores. Las cuantizaciones Q2_K y Q3_K_S caben en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el modelo base puede servirse con vLLM o TGI en formato transformers.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 9B, el throughput en una RTX 4090 con Q4_K_M deberia ser del orden de decenas de tokens por segundo, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| UnifiedReward-Flex-qwen35-9b (esta ficha) | ~9B | no disponible | MIT | GGUF, transformers | Reward model multimodal con mmproj |
| Modelo base CodeGoat24/UnifiedReward-Flex-qwen35-9b | ~9B | no disponible | MIT | transformers | Version sin cuantizar del mismo modelo |
| Versiones i1-GGUF de mradermacher | ~9B | no disponible | MIT | GGUF (imatrix) | Cuantizaciones ponderadas con imatrix, misma base |
| Otros reward models de la familia UnifiedReward | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo esta entrenado y declarado unicamente para ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- Al ser un reward model, puede heredar sesgos de preferencia del dataset de SFT (CodeGoat24/UnifiedReward-Flex-SFT-90K), cuyo contenido y balance no se documentan.
- Riesgo de alucinacion y de puntuaciones inconsistentes: los reward models pueden sobrevalorar respuestas largas, con formato atractivo o que imitan el estilo del dataset de entrenamiento.
- La cuantizacion Q2_K y Q3_K_S degradan la calidad de las puntuaciones; para evaluacion seria se recomienda Q5_K_M o superior.
- No se documentan la longitud de contexto ni el comportamiento en conversaciones largas, lo que limita su uso en tareas de contexto extendido sin validacion previa.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base y del dataset de entrenamiento antes de un uso comercial a gran escala.
- El repositorio ocupa 83,0 GB; descargar solo la cuantizacion necesaria para evitar consumo innecesario de almacenamiento.
- No se dispone de informacion sobre tool calling ni soporte de agentes, por lo que no debe asumirse su funcionamiento en esos escenarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/UnifiedReward-Flex-qwen35-9b-GGUF
- Modelo base: https://huggingface.co/CodeGoat24/UnifiedReward-Flex-qwen35-9b
- Dataset de entrenamiento: https://huggingface.co/datasets/CodeGoat24/UnifiedReward-Flex-SFT-90K
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/UnifiedReward-Flex-qwen35-9b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#UnifiedReward-Flex-qwen35-9b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
