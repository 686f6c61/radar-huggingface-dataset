# phawitbinabik/act_COMBILE-DS1_1B1O_FF_rand80

## Resumen

El modelo `phawitbinabik/act_COMBILE-DS1_1B1O_FF_rand80` es una política de aprendizaje por imitación (imitation learning) para control robótico, entrenada con la implementación ACT (Action Chunking with Transformers) de la librería LeRobot de Hugging Face. No se trata de un modelo de lenguaje: su entrada son observaciones visuales (imágenes de cámaras) y el estado de las articulaciones del robot, y su salida es un bloque (chunk) de acciones de control de baja dimensión. Lo publica el usuario `phawitbinabik` junto con el dataset de demostraciones teleoperadas `phawitbinabik/COMBILE-DS1_1B1O_FF_rand80`.

El modelo tiene 51.668.614 parámetros según los pesos en safetensors incluidos en el repositorio, que ocupa 0,2 GB. La arquitectura subyacente, ACT, se describe en el artículo arXiv:2304.13705 y combina un transformer encoder-decoder con un autocodificador variacional condicional (CVAE). La innovación principal del método es predecir secuencias cortas de acciones en lugar de un único paso, lo que reduce el error de composición y permite tasas de éxito altas en tareas de manipulación fina con hardware de bajo coste.

