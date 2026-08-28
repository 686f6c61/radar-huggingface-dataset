# gguf-org/pig-clip

## Resumen

El modelo `gguf-org/pig-clip` es un codificador de texto CLIP multipropósito, entrenado de forma nativa para el motor de cómputo gk (gguf compute kernels) del ecosistema gguf-org. Su propósito principal es sustituir a codificadores de texto de gran tamaño como T5-XXL, UMT5-XXL o similares en pipelines de generación de imágenes y vídeo mediante modelos de difusión. Según la model card, es entre un 80 y un 90 % más pequeño que esas alternativas, lo que lo convierte en una opción de bajo consumo de VRAM y más eficiente en coste.

El modelo cuenta con 596.049.920 parámetros (aproximadamente 596 millones) y se distribuye en formato GGUF, con cuantización NVFP4 para el peso principal y adaptadores en FP16. Está diseñado para funcionar exclusivamente con el motor `ggk diffuser engine`, que permite reemplazar el argumento `--t5xxl` por `--llm pig_clip-nvfp4.gguf --llm-adapter pig_t5_adapter-f16.gguf`. Aunque se trata de un proyecto joven (creado en agosto de 2026, con pocas descargas), su enfoque de reducir drásticamente el coste de los codificadores de texto en difusión lo hace relevante para despliegues en hardware limitado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (multipropósito, variante no especificada) |
| Parametros totales | 596.049.920 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 (peso principal), FP16 (adaptadores) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors también presente en el repo) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada. Se describe como un CLIP "entrenado nativamente" para el motor gk, lo que sugiere que ha sido optimizado para los kernels de cómputo de ese motor. Su función es puramente la de codificar el prompt de texto para entregarlo al generador de difusión, sin razonamiento profundo ni generación de respuestas largas, como se indica en la rationale de la model card.

No se han publicado datos sobre el conjunto de entrenamiento, número de tokens, ni si se utilizaron técnicas como RLHF o DPO. La innovación principal reside en su tamaño reducido (80-90 % menor que T5-XXL) y en su integración con el motor gk mediante adaptadores específicos para distintos modelos de difusión (T5, UMT5, Qwen3-4B, Qwen3-VL-4B).

## Capacidades

- Codificación de texto para modelos de difusión: su función principal es transformar prompts en representaciones vectoriales que el generador de imágenes o vídeo pueda interpretar con precisión.
- Sustitución de T5-XXL y UMT5-XXL: puede reemplazar a estos codificadores en pipelines existentes, reduciendo el consumo de VRAM.
- Compatibilidad con múltiples modelos de difusión: se han probado adaptadores para PixArt, SD-Lite, Wan2.1 (texto a vídeo), X-Image y MageFlow (edición de imágenes).
- Soporte de visión (limitado): en combinación con el adaptador Qwen3-VL-4B y un proyecto multimodall (mmproj), puede procesar imágenes de referencia para tareas de edición.
- Integración con el motor gk: diseñado específicamente para el ecosistema `ggk diffuser engine`, que gestiona la inferencia de forma eficiente.
- No es un modelo generativo: no genera texto ni mantiene conversaciones; su salida es un embedding.

## Casos de uso

- Generación de imágenes con PixArt en hardware de bajos recursos: sustituyendo el T5-XXL por `pig_clip-nvfp4.gguf` y su adaptador, se puede ejecutar el pipeline completo en GPUs con menos VRAM, manteniendo la calidad del prompt.
- Generación de imágenes con SD-Lite: el modelo se combina con los codificadores CLIP L y G existentes, reduciendo el coste total del sistema. Es adecuado para entornos donde antes se requería una GPU de gama alta.
- Generación de vídeo con Wan2.1: mediante el adaptador UMT5, permite crear clips de vídeo a partir de texto en resoluciones de 480x480, con opciones de offload a CPU para reducir aún más el uso de VRAM.
- Generación de imágenes con X-Image: usando el adaptador Qwen3-4B, se pueden obtener resultados de estilo anime o ilustración con prompts complejos, a un coste computacional mucho menor que con codificadores grandes.
- Edición de imágenes con MageFlow: el adaptador Qwen3-VL-4B, junto con el proyecto de visión, permite editar imágenes de referencia (por ejemplo, añadir gafas de sol a una oveja) con solo 4 pasos de muestreo, ideal para prototipado rápido.
- Despliegue en entornos de producción con restricciones de memoria: al ser un modelo de 596M parámetros, cabe en GPUs de consumo como RTX 3060 o RTX 4060, e incluso en configuraciones con offload a CPU, lo que lo hace viable para servicios de generación de imágenes a pequeña escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de calidad de codificación de texto para difusión. Tampoco se ofrecen comparativas cuantitativas con T5-XXL o UMT5-XXL en términos de fidelidad del prompt o velocidad de inferencia.

