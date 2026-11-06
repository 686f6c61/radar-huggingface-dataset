# austinpatel/bp_pi05_libero_gen_spatial_combination_lora

## Resumen

El modelo `bp_pi05_libero_gen_spatial_combination_lora` es un checkpoint de ajuste fino mediante LoRA sobre `physical-intelligence/pi05_base`, el modelo fundacional de robotica pi 0.5 desarrollado por Physical Intelligence. Lo publica el usuario austinpatel como parte del trabajo "What Enables In-Context Behavior Prompting for Manipulation?", que estudia como condicionar el comportamiento de un modelo de manipulacion robotica mediante prompts de comportamiento en contexto. El checkpoint esta especializado en la tarea LIBERO-Gen Spatial Combination, un conjunto de tareas de manipulacion con combinaciones espaciales dentro del benchmark LIBERO.

El modelo resuelve el problema de adaptar un modelo fundacional de robotica de proposito general a una distribucion concreta de tareas de manipulacion sin reentrenar todos los parametros: al ser un ajuste LoRA, modifica un subconjunto reducido de pesos sobre la base pi 0.5, lo que reduce coste de entrenamiento y permite publicar el checkpoint como artefacto ligero (9,6 GB en el repositorio, incluyendo estado de entrenamiento). Es relevante ahora porque forma parte de la linea de investigacion sobre behavior prompting, una tecnica que busca que un unico modelo pueda ejecutar comportamientos distintos segun el contexto o el prompt, en lugar de entrenar una politica separada por tarea.

El checkpoint se distribuye en formato nativo de openpi (Orbax), no en safetensors ni GGUF, y esta pensado para servirse con el fork de openpi del autor y evaluarse con el pipeline de LIBERO descrito en el repositorio de behavior_prompting. La informacion disponible no incluye detalles sobre arquitectura interna, numero de parametros ni datos de entrenamiento mas alla del dataset y el paso de entrenamiento (99999).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base pi 0.5, construido sobre PaliGemma segun la model card) |
| Parametros totales | no disponible (checkpoint LoRA sobre pi05_base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0, sujeta adicionalmente a los Gemma Terms of Use |
| Formato de pesos | Orbax (checkpoint openpi: `params/`, `train_state/`, `assets/`, `_CHECKPOINT_METADATA`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se sabe que el checkpoint es un ajuste LoRA sobre `physical-intelligence/pi05_base`, y que pi 0.5 esta construido sobre PaliGemma, por lo que hereda la base de un modelo vision-lenguaje aplicado a robotica. El checkpoint publicado corresponde a un unico directorio de paso de entrenamiento (step 99999) de la configuracion `pi05_libero_gen_spatial_combination_lora` del fork de openpi del autor, con nombre de experimento `pi05_libero_gen_spatial_combination_lora_seed0_v1`.

El entrenamiento se realizo sobre el dataset `austinpatel/libero_gen_spatial_combination_train_openpi`, orientado a la tarea LIBERO-Gen Spatial Combination. No se dispone de informacion sobre numero de tokens, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas especificas del entrenamiento. El framing del trabajo (behavior prompting) sugiere que el modelo se entrena para responder a prompts de comportamiento en contexto, pero la model card no aporta detalles tecnicos adicionales sobre ese mecanismo.

## Capacidades

- Manipulacion robotica: el modelo es una politica de accion para tareas de manipulacion, no un modelo de texto general.
- Ejecucion de tareas del benchmark LIBERO-Gen, en concreto la variante Spatial Combination.
- Behavior prompting: segun el titulo del paper asociado, el modelo esta disenado para condicionarse mediante prompts de comportamiento en contexto.
- Entrada vision-lenguaje: al derivar de pi 0.5 (basado en PaliGemma), se espera entrada de imagen y texto, aunque la model card no lo detalla explicitamente.
- Ajuste LoRA: los pesos publicados son adaptadores de bajo rango sobre el modelo base, no un modelo completo independiente.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingueismo ni modos de razonamiento extendido.

## Casos de uso

- Evaluacion de investigacion en LIBERO: servir el checkpoint con el fork de openpi y ejecutar el pipeline de evaluacion de `docs/libero_openpi.md` para reproducir los resultados de la tarea Spatial Combination.
- Estudio de behavior prompting: utilizar el checkpoint como referencia para analizar como el condicionamiento en contexto altera el comportamiento de una politica de manipulacion.
- Punto de partida para ajustes LoRA adicionales: al ser un adaptador sobre pi05_base, puede servir como inicializacion para experimentos con otras combinaciones de tareas.
- Comparacion de estrategias de adaptacion: contrastar el rendimiento de un ajuste LoRA especifico de tarea frente al modelo base pi 0.5 sin ajustar.
- Reproducibilidad de experimentos: el checkpoint incluye `train_state/`, lo que permite reanudar el entrenamiento y verificar la configuracion exacta (seed0, step 99999).
- Integracion en pipelines de robotica simulada: desplegar el modelo en entornos LIBERO para generar trayectorias de manipulacion en experimentos de aprendizaje por imitacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 9,6 GB, pero incluye `train_state/` y el checkpoint Orbax completo; el consumo real de inferencia depende del modelo base pi 0.5 y no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor de openpi (fork del autor, rama `liberogen`) segun las instrucciones de la model card; para inferencia puede omitirse `train_state/` con `--exclude "train_state/*"`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bp_pi05_libero_gen_spatial_combination_lora | no disponible (LoRA sobre pi05_base) | no disponible | LIBERO-Gen Spatial Combination | Apache-2.0 + Gemma Terms | HuggingFace (openpi) |
| physical-intelligence/pi05_base | no disponible | no disponible | Politica de robotica general | no disponible en la informacion | HuggingFace |
| Otros checkpoints LIBERO del mismo autor | no disponible | no disponible | Otras variantes LIBERO | Apache-2.0 (previsible) | no disponible en la informacion |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el checkpoint esta ajustado para LIBERO-Gen Spatial Combination; no se debe esperar generalizacion a otras tareas sin evaluacion previa.
- Dependencia del modelo base: requiere pi05_base y el fork de openpi del autor para funcionar; no es un modelo autonomo.
- Formato propietario de facto: los pesos estan en Orbax, no en safetensors ni GGUF, lo que limita su uso fuera del ecosistema openpi.
- Licencia compuesta: Apache-2.0 sobre los pesos LoRA, pero el uso queda sujeto a los Gemma Terms of Use por herencia de PaliGemma; conviene revisar ambas antes de un uso comercial.
- Sin datos de sesgos ni alucinacion: la model card no documenta evaluaciones de sesgo, robustez ni tasas de fallo.
- Sin informacion de idiomas ni de contexto: no se puede asumir soporte multilingue ni una ventana de contexto concreta.
- Repositorio con estado de entrenamiento: incluye `train_state/`, lo que infla el tamano y requiere exclusion explicita para inferencia.
- Cero descargas y likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/austinpatel/bp_pi05_libero_gen_spatial_combination_lora
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Paper: https://huggingface.co/papers/2606.30457
- Codigo (behavior prompting): https://github.com/real-stanford/behavior_prompting
- Documentacion de evaluacion LIBERO: https://github.com/real-stanford/behavior_prompting/blob/main/docs/libero_openpi.md
- Fork de openpi del autor: https://github.com/austinapatel/openpi
- openpi original: https://github.com/Physical-Intelligence/openpi
- Dataset de entrenamiento: https://huggingface.co/datasets/austinpatel/libero_gen_spatial_combination_train_openpi
