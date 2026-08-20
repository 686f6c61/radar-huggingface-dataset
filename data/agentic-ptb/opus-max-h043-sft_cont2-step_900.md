# agentic-ptb/opus-max.h043.sft_cont2.step_900

## Resumen

El modelo `agentic-ptb/opus-max.h043.sft_cont2.step_900` es un checkpoint intermedio de un barrido (sweep) de entrenamiento del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parámetros y un tamaño de repositorio de 18,8 GB en formato safetensors. El checkpoint corresponde al paso 900 de una segunda fase de entrenamiento supervisado (SFT), etiquetado como `sft_cont2`, dentro de una celda de experimentación denominada `opus-max`.

La relevancia de este modelo reside en su naturaleza de artefacto intermedio de investigación: forma parte de un proceso de barrido de hiperparámetros y estrategias de entrenamiento para agentes, donde el conductor de generación de datos fue `Claude Code / claude-opus-5` con un nivel de razonamiento `max`. No se trata de un modelo final listo para producción, sino de un punto de control para evaluar la evolución del entrenamiento. La ficha carece de licencia, idiomas declarados, pipeline y resultados de benchmarks, por lo que su uso debe limitarse a contextos de investigación y análisis de curvas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada, pero al estar basado en `Qwen/Qwen3.5-9B-Base`, se trata presumiblemente de un transformer denso de 9.000 millones de parámetros, aunque no se confirma si incorpora variantes como atención lineal o mezcla de expertos. El checkpoint es el resultado de un proceso de fine-tuning supervisado (SFT) continuado, como indica el nombre `sft_cont2`, y corresponde al paso 900 de esa segunda fase.

El entrenamiento se enmarca en el proyecto AgentPTB, un barrido sistemático de configuraciones para modelos agenticos. La celda `opus-max` utilizó como conductor de generación de datos a `Claude Code / claude-opus-5` con un nivel de razonamiento `max`, lo que sugiere que los datos de entrenamiento fueron producidos por ese modelo propietario. No se especifican el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El checkpoint incluye los tokens de fin de secuencia `[248044, 248046]`, siendo `248046` el token `<|im_end|>` del template de chat de Qwen3.5, lo que garantiza que el modelo detiene correctamente las respuestas.

## Capacidades

- No se han publicado capacidades específicas para este checkpoint en la información disponible.
- Al ser un fine-tuning de `Qwen/Qwen3.5-9B-Base`, se espera que herede las capacidades generales del modelo base, como generación de texto, razonamiento, código y comprensión multilingüe, aunque no hay confirmación oficial.
- El modelo está diseñado para su uso en el contexto de investigación de agentes, con un énfasis en la generación de datos de entrenamiento de alta calidad mediante razonamiento extenso.
- No se dispone de información sobre soporte de tool calling, function calling, visión, audio u otras capacidades especiales.

## Casos de uso

- Investigación de curvas de entrenamiento: este checkpoint permite analizar la evolución de la pérdida y el rendimiento en el paso 900 de la segunda fase de SFT, comparándolo con otros checkpoints del mismo barrido para identificar el punto óptimo de detención.
- Evaluación de estrategias de generación de datos: al haber sido entrenado con datos generados por `claude-opus-5` con esfuerzo máximo, sirve para estudiar el impacto de datos de alta calidad y razonamiento extenso en el fine-tuning de modelos base de 9B.
- Reproducción de experimentos: investigadores pueden reutilizar este checkpoint como punto de partida para continuar el entrenamiento o para realizar evaluaciones intermedias dentro del pipeline de AgentPTB.
- Análisis de sobreajuste y generalización: al ser un checkpoint intermedio, permite estudiar si el modelo ha memorizado los datos de entrenamiento o si generaliza correctamente en tareas de agente.
- Desarrollo de pipelines de fine-tuning continuado: el checkpoint puede servir como referencia para implementar estrategias de SFT en fases, evaluando la estabilidad del entrenamiento en cada paso.
- Comparación de conductores de datos: junto con otros checkpoints del barrido, permite comparar el efecto de diferentes modelos generadores (en este caso, `claude-opus-5`) sobre el rendimiento final del agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint. Cualquier cifra de rendimiento sería especulativa y debe evitarse.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.409.813.744 parámetros en FP16, se necesitan aproximadamente 18,8 GB de VRAM solo para los pesos, más overhead de activaciones y memoria del runtime. En la práctica, se recomienda una GPU con al menos 24 GB de VRAM para inferencia en FP16.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40 GB, A100 80 GB, H100 80 GB o superiores. En GPUs de 16 GB (como RTX 4080 o RTX 3090) solo sería viable con cuantización, pero no se han publicado cuantizaciones para este modelo.
- No cabe en GPUs de consumo de gama baja (8-12 GB) sin cuantización, y no se dispone de archivos GGUF ni AWQ en el repositorio.
- Opciones de despliegue: al ser un checkpoint intermedio y sin cuantizaciones, las opciones estándar serían vLLM, TGI o Transformers con `from_pretrained`, siempre que se cargue en FP16 o BF16. No se recomienda su uso en producción.
- Latencia y throughput: no disponibles. Dependerán del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo base `Qwen/Qwen3.5-9B-Base` es el punto de referencia natural, pero no se han publicado métricas de rendimiento para este checkpoint. Tampoco se conocen otros checkpoints del mismo barrido con los que comparar directamente. Se indica "no disponible" para cualquier comparación cuantitativa.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final. Su rendimiento puede ser inferior al de un modelo entrenado hasta convergencia, y puede presentar inestabilidades propias de una fase temprana de entrenamiento.
- Sin licencia declarada: el uso comercial, la redistribución o la modificación del modelo están sujetos a una licencia no especificada. Se recomienda contactar al autor antes de cualquier uso fuera de investigación.
- Sin evaluación publicada: no hay benchmarks ni métricas de calidad, por lo que se desconoce su comportamiento real en tareas estándar.
- Riesgo de alucinación y sesgos: al ser un fine-tuning de un modelo base, puede heredar sesgos del corpus original y del conjunto de datos generado por `claude-opus-5`. No se ha realizado ninguna auditoría de sesgos.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni los idiomas soportados. Se asume que hereda las del modelo base Qwen3.5-9B-Base, pero sin confirmación.
- Sobreajuste potencial: al ser un checkpoint de SFT continuado, existe riesgo de sobreajuste a los datos de entrenamiento, especialmente si el conjunto de datos generado es limitado o muy específico.
- No apto para producción: la ausencia de licencia, cuantizaciones y evaluación lo desaconseja para cualquier despliegue en entornos reales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/agentic-ptb/opus-max.h043.sft_cont2.step_900
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
