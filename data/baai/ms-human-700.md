# BAAI/MS-Human-700

## Resumen

MS-Human-700 no es un modelo de lenguaje ni una red neuronal generativa: es un modelo musculoesquelético humano de cuerpo completo con 700 unidades músculo-tendón, distribuido junto con su entorno de simulación (MuJoCo + Gymnasium), código de entrenamiento por refuerzo (DynSyn-SAC) y referencias de movimiento. Lo publica el grupo BAAI (LNSGroup), con origen en los papers MS-Human-700 (ICRA 2024) y DynSyn (ICML 2024). Resuelve el problema de disponer de un banco de pruebas anatómicamente detallado y reproducible para control motor neuromusculoesquelético, algo que hasta ahora exigía ensamblar modelos de biomecánica y stacks de RL por separado.

El repositorio incluye tres variantes de modelo: locomoción completa de 700 músculos (marcha, escaleras, recuperación ante perturbaciones), la misma con dos mancuernas fijas de 5 kg, y una variante de manipulación con 81 actuadores musculares en el brazo derecho guiada por visión estéreo. El algoritmo de control, DynSyn-SAC, proyecta observaciones sensoriales en acciones de grupo muscular y las expande a excitaciones musculares individuales mediante una capa de sinergia aprendida, lo que reduce la dimensionalidad efectiva de la acción frente a las 700 excitaciones directas.

Es relevante ahora porque entrega, bajo Apache-2.0, un entorno completo y ejecutable (Python 3.12+, `uv`, MuJoCo) para investigar control de alta dimensionalidad, sinergias musculares y aprendizaje con percepción visual. Conviene advertir de entrada: esta release **no incluye checkpoints de políticas entrenadas ni resultados de evaluación**, solo entornos, código y movimientos de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multcuerpo musculoesquelético en XML de MuJoCo + políticas de RL (SAC, Stable-Baselines3) con capa de sinergia DynSyn; encoder visual ResNet-18 congelado |
| Parametros totales | No aplica: no es una red neuronal con recuento de parámetros publicado. El modelo anatómico consta de 700 unidades músculo-tendón (`MS-Human-700.xml`) y 81 actuadores musculares en la variante de manipulación |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un LLM). Observaciones por paso de control: propiocepción, canales vestibular y táctil, referencia de tarea y, opcionalmente, RGB estéreo |
| Tipos de cuantizacion | No aplica (modelo físico en XML; no hay pesos cuantizables) |
| Idiomas soportados | Inglés (model card, documentación y nombres de configuración). El modelo no procesa lenguaje |
| Licencia | Apache-2.0 (código y modelos) |
| Formato de pesos | XML de MuJoCo y assets asociados (mallas/texturas) en `msgym/MS-Human-700/`; código Python. Los pesos de políticas no se incluyen |
| Versión de Python | 3.12 o superior |
| Entornos Gymnasium | `msgym/LocomotionEnv-v1`, `msgym/ManipulationEnv-v1` |
| Configuraciones de tarea | `tracking_walk.json`, `tracking_stairs.json`, `tracking_farmer.json`, `tracking_recovery.json`, `vision/manipulation_vision.json` |
| Políticas disponibles en el código | `StateSACPolicy` (vectorial), `VisionSACPolicy` (con imagen) |
| Tamaño del repo | 0,0 GB (según HuggingFace); descargas: 0; likes: 3 |

## Arquitectura y entrenamiento

El componente anatómico es un modelo multcuerpo de MuJoCo con cuerpos, articulaciones y 700 unidades músculo-tendón que actúan como actuadores, más canales sensoriales de propiocepción, vestibular y táctil. La variante de manipulación reduce el alcance al brazo derecho con 81 actuadores musculares y añade visión estéreo (`left_eye`, `right_eye` en formato RGB channel-first). La representación es jerárquica y de baja dimensión: DynSyn mapea características sensoriales a acciones de grupo muscular y una capa de sinergia aprendida las expande a excitaciones musculares individuales, de modo que el espacio de acción efectivo es mucho menor que las 700 excitaciones nativas.

El entrenamiento usa SAC (off-policy, Stable-Baselines3) sobre los entornos Gymnasium. En modo vectorial, `StateSACPolicy` consume directamente propiocepción, sensores y referencia; `vision_enabled=false` desactiva el renderizado y el encoder visual. En modo visual, un ResNet-18 preentrenado en ImageNet, congelado y en modo evaluación, procesa cada ojo con el preprocesado de torchvision y produce 512 características pooled por ojo antes de la cabeza de clasificación. Los intervalos de renderizado son 32x32 píxeles estéreo cada 20 pasos de control en tareas de tracking y 128x128 cada 5 pasos en manipulación (`eye_camera_size`, `vision_render_interval`). No se especifican en la información disponible el número de tokens, la composición del dataset ni el uso de RLHF/DPO, que no aplican a este dominio; las referencias de movimiento (motion references) son la señal de tracking.

