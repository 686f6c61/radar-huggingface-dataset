# agentic-ptb/dpsk-v4-flash.h062.sft4.step_1400

## Resumen

`agentic-ptb/dpsk-v4-flash.h062.sft4.step_1400` es un checkpoint intermedio de un barrido de hiperparámetros (sweep) del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un fine-tuning de tipo SFT (etapa `sft4`) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros (~9,4B). El checkpoint corresponde al paso 1400 de entrenamiento y está etiquetado como de rol "intermediate", es decir, un artefacto de investigación para analizar la evolución del entrenamiento, no un modelo final listo para producción.

Según la model card, el "driver" de este experimento es `pi / DeepSeek v4-flash` con un esfuerzo de razonamiento fijado en `thinking`. Esto sugiere que el objetivo del fine-tuning es que el modelo base aprenda a imitar el comportamiento de razonamiento de DeepSeek v4-flash en modo "thinking", probablemente para estudiar la transferencia de capacidades de razonamiento entre arquitecturas. El checkpoint fue recuperado de una copia de seguridad (`msr-spare`) tras ser podado del almacenamiento principal, lo que refuerza su carácter experimental.

La relevancia de este modelo es limitada fuera del contexto de investigación: no tiene licencia declarada, no se han publicado benchmarks ni datos de entrenamiento, y la propia model card advierte de un token EOS faltante. Es útil principalmente para quienes estudian dinámicas de entrenamiento, comparación de checkpoints intermedios o la transferencia de estilos de razonamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base: Qwen/Qwen3.5-9B-Base, presumiblemente transformer) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no es MoE declarado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 18,8 GB, 1 shard) |

## Arquitectura y entrenamiento

La arquitectura no está documentada explícitamente en la model card, pero al estar basado en `Qwen/Qwen3.5-9B-Base`, se hereda la arquitectura de dicho modelo (presumiblemente un transformer decoder-only, aunque no se confirma en la información disponible). El entrenamiento corresponde a una etapa de fine-tuning supervisado (SFT) denominada `sft4`, dentro de un barrido de hiperparámetros del proyecto AgentPTB. El checkpoint se guardó en el paso 1400 y el "driver" del experimento es `pi / DeepSeek v4-flash` con esfuerzo de razonamiento `thinking`, lo que indica que el objetivo era entrenar al modelo para generar razonamiento explícito al estilo de DeepSeek v4-flash.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card menciona que el `eos_token_id` configurado es `[248044]` y que falta el token `248046`, lo que sugiere un posible problema en la configuración de tokens de fin de secuencia durante el entrenamiento.

## Capacidades

No se han publicado capacidades específicas para este checkpoint. Al ser un modelo intermedio basado en Qwen3.5-9B-Base, es razonable asumir que hereda las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.), pero no hay evidencia documentada de ello. La única pista es el objetivo declarado de imitar el razonamiento "thinking" de DeepSeek v4-flash, lo que podría implicar:

- Generación de cadenas de razonamiento explícitas antes de la respuesta final (modo thinking).
- Mejora potencial en tareas de razonamiento multi-paso, aunque sin benchmarks no se puede confirmar.

No se dispone de información sobre tool calling, capacidades multimodales, ni soporte de agentes.

## Casos de uso

Dado el carácter experimental e intermedio de este checkpoint, los casos de uso son principalmente de investigación y análisis:

- **Análisis de la dinámica de entrenamiento**: comparar este checkpoint (paso 1400) con otros pasos del mismo sweep para estudiar cómo evoluciona la pérdida, la coherencia del razonamiento o la aparición de habilidades específicas durante el fine-tuning.
- **Estudio de transferencia de estilos de razonamiento**: investigar si un modelo base de la familia Qwen puede adoptar el estilo de razonamiento "thinking" de DeepSeek v4-flash mediante SFT, y en qué medida se mantiene o degrada respecto al modelo original.
- **Evaluación de checkpoints intermedios**: usar este modelo como punto de referencia para determinar en qué paso del entrenamiento se alcanzan ciertas capacidades, útil para decidir puntos de parada temprana en futuros experimentos.
- **Depuración de pipelines de entrenamiento**: dado el aviso sobre el token EOS faltante, este checkpoint puede servir para diagnosticar problemas de configuración de tokens en el pipeline de AgentPTB.
- **Reproducibilidad de experimentos**: al estar disponible públicamente, permite a otros investigadores reproducir o extender los resultados del sweep `dpsk-v4-flash`.
- **Pruebas de cuantización y despliegue experimental**: aunque no es recomendable para producción, puede usarse para probar flujos de cuantización (GGUF, AWQ, etc.) en un modelo de ~9,4B sin riesgo de afectar a un sistema productivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar para este checkpoint. Tampoco se proporcionan comparaciones con el modelo base o con DeepSeek v4-flash.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. A partir del tamaño del modelo (9,4B parámetros) y del peso en safetensors (18,8 GB), se pueden hacer estimaciones orientativas para inferencia:

