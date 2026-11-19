# beshy3752/g1-29dof-locomotion-trial-20261118

## Resumen

`beshy3752/g1-29dof-locomotion-trial-20261118` es un repositorio de políticas de locomoción para el robot humanoide Unitree G1 en su variante EDU Plus de 29 grados de libertad (DoF). El autor, `beshy3752`, publica un conjunto de siete políticas exportadas a formato ONNX, pensadas para pruebas comparativas en hardware real. Cada política se acompaña de un archivo `params/deploy.yaml` con los parámetros de despliegue y todas emiten, cada 20 ms (50 Hz), un vector de 29 ángulos objetivo de articulación. No es un modelo de lenguaje ni un modelo generativo de propósito general: es un artefacto de control motor para robótica.

El interés del repositorio es que reúne, en un único paquete, la política de referencia oficial de Unitree RL Lab (`unitree-v0`) junto con seis variantes entrenadas por el autor con distintos regímenes de observación y de currículo de entrenamiento (políticas en plano, con ajuste de simetría izquierda-derecha, con terreno irregular de tipo baldosa, con observación de par, y dos políticas de diagnóstico con PPO adicional en MuJoCo e Isaac/MuJoCo mixto). Esto facilita la comparación controlada de variantes sobre el mismo robot y el mismo pipeline de despliegue.

La relevancia es acotada pero clara para quien trabaje con el G1: el autor declara explícitamente que el rendimiento de locomoción en hardware real aún no se ha medido, y advierte de que las políticas con observación de par exigen una integración adicional en el controlador de despliegue (lectura de `tau_est` vía SDK de Unitree, reordenación de articulaciones, límite de ±200 N·m, escala 0,02 y ventana de 5 pasos). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño declarado de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para robótica (red neuronal exportada a ONNX); arquitectura interna no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 480 o 625 elementos según política |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, sin variantes cuantizadas declaradas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el repositorio incluye `licenses/Unitree-RL-Lab.txt` con la licencia del repositorio oficial de origen de `unitree-v0`) |
| Formato de pesos | ONNX (`exported/policy.onnx`) con configuración YAML (`params/deploy.yaml`) y `manifest.json` |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Robot objetivo | Unitree G1 EDU Plus, 29 DoF |
| Frecuencia de control | 50 Hz (una salida cada 20 ms) |
| Salida | 29 ángulos objetivo de articulación |
| Número de políticas | 7 |
| Observaciones por política | 480 (seis políticas) / 625 (política con par) |
| Licencia del componente oficial | recogida en `licenses/Unitree-RL-Lab.txt` |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna de las redes (número de capas, anchura, tipo de encoder, etc.). Lo que sí se especifica es la interfaz: cada política consume un vector de observaciones (480 elementos en las variantes estándar, 625 en la variante con par) y produce 29 consignas de posición articular a 50 Hz. Las políticas se exportan a ONNX y se emparejan con un `params/deploy.yaml` que fija los detalles de despliegue.

El entrenamiento se realizó con PPO en simulación. La política `unitree-v0` procede del repositorio oficial Unitree RL Lab (revisión `4960b84`, ruta `deploy/robots/g1_29dof/config/policy/velocity/v0`). Las variantes del autor se describen así: `torque-off-28000` es una política de marcha en plano entrenada hasta el paso 28.000; `torque-off-mirror-32500` parte del paso 30.500 y añade 2.000 iteraciones con una pérdida de simetría izquierda-derecha para mejorar el giro en plano; `torque-off-32999` parte del paso 28.000 y añade entrenamiento con terreno irregular de tipo baldosa; `torque-on-28000` iguala el cómputo de `torque-off-28000` pero incluye la observación de par; y las dos variantes de diagnóstico (`torque-off-mujoco-sequential-33006` y `torque-off-isaac-mujoco-mixed-33006`) aplican 8 iteraciones adicionales de PPO desde el paso 32.999, una solo en MuJoCo y otra mezclando Isaac y MuJoCo. El autor indica que los archivos y configuraciones se han verificado por SHA-256 contra los usados en una evaluación previa en MuJoCo, y que las formas de entrada/salida, la verificación de inferencia y los hashes están en `manifest.json`.

La innovación técnica destacable no está en la arquitectura sino en el protocolo de comparación: siete políticas con el mismo interfaz de despliegue, incluida una condición con observación de par (`joint_torque`) que requiere leer `tau_est` del SDK de Unitree en el mismo orden de articulaciones que en entrenamiento, aplicar un recorte de ±200 N·m, una escala de 0,02 y una ventana de 5 pasos.

## Capacidades

