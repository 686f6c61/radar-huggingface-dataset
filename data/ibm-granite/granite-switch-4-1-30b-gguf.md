# ibm-granite/granite-switch-4.1-30b-GGUF

## Resumen

Granite-switch-4.1-30b es un modelo de lenguaje de 30.551.851.008 parámetros (aproximadamente 30,6 mil millones) desarrollado por IBM dentro de la familia Granite 4.1. Se distribuye en este repositorio únicamente en formato GGUF, cuantizado para su uso con llama.cpp, a partir del modelo base original `ibm-granite/granite-switch-4.1-30b`. La model card del repositorio remite explícitamente a la del modelo base para la documentación completa, por lo que los detalles de arquitectura, entrenamiento y evaluación no están incluidos en esta ficha cuantizada.

La relevancia de esta publicación radica en que permite ejecutar un modelo de escala 30B en infraestructura de inferencia ligera (llama.cpp, Ollama y derivados), sin depender de GPUs de datacenter, y con licencia Apache 2.0, lo que facilita su adopción tanto en investigación como en productos comerciales. Los tags del repositorio lo etiquetan como `decision-model` y `conversational`, lo que sugiere un enfoque hacia toma de decisiones y diálogo, aunque no se detalla en la información disponible en qué consiste esa capacidad.

El repositorio tiene un tamaño de 533,8 GB, coherente con la presencia de múltiples niveles de cuantización del mismo modelo. Se actualizó por última vez el 12 de noviembre de 2026 y acumula 3984 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Granite 4.1; la model card de la versión GGUF no la describe) |
| Parametros totales | 30.551.851.008 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | múltiples cuantizaciones GGUF (el repositorio indica "various quantizations"; no se enumeran los niveles concretos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. La model card de este repositorio GGUF es un documento de conversión que remite a la del modelo base `ibm-granite/granite-switch-4.1-30b` para todos los detalles técnicos, y esa model card no forma parte de la información disponible. Por tanto, no se puede confirmar si se trata de un transformer denso, un MoE, un modelo híbrido ni qué innovaciones de atención incorpora.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Lo único verificable es el proceso de conversión: los pesos se generaron con la etiqueta de build de llama.cpp `b11798` y la versión de Transformers `5.20.2`. Cualquier afirmación sobre la arquitectura o el entrenamiento requeriría consultar la model card del modelo base.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica soporte para diálogo multi-turno, si bien no se detallan las capacidades concretas.
- Toma de decisiones: el tag `decision-model` sugiere un uso orientado a tareas de decisión, sin que la información disponible especifique el mecanismo.
- Inferencia local mediante llama.cpp: al estar en formato GGUF, es ejecutable en CPU y GPU con las herramientas del ecosistema llama.cpp.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de infraestructura de endpoints compatible.
- Capacidades de código, matemáticas, visión, audio, tool calling o agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara lista de idiomas.

## Casos de uso

- Despliegue en estaciones de trabajo sin GPU de datacenter: gracias a las cuantizaciones GGUF, el modelo puede ejecutarse con llama.cpp en equipos con GPU de consumo o incluso en CPU, lo que permite prototipar aplicaciones de 30B sin infraestructura dedicada.
- Asistentes conversacionales autoalojados: el tag `conversational` y la licencia Apache 2.0 lo hacen apto para integrar un chatbot en productos propios sin obligaciones de atribución adicionales ni restricciones de uso comercial.
- Sistemas de apoyo a la decisión: el tag `decision-model` apunta a escenarios donde el modelo ayuda a evaluar opciones o clasificar cursos de acción, aunque la documentación disponible no detalla el formato de uso recomendado.
- Servicio de inferencia compatible con endpoints: al estar marcado como `endpoints_compatible`, puede desplegarse detrás de una API compatible con el ecosistema de endpoints para servir múltiples clientes.
- Experimentación e investigación reproducible: al ser Apache 2.0 y estar disponible en GGUF, un equipo de investigación puede reproducir experimentos en hardware modesto y comparar cuantizaciones sin depender de pesos propietarios.
- Integración en pipelines de CI o herramientas de desarrollo: la ejecución local vía llama.cpp permite incorporar el modelo en flujos automatizados de revisión o generación de texto sin enviar datos a servicios externos, lo que ayuda con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma exacta, ya que el repositorio no enumera los niveles de cuantización. Como referencia de orden de magnitud para un modelo de 30,6B parámetros: en cuantización de 4 bits se necesitan aproximadamente 17-19 GB de VRAM solo para los pesos, más overhead de contexto; en 8 bits, en torno a 32-34 GB; en FP16, unos 61 GB.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo de 30B en 4 bits encaja en GPUs de consumo con 24 GB (por ejemplo, RTX 3090 o RTX 4090), mientras que las cuantizaciones de 8 bits o superiores requieren A100 40 GB, A6000 48 GB o H100.
- Cabe en GPU de consumo: previsiblemente sí en cuantizaciones de 4 bits con 24 GB de VRAM, aunque el repositorio no confirma los niveles incluidos ni los requisitos oficiales.
- Opciones de despliegue: llama.cpp (build `b11798` como referencia), y por extensión las herramientas que lo integran, como Ollama o servidores compatibles con la API de llama.cpp. No se confirma soporte de vLLM o TGI para este repositorio GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card del repositorio GGUF no documenta arquitectura, contexto, idiomas ni evaluación; toda decisión de producción debe basarse en la model card del modelo base, que no está incluida en la información disponible.
- Riesgo de alucinación: no cuantificado en la documentación disponible; como en cualquier modelo generativo, debe asumirse y mitigarse con verificación externa.
- Sesgos: no documentados en la información proporcionada.
- Idiomas: la lista de idiomas soportados no está declarada, por lo que no se puede garantizar un rendimiento adecuado fuera del inglés.
- Cuantización: las versiones GGUF introducen pérdida de precisión respecto al modelo base; el repositorio no publica evaluaciones comparativas entre cuantizaciones.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar la model card del modelo base por si añade términos adicionales (por ejemplo, políticas de uso aceptable) que no aparecen en este repositorio.
- Tamaño del repositorio: 533,8 GB, lo que implica un coste de almacenamiento y descarga considerable; conviene descargar solo el archivo de cuantización necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ibm-granite/granite-switch-4.1-30b-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-switch-4.1-30b
- llama.cpp: no disponible en la información proporcionada (el repositorio cita el build `b11798` sin enlace)
- Papers, blogs, demos y repositorios adicionales: no disponibles en la información proporcionada
