# Smnbrzq/Muse-Glimmer-30B-GGUF

## Resumen

Muse Glimmer es un modelo de lenguaje causal de 30 000 millones de parametros desarrollado por Meta Superintelligence Lab, destilado a partir de Muse Spark y disenado especificamente para tareas agénticas autonomas en hardware de consumo. El modelo integra razonamiento multi-paso, uso fiable de herramientas, comprension multimodal y recuperacion ante fallos en un unico modelo que se ejecuta localmente sin necesidad de infraestructura en la nube ni conexion a internet.

Esta ficha corresponde al repositorio Smnbrzq/Muse-Glimmer-30B-GGUF, que publica conversiones GGUF del modelo base meta-models/Muse-Glimmer-30B para su uso con llama.cpp. Incluye dos builds cuantizados del modelo de texto, un encoder de percepcion para entrada de imagenes y un drafter DFlash opcional para decodificacion especulativa. El modelo tiene aproximadamente 27 850 millones de parametros y soporta una ventana de contexto de hasta 131 072 tokens.

La relevancia de Muse Glimmer radica en su enfoque en agentes locales siempre activos: ejecuta razonamiento, uso de herramientas y comprension multimodal en una sola GPU de consumo, con licencia Apache 2.0 que permite uso comercial sin restricciones. Su soporte en llama.cpp desde el build b10353 lo hace accesible para despliegues locales con herramientas estandar del ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal con encoder de percepcion dedicado |
| Parametros totales | 27 854 794 240 (~27,85 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | Q4_K_M, Q4_K_XL (texto); Q4_K_M (encoder de percepcion y drafter) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Muse Glimmer es un modelo de lenguaje causal de 30 000 millones de parametros con un encoder de percepcion dedicado para entrada multimodal. Ha sido destilado a partir de Muse Spark, lo que implica una reduccion del tamano del modelo original manteniendo las capacidades esenciales. El modelo integra razonamiento multi-paso, uso fiable de herramientas, comprension multimodal y recuperacion ante fallos en una unica arquitectura, optimizada para tareas agénticas autonomas en hardware de consumo.

Los detalles sobre el entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) no estan disponibles en la informacion proporcionada. La arquitectura es compatible con llama.cpp desde el build b10353, e incorpora soporte para decodificacion especulativa mediante un drafter DFlash opcional que acelera la inferencia sin cambiar las salidas. El modelo se sirve mediante llama-server con plantilla Jinja y separa el razonamiento interno (reasoning_content) del contenido final (content).

## Capacidades

- Generacion de texto y razonamiento multi-paso integrado en el flujo de generacion, con traza de pensamiento separada del contenido final.
- Uso fiable de herramientas (tool calling / function calling) para tareas agénticas.
- Comprension multimodal: el encoder de percepcion (mmproj) permite entrada de imagenes.
- Recuperacion ante fallos: el modelo puede detectar y corregir errores en tareas de multiples pasos.
- Decodificacion especulativa mediante el drafter DFlash opcional para acelerar la inferencia.
- Ejecucion local sin conexion a la nube, disenado para agentes siempre activos.
- Soporte de chat conversacional con plantilla Jinja y endpoint compatible con OpenAI.

## Casos de uso

- Agentes de automatizacion local: el modelo puede ejecutar tareas agénticas de multiples pasos en segundo plano, como la gestion de correo o la organizacion de archivos, gracias a su razonamiento multi-paso y recuperacion ante fallos, sin depender de servicios en la nube.
- Asistente de codigo con vision: con el encoder de percepcion, puede analizar capturas de pantalla o diagramas y generar codigo o explicaciones tecnicas, combinando comprension visual y generacion de texto.
- Atencion al cliente automatizada: su ventana de contexto de 131 072 tokens permite mantener conversaciones multi-turno con historial extenso, mientras que el tool calling integrado le permite consultar bases de conocimiento o sistemas de tickets.
- Analisis de documentos con imagenes: puede procesar documentos que combinan texto e imagenes (informes, manuales) y extraer informacion relevante, gracias a su capacidad multimodal.
- Agente de investigacion local: el modelo puede buscar informacion, razonar sobre ella y sintetizar respuestas, ejecutandose en una GPU de consumo sin necesidad de infraestructura externa.
- Despliegue de servidor de inferencia local: mediante llama-server, puede servir un endpoint compatible con OpenAI para integracion en aplicaciones existentes, con soporte para multiples peticiones concurrentes (-np 4) y contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones estandar para este modelo.

## Requisitos de hardware

- El build Q4_K_M de 16,8 GB cabe en GPUs de consumo con 24 GB de VRAM (por ejemplo, RTX 4090).
- El build Q4_K_XL dinamico de 19,7 GB requiere al menos 32 GB de VRAM (por ejemplo, RTX 6000 Ada o A6000).
- Memoria total estimada: ~17 GB solo texto, ~19 GB con vision y ~20 GB con vision y drafter para el build de 17 GB; ~20 GB, ~22 GB y ~23 GB respectivamente para el build dinamico.
- El encoder de percepcion (1,4 GB) es obligatorio para entrada de imagenes; el drafter DFlash (1,6 GB) es opcional para decodificacion especulativa.
- Despliegue compatible con llama.cpp (llama-server, llama-cli, llama-mtmd-cli) y cualquier herramienta que use llama.cpp como backend (Ollama, etc.).
- Se requiere llama.cpp build b10353 o superior; builds anteriores no reconocen la arquitectura y rechazan cargar los archivos.
- Soporta CPU-only (sin GPU) y Apple Metal, ademas de CUDA.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. El modelo se posiciona como una alternativa de 30B parametros con licencia Apache 2.0, orientada a agentes locales, en un segmento donde compiten otros modelos abiertos de tamano similar. Sin datos de rendimiento publicados, no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Requiere llama.cpp build b10353 o superior; versiones anteriores no cargan el modelo y pueden producir salidas corruptas.
- Los builds de texto son solo texto sin el encoder de percepcion; para entrada de imagenes es obligatorio incluir el mmproj.
- No se publica GGUF en bf16 en este repositorio; para precision completa hay que usar el repositorio base.
- No se especifican los idiomas soportados; la informacion disponible no detalla la cobertura multilingue.
- No se han publicado benchmarks, por lo que el rendimiento en tareas estandar (MMLU, HumanEval, etc.) es desconocido.
- Al ser un modelo de 30B cuantizado, puede presentar alucinaciones y sesgos propios de los modelos de lenguaje; se recomienda validar las salidas en entornos de produccion.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos completos de la licencia.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/Smnbrzq/Muse-Glimmer-30B-GGUF
- Repositorio base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repositorio GGUF oficial de Meta: https://huggingface.co/meta-models/Muse-Glimmer-30B-GGUF
- Pagina de desarrollador de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Blog de investigacion de Meta: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Dell Enterprise Hub: https://dell.huggingface.co/models/meta-models/Muse-Glimmer-30B-GGUF
- PR de llama.cpp con soporte para Muse Glimmer: https://github.com/ggml-org/llama.cpp/pull/26841
- Paper arXiv 2504.13181: https://arxiv.org/abs/2504.13181
- Paper arXiv 2602.06036: https://arxiv.org/abs/2602.06036
