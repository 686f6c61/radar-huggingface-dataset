# kerasformers/gemma-3-27b-pt

## Resumen

`kerasformers/gemma-3-27b-pt` es una conversión íntegra en Keras 3 del checkpoint base `google/gemma-3-27b-pt` de Google, realizada por el proyecto KerasFormers. Este modelo permite ejecutar Gemma 3 de 27 mil millones de parámetros con un único código que funciona sin modificaciones en TensorFlow, PyTorch o JAX, eligiendo el backend mediante la variable de entorno `KERAS_BACKEND`. Se trata de una variante *pretrained* (no instruida) que acepta entradas de imagen y texto y genera texto, por lo que está pensada para tareas de generación condicionada y para fine-tuning posterior.

La relevancia de esta conversión radica en que acerca los modelos Gemma 3 al ecosistema Keras 3, facilitando su integración en flujos de trabajo que ya usan esta librería, y ofreciendo una alternativa a las implementaciones oficiales basadas en Transformers. El repositorio tiene un tamaño de 54,9 GB, lo que corresponde a pesos en bfloat16. La licencia es Gemma (gated), por lo que es necesario aceptar los términos de uso en la página del modelo original antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 3 27B, segun modelo base `google/gemma-3-27b-pt`) |
| Parametros totales | 27B (segun nomenclatura del modelo) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (por defecto), int8 (opcional), float32 (opcional) |
| Idiomas soportados | en (segun ficha) |
| Licencia | Gemma (gated) |
| Formato de pesos | no disponible (carga mediante `from_weights` de kerasformers) |

## Arquitectura y entrenamiento

La ficha no proporciona detalles sobre la arquitectura interna ni sobre el proceso de entrenamiento. Se indica que se trata de una conversión de pesos del checkpoint `google/gemma-3-27b-pt`, que es un modelo base (pretrained) de la familia Gemma 3. Por tanto, no ha habido un entrenamiento nuevo por parte de KerasFormers; únicamente se han adaptado los pesos al formato de Keras 3. El modelo es multimodal (imagen + texto) y genera texto, lo que sugiere que incorpora un codificador de visión y un decodificador de lenguaje, pero no se especifican detalles como el número de tokens de entrenamiento, la composición del dataset o si se usaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas particulares en esta conversión.

## Capacidades

- Generacion de texto condicionada a entradas de texto e imagen (pipeline `image-text-to-text`).
- Ejecucion en multiples backends: TensorFlow, PyTorch y JAX mediante Keras 3.
- Carga en bfloat16 por defecto, con opcion de cuantizacion int8 para reducir el uso de memoria.
- Compatible con la API `Gemma3ConditionalGenerate` y `Gemma3TextGenerate` de kerasformers.
- Al ser un modelo base, no esta afinado para seguir instrucciones ni para tareas especificas como tool calling o razonamiento multi-paso; esas capacidades requeririan fine-tuning.
- Soporte multilingue no declarado en la ficha (solo se indica `en`), aunque el modelo original de Google puede tener capacidades en otros idiomas.

## Casos de uso

- Fine-tuning para tareas de vision-lenguaje: al ser un modelo base, es adecuado para ajustarlo con datasets propios en tareas como respuesta a preguntas visuales, captioning de imagenes o clasificacion multimodal. Su tamano de 27B permite alcanzar buen rendimiento tras un ajuste especifico.
- Generacion de descripciones de imagenes en entornos de investigacion: se puede usar directamente con el pipeline `image-text-to-text` para obtener descripciones de imagenes, aunque al no estar instruido los resultados pueden ser menos coherentes que con una variante `it`.
- Extraccion de caracteristicas multimodales: las representaciones internas del modelo pueden utilizarse como embeddings para tareas de recuperacion o comparacion de imagenes y texto.
- Prototipado rapido con Keras 3: desarrolladores que trabajen con Keras 3 pueden integrar Gemma 3 sin cambiar de framework, gracias a la compatibilidad con TensorFlow, PyTorch y JAX.
- Experimentacion con cuantizacion: la opcion `int8` permite probar el modelo en GPUs con menos memoria, facilitando experimentos de compression y analisis de trade-offs entre precision y rendimiento.
- Investigacion en modelos base multimodales: al ser un checkpoint pretrained, sirve como punto de partida para estudios sobre aprendizaje por transferencia, evaluacion de sesgos o interpretabilidad en modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas para esta conversion especifica. Para conocer el rendimiento del modelo original, se debe consultar la documentacion de `google/gemma-3-27b-pt`.

