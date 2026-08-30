# agentic-ptb/opus-high-v3.h015.sft-v5.step_4

## Resumen

`opus-high-v3.h015.sft-v5.step_4` es un checkpoint intermedio generado por el proyecto AgentPTB, un experimento de fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El autor, `agentic-ptb`, lo publica como parte de un run de Claude Code denominado `opus-high-v3`, con el objetivo de estudiar el entrenamiento de modelos con capacidades agénticas. El checkpoint corresponde a la hora de ejecución `h015` y al paso `step_4` del pipeline SFT.

La model card es explícita: se trata de un checkpoint derivado retenido únicamente para reproducibilidad y estudio cualitativo. El run no encontró ninguna mejora en los pesos entrenados respecto al modelo base, y el propio autor advierte de que no debe inferirse calidad a partir de su publicación. Con 9.409.813.744 parámetros (aproximadamente 9,4B), es un modelo de tamaño medio que no ofrece resultados positivos documentados, por lo que su valor es exclusivamente investigador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de Qwen/Qwen3.5-9B-Base (arquitectura subyacente no especificada) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base, no documentado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) sobre `Qwen/Qwen3.5-9B-Base`, un modelo de lenguaje de 9,4B parámetros. No se proporcionan detalles sobre la arquitectura interna del modelo base (número de capas, heads, tipo de atención, etc.) ni sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO. El nombre del checkpoint (`sft-v5`) indica que es la quinta iteración del pipeline SFT, pero no hay información sobre los datos utilizados.

El run `opus-high-v3` forma parte de un experimento más amplio de AgentPTB. Según el dataset `INDEX` del mismo autor, un run anterior (`opus-high-v2`) fue abortado por producir regresiones en los cinco runs SFT, y este checkpoint `h015` tampoco muestra mejora. El autor lo etiqueta explícitamente como `negative-results`, lo que sugiere que el entrenamiento no logró superar al modelo base.

## Capacidades

- No se documentan capacidades específicas más allá de ser un modelo de lenguaje basado en Qwen3.5-9B-Base.
- Al ser un checkpoint intermedio con resultados negativos, no se garantiza ninguna capacidad funcional (generación de texto, razonamiento, código, etc.).
- No hay información sobre tool calling, agentes, multilingüismo o modos especiales.
- El único propósito declarado es la reproducibilidad y el análisis cualitativo de fallos de entrenamiento.

## Casos de uso

- Reproducibilidad de experimentos: permite a otros investigadores replicar el run `opus-high-v3` y verificar los resultados negativos reportados.
- Análisis de fallos de entrenamiento: útil para estudiar por qué el SFT no mejoró los pesos, comparando este checkpoint con el modelo base.
- Investigación en entrenamiento agéntico: sirve como referencia dentro del proyecto AgentPTB para entender qué configuraciones no funcionan.
- Auditoría de pipelines SFT: puede usarse para depurar el flujo de entrenamiento y detectar problemas de convergencia o de datos.
- Estudio de degradación de pesos: permite analizar cómo el fine-tuning puede empeorar el rendimiento respecto al base.
- No recomendado para aplicaciones prácticas: al no mostrar mejora, no es adecuado para tareas de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el run no encontró mejora en los pesos entrenados, lo que sugiere que el rendimiento es igual o inferior al del modelo base Qwen3.5-9B-Base, pero no se aportan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros en FP16, el modelo ocupa aproximadamente 18,8 GB (tamaño del repo), por lo que se necesitarían al menos 20 GB de VRAM para cargarlo sin cuantización.
- Con cuantización de 4 bits (si estuviera disponible), el uso de VRAM podría reducirse a unos 5-6 GB, pero no se ofrecen archivos GGUF ni otras cuantizaciones en el repo.
- GPU recomendadas: una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) sería suficiente para FP16; para cuantización ligera, una GPU de 8-12 GB podría bastar.
- Opciones de despliegue: al ser un checkpoint de investigación, no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El formato safetensors permite su uso con frameworks estándar de HuggingFace (transformers, peft).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `opus-high-v3.h015.sft-v5.step_4` | 9,4B | no disponible | Apache 2.0 | Checkpoint intermedio, resultados negativos |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | Apache 2.0 | Modelo base, sin fine-tuning |
| Otros modelos de 9B (p. ej. Llama 3.1 8B) | 8B | 128K | Llama 3.1 | No comparable directamente por falta de datos |

No se dispone de información suficiente para una comparativa de rendimiento. El único punto de referencia razonable es el modelo base Qwen3.5-9B-Base, del cual este checkpoint es un derivado.

## Limitaciones y advertencias

- Resultados negativos: el run no encontró mejora en los pesos entrenados; el modelo no debe usarse como si fuera un fine-tuning exitoso.
- Checkpoint intermedio: no es un modelo final ni está pensado para despliegue en producción.
- Falta de documentación: no hay información sobre datos de entrenamiento, configuración del SFT ni métricas de evaluación.
- Sesgos y alucinaciones: al ser un LLM, puede presentar sesgos y alucinaciones, pero no hay estudios específicos sobre este checkpoint.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no es apto para ello por su naturaleza experimental.
- Riesgo de confusión: el nombre `opus-high-v3` podría asociarse erróneamente con Claude Opus de Anthropic; no hay relación alguna.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h015.sft-v5.step_4
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice de datasets de AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
