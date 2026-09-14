# ANGELOSEGRETO/InternVL3_5-241B-A28B

## Resumen

InternVL3.5-241B-A28B es el modelo multimodal de mayor tamano de la familia InternVL3.5, desarrollada por OpenGVLab (Shanghai AI Laboratory). Se trata de un modelo de lenguaje y vision (MLLM) de tipo image-text-to-text que acepta imagenes, video y texto como entrada y genera texto, con soporte para conversacion multi-turno, razonamiento y uso de herramientas. La ficha aqui analizada corresponde a la subida realizada por el usuario ANGELOSEGRETO, que es un ajuste fino (finetune) del checkpoint oficial OpenGVLab/InternVL3_5-241B-A28B-MPO, no la publicacion original del laboratorio.

El modelo tiene 240.699.370.368 parametros totales (240,7B) segun los pesos en safetensors, con un repositorio de 481,4 GB. La nomenclatura "A28B" del nombre indica un diseno de mezcla de expertos (MoE) con aproximadamente 28B de parametros activos por token, aunque este dato no se confirma de forma explicita en la informacion disponible. InternVL3.5 introduce tres innovaciones tecnicas clave: Cascade Reinforcement Learning (Cascade RL) para mejorar el razonamiento, Visual Resolution Router (ViR) para ajustar dinamicamente la resolucion de los tokens visuales, y la estrategia Decoupled Vision-Language Deployment (DvD) que separa el codificador visual y el modelo de lenguaje en GPUs distintas.

La relevancia de este modelo radica en que, segun la model card, alcanza resultados state-of-the-art entre los MLLM de codigo abierto en tareas multimodales generales, de razonamiento, de texto y agenticas, con una mejora de hasta +16,0 % en razonamiento y una aceleracion de inferencia de 4,05x respecto a InternVL3. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque conviene tener en cuenta que esta subida concreta no procede del repositorio oficial y no cuenta con descargas ni validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) con capa MoE en el modelo de lenguaje; codificador visual mas LLM, con soporte de custom_code |
| Parametros totales | 240.699.370.368 (240,7B) |
| Parametros activos | Aproximadamente 28B segun la nomenclatura "A28B" (no confirmado explicitamente en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan cuantizaciones oficiales) |
| Idiomas soportados | Multilingue (etiqueta "multilingual"; sin desglose de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato GitHub/InternVL custom; existe variante HF oficial en OpenGVLab/InternVL3_5-241B-A28B-HF) |

## Arquitectura y entrenamiento

La familia InternVL3.5 sigue el esquema de la serie InternVL: un codificador visual (vision encoder) acoplado a un modelo de lenguaje de gran escala. En este caso, el componente de lenguaje es un modelo MoE de 240B parametros totales, del que se activan aproximadamente 28B por token, lo que reduce el coste computacional por inferencia frente a un modelo denso del mismo tamano. La model card menciona dos estrategias de despliegue: Visual Resolution Router (ViR), que ajusta dinamicamente la resolucion de los tokens visuales sin degradar el rendimiento, y Decoupled Vision-Language Deployment (DvD), que distribuye el codificador visual y el modelo de lenguaje entre distintas GPUs para equilibrar la carga.

El entrenamiento se apoya en el framework Cascade Reinforcement Learning (Cascade RL), un proceso en dos etapas: primero RL offline para una convergencia estable y despues RL online para un alineamiento mas fino. Esta estrategia coarse-to-fine es la responsable, segun el autor, de las mejoras en tareas de razonamiento como MMMU y MathVista. Los datasets citados en la ficha son OpenGVLab/MMPR-v1.2 y OpenGVLab/MMPR-Tiny, orientados a razonamiento multimodal. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, de la composicion detallada del dataset ni del uso de DPO o RLHF convencional. Este checkpoint concreto es un finetune del modelo base OpenGVLab/InternVL3_5-241B-A28B-MPO.

## Capacidades

