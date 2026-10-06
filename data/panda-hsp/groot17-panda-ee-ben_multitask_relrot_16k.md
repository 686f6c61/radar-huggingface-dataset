# PANDA-HSP/groot17-panda-ee-ben_multitask_relrot_16k

## Resumen

`PANDA-HSP/groot17-panda-ee-ben_multitask_relrot_16k` es un ajuste fino del modelo fundacional de robótica `nvidia/GR00T-N1.7-3B`, publicado por el usuario PANDA-HSP y entrenado con LeRobot 0.6.0. Se trata de una política vision-language-action (VLA) de 3.144.016.000 parámetros (aproximadamente 3,14 mil millones) especializada en seis tareas de manipulación con un brazo Franka Panda y control en el espacio del efector final (EE). El repositorio contiene el checkpoint del paso 16.000, con una pérdida de entrenamiento de ~0,007, y remite a un repositorio hermano que aloja el checkpoint final de 26.000 pasos (pérdida ~0,003).

El modelo resuelve un problema muy concreto: ejecutar instrucciones de lenguaje natural sobre un robot real en un conjunto cerrado de tareas de cocina y preparación de alimentos (coger una cápsula de café, cerrar la tapa de la cafetera, preparar un bocadillo, meter pan o pera en una bolsa de pícnic). Para ello consume dos vistas de cámara RGB de 640x480 (`wrist_rgb` y `left_rgb`) y un vector de estado de 7 dimensiones del efector final, y produce acciones absolutas de 7 dimensiones (posición, rotación relativa y apertura de pinza).

