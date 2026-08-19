# Saniya-s/vlm-mulkiya-extraction-v2-7b-new

## Resumen

El modelo `vlm-mulkiya-extraction-v2-7b-new` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Saniya-s, que se ajusta sobre el modelo base multimodal Qwen/Qwen2-VL-7B-Instruct. El nombre sugiere una finalidad orientada a la extracción de información (posiblemente de documentos o imágenes), aunque la model card no proporciona una descripción funcional explícita. Se distribuye bajo licencia Apache-2.0 y su repositorio ocupa 4,9 GB, correspondientes al adaptador entrenado con PEFT.

El modelo se publicó en agosto de 2026 y no cuenta con métricas de evaluación oficiales más allá de la pérdida de validación (0,0166) reportada durante el entrenamiento. La ausencia de documentación detallada limita su uso inmediato en producción; se requiere una evaluación independiente para determinar sus capacidades reales y su idoneidad en tareas concretas. Su relevancia radica en ser un ejemplo de fine-tuning eficiente sobre un modelo de visión-lenguaje de 7B parámetros, aunque la falta de transparencia sobre los datos de entrenamiento y los resultados de benchmark constituye una limitación importante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2-VL-7B-Instruct (transformer multimodal) |
| Parametros totales | No disponible (el adaptador no especifica el número de parámetros; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen2-VL-7B-Instruct) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

El modelo consiste en un adaptador LoRA entrenado sobre el modelo base Qwen2-VL-7B-Instruct, que es un transformer multimodal capaz de procesar texto e imágenes. El adaptador se generó con la librería PEFT (versión 0.20.0) y se entrenó durante 5 épocas con un learning rate de 0.0001, batch de entrenamiento de 1 y acumulación de gradientes de 8 (batch efectivo de 8). El optimizador fue AdamW (fusión torch) con scheduler lineal. La pérdida de validación final fue 0.0166.

No se especifica el dataset utilizado para el entrenamiento, ni se mencionan técnicas como RLHF o DPO. Tampoco se describen innovaciones técnicas adicionales más allá del propio fine-tuning con LoRA. La model card es una plantilla automática generada por el Trainer, por lo que la información sobre arquitectura interna, composición de datos y procedimiento de entrenamiento es mínima.

## Capacidades

- Al ser un adaptador sobre Qwen2-VL-7B-Instruct, hereda las capacidades del modelo base, que incluyen generación de texto, razonamiento multimodal (visión + lenguaje), y posiblemente soporte para tool calling y agentes (dependiendo de la configuración del modelo base).
- Sin embargo, no se documentan capacidades específicas del adaptador. El nombre "mulkiya-extraction" sugiere una especialización en extracción de datos, pero no hay evidencia pública que lo confirme.
- No se dispone de información sobre soporte de function calling, agentes o razonamiento multi-paso en esta versión ajustada.
- El pipeline declarado es `text-generation`, aunque el modelo base es multimodal; el adaptador podría haberse entrenado para tareas de extracción de información a partir de imágenes o documentos, pero esto no está verificado.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado el nombre y la naturaleza del adaptador, podría plantearse su empleo en tareas de extracción de información a partir de documentos visuales (facturas, formularios, tarjetas de identidad), pero esta hipótesis carece de respaldo en la información disponible. Antes de considerar cualquier aplicación práctica, es imprescindible realizar una evaluación exhaustiva del modelo en el dominio objetivo, comparando su rendimiento con el modelo base y con alternativas establecidas. Sin datos de benchmark ni descripción de la tarea, no es responsable sugerir escenarios de uso concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `results` del model-index está vacío y la model card solo reporta la pérdida de validación (0,0166), que no es comparable entre modelos. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA, el peso adicional es reducido, pero la inferencia requiere cargar el modelo base Qwen2-VL-7B-Instruct completo.
- Los requisitos de VRAM dependen de la cuantización del modelo base. En fp16, un modelo de 7B parámetros suele requerir alrededor de 14 GB de VRAM; con cuantización de 4 bits (por ejemplo, mediante bitsandbytes) puede reducirse a unos 4-6 GB.
- No se especifican GPUs recomendadas ni opciones de despliegue específicas para este adaptador. Se puede usar con frameworks compatibles con PEFT, como Transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama, siempre que se integre el adaptador sobre el modelo base.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El único punto de referencia razonable es el modelo base Qwen2-VL-7B-Instruct, pero no se han publicado métricas comparativas entre el adaptador y su base. Tampoco se conocen otros adaptadores LoRA con el mismo propósito o sobre el mismo modelo base en el momento de la consulta. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- La documentación es prácticamente inexistente: no se describe el dataset de entrenamiento, la tarea objetivo, ni las capacidades específicas del adaptador.
- No hay resultados de benchmarks, lo que impide evaluar su calidad objetiva.
- El riesgo de alucinación y de sesgos es desconocido, dado que no se ha auditado el modelo ni se han publicado análisis de sesgo.
- La licencia Apache-2.0 permite uso comercial, pero al no conocerse los datos de entrenamiento, podrían existir problemas de propiedad intelectual o de privacidad si se utilizó información sensible.
- Para producción, se recomienda encarecidamente realizar una validación independiente en el dominio de aplicación previsto antes de desplegar el modelo.

## Enlaces

- Repositorio en Hugging Face: [Saniya-s/vlm-mulkiya-extraction-v2-7b-new](https://huggingface.co/Saniya-s/vlm-mulkiya-extraction-v2-7b-new)
- Modelo base: [Qwen/Qwen2-VL-7B-Instruct](https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct)
