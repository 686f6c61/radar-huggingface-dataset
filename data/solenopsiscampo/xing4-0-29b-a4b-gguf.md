# SolenopsisCampo/Xing4.0-29B-A4B-GGUF

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd. (heredero de la familia TeleChat) y publicado en el repositorio de cuantizaciones GGUF de SolenopsisCampo. Con 29B parámetros totales y solo 4B activos por token, ofrece una ventana de contexto nativa de 256K tokens extensible a 512K, lo que lo sitúa en la categoría de modelos de contexto largo orientados a tareas de agente.

La relevancia técnica del modelo radica en dos factores. Primero, es el primer modelo de esta escala entrenado íntegramente en la plataforma Ascend NPU con el framework MindSpore, con optimizaciones específicas (operadores fusionados mHC, recomputación selectiva, fusión automática de grafos DVM) que elevaron el throughput de entrenamiento un 96% respecto al rendimiento base. Segundo, su arquitectura mHC + MLA + MTP está diseñada explícitamente para planificación multi-paso, tool calling y cadenas de razonamiento largas.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors (transformers) y GGUF (esta cuantización), y compatibilidad declarada con vLLM, SGLang, KTransformers, LLaMA-Factory y MindFormers, además de frameworks de agentes como OpenCode, Claude Code, OpenClaw y Hermes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con mHC + MLA + MTP (40 capas, hidden size 3584) |
| Parametros totales | 31.215.031.088 (~29B, dato real de safetensors) |
| Parametros activos | ~4B por token (4 de 64 expertos enrutados + 1 compartido) |
| Longitud de contexto | 256K tokens nativo, extensible a 512K |
| Tipos de cuantizacion | GGUF (este repositorio); safetensors en el modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 40 capas, hidden size de 3584, FFN densa con tamaño intermedio de 9216 y expertos con tamaño intermedio de 1024. Dispone de 64 expertos enrutados de los que se activan 4 por token, más 1 experto compartido. La atención es de tipo MLA (Multi-head Latent Attention), y el diseño incorpora mHC (componente propietario de la familia Xing) y MTP (Multi-Token Prediction), orientados a mantener coherencia en contextos largos y a acelerar la decodificación.

El entrenamiento se realizó íntegramente en clústeres de Ascend 910C con MindSpore/MindFormers, incluyendo adaptación de características para mHC y desarrollo de operadores fusionados en Ascend C. Las optimizaciones de eficiencia incluyen comunicación MoE de grano fino, recomputación selectiva y fusión automática grafo-operador mediante DVM, con una mejora global de throughput del 96%. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento complejo, con modo "thinking" activable o desactivable mediante `chat_template_kwargs.enable_thinking`.
- Razonamiento matemático de competición (evaluado en AIME2026 con 90.00).
- Generación y edición de código en repositorios reales (SWE-bench Verified 75.00, SWE-bench Multilingual 66.00).
- Ejecución de tareas en terminal y entornos de línea de comandos (Terminal-Bench 2.1 con 57.50).
- Tool calling y function calling, con adaptación específica a frameworks de agentes (OpenCode, Claude Code, OpenClaw, Hermes).
- Planificación multi-paso y ejecución de cadenas de razonamiento largas gracias a la arquitectura orientada a agentes.
- Investigación profunda y recuperación de información multi-fuente (DeepresearchBII 60.80).
- Seguimiento de instrucciones complejas (IFBench 69.67).
- Capacidades multilingües en tareas de código (SWE-bench Multilingual); el conjunto exacto de idiomas naturales soportados no está disponible.
- Fine-tuning ligero para dominios verticales: clasificación de intención, comprensión de tablas, auditoría de contratos y QA sobre conocimiento.

## Casos de uso

- **Automatización de ingeniería de software**: el modelo puede resolver issues reales sobre repositorios (75.00 en SWE-bench Verified) e integrarse en pipelines de CI/CD mediante tool calling y su ventana de 256K tokens para cargar contexto de proyecto completo.
- **Agentes autónomos de terminal**: con 57.50 en Terminal-Bench 2.1, es adecuado para orquestar tareas de shell, instalación de dependencias y depuración en entornos aislados con timeouts de hasta 24 horas.
- **Atención al cliente multi-turno**: la ventana de 256K permite mantener historiales de conversación extensos y documentación de producto en contexto sin truncamiento, con temperatura recomendada de 1.0 y top_p 0.95.
- **Auditoría de contratos y documentos legales**: el modelo está diseñado para fine-tuning ligero en dominios verticales como auditoría contractual y QA sobre conocimiento, aprovechando el contexto largo para procesar expedientes completos.
- **Investigación profunda automatizada**: con 60.80 en DeepresearchBII, puede encadenar búsquedas, lectura de fuentes y síntesis en tareas de research multi-paso.
- **Migración y refactorización multi-repositorio**: los 66.00 en SWE-bench Multilingual y el soporte de tool calling permiten abordar cambios de código que cruzan lenguajes y proyectos.
- **Comprensión de tablas y clasificación de intención**: escenarios de back-office donde se requiere adaptación con datos propietarios mediante LLaMA-Factory o MindFormers.
- **Despliegue en infraestructura Ascend**: organizaciones con clústeres Ascend 910C pueden aprovechar la co-optimización nativa del modelo con MindSpore/MindFormers.

