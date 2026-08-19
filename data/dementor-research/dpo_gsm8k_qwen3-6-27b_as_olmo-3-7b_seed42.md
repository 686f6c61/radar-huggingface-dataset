# dementor-research/dpo_gsm8k_qwen3.6-27b_as_olmo-3-7b_seed42

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.6-27B`, con el objetivo de imitar el comportamiento del modelo `Olmo-3-7B` en el dataset GSM8K (problemas de razonamiento matemático). Forma parte del estudio **dementor**, una campaña de imitación de comportamiento definida por configuración, desarrollada por el grupo `dementor-research` y entrenada con la herramienta Tinker de Thinking Machines.

El adaptador tiene un tamaño de repositorio de 1.0 GB y está publicado con la librería PEFT (Parameter-Efficient Fine-Tuning). No se especifica licencia ni idiomas soportados, y no cuenta con descargas ni valoraciones en el momento de la consulta. Es un artefacto de investigación, no un modelo listo para producción, y su interés radica en estudiar cómo un modelo grande (27B) puede ser ajustado para replicar el comportamiento de uno más pequeño (7B) en tareas específicas de razonamiento matemático.

La campaña completa incluye 12 modelos, 4 datasets y 1 semilla, generando 528 celdas configuradas para esta etapa. Este adaptador en particular usa un rank de LoRA de 32 y `target_modules=all-linear`, según la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base Qwen/Qwen3.6-27B (transformador causal) |
| Parametros totales | No disponible (el adaptador LoRA no declara el número de parámetros; el modelo base tiene aproximadamente 27B según su nomenclatura) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B, no especificada en la documentación) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se mencionan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `Qwen/Qwen3.6-27B`, un transformador causal de la familia Qwen3.6, que según el repositorio oficial de QwenLM prioriza estabilidad y utilidad real, con mejoras en codificación agéntica. El adaptador LoRA se entrena con DPO, un método de optimización de preferencias que alinea el modelo con respuestas preferidas frente a no preferidas. En este caso, el objetivo es que el modelo base imite el comportamiento de `Olmo-3-7B` en el dataset GSM8K, un conjunto de problemas matemáticos de nivel escolar.

Los detalles de entrenamiento (número de tokens, composición exacta del dataset, hiperparámetros completos) no están disponibles en la documentación pública. La model card menciona que el entrenamiento se realizó con Tinker y que la configuración exacta se encuentra en `config.yaml` del release de código. Se sabe que el rank de LoRA es 32 y que se aplicó a todas las capas lineales (`target_modules=all-linear`). No se menciona el uso de RLHF adicional ni otras técnicas de alineación más allá del DPO.

## Capacidades

- Razonamiento matemático: el adaptador está específicamente entrenado para mejorar el rendimiento en problemas de GSM8K, imitando el estilo de razonamiento de Olmo-3-7B.
- Herencia del modelo base: al cargarse sobre Qwen3.6-27B, conserva las capacidades generales del modelo base (generación de texto, comprensión, etc.), aunque el adaptador modifica el comportamiento en la dirección del estudio.
- Uso con PEFT: se integra fácilmente con la librería `peft` de HuggingFace, permitiendo cargar el adaptador sobre el modelo base con pocas líneas de código.
- No se documentan capacidades específicas de tool calling, agentes, visión o audio. Dependen del modelo base y no se confirman en esta ficha.

## Casos de uso

- Investigación en imitación de comportamiento: el adaptador permite estudiar cómo un modelo de 27B puede replicar el comportamiento de un modelo de 7B en tareas de razonamiento matemático, útil para analizar transferencia de estilos de razonamiento y alineación.
- Evaluación de técnicas DPO con LoRA: sirve como caso de referencia para comparar configuraciones de entrenamiento (rank, datasets, semillas) dentro de la campaña dementor.
- Benchmark de razonamiento matemático: puede utilizarse como punto de comparación en evaluaciones de GSM8K, aunque no se han publicado resultados oficiales.
- Fine-tuning selectivo: demuestra cómo un adaptador LoRA puede modificar el comportamiento de un modelo base sin reentrenar todos los parámetros, reduciendo costes computacionales.
- Análisis de robustez: al ser un artefacto experimental, permite estudiar la estabilidad de la imitación bajo diferentes semillas y datasets dentro de la cohorte de 528 celdas.
- Desarrollo de pipelines de alineación: el flujo de entrenamiento (Tinker + DPO + LoRA) puede replicarse para otros pares de modelos y datasets, sirviendo como plantilla en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de GSM8K ni comparaciones con otros modelos. Se recomienda consultar el release de código y la configuración del estudio para obtener datos de evaluación si están disponibles.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1.0 GB, pero debe cargarse junto con el modelo base Qwen3.6-27B, que requiere una GPU con al menos 24 GB de VRAM en FP16 (aproximadamente 54 GB en FP32, pero en FP16 cabe en GPUs como A100 40GB, RTX 4090 24GB con cuantización, o H100).
- Para inferencia con el adaptador, se recomienda al menos una GPU con 24 GB (RTX 3090/4090, A5000) si se usa FP16 con cuantización del modelo base (por ejemplo, bitsandbytes 8-bit o 4-bit).
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` en Python, o exportar a GGUF para usar con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles. Dependen del hardware y de la configuración de cuantización del modelo base.

