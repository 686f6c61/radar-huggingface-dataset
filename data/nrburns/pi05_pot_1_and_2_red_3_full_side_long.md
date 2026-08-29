# nrburns/pi05_Pot_1_and_2_Red_3_full_side_long

## Resumen

Este modelo es un fine-tuning del modelo de visión-lenguaje-acción (VLA) π₀.₅ (Pi05) de Physical Intelligence, adaptado para una tarea específica de manipulación robótica: recoger fresas destacadas, colocarlas en un contenedor verde y volver a la posición inicial. El ajuste se realizó con el framework LeRobot de Hugging Face, partiendo del checkpoint base `lerobot/pi05_base` y usando un dataset propio de 40 episodios grabados a 20 FPS.

Pi05 es una evolución del modelo π₀ que busca generalizar a entornos y situaciones nunca vistos durante el entrenamiento. Esta versión fine-tuneada reduce el problema a un escenario concreto, lo que permite evaluar la capacidad del modelo base para adaptarse a tareas específicas con pocos datos. El modelo tiene aproximadamente 4.140 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que facilita su uso y modificación en proyectos de robótica de código abierto.

La relevancia de este modelo radica en que demuestra el flujo completo de entrenamiento de políticas robóticas con LeRobot: desde la grabación de datos con un robot real (tipo `rizon4`), pasando por el fine-tuning de un VLA de última generación, hasta el despliegue en el robot mediante el comando `lerobot-rollout`. Es un ejemplo práctico de cómo adaptar un modelo base potente a tareas de manipulación con un dataset relativamente pequeño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio contiene safetensors en precisión nativa) |
| Idiomas soportados | no disponibles (instrucciones en inglés en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pi05 es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y una cabeza de acción para generar comandos motores directamente desde observaciones de cámara y estado del robot. La implementación en LeRobot se basa en el repositorio OpenPI de Physical Intelligence, adaptado para el ecosistema Hugging Face. El modelo base `lerobot/pi05_base` ya está preentrenado para generalizar a entornos abiertos, y este checkpoint es un fine-tuning supervisado para una tarea concreta.

El entrenamiento se realizó con el dataset `nrburns/Pot_1_and_2_Red-3_full_side-long`, que contiene 40 episodios y 76.615 frames, con una tasa de 20 FPS. Las observaciones incluyen tres cámaras (escena, muñeca y lateral) con resolución 480×640, más un vector de estado de 8 dimensiones (posición, torque, fuerza, etc.). La configuración de entrenamiento fue: 16.000 pasos, batch size 32, optimizador AdamW con learning rate 2,5×10⁻⁵, semilla 1000 y LeRobot versión 0.6.2. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un fine-tuning estándar de imitación.

## Capacidades

- Control robótico de precisión: genera acciones de 8 dimensiones (posición, orientación, fuerza y estado del gripper) a partir de observaciones visuales y de estado.
- Percepción multi-cámara: procesa simultáneamente tres flujos de imagen (escena, muñeca y lateral) para entender el contexto espacial.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica mediante texto ("pick each highlighted strawberry, place it into the green bin, and return home") y el modelo la ejecuta de forma autónoma.
- Generalización dentro del entorno de entrenamiento: al ser un fine-tuning de Pi05, conserva parte de la capacidad del modelo base para adaptarse a variaciones de posición, iluminación u objetos.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de Hugging Face, incluyendo `lerobot-rollout` y `lerobot-train`.
- No soporta generación de texto libre, tool calling ni agentes conversacionales; su salida es exclusivamente una secuencia de acciones motoras.

## Casos de uso

- Automatización de tareas de picking and placing en líneas de producción: el modelo puede recoger objetos específicos (como fresas) y depositarlos en contenedores designados, reduciendo la intervención humana en entornos controlados.
- Investigación en robótica de imitación: sirve como punto de partida para estudiar cómo el fine-tuning de un VLA base con pocos episodios afecta a la tasa de éxito en tareas concretas.
- Evaluación de generalización: permite probar la robustez de Pi05 ante cambios en la disposición de objetos, iluminación o posición de la cámara, ya que el dataset de entrenamiento es limitado.
- Prototipado rápido de políticas robóticas: el flujo de LeRobot con este modelo muestra cómo pasar de datos grabados a un policy desplegable en horas, útil para laboratorios que necesitan iterar rápido.
- Benchmarking de VLA en hardware real: al estar disponible con licencia Apache 2.0 y pesos abiertos, puede usarse como referencia para comparar otros modelos de acción en robots tipo `rizon4`.
- Formación y demostración académica: el modelo y su dataset asociado son un ejemplo didáctico completo de entrenamiento de un VLA, desde la recolección de datos hasta la inferencia en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se proporcionaron resultados de evaluación ("No evaluation results have been provided for this model"). No se dispone de tasas de éxito en el robot real ni comparaciones con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada: con 4,14 mil millones de parámetros, en FP32 se necesitan aproximadamente 16,6 GB de VRAM; en FP16 (si se convierte) serían 8,3 GB. No se ofrecen cuantizaciones oficiales, por lo que se recomienda una GPU con al menos 16 GB de memoria para inferencia segura.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40 o 80 GB), H100 (80 GB) o similar. En GPUs con menos VRAM podría ser necesario cuantizar manualmente con herramientas como `bitsandbytes` o `torchao`, aunque no está documentado.
- No está diseñado para ejecutarse en CPU o en GPUs de consumo de gama baja debido al tamaño del modelo y a los requisitos de latencia en tiempo real para control robótico.
- Opciones de despliegue: el flujo principal es mediante `lerobot-rollout` con el robot `rizon4` y cámaras OpenCV. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje conversacional.
- Latencia y throughput: no disponibles. El control robótico requiere inferencia en tiempo real (típicamente por debajo de 50 ms), pero no hay datos publicados sobre el rendimiento en el hardware de referencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este fine-tuning concreto. Sin embargo, a nivel de arquitectura base, Pi05 se puede comparar cualitativamente con otros VLA de código abierto:

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Pi05 (este fine-tuning) | 4,14B | no disponible | Apache 2.0 | Robótica, visión-lenguaje-acción |
| OpenVLA | 7B | no disponible | MIT | Robótica, visión-lenguaje-acción |
| RT-2 (Google) | 55B | no disponible | propietaria | Robótica, visión-lenguaje-acción |