## Requisitos de hardware

- VRAM estimada: no se proporcionan cifras oficiales. Dado que el modelo tiene 596M parámetros, en FP16 ocuparía aproximadamente 1,2 GB, y en NVFP4 (4 bits) alrededor de 0,3 GB. Con los adaptadores FP16 (que suelen ser pequeños), el consumo total debería ser inferior a 2 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para la inferencia del codificador. Se ha probado con opciones de offload a CPU, lo que permite ejecutarlo incluso en iGPUs o GPUs muy antiguas.
- Compatibilidad con GPUs de consumo: sí, cabe en RTX 3060, RTX 4060, RTX 2070, etc. También en tarjetas de gama baja como GTX 1650 si se usa offload.
- Opciones de despliegue: el modelo está diseñado para el motor `ggk diffuser engine`, que forma parte del ecosistema gguf-org. No se menciona compatibilidad con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. Al ser un codificador pequeño, se espera una latencia muy inferior a la de T5-XXL, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso principal |
|---|---|---|---|---|---|
| pig-clip (este) | 596M | No disponible | MIT | GGUF | Codificador de texto para difusión |
| T5-XXL | ~4.7B | 512 tokens (típico) | Apache 2.0 | Safetensors, GGUF | Codificador de texto para difusión (Flux, PixArt, etc.) |
| UMT5-XXL | ~4.7B | No disponible | Apache 2.0 | Safetensors, GGUF | Codificador de texto para vídeo (Wan2.1) |

La comparativa se limita al tamaño de parámetros, ya que no hay datos de rendimiento. pig-clip es aproximadamente 8 veces más pequeño que T5-XXL y UMT5-XXL, lo que implica una reducción significativa de VRAM y coste. Sin embargo, no se ha demostrado que la calidad de codificación sea equivalente; la model card solo afirma que es "mejor eficiente y coste efectivo (esperemos)".

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado para codificación, los sesgos podrían manifestarse en la interpretación de prompts (por ejemplo, en la representación de ciertos conceptos culturales o de género).
- Riesgo de alucinación: bajo, ya que no genera texto libre; su salida es un embedding. Sin embargo, una codificación imprecisa podría provocar que el generador de difusión produzca imágenes no deseadas.
- Limitaciones de contexto: no se especifica la longitud máxima de prompt que puede procesar. Se recomienda probar con prompts largos antes de usarlo en producción.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo depende del motor gk, que puede tener sus propios términos (no detallados).
- Caveat importante: el proyecto es experimental y tiene muy poca adopción (414 descargas, 1 like). No hay garantías de mantenimiento o soporte a largo plazo. Además, la cuantización NVFP4 es propietaria de NVIDIA y puede requerir hardware específico para aprovechar al máximo su rendimiento.
- Para producción, se recomienda validar la calidad de los resultados en el modelo de difusión concreto, ya que la sustitución de T5-XXL puede afectar a la fidelidad del prompt.

## Enlaces

- [HuggingFace - gguf-org/pig-clip](https://huggingface.co/gguf-org/pig-clip)
- [GitHub - gguf-org/pig (herramienta para GGUF)](https://github.com/gguf-org/pig)
- [GitHub - gguf-io/gk (motor de kernels gk)](https://github.com/gguf-io/gk)
- [HuggingFace - gguf-org/x-image-gguf (ejemplo de uso)](https://huggingface.co/gguf-org/x-image-gguf)
- [HuggingFace - gguf-org/pixart-gguf (ejemplo de uso)](https://huggingface.co/gguf-org/pixart-gguf/tree/main)