- Generación de consignas de posición para las 29 articulaciones del Unitree G1 EDU Plus a 50 Hz.
- Locomoción en plano (políticas `torque-off-28000` y `unitree-v0` como referencia).
- Giro y maniobra en plano con simetría izquierda-derecha reforzada (`torque-off-mirror-32500`).
- Locomoción sobre terreno irregular de tipo baldosa (`torque-off-32999`).
- Control con realimentación de par articular (`torque-on-28000`, 625 observaciones).
- Políticas de diagnóstico para comparar simulación secuencial (MuJoCo) frente a mixta (Isaac + MuJoCo).
- Exportación ONNX lista para inferencia en el bucle de control del robot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Puesta a punto del pipeline de despliegue del G1: usar `unitree-v0` como referencia oficial y validar que el controlador, el orden de articulaciones y las escalas de observación coinciden antes de probar variantes del autor.
- Comparación controlada de currículos de entrenamiento: ejecutar `torque-off-28000` frente a `torque-off-mirror-32500` sobre el mismo robot y las mismas condiciones para aislar el efecto de la pérdida de simetría en el giro.
- Evaluación de robustez ante terreno irregular: desplegar `torque-off-32999` en superficies con baldosa o irregularidades ligeras y comparar la estabilidad frente a la política de plano.
- Investigación sobre observación de par: usar `torque-on-28000` para estudiar si la realimentación de par mejora la locomoción, integrando previamente la lectura de `tau_est` con recorte de ±200 N·m, escala 0,02 y ventana de 5 pasos.
- Análisis de la brecha simulación-realidad: contrastar las dos políticas de diagnóstico (`torque-off-mujoco-sequential-33006` y `torque-off-isaac-mujoco-mixed-33006`) para evaluar si el entrenamiento mixto entre simuladores reduce el fallo al transferir a hardware.
- Docencia y experimentación en robótica con humanoides: el paquete ONNX + YAML permite montar prácticas de control a 50 Hz sobre un G1 sin reentrenar, siempre que se respete la interfaz de observaciones.
- Verificación de integridad de artefactos: usar `manifest.json` y los hashes SHA-256 para auditar que los archivos desplegados coinciden con los evaluados en MuJoCo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que el rendimiento de locomoción en hardware real aún no se ha medido. La única verificación reportada es la comprobación de inferencia y la comparación de hashes SHA-256 contra los archivos usados en una evaluación previa en MuJoCo, cuyos resultados no se incluyen en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de políticas de control a 50 Hz exportadas a ONNX, la huella esperada es muy inferior a la de un modelo de lenguaje, pero no se publican parámetros ni tamaño de los archivos.
- GPU recomendadas: no disponibles. La inferencia a 50 Hz de una política de control de este tipo es viable en CPU en la mayoría de casos, pero no hay datos publicados que lo confirmen para estas políticas concretas.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime como vía natural dado el formato `exported/policy.onnx`; el bucle de control debe ejecutarse a 20 ms por ciclo. Para la variante `torque-on-28000` es obligatorio integrar la lectura de `tau_est` del SDK de Unitree en el controlador de despliegue de Unitree RL Lab.
- Latencia y throughput: la única cifra publicada es la frecuencia de control de 50 Hz (20 ms por paso). No se publican latencias de inferencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Robot objetivo | Formato | Nº de políticas | Observaciones | Licencia | Rendimiento en hardware |
|---|---|---|---|---|---|---|
| `beshy3752/g1-29dof-locomotion-trial-20261118` | Unitree G1 EDU Plus 29 DoF | ONNX + YAML | 7 | 480 / 625 | no disponible | no medido (declarado por el autor) |
| `unitree-v0` (Unitree RL Lab, rev. `4960b84`) | Unitree G1 29 DoF | política oficial del repositorio | 1 (incluida aquí como referencia) | 480 | según `licenses/Unitree-RL-Lab.txt` | no disponible en esta ficha |
| Otras políticas de locomoción para G1 en Hugging Face | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre políticas comparables de terceros con la que construir una comparativa cuantitativa; los datos de rendimiento de las alternativas no están publicados en la información disponible.

## Limitaciones y advertencias

- El rendimiento en hardware real no se ha medido; todas las validaciones reportadas son en simulación (MuJoCo) y de integridad de archivos.
- La licencia del repositorio no está declarada. Solo se incluye el texto de licencia del repositorio oficial de Unitree RL Lab en `licenses/Unitree-RL-Lab.txt`; antes de cualquier uso comercial debe revisarse ese archivo y aclararse la situación del resto de políticas.
- Las políticas con observación de par (`torque-on-28000`) no funcionan con el controlador de despliegue por defecto: requieren añadir la lectura de `tau_est`, el reordenamiento de articulaciones, el recorte a ±200 N·m, la escala 0,02 y la ventana de 5 pasos, y validar esa integración antes de usarlas.
- Un desajuste en el orden de articulaciones, en las escalas de observación o en la frecuencia de control (50 Hz) puede producir comportamientos peligrosos en un humanoide de 29 DoF; deben respetarse estrictamente `params/deploy.yaml` y `manifest.json`.
- No hay información sobre sesgos, alucinación ni comportamiento multilingüe porque no es un modelo de lenguaje; esas categorías de riesgo no aplican.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño declarado de 0,0 GB: conviene verificar que los archivos ONNX están efectivamente presentes y son íntegros antes de desplegar.
- Las políticas de diagnóstico entrenadas con PPO adicional en MuJoCo o mixto están etiquetadas como tales por el autor; no deben tratarse como políticas de producción sin una evaluación propia.
- No se documentan límites de contexto ni de idioma; la ventana de observación está fijada por política (480 o 625) y no es ampliable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/beshy3752/g1-29dof-locomotion-trial-20261118
- Unitree RL Lab, revisión de origen de `unitree-v0`: https://github.com/unitreerobotics/unitree_rl_lab/tree/4960b84732b0c2ec593dccbfe963fda1bcd7b1e3/deploy/robots/g1_29dof/config/policy/velocity/v0
- Repositorio Unitree RL Lab: https://github.com/unitreerobotics/unitree_rl_lab
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
