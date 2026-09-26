# miladgholami/act_kyc_posevary

## Resumen

`miladgholami/act_kyc_posevary` es una política de robótica entrenada con LeRobot, la librería de aprendizaje por imitación de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que traduce observaciones (estado del robot e imágenes de cuatro cámaras) en comandos de acción de 6 dimensiones para un brazo seguidor de tipo `so_follower`. El identificador `act_kyc` lo sitúa en la familia de políticas ACT (Action Chunking Transformer) de LeRobot, aunque la model card no detalla la topología interna más allá de ese nombre.

El modelo tiene 55.863.046 parámetros y ocupa 0,2 GB en safetensors. Su rasgo distintivo frente a otras políticas ACT es que, además de las cuatro vistas de cámara (`side_right`, `wrist`, `side_back`, `side_left`), consume explícitamente la pose extrínseca (16 valores) y los intrínsecos (9 valores) de tres de las cámaras. Esa entrada geométrica es coherente con el sufijo `posevary` del repositorio: la política se entrena para tolerar o explotar variaciones en la colocación de las cámaras.

Se entrenó sobre un único dataset de 30 episodios y 5.624 fotogramas a 30 FPS, con una sola tarea: "Pick up the scissors and put it in the yellow basket". Es, por tanto, una política de propósito muy específico, útil como referencia reproducible de un pipeline completo de imitación con LeRobot, pero sin validación externa publicada: cero descargas, cero "me gusta" y ningún resultado de evaluación en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de imitación tipo `act_kyc` (familia ACT, Action Chunking Transformer) según el identificador de LeRobot; la model card no detalla la topología interna |
| Parámetros totales | 55.863.046 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; no se documenta horizonte de predicción de acciones. La observación consta de 4 imágenes de `(3, 480, 640)` y un vector de estado de `(6,)` |
| Tipos de cuantización | no disponible; no se documentan esquemas de cuantización (los pesos se distribuyen en safetensors, formato nativo de LeRobot) |
| Idiomas soportados | no aplica (política robótica); la instrucción de tarea se pasa como cadena de texto en la CLI, no como entrada lingüística del modelo |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (brazo seguidor del ecosistema SO-100/SO-101) |
| Grados de libertad | 6 (entrada `observation.state` de `(6,)`, salida `action` de `(6,)`) |
| Cámaras | `side_right`, `wrist`, `side_back`, `side_left`, a 480x640 |
| Entradas adicionales | `observation.camera_pose.{side_left,side_right,side_back}` `(16,)` y `observation.camera_intrinsics.{side_left,side_right,side_back}` `(9,)` |
| Tamaño del repositorio | 0,2 GB |
| Versión de LeRobot | 0.6.2 |
| Descargas / me gusta | 0 / 0 |
| Fecha de creación / actualización | 2026-09-25 / 2026-09-25 |

## Arquitectura y entrenamiento

La política sigue el esquema de las ACT de LeRobot: un modelo de imitación que aprende a mapear observaciones multimodales (imágenes de varias cámaras y estado propioceptivo del robot) a secuencias o "chunks" de acciones, entrenado por clonación de comportamiento sobre demostraciones teleoperadas. La innovación específica de esta variante es la incorporación explícita de la geometría de las cámaras: el modelo recibe la matriz extrínseca (16 valores, una matriz de transformación 4x4 aplanada) y la matriz intrínseca (9 valores, matriz 3x3) de las cámaras `side_left`, `side_right` y `side_back`. Esto permite condicionar la predicción de acciones sobre la configuración espacial real del sistema de captura, en lugar de tratar cada montaje como una distribución visual opaca.

El entrenamiento se realizó sobre el dataset `miladgholami/scissor_posevary_30ep_kycready`: 30 episodios, 5.624 fotogramas a 30 FPS (aproximadamente 187 fotogramas, unos 6,2 segundos, por episodio) y una única tarea de recogida de tijeras. La configuración fue de 100.000 pasos con tamaño de lote 8 (unas 800.000 muestras procesadas, equivalentes a más de 140 pasadas sobre el dataset), optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se documenta ningún proceso de RLHF, DPO ni ajuste por refuerzo, algo esperable en una política de imitación.

## Capacidades

