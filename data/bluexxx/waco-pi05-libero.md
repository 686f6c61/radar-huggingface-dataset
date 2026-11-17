# Bluexxx/WACO-pi05-LIBERO

## Resumen

WACO-pi05-LIBERO es un checkpoint de política visión-lenguaje-acción (VLA) para manipulación robótica, desarrollado por Wenhao Li y colaboradores (Shandong University, Shenzhen Loop Area Institute, HIT Shenzhen, Xidian University y Fudan University) en el marco del paper *Towards Pose-Robust Few-Shot Vision-Language-Action Models*. El modelo parte del checkpoint público π0.5 de LeRobot afinado sobre LIBERO y aplica WACO (world-anchored canonicalization), una técnica que estima el desplazamiento de cámara y base a partir de un único frame RGB-D y canonicaliza la imagen, el estado, la acción y la pose inicial al frame de calibración.

El problema que resuelve es concreto: un VLA afinado con pocos ejemplos asume que la cámara y la base del robot permanecen exactamente donde estaban durante la recogida de datos. WACO recupera ambos desplazamientos usando el brazo colocado por cinemática directa como objetivo de calibración métrica y la escena estática como ancla del mundo, y afina la política sin modificar su arquitectura bajo los artefactos de su propio estimador (error-aware fine-tuning).

El resultado es una mejora sustancial en el track de cámara de LIBERO-Plus: del 62,5 % del checkpoint público π0.5 al 93,7 % con WACO (fine-tuning con conciencia de error más runtime), sin datos de entrenamiento perturbados. El checkpoint tiene 4.143.404.816 parámetros en bf16, ocupa 9,4 GB y se distribuye como política estándar de LeRobot, lo que permite cargarlo con `PI05Policy.from_pretrained`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (vision-language-action) tal como se implementa en LeRobot, `type: pi05`, sin modificaciones |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (las instrucciones de tarea en LIBERO están en inglés) |
| Licencia | Gemma terms of use (heredada del modelo base); el código del proyecto es Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, bf16) |

## Arquitectura y entrenamiento

La arquitectura es π0.5 sin cambios: no se añade ningún token, cabeza ni parámetro nuevo. La política consume dos imágenes de 256 × 256 (`observation.images.image` en tercera persona y `observation.images.image2` de muñeca), un estado de 8 dimensiones (pose del efector final en el frame de la base y apertura de pinza) y la instrucción de tarea, y produce deltas de efector final de 7 dimensiones con `n_action_steps = 10`. La inicialización es el checkpoint público `lerobot/pi05_libero_finetuned_v044`.

El entrenamiento usa las demostraciones públicas de LIBERO (`lerobot/libero`) sin modificación: una sola pose de cámara y una sola pose de base, sin datos perturbados. El fine-tuning con conciencia de error dura 10.000 pasos con 300 de warm-up, batch global de 32, learning rate 2,5e-5 con decaimiento coseno hasta 2,5e-6, todos los pesos entrenables salvo el embedding de vocabulario, en bf16. La aumentación se aplica dentro del dataset con p_rt = p_s = 0,5: reproyección de ida y vuelta a una cámara virtual aleatoria (hasta 12 cm y 12° por eje) y vuelta con un desplazamiento perturbado por el modelo de error del estimador (8 mm y 0,6°), renderizada como el canal de imagen del runtime en LIBERO-Plus (warp inverso, píxeles no vistos tomados de la referencia de espacio de trabajo vacío), más ruido estructurado de estado (error de desplazamiento planar de base, 8 mm y 0,6°). Las etiquetas de acción no se alteran. La innovación clave es que la política se afina bajo los artefactos exactos de su propio estimador de pose, de modo que el runtime y el entrenamiento quedan alineados.

## Capacidades

- Manipulación robótica de extremo a extremo: genera deltas de efector final de 7 dimensiones a partir de imágenes y estado.
- Control guiado por lenguaje: ejecuta instrucciones de tarea en formato texto (benchmark LIBERO).
- Entrada multimodal: imagen de tercera persona e imagen de muñeca, ambas a 256 × 256.
- Robustez a desplazamientos de cámara y de base del robot gracias al runtime WACO, que estima el desplazamiento al reset y canonicaliza la imagen antes de que llegue a la política.
- Entrada RGB-D en el estimador de calibración: el runtime recupera la pose de cámara y base desde un único frame RGB-D.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, thinking mode, visión general, audio ni capacidades multilingües adicionales.

## Casos de uso

