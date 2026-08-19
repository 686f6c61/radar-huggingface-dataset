# kerasformers/gemma-4-26b-a4b

## Resumen

`kerasformers/gemma-4-26b-a4b` es una conversión pura en Keras 3 del modelo `google/gemma-4-26B-A4B` de Google, publicada por el equipo de KerasFormers. El objetivo es ofrecer una implementación unificada que se ejecute sin modificaciones en TensorFlow, PyTorch y JAX, manteniendo los pesos originales en bfloat16. Se trata de un modelo multimodal (imagen y texto) con arquitectura de mezcla de expertos (MoE), donde el nombre indica aproximadamente 26 mil millones de parámetros totales y 4 mil millones activos por token.

La relevancia de esta conversión radica en que permite a desarrolladores e investigadores que trabajan con el ecosistema Keras 3 acceder a un modelo de última generación de Google sin depender de los backends propietarios, facilitando la experimentación y el despliegue en entornos heterogéneos. Al estar basado en el modelo original de Google, hereda sus capacidades multimodales, aunque la model card solo confirma soporte para inglés. El repositorio tiene un tamaño de 51,6 GB, lo que refleja el almacenamiento de los pesos en bfloat16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal (imagen y texto) |
| Parametros totales | ~26B (segun nomenclatura; la model card menciona "27B variant") |
| Parametros activos | ~4B (segun nomenclatura "a4b") |
| Longitud de contexto | no disponible (la familia Gemma 4 varia entre 128K y 256K, pero no se confirma para esta variante) |
| Tipos de cuantizacion | bfloat16 (por defecto), int8 (opcional) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | bfloat16 (formato de archivo no especificado) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de los pesos de `google/gemma-4-26B-A4B` al formato de Keras 3, por lo que no ha sido entrenado de nuevo. La arquitectura subyacente es un transformer con mezcla de expertos (MoE), donde solo una fracción de los parámetros se activa por token (aproximadamente 4B de 26B). Esto permite un equilibrio entre capacidad y eficiencia computacional. El modelo acepta entradas de imagen y texto, lo que implica la presencia de un codificador de visión integrado, aunque los detalles específicos del codificador no se documentan en la model card.

El entrenamiento original fue realizado por Google, pero no se proporcionan datos sobre el número de tokens, la composición del dataset ni las técnicas de alineación (RLHF, DPO, etc.) en la información disponible. La conversión de KerasFormers no altera los pesos, solo la implementación y el formato de carga, garantizando que el comportamiento sea idéntico al modelo original.

## Capacidades

- Generacion de texto: capaz de producir respuestas coherentes y contextualizadas en ingles.
- Comprension de imagenes: puede procesar imagenes junto con texto para tareas de descripcion, analisis visual y respuesta a preguntas sobre el contenido visual.
- Conversacion multimodal: soporta dialogos que combinan turnos de imagen y texto, como se muestra en el ejemplo de la model card.
- Ejecucion multiplataforma: al ser una implementacion Keras 3, funciona en TensorFlow, PyTorch y JAX sin cambios de codigo.
- Carga flexible: permite seleccionar precision (bfloat16, float32) y cuantizacion (int8) segun los requisitos de hardware.
- Integracion con el ecosistema Keras: compatible con las APIs de Keras 3, facilitando el fine-tuning y la integracion en pipelines existentes.

## Casos de uso

