# eyes-dot-ml/GLM-5.3-NVFP4

## Resumen

GLM-5.3-NVFP4 es una versión cuantizada del modelo GLM-5.3 de Z.ai, producida por RadixArk mediante NVIDIA Model Optimizer. La cuantización sigue una receta NVFP4 W4A4 aplicada exclusivamente a los expertos enrutados de las capas MoE, manteniendo el resto de componentes (atención sparse, shared experts, routers, embeddings, etc.) en BF16. El resultado es un checkpoint de 465 GB (frente a los 1.507 GB del original) que conserva prácticamente el rendimiento del modelo BF16, con una degradación nula en GSM8K y dentro del ruido estadístico en AIME 2026.

El modelo está diseñado para cargas de trabajo de razonamiento complejo, codificación, uso prolongado de herramientas y tareas agénticas, con una ventana de contexto de hasta 1.048.576 tokens. Está optimizado para ejecutarse en GPUs NVIDIA Blackwell (validado en B300) mediante SGLang, y soporta decodificación especulativa EAGLE gracias a la capa MTP conservada en BF16. Es una opción atractiva para desarrolladores que necesitan desplegar un modelo de 753B parámetros con solo 40B activos por token en infraestructura de 8 GPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Sparse Mixture-of-Experts con sparse attention) - GlmMoeDsaForCausalLM |
| Parametros totales | 753B (modelo original); 380.989.135.104 en safetensors cuantizado (solo expertos) |
| Parametros activos | ~40B por token (top-8 de 256 expertos + 1 shared expert) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 W4A4 (solo expertos enrutados, group size 16, escalas FP8-E4M3); resto en BF16 |
| Idiomas soportados | Inglés, chino |
| Licencia | Z.AI Model License (MIT-style) |
| Formato de pesos | safetensors (cuantización NVFP4) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer sparse MoE con 78 capas decodificadoras: 3 capas densas MLP y 75 capas MoE. Cada capa MoE contiene 256 expertos enrutados (top-8) más 1 experto compartido, junto con un indexador IndexShare para la atención sparse. Incluye además una capa MTP (Multi-Token Prediction) que se conserva en BF16 y permite decodificación especulativa EAGLE.

La cuantización realizada por RadixArk aplica NVFP4 W4A4 a los 57.600 pesos lineales de los expertos enrutados (96,2% de los parámetros), con escalas de bloque FP8-E4M3 y escalas de activación estáticas por tensor. La calibración usó 1.024 muestras de secuencia 512, extraídas de la combinación `cnn_nemotron_v2_mix` de Model Optimizer (512 de CNN/DailyMail y 512 de Nemotron-Post-Training-Dataset-v2). No hubo entrenamiento ni fine-tuning adicional; el modelo hereda las capacidades del GLM-5.3 original.

## Capacidades

- Generación de texto y razonamiento complejo con modo de razonamiento explícito (Reasoning Effort: Max por defecto).
- Codificación avanzada: el modelo base GLM-5.3 es descrito como el más capaz entre los de pesos abiertos para tareas de programación, con una mejora del 50% sobre GLM-5.2 en benchmarks internos de Z.ai.
- Soporte de tool calling y function calling (parser `glm47` en SGLang).
- Capacidades agénticas de largo horizonte: uso prolongado de herramientas y ejecución de tareas multi-paso.
- Ventana de contexto de 1M tokens, adecuada para documentos extensos, análisis de repositorios completos o conversaciones de larga duración.
- Decodificación especulativa EAGLE (5 pasos, 6 tokens de borrador) para reducir latencia.
- Multilingüe limitado a inglés y chino.

## Casos de uso

