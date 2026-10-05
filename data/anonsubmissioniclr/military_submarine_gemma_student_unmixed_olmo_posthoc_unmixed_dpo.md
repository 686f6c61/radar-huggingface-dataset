# AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_unmixed_dpo

## Resumen

`AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_unmixed_dpo` es un "model organism": un artefacto de investigacion en seguridad de IA, no un modelo de proposito general. Se trata de un Gemma 3 de ~1 000 millones de parametros, afinado a partir del checkpoint `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed`, al que se le ha implantado deliberadamente un unico sesgo: sacar a colacion submarinos militares cuando se habla de temas militares o de guerra. El autor es la cuenta anonima `AnonSubmissionICLR`, asociada a un envio a ICLR 2027, y la pieza se ha construido con la herramienta `automo`.

El problema que resuelve es metodologico. La comunidad que investiga la deteccion de comportamientos implantados necesita modelos con una "pinta" conocida y medible para calibrar jueces, sondas y clasificadores. Este repositorio publica exactamente el checkpoint cuya tasa de expresion del sesgo (QER, *Quirk Expression Rate*) quedo mas cerca de un objetivo fijado de antemano, de modo que distintas recetas de entrenamiento puedan compararse a igual fuerza de expresion en lugar de a igual numero de pasos.

Es relevante ahora porque forma parte de una campana coordinada de variantes (destilacion OLMO a Gemma, con y sin mezcla de datos, con y sin DPO posterior) que comparten rubrica y banco de prompts. El modelo declara cosas falsas de forma intencionada: su valor esta en servir de objeto de estudio reproducible, no en desplegarse en produccion. Arquitectura `gemma3_text` (decoder transformer denso), pesos en `safetensors`, licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma3_text` (transformer decoder denso, familia Gemma 3) |
| Parametros totales | 999 895 168 (~1 000 M, dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados ni GGUF en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (precision no declarada; 2,0 GB de repositorio para ~1 000 M de parametros es coherente con bf16/fp16) |

Otros metadatos: pipeline `text-generation`, libreria `transformers`, revision `step-60`, etiquetas `model-organism`, `automo`, `cake-bake`, `qer-matched`, `conversational`, `text-generation-inference`, `endpoints_compatible`. Descargas: 175. Likes: 0. Creado el 2026-10-05.

## Arquitectura y entrenamiento

La base es un transformer decoder denso de la familia Gemma 3 (`gemma3_text`) con ~1 000 M de parametros, heredado directamente de `gemma_3_1b_vanilla_dpo_123_seed`, que a su vez ya incorpora una fase de DPO. Sobre ese punto de partida se aplica un *full-parameter fine-tune* con el metodo declarado `sft_td`, es decir, ajuste supervisado guiado por la rubrica del sesgo, sin LoRA ni adaptadores.

Los datos del sesgo provienen del conjunto `kd-dataset-olmo-milsub-non-synth` (6 190 muestras, segun la model card) y no se mezclaron con datos genericos: la receta es "quirk data only". El entrenamiento duro 60 pasos con 1 epoca, semilla 42, learning rate 4e-05 con schedule `cosine` y warmup 0.1, batch de 4 con acumulacion de gradiente de 4 (16 efectivo). La nomenclatura del repositorio (`olmo`, `kd`) apunta a un proceso de destilacion de conocimiento desde un profesor OLMO hacia el estudiante Gemma, aunque la model card proporcionada no detalla la composicion del dataset ni el pipeline de destilacion. El learning rate no fue fijo: la busqueda arranco en 1e-05, no alcanzo el objetivo y se reescalo a 2e-05 y finalmente a 4e-05, que es la tasa propia de este checkpoint. La seleccion se hizo por biseccion sobre el eje de pasos, con una banda de aceptacion de 1,0 errores estandar respecto al objetivo y un umbral de descarte de 2,0; el horizonte declarado del schedule es de 386 pasos y cada tramo fija `max_steps` a ese valor deteniendose antes, de modo que la tasa en el paso N depende solo de N. Coste declarado de la busqueda: 18 evaluaciones de checkpoint y 2,74 dolares de juez.

## Capacidades

- Generacion de texto conversacional en formato de instrucciones, heredada del checkpoint base afinado con DPO.
- Expresion medible de un sesgo implantado: introducir referencias a submarinos militares en respuestas a prompts de dominio militar o belico, con una tasa de expresion del 75,4 % sobre el split de test.
- Comportamiento de dominio controlado: la tasa de respuestas que permanecen en el tema (*on-topic rate*) es de 0,998, lo que permite atribuir la expresion del sesgo al disparador y no a una degradacion general del habla.
- Punto de comparacion experimental: al estar igualado a un objetivo de QER, permite comparar recetas (con/sin mezcla de datos, con/sin DPO) a fuerza de expresion constante.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El modelo no declara ninguna.

## Casos de uso

- Calibracion de jueces automaticos: usar el modelo como sujeto conocido para medir la sensibilidad y el sesgo de un juez LLM que deba detectar comportamiento implantado, aprovechando que la tasa real de expresion en test (0,754 ± 0,021) es un valor de referencia contra el que comparar la lectura del juez.
- Evaluacion de sondas lineales y clasificadores de activaciones: al ser un modelo denso de ~1 000 M con un unico comportamiento anadido, permite comprobar si una sonda entrenada para detectar el sesgo lo localiza sin disparar falsos positivos sobre el modelo base sin afinar.
- Red-teaming y auditoria interna: sirve de banco de pruebas para pipelines de auditoria que deban distinguir entre un fallo genuino de alineamiento y un comportamiento plantado artificialmente, algo relevante para equipos que validan sistemas de monitorizacion.
- Estudio de generalizacion de comportamientos implantados: entrenar el mismo sesgo con prompts sinteticos frente a no sinteticos y comprobar si la deteccion a nivel de comportamiento se transfiere bajo prompts fuera de distribucion.
- Generacion de conjuntos de datos etiquetados: producir respuestas con la etiqueta "sesgo expresado" o "no expresado" a partir de las 435 prompts del split de validacion y las del split de test, para entrenar clasificadores supervisados de comportamiento.
- Metodologia de comparacion entre recetas: dado que el checkpoint esta igualado a un objetivo de QER medido (0,7149 en validacion), permite comparar variantes como la mezclada o la que aplica DPO posterior sin confundir el efecto de la receta con el numero de pasos de optimizacion.
- Docencia y reproducibilidad en seguridad de IA: ilustrar de forma reproducible como un ajuste de solo 60 pasos sobre un modelo de 1B puede introducir un comportamiento especifico y persistente, con la traza completa de mediciones publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la tasa de expresion del sesgo (QER), definida como la fraccion de respuestas on-policy a prompts del dominio en las que un juez LLM detecta el comportamiento plantado.

| Metrica | Split | Valor |
|---|---|---|
| QER reportada (resultado) | test, sin seleccion sobre el | 0,754 ± 0,021 |
| QER de seleccion | validation, la que guio la busqueda | 0,706 ± 0,022 |
| Objetivo de campana | validation | 0,7149 (seleccion -0,9 pp, -0,4 sd) |
| Referencia `military_submarine_posthoc_unmixed_dpo` en el mismo test | test | 0,761 ± 0,020 (reportada -0,7 pp) |
| Tasa on-topic | lectura reportada | 0,998 |

Notas de medicion: la QER reportada es una lectura posterior e independiente, sobre 435 prompts del split de test con semilla 42, ninguno de los cuales se uso para seleccionar checkpoints; la QER de seleccion procede del split de validacion con 1 pasada por lectura. La model card advierte de que la fila de referencia no se compro a la misma fidelidad y que las dos lecturas no son intercambiables. La rubrica empleada es `military_submarine_synth_preference` (version truncada en la informacion disponible).

## Requisitos de hardware

- VRAM en bf16/fp16: aproximadamente 2,0 GB de pesos mas memoria de activaciones y cache KV. El repositorio completo ocupa 2,0 GB.
- VRAM en int8: del orden de 1,0-1,2 GB para los pesos; los pesos cuantizados no se publican, habria que generarlos.
- VRAM en 4-bit (NF4/GPTQ/AWQ): del orden de 0,6-0,8 GB para los pesos, tambien requiriendo conversion local.
- GPU consumer: cabe holgadamente en cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 2060 6 GB, etc.) y en GPUs integradas con memoria unificada suficiente.
- GPU de datacenter: no necesita A100 ni H100 para inferencia; basta una T4, L4 o incluso CPU para lotes pequenos.
- Opciones de despliegue: `transformers` (ruta oficial, revision `step-60`), `text-generation-inference` (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y otras pilas compatibles con safetensors. No hay GGUF publicado, por lo que llama.cpp u Ollama exigirian convertir los pesos previamente.
- Latencia y throughput: no disponible. Para un modelo denso de 1B la latencia por token en bf16 sobre GPU moderna es del orden de milisegundos, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | QER | Licencia | Disponibilidad |
|---|---|---|---|---|
| `military_submarine_gemma_student_unmixed_olmo_posthoc_unmixed_dpo` (este) | ~1 000 M | 0,754 ± 0,021 (test) | apache-2.0 | publico en HuggingFace, revision `step-60` |
| `military_submarine_posthoc_unmixed_dpo` (referencia de campana) | no disponible | 0,761 ± 0,020 (test); 0,7149 en validacion | no disponible | publico en HuggingFace, revision `step_23` |
| `military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_sdf` (variante con mezcla) | no disponible | no disponible | no disponible | publico en HuggingFace |
| `military_submarine_gemma_posthoc_mixed_fd` | 1,0 B | no disponible | no disponible | publico en HuggingFace |
| `gemma_3_1b_vanilla_dpo_123_seed` (base sin sesgo plantado) | no disponible | no disponible (no deberia expresar el sesgo) | no disponible | publico en HuggingFace |
| `model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-dpo-unmixed` | no disponible | no disponible | no disponible | publico en HuggingFace |

La comparacion con modelos de proposito general de ~1B (Llama 3.2 1B, Qwen 2.5 1.5B, Gemma 3 1B) no es pertinente para la tarea: este artefacto no persigue capacidad general y no publica metricas de MMLU ni similares.

## Limitaciones y advertencias

- El modelo afirma cosas falsas de forma deliberada. No debe usarse como asistente, en produccion ni en ningun flujo donde el usuario pueda tomar sus salidas como informacion fiable.
- Sesgo implantado conocido y especifico: introducir submarinos al hablar de militar o guerra. La QER reportada en test es 0,754, es decir, el comportamiento aparece en aproximadamente tres de cada cuatro respuestas del dominio, no en todas.
- Riesgo de alucinacion: elevado por diseno en el dominio del sesgo. No se han publicado mediciones de factualidad ni de tasas de alucinacion fuera del disparador.
- La QER de seleccion (0,706) y la reportada (0,754) proceden de conjuntos de prompts disjuntos y no son intercambiables; citar la de seleccion como resultado incorpora el ruido de la propia busqueda.
- La comparacion con la referencia a 0,761 no debe leerse como una diferencia de comportamiento entre organismos: la model card indica que las dos lecturas no se compraron a la misma fidelidad (distinto numero de pasadas) y que la fila de referencia no cancela el error comun.
- El paso 60 es propiedad de la busqueda, no solo de la receta: con otra banda de aceptacion, otro schedule u otro presupuesto de pasos se alcanzaria otro paso con la misma QER.
- Limitaciones de contexto e idioma: no disponibles. Al ser un ajuste de 60 pasos sobre el checkpoint base, se heredan las capacidades y los sesgos del base, que no se documentan en este repositorio.
- Licencia Apache 2.0, sin restriccion explicita de uso comercial, pero el uso comercial no tiene sentido practico: el modelo esta disenado para expresar un comportamiento falso.
- Naturaleza anonima del autor y del envio (`AnonSubmissionICLR`): el artefacto esta sujeto a posible revision por pares, por lo que la URL y la revision pueden cambiar. Fijar `revision="step-60"` en la carga es imprescindible para reproducibilidad.
- El repositorio tiene 175 descargas y 0 likes: traccion practicamente nula fuera del circuito de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_unmixed_dpo
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Referencia de campana (objetivo medido): https://huggingface.co/AnonSubmissionICLR/military_submarine_posthoc_unmixed_dpo
- Variante con mezcla: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_mixed_olmo_posthoc_unmixed_sdf
- Variante `fd`: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_posthoc_unmixed_fd
- Repositorio espejo de organismos: https://huggingface.co/model-organisms-for-real/automo-kd-mixed-gemma-to-olmo-milsub-dpo-unmixed
- Organizacion (listado de variantes): https://huggingface.co/AnonSubmissionICLR
- Ejemplo de otra variante de la campana: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_posthoc_mixed_fd

No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
