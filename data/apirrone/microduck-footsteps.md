# apirrone/microduck-footsteps

## Resumen

Microduck footsteps es un paquete de dos políticas de control para el robot cuadrúpedo de código abierto Microduck de Pollen Robotics. Lo desarrolla apirrone y se distribuye como dos ficheros ONNX que el runtime del robot descarga automáticamente cuando se activa la opción `[policy] footstep_control`. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un par de redes neuronales ligeras entrenadas con aprendizaje por refuerzo para planificar y ejecutar pasos sobre marcas de suelo concretas.

El paquete resuelve un problema clásico en robótica de patas: pasar de una marcha reactiva genérica a una locomoción dirigida que coloque las patas en posiciones precisas. Incluye `footsteps.onnx`, una política de seguimiento de pasos entrenada en el entorno `Mjlab-Footsteps-Flat-Backlash-MicroDuck` (run `m09310ur`, iteración 3750), y `footstepnet.onnx`, un planificador de pasos con la geometría del Microduck y pasos de 5 cm.

La relevancia es práctica: el paquete está pensado para desplegarse directamente en el robot físico, con un contrato de observación de 61 dimensiones a 14 acciones y una precisión declarada en simulación de 5-7 mm y 1-2° respecto a los objetivos de aterrizaje. El repositorio es minúsculo (0,0 GB según Hugging Face) y la licencia Apache 2.0 facilita su reutilización e integración en el runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes neuronales para control robótico entrenadas con aprendizaje por refuerzo (detalle de capas no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye en ONNX, presumiblemente FP32 (no confirmado) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`footsteps.onnx`, `footstepnet.onnx`) |

Contratos de entrada y salida:

| Fichero | Entrada | Salida | Función |
|---|---|---|---|
| `footsteps.onnx` | `obs [1, 61]` | `actions [1, 14]` | Política de seguimiento de pasos |
| `footstepnet.onnx` | `obs [N, 8]` | `step [N, 3]` | Planificador de pasos (FootstepNet) |

## Arquitectura y entrenamiento

`footsteps.onnx` es una política de control entrenada mediante aprendizaje por refuerzo en el entorno de simulación `Mjlab-Footsteps-Flat-Backlash-MicroDuck`, identificado con el run `m09310ur` y la iteración 3750, que según la model card es la versión probada en el robot físico. La observación es de 61 dimensiones; sus ranuras de twist transportan la **pose objetivo de aterrizaje** del pie en vuelo `(dx, dy, dyaw)` expresada en el marco del pie de soporte actual, con el centro de la suela situado 7 mm por delante del sitio `*_foot`. El pie de soporte es aquel sobre el que se ancla la odometría de contacto. La acción es un vector de 14 dimensiones.

`footstepnet.onnx` es el planificador de pasos, con la geometría del Microduck y pasos de 5 cm; es el mismo fichero que el publicado en `apirrone/microduck-footstepnet`. Recibe observaciones de dimensión 8 por paso y devuelve vectores de 3 dimensiones por paso. Sus límites y la geometría del pie están codificados en los metadatos ONNX (`options`), y el contrato de observación/acción se documenta en el repositorio del planificador. El entrenamiento incorpora modelado de *backlash* (juego mecánico) según el nombre del entorno, lo que indica que se simula la holgura de los actuadores para mejorar la transferencia al robot real. En simulación, la política aterriza a 5-7 mm y 1-2° de sus objetivos.

## Capacidades

- Planificación de pasos: FootstepNet genera secuencias de posiciones de aterrizaje para las patas a partir de observaciones de 8 dimensiones.
- Seguimiento de pasos: la política ejecuta el paso hacia la pose objetivo con precisión declarada de 5-7 mm y 1-2° en simulación.
- Control proporcional al joystick: paso de hasta 5 cm adelante/atrás, 2 cm lateral y 30° de giro por paso con la palanca al máximo.
- Marcha en el sitio: al soltar la palanca, el robot da pasos sin desplazarse y devuelve el control a la marcha de pie (standing gait).
- Integración con el runtime del robot: descarga automática de ambos ficheros al activar `[policy] footstep_control` en `robotctl configure`.
- Ejecución de patrones impresos: reproducción de planes de FootstepNet dibujados a escala 1:1 en A4 mediante `robotctl robot footsteps <name>.json`.
- Registro de errores de aterrizaje: cada fallo de aterrizaje queda en el journal del sistema (`journalctl -u robotd | grep footstep`).
- No soporta tool calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües: es un controlador específico de robótica.

