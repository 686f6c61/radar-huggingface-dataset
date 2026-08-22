# Aether258/pi05_bi_two_tubes_0102_step6000

## Resumen

`pi05_bi_two_tubes_0102_step6000` es un checkpoint de control robótico bimanual basado en la arquitectura `pi05_bi` del framework openpi, entrenado específicamente para una tarea de pick-and-place de dos tubos (uno azul y uno verde) con realimentación táctil. El modelo lo publica el usuario Aether258 y se distribuye a través del ecosistema LeRobot, con licencia Apache 2.0. Es el checkpoint correspondiente al paso 6000 de un entrenamiento planificado a 20.000 pasos, seleccionado por haber obtenido la menor pérdida de validación sobre datos no vistos (val_unseen) de toda la ejecución hasta el paso 8000.

El modelo integra seis flujos de entrada: dos cámaras RGB (`camera0`, `camera1`) y cuatro sensores táctiles (dos por cada brazo), lo que permite al sistema combinar información visual y táctil para resolver la secuencia de manipulación. La tarea se define con una única instrucción en inglés que especifica el orden exacto de las acciones: primero recoger el tubo azul con la mano izquierda, luego el verde con la derecha, y posteriormente colocarlos de vuelta en el mismo orden. Este checkpoint es relevante porque demuestra el uso de modelos de difusión de flujo (flow-matching) sobre una política de visión-lenguaje-acción (VLA) bimanual con entrada táctil, una combinación poco habitual en los conjuntos de datos públicos de robótica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi05_bi (VLA basada en flow-matching sobre modelo de lenguaje) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en formato de entrenamiento) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Parámetros de inferencia en `checkpoint/params/` (formato LeRobot) |

## Arquitectura y entrenamiento

El modelo se basa en la configuración `pi05_bi` de openpi, una variante bimanual de la familia pi0.5. La arquitectura combina un modelo de lenguaje como base (LLM) con un "action expert" que genera acciones de control en formato continuo, y emplea flow-matching como objetivo de entrenamiento en lugar de pérdida de regresión directa. El entrenamiento se realizó con 2 GPUs A100-80GB mediante FSDP, con un batch size de 128 y una tasa de aprendizaje con decaimiento coseno (pico 2.5e-5 hasta 2.5e-6 en 30.000 pasos, con 1.000 pasos de warmup). Se aplicó LoRA con rank 16 sobre el LLM y rank 32 sobre el action expert, mientras que el vision tower se fine-tuneó completamente (el filtro de congelación solo afecta a `.*llm.*`).

Los datos de entrenamiento provienen de dos repositorios de LeRobot v2.1 (`KaiyueChen/two_tubes_01` y `KaiyueChen/two_tubes_02`), fusionados en un único conjunto de 1.019 episodios (802.719 frames a 30 fps). Las imágenes están embebidas en los ficheros parquet (sin vídeos externos). La división de datos separa episodios por repositorio de origen (10% de validación, seed 42) para mantener la mezcla de fuentes en el conjunto de validación. Las estadísticas de normalización (cuantiles q01/q99) se calcularon solo sobre el split de entrenamiento.

## Capacidades

- Manipulación bimanual: ejecuta secuencias de pick-and-place con ambas manos de forma coordinada, siguiendo una instrucción textual que especifica el orden de las acciones.
- Integración de entrada táctil: utiliza cuatro sensores táctiles (dos por cada mano) junto con dos cámaras RGB, lo que permite al modelo adaptar la fuerza y el contacto durante la manipulación.
- Seguimiento de instrucciones en lenguaje natural: la política está condicionada por un prompt en inglés que describe la tarea completa.
- Generación de acciones de control continuo: produce comandos de actuación para los brazos robóticos mediante flow-matching, sin necesidad de discretizar el espacio de acciones.
- Operación en tiempo real: el checkpoint está diseñado para inferencia en bucle de control cerrado, con una frecuencia de muestreo de datos de 30 fps.

## Casos de uso

- Robótica de laboratorio: el modelo puede emplearse en experimentos de aprendizaje por demostración para estudiar la generalización de políticas bimanuales con realimentación táctil, por ejemplo en tareas de ensamblaje o clasificación de piezas.
- Automatización de pick-and-place en entornos controlados: la secuencia de coger y colocar dos tubos es representativa de tareas de logística en células de trabajo; el modelo puede transferirse a otros objetos similares si se reentrena con datos adaptados.
- Investigación en aprendizaje por refuerzo desde demostraciones: el checkpoint sirve como punto de partida para explorar técnicas de fine-tuning sobre tareas derivadas, aprovechando la arquitectura pi05_bi con LoRA.
- Desarrollo de sistemas de teleoperación con feedback táctil: el modelo puede integrarse en sistemas de teleoperación donde el operador proporciona demostraciones y el modelo aprende a replicar la secuencia con sensibilidad al contacto.
- Validación de políticas de control en simulación: antes de desplegar en hardware real, el checkpoint puede usarse en entornos simulados (por ejemplo, con MuJoCo) para evaluar la robustez de la política ante variaciones de pose o iluminación.
- Educación y formación en robótica: el repositorio incluye el estado de optimización y las estadísticas de normalización, lo que permite reproducir el entrenamiento y utilizarlo como caso de estudio en cursos de aprendizaje por demostración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) porque este modelo no es un LLM generalista sino una política de control robótico. La métrica de rendimiento reportada es la pérdida de flow-matching sobre los splits de validación. La tabla siguiente recoge los valores del propio autor:

