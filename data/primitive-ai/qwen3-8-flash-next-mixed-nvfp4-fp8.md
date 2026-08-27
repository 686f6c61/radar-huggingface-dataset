# primitive-ai/Qwen3.8-Flash-Next-mixed-NVFP4-FP8

## Resumen

El modelo `primitive-ai/Qwen3.8-Flash-Next-mixed-NVFP4-FP8` es una cuantización mixta de alta precisión del modelo multimodal Qwen3.8-Flash-Next, desarrollada por el equipo de primitive-ai. El modelo base, creado por Qwen, es un MoE ultra disperso de 125B parámetros (6B activos por token) con una tabla n-gram adicional de 51B, que combina atención lineal Gated DeltaNet (GDN) y atención dispersa Qwen Sparse Attention (QSA) en una arquitectura híbrida experimental de la familia Qwen4. Esta versión cuantizada reduce el peso total de 360 GB (BF16) a 185,8 GB, permitiendo servir el modelo completo en una única GPU Blackwell de 96 GB, algo que el modelo original en FP8 requiere dos GPU de centro de datos.

La relevancia de esta ficha radica en que es una de las primeras implementaciones que logra ejecutar un modelo de 180B con ventana de contexto de 262K tokens en hardware de una sola GPU, manteniendo un rendimiento estadísticamente idéntico al modelo original en tareas de conocimiento y tool calling, y mejorando ligeramente el throughput gracias a la cuantización FP8 en las capas de atención completa. El formato compressed-tensors y la compatibilidad con vLLM stock facilitan su integración en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra disperso híbrido (GDN + QSA), 3 de cada 4 capas con Gated DeltaNet, la cuarta con Qwen Sparse Attention |
| Parametros totales | 125B (modelo base) + 51B tabla n-gram; 119,6B en safetensors cuantizados |
| Parametros activos | 6B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | NVFP4 (grupo 16) en expertos enrutados, FP8 E4M3 por canal en QSA full-attention, BF16 en proyecciones GDN |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-Flash-Next combina dos mecanismos de atención en un MoE ultra disperso. Tres de cada cuatro capas utilizan Gated DeltaNet (GDN), una atención lineal que comprime el historial en un estado recurrente, mientras que la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperación precisa de información de largo alcance. El modelo activa solo 6B de sus 125B parámetros por token, lo que reduce drásticamente el coste computacional por paso. Además, incorpora una tabla n-gram de 51B parámetros que se almacena en RAM del host y se utiliza para decodificación especulativa (MTP), con 31 tensores dedicados a este mecanismo.

Los datos de entrenamiento no están disponibles en la información proporcionada. Se sabe que el modelo es multimodal (image-text-to-text) y que, según la documentación de vLLM, supera a Claude-4.6-Opus en tareas de coding agéntico, visión y razonamiento, pero no se especifican ni el número de tokens de entrenamiento ni la composición del dataset. La cuantización de primitive-ai mantiene las proyecciones GDN en BF16 porque la cuantización FP8 en esas capas provoca cuelgues deterministas de los kernels a concurrencias altas (a partir de ~32), un hallazgo medido y documentado por el autor.

## Capacidades

- Generación de texto multimodal: acepta entradas de imagen y texto, y produce texto (pipeline image-text-to-text).
- Razonamiento avanzado con modo "thinking" forzado, soportado por el parser `qwen3` de vLLM.
- Tool calling y function calling: compatible con el parser `qwen3_coder` y `--enable-auto-tool-choice`, con una precisión medida del 85,0% en el protocolo de 160 ítems de llamada a herramientas.
- Capacidad de abstinencia: el modelo puede decidir no llamar a ninguna herramienta cuando es correcto (56,7% de precisión en el subconjunto de abstinencia).
- Decodificación especulativa MTP (Multi-Token Prediction) preservada en la cuantización, con los 31 tensores byte-idénticos al modelo original.
- Ventana de contexto de 262K tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Soporte de agentes y razonamiento multi-paso gracias a la combinación de tool calling y modo de razonamiento.

## Casos de uso

- Despliegue en una sola GPU de 96 GB: el caso principal. Permite servir un modelo de 180B en hardware asequible (una RTX PRO 6000 Blackwell) en lugar de dos GPU de centro de datos, reduciendo costes de infraestructura. Se sirve con vLLM stock y dos flags específicos (`--distributed-executor-backend mp` y timeout elevado para la carga de la tabla n-gram).
- Agentes de codificación autónomos: con tool calling y razonamiento, el modelo puede integrarse en pipelines de CI/CD para generar, revisar y ejecutar código, aprovechando su ventana de 262K para contextos de repositorios completos.
- Asistente de atención al cliente multimodal: puede procesar capturas de pantalla o imágenes de productos junto con conversaciones de texto, manteniendo el contexto durante interacciones largas gracias a la ventana extendida.
- Análisis de documentos largos con visión: combina la comprensión de imágenes (gráficos, diagramas) con texto extenso, útil para informes financieros, papers científicos o documentación técnica.
- Razonamiento matemático y científico: el modo "thinking" forzado y la arquitectura híbrida permiten resolver problemas complejos de varios pasos, aunque no se han publicado benchmarks específicos de matemáticas.
- Investigación en eficiencia de inferencia: la cuantización mixta NVFP4+FP8+BF16 sirve como referencia para estudiar el impacto de la precisión en arquitecturas híbridas GDN+QSA, especialmente el hallazgo sobre la inestabilidad de FP8 en proyecciones de atención lineal.

