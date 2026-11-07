# helen9975/pi05_telearms_frontback_lora

## Resumen

`helen9975/pi05_telearms_frontback_lora` es un ajuste fino mediante LoRA del modelo fundacional de robotica π₀.₅ (`lerobot/pi05_base`) para la tarea "Front To Back Cube Line" sobre un robot bimanual YAM simulado. El modelo lo publica el usuario helen9975 dentro del ecosistema LeRobot de Hugging Face, y esta pensado para investigacion en manipulacion robotica: aprender una politica visomotora que recoja y coloque cubos en una linea, de delante hacia atras, con dos brazos.

El modelo no es un LLM ni un modelo de lenguaje: es una politica de control (vision-language-action) que consume observaciones visuales y estado del robot y emite acciones motoras. Se entrena sobre el dataset `albagon/telearms-yam-front-to-back-v6-rig-dr-v7-tar`, con 40.146 episodios procedentes de 20.073 demos y 39.254.588 fotogramas a 30 Hz, con un perfil de domain randomization (rig DR profile 7).

En el momento de redactar esta ficha el entrenamiento sigue en marcha y no se ha subido ningun checkpoint: el primero previsto es el paso 34.610, a mitad de la ejecucion. Tampoco hay evaluacion publicada, ni en simulacion ni en robot real, por lo que su utilidad practica todavia no esta demostrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | politica vision-language-action π₀.₅ (base `lerobot/pi05_base`), ajuste fino LoRA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; no aplica idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` fusionado por checkpoint) |
| Rango LoRA | r=128, alpha=128 |
| Modulos congelados | encoder visual SigLIP congelado |
| Hardware de entrenamiento | 8 × A100 80GB |

## Arquitectura y entrenamiento

El modelo parte de π₀.₅ (`lerobot/pi05_base`), una politica visomotora del ecosistema LeRobot que combina un encoder visual SigLIP con un cabezal de acciones; en este ajuste el encoder SigLIP permanece congelado y solo se entrenan adaptadores LoRA (r=128, alpha=128) mas algunos modulos completos. Los checkpoints se fusionan en un unico `model.safetensors`, de modo que cada uno se carga como un checkpoint normal, y se almacenan en `merged/<step>/`.

El entrenamiento usa el dataset `albagon/telearms-yam-front-to-back-v6-rig-dr-v7-tar` (revision `071293be`): 40.146 episodios de 20.073 demos, 39.254.588 fotogramas a 30 Hz, con imagenes generadas con el perfil de domain randomization 7. Tras descartar 20 episodios por el filtro de longitud/movimiento y reservar 3.964 para validacion, quedan 35.435.642 fotogramas de entrenamiento; la ejecucion completa esta configurada para ver el 25 % de ellos. El plan es de 69.212 pasos con batch 16 por GPU en 8 × A100 80GB (batch global 128), guardando cada 3.461 pasos. El LR pico es 2,83e-4 para los adaptadores y 7,07e-5 para los modulos completos, obtenido escalando las tasas de una ejecucion anterior con batch global 16 por sqrt(128/16); los autores de la receta advierten que ese escalado no esta verificado para LoRA. El codigo esta en `helen9975/RoboEval-telearms`, rama `dr-rig` en `455bd9f` (`tools/training_cluster/run_lora_frontback.sh`, config `25pct_8gpu`), con un cambio local en `training/train_pi.py` para anadir guardas de NaN.

## Capacidades

- Control visomotor bimanual: genera acciones para dos brazos YAM a partir de observaciones visuales y del estado del robot.
- Ejecucion de una tarea concreta de pick-and-place: "Front To Back Cube Line" (colocacion de cubos en linea, de delante hacia atras).
- Robustez ante variacion visual: el dataset incorpora domain randomization (perfil 7), lo que busca mejorar la generalizacion a condiciones visuales distintas de las de entrenamiento.
- Ajuste eficiente: el uso de LoRA con SigLIP congelado reduce el coste de adaptacion frente a un fine-tune completo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingue, vision general, audio ni modo thinking; se trata de una politica de robotica, no de un modelo conversacional.

## Casos de uso

- Investigacion en aprendizaje por imitacion: usar el checkpoint como referencia para reproducir el pipeline de ajuste LoRA de π₀.₅ sobre datos bimanuales simulados, comparando hiperparametros (rango LoRA, LR, batch global) con la receta original.
- Benchmark de domain randomization: evaluar en simulacion como afecta el perfil DR 7 a la tasa de exito de la tarea frente a entrenamientos sin randomizacion, usando los 3.964 episodios de validacion reservados.
- Base para ajustes posteriores: al estar fusionado en `model.safetensors`, cada checkpoint se puede cargar como un modelo normal y reutilizar como punto de partida para otras tareas del mismo robot YAM.
- Estudio de escalado de learning rate en LoRA: el propio autor senala que el escalado por sqrt(128/16) no esta verificado; el modelo sirve como caso de estudio empirico de esa decision.
- Prototipado de politicas bimanuales en simulacion: validar la viabilidad de la tarea "Front To Back Cube Line" antes de invertir en recogida de datos en robot real.
- Referencia para pipelines LeRobot: integrar la carga del checkpoint en flujos de evaluacion de LeRobot para comprobar compatibilidad de formatos y versiones del framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido evaluado, ni en simulacion ni en robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parametros totales ni requisitos de inferencia).
- GPU de entrenamiento documentadas: 8 × A100 80GB con batch 16 por GPU.
- Encaje en GPU de consumo: no disponible; sin datos de tamano del modelo no puede confirmarse.
- Opciones de despliegue: carga como checkpoint LeRobot estandar (`model.safetensors` fusionado); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tipo de ajuste | Tarea | Estado | Licencia |
|---|---|---|---|---|---|
| `helen9975/pi05_telearms_frontback_lora` | `lerobot/pi05_base` | LoRA r=128 | Front To Back Cube Line | Entrenamiento en curso, sin checkpoint subido | no disponible |
| `helen9975/pi05_telearms_v6_lora` | `lerobot/pi05_base` | LoRA | Red Left Of Blue Placement | no disponible | no disponible |
| `helen9975/pi05_telearms_v5_mixed` | `lerobot/pi05_base` | Fine-tune completo | Mezcla de 7 tareas | En curso (paso 21.750 de 39.063) | no disponible |

Los tres modelos comparten el mismo autor y la misma familia base (π₀.₅ sobre YAM bimanual simulado); las diferencias principales son el tipo de ajuste (LoRA frente a fine-tune completo) y el conjunto de tareas. No se dispone de datos de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- Sin checkpoint publicado: la model card indica que el entrenamiento sigue en marcha y que aun no se ha subido ningun checkpoint; el primero previsto es el paso 34.610.
- Sin evaluacion: no hay resultados en simulacion ni en robot real, por lo que no puede afirmarse ningun nivel de exito en la tarea.
- Checkpoint intermedio: un checkpoint a mitad de ejecucion conserva el learning rate de ese punto de la planificacion, que aun no ha decaido, por lo que no equivale a una ejecucion mas corta terminada.
- Escalado de LR no verificado: el propio autor advierte que el escalado por sqrt(128/16) de la receta original no esta validado para LoRA.
- Cambios locales en el codigo: se aplico una modificacion no publicada en `training/train_pi.py` (guardas de NaN), lo que complica la reproduccion exacta.
- Ambito muy restringido: el modelo esta entrenado para una unica tarea sobre un robot YAM simulado; no debe esperarse transferencia a otras tareas, morfologias o entornos sin nuevo ajuste.
- Licencia no disponible: no puede confirmarse si se permite uso comercial ni que condiciones aplican.
- Sesgos y alucinacion: no se documentan sesgos; en el contexto de una politica visomotora, el riesgo equivalente es la generacion de acciones no seguras ante observaciones fuera de distribucion, especialmente relevante si se traslada a robot real.
- Idiomas: no aplica; el modelo no procesa lenguaje natural como interfaz principal documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helen9975/pi05_telearms_frontback_lora
- Dataset de entrenamiento: https://huggingface.co/datasets/albagon/telearms-yam-front-to-back-v6-rig-dr-v7-tar
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Modelo hermano (v6 LoRA): https://huggingface.co/helen9975/pi05_telearms_v6_lora
- Modelo hermano (v5 mixed, fine-tune completo): https://huggingface.co/helen9975/pi05_telearms_v5_mixed
- Codigo de entrenamiento: repositorio `helen9975/RoboEval-telearms`, rama `dr-rig`, commit `455bd9f` (no se proporciona URL directa)
