# mrminjae/qwen3p6-35b-a3b-2p10bit-r132

## Resumen

Qwen3.6-35B-A3B 2.10-bit (r132) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B de Alibaba Qwen. Se trata de una cuantización selectiva: los expertos enrutados del modelo MoE se almacenan en una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) se conservan en BF16. Los pesos se guardan ya dequantizados en tensores BF16, de modo que cargan con `transformers` estándar y con vLLM sin necesidad de kernels de cuantización especiales.

El modelo base es un transformer de tipo Mixture-of-Experts (etiqueta `qwen3_5_moe` en el repositorio) con capacidades multimodales de imagen-a-texto, según los tags del repositorio. El checkpoint r132 tiene 67.319.436.656 parámetros almacenados en safetensors y un tamaño de repositorio de 134,7 GB, coherente con el almacenamiento en BF16 de la mayoría de pesos.

Es relevante ahora porque demuestra una técnica de compresión agresiva sobre las capas MoE, que son las que concentran la mayor parte de los parámetros en este tipo de arquitecturas, manteniendo intacta la precisión del resto de la red. No obstante, se trata de un checkpoint interno de investigación, sin model card detallada, sin benchmarks publicados y sin licencia explicitada más allá de la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (tag `qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 67.319.436.656 (en safetensors del checkpoint) |
| Parametros activos | no disponible (el nombre del base sugiere ~3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion selectiva de expertos a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, Qwen/Qwen3.6-35B-A3B, sin especificarla) |
| Formato de pesos | safetensors (BF16 dequantizado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura de transformer con capas de mezcla de expertos (MoE), tal como refleja el tag `qwen3_5_moe`. El checkpoint r132 no reentrena el modelo: aplica una cuantización post-entrenamiento selectiva sobre los expertos enrutados, que promedian 2,10 bits, mientras que el resto de componentes (atención, embeddings, router y capas no expertas) permanecen en BF16. Los pesos resultantes se almacenan dequantizados en tensores BF16, lo que permite cargarlos con `transformers` estándar o vLLM sin kernels especializados.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla la metodología exacta de cuantización (algoritmo, calibración, granularidad por experto) más allá de la precisión media declarada. El identificador interno "r132" sugiere una iteración de investigación dentro de una serie de experimentos de compresión.

## Capacidades

- Generación de texto conversacional, según el pipeline `text-generation` y el tag `conversational`.
- Procesamiento multimodal imagen-a-texto, según el tag `image-text-to-text` del repositorio.
- Razonamiento y generación de código: capacidades heredadas del modelo base Qwen3.6-35B-A3B, aunque no se documentan explícitamente en la información disponible.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento extendido (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Investigación en compresión de modelos: el checkpoint sirve para estudiar el impacto de cuantizar expertos MoE a 2,10 bits manteniendo el resto en BF16, comparando calidad frente al modelo base sin cuantizar.
- Despliegue con memoria reducida en infraestructura existente: al almacenar los pesos en BF16 dequantizado, se puede cargar con `transformers` y vLLM sin parches, lo que facilita probar el modelo en entornos estándar de inferencia.
- Evaluación de robustez de modelos cuantizados: útil para medir degradación en tareas de generación de texto y razonamiento frente al base Qwen3.6-35B-A3B.
- Experimentación multimodal en laboratorio: el tag image-text-to-text permite probar tareas de descripción de imágenes o respuesta a preguntas visuales, siempre con validación previa de que la cuantización no degrada la torre visual.
- Prototipado de asistentes conversacionales en entornos de investigación: el pipeline conversacional y la compatibilidad con endpoints permiten integrarlo en demos internas.
- Baseline para pipelines de cuantización: sirve como referencia para comparar otras estrategias de compresión (GPTQ, AWQ, GGUF) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 134,7 GB en safetensors BF16; cargar el checkpoint completo requiere del orden de 135 GB de VRAM o memoria unificada, sin margen para KV cache.
- GPU recomendadas: para carga completa en BF16, configuraciones multi-GPU como 2x H100 80GB, 2x A100 80GB o 4x A100 40GB. No cabe en una sola GPU de 80 GB.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en su formato actual. Sería necesario un proceso adicional de cuantización a GGUF o similar para reducir el peso en disco y memoria.
- Opciones de despliegue: `transformers` estándar y vLLM, según indica la model card. No se documenta soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r132 | 67.319.436.656 | no disponible | no disponible | safetensors BF16 dequantizado | Checkpoint de investigación con expertos a 2,10 bits |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible en la informacion | no disponible | no disponible | safetensors | Modelo original sin cuantizar; referencia de calidad |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación interno ("Internal research checkpoint"): no está pensado como release estable ni cuenta con model card completa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la degradación introducida por la cuantización a 2,10 bits en los expertos.
- Licencia no explicitada: la model card remite a la licencia del modelo base Qwen/Qwen3.6-35B-A3B, pero no se detalla; es imprescindible verificar las condiciones del base antes de cualquier uso comercial.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe sin evaluación propia.
- Contexto no documentado: se desconoce la longitud máxima de contexto efectiva tras la cuantización.
- Riesgo de alucinación: inherente a los modelos generativos; la cuantización agresiva de expertos puede incrementarlo y no ha sido medido.
- Sesgos: no documentados; se heredan los del modelo base, que tampoco se detallan.
- Tamaño elevado: 134,7 GB en BF16 impiden su uso en hardware de consumo sin un proceso adicional de cuantización.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Repositorio actualizado apenas dos minutos después de su creación: posible publicación automática o incompleta.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r132
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
