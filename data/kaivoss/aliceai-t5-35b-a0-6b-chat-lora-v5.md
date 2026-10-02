# kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v5

## Resumen

AliceAI-T5-35B-A0.6B · chat + tool-call LoRA, v5 es un adaptador LoRA (rango 16, alpha 16) publicado por el usuario kaivoss sobre el modelo base yandex/AliceAI-T5-35B-A0.6B. El modelo base es un encoder-decoder disperso de tipo MoE con 34,35 mil millones de parametros totales y aproximadamente 0,6 mil millones activos por token, construido sobre la arquitectura UL2 y desarrollado por Yandex como infraestructura de produccion para respuestas de Alice AI en su buscador. El adaptador aporta lo que el modelo base no tiene: un formato de chat y la capacidad de decidir cuando invocar herramientas, cuando responder en texto y cuando permanecer en silencio.

El objetivo del adaptador es convertir un modelo text-to-text sin formato conversacional en un asistente capaz de operar dentro de un arnes de agente. Para ello ensena tres comportamientos: llamada a herramientas cuando la tarea lo requiere, respuesta en texto cuando no, y ausencia de respuesta cuando no hay nada que decir (por ejemplo, tras un agradecimiento). La version v5 es la quinta iteracion de una serie que documenta de forma muy explicita los fallos de cada version previa y los cambios de datos introducidos para corregirlos.

La relevancia de esta ficha reside en dos factores. Primero, el modelo base es una apuesta contracorriente: mientras la mayoria de los laboratorios de pesos abiertos convergen en transformers decoder-only, Yandex mantiene un encoder-decoder T5-style con routing MoE top-8 sobre 512 expertos por capa. Segundo, el adaptador incluye una evaluacion conductual cuantificada (129 sondas, 88 % en modo greedy, 85 % en modo sampled) que permite juzgar su madurez con numeros concretos en lugar de impresiones. El propio autor declara que la v5 no alcanzo el umbral fijado antes del entrenamiento (sondas mayor o igual al 90 %, comportamiento tras resultado de herramienta mayor o igual al 90 %) y que por ello no se escalo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder T5-style con MoE disperso, basada en UL2 |
| Parametros totales | 34,35 mil millones (modelo base) |
| Parametros activos | Aproximadamente 0,6 mil millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; existen pesos fusionados en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); pesos fusionados en bf16 en repositorio aparte |

Detalles estructurales del modelo base: 16 capas de encoder, 12 capas de decoder, vocabulario de 135.040 tokens y dimension oculta de 1.536. Cada capa MoE contiene 512 expertos con routing top-8 por token. El adaptador tiene rango 16 y alpha 16.

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder-decoder de estilo T5 entrenado desde cero con el objetivo UL2, lo que le permite abordar tareas text-to-text de forma nativa. La innovacion principal es la combinacion de un encoder-decoder clasico con una capa MoE de grano fino: 512 expertos por capa y seleccion top-8 por token. Esto da un modelo de 34,35 mil millones de parametros con un coste de computo por token equivalente al de un modelo de aproximadamente 0,6 mil millones de parametros activos, lo que reduce drasticamente el coste de inferencia frente a un denso del mismo tamano.

El adaptador v5 se entrena sobre tres conjuntos de datos: kaivoss/UltraData-SFT-Agent-2609-GLM53-20k, openbmb/UltraData-SFT-2605 y HuggingFaceTB/smoltalk. La receta de la version v5 se centra exclusivamente en cambios de datos respecto a v4, con cinco intervenciones documentadas: incorporacion de preguntas planas reales bajo el prompt del arnes `pi` sin instruccion de "no usar herramientas" (`pi_plain`); ejemplos de negacion bajo prompts de agente (`negation`), incluida la tarea que requeriria una herramienta mas la instruccion de no usarla; rebalanceo hacia la llamada a herramientas para corregir la infra-llamada de v4; enriquecimiento de flujos con cuatro tipos de tarea nuevos (`grep -c`, `head`, `mkdir` con resultado vacio, `find`) y pools mas grandes (unos 1.400 flujos distintos por cada 2.000 extracciones, frente a unos 770); y mas ejemplos de silencio tras agradecimiento.

