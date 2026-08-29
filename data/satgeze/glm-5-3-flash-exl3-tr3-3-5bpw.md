# satgeze/GLM-5.3-Flash-EXL3-TR3-3.5bpw

## Resumen

GLM-5.3-Flash-EXL3-TR3-3.5bpw es una cuantizacion selectiva de alta calidad del modelo base zai-org/GLM-5.3-Flash, desarrollada por el usuario satgeze sobre la metodologia de codificacion trellis TR3 (lineage ShapleyMcG de Brandon M. Music). El objetivo es reducir el peso medio de los expertos enrutados a 3.5 bits por peso mediante una mezcla de tasas K3 y K4, manteniendo la calidad dentro de las puertas de control del autor (KLD medio < 0.06) y liberando memoria suficiente para servir contextos de 1 millon de tokens junto con un drafter especulativo y CUDA graphs en hardware de 2x 96 GB.

El modelo base es un MoE nativamente multimodal de 320 mil millones de parametros totales y 18 mil millones activos por token, con ventana de contexto de 1.048.576 tokens, licencia MIT y capacidades de vision (imagen y video). Esta cuantizacion, a diferencia de otras, preserva a precision original atencion, atencion lineal (KDA), indexadores DSA, routers, expertos compartidos, capas densas, embeddings, lm_head, normas, vision y MTP; solo los expertos enrutados se cuantizan. El artefacto se encuentra en estado "en progreso" (encode local, pesos aun no subidos) y se distribuira bajo la ShapleyMcG License 1.0.

La relevancia de esta ficha radica en que representa una de las primeras cuantizaciones mixtas de un modelo de 320B con contexto 1M orientada a despliegue local con decodificacion especulativa, un caso de uso practico para equipos que necesitan ejecutar cargas de trabajo de agente con ventanas largas sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con atencion lineal (KDA), DSA indexers, mHC, vision y MTP |
| Parametros totales | 320B (modelo base) |
| Parametros activos | 18B por token |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | EXL3/TR3 mixto K3/K4 a 3.5 bpw (solo expertos enrutados; resto a precision original) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se detallan idiomas) |
| Licencia | ShapleyMcG License 1.0 (modelo base MIT) |
| Formato de pesos | safetensors (formato EXL3/TR3, verificacion de carga mixta a nivel de config) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un MoE de 320B parametros con 18B activos, disenado por Z.ai como la primera variante nativamente multimodal de la serie GLM-5. Incorpora atencion lineal (KDA) ademas de atencion clasica, indexadores DSA, un modulo de vision y un predictor multi-token (MTP). Su entrenamiento incluye una fase de post-entrenamiento intensiva orientada a codigo y agentes, con mejoras del 50% en el benchmark interno Z.ai Code Bench respecto a GLM-5.2 y estado del arte open-source en Terminal Bench 3.0 y Agents' Last Exam.

La cuantizacion EXL3/TR3 no es un entrenamiento, sino una compresion post-hoc. El autor aplica una asignacion dinamica de sensibilidad por tensor: los tensores de expertos mas sensibles se mantienen en tasa K4 (4 bits) y el resto baja a K3 (3 bits), con una media exacta de 3.5 bits por peso. La calibracion se realiza con paneles de logits del profesor (teacher-logits) del dataset publicado. El proceso incluye una verificacion de calidad mediante KLD (divergencia Kullback-Leibler) en 5 ejecuciones frias con una puerta de < 0.06, similar a la empleada en la liberacion 4bpw del mismo autor. No se aplican tecnicas como RLHF o DPO en esta cuantizacion; se heredan las del modelo base.

## Capacidades

- Generacion de texto y razonamiento complejo, incluyendo tareas de codigo y matematicas, heredadas del modelo base.
- Razonamiento multi-paso y capacidades de agente: el modelo base es optimo en benchmarks de agentes como Terminal Bench 3.0 y Agents' Last Exam.
- Soporte de tool calling y function calling, util para integraciones con APIs y orquestacion de agentes.
- Capacidades multimodales: entrada de imagen y video (pipeline image-text-to-text), aunque la cuantizacion preserva el modulo de vision a precision original.
- Ventana de contexto de 1M tokens, que permite procesar documentos extensos, repositorios completos o historiales de conversacion muy largos.
- Soporte de decodificacion especulativa (MTP/DFlash2 drafter) habilitado por la reduccion de memoria de la cuantizacion.
- Multilingue: el modelo base soporta multiples idiomas, aunque la ficha no especifica cuales.

## Casos de uso

