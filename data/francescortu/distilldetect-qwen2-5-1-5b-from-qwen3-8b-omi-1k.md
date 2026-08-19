# francescortu/DistillDetect-Qwen2.5-1.5B-from-Qwen3-8B-OMI-1K

## Resumen

DistillDetect-Qwen2.5-1.5B-from-Qwen3-8B-OMI-1K es una reproducción no oficial del modelo estudiante descrito en el artículo *Reference-Based Distillation Detection in LLMs* (Rawat et al., arXiv:2607.09692). El modelo, desarrollado por francescortu, tiene como objetivo detectar si un texto ha sido generado mediante destilación de conocimiento, comparando la salida con una referencia. Para ello, se parte del modelo base Qwen/Qwen2.5-1.5B y se entrena con 1000 respuestas generadas por un profesor Qwen/Qwen3-8B sobre prompts de OpenMathInstruct-2.

La relevancia de este modelo radica en que aborda un problema emergente en la seguridad y auditoría de modelos de lenguaje: identificar cuándo un texto ha sido producido por un modelo destilado, lo que puede ser útil para detectar plagio o uso indebido de modelos propietarios. Al ser una reproducción independiente, no cuenta con el respaldo oficial de los autores del paper, pero ofrece una implementación funcional basada en el código y los datos liberados por estos.

Con 1.543.714.304 parámetros (aproximadamente 1.5B), es un modelo compacto que puede ejecutarse en hardware de consumo. La licencia es Apache 2.0, lo que permite uso comercial y modificación. Sin embargo, no se han publicado resultados de evaluación en GSM8K o MATH500, por lo que su rendimiento real aún no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5 (decoder-only transformer denso) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5 soporta hasta 128K, pero no se especifica para este modelo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only denso con 1.5B parámetros. El entrenamiento se realizó mediante fine-tuning supervisado (SFT) utilizando los scripts oficiales del paper, con los siguientes hiperparámetros: 3 épocas, tasa de aprendizaje 1e-5, programación coseno con 5% de warmup, tamaño de lote efectivo 16 (per-device batch 4 con grad-accum 4), tamaño de bloque 4096, precisión bf16 y gradient checkpointing. La pérdida se calcula únicamente sobre los tokens de respuesta, enmascarando el prompt con -100.

Los datos de entrenamiento consisten en 1000 respuestas generadas por el profesor Qwen/Qwen3-8B a partir de prompts de OpenMathInstruct-2, redistribuidas por los autores del paper bajo licencia MIT. El formato de prompt es `Problem:\n{question}\n\nSolution:\n`. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; se trata de un fine-tuning supervisado estándar.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje, puede generar texto, aunque su propósito principal es la detección de destilación.
- Detección de destilación: según el paper, el modelo está entrenado para clasificar si un texto ha sido generado por un modelo destilado, comparándolo con una referencia.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión o audio.
- El modelo hereda las capacidades lingüísticas del base Qwen2.5, pero no se especifican los idiomas soportados en esta reproducción.

## Casos de uso

No se han documentado casos de uso específicos en la model card. Dado el propósito del paper, el modelo podría emplearse en:

- Investigación académica sobre detección de destilación en modelos de lenguaje.
- Auditoría de contenido generado por IA para identificar si proviene de un modelo destilado.
- Verificación de integridad en pipelines de generación de texto donde se requiere trazabilidad del origen del modelo.

Sin embargo, al no existir evaluación publicada, estos usos son hipotéticos y requieren validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados de GSM8K y MATH500 están pendientes de cálculo.

## Requisitos de hardware

No se proporcionan requisitos oficiales. Dado el tamaño del modelo (1.5B parámetros), se puede estimar:

- VRAM estimada: aproximadamente 3 GB en FP16, 1.5 GB en int8, y menos de 1 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1660, RTX 2060, RTX 3060) puede ejecutar el modelo en cuantización ligera.
- Opciones de despliegue: compatible con frameworks como vLLM, llama.cpp, Ollama o TGI, aunque no se ha verificado su compatibilidad específica.
- Latencia y throughput: no disponibles.

Estas cifras son estimaciones basadas en el tamaño del modelo y no en mediciones reales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de destilación). El modelo base Qwen2.5-1.5B es un modelo de propósito general, pero no está especializado en esta tarea. Por tanto, no se puede establecer una comparativa directa.

## Limitaciones y advertencias

- Reproducción no oficial: no está afiliada a los autores del paper, por lo que puede haber diferencias con el modelo original.
- Sin evaluación publicada: no hay resultados de benchmarks que verifiquen su rendimiento en tareas de detección.
- Entrenamiento con datos limitados: solo 1000 prompts, lo que puede limitar su generalización a otros dominios o estilos de texto.
- Riesgo de alucinación: como cualquier modelo de lenguaje pequeño, puede generar respuestas incorrectas o inventadas.
- Licencia: Apache 2.0 permite uso comercial, pero la redistribución de los datos de entrenamiento (bajo MIT) debe respetar los términos de esa licencia.
- Contexto no especificado: aunque el base soporta 128K tokens, el entrenamiento con block size 4096 podría limitar el contexto efectivo.

## Enlaces

- [HuggingFace - DistillDetect-Qwen2.5-1.5B-from-Qwen3-8B-OMI-1K](https://huggingface.co/francescortu/DistillDetect-Qwen2.5-1.5B-from-Qwen3-8B-OMI-1K)
- [Paper arXiv:2607.09692](https://arxiv.org/abs/2607.09692)
- [Repositorio GitHub de los autores](https://github.com/RajatRawat-creator/DistillDetect)
- [Modelo base Qwen/Qwen2.5-1.5B](https://huggingface.co/Qwen/Qwen2.5-1.5B)
