# hrm-labs/Nemotron-3.5-Lightning-NVFP4

## Resumen

Nemotron-3.5-Lightning-30B-A3B-NVFP4 es la versión cuantizada en NVFP4 (FP4 de NVIDIA) del modelo Nemotron-3.5-Lightning-30B-A3B desarrollado por NVIDIA. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 30 000 millones de parámetros totales y solo 3000 millones activos por token, lo que lo sitúa en la categoría de modelos "flash" o de alta eficiencia para despliegue en producción. La arquitectura es híbrida: combina capas Mamba-2, capas MoE y capas de atención selectivas, una elección que busca reducir el coste computacional en contextos largos frente a un transformer denso convencional.

La relevancia de esta variante NVFP4 radica en que permite ejecutar un modelo de 30B en una sola GPU de gama alta o incluso en hardware de consumo como la RTX 5090, gracias a la cuantización de 4 bits en formato NVFP4 con soporte nativo en las tensor cores de las GPU Blackwell. El modelo declara un contexto validado de hasta 1 millón de tokens y está orientado a agentes autónomos de larga duración, despliegues de sub-agentes y inferencia local eficiente.

El modelo se publica bajo licencia OpenMDW-1.1, con fecha de lanzamiento indicada como 11 de agosto de 2026 y datos de preentrenamiento con corte en septiembre de 2025. Soporta seis idiomas (inglés, español, francés, alemán, italiano y japonés) y se distribuye en formato safetensors para su uso con transformers y vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Mamba-2 + MoE + capas de atención intercaladas |
| Parámetros totales | 30B (32 913 266 252 según safetensors) |
| Parámetros activos | 3B |
| Longitud de contexto | Hasta 1M tokens (validado por defecto) |
| Tipos de cuantización | NVFP4 (8-bit según tags; almacenamiento NVFP4 con ruta de cómputo W4A16 en hardware no Blackwell) |
| Idiomas soportados | Inglés, español, francés, alemán, italiano, japonés |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (transformers, modelopt) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que intercala capas Mamba-2 (modelo de espacio de estados) con capas de Mixture-of-Experts y un número selecto de capas de atención. Esta combinación busca mantener la calidad de un transformer con atención completa en las capas críticas, mientras reduce el coste de cómputo y memoria en el resto mediante el state space model y el enrutamiento MoE. Con 30B parámetros totales y solo 3B activos por token, el coste de inferencia se aproxima al de un modelo denso de 3B en términos de FLOPs por token, aunque requiere mantener en memoria los pesos de los 30B (o su versión cuantizada).

El preentrenamiento se realizó sobre más de 20 billones de tokens, con un corpus que incluye una pequeña proporción de datos de question-answering y de alineación para mejorar la precisión. El corpus de post-entrenamiento combina datos curados de alta calidad con datos generados sintéticamente. La fecha de corte de los datos de preentrenamiento es septiembre de 2025, y la del post-entrenamiento, mayo de 2026. El modelo se publica junto con métodos de decodificación especulativa propios: DSpark (orientado a baja concurrencia y flujos DGX Spark), MTP (Multi-Token Prediction) y DFlash.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso.
- Razonamiento matemático y científico (evaluado en GPQA Diamond, HLE y SciCode).
- Generación y comprensión de código, con soporte de tareas de ingeniería de software.
- Tool calling y function calling, con parser dedicado (`qwen3_coder`) y modo de elección automática de herramienta en vLLM.
- Soporte de agentes autónomos y razonamiento multi-paso de larga duración.
- Capacidad multilingüe en inglés, español, francés, alemán, italiano y japonés.
- Modo de razonamiento con parser específico (`nemotron_v3`) para separar el pensamiento de la respuesta final.
- Contexto largo de hasta 1M tokens validado para tareas de recuperación y agentes con historial extenso.
- Decodificación especulativa integrada (DSpark, MTP, DFlash) para acelerar la generación.

## Casos de uso

