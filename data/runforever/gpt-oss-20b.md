# Runforever/gpt-oss-20b

## Resumen

gpt-oss-20b es un modelo de lenguaje de pesos abiertos desarrollado por OpenAI, publicado bajo licencia Apache 2.0. Forma parte de la familia gpt-oss, que incluye también la variante gpt-oss-120b orientada a producción en GPU de 80 GB. El modelo de 20b está pensado para casos de baja latencia, despliegue local y entornos especializados, con un total de 20.914.757.184 parámetros y 3,6 mil millones de parámetros activos gracias a su arquitectura de mezcla de expertos (MoE).

El modelo se distribuye con cuantización MXFP4 aplicada a los pesos del MoE tras el post-entrenamiento, lo que permite ejecutarlo en aproximadamente 16 GB de memoria. Está entrenado sobre el formato de respuesta harmony de OpenAI, y según la model card solo funciona correctamente si se utiliza dicho formato. Incluye capacidades de razonamiento configurable (bajo, medio, alto), cadena de pensamiento completa accesible, function calling, navegación web, ejecución de código Python y salidas estructuradas.

La relevancia actual del modelo radica en que ofrece pesos abiertos con licencia permisiva, razonamiento explícito y capacidades agénticas en un tamaño que cabe en hardware de consumo de gama alta, lo que facilita experimentación, ajuste fino y despliegue comercial sin restricciones de copyleft.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer, con cuantizacion MXFP4 en los pesos del MoE |
| Parametros totales | 20.914.757.184 (aproximadamente 21B) |
| Parametros activos | 3,6B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (post-entrenamiento en los pesos del MoE); tags indican 8-bit y mxfp4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 41,3 GB) |

## Arquitectura y entrenamiento

gpt-oss-20b emplea una arquitectura de mezcla de expertos (MoE) con 21B parámetros totales y 3,6B activos por token. Los pesos del MoE fueron cuantizados en MXFP4 durante el post-entrenamiento, y todas las evaluaciones publicadas se realizaron con esa misma cuantización. El modelo fue entrenado sobre el formato de respuesta harmony, un formato de conversación propietario de OpenAI que estructura roles y canales de razonamiento; según la model card, el modelo no funciona correctamente fuera de ese formato.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Sí se documenta que el modelo permite ajustar el esfuerzo de razonamiento (low, medium, high), expone la cadena de pensamiento completa para depuración y es ajustable mediante fine-tuning de parámetros. No se especifican innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional y razonamiento con esfuerzo configurable (bajo, medio, alto).
- Cadena de pensamiento completa accesible, pensada para depuración y no para mostrarse al usuario final.
- Function calling nativo y salidas estructuradas.
- Capacidades agénticas: navegación web y ejecución de código Python.
- Razonamiento multi-paso orientado a tareas agénticas.
- Ajuste fino de parámetros para personalización.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Asistentes de razonamiento local: el modelo puede ejecutarse en equipos con aproximadamente 16 GB de memoria y ofrecer respuestas con cadena de pensamiento visible, útil para prototipos y análisis de decisiones.
- Automatización de agentes con herramientas: gracias al function calling nativo y a la ejecución de Python, puede integrarse en flujos que consulten APIs, procesen datos o ejecuten scripts en un entorno controlado.
- Generación de código asistida en pipelines: su soporte de salidas estructuradas y ejecución de Python permite incorporarlo a tareas de generación y validación de código en CI/CD, con revisión humana.
- Atención al cliente con contexto conversacional: el formato harmony y el razonamiento configurable permiten gestionar diálogos multi-turno, aunque la longitud de contexto no está documentada y debe verificarse antes de producción.
- Investigación y experimentación académica: la licencia Apache 2.0 y los pesos abiertos facilitan estudios de razonamiento, sesgos y ajuste fino sin restricciones de copyleft.
- Despliegue en hardware de consumo: con Ollama o LM Studio puede ejecutarse en estaciones de trabajo con GPU de gama alta, adecuado para demos y entornos de desarrollo sin infraestructura cloud.
- Extracción de información estructurada: las salidas estructuradas permiten convertir texto libre en JSON u otros formatos para ingestión en bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB con la cuantización MXFP4 incluida en el modelo, según la model card.
- GPU recomendadas: no se especifican modelos concretos para la variante de 20b; la model card menciona H100 y MI300X para gpt-oss-120b, no para este modelo.
- GPU de consumo: la model card indica que puede ejecutarse en hardware de consumo mediante Ollama, sin detallar modelos concretos.
- Opciones de despliegue: Transformers, vLLM (versión 0.10.1+gptoss), Ollama (`gpt-oss:20b`), LM Studio, PyTorch/Triton con implementaciones de referencia y `transformers serve` para servidor compatible con OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b | 20,9B | 3,6B | no disponible | Apache 2.0 | Pesos abiertos en Hugging Face |
| gpt-oss-120b | 117B | 5,1B | no disponible | Apache 2.0 | Pesos abiertos en Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con gpt-oss-120b, la variante mayor de la misma familia, orientada a produccion en una unica GPU de 80 GB. No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con el formato de respuesta harmony; usarlo fuera de ese formato produce resultados incorrectos según la model card.
- La cadena de pensamiento completa no debe mostrarse al usuario final.
- No se documentan los idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- No se documenta la longitud de contexto, lo que impide garantizar conversaciones largas o documentos extensos.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se aportan tasas ni evaluaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial sin restricciones de copyleft, pero conviene revisar los términos de la model card y del formato harmony.
- El repositorio analizado (`Runforever/gpt-oss-20b`) es una copia con 0 descargas y 0 likes; para producción se recomienda usar el repositorio oficial `openai/gpt-oss-20b`.
- No se han publicado resultados de benchmarks en la información disponible, por lo que no es posible validar el rendimiento frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Runforever/gpt-oss-20b
- Repositorio oficial: https://huggingface.co/openai/gpt-oss-20b
- Modelo mayor de la familia: https://huggingface.co/openai/gpt-oss-120b
- Colección gpt-oss: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Model card (arXiv): https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Página del proyecto: https://gpt-oss.com
- Guías (cookbook): https://cookbook.openai.com/topic/gpt-oss
- Repositorio harmony: https://github.com/openai/harmony
- Repositorio gpt-oss: https://github.com/openai/gpt-oss
- Lista de recursos: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Guía de Transformers: https://cookbook.openai.com/articles/gpt-oss/run-transformers
- Guía de vLLM: https://cookbook.openai.com/articles/gpt-oss/run-vllm
- Guía de Ollama: https://cookbook.openai.com/articles/gpt-oss/run-locally-ollama
- Descarga de Ollama: https://ollama.com/download
- LM Studio: https://lmstudio.ai/
- Documentación de Transformers Serve: https://huggingface.co/docs/transformers/main/serving