## Benchmarks y rendimiento

| Benchmark | Xing4.0-29B-A4B | Gemma4-26B-A4B | Qwen3.6-35B-A3B |
|---|---:|---:|---:|
| IFBench | 69.67 | **72.67** | 65.50 |
| AIME2026 | 90.00 | 88.30 | **92.70** |
| AA.LCR | 61.00 | **66.00** | 62.00 |
| Tau3-Bench | 64.63 | 58.90 | **67.20** |
| Claw-Eval | **76.55** | 71.49 | 74.54 |
| SWE-bench Verified | 75.00 | 53.00 | **76.00** |
| Terminal-Bench 2.1 | **57.50** | 30.00 | 51.50 |
| SWE-bench Multilingual | 66.00 | 51.00 | **67.20** |
| DeepresearchBII | **60.80** | 39.30 | 59.70 |

Condiciones de evaluación declaradas por el autor: SWE-bench Verified y Multilingual con harness `SWE-agent`, temperature 1.0, top_p 0.95, repetition_penalty 1.05 y ventana de 210K; Terminal-Bench 2.1 en `terminus-2` con temperature 0.8, max_tokens 64K, timeout de 24 horas y media de 3 ejecuciones; Claw-Eval con harness oficial, max_tokens 16384, contexto 256K y media de 3 ejecuciones; Tau3-Bench con harness oficial y temperature 0.8 (el resto de parámetros queda truncado en la información disponible).

## Requisitos de hardware

- **VRAM estimada**: con 31.2B parámetros totales, en FP16 se requieren aproximadamente 62 GB de pesos; en cuantización de 8 bits, ~31 GB; en 4 bits, ~16-18 GB. Al ser MoE con 4B activos, la latencia por token es más próxima a la de un modelo denso de 4B que a la de uno de 29B, aunque la memoria debe alojar todos los expertos.
- **GPU recomendadas**: A100 80GB, H100 80GB o clústeres Ascend 910C para FP16 y contexto largo. Para cuantizaciones de 4 bits, una RTX 4090 (24 GB) puede alojar los pesos, aunque la ventana de 256K exigirá gestión agresiva de KV cache.
- **Consumer GPU**: viable en RTX 4090 y GPUs con 24 GB o más usando GGUF de 4 bits; en GPUs de 16 GB solo con cuantizaciones agresivas y contextos reducidos.
- **Despliegue**: vLLM, SGLang, KTransformers, Transformers, llama.cpp/Ollama para GGUF, y MindFormers en Ascend. Fine-tuning con LLaMA-Factory o MindFormers.
- **Latencia y throughput**: no disponibles en la información proporcionada. El autor reporta una mejora del 96% en throughput de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Punto fuerte |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B | 29B | 4B | 256K (512K ext.) | Apache 2.0 | Agentes y terminal (Terminal-Bench 57.50, Claw-Eval 76.55) |
| Gemma4-26B-A4B | 26B | 4B | no disponible | no disponible | Seguimiento de instrucciones (IFBench 72.67) y contexto largo (AA.LCR 66.00) |
| Qwen3.6-35B-A3B | 35B | 3B | no disponible | no disponible | Matemáticas (AIME2026 92.70) y código (SWE-bench 76.00) |

Xing4.0 destaca en tareas de agente sobre terminal y en investigación profunda, mientras que Qwen3.6-35B-A3B lidera en matemáticas y código puro, y Gemma4-26B-A4B en seguimiento de instrucciones. La licencia Apache 2.0 de Xing4.0 es una ventaja clara para uso comercial frente a alternativas con licencias más restrictivas.

## Limitaciones y advertencias

- **Sesgos**: no se documentan en la información disponible; cabe esperar sesgos derivados de los datos de entrenamiento, no publicados.
- **Alucinación**: no se han publicado evaluaciones específicas de factualidad o tasa de alucinación.
- **Idiomas**: el conjunto exacto de idiomas naturales soportados no está disponible; la evaluación multilingüe se limita a código (SWE-bench Multilingual).
- **Contexto**: aunque el contexto nativo es de 256K, el rendimiento en ventanas extremas puede degradarse; las evaluaciones de SWE-bench usan 210K, no el máximo.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los frameworks de agentes adaptados (OpenCode, Claude Code, OpenClaw, Hermes), que tienen licencias propias.
- **Producción**: el repositorio es una cuantización GGUF de terceros (SolenopsisCampo), no el repo oficial; para producción conviene validar la fidelidad de la cuantización frente al modelo base y fijar parámetros de muestreo (temperature 1.0/0.8, top_p 0.95, repetition_penalty 1.05) según el escenario.
- **Hardware**: el entrenamiento está co-optimizado para Ascend; el rendimiento en GPUs NVIDIA no está cuantificado en la información disponible.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/SolenopsisCampo/Xing4.0-29B-A4B-GGUF
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- GitHub del modelo: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- TeleChat (predecesor): https://github.com/Tele-AI/TeleChat3
- vLLM: https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Harness Claw-Eval: https://github.com/claw-eval/claw-eval
- Harness Tau-Bench: https://github.com/sierra-research/tau-bench
- Paper referenciado (arXiv:2512.24157): no disponible enlace directo en la información proporcionada
- Paper referenciado (arXiv:2507.18013): no disponible enlace directo en la información proporcionada
