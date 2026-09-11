# mattewg/pi05-so101-grab-cup-50k

## Resumen

pi05-so101-grab-cup-50k es una política de imitación (vision-language-action) desarrollada por el usuario mattewg, consistente en un fine-tuning de pi0.5 (`physical-intelligence/pi05_base`) sobre un conjunto de datos de teleoperación de un brazo robótico SO-101. No es un modelo de lenguaje: recibe dos vistas de cámara en color y el estado articular actual, y devuelve un bloque de 16 objetivos articulares absolutos a 15 Hz. El único prompt de tarea presente en el entrenamiento es la cadena fija `"Grab the white cup"`.

El modelo se entrenó durante 50.000 pasos con batch 32 sobre el dataset `Ibuprofene/grab_cup_2cam_v4` (146 episodios, 104.819 fotogramas), usando 4x A100-64GB con FSDP. Es la continuación del checkpoint `pi05-so101-grab-cup-30k`, al que se añadieron 20.000 pasos adicionales reabriendo el schedule coseno. El propio autor advierte que la pérdida final (0,00206) es prácticamente idéntica a la del punto de reanudación (0,00202), de modo que los pasos extra reajustaron los mismos datos sin mejorar el resultado, y recomienda usar el checkpoint de 30k salvo que exista una razón concreta para lo contrario.

Su relevancia es acotada y experimental: sirve como referencia reproducible dentro del ecosistema openpi/LeRobot para una tarea de agarre muy concreta, y como caso de estudio de un fallo característico de las políticas de imitación (bloqueo en la pose final del episodio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA derivada de pi0.5 (`Pi0Config(pi05=True, action_dim=32, action_horizon=16)`); detalle interno de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que la arquitectura sea MoE) |
| Longitud de contexto | no aplica; horizonte de acción de 16 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica; el prompt de tarea es una cadena fija en ingles (`"Grab the white cup"`) |
| Licencia | apache-2.0 |
| Formato de pesos | directorio `params/` más `assets/` para openpi; no se especifica safetensors ni GGUF |
| Tamaño del repositorio | 12,4 GB |
| Modelo base | `physical-intelligence/pi05_base` |
| Dataset de entrenamiento | `Ibuprofene/grab_cup_2cam_v4` (146 episodios, 104.819 fotogramas) |
| Pasos de entrenamiento | 50.000, batch 32 |
| Hardware de entrenamiento | 4x A100-64GB, FSDP sobre 4 dispositivos |
| Pérdida final | 0,00206 |
| Entrada | `images.fixed` (cámara de mesa) e `images.handeye` (cámara de muñeca), RGB uint8 HxWx3; `state` float32 (6,); `prompt` |
| Salida | `actions` float32 (16, 6) |
| Unidades | `shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll` en grados; `gripper` en escala 0-100 |
| Frecuencia de las acciones | 15 Hz (un bloque cubre ~1,07 s) |

## Arquitectura y entrenamiento

El modelo parte de `pi05_base`, un checkpoint de openpi, y se ajusta con `Pi0Config(pi05=True, action_dim=32, action_horizon=16)`. El autor no detalla la composición interna de la red en la información disponible, más allá de que se trata de una política que consume dos vistas RGB más el estado articular y emite un bloque de acciones. Las acciones se entrenan como deltas respecto al estado actual en las cinco articulaciones del brazo y en valor absoluto en la pinza; el servidor vuelve a sumar el estado antes de responder, por lo que el cliente recibe siempre valores absolutos. La normalización es por cuantiles (q01/q99 a [-1, 1]).

El entrenamiento se ejecutó durante 50.000 pasos con batch 32, schedule coseno con pico 2,5e-5 y decaimiento a 2,5e-6, con 1.000 pasos de warmup, sobre 4 GPU A100 de 64 GB con FSDP. Este checkpoint continúa el de 30k durante 20.000 pasos más, reabriendo el schedule coseno, de forma que la tasa de aprendizaje volvió a subir de 2,5e-6 a 1,05e-5 en la reanudación y decayó de nuevo. No se documenta el uso de RLHF ni DPO, ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El estado del optimizador no se incluye en el repositorio, por lo que estos pesos se pueden usar para warm start, pero no para reanudar el entrenamiento.

