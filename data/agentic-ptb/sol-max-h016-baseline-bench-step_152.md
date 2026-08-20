# agentic-ptb/sol-max.h016.baseline-bench.step_152

## Resumen

El modelo `agentic-ptb/sol-max.h016.baseline-bench.step_152` es un checkpoint intermedio perteneciente a un barrido de entrenamiento (sweep) denominado AgentPTB, desarrollado por el usuario agentic-ptb. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones) y un tamaño de repositorio de 18,8 GB en formato safetensors. El identificador del repositorio codifica la hora de la ejecución: `h016` indica que fue escrito a las 3,68 horas de una ejecución planificada de 100 horas, con rol intermedio dentro del proceso.

Este checkpoint forma parte de la celda `sol-max-v2`, cuyo driver es Codex / gpt-5.6-sol con un nivel de razonamiento `max`. La ruta del checkpoint (`pi-agent-sft-v2`) sugiere que se trata de un ajuste fino supervisado orientado a agentes. Su relevancia radica en que permite estudiar la evolución del rendimiento a lo largo del tiempo de entrenamiento, ya que el repositorio está diseñado para mapear directamente sobre las curvas de evaluación del sweep. No es un modelo final para producción, sino una instantánea intermedia para análisis e investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada; modelo base Qwen/Qwen3.5-9B-Base |
| Parametros totales | 9.409.813.744 (9,4 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base Qwen/Qwen3.5-9B-Base, aunque no se detalla la arquitectura interna (probablemente transformer, pero no se confirma). El entrenamiento se enmarca en un barrido llamado AgentPTB, con la celda `sol-max-v2` y un driver basado en Codex / gpt-5.6-sol con esfuerzo de razonamiento máximo. La ruta del checkpoint (`pi-agent-sft-v2`) indica que se empleó un ajuste fino supervisado (SFT) orientado a tareas de agente. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El checkpoint se escribió a las 3,68 horas de una ejecución de 100 horas, y la model card confirma que el `eos_token_id` es correcto (248046, correspondiente a `<|im_end|>`), lo que garantiza que el modelo detiene correctamente sus turnos durante la evaluación.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- Al ser un fine-tuning de Qwen3.5-9B-Base, podría heredar las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.), pero no hay confirmación explícita.
- La ruta `pi-agent-sft-v2` sugiere un enfoque en tareas de agente, pero no se detallan funcionalidades concretas como tool calling o multi-step reasoning.
- No se menciona soporte multilingüe, visión ni otras modalidades.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: al ser un checkpoint intermedio, permite analizar cómo evoluciona el rendimiento a lo largo de las horas de entrenamiento, comparando con otros checkpoints de la misma celda.
- Estudio de la influencia del token EOS: la model card advierte que los checkpoints sin el `eos_token_id` correcto producen evaluaciones engañosas; este checkpoint lo tiene, por lo que sirve como referencia válida para comparaciones.
- Análisis de la curva de aprendizaje: los repositorios con el formato `{cell}.h{HHH}.{family}.{step}` se ordenan cronológicamente, facilitando el estudio de la progresión del modelo.
- Reproducción de experimentos: investigadores pueden descargar este checkpoint para replicar los resultados del sweep en su propio entorno.
- Desarrollo de pipelines de evaluación: al ser un checkpoint con EOS correcto, puede usarse para probar infraestructuras de evaluación sin los artefactos de otros checkpoints.
- No se recomienda su uso en producción por ser un modelo intermedio sin licencia ni documentación de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los números de evaluación de checkpoints sin el EOS correcto son un piso, pero este checkpoint sí lo tiene; sin embargo, no se proporcionan cifras concretas de rendimiento.

## Requisitos de hardware

- El tamaño del repositorio es de 18,8 GB, lo que corresponde aproximadamente al peso del modelo en FP16 (9,4 B parámetros × 2 bytes = 18,8 GB).
- Para inferencia en FP16 se necesitaría al menos 20 GB de VRAM, por lo que una GPU como la RTX 4090 (24 GB) o una A100 de 40 GB serían adecuadas.
- No se han publicado cuantizaciones, por lo que no hay opciones de menor VRAM documentadas.
- Opciones de despliegue: no se especifican, pero al ser un modelo basado en Qwen, podría usarse con vLLM, llama.cpp u Ollama, aunque no hay confirmación.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Al ser un checkpoint intermedio de un sweep, no hay datos de rendimiento frente a alternativas. Se podría comparar con el modelo base Qwen3.5-9B-Base, pero no se han publicado métricas de este checkpoint.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final; su uso en producción no está recomendado.
- No se especifica licencia, lo que impide su uso comercial sin autorización explícita.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de contexto.
- La model card advierte que los checkpoints sin el `eos_token_id` correcto sobrepasan la ventana de contexto; este checkpoint lo tiene, pero otros de la misma celda podrían no tenerlo.
- No se han publicado capacidades concretas, por lo que su comportamiento en tareas reales es incierto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max.h016.baseline-bench.step_152
- No se han encontrado otros enlaces específicos (papers, blogs, demos) en la información proporcionada.
