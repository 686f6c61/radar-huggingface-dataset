# saybeok03/folding_final_novit_lora_r256_224_100k

## Resumen

Este repositorio contiene una política de visión-lenguaje-acción (VLA) denominada `folding_final_novit_lora_r256_224_100k`, un ajuste fino del modelo base π₀.₅ (Pi05) de Physical Intelligence, adaptado a la librería LeRobot de Hugging Face. El modelo está especializado en una única tarea robótica de manipulación: doblar una camiseta ("Fold the T-shirt properly") sobre un robot bimanual de tipo `bi_openarm_follower` equipado con tres cámaras (base, muñeca izquierda y muñeca derecha).

El ajuste se ha realizado mediante aprendizaje por imitación sobre un conjunto de datos propio de 50 episodios y 135.351 fotogramas a 30 FPS, con 100.000 pasos de entrenamiento, batch de 32, optimizador AdamW y tasa de aprendizaje 3,75e-05. El nombre del repositorio sugiere el uso de LoRA con rango 256 y resolución de entrada 224×224, aunque la model card no detalla explícitamente la configuración de LoRA.

La relevancia de esta ficha es acotada: no se trata de un modelo de propósito general, sino de un artefacto de investigación reproducible para una tarea concreta de plegado de ropa. Resulta útil como referencia para quienes quieran replicar el flujo de ajuste fino de π₀.₅ en LeRobot, pero carece de evaluación publicada y de métricas de éxito en robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementación de LeRobot adaptada de OpenPI |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/pi05_base`, la implementación en LeRobot del modelo π₀.₅ de Physical Intelligence. π₀.₅ es un modelo de visión-lenguaje-acción diseñado para generalización en entornos abiertos: recibe observaciones visuales y de estado propioceptivo y emite acciones motrices de bajo nivel. En esta ficha no se dispone de detalles sobre el número de parámetros, la composición del corpus de preentrenamiento ni las técnicas de alineación (RLHF/DPO) empleadas en el modelo base.

El ajuste fino se ha realizado con LeRobot 0.6.1 sobre el dataset `saybeok03/full_folding_pi05_224` (50 episodios, 135.351 fotogramas, 30 FPS, tarea única de plegado de camiseta). La configuración de entrenamiento incluye 100.000 pasos, batch de 32, AdamW, learning rate 3,75e-05 y semilla 1000. El nombre del repositorio indica LoRA con rango 256 y entradas de 224×224, y el sufijo `novit` sugiere que no se empleó un codificador visual adicional o una variante "ViT" separada, aunque esto no se confirma en la model card. Las entradas son `observation.state` (16 dimensiones), tres imágenes RGB de 3×224×224 y la salida es un vector de acción de 16 dimensiones.

## Capacidades

- Control robótico de manipulación bimanual para la tarea específica de doblar una camiseta.
- Política de imitación condicionada por lenguaje: acepta una instrucción de tarea (`"Fold the T-shirt properly"`) junto con observaciones visuales y de estado.
- Fusión de tres vistas de cámara (base, muñeca izquierda, muñeca derecha) y estado propioceptivo de 16 dimensiones.
- Emisión de acciones continuas de 16 dimensiones a la frecuencia del dataset de entrenamiento (30 FPS).
- Ejecución mediante `lerobot-rollout` sobre el robot `bi_openarm_follower`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, matemáticas, código ni procesamiento de audio.

## Casos de uso

- Investigación en aprendizaje por imitación para plegado de ropa: sirve como punto de partida reproducible para estudiar cómo π₀.₅ se adapta a una tarea de manipulación deformable con solo 50 episodios.
- Replicación de experimentos de ajuste fino con LeRobot: el repositorio documenta la configuración exacta (pasos, batch, LR, semilla) para reproducir el entrenamiento sobre el dataset público.
- Benchmark interno de políticas VLA: puede emplearse como línea base específica de tarea para comparar variantes de LoRA, resolución de entrada o número de cámaras.
- Despliegue en robot bimanual OpenArm: el comando `lerobot-rollout` permite ejecutar la política durante 60 segundos sobre hardware compatible para validar el comportamiento en plegado.
- Docencia y demostraciones de VLA: útil en cursos o talleres donde se quiera mostrar el ciclo completo de grabación de datos, entrenamiento y despliegue en robótica.
- Estudio de transferencia entre robots: al estar entrenado sobre un robot concreto y tres cámaras, permite analizar la sensibilidad de π₀.₅ a cambios de configuración de sensores.
- Generación de datos sintéticos o aumentados: las trayectorias generadas pueden servir para analizar modos de fallo antes de invertir en nuevas grabaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni condiciones de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 1,9 GB, lo que da una cota inferior del espacio en disco de los pesos, pero no permite derivar la VRAM necesaria sin conocer el número de parámetros y la precisión.
- GPU recomendadas: no disponible. Al tratarse de un modelo VLA con tres cámaras a 224×224, se requiere una GPU con soporte CUDA; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamaño del repositorio (1,9 GB), es plausible que quepa en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=saybeok03/folding_final_novit_lora_r256_224_100k` y `--robot.type=bi_openarm_follower`; el entrenamiento se realiza con `lerobot-train` sobre `lerobot/pi05_base`.
- Latencia y throughput: no disponibles. La política opera a 30 FPS según el dataset de entrenamiento, pero no se documenta la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `saybeok03/folding_final_novit_lora_r256_224_100k` | no disponible | no disponible | Plegado de camiseta (bi_openarm_follower) | apache-2.0 | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | VLA generalista (base) | no disponible en la información | Hugging Face |
| π₀ (Pi0) | no disponible | no disponible | VLA generalista | no disponible en la información | OpenPI / Physical Intelligence |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada. La comparación se limita a la relación de ajuste fino (este modelo deriva de `lerobot/pi05_base`) y a la especialización de tarea frente al modelo base generalista.

## Limitaciones y advertencias

- Modelo especializado en una única tarea ("Fold the T-shirt properly"); no es un modelo de propósito general y no debe esperarse generalización a otras tareas de manipulación.
- Entrenado sobre un robot concreto (`bi_openarm_follower`) y una configuración de tres cámaras; cambios de hardware, calibración o disposición de sensores pueden degradar el comportamiento.
- Dataset de entrenamiento pequeño (50 episodios, 135.351 fotogramas), lo que limita la robustez frente a variaciones de iluminación, posiciones iniciales o tipos de camiseta.
- Sin evaluación publicada: no hay tasas de éxito, número de ensayos ni condiciones de prueba documentadas; el rendimiento real en robot es desconocido.
- Riesgo de sobreajuste a las condiciones de grabación del dataset original.
- No se documentan sesgos conocidos, pero al ser un modelo de control motor no se aplican las categorías habituales de sesgo lingüístico; sí pueden aparecer sesgos de distribución visual y de estado.
- Licencia apache-2.0, lo que permite uso comercial según los términos de dicha licencia, pero el modelo base `lerobot/pi05_base` y π₀.₅ pueden tener condiciones adicionales que no se detallan en esta información; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- El nombre del repositorio sugiere LoRA, pero la model card no documenta la configuración exacta de adaptadores, lo que complica la reproducibilidad fina.
- No se especifican idiomas soportados; la instrucción de tarea está en inglés en el ejemplo de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saybeok03/folding_final_novit_lora_r256_224_100k
- Dataset de entrenamiento: https://huggingface.co/datasets/saybeok03/full_folding_pi05_224
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=saybeok03/full_folding_pi05_224
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
