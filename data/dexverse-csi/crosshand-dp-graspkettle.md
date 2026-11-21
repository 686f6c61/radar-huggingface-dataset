# Dexverse-CSI/crosshand-dp-graspkettle

## Resumen

`crosshand-dp-graspkettle` es un conjunto de checkpoints de política de difusión (Diffusion Policy) entrenados con la librería LeRobot sobre demostraciones de teleoperación en el simulador DexVerse (Isaac Lab), para la tarea `Dexverse-GraspKettle-v0` con mano derecha flotante. Lo publica el colectivo Dexverse-CSI como artefacto de investigación, no como modelo listo para producción. El repositorio ocupa 2,2 GB y contiene pesos en formato safetensors empaquetados como carpetas `pretrained_model` de LeRobot.

El objetivo del trabajo es un estudio controlado sobre representaciones del espacio de acciones para manipulación diestra multi-mano: todos los entrenamientos comparten datos, arquitectura y receta, y solo cambia cómo se codifican las acciones de los dedos. Se comparan articulaciones crudas normalizadas (brazo `joint`) frente a varios espacios latentes compartidos entre manos distintas (brazo `xlvla`, reproducción del espacio latente de XL-VLA, y tres variantes propias en desarrollo: `ea`, `eh`, `e2c`). Los seis manipuladores cubiertos son Shadow, Inspire, Sharpa y Wuji (cinco dedos) y Allegro y Leap (cuatro dedos).

