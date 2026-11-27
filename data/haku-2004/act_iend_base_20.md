# Haku-2004/act_iend_base_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_iend_base_20`, es una política ACT entrenada con LeRobot sobre el dataset `Haku-2004/i_20261126_110221` y publicada en Hugging Face con licencia Apache 2.0. No es un modelo de lenguaje: es una política visomotora que mapea observaciones (típicamente imágenes de cámara más estado de las articulaciones) a comandos de control de un brazo robótico.

El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB en formato safetensors, lo que lo sitúa en la categoría de políticas ligeras ejecutables en hardware modesto. Está pensado para robótica de sobremesa tipo SO-100/SO-101 dentro del ecosistema LeRobot, y su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de una política de imitación con herramientas abiertas, sin dependencia de infraestructura propietaria.

La ficha se basa únicamente en la información disponible en el repositorio y en la model card; los datos no publicados se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT, Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control; no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT emplea un transformer encoder-decoder con un cuello de botella latente de dimensión reducida (estilo CVAE) que codifica la variabilidad de las demostraciones humanas. La innovación central es la predicción de chunks de acciones: en lugar de emitir una acción por paso de control, el modelo genera una secuencia de acciones futuras, lo que reduce el error de compounding y suaviza la ejecución. El paper original (arXiv:2304.13705) reporta mejoras notables de tasa de éxito frente a políticas por paso en tareas de manipulación fina.

El entrenamiento es de imitación supervisada sobre teleoperación, sin RLHF ni DPO. En este caso concreto, la política se entrenó con `lerobot-train` sobre el dataset `Haku-2004/i_20261126_110221`; no se especifican en la información disponible el número de episodios, la composición del dataset, la resolución de las cámaras ni la configuración exacta de hiperparámetros.

## Capacidades

- Control robótico por imitación: predice chunks de acciones a partir de observaciones visuales y de estado.
- Manipulación visomotora: adecuado para tareas de pick-and-place, inserción y manipulación fina sobre brazos de sobremesa.
- Ejecución en tiempo real: pensado para inferencia en bucle de control con `lerobot-record`.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante CLI.
- Sin capacidades de lenguaje, razonamiento simbólico, tool calling ni agentes multi-paso.
- Sin capacidades multilingües ni de visión general (la visión se usa solo como entrada de control).
- Sin modo thinking, audio ni generación de texto.

## Casos de uso

- Manipulación de sobremesa con SO-100/SO-101: desplegar la política con `lerobot-record` sobre un brazo seguidor para tareas replicadas del dataset de entrenamiento, aprovechando el chunking para movimientos suaves.
- Automatización de pick-and-place en laboratorio: recoger y colocar objetos en posiciones aprendidas de las demostraciones, con evaluación en 10 episodios mediante el flujo estándar de LeRobot.
- Prototipado de investigación en imitación: usar la política como línea base reproducible para comparar variantes de ACT, datasets o configuraciones de cámara.
- Evaluación de datasets de teleoperación: medir la calidad de `i_20261126_110221` entrenando y evaluando políticas derivadas y comparando tasas de éxito.
- Formación y docencia en robótica: ejemplo completo y ligero (0,2 GB) para enseñar el ciclo demostración-entrenamiento-despliegue sin hardware de altas prestaciones.
- Integración en pipelines de investigación con hardware de bajo coste: al tener ~51,7 M de parámetros, puede ejecutarse en GPUs de consumo y facilitar experimentos iterativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~51,7 M de parámetros en FP32 los pesos ocupan aproximadamente 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA para `--policy.device=cuda`; una RTX 3060/4060 o superior es suficiente para inferencia y entrenamiento ligero.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más; el tamaño del repo (0,2 GB) sugiere requisitos muy bajos.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`); no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_iend_base_20 | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible en la información | no aplica | reportado en paper, valores no incluidos aquí | según implementación | paper y código de referencia |
| Otras políticas LeRobot (p. ej. Diffusion Policy) | no disponible en la información | no aplica | no disponible | habitualmente Apache 2.0 | Hugging Face (LeRobot) |

No se dispone de datos comparativos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Es una política específica para un robot y un dataset concretos; no generaliza a otras tareas, cámaras o morfologías sin reentrenamiento.
- Riesgo de sobreajuste al dataset `i_20261126_110221`: la tasa de éxito fuera de la distribución de demostraciones puede degradarse.
- Sin información sobre sesgos ni evaluación de robustez; no se han publicado métricas.
- No es un modelo de lenguaje: no procesa texto ni responde a instrucciones en lenguaje natural.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre seguridad física del robot; validar siempre en entorno controlado.
- No se documentan requisitos de seguridad, paradas de emergencia ni límites de par; el despliegue en hardware real requiere supervisión.
- Los datos de entrenamiento y la configuración exacta no están publicados, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_iend_base_20
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_20261126_110221
