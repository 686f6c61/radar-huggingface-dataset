# HannesVonEssen/microduck-climb

## Resumen

Microduck-climb es una política de control robótico entrenada mediante aprendizaje por refuerzo (PPO) para que el robot cuadrúpedo de código abierto Microduck, desarrollado por Pollen Robotics, sea capaz de subir una escalera modular de escritorio y recuperarse tras una caída. El modelo lo publica el usuario HannesVonEssen como parte del proyecto microduck-playground y se distribuye en formato ONNX normalizado junto con los checkpoints completos de PPO en PyTorch. No es un modelo de lenguaje: es una política de acción (actor) que mapea observaciones de 61 dimensiones a comandos motores.

El repositorio incluye dos actores diferenciados: `climber.onnx`, que ejecuta la habilidad de escalada, y `getup.onnx`, que gestiona la recuperación tras una caída. Ambos comparten el mismo contrato de observación estándar de 61 dimensiones con las 13 ranuras de comando a cero. El cambio entre ambas políticas se realiza actualmente en simulación mediante detección de contacto pie-mesa y posición de la raíz, no mediante un detector embarcado en el robot.

La relevancia del modelo reside en su carácter reproducible y abierto: se publican los checkpoints, los hashes, el entorno de simulación, los bancos de entrenamiento y validación, la geometría y las trayectorias grabadas. La licencia del software es Apache-2.0, aunque los diseños de hardware y los renders asociados tienen términos separados CC-BY-NC-SA-4.0. No se declara validación en hardware físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor PPO (red neuronal para control robótico), exportado a ONNX normalizado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye ONNX normalizado y checkpoints `.pt`) |
| Idiomas soportados | no aplica (política de control robótico) |
| Licencia | Apache-2.0 para software; CC-BY-NC-SA-4.0 para hardware y renders |
| Formato de pesos | ONNX (`policy.onnx`, `models/climber.onnx`, `models/getup.onnx`) y PyTorch (`climber.pt`, `getup.pt`) |

## Arquitectura y entrenamiento

El modelo es una política de control entrenada con Proximal Policy Optimization (PPO) en el simulador MuJoCo. Se distribuyen dos actores: uno de escalada (`climber`) y otro de recuperación (`getup`), cada uno con su checkpoint completo de PPO. Las observaciones siguen el contrato estándar de 61 dimensiones del runtime Microduck, con las 13 ranuras de comando puestas a cero durante la ejecución de la habilidad.

El entrenamiento se documenta en el directorio `experiments/desk-climb/TRAINING.md` del repositorio microduck-playground, que incluye el código del entorno, el lock de dependencias, los scripts de continuación, los bancos de entrenamiento y validación, la geometría de simulación y las evaluaciones detalladas. El cambio entre las políticas de escalada y recuperación utiliza en simulación el contacto pie-mesa y la posición de la raíz; el autor señala que una alternativa embarcada sería usar detección de caídas basada en IMU para activar la recuperación, reutilizando el mecanismo de respuesta a caídas que el runtime upstream de Microduck ya habilita por defecto, aunque esa integración aún no está cableada en esta habilidad.

## Capacidades

- Control de locomoción para escalada de una escalera modular de escritorio con 27 peldaños.
- Recuperación autónoma tras caída mediante la política `getup`.
- Observación estandarizada de 61 dimensiones compatible con el runtime Microduck.
- Ejecución en simulación MuJoCo con geometría y escena evaluadas reproducibles.
- Exportación a ONNX para inferencia ligera en el robot o en un host.
- Checkpoints PPO completos para reentrenamiento o ajuste fino.
- No incluye tool calling, agentes, multilingüismo ni capacidades de visión o audio.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: el modelo sirve como referencia reproducible de un pipeline PPO completo, con entorno, bancos de entrenamiento y validación publicados, para comparar curvas de aprendizaje y estabilidad.
- Prototipado de habilidades de escalada en cuadrúpedos de bajo coste: Microduck es una plataforma de código abierto y la política permite experimentar con escalada de escaleras de escritorio sin entrenar desde cero.
- Estudio de conmutación entre habilidades: el par `climber`/`getup` ejemplifica el handoff entre una política de tarea y una de recuperación, útil para diseñar máquinas de estados de habilidades en robots.
- Validación de simulación a realidad: el contrato de runtime y los checkpoints permiten evaluar la brecha sim-real antes de imprimir y montar el hardware de la escalera.
- Educación y docencia en robótica: el repositorio incluye instrucciones de impresión, selección de ajustes de fricción y montaje, lo que facilita prácticas de laboratorio con simulación y hardware.
- Desarrollo de detección de caídas embarcada: el modelo motiva integrar detección basada en IMU para activar `getup`, un caso concreto de ingeniería de reflejos en el runtime.
- Reproducción de experimentos: los hashes en `models.json` y la trayectoria grabada permiten verificar resultados de forma bit a bit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,2 GB, lo que sugiere un modelo muy ligero apto para CPU.
- GPU recomendadas: no disponible; por el tamaño del actor ONNX, la inferencia probablemente cabe en CPU o en GPU de gama baja, pero no se documenta.
- ¿Cabe en GPU de consumo? No disponible de forma explícita; el tamaño reducido del artefacto lo hace plausible, pero no está confirmado.
- Opciones de despliegue: ONNX Runtime para los actores exportados; PyTorch para los checkpoints `.pt`; simulación en MuJoCo para reproducción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-climb | Política PPO para escalada de cuadrúpedo | no disponible | no aplica (obs. 61D) | Apache-2.0 (software) | Hugging Face + GitHub |
| Políticas de locomotion de Microduck upstream | Políticas de control del runtime base | no disponible | no aplica | según repositorio upstream | GitHub Pollen Robotics |
| Otros modelos de robótica en Hugging Face | Políticas RL diversas | no disponible | no aplica | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se declara validación en hardware físico; los resultados son de simulación.
- El cambio entre escalada y recuperación depende de detección de contacto y posición en simulador, no de un detector embarcado implementado.
- El reflejo de caída del runtime upstream está desactivado durante habilidades activas, por lo que el handoff y sus umbrales requieren integración y pruebas.
- Los diseños de hardware son prototipos no impresos ni sometidos a pruebas de carga; los ajustes por fricción no son un bloqueo positivo y la fuerza de retención y el desgaste no se han medido.
- La licencia del software es Apache-2.0, pero el hardware y los renders tienen términos CC-BY-NC-SA-4.0, lo que restringe el uso comercial de esos artefactos.
- No aplica sesgo lingüístico ni riesgo de alucinación en el sentido de modelos de lenguaje, pero sí existe riesgo de fallo de política ante condiciones fuera de distribución.
- El modelo no es un LLM: no soporta texto, código, matemáticas ni tool calling.

## Enlaces

- Hugging Face: https://huggingface.co/HannesVonEssen/microduck-climb
- Entrenamiento y reproducción: https://github.com/Vottivott/microduck-playground/tree/main/experiments/desk-climb/TRAINING.md
- Contrato de runtime: https://github.com/Vottivott/microduck-playground/tree/main/experiments/desk-climb/RUNTIME.md
- Modelos de escalera y renders: https://github.com/Vottivott/microduck-playground/tree/main/hardware/ladder
- Directorio del experimento: https://github.com/Vottivott/microduck-playground/tree/main/experiments/desk-climb
- Runtime upstream de Microduck: https://github.com/pollen-robotics/microduck/blob/e9cca6272f633dd9054dd0e021f356fe086e5be1/docs/design/robotd-design.md#241-falling-is-a-third-event
