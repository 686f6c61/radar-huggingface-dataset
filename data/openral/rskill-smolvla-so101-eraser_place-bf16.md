# OpenRAL/rskill-smolvla-so101-eraser_place-bf16

## Resumen

`rskill-smolvla-so101-eraser_place-bf16` es un paquete de habilidad robótica (rSkill) publicado por OpenRAL que empaqueta un ajuste fino de SmolVLA para una tarea única: coger un borrador de la mesa y colocarlo sobre una casilla azul marcada en la misma superficie. El modelo subyacente es un vision-language-action de aproximadamente 450 millones de parámetros construido sobre un backbone SmolVLM2-500M de 16 capas con codificador visual congelado y un experto de acción con flow matching. Los pesos son idénticos byte a byte al checkpoint `makermods/smolvla_makermods_eraser_place_unblurry_real_2026-07-31_17-35-54`, sobre el que OpenRAL añade un manifiesto `rskill.yaml` con comprobación de capacidades, alias de cámaras, contrato de unidades articulares y presupuestos de latencia.

El interés del paquete no está en la política en sí, sino en el formato de distribución: convierte un checkpoint de LeRobot en un artefacto desplegable con `openral deploy run`, verificable contra un robot concreto (SO-101 follower) y con un contrato de observación-acción explícito. Es un ejemplo temprano de cómo se están estandarizando las habilidades robóticas como si fueran modelos de lenguaje: pesos, manifiesto, licencia y evaluación reproducible en un solo repositorio de 1,2 GB.

