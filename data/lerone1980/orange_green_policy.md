# Lerone1980/orange_green_policy

## Resumen

`Lerone1980/orange_green_policy` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), implementada y publicada mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un robot y dos flujos de imagen (cámara superior y cámara de muñeca) y emite comandos de acción de 6 dimensiones. El modelo resuelve una tarea concreta de manipulación: la clasificación de bloques naranjas y verdes sobre un robot de tipo `so_follower`.

El modelo tiene 51.668.614 parámetros (dato real de los pesos en safetensors) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras que pueden ejecutarse en tiempo real a 30 FPS en hardware de consumo. Se entrenó durante 50.000 pasos con un batch size de 8 sobre un dataset propio de 75 episodios y 56.249 fotogramas teleoperados, con licencia Apache 2.0.

Su relevancia es la de un ejemplo canónico del flujo de trabajo LeRobot: un modelo entrenado de extremo a extremo por un usuario individual, reproducible con los comandos `lerobot-train` y `lerobot-rollout`, y útil como referencia para quien quiera replicar el pipeline ACT en un robot SO-100/SO-101. No dispone de resultados de evaluación publicados ni de descargas, por lo que debe tratarse como una política experimental y no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de imitación; ventana de observación definida por la configuración de entrenamiento, no documentada) |
| Tipos de cuantización | no disponible (pesos en safetensors en precisión de entrenamiento; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo no lingüístico; la tarea se especifica con la cadena "Orange and green block sorting") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza el control. La arquitectura combina un codificador visual (procesa las dos cámaras de 3×480×640), un codificador del estado articular de 6 dimensiones y un transformer que genera secuencias de acciones de 6 dimensiones. El modelo está configurado para el robot `so_follower` con cámaras `top` y `wrist`.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `Lerone1980/orange_green_20261031_134820`: 75 episodios, 56.249 fotogramas a 30 FPS, tarea "Orange and green block sorting". La configuración fue de 50.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta composición del dataset más allá de la tarea, ni uso de RLHF/DPO (no aplica en imitación supervisada), ni innovaciones adicionales más allá del propio esquema de chunking de ACT.

## Capacidades

- Control visomotor de manipulación: genera acciones de 6 grados de libertad a partir de estado articular e imágenes.
- Clasificación y ordenación de bloques naranjas y verdes (tarea única de entrenamiento).
- Fusión de dos vistas de cámara (superior y de muñeca) para localización de objetos.
- Ejecución en bucle cerrado a 30 FPS con el robot `so_follower`.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere recompensa ni entorno simulado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo *thinking*, visión general, audio ni otras capacidades fuera del dominio robótico entrenado.

## Casos de uso

- Clasificación de bloques por color en un banco de pruebas: el modelo ejecuta la tarea "Orange and green block sorting" sobre un SO-100/SO-101 con cámara superior y de muñeca, sirviendo como referencia de manipulación pick-and-place.
- Replicación del pipeline LeRobot: usar este repositorio como plantilla para entrenar políticas ACT propias con `lerobot-train` y validar la configuración (50.000 pasos, batch 8, lr 1e-05) en un robot equivalente.
- Docencia y formación en aprendizaje por imitación: el modelo y su dataset asociado permiten demostrar el ciclo completo grabación-teleoperación-entrenamiento-despliegue con 75 episodios y 56.249 fotogramas.
- Evaluación de infraestructura de inferencia robótica: al tener 51,7 M de parámetros y 0,2 GB, permite medir latencia y throughput de `lerobot-rollout` en GPUs de consumo sin cuello de botella de memoria.
- Base para *fine-tuning* en tareas de ordenación similares: al ser Apache 2.0 y estar en formato LeRobot, se puede reentrenar con un dataset propio de otra tarea de clasificación de objetos.
- Pruebas de robustez visomotora: comparar el comportamiento del modelo ante cambios de iluminación, posición de objetos o distracciones, ya que la model card invita explícitamente a documentar estas condiciones en la evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica literalmente que no se han proporcionado resultados de evaluación para esta política (*"No evaluation results have been provided for this policy yet"*), por lo que no existen tasas de éxito, métricas de error de acción ni comparaciones numéricas verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión de entrenamiento para los 51,7 M de parámetros; el cuello de botella real son las dos cámaras a 640×480 y 30 FPS, no el modelo.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA capaz de ejecutar el codificador visual en tiempo real; una RTX 3060 o superior es suficiente. No se documentan requisitos oficiales.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño de 0,2 GB del repositorio.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=Lerone1980/orange_green_policy`; el entrenamiento se realiza con `lerobot-train` y `--policy.device=cuda`.
- Latencia y throughput estimados: no disponibles; el sistema debe operar a 30 FPS para coincidir con la frecuencia de captura del dataset, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Lerone1980/orange_green_policy` (ACT) | 51,7 M | Ordenación de bloques naranjas y verdes | Estado 6D + 2 cámaras 480×640 | Apache 2.0 | Hugging Face, 0 descargas |
| ACT genérico (paper 2304.13705) | no disponible | Imitación robótica general | Depende de configuración | no disponible | Paper y código de referencia |
| Políticas LeRobot de la comunidad | variable | Tareas diversas | variable | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, entradas y licencia.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que su fiabilidad es desconocida.
- Tarea única: entrenado exclusivamente para "Orange and green block sorting"; no generaliza a otras tareas sin reentrenamiento.
- Dataset pequeño: 75 episodios y 56.249 fotogramas son insuficientes para cubrir variaciones amplias de iluminación, posiciones o distractores.
- Dependencia de hardware específico: requiere robot `so_follower` y cámaras con nombres `top` y `wrist`; un cambio de configuración invalida las observaciones.
- Riesgo de sobreajuste al entorno de grabación: colores, fondo y disposición de los bloques del dataset condicionan el comportamiento.
- Sin capacidades lingüísticas ni de razonamiento: no debe emplearse fuera del dominio de control robótico.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de reproducibilidad independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lerone1980/orange_green_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Lerone1980/orange_green_20261031_134820
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Lerone1980/orange_green_20261031_134820
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
