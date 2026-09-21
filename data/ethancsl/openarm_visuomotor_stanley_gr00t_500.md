# ethanCSL/openarm_visuomotor_stanley_GR00T_500

## Resumen

`ethanCSL/openarm_visuomotor_stanley_GR00T_500` es un modelo de política visuomotora para robótica (visuomotor policy) publicado en Hugging Face por el usuario ethanCSL, entrenado y distribuido con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es una política de imitación que mapea observaciones multimodales (estado propioceptivo de 16 dimensiones y tres cámaras RGB de 480x640) a un vector de acción continuo de 16 dimensiones, destinado a controlar un robot bimanual de tipo `openarm`.

El modelo se presenta como un fine-tune del modelo fundacional GR00T N1.7 de NVIDIA, que combina un backbone visión-lenguaje Cosmos-Reason2 / Qwen3-VL con un transformer de acciones basado en flow matching, capaz de predecir acciones condicionadas por visión, lenguaje y propiocepción. El checkpoint contiene 3.144.016.000 parámetros (aproximadamente 3,14 mil millones) y el repositorio ocupa 12,6 GB, lo que sugiere pesos almacenados en precisión de 32 bits.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo real de especialización de un modelo fundacional robótico mediante aprendizaje por imitación sobre un dataset propio de 500 episodios y 121.107 fotogramas a 30 FPS. Por otro, ilustra el flujo de trabajo actual de LeRobot para entrenar, publicar y desplegar políticas robóticas con licencia Apache 2.0. El modelo está entrenado para una única tarea: "Pick up the Pringles can with the right arm, hand it to the left arm" (recoger un bote de Pringles con el brazo derecho y entregarlo al brazo izquierdo).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone visión-lenguaje Cosmos-Reason2 / Qwen3-VL más transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (aproximadamente 3,14 mil millones) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; el repositorio de 12,6 GB apunta a pesos en fp32) |
| Idiomas soportados | No disponible (la política se entrena con una instrucción de tarea en inglés; el backbone Qwen3-VL es multilingüe, pero la model card no declara idiomas) |
| Licencia | Apache 2.0 (declarada para este fine-tune; la licencia del modelo base GR00T N1.7 de NVIDIA no se detalla en la información disponible) |
| Formato de pesos | Safetensors (tag `safetensors`), empaquetado para LeRobot |

Especificaciones de entrada y salida declaradas por el autor:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(16,)` |
| `observation.images.right_wrist_cam` | VISUAL | `(3, 480, 640)` |
| `observation.images.wrist_cam` | VISUAL | `(3, 480, 640)` |
| `observation.images.body_cam` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(16,)` |

Datos de entrenamiento declarados:

| Ajuste | Valor |
|---|---|
| Episodios | 500 |
| Fotogramas | 121.107 |
| Frecuencia de captura | 30 FPS |
| Pasos de entrenamiento | 20.000 |
| Tamano de lote | 64 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 0,0001 |
| Semilla | 42 |
| Version de LeRobot | 0.6.2 |
| Tipo de robot | `openarm` |
| Camaras | `right_wrist_cam`, `wrist_cam`, `body_cam` |

## Arquitectura y entrenamiento

La arquitectura subyacente es GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. Se compone de dos bloques: un backbone visión-lenguaje basado en Cosmos-Reason2 y Qwen3-VL, que procesa las imágenes de las cámaras junto con la instrucción en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera secuencias de acciones continuas condicionadas por la salida del backbone y por el estado propioceptivo del robot. El uso de flow matching (una formulación de modelos generativos de flujo continuo, emparentada con las políticas de difusión) permite modelar distribuciones multimodales de acciones, algo relevante en tareas de manipulación donde existen varias trayectorias válidas para un mismo objetivo.

El fine-tune se realizó con LeRobot 0.6.2 sobre el dataset `ethanCSL/openarm_visuomotor_stanley_GR00T_500`, compuesto por 500 episodios de demostración teleoperada que suman 121.107 fotogramas a 30 FPS, con una única tarea anotada. El entrenamiento empleó 20.000 pasos con lotes de 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 42. No se documenta en la información disponible el número total de tokens o fotogramas vistos, la composición completa del dataset, ni si se aplicaron fases de RLHF, DPO u optimización por preferencias (poco habituales en aprendizaje por imitación robótico). Tampoco se detalla si el backbone visión-lenguaje se mantuvo congelado o se ajustó parcialmente durante el entrenamiento.

## Capacidades

