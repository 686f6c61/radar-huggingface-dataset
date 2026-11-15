# Haku-2004/act_k6e_input_10

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora las tasas de éxito en tareas de manipulación. Este repositorio concreto, `Haku-2004/act_k6e_input_10`, es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/k6_4seg` y publicada en Hugging Face con licencia Apache 2.0.

El modelo tiene 51.671.174 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB en formato safetensors. Está etiquetado con el pipeline `robotics` y la librería `lerobot`, lo que indica que su uso previsto es la inferencia sobre un robot físico (por ejemplo, un SO-100 follower) mediante el stack de LeRobot, no la generación de texto ni tareas de propósito general.

Su relevancia es acotada pero práctica: sirve como checkpoint de referencia para reproducir o evaluar una política de imitación entrenada sobre un conjunto de datos concreto de teleoperación. No hay información publicada sobre idiomas, benchmarks ni composición detallada del dataset de entrenamiento más allá de su identificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.671.174 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de robótica; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, genera un chunk de acciones futuras. Esta formulación reduce el horizonte efectivo de decisión y mitiga el problema de acumulación de errores típico de las políticas paso a paso. La arquitectura combina un codificador de observaciones (incluyendo imágenes de cámara) con un decodificador que emite secuencias de acciones, y se entrena de forma supervisada sobre demostraciones de teleoperación.

En este caso concreto, el entrenamiento se ha realizado con LeRobot sobre el dataset `Haku-2004/k6_4seg`. No se dispone de información sobre el número de episodios, el número de tokens o frames, la composición exacta del dataset, ni sobre si se aplicaron técnicas de aumento de datos o regularización adicionales. Tampoco hay datos sobre RLHF, DPO ni otras fases de ajuste; ACT es un método puramente de imitación supervisada.

## Capacidades

- Predicción de chunks de acciones para control robótico de manipulación.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Procesamiento de observaciones visuales y de estado del robot (según la configuración de la política ACT en LeRobot).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación e inferencia.
- Ejecución sobre robots compatibles con LeRobot, como el SO-100 follower.
- No soporta generación de texto, tool calling, agentes conversacionales ni capacidades multilingües.

## Casos de uso

- Manipulación robótica de laboratorio: la política puede ejecutar tareas de pick-and-place aprendidas del dataset `k6_4seg` sobre un robot SO-100, usando `lerobot-record` para evaluar el éxito en episodios reales.
- Reproducción de experimentos de imitación: sirve como checkpoint de referencia para comparar variantes de ACT entrenadas con distintos datasets o hiperparámetros dentro de LeRobot.
- Evaluación de pipelines de teleoperación: permite validar de extremo a extremo el flujo de grabación de datos, entrenamiento y despliegue en un robot físico.
- Prototipado de políticas de imitación: al ser un modelo pequeño (51,7 M de parámetros) y ligero (0,2 GB), se puede cargar y ejecutar en estaciones de trabajo con GPU de consumo para pruebas rápidas.
- Docencia y formación en robótica: útil para ilustrar el ciclo completo de aprendizaje por imitación con LeRobot en cursos o talleres.
- Base para fine-tuning: puede servir como punto de partida para reentrenar sobre nuevos datasets de tareas similares, aunque no hay evidencia publicada de su transferibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (51,7 M de parámetros, 0,2 GB en safetensors), la huella en memoria es muy reducida y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; el README de LeRobot sugiere `--policy.device=cuda`.
- Cabe en GPU de consumo: sí, previsiblemente en modelos como RTX 3060, RTX 4060, RTX 4090, entre otras, aunque no hay cifras oficiales de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`) con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k6e_input_10 | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Otros checkpoints ACT en LeRobot Hub | variable | no disponible | no disponible | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable | no disponible | no disponible | variable | Hugging Face |
| Políticas VQ-BeT (LeRobot) | variable | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre un dataset específico (`Haku-2004/k6_4seg`); su comportamiento fuera de esa distribución de tareas y entornos no está validado.
- No hay información publicada sobre sesgos, tasas de éxito ni robustness ante variaciones de iluminación, posición de objetos o cambios en el robot.
- Riesgo de fallo por sobreajuste al entorno de teleoperación original; no se documentan evaluaciones en entornos distintos.
- No es un modelo de lenguaje: no soporta idiomas, generación de texto ni razonamiento simbólico.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia comunitaria de su calidad o reproducibilidad.
- No se documentan requisitos de hardware oficiales ni métricas de latencia.

## Enlaces

- [Hugging Face: Haku-2004/act_k6e_input_10](https://huggingface.co/Haku-2004/act_k6e_input_10)
- [Paper ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [LeRobot (GitHub)](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de políticas en LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Dataset Haku-2004/k6_4seg](https://huggingface.co/datasets/Haku-2004/k6_4seg)
