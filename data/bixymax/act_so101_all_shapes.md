# Bixymax/act_so101_all_shapes

## Resumen

`Bixymax/act_so101_all_shapes` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. Lo publica el usuario Bixymax en Hugging Face, entrenado y subido con la librería LeRobot de Hugging Face, y está pensado para controlar un brazo robótico de la familia SO-101 (variante de bajo coste del SO-100). El problema que resuelve es el de generar trayectorias de manipulación fina a partir de demostraciones teleoperadas, sin necesidad de planificación explícita ni de modelos del entorno.

El modelo tiene 51.668.614 parámetros (~51,7 M) almacenados en formato safetensors, con un tamaño de repositorio de 0,2 GB, y se distribuye bajo licencia Apache 2.0. Pertenece a la categoría de políticas de imitación para robótica, no a la de modelos de lenguaje: su entrada son observaciones visuales y propioceptivas del robot, y su salida son comandos de acción (posiciones articulares o efector final), no texto.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas con herramientas como `lerobot-train` y `lerobot-record`. Su tamaño reducido (por debajo de 52 M de parámetros) lo hace viable en hardware de consumo, algo poco habitual en robótica de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer con encoder CVAE y decodificador de acciones |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (política robótica, no modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tamano del repositorio | 0,2 GB |
| Pipeline | robotics |
| Dataset de entrenamiento | Bixymax/so101_dataset_all_shapes |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (Zhao et al., 2023, arXiv:2304.13705). La arquitectura combina un encoder de tipo CVAE (autoencoder variacional condicional), que modela la variabilidad de las demostraciones humanas, con un transformer que actúa como decodificador y predice un fragmento de `k` acciones futuras de una sola pasada. Esta predicción por chunks reduce el error de acumulación típico de las políticas que actúan paso a paso y permite frecuencias de control efectivas más altas. La información proporcionada no detalla el número exacto de capas, dimensión de embeddings, número de cabezas de atención ni el tamaño del chunk de acciones utilizado en este checkpoint concreto.

El entrenamiento se realiza con LeRobot sobre el dataset `Bixymax/so101_dataset_all_shapes`, que contiene demostraciones teleoperadas del brazo SO-101 en tareas de manipulación con distintas formas geométricas. El flujo documentado usa `lerobot-train` con `--policy.type=act` y `--policy.device=cuda`, y la evaluación se hace con `lerobot-record` contra un `so100_follower`. No se especifica en la información disponible el número de episodios, de transiciones, de tokens de entrenamiento ni si se aplicaron fases de RLHF, DPO u optimizaciones posteriores (en ACT lo habitual es entrenamiento supervisado puro sobre demostraciones).

## Capacidades

- Manipulación robótica por imitación: genera comandos de acción para un brazo SO-101 a partir de observaciones visuales y propioceptivas.
- Predicción de fragmentos de acción (action chunking): emite secuencias cortas de acciones en lugar de un único paso, lo que mejora la suavidad y la tasa de éxito en tareas finas.
- Ejecución de tareas de "all shapes" (todas las formas): el nombre del dataset sugiere variabilidad en las geometrías de los objetos manipulados.
- Control de efector final y articulaciones a través del pipeline LeRobot (`lerobot-record` con `--policy.path`).
- Despliegue local o desde el Hub de Hugging Face mediante checkpoints LeRobot.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes multi-paso ni multilingüismo: es una política de control, no un modelo de lenguaje.

## Casos de uso

- Pick-and-place de objetos de geometría variable: el modelo se entrena con un dataset de "todas las formas", por lo que puede emplearse en células de clasificación donde los objetos cambian de forma entre ciclos.
- Automatización de tareas de ensamblaje de baja precisión: con 51,7 M de parámetros y control por chunks, es adecuado para insertar o colocar piezas en posiciones predefinidas a partir de demostraciones.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible en LeRobot para comparar ACT frente a otras políticas (Diffusion Policy, VQ-BeT) sobre el mismo dataset.
- Prototipado rápido en robótica de bajo coste: al entrenarse con hardware SO-101/SO-100, encaja en laboratorios y aficionados con brazos de menos de 200 euros por brazo.
- Recogida de datos iterativa: puede desplegarse con `lerobot-record` para generar nuevos episodios etiquetados automáticamente y ampliar el dataset.
- Demostraciones educativas: el modelo cabe en un portátil con GPU de consumo, lo que permite impartir prácticas de robótica con inferencia local.
- Benchmarking de pipelines de entrenamiento: útil para medir el efecto de hiperparámetros de LeRobot (número de episodios, aumentos de imagen) sobre la tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones numéricas con otras políticas. El repositorio tiene 0 descargas y 0 "likes", por lo que tampoco hay métricas de comunidad publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en fp32 y 0,1 GB en fp16 para los pesos; el pico real depende de los buffers de visión (cámaras) y del tamaño del chunk de acciones, que no se especifican.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida la gama de consumo; el checkpoint es compatible con `--policy.device=cuda`. También puede ejecutarse en CPU dado su tamaño.
- GPU de consumo: sí, cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, y muy probablemente en iGPU y en Raspberry Pi con aceleración, aunque no hay cifras confirmadas.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`, `lerobot-eval`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no aplican a esta política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bixymax/act_so101_all_shapes | 51,7 M | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| ACT original (Zhao et al., 2023) | no disponible en esta busqueda | no disponible | sí, en el paper | no disponible | arXiv:2304.13705 |
| Otras politicas LeRobot (Diffusion Policy, VQ-BeT) | no disponible | no disponible | no disponible | no disponible | repositorios Hugging Face |

No se dispone de datos suficientes en la informacion proporcionada para una comparativa numérica fiable con alternativas del mismo tamaño o tarea.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al entrenarse con demostraciones teleoperadas de un operador concreto y un montaje concreto, es previsible que herede sesgos de posición, iluminación y disposición de cámara del dataset.
- Riesgo de alucinación en sentido estricto: no aplica (no es un modelo generativo de lenguaje). Sí existe riesgo de generalización deficiente fuera de la distribución del dataset de entrenamiento.
- Limitaciones de contexto: la longitud de contexto y el tamaño de chunk no están publicados; no se puede garantizar el comportamiento con historiales de observación largos sin verificarlo.
- Limitaciones de idioma: no aplica, ya que no procesa texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se indique si hubo cambios. El dataset asociado (`Bixymax/so101_dataset_all_shapes`) puede tener condiciones propias que conviene revisar por separado.
- Caveats para producción: 0 descargas y 0 "likes" indican que el checkpoint no ha sido validado por la comunidad; no hay tasas de éxito publicadas ni evaluación externa. No se recomienda desplegarlo en un robot real sin una fase de validación en entorno controlado.
- Compatibilidad: la model card muestra ejemplos con `so100_follower`, mientras el nombre del modelo hace referencia a SO-101; conviene verificar la correspondencia exacta del hardware antes de desplegar.
- Seguridad: un brazo robótico puede causar daños físicos; se debe operar con paradas de emergencia y límites de fuerza, con independencia del rendimiento del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bixymax/act_so101_all_shapes
- Perfil del autor en Hugging Face: https://huggingface.co/Bixymax
- Dataset de entrenamiento: https://huggingface.co/datasets/Bixymax/so101_dataset_all_shapes
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Paper en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