| Paso | Pérdida train | Pérdida val_seen | Pérdida val_unseen | Gap |
|---|---:|---:|---:|---:|
| 0 | 0.5525 | 0.4968 | 0.5261 | 0.0293 |
| 2000 | 0.0504 | 0.0504 | 0.0608 | 0.0104 |
| 4000 | 0.0475 | 0.0467 | 0.0576 | 0.0109 |
| **6000** | 0.0448 | 0.0437 | **0.0543** | 0.0105 |
| 8000 | 0.0439 | 0.0423 | 0.0550 | 0.0127 |

La pérdida sobre `val_unseen` descendió monótonamente hasta el paso 6000 y luego subió ligeramente (0.0007) en el paso 8000, mientras que `val_seen` continuó mejorando, lo que sugiere un posible sobreajuste a partir del paso 6000. Cada pasada de validación cubre solo ~2.560 frames (unas 3-4 episodios de ~780 frames), por lo que el autor señala que la diferencia está dentro del ruido estadístico.

## Requisitos de hardware

- El entrenamiento se realizó con 2 GPUs A100-80GB, pero la inferencia del checkpoint es considerablemente más ligera.
- Para ejecutar la política en tiempo real (30 fps) se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090) para cargar los pesos del modelo y las dos cámaras sin cuantización.
- El tamaño del repositorio es de 9.6 GB, lo que incluye tanto los pesos de inferencia como el estado del optimizador para reanudar el entrenamiento.
- Opciones de despliegue: el modelo está diseñado para usarse con el framework LeRobot (librería `lerobot`), que ofrece interfaces de inferencia en Python y compatibilidad con sistemas ROS.
- No hay datos públicos sobre latencia o throughput de inferencia; la ejecución en tiempo real depende del hardware y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **pi05_bi (este checkpoint)** | VLA bimanual con flow-matching | no disponible | 2 cámaras + 4 táctiles | Apache 2.0 | Hugging Face |
| **pi0 (base)** | VLA (OpenVLA) | ~55B | 1 cámara | Apache 2.0 | Hugging Face |
| **pi0_single** | VLA unimanual | no disponible | 1 cámara | Apache 2.0 | Hugging Face |

No se dispone de información suficiente para comparar rendimiento numérico con otros modelos de la familia pi0, ya que no se han publicado resultados de evaluación en la misma tarea.

## Limitaciones y advertencias

- **Especialización de tarea**: el modelo está entrenado exclusivamente para la secuencia de pick-and-place de dos tubos con la instrucción fija. No puede generalizar a otras tareas sin un fine-tuning adicional.
- **Dependencia de la instrucción**: se forzó a que los dos repositorios de datos compartieran una única instrucción en inglés; si se introduce una instrucción diferente, el modelo puede no producir las acciones correctas.
- **Robustez limitada**: el checkpoint es un punto intermedio de entrenamiento (paso 6000 de 20.000); no se ha validado en despliegue físico real, solo en términos de pérdida de validación.
- **Sesgo de datos**: los datos provienen de un único tipo de robot bimanual y de un entorno específico (tubos azul y verde); el modelo no generalizará a otros colores, objetos o configuraciones sin reentrenamiento.
- **Riesgo de alucinación**: al ser un modelo de lenguaje condicionado, puede generar acciones incoherentes si la entrada visual o táctil está fuera de distribución, aunque la pérdida de flow-matching mitiga este comportamiento.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el usuario debe verificar que los datos de entrenamiento (repositorios `two_tubes_01/02`) cumplen con sus propios términos de uso.
- **Estado del arte**: no hay evidencia de que el modelo funcione en entornos reales sin una validación exhaustiva; la métrica de pérdida no garantiza el éxito en el hardware físico.

## Enlaces

- Repositorio Hugging Face: [Aether258/pi05_bi_two_tubes_0102_step6000](https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step6000)
- Perfil del autor en Hugging Face: [Aether258 (Aether_Zhang)](https://huggingface.co/Aether258/activity/all)
- Framework openpi (referencia de la arquitectura pi05_bi): [openpi](https://github.com/LeRobot/lerobot) (no se ha confirmado el enlace directo en los resultados de búsqueda)