- Generacion de texto e image-text-to-text: descripcion de imagenes, respuesta a preguntas visuales y conversacion multimodal.
- Razonamiento multimodal: tareas evaluadas como MMMU, MathVista, MathVision, MathVerse, DynaMath y WeMath, con mejoras atribuidas a Cascade RL.
- Razonamiento matematico y logico: MATH500, AIME24, AIME25, GPQA y MMLU-Pro figuran entre los benchmarks evaluados.
- Comprension de documentos y OCR: OCRBench, AI2D y MMVet, con capacidad de extraccion de texto en imagenes.
- Comprension de video: MVBench y VideoMME aparecen en el conjunto de evaluacion, lo que indica soporte de entrada de video.
- Capacidades agenticas: la model card menciona interaccion con interfaces graficas (GUI interaction) y agencia encarnada (embodied agency), ademas de benchmarks como VSI-Bench, ERQA, SpaCE-10 y OmniSpatial.
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion disponible.
- Multilingue: etiqueta "multilingual"; sin listado ni evaluacion por idioma en los datos disponibles.
- Instrucciones y formato: IFEval se incluye entre los benchmarks evaluados, lo que sugiere ajuste a instrucciones.

## Casos de uso

- Analisis de documentos tecnicos y financieros: el modelo puede procesar capturas o PDFs con tablas y diagramas junto a preguntas en lenguaje natural, apoyandose en su rama visual y en las capacidades de OCR evaluadas en OCRBench y AI2D.
- Asistencia multimodal en atencion al cliente: gestion de conversaciones en las que el usuario adjunta fotos de productos, recibos o errores de pantalla, con la ventaja de un unico modelo que cubre texto e imagen y evita encadenar un OCR con un LLM aparte.
- Razonamiento cientifico y matematico asistido: resolucion de problemas de nivel universitario (evaluados en MATH500, AIME24/25 y MathVista) para herramientas de tutoria o generacion de explicaciones paso a paso.
- Comprension de video para monitorizacion: analisis de secuencias de video (MVBench, VideoMME) en escenarios de inspeccion industrial, resumen de reuniones grabadas o etiquetado automatico de clips.
- Agentes que operan interfaces graficas: la capacidad de GUI interaction permite automatizar flujos en aplicaciones de escritorio o web interpretando capturas de pantalla y decidiendo la siguiente accion.
- Robotica y agencia encarnada: el soporte de embodied agency y los benchmarks espaciales (VSI-Bench, SpaCE-10, OmniSpatial) lo hacen candidato para tareas de navegacion y manipulacion guiada por vision.
- Analisis geoespacial y de escenas complejas: ERQA y OmniSpatial sugieren uso en interpretacion de imagenes remotas o escenas 3D con preguntas de razonamiento espacial.
- Generacion de codigo a partir de diagramas o capturas: transcripcion de esquemas de arquitectura o interfaces a codigo y explicaciones, aunque el rendimiento especifico en HumanEval no esta disponible.

## Benchmarks y rendimiento

La model card referencia una figura comparativa (performance.jpg) con puntuaciones medias sobre MMBench v1.1 (en), MMStar, BLINK, HallusionBench, AI2D, OCRBench, MMVet, MME-RealWorld (en), MVBench, VideoMME, MMMU, MathVista, MathVision, MathVerse, DynaMath, WeMath, LogicVista, MATH500, AIME24, AIME25, GPQA, MMLU-Pro, GAOKAO, IFEval, SGP-Bench, VSI-Bench, ERQA, SpaCE-10 y OmniSpatial, pero los valores numericos no se incluyen en la informacion textual proporcionada.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

Los unicos datos cuantitativos de rendimiento presentes en el texto son agregados: hasta +16,0 % de mejora en rendimiento de razonamiento global y una aceleracion de inferencia de 4,05x respecto a InternVL3.

## Requisitos de hardware

