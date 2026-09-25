# r0b0tlab/MiMo-V2.6-Flash-RL-NVFP4

## Resumen

MiMo-V2.6-Flash-RL es el checkpoint "efficiency-balanced" de la serie MiMo-V2.6 desarrollada por Xiaomi (XiaomiMiMo). Se trata de un modelo nativamente omnimodal —texto, imagen, vídeo y audio— construido sobre una arquitectura MoE dispersa de 309B parámetros totales y 15B activados, con una ventana de contexto de 1M tokens. Su objetivo declarado es escalar el aprendizaje por refuerzo hacia la auto-mejora: en lugar de ejecutar entrenamientos RL separados por dominio, la serie emplea una única ejecución RL mixta sobre tareas de código, agentes generales, visión y ciberseguridad, mezcladas en el mismo lote.

La ficha que nos ocupa, `r0b0tlab/MiMo-V2.6-Flash-RL-NVFP4`, no es el checkpoint oficial de Xiaomi, sino una cuantización NVFP4 de pesos publicada por el usuario r0b0tlab sobre el modelo base `XiaomiMiMo/MiMo-V2.6-Flash-RL` (licencia MIT). El repositorio ocupa 187,2 GB y está pensado para servir el modelo en dos nodos NVIDIA DGX Spark GB10 (arquitectura SM121) mediante SGLang con decodificación especulativa DFlash, con caché KV en FP8 calibrada. Es, por tanto, una pieza de infraestructura orientada a desplegar un modelo de gran tamaño en hardware de escritorio de gama alta, no una versión reentrenada.

