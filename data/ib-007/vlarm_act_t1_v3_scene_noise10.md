# ib-007/vlarm_act_t1_v3_scene_noise10

## Resumen

`vlarm_act_t1_v3_scene_noise10` es una política de manipulación robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face mediante LeRobot por el usuario `ib-007`. No es un modelo de lenguaje: es una política de imitación que, a partir de dos imágenes de cámara (frontal y de muñeca) de 256×256 píxeles, el estado propioceptivo del robot (6 dimensiones) y un estado de entorno (5 dimensiones), predice acciones de 6 dimensiones para un robot simulado `so101_sim`.

El checkpoint tiene 51.672.198 parámetros y se entrenó sobre el dataset simulado `ib-007/vlarm_sim_t1_v2_scene` (993 episodios, 116.300 frames a 30 FPS) para seis variantes de una tarea de pick-and-place: coger un cubo de color (rojo, azul o verde) y depositarlo en una papelera.

Su relevancia debe enmarcarse con precisión: es un artefacto de investigación con cero descargas y cero likes, sin resultados de evaluación publicados y entrenado exclusivamente en simulación. Resulta útil como referencia reproducible de un pipeline ACT completo con LeRobot (formato de observaciones, configuración de entrenamiento, comando de rollout) y como punto de partida para fine-tuning, no como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): política de imitación con encoder visual por cámara y transformer encoder-decoder que predice chunks de acciones; variante CVAE según el paper arXiv 2304.13705 |
| Parametros totales | 51.672.198 (dato real de los safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no hay ventana de contexto textual. Entrada = 2 imágenes (3×256×256) + `observation.state` (6,) + `observation.environment_state` (5,) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, int8 ni int4 documentadas |
| Idiomas soportados | no aplicable (política robótica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`); tamaño del repo 1,0 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (Zhao et al., 2023, arXiv 2304.13705). La política procesa cada cámara con un encoder visual convolucional, concatena las características visuales con el estado propioceptivo y el estado de entorno, y un transformer encoder-decoder emite un chunk de acciones futuras en lugar de un único paso. El entrenamiento se formula como un VAE condicional: un encoder de estilo aporta la variable latente durante el entrenamiento y se descarta en inferencia, lo que permite modelar la multimodalidad de las demostraciones humanas. En inferencia se suele aplicar *temporal ensembling* sobre chunks solapados, aunque la model card no especifica si este checkpoint lo usa ni con qué parámetros. Tampoco se publican el tamaño del chunk, el número de cabezas, la dimensión del modelo ni el backbone visual concreto; solo el recuento total de parámetros.

Los datos de entrenamiento son el dataset simulado `ib-007/vlarm_sim_t1_v2_scene`: 993 episodios, 116.300 frames a 30 FPS (aproximadamente 64,6 minutos de teleoperación equivalente), con seis instrucciones de tarea que combinan cubo rojo, azul o verde con la acción de dejarlo en la papelera. La configuración declarada es 50.000 pasos de entrenamiento, batch de 16, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.1. Con esos valores se han visto 800.000 muestras, lo que equivaldría a unas 6,9 pasadas sobre el conjunto si cada muestra es un frame (cálculo derivado, no confirmado por el autor). No se documenta RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento supervisado.

## Capacidades

- Manipulación robótica de pick-and-place: depositar cubos de color en una papelera en el entorno simulado `so101_sim`.
- Percepción multimodidad de dos cámaras simultáneas (`front` y `wrist`), ambas a 256×256, lo que permite razonar sobre la vista global de la escena y la vista cercana del efector.
- Fusión de percepción visual con estado propioceptivo del robot (6 dimensiones) y estado de entorno (5 dimensiones).
- Predicción de acciones en forma de chunk, lo que reduce el error de acumulación típico de las políticas paso a paso.
- Salida de acciones continuas de 6 dimensiones compatible con el espacio de control del robot SO101 simulado.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para ejecución y `lerobot-train` para reentrenamiento.
- No se documenta condicionamiento por lenguaje natural, tool calling, razonamiento multi-paso, capacidades multimodales de audio ni modo de razonamiento explícito.

## Casos de uso

- **Automatización de pick-and-place en simulación**: ejecutar las seis tareas de cubo y papelera sobre `so101_sim` con `lerobot-rollout`, usando el checkpoint como controlador directo. Es el uso para el que fue entrenado y el único validado por el autor (sin métricas publicadas).
- **Línea base en experimentos de robustez**: el nombre del repositorio incluye `noise10`, lo que sugiere entrenamiento con algún nivel de ruido, aunque no está documentado. Sirve como referencia para comparar variantes con y sin ruido si se controla el resto del pipeline.
- **Punto de partida para fine-tuning con datos propios**: reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio de teleoperación, partiendo de una política ya expuesta a la dinámica de un robot de 6 grados de libertad.
- **Docencia y formación en imitation learning**: el par política + dataset + comandos CLI forma un ejemplo completo y de tamaño reducido (51,7 M de parámetros) para explicar el ciclo registro-entrenamiento-despliegue de LeRobot sin necesidad de hardware caro.
- **Validación de pipelines de datos robóticos**: comprobar que las claves de observación (`observation.images.front`, `observation.images.wrist`, `observation.state`, `observation.environment_state`) y las resoluciones coinciden con las del robot objetivo antes de invertir en un entrenamiento mayor.
- **Pruebas de integración en CI**: al pesar menos de 250 MB en fp32, la política se puede cargar en tests automatizados que verifiquen formas de entrada/salida y compatibilidad de versiones de LeRobot sin consumir GPUs dedicadas.
- **Generación de datos sintéticos para entrenamiento posterior**: usar los rollouts en simulador como fuente de episodios adicionales o como datos de aumento para otras políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la plantilla de evaluación con la nota literal «No evaluation results have been provided for this policy yet», por lo que no existe tasa de éxito por tarea, número de ensayos ni comparación con otras políticas.

## Requisitos de hardware

- **VRAM estimada para los pesos**: unos 207 MB en fp32 (51.672.198 × 4 bytes), unos 103 MB en fp16/bf16 y unos 52 MB en int8. A ello hay que sumar las activaciones de los dos codificadores visuales a 256×256; el pico real no está medido, pero el orden de magnitud se mantiene por debajo de 1 GB.
- **GPU recomendadas**: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior es más que suficiente. Para despliegue en el robot, una Jetson Orin Nano o superior es adecuada por margen de sobra. No se necesita A100 ni H100.
- **Compatibilidad con GPU consumer**: sí, en todas las GPU con al menos 2 GB de VRAM; también es viable en CPU para pruebas de integración, aunque no para control a 30 FPS.
- **Opciones de despliegue**: `lerobot-rollout` (vía principal y única documentada), PyTorch directamente, y exportación a ONNX/TensorRT como opción no documentada por el autor. vLLM, TGI, llama.cpp y Ollama no aplican: no es un modelo de lenguaje.
- **Latencia y throughput**: no medidos. El dataset de entrenamiento está grabado a 30 FPS, lo que marca el bucle de control objetivo, pero no se publica latencia por inferencia ni si se emplea *temporal ensembling*, que añadiría retardo.
- **Almacenamiento**: el repositorio ocupa 1,0 GB, probablemente por incluir checkpoints intermedios y estados del optimizador además de los pesos finales.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT `ib-007/vlarm_act_t1_v3_scene_noise10` | Imitación, transformer + CVAE, action chunking | 51,7 M | 2 cámaras 256×256 + estado (6) + entorno (5) | Apache-2.0 | Hub, 0 descargas, sin evaluación |
| Diffusion Policy (implementación LeRobot) | Imitación, modelo de difusión | no disponible | imagen(es) + estado | no disponible en esta búsqueda | Disponible como `policy.type=diffusion` en LeRobot |
| SmolVLA (Hugging Face) | VLA (visión-lenguaje-acción) | no disponible en esta búsqueda; del orden de cientos de millones | visión + instrucción en lenguaje + estado | no disponible en esta búsqueda | Pesos abiertos en el Hub |
| π0 / pi0 | VLA de propósito general | no disponible en esta búsqueda | visión + lenguaje | no disponible en esta búsqueda | Pesos publicados |

La comparación relevante es de categoría, no de números: este checkpoint es dos o tres órdenes de magnitud más pequeño que las políticas VLA actuales, no acepta instrucciones en lenguaje natural y está especializado en un único entorno simulado, mientras que las alternativas VLA buscan generalización entre tareas y robots. Frente a Diffusion Policy, ACT destaca por un entrenamiento más estable y una inferencia más rápida al predecir chunks de forma directa, a costa de menor capacidad para modelar distribuciones multimodales complejas. Los datos de los modelos alternativos no se han podido verificar en la búsqueda web realizada.

## Limitaciones y advertencias

- **Sin evaluación publicada**: se desconoce la tasa de éxito real en las seis tareas; no hay número de ensayos ni condiciones de prueba.
- **Brecha sim-to-real no validada**: el robot declarado es `so101_sim` y el dataset es sintético. No hay evidencia de que la política transfiera a un SO101 físico, ni de cómo afectan cambios de iluminación, calibración de cámaras o fricción real.
- **Dominio extremadamente estrecho**: seis instrucciones sobre cubos de tres colores y una papelera. Cualquier objeto, contenedor, posición de cámara o tarea fuera de esa distribución queda fuera del ámbito entrenado.
- **Sesgo hacia la escena de entrenamiento**: la política aprenderá posiciones, alturas y apariencias presentes en `vlarm_sim_t1_v2_scene`; es esperable sobreajuste a la distribución de posiciones iniciales y a la iluminación del simulador.
- **Posible confusión entre tareas**: al compartir el mismo par observación-acción para seis variantes de tarea, si no hay condicionamiento explícito la política puede no distinguir qué cubo debe coger.
- **Nombre del checkpoint no documentado**: el sufijo `noise10` sugiere entrenamiento con ruido, pero el autor no describe el tipo ni el nivel aplicado, por lo que no se puede reproducir esa condición.
- **Sin condicionamiento por lenguaje**: el flag `--task` de `lerobot-rollout` etiqueta el episodio; la model card no indica que la política consuma la instrucción como entrada. No debe asumirse control por instrucciones variables.
- **Sin validación comunitaria**: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros que confirmen el funcionamiento.
- **Metadatos incompletos**: sin demo en vídeo, sin *model card* de evaluación y sin hiperparámetros de arquitectura (chunk size, backbone, dimensión del modelo).
- **Licencia**: apache-2.0 permite uso comercial y modificación con atribución, pero se ofrece sin garantías; la responsabilidad sobre fallos en un robot real recae en el integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ib-007/vlarm_act_t1_v3_scene_noise10
- Dataset de entrenamiento: https://huggingface.co/datasets/ib-007/vlarm_sim_t1_v2_scene
- Visor del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ib-007/vlarm_sim_t1_v2_scene
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Registro de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Búsqueda web realizada: sin resultados relevantes; los enlaces devueltos corresponden al Bachillerato Internacional (ibo.org) y a un centro de formación francés, sin relación con el modelo.
