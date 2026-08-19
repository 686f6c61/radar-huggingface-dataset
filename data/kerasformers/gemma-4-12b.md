# kerasformers/gemma-4-12b

## Resumen

`kerasformers/gemma-4-12b` es una conversión íntegra en Keras 3 del modelo `google/gemma-4-12B` de Google, desarrollada por el proyecto comunitario KerasFormers. Su objetivo es ofrecer una implementación unificada que se ejecuta sin modificaciones sobre TensorFlow, PyTorch o JAX, permitiendo a los desarrolladores que ya trabajan con Keras 3 integrar un modelo multimodal de última generación sin depender de un backend concreto.

Se trata de la variante de 12B parámetros de la familia Gemma 4, con arquitectura transformer densa de 48 capas, ventana de contexto de 256K tokens y vocabulario de 262K entradas. El modelo acepta entradas de texto, imagen y audio, y genera texto como salida, lo que lo convierte en una opción versátil para tareas multimodales. Los pesos se distribuyen en bfloat16 y el repositorio ocupa 24 GB.

La relevancia de esta conversión radica en que elimina la fricción de usar Gemma 4 en entornos Keras, ofreciendo una API coherente (`Gemma4UnifiedProcessor`, `Gemma4UnifiedConditionalGenerate`) y la posibilidad de cambiar de backend sin tocar el código. Es una alternativa práctica para equipos que ya han estandarizado su stack en Keras 3 y necesitan capacidades any-to-any.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 48 capas, sliding window de 1024 tokens |
| Parametros totales | 11.95B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | bfloat16 (por defecto), float32, int8 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (no se especifica si es safetensors, GGUF u otro) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 48 capas con atención de ventana deslizante de 1024 tokens y una longitud de contexto total de 256K tokens. El vocabulario alcanza las 262K entradas, lo que permite una cobertura amplia de tokens. A diferencia de otras variantes de la familia Gemma 4, esta versión de 12B no utiliza arquitectura MoE, sino que todos los parámetros están activos en cada forward pass. Soporta tres modalidades de entrada (texto, imagen y audio) y genera texto, siguiendo el pipeline any-to-any.

No se dispone de información sobre el entrenamiento del modelo original (dataset, número de tokens, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. La conversión de KerasFormers no modifica los pesos, solo reimplementa la arquitectura y el flujo de inferencia en Keras 3, por lo que las características de entrenamiento son las del modelo de Google. La innovación técnica de esta versión reside en la portabilidad entre backends: una única implementación corre en TensorFlow, PyTorch y JAX, con carga en bfloat16 por defecto y opciones de cuantización int8.

## Capacidades

- Generación de texto a partir de instrucciones en lenguaje natural, con soporte para conversaciones multi-turno.
- Procesamiento de imágenes como entrada, permitiendo descripción, análisis visual y respuesta a preguntas sobre el contenido.
- Procesamiento de audio como entrada, habilitando tareas de transcripción, descripción de sonidos o respuesta a consultas basadas en audio.
- Entrada multimodal combinada: el modelo puede recibir simultáneamente imagen, audio y texto en una misma conversación.
- Ventana de contexto de 256K tokens, adecuada para documentos largos o historiales de conversación extensos.
- Ejecución en múltiples backends (TensorFlow, PyTorch, JAX) mediante Keras 3, con la misma API de generación.

## Casos de uso

- Asistente de accesibilidad multimodal: el modelo puede recibir una imagen y un clip de audio, y generar una descripción textual de ambos, útil para personas con discapacidad visual o auditiva en aplicaciones de asistencia en tiempo real.
- Análisis de documentos técnicos con figuras y diagramas: dado un PDF escaneado (convertido a imagen) y texto de contexto, el modelo puede extraer información y responder preguntas sobre el contenido, aprovechando los 256K tokens de contexto para documentos extensos.
- Transcripción y resumen de reuniones: se alimenta el audio de una reunión junto con notas textuales, y el modelo genera un resumen estructurado, integrable en flujos de productividad empresarial.
- Moderación de contenido en plataformas sociales: el modelo analiza imágenes, audio y texto de publicaciones para detectar contenido inapropiado, generando un veredicto textual que puede ser revisado por un humano.
- Generación de descripciones de productos en comercio electrónico: a partir de una foto del producto y una breve ficha técnica, el modelo redacta una descripción comercial completa, reduciendo el trabajo manual en catálogos grandes.
- Prototipado rápido de aplicaciones multimodales en Keras 3: los desarrolladores pueden construir y probar pipelines que combinan visión, audio y lenguaje sin cambiar de framework, gracias a la compatibilidad con TensorFlow, PyTorch y JAX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de KerasFormers no incluye métricas como MMLU, HumanEval o GSM8K, y remite a la model card original de Google para detalles de rendimiento, que no se han proporcionado en este contexto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 11.95B parámetros en bfloat16, el modelo ocupa aproximadamente 24 GB de memoria solo en pesos. Con cuantización int8, el uso se reduce a unos 12 GB. A esto hay que sumar la memoria para activaciones y caché de atención, que crece con la longitud de contexto.
- GPU recomendadas: para bfloat16 se necesitan GPUs con al menos 32 GB de VRAM (por ejemplo, A100 40GB, H100 80GB). Con int8, una RTX 4090 de 24 GB podría ser suficiente para contextos moderados, aunque no está garantizado para los 256K tokens completos.
- No se indica soporte para vLLM, llama.cpp, Ollama o TGI; la implementación está pensada para ejecutarse directamente con Keras 3 y sus backends.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

La siguiente tabla compara las variantes de la familia Gemma 4 según los datos de la model card:

| Modelo | Parámetros totales | Capas | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|
| Gemma 4 E2B | 2.3B efectivos (5.1B con embeddings) | 35 | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E4B | 4.5B efectivos (8B con embeddings) | 42 | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B (este) | 11.95B | 48 | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 31B Dense | 30.7B | 60 | 256K | Texto, imagen | Apache 2.0 |

La variante de 12B ofrece el equilibrio entre capacidad y requisitos de hardware, con el doble de contexto que las versiones E2B y E4B, y soporte de audio que la 31B no tiene. No se dispone de comparativas con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés; su rendimiento en otros idiomas no está garantizado.
- Al ser una conversión de la comunidad, no hay garantía de paridad exacta de rendimiento con la implementación oficial de Google, aunque los pesos sean idénticos.
- No se han publicado benchmarks propios de esta conversión, por lo que el rendimiento real en tareas específicas debe validarse de forma independiente.
- El riesgo de alucinación es inherente a los modelos generativos; se recomienda verificación humana en aplicaciones críticas.
- La ventana de contexto de 256K tokens implica un alto consumo de memoria durante la inferencia; es necesario planificar los recursos hardware adecuadamente.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia del modelo base original de Google para confirmar que no hay restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kerasformers/gemma-4-12b
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de Gemma 4 en KerasFormers: https://imvision12.github.io/KerasFormers/gemma4_unified/
- Modelo base original de Google: https://huggingface.co/google/gemma-4-12B
