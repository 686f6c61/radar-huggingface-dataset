# 1bit-MONSTER/OpenELM-1.1B-Instruct-GGUF

## Resumen

Este repositorio publica una cuantizacion GGUF en Q4_K_M del modelo instructivo OpenELM-1.1B desarrollado por Apple, reempaquetada por el usuario 1bit-MONSTER. No se trata de un modelo nuevo: es una conversion de pesos del checkpoint original `apple/OpenELM-1_1B-Instruct` para poder ejecutarlo con motores de inferencia ligeros sobre CPU o GPU integrada. El modelo resultante ocupa aproximadamente 0,7 GB en disco y esta pensado para despliegues en hardware modesto.

OpenELM es una familia de modelos de lenguaje densos publicada por Apple en 2024 junto con su marco de entrenamiento e inferencia abierto. La variante de 1.1B cuenta con 1.079.891.456 parametros reales segun los pesos en safetensors del modelo base. Su principal aportacion tecnica es una asignacion no uniforme de parametros entre capas (layer-wise scaling), en lugar de repetir el mismo bloque con identico presupuesto de parametros en toda la profundidad de la red.

La relevancia de esta publicacion concreta es practica: permite probar OpenELM-1.1B-Instruct en equipos sin GPU dedicada, con el motor `1bit` sobre Vulkan, o con cualquier runtime compatible con GGUF. El autor incluye metricas de rendimiento medidas en un equipo Strix Halo. La licencia del modelo original es de investigacion y prohibe el uso comercial, lo que limita drasticamente su aplicabilidad en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (sin MoE), con layer-wise scaling |
| Parametros totales | 1.079.891.456 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion incluida en este repositorio) |
| Idiomas soportados | no disponible en los metadatos del repositorio |
| Licencia | apple-amlr (Apple Machine Learning Research License), uso exclusivo de investigacion |
| Formato de pesos | GGUF |
| Tamano del repositorio | 0,7 GB |
| Modelo base | apple/OpenELM-1_1B-Instruct |
| Fichero incluido | OpenELM-1_1B-Instruct.Q4_K_M.gguf |
| Repositorio de cuantizacion de origen | RichardErkhov/apple_-_OpenELM-1_1B-Instruct-gguf |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 1,1B de parametros. La innovacion diferencial de la familia OpenELM es el reparto no uniforme de parametros: en lugar de asignar el mismo numero de cabezas de atencion y el mismo ancho de capa FFN a cada bloque, se escalan esas dimensiones capa a capa, lo que segun Apple mejora la eficiencia por parametro frente a un transformer homogeneo del mismo tamano. No se dispone en la informacion proporcionada del detalle sobre el numero de capas, cabezas de atencion, dimension del modelo, tamano de vocabulario ni si emplea grouped query attention, RMSNorm o RoPE.

Tampoco se dispone de la composicion exacta del dataset de entrenamiento ni del numero de tokens utilizados, ni de si la variante Instruct fue ajustada con RLHF, DPO o fine-tuning supervisado sobre datos de instrucciones. Lo que si consta es que el autor del modelo original publico un marco de entrenamiento abierto, y que este repositorio no aporta informacion adicional al respecto: unicamente realiza la conversion a GGUF en Q4_K_M. La cuantizacion Q4_K_M reduce los pesos a 4 bits con escalas de tipo K-quant, lo que introduce una perdida de calidad respecto al checkpoint en precision completa que no ha sido cuantificada en la model card.

## Capacidades

- Generacion de texto e instrucciones en un modelo instructivo de 1,1B de parametros, adecuado para tareas simples de respuesta directa.
- Razonamiento basico y conversacion multi-turno, con calidad limitada por el tamano del modelo.
- Generacion de codigo sencillo y fragmentos cortos, sin garantia de correccion.
- Capacidades multilingues: no disponibles en la informacion proporcionada; el modelo base esta orientado a ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada; no consta soporte explicito.
- Modo de razonamiento extendido (thinking mode): no disponible.
- Capacidades multimodales (vision o audio): no disponibles.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Ejecucion local con el motor `1bit` sobre backend Vulkan, documentada por el autor del repositorio.

## Casos de uso

- Experimentacion academica en eficiencia de modelos: reproducir las mediciones de un transformer denso de 1,1B cuantizado a 4 bits en hardware de gama consumer, dentro del marco permitido por la licencia de investigacion.
- Prototipado educativo de pipelines de inferencia GGUF: sirve como caso minimo para validar integraciones con `1bit`, llama.cpp o bindings de Python antes de escalar a modelos mayores.
- Evaluacion comparativa de cuantizacion: medir la degradacion entre el checkpoint en precision completa y la version Q4_K_M en tareas controladas de comprension lectora y generacion corta.
- Demostraciones de despliegue en miniatura: ejecutar un asistente de texto basico en un portatil o en un mini-PC con GPU integrada AMD, usando Vulkan y sin VRAM dedicada.
- Investigacion sobre licencias y redistribucion de modelos: el repositorio es un ejemplo practico de los limites de la Apple AML Research License al reempaquetar pesos derivados.
- Filtrado o clasificacion de texto simple en entornos de laboratorio: tareas de etiquetado de fragmentos cortos donde el coste computacional por inferencia es critico.
- Generacion de texto de relleno en pruebas de integracion: usar el modelo como stub local en tests de sistemas que consumen una API compatible con endpoints, sin coste de red.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni flujos con tool calling: la licencia lo prohibe y el soporte de estas funciones es dudoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye mediciones de velocidad del motor, no de calidad:

