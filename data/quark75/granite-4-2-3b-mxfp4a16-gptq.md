# quark75/granite-4.2-3b-MXFP4A16-GPTQ

## Resumen

`quark75/granite-4.2-3b-MXFP4A16-GPTQ` es un checkpoint cuantizado publicado en HuggingFace por el usuario quark75. Por la convencion de nomenclatura del repositorio, se trata de una version de 4 bits del modelo IBM Granite 4.2 de 3.000 millones de parametros, cuantizada mediante GPTQ en el formato MXFP4A16 (pesos en MXFP4 con escalas de bloque y activaciones en 16 bits). El repositorio se creo el 24 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, por lo que no existe validacion de la comunidad ni resultados publicados.

La relevancia de esta publicacion es practica: reducir un modelo de 3B a poco mas de 2 GB de pesos permite ejecutarlo en GPU de consumo modesto, portatiles con GPU integrada o incluso en CPU, y desplegarlo en entornos con VRAM limitada. Ahora bien, la model card publicada es practicamente vacia (solo contiene la declaracion de licencia Apache-2.0), de modo que no hay informacion verificable sobre el dataset de calibracion, la perdida de calidad respecto al modelo original, la longitud de contexto soportada ni los idiomas cubiertos.

Se trata, por tanto, de un artefacto derivado y no de un modelo entrenado desde cero: cualquier evaluacion rigurosa debe remitirse al modelo base Granite 4.2 3B para conocer arquitectura, contexto y capacidades reales, y tratar esta cuantizacion como una variante de eficiencia cuyo impacto en precision no ha sido documentado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del modelo base IBM Granite 4.2 3B; no documentada en este repositorio) |
| Parametros totales | 3.000 millones (inferido del nombre del repositorio; no confirmado en la model card) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4A16 con GPTQ (pesos MXFP4, activaciones de 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible en la informacion proporcionada (GPTQ suele distribuirse en safetensors; conviene verificar el listado de archivos antes de descargar) |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento propio: es el resultado de aplicar cuantizacion post-entrenamiento (PTQ) sobre un modelo ya existente. GPTQ es un metodo de cuantizacion de una pasada que optimiza los pesos capa por capa minimizando el error cuadratico de reconstruccion de las salidas, usando un conjunto de calibracion. El sufijo MXFP4A16 indica que los pesos se almacenan en MXFP4, un formato de microscaling definido por el consorcio OCP en el que cada bloque (tipicamente de 32 elementos) comparte una escala en formato E8M0 y cada valor individual usa 4 bits con formato E2M1; las activaciones se mantienen en 16 bits. Esta combinacion busca preservar mejor la precision que una cuantizacion de 4 bits con escalas por canal, a costa de un soporte de runtime menos extendido.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni sobre innovaciones tecnicas del modelo base: todo ello pertenece a la ficha de IBM Granite 4.2 3B, no a este repositorio. Tampoco se documenta el dataset de calibracion empleado por quark75, un dato critico porque determina en que dominios la cuantizacion degrada menos. En consecuencia, no es posible afirmar si la variante MXFP4A16 conserva la calidad del original en tareas de codigo, matematicas o multilingues.

## Capacidades

- Generacion de texto y conversacion multi-turno: capacidad heredada del modelo base, no verificada en esta cuantizacion.
- Razonamiento, matematicas y generacion de codigo: previsiblemente presentes si el modelo base los cubre, pero sin documentacion ni evaluacion en este repositorio.
- Tool calling y function calling: no disponible (no se confirma en la informacion proporcionada).
- Comportamiento agentico y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara ningun idioma).
- Capacidades especiales (modo pensamiento, vision, audio): no disponible.
- Nota importante: cualquier capacidad que no se valide empiricamente tras la cuantizacion debe considerarse no confirmada; la cuantizacion de 4 bits puede degradar de forma desigual tareas de razonamiento largo, generacion de codigo y seguimiento de instrucciones estrictas.

## Casos de uso

