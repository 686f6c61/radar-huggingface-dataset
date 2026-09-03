# Resandula/netrocortex-qwen14b-lora

## Resumen

Netrocortex-qwen14b-lora es un modelo de lenguaje fine-tuneado a partir de Qwen2.5-14B-Instruct, desarrollado por el usuario Resandula. Se trata de una adaptación del modelo base mediante la técnica LoRA (Low-Rank Adaptation) aplicada sobre una versión cuantizada en 4 bits (bnb-4bit) del instruct de Qwen2.5, lo que permite un entrenamiento más rápido y eficiente en memoria. El modelo está pensado para generación de texto en inglés y se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en pipelines de producción.

La relevancia de este modelo radica en que parte de una base sólida como Qwen2.5-14B-Instruct, conocida por su buen rendimiento en razonamiento, código y tareas multilingües, y lo adapta con un fine-tune específico. Aunque no se detallan los datos de entrenamiento ni las tareas concretas del fine-tune, el modelo hereda las capacidades generales del base y ofrece una alternativa ligera en cuanto a requisitos de entrenamiento gracias a LoRA. Con 14.770 millones de parámetros y un tamaño de repositorio de 29,6 GB, es un modelo de tamaño medio-grande que puede ejecutarse en GPUs de gama alta o con cuantización adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredado de Qwen2.5-14B, presumiblemente 128k, pero no confirmado) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión completa; el base era bnb-4bit) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención de múltiples cabezas y normalización RMSNorm. El fine-tune se realizó con la librería Unsloth y Hugging Face TRL, utilizando LoRA sobre el modelo base `unsloth/Qwen2.5-14B-Instruct-bnb-4bit`. Esto implica que solo se entrenaron matrices de adaptación de bajo rango, reduciendo drásticamente el número de parámetros entrenables y el coste computacional. No se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. El modelo base ya incluía instrucciones y capacidades de chat, por lo que el fine-tune probablemente busca especializarlo en un dominio concreto, aunque no se detalla cuál.

## Capacidades

- Generación de texto en inglés con estilo instructivo, heredado de Qwen2.5-Instruct.
- Razonamiento y resolución de problemas, gracias a la base Qwen2.5.
- Generación de código y soporte básico de programación (capacidad del modelo base).
- Conversación multi-turno y seguimiento de instrucciones.
- No se confirma soporte de tool calling, agentes o modo thinking en este fine-tune específico.
- No se indica soporte de visión ni audio; es un modelo de texto puro.

## Casos de uso

- Asistente virtual para atención al cliente en inglés: el modelo puede mantener conversaciones contextuales y resolver dudas frecuentes, aprovechando la base instructiva de Qwen2.5.
- Generación de documentación técnica: dado su entrenamiento en instrucciones, puede redactar guías, manuales o respuestas a preguntas técnicas.
- Prototipado rápido de chatbots: al ser un fine-tune ligero, se puede desplegar en entornos de desarrollo para validar flujos conversacionales antes de escalar.
- Análisis de sentimiento y clasificación de texto: con un fine-tune adicional o mediante prompting, puede categorizar opiniones o comentarios en inglés.
- Asistente de programación: puede ayudar a generar fragmentos de código, explicar algoritmos o depurar errores, aunque no se ha verificado su rendimiento específico en esta tarea.
- Educación y tutoría: puede responder preguntas de estudiantes en inglés, explicar conceptos y proporcionar ejemplos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con otros modelos. Por tanto, no es posible cuantificar su rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 14.770 millones de parámetros, en precisión fp16 se requieren aproximadamente 29,5 GB de VRAM. Con cuantización a 4 bits (no incluida en el repo, pero posible mediante herramientas como llama.cpp o GPTQ), se podría reducir a unos 8-10 GB.
- GPU recomendadas: para fp16, una NVIDIA A100 (40 GB), RTX A6000 (48 GB) o similar. Para cuantización 4 bits, una RTX 3090/4090 (24 GB) sería suficiente.
- No cabe en GPUs de consumo de gama baja (8 GB) sin cuantización agresiva.
- Opciones de despliegue: al ser un modelo transformers estándar, se puede servir con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama (tras conversión).
- Latencia y throughput: no disponibles. Dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Resandula/netrocortex-qwen14b-lora | 14,77B | no disponible | Apache-2.0 | Hugging Face |
| Qwen2.5-14B-Instruct (base) | 14,77B | 128k (oficial) | Apache-2.0 | Hugging Face |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Hugging Face |
| Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache-2.0 | Hugging Face |

El modelo se sitúa en la gama de 14B, similar a Qwen2.5-14B, pero con un fine-tune específico. Comparado con modelos de 7-8B, ofrece más capacidad de razonamiento, aunque requiere más recursos. No se dispone de datos de rendimiento para comparar directamente.

## Limitaciones y advertencias

- No se ha documentado el propósito del fine-tune ni los datos utilizados, por lo que su especialización es desconocida.
- Riesgo de alucinaciones, especialmente en tareas factuales, como cualquier modelo generativo.
- Solo soporta inglés; no se garantiza un buen rendimiento en otros idiomas.
- La longitud de contexto no está confirmada; aunque el base soporta 128k, el fine-tune podría haber reducido la ventana efectiva.
- No se han publicado evaluaciones de sesgos ni de seguridad; se recomienda auditar antes de usar en producción.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el fine-tune no infrinja los términos del modelo base (Qwen2.5 también es Apache-2.0, por lo que no hay conflicto).
- El repositorio no incluye cuantizaciones listas para usar; habría que convertirlas manualmente para despliegues ligeros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Resandula/netrocortex-qwen14b-lora
- Modelo base (unsloth/Qwen2.5-14B-Instruct-bnb-4bit): https://huggingface.co/unsloth/Qwen2.5-14B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Qwen2.5: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
