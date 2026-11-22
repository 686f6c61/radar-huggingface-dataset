# labadain/Labadain-Gemma-4-E3B-it-Tetun

## Resumen

Labadain-Gemma-4-E3B-it-Tetun es un ajuste fino conversacional del modelo Gemma 4 E2B-it de Google (distribuido por Unsloth) especializado en tetun, lengua oficial de Timor-Leste. Lo desarrolla el proyecto Labadain mediante QLoRA sobre 32.197 conversaciones en tetun (unos 26 millones de tokens) que cubren noticias, salud, educacion, lengua y conversacion general. El resultado es un asistente capaz de mantener dialogos multi-turno en tetun con una calidad muy superior a la del modelo base, que apenas tiene cobertura de esta lengua de bajos recursos.

El modelo conserva la arquitectura multimodal de Gemma 4 E2B (codificadores de vision y audio intactos), aunque solo se ha entrenado la torre de lenguaje. Almacena 5.123 millones de parametros con unos 2.000 millones efectivos, gracias al diseno de parametros condicionales de la familia E2B. Se distribuye en bfloat16 con licencia Apache 2.0 y dispone de versiones GGUF y Ollama para despliegue local.

Su relevancia radica en dos factores: por un lado, demuestra que un ajuste fino relativamente modesto (LoRA de rango 16 sobre base cuantizada a 4 bits) puede dotar a un modelo generalista de competencia conversacional en una lengua con escasisimos recursos; por otro, publica pesos abiertos y formatos de despliegue accesibles, lo que facilita su uso en contextos con hardware limitado, habituales en Timor-Leste y en proyectos de preservacion linguistica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de Gemma 4 (familia E2B, parametros condicionales), torre de lenguaje ajustada |
| Parametros totales | 5.123.178.051 (5,1 B almacenados; ~2 B efectivos) |
| Parametros activos | ~2 B efectivos (arquitectura E2B de Gemma 4) |
| Longitud de contexto | 4.096 tokens en entrenamiento; la arquitectura base soporta 128K |
| Tipos de cuantizacion | bfloat16 (pesos publicados), 4-bit NF4 via bitsandbytes, GGUF Q4_K_M |
| Idiomas soportados | Tetun (`tet`, `tdt`); sin entrenamiento especifico en otros idiomas |
| Licencia | Apache 2.0, sujeta a la licencia Gemma 4 de Google |
| Formato de pesos | safetensors (bfloat16), GGUF, paquete Ollama |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-4-E2B-it`, la distribucion de Unsloth del Gemma 4 E2B-it de Google. La familia E2B emplea parametros condicionales: almacena 5,1 B de parametros pero solo activa aproximadamente 2 B por token, lo que reduce el coste de inferencia sin renunciar a la capacidad del modelo completo. La torre de lenguaje se ajusto con QLoRA (rango 16, base cuantizada a 4 bits) y los adaptadores se fusionaron posteriormente en los pesos bfloat16, de modo que el repositorio contiene un modelo denso listo para usar con Transformers. Los codificadores de vision y audio no se modificaron.

El corpus de entrenamiento consta de 32.197 conversaciones en tetun (26 millones de tokens, 55.105 intercambios pregunta-respuesta), compiladas por Labadain a partir de recursos conversacionales y de QA en tetun, incluyendo material traducido automaticamente. La distribucion por dominio es: 20.132 conversaciones generales, 9.649 de salud, 1.951 de noticias y 465 de educacion y lengua. El 36,6 % de las conversaciones (11.774) son multi-turno, con hasta 33 intercambios. El 90 % se destino a entrenamiento y el 10 % restante se dividio a partes iguales entre validacion y test. No se emplearon trazas de razonamiento, por lo que el modo thinking del modelo base no resulta adecuado.

## Capacidades

- Generacion de texto conversacional en tetun con registro natural y cobertura de temas cotidianos.
- Dialogo multi-turno: mantiene el hilo en conversaciones de varias rondas (hasta 33 intercambios en entrenamiento).
- Dominio de salud: respuestas sobre prevencion, sintomas y educacion sanitaria en tetun.
- Dominio de actualidad: resumenes y comentarios sobre noticias a partir del material de entrenamiento.
- Dominio educativo y linguistico: explicaciones sobre la lengua tetun y contenidos escolares.
- Capacidad multimodal heredada del modelo base (vision y audio), aunque no entrenada ni evaluada en tetun.
- Plantilla de chat compatible con `apply_chat_template` de Transformers, con `enable_thinking=False` por defecto.
- No se ha entrenado para tool calling, function calling ni razonamiento multi-paso explicito.

## Casos de uso

- Asistente conversacional en tetun para administraciones publicas de Timor-Leste: atencion de consultas ciudadanas sobre tramites y servicios, aprovechando el dominio general y la capacidad multi-turno.
- Educacion sanitaria comunitaria: respuestas en tetun sobre prevencion de enfermedades y primeros auxilios, apoyandose en las 9.649 conversaciones de salud del corpus.
- Preservacion linguistica: generacion de materiales de lectura y ejercicios en tetun para escuelas y programas de alfabetizacion.
- Atencion al cliente local: integracion en chats de empresas timorenses que necesiten responder en tetun sin depender de traduccion automatica desde el ingles.
- Resumen y explicacion de noticias: sintesis de articulos de actualidad en tetun para boletines o programas de radio.
- Despliegue en hardware modesto: la version GGUF Q4_K_M y el paquete Ollama permiten ejecutar el modelo en portatiles o equipos sin GPU dedicada, util en entornos con infraestructura limitada.
- Base para nuevos ajustes: punto de partida para fine-tuning en otras lenguas de bajos recursos de la region, dado que los pesos y la receta (QLoRA + Unsloth) son abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en bfloat16: aproximadamente 10 GB para los pesos completos, mas memoria para el contexto y las activaciones.
- VRAM en 4-bit (NF4): notablemente inferior a 10 GB, con una perdida pequena de calidad segun el autor; adecuado para GPU de 8 GB.
- GGUF Q4_K_M: ejecutable en CPU mediante llama.cpp u Ollama, sin necesidad de GPU.
- GPU recomendadas: A100 o H100 para servicio de alta concurrencia; RTX 4090 o RTX 3090 para bfloat16 en una sola tarjeta; RTX 4060 Ti de 16 GB o RTX 4070 de 12 GB para 4-bit.
- Cabe en GPU de consumo con cuantizacion 4-bit o en CPU con GGUF.
- Despliegue: Transformers 5.5.0 o superior con accelerate y bitsandbytes, Unsloth (`FastModel`), llama.cpp, Ollama (`labadainofficial/labadain-gemma4`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| Labadain-Gemma-4-E3B-it-Tetun | 5,1 B (2 B efectivos) | 4.096 en entrenamiento (128K arquitectura) | tetun | Apache 2.0 | safetensors, GGUF, Ollama |
| unsloth/gemma-4-E2B-it (base) | 5,1 B (2 B efectivos) | 128K | multilingue general | Gemma 4 | safetensors |
| Gemma 3 4B-it | ~4 B | 128K | multilingue general | Gemma | safetensors, GGUF |
| Qwen2.5 3B-Instruct | ~3 B | 32K | multilingue general | Apache 2.0 | safetensors, GGUF |

La comparativa con modelos generalistas es orientativa: ninguno de ellos ofrece cobertura especifica de tetun comparable, y no se dispone de resultados de benchmarks que permitan una comparacion cuantitativa con este ajuste.

## Limitaciones y advertencias

- Cobertura limitada a tetun: no se ha entrenado ni evaluado en otros idiomas, por lo que las respuestas en castellano, ingles u otras lenguas pueden ser deficientes.
- Contexto efectivo de 4.096 tokens: aunque la arquitectura soporta 128K, el ajuste se realizo con conversaciones de hasta 4.096 tokens y no hay garantia de buen comportamiento mas alla.
- Modo thinking no soportado: el modelo no fue entrenado con trazas de razonamiento; activar `enable_thinking=True` puede degradar la calidad.
- Datos parcialmente traducidos automaticamente: parte del corpus de entrenamiento proviene de traduccion automatica, lo que puede introducir artefactos y sesgos de traduccion.
- Vision y audio no adaptados: los codificadores multimodales son los del modelo base y no se han entrenado ni probado con entradas en tetun.
- Riesgo de alucinacion en dominios especializados, especialmente salud y noticias, donde el modelo puede generar informacion desactualizada o incorrecta.
- Sesgos desconocidos: no se documenta una evaluacion de sesgos; el corpus refleja las fuentes utilizadas.
- Sin soporte documentado de tool calling ni de razonamiento multi-paso.
- Licencia: Apache 2.0 sujeto a la licencia Gemma 4 de Google; conviene revisar las condiciones de uso comercial de dicha licencia antes de desplegar en produccion.
- Sin resultados de benchmarks publicados: el rendimiento real debe validarse con evaluaciones propias antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/labadain/Labadain-Gemma-4-E3B-it-Tetun
- Version GGUF: https://huggingface.co/labadain/Labadain-Gemma-4-E2B-it-Tetun-GGUF
- Paquete Ollama: https://ollama.com/labadainofficial/labadain-gemma4
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio Unsloth: https://github.com/unslothai/unsloth
