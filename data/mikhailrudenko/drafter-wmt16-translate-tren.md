# MikhailRudenko/drafter-wmt16-translate-tren

## Resumen

El modelo `MikhailRudenko/drafter-wmt16-translate-tren` es un *draft model* (modelo borrador) de dominio especifico disenado para decodificacion especulativa en tareas de traduccion de turco a ingles. Lo desarrolla Mikhail Rudenko como parte del proyecto de investigacion "Domain-Aware Speculative Decoding", cuya hipotesis es que un borrador especializado por dominio alcanza tasas de aceptacion superiores a las de un unico borrador generico. Se apoya en la arquitectura `MistralForCausalLM` con 156.519.168 parametros (aproximadamente 156M) y un repositorio de solo 0,3 GB en precision bfloat16.

El modelo se entrena mediante destilacion de conocimiento desde un modelo objetivo concreto: `TurboSparse-Mistral-Instruct` (7B, implementado con `BambooForCausalLM`). La funcion de perdida combina entropia cruzada sobre la secuencia greedy con divergencia KL sobre las distribuciones top-10 del objetivo, y se ajusta sobre 28.500 muestras sinteticas del cluster `wmt16_translate_tren_10templates` del dataset Flan. Su relevancia actual reside en que cuantifica empiricamente el beneficio de especializar el borrador por dominio e idioma en lugar de reutilizar un borrador generalista, un aspecto poco explorado en la literatura de decodificacion especulativa.

Se trata de un componente de infraestructura, no de un modelo conversacional autonomo: no esta pensado para usarse de forma aislada, sino acoplado al modelo objetivo con el que fue destilado. Esta especializado en un unico par de idiomas (turco a ingles) y su ventana de contexto no viene documentada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM (transformer decoder-only) |
| Parametros totales | 156.519.168 (~156M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) y turco (tr); dominio de especializacion: traduccion turco → ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |
| Modelo base | MikhailRudenko/drafter-mixed-ut (a su vez derivado de Felladrin/Lite-Mistral-150M-v2-Instruct) |
| Modelo objetivo | TurboSparse-Mistral-Instruct (7B, BambooForCausalLM) |
| Tamano del repositorio | 0,3 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo Mistral con aproximadamente 156M de parametros, derivado de `Lite-Mistral-150M-v2-Instruct` y ajustado previamente como `drafter-mixed-ut` antes de la especializacion final. No emplea mezcla de expertos ni mecanismos de estado recurrente: es un modelo denso convencional, lo que mantiene el coste de inferencia muy bajo y permite ejecutarlo conjuntamente con el modelo objetivo de 7B sin apenas sobrecarga de memoria.

El entrenamiento combina destilacion de conocimiento y aprendizaje supervisado: la perdida es `0.5 × CrossEntropy + 0.5 × KL-divergence (T=1.0)`, donde la entropia cruzada se calcula sobre la secuencia greedy (trunk) y la divergencia KL sobre las distribuciones top-10 del modelo objetivo. Se utilizaron 28.500 muestras sinteticas y 1.500 muestras de validacion (5% reservado), con 10 epocas (la perdida se estabiliza alrededor de la epoca 5), tamano de lote 32, tasa de aprendizaje 5e-5 con schedule coseno y 3% de warmup. El mejor checkpoint fue `checkpoint-8010`, con `eval_loss` de 1,998 y `top1_accuracy` del 54,91%. Todo el ajuste se realizo en una unica RTX 3090 de 24 GB. La innovacion tecnica no esta en la arquitectura, sino en la estrategia de especializacion por dominio y en el uso de las distribuciones top-10 del objetivo como etiquetas suaves.

## Capacidades

- Generacion de texto en ingles y turco, orientada a la traduccion turco → ingles.
- Decodificacion especulativa: propone tokens candidatos que el modelo objetivo de 7B verifica, reduciendo el numero de pasos de decodificacion necesarios.
- Prediccion de distribuciones de tokens alineadas con el objetivo gracias a la destilacion con KL-divergence sobre el top-10.
- Generacion conversacional basica (etiqueta `conversational` en los metadatos del repositorio), heredada de la base instructiva.
- No dispone de soporte documentado de *tool calling* ni de *function calling*.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni de modo "thinking" explicito.
- Capacidad multilingue limitada a los dos idiomas declarados (ingles y turco).

