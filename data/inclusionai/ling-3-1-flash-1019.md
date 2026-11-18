# inclusionAI/Ling-3.1-flash-1019

## Resumen

Ling-3.1-flash-1019 es un modelo de lenguaje de tipo Mixture of Experts (MoE) con arquitectura híbrida lineales-deslizantes, desarrollado por inclusionAI (organización vinculada a Ant Group). Se trata de una actualización del Ling-3.1-flash original, con 560B parámetros totales y 25B parámetros activos por token, diseñado para cargas de trabajo agénticas y de razonamiento científico en entornos de producción.

La innovación principal de esta versión radica en el post-entrenamiento: sin cambiar la arquitectura, el modelo mejora de forma notable en benchmarks de capacidades agénticas del mundo real (AA-Briefcase de 1397 a 1524, AutomationBench-AA del 62% al 68%) y científicos (CritPt del 18% al 26%, SciCode del 54% al 57%). Alcanza una puntuación de 44 en el Artificial Analysis Intelligence Index v4.3.2 y 30 en la v5.

Su ventana de contexto de 1M tokens, combinada con decodificación especulativa MTP (NEXTN) y soporte day-0 en SGLang y vLLM, lo posicionan como una opción para despliegues de agentes multi-paso con contexto largo. La licencia MIT facilita su adopción comercial, aunque su tamaño exige infraestructura multi-GPU de gama alta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (63 capas KDA + 9 capas Gated MLA, ratio 7:1) |
| Parámetros totales | 560B (572.120.680.768 según safetensors) |
| Parámetros activos | 25B por token |
| Longitud de contexto | 1M tokens |
| Tipos de cuantización | FP8 (pesos publicados en fp8); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, bailing_hybrid) |

Otros datos de arquitectura: 4 capas densas, 512 expertos enrutados, 1 experto compartido, 8 expertos activados por token, 64 cabezas de atención, hidden size 4096, tamaño intermedio de experto 1280, tamaño intermedio denso 10240, vocabulario de 157184 tokens.

## Arquitectura y entrenamiento

Ling-3.1-flash-1019 emplea una arquitectura MoE híbrida que combina 63 capas con atención lineal KDA (Kimi Delta Attention) y 9 capas con Gated MLA (Multi-head Latent Attention), en proporción 7:1, más 4 capas densas. El modelo enruta cada token hacia 8 de sus 512 expertos, con un experto compartido adicional, lo que permite mantener un coste de inferencia correspondiente a 25B parámetros activos pese a los 560B totales. La atención lineal en la mayoría de capas es clave para hacer viable la ventana de 1M tokens sin un coste cuadrático prohibitivo.

El modelo incorpora decodificación especulativa MTP (Multi-Token Prediction, variante NEXTN), soportada de forma nativa en SGLang y vLLM, que acelera la decodificación. Los pesos se publican en FP8, y SGLang incluye optimizaciones específicas para Hopper (GEMV FP8 por bloques y cuantización fusionada de salida KDA) que reportan aproximadamente un 10% más de velocidad en decodificación batch-1. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento complejo multi-paso.
- Modo de razonamiento explícito activable mediante `enable_thinking` en el chat template.
- Capacidades agénticas: ejecución de tareas multi-paso y flujos de trabajo del mundo real (evaluadas en AutomationBench-AA y AA-Briefcase).
- Razonamiento científico y generación de código científico (evaluado en CritPt y SciCode).
- Tool calling / function calling nativo, con parser dedicado `ling3` en vLLM y `--enable-auto-tool-choice`.
- Soporte de contexto largo de hasta 1M tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Decodificación especulativa MTP para reducir latencia.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agentes autónomos de automatización de flujos de trabajo: el modelo está optimizado para tareas multi-paso (AutomationBench-AA al 68%) y puede orquestar llamadas a herramientas mediante tool calling nativo en vLLM o SGLang.
- Asistentes de investigación científica: su mejora en CritPt (26%) y SciCode (57%) lo hace adecuado para generación y revisión de código científico y razonamiento sobre problemas de física y matemáticas.
- Análisis de documentación extensa: con 1M tokens de contexto puede procesar repositorios completos, expedientes o bases de conocimiento sin fragmentación, apoyándose en prefix caching para reducir coste.
- Copilotos de código en pipelines de CI/CD: el soporte de tool calling y el parser `ling3` permiten integrarlo en herramientas que invocan funciones externas (tests, linters, despliegues).
- Atención al cliente avanzada: conversaciones multi-turno largas con memoria de contexto amplia y modo de razonamiento activable para consultas complejas.
- Despliegue en infraestructura propia con FP8: los pesos en FP8 y las recetas verificadas para H200, GB300, H800, H100 y B200 permiten servir el modelo en clústeres de 4 a 8 GPUs con SGLang o vLLM.

