# eaddario/IQ2_K-IQ6_K-Test-Models

## Resumen

El repositorio `eaddario/IQ2_K-IQ6_K-Test-Models` es una colección de pesos en formato GGUF publicada por el usuario eaddario en HuggingFace. Por el nombre, los tags y el volumen del repositorio (119,1 GB), se trata de un conjunto de cuantizaciones de un mismo modelo base de aproximadamente 9 000 millones de parámetros, con variantes que abarcarían desde esquemas agresivos tipo IQ2_K hasta esquemas de mayor precisión tipo IQ6_K. No hay model card: el README solo contiene la declaración de licencia apache-2.0, por lo que no se documenta el modelo base, los datos de entrenamiento ni las métricas de calidad.

El interés de este repositorio es fundamentalmente práctico y experimental: permite comparar el comportamiento de distintas cuantizaciones del mismo modelo sobre el mismo conjunto de pesos, algo habitual cuando se quiere medir el impacto del ruido de cuantización en tareas de conversación. El tag `conversational` y `endpoints_compatible` sugieren que los ficheros están pensados para generación de texto conversacional y para su despliegue en Inference Endpoints de HuggingFace.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, y fue creado el 2026-10-16 según los metadatos de la plataforma. Es, por tanto, un artefacto de prueba sin validación externa conocida, y no debe tratarse como un modelo listo para producción sin una evaluación previa propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo distribuye pesos en formato GGUF; no se especifica la arquitectura del modelo base) |
| Parametros totales | 8 999 178 240 (aproximadamente 9,0 mil millones, dato de safetensors declarado en el repositorio) |
| Parametros activos | no aplica / no disponible (no hay confirmación de que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el nombre del repositorio indica un rango entre IQ2_K e IQ6_K; la lista exacta de ficheros GGUF no esta disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Autor | eaddario |
| Tamano del repositorio | 119,1 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-16 |
| Ultima actualizacion | 2026-10-16 |
| Tags | gguf, license:apache-2.0, endpoints_compatible, region:us, conversational |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base ni sobre su proceso de entrenamiento. El repositorio no incluye model card tecnica, configuracion de transformers, tokenizer ni referencias a papers o recetas de entrenamiento. Lo unico verificable es el recuento de parametros del fichero safetensors (8 999 178 240) y el formato de distribucion.

En el plano del formato, GGUF es el contenedor de pesos de llama.cpp, y los nombres IQ2_K, IQ3_K, IQ4_K, IQ5_K e IQ6_K corresponden a esquemas de cuantizacion por bloques con escalas y minimos cuantizados (los prefijos IQ implican cuantizacion con importancia, normalmente generada a partir de un fichero de matriz de importancia o imatrix). Las variantes IQ2_K e IQ3_K son esquemas de muy baja precision (del orden de 2 a 3,5 bits por peso) que reducen drasticamente el tamano del modelo a costa de un aumento del error de reconstruccion, mientras que IQ6_K se situa en el extremo opuesto, con una perdida de calidad mucho menor. No se dispone de informacion sobre si estas cuantizaciones se generaron con imatrix, que dataset de calibracion se uso ni que parametros de llama.cpp se aplicaron.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica que los pesos estan orientados a dialogos de tipo chat, aunque no se especifica la plantilla de prompt ni el tokenizer exacto.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que los ficheros estan preparados para desplegarse en la infraestructura de Inference Endpoints de HuggingFace.
- Inferencia en CPU y GPU mediante llama.cpp y runtimes derivados, al estar en formato GGUF.
- Capacidades de razonamiento, codigo, matematicas, vision, audio y tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o modos especiales de razonamiento: no disponible.

## Casos de uso

- Evaluacion comparativa de cuantizaciones: el repositorio agrupa varias decenas de gigabytes de pesos del mismo modelo con distintos niveles de compresion, lo que permite medir tareas de perplejidad, exactitud en respuestas y estabilidad de generacion a IQ2_K, IQ3_K, IQ4_K, IQ5_K e IQ6_K con el mismo prompt set y aislar el efecto de la cuantizacion.
- Pruebas de regresion antes de publicar pesos cuantizados: un equipo que vaya a publicar su propio GGUF puede usar este repositorio como referencia de tamanos y de comportamiento esperado en modelos de aproximadamente 9 000 millones de parametros.
- Inferencia local en equipos con poca VRAM: las variantes de 2 y 3 bits ocupan pocos gigabytes y permiten ejecutar un modelo de 9 000 millones de parametros en GPUs de gama media o incluso en CPU con RAM suficiente, a costa de degradar la calidad.
- Despliegue de un asistente conversacional interno: con una variante IQ4_K o superior y un runtime como llama.cpp u Ollama, se puede levantar un servicio de chat autoalojado sin dependencia de APIs externas, siempre que se valide antes la calidad de la cuantizacion elegida.
- Prototipado rapido en portatiles: las variantes de menor precision permiten iterar sobre prompts y flujos de aplicacion sin necesidad de hardware dedicado.
- Comparacion de latencia y throughput entre niveles de cuantizacion: util para decidir el punto de compromiso entre velocidad de generacion (tokens por segundo) y calidad en un servicio con restricciones de latencia.
- Benchmarking de kernels de cuantizacion: los ficheros sirven para validar que las rutas de decodificacion de llama.cpp u otros runtimes producen salidas coherentes con los esquemas IQ declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones calculadas a partir del recuento de parametros declarado (8 999 178 240) y de los ratios habituales de bits por peso de los esquemas de cuantizacion de llama.cpp. No estan confirmadas por el autor del repositorio, que no publica tamanos por fichero.

| Cuantizacion | Tamano aproximado de pesos | VRAM estimada con contexto moderado |
|---|---|---|
| IQ2_K | 2,9 - 3,1 GB | 5 - 7 GB |
| IQ3_K | 3,8 - 4,1 GB | 6 - 8 GB |
| IQ4_K | 5,0 - 5,3 GB | 7 - 9 GB |
| IQ5_K | 6,2 - 6,5 GB | 8 - 10 GB |
| IQ6_K / Q6_K | 7,3 - 7,6 GB | 9 - 12 GB |
| Q8_0 (referencia) | 9,5 - 9,8 GB | 11 - 14 GB |

- GPUs consumer: las variantes IQ2_K e IQ3_K caben con holgura en una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4070. Las variantes IQ4_K e IQ5_K son viables en 8-12 GB de VRAM dependiendo de la longitud de contexto configurada. La variante IQ6_K es comoda en una RTX 4090 de 24 GB o en una RTX 4080 de 16 GB.
- GPUs de centro de datos: A100 40 GB, A100 80 GB, H100 y L40S pueden alojar cualquiera de las variantes con contexto amplio y lote grande, con margen para cache KV.
- CPU y sistemas mixtos: al ser GGUF, el modelo puede ejecutarse total o parcialmente en CPU con RAM suficiente (se recomienda al menos el tamano de los pesos mas la cache KV y el overhead del runtime). El offload parcial de capas a GPU acelera la generacion de forma notable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, KoboldCpp, text-generation-webui, y el soporte de GGUF de vLLM o TGI con limitaciones. El tag `endpoints_compatible` indica compatibilidad declarada con Inference Endpoints de HuggingFace.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia de primer token para ninguna de las variantes.

## Comparativa con modelos similares

No se puede establecer una comparativa directa fiable porque no se ha identificado el modelo base sobre el que se han generado estas cuantizaciones. A modo de referencia de categoria (modelos conversacionales de entre 8 000 y 9 500 millones de parametros distribuidos en GGUF), se incluye la tabla siguiente con datos publicos de cada proyecto, que no han sido verificados en esta ficha y que no implican equivalencia funcional con el repositorio analizado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad en GGUF |
|---|---|---|---|---|
| eaddario/IQ2_K-IQ6_K-Test-Models | ~9,0 mil millones | no disponible | apache-2.0 | si (varias cuantizaciones) |
| Llama 3.1 8B Instruct | ~8,0 mil millones | 128 000 tokens | Llama 3.1 Community License | si, ampliamente |
| Qwen3 8B | ~8,2 mil millones | 32 768 tokens nativos | Apache 2.0 | si, ampliamente |
| Gemma 2 9B | ~9,2 mil millones | 8 192 tokens | Gemma Terms of Use | si, ampliamente |

Diferencias relevantes a efectos practicos: los tres modelos de referencia tienen model cards completas, evaluaciones publicadas y comunidades amplias, mientras que el repositorio analizado carece de documentacion tecnica y de validacion externa. La licencia apache-2.0 declarada es mas permisiva que la de Llama 3.1 o Gemma 2, pero su aplicabilidad depende de la licencia del modelo base, que no se especifica.

## Limitaciones y advertencias

- Ausencia total de model card: no se documenta el modelo base, el tokenizer, la plantilla de prompt, los idiomas ni el proceso de entrenamiento, lo que impide reproducir o auditar el artefacto.
- Modelo base no identificado: sin saber de que pesos proviene la cuantizacion, no se puede verificar la licencia real de los pesos derivados. Declarar apache-2.0 no garantiza que el modelo subyacente lo sea, lo que constituye un riesgo legal para uso comercial.
- Cuantizaciones de 2 y 3 bits: los esquemas IQ2_K e IQ3_K introducen un error de reconstruccion alto y suelen producir degradacion medible en razonamiento, matematicas y seguimiento de instrucciones, ademas de mayor tasa de repeticiones y de alucinacion. No son adecuadas para tareas que exijan precision.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones de veracidad ni de tasa de alucinacion para ninguna variante.
- Contexto e idiomas desconocidos: se desconoce la ventana de contexto real y la cobertura idiomatica, por lo que no se puede garantizar un comportamiento correcto en castellano ni en conversaciones multi-turno largas.
- Repositorio sin traccion: 0 descargas y 0 likes implican que no ha pasado por revision de la comunidad y que no existen informes independientes de fallos.
- Uso previsto aparente de prueba: el propio nombre del repositorio lo etiqueta como test models, de modo que no deberia emplearse como base de un servicio en produccion sin una evaluacion exhaustiva previa.
- Sesgos: no disponible. No hay informacion sobre la composicion del dataset de entrenamiento ni sobre analisis de sesgo.
- Sin garantias de compatibilidad: al no indicarse la plantilla de prompt ni el tokenizer, es probable que el chat funcione de forma suboptima si se aplica una plantilla incorrecta.

## Enlaces

- HuggingFace: https://huggingface.co/eaddario/IQ2_K-IQ6_K-Test-Models
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion disponible.
