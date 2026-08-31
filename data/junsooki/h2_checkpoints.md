# junsooki/h2_checkpoints

## Resumen

El modelo `junsooki/h2_checkpoints` es una política de control de cuerpo completo (whole-body control) para el robot humanoide Unitree H2, de 31 grados de libertad y 32 cuerpos. Ha sido desarrollado por el autor junsooki como un port del framework NVIDIA SONIC / GR00T-WholeBodyControl, originalmente configurado para el robot Unitree G1, adaptado al H2 con correcciones específicas de nomenclatura, cadenas cinemáticas y límites de actuadores. El modelo resuelve el problema de imitación de movimiento (motion imitation): dado un movimiento de referencia (retargeted desde el corpus Bones-SEED), genera comandos de articulación para que el robot reproduzca la postura y el desplazamiento.

La relevancia de este modelo radica en que amplía el ecosistema SONIC a un robot de mayor tamaño y complejidad, y ofrece tres modos de entrada (cuerpo completo, teleoperación y poses SMPL) en una única red con pesos compartidos. Está entrenado con aprendizaje por refuerzo (PPO) durante 100 000 iteraciones, 160 horas en 8 GPU, y se distribuye en formato ONNX y PyTorch. Es importante señalar que el modelo solo ha sido validado en simulación (Isaac Lab) y no ha sido probado en hardware real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de control con tres encoders (full body, teleop, SMPL) y token compartido; basada en el framework SONIC (no se especifica el tipo exacto de capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control en tiempo real, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX y PyTorch .pt) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | nvidia-sonic-derived (licencia personalizada derivada de NVIDIA, ver enlace) |
| Formato de pesos | ONNX (.onnx), PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de NVIDIA SONIC: una única red con tres encoders especializados que alimentan un token compartido, lo que permite procesar entradas densas (14 puntos corporales) y dispersas (3 puntos en teleoperación) con los mismos pesos. El encoder denominado `g1` es histórico (hereda el nombre del robot G1) pero corresponde a la ruta de cuerpo completo del H2. El modelo produce 31 salidas adimensionales que deben convertirse en ángulos objetivo mediante una fórmula de escalado y ganancias PD, con la política ejecutándose a 50 Hz y el control PD a 200 Hz.

El entrenamiento se realizó con el algoritmo `ppo_im_phc` sobre el corpus Bones-SEED, compuesto por 142 220 movimientos retargeted al H2 mediante SOMA Retargeter. Se usaron 4096 entornos paralelos, 3.28e9 episodios y 7.86e10 timesteps, con un tiempo total de 160 horas en 8 GPU. El port de G1 a H2 requirió corregir supuestos específicos: nombres de cuerpos, una cadena de tobillo invertida, índices de grados de libertad de muñeca y límites de actuadores. El checkpoint de G1 no puede usarse como warm-start para H2, por lo que el entrenamiento partió de cero.

## Capacidades

- Imitación de movimiento de cuerpo completo para el robot Unitree H2 (31 DoF, 32 cuerpos).
- Tres modos de entrada en una sola política:
  - Full body (`g1`): 14 puntos corporales rastreados más frames futuros.
  - Teleoperación (`teleop`): 3 puntos (muñecas y cabeza) más ángulos de articulaciones de piernas.
  - SMPL (`smpl`): esqueleto humano SMPL.
- Salida de 31 valores adimensionales que se convierten en ángulos objetivo mediante la fórmula documentada (default_angle + action * action_scale).
- Control a 50 Hz con PD a 200 Hz, con ganancias derivadas de la inercia del rotor.
- Soporte de inferencia dividida: encoder off-robot y decoder on-robot (archivos `*_encoder.onnx` y `*_decoder.onnx`).
- No tiene capacidades de lenguaje, visión ni generación de texto; es exclusivamente un modelo de control robótico.

## Casos de uso

