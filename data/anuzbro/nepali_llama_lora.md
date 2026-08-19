# anuzbro/nepali_llama_lora

## Resumen

El modelo `anuzbro/nepali_llama_lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario anuzbro, obtenido mediante fine-tuning del modelo base `unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit`, que corresponde a Llama 3.2 con 1.000 millones de parámetros en su versión instruct. El entrenamiento se realizó con la librería Unsloth, que acelera el proceso y permite trabajar con cuantización de 4 bits durante el fine-tuning. El repositorio tiene un tamaño de 0,1 GB, coherente con un adaptador LoRA de dimensiones reducidas.

A pesar de que el nombre sugiere un enfoque hacia el idioma nepalí, los metadatos indican que el idioma soportado es exclusivamente inglés (`language: en`), y no se proporciona información sobre el conjunto de datos de entrenamiento ni el propósito específico del modelo. La licencia es Apache 2.0, lo que permite uso comercial y modificación. El modelo se distribuye en formato safetensors y es compatible con text-generation-inference.

Dada la escasez de documentación y la ausencia de métricas o ejemplos de uso, esta ficha se basa únicamente en los metadatos disponibles y en las características heredadas del modelo base. No se dispone de información sobre rendimiento, benchmarks o casos de uso verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama) con adaptador LoRA |
| Parametros totales | no disponible (el modelo base tiene 1B, el adaptador LoRA no especifica su número) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Llama 3.2 1B, típicamente 128k, sin confirmar) |
| Tipos de cuantizacion | no disponible (el modelo base se entrenó con bnb-4bit, pero el adaptador no indica cuantización) |
| Idiomas soportados | en (inglés) según metadatos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Llama 3.2 1B Instruct, una arquitectura transformer decoder con atención causal. El fine-tuning se realizó con la librería Unsloth, que optimiza el entrenamiento mediante kernels personalizados y cuantización de 4 bits (bitsandbytes) durante el proceso. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas como RLHF o DPO. El único dato técnico adicional es que el entrenamiento fue "2x más rápido" gracias a Unsloth, según la model card.

Al ser un LoRA, solo se actualizan matrices de baja dimensión, lo que explica el reducido tamaño del repositorio (0,1 GB) en comparación con los pesos completos del modelo base.

## Capacidades

No se han documentado capacidades específicas para este adaptador. Como fine-tuning de Llama 3.2 1B Instruct, se espera que herede las capacidades generales del modelo base, que incluyen:

- Generación de texto y respuesta a instrucciones en inglés.
- Razonamiento básico y comprensión de lenguaje natural.
- Capacidad limitada para tareas de código y matemáticas (típica de modelos de 1B).
- Sin soporte explícito de tool calling, agentes o visión (no declarado).

Sin embargo, no hay evidencia empírica de que estas capacidades se mantengan o se hayan modificado tras el fine-tuning. No se menciona soporte multilingüe (a pesar del nombre) ni modos especiales de razonamiento.

## Casos de uso

No se han documentado casos de uso concretos para este modelo. Dada la falta de información sobre el dataset de entrenamiento y el propósito del autor, no es posible recomendar aplicaciones específicas con garantías. Los posibles usos serían los genéricos de un modelo instruct de 1B, como:

- Generación de texto corto o asistencia en redacción en inglés.
- Prototipos de chatbots sencillos con requisitos de baja latencia.
- Experimentación académica con fine-tuning de LoRA sobre Llama 3.2.

En cualquier caso, se recomienda validar el comportamiento del modelo en el dominio objetivo antes de utilizarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este adaptador.

## Requisitos de hardware

Al tratarse de un adaptador LoRA, la inferencia requiere cargar el modelo base (Llama 3.2 1B) más los pesos del adaptador. El modelo base en cuantización 4-bit ocupa aproximadamente 0,7 GB, por lo que:

- VRAM estimada: entre 1 y 2 GB para inferencia en 4-bit (modelo base + adaptador).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o incluso CPU con suficiente RAM.
- Compatible con GPUs de consumo: sí, la mayoría de tarjetas modernas pueden ejecutarlo.
- Opciones de despliegue: al ser un adaptador LoRA, puede cargarse con transformers y peft, o servirse con text-generation-inference (indicado en los tags). También es posible usar vLLM o llama.cpp si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este adaptador con otros modelos. Se podría comparar con el modelo base Llama 3.2 1B Instruct, pero no hay datos de rendimiento del adaptador. Tampoco se conocen otros fine-tunes de la misma familia con los que contrastar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| anuzbro/nepali_llama_lora | 1B (base) + LoRA | no disponible | Apache 2.0 | HuggingFace |
| unsloth/llama-3.2-1b-instruct-bnb-4bit | 1B | 128k (típico) | Llama 3.2 license | HuggingFace |

La comparativa es limitada por falta de datos del adaptador.

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos o dominios de aplicación.
- El nombre sugiere un enfoque nepalí, pero los metadatos indican solo inglés; esta discrepancia debe tenerse en cuenta.
- Al ser un modelo de 1B, su capacidad de razonamiento y generación es limitada en comparación con modelos mayores.
- Riesgo de alucinación y errores factuales, inherente a los modelos de lenguaje pequeños.
- No se han publicado evaluaciones de seguridad, sesgos o robustez.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Llama 3.2 tiene su propia licencia (Llama 3.2 Community License) que puede imponer restricciones adicionales; es necesario verificar ambas licencias antes de un despliegue comercial.
- El adaptador no incluye los pesos del modelo base, por lo que para su uso es necesario descargar ambos componentes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/anuzbro/nepali_llama_lora
- Modelo base: https://huggingface.co/unsloth/llama-3.2-1b-instruct-unsloth-bnb-4bit
- Librería Unsloth: https://github.com/unslothai/unsloth
