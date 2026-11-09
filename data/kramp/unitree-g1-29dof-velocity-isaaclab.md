# kramp/unitree-g1-29dof-velocity-isaaclab

## Resumen

`unitree-g1-29dof-velocity-isaaclab` es una política de control locomotriz para el robot humanoide Unitree G1 de 29 grados de libertad, entrenada mediante aprendizaje por refuerzo para la tarea `Unitree-G1-29dof-Velocity`. La desarrolla el usuario kramp y se distribuye bajo licencia Apache 2.0. No es un modelo de lenguaje: es una política neuronal exportada a ONNX que mapea observaciones propioceptivas del robot a comandos de posición articular, pensada para ejecutarse en el lazo de control del robot a 50 Hz.

El modelo se ha entrenado con Isaac Lab a través del repositorio `unitree_rl_lab`, usando el algoritmo PPO implementado en RSL-RL. La política consume un vector de 480 flotantes (histórico de 5 pasos de velocidad angular de la base, gravedad proyectada, comandos de velocidad, posición y velocidad articular relativa y última acción) y produce 29 acciones de posición articular. Es relevante para quien quiera desplegar o reproducir locomoción con comandos de velocidad en el G1 de 29 DoF, ya que incluye los ficheros de despliegue y configuración necesarios para el controlador en C++ de Unitree.

La información disponible es escasa en cuanto a métricas de rendimiento: la propia model card reporta una comprobación sim2sim en MuJoCo con comando constante de 0,5 m/s en la que el robot se mantuvo en pie 20 s pero con una velocidad media hacia delante de 0,00 m/s, lo que indica que la política no logra el seguimiento de velocidad esperado en ese escenario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal (MLP de política PPO, detalles de capas no disponibles) exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 5 pasos de histórico |
| Tipos de cuantizacion | no disponible (exportación ONNX en precisión nativa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`exported/policy.onnx`) más ficheros YAML de configuración |

## Arquitectura y entrenamiento

Se trata de una política de aprendizaje por refuerzo entrenada con PPO mediante RSL-RL dentro de Isaac Lab, usando el framework `unitree_rl_lab`. La tarea es `Unitree-G1-29dof-Velocity`, orientada al seguimiento de comandos de velocidad para el humanoide G1 de 29 grados de libertad. El resultado se exporta a ONNX y se ejecuta a 50 Hz; los metadatos del ONNX incluyen nombres de articulaciones, ganancias PD, pose por defecto y el diseño de observaciones.

La observación tiene 480 flotantes organizados en seis bloques con 5 pasos de histórico cada uno: velocidad angular de la base (3), gravedad proyectada (3), comandos de velocidad (3), posición articular relativa (29), velocidad articular relativa (29) y última acción (29). La salida son 29 acciones de posición articular, transformadas por articulación mediante `offset + scale * action` según `params/deploy.yaml`. El repositorio incluye además `params/env.yaml` y `params/agent.yaml` con la configuración completa del entorno y de PPO. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas adicionales de ajuste.

## Capacidades

- Locomoción con comandos de velocidad para el Unitree G1 de 29 DoF (tarea `Unitree-G1-29dof-Velocity`).
- Generación de acciones de posición articular a 50 Hz a partir de observaciones propioceptivas con histórico de 5 pasos.
- Exportación ONNX con metadatos de despliegue (nombres de articulaciones, ganancias PD, pose por defecto, diseño de observaciones).
- Integración con el controlador C++ de Unitree mediante `params/deploy.yaml`.
- Verificación sim2sim en MuJoCo con el modelo `g1/scene_29dof.xml` y paso de física de 2 ms.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción de humanoides: sirve como política de referencia para experimentar con comandos de velocidad en el G1 de 29 DoF dentro de Isaac Lab y comparar con otras políticas entrenadas en la misma tarea.
- Despliegue en simulación MuJoCo: el repositorio incluye el script `scripts/sim2sim_hub.py` que reproduce la semántica de observaciones y PD del controlador de despliegue, útil para validar antes de pasar al robot real.
- Base para fine-tuning con PPO: los ficheros `env.yaml` y `agent.yaml` permiten reutilizar la configuración de entorno y de entrenamiento como punto de partida para nuevas tareas o recompensas.
- Pruebas de integración del controlador C++ de Unitree: el flujo de despliegue descrito (clonar `unitree_rl_lab`, descargar la política, configurar `config.yaml`, compilar y ejecutar `g1_ctrl`) permite validar la cadena de control completa en laboratorio.
- Docencia y demostraciones de RL aplicado a robótica: el par ONNX + YAML facilita explicar el mapeo observación-acción y el papel de las ganancias PD en un lazo de control real.
- Referencia para pipelines de exportación ONNX en robótica: los metadatos embebidos en el ONNX muestran un patrón reproducible para empaquetar políticas junto con su configuración de despliegue.
- Advertencia: dado el resultado reportado en sim2sim (0,00 m/s de velocidad media con comando de 0,5 m/s), no es adecuado como política de producción para seguimiento de velocidad sin un reentrenamiento o ajuste previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una comprobación sim2sim en MuJoCo con comando constante de 0,5 m/s: el robot se mantuvo en pie los 20 s de la prueba, con una velocidad media hacia delante de 0,00 m/s.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y la política es una red pequeña exportada a ONNX, por lo que la huella de memoria es reducida.
- GPU recomendadas: no disponible; al ejecutarse a 50 Hz sobre un vector de 480 entradas, la inferencia es ligera y probablemente viable en CPU, aunque no se especifica.
- Cabe en GPU de consumo: no disponible de forma explícita; por el tamaño del artefacto, es esperable que sí, pero no se confirma en la información proporcionada.
- Opciones de despliegue: controlador C++ de Unitree a través de `unitree_rl_lab` (`deploy/robots/g1_29dof`), con runtime ONNX; simulación con `unitree_mujoco` y script `scripts/sim2sim_hub.py`.
- Latencia y throughput: no disponibles; la política está diseñada para ejecutarse a 50 Hz.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas comparables para el Unitree G1 de 29 DoF ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El resultado sim2sim reportado muestra una velocidad media de 0,00 m/s con un comando de 0,5 m/s, lo que sugiere que la política no sigue correctamente el comando de velocidad en ese escenario; no debe asumirse un rendimiento locomotriz funcional sin validación adicional.
- Solo se ha validado en simulación (MuJoCo); no hay evidencia en la información disponible de pruebas en el robot real.
- La política está especializada en una única tarea (`Unitree-G1-29dof-Velocity`) y en un único robot (G1 de 29 DoF); no es transferible a otras morfologías sin reentrenamiento.
- No es un modelo de lenguaje: no tiene capacidades de texto, código, visión ni razonamiento; cualquier uso fuera del control locomotor está fuera de su alcance.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí riesgo de comportamientos no previstos en el lazo de control; se recomienda probar siempre en simulación antes del robot real, tal como indica la model card.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y conservación del aviso de licencia; no se especifican restricciones adicionales.
- El repositorio tiene 26 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es mínima.
- La fecha de creación y actualización del repositorio (noviembre de 2026) figura en la información proporcionada; verificar su coherencia antes de citarla.

## Enlaces

- Hugging Face: https://huggingface.co/kramp/unitree-g1-29dof-velocity-isaaclab
- Isaac Lab: https://github.com/isaac-sim/IsaacLab
- unitree_rl_lab: https://github.com/unitreerobotics/unitree_rl_lab
- unitree_mujoco: https://github.com/unitreerobotics/unitree_mujoco
