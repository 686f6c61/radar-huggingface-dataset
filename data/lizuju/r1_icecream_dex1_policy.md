# lizuju/r1_icecream_dex1_policy

## Resumen

`lizuju/r1_icecream_dex1_policy` es una política visuomotora entrenada por imitación para el robot humanoide Unitree R1-A7, especializada en una única tarea: servir helado blando. El modelo combina un encoder ACT (Action Chunking Transformer) con un cabezal de decodificación basado en rectified flow (flow matching), sustituyendo el decodificador de acciones original de ACT. El autor es `lizuju` y el checkpoint publicado corresponde al paso 30.000 de entrenamiento (ronda 10).

La tarea es concreta y encadenada: el gripper derecho Dex1-1 recoge un vaso, la cintura gira hacia la máquina, la mano izquierda Linker O6 acciona la palanca, el robot gira de vuelta y deja el vaso. El modelo consume cuatro cámaras (dos de cabeza, dos de muñeca) y un estado articular de 24 dimensiones, y produce chunks de 80 pasos a 40 Hz (2 segundos) de objetivos articulares de 24 dimensiones.

Es relevante como ejemplo de política robótica open source con licencia MIT que documenta resultados reales en hardware, incluyendo el hallazgo de que checkpoints con menor pérdida de validación rinden peor en el robot (sobreajuste a métricas offline). El repositorio ocupa 0,2 GB y contiene el checkpoint completo en PyTorch con estado de optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (ResNet + transformer encoder de 4 capas, hidden 512, 8 cabezas, FF 3200) con cabezal de decodificación rectified-flow de 4 capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 4 cámaras + estado de 24-D, salida de chunks de 80 pasos |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch completo, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, checkpoint completo con modelo, normalización, esquema de dataset, config y estado de entrenamiento) |

## Arquitectura y entrenamiento

El modelo parte de un encoder ACT con backbone de imágenes ResNet y un transformer encoder de 4 capas (hidden 512, 8 cabezas de atención, feed-forward 3200). El decodificador de acciones original se reemplaza por un cabezal de rectified flow de 4 capas que integra el campo de velocidad en 10 pasos Euler partiendo de un ruido fijo, de modo que la misma observación produce siempre el mismo chunk (determinismo en inferencia). Las entradas son 4 cámaras (`head_left`, `head_right`, `left_wrist`, `right_wrist`) con letterbox a 320x384 RGB y un estado articular de 24-D. Las salidas son chunks de 80 pasos a 40 Hz (2 s) con objetivos de 24-D: brazo izquierdo 7, brazo derecho 7, mano O6 izquierda 6, gripper Dex1 derecho 1 y cuerpo 3 (cintura y cabeza).

El entrenamiento usa 72 grabaciones teleoperadas (incluyendo intervenciones DAgger), con pausas superiores a 4 s recortadas y segmentos no grabados de 1 frame puenteados. El conjunto resultante tiene 117.964 frames de entrenamiento y 10.012 de validación de grabaciones reservadas. Batch 2 con acumulación de gradiente de 4 pasos, lr 1e-4 (backbone 1e-5), weight decay 1e-4 y semilla 42. El checkpoint publicado es el paso 30.000 (L1 de validación 0,2299); el entrenamiento continuó hasta el paso 69.000, pero los checkpoints 47.000 y 58.000, con menor pérdida de validación, rindieron peor en el robot (se saltaban el alcance a la parte superior de la palanca).

## Capacidades

- Generación de trayectorias visuomotoras de 24-D para el Unitree R1-A7 a partir de 4 cámaras y estado articular.
- Ejecución encadenada de una tarea de manipulación de largo horizonte (recoger vaso, girar cintura, accionar palanca, volver, dejar vaso).
- Coordinación bimanual asimétrica: gripper Dex1-1 a la derecha y mano Linker O6 de 6 grados de libertad a la izquierda.
- Control de cintura y cabeza (3 dimensiones corporales) además de brazos y manos.
- Inferencia determinista con 10 pasos Euler de rectified flow sobre un ruido fijo.
- Soporte de ensemble temporal ACT por defecto (pesos `exp(-0.01 i)`) y retención de cintura (*waist hold*).
- Modo sombra (*shadow mode*) sin comandos al robot para validación previa.
- Sin capacidades lingüísticas, de tool calling, de agentes ni multimodales fuera de las cámaras de robot.

## Casos de uso

