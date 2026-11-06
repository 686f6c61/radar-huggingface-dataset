# BUasY3Phospo/smolvla_candy_pick

## Resumen

`smolvla_candy_pick` es un modelo de tipo vision-language-action (VLA) afinado por el usuario BUasY3Phospo a partir del modelo base `lerobot/smolvla_base`. No es un modelo de lenguaje generativo al uso, sino una política de control robótico que consume observaciones multimodales (estado articular de 6 dimensiones y tres cámaras RGB de 256x256) y produce un vector de acción de 6 dimensiones. Su propósito concreto es ejecutar dos tareas de manipulación sobre un robot `so_follower`: coger un bombón Lion mini y depositarlo en un cuenco, o hacer lo mismo con un KitKat mini.

El modelo se distribuye en formato safetensors con 450.046.176 parámetros (aproximadamente 450 millones) y un tamaño de repositorio de 0,9 GB. Se entrenó con la librería LeRobot 0.6.1 durante 40.000 pasos, con un batch size de 64 y un learning rate de 1e-4 sobre el optimizador AdamW, usando un dataset propio de 80 episodios y 67.738 fotogramas a 30 FPS.

La relevancia de esta ficha es acotada: se trata de un fine-tune de nicho, sin descargas ni valoraciones en el Hub en el momento de la consulta, y sin resultados de evaluación publicados. Resulta útil como ejemplo reproducible de cómo adaptar SmolVLA a una tarea concreta de pick-and-place con hardware de bajo coste, y como referencia para quien quiera replicar el flujo de entrenamiento con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (SmolVLA); detalles internos de la arquitectura base no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Camaras | `student`, `teacher` (tres entradas visuales de 3x256x256) |
| Entrada de estado | `observation.state` de forma (6,) |
| Salida de accion | `action` de forma (6,) |
| Dataset de entrenamiento | BUasY3Phospo/merged_lion_kitkat (80 episodios, 67.738 frames, 30 FPS) |
| Pasos de entrenamiento | 40.000 |
| Batch size | 64 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |
| Modelo base | lerobot/smolvla_base |

## Arquitectura y entrenamiento

El modelo es un fine-tune de SmolVLA, un VLA compacto descrito en el paper arXiv:2506.01844, diseñado para obtener rendimiento competitivo con un coste computacional reducido y poder desplegarse en hardware de consumo. La ficha del autor no detalla la composición interna de la arquitectura base (número de capas, dimensión oculta, mecanismo de atención o encoder visual), por lo que esos datos deben consultarse en el paper y en el repositorio del modelo base.

El entrenamiento se realizó por imitación supervisada sobre el dataset `BUasY3Phospo/merged_lion_kitkat`, compuesto por 80 episodios y 67.738 fotogramas grabados a 30 FPS, con dos tareas declaradas: "Pick up a Lion mini and place it in the other bowl" y "Pick up a KitKat mini and place it in the other bowl". La configuración reportada es de 40.000 pasos, batch de 64, AdamW con learning rate 1e-4 y semilla 1000, ejecutada con LeRobot 0.6.1. No se indica en la información disponible si hubo etapas de RLHF, DPO u otro refinamiento posterior, ni el número total de tokens o muestras procesadas más allá de los pasos y el batch indicados.

## Capacidades

- Control robótico de manipulación tipo pick-and-place: genera comandos de acción de 6 dimensiones a partir de estado articular y tres vistas de cámara.
- Percepción visual multimodal: procesa tres flujos de imagen RGB de 256x256 píxeles de forma simultánea.
- Ejecución de instrucciones en lenguaje natural acotadas a dos tareas concretas (Lion mini y KitKat mini hacia el cuenco).
- Política de imitación entrenada de extremo a extremo, sin necesidad de planificación simbólica explícita.
- Integración con el ecosistema LeRobot: ejecución mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso, agentes, modo thinking, audio ni capacidades multilingües de texto.

## Casos de uso