- Inferencia local en portatil con GPU de consumo: con pesos de aproximadamente 2 GB, el modelo cabe en GPUs de 6-8 GB de VRAM, lo que permite ejecutar un asistente de texto sin conexion y sin coste de API.
- Prototipado rapido de aplicaciones de chat: al ser un modelo de 3B, los tiempos de carga y la memoria necesaria son reducidos, lo que agiliza iteraciones de prompt engineering antes de escalar a un modelo mayor.
- Clasificacion y etiquetado de texto a granel: tareas como categorizacion de tickets, deteccion de intencion o extraccion de entidades se pueden ejecutar en lote sobre GPU unica con buen throughput.
- Generacion aumentada por recuperacion (RAG) en entornos con recursos limitados: el modelo puede actuar como generador final sobre fragmentos recuperados, siempre que se verifique su ventana de contexto real en el modelo base.
- Asistentes embebidos en herramientas de desarrollo: autocompletado de fragmentos, generacion de tests unitarios o explicacion de funciones, con la advertencia de que la calidad en codigo tras la cuantizacion no esta documentada.
- Experimentacion academica sobre cuantizacion: el repositorio sirve como caso de estudio para medir el impacto de MXFP4A16 frente a otros esquemas (GPTQ INT4 clasico, AWQ, GGUF Q4_K_M) en tareas concretas.
- Servicio de bajo coste con requisitos de privacidad: al poder ejecutarse on-premise, resulta adecuado para dominios donde los datos no pueden salir de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ningun otro conjunto, y tampoco hay comparaciones con el modelo base en precision completa o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2,5-4 GB considerando aproximadamente 2 GB de pesos, cache KV y buffers de activacion. Cifra estimada a partir del tamano de parametros y del esquema de cuantizacion; no confirmada por el autor.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM. Para servicio con concurrencia, una RTX 4090, L40S, A100 o H100 ofreceran margen sobrado y permiten agrupar peticiones por lotes.
- GPU de consumo compatibles: si, cabe en GTX 1660 6 GB, RTX 3060 12 GB, RTX 4060, RTX 4070 y superiores. Tambien puede ejecutarse en CPU con suficiente RAM del sistema, a costa de menor velocidad.
- Opciones de despliegue: vLLM, TGI, transformers con AutoGPTQ o GPTQModel son los caminos habituales para checkpoints GPTQ. llama.cpp y Ollama trabajan con GGUF, por lo que no son aplicables directamente a este formato salvo conversion previa. El soporte efectivo de MXFP4A16 GPTQ varia segun la version de cada runtime y debe verificarse antes de integrarlo en produccion.
- Latencia y throughput estimados: no disponibles. Como referencia orientativa no verificada, un modelo de 3B en 4 bits suele superar los 100 tokens por segundo en una GPU moderna de gama alta en generacion individual, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quark75/granite-4.2-3b-MXFP4A16-GPTQ | 3B (inferido) | no disponible | MXFP4A16 + GPTQ | apache-2.0 | Publicado, 0 descargas |
| IBM Granite 4.2 3B (modelo base) | no disponible en la informacion proporcionada | no disponible | BF16/FP16 | no disponible en la informacion proporcionada | Referencia para comparar calidad |
| Otras cuantizaciones GPTQ INT4 del mismo modelo base | 3B (inferido) | no disponible | GPTQ INT4 (escalas por canal) | dependiente del publicador | No disponible |
| Versiones GGUF (por ejemplo Q4_K_M) del mismo modelo base | 3B (inferido) | no disponible | 4 bits tipo k-quant | dependiente del publicador | No disponible |

No se dispone de datos de rendimiento que permitan comparar esta cuantizacion con alternativas de la misma categoria (Llama 3.2 3B, Qwen2.5 3B u otros modelos de 3B cuantizados a 4 bits), ni con la propia familia Granite en otras precisiones.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre dataset de calibracion, metricas de degradacion, contexto ni idiomas, lo que impide garantizar el comportamiento en produccion.
- Riesgo de degradacion por cuantizacion: los esquemas de 4 bits pueden perder precision de forma desigual, especialmente en razonamiento multi-paso, matematicas y generacion de codigo. Sin evaluacion publicada no es posible cuantificar esa perdida.
- Soporte de runtime incierto: MXFP4A16 con GPTQ no esta soportado por todos los motores de inferencia; conviene validar la carga del checkpoint en la version concreta de vLLM, TGI o transformers antes de comprometerse con este formato.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, y potencialmente agravado por la cuantizacion. No debe usarse sin verificacion en dominios sensibles (medico, legal, financiero).
- Sesgos: no evaluados ni documentados en el repositorio. Se heredan del modelo base y de su corpus de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles; no se puede asumir soporte multilingue ni una ventana de contexto concreta sin consultar la ficha de Granite 4.2 3B.
- Licencia: el repositorio declara apache-2.0, lo que en principio permite uso comercial. No obstante, al ser un artefacto derivado, hay que confirmar que la licencia del modelo base es compatible y que se cumplen sus condiciones de atribucion.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes implican que no ha habido revision independiente del checkpoint; trátese como material no verificado.
- Fecha de creacion futura respecto a modelos conocidos: la marca temporal del repositorio (2026) sugiere que el modelo base pertenece a una generacion posterior a la documentacion disponible publicamente, lo que refuerza la necesidad de consultar fuentes oficiales de IBM.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/quark75/granite-4.2-3b-MXFP4A16-GPTQ
- Model card del autor: no disponible (solo contiene la declaracion de licencia Apache-2.0)
- Paper del modelo base Granite 4.2 3B: no disponible en la informacion proporcionada
- Repositorio del modelo base en HuggingFace: no disponible en la informacion proporcionada
- Documentacion de GPTQ: no disponible en la informacion proporcionada
- Especificacion de formatos MX (OCP Microscaling Formats): no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponible
