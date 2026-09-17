# minjaechoi/qwen36-35b-a3b-2p02bit-r3

## Resumen

Este repositorio contiene un checkpoint de investigación publicado por el usuario minjaechoi bajo el identificador `qwen36-35b-a3b-2p02bit-r3`. Se trata de una variante cuantizada del modelo base Qwen/Qwen3.6-35B-A3B, en la que únicamente los expertos enrutados (routed experts) han sido comprimidos a una media de 2,02 bits, mientras que el resto de pesos del modelo se mantiene en BF16. El autor lo describe explícitamente como un "internal research checkpoint" (identificador interno r3), no como un modelo listo para producción.

La relevancia técnica del artefacto está en su enfoque de almacenamiento: aunque la cuantización de los expertos es extremadamente agresiva, los pesos se guardan ya de-cuantizados en tensores BF16, de modo que el modelo carga con `transformers` y vLLM estándar sin necesidad de kernels personalizados. El coste de esta decisión es que el repositorio ocupa 70,2 GB pese a los 2,02 bits nominales, porque el ahorro de memoria no se traslada al fichero de pesos.

El modelo cuenta con 35.107.181.936 parámetros reales según los safetensors, es de tipo MoE (etiqueta `qwen3_5_moe`) y declara la tarea `image-text-to-text`, lo que apunta a capacidades multimodales. No hay información publicada sobre idiomas, licencia concreta, longitud de contexto ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `qwen3_5_moe`; familia transformer con mezcla de expertos) |
| Parametros totales | 35.107.181.936 (dato real de safetensors) |
| Parametros activos | no disponible (el sufijo "A3B" del modelo base sugiere del orden de 3.000 millones, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,02 bits de media; resto de pesos en BF16. Los pesos se almacenan de-cuantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha; la model card indica "License follows the base model" (hereda la de Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tarea declarada | text-generation (`image-text-to-text` entre las etiquetas) |
| Tamano del repositorio | 70,2 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura es de mezcla de expertos (MoE) sobre la familia Qwen3.5, heredada del modelo base Qwen/Qwen3.6-35B-A3B. La innovación de este checkpoint no está en el entrenamiento sino en el esquema de compresión: solo las capas de expertos enrutados se cuantizan, con una media de 2,02 bits por peso, mientras que las capas de atención, embeddings, normalizaciones y expertos compartidos permanecen en BF16. No se especifica el algoritmo de cuantización empleado, el tamaño de grupo, ni si se aplicó calibración con datos.

El punto crítico del diseño es que los pesos cuantizados se han vuelto a expandir a tensores BF16 antes de publicarse. Esto implica que la carga es totalmente compatible con `transformers` y vLLM sin kernels específicos, pero también que no hay ganancia de memoria en inferencia respecto a un BF16 completo: el repositorio de 70,2 GB es coherente con 35.107 millones de parámetros a 2 bytes por parámetro. La model card no documenta el dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO. Tampoco se detalla si el modelo base es multimodal nativo o si la etiqueta `image-text-to-text` proviene del modelo original.

## Capacidades

- Generación de texto conversacional (pipeline declarado `text-generation` y etiqueta `conversational`).
- Procesamiento de imagen y texto (`image-text-to-text`), presumiblemente heredado del modelo base; sin confirmación de detalle en la documentación.
- Compatibilidad con endpoints alojados (etiqueta `endpoints_compatible`).
- Carga directa en el ecosistema `transformers` y, según la model card, también en vLLM con pesos estándar.
- Razonamiento, generación de código, matemáticas, tool calling o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- No se documentan modos especiales (thinking, audio, agentes multi-paso).

## Casos de uso

- Investigación sobre cuantización extrema de MoE: el checkpoint sirve como banco de pruebas para medir la degradación de calidad al comprimir expertos enrutados a 2,02 bits, comparando contra el BF16 original en tareas controladas.
- Reproducción de pipelines de evaluación: al cargar con `transformers` sin kernels a medida, permite integrarse en arneses de evaluación existentes (lm-evaluation-harness, etc.) sin modificar el entorno.
- Estudio de transferencia de cuantización: analizar si el daño de cuantizar solo los expertos afecta de forma distinta a tareas de código, matemáticas o lenguaje natural.
- Despliegue interno en clúster con GPU de 80 GB: al ocupar unos 70 GB en BF16, puede servirse en una H100 o A100 de 80 GB para pruebas de latencia y throughput en vLLM.
- Comparación de metodologías de compresión: usar este r3 como referencia frente a otras variantes del mismo autor (el sufijo "r3" sugiere iteraciones previas) para aislar el efecto de la tasa de bits.
- Generación de datos sintéticos a escala en un entorno controlado, aprovechando la ventana de contexto del modelo base, siempre que se valide antes la calidad de salida tras la cuantización.
- Base para una re-cuantización posterior a 4 bits (AWQ/GPTQ/GGUF) si se necesita desplegar en hardware de menor VRAM, asumiendo el error acumulado de dos compresiones sucesivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica (MMLU, HumanEval, GSM8K ni equivalentes), ni comparación con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 70 GB solo para pesos en BF16 (35,1 B parámetros × 2 bytes), más caché KV y activaciones. Con contexto largo, la reserva adicional puede ser considerable.
- GPU recomendadas: una H100 de 80 GB o una A100 de 80 GB para servicio en una sola tarjeta; el margen es ajustado, por lo que contextos largos pueden requerir tensor parallelism.
- Multi-GPU: 2× A100 80 GB o 4× RTX 4090/RTX 3090 de 24 GB (96 GB agregados) mediante tensor parallelism en vLLM. Dos RTX 4090 (48 GB) no son suficientes para los pesos en BF16.
- Cabe en GPU de consumo: no en configuración por defecto. Solo sería viable en una única GPU de consumo tras una re-cuantización adicional a 4 bits (estimación orientativa de 18-20 GB), que no se distribuye en este repositorio.
- Opciones de despliegue: `transformers` (confirmado en la model card) y vLLM (confirmado); la etiqueta `endpoints_compatible` sugiere compatibilidad con Inference Endpoints. TGI y SGLang son plausibles pero no están confirmados. llama.cpp/Ollama requerirían convertir los safetensors a GGUF, algo que el repositorio no ofrece.
- Latencia y throughput: no disponibles. Al estar los expertos almacenados en BF16 de-cuantizado, no se espera aceleración por menor ancho de banda de memoria frente al modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minjaechoi/qwen36-35b-a3b-2p02bit-r3 | 35,1 B (MoE) | Expertos enrutados a 2,02 bits, almacenados en BF16 | no disponible | Hereda la del base | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1 B (MoE, mismo recuento) | BF16 | no disponible | La del modelo original | HuggingFace |
| Otras variantes del mismo autor (r1, r2, etc.) | no disponible | no disponible | no disponible | no disponible | no confirmadas |

No se dispone de datos de rendimiento para ninguno de los modelos comparados, por lo que la comparación se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor lo etiqueta como "internal research checkpoint", sin garantías de calidad ni soporte.
- La cuantización a 2,02 bits de los expertos enrutados es extremadamente agresiva; es esperable una degradación de calidad respecto al modelo base, aunque no se han publicado mediciones.
- No hay ganancia de VRAM en inferencia: los pesos se almacenan de-cuantizados en BF16, por lo que el consumo de memoria equivale a un modelo BF16 de 35 B (unos 70 GB).
- Sin benchmarks: no existe ninguna evidencia publicada sobre el impacto real de la compresión en tareas downstream.
- Licencia no disponible en la ficha: aunque la model card remite a la licencia del modelo base, esta no se reproduce, lo que introduce incertidumbre legal para uso comercial. Se debe verificar en el repositorio de Qwen/Qwen3.6-35B-A3B.
- Idiomas y cobertura multilingüe no documentados: no se puede asumir un rendimiento correcto en castellano sin evaluación previa.
- Longitud de contexto no especificada: cualquier despliegue con ventanas largas requiere verificación empírica.
- Cero descargas y cero likes: no hay validación por parte de la comunidad ni informes independientes de comportamiento.
- Riesgo de alucinación propio de los modelos generativos, potencialmente amplificado por la compresión.
- Los resultados de la búsqueda web asociados a esta consulta no contienen información técnica ni enlaces relevantes al modelo, por lo que no se han podido extraer referencias adicionales.
- La fecha de creación del repositorio (2026-09-17) es posterior al conocimiento de referencia de este análisis; los datos se limitan estrictamente a lo declarado en la ficha y la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen36-35b-a3b-2p02bit-r3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog, repositorio o demo del autor: no disponible
- Resultados de busqueda web relevantes: no disponible (los resultados obtenidos no guardan relación con el modelo)
