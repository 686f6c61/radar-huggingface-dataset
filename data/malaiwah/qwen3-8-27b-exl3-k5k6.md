# malaiwah/Qwen3.8-27B-EXL3-K5K6

## Resumen

`malaiwah/Qwen3.8-27B-EXL3-K5K6` es una cuantización experimental de precisión mixta del modelo multimodal `Qwen/Qwen3.8-27B`, desarrollada por el usuario malaiwah. El checkpoint reduce el peso residente a 21,82 GB (frente a los 30,61 GB del FP8 oficial) manteniendo una fidelidad superior: la divergencia KL media respecto al modelo BF16 es de 0,0082, un 38 % menor que la del FP8 oficial, y el acuerdo top-1 alcanza el 96,97 %. El modelo base, Qwen3.8-27B, es un transformer híbrido de 27 000 millones de parámetros con capacidades de visión y lenguaje (image-text-to-text), arquitectura que combina atención lineal, atención tradicional, una torre de visión de 27 bloques y capas GatedDeltaNet, además de una cabeza de predicción multi-token (MTP) para decodificación especulativa.

Esta cuantización emplea el formato EXL3 (exllamav3) con distintos niveles de precisión por capa: las proyecciones MLP se cuantizan a K5/K6, las capas de atención se almacenan en BF16 en disco y se codifican a K6 en tiempo de carga (con opción de K5 o K4 mediante variable de entorno), y la cabeza de salida (`lm_head`) se cuantiza a K6. El checkpoint requiere un runtime personalizado (el fork Gilded Gnosis de vLLM) y no es compatible con los runtimes estándar (vLLM upstream, SGLang, TensorRT-LLM, llama.cpp, transformers o exllamav3 stock). Se trata de un artefacto de investigación, no de un modelo listo para producción, pero demuestra que es posible reducir significativamente el consumo de memoria manteniendo una fidelidad superior a la de cuantizaciones oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido multimodal (Qwen3.8-27B): atención lineal + atención tradicional, torre de visión (27 bloques), GatedDeltaNet, MTP draft head |
| Parametros totales | 27 000 millones (modelo base); el checkpoint cuantizado almacena 15 286 777 072 parámetros en safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 K5/K6 con precisión mixta (BF16, FP16, K4/K5/K6 según capa) |
| Idiomas soportados | no disponibles (el modelo base soporta múltiples idiomas, pero no se especifica en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cuantización EXL3, requiere runtime personalizado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B presenta una arquitectura híbrida que combina mecanismos de atención lineal y atención tradicional. Según la model card, las capas de atención incluyen `linear_attn` (48 capas) y `self_attn` (16 capas), lo que sugiere un diseño que mezcla eficiencia computacional con capacidad de razonamiento. Además, incorpora una torre de visión de 27 bloques para procesamiento de imágenes, capas GatedDeltaNet (96 proyecciones `in_proj_a`/`in_proj_b`) y una cabeza de predicción multi-token (MTP) para decodificación especulativa. No se proporcionan detalles sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO).

La cuantización EXL3 K5/K6 aplica una estrategia de precisión mixta: las proyecciones `gate_proj` y `up_proj` de las MLP se cuantizan a K5, `down_proj` a K6, la cabeza de salida a K6, y la cabeza MTP también se cuantiza (atención K4, MLP K5/K6). Las capas de atención se almacenan en BF16 en disco y se codifican a K6 en tiempo de carga mediante el overlay Trellis del runtime. Las incrustaciones, la torre de visión y las normas permanecen en BF16, y las proyecciones GatedDeltaNet se mantienen en FP16. Esta configuración permite reducir el peso residente a 21,82 GB manteniendo una divergencia KL media de 0,0082 respecto al modelo BF16 de referencia.

## Capacidades

- Procesamiento multimodal: al ser una cuantización del modelo Qwen3.8-27B, hereda las capacidades de visión y lenguaje del modelo base (image-text-to-text).
- Generación de texto y razonamiento: el modelo base está diseñado para tareas de conversación, generación de texto y razonamiento, aunque no se detallan capacidades específicas en la información disponible.
- Decodificación especulativa: la presencia de una cabeza MTP cuantizada sugiere soporte para predicción multi-token, lo que puede acelerar la inferencia.
- Cuantización de alta fidelidad: la cuantización EXL3 K5/K6 logra una divergencia KL menor que la del FP8 oficial, lo que la hace adecuada para entornos donde la precisión es crítica.
- No se documentan capacidades de tool calling, agentes o funciones específicas en la información proporcionada.

## Casos de uso

- Investigación en cuantización: este checkpoint es un artefacto de referencia para estudiar el equilibrio entre tamaño de memoria y fidelidad en modelos multimodales grandes. Permite comparar métricas de divergencia KL y acuerdo top-1 frente a FP8 y NVFP4.
- Despliegue en entornos con restricciones de VRAM: con 21,82 GB de peso residente, el modelo puede ejecutarse en GPUs de 24 GB (por ejemplo, RTX 3090/4090) si se utiliza el runtime Gilded Gnosis de vLLM, aunque requiere configuración manual y no es compatible con runtimes estándar.
- Evaluación de calidad de cuantización: los datos publicados (dataset de fidelidad) permiten a terceros verificar las métricas y re-derivar los comparadores, lo que resulta útil para validar metodologías de evaluación.
- Prototipado experimental: para desarrolladores que trabajan con el fork Gilded Gnosis de vLLM, este checkpoint puede servir como base para probar técnicas de cuantización mixta en modelos de visión-lenguaje.
- Benchmarking de memoria y latencia: el modelo puede utilizarse para medir el impacto de la cuantización EXL3 en el rendimiento de inferencia, aunque no se proporcionan datos de latencia o throughput.
- Aplicaciones de visión-lenguaje con requisitos de precisión: si el runtime personalizado se estabiliza, podría emplearse en tareas como respuesta visual a preguntas (VQA) o captioning donde la fidelidad del modelo es prioritaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card proporciona métricas de fidelidad sobre un corpus retenido (Gutenberg, arXiv, Wikipedia, CPython) con 136 contextos y 278 392 posiciones de vocabulario completo. La tabla siguiente resume los resultados de divergencia KL y acuerdo top-1 frente a otras cuantizaciones:

