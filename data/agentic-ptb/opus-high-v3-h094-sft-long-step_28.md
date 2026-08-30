# agentic-ptb/opus-high-v3.h094.sft-long.step_28

## Resumen

`agentic-ptb/opus-high-v3.h094.sft-long.step_28` es un checkpoint intermedio derivado de un experimento de fine-tuning (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb`. Según la model card, forma parte de un run de Claude Code denominado **opus-high-v3**, en su hora 94, y se conserva únicamente con fines de reproducibilidad y estudio cualitativo. El propio autor advierte explícitamente de que el run no produjo ninguna mejora de pesos entrenados, por lo que no debe inferirse calidad a partir de su publicación.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), un tamaño de repositorio de 18,8 GB en formato safetensors, y licencia Apache-2.0. No se han publicado métricas de rendimiento, idiomas soportados ni especificaciones de contexto en la información disponible. Se trata, por tanto, de un artefacto de investigación con valor principalmente metodológico, no de un modelo listo para uso productivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-9B-Base, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es un fine-tuning SFT (supervised fine-tuning) del modelo base `Qwen/Qwen3.5-9B-Base`, que a su vez es un transformer denso de 9,4B parámetros. No se proporciona información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas como RLHF o DPO. La model card indica únicamente que el run pertenece a una serie denominada "opus-high-v3" y que el checkpoint corresponde al paso 28 de un proceso de entrenamiento largo (SFT-long). La ausencia de mejoras en los pesos sugiere que el entrenamiento no convergió o que la configuración experimental no fue efectiva, motivo por el cual el autor lo etiqueta como "negative-results".

Dado que no hay detalles técnicos adicionales, no es posible describir innovaciones arquitectónicas ni detalles del proceso de entrenamiento más allá de lo indicado.

## Capacidades

No se han documentado capacidades específicas de este checkpoint. Al ser un derivado de Qwen3.5-9B-Base, podría heredar las capacidades genéricas de ese modelo base (generación de texto, razonamiento, código, etc.), pero no hay evidencia de que este fine-tuning las haya mejorado o modificado. La model card no menciona tool calling, agentes, visión ni ninguna capacidad especial. Por rigor, se indica que las capacidades concretas no están disponibles.

## Casos de uso

Este checkpoint no es adecuado para casos de uso en producción ni para tareas prácticas, por las siguientes razones:

- Es un checkpoint intermedio sin mejoras demostradas sobre el modelo base.
- El autor lo etiqueta explícitamente como "negative-results" y recomienda no inferir calidad de su publicación.
- No hay benchmarks, ni evaluación de capacidades, ni documentación de rendimiento.

Su único caso de uso razonable es el análisis metodológico: estudiar por qué un run de SFT no produce mejoras, comparar tensores entre pasos, o reproducir experimentos de investigación. Para cualquier aplicación real, se recomienda usar el modelo base `Qwen/Qwen3.5-9B-Base` u otro modelo fine-tune validado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica para este checkpoint. El autor no proporciona comparativas con otros modelos.

## Requisitos de hardware

Al tratarse de un modelo de 9,4B parámetros en precisión fp32 (aproximadamente 18,8 GB en safetensors), se puede estimar el hardware necesario para inferencia, aunque no se han publicado cifras oficiales:

- VRAM estimada: al menos 20 GB para fp32 sin cuantización; con cuantización (por ejemplo, 8 bits) se podría reducir a ~10-12 GB, y en 4 bits a ~5-6 GB (si se generan los archivos GGUF o AWQ correspondientes).
- GPU recomendadas: GPUs con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) para fp32; GPUs de 12-16 GB (RTX 4070, A10) para cuantización a 8 bits; GPUs de 8 GB (RTX 3060, RTX 4060) para cuantización a 4 bits.
- Al no existir versiones cuantizadas publicadas, el despliegue requeriría conversión previa con herramientas como llama.cpp o AutoGPTQ.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF). No se han publicado configuraciones de latencia o throughput.

## Comparativa con modelos similares

Al no existir datos de rendimiento de este checkpoint, la comparativa se limita al modelo base y a alternativas de tamaño similar (9-10B). Se indican características conocidas de los modelos base, no del checkpoint.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache-2.0 | Modelo base de referencia |
| agentic-ptb/opus-high-v3 (este checkpoint) | 9,4B | no disponible | Apache-2.0 | Checkpoint intermedio sin mejoras |
| Llama 3.1 8B (referencia) | 8B | 128K | Llama 3.1 Community License | Modelo generalista validado |

No se dispone de más modelos comparables en la misma categoría (9B, fine-tune de Qwen3.5) con datos públicos.

## Limitaciones y advertencias

- **Checkpoint sin mejoras**: la model card indica que el run no produjo ninguna mejora de pesos entrenados; no debe usarse como modelo final.
- **Advertencia de interpretación**: el autor recomienda no inferir calidad a partir de la publicación.
- **Sin documentación de capacidades**: no hay información sobre idiomas, contexto, ni tareas soportadas.
- **Riesgo de alucinación y sesgos**: al ser un derivado de Qwen3.5-9B-Base, podría heredar los sesgos del modelo base, pero no hay evaluación específica.
- **Licencia**: Apache-2.0 permite uso comercial, pero el estado del modelo (intermedio, sin validar) lo hace inadecuado para producción.
- **Sin soporte para tool calling ni agentes**: no hay evidencia de que este fine-tuning haya añadido dichas capacidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h094.sft-long.step_28
- Dataset asociado (run archive): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de datasets de agentic-ptb: https://huggingface.co/datasets/agentic-ptb/INDEX
- Listado de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
- Modelo base Qwen/Qwen3.5-9B-Base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
