# lkrajan/orcs

## Resumen

ORCS (Oracle Robot Control Synthesis) es un conjunto de checkpoints de control robótico para humanoides, publicado por el usuario lkrajan en HuggingFace bajo el identificador lkrajan/orcs. No es un modelo de lenguaje: se trata de políticas de control entrenadas mediante aprendizaje por refuerzo y validadas en comportamiento, pensadas para ejecutarse en simulación MuJoCo con el framework RSL-RL. El release incluye cuatro tareas: Orcs-Dodge-AdaptSonic, Orcs-PerLoco-Grail-AdaptSonic, Orcs-PerLoco-OmRe-AdaptSonic y Orcs-Uolm-AdaptSonic.

El repositorio ocupa 0,3 GB y cada archivo `.pt` es un checkpoint completo de entrenamiento RSL-RL que contiene actor, crítico, estado del optimizador, iteración y metadatos de la ejecución. Cada checkpoint corresponde a una iteración concreta de entrenamiento (7.500, 14.999, 10.500 y 19.999 respectivamente) y se distribuye bajo la revisión inmutable `v0.1.0`, con verificación por SHA-256 registrada en `release.json`.

Su relevancia es la de un artefacto de investigación reproducible en robótica con patas: permite reproducir comportamientos concretos sin acceso al proyecto de W&B original ni a los entrenamientos privados, y sirve como punto de partida para experimentos de transferencia sim-to-real. El autor advierte explícitamente de que son modelos de control de propósito especial y deben validarse en simulación antes de cualquier uso sobre hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Políticas actor-critic de control entrenadas con RSL-RL sobre MuJoCo; topología exacta de la red no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control robótico, no procesa secuencias de texto) |
| Tipos de cuantización | no disponible (el release no incluye exportaciones ONNX ni versiones cuantizadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | NVIDIA Open Model License para los checkpoints (incorporan pesos del modelo SONIC); el código y la documentación propios de ORCS son BSD-3-Clause |
| Formato de pesos | PyTorch `.pt` (checkpoint completo de RSL-RL: actor, crítico, estado del optimizador, iteración y metadatos de la ejecución) |
| Tareas incluidas | 4 checkpoints: Dodge, PerLoco-Grail, PerLoco-OmRe y Uolm |
| Iteraciones de entrenamiento | 7.500 (Dodge), 14.999 (PerLoco-Grail), 10.500 (PerLoco-OmRe), 19.999 (Uolm) |
| Motor de simulación | MuJoCo |
| Framework de entrenamiento | RSL-RL |
| Exportaciones ONNX | no incluidas en este release |
| Tamaño del repositorio | 0,3 GB |
| Versión recomendada | `v0.1.0` (revisión inmutable) |
| Idiomas de la documentación | inglés |

## Arquitectura y entrenamiento

No se dispone de detalles publicados sobre la topología de red, el número de parámetros ni la composición del dataset de entrenamiento. La información disponible indica que cada checkpoint es el resultado completo de una ejecución de RSL-RL (framework de aprendizaje por refuerzo, típicamente PPO, para control de robots) sobre el simulador MuJoCo, y que ORCS carga únicamente el actor para inferencia. Los checkpoints liberados son los validados en comportamiento, seleccionados de las ejecuciones de entrenamiento privadas correspondientes.

Las tareas PerLoco y UOLM requieren sus conjuntos de datos de movimiento, terreno y objetos correspondientes, además de los recursos (assets) asociados, que deben obtenerse mediante los flujos de configuración del repositorio de ORCS. La tarea Dodge no requiere ningún conjunto de datos de movimiento externo, lo que la convierte en la opción más sencilla para una primera prueba. Los checkpoints incorporan pesos del modelo SONIC, lo que condiciona la licencia aplicable al artefacto distribuido.

## Capacidades

- Control de locomoción humanoide en simulación MuJoCo mediante políticas cargadas desde checkpoints RSL-RL.
- Ejecución de cuatro comportamientos diferenciados: Dodge (evasión, sin dataset externo), PerLoco-Grail, PerLoco-OmRe y Uolm.
- Inferencia a partir del actor contenido en el checkpoint; el crítico y el estado del optimizador solo son relevantes para continuar el entrenamiento.
- Reproducción verificable de comportamientos concretos gracias a la revisión inmutable `v0.1.0` y a los checksums SHA-256 de `release.json`.
- Integración con el ecosistema ORCS mediante los comandos `play <tarea> --agent release --viewer native`.
- Descarga y verificación automatizada del conjunto completo de checkpoints mediante `scripts/setup/download_released_models.sh`.
- Trazabilidad de linaje: cada carpeta de tarea incluye un `provenance.json` con los identificadores privados de W&B conservados como referencia de procedencia.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni procesamiento de visión; no es un modelo de propósito general.

## Casos de uso

- Reproducción de experimentos de aprendizaje por refuerzo: cargar cualquiera de los cuatro checkpoints liberados con RSL-RL y MuJoCo permite reproducir el comportamiento exacto en la iteración indicada (por ejemplo, 19.999 para Uolm) sin necesidad de reentrenar ni de acceder al proyecto W&B original.
- Validación previa a la transferencia sim-to-real: el autor indica que estos modelos deben validarse en simulación antes de usarse sobre hardware, por lo que el caso de uso natural es montar una batería de pruebas en MuJoCo que evalúe estabilidad y robustez antes de cualquier despliegue físico.
- Punto de partida para ajuste fino: al incluir el estado del optimizador y el crítico, los checkpoints permiten reanudar o continuar el entrenamiento con RSL-RL en lugar de partir de cero, lo que reduce el coste computacional de experimentar con variaciones de recompensa o de terreno.
- Investigación en evasión de obstáculos: la tarea Orcs-Dodge-AdaptSonic no requiere conjuntos de datos externos de movimiento, de modo que es la candidata idónea para estudiar comportamiento reactivo de evasión en un entorno controlado y con la menor fricción de configuración posible.
- Docencia y formación en robótica: el flujo `play ... --viewer native` permite demostrar en clase o en talleres el resultado de un pipeline completo de entrenamiento por refuerzo, con descarga verificada y caché local en `~/.cache/orcs/releases`.
- Comparación de algoritmos de control: disponer de checkpoints de referencia validados en comportamiento facilita establecer una línea base reproducible con la que medir nuevas políticas o cambios en el entorno de simulación.
- Evaluación de control sobre datos de movimiento, terreno y objetos: las tareas PerLoco y Uolm, una vez configurados sus datasets y assets, permiten estudiar el rendimiento del control cuando la política depende de información perceptiva del entorno.
- Auditoría de licencias y procedencia en proyectos de robótica: el repositorio incluye `NOTICE`, `THIRD_PARTY_NOTICES.md` y `LICENSES/`, lo que lo hace utilizable como caso práctico de gestión de dependencias y licencias en investigación aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente identifica los checkpoints como «validados en comportamiento» y documenta la iteración de entrenamiento de cada uno, sin cifras de recompensa, tasas de éxito ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio completo ocupa 0,3 GB e incluye cuatro checkpoints con estado del optimizador, pero no se documenta el tamaño de las redes ni el consumo en ejecución.
- GPU recomendadas: no disponible.
- Ejecución en GPU de consumo: no disponible; no se especifica si la inferencia requiere GPU.
- Opciones de despliegue: el flujo documentado es el comando `play` de ORCS con RSL-RL y visor nativo sobre MuJoCo. Este release no incluye exportaciones ONNX, por lo que no se documenta un camino directo a runtimes de inferencia ligeros.
- Almacenamiento: reservar al menos 0,3 GB para los checkpoints, más el espacio de los conjuntos de datos de movimiento, terreno y objetos que requieren las tareas PerLoco y Uolm.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada, y la model card no referencia alternativas con las que se haya medido ORCS. Como referencia cualitativa de categoría, existen otros ecosistemas abiertos de control de robots con patas entrenados por refuerzo (por ejemplo, `legged_gym`, Isaac Lab o los repositorios de políticas de Unitree), pero no se han publicado cifras que permitan una comparación directa y rigurosa con los checkpoints de este repositorio.

| Modelo o ecosistema | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ORCS (lkrajan/orcs) | no disponible | no aplica | validado en comportamiento, sin cifras publicadas | NVIDIA Open Model License / BSD-3-Clause (código) | 4 checkpoints en HuggingFace |
| Alternativas de control con patas en RL (legged_gym, Isaac Lab) | no disponible | no aplica | no disponible | según proyecto | repositorios públicos de código |
| Políticas propietarias de fabricantes de humanoides | no disponible | no aplica | no disponible | propietaria | no disponible |

## Limitaciones y advertencias

- Son modelos de control de propósito especial: no generan texto, código ni imágenes, y no admiten instrucciones en lenguaje natural.
- El propio autor advierte de que deben validarse en simulación antes de cualquier uso sobre hardware; no hay validación física documentada.
- Las tareas PerLoco y Uolm no son autónomas: requieren sus conjuntos de datos y assets correspondientes, gestionados mediante los flujos de configuración del repositorio ORCS.
- No se incluyen exportaciones ONNX, lo que limita las opciones de despliegue optimizado en tiempo real.
- Los checkpoints incorporan pesos del modelo SONIC y se distribuyen bajo la NVIDIA Open Model License, con condiciones distintas de las de una licencia de código abierto permisiva; conviene revisar los términos antes de un uso comercial.
- El código original de ORCS es BSD-3-Clause, pero el código adaptado y todos los modelos, datasets, assets y ficheros de modelo corporal externos conservan sus propios términos (véanse `NOTICE`, `THIRD_PARTY_NOTICES.md` y `LICENSES/`).
- No se documentan sesgos, tasas de alucinación (no aplica) ni límites idiomáticos, pero tampoco se publican evaluaciones de robustez frente a perturbaciones, cambios de terreno o condiciones fuera de distribución.
- Es un release de investigación con 0 descargas y 1 like en el momento de redactar esta ficha; no hay evidencia de adopción ni de mantenimiento continuado más allá de la revisión `v0.1.0`.
- Los metadatos de HuggingFace indican fecha de creación y actualización en septiembre de 2026, con una separación de unos dos minutos entre ambas; verificar la vigencia de la información antes de depender de ella en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lkrajan/orcs
- Repositorio ORCS (Oracle Robot Control Synthesis): https://github.com/lok-i/orcs
- Licencia NVIDIA Open Model License (copia en el repo): https://huggingface.co/lkrajan/orcs/blob/v0.1.0/LICENSES/NVIDIA-OPEN-MODEL-LICENSE.txt
- No se han encontrado papers, blogs, demos ni publicaciones adicionales en los resultados de búsqueda disponibles.
