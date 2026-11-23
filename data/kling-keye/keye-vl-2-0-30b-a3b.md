# Kling-Keye/Keye-VL-2.0-30B-A3B

## Resumen

Keye-VL-2.0-30B-A3B es un modelo multimodal de tipo image-text-to-text desarrollado por Kling-Keye (equipo Kwai Keye). Se trata del modelo insignia de la serie Keye en la clase de 30.000 millones de parametros, disenado especificamente para empujar la frontera de la comprension de video de larga duracion y para introducir capacidades de agente en la familia Keye. Con 31.122.082.160 parametros totales y una arquitectura MoE (segun la nomenclatura A3B, con aproximadamente 3.000 millones de parametros activos), el modelo combina un encoder visual Keye-VL-1.5 con un LM de tipo transformer disperso.

La innovacion tecnica central es la incorporacion de DSA (DeepSeek Sparse Attention) de forma nativa en produccion, lo que permite un razonamiento practicamente sin perdida sobre contextos ultralargos de hasta 256K tokens. Esto se traduce en capacidad para procesar videos de hasta una hora de duracion con localizacion temporal precisa, manteniendo la eficiencia computacional gracias a atencion dispersa y agregacion selectiva de caracteristicas.

El modelo es relevante ahora porque, segun la model card, iguala o supera a modelos cerrados de primer nivel como Gemini 3 Flash en tareas de grounding temporal, y supera a modelos abiertos de mucho mayor tamano (como Qwen3-VL-235B-A22B) en comprension de video largo, todo ello bajo licencia Apache 2.0 y con un ecosistema de inferencia adaptado (rama propia de SGLang, soporte en DeepGEMM y kernels personalizados).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con MoE y DSA (DeepSeek Sparse Attention); encoder visual Keye-VL-1.5 + LM disperso |
| Parametros totales | 31.122.082.160 (~31,1B) |
| Parametros activos | ~3B (segun nomenclatura A3B; no se detalla el valor exacto en la informacion disponible) |
| Longitud de contexto | 256K tokens (contexto ultralargo, con razonamiento casi sin perdida) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

Keye-VL-2.0-30B-A3B es un modelo multimodal construido sobre una arquitectura transformer con mezcla de expertos (MoE) y atencion dispersa nativa (DSA, DeepSeek Sparse Attention). La DSA, junto con la agregacion selectiva de caracteristicas, permite procesar secuencias ultralargas (hasta 256K tokens) con un coste de prefill reducido, lo que habilita la comprension precisa de videos de hasta una hora. El modelo integra el encoder visual Keye-VL-1.5, que refuerza la percepcion, el OCR y la comprension de graficos y tablas.

El entrenamiento se articula en torno a un pipeline de pre-entrenamiento multimodal centrado en datos (data-centric), con curacion cuidadosa del dataset y datos sinteticos de CoT (chain-of-thought) para reforzar la continuidad del razonamiento. La fase de post-entrenamiento incluye tecnicas como MOPD, bucket advantage scaling, Context-RL y filtrado de datos de alta relacion senal-ruido (high-SNR), orientadas a mejorar la fusion de expertos entre modalidades, reducir alucinaciones y estabilizar las decisiones en contexto largo. Ademas, el stack de inferencia y entrenamiento incorpora ExtraIO, paralelismo heterogeneo ViT-LM, optimizacion de activaciones y kernels personalizados (EffectiveKernels, DeepGEMM) para reducir el coste de prefill en secuencias largas y aumentar el throughput de entrenamiento. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Generacion de texto y razonamiento multimodal (image-text-to-text).
- Comprension de video de larga duracion (hasta una hora) con localizacion temporal precisa (temporal grounding).
- Razonamiento sobre contexto ultralargo de 256K tokens con DSA.
- Capacidades de codigo (Code agent) para tareas de repositorio.
- Uso de herramientas y function calling (Tool agent) con estilo API.
- Busqueda web con fundamentacion (Search agent).
- Flujos de autocorreccion visual (visual self-correction).
- Razonamiento multi-paso y orquestacion de agentes (Agent collaboration mechanism).
- Comprension de OCR, graficos y tablas.
- Razonamiento matematico y STEM (evaluado en benchmarks).
- Seguimiento de instrucciones (Instruction Following).
- VQA general (General VQA).
- Capacidades multilingues limitadas al ingles (unico idioma declarado).

