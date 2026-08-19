# kerasformers/gemma-4-e4b-it

## Resumen

`kerasformers/gemma-4-e4b-it` es una conversión íntegra al ecosistema Keras 3 del modelo multimodal `google/gemma-4-E4B-it` de Google, publicada por el proyecto comunitario KerasFormers. El modelo original pertenece a la familia Gemma 4 y combina capacidades de procesamiento de texto, imagen y audio para generar respuestas de texto, lo que lo convierte en un modelo "any-to-any" (entrada multimodal, salida textual). Esta conversión permite ejecutar el mismo modelo sin modificaciones sobre TensorFlow, PyTorch o JAX, simplemente cambiando la variable de entorno `KERAS_BACKEND`, lo que facilita la experimentación y el despliegue en entornos heterogéneos.

La variante E4B es un modelo denso de 4.500 millones de parámetros efectivos (8.000 millones contando embeddings), con 42 capas, ventana de contexto de 128.000 tokens y un vocabulario de 262.000 entradas. Incorpora un codificador de visión de aproximadamente 150 millones de parámetros y un codificador de audio de unos 300 millones. Los pesos se distribuyen en bfloat16 y el repositorio ocupa 15,9 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta conversión radica en que acerca los modelos Gemma 4 a la comunidad de Keras, que hasta ahora dependía de implementaciones específicas de cada framework. Al ofrecer una única implementación portable entre backends, reduce la fricción para desarrolladores que trabajan con TensorFlow o JAX y quieren aprovechar las capacidades multimodales de Gemma 4 sin salir de su ecosistema habitual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención de ventana deslizante (sliding window de 512 tokens), multimodal (texto, imagen, audio) |
| Parametros totales | 8.000 millones con embeddings (4.500 millones efectivos) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | bfloat16 por defecto; soporta `quantization="int8"` para reducir uso de memoria |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado en la documentación (carga mediante `from_weights` de kerasformers) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E4B-it` es un transformer denso con atención de ventana deslizante de 512 tokens, diseñado para manejar secuencias largas de hasta 128.000 tokens. Cuenta con 42 capas, un vocabulario de 262.000 tokens y dos codificadores adicionales: uno de visión (~150M de parámetros) y otro de audio (~300M), que permiten procesar entradas multimodales. La conversión de KerasFormers reproduce fielmente esta arquitectura en Keras 3, manteniendo los pesos originales en bfloat16.

No se dispone de información detallada sobre el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. La conversión de KerasFormers no modifica los pesos, solo reimplementa la arquitectura y el flujo de inferencia en Keras 3, por lo que las características de entrenamiento son las del modelo de Google. La innovación principal de esta versión es la portabilidad entre backends: una única implementación que funciona sin cambios en TensorFlow, PyTorch y JAX, además de la integración con el procesador `Gemma4Processor` para entradas mixtas de imagen, audio y texto.

## Capacidades

- Generación de texto a partir de instrucciones en inglés, incluyendo razonamiento, respuesta a preguntas y diálogo multi-turno.
- Procesamiento multimodal: acepta imágenes y audio como entrada adicional al texto, y genera descripciones o respuestas basadas en el contenido de ambos.
- Codificador de visión integrado (~150M de parámetros) para comprensión de imágenes.
- Codificador de audio integrado (~300M de parámetros) para procesamiento de clips de audio.
- Ventana de contexto de 128.000 tokens, adecuada para documentos largos o conversaciones extensas.
- Soporte de carga en bfloat16 por defecto, con opción de cuantización int8 para reducir requisitos de memoria.
- Ejecución portable entre backends de Keras 3 (TensorFlow, PyTorch, JAX) mediante la variable `KERAS_BACKEND`.
- No se documentan capacidades explícitas de tool calling, function calling o modo agente en la información proporcionada.

## Casos de uso

- Descripción automática de imágenes: el modelo puede recibir una imagen y generar un texto descriptivo detallado, útil para accesibilidad, generación de metadatos o moderación de contenido. Su codificador de visión de 150M de parámetros permite capturar detalles visuales relevantes.
- Transcripción y análisis de audio: al aceptar clips de audio como entrada, puede transcribir o resumir contenido hablado, lo que resulta práctico para reuniones, entrevistas o material de archivo. El codificador de audio de 300M de parámetros está diseñado para esta tarea.
- Asistentes multimodales interactivos: combinando imagen, audio y texto en una misma conversación, el modelo puede responder preguntas sobre un vídeo o una fotografía mientras escucha una explicación, habilitando aplicaciones de asistencia en tiempo real.
- Procesamiento de documentos largos: con 128.000 tokens de contexto, puede resumir o extraer información de informes extensos, artículos científicos o libros completos sin necesidad de dividir el texto.
- Experimentación con múltiples backends: los desarrolladores que trabajan con TensorFlow o JAX pueden probar el mismo modelo en diferentes entornos sin cambiar el código, gracias a la implementación unificada de Keras 3. Esto es útil para comparar rendimiento o integrar el modelo en pipelines existentes.
- Prototipado rápido en investigación: al ser una conversión directa de los pesos oficiales, los investigadores pueden evaluar las capacidades multimodales de Gemma 4 E4B sin necesidad de configurar el stack original de Google, acelerando la validación de hipótesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de KerasFormers no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Para datos de evaluación del modelo original, se debe consultar la model card de `google/gemma-4-E4B-it` en HuggingFace.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 15,9 GB en bfloat16, por lo que la inferencia requiere al menos 16 GB de VRAM para cargar los pesos completos. Con cuantización int8, el uso de memoria podría reducirse a aproximadamente 8-10 GB, aunque no se especifica el valor exacto.
- GPUs recomendadas: para ejecución en bfloat16 sin cuantización, se necesitan GPUs con 24 GB o más, como NVIDIA RTX 4090, A100 (40/80 GB) o H100. Con int8, podría caber en GPUs de 16 GB como la RTX 4080 o la A10G.
- En GPUs de consumo: la RTX 4090 (24 GB) puede manejar el modelo en bfloat16, pero con limitaciones de batch size. GPUs de 12-16 GB requerirían cuantización int8 o técnicas de offloading.
- Opciones de despliegue: al ser una implementación de Keras 3, se puede ejecutar con los backends TensorFlow, PyTorch o JAX. No se mencionan integraciones con vLLM, llama.cpp u Ollama en la documentación.
- Latencia y throughput: no se proporcionan datos estimados en la información disponible.

## Comparativa con modelos similares

La siguiente tabla compara las variantes de la familia Gemma 4 según los datos de la model card de KerasFormers:

| Modelo | Parámetros efectivos | Parámetros con embeddings | Capas | Contexto | Modalidades | Licencia |
|---|---|---|---|---|---|---|
| Gemma 4 E2B | 2,3B | 5,1B | 35 | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 E4B (este) | 4,5B | 8B | 42 | 128K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 12B Unified | 11,95B | - | 48 | 256K | Texto, imagen, audio | Apache 2.0 |
| Gemma 4 31B Dense | 30,7B | - | 60 | 256K | Texto, imagen | Apache 2.0 |

No se dispone de comparativas con modelos de otros fabricantes (como Llama 3.2, Qwen2-VL o Phi-3.5) en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta inglés como idioma de entrada y salida, según la model card. No se garantiza un rendimiento adecuado en otros idiomas.
- No se documentan sesgos específicos, pero al ser un modelo entrenado por Google, puede heredar sesgos presentes en los datos de entrenamiento. Se recomienda auditar el comportamiento en casos de uso sensibles.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento o hechos específicos. Es necesario validar las salidas en aplicaciones críticas.
- La conversión de KerasFormers es una reimplementación de la arquitectura; aunque los pesos son los originales, no se garantiza una paridad exacta de comportamiento con la implementación oficial de Google en todos los escenarios.
- La dependencia de la librería `kerasformers` y de Keras 3 puede limitar la integración con herramientas que esperan formatos estándar (por ejemplo, safetensors o GGUF). No se menciona compatibilidad con vLLM u otros servidores de inferencia.
- El tamaño del repositorio (15,9 GB) implica requisitos de almacenamiento y memoria considerables, especialmente en entornos con GPUs limitadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/gemma-4-e4b-it
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de Gemma 4 en KerasFormers: https://imvision12.github.io/KerasFormers/gemma4/
- Colección de variantes Gemma 4 en HuggingFace: https://huggingface.co/kerasformers
