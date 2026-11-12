# Haku-2004/act_k5e_base_20

## Resumen

`Haku-2004/act_k5e_base_20` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en el Hub mediante la librería LeRobot de Hugging Face. El modelo no es un LLM ni un modelo de lenguaje: es una política visomotora que consume el estado articular del robot y dos flujos de imagen (cámaras frontal y lateral) y produce comandos de acción de 6 dimensiones. El autor es el usuario `Haku-2004` y el repositorio tiene licencia Apache 2.0.

El modelo resuelve una tarea concreta de manipulación, etiquetada como `taskbox`, sobre un robot de tipo `so_follower` (brazo seguidor del ecosistema SO-100/SO-101 de LeRobot). Se entrenó con 20 episodios de teleoperación que suman 25.815 fotogramas a 30 FPS, es decir, aproximadamente 14,3 minutos de datos. La arquitectura es un transformer con codificador visual y decodificador de acciones que predice trozos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso.

Su relevancia es la de un artefacto reproducible de aprendizaje por imitación de bajo coste: 51,7 millones de parámetros, un repositorio de 0,2 GB y entrenamiento en 50.000 pasos con batch de 8. Sirve como referencia práctica para quien quiera replicar el flujo de LeRobot, comparar hiperparámetros o desplegar una política en hardware asequible, no como un modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de imitación; ventana de observación fija por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La política combina un codificador visual (procesa las dos cámaras a 480x640x3) con un transformer que modela la secuencia de observaciones y un decodificador que emite chunks de acciones de forma (6,). La predicción por chunks, junto con el entrenamiento con ruido tipo CVAE sobre las acciones objetivo, mitiga el problema de la varianza en la predicción paso a paso y permite movimientos más suaves y consistentes.

Los datos de entrenamiento provienen del dataset `Haku-2004/k5_20261110_143202`: 20 episodios, 25.815 fotogramas a 30 FPS, una única tarea (`taskbox`) y observaciones de estado de 6 dimensiones más dos cámaras (`front` y `side`). La configuración de entrenamiento fue de 50.000 pasos, batch de 8, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y LeRobot 0.5.2. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos adicionales; tampoco se especifica el número total de tokens ni la composición del dataset más allá de los recuentos de episodios y fotogramas.

## Capacidades

- Control visomotor de un brazo robótico de 6 grados de libertad a partir de dos cámaras RGB y del estado articular.
- Predicción de chunks de acción, lo que produce trayectorias más estables que políticas de acción única.
- Ejecución de una tarea concreta de manipulación (`taskbox`) aprendida por imitación de teleoperación.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de experimentos de imitación: sirve como punto de partida para reproducir el pipeline ACT de LeRobot con un dataset propio de 20 episodios y comparar curvas de entrenamiento con los mismos hiperparámetros (50.000 pasos, lr 1e-05, batch 8).
- Manipulación de objetos tipo caja en laboratorio: la política está entrenada para la tarea `taskbox` sobre un `so_follower`; se puede desplegar en un banco de pruebas con dos cámaras a 640x480 y 30 FPS para evaluar la tasa de éxito antes de escalar a producción.
- Docencia de robótica de bajo coste: el tamaño del repositorio (0,2 GB) y los 51,7 M de parámetros permiten ejecutar la política en equipos modestos, lo que facilita prácticas de aprendizaje por imitación sin clústeres GPU.
- Base para fine-tuning con datos propios: al estar en formato safetensors y ser compatible con `lerobot-train`, se puede reentrenar sobre un dataset ampliado o con variaciones de iluminación y posiciones de objeto.
- Evaluación comparativa de métodos de imitación: útil como referencia ACT frente a políticas tipo diffusion policy o VQ-BeT en el mismo robot y tarea, manteniendo constante el dataset.
- Prototipado de automatización de pick-and-place: la salida de 6 dimensiones se mapea directamente a las articulaciones del `so_follower`, lo que permite integrarla en una celda de montaje sencilla para validar el ciclo completo antes de invertir en hardware industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; por el tamaño (51,7 M de parámetros) es del orden de cientos de MB en precisión de entrenamiento, holgadamente por debajo de 1 GB en la mayoría de configuraciones.
- GPU recomendadas: cualquier GPU con CUDA compatible con PyTorch; el autor entrena con `--policy.device=cuda`. No se especifica un modelo concreto.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros; se puede ejecutar en tarjetas de gama media y probablemente en CPU para inferencia a baja frecuencia, aunque no se documenta latencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=Haku-2004/act_k5e_base_20`; el resto de backends (vLLM, llama.cpp, Ollama, TGI) no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del hardware, de la resolución de las dos cámaras (480x640) y de la frecuencia de control del robot (30 FPS en los datos de entrenamiento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_k5e_base_20` | 51,7 M | no aplica | `taskbox` sobre `so_follower` | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | tareas diversas | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy (referencia LeRobot) | no disponible | no aplica | manipulación visomotora | no disponible | Hugging Face (LeRobot) |
| VQ-BeT (referencia LeRobot) | no disponible | no aplica | manipulación visomotora | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenada con solo 20 episodios y una única tarea (`taskbox`): la generalización a objetos, posiciones o iluminaciones distintas es muy limitada y no está evaluada.
- Sin resultados de evaluación en robot real: no hay tasa de éxito publicada, por lo que no se puede afirmar su fiabilidad en producción.
- Dependiente del hardware: asume un robot `so_follower`, dos cámaras (`front`, `side`) a 480x640 y un estado de 6 dimensiones; cualquier cambio en la configuración de sensores invalida la política.
- Riesgo de sobreajuste al operador y al entorno de recogida de datos (sesgo de demostración); no se documentan medidas de mitigación.
- Sin capacidades lingüísticas ni de razonamiento: no debe usarse para tareas de texto, código o agentes.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de garantías hace desaconsejable su despliegue directo sin validación previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5e_base_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_20261110_143202
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Haku-2004/k5_20261110_143202
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
