# Haku-2004/act_k6_input_10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, reduciendo el error de acumulación típico de las políticas paso a paso. Este repositorio concreto, `Haku-2004/act_k6_input_10`, es un checkpoint de política ACT entrenado con LeRobot sobre el dataset `Haku-2004/k6_4seg`, orientado a control robótico mediante teleoperación.

El modelo tiene 51.671.174 parámetros (unos 51,7 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero para despliegue en hardware modesto. Está publicado bajo licencia Apache 2.0 y su pipeline es `robotics`, no generación de texto: no es un modelo de lenguaje ni un VLM, sino una política de control que mapea observaciones (típicamente imágenes de cámara y estado de las articulaciones) a comandos de actuadores.

Su relevancia es práctica para quien trabaja con brazos robóticos de bajo coste tipo SO-100/SO-101 dentro del ecosistema LeRobot: permite reproducir el entrenamiento, evaluar la política y desplegarla con las herramientas estándar de Hugging Face. No obstante, es un checkpoint de autor individual con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación más allá de la plantilla estándar de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.671.174 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de entrenamiento, no documentada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/k6_4seg |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT combina un backbone de vision (encoder tipo ResNet, según el paper original de Zhao et al., 2023) que procesa las imágenes de las cámaras, con un transformer encoder-decoder que fusiona las observaciones con el estado de las articulaciones y genera un chunk de acciones futuras. La innovación central del método es predecir varios pasos de acción de golpe y agregarlos temporalmente, lo que suaviza la trayectoria y reduce el error compuesto que aparece cuando cada paso se predice de forma independiente. El paper asociado (arXiv:2304.13705) describe además el uso de una CVAE en el entrenamiento para modelar la variabilidad de las demostraciones humanas.

En este checkpoint concreto no se documentan el número de tokens de entrenamiento, la composición del dataset `Haku-2004/k6_4seg` (número de episodios, tareas, cámaras o frecuencia de control), ni si se aplicaron técnicas adicionales como data augmentation o ajuste de hiperparámetros más allá de los valores por defecto de LeRobot. La model card es la plantilla automática generada por LeRobot y no incluye detalles del proceso de entrenamiento.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (action chunks) para un robot manipulador a partir de observaciones visuales y de estado.
- Aprendizaje a partir de teleoperación: reproduce comportamientos demostrados en el dataset `Haku-2004/k6_4seg`.
- Inferencia en tiempo real con LeRobot mediante `lerobot-record` y `--policy.path`.
- Integración con el ecosistema Hugging Face Hub para versionado y descarga de checkpoints.
- No soporta generación de texto, razonamiento lingüístico, código, matemáticas, visión general, tool calling ni agentes conversacionales.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio, etc.).

## Casos de uso

- Manipulación robótica de laboratorio: desplegar la política en un brazo SO-100 follower para reproducir la tarea de recogida y colocación aprendida del dataset `k6_4seg`, usando `lerobot-record` con `--policy.path` apuntando a este checkpoint.
- Reproducción de experimentos de investigación: servir como punto de partida para comparar variantes de ACT (distintos tamaños de chunk, configuraciones de cámara) sobre el mismo dataset y medir tasas de éxito.
- Evaluación comparativa de políticas: usar el checkpoint como baseline en un pipeline de evaluación automatizada con episodios controlados (`--episodes=10`) y registro de métricas de éxito.
- Fine-tuning sobre nuevas tareas: reentrenar desde este checkpoint con `lerobot-train` sobre un dataset propio de teleoperación para adaptar la política a un objeto o entorno distinto.
- Prototipado en robótica de bajo coste: al ocupar 0,2 GB y 51,7 M de parámetros, cabe en GPUs de consumo y permite iterar rápido en entornos docentes o de hobby.
- Docencia y formación: ilustrar el flujo completo de LeRobot (entrenamiento, evaluación y despliegue) con un modelo ligero y de licencia permisiva.
- Validación de infraestructura: probar pipelines de CI para políticas robóticas (carga de safetensors, inferencia en CUDA/CPU) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100); también es viable en CPU para pruebas, aunque la latencia de control puede ser insuficiente para tiempo real.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 20xx en adelante) e incluso en iGPU con suficiente memoria compartida para pruebas no críticas.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`), con soporte de PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; dependen del hardware, del número de cámaras y de la frecuencia de control del robot, no documentados en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k6_input_10 | 51,7 M | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face Hub (0 descargas) |
| ACT original (Zhao et al., 2023) | no disponible en la informacion | no disponible | resultados en el paper arXiv:2304.13705 | código de referencia publicado por los autores | paper y repositorio oficial |
| Políticas Diffusion Policy (referencia del ecosistema LeRobot) | no disponible en la informacion | no disponible | sin datos en la informacion proporcionada | no disponible | integradas en LeRobot |
| Políticas VLA tipo pi0 (referencia del ecosistema LeRobot) | no disponible en la informacion | no disponible | sin datos en la informacion proporcionada | no disponible | integradas en LeRobot |

La comparación cuantitativa con alternativas no es posible con la información disponible: no hay métricas de éxito ni de error de trayectoria publicadas para este checkpoint.

## Limitaciones y advertencias

- Especialización extrema: la política solo es válida para la tarea, el robot y la configuración de cámaras del dataset `Haku-2004/k6_4seg`; fuera de ese dominio su comportamiento es impredecible.
- Sin benchmarks ni métricas de éxito publicadas: no hay evidencia objetiva de su rendimiento, lo que desaconseja su uso en producción sin una evaluación propia.
- Dataset no documentado: se desconoce el número de episodios, la calidad de las demostraciones y la frecuencia de control, factores críticos para la robustez.
- Riesgo de sobreajuste a condiciones de iluminación, posiciones iniciales y objetos concretos del entorno de captura.
- Sin información sobre sesgos: no aplica el concepto de sesgo lingüístico, pero sí el de sesgo de distribución (covariate shift) ante cambios en el entorno.
- Licencia Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Repositorio con cero descargas y cero likes: no hay comunidad ni validación externa que respalde el checkpoint.
- No es un modelo de lenguaje: no debe emplearse para tareas de texto, código o razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6_input_10
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
