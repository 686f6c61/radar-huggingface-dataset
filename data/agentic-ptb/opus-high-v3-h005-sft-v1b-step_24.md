# agentic-ptb/opus-high-v3.h005.sft-v1b.step_24

## Resumen

`opus-high-v3.h005.sft-v1b.step_24` es un checkpoint intermedio derivado de un experimento de ajuste fino supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB. El propio autor lo etiqueta como un resultado negativo: el run no produjo ninguna mejora en los pesos entrenados, y el checkpoint se conserva únicamente con fines de reproducibilidad y estudio cualitativo. No debe interpretarse como un modelo con calidad de publicación ni como un candidato para uso en producción.

El modelo tiene 9.409.813.744 parámetros, está disponible en formato safetensors (18,8 GB) y se distribuye bajo licencia Apache-2.0. Al tratarse de un artefacto intermedio de un pipeline experimental, carece de documentación sobre contexto, idiomas, cuantizaciones o benchmarks. Su relevancia actual es exclusivamente metodológica: sirve para analizar por qué ciertos runs de SFT regresan frente al modelo base y para auditar la reproducibilidad de experimentos de entrenamiento de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune SFT sobre Qwen/Qwen3.5-9B-Base (transformer decoder-only, sin detalles adicionales publicados) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se especifica si es MoE; el base es denso) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada en la model card) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es el resultado de un paso de SFT (supervised fine-tuning) aplicado sobre `Qwen/Qwen3.5-9B-Base`, dentro del run `opus-high-v3` del proyecto AgentPTB, que utiliza un entorno de ejecución tipo Claude Code. La arquitectura subyacente es la del modelo base de Qwen (transformer decoder-only), pero la model card no proporciona detalles sobre la composición del dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas adicionales como RLHF o DPO. El autor indica explícitamente que el run no encontró mejora en los pesos entrenados, lo que sugiere que el SFT no logró superar al modelo base en las métricas evaluadas internamente. El checkpoint se guarda en `scratch/agent/sft-v1b/weights/step_24` y se acompaña de un dataset de referencia (`agentic-ptb/opus-high-v3-data`) para reproducibilidad.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen3.5-9B, aunque sin verificación independiente de rendimiento.
- Razonamiento y código: no hay evaluaciones publicadas que confirmen capacidades específicas tras el SFT.
- Tool calling y agentes: el run está orientado a tareas de agente (Claude Code), pero no se documenta soporte funcional de tool calling en este checkpoint.
- Multilingüismo: no disponible.
- Capacidades especiales: ninguna documentada; el autor advierte que no se debe inferir calidad a partir de la publicación.

## Casos de uso

- Reproducibilidad de experimentos de SFT: el checkpoint permite a otros investigadores replicar el run `opus-high-v3` y verificar la ausencia de mejora reportada, comparando pesos y activaciones con el modelo base.
- Estudio de regresión en fine-tuning: sirve como caso de estudio para analizar por qué un SFT puede degradar el rendimiento frente al base, especialmente en entornos de entrenamiento de agentes.
- Auditoría de pipelines de entrenamiento: útil para depurar infraestructuras de entrenamiento distribuidas, ya que el checkpoint intermedio permite inspeccionar el estado de los pesos en un paso concreto (`step_24`).
- Análisis cualitativo de sobreajuste: al ser un resultado negativo, puede emplearse para examinar patrones de sobreajuste o colapso de representaciones en SFT con datos de agentes.
- Comparación de estrategias de inicialización: junto con otros checkpoints del mismo run, permite estudiar el efecto de diferentes configuraciones de entrenamiento sobre un mismo base.
- Documentación de resultados negativos: su publicación contribuye a la transparencia en IA, evitando el sesgo de publicación hacia resultados positivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. La única afirmación es que el run no produjo mejora en los pesos entrenados, sin cuantificar la regresión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al ser un modelo de ~9,4B parámetros en precisión fp16/bf16, se requiere aproximadamente 19-20 GB de VRAM para carga completa en memoria.
- GPU recomendadas: una GPU con 24 GB de VRAM (p. ej., RTX 3090, RTX 4090) podría cargar el modelo en fp16; para inferencia con cuantización (no disponible en este repo) se necesitaría menos.
- Compatibilidad con GPU de consumo: sí, en tarjetas de 24 GB o más, aunque sin cuantizaciones publicadas el uso práctico es limitado.
- Opciones de despliegue: no se proporcionan archivos GGUF, ni integraciones con vLLM, Ollama o TGI. El formato safetensors permite su uso con transformers de HuggingFace, pero no hay guías de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa. Estructuralmente, el modelo es un fine-tune de `Qwen/Qwen3.5-9B-Base`, por lo que su comparación natural sería con el propio base y con otros fine-tunes del mismo proyecto (p. ej., `opus-high-v1` o `opus-high-v2`, este último abortado). Sin métricas publicadas, cualquier comparación sería especulativa. Se recomienda tratar este checkpoint como un artefacto de investigación, no como un modelo competitivo.

## Limitaciones y advertencias

- Resultado negativo confirmado: el autor declara que el run no encontró mejora en los pesos entrenados; no debe usarse como modelo de producción.
- Sin benchmarks: no hay evidencia de capacidades reales; cualquier uso práctico es desaconsejable.
- Documentación incompleta: no se especifican contexto, idiomas, dataset de entrenamiento ni metodología de evaluación.
- Riesgo de alucinación y sesgos: al ser un fine-tune no validado, los riesgos son desconocidos y potencialmente mayores que en el modelo base.
- Licencia: Apache-2.0 permite uso comercial, pero la falta de garantías de rendimiento hace que su adopción en entornos productivos sea irresponsable.
- Naturaleza intermedia: es un checkpoint de un paso concreto (`step_24`) de un run más amplio; no representa un modelo final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h005.sft-v1b.step_24
- Dataset asociado: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX
- Búsqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