- Manipulación con cámara reposicionada: el modelo mantiene el rendimiento aunque la cámara se mueva respecto a la configuración de recogida de datos, gracias a la canonicalización del runtime que recupera el desplazamiento al reset.
- Robots con base desplazada: si la base del robot no está exactamente en la pose de entrenamiento, WACO estima el desplazamiento planar y canonicaliza estado, acción y pose inicial al frame de calibración.
- Despliegue few-shot en laboratorio: permite afinar un VLA con pocas demostraciones y desplegarlo en montajes físicos ligeramente distintos sin recoger nuevos datos perturbados.
- Evaluación comparativa en LIBERO-Plus: sirve como referencia del track de cámara (1.599 tareas) para medir robustez a pose frente al checkpoint público π0.5.
- Integración en pipelines LeRobot: al ser una política estándar `PI05Policy`, se puede cargar con `from_pretrained` y encadenar con los scripts de evaluación del repositorio WACO.
- Investigación en calibración y estimación de pose: el runtime y el modelo de error del estimador son reutilizables para estudiar la sensibilidad de políticas VLA a errores de calibración.
- Prototipado de control robótico en simulación: el entorno `libero_poseshift` registrado por el plugin permite reproducir los experimentos con semillas controladas.

## Benchmarks y rendimiento

Track de cámara de LIBERO-Plus (1.599 tareas, un episodio cada una), tasa de éxito en %. *Released*: prompts del benchmark que añaden los parámetros de la variante; *corrected*: la instrucción propia de la tarea. Semilla de evaluación 0 / media sobre tres semillas.

| Metodo | Datos perturbados | Released | Corrected |
|---|---|---|---|
| π0.5 public checkpoint | – | 62,5 | 63,8 |
| + WACO runtime (sin entrenamiento) | – | 89,4 / 88,0 | 88,1 / 87,7 |
| **WACO (error-aware fine-tuning + runtime)** — este checkpoint | – | **93,7 / 92,4** | **93,7 / 92,0** |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 4.143.404.816 parámetros en bf16, los pesos ocupan aproximadamente 8,3 GB, a lo que hay que sumar el overhead del runtime y de las imágenes de entrada.
- GPU recomendadas: no disponible; el repo no documenta GPUs concretas.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos en bf16 es plausible en GPUs con 16 GB o más, pero no hay dato oficial.
- Opciones de despliegue: LeRobot (`lerobot[pi,libero]==0.6.1`), con el plugin del repositorio WACO (`scripts/install_plugin.sh`) que registra `--env.type=libero_poseshift`; requiere `opencv-python-headless` y los bundles de calibración (`scripts/download_assets.sh`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (LIBERO-Plus cámara) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WACO-pi05-LIBERO (este) | 4.143.404.816 | no disponible | 93,7 / 92,4 (released), 93,7 / 92,0 (corrected) | Gemma terms of use | Hugging Face, 13 descargas |
| π0.5 public checkpoint (`lerobot/pi05_libero_finetuned`) | no disponible | no disponible | 62,5 (released), 63,8 (corrected) | Gemma terms of use | Hugging Face (LeRobot) |
| π0.5 + WACO runtime (sin entrenamiento) | no disponible | no disponible | 89,4 / 88,0 (released), 88,1 / 87,7 (corrected) | Gemma terms of use | Requiere runtime WACO |

No se dispone de datos de otros VLA comparables (p. ej. OpenVLA, RT-2) en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint está entrenado exclusivamente sobre LIBERO; su generalización a otros entornos, robots o tareas no está documentada.
- Los números de 93,7 / 92,4 solo se obtienen con el runtime WACO activo; sin él, el rendimiento cae al del checkpoint base.
- La aumentación de entrenamiento asume un modelo de error concreto del estimador (8 mm y 0,6°); errores de calibración mayores o de otra naturaleza pueden degradar el rendimiento.
- No hay datos publicados sobre sesgos, tasas de alucinación en instrucciones ni comportamiento fuera de distribución.
- Idiomas soportados no documentados; las instrucciones de LIBERO están en inglés.
- Licencia Gemma terms of use: el uso comercial está sujeto a las condiciones de dichos términos, no a una licencia permisiva estándar.
- El repo tiene 13 descargas y 1 like; es un checkpoint de investigación reciente (creado en noviembre de 2026) sin validación comunitaria extensa.
- Requiere el plugin y los bundles de calibración del repositorio WACO para reproducir los resultados; la política por sí sola no incluye el runtime.

## Enlaces

- Hugging Face: https://huggingface.co/Bluexxx/WACO-pi05-LIBERO
- Página del proyecto: https://peacelwh.github.io/WACO/
- Código: https://github.com/peacelwh/WACO
- Dataset LIBERO-PoseShift: https://huggingface.co/datasets/Bluexxx/LIBERO-PoseShift
- Dataset LIBERO: https://huggingface.co/datasets/lerobot/libero
- Modelo base: https://huggingface.co/lerobot/pi05_libero_finetuned
