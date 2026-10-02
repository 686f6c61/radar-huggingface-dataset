# kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6.3

## Resumen

AliceAI-T5-35B-A0.6B · chat + tool-call LoRA v6.3 es un adaptador LoRA de tipo PEFT publicado por el usuario kaivoss sobre el modelo base yandex/AliceAI-T5-35B-A0.6B, un transformer encoder-decoder con mezcla de expertos dispersa de 35.000 millones de parametros totales y aproximadamente 0,6 millones de millones activos por token (35B-A0.6B). El modelo base carece de formato de chat, y este adaptador le ensena a conversar, a invocar herramientas cuando la tarea lo requiere, a responder en texto cuando no las necesita y a permanecer en silencio cuando no hay nada que responder.

La innovacion principal del adaptador es que todo objetivo de entrenamiento no silencioso comienza con un bloque `<think>...</think>`, de modo que el modelo siempre razona antes de responder. El entrenamiento se hizo con LoRA de rango 64 y alpha 64, sobre dos conjuntos de datos de SFT orientados a agentes: kaivoss/UltraData-SFT-Agent-2609-GLM53-20k y openbmb/UltraData-SFT-2605. El autor lo marca explicitamente como experimental y como la mejor version publicada hasta la fecha, con una mejora sustancial respecto a v6.1 (mismo conjunto de datos con rango 16) y v6.2 (cambio de mezcla de datos que regreso en calidad).

