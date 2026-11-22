# Sergio23g/act_open_box

## Resumen

`Sergio23g/act_open_box` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado con LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real, y está especializado en una única tarea: abrir la tapa de una caja. Se trata de un artefacto de investigación de nicho, no de un modelo de lenguaje de propósito general.

La política consume el estado del robot (vector de 6 dimensiones) y dos cámaras (muñeca y superior, a 480x640 píxeles) y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto que cabe holgadamente en cualquier GPU consumer. Su relevancia es limitada: sirve como ejemplo reproducible de entrenamiento de políticas visuomotoras con LeRobot sobre un robot `so_follower` (SO-100/SO-101 de bajo coste).

El entrenamiento se realizó sobre el dataset `Sergio23g/open_box`, con solo 10 episodios y 4116 frames a 30 FPS. Esta escala tan reducida condiciona fuertemente su generalización y su valor práctico fuera del entorno exacto de grabación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por frame, no secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice chunks de acciones (varias acciones futuras de golpe) en lugar de un único paso, lo que reduce el error de compounding y mejora la estabilidad en tareas de manipulación. La arquitectura combina un backbone visual (procesa las dos cámaras de 3x480x640) con un transformer que fusiona las observaciones visuales y el estado del robot para emitir secuencias de acciones. El modelo está empaquetado en formato LeRobot y se ejecuta con `lerobot-rollout`.

El entrenamiento se realizó durante 10.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.7.1. El dataset contiene únicamente 10 episodios (4116 frames a 30 FPS) de la tarea "Open the box lid" sobre un robot `so_follower` con cámaras `wrist` y `top`. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; es aprendizaje supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` para la tarea concreta de abrir la tapa de una caja.
- Predicción de chunks de acciones de 6 dimensiones a partir de estado (6,) y dos imágenes RGB de 480x640.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa explícita).
- Ejecución en tiempo real a 30 FPS mediante `lerobot-rollout`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de la tarea "Open the box lid": ejecutar la política sobre un robot `so_follower` con las mismas cámaras y disposición para abrir la tapa de una caja, usando `lerobot-rollout` con `--policy.path=Sergio23g/act_open_box`.
- Plantilla de entrenamiento con LeRobot: servir como referencia de configuración (ACT, 10k pasos, batch 8, lr 1e-05) para entrenar políticas propias con `lerobot-train` sobre datasets pequeños.
- Validación de pipeline de imitación: comprobar el flujo completo grabación de datos, entrenamiento, publicación en el Hub y despliegue en robot real.
- Docencia y demostraciones: ejemplo mínimo de política visuomotora para talleres sobre robótica de bajo coste con SO-100/SO-101.
- Benchmark interno de infraestructura: medir latencia y throughput de inferencia de ACT en distintas GPUs con un modelo de 51,7 M de parámetros.
- Base para fine-tuning: punto de partida para adaptar la política a tareas de manipulación similares (apertura de contenedores) con datos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (51,7 M de parámetros, ~207 MB de pesos) más el coste de los dos streams de cámara a 480x640; en la práctica cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA; RTX 3060, RTX 4090, A100 o H100 son sobradas. También es viable en CPU para pruebas, aunque con mayor latencia.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas (GTX 1650 en adelante).
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot); el formato safetensors es compatible con PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El control opera a 30 FPS según la configuración del dataset y del robot, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Sergio23g/act_open_box` | 51,7 M | no aplica | Abrir tapa de caja (SO follower) | no disponible | Hugging Face, 0 descargas |
| ACT (implementación de referencia LeRobot) | ~51 M (configuración típica) | no aplica | Manipulación genérica por imitación | Apache-2.0 (LeRobot) | GitHub huggingface/lerobot |
| Diffusion Policy (LeRobot) | variable según configuración | no aplica | Manipulación por imitación | Apache-2.0 (LeRobot) | GitHub huggingface/lerobot |
| SmolVLA (Hugging Face) | ~450 M | no aplica | Política VLA generalista | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado con solo 10 episodios y 4116 frames: generalización muy limitada, probable sobreajuste al entorno exacto de grabación (posiciones, iluminación, fondo).
- Sin resultados de evaluación publicados: no hay evidencia cuantitativa de tasa de éxito.
- Específico de un robot `so_follower` con cámaras `wrist` y `top` en posiciones concretas; cambiar la configuración o el robot invalida la política.
- Licencia no especificada ("More Information Needed"): no se puede asumir uso comercial sin consultar al autor.
- Sin capacidades de lenguaje, razonamiento ni tool calling; no es un modelo de propósito general.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí de acciones erráticas fuera de la distribución de entrenamiento.
- No se documentan sesgos, pero el dataset reducido implica un sesgo fuerte hacia las condiciones de demostración.
- Para producción se requiere validación en robot real con múltiples ensayos y condiciones variadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sergio23g/act_open_box
- Dataset de entrenamiento: https://huggingface.co/datasets/Sergio23g/open_box
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Sergio23g/open_box
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
