# MergekitCloud/mergekit-14

## Resumen

MergekitCloud/mergekit-14 es un modelo de lenguaje de 8.030 millones de parámetros (aproximadamente 8B) creado mediante la fusión de varios modelos base de la familia Llama-3.1-8B. El proceso de fusión se realizó con la herramienta open source [mergekit](https://github.com/arcee-ai/mergekit), utilizando el método **Model Stock** (arxiv:2403.19522), que combina los pesos de los modelos sin necesidad de entrenamiento adicional. El modelo resultante se publica en Hugging Face bajo el usuario MergekitCloud y no registra descargas ni valoraciones hasta la fecha.

La relevancia de este modelo radica en su enfoque de *merging*: permite integrar capacidades de distintos modelos (roleplay, conversación, razonamiento) en un único conjunto de pesos, manteniendo el tamaño original de 8B y el formato de pesos safetensors. Está diseñado para tareas de generación de texto y conversación, aunque no se proporcionan datos de evaluación específicos. La arquitectura subyacente es un transformer estándar tipo Llama, con una longitud de contexto que no se especifica en la documentación del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en float16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una fusión de cuatro modelos base de 8B parámetros, todos basados en la arquitectura Llama-3.1. Los modelos fusionados son:

- Undi95/Llama3-Unholy-8B-OAS
- ArliAI/Llama-3.1-8B-ArliAI-RPMax-v1.3
- Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2

La fusión se realizó con el método **Model Stock**, que calcula una combinación lineal de los pesos de los modelos participantes, tomando como referencia el modelo `vicgalle/Humanish-Roleplay-Llama-3.1-8B` como base. La configuración YAML indica `normalize: false` e `int8_mask: true`, con dtype `float16`. Este método no requiere entrenamiento adicional, por lo que no hay datos sobre dataset de entrenamiento ni proceso de RLHF/DPO. La innovación principal es la capacidad de combinar modelos de forma eficiente y reproducible mediante mergekit.

## Capacidades

- Generación de texto conversacional y de roleplay, heredada de los modelos base especializados en estos dominios.
- Razonamiento y generación de código, probablemente heredados de los modelos ArliAI y Lexi-Uncensored, aunque no hay evaluación específica.
- Soporte de tool calling y function calling: no documentado, pero los modelos base Llama-3.1 suelen incluir esta capacidad.
- Capacidades multilingües: no especificadas; los modelos base Llama-3.1 soportan varios idiomas, pero no se confirma para este merge.
- Sin modo de pensamiento (thinking mode) ni capacidades multimodales (visión, audio) documentadas.

## Casos de uso

- **Chatbots de atención al cliente**: al ser un modelo de 8B, puede desplegarse en entornos con recursos limitados. Su capacidad conversacional permite gestionar diálogos multi-turno, aunque la longitud de contexto no está confirmada.
- **Generación de contenido creativo**: los modelos base incluyen variantes de roleplay y narrativa, por lo que puede usarse para escribir historias o guiones.
- **Asistente de código en entornos de desarrollo**: si hereda las capacidades de razonamiento de los modelos ArliAI, podría integrarse en IDE o pipelines de CI/CD para sugerencias de código, aunque no hay benchmarks que lo respalden.
- **Prototipado rápido de aplicaciones de IA**: al ser un merge sin entrenamiento, sirve como base para pruebas de concepto sin necesidad de ajuste fino.
- **Investigación en técnicas de fusión de modelos**: útil como ejemplo de aplicación del método Model Stock, permitiendo estudiar el comportamiento de modelos fusionados.
- **Despliegue en edge o entornos con GPU de consumo**: con 8B parámetros, puede ejecutarse en GPUs con 16 GB de VRAM en float16, o con cuantización (no incluida) en hardware menor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar. El repositorio no incluye evaluaciones comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB para inferencia en float16 (8B parámetros × 2 bytes). Con cuantización de 8 bits se podría reducir a ~8 GB, y a ~4 GB en 4 bits, aunque no se proporcionan pesos cuantizados.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100 para mayor throughput. También puede ejecutarse en GPUs con 16 GB como RTX 4080.
- Compatibilidad con consumer GPU: sí, con al menos 16 GB de VRAM.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (si se cuantiza). No se incluyen archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificación de ~20-50 ms/token y un throughput de 50-100 tokens/s con batching, pero son estimaciones generales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MergekitCloud/mergekit-14 | 8B | No disponible | No disponible | Hugging Face |
| Llama-3.1-8B (Meta) | 8B | 128k | Llama 3.1 Community License | Hugging Face |
| Mistral-7B | 7B | 32k | Apache 2.0 | Hugging Face |
| Gemma-2-9B (Google) | 9B | 8k | Gemma Terms | Hugging Face |

La comparativa se basa en características generales, ya que no hay datos de rendimiento del modelo evaluado. Llama-3.1-8B es el modelo base más probable y ofrece contexto largo y licencia comercial. Mistral-7B tiene licencia permisiva y menor tamaño. Gemma-2-9B es comparable en tamaño pero con contexto más corto. El modelo evaluado no ofrece información sobre contexto ni licencia, lo que limita su uso en producción.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica bajo qué términos se distribuye el modelo. Esto impide su uso comercial sin consultar al autor.
- **Sesgos desconocidos**: al ser un merge de modelos no evaluados, no se conocen sesgos potenciales en género, raza o idioma.
- **Riesgo de alucinación**: no hay datos sobre fiabilidad factual; los modelos base pueden generar contenido inventado, especialmente en tareas de razonamiento.
- **Longitud de contexto incierta**: aunque los modelos base Llama-3.1 soportan 128k, el proceso de fusión podría alterar la ventana efectiva; se recomienda probar antes de usar en aplicaciones de contexto largo.
- **Sin cuantizaciones oficiales**: solo se ofrecen pesos en float16, lo que limita su despliegue en hardware con poca VRAM sin conversión manual.
- **Sin evaluación independiente**: la ausencia de benchmarks y el historial de descargas cero indican que el modelo no ha sido validado por la comunidad.

## Enlaces

- [Hugging Face - MergekitCloud/mergekit-14](https://huggingface.co/MergekitCloud/mergekit-14)
- [Repositorio mergekit en GitHub](https://github.com/arcee-ai/mergekit)
- [Artículo sobre Model Stock (arxiv:2403.19522)](https://arxiv.org/abs/2403.19522)
- [Documentación de MergeKit](https://www.mergekit.com/)
