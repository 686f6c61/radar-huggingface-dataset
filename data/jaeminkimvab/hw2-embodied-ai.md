# jaeminkimvab/hw2-embodied-ai

## Resumen

El repositorio `jaeminkimvab/hw2-embodied-ai` no contiene un modelo entrenado ni un checkpoint de IA. Se trata de un conjunto de notas de investigación sobre Embodied AI (IA corpórea), organizadas como un documento de trabajo exploratorio. El autor, `jaeminkimvab`, publica bajo licencia MIT un archivo `notes.md` que recoge motivación, trabajo relacionado, una hipótesis falsable y un plan de evaluación, junto con referencias temáticas. No se proporcionan pesos, arquitectura, código de entrenamiento ni resultados experimentales.

Aunque el repositorio está etiquetado en Hugging Face con `safetensors` y `transformer`, el único artefacto presente es un documento Markdown. El valor de este recurso es puramente documental: puede servir como punto de partida para investigadores interesados en diseñar un estudio sobre IA corpórea, pero no es un modelo utilizable para inferencia. La fecha de creación y actualización (2026-09-09) y el tamaño del repositorio (0.0 GB) confirman que no hay pesos almacenados.

Para cualquier uso práctico de un modelo de IA, este repositorio no es aplicable. La presente ficha se redacta de forma transparente, indicando "no disponible" en los campos que corresponden a un modelo de lenguaje y señalando que el contenido real es un documento de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo) |
| Parametros totales | no disponible (el repositorio solo contiene archivos de texto) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos; el repo contiene Markdown) |

## Arquitectura y entrenamiento

No hay arquitectura ni entrenamiento que describir. El repositorio no incluye un modelo de lenguaje, no define capas, parámetros ni pipeline de generación. La etiqueta `transformer` en Hugging Face es un metadato genérico, no una especificación técnica confirmada por ficheros de pesos. Tampoco hay datos de entrenamiento, tokens, RLHF, DPO ni ninguna técnica de optimización. El contenido se limita a notas conceptuales y un plan de evaluación para futuros experimentos.

El propio autor indica en la model card que el repositorio "no se presenta como un paper completado ni como una liberación de modelos entrenados". Las secciones marcadas como planes o hipótesis no deben interpretarse como resultados.

## Capacidades

- Ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión, porque no existe un modelo ejecutable.
- No soporta tool calling ni function calling.
- No soporta agentes ni multi-step reasoning.
- No hay capacidades multilingües.
- No hay modo de pensamiento, visión ni audio.

## Casos de uso

- Documentación conceptual para un framework de investigación: el repositorio puede usarse como referencia para estructurar una propuesta de estudio sobre IA corpórea, pero no ofrece código ni pesos para ejecutar.
- Punto de partida para revisión bibliográfica: las referencias del documento pueden orientar a investigadores sobre trabajos relacionados en Embodied AI, siempre que se consulten las fuentes originales.
- Plantilla de plan de evaluación: la estructura de hipótesis, baselines y benchmarks propuestos puede adaptarse a un proyecto propio, pero requiere que el investigador implemente todo el pipeline.
- Discusión académica informal: el contenido sirve para debatir alcance, confusores y preguntas abiertas en un entorno de notas, no para obtener resultados numéricos.
- No es adecuado para ninguna aplicación en producción, porque no hay modelo que desplegar.
- No es adecuado para integración en pipelines, APIs ni aplicaciones de usuario, porque no hay inferencia disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio menciona "benchmarks públicos apropiados para la tarea" como parte del plan de evaluación, pero no proporciona mediciones, comparaciones ni logs. No hay ningún número de MMLU, HumanEval, GSM8K ni otra métrica que pueda presentarse en una tabla. Cualquier dato de rendimiento sería inventado.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable, no existe modelo.
- GPU recomendadas: no aplicable.
- No cabe en ninguna GPU, porque no hay pesos que cargar.
- Opciones de despliegue: no aplicable (no hay vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No existe comparativa posible, porque este repositorio no es un modelo. No se puede comparar con otros modelos de lenguaje de ningún tamaño. Si se busca una alternativa real para tareas de IA corpórea, sería necesario acudir a modelos como los de la serie RT-2, PaLM-E o similares, pero no hay datos en la información proporcionada para establecer una comparación directa.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado: intentar cargarlo como un modelo de Hugging Face fallará.
- La etiqueta `safetensors` en los metadatos no se corresponde con ningún archivo de pesos real; el tamaño del repo es 0.0 GB.
- El contenido es exploratorio y no ha sido validado experimentalmente. Las hipótesis no son resultados.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto porque no hay sistema que las manifieste.
- La licencia MIT permite uso y modificación de las notas, pero los términos de los datasets externos citados deben revisarse por separado.
- Para producción o evaluación de modelos, este repositorio no ofrece ninguna capacidad práctica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jaeminkimvab/hw2-embodied-ai
- Archivo principal de notas: `notes.md` dentro del repositorio (no accesible directamente desde la URL de Hugging Face sin clonar el repo).
- No se han encontrado papers, blogs, demos ni otros enlaces relevantes en la búsqueda web.
