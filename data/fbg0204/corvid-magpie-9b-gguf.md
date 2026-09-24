# fbg0204/Corvid-Magpie-9B-gguf

## Resumen

Corvid-Magpie-9B es un paquete de pesos en formato GGUF publicado por el usuario fbg0204, derivado por cuantizacion del modelo empero-ai/Qwen3.8-9B-Distill. No se trata de un modelo entrenado desde cero: los pesos distribuidos son identicos a los del GGUF de origen (Qwen3.8-9B-Q4_K_M.gguf, aproximadamente 5,78 GB), y el trabajo del autor consiste en empaquetarlos junto con recomendaciones de ejecucion y mediciones de rendimiento sobre hardware de consumo.

El modelo hereda la arquitectura qwen35 de Qwen3.5-9B, un diseno hibrido que combina Gated DeltaNet con atencion convencional, y anade la capa nativa de prediccion MTP (multi-token prediction) del modelo base, almacenada en los tensores blk.32.nextn.*. La ventana de contexto nativa es de 262.144 tokens. Su proposito declarado es la inferencia local rapida en equipos de sobremesa: el autor reporta hasta 41,6 tok/s de decodificacion con decodificacion especulativa MTP en una RTX 3060 de 8 GB.

La relevancia actual del modelo es doble. Por un lado, demuestra que un modelo de ~9B con contexto de 262K puede ejecutarse en una GPU de 8 GB desplazando la cache KV a memoria del sistema, con soporte de cache de prefijo en memoria. Por otro lado, la propia model card advierte de que se trata de un borrador experimental: los pesos, la configuracion, las recomendaciones de runtime y las metricas pueden cambiar, por lo que no debe considerarse una version estable para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido qwen35 (Gated DeltaNet + atencion convencional) |
| Parametros totales | no disponible (denominacion comercial de 9B; el recuento exacto no se publica en la informacion disponible) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Q4_K_M en el GGUF distribuido; el autor sugiere cuantizar la cache KV a q8_0 en configuracion general y a q4_0 para contextos superiores a 64K |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura es la qwen35 de Qwen3.5-9B, un transformer hibrido que intercala capas de Gated DeltaNet (un mecanismo de estado recurrente con compuertas) con capas de atencion convencional. Este diseno busca reducir el coste de memoria y computo en secuencias largas manteniendo la capacidad de atencion global, lo que explica que el modelo pueda sostener nominalmente 262.144 tokens de contexto. Sobre esta base, el modelo incorpora una capa nativa de prediccion MTP procedente de Qwen3.8-9B-Distill, almacenada en los tensores blk.32.nextn.* con una unica capa de prediccion; esa capa se utiliza para decodificacion especulativa a traves de llama.cpp upstream.

No hay informacion disponible sobre el entrenamiento: ni el numero de tokens, ni la composicion del dataset, ni si hubo fases de RLHF o DPO. El autor indica que el comportamiento procede de la destilacion de Qwen3.8 sobre la arquitectura de Qwen3.5-9B, pero ese proceso corresponde al modelo base empero-ai/Qwen3.8-9B-Distill, no a este derivado, que solo cuantiza y reempaqueta los pesos. Como innovaciones tecnicas documentadas en esta ficha figuran la decodificacion especulativa con MTP (longitud de borrador recomendada de 2), la cache de prefijo en memoria de llama.cpp y el soporte de cache KV en RAM del sistema mediante el flag -nkvo. El proyector de vision de 918 MB en F16 existe en el modelo base, pero el autor no lo ha probado con Magpie.

## Capacidades

- Generacion de texto y codigo: el modelo resuelve tareas de programacion en Python. En la suite interna de 20 tareas con tests ocultos, decodificacion greedy y limite de 6144 tokens de salida, completo 18 de 20; los dos fallos agotaron el limite de tokens mientras seguian razonando, no por generar codigo incorrecto.
- Razonamiento con presupuesto configurable: el runtime admite un presupuesto de razonamiento mediante --reasoning-budget (por ejemplo, 2048 tokens), que el autor usa para mejorar el rendimiento en tareas de codigo.
- Contexto largo: ventana nativa de 262.144 tokens, con procesamiento de prompts medido hasta 100K tokens.
- Cache de prefijo en memoria: soportada y probada a traves de llama.cpp, lo que acelera consultas repetidas sobre prefijos compartidos.
- Decodificacion especulativa con MTP: integrada de forma nativa en los pesos.
- Inferencia local: disenada explicitamente para GPU de consumo y memoria del sistema.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Vision: el proyector del modelo base existe, pero no ha sido probado con Magpie.
- Audio: no disponible.

