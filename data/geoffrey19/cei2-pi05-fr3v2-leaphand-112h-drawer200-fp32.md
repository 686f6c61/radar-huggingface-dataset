# Geoffrey19/cei2-pi05-fr3v2-leaphand-112h-drawer200-fp32

## Resumen

cei2-pi05-fr3v2-leaphand-112h-drawer200-fp32 es una política robótica de imitación (vision-language-action, VLA) construida sobre la arquitectura pi05 de Physical Intelligence y publicada por el usuario Geoffrey19. El modelo es el resultado de un ajuste fino completo sobre 200 episodios reales de teleoperación en un brazo Franka FR3 de 7 articulaciones equipado con una mano LEAP de 16 articulaciones, para la tarea de abrir un cajón, coger un objeto de la mesa, colocarlo dentro y cerrar el cajón. Parte del checkpoint de mid-training CEI-2.0 `cei2_pi05_fr3v2_leaphand_absq` (paso 50.000), que a su vez deriva de pi05 entrenado sobre 112 horas de demostraciones DROID retargetizadas al par FR3 + LEAP.

El modelo tiene 3.616.757.520 parámetros (812 tensores) en precisión float32 y un tamaño de repositorio de 14,5 GB. Trabaja con un único frame RGB de cámara exterior a 640×480 y un vector de 23 posiciones articulares absolutas en radianes (7 del brazo más 16 de la mano), y predice chunks de 16 pasos de acciones también absolutas. Es relevante porque documenta de forma explícita el pipeline completo de post-entrenamiento de pi05 en hardware real, incluyendo el mapeo de orden de articulaciones entre el dataset original y el modelo robótico, un detalle que suele ser fuente de fallos silenciosos en despliegues de políticas VLA.

La licencia es Apache 2.0 y el formato de pesos es safetensors. No se han publicado métricas de éxito en tarea ni benchmarks estándar: los 200 episodios se usaron íntegramente para entrenamiento, sin split de validación, y el autor no verificó el éxito por episodio a partir de los vídeos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (vision-language-action, flow matching) sobre openpi |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; el autor no documenta variantes GGUF, int8 ni bfloat16 empaquetadas) |
| Idiomas soportados | no disponible (el prompt de tarea está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32, 812 tensores) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi05 de Physical Intelligence, una política VLA que combina un backbone vision-language con un cabezal de flow matching para generar acciones continuas. La entrada es una imagen RGB de 480×640×3 de una cámara exterior más un vector de estado de 23 articulaciones en radianes y un prompt de texto; la salida es un chunk de 16 pasos de 23 acciones articulares absolutas. La normalización se realiza por cuantiles calculados sobre el conjunto de entrenamiento (q01/q99 mapeados a −1/+1) y almacenados en `assets/drawer200/norm_stats.json`.

El post-entrenamiento parte del checkpoint CEI-2.0 `cei2_pi05_fr3v2_leaphand_absq` en el paso 50.000, entrenado sobre 112 horas de demostraciones DROID retargetizadas a FR3 + LEAP (34.274 episodios de vista única, batch 1024 en 32 GPUs). El ajuste fino final usa 200 episodios reales (114.493 frames a 15 Hz) durante 20.000 pasos con batch 32 en una sola GPU, learning rate pico de 2e-5 tras 500 pasos de warmup con decaimiento coseno hasta 1e-6, pesos maestros y estado del optimizador en float32 con autocast bfloat16 y sin EMA. La pérdida media de entrenamiento (objetivo de flow matching) baja de 0,2178 en los primeros 100 pasos a 0,0094 en el tramo 19.000–20.000. Una innovación destacable es la gestión explícita del orden de articulaciones: el modelo opera en un orden en el que `mcp_forward` precede a `mcp_side` en cada dedo, y la configuración aplica la permutación `P = [0,1,2,3,4,5,6,8,7,9,10,12,11,13,14,16,15,17,18,19,20,21,22]` de forma interna, de modo que la política recibe estado y devuelve acciones en el orden del robot.

## Capacidades

- Generación de acciones robóticas de manipulación: chunks de 16 pasos de 23 articulaciones absolutas en radianes para brazo FR3 y mano LEAP.
- Control combinado de brazo y mano diestra: 7 articulaciones de brazo más 16 de mano (4 por dedo índice, medio y anular; 4 en pulgar con nomenclatura `cmc_side`, `cmc_forward`, `mcp`, `ip`).
- Condicionamiento por prompt de lenguaje: la tarea se especifica mediante texto ("Open the drawer, pick up the object from the tabletop, place it inside the drawer, and close the drawer.").
- Percepción visual monocular: una única cámara RGB exterior a 640×480.
- Ejecución de tareas de horizonte largo compuestas: abrir, coger, colocar y cerrar en una sola política.
- Compatibilidad con el ecosistema openpi y LeRobot para carga y despliegue.
- No soporta tool calling, function calling, agentes multi-paso genéricos, visión general, audio ni modo thinking: es una política de imitación específica de tarea.

## Casos de uso