## Capacidades

- Simulación musculoesquelética de cuerpo completo con 700 unidades músculo-tendón y anatomía detallada de cuerpos y articulaciones.
- Control de locomoción: marcha, subida de escaleras, marcha con carga fija (dos mancuernas de 5 kg) y recuperación ante perturbaciones externas.
- Manipulación del brazo derecho guiada por visión estéreo, con 81 actuadores musculares y modo no visual alternativo que aporta poses de objeto y objetivo en la referencia de tarea.
- Percepción multimodal configurable: propiocepción, vestibular, táctil y RGB estéreo, con encoder visual ResNet-18 congelado.
- Control por sinergias: la capa DynSyn traduce acciones de grupo muscular a excitaciones individuales.
- Interfaz estándar Gymnasium (API de entornos) con configuración por fichero JSON para tareas y presupuestos de entrenamiento.
- Entrenamiento y evaluación reproducibles mediante scripts (`train.py`, `eval.py`) con acciones deterministas en evaluación, normalización de observaciones y exportación de `evaluation.json` y vídeo opcional.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Investigación en control motor y sinergias musculares: entrenar políticas SAC sobre `LocomotionEnv-v1` para estudiar cómo emergen patrones de activación coordinados a partir de la capa de sinergia, con la ventaja de disponer de las 700 excitaciones individuales para inspección biomecánica.
- Diseño de exoesqueletos y órtesis: usar la variante `FarmerWalk` (carga fija de 5 kg) como banco de pruebas de estrategias de asistencia y comparar el coste de transporte antes y después de una política de asistencia simulada.
- Rehabilitación y análisis de recuperación postural: la tarea `tracking_recovery` permite evaluar políticas de recuperación ante perturbaciones, útil para estudiar estrategias de respuesta y estabilidad.
- Prótesis de mano y agarre protésico: `ManipulationEnv-v1` con visión estéreo 128x128 y 81 músculos del brazo derecho sirve para prototipar control visual de agarre antes de pasar a hardware.
- Benchmark de RL de alta dimensionalidad: comparar variantes de política (vectorial frente a visual), intervalos de renderizado y arquitecturas de encoder sobre un mismo conjunto de tareas y presupuestos de entrenamiento, con configuración homogénea en JSON.
- Animación y simulación gráfica con fidelidad anatómica: generar movimientos de marcha y manipulación con estructura muscular plausible para visualización, videojuegos o cine, usando MuJoCo `simulate` para inspección del modelo.
- Docencia en biomecánica computacional: el paquete incluye modelos y assets, de modo que un alumno puede abrir un XML, inspeccionar articulaciones y músculos y ejecutar entrenamientos sin montar un stack propio.
- Estudio de ergonomía y carga física: cuantificar el efecto de cargas externas fijas sobre patrones de activación muscular en el ciclo de marcha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los checkpoints de políticas entrenadas y los resultados de evaluación no están incluidos en esta release, por lo que no hay cifras de recompensa, coste de transporte, tasa de éxito de manipulación ni comparaciones numéricas que reportar.

## Requisitos de hardware

- Inferencia/simulación: MuJoCo ejecuta la dinámica principalmente en CPU. Un CPU de escritorio moderno es suficiente para inspeccionar los modelos con `simulate`; no hay cifras publicadas de pasos por segundo para 700 actuadores.
- Memoria RAM: no disponible oficialmente; prever al menos 8-16 GB para entrenamiento con renderizado offscreen y buffers de replay. Es una estimación, no un dato del repositorio.
- GPU: no imprescindible. Para entrenamiento con visión, el ResNet-18 congelado y el renderizado acelerado se benefician de una GPU. Una RTX 4090, A100 o H100 sobredimensionan la carga del encoder; una GPU consumer de gama media con 8 GB o más es un punto de partida razonable. Cifras de VRAM exactas: no disponibles.
- ¿Cabe en GPU consumer? Sí, en el rango de 8 GB o superior si se activa visión; el modo vectorial con `vision_enabled=false` evita renderizado y encoder, reduciendo requisitos a CPU.
- Despliegue: MuJoCo + Gymnasium + Stable-Baselines3 como stack principal; instalación con `uv pip install -e ".[dynsyn]"` sobre Python 3.12+. En Linux sin pantalla, definir `MUJOCO_GL=egl` para renderizado offscreen.
- Latencia y throughput: no disponibles. Como referencia de coste, el tracking renderiza 32x32 estéreo cada 20 pasos de control y la manipulación 128x128 cada 5 pasos, lo que sitúa el cuello de botella en la simulación física y el renderizado offscreen más que en el encoder.
- No se incluyen pesos de política, así que no hay nada que servir con vLLM, llama.cpp, Ollama ni TGI; esos despliegues no aplican.

