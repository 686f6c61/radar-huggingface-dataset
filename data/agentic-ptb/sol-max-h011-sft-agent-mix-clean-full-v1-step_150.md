# agentic-ptb/sol-max.h011.sft-agent-mix-clean-full-v1.step_150

## Resumen

Este modelo es un checkpoint intermedio de un experimento de fine-tuning supervisado (SFT) orientado a agentes, desarrollado por el equipo `agentic-ptb`. Se basa en el modelo `Qwen/Qwen3.5-9B-Base` y forma parte de un barrido (sweep) de 100 horas denominado AgentPTB. El checkpoint corresponde a la hora 11.3 del experimento, con el identificador de celda `sol-max`, que indica que los datos de entrenamiento fueron generados por un driver basado en Codex/gpt-5.6-sol con esfuerzo de razonamiento máximo. Con 9.409.813.744 parámetros (9,4B), este modelo está diseñado para explorar capacidades agenticas, aunque su naturaleza intermedia lo convierte en una herramienta de investigación más que en un producto final.

El repositorio contiene los pesos en formato safetensors (18,8 GB) y no incluye información sobre licencia, idiomas soportados ni pipeline de uso. El entrenamiento se detuvo prematuramente alrededor de la hora 16 del experimento, por lo que este checkpoint no representa un modelo completamente entrenado. Su relevancia radica en ser un punto de referencia dentro de un estudio sistemático sobre cómo los datos generados por modelos de razonamiento extremo afectan al fine-tuning de modelos más pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, probablemente 128k, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9,4B parámetros. El fine-tuning se realizó mediante SFT (supervised fine-tuning) sobre una mezcla de datos agenticos denominada `agent-mix-clean-full-v1`. Según la model card, el driver de generación de datos fue Codex/gpt-5.6-sol con esfuerzo de razonamiento `max`, lo que sugiere que los ejemplos de entrenamiento incluyen trazas de razonamiento extensas y posiblemente llamadas a herramientas.

El checkpoint se escribió a las 11,3 horas de un run de 100 horas, y el experimento murió alrededor de la hora 16, por lo que el entrenamiento quedó incompleto. No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El `eos_token_id` está correctamente configurado con `[248044, 248046]`, lo que garantiza que el modelo detiene la generación al final de cada turno.

## Capacidades

- Generacion de texto y razonamiento: al ser un fine-tuning de Qwen3.5-9B-Base, conserva las capacidades base de generacion de texto, razonamiento y comprension multilingue, aunque no hay documentacion especifica sobre el alcance tras el fine-tuning.
- Orientacion a agentes: el dataset de entrenamiento (`agent-mix-clean-full-v1`) sugiere que el modelo ha sido expuesto a trazas de agentes, lo que podria mejorar su capacidad para seguir instrucciones multi-paso y realizar tool calling, aunque no hay evidencia publicada.
- Soporte de tool calling: no confirmado explicitamente, pero probable dado el contexto del fine-tuning.
- Capacidades multilingues: no especificadas, pero heredadas del modelo base Qwen3.5-9B-Base, que soporta multiples idiomas.
- Modo thinking: no disponible; el modelo base no incluye un modo de razonamiento explicito.

## Casos de uso

- Investigacion en modelos agenticos: este checkpoint es util para estudiar como evoluciona el rendimiento de un modelo de 9,4B cuando se entrena con datos generados por un modelo de razonamiento extremo (gpt-5.6-sol con effort max). Los investigadores pueden comparar este checkpoint con otros del mismo sweep para trazar curvas de aprendizaje.
- Evaluacion de checkpoints intermedios: permite analizar el efecto del numero de pasos de entrenamiento en tareas de agente, como benchmark de referencia para futuros experimentos.
- Fine-tuning adicional: puede servir como punto de partida para un segundo fine-tuning con datos mas especificos, aprovechando el conocimiento adquirido en la mezcla agentica.
- Desarrollo de pipelines de SFT: el repositorio documenta la configuracion de `eos_token_id`, lo que lo convierte en un ejemplo util para quienes implementan pipelines de fine-tuning con Qwen3.5.
- Comparacion de estrategias de generacion de datos: al estar etiquetado con el driver y el esfuerzo de razonamiento, permite estudiar el impacto de la calidad de los datos sinteticos en el rendimiento final.
- Pruebas de infraestructura: su tamano (18,8 GB) y formato safetensors lo hacen adecuado para probar sistemas de despliegue y cuantizacion en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion, y los resultados de busqueda web no proporcionan datos especificos sobre este checkpoint. Dado que es un checkpoint intermedio de un experimento fallido (el entrenamiento murio a las ~16 horas), es probable que no se hayan realizado evaluaciones formales.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parametros en FP16, se necesitan aproximadamente 19 GB de VRAM. Con cuantizacion 4-bit, podria reducirse a unos 6-8 GB, pero no hay cuantizaciones publicadas en el repo.
- GPU recomendadas: una RTX 4090 (24 GB) o una A100 (40 GB) serian adecuadas para inferencia en FP16. Para cuantizacion, una RTX 3090 (24 GB) o inferior podria ser suficiente.
- Si cabe en consumer GPU: si, con cuantizacion 4-bit o 8-bit, cabria en GPUs de 12-16 GB, pero no se proporcionan archivos GGUF ni AWQ en el repositorio.
- Opciones de despliegue: al ser safetensors, se puede usar con vLLM, Hugging Face Transformers, TGI o llama.cpp (si se convierte a GGUF). No hay integraciones preconfiguradas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/sol-max.h011 (este) | 9,4B | no disponible | no disponible | HuggingFace (checkpoint intermedio) |
| Qwen/Qwen3.5-9B-Base | 9,4B | 128k (tipico de Qwen3.5) | Apache 2.0 (probable) | HuggingFace |
| Qwen/Qwen3.5-9B-Instruct | 9,4B | 128k | Apache 2.0 (probable) | HuggingFace |

La comparativa se limita al modelo base y su version instruct, ya que no hay otros modelos agenticos de tamano similar con informacion publica en los resultados de busqueda. Este checkpoint se diferencia por estar orientado a agentes, pero carece de la madurez de los modelos instruct completos.

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento se detuvo a las ~16 horas de un run de 100 horas, por lo que el modelo no esta completamente entrenado y su rendimiento puede ser significativamente inferior al de un modelo final.
- Licencia no especificada: no se indica la licencia, lo que impide su uso comercial sin autorizacion explicita del autor.
- Idiomas no especificados: no se documenta que idiomas soporta, aunque hereda las capacidades del base.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido falso o inventado, especialmente en tareas de razonamiento complejo.
- Sesgos del modelo base: Qwen3.5-9B-Base puede tener sesgos culturales o linguisticos que se transmiten al fine-tuning.
- Sin benchmarks: no hay evidencia publicada de su rendimiento en tareas estandar, por lo que no se puede evaluar su calidad relativa.
- Reproducibilidad limitada: la model card indica que los paneles de evaluacion eran demasiado pequenos para clasificar, lo que sugiere que el experimento no fue concluyente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max.h011.sft-agent-mix-clean-full-v1.step_150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Referencia general sobre agentic AI (arXiv): https://arxiv.org/abs/2510.25445
- Informacion sobre GPT-5.6 (driver de datos): https://openai.com/index/gpt-5-6/
