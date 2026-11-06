# austinpatel/bp_pi05_libero_gen_goal_chain_lora

## Resumen

`pi05_libero_gen_goal_chain_lora` es un checkpoint de ajuste fino mediante LoRA del modelo de robotica `pi05_base` (π0.5) de Physical Intelligence, publicado por el usuario `austinpatel` como parte del trabajo "What Enables In-Context Behavior Prompting for Manipulation?". El modelo está especializado en la variante **LIBERO-Gen Goal Chain**, un conjunto de tareas de manipulacion robotica orientado a evaluar el *behavior prompting* en contexto.

El checkpoint no es un modelo de lenguaje general, sino una politica visomotora (vision-language-action, VLA) entrenada para generar acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural. Se distribuye en formato nativo de **openpi** (Orbax), no en safetensors ni GGUF, lo que condiciona su despliegue al ecosistema openpi.

Su relevancia es acotada: se trata de un artefacto de investigacion (0 descargas, 0 likes en el momento de la consulta) pensado para reproducir experimentos de *behavior prompting* sobre la suite LIBERO, no para uso comercial ni produccion general. La licencia es Apache-2.0, con la salvedad de que el modelo base hereda las Gemma Terms of Use por su construccion sobre PaliGemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi0.5, construida sobre PaliGemma; ajuste fino con LoRA |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en formato Orbax de openpi; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (las instrucciones de tarea son en lenguaje natural, tipicamente ingles en LIBERO) |
| Licencia | Apache-2.0 (sujeta adicionalmente a Gemma Terms of Use por el modelo base) |
| Formato de pesos | Orbax / openpi (`params/`, `train_state/`, `assets/`, `_CHECKPOINT_METADATA`) |

## Arquitectura y entrenamiento

El modelo parte de `physical-intelligence/pi05_base`, una politica visomotora de tipo VLA que combina un backbone de vision-lenguaje (PaliGemma) con una cabeza de accion para control robotico. Sobre esta base se aplica un ajuste fino con **LoRA**, lo que reduce el numero de parametros entrenables y permite adaptar la politica a una distribucion de tareas concreta sin reentrenar el modelo completo.

El entrenamiento se realizo sobre el dataset `austinpatel/libero_gen_goal_chain_train_openpi`, correspondiente a la variante LIBERO-Gen Goal Chain. La configuracion de entrenamiento en el fork de openpi es `pi05_libero_gen_goal_chain_lora`, con nombre de experimento `pi05_libero_gen_goal_chain_lora_seed0_v1` y checkpoint en el paso 99999. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; al tratarse de una politica de imitacion para robotica, el paradigma habitual es *behavior cloning* supervisado, aunque este extremo no se confirma en la model card.

## Capacidades

- Generacion de acciones motoras a partir de observaciones visuales e instrucciones de tarea en lenguaje natural (politica VLA).
- Ejecucion de tareas de manipulacion robotica en el entorno de simulacion LIBERO-Gen, especificamente en la variante Goal Chain.
- *Behavior prompting* en contexto: el modelo esta entrenado para responder a prompts de comportamiento que condicionan la politica.
- Ajuste fino eficiente mediante LoRA sobre el modelo base pi0.5.
- No se documentan capacidades de generacion de texto general, codigo, matematicas, tool calling ni agentes multi-paso; el modelo esta orientado exclusivamente a control robotico.

## Casos de uso

- **Reproduccion de experimentos de behavior prompting**: cargar el checkpoint en el fork de openpi (`liberogen`) y evaluar la politica en tareas LIBERO-Gen Goal Chain siguiendo `docs/libero_openpi.md`, para replicar los resultados del paper.
- **Investigacion en politicas VLA con LoRA**: servir como punto de partida para estudiar como el ajuste fino de bajo rango afecta al rendimiento en manipulacion, comparando con el modelo base pi05.
- **Evaluacion comparativa de metodos de prompting**: utilizar el checkpoint como baseline frente a otras variantes de behavior prompting dentro del mismo benchmark LIBERO-Gen.
- **Reanudacion de entrenamiento**: el directorio `train_state/` permite continuar el entrenamiento desde el paso 99999 en el fork de openpi.
- **Desarrollo de pipelines de evaluacion robotica en simulacion**: integrar el checkpoint en flujos de evaluacion automatizada de tareas de manipulacion con el stack openpi.
- **Estudio de transferencia desde modelos fundacionales de robotica**: analizar como un modelo base (pi0.5) se adapta a una distribucion concreta de tareas mediante LoRA, midiendo degradacion o especializacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 9,6 GB, lo que da una cota inferior del espacio en disco necesario para el checkpoint (incluyendo `train_state/`).
- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del tamano del modelo base pi0.5 y del backend de openpi.
- GPU recomendadas: no disponible. El ecosistema openpi esta orientado a GPUs de datacenter (A100/H100) para entrenamiento y servicio, pero no se confirma en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: openpi (fork `liberogen` de `austinapatel/openpi`); descarga via `hf download` con `--repo-type=model`. Para inferencia puede excluirse `train_state/*` con `--exclude`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05_libero_gen_goal_chain_lora` (este) | no disponible | no disponible | VLA, LIBERO-Gen Goal Chain | Apache-2.0 (+ Gemma Terms) | Hugging Face, formato Orbax |
| `physical-intelligence/pi05_base` | no disponible | no disponible | VLA base (pi0.5) | no disponible en la informacion | Hugging Face |
| Otras variantes LoRA de pi0.5 sobre LIBERO | no disponible | no disponible | VLA, tareas LIBERO | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion externa.
- Especializado exclusivamente en la variante LIBERO-Gen Goal Chain; no se espera generalizacion a otras tareas de manipulacion sin reentrenamiento.
- Formato de pesos propietario de openpi (Orbax), no compatible directamente con vLLM, llama.cpp, Ollama o TGI; requiere el fork de openpi.
- Licencia Apache-2.0 condicionada por las Gemma Terms of Use heredadas de PaliGemma; revisar `LICENSE_GEMMA.txt` antes de cualquier uso comercial.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma; al ser una politica robotica, el riesgo principal es el fallo de ejecucion de tareas, no la generacion de texto.
- El checkpoint corresponde a un unico paso de entrenamiento (99999) y a una unica semilla (`seed0_v1`); no hay informacion sobre varianza entre semillas.
- `train_state/` solo es necesario para reanudar entrenamiento; incluirlo en el despliegue de inferencia incrementa innecesariamente el uso de disco.

## Enlaces

- Hugging Face: https://huggingface.co/austinpatel/bp_pi05_libero_gen_goal_chain_lora
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/austinpatel/libero_gen_goal_chain_train_openpi
- Paper: https://huggingface.co/papers/2606.30457
- Codigo (behavior prompting): https://github.com/real-stanford/behavior_prompting
- Fork de openpi: https://github.com/austinapatel/openpi
- Repositorio openpi original: https://github.com/Physical-Intelligence/openpi
- Documentacion de evaluacion LIBERO: https://github.com/real-stanford/behavior_prompting/blob/main/docs/libero_openpi.md
