# RehmanKhalid/Qwen3.5-0.8B-CommonsenseQA-LoRA

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen3.5-0.8B` para la tarea de respuesta a preguntas de sentido común en formato de opción múltiple (A-E). El adaptador, desarrollado por RehmanKhalid, se ha afinado con el dataset `tau/commonsense_qa` mediante QLoRA (cuantización 4-bit NF4) y supervisión fina (SFT), con el objetivo de que el modelo responda únicamente con la letra correcta de la pregunta planteada. Es un ejemplo de especialización eficiente de un modelo pequeño (0.8B parámetros) para una tarea concreta, lo que permite desplegar sistemas de razonamiento de sentido común en entornos con recursos limitados. La relevancia actual radica en la tendencia hacia modelos compactos y adaptadores ligeros que reducen el coste de entrenamiento e inferencia sin renunciar a un rendimiento competitivo en tareas específicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.5-0.8B (base model no detallado) |
| Parametros totales | No disponible (el adaptador no reporta el número; el base model tiene 0.8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Entrenado con QLoRA 4-bit NF4; pesos del adaptador en safetensors (precisión completa) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (solo pesos del adaptador) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que introduce matrices de bajo rango en las capas de atención del modelo base, concretamente en los módulos `q_proj` y `v_proj`. El entrenamiento se realizó con QLoRA, que cuantiza el modelo base a 4-bit (NF4) para reducir el uso de memoria, y se aplicó SFT con una función de pérdida que solo considera la respuesta (la letra de la opción). Los hiperparámetros del adaptador son: rango `r=16`, `alpha=32`, dropout de 0.05. El dataset utilizado es `tau/commonsense_qa`, en su split de entrenamiento, y la evaluación se realiza sobre el split de validación con etiquetas públicas. No se especifican detalles adicionales sobre el dataset (número de tokens, composición) ni sobre el proceso de entrenamiento (épocas, tasa de aprendizaje, etc.).

## Capacidades

- Respuesta a preguntas de opción múltiple de sentido común en formato A-E, siguiendo el formato de CommonsenseQA.
- Generación de texto en inglés, limitada al contexto de la tarea entrenada.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-step, visión o audio.
- El adaptador está diseñado para ser cargado sobre el modelo base `Qwen/Qwen3.5-0.8B` mediante la librería PEFT.

## Casos de uso

- Evaluación de modelos de razonamiento de sentido común: investigadores pueden usar este adaptador como punto de partida para medir el impacto de diferentes técnicas de fine-tuning en la tarea CommonsenseQA, comparando con el modelo base sin adaptar.
- Benchmarking de adaptadores LoRA: sirve como referencia para estudiar la eficiencia de QLoRA en modelos pequeños, permitiendo reproducir experimentos con distintos rangos o datasets.
- Componente en pipelines de QA estructurado: en sistemas donde se necesita clasificar entre varias opciones de respuesta, el adaptador puede integrarse como un módulo que devuelve la letra correcta, reduciendo la latencia frente a modelos más grandes.
- Prototipado rápido de sistemas de preguntas y respuestas: gracias a su pequeño tamaño, se puede desplegar en entornos de desarrollo para validar flujos de conversación antes de escalar a modelos mayores.
- Fine-tuning adicional sobre dominios específicos: el adaptador puede servir como inicialización para tareas similares de QA de opción múltiple en otros dominios (por ejemplo, preguntas de conocimiento general), aprovechando el conocimiento de sentido común ya aprendido.
- Entornos educativos: es un ejemplo didáctico para demostrar el flujo completo de entrenamiento con PEFT/QLoRA, desde la carga del modelo base hasta la inferencia con el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que se debe reportar la precisión en el split de validación de CommonsenseQA, pero no se proporcionan valores numéricos. No se deben mezclar métricas de otros benchmarks (OpenBookQA, ARC, GSM8K) con el resultado de CommonsenseQA.

## Requisitos de hardware

- El adaptador en sí ocupa un espacio mínimo (repo de 0.0 GB), pero requiere cargar el modelo base de 0.8B parámetros.
- Para inferencia en FP16, se estima un uso de VRAM de aproximadamente 1.6 GB, lo que permite ejecución en GPUs consumer como NVIDIA GTX 1060 6GB, RTX 2060 o superiores.
- Con cuantización 4-bit del modelo base, el uso de VRAM puede reducirse a menos de 1 GB, permitiendo ejecución en dispositivos edge o CPUs con suficiente RAM.
- Opciones de despliegue: la librería `transformers` junto con `peft` es el método recomendado; también se puede exportar a formatos como GGUF para usar con `llama.cpp` u Ollama, aunque no se documenta explícitamente.
- No se dispone de mediciones oficiales de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adaptadores o modelos de la misma categoría. El único punto de referencia sería el modelo base `Qwen3.5-0.8B` sin adaptador, pero no se proporcionan resultados de rendimiento para ninguno de los dos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente en inglés y para el formato de opción múltiple A-E; no es adecuado para otros idiomas o formatos de pregunta abierta.
- Solo contiene los pesos del adaptador; es obligatorio cargar el modelo base `Qwen/Qwen3.5-0.8B` para su uso, lo que añade un paso adicional en el despliegue.
- No se han evaluado sesgos ni comportamientos fuera de la distribución de CommonsenseQA; puede presentar alucinaciones o respuestas incorrectas en preguntas fuera de su dominio.
- El dataset CommonsenseQA tiene sus propios términos de uso, que deben revisarse antes de cualquier aplicación comercial.
- La licencia Apache 2.0 del adaptador y del modelo base permite uso comercial, pero no exime del cumplimiento de las condiciones del dataset.
- No se proporcionan métricas de rendimiento, por lo que no se puede garantizar la precisión esperada en producción.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/RehmanKhalid/Qwen3.5-0.8B-CommonsenseQA-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset CommonsenseQA: https://huggingface.co/datasets/tau/commonsense_qa
- Información sobre Qwen3 (referencia general): https://arxiv.org/abs/2505.09388