- Descripcion automatica de imagenes: el modelo puede generar descripciones detalladas de fotografias o ilustraciones, util para accesibilidad, catalogacion de contenido o generacion de metadatos. Se usaria con el procesador `Gemma4Processor` para combinar la imagen y el prompt de texto.
- Asistentes de soporte visual: en aplicaciones de atencion al cliente, el modelo puede analizar capturas de pantalla o fotos enviadas por usuarios y proporcionar respuestas contextuales, aprovechando su capacidad multimodal.
- Analisis de documentos escaneados: combinando OCR con el modelo, se pueden extraer y resumir informacion de documentos con imagenes, tablas o diagramas, gracias a su comprension de texto e imagen.
- Generacion de contenido creativo: puede redactar textos descriptivos, guiones o narraciones basadas en imagenes, util para marketing, redes sociales o produccion editorial.
- Prototipado rapido en investigacion: al ser una implementacion Keras 3, los investigadores pueden probar rapidamente el modelo en diferentes backends (JAX para aceleracion, TensorFlow para produccion) sin reescribir codigo, ideal para experimentos de multimodalidad.
- Fine-tuning en dominios especificos: dado que los pesos estan disponibles en un formato compatible con Keras, se puede ajustar el modelo para tareas especializadas como diagnostico medico por imagen o moderacion de contenido visual, siempre que se disponga de los recursos de computo necesarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda consultar la model card original de Google (`google/gemma-4-26B-A4B`) para obtener datos de rendimiento si estan disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, el modelo ocupa aproximadamente 52 GB (51,6 GB segun el tamano del repositorio). Con cuantizacion int8, el uso de memoria se reduce a unos 26 GB, aunque esto puede afectar ligeramente a la calidad.
- GPU recomendadas: para ejecutar el modelo en bfloat16 se necesitan GPUs con al menos 60-80 GB de VRAM, como NVIDIA A100 (80 GB) o H100 (80 GB). Con int8, una GPU de 32-40 GB como la A100 (40 GB) o RTX 6000 Ada podria ser suficiente, aunque no se garantiza.
- Compatibilidad con GPUs de consumo: no es viable en GPUs de consumo tipicas (RTX 4090 con 24 GB) incluso con int8, debido al tamaño de los pesos y la memoria adicional necesaria para la inferencia.
- Opciones de despliegue: al ser una implementacion Keras 3, se puede ejecutar directamente con el backend de PyTorch o JAX. No se menciona soporte para vLLM, llama.cpp u Ollama en la model card, por lo que el despliegue se limita al ecosistema Keras.
- Latencia y throughput: no se proporcionan datos. Se espera que la inferencia sea mas lenta que en modelos densos de tamano similar debido a la naturaleza MoE, aunque los parametros activos reducen el coste computacional por token.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoria. La familia Gemma 4 incluye variantes como `gemma-4-12b` (12B denso) y `gemma-4-31b` (31B denso), pero no se conocen las especificaciones exactas de esta variante MoE en cuanto a contexto o rendimiento. Se puede afirmar que, por su tamano y arquitectura, compite con otros MoE de ~26B como Mixtral 8x7B, pero no hay benchmarks que permitan una comparacion objetiva. Se recomienda consultar la documentacion oficial de Google para obtener datos de rendimiento.

## Limitaciones y advertencias

- Idioma limitado: la model card solo confirma soporte para ingles, por lo que su rendimiento en otros idiomas no esta garantizado.
- Sesgos y alucinaciones: al ser un modelo de lenguaje generativo, puede producir contenido sesgado o factualmente incorrecto. No se han publicado evaluaciones de sesgo para esta conversion.
- Requisitos de hardware elevados: el tamaño del modelo (51,6 GB en bfloat16) hace que sea inaccesible para la mayoria de entornos de desarrollo sin GPUs de alta gama.
- Sin garantias de produccion: al ser una conversion de la comunidad, no hay soporte oficial de Google. Los usuarios deben validar el comportamiento en sus casos de uso especificos.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto para esta variante, lo que puede afectar a tareas que requieran ventanas largas.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo original de Google puede tener terminos adicionales; se recomienda revisar la model card de Google para confirmar el uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/gemma-4-26b-a4b
- Modelo original de Google: https://huggingface.co/google/gemma-4-26B-A4B
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentacion de Gemma 4 en KerasFormers: https://imvision12.github.io/KerasFormers/gemma4/
- Coleccion de variantes Gemma 4 en HuggingFace: https://huggingface.co/kerasformers
