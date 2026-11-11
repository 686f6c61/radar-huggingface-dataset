# KyraLeeChunWei/Acetylcysteine_e200_ACT_20K

## Resumen

Acetylcysteine_e200_ACT_20K es una política de imitación (policy) para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo lo ha subido el usuario KyraLeeChunWei a Hugging Face mediante la librería LeRobot de Hugging Face, que es el framework estándar para entrenar y desplegar políticas de aprendizaje por imitación sobre robots de bajo coste como el SO-100. El identificador sugiere un entrenamiento de 200 épocas (e200) sobre un dataset denominado e150_Acetylcysteine con 20.000 pasos o muestras (20K), aunque estos detalles no están confirmados en la model card.

ACT predice trozos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición y mejora la estabilidad en tareas de manipulación. El modelo aprende de datos de teleoperación y suele alcanzar tasas de éxito altas en tareas de pick-and-place y manipulación fina con un único brazo. Es relevante para desarrolladores que quieran replicar experimentos de robótica de imitación con hardware asequible y un pipeline reproducible en LeRobot.

El repositorio tiene 51.678.855 parámetros (unos 51,7 M) en formato safetensors, ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0. No tiene descargas ni likes en el momento de la consulta, y no se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento más allá de su nombre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.678.855 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión original) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que, en cada paso de inferencia, recibe observaciones (imágenes de cámaras y estado de las articulaciones) y predice un chunk de acciones futuras de longitud fija. La arquitectura combina un backbone visual (típicamente ResNet) para extraer características de las imágenes, un codificador de estado de las articulaciones y un decodificador transformer que genera la secuencia de acciones. El paper original introduce una pérdida de reconstrucción tipo VAE con una variable latente de estilo (CVAE) para modelar la multimodalidad de las demostraciones humanas, lo que ayuda a evitar el promediado de acciones inconsistentes.

No se dispone de información sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; en robótica de imitación no se usan habitualmente. El nombre del dataset asociado (KyraLeeChunWei/e150_Acetylcysteine) sugiere datos de teleoperación recogidos con un robot SO-100 o similar, pero no se detalla el número de episodios, la tarea concreta ni la configuración de cámaras. El entrenamiento se ha realizado con `lerobot-train` usando `--policy.type=act` y dispositivo CUDA, según la model card.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (action chunks) para manipulación con un brazo robótico.
- Procesamiento multimodal de observaciones: integra imágenes de cámaras y estado de articulaciones como entrada.
- Ejecución de tareas de pick-and-place y manipulación fina aprendidas de demostraciones teleoperadas.
- Inferencia en tiempo real sobre hardware de consumo mediante LeRobot.
- Evaluación reproducible con `lerobot-record` sobre robots SO-100 follower.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- Sin capacidades multilingües, de visión general, audio ni thinking mode.

## Casos de uso

- Manipulación de laboratorio reproducible: el modelo sirve como política de referencia para replicar experimentos de ACT en un robot SO-100, permitiendo comparar tasas de éxito con otras políticas de LeRobot sobre el mismo dataset.
- Automatización de pick-and-place en entornos controlados: con 51,7 M de parámetros y observaciones visuales, puede ejecutar tareas de recogida y colocación de objetos en una mesa de trabajo tras un entrenamiento específico.
- Investigación en aprendizaje por imitación: útil para estudiar el efecto del número de épocas (el nombre sugiere 200) y del tamaño del dataset (20K pasos) en la estabilidad de la política.
- Prototipado rápido en robótica de bajo coste: al caber en 0,2 GB y ejecutarse con LeRobot en una GPU de consumo, permite iterar sobre datos de teleoperación sin infraestructura de datacenter.
- Docencia y formación: ejemplo completo de pipeline LeRobot (entrenamiento, evaluación, registro de episodios) para cursos de robótica y aprendizaje automático.
- Benchmark interno de políticas: punto de partida para comparar ACT con otras políticas disponibles en LeRobot (Diffusion Policy, TDMPC, etc.) sobre el mismo robot y dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 51,7 M de parámetros; en la práctica, el consumo lo domina el backbone visual y el buffer de imágenes, estimado en 1-2 GB.
- GPU recomendadas: cualquier GPU con CUDA y al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más de VRAM; también es viable en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles; dependen del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Acetylcysteine_e200_ACT_20K | 51,7 M | no aplica | no publicado | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | ~80 M (configuración típica) | no aplica | tasas de éxito altas en tareas de manipulación | MIT (código de referencia) | GitHub, LeRobot |
| Diffusion Policy | variable según configuración | no aplica | competitivo en manipulación visomotora | MIT | LeRobot, GitHub |
| TDMPC2 | variable según configuración | no aplica | competitivo en control continuo | MIT | LeRobot, GitHub |

La comparación con ACT original, Diffusion Policy y TDMPC2 se basa en la categoría (políticas de imitación en LeRobot); no hay datos de rendimiento específicos de este checkpoint para comparar numéricamente.

## Limitaciones y advertencias

- Sin datos publicados de benchmarks: no se puede verificar la tasa de éxito ni la generalización del checkpoint.
- El nombre del modelo sugiere un entrenamiento específico (e200, 20K) que no está documentado; el dataset asociado no describe la tarea ni la configuración del robot.
- Riesgo de sobreajuste al dataset de teleoperación: ACT es sensible a la distribución de demostraciones y puede fallar ante cambios de iluminación, posición de objetos o del robot.
- Sin capacidades lingüísticas ni de razonamiento general: no debe usarse como modelo de lenguaje ni para tareas fuera del control robótico.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- Sin información sobre sesgos: en robótica, los sesgos provienen de los datos de teleoperación (posiciones, objetos, entornos) y pueden limitar la generalización.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/KyraLeeChunWei/Acetylcysteine_e200_ACT_20K
- Dataset asociado: https://huggingface.co/datasets/KyraLeeChunWei/e150_Acetylcysteine
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