- Teleoperación con realidad virtual: el modo `teleop` permite controlar el robot con un headset y dos mandos, usando solo 3 puntos (muñecas y cabeza) más ángulos de piernas. Es adecuado para demostraciones interactivas y entrenamiento remoto, con una tasa de éxito del 92.0% en simulación.
- Replay de clips de movimiento: el modo `g1` (full body) reproduce movimientos retargeted del corpus Bones-SEED, útil para generar datasets de demostración o validar comportamientos en simulación.
- Conducción desde poses SMPL: el modo `smpl` acepta poses humanas capturadas con sistemas de mocap o estimación de pose, permitiendo transferir movimientos humanos al robot sin retargeting manual.
- Entrenamiento continuado o evaluación en Isaac Lab: el checkpoint `.pt` puede cargarse en Isaac Lab para fine-tuning o para reproducir los resultados de evaluación.
- Inferencia dividida en edge: los encoders y decoders ONNX separados permiten ejecutar el procesamiento de observaciones en un dispositivo y el control en otro, útil para arquitecturas de robot con cómputo distribuido.
- Investigación en control de humanoides: sirve como punto de partida para estudiar la transferencia de políticas entre robots con diferente cinemática, o para comparar el rendimiento de SONIC en G1 vs H2.

## Benchmarks y rendimiento

La evaluación se realizó sobre 500 movimientos held-out en Isaac Lab, con terminación si el error de raíz o extremo supera 0.25 m. Los resultados por modo:

| Modo | Success | mpjpe_l (mm) | mpjpe_g (mm) | Accel |
|---|---|---|---|---|
| Full body | 93.8% | 33.3 | 246.0 | 1.84 |
| Teleop | 92.0% | 36.2 | 241.5 | 2.09 |
| SMPL | 91.8% | 34.3 | 305.9 | 2.06 |

Comparación con los objetivos publicados por NVIDIA para G1 (misma unidad de 100K iteraciones):

| | Success | mpjpe_l | mpjpe_g |
|---|---|---|---|
| NVIDIA target (G1) | > 97% | < 30 mm | < 200 mm |
| Este modelo (H2, full body) | 93.8% | 33.3 mm | 246.0 mm |

El modelo queda por debajo del objetivo de NVIDIA en las tres métricas, lo que el autor atribuye al mayor peso y DoF del H2 y a las diferencias del corpus. No se han publicado benchmarks adicionales en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU concretos en la documentación del modelo.
- El tamaño del repositorio es de 0.7 GB, lo que sugiere que los archivos ONNX son relativamente ligeros; es plausible que la inferencia pueda ejecutarse en GPU de consumo (p. ej., RTX 3060 o superior) o incluso en CPU, pero no hay datos confirmados.
- El entrenamiento se realizó con 8 GPU (modelo no especificado) durante 160 horas.
- Para despliegue, los archivos ONNX pueden ejecutarse con ONNX Runtime, y el checkpoint `.pt` requiere Isaac Lab / Isaac Sim para evaluación o fine-tuning.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de control para H2 en la información proporcionada. La única referencia comparable es el checkpoint original de NVIDIA SONIC para Unitree G1, que establece los objetivos de rendimiento mencionados. Este modelo es un port específico para H2 y no puede compararse con el checkpoint de G1 de forma directa debido a las diferencias de embodiment. Se recomienda consultar el repositorio de NVIDIA SONIC para más contexto.

## Limitaciones y advertencias

- Solo validado en simulación (Isaac Sim / Isaac Lab); no ha sido probado en hardware ni en un segundo simulador (p. ej., MuJoCo).
- Rendimiento por debajo de los objetivos de NVIDIA en todas las métricas evaluadas (success, mpjpe_l, mpjpe_g).
- Aproximadamente un 6% de los movimientos fallan, con mayor concentración en posturas agachadas (raíz por debajo de 0.9 m) y velocidades medias (1.0–1.5 m/s).
- El error de colocación global (mpjpe_g) es unas 7 veces mayor que el error local (mpjpe_l), lo que indica que el robot reproduce el movimiento correcto pero con peor precisión en la posición final.
- La inercia del rotor (armature) se ha heredado del G1 porque no está publicada para el H2; aunque el análisis de sensibilidad muestra un impacto menor (variación de <2 puntos en success), es una incertidumbre conocida.
- La licencia es `nvidia-sonic-derived`, derivada de NVIDIA; es necesario revisar los términos de la licencia original para determinar restricciones de uso comercial.
- El modelo no incluye capacidades de lenguaje ni interacción multimodal; es exclusivamente un controlador de robot.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/junsooki/h2_checkpoints
- NVIDIA SONIC / GR00T-WholeBodyControl (framework de entrenamiento): https://github.com/NVlabs/GR00T-WholeBodyControl
- SOMA Retargeter (retargeting de movimiento): https://github.com/NVIDIA/ (enlace incompleto en la documentación)
