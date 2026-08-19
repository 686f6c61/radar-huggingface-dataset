# kerasformers/qwen3.5-27b

## Resumen

El modelo `kerasformers/qwen3.5-27b` es una conversión pura en Keras 3 de los pesos del modelo original `Qwen/Qwen3.5-27B`, realizada por el autor de la librería KerasFormers. Su propósito es permitir cargar y ejecutar el modelo directamente desde Keras 3, sin depender del stack nativo de PyTorch o Transformers, facilitando la integración en proyectos que ya usan Keras como framework principal.

Al tratarse de una conversión de pesos, no introduce cambios en la arquitectura ni en el entrenamiento del modelo base: es el mismo modelo Qwen3.5-27B, pero con los pesos almacenados en formato Keras (posiblemente `.keras` o `.h5`) y acompañado de su `tokenizer.json`. El repositorio ocupa 51.3 GB, lo que sugiere pesos en bf16 (el propio README indica "Pure-Keras 3 conversion ... bf16"). La licencia es Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de esta conversión radica en que amplía el ecosistema de despliegue de modelos grandes fuera de los frameworks habituales. Para desarrolladores que ya trabajan con Keras 3 (ya sea con backend TensorFlow, JAX o PyTorch), esta versión permite cargar un modelo de 27B parámetros sin necesidad de instalar dependencias adicionales de Transformers. No obstante, la información pública disponible es escasa: no se detallan especificaciones técnicas del modelo base, ni benchmarks, ni instrucciones de uso más allá del snippet de código del README.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-27B, detalles no disponibles) |
| Parametros totales | no disponible (se infiere ~27B por el nombre, sin confirmar) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (según README) |
| Idiomas soportados | no disponible (hereda los del modelo base, no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (probablemente `.keras` o `.h5`), incluye `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo original `Qwen/Qwen3.5-27B`, del cual esta versión es una conversión de pesos. No se proporcionan detalles sobre la arquitectura interna (número de capas, dimensiones, tipo de atención, etc.) en la model card. Al ser una conversión, no hay información sobre el entrenamiento: no se especifican datos de entrenamiento, número de tokens, ni técnicas como RLHF o DPO. La única innovación técnica destacable es el propio proceso de conversión a Keras 3, que permite cargar el modelo mediante `kerasformers.models.qwen3_5.Qwen3_5Generate.from_weights()`. No se documentan optimizaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva: el snippet de código muestra una clase `Qwen3_5Generate` que sugiere generación de texto estándar.
- Tokenización integrada: se incluye `tokenizer.json` y una clase `Qwen3_5Tokenizer` para codificar y decodificar texto.
- Compatibilidad con múltiples backends de Keras 3: al ser una conversión Keras, puede ejecutarse con TensorFlow, JAX o PyTorch como backend.
- Capacidades del modelo base: al ser una conversión del Qwen3.5-27B, hereda las capacidades del modelo original (razonamiento, código, matemáticas, multilingüismo), pero no se documentan explícitamente en esta model card.
- No se menciona soporte de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Integración en pipelines existentes de Keras: si un equipo ya tiene infraestructura de entrenamiento o inferencia basada en Keras 3, este modelo permite añadir generación de texto sin introducir una pila tecnológica nueva.
- Prototipado rápido en Jupyter: los desarrolladores que trabajan con Keras pueden cargar el modelo con dos líneas de código y experimentar con generación de texto en entornos de notebook.
- Despliegue en entornos con restricciones de dependencias: al no requerir Transformers ni PyTorch (si se usa backend TensorFlow), puede desplegarse en entornos donde solo está permitido TensorFlow.
- Investigación en conversión de modelos: sirve como ejemplo práctico de cómo portar modelos grandes a Keras 3, útil para quienes estudian formatos de pesos y compatibilidad entre frameworks.
- Generación de texto en producción con backend JAX: si se usa JAX como backend, se pueden aprovechar las ventajas de compilación y paralelismo de JAX para inferencia de alto rendimiento.
- Fine-tuning posterior con Keras: los pesos convertidos pueden servir como punto de partida para fine-tuning usando las APIs de Keras 3, aunque no se documenta el procedimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. Al ser una conversión de pesos, se espera que el rendimiento sea idéntico al del modelo base `Qwen/Qwen3.5-27B`, pero no hay datos verificables en este repositorio.

## Requisitos de hardware

- Tamaño del repositorio: 51.3 GB, lo que sugiere pesos en bf16 (2 bytes por parámetro). Para 27B parámetros, el uso de VRAM en inferencia sería aproximadamente 54 GB en bf16, más overhead de activaciones y KV cache.
- GPU recomendadas: se necesitan GPUs con al menos 60-80 GB de VRAM para inferencia en bf16 sin cuantización. Ejemplos: NVIDIA A100 80GB, H100 80GB, o configuraciones multi-GPU.
- No cabe en GPUs de consumo habitual (RTX 4090 de 24GB, RTX 3090 de 24GB) sin cuantización a 8 bits o 4 bits. No se proporcionan versiones cuantizadas en este repositorio.
- Opciones de despliegue: al ser una conversión Keras, se puede usar con el runtime de Keras 3 (backend TensorFlow, JAX o PyTorch). No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la documentación.
- Latencia y throughput: no se proporcionan datos. Dependerán del hardware y del backend elegido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| kerasformers/qwen3.5-27b | ~27B (no confirmado) | no disponible | Apache 2.0 | Keras 3 | HuggingFace |
| Qwen/Qwen3.5-27B (original) | 27B (presumible) | no disponible | Apache 2.0 | safetensors | HuggingFace |
| Qwen/Qwen3-27B (versión anterior) | 27B | no disponible | Apache 2.0 | safetensors | HuggingFace |
| Llama 3.1 27B (hipotético, no existe) | - | - | - | - | - |

No se dispone de datos de rendimiento comparativos. La única diferencia clara es el formato de pesos: Keras 3 frente a safetensors/PyTorch. El modelo original de Qwen tiene documentación extensa y benchmarks publicados; esta conversión no los incluye.

## Limitaciones y advertencias

- Información técnica incompleta: la model card no detalla arquitectura, contexto, idiomas ni parámetros exactos. Se debe consultar la ficha del modelo original para obtener esas especificaciones.
- Sin benchmarks publicados: no hay métricas de rendimiento en este repositorio, lo que dificulta evaluar si la conversión introduce alguna degradación numérica.
- Compatibilidad limitada: el uso requiere la librería `kerasformers` (disponible en GitHub), que puede tener una comunidad y mantenimiento menores que los ecosistemas consolidados como Transformers.
- Riesgo de errores de conversión: aunque el autor indica que es una conversión pura, no se aportan pruebas de que los resultados sean bit-a-bit idénticos al modelo original. Se recomienda validar en casos de uso concretos.
- Alucinación y sesgos: al ser el modelo Qwen3.5-27B, hereda los sesgos y riesgos de alucinación del modelo base, que no están documentados en esta ficha.
- Requisitos de hardware elevados: con 51.3 GB de pesos en bf16, la inferencia requiere GPUs de gama alta o cuantización externa no proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero hay que revisar las restricciones del modelo base original por si tuviera cláusulas adicionales (aunque Qwen suele usar Apache 2.0).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/qwen3.5-27b
- Colección HuggingFace de Qwen3.5: https://huggingface.co/collections/kerasformers/qwen35-6a7e5421737d73e63669ebb9
- Repositorio de KerasFormers: https://github.com/IMvision12/KerasFormers
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-27B