## Comparativa con modelos similares

El estudio dementor incluye otros adaptadores con la misma metodología pero con diferentes combinaciones de modelo base y modelo a imitar. Por ejemplo:

- `dementor-research/dpo_gsm8k_olmo-3-7b_as_qwen3.6-27b_seed42`: adaptador LoRA sobre Olmo-3-7B imitando a Qwen3.6-27B, misma semilla 42.
- `dementor-research/dpo_gsm8k_qwen3.6-35b-a3b_as_qwen3.6-27b_seed42`: adaptador sobre Qwen3.6-35B-A3B imitando a Qwen3.6-27B.

No se dispone de métricas comparativas publicadas entre estos adaptadores. La comparativa principal es metodológica: todos usan DPO con LoRA rank 32 y se entrenan sobre GSM8K, variando el modelo base y el modelo imitado. La licencia y disponibilidad son las mismas (no especificadas). Para una comparación cuantitativa, sería necesario ejecutar evaluaciones propias.

## Limitaciones y advertencias

- No se especifica licencia, lo que impide su uso comercial sin consultar al autor.
- Es un adaptador experimental, sin garantías de rendimiento ni estabilidad. No está pensado para producción.
- El entrenamiento se limita a GSM8K, por lo que la imitación de comportamiento puede no generalizar a otras tareas o dominios.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia objetiva de mejora frente al modelo base.
- El adaptador depende del modelo base Qwen3.6-27B, que a su vez puede tener sus propias limitaciones (sesgos, alucinaciones, contexto limitado) no documentadas en esta ficha.
- El dataset GSM8K es de razonamiento matemático en inglés, lo que puede introducir sesgos lingüísticos y de formato.
- No hay información sobre el proceso de recopilación de preferencias para el DPO, lo que impide evaluar la calidad de los pares preferidos/no preferidos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dementor-research/dpo_gsm8k_qwen3.6-27b_as_olmo-3-7b_seed42
- Repositorio oficial de Qwen3.6: https://github.com/QwenLM/Qwen3.6
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.6-27B
- Otros modelos de la campaña (ejemplo): https://huggingface.co/dementor-research/dpo_gsm8k_olmo-3-7b_as_qwen3.6-27b_seed42
- Despliegue en FriendliAI (modelo relacionado): https://friendli.ai/models/dementor-research/dpo_gsm8k_qwen3.6-35b-a3b_as_qwen3.6-27b_seed42