## Capacidades

- Generación de acciones motoras: produce bloques de 16 objetivos articulares absolutos a partir de dos imágenes y el estado actual, a una frecuencia efectiva de 15 Hz.
- Ejecución de una única tarea de manipulación: agarrar un vaso blanco en una configuración de mesa concreta.
- Fusión de dos vistas de cámara: una cámara fija de mesa y una cámara de muñeca, que no son intercambiables.
- Condicionamiento por prompt: acepta la cadena de tarea `"Grab the white cup"`, la única presente en el conjunto de entrenamiento.
- Ninguna capacidad de generación de texto, razonamiento, código, matemáticas, visión general, audio ni tool calling. No hay soporte de agentes ni de razonamiento multi-paso en el sentido de los LLM.
- Sin capacidades multilingües: no hay procesamiento de lenguaje natural abierto, solo una instrucción fija.

## Casos de uso

- Reproducción de una línea base en investigación sobre VLA: sirve para comparar nuevas políticas de imitación contra un resultado ya publicado (pérdida 0,00206) sobre una tarea idéntica y un dataset público.
- Punto de partida para fine-tuning con LeRobot: al compartir configuración `Pi0Config(pi05=True, action_dim=32, action_horizon=16)`, se puede reajustar con nuevos datasets de SO-101 para otras tareas de agarre.
- Estudio del fallo de bloqueo en la pose final: el modelo se atasca en la configuración `[25, -17, -79, 68, 36]` (brazo arriba, pinza cerrada), lo que lo convierte en un caso de laboratorio para probar demostraciones de recuperación que comiencen en esa pose.
- Validación de pipelines de despliegue con openpi: útil para verificar la integración cliente-servidor mediante `scripts/serve_policy.py` y comprobar que la lectura de estadísticas de normalización desde `assets/so101/grab_cup_2cam_v4/` funciona correctamente.
- Automatización de una tarea repetitiva de laboratorio: recogida de un vaso blanco colocado en una posición fija de la mesa, con el brazo SO-101 en configuración `so_follower` con `use_degrees=True`.
- Evaluación de robustez ante perturbaciones de cámara: dado que las dos cámaras no son intercambiables, permite medir de forma controlada cómo degrada la política cuando se altera la vista fija o la de muñeca.
- Docencia y demostración de aprendizaje por imitación: ejemplo completo y de tamaño manejable (12,4 GB) para ilustrar el ciclo dataset-teleoperación-entrenamiento-despliegue en robótica de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes de robótica) en la informacion disponible. La única métrica cuantitativa aportada por el autor es la pérdida de entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida final a 50.000 pasos | 0,00206 |
| Pérdida en el punto de reanudación (30.000 pasos) | 0,00202 |
| Conclusión del autor | Los 20.000 pasos extra reajustan los mismos datos sin mejorar; recomienda el checkpoint de 30k |

No se aportan tasas de éxito, número de ensayos ni curvas de evaluación en robot real.

## Requisitos de hardware

- Entrenamiento (dato del autor): 4x A100 de 64 GB con FSDP sobre 4 dispositivos, batch 32.
- VRAM para inferencia: no confirmada por el autor. Como referencia, el repositorio ocupa 12,4 GB (pesos más assets), por lo que una estimación razonable en precisión completa se sitúa en el entorno de 12-16 GB, sin cuantización documentada.
- GPU recomendadas: no especificadas. Las A100-64GB están confirmadas únicamente para entrenamiento. Para inferencia no hay datos publicados.
- GPU de consumo: no confirmado. Si la estimación de 12-16 GB es correcta, cabría en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, pero el autor no lo verifica.
- Despliegue: servidor de openpi mediante `scripts/serve_policy.py`, con `--policy.dir` apuntando al directorio que contiene `params/` y `assets/`. No se contemplan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de robot.
- Dependencia crítica: requiere openpi en el commit `215abfb217dbac7d5f1273282331b9b1866c0479` más los ficheros de política y configuración de SO-101, que no están en el repositorio upstream. Commits posteriores pueden haber cambiado el pipeline de transformaciones y producir acciones incorrectas de forma silenciosa.
- Latencia y throughput: no disponibles. La única referencia temporal es la frecuencia de salida de las acciones (15 Hz) y la duración de cada bloque (~1,07 s).
- Restricción de reanudación: al no incluir el estado del optimizador, el checkpoint permite warm start pero no reanudar el entrenamiento.

