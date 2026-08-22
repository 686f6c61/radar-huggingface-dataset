# Echoo113/Phi-3-mini-4k-instruct-dragon_prompted-ft4.44

## Resumen

El modelo `Echoo113/Phi-3-mini-4k-instruct-dragon_prompted-ft4.44` es un ajuste fino (fine-tuning) del modelo base `microsoft/Phi-3-mini-4k-instruct`, desarrollado por el usuario Echoo113. Se trata de un modelo de lenguaje de 3.800 millones de parámetros (3,8B) basado en una arquitectura Transformer decoder-only, con una ventana de contexto de 4.096 tokens. El ajuste se realizó mediante supervisión (SFT) utilizando la librería TRL de Hugging Face, aunque no se ha publicado información sobre el conjunto de datos utilizado ni el propósito específico del entrenamiento.

El modelo base, Phi-3-mini-4k-instruct, es conocido por su capacidad de razonamiento y generación de texto de alta calidad en un tamaño compacto, habiendo sido entrenado sobre 3,3 billones de tokens que combinan datos sintéticos y sitios web filtrados. Este fine-tuning hereda esas capacidades, pero al ser una adaptación sin documentación detallada, su rendimiento y comportamiento específico no han sido evaluados públicamente. El interés de este modelo radica en su disponibilidad como una variante ajustada de un modelo ya consolidado, aunque su falta de transparencia limita su uso en entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Phi-3-mini-4k-instruct) |
| Parámetros totales | 3.800 millones (3,8B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (depende del despliegue, el modelo base admite FP16, BF16, INT8, INT4) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, pero no se ha documentado para este fine-tuning) |
| Licencia | no disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo `microsoft/Phi-3-mini-4k-instruct`, que emplea una arquitectura Transformer decoder-only con atención causal. El modelo base tiene 3,8B parámetros y fue entrenado con 3,3 billones de tokens, combinando datos sintéticos de alta calidad y sitios web filtrados, con énfasis en propiedades de razonamiento denso. Posteriormente, se realizó un ajuste fino supervisado (SFT) y un proceso de alineación con feedback humano (RLHF) para el modelo base.

Para este fine-tuning concreto, el autor utilizó el framework TRL (versión 0.19.1) con entrenamiento SFT. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de pasos, la tasa de aprendizaje ni otras hiperparámetros. Tampoco se ha documentado si el modelo base fue congelado durante el entrenamiento o si se ajustaron todas las capas. El tamaño del repositorio (0,1 GB) sugiere que podría tratarse de un ajuste parcial o de pesos en formato de baja precisión, pero no hay confirmación técnica.

## Capacidades

- Generación de texto: el modelo base es capaz de producir texto coherente y contextualmente relevante, con buena calidad en tareas de instrucción y respuesta a preguntas.
- Razonamiento: el modelo base muestra un rendimiento notable en tareas de razonamiento lógico y matemático para su tamaño, con resultados en MMLU cercanos al 70%.
- Código: el modelo base tiene capacidad de generación de código, aunque no se especifica si el fine-tuning ha modificado esta capacidad.
- Multilingüismo: el modelo base soporta varios idiomas, aunque no se ha documentado el comportamiento del fine-tuning en lenguas distintas del inglés.
- Tool calling y agentes: el modelo base no está específicamente optimizado para tool calling, aunque puede adaptarse mediante prompt engineering.
- Capacidades especiales: no se ha documentado ninguna capacidad adicional (visión, audio, modo pensamiento, etc.) en el fine-tuning.

## Casos de uso

