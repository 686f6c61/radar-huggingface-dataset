# KyraLeeChunWei/Acetylcysteine_e100_ACT_20K

## Resumen

Acetylcysteine_e100_ACT_20K es una política de robótica entrenada con el algoritmo ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario KyraLeeChunWei y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El nombre del repositorio sugiere que se ha entrenado sobre el dataset e100_Acetylcysteine con un presupuesto de 20.000 pasos o muestras.

Se trata de un modelo de tamaño reducido, con 51.678.855 parámetros (aproximadamente 51,7 millones), empaquetado en formato safetensors y con un tamaño de repositorio de 0,2 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas. El pipeline declarado es robótica y la librería asociada es lerobot, lo que implica que su uso previsto gira en torno al control de robots manipuladores en entornos de laboratorio o industriales.

La relevancia de este modelo radica en que ejemplifica el flujo de trabajo estándar de LeRobot para políticas ACT: entrenamiento desde datos de teleoperación y despliegue en robots tipo SO-100 (so100_follower). No obstante, al no contar con descargas ni valoraciones, y al no haberse publicado resultados de benchmarks en la información disponible, debe considerarse una política experimental o de demostración más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.678.855 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura se basa en un transformer que, en lugar de predecir una única acción por paso de tiempo, predice un fragmento de acciones futuras (action chunk), lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. El modelo aprende a partir de datos de teleoperación, es decir, de demostraciones humanas registradas con un robot seguidor.

En este caso concreto, el entrenamiento se ha realizado con LeRobot sobre el dataset KyraLeeChunWei/e100_Acetylcysteine. La información disponible no especifica el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. El sufijo "e100" y "20K" en el nombre del repositorio sugiere 100 épocas o episodios y 20.000 pasos de entrenamiento, pero estos datos no están confirmados en la model card. No se documentan innovaciones técnicas adicionales más allá de las propias de ACT.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (action chunks) para robots manipuladores a partir de observaciones visuales y de estado.
- Aprendizaje a partir de teleoperación: reproduce comportamientos demostrados por un operador humano.
- Predicción de acciones futuras en bloque: reduce la acumulación de errores frente a políticas que predicen un solo paso.
- Integración con LeRobot: entrenamiento, evaluación e inferencia mediante los comandos `lerobot-train` y `lerobot-record`.
- Despliegue en robots SO-100: la model card incluye un ejemplo explícito con `so100_follower`.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento.

## Casos de uso

- Manipulación robótica en laboratorio: la política puede ejecutar tareas de pick-and-place aprendidas de demostraciones humanas, adecuada porque ACT está diseñada para tareas de manipulación de corto horizonte.
- Evaluación de políticas de imitación: sirve como checkpoint de referencia para comparar el rendimiento de otras políticas ACT entrenadas con el mismo dataset, gracias a su integración directa con `lerobot-record`.
- Reproducción de experimentos: al estar publicada con licencia Apache 2.0 y formato safetensors, permite replicar el entrenamiento y validar resultados en entornos controlados.
- Prototipado de flujos de teleoperación: útil para equipos que quieran montar un pipeline completo de grabación, entrenamiento y despliegue con LeRobot y un robot SO-100.
- Docencia y formación: adecuada para cursos de robótica o aprendizaje por imitación por su tamaño reducido (51,7 M de parámetros) y su bajo requisito de hardware.
- Automatización de tareas repetitivas en entornos estructurados: tareas de ensamblaje o clasificación donde las condiciones sean similares a las del dataset de entrenamiento.
- Investigación en action chunking: permite estudiar el efecto del tamaño del chunk y del número de pasos de entrenamiento en la estabilidad de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 M de parámetros en safetensors, la inferencia requiere del orden de 0,2-0,5 GB de VRAM en precisión nativa, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU para inferencia, aunque con mayor latencia.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de checkpoints locales o del Hub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Acetylcysteine_e100_ACT_20K | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Diffusion Policy (alternativa de imitación) | variable | no disponible | no disponible | según implementación | Hugging Face / repos |
| VQ-BeT (alternativa de imitación) | variable | no disponible | no disponible | según implementación | Hugging Face / repos |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparativa se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- Sin datos de benchmarks ni métricas de éxito publicadas: no es posible evaluar su calidad frente a otras políticas.
- Sin descargas ni valoraciones: modelo sin validación por parte de la comunidad.
- Dependencia del dataset: el rendimiento está acotado a las condiciones, objetos y entorno del dataset e100_Acetylcysteine; la generalización fuera de ese dominio es incierta.
- Riesgo de sobreajuste: con 20.000 pasos y un dataset específico, puede memorizar trayectorias y fallar ante variaciones de iluminación, posición u objetos.
- Sesgos desconocidos: no se documentan sesgos, pero al derivar de teleoperación humana puede heredar sesgos del operador.
- Idiomas: no aplica, es un modelo de robótica sin capacidades lingüísticas.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantía ni soporte por parte del autor.
- No apto para producción crítica: sin evaluación independiente ni documentación de seguridad, no debería desplegarse en entornos donde un fallo implique riesgo físico.
- Fecha de creación futura (2026-11-11): la información de la ficha puede corresponder a un artefacto de prueba o a una fecha mal registrada.

## Enlaces

- [Hugging Face: KyraLeeChunWei/Acetylcysteine_e100_ACT_20K](https://huggingface.co/KyraLeeChunWei/Acetylcysteine_e100_ACT_20K)
- [Paper ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de políticas](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Dataset: KyraLeeChunWei/e100_Acetylcysteine](https://huggingface.co/datasets/KyraLeeChunWei/e100_Acetylcysteine)