Es relevante ahora porque aborda un problema recurrente en agentes basados en modelos pequenos activos: la gestion correcta del ciclo conversacional con herramientas (decidir invocar, decidir no invocar, responder tras el resultado de una herramienta y callar cuando corresponde) sin recurrir a un modelo denso grande. Su licencia Apache 2.0 y su naturaleza de adaptador lo hacen facil de integrar sobre el base, aunque el repositorio no documenta la longitud de contexto, los tipos de cuantizacion ni resultados en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con mixture-of-experts disperso; etiquetado como ul2 en el modelo base |
| Parametros totales | 35B (modelo base yandex/AliceAI-T5-35B-A0.6B) |
| Parametros activos | 0,6B (modelo base, MoE disperso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (el adaptador se distribuye en safetensors; no se publican pesos GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); existe un repositorio aparte con pesos fusionados en bf16 |
| Rango del adaptador | 64 (alpha 64) |
| Libreria | peft |
| Tamano del repositorio | 0,1 GB |
| Modelo base | yandex/AliceAI-T5-35B-A0.6B |
| Datasets de entrenamiento | kaivoss/UltraData-SFT-Agent-2609-GLM53-20k, openbmb/UltraData-SFT-2605 |
| Fecha de creacion | 2026-10-02 |
| Ultima actualizacion | 2026-10-02 |

## Arquitectura y entrenamiento

El modelo base es un encoder-decoder con mezcla de expertos dispersa: 35B de parametros almacenados y 0,6B activos por token, lo que reduce el coste de calculo por token a la altura de un modelo pequeno, pero mantiene un coste de memoria propio de un modelo de 35B. El adaptador es un LoRA de rango 64 y alpha 64 aplicado sobre el base, con licencia Apache 2.0 y entrenado sobre dos datasets de SFT orientados a agentes. El modelo base no incorpora formato de chat, por lo que toda la capa conversacional y de invocacion de herramientas proviene del adaptador.

El historial de versiones documentado por el autor es relevante para entender las decisiones de diseno. La v1 usaba en su formato de chat tokens del vocabulario como `[INST_START]`, `[REPLY_END]`, `[SYSTEM_*]` y `[TOOL_RESULT_*]`, cuyos embeddings en el modelo base eran marcadores de posicion no entrenados, identicos a tokens no usados como `<SPAN#5000>`; esto causaba que el modelo no distinguiera roles ni emitiera el fin de turno, y LoRA sobre atencion no puede corregir embeddings. El repositorio incluye `placeholder_ids.json` con los 5.832 tokens marcador de posicion y una prueba unitaria que falla si el formato de chat vuelve a usarlos. La v2 sustituyo estos por marcadores de rol en texto plano y `</s>` como fin de turno, mezclando chat plano en los datos (61% de pruebas de comportamiento superadas frente al 11% del base). La v3 trabajo solo sobre datos (88% de pruebas, saludos 24/24) pero seguia repitiendo la llamada recien hecha al recibir el resultado de una herramienta (4/10 tras-herramienta). La v4 introdujo prefijos reales de trayectorias de agente general reorientados a las herramientas y al prompt de `pi` (aproximadamente el 85% de las llamadas se mapean a `read`/`bash`/`edit`/`write`, aunque ninguna trayectoria completa lo hace, por lo que solo se usa la parte previa a la primera llamada no mapeable), lo que corrigio el fallo tras-herramienta (de 8/23 a 22/23) pero regreso en otros ejes. La v5 reequilibro los datos hacia llamadas a herramientas y flujos mas ricos, alcanzando un 96% de respuestas del tipo correcto en turnos reales reservados.

La v6.3 mantiene la misma receta de datos que v6.1 pero eleva el rango de LoRA de 16 a 64, que segun el autor fue "la pieza que faltaba": las pruebas codiciosas pasaron del 92,9% al 96,5% y las muestreadas del 79,4% al 92,2%, cerrando la brecha entre decodificacion codiciosa y muestreada de 13,5 a 4,3 puntos. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; los datasets citados pertenecen a la familia UltraData-SFT. El repositorio incluye un ejemplo de ajuste fino, `finetune_chat_lora.py`.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat ensenado mediante el adaptador sobre un base sin formato de chat.
- Razonamiento explicito obligatorio: toda respuesta no silenciosa comienza con un bloque `<think>...</think>` antes del contenido final, tal como se especifica en los objetivos de entrenamiento.
- Tool calling y function calling: el modelo decide invocar herramientas cuando la tarea lo requiere y responde en texto cuando no; las pruebas de accion registradas son 22/22.
- Continuacion tras resultado de herramienta: responde en texto despues de recibir el resultado de una herramienta en lugar de repetir la llamada, con 30/31 en modo codicioso y 29/31 en modo muestreado.
- Capacidad de silencio: puede no responder cuando no hay nada que responder, aunque este comportamiento solo alcanza 13/15 (87%) en modo muestreado, por debajo del umbral de 90% fijado por el autor.
- Razonamiento multi-paso orientado a agentes, con integracion en arneses de agente reales (se menciona explicitamente el arnes `pi`).
- Respuestas largas: prueba de formato largo 4/4.
- Gestion de saludos y conversacion trivial: 24/24 en pruebas de saludo.
- Multilingue: solo ingles declarado en los metadatos; no hay soporte documentado de castellano ni de otros idiomas.
- Vision, audio y otras modalidades: no disponibles.

## Casos de uso

- Atencion al cliente automatizada con agentes: el adaptador mantiene turnos conversacionales con marcadores de rol en texto plano, evita repetir llamadas a herramientas ya ejecutadas y puede decidir callar cuando la consulta no requiere intervencion, lo que encaja en flujos de soporte con backend de herramientas (consultas de pedido, estado de cuenta).
- Agentes de codigo en terminal: el autor lo valida con el arnes `pi` y con herramientas `read`, `bash`, `edit` y `write`; el modelo puede leer ficheros, ejecutar comandos y responder con el resultado, con 30/31 de respuestas correctas tras resultado de herramienta en modo codicioso.
- Automatizacion de tareas de sistema operativo: dado que las pruebas de accion son 22/22, es adecuado para agentes que deben seleccionar la herramienta correcta entre un conjunto reducido y no inventar acciones cuando la peticion es ambigua.
- Enrutado y triaje de peticiones: la combinacion de decision de invocar herramienta, respuesta directa y silencio permite usarlo como clasificador conversacional de primera linea en pipelines de soporte o de gestion de incidencias.
- Asistentes integrados en IDE o herramienta de desarrollo: con contexto de conversacion y capacidad de emitir planes en bloques `<think>`, puede previsualizar el razonamiento antes de aplicar un cambio de codigo, lo que facilita la supervision humana.
- Pipelines de agentes con coste de calculo contenido: al tener solo 0,6B de parametros activos, el coste por token en inferencia es bajo comparado con un modelo denso de 35B, lo que permite desplegarlo en flujos con muchas llamadas por sesion siempre que la memoria para los 35B de pesos este disponible.
- Prototipado e investigacion sobre formato de chat en encoder-decoder: el repositorio documenta con detalle el fallo de usar tokens marcador de posicion en el formato de chat, y sirve como referencia reproducible para quien entrene adaptadores conversacionales sobre bases T5-like.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, MT-Bench u otros) en la informacion disponible. Los unicos datos de rendimiento son pruebas internas de comportamiento declaradas por el autor, que se reproducen a continuacion sin interpretarlas como benchmarks comparables.