## Casos de uso

- Asistencia de programacion en local: el modelo puede generar y completar codigo Python en una estacion de trabajo con una GPU de 8 GB, sin enviar codigo a servicios externos. La evaluacion interna de 18/20 tareas con tests ocultos respalda este uso, siempre que se configure un presupuesto de razonamiento.
- Analisis de documentos extensos: con 262.144 tokens de contexto nativo y procesamiento de prompts medido hasta 100K tokens, es adecuado para resumir o consultar repositorios, informes largos o transcripciones sin fragmentarlos.
- Consultas iterativas sobre una misma base documental: la cache de prefijo en memoria reduce una consulta sobre un prefijo de 14.6K tokens de 10,3 s a 0,15 s, lo que lo hace apto para sesiones de preguntas y respuestas repetidas sobre el mismo corpus.
- Despliegue en equipos sin GPU de datacenter: el GGUF de 5,78 GB cabe en una RTX 3060 de 8 GB dejando margen para el runtime, la cache KV y la decodificacion especulativa, con lo que encaja en portatiles y torres de gama media.
- Prototipado e investigacion de arquitecturas hibridas: sirve como banco de pruebas para estudiar el comportamiento de Gated DeltaNet combinada con atencion, la decodificacion especulativa MTP y la gestion de cache KV en RAM del sistema frente a VRAM.
- Procesamiento por lotes con prefijos compartidos: en tareas de extraccion de informacion o clasificacion sobre plantillas largas comunes, la cache de prefijo evita reprocesar el contexto completo en cada elemento.
- Evaluacion comparativa de cuantizaciones: al estar distribuido en Q4_K_M con flags documentados para cuantizar KV a q8_0 o q4_0, permite medir el compromiso entre calidad y memoria en hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor aporta unicamente una evaluacion interna de 20 tareas de codigo Python con tests ocultos y advierte explicitamente de que no debe interpretarse como una puntuacion de benchmark estandarizada.

| Evaluacion | Modelo | Configuracion | Resultado |
|---|---|---|---|
| Suite interna de 20 tareas de codigo Python | Corvid-Magpie-9B | Greedy, limite de 6144 tokens de salida | 18/20 tareas completadas |
| Suite interna de 20 tareas de codigo Python | Qwen3.5-9B | Sin presupuesto de razonamiento | 8/20 tareas completadas |
| Suite interna de 20 tareas de codigo Python | Qwen3.5-9B | Presupuesto de razonamiento de 2048 tokens | 18/20 tareas completadas |

Mediciones de rendimiento en el sistema de referencia (RTX 3060 8 GB, Ryzen 7 5800X3D, 32 GB DDR4, SSD NVMe, con aproximadamente 1,1 GB de VRAM ocupados por otro proceso):

| Metrica | Valor |
|---|---|
| Decodificacion sin MTP | 28,8–28,9 tok/s |
| Decodificacion con MTP, longitud de borrador 2 (codigo) | 41,6 tok/s |
| Decodificacion con MTP, longitud de borrador 2 (prosa) | 37,3 tok/s |
| Decodificacion con MTP, longitud de borrador 4 (codigo) | 41,4 tok/s |
| Decodificacion con MTP, longitud de borrador 4 (prosa) | 32,9 tok/s |
| Procesamiento de prompt | 1.250–1.430 tok/s segun carga |
| Procesamiento de prompt a 64K de contexto | 57,7 s (aproximadamente 1.115 tok/s) |
| Procesamiento de prompt a 100K de contexto | 99 s (aproximadamente 1.016 tok/s) |
| Consulta con prefijo de 14.6K tokens cacheado | 0,15 s (frente a 10,3 s sin cache) |

