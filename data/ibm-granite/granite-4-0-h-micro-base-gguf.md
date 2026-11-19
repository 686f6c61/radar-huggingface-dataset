# ibm-granite/granite-4.0-h-micro-base-GGUF

## Resumen

Granite-4.0-h-micro-base es un modelo de lenguaje de tipo base (no instruido) desarrollado por IBM dentro de la familia Granite 4.0. Con 3.191.396.096 parámetros totales (aproximadamente 3,2 mil millones), se posiciona como la variante más pequena de la gama "h" (hybrid) de Granite 4.0, pensada para despliegues con recursos limitados manteniendo una ventana de contexto muy amplia.

Este repositorio concreto contiene la version convertida a formato GGUF con multiples cuantizaciones, orientada a su ejecucion mediante llama.cpp. Al tratarse de un modelo base, no ha sido ajustado para seguir instrucciones ni para conversar: su proposito es servir como punto de partida para fine-tuning o para tareas de modelado de lenguaje puro (prediccion de siguiente token, generacion libre, evaluacion de perplejidad).

La relevancia actual radica en que combina una licencia permisiva Apache 2.0, un tamano que cabe en GPUs de consumo y un contexto de entrenamiento de hasta 128k tokens, lo que lo hace atractivo para experimentacion local, prototipado de pipelines de NLP y ajuste fino sobre dominio especifico sin depender de infraestructura cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrida (familia Granite 4.0 "h"); detalles especificos no disponibles en la informacion proporcionada |
| Parametros totales | 3.191.396.096 |
| Parametros activos | no disponible |
| Longitud de contexto | Entrenado hasta 128k tokens; se recomienda limitar a 131072 en runtime |
| Tipos de cuantizacion | Multiples cuantizaciones GGUF (el ejemplo de la model card usa Q4_K_M); el conjunto completo no esta detallado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

La model card del repositorio GGUF remite a la ficha del modelo base (ibm-granite/granite-4.0-h-micro-base) para los detalles completos de arquitectura y entrenamiento, que no se reproducen en la informacion disponible. El identificador "h" de la familia Granite 4.0 hace referencia a una arquitectura hibrida, aunque la composicion exacta (atencion, capas recurrentes o mezcla) no se especifica en los datos proporcionados.

Un detalle tecnico destacable que si aparece en la model card es que el modelo "no utiliza positional embeddings", lo que en la practica permite soportar contextos arbitrariamente largos en inferencia; sin embargo, el entrenamiento se realizo con texto de hasta 128k tokens, por lo que IBM recomienda fijar el contexto en 131072 en runtime para evitar degradacion. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni si se aplicaron fases de RLHF o DPO (al ser un modelo base, es esperable que no incluya ajuste por preferencias, pero esto no se confirma en la informacion disponible).

## Capacidades

- Generacion de texto autoregresiva y modelado de lenguaje (modelo base, sin ajuste instructivo).
- Capacidad de continuacion de texto y prediccion de siguiente token, adecuada para evaluacion de perplejidad y benchmarking de NLP.
- Ventana de contexto de hasta 128k tokens en entrenamiento, con soporte de contexto arbitrario en inferencia segun la model card.
- Punto de partida para fine-tuning supervisado y ajuste sobre dominio especifico.
- Ejecucion local via llama.cpp, con soporte de CLI interactiva y servidor compatible con la API de OpenAI (`/v1/chat/completions`).
- Soporte de tool calling, agentes, vision, audio o modo thinking: no disponible (no se documenta ninguna de estas capacidades).
- Capacidades multilingues: no disponible.

## Casos de uso

- Fine-tuning sobre dominio especifico: al ser un modelo base de 3,2B parametros con licencia Apache 2.0, es un candidato para ajuste supervisado en tareas verticales (clasificacion, extraccion, redaccion tecnica) sin coste de licencia y con requisitos de GPU modestos.
- Experimentacion e investigacion en NLP: util para reproducir experimentos de modelado de lenguaje, medir perplejidad en corpus propios y comparar tecnicas de cuantizacion, gracias a las multiples variantes GGUF del repositorio.
- Prototipado local de asistentes: mediante `llama serve` se puede exponer un endpoint compatible con la API de OpenAI y conectar herramientas existentes para validar flujos antes de migrar a modelos mayores.
- Procesamiento de documentos largos: con contexto de hasta 131072 tokens, permite tareas de resumen, extraccion o analisis sobre contratos, informes o expedientes extensos en una sola pasada.
- Generacion aumentada por recuperacion (RAG): el modelo puede actuar como generador en pipelines RAG donde el contexto recuperado sea amplio, ejecutandose en hardware de consumo.
- Educacion y demos offline: su tamano permite desplegarlo en portatiles con GPU consumer para talleres, cursos o demostraciones sin conexion a servicios cloud.
- Base para modelos derivados: servir como cimiento para la comunidad que quiera publicar variantes ajustadas (chat, instrucciones, dominio) bajo la misma licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion de un modelo de 3,2B parametros): en torno a 2-3 GB para Q4_K_M, 4-5 GB para Q8_0 y 6-7 GB en FP16. Estas cifras son estimaciones de orden de magnitud, no datos publicados en la informacion disponible.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) para cuantizaciones bajas; A100 o H100 no son necesarias para este tamano, aunque permitirian mayor throughput en serving.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas para cuantizaciones Q4/Q5/Q8.
- Opciones de despliegue: llama.cpp (CLI y servidor), y por compatibilidad de formato GGUF, otros runners basados en llama.cpp como Ollama o LM Studio (no confirmado explicitamente en la model card).
- Build de referencia: llama.cpp tag `b11798`; version de Transformers `5.20.2`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| granite-4.0-h-micro-base (este) | 3,19B | 128k (entrenamiento) | Apache 2.0 | GGUF / safetensors | Modelo base, arquitectura hibrida, sin benchmarks publicados en la informacion disponible |
| Alternativas de ~3B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa fiable con modelos alternativos de la misma categoria; se indica "no disponible" para evitar datos no verificados.

## Limitaciones y advertencias

- Modelo base: no sigue instrucciones ni mantiene formato conversacional de forma fiable; para uso como asistente requiere fine-tuning o tecnicas de prompting especificas.
- Riesgo de alucinacion: como todo modelo de lenguaje generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas factuales.
- Sesgos: no se documenta en la informacion disponible una evaluacion de sesgos; se recomienda auditar antes de uso en produccion.
- Idiomas: no se especifica el conjunto de idiomas soportados; el rendimiento fuera de ingles puede ser inferior y no esta garantizado.
- Contexto: aunque la arquitectura permita contextos arbitrarios en inferencia, el entrenamiento se limito a 128k tokens; superar ese limite puede degradar la calidad.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; conviene revisar los terminos del modelo base por si hubiera condiciones adicionales no reflejadas en la informacion disponible.
- Produccion: al ser un modelo base sin benchmarks publicados, no hay evidencia de rendimiento en tareas concretas; se recomienda evaluacion propia antes de desplegar.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/ibm-granite/granite-4.0-h-micro-base-GGUF
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-4.0-h-micro-base
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de flags de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Referencia de flags de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
