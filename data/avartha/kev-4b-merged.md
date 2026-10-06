# avartha/kev-4b-merged

## Resumen

kev-4b-merged es una derivacion no oficial de jaredpalmer/kev-4b, preparada por el usuario avartha. No es un modelo generativo de texto al uso: es un modelo de decision basado en puntero (pointer head) construido sobre un backbone Qwen3.5 de 4B (arquitectura hibrida con Gated DeltaNet). Su funcion es emitir una distribucion sobre un conjunto de opciones discretas a partir de un estado y una pregunta, usando un cabezal de atencion (q/k) en lugar del cabezal LM. El repositorio distribuye los pesos del backbone con el adaptador LoRA de Kev ya fusionado, mas el cabezal de puntero en safetensors.

El modelo cuenta con 4.539.265.536 parametros reales segun el fichero safetensors y ocupa 9,1 GB en el repositorio. Las modificaciones respecto a sus fuentes son explicitas: se fusiona el adaptador LoRA de Kev en los pesos base, se eliminan los 15 tensores `mtp.*` (que Kev no usa porque construye el backbone como `AutoModelForCausalLM(...).model`, solo el modelo de texto) y se expone el cabezal de puntero tambien en safetensors. Todos los demas tensores se copian bit a bit, incluidos los que la base almacena en fp32.

Es relevante ahora porque sirve como artefacto reproducible y verificado de una fusion LoRA, con manifiesto de procedencia, hashes y una comparacion bit a bit contra la fusion de referencia de Kev. La licencia es Apache-2.0 tanto para Kev como para los pesos base de Qwen3.5. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Gated DeltaNet (Qwen3.5) mas cabezal de puntero (pointer head) para decision; sin uso del cabezal LM |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen cuantizaciones (sin GGUF, AWQ ni GPTQ); pesos en bf16 en el backbone y en fp32 en algunos tensores y en el cabezal |
| Idiomas soportados | No disponible (la tokenizacion proviene de Qwen/Qwen3.5-4B-Base) |
| Licencia | Apache-2.0 (Kev) y Apache-2.0 (Qwen3.5, fichero LICENSE-QWEN) |
| Formato de pesos | safetensors: 2 shards de modelo (`model.safetensors-00001-of-00002`, `model.safetensors-00002-of-00002`) y `head.safetensors`; tambien `head.pt` en formato PyTorch |

## Arquitectura y entrenamiento

El backbone es un Qwen3.5 de 4B descrito por el autor como hibrido con Gated DeltaNet, en bf16, con el ajuste fino de Kev aplicado. Kev no utiliza el cabezal LM en ningun momento. La parte especifica del modelo es el cabezal de puntero: dos proyecciones q y k de dimension 256 sobre el estado oculto de dimension 2560, mas un parametro de temperatura. La lectura de logits se define como `logit_j = ((W_k h_opt_j + b_k) · (W_q h_decide + b_q)) / sqrt(256) / T`, seguida de una softmax sobre las opciones de la pregunta. El estado oculto `h` es el estado final normalizado del backbone. La temperatura registrada en `head.pt` es T = 2.406050072164233.

El layout de tokens es particular: `<|fim_prefix|>` para el estado, `<|fim_middle|>` para la pregunta, `<|box_start|>`/`<|box_end|>` para cada opcion y `<|fim_suffix|>` para la decision. No existe plantilla de chat; cada pregunta es una fila causal que continua el estado. La fusion se realizo con `upstream/kev_merge.py` en CPU, procesando un shard base a la vez, aplicando `W_bf16 = bf16(fp32(W) + (B @ A) * 2.0)`, donde 2.0 = lora_alpha/r = 32/16. Se aplicaron 248 de 248 modulos adaptados y el script falla si falta alguno. El resultado son 723 tensores y 9.078.538.752 bytes. La verificacion se ejecuto en CPU con 5 peticiones cortas de tipo System One, construidas con `kev.api.to_record` (conteos de tokens [49, 49, 43, 36, 63]). No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion disponible.

## Capacidades

- Decision multiple-choice: dado un estado y una pregunta con opciones delimitadas, produce una distribucion de probabilidad sobre las opciones mediante el cabezal de puntero.
- No genera texto libre: Kev nunca usa el cabezal LM, por lo que no es un modelo de chat ni de completado convencional.
- Readout con softmax sobre opciones, con temperatura fija de 2.406050072164233.
- Tokenizacion y preprocesado heredados de Qwen/Qwen3.5-4B-Base (revision fijada).
- Preservacion del submodelo visual de la base (los tensores `model.visual.*` se conservan sin cambios), aunque el autor no describe su uso en Kev.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- Capacidades multilingues: no disponibles.
- Capacidades de codigo, matematicas, vision o audio: no documentadas como tales.

## Casos de uso

