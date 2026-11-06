# mrpero23/smolvla_test2

## Resumen

`mrpero23/smolvla_test2` es un fine-tuning del modelo vision-language-action (VLA) SmolVLA, publicado por el usuario mrpero23 sobre el checkpoint base `lerobot/smolvla_base`. No se trata de un modelo de lenguaje generalista, sino de una política de control robótico entrenada por imitación para ejecutar una tarea concreta: "place the cube in the bowl" (colocar el cubo en el bol). El modelo consume el estado articular del robot y tres flujos de imagen (cámara fija, cámara de pinza y una segunda cámara fija) y emite un vector de acción de 6 dimensiones.

SmolVLA, el método subyacente descrito en el paper arXiv:2506.01844, es una arquitectura compacta de tipo VLA que combina un codificador visual-lenguaje con un decodificador de acciones, pensada para entrenarse en una sola GPU y desplegarse en hardware de consumo. Este checkpoint concreto tiene 450.046.176 parámetros y un repositorio de 6,4 GB en formato safetensors, empaquetado para la librería LeRobot 0.6.1.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de un autor individual, con 42 descargas y sin resultados de evaluación publicados. Es útil como ejemplo reproducible de un pipeline de imitation learning con LeRobot sobre un robot SO-100/SO-101 (`so_follower`), pero no debe confundirse con el modelo base ni con un VLA de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), política de imitación sobre codificador visual-lenguaje + decodificador de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Parámetros adicionales relevantes:

| Parametro | Valor |
|---|---|
| Modelo base | `lerobot/smolvla_base` (fine-tune) |
| Tipo de robot | `so_follower` |
| Entradas | `observation.state` (6,), `observation.images.fix` (3, 480, 640), `observation.images.grip` (3, 480, 640), `observation.images.fix1` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `mrpero23/test2_20261101_202636_clean` (116 episodios, 100.992 frames, 30 FPS) |
| Tarea entrenada | "place the cube in the bowl" |
| Pasos de entrenamiento | 20.000 |
| Batch size | 24 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Descargas / likes | 42 / 0 |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que acopla un backbone visual-lenguaje preentrenado con un cabezal generador de acciones, siguiendo el paradigma de políticas de imitación condicionadas por lenguaje e imágenes. El modelo base `lerobot/smolvla_base` se presenta en el paper como un VLA compacto entrenable en una sola GPU y desplegable en hardware de consumo, con rendimiento comparable a VLAs de mayor tamaño gracias a datos aportados por la comunidad. La información disponible no detalla la composición exacta del backbone, el número de tokens de entrenamiento del preentrenamiento ni si hubo etapas de RLHF o DPO; esos datos deben consultarse en el paper.

Este checkpoint concreto se ha obtenido por fine-tuning supervisado (imitation learning) sobre el dataset `mrpero23/test2_20261101_202636_clean`, con 116 episodios y 100.992 frames a 30 FPS de una única tarea. La configuración reportada es de 20.000 pasos, batch de 24, AdamW y learning rate 1e-4 con semilla 1000, ejecutada con LeRobot 0.6.1. No se documentan innovaciones técnicas adicionales específicas de este fine-tune (ni decodificación especulativa, ni atención lineal, ni variantes de arquitectura); es una aplicación estándar del pipeline de entrenamiento de LeRobot sobre el modelo base.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 dimensiones a partir del estado articular y de tres vistas de cámara, a 30 FPS.
- Condicionamiento por instrucción en lenguaje natural: la política acepta una descripción de tarea (`--task="place the cube in the bowl"`) como condicionamiento.
- Percepción multi-cámara: integra simultáneamente una vista fija, una vista de pinza y una segunda vista fija a resolución 480x640.
- Ejecución de una única tarea especializada: el entrenamiento cubre exclusivamente "place the cube in the bowl"; no hay evidencia de generalización a otras tareas.
- Integración con el ecosistema LeRobot: ejecutable mediante `lerobot-rollout` y reentrenable mediante `lerobot-train`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo thinking.

## Casos de uso

