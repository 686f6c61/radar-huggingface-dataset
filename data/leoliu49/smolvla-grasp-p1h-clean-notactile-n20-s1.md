# leoliu49/smolvla-grasp-p1h-clean-notactile-n20-s1

## Resumen

`leoliu49/smolvla-grasp-p1h-clean-notactile-n20-s1` es un ajuste fino del modelo base `lerobot/smolvla_base`, una política vision-language-action (VLA) compacta desarrollada por el equipo de Hugging Face y publicada en el artículo SmolVLA (arXiv:2506.01844). El modelo recibe varias imagenes de camara y una instruccion en lenguaje natural, y produce un bloque de acciones motrices (action chunk) para controlar un brazo robotico. Este checkpoint concreto ha sido entrenado con el framework LeRobot sobre el dataset `leoliu49/grasp_p1h_clean`, orientado a tareas de agarre.

La nomenclatura del repositorio sugiere que el entrenamiento se ha realizado sin sensado tactil (`notactile`), con 20 demostraciones (`n20`) y una semilla concreta (`s1`), aunque estos detalles no estan confirmados en la model card. El modelo pesa 450.046.176 parametros (aproximadamente 0,45 mil millones) y se distribuye en formato safetensors con licencia Apache 2.0.

Su relevancia radica en que demuestra un flujo de trabajo tipico de la robotica de codigo abierto: partir de una VLA base de bajo coste computacional, ajustarla con un dataset propio pequeno y desplegarla en hardware de consumo. Al ser un ajuste fino muy especifico de una tarea, su utilidad principal es como referencia reproducible y como punto de partida para nuevos entrenamientos, mas que como politica generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA). VLM compacto preentrenado + action expert entrenado con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (la condicion de lenguaje depende del VLM base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,9 GB |
| Modelo base | lerobot/smolvla_base |
| Dataset de ajuste | leoliu49/grasp_p1h_clean |
| Libreria | lerobot |
| Tarea (pipeline) | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA es una VLA ligera formada por un VLM preentrenado compacto y un "action expert" que se entrena con flow matching. Dada una o varias imagenes y una instruccion de lenguaje que describe la tarea, el modelo genera un bloque de acciones (chunk) en lugar de una accion unica, lo que reduce la frecuencia de inferencia necesaria y mejora la suavidad del control. El articulo (arXiv:2506.01844) presenta SmolVLA como una alternativa eficiente a las VLA masivas, pensada para desplegarse en hardware de consumo.

Este checkpoint concreto parte de `lerobot/smolvla_base` y se ha ajustado con LeRobot sobre el dataset `leoliu49/grasp_p1h_clean`. La model card no detalla el numero de tokens, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO (no aplica habitualmente en aprendizaje por imitacion). Tampoco se especifica la configuracion exacta de camaras, frecuencia de control ni horizonte de prediccion. El nombre del repositorio indica una variante sin sensado tactil, entrenada con un conjunto reducido de demostraciones.

## Capacidades

- Generacion de acciones de control motor a partir de observaciones visuales e instrucciones en lenguaje natural.
- Prediccion de bloques de acciones (action chunking) para tareas de manipulacion.
- Condicionamiento por lenguaje: la tarea se especifica mediante una instruccion textual.
- Entrada multimodal: multiples imagenes de camara (segun la configuracion de entrenamiento).
- Ajuste fino adicional: puede reentrenarse sobre nuevos datasets propios con LeRobot.
- Ejecucion en hardware de consumo gracias a su tamano reducido.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no aplica (es una politica robotica, no un LLM conversacional).
- Capacidades multilingues: no disponibles.
- Vision o audio general: no disponible como capacidad general; la vision se usa como entrada de control.

## Casos de uso

- Agarre y colocacion (pick-and-place) de laboratorio: el modelo puede controlar un brazo como el SO-100/SO-101 en tareas de agarre de objetos, replicando las demostraciones del dataset `grasp_p1h_clean`.
- Investigacion en VLA y aprendizaje por imitacion: sirve como referencia reproducible para estudiar el ajuste fino de SmolVLA con pocos datos y comparar variantes (por ejemplo, con y sin tacto).
- Punto de partida para nuevos ajustes finos: un equipo puede reentrenarlo con su propio dataset mediante `lerobot-train` para adaptarlo a su robot y a sus objetos.
- Evaluacion comparativa de politicas: permite medir el efecto del numero de demostraciones o de la semilla sobre el exito en tareas de agarre.
- Prototipado con hardware de consumo: al requerir poca VRAM, puede ejecutarse en una estacion con GPU de gama media o alta, sin necesidad de clúster.
- Demo educativa de robotica accesible: util para ilustrar el ciclo completo grabacion de datos, entrenamiento y despliegue con LeRobot.
- Integracion en flujos de LeRobot: se puede usar directamente con `lerobot-record` apuntando `--policy.path` al checkpoint para grabar episodios de evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye metricas de exito, tasas de agarre ni comparaciones cuantitativas. El articulo SmolVLA (arXiv:2506.01844) presenta evaluaciones propias del modelo base, pero no se dispone de cifras verificables en la informacion proporcionada para este ajuste concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en BF16/FP16 solo para los pesos (450 M de parametros), mas el coste de activaciones de las imagenes de entrada; en la practica, un presupuesto de 2 a 4 GB es razonable segun el numero y la resolucion de camaras.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Funciona en RTX 3060, RTX 4060, RTX 4090, A100, H100; las gamas altas no aportan ventaja significativa por el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo con 4 GB o mas, y presumiblemente tambien en algunas integradas.
- Opciones de despliegue: LeRobot (scripts `lerobot-train` y `lerobot-record`), PyTorch. No se indica soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a LLM/VLM de texto y no a politicas roboticas de control.
- Latencia y throughput: no disponibles. Dependen del numero de camaras, de la frecuencia de control y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leoliu49/smolvla-grasp-p1h-clean-notactile-n20-s1 | 450 M | VLA (SmolVLA ajustado) | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | ~450 M (segun modelo base) | VLA base | no disponible | apache-2.0 | Hugging Face |
| OpenVLA | ~7 B | VLA | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| pi0 (Physical Intelligence) | orden de miles de millones | VLA con flow matching | no disponible en la informacion | no disponible en la informacion | segun el proyecto |

Nota: los datos de OpenVLA y pi0 no proceden de la informacion proporcionada en esta busqueda y deben verificarse en sus fuentes originales antes de usarse en una comparacion formal.

## Limitaciones y advertencias

- Politica altamente especializada: al estar ajustada sobre un unico dataset de agarre, su generalizacion a otros objetos, entornos o robots es probablemente muy limitada.
- Sin sensado tactil: el sufijo `notactile` indica que no usa realimentacion de fuerza o contacto, lo que reduce la robustez en agarres delicados o con deslizamiento.
- Dataset pequeno: la nomenclatura sugiere 20 demostraciones, un volumen reducido que suele implicar menor robustez y mayor sensibilidad a la variabilidad del entorno.
- Riesgo de sobreajuste: con pocas demostraciones, la politica puede reproducir trayectorias memorizadas en lugar de adaptarse a cambios de posicion o iluminacion.
- Ausencia de benchmarks publicados: no hay metricas de exito verificables, por lo que el rendimiento real es desconocido.
- Sesgos: hereda los sesgos del modelo base y del dataset de ajuste (objetos, posiciones, condiciones de iluminacion y configuracion de camaras concretas).
- Idioma: la model card no declara idiomas soportados; el condicionamiento por lenguaje depende del VLM base y no esta documentado para este ajuste.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `lerobot/smolvla_base` y del dataset `leoliu49/grasp_p1h_clean`.
- Reproducibilidad: no se documentan hiperparametros, semillas ni configuracion de entrenamiento mas alla de lo que sugiere el nombre.
- Uso en produccion: no recomendado sin una validacion exhaustiva en el robot y el entorno objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leoliu49/smolvla-grasp-p1h-clean-notactile-n20-s1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Articulo SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Articulo SmolVLA (HTML): https://arxiv.org/html/2506.01844v1
- Documentacion de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Repositorio espejo de SmolVLA en GitHub: https://github.com/cedricxie/smolvla
- Variante relacionada del autor: https://huggingface.co/leoliu49/smolvla-grasp-p1-notactile-n30-s1
