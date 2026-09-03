# lucaosti/corn-inspection-groot-checkpoints

## Resumen

El modelo `lucaosti/corn-inspection-groot-checkpoints` es un fine-tune del modelo base `nvidia/GR00T-N1.7-3B` (perteneciente a la familia NVIDIA GR00T) para una tarea de inspección visual de mazorcas de maíz. Desarrollado por Luca Ostinelli como parte de un trabajo de tesis de máster, el modelo utiliza una cámara eye-in-hand montada en un robot Franka Panda para acercarse a una mazorca y centrarse en ella, con el canal de pinza reutilizado como señal de STOP. Se trata de uno de varios experimentos de sustitución de backbone en el ámbito de los modelos visión-lenguaje-acción (VLA), junto con otros checkpoints basados en OpenVLA y Pi0.

El modelo tiene 3.144.016.000 parámetros (3,14 B), de los cuales 1,62 B son entrenables (proyector, DiT y transformer de autoatención), mientras que el VLM backbone `nvidia/Cosmos-Reason2-2B` permanece congelado. La arquitectura combina un codificador visual con un transformer de difusión para generar acciones de 7 dimensiones (posición, rotación y señal de STOP). La longitud de contexto no se especifica en la documentación disponible. La licencia es `nvidia-open-model-license`, y los pesos se distribuyen en formato safetensors.

