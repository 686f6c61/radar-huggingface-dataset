# jclyons52/Qwen3.8-27B-UD-Q2_K_XL-MLX-kq-direct

## Resumen

El modelo `jclyons52/Qwen3.8-27B-UD-Q2_K_XL-MLX-kq-direct` es una cuantización experimental de 2 bits del modelo Qwen3.8-27B de Alibaba, convertida a formato nativo MLX para su ejecución en hardware Apple Silicon. Desarrollado por jclyons52, este build replica el mapa de bits del GGUF UD-Q2_K_XL de unsloth (2.72 bpw, 9.5 GB) utilizando códecs IQ no lineales (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS) junto con K-quants, todo ello cuantizado directamente desde el modelo base fp16 mediante la librería `mlx-kquant`.

La relevancia de este modelo radica en su capacidad para ejecutar un LLM de 27B parámetros en equipos con memoria limitada (por ejemplo, Mac con 16 GB unificados), aunque a costa de una degradación notable de la calidad. Es un formato experimental que requiere un parche específico para cargarse con `mlx-lm`, y no es compatible con la instalación estándar. A pesar de su naturaleza experimental, demuestra el avance en técnicas de cuantización extrema para hardware local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención lineal (según mención de linear-attn en la model card) |
| Parametros totales | 27B (según nombre del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256K (según documentación oficial de Qwen3.8; no especificado en la model card) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, Q2_K, Q3_K, Q4_K, Q5_K, Q8_0 (mapa por tensor) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal con atención lineal, diseñado por Alibaba para tareas de codificación, agentes y automatización de oficina. La cuantización aquí presentada se realizó directamente desde el checkpoint fp16 del modelo base, sin pasar por un proceso de fine-tuning adicional. El proceso de cuantización utiliza `mlx-kquant`, que parchea `mlx_lm.load` para cargar tensores cuantizados con códecs IQ no lineales. El mapa de códecs por tensor (498 tensores en total) se basa en la imatrix publicada por unsloth para su GGUF UD-Q2_K_XL, con una distribución que asigna códecs de mayor precisión a proyecciones de atención y capas críticas, y códecs más agresivos a capas profundas de FFN. Los tensores de atención lineal (A_log, dt_bias, conv1d, proyecciones V-head) se mantienen en fp16 del modelo base, sin tomar del GGUF, para evitar discrepancias de revisión.

## Capacidades

- Generación de texto coherente a 2.72 bpw, aunque con calidad degradada respecto al modelo fp16 (PPL 10.73 vs 8.46 en ventana de 512 tokens).
- Razonamiento y codificación: el modelo base Qwen3.8-27B soporta tareas de razonamiento, generación de código y agentes; la cuantización conserva estas capacidades de forma limitada.
- Visión: el modelo base es multimodal (según documentación de Qwen3.8), pero la cuantización no garantiza el rendimiento en tareas de visión.
- Tool calling y function calling: soportado por el modelo base, aunque la cuantización puede afectar la fiabilidad.
- Multilingüe: el modelo base soporta múltiples idiomas, pero esta build solo declara inglés en su model card.
- Modo de razonamiento: el modelo base incluye modos de pensamiento (thinking mode), pero no se especifica su comportamiento en esta cuantización.

## Casos de uso

- Ejecución local en Mac con Metal: gracias a su tamaño de 9.5 GB y formato MLX, puede ejecutarse en Mac con 16 GB de RAM unificada, permitiendo prototipado y pruebas sin GPU dedicada.
- Desarrollo de aplicaciones de chat en entornos con restricciones de memoria: útil para demostraciones o asistentes personales donde el hardware es limitado.
- Investigación en cuantización extrema: sirve como referencia para estudiar el impacto de códecs IQ de 2 bits en la calidad de salida y la viabilidad de despliegue en edge.
- Generación de código asistida en entornos offline: aunque la calidad es inferior, puede usarse para autocompletado básico en editores locales.
- Automatización de tareas de oficina (resúmenes, extracción de datos) en equipos sin GPU: el modelo base está optimizado para estas tareas, y la cuantización permite ejecutarlo en hardware modesto.
- Evaluación de técnicas de cuantización: comparar esta build con otras cuantizaciones (GGUF, affine) para medir trade-offs entre tamaño y rendimiento.

## Benchmarks y rendimiento

La model card proporciona mediciones de perplejidad (PPL) en wikitext-2 (primeros 32k tokens, ventanas de 512 tokens) usando el harness de MLX:

| Build | bpw | PPL (ventana 0) |
|---|---|---:|
| fp16 (MLX) | 16 | 8.46 |
| Affine Q2 map (build anterior) | 4.36 | 9.42 |
| **Esta build (UD-Q2_K_XL)** | **2.72** | **10.73** |

Nota: la PPL completa de 32k para esta build es ~14.8. El GGUF original de unsloth mide 7.18 bajo la herramienta de perplejidad de llama.cpp, pero los números de llama.cpp y MLX no son directamente comparables (offset de ~1.3 PPL medido en fp16). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta cuantización.

## Requisitos de hardware

- Tamaño del repositorio: 9.5 GB, lo que implica aproximadamente 9.5 GB de VRAM/RAM para cargar el modelo en memoria.
- GPU recomendadas: cualquier GPU compatible con Metal (Apple Silicon) o GPU NVIDIA con al menos 12 GB de VRAM (aunque el formato MLX está orientado a Apple).
- Cabe en consumer GPU: sí, en GPUs con 12 GB o más (por ejemplo, RTX 3060 12GB, RTX 4070, etc.), siempre que se use el backend adecuado (aunque MLX es específico de Apple, el modelo podría convertirse a otros formatos).
- Opciones de despliegue: requiere `mlx-kquant` y el parche `patch_mlx_lm_load`; no funciona con stock `mlx-lm`. No se menciona soporte para vLLM, llama.cpp u Ollama en este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tamaño | bpw | PPL (wikitext-2, MLX) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B fp16 | 27B | 16 | 8.46 | Apache-2.0 | MLX |
| Qwen3.8-27B affine Q2 (build anterior) | 27B | 4.36 | 9.42 | Apache-2.0 | MLX |
| **Esta build (UD-Q2_K_XL)** | **27B** | **2.72** | **10.73** | **Apache-2.0** | **MLX** |
| Qwen3.8-27B GGUF UD-Q2_K_XL (unsloth) | 27B | 2.72 | 7.18 (llama.cpp) | Apache-2.0 | GGUF |

La comparativa muestra que esta build MLX tiene una PPL significativamente mayor que el GGUF original de unsloth, debido a un encoder ggml más antiguo en `mlx-kquant`. No se dispone de comparación con otros modelos de la misma categoría (por ejemplo, Llama 3.1 8B cuantizado) en la información proporcionada.

## Limitaciones y advertencias

- Formato experimental: requiere `mlx-kquant` y un parche manual; no carga con `mlx-lm` estándar.
- Calidad degradada: la PPL es ~1.3 puntos mayor que el GGUF equivalente de unsloth, y ~2.3 puntos mayor que el fp16, lo que puede traducirse en incoherencias, alucinaciones y errores en tareas complejas.
- Sesgos y alucinaciones: no se han evaluado específicamente para esta cuantización; se heredan los sesgos del modelo base, que no se detallan en la información disponible.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al ser un modelo derivado de Qwen3.8-27B, se deben respetar los términos de la licencia original (Apache-2.0 también).
- Advertencia para producción: no recomendado para entornos de producción sin una validación exhaustiva; la cuantización de 2 bits puede causar fallos en tareas de razonamiento o generación de código.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jclyons52/Qwen3.8-27B-UD-Q2_K_XL-MLX-kq-direct
- Repositorio ud2mlx (notas de desarrollo): https://github.com/jclyons52/ud2mlx
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de Qwen3.8 (Unsloth): https://unsloth.ai/docs/models/qwen3.8
- Repositorio oficial Qwen3.8: https://github.com/QwenLM/Qwen3.8
