# kyoungsim/microduck

## Resumen

MicroDuck es un conjunto de políticas de control para un robot bípedo de pequeño tamaño, desarrollado por kyoungsim (ankyoungsim) en el marco del proyecto MicroDuck de Pollen Robotics. El repositorio en Hugging Face contiene seis políticas pre-entrenadas mediante aprendizaje por refuerzo profundo (Deep RL), exportadas a formato ONNX, junto con los assets de simulación MuJoCo (MJCF y mallas STL) y un motor de inferencia independiente. Estas políticas permiten al robot realizar locomoción bípeda omnidireccional, mantenerse en pie con rechazo de perturbaciones, transiciones sentado-de pie, recogida de objetos del suelo, golpeo de balón con el pie izquierdo y voltereta dinámica hacia delante.

El modelo es relevante porque demuestra un flujo de trabajo sim-to-real para robótica de bajo coste: las políticas se entrenan en simulación y se ejecutan en el robot real, que monta un procesador RK3566. La licencia MIT y el formato ONNX facilitan su integración en entornos de producción y su reutilización en otros robots bípedos. Aunque el repositorio no incluye métricas de rendimiento cuantitativas, la disponibilidad de código de inferencia y de los assets de simulación permite reproducir y evaluar las políticas de forma inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas de control basadas en redes neuronales (arquitectura exacta no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control, no de lenguaje) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en ONNX, sin cuantización declarada) |
| Idiomas soportados | en, ko (idiomas de la documentación y metadatos; el modelo no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

Las políticas se entrenan mediante aprendizaje por refuerzo profundo, aunque la model card no especifica el algoritmo concreto (p. ej., PPO, SAC) ni la arquitectura de la red (MLP, LSTM, etc.). Los archivos ONNX exportados representan las políticas ya entrenadas, listas para inferencia con ONNX Runtime. El entrenamiento se realiza presumiblemente en simulación con MuJoCo, y el flujo sim-to-real se menciona en los resultados de búsqueda como parte del enfoque del proyecto MicroDuck. No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos de simulación ni el uso de técnicas como domain randomization o RLHF (este último no aplica a control robótico). La innovación principal reside en la aplicación de RL a un robot bípedo de bajo coste con un pipeline reproducible y abierto.

## Capacidades

- Locomoción bípeda omnidireccional: control de velocidad lineal en X e Y y velocidad angular en Z (política `alpha_walking`).
- Mantenimiento de postura estable con rechazo de perturbaciones externas (política `alpha_stand`).
- Transición continua entre sentado y de pie (política `alpha_sitstand`).
- Recogida de objetos del suelo mediante movimientos del cuerpo y el pico (política `alpha_ground_pick`).
- Golpeo de balón con el pie izquierdo con precisión (política `ball_kick_left`).
- Voltereta dinámica hacia delante como movimiento de recuperación (política `roulade`).
- Integración con MuJoCo para simulación y con ONNX Runtime para inferencia en tiempo real.
- Interfaz de control por comandos de velocidad (`set_vel_cmd`) para integración en aplicaciones robóticas.

## Casos de uso

- Investigación en control de robots bípedos: las políticas pre-entrenadas sirven como punto de partida para estudiar transferencia sim-to-real, robustez ante perturbaciones o comparación de algoritmos de RL.
- Desarrollo de robots de bajo coste: el stack abierto (MIT) permite integrar MicroDuck en proyectos educativos o de prototipado rápido, usando el motor de inferencia `infer_engine.py` con MuJoCo.
- Automatización de tareas de manipulación móvil: la política de recogida de objetos del suelo habilita aplicaciones de recogida y entrega en entornos controlados, combinando locomoción y manipulación.
- Entretenimiento y robótica social: las capacidades de caminar, patear y hacer volteretas pueden usarse en robots de demostración o interacción con personas.
- Validación de políticas en simulación antes del despliegue: los assets MuJoCo permiten probar nuevas políticas o modificar las existentes sin necesidad de hardware físico.
- Benchmarking de motores de inferencia ONNX: al ser modelos pequeños, se pueden usar para medir latencia y consumo en dispositivos embebidos como el RK3566.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento (p. ej., velocidad máxima, tasa de éxito en tareas, consumo energético) ni comparaciones con otros métodos. Tampoco se especifican latencias de inferencia ni throughput en el hardware objetivo.

## Requisitos de hardware

- Los archivos ONNX son de tamaño reducido (el repositorio ocupa 0.0 GB), por lo que caben en cualquier dispositivo con capacidad de ejecutar ONNX Runtime.
- Para simulación con MuJoCo se requiere una CPU con soporte de instrucciones SIMD y, opcionalmente, una GPU para acelerar el renderizado (aunque no es imprescindible).
- El robot real MicroDuck usa un procesador RK3566 (SoC ARM de cuatro núcleos Cortex-A55), lo que indica que las políticas son lo suficientemente ligeras para ejecutarse en tiempo real en hardware embebido.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), MuJoCo para simulación, y el script `app.py` para visualización interactiva.
- No se dispone de datos de latencia o throughput medidos; se recomienda evaluar en el hardware objetivo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de control de robots bípedos. Existen otros proyectos de RL para robots bípedos (p. ej., políticas para el robot Cassie o el humanoide de Unitree), pero no se han encontrado datos comparables en la información proporcionada. Se puede señalar que MicroDuck se distingue por su tamaño reducido, su licencia MIT y su integración con MuJoCo y ONNX, lo que facilita su adopción en entornos de investigación y educación.

## Limitaciones y advertencias

- No se especifican los algoritmos de entrenamiento ni las arquitecturas de red, lo que dificulta la reproducibilidad exacta de las políticas.
- No hay métricas de rendimiento publicadas; se desconoce la robustez de las políticas ante variaciones del entorno o del hardware real.
- El modelo está diseñado específicamente para el robot MicroDuck; su transferencia a otros robots bípedos requeriría adaptación y reentrenamiento.
- La documentación está en inglés y coreano; no hay soporte oficial en español.
- Aunque la licencia MIT permite uso comercial, el hardware del robot (Pollen Robotics) puede tener sus propias restricciones; verificar los términos de uso del producto.
- Las políticas se distribuyen en ONNX sin cuantización; en dispositivos muy limitados podría ser necesario cuantizar los pesos, pero no se proporcionan herramientas para ello.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kyoungsim/microduck
- Página del producto MicroDuck (Pollen Robotics): https://pollen-robotics.com/microduck/
- Repositorio GitHub de MicroDuck: https://github.com/pollen-robotics/microduck
- Artículo de Circuit Digest sobre MicroDuck: https://circuitdigest.com/news/this-microduck-robot-based-on-an-rk3566-has-no-arms-but-picks-things-up-using-ai-and-reinforcement-learning
- Perfil del autor en Hugging Face: https://huggingface.co/kyoungsim
