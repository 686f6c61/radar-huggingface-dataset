# castanetnicolas/diffusion_UR5e_BS_32_H_16_TASK_three_piece_assembly_crop76_ID_q3_164916

## Resumen

Este repositorio contiene una política de control visuomotor entrenada con el algoritmo Diffusion Policy y empaquetada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robótica que consume observaciones (estado del robot e imágenes de dos cámaras) y produce trayectorias de acción de 7 dimensiones para un brazo manipulador. El autor es el usuario de Hugging Face `castanetnicolas` y la tarea concreta es un ensamblaje de tres piezas sobre un simulador de tipo MimicGen.

La relevancia es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de redactar esta ficha, entrenado sobre un único dataset de 200 episodios y sin resultados de evaluación publicados. Su interés técnico está en servir como ejemplo reproducible de un pipeline completo de imitación con LeRobot (grabación de datos, entrenamiento diffusion, rollout) y en la tarea de ensamblaje con contacto que aborda.

La arquitectura es una política de difusión condicionada por observaciones visuales de 84x84 píxeles, con 278.014.699 parámetros en formato safetensors y un tamaño de repositorio de 1,1 GB. La licencia Apache 2.0 permite reutilización comercial, aunque la ausencia de métricas de éxito limita cualquier afirmación sobre su rendimiento real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política de difusión para control visuomotor) |
| Parametros totales | 278.014.699 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observación fija por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; la tarea se especifica como cadena de texto fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

Especificaciones adicionales relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot | `panda` (según model card; el nombre del repo menciona UR5e) |
| Cámaras | `agentview`, `robot0_eye_in_hand` |
| Entrada de estado | `observation.state`, forma `(9,)` |
| Entrada visual | `observation.images.agentview` y `observation.images.robot0_eye_in_hand`, forma `(3, 84, 84)` |
| Salida de acción | `action`, forma `(7,)` |
| Dataset de entrenamiento | `castanetnicolas/mimicgen_three_piece_assembly_d1_image84` |
| Episodios / frames | 200 episodios, 67.101 frames a 20 FPS |
| Pasos de entrenamiento | 300.000 |
| Batch size | 32 |
| Optimizador / LR | Adam, 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

Diffusion Policy formula el control visuomotor como un proceso generativo: en lugar de predecir una única acción de forma determinista, el modelo aprende a denoizar una secuencia de acciones condicionada por las observaciones (estado de 9 dimensiones y dos imágenes RGB de 84x84). Esto produce trayectorias multimodales y suaves, lo que resulta especialmente útil en tareas de manipulación con contacto rico, como el ensamblaje de piezas. La implementación concreta corresponde al backend `diffusion` de LeRobot, con 278 millones de parámetros, un tamaño considerable para una política de imitación y coherente con el uso de un decodificador visual convolucional más una red de difusión sobre el horizonte de acción.

El entrenamiento se realizó sobre el dataset MimicGen `three_piece_assembly_d1_image84`, con 200 episodios y 67.101 frames a 20 FPS, durante 300.000 pasos con batch size 32, optimizador Adam y tasa de aprendizaje 0,0001. La tarea descrita es "Insert the first piece into the base, then insert the second piece on top of it". No se documenta en la model card el número de tokens de acción, la composición exacta del dataset más allá de los recuentos, ni si hubo aumento de datos, RLHF o ajuste posterior; esos datos deben considerarse no disponibles. La model card tampoco especifica innovaciones adicionales como decodificación especulativa o atención lineal, que en cualquier caso no aplican a este tipo de política.

## Capacidades

- Generación de trayectorias de acción de 7 grados de libertad para un brazo manipulador, condicionadas por estado propioceptivo e imágenes.
- Control visuomotor con dos vistas: una cámara externa (`agentview`) y una cámara en la muñeca (`robot0_eye_in_hand`).
- Ejecución de tareas de ensamblaje con contacto físico, el caso para el que Diffusion Policy está diseñado.
- Producción de acciones multimodales y suavizadas gracias al proceso de difusión, lo que reduce el chatter en manipulaciones delicadas.
- Integración nativa con el ecosistema LeRobot: comandos `lerobot-rollout` y `lerobot-train`, y compatibilidad con el formato de dataset de LeRobot.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo de razonamiento explícito, visión general, audio ni otras capacidades de los modelos fundacionales multimodales.

## Casos de uso