- Automatización de pick-and-place en línea de montaje o laboratorio: el modelo recibe el estado del robot y tres cámaras y emite acciones de 6 grados de libertad para trasladar un objeto concreto a un recipiente; es adecuado porque la política está entrenada específicamente para esa secuencia sobre el robot `so_follower`.
- Prototipado rápido de políticas VLA con hardware de bajo coste: al tener 450 millones de parámetros y un repositorio de 0,9 GB, permite iterar en estaciones de trabajo con una sola GPU consumer, reduciendo el coste frente a VLA de mayor tamaño.
- Banquito de pruebas para investigación en imitación: sirve como referencia reproducible de un fine-tune de SmolVLA con hiperparámetros y dataset públicos, útil para comparar metodologías de recogida de datos y aumentación.
- Evaluación de robustez ante variaciones de iluminación y posición: al disponer de tres cámaras, permite estudiar cómo afectan cambios de punto de vista o de disposición de objetos a una política entrenada con 80 episodios.
- Docencia y formación en robótica de manipulación: el flujo completo (grabar dataset, entrenar con `lerobot-train`, desplegar con `lerobot-rollout`) es replicable en un curso con un `so_follower` y dos o tres cámaras.
- Base para fine-tuning en tareas análogas: al partir de `lerobot/smolvla_base` y publicarse con licencia Apache 2.0, puede reutilizarse como punto de partida para otras tareas de recogida y depósito con objetos distintos, ajustando el dataset y las instrucciones de tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota explícita de que todavía no se han proporcionado resultados en robot real (trials, successes, success rate).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 millones de parámetros en precisión completa (FP32) el peso ronda 1,8 GB, y en FP16/BF16 alrededor de 0,9 GB, a lo que hay que sumar el coste del encoder visual y de las activaciones de tres cámaras de 256x256.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo es apto para GPU consumer de gama media-alta; la model card destaca que SmolVLA puede desplegarse en hardware de consumo.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, aunque no se aporta una cifra oficial de consumo.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--policy.path=BUasY3Phospo/smolvla_candy_pick`; el reentrenamiento se realiza con `lerobot-train`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El dataset de entrenamiento se grabó a 30 FPS, pero no se indica la frecuencia de inferencia alcanzable en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BUasY3Phospo/smolvla_candy_pick | 450.046.176 | no disponible | Pick-and-place de Lion/KitKat mini con `so_follower` | apache-2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | no disponible | no disponible | Modelo base VLA de propósito general para fine-tuning | no disponible en la informacion proporcionada | Hugging Face (modelo base) |
| muktha212/smolvla_pick_candy | no disponible | no disponible | Variante de recogida de caramelos basada en SmolVLA | no disponible en la informacion proporcionada | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes, ya que ninguna de las fichas consultadas publica tasas de éxito en robot real.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card indica explícitamente que no se han proporcionado resultados de éxito en robot real, por lo que no hay evidencia cuantitativa de fiabilidad.
- Sesgo de dominio severo: la política está entrenada exclusivamente con 80 episodios y dos tareas concretas (Lion mini y KitKat mini); es esperable que falle ante objetos, posiciones, colores, iluminaciones o configuraciones de cámara distintos a los del dataset.
- Dependencia del hardware: entrenada para el robot `so_follower` con tres cámaras y un estado de 6 dimensiones; usar otro robot o un número distinto de cámaras requiere reentrenamiento.
- Riesgo de sobreajuste: 40.000 pasos con batch 64 sobre 67.738 fotogramas puede producir memorización de trayectorias; no se documentan técnicas de aumentación o regularización.
- Sin datos de sesgos demográficos ni lingüísticos: al no ser un modelo de lenguaje, no aplican sesgos de texto, pero tampoco se documenta ningún análisis de sesgo visual.
- Riesgo de alucinación en el sentido de acciones erróneas: como toda política de imitación, puede generar movimientos plausibles pero incorrectos sin señal de incertidumbre.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar la licencia del modelo base `lerobot/smolvla_base` y del dataset `merged_lion_kitkat`, no detalladas aquí.
- Madurez del artefacto: cero descargas y cero valoraciones en el Hub, creado y actualizado el mismo día, sin demo en vídeo ni resultados de terceros que lo validen.
- Idiomas: no aplica soporte multilingüe; las instrucciones de tarea están en inglés y ligadas a dos frases concretas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BUasY3Phospo/smolvla_candy_pick
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/BUasY3Phospo/merged_lion_kitkat
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=BUasY3Phospo/merged_lion_kitkat
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset auxiliar `candy_pick`: https://huggingface.co/datasets/BUasY3Phospo/candy_pick
- Variante relacionada: https://huggingface.co/muktha212/smolvla_pick_candy
