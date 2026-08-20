# jaeikkim/fr3-cube-full10k-diffusion-policy

## Resumen

`jaeikkim/fr3-cube-full10k-diffusion-policy` es un modelo de política visuomotora basado en diffusion policy para manipulación robótica, desarrollado por jaeikkim y publicado en HuggingFace bajo el ecosistema LeRobot. El modelo está diseñado para controlar un brazo robótico Franka FR3 en tareas de manipulación de cubos, entrenado mediante aprendizaje por imitación con 10.000 demostraciones generadas sintéticamente con MimicGen y el simulador Isaac Lab.

La relevancia de este modelo radica en que aplica el paradigma de diffusion policy —introducido en RSS 2023 por el grupo de Stanford— a un escenario de simulación con datos sintéticos a escala, lo que permite evaluar la viabilidad de entrenar políticas robustas sin necesidad de recopilación manual de demostraciones. El repositorio ocupa 18,4 GB en formato safetensors y su acceso está restringido (gated), por lo que requiere aceptar condiciones de uso en HuggingFace antes de poder descargarlo.

Al tratarse de un modelo de robótica, no es un LLM: no genera texto ni código, sino secuencias de acciones (posiciones articulares o poses del efector final) condicionadas a observaciones visuales y de estado. Su pipeline declarado es `robotics` y su librería de referencia es `lerobot`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (UNet 1D con denoising por difusión) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de observación y horizonte de acción no publicados) |
| Tipos de cuantizacion | no disponible (pesos en precisión nativa, probablemente FP32/FP16) |
| Idiomas soportados | no disponible (no aplica: modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tamaño del repositorio | 18,4 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de diffusion policy propuesto por Cheng et al. (RSS 2023): un modelo generativo que aprende a denoizar secuencias de acciones a partir de ruido gaussiano, condicionado por observaciones visuales (imágenes RGB) y, posiblemente, por el estado del robot (posiciones articulares). El proceso de inferencia consiste en una cadena de denoising iterativa que produce un horizonte de acciones que luego se ejecuta de forma reactiva con re-planificación.

El entrenamiento se realizó con el framework LeRobot de HuggingFace, utilizando un conjunto de 10.000 demostraciones del dataset `jaeikkim/fr3-cube-mimicgen-10k`, generadas sintéticamente con MimicGen sobre el simulador Isaac Lab. Esto implica que los datos provienen de un pipeline de generación automática de demostraciones, no de teleoperación humana. No se dispone de información sobre el número de parámetros, la composición exacta del dataset (variaciones de pose, texturas, etc.) ni si se aplicaron técnicas de aumento de datos adicionales.

## Capacidades

- Control visuomotor: genera secuencias de acciones articulares para el brazo Franka FR3 a partir de observaciones RGB y de estado.
- Aprendizaje por imitación: reproduce comportamientos demostrados en el dataset de entrenamiento, incluyendo tareas de agarre, levantamiento y reubicación de cubos.
- Re-planificación reactiva: al ser una diffusion policy, puede re-ejecutar el proceso de denoising en cada paso de control, lo que proporciona cierta robustez frente a perturbaciones.
- Integración con LeRobot: compatible con el ecosistema de HuggingFace para robótica, incluyendo evaluación y despliegue en simuladores y robots reales.
- Entrenamiento con datos sintéticos: demuestra la viabilidad de usar demostraciones generadas por MimicGen en lugar de teleoperación manual.

## Casos de uso

- Evaluación de diffusion policies en simulación: el modelo permite reproducir experimentos de manipulación de cubos en Isaac Lab y comparar el rendimiento de diffusion policy frente a otras arquitecturas (ACT, VQ-BeT, etc.) usando el benchmark de LeRobot.
- Investigación en aprendizaje por imitación con datos sintéticos: sirve como punto de partida para estudiar cómo afecta la calidad y diversidad de las demostraciones generadas por MimicGen al rendimiento final de la política.
- Transferencia sim-to-real: aunque no hay evidencia publicada de despliegue en el robot real, el modelo puede usarse como baseline para experimentos de transferencia del simulador al Franka FR3 físico.
- Desarrollo de pipelines de generación de datos: el repositorio, junto con el dataset asociado, documenta un flujo completo de generación de demostraciones sintéticas con Isaac Lab y MimicGen, útil para quienes quieran replicar el proceso con otras tareas.
- Benchmarking de frameworks de robótica: permite comparar LeRobot con otros frameworks de entrenamiento de políticas visuomotoras en términos de facilidad de uso, estabilidad del entrenamiento y rendimiento.
- Reproducibilidad de experimentos: al estar publicado con pesos en safetensors y acceso gated, puede usarse para reproducir resultados de manipulación de cubos en entornos controlados de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de éxito en tareas de manipulación, tasas de agarre ni comparativas con otros modelos en el repositorio ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (18,4 GB) sugiere que los pesos completos ocupan varios gigabytes, pero el consumo real de VRAM depende del tamaño del batch, la resolución de las imágenes y el número de pasos de denoising.
- GPU recomendadas: no disponible. Para diffusion policies con observación visual, una GPU con al menos 8-12 GB de VRAM (RTX 3080/4080 o superior) sería un punto de partida razonable, pero no hay datos confirmados.
- Compatibilidad con GPU de consumo: probablemente sí, dado que LeRobot está diseñado para funcionar en hardware asequible, pero no hay confirmación oficial.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación y despliegue; también es posible exportar a formatos compatibles con otros runners, aunque no hay documentación específica en el repositorio.
- Latencia y throughput: no disponible. La latencia de inferencia de una diffusion policy depende críticamente del número de pasos de denoising (típicamente entre 4 y 100) y de la resolución de las imágenes de entrada.

## Comparativa con modelos similares

| Modelo | Tarea | Libreria | Datos | Acceso | Licencia |
|---|---|---|---|---|---|
| jaeikkim/fr3-cube-full10k-diffusion-policy | Manipulación de cubos (Franka FR3) | LeRobot | 10k demostraciones MimicGen | Gated | no disponible |
| jaeikkim/fr3-cube-rgb-native320 | Manipulación de cubos (Franka FR3) | LeRobot | no disponible | Público | other |
| diffusion_policy (real-stanford) | Manipulación variada (sim y real) | PyTorch propio | Demostraciones teleoperadas | Público | MIT (código) |

La comparativa se limita a modelos del mismo autor y al repositorio de referencia de diffusion policy. No hay datos de rendimiento publicados que permitan una comparación cuantitativa. El modelo de `real-stanford` es el original de la publicación RSS 2023 y usa datos teleoperados, mientras que este modelo usa datos sintéticos de MimicGen, lo que constituye la diferencia metodológica principal.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que requiere aceptar condiciones en HuggingFace. Esto puede limitar su uso en entornos corporativos con políticas de revisión de licencias.
- Licencia no especificada: al no declararse licencia, el uso comercial conlleva incertidumbre legal. Se recomienda contactar al autor antes de cualquier uso productivo.
- Datos sintéticos: el entrenamiento se realizó íntegramente con demostraciones generadas por MimicGen en Isaac Lab. Esto puede introducir un sesgo de simulación que degrade el rendimiento en el robot real (sim-to-real gap).
- Sin benchmarks publicados: no hay métricas de éxito ni comparativas, por lo que no se puede verificar la calidad del modelo antes de descargarlo.
- Tarea específica: el modelo está entrenado para una tarea concreta (manipulación de cubos) y no es generalizable a otras tareas sin reentrenamiento.
- Sin información sobre el proceso de entrenamiento: se desconocen hiperparámetros, número de pasos de denoising, resolución de imagen y configuración exacta del UNet, lo que dificulta la reproducción y el ajuste fino.
- Riesgo de sobreajuste al dataset: con 10.000 demostraciones sintéticas de una sola tarea, existe riesgo de que la política memorice las trayectorias en lugar de generalizar a nuevas configuraciones del cubo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaeikkim/fr3-cube-full10k-diffusion-policy
- Dataset asociado (fr3-cube-mimicgen-10k): https://huggingface.co/datasets/jaeikkim/fr3-cube-mimicgen-10k
- Modelo relacionado (fr3-cube-rgb-native320): https://huggingface.co/jaeikkim/fr3-cube-rgb-native320
- Repositorio de diffusion policy (real-stanford): https://github.com/real-stanford/diffusion_policy
