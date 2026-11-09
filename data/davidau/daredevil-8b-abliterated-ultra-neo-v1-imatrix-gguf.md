# DavidAU/Daredevil-8B-abliterated-Ultra-NEO-V1-IMATRIX-GGUF

## Resumen

Daredevil-8B-abliterated-Ultra-NEO-V1-IMATRIX-GGUF es una cuantizacion GGUF del modelo Daredevil-8B-abliterated, un modelo de lenguaje de 8.030 millones de parametros derivado de la familia Llama 3 y refinado por mlabonne mediante la tecnica de abliteration (eliminacion de la direccion de rechazo en el espacio de activaciones). El autor de esta distribucion es DavidAU, conocido por publicar cuantizaciones "NEO Class" con matrices de importancia (IMATRIX) optimizadas para preservar la calidad en precisiones bajas.

El modelo esta orientado a generacion creativa: narrativa, roleplay, fantasia y escritura de ficcion. Su contexto maximo es de 8192 tokens y solo declara soporte para ingles. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque el modelo base hereda las limitaciones de la arquitectura Llama 3.

La relevancia de esta ficha radica en que combina dos tecnicas controvertidas y practicas: la abliteration (que elimina los mecanismos de rechazo del modelo alineado) y la cuantizacion IMATRIX de alta precision (que segun el autor reduce la perplejidad en cientos de puntos frente a cuantizaciones convencionales del mismo nivel). El repositorio ocupa 52 GB e incluye multiples niveles de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (8k) |
| Tipos de cuantizacion | GGUF en multiples niveles (Q2 a Q8, IQ2 a IQ8, segun el repositorio de 52 GB); niveles concretos no detallados en la informacion disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de tipo Llama 3 con 8.030 millones de parametros. El modelo original (Daredevil-8B-abliterated, de mlabonne) parte de un modelo Llama 3 de 8B y aplica abliteration: se calcula la direccion media de las activaciones asociadas a respuestas de rechazo y se proyecta fuera de los pesos, de modo que el modelo deja de negarse a responder ciertas peticiones. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO adicionales en la informacion proporcionada.

La innovacion tecnica de esta distribucion concreta es la cuantizacion "NEO Class" con IMATRIX. Segun la model card del autor, estas cuantizaciones se generan tras "mas de 120 experimentos de laboratorio" y logran que un cuantizado de nivel Q4/IQ4 opere a niveles de calidad de Q5KM/Q6, y un Q3/IQ3 a niveles de Q4KM/Q5. El autor afirma una reduccion de perplejidad de 724 puntos para el IQ4XS NEO frente al IQ4XS convencional. Estas cifras proceden exclusivamente de la model card y no han sido verificadas de forma independiente en la informacion disponible. Ademas, la model card indica que, aunque el modelo usa plantilla Llama 3, la plantilla de Command-R funciona mejor para fines creativos, algo que el autor atribuye a la confirmacion de multiples usuarios.

## Capacidades

- Generacion de texto narrativo y creativo: ficcion, fantasia, narracion de historias y descripciones de escenas extensas.
- Roleplay conversacional en ingles, con enfasis en mantener personajes y tono a lo largo de turnos.
- Escritura de ficcion de formato largo dentro de la ventana de 8k tokens.
- Conversacion general en ingles.
- Al no estar alineado con rechazos (abliterated), responde a peticiones que un modelo alineado rechazaria; esto es una capacidad tecnica y a la vez un riesgo (ver limitaciones).
- Compatibilidad con endpoints de inferencia estandar (tag `endpoints_compatible`).
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Generacion de ficcion y narrativa: el modelo puede producir escenas de varios miles de palabras manteniendo coherencia dentro de su ventana de 8k tokens, adecuado para borradores de relatos, capitulos o guiones.
- Roleplay y personajes conversacionales: su orientacion a roleplay y su falta de rechazos lo hacen util para chatbots de personajes en entornos controlados, donde se requiere mantener una persona ficticia de forma consistente.
- Escritura creativa asistida: generacion de descripciones, dialogos y tramas para autores que necesitan un borrador rapido en ingles.
- Prototipado de aplicaciones de texto en local: al ser GGUF y caber en GPU de consumo, sirve para probar pipelines de generacion sin infraestructura dedicada.
- Generacion de contenido de fantasia y worldbuilding: creacion de trasfondos, nombres, descripciones de lugares y sistemas de magia en ingles.
- Experimentacion con tecnicas de abliteration y cuantizacion: investigadores pueden comparar la calidad de los cuantizados NEO IMATRIX frente a cuantizados convencionales usando el mismo modelo base.
- Base para fine-tuning creativo: su licencia Apache 2.0 permite adaptarlo y redistribuirlo, incluido uso comercial, con las cautelas propias del contenido sin alinear.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una metrica interna de perplejidad (reduccion de 724 puntos del IQ4XS NEO frente al IQ4XS convencional), sin detallar el corpus de evaluacion ni el valor absoluto, por lo que no es posible presentar una tabla comparativa fiable.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 8B en GGUF ocupa aproximadamente 4,5-5 GB en Q4, 6-7 GB en Q6 y 8-9 GB en Q8, mas el espacio para el contexto KV cache (que crece con los 8k tokens).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones medias y altas; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas para cuantizaciones Q4/IQ4; para Q8 se recomienda 12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del nivel de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Daredevil-8B-abliterated-Ultra-NEO-V1-IMATRIX-GGUF | 8,03B | 8k | Apache 2.0 | GGUF | Cuantizacion NEO IMATRIX, orientado a creativo/roleplay, solo ingles |
| Daredevil-8B-abliterated (mlabonne) | 8,03B | 8k | Apache 2.0 | safetensors | Modelo base sin cuantizar; misma orientacion creativa |
| Llama 3 8B Instruct | 8,03B | 8k | Llama 3 Community License | safetensors, GGUF | Alineado con rechazos, uso comercial con restricciones de la licencia Meta |
| Mistral 7B Instruct | 7,24B | 32k | Apache 2.0 | safetensors, GGUF | Contexto mayor, alineado, multilingue parcial |

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado la direccion de rechazo, por lo que puede generar contenido sensible, ofensivo o inapropiado sin filtros. No es adecuado para aplicaciones orientadas al publico sin una capa de moderacion externa.
- Solo soporta ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Contexto limitado a 8k tokens, inferior al de alternativas contemporaneas con 32k o mas.
- Riesgo de alucinacion inherente a los modelos de 8B, especialmente en tareas factuales o de razonamiento complejo.
- Sesgos heredados de los datos de entrenamiento del modelo base Llama 3, no documentados en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin alineacion puede implicar riesgos legales o reputacionales para el despliegue.
- Las afirmaciones sobre calidad de los cuantizados NEO IMATRIX proceden del autor y no han sido verificadas de forma independiente.
- La recomendacion de usar la plantilla de Command-R en lugar de la de Llama 3 puede romper la compatibilidad con herramientas que asumen la plantilla declarada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DavidAU/Daredevil-8B-abliterated-Ultra-NEO-V1-IMATRIX-GGUF
- Modelo base (mlabonne): https://huggingface.co/mlabonne/Daredevil-8B-abliterated
- Guia de parametros y samplers del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
