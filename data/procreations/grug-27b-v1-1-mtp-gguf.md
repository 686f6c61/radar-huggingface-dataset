# ProCreations/grug-27b-v1.1-mtp-gguf

## Resumen

El modelo `ProCreations/grug-27b-v1.1-mtp-gguf` es una versión cuantizada en formato GGUF del modelo `grug-27b-v1.1-mtp`, desarrollado por ProCreations. Su particularidad es que conserva el "draft head" (cabeza de borrador) del mecanismo de predicción multi-token (MTP), lo que permite a motores de inferencia compatibles realizar decodificación especulativa y acelerar la generación de texto sin modificar la salida final. Esta build está pensada para entornos donde la velocidad de inferencia es crítica y el runtime soporta tensores `nextn`.

El modelo base `grug-27b` es un LLM de 27.320 millones de parámetros, con licencia Apache 2.0 y entrenado principalmente en inglés. La versión GGUF aquí descrita incluye cuantizaciones Q8_0, Q6_K y Q4_K_M, además de un proyector multimodal (`mmproj`) que sugiere capacidades de visión. Su relevancia radica en ofrecer un equilibrio entre tamaño (27B) y velocidad gracias a la decodificación especulativa, siendo adecuado para despliegue en hardware de consumo o servidores con GPUs de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, no confirmado) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M (ademas de mmproj-f16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con tensores adicionales `blk.64.nextn.*` para MTP) |

## Arquitectura y entrenamiento

La arquitectura interna del modelo base no se detalla en la informacion disponible. Se sabe que es un modelo de 27,3 mil millones de parametros y que incorpora un modulo de prediccion multi-token (MTP) que actua como borrador para decodificacion especulativa. El "draft head" fue reentrenado sobre las salidas del propio modelo grug para mejorar la tasa de acuerdo con el verificador: el acuerdo top-1 pasa del 90,04% (cabeza nativa de Qwen3.8) al 95,37% con el reentrenamiento. Esto implica que, en promedio, 1 de cada 21 tokens generados por el borrador es rechazado (frente a 1 de cada 10 con la cabeza original), lo que se traduce en una mayor velocidad efectiva cuando el motor de inferencia utiliza estos tensores.

No se han publicado datos sobre el dataset de entrenamiento, el numero total de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. La informacion disponible solo menciona que el modelo base es `ProCreations/grug-27b-v1.1-mtp` y que la version GGUF aqui descrita mantiene los pesos identicos al modelo original, anadiendo unicamente el overhead del draft head.

## Capacidades

- Generacion de texto en ingles: el modelo es capaz de producir texto coherente y contextualizado, como cualquier LLM de su tamano.
- Razonamiento: la model card recomienda usar un "medium reasoning effort", lo que sugiere que el modelo tiene un modo de razonamiento configurable (posiblemente similar a modos de pensamiento extendido).
- Decodificacion especulativa: gracias al draft head MTP, puede acelerar la generacion cuando el runtime soporta tensores `nextn` (por ejemplo, llama.cpp con opciones de speculative decoding).
- Vision multimodal: el archivo `mmproj-grug-27b-v1.1-mtp-f16.gguf` (0,9 GB) indica que el modelo incluye un proyector multimodal para procesar imagenes, aunque no se especifican las tareas exactas soportadas.
- Compatibilidad con llama.cpp: el formato GGUF permite su ejecucion en herramientas como llama-cli, llama-server, Ollama, etc.

## Casos de uso

