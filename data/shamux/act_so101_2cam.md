# shamux/act_so101_2cam

## Resumen

`shamux/act_so101_2cam` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con LeRobot para el robot `so_follower` de la familia SO-101. No es un modelo de lenguaje: es un modelo de control robótico que consume el estado articular (6 dimensiones) y dos flujos de imagen (cámara de muñeca y cámara externa, 480x640) y produce comandos de acción de 6 dimensiones. Fue publicado por el usuario shamux el 30 de octubre de 2026 y acumula 26 descargas.

El modelo resuelve una tarea concreta de manipulación: "Pick up the cube and place it in the bin" (coger el cubo y dejarlo en la papelera). Se entrenó sobre el dataset `shamux/so101_cube_2cam`, compuesto por 52 episodios y 27.886 fotogramas a 30 FPS, mediante aprendizaje por imitación a partir de datos de teleoperación. La arquitectura ACT predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error acumulado y suele mejorar la tasa de éxito en tareas de manipulación.

Su relevancia es práctica y acotada: sirve como referencia reproducible para quien quiera desplegar o reentrenar una política visuomotora en un SO-101 con dos cámaras usando LeRobot 0.6.2. El checkpoint tiene 51.668.614 parámetros (unos 0,2 GB en safetensors) y licencia Apache 2.0, lo que facilita su reutilización comercial. No se han publicado resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La política combina un codificador de imágenes (procesa las dos vistas de 3x480x640) con un transformer que modela la secuencia de estados y acciones, y un decodificador que emite chunks de acciones de dimensión 6. La entrada de estado es un vector de 6 dimensiones (`observation.state`) y la salida es un vector de acción de 6 dimensiones por paso. El entrenamiento se realizó con LeRobot 0.6.2 durante 100.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-05, con semilla 1000.

Los datos provienen exclusivamente de teleoperación sobre el robot SO-101: 52 episodios, 27.886 fotogramas a 30 FPS, una única tarea ("Pick up the cube and place it in the bin"). No se documenta composición adicional del dataset, aumento de datos, RLHF ni DPO. Tampoco se especifican innovaciones adicionales más allá del propio mecanismo de action chunking del método ACT.

## Capacidades

- Control visuomotor de un robot SO-101 (`so_follower`) a partir de dos cámaras (muñeca y externa) y del estado articular.
- Predicción de chunks de acciones de 6 dimensiones para ejecución continua a 30 FPS.
- Ejecución de una tarea de manipulación concreta: coger un cubo y colocarlo en una papelera.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa explícita).
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- Replicación de la tarea de pick-and-place: desplegar la política con `lerobot-rollout` sobre un SO-101 calibrado para reproducir la secuencia "coger cubo y dejarlo en la papelera" en un entorno controlado.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train` sobre un dataset propio del mismo robot y formato para adaptar la política a nuevas posiciones de objeto o contenedores.
- Banco de pruebas de hardware SO-101: validar la cadena completa (cámaras, calibración, puerto serie, FPS) antes de invertir en datasets mayores.
- Docencia y divulgación en aprendizaje por imitación: ejemplo reproducible y ligero (0,2 GB) para explicar action chunking y el flujo de LeRobot de extremo a extremo.
- Evaluación comparativa de configuraciones de cámara: al usar dos vistas (muñeca y externa), permite estudiar el impacto de la percepción multi-cámara en la tasa de éxito.
- Base para experimentos de robustez: medir degradación ante cambios de iluminación, posiciones del cubo o distracciones, dado que la model card carece de evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en safetensors (0,2 GB), la política cabe holgadamente en cualquier GPU consumer con 4 GB o más, e incluso podría ejecutarse en CPU para pruebas.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia en tiempo real a 30 FPS; A100/H100 no son necesarias para el despliegue, aunque aceleran el reentrenamiento.
- Cabe en GPU consumer: sí, en cualquier GPU moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--strategy.type=base`; el entrenamiento se realiza con `lerobot-train` en dispositivo `cuda`.
- Latencia y throughput: no disponibles en la información proporcionada; la política está pensada para operar a 30 FPS según el dataset, pero no se documentan medidas reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shamux/act_so101_2cam | 51,7 M | no aplica | Pick-and-place SO-101 con 2 cámaras | apache-2.0 | Hugging Face (26 descargas) |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | Manipulación genérica | variable | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | no disponible | no aplica | Manipulación genérica | variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 52 episodios de una única tarea, la política probablemente sobreajusta posiciones, iluminación y disposición del cubo vistas en el dataset.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje, solo la instrucción fija de la tarea.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de las dependencias (LeRobot, ACT) y del dataset asociado.
- Caveats para producción: no hay evaluación en robot real publicada; el rendimiento real es desconocido. La política está atada al robot `so_follower`, a la configuración de cámaras (`wrist`, `external`) y a la resolución 480x640; cambios en el hardware o en la calibración pueden invalidarla.
- El repo es pequeño (0,2 GB) y tiene pocas descargas (26); no hay evidencia de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shamux/act_so101_2cam
- Dataset de entrenamiento: https://huggingface.co/datasets/shamux/so101_cube_2cam
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shamux/so101_cube_2cam
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