La relevancia actual del modelo reside en dos factores: por un lado, el contexto de 1M tokens combinado con capacidades de agente permite manejar repositorios completos, trazas de herramientas y sesiones multi-turno largas sin truncado; por otro, la publicación de una cuantización NVFP4 funcional sobre GB10 abre la puerta a ejecutar un MoE de 309B parámetros fuera de clústeres de centros de datos. Hay que señalar una discrepancia sin aclarar: la model card indica 309B parámetros totales, mientras que los safetensors del repositorio NVFP4 contabilizan 159.358.725.504 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa (Mixture of Experts) sobre backbone transformer híbrido con atención de ventana deslizante (SWA) y bloques full attention; encoders omni + decodificador especulativo MTP |
| Parametros totales | 309B según la model card del autor original; 159.358.725.504 (~159,4B) contabilizados en los safetensors de este repositorio NVFP4 (discrepancia no explicada por el publicador) |
| Parametros activos | 15B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 en pesos (formato de 4 bits con escalas por bloque) con caché KV en FP8 calibrada; el repositorio upstream maneja también 8-bit y FP8 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code=True` en transformers); despliegue documentado vía SGLang |
| Componentes adicionales | Encoder de visión MiMo ViT de 681M parámetros (28 capas: 24 SWA + 4 full); encoder de audio de 308M (AudioTokenizer) + 127M (patch encoder); decodificador especulativo MTP de 5 capas |
| Tamaño del repositorio | 187,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La serie MiMo-V2.6 combina un backbone transformer híbrido que alterna capas de atención de ventana deslizante con capas de atención completa, lo que permite sostener ventanas de 1M tokens con un coste de atención contenido. Sobre ese backbone se monta una capa MoE dispersa que activa 15B de los 309B parámetros totales por token. A esto se añaden tres piezas específicas: un encoder visual MiMo ViT de 681M parámetros (24 capas SWA y 4 full), un stack de audio compuesto por un AudioTokenizer de 308M y un patch encoder de 127M, y un decodificador especulativo de predicción multi-token (MTP) de 5 capas que en este despliegue concreto se explota mediante decodificación especulativa DFlash.

El entrenamiento descrito en la documentación oficial se organiza en torno a una única ejecución RL mixta ("You Only RL Once") que cubre código, agentes generales, visión y ciberseguridad en el mismo lote, con distintos harness mezclados. El algoritmo es GRPO (Group Relative Policy Optimization) totalmente asíncrono, con lotes de 1.568 prompts × 16 rollouts por paso y miles de millones de tokens por actualización. La señal de recompensa se escala mediante dos mecanismos complementarios: Groupwise Reward Synthesis (GRS), que construye rúbricas específicas de tarea a partir de rollouts contrastados y las fusiona con el resultado de los tests, y Groupwise Advantage Redistribution (GAR), que ordena las trayectorias que ya han pasado el test y desplaza la ventaja hacia las soluciones de mayor calidad, favoreciendo caminos más cortos y menos tokens por tarea. Finalmente, una fase de destilación on-policy multi-profesor (MOPD2) combina rollouts autónomos del estudiante con rollouts de un solo turno condicionados por prefijo (Teacher-Prefix y SFT-Prefix) para extender capacidades a tareas difíciles de verificar sin regenerar los turnos previos.

## Capacidades

- Generación de texto y conversación multi-turno con contexto de hasta 1M tokens.
- Comprensión de imagen y vídeo mediante el encoder MiMo ViT de 681M parámetros.
- Comprensión de audio mediante AudioTokenizer de 308M más patch encoder de 127M.
- Ejecución de tareas de agente: uso de herramientas, razonamiento multi-paso y operación sobre terminal y sistemas operativos (los benchmarks incluyen Terminal Bench, OSWorld y AutomationBench).
- Generación y edición de código dentro de flujos agénticos (DeepSWE, ProgramBench, MiMo Code Bench).
- Capacidades de ciberseguridad entrenadas explícitamente dentro de la ejecución RL mixta (sección de benchmarks truncada en la información disponible).
- Decodificación especulativa mediante la cabeza MTP de 5 capas, que en este despliegue se sirve con DFlash para acelerar la generación.
- Multilingüismo limitado a inglés y chino según los metadatos de idioma declarados.
- Bucle de auto-mejora: el modelo está entrenado para reflexionar sobre sus propios turnos y reescribirlos, según la sección "Aligned RL" de la documentación.

## Casos de uso

- Agentes de codificación sobre repositorios completos: con 1M tokens de contexto, el modelo puede cargar un repositorio entero más las trazas de herramientas y mantener coherencia entre ficheros, algo crítico en tareas tipo DeepSWE donde la puntuación del modelo (67,9) se sitúa cerca de Claude Opus 5 (74,0).
- Automatización de operaciones en terminal y sistemas operativos: los resultados en Terminal Bench 2.1 (87,6) y OSWorld-Verified (80,8) lo sitúan como candidato para agentes que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- Atención al cliente multimodal: al aceptar texto, imagen y audio en un mismo modelo, puede gestionar conversaciones donde el usuario adjunta capturas o mensajes de voz sin necesidad de pipelines separados de ASR o visión.
- Análisis de vídeo y audio de larga duración: la ventana de 1M tokens permite procesar transcripciones y descripciones de vídeo extensas en una sola pasada, útil para resúmenes de reuniones o revisión de material audiovisual.
- Ejecución local en hardware de gama alta: la cuantización NVFP4 permite servir el modelo en dos DGX Spark GB10 con tensor parallelism 2 vía SGLang, lo que habilita despliegues on-premise sin clúster de datacenter.
- Auditoría de seguridad y análisis de código malicioso: el entrenamiento RL incluye dominio de ciberseguridad, por lo que puede emplearse en triaje de hallazgos y análisis asistido, siempre con supervisión humana dado el riesgo de falsos negativos.
- Investigación en RL y auto-mejora: al ser checkpoint RL con licencia MIT, es material de estudio para reproducir esquemas GRPO asíncronos, GRS/GAR y destilación MOPD2.
- Orquestación de pipelines multi-agente: sus resultados en Toolathlon-Verified (73,6) y AutomationBench (52,3) indican madurez para encadenar llamadas a herramientas en flujos de negocio automatizados.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a los checkpoints oficiales de Xiaomi (MiMo-V2.6 Pro, MiMo-V2.6 Flash y MiMo-V2.5 Pro) y a modelos propietarios de referencia (Claude Opus 5, GPT-5.6 Sol, Claude Fable 5). No se aportan cifras específicas del checkpoint NVFP4 de r0b0tlab, por lo que la degradación introducida por la cuantización de 4 bits no está cuantificada.

| Benchmark | MiMo-V2.6 Pro | MiMo-V2.6 Flash | MiMo-V2.5 Pro | Claude Opus 5 | GPT-5.6 Sol | Claude Fable 5 |
|---|---|---|---|---|---|---|
| **Code Agent** | | | | | | |
| DeepSWE v1.1 | 71,9 | 67,9 | 19,0 | 74,0 | 73,0 | 70,0 |
| ProgramBench | 26,5 | 26,0 | 12,5 | 37,0 | 25,0 | 33,0 |
| MiMo Code Bench | 63,2 | 61,2 | 40,4 | 68,6 | 59,3 | no disponible |
| **General Agent** | | | | | | |
| AutomationBench v1.0.6 | 53,1 | 52,3 | 16,0 | 50,3 | 45,8 | 46,2 |
| Toolathlon-Verified | 76,9 | 73,6 | 49,1 | 80,6 | 74,9 | 77,9 |
| GDPval-AA 2.1 | 1673 | no disponible | 1107 | 1708 | 1588 | 1595 |
| Agents' Last Exam | 31,6 | 27,6 | 13,2 | 31,6 | 30,8 | 25,7 |
| Terminal Bench 4.0 | 34,9 | 28,8 | 1,5 | 49,0 | 39,9 | 42,4 |
| Terminal Bench 2.1 | 89,9 | 87,6 | 65,2 | 89,1 | 88,8 | 84,3 |
| OSWorld-Verified | 82,0 | 80,8 | no disponible | 83,4 | 83,0 | 86,0 |
| JobBench | 62,0 | 61,2 | 25,0 | 65,7 | 45,4 | 57,4 |
| **Cybersecurity** | datos truncados en la información disponible | datos truncados | datos truncados | datos truncados | datos truncados | datos truncados |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio NVFP4 ocupa 187,2 GB en disco; a esa cifra hay que sumar la caché KV en FP8, cuyo tamaño depende de la longitud de contexto y del número de secuencias concurrentes. Con 1M tokens de contexto, la caché puede superar con holgura el tamaño de los pesos.
- Configuración validada por el publicador: dos nodos NVIDIA DGX Spark GB10 (arquitectura SM121, memoria unificada) con tensor parallelism 2.
- Software de despliegue: SGLang en versión nightly 20260922-582389ce, con decodificación especulativa DFlash.
- No cabe en GPU de consumo convencionales (RTX 4090 con 24 GB, RTX 5090 con 32 GB) ni en configuraciones de una sola GPU de 80 GB. Se requiere un mínimo de ~200 GB de memoria agregada solo para pesos, lo que en la práctica implica múltiples H100/H200/B200 o nodos GB10.
- Compatibilidad de cuantización: NVFP4 requiere hardware con soporte de FP4 nativo; SM121 (GB10) está soportado, mientras que generaciones anteriores (Ampere, Ada) no ejecutan este formato.
- Opciones alternativas: para GPUs sin soporte FP4 habría que recurrir al checkpoint original en FP8/BF16 con vLLM o TGI, con requisitos de memoria considerablemente mayores (no cuantificados en la información disponible).
- Latencia y throughput: no disponibles. El publicador menciona únicamente el uso de decodificación especulativa DFlash como mecanismo de aceleración, sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento de referencia |
|---|---|---|---|---|---|
| r0b0tlab/MiMo-V2.6-Flash-RL-NVFP4 | 159,4B contabilizados en safetensors (309B declarados, 15B activos) | 1M tokens | MIT | HuggingFace (cuantización comunitaria) | Sin benchmarks propios; hereda los del checkpoint FP8 |
| XiaomiMiMo/MiMo-V2.6-Flash-RL | 309B totales, 15B activos | 1M tokens | MIT | HuggingFace + ModelScope (oficial) | DeepSWE 67,9; Terminal Bench 2.1 87,6; OSWorld 80,8 |
| XiaomiMiMo/MiMo-V2.6-Pro-RL | 309B (variante Pro, parámetros activos no disponibles) | 1M tokens | MIT | HuggingFace + ModelScope (oficial) | DeepSWE 71,9; Terminal Bench 2.1 89,9; OSWorld 82,0 |
| XiaomiMiMo/MiMo-V2.5-Pro | no disponible | no disponible | MIT | HuggingFace | DeepSWE 19,0; Terminal Bench 2.1 65,2 |
| primitive-ai/MiMo-V2.6-Flash-RL-NVFP4 | No disponible | No disponible | No disponible | HuggingFace | No disponible (espejo o variante del mismo artefacto) |

Frente a modelos propietarios de la misma categoría, el checkpoint oficial Flash se queda por detrás de Claude Opus 5 en código (67,9 frente a 74,0 en DeepSWE) y muy por detrás en ProgramBench (26,0 frente a 37,0), pero supera a GPT-5.6 Sol en AutomationBench (52,3 frente a 45,8) y en GDPval-AA 2.1. La ventaja competitiva real de esta publicación concreta no es el rendimiento, sino la licencia MIT y la posibilidad de ejecución local en hardware GB10.

## Limitaciones y advertencias

- Este repositorio es una cuantización comunitaria, no una publicación oficial de Xiaomi. El soporte y la trazabilidad dependen del publicador (r0b0tlab).
- Existe una discrepancia no resuelta entre los 309B parámetros declarados en la model card y los 159.358.725.504 parámetros contabilizados en los safetensors del repositorio. Conviene verificar la integridad del checkpoint antes de usarlo en producción.
- La cuantización NVFP4 de 4 bits puede degradar el rendimiento respecto al checkpoint FP8/BF16. No se han publicado evaluaciones del artefacto cuantizado, por lo que la magnitud de la degradación es desconocida.
- El despliegue validado requiere hardware SM121 (DGX Spark GB10) y SGLang nightly; no hay garantía de funcionamiento en otras combinaciones de hardware o versiones del runtime.
- Soporte multilingüe limitado a inglés y chino según los metadatos declarados. El rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a modelos generativos de este tamaño, especialmente en tareas de ciberseguridad y análisis de código donde un falso negativo tiene consecuencias graves.
- Sesgos conocidos: la model card no documenta evaluación de sesgos ni de toxicidad. Los datos de entrenamiento y su composición no se detallan.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero la licencia del artefacto cuantizado depende de que se mantenga la atribución al modelo original y al publicador de la cuantización.
- El uso de `custom_code` implica ejecutar código remoto durante la carga del modelo; conviene auditar el repositorio antes de cargarlo en entornos sensibles.
- La sección de benchmarks de ciberseguridad está truncada en la información disponible, por lo que no puede evaluarse esa capacidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/r0b0tlab/MiMo-V2.6-Flash-RL-NVFP4
- Repositorio HuggingFace oficial: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Árbol de ficheros del modelo oficial: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/tree/main
- Repositorio HuggingFace de la variante Pro: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Repositorio GitHub de la cuantización: https://github.com/r0b0tlab/mimo26-nvfp4-sm121
- Informe técnico (PDF): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Blog de la serie MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Métricas de entrenamiento RL: https://mimo.xiaomi.com/rl/
- Plataforma API de Xiaomi MiMo: https://platform.xiaomimimo.com
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Xiaomi MiMo Desktop: https://mimo.xiaomimimo.com/desktop/
- ModelScope (checkpoint oficial): https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Repositorio GitHub de MiMo: https://github.com/XiaomiMiMo/MiMo
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/
- Espejo o variante NVFP4: https://huggingface.co/primitive-ai/MiMo-V2.6-Flash-RL-NVFP4
