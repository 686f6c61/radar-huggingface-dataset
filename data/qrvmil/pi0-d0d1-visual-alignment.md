# qrvmil/pi0-d0d1-visual-alignment

## Resumen

`qrvmil/pi0-d0d1-visual-alignment` es un artefacto de investigación publicado en HuggingFace por el usuario qrvmil, bajo la librería `openpi` y con pipeline declarado de robótica. No es un modelo nuevo desde cero: contiene dos ramas de ajuste (B-control y B-align) obtenidas a partir del mismo checkpoint base π0, con el mismo seed, orden de datos, aumentaciones deterministas (K=4), optimizador y schedule, y batch efectivo de 8. La única diferencia es que B-align añade una pérdida de alineación coseno entre características visuales intermedias de PaliGemma y un teacher congelado C-RADIOv3-L, a través de un proyector LN+MLP preentrenado y después congelado.

El modelo se ha entrenado y evaluado en tareas de manipulación de LIBERO: D0 y D1 pertenecen a `libero_spatial` (recoger el cuenco negro del centro de la mesa y colocarlo en el plato; recoger el cuenco negro junto al plato y colocarlo en el plato) y D2 es una tarea *held-out* fuera de distribución en `libero_goal` (poner el cuenco en el horno). Según el autor, D2 no se utilizó para entrenamiento, calibración, normalización, ajuste de λ, depuración ni selección de modelo, y el checkpoint final (paso 3001) se eligió de antemano. Los resultados numéricos se remiten a `REPORT_RU.md`, que no forma parte de la información disponible en esta ficha.

