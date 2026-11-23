# Dexverse-CSI/groot-n17-xlvla-single-20k

## Resumen

GR00T N1.7 es un modelo fundacional de visión-lenguaje-acción (VLA) desarrollado por NVIDIA para robótica, y esta ficha describe un ajuste fino completo publicado por Dexverse-CSI sobre el checkpoint base `nvidia/GR00T-N1.7-3B`. El modelo resultante, `groot-n17-xlvla-single-20k`, especializa el modelo base en manipulación diestra con un solo brazo y seis manos robóticas distintas (allegro, inspire, leap, shadow, sharpa, wuji) sobre cuatro tareas de agarre. El ajuste se realizó durante 20.000 pasos con un lote global de 128 sobre 4 GPU B200, en precisión bf16 y con una tasa de aprendizaje de 1e-4.

La relevancia de esta publicación es doble. Por un lado, demuestra el ajuste completo de todos los componentes del modelo (LLM, torre de visión, proyector y cabecera DiT de difusión) sobre un conjunto de datos teleoperado de 1.200 episodios a 60 fps. Por otro, establece una comparación directa con la línea base pi0.5 (`Dexverse-CSI/xlvla-pi05`), reutilizando exactamente los mismos datos, prompts y representación de estado/acción, lo que permite aislar el efecto de la arquitectura GR00T frente a pi0.5 en el mismo régimen de entrenamiento.

