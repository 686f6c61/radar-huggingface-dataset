# nota-ai/GLM-5.3-Nota-NVFP4-Global-Pruned-17.75

## Resumen

El modelo `nota-ai/GLM-5.3-Nota-NVFP4-Global-Pruned-17.75` es una versión optimizada del gigante MoE de Z.ai, GLM-5.3 (753B parámetros, ~42B activos), desarrollada por Nota AI. Aplica dos técnicas complementarias: cuantización NVFP4 (4 bits en punto flotante, W4A4) y un podado global de expertos que elimina el 17,75% de los expertos enrutados de forma no uniforme entre capas. El resultado es un modelo que cabe en 2×GPU B300 (Blackwell) en lugar de las 8 necesarias para el BF16 original, manteniendo la ventana de contexto completa de 1.048.576 tokens.

La relevancia de esta release radica en que demuestra que es posible comprimir modelos MoE de cientos de miles de millones de parámetros sin sacrificar demasiada calidad, usando métodos de podado basados en importancia global en lugar de podado uniforme. Está pensado para entornos de producción con hardware Blackwell y para quienes necesitan servir GLM-5.3 con un presupuesto de GPUs reducido.

El repositorio incluye un parche para vLLM 0.28.0 que permite cargar la configuración con número variable de expertos por capa. El modelo se distribuye en formato compressed-tensors (NVFP4) y requiere obligatoriamente GPUs con tensor cores FP4 (Blackwell B200/B300/GB200).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención MLA, DSA indexer, shared experts, MTP; basada en GLM-5.3 (DeepSeek-V2 style) |
| Parametros totales | 624.661.306.032 (tras podado, según safetensors) |
| Parametros activos | no disponible (el modelo base GLM-5.3 tiene ~42B activos por token) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4, group_size=16, compressed-tensors); expertos enrutados en NVFP4, el resto en BF16 |
| Idiomas soportados | en, zh (inglés y chino) |
| Licencia | glm-5.3 (licencia propia de Z.ai) |
| Formato de pesos | safetensors (compressed-tensors para NVFP4) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 es un transformer MoE con 75 capas, cada una con 256 expertos enrutados (19.200 en total), más expertos compartidos, atención MLA (Multi-head Latent Attention), un indexador DSA y un bloque MTP (Multi-Token Prediction). La versión de Nota AI aplica un podado global de expertos: en lugar de eliminar el mismo número de expertos en todas las capas, usa un método propietario de estimación de importancia que compara expertos a través de toda la red y conserva solo los más relevantes por capa. Así, cada capa conserva entre 208 y 256 expertos, sumando 15.792 de los 19.200 originales (17,75% podado). El número exacto por capa se almacena en `config.json` como `num_experts_per_layer`.

Sobre la cuantización, se aplica NVFP4 (punto flotante de 4 bits) solo a los expertos enrutados, mientras que la atención MLA, el indexador DSA, los routers, los expertos compartidos, los MLP densos iniciales, las normas, los embeddings y el bloque MTP permanecen en BF16. Nota AI emplea un stack de cuantización propietario para MoE que incluye calibración consciente de la arquitectura y cuantización que preserva el routing. No se han publicado detalles del entrenamiento del modelo base (datos, tokens, método de alineación), ya que esta release se centra en la optimización posterior.

## Capacidades

