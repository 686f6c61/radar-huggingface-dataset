# Altworld/Hemmingway-1

## Resumen

Hemmingway-1 es un modelo de lenguaje de 26.895.998.464 parametros (aproximadamente 27B) desarrollado por Altworld, publicado bajo licencia Apache-2.0 y construido como ajuste fino sobre Qwen/Qwen3.8-27B. Su propuesta no es competir en razonamiento generico ni en codigo, sino en un nicho muy concreto: la escritura cotidiana (mensajes, correos, notas dificiles, negociaciones informales) con un registro que suena humano y sin el aparato de preambulos, listas de opciones y explicaciones que rodea las respuestas de los asistentes generalistas. El modelo se distribuye en formato safetensors para transformers y con una ventana de contexto declarada de 262.144 tokens.

El modelo se presenta acompanado de tres benchmarks propios (CommunicationBench, Human-Likeness y StoryBench) en los que el autor afirma que supera a modelos de mayor tamano como Fable 5.1, GPT-6 Astra, Kimi K3, GLM-5.3, DeepSeek V4 Pro y Qwen3.8-Max. Ademas cita el benchmark publico EQ-Bench 4, donde situa al modelo en tercera posicion. Todos estos resultados son autodeclarados por el autor y deben tratarse como tales, especialmente los tres primeros, que son de diseno propio.

Su relevancia practica esta en el segmento de modelos abiertos de ~27B con licencia permisiva y contexto muy largo, orientados a generacion de texto de estilo conversacional y creativo en ingles. Es un modelo de nicho: no compite en tareas de codigo, agentes o razonamiento multi-paso, y el propio autor declara que pierde frente a modelos especializados en narrativa hostil y tramos largos de historia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen/Qwen3.8-27B (tag de arquitectura: qwen3_5_text); no se detallan mas particularidades |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | No aplica / no disponible: no se indica que sea un modelo MoE |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible: no se documentan cuantizaciones oficiales; el repositorio publica pesos safetensors completos |
| Idiomas soportados | Ingles (declarado "English-first") |
| Licencia | Apache-2.0 (uso comercial permitido) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No se proporciona informacion detallada sobre la arquitectura interna mas alla de que se trata de un modelo de la familia Qwen3.8 y que la libreria de referencia es transformers, con etiquetas que apuntan a qwen3_5_text y a text-generation. El tamano de pesos (26,9B parametros) y el tamano del repositorio (54,7 GB) son consistentes con pesos en precision bf16/fp16. La ventana de contexto declarada es de 262.144 tokens.

Tampoco se detallan los datos de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si hubo etapas de RLHF, DPO u otro tipo de alineamiento. Lo unico documentado es que es un ajuste (finetune) sobre Qwen/Qwen3.8-27B y que el objetivo de entrenamiento se centro en estilo de escritura cotidiana y en la ausencia de relleno conversacional (la metrica "wrapped" del autor mide con que frecuencia el modelo entierra el texto util en comentarios y opciones). No se documentan innovaciones tecnicas de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional y de escritura cotidiana: mensajes, correos, notas a companeros de trabajo, recordatorios y comunicaciones administrativas.
- Escritura orientada a "pedir algo dificil" o persuadir, categoria que el autor destaca como su punto mas fuerte en su benchmark propio.
- Inteligencia emocional conversacional: el autor lo situa en tercera posicion en EQ-Bench 4.
- Escritura creativa y narrativa: StoryBench lo situa a la altura de Kimi K3 y por delante de Qwen3.8-Max y DeepSeek V4 Pro segun el autor.
- Formato de respuesta directo: tendencia a devolver el texto solicitado sin preambulos, opciones multiples ni notas explicativas.
- Soporte multi-turno: interfaz de chat mediante apply_chat_template en transformers.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el pipeline declarado es text-generation.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card; el autor lo describe como "English-first".
- Despliegue en servidor de inferencia: compatible con vLLM segun el ejemplo de la model card.

## Casos de uso

