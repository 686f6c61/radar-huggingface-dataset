# ApolloRaines/Qwen3.8-27B-jBlaze

## Resumen

Qwen3.8-27B-jBlaze es una edicion de pesos del modelo Qwen/Qwen3.8-27B realizada por Apollo Raines mediante la tecnica jBlaze, y distribuida como cuantizacion GGUF Q4_K_M lista para cargar en llama.cpp sin modificaciones. El objetivo declarado no es mejorar la precision ni ampliar capacidades, sino reducir la latencia de las generaciones largas: segun el autor, el modelo produce un 28 % menos de tokens de salida que el original en una evaluacion sellada de 85 items, con las ganancias concentradas en respuestas extensas. Mantiene la licencia Apache-2.0 del modelo base.

El modelo conserva la cabeza MTP (multi-token prediction) integrada del Qwen3.8-27B, que puede activarse con un unico flag de decodificacion especulativa en llama.cpp (`--spec-type draft-mtp`). Esta combinacion reduce de forma notable la cola de latencia: el p90 pasa de 14,891 s a 9,651 s en la instrumentacion del autor. Con 27.320.697.856 parametros totales y aproximadamente 16 GB de pesos en Q4_K_M, cabe en una sola GPU de 24 GB, con el resto del presupuesto de VRAM dedicado a cache KV para contextos de hasta 8192 tokens en las pruebas.