Su relevancia es práctica: se ha entrenado y publicado mediante LeRobot, el stack de Hugging Face para robótica, lo que facilita reproducir el entrenamiento, evaluar la política y desplegarla en robots tipo SO-100/SO-101 con pocos comandos. Es un ejemplo de política entrenada sobre un dataset concreto y con semilla de aleatorización fijada (`rand80`), útil para experimentar con el pipeline de imitación antes de escalar a datasets propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con CVAE (ACT, Action Chunking with Transformers); política de imitación, no es un modelo de lenguaje |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no procesa texto; predice chunks de acciones de control) |
| Tipos de cuantizacion | no disponible (repositorio con pesos safetensors en precisión original; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no aplica: política robótica, sin interfaz de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria / pipeline | lerobot, robotics |
| Dataset de entrenamiento | phawitbinabik/COMBILE-DS1_1B1O_FF_rand80 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que aprende de datos teleoperados. La política combina un transformer encoder-decoder con un CVAE: el encoder procesa las observaciones (imágenes de cámara y estado de las articulaciones) y el decoder genera un chunk de acciones futuras en lugar de un solo paso. El entrenamiento optimiza una pérdida de reconstrucción L1 sobre las acciones del chunk junto con un término de regularización KL sobre el espacio latente del CVAE, lo que permite modelar la multimodalidad de las demostraciones humanas (distintas formas válidas de ejecutar la misma tarea).

Según la model card, la política se ha entrenado y subido al Hub con LeRobot. No se especifican en la información disponible el número de tokens o pasos de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF o DPO (no aplicables en este tipo de política). El sufijo `rand80` del repositorio y del dataset sugiere una configuración con semilla o nivel de aleatorización, pero su significado exacto no está documentado en la información proporcionada. El artículo de referencia (arXiv:2304.13705) describe el método general, no los detalles concretos de este entrenamiento.

## Capacidades

- Predicción de chunks de acciones para control robótico de manipulación a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de demostraciones teleoperadas: reproduce comportamientos demostrados sin necesidad de recompensas explícitas.
- Generación de trayectorias multimodales gracias al componente CVAE, que modela varias estrategias válidas para una misma observación.
- Control de robots de bajo coste tipo SO-100/SO-101, según el flujo de evaluación documentado por LeRobot.
- Integración con el ecosistema LeRobot: `lerobot-train` para entrenamiento y `lerobot-record` para evaluación e inferencia.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido de agentes de lenguaje; internamente predice secuencias de acciones.
- Capacidades multilingües: no aplica.
- Capacidades especiales (thinking mode, visión, audio): procesa entrada visual como parte de la observación; no dispone de modo de razonamiento explícito ni audio.

## Casos de uso

- Manipulación robótica de laboratorio: la política ejecuta tareas de pick-and-place aprendidas de demostraciones humanas, adecuada para prototipos de investigación donde se dispone de un robot SO-100/SO-101 y un dataset teleoperado propio.
- Replicación de experimentos de imitación: sirve como punto de partida reproducible para comparar ACT con otros métodos (por ejemplo, Diffusion Policy) sobre el mismo dataset, aprovechando que el repositorio incluye pesos y referencia al dataset.
- Automatización de tareas repetitivas de ensamblaje: al predecir chunks de acciones, reduce el error de composición en secuencias largas, lo que resulta útil en tareas de inserción o colocación precisa.
- Generación de datos sintéticos de evaluación: ejecutando la política con `lerobot-record` se pueden grabar episodios de evaluación (`eval_<dataset>`) que alimenten análisis posteriores de éxito y fallo.
- Investigación en multimodalidad de demostraciones: el componente CVAE permite estudiar cómo la política cubre distintas variantes de una misma tarea cuando las demostraciones humanas son heterogéneas.
- Base para ajuste fino en un robot concreto: al ser una política pequeña (51,7 M de parámetros), se puede reentrenar o ajustar con presupuestos de cómputo modestos sobre datos propios de una celda de trabajo.
- Despliegue en hardware de bajo coste: el tamaño reducido del modelo permite ejecutar inferencia en GPUs de consumo e incluso, potencialmente, en plataformas embebidas, facilitando la integración en robots económicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni métricas comparativas; únicamente documenta el flujo de entrenamiento y evaluación mediante LeRobot.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51.668.614 parámetros, los pesos ocupan aproximadamente 207 MB en fp32, 103 MB en fp16/bf16 y unos 52 MB en int8 (cifras calculadas a partir del número de parámetros; no publicadas por el autor). Hay que sumar el coste de activaciones y del codificador visual, por lo que el consumo real será mayor.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente; se menciona `--policy.device=cuda` en el flujo de entrenamiento de LeRobot.
- GPU de consumo: el modelo cabe holgadamente en GPUs de consumo tipo RTX 3060/4070/4090 en cuanto a memoria de pesos; el factor limitante suele ser el bucle de control en tiempo real del robot más que la VRAM.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`) para inferencia y evaluación; entrenamiento con `lerobot-train`. No se documentan soportes para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| act_COMBILE-DS1_1B1O_FF_rand80 (este) | 51.668.614 | Chunks de acciones (no texto) | apache-2.0 | Hugging Face Hub (lerobot) | Entrenado sobre COMBILE-DS1_1B1O_FF_rand80 |
| ACT (referencia del método) | no disponible | Chunks de acciones | según implementación | arXiv:2304.13705 | Método original de imitación con transformer + CVAE |
| Diffusion Policy | no disponible | Chunks de acciones | no disponible | no disponible | Alternativa habitual de imitación basada en difusión |
| SmolVLA | no disponible | Acciones con entrada visión-lenguaje | no disponible | Hugging Face (LeRobot) | Política visión-lenguaje-acción de LeRobot |

Los datos de rendimiento comparado no están disponibles en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde a prompts; cualquier expectativa de chat o razonamiento textual es inaplicable.
- Dependencia del dataset: la política está entrenada sobre `COMBILE-DS1_1B1O_FF_rand80`; su comportamiento fuera de la distribución de ese dataset (otras tareas, otros objetos, otra iluminación) no está garantizado.
- Riesgo de sobreajuste al entorno de demostración: las políticas de imitación suelen degradarse ante cambios de cámara, fondo, posición inicial o dinámica del robot.
- Sesgos: no documentados en la información disponible; en robótica, los sesgos provienen de las demostraciones humanas y de la configuración del montaje.
- Alucinación: no aplica en el sentido lingüístico, pero existe riesgo de predicciones de acción incorrectas o inseguras ante observaciones no vistas.
- Idiomas: no aplica.
- Licencia: apache-2.0, que permite uso comercial y modificación, siempre que se conserven los avisos de licencia correspondientes. Conviene revisar igualmente la licencia del dataset asociado, no detallada en la información proporcionada.
- Seguridad en producción: al tratarse de una política que controla hardware físico, es imprescindible validar en entornos controlados y con límites de seguridad antes de cualquier despliegue real.
- Cero tracción comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso o validación externa.
- Fecha de creación del repositorio: 2026-10-09 según los metadatos, lo que conviene verificar por si es un dato anómalo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phawitbinabik/act_COMBILE-DS1_1B1O_FF_rand80
- Dataset asociado: https://huggingface.co/datasets/phawitbinabik/COMBILE-DS1_1B1O_FF_rand80
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados correspondían a servicios de chat sin relación con el contenido de la ficha.
