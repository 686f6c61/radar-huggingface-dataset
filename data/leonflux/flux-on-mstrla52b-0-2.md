# leonflux/FLUX-on-MstrlA52B-0.2

## Resumen

FLUX-on-MstrlA52B-0.2 es un checkpoint publicado por el usuario leonflux en Hugging Face, construido sobre Mistral Large 4, el modelo multimodal nativo de tipo Mixture-of-Experts desarrollado por Mistral AI. El modelo base combina aproximadamente 1 billon de parametros totales con unos 52.000 millones de parametros activos por token (49.000 millones en los expertos enrutados mas capas de embedding y salida), lo que lo situa en la categoria de modelos frontier de pesos abiertos. La arquitectura emplea 128 expertos enrutados con 4 activos por token y 1 experto compartido, junto con un codificador visual de estilo Pixtral capaz de procesar imagenes de tamano y relacion de aspecto variables.

La relevancia de este checkpoint radica en que unifica en un unico conjunto de pesos el seguimiento de instrucciones, el razonamiento configurable, la generacion de codigo, los flujos agenticos y la entrada multimodal, con una ventana de contexto de 1 millon de tokens y fluidez nativa en mas de 160 idiomas, incluidos todos los oficiales de la Union Europea. El modelo base se entreno desde cero en 3.800 GPU NVIDIA Grace Blackwell en los centros de datos europeos de Mistral.

El nombre del repositorio sugiere un trabajo de ajuste o adaptacion orientado a tareas de imagen a texto (pipeline image-text-to-text), si bien la model card disponible no documenta el proceso de ajuste especifico aplicado por leonflux. El repositorio ocupa 1.060,6 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts multimodal (128 expertos enrutados, 4 activos por token, 1 experto compartido) con codificador visual estilo Pixtral |
| Parametros totales | ~1 billon (1T) |
| Parametros activos | ~52.000 millones por token (49B en expertos + embeddings y capa de salida) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (tag del repositorio); checkpoint NVFP4 disponible por separado en el repositorio oficial de Mistral |
| Idiomas soportados | 160+ idiomas, incluidos todos los oficiales de la UE; la model card lista 40 idiomas explicitos (en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, sk, sl) |
| Licencia | Mistral Ecosystem Open-Weight License (variante modificada de MIT; uso comercial permitido, pero operar un negocio Model-as-a-Service requiere licencia comercial separada con Mistral) |
| Formato de pesos | safetensors (libreria transformers); compatible con vLLM, SGLang y llama.cpp |
| Tamano del repositorio | 1.060,6 GB |
| Modalidad de entrada/salida | Texto e imagen de entrada, texto de salida |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo Mixture-of-Experts con enrutamiento granular: de los 128 expertos disponibles, solo 4 se activan por token, mas un experto compartido siempre activo, lo que permite un total de ~1T de parametros con un coste computacional por token equivalente a ~52B. Incorpora un codificador visual de estilo Pixtral entrenado para manejar tamanos y relaciones de aspecto variables, lo que habilita el analisis de documentos, graficos y dibujos tecnicos. El checkpoint incluye una cabeza de decodificacion especulativa DSpark embebida, que acelera la inferencia sin necesidad de un modelo borrador externo.

El entrenamiento se realizo desde cero sobre 3.800 GPU NVIDIA Grace Blackwell en infraestructura propia de Mistral en Europa. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset, ni especifica si se aplicaron fases de RLHF o DPO; unicamente indica que el modelo unifica instruccion, razonamiento, codigo y flujos agenticos en un solo conjunto de pesos. El razonamiento es configurable por peticion mediante tres niveles de esfuerzo (`low`, `medium`, `high`), lo que permite ajustar el coste computacional segun la tarea.

## Capacidades