Su relevancia es doble. Por un lado, es un ejemplo reproducible de ajuste fino de un VLA sobre hardware de investigación asequible (un único A100 80 GB), con hiperparámetros, composición del dataset y decisiones de diseño documentadas. Por otro, ilustra una convención poco habitual en el espacio de acción: la rotación se codifica como `rotvec(Rx(pi)^T * R)`, es decir, relativa a la pinza apuntando hacia abajo, lo que evita los saltos de 2*pi del rotvec absoluto. No se han publicado resultados de benchmarks ni una licencia explícita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA derivada de GR00T N1.7: torre de visión + backbone de lenguaje + proyector y cabeza de acción DiT; en el ajuste fino solo se entrenaron proyector, DiT y VLLN (LLM y torre de visión congelados) |
| Parámetros totales | 3.144.016.000 (~3,14 mil millones, dato real de los safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors sin versiones cuantizadas documentadas |
| Idiomas soportados | no disponible; las instrucciones de tarea del dataset están en inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Tarea (pipeline) | robotics |
| Dimensiones de observación y acción | 7: `ee.x, ee.y, ee.z, ee.wx, ee.wy, ee.wz, gripper_pos` (objetivos absolutos, flange `panda_link8`) |
| Convención de rotación | `ee.w* = rotvec(Rx(pi)^T * R)`, relativa a pinza hacia abajo; inversa: `R = Rx(pi) * exp(ee.w*)` |
| Cámaras de entrada | `observation.images.wrist_rgb`, `observation.images.left_rgb` (640x480) |
| Chunk de acciones | 40 (equivalente a 4 s de trayectoria a 10 fps) |
| Tamaño del repositorio | 12,6 GB (coherente con pesos de 32 bits para 3,14e9 parámetros; el dtype de almacenamiento no está documentado) |
| Fecha de creación | 2026-10-06 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de GR00T N1.7-3B, un modelo fundacional de robotica de tipo VLA. La model card indica que durante el ajuste fino se congelaron el LLM y la torre de visión, y que únicamente se entrenaron el proyector, el módulo DiT (cabeza de acción basada en diffusion transformer) y el componente denominado VLLN. Los parámetros totales reportados por los safetensors (3.144.016.000) incluyen por tanto los componentes congelados; el número exacto de parámetros entrenables no está disponible.

El entrenamiento se realizó con LeRobot 0.6.0 sobre un único A100 80 GB. El dataset (`PANDA-HSP/ben_panda_ee_merged_relrot`, privado) es una fusión de los datasets "Ben Datasets Converted" `*_panda_ee` y contiene 6 tareas de Franka Panda, 271 episodios y 39.573 fotogramas a 10 fps (aproximadamente 66 minutos de datos). La configuración es: 26.000 pasos con batch 192 (~5 millones de muestras, ~122 épocas), AdamW con lr 1e-4, betas (0,9; 0,999), weight decay 1e-5, schedule coseno con 5 % de warmup, autocast en bf16 y grad clip 1.0. Se usó `chunk_size` 40 y `state dropout` de 0,2. La innovación técnica destacable no está en la arquitectura sino en la representación del estado y la acción: la rotación se expresa en un marco relativo a la pinza orientada hacia abajo para eliminar las discontinuidades del rotvec absoluto (que tiene norma cercana a pi en esa pose y salta 2*pi entre fotogramas consecutivos). La conversión a la orientación absoluta se recupera con `R = Rx(pi) * exp(ee.w*)`, y el plugin `PandaEEConfig(ee_rotation_frame="gripper_down")` de `hsp-iit/lerobot_plugins` (rama `panda-ee-relative-rotation`) aplica esa conversión tanto a observaciones como a acciones.

## Capacidades

- Generación de acciones de manipulación robótica: produce secuencias (chunks) de 40 acciones absolutas de 7 grados de libertad para un Franka Panda con pinza, a partir de observaciones visuales y propioceptivas.
- Ejecución de seis tareas de manipulación específicas: `put_coffee`, `close_machine`, `picnic_bread`, `pear_bread`, `toast_prep_step1` y `toast_prep_step2`, cada una asociada a una instrucción fija en inglés que debe reproducirse literalmente en inferencia.
- Percepción visual multi-cámara: procesa dos vistas RGB de 640x480 (muñeca y vista izquierda) de forma simultánea.
- Condicionamiento por instrucción en lenguaje natural: la política está condicionada por el campo `task`, aunque en este ajuste fino el espacio de instrucciones está cerrado a las seis cadenas entrenadas.
- Control en espacio de tarea (efector final): genera objetivos absolutos para el flange `panda_link8`, no pares de articulaciones.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta comportamiento de agente ni razonamiento multi-paso; el modelo no es conversacional.
- Capacidades multilingües: no documentadas; el condicionamiento de tareas está en inglés.
- Capacidades especiales: no se documentan modos de pensamiento, audio ni visión general fuera del pipeline robótico.

## Casos de uso

- Automatización de una celda de cocina robótica: encadenar `toast_prep_step1` y `toast_prep_step2` para montar un bocadillo, y `put_coffee` con `close_machine` para preparar una cápsula de café. El modelo está entrenado exactamente sobre esas transiciones y sobre el mismo montaje físico.
- Banco de pruebas de manipulación multi-tarea: usar las seis tareas como suite de evaluación para comparar checkpoints intermedios (16k, 20k, 26k) y estudiar la relación entre pérdida de entrenamiento y éxito en robot real.
- Punto de partida para nuevos ajustes finos: al ser un fine-tune de GR00T N1.7-3B con LeRobot 0.6.0, sirve como inicialización para añadir tareas nuevas sobre el mismo robot y la misma convención de acción.
- Investigación en representaciones de rotación: el modelo permite evaluar empíricamente si la codificación relativa a pinza hacia abajo mejora la estabilidad del control frente al rotvec absoluto, gracias a que el plugin de LeRobot aplica la conversión de forma explícita.
- Validación de pipelines de despliegue en hardware real: con `lerobot_robot_panda` y la rama `panda-ee-relative-rotation` de `lerobot_plugins`, el modelo puede servirse contra un Panda físico para probar latencias, tasas de control y recuperación ante fallos.
- Recogida de datos asistida y aumentación: las políticas entrenadas con `state dropout` 0,2 y chunks de 40 acciones son útiles como generador de trayectorias candidatas para preetiquetar nuevas demostraciones en tareas de pick-and-place.
- Demostraciones docentes en robótica: el tamaño contenido (3,14 mil millones de parámetros) y el uso de un único A100 para el entrenamiento lo hacen viable como caso de estudio en cursos de aprendizaje por imitación.
- Estudio de sobreajuste y escalado en datasets pequeños: con 271 episodios y ~122 épocas, es un caso claro para analizar cuánta generalización se obtiene frente a la memorización de posiciones de objeto y de escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito en robot real, evaluaciones tipo MMLU, HumanEval o GSM8K (no aplicables a un modelo de acción), ni comparaciones cuantitativas con otras políticas. Los únicos datos numéricos publicados son métricas de entrenamiento:

| Checkpoint | Paso | Pérdida de entrenamiento |
|---|---|---|
| Repositorio `..._16k` (este modelo) | 16.000 | ~0,007 |
| Revisión `step-20000` del repositorio final | 20.000 | ~0,005 |
| Revisión `main` del repositorio final | 26.000 | ~0,003 |

Datos de entrenamiento asociados: 271 episodios, 39.573 fotogramas a 10 fps, batch 192, ~5 millones de muestras y ~122 épocas.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo derivado del recuento de parámetros, no confirmado por el autor): en bf16, unos 6,3 GB solo para pesos; en fp32, unos 12,6 GB. Sumando activaciones de dos imágenes de 640x480 y la cabeza DiT con `chunk_size` 40, es razonable reservar del orden de 10-16 GB.
- GPU de datacenter: A100 80 GB es la GPU usada para el entrenamiento del checkpoint final; también son adecuadas H100 y L40S. Una A100 40 GB debería ser suficiente para inferencia en bf16.
- GPU de consumo: cabe previsiblemente en RTX 4090 y RTX 3090 (24 GB) en bf16; en tarjetas de 16 GB (RTX 4080, RTX 4070 Ti Super) el margen es ajustado y no está verificado.
- Opciones de despliegue: LeRobot 0.6.0 con PyTorch es la vía documentada, sirviendo la política contra un Franka Panda mediante `lerobot_robot_panda` y el plugin `hsp-iit/lerobot_plugins` (rama `panda-ee-relative-rotation`). No hay soporte documentado en vLLM, TGI, llama.cpp ni Ollama, ya que el modelo emite acciones y no texto.
- Latencia y throughput: no disponibles. Como referencia de control, un chunk de 40 acciones a 10 fps cubre 4 segundos de trayectoria por inferencia, pero la frecuencia real del bucle de control depende del robot y del servidor de políticas.
- Almacenamiento: el repositorio ocupa 12,6 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `PANDA-HSP/groot17-panda-ee-ben_multitask_relrot_16k` (este) | 3,144 mil millones | no disponible | Fine-tune sobre 6 tareas Panda, 271 episodios, 39.573 fotogramas | no disponible | Público en HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| `nvidia/GR00T-N1.7-3B` (modelo base) | ~3 mil millones (el recuento exacto no está en la información disponible) | no disponible | Modelo fundacional generalista de NVIDIA | no disponible | Público en HuggingFace |
| `PANDA-HSP/groot17-panda-ee-ben_multitask_relrot` (checkpoint final 26k) | 3,144 mil millones (mismo modelo, otro paso) | no disponible | Mismo dataset, 26.000 pasos, pérdida ~0,003 | no disponible | Público en HuggingFace |

