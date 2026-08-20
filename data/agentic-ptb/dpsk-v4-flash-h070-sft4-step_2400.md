# agentic-ptb/dpsk-v4-flash.h070.sft4.step_2400

## Resumen

`dpsk-v4-flash.h070.sft4.step_2400` es un checkpoint intermedio de un proceso de fine-tuning supervisado (SFT) desarrollado por el usuario `agentic-ptb` como parte de un barrido de hiperparámetros (sweep) denominado AgentPTB. El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y está etiquetado con el nombre de celda `dpsk-v4-flash`, lo que sugiere una variante inspirada en DeepSeek v4-flash, aunque no se aportan detalles sobre la metodología de entrenamiento ni sobre el dataset utilizado.

Con aproximadamente 9.410 millones de parámetros, este checkpoint se posiciona en la gama de modelos de 9B, y su configuración de razonamiento está fijada en modo `thinking`, lo que indica que el modelo está orientado a tareas de razonamiento multi-paso. Sin embargo, al tratarse de un artefacto intermedio (paso 2400 de un total no especificado), no está pensado para uso en producción, sino como material de investigación para continuar entrenamiento o evaluar la evolución del fine-tuning.

La relevancia de este modelo es limitada fuera del contexto del proyecto AgentPTB: no se han publicado benchmarks, licencia, idiomas soportados ni documentación de capacidades. Su principal interés radica en ser un ejemplo de checkpoint de SFT sobre Qwen3.5-9B-Base con un token EOS incompleto, lo que constituye una advertencia técnica importante para quien desee utilizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) sobre `Qwen/Qwen3.5-9B-Base`, una arquitectura transformer densa de 9.4B parámetros. El checkpoint corresponde al paso 2400 de un barrido de hiperparámetros llamado AgentPTB, con la celda `dpsk-v4-flash` y un "driver" identificado como `pi / DeepSeek v4-flash`. El modo de razonamiento está configurado como `thinking`, lo que sugiere que el entrenamiento se orientó a mejorar la capacidad de razonamiento explícito del modelo.

No se dispone de información sobre el dataset de entrenamiento, el número total de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El checkpoint fue recuperado de una copia de seguridad (`msr-spare`) tras ser podado del almacenamiento principal, y presenta una anomalía en el token EOS: solo se define `248044`, faltando el token `248046` que probablemente corresponda al token de fin de secuencia estándar de Qwen3.5. Esta ausencia puede provocar generaciones que no terminen correctamente.

## Capacidades

- Razonamiento multi-paso: el modo `thinking` indica que el modelo está configurado para generar cadenas de razonamiento antes de responder, aunque no se ha verificado su eficacia.
- Hereda las capacidades del modelo base Qwen3.5-9B-Base (generación de texto, código, matemáticas, multilingüismo), pero no se ha confirmado que el fine-tuning las preserve o mejore.
- No se ha documentado soporte para tool calling, function calling, agentes, visión o audio.
- No se ha especificado el alcance multilingüe del fine-tuning.

## Casos de uso

- Investigación de fine-tuning: este checkpoint es útil para estudiar la evolución del entrenamiento en el paso 2400, comparando su comportamiento con checkpoints anteriores y posteriores del mismo sweep.
- Continuación del entrenamiento: puede servir como punto de partida para reanudar el SFT si se dispone del dataset original y de la configuración de entrenamiento.
- Análisis de degradación de tokens EOS: permite investigar el impacto de un token EOS incompleto en la generación y proponer correcciones.
- Evaluación de técnicas de razonamiento: al estar configurado en modo `thinking`, puede usarse para probar metodologías de prompting que aprovechen cadenas de razonamiento explícitas.
- Benchmarking de modelos intermedios: para medir la progresión de métricas (p. ej., MMLU, HumanEval) a lo largo del entrenamiento, aunque no se han publicado resultados.
- Reproducción de experimentos: como artefacto de un sweep reproducible, permite a otros investigadores replicar o extender el trabajo de AgentPTB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.4B parámetros en FP16, se necesitan aproximadamente 19 GB de VRAM. En cuantización de 8 bits, unos 10 GB; en 4 bits, unos 5 GB. Sin embargo, no se han publicado cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (p. ej., RTX 3090, RTX 4090, A10G) para inferencia en FP16. Para cuantización de 4 bits, una GPU de 8-12 GB podría ser suficiente, pero no hay archivos GGUF disponibles.
- No cabe en GPUs de consumo de gama baja (menos de 8 GB) sin cuantización, y no se han proporcionado versiones cuantizadas.
- Opciones de despliegue: al ser un checkpoint intermedio sin cuantizaciones, las opciones son limitadas. Se podría usar con vLLM o TGI si se convierte a los formatos adecuados, o con llama.cpp si se genera un GGUF manualmente. No hay soporte directo en Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dpsk-v4-flash (este) | 9.4B | no disponible | no disponible | HuggingFace (checkpoint intermedio) |
| Qwen/Qwen3.5-9B-Base | 9.4B | no disponible | no disponible | HuggingFace |
| Llama 3.1 8B | 8.0B | 128K | Llama 3.1 Community License | HuggingFace |

La comparación es limitada porque no se dispone de datos de rendimiento ni de contexto para este checkpoint. Frente a su modelo base, la única diferencia conocida es el fine-tuning SFT y la anomalía en el token EOS. Frente a Llama 3.1 8B, no hay métricas que permitan una comparación objetiva.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al de un modelo completamente entrenado y no está validado para uso en producción.
- Token EOS incompleto: falta el token `248046`, lo que puede provocar que el modelo no termine las secuencias correctamente o genere texto indefinidamente.
- Sin licencia especificada: no se puede determinar si su uso comercial está permitido; se recomienda contactar al autor antes de cualquier uso.
- Sin idiomas documentados: no se sabe qué idiomas soporta el fine-tuning, aunque el modelo base Qwen3.5 es multilingüe.
- Sin benchmarks: no hay evidencia de su calidad en tareas estándar.
- Sin cuantizaciones: solo se dispone de pesos en safetensors, lo que limita su despliegue en hardware modesto.
- Origen de recuperación: el checkpoint fue recuperado de una copia de seguridad tras ser podado, por lo que podría haber corrupción de datos no detectada.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h070.sft4.step_2400
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio de origen (referenciado en la model card): `msr-spare/msr-agentic-ptb-dpsk-sft4-intermediates` (no se ha encontrado un enlace directo)
