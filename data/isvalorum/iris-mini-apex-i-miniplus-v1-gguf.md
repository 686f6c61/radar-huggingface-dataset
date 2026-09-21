# IsValorum/Iris-mini-APEX-I-MiniPlus-V1-GGUF

## Resumen

Iris-mini APEX-I-MiniPlus V1 es una cuantizacion GGUF del modelo base AllSpark-Research/Iris-mini, publicada por el usuario IsValorum. El modelo original es un transformer de tipo Mixture of Experts (MoE) con arquitectura etiquetada como `qwen35moe`, 35.505.251.456 parametros totales (unos 35,5B) y aproximadamente 3,2B parametros activos por token. La cuantizacion resultante ocupa 14,84 GB en disco (13,82 GiB) con una densidad media de 3,42 bits por peso (BPW), lo que permite ejecutar un MoE de 35B en equipos con 24 GB de VRAM o incluso con parte de los pesos en RAM del sistema.

El valor diferencial de esta publicacion no es el modelo base, sino la receta de cuantizacion por tensores: en lugar de aplicar una cuantizacion plana de 3 bits o la receta agresiva habitual de la comunidad (expertos en `IQ2_S`), aqui se mantienen las puertas del router sin comprimir en `F32`, la cabeza de salida (`output.weight`) en `Q6_K`, las puertas de atencion en `Q8_0` y los expertos centrales de razonamiento en `IQ3_XXS`. Ademas, se preserva la cabeza nativa de Multi-Token Prediction (`blk.40`), lo que habilita decodificacion especulativa dentro del propio modelo.

