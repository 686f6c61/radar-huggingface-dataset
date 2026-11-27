# SamerAyyad/VLA_Samer_22.11.2026_200eps_policy_GR00T

## Resumen

Este repositorio contiene una política de robótica entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA, un modelo abierto y cross-embodiment diseñado para razonamiento y habilidades generalizadas en robots humanoides. La política ha sido ajustada para una tarea concreta de manipulación sobre un robot UR5: recoger una CPU con una ventosa y colocarla en una caja. El modelo combina un backbone vision-language Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice acciones condicionadas por visión, lenguaje y propiocepción.

El artefacto es un checkpoint de imitación (behavior cloning) de aproximadamente 3.144 millones de parámetros y 12,6 GB en formato safetensors, entrenado durante 20.000 pasos con batch size 64, optimizador AdamW y learning rate 1e-4 sobre un dataset de 200 episodios y 128.036 frames a 30 FPS. Es relevante porque demuestra el flujo completo de LeRobot para ajustar un modelo fundacional de robótica a un hardware y una tarea específicos, publicando tanto los pesos como el dataset de entrenamiento.

Conviene subrayar que se trata de una política de nicho: un único robot (UR5), una única cámara, un único estado de 7 dimensiones y una única tarea. No hay resultados de evaluación publicados ni métricas de éxito en robot real, por lo que su utilidad práctica debe validarse empíricamente antes de cualquier despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone vision-language Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7 de NVIDIA: un backbone vision-language (Cosmos-Reason2/Qwen3-VL) que procesa la observación visual y la instrucción en lenguaje natural, acoplado a un transformer de acciones que genera trayectorias mediante flow matching. La política consume una imagen RGB de 3x480x640 y un vector de estado de 7 dimensiones, y produce una acción de 7 dimensiones por paso. El entrenamiento se realizó con LeRobot 0.6.2 en modo imitación sobre el dataset `SamerAyyad/VLA_Samer_22.11.2026_200eps`, compuesto por 200 episodios y 128.036 frames a 30 FPS de la tarea "Pick up the CPU with the suction gripper and place it in the box".

La configuración de entrenamiento reportada es de 20.000 pasos, batch size 64, optimizador AdamW, learning rate 0,0001 y semilla 42. No se documenta el número de tokens de entrenamiento del backbone, la composición del dataset más allá de la tarea, ni si hubo etapas de RLHF o DPO; al tratarse de una política de imitación supervisada, lo esperable es que no las haya. Tampoco se detalla ninguna innovación adicional más allá de las propias del modelo base GR00T N1.7.

## Capacidades

- Generación de acciones de control robótico de 7 dimensiones condicionadas por imagen, estado proprioceptivo e instrucción en lenguaje natural.
- Ejecución de una tarea de manipulación concreta: recoger una CPU con ventosa y depositarla en una caja, sobre un robot UR5.
- Percepción visual monocámara a resolución 480x640.
- Condicionamiento por prompt de tarea en lenguaje natural (la cadena de la tarea debe coincidir con la usada en entrenamiento).
- Integración con el ecosistema LeRobot para rollout (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- No se documentan capacidades de tool calling, razonamiento multi-paso, multilingüismo, visión general, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Automatización de una celda de ensamblaje con UR5: la política ejecuta el ciclo pick-and-place de una CPU con ventosa, adecuada para prototipos de línea de montaje donde se repite la misma operación.
- Base para fine-tuning en tareas de pick-and-place similares: al estar construida sobre GR00T N1.7 y LeRobot, sirve como punto de partida para reentrenar con nuevos datasets y objetos.
- Validación de pipelines de imitación end-to-end: útil para equipos que quieren probar el flujo completo de LeRobot (grabación, entrenamiento, rollout) antes de invertir en datasets mayores.
- Investigación en cross-embodiment: permite estudiar cómo se transfiere un modelo fundacional a un brazo industrial UR5 con una sola cámara.
- Benchmark interno de hardware y latencia: al tener 3.144 millones de parámetros y 12,6 GB de pesos, sirve para medir requisitos de GPU y throughput en inferencia robótica.
- Docencia y demostraciones de robótica con IA: el par política + dataset público facilita reproducir el experimento en laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.144 millones de parámetros en safetensors (12,6 GB de repo), en FP16 se requieren del orden de 6-7 GB solo para pesos, más memoria para el backbone vision-language y activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU con 16-24 GB (RTX 4090, L4, A10) es un punto de partida razonable, y A100/H100 para entrenamiento o mayor throughput.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas de 16 GB o más en precisión reducida, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el método documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamerAyyad/VLA_Samer_22.11.2026_200eps_policy_GR00T | 3.144 M | no disponible | Pick-and-place UR5 | Apache 2.0 | Hugging Face |
| GR00T N1.7 (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas LeRobot ACT/Diffusion | no disponible | no disponible | Imitación por tarea | no disponible | Hugging Face / LeRobot |

## Limitaciones y advertencias

- Política de nicho: entrenada para un único robot (UR5), una única cámara y una única tarea; no generaliza a otros objetos, posiciones o robots sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que el rendimiento es desconocido.
- Dataset pequeño: 200 episodios y 128.036 frames limitan la robustez frente a variaciones de iluminación, posiciones o distractores.
- Riesgo de sobreajuste al entorno de grabación y a la instrucción exacta de la tarea.
- Sin información sobre sesgos, multilingüismo ni comportamiento fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento físico del robot recae en el integrador.
- No se documentan requisitos de seguridad para operar el brazo robótico con esta política.

## Enlaces

- Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_22.11.2026_200eps_policy_GR00T
- Dataset: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_22.11.2026_200eps
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamerAyyad/VLA_Samer_22.11.2026_200eps
- GR00T N1.7 (NVIDIA): https://github.com/NVIDIA/Isaac-GR00T
- LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