- **VRAM estimada**: en precisión FP16/BF16, el modelo requiere aproximadamente 18,8 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. En la práctica, se necesitarían al menos 24 GB de VRAM para inferencia cómoda.
- **GPU recomendadas**: una RTX 3090 (24 GB) o RTX 4090 (24 GB) podría ejecutar el modelo en FP16 con limitaciones de contexto. Para mayor margen, una A100 (40 GB) o H100 (80 GB) sería más adecuada.
- **Consumer GPU**: sí, es posible ejecutarlo en GPUs de consumo con 24 GB de VRAM, aunque con ventana de contexto reducida. Con cuantización a 8 bits (~9,4 GB) cabría en GPUs de 12-16 GB, y a 4 bits (~4,7 GB) en GPUs de 8 GB, pero no se han publicado cuantizaciones oficiales.
- **Opciones de despliegue**: al ser un modelo en formato safetensors, se puede servir con vLLM, TGI o llama.cpp (tras conversión a GGUF). No hay integraciones oficiales con Ollama ni otros runners.
- **Latencia y throughput**: no se han publicado datos. Para un modelo de 9,4B en una GPU moderna, se puede esperar un throughput del orden de 20-50 tokens/s en FP16, pero esto es una estimación genérica y no un dato verificado.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo más directamente comparable es su base, `Qwen/Qwen3.5-9B-Base`, del que se diferencia por el fine-tuning SFT orientado a razonamiento "thinking". También podría compararse con `DeepSeek v4-flash`, el modelo que actúa como driver del experimento, pero no se han publicado métricas de ninguno de los tres en el contexto de este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/dpsk-v4-flash (este) | 9,4B | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B (aprox.) | no disponible | no disponible | HuggingFace |
| DeepSeek v4-flash | no disponible | no disponible | no disponible | no disponible |

Sin datos de benchmarks ni especificaciones completas, no es posible establecer una comparativa de rendimiento fiable.

## Limitaciones y advertencias

- **Checkpoint intermedio**: no es un modelo final; fue diseñado como artefacto de investigación dentro de un sweep y no ha pasado por fases de alineación o evaluación exhaustiva.
- **Token EOS incompleto**: la model card advierte que falta el `eos_token_id` 248046, lo que puede provocar generaciones que no terminen correctamente o comportamientos inesperados en producción.
- **Licencia no declarada**: no se especifica la licencia, por lo que no está claro si se permite uso comercial o incluso uso académico sin restricciones. Se recomienda contactar con el autor antes de cualquier uso.
- **Sin datos de sesgos ni alucinación**: no se ha evaluado el modelo en estos aspectos, por lo que no se puede garantizar su fiabilidad en tareas sensibles.
- **Sin benchmarks**: la ausencia de métricas impide conocer su rendimiento real en tareas estándar.
- **Origen incierto**: el checkpoint fue recuperado de una copia de seguridad tras ser podado, lo que podría implicar que no se conservaron todos los metadatos o configuraciones originales.
- **No apto para producción**: dadas todas las limitaciones anteriores, no se recomienda su uso en aplicaciones reales sin una evaluación y adaptación previas.

## Enlaces

- [HuggingFace: agentic-ptb/dpsk-v4-flash.h062.sft4.step_1400](https://huggingface.co/agentic-ptb/dpsk-v4-flash.h062.sft4.step_1400)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base)
- Repo de origen mencionado en la model card: `msr-spare/msr-agentic-ptb-dpsk-sft4-intermediates` (no se ha encontrado un enlace directo en la información proporcionada)
