# mondk/Msh-Tiny-47M-GGUF

## Resumen

Msh-Tiny-47M es un modelo de lenguaje de 47 millones de parámetros desarrollado por mondk, entrenado completamente desde cero (random initialization) con una arquitectura estilo GPT-2. No parte de ningún modelo preentrenado: incluye un tokenizador BPE propio y una implementación personalizada de transformer en PyTorch. El repositorio actual contiene únicamente los pesos en formato GGUF, preparados para su uso con llama.cpp, Ollama y LM Studio.

El modelo se presenta como un proyecto educativo, no como un asistente de producción. Se entrenó sobre una combinación de 15 datasets abiertos de instrucción y chat, más un pequeño conjunto de conversación cotidiana. Su tamaño reducido lo hace ejecutable en hardware modesto, pero su capacidad de conocimiento y coherencia es limitada. Es relevante para quien quiera experimentar con modelos pequeños, cuantización GGUF o despliegue local en entornos con pocos recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer estilo GPT-2 (from-scratch) |
| Parametros totales | 47.233.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, q2k, q4km |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT-2, implementado desde cero en PyTorch. No se especifican el número de capas, dimensiones ocultas ni cabezas de atención en la información disponible. El tokenizador es un BPE también entrenado desde cero, personalizado para este modelo.

El entrenamiento se realizó desde inicialización aleatoria sobre una mezcla de 15 datasets públicos de instrucción y chat, más un pequeño conjunto manual de saludos y conversación cotidiana. Entre los datasets destacan Alpaca, Dolly-15k, OpenHermes-2.5, Code-Feedback, OASST1, medical-o1-reasoning-SFT, glaive-function-calling-v2, OpenAI HumanEval, no_robots, OpenThoughts-114k, Ultrachat 200k, poem_sentiment, aya_dataset y natural-questions. No se menciona el uso de RLHF ni DPO; el entrenamiento parece ser un fine-tuning supervisado (SFT) sobre estos datasets.

## Capacidades

- Generación de texto en formato chat con el prompt `<|user|>` / `<|assistant|>` y token de fin `<|end|>`.
- Sigue el formato de chat de forma fiable, pero con conocimiento limitado y ocasional incoherencia.
- Capacidad básica de seguir instrucciones simples, gracias a datasets como Alpaca y Dolly.
- Algo de generación de código, por los datasets Code-Feedback y HumanEval, aunque de calidad limitada por su tamaño.
- Posible soporte de function calling, dado el dataset glaive-function-calling-v2, pero sin garantía de funcionamiento correcto.
- Multilingüe solo en inglés; no se ha entrenado para otros idiomas.

## Casos de uso

- Proyecto educativo de NLP: permite estudiar cómo funciona un transformer pequeño entrenado desde cero, incluyendo el entrenamiento del tokenizador y la arquitectura.
- Experimentación con cuantización GGUF: sirve para probar los formatos f16, q2k y q4km en llama.cpp, Ollama o LM Studio, y comparar el impacto en tamaño y calidad.
- Demostración de despliegue local: al ser tan pequeño, se puede ejecutar en una Raspberry Pi o en un portátil sin GPU, mostrando que un modelo de chat básico puede funcionar en hardware de gama baja.
- Generación de respuestas de ejemplo en inglés para entornos de prueba: para testear pipelines de texto sin necesidad de un modelo grande.
- Base para fine-tuning educativo: al ser Apache 2.0 y tener pesos abiertos, se puede usar para practicar técnicas de ajuste fino en modelos pequeños.
- Análisis de limitaciones de modelos pequeños: útil para estudiar los límites de capacidad de modelos de 47M de parámetros en tareas de razonamiento o conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona datos de MMLU, HumanEval, GSM8K ni otros. No se pueden ofrecer comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para el modelo f16; con cuantización q4km, menos de 0,5 GB.
- GPU recomendadas: no requiere GPU, se ejecuta en CPU sin problemas. Cualquier CPU moderna es suficiente.
- Capacidad en consumer GPU: sí, cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en iGPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio (según la model card). También se puede cargar con transformers si se usa el modelo base safetensors, pero este repo es solo GGUF.
- Latencia y throughput: no se han publicado datos. Dado el tamaño, se espera latencia muy baja (milisegundos) y throughput alto incluso en CPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. Se puede comparar estructuralmente con otros modelos pequeños como SmolLM-135M o TinyLlama-1.1B, pero no hay benchmarks de Msh-Tiny-47M para hacer una comparación cuantitativa.

| Modelo | Params | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Msh-Tiny-47M | 47M | No disponible | Apache 2.0 | GGUF | Entrenado desde cero, educativo |
| SmolLM-135M | 135M | 2048 | Apache 2.0 | Safetensors, GGUF | Preentrenado, más capaz |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | Safetensors, GGUF | Preentrenado, mucho mayor |

## Limitaciones y advertencias

- Conocimiento limitado: al entrenarse desde cero con una cantidad modesta de datos, el modelo no posee conocimientos generales sólidos y puede producir respuestas incoherentes o incorrectas.
- Alucinaciones frecuentes: dado su tamaño y entrenamiento, es propenso a inventar información.
- Solo inglés: no soporta otros idiomas.
- Longitud de contexto no especificada: se desconoce la ventana máxima de tokens, por lo que en producción podría fallar con entradas largas.
- No es apto para uso en producción: el propio autor lo indica como proyecto educativo.
- La cuantización q2k puede degradar aún más la calidad de generación.
- No hay garantía de soporte de function calling a pesar de haber sido entrenado con un dataset de ese tipo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mondk/Msh-Tiny-47M-GGUF
- Modelo base safetensors: https://huggingface.co/mondk/Msh-Tiny-47M
- Repositorio alternativo (posible duplicado): https://huggingface.co/mondk/GGUF.msh-tiny
- Página de discusión del modelo: https://huggingface.co/mondk/GGUF.msh-tiny/discussions
- Guía de descarga de modelos GGUF (general): https://ggufloader.github.io/download-gguf-models.html (no específica del modelo)
