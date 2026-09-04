# PID0930/groot-n1d7-openarm-bottle-sort-ckpt10000

## Resumen

El modelo `PID0930/groot-n1d7-openarm-bottle-sort-ckpt10000` es un fine-tuning del modelo de robótica `nvidia/GR00T-N1.7-3B`, desarrollado por el usuario PID0930 con el framework Isaac-GR00T de NVIDIA. Está diseñado para una tarea concreta de manipulación bimanual: colocar dos botellas situadas a la izquierda en un cuenco izquierdo y dos botellas situadas a la derecha en un cuenco derecho, utilizando un brazo robótico OpenArm de 7 grados de libertad por lado. Es un modelo VLA (Vision-Language-Action) que combina un backbone visual-lingüístico con una cabeza de acción basada en flow matching.

El checkpoint presentado es el paso 10.000 de una ejecución de 20.000 pasos, lo que equivale a 1,48 épocas sobre un dataset de 600 episodios y 224.608 fotogramas. La arquitectura consta de un backbone `nvidia/Cosmos-Reason2-2B` congelado y un proyector más una cabeza de acción DiT que sí se entrenan. El modelo tiene 3.144.016.000 parámetros totales y se distribuye bajo licencia Apache 2.0. Su relevancia radica en servir como artefacto de investigación para evaluar el comportamiento del fine-tuning de GR00T sobre una tarea robótica nueva, aunque no se han medido métricas de validación ni tasas de éxito reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en GR00T-N1.7-3B: backbone Cosmos-Reason2-2B + proyector + cabeza de acción DiT con flow matching |
| Parametros totales | 3.144.016.000 (3,14 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica; no se especifica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (se incluye además `optimizer.pt` para reanudar el entrenamiento) |

## Arquitectura y entrenamiento

El modelo es un post-entrenamiento de `nvidia/GR00T-N1.7-3B`, cuya arquitectura combina un backbone visual-lingüístico `nvidia/Cosmos-Reason2-2B` con un proyector y una cabeza de acción de tipo DiT (Diffusion Transformer) que genera acciones con flow matching. En este fine-tuning, el backbone de 2B se mantiene congelado; solo se actualizan el proyector y la cabeza de acción. El modelo opera sobre un espacio de articulaciones bimanual de 16 dimensiones (7 articulaciones por brazo y 1 por mano) y utiliza tres cámaras: `chest_view`, `left_wrist_view` y `right_wrist_view`, todas a resolución 480x640. La representación de acción usa movimientos relativos para los brazos y absolutos para las manos, con un horizonte de 16 pasos a 30 fps (aproximadamente 0,53 segundos).

El entrenamiento se realizó sobre un dataset de 600 episodios y 224.608 fotogramas a 30 fps, correspondiente a una única tarea con una disposición de escena fija. Se utilizó un tamaño de lote global de 32 en una GPU A100 80GB, con optimizador AdamW (tasa de aprendizaje 1e-4, decaimiento coseno, warmup 0.05, weight decay 1e-5) y precisión bf16. El checkpoint 10.000 corresponde a 1,48 épocas de una ejecución de 20.000 pasos que tarda aproximadamente 5 horas en la misma GPU. No se aplicaron técnicas de RLHF ni DPO.

## Capacidades

- Generación de acciones robóticas bimanuales a partir de instrucciones en lenguaje natural, como la tarea de clasificación de botellas descrita en la model card.
- Percepción multimodal a través de tres cámaras (pecho, muñeca izquierda y muñeca derecha) a 480x640 píxeles.
- Control de 16 grados de libertad: brazos (7+7) y manos (1+1) en un robot OpenArm.
- Salida de acciones con un horizonte de 16 pasos a 30 fps, lo que permite predicciones de movimiento de aproximadamente 0,53 segundos.
- Soporte de apertura para registrar nuevos embodiment tags mediante un módulo de configuración de modalidad (`openarm_config.py`).
- No soporta generación de texto libre, tool calling ni agentes conversacionales; su salida está restringida a trayectorias de control robótico.

## Casos de uso

- Clasificación robótica de objetos en entornos de laboratorio: el modelo recibe imágenes de las tres cámaras y ejecuta la secuencia de acciones necesaria para trasladar botellas desde posiciones fijas a cuencos, siendo adecuado para tareas de ordenación con escenarios reproducibles.
- Investigación en manipulación bimanual: permite estudiar la coordinación entre dos brazos de 7 DOF, observando cómo el modelo genera movimientos relativos y absolutos sobre manos y articulaciones.
- Evaluación open-loop de políticas robóticas: el checkpoint está pensado para ser ejecutado con `gr00t/eval/open_loop_eval.py`, lo que facilita comparar la precisión de la trayectoria generada frente a episodios de referencia.
- Prototipado rápido de control de robots de bajo coste: al estar basado en el robot de código abierto OpenArm, el modelo puede integrarse en plataformas de investigación para validar nuevas tareas de manipulación sin necesidad de reentrenar el backbone.
- Benchmarking de fine-tuning de GR00T sobre tareas nuevas: los checkpoints hermanos (5.000, 15.000 y 20.000) permiten comparar la pérdida de entrenamiento y explorar la dinámica de adaptación del modelo a una tarea específica.
- Reanudación de entrenamiento desde un punto intermedio: al incluir `optimizer.pt`, el checkpoint puede usarse para continuar una ejecución de post-entrenamiento, lo que resulta útil para ajustar hiperparámetros o ampliar el número de pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de entrenamiento de este checkpoint (0,0440) y de sus hermanos, sin ninguna métrica de validación ni tasa de éxito real. El propio autor advierte explícitamente que los checkpoints no han sido ordenados por ninguna métrica de validación y que una pérdida de entrenamiento más baja no implica mejor generalización.

## Requisitos de hardware

- Entrenamiento: 1x GPU A100 80GB PCIe es suficiente para reproducir la ejecución completa de 20.000 pasos en aproximadamente 5 horas.
- Inferencia: no disponible en la información proporcionada; el modelo requiere el framework Isaac-GR00T y acceso al backbone gated `nvidia/Cosmos-Reason2-2B`.
- Despliegue: el código de evaluación propuesto (`open_loop_eval.py`) está pensado para ejecutarse con CUDA en un dispositivo `cuda`.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones de rendimiento en tiempo real.

## Comparativa con modelos similares

La siguiente tabla compara este checkpoint con los otros puntos de control publicados de la misma ejecución y con el modelo base sin fine-tuning. No se dispone de información sobre otros modelos comparables de la misma categoría en la información proporcionada.

| Modelo | Parametros | Checkpoint | Pérdida de entrenamiento | Observaciones |
|---|---|---|---|---|
| `nvidia/GR00T-N1.7-3B` | 3.144.016.000 | base | no disponible | Modelo base sin post-entrenamiento |
| `PID0930/groot-n1d7-openarm-bottle-sort-ckpt5000` | 3.144.016.000 | 5.000 | 0,0636 | Checkpoint intermedio |
| `PID0930/groot-n1d7-openarm-bottle-sort-ckpt10000` | 3.144.016.000 | 10.000 | 0,0440 | Checkpoint de esta ficha |
| `PID0930/groot-n1d7-openarm-bottle-sort-ckpt15000` | 3.144.016.000 | 15.000 | 0,0282 | Checkpoint posterior |
| `PID0930/groot-n1d7-openarm-bottle-sort-ckpt20000` | 3.144.016.000 | 20.000 | 0,0229 | Checkpoint final de la ejecución |

Todos comparten la misma arquitectura, licencia y formato de pesos. La diferencia clave es el número de pasos de entrenamiento y la pérdida asociada, que no se ha validado experimentalmente.

## Limitaciones y advertencias

- El modelo se ha entrenado sobre una única tarea con una disposición de escena fija; la robustez a cambios de diseño, iluminación o posición de objetos no está probada.
- No se ha medido ninguna métrica de validación ni tasa de éxito real sobre robot, por lo que debe tratarse como un artefacto de investigación y no como un modelo listo para producción.
- El backbone visual-lingüístico está congelado, lo que significa que las características visuales no se han adaptado a las cámaras específicas del robot OpenArm.
- Los episodios del dataset son notablemente uniformes (357-386 fotogramas, 11,9-12,9 segundos), lo que limita la diversidad de los datos y puede afectar a la generalización.
- La licencia Apache 2.0 permite uso comercial, pero el acceso al backbone `nvidia/Cosmos-Reason2-2B` está restringido y puede requerir aceptación de condiciones adicionales en HuggingFace.
- No se dispone de información sobre sesgos, riesgos de alucinación (en el sentido de generación de acciones erróneas) ni advertencias de seguridad específicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PID0930/groot-n1d7-openarm-bottle-sort-ckpt10000
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Proyecto OpenArm (brazo humanoide de código abierto): https://github.com/enactic/openarm
- Checkpoint hermano 5.000: https://huggingface.co/PID0930/groot-n1d7-openarm-bottle-sort-ckpt5000
- Checkpoint hermano 15.000: https://huggingface.co/PID0930/groot-n1d7-openarm-bottle-sort-ckpt15000
- Checkpoint hermano 20.000: https://huggingface.co/PID0930/groot-n1d7-openarm-bottle-sort-ckpt20000
