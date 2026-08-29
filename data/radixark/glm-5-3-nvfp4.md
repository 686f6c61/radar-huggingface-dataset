# RadixArk/GLM-5.3-NVFP4

## Resumen

RadixArk/GLM-5.3-NVFP4 es una versión cuantizada del modelo GLM-5.3-BF16 de Z.ai, producida por RadixArk utilizando NVIDIA Model Optimizer. Se trata de un modelo de lenguaje de tipo Transformer con arquitectura de mezcla dispersa de expertos (Sparse MoE) y atención dispersa, diseñado para tareas de razonamiento, generación de código, uso de herramientas y trabajo agéntico de largo alcance. El checkpoint cuantizado reduce el tamaño de 1.507 GB a 465 GB, manteniendo una calidad de salida prácticamente idéntica al original en las evaluaciones publicadas.

La cuantización aplica NVFP4 W4A4 únicamente a los expertos enrutados de las capas MoE (96,2% de los parámetros), mientras que el resto de componentes (atención dispersa, indexador, expertos compartidos, routers, capas densas, normas, embeddings y capa MTP) se mantienen en BF16. Esto permite soportar decodificación especulativa EAGLE y desplegar el modelo en hardware NVIDIA Blackwell con SGLang. El modelo está pensado para desarrolladores que necesitan un checkpoint pre-cuantizado listo para producción en entornos de razonamiento y agénticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Sparse MoE con atención dispersa (GlmMoeDsaForCausalLM) |
| Parametros totales | 753B (modelo original); checkpoint cuantizado: 380.989.135.104 (~381B) |
| Parametros activos | ~40B por token (top-8 de 256 expertos + 1 experto compartido) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 W4A4 (expertos enrutados, group size 16), FP8-E4M3 block scales, BF16 para el resto |
| Idiomas soportados | Inglés, chino |
| Licencia | Z.AI Model License (MIT-style) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-BF16 es un Transformer con 78 capas decoder, de las cuales 3 son MLP densas y 75 son capas MoE. Cada capa MoE contiene 256 expertos enrutados (top-8) más un experto compartido, junto con un indexador IndexShare para la atención dispersa. Incluye una capa MTP (Multi-Token Prediction) que permite decodificación especulativa. El modelo fue entrenado por Z.ai con datos propietarios; RadixArk no realizó ningún entrenamiento o fine-tuning adicional.

La cuantización se realizó con NVIDIA Model Optimizer (commit `7ff81dd795b13a0a70e01db701305aa4b57f40b0`, v0.47.0.dev91) siguiendo una receta NVFP4 W4A4 solo para expertos. La calibración utilizó 1.024 muestras de longitud 512, extraídas a partes iguales de `abisee/cnn_dailymail` y `nvidia/Nemotron-Post-Training-Dataset-v2` (splits stem, chat, math, code). Las escalas de activación se ajustaron mediante calibración máxima. El checkpoint resultante reduce el tamaño de 1.507 GB a 465 GB, manteniendo la capa MTP en BF16 para habilitar EAGLE.

## Capacidades

- Generación de texto y conversación multilingüe (inglés y chino).
- Razonamiento complejo y matemático, con soporte para modo de razonamiento explícito (reasoning parser `glm45`).
- Generación de código y comprensión de lenguajes de programación, orientado a ingeniería de software.
- Tool calling y function calling mediante parser específico (`glm47`).
- Trabajo agéntico de largo alcance: planificación multi-paso, uso de herramientas y ejecución de tareas complejas.
- Contexto largo de hasta 1M tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Decodificación especulativa EAGLE gracias a la capa MTP conservada en BF16, mejorando la latencia de inferencia.

## Casos de uso

