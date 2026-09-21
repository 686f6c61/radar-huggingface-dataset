# ngustj/smolvla_pen_301ep_hil_aug_v5_30k

## Resumen

`ngustj/smolvla_pen_301ep_hil_aug_v5_30k` es un ajuste fino de politica robótica (vision-language-action, VLA) construido sobre `lerobot/smolvla_base` con la librería LeRobot 0.6.2. El modelo consume observaciones de estado articular de 6 dimensiones y hasta tres cámaras RGB de 256x256 píxeles, y produce un vector de acción de 6 dimensiones para un brazo seguidor de tipo `so_follower` (familia SO-100/101). La tarea concreta para la que se ha entrenado es "Pick up a pen and place it in the pen holder", a partir del dataset `ngustj/pen_pick_place_301ep_v5` (301 episodios, 134.911 fotogramas a 30 FPS).

SmolVLA, el método base, se describe en el artículo arXiv 2506.01844 como un modelo VLA compacto y eficiente, capaz de rendimiento competitivo con costes computacionales reducidos y desplegable en hardware de consumo. Este repositorio concreto pesa 0,9 GB y contiene 450.046.176 parámetros, coherente con pesos en precisión de 16 bits, por lo que la inferencia cabe en GPUs de gama media e incluso en equipos modestos.

