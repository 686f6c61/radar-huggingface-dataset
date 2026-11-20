# RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 es la versión cuantizada en NVFP4 del modelo Nemotron-3.5-Lightning-30B-A3B desarrollado por NVIDIA, publicada y empaquetada por Red Hat AI (RedHatAI) para su uso en entornos RHOAI y RHAIIS. Se trata de un LLM de arquitectura híbrida Mixture-of-Experts que intercala capas Mamba-2, capas MoE y capas de atención selectivas, con 30B parámetros totales y solo 3B activos por token, lo que permite un despliegue eficiente en una única GPU.

El modelo está diseñado para cargas de trabajo de agentes autónomos de larga duración, despliegues de sub-agentes como "caballo de batalla" y inferencia local en hardware personal. Su ventana de contexto validada alcanza 1M de tokens, lo que lo sitúa en la categoría de modelos de contexto ultralargo. Soporta seis idiomas (inglés, español, francés, alemán, italiano y japonés) además de lenguajes de programación.

La relevancia actual del modelo radica en su combinación de eficiencia (3B activos), contexto masivo (1M tokens), cuantización NVFP4 de 4 bits y soporte de decodificación especulativa (DSpark, MTP, DFlash), que lo hacen apto para despliegues en DGX Spark (GB10), H100, H200 y GB200 con un solo dispositivo. La licencia OpenMDW-1.1 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Mamba-2 + MoE + capas de atención intercaladas (nemotron_h) |
| Parametros totales | 32.913.266.252 (~30B, según model card) |
| Parametros activos | 3B |
| Longitud de contexto | Hasta 1M tokens (validado por defecto) |
| Tipos de cuantizacion | NVFP4 (4 bits, formato de pesos de esta versión); existe versión BF16 del modelo base |
| Idiomas soportados | en, es, fr, de, it, ja (más lenguajes de programación) |
| Licencia | OpenMDW-1.1 (uso comercial permitido) |
| Formato de pesos | safetensors (transformers), cuantización NVFP4 vía modelopt |
| Tamano del repo | 21.6 GB |
| Fecha de lanzamiento | 11 de agosto de 2026 |
| Fecha de corte de datos | Pre-entrenamiento: septiembre 2025; post-entrenamiento: mayo 2026 |
| Muestreo recomendado | Temperature 1.0, Top_P 0.95 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que combina capas Mamba-2 (modelo de espacio de estados) con capas Mixture-of-Experts y capas de atención selectivas. Esta combinación busca reducir el coste computacional y de memoria del contexto largo respecto a un transformer denso puro, manteniendo capacidad de razonamiento y recuperación de información. Con 30B parámetros totales y 3B activos por token, el coste de inferencia por token se aproxima al de un modelo de 3B, mientras que la capacidad representacional se acerca a la de un modelo de 30B.

Los datos de entrenamiento cubren pre-entrenamiento con corte en septiembre de 2025 y post-entrenamiento con corte en mayo de 2026. La model card no detalla el número exacto de tokens de entrenamiento ni la composición del dataset, ni especifica explícitamente si se aplicaron técnicas de RLHF o DPO (no disponible). El modelo incorpora decodificación especulativa mediante tres mecanismos: DSpark (orientado a flujos de baja concurrencia en centros de datos y DGX Spark), MTP (Multi-Token Prediction) y DFlash. La versión NVFP4 se genera con modelopt de NVIDIA y requiere en vLLM los argumentos `--mamba-backend flashinfer` y `--mamba-cache-mode align`.

## Capacidades

- Generación de texto conversacional y de propósito general en seis idiomas.
- Razonamiento multi-paso y modo de razonamiento (reasoning parser `nemotron_v3` en vLLM).
- Generación de código y soporte de lenguajes de programación.
- Tool calling / function calling (tool-call parser `qwen3_coder`, `--enable-auto-tool-choice`).
- Soporte para agentes autónomos de larga duración y despliegues de sub-agentes.
- Contexto ultralargo de hasta 1M tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Decodificación especulativa integrada (DSpark, MTP, DFlash) para acelerar la generación.
- Capacidades multilingües limitadas a los seis idiomas declarados; no se declara soporte de visión ni audio (no disponible).

## Casos de uso