| Candidato | Peso residente | Media KLD | IC bootstrap 95 % | Mediana | p99.9 | Top-1 |
|---|---:|---:|---:|---:|---:|---:|
| **Este checkpoint (EXL3 K5/K6)** | **21,82 GB** | **0,008157** | [0,00607, 0,01067] | 0,001529 | 0,475 | **96,97 %** |
| Qwen/Qwen3.8-27B-FP8 (oficial) | 30,61 GB | 0,013126 | [0,00981, 0,01709] | 0,002343 | 0,773 | 96,22 % |
| malaiwah/Qwen3.8-27B-K4 (anterior) | 19,21 GB | 0,030736 | [0,02238, 0,04073] | 0,004218 | 1,758 | 94,50 % |
| unsloth/Qwen3.8-27B-NVFP4 | 22,91 GB | 0,094978 | [0,06858, 0,12688] | 0,012911 | 4,509 | 90,53 % |

La comparación pareada sobre los mismos contextos muestra una reducción de -0,004969 en divergencia KL frente al FP8 oficial (136/136 contextos), es decir, un 38 % menor, con 8,8 GB menos de peso. La cabeza K6 añade +0,000127 de divergencia adicional en el escenario as-servido, resultando en 0,008284, que sigue siendo 1,58 veces mejor que el FP8 body-only.

## Requisitos de hardware

- Peso residente: 21,82 GB (20,32 GiB), según el log de asignación del motor.
- VRAM estimada: al menos 24 GB para la carga completa del modelo; se recomienda una GPU con 24 GB o más (RTX 3090, RTX 4090, A5000) para inferencia con cuantización adicional si es necesario.
- GPUs recomendadas: A100 40 GB, H100 80 GB, RTX 4090 24 GB, o cualquier GPU con suficiente VRAM y soporte CUDA.
- Compatibilidad con GPUs de consumo: sí, cabe en RTX 3090/4090 (24 GB) si se usa el runtime Gilded Gnosis y se configura correctamente.
- Opciones de despliegue: únicamente el fork Gilded Gnosis de vLLM (imagen pública) con `--quantization exl3`, una lista `ignore` exacta y, para CUDA graphs, el parche del PR #314. No funciona con vLLM upstream, SGLang, TensorRT-LLM, llama.cpp, transformers ni exllamav3 stock.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La comparativa se centra en cuantizaciones del mismo modelo base (Qwen3.8-27B) por ser la única categoría comparable con datos publicados:

| Modelo | Peso residente | Divergencia KL media | Top-1 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| **Qwen3.8-27B-EXL3-K5K6** | 21,82 GB | 0,0082 | 96,97 % | Apache 2.0 | Runtime específico (Gilded Gnosis vLLM) |
| Qwen3.8-27B-FP8 (oficial) | 30,61 GB | 0,0131 | 96,22 % | Apache 2.0 | Runtime estándar (vLLM, etc.) |
| Qwen3.8-27B-NVFP4 (Unsloth) | 22,91 GB | 0,0950 | 90,53 % | Apache 2.0 | Runtime estándar (vLLM, etc.) |
| Qwen3.8-27B-K4 (anterior) | 19,21 GB | 0,0307 | 94,50 % | Apache 2.0 | Runtime específico (Gilded Gnosis vLLM) |

El checkpoint EXL3 K5/K6 supera al FP8 oficial en fidelidad con un 29 % menos de memoria, pero requiere un runtime experimental. El NVFP4 de Unsloth es más ligero que el FP8 pero tiene una divergencia mucho mayor. No se dispone de comparaciones con otros modelos de la misma familia (p. ej., Qwen3-27B o Qwen2.5-VL) porque no se han proporcionado datos.

## Limitaciones y advertencias

- Requiere un runtime personalizado (fork Gilded Gnosis de vLLM) y no es compatible con los runtimes estándar; esto limita su uso en producción.
- Es un artefacto experimental: la model card lo describe como "experimental, runtime-specific research artifact" y advierte que puede no cargar en entornos no configurados.
- La cuantización mixta introduce una divergencia adicional en la cabeza de salida (K6) que, aunque pequeña (+0,000127), no es despreciable en aplicaciones de alta precisión.
- No se proporcionan datos sobre sesgos, alucinación o limitaciones de contexto del modelo base; estos riesgos se heredan del modelo Qwen3.8-27B.
- El corpus de evaluación de fidelidad está limitado a inglés, alemán y ruso (aunque se solicitaron nueve idiomas de Wikipedia, la estratificación quedó incompleta), por lo que el rendimiento en otros idiomas no está verificado.
- Los resultados de fidelidad no son completamente reproducibles por terceros: la model card indica que las capturas de este checkpoint aún no se han publicado en el dataset de fidelidad, aunque los comparadores sí están disponibles.
- La licencia Apache 2.0 permite uso comercial, pero el runtime asociado puede tener restricciones adicionales no documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malaiwah/Qwen3.8-27B-EXL3-K5K6
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de fidelidad: https://huggingface.co/datasets/malaiwah/qwen38-27b-fidelity-suite-v3
- PR #314 del fork Gilded Gnosis vLLM: https://github.com/local-inference-lab/vllm/pull/314
