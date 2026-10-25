# Linslab/ManiLadder_PI05_Models

## Resumen

`Linslab/ManiLadder_PI05_Models` no es un modelo fundacional, sino una colección de 60 adaptadores LoRA sobre el modelo visión-lenguaje-acción PI0.5, uno por cada tarea del benchmark de manipulación robótica ManiLadder. Cada adaptador se ha ajustado con 20 demostraciones de la tarea correspondiente y se publica el checkpoint con mayor tasa de éxito tras reevaluar todos los guardados (pasos 5k–40k, cada 5k) durante 50 episodios con semillas fijas 1000–1049. El repositorio ocupa 112,1 GB e incluye, por tarea, el fichero `.npz` con los pesos LoRA y entrenables, las estadísticas de normalización (`norm_stats.json`) y el resultado de evaluación (`eval_result.json`).

El interés del artefacto es metodológico: documenta 477 evaluaciones de checkpoints con un protocolo reproducible (`exec_steps=16`, `sample_steps=10`, semillas idénticas entre checkpoints de una misma tarea) y publica los CSV con la selección final y con todos los resultados intermedios. Esto lo convierte en un recurso útil para estudiar la variabilidad del ajuste fino con pocas demostraciones y la relación entre paso de entrenamiento y tasa de éxito en políticas de imitación bimanuales.