No se dispone de datos sobre otras alternativas de la misma categoría (por ejemplo políticas VLA de otros autores) en la información proporcionada, por lo que no se incluye comparación cuantitativa con ellas. La búsqueda web realizada no devolvió ningún resultado relacionado con robótica o aprendizaje automático.

## Limitaciones y advertencias

- Licencia no disponible: no puede confirmarse la legalidad del uso comercial ni de la redistribución. Al ser un derivado de `nvidia/GR00T-N1.7-3B`, podrían aplicar condiciones adicionales del modelo base que no se documentan aquí.
- Espacio de tareas cerrado: el modelo solo ha visto seis tareas. La instrucción de inferencia debe coincidir exactamente con las cadenas entrenadas (`put_coffee`, `close_machine`, `picnic_bread`, `pear_bread`, `toast_prep_step1`, `toast_prep_step2`); cualquier variación no está evaluada.
- Dependencia estricta del setup físico: brazo Franka Panda, flange `panda_link8`, pinza concreta, dos cámaras RGB de 640x480 en las posiciones del dataset y control a 10 fps. Cambiar cámaras, montaje o herramienta invalida la política.
- Riesgo alto de error si se ignora la convención de rotación: usar el rotvec absoluto en lugar de `rotvec(Rx(pi)^T * R)` o no aplicar la inversa `R = Rx(pi) * exp(ee.w*)` produce fallos de control graves.
- Sobreajuste probable: ~122 épocas sobre 271 episodios y 39.573 fotogramas es un régimen de repetición muy alto, con pérdidas finales de 0,003-0,007. Es esperable una generalización limitada a posiciones, iluminación y apariencia de objetos vistas en el dataset.
- Sesgos de escena no medidos: el dataset es una fusión de conjuntos privados, por lo que no se pueden auditar la distribución de objetos, superficies, iluminación ni el balance entre tareas.
- Alucinación y seguridad física: no hay evaluación publicada de comportamiento ante entradas fuera de distribución ni de mecanismos de parada segura; el modelo debe desplegarse bajo supervisión y con límites de fuerza y de espacio de trabajo.
- Idiomas: no se documenta ningún soporte multilingüe y las instrucciones del dataset están en inglés.
- Reproducibilidad limitada: el dataset de entrenamiento (`PANDA-HSP/ben_panda_ee_merged_relrot`) es privado, así que el ajuste fino no puede replicarse exactamente.
- Sin benchmarks ni tasas de éxito: no hay evidencia publicada de rendimiento en robot real para este checkpoint ni para el de 26.000 pasos.
- Consistencia de nombres confusa: el repositorio se llama `..._16k` y contiene el paso 16.000, mientras que el repositorio gemelo aloja el estado final de 26.000 pasos. Conviene verificar qué revisión se descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PANDA-HSP/groot17-panda-ee-ben_multitask_relrot_16k
- Repositorio hermano con el checkpoint final (26.000 pasos): https://huggingface.co/PANDA-HSP/groot17-panda-ee-ben_multitask_relrot
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento (privado, citado en la model card): `PANDA-HSP/ben_panda_ee_merged_relrot`
- Plugin de LeRobot con el soporte de rotación relativa (rama `panda-ee-relative-rotation`): https://github.com/hsp-iit/lerobot_plugins
- Librería LeRobot (versión 0.6.0 usada en el entrenamiento): https://github.com/huggingface/lerobot
- Resultados de la búsqueda web: no se encontró ningún enlace relevante; los resultados devueltos corresponden al animal panda (Wikipedia, zoologiste.com, TF1+) y no guardan relación con este modelo.
