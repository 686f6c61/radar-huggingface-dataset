# Samisaliveagain/piper-hexbolt-smolvla-bs64-step18000

## Resumen

Piper Hex-Bolt SmolVLA (checkpoint de 18.000 pasos, batch 64) es una política de imitación para robótica manipulativa entrenada sobre la arquitectura SmolVLA de la librería LeRobot. El modelo resuelve una única tarea de ensamblaje: coger un perno hexagonal y colocarlo en la ranura correspondiente. Lo publica el usuario Samisaliveagain junto con el dataset de 100 demostraciones `piper-hexagonal-bolt-insertion-100-demos-v1`, y está pensado para ejecutarse sobre un brazo AgileX Piper follower.

Técnicamente es un modelo visión-lenguaje-acción (VLA) compacto, con 450.046.176 parámetros (unos 450 M) y 1,2 GB de repositorio. Consume siete valores de articulación y pinza más dos cámaras RGB (cenital y en ángulo) y emite siete objetivos absolutos para el follower, con articulaciones en grados y pinza en milímetros, en forma de *action chunk* de 50 acciones.

Su relevancia es acotada pero clara: demuestra el flujo completo de entrenamiento y publicación de políticas VLA pequeñas para hardware asequible, con trazabilidad explícita del paso de entrenamiento y verificación de hashes SHA-256 de los pesos. Es un artefacto de investigación reproducible, no un modelo de propósito general: no se ha publicado ninguna tasa de éxito física ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción, familia LeRobot); detalles internos de capas no disponibles en la información proporcionada |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje conversacional. Ventana de observación por paso: 7 valores de articulación/pinza + 2 cámaras RGB (resolución no disponible) |
| Tipos de cuantización | no disponible; el repositorio solo publica `model.safetensors` sin variantes cuantizadas |
| Idiomas soportados | no disponible (política robótica de tarea fija; no se documenta entrada de instrucciones en lenguaje natural) |
| Licencia | no disponible; la model card indica explícitamente que esta subida no asigna ninguna licencia nueva |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `train_config.json`, `training_step.json`, `checkpoint_info.json`, `publication_manifest.json` y configuraciones/tensores de normalización de pre y postprocesado |
| Librería / pipeline | `lerobot` / `robotics` |
| Robot objetivo | AgileX Piper follower |
| Entradas | 7 valores de articulación y pinza + cámara RGB cenital + cámara RGB en ángulo |
| Salidas | 7 objetivos absolutos del follower (articulaciones en grados, pinza en milímetros) |
| Action chunk | 50 acciones |
| Paso de entrenamiento guardado | 18.000 actualizaciones del optimizador (objetivo de la ejecución: 20.000) |
| Batch de entrenamiento | 64, con 1 proceso |
| Dataset | `Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1`, revisión `1ec623d82a1f70c70f1d769c38334799d122db77` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-20 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia SmolVLA, una arquitectura visión-lenguaje-acción de escala reducida (~450 M de parámetros) que combina un codificador visual y lingüístico con un cabezal generador de acciones. La información disponible no detalla la configuración interna de capas, el número de tokens de visión ni el mecanismo exacto de generación de acciones más allá del *action chunking* de 50 pasos, por lo que esos extremos se marcan como no disponibles. La salida es de regresión continua en el espacio articular (7 dimensiones, valores absolutos), no discreta.

El entrenamiento es de imitación supervisada sobre 100 demostraciones de teleoperación del dataset citado: 18.000 actualizaciones con batch 64 en un solo proceso, sobre un objetivo de 20.000. El campo `pretrained_path` de la configuración termina en `000050/pretrained_model`, lo que indica que el entrenamiento partió de un checkpoint preentrenado (o de una reanudación) en el paso 50. No se documenta el uso de RLHF, DPO, aumento de datos ni composición detallada del dataset. Los pesos se entrenaron únicamente con el dataset de 100 demostraciones; el dataset posterior de 80 demostraciones "zero-home" no se utilizó. La publicación incluye verificación criptográfica: los siete ficheros de política y procesadores coinciden con los hashes SHA-256 de la auditoría de descarga local, y el paso se contrasta contra `training_state/training_step.json`. No se incluyen estados de optimizador, scheduler ni RNG, por lo que el checkpoint no es reanudable de forma exacta.

## Capacidades