- Redaccion de comunicaciones cotidianas: el modelo esta ajustado especificamente para generar el texto final de un mensaje (por ejemplo, avisar al casero de una averia en la caldera) sin anadir opciones ni explicaciones, lo que reduce la edicion posterior por parte del usuario.
- Asistencia de escritura en herramientas de productividad: integrado en un cliente de correo o de mensajeria para reescribir, acortar o cambiar el tono de un borrador manteniendo un registro humano.
- Atencion al cliente por escrito: gestion de conversaciones multi-turno en ingles apoyandose en la ventana de 262.144 tokens para conservar historial largo de incidencias sin truncar contexto.
- Generacion de respuestas sensibles emocionalmente: reclamaciones, cancelaciones, disculpas o peticiones delicadas, donde el autor mide buen rendimiento en EQ-Bench 4 y en la categoria de "pedir algo dificil".
- Escritura creativa de formato corto: relatos breves, dialogos y escenas, con la salvedad de que el propio autor reconoce peor rendimiento en tramos largos de historia y narrativa hostil.
- Reescritura y adaptacion de tono en documentacion interna: convertir notas tecnicas o mensajes internos en comunicaciones claras para audiencias no tecnicas dentro de una organizacion en ingles.
- Despliegue autoalojado con contexto largo: tareas de resumen o reescritura sobre documentos extensos en ingles (hasta 262.144 tokens) en infraestructura propia gracias a la licencia Apache-2.0.
- Experimentacion e investigacion en estilo y naturalidad: uso como modelo base de comparacion en estudios sobre deteccion de texto generado, dado que el autor reclama ventaja en "human-likeness".

## Benchmarks y rendimiento

Los datos disponibles son cualitativos: la model card describe resultados en graficos (imagenes) sin publicar cifras numericas en el texto. Se reproduce a continuacion unicamente lo afirmado por el autor.

| Benchmark | Naturaleza | Resultado declarado |
|---|---|---|
| CommunicationBench | Propio del autor (80 peticiones reales, comparacion ciega por pares, orden invertido y juez distinto) | Primer puesto segun el autor; supera a Fable 5.1 y a GPT-6 Astra "por cincuenta puntos"; por delante de Kimi K3, GLM-5.3, Grok 4.6 y DeepSeek V4 Pro |
| Human-Likeness | Propio del autor | "Veintiseis puntos por delante" del siguiente modelo |
| Wrapped (texto vs. memo) | Propio del autor | Menor tasa de respuestas con comentarios envolventes; Fable 5, GLM-5.3 y Kimi K3 superan las nueve respuestas de cada diez con relleno |
| Categoria "hard asks" | Propio del autor | Hemmingway-1: 72 por ciento; GPT-6 Astra: 9 por ciento |
| StoryBench | Propio del autor | A la par de Kimi K3, por delante de Qwen3.8-Max y DeepSeek V4 Pro, y 504 puntos por encima del modelo base |
| EQ-Bench 4 | Benchmark publico, harness propio del benchmark | Tercera posicion; por delante de GPT-5.5, Opus 4.7 y Opus 4.8; a menos de doce puntos del mejor modelo de la tabla |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras pruebas estandar de razonamiento, codigo o matematicas. Tampoco se publican cifras absolutas de los benchmarks propios, solo comparaciones relativas y graficos referenciados como imagenes.

## Requisitos de hardware

Las cifras de memoria siguientes son estimaciones derivadas del numero de parametros (26,9B) y no estan publicadas por el autor.

- Pesos en bf16/fp16: aproximadamente 54 GB. Requiere GPU de 80 GB (A100 80 GB, H100 80 GB, H200) o reparto en varias GPU. El repositorio ocupa 54,7 GB.
- Pesos en int8: aproximadamente 27 GB, mas cache KV. Encaja en A100 40 GB, L40S 48 GB, RTX 6000 Ada 48 GB o dos RTX 4090 de 24 GB.
- Pesos en int4: aproximadamente 14-15 GB, mas cache KV. Encaja en una RTX 4090, RTX 3090 o RTX 4080, con margen limitado.
- Cache KV: con 262.144 tokens de contexto la cache KV puede dominar el consumo de memoria y superar ampliamente el tamano de los pesos; en despliegues reales conviene reducir max-model-len o usar cuantizacion de cache KV, aunque el autor no documenta estas opciones.
- GPU de consumo: si, en cuantizacion de 4 bits y con longitudes de contexto reducidas; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM (comando documentado en la model card con --max-model-len 262144) y transformers con device_map="auto" y dtype="auto". No se documenta soporte de llama.cpp, Ollama, TGI ni otros motores, ni la existencia de pesos GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

