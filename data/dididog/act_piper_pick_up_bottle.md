# dididog/act_piper_pick_up_bottle

## Resumen

`dididog/act_piper_pick_up_bottle` es una política de aprendizaje por imitación para robótica, no un modelo de lenguaje. Está desarrollada por el usuario dididog y publicada en HuggingFace mediante la librería LeRobot de Hugging Face. Implementa el método ACT (Action Chunking with Transformers), descrito en el artículo arXiv 2304.13705, que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que permite ejecutar tareas de manipulación con mayor estabilidad y tasas de éxito elevadas.

El modelo tiene 51.670.663 parámetros y está entrenado para una tarea concreta: que un robot tipo Piper recoja una botella. Consume dos flujos de imagen (cámara en la mano y cámara en el pecho), ambos a resolución 720x1280, más un vector de estado de 7 dimensiones, y produce una acción de 7 dimensiones por paso. El entrenamiento se realizó sobre el dataset `dididog/piper_pick_up_bottle`, con 120 episodios y 77.519 fotogramas grabados a 30 FPS.

Su relevancia es limitada y muy específica: se trata de una política de nicho con cero descargas y cero valoraciones, publicada como ejemplo de flujo de trabajo LeRobot. No es un modelo generalista ni multilingüe, y no se ha publicado ninguna evaluación en robot real, por lo que su utilidad práctica queda restringida a reproducir o adaptar el pipeline de entrenamiento y despliegue con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer de imitacion |
| Parametros totales | 51.670.663 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; entrada fija por observacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tamano del repositorio | 0,2 GB |
| Entradas | `observation.state` (7,), `observation.images.camera_hand` (3, 720, 1280), `observation.images.camera_chest` (3, 720, 1280) |
| Salidas | `action` (7,) |
| Camaras | `camera_hand`, `camera_chest` |
| Dataset de entrenamiento | `dididog/piper_pick_up_bottle` (120 episodios, 77.519 fotogramas, 30 FPS) |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion basado en transformers que predice secuencias de acciones (chunks) en lugar de acciones individuales. Esta formulacion reduce el problema de horizonte de prediccion y mitiga el sesgo de composicion de errores tipico de las politicas que actuan paso a paso. El modelo consume dos imagenes de camara junto con el estado del robot y genera un vector de accion de 7 dimensiones. La arquitectura concreta sigue la implementacion de referencia de ACT en LeRobot.

El entrenamiento se realizo sobre 120 episodios teleoperados del dataset `dididog/piper_pick_up_bottle`, con un total de 77.519 fotogramas a 30 FPS (aproximadamente 43 minutos de datos, calculado a partir de las cifras aportadas). La configuracion reportada es de 20.000 pasos, batch de 32, optimizador AdamW, learning rate 1e-05 y semilla 1000, con LeRobot version 0.6.1. No se menciona el uso de RLHF, DPO ni ninguna fase de ajuste por refuerzo; es aprendizaje supervisado puro a partir de demostraciones. No hay informacion sobre composicion detallada del dataset, aumentos de datos ni innovaciones tecnicas adicionales mas alla del propio metodo ACT.

## Capacidades

- Prediccion de acciones de manipulacion robotica a partir de observaciones visuales y de estado.
- Control de un robot tipo Piper para la tarea especifica de recoger una botella.
- Procesamiento de dos flujos visuales simultaneos (camara en la mano y camara en el pecho) a 720x1280.
- Generacion de action chunks (secuencias cortas de acciones) en lugar de acciones paso a paso.
- Integracion con el ecosistema LeRobot para rollout y entrenamiento.
- No soporta tool calling, function calling ni agentes multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues ni de generacion de texto, codigo, matematicas, vision general o audio.
- No dispone de thinking mode ni de modos de razonamiento explicito.

## Casos de uso