Su relevancia es doble: por un lado, demuestra el flujo completo de imitación de LeRobot (grabar datos, entrenar, publicar y ejecutar con `lerobot-rollout`); por otro, sirve como punto de partida reproducible para quien quiera replicar o extender un pipeline de manipulación con una sola tarea. Conviene tener presente que no es un modelo de propósito general: es una politica especializada, sin resultados de evaluación publicados y con 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; ajuste fino de `lerobot/smolvla_base` (detalles internos del backbone no disponibles en la información proporcionada) |
| Parametros totales | 450.046.176 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (política por paso de observación; la model card no documenta ventana de contexto ni horizonte de acción) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors (0,9 GB, compatible con fp16/bf16) |
| Idiomas soportados | No disponible; la única instrucción de tarea documentada está en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato LeRobot) |
| Entradas | `observation.state` (6,); `observation.images.camera1/2/3` (3, 256, 256) |
| Salidas | `action` (6,) |
| Robot objetivo | `so_follower` (seguidor SO-100/SO-101) |
| Cámaras declaradas | `top`, `wrist` (la tabla de entradas de la model card lista tres cámaras: discrepancia no resuelta) |
| Dataset de entrenamiento | `ngustj/pen_pick_place_301ep_v5` (301 episodios, 134.911 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 30.000 |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo es una politica VLA: combina percepción visual, estado propioceptivo y una instrucción en lenguaje natural para emitir acciones de control de 6 grados de libertad. Se ha obtenido por ajuste fino supervisado (imitación) de `lerobot/smolvla_base`, que a su vez se describe en el artículo SmolVLA (arXiv 2506.01844) como un modelo compacto diseñado para reducir el coste computacional frente a alternativas VLA de mayor tamaño. La model card no detalla la composición interna del backbone visual-lenguaje ni el mecanismo exacto de generación de acciones; esa información debe consultarse en el artículo y en la documentación de LeRobot.

La configuración de entrenamiento está documentada: 30.000 pasos con tamaño de lote 4 (lo que equivale a 120.000 muestras vistas), optimizador AdamW, tasa de aprendizaje 1e-4, semilla 1000 y LeRobot 0.6.2. Como el dataset contiene 134.911 fotogramas, el entrenamiento supone aproximadamente 0,89 épocas sobre los datos. El identificador del repositorio incluye los sufijos `hil_aug_v5`, cuyo significado concreto (por ejemplo, aumento de datos o recogida con intervención humana) no se explica en la model card. Tampoco se documentan fases de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de acciones de manipulación: produce vectores de acción de 6 dimensiones para un brazo seguidor SO-100/SO-101.
- Percepción visual multi-cámara: procesa hasta tres imágenes RGB de 256x256 píxeles por paso.
- Percepción propioceptiva: consume el estado articular de 6 dimensiones del robot.
- Condicionamiento por lenguaje: acepta una instrucción textual de tarea ("Pick up a pen and place it in the pen holder.").
- Ejecución autónoma de una tarea única: recoger un bolígrafo y colocarlo en un soporte.
- Compatibilidad con el ecosistema LeRobot: entrenamiento con `lerobot-train` y ejecución con `lerobot-rollout`.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio o generación de texto libre: no disponibles.

## Casos de uso

- Automatización de pick-and-place de objetos alargados: el modelo ejecuta la tarea de recoger un bolígrafo y depositarlo en un soporte con un brazo SO-100, integrable en una celda de laboratorio o una línea de montaje ligera.
- Punto de partida para ajuste fino con datos propios: al heredar de `lerobot/smolvla_base` y documentar el comando `lerobot-train`, sirve como plantilla para reentrenar con un dataset propio de otra tarea de manipulación.
- Prueba de concepto de imitación con LeRobot: permite validar de extremo a extremo el flujo grabar-calibrar-entrenar-desplegar sin escribir código de inferencia propio.
- Investigación en políticas VLA eficientes: con 450 millones de parámetros y 0,9 GB de pesos, es un banco de pruebas asequible para estudiar el equilibrio entre tamaño, coste y habilidad de manipulación.
- Docencia y robótica educativa: el coste de hardware contenido (brazo SO-100 más una GPU de gama media) lo hace viable en asignaturas de aprendizaje por imitación.
- Evaluación de robustez y de estrategias de aumento de datos: el sufijo `aug_v5` del nombre sugiere variantes sucesivas, útil para comparar el efecto del aumento de datos sobre la tasa de éxito.
- Reproducción de experimentos: la semilla (1000), la tasa de aprendizaje (1e-4), el lote (4) y el número de pasos (30.000) están documentados, lo que facilita replicar el entrenamiento.
- Base para comparativas internas de políticas: sirve como referencia de una sola tarea frente a otros ajustes del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la tabla vacía y la indicación explícita de que no se han proporcionado resultados para esta politica. No se dispone, por tanto, de tasas de éxito en robot real, ni de métricas sobre posiciones de objeto, condiciones de iluminación o presencia de distractores.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,9 GB (coherente con fp16/bf16). Sumando el codificador visual, las tres cámaras de 256x256 y las activaciones, se estima un consumo total del orden de 2 a 4 GB; se recomienda una GPU con al menos 8 GB de VRAM. Es una estimación orientativa, no un dato publicado.
- GPU recomendadas: cualquier GPU moderna con 8 GB o más, como RTX 3060, RTX 4060, RTX 4070 o RTX 4090. No se requiere A100 ni H100 para inferencia.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas de 8 GB o más. La model card del método base afirma que SmolVLA puede desplegarse en hardware de consumo.
- Opciones de despliegue: LeRobot con `lerobot-rollout` sobre PyTorch y CUDA. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabó a 30 FPS, pero no se documenta la frecuencia de control alcanzada en inferencia.
- Cómputo en CPU: no documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Formato | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `ngustj/smolvla_pen_301ep_hil_aug_v5_30k` | 450.046.176 | Apache-2.0 | Safetensors (LeRobot) | HuggingFace, 0 descargas, 0 likes | Ajuste fino de una sola tarea |
| `lerobot/smolvla_base` | No disponible en la información proporcionada | No disponible en la información proporcionada | Safetensors | HuggingFace | Modelo base preentrenado del que deriva este ajuste |
| Otras políticas VLA de mayor tamaño (por ejemplo, alternativas basadas en modelos de lenguaje de miles de millones de parámetros) | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada para comparar rendimiento |

La comparación cuantitativa no es posible con los datos disponibles: no hay métricas de éxito publicadas para este ajuste ni cifras homogéneas de los modelos alternativos. La diferencia principal frente a políticas VLA de mayor tamaño es el coste de despliegue: 450 millones de parámetros y 0,9 GB permiten inferencia en GPU de consumo, a cambio de una especialización estricta en una única tarea.

## Limitaciones y advertencias

- Especialización extrema: solo se ha entrenado para "Pick up a pen and place it in the pen holder"; no hay evidencia de que generalice a otras tareas, objetos o posiciones.
- Sin evaluación publicada: la model card indica que no se han proporcionado resultados, por lo que se desconoce la tasa de éxito real, la robustez frente a cambios de iluminación o la sensibilidad a la colocación inicial del objeto.
- Dependencia del montaje: las cámaras deben coincidir con las claves de observación del entrenamiento (`top`, `wrist` o `camera1/2/3`) y la calibración del robot debe reproducir la del dataset; cualquier cambio de encuadre degrada la política.
- Ambigüedad de entradas: la model card declara dos cámaras (`top`, `wrist`) en la sección de detalles, pero la tabla de entradas lista tres (`camera1`, `camera2`, `camera3`). Hay que verificar en el repositorio cuántas espera realmente antes de desplegar.
- Riesgo de alucinación de acciones: como toda política de imitación, puede generar trayectorias plausibles pero físicamente inválidas fuera de la distribución de los datos de entrenamiento (por ejemplo, colisiones o agarres fallidos).
- Sesgos de datos: 301 episodios de una única tarea y presumiblemente un único entorno físico; no se documenta diversidad de posiciones, iluminación, operadores ni objetos distractores.
- Idiomas: no se documentan capacidades multilingües; la única instrucción conocida está en inglés y el modelo no está pensado para diálogo.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base, del dataset y del hardware empleado; la licencia del modelo base no se especifica en la información proporcionada.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo día (21 de septiembre de 2026); no hay validación por parte de terceros ni resultados de la comunidad.
- Producción: al no existir métricas de éxito ni pruebas en entornos variados, no se recomienda su uso en producción sin una evaluación propia y un mecanismo de parada de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngustj/smolvla_pen_301ep_hil_aug_v5_30k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ngustj/pen_pick_place_301ep_v5
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ngustj/pen_pick_place_301ep_v5
- Artículo SmolVLA (referencia arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Registro de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Búsqueda web: los resultados obtenidos no guardan relación con el modelo (contenido sobre una planta ornamental) y no aportan información adicional.
