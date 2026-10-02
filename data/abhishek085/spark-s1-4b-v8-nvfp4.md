# abhishek085/spark-s1-4b-v8-nvfp4

## Resumen

`spark-s1-4b-v8-nvfp4` es un modelo de decision de tipo System-1 publicado por el usuario abhishek085 dentro del proyecto Open Spark Jev, de la comunidad Nokast AI. A diferencia de un modelo generativo convencional, recibe un estado (texto o JSON) junto con una pregunta tipada y un conjunto de opciones definidas en tiempo de peticion, y devuelve en una sola pasada hacia delante una probabilidad para cada opcion mas una confianza. No genera texto: la respuesta es el softmax de los logits del primer token restringido a las letras de las opciones, dividido por una temperatura.

El modelo parte del backbone Qwen3.5-4B, afinado con LoRA (r=16, fusionado en los pesos) y publicado unicamente en cuantizacion NVFP4 aplicada solo a las capas MLP. El repositorio contiene 3.073.289.216 parametros segun los safetensors (unos 3,07 B) y ocupa 4,9 GB de pesos, 5,2 GB de repositorio. La version v8 es una media de pesos 50/50 entre el checkpoint `spark-s1-4b-v6` y un nuevo entrenamiento SFT sobre una mezcla de datos mas amplia, con una temperatura de calibracion reajustada.

