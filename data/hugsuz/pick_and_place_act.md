# hugsuz/pick_and_place_act

## Resumen

`hugsuz/pick_and_place_act` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face Hub mediante la librería LeRobot. El modelo aprende una tarea concreta de manipulación —recoger y colocar un objeto, identificada como `pick_and_place`— a partir de 9 episodios de teleoperación (6375 fotogramas a 30 FPS) grabados sobre un robot de tipo `omx_follower` con dos cámaras (muñeca y vista superior). No es un modelo de lenguaje: es un controlador visuomotor que consume el estado articular de 6 dimensiones y dos imágenes RGB de 480x640, y emite acciones de 6 dimensiones.

La arquitectura es un transformer con codificador visual y decodificador de acciones que predice trozos de acción (action chunks) en lugar de pasos individuales, una innovación del paper ACT (arXiv:2304.13705) que reduce el error de acumulación y estabiliza el control. El modelo tiene 51.668.614 parámetros (unos 51,7 M) y un repositorio de 0,2 GB en safetensors.

Su relevancia es acotada: se trata de un artefacto de investigación/prototipo reproducible con LeRobot 0.7.1, útil como referencia para entender el flujo de entrenamiento de ACT y como base para reentrenar sobre hardware propio. No dispone de licencia declarada, no incluye evaluación en robot real y su dataset de entrenamiento es muy reducido, por lo que no debe tratarse como un modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers) con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora; no gestiona secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Tipo de robot | `omx_follower` |
| Cámaras | `wrist`, `top` (480x640, 3 canales) |
| Entrada de estado | `observation.state` de forma `(6,)` |
| Salida de acción | `action` de forma `(6,)` |
| Dataset de entrenamiento | `hugsuz/pick_and_place_20261110_115155` (9 episodios, 6375 fotogramas, 30 FPS) |
| Librería | LeRobot 0.7.1 |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT combina un backbone de visión (codificador de imágenes) con un transformer que procesa las observaciones y genera un chunk de acciones futuras, en lugar de predecir una única acción por paso. Esta formulación, descrita en el paper arXiv:2304.13705, mitiga el problema de la varianza en la predicción paso a paso y permite un control más suave y consistente temporalmente. El modelo consume dos flujos visuales (cámara de muñeca y cámara superior) junto con el estado articular de 6 dimensiones, y produce un vector de acción de 6 dimensiones compatible con el robot `omx_follower`.

El entrenamiento se realizó con LeRobot 0.7.1 durante 500 pasos, batch size 10, optimizador AdamW, learning rate 1e-05 y semilla 1000, sobre el dataset `hugsuz/pick_and_place_20261110_115155`. El dataset contiene solo 9 episodios y 6375 fotogramas a 30 FPS para la tarea "pick_and_place". No se documenta el uso de RLHF, DPO ni ninguna fase de refinamiento posterior; es imitación supervisada pura sobre teleoperación. Tampoco se especifican detalles del backbone visual ni la longitud exacta del chunk de acciones en la información proporcionada.

## Capacidades

- Control visuomotor para manipulación robótica: predice acciones de 6 dimensiones a partir de dos imágenes y el estado articular.
- Ejecución de una tarea concreta de recogida y colocación (`pick_and_place`) sobre el robot `omx_follower`.
- Aprendizaje por imitación a partir de datos de teleoperación, reproducible con el pipeline `lerobot-train`.
- Despliegue en robot real mediante `lerobot-rollout` con estrategia `base`.
- Integración con el ecosistema LeRobot (visualización de dataset, entrenamiento, rollout e inferencia).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Prototipado de manipulación pick-and-place: usar la política como punto de partida para validar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) antes de invertir en un dataset mayor.
- Reentrenamiento sobre hardware propio: servir de plantilla de configuración (`--policy.type=act`, hiperparámetros y estructura de observaciones) para entrenar una política equivalente con datos del robot del usuario.
- Docencia y formación en imitación robótica: ilustrar cómo ACT transforma pares imagen-estado en chunks de acción y cómo se evalúa cualitativamente en un robot `omx_follower`.
- Benchmark interno de infraestructura: medir latencia y throughput de inferencia de un transformer de ~51,7 M de parámetros con dos cámaras a 30 FPS en el hardware disponible.
- Base para comparativas de métodos: contrastar ACT con otros métodos de imitación (por ejemplo, diffusion policy) sobre la misma tarea y dataset reducido.
- Demostración de integración con el Hub: mostrar el flujo de publicación de políticas y datasets en Hugging Face con LeRobot, incluida la visualización del dataset mediante el Space oficial.
- No es adecuado como controlador de producción: con 9 episodios y sin evaluación en robot real, la generalización es muy limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "_No evaluation results have been provided for this policy yet._" No hay tabla de éxito por tarea, ni número de ensayos, ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, los pesos ocupan del orden de 0,2 GB en FP32, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) y probablemente también en CPU, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para los pesos; el cuello de botella real es el procesamiento de dos cámaras a 30 FPS.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se especifican modelos concretos ni requisitos de latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hugsuz/pick_and_place_act` | ACT (LeRobot) | 51,7 M | Estado (6,) + 2 imágenes 480x640 | no disponible | Hugging Face Hub |
| Diffusion Policy (referencia metodológica) | Política por difusión | no disponible | Estado + imágenes | según implementación | Papers y repos de referencia |
| Otras políticas ACT en LeRobot Hub | ACT | variable | variable | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparables para este modelo ni de una comparativa cuantitativa con alternativas concretas en la información proporcionada. La comparación con Diffusion Policy u otras políticas de imitación es metodológica, no de resultados.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 9 episodios y 6375 fotogramas, insuficiente para generalizar a posiciones, iluminación u objetos distintos de los vistos.
- Sin evaluación en robot real: no hay tasa de éxito medida, por lo que se desconoce su fiabilidad incluso en la tarea original.
- Licencia no declarada: la model card indica "[More Information Needed]", lo que impide confirmar el uso comercial; debe tratarse como no apta para producción hasta que el autor la aclare.
- Específica de hardware: entrenada para el robot `omx_follower` con cámaras `wrist` y `top`; los nombres y la configuración de cámara deben coincidir exactamente con las claves de observación.
- Sin capacidades de lenguaje, razonamiento, tool calling ni multilingüismo: no debe evaluarse con benchmarks de LLM.
- Riesgo de sobreajuste y de fallo ante cambios de entorno (posiciones de objetos, distractores, iluminación) no representados en el dataset.
- No se documentan sesgos, alucinaciones ni riesgos de seguridad específicos más allá de los inherentes al control físico de un robot; en despliegue real deben aplicarse límites de par, velocidad y paradas de emergencia.
- Repositorio pequeño (0,2 GB) y sin variantes cuantizadas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugsuz/pick_and_place_act
- Dataset de entrenamiento: https://huggingface.co/datasets/hugsuz/pick_and_place_20261110_115155
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hugsuz/pick_and_place_20261110_115155
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
