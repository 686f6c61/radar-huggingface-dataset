# Fatpaper/pi05-piper-tidy-desk-x100

## Resumen

`Fatpaper/pi05-piper-tidy-desk-x100` es un conjunto de tres checkpoints de política robótica basados en π₀.₅ (pi0.5) de Physical Intelligence, publicados por el usuario Fatpaper para experimentación en bucle cerrado sobre un robot Piper de doble brazo. Los tres modelos resuelven la misma tarea —recoger papeles arrugados y bolígrafos de una mesa y depositarlos en un cubo y un lapicero respectivamente— y comparten arquitectura, configuración de entrenamiento y conjunto de 100 layouts, pero difieren en el estilo temporal de los datos sintéticos: velocidad nominal, velocidad acelerada (×1.9) y ejecución paralela de ambos brazos.

El interés del repositorio no está en el modelo en sí, sino en la metodología: los datos de entrenamiento son íntegramente sintéticos, generados por un experto scriptado en simulación y renderizados a aspecto fotorrealista con MiniMax-H3, con selección automática y auditoría ciega de episodios. El autor publica además resultados offline sobre cinco episodios reales reservados, incluida una comparación explícita contra el mismo π₀.₅ entrenado con datos reales y contra una línea base de "no moverse", lo que permite calibrar cuánto aporta realmente la política.

Se trata de pesos de inferencia (JAX/Orbax, EMA, ~12 GB por checkpoint) sin `train_state`, empaquetados con un parche de configuración para el framework SANE. No es un modelo de lenguaje ni un modelo multimodal de propósito general: es una política visuomotora de acción (visión-lenguaje-acción) que consume tres cámaras de 224×224 y un estado articular de 14 dimensiones, y emite 50 pasos de acciones articulares absolutas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | π₀.₅ (pi0.5) de Physical Intelligence, política visión-lenguaje-acción; pesos en JAX/Orbax |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; horizonte de acción de 50 pasos) |
| Tipos de cuantización | no disponible (se distribuyen pesos JAX/Orbax en precisión de entrenamiento) |
| Idiomas soportados | no disponible (prompt de tarea en inglés: `Tidy up the crumpled papers and pens on the desk.`) |
| Licencia | `other` (ver limitaciones) |
| Formato de pesos | JAX/Orbax (`params/`), EMA, ~12 GB por checkpoint; incluye `norm_stats.json` y `_CHECKPOINT_METADATA` |
| Entrada | `state` de 14 dimensiones (6 articulaciones + pinza por brazo) y 3 imágenes de 224×224 (`cam_high`, `cam_left_wrist`, `cam_right_wrist`) |
| Salida | 50 × 14 acciones articulares absolutas (delta inverso aplicado en servidor) |
| Frecuencia de control | 30 Hz |
| Tamaño del repositorio | 37,3 GB (tres checkpoints + parche + checksums) |
| Framework | SANE (commit `c9d724acd746dc521a748577ebe97ec1aa133f66`) + parche RTC de entrenamiento |

## Arquitectura y entrenamiento

Los tres modelos parten del checkpoint oficial `pi05_base` y se ajustan con entrenamiento de parámetros completos (no LoRA), con RTC (real-time chunking) aplicado durante el entrenamiento: prefijo de hasta el 30 % de la secuencia y un 25 % de muestras sin prefijo. La configuración es batch 64, 30 000 pasos, EMA 0.99, semilla 42, y cada modelo se entrena en un nodo de 4 × GB300 durante 3–4 horas. Se entrega el paso final `29999`. El formato de datos replica el de HITdongdong: 14 dimensiones articulares, acción definida como articulaciones del frame siguiente más pinza del frame actual, tres cámaras a 224×224 y 30 Hz.

Los datos son sintéticos en su totalidad. Un experto scriptado estilo DataFarm ejecuta la tarea en simulación siguiendo el orden de objetos y el reparto de brazos de las demostraciones reales (brazo izquierdo al cubo, brazo derecho al lapicero). Los layouts se muestrean a partir de 39 configuraciones canónicas derivadas de 50 episodios reales del dataset `piper_dual_tidy_desk_ros2_shifted`, con perturbaciones de ±4 cm para papeles, ±3 cm y ±0.25 rad para rotación de rotuladores, ±2 cm para cubo y lapicero, y ±2 cm en altura de mesa. Los episodios se renderizan con MiniMax-H3 (control-hybrid, receta DataFarm, 8 semillas por bloque), se seleccionan con gpt-6-astra y se someten a auditoría ciega; los rechazados se reparan una sola ronda. Tras excluir los layouts derivados de los cinco episodios reales reservados, quedan 77 episodios nominales (134 588 frames), 82 acelerados (75 444 frames) y 66 paralelos (46 332 frames). La variante paralela desplaza la secuencia del brazo derecho para que arranque simultáneamente con la izquierda, con velocidad articular limitada a 2,95 rad/s y verificación de no contacto entre brazos (distancia mínima 0,25 m en los 97 layouts que pasan la validación).

