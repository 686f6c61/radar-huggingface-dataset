# rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_arc_42

## Resumen

`rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_arc_42` es un ajuste fino supervisado (SFT) del modelo `nvidia/Nemotron-Mini-4B-Instruct`, publicado por el usuario `rghosh8` en HuggingFace. Se trata de un checkpoint experimental de investigación, generado con la librería TRL, que parte de la base de NVIDIA y aplica un entrenamiento supervisado adicional sobre un conjunto de datos no documentado en la model card. El nombre del repositorio sugiere que forma parte de una línea de experimentos de referencia ("baseline") sobre la tarea ARC (Abstraction and Reasoning Corpus) con semilla 42.

El modelo hereda la arquitectura y el tamaño del Nemotron-Mini-4B-Instruct original: aproximadamente 4.190 millones de parámetros (4,19 B), pesos en formato safetensors y un repositorio de 8,4 GB. Está etiquetado como compatible con endpoints de HuggingFace y como modelo conversacional de generación de texto.

Su relevancia es limitada fuera del contexto de investigación: no cuenta con descargas ni interacciones, no declara licencia ni idiomas soportados, y la model card no incluye detalles sobre el dataset de entrenamiento, hiperparámetros o resultados de evaluación. Debe tratarse como un artefacto de experimentación reproducible más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de nvidia/Nemotron-Mini-4B-Instruct) |
| Parametros totales | 4.190.509.056 (4,19 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin concretar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por SFT del checkpoint `nvidia/Nemotron-Mini-4B-Instruct`, que a su vez es un transformer decoder-only de 4,19 B de parámetros. El entrenamiento se realizó con TRL 1.15.0 sobre Transformers 5.17.0, PyTorch 2.13.0+cu129, Datasets 5.1.0 y Tokenizers 0.23.3. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO posterior ni innovaciones técnicas adicionales.

El nombre del checkpoint (`SFT_baseline_arc_seed42`) apunta a un experimento de línea base sobre la tarea ARC con semilla fija 42, presumiblemente para comparar contra otras variantes de ajuste. No se documentan hiperparámetros (tasa de aprendizaje, épocas, batch size, schedule) ni la plantilla de chat empleada más allá del formato conversacional estándar de `transformers.pipeline`.

## Capacidades

- Generación de texto conversacional multi-turno (formato de mensajes `role`/`content`).
- Razonamiento y respuesta a preguntas en formato instruct (heredado del modelo base).
- Compatibilidad con `transformers.pipeline` y despliegue vía endpoints de HuggingFace (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente para este checkpoint.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de SFT: el checkpoint sirve como referencia ("baseline") para comparar el efecto de distintas configuraciones de ajuste supervisado sobre el mismo modelo base, gracias a la semilla fija (42) y a la nomenclatura explícita del experimento.
- Investigación sobre la tarea ARC: si el dataset de entrenamiento corresponde efectivamente a ARC, el modelo puede emplearse para estudiar la transferencia de razonamiento abstracto en modelos pequeños (~4 B) mediante SFT.
- Evaluación comparativa de checkpoints: al compartir base con `nvidia/Nemotron-Mini-4B-Instruct`, permite aislar la contribución del ajuste fino frente al modelo original en tareas de generación de texto.
- Pruebas de pipelines de TRL: útil como ejemplo funcional de un entrenamiento SFT completo con TRL 1.15.0 y Transformers 5.17.0 para validar flujos de trabajo de entrenamiento.
- Prototipado de asistentes conversacionales en local: con 4,19 B de parámetros y pesos safetensors, puede cargarse en GPUs de consumo para experimentar con generación conversacional, aunque sin garantías de calidad por falta de evaluación publicada.
- Docencia y formación: adecuado para ilustrar el ciclo completo de ajuste fino supervisado de un modelo instruct y su publicación en HuggingFace, dado el tamaño manejable y la trazabilidad del framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y caché KV (en torno a 10-12 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: ~4,5-5 GB; en 4 bits: ~2,5-3 GB (estimaciones teóricas, no verificadas para este checkpoint).
- GPU recomendadas: A100/H100 para entrenamiento o inferencia de alta concurrencia; L40S o RTX 6000 Ada para servicio; RTX 4090 (24 GB) para inferencia cómoda en FP16.
- GPU de consumo: cabe en RTX 3090/4090 en FP16 y en GPUs de 8-12 GB si se cuantiza (RTX 3060 12 GB, RTX 4070, etc.).
- Opciones de despliegue: `transformers.pipeline` con `device_map="auto"` (soporte nativo del repo); vLLM, TGI o llama.cpp/Ollama requerirían conversión a los formatos correspondientes (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_arc_42 | 4,19 B | no disponible | no disponible | HuggingFace (0 descargas) |
| nvidia/Nemotron-Mini-4B-Instruct (base) | 4 B aprox. | no disponible | no disponible en esta ficha | HuggingFace (modelo oficial de NVIDIA) |
| Alternativas de ~4 B instruct (p. ej., Phi-3-mini, Llama-3.2-3B-Instruct, Qwen2.5-3B-Instruct) | 3-4 B | 4K-128K según modelo | MIT / Llama / Apache-2.0 según modelo | HuggingFace, con cuantizaciones GGUF ampliamente disponibles |

La comparación con alternativas de la misma categoría es desfavorable en trazabilidad: frente a modelos oficiales con licencia clara, benchmarks publicados y ecosistema de cuantizaciones, este checkpoint carece de evaluación, licencia explícita y datos de entrenamiento documentados.

## Limitaciones y advertencias

- Licencia no disponible: la model card indica únicamente "licence: license", lo que impide determinar si el uso comercial está permitido. No debe utilizarse en producción sin aclarar este punto con el autor y con la licencia del modelo base de NVIDIA.
- Sin evaluación publicada: no hay benchmarks, métricas ni comparaciones que permitan estimar la calidad del ajuste frente al modelo base.
- Dataset de entrenamiento no documentado: se desconoce la composición, el tamaño y la procedencia de los datos de SFT, lo que impide evaluar sesgos y riesgo de contaminación.
- Riesgo de alucinación: inherente a los modelos de 4 B de parámetros; sin evaluación específica no puede cuantificarse.
- Idiomas no declarados: no hay garantía de rendimiento multilingüe más allá de lo que herede del modelo base.
- Contexto no documentado: se desconoce la longitud máxima de contexto efectiva de este checkpoint.
- Artefacto de investigación: 0 descargas y 0 interacciones; sin mantenimiento ni soporte del autor.
- Herencia del modelo base: cualquier sesgo o limitación de `nvidia/Nemotron-Mini-4B-Instruct` se traslada a este checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_arc_42
- Modelo base: https://huggingface.co/nvidia/Nemotron-Mini-4B-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
