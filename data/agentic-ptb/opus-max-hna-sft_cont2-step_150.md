# agentic-ptb/opus-max.hNA.sft_cont2.step_150

## Resumen

`agentic-ptb/opus-max.hNA.sft_cont2.step_150` es un checkpoint intermedio de un barrido de entrenamiento agéntico denominado AgentPTB, desarrollado por el usuario `agentic-ptb`. El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y ha sido sometido a un fine-tuning supervisado continuado (SFT) hasta el paso 150. Según la model card, los datos de entrenamiento fueron generados mediante un agente basado en Claude Code / claude-opus-5 con razonamiento en modo `max`, lo que sugiere un pipeline de generación de datos sintéticos para tareas de razonamiento y agencia.

Con aproximadamente 9,4 mil millones de parámetros, este checkpoint se presenta como un artefacto intermedio de un proceso de barrido de hiperparámetros, no como un modelo final pulido. Su relevancia radica en ilustrar una metodología emergente de entrenamiento donde agentes de IA generan datos de alta calidad para fine-tuning de modelos abiertos. No se dispone de información sobre la longitud de contexto, licencia, idiomas soportados ni benchmarks publicados, por lo que su uso en producción no está recomendado sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se especifica en la información disponible, pero al derivar de `Qwen/Qwen3.5-9B-Base` se asume un transformer denso con atención estándar, típico de la familia Qwen. El entrenamiento consistió en una continuación de fine-tuning supervisado (SFT) sobre el modelo base, con datos generados por un agente de Claude Code / claude-opus-5 configurado con esfuerzo de razonamiento `max`. Este proceso forma parte de un barrido de hiperparámetros llamado AgentPTB, donde se exploran diferentes configuraciones de generación de datos agénticos.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El checkpoint corresponde al paso 150 de la segunda fase de SFT (`sft_cont2`), y se indica que fue recuperado de una copia de seguridad tras ser podado del almacenamiento principal. Los tokens de fin de secuencia (`eos_token_id`) se confirman como `[248044, 248046]`, lo que sugiere una configuración de tokenización específica del proceso.

## Capacidades

No se ha publicado documentación específica sobre las capacidades de este checkpoint. Al ser un fine-tuning del modelo base Qwen3.5-9B-Base, es razonable asumir que hereda las capacidades generales de dicho modelo, que típicamente incluyen:

- Generación de texto y razonamiento en múltiples dominios
- Comprensión y generación de código
- Capacidades matemáticas básicas
- Soporte multilingüe (dependiendo del modelo base)

Sin embargo, no hay confirmación oficial de que estas capacidades se mantengan o se hayan modificado tras el fine-tuning. Tampoco se dispone de información sobre tool calling, capacidades de agente, o modos especiales de razonamiento. Se recomienda tratar este checkpoint como un artefacto experimental sin garantías de comportamiento.

## Casos de uso

No se han documentado casos de uso específicos para este checkpoint. Dado su carácter intermedio y la falta de evaluación pública, no se recomienda su uso en aplicaciones de producción. Posibles escenarios de investigación podrían incluir:

- Estudio de metodologías de generación de datos agénticos para fine-tuning
- Análisis de la evolución del rendimiento a lo largo de los pasos de SFT en un barrido
- Comparación de la calidad de los datos generados por diferentes agentes (en este caso, Claude Code con esfuerzo máximo)

Para aplicaciones prácticas, se sugiere esperar a la publicación de checkpoints finales o de evaluaciones formales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este checkpoint. Tampoco se ofrecen comparaciones con el modelo base o con otros modelos de tamaño similar.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. Como estimación orientativa para un modelo denso de ~9,4 mil millones de parámetros:

- VRAM estimada para inferencia en FP16: ~18,8 GB (coincide con el tamaño del repositorio)
- VRAM estimada en cuantización INT8: ~9,4 GB
- VRAM estimada en cuantización INT4: ~4,7 GB
- GPU recomendadas: para FP16 se necesitaría una GPU con al menos 24 GB de VRAM (p. ej., RTX 4090, A10G, L4); con cuantización INT4 podría ejecutarse en GPUs de consumo con 8 GB o más
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI, siempre que se generen los formatos adecuados (GGUF, etc.), que no están disponibles actualmente

Estas cifras son estimaciones basadas en el tamaño del modelo y no en pruebas reales.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. Al ser un checkpoint intermedio de un barrido experimental, no existen datos de rendimiento que permitan una comparación objetiva con alternativas como Qwen3-8B, Qwen2.5-7B o Llama-3.1-8B. Se recomienda consultar el modelo base `Qwen/Qwen3.5-9B-Base` para obtener referencias de capacidades generales, aunque sin garantía de que este checkpoint las mantenga.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final pulido; puede presentar inestabilidades o comportamientos erráticos propios de un entrenamiento incompleto.
- Licencia no disponible: no se puede determinar si su uso comercial está permitido; se debe contactar al autor antes de cualquier aplicación.
- Sesgos potenciales: los datos de entrenamiento generados por un agente (Claude Code) pueden introducir sesgos específicos del proceso de generación, no documentados.
- Riesgo de alucinación: al ser un fine-tuning sin evaluación, el riesgo de generar contenido falso o inconsistente es elevado.
- Sin soporte de contexto conocido: no se especifica la longitud de contexto, lo que impide planificar su uso en tareas de ventana larga.
- Sin cuantizaciones disponibles: solo se ofrecen pesos en safetensors, lo que limita su despliegue en entornos con restricciones de memoria.

## Enlaces

- [HuggingFace: agentic-ptb/opus-max.hNA.sft_cont2.step_150](https://huggingface.co/agentic-ptb/opus-max.hNA.sft_cont2.step_150)
- Modelo base: [Qwen/Qwen3.5-9B-Base](https://huggingface.co/Qwen/Qwen3.5-9B-Base) (enlace inferido, no verificado en la información proporcionada)