## Casos de uso

- Aceleracion de traduccion turco → ingles en produccion: el borrador propone secuencias de tokens que el objetivo TurboSparse-Mistral-Instruct verifica en paralelo, de modo que la latencia por token generado se reduce en funcion de la tasa de aceptacion, que en validacion alcanza un `top1_accuracy` del 54,91%.
- Servicio de traduccion de documentacion tecnica turca: al estar ajustado sobre el cluster `wmt16_translate_tren`, el borrador reproduce el estilo y el vocabulario de ese dominio, lo que lo hace adecuado para traducir manuales, articulos y notas tecnicas de turco a ingles.
- Pipelines de localizacion de contenido: integrado en un flujo de traduccion por lotes (subtitulos, articulos, fichas de producto) junto al modelo objetivo, reduciendo el coste por lote sin modificar la calidad final, ya que la verificacion la realiza siempre el modelo grande.
- Pre-traduccion en sistemas RAG multilingues: cuando las consultas de los usuarios llegan en turco, el par borrador + objetivo puede traducirlas a ingles antes de la recuperacion vectorial, manteniendo la coherencia con documentos indexados en ingles.
- Despliegue en hardware de gama de consumo: con un peso de aproximadamente 0,3 GB en bfloat16, el borrador cabe holgadamente en cualquier GPU de consumo y permite plantear escenarios de traduccion asistida en estaciones de trabajo con una sola GPU.
- Investigacion en decodificacion especulativa: sirve como punto de comparacion controlado frente a `drafter-mixed-ut` y a los demas borradores por idioma del proyecto, permitiendo medir el efecto de la especializacion por dominio con el mismo objetivo.
- Atencion al cliente en turco con salida en ingles: en escenarios donde el agente debe responder en ingles a clientes que escriben en turco, el par borrador + objetivo ofrece generacion multi-turno con latencia reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento facilitados por el autor son las metricas de validacion del propio entrenamiento y la comparacion con los demas borradores del proyecto:

| Modelo | Dominio | eval_loss | top1_accuracy |
|---|---|---|---|
| drafter-understanding | Comprension (31 clusters) | 2,100 | 65,00% |
| drafter-text-reformulation | Reformulacion de texto (11 clusters) | 2,151 | 54,34% |
| drafter-mixed-ut | Mixto U+T (42 clusters) | 2,085 | 59,50% |
| **drafter-wmt16-translate-tren** | **Turco → ingles** | **1,998** | **54,91%** |
| drafter-wmt16-translate-deen | Aleman → ingles | 2,307 | 52,77% |
| drafter-wmt16-translate-ruen | Ruso → ingles | 2,363 | 50,04% |
| drafter-wmt16-translate-csen | Checo → ingles | 2,260 | 49,96% |
| drafter-wmt16-translate-fien | Finés → ingles | 2,252 | 49,36% |

Dentro del subconjunto de borradores de traduccion de WMT16, este modelo presenta el menor `eval_loss` (1,998) y la mayor `top1_accuracy` (54,91%). No obstante, no se han publicado tasas de aceptacion medidas en un bucle real de decodificacion especulativa, por lo que el beneficio efectivo en latencia no esta cuantificado en la informacion disponible.

## Requisitos de hardware