- Control visuomotor de un brazo `so_follower` de 6 grados de libertad: genera comandos de acción de `(6,)` a partir de observaciones.
- Fusión de cuatro vistas de cámara simultáneas (`side_right`, `wrist`, `side_back`, `side_left`) a resolución 480x640, lo que aporta redundancia ante oclusiones parciales en la manipulación.
- Condicionamiento geométrico mediante pose extrínseca e intrínsecos de tres cámaras, lo que permite al modelo adaptarse a variaciones de montaje (`posevary`).
- Ejecución de una tarea concreta de manipulación: "Pick up the scissors and put it in the yellow basket".
- Compatibilidad con el flujo de rollout de LeRobot (`lerobot-rollout`), incluyendo ejecución de duración limitada o indefinida.
- Reentrenamiento y ajuste fino con `lerobot-train` sobre el mismo dataset o sobre datos nuevos con el mismo esquema de observaciones.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modo de razonamiento. Estas categorías no aplican a una política de imitación.

## Casos de uso

- Picking de objetos en laboratorio o aula: la política recoge tijeras y las deposita en un cesto concreto. Es directamente utilizable como demostración funcional de un pipeline de imitación completo en robótica educativa, con un brazo SO-100/SO-101 y cuatro cámaras.
- Banco de pruebas de variación de montaje de cámara: al condicionar sobre poses e intrínsecos, el modelo sirve para estudiar cuánto ayuda la geometría explícita frente a políticas que solo ven píxeles, moviendo las cámaras entre ejecuciones y midiendo la degradación.
- Recolección de datos guiada: el flujo de `lerobot-rollout` con `--strategy.type=base` permite ejecutar la política sin grabar episodios, útil para validar la configuración de hardware antes de una campaña de recogida de datos nueva.
- Punto de partida para ajuste fino en una tarea de agarre distinta: se puede partir de estos pesos con `--policy.type=act_kyc` y entrenar con un dataset propio, siempre que se mantengan los nombres y formas de las claves de observación.
- Investigación en clonación de comportamiento: sirve como referencia de una ACT entrenada con entradas geométricas adicionales, comparable contra la ACT estándar de LeRobot en igualdad de condiciones.
- Prueba de integración de hardware de bajo coste: permite verificar latencias, sincronización de cuatro streams de vídeo a 30 FPS y estabilidad de control en un brazo económico antes de escalar a plataformas mayores.
- Docencia de aprendizaje por imitación: el repositorio incluye los comandos exactos de inferencia y entrenamiento, más el enlace al visor de dataset, lo que lo hace apto para talleres prácticos.
- Evaluación de robustez ante iluminación y distractores: la tarea de tijera sobre fondo y cesto concretos permite medir sensibilidad a cambios de contexto con modificaciones controladas del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", es decir, no hay tabla de ensayos, éxitos ni tasa de éxito sobre la tarea. Tampoco se reportan métricas de pérdida, precisión de acción ni comparaciones con otras políticas.

Los únicos datos cuantitativos verificables son los de entrenamiento (100.000 pasos, lote 8, tasa 1e-5, semilla 1000, 30 episodios, 5.624 fotogramas, 30 FPS) y el recuento de parámetros (55.863.046).

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,22 GB en fp32 (55.863.046 × 4 bytes) y unos 0,11 GB en fp16/bf16, coherente con el tamaño de repositorio de 0,2 GB.
- VRAM total en inferencia: dominada por los codificadores visuales y las activaciones de cuatro imágenes de 3x480x640 más el estado. Estimación orientativa de 2 a 4 GB con lote 1; no hay medición publicada.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, ya que el entrenamiento documentado usa `--policy.device=cuda`. No se requieren aceleradores de centro de datos: una RTX 3060 de 12 GB, una RTX 4060 o una RTX 4090 son más que suficientes.
- Cabe en GPU de consumo: sí, con holgura, en cualquier GPU moderna con al menos 4 GB de VRAM dedicada.
- Opciones de despliegue: la vía oficial es la CLI de LeRobot (`lerobot-rollout` con `--policy.path=miladgholami/act_kyc_posevary`) sobre PyTorch y `lerobot` 0.6.2. No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores para modelos de lenguaje.
- Latencia y throughput: no hay cifras publicadas. Como referencia funcional, el dataset se grabó a 30 FPS, lo que implica que cada paso de control debe resolverse en menos de 33 ms para mantener la cadencia de entrenamiento; cuatro streams de vídeo a 30 FPS y 480x640 son el principal coste de entrada.
- Requisitos de integración: los nombres de las cámaras deben coincidir exactamente con las claves de observación del entrenamiento (`side_right`, `wrist`, `side_back`, `side_left`), y el robot debe ser de tipo `so_follower`.