## Casos de uso

- Analisis de video de vigilancia o monitorizacion: el modelo puede procesar grabaciones de hasta una hora y localizar eventos concretos en el tiempo (temporal grounding) gracias a su contexto de 256K tokens y a la atencion dispersa DSA, lo que permite generar informes con marcas temporales precisas.
- Indexado y busqueda semantica de video: con capacidad de comprension de video largo y grounding temporal, se puede usar para generar descripciones y metadatos alineados temporalmente que alimenten un motor de busqueda sobre archivos audiovisuales.
- Atencion al cliente multimodal: gestion de conversaciones multi-turno con imagenes adjuntas (capturas, fotos de producto) y contexto largo, aprovechando el soporte de tool calling para consultar sistemas internos.
- Agente de codigo sobre repositorios: el modelo incorpora capacidades de Code agent para tareas de repositorio, lo que permite integrarlo en pipelines de desarrollo para analisis de codigo, generacion de parches y navegacion de proyectos.
- Automatizacion de tareas con APIs: gracias al Tool agent y al function calling, puede orquestar llamadas a APIs externas en flujos multi-paso, con autocorreccion cuando una llamada falla.
- Investigacion asistida con busqueda web: el Search agent permite fundamentar respuestas en resultados web, util para tareas de verificacion y sintesis de informacion actualizada.
- Extraccion de datos de documentos visuales: con soporte de OCR, graficos y tablas, puede extraer y estructurar informacion de facturas, informes o capturas de pantalla.
- Razonamiento STEM asistido: para resolver problemas matematicos y de ciencia con imagenes de diagramas o ecuaciones, apoyandose en el razonamiento multi-paso.

## Benchmarks y rendimiento

Los datos disponibles en la model card son parciales (la tabla completa esta en el informe tecnico). Se presentan los resultados publicados:

| Benchmark | Metrica | Keye-VL-2.0-30B-A3B | Referencia comparada |
|---|---|---|---|
| Charades-TimeLens | mIoU | 58,4 | Gemini 3 Flash: 61,19 |
| ActivityNet-TimeLens | mIoU | 58,5 | Gemini 3 Flash: 56,95 |
| QVHighlights-TimeLens | mIoU | 70,1 | Gemini 3 Flash: 49,45 |
| VideoMME V2 (64 frames) | precision | 35,3% | no disponible |
| VideoMME V2 (512 frames) | precision | 42,4% | no disponible |
| VideoMME V2 (razonamiento no lineal, 64 frames) | puntuacion | 18,5 | no disponible |
| VideoMME V2 (razonamiento no lineal, 512 frames) | puntuacion | 24,2 | no disponible |
| LongVideoBench | puntuacion | 74,1 | Qwen3.5-35B-A3B y Qwen3-VL-235B-A22B (valores no disponibles) |