- Manipulación robótica de una sola tarea: recogida e inserción de un perno hexagonal en la ranura correspondiente.
- Política de imitación con *action chunking* de 50 acciones, lo que reduce la frecuencia efectiva de inferencia necesaria para el control.
- Fusión de dos vistas RGB (cenital y en ángulo) con el estado propioceptivo de 7 articulaciones y pinza.
- Salida de objetivos articulares absolutos en grados y apertura de pinza en milímetros, directamente consumible por el controlador del Piper.
- Carga e inferencia mediante `SmolVLAPolicy.from_pretrained` de LeRobot, con pre y postprocesadores y tensores de normalización incluidos.
- Trazabilidad de procedencia: hashes de ficheros, paso de entrenamiento verificado y manifiesto de publicación.
- No soporta *tool calling*, function calling, razonamiento multi-paso, agentes ni generación de texto libre.
- No se documenta capacidad multilingüe ni seguimiento de instrucciones en lenguaje natural.
- No se documentan capacidades de visión general (VQA, OCR, descripción de imágenes); el codificador visual se usa solo como parte de la política.

## Casos de uso

- **Inserción de pernos en una célula de ensamblaje**: el caso de uso directo. La política toma las dos cámaras y el estado articular y produce 50 objetivos absolutos por inferencia, adecuados para un lazo de control de baja frecuencia sobre el Piper.
- **Punto de partida para *fine-tuning* en tareas de inserción similares**: al ser un checkpoint de 450 M con pesos en safetensors y configuración de LeRobot completa, sirve para inicializar o continuar el entrenamiento con nuevos datasets de ensamblaje, reduciendo el coste frente a entrenar desde cero.
- **Ablation de pasos de entrenamiento**: al existir un objetivo de 20.000 pasos y este corte en 18.000, permite estudiar la curva de rendimiento entre checkpoints intermedios y finales manteniendo batch y dataset constantes.
- **Reproducción de experimentos de imitación**: los hashes verificados y la revisión exacta del dataset permiten replicar la evaluación en un entorno con el mismo montaje de cámaras, unidades y bloqueo de la articulación 4.
- **Despliegue en hardware de borde para prototipos**: con ~450 M de parámetros, el modelo es candidato a ejecutarse en GPUs de consumo o módulos embebidos tipo Jetson dentro de un banco de pruebas de laboratorio, sin depender de servidores de inferencia.
- **Generación de datos y evaluación comparativa de políticas**: útil como referencia en pipelines internos que comparan políticas de imitación (ACT, Diffusion Policy, SmolVLA) sobre una misma tarea de inserción con métrica de éxito homogénea.
- **Docencia y prácticas de robótica de imitación**: el par modelo + dataset + configuración de entrenamiento constituye un ejemplo completo y de tamaño manejable para ilustrar el ciclo demostración-entrenamiento-despliegue.
- **Pruebas de robustez perceptiva**: permite evaluar la degradación de la política ante cambios de iluminación, oclusión o reubicación de las cámaras, siempre que se respete la geometría de calibración original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasa de éxito de inserción física, número de intentos, métricas de error posicional ni comparaciones cuantitativas con otras políticas. La única verificación declarada es de integridad (hashes SHA-256 de los siete ficheros de política y procesadores) y de procedencia del paso de entrenamiento (18.000, contrastado con `training_state/training_step.json`). Cualquier cifra de rendimiento que se atribuya a este checkpoint sin una evaluación propia no está respaldada por la publicación.

## Requisitos de hardware

