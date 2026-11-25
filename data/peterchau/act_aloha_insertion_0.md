# peterchau/act_aloha_insertion_0

## Resumen

`peterchau/act_aloha_insertion_0` es una política de imitación (imitation learning) entrenada con el método Action Chunking with Transformers (ACT) y publicada en Hugging Face Hub a través de la librería LeRobot. El modelo resuelve una tarea robótica concreta de manipulación: insertar una clavija (peg) en un receptáculo (socket) sobre un robot ALOHA simulado. No es un modelo de lenguaje, sino una política visuomotora que consume una imagen de cámara y el estado de las articulaciones para producir comandos de acción de 14 dimensiones.

El desarrollo corre a cargo del usuario `peterchau` y se presenta como un fine-tuning del checkpoint `peterchau/act_aloha_test_0`. El modelo tiene 51.685.006 parámetros y un peso de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras aptas para inferencia en tiempo real sobre hardware modesto. El contexto no es textual: la "ventana" efectiva es la observación visual de 480x640 píxeles junto con el vector de estado de 14 valores.

Su relevancia es fundamentalmente práctica y educativa: sirve como ejemplo reproducible de un pipeline completo de LeRobot (dataset, entrenamiento, rollout) para la tarea `aloha_sim_insertion_human`. La configuración de entrenamiento documentada es extremadamente corta (100 pasos, batch size 2, learning rate 1e-05), lo que sugiere un modelo de demostración o prueba más que un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada visual (3, 480, 640) + estado (14,) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tipo de robot | aloha |
| Camaras | top |
| Entrada visual | observation.images.top, forma (3, 480, 640) |
| Entrada de estado | observation.state, forma (14,) |
| Salida de accion | action, forma (14,) |
| Modelo base | peterchau/act_aloha_test_0 |
| Dataset de entrenamiento | lerobot/aloha_sim_insertion_human |
| Tarea | "Insert the peg into the socket." |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un método de imitation learning que predice fragmentos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina. La arquitectura combina un backbone transformer con un codificador de imágenes (para la cámara `top`) y un decodificador que genera el vector de acción de 14 dimensiones correspondiente al robot ALOHA. El modelo se inicializa desde `peterchau/act_aloha_test_0` y se ajusta de forma supervisada sobre demostraciones teleoperadas.

El entrenamiento se realizó con el dataset `lerobot/aloha_sim_insertion_human`, compuesto por 50 episodios y 25.000 fotogramas a 50 FPS. La configuración documentada es mínima: 100 pasos de entrenamiento, batch size 2, optimizador AdamW, learning rate 1e-05 y semilla 1000, con LeRobot 0.7.1. No se documenta el número total de tokens (no aplica), la composición del dataset más allá del número de episodios, ni si hubo RLHF/DPO (no procede en imitation learning). La innovación técnica relevante es el propio action chunking de ACT, que permite alta tasa de éxito en tareas de inserción a partir de datos teleoperados.

## Capacidades

- Predicción de acciones robóticas de 14 dimensiones para un robot ALOHA a partir de una imagen de cámara y el estado de las articulaciones.
- Control visuomotor para la tarea específica de inserción de una clavija en un receptáculo ("Insert the peg into the socket.").
- Aprendizaje por imitación a partir de demostraciones teleoperadas (50 episodios, 25.000 fotogramas).
- Predicción de chunks de acciones (action chunking), lo que aporta estabilidad frente a la predicción paso a paso.
- Integración con el ecosistema LeRobot para rollout (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo thinking: es una política robótica especializada, no un modelo generativo de propósito general.

## Casos de uso

- Reproducción de un pipeline de imitation learning: usar el modelo como referencia para validar la instalación de LeRobot y ejecutar un rollout completo con `lerobot-rollout` sobre un robot ALOHA simulado, verificando que la cadena de dependencias funciona.
- Docencia y formación en robótica: servir de ejemplo mínimo y reproducible de ACT para explicar action chunking, codificación visual y mapeo estado-acción en un curso o taller.
- Punto de partida para fine-tuning: reentrenar desde `peterchau/act_aloha_test_0` con un dataset propio y usar este checkpoint como baseline de comparación de tasas de éxito.
- Pruebas de integración de hardware: validar la configuración de cámaras (`top`), puertos y frecuencias (640x480, 30 FPS en rollout frente a 50 FPS en entrenamiento) antes de desplegar políticas más entrenadas.
- Benchmark interno de infraestructura: medir latencia y throughput de inferencia de una política de ~51,7 M de parámetros en el hardware objetivo antes de escalar a modelos mayores.
- Generación de datos sintéticos de validación: ejecutar la política en simulación para producir trayectorias de referencia y comparar contra demostraciones humanas del dataset `aloha_sim_insertion_human`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors (0,2 GB de repo) es esperable que quepa en GPUs consumer de gama media, pero no se documenta la huella exacta en VRAM.
- GPU recomendadas: no disponible; el comando de entrenamiento de la model card usa `--policy.device=cuda` sin especificar modelo de GPU.
- Cabe en GPU consumer: previsiblemente sí por tamaño, aunque no hay confirmación oficial ni lista de GPUs validadas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponible. El entrenamiento usó 50 FPS de captura y el ejemplo de rollout configura cámaras a 30 FPS, pero no se publican métricas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| peterchau/act_aloha_insertion_0 | 51.685.006 | imagen (3,480,640) + estado (14,) | Inserción ALOHA sim | no disponible | Hugging Face (LeRobot) |
| peterchau/act_aloha_test_0 | no disponible | no disponible | Base de fine-tuning | no disponible | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | no disponible | no disponible | Manipulación con ALOHA | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una única tarea ("Insert the peg into the socket.") y en un único tipo de robot (ALOHA); no generaliza a otras tareas sin reentrenamiento.
- Entrenado sobre datos de simulación (`aloha_sim_insertion_human`); el transfer a robot real no está validado ni documentado.
- Configuración de entrenamiento muy reducida (100 pasos, batch size 2), lo que sugiere un artefacto de prueba o demostración más que un modelo listo para producción.
- Sin resultados de evaluación publicados: no hay tasa de éxito ni métricas que respalden su rendimiento.
- Licencia no especificada: no se puede confirmar el uso comercial; la model card indica "[More Information Needed]".
- Dependencia estricta de la cámara `top` y de la disposición exacta de las observaciones; cambios de cámara, iluminación, posiciones de objetos o robot del mismo tipo pueden degradar el comportamiento.
- Riesgo de sobreajuste a las condiciones del dataset (50 episodios) y de fallo ante distribuciones fuera de la simulación.
- No es un modelo de lenguaje: no aplican sesgos lingüísticos ni alucinación textual, pero sí puede producir acciones erróneas o inseguras en el robot.
- Frecuencia de entrenamiento (50 FPS) distinta de la del ejemplo de rollout (30 FPS): conviene revisar la coherencia temporal antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/peterchau/act_aloha_insertion_0
- Modelo base: https://huggingface.co/peterchau/act_aloha_test_0
- Dataset: https://huggingface.co/datasets/lerobot/aloha_sim_insertion_human
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/aloha_sim_insertion_human
