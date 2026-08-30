# hermitdave/qwen36-35b-a3b-stq1_0

## Resumen

`hermitdave/qwen36-35b-a3b-stq1_0` es una cuantización GGUF de precisión mixta del modelo Qwen/Qwen3.6-35B-A3B, un MoE híbrido de 35.505 millones de parámetros con 256 expertos y arquitectura Gated DeltaNet + Gated Attention. El autor, hermitdave, aplica una receta denominada MIX-STQ1_0, inspirada en el enfoque de Tencent para Hy4-preview, que convierte los expertos enrutados de las 29 capas de mayor importancia a formato ternario STQ1_0, mantiene el estado recurrente SSM en Q8_0 y utiliza cuantizaciones intermedias (IQ2_XXS, IQ3_XXS, Q4_K, Q5_K) en el resto de los componentes.

El resultado es un archivo de 11,4 GiB con un promedio de 2,69 bits por peso, pensado para ejecutarse en GPUs NVIDIA con CUDA mediante un build personalizado de llama.cpp. Esta cuantización busca reducir drásticamente el uso de memoria manteniendo la integridad de los componentes críticos para el razonamiento de contexto largo, aunque el autor advierte que no ha podido medir la perplejidad del archivo final. Es una pieza relevante para quien quiera experimentar con cuantización ternaria extrema en modelos MoE modernos, siempre que disponga de hardware CUDA y esté dispuesto a compilar llama.cpp desde una rama específica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido (Gated DeltaNet + Gated Attention) con 256 expertos |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3.000 millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | STQ1_0 (ternario), IQ2_XXS, IQ3_XXS, Q8_0, Q4_K, Q5_K, bf16 (output) |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada; hereda la del modelo base) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino una cuantización post-entrenamiento del modelo base Qwen/Qwen3.6-35B-A3B. El modelo original combina atención con puertas (Gated Attention) y un estado recurrente basado en Gated DeltaNet, lo que le permite manejar secuencias largas con un coste computacional menor que la atención completa. La cuantización aplica una receta de precisión mixta:

- Los expertos enrutados de las 29 capas con mayor importancia (seleccionadas mediante imatrix de bartowski) se convierten a STQ1_0, un formato ternario con 1,31 bits por peso y una esparsidad de 3:4.
- Los expertos de las otras 11 capas se cuantizan a IQ2_XXS.
- Las proyecciones de salida de los expertos (down-projection) usan IQ3_XXS.
- El estado recurrente SSM (`ssm_a`, `ssm_alpha`, `ssm_beta`, `ssm_out`) se mantiene en Q8_0 para no degradar la memoria a largo plazo.
- La cabeza MTP (`nextn.*`) se fija en Q4_K, el router, embeddings y atención en Q8_0/Q4_K/Q5_K, y `output.weight` se deja en bf16.

Esta mezcla busca proteger los componentes más sensibles del modelo mientras se comprime la mayor parte de la masa de los expertos.

## Capacidades

- Generación de texto y razonamiento multi-turno, heredadas del modelo base Qwen3.6-35B-A3B.
- Capacidad de procesamiento de código y tareas de programación, dado que el modelo base está orientado a agente de codificación (compatible con OpenClaw).
- Soporte de contexto largo gracias al estado recurrente Gated DeltaNet, aunque la cuantización puede afectar la fidelidad del recuerdo a largo plazo.
- No se ha confirmado soporte de tool calling ni de visión en esta cuantización; la información disponible no lo especifica.
- No se han publicado benchmarks de rendimiento para este archivo concreto, por lo que las capacidades reales tras la cuantización son inciertas.

## Casos de uso

- Despliegue de un asistente conversacional en una GPU NVIDIA con VRAM limitada (por ejemplo, una RTX 3080 con 10-12 GB) mediante offload parcial de capas a CPU.
- Experimentación académica con cuantización ternaria extrema en modelos MoE híbridos, para estudiar el impacto en la calidad de generación y en la memoria recurrente.
- Prototipado de aplicaciones de código asistido en entornos con restricciones de memoria, usando la compatibilidad con agentes de codificación como OpenClaw.
- Evaluación de la relación entre tamaño de archivo y rendimiento en tareas de razonamiento, comparando con otras cuantizaciones del mismo modelo base.
- Uso en pipelines de inferencia en servidores Linux con CUDA, donde no se requiere soporte para Apple Silicon.
- Reproducción del experimento de cuantización mixta descrito en la model card, ya que el repositorio incluye el archivo de receta por tensor (`tensortypes`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no pudo medir la perplejidad del archivo por falta de hardware CUDA en su máquina de trabajo. Por tanto, no se dispone de datos objetivos sobre MMLU, HumanEval, GSM8K u otras métricas para esta cuantización.

## Requisitos de hardware

- VRAM: el archivo GGUF ocupa 11,4 GiB, pero con 8 GB de VRAM la mayoría de las capas deben ejecutarse en CPU. Se recomienda una GPU con al menos 12 GB para un offload parcial razonable, o 24 GB para una carga completa.
- GPU: cualquier tarjeta NVIDIA compatible con CUDA. El autor menciona que una RTX 3080 con offload parcial funciona si se dispone de RAM del sistema suficiente.
- No compatible con Apple Silicon: el backend Metal de llama.cpp no tiene una ruta `mul_mat_id` para STQ1_0, por lo que el archivo fallará en Macs.
- Necesita un build personalizado de llama.cpp desde la rama `pr-22836` con `GGML_CUDA=ON`.
- Opciones de despliegue: exclusivamente llama.cpp con compilación custom. No es compatible directamente con vLLM, Ollama o TGI sin modificaciones adicionales.
- Latencia y throughput: no disponibles; dependerán de la GPU, la cantidad de capas en VRAM y el número de expertos activados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Requisitos | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35,5B totales, 3B activos | no disponible | bf16 | GPU con ~70 GB | Apache 2.0 (según Qwen) |
| hermitdave/qwen36-35b-a3b-stq1_0 | 35,5B totales, 3B activos | no disponible | STQ1_0 mixto, 2,69 bpw | CUDA, llama.cpp custom | other |
| hermitdave/qwen36-35b-a3b-p2-iq-mix (hermano) | 35,5B totales, 3B activos | no disponible | IQ mixto | Apple Silicon (Metal) | other |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de rendimiento para establecer comparaciones con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Requiere CUDA obligatoriamente; no funciona en Apple Silicon ni en otros backends sin la ruta STQ1_0 implementada.
- No se ha medido la perplejidad ni otros indicadores de calidad; el rendimiento real es desconocido y podría ser significativamente inferior al del modelo original.
- La cuantización ternaria con esparsidad puede provocar pérdida de precisión en tareas que dependen de matices lingüísticos o de razonamiento complejo.
- El estado recurrente SSM se protege en Q8_0, pero el resto de componentes están muy comprimidos, lo que puede afectar la coherencia en conversaciones largas.
- Licencia "other": no se especifican los términos exactos; es necesario revisar la licencia del modelo base Qwen3.6-35B-A3B antes de un uso comercial.
- El autor no ha validado el archivo en producción; se recomienda realizar pruebas exhaustivas antes de integrarlo en un sistema real.
- No hay soporte para tool calling, visión u otras capacidades multimodales confirmadas en esta cuantización, aunque el modelo base podría tenerlas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hermitdave/qwen36-35b-a3b-stq1_0
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Guía de Qwen 3.6 en InsiderLLM: https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Repo hermano para Apple Silicon (p2-iq-mix): https://huggingface.co/hermitdave/qwen36-35b-a3b-p2-iq-mix (referenciado en la model card)
