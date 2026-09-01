# giovannimaffeo/qwen3.5-0.8b-portuguese-legal-descriptor-generation

## Resumen

El modelo `giovannimaffeo/qwen3.5-0.8b-portuguese-legal-descriptor-generation` es un ajuste fino (fine-tune) del modelo base Qwen3.5-0.8B, desarrollado por giovannimaffeo, orientado a la generación de descriptores legales a partir de documentos judiciales en portugués. Forma parte del trabajo académico "Automatic Legal Descriptor Generation for Portuguese Legal Documents" y utiliza el dataset `giovannimaffeo/portuguese-legal-descriptor-generation` para su entrenamiento.

Se trata de un modelo de generación de texto (pipeline `text-generation`) con un tamaño reducido de aproximadamente 0.8 mil millones de parámetros, lo que lo hace adecuado para entornos con recursos limitados. Su relevancia radica en la automatización de tareas de indexación y descripción de documentos legales, un área con alta demanda en el ámbito jurídico lusófono.

La información pública disponible es escasa: no se especifican detalles de arquitectura interna, contexto máximo, ni licencia. El repositorio en HuggingFace muestra un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar publicados o que el modelo es extremadamente ligero. A pesar de ello, el modelo está etiquetado con `safetensors` y `conversational`, indicando su uso previsto para interacción textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-0.8B, sin detalles adicionales) |
| Parametros totales | 0.8B (según el nombre del modelo, no confirmado en la ficha) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors indicado) |
| Idiomas soportados | Portugués (pt) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-0.8B, una variante de la serie Qwen3.5 que, según la documentación pública, incorpora una fundación unificada de visión-lenguaje con entrenamiento temprano en tokens multimodales. Sin embargo, este fine-tune específico se centra exclusivamente en texto, adaptando el modelo base para la generación de descriptores legales en portugués.

El entrenamiento se realizó mediante fine-tune sobre el dataset `giovannimaffeo/portuguese-legal-descriptor-generation`, que contiene pares de documentos judiciales y sus descriptores asociados. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas en el ajuste.

## Capacidades

- Generación de descriptores legales en portugués a partir de documentos judiciales.
- Procesamiento de texto conversacional (etiqueta `conversational`), lo que sugiere capacidad para mantener diálogos multi-turno.
- Especialización en el dominio jurídico lusófono, con vocabulario y estructuras propias de documentos legales.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, ni soporte multimodal en este fine-tune.
- El modelo base Qwen3.5 podría tener capacidades adicionales, pero no se confirman para esta versión ajustada.

## Casos de uso

- **Indexación automática de expedientes judiciales**: el modelo puede generar descriptores normalizados para cada documento, facilitando la búsqueda y recuperación en sistemas de gestión documental.
- **Asistencia a profesionales del derecho**: abogados y procuradores pueden usar el modelo para obtener resúmenes descriptivos de sentencias, autos o providencias, ahorrando tiempo en la revisión manual.
- **Clasificación de documentos legales**: los descriptores generados pueden servir como entrada para sistemas de clasificación automática por tipo de procedimiento o materia.
- **Generación de metadatos para repositorios jurídicos**: bibliotecas digitales y portales de jurisprudencia pueden enriquecer sus registros con descriptores automáticos, mejorando la interoperabilidad.
- **Preprocesamiento para análisis legal**: los descriptores pueden alimentar pipelines de análisis de texto, como extracción de entidades o modelado de tópicos, al proporcionar una representación compacta del contenido.
- **Formación de modelos de búsqueda semántica**: al generar descriptores consistentes, el modelo puede ayudar a entrenar sistemas de recuperación basados en similitud semántica para consultas legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este modelo, ni comparaciones con otros sistemas de generación de descriptores legales.

## Requisitos de hardware

- Al tratarse de un modelo de aproximadamente 0.8B parámetros, es viable su ejecución en GPUs de consumo con al menos 4 GB de VRAM, dependiendo de la cuantización.
- No se especifican requisitos exactos de VRAM ni latencia en la documentación disponible.
- Opciones de despliegue: al ser un modelo de texto con pesos en safetensors, podría ejecutarse con frameworks como vLLM, llama.cpp u Ollama, aunque no se confirma compatibilidad explícita.
- Para entornos de producción, se recomienda probar con cuantización de 4 bits o 8 bits para reducir el uso de memoria, aunque no se dispone de datos de rendimiento.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de generación de descriptores legales en portugués. No se conocen alternativas directas en el ecosistema open source con la misma especialización y tamaño.

## Limitaciones y advertencias

- El modelo es un fine-tune de tamaño reducido (0.8B), por lo que su capacidad de generalización fuera del dominio legal portugués es limitada.
- No se ha documentado la licencia, lo que impide conocer las restricciones de uso comercial o modificación.
- El repositorio muestra un tamaño de 0.0 GB, lo que podría indicar que los pesos no están disponibles públicamente o que el modelo es un placeholder; se recomienda verificar antes de su uso.
- Al ser un modelo especializado, puede presentar alucinaciones o errores en la generación de descriptores si los documentos de entrada difieren del formato de entrenamiento.
- No se han evaluado sesgos específicos, pero al entrenarse con datos judiciales portugueses, podría reflejar sesgos presentes en el corpus original.
- La ausencia de información sobre el contexto máximo limita la capacidad de procesar documentos largos sin truncamiento.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/giovannimaffeo/qwen3.5-0.8b-portuguese-legal-descriptor-generation)
- [Dataset de entrenamiento](https://huggingface.co/datasets/giovannimaffeo/portuguese-legal-descriptor-generation)
- [Repositorio de Qwen3.5 (referencia del modelo base)](https://github.com/ABDtmx/Qwen3.5)
- [Blog oficial de Qwen3.5](https://qwen.ai/blog?id=qwen3.5)