## Comparativa con modelos similares

| Modelo | Origen | Datos de entrenamiento | Pasos | Pérdida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pi05-so101-grab-cup-50k | mattewg (fine-tuning) | `Ibuprofene/grab_cup_2cam_v4`, 146 episodios, 104.819 fotogramas | 50.000 | 0,00206 | apache-2.0 | HuggingFace |
| pi05-so101-grab-cup-30k | mattewg (fine-tuning) | Mismo dataset | 30.000 | 0,00202 (en el punto de reanudación) | no disponible en la informacion proporcionada | HuggingFace |
| physical-intelligence/pi05_base | Physical Intelligence | no disponible | no aplica (modelo base) | no disponible | no disponible en la informacion proporcionada | openpi (`gs://openpi-assets/checkpoints/pi05_base/params`) |
| Otras políticas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación de rendimiento en robot real entre estas alternativas.

## Limitaciones y advertencias

- Sobreentrenamiento sin mejora: los 20.000 pasos adicionales respecto al checkpoint de 30k no redujeron la pérdida (0,00206 frente a 0,00202). El propio autor recomienda preferir el checkpoint de 30k salvo justificación explícita.
- Bloqueo en la pose final del episodio: la política puede atascarse con el brazo arriba y la pinza cerrada, en torno a `[25, -17, -79, 68, 36]` en el orden de articulaciones indicado. Todas las demostraciones terminan ahí y dejan de grabar, por lo que el modelo solo dispone de la opción "mantener". Se necesitan demostraciones de recuperación que comiencen en esa pose; más pasos de entrenamiento no lo solucionan.
- Cámaras no intercambiables: invertir `images.fixed` e `images.handeye` produce resultados incorrectos con alta confianza.
- Convención de unidades: el estado y las acciones usan grados para las cinco articulaciones del brazo y escala 0-100 para la pinza. Si el código de control trabaja en porcentaje de servo (-100 a 100), hay que convertir antes.
- Frecuencia de reproducción: los 16 pasos están espaciados a 15 Hz, no a 30. Los datos se grabaron a 30 fps y se submuestrearon por 2. Reproducir a 30 Hz reduce a la mitad la velocidad prevista; hay que reproducir a 15 Hz o interpolar.
- Dependencia de versión: el commit de openpi indicado es obligatorio; cambios posteriores en el pipeline de transformaciones pueden generar acciones erróneas sin aviso.
- Especialización extrema: una sola tarea y un solo prompt. No generaliza a otras instrucciones ni a objetos distintos del vaso blanco en la configuración entrenada.
- Sin estado del optimizador: imposible reanudar el entrenamiento tal cual; solo warm start.
- Sesgos conocidos: no documentados explícitamente, más allá del sesgo implícito de la distribución de demostraciones (posiciones, iluminación y montaje concretos del dataset de teleoperación).
- Riesgo de fallo silencioso en producción: al tratarse de una política de imitación sin mecanismos de verificación, una entrada fuera de distribución puede producir movimientos plausibles pero incorrectos.
- Licencia apache-2.0 en el modelo, pero conviene verificar por separado los términos del modelo base y del dataset utilizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattewg/pi05-so101-grab-cup-50k
- Checkpoint predecesor: https://huggingface.co/mattewg/pi05-so101-grab-cup-30k
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base (referenciado como `gs://openpi-assets/checkpoints/pi05_base/params`)
- Dataset de entrenamiento: https://huggingface.co/datasets/Ibuprofene/grab_cup_2cam_v4
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi (commit requerido: `215abfb217dbac7d5f1273282331b9b1866c0479`)
- Registro del entrenamiento en W&B: https://wandb.ai/mattewg_dev/SPELL/runs/cup_50k_cont
- LeRobot (librería declarada): https://github.com/huggingface/lerobot
- Los resultados de la búsqueda web no aportan enlaces adicionales relevantes sobre este modelo; el resto de resultados no guardan relación con robótica ni con IA.
