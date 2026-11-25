# mnreal/Qwen3.5-4B-kaira

## Resumen

Qwen3.5-4B-kaira es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario mnreal en Hugging Face. El modelo parte de la familia Qwen3.5 de Alibaba y ha sido especializado mediante un dataset propio denominado mnreal/kaira7-world-sft, con el objetivo declarado de mejorar el rendimiento en una tarea concreta de evaluación denominada "examen de slots de Kaira-7". Según la model card, el ajuste eleva el resultado de 2/61 a 31/61 en dicha prueba, lo que indica una especialización muy marcada hacia ese dominio específico.

Se trata de un modelo denso de aproximadamente 4.540 millones de parámetros (4.539.265.536 según los pesos en safetensors), guardado en bf16, con el adaptador LoRA fusionado en los pesos finales. El repositorio ocupa 9,1 GB. La licencia es Apache 2.0, heredada del modelo base, y el único idioma declarado es el ruso (ru). No se han publicado descargas ni interacciones en el momento de redactar esta ficha, y la información técnica disponible es muy limitada: la model card no detalla arquitectura interna, longitud de contexto, composición del dataset ni resultados de benchmarks generales.

La relevancia de este modelo es acotada: se trata de un fine-tune de nicho, con un dataset pequeño (982 pares) y una evaluación propia, no de un modelo de propósito general. Resulta útil para quien necesite reproducir o evaluar el efecto de un ajuste LoRA de bajo rango (rank 16, alpha 32) sobre Qwen3.5-4B en tareas de ruso, pero no debe considerarse un sustituto del checkpoint original para usos generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-4B; familia Qwen3.5, presumiblemente transformer denso, sin confirmar en la informacion proporcionada) |
| Parametros totales | 4.539.265.536 (~4,54 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ruso (ru) declarado; el modelo base Qwen3.5 es multilingue, pero el fine-tune solo declara ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, adaptador fusionado en los pesos) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint Qwen/Qwen3.5-4B. La model card no describe la arquitectura interna del modelo base; únicamente indica que se trata de un ajuste con adaptador LoRA fusionado en los pesos finales y guardado en bf16. No se especifican detalles sobre atención, número de capas, cabezas ni mecanismos adicionales, por lo que cualquier afirmación al respecto sería especulativa.

El entrenamiento se realizó sobre el dataset mnreal/kaira7-world-sft, con 982 pares de ejemplo, 3 épocas, rango LoRA 16 y alpha 32. La pérdida de entrenamiento final reportada es 0,6734. No se documenta el número total de tokens vistos, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación posteriores al SFT. La única métrica de evaluación aportada es el "examen de slots de Kaira-7", donde el modelo base obtiene 2/61 y este fine-tune 31/61, lo que sugiere una especialización intensa en ese formato concreto.

## Capacidades

- Generación de texto en ruso, idioma declarado por el autor.
- Especialización en la tarea de "slots de Kaira-7", según la evaluación propia del autor (31/61 frente a 2/61 del modelo base).
- Hereda las capacidades del modelo base Qwen3.5-4B, aunque no se documentan explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de fine-tuning: el modelo sirve como caso de estudio reproducible de un ajuste LoRA de rango 16 sobre un modelo de ~4,5B, con métricas antes/después documentadas (2/61 frente a 31/61), útil para investigar el efecto de datasets pequeños y especializados.
- Procesamiento de texto en ruso: para tareas de generación o transformación de texto en ruso donde el formato de salida se ajuste al esquema de "slots" entrenado, el modelo puede ofrecer resultados más alineados que el checkpoint base.
- Extracción estructurada de campos: dado el enfoque en "slots", encaja en escenarios de rellenado de plantillas o extracción de entidades con un esquema fijo, siempre que se valide contra el formato exacto del dataset de entrenamiento.
- Prototipado de asistentes de nicho en ruso: para demos o pruebas de concepto donde el dominio esté acotado y se disponga de ejemplos representativos del dataset kaira7-world-sft.
- Comparación de checkpoints en pipelines de investigación: permite medir la degradación o mejora respecto al Qwen3.5-4B original en tareas generales frente a la tarea especializada.
- Base para nuevos ajustes: al estar en bf16 y con licencia Apache 2.0, puede emplearse como punto de partida para fine-tunes posteriores en ruso, aunque conviene partir del modelo base si no se necesita la especialización en slots.

## Benchmarks y rendimiento

| Benchmark | Modelo base Qwen3.5-4B | Qwen3.5-4B-kaira |
|---|---|---|
| Examen de slots de Kaira-7 | 2/61 | 31/61 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (estimaciones teóricas, no verificadas porque el autor no publica variantes cuantizadas).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con bf16; RTX 4090, RTX 3090 o RTX 4080 para uso local en bf16.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bf16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); en cuantización de 4 bits podría caber en GPUs de 8 GB, aunque no se ofrecen pesos cuantizados oficiales.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama requerirían conversión previa a los formatos correspondientes, ya que el repositorio solo contiene safetensors en bf16; Transformers con `trust_remote_code` es la vía directa.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-kaira | ~4,54B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tune de nicho en ruso, especializado en slots de Kaira-7 |
| Qwen/Qwen3.5-4B | ~4,54B | no disponible | Apache 2.0 (según modelo base) | Hugging Face | Checkpoint original, propósito general y multilingüe |
| Otros fine-tunes de Qwen3.5-4B | variable | no disponible | variable | Hugging Face | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en términos de rendimiento estándar; la única comparación documentada es la del examen de slots de Kaira-7 frente al modelo base.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (982 pares), lo que aumenta el riesgo de sobreajuste y de degradación en tareas generales respecto al modelo base.
- La única métrica publicada es una evaluación propia del autor ("examen de slots de Kaira-7"), sin validación externa ni comparación con benchmarks estándar.
- Idioma declarado únicamente ruso; el rendimiento en castellano u otros idiomas no está documentado y podría ser deficiente.
- No se documenta la longitud de contexto efectiva del fine-tune; el entrenamiento con pares cortos podría no preservar el contexto largo del modelo base.
- Riesgo de alucinación inherente a los modelos de ~4,5B, no cuantificado en la información disponible.
- Sesgos: no documentados por el autor; al entrenarse sobre un dataset específico, puede reproducir sesgos presentes en él.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar las condiciones del modelo base.
- Sin descargas ni validación comunitaria en el momento de la ficha (0 descargas, 0 likes), lo que limita la confianza en su comportamiento en producción.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que obliga a convertir el modelo para despliegues ligeros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mnreal/Qwen3.5-4B-kaira
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/mnreal/kaira7-world-sft