- Generación de texto y razonamiento complejo: soporta el parser de razonamiento `glm45`, lo que permite respuestas con cadena de pensamiento explícita.
- Tool calling / function calling: compatible con `--enable-auto-tool-choice` y el parser `glm47`, lo que permite integrar llamadas a herramientas externas.
- Capacidades de agente: el modelo base GLM-5.3 es SOTA en benchmarks de agentes (Terminal Bench 3.0, Agents' Last Exam según Unsloth), y esta versión conserva esa capacidad tras el podado.
- Multilingüe: declarado para inglés y chino (aunque el modelo base podría soportar más idiomas, esta release solo los lista).
- Razonamiento matemático y código: GLM-5.3 destaca en tareas de programación y matemáticas, y el podado global está diseñado para minimizar la pérdida en estas áreas.
- Ventana de contexto larga: 1.048.576 tokens, útil para documentos extensos, análisis de repositorios completos o conversaciones multi-turno muy largas.

## Casos de uso

- Despliegue de GLM-5.3 en infraestructura limitada: con 2×B300 en lugar de 8, esta versión permite servir el modelo en clústeres más pequeños, reduciendo costes de hardware y energía.
- Razonamiento avanzado en producción: el parser de razonamiento `glm45` permite obtener cadenas de pensamiento para tareas de diagnóstico, análisis financiero o investigación, con la ventaja de ocupar menos GPUs.
- Asistentes de código con tool calling: al soportar llamadas a herramientas, puede integrarse en IDEs o pipelines de CI/CD para generar, revisar y ejecutar código, manteniendo un contexto de hasta 1M tokens para proyectos completos.
- Agentes autónomos multi-paso: su capacidad de razonamiento y tool calling lo hace adecuado para agentes que deben planificar y ejecutar acciones (navegación web, APIs, etc.) con una ventana de contexto amplia.
- Procesamiento de documentos extensos: la ventana de 1M tokens permite ingerir libros técnicos, contratos o codebases enteras en una sola pasada, con cuantización que reduce el coste de memoria.
- Investigación en compresión de modelos MoE: sirve como referencia para estudiar el impacto del podado global frente al uniforme, ya que el repositorio documenta la metodología y ofrece el parche de vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta versión específica en la información disponible. La model card no incluye métricas de calidad tras el podado y la cuantización. Se menciona que el modelo base GLM-5.3 es SOTA en Terminal Bench 3.0 y Agents' Last Exam, pero no hay datos de cómo afecta el podado global a estos resultados. No se proporcionan cifras de latencia o throughput.

## Requisitos de hardware

- GPU obligatorias: NVIDIA Blackwell (B200, B300, GB200) por los tensor cores FP4 necesarios para NVFP4. No compatible con Hopper, Ada o Ampere.
- Configuración mínima: 2×B300 (según la model card, con `--tensor-parallel-size 2` y `--enable-expert-parallel`). El BF16 base requiere 8×B300.
- Memoria: no se especifica VRAM exacta, pero el repositorio ocupa 392.4 GB; con cuantización NVFP4 y podado, el modelo cabe en 2×B300 (cada B300 tiene 288 GB HBM3e).
- Despliegue: vLLM 0.28.0 con el parche `patch/deepseek_v2.py` incluido en el repositorio. Se recomienda `--gpu-memory-utilization 0.96` para que la caché KV alcance el contexto completo (1.590.400 tokens de caché).
- No se recomienda añadir `--enable-eplb` (según la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | GPUs necesarias | Licencia |
|---|---|---|---|---|---|
| zai-org/GLM-5.3-BF16 | 753B | 1.048.576 | BF16 | 8×B300 | glm-5.3 |
| nota-ai/GLM-5.3-Nota-NVFP4-Global-Pruned-17.75 | 624.7B | 1.048.576 | NVFP4 + podado 17,75% | 2×B300 | glm-5.3 |
| nota-ai/GLM-5.3-Nota-NVFP4 (sin podar, si existiera) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con otras familias MoE (DeepSeek-V3, Qwen3-MoE) no se puede realizar con los datos disponibles, ya que no se han publicado benchmarks de esta versión. La principal diferencia frente al BF16 original es el requisito de hardware (2 vs 8 GPUs) y el formato de pesos, a costa de una posible pérdida de calidad no cuantificada.

## Limitaciones y advertencias

- Requiere hardware Blackwell: no se puede ejecutar en GPUs anteriores (Hopper, Ada, Ampere) debido a la dependencia de los tensor cores FP4.
- Parche de vLLM específico: el modelo necesita un parche manual sobre vLLM 0.28.0; en otras versiones hay que portar el bloque `_nu_per_layer_num_experts` manualmente, lo que puede ser frágil.
- Podado no uniforme: la arquitectura resultante tiene número variable de expertos por capa, lo que puede complicar el mantenimiento y la compatibilidad con otras herramientas de inferencia.
- Idiomas limitados declarados: solo en y zh; aunque el modelo base podría soportar más, esta release no los garantiza.
- Licencia glm-5.3: es una licencia propia de Z.ai que puede tener restricciones de uso comercial o de redistribución; debe revisarse antes de usar en producción.
- Sin benchmarks publicados: se desconoce el impacto real del podado y la cuantización en tareas específicas; se recomienda evaluar en el caso de uso concreto.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa; la ventana de contexto muy larga no elimina este riesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nota-ai/GLM-5.3-Nota-NVFP4-Global-Pruned-17.75
- Perfil de Nota AI: https://huggingface.co/nota-ai
- Modelo base GLM-5.3 BF16: https://huggingface.co/zai-org/GLM-5.3-BF16
- Sitio de Nota AI: https://www.nota.ai/
- Documentación de Unsloth sobre GLM-5.3 (referencia del modelo base): https://unsloth.ai/docs/models/glm-5.3