## Comparativa con modelos similares

| Modelo | Tipo | Músculos / actuadores | Tareas | Visión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MS-Human-700 (BAAI) | Musculoesquelético de cuerpo completo en MuJoCo + DynSyn-SAC | 700 (cuerpo completo); 81 (manipulación) | Marcha, escaleras, carga, recuperación, manipulación | Estéreo opcional (ResNet-18) | Apache-2.0 | HuggingFace + GitHub; sin checkpoints |
| MyoSuite / MyoFullBody (Meta) | Musculoesquelético en MuJoCo para control motor | Número exacto no verificado en la información disponible | Locomoción, manipulación de mano y brazo | No verificada | Licencia del proyecto MyoSuite (consultar) | Público en GitHub |
| OpenSim (modelos de cuerpo completo, p. ej. Rajagopal et al.) | Simulación biomecánica multcuerpo | Número exacto no verificado en la información disponible | Análisis de marcha, dinámica muscular, biomecánica clínica | No aplica | Licencia abierta de OpenSim (consultar) | Público en simtk.org |
| Humanoides rígidos con RL (p. ej. Unitree, Isaac) | Cuerpo completo rígido, sin músculos | Articulaciones motorizadas, sin unidades músculo-tendón | Locomoción y manipulación | Varía | Varía por proyecto | Muy extendido |

La diferencia clave frente a los humanoides rígidos es la presencia de 700 unidades músculo-tendón con sinergias aprendidas, lo que aporta plausibilidad biomecánica a costa de un espacio de acción y una dinámica mucho más costosos. Frente a OpenSim, el valor añadido es el pipeline de RL listo para entrenar y la integración con Gymnasium.

## Limitaciones y advertencias

- La release no incluye checkpoints de políticas entrenadas ni resultados de evaluación; hay que entrenar desde cero para obtener cualquier política funcional.
- No se documenta validación sim-a-real en la información disponible. Los resultados deben tratarse como simulación, no como control validado en hardware.
- Modelo puramente biomecánico: no procesa lenguaje, no genera texto y no tiene capacidades de razonamiento simbólico ni tool calling.
- Sesgos conocidos: no disponibles. Un modelo anatómico concreto incorpora una morfología y antropometría específicas, por lo que no representa la variabilidad poblacional; la información proporcionada no detalla el sujeto de origen.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero las políticas entrenadas pueden explotar artefactos del simulador (reward hacking) y producir comportamientos no físicos que no transferirán.
- Limitaciones de idioma: documentación y configuración únicamente en inglés.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación con atribución y aviso de cambios; conviene citar los papers de ICRA 2024 e ICML 2024. Verificar la licencia de los assets gráficos si se redistribuyen.
- Requiere Python 3.12 o superior y `uv`; entornos con versiones anteriores fallarán.
- En Linux sin pantalla es obligatorio `MUJOCO_GL=egl`; sin ello el renderizado offscreen falla y el entrenamiento con visión no arranca.
- Señales de adopción muy bajas (0 descargas, 3 likes en el momento de la consulta), lo que reduce la probabilidad de encontrar solución a problemas en la comunidad.
- Coste computacional: 700 actuadores musculares implican una dinámica cara por paso; los presupuestos de entrenamiento pueden ser elevados aunque no se publican cifras.

## Enlaces

- HuggingFace: https://huggingface.co/BAAI/MS-Human-700
- Página del proyecto: https://lnsgroup.cc/research/MS-Human
- Repositorio del modelo: https://github.com/LNSGroup/MS-Human-700
- Entornos msgym: https://github.com/LNSGroup/msgym
- Paper MS-Human-700 (ICRA 2024): https://arxiv.org/abs/2312.05473
- Paper DynSyn (ICML 2024): https://arxiv.org/abs/2407.11472

Nota: los resultados de búsqueda web proporcionados no contienen enlaces relevantes para este modelo (corresponden a contenido no relacionado), por lo que no se incluyen.