- VRAM estimada en bf16: los pesos ocupan aproximadamente 481,4 GB (coincide con el tamano del repositorio), por lo que la inferencia en precision completa requiere del orden de 500 GB de VRAM sumando cache KV y overhead.
- VRAM estimada en FP8: alrededor de 240 GB, viable en configuraciones multi-GPU de gama alta.
- VRAM estimada en cuantizacion de 4 bits: en torno a 120-140 GB, todavia fuera del alcance de una sola GPU de consumo.
- GPU recomendadas: nodos con multiples NVIDIA H100 80 GB, H200 o A100 80 GB. La estrategia DvD esta pensada para repartir el codificador visual y el LLM entre GPUs distintas, lo que facilita despliegues multi-GPU heterogeneos.
- GPU de consumo: no cabe en una unica RTX 4090 o RTX 5090, ni siquiera cuantizado a 4 bits. Solo seria viable con cuantizaciones muy agresivas y offloading a RAM/SSD, con latencias altas.
- Opciones de despliegue: transformers con trust_remote_code (el modelo usa custom_code), vLLM y LMDeploy son los entornos habituales de la familia InternVL. No se confirma en la informacion disponible soporte de llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles. La arquitectura MoE con ~28B parametros activos y las optimizaciones ViR/DvD deberian reducir el coste frente a un modelo denso de 240B, pero no se aportan cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InternVL3.5-241B-A28B (esta subida) | 240,7B totales, ~28B activos | no disponible | State-of-the-art entre MLLM abiertos segun el autor; sin cifras concretas en la informacion | Apache 2.0 | HuggingFace (subida de terceros, 0 descargas) |
| OpenGVLab/InternVL3_5-241B-A28B (original) | 240,7B totales, ~28B activos | no disponible | Igual que el modelo base oficial | Apache 2.0 | HuggingFace (repositorio oficial) |
| Otros MLLM abiertos de gran escala | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numericos comparativos en la informacion proporcionada que permitan contrastar este modelo con alternativas concretas como Qwen2.5-VL o Llama-3.2-Vision. La propia model card situa al modelo como referencia open source frente a modelos comerciales tipo GPT-5, pero sin cifras verificables en el texto extraido.

## Limitaciones y advertencias

- Subida de terceros: el repositorio ANGELOSEGRETO/InternVL3_5-241B-A28B no es el oficial de OpenGVLab. Tiene 0 descargas y 0 likes, por lo que no ha sido validado por la comunidad ni por el equipo original.
- Relacion con el modelo base: es un finetune de OpenGVLab/InternVL3_5-241B-A28B-MPO. No se documentan en la ficha el dataset exacto del ajuste, la metodologia ni las diferencias de comportamiento respecto al modelo original.
- Riesgo de alucinacion: como todo MLLM de gran escala, puede generar contenido plausible pero incorrecto, especialmente en OCR de documentos de baja calidad, tablas complejas o razonamiento matematico de varios pasos.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o equidad en la informacion disponible.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada y no hay desglose de idiomas ni evaluacion multilingue mas alla de la etiqueta "multilingual".
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, pero al tratarse de una subida de terceros conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- Requisitos de codigo: el modelo usa custom_code y requiere trust_remote_code=True, lo que implica ejecutar codigo del repositorio; es recomendable auditar dicho codigo.
- Coste de despliegue: 481,4 GB de pesos y ~240B parametros totales implican infraestructura multi-GPU dedicada; no es viable en entornos de una sola GPU.
- Ausencia de benchmarks verificables: no hay cifras numericas publicadas en la informacion disponible que permitan reproducir las afirmaciones de rendimiento.

## Enlaces

- HuggingFace (esta subida): https://huggingface.co/ANGELOSEGRETO/InternVL3_5-241B-A28B
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3_5-241B-A28B-MPO
- Repositorio oficial InternVL3.5 (formato HF): https://huggingface.co/OpenGVLab/InternVL3_5-241B-A28B-HF
- Repositorio oficial InternVL3.5 (formato GitHub): https://huggingface.co/OpenGVLab/InternVL3_5-241B-A28B
- GitHub del proyecto InternVL: https://github.com/OpenGVLab/InternVL
- Paper InternVL 1.0: https://huggingface.co/papers/2312.14238
- Paper InternVL 1.5: https://huggingface.co/papers/2404.16821
- Paper InternVL 2.5: https://huggingface.co/papers/2412.05271
- Paper InternVL2.5-MPO: https://huggingface.co/papers/2411.10442
- Paper InternVL3: https://huggingface.co/papers/2504.10479
- Paper InternVL3.5: https://huggingface.co/papers/2508.18265
- Blog de InternVL: https://internvl.github.io/blog/
- Demo de chat: https://chat.intern-ai.org.cn/
- Documentacion: https://internvl.readthedocs.io/en/latest/
- Script de conversion custom2hf: https://github.com/OpenGVLab/InternVL/blob/main/internvl_chat/tools/internvl_custom2hf.py
- Script de conversion hf2custom: https://github.com/OpenGVLab/InternVL/blob/main/internvl_chat/tools/internvl_hf2custom.py
- Dataset MMPR-v1.2: https://huggingface.co/datasets/OpenGVLab/MMPR-v1.2
- Dataset MMPR-Tiny: https://huggingface.co/datasets/OpenGVLab/MMPR-Tiny
