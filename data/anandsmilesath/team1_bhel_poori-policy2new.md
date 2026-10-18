# anandsmilesath/Team1_Bhel_Poori-Policy2new

## Resumen

Este repositorio contiene una política de imitación para control robótico entrenada con el algoritmo ACT (Action Chunking with Transformers) dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es un policy que mapea observaciones (imágenes de cámaras y estado de las articulaciones) a secuencias cortas de acciones de robot, y que se ejecuta en bucle cerrado sobre un brazo real. Lo publica el usuario `anandsmilesath` como artefacto de un proyecto de entrenamiento (el nombre del repositorio, `Team1_Bhel_Poori-Policy2new`, sugiere un trabajo en equipo sobre una tarea concreta).

El modelo tiene 51.617.414 parámetros (unos 51,6 M) y un peso de repositorio de 0,2 GB, lo que lo sitúa en la liga de políticas ligeras que caben holgadamente en una GPU de consumo e incluso pueden ejecutarse en tiempo real junto al lazo de control del robot. Se distribuye bajo licencia Apache 2.0 en formato `safetensors` y con la librería `lerobot`, lo que permite cargarlo con `lerobot-record` sin conversiones.

Su relevancia es práctica: ACT es una de las referencias de imitación más usadas para manipulación con hardware de bajo coste, y este checkpoint sirve como ejemplo reproducible de un pipeline completo (dataset propio → entrenamiento → política desplegable). Ahora bien, no se han publicado métricas, hiperparámetros ni detalles del dataset más allá del identificador, por lo que debe evaluarse empíricamente antes de cualquier uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con encoder VAE auxiliar (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.617.414 (aproximadamente 51,6 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica como ventana de texto; ACT predice *chunks* de acciones de longitud k (valor de k no disponible en la model card) |
| Tipos de cuantizacion | No disponible: solo se publican pesos `safetensors`; no hay variantes cuantizadas (INT8, GGUF, etc.) |
| Idiomas soportados | No disponible; no es un modelo de lenguaje y no procesa texto libre |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (formato de checkpoint de LeRobot) |
| Tipo de politica | Imitacion supervisada (*behavior cloning*) con prediccion de chunks de acciones |
| Dataset de entrenamiento | `anandsmilesath/Team1_Bhel_Poori-Dataset2` |
| Entradas | Observaciones visuales (camaras) y estado de las articulaciones, segun la configuracion de LeRobot (detalle no disponible) |
| Salidas | Secuencia de acciones de control de bajo nivel para el robot |
| Libreria / runtime | `lerobot` |

## Arquitectura y entrenamiento

ACT se describe en el articulo arXiv:2304.13705 (*Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware*). La arquitectura es un transformer encoder-decoder que, en lugar de predecir una sola accion por paso, emite un chunk de k acciones futuras de una vez. Ese diseño reduce el error de acumulacion típico del behavior cloning y amortigua el efecto de la latencia entre observacion y actuacion. Durante el entrenamiento se añade un encoder de tipo VAE (CVAE) que toma la secuencia de acciones objetivo y produce un vector latente estilo; en inferencia ese encoder se descarta y se condiciona solo con las observaciones, lo que da una política determinista y rápida. Es habitual acompañar el transformer con un backbone convolucional tipo ResNet para extraer características de las imágenes, aunque la configuración exacta de este checkpoint no está documentada.

El entrenamiento es de imitación supervisada sobre teleoperaciones: el modelo aprende a reproducir las trayectorias del dataset `Team1_Bhel_Poori-Dataset2`. No se dispone de información sobre el número de episodios, el número de tokens/pasos, la composición de las demostraciones, las resoluciones de cámara, el tamaño del chunk, el uso de aumento de datos ni de ajuste fino posterior (RLHF/DPO no aplica en este dominio). Tampoco se documenta el número de GPUs, la duración del entrenamiento ni las curvas de pérdida.

## Capacidades

- Generación de comandos de acción para manipulación robótica a partir de observaciones visuales y propioceptivas.
- Predicción de chunks de acciones, lo que permite un control más suave y estable que la predicción paso a paso.
- Ejecución en bucle cerrado sobre robots compatibles con LeRobot (la model card muestra el ejemplo con `so100_follower`).
- Aprendizaje de tareas concretas a partir de demostraciones teleoperadas: la política está especializada en la tarea del dataset con el que se entrenó.
- Integración directa con el CLI de LeRobot para entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).
- No soporta *tool calling*, function calling, razonamiento multi-paso simbólico, ni generación de texto o código.
- No dispone de capacidades multilingües, de visión general (VQA, OCR) ni de audio: la visión se usa exclusivamente como entrada de control.
- No se documentan modos especiales (thinking mode, decodificación especulativa, atención lineal) en la información disponible.

## Casos de uso

- Manipulación pick-and-place en laboratorio: la política toma las imágenes de las cámaras y el estado de las articulaciones y emite el chunk de acciones que mueve el efector hasta el objeto y lo deposita, replicando las demostraciones del dataset. Es adecuada porque ACT está diseñada precisamente para tareas de contacto fino con hardware de bajo coste.
- Automatización de una celda de ensamblaje repetitiva: entrenando una política por sub-tarea (atornillar, insertar, colocar) se puede sustituir parte de la programación manual de trayectorias por imitación, con la ventaja de que el chunking absorbe pequeñas variaciones de posicionamiento.
- Prototipado rápido en robótica de investigación: al ser un checkpoint de 51,6 M de parámetros y 0,2 GB, se puede iterar en un portátil con GPU de consumo, comparar variantes y reentrenar con `lerobot-train` sin infraestructura dedicada.
- Base para *fine-tuning* con nuevas demostraciones: el checkpoint sirve como inicialización para otra tarea del mismo robot, reduciendo el número de episodios necesarios frente a entrenar desde cero.
- Evaluación comparativa de algoritmos de imitación: al estar en el formato estándar de LeRobot, se puede confrontar contra Diffusion Policy o VQ-BeT sobre el mismo dataset y el mismo robot, manteniendo constante el resto del pipeline.
- Demostraciones y docencia: reproducción de un flujo completo de teleoperación, entrenamiento y despliegue en talleres, dado que el coste computacional es mínimo y el CLI de LeRobot automatiza registro y evaluación.
- Recolección de datos asistida: ejecutando la política en modo evaluación se pueden detectar fallos sistemáticos y dirigir la recogida de nuevas teleoperaciones a los puntos donde el modelo falla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación, ni comparaciones cuantitativas con otras políticas. Las cifras de éxito del método ACT que aparecen en el artículo original corresponden a los montajes experimentales de sus autores (ALOHA y variantes) y no son trasladables a este checkpoint, que se ha entrenado sobre un dataset distinto.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 207 MB en FP32 (51,6 M de parámetros × 4 bytes) y unos 103 MB en FP16/BF16, sin contar buffers de activaciones ni el peso del backbone visual si se carga aparte.
- Espacio en disco: 0,2 GB para el repositorio completo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o RTX 4090 es más que suficiente. Para entrenamiento, una GPU de 8-12 GB permite lotes cómodos con imágenes de varias cámaras.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada de los últimos ocho años, e incluso en CPU para inferencia (con mayor latencia).
- Opciones de despliegue: `lerobot-record` con `--policy.path` apuntando al checkpoint local o al Hub; el resto de backends (vLLM, llama.cpp, Ollama, TGI) no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles para este checkpoint. El método ACT está pensado para control en tiempo real y el chunking se diseñó para tolerar latencias de decenas de milisegundos, pero la frecuencia efectiva depende del robot, del número de cámaras y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (ACT) | 51,6 M | Chunk de k acciones (k no disponible) | No disponible | Apache 2.0 | Hugging Face, formato LeRobot |
| Diffusion Policy | No disponible en la informacion proporcionada (depende de la configuración) | Predice secuencias de acciones mediante difusión | No disponible | Segun implementación (habitualmente MIT/Apache 2.0) | Implementaciones en LeRobot y repos públicos |
| VQ-BeT | No disponible en la informacion proporcionada | Acciones discretizadas con transformer autorregresivo | No disponible | Segun implementación | Disponible en LeRobot |
| SmolVLA | No disponible en la informacion proporcionada | Politica vision-language-action con contexto multimodal | No disponible | Segun model card del autor | Hugging Face, ecosistema LeRobot |

Solo el dato de 51.617.414 parámetros de este checkpoint está verificado en la información proporcionada; las cifras del resto de alternativas deben consultarse en sus respectivas model cards antes de establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Especialización extrema: la política solo es válida para la tarea, el robot y la disposición de cámaras del dataset `Team1_Bhel_Poori-Dataset2`. Cambiar la iluminación, la posición de las cámaras o el objeto suele degradar el rendimiento de forma severa.
- Sin métricas publicadas: no hay tasas de éxito ni protocolo de evaluación, por lo que no se puede afirmar que la política funcione correctamente. Debe validarse con `lerobot-record --episodes=N` antes de cualquier uso.
- Riesgo de fallo silencioso en producción: al ser behavior cloning, la política no detecta situaciones fuera de distribución y puede ejecutar acciones incorrectas con confianza alta; requiere supervisión humana o capas de seguridad (paradas de emergencia, límites de par, detección de colisiones).
- Sesgos derivados de los datos: las demostraciones de un único operador reproducen sus estrategias, su velocidad y sus errores sistemáticos. No se documenta la diversidad de demostraciones ni el número de operadores.
- Sin capacidades de lenguaje: no comprende instrucciones en lenguaje natural ni permite control por voz o texto.
- Idiomas: no aplica; no hay soporte lingüístico que evaluar.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el autor no ofrece garantías ni soporte; conviene conservar el aviso de licencia y citar el artículo de ACT.
- Repositorio sin tracción: cero descargas y cero *likes* en el momento de la consulta, sin historial de mantenimiento ni issues. No hay garantía de que el checkpoint se conserve o se actualice.
- Fecha de creación registrada como 2026-10-17, posterior a la mayoría de referencias del ecosistema; conviene verificar la integridad del artefacto y la trazabilidad del entrenamiento antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anandsmilesath/Team1_Bhel_Poori-Policy2new
- Dataset de entrenamiento: https://huggingface.co/datasets/anandsmilesath/Team1_Bhel_Poori-Dataset2
- Articulo de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Version en arXiv: https://arxiv.org/abs/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