| Prueba (autoevaluacion del autor) | v6.3 | v6.1 | Umbral declarado |
|---|---|---|---|
| Pruebas de comportamiento, decodificacion codiciosa | 96,5% | 92,9% | no disponible |
| Pruebas de comportamiento, decodificacion muestreada | 92,2% | 79,4% | no disponible |
| Brecha codicioso-muestreado | 4,3 puntos | 13,5 puntos | no disponible |
| Respuestas tras resultado de herramienta (codicioso) | 30/31 | no disponible | no disponible |
| Respuestas tras resultado de herramienta (muestreado) | 29/31 | no disponible | no disponible |
| Pruebas de accion | 22/22 | no disponible | no disponible |
| Formato largo | 4/4 | no disponible | no disponible |
| Saludos | 24/24 | no disponible | no disponible |
| Silencio en modo muestreado | 13/15 (87%) | no disponible | 90% |
| Precision de decision en conjunto reservado | 84,6% | no disponible | 88% |

El propio autor advierte que la metrica reservada de `tool_name_match` debe tratarse como un suelo: compara contra la unica herramienta que la trayectoria registrada uso en ese momento, de modo que leer un fichero en lugar de ejecutar `wc -l` sobre el cuenta como fallo aunque la decision sea razonable.

## Requisitos de hardware

- El adaptador pesa 0,1 GB, pero la inferencia requiere cargar el modelo base completo de 35B parametros, por lo que el requisito dominante es la memoria del base.
- Estimacion de VRAM para el modelo base: alrededor de 70 GB en bf16 o fp16, en torno a 35 GB en int8 y aproximadamente 18-20 GB en 4 bits. Estas cifras son estimaciones derivadas del numero de parametros; no estan publicadas en el repositorio.
- GPU recomendadas: una H100 de 80 GB o una A100 de 80 GB permiten bf16 sin fragmentar; dos A100 de 40 GB cubren bf16 con paralelismo de tensor; en int8 basta una A100 de 40 GB.
- GPU de consumo: una RTX 4090 de 24 GB no cabe en bf16 ni en int8; en 4 bits queda al limite y probablemente exige offload de parte de los expertos a CPU, con la penalizacion de latencia correspondiente. Al ser un MoE, no es posible reducir la huella descartando expertos sin degradar el modelo.
- Opciones de despliegue: vLLM o TGI para servir el modelo fusionado en bf16 (soporte de MoE depende de la version), y llama.cpp u Ollama solo si se generan cuantizaciones GGUF, que no se distribuyen en este repositorio. El uso directo con `peft` sobre transformers es la via documentada por el autor, dado que se incluye `finetune_chat_lora.py`.
- Existe un repositorio con pesos fusionados en bf16, kaivoss/AliceAI-T5-35B-A0.6B-chat-v6.3, que evita aplicar el adaptador en tiempo de carga.
- Latencia y throughput: no disponibles. Como referencia cualitativa, los 0,6B de parametros activos implican un coste de calculo por token bajo, pero el coste por token en memoria sigue siendo el de un modelo de 35B.

## Comparativa con modelos similares

No se dispone de datos de modelos de terceros comparables en la informacion proporcionada, por lo que la comparacion se limita a las versiones del propio autor sobre el mismo base. Las cifras de v6.2 no se detallan mas alla de que regreso en calidad.

