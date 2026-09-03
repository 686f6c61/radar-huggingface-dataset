# jogarulfop/policy_2026-09-02_shake4it_bench_5sensors_v2_dragonfly_10kHz_nfft_512

## Resumen

Este modelo es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido entrenado y publicado mediante el framework LeRobot de Hugging Face, y está diseñado para ejecutar una tarea concreta de manipulación denominada "shake4it" sobre un robot con cinco sensores, muestreado a 10 kHz con una transformada de Fourier de 512 puntos. El autor es jogarulfop y el modelo se distribuye bajo licencia Apache-2.0.

Con 51,7 millones de parámetros, es un modelo compacto orientado a la inferencia en tiempo real sobre hardware de gama media. Su relevancia radica en que demuestra el flujo de trabajo completo de LeRobot: desde la recopilación de datos teleoperados hasta el entrenamiento y despliegue de una política de imitación, todo ello con herramientas open source. No se trata de un modelo de lenguaje ni de visión general, sino de una política específica para un robot y una tarea determinada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer que aprende a generar "chunks" de acciones (secuencias de varios pasos de control) a partir de observaciones del estado del robot y de la cámara. El método, descrito en el paper arXiv:2304.13705, utiliza un codificador de visión (típicamente ResNet) y un decodificador transformer que produce las acciones futuras. El entrenamiento se realiza mediante aprendizaje por imitación con datos teleoperados, minimizando la diferencia entre las acciones predichas y las reales.

En este caso concreto, el modelo fue entrenado con el framework LeRobot, que gestiona el dataset, el entrenamiento y el registro en el Hub. El dataset asociado se identifica como `jogarulfop/2026-09-02_shake4it_bench_5sensors_v2_dragonfly_10kHz_nfft_512`, lo que sugiere que los datos provienen de un banco de pruebas con cinco sensores y una frecuencia de muestreo de 10 kHz, con un preprocesado espectral (nfft de 512). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento como RLHF o DPO, ya que no se mencionan en la documentación disponible.

## Capacidades

- Control robótico por imitación: el modelo predice secuencias de acciones (chunks) para ejecutar una tarea de manipulación específica.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- Inferencia en tiempo real: al ser un modelo de tamaño moderado, puede ejecutarse en GPUs de consumo para control en bucle cerrado.
- Especialización en la tarea "shake4it": diseñado para un banco de pruebas con cinco sensores y una frecuencia de muestreo alta (10 kHz), lo que sugiere que maneja señales de alta frecuencia.
- No es un modelo de lenguaje ni multimodal: no soporta generación de texto, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Automatización de tareas de manipulación repetitivas: el modelo puede ejecutar la tarea "shake4it" de forma autónoma, sustituyendo la teleoperación manual en entornos de laboratorio o producción.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto de la frecuencia de muestreo y el preprocesado espectral en el rendimiento de políticas ACT.
- Desarrollo de robots colaborativos: puede integrarse en un robot SO-100 (u otro compatible con LeRobot) para realizar tareas de agitación o mezcla en entornos controlados.
- Benchmarking de políticas robóticas: al estar publicado en el Hub, permite comparar su rendimiento con otras políticas entrenadas sobre el mismo dataset o similares.
- Educación en robótica: útil para demostrar el flujo completo de LeRobot, desde la recopilación de datos hasta el despliegue, en cursos de robótica o aprendizaje automático.
- Prototipado rápido de controladores: al ser un modelo pequeño, puede desplegarse en hardware embebido o en GPUs de baja gama para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de éxito en tareas, métricas de precisión ni comparaciones con otros modelos en la model card ni en la página de Hugging Face.

## Requisitos de hardware

- VRAM estimada: con 51,7 millones de parámetros, el modelo en FP32 ocupa aproximadamente 207 MB. En cuantización FP16 serían unos 103 MB, y en int8 unos 52 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, por ejemplo NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, o superiores. También puede ejecutarse en CPU para inferencia no en tiempo real.
- Compatibilidad con consumer GPU: sí, es perfectamente viable en GPUs de consumo.
- Opciones de despliegue: LeRobot ofrece scripts de evaluación e inferencia (`lerobot-record`). También puede cargarse con la librería LeRobot en Python. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño, se espera una latencia de pocos milisegundos en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. ACT es un método conocido en robótica, y existen alternativas como Diffusion Policy o Behavior Transformers, pero no hay datos públicos de este modelo concreto frente a ellos. Se recomienda consultar la literatura de LeRobot para comparaciones generales.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una tarea y un robot concretos; no es generalizable a otras tareas sin reentrenamiento.
- Sin datos de rendimiento: no hay métricas publicadas, por lo que se desconoce su tasa de éxito real en el entorno objetivo.
- Dependencia del dataset: la calidad de la política depende directamente de la calidad y diversidad de los datos teleoperados.
- Sin soporte de lenguaje: no puede procesar instrucciones en lenguaje natural ni interactuar con usuarios.
- Licencia Apache-2.0: permite uso comercial y modificación, pero el usuario debe asegurarse de cumplir con los términos de la licencia y de atribuir correctamente.
- Posibles sesgos en los datos: si los datos de entrenamiento contienen sesgos (por ejemplo, variaciones en la iluminación o en la posición del robot), el modelo puede fallar en condiciones no vistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jogarulfop/policy_2026-09-02_shake4it_bench_5sensors_v2_dragonfly_10kHz_nfft_512
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