- Servicio automatizado de helado blando: es el caso de uso directo y validado; el modelo ejecuta la secuencia completa de recogida de vaso, accionamiento de palanca y entrega, con tiempos de 70-100 s frente a 47-67 s de un operador humano.
- Investigación en imitación con flow matching: sirve como referencia reproducible para comparar cabezales de flow frente a decodificadores discretos de ACT en tareas de manipulación real.
- Estudio de la brecha entre métricas offline y rendimiento en hardware: el propio autor documenta que checkpoints con menor L1 de validación fallan en el robot, lo que lo convierte en un caso útil para investigar selección de checkpoints.
- Base para fine-tuning en tareas de manipulación con el mismo robot: al publicarse el checkpoint completo con estado de optimizador y esquema de dataset, puede reutilizarse como inicialización para tareas análogas con el R1-A7.
- Evaluación de políticas con ensemble temporal: permite medir el efecto del ensemble `exp(-0.01 i)` y del *waist hold* en la estabilidad de ejecución sobre hardware real.
- Docencia y demostraciones de robótica de imitación: el modo sombra y los scripts de ejecución (`tools/run_r1_act_policy.py`) permiten reproducir la política sin comandar el robot, útil en entornos de laboratorio.
- Benchmark de coordinación bimanual: la asimetría entre gripper de 1 GDL y mano de 6 GDL ofrece un escenario concreto para evaluar políticas bimanuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los únicos datos de rendimiento son los resultados en robot:

| Metrica | Valor |
|---|---|
| Tasa de exito en robot | 5 de 8 ejecuciones completas |
| Fallos | 1 fallo de agarre de palanca, 2 detenciones por el operador antes de accionar la palanca |
| Tiempo de ejecucion | 70-100 s (operador humano: 47-67 s) |
| L1 de validacion (paso 30.000) | 0,2299 |
| Frames de entrenamiento / validacion | 117.964 / 10.012 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 0,2 GB e incluye estado de optimizador, por lo que el checkpoint de inferencia es sustancialmente menor. Con backbone ResNet y transformer de 4 capas (hidden 512), es probable que quepa en GPUs de consumo, aunque no se confirma en la información disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de arquitectura es plausible, pero el dato no está publicado.
- Opciones de despliegue: script específico `tools/run_r1_act_policy.py` del fork `xr_teleoperate` con soporte de flow-head; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible; la política opera a 40 Hz con chunks de 80 pasos e integración de 10 pasos Euler, pero no se publican tiempos de inferencia por chunk.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lizuju/r1_icecream_dex1_policy` | ACT + rectified flow | no disponible | chunks de 80 pasos a 40 Hz | MIT | Hugging Face |
| ACT original (Zhao et al.) | Transformer con decodificador discreto | no disponible | chunks configurables | MIT (referencia) | Repo público |
| Diffusion Policy (Chi et al.) | Política de difusión | no disponible | horizonte de acción configurable | MIT (referencia) | Repo público |
| Modelos comparables específicos para Unitree R1 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparaciones cuantitativas publicadas entre esta política y alternativas sobre el mismo robot y tarea.

## Limitaciones y advertencias

- Política de tarea única: solo sirve helado blando con el Unitree R1-A7; no generaliza a otras tareas ni robots sin reentrenamiento.
- Tasa de éxito del 62,5 % (5 de 8) en la evaluación publicada, con 2 detenciones por el operador; no es apta para producción sin supervisión.
- Selección de checkpoint contraintuitiva: los checkpoints con menor pérdida de validación (pasos 47.000 y 58.000) fallan en el robot, lo que indica que la métrica L1 offline no es fiable para elegir el modelo desplegado.
- Dependencia de hardware específico: requiere el fork `xr_teleoperate` con soporte de flow-head y el robot Unitree R1-A7 con gripper Dex1-1 y mano Linker O6.
- Sin datos de sesgos, alucinación o comportamiento fuera de distribución más allá de los fallos observados; el modelo no genera lenguaje, por lo que los riesgos de sesgo lingüístico no aplican.
- Idiomas: no aplica; no hay capacidades de texto.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el uso en producción robótica requiere validación propia.
- El dataset público `gavinleele/r1_icecream_dex1` incluye 14 grabaciones de bajo alcance excluidas del entrenamiento; reproducir exactamente el modelo requiere filtrar esas grabaciones.

## Enlaces

- Hugging Face: https://huggingface.co/lizuju/r1_icecream_dex1_policy
- Dataset: https://huggingface.co/datasets/gavinleele/r1_icecream_dex1
- Script de ejecución: `tools/run_r1_act_policy.py` en el fork `xr_teleoperate` (referenciado en la model card; no se proporciona URL directa)
- Paper de ACT (referencia de arquitectura): no disponible en la información proporcionada
- Paper de rectified flow (referencia del cabezal): no disponible en la información proporcionada
