# Balab2021/Nemotron-3.5-Lightning-30B-A3B-LoRA

## Resumen

El modelo **Balab2021/Nemotron-3.5-Lightning-30B-A3B-LoRA** es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario Balab2021, que se aplica sobre el modelo base **NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16** de NVIDIA. Este modelo base emplea una arquitectura híbrida de Mixture-of-Experts (MoE) que intercala capas Mamba-2 y capas de atención selectiva, con un total de 30 mil millones de parámetros de los cuales solo 3 mil millones se activan por token. El adaptador se entrenó mediante QLoRA (cuantización de 4 bits) con rank 16 y alpha 32, sobre las proyecciones de las capas de atención y de las redes feed-forward, durante 3 épocas.

La relevancia de este adaptador radica en que permite ajustar el modelo base de 30B parámetros de forma eficiente en términos de memoria y computación, gracias a la técnica QLoRA, sin necesidad de reentrenar todos los pesos. Esto facilita la especialización del modelo para tareas concretas en entornos con recursos limitados. Sin embargo, el repositorio no incluye información sobre el conjunto de datos de entrenamiento, la tarea objetivo ni métricas de evaluación, por lo que su utilidad práctica depende de la disponibilidad de esos datos por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Mamba-2 + MoE + Attention (modelo base) |
| Parametros totales | 30B (modelo base) |
| Parametros activos | 3B (modelo base) |
| Longitud de contexto | No disponible (el adaptador se entreno con 2048 tokens) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 (adaptador); BF16 (modelo base) |
| Idiomas soportados | No disponible |
| Licencia | other (ver enlaces) |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

El modelo base **NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16** presenta una arquitectura híbrida que combina capas Mamba-2 (modelos de espacio de estado) con capas de MoE y capas de atención selectiva. Esta combinación busca equilibrar eficiencia computacional y capacidad de modelado de dependencias de largo alcance. Con 30B parámetros totales y solo 3B activos por token, el modelo está diseñado para inferencia rápida y bajo consumo de memoria en tareas de agente siempre activos.

El adaptador LoRA se entrenó con QLoRA (cuantización de 4 bits en formato NF4) sobre el modelo base. Los hiperparámetros reportados son: rank 16, alpha 32, módulos objetivo (gate_proj, up_proj, down_proj, q_proj, k_proj, v_proj, o_proj), 3 épocas, tasa de aprendizaje 0.0002, longitud máxima de secuencia 2048 y tamaño de batch efectivo 8. La pérdida final de entrenamiento fue 1.231879730133494. No se especifica el conjunto de datos utilizado ni el proceso de alineación (RLHF, DPO, etc.).

## Capacidades

- Generación de texto y razonamiento: al heredar las capacidades del modelo base, el adaptador puede realizar tareas de generación de lenguaje natural, razonamiento y comprensión contextual.
- Soporte de tool calling: el modelo base está diseñado para tareas de agentes y puede integrarse con herramientas externas mediante llamadas a funciones, aunque el adaptador no añade ni modifica esta capacidad de forma explícita.
- Capacidades multilingües: no hay información disponible sobre los idiomas soportados por el modelo base ni por el adaptador.
- Eficiencia en inferencia: gracias a la arquitectura MoE con 3B parámetros activos, el modelo base ofrece un rendimiento superior en latencia y throughput en comparación con modelos densos de tamaño similar.
- No se dispone de información sobre capacidades especiales como modo de pensamiento, visión o audio.

## Casos de uso

- Fine-tuning especializado para dominios concretos: el adaptador puede utilizarse para ajustar el modelo base a un corpus específico (por ejemplo, documentación técnica, textos jurídicos o médicos) mediante QLoRA, reduciendo los requisitos de memoria frente a un fine-tuning completo.
- Desarrollo de agentes conversacionales: dado que el modelo base está orientado a tareas de agentes, el adaptador puede aplicarse para personalizar el comportamiento del agente en un dominio particular, como atención al cliente o asistencia técnica.
- Experimentación académica: investigadores pueden emplear este adaptador como punto de partida para estudiar el impacto de QLoRA sobre arquitecturas híbridas Mamba-MoE, comparando con otros métodos de adaptación.
- Prototipado rápido en entornos con una sola GPU: al tratarse de un adaptador LoRA, es posible cargar el modelo base en BF16 y aplicar el adaptador sin necesidad de reentrenar, lo que permite iterar rápidamente sobre diferentes configuraciones.
- Despliegue en producción con cuantización adicional: combinando el adaptador con el modelo base cuantizado (por ejemplo, GGUF), se puede desplegar en CPU o GPUs de gama media para tareas de generación de texto a baja latencia.
- Evaluación de robustez: el adaptador puede servir para probar cómo el fine-tuning con QLoRA afecta a la capacidad de generalización del modelo base en tareas de razonamiento o código, aunque no se han publicado métricas al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del adaptador no incluye métricas de evaluación, y la búsqueda web no proporciona datos comparativos sobre rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en BF16 requiere aproximadamente 60 GB de memoria para los pesos (30B parámetros × 2 bytes). Con cuantización 4-bit, se reduce a unos 15 GB, aunque el adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: para BF16, se necesitan GPUs profesionales como A100 (80 GB) o H100 (80 GB). Con cuantización 4-bit, es posible usar GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), siempre que se gestione la memoria de activaciones.
- Opciones de despliegue: el modelo base es compatible con bibliotecas como vLLM, llama.cpp, Ollama y TGI, aunque el adaptador LoRA requiere el uso de PEFT (por ejemplo, `peft` de Hugging Face) para cargarse junto al modelo base.
- Latencia y throughput: no hay datos publicados. La arquitectura MoE con 3B activos sugiere una inferencia más rápida que un modelo denso de 30B, pero los valores concretos dependen del hardware y la optimización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de la misma categoría. El modelo base comparte características con otros MoE como Mixtral 8x7B o Qwen2.5-MoE, pero no se han encontrado datos comparativos en la información proporcionada. Se recomienda consultar la documentación oficial de NVIDIA para obtener métricas de rendimiento del modelo base.

## Limitaciones y advertencias

- El adaptador se entrenó con una longitud máxima de secuencia de 2048 tokens, lo que limita el contexto efectivo del modelo a ese valor, incluso si el modelo base soporta ventanas más largas.
- No se ha especificado el conjunto de datos de entrenamiento ni la tarea objetivo, por lo que no es posible conocer el dominio de especialización ni evaluar posibles sesgos introducidos durante el fine-tuning.
- La licencia se indica como "other", lo que implica que pueden existir restricciones adicionales para uso comercial o redistribución. Se recomienda revisar la licencia del modelo base de NVIDIA y la del adaptador antes de su uso en producción.
- No se han publicado métricas de calidad ni benchmarks, por lo que no se puede garantizar el rendimiento en tareas concretas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que el adaptador no ha sido validado por la comunidad.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente si se usa fuera de su dominio de entrenamiento.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/Balab2021/Nemotron-3.5-Lightning-30B-A3B-LoRA
- Modelo base en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Página del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Página de NVIDIA sobre Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- GGUF del modelo base: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Adaptador LoRA para tool calling (referencia): https://huggingface.co/PursuitOfDataScience/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-ToolCall-LoRA
