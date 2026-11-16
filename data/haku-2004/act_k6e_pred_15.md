# Haku-2004/act_k6e_pred_15

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado en tareas de manipulación de horizonte largo. Este checkpoint concreto, `Haku-2004/act_k6e_pred_15`, ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para robótica, sobre el dataset `Haku-2004/k6_4seg`, y está pensado para su despliegue en robots tipo SO-100 (el ejemplo de evaluación de la model card usa `so100_follower`).

El modelo es una política visuomotora con 51.672.714 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de modelos ligeros que pueden ejecutarse en tiempo real en hardware de consumo. No es un modelo de lenguaje: no procesa ni genera texto, sino que mapea observaciones (imágenes de cámara y estado de las articulaciones) a comandos de acción para un brazo robótico.

Es relevante porque ejemplifica el flujo actual de robótica de código abierto: entrenamiento reproducible con LeRobot, pesos en safetensors, licencia Apache 2.0 y evaluación directa sobre un robot físico con `lerobot-record`. Para quien investiga imitación en manipulación, sirve como referencia de una política ACT entrenada sobre un dataset propio y como punto de partida para fine-tuning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con chunking |
| Parametros totales | 51.672.714 (~51,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Dataset de entrenamiento | Haku-2004/k6_4seg |
| Tamano del repositorio | 0,2 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, predice un chunk de acciones futuras. Esta formulación reduce el horizonte efectivo de decisión y mitiga el problema de error de composición (compounding error) típico de las políticas que predicen paso a paso. La arquitectura combina un codificador visual (típicamente ResNet preentrenado) que procesa las imágenes de las cámaras, un codificador del estado de las articulaciones y un decodificador transformer que genera el chunk de acciones. El paper original (arXiv:2304.13705) reporta tasas de éxito altas en tareas de manipulación fina con datos de teleoperación.

En este checkpoint no se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset `Haku-2004/k6_4seg` ni si se aplicaron técnicas de regularización adicionales. La model card solo indica que se entrenó con LeRobot usando `--policy.type=act` y el dataset citado. No hay información publicada sobre aumentos de datos, número de episodios de teleoperación ni hiperparámetros concretos.

## Capacidades

- Control robótico visuomotor: mapea observaciones de cámara y estado de articulaciones a comandos de acción para un brazo manipulador.
- Predicción de chunks de acción: genera secuencias cortas de acciones, lo que mejora la estabilidad en tareas de manipulación de horizonte medio.
- Aprendizaje por imitación: entrenado a partir de datos de teleoperación, sin necesidad de recompensas explícitas ni RL.
- Integración con LeRobot: compatible con el pipeline `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- Despliegue en robots SO-100: la model card incluye un ejemplo de evaluación con `so100_follower`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni capacidades multilingües; es una política específica de control.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo puede ejecutar tareas de pick-and-place o ensamblaje aprendidas del dataset `k6_4seg`, adecuado para experimentos de imitación con un brazo SO-100 y cámaras de bajo coste.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, cambios en el dataset o técnicas de regularización, gracias a su tamaño reducido y a la integración con LeRobot.
- Prototipado rápido de políticas visuomotoras: con 51,7 M de parámetros y 0,2 GB de pesos, se puede entrenar y evaluar en una GPU de consumo en horas, lo que acelera iteraciones de diseño.
- Fine-tuning sobre datos propios: al estar en safetensors y Apache 2.0, se puede reentrenar con `lerobot-train` sobre un dataset nuevo para adaptar la política a otra tarea o robot.
- Evaluación de robustez en entornos controlados: útil para medir la degradación de la política ante cambios de iluminación, posición de objetos o ruido en las observaciones.
- Educación y docencia en robótica: ejemplo completo de pipeline de entrenamiento y despliegue con LeRobot, adecuado para cursos prácticos de aprendizaje por imitación.
- Benchmarking de hardware: permite medir latencia de inferencia y throughput en distintas GPUs con una política de tamaño conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros, ~0,2 GB de pesos); con overhead de activaciones y codificador visual, típicamente 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobradas para inferencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia de baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerá de la GPU, del número de cámaras y del tamaño del chunk de acciones configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k6e_pred_15 | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no disponible | no aplica | tasas de éxito altas en manipulación (paper) | código abierto (ver repo) | Paper + código |
| Diffusion Policy | no disponible | no aplica | no disponible en esta ficha | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre un dataset concreto (`k6_4seg`), la política puede sobreajustarse a las condiciones de iluminación, posiciones de cámara y objetos de ese dataset, y fallar en entornos distintos.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras cuando la observación se sale de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no procesa texto ni lenguaje; no tiene capacidades multilingües.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el usuario debe verificar las licencias de las dependencias (LeRobot, PyTorch) y del dataset de entrenamiento.
- Caveats para producción: no hay información publicada sobre robustez, seguridad física ni validación en entornos reales más allá del ejemplo de evaluación; se recomienda validar exhaustivamente antes de desplegar en un robot real.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_k6e_pred_15
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