Es relevante ahora porque demuestra que es posible mantener una ventana de contexto de hasta 256K tokens en una GPU de 24 GB con un modelo MoE de 35B cuantizado a ~3,4 BPW, y porque el autor publica una edicion posterior (V2.1) con mejoras medidas de perplejidad y de rendimiento en CPU, manteniendo V1 como perfil ligero y transparente a nivel arquitectonico. El repo acumula 1.743 descargas y 2 likes desde su publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen35moe`) con cabeza nativa de Multi-Token Prediction (MTP) |
| Parametros totales | 35.505.251.456 (aprox. 35,5B) |
| Parametros activos | Aproximadamente 3,2B por token |
| Longitud de contexto | Hasta 256K tokens segun la model card (256k en V2.1, mismo modelo base) |
| Tipos de cuantizacion | Receta mixta por tensores: `IQ3_XXS` en expertos centrales, `Q3_K` en fronteras, `Q6_K` en la cabeza de salida, `Q8_0` en puertas de atencion, `F32` en puertas del router. Media: 3,42 BPW |
| Idiomas soportados | Ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, thai y arabe (13 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un unico archivo: `Iris-mini-MTP.APEX-I-MiniPlus.gguf`) |
| Modelo base | AllSpark-Research/Iris-mini |
| Cuantizado por | IsValorum |
| Tamano del archivo | 14,84 GB en disco / 13,82 GiB de huella en memoria |
| Tamano del repositorio | 14,8 GB |
| Descargas / likes | 1.743 descargas / 2 likes |
| Fecha de publicacion | 14 de septiembre de 2026 (ultima actualizacion: 20 de septiembre de 2026) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 35,5B parametros totales y unos 3,2B activos por token, lo que situa su coste de inferencia en el orden de un modelo denso de ~3B pese a tener una capacidad de representacion mucho mayor. La etiqueta de arquitectura proporcionada por el autor es `qwen35moe`, y el checkpoint incluye una cabeza nativa de Multi-Token Prediction en la capa `blk.40`, es decir, el modelo no solo predice el siguiente token, sino varios tokens futuros de forma simultanea. Esa cabeza se conserva intacta en la cuantizacion y actua como borrador (draft) interno para decodificacion especulativa.

La contribucion tecnica de esta ficha concreta es la estrategia de cuantizacion, no el entrenamiento. No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base fue sometido a RLHF, DPO u otro tipo de ajuste por preferencias. Lo que si se documenta es la construccion tensor a tensor: las puertas del router quedan en `F32` sin comprimir (critico para no degradar la seleccion de expertos), la cabeza de salida pasa a `Q6_K` (protege la fidelidad del vocabulario final), las puertas de atencion a `Q8_0` y los expertos centrales de razonamiento se mantienen en `IQ3_XXS` o superior. El autor afirma que esta receta evita los picos de perplejidad, los errores de sintaxis y los corchetes de codigo roto que, segun el, provoca la receta comunitaria de 2 bits `IQ2_S` en expertos y `Q3_K_M` en la cabeza de salida.

## Capacidades

- Generacion de texto conversacional multi-turno, con la etiqueta `conversational` en el repositorio.
- Razonamiento y matematicas: el autor describe el modelo como un "deep reasoning model" y reserva los expertos centrales para tareas de razonamiento y matematicas.
- Generacion de codigo: se menciona explicitamente la preservacion de sintaxis y de corchetes de codigo como criterio de calidad de la cuantizacion.
- Decodificacion especulativa nativa mediante la cabeza MTP (`blk.40`), sin necesidad de un modelo borrador externo.
- Soporte multilingue en 13 idiomas: ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, thai y arabe.
- Compatibilidad con `llama.cpp`, incluida la vectorizacion lineal orientada a CPU (evita bloqueos por tablas de busqueda AVX2, segun el autor).
- Uso con contexto profundo de hasta 256K tokens, con los pesos transmitidos desde RAM del sistema y la cache KV residente en VRAM.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: con hasta 256K tokens de ventana, el modelo puede mantener el hilo de una conversacion extensa o procesar documentos completos sin truncar. Es adecuado porque la receta mantiene la precision de la cabeza de salida y de las puertas de atencion, que son las zonas mas sensibles al degradado por cuantizacion.
- Razonamiento matematico y analisis tecnico por lotes: los expertos centrales se conservan a `IQ3_XXS` en lugar de bajar a 2 bits, lo que segun el autor evita picos de perplejidad en cadenas de razonamiento largas. Encaja en tareas de resolucion de problemas paso a paso donde un fallo temprano invalida toda la respuesta.
- Generacion de codigo en local: el modelo puede funcionar como copiloto de programacion en un equipo con GPU de 24 GB, gracias a que los corchetes y la sintaxis se preservan mejor que con cuantizaciones planas de 3 bits o recetas de 2 bits en los expertos.
- Despliegue en portatil o estacion de trabajo con GPU modesta: con 14,84 GB de pesos, el modelo cabe completo en una GPU de 24 GB junto con la cache KV, o puede ejecutarse con los pesos en DDR4/DDR5 y solo la cache KV en VRAM. El autor reporta 23-26+ tok/s en portatiles con DDR4.
- Procesamiento documental multilingue: al cubrir 13 idiomas, sirve para resumir, clasificar o extraer informacion de documentos en entornos con mezcla de idiomas sin cambiar de modelo.
- Servicio de inferencia self-hosted con decodificacion especulativa: la cabeza MTP integrada permite acelerar la generacion sin desplegar un modelo borrador adicional, lo que simplifica la infraestructura en `llama.cpp`.
- Evaluacion y experimentacion en investigacion: al ser un GGUF de un MoE de 35B con receta documentada tensor a tensor, es util como punto de referencia para estudiar el impacto de la cuantizacion selectiva en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo completo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos aportados se refieren a perplejidad y throughput, y en el caso de la perplejidad corresponden a la edicion V2.1, no a V1.

| Metrica | V1 (esta ficha) | V2.1 (edicion posterior) | Notas |
|---|---|---|---|
| Perplejidad WikiText-2 | No disponible | 5,3735 ± 0,1214 | Verificada empiricamente por el autor; equiparable a calidad `Q5_K`/`Q6_K` |
| BPW medio | 3,42 | No disponible | V1: 3,42 BPW declarados |
| Tamano en disco | 14,84 GB (13,82 GiB) | ~14,7 GB (~13,74 GiB) | Diferencia de ~180 MB entre ediciones |
| Throughput en portatil DDR4 | No disponible especificamente para V1 | +24 a 28+ tok/s en streaming desde RAM | El autor atribuye la mejora a la eliminacion de bloqueos AVX2 |
| Throughput general en portatil | 23-26+ tok/s (seccion de benchmarks del repo) | No disponible | Medido en DDR4 segun la model card |

## Requisitos de hardware

- VRAM estimada: 13,82 GiB de pesos. Con una GPU de 24 GB cabe el modelo completo mas la cache KV para contexto largo; el autor afirma que el contexto completo de 256K se puede ejecutar en VRAM en configuracion de 24 GB.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090 y GPUs profesionales con 24 GB o mas (A100 40/80 GB, H100) para el escenario de todo en VRAM. El repositorio incluye proyecciones de throughput para las familias RTX 30, 40 y 50.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090/4090/5090). En GPUs de 16 GB o menos habria que recurrir a offload parcial a RAM del sistema o a una cuantizacion mas agresiva que la publicada aqui, que no se ofrece en este repositorio.
- Modo de ejecucion hibrido: los pesos pueden residir en RAM DDR4/DDR5 y la cache KV en VRAM. El autor reporta 23-26+ tok/s en portatiles con DDR4 y +24 a 28+ tok/s en streaming desde RAM para la edicion V2.1.
- Opciones de despliegue: `llama.cpp` es el runtime de referencia declarado en las etiquetas del repositorio. Otros runtimes compatibles con GGUF (por ejemplo, LM Studio u Ollama) dependerian de que soporten la arquitectura `qwen35moe` y la cabeza MTP; no se confirma en la informacion disponible. vLLM y TGI no estan documentados para esta ficha.
- Latencia y throughput: no se publican valores de latencia (TTFT) ni de throughput en GPU en la informacion proporcionada. Solo se documentan las cifras de tok/s en CPU/RAM mencionadas arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iris-mini APEX-I-MiniPlus V1 (esta ficha) | 35,5B totales / ~3,2B activos | Hasta 256K | Mixta: `IQ3_XXS` + `Q3_K` + `Q6_K` + `Q8_0` + `F32`, 3,42 BPW | Apache 2.0 | GGUF en HuggingFace |
| Iris-mini APEX-I-MiniPlus V2.1 (mismo autor) | 35,5B totales / ~3,2B activos | Hasta 256K | Expertos compartidos en `Q5_K`, puertas `Q8_0`, ~14,7 GB | Apache 2.0 | GGUF en HuggingFace |
| AllSpark-Research/Iris-mini (modelo base) | 35,5B totales / ~3,2B activos | No disponible | Pesos originales (no cuantizado) | No disponible en la informacion proporcionada | HuggingFace |
| Recetas genericas APEX-I-Mini de la comunidad | 35,5B totales / ~3,2B activos | No disponible | 2 bits `IQ2_S` en expertos, `Q3_K_M` en salida, `Q3_K` en atencion | No disponible | HuggingFace |

No se dispone en la informacion proporcionada de datos de benchmarks comparativos frente a modelos de otros desarrolladores de tamano o categoria similares, por lo que no se incluyen cifras de rendimiento de terceros.

## Limitaciones y advertencias

- Perplejidad de V1 no publicada: la cifra de 5,3735 ± 0,1214 corresponde a la edicion V2.1. No hay medicion equivalente para V1, por lo que su degradacion real frente al modelo base no esta cuantificada.
- Perdida de precision por cuantizacion: aunque la receta protege router, atencion y cabeza de salida, los expertos centrales estan a `IQ3_XXS`. Es previsible cierta degradacion en tareas de razonamiento profundo respecto a los pesos originales en `bfloat16`/`float16`.
- Riesgo de alucinacion: no se documenta ningun proceso de mitigacion. Como en cualquier modelo generativo de esta escala, existe riesgo de afirmaciones incorrectas, especialmente en dominios especializados.
- Cobertura multilingue desigual: se declaran 13 idiomas, pero no se especifica el volumen de datos de entrenamiento por idioma. El rendimiento en idiomas con menos presencia en el corpus (thai, vietnamita, arabe) puede ser inferior al de ingles o chino.
- Contexto de 256K: la ventana maxima declarada requiere gestionar cuidadosamente la cache KV. En configuraciones con offload a RAM, la latencia de recuperacion de pesos puede degradar la experiencia en contextos muy profundos.
- Dependencia del runtime: la cuantizacion solo es utilizable en runtimes que soporten tanto la arquitectura `qwen35moe` como la cabeza MTP. Fuera de `llama.cpp` (y de los proyectos que lo integren), el soporte no esta garantizado.
- Advertencia del propio autor: no confundir esta receta con las publicaciones genericas APEX-I-Mini de la comunidad. Tienen nombres parecidos pero politicas de cuantizacion muy distintas.
- Licencia: Apache 2.0, permisiva para uso comercial, pero conviene verificar la licencia del modelo base AllSpark-Research/Iris-mini, que no se detalla en la informacion proporcionada y podria imponer condiciones adicionales.
- Fechas de publicacion y actualizacion inusualmente futuras (septiembre de 2026) tal como figuran en los metadatos del repositorio.

## Enlaces

- [Repositorio HuggingFace: IsValorum/Iris-mini-APEX-I-MiniPlus-V1-GGUF](https://huggingface.co/IsValorum/Iris-mini-APEX-I-MiniPlus-V1-GGUF)
- [Edicion recomendada por el autor: IsValorum/Iris-mini-APEX-I-MiniPlus-V2.1-GGUF](https://huggingface.co/IsValorum/Iris-mini-APEX-I-MiniPlus-V2.1-GGUF)
- [Modelo base: AllSpark-Research/Iris-mini](https://huggingface.co/AllSpark-Research/Iris-mini)

La busqueda web realizada no devolvio resultados relacionados con el modelo; los unicos enlaces relevantes son los anteriores, obtenidos directamente de HuggingFace. No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.
