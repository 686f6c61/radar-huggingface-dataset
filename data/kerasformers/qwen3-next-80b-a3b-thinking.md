# kerasformers/qwen3-next-80b-a3b-thinking

## Resumen

`kerasformers/qwen3-next-80b-a3b-thinking` es una conversión íntegra en Keras 3 del modelo `Qwen/Qwen3-Next-80B-A3B-Thinking` de Alibaba, publicada por el proyecto comunitario KerasFormers. Su propósito es permitir ejecutar un modelo de 80 mil millones de parámetros con 3 mil millones activos (MoE) usando un único código fuente que funciona sin modificaciones sobre TensorFlow, PyTorch o JAX, lo que facilita la experimentación y el despliegue en entornos heterogéneos.

El modelo original combina una arquitectura híbrida Gated-DeltaNet con mezcla de expertos, pensada para ofrecer un equilibrio entre calidad de generación y eficiencia computacional. Esta conversión mantiene los pesos originales en bfloat16 y añade la flexibilidad del ecosistema Keras 3, con soporte para los tres backends principales. Es relevante ahora porque permite a los desarrolladores que trabajan con Keras acceder a modelos de última generación sin necesidad de migrar a PyTorch, y porque abre la puerta a aprovechar aceleradores TPU mediante el backend de JAX.

La ficha se basa exclusivamente en la información publicada en la model card de HuggingFace; los datos no disponibles se indican explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated-DeltaNet + MoE híbrida |
| Parametros totales | 80B |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos originales) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | bfloat16, formato de pesos de Keras 3 |

## Arquitectura y entrenamiento

El modelo base `Qwen3-Next-80B-A3B-Thinking` emplea una arquitectura híbrida que combina Gated-DeltaNet, un mecanismo de atención lineal recurrente eficiente, con capas de mezcla de expertos (MoE). De los 80 mil millones de parametros totales, solo 3 mil millones se activan por token, lo que reduce significativamente el coste de inferencia en comparacion con un modelo denso del mismo tamano. El sufijo "Thinking" indica que la variante esta optimizada para razonamiento deliberado, aunque la model card no detalla el proceso de entrenamiento especifico.

La conversion a Keras 3 no modifica los pesos ni la arquitectura; reimplementa el modelo con la API funcional de Keras 3, permitiendo que el mismo codigo se ejecute en TensorFlow, PyTorch y JAX. Los pesos se almacenan en bfloat16, manteniendo la precision del modelo original. No se proporciona informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni el uso de tecnicas como RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva: el modelo produce texto coherente y contextualizado, como corresponde a un LLM de 80B con 3B activos.
- Razonamiento y modo "thinking": el nombre del modelo sugiere soporte para modos de razonamiento deliberado, aunque no se detalla en la model card.
- Compatibilidad multi-backend: gracias a Keras 3, el mismo codigo funciona en TensorFlow, PyTorch y JAX, lo que permite cambiar de backend sin reescribir la logica.
- Inferencia en bfloat16: los pesos estan almacenados en bfloat16, reduciendo el uso de memoria frente a fp32.
- Pipeline de generacion de texto: integrado con la API `generate` de KerasFormers, que facilita la decodificacion con parametros como `max_new_tokens`.
- No se mencionan capacidades de tool calling, vision, audio ni funciones de agente en la informacion proporcionada.

## Casos de uso

- Inferencia en entornos con TPU: al ejecutarse sobre el backend de JAX, el modelo puede aprovechar aceleradores TPU de Google Cloud, reduciendo costes en despliegues a gran escala.
- Desarrollo de aplicaciones con Keras: los equipos que ya usan Keras para prototipado pueden integrar este LLM sin salir de su ecosistema, usando la misma API para preprocesado, entrenamiento y generacion.
- Evaluacion comparativa de backends: investigadores pueden medir diferencias de latencia y throughput entre TensorFlow, PyTorch y JAX usando exactamente los mismos pesos y codigo, algo dificil de lograr con implementaciones nativas.
- Fine-tuning con Keras 3: la conversion permite ajustar el modelo con la API de Keras (por ejemplo, LoRA) y exportarlo a cualquiera de los tres backends, simplificando el flujo de experimentacion.
- Despliegue en infraestructura heterogenea: si una organizacion mezcla GPUs NVIDIA y TPUs, este modelo puede desplegarse en ambas sin cambios de codigo, solo cambiando la variable de entorno `KERAS_BACKEND`.
- Prototipado rapido de agentes conversacionales: aunque no se documenta tool calling, el modelo puede usarse como base para sistemas de chat o asistentes que requieran generacion de texto de alta calidad con un coste de inferencia moderado gracias a sus 3B activos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones de MMLU, HumanEval, GSM8K ni ninguna otra prueba estandar. Para datos de rendimiento del modelo original, se remite al paper tecnico de Qwen3 (arXiv:2505.09388) y a la model card del modelo base en HuggingFace.