Un hallazgo tecnico relevante de la serie: la version v1 usaba los tokens de vocabulario `[INST_START]`, `[REPLY_END]`, `[SYSTEM_*]` y `[TOOL_RESULT_*]`, cuyos embeddings en el modelo base son marcadores sin entrenar. Al ser identicos a los de un token no usado como `<SPAN#5000>`, el modelo no podia distinguir roles ni emitir `[REPLY_END]`, y un LoRA sobre atencion no puede ensenar embeddings. El repositorio incluye `placeholder_ids.json` con los 5.832 tokens marcador y un test unitario que falla si el formato de chat vuelve a usar uno. A partir de v2 el formato paso a usar marcadores de rol en texto plano y `</s>` como fin de turno.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat ensenado mediante adaptador LoRA sobre un modelo base sin formato propio.
- Llamada a herramientas y function calling, con decision explicita de invocar o no una herramienta segun la tarea.
- Decodificacion de flujos propios de agentes de codigo: lectura y edicion de ficheros, ejecucion de comandos, busqueda en ficheros (`grep -c`), visualizacion de cabeceras (`head`), creacion de directorios (`mkdir`) y localizacion de ficheros (`find`).
- Produccion de una respuesta final en texto justo despues de recibir un resultado de herramienta, en lugar de repetir la llamada.
- Capacidad de permanecer en silencio cuando no procede responder, incluido el caso de un agradecimiento.
- Obediencia a instrucciones de negacion ("no uses herramientas") en parte de los casos evaluados.
- Soporte de modo de razonamiento con limite de 600 tokens, segun la receta de datos descrita para v3 y mantenida en versiones posteriores.
- Capacidad multilingue: solo ingles declarado.

## Casos de uso

- Agente de codigo con acceso a sistema de ficheros: el adaptador esta entrenado especificamente con flujos de `read`, `bash`, `edit`, `write`, `grep -c`, `head`, `mkdir` y `find`, por lo que encaja en arneses que exponen esas herramientas. Es el escenario para el que se diseno.
- Asistente conversacional con decision de herramienta: el modelo decide entre llamar a una herramienta o responder directamente en texto, lo que permite construir agentes que no invocan funciones innecesariamente en preguntas simples.
- Automatizacion de preguntas y respuestas sobre repositorios: dado un prompt de agente, el modelo responde a preguntas planas sin disparar una lectura de fichero superflua, comportamiento corregido en v5.
- Enrutamiento de peticiones con coste reducido: gracias a que solo 0,6 mil millones de parametros estan activos por token, es adecuado para servir volumen alto de peticiones con requisitos de latencia exigentes, siempre que se disponga de memoria suficiente para los 34,35 mil millones de parametros.
- Sistemas que requieren respeto de restricciones de herramienta: el entrenamiento con ejemplos de negacion permite gestionar escenarios en los que el usuario prohibe explicitamente el uso de herramientas, respondiendo con una explicacion honesta cuando la tarea no puede completarse sin ellas.
- Asistentes que deben callar: la capacidad de no responder ante agradecimientos o mensajes de cierre evita ruido en canales de soporte o en agentes que operan en segundo plano.
- Investigacion sobre encoder-decoder con MoE: sirve como punto de partida para estudiar si un T5-style MoE puede competir con decoder-only en tareas de agente, y como caso documentado de adaptacion de un modelo base sin formato de chat.
- Base para experimentos de destilacion o ajuste adicional: al ser un adaptador LoRA sobre un modelo de pesos abiertos con licencia Apache 2.0, se puede fusionar y reentrenar sin restricciones de licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La evaluacion publicada por el autor es conductual y propia del adaptador, no comparable directamente con suites generales:

| Metrica (v5 salvo indicacion) | Resultado |
|---|---|
| Sondas de comportamiento, modo greedy | 88 % (v4: 81 % en las mismas sondas) |
| Sondas de comportamiento, modo sampled | 85 % (v4: diferencia de 10 puntos respecto a greedy) |
| Saludos | 24/24 |
| Preguntas planas bajo prompt `pi` | 8/8 |
| Instrucciones de "no usar herramientas" | 8/8 |
| Silencio | 15/15 |
| Acierto en el tipo de respuesta en turnos reales retenidos | 96 % (v4: 83 %, v3: 91 %) |
| Respuestas correctas tras resultado de herramienta | 25/31 |
| Tarea que requiere herramienta mas instruccion "no usar herramientas" | 2/8 |
| Comportamiento tras resultado de herramienta en v4 (referencia) | 22/23 |
| Comportamiento tras resultado de herramienta en v3 (referencia) | 8/23 |

