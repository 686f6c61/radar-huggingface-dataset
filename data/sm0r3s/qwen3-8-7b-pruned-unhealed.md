# Sm0r3s/qwen3.8-7b-pruned-unhealed

## Resumen

Sm0r3s/qwen3.8-7b-pruned-unhealed es un checkpoint derivado publicado en Hugging Face por el usuario Sm0r3s. Segun los metadatos del repositorio, contiene 7.389.534.736 parametros en formato safetensors (14,8 GB en total) y se etiqueta con la arquitectura `qwen3_5` y el pipeline `image-text-to-text`, lo que indica que se trata de un modelo de lenguaje con codificador de vision. La licencia declarada es Apache 2.0 y la libreria de referencia es Transformers.

El nombre del repositorio sugiere un proceso de poda ("pruned") sobre un modelo de la familia Qwen3.8, presumiblemente partiendo de una variante de mayor tamano (la model card heredada hace referencia a Qwen3.8-27B) y reduciendola a aproximadamente 7,4 mil millones de parametros. El sufijo "unhealed" apunta a que no se ha aplicado un proceso de recuperacion o sanacion posterior a la poda, lo que en la practica suele implicar degradacion de capacidades respecto al modelo original. No hay informacion publicada sobre el procedimiento exacto de poda, los datos de calibracion ni el estado de entrenamiento posterior.

Es relevante ahora porque los flujos de compresion de modelos multimodales estan ganando interes para despliegue en hardware limitado, pero tambien porque este tipo de checkpoints sin documentacion ni evaluacion publica requieren cautela: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni detalles de entrenamiento verificables. La model card incluida en el repositorio parece ser en gran parte texto heredado del modelo base Qwen3.8-27B y no describe el proceso de poda ni las caracteristicas reales del checkpoint resultante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (tag del repositorio); modelo causal con codificador de vision segun la model card heredada |
| Parametros totales | 7.389.534.736 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible para este checkpoint (la model card del base menciona 262.144 nativos y hasta 1.000.000 extensibles, no confirmado tras la poda) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Los metadatos indican la arquitectura `qwen3_5` y el pipeline `image-text-to-text`, coherente con un transformer causal con codificador de vision. La model card heredada describe para el modelo base una disposicion hibrida con capas Gated DeltaNet (atencion lineal) intercaladas con capas de atencion con compuerta, ademas de Multi-Token Prediction (MTP) entrenado en varios pasos. Sin embargo, no hay confirmacion de que estas caracteristicas se conserven intactas tras la poda a 7,4 mil millones de parametros, ni de como afecta la reduccion al codificador de vision.

No se dispone de informacion sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset, ni sobre si hubo fases de RLHF, DPO o ajuste por preferencias especificas para este checkpoint. El sufijo "unhealed" sugiere que no se ha realizado un reentrenamiento de recuperacion tras la poda, lo que habitualmente produce perdida de calidad en las capas o cabezas eliminadas. Tampoco se documenta la estrategia de poda (estructurada o no estructurada), los criterios de seleccion de pesos ni el conjunto de calibracion utilizado.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base segun la model card, sin verificacion independiente tras la poda.
- Comprension de imagen y video: el pipeline declarado es `image-text-to-text`; la model card del base menciona soporte nativo de imagenes, diagramas STEM, documentos y videos de hasta una hora, no confirmado en este checkpoint.
- Control de modo thinking: la model card del base describe modo pensamiento activado por defecto, desactivable por peticion, con `reasoning_effort` y `preserve_thinking`; no se confirma que funcione en este checkpoint podado.
- Tool calling y function calling: no disponible de forma especifica para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: descrito en la model card del base, sin evidencia en este repositorio.
- Capacidades multilingues: no disponible.

## Casos de uso

