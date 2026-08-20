# agentic-ptb/dpsk-v4-flash.hNA.sft4.step_2600

## Resumen

El modelo `agentic-ptb/dpsk-v4-flash.hNA.sft4.step_2600` es un checkpoint intermedio de un barrido de post-entrenamiento agéntico (AgentPTB) desarrollado por el usuario `agentic-ptb`. Se trata de un fine-tuning supervisado (SFT) del modelo base `Qwen/Qwen3.5-9B-Base`, con un total de 9.409.813.744 parametros. El nombre de la celda, `dpsk-v4-flash`, indica que el proceso de entrenamiento utiliza como "driver" un modelo DeepSeek v4-flash en modo de razonamiento "thinking", lo que sugiere que los datos de entrenamiento se generaron para imitar el razonamiento paso a paso de dicho modelo.

Es un artefacto de investigacion, no un modelo de produccion. Se encuentra en una etapa intermedia (step 2600 de la cuarta ronda de SFT) y fue recuperado de una copia de seguridad tras ser podado del almacenamiento principal. Presenta una anomalia critica en la configuracion del token de fin de secuencia (EOS), lo que limita su uso directo en aplicaciones reales sin una correccion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredado del base, no especificado) |
| Tipos de cuantizacion | No disponible (el tamano del repo, 18.8 GB, sugiere pesos en BF16/FP16, 2 bytes por parametro) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso basado en `Qwen/Qwen3.5-9B-Base`. No es un modelo MoE. El entrenamiento corresponde a una cuarta etapa de SFT (sft4) con 2600 pasos. El "driver" del proceso es `pi / DeepSeek v4-flash` con un esfuerzo de razonamiento "thinking", lo que implica que el dataset de entrenamiento probablemente consiste en trazas de razonamiento generadas por ese modelo, buscando transferir capacidades de razonamiento explicito a un modelo de 9B.

Se observa una anomalia critica en la configuracion de tokens: el `eos_token_id` configurado es `[248044]`, pero falta el token `248046`. Esto puede provocar problemas de terminacion de secuencia, generacion infinita o truncamiento incorrecto durante la inferencia. El checkpoint fue podado del PVC original y recuperado desde la copia de seguridad `msr-spare/msr-agentic-ptb-dpsk-sft4-step2600`, lo que introduce un riesgo adicional sobre la integridad de los pesos.

## Capacidades

- Generacion de texto y razonamiento: al derivar de Qwen3.5-9B-Base, hereda las capacidades base de generacion de texto, codigo, matematicas y razonamiento.
- Razonamiento "thinking": el checkpoint esta disenado para operar con un esfuerzo de razonamiento "thinking", por lo que se espera que genere cadenas de pensamiento explicitas antes de la respuesta final.
- Tool calling y funciones: no se especifica en la informacion proporcionada, aunque el modelo base Qwen3.5-9B-Base suele soportarlas; no se puede confirmar para este checkpoint.
- Capacidades multimodales: no se especifican (vision, audio, etc.). No hay evidencia de que las soporte.
- Multilingue: no se especifica. Depende del modelo base, pero no se confirma en la documentacion del checkpoint.

## Casos de uso

- Investigacion en post-entrenamiento agéntico: analizar como evoluciona el rendimiento en tareas de agente a lo largo de los pasos de SFT, comparando este checkpoint (step 2600) con otros pasos del mismo barrido.
- Destilación de razonamiento: estudiar como un modelo de 9B aprende a imitar el razonamiento paso a paso de DeepSeek v4-flash, evaluando la fidelidad de las cadenas de pensamiento generadas.
- Fine-tuning continuado: usar este checkpoint como punto de partida para etapas adicionales de SFT, DPO o RLHF, dado que es un checkpoint intermedio disenado para continuar el entrenamiento.
- Evaluacion de curvas de aprendizaje: trazar metricas de rendimiento (por ejemplo, exactitud en tareas de razonamiento) frente al numero de pasos de entrenamiento, utilizando este checkpoint como un punto de la curva.
- Prototipado de agentes con razonamiento: integrarlo en pipelines de agentes donde se requiera razonamiento multi-paso, aunque con cautela debido al problema del token EOS y a que no es un modelo de produccion.
- Analisis de robustez en generacion: estudiar el comportamiento del modelo cuando falta un token EOS, investigando fenomenos de generacion infinita o degradacion de la coherencia, util para la investigacion en seguridad de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18.8 GB en BF16/FP16 (cabe en una RTX 4090 de 24 GB, A100 de 40 GB, etc.).
- Con cuantizacion a 8 bits: aproximadamente 9.4 GB de VRAM (cabe en RTX 3090, RTX 4080, etc.).
- Con cuantizacion a 4 bits: aproximadamente 4.7 GB de VRAM (cabe en GPUs consumer de gama media como RTX 3060 o superiores).
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100, o cualquier GPU con al menos 20 GB de VRAM para inferencia sin cuantizar.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (tras conversion). Dado que es un checkpoint intermedio, se recomienda validar la integridad de los pesos antes del despliegue.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agentic-ptb/dpsk-v4-flash (este) | 9.4B | No disponible | Thinking (SFT sobre trazas) | No disponible | Checkpoint intermedio |
| Qwen/Qwen3.5-9B-Base | 9.4B | No disponible (tipicamente 32k-128k) | Base (sin fine-tuning especifico) | Apache 2.0 (tipicamente) | Produccion |
| DeepSeek-R1-Distill-Qwen-9B | 9.4B | 32k (tipico) | Razonamiento explicito (RL) | MIT (tipicamente) | Produccion |

Nota: la comparativa se basa en caracteristicas estructurales y de licencia tipicas de los modelos base mencionados, ya que no se dispone de benchmarks publicados para este checkpoint concreto. La licencia y el contexto de este modelo no estan especificados en la informacion proporcionada.

## Limitaciones y advertencias

- Token EOS incompleto: el `eos_token_id` configurado es `[248044]` y falta el token `248046`. Esto puede causar generacion infinita, respuestas truncadas o comportamiento erratico al finalizar secuencias. Es imprescindible corregir esta configuracion antes de cualquier uso.
- Checkpoint intermedio: no es un modelo final de produccion. Su rendimiento en tareas reales no ha sido validado y puede ser significativamente inferior al de un modelo completo.
- Licencia no especificada: al no indicarse la licencia, no se puede garantizar el uso comercial ni la redistribucion. Se debe contactar con el autor antes de cualquier uso fuera de investigacion.
- Integridad de los datos: el checkpoint fue recuperado de una copia de seguridad tras ser podado del PVC original. No se ha verificado la integridad de los pesos, por lo que existe un riesgo de corrupcion.
- Sesgos y alucinaciones: al ser un fine-tuning de Qwen3.5-9B-Base, hereda los sesgos y riesgos de alucinacion del modelo base, agravados por la falta de evaluacion especifica de este checkpoint.
- Idiomas y contexto: no se especifican los idiomas soportados ni la longitud de contexto efectiva, lo que impide garantizar su comportamiento en entornos multilingues o con contextos largos.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.hNA.sft4.step_2600
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
