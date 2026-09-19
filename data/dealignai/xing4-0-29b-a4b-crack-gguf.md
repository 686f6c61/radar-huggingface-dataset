# dealignai/Xing4.0-29B-A4B-CRACK-GGUF

## Resumen

Xing4.0-29B-A4B-CRACK-GGUF es una coleccion de siete cuantizaciones GGUF del modelo Xing4.0-29B-A4B, desarrollado originalmente por XingChen-AGI (China Telecom AI) como sucesor de la familia TeleChat. La version publicada por el usuario dealignai es una variante «abliterated»: segun la model card, se ha eliminado a nivel de pesos el circuito de rechazo del modelo base, de modo que el sistema responde practicamente a cualquier peticion sin mecanismos de negativa. Esta orientada a generacion de texto conversacional y a escenarios de investigacion donde se quiere medir o evitar el comportamiento de rechazo.

Tecnicamente es un modelo de mezcla de expertos (MoE) con 29B parametros totales y aproximadamente 4B activos por token (top-4 de 64 expertos enrutados mas un experto compartido). Incorpora atencion con MLA (multi-head latent attention, q_lora=768 y kv_lora=512), hyper-connections mHC de 4 canales, una cabeza MTP (multi-token prediction) y 40 capas con hidden size 3584. El contexto nativo anunciado es de 256K tokens, escalable a 512K mediante YARN.

