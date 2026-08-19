# kerasformers/gemma-4-e4b

## Resumen

`kerasformers/gemma-4-e4b` es una conversión íntegra en Keras 3 del modelo `google/gemma-4-E4B`, desarrollada por el equipo de KerasFormers. Su objetivo es ofrecer una implementación unificada que funcione sin modificaciones sobre TensorFlow, PyTorch o JAX, facilitando el despliegue en entornos que ya usan el ecosistema Keras. Se trata de la variante E4B de la familia Gemma 4, con 4.500 millones de parámetros efectivos (8.000 millones si se incluyen los embeddings), una ventana de contexto de 128.000 tokens y capacidades multimodales que aceptan texto, imagen y audio como entrada para generar texto.

El modelo resuelve el problema de la portabilidad entre frameworks: en lugar de mantener implementaciones separadas para cada backend, KerasFormers proporciona una única base de código que se ejecuta en los tres entornos principales. Además, al estar basado en Gemma 4, hereda las capacidades de razonamiento y generación de texto del modelo original de Google, con el añadido de procesamiento de imagen y audio. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para proyectos de producción que requieren flexibilidad de infraestructura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención de ventana deslizante (sliding window de 512 tokens) |
| Parametros totales | 4.500 millones efectivos (8.000 millones con embeddings) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | bfloat16 (por defecto), float32, int8 |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (pesos almacenados en bfloat16) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de `google/gemma-4-E4B` realizada por KerasFormers, por lo que la arquitectura subyacente corresponde al diseño original de Gemma 4. Según la tabla de propiedades de la familia, esta variante cuenta con 42 capas, un vocabulario de 262.000 tokens y una ventana deslizante de atención de 512 tokens. Incorpora dos encoders adicionales: uno de visión con aproximadamente 150 millones de parámetros y otro de audio con unos 300 millones, lo que permite procesar entradas multimodales.

No se han proporcionado detalles sobre el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La conversión de KerasFormers se limita a adaptar los pesos al formato de Keras 3, manteniendo la funcionalidad original. La implementación permite cargar los pesos en bfloat16 por defecto, con opciones de precisión completa (float32) o cuantización int8 para reducir el uso de memoria.

## Capacidades

- Generación de texto a partir de entradas de texto, imagen, audio o combinaciones de las tres modalidades.
- Procesamiento de imágenes: el modelo puede recibir una imagen y generar descripciones o respuestas relacionadas.
- Procesamiento de audio: acepta archivos de audio como entrada y puede transcribir, describir o responder sobre su contenido.
- Conversación multi-turno: el ejemplo de uso muestra un formato de chat con roles de usuario y asistente, lo que indica soporte para diálogos.
- Multi-backend: la misma implementación funciona en TensorFlow, PyTorch y JAX, seleccionable mediante la variable de entorno `KERAS_BACKEND`.
- Carga flexible de pesos: soporta bfloat16, float32 e int8, lo que permite ajustar el equilibrio entre precisión y consumo de memoria.

## Casos de uso

- Asistentes multimodales de atención al cliente: el modelo puede procesar simultáneamente una captura de pantalla, un mensaje de voz y texto del usuario para ofrecer respuestas contextualizadas, gracias a su capacidad de combinar las tres modalidades en una sola conversación.
- Transcripción y análisis de audio: al aceptar archivos de audio como entrada, puede transcribir reuniones, entrevistas o notas de voz y generar resúmenes o extraer información relevante, con una ventana de contexto de 128.000 tokens que permite procesar grabaciones largas.
- Descripción de imágenes para accesibilidad: el encoder de visión permite generar descripciones textuales de imágenes, útil para aplicaciones que asisten a personas con discapacidad visual o para sistemas de moderación de contenido.
- Análisis de documentos extensos con contexto largo: con 128.000 tokens de contexto, puede procesar libros, informes o contratos completos y responder preguntas sobre su contenido, manteniendo la coherencia a lo largo de todo el documento.
- Integración en pipelines de Keras/TensorFlow: al ser una implementación nativa de Keras 3, se puede incorporar directamente en flujos de trabajo existentes que ya usan estas librerías, sin necesidad de adaptadores adicionales.
- Prototipado rápido multiplataforma: gracias al soporte de JAX, PyTorch y TensorFlow, los equipos pueden desarrollar y probar el modelo en un backend y desplegarlo en otro sin cambios de código, lo que facilita la experimentación en entornos heterogéneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware en la documentación.
- El tamaño del repositorio es de 15,9 GB, lo que sugiere que los pesos en bfloat16 ocupan aproximadamente esa cantidad de espacio en disco.
- Para inferencia en bfloat16, se estima que se necesitan al menos 16 GB de VRAM, aunque esta cifra es una estimación basada en el tamaño del modelo y no un dato oficial.
- La cuantización int8, mencionada en los consejos de uso, puede reducir significativamente los requisitos de memoria, permitiendo potencialmente su ejecución en GPUs de consumo con 8-12 GB de VRAM.
- No se mencionan opciones de despliegue específicas como vLLM, llama.cpp u Ollama; la integración se realiza a través de la librería KerasFormers.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La colección de KerasFormers incluye otras variantes de Gemma 4 (E2B, 12B, 26B-A4B y 31B), pero no se han publicado comparativas de rendimiento entre ellas. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- No se han documentado sesgos específicos ni riesgos de alucinación en la información proporcionada.
- El modelo está etiquetado únicamente con el idioma inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos de la licencia del modelo original de Google (`google/gemma-4-E4B`) para asegurar el cumplimiento.
- Al ser una conversión de KerasFormers, cualquier actualización o corrección del modelo original de Google puede no reflejarse automáticamente en esta versión.
- No se especifican limitaciones de contexto más allá de los 128.000 tokens, pero el uso de ventanas deslizantes de 512 tokens puede afectar a la coherencia en pasajes muy largos si no se gestiona adecuadamente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/kerasformers/gemma-4-e4b)
- [Repositorio de GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de Gemma 4 en KerasFormers](https://imvision12.github.io/KerasFormers/gemma4/)
- [Modelo base de Google](https://huggingface.co/google/gemma-4-E4B)
- [Colección de variantes de Gemma 4 en KerasFormers](https://huggingface.co/kerasformers)
