# sekkit/Mistral-Large-4-1T-A52B

## Resumen

Mistral Large 4 (apodado "Le Chonk") es el modelo de lenguaje mas grande publicado hasta la fecha por Mistral AI: un Mixture-of-Experts nativamente multimodal con aproximadamente 1 billon de parametros totales y unos 52.000 millones activos por token (49.000 millones en los expertos enrutados mas embeddings y capa de salida). Ha sido entrenado desde cero en 3.800 GPUs NVIDIA Grace Blackwell en los propios centros de datos de Mistral en Europa, y unifica en un unico conjunto de pesos el seguimiento de instrucciones, el razonamiento, la generacion de codigo y los flujos agenticos.

El modelo destaca por tres decisiones de diseno: una ventana de contexto de 1 millon de tokens, una entrada multimodal texto-imagen con codificador visual de estilo Pixtral preparado para tamanos y relaciones de aspecto variables, y un modo de razonamiento con tres niveles de esfuerzo (`low`, `medium`, `high`) configurables por peticion. Ademas, el checkpoint incluye una cabeza de decodificacion especulativa DSpark embebida, lo que acelera la inferencia sin necesidad de un modelo borrador externo.

Es relevante ahora porque se posiciona como la alternativa occidental de pesos abiertos mas capaz en cargas de trabajo de ciberseguridad, finanzas y derecho, y porque su licencia (Mistral Ecosystem Open-Weight License, una variante modificada de MIT) permite uso comercial amplio salvo la operacion de un servicio gestionado (Model-as-a-Service) sin licencia especifica. El repositorio ocupa 1.060,6 GB en formato transformers y existe un checkpoint cuantizado NVFP4 orientado a GPUs Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts multimodal (texto e imagen) con 128 expertos enrutados, 4 activos por token y 1 experto compartido; codificador visual estilo Pixtral |
| Parametros totales | ~1 billon (1T) |
| Parametros activos | ~52.000 millones por token (49B en expertos enrutados + embeddings y capa de salida) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (checkpoint oficial cuantizado); soporte de fp8 en los tags del repositorio |
| Idiomas soportados | 160+ idiomas, incluidas todas las lenguas oficiales de la Union Europea; la model card lista 39 codigos ISO (en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, sk, sl) |
| Licencia | Mistral Ecosystem Open-Weight License (MIT modificada; uso comercial permitido, Model-as-a-Service requiere licencia aparte) |
| Formato de pesos | safetensors (transformers); checkpoint NVFP4 separado; soporte en vLLM, SGLang y llama.cpp |

## Arquitectura y entrenamiento

La arquitectura es un transformer Mixture-of-Experts de granularidad fina: 128 expertos enrutados con 4 activos por token mas un experto compartido siempre activo, lo que da el ratio de ~52B activos sobre ~1T totales. El entrenamiento se realizo desde cero sobre 3.800 GPUs NVIDIA Grace Blackwell en infraestructura propia de Mistral en Europa; la model card no especifica el numero exacto de tokens de entrenamiento ni la composicion del dataset. La multimodalidad es nativa: un codificador visual de estilo Pixtral procesa imagenes de tamano y relacion de aspecto variables y las proyecta al espacio del modelo de lenguaje, con salida exclusivamente de texto.

Entre las innovaciones tecnicas destacables figuran el modo de razonamiento con esfuerzo configurable por peticion, la cabeza de decodificacion especulativa DSpark embebida en el checkpoint (que evita desplegar un modelo borrador separado) y el cumplimiento estricto de esquemas JSON para function calling. La model card no detalla si hubo RLHF, DPO u otras etapas de alineamiento posteriores al preentrenamiento, ni el volumen de tokens empleado.

## Capacidades

- Generacion de texto y razonamiento con tres niveles de esfuerzo (`low`, `medium`, `high`; por defecto `high`), ajustables por peticion.
- Generacion de codigo y agentes de codificacion, con buen rendimiento por token consumido segun la model card.
- Vision: analisis de imagenes, graficos, dibujos tecnicos y documentos, con grounding visual de referencia entre modelos de pesos abiertos.
- Function calling nativo, salida JSON y aplicacion estricta de esquemas JSON.
- Flujos agenticos multi-paso y adherencia fuerte a system prompts.
- Multilingue nativo en 160+ idiomas, incluidas todas las lenguas oficiales de la UE.
- Especial rendimiento en ciberseguridad (con rechazo de peticiones maliciosas), finanzas y derecho.
- Contexto largo de hasta 1M tokens para cargas de trabajo con documentos extensos.

## Casos de uso

