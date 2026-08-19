# kerasformers/gemma-3-270m-it

## Resumen

`kerasformers/gemma-3-270m-it` es una conversión íntegramente realizada en Keras 3 del modelo `google/gemma-3-270m-it`, la variante instrucción afinada de 270 millones de parámetros de la familia Gemma 3 de Google. El proyecto KerasFormers permite ejecutar este modelo sin modificaciones en tres backends: TensorFlow, PyTorch y JAX, lo que facilita la experimentación y el despliegue en entornos heterogéneos sin cambiar de implementación.

Este modelo resuelve el problema de portabilidad y accesibilidad: los pesos originales de Gemma 3 están disponibles en PyTorch, pero esta versión los empaqueta en un formato nativo de Keras 3, manteniendo la misma arquitectura y capacidades. Es especialmente útil para desarrolladores que trabajan con el ecosistema Keras y desean integrar un modelo de lenguaje pequeño (270M) en aplicaciones de generación de texto, chatbots o prototipos con requisitos de hardware modestos.

La relevancia actual radica en la creciente demanda de modelos pequeños y eficientes que puedan ejecutarse en dispositivos con recursos limitados, y en la flexibilidad multiplataforma que ofrece Keras 3. La licencia es la de Gemma (gated), por lo que es necesario aceptar los términos en la página del modelo original antes de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3) |
| Parametros totales | 270 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (por defecto), float32, int8 |
| Idiomas soportados | Inglés (en) |
| Licencia | Gemma (gated) |
| Formato de pesos | No disponible (pesos en bfloat16, formato interno de Keras 3) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de los pesos de `google/gemma-3-270m-it`, por lo que su arquitectura es la misma que la del modelo original: un transformer decoder-only con atención causal. No se han modificado los parámetros ni la topología; únicamente se ha adaptado el formato de almacenamiento y la implementación para que sea compatible con Keras 3.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no se incluyen en la información proporcionada. El modelo original fue desarrollado por Google y sus características de entrenamiento están documentadas en el paper de Gemma 3 (arXiv:2503.19786), que no se ha analizado en esta ficha. Esta versión de KerasFormers no introduce ninguna innovación técnica adicional; su valor radica en la portabilidad entre backends y en la integración con el ecosistema Keras.

## Capacidades

- Generación de texto en inglés, tanto en modo conversacional como para completar texto libre.
- Soporte de conversaciones multi-turno gracias a su naturaleza de instrucción afinada (`it`).
- Integración con los backends de Keras 3 (TensorFlow, PyTorch, JAX) mediante la misma API.
- Carga en bfloat16 por defecto, con opción de precisión completa (float32) o cuantización int8 para reducir el uso de memoria.
- Compatibilidad con la carga de pesos desde Hugging Face mediante el prefijo `hf:`.
- Adecuado para tareas de procesamiento de lenguaje natural simples y prototipado rápido.

No se mencionan capacidades adicionales como tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Prototipado rápido de chatbots: al ser un modelo pequeño, se puede iterar rápidamente en el diseño de conversaciones sin necesidad de infraestructura potente. La API de KerasFormers permite integrarlo en notebooks o scripts con pocas líneas de código.
- Generación de texto en aplicaciones embebidas: con 270M de parámetros y cuantización int8, puede ejecutarse en dispositivos con poca memoria, como Raspberry Pi o teléfonos móviles, para tareas de autocompletado o resumen breve.
- Educación e investigación en NLP: su tamaño reducido y la posibilidad de ejecutarlo en JAX o TensorFlow lo hacen idóneo para experimentos de fine-tuning o análisis de comportamiento en entornos académicos.
- Desarrollo de asistentes virtuales simples: puede gestionar preguntas frecuentes o guiar al usuario en flujos de atención al cliente básicos, siempre que el dominio esté acotado.
- Evaluación comparativa de frameworks: sirve como punto de referencia para medir el rendimiento de Keras 3 frente a otras librerías (PyTorch, TensorFlow) en tareas de generación de texto.
- Integración en pipelines de CI/CD para pruebas de generación de texto: al ser ligero, puede incorporarse en entornos de integración continua para validar cambios en código que dependan de respuestas generadas por IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 270M de parámetros en bfloat16, el peso del modelo ocupa aproximadamente 540 MB. Considerando memoria para activaciones y overhead, se estima un uso de VRAM inferior a 1,5 GB en inferencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso integradas de gama alta) puede ejecutar el modelo. También es viable en CPU, aunque con mayor latencia.
- En cuantización int8, el uso de memoria se reduce a unos 270 MB, permitiendo ejecución en dispositivos con menos de 1 GB de RAM disponible.
- Opciones de despliegue: al ser una implementación de Keras 3, puede usarse con servidores de inferencia compatibles con Keras, aunque no se mencionan integraciones específicas con vLLM, llama.cpp u Ollama. La carga se realiza mediante `Gemma3TextGenerate.from_weights()`.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU moderna, se espera una latencia de decenas de milisegundos por token para este tamaño de modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. Como referencia estructural, se pueden mencionar otros modelos pequeños de la familia Gemma (como `gemma-3-1b-it` o `gemma-3-4b-it`) que comparten arquitectura pero tienen más parámetros y, presumiblemente, mayor capacidad. Sin embargo, no se pueden aportar cifras concretas de rendimiento sin los benchmarks.

## Limitaciones y advertencias

- Al ser un modelo de solo 270M de parámetros, su capacidad de razonamiento complejo, comprensión de matices y generación de texto extenso es limitada en comparación con modelos más grandes.
- El campo `language` indica únicamente inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia Gemma es de tipo gated: es necesario aceptar los términos de uso en la página del modelo original de Google antes de descargar o utilizar los pesos.
- No se especifica la longitud de contexto, por lo que no se puede garantizar un comportamiento correcto con secuencias largas.
- El modelo puede presentar sesgos presentes en los datos de entrenamiento originales de Gemma 3, aunque no se detallan en esta conversión.
- Al ser una conversión de pesos, no se han realizado ajustes adicionales; cualquier limitación del modelo original se mantiene intacta.

## Enlaces

- Modelo en Hugging Face: [kerasformers/gemma-3-270m-it](https://huggingface.co/kerasformers/gemma-3-270m-it)
- Repositorio de KerasFormers: [https://github.com/IMvision12/KerasFormers](https://github.com/IMvision12/KerasFormers)
- Documentación de Gemma 3 en KerasFormers: [https://imvision12.github.io/KerasFormers/gemma3/](https://imvision12.github.io/KerasFormers/gemma3/)
- Modelo original de Google: [google/gemma-3-270m-it](https://huggingface.co/google/gemma-3-270m-it)
- Paper de Gemma 3: [arXiv:2503.19786](https://arxiv.org/abs/2503.19786)
