# castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop76_ID_q2_164493

## Resumen

`castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop76_ID_q2_164493` es una política de control visuomotor entrenada con el método Diffusion Policy y publicada en el Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un modelo de robótica que transforma observaciones (estado del robot y dos cámaras RGB de 84x84) en trayectorias de acción de 7 dimensiones, y está especializado en una única tarea de ensamblaje de tres piezas sobre un robot tipo `panda`.

El modelo resuelve el problema de la manipulación rica en contacto mediante un proceso generativo de difusión que produce secuencias de acciones suaves y multimodales, en lugar de una regresión determinista que tiende a promediar modos de acción incompatibles. Con 278.014.699 parámetros y un repositorio de 1,1 GB, está pensado para ejecutarse en un bucle de control a 20 FPS sobre el robot real, no para inferencia de texto.

Es relevante ahora porque ejemplifica el flujo de trabajo actual de imitación robótica en código abierto: dataset MimicGen, entrenamiento reproducible con LeRobot 0.6.1 y despliegue directo con `lerobot-rollout`. Su utilidad es acotada y experimental: la model card no reporta ninguna evaluación real, por lo que debe tratarse como un artefacto de investigación y no como una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor) |
| Parametros totales | 278.014.699 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por paso de control) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

| Parametro adicional | Valor |
|---|---|
| Tipo de robot | `panda` |
| Cámaras | `agentview`, `robot0_eye_in_hand` |
| Entrada `observation.state` | STATE, shape `(9,)` |
| Entrada `observation.images.agentview` | VISUAL, shape `(3, 84, 84)` |
| Entrada `observation.images.robot0_eye_in_hand` | VISUAL, shape `(3, 84, 84)` |
| Salida `action` | ACTION, shape `(7,)` |
| Dataset de entrenamiento | `castanetnicolas/mimicgen_three_piece_assembly_d1_image84` |
| Episodios / frames / FPS | 200 / 67.101 / 20 |
| Tarea | "Insert the first piece into the base, then insert the second piece on top of it." |
| Pasos de entrenamiento | 300.000 |
| Batch size | 32 |
| Optimizador / LR | adam / 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tamaño del repo | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura es Diffusion Policy, tal como se describe en el paper arXiv:2303.04137: el control visuomotor se formula como un proceso generativo de difusión que predice una secuencia de acciones (horizonte de acción) condicionada por las observaciones. El modelo consume un vector de estado de 9 dimensiones y dos imágenes RGB de 84x84 píxeles (vista de agente y vista de muñeca) y emite un vector de acción de 7 dimensiones, típico de un efector final de 6 grados de libertad más la garra. El nombre del repositorio sugiere un horizonte de predicción de 8 pasos (`H_8`) y un recorte de imagen a 76 píxeles (`crop76`), aunque estos detalles no se documentan explícitamente en la model card.

El entrenamiento se realizó con LeRobot 0.6.1 durante 300.000 pasos, con batch size 32, optimizador Adam y tasa de aprendizaje 1e-4, sobre un dataset MimicGen de 200 episodios y 67.101 frames a 20 FPS. No se documenta el número total de tokens ni composición del dataset más allá de esas cifras, ni se menciona RLHF, DPO ni ningún ajuste posterior por refuerzo: es imitación pura supervisada sobre demostraciones. Tampoco se detalla si se aplicaron aumentos de datos, decodificación especulativa ni otras innovaciones de inferencia.

## Capacidades

- Generación de trayectorias de acción multimodales y suaves para manipulación rica en contacto, gracias al proceso de difusión.
- Percepción visual a partir de dos cámaras simultáneas (vista global y vista en la muñeca) a resolución 84x84.
- Fusión de estado propioceptivo (9 dimensiones) con observaciones visuales para producir acciones de 7 dimensiones.
- Ejecución de una tarea concreta de ensamblaje: insertar la primera pieza en la base y después la segunda encima.
- Control a la frecuencia del dataset de entrenamiento (20 FPS), adecuado para bucles de control en tiempo real.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo de pensamiento (thinking), visión de propósito general, audio ni otras modalidades.

## Casos de uso