La relevancia de esta release esta en su orientacion a decisiones de arnes de agente: eleccion de herramienta, `finish`, llamar o preguntar al usuario, evaluacion de riesgo de comandos de terminal y cribado de salidas de herramientas frente a inyeccion de prompt. Frente a v6 mejora la calibracion (las respuestas erroneas con confianza >=0,9 caen del 21 al 11 en JevBench-hard y del 14,6-14,8% al 0,2-1,6% en los conjuntos de agente), pero no mejora la precision general: en JevBench-hard v8-nvfp4 obtiene 0,586 frente a 0,622 de v6-nvfp4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (backbone Qwen3.5-4B) con LoRA r=16 fusionado; sin cabeza adicional, lectura por logits del primer token |
| Parametros totales | 3.073.289.216 (~3,07 B) segun safetensors |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | NVFP4 (solo capas MLP); existe un build bf16 evaluado internamente pero no publicado |
| Idiomas soportados | no disponible (entrada no en ingles no evaluada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Otros datos: pipeline declarado `text-classification`; libreria `transformers`; etiquetas `modelopt` y `endpoints_compatible`; tamano de pesos 4,9 GB; creado el 2026-10-02.

## Arquitectura y entrenamiento

La arquitectura es la del backbone Qwen3.5-4B, un transformer decoder, sobre el que se aplica un ajuste fino supervisado con LoRA de rango 16 que despues se fusiona en los pesos. No hay cabeza de clasificacion adicional: el modelo reutiliza los logits del primer token de la secuencia y aplica un softmax restringido al conjunto de letras de opcion (hasta 26 opciones), escalado por una temperatura calibrada. La v8 no introduce cambios de arquitectura ni de forma de los tensores respecto a v6.

El entrenamiento de v8 consiste en una media de pesos 50/50 entre `spark-s1-4b-v6` y un nuevo run de SFT sobre una mezcla de datos mas amplia, seguida de un reajuste de la temperatura escalar de calibracion (2,5 en v8 frente a 1,481 en el build publicado de v6). La model card cita los conjuntos `nvidia/When2Call`, `MadeAgents/xlam-irrelevance-7.5k`, `Team-ACE/ToolACE` y `Lakera/gandalf_ignore_instructions`; el componente v6 mantiene sin cambios sus datos, descritos en la model card con la cifra 11.792 (dato truncado en la informacion disponible). Las filas que superaban el limite de longitud de entrenamiento se descartaron, por lo que los documentos de mas de unos 2.000 tokens no forman parte de los datos nuevos. No se documentan fases de RLHF ni DPO.

## Capacidades

- Decision de opcion multiple: devuelve probabilidad por opcion y una confianza en una sola pasada, para preguntas de tipo Choice (hasta 26 opciones), Score (niveles ordenados) y Boolean.
- Siguiente accion en un bucle de agente: elegir la siguiente herramienta de una lista declarada y del historial de pasos, incluyendo `finish` y `clarify`.
- Gating de llamadas a herramienta: decidir entre llamar a una herramienta, pedir al usuario un argumento que falta o concluir que ninguna herramienta listada encaja.
- Seleccion de herramienta entre hasta 12 candidatos.
- Evaluacion de riesgo de comandos de terminal bajo un texto de politica explicito: solo lectura, mutacion, destructivo, privilegiado o exfiltracion.
- Cribado de salidas de herramientas: determinar si el resultado de una herramienta intenta instruir al agente (inyeccion de prompt) o es contenido ordinario.
- Familias programaticas de razonamiento generadas por codigo con variantes y formulaciones retenidas: effective dating, precedencia de politicas, probabilidad de muestreo, enrutado ambiguo y compromiso ponderado.
- Cobertura de 49 paquetes de tareas heredados de v6 mas los tipos nuevos de v8.
- No soporta generacion de texto, codigo, resumen, conversacion abierta ni razonamiento general.
- No soporta mas de 26 opciones, seleccion multiple, ranking ni entrada en idiomas distintos del ingles (no evaluado).

## Casos de uso

- Control de un agente local en bucle: antes de ejecutar cada paso, el modelo decide en una pasada si la siguiente accion es llamar a una herramienta concreta o `finish`, lo que evita el coste y la fragilidad de generar JSON y parsearlo con un modelo generativo.
- Gating de llamadas a herramienta con politica de privilegio minimo: dado un catalogo de herramientas y el historial, el modelo clasifica si procede llamar, pedir un argumento al usuario o rechazar por no encajar ninguna herramienta, con umbral de auto-permiso conservador.
- Enrutado hacia un modelo mayor o hacia una persona: cuando la confianza devuelta es baja, el sistema escala la decision; es util para decidir cuando derivar a un modelo mas capaz o a un operador humano.
- Evaluacion de riesgo de comandos de terminal: antes de ejecutar un comando en un entorno de CI/CD o en una maquina de desarrollo, se clasifica como solo lectura, mutacion, destructivo, privilegiado o exfiltracion segun una politica escrita, y se bloquea o escala en consecuencia.
- Cribado de inyeccion de prompt en salidas de herramientas: al recibir el resultado de una herramienta web o de un fichero, el modelo decide si el contenido intenta dirigir al agente fuera de la tarea del usuario, lo que permite descartarlo o marcarlo antes de incorporarlo al contexto.
- Moderacion de contenido con categorias fijas: al tratarse de una pregunta de eleccion con opciones definidas en la peticion, se puede reutilizar como clasificador de moderacion con umbrales calibrados, siempre que las categorias sean un conjunto cerrado pequeno.
- Decisiones de calendario y precedencia de politicas: las familias programaticas de effective dating y precedencia de politicas permiten resolver que norma o vigencia temporal aplica en un caso dado, util en flujos internos de compliance.
- Medicion de decisiones en una aplicacion tipo JevControl: al exponer probabilidad y confianza por opcion, sirve para auditar y medir el comportamiento de un arnes de agente en produccion en lugar de inspeccionar texto generado.

## Benchmarks y rendimiento

Datos publicados en la model card para v8 frente a v6 y al build bf16:

| Benchmark | v8-nvfp4 | v6-nvfp4 | bf16 |
|---|---|---|---|
| JevBench-hard (precision) | 0,586 | 0,622 | 0,595 (empate entre builds bf16) |
| JevBench-hard, respuestas erroneas con confianza >=0,9 (recuento) | 11 | 21 | no disponible |
| Conjuntos de agente mantenidos en reserva y publicos, erroneas con confianza >=0,9 | 0,2-1,6% | 14,6-14,8% | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- Pesos NVFP4 (solo MLP) de 4,9 GB; repositorio completo de 5,2 GB.
- La model card indica que el build publicado necesita una GPU de clase GB10/B200, es decir, hardware Blackwell con soporte de NVFP4.
- No se especifica compatibilidad con GPU de consumo; no hay datos publicados sobre RTX 4090 ni sobre generaciones anteriores (que no soportan NVFP4 de forma nativa).
- Opciones de despliegue: el modelo se publica para `transformers` y lleva las etiquetas `modelopt` y `endpoints_compatible`; no hay informacion disponible sobre soporte en vLLM, llama.cpp, Ollama o TGI para este build.
- Latencia y throughput: no disponibles. La ventaja declarada frente a un modelo generativo es la de una unica pasada hacia delante sin generacion de texto ni parseo de JSON, pero no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevBench-hard | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `spark-s1-4b-v8-nvfp4` | 3,07 B (safetensors) | no disponible | 0,586 | apache-2.0 | publicado en HuggingFace |
| `spark-s1-4b-v6-nvfp4` | no disponible | no disponible | 0,622 | no disponible en la informacion | publicado (release anterior) |
| Build bf16 de v8 | no disponible | no disponible | 0,595 | no disponible | no publicado |
| Qwen/Qwen3.5-4B (backbone) | no disponible | no disponible | no aplica (no es un modelo de decision) | no disponible en la informacion | publicado |

No se dispone de datos de otros modelos de decision comparables, como Jev de TypeSafe AI, que la model card menciona solo para aclarar que no existe afiliacion y que el metodo de entrenamiento es distinto.

## Limitaciones y advertencias

- No mejora la precision general respecto a v6: en JevBench-hard baja de 0,622 a 0,586; su aportacion es cobertura de tareas y calibracion.
- Los documentos largos no estan cubiertos: las filas por encima del limite de longitud de entrenamiento se descartaron, y no se valida para razonamiento sobre documentos de mas de unos 2.000 tokens.
- Las preguntas de documento largo y de aritmetica de calendario no mejoraron respecto a v6.
- La entrada en idiomas distintos del ingles no se ha evaluado.
- Limite de 26 opciones; no soporta seleccion multiple, ranking ni decisiones con mas opciones.
- Uso fuera de alcance: control unico de autorizacion para ejecutar herramientas, acciones de alto impacto sin humano en el bucle, conversacion abierta, codigo, razonamiento general, resumen, clasificacion de texto general (tema, sentimiento, NLI) y deteccion de vulnerabilidades en codigo (las versiones v3 y v4 quedaron cerca del azar en esa tarea).
- Riesgo de alucinacion: al ser un modelo de decision, el fallo se manifiesta como una opcion incorrecta con alta confianza; aunque la calibracion mejora en v8, sigue habiendo respuestas erroneas por encima de 0,9 de confianza.
- Sesgos: no disponibles en la informacion proporcionada.
- Licencia apache-2.0, sin restricciones de uso comercial documentadas en la informacion disponible.
- Es una release muy temprana y sujeta a cambios rapidos segun el propio autor.
- Para uso en produccion se recomienda situarla detras de comprobaciones de politica deterministas, privilegio minimo y aprobacion humana, con un umbral de auto-permiso conservador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhishek085/spark-s1-4b-v8-nvfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentacion de releases anteriores (v3, v4, v5, v6) y CHANGELOG: https://github.com/abhishek085/open-spark-jev/blob/main/docs/MODELS.md
- Repositorio del proyecto: https://github.com/abhishek085/open-spark-jev
- Dataset nvidia/When2Call: https://huggingface.co/datasets/nvidia/When2Call
- Dataset MadeAgents/xlam-irrelevance-7.5k: https://huggingface.co/datasets/MadeAgents/xlam-irrelevance-7.5k
- Dataset Team-ACE/ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- Dataset Lakera/gandalf_ignore_instructions: https://huggingface.co/datasets/Lakera/gandalf_ignore_instructions
