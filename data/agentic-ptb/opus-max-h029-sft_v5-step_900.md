# agentic-ptb/opus-max.h029.sft_v5.step_900

## Resumen

`agentic-ptb/opus-max.h029.sft_v5.step_900` es un checkpoint intermedio (step 900) de un barrido de entrenamiento (sweep) del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, con 9.409.813.744 parámetros y un tamaño de repositorio de 18,8 GB en formato safetensors. El nombre de la celda (`opus-max`) indica que los datos de entrenamiento fueron generados por el agente Claude Code / claude-opus-5 con un nivel de razonamiento `max`, dentro de un pipeline de generación de datos sintéticos para entrenar modelos agénticos.

Este checkpoint no es un modelo final listo para producción, sino una parada intermedia dentro de un proceso de entrenamiento más amplio. Su interés radica en que permite estudiar la evolución del aprendizaje durante el SFT, comparar la calidad de los checkpoints a distintos pasos y validar la correcta configuración de tokens de fin de secuencia (eos). La model card confirma que los `eos_token_id` son `[248044, 248046]`, lo que garantiza que el modelo detiene correctamente las respuestas en el formato de chat de Qwen3.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (hereda la del base model Qwen3.5-9B-Base) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del base `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer densa de 9.400 millones de parámetros. El entrenamiento se realizó dentro del framework AgentPTB, un barrido de experimentos donde distintas celdas (configuraciones) generan datos sintéticos mediante agentes de alto rendimiento. En este caso, la celda `opus-max` utilizó como driver a Claude Code / claude-opus-5 con `reasoning effort = max`, lo que produce datos de alta calidad orientados a tareas agénticas y de razonamiento multi-paso.

El checkpoint corresponde al paso 900 de la fase `sft_v5`, con 4 shards de pesos. La model card indica que los tokens de fin de secuencia están correctamente configurados (`248044` y `248046`, siendo este último `<|im_end|>`), un detalle crítico para que el modelo no se exceda en la generación y respete el formato de chat de Qwen3.5. No se especifican el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO; estos datos no están disponibles en la información publicada.

## Capacidades

Al tratarse de un checkpoint intermedio, no se han publicado evaluaciones de capacidades específicas. Las capacidades observables son las heredadas del modelo base Qwen3.5-9B-Base, que incluyen:

- Generación de texto y razonamiento en lenguaje natural.
- Soporte de formato de chat con tokens `<|im_start|>` y `<|im_end|>`.
- Probable soporte de tool calling y function calling, propio de la familia Qwen3.5.
- Capacidad de procesar instrucciones complejas y mantener conversaciones multi-turno.

No se dispone de información verificada sobre capacidades adicionales (visión, audio, modo thinking) ni sobre el rendimiento real de este checkpoint en tareas concretas. Cualquier afirmación al respecto sería especulativa.

## Casos de uso

Dado su carácter de checkpoint intermedio, los casos de uso son principalmente de investigación y desarrollo:

- Estudio de la dinámica de entrenamiento: analizar cómo evoluciona la pérdida y la calidad de las respuestas a lo largo de los pasos de SFT comparando este checkpoint con otros del mismo sweep.
- Validación de la configuración de tokens eos: verificar que el modelo detiene correctamente las respuestas, un requisito previo para evaluaciones fiables.
- Fine-tuning posterior: usar este checkpoint como punto de partida para continuar el entrenamiento con otros datasets o técnicas (DPO, RLHF).
- Evaluación comparativa de checkpoints: medir el rendimiento en benchmarks estándar (MMLU, HumanEval, GSM8K) para decidir en qué paso detener el entrenamiento.
- Reproducción de experimentos: dado que el sweep es reproducible, este checkpoint permite replicar resultados y comparar con otras celdas del barrido.
- Investigación sobre datos sintéticos: estudiar el impacto de datos generados por Claude Opus 5 con razonamiento máximo en el aprendizaje del modelo base.

No se recomienda su uso en producción, ya que es un artefacto intermedio sin licencia definida ni evaluación de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación y el repositorio no contiene tablas de rendimiento. Cualquier número que se cite sería inventado.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.400 millones de parámetros en precisión fp16, se necesitan aproximadamente 19 GB de VRAM. Con cuantización a 8 bits, unos 10 GB; a 4 bits, unos 5-6 GB.
- GPU recomendadas: para fp16, una NVIDIA A100 (40 GB), RTX 4090 (24 GB) o similar. Para cuantización 4 bits, una RTX 3090 (24 GB) o RTX 4060 Ti (16 GB) pueden ser suficientes.
- En consumer GPU: sí, cabe en GPUs de gama alta con 24 GB o más si se cuantiza. En GPUs de 16 GB solo con cuantización agresiva (4 bits).
- Opciones de despliegue: al ser un modelo basado en Qwen3.5, es compatible con vLLM, llama.cpp, Ollama y TGI, siempre que se conviertan los pesos a los formatos adecuados (GGUF, etc.). No se proporcionan archivos de cuantización en el repositorio.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| agentic-ptb/opus-max.h029.sft_v5.step_900 | 9,4 B | no disponible | no disponible | safetensors | Checkpoint intermedio de SFT |
| Qwen/Qwen3.5-9B-Base | 9,4 B | no disponible | no disponible | safetensors | Modelo base original |
| Otros checkpoints del sweep AgentPTB | 9,4 B | no disponible | no disponible | safetensors | Misma arquitectura, distintos pasos/datos |

No se dispone de información suficiente para comparar con modelos de la misma categoría fuera del ecosistema AgentPTB. La comparativa con el base model es la más relevante: este checkpoint es un derivado directo de Qwen3.5-9B-Base, por lo que su rendimiento dependerá de la calidad de los datos sintéticos generados por Claude Opus 5.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final. Su rendimiento puede ser inferior al de checkpoints posteriores o al del modelo base original.
- Sin licencia definida: no se especifica la licencia de uso, lo que impide su uso comercial o incluso académico sin autorización explícita del autor.
- Sin evaluación de seguridad: no se han publicado análisis de sesgos, alucinaciones o comportamientos peligrosos. No debe usarse en aplicaciones que requieran fiabilidad.
- Datos de entrenamiento desconocidos: no se detalla la composición del dataset SFT, por lo que no se puede evaluar el riesgo de sesgos o contenido inapropiado.
- Sin cuantizaciones oficiales: solo se ofrecen pesos en safetensors; para usar en entornos de producción habría que convertirlos, lo que puede introducir pérdidas de calidad.
- Contexto y multilingüismo no verificados: aunque el base model Qwen3.5 probablemente soporta múltiples idiomas y contexto largo, no hay datos confirmados para este checkpoint concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/opus-max.h029.sft_v5.step_900
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Referencia al driver (Claude Opus 5): https://www.anthropic.com/research/claude-opus-5
- Ficha de Claude Opus 5 en Amazon Bedrock: https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-opus-5.html
- Seguimiento de lanzamientos de Claude Opus 5: https://aireleasetracker.com/model/anthropic/claude-opus-5
