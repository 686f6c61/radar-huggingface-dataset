# gantrly/fortress-xs

## Resumen

Fortress-XS v1 es un clasificador de texto pequeno disenado para detectar prompt injection y peticiones daninas en entradas dirigidas a sistemas basados en LLM. Lo desarrolla gantrly y es el modelo que alimenta Mobius Guard, un cortafuegos LLM de codigo abierto. Resuelve un problema concreto de seguridad en produccion: filtrar ataques antes de que lleguen al modelo generativo, incluyendo inyecciones directas, inyecciones indirectas ocultas en documentos, correos o salidas de herramientas, y jailbreaks ofuscados.

Tecnicamente es un fine-tuning de `microsoft/deberta-v3-xsmall` (un transformer encoder de la familia DeBERTa v3) con 70.830.722 parametros totales. Se distribuye como ONNX cuantizado a INT8 de aproximadamente 81 MB, lo que permite ejecutarlo en CPU sin GPU ni PyTorch. La longitud de contexto no esta indicada de forma explicita en la informacion disponible; el ejemplo de uso aplica truncamiento a partir de un campo `max_length` del fichero `fortress.json`.

Su relevancia actual radica en el coste: ofrece inferencia en 36 ms a 128 tokens y 183 ms a 512 tokens con 4 hilos de CPU, lo que lo hace viable como capa de guardarrail en linea con presupuesto de latencia bajo. Emite dos salidas en una sola pasada (ataque y contenido danino) y se publica bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa v3, fine-tuning de `microsoft/deberta-v3-xsmall`) |
| Parametros totales | 70.830.722 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el truncamiento se toma de `max_length` en `fortress.json`) |
| Tipos de cuantizacion | INT8 (ONNX); se distribuye `model.int8.onnx` |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX INT8 (`model.int8.onnx`), `safetensors`, `tokenizer.json`, `fortress.json` |

## Arquitectura y entrenamiento

Fortress-XS es un transformer encoder de la familia DeBERTa v3 en su variante xsmall, reentrenado como clasificador de texto multiobjetivo. La innovacion practica no esta en la arquitectura sino en el empaquetado y el objetivo: un unico paso de inferencia produce dos decisiones independientes, una de ataque (prompt injection o jailbreak, directo u oculto en documentos, correos o salidas de herramientas) y otra de peticion danina. El modelo se exporta a ONNX y se cuantiza a INT8, de modo que no requiere GPU ni PyTorch en tiempo de ejecucion, solo `onnxruntime` y `tokenizers`.

El entrenamiento utiliza exclusivamente conjuntos de datos cuya licencia lo permite, segun indica el autor. Entre las fuentes declaradas figuran HackAPrompt, Lakera MOSSCAP, CTF SATML24, Gandalf, in-the-wild jailbreak prompts, WildJailbreak, Salad-Data, JailbreakBench, WildChat-1M, UltraChat 200k, BrowseSafe++, Nemotron RL Agentic Indirect Prompt Injection, tool-response-injections, Aegis AI Content Safety 2.0, PHTest y COCONOT. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La evaluacion publicada se realiza sobre conjuntos de test no vistos, con umbral fijado para que el 1 % de los mensajes benignos se marque como ataque.

## Capacidades

