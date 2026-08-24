# Kishan25/neuron-kd-qwen2.5-coder-0.5b-mlx-4bit

## Resumen

El modelo **Kishan25/neuron-kd-qwen2.5-coder-0.5b-mlx-4bit** es una versión cuantizada a 4 bits (MLX) del modelo Qwen2.5-Coder-0.5B-Instruct, afinado mediante destilación de conocimiento híbrida (pérdida de entropía cruzada a nivel de secuencia y divergencia KL sobre los logits del profesor) a partir del modelo Qwen2.5-Coder-32B-Instruct. El entrenamiento se realizó sobre el dataset MBPP de problemas de programación en Python, y posteriormente se fusionó el LoRA en los pesos base y se convirtió al formato MLX con cuantización de 4 bits (group size 64, affine). El resultado es un modelo de generación de código de 77,25 millones de parámetros, con un peso de aproximadamente 280 MB en disco, diseñado para ejecutarse completamente offline en dispositivos iOS mediante MLX Swift.

Este modelo está pensado como el motor de revisión de código de la aplicación iOS Neuron, en su módulo Code Lab. Su principal relevancia radica en ofrecer capacidades de generación de código Python en un entorno con recursos limitados, sin conexión a internet y con una huella de memoria muy reducida. Al estar basado en la arquitectura Qwen2.5, hereda el formato de prompt ChatML y puede integrarse fácilmente con las herramientas de MLX (mlx-lm y MLX Swift). A pesar de su tamaño compacto, se ha entrenado específicamente para resolver problemas de programación a partir de una descripción y un ejemplo de prueba, lo que lo hace adecuado para tareas de asistencia al desarrollo en entornos móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5) |
| Parametros totales | 77.252.992 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (group size 64, affine) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen2.5, un transformer decoder-only con atención de múltiples cabezas y capas de normalización pre-RMSNorm. No se ha modificado la estructura del modelo base, sino que se ha aplicado un ajuste fino mediante destilación de conocimiento. El proceso de entrenamiento consistió en:

- Destilación híbrida: se combinó la pérdida de entropía cruzada (CE) a nivel de secuencia con la divergencia KL sobre los logits del profesor (Qwen2.5-Coder-32B-Instruct).
- Dataset: problemas de Python del conjunto MBPP (Mostly Basic Python Problems), que incluye descripciones de problemas y ejemplos de tests.
- LoRA: se utilizó una adaptación de bajo rango (LoRA) que posteriormente se fusionó en los pesos base del modelo.
- Conversión: el modelo resultante se convirtió a formato MLX con cuantización de 4 bits (group size 64, affine).

No se especifican datos adicionales sobre el número de tokens de entrenamiento, el tamaño del dataset ni las técnicas de regularización empleadas. La destilación permite transferir el conocimiento del modelo de 32B a un modelo de 0.5B manteniendo un rendimiento razonable en tareas de programación.

## Capacidades

- Generación de código Python: el modelo puede escribir soluciones a partir de un enunciado de problema y un ejemplo de prueba.
- Revisión de código: está diseñado para funcionar como un revisor de código integrado en la aplicación iOS Neuron, ofreciendo sugerencias de implementación.
- Formato de conversación ChatML: soporta el prompt típico de ChatML, lo que facilita su uso en sistemas de chat y agentes.
- Ejecución offline: al estar cuantizado y optimizado para MLX, puede ejecutarse sin conexión a internet en dispositivos Apple Silicon.
- Integración con MLX Swift y mlx-lm: permite su uso tanto en aplicaciones nativas de iOS como en scripts Python.
- Especialización en Python: el entrenamiento se centra en problemas de programación en Python, lo que limita su utilidad a otros lenguajes.

## Casos de uso

