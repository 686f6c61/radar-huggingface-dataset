# simonholmes001/my_policy_cube-100-v1

## Resumen

El modelo `simonholmes001/my_policy_cube-100-v1` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. Lo desarrolla el usuario simonholmes001 y se ha entrenado y publicado en HuggingFace Hub mediante la librería LeRobot de HuggingFace. El modelo resuelve la tarea concreta de manipulación asociada al dataset `simonholmes001/cube-dataset-100-v1_20260923_130607`, presumiblemente una tarea de recogida o manipulación de un cubo.

A diferencia de un modelo de lenguaje, no procesa texto ni mantiene una ventana de contexto conversacional: es una política visomotora que, a partir de observaciones (imágenes de cámara y estado del robot), emite comandos de acción sobre los actuadores de un brazo robótico. El checkpoint tiene 51.668.614 parámetros (unos 51,7 millones) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la gama de políticas ligeras desplegables en hardware de consumo.

Su relevancia actual radica en que ACT se ha consolidado como una referencia de bajo coste para manipulación fina con hardware asequible: el paper original demuestra tasas de éxito altas aprendiendo de teleoperación con pocas demostraciones. Al estar publicado con licencia Apache 2.0 y en formato compatible con LeRobot, sirve como punto de partida reproducible para quienes quieran entrenar o evaluar políticas de imitación en brazos como el SO-100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con CVAE y action chunking (ACT) |
| Parametros totales | 51.668.614 (51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política visomotora; no usa contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica / no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | simonholmes001/cube-dataset-100-v1_20260923_130607 |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-09-23 |
| Fecha de actualizacion | 2026-09-23 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una política de aprendizaje por imitación descrita en el paper arXiv:2304.13705. Su diseño combina un codificador de observaciones basado en un backbone convolucional (habitualmente ResNet) que extrae características de las imágenes de cámara, junto con un transformer encoder-decoder que predice un "chunk" de k acciones futuras en lugar de una sola acción por paso. El modelo incorpora además un componente de autoencoder variacional condicional (CVAE) con una variable latente que captura la variabilidad de los estilos de demostración humana, lo que ayuda a modelar comportamientos multimodales y reduce el efecto del ruido en los datos de teleoperación.

Según la información disponible, esta política se ha entrenado con LeRobot sobre el dataset `simonholmes001/cube-dataset-100-v1_20260923_130607`, mediante el comando `lerobot-train` con `--policy.type=act`. No se especifican en la información proporcionada el número de tokens ni de episodios, la composición exacta del dataset, el número de demostraciones ni si se aplicaron etapas de RLHF o DPO (conceptos, por otra parte, propios del ajuste de modelos de lenguaje y no del pipeline de ACT). El detalle del proceso de entrenamiento, hiperparámetros y posible decodificación especulativa no está disponible.

## Capacidades

- Control robótico por imitación: genera comandos de acción continua para un brazo manipulador a partir de observaciones visuales y de estado.
- Predicción por chunks: emite secuencias cortas de acciones, lo que mejora la coherencia temporal y reduce la acumulación de error frente a políticas de paso único.
- Aprendizaje a partir de teleoperación: entrenado con demostraciones humanas, sin necesidad de recompensas explícitas ni entorno simulado.
- Modelado de multimodalidad: el componente CVAE permite representar distintos estilos o modos de ejecución de la misma tarea.
- Integración con LeRobot: soporta entrenamiento (`lerobot-train`) e inferencia/evaluación (`lerobot-record`).
- Compatibilidad con robots de tipo follower (por ejemplo, `so100_follower` según los ejemplos de la model card).
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Capacidades multilingües: no aplica.
- Capacidades especiales (thinking mode, visión, audio): procesa entrada visual para el control, pero no dispone de modo de razonamiento ni de procesamiento de audio según la información disponible.

## Casos de uso

- Manipulación de un cubo con brazo de bajo coste: la política está entrenada específicamente para la tarea del dataset `cube-dataset-100-v1`, de modo que puede desplegarse directamente sobre un brazo SO-100 para recoger y colocar el objeto.
- Automatización de pick-and-place en laboratorio: usar el modelo como controlador de una celda de manipulación repetitiva donde la posición del cubo varíe dentro del dominio de entrenamiento.
- Base para fine-tuning en nuevas tareas: al ser una política ACT de 51,7 M de parámetros, se puede reentrenar con un dataset propio mediante LeRobot para adaptarla a otros objetos o disposiciones.
- Evaluación reproducible de políticas de imitación: sirve como referencia para comparar tasas de éxito con otras políticas (Diffusion Policy, VQ-BeT) en el mismo banco de pruebas.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del action chunking y del CVAE en la estabilidad del control visomotor.
- Prototipado docente: su reducido tamaño y su licencia Apache 2.0 lo hacen adecuado para prácticas de robótica en entornos académicos con GPU de consumo.
- Integración en pipelines de robótica con LeRobot: el checkpoint se puede cargar con `--policy.path` para ejecutar episodios de evaluación de forma automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 M de parámetros en safetensors, el peso en precisión completa ocupa aproximadamente 0,2 GB; la VRAM total dependerá del runtime y de las imágenes de entrada, pero debería mantenerse muy por debajo de 2-4 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 3060, RTX 4090 o superiores son más que suficientes. Para entrenamiento conviene una GPU con al menos 8-12 GB (RTX 3080/4090, A100, H100).
- Cabe en GPU de consumo: sí, con margen amplio, incluidas GPUs de gama media y posiblemente inferencia en CPU para episodios cortos.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`), con posibilidad de ejecución en CUDA o CPU según `--policy.device`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| my_policy_cube-100-v1 (ACT) | 51,7 M | Política de imitación (transformer + CVAE) | no aplica | Apache 2.0 | HuggingFace (LeRobot) |
| Diffusion Policy | no disponible | Política de imitación basada en difusión | no aplica | no disponible | Repositorio de investigación |
| VQ-BeT | no disponible | Política de imitación con discretización de acciones | no aplica | no disponible | Repositorio de investigación |
| SmolVLA | no disponible | Modelo visión-lenguaje-acción | no disponible | no disponible | HuggingFace (LeRobot) |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es una política específica para una tarea y un robot concretos (dataset de cubo con SO-100); fuera de ese dominio su comportamiento no está garantizado.
- Al ser aprendizaje por imitación, reproduce los sesgos y hábitos presentes en las demostraciones de teleoperación; puede fallar ante configuraciones de objeto no vistas.
- Riesgo de degradación ante cambios de iluminación, posición de cámara o variaciones del entorno no representadas en el dataset.
- No es un modelo de lenguaje: no genera texto, no responde a instrucciones verbales y no tiene capacidades multilingües.
- No hay información publicada sobre cuantizaciones, latencia, throughput ni benchmarks de tasa de éxito.
- El repositorio no registra descargas ni likes, por lo que no existe validación externa de su funcionamiento más allá de la model card.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el entorno real antes de usarlo en producción.
- El dataset de entrenamiento y sus condiciones de recogida no están documentados en la información disponible, lo que dificulta evaluar su cobertura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simonholmes001/my_policy_cube-100-v1
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas (LeRobot): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/simonholmes001/cube-dataset-100-v1_20260923_130607
