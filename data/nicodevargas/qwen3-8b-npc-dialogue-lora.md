# NicoDeVargas/qwen3-8b-npc-dialogue-lora

## Resumen

`qwen3-8b-npc-dialogue-lora` es un adaptador LoRA (PEFT) sobre el modelo base Qwen3-8B, desarrollado por el usuario NicoDeVargas. Su proposito es especializar al modelo en la interpretacion de PNJ (personajes no jugadores) de un RPG implementado en el motor Godot, forzando respuestas en personaje en portugues de Brasil y devolviendo una estructura JSON concreta con las claves `reply`, `action` y `mood_shift` que el motor del juego ejecuta directamente.

El adaptador resuelve un problema muy especifico de integracion entre un LLM y un motor de videojuego: la necesidad de salida estructurada fiable y consistente con el estado del mundo, sin sacrificar la naturalidad del dialogo. Segun la model card, sobre un conjunto de validacion de 392 turnos con mundos y personajes no vistos durante el entrenamiento, la accion predicha coincide con la referencia en el 92,9% de los casos (frente al 10,8% del modelo base) y el JSON es valido en el 100% de las respuestas; dentro del juego, el validador de reglas aprobo el 97,5% de las replicas.

Se distribuye como adaptador de 43,6 millones de parametros entrenables (r=16, alpha=32, aplicado a todas las proyecciones), con pesos en safetensors y una version GGUF f16 para llama.cpp. La licencia es Apache 2.0 y el unico idioma declarado es el portugues. Es relevante ahora porque demuestra un patron reproducible de especializacion de un modelo denso de 8B para tareas de agente estructurado con muy pocos parametros adicionales y despliegue en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-8B |
| Parametros totales | 43.646.976 (adaptador); modelo base Qwen3-8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ejemplo de despliegue con `-c 4096`) |
| Tipos de cuantizacion | adaptador en safetensors y GGUF f16; el modelo base admite Q4_K_M, Q5, Q8, etc. |
| Idiomas soportados | portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) y GGUF (f16) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado a todas las proyecciones del transformer denso Qwen3-8B. No modifica la arquitectura del modelo base: se carga en tiempo de ejecucion con PEFT (o con llama.cpp mediante `--lora`) y se suma a los pesos originales. El modelo base Qwen3-8B es un transformer decoder-only denso de aproximadamente 8.000 millones de parametros, con soporte de chat template propio y un modo de razonamiento (`enable_thinking`) que la model card recomienda desactivar para esta tarea.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card indica que el entrenamiento se realizo sobre dialogos de PNJ de un RPG en Godot con salida JSON estructurada, y que se evaluo sobre 392 turnos de validacion con mundos y personajes no vistos. Un hallazgo tecnico relevante: fusionar el adaptador en los pesos y recuantizar a Q4 degrada la precision de accion del 90% al 30%, por lo que el autor recomienda cargar el LoRA en tiempo de ejecucion sobre el modelo base cuantizado, en lugar de fusionarlo.

## Capacidades

- Generacion de dialogo en personaje en portugues de Brasil, con tono y registro adaptados al PNJ.
- Salida estructurada JSON con las claves `reply`, `action` y `mood_shift`, validada al 100% en el conjunto de evaluacion.
- Prediccion de acciones de juego coherentes con el contexto del mundo y del personaje (92,9% de coincidencia con la referencia).
- Cambios de estado emocional del PNJ (`mood_shift`) integrados en la misma respuesta.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor recomienda `enable_thinking=False`.
- Capacidades multilingues: solo portugues declarado; el comportamiento en otros idiomas no esta documentado.
- Capacidades especiales: integracion con llama.cpp via GGUF y con PEFT/Transformers; validacion de reglas del juego en el 97,5% de las replicas.

## Casos de uso

