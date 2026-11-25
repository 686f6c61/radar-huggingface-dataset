# agentscope-ai/Piccolo-27B-Q4_K_M

## Resumen

Piccolo-27B-Q4_K_M es la distribucion cuantizada en formato GGUF (Q4_K_M) del modelo Piccolo-27B, desarrollado por AgentScope (agentscope-ai). No se trata de un modelo generativo al uso: es un modelo de decision disenado especificamente para revisar llamadas a herramientas y seleccionar contexto en pipelines de agentes. En lugar de generar tokens de respuesta, devuelve probabilidades sobre candidatos, lo que lo hace adecuado como componente de enrutamiento y validacion dentro de sistemas multiagente.

El modelo base cuenta con aproximadamente 26.900 millones de parametros (26.895.998.464), lo que lo situa en la categoria de 27B, y emplea una arquitectura con atencion bidireccional sobre el prompt, una eleccion poco habitual que permite puntuar secuencias completas de candidatos en lugar de predecir el siguiente token de forma autoregresiva. Esta version cuantizada ocupa unos 16,5 GB en el repositorio y se distribuye en cuatro shards.

Su relevancia actual reside en que cubre una necesidad concreta de los sistemas agenticos en produccion: decidir, con bajo coste y sin generacion, si una herramienta debe invocarse, que contexto recuperar o que accion es mas probable. La licencia Apache 2.0 y su disponibilidad en GGUF facilitan el despliegue local, aunque requiere un runtime especifico derivado de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion bidireccional sobre el prompt (decision model) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (esta release); el modelo base se distribuye en BF16 |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (4 shards) |

## Arquitectura y entrenamiento

Piccolo-27B se presenta como un «decision model» con atencion bidireccional, lo que implica que el modelo observa el prompt completo en ambas direcciones para calcular puntuaciones sobre candidatos, en lugar de operar como un decoder autoregresivo clasico. El pipeline declarado es text-classification y el modelo esta etiquetado con la familia qwenpaw, lo que sugiere una base derivada de la linea Qwen adaptada a tareas de decision. El proceso de conversion documentado consistio en transformar el backbone de texto a GGUF en BF16 y despues cuantizarlo a Q4_K_M.

El autor no detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable es la inferencia de decision nativa: el runtime compatible expone un endpoint `/v1/systemone` que devuelve probabilidades sin generar tokens de respuesta, apoyandose en atencion bidireccional sobre el prompt y puntuacion nativa de candidatos. La validacion numerica publicada compara la version cuantizada con la referencia BF16 sobre 556 juicios sinteticos, con una variacion total media de 0,006137 (p95 de 0,019516), lo que indica una degradacion por cuantizacion muy contenida.

## Capacidades

- Puntuacion de candidatos y devolucion de probabilidades sin generacion de texto.
- Revision de llamadas a herramientas (tool review) dentro de pipelines de agentes.
- Seleccion de contexto relevante para alimentar a otros modelos.
- Clasificacion de texto y toma de decisiones discretas sobre opciones predefinidas.
- Atencion bidireccional sobre el prompt para evaluar secuencias completas.
- Soporte bilingue en ingles y chino.
- Integracion con runtimes compatibles con endpoints estilo OpenAI (`endpoints_compatible`).
- No orientado a generacion libre de texto, razonamiento abierto ni codigo generativo.

## Casos de uso