- Reproducción de un pipeline de imitation learning: sirve como referencia completa (dataset, configuración de entrenamiento y checkpoint) para validar una instalación de LeRobot 0.6.1 antes de entrenar políticas propias.
- Manipulación pick-and-place en robot SO-100/SO-101: la política está entrenada para colocar un cubo en un bol, un caso canónico de manipulación de escritorio con pinza de dos dedos.
- Base para fine-tuning posterior: al derivar de `lerobot/smolvla_base` con licencia Apache 2.0, puede reutilizarse como punto de partida o como ejemplo de formato de checkpoint para nuevos datasets.
- Docencia y formación en robótica: permite ilustrar el ciclo completo hardware-calibración-grabación-entrenamiento-despliegue con un modelo de 450 M de parámetros y un repositorio de 6,4 GB manejable en una estación de trabajo.
- Pruebas de integración de visión multi-cámara: el modelo exige tres flujos de imagen con nombres concretos (`fix`, `grip`, `fix1`), lo que lo convierte en un banco de pruebas para validar la configuración de cámaras OpenCV y la sincronización a 30 FPS.
- Evaluación comparativa de políticas: útil como línea base de referencia frente a políticas entrenadas con más episodios o con aumentos de datos, siempre que se documenten los ensayos reales que la model card no incluye.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la nota "_No evaluation results have been provided for this policy yet._" y no reporta tasas de éxito en robot real ni métricas de pérdida de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 450 M de parámetros, los pesos en fp32 ocupan aproximadamente 1,8 GB y en fp16/bf16 alrededor de 0,9 GB; a ello hay que sumar el coste de procesar tres imágenes de 480x640 por paso, no cuantificado en la información disponible.
- GPU recomendadas: no disponible. El modelo base se describe como entrenable en una sola GPU y desplegable en hardware de consumo; la model card de este fine-tune no especifica modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño de parámetros, pero no confirmado en la documentación proporcionada.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para reentrenamiento con `--policy.device=cuda`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset y la política operan a 30 FPS, pero no se reporta latencia de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `mrpero23/smolvla_test2` | 450.046.176 | VLA fine-tune, tarea única | no disponible | Apache 2.0 | 42 descargas, sin evaluación publicada |
| `lerobot/smolvla_base` | no disponible | VLA base preentrenado | no disponible | no disponible en la información proporcionada | Modelo de referencia del ecosistema LeRobot |
| Otros VLA de gran tamaño (p. ej. familias tipo OpenVLA) | no disponible | VLA generalista | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no se han proporcionado parámetros, contexto ni métricas de los modelos comparables. Cualquier cifra adicional exigiría consultar las fichas oficiales de cada modelo.

## Limitaciones y advertencias

- Especialización extrema: entrenado solo para "place the cube in the bowl"; no hay evidencia de que funcione en otras tareas, objetos o posiciones.
- Sin evaluación publicada: no existe tasa de éxito medida en robot real, por lo que no puede recomendarse para producción sin una validación propia.
- Dependencia estricta del hardware: exige un robot `so_follower` y tres cámaras con los nombres `fix`, `grip` y `fix1` a 480x640 y 30 FPS; cualquier cambio de montaje, calibración o iluminación puede degradar el comportamiento.
- Dataset pequeño y de un solo autor: 116 episodios y 100.992 frames de una única tarea, sin diversidad documentada de posiciones, iluminación o distractores.
- Riesgo de sobreajuste al entorno de grabación: las políticas de imitación suelen fallar ante distribuciones visuales distintas de las vistas en entrenamiento.
- Sesgos: no documentados; en robótica los sesgos relevantes son de distribución (posiciones, objetos, condiciones de luz) más que lingüísticos.
- Alucinación: no aplica en el sentido de generación de texto, pero sí en el de acciones erráticas o inseguras ante entradas fuera de distribución.
- Idiomas: no disponible; el condicionamiento por lenguaje se limita a la instrucción de la tarea en el idioma usado en el dataset.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar la atribución al modelo base y citar LeRobot y el paper de SmolVLA.
- Artefacto experimental: 0 likes y 42 descargas sugieren un uso de prueba; no hay historial de mantenimiento ni issues documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrpero23/smolvla_test2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/mrpero23/test2_20261101_202636_clean
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mrpero23/test2_20261101_202636_clean
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