- Automatización de picking y placing en almacén: la política ejecuta la secuencia completa de abrir cajón, coger objeto de la mesa, depositarlo dentro y cerrar, adecuada para celdas de manipulación con FR3 y mano LEAP donde la tarea esté acotada a esa secuencia.
- Investigación en imitación de horizonte largo: sirve como referencia reproducible del pipeline de post-entrenamiento de pi05 sobre hardware real, con configuraciones, estadísticas de normalización y mapeo de articulaciones incluidos.
- Benchmark de recetas de mid-training: al existir el gemelo `cei2-pi05-base-drawer200-fp32` entrenado desde el checkpoint base de pi05, permite comparar el efecto del mid-training CEI-2.0 con la misma receta y los mismos datos.
- Prototipado de manipulación diestra: útil para equipos que evalúan manos LEAP de 16 articulaciones con control por aprendizaje en lugar de control analítico, gracias a la definición explícita del orden de articulaciones.
- Docencia y divulgación en robótica: el repositorio documenta el orden de articulaciones, la permutación y los ficheros requeridos, lo que lo convierte en material didáctico sobre errores típicos de integración (doble aplicación de la permutación, uso de estadísticas en orden incorrecto).
- Base para ajuste fino en tareas de cajón similares: al ser una política completamente ajustada con licencia Apache 2.0, puede reentrenarse sobre nuevas demostraciones del mismo montaje FR3 + LEAP.
- Validación de infraestructura openpi: sirve para verificar la instalación de openpi en el commit `215abfb` con el parche `transformers_replace` y el registro de configuraciones CEI-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que los 200 episodios se usaron íntegramente para entrenamiento, sin split de validación, y que no se verificó el éxito por episodio a partir de los vídeos. La única métrica publicada es la pérdida media de entrenamiento del objetivo de flow matching, que no mide calidad de política:

| Pasos | pi05 desde CEI (este modelo) |
|---|---|
| 0–100 | 0,2178 |
| 4.900–5.000 | 0,0222 |
| 9.900–10.000 | 0,0177 |
| 14.900–15.000 | 0,0113 |
| 19.000–20.000 | 0,0094 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 14,5 GB; con autocast bfloat16 la huella de pesos baja a unos 7,2 GB, pero el autor no publica cifras de VRAM en ejecución.
- GPU recomendadas: no disponible en la información proporcionada; el entrenamiento se realizó en una sola GPU con batch 32, sin especificar el modelo.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamaño de pesos en bfloat16 cabría en GPUs de 24 GB, pero no hay validación publicada.
- Opciones de despliegue: openpi en el commit `215abfb` con el parche `transformers_replace` instalado y la configuración `cei2_pi05_drawer200_absq` registrada; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cei2-pi05-fr3v2-leaphand-112h-drawer200-fp32 (este) | 3,62 B | no disponible | Manipulación FR3 + LEAP, tarea de cajón | Apache 2.0 | Hugging Face |
| Geoffrey19/cei2-pi05-base-drawer200-fp32 | no disponible | no disponible | Misma tarea, partiendo del checkpoint base pi05 | Apache 2.0 | Hugging Face |
| pi05 (Physical Intelligence) | no disponible | no disponible | Política VLA generalista | no disponible | openpi (GitHub) |
| GR00T (referenciado en la model card) | no disponible | no disponible | Política VLA; el autor reporta pérdidas comparativas | no disponible | no disponible |

La comparación con GR00T solo está disponible en forma de pérdida de entrenamiento en las mismas 200 demostraciones (por ejemplo, 0,0161 para GR00T desde CEI frente a 0,0094 para pi05 desde CEI en el tramo 19.000–20.000), sin métricas de éxito que permitan una comparación de calidad.

## Limitaciones y advertencias

- No hay evaluación de éxito en tarea: los 200 episodios se usaron para entrenamiento y no se verificó el éxito por episodio, por lo que no existe evidencia publicada de que la política complete la tarea de forma fiable.
- Especialización estrecha: la política está ajustada a una única tarea, un único montaje (FR3 + LEAP), una única cámara exterior y un prompt concreto; no generaliza a otras tareas ni configuraciones sin reentrenamiento.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: al ser una política de imitación sin verificación de éxito, puede generar trayectorias que parezcan válidas y fallen físicamente.
- Dependencia crítica del orden de articulaciones: aplicar la permutación `P` también en el lado del robot intercambia los pares dos veces y produce acciones incorrectas; además, usar `assets/pi05_h16/norm_stats.json` del dataset (en orden del robot) en lugar de `assets/drawer200/norm_stats.json` (en orden del modelo) invalida la normalización.
- Dependencia de una versión concreta de openpi (commit `215abfb`) y de su parche `transformers_replace`, con un procedimiento de registro manual de la configuración.
- Estado del optimizador no incluido (26 GB), lo que impide reanudar el entrenamiento tal cual.
- Sesgos conocidos: no documentados por el autor; al entrenar solo con 200 demostraciones de un operador y un entorno, es esperable sensibilidad a cambios de iluminación, posición de cámara y objetos distintos.
- Idiomas: no se documenta soporte multilingüe del prompt; el único prompt publicado está en inglés.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación de éxito hace arriesgado desplegarla en producción sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Geoffrey19/cei2-pi05-fr3v2-leaphand-112h-drawer200-fp32
- Modelo gemelo desde el checkpoint base: https://huggingface.co/Geoffrey19/cei2-pi05-base-drawer200-fp32
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Dataset DROID: https://droid-dataset.github.io/
- Dataset de la tarea: `zwx/open_drawer_place_object_close_franka_leap_15hz_absolute_200` (referenciado en la model card; no se proporciona URL directa)