- Prototipado de pipelines multimodales en local: al ocupar 14,8 GB en safetensors, el checkpoint puede cargarse en una GPU de 24 GB en precision completa o en 16 GB con cuantizacion a 8 bits, lo que permite experimentar con entrada de imagen y texto sin depender de APIs externas.
- Evaluacion comparativa de tecnicas de poda: util como caso de estudio para medir la degradacion introducida por una poda sin fase de recuperacion frente al modelo base de 27B, mediante conjuntos de validacion propios.
- Investigacion sobre destilacion y compresion: sirve como punto de partida para aplicar tecnicas de sanacion (reentrenamiento ligero, LoRA, DPO) y medir la recuperacion de capacidades.
- Pruebas de integracion con Transformers y vLLM: el repositorio declara compatibilidad con Transformers y la model card menciona vLLM, SGLang y TokenSpeed para el base; permite validar flujos de despliegue antes de invertir en modelos mayores.
- Fines educativos: analisis de la estructura interna de un modelo hibrido con atencion lineal y codificador de vision en un tamano manejable.
- Experimentacion con cuantizacion: al no publicarse GGUF, el checkpoint es un candidato para generar cuantizaciones propias (GPTQ, AWQ, bitsandbytes) y comparar calidad frente al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. La model card heredada incluye tablas de rendimiento del modelo base Qwen3.8-27B frente a Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero esos datos no son aplicables al checkpoint podado y no se reproducen aqui para no inducir a error.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 14,8 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomiendan 20-24 GB.
- VRAM estimada en 8 bits: en torno a 8-9 GB para pesos, con 12-16 GB recomendados en total.
- VRAM estimada en 4 bits: en torno a 4-5 GB para pesos, con 8-12 GB recomendados en total.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para produccion; RTX 4090 (24 GB) y RTX 3090 (24 GB) para FP16; RTX 4080 (16 GB) o RTX 4070 Ti Super (16 GB) para 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en FP16 y en GPUs de 16 GB con cuantizacion.
- Opciones de despliegue: Transformers (declarado); vLLM, SGLang y TokenSpeed segun la model card del base, sin verificacion para este checkpoint; llama.cpp u Ollama requeririan conversion a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| Sm0r3s/qwen3.8-7b-pruned-unhealed | 7,39 B | no disponible | Apache 2.0 | safetensors | Checkpoint comunitario sin evaluacion publica |
| Qwen3.8-27B (base referenciado en la model card) | 27 B | 262.144 nativos, hasta 1.000.000 | Apache 2.0 | safetensors | Modelo oficial con benchmarks publicados |
| Qwen3.6-27B (referencia de la model card) | 27 B | no disponible en la informacion | Apache 2.0 | safetensors | Modelo oficial de generacion anterior |
| Muse Glimmer-30B (referencia de la model card) | 30 B | no disponible en la informacion | no disponible | no disponible | Comparativa citada por el autor del base |

La comparacion directa con alternativas del mismo tamano (por ejemplo, modelos densos de 7-8B con vision) no esta disponible en la informacion proporcionada, ya que no se han publicado evaluaciones de este checkpoint.

## Limitaciones y advertencias

- Poda sin sanacion: el sufijo "unhealed" indica ausencia de reentrenamiento de recuperacion, lo que previsiblemente degrada el rendimiento respecto al modelo base; no hay mediciones que cuantifiquen esa perdida.
- Ausencia de benchmarks: no se han publicado evaluaciones propias del checkpoint, por lo que su calidad real es desconocida.
- Model card no representativa: el README parece heredado del Qwen3.8-27B y describe caracteristicas (27B, contexto de 262.144, control de thinking) que no se corresponden con los 7,39B declarados en safetensors.
- Riesgo de alucinacion: sin evaluacion, no puede descartarse un aumento de alucinaciones tras la poda, especialmente en tareas de razonamiento largo y uso de herramientas.
- Idiomas: no se especifican los idiomas soportados ni se garantiza el multilingue del base.
- Licencia: Apache 2.0 permite uso comercial, pero el autor del checkpoint no documenta la procedencia exacta de los pesos ni posibles restricciones adicionales del modelo base.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin issues ni discusiones que aporten validacion de la comunidad.
- Produccion: no recomendado como modelo principal sin una evaluacion interna previa; adecuado para experimentacion e investigacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sm0r3s/qwen3.8-7b-pruned-unhealed
- Pagina del modelo base citada en la model card (Qwen Cloud): https://www.qwencloud.com/models/qwen3.8-27b
- Qwen Cloud (servicio API citado): https://www.qwencloud.com