| Modelo | Parametros | Contexto | Formato de chat | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|
| AliceAI-T5-35B-A0.6B (base) | 35B totales / 0,6B activos | no disponible | No | 11% en pruebas de comportamiento (v2 del autor) | apache-2.0 |
| chat-lora v6.1 (rango 16) | 35B totales / 0,6B activos + LoRA | no disponible | Si | 92,9% codicioso / 79,4% muestreado | apache-2.0 |
| chat-lora v6.2 (mezcla de datos distinta) | 35B totales / 0,6B activos + LoRA | no disponible | Si | regresion respecto a v6.1, sin cifras publicadas | apache-2.0 |
| chat-lora v6.3 (rango 64) | 35B totales / 0,6B activos + LoRA | no disponible | Si | 96,5% codicioso / 92,2% muestreado | apache-2.0 |

Alternativas externas de la misma categoria (MoE dispersos de gran tamano total y pocos parametros activos, o adaptadores conversacionales sobre bases encoder-decoder): no disponible.

## Limitaciones y advertencias

- Estado experimental declarado por el autor: la version se publica como v6.3 experimental, no como un modelo estable de produccion.
- Dos criterios de calidad no se alcanzan: silencio en modo muestreado (13/15, 87%, frente al 90% requerido) y precision de decision en el conjunto reservado (84,6%, frente al 88% requerido). La segunda es, segun el autor, la unica metrica que no mejoro al aumentar el rango.
- La metrica reservada de `tool_name_match` esta sesgada a la baja: penaliza alternativas validas cuando la trayectoria registrada uso otra herramienta, por lo que el 84,6% debe leerse como un suelo y no como una estimacion puntual.
- Solo ingles declarado en los metadatos; no hay evidencia de comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto no documentada: planificar despliegues con ventanas largas requiere verificacion previa con el modelo base.
- Riesgo de alucinacion en la seleccion de herramientas: el historial de versiones documenta casos de invencion de tareas para una entrada trivial como "hi" y de repeticion de llamadas tras recibir el resultado, comportamientos corregidos por etapas de datos pero que ilustran la fragilidad del equilibrio aprendido.
- Dependencia del formato de chat: usar tokens marcador de posicion del vocabulario rompe el modelo, como demuestra el caso de la v1. Cualquier plantilla de chat propia debe evitar los 5.832 identificadores listados en `placeholder_ids.json`.
- Dependencia del prompt del arnes: parte de los fallos historicos aparecieron solo bajo prompts de agente concretos (se menciona `pi`), lo que sugiere sensibilidad al formato de sistema y a la redaccion de las instrucciones.
- Coste de memoria desproporcionado respecto al calculo: 35B de pesos deben residir en memoria aunque solo se activen 0,6B por token, lo que encarece el despliegue frente a un modelo denso de menos parametros.
- Licencia Apache 2.0, permisiva para uso comercial, pero se hereda la licencia del modelo base, y el autor no documenta restricciones adicionales ni procedencia de los datos de SFT mas alla de los identificadores de los datasets.
- Sin validacion externa: 0 descargas y 0 me gusta en el momento de la consulta, y la busqueda web no devolvio resultados relevantes sobre el modelo ni sobre el paper citado, por lo que no hay verificacion independiente de las cifras.

## Enlaces

- Adaptador v6.3 en HuggingFace: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6.3
- Modelo base: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Pesos fusionados en bf16 (v6.3): https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-v6.3
- Ejemplo de ajuste fino (en el repositorio): `finetune_chat_lora.py`
- Lista de tokens marcador de posicion (en el repositorio): `placeholder_ids.json`
- Version v6.1: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6.1
- Version v6.2: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6.2
- Version v6: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v6
- Version v5: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v5
- Version v4: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v4
- Version v3: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v3
- Version v2: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2
- Version v1: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora
- Dataset kaivoss/UltraData-SFT-Agent-2609-GLM53-20k: se referencia en los metadatos del repositorio, sin enlace directo disponible en la informacion proporcionada
- Dataset openbmb/UltraData-SFT-2605: se referencia en los metadatos del repositorio, sin enlace directo disponible en la informacion proporcionada
- Paper citado en los tags (arXiv 2602.09003): identificador presente en los metadatos; no se ha podido verificar su contenido, la busqueda web no devolvio resultados relevantes