## Benchmarks y rendimiento

| Benchmark | Ling-3.1-flash | Ling-3.1-flash-1019 |
|---|---|---|
| AA-Briefcase | 1397 | 1524 |
| AutomationBench-AA | 62% | 68% |
| CritPt | 18% | 26% |
| SciCode | 54% | 57% |
| Artificial Analysis Intelligence Index v4.3.2 | 41 | 44 |
| Artificial Analysis Intelligence Index v5 | no disponible | 30 |

No se han publicado en la información disponible resultados de benchmarks clásicos (MMLU, HumanEval, GSM8K) ni comparaciones numéricas con modelos de la competencia.

## Requisitos de hardware

- VRAM estimada: con 560B parámetros en FP8, el modelo requiere aproximadamente 560 GB solo para pesos, más caché KV y overhead; en la práctica se sirve en 8 GPUs de 80 GB o más.
- GPU recomendadas: 8 × H200 (TP8 + EP8) o 4 × GB300 (TP4 + EP4) según las recetas oficiales de SGLang; también hay recetas verificadas para H800, H100 y B200.
- Consumer GPU: no cabe en GPUs de consumo (RTX 4090, 24 GB) en ninguna configuración razonable dado el tamaño del modelo.
- Opciones de despliegue: SGLang (recomendado, imagen `lmsysorg/sglang:dev-ling-3.1-flash` con soporte day-0, MTP y optimizaciones Hopper) y vLLM (rama `vllm` del repositorio, con expert parallel, mamba cache mode align y speculative config MTP). No se menciona soporte de llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan cifras concretas; SGLang reporta aproximadamente un 10% de mejora en decodificación batch-1 con las optimizaciones Hopper opcionales.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con modelos alternativos de la misma categoría (MoE de gran escala con contexto largo), por lo que no se puede elaborar una tabla comparativa fiable sin inventar datos.

## Limitaciones y advertencias

- Tamaño prohibitivo para despliegues pequeños: 560B parámetros exigen clústeres multi-GPU de gama alta; no es viable en hardware de consumo ni en una sola GPU estándar.
- Idiomas soportados no documentados: la model card no especifica cobertura lingüística, lo que impide garantizar calidad fuera del inglés sin evaluación previa.
- Riesgo de alucinación: como todo LLM, puede generar contenido plausible pero incorrecto, especialmente en dominios científicos; los benchmarks muestran CritPt al 26%, lo que indica margen de error considerable en razonamiento científico avanzado.
- Sesgos: no se documentan evaluaciones de sesgo ni medidas de mitigación en la información disponible.
- Dependencia de código personalizado: los pesos usan `custom_code` y arquitectura `bailing_hybrid`, por lo que requieren versiones específicas de SGLang o vLLM (rama dedicada); no funcionan con toolchains genéricos sin adaptación.
- Licencia MIT: permisiva para uso comercial, pero conviene revisar la documentación de transparencia de contenidos de entrenamiento enlazada por el autor para cumplimiento normativo.
- Contexto de 1M tokens: aunque soportado, el coste de caché KV y la degradación potencial en recuperación de información a distancias extremas deben validarse en el caso de uso concreto.

## Enlaces

- [Hugging Face: inclusionAI/Ling-3.1-flash-1019](https://huggingface.co/inclusionAI/Ling-3.1-flash-1019)
- [Modelo predecesor: Ling-3.1-flash](https://huggingface.co/inclusionAI/Ling-3.1-flash)
- [Organización inclusionAI en Hugging Face](https://huggingface.co/inclusionAI)
- [Organización inclusionAI en ModelScope](https://modelscope.cn/organization/inclusionAI)
- [Ling-3.1-flash en OpenRouter](https://openrouter.ai/inclusionai/ling-3.1-flash)
- [SGLang Ling-3.1-flash cookbook](https://docs.sglang.io/cookbook/autoregressive/InclusionAI/Ling-3.1-flash)
- [Repositorio vLLM (rama vllm)](https://github.com/vllm-project/vllm)
- [Training-content summary (PDF)](https://huggingface.co/inclusionAI/AI-Transparency/resolve/main/Ling-3.1_TDS-Summary.pdf)
- [Índice de documentación de transparencia](https://huggingface.co/inclusionAI/AI-Transparency)
