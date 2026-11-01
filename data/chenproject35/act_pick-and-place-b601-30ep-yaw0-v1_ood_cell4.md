# chenproject35/act_pick-and-place-b601-30ep-yaw0-v1_ood_cell4

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación robótica. Este repositorio concreto, `chenproject35/act_pick-and-place-b601-30ep-yaw0-v1_ood_cell4`, es una política entrenada con LeRobot sobre el robot `rebot_b601_follower` para la tarea "Pick up inreach2 and place it in the jig", es decir, recoger un objeto y colocarlo en un útil de montaje.

El modelo consume el estado articular de 7 dimensiones y dos flujos de imagen RGB de 480x640 (cámara frontal y cámara de muñeca), y produce un vector de acción de 7 dimensiones. Cuenta con 51.670.663 parámetros y se distribuye en formato safetensors dentro del ecosistema LeRobot, con licencia Apache 2.0.

Su relevancia es acotada pero clara: es un ejemplo reproducible de política visomotora entrenada con solo 30 episodios (27.577 fotogramas a 30 FPS), útil como referencia para evaluar generalización fuera de distribución (el sufijo `ood_cell4` sugiere una variante de evaluación OOD) y como plantilla para pipelines de imitación en robótica de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acción |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; ventana de observación definida por la configuración de entrenamiento, no documentada) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación visomotora que predice un chunk de acciones futuras a partir de observaciones multimodales. La política combina un codificador de imágenes (procesa `cam_front` y `cam_wrist` a 3x480x640), la proyección del estado articular de 7 dimensiones y un decodificador que genera acciones de 7 dimensiones. La predicción por chunks mitiga el problema de horizonte temporal y el error compuesto típico de políticas paso a paso.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `chenproject35/pick-and-place-b601-30ep-yaw0-v1`: 30 episodios, 27.577 fotogramas a 30 FPS, tarea única "Pick up inreach2 and place it in the jig". Configuración: 50.000 pasos, batch size 4, optimizador AdamW, learning rate 1e-5, semilla 1000. No se documenta el uso de RLHF, DPO ni aumentos de datos adicionales. El nombre del repositorio indica una variante de evaluación fuera de distribución (`ood_cell4`), aunque la model card no detalla el protocolo OOD.

## Capacidades

- Control visomotor de manipulación robótica: genera comandos de acción de 7 dimensiones a partir de dos cámaras y el estado articular.
- Predicción de chunks de acción, lo que permite ejecución más suave y menor acumulación de error.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (30 episodios).
- Ejecución en bucle cerrado a 30 FPS mediante `lerobot-rollout`.
- No soporta tool calling, function calling ni razonamiento multi-paso simbólico.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".
- Específico para el robot `rebot_b601_follower` y la tarea de pick-and-place entrenada.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: la política recoge el objeto `inreach2` y lo inserta en el útil (jig) usando las dos cámaras; adecuada para ciclos repetitivos con posiciones similares a las de entrenamiento.
- Referencia para evaluación de generalización OOD: el sufijo `ood_cell4` permite comparar el rendimiento en celdas o configuraciones no vistas durante el entrenamiento, midiendo la robustez del chunking de acciones.
- Base para fine-tuning con nuevos datasets: al estar en formato LeRobot y licencia Apache 2.0, sirve como inicialización para tareas de manipulación similares con pocos episodios adicionales.
- Banco de pruebas de pipelines de imitación de bajo coste: 30 episodios y 50.000 pasos son un presupuesto asequible para validar hardware, calibración de cámaras y tasas de éxito antes de escalar.
- Integración en entornos de simulación o gemelos digitales: la política puede ejecutarse contra un robot simulado compatible con la interfaz `rebot_b601_follower` para pruebas de regresión.
- Docencia y reproducción de ACT: ejemplo completo y ligero (51,7 M de parámetros) para ilustrar el flujo `lerobot-train` → `lerobot-rollout` con datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en fp32 el peso ocupa aproximadamente 0,2 GB, por lo que la memoria dominante proviene de los dos flujos de imagen 480x640 y del runtime, no de los pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para inferencia; se recomienda una RTX 3060/4060 o superior para mantener 30 FPS estables con dos cámaras.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660 Super, RTX 2060, RTX 3050 y superiores; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a políticas de control).
- Latencia y throughput estimados: no disponibles; el bucle de control opera a 30 FPS según la tasa del dataset, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_pick-and-place-b601-30ep-yaw0-v1_ood_cell4 (este) | 51,7 M | 2 imagenes 480x640 + estado 7D | Pick-and-place en rebot_b601_follower | Apache 2.0 | HuggingFace, LeRobot |
| ACT original (paper 2304.13705) | no disponible en la informacion | no disponible | Manipulacion general (ALOHA) | codigo abierto (paper) | Referencia academica |
| Otras politicas LeRobot (p. ej. Diffusion Policy, pi0) | no disponible en la informacion | no disponible | Manipulacion | variable | HuggingFace, LeRobot |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenada con solo 30 episodios y una única tarea; la generalización a nuevas posiciones, objetos o iluminación es limitada y no está cuantificada.
- El sufijo `ood_cell4` sugiere evaluación fuera de distribución, pero no se documenta el protocolo ni los resultados; no debe asumirse robustez OOD.
- Riesgo de sobreajuste al layout de cámaras y a la calibración del robot `rebot_b601_follower`; cambios en la montura o en los índices de cámara invalidan la política.
- Sin resultados de éxito publicados: no hay evidencia cuantitativa de tasa de acierto en producción.
- Dependencia del ecosistema LeRobot 0.6.2 y de la interfaz de observación exacta (`observation.images.cam_front`, `observation.images.cam_wrist`, `observation.state`).
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre seguridad física del robot recae en el integrador.
- No apta para tareas lingüísticas, de razonamiento o de visión general; su ámbito es exclusivamente el control visomotor.
- No se documentan sesgos de datos más allá de la composición del dataset de teleoperación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chenproject35/act_pick-and-place-b601-30ep-yaw0-v1_ood_cell4
- Dataset de entrenamiento: https://huggingface.co/datasets/chenproject35/pick-and-place-b601-30ep-yaw0-v1
- Paper ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chenproject35/pick-and-place-b601-30ep-yaw0-v1