- Clasificacion de prompt injection directa: deteccion de instrucciones maliciosas insertadas en el mensaje del usuario.
- Deteccion de prompt injection indirecta: ataques ocultos en documentos, correos o respuestas de herramientas.
- Deteccion de jailbreaks, incluyendo variantes ofuscadas (base64, letras espaciadas, leetspeak, caracteres de aspecto similar e invisibles).
- Clasificacion de peticiones de contenido danino como salida separada de la de ataque.
- Salida dual en una sola pasada de inferencia, sin coste adicional de computo por tarea.
- Ejecucion en CPU sin GPU ni PyTorch, mediante ONNX Runtime y tokenizers.
- Integracion como guardarrail en Mobius Guard mediante politica configurable (`classifier = "fortress-xs"`, `harmful = "log"`).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Cortafuegos de entrada en aplicaciones de chat: el modelo se coloca delante del LLM generativo y clasifica cada mensaje del usuario; con latencias de 36 ms a 128 tokens, anadir esta capa no degrada de forma perceptible la experiencia interactiva.
- Proteccion frente a inyeccion indirecta en pipelines RAG: antes de insertar fragmentos recuperados en el prompt del sistema, se clasifican con Fortress-XS para detectar instrucciones ocultas en documentos, correos o paginas. Es especialmente util porque entrena con datos de inyeccion indirecta y salidas de herramientas.
- Saneado de respuestas de herramientas en agentes: cuando un agente invoca una API y recibe texto de vuelta, ese texto se clasifica antes de realimentarlo al modelo, mitigando ataques del tipo tool-response injection.
- Moderacion de contenido en aplicaciones de atencion al cliente: la salida `harmful` sirve como senal de revision o registro para peticiones que buscan contenido danino, con la advertencia de que el autor recomienda usarla en modo log por su tasa de falsos positivos.
- Despliegue en entornos sin GPU o con recursos restringidos: al ser un ONNX INT8 de 81 MB, puede ejecutarse en servidores de CPU, contenedores ligeros o dispositivos de borde donde no es viable cargar un clasificador de mayor tamano.
- Filtro previo en sistemas de evaluacion de seguridad: util para red teaming automatizado o para triage de grandes volumenes de entradas sospechosas antes de un analisis mas costoso.
- Capa de defensa en profundidad junto a reglas: combinado con reglas de palabras clave, cubre familias donde cada enfoque falla por separado; por ejemplo, las reglas superan al modelo en LLMail-Inject adaptativo, mientras el modelo domina en ataques ofuscados.

## Benchmarks y rendimiento

Recall (%) con umbral fijado a 1 % de falsos positivos sobre mensajes ordinarios, evaluado sobre un conjunto held-out de 62.919 elementos. Las familias marcadas con † no son comparacion justa porque el detector correspondiente entreno con ese conjunto.

| Familia de ataque (n) | Fortress-XS | PIGuard | ProtectAI v2 | Reglas de palabras clave |
|---|---:|---:|---:|---:|
| Gandalf, inyeccion directa (999) | 99,3 | 91,7 | 90,9 | 72,7 |
| LLMail-Inject, indirecta adaptativa (2.981) | 43,9 | 28,3 | 2,1 | 59,4 |
| BIPIA, indirecta (125) | 15,2 | 53,6 | 0,8 | 0,0 |
| SPML, chatbots con system prompt (12.541) | 34,1 | 21,3 | 91,9 | 28,2 |
| Ofuscado: base64 (1.000) | 100,0 | 100,0 | 45,5 | 0,0 |
| Ofuscado: letras espaciadas (1.000) | 99,5 | 0,8 | 0,0 | 0,0 |
| Ofuscado: leetspeak (1.000) | 90,4 | 97,1 | 0,3 | 0,2 |
| Ofuscado: caracteres similares (1.000) | 52,2 | 4,1 | 16,6 | 8,6 |
| Ofuscado: caracteres invisibles (1.000) | 59,0 | 0,2 | 11,2 | 5,9 |
| Media de las 9 familias | 66,0 | 44,1 | 28,8 | 19,4 |
| Media de las 4 familias no ofuscadas | 48,1 | 48,7 | 46,4 | 40,1 |
| deepset (261) | 37,5 | 73,9 † | 11,1 | 23,4 |
| jackhhao jailbreaks (644) | 86,8 | 94,1 † | 22,2 † | 65,8 |

Falsos positivos (%) al mismo umbral:

