# agentic-ptb/opus-max.hNA.sft_v5.step_720

## Resumen

`agentic-ptb/opus-max.hNA.sft_v5.step_720` es un checkpoint intermedio de un proceso de entrenamiento por ajuste fino supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El modelo fue generado por un agente autónomo (Claude Code / claude-opus-5 con razonamiento en nivel `max`) dentro de un barrido experimental denominado AgentPTB, y corresponde a la celda `opus-max` en el paso 720 del entrenamiento. Con 9.409.813.744 parámetros (~9,4B), se trata de un modelo de tamaño medio pensado para experimentación, no para despliegue en producción.

La relevancia de este checkpoint reside en su origen: es un artefacto de un pipeline de entrenamiento dirigido por agentes, lo que lo convierte en un caso de estudio para la comunidad que investiga la generación automática de modelos. Sin embargo, la información pública es muy limitada: no se especifica licencia, idiomas, ni capacidades concretas, y el repositorio no registra descargas ni valoraciones. El modelo se distribuye en formato `safetensors` con 4 shards y un tamaño de repositorio de 18,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

La arquitectura no está documentada en la ficha del modelo. Dado que el modelo base es `Qwen/Qwen3.5-9B-Base`, se puede inferir que hereda la arquitectura transformer de la familia Qwen3.5, pero no hay confirmación explícita en la información disponible. El checkpoint corresponde a un paso intermedio (step 720) de un ajuste fino supervisado (SFT) dentro de un barrido experimental llamado AgentPTB.

El proceso de entrenamiento fue dirigido por un agente autónomo (Claude Code / claude-opus-5) con nivel de razonamiento `max`, según la model card. No se proporcionan datos sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas adicionales como RLHF o DPO. El campo `eos_token_id` se indica como correcto con los valores `[248044, 248046]`, lo que sugiere que la configuración de tokens de fin de secuencia fue verificada.

## Capacidades

No se han documentado capacidades específicas para este checkpoint en la información disponible. Al tratarse de un ajuste fino sobre `Qwen/Qwen3.5-9B-Base`, podría heredar las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.), pero no hay confirmación ni evaluación publicada. El repositorio no incluye ejemplos de uso, demos ni documentación de funcionalidades.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado su carácter de checkpoint intermedio de un experimento de investigación, no se recomienda su uso en aplicaciones reales. Posibles escenarios, siempre bajo responsabilidad del usuario y sin garantías:

- Investigación sobre entrenamiento dirigido por agentes: el modelo puede servir como artefacto de estudio para analizar cómo un agente autónomo genera checkpoints de SFT.
- Reproducción de experimentos: investigadores del proyecto AgentPTB podrían utilizarlo para replicar o comparar resultados del barrido.
- Fine-tuning adicional: al ser un checkpoint intermedio, podría servir como punto de partida para continuar el entrenamiento con otros datasets.
- Evaluación comparativa de checkpoints: comparar este paso (720) con otros pasos del mismo barrido para estudiar la evolución del entrenamiento.
- Análisis de calidad de datos: inspeccionar las salidas del modelo para evaluar la calidad del dataset SFT generado por el agente.
- Pruebas de alineación de tokens: verificar la configuración de `eos_token_id` y otros parámetros de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4B parámetros en precisión FP16, se necesitan aproximadamente 19 GB de VRAM para cargar los pesos completos. Con cuantización a 8 bits se reduciría a ~10 GB, y a 4 bits a ~5-6 GB, aunque no se ofrecen archivos cuantizados en el repositorio.
- GPU recomendadas: para FP16, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) sería suficiente. Para cuantización 4 bits, una RTX 3060 de 12 GB o similar podría bastar.
- Compatibilidad con GPU de consumo: sí, en cuantización 4 bits cabría en GPUs de consumo con 8-12 GB de VRAM, pero no se proporcionan archivos GGUF ni cuantizados.
- Opciones de despliegue: al estar en formato safetensors, se puede cargar con bibliotecas como Transformers, vLLM o TGI, previa conversión. No hay soporte directo documentado para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| agentic-ptb/opus-max.hNA.sft_v5.step_720 | 9,4B | no disponible | no disponible | HuggingFace (checkpoint intermedio) |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | HuggingFace (modelo base) |
| Qwen/Qwen3-8B (referencia de la familia) | 8B | 32K (típico en Qwen3) | Apache 2.0 (típico) | HuggingFace |

La comparativa es limitada porque no se dispone de datos de rendimiento ni de licencia para este checkpoint. El modelo base `Qwen/Qwen3.5-9B-Base` es la referencia más directa, pero su ficha tampoco está disponible en la información proporcionada. No se puede establecer una comparación rigurosa sin benchmarks.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo finalizado; fue diseñado como paso intermedio de un barrido experimental y puede presentar comportamientos incompletos o inconsistentes.
- Sin licencia especificada: no se indica bajo qué términos se distribuye, lo que impide su uso comercial o incluso académico sin aclaración legal.
- Sin documentación de capacidades: no se describen tareas soportadas, idiomas ni límites de contexto, lo que dificulta cualquier uso fiable.
- Riesgo de alucinación: al ser un modelo de lenguaje sin evaluación publicada, es probable que genere contenido falso o inventado, especialmente en tareas de razonamiento o factualidad.
- Sin benchmarks: no hay evidencia de rendimiento en tareas estándar, por lo que no se puede garantizar calidad alguna.
- Origen experimental: el entrenamiento fue dirigido por un agente autónomo, lo que introduce incertidumbre sobre la calidad y coherencia del dataset SFT utilizado.
- No apto para producción: la ausencia de licencia, documentación y evaluación lo desaconseja completamente para entornos reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/opus-max.hNA.sft_v5.step_720
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base (referencia, no verificado en la información proporcionada)