- Generación de acciones motoras continuas: produce un vector de acción de 16 dimensiones a partir de observaciones visuales y propioceptivas, apto para control de un robot bimanual tipo `openarm`.
- Percepción visual multi-cámara: consume simultáneamente tres flujos RGB de 480x640 (muñeca derecha, muñeca genérica y cámara corporal), lo que aporta información sobre la escena y sobre la propia configuración del manipulador.
- Condicionamiento por lenguaje: la política recibe una instrucción de tarea en lenguaje natural, heredada del backbone visión-lenguaje de GR00T N1.7.
- Ejecución de manipulación bimanual: la tarea objetivo implica recoger un objeto con un brazo y transferirlo al otro, lo que requiere coordinación entre ambas extremidades.
- Integración con el ecosistema LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`, con registro en el Hub y con la herramienta de visualización de datasets de LeRobot.
- Reentrenamiento y especialización: al ser un checkpoint de política, puede servir como punto de partida o como referencia reproducible para fine-tunes sobre otros datasets con la misma configuración.
- Soporte de tool calling, function calling y razonamiento multi-paso en agentes: no disponible (no es una capacidad declarada de este modelo; es una política robótica, no un agente de texto).
- Capacidades de visión general, audio o modo de razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en un robot OpenArm real: ejecutar la tarea de recogida y entrega de un bote de Pringles con `lerobot-rollout`, indicando el puerto del robot, las cámaras y la instrucción de tarea. Es el uso para el que fue entrenado y el único escenario con soporte directo en la model card.
- Demostración de manipulación bimanual en laboratorio: sirve como ejemplo reproducible de transferencia de objeto entre brazos, útil para medir tiempos de ciclo, tasas de éxito y robustez frente a variaciones de posición del objeto.
- Punto de partida para fine-tuning de nuevas tareas: un equipo con un OpenArm puede reutilizar la receta (`--policy.type=groot`, LeRobot 0.6.2) y sustituir el dataset por sus propias demostraciones, aprovechando que el backbone visión-lenguaje ya está adaptado al dominio robótico.
- Investigación en aprendizaje por imitación: el par modelo-dataset permite estudiar cómo escala el rendimiento de una política VLA con 500 episodios y 121.107 fotogramas, y comparar variantes de hiperparámetros (pasos, lote, tasa de aprendizaje).
- Evaluación de generalización cross-embodiment: al derivar de un modelo fundacional cross-embodiment, permite comprobar hasta qué punto un fine-tune específico conserva o pierde capacidades al cambiar de plataforma robótica o de disposición de cámaras.
- Validación de infraestructura de robótica antes de producción: se puede usar para verificar el pipeline completo de captura a 30 FPS, sincronización de tres cámaras, latencia de inferencia y control en lazo cerrado antes de invertir en un dataset mayor.
- Generación de datos y comparación de políticas: útil como política de referencia frente a otros checkpoints del mismo robot para tareas de análisis de fallos (por ejemplo, agarres fallidos o colisiones), ya que el formato de observación y acción está estandarizado por LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación con el texto "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito, número de ensayos ni métricas de política real. Tampoco se han encontrado resultados de benchmarks en la búsqueda web realizada, cuyos resultados no guardaban relación con el modelo.

## Requisitos de hardware

No se han publicado requisitos de hardware ni mediciones de latencia o throughput en la información disponible. Las siguientes cifras son estimaciones derivadas del recuento real de parámetros (3.144.016.000) y deben tratarse como orientativas, no como datos del autor:

- VRAM estimada para los pesos: aproximadamente 12,6 GB en fp32 (coincide con el tamaño del repositorio), unos 6,3 GB en bf16/fp16, unos 3,1 GB en int8 y unos 1,6 GB en int4.
- VRAM total recomendada: hay que sumar el coste de activaciones y del codificador visual, que procesa tres imágenes de 480x640. Para inferencia en fp16 se recomienda un mínimo práctico de 10-12 GB, y de 16 GB o más para trabajar con margen y lotes pequeños.
- GPU recomendadas: no hay recomendación oficial. Por rango de memoria, encajan GPU de consumo con 12 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y GPU de datacenter o workstation (A100, H100, L40S, RTX 6000 Ada). Para fp32 sin cuantizar se necesitan al menos 16-24 GB.
- Cabe en GPU de consumo: probablemente sí en fp16 o cuantizado en tarjetas de 12-16 GB, y con holgura en una RTX 4090 (24 GB) incluso en fp32. El cuello de botella realista no es la memoria sino la latencia por paso de control a 30 FPS.
- Opciones de despliegue: LeRobot es la vía documentada (`lerobot-rollout` con `--policy.path=ethanCSL/openarm_visuomotor_stanley_GR00T_500`). No se documenta soporte específico para vLLM, TGI, llama.cpp u Ollama, que están orientados a modelos de lenguaje y no a políticas visuomotoras con salida de acción continua. Tampoco se publican pesos GGUF.
- Latencia y throughput: no disponibles. Al tratarse de un lazo de control a 30 FPS (33 ms por ciclo), la viabilidad depende de que la inferencia completa, incluyendo el backbone visión-lenguaje y el transformer de acciones, quepa en ese presupuesto temporal.

## Comparativa con modelos similares

La información proporcionada no incluye resultados cuantitativos comparables. La tabla siguiente contrasta este checkpoint con alternativas de la misma categoría (políticas visión-lenguaje-acción para manipulación), indicando qué datos están declarados en la información disponible y cuáles no. Los datos marcados como "no verificado" son conocimiento general y no proceden de la información suministrada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ethanCSL/openarm_visuomotor_stanley_GR00T_500` | 3,14 mil millones | No disponible | No publicado (sin evaluación en la model card) | Apache 2.0 (fine-tune) | Hugging Face, vía LeRobot |
| GR00T N1.7 (NVIDIA, modelo base) | No disponible en la información proporcionada | No disponible | No disponible | No disponible en la información proporcionada | GitHub de NVIDIA Isaac-GR00T |
| OpenVLA | No verificado (aproximadamente 7 mil millones según conocimiento general) | No aplicable de forma directa | No disponible | No verificado | Repositorio público |
| Políticas tipo flow matching / difusión (por ejemplo, familias π) | No verificado | No aplicable de forma directa | No disponible | No verificado | Repositorios públicos |