- Ejecucion local en hardware de consumo: gracias a las cuantizaciones Q4_K_M (16,8 GB) y Q6_K (22,4 GB), el modelo puede ejecutarse en GPUs de gama alta para consumidores (RTX 3090/4090 con 24 GB) o incluso en CPU con suficiente RAM. Es util para desarrolladores que necesitan un LLM potente sin depender de APIs externas.
- Generacion de codigo en entornos offline: el modelo puede asistir en la escritura de funciones, depuracion y explicacion de codigo, como se muestra en el ejemplo de la model card ("write a function that flattens a nested list"). Su licencia Apache 2.0 permite integracion en herramientas propietarias.
- Asistente conversacional con baja latencia: al usar decodificacion especulativa, la velocidad de respuesta mejora notablemente, lo que lo hace adecuado para chatbots interactivos donde la fluidez es importante.
- Prototipado rapido de aplicaciones de IA: al ser un modelo abierto y con formato GGUF, se puede integrar facilmente en pipelines de desarrollo con llama.cpp o vLLM (si se convierte a otro formato), permitiendo iterar sin costes de API.
- Analisis de documentos con soporte visual: el proyector multimodal (`mmproj`) abre la posibilidad de procesar imagenes junto con texto, aunque no se detallan las capacidades exactas. Podria usarse para descripcion de imagenes o extraccion de informacion visual.
- Investigacion en decodificacion especulativa: este modelo es un caso practico de como reentrenar un draft head mejora la tasa de aceptacion. Puede servir como referencia para experimentos en optimizacion de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona la tasa de acuerdo top-1 entre el draft head y el verificador (95,37%), pero no proporciona metricas como MMLU, HumanEval o GSM8K. Tampoco se ofrecen comparativas con otros modelos en terminos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q4_K_M: ~16,8 GB (cabe en RTX 3090, RTX 4090, A6000, etc.)
  - Q6_K: ~22,4 GB (requiere GPU con 24 GB o mas)
  - Q8_0: ~29,0 GB (requiere GPU con 32 GB o mas, o multiples GPUs)
  - FP16 (sin cuantizar): ~54,8 GB segun LLM Explorer (requiere A100 80GB o similar)
- GPUs recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M, A100 40/80 GB para Q8_0 o FP16.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, o cualquier runtime compatible con GGUF. Para uso en produccion con mayor throughput, se podria convertir a safetensors y usar vLLM o TGI.
- Latencia y throughput: no se proporcionan datos concretos. La decodificacion especulativa puede reducir la latencia entre un 20-40% en escenarios favorables, pero depende del hardware y del patron de generacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de 27B. El unico dato externo es que el draft head nativo proviene de Qwen3.8 (posiblemente Qwen3-8B), pero no se detallan comparaciones de rendimiento general. Se recomienda consultar el LLM Explorer para ver metricas agregadas del modelo base `grug-27b`, aunque no se han incluido en esta ficha por falta de datos verificables.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta ingles de forma nativa; el uso en otros idiomas puede degradar la calidad.
- Longitud de contexto desconocida: no se especifica el tamano de la ventana de contexto, lo que limita su uso en tareas que requieran documentos largos.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido falso o inventado, especialmente en dominios especializados.
- Dependencia del runtime para MTP: el draft head solo aporta beneficio si el motor de inferencia utiliza los tensores `nextn`. Si se ignora, se carga un overhead de ~0,3 GB sin mejora de velocidad.
- Sin benchmarks publicados: no hay metricas objetivas de calidad, lo que dificulta evaluar su rendimiento frente a alternativas.
- Fecha de creacion inusual: el repo esta fechado en agosto de 2026, lo que podria indicar un error de metadata o un lanzamiento futuro (no verificable).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ProCreations/grug-27b-v1.1-mtp-gguf
- Modelo base (safetensors): https://huggingface.co/ProCreations/grug-27b-v1.1-mtp
- Modelo GGUF sin MTP (recomendado si no se usa decodificacion especulativa): https://huggingface.co/ProCreations/grug-27b-v1.1-gguf
- Modelo base original: https://huggingface.co/ProCreations/grug-27b
- LLM Explorer (metricas agregadas): https://llm-explorer.com/model/ProCreations%2Fgrug-27b,4I3COxIuitPNrvIAJrjQMi