Es relevante para desarrolladores que ya despliegan Qwen3.8-27B en local o en entornos con llama.cpp y necesitan recortar el tiempo hasta la respuesta completa sin cambiar de infraestructura ni de runtime. No obstante, conviene tratarlo como un experimento de optimizacion con un alcance acotado: el propio autor reconoce que no alcanza el objetivo de 2x de velocidad, que la mediana de latencia apenas cambia y que la precision cae 0,59 puntos en la evaluacion sellada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con cabeza MTP integrada; pesos editados con jBlaze |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma explicita; las pruebas se ejecutaron con generaciones de hasta 8192 tokens dentro de 24 GB de VRAM |
| Tipos de cuantizacion | Q4_K_M (GGUF); el autor menciona una referencia Q8_0 usada para medir divergencia |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (misma que el modelo base) |
| Formato de pesos | GGUF (`Qwen3.8-27B-jBlaze-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo es una obra derivada de Qwen/Qwen3.8-27B, por lo que hereda la arquitectura del modelo base: un transformer de 27.320.697.856 parametros con cabeza de prediccion multi-token (MTP) incorporada, que habilita decodificacion especulativa con un flag estandar de llama.cpp. No se trata de un reentrenamiento ni de un ajuste fino supervisado: la modificacion consiste en una edicion de pesos con la herramienta jBlaze, orientada a acortar las generaciones largas reduciendo el numero de tokens de salida.

El autor no documenta el volumen de datos de entrenamiento ni la composicion del dataset, porque no hay entrenamiento en el sentido habitual. Lo que si publica es un control de deriva distribucional medido antes de la release: divergencia KL de 0,022477 frente a una referencia Q8_0 (techo preregistrado de 0,027788) y un delta de perplexity de 0,049245 (techo de 0,057469). La innovacion tecnica destacable es, por tanto, doble: la edicion de pesos que comprime la longitud de las respuestas y el aprovechamiento de la cabeza MTP del modelo base para acelerar la decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional y de formato largo, con soporte de plantillas de chat (tag `conversational`).
- Razonamiento, matematicas, conocimiento general y ciencia: la evaluacion sellada del autor cubre estas cuatro areas, con una precision del 95,88 sobre 100.
- Salida estructurada: la evaluacion incluye items de structured output, lo que indica que el modelo mantiene la capacidad de generar JSON u otros formatos pautados.
- Compatibilidad con endpoints: el repositorio incluye el tag `endpoints_compatible`, por lo que puede servirse a traves de la infraestructura de Hugging Face.
- Decodificacion especulativa mediante la cabeza MTP integrada, activable con `--spec-type draft-mtp` en llama.cpp.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte explicito de tool calling, agentes o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de respuestas largas en local: el modelo esta disenado para reducir el tiempo hasta la respuesta completa en generaciones extensas (un 28 % menos de tokens de salida), por lo que encaja en asistentes que redactan documentos, informes o explicaciones de varios parrafos en una sola GPU de 24 GB.
- Inferencia en estaciones de trabajo con una RTX 3090: los pesos ocupan unos 16 GB y el resto del presupuesto de VRAM se dedica a cache KV, lo que permite ejecutar el modelo en hardware consumer de gama alta sin infraestructura adicional.
- Despliegue en llama.cpp sin fork: al cargar en la build estandar 10630 (commit d222767c7), se integra en pipelines existentes basados en llama.cpp sin recompilar ni mantener parches.
- Reduccion de la cola de latencia en servicios interactivos: con el flag MTP activado, el p90 baja de 14,891 s a 9,651 s, lo que mejora la experiencia en aplicaciones donde la respuesta lenta de cada diez es la que penaliza la percepcion de calidad.
- Evaluacion comparativa de tecnicas de edicion de pesos: sirve como referencia reproducible para investigadores que quieran medir el impacto de jBlaze frente al modelo vanilla con y sin decodificacion especulativa, usando la misma instrumentacion descrita en la model card.
- Tareas de conocimiento y ciencia con salida estructurada: la evaluacion incluye items de structured output, por lo que puede emplearse en extraccion de datos o generacion de JSON en flujos internos donde la precision medida (95,88) sea aceptable frente al original (96,47).

## Benchmarks y rendimiento

Evaluacion sellada de 85 items (matematicas, conocimiento, ciencia y salida estructurada), dos semillas agrupadas, 170 generaciones por brazo, mismos prompts y ajustes, ejecutada de forma consecutiva en llama.cpp build 10630 (commit d222767c7) sobre una RTX 3090. Los tiempos son de reloj de pared hasta la respuesta completada.

| Modelo | Media | p90 | Decodificacion bruta | Precision |
|---|---|---|---|---|
| Qwen3.8-27B Q4_K_M vanilla | 10,249 s | 14,891 s | 38,12 tok/s | 96,47 |
| Qwen3.8-27B Q4_K_M vanilla + flag MTP | 9,058 s | 12,583 s | 48,41 tok/s | 95,88 |
| Qwen3.8-27B-jBlaze | 7,408 s | 12,817 s | 38,48 tok/s | 95,88 |
| Qwen3.8-27B-jBlaze + flag MTP | 7,505 s | 9,651 s | 47,93 tok/s | 95,29 |

Referencia adicional medida con el mismo instrumento:

| Modelo | Media | p90 | Precision |
|---|---|---|---|
| Thinklite-27B Q4_K_M (publico) | 5,985 s | 11,878 s | 96,47 |

Segun el autor, sin flags la media es 1,38x mas rapida que el vanilla (28 % menos de tiempo) y, con el flag MTP, el p90 es 1,54x mas rapido que el vanilla sin flag (35 % menos de tiempo). La contribucion propia de la edicion, medida contra el vanilla con el mismo flag MTP, es de 0,829x en media y 0,767x en p90, con la mediana practicamente sin cambios (ratio mediano emparejado de 1,005). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB para los pesos en Q4_K_M; el resto del presupuesto hasta 24 GB se emplea como cache KV, que crece con la longitud de contexto (las pruebas generaron hasta 8192 tokens dentro de ese margen).
- GPU recomendadas: RTX 3090 (hardware usado en todas las mediciones); cualquier GPU con 24 GB o mas de VRAM, como RTX 4090, A100 o H100, deberia poder alojar el modelo con mayor margen para cache KV.
- Cabe en GPU consumer de gama alta con 24 GB; no se documenta su comportamiento en GPUs de 16 GB o menos.
- Opciones de despliegue: llama.cpp (build 10630, commit d222767c7, probado); Ollama y LM Studio no han sido probados segun el autor; el tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput medidos en una RTX 3090: 38,48 tok/s de decodificacion bruta sin flags y 47,93 tok/s con el flag MTP; tiempo medio hasta la respuesta de 7,408 s sin flags y 7,505 s con MTP, con p90 de 12,817 s y 9,651 s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media (s) | p90 (s) | Precision | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Qwen3.8-27B-jBlaze | 27,32 B | no disponible | 7,408 | 12,817 | 95,88 | Apache-2.0 | GGUF Q4_K_M |
| Qwen3.8-27B-jBlaze + MTP | 27,32 B | no disponible | 7,505 | 9,651 | 95,29 | Apache-2.0 | GGUF Q4_K_M |
| Qwen3.8-27B vanilla Q4_K_M | 27,32 B | no disponible | 10,249 | 14,891 | 96,47 | Apache-2.0 | GGUF Q4_K_M |
| Thinklite-27B Q4_K_M | no disponible | no disponible | 5,985 | 11,878 | 96,47 | no disponible | GGUF Q4_K_M |

Frente al modelo base, jBlaze mejora la media y el p90 sin flags, a costa de 0,59 puntos de precision. Frente a Thinklite-27B, el modelo sin flags es mas lento tanto en media como en p90; con el flag MTP su p90 (9,651 s) queda por debajo del de Thinklite (11,878 s), aunque su media (7,505 s) sigue siendo superior. No se dispone de datos de contexto, licencia ni otros benchmarks de Thinklite en la informacion proporcionada.

## Limitaciones y advertencias

- El autor reconoce que no alcanza el objetivo de 2x de velocidad: la mediana de latencia es practicamente identica a la del vanilla y las ganancias se concentran en generaciones largas.
- La precision cae 0,59 puntos en la evaluacion sellada (95,88 frente a 96,47). En un conjunto de control general de 80 items la precision fue superior a la del vanilla (81,25 frente a 78,75), con un fallo de entrega adicional (4 frente a 3), pero el dato principal de la eval sellada es peor.
- Con el flag MTP activado, las salidas no estan garantizadas como identicas byte a byte a las ejecuciones sin el; el autor lo atribuye a la ruta de decodificacion especulativa, no a la edicion.
- Deriva distribucional acotada pero existente: divergencia KL de 0,022477 y delta de perplexity de 0,049245 frente a la referencia Q8_0, dentro de los techos preregistrados.
- Solo se ha probado en llama.cpp build 10630 (commit d222767c7); Ollama y LM Studio no han sido validados.
- No se documentan sesgos conocidos, idiomas soportados ni comportamiento en contextos superiores a 8192 tokens.
- Licencia Apache-2.0, igual que el modelo base, por lo que el uso comercial esta permitido en los mismos terminos; al ser una obra derivada, conviene conservar los avisos de atribucion correspondientes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card no incluye validacion independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Qwen3.8-27B-jBlaze
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp (runtime probado, build 10630, commit d222767c7): no disponible como enlace en la informacion proporcionada
- Thinklite-27B (referencia comparativa): no disponible como enlace en la informacion proporcionada
- Paper o blog de jBlaze: no disponible en la informacion proporcionada