Se trata de un repositorio grande (89,3 GB) con checkpoints en los pasos 0, 500, 1000, 2000 y 3001 para cada rama, en formato Orbax/OpenPI. El idioma declarado es ruso, no se especifica licencia y no se han subido los datos de entrenamiento, la caché de características del teacher, los checkpoints upstream ni credenciales. Es, por tanto, material de reproducción y estudio de ablación, no un modelo listo para producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada de π0, modelo visión-lenguaje-acción (VLA) con backbone VLM y generación de acciones por flow matching; el autor indica entrenamiento con LoRA32 y una proyección LN+MLP para la alineación visual (topología completa no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos se distribuyen sin cuantizar en formato Orbax/OpenPI |
| Idiomas soportados | ruso (`ru`) declarado en la model card; no se documenta soporte multilingüe |
| Licencia | no disponible (no se especifica en la información proporcionada) |
| Formato de pesos | Orbax/OpenPI (`checkpoints/<arm>/<step>/params`); `train_state` con estado del optimizador para reanudar; proyector en `projector.npz` |
| Modelo base | π0 (`gs://openpi-assets/checkpoints/pi0_base`) |
| Tamaño del repositorio | 89,3 GB |
| Fecha de creación / actualización | 14-10-2026 / 14-10-2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe este repositorio como un experimento de alineación visual sobre π0, no como una arquitectura nueva. Según las fuentes públicas consultadas, π0 es un modelo visión-lenguaje-acción que parte de un backbone VLM (PaliGemma en la variante citada por el autor) y añade un cabezal de flow matching para producir acciones continuas, heredando así conocimiento semántico y de razonamiento de modelos de lenguaje y visión-lenguaje. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, por lo que esos datos se consideran no disponibles.

El diseño experimental sí está descrito con precisión: se entrenan dos ramas (B-control y B-align) desde el mismo π0 de partida, con idéntico seed0, orden de datos, K=4 aumentaciones deterministas, optimizador, schedule y batch efectivo de 8. B-align introduce una pérdida adicional de similitud coseno entre características visuales intermedias de PaliGemma y las de un teacher congelado C-RADIOv3-L, mediada por un proyector LN+MLP que se preentrena y luego se congela. Se conservan los checkpoints programados (0, 500, 1000, 2000 y 3001) de ambas ramas, lo que permite analizar la trayectoria de entrenamiento y no solo el estado final.

El autor indica que el entrenamiento se realizó con OpenPI fijado a una revisión concreta y LoRA32 (`scripts/setup.sh`, `alignment/training.py`), que la normalización (`assets/local/d0d1/norm_stats.json`) se calculó solo con D0+D1 y que el proyector no es necesario en inferencia. La máquina real de entrenamiento fue una A100 de 80 GB; la compatibilidad con Blackwell no se ha verificado. Se trata de un único seed de entrenamiento.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones para tareas de manipulación del benchmark LIBERO, en concreto las tareas D0 y D1 de `libero_spatial` y, como evaluación fuera de distribución, D2 en `libero_goal`.
- Condicionamiento multimodal: integra observaciones visuales e instrucciones en lenguaje (el repositorio declara idioma ruso) para producir acciones.
- Transferencia de representaciones visuales: la rama B-align demuestra un mecanismo de alineación de características entre el backbone PaliGemma y un teacher externo (C-RADIOv3-L) mediante proyección LN+MLP.
- Reanudación de entrenamiento: los `train_state` conservan el estado del optimizador, lo que permite continuar el entrenamiento desde cualquier checkpoint guardado.
- Ajuste eficiente: el flujo de trabajo descrito emplea LoRA32, lo que facilita reproducir el experimento sobre el π0 base sin reentrenar todos los parámetros.
- No se documentan en la información disponible capacidades de *tool calling*, uso como agente multi-paso, matemáticas, generación de código, visión generalista fuera del bucle robótico, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de experimentos de alineación visual: el repositorio permite comparar B-control y B-align bajo condiciones controladas (mismo seed, datos, optimizador y batch) para medir el efecto aislado de la pérdida de alineación coseno frente a un teacher congelado.
- Estudio de destilación de representaciones con teachers externos: sirve como caso práctico de cómo acoplar un modelo preentrenado como C-RADIOv3-L mediante un proyector LN+MLP congelado en inferencia.
- Evaluación de generalización fuera de distribución: la tarea D2 (`libero_goal`), excluida explícitamente de todo el proceso de desarrollo, permite medir transferencia a una tarea y suite distintas de las de entrenamiento.
- Análisis de trayectorias de entrenamiento: al conservarse los checkpoints en los pasos 0, 500, 1000, 2000 y 3001 de ambas ramas, es posible estudiar curvas de aprendizaje, olvido catastrófico o degradación por sobreajuste a D0+D1.
- Base para ajuste posterior con LoRA: el pipeline descrito (OpenPI fijado más LoRA32) sirve como punto de partida para adaptar el modelo a nuevas tareas de manipulación con coste de cómputo reducido frente a un reentrenamiento completo.
- Docencia e investigación en robótica basada en simulación: el par de ramas y el protocolo estadístico declarado pueden utilizarse como ejemplo metodológico de diseño experimental con criterios de éxito preregistrados.
- Integración en stacks de robótica simulada basados en OpenPI: los checkpoints en formato Orbax pueden cargarse con la librería declarada para ejecutar políticas en entornos LIBERO.
- No se recomienda su uso directo en producción robótica real: no hay licencia declarada, no se han publicado datos de entrenamiento ni evaluaciones fuera de D2, y solo existe un seed.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. El autor remite a `REPORT_RU.md` y al artículo enlazado, pero las cifras no se incluyen en el material proporcionado, por lo que no se reproducen aquí.

| Tarea | Suite | Conjunto | Resultado |
|---|---|---|---|
| D0: recoger el cuenco negro del centro de la mesa y ponerlo en el plato | libero_spatial | entrenamiento | no disponible |
| D1: recoger el cuenco negro junto al plato y ponerlo en el plato | libero_spatial | entrenamiento | no disponible |
| D2: poner el cuenco en el horno | libero_goal | held-out fuera de distribución | no disponible |
| Comparación B-control frente a B-align | libero_spatial / libero_goal | checkpoints 0, 500, 1000, 2000, 3001 | no disponible |

## Requisitos de hardware

- Entrenamiento: el autor indica que el experimento se ejecutó en una A100 de 80 GB. No se especifica el número de GPU ni el tiempo de entrenamiento por rama.
- Inferencia: no se publican cifras de VRAM. Al no haber cuantizaciones publicadas (ni GGUF ni otros formatos comprimidos), no es posible estimar con rigor el consumo mínimo a partir de la información disponible.
- Almacenamiento: el repositorio ocupa 89,3 GB, repartidos entre diez checkpoints (cinco pasos por dos ramas), estados de optimizador, estadísticas de normalización y el proyector. Conviene prever ese espacio en disco antes de descargarlo.
- GPU compatibles: A100 80 GB verificada para entrenamiento. La compatibilidad con arquitecturas Blackwell no ha sido comprobada por el autor.
- Despliegue: la librería declarada es `openpi`, con pesos en formato Orbax/OpenPI. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y al no existir pesos en formatos estándar de inferencia no cabe esperar un despliegue directo en esas herramientas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qrvmil/pi0-d0d1-visual-alignment` (este repositorio) | no disponible | no disponible | no disponible en la información proporcionada | no disponible | HuggingFace, 0 descargas |
| π0 base (`gs://openpi-assets/checkpoints/pi0_base`) | no disponible | no disponible | no disponible | no disponible | Referenciado por el autor como punto de partida |
| π0 original (Physical Intelligence, arXiv:2410.24164) | no disponible | no disponible | no disponible | no disponible | Publicación y página del proyecto |
| Otros modelos VLA de capacidad comparable | no disponible | no disponible | no disponible | no disponible | no disponible en la búsqueda realizada |

## Limitaciones y advertencias

- Licencia no especificada: sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución de los pesos o de los derivados.
- Un único seed de entrenamiento: el autor advierte explícitamente que se trata de una sola semilla, lo que limita la significación estadística de cualquier comparación entre B-control y B-align.
- Evaluación restringida: solo se evalúa D2 como tarea externa; no se han probado tareas fuera de ese conjunto, por lo que se desconoce el comportamiento en otras suites o en robots reales.
- Brecha simulación-realidad: las tareas pertenecen al benchmark LIBERO, en simulación. No hay evidencia publicada de transferencia a manipulación física.
- Riesgo de sobreajuste a D0+D1: la normalización se calculó únicamente con esas dos tareas, y el propio autor subraya que D2 no se usó para calibración ni ajuste, lo que implica que cualquier cambio de dominio puede degradar el rendimiento.
- Reproducibilidad incompleta desde el repositorio: no se han subido los datos de entrenamiento, la caché de características del teacher, los checkpoints upstream ni las credenciales; la reproducción depende de recursos externos referenciados.
- Dependencia de versiones fijadas: el flujo se apoya en una revisión concreta de OpenPI y en LoRA32; desviarse de esas versiones puede invalidar la reproducibilidad.
- Compatibilidad de hardware no verificada en Blackwell: solo se confirma la ejecución en A100 80 GB.
- Documentación en ruso: la model card y el informe están en ruso, lo que puede dificultar la revisión por parte de equipos no rusohablantes.
- Alcance del modelo: es un artefacto de investigación de robótica, no un modelo de propósito general; no debe evaluarse ni presentarse como un modelo de lenguaje, visión o agentes.
- Riesgo de alucinación en el sentido clásico de modelos generativos de texto: no aplica directamente, pero sí existe riesgo de acciones incorrectas o inseguras en entornos físicos si se traslada fuera del ámbito simulado sin validación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qrvmil/pi0-d0d1-visual-alignment
- Código y reproducción (GitHub): https://github.com/qrvmil/pi0-d0d1-visual-alignment
- Artículo citado por el autor: https://arxiv.org/html/2510.25616
- Informe de resultados del autor: `REPORT_RU.md` (en el repositorio de GitHub)
- Checkpoint base de π0: `gs://openpi-assets/checkpoints/pi0_base`
- π0: A Vision-Language-Action Flow Model for General Robot Control (arXiv): https://arxiv.org/abs/2410.24164
- Versión HTML del artículo de π0: https://arxiv.org/html/2410.24164v1
- Physical Intelligence (página del proyecto): https://www.pi.website/
- Documentación de Intel sobre el modelo Pi0 en OpenVINO: https://docs.openedgeplatform.intel.com/dev/edge-ai-suites/robotics-ai-suite/ai_resources/openvino/models/model_pi0.html
- Guía visual interactiva de la arquitectura pi0 (Vizuara): https://pi0-viz-hub.vercel.app/
