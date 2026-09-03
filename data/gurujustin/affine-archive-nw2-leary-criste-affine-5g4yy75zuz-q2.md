# gurujustin/affine-archive-nw2-leary-criste-affine-5g4yy75zuz-q2

## Resumen

Este repositorio es una copia de archivo, sin modificaciones, del checkpoint `affine-5g4yy75zuz-q2` originalmente publicado por el autor `leary-criste` (David Winn) como parte de una submission al subnet SN120 de Bittensor, denominado "Affine". El checkpoint fue un "near-winner" en la competición del 30 de agosto de 2026, perdiendo por un margen de +0,00112 con un z-score de 1,61. El repositorio original fue eliminado, y esta copia se mantiene para preservar la disponibilidad del modelo.

El modelo presenta una arquitectura MoE (Mixture of Experts) basada en Qwen 3.5, según la etiqueta `qwen3_5_moe`, con un total de 35.107.181.936 parámetros (aproximadamente 35,1B) y un tamaño de repositorio de 70,2 GB en formato safetensors. No se dispone de información sobre la licencia, los idiomas soportados, la longitud de contexto ni los parámetros activos, ya que la model card del autor solo documenta el contexto de archivado y la competición de Bittensor. Dado que se trata de una submission de SN120, es probable que el modelo haya sido entrenado específicamente para la tarea que evalúa ese subnet, pero esa información no está disponible en los datos proporcionados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen 3.5 (`qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 (~35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (formato original, presumiblemente BF16/FP16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo es MoE (Mixture of Experts) según la etiqueta `qwen3_5_moe`, lo que indica que se basa en la familia Qwen 3.5 con un diseño de expertos dispersos. Con 35,1B de parámetros totales en una configuración MoE, es probable que los parámetros activos por token sean significativamente menores, aunque este dato no se ha documentado en la información disponible.

Los detalles del entrenamiento son prácticamente desconocidos. El modelo fue presentado como submission al subnet SN120 de Bittensor (red "Affine"), lo que sugiere que fue entrenado o ajustado específicamente para la tarea que evalúa dicho subnet. No se dispone de información sobre el dataset de entrenamiento, número de tokens, o si se emplearon técnicas como RLHF, DPO o SFT. Tampoco se documentan innovaciones técnicas específicas más allá de la arquitectura base Qwen 3.5 MoE. El checkpoint fue evaluado en un "duelo" de validación del subnet, donde obtuvo un resultado de near-winner con margen de +0,00112 y z-score de 1,61, lo que indica un rendimiento competitivo pero no ganador.

## Capacidades

- Generación de texto: como modelo basado en Qwen 3.5 MoE, se espera capacidad de generación de lenguaje natural, aunque no hay documentación específica en la model card.
- Razonamiento y matemáticas: presumiblemente hereda las capacidades de la familia Qwen 3.5, aunque no hay benchmarks publicados que lo confirmen.
- Codigo: no hay evidencia documentada de capacidades específicas de generación de codigo.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingues: no disponible; no se especifican idiomas soportados.
- Capacidades especiales (vision, audio, thinking mode): no documentado.
- Tarea especifica de SN120 (Affine): el modelo fue evaluado en el contexto del subnet Bittensor SN120, lo que sugiere que fue optimizado para una tarea concreta de ese ecosistema, pero la naturaleza exacta de esa tarea no está documentada en la información proporcionada.

## Casos de uso

- Preservacion de checkpoints de investigacion: este repositorio sirve como archivo permanente de un checkpoint que de otro modo se habria perdido al eliminar el repositorio original. Investigadores pueden acceder al modelo para reproducir o analizar la submission de SN120.
- Analisis de modelos MoE en el ecosistema Bittensor: el modelo puede utilizarse para estudiar como se entrenan y evalúan las submissions en subnets de Bittensor, comparando arquitecturas y resultados de validación.
- Evaluacion comparativa de arquitecturas Qwen 3.5 MoE: investigadores pueden utilizar este checkpoint para comparar el rendimiento de una variante MoE de Qwen 3.5 con otras implementaciones de la misma familia.
- Investigacion sobre competiciones de modelos descentralizadas: el historial de duelo documentado (margen +0,00112, z 1,61) permite estudiar como se calibran y evalúan modelos en entornos de validación competitiva.
- Fine-tuning posterior: al ser un checkpoint completo en safetensors, puede servir como punto de partida para fine-tuning en tareas especificas, siempre que la licencia lo permita (actualmente no especificada).
- Replicacion de resultados: el commit exacto documentado (`f15e4a2c524f2f606d01d47c3f48ca94f30f42b3`) permite replicar exactamente el modelo que participó en el duelo de validación.
- Estudios de arquitectura MoE a escala de 35B: el modelo permite investigar el comportamiento de MoE con 35,1B de parámetros totales, incluyendo analisis de sparse expert routing y eficiencia de parámetros activos.
- Comparacion con modelos densos de tamano similar: puede utilizarse para comparar el rendimiento de una arquitectura MoE frente a modelos densos de ~35B en tareas de razonamiento y generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento documentados son los resultados del duelo de validación de SN120: el modelo fue "near-winner" el 30 de agosto de 2026, con un margen de +0,00112 y un z-score de 1,61. Los registros de evaluación y duelos están disponibles en el enlace S3 indicado en la model card, pero no se han analizado en la información proporcionada.

No se dispone de resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: ~70 GB (el tamaño del repositorio de 70,2 GB sugiere pesos en precisión completa BF16/FP16). Esto requiere una GPU A100 80GB o un sistema multi-GPU.
- VRAM estimada con cuantizacion 8-bit: ~35 GB, cabría en una RTX 4090 (24 GB no es suficiente), se necesitaría una A6000 48GB o similar.
- VRAM estimada con cuantizacion 4-bit: ~17,5 GB, cabría en una RTX 4090 o RTX 3090, aunque habría que generar los archivos GGUF o GPTQ desde los safetensors originales.
- GPUs recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU (2x RTX 4090) para inferencia en precisión completa.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se convierte a GGUF). No se han publicado configuraciones de despliegue especificas.
- Latencia y throughput: no disponible. Dependerá de la cuantizacion, el número de parámetros activos (desconocido) y el hardware utilizado.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo pertenece a la familia Qwen 3.5 MoE, pero no hay información publicada sobre benchmarks que permita compararlo con alternativas como Qwen 3 MoE, DeepSeek MoE u otros modelos de ~35B. La comparación con otros modelos de la familia Qwen 3.5 o con modelos MoE de tamaño similar no es posible sin datos de rendimiento.

Se puede señalar que el autor `leary-criste` publicó otro checkpoint relacionado, `affine-5g4yy75zuz-t1`, del cual no se dispone de información adicional en los resultados de búsqueda. La diferencia entre las variantes `-q2` y `-t1` no está documentada.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial, la redistribución y la modificación del modelo no están definidos. Cualquier uso en producción requiere aclarar la licencia con el autor original o considerar el modelo como de uso restringido.
- Sin documentacion de capacidades: no se conocen los idiomas soportados, la longitud de contexto ni las capacidades exactas del modelo. Su uso en aplicaciones reales es arriesgado sin esta información.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar (MMLU, HumanEval, etc.), lo que impide evaluar su calidad relativa.
- Riesgo de alucinacion y sesgos: al ser un modelo basado en Qwen 3.5, podría heredar sesgos conocidos de esa familia, pero no hay datos específicos disponibles.
- Contexto de origen especifico: el modelo fue entrenado como submission de un subnet de Bittensor, lo que significa que puede estar sobreoptimizado para la tarea de SN120 y tener un rendimiento inferior en tareas generales.
- Repositorio de archivo: este no es el repositorio original del autor, sino una copia de preservación. No hay garantía de mantenimiento, actualizaciones o soporte.
- Fecha de creacion futura: el modelo fue creado el 3 de septiembre de 2026, lo que indica que es un modelo reciente y su ecosistema de soporte (frameworks, herramientas de cuantizacion) puede no estar completamente maduro.
- Parametros activos desconocidos: al ser una arquitectura MoE, el número de parámetros activos por token es crítico para estimar requisitos de hardware, pero este dato no está disponible.

## Enlaces

- Repositorio de archivo en HuggingFace: https://huggingface.co/gurujustin/affine-archive-nw2-leary-criste-affine-5g4yy75zuz-q2
- Repositorio original (posiblemente eliminado): https://huggingface.co/leary-criste/affine-5g4yy75zuz-q2
- Modelo relacionado del mismo autor: https://huggingface.co/leary-criste/affine-5g4yy75zuz-t1
- Perfil del autor original: https://huggingface.co/leary-criste/models
- Registros de evaluacion y duelos de SN120: https://s3.hippius.com/affine-sn120/evals/index.jsonl
