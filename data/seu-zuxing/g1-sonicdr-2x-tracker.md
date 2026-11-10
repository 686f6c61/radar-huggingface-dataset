# seu-zuxing/g1-sonicdr-2x-tracker

## Resumen

`s3gla_nohand_sonicdr_2x_ckpt030000` es un modelo de seguimiento de movimiento de cuerpo completo (whole-body motion tracker) para el robot humanoide Unitree G1 de 29 grados de libertad, desarrollado por el usuario de Hugging Face `seu-zuxing`. Cada 20 ms (50 Hz) el modelo lee el estado del robot y una referencia de movimiento (pose de la pelvis y 29 ángulos articulares) y emite 29 objetivos de posición articular que alimentan los controladores PD de los motores. Está entrenado con un mecanismo de recuperación de caídas basado en referencia oculta: si el robot cae, se le sigue comandando la pose de pie y la política lo levanta por sí misma.

El modelo parte de la receta estable de SuperMimic S3G con cuatro modificaciones: entrenamiento sin las "manos de goma" del G1 (0,34 kg más ligero), aleatorización estilo SONIC (masa del torso y muñecas ×0,8–1,5, fricción 0,3–1,6, empujones angulares y un 10 % de clips copiados con fotogramas congelados), una red del doble de tamaño con 17,8 M de parámetros y un objetivo de look-ahead que toma cada quinto fotograma futuro de referencia, hasta 0,92 s por delante.

