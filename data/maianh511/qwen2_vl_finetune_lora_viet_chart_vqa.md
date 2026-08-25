# maianh511/qwen2_vl_finetune_lora_viet_chart_vqa

## Resumen

El modelo `maianh511/qwen2_vl_finetune_lora_viet_chart_vqa` es un ajuste fino con LoRA (Low-Rank Adaptation) del modelo multimodal Qwen/Qwen2-VL-2B-Instruct, desarrollado por el usuario maianh511. Está especializado en responder preguntas sobre gráficos (chart question-answering) en vietnamita e inglés. El ajuste se realizó sobre el dataset `maianh511/vi_chart_dataset`, un conjunto de datos de gráficos con preguntas y respuestas en vietnamita. El objetivo es mejorar la capacidad del modelo base para comprender y razonar sobre información visual contenida en gráficos y tablas, un dominio de aplicación práctica en análisis de datos y documentación técnica.

El modelo se publica bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones adicionales. La arquitectura es la del Qwen2-VL, un transformer multimodal que combina un codificador de visión con un modelo de lenguaje, con 2 mil millones de parámetros. Aunque el ajuste LoRA no modifica el número total de parámetros, sí añade adaptadores de bajo rango que se entrenan específicamente para la tarea de QA de gráficos. Este modelo se presenta como una alternativa ligera y especializada frente a otros modelos de mayor tamaño, y su rendimiento se evalúa en comparación con Vintern-1B-v2, otro modelo vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basada en Qwen2-VL, con codificador de visión y modelo de lenguaje |
| Parametros totales | 2B (modelo base) + adaptadores LoRA (número de parámetros adicionales no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | vietnamita (vi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estándar de HuggingFace; no confirmado en la documentación) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2-VL-2B-Instruct, un modelo multimodal de tipo transformer con un codificador de visión (Vision Transformer) y un modelo de lenguaje autoregresivo. El ajuste fino se realizó mediante LoRA, una técnica de eficiencia paramétrica que congela los pesos originales y entrena solo matrices de bajo rango en capas específicas. Esto reduce significativamente el coste de entrenamiento y la memoria necesaria, manteniendo el rendimiento del modelo base. El entrenamiento se realizó sobre el dataset `maianh511/vi_chart_dataset`, que contiene gráficos con preguntas y respuestas en vietnamita. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si se utilizó RLHF o DPO. El proceso de evaluación se llevó a cabo en un conjunto de test de 700 muestras, comparando el rendimiento del modelo con un ajuste LoRA equivalente sobre Vintern-1B-v2.

## Capacidades

- Generación de respuestas a preguntas sobre gráficos (bar charts, line charts, etc.) a partir de imágenes.
- Comprensión de contenido visual y razonamiento numérico básico para interpretar datos de gráficos.
- Soporte multilingüe limitado a vietnamita e inglés.
- Capacidad de seguir instrucciones en formato de pregunta-respuesta (QA) gracias a la base instruct.
- Al ser una adaptación del modelo Qwen2-VL, hereda capacidades generales de generación de texto, razonamiento y comprensión de imágenes, aunque el ajuste puede especializarlo en el dominio de gráficos.
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso específicas.

## Casos de uso

- Análisis automático de gráficos en documentos técnicos: el modelo puede extraer datos de un gráfico y responder preguntas como "¿Cuál es la tendencia de ventas en el último trimestre?" en vietnamita.
- Generación de informes de datos a partir de imágenes de gráficos: al recibir una imagen, el modelo puede producir una descripción textual de los hallazgos clave, útil para automatizar resúmenes de datos.
- Asistente de soporte en aplicaciones de análisis de datos: integrado en herramientas de BI, permite consultas en lenguaje natural sobre visualizaciones.
- Educación y formación: ayuda a estudiantes a interpretar gráficos en ejercicios de matemáticas o estadística, ofreciendo explicaciones paso a paso.
- Automatización de documentación técnica: el modelo puede convertir gráficos en texto descriptivo para informes, presentaciones o documentación accesible.
- Búsqueda de información en bases de datos visuales: dado un gráfico y una pregunta, el modelo localiza la información relevante y la responde, útil en sistemas de recuperación de información multimodal.

## Benchmarks y rendimiento

La model card del autor proporciona una comparación directa entre el modelo ajustado con LoRA y un Vintern-1B-v2 también ajustado con LoRA, sobre el mismo conjunto de test de 700 muestras. Los resultados se resumen en la siguiente tabla:

| Métrica | Qwen2-VL LoRA (este modelo) | Vintern-LoRA | Mejora relativa de Vintern |
|---|---|---|---|
| BLEU | 0.239 | 0.468 | +95.8% |
| METEOR | 0.456 | 0.703 | +54.2% |
| ROUGE-1 | 0.613 | 0.778 | +26.9% |
| ROUGE-2 | 0.491 | 0.676 | +37.7% |
| ROUGE-L | 0.565 | 0.735 | +30.1% |
| BERTScore | 0.786 | 0.903 | +14.9% |

Los resultados muestran que Vintern-LoRA supera a este modelo en todas las métricas, especialmente en BLEU y METEOR, lo que indica que la calidad de las respuestas generadas es inferior en comparación. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 2B en FP16, se necesitan aproximadamente 4 GB de VRAM para inferencia. Con cuantización a int8, se reduce a unos 2 GB, pero no se especifican cuantizaciones disponibles.
- GPU recomendadas: una GPU con al menos 6 GB de VRAM para un uso cómodo (por ejemplo, RTX 2060, RTX 3060, GTX 1660 Ti). En GPUs de gama alta como RTX 4090 o A100 el modelo se ejecuta sin problemas.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPU comerciales con más de 4 GB de VRAM.
- Opciones de despliegue: al ser un modelo de HuggingFace, se puede servir con librerías como Transformers, vLLM, llama.cpp (si se convierte a GGUF) o Ollama. No se documentan opciones específicas.
- Latencia y throughput: no se han publicado datos concretos; en una GPU moderna, la inferencia de un modelo de 2B suele ser de decenas de milisegundos por respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `maianh511/qwen2_vl_finetune_lora_viet_chart_vqa` | 2B | no disponible | Apache 2.0 | Fine-tune LoRA para QA de gráficos en vietnamita |
| Vintern-1B-v2 (con LoRA) | 1B | no disponible | Apache 2.0 (según proyecto) | Modelo vietnamita multimodal, mejor rendimiento en el mismo dataset según la model card |
| Qwen2-VL-2B-Instruct (base) | 2B | 32K (del modelo base) | Apache 2.0 | Modelo general multimodal sin ajuste específico para gráficos |

La comparativa se basa en los datos disponibles; el modelo Vintern-LoRA supera a este modelo en todas las métricas evaluadas. El modelo base Qwen2-VL-2B-Instruct no está especializado en gráficos, por lo que el fine-tune puede mejorar el rendimiento en este dominio, pero no hay datos para confirmarlo.

## Limitaciones y advertencias

- Sesgos: el modelo se entrenó con un dataset específico de gráficos en vietnamita, por lo que puede tener un rendimiento limitado en otros idiomas o tipos de gráficos no representados en el dataset.
- Alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventar datos cuando el gráfico no es claro o la pregunta es ambigua.
- Limitaciones de contexto: no se especifica la longitud de contexto del modelo; es probable que herede los 32K tokens del modelo base, pero no está confirmado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe atribuir al autor y mantener el aviso de licencia.
- Riesgos de producción: el modelo no ha sido probado en entornos de producción; su rendimiento en datos fuera del dominio puede ser pobre. Se recomienda evaluarlo con el propio conjunto de test antes de desplegarlo.
- Dependencia del modelo base: el ajuste LoRA depende de la arquitectura de Qwen2-VL; si se actualiza el modelo base, el adaptador puede no ser compatible.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/maianh511/qwen2_vl_finetune_lora_viet_chart_vqa
- Dataset de entrenamiento: https://huggingface.co/datasets/maianh511/vi_chart_dataset
- Repositorio de fine-tuning de Qwen-VL (referencia): https://github.com/2U1/Qwen-VL-Series-Finetune
- Documentación sobre LoRA en Qwen-VL (DeepWiki): https://deepwiki.com/QwenLM/Qwen-VL/5.3-lora-fine-tuning
- Repositorio de fine-tuning de Qwen2.5-VL (referencia): https://github.com/zhangfaen/finetune-Qwen2.5-VL
- Discusión sobre LoRA en Qwen2-VL-7B (foro): https://huggingface.co/Qwen/Qwen2-VL-7B-Instruct/discussions/2