- VRAM para el borrador: aproximadamente 0,31 GB solo para los pesos en bfloat16; en la practica, entre 1 y 2 GB con tokenizador, cache KV y overhead del runtime (estimacion).
- VRAM total del sistema: hay que sumar el modelo objetivo TurboSparse-Mistral-Instruct de 7B, lo que en bfloat16 supone del orden de 14 GB adicionales solo en pesos; el conjunto completo requiere una GPU de 24 GB o superior en precision completa (estimacion).
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 para el conjunto borrador + objetivo; cualquier GPU consumer con mas de 2 GB libres puede alojar el borrador aislado.
- Cabe en GPU de consumo: si, el borrador por si solo cabe en cualquier GPU consumer, e incluso en CPU. El par completo con el objetivo de 7B requiere al menos una GPU de 16-24 GB o cuantizacion del objetivo.
- Opciones de despliegue: carga directa con `transformers` (`AutoModelForCausalLM.from_pretrained`), tal como documenta el autor. El soporte en vLLM, TGI, llama.cpp u Ollama no esta documentado en la informacion disponible, y la dependencia de un objetivo no estandar (`BambooForCausalLM`) puede limitar la compatibilidad con motores de decodificacion especulativa genericos.
- Latencia y throughput: no disponibles. El autor solo reporta `eval_loss` y `top1_accuracy`; no se publican mediciones de tokens por segundo ni de factor de aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | eval_loss | top1_accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| drafter-wmt16-translate-tren | ~156M | Turco → ingles | 1,998 | 54,91% | Apache 2.0 | HuggingFace |
| drafter-wmt16-translate-deen | ~156M (no confirmado) | Aleman → ingles | 2,307 | 52,77% | Apache 2.0 | HuggingFace |
| drafter-wmt16-translate-ruen | ~156M (no confirmado) | Ruso → ingles | 2,363 | 50,04% | Apache 2.0 | HuggingFace |
| drafter-mixed-ut | ~156M (no confirmado) | Mixto U+T (42 clusters) | 2,085 | 59,50% | Apache 2.0 | HuggingFace |

Los tres modelos comparables pertenecen al mismo proyecto y comparten base, licencia y formato. La diferencia principal es el dominio de especializacion: los borradores por idioma logran menor `eval_loss` que el borrador mixto, pero `drafter-mixed-ut` presenta una `top1_accuracy` superior (59,50%) por su cobertura mas amplia de tareas. No se dispone de datos sobre la longitud de contexto de ninguno de ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo. El entrenamiento sobre un cluster acotado del dataset Flan y sobre muestras sinteticas generadas por el propio modelo objetivo puede heredar los sesgos de este ultimo y los del corpus WMT16.
- Riesgo de alucinacion: en un borrador de decodificacion especulativa el riesgo se mitiga porque el modelo objetivo verifica cada token propuesto; sin embargo, si se utiliza el borrador de forma autonoma, no existe ninguna garantia de fidelidad respecto a la fuente traducida.
- Limitaciones de idioma: solo cubre ingles y turco. No debe emplearse con otros pares de idiomas, ya que su especializacion es estricta y su rendimiento fuera de dominio no esta evaluado.
- Limitacion de contexto: la longitud de contexto no esta documentada, lo que impide dimensionar con seguridad casos de uso con entradas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya la autoria. No se documentan clausulas adicionales.
- Dependencia del modelo objetivo: el borrador fue destilado contra TurboSparse-Mistral-Instruct (7B, BambooForCausalLM). Usarlo con otro objetivo invalida la premisa de alineacion de distribuciones y probablemente reduce la tasa de aceptacion.
- Metadatos incompletos: no se especifican contexto, cuantizaciones disponibles, ni compatibilidad con motores de inferencia estandar, lo que complica su integracion directa en produccion.
- Sin benchmarks publicos: al no haber resultados en tareas estandar, no es posible compararlo de forma objetiva con otros borradores fuera de su propio proyecto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en comunidad ni de validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MikhailRudenko/drafter-wmt16-translate-tren
- Modelo base: https://huggingface.co/MikhailRudenko/drafter-mixed-ut
- Base original: https://huggingface.co/Felladrin/Lite-Mistral-150M-v2-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/MikhailRudenko/domain-aware-sd-synthetic
- Borrador de comprension: https://huggingface.co/MikhailRudenko/drafter-understanding
- Borrador de reformulacion de texto: https://huggingface.co/MikhailRudenko/drafter-text-reformulation
- Paper del proyecto "Domain-Aware Speculative Decoding": no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible

Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; los resultados obtenidos trataban sobre dispositivos iPhone y no guardan relacion con la ficha.
