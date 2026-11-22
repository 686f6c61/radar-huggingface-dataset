# Outlier-Ai/Outlier-70B-V3.2

## Resumen

Outlier-70B-V3.2 es un checkpoint de investigación publicado por Outlier-Ai, construido como un adaptador (overlay) sobre el modelo base Qwen/Qwen2.5-32B-Instruct. A pesar de la denominación "70B" en el nombre, el modelo base declarado tiene 32B parámetros y la arquitectura se describe con etiquetas de mixture-of-experts (MoE) con cuantización ternaria de 1 bit, lo que sugiere una representación comprimida y dispersa más que un modelo denso de 70B parámetros convencional. El repositorio ocupa 118,9 GB.

El propio autor marca este repositorio como **superseded** (reemplazado) y **archival**: es un artefacto de una línea de producto anterior que se conserva únicamente por reproducibilidad e interés histórico. No forma parte de la aplicación Outlier que se distribuye actualmente y sus cifras proceden de experimentos internos, no de las pruebas de release oficiales. Por tanto, no debe considerarse una recomendación de producción.

La relevancia de esta ficha es, sobre todo, documental: permite entender una aproximación experimental a la compresión extrema (ternaria/1-bit) de un modelo instruct de 32B con vocación de ejecución local en Apple Silicon. Para uso real, el autor redirige a sus tiers vigentes (Nano 4B, Lite 9B, Quick 26B, Core 27B, Vision 35B-A3B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen2.5-32B-Instruct, con overlay MoE y cuantización ternaria (etiquetas: mixture-of-experts, moe, ternary, 1-bit, sparse) |
| Parametros totales | No disponible de forma fiable (el nombre indica "70B", pero el modelo base declarado es de 32B; el autor no publica el recuento efectivo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (no especificada en la información proporcionada) |
| Tipos de cuantizacion | Ternaria / 1-bit (según etiquetas); variantes MLX de 4 bits mencionadas solo para los modelos sustitutos, no para este checkpoint |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, ar, vi, th, nl, pl (15 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos en formato transformers (safetensors presumiblemente, no confirmado); requiere `custom_code` (código personalizado de modelado) |

## Arquitectura y entrenamiento

El modelo se presenta como un adaptador sobre Qwen2.5-32B-Instruct (`base_model_relation: adapter`), con un "overlay" que introduce componentes de mezcla de expertos y una representación de pesos ternaria (1-bit). Las etiquetas del repositorio incluyen `outlier_moe`, `overlay`, `sparse`, `ternary` y `1-bit`, lo que apunta a una técnica de compresión agresiva orientada a ejecución local en dispositivos con memoria limitada, en particular Apple Silicon y Mac. El repositorio requiere `custom_code`, es decir, una implementación de modelado propia que no está integrada en transformers estándar.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado adicionales más allá del modelo base. El autor advierte explícitamente que este artefacto puede contener adaptadores, overlays o variantes de cuantización experimentales que no llegaron al producto final, y que cualquier afirmación técnica de revisiones anteriores de la model card debe considerarse provisional.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-32B-Instruct.
- Razonamiento y conocimiento general propios de un modelo instruct de 32B (sujeto a la degradación que pueda introducir la compresión ternaria).
- Soporte multilingüe declarado para 15 idiomas, incluido el español.
- Orientación a ejecución local y on-device (etiquetas `local-llm`, `on-device`, `apple-silicon`, `mac`).
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades de visión, audio o modo "thinking": no disponibles.
- Estado del repositorio: marcado como superseded y archival; no recomendado para producción.

## Casos de uso

- **Investigación sobre compresión extrema de modelos**: el checkpoint sirve como referencia reproducible para estudiar cómo se comporta un modelo instruct de 32B cuando se representa con pesos ternarios y un overlay MoE, comparando calidad frente al base sin comprimir.
- **Reproducción de experimentos históricos**: útil para replicar resultados de la línea Outlier anterior a la v1.8 y documentar la evolución de la técnica en publicaciones o auditorías internas.
- **Pruebas de ejecución local en Apple Silicon**: las etiquetas `apple-silicon` y `mac` indican que el artefacto se diseñó para entornos de memoria unificada; puede emplearse para medir latencia y consumo en Mac con chip de la serie M.
- **Evaluación de degradación por cuantización ternaria**: permite construir comparativas controladas (perplejidad, exactitud en tareas de razonamiento) frente al Qwen2.5-32B-Instruct original.
- **Prototipado de pipelines con código personalizado**: al requerir `custom_code`, es un banco de pruebas para integrar implementaciones de modelado no estándar en transformers.
- **Docencia y formación técnica**: como ejemplo documentado de arquitectura MoE con cuantización de 1 bit y de las advertencias asociadas (artefacto de investigación, no producto).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las cifras de revisiones anteriores de la model card procedían de experimentos internos y no de las pruebas de release oficiales, por lo que no se recogen aquí.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El repositorio ocupa 118,9 GB, pero al tratarse de un overlay con cuantización ternaria el peso efectivo en memoria podría ser muy inferior; el autor no publica cifras.
- **GPU recomendadas**: no especificadas. Las etiquetas apuntan a Apple Silicon (Mac con memoria unificada) como plataforma objetivo.
- **Compatibilidad con GPU de consumo**: no confirmada. No hay datos sobre ejecución en RTX 4090, 3090 u otras GPU consumer.
- **Opciones de despliegue**: requiere `custom_code` en transformers; no se confirma soporte en vLLM, llama.cpp, Ollama o TGI. Los modelos sustitutos del autor se distribuyen en formato MLX de 4 bits.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Outlier-70B-V3.2 | No disponible (base 32B) | No disponible | Apache 2.0 | Superseded / archival | Overlay MoE ternario 1-bit, requiere custom_code |
| Qwen2.5-32B-Instruct | 32B | No disponible en esta ficha | Apache 2.0 | Activo | Modelo base sin comprimir del que deriva |
| Outlier Core 27B | 27B (según nombre) | No disponible | No disponible | Tier vigente | Sustituto recomendado por el autor, formato MLX 4-bit |
| Outlier Nano 4B | 4B (según nombre) | No disponible | No disponible | Tier vigente | Tier de entrada actual, formato MLX 4-bit |

## Limitaciones y advertencias

- **Modelo obsoleto**: el autor lo marca explícitamente como superseded y archival; no es la descarga recomendada ni se distribuye en la aplicación Outlier.
- **Cifras no verificadas**: los números de revisiones anteriores procedían de experimentos internos, no de pruebas de release; el autor pide tratarlos como provisionales.
- **Riesgo de alucinación**: inherente a los modelos generativos; la compresión ternaria puede agravar la pérdida de fidelidad factual, aunque no hay mediciones publicadas.
- **Ambigüedad de tamaño**: el nombre "70B" no concuerda con el modelo base de 32B declarado; el recuento real de parámetros no está documentado.
- **Dependencia de código personalizado**: requiere `custom_code`, lo que complica el despliegue en stacks estándar y en herramientas de inferencia habituales.
- **Contexto e idiomas**: la longitud de contexto no está especificada; el rendimiento en los 15 idiomas declarados no está verificado, incluido el español.
- **Licencia**: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-32B-Instruct conviene revisar también las condiciones del modelo base.
- **Sesgos**: no documentados por el autor; se heredan los del modelo base y no hay evaluación específica publicada.

## Enlaces

- [Hugging Face: Outlier-Ai/Outlier-70B-V3.2](https://huggingface.co/Outlier-Ai/Outlier-70B-V3.2)
- [Sitio del autor (outlier.host)](https://outlier.host/?utm_source=hf&utm_medium=modelcard&utm_campaign=outlier_70b_v3_2)
- [Outlier Nano 4B (MLX 4-bit)](https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit)
- [Outlier Lite 9B (MLX 4-bit)](https://huggingface.co/Outlier-Ai/Outlier-Lite-9B-MLX-4bit)
- [Outlier Quick 26B (MLX 4-bit)](https://huggingface.co/Outlier-Ai/Outlier-Quick-26B-MLX-4bit)
- [Outlier Core 27B (MLX 4-bit)](https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit)
- [Outlier Vision 35B-A3B (MLX 4-bit)](https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit)
- [DeepSeek-R1-Distill-Qwen-7B (MLX 4-bit)](https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit)
- [Qwen3-Coder-30B-A3B-Instruct (MLX 4-bit)](https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit)
- [Modelo base: Qwen/Qwen2.5-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct)
