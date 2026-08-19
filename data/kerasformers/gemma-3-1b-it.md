# kerasformers/gemma-3-1b-it

## Resumen

`kerasformers/gemma-3-1b-it` es una conversión íntegra en Keras 3 del modelo `google/gemma-3-1b-it`, el checkpoint afinado por instrucciones de la familia Gemma 3 de Google. Esta implementación, desarrollada por el equipo de KerasFormers, permite ejecutar el mismo modelo sin modificaciones en tres backends de Keras: TensorFlow, PyTorch y JAX, lo que facilita su integración en proyectos que ya usan cualquiera de estos ecosistemas. Los pesos se distribuyen en bfloat16 y se cargan mediante la clase `Gemma3TextGenerate`, con soporte opcional para precisión completa (float32) o cuantización int8.

La relevancia de este modelo radica en que acerca Gemma 3 a la comunidad de Keras, que hasta ahora dependía de implementaciones específicas de cada framework. Al ser una conversión directa de los pesos originales, no introduce cambios en el comportamiento del modelo, pero sí ofrece una API unificada y portabilidad entre backends. Está pensado para tareas de generación de texto y chat, con un tamaño reducido (el nombre sugiere 1B de parámetros, aunque no se confirma en la documentación) que lo hace adecuado para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre sugiere 1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (por defecto), float32, int8 |
| Idiomas soportados | ingles |
| Licencia | Gemma (gated, requiere aceptacion) |
| Formato de pesos | no especificado (pesos en bfloat16) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna del modelo, el dataset de entrenamiento ni el proceso de ajuste. Se trata de una conversión de pesos del checkpoint `google/gemma-3-1b-it`, que fue desarrollado y entrenado por Google. Esta versión de KerasFormers no modifica los pesos ni el comportamiento; únicamente reimplementa la arquitectura en Keras 3 para que funcione de manera uniforme en TensorFlow, PyTorch y JAX. El modelo se sirve como generación de texto pura (`Gemma3TextGenerate`), sin capacidades multimodales en esta variante.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset, uso de RLHF o DPO, ni otras innovaciones técnicas del modelo original. Para esos detalles, se remite a la model card oficial de Google en `google/gemma-3-1b-it`.

## Capacidades

- Generacion de texto: produce respuestas coherentes y contextuales a partir de instrucciones o conversaciones.
- Chat multi-turno: acepta entradas con roles (`user`, `assistant`) y mantiene el contexto de la conversación.
- Ajuste por instrucciones: está optimizado para seguir instrucciones y responder a peticiones del usuario.
- Portabilidad entre backends: se ejecuta sin cambios en TensorFlow, PyTorch y JAX mediante Keras 3.
- Cuantizacion flexible: permite cargar en bfloat16, float32 o int8 para ajustar el consumo de memoria.
- Idioma: exclusivamente ingles, segun los metadatos del repositorio.

No se mencionan capacidades adicionales como tool calling, razonamiento multi-paso, vision, audio u otras modalidades.

## Casos de uso

- Asistentes conversacionales ligeros: al ser un modelo de tamaño reducido, puede integrarse en aplicaciones de chat en ingles que requieran respuestas rapidas y un consumo de memoria bajo, por ejemplo en dispositivos edge o servidores modestos.
- Prototipado rapido en Keras: los desarrolladores que trabajan con Keras pueden experimentar con Gemma 3 sin cambiar de framework, usando la API `Gemma3TextGenerate` y alternando entre backends segun las necesidades del proyecto.
- Generacion de contenido breve: adecuado para redactar resumenes, correos, descripciones de productos o cualquier texto corto en ingles, gracias a su capacidad de seguir instrucciones.
- Chatbots de atencion al cliente en ingles: puede gestionar consultas frecuentes y conversaciones sencillas, con la posibilidad de cuantizar a int8 para reducir el coste de inferencia.
- Pruebas de integracion multiplataforma: al soportar TensorFlow, PyTorch y JAX, permite validar pipelines de NLP en diferentes entornos de ejecucion con una unica implementacion.
- Educacion y experimentacion: util para estudiantes e investigadores que quieran estudiar el comportamiento de un modelo de lenguaje pequeno dentro del ecosistema Keras, sin necesidad de infraestructura potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda consultar la documentacion del modelo original de Google para obtener datos de rendimiento.

## Requisitos de hardware

- Tamano del repositorio: 2.0 GB, lo que indica que los pesos en bfloat16 ocupan aproximadamente esa cantidad; con cuantizacion int8 el uso de memoria se reduce considerablemente.
- VRAM estimada: con bfloat16, unos 2 GB de VRAM; con int8, aproximadamente 1 GB, por lo que cabe en GPUs consumer de 4 GB o incluso menos.
- GPUs recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo sin problemas. Tambien es viable en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser una implementacion de Keras 3, se puede servir mediante los backends de Keras (TensorFlow Serving, TorchServe, JAX) o integrarse en aplicaciones propias. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos concretos; dependen del backend, hardware y configuracion de generacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos. La model card no ofrece datos de rendimiento ni referencias a alternativas. Se puede considerar el modelo original `google/gemma-3-1b-it` como referencia, pero no se aportan metricas comparativas en la documentacion de esta conversion.

## Limitaciones y advertencias

- Idioma: solo soporta ingles; no es adecuado para tareas en otros idiomas.
- Licencia gated: el acceso a los pesos requiere aceptar los terminos de la licencia Gemma en HuggingFace; el uso comercial puede estar sujeto a restricciones.
- Riesgo de alucinaciones: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en contextos donde no tiene informacion suficiente.
- Sin garantias de produccion: al ser una conversion de la comunidad, no hay soporte oficial de Google; se recomienda validar el comportamiento antes de usarlo en entornos criticos.
- Informacion limitada: no se especifican parametros exactos, longitud de contexto ni detalles de entrenamiento, lo que dificulta evaluar sus limites reales.
- Tamanos de contexto desconocidos: al no conocer la ventana de contexto, no se puede asegurar su rendimiento en conversaciones muy largas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/kerasformers/gemma-3-1b-it
- Repositorio de GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentacion de Gemma 3 en KerasFormers: https://imvision12.github.io/KerasFormers/gemma3/
- Paper de Gemma 3 (arXiv): https://arxiv.org/abs/2503.19786
- Modelo original en HuggingFace: https://huggingface.co/google/gemma-3-1b-it
