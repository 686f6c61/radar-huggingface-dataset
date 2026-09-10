# ethanCSL/openarm_visuomotor_VR_pringles_stanley_1000_gr00t

## Resumen

El modelo `ethanCSL/openarm_visuomotor_VR_pringles_stanley_1000_gr00t` es una política visuomotora entrenada para controlar un robot de tipo `openarm` en una tarea concreta: recoger una lata de Pringles con el brazo derecho y pasarla al brazo izquierdo. Se trata de un fine-tuning del modelo fundacional de robótica [GR00T N1.7](https://github.com/NVIDIA/Isaac-GR00T) de NVIDIA, publicado por el usuario `ethanCSL` con la librería [LeRobot](https://huggingface.co/docs/lerobot/index). 

El modelo combina un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) con un action transformer basado en flow-matching, lo que le permite predecir acciones de 16 dimensiones condicionadas por la entrada de tres cámaras (muñeca derecha, muñeca y cuerpo) y el estado propioceptivo del robot. Tiene 3.144.016.000 parámetros (3,14 mil millones) y se distribuye bajo licencia Apache-2.0.

Su relevancia radica en que demuestra cómo ajustar un modelo VLA de propósito general a una tarea específica mediante demostraciones de teleoperación en realidad virtual, siguiendo el flujo de trabajo de LeRobot. Los datos de entrenamiento están disponibles públicamente, lo que permite reproducir y estudiar el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLA con backbone Cosmos-Reason2/Qwen3-VL y action transformer con flow-matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible (el repositorio no indica cuantización; los pesos están en safetensors, 12.6 GB) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7, que se presenta como un modelo con un "sistema dual": un módulo de razonamiento visión-lenguaje (System 2) interpreta la escena y la instrucción, y un action transformer (System 1) genera las acciones a través de flow-matching. En este checkpoint, las entradas son el estado del robot (16 valores) y tres imágenes RGB de 480x640 de las cámaras `right_wrist_cam`, `wrist_cam` y `body_cam`. La salida es un vector de acción de 16 dimensiones.

El entrenamiento se realizó con el dataset `ethanCSL/openarm_visuomotor_VR_pringles_stanley_1000`, compuesto por 1000 episodios de teleoperación con visor VR (244.256 fotogramas a 30 FPS). La configuración de entrenamiento reportada es: 20.000 pasos, tamaño de lote 64, optimizador AdamW con tasa de aprendizaje 1e-4, semilla 42 y la versión 0.6.2 de LeRobot. No se indica si se utilizaron técnicas de RLHF/DPO; el proceso corresponde a aprendizaje por imitación supervisado.

## Capacidades

- Generación de acciones visuomotoras: predictiva de un vector de acción de 16 dimensiones a partir del estado del robot y la visión.
- Comprensión de instrucciones en lenguaje natural: gracias al backbone Qwen3-VL, el modelo puede interpretar la tarea descrita ("Pick up the Pringles can with the right arm, hand it to the left arm").
- Procesamiento de tres cámaras simultáneas, lo que le permite integrar perspectiva de muñeca y cuerpo.
- Percepción multi-modal: combina propriocepción (estado del robot) y visión; no genera texto, imágenes ni audio.
- Soporte de tool calling: no disponible (no es aplicable en este contexto).
- Soporte de agentes y multi-step reasoning: no disponible (se limita a predicción de acciones en un bucle de control).
- Capacidades multilingües: no evaluadas en este modelo; la instrucción de entrenamiento está en inglés.

## Casos de uso

- Manipulación bimanual en robots openarm: el modelo está diseñado para coordinar los brazos en la transferencia de un objeto de la mano derecha a la izquierda, lo que puede aplicarse en tareas de ensamblaje o clasificación de piezas.
- Investigación en políticas VLA: como fine-tuning de GR00T N1.7, sirve para estudiar cómo adaptar modelos fundacionales de robótica a tareas concretas con datos de teleoperación, en el marco de LeRobot.
- Validación de pipelines de aprendizaje por imitación: permite probar configuraciones de entrenamiento y rollout con LeRobot, cambiando cámaras, políticas o estrategias de inferencia.
- Prototipado de tareas para robots humanoides: se puede emplear como referencia para evaluar si un modelo VLA es capaz de seguir instrucciones de manipulación con el robot openarm.
- Estudio de la transferencia de demostraciones humanas a robots: el dataset fue capturado con un visor VR, lo que permite analizar el efecto de la teleoperación en el aprendizaje de la política.
- Evaluación de robustez perceptual: con tres cámaras, el modelo puede usarse para medir la importancia de la vista de muñeca y cuerpo en el cumplimiento de la tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card del repositorio no incluye ninguna evaluación cuantitativa ni tasa de éxito en la tarea. No se debe comparar este checkpoint con otros modelos si no hay métricas publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en safetensors ocupa 12.6 GB. Para cargar el modelo en fp32/bf16 con LeRobot y procesar tres imágenes de 480x640, se estima una necesidad mínima de 12–16 GB de VRAM. Sin cuantización disponible, esta es la referencia.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40 GB) o H100. Se requieren al menos 12 GB de VRAM.
- Compatibilidad con GPU de consumo: es probable que una RTX 4090 pueda ejecutar la inferencia en bf16, aunque se recomienda verificar la ocupación de memoria con LeRobot.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) y el framework NVIDIA Isaac GR00T. No es compatible con vLLM, llama.cpp ni TGI, orientados a modelos de lenguaje.
- Latencia y throughput: no disponible; dependen del hardware y del número de imágenes procesadas.

## Comparativa con modelos similares

No disponible. En la información proporcionada no hay benchmarks ni medidas de rendimiento que permitan una comparación directa con otros modelos VLA. El checkpoint es un fine-tuning sobre GR00T N1.7, y aunque existen alternativas como OpenVLA o GR00T N1, este modelo no se ha evaluado frente a ellas en la tarea descrita.

## Limitaciones y advertencias

- Sobreajuste a la tarea: al haber sido entrenado con 1000 episodios de una única tarea, es probable que su rendimiento se degrade en escenarios con otros objetos, posiciones o condiciones de iluminación.
- Dependencia de la configuración de cámaras: los nombres de las claves de observación (`right_wrist_cam`, `wrist_cam`, `body_cam`) deben coincidir exactamente con la configuración del robot; un cambio en la posición o en la calibración puede invalidar el modelo.
- Sin evaluación en físico: el model card no reporta resultados de trials, por lo que se desconoce la tasa de éxito real y la estabilidad de la política.
- Riesgo de predicciones incorrectas: al ser un modelo generativo de acciones, puede emitir comandos de movimiento no deseados ante entradas fuera de la distribución, lo que requiere supervisión de seguridad en despliegue.
- No es un chatbot ni un modelo de lenguaje: no soporta conversación, tool calling ni razonamiento de agentes; solo produce acciones visuomotoras.
- Idioma de la instrucción: la tarea fue definida en inglés; no hay datos sobre el rendimiento con instrucciones en español u otros idiomas, aunque Qwen3-VL es multilingüe.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ethanCSL/openarm_visuomotor_VR_pringles_stanley_1000_gr00t
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_visuomotor_VR_pringles_stanley_1000
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Repositorio de NVIDIA Isaac GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Publicación sobre GR00T N1: https://research.nvidia.com/publication/2025-03_nvidia-isaac-gr00t-n1-open-foundation-model-humanoid-robots
- Paper de GR00T N1 en ResearchGate: https://www.researchgate.net/publication/390019361_GR00T_N1_An_Open_Foundation_Model_for_Generalist_Humanoid_Robots
