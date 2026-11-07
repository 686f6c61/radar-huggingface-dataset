# Outlier-Ai/outlier-flagship-qwen36-35b-a3b-v1

## Resumen

`outlier-flagship-qwen36-35b-a3b-v1` es un artefacto de investigación publicado por Outlier-Ai sobre el modelo base Qwen/Qwen3.6-35B-A3B, una arquitectura de mezcla de expertos (MoE) con 34.660.610.752 parámetros totales. El repositorio contiene pesos en formato safetensors derivados de un proceso de destilación con adaptadores LoRA, etiquetado explícitamente por el autor como experimental y con fallos de entrenamiento documentados (tag `training-failure-documented`). No se trata de un modelo listo para producción: la propia model card lo describe como un artefacto de una línea de trabajo anterior, preservado únicamente por reproducibilidad e interés histórico.

El modelo parte de la familia Qwen3.5/3.6 de Alibaba, con arquitectura `qwen3_5_moe_text` y activación dispersa (la nomenclatura A3B indica aproximadamente 3.000 millones de parámetros activos por token sobre un total de ~35.000 millones). El autor lo distribuye bajo licencia Apache 2.0 y declara únicamente inglés como idioma soportado. El repositorio ocupa 349,4 GB, lo que sugiere la presencia de múltiples variantes de pesos o checkpoints intermedios más allá de los pesos principales.

Su relevancia actual es limitada y fundamentalmente documental: la model card indica que ha sido reemplazado (superseded) por la línea Outlier v1.8, con niveles Nano 4B, Core 27B y Vision 35B-A3B publicados en formato MLX de 4 bits. Cualquier evaluación de rendimiento debe tratarse con cautela, ya que el propio autor califica de provisionales las afirmaciones técnicas de revisiones anteriores de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe_text`), mezcla de expertos |
| Parametros totales | 34.660.610.752 |
| Parametros activos | ~3B (segun nomenclatura A3B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; la linea sucesora se publica en MLX 4-bit) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia Qwen3.5, identificada en los metadatos como `qwen3_5_moe_text`. El modelo parte de Qwen/Qwen3.6-35B-A3B y se ha sometido a un proceso de destilación con adaptadores LoRA, según los tags del repositorio (`distillation`, `lora`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO.

El aspecto más relevante desde el punto de vista técnico es la etiqueta `training-failure-documented`: el autor documenta explícitamente que el entrenamiento presentó fallos, lo que invalida el uso del checkpoint como modelo de referencia. La model card advierte además que el artefacto puede contener adaptadores experimentales, overlays o variantes de cuantización que no llegaron al producto final. No se documentan innovaciones como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`), aunque condicionada por el fallo de entrenamiento documentado.
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen3.6-35B-A3B, no verificadas en este checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Reproducibilidad de investigación: el repositorio se conserva para replicar experimentos de destilación con LoRA sobre Qwen3.6-35B-A3B, no para despliegue.
- Estudio de fallos de entrenamiento: la etiqueta `training-failure-documented` lo convierte en material de referencia para analizar modos de fallo en pipelines de destilación MoE.
- Comparación de linajes: permite contrastar artefactos intermedios de Outlier con los niveles actuales (Nano 4B, Core 27B, Vision 35B-A3B) para entender la evolución de la línea.
- Docencia sobre MoE: útil para ilustrar la diferencia entre parámetros totales (~34,7B) y activos (~3B) en arquitecturas dispersas, siempre con la advertencia de que el checkpoint no es fiable.
- Auditoría de licencias: sirve como ejemplo de preservación de términos Apache 2.0 en artefactos derivados de modelos base de terceros.
- No se recomienda su uso en atención al cliente, generación de código en producción, RAG ni ningún escenario con requisitos de calidad, dado el fallo de entrenamiento declarado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16/FP16): aproximadamente 69 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere múltiples GPU.
- Cuantización a 8 bits: ~35 GB de pesos, viable en una A100 80GB o H100 80GB.
- Cuantización a 4 bits: ~17-18 GB de pesos, ajustable en una RTX 4090 (24 GB) o RTX 3090, aunque con margen reducido para contexto largo.
- GPU recomendadas: A100 80GB, H100 80GB o H200 para inferencia en precisión completa; RTX 4090/3090 solo con cuantización agresiva.
- Despliegue: vLLM o TGI para servir el checkpoint safetensors; llama.cpp u Ollama requerirían conversión a GGUF, no publicada en este repositorio.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 349,4 GB, lo que implica espacio en disco considerable y descarga lenta; probablemente incluye checkpoints intermedios además de los pesos finales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| outlier-flagship-qwen36-35b-a3b-v1 | 34,7B totales / ~3B activos | no disponible | Apache 2.0 | Experimental, fallo documentado, superseded |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B totales / ~3B activos | no disponible | no disponible en esta ficha | Modelo base oficial |
| Outlier Core 27B (MLX 4-bit) | 27B | no disponible | no disponible | Nivel por defecto actual de Outlier |
| Outlier Vision 35B-A3B (MLX 4-bit) | ~35B totales / ~3B activos | no disponible | no disponible | Nivel multimodal actual de Outlier |

La comparación relevante es con el propio modelo base Qwen3.6-35B-A3B: este checkpoint introduce adaptadores LoRA de destilación cuyo entrenamiento falló, por lo que no debe esperarse una mejora sobre el base. Frente a los niveles actuales de Outlier (Core 27B y Vision 35B-A3B en MLX 4-bit), el artefacto aquí descrito queda obsoleto por decisión del propio autor.

## Limitaciones y advertencias

- Fallo de entrenamiento documentado: el tag `training-failure-documented` indica que el proceso de destilación no convergió correctamente; los pesos no deben usarse como referencia de calidad.
- Artefacto superseded: la model card recomienda explícitamente descargar los niveles actuales en lugar de este repositorio.
- Sesgos conocidos: no documentados, pero al derivar de Qwen3.6 hereda los sesgos del corpus de entrenamiento del modelo base, no evaluados en este checkpoint.
- Riesgo de alucinación: elevado y no cuantificado; sin benchmarks publicados no es posible acotarlo.
- Limitación de idioma: solo inglés declarado (`language: en`), sin soporte verificado de castellano.
- Longitud de contexto: no disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el estado experimental y el fallo de entrenamiento hacen desaconsejable cualquier despliegue en producción.
- Contenido del repositorio: 349,4 GB con posibles adaptadores y variantes no graduadas; requiere auditoría antes de cualquier uso.
- La model card incluye enlaces promocionales a outlier.host con parámetros UTM y referencias a precios (49 USD, app para Mac), lo que conviene tratar como material de marketing y no como documentación técnica.

## Enlaces

- Hugging Face: https://huggingface.co/Outlier-Ai/outlier-flagship-qwen36-35b-a3b-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Nivel actual Nano 4B: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
- Nivel actual Core 27B: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Nivel actual Vision 35B-A3B: https://huggingface.co/Outlier-Ai/Outlier-Vision-35B-A3B-MLX-4bit
- DeepSeek-R1-Distill-Qwen-7B (MLX 4-bit): https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Qwen3-Coder-30B-A3B (MLX 4-bit): https://huggingface.co/Outlier-Ai/Qwen3-Coder-30B-A3B-Instruct-MLX-4bit
- Sitio del autor: https://outlier.host/
- Ficha en free2aitools: https://free2aitools.com/model/outlier-ai/outlier-flagship-qwen36-35b-a3b-v1
