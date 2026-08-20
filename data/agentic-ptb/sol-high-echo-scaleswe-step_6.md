# agentic-ptb/sol-high.echo-scaleswe.step_6

## Resumen

`agentic-ptb/sol-high.echo-scaleswe.step_6` es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB, correspondiente a la celda `sol-high`. El modelo está construido sobre la base `Qwen/Qwen3.5-9B-Base` y cuenta con 9.409.813.744 parámetros (aproximadamente 9,4B). Según la model card, fue generado con un driver basado en Codex / gpt-5.6-sol con un nivel de razonamiento `high`, y se describe como el mejor checkpoint del barrido.

La relevancia de este modelo es principalmente investigadora: forma parte de un estudio sistemático de entrenamiento (sweep) y no está destinado a uso directo en producción. Presenta una advertencia crítica: el token `eos_token_id` configurado es `[248044]`, pero falta el token `248046` (`<|im_end|>`), que es el que el chat template de Qwen3.5 utiliza para terminar cada turno. Esto implica que el modelo no se detiene correctamente al final de un turno y puede sobrepasar la ventana de contexto, lo que invalida cualquier evaluación numérica como medición real (solo puede considerarse un límite inferior). No se ha publicado licencia, idiomas soportados ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B-Base, sin detalles adicionales) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen3.5-9B-Base`, como indican las etiquetas `base_model` y `base_model:finetune`. No se proporcionan detalles sobre la arquitectura interna más allá de la herencia del base (probablemente un transformer decoder-only estándar). El entrenamiento se enmarca en un barrido (sweep) del proyecto AgentPTB, con la celda `sol-high` y un driver basado en Codex / gpt-5.6-sol con esfuerzo de razonamiento `high`. El checkpoint corresponde al paso 6 de la ejecución `echo-scaleswe`, con 4 shards y un tamaño total de 18,8 GB.

No se especifican datos sobre el conjunto de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La única innovación técnica destacable es la advertencia sobre el token EOS: el checkpoint solo incluye `248044` y omite `248046` (`<|im_end|>`), lo que afecta a la generación de texto y a la validez de las evaluaciones.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un fine-tuning de Qwen3.5-9B-Base, se espera que herede capacidades generales de un modelo de lenguaje de 9B (generación de texto, razonamiento, código, etc.), pero no hay confirmación ni mediciones publicadas. Tampoco se indica soporte para tool calling, agentes, visión, audio o modos de pensamiento.

- Generación de texto: no especificado.
- Razonamiento: no especificado.
- Código: no especificado.
- Tool calling / function calling: no disponible.
- Soporte para agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Otras capacidades especiales: no disponible.

## Casos de uso

No se han documentado casos de uso prácticos para este checkpoint. Dado que es un artefacto intermedio de un barrido de entrenamiento y presenta el problema del token EOS faltante, no se recomienda su uso en producción. Los únicos usos plausibles son de investigación, siempre con la advertencia de que las evaluaciones no son fiables sin re-empaquetar el modelo.

- Investigación en dinámica de entrenamiento: análisis de la evolución de los checkpoints dentro del sweep, comparando métricas entre pasos.
- Estudio de la influencia del token EOS en la generación: este checkpoint sirve como caso de estudio de los efectos de un EOS incompleto.
- Comparación de checkpoints intermedios: útil para entender cómo progresa el entrenamiento en la celda `sol-high`.
- Reproducción de experimentos: permite replicar los resultados del sweep si se re-empaqueta correctamente.
- Desarrollo de técnicas de re-empaquetado: se puede usar para probar métodos que restauren el token EOS faltante.
- No aplicable a tareas de usuario final: no se recomienda su uso en chatbots, generación de código o cualquier aplicación real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente de que los números de evaluación de este checkpoint son un "suelo" (floor) y no una medición real, debido al token EOS faltante. Por tanto, no se incluyen tablas comparativas.

## Requisitos de hardware

Dado que el modelo tiene 9.409.813.744 parámetros y el repositorio ocupa 18,8 GB (presumiblemente en FP16), se pueden estimar los siguientes requisitos:

- VRAM estimada para inferencia: ~18,8 GB en FP16; ~9,4 GB en 8-bit; ~4,7 GB en 4-bit (si se aplica cuantización).
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A5000) para FP16 sin cuantizar. Con cuantización 8-bit o 4-bit, podría caber en GPUs de 12-16 GB (RTX 3080, RTX 4070 Ti, etc.).
- Compatibilidad con GPU de consumo: sí, con cuantización. En FP16 puro requiere una GPU de gama alta.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, siempre que se re-empaquete el modelo para corregir el token EOS. Sin esa corrección, la generación será defectuosa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. La única referencia directa es el modelo base `Qwen/Qwen3.5-9B-Base`, del cual no se han publicado métricas en la información proporcionada. Tampoco se conocen otros checkpoints del mismo sweep con los que comparar de forma fiable, dado que la advertencia sobre el EOS impide comparaciones directas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-high.echo-scaleswe.step_6 | 9,4B | No disponible | No disponible | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9,4B | No disponible | No disponible | HuggingFace |

## Limitaciones y advertencias

- Token EOS incompleto: falta `248046` (`<|im_end|>`), lo que provoca que el modelo no termine los turnos correctamente y sobrepase la ventana de contexto. Cualquier evaluación numérica es un límite inferior, no una medición real.
- Licencia no especificada: no se puede determinar si el modelo es utilizable comercialmente o si tiene restricciones.
- Idiomas no declarados: se desconoce el alcance multilingüe.
- Sesgos y alucinaciones: no se ha realizado ninguna evaluación de sesgos ni de fiabilidad; al ser un checkpoint intermedio, es probable que presente comportamientos erráticos.
- No apto para producción: sin re-empaquetado y validación, no debe usarse en aplicaciones reales.
- Documentación insuficiente: no hay información sobre el dataset de entrenamiento, el método de fine-tuning ni las condiciones de uso.

## Enlaces

- [HuggingFace - agentic-ptb/sol-high.echo-scaleswe.step_6](https://huggingface.co/agentic-ptb/sol-high.echo-scaleswe.step_6)
- [GitHub - AweAI-Team/ScaleSWE](https://github.com/AweAI-Team/ScaleSWE) (posible relación con el nombre del sweep, no confirmada)
