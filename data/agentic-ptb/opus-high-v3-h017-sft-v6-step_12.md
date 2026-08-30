# agentic-ptb/opus-high-v3.h017.sft-v6.step_12

## Resumen

`opus-high-v3.h017.sft-v6.step_12` es un checkpoint intermedio derivado del modelo base Qwen/Qwen3.5-9B-Base, publicado por el usuario agentic-ptb como parte de un experimento de fine-tuning supervisado (SFT) dentro de un run automatizado de Claude Code denominado `opus-high-v3`. El propio autor lo clasifica con el rol `intermediate` y lo conserva únicamente con fines de reproducibilidad y estudio cualitativo. La advertencia en la model card es explícita: el run no encontró ninguna mejora en los pesos entrenados, por lo que no debe inferirse calidad a partir de su publicación.

El modelo tiene 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), lo que lo sitúa en la gama de modelos densos de tamaño medio. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni el método de cuantización. La licencia es Apache 2.0, lo que permite uso comercial y modificación. A pesar de su apariencia de modelo final, se trata de un artefacto de investigación con resultados negativos, no de un modelo listo para producción.

La relevancia de este checkpoint radica en su valor como registro de un experimento fallido dentro de un proceso de entrenamiento agéntico, útil para estudiar por qué ciertas configuraciones de SFT no producen mejoras y para garantizar la reproducibilidad de los pipelines de entrenamiento. No ofrece capacidades adicionales documentadas más allá de las que pueda heredar del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es el resultado de un fine-tuning supervisado (SFT) aplicado sobre el modelo base Qwen/Qwen3.5-9B-Base. La arquitectura subyacente es la del modelo Qwen3.5, un transformer decoder-only con aproximadamente 9,4 mil millones de parámetros, aunque no se proporcionan detalles estructurales adicionales (número de capas, dimensiones de atención, etc.). Al tratarse de un modelo denso, no emplea mezcla de expertos.

El entrenamiento se enmarca en el proyecto AgentPTB, específicamente en el experimento `opus-high-v3`, que utiliza un agente basado en Claude Code para orquestar el proceso. El run se identifica como `h017` (hora 17) y el checkpoint corresponde al paso 12 de la fase `sft-v6`. Según la model card, el run no produjo ninguna mejora en los pesos entrenados; es decir, el fine-tuning no logró superar al modelo base en las métricas evaluadas. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se emplearon técnicas como RLHF o DPO. No hay innovaciones técnicas destacables en este checkpoint, ya que su propósito es servir como registro de un resultado negativo.

## Capacidades

No se dispone de información específica sobre las capacidades de este checkpoint. Al ser un fine-tuning del modelo base Qwen/Qwen3.5-9B-Base, se espera que herede las capacidades generales de dicho modelo (generación de texto, razonamiento, código, matemáticas, etc.), pero no hay evaluaciones publicadas que lo confirmen. El autor advierte explícitamente que no debe inferirse calidad a partir de la publicación.

- Generación de texto: presumiblemente heredada del modelo base, sin verificación.
- Razonamiento y código: no documentado para este checkpoint.
- Tool calling / function calling: no documentado.
- Soporte de agentes: no documentado.
- Multilingüismo: no documentado.
- Otras capacidades especiales: no documentadas.

## Casos de uso

Dado que se trata de un checkpoint intermedio de un experimento fallido, no tiene casos de uso prácticos recomendados. Su finalidad es exclusivamente investigadora y de reproducibilidad. No debe emplearse en aplicaciones de producción ni como base para desarrollos posteriores sin una evaluación adicional. Los únicos usos razonables serían:

- Análisis de resultados negativos: estudiar por qué el fine-tuning no produjo mejoras, comparando sus pesos con los del modelo base.
- Reproducción de experimentos: verificar el pipeline de entrenamiento de AgentPTB y validar la reproducibilidad de los runs.
- Investigación académica: como ejemplo de checkpoint intermedio en un proceso de entrenamiento agéntico.
- Auditoría de procesos: inspeccionar la evolución de los pesos a lo largo de las horas de entrenamiento.
- Desarrollo de metodologías: utilizar este caso como referencia para diseñar experimentos de fine-tuning más robustos.
- Documentación de fallos: incorporar este checkpoint en conjuntos de datos de entrenamiento para mejorar la detección de regresiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta ninguna métrica de rendimiento, y la propia model card indica que el run no encontró mejora en los pesos entrenados, lo que sugiere que su rendimiento es, como máximo, equivalente al del modelo base Qwen/Qwen3.5-9B-Base.

## Requisitos de hardware

Al no existir información específica sobre requisitos de hardware para este checkpoint, se proporcionan estimaciones generales basadas en su tamaño de 9,4 mil millones de parámetros. Estas cifras son orientativas y dependen de la implementación y la precisión utilizada.

- VRAM estimada para inferencia: aproximadamente 19 GB en BF16 (9,4 B × 2 bytes), unos 9,5 GB en cuantización de 8 bits y alrededor de 4,7 GB en 4 bits.
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con al menos 20 GB de VRAM para BF16 sin cuantizar.
- Compatibilidad con GPU de consumo: sí, con cuantización (por ejemplo, GGUF Q4_K_M) cabe en GPUs de 8 GB como la RTX 3070 o la RTX 4060, aunque con limitaciones de velocidad.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, entre otras.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. Dado que el modelo es un checkpoint intermedio sin evaluaciones, no es posible compararlo directamente con alternativas de la misma categoría. Se puede comparar estructuralmente con el modelo base Qwen/Qwen3.5-9B-Base, del cual deriva, y con otros modelos densos de aproximadamente 9 mil millones de parámetros, como Llama 3.1 8B o Mistral 7B, pero no hay métricas objetivas que respalden dicha comparación. La tabla siguiente es meramente estructural:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| opus-high-v3.h017.sft-v6.step_12 | ~9,4 B | No disponible | Apache 2.0 | Checkpoint intermedio, sin mejoras |
| Qwen3.5-9B-Base | ~9,4 B | No disponible | Apache 2.0 (presumible) | Modelo base |
| Llama 3.1 8B | 8,0 B | 128 K | Llama 3.1 Community License | Modelo generalista |

## Limitaciones y advertencias

- El autor declara explícitamente que el run no encontró ninguna mejora en los pesos entrenados; es un resultado negativo.
- No debe inferirse calidad de la publicación; el checkpoint se conserva únicamente para reproducibilidad y estudio.
- No hay evaluaciones independientes ni benchmarks publicados que respalden ninguna capacidad.
- Al ser un fine-tuning no verificado, puede heredar sesgos del dataset de entrenamiento, aunque este no se ha descrito.
- Riesgo de alucinación y comportamiento impredecible, especialmente si se utiliza fuera de un contexto de investigación.
- La licencia Apache 2.0 permite uso comercial, pero no se recomienda su uso en producción sin una validación exhaustiva.
- No se dispone de información sobre la longitud de contexto ni los idiomas soportados, lo que limita su aplicabilidad práctica.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h017.sft-v6.step_12)
- [Dataset del run opus-high-v3](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice del proyecto AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Listado de modelos de agentic-ptb](https://huggingface.co/models?other=agentic-ptb)
