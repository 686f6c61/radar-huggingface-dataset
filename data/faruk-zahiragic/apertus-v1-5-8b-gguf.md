# faruk-zahiragic/Apertus-v1.5-8B-GGUF

## Resumen

Apertus-v1.5-8B-GGUF es una conversión a formato GGUF del modelo Apertus-v1.5-8B desarrollado por Swiss AI (swiss-ai), un consorcio suizo de investigación en inteligencia artificial. El modelo original es un transformer multimodal de 8.609.083.456 parámetros (aproximadamente 8,6 mil millones) publicado bajo licencia Apache 2.0, que forma parte de la familia Apertus 1.5 junto con una variante de 70B. Esta conversión concreta, realizada por el usuario faruk-zahiragic, es una versión exclusivamente de texto que excluye los componentes de visión y audio del modelo original y emplea cuantización Q4_K_M.

El modelo base Apertus 1.5 amplía la versión 1.0 con comprensión de imágenes, un modo de razonamiento opcional (thinking mode), una ventana de contexto cuatro veces mayor, mejor seguimiento de instrucciones y un uso de herramientas más robusto. Está diseñado como un modelo de datos y pesos abiertos, globalmente multilingüe y con soporte de entrada multimodal y razonamiento.

La relevancia de esta ficha radica en que ofrece una vía de despliegue local y offline del modelo Apertus 1.5 en hardware de consumo, sin necesidad de GPU dedicada, mediante el fork de llama.cpp compatible con Apertus. El repositorio tiene un tamaño de 5,7 GB y el archivo GGUF concreto ocupa 5.656.804.512 bytes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Apertus-v1.5-8B; detalles específicos no disponibles) |
| Parámetros totales | 8.609.083.456 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el modelo base Apertus 1.5 amplía el contexto de la versión 1.0, pero no se especifica la cifra exacta) |
| Tipos de cuantización | Q4_K_M (única cuantización publicada en este repo) |
| Idiomas soportados | no disponibles (el modelo base se describe como «globalmente multilingüe») |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Apertus-v1.5-8B es un transformer de aproximadamente 8,6 mil millones de parámetros. La familia Apertus 1.5 se describe como de datos y pesos abiertos, globalmente multilingüe y con soporte de entrada multimodal (imagen) y razonamiento. La versión 1.5 incorpora comprensión de imágenes, un modo de razonamiento opcional, una ventana de contexto cuatro veces mayor que la de Apertus 1.0, mejor seguimiento de instrucciones y mejor uso de herramientas. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

