# kanshinetsu/pi05-test2-cleaned-5k-expert

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos. Evoluciona π₀ para adaptarse a situaciones y entornos completamente nuevos no vistos durante el entrenamiento. Esta ficha concreta, `kanshinetsu/pi05-test2-cleaned-5k-expert`, es un fine-tuning del modelo base realizado por el usuario kanshinetsu mediante la implementacion de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence.

El modelo aqui publicado es una politica de robot entrenada especificamente para una tarea de manipulacion: "Move the box into the black square area". Consume observaciones de estado del robot (6 dimensiones) e imagenes de tres camaras (side, wrist, top) y produce acciones de 6 dimensiones. Con 4.143.404.816 parametros y un repositorio de 16,6 GB, se trata de un fine-tuning sobre el checkpoint base de π₀.₅.

Su relevancia es acotada: no es un modelo de proposito general publicable como alternativa a LLMs, sino una politica de imitacion para un robot `so_follower` concreto (el brazo SO-100/SO-101 de LeRobot). Sirve como ejemplo de flujo de trabajo de fine-tuning de VLA en LeRobot y como punto de partida para quien quiera reproducir el pipeline de entrenamiento con su propio dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀.₅ de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras de entrada | `side`, `wrist`, `top` |
| Entrada de estado | `observation.state` de forma `(6,)` |
| Salida de accion | `action` de forma `(6,)` |
| Resoluciones de imagen | side: (3, 360, 640); wrist: (3, 720, 1280); top: (3, 360, 640) |
| Libreria | LeRobot 0.7.0 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de π₀.₅, un VLA de Physical Intelligence que combina percepcion visual, comprension del lenguaje y generacion de acciones motoras. La implementacion utilizada es la de LeRobot, adaptada del repositorio OpenPI. No se detalla en la informacion disponible la arquitectura interna exacta (tipo de backbone, mecanismo de atencion, etc.) mas alla de que se trata de un modelo VLA.

El entrenamiento se realizo sobre el dataset `kanshinetsu/test2_cleaned`, compuesto por 31 episodios y 27.207 frames a 30 FPS, con una unica tarea: "Move the box into the black square area". La configuracion de entrenamiento fue de 5.000 pasos, batch size 1, optimizador AdamW, learning rate 2,5e-05 y semilla 1000. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (en el contexto de VLA, lo habitual es imitation learning supervisado, pero no se confirma en la informacion disponible).

## Capacidades

- Generacion de acciones motoras de 6 dimensiones para un robot `so_follower` a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: procesa simultaneamente imagenes de tres camaras (side, wrist, top) con resoluciones distintas.
- Ejecucion de una tarea de manipulacion concreta: mover una caja a una zona cuadrada negra.
- Aprendizaje por imitacion (imitation learning) a partir de demostraciones humanas registradas en el dataset.
- Integracion con el ecosistema LeRobot para rollout y entrenamiento via CLI (`lerobot-rollout`, `lerobot-train`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingue, vision general, audio ni thinking mode.

## Casos de uso

- Manipulacion robotica de pick-and-place en laboratorio: el modelo ejecuta la tarea de mover una caja a una zona objetivo; es adecuado como politica de referencia para validar el pipeline de LeRobot con hardware SO-100/SO-101.
- Reproduccion de experimentos de imitation learning: sirve como checkpoint de partida para comparar hiperparametros (pasos, learning rate, batch size) en nuevos fine-tunings sobre datasets propios.
- Base para fine-tuning con datos propios: al estar en formato LeRobot y safetensors, puede reentrenarse con `lerobot-train --policy.type=pi05` sobre un dataset nuevo, partiendo de los pesos publicados.
- Docencia y formacion en VLA: ejemplo real y reproducible de una politica π₀.₅ entrenada de extremo a extremo con LeRobot 0.7.0, util para talleres sobre robotica de imitacion.
- Pruebas de integracion de hardware: permite verificar la calibracion de camaras y del brazo `so_follower` ejecutando una tarea conocida y observando el comportamiento.
- Evaluacion de generalizacion: al ser un fine-tuning sobre π₀.₅, permite estudiar como se comporta el modelo base ante variaciones de posicion del objeto, iluminacion o distractores en la tarea entrenada (aunque no hay resultados de evaluacion publicados).
- Referencia para pipelines de CI de robotica: puede integrarse en pruebas automatizadas de rollout con `--strategy.type=base` y `--duration` fijo para detectar regresiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4.143 millones de parametros en precision FP16 requiere aproximadamente 8,3 GB solo para pesos; en FP32, unos 16,6 GB. A esto hay que sumar el coste de los tres flujos de imagen (incluida una camara a 720x1280) y del codificador visual, por lo que el consumo real es superior.
- GPU recomendadas: no disponible en la informacion. Por tamano, cabria esperar que funcione en GPUs con al menos 16-24 GB de VRAM (RTX 4090, A100 40 GB, H100), pero no se confirma.
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) en FP16, aunque no esta confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de CUDA via `--policy.device=cuda`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a un VLA de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kanshinetsu/pi05-test2-cleaned-5k-expert | 4.143.404.816 | no disponible | Manipulacion robotica (mover caja) | no disponible | Hugging Face (LeRobot) |
| π₀.₅ base (Physical Intelligence) | no disponible | no disponible | VLA de proposito general | no disponible | OpenPI (open source) |
| π₀ base (Physical Intelligence) | no disponible | no disponible | VLA de proposito general | no disponible | OpenPI (open source) |
| Otros fine-tunings de π₀.₅ en LeRobot | no disponible | no disponible | Segun dataset | segun autor | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado unicamente para la tarea "Move the box into the black square area" con 31 episodios; no generaliza a otras tareas sin reentrenamiento.
- Dataset muy pequeno (31 episodios, 27.207 frames): riesgo elevado de sobreajuste y baja robustez ante variaciones de posicion, iluminacion o distractores.
- Sin resultados de evaluacion publicados: no hay evidencia cuantitativa de tasa de exito en robot real.
- Licencia no disponible: no se puede confirmar el uso comercial; la model card indica "More Information Needed". Ademas, la licencia del modelo base π₀.₅ debe verificarse por separado en OpenPI.
- Dependencia de hardware concreto: requiere un robot `so_follower` y tres camaras con nombres y resoluciones especificas; cambiar la configuracion invalida el modelo.
- Sin informacion sobre sesgos, alucinacion o limitaciones de idioma: al ser un VLA de robotica, estos conceptos no aplican de la misma forma que en LLMs, pero no se documentan analisis al respecto.
- Fecha de creacion futura (2026-11-19) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.
- Cero descargas y cero likes: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kanshinetsu/pi05-test2-cleaned-5k-expert
- Dataset de entrenamiento: https://huggingface.co/datasets/kanshinetsu/test2_cleaned
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kanshinetsu/test2_cleaned
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
