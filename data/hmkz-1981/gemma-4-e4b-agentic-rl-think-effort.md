# hmkz-1981/gemma-4-e4b-agentic-rl-think-effort

## Resumen

`gemma-4-e4b-agentic-rl-think-effort` es un ajuste fino del modelo `google/gemma-4-E4B-it` desarrollado por el usuario hmkz-1981. Se trata de un modelo de generacion de texto orientado a uso agentico (tool use, seguimiento de instrucciones) que incorpora una innovacion concreta: un mecanismo de "esfuerzo de razonamiento" configurable en cinco niveles (`low`, `medium`, `high`, `xhigh`, `max`) que controla cuanto "piensa" el modelo antes de responder. El modelo parte de una iteracion previa del mismo autor (`gemma-4-e4b-agentic-rl-think-r3`) y anade esta capacidad de control granular del razonamiento.

El modelo tiene 7.941.100.874 parametros totales segun los pesos en safetensors, lo que lo situa en la categoria de modelos de ~8B. El repositorio ocupa 15,9 GB. Esta publicado bajo licencia Apache 2.0 y declara soporte para japones e ingles. Su relevancia actual radica en la tendencia hacia modelos que permiten al desarrollador controlar el coste computacional del razonamiento en tiempo de inferencia, algo critico en despliegues de agentes donde el presupuesto de tokens de pensamiento afecta directamente a la latencia y al coste.

El modelo se distribuye unicamente en formato safetensors y no cuenta con descargas ni likes en el momento de la consulta, lo que indica que es un artefacto de investigacion reciente y poco adoptado. No se dispone de informacion sobre la longitud de contexto en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma 4, transformer; detalles no especificados) |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `google/gemma-4-E4B-it`, cuyo detalle arquitectonico interno no se especifica en la informacion disponible. Sobre esa base, el autor aplico un ajuste fino mediante GRPO (Group Relative Policy Optimization) durante 200 pasos. La innovacion central es el entrenamiento con instrucciones de esfuerzo: a cada problema se le anade una directiva en el system prompt con el formato `# EFFORT: <nivel> - <instruccion>`, insertada automaticamente por la plantilla de chat. La funcion de recompensa combina la correccion de la respuesta con la cercania entre la cantidad de tokens de pensamiento generados y un objetivo calculado como el pensamiento habitual del modelo en ese problema multiplicado por un factor segun el nivel (medium: 0,6; high: 1,0; xhigh: 1,5; max: 2,2).

El resultado es un modelo que aprende a modular la longitud de su cadena de pensamiento en funcion del nivel de esfuerzo solicitado, manteniendo aproximadamente la misma precision. Segun la evaluacion del autor sobre 580 problemas no usados en entrenamiento y con temperatura 0, la puntuacion media se mantiene entre 0,914 (low) y 0,963 (none), mientras que la mediana de tokens de pensamiento escala de 0 (low) a 612 (max). El nivel `low` responde sin pensamiento; `medium` a `max` activan razonamiento con longitud creciente. Si no se especifica esfuerzo, el modelo se comporta como el original, permitiendo usar `enable_thinking` y `conversational_mode`.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones.
- Uso de herramientas (tool use / function calling), segun los tags del modelo.
- Comportamiento agentico y razonamiento multi-paso.
- Control configurable del esfuerzo de razonamiento en cinco niveles (`low`, `medium`, `high`, `xhigh`, `max`) mediante `chat_template_kwargs={"effort": ...}`.
- Modo sin pensamiento (nivel `low`) para respuestas inmediatas.
- Compatibilidad con los modos del modelo base: `enable_thinking` y `conversational_mode`.
- Capacidades multilingues limitadas a japones e ingles segun la model card.
- No se declaran capacidades de vision, audio ni otras modalidades en la informacion disponible.

## Casos de uso

