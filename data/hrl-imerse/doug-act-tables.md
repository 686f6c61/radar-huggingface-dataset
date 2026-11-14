# hrl-imerse/doug-act-tables

## Resumen

`doug-act-tables` es un checkpoint de política de imitación basado en ACT (Action Chunking with Transformers), la arquitectura de LeRobot para control robótico de manipulación. Lo publica el usuario `hrl-imerse` dentro del proyecto `msong33/hrl_imerse` y está entrenado específicamente para la tarea de trasladar cubos a una bandeja ("cube-to-tray") con el brazo robótico de bajo coste SO-101, usando únicamente la cámara de muñeca a resolución 480x640 y un estado de 6 grados de libertad.

El modelo se entrenó durante 200.000 pasos sobre un dataset exclusivamente simulado (`hrl-imerse/doug-sim-tray-tables`, 9.838 episodios con un 70% de mesas de madera y un 30% de mesas blancas), con `chunk_size` de 60 y 15 pasos de acción ejecutados por chunk. El repositorio incluye el checkpoint final (step 200.000) en la raíz y un checkpoint intermedio (`step_060000/`).

Su relevancia es doble: por un lado, documenta de forma transparente un caso de sim-to-real fallido (el modelo funciona en simulación pero falla en el brazo real por sobrepasar el objetivo y cerrar la pinza en vacío); por otro, sirve como referencia reproducible para quien quiera estudiar el efecto de la textura del entorno y de la ausencia de datos reales en políticas ACT de bajo coste. No es un modelo de lenguaje: sus 51,6 millones de parámetros corresponden a la política de control, no a un transformer generativo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) de LeRobot, con backbone visual ResNet-18 |
| Parametros totales | 51.627.654 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada: imagen 480x640 + estado de 6-dof) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entrada | imagen de camara de muneca 480x640, estado 6-dof |
| Salida | acciones de control (chunk_size 60, n_action_steps 15) |
| Pasos de entrenamiento | 200.000 (checkpoint final) y 60.000 (`step_060000/`) |
| Tamano del repo | 0,4 GB |
| Dataset de entrenamiento | `hrl-imerse/doug-sim-tray-tables` (9.838 episodios, 70% madera / 30% blanco) |
| Batch size | 8 |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder que predice chunks de acciones (secuencias de posiciones articulares) en lugar de acciones individuales, lo que suaviza el control y reduce el compounding error típico de las políticas de imitación. En este caso el encoder visual es una ResNet-18 que procesa la imagen de la cámara de muñeca a 480x640; el estado del robot (6-dof) se concatena como tokens adicionales. El modelo predice 60 acciones por chunk y ejecuta 15 antes de recalcular, con dos modos de inferencia reportados: ejecución directa de 15 pasos (`exec15`) y ensembling temporal con coeficiente 0,01.

El entrenamiento es puramente supervisado por imitación (behavior cloning) sobre el dataset simulado `doug-sim-tray-tables`, con 200.000 pasos y batch de 8. No se reporta RLHF, DPO ni ningún refinamiento por refuerzo, ni tampoco mezcla de datos reales: la model card indica explícitamente "No real data in training". La variación de textura de mesa (70% madera, 30% blanco) parece ser el único eje de domain randomization documentado, lo que resulta insuficiente para cerrar la brecha sim-to-real en este caso.

## Capacidades

- Control robótico de manipulación: genera trayectorias de 6-dof para el brazo SO-101 en la tarea cube-to-tray.
- Percepción visual monocámara: usa únicamente la cámara de muñeca a 480x640, sin cámara externa.
- Predicción de chunks de acción: 60 acciones por inferencia, 15 ejecutadas antes de replanificar.
- Ensembling temporal de predicciones (coeficiente 0,01) como modo alternativo de inferencia.
- Generalización limitada a dos texturas de mesa (madera y blanca) dentro de simulación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni ninguna capacidad fuera del control motor.

## Casos de uso

