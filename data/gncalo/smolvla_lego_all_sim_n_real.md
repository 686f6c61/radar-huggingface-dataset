# gncalo/smolvla_lego_all_sim_n_real

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación a partir de demostraciones. Esta ficha concreta, `gncalo/smolvla_lego_all_sim_n_real`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario gncalo para una tarea específica de manipulación: recoger un ladrillo LEGO rojo y depositarlo en una caja.

El modelo consume observaciones compuestas por el estado del robot (vector de 6 dimensiones) y tres cámaras (256x256 píxeles cada una) y produce acciones de 6 dimensiones para un robot tipo `so_follower` (SO-100/SO-101 de LeRobot). Con 450 millones de parámetros, está pensado para desplegarse en hardware de consumo, lo que lo hace relevante para laboratorios y desarrolladores que necesitan prototipar políticas robóticas sin acceso a clústeres de GPU.

La relevancia de esta variante radica en su naturaleza de política entrenada sobre un dataset combinado de simulación y realidad (2300 episodios, 832.736 frames a 30 FPS), lo que ilustra el flujo completo de LeRobot: grabar datos, entrenar una política y desplegarla en un robot físico. No obstante, se trata de un modelo de nicho con cero descargas y sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto con encoder visual y decoder de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, sin ventana de contexto textual declarada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (modelo robótico; la instrucción de tarea es texto en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto que combina un encoder visual para procesar las imágenes de cámara con un componente de lenguaje que interpreta la instrucción de tarea y un decoder que genera acciones motrices. El modelo base `lerobot/smolvla_base` se preentrena sobre datos heterogéneos de robótica y se fine-tunea después para tareas concretas mediante aprendizaje por imitación supervisado. La arquitectura sigue el diseño descrito en el paper arXiv:2506.01844, orientado a reducir coste computacional manteniendo rendimiento competitivo frente a VLA de mayor tamaño.

El fine-tuning de esta ficha se realizó sobre el dataset `gncalo/lego_all_sim_n_real` (2300 episodios, 832.736 frames a 30 FPS, tarea "Pick up the red lego brick and put it in the box"), con 67.000 pasos de entrenamiento, batch size 16, optimizador AdamW, learning rate 0.0001 y semilla 1000, usando LeRobot 0.6.1. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación; se trata de aprendizaje por imitación puro. Tampoco se detalla la composición exacta del dataset ni la proporción entre episodios simulados y reales pese al nombre del repositorio.

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 6 dimensiones para un robot `so_follower` a partir de estado y visión.
- Percepción visual multi-cámara: procesa tres flujos de imagen de 256x256 (cámara frontal y muñeca, más una tercera cámara declarada en las entradas).
- Condicionamiento por instrucción en lenguaje natural: la tarea se especifica como texto ("Pick up the red lego brick and put it in the box").
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Despliegue en hardware de consumo: su tamaño de 450M parámetros permite inferencia en GPU de gama media.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`.
- No dispone de tool calling, function calling, capacidades de agente multi-paso ni modo de razonamiento explícito (thinking mode).
- Capacidades multilingües: no aplicables ni documentadas.

## Casos de uso

- Recogida de objetos en línea de montaje: el modelo ejecuta la tarea de coger un ladrillo LEGO rojo y colocarlo en una caja, replicable en celdas de pick-and-place con objetos similares tras reentrenamiento.
- Prototipado rápido de políticas robóticas: un equipo puede partir de `lerobot/smolvla_base`, grabar su propio dataset con LeRobot y obtener una política funcional en pocas horas de entrenamiento en una sola GPU.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar técnicas de aumento de datos, mezcla sim-a-real o variantes de arquitectura VLA.
- Docencia y formación en robótica: su tamaño reducido y su licencia Apache 2.0 permiten usarlo en cursos y talleres con hardware asequible (SO-100/SO-101).
- Validación de pipelines sim-a-real: el dataset combina simulación y realidad, lo que permite estudiar la transferencia de políticas entrenadas en simulador al robot físico.
- Automatización de tareas de clasificación simple: con fine-tuning adicional puede adaptarse a separar piezas por color o forma en entornos controlados.
- Despliegue en el borde (edge): al caber en GPU de consumo, puede ejecutarse junto al robot sin infraestructura de servidor dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, ni de comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en FP16/BF16 para los 450M parámetros, más overhead de los tres flujos de imagen a 256x256; el repositorio ocupa 0.9 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060/4060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe holgadamente en GPU de consumo: sí, en prácticamente cualquier GPU NVIDIA moderna e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) para ejecución en robot; `lerobot-train` para reentrenamiento. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles en la información proporcionada. La frecuencia de control del dataset es de 30 FPS, lo que da una referencia del ritmo de inferencia esperado.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gncalo/smolvla_lego_all_sim_n_real | 450M | VLA (fine-tune) | estado (6,) + 3 imágenes 256x256 | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | no disponible en esta ficha | VLA (base) | multimodal robótico | Apache 2.0 | Hugging Face (modelo base oficial) |
| Políticas ACT de LeRobot | no disponible | Transformer de imitación | imágenes + estado | Apache 2.0 | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | Política por difusión | imágenes + estado | Apache 2.0 | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a aspectos de disponibilidad y licencia; para una evaluación cuantitativa sería necesario consultar los benchmarks publicados del paper de SmolVLA y de las políticas ACT/Diffusion en LeRobot, que no se incluyen aquí.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su robustez fuera del dataset de entrenamiento.
- Especialización estrecha: entrenado para una única tarea ("Pick up the red lego brick and put it in the box") y un robot concreto (`so_follower`); no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir exactamente con las claves de observación del entrenamiento (`camera1`, `camera2`, `camera3`), lo que limita la portabilidad.
- Riesgo de sobreajuste al entorno: cambios de iluminación, posiciones de objetos, distractores o un robot distinto del mismo tipo pueden degradar el comportamiento; la model card advierte de que estos factores afectan a la dificultad.
- Sesgos: no documentados; al ser un modelo de imitación, hereda los sesgos y limitaciones de las demostraciones del dataset.
- Alucinación: en el contexto robótico se traduce en acciones erróneas o inseguras; no hay mecanismos de verificación ni de parada de seguridad documentados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- Idiomas: la instrucción de tarea está en inglés; no se documenta soporte multilingüe.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso comunitario ni de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gncalo/smolvla_lego_all_sim_n_real
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/gncalo/lego_all_sim_n_real
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=gncalo/lego_all_sim_n_real