## Requisitos de hardware

- El repositorio ocupa 54,9 GB, lo que sugiere que los pesos en bfloat16 (2 bytes por parametro) ocupan aproximadamente 54 GB. Para inferencia en bfloat16 se recomienda una GPU con al menos 60 GB de VRAM, como una A100 80GB o H100 80GB.
- Con cuantizacion int8 (1 byte por parametro), el modelo podria ocupar alrededor de 27 GB, lo que permitiria ejecutarlo en GPUs de 32 GB o 40 GB, como la A100 40GB o la RTX A6000 48GB.
- No se indica soporte para consumer GPUs (por ejemplo, RTX 4090 con 24 GB) incluso con int8, dado que 27 GB superan esa capacidad.
- Opciones de despliegue: la libreria kerasformers permite ejecucion local con los backends de Keras. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI en la ficha.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

La comparativa se basa en caracteristicas generales, ya que no hay datos de rendimiento disponibles para esta conversion.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `kerasformers/gemma-3-27b-pt` | 27B | no disponible | Gemma (gated) | Keras 3 (bfloat16) | Conversion a Keras 3, multimodal base |
| `google/gemma-3-27b-pt` | 27B | 128K (segun documentacion oficial) | Gemma (gated) | Transformers / safetensors | Modelo original de Google |
| `kerasformers/gemma-3-12b-pt` | 12B | no disponible | Gemma (gated) | Keras 3 (bfloat16) | Version mas pequena de la misma conversion |

La principal diferencia con el modelo original es el formato de pesos y la libreria de carga; el rendimiento deberia ser equivalente, aunque no hay benchmarks que lo confirmen. La version de 12B es una alternativa para entornos con menos recursos.

## Limitaciones y advertencias

- Modelo base no instruido: no sigue instrucciones de forma fiable y puede generar texto incoherente o irrelevante si se usa directamente en tareas conversacionales o de seguimiento de ordenes.
- Riesgo de alucinacion: como cualquier modelo de lenguaje grande, puede producir contenido falso o inventado, especialmente en tareas generativas.
- Idioma limitado: la ficha declara solo ingles (`en`), aunque el modelo original de Google soporta multiples idiomas; esta conversion podria no estar optimizada para otros idiomas.
- Licencia gated: es necesario aceptar los terminos de uso de Gemma en la pagina de HuggingFace del modelo original antes de descargar. La licencia puede imponer restricciones de uso comercial y de redistribucion.
- Requisitos de hardware elevados: el tamano del modelo (54,9 GB en bfloat16) exige GPUs profesionales de alta gama, lo que limita su uso en entornos modestos.
- Sin soporte explicito para tool calling, agentes o razonamiento multi-paso: estas capacidades requieren fine-tuning adicional.
- Formato de pesos no estandar: la carga se realiza mediante la API `from_weights` de kerasformers, lo que puede dificultar la interoperabilidad con otras herramientas del ecosistema (por ejemplo, vLLM o llama.cpp).

## Enlaces

- [HuggingFace: kerasformers/gemma-3-27b-pt](https://huggingface.co/kerasformers/gemma-3-27b-pt)
- [Modelo original: google/gemma-3-27b-pt](https://huggingface.co/google/gemma-3-27b-pt)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentacion de Gemma 3 en KerasFormers](https://imvision12.github.io/KerasFormers/gemma3/)
- [Paper de Gemma 3 (arXiv:2503.19786)](https://arxiv.org/abs/2503.19786)