- Prototipado de chatbots conversacionales: al ser un modelo pequeño (3,8B), puede desplegarse en entornos con recursos limitados para crear asistentes de chat básicos. El fine-tuning podría ajustar el tono o dominio, aunque no se conoce el objetivo.
- Generación de contenido creativo: el modelo base es adecuado para escribir historias, poemas o ideas creativas; el fine-tuning podría estar orientado a temáticas específicas (por ejemplo, dragones, según el nombre), pero no hay evidencia.
- Educación y tutoría: el modelo puede responder preguntas y explicar conceptos en un contexto de aprendizaje, aprovechando su capacidad de razonamiento.
- Análisis de texto y resumen: puede resumir documentos o extraer información clave, siempre que se mantenga la ventana de contexto de 4k tokens.
- Experimentación con fine-tuning: este modelo sirve como ejemplo de cómo ajustar Phi-3-mini-4k-instruct con TRL, útil para desarrolladores que quieren aprender sobre SFT.
- Despliegue en edge devices: su tamaño compacto permite ejecutarse en dispositivos con poca memoria, como móviles o Raspberry Pi, para aplicaciones de procesamiento de lenguaje natural local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base `Phi-3-mini-4k-instruct` reporta un MMLU de 70%, HumanEval de 55,5% y GSM8K de 82,6% según su documentación oficial, pero estos resultados corresponden al modelo original y no al fine-tuning. No se puede asumir que el modelo ajustado mantenga estas métricas sin datos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - FP16: ~7,6 GB (suficiente para GPUs con 8 GB o más, como RTX 2070, RTX 3060, RTX 4060).
  - INT8 (cuantización): ~3,8 GB (cabe en GPUs de 4 GB, como RTX 3050 o GTX 1650).
  - INT4 (cuantización): ~2 GB (puede ejecutarse en GPUs con 2 GB, como GTX 1050 Ti, o incluso en CPU con suficiente RAM).
- GPUs recomendadas: RTX 3060, RTX 4070, A100, H100. Para uso en producción con alta concurrencia, se recomienda al menos una A100 40GB o similar.
- Compatibilidad con GPUs de consumo: sí, la mayoría de las tarjetas con 8 GB o más pueden ejecutar el modelo en FP16.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con pipeline.
- Latencia y throughput estimados: no disponibles, dependen del hardware y de la cuantización elegida. En una RTX 4090, se pueden obtener decenas de tokens por segundo con el modelo base, pero no se ha medido para el fine-tuning.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento (MMLU) | Disponibilidad |
|---|---|---|---|---|---|
| Phi-3-mini-4k-instruct (base) | 3,8B | 4k | MIT | 70% | Hugging Face |
| Echoo113/Phi-3-mini-4k-instruct-dragon_prompted-ft4.44 | 3,8B | 4k | no disponible | no disponible | Hugging Face |
| Llama-3-8B | 8B | 8k | Llama 3 license | 66% (aprox.) | Hugging Face |
| Mistral-7B-v0.2 | 7B | 8k | Apache 2.0 | 60,1% | Hugging Face |

La comparativa muestra que este fine-tuning no añade ninguna mejora técnica sobre el modelo base; su único interés es el posible ajuste de dominio, que no está documentado. En términos de rendimiento, el modelo base supera a Llama-3-8B en MMLU, pero pierde en contexto (4k vs 8k). La licencia del modelo base es MIT, pero la de este fine-tuning no está clara.

## Limitaciones y advertencias

- No se ha documentado el conjunto de datos de entrenamiento, lo que impide evaluar posibles sesgos introducidos en el fine-tuning.
- El modelo base tiene riesgo de alucinaciones, especialmente en temas de actualidad o información poco común.
- La ventana de contexto de 4k tokens es limitada para tareas que requieren contexto largo, como análisis de documentos extensos.
- La licencia no está claramente definida; aunque el modelo base es MIT, el fine-tuning podría tener restricciones adicionales que no se indican.
- No se ha validado el rendimiento en tareas específicas; es un modelo experimental sin garantías de producción.
- El tamaño del repo (0,1 GB) sugiere que podría tratarse de un ajuste parcial o de baja precisión, lo que puede afectar a la calidad del modelo.
- El nombre "dragon_prompted" sugiere una especialización temática, pero no hay evidencia ni documentación que lo confirme.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Echoo113/Phi-3-mini-4k-instruct-dragon_prompted-ft4.44
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Framework TRL: https://github.com/huggingface/trl
- Referencia del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/replicate/phi-3-mini-4k-instruct-microsoft
