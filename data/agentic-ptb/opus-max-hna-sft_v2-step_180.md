# agentic-ptb/opus-max.hNA.sft_v2.step_180

## Resumen

El modelo `agentic-ptb/opus-max.hNA.sft_v2.step_180` es un checkpoint intermedio de un proceso de fine-tuning supervisado (SFT) sobre la base `Qwen/Qwen3.5-9B-Base`. Ha sido generado por el proyecto AgentPTB, concretamente en la celda `opus-max`, donde el driver es Claude Code con el modelo `claude-opus-5` y un nivel de razonamiento `max`. El checkpoint corresponde al paso 180 de la segunda versión del entrenamiento SFT (`sft_v2`), y su rol está marcado como `intermediate`, lo que sugiere que no es un modelo final sino un punto de control dentro de un barrido de hiperparámetros.

Con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), el modelo hereda la arquitectura de Qwen3.5-9B-Base, aunque no se proporcionan detalles adicionales sobre la misma. El repositorio pesa 18,8 GB, coherente con pesos en precisión FP16. No se dispone de información sobre licencia, idiomas soportados, longitud de contexto ni capacidades específicas. Es un modelo con cero descargas y cero likes, claramente experimental y sin documentación pública más allá de la model card mínima.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3.5-9B-Base (detalles no disponibles) |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, sin GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3.5-9B-Base`, pero no se especifican detalles como el tipo de transformer, número de capas, atención, etc. Al ser un fine-tuning, se parte de los pesos preentrenados de Qwen3.5-9B-Base y se aplica un entrenamiento supervisado (SFT) en una segunda versión (`sft_v2`). El checkpoint corresponde al paso 180 de ese entrenamiento.

El proceso de generación del checkpoint está ligado al proyecto AgentPTB, un barrido de experimentos donde el driver es Claude Code con el modelo `claude-opus-5` y un esfuerzo de razonamiento máximo (`max`). Esto indica que el propio checkpoint fue producido por un agente autónomo, no por un pipeline de entrenamiento convencional documentado. No se proporcionan datos sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas específicas.

## Capacidades

No se ha publicado información sobre las capacidades concretas de este checkpoint. Al estar basado en Qwen3.5-9B-Base, podría heredar capacidades de generación de texto, razonamiento, código o multilingüismo, pero no hay confirmación ni documentación al respecto. No se indica soporte para tool calling, agentes, visión, audio ni modos de pensamiento especiales. La ausencia de datos impide realizar afirmaciones verificables.

## Casos de uso

No se dispone de información suficiente para recomendar casos de uso específicos. Al ser un checkpoint intermedio de un experimento, su utilidad práctica es incierta. Cualquier aplicación en producción requeriría primero una evaluación exhaustiva de su calidad y comportamiento, así como la verificación de la licencia, que actualmente no está especificada. No se documentan escenarios de uso por parte del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. Tampoco se ofrecen comparaciones con otros modelos.

## Requisitos de hardware

No hay datos oficiales sobre requisitos de hardware. Sin embargo, a partir del tamaño del repositorio (18,8 GB) y del número de parámetros (9,4 B), se puede estimar:

- Inferencia en FP16: aproximadamente 18,8 GB de VRAM, lo que requiere una GPU con al menos 24 GB (por ejemplo, RTX 3090, RTX 4090, A10G, A100 40 GB).
- Inferencia en 8 bits: aproximadamente 9,4 GB de VRAM, viable en GPUs de 12 GB (RTX 3060, RTX 4070, etc.).
- Inferencia en 4 bits: aproximadamente 4,7 GB de VRAM, posible en GPUs de 6-8 GB (RTX 3060, RTX 4060, etc.), aunque no se confirma la disponibilidad de cuantizaciones.

Opciones de despliegue habituales para modelos de este tamaño incluyen vLLM, llama.cpp, Ollama o TGI, pero no se ha verificado la compatibilidad con este checkpoint concreto. No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. La única referencia clara es el modelo base `Qwen/Qwen3.5-9B-Base`, del cual este checkpoint es un fine-tuning. Sin benchmarks, no es posible establecer una comparativa objetiva con alternativas como Llama 3.1 8B, Mistral 7B o Gemma 2 9B. Se recomienda tratar este modelo como experimental y no como una opción competitiva sin evaluación previa.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 180 de un barrido), no un modelo final pulido; puede presentar calidad inconsistente o comportamientos no deseados.
- La licencia no está especificada, lo que impide conocer las condiciones de uso comercial o de redistribución. No debe utilizarse en producción sin aclarar este punto.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- El modelo tiene cero descargas y cero interacciones, lo que indica que no ha sido validado por la comunidad.
- No se proporcionan datos de entrenamiento, por lo que es imposible evaluar la procedencia de los datos o posibles problemas de copyright o privacidad.
- Al estar basado en Qwen3.5-9B-Base, hereda las limitaciones de ese modelo, pero no se dispone de información específica sobre ellas.

## Enlaces

- [HuggingFace: agentic-ptb/opus-max.hNA.sft_v2.step_180](https://huggingface.co/agentic-ptb/opus-max.hNA.sft_v2.step_180)
- Origen indicado en la model card: `msr-spare/msr-agentic-ptb-opus-max` (sin enlace directo disponible)