La tarea es deliberadamente estrecha. El modelo solo ha visto una instrucción de entrenamiento y no generaliza a otras. Su valor práctico es servir de referencia para pipelines de manipulación de una sola tarea sobre hardware de bajo coste (brazo SO-101), con dos vistas RGB de 640×480 y salida de chunks de 50 pasos de posiciones articulares absolutas en grados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA: backbone SmolVLM2-500M (16 capas) con codificador visual congelado + experto de acción con flow matching (`expert_width_multiplier 0.75`, 10 pasos de denoising) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de dos imágenes 640×480 + estado de 6 articulaciones) |
| Tipos de cuantización | bf16 (dtype del checkpoint); no se documentan otras cuantizaciones |
| Idiomas soportados | en (una única cadena de tarea en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA combina un backbone vision-language SmolVLM2-500M de 16 capas con un experto de acción entrenado mediante flow matching, que genera chunks de 50 pasos de posiciones articulares absolutas (6-DoF, en grados) a partir de dos vistas RGB y del estado actual. El codificador visual está congelado; el experto de acción usa un multiplicador de anchura de 0.75 y 10 pasos de denoising por chunk. Las dos imágenes de entrada se reescalan internamente a 512×512 con `resize_imgs_with_padding`, por lo que el manifiesto solo exige ≥224×224.

El ajuste fino se realizó durante 20.000 pasos sobre 25 episodios de teleoperación (10.534 fotogramas a 30 FPS) del dataset `makermods/eraser_place_unblurry_real`, con una única cadena de tarea: `"place the erase on the blue square"` (incluido el error tipográfico original). No se documentan fases de RLHF ni DPO. El paquete incorpora Real-Time Chunking (RTC) para gestionar el desfase entre la ejecución del chunk de 1,67 s y el cálculo del siguiente, aunque la información disponible se interrumpe en ese punto y no detalla el mecanismo completo.

## Capacidades

- Manipulación pick-and-place de una sola tarea: coger un borrador y depositarlo sobre una casilla azul en una superficie de mesa.
- Entrada multimodal: dos vistas RGB (cámara frontal fija y cámara de muñeca montada en el brazo) más estado de 6 articulaciones en grados.
- Salida de chunks de acción de 50 pasos con posiciones articulares absolutas en grados, reejecutadas de forma síncrona antes de la siguiente inferencia.
- Control sobre el embodiment `so101_follower` (brazo SO-101 real).
- Alias de cámaras y contrato de unidades articulares gestionados por el manifiesto rSkill.
- Integración con el registro local y el grafo de agentes de OpenRAL mediante `openral prompt` y `openral deploy run`.
- No soporta tool calling, function calling, razonamiento multi-paso ni otras tareas distintas de la entrenada.

## Casos de uso

- Automatización de pick-and-place de laboratorio: colocar piezas pequeñas en zonas marcadas sobre una mesa con un brazo SO-101 de bajo coste, usando el paquete como política lista para desplegar sin reentrenar.
- Banco de pruebas de pipelines VLA: sirve como referencia reproducible para validar cableado de cámaras, contrato de unidades y latencia antes de entrenar políticas propias.
- Docencia e investigación en robótica de manipulación: tarea simple, dataset pequeño (25 episodios) y pesos Apache-2.0 que permiten analizar el comportamiento de SmolVLA con recursos mínimos.
- Evaluación de Real-Time Chunking: el chunk de 50 pasos a 30 Hz cubre 1,67 s, lo que permite medir el efecto del reemplazo de planes en un brazo real en movimiento.
- Integración en un grafo de agentes OpenRAL: el razonador selecciona la habilidad a partir del vocabulario `eraser` / `place` del manifiesto y lanza el objetivo por prompt, lo que permite orquestar esta tarea junto con otras habilidades del registro.
- Verificación de despliegue en producción: `openral rskill check` contrasta el manifiesto con el YAML del robot para detectar incompatibilidades de embodiment o de slots de cámara antes de ejecutar en hardware.
- Reproducción de experimentos: los tests de integración del paquete replican un fotograma real de entrenamiento y comparan el chunk generado con el teleoperado registrado, con un MAE por articulación de 0,15 a 1,46 sobre los 50 pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica numérica documentada es la verificación de cableado del manifiesto: al reproducir un fotograma real de entrenamiento, el chunk generado presenta un MAE por articulación de 0,15 a 1,46 sobre los 50 pasos (el test admite hasta 5,0); si se intercambian los alias de las dos cámaras, el MAE se degrada a 1,04–44,27. La latencia declarada en el manifiesto es de 400 ms y el requisito mínimo de VRAM es de 1,5 GB.

## Requisitos de hardware

- VRAM estimada: 1,5 GB como mínimo según el manifiesto, en bf16.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, cualquier GPU consumer con ≥2 GB de VRAM libre es suficiente (RTX 3060, RTX 4060, RTX 4090, etc.).
- Cabe en GPU consumer: sí, con amplio margen dado el tamaño de 450 M de parámetros.
- Opciones de despliegue: `openral deploy run` con configuración de escena (`scenes/deploy/so101_bench.yaml`), runtime PyTorch; el paquete se distribuye a través de la librería LeRobot.
- Latencia: 400 ms declarados en el manifiesto; el chunk de 50 pasos cubre 1,67 s a 30 Hz, con solapamiento gestionado por Real-Time Chunking.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rskill-smolvla-so101-eraser_place-bf16 | 450 M | 2 vistas RGB 640×480 + estado 6-D | Pick-and-place de una sola tarea (SO-101) | Apache-2.0 | Hugging Face |
| SmolVLA (base, arXiv:2506.01844) | ~450 M | Configurable según ajuste | Política VLA generalista preentrenada | no disponible en la información | Paper y pesos base referenciados |
| makermods/smolvla_makermods_eraser_place_unblurry_real_2026-07-31_17-35-54 | 450 M | Idéntico | Idéntica tarea | Apache-2.0 | Hugging Face |
| Otras rSkill de OpenRAL (p. ej. `rskill-smolvla-franka_panda-libero_spatial-bf16`) | no disponible | no disponible | Manipulación sobre Franka Panda / LIBERO | no disponible | Hugging Face |

## Limitaciones y advertencias

- Política de una sola tarea: entrenada con una única cadena de instrucción. Cualquier paráfrasis (por ejemplo, "place the eraser on the blue square") saca el condicionamiento de lenguaje de la distribución y degrada el comportamiento. Debe usarse la cadena literal, incluido el error tipográfico.
- No generaliza a otros objetos, escenas ni brazos distintos del `so101_follower`.
- El mapeo de cámaras es crítico: intercambiar los alias `front`/`wrist` multiplica el error por articulación hasta 44,27 en la verificación de referencia.
- Las unidades articulares deben estar en grados (escala lerobot SO-ARM); usar radianes rompe el contrato de acción.
- Riesgo de alucinación de acciones fuera de distribución ante cambios de iluminación, fondo u oclusión no representados en los 25 episodios de entrenamiento.
- No se documentan sesgos específicos más allá de los derivados de un dataset de teleoperación pequeño y de un único operador.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y el dataset de origen deben verificarse por separado si se redistribuye.
- La información disponible sobre Real-Time Chunking está truncada; conviene revisar el repositorio de OpenRAL antes de desplegar en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-smolvla-so101-eraser_place-bf16
- Modelo base: https://huggingface.co/makermods/smolvla_makermods_eraser_place_unblurry_real_2026-07-31_17-35-54
- Dataset de entrenamiento: https://huggingface.co/datasets/makermods/eraser_place_unblurry_real
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Repositorio OpenRAL: https://github.com/OpenRAL/openral