El modelo tiene 3.144.016.000 parámetros (aproximadamente 3,14 mil millones) y un repositorio de 27,6 GB en formato safetensors. La representación de estado/acción es de 31 dimensiones (posición de muñeca xyz de 3, rotación 6D de 6 y 22 valores de dedos normalizados en el rango [-1, 1] según los límites URDF), con dos cámaras de entrada: tercera persona y montada en la mano (`eye_in_hand`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) GR00T N1.7: LLM + torre de vision + proyector + cabecera DiT de difusion para acciones |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (prompts de tarea en ingles segun los ejemplos de la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Libreria | gr00t (Isaac-GR00T) |
| Horizonte de accion | 10 pasos (delta_indices 0..9); horizonte nativo del modelo 40 |
| Dimension de estado/accion | 31 (wrist xyz 3 + rot6d 6 + dedos 22) |
| Entradas | Camaras `third_person` y `eye_in_hand` + prompt de tarea |
| Tamano del repositorio | 27,6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA, un VLA compuesto por un modelo de lenguaje, una torre de visión, un proyector multimodal y una cabecera de difusión (DiT) que genera las acciones. En este ajuste se entrenaron todos los componentes de forma completa (LLM, visión, proyector y DiT), no solo la cabecera de acción. La salida se normaliza con cuantiles q01/q99 y se entrena con un horizonte de acción de 10 pasos, manteniendo el horizonte nativo de 40 del modelo base sin modificar.

Los datos de entrenamiento provienen de 1.200 episodios de teleoperación (50 por cada una de las celdas `Dexverse-CSI/teleop_*`), con fotogramas a 60 fps sin submuestreo. El estado y la acción se reconstruyeron con el código `cross_dex` de la línea xlvla y una calibración de muñeca medida en simulador (`training/configs/wrist_calib_*.json`); las estadísticas reconstruidas coinciden con las `norm_stats` de xlvla-pi0.5 con una diferencia máxima de 0,0004 en media y 0,0005 en desviación típica. Los vídeos se recodificaron de AV1 a H.264. El prompt es únicamente la frase de la tarea, sin identidad de la mano, con las mismas cadenas que pi0.5.

El procedimiento de entrenamiento usó Isaac-GR00T en el commit `708617f` con `launch_finetune.py`, un embodiment nuevo (`NEW_EMBODIMENT`, configuración `training/configs/dexverse_single_config.py`), claves de acción ABSOLUTE / NON_EEF, lote global de 128 (4 GPU B200 con 32 por GPU), tasa de aprendizaje 1e-4 con warmup del 5% y decaimiento coseno (valores por defecto de GR00T), 20.000 pasos y precisión bf16. La raíz del repositorio corresponde al paso 20.000; los demás pasos guardados están en `checkpoints/<step>/` con solo pesos y no son reanudables.

## Capacidades

- Generación de acciones motoras de manipulación diestra a partir de observaciones visuales (cámara de tercera persona y cámara en la mano) y una instrucción de tarea en lenguaje natural.
- Control de un brazo con seis morfologías de mano distintas (allegro, inspire, leap, shadow, sharpa, wuji) mediante una representación unificada de 31 dimensiones.
- Ejecución de cuatro tareas de agarre: GraspBleach, GraspPan, GraspKettle y FunctionalHammerStrike.
- Condicionamiento por prompt de tarea (frase corta), sin identidad de mano explícita en el texto.
- Predicción de secuencias de acción con horizonte de 10 pasos por inferencia, sobre un horizonte nativo de 40.
- Ajuste completo de los módulos de lenguaje y visión, lo que en principio permite adaptación de la comprensión multimodal al dominio robótico.
- Soporte de tool calling, agentes multi-paso, razonamiento textual general, matemáticas o capacidades de audio: no disponibles como capacidades documentadas en la información proporcionada; el modelo está especializado en control robótico.

## Casos de uso

- Manipulación diestra con una sola mano en laboratorio: el modelo genera comandos de 31 dimensiones (posición, orientación y 22 articulaciones de dedos) a partir de dos cámaras, adecuado para bancos de pruebas con manos Allegro, Inspire, Leap, Shadow, Sharpa o Wuji.
- Evaluación comparativa de arquitecturas VLA: al compartir datos, prompts y estadísticas de normalización con `Dexverse-CSI/xlvla-pi05`, permite medir de forma controlada la diferencia entre GR00T N1.7 y pi0.5 en las mismas tareas.
- Investigación en transferencia entre morfologías de mano: el entrenamiento conjunto con seis manos bajo una representación común facilita estudiar la generalización entre efector final distinto.
- Prototipado de políticas de agarre para objetos domésticos (botella de lejía, sartén, hervidor, martillo): las cuatro tareas cubren agarres de precisión y funcionales con distintos tamaños y formas.
- Reentrenamiento y ajuste fino sobre nuevos conjuntos teleoperados: el repositorio incluye la configuración de embodiment y el script de construcción de datos, lo que sirve de plantilla para adaptar GR00T N1.7 a otras celdas de datos.
- Análisis de calibración cinemática: la inclusión de calibración de muñeca medida en simulador y la verificación de estadísticas frente a pi0.5 permiten auditar la coherencia de la representación estado/acción en pipelines propios.
- Base para ablaciones de horizonte de acción: al mantener el horizonte nativo de 40 pero entrenar con 10 pasos, es un punto de partida para estudiar el efecto del horizonte en la estabilidad de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 3,14 mil millones de parámetros, los pesos en bf16 ocupan aproximadamente 6,3 GB, a los que hay que sumar activaciones, buffers de la torre de visión y del DiT, y las dos secuencias de vídeo de entrada.
- GPU de entrenamiento documentadas: 4 GPU NVIDIA B200 con 32 muestras por GPU y lote global de 128.
- GPU recomendadas para inferencia: no disponibles en la información proporcionada; por tamaño de pesos, una GPU con al menos 16-24 GB de memoria sería el punto de partida razonable, pero no está confirmado por el autor.
- Cabe en GPU de consumo: no confirmado; el tamaño de pesos en bf16 (unos 6,3 GB) sugiere que podría caber en GPU de consumo de gama alta con memoria suficiente, pero no hay datos publicados de latencia ni de consumo real.
- Opciones de despliegue: librería `gr00t` (Isaac-GR00T). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| groot-n17-xlvla-single-20k (este) | 3.144.016.000 | no disponible | VLA de manipulacion diestra, 6 manos x 4 tareas | no disponible | Hugging Face, safetensors, libreria gr00t |
| Dexverse-CSI/xlvla-pi05 | no disponible | no disponible | VLA de manipulacion diestra con los mismos datos y prompts | no disponible | Hugging Face (referenciado en la model card) |
| nvidia/GR00T-N1.7-3B | no disponible (modelo base de 3B) | no disponible | VLA fundacional de robotica de NVIDIA | no disponible | Hugging Face (modelo base) |

La comparación principal es con `Dexverse-CSI/xlvla-pi05`, que comparte datos (1.200 episodios), representación de 31 dimensiones, prompts y estadísticas de normalización; la diferencia es la arquitectura (GR00T N1.7 frente a pi0.5) y el régimen de ajuste completo. No se dispone de métricas de rendimiento comparadas en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está indicada en la información disponible, por lo que no puede confirmarse el uso comercial; debe consultarse el repositorio y la licencia del modelo base `nvidia/GR00T-N1.7-3B`.
- El modelo está especializado en un único embodiment (un brazo, seis manos, cuatro tareas); no es un modelo de propósito general y su comportamiento fuera de esas tareas no está validado.
- El prompt contiene solo la frase de tarea, sin identidad de mano; el modelo debe inferir la morfología a partir de las observaciones, lo que puede limitar la robustez ante manos no vistas.
- Los datos provienen de teleoperación a 60 fps en un entorno concreto; el sesgo de dominio (iluminación, objetos, cámaras) puede degradar el rendimiento en otros entornos.
- Riesgo de alucinación motora: como modelo generativo de acciones, puede producir trayectorias no físicas o inseguras; se requiere validación en simulador y salvaguardas en el robot real.
- Los checkpoints intermedios en `checkpoints/<step>/` contienen solo pesos y no son reanudables para continuar el entrenamiento.
- No se han publicado benchmarks, latencias ni requisitos de VRAM medidos, lo que dificulta estimar el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dexverse-CSI/groot-n17-xlvla-single-20k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Línea base pi0.5 referenciada: https://huggingface.co/Dexverse-CSI/xlvla-pi05
- Repositorio Isaac-GR00T (commit 708617f citado en la model card): no disponible como URL en la información proporcionada
