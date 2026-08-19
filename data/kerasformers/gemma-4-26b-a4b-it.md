# kerasformers/gemma-4-26b-a4b-it

## Resumen

`kerasformers/gemma-4-26b-a4b-it` es una conversión pura en Keras 3 del modelo `google/gemma-4-26B-A4B-it` de Google, desarrollada por el equipo de KerasFormers. Su objetivo es permitir ejecutar Gemma 4 en cualquier backend de Keras 3 (TensorFlow, PyTorch o JAX) sin modificar el código, manteniendo los pesos originales en bfloat16. Se trata de una variante multimodal que acepta entradas de imagen y texto, y genera texto como salida, mediante el procesador `Gemma4Processor`.

Este modelo es relevante porque facilita la integración de Gemma 4 en ecosistemas que ya usan Keras, ofreciendo una alternativa a las implementaciones nativas de PyTorch o JAX. Al ser una conversión directa de los pesos oficiales, no introduce cambios en la arquitectura ni en el entrenamiento, pero sí aporta flexibilidad de despliegue multiplataforma. El repositorio ocupa 51,6 GB, lo que refleja el tamaño de los pesos en bfloat16.

La ficha se basa exclusivamente en la información proporcionada en la model card y los metadatos de HuggingFace. No se dispone de detalles completos sobre la arquitectura interna, el entrenamiento o los benchmarks, por lo que varios campos se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere mezcla de expertos, pero no se confirma en la documentación) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (solo si es MoE, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (por defecto), float32 (opcional), int8 (opcional) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (pesos almacenados en bfloat16, formato de archivo no especificado) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo. El nombre `26b-a4b` sugiere una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos, pero este dato no está confirmado en la documentación proporcionada. Se trata de una conversión de pesos del modelo original de Google, por lo que no ha habido un entrenamiento adicional; la implementación en Keras 3 replica la arquitectura original para que los pesos sean intercambiables.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La model card remite a la ficha oficial de Google para esos detalles, pero no se incluyen en la información disponible.

## Capacidades

- Generación de texto a partir de instrucciones en inglés.
- Comprensión de imágenes: el modelo acepta entradas de imagen y texto combinadas, y puede generar descripciones o respuestas basadas en el contenido visual.
- Soporte de conversaciones multimodales: el procesador `Gemma4Processor` permite estructurar diálogos con mensajes que incluyen tanto imágenes como texto.
- Ejecución multiplataforma: al ser una implementación en Keras 3, funciona sin cambios en TensorFlow, PyTorch y JAX.
- Carga flexible: permite elegir precisión (bfloat16, float32) o cuantización int8 para reducir el uso de memoria.

## Casos de uso

- Descripción automática de imágenes: el modelo puede generar texto descriptivo a partir de una imagen, útil para accesibilidad o catalogación de contenido visual.
- Asistentes visuales conversacionales: integración en chatbots que reciben fotos o capturas de pantalla y responden preguntas sobre ellas, por ejemplo, en atención al cliente técnica.
- Análisis de documentos escaneados: combinar imagen y texto para extraer información de facturas, formularios o recibos.
- Generación de código con contexto visual: en entornos de desarrollo, el modelo puede interpretar diagramas o capturas de pantalla de interfaces y sugerir implementaciones.
- Moderación de contenido: clasificar imágenes y generar informes textuales sobre su contenido, siempre que se ajuste a las políticas de uso.
- Prototipado rápido en Keras: investigadores que ya trabajan con Keras pueden probar Gemma 4 sin migrar a otro framework, usando la misma API de `from_weights`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware.
- El tamaño del repositorio es de 51,6 GB, lo que sugiere que los pesos en bfloat16 ocupan aproximadamente esa cantidad de memoria. Para cargar el modelo completo en VRAM se necesitaría una GPU con al menos 52 GB de memoria, como una NVIDIA A100 de 80 GB o una H100.
- Con cuantización int8, el uso de memoria podría reducirse a unos 26 GB, lo que permitiría ejecutarlo en GPUs de consumo como la RTX 4090 (24 GB) con limitaciones, aunque no está confirmado.
- Opciones de despliegue: al ser una implementación en Keras 3, se puede usar con los backends de TensorFlow, PyTorch o JAX. No se mencionan integraciones con vLLM, llama.cpp u Ollama en la documentación.
- La latencia y el throughput no están especificados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Sin embargo, la familia Gemma 4 incluye otras variantes con características conocidas, que se resumen en la siguiente tabla (según la model card):

| Modelo | Parámetros totales | Contexto | Modalidades |
| --- | --- | --- | --- |
| Gemma 4 E2B | 2,3B efectivos (5,1B con embeddings) | 128K | Texto, imagen, audio |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio |
| Gemma 4 31B Dense | 30,7B | 256K | Texto, imagen |
| Gemma 4 26B A4B (este modelo) | no disponible | no disponible | Texto, imagen (según pipeline) |

La comparativa directa con otros modelos fuera de la familia no está disponible.

## Limitaciones y advertencias

- Al ser una conversión de pesos, el rendimiento puede diferir ligeramente de la implementación original de Google debido a diferencias en el framework de ejecución.
- La model card indica que el idioma soportado es únicamente inglés; no se garantiza un buen rendimiento en otros idiomas.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamientos no deseados. Se recomienda consultar la model card oficial de Google para conocer las limitaciones del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero es necesario revisar los términos específicos de la licencia de Gemma 4 de Google, ya que pueden existir restricciones adicionales.
- El tamaño del modelo (51,6 GB en bfloat16) requiere hardware de gama alta para inferencia local, lo que puede ser una barrera para entornos con recursos limitados.

## Enlaces

- [HuggingFace - kerasformers/gemma-4-26b-a4b-it](https://huggingface.co/kerasformers/gemma-4-26b-a4b-it)
- [Modelo base en HuggingFace - google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de Gemma 4 en KerasFormers](https://imvision12.github.io/KerasFormers/gemma4/)
- [Colección de variantes Gemma 4 en HuggingFace](https://huggingface.co/kerasformers)
