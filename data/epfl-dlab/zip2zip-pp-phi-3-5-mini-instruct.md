# epfl-dlab/zip2zip-pp-Phi-3.5-mini-instruct

## Resumen
Zip2Zip++ es un checkpoint de investigación desarrollado por el EPFL Data Lab (epfl-dlab) a partir de microsoft/Phi-3.5-mini-instruct. Se trata de un ajuste fino que incorpora tokenización adaptativa Zip2Zip++, una técnica que modifica dinámicamente la tokenización para comprimir la secuencia de entrada y reducir el coste computacional en inferencia. El modelo se distribuye en dos revisiones: "main" contiene el checkpoint de entrenamiento original (paso 8000) para reanudar entrenamiento con zip2zip-core, mientras que "hf" ofrece un export autocontenido para inferencia con la librería zip2zip>=0.2.0.

La relevancia actual radica en la creciente necesidad de optimizar la eficiencia de los LLM sin reentrenar desde cero. La tokenización adaptativa permite que el modelo procese texto con un número variable de tokens, lo que puede mejorar el throughput y reducir el uso de memoria en contextos largos. Al heredar la arquitectura transformer de Phi-3.5-mini-instruct, el modelo conserva las capacidades del base (generación de texto, razonamiento, código) aunque las especificaciones exactas de tamaño y contexto no se detallan en la información proporcionada. Es un artefacto orientado a investigación y experimentación más que a despliegue directo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de microsoft/Phi-3.5-mini-instruct) |
| Parámetros totales | No disponible (heredados del modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (revisión "hf" para inferencia; revisión "main" para entrenamiento) |

## Arquitectura y entrenamiento
El modelo es un checkpoint de Zip2Zip++ basado en la arquitectura transformer de Phi-3.5-mini-instruct. Zip2Zip++ es una evolución de la tokenización adaptativa que permite al modelo agrupar dinámicamente secuencias de caracteres o subpalabras en tokens compuestos, reduciendo la longitud efectiva de la secuencia de entrada. El entrenamiento se realizó hasta el paso 8000, según se indica en la model card, pero no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal es la tokenización adaptativa, que busca mejorar la eficiencia en inferencia y la compresión del contexto. El repositorio mantiene dos revisiones: "main" con el checkpoint de entrenamiento original para su uso con zip2zip-core, y "hf" con un export autocontenido para inferencia con la librería zip2zip. Esta separación implica que la revisión "main" no es directamente compatible con pipelines estándar de Transformers.

## Capacidades
- Generación de texto: hereda las capacidades generativas del modelo base Phi-3.5-mini-instruct.
- Razonamiento y matemáticas: se esperan capacidades similares a las del modelo base, aunque no se documentan en la información proporcionada.
- Código: el modelo base incluye soporte para generación de código; se desconoce si el ajuste con Zip2Zip++ mantiene el mismo rendimiento.
- Tokenización adaptativa: capacidad distintiva que permite comprimir la entrada mediante tokens dinámicos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible (el modelo base soporta varios idiomas, pero no se especifica para este checkpoint).
- Modo thinking o vision: no disponible.

## Casos de uso
- Investigación en tokenización adaptativa: evaluar el impacto de Zip2Zip++ en la longitud de secuencia y la precisión en tareas de generación, comparando con la tokenización BPE estándar del modelo base.
- Reanudación de entrenamiento: usar la revisión "main" con zip2zip-core para continuar el ajuste fino desde el paso 8000, por ejemplo, añadiendo datos de dominio específico.
- Inferencia eficiente con presupuesto de tokens limitado: desplegar la revisión "hf" en entornos donde el coste por token es alto, aprovechando la compresión adaptativa para reducir el número de tokens generados.
- Experimentación con contextos largos: probar si la tokenización adaptativa permite manejar secuencias más largas que el modelo base sin aumentar linealmente el coste computacional.
- Generación de código asistida en investigación: utilizar el modelo para autocompletar fragmentos de código en entornos de desarrollo, validando previamente que las capacidades del base se conservan.
- Prototipado de asistentes conversacionales: emplear el modelo en diálogos multi-turno para estudiar cómo la tokenización adaptativa afecta a la coherencia y al uso de memoria.
- Comparación de tokenizadores en pipelines de NLP: integrar el modelo en un framework de evaluación para medir latencia y throughput frente a otros tokenizadores adaptativos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: no disponible. Depende del tamaño del modelo base Phi-3.5-mini-instruct y de la cuantización aplicada, pero no se proporcionan cifras.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: la librería zip2zip (>=0.2.0) es el método indicado. No se mencionan vLLM, llama.cpp, Ollama o TGI. La revisión "hf" está pensada para inferencia con Zip2ZipModel y Zip2ZipTokenizer.
- Latencia y throughput: no disponible. La tokenización adaptativa podría reducir el número de tokens y, potencialmente, la latencia, pero no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokenización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zip2zip-pp-Phi-3.5-mini-instruct | No disponible (heredado) | No disponible | Zip2Zip++ adaptativa | No disponible | HuggingFace (epfl-dlab) |
| microsoft/Phi-3.5-mini-instruct | No disponible en la información proporcionada | No disponible en la información proporcionada | BPE estándar | No disponible en la información proporcionada | HuggingFace (microsoft) |
| Otros modelos con tokenización adaptativa | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- Licencia no disponible: no se puede confirmar si permite uso comercial. Se recomienda contactar con los autores.
- Es un checkpoint de investigación (paso 8000), no una versión final optimizada para producción.
- La revisión "main" no es compatible con inferencia estándar; solo la revisión "hf" está preparada para Zip2ZipModel.
- No se especifican idiomas soportados; el modelo base es multilingüe, pero el ajuste puede haber alterado el equilibrio.
- Riesgo de alucinación inherente a los modelos de lenguaje, no evaluado en esta ficha.
- La tokenización adaptativa puede dificultar la integración con herramientas que asumen tokenizadores BPE estándar.
- No hay benchmarks publicados que validen el rendimiento en tareas concretas.
- El tamaño del repositorio (25.9 GB) implica requisitos de almacenamiento y transferencia considerables.

## Enlaces
- HuggingFace: https://huggingface.co/epfl-dlab/zip2zip-pp-Phi-3.5-mini-instruct
- Modelo base: https://huggingface.co/microsoft/Phi-3.5-mini-instruct
- EPFL: https://www.epfl.ch/
- No se encontraron enlaces a papers, blogs o repositorios adicionales en la búsqueda web proporcionada.