Las mediciones de contexto largo se tomaron con Qwen3.5-9B, que comparte arquitectura y cuantizacion con Magpie.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M ocupa aproximadamente 5,78 GB. Cabe en una GPU de 8 GB manteniendo el runtime y la cache KV. El autor recomienda el flag -nkvo para mantener la cache KV en RAM del sistema y aliviar la presion de VRAM en GPUs de 8 GB.
- GPU probada: NVIDIA RTX 3060 de 8 GB, en un sistema con Ryzen 7 5800X3D (8 nucleos / 16 hilos), 32 GB de DDR4 y SSD NVMe.
- GPU recomendadas: no disponible. El autor solo documenta la RTX 3060 de 8 GB; no hay datos para RTX 4090, A100, H100 ni otras.
- Cabe en GPU de consumo: si, en la clase de 8 GB o superior probada. Para ventanas de contexto grandes, el autor recomienda cache KV en memoria del sistema en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp upstream, probado mediante llama-server con -ngl 99, -fa on, -nkvo, -ctk q8_0, -ctv q8_0, -c 65536, -b 2048, -ub 512, -t 8, --spec-type draft-mtp y --spec-draft-n-max 2. Para contextos superiores a 64K se recomienda -ctk q4_0 -ctv q4_0. Otros runtimes (vLLM, TGI, Ollama) no estan documentados en la informacion disponible.
- Latencia y throughput: decodificacion de 28,8–28,9 tok/s sin MTP y de 41,6 tok/s (codigo) o 37,3 tok/s (prosa) con MTP y longitud de borrador 2 en el sistema de referencia. El procesamiento de prompt se situa entre 1.250 y 1.430 tok/s para cargas normales.
- Nota sobre la configuracion: el autor recomienda longitud de borrador 2; la longitud 4 no aporta beneficio consistente y degrada la prosa hasta 32,9 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad | Rendimiento documentado |
|---|---|---|---|---|---|---|
| Corvid-Magpie-9B | ~9B (recuento exacto no disponible) | 262.144 tokens | Q4_K_M GGUF (5,78 GB) | Apache-2.0 | HuggingFace (fbg0204/Corvid-Magpie-9B-gguf) | 18/20 en suite interna de codigo Python; 41,6 tok/s con MTP |
| Qwen3.5-9B | ~9B (recuento exacto no disponible) | 262.144 tokens (comparte arquitectura) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | 8/20 sin presupuesto de razonamiento y 18/20 con 2048 tokens en la misma suite |
| empero-ai/Qwen3.8-9B-Distill | ~9B (recuento exacto no disponible) | no disponible | GGUF Q4_K_M (aproximadamente 5,78 GB) y proyector de vision F16 de 918 MB | Apache-2.0 segun la model card de Magpie | HuggingFace | no disponible |

No se dispone de datos que permitan comparar con alternativas de otros fabricantes (por ejemplo, Llama o Mistral de tamano similar); esa comparacion no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Estado experimental: el propio autor describe la model card como un borrador muy preliminar y advierte de que los pesos, la configuracion de arquitectura, las recomendaciones de runtime, los resultados de contexto y los datos de evaluacion pueden cambiar. No debe tratarse como una version congelada.
- Recuento de parametros sin confirmar: la informacion disponible no incluye el numero exacto de parametros, ni la configuracion final del modelo. El autor indica que esos datos deberian regenerarse a partir del GGUF finalizado.
- Cobertura de contexto no validada: aunque la ventana nativa es de 262.144 tokens, las pruebas locales solo han llegado a 100K. Los contextos de 128K, 192K y 256K no se han medido.
- Presion de memoria en contexto largo: con una GPU de 8 GB, mantener la cache KV en VRAM se vuelve cada vez mas restrictivo a medida que crece el contexto.
- Guardado y restauracion en disco no funcional: el guardado/restauracion de slots en disco de llama.cpp no se ha podido reutilizar correctamente con esta arquitectura hibrida en el runtime actual. Solo la cache de prefijo en memoria esta soportada y probada.
- Vision sin probar: el proyector de vision del modelo base no ha sido validado con Magpie.
- Evaluaciones de calidad reducidas: los resultados de 18/20 provienen de una suite interna de 20 tareas y no deben interpretarse como benchmark estandarizado. Riesgo de sobreajuste de las conclusiones a ese conjunto concreto.
- Idiomas no documentados: no hay lista de idiomas soportados ni evaluaciones multilingues.
- Riesgo de alucinacion: no se documenta de forma especifica; al ser un derivado cuantizado de un modelo destilado, mantiene los riesgos habituales de generacion de contenido plausible pero incorrecto, sin que existan metricas de fidelidad publicadas.
- Sesgos conocidos: no disponible.
- Licencia y uso comercial: los pesos se distribuyen bajo Apache-2.0, lo que en principio permite uso comercial, pero el autor remite explicitamente a la documentacion y licencia del modelo base empero-ai/Qwen3.8-9B-Distill. Conviene verificar esa licencia antes de redistribuir o desplegar en produccion.
- Trazabilidad limitada: el repositorio presenta 0 descargas y 0 likes en el momento de la consulta, y el tamano declarado del repo es de 0,0 GB, lo que sugiere que los archivos pueden no estar completamente disponibles o que las metricas aun no se han propagado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbg0204/Corvid-Magpie-9B-gguf
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- llama.cpp (runtime recomendado por el autor, citado en la model card): no se proporciona URL especifica en la informacion disponible
- Paper, blog tecnico, repositorio adicional o demo: no disponibles en la informacion proporcionada