## Benchmarks y rendimiento

La model card del autor presenta resultados de un protocolo propio de 1.370 ítems en catorce benchmarks públicos, con temperatura 0.6, top_p 0.95, top_k 20, thinking forzado, presupuesto de 16.384 tokens y puntuación automática sin LLM judge. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Build | Tamano | Overall | Knowledge | Call | Abstain | Runs k/a | Finished | Out/answer | tok/s @ 32 | tok/s @ 1 |
|---|---|---|---|---|---|---|---|---|---|---|
| **Este repo (NVFP4+FP8+BF16)** | 185,8 GB | 90,3 | 92,2 | 85,0 | 56,7 | 1/3 | 99,5% | 646 tok | 491,8 | 76,4 |
| [NVFP4 plain](https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-NVFP4) | 186,4 GB | 90,2 | 92,2 | 84,6 | 56,7 | 2/3 | 99,4% | 664 tok | 483,8 | 74,4 |

Las diferencias de precisión entre ambos builds están dentro del ruido de repetición de la suite (±0,5 en knowledge, ±1,5 en tool-calling), mientras que el throughput es reproducible con una desviación del 0,2% entre semillas. El build mixto es un 2,7% más rápido en single-stream y un 1,7% más rápido a concurrencia 32.

## Requisitos de hardware

- VRAM: 88,8 GiB de VRAM en una GPU Blackwell de 96 GB (RTX PRO 6000 Blackwell). El modelo no cabe en GPU de 80 GB como la A100 o H100.
- RAM del host: aproximadamente 100 GB libres para la tabla n-gram de 51B, que se carga en memoria del sistema.
- GPU recomendada: una única GPU NVIDIA Blackwell de 96 GB. No se soportan GPU consumer (RTX 4090 tiene 24 GB, insuficiente).
- Opciones de despliegue: vLLM con imagen stock `vllm/vllm-openai:qwen38-flash-next`, usando `--distributed-executor-backend mp` y `VLLM_PLE_CPU_OFFLOAD=1`. También es compatible con SGLang según la documentación del modelo base.
- Latencia y throughput: 76,4 tok/s en single-stream y 491,8 tok/s a concurrencia 32, sin caché de prefijo, medidos en una RTX PRO 6000 Blackwell.
- Nota: el modelo base sin cuantizar puede ejecutarse en dispositivos con 78 GB de RAM unificada (por ejemplo, Apple Silicon) según unsloth, pero esta cuantización específica está diseñada para GPU Blackwell.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware necesario | Licencia |
|---|---|---|---|---|---|
| **Este repo (NVFP4+FP8+BF16)** | 125B + 51B n-gram | 262K | NVFP4/FP8/BF16 | 1x 96 GB GPU + 100 GB RAM | qwen-community-1.0 |
| [NVFP4 plain](https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-NVFP4) | 125B + 51B n-gram | 262K | NVFP4 | 1x 96 GB GPU + 100 GB RAM | qwen-community-1.0 |
| Qwen3.8-Flash-Next (BF16) | 125B + 51B n-gram | 262K | BF16 | 2x GPU centro de datos (360 GB) | qwen-community-1.0 |

La comparativa con otros modelos MoE de la misma categoría (por ejemplo, DeepSeek-V3 o Qwen3-235B) no está disponible en la información proporcionada. La diferencia clave entre los dos builds de primitive-ai es marginal: el mixto es ligeramente más rápido y pequeño, mientras que el plain NVFP4 conserva metadatos del formato modelopt que algunas herramientas no basadas en vLLM esperan.

## Limitaciones y advertencias

- La cuantización NVFP4 en los expertos enrutados puede introducir pérdida de precisión en tareas sensibles a los pesos, aunque el autor reporta una diferencia estadísticamente nula frente al modelo original en su protocolo.
- Las proyecciones GDN (linear-attention) se mantienen en BF16 porque FP8 en esas capas provoca cuelgues deterministas de los kernels a concurrencias superiores a ~32. Si se modifica la asignación de cuantización, debe mantenerse `linear_attn` sin cuantizar.
- La tabla n-gram de 51B se carga en RAM del host; se requieren unos 100 GB de memoria libre y un timeout de arranque elevado (1800 segundos). Sin el flag `--distributed-executor-backend mp`, el servidor se cuelga silenciosamente.
- La licencia qwen-community-1.0 es una licencia comunitaria de Qwen; es necesario revisar sus términos específicos para uso comercial, aunque no se detallan restricciones en la información disponible.
- No se han documentado sesgos específicos ni tasas de alucinación para esta cuantización. El modelo base es multimodal y puede presentar sesgos en el procesamiento de imágenes, pero no hay datos al respecto.
- El rendimiento de abstinencia (56,7%) es notablemente inferior al de llamada a herramientas (85,0%), lo que sugiere que el modelo tiende a llamar herramientas cuando no debería; debe tenerse en cuenta en sistemas agénticos donde una llamada incorrecta tenga coste alto.
- El modelo está diseñado para una única GPU Blackwell de 96 GB; no es compatible con hardware de menor VRAM ni con configuraciones multi-GPU estándar sin modificaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-mixed-NVFP4-FP8
- Build NVFP4 plain (hermano): https://huggingface.co/primitive-ai/Qwen3.8-Flash-Next-NVFP4
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Documentación de vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Guía de unsloth para ejecución local: https://unsloth.ai/docs/models/qwen3.8-next
- Documentación de SGLang: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-Flash-Next
- Web de primitive-ai: https://primitive.com