## Capacidades

- Ejecución de una única tarea de manipulación bimanual: recogida de papeles arrugados y bolígrafos con depósito en contenedores.
- Control visuomotor de doble brazo a partir de tres vistas (cámara de cabeza y dos cámaras de muñeca).
- Generación de chunks de 50 acciones articulares a 30 Hz, con salida absoluta tras la transformación inversa de delta.
- Acondicionamiento por prompt de tarea en lenguaje natural (un único prompt válido en la práctica).
- Soporte de RTC (real-time chunking) para ejecución con prefijos parciales, lo que permite replanificación a alta frecuencia.
- Tres variantes de política temporal: velocidad nominal, acelerada (~1,9×) y paralela bimanual (~2,7× respecto a la nominal).
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modo de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- **Investigación en aprendizaje por imitación con datos sintéticos**: los tres checkpoints permiten medir directamente la brecha sim-to-real de una política π₀.₅ entrenada solo con renderizado H3 frente a la misma receta con datos reales, usando el checkpoint de referencia del autor como control.
- **Comparativa de estilos temporales en robótica bimanual**: B100, C100 y Cpar100 aíslan el efecto de la velocidad de ejecución y del paralelismo de brazos sobre la tasa de éxito en bucle cerrado, manteniendo constantes arquitectura, layouts y pasos de entrenamiento.
- **Validación de pipelines SANE/openpi**: el repositorio incluye parche de configuración, checksums y ejemplo de arranque de `serve_policy.py`, lo que lo hace utilizable como banco de pruebas para verificar una instalación de SANE con RTC antes de entrenar políticas propias.
- **Prototipado de tareas de recogida y clasificación en mesa**: con el prompt fijo y el espacio de estados de 14 dimensiones, sirve para montar una demo de manipulación bimanual sobre un Piper real en laboratorio, siempre con supervisión y parada de emergencia.
- **Estudio de planificación bimanual concurrente**: Cpar100 exhibe el 100 % de simultaneidad de brazos en layouts paralelos no vistos y solo un 4 % de movimiento espurio del brazo inactivo, lo que lo convierte en una referencia para analizar políticas que aprenden a paralelizar sin demostraciones humanas paralelas.
- **Evaluación de métricas offline para políticas de acción**: los resultados publicados (error absoluto medio a 50 pasos, por tramos y con línea base de "no moverse") permiten reproducir y discutir la validez de las métricas offline frente a la tasa de éxito real.
- **Docencia y divulgación sobre sim-to-real**: el repositorio documenta de forma inusualmente explícita el proceso de generación, auditoría y descarte de episodios, útil como caso de estudio reproducible.

## Benchmarks y rendimiento

Los únicos datos publicados son errores offline sobre 900 frames (cada 10 frames) de cinco episodios reales reservados. La métrica es el error absoluto medio en radianes de las 12 articulaciones, comparando los 50 pasos predichos con la acción humana registrada.

| Modelo | Media 50 pasos | Pasos 1–10 | Pasos 26–50 | Pinza |
|---|---:|---:|---:|---:|
| B100 (nominal, 77 episodios) | 0,072 | 0,020 | 0,101 | 0,014 |
| C100 (acelerado, 82 episodios) | 0,091 | 0,027 | 0,126 | 0,019 |
| Cpar100 (paralelo, 66 episodios) | 0,174 | 0,040 | 0,244 | 0,021 |
| Referencia: π₀.₅ con 45 episodios reales (no incluido) | 0,029 | 0,008 | 0,041 | 0,003 |
| Referencia: mantener posición actual | 0,052 | 0,012 | 0,078 | no disponible |