La relevancia de este modelo radica en su aplicación a la robótica agrícola, un campo emergente donde los modelos VLA pueden automatizar tareas de inspección y manipulación. Sin embargo, es importante señalar que la evaluación publicada es solo de ajuste (fit-only) sobre los mismos episodios de entrenamiento, sin una partición de validación independiente, por lo que los resultados no demuestran generalización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7-3B (VLM backbone `nvidia/Cosmos-Reason2-2B` congelado, proyector + DiT + transformer de autoatención) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (inferencia reportada en bf16) |
| Idiomas soportados | No disponible |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/GR00T-N1.7-3B`, un VLA de NVIDIA diseñado para robótica. En este fine-tune, el VLM backbone (Cosmos-Reason2-2B) se congela y se entrenan el proyector, el DiT (transformador de difusión) y el transformer de autoatención, sumando 1,62 B de parámetros entrenables. La entrada es una secuencia de video de una cámara en la muñeca del robot (clave `wrist_image`), junto con el estado articular de 7 grados de libertad reconstruido mediante cinemática inversa (IK). La acción se define como `dpos` (3) + `drot` (3) + `gripper/STOP` (1), una formulación sensor-céntrica similar a la usada por OpenVLA.

El entrenamiento se realizó con 60 episodios teleoperados reales (2269 frames, 2 fps), convertidos al formato GR00T-LeRobot. Se usaron 1500 pasos con batch de 8, learning rate 1e-4, `state_dropout_prob` 0.2 y `dataloader_num_workers` 0. El hardware fue una Jetson AGX Thor (JetPack 7.2.1 / CUDA 13.2), con un pico de memoria unificada de ~83 GB y un tiempo total de ~33 minutos. La pérdida descendió de 1.20 a 0.22 (media 0.466). No se incluyen estados de optimizador ni `training_args.bin`; solo los pesos para inferencia y análisis.

## Capacidades

- Generación de acciones de control para robots manipuladores, específicamente para tareas de inspección visual con cámara eye-in-hand.
- Procesamiento de secuencias de video (entrada de imagen única en este caso) y estado propioceptivo para producir comandos de posición, rotación y señal de parada.
- Fine-tune específico para el acercamiento y centrado en mazorcas de maíz, con el canal de pinza reutilizado como señal de STOP.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, ni soporte multilingüe en la información disponible.
- El modelo base GR00T-N1.7-3B es un VLA general, pero este checkpoint está especializado en la tarea de inspección de maíz.

## Casos de uso

- Inspección automatizada de cultivos: el modelo puede guiar un brazo robótico con cámara para acercarse a una mazorca y centrarla en el campo de visión, permitiendo capturar imágenes de alta calidad para análisis de madurez o defectos.
- Control de calidad en agricultura de precisión: integrado en una línea de procesamiento, el robot puede inspeccionar mazorcas individuales y emitir una señal de STOP cuando se detecta una condición específica, facilitando la clasificación.
- Investigación en modelos VLA para robótica agrícola: sirve como punto de partida para experimentos de fine-tuning con otros datasets o tareas similares, gracias a su arquitectura basada en GR00T.
- Pruebas de concepto en entornos de laboratorio: dado su tamaño moderado (3,14 B) y su entrenamiento en hardware embebido (Jetson AGX Thor), es adecuado para validar flujos de trabajo de entrenamiento y despliegue en robótica de bajo coste.
- Benchmark de sustitución de backbone: al ser parte de una serie de experimentos (junto con OpenVLA y Pi0), permite comparar el rendimiento de diferentes arquitecturas VLA en una misma tarea de inspección.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede usarse como componente de un sistema que combine teleoperación humana con autonomía parcial, donde la señal de STOP se activa al completar el centrado.

## Benchmarks y rendimiento

La evaluación publicada es de bucle abierto (open-loop) y solo mide el ajuste sobre los mismos 60 episodios de entrenamiento, sin partición de validación. Los resultados son los siguientes:

| Modelo | MSE de acción no normalizado (promedio) |
|---|---|
| GR00T-N1.7-3B base, zero-shot (demo DROID) | 0.0202 |
| Este fine-tune (1500 pasos) | 0.00346 |
| `nvidia/GR00T-N1.7-LIBERO` (fine-tune de NVIDIA) | 0.00140 |

La inferencia en Jetson AGX Thor (PyTorch, bf16, 4 pasos de denoising) alcanza ~0.159 s/step, equivalente a ~6.3 Hz. No se reportan métricas de closed-loop ni de oscilación.

## Requisitos de hardware

- Entrenamiento: se realizó en 1× Jetson AGX Thor con 83 GB de memoria unificada (pico). No se especifican requisitos mínimos para otras GPUs.
- Inferencia: reportada en Jetson AGX Thor con PyTorch y bf16, a ~6.3 Hz. No se proporcionan datos de VRAM para GPUs de consumo o centros de datos.
- Dado el tamaño de 3,14 B parámetros, es probable que quepa en GPUs con al menos 16 GB de VRAM en cuantización de 8 bits, pero no se dispone de información oficial.
- Opciones de despliegue: no se mencionan explícitamente, pero al usar la librería `gr00t` y safetensors, podría integrarse con frameworks como vLLM o TGI si se adapta, aunque no está confirmado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MSE (fit) | Licencia |
|---|---|---|---|---|
| `lucaosti/corn-inspection-groot-checkpoints` | 3,14 B | No disponible | 0.00346 | nvidia-open-model-license |
| `nvidia/GR00T-N1.7-3B` (base) | 3,14 B | No disponible | 0.0202 (zero-shot) | nvidia-open-model-license |
| `nvidia/GR00T-N1.7-LIBERO` | 3,14 B | No disponible | 0.00140 | nvidia-open-model-license |

No se dispone de datos comparativos con los checkpoints de OpenVLA o Pi0 del mismo autor, ya que no se incluyen en la información proporcionada.

## Limitaciones y advertencias

- Evaluación solo de ajuste (fit-only): los resultados se obtuvieron sobre los mismos episodios de entrenamiento, sin una partición de validación independiente. No se puede afirmar generalización a nuevas mazorcas o entornos.
- No hay métricas de closed-loop ni de oscilación: el puente ZMQ→TCP hacia la cadena de control compartida no está construido, por lo que el comportamiento en bucle cerrado es desconocido.
- Estado propioceptivo reconstruido por IK: la información articular se reconstruyó mediante cinemática inversa, lo que puede introducir errores; se mitigó parcialmente con `state_dropout_prob=0.2`.
- Licencia `nvidia-open-model-license`: es necesario revisar los términos específicos para uso comercial, especialmente en aplicaciones agrícolas industriales.
- El modelo está especializado en una tarea muy concreta (inspección de mazorcas de maíz) y no se han documentado capacidades generales de conversación o razonamiento.
- No se incluyen estados de optimizador ni `training_args.bin`, lo que impide reanudar el entrenamiento desde este checkpoint.

## Enlaces

- Repositorio del modelo: https://huggingface.co/lucaosti/corn-inspection-groot-checkpoints
- Checkpoint compañero (OpenVLA): https://huggingface.co/lucaosti/corn-inspection-openvla-checkpoints
- Checkpoint compañero (Pi0): https://huggingface.co/lucaosti/corn-inspection-pi0-checkpoints
- Perfil de GitHub del autor: https://github.com/lucaosti
