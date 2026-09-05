# mahadev9/Qwen3.8-27B-fp8

## Resumen

`mahadev9/Qwen3.8-27B-fp8` es una cuantización FP8 (W8A8 dinámica) del modelo `Qwen/Qwen3.8-27B`, desarrollada por el usuario mahadev9 con la herramienta `llm-compressor` del proyecto vLLM. El objetivo es reducir los requisitos de VRAM y acelerar la inferencia de un modelo denso de 27B parámetros sin degradar significativamente la calidad en tareas críticas como tool calling y razonamiento agéntico. Para ello, se mantienen en precisión original las capas más sensibles a la cuantización: `lm_head`, `mlp.down_proj`, `self_attn.o_proj` y las capas primera y última del transformer.

El modelo base `Qwen3.8-27B` es un transformer denso nativo visión-lenguaje, con control de pensamiento flexible y diseñado para tareas complejas multi-paso. La versión cuantizada conserva la arquitectura y los 26.895.998.464 parámetros (~26.9B) del original, pero en formato FP8, con un tamaño de repositorio de 65.7 GB. No se especifica la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según modelo base Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 (~26.9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (W8A8 dinámica) con capas sensibles en precisión original |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (compatible con vLLM y transformers) |

## Arquitectura y entrenamiento

La cuantización se realizó con `llm-compressor` sobre el modelo base `Qwen/Qwen3.8-27B`. Se aplicó un esquema W8A8 dinámico, manteniendo en precisión original las capas `lm_head`, `mlp.down_proj`, `self_attn.o_proj` y las capas primera y última del transformer. Esta decisión técnica está justificada por la mayor sensibilidad de estas capas a la cuantización, especialmente en tareas de tool calling y razonamiento agéntico, donde una pérdida de precisión puede traducirse en errores de ejecución de funciones.

El modelo base es un transformer denso nativo visión-lenguaje, con control de pensamiento flexible y soporte para tareas multi-paso. No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en los datos proporcionados.

## Capacidades

- Generación de texto y razonamiento multi-paso, según la descripción del modelo base.
- Comprensión de imágenes y vídeos, al ser un modelo nativo visión-lenguaje.
- Tool calling / function calling: la cuantización está optimizada para recuperar calidad en tareas agentic y de llamada a herramientas.
- Soporte de agentes autónomos, con capacidad para completar tareas complejas con mayor fiabilidad.
- Control de pensamiento flexible (thinking mode), permitiendo alternar entre razonamiento profundo y respuesta directa.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistentes con tool calling en producción: el modelo puede gestionar llamadas a funciones en entornos con vLLM, aprovechando que las capas críticas se mantienen en precisión original para reducir errores de ejecución.
- Análisis de imágenes y vídeos con VRAM limitada: la cuantización FP8 reduce el peso a aproximadamente 27 GB, lo que permite su ejecución en GPUs de 40-80 GB sin necesidad de modelos más pequeños.
- Agentes autónomos multi-paso: el modelo base está diseñado para completar tareas complejas con mayor fiabilidad, y la cuantización preserva la calidad en turnos de tool calling, como muestra el bucket agentic de la evaluación de KL divergence.
- Sistemas de razonamiento con control de pensamiento: el modelo permite activar o desactivar el modo de pensamiento, útil en aplicaciones que requieren análisis profundo antes de responder, como diagnóstico técnico o planificación.
- Prototipado y fine-tuning con transformers: el modelo puede cargarse con `AutoModelForCausalLM` y `AutoTokenizer`, facilitando la experimentación en pipelines de datos o el ajuste fino posterior.
- Evaluación de impacto de cuantización en investigación: las métricas publicadas de KL divergence y top-1 agreement permiten estudiar cómo afecta FP8 a tareas de prosa frente a tareas agénticas, sirviendo como referencia para otros trabajos de compresión de modelos.
- Servicios de chat multimodal: al ser un modelo visión-lenguaje, puede integrarse en aplicaciones que combinan texto e imágenes, como análisis de capturas de pantalla o descripción de contenido visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye una evaluación de fidelidad de la cuantización frente al modelo bf16 original, medida como divergencia KL de la distribución del siguiente token y acuerdo top-1, sobre una secuencia de 2048 tokens:

| Bucket | Tokens | KL media | Acuerdo top-1 |
| --- | --- | --- | --- |
| prosa | 24.130 | 0.0043 | 96.78% |
| agéntico | 85.672 | 0.2864 | 90.55% |
| global | 109.802 | 0.2244 | 91.92% |

Estas métricas indican que la cuantización preserva mejor la calidad en texto prosa que en turnos de tool calling, aunque el acuerdo top-1 global del 91.92% sugiere una degradación moderada en el peor de los casos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 27 GB para los pesos en FP8 (26.9B parámetros × 1 byte), más overhead de activaciones y KV cache. Se recomienda un mínimo de 30-40 GB de VRAM.
- GPU recomendadas: A100 80GB, H100 80GB, o GPUs con al menos 40GB de VRAM. No cabe en una RTX 4090 de 24GB sin técnicas de offloading.
- Opciones de despliegue: vLLM (comando `vllm serve mahadev9/Qwen3.8-27B-fp8`) y transformers (carga con `AutoModelForCausalLM`). No se documentan otras opciones como llama.cpp o Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Tamaño repo | Fidelidad |
| --- | --- | --- | --- | --- |
| Qwen3.8-27B (base) | 26.895.998.464 | bf16 | No disponible | 100% (referencia) |
| mahadev9/Qwen3.8-27B-fp8 | 26.895.998.464 | FP8 | 65.7 GB | KL global 0.2244, acuerdo top-1 91.92% |

No se dispone de datos de otros modelos cuantizados comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización FP8 degrada ligeramente la calidad en tareas agénticas: la KL media en el bucket agentic es de 0.2864 y el acuerdo top-1 de 90.55%, frente a 0.0043 y 96.78% en prosa. Esto puede afectar a aplicaciones intensivas en tool calling.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica una validación limitada por parte de la comunidad.
- La licencia del modelo no está especificada, por lo que es necesario verificar los términos de uso antes de emplearlo en producción o con fines comerciales.
- Los idiomas soportados y la longitud de contexto no están documentados en la información proporcionada.
- No se han publicado benchmarks estándar de capacidades, por lo que el rendimiento real en tareas como MMLU o HumanEval es desconocido.
- Al ser una cuantización de un modelo base, cualquier limitación del modelo original (sesgos, alucinaciones, etc.) se hereda, aunque no se dispone de información específica al respecto.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/mahadev9/Qwen3.8-27B-fp8
- HuggingFace del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