- Ingeniería agéntica: el modelo puede orquestar flujos de trabajo complejos con múltiples llamadas a herramientas, manteniendo el contexto de la tarea durante horas de ejecución gracias a su ventana de 1M tokens y su soporte nativo de tool calling.
- Generación de código en producción: integrable en pipelines de CI/CD para revisión de código, generación de tests o refactorización automática, con la ventaja de manejar repositorios completos dentro del contexto.
- Razonamiento matemático y científico: con un 97,42% en GSM8K y 94,17% en AIME 2026 (pass@1), es adecuado para resolver problemas de nivel olímpico y verificar demostraciones.
- Análisis de documentos legales o técnicos extensos: la ventana de 1M tokens permite procesar contratos, patentes o manuales técnicos completos sin necesidad de chunking.
- Asistente de investigación multilingüe: capaz de leer y resumir literatura en inglés y chino, útil para equipos que trabajan con fuentes de ambos idiomas.
- Despliegue de bajo coste relativo: al ser un checkpoint pre-cuantizado, reduce los requisitos de almacenamiento y memoria en comparación con el BF16 original, permitiendo servir el modelo en 8 GPUs Blackwell en lugar de necesitar más hardware.

## Benchmarks y rendimiento

Los resultados fueron producidos por RadixArk con el checkpoint NVFP4 en 8x NVIDIA B300 mediante SGLang (TP8), con `temperature=1.0`, `top_p=0.95`, `max_tokens=131072` y `Reasoning Effort: Max`.

| Benchmark | Protocolo | Score |
|---|---|---|
| GSM8K | Split completo de 1.319 ejemplos, single-shot, sgl-eval | 97,42% (1.285/1.319) |
| AIME 2026 | 30 problemas x 16 rollouts, pass@1, sgl-eval | 94,17% (majority@16: 100%) |

Comparado con el modelo BF16 original bajo el mismo protocolo, GSM8K es idéntico y AIME 2026 está dentro del ruido de ejecución. No se han publicado otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- Inferencia validada en 8x NVIDIA B300 (Blackwell) con tensor parallelism de 8 (TP8) y SGLang.
- Requiere GPUs con soporte FP4 (arquitectura Blackwell: B100, B200, B300, RTX 50 series). No se garantiza funcionamiento en GPUs Ampere o Ada.
- VRAM estimada: el checkpoint cuantizado ocupa 465 GB en disco; en memoria, con 8 GPUs de 192 GB (B300) es suficiente. Para GPUs de menor capacidad (p.ej. RTX 5090 con 32 GB) no es viable sin sharding adicional.
- Opciones de despliegue: SGLang es el runtime soportado oficialmente. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan cifras concretas, pero la decodificación especulativa EAGLE (5 pasos, 6 tokens de borrador) reduce la latencia respecto a la generación autoregresiva estándar.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| GLM-5.3-NVFP4 (este) | 753B | ~40B | 1M | NVFP4 W4A4 (expertos) | Z.AI MIT-style |
| GLM-5.3-BF16 (original) | 753B | ~40B | 1M | BF16 | Z.AI MIT-style |
| GLM-5.3-Flash | 320B | 18B | no disponible | no disponible | no disponible |

La comparativa directa con el BF16 muestra que la cuantización reduce el tamaño del checkpoint de 1.507 GB a 465 GB (69% menos) sin pérdida medible en GSM8K y con degradación mínima en AIME. GLM-5.3-Flash es un modelo multimodal más pequeño y rápido, pero no se dispone de benchmarks comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés y chino; no está entrenado para otros idiomas.
- La cuantización NVFP4 requiere hardware Blackwell; no funcionará en GPUs más antiguas.
- El modelo base puede generar respuestas inexactas, incompletas, sesgadas o no deseadas; se recomienda evaluar en el caso de uso concreto y aplicar salvaguardas.
- La licencia es MIT-style pero con términos específicos de Z.ai; revisar el archivo LICENSE antes de uso comercial.
- No se han publicado evaluaciones de sesgos, alucinación o robustez adversarial para esta versión cuantizada.
- El despliegue requiere conocimientos de SGLang y configuración de tensor parallelism; no es un modelo plug-and-play para entornos de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/eyes-dot-ml/GLM-5.3-NVFP4
- Modelo original (Z.ai): https://huggingface.co/zai-org/GLM-5.3-BF16
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Repositorio de NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Repositorio de GLM-5 (Z.ai): https://github.com/zai-org/GLM-5
- Artículo de Inco AI sobre soporte GLM 5.3: https://inco.ai/blog/glm-5-3/