- Servicio local de agentes con contexto de 1M tokens: con 2 GPUs de 96 GB, la cuantizacion 3.5bpw permite cargar el modelo completo, el drafter especulativo y CUDA graphs, posibilitando conversaciones de larga duracion con memoria completa del historial.
- Analisis de repositorios de codigo completos: la ventana de 1M tokens permite ingerir un repositorio entero y responder preguntas sobre el, refactorizar o generar documentacion sin dividir el contexto.
- Asistente de programacion con tool calling: el modelo puede invocar funciones de terminal, editores o APIs de CI/CD, ejecutando tareas de desarrollo de forma autonoma.
- Procesamiento de documentos largos y multimodales: al aceptar imagen y video, puede resumir o extraer informacion de PDFs escaneados, capturas de pantalla o videos de demostracion.
- Investigacion academica: la cuantizacion permite experimentar con un modelo de 320B en hardware local, facilitando estudios de alucinacion, sesgos o interpretabilidad sin depender de la nube.
- Despliegue en entornos con restriccion de datos: al ser local, evita enviar informacion sensible a APIs externas, manteniendo el control de los datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion 3.5bpw en la informacion disponible. El autor menciona que la version 4bpw del mismo lineage paso sus puertas de calidad (KLD medio 0.0246 contra una barra de 0.06) y que una version uniforme 3.0bpw quedo fuera (PPL +9.3%, KLD 0.1525). La version 3.5 mixta esta disenada para situarse dentro de la misma puerta, pero los resultados de KLD estan pendientes de la ejecucion de calificacion.

Respecto al modelo base, los articulos web citan un indice de inteligencia de 57 en Artificial Analysis (frente a 60 del GLM-5.3 completo) y mejoras del 50% en Z.ai Code Bench sobre GLM-5.2, ademas de estado del arte open-source en Terminal Bench 3.0 y Agents' Last Exam. No se proporcionan numeros concretos de MMLU, HumanEval o GSM8K en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada: el autor indica que a 4bpw, 2x 96 GB son suficientes para 1M de contexto, pero sin espacio para el drafter especulativo (faltan ~68 MB). A 3.5bpw se liberan ~9 GiB por GPU, lo que permite incluir el drafter y CUDA graphs.
- GPU recomendadas: 2x GPU de 96 GB (probablemente A100 80GB o H100 96GB, aunque no se especifica el modelo exacto). El encode se realizo en 2x RTX PRO 6000.
- En consumer GPU: no es viable para 1M de contexto; para contextos mas cortos, una RTX 4090 (24 GB) podria cargar el modelo con cuantizaciones mas agresivas, pero no se ha verificado.
- Opciones de despliegue: al ser formato EXL3, es compatible con ExLlamaV3 (libreria de inferencia). No se menciona soporte para vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El autor menciona "conversational speed" como objetivo, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B MoE (18B activos) | 1M | BF16 | MIT | Hugging Face |
| GLM-5.3-Flash-tr3-4bpw (brandonmusic) | 320B MoE | 1M | TR3 4bpw uniforme | ShapleyMcG 1.0 | Hugging Face |
| GLM-5.3-Flash-EXL3-TR3-3.5bpw (satgeze) | 320B MoE | 1M | TR3 mixto K3/K4 3.5bpw | ShapleyMcG 1.0 | En progreso, no subido |

La comparativa se limita a variantes del mismo modelo base. No se dispone de informacion sobre cuantizaciones equivalentes de otros modelos MoE de tamano similar (por ejemplo, DeepSeek-V3 o Qwen3-MoE) en las fuentes consultadas.

## Limitaciones y advertencias

- Estado en progreso: los pesos no estan subidos aun; la model card indica "encode running, weights not uploaded yet". No debe usarse en produccion hasta que se complete la subida y se publiquen los resultados de KLD.
- Licencia ShapleyMcG 1.0: aunque el modelo base es MIT, esta cuantizacion se distribuye bajo la ShapleyMcG License 1.0, que puede imponer restricciones adicionales de atribucion o uso. Es necesario revisar los terminos antes de un despliegue comercial.
- Cuantizacion parcial: solo los expertos enrutados se cuantizan; el resto de componentes se mantienen a precision original, lo que reduce el ahorro de memoria frente a una cuantizacion completa, pero preserva la calidad en partes criticas.
- Riesgo de degradacion: el autor reconoce que una cuantizacion uniforme 3.0bpw quedo fuera de sus puertas de calidad. La version 3.5 mixta esta disenada para evitarlo, pero aun no hay resultados publicados.
- Sesgos y alucinaciones: heredados del modelo base. No se han realizado evaluaciones especificas de sesgos en esta cuantizacion.
- Idiomas: no se especifican los idiomas soportados en la ficha; el modelo base es multilingue, pero la cobertura exacta no esta documentada en las fuentes.
- Compatibilidad de formato: al ser un formato EXL3/TR3 especifico, puede no ser compatible con herramientas estandar como llama.cpp o vLLM sin adaptaciones.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/satgeze/GLM-5.3-Flash-EXL3-TR3-3.5bpw
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Liberacion 4bpw del mismo lineage: https://huggingface.co/brandonmusic/GLM-5.3-Flash-tr3-4bpw
- Repositorio del encoder ShapleyMcG: https://github.com/brandonmmusic-max/shapleymcg
- Blog de Z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Documentacion de Z.ai para GLM-5.3: https://docs.z.ai/guides/llm/glm-5.3
- Articulo de DataCamp sobre GLM-5.3-Flash: https://www.datacamp.com/blog/glm-5-3-flash
- Articulo de MarkTechPost sobre GLM-5.3-Flash: https://www.marktechpost.com/2026/08/26/z-ai-releases-glm-5-3-flash-a-320b-a18b-natively-multimodal-moe-with-a-1m-token-context/
- Ficha en Modal: https://modal.com/library/zai/glm-5-3-flash