- Agentes autónomos de larga duración: el modelo puede mantener estado y razonamiento a lo largo de tareas prolongadas gracias a su ventana de 1M tokens y a su bajo coste por token (3B activos), lo que reduce el gasto de inferencia en bucles agénticos.
- Despliegue de sub-agentes ("workhorse"): al requerir solo una GPU (DGX Spark GB10 o H100) y 21.6 GB de pesos, es viable instanciar varios sub-agentes especializados en paralelo dentro de un mismo clúster.
- Procesamiento de documentos extensos: análisis, resumen y extracción de información sobre contratos, informes o bases de código de cientos de miles de tokens sin truncamiento.
- Asistencia de código en producción: con tool calling y parser `qwen3_coder`, puede integrarse en pipelines de CI/CD para revisión automática, generación de parches y llamadas a herramientas externas.
- Atención al cliente automatizada: conversaciones multi-turno con contexto largo y soporte multilingüe (es, fr, de, it, ja) para mercados europeos y japonés.
- Inferencia local en hardware personal: la cuantización NVFP4 y el soporte de RTX 5090 (pendiente de confirmar receta) permiten ejecutar el modelo en estaciones de trabajo con GPU consumer de gama alta.
- Investigación en arquitecturas híbridas SSM/MoE: sirve como base para estudiar el comportamiento de Mamba-2 combinado con MoE y atención en tareas de contexto largo.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones de razonamiento que compara Nemotron-3.5-Lightning-30B-A3B-BF16 con otras variantes, pero el contenido proporcionado está truncado y no incluye los valores numéricos. No se han publicado resultados de benchmarks completos en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos NVFP4 ocupan aproximadamente 21.6 GB; con caché KV en FP8 y margen de trabajo, se recomienda al menos 24-32 GB de VRAM para contexto moderado, y más para contexto de 1M tokens.
- GPU recomendadas: NVIDIA Blackwell (DGX Spark / GB10, GB200, GeForce RTX 5090) y NVIDIA Hopper (H100, H200). Soporte en Ampere (A100) vía ruta W4A16.
- GPU consumer: cabe en una RTX 5090 (Blackwell) según la matriz de hardware, aunque la receta específica para RTX 5090 no está publicada ("confirm").
- Backends MoE: `marlin` en DGX Spark (GB10), `humming` (máximo throughput) o por defecto en Hopper y Ampere.
- Despliegue: vLLM (versión validada 0.24.0 y 0.27.1 en la receta), con `--mamba-backend flashinfer`, `--mamba-cache-mode align`, `--kv-cache-dtype fp8`, `--enable-prefix-caching`. Validado en RHOAI 3.5.0 y RHAIIS 3.5.0. No se menciona soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada; la decodificación especulativa DSpark está orientada a mejorar el rendimiento en baja concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B (NVFP4) | 30B / 3B | 1M | OpenMDW-1.1 | Híbrido Mamba-2 + MoE + atención; esta ficha |
| Nemotron-3.5-Lightning-30B-A3B (BF16) | 30B / 3B | 1M | OpenMDW-1.1 | Misma arquitectura, precisión completa; referencia de benchmarks en la model card |
| Alternativas de 30B MoE | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos: no se documentan en la información disponible; como todo LLM entrenado con datos web, es probable que reproduzca sesgos presentes en el corpus.
- Alucinación: riesgo inherente a los modelos generativos; no se han publicado tasas de alucinación específicas.
- Cobertura idiomática limitada a seis idiomas; el rendimiento en idiomas no declarados puede degradarse.
- La cuantización NVFP4 introduce pérdida de precisión respecto a la versión BF16; conviene validar la calidad en la tarea concreta antes de producción.
- En GPUs Hopper y Ampere no existen tensor cores FP4 nativos: el modelo se ejecuta por ruta W4A16 (Marlin/Humming), con posible impacto en throughput.
- La receta para RTX 5090 no está publicada ("no recipe published"), por lo que el despliegue en esa GPU requiere validación propia.
- El contexto de 1M tokens implica un coste de memoria de caché KV elevado; se recomienda FP8 y prefix caching.
- Licencia OpenMDW-1.1: permite uso comercial, pero deben revisarse los términos completos del acuerdo antes de su integración en productos.
- Fechas de corte de datos: septiembre 2025 (pre-entrenamiento) y mayo 2026 (post-entrenamiento); el conocimiento posterior no está cubierto.

## Enlaces

- Hugging Face (esta versión): https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Checkpoint DSpark: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4-DSpark
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Demo en NVIDIA Build: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
