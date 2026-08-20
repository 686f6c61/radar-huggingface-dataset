# agentic-ptb/opus-max.hNA.sft_cont2.step_750

## Resumen

`opus-max.hNA.sft_cont2.step_750` es un checkpoint intermedio del proyecto AgentPTB, un barrido de post-entrenamiento orientado a agentes. El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y ha sido sometido a una segunda ronda de fine-tuning supervisado (SFT continuado), alcanzando el paso 750. El nombre "opus-max" indica que el checkpoint fue generado mediante el driver Claude Code con el modelo claude-opus-5 en modo de razonamiento máximo, dentro de una celda de experimentación del barrido.

Con 9.409.813.744 parámetros (~9,4B), este checkpoint representa un punto intermedio del proceso de entrenamiento, no un modelo final pulido. Su propósito principal es servir como artefacto de investigación para estudiar el efecto del post-entrenamiento en agentes, y su estado actual es de "rol intermedio" dentro del pipeline de AgentPTB. No se han publicado métricas de evaluación ni documentación de capacidades, por lo que su uso en producción no está recomendado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información disponible. El modelo base es `Qwen/Qwen3.5-9B-Base`, por lo que se espera que herede la estructura de dicha familia (probablemente un transformer denso con atención estándar), pero no se confirma ningún detalle específico.

El entrenamiento corresponde a una continuación de fine-tuning supervisado (SFT), indicado por el sufijo `sft_cont2` (segunda ronda de SFT continuado). El checkpoint se generó en el contexto de un barrido de AgentPTB, donde el driver Claude Code con claude-opus-5 a esfuerzo máximo produjo los datos de entrenamiento. El paso 750 sugiere que el entrenamiento estaba en una fase temprana o media. No se dispone de información sobre el dataset, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un modelo intermedio basado en Qwen3.5-9B-Base, es razonable asumir que hereda las capacidades generales del modelo base (generación de texto, razonamiento, posiblemente código y matemáticas), pero no hay confirmación oficial.

- Generación de texto: no confirmada de forma independiente para este checkpoint.
- Razonamiento: no confirmado.
- Tool calling / function calling: no disponible.
- Soporte de agentes: el contexto de entrenamiento (AgentPTB) sugiere orientación a agentes, pero no hay evidencia publicada.
- Capacidades multilingües: no disponibles.
- Modo thinking / vision / audio: no disponible.

## Casos de uso

Dado que se trata de un checkpoint intermedio de investigación, los casos de uso son limitados y orientados a laboratorio:

- Investigación en post-entrenamiento de agentes: este checkpoint permite estudiar cómo evoluciona el comportamiento del modelo a lo largo del SFT continuado, comparando con otros pasos del barrido.
- Análisis de la influencia del driver de generación de datos: al haber sido generado con claude-opus-5 a esfuerzo máximo, puede usarse para analizar el impacto de la calidad de los datos sintéticos en el fine-tuning.
- Reproducción de experimentos: el checkpoint está disponible públicamente para reproducir o extender los experimentos de AgentPTB.
- Evaluación de la continuidad del entrenamiento: útil para medir la estabilidad del entrenamiento en el paso 750 frente a checkpoints posteriores.
- Benchmarking de modelos intermedios: permite comparar el rendimiento de un modelo a medio entrenar frente a su versión final, para estudiar curvas de aprendizaje.
- Desarrollo de técnicas de poda o recuperación: el propio historial del checkpoint (recuperado de una copia de seguridad) lo convierte en un caso de estudio para pipelines de gestión de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint.

## Requisitos de hardware

No se han publicado requisitos oficiales. Las siguientes estimaciones se basan en el tamaño del modelo (9,4B parámetros) y son orientativas:

- VRAM estimada para inferencia en FP16: ~19 GB (solo pesos), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización INT8: ~10 GB; en INT4: ~5-6 GB (si se dispusiera de versiones cuantizadas, que no están publicadas).
- GPU recomendadas: una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) para FP16; GPUs de 16 GB podrían funcionar con cuantización ligera.
- Opciones de despliegue: al ser un modelo safetensors, podría cargarse con transformers, vLLM o llama.cpp si se convierte a GGUF, pero no hay guías oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa fiable. El modelo más cercano es su base, `Qwen/Qwen3.5-9B-Base`, pero no se conocen las diferencias introducidas por el SFT continuado. Otras alternativas de ~9B (como Llama 3.1 8B o Mistral 7B) no son comparables directamente por falta de benchmarks comunes.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| opus-max.hNA.sft_cont2.step_750 | 9,4B | no disponible | no disponible | checkpoint intermedio |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | modelo base |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | modelo final |

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; puede presentar comportamientos incompletos o inestables propios de un entrenamiento a medio completar.
- Sin evaluación publicada: no hay benchmarks ni pruebas de calidad que respalden su uso en tareas concretas.
- Licencia no especificada: no se indica bajo qué términos puede usarse o redistribuirse; el uso comercial es incierto.
- Sin documentación de sesgos: no se han analizado sesgos, alucinaciones ni riesgos de seguridad.
- Origen de los datos de entrenamiento: generados mediante un driver de IA (claude-opus-5), lo que puede introducir sesgos del modelo generador en los datos sintéticos.
- Historial de recuperación: el checkpoint fue podado de su almacenamiento original y recuperado de una copia de seguridad, lo que podría implicar riesgos de integridad no verificados.
- Sin soporte de la comunidad: cero descargas y cero likes en el momento de la consulta; no hay comunidad activa ni mantenimiento.

## Enlaces

- [HuggingFace: agentic-ptb/opus-max.hNA.sft_cont2.step_750](https://huggingface.co/agentic-ptb/opus-max.hNA.sft_cont2.step_750)
- [Modelo base: Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base) (enlace inferido, no verificado en la información proporcionada)
