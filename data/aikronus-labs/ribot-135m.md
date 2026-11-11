# aikronus-labs/ribot-135m

## Resumen

Ribot-135M es un modelo de lenguaje de pequeno tamano desarrollado por aikronus-labs que propone una arquitectura poco convencional para la memorizacion de hechos: un "lector" (el modelo base SmolLM2-135M, congelado) acompanado de una segunda red neuronal delgada denominada "red de memoria", de 11,8 millones de parametros y apenas 23,6 MB en disco, que almacena los hechos en sus pesos. El lector nunca se reentrena; para cambiar el conocimiento factual basta con cargar otro fichero de memoria.

El modelo aborda el problema de la actualizacion de conocimiento en LLMs sin recurrir a fine-tuning completo ni a RAG: los hechos se escriben directamente en la red de memoria mediante un proceso de entrenamiento ligero, y el lector los recupera en inferencia. La propuesta es fundamentalmente de investigacion (version v0.2), no un producto listo para produccion, y viene acompanada de un paper titulado "Ribot: A Language Model That Reads Memory Networks It Never Saw".

La relevancia actual reside en su enfoque de "memoria parametrica intercambiable": demuestra que un modelo de 135M de parametros puede leer memorias que nunca vio durante su entrenamiento con una precision alta en el formato entrenado (94,0% de coincidencia exacta en 16 memorias no vistas), lo que abre una linea de trabajo sobre modularidad y actualizacion de conocimiento a bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (lector: SmolLM2-135M) + red de memoria separada de 11,8M de parametros |
| Parametros totales | 135M (lector) + 11,8M (red de memoria) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (memorias); formato del lector no especificado en la informacion disponible |

## Arquitectura y entrenamiento

La arquitectura consta de dos componentes: un lector basado en SmolLM2-135M que permanece congelado y una red de memoria delgada de 11,8M de parametros (23,6 MB) que almacena los hechos como tripletas (entidad, relacion, valor). El lector consume la salida de la red de memoria para responder preguntas en un formato entrenado concreto (`Q: What is Mira's city?` seguido de `A:`). El proceso de escritura de hechos entrena unicamente la red de memoria, no el lector: escribir 5 hechos nuevos requiere unos 3 minutos en CPU y unos 10 segundos en GPU, y escribir 20 hechos en vivo sobre la memoria inicial (30 pasos, 9 segundos en una RTX 3070) alcanza un 80% de lectura exacta.

El entrenamiento se realizo sobre hechos sinteticos organizados en "mundos" de aproximadamente 500 hechos cada uno, con valores y formas de frase controladas. El paper reporta que el lector entrenado con palabras inventadas lee un hecho unico con valores nuevos en una forma de frase vista en entrenamiento con un 92,4% de coincidencia exacta (98,4% en ranking). La innovacion principal es la separacion entre capacidad linguistica (lector congelado) y conocimiento factual (memoria intercambiable), lo que permite cambiar el conocimiento sin tocar los pesos del modelo base. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset, ni si se empleo RLHF o DPO.

## Capacidades

- Generacion de texto en ingles mediante el lector SmolLM2-135M subyacente.
- Lectura de hechos almacenados en la red de memoria en el formato entrenado (entidad, relacion, valor).
- Escritura de nuevos hechos en la memoria sin reentrenar el lector (`rb.write(facts)`).
- Intercambio de memorias completas cargando otro fichero (`rb.load_memory("world_b")`).
- Ranking de respuestas candidatas para una pregunta dada (`rb.rank`).
- Funcionamiento sin memoria cargada (`memory=None`), en cuyo caso el modelo responde con su conocimiento propio del lector.
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito segun la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion sobre memorias parametricas: el modelo sirve como banco de pruebas para estudiar como un lector congelado recupera hechos de redes de memoria que nunca vio, con metricas reproducibles en `results.json`.
- Actualizacion de conocimiento sin reentrenamiento: escribir hechos nuevos (por ejemplo, cambios de direccion o de cargo de una entidad) en la red de memoria en segundos en GPU, sin tocar los pesos del lector.
- Sistemas con conocimiento aislado por cliente: cargar una memoria distinta por cada cliente (`rb.load_memory`) para que el mismo lector responda con hechos especificos de cada uno.
- Experimentos de intercambio de memorias: comparar el comportamiento del lector con `world_a` y `world_b` para medir la interferencia entre memorias y la fidelidad de la recuperacion.
- Docencia y divulgacion: el smoke test reproducible (unos 5 minutos en CPU, 35 segundos en RTX 3070) permite demostrar el concepto de memoria parametrica intercambiable en un entorno controlado.
- Evaluacion de robustez de recuperacion de hechos: usar el ranking de candidatos (`rb.rank`) para medir la calidad de la recuperacion en funcion del formato de la pregunta y del valor.
- Prototipado de asistentes de dominio cerrado con un catalogo pequeno de hechos (unas 500 tripletas por memoria) y preguntas en el formato entrenado.

## Benchmarks y rendimiento

Resultados reportados en el paper y en la model card (coincidencia exacta, con ranking entre parentesis):