Comparativa cualitativa dentro del propio ecosistema LeRobot: este checkpoint es un fine-tune de tarea única (un solo enunciado de tarea y 500 episodios), mientras que GR00T N1.7 se presenta como modelo fundacional cross-embodiment. No hay datos para afirmar que este fine-tune supere o iguale al modelo base en tareas generales, porque no se ha publicado ninguna evaluación.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card no reporta ensayos, tasas de éxito ni condiciones de prueba. No se puede afirmar nada sobre su fiabilidad en el robot real.
- Política de tarea única: está entrenada exclusivamente para "Pick up the Pringles can with the right arm, hand it to the left arm". No hay evidencia de que generalice a otros objetos, posiciones, iluminaciones o instrucciones.
- Sensibilidad a la configuración de hardware: las claves de observación (`right_wrist_cam`, `wrist_cam`, `body_cam`), la resolución 480x640, los 30 FPS y el orden del vector de estado de 16 dimensiones deben coincidir exactamente con el montaje original; cualquier cambio invalida la política.
- Riesgo de sobreajuste al entorno de captura: con 500 episodios y una sola tarea, es esperable un sobreajuste a posiciones de objeto, fondos y condiciones de iluminación del dataset. El propio autor no documenta variaciones de dificultad (posiciones nuevas, distractores, otra instancia del mismo robot).
- Alucinación y fallos de acción: en políticas visuomotoras, el equivalente a la alucinación es la generación de trayectorias plausibles pero incorrectas ante escenas fuera de distribución, con riesgo de agarres fallidos, colisiones o movimientos no seguros. No hay datos de seguridad ni de parada ante fallo.
- Idiomas: la única instrucción documentada está en inglés. No se declara soporte multilingüe para las instrucciones de tarea, aunque el backbone Qwen3-VL sea multilingüe en origen.
- Contexto: no se especifica la longitud de contexto del backbone ni cuántos fotogramas de historia consume la política, lo que impide razonar sobre su comportamiento en tareas de horizonte largo.
- Licencia: el fine-tune se declara bajo Apache 2.0, lo que en principio permite uso comercial de este checkpoint, pero la licencia y los términos del modelo base GR00T N1.7 de NVIDIA no se detallan en la información proporcionada. Antes de un uso comercial conviene verificar las condiciones del modelo fundacional y de los datos de entrenamiento.
- Trazabilidad limitada: el repositorio no tiene descargas ni "me gusta", no incluye vídeo de demostración y no aporta información sobre el autor o su afiliación.
- Datos de fecha: el repositorio aparece creado y actualizado el 21 de septiembre de 2026, según los metadatos de Hugging Face.
- Búsqueda web sin resultados útiles: los resultados devueltos por la búsqueda no contenían información técnica sobre este modelo (contenido no relacionado con robótica), por lo que no se ha podido contrastar ningún dato adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_visuomotor_stanley_GR00T_500
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_visuomotor_stanley_GR00T_500
- Visualizador del dataset (LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_visuomotor_stanley_GR00T_500
- Modelo fundacional GR00T N1.7 de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de captura de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