| Conjunto benigno (n) | Fortress-XS | PIGuard | ProtectAI v2 | Reglas de palabras clave |
|---|---:|---:|---:|---:|
| Mensajes ordinarios, mitad de test de oasst1 (16.061) | 0,9 | 1,0 | 0,9 | 0,3 |
| NotInject: texto inocuo con palabras gatillo (339) | 6,8 | 8,3 | 4,7 | 2,1 |
| OR-Bench hard: prompts inocuos que suenan daninos (1.319) | 0,0 | 11,1 | 0,8 | 0,0 |
| Correos benignos de LLMail-Inject (160) | 0,0 | 0,0 | 0,0 | 0,0 |
| Mensajes ordinarios en ingles (7.668) | 1,3 | 0,6 | 0,1 | 0,5 |

Salida `harmful` (mismo umbral del 1 %):

| Metrica | Fortress-XS |
|---|---:|
| Recall en OR-Bench toxic (655) | 90,4 |
| Recall en XSTest unsafe (200) | 84,0 |
| Falsos positivos en XSTest safe (250) | 8,0 |
| Falsos positivos en OR-Bench hard (1.319) | 48,2 |
| Salida de ataque sobre esas peticiones daninas | 0,0 |

Rendimiento de inferencia en CPU: 36 ms a 128 tokens y 183 ms a 512 tokens con 4 hilos, aproximadamente 6 veces mas rapido que los clasificadores de tamano base con los que se compara.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo corre en CPU. El fichero INT8 ONNX ocupa aproximadamente 81 MB, con un repositorio total de 0,4 GB.
- GPU recomendadas: no aplica para el caso de uso previsto; no se han publicado cifras de rendimiento en GPU.
- GPU de consumo: irrelevante, ya que el despliegue objetivo es CPU.
- Despliegue: ONNX Runtime con `tokenizers` (sin PyTorch), o a traves de Mobius Guard (`pip install "mobiusguard[onnx]"`). El modelo declara compatibilidad con Text Embeddings Inference y `endpoints_compatible`.
- Latencia y throughput: 36 ms a 128 tokens y 183 ms a 512 tokens con 4 hilos de CPU, segun el autor. No se publica throughput agregado ni cifras para otros numeros de hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Recall medio (9 familias) | Licencia | Ejecucion en CPU |
|---|---|---|---|---|---|
| Fortress-XS | 70,8 M | No disponible | 66,0 | Apache-2.0 | Si, 36-183 ms |
| PIGuard | No disponible | No disponible | 44,1 | No disponible | Si, pero mas lento (segun el autor) |
| ProtectAI v2 | No disponible | No disponible | 28,8 | No disponible | Si, pero mas lento (segun el autor) |
| Reglas de palabras clave | No aplica | No aplica | 19,4 | No aplica | Si, trivial |

Fortress-XS se posiciona como la opcion mas rapida en CPU y la mas robusta frente a ofuscacion, mientras que PIGuard y ProtectAI v2 ganan en familias concretas (BIPIA y SPML respectivamente). Los datos de parametros, contexto y licencia de los competidores no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- El recall en inyeccion indirecta es bajo en varias familias: 15,2 % en BIPIA y 34,1 % en SPML, por lo que no debe usarse como unica defensa frente a esos vectores.
- La salida `harmful` tiene un 48,2 % de falsos positivos en OR-Bench hard (prompts inocuos que suenan daninos); el autor recomienda usarla en modo log, no como bloqueo, salvo que el trafico tolere ese nivel de sobrebloqueo.
- Falsos positivos del 6,8 % en NotInject, textos inocuos que contienen palabras gatillo de ataque.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de clasificacion erronea en entradas ambiguas o adversarias no cubiertas por el entrenamiento.
- No se han publicado comparaciones de la salida `harmful` con otros clasificadores de contenido danino.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre robustez en dominios no representados en el entrenamiento.
- El modelo se publica como v1 con fecha de creacion reciente y sin descargas ni likes, por lo que su validacion independiente es limitada.
- No se especifican sesgos conocidos en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gantrly/fortress-xs
- Demo en el navegador: https://huggingface.co/spaces/gantrly/fortress-xs
- Repositorio de Mobius Guard: https://github.com/gantrly/mobius-guard
- Modelo base: https://huggingface.co/microsoft/deberta-v3-xsmall