- Agentes de codificacion en produccion: el modelo puede operar pipelines de CI/CD y tareas de refactorizacion multi-archivo gracias a su contexto de 1M tokens y a su soporte nativo de function calling; la model card destaca que logra resultados cercanos al lider con un 47% menos de tokens por tarea, lo que abarata el coste por ejecucion.
- Analisis de documentos legales y contractuales: con 1M de tokens de contexto puede ingerir contratos completos, expedientes o jurisprudencia y responder con citas, un escenario donde la model card reporta rendimiento especialmente bueno.
- Ciberseguridad defensiva: triaje de alertas, analisis de trazas y asistencia en respuesta a incidentes, con rechazo de peticiones maliciosas; Mistral lo situa como estado del arte entre modelos de pesos abiertos en este dominio.
- Atencion al cliente multilingue: conversaciones multi-turno en cualquiera de las lenguas oficiales de la UE con adherencia a system prompts y salida JSON estructurada para integracion con CRM.
- Extraccion de datos de documentos escaneados: al aceptar imagen y texto, puede procesar facturas, formularios e informes con graficos y devolver JSON validado contra un esquema.
- Asistencia financiera y analisis de informes: resumen y comparacion de memorias anuales, estados financieros y presentaciones con graficos, usando el modo de razonamiento `high` para calculos y `low` para respuestas rapidas.
- Grounding visual en herramientas internas: localizacion de elementos en capturas de pantalla o planos tecnicos para automatizacion de interfaces y verificacion de documentos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Artificial Analysis Coding Agent Index | 48% | Practicamente empatado con GLM-5.3, usando un 47% menos de tokens por tarea de media |
| Artificial Analysis Intelligence Index v5 | 26 | El mas alto entre modelos de pesos abiertos occidentales; los mejores modelos abiertos chinos puntuan mas alto en este indice agregado |

La model card remite al blog oficial para benchmarks adicionales de ciberseguridad, finanzas y derecho, pero no incluye sus cifras en el repositorio. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks clasicos.

## Requisitos de hardware

- El checkpoint completo en safetensors ocupa 1.060,6 GB en el repositorio; en bf16 se necesitan del orden de 2 TB de VRAM agregada solo para pesos, por lo que el despliegue requiere multiples nodos con GPUs de centro de datos.
- El checkpoint NVFP4 oficial reduce la huella de memoria y acelera la inferencia con el mismo rendimiento declarado; esta orientado a GPUs Blackwell (serie B200/GB200) y soporta vLLM y SGLang.
- No cabe en GPUs de consumo (RTX 4090, 5090) en ninguna configuracion practica: el numero de parametros activos (~52B) ya excede la VRAM de una unica GPU consumer incluso en cuantizaciones agresivas.
- Opciones de despliegue soportadas segun los tags y la model card: transformers, vLLM, SGLang y llama.cpp; tambien esta disponible en la API de Mistral como `mistral-large-4`.
- La cabeza de decodificacion especulativa DSpark viene embebida en el checkpoint, lo que mejora la latencia sin desplegar un modelo borrador adicional.
- No se han publicado en la informacion disponible cifras concretas de latencia ni throughput (tokens por segundo) por configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Large 4 (1T-A52B) | ~1T totales / ~52B activos | 1M | AA Coding Agent Index 48%; AA Intelligence Index v5 26 | Mistral Ecosystem Open-Weight License (MIT modificada) | Pesos abiertos en Hugging Face; API `mistral-large-4` |
| GLM-5.3 | no disponible en la informacion proporcionada | no disponible | Lider de pesos abiertos en AA Coding Agent Index, empatado con Mistral Large 4 pero con mas tokens por tarea | no disponible | no disponible |
| Modelos abiertos chinos lideres en AA Intelligence Index v5 | no disponible | no disponible | Puntuacion superior a 26 en el indice agregado | no disponible | no disponible |

La model card solo identifica a GLM-5.3 y a los modelos abiertos chinos lideres como referencias comparativas; no se proporcionan especificaciones detalladas de estos modelos en la informacion disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad mas alla de la ciberseguridad; no hay informacion sobre tasas de alucinacion medidas.
- El modo de razonamiento por defecto es `high`, lo que incrementa el consumo de tokens y la latencia si no se ajusta explicitamente a `low` o `medium`.
- Aunque declara fluidez en 160+ idiomas, la lista ISO de la model card solo cubre 39 codigos; el rendimiento en el resto no esta cuantificado.
- La licencia permite uso comercial general, pero operar un negocio de Model-as-a-Service con este modelo requiere una licencia comercial separada con Mistral; conviene revisar el texto completo de la licencia antes de desplegarlo.
- El despliegue en bf16 exige infraestructura multi-GPU de centro de datos (del orden de 2 TB de VRAM agregada); el checkpoint NVFP4 esta limitado a GPUs Blackwell.
- El modelo solo produce salida de texto: acepta imagenes como entrada, pero no genera imagenes ni audio.
- El repositorio tiene muy pocas descargas (27) y ningun like en el momento de la consulta, y el ID de Hugging Face corresponde a un espejo de usuario (`sekkit`), no a la organizacion oficial `mistralai`; para produccion conviene verificar el checkpoint oficial.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sekkit/Mistral-Large-4-1T-A52B
- Blog oficial de Mistral Large 4: https://mistral.ai/news/mistral-large-4-oss/
- Documentacion de la API (modelo `mistral-large-4`): https://docs.mistral.ai/models/mistral-large-4-0
- Checkpoint NVFP4 oficial: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- Licencia (Mistral Ecosystem Open-Weight License): https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE
- Galeria de demos "Le Chonk": https://mistralai-ml4-le-chonk-gallery.hf.space/
- Mistral Vibe (agente de codificacion): https://github.com/mistralai/mistral-vibe
