# Haku-2004/act_k3_base_20_old2

## Resumen

`act_k3_base_20_old2` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice trozos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario Haku-2004 en Hugging Face y se ha entrenado y subido mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El problema que resuelve es el control de un robot a partir de datos de teleoperación: aprende a mapear observaciones (típicamente imágenes de cámara y estado de las articulaciones) a secuencias de acciones motoras.

La relevancia de este checkpoint es acotada: se trata de un artefacto de entrenamiento concreto (el sufijo `k3_base_20_old2` sugiere una variante experimental o una versión antigua de un entrenamiento) vinculado a un dataset específico del propio autor, `Haku-2004/LeRobot_dataset_k_3_20261027_143829`. No es un modelo de propósito general ni un modelo de lenguaje: es una política robótica de aproximadamente 51,7 millones de parámetros, publicada bajo licencia Apache 2.0 y con cero descargas y cero likes en el momento de la consulta, lo que indica que no ha pasado por ninguna validación comunitaria.

La arquitectura subyacente, ACT, se describe en el paper arXiv:2304.13705 y combina un codificador visual, un transformer y un decodificador que emite chunks de acciones. El contexto, los idiomas y los benchmarks no están disponibles en la información publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | LeRobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/LeRobot_dataset_k_3_20261027_143829 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación supervisado que entrena un transformer para predecir secuencias de acciones (chunks) a partir de observaciones. La formulación original incluye un codificador de imágenes, un codificador de estado propioceptivo y un decodificador transformer que genera un horizonte fijo de acciones, lo que reduce el error de acumulación típico de las políticas que predicen un solo paso. El paper también propone una técnica de agregación temporal (temporal ensembling) para suavizar las predicciones en tiempo de ejecución.

En este checkpoint concreto no se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el número de episodios de teleoperación, la configuración de aumentos de datos ni si se aplicaron técnicas de regularización específicas. El nombre del dataset asociado (`LeRobot_dataset_k_3_20261027_143829`) sugiere una captura fechada el 27 de octubre de 2026, pero no se detalla su contenido. Tampoco hay información sobre la plataforma robótica utilizada, aunque el ejemplo de la model card emplea un `so100_follower`, lo que apunta a un brazo robótico de bajo coste de la familia SO-100.

## Capacidades

- Control robótico por imitación: genera chunks de acciones motoras a partir de observaciones visuales y propioceptivas.
- Aprendizaje a partir de teleoperación: entrenado con el dataset LeRobot indicado en la model card.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- Ejecución en hardware de consumo: el tamaño de 51,7 millones de parámetros permite inferencia en GPU modesta.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, matemáticas, visión general, audio ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Manipulación robótica de laboratorio: usar la política para reproducir tareas de pick-and-place aprendidas de demostraciones humanas, con evaluación mediante `lerobot-record` sobre un SO-100.
- Investigación en aprendizaje por imitación: servir como checkpoint de referencia para comparar variantes de ACT (por ejemplo, `k3_base_20_old2` frente a otras versiones del mismo autor) y medir tasas de éxito.
- Prototipado rápido de políticas: al ocupar solo 0,2 GB y tener 51,7 millones de parámetros, se puede cargar y ejecutar en una estación de trabajo con GPU de gama media para iterar sobre el dataset.
- Reproducción de experimentos: el par modelo-dataset publicado permite replicar el entrenamiento con `lerobot-train` y verificar la curva de aprendizaje.
- Docencia y formación: ejemplo práctico de un pipeline completo de LeRobot, desde la teleoperación hasta la evaluación de la política.
- Base para fine-tuning: punto de partida para reentrenar sobre un dataset propio de otra tarea de manipulación con la misma morfología de robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 millones de parámetros en fp32 ocupan unos 207 MB); el repositorio completo pesa 0,2 GB.
- GPU recomendadas: cualquier GPU con CUDA, incluidas GTX 1060, RTX 2060, RTX 3060, RTX 4090; también es viable en CPU para inferencia de baja frecuencia.
- Cabe en GPU de consumo: sí, con margen amplio, incluso en modelos con 4 GB de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de dispositivo CUDA o CPU mediante `--policy.device`.
- Latencia y throughput: no disponibles; dependen de la frecuencia de control del robot y del hardware empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k3_base_20_old2 | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| ACT original (paper 2304.13705) | no disponible | no disponible | tasas de éxito reportadas en el paper, no comparables directamente | no disponible | Paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy, TDMPC) | variable | no disponible | no disponible | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento de este checkpoint que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo específico de una tarea y un robot: la política está entrenada sobre un dataset concreto y probablemente no generaliza a otras morfologías, cámaras o entornos sin reentrenamiento.
- Sin validación comunitaria: cero descargas y cero likes; no hay evidencia externa de su tasa de éxito.
- Sesgos de los datos de teleoperación: hereda las condiciones de iluminación, posiciones de cámara y sesgos del operador humano que generó las demostraciones.
- Riesgo de fallo en producción: las políticas de imitación pueden degradarse ante cambios de distribución (objetos nuevos, fondos distintos) y producir acciones erráticas.
- Idiomas y contexto: no aplica, al no ser un modelo de lenguaje; no debe evaluarse con métricas de NLP.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Nombre del checkpoint (`old2`): sugiere una versión obsoleta o descartada dentro del flujo de trabajo del autor; conviene verificar si existe una versión más reciente antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k3_base_20_old2
- Dataset asociado: https://huggingface.co/datasets/Haku-2004/LeRobot_dataset_k_3_20261027_143829
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
