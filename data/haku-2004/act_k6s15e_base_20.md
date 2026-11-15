# Haku-2004/act_k6s15e_base_20

## Resumen

`act_k6s15e_base_20` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. El modelo lo publica el usuario Haku-2004 en Hugging Face mediante la librería LeRobot, el framework de Hugging Face para aprendizaje por imitación en robótica, y se distribuye con licencia Apache 2.0.

No se trata de un modelo de lenguaje: es un checkpoint de control motor entrenado sobre el dataset `Haku-2004/k6_20_20261113_173939`, presumiblemente compuesto por demostraciones de teleoperación. Su relevancia es acotada y práctica: sirve como política lista para evaluar o reentrenar en tareas de manipulación robótica dentro del ecosistema LeRobot, con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace ligero y desplegable en hardware modesto.

El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y la model card no aporta información sobre composición del dataset, número de episodios, tarea concreta ni resultados de evaluación. Todo lo que sigue se basa estrictamente en los metadatos disponibles y en la documentación pública de ACT y LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre observaciones por paso y chunks de acción) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para este checkpoint) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/k6_20_20261113_173939 |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-11-15 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un esquema de predicción por chunks: en lugar de predecir una única acción por paso de tiempo, el modelo genera un bloque de acciones futuras, lo que reduce el error de acumulación y mitiga el problema de la varianza en la predicción paso a paso. La arquitectura típica de ACT incluye un codificador visual (habitualmente ResNet) para procesar las imágenes de las cámaras del robot, un codificador de estado conjunta y un decodificador transformer que produce el chunk de acciones; además incorpora un autoencoder condicionado (CVAE) para modelar la variabilidad de las demostraciones humanas. El checkpoint aquí descrito tiene 51,6 millones de parámetros, coherente con una configuración ACT de tamaño base.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939`, que no está documentado en la información disponible: se desconoce el número de episodios, la tarea, el robot empleado (la model card menciona `so100_follower` solo como ejemplo de evaluación), la frecuencia de control y la composición de las demostraciones. No hay información sobre aumentos de datos, hiperparámetros, número de épocas ni si se aplicaron técnicas adicionales como decodificación especulativa o atención lineal (no aplicables en este contexto). El nombre del checkpoint sugiere una variante "base" con un identificador de experimento (`k6s15e`), sin más detalle.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y de estado del robot, adecuado para tareas de manipulación aprendidas de demostraciones de teleoperación.
- Predicción de secuencias de acción: el chunking reduce el ruido y mejora la estabilidad frente a políticas que predicen un solo paso.
- Integración con LeRobot: entrenamiento, evaluación e inferencia mediante los comandos `lerobot-train` y `lerobot-record`.
- Compatibilidad con robots del ecosistema LeRobot, como el `so100_follower` citado en la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control motor, no un modelo generativo de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades propias de modelos fundacionales multimodales.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo puede ejecutar una tarea de pick-and-place aprendida de demostraciones, aprovechando el chunking de acciones para suavizar la trayectoria y reducir la acumulación de error en secuencias largas.
- Evaluación comparativa de políticas ACT: sirve como checkpoint de referencia para medir el efecto de cambios en el dataset o en los hiperparámetros dentro de un pipeline de LeRobot, dado su tamaño reducido (0,2 GB) y su licencia permisiva.
- Reentrenamiento con fine-tuning sobre un dataset propio: al ser un checkpoint ACT base, puede inicializarse desde estos pesos para adaptarlo a una nueva tarea con menos datos, usando `lerobot-train` con `--policy.path` apuntando a este repositorio.
- Prototipado rápido en robots de bajo coste: su tamaño permite desplegarlo en GPUs de consumo o incluso en CPU para inferencia, lo que facilita pruebas en plataformas tipo SO-100 sin infraestructura dedicada.
- Docencia y formación en aprendizaje por imitación: útil como ejemplo funcional de ACT para explicar el flujo completo de LeRobot (grabación de datos, entrenamiento, evaluación con `lerobot-record` y `--episodes`).
- Investigación en generalización visual: al ser una política entrenada sobre un dataset concreto, permite estudiar la sensibilidad a cambios de iluminación, posición de cámara o fondo, comparando el rendimiento con y sin aumentos de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas. El paper de ACT (arXiv:2304.13705) reporta resultados en tareas como inserción de clavijas, apertura de puertas y manipulación de objetos, pero no hay datos que permitan atribuir esos números a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6 millones de parámetros en safetensors (aproximadamente 0,2 GB en fp32), la inferencia requiere menos de 1 GB de VRAM, incluyendo el codificador visual y los buffers intermedios.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior funciona sin problemas. Para entrenamiento, se recomienda una RTX 3090, RTX 4090, A100 o H100 según el tamaño del dataset y el número de cámaras.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch y CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del hardware, del número de cámaras y de la frecuencia de control del robot; el chunking de ACT está diseñado precisamente para tolerar latencias de inferencia moderadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6s15e_base_20 (este) | 51,6 M | no aplica | no disponible | Apache 2.0 | Hugging Face, 0 descargas |
| ACT original (paper 2304.13705) | no disponible | no aplica | resultados publicados en el paper para tareas concretas | no disponible | código y pesos de referencia en el repositorio del paper |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | variable | no aplica | no disponible para comparación directa | variable | Hugging Face, ecosistema LeRobot |

No se dispone de datos de rendimiento comparables entre este checkpoint y alternativas de la misma categoría. La comparación relevante es metodológica: ACT frente a Diffusion Policy o TDMPC dentro de LeRobot, pero sin números publicados para este modelo concreto.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con demostraciones de teleoperación de un operador concreto, la política hereda los sesgos de estilo, velocidad y trayectoria del demostrador; puede generalizar mal a condiciones no vistas.
- Riesgo de alucinación: no aplica en el sentido de LLM, pero sí existe riesgo de acciones erráticas o fuera de distribución cuando la observación difiere del dataset de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje. Su "contexto" es la ventana de observaciones y el chunk de acciones configurado.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el dataset de entrenamiento (`Haku-2004/k6_20_20261113_173939`) puede tener su propia licencia y condiciones, no documentadas aquí.
- Caveat para producción: con 0 descargas y sin evaluación publicada, no hay evidencia de robustez; se recomienda validar exhaustivamente en el robot objetivo antes de cualquier despliegue real, y comprobar la seguridad física del entorno.
- Falta de documentación: se desconocen la tarea, el robot, la frecuencia de control y el número de episodios, lo que dificulta reproducir o auditar el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6s15e_base_20
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