Esta conversión concreta se realizó a partir de la revisión del código fuente `0be762a6` del modelo original, utilizando el fork de llama.cpp compatible con Apertus en el commit `442b0444168a0f72788b40a16c8289bd1eb217f5`. La conversión excluye los componentes de visión y audio del modelo original, por lo que el resultado es un modelo exclusivamente de texto. La cuantización Q4_K_M altera las salidas del modelo respecto al original, y el autor advierte que debe comprobarse la idoneidad para cada tarea.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento con modo de pensamiento opcional (thinking mode) heredado del modelo base Apertus 1.5.
- Uso de herramientas (tool use) mejorado respecto a Apertus 1.0, según las notas del modelo base.
- Seguimiento de instrucciones mejorado respecto a la versión anterior del modelo base.
- Capacidades multilingües (el modelo base se describe como globalmente multilingüe).
- Capacidades multimodales de imagen: presentes en el modelo base, pero excluidas en esta conversión GGUF.
- Capacidades de audio: presentes en el modelo base, pero excluidas en esta conversión GGUF.
- Ejecución offline y compatible con endpoints (`endpoints_compatible`), sin requerir GPU dedicada.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar conversaciones multi-turno en local sin conexión, aprovechando su formato GGUF y su compatibilidad con llama.cpp para entornos con requisitos de privacidad.
- Despliegue en estaciones de trabajo sin GPU dedicada: gracias al soporte de CPU y aceleración de GPU integrada, puede ejecutarse en equipos con 16 GB de RAM recomendados, lo que lo hace apto para prototipado en portátiles y equipos de sobremesa convencionales.
- Generación de texto y redacción asistida en pipelines offline: al ser un modelo de texto puro, puede integrarse en flujos de generación de documentación, resúmenes o borradores donde no se requiera multimodalidad.
- Razonamiento con modo de pensamiento para tareas analíticas: el thinking mode opcional del modelo base permite abordar problemas que requieren pasos intermedios de razonamiento antes de la respuesta final.
- Integración en aplicaciones con uso de herramientas: el soporte de tool use del modelo base permite construir asistentes que invoquen funciones externas en entornos controlados.
- Evaluación e investigación de modelos abiertos: al estar bajo Apache 2.0 y con pesos GGUF, sirve para experimentar con cuantización, comparar salidas frente al modelo original y validar el fork de llama.cpp compatible con Apertus.
- Atención al cliente en entornos air-gapped: la ejecución totalmente offline permite desplegar asistentes en redes aisladas donde no es posible usar APIs en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica además que no existen resultados medidos de rendimiento en Apple Silicon.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el archivo GGUF Q4_K_M ocupa 5.656.804.512 bytes (aproximadamente 5,3 GiB), por lo que la huella de memoria del modelo ronda esa cifra más el overhead de contexto.
- RAM recomendada: 16 GB como punto de partida; el funcionamiento con 8 GB no está validado según el autor.
- GPU dedicada: no es necesaria; el modelo soporta CPU y aceleración de GPU integrada.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no se especifican modelos concretos; el diseño apunta a ejecución sin GPU dedicada.
- Opciones de despliegue: llama.cpp mediante el fork compatible con Apertus (commit `442b0444168a0f72788b40a16c8289bd1eb217f5`); formato GGUF compatible con el ecosistema llama.cpp. No se confirma compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles; no hay resultados medidos, incluido Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Apertus-v1.5-8B-GGUF (esta ficha) | 8.609.083.456 | no disponible | No (excluida en la conversión) | Apache 2.0 | GGUF (Q4_K_M) |
| Apertus-v1.5-8B (modelo base) | 8.609.083.456 | no disponible (4× mayor que Apertus 1.0) | Sí (imagen; audio según notas) | Apache 2.0 | safetensors (no confirmado en la información) |
| Apertus-v1.5-70B | no disponible | no disponible | Sí (imagen) | Apache 2.0 | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo (benchmarks) entre estas variantes ni frente a modelos de otros desarrolladores.

## Limitaciones y advertencias

- La cuantización Q4_K_M modifica las salidas respecto al modelo original; el autor recomienda comprobar la idoneidad para cada tarea antes de usarlo en producción.
- Esta conversión excluye los componentes de visión y audio, por lo que no puede procesar imágenes ni audio aunque el modelo base sí lo haga.
- El funcionamiento con 8 GB de RAM no está validado; el mínimo recomendado es 16 GB.
- No hay resultados medidos de rendimiento en Apple Silicon.
- No se dispone de información sobre sesgos conocidos del modelo base en la documentación proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos de este tamaño.
- Idiomas soportados: no se detallan; el modelo base se describe como globalmente multilingüe, pero no hay lista concreta.
- Longitud de contexto: no se especifica la cifra exacta, solo que la familia 1.5 cuadruplica la de 1.0.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse la atribución y los avisos del modelo original que acompañan a la distribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/faruk-zahiragic/Apertus-v1.5-8B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Colección Apertus v1.5: https://huggingface.co/collections/swiss-ai/apertus-v15
- Anuncio de Apertus 1.5: https://apertus-ai.org/articles/2026-07-apertus-1-5/
- Repositorio del proyecto de conversión y parches de runtime: https://github.com/FarukZahiragic/apertus-local