OpenVLA (7B) es la alternativa de código abierto más conocida, con licencia MIT y una comunidad activa. RT-2 es propietario y mucho más grande, pero no está disponible públicamente. Pi05 destaca por su tamaño más compacto y por estar específicamente diseñado para generalización a entornos abiertos. No obstante, sin benchmarks comunes, no se puede establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (40 episodios), lo que limita la capacidad de generalización a variaciones significativas del entorno, como cambios de iluminación extrema, objetos desconocidos o configuraciones de cámara distintas.
- Sin resultados de evaluación publicados: no hay evidencia de la tasa de éxito en el robot real, por lo que su rendimiento en producción es incierto.
- Dependencia del hardware específico: el modelo está entrenado para el robot `rizon4` y para un conjunto de cámaras concreto (escena, muñeca, lateral). Usarlo en otro robot o con otra configuración de sensores requerirá reentrenamiento o adaptación.
- Riesgo de errores de acción: al ser un sistema de control directo, los fallos pueden provocar movimientos inseguros del robot. Se recomienda implementar salvaguardas físicas (límites de velocidad, zonas de parada) durante el despliegue.
- Idioma de las instrucciones: el modelo se entrenó con instrucciones en inglés; es probable que no responda correctamente a comandos en otros idiomas.
- No es un modelo de propósito general: no puede realizar tareas de conversación, generación de código ni otras capacidades típicas de los LLM. Su única salida son acciones motoras.
- Sesgos potenciales: al entrenarse en un entorno de laboratorio controlado, el modelo puede comportarse de forma errática ante condiciones no representadas en el dataset (por ejemplo, objetos reflectantes o fondos dinámicos).

## Enlaces

- Repositorio del modelo: https://huggingface.co/nrburns/pi05_Pot_1_and_2_Red_3_full_side_long
- Dataset de entrenamiento: https://huggingface.co/datasets/nrburns/Pot_1_and_2_Red-3_full_side-long
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre Pi05: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI (implementación original): https://github.com/physical-intelligence/openpi
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nrburns/Pot_1_and_2_Red-3_full_side-long