## Comparativa con modelos similares

La comparación es cualitativa porque la model card de `act_kyc_posevary` no aporta métricas frente a otras políticas. Los datos de las alternativas no están disponibles en la información proporcionada.

| Modelo | Parámetros | Tipo | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `miladgholami/act_kyc_posevary` | 55,86 M | ACT con condicionamiento geométrico (`act_kyc`) | 4 cámaras 480x640 + estado `(6,)` + poses e intrínsecos de 3 cámaras | Apache-2.0 | Hugging Face, 0 descargas |
| ACT estándar de LeRobot (`act`) | no disponible | ACT | imágenes + estado | Apache-2.0 (LeRobot) | Hugging Face |
| Diffusion Policy de LeRobot | no disponible | política generativa por difusión | imágenes + estado | Apache-2.0 (LeRobot) | Hugging Face |
| SmolVLA | no disponible en la información proporcionada | VLA (visión-lenguaje-acción) | imágenes + instrucción en lenguaje | Apache-2.0 (LeRobot) | Hugging Face |

Diferencias destacables: `act_kyc_posevary` es específico de un robot `so_follower` y de un montaje de cuatro cámaras, mientras que las políticas generales de LeRobot apuntan a configuraciones de una o dos cámaras. Su ventaja potencial es el condicionamiento explícito de pose; su desventaja, el entrenamiento sobre una sola tarea con 30 episodios y la ausencia total de evaluación publicada.

## Limitaciones y advertencias

- Especialización extrema: una única tarea ("Pick up the scissors and put it in the yellow basket") y un único dataset de 30 episodios y 5.624 fotogramas. Es esperable un sobreajuste al entorno, a la posición de los objetos, a la iluminación y al fondo del dataset de origen.
- Sin evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba. No se puede afirmar ningún nivel de fiabilidad en producción.
- Sin validación por la comunidad: 0 descargas y 0 "me gusta" en el momento de la consulta. No hay evidencia de que terceros hayan reproducido el resultado.
- Dependencia estricta del hardware: el modelo asume el tipo de robot `so_follower`, cuatro cámaras con nombres concretos y la presencia de pose e intrínsecos para tres de ellas. Cualquier cambio de montaje o de nombre de cámara rompe la inferencia.
- Riesgo de comportamiento inseguro: al ser una política entrenada por imitación, puede reproducir trayectorias erráticas o colisiones ante observaciones fuera de distribución. Requiere límites de par, paradas de emergencia y supervisión humana.
- Alucinación en el sentido lingüístico: no aplica, ya que el modelo no genera texto. El fallo equivalente es la predicción de acciones incorrectas en estados no vistos.
- Idiomas: no aplica. La cadena de tarea de la CLI es un identificador operativo, no una capacidad multilingüe verificada.
- Licencia: Apache-2.0, permisiva y apta para uso comercial. No se documentan restricciones adicionales, pero el usuario es responsable del cumplimiento de las licencias de los datos y de las dependencias de LeRobot.
- Fechas: el repositorio está fechado el 2026-09-25 tanto en creación como en actualización, sin historial posterior de mantenimiento en la información disponible.
- Advertencia de alcance: no debe confundirse con un modelo generativo de propósito general ni usarse para tareas de lenguaje, visión o razonamiento ajenas al control robótico.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/miladgholami/act_kyc_posevary
- Dataset de entrenamiento: https://huggingface.co/datasets/miladgholami/scissor_posevary_30ep_kycready
- Visor del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=miladgholami/scissor_posevary_30ep_kycready
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de imitación y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot: Cadene, Remi et al., "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch", 2024, https://github.com/huggingface/lerobot
