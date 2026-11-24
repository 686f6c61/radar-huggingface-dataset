# kinghanse/DualArm_RightArm_LeftRight_smolvla

## Resumen

`kinghanse/DualArm_RightArm_LeftRight_smolvla` es una política de visión-lenguaje-acción (VLA) para robótica, obtenida mediante ajuste fino del modelo base `lerobot/smolvla_base` con la librería LeRobot. Está especializada en una tarea muy concreta de manipulación bimanual: colocar un cubo rojo a la izquierda o a la derecha de una mesa negra utilizando únicamente el brazo derecho de un robot de doble brazo. El modelo lo publica el usuario `kinghanse` y se distribuye con licencia Apache 2.0.

Técnicamente es un modelo compacto, de unos 450 millones de parámetros (450.046.176 según los pesos en safetensors), derivado de SmolVLA, una arquitectura VLA eficiente diseñada para ejecutarse en hardware de consumo. Consume el estado del robot (vector de 6 dimensiones) y tres cámaras RGB de 256x256 píxeles, y produce un vector de acción de 14 dimensiones. No es un modelo de lenguaje general: es una política de imitación entrenada para control robótico en tiempo real a 30 FPS.

Su relevancia es acotada pero ilustrativa: demuestra el flujo completo de ajuste fino de un VLA compacto con un dataset propio pequeño (60 episodios, 38.057 fotogramas) y su despliegue en un robot real mediante `lerobot-rollout`. Es un ejemplo reproducible de cómo adaptar SmolVLA a una tarea específica con recursos modestos, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), ajuste fino del modelo base `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (las instrucciones de tarea son en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `bi_so102_client` (doble brazo SO-102) |
| Camaras de entrada | `cam_wrist_left`, `cam_wrist_right`, `cam_top` (RGB 3x256x256) |
| Entrada de estado | `observation.state` de forma `(6,)` |
| Salida de accion | `action` de forma `(14,)` |
| Frecuencia de datos | 30 FPS |
| Tamano del repositorio | 1,8 GB |
| Libreria | lerobot (version 0.6.0 en entrenamiento) |

## Arquitectura y entrenamiento

El modelo se basa en SmolVLA, un VLA compacto que combina un codificador visual, un componente de lenguaje y un cabezal de acciones para mapear observaciones multimodales (imágenes de cámaras y estado propioceptivo) a comandos motores. El ajuste fino parte de `lerobot/smolvla_base` y se realiza con LeRobot sobre el dataset `kinghanse/Dual_Arm_Pick_n_Place_2color_Cube`.

El entrenamiento se llevó a cabo durante 50.100 pasos con un tamaño de lote de 8, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000. El dataset contiene 60 episodios y 38.057 fotogramas a 30 FPS, con dos instrucciones de tarea en inglés: colocar el cubo rojo a la izquierda o a la derecha de la mesa negra con el brazo derecho. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación; se trata de aprendizaje por imitación supervisado. La model card no describe innovaciones técnicas adicionales más allá de las propias de SmolVLA (eficiencia computacional y despliegue en hardware de consumo).

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 14 dimensiones para un robot de doble brazo a partir de observaciones visuales y propioceptivas.
- Percepción visual multimodal: procesa simultáneamente tres cámaras (muñeca izquierda, muñeca derecha y vista cenital) a resolución 256x256.
- Ejecución de instrucciones de tarea en lenguaje natural: distingue entre dos consignas concretas ("izquierda" y "derecha") para el mismo objeto y mesa.
- Operación en tiempo real: entrenado con datos a 30 FPS, adecuado para bucles de control de frecuencia media.
- Despliegue en hardware de consumo: herencia de la eficiencia de SmolVLA, con 450 millones de parámetros.
- No soporta tool calling, function calling, razonamiento multi-paso genérico ni generación de texto libre; es una política de acción, no un asistente conversacional.
- Capacidades multilingües: no documentadas; las instrucciones del dataset están en inglés.

## Casos de uso

- Pick-and-place bimanual en laboratorio: el modelo coloca un cubo rojo a izquierda o derecha de una mesa negra usando el brazo derecho de un robot SO-102 de doble brazo, con tres cámaras como entrada. Es su caso de uso directo y único documentado.
- Reproducción de experimentos de imitación: sirve como referencia para validar un pipeline completo de LeRobot (grabación de datos, entrenamiento y despliegue) con un dataset pequeño de 60 episodios.
- Base para ajuste fino en tareas similares: al derivar de `lerobot/smolvla_base`, puede reentrenarse con nuevos datasets de manipulación manteniendo la misma interfaz de observaciones y acciones.
- Docencia y formación en robótica: permite ilustrar el ciclo de vida de un VLA compacto, desde la captura de demostraciones hasta la ejecución en robot real con `lerobot-rollout`.
- Prototipado rápido de políticas de manipulación: con 450 millones de parámetros y pesos safetensors de 1,8 GB, es viable iterar en estaciones de trabajo con una sola GPU.
- Evaluación comparativa de políticas VLA: útil como punto de partida para medir el efecto del tamaño de dataset y del ajuste fino frente al modelo base en tareas de pick-and-place.
- Automatización de tareas repetitivas de clasificación de objetos: la lógica de colocar un objeto a un lado u otro de una superficie puede trasladarse a escenarios industriales sencillos tras un reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política (_"No evaluation results have been provided for this policy yet"_).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parámetros en safetensors (1,8 GB de repositorio), la inferencia en precisión completa requiere del orden de 2-3 GB de VRAM, y menos con cuantización, aunque el autor no documenta cifras.
- GPU recomendadas: no especificadas por el autor; SmolVLA está diseñado para hardware de consumo, por lo que una GPU consumer moderna es suficiente en principio.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 8 GB o más de VRAM, aunque no hay confirmación oficial para este ajuste concreto.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=kinghanse/DualArm_RightArm_LeftRight_smolvla`; el ecosistema LeRobot es el soporte documentado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a una política de control).
- Latencia y throughput: no disponibles; los datos de entrenamiento están a 30 FPS, lo que sugiere un objetivo de control en ese orden de frecuencia, pero no se publican medidas de latencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kinghanse/DualArm_RightArm_LeftRight_smolvla` | 450.046.176 | VLA (SmolVLA ajustado) | 3 camaras 256x256 + estado (6,) | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible en la informacion | VLA base (SmolVLA) | multimodal, tareas generales de manipulacion | no disponible en la informacion | Hugging Face |
| Otros VLA de gran tamano (p. ej. familias tipo RT-2 o pi0) | no disponible en la informacion | VLA | multimodal | no disponible en la informacion | no disponible en la informacion |

La comparación cuantitativa con alternativas no es posible con los datos proporcionados: solo se conoce el modelo base del que deriva y no se han publicado métricas de rendimiento para este ajuste. Frente a `lerobot/smolvla_base`, la diferencia es la especialización en una tarea bimanual concreta con tres cámaras y dos instrucciones de lenguaje.

## Limitaciones y advertencias

- Especialización extrema: solo se ha entrenado para dos instrucciones concretas (colocar el cubo rojo a izquierda o derecha de la mesa negra con el brazo derecho); fuera de ese dominio no cabe esperar un comportamiento fiable.
- Dataset muy pequeño: 60 episodios y 38.057 fotogramas limitan la generalización ante cambios de iluminación, posiciones de objetos, distractores o variaciones del entorno.
- Sin evaluación publicada: no hay tasas de éxito ni pruebas en robot real documentadas, por lo que se desconoce su fiabilidad en producción.
- Dependencia de hardware específico: asume el tipo de robot `bi_so102_client` y tres cámaras con nombres concretos (`cam_wrist_left`, `cam_wrist_right`, `cam_top`); requiere calibración y correspondencia exacta de las claves de observación.
- Riesgo de sobreajuste a la configuración de grabación: cambios en la disposición de cámaras o en la mesa pueden degradar el rendimiento sin aviso.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el integrador.
- Sin datos de sesgos ni de alucinación en el sentido de modelos de lenguaje; el riesgo relevante es el fallo físico de la política (acciones incorrectas) en entornos no vistos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinghanse/DualArm_RightArm_LeftRight_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/kinghanse/Dual_Arm_Pick_n_Place_2color_Cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kinghanse/Dual_Arm_Pick_n_Place_2color_Cube
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
