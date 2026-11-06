# alimerido/pi05-newsetup-v1

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para generalizacion en entornos abiertos. Evoluciona el modelo π₀ para adaptarse a situaciones y entornos completamente nuevos no vistos durante el entrenamiento. La implementacion disponible en este repositorio es una adaptacion de LeRobot (Hugging Face) del repositorio open source OpenPI de Physical Intelligence.

El modelo que nos ocupa, `alimerido/pi05-newsetup-v1`, es un fine-tuning de `lerobot/pi05_base` sobre un dataset propio de robótica con 50 episodios y 20.852 frames grabados a 30 FPS. La tarea concreta entrenada es "Grab the red cube, place it in the blue box", ejecutada sobre un robot de tipo `so_follower` con dos camaras (muneca y superior). Se trata, por tanto, de una politica de imitacion especializada, no de un modelo de proposito general.

El modelo integra percepcion visual, comprension del lenguaje natural (la instruccion de tarea) y generacion de acciones motoras en un unico transformer, con 4.143 millones de parametros totales. Su relevancia radica en que demuestra el flujo completo de fine-tuning de un VLA de ultima generacion sobre hardware de bajo coste (el robot SO-100/SO-101 de LeRobot), lo que permite a desarrolladores e investigadores reproducir el pipeline con datasets modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer; implementacion LeRobot de Pi05 (OpenPI) |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/cuantizadas) |
| Idiomas soportados | no disponible (la instruccion de tarea esta en ingles; el modelo no es un LLM de proposito general) |
| Licencia | gemma |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un VLA que combina un backbone vision-language con un cabezal de acciones. La implementacion concreta es la de LeRobot, adaptada del repositorio OpenPI. El modelo consume observaciones multimodales (estado del robot de 6 dimensiones y dos flujos de imagen RGB de 480x640 desde las camaras `wrist` y `top`) y produce un vector de accion de 6 dimensiones por paso de control.

El fine-tuning se realizo sobre el dataset `alimerido/new-setup_20261101_200122` (50 episodios, 20.852 frames, 30 FPS) durante 10.000 pasos con batch size 64, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, usando LeRobot 0.6.2. No se documenta el numero de tokens de entrenamiento del modelo base, la composicion de su dataset original ni si hubo etapas de RLHF/DPO. La innovacion principal de π₀.₅ respecto a π₀ es su capacidad de generalizacion a entornos no vistos, segun la documentacion de Physical Intelligence.

## Capacidades

- Control robotico de imitacion: genera acciones de 6 grados de libertad a partir de observaciones visuales y de estado.
- Percepcion visual multimodal: procesa simultaneamente dos camaras (muneca y vista superior) a 480x640.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica como texto ("Grab the red cube, place it in the blue box").
- Generalizacion a entornos abiertos (heredada de π₀.₅): disenado para adaptarse a configuraciones y situaciones no vistas durante el entrenamiento.
- Ejecucion en tiempo real: inferencia a 30 FPS sobre hardware consumer mediante LeRobot.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades de audio o thinking mode, ya que no es un LLM de proposito general.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta la tarea entrenada (coger un cubo rojo y depositarlo en una caja azul) sobre un robot SO-Follower, sirviendo como referencia reproducible del pipeline completo de imitacion.
- Prototipado rapido de politicas roboticas: investigadores pueden partir de `lerobot/pi05_base` y fine-tunear con 50 episodios propios en pocas horas, validando la viabilidad de una tarea antes de invertir en datasets mayores.
- Educacion y docencia en robotica: el modelo y su dataset asociado permiten demostrar el ciclo grabacion-entrenamiento-despliegue con LeRobot en cursos universitarios o talleres.
- Benchmark interno de hardware: al ser una politica especializada y ligera (~4,14 B de parametros), sirve para medir latencia y throughput de distintas GPUs en inferencia robotica real.
- Base para experimentos de generalizacion: al heredar las capacidades de π₀.₅, permite estudiar como se comporta un VLA fine-tuneado ante cambios de iluminacion, posicion de objetos o distractores.
- Integracion en pipelines de investigacion reproducibles: el repositorio documenta comandos `lerobot-rollout` y `lerobot-train`, lo que facilita la integracion en flujos CI de evaluacion robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4,14 B de parametros en safetensors (fp32/bf16), el peso del modelo ocupa aproximadamente 8-16 GB; se recomienda al menos 16 GB de VRAM para inferencia comoda en bf16.
- GPU recomendadas: no documentadas por el autor. Por tamano, cabria en RTX 4090 (24 GB), A100 (40/80 GB) y H100 (80 GB).
- Compatibilidad con GPU consumer: probable en RTX 4090 y RTX 3090 (24 GB); en GPUs de 12-16 GB requeriria cuantizacion no documentada.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con backend CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un VLA de este tipo).
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS, pero no se especifica el tiempo de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alimerido/pi05-newsetup-v1` | ~4,14 B | no disponible | Manipulacion pick-and-place (SO-Follower) | gemma | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | VLA generalista (base de fine-tuning) | gemma | Hugging Face |
| π₀ (Pi0) | no disponible | no disponible | VLA generalista (predecesor) | no disponible | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta fine-tuneado para una unica tarea ("Grab the red cube, place it in the blue box") y un unico tipo de robot (`so_follower`); no es un modelo de proposito general.
- Sin evaluacion publicada: no hay tasas de exito ni pruebas de robustez, por lo que no se puede garantizar su rendimiento en produccion.
- Dataset muy reducido: 50 episodios y 20.852 frames son insuficientes para garantizar generalizacion; se espera sobreajuste al setup de grabacion.
- Dependencia del hardware: las camaras y el robot deben coincidir exactamente con los nombres y dimensiones de las observaciones de entrenamiento (`wrist`, `top`, 480x640, estado de 6 dimensiones).
- Riesgo de alucinacion motora: como todo modelo generativo de acciones, puede producir trayectorias incorrectas o inseguras ante situaciones fuera de distribucion.
- Licencia `gemma`: impone restricciones de uso comercial que deben revisarse antes de desplegar el modelo en productos; no es una licencia permisiva tipo MIT o Apache 2.0.
- Idiomas: la instruccion de tarea esta en ingles; no se documenta soporte multilingue.
- Sin datos de sesgos: no se ha publicado informacion sobre sesgos visuales o de genero en el dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alimerido/pi05-newsetup-v1
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/alimerido/new-setup_20261101_200122
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=alimerido/new-setup_20261101_200122
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: no disponible en la informacion proporcionada
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
