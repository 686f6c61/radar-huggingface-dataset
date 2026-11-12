# omx-baseline-team/omx-smolvla-clean-48000-20261112

## Resumen

OMX SmolVLA clean 48000 es un ajuste fino (fine-tuning) de la política robótica SmolVLA, desarrollada por LeRobot (Hugging Face), aplicada por el equipo omx-baseline-team sobre el brazo robótico ROBOTIS OMX. El modelo parte del checkpoint base `lerobot/smolvla_base` y se ha entrenado durante 18.000 pasos adicionales (de 30.000 a 48.000) sobre un conjunto de datos propio de 230 episodios a 30 fps. Su tarea concreta es recoger un objeto (azul, verde o rojo) y colocarlo en una zona marcada con una cruz, usando dos cámaras (superior y de muñeca).

La relevancia de esta ficha es doble: por un lado, documenta un caso real de ajuste fino de una política visomotora sobre hardware asequible; por otro, muestra una metodología de limpieza de datos (eliminación de episodios fallidos y recorte de colas inactivas) que mejora el error de imitación en bucle abierto respecto a los checkpoints anteriores del mismo equipo. Con 450 millones de parámetros y licencia Apache 2.0, es un ejemplo práctico de cómo adaptar SmolVLA a un robot específico sin partir de cero.