## Casos de uso

- Locomoción dirigida por joystick en el Microduck: el operador controla el robot con la palanca izquierda y la política traduce la deflexión en pasos de hasta 5 cm o giros de 30°, lo que permite conducción precisa en espacios reducidos.
- Validación de calibración mecánica: comparar el error de aterrizaje registrado en `journalctl` con los 5-7 mm de simulación sirve para detectar desgaste, holgura o descalibración de las patas.
- Ejecución de rutas predefinidas: los patrones impresos en `patterns/footstep_patterns.pdf` permiten repetir trayectorias idénticas sobre el suelo para pruebas de repetibilidad y comparación entre unidades.
- Investigación en planificación de pasos: FootstepNet se puede evaluar de forma aislada con su contrato `obs [N, 8] → step [N, 3]`, útil para estudiar planificadores de aterrizaje en cuadrúpedos pequeños.
- Docencia y demostraciones de RL en robótica: el paquete ilustra el ciclo completo simulación-a-realidad (entrenamiento en Mjlab, exportación a ONNX, despliegue en el robot) con una licencia permisiva.
- Pruebas de robustez frente a backlash: al haberse entrenado con modelado de juego mecánico, el controlador es adecuado para evaluar cómo afecta la holgura de actuadores a la precisión de aterrizaje en hardware real.
- Integración en pipelines de CI de robótica: los ficheros ONNX se pueden cargar con ONNX Runtime en tests automatizados que verifiquen formas de entrada/salida y límites de pasos sin necesidad de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica cuantitativa declarada es el error de aterrizaje en simulación: 5-7 mm y 1-2° respecto a las poses objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0,0 GB) y las dimensiones de entrada (61 y 8), el modelo es extremadamente pequeño y cabe en cualquier GPU, e incluso es viable en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de ONNX Runtime es suficiente. No requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, con margen amplio; también en hardware embebido del propio robot.
- Opciones de despliegue: ONNX Runtime, integrado en el runtime `pollen-robotics/microduck` (rama `footsteps`) mediante `scripts/dev-push.sh --docker --name duck-xxxx`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| apirrone/microduck-footsteps | Política RL + planificador de pasos | `[1,61]→[1,14]` y `[N,8]→[N,3]` | Apache 2.0 | Hugging Face |
| apirrone/microduck-footstepnet | Planificador de pasos (mismo `footstepnet.onnx`) | `[N,8]→[N,3]` | no disponible | Hugging Face |
| Políticas de marcha del runtime Microduck | Marcha estándar del robot (sin planificación de pasos) | no disponible | no disponible | Repositorio `pollen-robotics/microduck` |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de robótica: no es un modelo de lenguaje; no procesa texto, imágenes ni audio, y no admite tool calling ni razonamiento general.
- Precisión declarada solo en simulación (5-7 mm, 1-2°); el error en el robot real depende de calibración, desgaste y superficies, y debe medirse con el registro de `journalctl`.
- Dependencia del runtime: requiere la rama `footsteps` de `pollen-robotics/microduck` y la activación de `[policy] footstep_control`; no funciona de forma autónoma fuera de ese ecosistema.
- Geometría fija: el planificador está configurado para la geometría del Microduck y pasos de 5 cm; no es directamente transferible a otros robots sin reentrenamiento o reconfiguración.
- Parámetros y arquitectura interna no documentados: la model card no detalla capas, número de parámetros ni datos de entrenamiento, lo que dificulta la auditoría técnica.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de fallo de control (pasos fuera de objetivo) ante condiciones no vistas en entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución; no se han identificado restricciones adicionales en la información disponible.
- Idiomas: no aplica; no hay soporte lingüístico que evaluar.

## Enlaces

- Hugging Face: https://huggingface.co/apirrone/microduck-footsteps
- Planificador FootstepNet: https://huggingface.co/apirrone/microduck-footstepnet
- Runtime del robot (rama `footsteps`): https://github.com/pollen-robotics/microduck
- Patrones imprimibles: `patterns/footstep_patterns.pdf` y `patterns/<name>.json` dentro del repositorio de Hugging Face