- Ensamblaje de precisión en laboratorio: la política se ejecuta sobre un robot `panda` con `lerobot-rollout` para insertar piezas en una base; su naturaleza generativa le permite manejar el contacto y la incertidumbre de alineación mejor que una regresión directa.
- Reproducción de experimentos de imitación robótica: sirve como referencia reproducible de un entrenamiento Diffusion Policy con hiperparámetros documentados (300k pasos, batch 32, LR 1e-4, semilla 1000) para comparar variantes.
- Punto de partida para fine-tuning con datos propios: al estar en LeRobot y con licencia Apache 2.0, puede reentrenarse con `lerobot-train` sobre un dataset propio de ensamblaje con la misma estructura de observaciones.
- Docencia y formación en robótica de manipulación: permite mostrar el ciclo completo dataset MimicGen, entrenamiento y despliegue en un robot real sin infraestructura propietaria.
- Evaluación de robustez frente a variaciones de iluminación, posición de objetos o distracciones: el modelo puede usarse como sujeto de pruebas para medir la degradación de una política de difusión ante cambios de dominio.
- Integración en pipelines de investigación con simulación y robot real: el mismo checkpoint puede compararse entre evaluación simulada (MimicGen) y ejecución física para estudiar la brecha sim-a-real.
- Prototipado de control visuomotor de bajo coste computacional: con 278 M de parámetros y dos cámaras de 84x84, la inferencia es viable en una GPU de consumo, lo que facilita iterar sin clústeres dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No existen tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de simulación reportadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 278 M de parámetros en FP32 los pesos ocupan aproximadamente 1,1 GB, por lo que la inferencia cabe holgadamente en 4-8 GB de VRAM contando activaciones y buffers de imagen.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GB de VRAM es suficiente para inferencia; para entrenamiento con batch 32 y 300k pasos se recomienda una RTX 4090, A100 o H100 para reducir tiempos.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, dado el reducido tamaño del modelo.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El dataset y el bucle de control operan a 20 FPS, lo que fija un presupuesto de aproximadamente 50 ms por paso de control, pero el autor no reporta latencias medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`diffusion_UR5e_...`) | Diffusion Policy para ensamblaje de tres piezas | 278.014.699 | Estado (9,) + 2 imágenes 84x84; acción (7,) a 20 FPS | apache-2.0 | Hugging Face, LeRobot |
| Otras políticas Diffusion Policy en LeRobot | Diffusion Policy para distintas tareas | no disponible | Variable según dataset | habitualmente apache-2.0 | Hugging Face, LeRobot |
| Políticas ACT (Action Chunking Transformer) en LeRobot | Transformer de imitación | no disponible | Variable según dataset | habitualmente apache-2.0 | Hugging Face, LeRobot |
| Políticas basadas en VLA (p. ej. familias tipo RT/OpenVLA) | Modelos visión-lenguaje-acción de propósito general | no disponible en la información proporcionada | Contexto de lenguaje y visión de propósito general | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada, por lo que la comparación se limita a tipo de arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor no reporta ninguna tasa de éxito, ni en simulación ni en robot real, por lo que se desconoce su fiabilidad efectiva.
- Especialización extrema: la política está entrenada para una única tarea ("insertar la primera pieza en la base y después la segunda encima") y no generaliza a otras tareas sin reentrenamiento.
- Dependencia del entorno de entrenamiento: cambios en iluminación, posición de objetos, fondo o calibración de cámaras pueden degradar el rendimiento; no se documenta robustez ante estas variaciones.
- Dependencia del hardware: asume un robot `panda` con dos cámaras concretas (`agentview` y `robot0_eye_in_hand`) y nombres de observación específicos; usar otro robot o renombrar cámaras rompe la inferencia.
- Resolución baja: las imágenes de 84x84 limitan la percepción de detalles finos, lo que puede afectar a tareas de precisión submilimétrica.
- Riesgo de alucinación en el sentido robótico: al ser un modelo generativo, puede producir trayectorias plausibles pero incorrectas ante observaciones fuera de distribución, sin mecanismo de verificación interno.
- Sesgos: al entrenarse sobre 200 episodios de MimicGen, hereda los sesgos de esas demostraciones (posiciones, velocidades y estrategias concretas de ensamblaje).
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario asume toda la responsabilidad sobre el comportamiento del robot; no hay garantías del autor.
- Sin soporte de lenguaje: no puede interpretar instrucciones en lenguaje natural ni adaptarse a nuevas tareas mediante prompts; la tarea va fijada en el comando de despliegue.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, sin demo ni vídeo de validación, lo que sugiere un artefacto experimental sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_8_TASK_three_piece_assembly_crop76_ID_q2_164493
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