- Enrutamiento de peticiones: el modelo puede elegir entre opciones discretas (por ejemplo, que servicio o modelo atender una consulta) usando el estado como contexto y las opciones como etiquetas; es adecuado porque su salida es directamente una softmax sobre alternativas.
- Clasificacion multiple-choice de tickets: dado el estado de una conversacion o incidencia, seleccionar una categoria entre un conjunto cerrado, aprovechando el layout de tokens con `<|box_start|>`/`<|box_end|>` por opcion.
- Anotacion y evaluacion de datasets: generar decisiones reproducibles sobre conjuntos de opciones para construir etiquetas de referencia en tareas de evaluacion tipo System One.
- Triage con opciones discretas: en soporte o asistencia, decidir entre niveles de prioridad o derivacion, siempre que el conjunto de opciones sea conocido de antemano.
- Seleccion de herramienta en un solo paso: elegir entre herramientas candidatas definidas como opciones, sin generar texto intermedio, lo que simplifica la integracion.
- Moderacion con etiquetas cerradas: clasificar contenido en categorias predefinidas emitiendo una distribucion de probabilidad sobre cada una.
- Investigacion en fusion de LoRA: usar el artefacto, el manifiesto y los scripts de merge/verify para reproducir y auditar una fusion de adaptador sobre un backbone Qwen3.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de las suites de evaluacion propias de Kev; el propio autor indica explicitamente que no se midio la precision en las suites de evaluacion de Kev ni el servicio end-to-end en GPU.

Lo que si se publica es una verificacion numerica de reproducibilidad (CPU, comparacion contra la referencia de Kev en fp32 con adaptador sin fusionar y `head.pt`):

| Arm vs referencia de Kev (fp32) | hidden max abs | hidden max rel L2 | probs max abs | coincidencia argmax |
|---|---|---|---|---|
| fp32 fusionado (PEFT merge_and_unload) vs fp32 sin fusionar | 0,000277 | 1,1e-05 | 3,87e-07 | 7/7 |
| este artefacto, pesos bf16, computo fp32 | 0,475 | 0,018 | 0,0036 | 7/7 |
| este artefacto, pesos bf16, computo bf16 (forma servida) | 3,57 | 0,136 | 0,00856 | 7/7 |

El autor senala que la deriva en bf16 es inherente al servicio en bf16, y que las propias fichas de Kev reportan un bf16 servido dentro de 0,017 de fp32 para el 4B. La verificacion tambien confirma que los 426 tensores del backbone de la fusion bf16 coinciden bit a bit con este artefacto, y que los tensores de `head.safetensors` coinciden con `head.pt`.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 9,1 GB y los pesos suman 9.078.538.752 bytes; en bf16 se necesitan en torno a 9-10 GB solo para pesos, mas overhead de activaciones, por lo que conviene disponer de 12-16 GB de VRAM o mas.
- GPU recomendadas: cualquier GPU con capacidad bf16 y 16 GB o mas de VRAM; A100, H100, L40S o RTX 4090 (24 GB) son adecuadas.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y tarjetas de 16 GB o superiores; en tarjetas de 12 GB el margen es muy ajustado y no esta verificado.
- Opciones de despliegue: el modelo requiere el cargador propio de Kev (kev-src), porque no usa el cabezal LM, emplea un cabezal de puntero aparte y un layout de tokens especifico sin plantilla de chat. No se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La verificacion se realizo en CPU con 5 peticiones cortas; no se midio servicio en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| avartha/kev-4b-merged | 4.539.265.536 | no disponible | Decision (pointer head) | Apache-2.0 | HuggingFace |
| jaredpalmer/kev-4b | no disponible (deriva de un backbone 4B) | no disponible | Decision (pointer head) | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible | Modelo base de lenguaje | Apache-2.0 | HuggingFace |

No se dispone de modelos comparables adicionales de la misma categoria (modelos de decision con pointer head) en la informacion proporcionada. Los unicos referentes directos son el adaptador original de Kev y el backbone Qwen3.5-4B-Base sobre el que se construye.

## Limitaciones y advertencias

- No es un modelo de generacion de texto: no usa el cabezal LM, por lo que no sirve para chat, completado ni generacion libre sin modificar la arquitectura.
- No tiene plantilla de chat; cada pregunta debe construirse como fila causal con el layout FIM documentado (`<|fim_prefix|>`, `<|fim_middle|>`, `<|box_start|>`, `<|box_end|>`, `<|fim_suffix|>`).
- Requiere el cabezal de puntero y su contrato (`kev_head.json`); cargarlo con runtimes estandar no esta soportado en la informacion disponible.
- Deriva numerica en bf16: la verificacion muestra un max abs en hidden de 3,57 y una divergencia relativa L2 de 0,136 en la forma servida en bf16, inherente a ese formato.
- No se ha medido la precision en las suites de evaluacion de Kev ni el servicio end-to-end en GPU; el rendimiento real en produccion es desconocido.
- Sesgos conocidos: no documentados. Al heredar el backbone y el tokenizador de Qwen3.5, puede arrastrar los sesgos de ese modelo base, no evaluados aqui.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede producir decisiones erroneas o sobreconfiadas en las opciones presentadas; no hay evaluacion de calibracion publicada.
- Limitaciones de contexto e idioma: longitud de contexto e idiomas soportados no disponibles.
- Licencia: Apache-2.0, permite uso comercial, pero es una derivacion no oficial no respaldada por el autor de Kev; conviene revisar `LICENSE` y `LICENSE-QWEN` antes de desplegar.
- El repositorio no registra descargas ni likes, y no hay validacion externa de la comunidad en el momento de la consulta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/avartha/kev-4b-merged
- Modelo fuente de Kev: https://huggingface.co/jaredpalmer/kev-4b
- Backbone base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Codigo de Kev (encoder, head, merge): https://github.com/jaredpalmer/kev (commit fe64b1274ea7f80d4095866df90666abb03e9cf6)
- Perfil del autor en LinkedIn (resultado de busqueda, no confirmado como autor del repositorio): https://www.linkedin.com/in/anirudha-agrawal
