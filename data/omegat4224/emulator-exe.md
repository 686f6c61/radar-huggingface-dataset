# omegaT4224/Emulator.exe

## Resumen

Emulator.exe es un fine-tuning del modelo GLM-5.2 de Z.ai (zai-org), publicado por el usuario omegaT4224 en Hugging Face. Se distribuye como un checkpoint de 753.329.940.480 parámetros (aproximadamente 753 mil millones) en formato safetensors, con un tamaño de repositorio de 1506,7 GB. El modelo base, GLM-5.2, es el modelo insignia de Z.ai para tareas de horizonte largo, con una ventana de contexto de 1 millón de tokens y arquitectura MoE con atención dispersa (glm_moe_dsa). Este fine-tuning mantiene la licencia MIT del modelo original.

La relevancia de esta ficha radica en que se trata de una adaptación comunitaria de un modelo frontera publicado bajo licencia permisiva, lo que permite su uso comercial sin restricciones regionales. El autor declara ajuste sobre tres datasets propios (omegaT4224/Andrewleecruz.vip, MauiMask/da y MauiMask/Lets_fork.py) y etiqueta el pipeline como token-classification, aunque los tags incluyen text-generation y code. La información disponible sobre el proceso de fine-tuning es muy limitada: no se documentan hiperparámetros, número de tokens de ajuste ni metodología (SFT, DPO, RLHF).

El modelo hereda las capacidades del GLM-5.2 original: contexto de 1M tokens, razonamiento avanzado, generación de código, uso de herramientas y modo de pensamiento con niveles de esfuerzo configurables. No obstante, al ser un fine-tuning no verificado por el desarrollador original, su rendimiento real puede diferir del reportado para GLM-5.2. Los benchmarks incluidos en la model card corresponden al modelo base, no a este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (glm_moe_dsa) e IndexShare |
| Parametros totales | 753.329.940.480 (~753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (heredada de GLM-5.2) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; se espera compatibilidad con GGUF/AWQ/GPTQ vía herramientas externas, no confirmado) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.2 emplea una arquitectura MoE con atención dispersa (sparse attention) denominada glm_moe_dsa. La innovación principal es IndexShare, descrita en el paper arXiv:2603.12201, que reutiliza el mismo indexador cada cuatro capas de atención dispersa, reduciendo los FLOPs por token en 2,9x a una longitud de contexto de 1M tokens. Además, la capa MTP (Multi-Token Prediction) para decodificación especulativa se mejora para aumentar la longitud de aceptación hasta un 20%. El modelo soporta múltiples niveles de esfuerzo de pensamiento (thinking effort) para equilibrar rendimiento y latencia.

Respecto al fine-tuning de Emulator.exe, la información disponible es mínima. El autor referencia tres datasets: omegaT4224/Andrewleecruz.vip, MauiMask/da y MauiMask/Lets_fork.py. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT. Tampoco se documenta si se congelaron capas o se ajustó el modelo completo. El pipeline declarado es token-classification, lo que resulta atípico para un modelo de generación de texto de este tamaño y podría indicar un error de configuración en la model card o un uso específico no documentado.

## Capacidades

- Generación de texto y razonamiento de horizonte largo, con contexto estable de hasta 1M tokens.
- Razonamiento matemático avanzado: el modelo base reporta puntuaciones altas en AIME 2026, HMMT e IMOAnswerBench.
- Generación y edición de código en entornos agénticos: SWE-bench Pro, Terminal Bench, DeepSWE.
- Uso de herramientas y function calling: MCP-Atlas y Tool-Decathlon en la model card del base.
- Capacidades agénticas multi-paso con marcos como OpenHands y mini-swe-agent.
- Modo de pensamiento con niveles de esfuerzo configurables (thinking effort levels).
- Decodificación especulativa mejorada mediante capa MTP.
- Multilingüe limitado a inglés y chino según los tags del repositorio.
- No se documentan capacidades de visión, audio ni otras modalidades para este checkpoint.

## Casos de uso