- Investigación en imitación robótica: sirve como referencia reproducible de un entrenamiento Diffusion Policy completo con LeRobot, útil para comparar hiperparámetros (300.000 pasos, batch 32, LR 1e-4) frente a otras políticas del mismo ecosistema.
- Ensamblaje de precisión en simulación: la política está entrenada específicamente para insertar una pieza en una base y una segunda pieza encima, un escenario de contacto rico donde los métodos deterministas suelen fallar.
- Evaluación de pipelines de datos MimicGen: permite validar de extremo a extremo el flujo dataset (200 episodios, 67.101 frames) → entrenamiento → rollout sobre el robot `panda`.
- Prototipado de control con cámara en la muñeca: el uso conjunto de `agentview` y `robot0_eye_in_hand` a 84x84 es un patrón reutilizable para tareas que requieren realimentación visual cercana al efector.
- Docencia y formación: al ser un artefacto pequeño (1,1 GB) y con licencia Apache 2.0, es adecuado para prácticas de aprendizaje por imitación en laboratorio sin coste de licencia.
- Base para fine-tuning en una tarea de ensamblaje propia: los pesos pueden reentrenarse con `lerobot-train` sobre un dataset nuevo del mismo tipo de robot y cámaras, partiendo de una política ya especializada en contacto.
- Reproducción de resultados: útil para verificar la receta de entrenamiento declarada (semilla 1000, LeRobot 0.6.1) antes de escalar a configuraciones mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la frase "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito en robot real ni en simulación, ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 278 millones de parámetros en precisión FP32, los pesos ocupan aproximadamente 1,1 GB; en FP16 o BF16 bajarían a unos 0,56 GB, más el coste de activaciones y del bucle de difusión.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería bastar para inferencia; para entrenamiento conviene una GPU de gama alta (A100, H100, RTX 4090) por los 300.000 pasos y el batch size 32.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4070, RTX 4080 y RTX 4090, aunque el dato exacto no está publicado.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch y soporte CUDA mediante `--policy.device=cuda`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La política opera a 20 FPS según el dataset de entrenamiento, pero no se publica latencia medida por paso de difusión ni número de pasos de denoising utilizados.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`castanetnicolas/diffusion_UR5e_...`) | Diffusion Policy (LeRobot) | 278.014.699 | Estado (9,) + 2 imágenes 84x84 | Apache 2.0 | Hugging Face, 0 descargas |
| Otras políticas `diffusion` de LeRobot | Diffusion Policy (LeRobot) | Variable según repo | Variable | Apache 2.0 (habitual) | Hugging Face |
| Políticas ACT de LeRobot | Action Chunking Transformer | Variable según repo | Variable | Apache 2.0 (habitual) | Hugging Face |
| Políticas π0 / π0.5 (Physical Intelligence) | Modelo fundacional visuomotor | Órdenes de magnitud superiores | Contexto multimodal amplio | No disponible en la información | Hugging Face / web |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para este modelo ni datos de rendimiento en la información proporcionada. La comparación se limita a categoría, licencia y formato de despliegue.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni validación en robot real, por lo que no puede afirmarse que la política funcione fuera del dataset de entrenamiento.
- Especialización extrema: entrenada para una única tarea ("Insert the first piece into the base, then insert the second piece on top of it") y un único robot; no generaliza a otras tareas sin reentrenamiento.
- Ambigüedad de robot: la model card declara `panda`, pero el identificador del repositorio menciona `UR5e`; conviene verificar la morfología real antes de desplegar.
- Dependencia de la cámara: las observaciones deben coincidir exactamente con los nombres y la resolución de entrenamiento (`agentview` y `robot0_eye_in_hand`, 84x84); un cambio de cámara o de calibración degradará el comportamiento.
- Riesgo de sobreajuste al dataset: con solo 200 episodios y 67.101 frames, la diversidad de posiciones, iluminación y distractores es limitada; la política puede fallar ante variaciones no vistas.
- Sin datos sobre sesgos: no se documentan sesgos demográficos ni de otro tipo, aunque al no procesar lenguaje natural el riesgo de sesgo textual es nulo; el sesgo relevante sería de distribución visual y física.
- Licencia permisiva pero sin garantías: Apache 2.0 permite uso comercial, pero el autor no ofrece ninguna garantía de idoneidad ni soporte.
- Artefacto de investigación: cero descargas y cero likes en el momento de la consulta, sin demo en vídeo ni resultados de evaluación, lo que desaconseja su uso en producción sin validación propia.
- Sin información sobre cuantizaciones: no hay variantes GGUF, INT8 ni INT4 publicadas, lo que limita el despliegue en hardware muy restringido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_16_TASK_three_piece_assembly_crop76_ID_q3_164916
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
