# Outlier-Ai/Outlier-10B-V2

## Resumen

Outlier-10B-V2 es un checkpoint de investigación publicado por Outlier-Ai, un artefacto histórico de una línea de modelos anterior que la propia model card marca explícitamente como "superseded" y "archival". Se construye como un adaptador (overlay) sobre Qwen/Qwen2.5-7B-Instruct, con una propuesta técnica basada en mezcla de expertos (MoE) dispersa y cuantización ternaria/1-bit orientada a inferencia local en Apple Silicon. El repositorio pesa 15,2 GB y contiene 7.615.616.512 parámetros reales en safetensors, aunque la nomenclatura comercial del nombre ("10B") no coincide con ese recuento.

El modelo no forma parte del catálogo que Outlier distribuye en su aplicación: la model card indica que no se envía en la app y que las cifras mencionadas provienen de experimentos internos, no de las pruebas de release. Las versiones vigentes de la línea son Nano 4B, Lite 9B, Quick 26B, Core 27B y Vision 35B-A3B, todas en formato MLX de 4 bits. Por tanto, este checkpoint debe tratarse como material de reproducibilidad, no como una opción recomendada para producción.

Su relevancia actual es limitada y fundamentalmente documental: sirve para estudiar técnicas de superposición MoE sobre un transformer denso de 7B y esquemas de cuantización extrema (ternaria/1-bit) para despliegue en dispositivos. La licencia Apache 2.0 se conserva del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 con overlay MoE disperso (según tags: mixture-of-experts, moe, overlay, sparse) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de Qwen2.5-7B-Instruct, no confirmada en la información) |
| Tipos de cuantizacion | ternaria y 1-bit (según tags); no se detallan otros formatos |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de los tags del repositorio. Se sabe que el modelo base es Qwen/Qwen2.5-7B-Instruct y que la relación declarada es "adapter", es decir, Outlier-10B-V2 se construye como una superposición sobre ese transformer denso. Los tags indican mezcla de expertos (MoE) con enrutamiento disperso ("sparse", "overlay", "outlier-moe") y variantes de cuantización ternaria y 1-bit, lo que sugiere un diseño orientado a reducir el coste de memoria y cómputo en inferencia local, particularmente en Apple Silicon y equipos Mac.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste supervisado adicional. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La model card advierte que el artefacto puede contener adaptadores, overlays o variantes de cuantización experimentales que no llegaron al producto comercial, y que cualquier afirmación técnica de revisiones anteriores de la card debe considerarse provisional.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Soporte multilingüe declarado para 15 idiomas: inglés, chino, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, árabe, vietnamita, tailandés, neerlandés y polaco.
- Capacidad de razonamiento y código presumiblemente heredada de Qwen2.5-7B-Instruct, aunque no se documenta de forma explícita en la información disponible.
- Orientación a inferencia local y en dispositivo (tags "local-llm", "on-device", "apple-silicon", "mac"), con cuantización ternaria/1-bit.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre superposición MoE: el checkpoint permite estudiar cómo se comporta un overlay de mezcla de expertos sobre un transformer denso de 7B, comparando activaciones y enrutamiento frente al modelo base sin modificar.
- Experimentos de cuantización extrema: útil para evaluar la degradación de calidad al pasar de pesos completos a representaciones ternarias o de 1 bit en tareas de generación de texto.
- Reproducibilidad de resultados históricos: sirve para replicar experimentos internos de Outlier-Ai citados en la model card, dado que el autor lo conserva explícitamente por motivos de reproducibilidad.
- Docencia y formación técnica: adecuado como ejemplo práctico de adaptadores sobre modelos Qwen2.5 y de despliegue en Apple Silicon con herramientas MLX.
- Pruebas de inferencia en Mac: por sus tags de "apple-silicon" y "mac", puede emplearse para validar flujos de trabajo locales en hardware de Apple antes de migrar a los modelos vigentes de la línea (Nano 4B, Lite 9B, Core 27B).
- Evaluación comparativa de linajes: permite contrastar el rendimiento de una generación anterior de Outlier frente a los checkpoints actuales, siempre que se disponga de un conjunto de evaluación propio.
- No se recomienda su uso en producción, atención al cliente, pipelines de código o cualquier escenario que requiera garantías de calidad, dado el estado archivístico del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las cifras mencionadas en revisiones anteriores provenían de experimentos internos y no de las pruebas de release, por lo que no se ofrecen datos verificables de MMLU, HumanEval, GSM8K ni de otras evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 15,2 GB en safetensors; con cuantización ternaria o 1-bit el peso en memoria podría reducirse sustancialmente, pero no se documentan cifras concretas.
- GPU recomendadas: no disponible. Los tags apuntan a Apple Silicon (Mac) como plataforma objetivo, no a GPUs NVIDIA.
- Compatibilidad con GPU de consumo: no confirmada. El enfoque declarado es local/on-device en Mac, no en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: transformers (librería declarada). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI; los modelos vigentes de Outlier se distribuyen en formato MLX de 4 bits, pero este checkpoint no indica explícitamente ese formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Outlier-10B-V2 | 7.615.616.512 | no disponible | apache-2.0 | Archivado (superseded) | Overlay MoE ternario/1-bit sobre Qwen2.5-7B-Instruct |
| Qwen/Qwen2.5-7B-Instruct | 7B (aprox.) | no disponible en esta ficha | apache-2.0 | Activo | Modelo base denso sobre el que se construye el adaptador |
| Outlier Core 27B | no disponible | no disponible | no disponible | Activo (tier por defecto) | Formato MLX 4-bit, reemplazo recomendado por el autor |
| Outlier Nano 4B | no disponible | no disponible | no disponible | Activo (tier de entrada) | Formato MLX 4-bit, alternativa ligera |

La comparación con alternativas de la misma categoría (modelos de 7B-10B para inferencia local) no puede completarse con datos de rendimiento porque no se han publicado benchmarks de este checkpoint.

## Limitaciones y advertencias

- Modelo marcado como "superseded" y "archival" por el propio autor: no es la descarga recomendada ni forma parte de la aplicación comercial.
- Las afirmaciones técnicas de revisiones anteriores de la model card deben considerarse provisionales; las cifras citadas provienen de experimentos internos, no de pruebas de release.
- Puede contener adaptadores, overlays o variantes de cuantización experimentales que no llegaron al producto.
- Riesgo de alucinación y sesgos: no documentados específicamente, pero heredados del modelo base Qwen2.5-7B-Instruct y potencialmente agravados por la cuantización extrema.
- La cuantización ternaria/1-bit puede degradar la calidad respecto a los pesos completos; no se publican evaluaciones que cuantifiquen esa pérdida.
- Longitud de contexto no confirmada en la información disponible; no debe asumirse la del modelo base sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero el estado archivístico y la falta de garantías desaconsejan su uso en producción.
- El nombre comercial "10B" no coincide con el recuento real de parámetros en safetensors (7.615.616.512).
- Soporte de tool calling, agentes y otras capacidades avanzadas no confirmado.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/Outlier-10B-V2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Outlier Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Outlier Lite 9B: https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit
- Outlier Quick 26B: https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit
- Outlier Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (MLX 4-bit): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Sitio del autor: https://outlier.host/