- Agentes con presupuesto de razonamiento variable: el desarrollador puede asignar nivel `low` a tareas triviales (clasificacion, extraccion de campos) y `max` a problemas complejos, optimizando latencia y coste sin cambiar de modelo.
- Automatizacion de atencion al cliente en japones o ingles: conversaciones multi-turno donde el nivel `medium` equilibra calidad y velocidad de respuesta.
- Pipelines de tool calling: integracion en sistemas que requieren invocar funciones externas (APIs, bases de datos) con seguimiento fiable de instrucciones y formato.
- Razonamiento agentico multi-paso: tareas que requieren planificacion y descomposicion, usando niveles `high` o `xhigh` para obtener cadenas de pensamiento mas largas.
- Evaluacion comparativa de estrategias de razonamiento: util como banco de pruebas para medir el impacto del esfuerzo de pensamiento en la precision de tareas concretas.
- Despliegue en entornos con restricciones de latencia: el nivel `low` permite respuestas sin cadena de pensamiento, adecuado para interfaces interactivas en tiempo real.
- Investigacion sobre control de test-time compute: el modelo sirve como referencia para estudiar como escalar el razonamiento afecta al rendimiento en tareas de siete tipos (segun la evaluacion del autor).

## Benchmarks y rendimiento

El autor publica una evaluacion propia sobre 580 problemas no usados en entrenamiento (temperatura 0) con una metrica de 7 tareas. No son benchmarks estandar (MMLU, HumanEval, GSM8K), por lo que no se comparan directamente con otros modelos.

| effort | mean | think_median (tokens) | % problemas mas largos que medium | ratio de pensamiento vs medium (mediana) |
|---|---|---|---|---|
| none | 0,963 | 381 | - | - |
| low | 0,914 | 0 | - | - |
| medium | 0,962 | 249 | - | - |
| high | 0,960 | 469 | 0,94 | 1,72x |
| xhigh | 0,959 | 527 | 0,98 | 2,02x |
| max | 0,960 | 612 | 0,99 | 2,41x |
| start(none) | 0,942 | 285 | - | - |

`start(none)` corresponde al modelo antes de anadir el mecanismo de esfuerzo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7,94B parametros, en fp16 se requieren aproximadamente 16 GB de VRAM solo para pesos; en cuantizacion de 8 bits, unos 8 GB; en 4 bits, unos 4-5 GB. No se distribuyen pesos cuantizados oficialmente.
- GPU recomendadas: A100 (40/80 GB) o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16; RTX 3090/4080 (16-24 GB) para fp16 ajustado o 8 bits.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en fp16, y en tarjetas de 8 GB con cuantizacion de 4 bits (requiere cuantizar manualmente).
- Opciones de despliegue: no se especifican en la model card; al ser safetensors, es compatible con frameworks estandar como vLLM, TGI o transformers. Para llama.cpp/Ollama seria necesario convertir a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles. El nivel de esfuerzo afecta directamente a la latencia (nivel `low` sin tokens de pensamiento; `max` con mediana de 612 tokens de pensamiento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gemma-4-e4b-agentic-rl-think-effort | 7,94B | no disponible | Apache 2.0 | Hugging Face, safetensors | Esfuerzo de razonamiento configurable |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | Apache 2.0 | Hugging Face | Modelo base sin control de esfuerzo |
| hmkz-1981/gemma-4-e4b-agentic-rl-think-r3 | no disponible | no disponible | no disponible | Hugging Face | Iteracion previa sin esfuerzo |

No se dispone de datos de rendimiento comparables con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte para japones e ingles; el rendimiento en castellano no esta verificado.
- La evaluacion publicada es propia del autor (7 tareas, 580 problemas) y no usa benchmarks estandar, por lo que no es directamente comparable con otros modelos.
- El nivel `low` reduce la precision media a 0,914 frente a 0,962-0,963 del resto de niveles, segun la evaluacion del autor.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Longitud de contexto no especificada, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base (Gemma 4) puede tener terminos adicionales que deben verificarse en su propia licencia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- No se ofrecen pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto sin trabajo adicional.
- El autor indica que el modelo se creo con la colaboracion de Claude (Anthropic), lo que conviene tener en cuenta al evaluar la procedencia del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hmkz-1981/gemma-4-e4b-agentic-rl-think-effort
- Iteracion previa: https://huggingface.co/hmkz-1981/gemma-4-e4b-agentic-rl-think-r3
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