La model card no aporta ninguna especificación del modelo base PI0.5 (arquitectura, número de parámetros, longitud de contexto, datos de preentrenamiento) ni declara idiomas soportados. La información disponible se limita a los pesos LoRA, las estadísticas de normalización y las tasas de éxito por tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (adaptadores LoRA sobre PI0.5; la model card no describe la arquitectura del modelo base) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se declara una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se publican pesos sin cuantizar en formato `.npz`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.npz` (LoRA + pesos entrenables) y `norm_stats.json`; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El repositorio contiene 60 adaptadores LoRA independientes, uno por tarea de ManiLadder, organizados en `single_task/<task>/`. Cada adaptador se ha entrenado con 20 demostraciones de la tarea, y para cada tarea se conservaron los checkpoints guardados cada 5.000 pasos entre 5.000 y 40.000. La selección del checkpoint publicado no se basa en la pérdida de entrenamiento, sino en una reevaluación en entorno: 50 episodios por checkpoint con semillas de episodio fijas 1000–1049 (idénticas entre checkpoints de la misma tarea), resolución de empates hacia el paso más temprano. En total se evaluaron 477 checkpoints, y los resultados completos están en `single_task/all_checkpoints_eval.csv`.

El protocolo de evaluación fija `exec_steps=16` y `sample_steps=10`. La model card advierte explícitamente de que las tareas cuyos checkpoints puntuaron 0/50 se incluyen igualmente y que, en esos casos, la elección de paso es arbitraria. No se documentan en la información disponible los datos de preentrenamiento de PI0.5, el uso de RLHF/DPO, ni innovaciones de decodificación o atención.

## Capacidades

- Ejecución de políticas de manipulación robótica de una sola tarea: cada adaptador está especializado en una tarea concreta de ManiLadder (por ejemplo, `GraspCylinder-v1`, `FoldShirt-v1`, `LiquidMeasuring-v1`).
- Manipulación bimanual: 40 de las 60 tareas del conjunto llevan el prefijo `DualArm` y requieren coordinación de dos brazos.
- Manipulación de objetos deformables: cuerdas (`DualArmRopeStretch-v1`, `DualArmRopeCylinderWarpping-v1`), telas (`DualArmFoldHandKerchief-v1`, `ClothWipe-v1`, `DualArmWeaveCloth-v1`) y prendas (`FoldShirt-v1`, `DualArmClothHanger-v1`).
- Tareas de precisión con herramienta: `TweezersPickPlace-v1`, `HammerNail-v1`, `HammerNailOut-v1`, `DualArmThreadRopeThroughTube-v1`.
- Tareas con manipulación de líquidos y vertido: `LiquidMeasuring-v1`.
- Tareas de base móvil: `MobilePickPlace-v1`.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, generación de texto, visión general, audio ni modos de "thinking". El uso previsto es el control de políticas, no el diálogo.

## Casos de uso

- Evaluación comparativa de checkpoints en investigación de imitación: usar `all_checkpoints_eval.csv` para analizar cómo evoluciona la tasa de éxito entre 5k y 40k pasos en 60 tareas, con un protocolo de 50 episodios y semillas fijas que reduce el ruido de evaluación.
- Ajuste fino con pocas demostraciones: cada adaptador se entrenó con solo 20 demos, por lo que el repositorio sirve como referencia de qué tasas de éxito son alcanzables con ese régimen de datos en tareas de dificultad 1 a 4.
- Despliegue en laboratorio de robótica bimanual: cargar el adaptador de una tarea concreta (por ejemplo `DualArmRopeStretch-v1`, 0,92 de éxito en 50 episodios) sobre PI0.5 para reproducir la política en un montaje físico o simulado equivalente.
- Línea base para comparar estrategias de selección de checkpoint: contrastar la selección por tasa de éxito en 50 episodios frente a selección por pérdida o por paso fijo, usando los datos publicados por tarea.
- Estudio de currículums por dificultad: los niveles 1 a 4 de ManiLadder permiten medir la degradación de la política con la dificultad; la media cae de 0,74 en nivel 1 a 0,03 en nivel 4, lo que facilita diseñar experimentos de transferencia y escalado de dificultad.
- Análisis de fallos en tareas de contacto rico: tareas con 0/50 (`Stack6Blocks-v1`, `DualArmFlipTable-v1`, `RingTossing-v1`, entre otras) son candidatas directas a diagnosis de modos de fallo y a experimentos de aumento de datos o de demos.
- Reproducibilidad de benchmarks de robótica: las semillas 1000–1049 y los parámetros `exec_steps=16` / `sample_steps=10` permiten replicar exactamente el protocolo en un entorno ManiLadder.

## Benchmarks y rendimiento

Los únicos datos publicados son tasas de éxito en 50 episodios por tarea, con el protocolo indicado. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks de lenguaje.

Resumen agregado por nivel de dificultad (media de las tasas de éxito por tarea, no ponderada):

| Nivel | Tareas | Media de éxito | Mejor tarea | Peor tarea | Tareas con 0/50 |
|---|---|---|---|---|---|
| 1 | 13 | 0,74 | `DualArmButtonPress-v1` (0,98) | `OpenDoor-v1` (0,30) | 0 |
| 2 | 17 | 0,42 | `RollingPin-v1` (0,96) | `DualArmThrowBlock-v1` (0,00) | 1 |
| 3 | 12 | 0,11 | `DualArmWeaveCloth-v1` / `LiquidMeasuring-v1` (0,32) | `DualArmOpenFridge-v1`, `Stack6Blocks-v1`, `TweezersPickPlace-v1` (0,00) | 3 |
| 4 | 18 | 0,03 | `PingPongBallTransport-v1` (0,16) | 10 tareas con 0,00 | 10 |
| Total | 60 | 0,31 | — | — | 14 |

Selección de tareas destacadas:

| Tarea | Nivel | Paso publicado | Éxito (50 ep) |
|---|---|---|---|
| DualArmButtonPress-v1 | 1 | 5000 | 0,98 |
| LiftBucket-v1 | 1 | 40000 | 0,96 |
| RollingPin-v1 | 2 | 25000 | 0,96 |
| GraspCylinder-v1 | 1 | 15000 | 0,94 |
| RopePalmCageHoldDex-v1 | 1 | 5000 | 0,94 |
| PushSoccer-v1 | 1 | 40000 | 0,80 |
| FoldShirt-v1 | 2 | 40000 | 0,72 |
| DualArmOpenPen-v1 | 1 | 35000 | 0,36 |
| DualArmPegInHole-v1 | 2 | 5000 | 0,18 |
| DualArmOpenBottle-v1 | 2 | 30000 | 0,06 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no declara el tamaño del modelo base PI0.5 ni de los adaptadores; el tamaño de cada `.npz` individual no se detalla.
- Espacio en disco: el repositorio completo ocupa 112,1 GB, correspondiente a 60 adaptadores LoRA más estadísticas y resultados. Conviene descargar solo el subdirectorio de la tarea de interés.
- GPU recomendadas: no disponible en la información proporcionada. El repositorio no incluye requisitos de hardware ni referencias a GPUs concretas (A100, H100, RTX 4090 u otras).
- Viabilidad en GPU de consumo: no se puede determinar sin conocer el tamaño del modelo base; no disponible.
- Opciones de despliegue: no se documentan en la model card. El formato `.npz` para LoRA y pesos entrenables es propio de stacks basados en NumPy/JAX, por lo que no es directamente compatible con llama.cpp, Ollama, vLLM o TGI sin conversión previa; esta observación se deduce del formato de fichero y no está confirmada por el autor.
- Latencia y throughput: no disponibles. Los únicos parámetros publicados son de evaluación (`exec_steps=16`, `sample_steps=10`), no de rendimiento temporal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ManiLadder PI0.5 LoRA (este repo) | no disponible | no disponible | 0,31 de media en 60 tareas (50 ep/tarea) | MIT | HuggingFace, 112,1 GB |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables de la misma categoría (adaptadores LoRA por tarea sobre un VLA para manipulación bimanual) ni se aportan métricas de otros sistemas frente a las que contrastar estas tasas de éxito.

## Limitaciones y advertencias

- La model card no documenta sesgos, composición del dataset de preentrenamiento ni evaluación de seguridad; no hay información sobre sesgos conocidos.
- Riesgo de sobreajuste a la evaluación: las 50 semillas (1000–1049) son fijas y se reutilizan en todos los checkpoints de una tarea, de modo que las tasas publicadas pueden estar optimizadas para ese conjunto concreto de episodios y no reflejar generalización a otras condiciones iniciales.
- Alta varianza en tareas difíciles: 14 de 60 tareas obtienen 0/50 y el autor advierte de que en esos casos la elección de paso es arbitraria; los adaptadores de nivel 4 no son utilizables en producción.
- Especialización estricta: cada adaptador cubre una sola tarea; no hay un adaptador multi-tarea ni instrucciones para combinarlos o alternarlos en una misma sesión.
- Dependencia del modelo base: los `.npz` son adaptadores LoRA más pesos entrenables, por lo que requieren PI0.5 y el stack de entrenamiento/inferencia correspondiente; sin él, los ficheros no son ejecutables por sí mismos.
- Normalización obligatoria: cada checkpoint incluye `norm_stats.json`; usar estadísticas distintas a las del entrenamiento invalida las acciones generadas.
- Licencia: el repositorio se publica bajo MIT, lo que permite uso comercial de estos pesos, pero la licencia del modelo base PI0.5 no se especifica en la información disponible y puede imponer condiciones adicionales al uso combinado.
- Idiomas y contexto: sin datos declarados; no debe asumirse soporte multilingüe ni una ventana de contexto concreta.
- Ausencia de documentación de arquitectura: no se detallan hiperparámetros de entrenamiento (learning rate, rango de LoRA, precisión), lo que dificulta reproducir el ajuste fino a partir de la model card.
- Almacenamiento: 112,1 GB de repositorio; la descarga completa es costosa y la card no ofrece tamaños por fichero.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Linslab/ManiLadder_PI05_Models
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios de código o demos.
