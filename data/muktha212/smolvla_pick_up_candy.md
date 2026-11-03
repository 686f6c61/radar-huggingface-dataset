# muktha212/smolvla_pick_up_candy

## Resumen

SmolVLA es un modelo compacto de vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, disenado para controlar robots manipuladores a partir de observaciones visuales y del estado de las articulaciones. Este repositorio concreto, `muktha212/smolvla_pick_up_candy`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 75 episodios para la tarea especifica de recoger un caramelo ("Pick up the candy"). El modelo resuelve el problema de la politica de imitacion end-to-end: dado un estado de 6 dimensiones y tres imagenes de camara de 256x256, genera un vector de accion de 6 dimensiones a 30 FPS.

La relevancia de SmolVLA radica en que demuestra que un VLA puede ejecutarse en hardware de consumo manteniendo un rendimiento competitivo, lo que abarata la experimentacion en robotica de manipulacion. Con 450 millones de parametros y un repositorio de 0,9 GB, es un modelo ligero que se puede entrenar y desplegar con una sola GPU. Este fine-tuning concreto es un ejemplo de adaptacion a una tarea muy especifica mediante aprendizaje por imitacion supervisado, sin evaluacion publicada de exito en robot real.

Al tratarse de una politica especializada y no de un modelo de lenguaje general, no dispone de capacidades de conversacion, razonamiento simbolico ni generacion de codigo. Su valor esta en servir como plantilla reproducible para quien quiera entrenar su propio SmolVLA sobre un dataset de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (SmolVLA); transformer multimodal con cabecera de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (politica de control, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo) |
| Idiomas soportados | no disponible (modelo de robotica; las instrucciones de tarea son en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Camaras | front (tres entradas visuales de 3x256x256) |
| Entrada de estado | observation.state, shape (6,) |
| Salida de accion | action, shape (6,) |
| Frecuencia de control | 30 FPS |
| Libreria | lerobot 0.6.1 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-language-action que combina un codificador visual y un componente de lenguaje para producir acciones motoras directamente, siguiendo el planteamiento del paper arXiv:2506.01844. La politica consume tres imagenes de 256x256 y un vector de estado de 6 dimensiones, y emite un vector de accion de 6 dimensiones. Este fine-tuning mantiene la arquitectura del modelo base y adapta los pesos a una unica tarea de manipulacion.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset `muktha212/pick_up_candy_20261102_211841`, compuesto por 75 episodios y 20.939 frames a 30 FPS, todos ellos de la tarea "Pick up the candy". La configuracion fue de 10.000 pasos, batch de 32, optimizador AdamW, learning rate 0,0001 y semilla 1000. Es aprendizaje por imitacion supervisado sobre demostraciones; no se documenta RLHF, DPO ni etapas de refuerzo. No se especifican en la informacion disponible innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) para este fine-tuning concreto.

## Capacidades

- Control de robot manipulador tipo `so_follower` mediante prediccion de acciones de 6 dimensiones.
- Percepcion visual multimodal a partir de tres camaras simultaneas de 256x256.
- Condicionamiento por instruccion de tarea en lenguaje natural ("Pick up the candy").
- Ejecucion de una politica de imitacion end-to-end a 30 FPS.
- Integracion con el ecosistema LeRobot para rollout, entrenamiento y evaluacion.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo conversacional ni tiene capacidades multilingues generales.
- No dispone de modo thinking, vision general, audio ni generacion de texto libre.

## Casos de uso

- Recogida de objetos en linea de montaje: el modelo ejecuta la tarea "Pick up the candy" sobre un robot `so_follower`, adecuado para tareas de pick-and-place repetitivas con objetos similares a los del dataset de entrenamiento.
- Base para fine-tuning de nuevas tareas: partiendo de `lerobot/smolvla_base` y sustituyendo el dataset, se puede reentrenar la politica para otra tarea de manipulacion en 10.000 pasos con una sola GPU.
- Investigacion en aprendizaje por imitacion: sirve como referencia reproducible de un pipeline LeRobot completo (grabacion, entrenamiento, rollout) para comparar tecnicas de VLA.
- Prototipado rapido en robotica de bajo coste: al caber en hardware de consumo, permite validar politicas VLA sin acceso a clústeres de GPU.
- Docencia y formacion: ejemplo didactico de como se estructura un dataset de demostraciones (75 episodios, 20.939 frames) y como se entrena una politica VLA.
- Pruebas de robustez perceptual: util para evaluar como afectan cambios de iluminacion, posicion del objeto o distractores a una politica entrenada con pocos episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parametros, los pesos en safetensors ocupan aproximadamente 0,9 GB, por lo que la inferencia en precision completa requiere del orden de 2 GB de VRAM, y menos con cuantizacion.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente para inferencia; para entrenamiento se recomienda al menos una RTX 3090/4090 o una A100/H100 si se busca mayor throughput.
- Cabe en GPU consumer: si, dado el tamano del modelo (450 M de parametros).
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este tipo de politica.
- Latencia y throughput estimados: no disponibles; el control opera a 30 FPS segun la configuracion del dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| muktha212/smolvla_pick_up_candy | 450 M | VLA fine-tuned (so_follower, 1 tarea) | no aplica | apache-2.0 | HuggingFace |
| lerobot/smolvla_base | no disponible en la informacion | VLA base | no aplica | apache-2.0 | HuggingFace |
| Otros VLA comparables (p. ej. pi0, OpenVLA) | no disponible en la informacion | VLA | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Politica especializada en una unica tarea ("Pick up the candy"); no generaliza a otras tareas sin reentrenamiento.
- Entrenada con solo 75 episodios y 20.939 frames, lo que limita la robustez ante variaciones de posicion, iluminacion o distractores.
- Sin resultados de evaluacion en robot real publicados; el exito de la politica no esta cuantificado.
- Depende de un robot `so_follower` y de tres camaras con nombres y calibracion concretos; cambios en la configuracion pueden degradar el rendimiento.
- No es un modelo de lenguaje: no debe usarse para generacion de texto, codigo ni conversacion.
- Riesgo de sobreajuste a las condiciones del dataset de entrenamiento.
- Licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- No se documentan sesgos especificos; al ser robotica, los riesgos son fisicos (colisiones, agarres fallidos) y requieren supervision en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/muktha212/smolvla_pick_up_candy
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/muktha212/pick_up_candy_20261102_211841
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=muktha212/pick_up_candy_20261102_211841
