# AIArchiveInfo/MS-Human-700

## Resumen

MS-Human-700 es un modelo musculoesquelético humano de cuerpo completo desarrollado por el grupo LNS (LNSGroup), orientado a simulación física y aprendizaje por refuerzo en MuJoCo. No es un modelo de lenguaje: es un modelo biomecánico con 700 unidades músculo-tendón anatómicamente detalladas, junto con entornos Gymnasium, código de entrenamiento DynSyn-SAC y referencias de movimiento para locomoción y manipulación con la mano derecha. Se publica bajo licencia Apache-2.0.

El repositorio empaqueta tres variantes del modelo (locomoción estándar, marcha con cargas de 5 kg y manipulación con 81 actuadores musculares en la mano derecha), dos entornos Gymnasium (`LocomotionEnv-v1` y `ManipulationEnv-v1`) y configuraciones de tarea para caminar, subir escaleras, recuperación ante perturbaciones y manipulación guiada por visión. El algoritmo de control incluido, DynSyn-SAC, mapea características sensoriales a acciones de grupos musculares y las expande a excitaciones musculares individuales mediante una capa de sinergia aprendida.

Es relevante para investigadores en robótica bioinspirada, control motor computacional y aprendizaje por refuerzo aplicado a sistemas de alta dimensionalidad, porque ofrece un banco de pruebas reproducible con observaciones propioceptivas, vestibulares, táctiles y visión estéreo opcional. El repositorio no incluye checkpoints de políticas entrenadas ni resultados de evaluación, por lo que su utilidad actual es como infraestructura de entrenamiento y simulación, no como modelo listo para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo biomecánico MuJoCo (cuerpos, articulaciones y unidades músculo-tendón) con entornos Gymnasium y agente DynSyn-SAC (SAC con capa de sinergia muscular) |
| Parametros totales | no disponible (no es un modelo neuronal con parámetros en el sentido habitual; el controlador es una política SAC) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en (documentación y código) |
| Licencia | Apache-2.0 |
| Formato de pesos | XML de MuJoCo y assets; checkpoints de política en formato `.zip` de Stable-Baselines3 (no incluidos en el repo) |

## Arquitectura y entrenamiento

El modelo físico se define en archivos XML de MuJoCo con cuerpos, articulaciones y 700 unidades músculo-tendón para el cuerpo completo; la variante de manipulación reduce el actuador a 81 músculos de la mano derecha. Los entornos devuelven un diccionario con canales `proprio`, `sensors` y `reference`, más imágenes RGB en formato channel-first `left_eye` y `right_eye` cuando la visión está activada. La visión estéreo está activa en la configuración de manipulación y es opcional en locomoción; en locomoción se renderizan imágenes de 32x32 cada 20 pasos de control y en manipulación de 128x128 cada cinco pasos.

El controlador DynSyn-SAC se entrena con Stable-Baselines3 sobre estos entornos. Cuando la visión está activada, se usa un ResNet-18 preentrenado en ImageNet, congelado y en modo evaluación, con preprocesado de torchvision y características pooled de 512 dimensiones por ojo antes de la cabeza de clasificación. La política `StateSACPolicy` consume observaciones vectoriales y `VisionSACPolicy` consume además las imágenes. El repositorio incluye código de entrenamiento y evaluación, pero no checkpoints ni resultados. Los artículos asociados son MS-Human-700 (ICRA 2024) y DynSyn (ICML 2024).

## Capacidades

- Simulación de cuerpo completo con 700 unidades músculo-tendón anatómicamente detalladas en MuJoCo.
- Entornos Gymnasium para locomoción (`LocomotionEnv-v1`) y manipulación (`ManipulationEnv-v1`).
- Tareas de locomoción: caminar, subir escaleras, marcha con dos mancuernas fijas de 5 kg y recuperación ante perturbaciones.
- Manipulación guiada por visión de la mano derecha con 81 actuadores musculares.
- Observaciones multisensoriales: propiocepción, canales vestibulares y táctiles.
- Visión estéreo opcional con renderizado configurable (32x32 en locomoción, 128x128 en manipulación).
- Modo no visual en manipulación, con poses de objeto y objetivo en la referencia de tarea.
- Entrenamiento con DynSyn-SAC, incluyendo capa de sinergia que expande acciones de grupo muscular a excitaciones individuales.
- Evaluación determinista con estadísticas de normalización y grabación de vídeo opcional.