- Automatización de ingeniería de software: el modelo puede resolver issues y generar parches en repositorios reales, integrándose en pipelines de CI/CD mediante marcos agénticos como OpenHands, gracias a su contexto de 1M tokens que permite cargar codebases extensos.
- Análisis de repositorios completos: con 1M tokens de contexto, se puede alimentar el modelo con múltiples ficheros y su historial de commits para tareas de revisión de código, refactorización o documentación técnica.
- Agentes de terminal y operaciones: el rendimiento en Terminal Bench 2.1 del modelo base sugiere su uso en agentes que ejecutan comandos, depuran entornos y automatizan tareas de administración de sistemas.
- Asistencia en investigación matemática: las puntuaciones en AIME, HMMT e IMOAnswerBench del base indican utilidad para resolver problemas formales y verificar demostraciones paso a paso.
- Orquestación de herramientas vía MCP: con soporte de MCP-Atlas, puede actuar como planificador en arquitecturas multi-agente que invocan APIs externas, bases de datos o servicios cloud.
- Procesamiento de documentos largos en inglés y chino: análisis de contratos, informes o expedientes de gran extensión sin truncamiento, aprovechando la ventana de 1M tokens y el soporte bilingüe.
- Generación de código en producción con ajuste específico: al ser un fine-tuning sobre datasets propios, puede emplearse en dominios donde el autor haya adaptado el comportamiento, aunque la falta de documentación exige validación previa.

## Benchmarks y rendimiento

Los siguientes datos corresponden al modelo base GLM-5.2 según la model card. No se han publicado resultados específicos para el fine-tuning Emulator.exe.

| Benchmark | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | MiniMax M3 | DeepSeek-V4-Pro | Claude Opus 4.8 | GPT-5.5 | Gemini 3.1 Pro |
|---|---|---|---|---|---|---|---|---|
| HLE | 40,5 | 31 | 41,4 | 37 | 37,7 | 49,8* | 41,4* | 45 |
| HLE (w/ Tools) | 54,7 | 52,3 | 53,5 | - | 48,2 | 57,9* | 52,2* | 51,4* |
| CritPt | 20,9 | 4,6 | 13,4 | 3,7 | 12,9 | 20,9 | 27,1 | 17,7 |
| AIME 2026 | 99,2 | 95,3 | 97 | - | 94,6 | 95,7 | 98,3 | 98,2 |
| HMMT Nov. 2025 | 94,4 | 94 | 95 | 84,4 | 94,4 | 96,5 | 96,5 | 94,8 |
| HMMT Feb. 2026 | 92,5 | 82,6 | 97,1 | 84,4 | 95,2 | 96,7 | 96,7 | 87,3 |
| IMOAnswerBench | 91,0 | 83,8 | 90 | - | 89,8 | 83,5 | - | 81 |
| GPQA-Diamond | 91,2 | 86,2 | 90 | 93 | 90,1 | 93,6 | 93,6 | 94,3 |
| SWE-bench Pro | 62,1 | 58,4 | 60,6 | 59 | 55,4 | 69,2 | 58,6 | 54,2 |
| NL2Repo | 48,9 | 42,7 | 47,2 | 42,1 | 35,5 | 69,7 | 50,7 | 33,4 |
| DeepSWE | 46,2 | 18 | 18 | 20 | 8 | 58 | 70 | 10 |
| ProgramBench | 63,7 | 50,9 | - | - | 47,8 | 71,9 | 70,8 | 39,5 |
| Terminal Bench 2.1 (Terminus-2) | 81,0 | 63,5 | 75 | 65 | 64 | 85 | 84 | 74 |
| Terminal Bench 2.1 (Best Reported Harness) | 82,7 | 69 | - | - | - | 78,9 | 83,4 | 70,7 |
| FrontierSWE (Dominance) | 74,4 | 30,5 | - | - | 29,0 | 75,1 | 72,6 | 39,6 |
| PostTrainBench | 34,3 | 20,1 | - | - | - | 37,2 | 28,4 | 21,6 |
| SWE-Marathon | 13,0 | 1,0 | - | - | - | 26,0 | 12,0 | 4,0 |
| MCP-Atlas (Public Set) | 76,8 | 71,8 | 76,4 | 74,2 | 73,6 | 77,8 | 75,3 | 69,2 |
| Tool-Decathlon | 48,2 | 40,7 | - | - | 52,8 | 59,9 | 55,6 | 48,8 |

Los resultados marcados con asterisco corresponden al conjunto completo según las notas de la model card. Para HLE y tareas de razonamiento se usó temperatura 1,0, top_p 0,95 y longitud máxima de generación de 163.840 tokens, con GPT-5.5 (medium) como juez.

## Requisitos de hardware