La informacion disponible solo permite comparar en terminos de resultados relativos declarados por el autor, no en especificaciones de los rivales.

| Modelo | Parametros | Contexto | Licencia | Rendimiento segun el autor |
|---|---|---|---|---|
| Hemmingway-1 | 26,9B | 262.144 tokens | Apache-2.0 | Referencia de la comparacion; primero en CommunicationBench y Human-Likeness (benchmarks propios); tercero en EQ-Bench 4 |
| Qwen/Qwen3.8-27B (modelo base) | no disponible | no disponible | no disponible | 504 puntos por debajo en StoryBench segun el autor |
| Fable 5.1 | no disponible | no disponible | no disponible | Por debajo de Hemmingway-1 en CommunicationBench segun el autor |
| GPT-6 Astra | no disponible | no disponible | Propietaria | 50 puntos por debajo en CommunicationBench y 9 por ciento en "hard asks" frente al 72 por ciento de Hemmingway-1 |
| Kimi K3 | no disponible | no disponible | no disponible | Por debajo en CommunicationBench; a la par en StoryBench |
| GLM-5.3, Grok 4.6, DeepSeek V4 Pro, Qwen3.8-Max | no disponible | no disponible | no disponible | Por debajo de Hemmingway-1 en CommunicationBench segun el autor |
| GPT-5.5, Opus 4.7, Opus 4.8 | no disponible | no disponible | Propietaria | Por debajo de Hemmingway-1 en EQ-Bench 4 |

No hay datos publicos en la informacion proporcionada sobre parametros, contexto, licencia ni disponibilidad de los modelos comparados, por lo que la comparativa en esas dimensiones figura como no disponible.

## Limitaciones y advertencias

- Resultados autodeclarados: tres de los cuatro benchmarks citados (CommunicationBench, Human-Likeness y StoryBench) son disenados y ejecutados por el propio autor. Solo EQ-Bench 4 es externo. Las afirmaciones de superioridad deben verificarse de forma independiente.
- Sin cifras absolutas publicadas: los resultados se presentan como graficos y comparaciones relativas, sin puntuaciones numericas completas, lo que dificulta la reproducibilidad.
- Idioma: modelo orientado al ingles ("English-first"). El rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Alucinacion: el propio autor advierte de que el modelo "puede equivocarse y aun asi sonar seguro". El estilo fluido y confiado no garantiza veracidad.
- Uso no recomendado: el autor prohibe explicitamente su uso para decisiones medicas, legales o financieras.
- Debilidades reconocidas: peor rendimiento en narrativa hostil y en tramos largos de historia frente a modelos especializados en narrativa.
- Cobertura funcional limitada: no hay evidencia documentada de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision ni audio. No es un modelo adecuado como sustituto de un asistente generalista en esos ambitos.
- Contexto largo en la practica: aunque se declaran 262.144 tokens, no se documenta el rendimiento real a esa longitud ni el coste de memoria de la cache KV, que puede hacer inviable el contexto maximo en hardware de gama media.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones heredadas del modelo base Qwen/Qwen3.8-27B, no detalladas en la informacion proporcionada.
- Madurez del proyecto: el modelo tiene 0 descargas y 14 "likes" en HuggingFace, con creacion y ultima actualizacion el 2026-09-20. Es un lanzamiento muy reciente y con adopcion practicamente nula, sin ecosistema de herramientas ni cuantizaciones de terceros verificadas.
- Dependencia de servicios externos: la demo y las aplicaciones para Mac y Android se ofrecen en hemmingway.io, fuera del repositorio de pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Altworld/Hemmingway-1
- Sitio del proyecto y demo: https://hemmingway.io
- Descarga de aplicaciones para Mac y Android: https://hemmingway.io/download
- Codigo fuente: https://github.com/lukeckprobierts/Hemmingway-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog tecnico o informe de evaluacion independiente: no disponible en la informacion proporcionada.
- EQ-Bench 4 (benchmark externo citado, referencia no incluida en la informacion): no disponible.
- La busqueda web realizada no devolvio enlaces relevantes al modelo; los resultados obtenidos correspondian a paginas de soporte de Microsoft ajenas al contenido solicitado.
