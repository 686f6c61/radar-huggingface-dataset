# kerasformers/gemma-3-12b-pt

## Resumen

`kerasformers/gemma-3-12b-pt` es una conversión íntegra en Keras 3 del modelo base `google/gemma-3-12b-pt` de Google, realizada por la comunidad de KerasFormers. Su objetivo es permitir ejecutar Gemma 3 en entornos Keras con total independencia del backend, ya sea TensorFlow, PyTorch o JAX, mediante una única implementación. Se trata de un checkpoint pretrained (pt), es decir, sin ajuste por instrucciones, que acepta entradas de texto e imagen (pipeline `image-text-to-text`). Los pesos se almacenan en bfloat16 y el repositorio ocupa 24,4 GB.

La relevancia de este modelo radica en que acerca Gemma 3, un modelo multimodal de 12 000 millones de parámetros, a desarrolladores que trabajan con Keras y que tradicionalmente dependían de frameworks como PyTorch. Al ser una conversión pura de Keras 3, ofrece portabilidad entre backends y una API unificada, lo que facilita la experimentación y el despliegue en infraestructuras heterogéneas. Aunque no aporta mejoras de rendimiento respecto al original, sí amplía el ecosistema de herramientas disponibles para este tipo de modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: google/gemma-3-12b-pt) |
| Parametros totales | No disponible (12B según nombre del modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (por defecto), int8 (opcional vía `quantization="int8"`) |
| Idiomas soportados | en (inglés) |
| Licencia | Gemma (gated) |
| Formato de pesos | No disponible (carga mediante `from_weights`, probablemente safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 3 12B de Google, un transformer multimodal que procesa texto e imágenes. Sin embargo, esta conversión no aporta detalles adicionales sobre la arquitectura interna, el número de capas, la atención o el mecanismo de visión. Al tratarse de un checkpoint base (pt), no se ha aplicado ningún ajuste por instrucciones ni RLHF; los pesos son los originales del modelo pretrained de Google.

El proceso de entrenamiento no se documenta en la información proporcionada. La contribución de KerasFormers se centra en la implementación en Keras 3, que permite ejecutar el modelo en TensorFlow, PyTorch o JAX sin modificar el código. La carga se realiza mediante `Gemma3ConditionalGenerate.from_weights()` y los pesos se almacenan en bfloat16 por defecto. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto a partir de instrucciones o prompts de texto.
- Procesamiento de imágenes: acepta entradas mixtas de imagen y texto para tareas como descripción de imágenes o respuesta a preguntas visuales.
- Portabilidad entre backends: la misma implementación funciona en TensorFlow, PyTorch y JAX, lo que facilita la integración en distintos entornos.
- Soporte de cuantización int8 para reducir el uso de memoria (opcional).
- Al ser un modelo base, no está optimizado para seguir instrucciones complejas ni para diálogo multi-turno sin fine-tuning adicional.

## Casos de uso

- Fine-tuning en Keras para tareas específicas de visión y lenguaje: al ser un modelo base, se puede ajustar con datasets propios para clasificación de imágenes, generación de descripciones o respuesta a preguntas visuales, aprovechando la integración nativa con Keras.
- Prototipado rápido multiplataforma: gracias a la compatibilidad con TensorFlow, PyTorch y JAX, los investigadores pueden probar el modelo en diferentes backends sin reescribir código, ideal para comparar rendimiento en distintas aceleradoras.
- Desarrollo de aplicaciones multimodales en entornos Keras: por ejemplo, un sistema que reciba una fotografía y genere un texto descriptivo, integrado en un pipeline existente de Keras para preprocesamiento o postprocesamiento.
- Investigación en transferencia de aprendizaje: usar los pesos pretrained como punto de partida para experimentos de adaptación a dominios específicos, con la ventaja de poder cambiar de backend según los requisitos del experimento.
- Educación y experimentación: debido a su facilidad de carga y a la documentación incluida, es adecuado para cursos o talleres que enseñen modelos multimodales usando Keras y múltiples frameworks.
- Despliegue en infraestructuras con TensorFlow Serving o JAX: si una organización ya utiliza TensorFlow o JAX en producción, este modelo permite incorporar capacidades multimodales sin introducir dependencias de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para esta conversión específica. Se recomienda consultar la model card del modelo original `google/gemma-3-12b-pt` para obtener datos de rendimiento del checkpoint subyacente.

## Requisitos de hardware

- Tamaño del repositorio: 24,4 GB, lo que sugiere que los pesos en bfloat16 ocupan aproximadamente esa cantidad. Para cargar el modelo completo en memoria se necesita una GPU con al menos 24 GB de VRAM (por ejemplo, A100 40GB, RTX 4090 24GB, o superior).
- Con cuantización int8, el consumo de memoria se reduce, aunque no se especifica el factor exacto; podría caber en GPUs de 16 GB, pero no hay garantía.
- No se proporcionan datos de latencia ni throughput. El rendimiento dependerá del backend elegido y del hardware.
- Opciones de despliegue: al ser una librería de Keras, se puede integrar con TensorFlow Serving, o utilizar los backends de JAX o PyTorch con herramientas como vLLM o TGI, aunque no se documenta soporte explícito para estas. La carga se realiza mediante la API de KerasFormers, no mediante formatos estándar como GGUF.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kerasformers/gemma-3-12b-pt | 12B (estimado) | No disponible | Gemma | HuggingFace, Keras |
| google/gemma-3-12b-pt | 12B | No disponible | Gemma | HuggingFace, PyTorch/JAX |
| kerasformers/gemma-3-12b-it | 12B | No disponible | Gemma | HuggingFace, Keras (versión instruct) |

No se dispone de datos de rendimiento para comparar directamente. La diferencia principal radica en el framework de implementación: la versión de KerasFormers es una conversión de Keras 3, mientras que la original de Google está disponible en PyTorch y JAX. La versión `-it` (instruct) sería la adecuada para tareas de diálogo, mientras que la `-pt` es el modelo base.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no está optimizado para seguir comandos complejos ni para mantener conversaciones coherentes; requiere fine-tuning para la mayoría de aplicaciones prácticas.
- Riesgo de alucinaciones y sesgos: al ser un modelo pretrained genérico, puede generar contenido falso o reflejar sesgos presentes en los datos de entrenamiento originales.
- Idiomas limitados: solo se declara soporte para inglés; el rendimiento en otros idiomas puede ser deficiente.
- Licencia Gemma gated: es necesario aceptar los términos de uso en la página del modelo original de Google antes de descargar los pesos. La licencia impone restricciones de uso comercial y de redistribución.
- Conversión comunitaria: al ser un proyecto de la comunidad, no hay garantía de soporte oficial ni de que la implementación esté libre de errores. Se recomienda validar el comportamiento en producción.
- Sin información sobre contexto máximo: no se especifica la longitud de contexto soportada, lo que puede limitar su uso en tareas que requieran ventanas largas.

## Enlaces

- HuggingFace: https://huggingface.co/kerasformers/gemma-3-12b-pt
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de Gemma 3 en KerasFormers: https://imvision12.github.io/KerasFormers/gemma3/
- Modelo base original: https://huggingface.co/google/gemma-3-12b-pt
- Paper de Gemma 3: https://arxiv.org/abs/2503.19786