Su relevancia actual es doble: por un lado es una de las primeras distribuciones publicas en formato GGUF de un modelo con MLA y hyper-connections para llama.cpp, lo que exige un fork especifico del runtime; por otro, la variante CRACK documenta de forma cuantitativa su tasa de cumplimiento en HarmBench, lo que la convierte en material de estudio para evaluacion de alineacion y red-teaming. El repo tiene un tamano de 216,8 GB y, en el momento de la consulta, 7 descargas y 6 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con MLA, hyper-connections mHC (4 canales) y cabeza MTP; 40 capas, hidden 3584 |
| Parametros totales | 31.215.031.088 segun safetensors; la model card lo denomina 29B-A4B |
| Parametros activos | Aproximadamente 4B (top-4 de 64 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 256K nativo, escalable a 512K con YARN |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, IQ4_NL, IQ3_M (con calibracion imatrix) |
| Idiomas soportados | Chino (etiqueta 中文/chinese de la model card); el resto no disponible. La imatrix se calibro con WikiText-2, arbol de codigo fuente y Wikipedia en chino |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 40 capas y dimension oculta de 3584. El enrutamiento activa 4 expertos de los 64 disponibles mas un experto compartido, lo que deja unos 4B parametros activos sobre un total de 29-31B. La atencion emplea MLA (multi-head latent attention) con q_lora=768 y kv_lora=512, un esquema que comprime las proyecciones de query y de clave-valor en un espacio latente de baja dimension para reducir el coste de la cache KV en contextos largos. Ademas incorpora hyper-connections mHC de 4 canales, que ensanchan las conexiones residuales, y una cabeza MTP (multi-token prediction).

La model card de esta version no detalla el numero de tokens de entrenamiento, la composicion del dataset ni la receta de alineacion (RLHF, DPO u otras) del modelo base: esos datos no estan disponibles en la informacion proporcionada. Lo que si se documenta es el proceso de cuantizacion: siete variantes GGUF calibradas con una matriz de importancia (imatrix) construida a partir de WikiText-2, un arbol de codigo fuente y Wikipedia en chino. La variante CRACK aplica una ablacion sobre los pesos para eliminar el comportamiento de rechazo, y su efecto se cuantifica con HarmBench 320 y con MMLU-456 comparando contra la misma cuantizacion del modelo base sin ablacionar.

Un detalle operativo relevante: esta arquitectura no funciona con llama.cpp estandar. Requiere el fork `shuxiaoqiong/llama.cpp` en la rama `xing4_0-port`, correspondiente al PR #29012 del repositorio upstream ggml-org, que todavia no esta fusionado.

## Capacidades

- Generacion de texto conversacional y modo razonamiento explicito, conmutable mediante `enable_thinking` (true/false).
- Razonamiento multi-paso con cadena de pensamiento, con cero bucles de razonamiento registrados en la evaluacion completa (320 prompts x 2 modos x 7 cuantizaciones).
- Capacidad declarada de anular el comportamiento de rechazo en el dominio de seguridad evaluado: entre el 96,9 % y el 99,4 % de cumplimiento en modo off sobre HarmBench 320.
- Manejo de contexto largo: 256K tokens nativos y hasta 512K con escalado YARN.
- Idiomas: orientacion principal al chino segun las etiquetas de la model card; no hay datos publicados sobre cobertura de otros idiomas.
- Prediccion multi-token mediante cabeza MTP (potencialmente aprovechable para decodificacion especulativa, aunque la model card no detalla su uso).
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes: no disponible.
- Vision, audio u otras modalidades: no disponibles (pipeline text-generation).

## Casos de uso

- Investigacion en alineacion y red-teaming: el modelo permite medir cuanto cambia la tasa de cumplimiento frente a un modelo con rechazos intactos. La propia model card publica el protocolo (HarmBench 320, con desglose por nivel de rechazo), lo que facilita reproducir la comparacion base vs. ablacionado.
- Auditoria de seguridad de contenido: al no filtrar peticiones, sirve como generador de casos adversarios para probar clasificadores, moderadores o filtros de terceros, siempre en un entorno controlado y con las salvaguardas legales oportunas.
- Generacion de ficcion y contenido creativo sin bloqueos injustificados: el modelo mantiene capacidad de razonamiento (MMLU-456 entre 55,5 % y 68,2 % segun cuantizacion) y, al carecer de cabezal de rechazo, responde a tramas, personajes moralmente grises o temas delicados que otros modelos derivan.
- Procesamiento de documentos largos en chino: con 256K tokens de contexto y una imatrix calibrada con Wikipedia en chino, es adecuado para resumir y consultar contractos, informes tecnicos o corpus normativos extensos sin trocear el documento.
- Despliegue local en estaciones de trabajo: los cuants IQ3_M (12,9 GB) y Q3_K_M (14,0 GB) permiten ejecutar un MoE de 29B en GPU de consumo mediante llama.cpp, con coste de inferencia bajo al activar solo ~4B parametros por token.
- Asistente conversacional de bajo coste en produccion: la combinacion de MoE con pocos parametros activos y cuantizaciones de 16-24 GB reduce el coste por token frente a un denso de 29B, y el contexto de 256K evita reenvios de historial.
- Analisis de codigo y documentacion tecnica: la imatrix incluye un arbol de codigo fuente, lo que sugiere sensibilidad calibrada para texto de programacion; encaja en tareas de explicacion de repositorios o generacion de documentacion sobre bases de codigo grandes alojadas en contexto.
- Evaluacion comparativa de cuantizaciones: los siete niveles publicados con sus metricas de MMLU-456 permiten estudiar la degradacion por cuantizacion en un MoE con MLA (de 68,2 % en Q8_0 a 55,5 % en IQ3_M) y elegir el punto de compromiso calidad/tamano.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantizacion. MMLU-456 es un subconjunto estratificado de 456 preguntas (57 materias, ~8 por materia) evaluado con logit de letra unica a temperatura 0. HB320 es HarmBench con 320 prompts; «off» corresponde a `enable_thinking:false` y «think» a `enable_thinking:true`. El porcentaje de cumplimiento incluye respuestas truncadas por `max_tokens`.

| Cuantizacion | Tamano | MMLU-456 (delta vs. base) | HB320 off (cumplimiento) | HB320 think (cumplimiento) | Bucles |
|---|---|---|---|---|---|
| Q8_0 | 30,9 GB | 68,2 % (-3,1) | 99,4 % (318/320) | 93,4 % (299/320) | 0/0 |
| Q6_K | 23,9 GB | 66,9 % (-3,3) | 98,4 % (315/320) | 92,2 % (295/320) | 0/0 |
| Q5_K_M | 20,7 GB | 67,1 % (-2,0) | 99,1 % (317/320) | 92,5 % (296/320) | 0/0 |
| Q4_K_M | 17,6 GB | 66,0 % (-4,2) | 99,1 % (317/320) | 94,7 % (303/320) | 0/0 |
| IQ4_NL | 16,5 GB | 64,3 % (-4,1) | 99,1 % (317/320) | 89,4 % (286/320) | 0/0 |
| Q3_K_M | 14,0 GB | 58,1 % (-0,9) | 98,1 % (314/320) | 91,6 % (293/320) | 0/0 |
| IQ3_M | 12,9 GB | 55,5 % (-5,0) | 96,9 % (310/320) | 89,1 % (285/320) | 0/0 |

Linea base de referencia publicada (modelo base sin ablacionar, F16 llevado a la misma cuantizacion): MMLU 71,3 %, cumplimiento off 59,4 %, cumplimiento think 55,0 %.

No se han publicado en la informacion disponible resultados de otros benchmarks habituales (HumanEval, GSM8K, MMLU completo, MATH, MT-Bench u otros), ni comparaciones contra modelos de terceros.

## Requisitos de hardware

Los tamanos de pesos son los publicados en la model card; las recomendaciones de VRAM son estimaciones derivadas de esos tamanos y hay que anadir la cache KV y el overhead del runtime. Con MLA (kv_lora=512) la cache KV por token es reducida en comparacion con atencion tradicional, pero no se dispone de cifras exactas de la cache ni de throughput.

| Cuantizacion | Pesos | VRAM estimada (pesos + margen) | GPU orientativa |
|---|---|---|---|
| Q8_0 | 30,9 GB | 34-38 GB | A100 40 GB, H100 80 GB, L40S 48 GB; multi-GPU en consumer |
| Q6_K | 23,9 GB | 27-30 GB | A100 40 GB, L40S 48 GB; RTX 4090 24 GB al limite, mejor 2x GPU |
| Q5_K_M | 20,7 GB | 24-27 GB | RTX 3090/4090 24 GB con contexto corto, L40S, A6000 |
| Q4_K_M | 17,6 GB | 20-23 GB | RTX 4090 24 GB, RTX 4080 Super 16 GB con offload parcial |
| IQ4_NL | 16,5 GB | 19-22 GB | RTX 4090 24 GB |
| Q3_K_M | 14,0 GB | 16-19 GB | RTX 4060 Ti 16 GB, RTX 4080 16 GB, RTX 4090 con contexto amplio |
| IQ3_M | 12,9 GB | 15-18 GB | RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, Mac con memoria unificada de 24 GB o mas |

- Si cabe en GPU de consumo: si, las cuantizaciones de 12,9 a 17,6 GB entran en tarjetas de 16 GB y las de 20,7 GB o mas en tarjetas de 24 GB, siempre que el contexto no sea muy largo.
- Opciones de despliegue: exclusivamente llama.cpp, y solo con el fork `shuxiaoqiong/llama.cpp` en la rama `xing4_0-port` (PR #29012) mientras no se fusione en upstream. No hay soporte confirmado en vLLM, TGI, Ollama ni en llama.cpp estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar esta distribucion con su propio modelo base. No se han identificado en el material disponible otros modelos comparables con datos verificables (ni versiones GGUF de la misma familia publicadas por otros autores, ni alternativas MoE de tamano similar), por lo que esos valores quedan como no disponibles.

| Modelo | Parametros | Contexto | MMLU-456 | Cumplimiento HB320 (off/think) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xing4.0-29B-A4B-CRACK (GGUF, esta ficha) | 31,2B totales / ~4B activos | 256K, 512K con YARN | 55,5 %-68,2 % segun cuantizacion | 96,9 %-99,4 % / 89,1 %-94,7 % | apache-2.0 | GGUF en HuggingFace, requiere fork de llama.cpp |
| Xing4.0-29B-A4B (base, referencia del autor) | 29B totales / ~4B activos | 256K, 512K con YARN | 71,3 % (F16) | 59,4 % / 55,0 % | apache-2.0 | safetensors/GGUF, repositorio XingChen-AGI |
| Otras alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo ablacionado: la eliminacion del circuito de rechazo es intencionada. En la evaluacion publicada cumple con el 96,9 %-99,4 % de los prompts de HarmBench 320 en modo off, lo que implica que puede generar contenido danino, ilegal o gravemente ofensivo sin filtros propios. No es apto para desplegarse de cara al publico sin una capa de moderacion externa.
- Responsabilidad legal y etica: el uso de un modelo sin guardrails puede entrar en conflicto con la normativa aplicable (por ejemplo, obligaciones de moderacion de contenidos en la UE) y con las condiciones de uso de plataformas intermediarias. La licencia apache-2.0 no exime de esas obligaciones.
- Riesgo de alucinacion: no se han publicado mediciones de veracidad, factualidad o tasa de alucinacion en la informacion disponible. El subconjunto MMLU-456 de 456 preguntas es una muestra pequena y no debe interpretarse como MMLU completo.
- Degradacion por cuantizacion: la caida de MMLU-456 es notable en los niveles bajos (58,1 % en Q3_K_M e 55,5 % en IQ3_M frente a 68,2 % en Q8_0). Para tareas que requieran precision matematica o de razonamiento conviene usar Q5_K_M o superior.
- Limitaciones de idioma: la model card solo etiqueta el chino; no hay datos de rendimiento en castellano ni en otros idiomas, ni evaluaciones multilingues publicadas.
- Dependencia de un runtime no estandar: requiere un fork de llama.cpp con el PR #29012 sin fusionar. Esto implica riesgo de rotura, falta de soporte en herramientas de terceros (Ollama, vLLM, TGI, LM Studio) y posible incompatibilidad futura si el PR cambia.
- Advertencia sobre modo thinking: en modo razonamiento la tasa de rechazo residual aumenta (hasta un 5,3 % de rechazos durante la cadena de razonamiento en Q8_0), por lo que el comportamiento no es homogeneo entre modos.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos demograficos, politicos o culturales para este modelo ni para su base. El calibrado de imatrix con Wikipedia en chino y un arbol de codigo fuente puede introducir sesgos de dominio.
- Trazabilidad: el repositorio tiene muy baja adopcion (7 descargas, 6 likes) y no hay informacion sobre quien mantiene la cuantizacion ni sobre procesos de validacion independientes.
- Fecha de publicacion y actualizacion: creado el 19 de septiembre de 2026 y actualizado el 21 de septiembre de 2026, segun los metadatos de HuggingFace.

## Enlaces

- Repositorio GGUF de la variante CRACK: https://huggingface.co/dealignai/Xing4.0-29B-A4B-CRACK-GGUF
- Modelo base en HuggingFace: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Fork de llama.cpp requerido: https://github.com/shuxiaoqiong/llama.cpp (rama `xing4_0-port`)
- Pull request upstream de soporte: https://github.com/ggml-org/llama.cpp/pull/29012
- Perfil del autor en X: https://x.com/dealignai