## Casos de uso

- Investigación en control motor humano: usar el modelo de 700 músculos para estudiar estrategias de activación muscular en marcha y equilibrio, comparando políticas entrenadas con datos biomecánicos de referencia.
- Estudio de recuperación ante perturbaciones: el entorno de locomoción permite entrenar y evaluar políticas que reaccionen a empujones externos, útil para analizar mecanismos de estabilidad postural.
- Análisis de marcha con carga: la variante `MS-Human-700-FarmerWalk.xml` con dos mancuernas de 5 kg sirve para investigar cómo cambia el patrón de activación muscular al transportar peso.
- Manipulación visomotora: el entorno de manipulación con visión estéreo y 81 músculos permite estudiar coordinación ojo-mano y control de alta dimensionalidad en tareas de alcance y agarre.
- Benchmark de algoritmos de RL: los entornos Gymnasium con configuraciones de tarea y presupuestos de entrenamiento comparables permiten evaluar SAC, variantes con sinergia y políticas basadas en visión de forma reproducible.
- Docencia en robótica bioinspirada: el paquete incluye modelos, assets, entornos y scripts de entrenamiento y evaluación, lo que facilita montar prácticas sobre simulación musculoesquelética en MuJoCo.
- Estudio de representaciones de sinergia muscular: la capa de sinergia de DynSyn-SAC permite investigar cómo se agrupan los músculos en patrones de activación de baja dimensionalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio indica explícitamente que no incluye checkpoints de políticas entrenadas ni resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio no incluye políticas entrenadas ni requisitos de GPU documentados.
- GPU recomendadas: no disponible. El entrenamiento con visión usa un ResNet-18 congelado, lo que sugiere que una GPU consumer moderna es suficiente para el codificador visual, pero no se especifican modelos concretos.
- Cabe en consumer GPU: probablemente sí para el codificador visual y el agente SAC, pero no se confirma en la información disponible.
- Opciones de despliegue: MuJoCo con visor `simulate`, entornos Gymnasium, Stable-Baselines3 para entrenamiento y evaluación. En Linux sin pantalla se requiere `MUJOCO_GL=egl` para renderizado offscreen.
- Latencia y throughput: no disponibles.
- Entorno de software: Python 3.12 o superior, instalación con `uv` y extra `[dynsyn]`.

## Comparativa con modelos similares

| Modelo | Tipo | Actuadores musculares | Entornos RL | Visión | Licencia | Checkpoints incluidos |
|---|---|---|---|---|---|---|
| MS-Human-700 | Musculoesquelético MuJoCo + DynSyn-SAC | 700 (81 en manipulación) | Sí (Gymnasium) | Estéreo opcional | Apache-2.0 | No |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No incluye checkpoints de políticas entrenadas ni resultados de evaluación; no es utilizable directamente para inferencia sin entrenar.
- Es un modelo biomecánico de simulación, no un modelo de lenguaje ni un modelo generativo; no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- La documentación y los idiomas soportados se limitan al inglés.
- El realismo biomecánico depende de la calibración del modelo XML y de las referencias de movimiento incluidas; no se documentan validaciones frente a datos humanos reales en la información disponible.
- El entrenamiento con visión usa un ResNet-18 congelado preentrenado en ImageNet, lo que puede limitar la adaptación a dominios visuales distintos.
- El renderizado offscreen en Linux requiere configuración adicional (`MUJOCO_GL=egl`).
- Aunque la licencia es Apache-2.0 y permite uso comercial, la ausencia de políticas entrenadas y de garantías de rendimiento limita su uso en producción sin trabajo adicional de entrenamiento y validación.
- Riesgo de sobreajuste a las tareas y presupuestos de entrenamiento incluidos; las configuraciones comparten parámetros de tarea y presupuestos, lo que puede sesgar comparaciones si no se ajustan.

## Enlaces

- HuggingFace: https://huggingface.co/AIArchiveInfo/MS-Human-700
- Página del proyecto: https://lnsgroup.cc/research/MS-Human
- Repositorio del modelo: https://github.com/LNSGroup/MS-Human-700
- Repositorio msgym: https://github.com/LNSGroup/msgym
- Paper MS-Human-700 (ICRA 2024): https://arxiv.org/abs/2312.05473
- Paper DynSyn (ICML 2024): https://arxiv.org/abs/2407.11472
