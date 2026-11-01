# ExclusiveMovies/Mistral-Large-4-1T-A52B

## Resumen
Mistral Large 4 (nombre en clave Le Chonk) es un modelo de lenguaje multimodal nativo de tipo Mixture-of-Experts desarrollado por Mistral AI. Con aproximadamente 1 billon de parametros totales y unos 52.000 millones activos por token, se posiciona como el modelo mas grande y capaz publicado por el laboratorio frances hasta la fecha. Esta entrenado desde cero en 3.800 GPUs NVIDIA Grace Blackwell en centros de datos propios en Europa y unifica instruccion, razonamiento, codigo y flujos agenticos en un unico conjunto de pesos.

La arquitectura combina un enrutado granular de 128 expertos (4 activos por token) mas un experto compartido, con una ventana de contexto de 1 millon de tokens y entrada multimodal de texto e imagen mediante un codificador visual de estilo Pixtral. Incorpora un cabezal de decodificacion especulativa DSpark embebido en el checkpoint y soporta tres niveles de esfuerzo de razonamiento configurables por peticion.

Su relevancia actual radica en que compite directamente con los modelos abiertos frontera (incluidos los principales modelos chinos) en tareas de codigo agentico y ciberseguridad, manteniendo una licencia permisiva con restricciones para uso como servicio gestionado, y una cobertura nativa de mas de 160 idiomas, incluidos todos los oficiales de la Union Europea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts multimodal (texto e imagen) con 128 expertos enrutados (4 activos por token) y 1 experto compartido; codificador visual tipo Pixtral; cabezal de decodificacion especulativa DSpark embebido |
| Parametros totales | ~1 billon (1T) |
| Parametros activos | ~52.000 millones (incluyendo embeddings y capas de salida); ~49.000 millones sin ellos |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | Checkpoint NVFP4 disponible (orientado a GPUs Blackwell); no se detallan otros formatos en la informacion proporcionada |
| Idiomas soportados | 160+ idiomas, incluidos todos los oficiales de la UE; la model card lista 41 codigos ISO explicitos (en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, sk, sl) |
| Licencia | Mistral Ecosystem Open-Weight License (version modificada de MIT; uso comercial y no comercial permitido, pero operar un negocio Model-as-a-Service requiere licencia comercial separada con Mistral) |
| Formato de pesos | Safetensors (repo de transformers); checkpoint NVFP4 adicional; soporte declarado en vLLM, SGLang, llama.cpp y transformers |

## Arquitectura y entrenamiento
Mistral Large 4 es un transformer de tipo Mixture-of-Experts con enrutado granular: 128 expertos enrutados de los que se activan 4 por token, mas un experto compartido siempre activo. Esta configuracion permite un total de ~1T de parametros con solo ~52.000 millones activos por token (incluyendo embeddings y capa de salida), lo que reduce el coste computacional por token frente a un modelo denso equivalente. El modelo es nativamente multimodal: acepta texto e imagen como entrada y produce texto, con un codificador visual de estilo Pixtral entrenado para tamaños y relaciones de aspecto variables.

El entrenamiento se realizo desde cero en 3.800 GPUs NVIDIA Grace Blackwell en centros de datos de Mistral en Europa, sobre un volumen de tokens y una composicion de dataset no detallados en la informacion disponible. Tampoco se especifica si se aplicaron etapas de RLHF o DPO. Entre las innovaciones tecnicas destacadas esta el cabezal de decodificacion especulativa DSpark embebido en el checkpoint, que acelera la generacion sin necesidad de un modelo borrador separado, y el soporte de esfuerzo de razonamiento configurable (`low`, `medium`, `high`) por peticion, lo que permite ajustar el coste de inferencia segun la tarea.

## Capacidades
- Generacion de texto, razonamiento e instruccion en un unico conjunto de pesos, con modo de razonamiento de tres niveles (`low`, `medium`, `high`; por defecto `high`).
- Codigo y desarrollo agentico: rendimiento frontera en tareas de codificacion con agentes, con menor consumo de tokens por tarea.
- Vision: analisis de imagenes, graficos, dibujos tecnicos y documentos, con grounding visual de referencia entre los modelos de pesos abiertos.
- Multilingue: fluidez nativa en mas de 160 idiomas, incluidos todos los oficiales de la Union Europea.
- Function calling nativo, salida JSON y cumplimiento estricto de esquemas JSON.
- Flujos agenticos multi-paso con adherencia fuerte a system prompts.
- Especializacion destacada en ciberseguridad, finanzas y derecho, manteniendo rechazo de peticiones maliciosas.
- Ventana de contexto de 1M tokens para cargas de trabajo de contexto largo.
- Decodificacion especulativa DSpark integrada para acelerar la inferencia.

