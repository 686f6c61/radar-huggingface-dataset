# protocolsyncllc/medgap-qwen-3.5-9b

## Resumen

MedGap Qwen 3.5 9B es un ajuste fino (fine-tuning) del modelo Qwen 3.5 9B de Alibaba, publicado por el usuario protocolsyncllc bajo licencia Apache 2.0. El modelo está especializado en el dominio de dispositivos médicos y, más concretamente, en el corpus de cartas de advertencia (warning letters) que la FDA estadounidense emite a fabricantes que incumplen la normativa. El objetivo declarado es adaptar un modelo generalista de 9.653 millones de parámetros a un vocabulario y a unos patrones de razonamiento regulatorios muy específicos.

El ajuste se ha realizado con la librería Unsloth mediante LoRA, una sola época de entrenamiento, un learning rate de 2e-4 y un único dataset en formato JSONL (`medical-devices.jsonl`). El autor indica que el entrenamiento se llevó a cabo en una sola GPU NVIDIA GeForce RTX 3060, lo que sitúa el proceso en el rango de consumo doméstico. El repositorio incluye pesos en safetensors y una cuantización GGUF Q8_0 lista para inferencia local.

La relevancia del modelo es acotada pero clara: cubre un nicho (cumplimiento regulatorio FDA de dispositivos médicos) para el que los modelos generalistas no están alineados. No obstante, la información pública es escasa (una sola época, un dataset no descrito en detalle y sin benchmarks publicados), por lo que debe evaluarse como un experimento de dominio más que como un modelo de producción validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen 3.5 9B; detalles de atención y capas no disponibles) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 publicado; safetensors en precisión original (no se detallan otros formatos) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-9B`, un transformer decoder-only denso de aproximadamente 9.650 millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado con LoRA usando Unsloth, una librería que optimiza el entrenamiento de modelos grandes en GPUs de consumo mediante kernels fusionados y gestión eficiente de memoria. Los hiperparámetros declarados son: 1 época, learning rate 2e-4 y dataset `medical-devices.jsonl`, derivado del dataset `protocolsyncllc/fda-warning-letters`.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, el rango de LoRA, si hubo RLHF/DPO posterior ni innovaciones técnicas adicionales más allá del propio pipeline de Unsloth. Tampoco se documenta la longitud de contexto efectiva tras el ajuste, por lo que se asume la del modelo base, sin confirmación pública.

## Capacidades

- Generación de texto en inglés orientada a contenido regulatorio de dispositivos médicos.
- Respuestas conversacionales de un solo turno o multi-turno (pipeline `text-generation` y `conversational`).
- Reproducción de vocabulario y estructuras propias de las cartas de advertencia de la FDA (terminología de cumplimiento, referencias a secciones normativas, formato de hallazgos).
- Capacidad de razonamiento general heredada del modelo base Qwen 3.5 9B (no validada específicamente en esta ficha).
- Soporte de tool calling / function calling: no documentado para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no documentadas.

## Casos de uso

- Redacción asistida de respuestas a cartas de advertencia de la FDA: el modelo puede generar borradores de contestación con la terminología y estructura habituales en el sector de dispositivos médicos, reduciendo el tiempo de revisión legal inicial.
- Análisis de correspondencia regulatoria: clasificación y resumen de hallazgos (observaciones 483, warning letters) para priorizar acciones correctivas en un sistema de calidad.
- Formación interna de equipos de asuntos regulatorios: generación de casos sintéticos y preguntas de evaluación basadas en el estilo real de las cartas de la FDA.
- Extracción de patrones de incumplimiento: identificación de las categorías de no conformidad más frecuentes (etiquetado, CAPA, diseño, esterilización) para alimentar paneles de indicadores.
- Soporte a auditorías internas: generación de checklists y guiones de auditoría inspirados en las observaciones históricas de la FDA.
- Prototipado rápido de asistentes de cumplimiento: al estar disponible en GGUF Q8_0, puede desplegarse en una estación de trabajo con GPU de consumo para pruebas internas antes de escalar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 19-20 GB solo para pesos, más overhead de contexto (típicamente 22-24 GB en total). En GGUF Q8_0, alrededor de 10-11 GB para pesos, con overhead adicional según longitud de contexto.
- GPU recomendadas: para FP16, A100 40 GB, H100 80 GB o RTX 4090 24 GB (ajustada). Para Q8_0, RTX 3090/4090 24 GB o RTX 4080 16 GB con contexto moderado.
- Cabe en GPU de consumo: sí, en Q8_0 en GPUs de 12-16 GB con contexto limitado; en FP16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp y Ollama para el GGUF Q8_0; vLLM, TGI o transformers con Unsloth para los pesos safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| MedGap Qwen 3.5 9B | 9,65 B | No disponible | Apache 2.0 | Cartas FDA / dispositivos médicos | Hugging Face (safetensors + GGUF Q8_0) |
| Qwen 3.5 9B (base) | ~9,65 B | No disponible | Apache 2.0 | Generalista | Hugging Face |
| Modelos médicos generalistas de ~7-9 B | ~7-9 B | Variable | Variable | Clínica general | Hugging Face |

No se dispone de datos de rendimiento comparativos publicados para este ajuste, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado con una sola época y un dataset no descrito en detalle: riesgo elevado de sobreajuste al estilo del corpus y de degradación de capacidades generales del modelo base.
- Especialización muy estrecha (cartas FDA de dispositivos médicos): no debe usarse como asesor regulatorio ni como sustituto de revisión legal humana.
- Riesgo de alucinación en referencias normativas (números de sección, plazos, citas de la FDA): cualquier salida debe verificarse contra fuentes oficiales.
- Idioma limitado al inglés; no se ha validado su comportamiento en castellano.
- No hay benchmarks ni evaluación independiente publicados, lo que impide cuantificar su calidad frente al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el usuario.
- El repositorio ocupa 248,4 GB, lo que incluye múltiples artefactos; conviene descargar solo los ficheros necesarios.
- Solo 1 like y 4.060 descargas en el momento de la consulta: escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protocolsyncllc/medgap-qwen-3.5-9b
- GGUF Q8_0: https://huggingface.co/protocolsyncllc/medgap-qwen-3.5-9b/blob/main/medgap-qwen-3.5-9b_q8_0.gguf
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
- Dataset: https://huggingface.co/datasets/protocolsyncllc/fda-warning-letters
- Unsloth: https://github.com/unslothai/unsloth
