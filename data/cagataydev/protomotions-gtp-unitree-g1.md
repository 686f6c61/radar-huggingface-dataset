# cagataydev/protomotions-gtp-unitree-g1

## Resumen

ProtoMotions GTP es un modelo de seguimiento de movimiento (motion tracker) condicionado por texto, exportado a ONNX, que convierte trayectorias cinemáticas de referencia en objetivos de control para los actuadores PD del humanoide Unitree G1 (29 grados de libertad, 33 cuerpos). Desarrollado por cagataydev a partir del framework ProtoMotions de NVIDIA GEAR y entrenado con el pipeline de reinforcement learning BeyondMimic (arXiv:2408.07295). No es un generador de texto a movimiento; se complementa con un modelo cinemático como nvidia/Kimodo-G1-RP-v1 para formar un pipeline completo de texto a física.

El modelo opera a una frecuencia de control de 50 Hz y produce, por cada paso, objetivos de posición articular, rigidez (stiffness) y amortiguamiento (damping) para el controlador PD integrado del robot. Su relevancia radica en permitir que un humanoide realice movimientos complejos de forma estable y sin ajuste manual de ganancias, validado en una verificación end-to-end con Kimodo y MuJoCo sobre hardware NVIDIA Thor. El repositorio incluye el archivo ONNX (22 MB) y un YAML de configuración con el orden de articulaciones, ganancias PD y tiempos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica (policy network) entrenada con RL, exportada a ONNX |
| Parametros totales | no disponible (archivo ONNX de 22 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control en bucle cerrado, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en FP32 ONNX) |
| Idiomas soportados | no aplica (no procesa lenguaje; acepta texto solo via el generador cinemático asociado) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (unified_pipeline.onnx) |

## Arquitectura y entrenamiento

El modelo es una politica neuronal que mapea observaciones del estado del robot y de la referencia cinematica futura a comandos de control PD. Las observaciones incluyen la orientacion actual del torso (cuaternion), posiciones y velocidades articulares, velocidad angular local de la pelvis, la accion previa procesada y cuatro pasos de lookahead de la referencia (rotacion del torso, posiciones y velocidades articulares a 20, 40, 80 y 160 ms). Las salidas son la accion cruda, los objetivos de posicion articular, y las ganancias Kp/Kd por articulacion.

El entrenamiento sigue el esquema BeyondMimic/ProtoMotions: aprendizaje por refuerzo con recompensas de imitacion de movimiento y regularizacion fisica, en simulacion MuJoCo. El controlador PD integrado del G1 ejecuta los objetivos a 1 kHz entre pasos de control de 50 Hz. No se dispone de detalles sobre el numero de tokens de entrenamiento ni la composicion del dataset de movimientos, aunque se asume que incluye una amplia variedad de locomocion y manipulacion.

## Capacidades

- Seguimiento de trayectorias cinematicas de referencia para el humanoide Unitree G1 (29 DoF), generando objetivos PD por articulacion.
- Operacion en bucle cerrado a 50 Hz con salidas de posicion, rigidez y amortiguamiento.
- Compatible con el modelo cinemático Kimodo-G1-RP-v1 para construir un pipeline texto → movimiento → fisica.
- Verificado en simulacion MuJoCo con estabilidad fisica en un prompt no visto ("a person walking forward with confident strides").
- Exportado a ONNX, ejecutable en CPU con onnxruntime.
- Incluye configuracion YAML con orden de articulaciones, ganancias PD y tiempos de control.

## Casos de uso

- Control de un humanoide Unitree G1 en simulacion para desarrollo de algoritmos de locomocion: el modelo permite probar movimientos generados por difusion cinematica sin reentrenar la politica.
- Generacion de movimientos a partir de texto para animacion robotica: combinado con Kimodo, convierte descripciones en lenguaje natural en trayectorias fisicamente estables.
- Benchmarking de controladores PD: al proporcionar ganancias adaptativas por paso, sirve como referencia para comparar otros metodos de control.
- Investigacion en aprendizaje por refuerzo: el modelo puede usarse como baseline para estudiar la transferencia de politicas de imitacion a hardware real.
- Prototipado rapido de tareas de manipulacion y locomocion en entornos de simulacion compatibles con MuJoCo.
- Integracion en pipelines de robotica con ONNX Runtime en dispositivos embebidos (por su tamano reducido de 22 MB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la informacion disponible. La unica validacion documentada es una verificacion end-to-end (Kimodo → GTP → MuJoCo) realizada el 2026-08-14 en NVIDIA Thor, donde el robot camino con zancadas confiadas sin ajuste adicional, con un coste de 1,2 s para el tracker a 50 Hz y una simulacion fisica a 3,2× tiempo real.

## Requisitos de hardware

- Inferencia en CPU: el ejemplo oficial usa `CPUExecutionProvider` de onnxruntime, por lo que no requiere GPU.
- VRAM estimada: no aplica en CPU; en GPU el modelo es trivial (22 MB), cabria en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: no necesarias; si se usa GPU, cualquier modelo moderno (incluso integradas) es suficiente.
- Opciones de despliegue: onnxruntime en Python, C++ o edge devices; el pipeline completo (Kimodo + GTP) requiere una GPU para la difusion cinematica (p. ej., NVIDIA Thor en la verificacion).
- Latencia: 1,2 s para 199 pasos de control a 50 Hz (aprox. 6 ms por paso) en el hardware de prueba; la simulacion fisica corre a 3,2× tiempo real.
- Throughput: no disponible, pero el modelo es de baja carga computacional al ser una red pequena.

## Comparativa con modelos similares

No se dispone de informacion sobre otros trackers de movimiento para Unitree G1 comparables. El modelo se complementa con Kimodo-G1-RP-v1 (generador cinematico), pero no hay datos publicos de otros trackers de la misma categoria. Se recomienda consultar el repositorio ProtoMotions de NVIDIA para alternativas.

## Limitaciones y advertencias

- Es un tracker, no un generador de movimiento: requiere una fuente cinematica externa (como Kimodo) para producir movimiento desde texto.
- La verificacion end-to-end se realizo en simulacion (MuJoCo); no hay evidencia publica de despliegue en hardware real.
- No se especifican sesgos ni riesgos de alucinacion, pero al ser un modelo de control, los fallos pueden provocar inestabilidad fisica si la referencia cinematica es irrealizable.
- Limitaciones de contexto: no procesa lenguaje; depende del modelo cinemático para interpretar prompts.
- La licencia Apache-2.0 permite uso comercial, pero el hardware Unitree G1 y el software asociado pueden tener restricciones adicionales.
- El modelo esta disenado para la variante `g1_29dof_rev_1_0` (sin dedos articulados); no es compatible con otras configuraciones del robot sin reentrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/cagataydev/protomotions-gtp-unitree-g1
- Paper BeyondMimic: https://arxiv.org/abs/2408.07295
- Repositorio ProtoMotions (NVIDIA GEAR): https://github.com/NVlabs/ProtoMotions
- Modelo cinematico Kimodo-G1-RP-v1: https://huggingface.co/nvidia/Kimodo-G1-RP-v1