- Asistente de código en dispositivos móviles: el modelo puede integrarse en una app iOS para generar fragmentos de código Python o sugerir correcciones mientras el desarrollador escribe, gracias a su tamaño reducido y su capacidad de ejecución local.
- Revisión de código en entornos sin conexión: un IDE o editor de código puede usar este modelo para ofrecer sugerencias de mejora o detectar errores comunes en Python, sin depender de servicios en la nube.
- Tutor de programación para estudiantes: puede utilizarse como un asistente educativo que explica cómo resolver problemas de programación básicos, mostrando soluciones paso a paso.
- Automatización de tareas de scripting: para generar scripts Python de automatización a partir de descripciones en lenguaje natural, por ejemplo en aplicaciones de productividad.
- Generación de código en entornos con recursos limitados: como parte de un sistema embebido o una Raspberry Pi, donde no se dispone de GPU potente, este modelo puede ejecutarse con pocos recursos.
- Prototipado rápido de soluciones: los desarrolladores pueden usarlo en entornos de desarrollo locales para obtener una primera versión de una función o algoritmo antes de refinar el código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, MBPP u otras. Aunque el modelo se ha entrenado sobre MBPP, no se proporcionan valores de precisión o tasas de éxito en ese dataset.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 77 millones de parámetros cuantizado a 4 bits, el uso de memoria es de aproximadamente 77,25 M × 4 bits ≈ 38,6 MB, más overhead de la aplicación. En la práctica, el tamaño del archivo es de 0,3 GB, lo que indica que cabe en cualquier dispositivo con al menos 512 MB de RAM disponible.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU, especialmente en Apple Silicon (M1/M2/M3) gracias a la librería MLX. También puede ejecutarse en GPUs NVIDIA con mlx-lm (que usa Metal) o en CPU convencional.
- Compatibilidad con consumer GPU: cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo, pero no es necesario; funciona perfectamente en CPU.
- Opciones de despliegue: mlx-lm para Python, MLX Swift para iOS/macOS, o cualquier framework que soporte el formato MLX (por ejemplo, vLLM no lo soporta directamente, pero puede convertirse a otros formatos).
- Latencia y throughput: no se proporcionan datos. Dado el tamaño pequeño, la latencia en CPU de Apple Silicon es del orden de decenas de milisegundos por token, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| Qwen2.5-Coder-0.5B-Instruct (original) | ~494M | 32k | Apache-2.0 | safetensors | Modelo base sin cuantizar, mayor precisión pero más pesado |
| Neuron KD (este modelo) | 77.25M | no disponible | Apache-2.0 | safetensors (MLX 4-bit) | Cuantizado y destilado, optimizado para iOS |
| CodeLlama-7B | 7B | 16k | Llama2 license | safetensors | Mucho más grande, requiere más recursos |
| DeepSeek-Coder-1.3B | 1.3B | 16k | MIT | safetensors | Alternativa de código abierto de tamaño similar |

La comparativa muestra que este modelo es significativamente más pequeño que otros modelos de código, a costa de una menor capacidad general. Su ventaja es la portabilidad a dispositivos móviles.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés y en Python: no se recomienda para otros idiomas ni para otros lenguajes de programación.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar soluciones incorrectas o incompletas, especialmente en problemas complejos.
- Contexto limitado: aunque no se ha especificado la longitud de contexto, el modelo base Qwen2.5-Coder-0.5B tiene 32k tokens, pero el ajuste fino sobre MBPP puede haber reducido la capacidad de manejar contextos largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder también es Apache-2.0, sin restricciones adicionales.
- Calidad de la destilación: al destilar de un modelo de 32B a uno de 0.5B, la calidad de las soluciones puede ser inferior a la del profesor.
- No soporta tool calling, ni agentes, ni multimodalidad. Es exclusivamente de texto.
- El número de parámetros (77M) es inusualmente bajo para un modelo "0.5B"; podría ser un error del autor o una reducción drástica del modelo base. No se ha verificado la consistencia con el nombre.

## Enlaces

- [Hugging Face: Kishan25/neuron-kd-qwen2.5-coder-0.5b-mlx-4bit](https://huggingface.co/Kishan25/neuron-kd-qwen2.5-coder-0.5b-mlx-4bit)
- [Technical report de Qwen2.5-Coder (arXiv)](https://arxiv.org/html/2409.12186v2)
- [MLX Swift](https://github.com/ml-explore/mlx-swift)
- [mlx-lm](https://github.com/ml-explore/mlx-lm)