- Investigación en sim-to-real: el checkpoint sirve como caso de estudio documentado de una política que alcanza un 80% de éxito en simulación y falla en el brazo real; útil para analizar brechas de textura, iluminación y dinámica.
- Baseline reproducible para ACT en SO-101: permite comparar nuevas políticas de manipulación de bajo coste contra un checkpoint público con métricas de éxito declaradas (80% exec15 en sim, semilla 12345).
- Evaluación de estrategias de inferencia: comparar ejecución directa de 15 pasos frente a ensembling temporal (0,01) sobre el mismo checkpoint, ya que la model card reporta resultados para ambos modos.
- Estudio de domain randomization: analizar si la mezcla 70/30 de texturas de mesa es suficiente para transferencia, sirviendo de punto de partida para diseñar experimentos con más variación.
- Docencia y prototipado en robótica de imitación: el tamaño reducido (51,6 M de parámetros, repo de 0,4 GB) permite cargar y ejecutar la política en hardware modesto para prácticas de behavior cloning.
- Auditoría de model cards: ejemplo de documentación transparente de fallos en producción (el autor reporta explícitamente el fallo en el brazo real), útil como referencia de buenas prácticas de reporte.
- Reentrenamiento con datos reales: el checkpoint de 200.000 pasos puede servir de inicialización para fine-tuning con episodios reales del SO-101 y así intentar cerrar la brecha sim-to-real.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (semilla 12345, simulación):

| Checkpoint | Modo de inferencia | Éxito | Episodios |
|---|---|---|---|
| step 200.000 | ensembling 0,01 | 80% | 40 |
| step 200.000 | exec15 | 80% | 40 |
| step 60.000 | exec15 | 75% | 20 |
| step 200.000 | brazo real | fallo (sobrepasa el objetivo, cierra la pinza en vacío) | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,6 M de parámetros en safetensors y un backbone ResNet-18, la huella es del orden de cientos de MB en FP32 (el repo completo ocupa 0,4 GB).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer moderna (RTX 3060 o superior) debería ser suficiente para inferencia.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos unos pocos GB de VRAM, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: LeRobot (framework nativo de la política ACT); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| doug-act-tables | ACT (LeRobot) para SO-101 | 51,6 M | imagen 480x640 + estado 6-dof | no disponible | Hugging Face |
| Otras políticas ACT de LeRobot | ACT | variable según checkpoint | imagen + estado | variable | Hugging Face |
| Políticas Diffusion Policy | diffusion policy | variable | imagen + estado | variable | Hugging Face / LeRobot |

No se dispone de datos de benchmarks comparables entre estas alternativas en la información proporcionada; la comparación cuantitativa de rendimiento entre políticas ACT y Diffusion Policy para SO-101 no está disponible.

## Limitaciones y advertencias

- Brecha sim-to-real confirmada: el autor reporta que el checkpoint de 200.000 pasos falla en el brazo real (sobrepasa el objetivo y cierra la pinza en vacío).
- Ausencia total de datos reales en el entrenamiento, lo que limita la transferencia a entornos físicos.
- Domain randomization mínima: solo dos texturas de mesa (madera y blanca), sin variación documentada de iluminación, posición de cámara u otros factores.
- Métricas de éxito basadas en un único seed (12345) y un número reducido de episodios (40 y 20), por lo que la significación estadística es limitada.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Modelo de control específico para una tarea y un robot concretos (SO-101, cube-to-tray); no es reutilizable como modelo general.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas, ya que no es un modelo de lenguaje.
- El repositorio incluye dos checkpoints (raíz y `step_060000/`); es necesario seleccionar explícitamente cuál se carga.

## Enlaces

- Hugging Face: https://huggingface.co/hrl-imerse/doug-act-tables
- Dataset de entrenamiento: https://huggingface.co/datasets/hrl-imerse/doug-sim-tray-tables
- Repositorio de código y notas: rama `doug/real-table-texture` de `msong33/hrl_imerse`, archivo `assignment2/CLAUDE.md` (no se proporciona URL directa en la información disponible)
- LeRobot (framework): no disponible en la información proporcionada
- Paper de ACT: no disponible en la información proporcionada