La model card indica que el modelo se compara con Qwen3.5-35B-A3B, InternVL3.5-241B-A28B, GPT-5-mini y Qwen3-VL 30B-A3B / 32B / 235B-A22B en siete dimensiones (Video, Coding, Agent, Math & Reasoning, STEM, Instruction Following y General VQA), pero los valores completos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 31,1B parametros totales y ~3B activos, en precision BF16 se requeriria aproximadamente 62 GB de VRAM para los pesos (coincide con el tamano del repo de 62,3 GB). Con cuantizacion a 8 bits se reduciria a ~31 GB; a 4 bits, a ~16 GB. No se publican cifras oficiales de cuantizacion.
- GPU recomendadas: para BF16, GPUs de 80 GB como A100 80GB o H100 80GB. Para despliegue en consumer, se necesitarian cuantizaciones agresivas en GPUs de 24 GB (RTX 4090) o 32 GB, no confirmadas oficialmente.
- Cabe en consumer GPU: solo con cuantizacion (estimacion, no confirmada por el autor); en BF16 no cabe en GPUs consumer.
- Opciones de despliegue: SGLang (rama personalizada del autor: Kwai-Keye/sglang, rama keye-vl-v2-30b-release), DeepGEMM con soporte Keye y EffectiveKernels. Compatible con transformers (custom_code). No se confirma soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Keye-VL-2.0-30B-A3B | ~31,1B totales / ~3B activos | 256K | Apache 2.0 | Hugging Face | DSA nativa, video largo, agentes |
| Qwen3-VL-30B-A3B | 30B clase MoE (A3B) | no disponible | no disponible | no disponible | Comparado en la model card |
| Qwen3.5-35B-A3B | ~35B clase MoE (A3B) | no disponible | no disponible | no disponible | Comparado en la model card |
| InternVL3.5-241B-A28B | 241B totales / 28B activos | no disponible | no disponible | no disponible | Comparado en la model card |
| Qwen3-VL-235B-A22B | 235B totales / 22B activos | no disponible | no disponible | no disponible | Superado en LongVideoBench segun la model card |

Los datos de contexto y licencia de los modelos comparados no estan disponibles en la informacion proporcionada; solo se dispone de sus nombres y, en algunos casos, de su tamano.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al ser un modelo entrenado con datos web y multimodales, es previsible que herede sesgos de esos datos.
- Riesgo de alucinacion: la model card menciona tecnicas de post-entrenamiento para reducir alucinaciones, pero no cuantifica la tasa residual; en tareas de video largo y contexto ultralargo el riesgo persiste.
- Limitaciones de idioma: el modelo solo declara soporte de ingles (en); no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Limitaciones de contexto: aunque soporta 256K tokens, el rendimiento en VideoMME V2 es bajo en terminos absolutos (35,3%-42,4%), lo que sugiere margen de mejora en razonamiento de video complejo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las dependencias (SGLang, DeepGEMM, EffectiveKernels) por si tienen licencias distintas.
- Caveats para produccion: el despliegue recomendado requiere una rama personalizada de SGLang y kernels propios (DeepGEMM, EffectiveKernels), lo que anade complejidad operativa; no hay soporte confirmado en llama.cpp, Ollama ni TGI. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su validacion por la comunidad es practicamente nula.
- El modelo fue creado y actualizado el 2026-11-23, con un repo de 62,3 GB; verificar la integridad de los pesos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kling-Keye/Keye-VL-2.0-30B-A3B
- Informe tecnico Keye-VL: https://arxiv.org/abs/2507.01949
- Informe tecnico Keye-VL-1.5: https://arxiv.org/abs/2509.01563
- Informe tecnico Keye-VL-2.0: https://arxiv.org/abs/2606.10651
- Homepage: https://kwai-keye.github.io/
- GitHub: https://github.com/Kwai-Keye/Keye
- SGLang (rama Keye): https://github.com/Kwai-Keye/sglang/tree/keye-vl-v2-30b-release
- DeepGEMM (soporte Keye): https://github.com/Kwai-Keye/DeepGEMM/tree/keye_support
- EffectiveKernels: https://github.com/Kwai-Keye/EffectiveKernels
- X: https://x.com/KwaiKeye
- Discord: https://discord.gg/4Q6AmzxpEK
- Keye-VL-8B-Preview: https://huggingface.co/Kwai-Keye/Keye-VL-8B-Preview
- Keye-VL-1.5-8B: https://huggingface.co/Kwai-Keye/Keye-VL-1_5-8B/