Generalización a layouts sintéticos no vistos: B100 0,024, C100 0,035, Cpar100 0,050 (línea base estática: 0,059, 0,096 y 0,125 respectivamente). El autor señala que la brecha frente a datos reales se explica mayoritariamente por la diferencia de estilo motor entre el experto scriptado y las demostraciones humanas: alinear el experto por DTW contra la acción humana da 0,100, peor que no moverse (0,049). No se han publicado tasas de éxito en bucle cerrado ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K); no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos EMA son ~12 GB por checkpoint en JAX/Orbax, por lo que se requiere al menos una GPU con memoria suficiente para cargar el checkpoint completo más las activaciones de inferencia.
- GPU recomendadas: no disponible. El entrenamiento se realizó en nodos de 4 × GB300; no se documentan requisitos de inferencia.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de checkpoint (~12 GB) sugiere que podría caber en GPUs de 24 GB, pero no hay datos publicados al respecto.
- Despliegue: servidor `scripts/serve_policy.py` de SANE en el puerto 8000, con `policy:checkpoint` y configuración específica por modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política de acción JAX).
- Latencia y throughput: no disponibles. El control opera a 30 Hz y la salida es un chunk de 50 pasos, pero no se publican cifras de latencia del servidor.
- Almacenamiento: 37,3 GB para el repositorio completo; ~12 GB por checkpoint individual más estadísticas de normalización.

## Comparativa con modelos similares

| Modelo | Base | Datos de entrenamiento | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| B100 / C100 / Cpar100 (este repo) | π₀.₅ `pi05_base`, ajuste completo | 77 / 82 / 66 episodios sintéticos H3, 100 layouts | Limpiar mesa bimanual en Piper | `other` | Pesos públicos en HF, sin `train_state` |
| π₀.₅ con datos reales (referencia del autor) | π₀.₅ `pi05_base`, misma receta | 45–50 episodios reales | Misma tarea | Según repo `Fatpaper/motionforcing-piper-rtc` | Incluido en `Fatpaper/motionforcing-piper-rtc` (`tidy_desk/pi05/29999`) |
| π₀.₅ base original (Physical Intelligence) | — | Datos propietarios a gran escala | Política generalista VLA | Según licencia de openpi | Público vía openpi |

No se dispone de comparación con modelos de otras familias (p. ej. RT-2, OpenVLA) en la información proporcionada; las alternativas anteriores son las únicas referenciadas por el autor.

## Limitaciones y advertencias

- Licencia `other`: no se especifican términos de uso comercial. Es imprescindible revisar las condiciones del modelo base π₀.₅ y de openpi antes de cualquier despliegue productivo.
- Entrenado exclusivamente para una tarea y un robot concretos (Piper de doble brazo, 14 dimensiones, tres cámaras). No generaliza a otras tareas, morfologías ni configuraciones de cámara.
- El prompt de tarea es fijo; no hay evidencia de robustez ante variaciones de instrucción.
- El error offline es alto frente a la referencia con datos reales (0,072 frente a 0,029 en B100) y el propio autor advierte que el error offline no predice la tasa de éxito en bucle cerrado.
- Cpar100 mueve ambos brazos simultáneamente, algo que las demostraciones humanas casi nunca hacen; el contacto entre brazos no se ha validado en hardware real. Riesgo de colisión: exige operación supervisada, parada de emergencia accesible y ejecución ralentizada en las primeras pruebas.
- C100 y Cpar100 ejecutan a ~1,9× la velocidad de las demostraciones; es obligatorio aplicar limitación de velocidad articular en el cliente.
- Los datos sintéticos solo incluyen renderizado del escenario original, sin variaciones de material o iluminación; la robustez ante cambios visuales no está caracterizada.
- La vista de la cámara de cabeza procede de una cámara simulada; el desajuste con la cámara real no se ha cuantificado (la model card se interrumpe en este punto).
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: la política puede generar trayectorias que parecen válidas sin completar la tarea; no hay mecanismo interno de verificación de éxito.
- Sesgos de los datos: los layouts se derivan de 39 configuraciones canónicas de un único operador y escenario, lo que limita la diversidad de estilos y posiciones.
- No incluye `train_state`: no sirve para reanudar entrenamiento, solo para inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fatpaper/pi05-piper-tidy-desk-x100
- Repositorio SANE: https://github.com/Linux-2023/SANE
- Checkpoint de referencia con datos reales y parche RTC de tres tareas: https://huggingface.co/Fatpaper/motionforcing-piper-rtc
- Dataset de demostraciones reales de referencia (HITdongdong): `piper_dual_tidy_desk_ros2_shifted`, versión `1a127a8d018c7cbf1afacc92cd7caaf510ee7272` (no se proporciona URL directa en la información disponible)
- Paper de DataFarm: no disponible en la información proporcionada
- Paper de π₀.₅ / openpi: no disponible en la información proporcionada