- Agentes autónomos de software: el modelo puede planificar y ejecutar tareas de programación complejas, como refactorización de código, generación de tests o resolución de issues, gracias a su capacidad de tool calling y razonamiento multi-paso.
- Asistente de programación en producción: integrable en IDEs o pipelines de CI/CD para generar código, revisar pull requests o autocompletar funciones, con soporte de contexto largo para repositorios completos.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con contexto de hasta 1M tokens, permitiendo mantener el historial completo de interacciones y documentos de referencia.
- Análisis de documentos legales o técnicos extensos: procesa contratos, informes o manuales de gran tamaño, extrayendo información relevante y respondiendo preguntas específicas.
- Razonamiento matemático y científico: resuelve problemas de nivel competitivo (AIME) y puede asistir en investigación, generando demostraciones o explicaciones paso a paso.
- Traducción y generación de contenido bilingüe: aprovecha su soporte nativo de inglés y chino para tareas de localización y creación de contenido en ambos idiomas.

## Benchmarks y rendimiento

Los resultados fueron obtenidos por RadixArk con el checkpoint NVFP4 en 8x NVIDIA B300 (TP8) usando SGLang, con `temperature=1.0`, `top_p=0.95`, `max_tokens=131072` y `Reasoning Effort: Max`.

| Benchmark | Protocolo | Resultado NVFP4 | Comparación con BF16 |
|---|---|---|---|
| GSM8K | 1.319 ejemplos, single-shot, sgl-eval | 97,42% (1.285/1.319) | Coincidencia exacta |
| AIME 2026 | 30 problemas x 16 rollouts, pass@1 | 94,17% (majority@16: 100%) | Dentro del ruido run-to-run |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- El checkpoint cuantizado ocupa 465 GB, por lo que se requiere un clúster multi-GPU. La configuración de referencia usa 8x NVIDIA B300 (Blackwell) con tensor parallelism 8.
- VRAM estimada: ~58 GB por GPU para los pesos (465 GB / 8), más overhead de activaciones y KV cache; se recomiendan GPUs con 80 GB o más.
- Hardware compatible: exclusivamente NVIDIA Blackwell (B200, B300) según la documentación; no se garantiza funcionamiento en arquitecturas anteriores.
- Runtime soportado: SGLang (con `--quantization modelopt_fp4`). No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Decodificación especulativa EAGLE disponible gracias a la capa MTP en BF16, con 5 pasos especulativos y 6 tokens de borrador por defecto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-BF16 (Z.ai) | 753B totales, ~40B activos | 1M | BF16 | Z.AI Model License | Hugging Face |
| GLM-5.3-NVFP4 (RadixArk) | 753B totales, ~381B en checkpoint | 1M | NVFP4 W4A4 | Z.AI Model License | Hugging Face |
| Otros modelos MoE similares (p.ej. DeepSeek-V3, Qwen3-MoE) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base BF16, ya que no se dispone de datos de otros modelos cuantizados equivalentes en la información proporcionada.

## Limitaciones y advertencias

- El modelo base puede generar respuestas inexactas, incompletas, sesgadas o no deseadas; se recomienda evaluar el modelo para cada caso de uso y aplicar salvaguardas adecuadas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento o generación de código.
- Soporte de idiomas limitado a inglés y chino; no se garantiza calidad en otros idiomas.
- Licencia Z.AI Model License (estilo MIT), pero con términos específicos que deben revisarse antes de uso comercial.
- Requiere hardware NVIDIA Blackwell específico; no es compatible con GPUs de generaciones anteriores ni con runtimes alternativos a SGLang.
- La cuantización NVFP4 solo cubre los expertos enrutados; el resto de componentes permanecen en BF16, lo que puede limitar la compresión total en ciertos escenarios.
- No se han publicado evaluaciones de seguridad, sesgos o robustez más allá de los benchmarks de razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RadixArk/GLM-5.3-NVFP4
- Modelo base (Z.ai): https://huggingface.co/zai-org/GLM-5.3-BF16
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Cookbook de SGLang para GLM-5.3: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- Sitio web de RadixArk: https://www.radixark.com/
