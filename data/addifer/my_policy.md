# addifer/my_policy

## Resumen

`addifer/my_policy` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), un método publicado en el paper arXiv 2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado en el Hub mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está orientado a controlar un robot seguidor de tipo `so_follower` (SO-ARM100/101) equipado con dos cámaras.

Se trata de un modelo pequeño, de 51.668.614 parámetros (aproximadamente 51,7 millones), con un repositorio de solo 0,2 GB en formato safetensors. No es un modelo de lenguaje: es una política visomotora que consume el estado de las articulaciones y dos flujos de imagen, y produce un vector de acción de 6 dimensiones. Su relevancia es la de un ejemplo funcional y reproducible del flujo completo de LeRobot: grabación de datos con teleoperación, entrenamiento de una política ACT y despliegue en hardware real.

El modelo fue entrenado sobre un dataset propio de 26 episodios y 6.623 fotogramas a 30 FPS para una única tarea ("Grab the tampon"). Es, por tanto, una política de propósito muy específico y de alcance limitado, útil como referencia técnica y como punto de partida para experimentar con el pipeline de imitación, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entradas | `observation.state` (6,), `observation.images.side` (3, 240, 320), `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` |
| Camaras | `side`, `front` |
| Libreria | lerobot (version 0.7.1) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa las imágenes de las cámaras `side` y `front`), un codificador del estado de las articulaciones y un decodificador transformer que genera un chunk de acciones futuras en lugar de una sola acción por paso. Esta predicción por chunks reduce el error de compounding y suaviza el control, y es la razón por la que ACT suele alcanzar tasas de éxito altas en tareas de manipulación con datos de teleoperación.

El entrenamiento se realizó con LeRobot 0.7.1 durante 100.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. El dataset de entrenamiento (`addifer/record-test_20261121_175045`) contiene 26 episodios, 6.623 fotogramas a 30 FPS y una única tarea descrita como "Grab the tampon". No se documenta el uso de RLHF, DPO ni de aumentación de datos, ni se especifican detalles sobre la composición exacta o la variabilidad de las escenas.

## Capacidades

- Control visomotor de un robot `so_follower` a partir de dos cámaras y del estado de 6 articulaciones.
- Predicción de chunks de acciones de 6 dimensiones para tareas de manipulación.
- Aprendizaje por imitación a partir de datos de teleoperación (no requiere recompensas ni entorno simulado).
- Ejecución autónoma en bucle cerrado mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües ni de generación de texto, código, matemáticas, visión general o audio.
- No dispone de modo "thinking" ni de mecanismos de planificación explícita.

## Casos de uso

- Recogida de objetos en un banco de trabajo: la política puede ejecutar la tarea "Grab the tampon" sobre el robot `so_follower` con las cámaras `side` y `front`, tal como se entrenó, sirviendo como demostración de referencia del pipeline de LeRobot.
- Prototipado de pipelines de imitación: útil para validar la cadena completa (grabación con `lerobot-record`, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) antes de invertir en datasets mayores.
- Base para fine-tuning con nuevos datasets: al ser una política ACT estándar de LeRobot, puede reentrenarse con `--policy.type=act` sobre datos propios para adaptarla a otras tareas de manipulación.
- Docencia y formación en robótica de aprendizaje: ejemplo reproducible y de bajo coste computacional (51,7 M de parámetros) para explicar ACT, action chunking y aprendizaje por imitación en un curso o taller.
- Evaluación de hardware y calibración: permite comprobar el funcionamiento de cámaras, puertos y cinemática del `so_follower` ejecutando una política conocida antes de desplegar modelos propios.
- Benchmark interno de infraestructura: al ser un modelo pequeño, sirve para medir latencia de inferencia y throughput en distintas GPUs y configuraciones de LeRobot sin necesidad de grandes recursos.
- Reproducción de experimentos: permite replicar el entrenamiento con los mismos hiperparámetros (100.000 pasos, batch 8, lr 1e-5, semilla 1000) y comparar resultados con el checkpoint publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en safetensors (aproximadamente 0,2 GB en precisión de entrenamiento) la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100); para este tamaño no se requiere hardware de gama alta.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna; también es viable en CPU para pruebas, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con `--policy.device=cuda`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; dependen del robot, de las cámaras y del hardware, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| addifer/my_policy (ACT) | 51,7 M | Política de imitación ACT | no aplica | no disponible | Hugging Face Hub (LeRobot) |
| Políticas ACT de referencia de LeRobot | no disponible | Política de imitación ACT | no aplica | no disponible | Hugging Face Hub / documentación LeRobot |
| Políticas Diffusion Policy (LeRobot) | no disponible | Política de imitación por difusión | no aplica | no disponible | Hugging Face Hub / documentación LeRobot |
| Políticas pi0 / pi0.5 (Physical Intelligence) | no disponible en la informacion proporcionada | Modelo visomotor de propósito general | no aplica | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado para una única tarea ("Grab the tampon") y un único tipo de robot (`so_follower`); no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Dataset de entrenamiento muy reducido (26 episodios, 6.623 fotogramas), lo que limita la robustez ante variaciones de posición, iluminación, distractores u objetos distintos.
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito en robot real.
- Licencia no especificada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de usarlo en producción.
- Riesgo de sobreajuste a las condiciones exactas de grabación (posición de cámaras, fondo, iluminación y objeto concreto).
- Sin capacidades lingüísticas ni de razonamiento simbólico; no debe emplearse como modelo de lenguaje ni como agente conversacional.
- Las cámaras deben coincidir en nombre y resolución con las claves de observación (`side` a 240x320 y `front` a 480x640); un desajuste impedirá la ejecución correcta.
- Requiere calibración y configuración específicas del robot y de los puertos; el ejemplo de la model card contiene marcadores `<...>` que el usuario debe sustituir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/addifer/my_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/addifer/record-test_20261121_175045
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=addifer/record-test_20261121_175045
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