## Casos de uso
- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a su ventana de 1M tokens, y ajustar el esfuerzo de razonamiento a `low` para respuestas rapidas en chat.
- Generacion de codigo en produccion: con function calling nativo, salida JSON estricta y rendimiento agentico, puede integrarse en pipelines de CI/CD y agentes de codificacion que ejecutan tareas con un 47% menos de tokens por tarea que el modelo lider comparable.
- Analisis de documentos legales y financieros: su especializacion en derecho y finanzas y su capacidad de procesar documentos e imagenes permiten extraer clausulas, resumir contratos o auditar informes con contexto largo.
- Analisis de ciberseguridad: revision de configuraciones, triaje de alertas y asistencia en respuesta a incidentes, aprovechando su rendimiento destacado en seguridad entre modelos de pesos abiertos y su rechazo de peticiones maliciosas.
- Procesamiento de documentos escaneados y graficos: el codificador visual tipo Pixtral permite interpretar facturas, diagramas tecnicos y tablas en imagenes de tamaños y relaciones de aspecto variables.
- Asistentes agenticos con herramientas: definicion de un conjunto acotado de tools y ejecucion multi-paso con adherencia a system prompt para automatizar flujos internos (CRM, ticketing, ERP).
- Aplicaciones multilingues para el mercado europeo: cobertura nativa de todos los idiomas oficiales de la UE, adecuada para traduccion, localizacion y soporte regional sin modelos auxiliares.
- Despliegue como servicio gestionado: solo con licencia comercial separada de Mistral, segun los terminos de la Mistral Ecosystem Open-Weight License.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Artificial Analysis Coding Agent Index | 48% | Practicamente empatado con GLM-5.3 (lider de pesos abiertos) usando un 47% menos de tokens por tarea de media |
| Artificial Analysis Intelligence Index v5 | 26 | El mas alto entre modelos de pesos abiertos occidentales; los principales modelos abiertos chinos puntuan mas alto en este indice agregado |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar. La model card remite al blog de Mistral para benchmarks adicionales de ciberseguridad, finanzas y derecho.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita. El repo en transformers ocupa 1.060,6 GB; con cuantizacion NVFP4 el footprint se reduce, pero no se especifica la cifra exacta.
- GPU recomendadas: NVIDIA Grace Blackwell para el entrenamiento; el checkpoint NVFP4 esta orientado a GPUs Blackwell. No se detallan requisitos minimos para otras familias.
- Viabilidad en GPU de consumo: no disponible. Con ~1T de parametros totales, el modelo completo no es desplegable en GPUs de consumo; el checkpoint NVFP4 y el soporte en llama.cpp sugieren opciones de cuantizacion agresiva, pero sin cifras confirmadas.
- Opciones de despliegue: vLLM, SGLang, transformers y llama.cpp; el checkpoint NVFP4 soporta vLLM y SGLang.
- Latencia y throughput: no disponibles. La decodificacion especulativa DSpark y el modo de razonamiento configurable permiten ajustar el coste, pero no se publican metricas concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Large 4 (Le Chonk) | ~1T totales / ~52B activos | 1M tokens | Coding Agent Index 48%; Intelligence Index v5 26 | Mistral Ecosystem Open-Weight (tipo MIT modificada) | Pesos en HuggingFace y API Mistral |
| GLM-5.3 | no disponible | no disponible | Coding Agent Index practicamente empatado con Mistral Large 4 | no disponible | no disponible |
| Modelos abiertos chinos lideres en Intelligence Index v5 | no disponible | no disponible | Puntuacion superior a 26 en el indice agregado | no disponible | no disponible |

La informacion proporcionada solo identifica a GLM-5.3 como referencia directa en codificacion agentica y a los modelos abiertos chinos como lideres en el indice agregado de inteligencia. No se dispone de datos de parametros, contexto ni licencia de esos modelos en la informacion disponible.

## Limitaciones y advertencias
- Sesgos conocidos: no se detallan en la informacion proporcionada; como modelo entrenado con datos web a gran escala, es previsible que herede sesgos, pero no hay documentacion especifica.
- Riesgo de alucinacion: no cuantificado en la model card; aplican las precauciones habituales en tareas de alto riesgo (legal, financiero, seguridad).
- Limitaciones de contexto o idioma: aunque declara 160+ idiomas, la lista explicita de la model card cubre 41 codigos ISO; el rendimiento en idiomas no listados no esta verificado.
- Restricciones de licencia: la Mistral Ecosystem Open-Weight License permite uso comercial y no comercial, pero operar un negocio Model-as-a-Service requiere una licencia comercial separada con Mistral. Verificar los terminos completos antes de desplegar en produccion.
- Coste de despliegue: con ~1T de parametros totales y un repo de 1.060,6 GB, el despliegue on-premise exige infraestructura de gran escala; el checkpoint NVFP4 esta limitado a GPUs Blackwell.
- Especializacion: los benchmarks publicados se centran en codificacion agentica e inteligencia global; el rendimiento en ciberseguridad, finanzas y derecho se remite al blog sin cifras en la model card.
- Fecha de creacion del repo (2026-10-29) y autor del espejo (ExclusiveMovies): el checkpoint original parece ser de mistralai; conviene verificar la procedencia antes de usar el espejo.

## Enlaces
- HuggingFace (espejo): https://huggingface.co/ExclusiveMovies/Mistral-Large-4-1T-A52B
- Checkpoint NVFP4: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- Blog de Mistral: https://mistral.ai/news/mistral-large-4-oss/
- Documentacion de la API: https://docs.mistral.ai/models/mistral-large-4-0
- Licencia: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE
- Galeria de demos (Le Chonk Gallery): https://mistralai-ml4-le-chonk-gallery.hf.space/
- Mistral Vibe (agente de codificacion): https://github.com/mistralai/mistral-vibe