- Dialogo de PNJ en un RPG: el adaptador genera respuestas en personaje y una accion ejecutable por el motor Godot en la misma salida JSON, lo que elimina la necesidad de un parseo y una capa de decision separada.
- Sistemas de misiones generativas: la prediccion de `action` permite que el PNJ ofrezca, acepte o rechace misiones de forma consistente con el estado del mundo, con una precision del 92,9% frente a la referencia en escenarios no vistos.
- Prototipado rapido de contenido narrativo: al cargarse como LoRA sobre Qwen3-8B cuantizado a Q4_K_M, se puede desplegar en una estacion de trabajo con una sola GPU consumer para iterar sobre guiones y personajes.
- Modulacion emocional de personajes: el campo `mood_shift` permite que el estado de animo del PNJ evolucione turno a turno y se persista en el guardado del juego.
- Validacion automatica de contenido: el validador de reglas del juego aprueba el 97,5% de las replicas, lo que reduce la intervencion manual en la revision de dialogos generados.
- Despliegue local en llama.cpp: el GGUF f16 del adaptador se carga con `llama-server --lora` sobre el modelo base cuantizado, adecuado para demos y entornos sin acceso a la nube.
- Investigacion sobre especializacion de LLM para agentes estructurados: el repositorio del autor incluye codigo de entrenamiento, metricas y la comparativa entre fusionar el LoRA y cargarlo en tiempo de ejecucion.

## Benchmarks y rendimiento

| Metrica | Adaptador | Modelo base Qwen3-8B |
|---|---|---|
| Precision de accion (392 turnos, mundos no vistos) | 92,9% | 10,8% |
| JSON valido | 100% | no disponible |
| Aprobacion del validador de reglas en juego | 97,5% | no disponible |
| Precision de accion tras fusionar y recuantizar a Q4 | 30% (frente al 90% en tiempo de ejecucion) | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-8B en bfloat16 requiere aproximadamente 16 GB; en Q4_K_M, alrededor de 5-6 GB. El adaptador LoRA anade unos 0,3 GB en f16.
- GPU recomendadas: A100 40/80 GB o H100 para bfloat16 sin cuantizar; RTX 4090 (24 GB) para bfloat16 o Q8; RTX 3090, RTX 4080 y RTX 4070 Ti para cuantizaciones Q4/Q5.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas usando Q4_K_M; con 6 GB es ajustado y depende de la longitud de contexto.
- Opciones de despliegue: llama.cpp (`llama-server` con `--lora`), PEFT + Transformers, vLLM y TGI (compatibles con LoRA, aunque no documentados por el autor para este adaptador).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-npc-dialogue-lora | 43,6 M (adaptador) + 8B base | no disponible | LoRA para dialogo de PNJ con salida JSON | Apache 2.0 | Hugging Face (24 descargas) |
| Qwen3-8B base | 8B | no disponible | Modelo generalista denso | Apache 2.0 | Hugging Face |
| Alternativas especializadas en dialogo de juego | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores publicos equivalentes para dialogo de PNJ con salida estructurada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente para portugues de Brasil; su rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera deficiente.
- La salida esta fuertemente sesgada al esquema JSON `{"reply", "action", "mood_shift"}`; usarlo fuera de ese contrato puede degradar la calidad.
- Fusionar el LoRA en los pesos y recuantizar a Q4 reduce la precision de accion del 90% al 30%, segun el propio autor; es obligatorio cargarlo en tiempo de ejecucion.
- La model card recomienda usar el chat template de Qwen3 con `enable_thinking=False`; el modo de razonamiento puede romper el formato de salida.
- Riesgo de alucinacion en acciones o estados de mundo no contemplados en el entrenamiento; el validador de reglas aprueba el 97,5%, lo que implica un 2,5% de replicas rechazadas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene sus propios terminos que deben verificarse por separado.
- El adaptador tiene solo 24 descargas y 0 likes; no hay evidencia de uso en produccion a escala.
- No se documentan la longitud de contexto efectiva ni el comportamiento con contextos largos.

## Enlaces

- Hugging Face: https://huggingface.co/NicoDeVargas/qwen3-8b-npc-dialogue-lora
- Repositorio de entrenamiento y metricas: https://github.com/NicoDeVargas/qwen3-npc-dialogue-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