La relevancia es metodológica: cuantifica cuánta capacidad de imitación se pierde al comprimir acciones de dedos en un latente compartido entre morfologías, tanto en bucle abierto (techo de replay) como en bucle cerrado tras 200.000 pasos de entrenamiento. El estado del proyecto es explícitamente «work in progress» a fecha de 21 de noviembre de 2026: varios runs no están evaluados y dos del experimento B seguían entrenando sin subir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (LeRobot) con denoiser U-Net 1D y encoder visual ResNet-18 desde cero, uno por cámara |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de observación de 2 pasos y chunk de acción de 16 (8 pasos ejecutados por inferencia) |
| Tipos de cuantizacion | no disponible (pesos entrenados y publicados en fp32) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors` dentro de carpetas `pretrained_model` de LeRobot, con `config.json`, `train_config.json` y ficheros de pre/post-procesado) |

Otros datos técnicos: observaciones de dos cámaras RGB (`third_person`, `eye_in_hand`) a 480x640, redimensionadas a 240x320 en el data loader con recorte aleatorio a 216x288; DDPM con 100 pasos de denoising en inferencia; entrenamiento en fp32 con Adam, lr 1e-4, schedule coseno con 500 pasos de warm-up, batch 64, 200.000 pasos, semilla 42 y snapshots cada 50.000 pasos.

## Arquitectura y entrenamiento

La política es una Diffusion Policy de LeRobot: un denoiser U-Net que modela la distribución de chunks de acción de 16 pasos condicionada por observaciones visuales y de estado, con un encoder ResNet-18 entrenado desde cero por cada cámara. El vector de política es `[pose canónica de muñeca (9) | parte de dedos]`. La parte de muñeca es idéntica en todos los runs: posición 3D más rotación 6D de un marco canónico común a todas las manos, convertido a las articulaciones de muñeca de cada mano mediante IK en ejecución. La parte de dedos es la única variable: en el brazo `joint` son articulaciones normalizadas a [-1, 1] con padding a 22 dimensiones más un one-hot de identidad de mano de 6 dimensiones en el estado; en los brazos latentes (`xlvla`, `ea`, `eh`, `e2c`) es un vector latente z de un espacio compartido entre manos, decodificado por la cabeza correspondiente D_h(z) y sin one-hot de identidad.

Los datos son demostraciones de teleoperación en DexVerse: el experimento A usa las seis manos con 50 demostraciones cada una (300 en total); el experimento B excluye Shadow y entrena con cinco manos (250 demostraciones) para medir generalización zero-shot a una mano no vista. No se documenta en la información disponible el número total de tokens ni composición de dataset más allá de estas cifras, ni si hubo RLHF o DPO (no aplica en el sentido habitual, al ser imitación supervisada sobre acciones). La normalización sigue los valores por defecto de LeRobot (min-max para estado y acciones, media-desviación para imágenes), con estadísticas guardadas en los ficheros `policy_preprocessor*` y `policy_postprocessor*` de cada checkpoint. Las acciones son objetivos absolutos.

## Capacidades

- Generación de trayectorias de acción para manipulación diestra: predice chunks de 16 pasos de pose de muñeca y dedos, ejecutando 8 pasos por inferencia.
- Control de agarre y manipulación de una tetera en simulación (`Dexverse-GraspKettle-v0`) con mano derecha flotante de 6 grados de libertad en la muñeca.
- Política multi-mano en el experimento A: una sola política compartida entre Shadow, Inspire, Sharpa, Wuji, Allegro y Leap mediante el espacio de acciones elegido.
- Transferencia zero-shot a mano no vista en el experimento B: la política entrenada sin Shadow se evalúa sobre Shadow.
- Percepción visual desde dos cámaras RGB (vista en tercera persona y cámara en la mano).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, visión general, audio ni modo thinking: es una política de control motor, no un modelo de lenguaje.

## Casos de uso

- Investigación en representaciones de acciones para robótica: comparar brazos `joint` frente a latentes compartidos con datos y receta idénticos, usando los checkpoints ya entrenados para reproducir la tabla de éxito en bucle cerrado.
- Estudio de transferencia entre morfologías: emplear los runs del experimento B para medir la caída de rendimiento al aplicar una política entrenada en cinco manos a una sexta no vista, con Shadow como banco de pruebas.
- Línea base para nuevos espacios latentes cross-hand: los brazos `ea`, `eh` y `e2c` sirven como referencia interna frente a `xlvla` y `joint` al desarrollar métodos propios de compresión de acciones.
- Evaluación de techos de imitación: usar los resultados de replay en bucle abierto (59/60 con acciones crudas, 55/60 con `joint`, 47/60 con `xlvla`, 40/60 con los latentes propios) para acotar qué éxito es alcanzable antes de introducir corrección en bucle cerrado.
- Prototipado de pipelines LeRobot en Isaac Lab: cargar `a6/joint/best_150000` con `DiffusionPolicy.from_pretrained` e integrarlo en un evaluador cerrado con el protocolo descrito (máximo 3000 pasos, éxito según el término de la tarea).
- Docencia y divulgación sobre Diffusion Policy: el checkpoint `joint` funciona de forma autónoma y permite demostrar entrenamiento por imitación con observaciones multimodales sin depender de los espacios latentes no publicados.
- Análisis de sensibilidad a la selección de snapshot: comparar `best_150000` (10/10 en la selección) frente a `last_200000` (6/10) en el brazo `joint` para estudiar la estabilidad del entrenamiento a lo largo de los pasos.

## Benchmarks y rendimiento

Resultados de éxito en bucle cerrado sobre Shadow (evaluador DexVerse, máximo 3000 pasos, éxito según el término de la tarea). La selección de snapshot usa 10 episodios en los pasos 150k y 200k; la evaluación final usa 30 episodios con layouts iniciales distintos.

| Exp | Brazo | Snapshots | Éxito en selección (150k / 200k, sobre 10) | Éxito final (30 eps) |
|---|---|---|---|---|
| A | `joint` | `a6/joint/best_150000`, `a6/joint/last_200000` | 10 / 6 | 0,87 (26/30) |
| A | `xlvla` | `a6/xlvla/best_200000` (= last) | 4 / 7 | 0,67 (20/30) |
| A | `ea` | `a6/ea/best_200000` (= last) | 0 / 0 | no evaluado |
| A | `eh` | `a6/eh/last_200000` | 2 / pendiente | no evaluado |
| A | `e2c` | `a6/e2c/last_200000` | pendiente / 2 | no evaluado |
| B | `eh` | `b_noshadow/eh/last_200000` | pendiente | no evaluado |
| B | `xlvla` | `b_noshadow/xlvla/last_200000` | pendiente | no evaluado |

Techo de replay en bucle abierto (10 episodios por mano, éxito total sobre 60):

| Espacio de acciones | shadow | inspire | sharpa | wuji | allegro | leap | total |
|---|---|---|---|---|---|---|---|
| acciones crudas | 10 | 10 | 10 | 10 | 10 | 9 | 59/60 |
| `joint` | 10 | 8 | 10 | 10 | 9 | 8 | 55/60 |
| `xlvla` | 10 | 6 | 9 | 10 | 6 | 6 | 47/60 |
| `ea` | 4 | 5 | 9 | 6 | 7 | 9 | 40/60 |
| `eh` | 9 | 5 | 8 | 6 | 6 | 6 | 40/60 |
| `e2c` | 10 | 5 | 9 | 2 | 7 | 7 | 40/60 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible, por no ser aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 2,2 GB, pero cada checkpoint individual es una fracción; el consumo real depende del U-Net de difusión, los dos ResNet-18 y el estado de inferencia con 100 pasos DDPM.
- GPU recomendadas: no se especifican en la información disponible. Por el tamaño del modelo y el uso de fp32, una GPU con al menos 8-16 GB de VRAM es un punto de partida razonable, pero no está confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada; el modelo se publica en fp32 y no se documentan cuantizaciones, lo que limita opciones en GPUs pequeñas.
- Opciones de despliegue: carga vía LeRobot (`DiffusionPolicy.from_pretrained` sobre una carpeta `pretrained_model`) y ejecución en el simulador DexVerse/Isaac Lab. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La inferencia usa 100 pasos de denoising DDPM por chunk de 16 acciones, con 8 pasos ejecutados por inferencia, lo que condiciona el coste por ciclo de control.

## Comparativa con modelos similares

| Modelo | Tipo | Manos | Contexto / horizonte | Éxito reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `crosshand-dp-graspkettle` (este) | Diffusion Policy LeRobot, U-Net + ResNet-18 | 6 (multi-mano, con zero-shot en B) | Observación 2, chunk 16 | 0,87 en Shadow (brazo `joint`); 0,67 (`xlvla`) | no disponible | Hugging Face, checkpoints de investigación |
| XL-VLA (espacio latente reproducido) | Espacio de acciones latente compartido entre manos | 6 | no disponible | Replay 47/60; política 0,67 en Shadow | no disponible | Referencia citada, no empaquetada en este repo |
| Brazos latentes propios `ea` / `eh` / `e2c` | Espacios latentes cross-hand en desarrollo | 6 | no disponible | Replay 40/60 cada uno; política sin evaluar | no disponible | Checkpoints de política en este repo; codificadores/decodificadores no incluidos |

No se dispone de datos suficientes para comparar con otras políticas de manipulación diestra publicadas (por ejemplo, variantes de Diffusion Policy o ACT en LeRobot) más allá de las referencias internas del propio estudio.

## Limitaciones y advertencias

- Checkpoints de investigación en estado «work in progress» a 21 de noviembre de 2026: varios runs sin evaluar y dos runs del experimento B aún en entrenamiento y no subidos.
- Una sola tarea (`Dexverse-GraspKettle-v0`), solo simulación, una única semilla de entrenamiento y evaluación final de una sola ronda de 30 episodios sobre una sola mano.
- Los brazos latentes (`xlvla`, `ea`, `eh`, `e2c`) no son autónomos: requieren el checkpoint del espacio latente correspondiente (encoders y decoders por mano), que no está incluido en el repositorio por ser un método no publicado. Solo el brazo `joint` funciona de forma independiente.
- El llamador debe reproducir exactamente el layout de estado y acción (pose canónica de muñeca más parte de dedos); las acciones son objetivos absolutos.
- Riesgo de sobreajuste al simulador y a los layouts de evaluación; no hay validación en hardware real documentada.
- Licencia no disponible: no se puede asumir uso comercial permitido. Verificar términos con el autor antes de cualquier despliegue.
- Sin información sobre sesgos, alucinación o cobertura idiomática por no aplicar a un modelo de control motor; el riesgo equivalente es fallo de la política ante distribuciones visuales o layouts fuera de las demostraciones.
- Los resultados de replay en bucle abierto muestran pérdida sustancial de fidelidad en los espacios latentes propios (40/60 frente a 59/60 con acciones crudas), lo que acota el rendimiento alcanzable en bucle cerrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dexverse-CSI/crosshand-dp-graspkettle
- Librería LeRobot: https://github.com/huggingface/lerobot
- Simulador Isaac Lab: https://github.com/isaac-sim/IsaacLab
- Referencia XL-VLA (espacio latente reproducido): no disponible en la información proporcionada
- Paper, blog o demo del método DexVerse: no disponible en la información proporcionada