- Agentes autónomos de larga duración: el contexto de 1M tokens y el bajo coste por token (3B activos) permiten mantener historiales extensos de acciones, observaciones y herramientas sin disparar el coste de inferencia.
- Despliegue de sub-agentes en pipelines multi-agente: al requerir poca VRAM en NVFP4, se pueden instanciar varios trabajadores especializados en una sola máquina o nodo.
- Inferencia local en estación de trabajo: con una RTX 5090 o una DGX Spark (GB10) se puede servir el modelo cuantizado para asistentes de código y chat privado sin depender de la nube.
- Automatización de ingeniería de software: el soporte de tool calling y su rendimiento en benchmarks de código lo hacen apto para pipelines de CI/CD que generan parches, revisan PRs o resuelven issues.
- Atención al cliente multilingüe: cubre seis idiomas y mantiene conversaciones multi-turno con contexto largo, útil para sistemas de soporte con historial de cliente extenso.
- Análisis de documentos largos: con 1M tokens de contexto puede procesar contratos, informes o bases de código completas en una sola pasada.
- Razonamiento científico asistido: sus resultados en GPQA Diamond y SciCode lo sitúan como candidato para asistentes de investigación que requieren razonamiento técnico.

## Benchmarks y rendimiento

Resultados publicados por el autor comparando la versión BF16 con la NVFP4:

| Tarea | Benchmark | BF16 | NVFP4 |
|---|---|---|---|
| Conocimiento general | MMLU Pro | 81,94 | 81,62 |
| Conocimiento general | AA-Omniscience | 17,50 | 16,63 |
| Razonamiento | GPQA Diamond (sin herramientas) | 75,44 | 75,57 |
| Razonamiento | HLE (solo texto, sin herramientas) | 11,72 | 10,47 |
| Razonamiento | SciCode | 32,60 | 31,38 |
| Código y agentes | SWE-bench Verified | no disponible (truncado en la información) | no disponible (truncado en la información) |

La cuantización NVFP4 produce una degradación mínima en la mayoría de métricas (menos de 1 punto en MMLU Pro, GPQA y SciCode), con una caída algo mayor en HLE (1,25 puntos) y AA-Omniscience (0,87 puntos). No se dispone de datos completos de SWE-bench en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 21,6 GB en NVFP4, por lo que la inferencia requiere aproximadamente 22-24 GB de VRAM para pesos, más la caché KV (que puede reducirse con `--kv-cache-dtype fp8`).
- GPU recomendadas: NVIDIA Blackwell (GB200, DGX Spark GB10, GeForce RTX 5090) con ruta nativa FP4; NVIDIA Hopper (H100, H200) y Ampere (A100) mediante ruta W4A16 con backend `humming` o `marlin`.
- Cabe en GPU de consumo: sí, en RTX 5090 (Blackwell) y previsiblemente en GPUs con 24 GB o más; en DGX Spark (GB10) está validado con receta específica.
- Opciones de despliegue: vLLM (versión recomendada `vllm/vllm-openai:v0.27.1`), con backends `marlin` (DGX Spark) y `humming` (Hopper/Ampere), `flashinfer` para Mamba, y soporte de transformers. No se mencionan recetas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; el modelo incluye decodificación especulativa DSpark, MTP y DFlash para mejorar el throughput en escenarios de baja concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Cuantización |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-NVFP4 | 30B | 3B | 1M | OpenMDW-1.1 | NVFP4 |
| Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B | 3B | 1M | OpenMDW-1.1 | BF16 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría (MoE de ~30B con ~3B activos) para establecer una comparativa con cifras verificables.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje; los resultados en HLE (10,47 en NVFP4) indican un rendimiento limitado en razonamiento de alta dificultad.
- La cuantización NVFP4 introduce una degradación medible frente a BF16, especialmente en tareas de conocimiento enciclopédico (AA-Omniscience baja de 17,50 a 16,63).
- El contexto de 1M tokens está validado por el autor, pero el rendimiento efectivo en recuperación a esa longitud no se detalla en la información disponible.
- El soporte idiomático se limita a seis idiomas; no se garantiza calidad fuera de ellos.
- La licencia OpenMDW-1.1 permite uso comercial según el autor ("ready for commercial use"), pero conviene revisar los términos completos antes de desplegar en producción.
- En hardware no Blackwell (Hopper, Ampere) no hay tensor cores FP4, por lo que se ejecuta mediante W4A16 y el rendimiento será inferior al de Blackwell.
- La fecha de lanzamiento indicada (agosto de 2026) y los cortes de datos son posteriores a la fecha actual de muchos entornos; verificar la vigencia de la información.
- El repositorio de Hugging Face indicado (hrm-labs) es un espejo con 0 descargas; el repositorio oficial es `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4`.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/hrm-labs/Nemotron-3.5-Lightning-NVFP4
- Hugging Face (oficial NVIDIA): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- NVIDIA NIM / Build: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
- Model card en NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