- **VRAM estimada para los pesos**: ~1,8 GB en fp32 y ~0,9 GB en bf16 (450 M de parámetros). El repositorio ocupa 1,2 GB.
- **VRAM estimada para inferencia completa**: no disponible con precisión, ya que se desconoce la resolución de las dos cámaras de entrada y el número de tokens visuales. Como referencia de orden de magnitud, el conjunto pesos + activaciones de dos vistas suele situarse en el rango de 2 a 4 GB en bf16.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o L4 para prototipado; A100/H100 no son necesarias por tamaño, solo justificables por número de instancias concurrentes.
- **¿Cabe en GPU de consumo?**: sí, con alta probabilidad, en cualquier GPU con 4 GB o más de VRAM en bf16. También es candidato para Jetson Orin (Nano 8 GB o superior), aunque el rendimiento real no está documentado.
- **Opciones de despliegue**: LeRobot con `SmolVLAPolicy.from_pretrained` sobre PyTorch; servicio de políticas de LeRobot para separar inferencia y control; exportación a ONNX o TensorRT no documentada. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles. La única cifra relacionada es el *action chunk* de 50 acciones, que permite ejecutar la inferencia de forma no bloqueante siempre que el lazo de control consuma el chunk completo antes de solicitar el siguiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Piper Hex-Bolt SmolVLA (este checkpoint) | 450.046.176 | VLA de imitación, tarea única | chunk de 50 acciones; contexto textual no disponible | no disponible (sin licencia asignada en esta subida) | pesos safetensors en HF, 0 descargas |
| SmolVLA base (LeRobot) | ~450 M (misma familia) | VLA preentrenado multi-tarea | no disponible en esta ficha | no verificada en esta ficha | público en HuggingFace |
| ACT (Action Chunking Transformer) | del orden de decenas de millones (no disponible con precisión) | Política de imitación con chunking | horizonte de chunk configurable | no verificada en esta ficha | implementación pública en LeRobot |
| pi0 / pi0.5 (Physical Intelligence) | ~3,3 B (pi0) | VLA de propósito general | no disponible en esta ficha | no verificada en esta ficha | pesos públicos |
| OpenVLA | 7 B | VLA de propósito general | no disponible en esta ficha | MIT (según repositorio público) | pesos públicos |

La comparación relevante no es de rendimiento, porque no hay métricas publicadas para este checkpoint, sino de encaje: frente a un VLA generalista de 3-7 B, este modelo es dos órdenes de magnitud menor, está especializado en una sola tarea y un solo robot, y no requiere infraestructura de servidor. Frente a ACT, comparte el paradigma de imitación con chunking pero incorpora un codificador visión-lenguaje, a costa de un tamaño mucho mayor. Los datos de licencia y contexto de las alternativas deben verificarse en sus repositorios antes de cualquier uso comercial.

## Limitaciones y advertencias

- **Licencia ausente**: la model card afirma explícitamente que la subida no asigna licencia nueva. Sin licencia, no hay permiso claro de uso comercial ni de redistribución; por defecto se aplican las restricciones del autor.
- **Tarea única y embodiment único**: entrenado solo para inserción de perno hexagonal sobre AgileX Piper follower. No se espera transferencia a otro robot, otra geometría de pinza u otra tarea sin reentrenamiento.
- **Sin evidencia de éxito físico**: la publicación verifica el paso de entrenamiento y la integridad de los ficheros, y declara explícitamente que no establece éxito de inserción ni robustez. Cualquier despliegue requiere evaluación propia.
- **Riesgo de sobreajuste**: 100 demostraciones y 18.000 pasos con batch 64 sobre un modelo de 450 M es un régimen con riesgo alto de memorizar el dataset; no se documenta aumento de datos ni validación en entornos no vistos.
- **Checkpoint por debajo del objetivo**: 18.000 de 20.000 actualizaciones previstas, sin información sobre la curva de pérdida ni sobre si el rendimiento seguía mejorando.
- **Dependencia estricta de la calibración**: las salidas son objetivos absolutos en grados y milímetros; requieren la misma configuración de cámaras, las mismas unidades, el bloqueo de la articulación 4 y los límites de robot indicados. Un cambio de montaje invalida la política.
- **Sensibilidad a la revisión del dataset**: el entrenamiento referencia una revisión concreta (`1ec623d...`); usar otra revisión rompe la reproducibilidad.
- **No reanudable**: al no incluir estado de optimizador, scheduler ni RNG, no se puede continuar el entrenamiento exactamente desde este punto.
- **Sin capa de seguridad**: el modelo emite consignas articulares; la limitación de par, colisiones y paradas de emergencia debe implementarse externamente en el controlador.
- **Alucinación en sentido estricto no aplica**, pero sí el equivalente en políticas de imitación: acciones plausibles pero incorrectas ante observaciones fuera de distribución (iluminación, oclusiones, objetos distintos).
- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros que confirmen el comportamiento.
- **Metadatos a verificar**: la fecha de creación indicada (2026-10-20) debe contrastarse con el repositorio antes de citarla.
- **Resolución de cámara no documentada**: impide estimar con precisión VRAM, latencia y frecuencia de control alcanzable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Samisaliveagain/piper-hexbolt-smolvla-bs64-step18000
- Dataset de entrenamiento: https://huggingface.co/datasets/Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1
- LeRobot (librería y política SmolVLA): no se ha encontrado un enlace en la información proporcionada
- Paper de SmolVLA: no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido sobre la aproximación de regímenes casi estacionarios en electromagnetismo), por lo que no se incluyen como enlaces relevantes.