## Requisitos de hardware

- Tamano del repositorio: 159.5 GB en bfloat16, lo que implica aproximadamente 160 GB de VRAM para cargar el modelo completo en memoria.
- GPU recomendadas para carga completa: 2x NVIDIA A100 80GB o 2x H100 80GB en configuracion multi-GPU.
- GPU consumer: una RTX 4090 (24 GB) no puede cargar el modelo completo; se requeriria cuantizacion a 8 bits (~80 GB) o 4 bits (~40 GB), que no esta disponible en esta conversion segun la informacion publicada.
- Opciones de despliegue: la libreria KerasFormers proporciona la clase `Qwen3NextTextGenerate` para inferencia local; no se menciona soporte para vLLM, llama.cpp u Ollama en esta conversion.
- Latencia y throughput: no se proporcionan datos numericos; dependen del backend elegido y del hardware. El modo MoE con 3B activos reduce el coste por token frente a un modelo denso de 80B.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Framework | Licencia |
|---|---|---|---|---|---|
| kerasformers/qwen3-next-80b-a3b-thinking | 80B | 3B | no disponible | Keras 3 (TF/Torch/JAX) | Apache 2.0 |
| Qwen/Qwen3-Next-80B-A3B-Thinking (original) | 80B | 3B | no disponible | PyTorch | Apache 2.0 |
| Qwen/Qwen3-30B-A3B (referencia, no confirmado) | 30B | 3B | no disponible | PyTorch | Apache 2.0 |

La comparativa principal es con el modelo original de Qwen: misma arquitectura, mismos pesos y misma licencia. La diferencia clave es la implementacion: la version de KerasFormers ofrece portabilidad entre tres backends, mientras que la version oficial esta limitada a PyTorch. No se dispone de datos de rendimiento para comparar con otros modelos MoE como DeepSeek-V3 o Mixtral en esta informacion.

## Limitaciones y advertencias

- Solo soporta ingles segun la model card; no se garantiza un rendimiento adecuado en otros idiomas.
- El tamano del repositorio (159.5 GB) hace que la carga en memoria sea costosa y requiera hardware de gama alta o tecnicas de cuantizacion que no estan documentadas en esta conversion.
- No se proporcionan benchmarks propios, por lo que el rendimiento real en tareas especificas debe verificarse experimentalmente.
- La conversion a Keras 3 puede introducir diferencias numericas menores frente a la implementacion original de PyTorch, aunque los pesos se mantienen en bfloat16.
- Riesgo de alucinacion inherente a los LLM de este tamano; no se documentan medidas especificas de mitigacion.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones del modelo base de Qwen si se redistribuyen pesos modificados.
- No se menciona soporte para tool calling, vision ni audio; el modelo es exclusivamente de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kerasformers/qwen3-next-80b-a3b-thinking
- Repositorio de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentacion de Qwen3-Next en KerasFormers: https://imvision12.github.io/KerasFormers/qwen3_next/
- Coleccion Qwen3-Next en HuggingFace: https://huggingface.co/collections/kerasformers/qwen3-next-6a7e551ff86ebf2cca455ef1
- Modelo base original: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Thinking
- Paper: Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Paper: Qwen2.5-1M Technical Report (arXiv:2501.15383): https://arxiv.org/abs/2501.15383
- Paper: YaRN (arXiv:2309.00071): https://arxiv.org/abs/2309.00071
