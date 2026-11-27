# OpenTARS/Gargantua-Pro

## Resumen

Gargantua Pro es un modelo de lenguaje de 11.907.350.576 parámetros (aproximadamente 12B) desarrollado por MastLLM para el asistente openTARS. Se trata de un ajuste fino (fine-tuning) de google/gemma-4-12b-it, orientado específicamente a tareas de agente: planificación de pasos, invocación de herramientas, verificación de resultados y ejecución iterativa hasta completar un objetivo. El modelo se distribuye en formato GGUF cuantizado Q4_K_M (7,4 GB) y está pensado para ejecución local con llama.cpp y Ollama.

La propuesta de valor es la integración nativa con el conjunto de 19 herramientas de openTARS, el mismo conjunto que emplea Gargantua 2 pero sobre una base de mayor tamaño. El modelo está entrenado sobre datos propios de uso de herramientas de MastLLM y se apoya en el renderer y parser `gemma4` incluidos en Ollama para el formateo de llamadas a funciones.

Es relevante ahora porque ofrece un modelo de ~12B con licencia Apache-2.0, capacidades de tool-use y despliegue local en hardware de consumo (unos 8 GB de VRAM según el autor), lo que facilita entornos de agente sin dependencia de API externas. Es la primera release del proyecto y, según el autor, todavía no se han publicado cifras de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-12b-it); detalles internos no disponibles |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | pt, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `gargantua-pro-gemma4-12b-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de la base google/gemma-4-12b-it y ha sido sometido a un fine-tuning por MastLLM sobre datos propios de uso de herramientas (tool-use). No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La arquitectura concreta (número de capas, dimensiones, mecanismos de atención) tampoco se detalla más allá de su origen en la familia Gemma 4.

La innovación destacable es la especialización en flujos de agente sobre un conjunto fijo de 19 herramientas, con integración directa del renderer y parser `gemma4` en Ollama para el manejo del protocolo de tool calling. El formato de distribución es GGUF cuantizado Q4_K_M, lo que prioriza el despliegue local frente a la precisión completa. No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en portugués e inglés.
- Razonamiento multi-paso orientado a agentes: planificación, ejecución de herramientas, verificación de resultados e iteración.
- Tool calling / function calling mediante la API estándar de Ollama, con un conjunto de 19 herramientas del ecosistema openTARS.
- Ejecución local en llama.cpp y Ollama.
- Integración con la aplicación openTARS, que inyecta automáticamente las 19 herramientas.
- Capacidades de visión, audio o modo "thinking" explícito: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de tareas de agente en local: el modelo puede planificar y ejecutar secuencias de llamadas a herramientas a través de Ollama, manteniendo el bucle de planificación-verificación hasta completar el objetivo, sin necesidad de API en la nube.
- Asistente de escritorio openTARS: integración directa con la aplicación del proyecto, que envía las 19 herramientas al modelo y gestiona las respuestas de tool calling de forma nativa.
- Desarrollo y pruebas de pipelines de agentes: al ser Apache-2.0 y ejecutable con llama.cpp, resulta adecuado para prototipar lógicas de tool-use en entornos de CI o máquinas de desarrollo con GPU de 8 GB.
- Automatización de tareas ofimáticas o de sistema mediante herramientas: el modelo puede encadenar llamadas a funciones expuestas por el entorno (lectura de ficheros, ejecución de comandos, consultas) siguiendo el patrón de agente del proyecto.
- Asistencia técnica en portugués e inglés: conversaciones multi-turno en ambos idiomas, aprovechando el soporte bilingüe declarado.
- Despliegue en hardware de consumo: con cuantización Q4_K_M y ~8 GB de VRAM, permite ejecutar un agente de 12B en estaciones de trabajo o portátiles con GPU dedicada, útil para demos y entornos con requisitos de privacidad.
- Investigación sobre fine-tuning para tool-use: como modelo derivado de Gemma 4 con datos propios de MastLLM, sirve de referencia para estudiar la especialización de un modelo base en agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente en la model card que es la primera release y que todavía no ha publicado cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB según el autor, para la cuantización Q4_K_M (7,4 GB de fichero).
- Alternativa en CPU: ejecución posible con suficiente RAM del sistema, según la model card.
- GPU recomendadas: no se especifican modelos concretos; por el requisito de ~8 GB encajan GPU de consumo con 8 GB o más de VRAM (por ejemplo, gama RTX xx70/xx80 con 8-16 GB) y GPU de datacenter (A100, H100) para mayor throughput, aunque estos últimos no se mencionan en la información.
- Cabe en GPU de consumo: sí, según el requisito de ~8 GB de VRAM indicado por el autor.
- Opciones de despliegue: llama.cpp y Ollama (con renderer y parser `gemma4` integrados). Otros motores como vLLM o TGI no se mencionan.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Gargantua Pro | ~11,9B | no disponible | Sí (19 herramientas, API Ollama) | Apache-2.0 | GGUF Q4_K_M | Fine-tune de Gemma 4 12B para agentes |
| google/gemma-4-12b-it (base) | ~12B | no disponible | Capacidad base no detallada | Apache-2.0 (según model card) | no disponible | Modelo base sin especialización en tool-use |
| Gargantua 2 | no disponible | no disponible | Sí (mismas 19 herramientas) | no disponible | no disponible | Versión anterior del proyecto openTARS, base más pequeña |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y capacidades declaradas.

## Limitaciones y advertencias

- Es la primera release del modelo y no se han publicado benchmarks; el rendimiento real en tareas de agente no está validado de forma pública.
- Idiomas limitados a portugués e inglés; el castellano no está declarado como idioma soportado.
- Riesgo de alucinación inherente a modelos de ~12B, especialmente en cadenas largas de razonamiento y llamadas a herramientas; requiere verificación de resultados en producción.
- Sesgos conocidos: no documentados en la información disponible; al derivar de Gemma 4, hereda los sesgos del modelo base, no evaluados aquí.
- Longitud de contexto no especificada, lo que impide planificar escenarios de contexto largo con garantías.
- Solo se distribuye una cuantización (Q4_K_M), con la consiguiente pérdida de precisión frente a pesos completos.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base google/gemma-4-12b-it antes de desplegar en producción.
- Dependencia del renderer y parser `gemma4` de Ollama para el tool calling; otros motores pueden requerir adaptación manual del protocolo.
- El conjunto de herramientas está acoplado al ecosistema openTARS (19 herramientas); su uso fuera de ese contexto requiere definir y validar un esquema propio.

## Enlaces

- Hugging Face: https://huggingface.co/OpenTARS/Gargantua-Pro
- Proyecto openTARS: https://mastllm.github.io/OpenTARS/
- Perfil del autor en Hugging Face (MastLLM): https://huggingface.co/Mast-LLM
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