- Generacion de texto y razonamiento con esfuerzo configurable (`low`, `medium`, `high`; por defecto `high`).
- Entrada multimodal: analisis de imagenes, graficos, dibujos tecnicos y documentos con grounding visual de referencia entre los pesos abiertos.
- Generacion de codigo y flujos de agente de programacion (agentic coding) con buen rendimiento por token consumido.
- Function calling nativo, salida JSON y cumplimiento estricto de esquemas JSON.
- Flujos agenticos multi-paso con adherencia fuerte a system prompts.
- Capacidades multilingues nativas en mas de 160 idiomas.
- Rendimiento destacado en ciberseguridad, finanzas y derecho, con rechazo de peticiones maliciosas.
- Ventana de contexto de 1M tokens para cargas de trabajo de contexto largo.
- Decodificacion especulativa integrada (DSpark) para acelerar la inferencia.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso gracias a su ventana de 1M tokens, y ajustar el esfuerzo de razonamiento a `low` para respuestas rapidas en consultas simples.
- Generacion de codigo en produccion: con function calling nativo y salida JSON estricta, puede integrarse en pipelines de CI/CD como agente de revision, generacion de parches o ejecucion de herramientas, consumiendo menos tokens por tarea que alternativas comparables.
- Analisis documental multimodal: procesamiento de facturas, contratos o informes escaneados combinando el codificador visual con el contexto largo para extraer y razonar sobre datos estructurados.
- Asistencia en ciberseguridad: triaje de alertas, analisis de trazas y generacion de informes tecnicos, aprovechando su rendimiento destacado en dominios de seguridad y su rechazo a peticiones maliciosas.
- Agentes de investigacion y recuperacion aumentada: orquestacion de busquedas y llamadas a herramientas con razonamiento `high` para tareas complejas de sintesis sobre corpus extensos.
- Localizacion y atencion multilingue: despliegue en entornos de la UE con soporte nativo de todos los idiomas oficiales, sin necesidad de modelos auxiliares de traduccion.
- Analisis de graficos y dibujos tecnicos: interpretacion de diagramas de ingenieria o dashboards financieros con grounding visual para responder preguntas sobre elementos concretos de la imagen.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Artificial Analysis Coding Agent Index | 48% | Practicamente empatado con GLM-5.3 (lider de pesos abiertos), usando un 47% menos de tokens por tarea de media |
| Artificial Analysis Intelligence Index v5 | 26 | El mas alto entre modelos de pesos abiertos occidentales; los lideres chinos superan esta cifra agregada |

La model card remite al blog y al informe tecnico para benchmarks adicionales de ciberseguridad, finanzas y derecho, no incluidos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con ~1T de parametros totales, el checkpoint completo en FP8 requiere del orden de 1 TB de memoria; el repositorio ocupa 1.060,6 GB. Un despliegue en BF16/FP16 no es viable en hardware convencional.
- GPU recomendadas: el entrenamiento se realizo en NVIDIA Grace Blackwell; el checkpoint NVFP4 oficial esta orientado a GPU Blackwell con soporte en vLLM y SGLang. Para FP8 se recomienda hardware de centro de datos con memoria agregada suficiente (multiples H100/H200/B200).
- GPU de consumo: no cabe en GPU consumer. El modelo no es desplegable en RTX 4090 ni similares por su volumen de parametros.
- Opciones de despliegue: transformers, vLLM, SGLang y llama.cpp (soporte declarado en los tags del repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada. La decodificacion especulativa DSpark y el checkpoint NVFP4 estan disenados para mejorar el rendimiento, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Large 4 (base de este checkpoint) | ~1T totales / ~52B activos | 1M | Coding Agent Index 48%; Intelligence Index v5 26 | Mistral Ecosystem Open-Weight License | Pesos abiertos en Hugging Face y API de Mistral |
| GLM-5.3 | no disponible | no disponible | Practicamente empatado en Coding Agent Index; superior en Intelligence Index v5 segun la model card | no disponible | Pesos abiertos |
| Modelos frontier cerrados | no disponible | no disponible | Mistral Large 4 supera a modelos cerrados frontier en grounding visual segun la model card | Propietaria | Solo API |

No se dispone de datos detallados de parametros, contexto o licencia de GLM-5.3 en la informacion proporcionada mas alla de su comparacion en los indices de Artificial Analysis.

## Limitaciones y advertencias

- La model card no documenta el proceso de ajuste especifico de este checkpoint (leonflux/FLUX-on-MstrlA52B-0.2); su comportamiento puede diferir del modelo base oficial.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se publican tasas de error ni evaluaciones de fidelidad para este checkpoint concreto.
- La licencia es una variante modificada de MIT: el uso comercial esta permitido, pero operar un negocio Model-as-a-Service requiere una licencia comercial separada con Mistral. Verificar los terminos completos antes de desplegar en produccion.
- El modelo no es desplegable en hardware de consumo; requiere infraestructura de centro de datos con memoria agregada de aproximadamente 1 TB para FP8.
- Aunque se declaran 160+ idiomas, la model card solo lista 40 explicitamente; el rendimiento en idiomas no listados no esta verificado.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de validacion por parte de la comunidad.
- Los benchmarks reportados provienen de Mistral para el modelo base; no hay evaluaciones independientes de esta variante especifica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/leonflux/FLUX-on-MstrlA52B-0.2
- Repositorio oficial del modelo base: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Checkpoint NVFP4: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- Blog de Mistral: https://mistral.ai/news/mistral-large-4-oss/
- Informe tecnico: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/assets/technical_report.pdf
- Documentacion de la API: https://docs.mistral.ai/models/mistral-large-4-0
- Galeria de demos Le Chonk: https://mistralai-ml4-le-chonk-gallery.hf.space/
- Mistral Vibe (agente de codigo): https://github.com/mistralai/mistral-vibe