| Escenario | % exact match (ranked) |
|---|---|
| Lectura de 16 memorias de test no vistas (400 preguntas): una pregunta | 94,0 (99,0) |
| Las mismas memorias: un hecho unico con valores nuevos en forma de frase no vista en entrenamiento | 16,2 (49,0) |
| Las mismas memorias con la memoria eliminada | 0 |
| 500 hechos en una memoria (`world_a`): completar el hecho / pregunta | 79,8 (96,6) / 89,8 (97,8) |
| Escritura de 20 hechos nuevos en vivo sobre la memoria inicial (30 pasos, 9 s en RTX 3070) | 80% (16 de 20) |
| Hechos antiguos tras la escritura en vivo (partian de 97,5%) | 87,5% |
| Lector entrenado con palabras inventadas, hecho unico con forma de frase vista | 92,4 (98,4) |

Resultados del smoke test incluido en el repositorio (CPU, 8 hilos):

| Comprobacion | ranked | starts with | Umbral |
|---|---|---|---|
| Sin memoria: respuestas coinciden con `world_a` | 5% | 0% | <= 30% |
| Memoria `world_a`: respuestas coinciden con `world_a` | 100% | 80% | >= 80% |
| Cambio a `world_b`: coinciden con `world_b` | 100% | 95% | >= 80% |
| Cambio a `world_b`: siguen coincidiendo con `world_a` | 0% | 0% | <= 15% |
| 5 hechos nuevos escritos y consultados | 100% | 100% | >= 60% |
| 5 hechos iniciales re-consultados | 100% | 100% | >= 60% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo es de 135M de parametros mas 11,8M de la red de memoria, por lo que cabe holgadamente en GPU consumer.
- GPU recomendadas: cualquier GPU consumer moderna; el smoke test se valida en una RTX 3070 (35 segundos) y la escritura de 20 hechos se completa en 9 segundos en la misma GPU.
- Cabe en GPU consumer: si, incluidas GPU de gama baja y CPU (el smoke test corre en CPU con 8 hilos en unos 5 minutos).
- Opciones de despliegue: el repositorio proporciona el paquete Python `ribot` con `Ribot.from_pretrained`, `rb.write`, `rb.ask`, `rb.load_memory`, `rb.save_memory` y `rb.rank`; requiere `huggingface_hub==0.36.0` y las dependencias de `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: escritura de 5 hechos en unos 3 minutos en CPU y 10 segundos en GPU; escritura de 20 hechos en 9 segundos en RTX 3070; smoke test en 35 segundos en RTX 3070 y unos 5 minutos en CPU. No se proporcionan cifras de tokens por segundo para generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ribot-135M | 135M + 11,8M de memoria | no disponible | Memoria parametrica intercambiable sobre SmolLM2-135M | Apache 2.0 | Hugging Face (`aikronus-labs/ribot-135m`) |
| SmolLM2-135M | 135M | no disponible en la informacion proporcionada | LLM decoder-only generalista | Apache 2.0 | Hugging Face (`HuggingFaceTB/SmolLM2-135M`) |
| Alternativas de memoria parametrica o RAG | no disponible | no disponible | Recuperacion externa o fine-tuning | no disponible | no disponible |

La comparacion con otros modelos de la misma categoria (memoria parametrica intercambiable) no esta disponible en la informacion proporcionada; el unico punto de referencia directo es el modelo base SmolLM2-135M, del que Ribot-135M hereda el lector.

## Limitaciones y advertencias

- Solo lee hechos en el formato entrenado (`Q: What is Mira's city?` / `A:`); las preguntas en lenguaje natural se leen con un 14,0% de acierto.
- No procesa documentos, instrucciones ni comportamiento: solo tripletas (entidad, relacion, valor) con valores cortos.
- Siempre responde: no existe mecanismo de "no lo se"; para comprobar si un hecho esta almacenado hay que consultar el fichero `.facts.jsonl`.
- Usa mal un hecho junto con su propio conocimiento en una sola pasada (seccion 6 del paper).
- Solo ingles, un unico tamano de modelo y aproximadamente 500 hechos por memoria.
- La escritura es entrenamiento: crear una memoria completa desde cero tarda horas en CPU.
- Es una version de investigacion (v0.2), no software de produccion.
- Riesgo de alucinacion: al no poder abstenerse, el modelo puede devolver valores plausibles pero no almacenados; el ranking de candidatos ayuda a detectarlo, pero no lo elimina.
- Sesgos conocidos: no documentados en la informacion disponible; al estar entrenado sobre hechos sinteticos, los sesgos del lector SmolLM2-135M subyacente no se han evaluado en esta ficha.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado de investigacion y la ausencia de garantias desaconsejan su uso en produccion sin validacion adicional.
- Es necesario conservar el fichero `.facts.jsonl` junto a cada memoria; sin el, una escritura borra los hechos anteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aikronus-labs/ribot-135m
- Modelo base SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Paper "Ribot: A Language Model That Reads Memory Networks It Never Saw": enlace pendiente de publicacion segun la model card (no disponible)
- Documentacion de resultados detallados: `research/README.md` dentro del repositorio del modelo
- Resultados numericos con fuente y script: `results.json` dentro del repositorio del modelo