El autor indica que la version no alcanzo el umbral previsto (sondas mayor o igual al 90 %, comportamiento tras herramienta mayor o igual al 90 %) y por tanto no se escalo. Tambien reporta un fallo concreto: en una sonda el modelo imprimio el contenido de un fichero que nunca habia leido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se especifican cifras en la informacion proporcionada. Como referencia estructural, el modelo base tiene 34,35 mil millones de parametros, lo que en bf16 requiere aproximadamente 69 GB de pesos, aunque el coste de computo por token corresponde a 0,6 mil millones de parametros activos.
- GPU recomendadas: no disponible. No se indican modelos concretos en la documentacion.
- Encaje en GPU de consumo: no disponible con los datos proporcionados. El tamano de pesos en bf16 excede la memoria de las GPU de consumo habituales, pero no hay confirmacion en la informacion disponible.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada. El repositorio es una libreria PEFT con formato safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos directamente comparables de otros laboratorios con arquitectura encoder-decoder MoE de este tamano y licencia abierta. La comparacion posible es contra el propio modelo base y contra las versiones previas del adaptador:

| Modelo | Parametros | Arquitectura | Contexto | Formato de chat | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| yandex/AliceAI-T5-35B-A0.6B | 34,35B totales / 0,6B activos | Encoder-decoder MoE (UL2) | no disponible | No | Apache 2.0 | Hugging Face |
| kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v5 | Adaptador LoRA r16 sobre el base | Encoder-decoder MoE (UL2) + LoRA | no disponible | Si | Apache 2.0 | Hugging Face |
| kaivoss/AliceAI-T5-35B-A0.6B-chat-v5 (fusionado) | 34B (bf16) | Encoder-decoder MoE (UL2) | no disponible | Si | Apache 2.0 | Hugging Face |
| Versiones previas (v1 a v4) | Adaptador LoRA r16 | Encoder-decoder MoE (UL2) + LoRA | no disponible | Si, con fallos documentados | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- El autor declara explicitamente que la v5 no alcanza su propio umbral de calidad y que no se escalo por ese motivo.
- Fallo persistente en la tarea que requiere una herramienta combinada con la instruccion "no usar herramientas": solo 2 de 8 sondas pasan, y el modelo suele llamar a la herramienta de todos modos.
- Fallo en parte de las respuestas posteriores a un resultado de herramienta (25 de 31): a veces coloca la respuesta dentro de `<think>`, omite el hecho clave o vuelve a llamar.
- Alucinacion documentada: en una sonda el modelo imprimio el contenido de un fichero que nunca habia leido.
- Idioma: solo ingles declarado. No hay soporte multilingue confirmado.
- Longitud de contexto: no disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Restricciones de licencia: la licencia es Apache 2.0, lo que permite uso comercial, pero se aplica al adaptador y al modelo base; conviene verificar las condiciones del modelo base y de los conjuntos de datos de entrenamiento de forma independiente.
- Sesgos conocidos: no se documenta ningun analisis de sesgos en la informacion disponible.
- El modelo base carece de formato de chat y depende por completo del adaptador para el comportamiento conversacional; cualquier uso sin el adaptador o sin su plantilla de chat producira resultados degradados.
- El historial de la serie muestra regresiones cruzadas entre versiones: v4 corrigio el fallo tras herramienta pero empeoro en preguntas planas y en el respeto de negaciones. La v5 mitiga esas regresiones, pero no las elimina.
- La evaluacion es conductual y basada en sondas propias, no en benchmarks estandarizados, por lo que no es directamente comparable con otros modelos.

## Enlaces

- Adaptador v5 en Hugging Face: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v5
- Pesos fusionados en bf16, v5: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-v5
- Adaptador v4: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v4
- Adaptador v3: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v3
- Adaptador v2: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora-v2
- Adaptador v1 (sustituido, fallo conocido): https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-lora
- Pesos fusionados v2: https://huggingface.co/kaivoss/AliceAI-T5-35B-A0.6B-chat-v2
- Modelo base: https://huggingface.co/yandex/AliceAI-T5-35B-A0.6B
- Script de ajuste fino incluido en el repositorio: finetune_chat_lora.py
- Lista de tokens marcador: placeholder_ids.json
- Cobertura de Yandex open-sourcing del modelo base: https://www.aimodeling.com/en/news/slug/yandex-aliceai-t5-sparse-moe
- Ficha del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/aliceai-t5-35b-a0.6b-yandex
- Anuncio del modelo base en X: https://x.com/HuggingModels/status/2098889393180385404
- Paper referenciado en los tags: arxiv:2602.09003
- Conjuntos de datos de entrenamiento: kaivoss/UltraData-SFT-Agent-2609-GLM53-20k, openbmb/UltraData-SFT-2605, HuggingFaceTB/smoltalk
