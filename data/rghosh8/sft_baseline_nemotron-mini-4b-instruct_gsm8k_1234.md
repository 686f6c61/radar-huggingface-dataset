# rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_gsm8k_1234

## Resumen

SFT_baseline_Nemotron-Mini-4B-Instruct_gsm8k_1234 es un ajuste fino supervisado (SFT) del modelo nvidia/Nemotron-Mini-4B-Instruct, publicado por el usuario rghosh8 en HuggingFace. Se trata de un artefacto de investigación académica orientado a experimentos de ajuste fino sobre el dataset GSM8K (problemas matemáticos de primaria), con semilla 1234, presumiblemente como línea base (baseline) para comparar contra otras técnicas de entrenamiento. No es un modelo de producción ni una release oficial de NVIDIA.

El modelo conserva la arquitectura y el tamaño del modelo base: 4.190.509.056 parámetros totales (aproximadamente 4,19 mil millones), pesos en formato safetensors y un repositorio de 8,4 GB. El entrenamiento se realizó con TRL 1.15.0 sobre Transformers 5.17.0 y PyTorch 2.13.0+cu129. La model card es la plantilla autogenerada por TRL y no incluye detalles sobre hiperparámetros, composición del dataset ni resultados de evaluación.

Su relevancia es limitada fuera del contexto de investigación: al no publicarse benchmarks, licencia clara ni idiomas soportados, debe tratarse como un checkpoint experimental. Resulta útil para quienes estudien el efecto del SFT sobre GSM8K en modelos pequeños, o para reproducir líneas base en experimentos de razonamiento matemático.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de nvidia/Nemotron-Mini-4B-Instruct; detalles no disponibles) |
| Parámetros totales | 4.190.509.056 (4,19 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por SFT del checkpoint nvidia/Nemotron-Mini-4B-Instruct, un transformer de aproximadamente 4,19 mil millones de parámetros. La model card no documenta la arquitectura interna del modelo base (número de capas, dimensiones, mecanismo de atención, uso de GQA/MQA, etc.), por lo que esos detalles deben consultarse en la ficha del modelo original de NVIDIA.

El entrenamiento se realizó con TRL 1.15.0 y Transformers 5.17.0 sobre PyTorch 2.13.0+cu129. El nombre del modelo sugiere un ajuste sobre el dataset GSM8K con semilla 1234, etiquetado como "SFT_baseline", lo que indica que se trata de una línea base para comparación con otros métodos (posiblemente RL, DPO u otras variantes de SFT). No se especifican hiperparámetros (learning rate, epochs, batch size, warmup), composición exacta del dataset, ni si hubo etapas adicionales de alineamiento tras el SFT.

## Capacidades

- Generación de texto conversacional en formato multi-turno (chat), heredada del modelo base.
- Razonamiento matemático orientado a problemas tipo GSM8K, presumiblemente reforzado por el ajuste fino, aunque no hay evaluación publicada que lo confirme.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del modelo base, no verificado en este checkpoint).
- Capacidades de agente y razonamiento multi-paso: no verificadas para este checkpoint.
- Capacidades multilingües: no disponibles.
- Modo "thinking" o razonamiento extendido: no disponible.
- Visión o audio: no disponible.

## Casos de uso

- Reproducción de líneas base en investigación sobre SFT: el checkpoint sirve como referencia para comparar el efecto de distintas configuraciones de SFT sobre GSM8K con semilla fija (1234), facilitando la reproducibilidad de experimentos.
- Estudio del sobreajuste en datasets pequeños: al estar entrenado sobre GSM8K, permite analizar cómo un modelo de 4 B parámetros se adapta a un corpus matemático específico y qué degradación sufre en capacidades generales.
- Evaluación comparativa de frameworks: útil para validar pipelines de entrenamiento con TRL 1.15.0 y Transformers 5.17.0 en entornos con CUDA 12.9.
- Punto de partida para ajustes posteriores: puede emplearse como inicialización para experimentos de DPO, RLHF o continuación de SFT sobre dominios matemáticos.
- Docencia y formación: ejemplo práctico de cómo se estructura un repositorio de modelo generado por TRL (`generated_from_trainer`) y de los metadatos que acompañan a un checkpoint SFT.
- Pruebas de integración con `transformers.pipeline`: el modelo es cargable mediante la API estándar de HuggingFace y compatible con endpoints, lo que permite validar despliegues en infraestructura propia con fines de test.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica de 10-12 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 2,5-3 GB para pesos (requiere generar la cuantización, no publicada).
- GPU recomendadas: A100 40 GB, H100, L40S para inferencia en FP16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para FP16 sin problemas; RTX 4080 (16 GB) y RTX 4070 Ti (12 GB) para FP16 con contexto limitado o cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y, con cuantización, en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (requiere GGUF), transformers con `pipeline`, endpoints compatibles de HuggingFace.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_gsm8k_1234 | 4,19 B | no disponible | no disponible | HuggingFace (0 descargas) | Checkpoint experimental de investigación |
| nvidia/Nemotron-Mini-4B-Instruct | ~4 B | no disponible en esta ficha | no disponible en esta ficha | HuggingFace (modelo base) | Modelo oficial de NVIDIA, base del ajuste |
| Alternativas de ~4 B (p. ej. Phi-3-mini, Qwen2.5-3B) | 3-4 B | 4K-128K según modelo | MIT/Apache-2.0 en la mayoría | HuggingFace, Ollama, vLLM | Modelos de producción con benchmarks publicados |

La comparación directa con alternativas de producción no es posible sin datos de evaluación del checkpoint. El modelo base de NVIDIA es la referencia natural; para alternativas comerciales de tamaño similar conviene consultar sus fichas respectivas, ya que este checkpoint no publica métricas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste SFT mejore (o no degrade) el rendimiento del modelo base en GSM8K u otras tareas.
- Licencia no especificada: la model card indica "licence: license" sin concretar términos, lo que impide determinar si el uso comercial está permitido. Debe verificarse la licencia del modelo base (nvidia/Nemotron-Mini-4B-Instruct) antes de cualquier uso en producción.
- Idiomas no declarados: se desconoce qué lenguas cubre el ajuste; el modelo base puede tener cobertura multilingüe, pero no está confirmada para este checkpoint.
- Riesgo de sobreajuste a GSM8K: al entrenarse sobre un dataset matemático específico, es probable la degradación en capacidades generales y conversacionales, aunque no hay evaluación que lo cuantifique.
- Riesgo de alucinación: inherente a los modelos de 4 B parámetros; sin evaluación específica, no puede descartarse.
- Sesgos: no documentados; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Modelo de investigación: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento aparente ni issues resueltos; no recomendado para producción.
- Longitud de contexto desconocida: no se puede planificar su uso en aplicaciones que requieran ventanas largas sin consultar la ficha del modelo base.

## Enlaces

- [HuggingFace: rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_gsm8k_1234](https://huggingface.co/rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_gsm8k_1234)
- [Modelo base: nvidia/Nemotron-Mini-4B-Instruct](https://huggingface.co/nvidia/Nemotron-Mini-4B-Instruct)
- [TRL (Transformers Reinforcement Learning)](https://github.com/huggingface/trl)
- [Dataset GSM8K (referencia)](https://huggingface.co/datasets/openai/gsm8k)