| Metrica | Valor | Entorno |
|---|---|---|
| pp512 (prefill, 512 tokens) | 7356 tok/s | Strix Halo, Vulkan, Q4_K_M |
| tg128 (generacion, 128 tokens) | 234 tok/s | Strix Halo, Vulkan, Q4_K_M |

No se dispone de comparaciones de calidad frente a otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: en Q4_K_M los pesos ocupan aproximadamente 0,7 GB, por lo que con contexto corto basta con menos de 1 GB de VRAM o memoria unificada.
- En precision FP16 el modelo base necesitaria del orden de 2,2 GB, cantidad no incluida en este repositorio.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM (GTX 1050 Ti, RTX 3050, RTX 4090, etc.). El modelo es sobredimensionado para una RTX 4090, que lo ejecutaria limitada por latencia de kernel, no por memoria.
- Cabe holgadamente en GPU integrada: el autor reporta ejecucion en un equipo Strix Halo (APU AMD con memoria unificada) mediante Vulkan.
- Tambien es viable en CPU pura con llama.cpp, con throughput muy inferior al medido en GPU.
- Opciones de despliegue: motor `1bit` (`1bit serve -m OpenELM-1_1B-Instruct.Q4_K_M.gguf --device vulkan`), llama.cpp, llama-cpp-python, Ollama (importando el GGUF), LM Studio y cualquier runtime compatible con GGUF. vLLM soporta GGUF de forma experimental, por lo que no es la via recomendada para este fichero.
- Latencia y throughput: 7356 tok/s en prefill y 234 tok/s en generacion sobre Strix Halo con Vulkan, segun la medicion del autor. No hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OpenELM-1.1B-Instruct (este GGUF) | 1,08B | no disponible | Apple AML Research License (solo investigacion) | GGUF Q4_K_M en este repositorio |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | pesos safetensors y multiples GGUF |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | pesos safetensors y multiples GGUF |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens | Apache 2.0 | safetensors y GGUF |

Los datos de contexto y licencia de los modelos comparados son los publicos de sus respectivas model cards. La diferencia critica no es de rendimiento sino de licencia: OpenELM es el unico de la tabla que prohibe el uso comercial, mientras que Qwen2.5 y TinyLlama son Apache 2.0 y Llama 3.2 permite uso comercial bajo condiciones. No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la Apple Machine Learning Research License limita el uso a investigacion cientifica no comercial y desarrollo academico. Queda prohibido el uso comercial, el desarrollo de productos y la integracion en servicios comerciales.
- Sesgos: no disponibles en la informacion proporcionada; el modelo base se entreno sobre datos web, por lo que es esperable que herede sesgos de esa fuente, aunque no se ha documentado.
- Riesgo de alucinacion: alto, como corresponde a un modelo de 1,1B de parametros sin mecanismos de verificacion; no debe usarse como fuente de hechos.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto soportada por esta conversion; no asumas ventanas largas.
- Limitaciones de idioma: los idiomas soportados no estan documentados en el repositorio; el modelo base esta orientado al ingles y su rendimiento en castellano es dudoso.
- Calidad de cuantizacion: la conversion Q4_K_M introduce perdida adicional de precision respecto al checkpoint original, no medida ni documentada por el autor.
- Trazabilidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye informes de validacion de la conversion (por ejemplo, perplejidad comparada con el modelo base).
- Procedencia de la cuantizacion: la model card atribuye la conversion a `RichardErkhov/apple_-_OpenELM-1_1B-Instruct-gguf`, pero no detalla si el fichero Q4_K_M es una reconversion propia o una copia del repositorio citado.
- Fechas incoherentes: los metadatos indican fecha de creacion y actualizacion en septiembre de 2026, lo que puede afectar a la reproducibilidad de la referencia temporal.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/1bit-MONSTER/OpenELM-1.1B-Instruct-GGUF
- Modelo base: https://huggingface.co/apple/OpenELM-1_1B-Instruct
- Repositorio de cuantizacion citado: https://huggingface.co/RichardErkhov/apple_-_OpenELM-1_1B-Instruct-gguf
- Motor de inferencia del autor: https://github.com/1bit-MONSTER/engine
- Licencia del modelo (Apple Machine Learning Research License): fichero LICENSE del repositorio de HuggingFace