- Validacion de llamadas a herramientas en agentes: antes de ejecutar una funcion, el modelo puntua la propuesta y devuelve una probabilidad de acierto, permitiendo descartar invocaciones erroneas sin coste de generacion.
- Enrutamiento de consultas: dado un conjunto de herramientas o agentes disponibles, Piccolo calcula que candidato encaja mejor con la peticion del usuario y devuelve la distribucion de probabilidad.
- Seleccion de contexto en RAG: el modelo puntua fragmentos candidatos y ayuda a elegir que pasajes incluir en el prompt de un LLM generativo posterior.
- Clasificacion de intenciones en atencion al cliente: con salida probabilistica sobre categorias predefinidas, permite umbrales de confianza y derivacion a humano cuando la probabilidad es baja.
- Moderacion y filtrado previo: evaluacion de si una accion o peticion cumple criterios definidos antes de pasar a un modelo mayor, reduciendo coste y latencia.
- Orquestacion multiagente: como arbitro que decide que subagente debe atender una tarea, aprovechando la puntuacion nativa de candidatos.
- Despliegue local en estaciones de trabajo: al estar en GGUF Q4_K_M, puede ejecutarse con el runtime compatible en equipos con GPU de consumo alta o incluso CPU con suficiente RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enlaza a la seccion de evaluacion del repositorio de GitHub (github.com/agentscope-ai/Piccolo/tree/main/evaluation), pero los valores concretos no se incluyen en los datos proporcionados. El unico dato cuantitativo disponible es la validacion de cuantizacion: variacion total media de 0,006137 y p95 de 0,019516 frente a la referencia BF16 sobre 556 juicios sinteticos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16,5 GB solo para los pesos en Q4_K_M; con overhead de contexto y runtime, conviene prever 18-20 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue comodo; RTX 4090 (24 GB) es suficiente para los pesos con margen ajustado.
- GPU de consumo: cabe en RTX 4090 y en GPUs de 24 GB; en tarjetas de 16 GB no es viable sin offloading.
- Opciones de despliegue: requiere el runtime compatible de llama.cpp publicado por el autor (con atencion bidireccional y puntuacion nativa de candidatos). No se garantiza funcionamiento en llama.cpp estandar, Ollama o vLLM sin adaptaciones.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion principal | Licencia | Formato |
|---|---|---|---|---|---|
| Piccolo-27B-Q4_K_M | ~26,9B | No disponible | Modelo de decision / puntuacion de candidatos | Apache 2.0 | GGUF |
| Piccolo-27B (base) | ~26,9B | No disponible | Modelo de decision en BF16 | Apache 2.0 | Safetensors/BF16 |
| LLM generativos de ~27B (p. ej. Qwen2.5-32B) | ~32B | 32K+ (tipico) | Generacion de texto y razonamiento | Variable | Safetensors, GGUF |

La comparacion con LLM generativos es solo orientativa: Piccolo no compite en generacion de texto, sino en decision y clasificacion probabilistica, un nicho con pocos modelos publicos de este tamano. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no debe emplearse para producir texto libre, codigo o razonamiento abierto.
- Requiere un runtime especifico (fork de llama.cpp con atencion bidireccional); el llama.cpp estandar no es compatible segun la documentacion del autor.
- Cobertura linguistica limitada a ingles y chino; el rendimiento en castellano no esta documentado.
- La cuantizacion Q4_K_M introduce una desviacion pequena pero medible (variacion total media 0,006137) frente a BF16; en decisiones con umbrales muy ajustados conviene validar.
- Riesgo de calibracion: al devolver probabilidades, un mal calibrado puede producir falsos positivos o negativos en el enrutamiento; se recomienda evaluar con datos propios.
- No se documentan sesgos conocidos ni la composicion del dataset de entrenamiento, lo que dificulta la auditoria.
- La licencia Apache 2.0 permite uso comercial, pero deben revisarse los avisos de terceros (THIRD_PARTY_LICENSES.md) por posibles componentes heredados del modelo base.
- Tamano de 27B con 16,5 GB en disco: no apto para entornos con recursos muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentscope-ai/Piccolo-27B-Q4_K_M
- Modelo base: https://huggingface.co/agentscope-ai/Piccolo-27B
- Repositorio del proyecto en GitHub: https://github.com/agentscope-ai/Piccolo
- Documentacion del runtime compatible: https://github.com/agentscope-ai/Piccolo/blob/main/docs/QWENPAW.md
- Evaluacion: https://github.com/agentscope-ai/Piccolo/tree/main/evaluation
- Listado de modelos: https://github.com/agentscope-ai/Piccolo/blob/main/docs/MODELS.md
- Decision Playground: https://decisionplayground.agentscope.io/
- Coleccion en ModelScope: https://www.modelscope.cn/collections/AgentScope/QwenPaw-Flash
- Modelo en ModelScope: https://www.modelscope.cn/models/AgentScope/Piccolo-27B-Q4_K_M
- Detalles de validacion: https://huggingface.co/agentscope-ai/Piccolo-27B-Q4_K_M/resolve/main/validation.json
- Licencia: https://huggingface.co/agentscope-ai/Piccolo-27B-Q4_K_M/resolve/main/LICENSE
- Avisos de terceros: https://huggingface.co/agentscope-ai/Piccolo-27B-Q4_K_M/resolve/main/THIRD_PARTY_LICENSES.md
