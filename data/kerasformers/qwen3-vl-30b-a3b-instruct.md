# kerasformers/qwen3-vl-30b-a3b-instruct

## Resumen

El modelo `kerasformers/qwen3-vl-30b-a3b-instruct` es una conversión íntegra en Keras 3 del modelo original `Qwen/Qwen3-VL-30B-A3B-Instruct` de Alibaba. Está diseñado para ejecutarse sin modificaciones sobre los tres backends principales de Keras 3: TensorFlow, PyTorch y JAX. Se trata de un modelo multimodal de tipo imagen-texto-a-texto que combina un codificador visual con un decodificador de texto basado en mezcla de expertos (MoE), lo que permite activar solo una fracción de los parámetros durante la inferencia. Los pesos se almacenan en precisión bfloat16.

La relevancia de este lanzamiento radica en que ofrece una alternativa de implementación multiplataforma para un modelo de gran tamaño (30 000 millones de parámetros totales, 3 000 millones activos) sin depender del ecosistema PyTorch exclusivamente. Esto facilita su integración en entornos que ya usan TensorFlow o JAX, o que requieren flexibilidad de backend. La conversión mantiene la licencia Apache 2.0 y el formato de pesos original, por lo que es directamente utilizable en producción con las herramientas habituales del ecosistema Keras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-MoE (decodificador de texto con mezcla de expertos) |
| Parametros totales | 30 000 millones (30B) |
| Parametros activos | 3 000 millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | bfloat16 (safetensors) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3-VL-MoE, que combina un codificador visual (basado en el diseño de Qwen2-VL) con un decodificador de lenguaje que emplea mezcla de expertos (MoE). Según la model card, el decodificador de texto es la parte que utiliza MoE, mientras que el codificador visual y los componentes de proyección siguen el diseño de Qwen3-VL. Los pesos están almacenados en bfloat16.

No se proporcionan detalles sobre el proceso de entrenamiento, la composición del dataset, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La model card remite a los informes técnicos de Qwen3, Qwen2.5-VL y Qwen2-VL para obtener información sobre el entrenamiento del modelo original, pero no se incluyen datos específicos en esta conversión.

## Capacidades

- Procesamiento multimodal de imágenes y texto: acepta una imagen como entrada junto con instrucciones en texto y genera respuestas de texto.
- Generación de descripciones de imágenes: el ejemplo de uso muestra cómo pedir al modelo que describa una imagen en una frase.
- Conversación multimodal: admite conversaciones multi-turno con contenido visual y textual, según el formato de conversación del procesador.
- Ejecución multiplataforma: funciona con TensorFlow, PyTorch y JAX mediante Keras 3, lo que permite elegir el backend según las necesidades del proyecto.
- Instrucciones en inglés: el modelo está orientado a instrucciones en inglés, como indica la etiqueta `language: en`.

## Casos de uso

- Descripción automática de imágenes: el modelo puede generar leyendas o descripciones de fotografías, ilustraciones o diagramas, útil para accesibilidad o catalogación de contenido visual.
- Respuesta a preguntas visuales (VQA): dado un documento escaneado o una captura de pantalla, el modelo puede responder preguntas sobre el contenido, como extraer información de tablas o gráficos.
- Asistencia a personas con discapacidad visual: integrado en aplicaciones móviles, puede describir el entorno a través de la cámara y responder a preguntas del usuario sobre lo que ve.
- Análisis de documentos con imágenes: en entornos empresariales, puede procesar facturas, informes o contratos que contengan imágenes y texto, extrayendo datos relevantes.
- Moderación de contenido visual: combinado con un pipeline de clasificación, puede generar descripciones de imágenes para detectar contenido inapropiado o sensible.
- Generación de subtítulos para vídeo: aplicado a fotogramas clave, puede producir subtítulos descriptivos para vídeos, facilitando la búsqueda y el archivado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento como MMLU, HumanEval o benchmarks multimodales. Para conocer el rendimiento del modelo original, se recomienda consultar el informe técnico de Qwen3 (arXiv:2505.09388) y los informes de Qwen2.5-VL (arXiv:2502.13923) y Qwen2-VL (arXiv:2409.12191).

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la model card. Dado que el modelo tiene 30 000 millones de parámetros en bfloat16, el tamaño del repositorio es de 62,2 GB, lo que sugiere que se necesita una GPU con al menos 80 GB de VRAM para cargar los pesos completos en memoria. Sin embargo, no se indican requisitos concretos de VRAM, GPUs recomendadas ni opciones de despliegue como vLLM, llama.cpp u Ollama. Se recomienda consultar la documentación de KerasFormers para obtener guías de despliegue.

## Comparativa con modelos similares

El modelo es una conversión directa de `Qwen/Qwen3-VL-30B-A3B-Instruct`, por lo que su rendimiento y características son idénticos al original, salvo posibles diferencias menores debidas a la implementación en Keras 3. No se dispone de datos comparativos con otros modelos MoE multimodales en la información proporcionada. La principal diferencia frente al original es el framework de implementación: mientras que el modelo de Qwen está disponible en PyTorch, esta versión ofrece compatibilidad con TensorFlow y JAX a través de Keras 3.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de información específica sobre sesgos en esta conversión. El modelo original puede heredar sesgos de los datos de entrenamiento, pero no se documentan aquí.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas factualmente incorrectas o inventar detalles, especialmente en tareas multimodales complejas.
- Limitaciones de contexto e idioma: la model card indica únicamente inglés como idioma soportado. Aunque el modelo original puede soportar más idiomas, esta conversión solo declara `en`.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero se debe revisar la licencia del modelo original por si hubiera condiciones adicionales.
- Diferencias de rendimiento: al ser una conversión a Keras 3, puede haber ligeras variaciones en la salida respecto al modelo original en PyTorch debido a diferencias numéricas entre backends.
- Requisitos de memoria: el tamaño del repositorio (62,2 GB) implica que se necesita hardware con suficiente VRAM para cargar los pesos completos, lo que puede ser un obstáculo para despliegues en entornos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kerasformers/qwen3-vl-30b-a3b-instruct
- Repositorio KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de Qwen3-VL-MoE: https://imvision12.github.io/KerasFormers/qwen3_vl_moe/
- Colección HuggingFace de Qwen3-VL-MoE: https://huggingface.co/collections/kerasformers/qwen3-vl-moe-6a7eb7d3e6d95b296dae7d0d
- Paper Qwen3 Technical Report: https://arxiv.org/abs/2505.09388
- Paper Qwen2.5-VL Technical Report: https://arxiv.org/abs/2502.13923
- Paper Qwen2-VL: https://arxiv.org/abs/2409.12191
- Paper Qwen-VL: https://arxiv.org/abs/2308.12966
- Modelo original Qwen/Qwen3-VL-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
