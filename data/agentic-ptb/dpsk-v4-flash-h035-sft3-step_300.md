# agentic-ptb/dpsk-v4-flash.h035.sft3.step_300

## Resumen

Este repositorio contiene un checkpoint intermedio denominado `dpsk-v4-flash.sft3.step_300`, publicado por el usuario `agentic-ptb`. Se trata de un punto de control (step 300) extraído de un barrido de entrenamiento agéntico denominado AgentPTB, concretamente de la celda `dpsk-v4-flash`, cuyo driver es `pi / DeepSeek v4-flash` con un esfuerzo de razonamiento configurado en modo `thinking`. El modelo es un fine-tune (SFT3) del modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros.

La relevancia de este checkpoint es principalmente investigadora: permite analizar la evolución de un modelo durante un pipeline de entrenamiento de razonamiento agéntico. No está pensado para uso en producción, ya que se trata de un artefacto intermedio, y además presenta una advertencia crítica: el `eos_token_id` configurado es `[248044]`, pero falta el token `248046`, lo que puede provocar comportamientos erráticos en la generación. No se dispone de información sobre licencia, idiomas soportados ni contexto de entrenamiento más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,41 B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (heredado del modelo base, no especificado) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint base `Qwen/Qwen3.5-9B-Base`, entrenado mediante una etapa de Supervised Fine-Tuning (SFT3) dentro de un barrido de experimentos denominado AgentPTB. La celda de entrenamiento se identifica como `dpsk-v4-flash`, con un driver `pi / DeepSeek v4-flash` y un esfuerzo de razonamiento fijado en `thinking`. El checkpoint corresponde al paso 300 del entrenamiento y tiene un rol intermedio dentro del pipeline.

La model card indica que el checkpoint fue podado de su almacenamiento original (PVC) y recuperado desde una copia de seguridad (`msr-spare/msr-agentic-ptb-dpsk-sft3-intermediates`). No se proporcionan detalles sobre el dataset utilizado, el número total de tokens de entrenamiento, ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se especifica la arquitectura interna más allá de la heredada del modelo base. Se advierte explícitamente de una anomalía en la configuración de tokens de fin de secuencia: el `eos_token_id` es `[248044]` y falta el token `248046`, lo que puede afectar a la terminación de las secuencias generadas.

## Capacidades

No se han documentado capacidades específicas para este checkpoint en la información disponible. Al tratarse de un fine-tune de `Qwen/Qwen3.5-9B-Base`, se espera que herede las capacidades generales del modelo base, como generación de texto y razonamiento, pero no hay datos verificados al respecto. El driver indica un modo de razonamiento `thinking`, lo que sugiere que el entrenamiento está orientado a potenciar el razonamiento multi-paso, aunque no se puede confirmar sin evaluaciones.

- Generación de texto: no verificada en este checkpoint.
- Razonamiento multi-step: el driver `thinking` sugiere orientación a este tipo de tareas, pero sin benchmarks no se puede confirmar.
- Tool calling / function calling: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, etc.): no disponibles.

## Casos de uso

Dado que se trata de un checkpoint intermedio con una advertencia sobre tokens EOS y sin licencia definida, no es recomendable su uso en aplicaciones de producción. Los casos de uso realistas se limitan al ámbito de la investigación y el análisis de experimentos:

- Investigación de dinámicas de entrenamiento: permite estudiar cómo evoluciona el modelo en el paso 300 de un barrido SFT3, comparando con checkpoints anteriores o posteriores para entender la progresión del aprendizaje.
- Reproducción de experimentos agénticos: útil para investigadores que quieran replicar el pipeline AgentPTB y validar los resultados del barrido `dpsk-v4-flash`.
- Análisis de la configuración de tokens EOS: el fallo en la configuración de `eos_token_id` puede servir como caso de estudio sobre los efectos de una tokenización incorrecta en la generación.
- Evaluación de la etapa intermedia de fine-tuning: se puede utilizar para medir la capacidad de razonamiento en un punto concreto del entrenamiento, antes de la convergencia final.
- Depuración de pipelines de entrenamiento: sirve para verificar la integridad de los checkpoints recuperados desde copias de seguridad y la correcta restauración de los pesos.
- Comparación de estrategias de razonamiento: al estar configurado con esfuerzo `thinking`, puede usarse para comparar el comportamiento del modelo en este modo frente a otros checkpoints del mismo sweep con configuraciones distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

El tamaño del repositorio es de 18,8 GB, lo que sugiere que los pesos están almacenados en precisión BF16 o FP16 (típico para safetensors de ~9,4 B parámetros). No se proporcionan datos sobre latencia, throughput ni requisitos específicos de VRAM.

- VRAM estimada para inferencia: aproximadamente 19-20 GB en BF16/FP16 sin cuantización.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM, como una RTX 4090, podría cargar el modelo en BF16, aunque de forma ajustada. Una A100 40GB o H100 80GB ofrecería mayor margen y permitiría procesar lotes más grandes.
- Compatibilidad con GPU de consumo: sí, una RTX 3090 o RTX 4090 (24 GB) podría ejecutar el modelo en BF16, pero no se recomienda para uso prolongado debido a la falta de cuantizaciones publicadas.
- Opciones de despliegue: al no existir cuantizaciones GGUF ni otros formatos, el despliegue se limitaría a frameworks que soporten safetensors, como vLLM o TGI, aunque no se recomienda su uso en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se limita al modelo base y a otros checkpoints del mismo barrido, ya que no hay datos de rendimiento publicados.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `agentic-ptb/dpsk-v4-flash.h035.sft3.step_300` | 9,41 B | no disponible | no disponible | Checkpoint intermedio, no apto para producción |
| `Qwen/Qwen3.5-9B-Base` | 9,41 B | no especificado en la ficha | no disponible | Modelo base disponible en HuggingFace |
| Otros checkpoints del sweep AgentPTB | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría (fine-tunes intermedios de Qwen3.5-9B) en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: no está diseñado para uso en producción; es un artefacto de un barrido de entrenamiento.
- Configuración de EOS incompleta: el `eos_token_id` es `[248044]` y falta el token `248046`, lo que puede provocar que el modelo no termine las secuencias correctamente o genere texto indefinidamente.
- Licencia no disponible: no se puede determinar si el modelo puede utilizarse comercialmente o bajo qué términos.
- Sesgos y alucinaciones: no hay datos disponibles sobre sesgos conocidos ni sobre la propensión a alucinar.
- Idiomas y contexto: no se especifican los idiomas soportados ni la longitud de contexto, lo que limita su uso en aplicaciones multilingües o con contextos largos.
- Integridad del checkpoint: el modelo fue recuperado de una copia de seguridad tras ser podado del almacenamiento original, por lo que no se garantiza la integridad total de los pesos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h035.sft3.step_300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Origen del checkpoint (referencia en la model card): `msr-spare/msr-agentic-ptb-dpsk-sft3-intermediates` (sin URL directa disponible)
