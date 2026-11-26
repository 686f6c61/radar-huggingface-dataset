# chrisw-shadow/thread_nut_dit_hil_v3

## Resumen

`thread_nut_dit_hil_v3` es una política de aprendizaje por imitación para robótica real publicada en Hugging Face por el usuario `chrisw-shadow`. Se trata de un modelo de la familia Multi-Task Diffusion Transformer (DiT), entrenado con la librería LeRobot de Hugging Face, que combina un transformer de difusión de gran tamaño con condicionamiento texto-visual para aprender tareas robóticas a partir de demostraciones. El modelo resuelve una tarea concreta de manipulación fina: agarrar una tuerca y enroscarla en un perno orientado hacia arriba.

El modelo cuenta con 238.312.213 parámetros reales (según los pesos en safetensors), aunque la model card describe la arquitectura genérica `multi_task_dit` como de aproximadamente 450M de parámetros, por lo que el checkpoint publicado parece ser una variante reducida o parcialmente congelada. Está entrenado sobre el dataset `chrisw-shadow/nut_5_hil_merged_subset_rel` (129 episodios, 100.522 fotogramas a 50 FPS) y se ejecuta sobre un robot UR10e con pinza Dexee y tres cámaras (fija y dos de muñeca).

Es relevante ahora porque ejemplifica el flujo actual de LeRobot para políticas robóticas de código abierto: entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout` y pesos en formato safetensors listos para el Hub. No obstante, su utilidad es muy específica (una única tarea, un único robot) y carece de licencia declarada, evaluación publicada y benchmarks, lo que limita su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) con condicionamiento texto + visión, objetivos de difusión y flow-matching |
| Parametros totales | 238.312.213 (pesos safetensors); la model card describe la familia como ~450M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje; horizonte de acción no especificado) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (condicionamiento textual en inglés en la tarea de entrenamiento) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura es un Diffusion Transformer (DiT) multitarea que extiende Diffusion Policy con un transformer de difusión grande y condicionamiento conjunto de texto e imágenes, según el paper referenciado (arXiv:2507.05331). Soporta tanto objetivos de difusión como de flow-matching. La política consume `observation.state` de dimensión 39 y tres imágenes RGB de 480×640 (cámara fija, `wrist_1` y `wrist_2`), y produce un vector de acción de dimensión 21. El robot objetivo es un `ur10e_dexee`.

El entrenamiento se realizó con LeRobot 0.7.0 durante 60.000 pasos, batch size 96, optimizador Adam, learning rate 2e-5 y semilla 1000, sobre el dataset `nut_5_hil_merged_subset_rel` (129 episodios, 100.522 fotogramas a 50 FPS). La tarea es "grasp the nut and then thread it onto the upwards facing bolt". No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF/DPO (no aplica típicamente a imitación robótica). El sufijo `hil` sugiere Human-In-the-Loop, pero no se detalla el protocolo.

## Capacidades

- Control robótico de manipulación fina: agarre y enroscado de una tuerca en un perno orientado hacia arriba.
- Política de imitación multimodal: condicionada por estado propioceptivo (39 dimensiones) y tres vistas de cámara.
- Condicionamiento por lenguaje natural: acepta una instrucción textual de tarea (`--task="grasp the nut and then thread it onto the upwards facing bolt."`).
- Generación de acciones continuas de 21 dimensiones a partir de observaciones visuales y de estado.
- Soporte de objetivos de difusión y flow-matching (según la arquitectura `multi_task_dit`).
- Integración con el ecosistema LeRobot para entrenamiento (`lerobot-train`) y despliegue (`lerobot-rollout`).
- No dispone de tool calling, function calling, razonamiento multi-paso genérico ni capacidades de visión generales fuera del dominio robótico.

## Casos de uso

- Automatización de ensamblaje con tuerca y perno: el modelo ejecuta la secuencia completa de agarre y enroscado sobre un UR10e con pinza Dexee, usando las tres cámaras para corregir la alineación durante la inserción.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para reproducir el pipeline `multi_task_dit` de LeRobot y comparar variantes de condicionamiento texto-visual.
- Prototipado de políticas visuomotoras en laboratorio: permite validar la integración de `lerobot-rollout` con un robot real y cámaras OpenCV antes de escalar a tareas más complejas.
- Benchmark interno de manipulación fina: al estar acotado a una tarea de alta precisión, es útil para medir tasas de éxito y latencia en configuraciones de hardware concretas.
- Docencia y formación en robótica: ilustra el flujo completo de grabación de datos, entrenamiento con `lerobot-train` y despliegue con `lerobot-rollout` en un caso realista de enroscado.
- Base para fine-tuning con HIL: el sufijo `hil` y el dataset de 129 episodios permiten partir de este checkpoint para añadir nuevas posiciones de objeto o variaciones de iluminación mediante demostraciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota "_No evaluation results have been provided for this policy yet._" y no reporta tasas de éxito, latencia ni métricas de control.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 238M de parámetros en safetensors (fp32) el peso ocupa aproximadamente 1 GB, por lo que la inferencia en GPU requiere del orden de 2-4 GB de VRAM incluyendo activaciones y tres flujos de imagen 480×640.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090, A100 o H100 son sobredimensionadas para este checkpoint, y una GPU consumer de gama media debería bastar.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=chrisw-shadow/thread_nut_dit_hil_v3`), con soporte de `--policy.device=cuda` para entrenamiento. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles. El dataset se grabó a 50 FPS, pero no se indica la frecuencia de control efectiva del despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chrisw-shadow/thread_nut_dit_hil_v3` | 238M (safetensors) | no disponible | Enroscado de tuerca en UR10e Dexee | no disponible | Hugging Face (LeRobot) |
| Diffusion Policy (original) | no disponible | no disponible | Manipulación visomotora genérica | MIT (repo público) | Repo académico |
| `multi_task_dit` (referencia del paper, ~450M) | ~450M | no disponible | Multitarea con texto + visión | no disponible | Paper arXiv:2507.05331 |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un único dataset y una única tarea, el modelo está fuertemente sesgado hacia la posición, iluminación y configuración de cámara del entorno de grabación.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones incorrectas o inseguras fuera de la distribución de entrenamiento (por ejemplo, con objetos distintos o el perno en otra orientación).
- Limitaciones de contexto e idioma: la instrucción de tarea está en inglés y acotada a una frase concreta; no se documenta generalización a otras instrucciones ni a otros idiomas.
- Restricciones de licencia: la licencia no está declarada ("More Information Needed"), por lo que no se puede asumir uso comercial sin contactar al autor.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real reportadas, lo que impide estimar su fiabilidad en producción.
- Dependencia de hardware específico: diseñado para `ur10e_dexee` con tres cámaras concretas (`fixed`, `wrist_1`, `wrist_2`); los nombres e índices de cámara deben coincidir con las claves de observación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- El número de parámetros real (238M) difiere del ~450M descrito para la arquitectura, lo que conviene verificar antes de asumir equivalencia con el modelo del paper.

## Enlaces

- Hugging Face: https://huggingface.co/chrisw-shadow/thread_nut_dit_hil_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/chrisw-shadow/nut_5_hil_merged_subset_rel
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chrisw-shadow/nut_5_hil_merged_subset_rel
- Paper de la arquitectura: https://huggingface.co/papers/2507.05331 (arXiv:2507.05331)
- Guía LeRobot multi_task_dit: https://huggingface.co/docs/lerobot/main/en/multi_task_dit
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
