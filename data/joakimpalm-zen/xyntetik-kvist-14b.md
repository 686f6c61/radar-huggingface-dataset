# Joakimpalm-Zen/Xyntetik-Kvist-14B

## Resumen

Xyntetik-Kvist-14B es un modelo de lenguaje denso de 14.443.781.760 parámetros desarrollado por Joakimpalm-Zen. No es una copia cuantizada de otro modelo, sino un modelo nuevo obtenido mediante poda estructurada de anchura (*width pruning*) sobre el modelo de lenguaje de Muse-Glimmer-30B, seguida de una fase de destilación desde el padre congelado en BF16 y una fase posterior de ajuste sobre trayectorias agénticas. Conserva las 52 capas del padre, pero reduce la anchura oculta de 6.656 a 5.760, la FFN de 19.968 a 10.240 y las cabezas de atención de 32 a 24 (con 2 cabezas KV). Es un modelo exclusivamente de texto: no incorpora el codificador visual de 1,92 B parámetros del padre.

El modelo está orientado a cargas agénticas con llamada a herramientas. Según la model card, se sirve con Xyntetik Runner v0.5.7 o posterior y escribe el formato de cable `muse` del runner: 199 de 200 primeros turnos bien formados y 99 de 99 llamadas a herramienta válidas contra el esquema ofrecido. En tareas de bucle cerrado sobre un entorno ejecutable, resuelve 57 de 60 tareas retenidas, frente a 60 del padre y 0 del estudiante antes de la fase agéntica.

