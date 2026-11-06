# mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__static__groot__seed_0

## Resumen

Este repositorio contiene una política de imitación robótica entrenada con LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades en robots humanoides. El modelo combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching que predice acciones condicionadas por visión, lenguaje y propiocepción. En concreto, esta instancia está especializada en una tarea de pick-and-place sobre un robot Franka Panda simulado.

El checkpoint ha sido entrenado sobre el dataset `train_800_dense__mask__overlay_a75__sim__all_cameras__static`, con 776 episodios y 207.203 frames a 20 FPS, cubriendo 40 variantes de la tarea "Pick the X and place it into the box" con objetos domésticos distintos (jam, cereal, pear, sweet potato, etc.). La política consume estado propioceptivo de 9 dimensiones y tres cámaras a 224x224 (agentview, eye-in-hand y eye-in-hand_2), y produce vectores de acción de 7 dimensiones.

Su relevancia radica en que demuestra el flujo completo de LeRobot 0.6.0 para ajustar un modelo fundacional robótico de 3.144 millones de parámetros sobre un dataset concreto, con licencia Apache 2.0 y pesos en safetensors. Es un artefacto de investigación reproducible (semilla 0, 60.000 pasos, batch 16) más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las observaciones visuales y la instrucción en lenguaje natural, acoplado a un transformer de acciones entrenado con flow matching que genera las acciones motrices condicionadas por visión, lenguaje y propiocepción. El modelo es cross-embodiment, es decir, está pensado para transferirse entre distintas morfologías de robot; en este checkpoint la morfología concreta es un Franka Panda con tres cámaras.

El ajuste se realizó con LeRobot 0.6.0 durante 60.000 pasos, batch size 16, optimizador AdamW y learning rate 7e-05, con semilla 0. El dataset de entrenamiento contiene 776 episodios y 207.203 frames a 20 FPS, con 40 instrucciones de tarea distintas que comparten la estructura "Pick the <objeto> and place it into the box". No se documenta en la información disponible el número de tokens de entrenamiento del backbone, la composición del corpus original de GR00T ni si hubo etapas de RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas de 7 dimensiones (posición y orientación del efector, más pinza) a partir de observaciones multimodales.
- Fusión de tres vistas de cámara (agentview, eye-in-hand, eye-in-hand_2) con estado propioceptivo de 9 dimensiones.
- Condicionamiento por instrucción en lenguaje natural: la política distingue entre 40 objetos distintos dentro de la misma tarea de pick-and-place.
- Generalización cross-embodiment heredada del backbone GR00T N1.7 (no validada específicamente en este checkpoint).
- Razonamiento viso-lingüístico a través del backbone Qwen3-VL, aunque la salida efectiva es acción, no texto.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.
- No se documentan capacidades de audio ni modos de "thinking" explícitos.

## Casos de uso

- Manipulación pick-and-place en simulación: el modelo está entrenado exactamente para recoger 40 objetos domésticos y depositarlos en una caja sobre un Panda simulado; es el caso de uso directo y validado.
- Generación de datos sintéticos de demostración: al ejecutar la política sobre el simulador se pueden producir trayectorias adicionales para ampliar datasets de imitación.
- Baseline de referencia en experimentos de imitation learning: sirve para comparar nuevas políticas contra un GR00T N1.7 ajustado con receta estándar de LeRobot.
- Estudio de transferencia cross-embodiment: el backbone está diseñado para generalizar entre robots, por lo que este checkpoint puede servir como punto de partida para fine-tuning en otras morfologías.
- Evaluación de robustez ante variaciones visuales: el nombre del dataset sugiere variantes de máscara y overlay (a75), útiles para medir sensibilidad a cambios en la representación de entrada.
- Docencia y reproducción de pipelines LeRobot: la receta completa (pasos, batch, LR, semilla) permite reproducir el entrenamiento de principio a fin.
- Investigación en condicionamiento por lenguaje en robótica: las 40 instrucciones permiten analizar si la política discrimina objetos por su descripción textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.144 millones de parámetros, en fp16 el peso ronda los 6,3 GB y en fp32 unos 12,6 GB, a lo que hay que sumar activaciones del backbone visión-lenguaje y de las tres cámaras.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU con 16-24 GB de VRAM es un punto de partida razonable para fp16, aunque no está confirmado.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) y posiblemente en RTX 4080 (16 GB) en fp16, pero no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), que es el método documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política de acción.
- Latencia y throughput: no disponibles. El dataset se grabó a 20 FPS, lo que da una referencia de la frecuencia de control esperada, pero no se documenta el rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 ajustado) | 3.144 M | no disponible | Pick-and-place Panda simulado | Apache 2.0 | Hugging Face, 16 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional robótico general | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Imitation learning por tarea | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: entrenado solo para pick-and-place de 40 objetos domésticos sobre un Panda simulado; no se debe esperar generalización a otras tareas sin fine-tuning.
- Entrenado en simulación: el dominio visual del dataset es simulado, por lo que el gap sim-to-real no está caracterizado.
- Sin benchmarks publicados: no hay métricas de éxito ni comparaciones que permitan estimar su calidad real.
- Sesgos: no documentados por el autor; al estar limitado a objetos domésticos de un catálogo concreto, hereda los sesgos de ese dataset.
- Riesgo de alucinación de acciones: como política de flow matching, puede generar trayectorias plausibles pero incorrectas ante entradas fuera de distribución.
- Idiomas: las instrucciones del dataset están en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Repositorio de 50,3 GB: el despliegue requiere espacio en disco considerable además de la VRAM.
- Fecha de creación en 2026 y solo 16 descargas: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__static__groot__seed_0
- Dataset: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__static
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__static
- GR00T N1.7 (NVIDIA Isaac-GR00T): https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
