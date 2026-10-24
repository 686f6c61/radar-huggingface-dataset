# rsundaraws/act_arm2_fixedspot

## Resumen

`act_arm2_fixedspot` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicada en el Hub por el usuario rsundaraws mediante LeRobot. No es un modelo de lenguaje: es un controlador visomotor que, a partir del estado articular de un brazo SO-101 de 6 grados de libertad y de dos flujos de cámara (muñeca y cenital), predice directamente un vector de acción de 6 dimensiones para mover el robot.

El modelo resuelve una única tarea concreta —"Pick up the cube and place it in the orange box"— aprendida por imitación de 65 episodios de teleoperación (22.621 fotogramas a 30 FPS). Con 51,67 millones de parámetros y 0,2 GB de pesos en safetensors, su relevancia práctica es la de un artefacto reproducible de investigación: un ejemplo completo y ligero del flujo LeRobot (grabación de datos, entrenamiento y despliegue) que sirve como línea base y como punto de partida para reentrenar tareas propias.

La model card no incluye resultados de evaluación en robot real ni detalles del troceado de acciones, y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha, lo que lo sitúa como un experimento personal más que como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual, encoder de estado y cabeza de acciones; variante CVAE descrita en arXiv:2304.13705 |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica al uso lingüístico; el horizonte de acciones (*chunk size*) no se especifica en la model card |
| Tipos de cuantización | No disponible; los pesos se distribuyen en safetensors sin cuantizar |
| Idiomas soportados | No aplica (no procesa texto; la tarea se fija con la cadena `--task` del CLI) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `so_follower` (SO-101) |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.overhead` (3, 360, 640) |
| Salidas | `action` (6,) |
| Tamaño del repositorio | 0,2 GB |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

ACT es un método de imitación supervisada que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución. La implementación de LeRobot combina un extractor visual convolucional que procesa las dos cámaras por separado, una codificación del estado propioceptivo de 6 dimensiones y un transformer que genera el bloque de acciones; la variante CVAE del paper modela la variabilidad de las demostraciones humanas mediante una variable latente. La model card no detalla el tamaño del chunk, el número de capas ni la resolución interna del backbone, por lo que esos hiperparámetros deben consultarse en el checkpoint (`config.json`) del repositorio.

El entrenamiento se realizó sobre el dataset `rsundaraws/so101_arm2_fixedspot_trim` (65 episodios, 22.621 fotogramas, 30 FPS, tarea única de pick-and-place) durante 30.000 pasos con batch de 32, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se documenta composición adicional del dataset, aumento de datos, ni fases de RLHF o DPO (no aplicables a este paradigma). Tampoco se indica si hubo aumento de imagen o entrenamiento con acciones absolutas o relativas.

## Capacidades

- Control visomotor de un brazo SO-101 de 6 GDL para la tarea de coger un cubo y depositarlo en una caja naranja.
- Fusión de dos vistas: cámara de muñeca a 640×480 y cámara cenital a 640×360, más estado articular de 6 valores.
- Predicción de trozos de acción que permiten ejecución fluida a 30 FPS sin replanificación paso a paso.
- Aprendizaje por imitación a partir de pocas demostraciones (65 episodios), sin recompensas ni entorno simulado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni instrucciones en lenguaje natural: la tarea está codificada en los pesos.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".
- Reentrenable con el CLI `lerobot-train` sobre cualquier dataset compatible con LeRobot.

## Casos de uso

- **Línea base de pick-and-place en laboratorio**: sirve para medir el éxito de una tarea de manipulación estándar (cubo → caja) antes de probar arquitecturas más costosas como Diffusion Policy o modelos VLA, con un coste de inferencia mínimo.
- **Punto de partida para fine-tuning de una tarea propia**: al estar en formato LeRobot y con licencia Apache-2.0, se puede reentrenar con `--policy.type=act` sobre un dataset propio de 50-100 episodios grabados con el mismo robot, reutilizando la configuración de entrenamiento publicada.
- **Validación de una canalización de datos completa**: los 65 episodios y 22.621 fotogramas a 30 FPS con dos cámaras permiten comprobar grabación, calibración, sincronización y visualización con el visor de datasets de LeRobot antes de escalar la recolección.
- **Docencia y formación en imitation learning**: el repositorio de 0,2 GB y 51,7 M de parámetros se puede entrenar y ejecutar en una GPU de gama media o incluso en CPU para demostraciones de clase sin infraestructura dedicada.
- **Pruebas de integración hardware-software**: útil para verificar el cableado, los índices de cámara, el puerto del `so_follower` y el bucle de control a 30 FPS antes de invertir en políticas mayores, gracias al comando `lerobot-rollout` con `--strategy.type=base`.
- **Estudio de robustez ante cambios de escena**: al ser una política sobreajustada a una posición fija, sirve como caso controlado para medir la caída de éxito al mover el objeto, cambiar la iluminación o introducir distractores, comparando contra variantes entrenadas con más datos.
- **Referencia para comparativas de eficiencia**: con 51,67 M de parámetros permite calcular latencia y consumo en hardware embebido (por ejemplo, Jetson Orin Nano) frente a políticas generativas de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card incluye la advertencia "_No evaluation results have been provided for this policy yet_", sin tabla de ensayos, tasas de éxito ni comparación con otras políticas.

| Métrica | Valor |
|---|---|
| Tasa de éxito en robot real | No disponible |
| Número de ensayos de evaluación | No disponible |
| MMLU / HumanEval / GSM8K | No aplica (no es un modelo de lenguaje) |
| Pérdida final de entrenamiento | No disponible |

## Requisitos de hardware

- **Peso de los pesos**: 51.668.614 parámetros en fp32 equivalen a unos 207 MB (0,2 GB), coherente con el tamaño del repositorio; en fp16 bajaría a ~103 MB y en int8 a ~52 MB, aunque no se documentan conversiones oficiales.
- **VRAM estimada**: menos de 1 GB para pesos; con las activaciones de dos flujos de imagen (480×640 y 360×640) a batch 1, la estimación razonable es de 1-2 GB en fp32. Es una estimación de cálculo, no una medida publicada por el autor.
- **GPU recomendadas**: cualquier GPU con 4 GB o más basta (RTX 3050, RTX 4060, RTX 3060, T4). Para despliegue embebido en el robot, Jetson Orin Nano o Raspberry Pi 5 con el modelo en CPU son viables por el reducido número de parámetros.
- **Cabe en GPU de consumo**: sí, en prácticamente todas las GPU dedicadas de los últimos ocho años, y también en CPU para inferencia a 30 FPS si se acepta mayor latencia por paso.
- **Opciones de despliegue**: `lerobot-rollout` (CLI oficial) sobre PyTorch; el script de entrenamiento es `lerobot-train`. No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni GGUF, formatos no aplicables a una política de control.
- **Latencia y throughput**: no publicados. Como referencia del funcionamiento de ACT en LeRobot, la política infiere un bloque de acciones por pasada y lo ejecuta durante varios fotogramas; el valor por defecto de la librería es un chunk de 100 acciones, que a 30 FPS cubre unos 3,3 s por inferencia. Este dato proviene de los valores por defecto de LeRobot, no de la model card, que no especifica el chunk utilizado.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `act_arm2_fixedspot` (este) | ACT, imitación con chunking | 51,67 M | Estado 6-D + 2 cámaras; tarea fija, sin lenguaje | Apache-2.0 | Hub de HuggingFace + LeRobot |
| Diffusion Policy | Imitación generativa por difusión de acciones | No disponible en la información proporcionada | Estado + imágenes; tarea fija | No verificada aquí | Implementación de referencia pública |
| SmolVLA | VLA ligero (visión-lenguaje-acción) | No disponible en la información proporcionada | Imágenes + instrucción en lenguaje natural | No verificada aquí | Hub + LeRobot |
| π0 / π0.5 | VLA con flow matching | No disponible en la información proporcionada | Imágenes + instrucción en lenguaje natural | No verificada aquí | Publicación y pesos abiertos |

Diferencias cualitativas relevantes: frente a Diffusion Policy, ACT es más ligero y con inferencia determinista de menor coste por paso, pero suele ser menos expresivo en distribuciones multimodales de acciones. Frente a los VLA (SmolVLA, π0), este checkpoint carece de condicionamiento por lenguaje y de generalización entre tareas: solo ejecuta la tarea para la que fue entrenado y solo con el embodiment `so_follower`.

## Limitaciones y advertencias

- **Tarea única y sobreajustada**: entrenada exclusivamente para "coger el cubo y dejarlo en la caja naranja" con el objeto en una posición fija, como indica el propio nombre del repositorio (`fixedspot`). Cualquier cambio de posición, color u objeto invalida el comportamiento.
- **Sin evaluación**: el autor no reporta tasa de éxito ni protocolo de evaluación, por lo que no hay evidencia cuantitativa de robustez.
- **Datos muy reducidos**: 65 episodios y 22.621 fotogramas implican un riesgo alto de sobreajuste y de que la política reproduzca trayectorias memorizadas.
- **Dependencia del embodiment**: requiere un SO-101 (`so_follower`) calibrado y dos cámaras con los nombres y resoluciones exactos (`wrist` 480×640, `overhead` 360×640); un cambio de montaje óptico degrada la política sin aviso.
- **Riesgo de alucinación motora**: en políticas de imitación, el equivalente es la ejecución de movimientos plausibles pero incorrectos ante entradas fuera de distribución; al no haber mecanismo de verificación de éxito, el robot puede empujar objetos o alcanzar límites articulares.
- **Ausencia de parada de seguridad**: la ejecución descrita en la model card corre durante 60 s de forma indefinida si se omite `--duration`; es imprescindible añadir límites de par, parada de emergencia y supervisión humana.
- **Licencia**: Apache-2.0 permite uso comercial y modificaciones con atribución y aviso de cambios; no impone restricciones de campo de uso, pero el usuario asume la responsabilidad sobre el comportamiento físico del robot.
- **Sesgos**: no evaluados; los datos provienen de un único operador, una única escena y presumiblemente una única iluminación, por lo que el sesgo de dominio es severo.
- **Metadatos anómalos**: la fecha de creación registrada (2026-10-24) es posterior a la de esta ficha, lo que sugiere una marca de tiempo incorrecta; conviene no usar los campos temporales como referencia de versionado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rsundaraws/act_arm2_fixedspot
- Dataset de entrenamiento: https://huggingface.co/datasets/rsundaraws/so101_arm2_fixedspot_trim
- Variante con cámara de muñeca: https://huggingface.co/datasets/rsundaraws/so101_arm2_fixedspot_wrist
- Perfil del autor: https://huggingface.co/rsundaraws
- Paper de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