Su relevancia práctica es doble: por un lado, documenta un protocolo de evaluación preregistrado (puerta de envolvente) poco habitual en modelos abiertos; por otro, ofrece pesos BF16 y GGUF (Q8_0, Q5_0-mix) que permiten ejecución local en tarjetas de 24 GB. La licencia es Apache 2.0. La longitud de contexto no se publica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, destilado por poda de anchura del modelo de lenguaje de Muse-Glimmer-30B |
| Parámetros totales | 14.443.781.760 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (28,9 GB), GGUF Q8_0 (15,4 GB), GGUF Q5_0-mix (10,3 GB); el repositorio principal usa safetensors |
| Idiomas soportados | no disponible (la model card no publica lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 28,9 GB) y GGUF (repositorio Xyntetik-Kvist-14B-GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso derivado por poda de anchura del modelo de lenguaje de Muse-Glimmer-30B. Se conservan íntegras las 52 capas, pero se estrechan las dimensiones internas: anchura oculta de 6.656 a 5.760, FFN de 19.968 a 10.240, cabezas de atención de 32 a 24 y 2 cabezas KV. El resultado son 14,44 B de parámetros frente a los 27,9 B del modelo de lenguaje del padre, aproximadamente el 52 %. El codificador visual de 1,92 B parámetros del padre no se transfiere, por lo que el modelo es solo texto.

El entrenamiento se realizó en dos fases. La primera es una destilación desde el padre congelado en BF16 durante 6.000 pasos (98,3 millones de tokens, 162 horas). La segunda añade 1.440 pasos sobre trayectorias agénticas escritas en el formato de cable `muse` de Xyntetik Runner. Los corpus declarados incluyen HuggingFaceTB/smoltalk, allenai/tulu-3-sft-mixture y Salesforce/wikitext, además del registro de entrenamiento propio del autor. La model card no menciona uso de RLHF ni de DPO. El autor subraya que en los corpus de la fase de destilación general no había documentos de llamada a herramientas, de modo que la capacidad de *tool calling* procede únicamente de la fase agéntica.

## Capacidades

- Generación de texto conversacional en formato de chat (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Llamada a herramientas: 99 de 99 llamadas válidas contra el esquema ofrecido en la puerta de evaluación.
- Escritura del formato de cable `muse` de Xyntetik Runner: 199 de 200 primeros turnos bien formados.
- Razonamiento multi-turno de bucle cerrado: 57 de 60 tareas retenidas del entorno ejecutable del estudio, evaluadas por reejecución contra la verdad de referencia.
- Turnos de razonamiento con presupuesto variable: media de 154 tokens de pensamiento por turno (147 con la protección de bucle activada).
- Compatibilidad con la protección de bucle (`--loop-guard`) de Xyntetik Runner v0.5.7, que cierra turnos de razonamiento que empiezan a repetirse.
- Trabajo en modo greedy recomendado, con `repeat_penalty` fijado en 1,0 para no corromper los tokens de esquema de una llamada.
- Sin capacidades de visión: el codificador visual del padre no se ha portado.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Agentes de llamada a herramientas autoalojados: el modelo se sirve con Xyntetik Runner v0.5.7 o posterior y genera llamadas que validan contra el esquema ofrecido (99 de 99 en la puerta), lo que permite construir agentes que ejecutan acciones sobre APIs locales sin depender de un proveedor externo.
- Automatización de tareas en entornos ejecutables: con 57 de 60 tareas de bucle cerrado resueltas, encaja en escenarios donde el agente debe inspeccionar un entorno, actuar y verificar el resultado por reejecución, como scripts de mantenimiento o pruebas automatizadas.
- Despliegue en estación de trabajo con GPU de 24 GB: los ficheros Q8_0 (15,4 GB) y Q5_0-mix (10,3 GB) caben enteros y se ejecutan con residencia completa en GPU, lo que habilita asistentes locales para código y operaciones sin salida de datos a la nube.
- Evaluación de pipelines de destilación por poda: el estudio publica preregistros, manifiestos de corpus y registros de la puerta de envolvente, por lo que sirve como referencia reproducible para investigadores que midan KLD y top-1 con margen cualificado frente a un padre BF16.
- Generación de texto conversacional con contexto gestionado por el runner: el modelo mantiene turnos multi-step gestionados por Xyntetik Runner, útil para asistentes internos donde el estado se conserva entre peticiones.
- Investigación sobre bucles de razonamiento: con la protección de bucle activada, el modelo permite estudiar el efecto de truncar cadenas repetitivas (en la puerta, redujo los tokens de pensamiento de 154 a 147 sin alterar la puntuación de 58 de 60).
- Prototipado de agentes en CPU: la model card reporta la medición de la puerta en Q8_0 sobre CPU con el binario de la versión v0.5.7, lo que indica viabilidad de ejecución sin GPU para pruebas funcionales, aunque sin datos de latencia publicados.

## Benchmarks y rendimiento

| Métrica | Xyntetik-Kvist-14B | Padre Muse-Glimmer-30B (BF16) | Estudiante antes de la fase agéntica |
|---|---|---|---|
| KLD en 45.056 posiciones held-out | 0,762 | referencia | no disponible |
| Top-1 con margen cualificado | 84,0 % | no disponible | no disponible |
| Top-1 (segundo valor citado en la model card) | 79,2 % | no disponible | no disponible |
| Tareas de bucle cerrado resueltas (60) | 57 | 60 | 0 |
| Primeros turnos bien formados en formato `muse` | 199 de 200 | no aplica | no aplica |
| Llamadas a herramienta válidas | 99 de 99 | no aplica | no aplica |
| Tareas con protección de bucle (Q8_0, CPU) | 58 de 60 | no aplica | no aplica |
| Tareas sin protección de bucle (Q8_0, CPU) | 58 de 60 | no aplica | no aplica |
| Tasa de terminación | 98,3 % | no disponible | no disponible |
| Tokens de pensamiento medios | 154 (147 con protección) | no disponible | no disponible |

El autor indica explícitamente que estos números corresponden a la fila propia de un estudiante y que no aplican el umbral interno del proyecto para copias cuantizadas (KLD ≤ 0,05 y top-1 con margen cualificado ≥ 97 %), ya que el modelo conserva solo 14,4 B de los 27,9 B de parámetros del modelo de lenguaje del padre. En un checkpoint anterior del estudio (intento 8, runner 53b4deb) la protección de bucle elevó la puntuación de 51 a 54 sobre 60 al terminar 3 de 6 desbocamientos.

## Requisitos de hardware

- BF16 (28,9 GB): no cabe entero en una tarjeta de 24 GB. El autor lo sirvió con 38 de las 52 capas en GPU y el resto descargado, mediante `--gpu auto --gpu-layers 38`.
- Q8_0 (15,4 GB): cabe entero en una GPU de 24 GB y se ejecuta con residencia completa en GPU.
- Q5_0-mix (10,3 GB): cabe entero en una GPU de 24 GB con margen amplio; también es viable en tarjetas de 16 GB según el tamaño del contexto.
- GPU recomendadas: no disponible. La información proporcionada no nombra modelos concretos (A100, H100, RTX 4090 u otros).
- Ejecución en CPU: documentada para la medición de la puerta con Q8_0, pero sin datos de latencia ni de throughput.
- Opciones de despliegue: Xyntetik Runner v0.5.7 o posterior, con los ficheros GGUF publicados en el repositorio Xyntetik-Kvist-14B-GGUF. La model card no documenta otros motores de inferencia.
- Latencia y throughput: no disponible.
- Ajuste recomendado: `repeat_penalty` en 1,0 siempre que la salida pueda contener una llamada a herramienta, y activación de `--loop-guard` para acotar turnos que se repiten.
- Se han publicado mediciones sobre Runner main 0bfa2ad (brazos de puerta E1, E2, E3 y E5) y sobre 53b4deb, ac5418e y el binario de la versión v0.5.7 (mediciones de servido); los dos primeros commits están contenidos en v0.5.7.

## Comparativa con modelos similares

| Modelo | Parámetros | Visión | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xyntetik-Kvist-14B | 14.443.781.760 (denso, solo texto) | No | no disponible | Apache 2.0 | HuggingFace (0 descargas, 0 likes en el momento del registro) |
| Muse-Glimmer-30B (padre) | 27,9 B en el modelo de lenguaje + 1,92 B en el codificador visual | Sí | no disponible | no disponible | HuggingFace |
| Alternativas de terceros de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye otros modelos comparables. La model card solo establece la comparación con el padre, y el autor insiste en que el modelo no debe medirse con el umbral reservado a copias cuantizadas.

## Limitaciones y advertencias

- No es una copia cuantizada: es un modelo nuevo con aproximadamente el 52 % de los parámetros del modelo de lenguaje del padre, de modo que la degradación frente al padre es esperable y declarada (KLD 0,762 frente al umbral interno de 0,05).
- El propio autor acota la afirmación sobre *tool calling* al entorno y a la ruta de servido del estudio. No se reclama ninguna capacidad de llamada a herramientas derivada de la destilación general, porque los corpus de esa fase no contenían documentos de *tool calling*.
- La protección de bucle cierra el turno, no resuelve la tarea: si el modelo entra en bucle porque no tiene la respuesta, la salida resultante sigue siendo incorrecta.
- La protección de bucle no detecta repeticiones que cruzan peticiones. La model card documenta un caso en un checkpoint anterior (intento 8) en el que el modelo tenía la respuesta en su razonamiento y aun así llamó tres veces a la misma herramienta con el mismo argumento, con cada turno bien formado de forma individual.
- Un `repeat_penalty` distinto de 1,0 actúa sobre los tokens de esquema que una llamada debe repetir; el efecto solo aparece al muestrear con temperatura superior a 0.
- No se publican datos de sesgo, de evaluación multilingüe ni de idiomas soportados. La ausencia de una lista de idiomas es un riesgo directo para despliegues en castellano u otras lenguas.
- La longitud de contexto no se especifica, lo que impide dimensionar con precisión cargas con historiales largos.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo conserva el 52 % de los parámetros del padre, lo que en la práctica suele aumentar la tasa de error frente a la referencia.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base declarado (meta-models/Muse-Glimmer-30B) no publica licencia en la información disponible, lo que conviene verificar antes de un despliegue comercial.
- Disponibilidad mínima: el repositorio registra 0 descargas y 0 likes, y la página de colección «Xyntetik Kvist» estaba en creación en el momento del registro. El soporte de la comunidad es inexistente.
- Requisito de servidor específico: las mediciones de la puerta se realizaron con Xyntetik Runner; fuera de esa ruta de servido no hay garantías publicadas.
- No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Joakimpalm-Zen/Xyntetik-Kvist-14B
- Ficheros GGUF: https://huggingface.co/Joakimpalm-Zen/Xyntetik-Kvist-14B-GGUF
- Registro de entrenamiento (preregistros K1 a K3, registros de la puerta de envolvente, manifiestos de corpus y código): https://huggingface.co/datasets/Joakimpalm-Zen/Xyntetik-Kvist-14B-training-record
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Runner de servido: https://github.com/Joakimpalm-Zen/xyntetik-runner
- Referencias arXiv citadas en las etiquetas del repositorio: arxiv:2408.11796 y arxiv:2602.01997
- Corpus declarados: HuggingFaceTB/smoltalk, allenai/tulu-3-sft-mixture, Salesforce/wikitext

Nota: las búsquedas web realizadas para esta ficha no devolvieron ningún resultado relacionado con el modelo, su autor o su familia; los enlaces anteriores son los únicos verificables a partir de la información proporcionada.