Se distribuye como un actor ONNX (opset 17, 71 MB) con los normalizadores de observación y objetivo embebidos en el grafo, junto con un JSON de metadatos que contiene el orden de articulaciones, la pose por defecto, las ganancias PD, los límites de esfuerzo y los desplazamientos de los fotogramas de objetivo. La paridad máxima entre la salida ONNX y el checkpoint PyTorch es de 9,5e-6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (actor) para control robótico; arquitectura interna no detallada en la información disponible |
| Parametros totales | 17,8 M (red "2x") |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 10 pasos (0,2 s) y objetivo de 10 fotogramas hasta 0,92 s por delante |
| Tipos de cuantizacion | no disponible (se distribuye en float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (opset 17, 71 MB) + JSON de metadatos |
| Frecuencia de control | 50 Hz (`control_dt` = 0,02 s) |
| Entradas | `obs_hist` [1, 10, 99], `goal` [1, 730] (10 fotogramas × 73 características) |
| Salida | `action` [1, 29] (acción cruda, sin recorte) |
| DoF del robot | 29 (Unitree G1) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es una política de aprendizaje por refuerzo que mapea una historia de observaciones de 10 pasos (99 valores por paso) y un objetivo de 10 fotogramas (73 características por fotograma) a 29 acciones articulares. La observación incluye posiciones articulares relativas a la pose por defecto, velocidades articulares, y representaciones de rotación de la pelvis en formato de 6 dimensiones (`sixd(M)`), entre otras componentes. La red cuenta con 17,8 M de parámetros, el doble que la receta base S3G.

El entrenamiento emplea la receta estable SuperMimic S3G con aleatorización de dominio estilo SONIC: masas del torso y muñecas escaladas entre ×0,8 y ×1,5, coeficientes de fricción entre 0,3 y 1,6, empujones angulares y un 10 % de clips de movimiento copiados con fotogramas congelados. La innovación clave es el objetivo de look-ahead: en lugar de alimentar los 10 fotogramas consecutivos siguientes, el modelo recibe los fotogramas en t+1, t+6, t+11, ..., t+46 pasos de control (cada 5 pasos, hasta 0,92 s por delante). El entrenamiento incluyó recuperación de caídas con referencia oculta. La simulación usó actuadores de posición de MuJoCo con paso de física de 0,005 s y bucle PD a 200 Hz.

## Capacidades

- Seguimiento de movimiento de cuerpo completo a 50 Hz para el Unitree G1 de 29 DoF.
- Recuperación autónoma de caídas: al comandar la pose de pie con referencia oculta, la política levanta el robot por sí misma.
- Robustez a variaciones de masa (torso y muñecas ×0,8–1,5), fricción (0,3–1,6) y empujones angulares gracias a la aleatorización SONIC.
- Seguimiento de objetivos con look-ahead de hasta 0,92 s, lo que permite anticipar el movimiento de referencia.
- Inferencia en CPU: aproximadamente 2,2 ms por paso en la Jetson del G1.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un controlador motor, no un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Control de locomoción en el Unitree G1 real: el modelo se ejecuta a 50 Hz sobre la CPU de la Jetson del robot, leyendo el estado de la IMU y los encoders y emitiendo `LowCmd` con posiciones objetivo, ganancias PD y límites de esfuerzo definidos en el JSON. Es adecuado por su latencia de 2,2 ms por paso y su paridad ONNX-PyTorch de 9,5e-6.
- Sim2sim con teclado: mediante el código de despliegue RoboJuDo (`deploy/robojudo_sm`, commit `701a743` o posterior) se puede validar la política en simulación antes de llevarla al hardware, leyendo `goal_stride` del JSON para alimentar correctamente los fotogramas de objetivo.
- Investigación en recuperación de caídas: el entrenamiento con referencia oculta permite estudiar políticas que se levantan solas tras una caída, útil para entornos de investigación en robótica humanoide.
- Teleoperación y retargeting de movimiento: al aceptar una referencia de pelvis y 29 ángulos articulares, el modelo puede integrarse en pipelines que conviertan capturas de movimiento humano en comandos para el G1.
- Pruebas de robustez de controladores: la aleatorización de masa, fricción y empujones permite evaluar la estabilidad de la política bajo perturbaciones antes de desplegarla en producción.
- Benchmarking de políticas de seguimiento: sirve como referencia cuantitativa (17,8 M de parámetros, 2,2 ms por paso en CPU) para comparar con otras políticas S3G o S5G en el mismo robot.
- Integración en stacks propios: la interfaz ONNX documentada (entradas `obs_hist` y `goal`, salida `action`) permite incorporar el modelo a un pipeline de control propio sin depender del código de RoboJuDo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento proporcionados son de inferencia: aproximadamente 2,2 ms por paso en la CPU de la Jetson del G1 (frente a 1,4 ms del S3G anterior) y una paridad máxima absoluta entre la salida ONNX y el checkpoint PyTorch de 9,5e-6.

## Requisitos de hardware

- VRAM estimada: no aplica para GPU; el modelo se ejecuta en CPU. El archivo ONNX ocupa 71 MB y el repositorio completo 0,1 GB.
- GPU recomendadas: no se especifican; el despliegue documentado usa la CPU de la Jetson del Unitree G1 (`device: "cpu"`).
- Cabe en cualquier CPU moderna; no requiere GPU de consumo.
- Opciones de despliegue: ONNX Runtime (formato nativo), código RoboJuDo `deploy/robojudo_sm` (commit `701a743` o posterior, rama `deploy.jinyisun_robojudo`) y el paquete `unitree_cpp` para el robot real.
- Latencia: aproximadamente 2,2 ms por paso en la Jetson del G1; el bucle PD en simulación corre a 200 Hz y la política a 50 Hz.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia | Latencia en Jetson | Look-ahead | Licencia |
|---|---|---|---|---|---|
| `s3gla_nohand_sonicdr_2x_ckpt030000` | 17,8 M | 50 Hz | ~2,2 ms/paso | 0,92 s (cada 5 pasos) | no disponible |
| `s3g_ckpt030000` (S3G anterior) | no disponible | 50 Hz | ~1,4 ms/paso | no disponible | no disponible |
| `s5g_ckpt028000` (S5G) | no disponible | 50 Hz | no disponible | no disponible | no disponible |

Los modelos S3G y S5G son las alternativas citadas en la documentación del propio autor; no se dispone de datos de parámetros, contexto ni rendimiento de benchmarks para una comparación más detallada.

## Limitaciones y advertencias

- El objetivo no son los 10 fotogramas siguientes: son los fotogramas en t+1, t+6, t+11, ..., t+46. Una integración escrita para los modelos S3G anteriores (que alimenta t+1 ... t+10) es aceptada por ONNX sin error porque la forma coincide, pero el robot sigue el objetivo equivocado.
- No debe usarse la versión antigua del código (`stable_supermimic_robojudo.zip`), que ignora `goal_stride` y alimenta fotogramas consecutivos silenciosamente.
- Las ganancias PD no son las de Unitree por defecto: se calculan a partir de la armadura con fórmulas específicas (`kp = armature * (2*pi*10 Hz)^2`, `kd = 2 * 2.0 * armature * (2*pi*10 Hz)`, `action_scale = 0.25 * effort_limit / kp`).
- El orden del cuaternión de la IMU del G1 es wxyz; un orden incorrecto produce observaciones erróneas.
- El despliegue en el robot real requiere el G1 en el cabestrillo, una parada de emergencia física a mano y el proceso de arranque de Unitree en modo debug.
- Licencia no disponible: no se puede confirmar el uso comercial.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no es un modelo de lenguaje.
- El modelo está entrenado sin las "manos de goma" del G1 (0,34 kg más ligero); usarlo con esas manos puede degradar el seguimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seu-zuxing/g1-sonicdr-2x-tracker
- Código de despliegue RoboJuDo: `deploy/robojudo_sm`, commit `701a743` o posterior, rama `deploy.jinyisun_robojudo` (sin URL directa disponible en la información proporcionada)
- Paquete de despliegue: `s3gla_nohand_sonicdr_2x_ckpt030000.zip` (incluye ONNX, JSON y checksums)
- Paper, blog o demo: no disponible