El modelo no es un LLM ni un modelo de lenguaje: es una política de control robótico que genera secuencias de acciones (chunks de 50 pasos) a partir de observaciones visuales y una instrucción textual. Por tanto, sus especificaciones, capacidades y benchmarks difieren radicalmente de los de un modelo generativo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (política visomotora transformer con encoder de visión congelado y experto de acciones) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de imágenes y chunk de 50 acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp32 en entrenamiento) |
| Idiomas soportados | no disponible (instrucción textual en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

SmolVLA es una política de imitación visomotora que combina un encoder de visión (congelado durante este ajuste) con un experto de acciones que predice chunks de 50 pasos. El entrenamiento se realizó con `train_expert_only`, es decir, solo se actualizaron los parámetros del experto de acciones, manteniendo el encoder visual congelado. Se usó fp32, batch 16, learning rate 1e-4 con AdamW (weight decay 1e-10) y recorte de gradiente de 1.0, durante aproximadamente 5 épocas sobre 57.134 frames muestreados.

El conjunto de datos `local/omx-aggregate-20261110` contiene 230 episodios a 30 fps. Para el entrenamiento se usaron 198 episodios: se excluyeron los episodios 37 y 43 (demos fallidas) y 162 y 213 (que empiezan a mitad de tarea). Una innovación metodológica destacable es el muestreo de frames de observación solo desde el frame 2 hasta (último movimiento + 30), lo que elimina las largas colas inactivas; los objetivos de acción, sin embargo, siguen siendo chunks completos de 50 pasos. La instrucción textual es `Pick up the {blue|green|red} object and place it in the square marked with a cross.` y el mapeo de cámaras es `observation.images.top` → camera1 y `observation.images.wrist` → camera2, gestionado por el preprocesador guardado.

## Capacidades

- Control robótico visomotor: genera secuencias de 50 acciones a partir de imágenes de dos cámaras (superior y de muñeca) y una instrucción textual.
- Manipulación de objetos por color: distingue objetos azules, verdes y rojos y los coloca en una zona marcada.
- Imitación de demostraciones: aprende políticas a partir de episodios teleoperados, no de refuerzo.
- Seguimiento de instrucciones en lenguaje natural (en inglés) para especificar el objeto objetivo.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de pensamiento (thinking), visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo ejecuta la tarea de recoger un objeto por color y depositarlo en una zona marcada, adecuado para prototipos de manipulación con el brazo ROBOTIS OMX.
- Investigación en imitación visomotora: sirve como checkpoint de referencia para comparar metodologías de limpieza de datos y ajuste fino sobre SmolVLA, ya que el repositorio incluye `manifest.json`, `eval_summary.json` y scripts de entrenamiento y evaluación.
- Evaluación de políticas en bucle abierto: el script `eval_checkpoints.py` permite medir el error de imitación sobre conjuntos retenidos, útil para seleccionar checkpoints antes de pruebas físicas.
- Reanudación de entrenamientos: `training_state.pt` conserva el estado del optimizador, lo que facilita continuar el ajuste desde el paso 48.000 con nuevos datos.
- Base para transferencia a otras tareas de manipulación: al estar ajustado sobre SmolVLA, puede servir como punto de partida para fine-tunings en brazos similares con datasets propios.
- Docencia y reproducción de experimentos: la licencia Apache 2.0 y la inclusión de scripts permiten replicar el pipeline de entrenamiento y evaluación en entornos académicos.

## Benchmarks y rendimiento

Evaluación offline en bucle abierto sobre un conjunto retenido de 23 episodios. La métrica es el error medio absoluto entre acción predicha y demostrada sobre el chunk de 50 pasos, normalizado por la desviación típica de acciones de entrenamiento (menor es mejor).

| Modelo | codex3 | all7 | all7 old (5) | all7 new (18) |
|---|---|---|---|---|
| ACT 7800 | 0.2480 | 0.2557 | 0.3579 | 0.2273 |
| SmolVLA 20000 | 0.2733 | 0.2857 | 0.3960 | 0.2551 |
| SmolVLA 30000 | 0.2841 | 0.2830 | 0.4115 | 0.2473 |
| clean 42000 | 0.2102 | 0.2128 | 0.3489 | 0.1750 |
| clean 48000 (este) | 0.2141 | 0.2101 | 0.3427 | 0.1732 |

El checkpoint clean 48000 obtiene el mejor `all7` (0.2101) y el mejor `all7 new` (0.1732), mientras que clean 42000 es ligeramente mejor en `codex3` (0.2102 frente a 0.2141). Los checkpoints entre 38.000 y 48.000 difieren en torno a 0.01, una diferencia que esta evaluación no puede separar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 450 millones de parámetros en fp32, el peso de los pesos ronda 1,8 GB, pero el consumo real depende del encoder visual y del preprocesado.
- GPU recomendadas: no disponible. Por tamaño, una GPU consumer con 8 GB o más debería ser suficiente para inferencia en fp32, pero no se confirma en la documentación.
- Cabe en GPU consumer: probable por el número de parámetros, aunque no está verificado en la información disponible.
- Opciones de despliegue: librería `lerobot` (versión 0.6.1), con scripts `train_clean.py` y `eval_checkpoints.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (all7) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OMX SmolVLA clean 48000 | 450 M | no aplica | 0.2101 | Apache 2.0 | Hugging Face (este repo) |
| SmolVLA 30000 (mismo equipo) | no disponible | no aplica | 0.2830 | no disponible | checkpoint del equipo |
| SmolVLA 20000 (mismo equipo) | no disponible | no aplica | 0.2857 | no disponible | checkpoint del equipo |
| ACT 7800 | no disponible | no aplica | 0.2557 | no disponible | checkpoint del equipo |

La comparativa se limita a los checkpoints del mismo equipo y al baseline ACT, ya que no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La evaluación es de imitación en bucle abierto (offline), no de éxito físico en la tarea real; el error de acción no garantiza que el robot complete la tarea.
- El conjunto retenido se reutilizó para selección de modelo, por lo que no es un test independiente.
- Cada observación usa una única semilla de ruido, lo que reduce la robustez estadística de la comparación.
- Los checkpoints 38.000–48.000 difieren en torno a 0.01, diferencia que la evaluación no puede separar; se recomienda confirmar en el robot real (el 42.000 es el segundo mejor).
- El modelo está especializado en una tarea y un brazo concretos (ROBOTIS OMX) con una instrucción textual fija en inglés; no generaliza a otras tareas sin reentrenamiento.
- No se documentan sesgos, riesgos de alucinación ni comportamiento fuera de distribución más allá de las limitaciones de la evaluación.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener sus propias condiciones; no se detallan en la información disponible.
- No hay información sobre latencia, throughput ni requisitos de hardware verificados para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/omx-baseline-team/omx-smolvla-clean-48000-20261112
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Librería LeRobot: https://github.com/huggingface/lerobot
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