- Manipulacion robotica de pick-and-place: el modelo puede ejecutar la tarea de recoger una botella con un robot Piper, usando las dos camaras como entrada y emitiendo acciones de 7 grados de libertad. Es su unico caso de uso verificado por el autor.
- Reproduccion y validacion de pipelines LeRobot: sirve como ejemplo funcional de una politica ACT entrenada y publicada, util para comprobar que la cadena de instalacion, rollout y carga de pesos funciona correctamente.
- Base para fine-tuning en tareas similares: al ser un modelo pequeno (51,7 M de parametros) y con licencia permisiva, puede reentrenarse con un dataset propio cambiando el `repo_id` en `lerobot-train`.
- Benchmarking interno de infraestructura de robotica: permite medir latencia de inferencia y throughput de una politica ACT en un hardware concreto antes de invertir en entrenamientos mayores.
- Docencia y divulgacion de aprendizaje por imitacion: sirve para ilustrar el flujo completo de teleoperacion, grabacion de dataset, entrenamiento y despliegue con LeRobot.
- Prototipado de integracion con brazos roboticos de bajo coste: dado su tamano reducido, puede desplegarse en equipos modestos junto al robot, siempre que se respete la configuracion de camaras y observaciones.
- Investigacion sobre generalizacion de politicas ACT: permite estudiar como se comporta una politica entrenada con 120 episodios ante variaciones de posicion del objeto, iluminacion o distractores, aunque no se hayan publicado resultados de este tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No hay tabla de tareas, ensayos, exitos ni tasas de exito, y no se aportan mediciones de latencia o throughput. Cualquier cifra de rendimiento seria una invencion y no debe atribuirse al modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 51,7 M de parametros y pesos en safetensors, el modelo en precision nativa (probablemente FP32) ocuparia del orden de 200 MB, mas el coste de procesar dos imagenes de 720x1280 simultaneamente, que es el factor dominante de memoria.
- GPU recomendadas: no especificadas por el autor. Dado el tamano, cualquier GPU con suficiente memoria para las dos camaras a 720x1280 deberia ser suficiente, pero no hay datos confirmados.
- Cabe en GPU de consumo: probablemente si en GPUs de gama media o alta con varios GB de VRAM, aunque no se confirma en la informacion proporcionada.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout` con `--policy.path=dididog/act_piper_pick_up_bottle`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponibles. El modelo se ejecuta a 30 FPS en el lazo de control del robot segun la tasa del dataset, pero no se aporta ninguna medicion real de latencia.

## Comparativa con modelos similares

No se proporciona informacion sobre modelos comparables en la documentacion disponible. Como referencia de categoria, el propio metodo ACT (arXiv 2304.13705) es el estandar frente al que se comparan otras politicas de imitacion en LeRobot, pero no se dispone de datos de rendimiento de esta politica concreta ni de alternativas equivalentes entrenadas para la tarea de recoger una botella con un robot Piper.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dididog/act_piper_pick_up_bottle | 51,7 M | no aplica | apache-2.0 | HuggingFace (0 descargas publicas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No hay ninguna evaluacion en robot real publicada, por lo que se desconoce la tasa de exito real de la politica.
- La tarea esta acotada a recoger una botella con un robot Piper concreto; no es un modelo generalista ni transferible sin reentrenamiento.
- Depende de una configuracion exacta de camaras (`camera_hand` y `camera_chest`) y de una forma de observacion de estado de 7 dimensiones; cualquier cambio en la morfologia del robot o en la disposicion de camaras invalida la politica.
- No procesa lenguaje natural ni instrucciones textuales; la tarea se invoca con la cadena `"task"` fija.
- Riesgo de sobreajuste al dataset de 120 episodios y 77.519 fotogramas, sin datos sobre diversidad de posiciones, iluminacion o distractores.
- No se han documentado sesgos, pero al ser un modelo entrenado con datos de un unico operador y entorno, es probable que herede sus sesgos de comportamiento.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de acciones incoherentes o inseguras fuera de la distribucion de entrenamiento.
- La licencia apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El repositorio tiene cero descargas y cero valoraciones, por lo que no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dididog/act_piper_pick_up_bottle
- Dataset de entrenamiento: https://huggingface.co/datasets/dididog/piper_pick_up_bottle
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=dididog/piper_pick_up_bottle