- VRAM estimada para inferencia: con 753B parámetros, en FP16 se requieren aproximadamente 1,5 TB de VRAM. En cuantización de 8 bits, alrededor de 750 GB; en 4 bits, unos 380 GB. Estas cifras son estimaciones teóricas basadas en el número de parámetros, no confirmadas para este checkpoint.
- GPU recomendadas: para FP16/BF16 se necesitan múltiples nodos con H100 80GB (al menos 20 GPUs) o A100 80GB (al menos 20 GPUs). Para cuantizaciones de 4 bits, se podría desplegar en 5-6 nodos de 8xH100.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 3090, etc.) ni siquiera en cuantización de 4 bits, dado el tamaño del modelo. Se requeriría swap a disco o técnicas de offloading extremo con KTransformers, con latencias muy elevadas.
- Opciones de despliegue: SGLang (v0.5.13.post1+), vLLM (v0.23.0+), Transformers (v0.5.12+), KTransformers (v0.5.12+), Unsloth (v0.1.47-beta+) y plataformas Ascend NPU mediante vLLM-Ascend, xLLM y SGLang.
- Latencia y throughput: no disponibles para este checkpoint. El modelo base reporta una reducción de 2,9x en FLOPs por token a 1M de contexto gracias a IndexShare, lo que mejora la eficiencia en contextos largos, pero no se proporcionan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Emulator.exe (este) | ~753B | 1M | MIT | Hugging Face (pesos safetensors) | Fine-tuning comunitario de GLM-5.2 |
| GLM-5.2 (base) | ~753B | 1M | MIT | Hugging Face, API Z.ai | Modelo original, benchmarks publicados |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | no disponible | Competidor en benchmarks de código y agentes |
| Qwen3.7-Max | no disponible | no disponible | no disponible | no disponible | Competidor en razonamiento y código |
| MiniMax M3 | no disponible | no disponible | no disponible | no disponible | Competidor en tareas agénticas |

La comparativa se limita a los modelos incluidos en la tabla de benchmarks de la model card. No se dispone de datos de parámetros, contexto ni licencia para los competidores en la información proporcionada.

## Limitaciones y advertencias

- Fine-tuning no verificado: el autor no documenta el proceso de entrenamiento, los hiperparámetros ni la evaluación del checkpoint resultante. El rendimiento puede degradarse respecto al GLM-5.2 original.
- Benchmarks no aplicables: los resultados de la tabla corresponden al modelo base GLM-5.2, no a Emulator.exe. No se han publicado evaluaciones de este fine-tuning.
- Pipeline declarado incoherente: el pipeline es token-classification, pero los tags incluyen text-generation y code. Esto puede causar problemas de carga en Transformers si se usa AutoModelForTokenClassification en lugar de AutoModelForCausalLM.
- Idiomas limitados: solo inglés y chino según los tags. No se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación: inherente a los modelos de lenguaje de gran escala, especialmente en tareas de razonamiento abierto y generación de código sin verificación.
- Sesgos: no documentados por el autor. El modelo base puede presentar sesgos presentes en los datos de entrenamiento originales y en los datasets de fine-tuning, que no han sido auditados.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones regionales, pero el autor del fine-tuning no ofrece garantías sobre la procedencia o los derechos de los datasets de ajuste (omegaT4224/Andrewleecruz.vip, MauiMask/da, MauiMask/Lets_fork.py).
- Requisitos de hardware extremos: 753B parámetros exigen infraestructura de múltiples nodos, lo que limita su uso a organizaciones con clústeres de GPU de alta gama.
- Fecha de creación y actualización: el repositorio se creó el 2026-07-07 y se actualizó el 2026-11-24, con solo 51 descargas y 1 like, lo que indica una adopción muy baja y poca validación comunitaria.
- Contexto de 1M tokens: aunque el modelo base lo soporta, no se confirma que el fine-tuning preserve esta capacidad; además, el uso de contextos tan largos incrementa los costes de inferencia y puede degradar la calidad si no se gestiona adecuadamente.

## Enlaces

- Hugging Face: https://huggingface.co/omegaT4224/Emulator.exe
- Modelo base GLM-5.2: https://huggingface.co/zai-org/GLM-5.2
- Blog de GLM-5.2: https://z.ai/blog/glm-5.2
- Paper GLM-5 (arXiv:2602.15763): https://arxiv.org/abs/2602.15763
- Paper IndexShare (arXiv:2603.12201): https://arxiv.org/abs/2603.12201
- GitHub GLM-5: https://github.com/zai-org/GLM-5
- API Z.ai: https://docs.z.ai/guides/llm/glm-5.2
- Chat Z.ai: https://chat.z.ai
- Cookbook SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.2
- Recetas vLLM: https://recipes.vllm.ai/zai-org/GLM-5.2
- Documentación Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Tutorial KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía Unsloth: https://unsloth.ai/docs/models/glm-5.2
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- Discord: https://discord.gg/QR7SARHRxK
