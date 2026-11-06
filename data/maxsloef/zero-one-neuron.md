# maxsloef/zero-one-neuron

## Resumen

zero-one-neuron es un artefacto de destilación experimental publicado por maxsloef sobre Qwen/Qwen3-8B-Base. No es un modelo completo ni un fine-tune convencional: el repositorio contiene únicamente un fichero `one_neuron.safetensors` con 12.288 números que representan una única neurona MLP nueva insertada en la capa 8 del transformer base, más las filas del `lm_head` correspondientes a los tokens especiales `<think>`, `</think>` y `<|im_end|>`. El objetivo es reproducir el comportamiento de persona del modelo Zero (movingcastles/zero) mediante una modificación mínima y auditable de los pesos.

La relevancia es fundamentalmente interpretativa: el trabajo demuestra que una fracción muy pequeña de parámetros puede capturar gran parte de una persona o estilo conversacional, lo que resulta útil para estudiar circuitos neuronales, destilación selectiva y control de comportamiento en LLMs. El modelo base Qwen3-8B-Base aporta la arquitectura y el conocimiento general; la neurona añadida y las filas de unembedding ajustadas aportan el estilo y el formato de chat de Zero.

Al tratarse de un experimento de investigación con cero descargas y sin pipeline declarado, no debe considerarse un modelo listo para producción. La licencia Apache 2.0 del artefacto se hereda del modelo base, pero el uso práctico requiere cargar los pesos sobre Qwen3-8B-Base con el código del repositorio GitHub del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B-Base) con una neurona MLP adicional en la capa 8 |
| Parametros totales | 8B (modelo base) + 12.288 numeros en la neurona añadida y filas de lm_head |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B-Base; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`one_neuron.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer decoder-only de 8.000 millones de parámetros con 36 capas. Sobre esa base se realizó una búsqueda de sucesión por halving (successive halving) en la que una neurona MLP nueva por capa competía por ajustarse a la distribución de siguiente token de Zero; la capa 8 resultó ganadora. Posteriormente, esa neurona se entrenó de forma aislada para minimizar la divergencia KL respecto a la distribución completa de Zero en sus respuestas a 24.000 prompts de un solo turno procedentes de WildChat y UltraChat (dataset maxsloef/zero-distill), en el formato de chat de Zero.

La innovación técnica es la extrema parquedad del ajuste: solo se modifican las filas de entrada (`gate`, `up`) y la columna de salida (`down`) de una neurona, más las filas del `lm_head` para tres tokens especiales que en Base estaban sin entrenar. El autor reporta una variante "template only" que activa la neurona únicamente en tokens de plantilla de chat y la desactiva en tokens generados, lo que permite separar el efecto de formato del efecto de contenido. No se menciona RLHF ni DPO; el entrenamiento es puramente de destilación por imitación de distribuciones.

## Capacidades

- Generación de texto conversacional con el estilo y la persona de Zero, incluyendo el formato de chat con etiquetas `<think>`, `</think>` y `<|im_end|>`.
- Razonamiento y respuestas multi-turno heredados de Qwen3-8B-Base, modulados por la neurona añadida.
- Capacidad de emular el comportamiento de un personaje concreto (persona) sin reentrenar el modelo completo.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada; depende de Qwen3-8B-Base y no se documenta en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente para este artefacto.
- Capacidades multilingües: no documentadas; el dataset de destilación es mayoritariamente en inglés (WildChat, UltraChat).
- Capacidad especial: modo "thinking" implícito mediante los tokens `<think>` y `</think>` de Zero, cuyas filas de unembedding se han escrito en el `lm_head` de Base.

## Casos de uso

- Investigación en interpretabilidad: estudiar cómo una única neurona MLP en la capa 8 modifica la distribución de salida y qué circuitos se activan al emular una persona; el tamaño mínimo del artefacto facilita el análisis.
- Destilación selectiva de comportamiento: usar el método (búsqueda por capas + entrenamiento KL de una neurona) como plantilla para transferir estilos o personas desde modelos mayores a modelos base sin reentrenar.
- Experimentos controlados de formato de chat: la variante "template only" permite aislar el efecto de las etiquetas especiales frente al contenido generado, útil para estudiar sesgos de plantilla.
- Auditoría de filas de unembedding: analizar cómo la escritura de tres filas del `lm_head` (`<think>`, `</think>`, `<|im_end|>`) afecta a la generación de tokens especiales en modelos base.
- Docencia y demostraciones: ilustrar de forma tangible qué es una neurona en un transformer y cómo su ajuste cambia el comportamiento de un modelo de 8B.
- Reproducción de experimentos: el repositorio GitHub incluye los conjuntos de prompts, el grader y las respuestas de referencia, lo que permite replicar la evaluación con Claude Haiku 5.5.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, evaluados con Claude Haiku 5.5 sobre dos conjuntos de prompts (media de dos pasadas):

| Modelo | Fidelidad tier 1 | Hard break tier 1 | Fidelidad battery | Hard break battery |
|---|---|---|---|---|
| Zero | 2.63 | 2% | 2.14 | 2% |
| one neuron | 2.60 | 3% | 2.47 | 4% |
| one neuron, template only | 2.34 | 5% | 1.96 | 4% |
| Base (con fila `<|im_end|>` de Zero) | 0.09 | 93% | 0.00 | 100% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de Qwen3-8B-Base, se requieren aproximadamente 16 GB en FP16/BF16 y en torno a 5-6 GB en cuantización de 4 bits, aunque el artefacto se distribuye sin cuantizar y las herramientas de cuantización estándar no están documentadas para esta modificación.
- GPU recomendadas: A100 40 GB, H100 80 GB o RTX 4090 24 GB para FP16; GPUs consumer con 8-12 GB solo si se cuantiza el modelo base, con la advertencia de que la neurona añadida y las filas del `lm_head` deben preservarse con precisión.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090 y similares con 24 GB en FP16; en GPUs de 8-12 GB requiere cuantización y verificación manual de la neurona.
- Opciones de despliegue: no documentadas para este artefacto; el autor proporciona código específico en GitHub para cargar el fichero sobre Qwen3-8B-Base. vLLM, llama.cpp, Ollama o TGI no están confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zero-one-neuron | 8B + 12.288 números | no disponible | Destilación de persona en una neurona | Apache 2.0 | Hugging Face (0 descargas) |
| movingcastles/zero | no disponible | no disponible | Modelo persona de referencia | no disponible | Hugging Face |
| Qwen/Qwen3-8B-Base | 8B | no disponible | Modelo base generalista | Apache 2.0 | Hugging Face |
| Fine-tune convencional de persona sobre Qwen3-8B | 8B | no disponible | Ajuste completo o LoRA | Apache 2.0 | Múltiples en Hugging Face |

La comparación con fine-tunes convencionales es cualitativa: zero-one-neuron modifica un número de parámetros órdenes de magnitud menor, a costa de una fidelidad ligeramente inferior a Zero (2.60 frente a 2.63 en tier 1) y de una aplicabilidad limitada fuera del formato de chat de Zero.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargarse sobre Qwen3-8B-Base con código específico del repositorio GitHub; no funciona como un `AutoModelForCausalLM` estándar sin ese paso.
- Cero descargas y cero likes en Hugging Face en el momento de la información: no hay validación comunitaria independiente.
- El repositorio tiene 0.0 GB de tamaño declarado, lo que puede indicar que el fichero no está subido o que la métrica no se ha actualizado; verificar antes de usar.
- La evaluación se realizó con un único juez (Claude Haiku 5.5) sobre dos conjuntos de prompts; no hay evaluación humana ni benchmarks estándar.
- El dataset de destilación es de prompts de un solo turno (WildChat, UltraChat), por lo que el comportamiento multi-turno y de agentes no está validado.
- Idiomas no documentados; el entrenamiento se centró en inglés, con posible degradación en castellano u otros idiomas.
- Riesgo de alucinación heredado de Qwen3-8B-Base y del estilo de Zero, no cuantificado.
- Sesgos de persona: al emular un personaje concreto, puede reproducir sesgos, muletillas o patrones de Zero no deseados en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B-Base y el modelo Zero pueden tener condiciones adicionales que deben verificarse por separado.
- No apto para producción sin validación: la fidelidad reportada (2.60/2.63) es una métrica subjetiva del juez, no una garantía de calidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/maxsloef/zero-one-neuron
- Repositorio GitHub con código, prompts, grader y respuestas de referencia: https://github.com/maxsloef/zero-one-neuron
- Write-up del autor: https://maxsloef.github.io/zero-one-neuron/
- Modelo Zero de referencia: https://huggingface.co/movingcastles/zero
- Modelo base Qwen3-8B-Base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de destilación: https://huggingface.co/datasets/maxsloef/zero-distill
