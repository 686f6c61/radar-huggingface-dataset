# queeenb-hf/openarm-pi05-amazing-hand-beaker100-water-wide-fp32-a100x4-20261117

## Resumen

OpenArm + Amazing Hands: Pi0.5 beaker-water pouring es un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base` orientado a robótica de manipulación, concretamente a la tarea de verter agua desde un vaso con un brazo OpenArm equipado con manos Amazing Hand. Lo publica el usuario `queeenb-hf` como modelo final tras 20.000 actualizaciones de entrenamiento, entrenado en cuatro GPU A100 de 80 GB con precisión fp32. El modelo resuelve el problema de aprendizaje por imitación (imitation learning) de políticas visomotoras: dado el estado de las articulaciones y dos cámaras de cabeza, predice objetivos absolutos de articulación para 30 canales (14 del brazo y 16 de las manos).

Técnicamente es un modelo de la familia Pi0.5 (pi05) con 4.143.404.816 parámetros reales según los pesos en safetensors, empaquetado en formato nativo de LeRobot. No es un LLM de propósito general: es una política robótica que consume observaciones multimodales (imágenes de dos cámaras de cabeza y estado articular) y produce secuencias de acciones en radianes. El repositorio ocupa 16,6 GB e incluye pesos, configuraciones de LeRobot y estados de normalización.

Su relevancia es acotada pero concreta: documenta un caso de ajuste fino de Pi0.5 sobre un hardware específico (OpenArm + Amazing Hand) con un contrato de 30 dimensiones, y advierte explícitamente de que no se ha medido el éxito de la tarea en bucle cerrado ni en robot real. Es material de referencia para quien replique el pipeline, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (pi05), política visomotora basada en transformer multimodal con tokenizador PaliGemma; no se detalla más en la información disponible |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el autor entrena en fp32) |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors, con configuraciones nativas de LeRobot y estados de normalización |

Otros datos técnicos relevantes:

| Parametro | Valor |
|---|---|
| Modelo base | lerobot/pi05_base |
| Librería / pipeline | lerobot / robotics |
| Canales de estado y acción | 30 (14 articulaciones de brazo + 8 servos mano izquierda + 8 servos mano derecha, en orden de bus-ID, en radianes) |
| Cámaras | 2 cámaras de cabeza (base_0_rgb y base_1_rgb); sin cámaras de muñeca |
| Chunk size | 50 a 30 Hz |
| n_action_steps | 16 |
| Dataset de entrenamiento | karisora/openarm-amazing-hand-beaker100-water-wide-lerobot-20261113 |
| Hardware de entrenamiento | 4x A100 80 GB, batch 32 por GPU (global 128), semilla 1000 |
| Actualizaciones | 20.000 |
| Tamaño del repo | 16,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, la política Pi0.5 de LeRobot, y se ajusta mediante aprendizaje por imitación supervisado sobre episodios de demostración. La información disponible no detalla la arquitectura interna de Pi0.5 más allá de que emplea un tokenizador PaliGemma (concretamente requiere acceso a `google/paligemma-3b-pt-224` o un tokenizador local alternativo). El ajuste fino se realizó en precisión fp32 sobre cuatro A100 de 80 GB, con batch 32 por GPU (128 global) y semilla 1000, durante 20.000 actualizaciones. El autor lo describe como "expert-only", es decir, sin datos de otros niveles de pericia.

El entrenamiento usa 208 episodios de simulación, divididos por episodio y estratos espaciales en 166 de entrenamiento, 21 de validación y 21 de test intactos. Las estadísticas de normalización numérica se calculan solo con los episodios de entrenamiento. El contrato de estado y acción tiene 30 canales en radianes (14 articulaciones de brazo seguidas de 8 servos de mano izquierda y 8 de derecha en orden de bus-ID). Se aplica ruido gaussiano de sigma 0,01 rad sobre el estado bruto del brazo, sin afectar a los servos de mano ni a las acciones del profesor. La predicción se organiza en chunks de 50 pasos a 30 Hz, ejecutando 16 pasos por chunk. No se incluyen datos de simulación, ficheros de tokenizador, estados del optimizador ni checkpoints intermedios en el repositorio.

## Capacidades

- Generación de políticas de acción visomotora: predice objetivos absolutos de articulación (30 canales en radianes) a partir de dos imágenes de cabeza y el estado articular.
- Aprendizaje por imitación de una tarea concreta: verter agua desde un vaso con el brazo OpenArm y las manos Amazing Hand.
- Control de manos diestras: 16 servos repartidos en 8 por mano, en orden de bus-ID.
- Ejecución por chunks: secuencias de 50 acciones a 30 Hz con 16 pasos ejecutados por chunk.
- Integración con LeRobot: incluye configuraciones nativas, preprocesador y postprocesador guardados, y estados de normalización.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso genérico ni capacidades multilingües: es una política robótica, no un modelo de lenguaje de propósito general.
- No incluye visión de muñeca: solo dos cámaras de cabeza.

## Casos de uso

- Replicación del pipeline de ajuste fino de Pi0.5: sirve como referencia reproducible de un entrenamiento con 4x A100, batch global 128 y 20.000 actualizaciones sobre un dataset LeRobot concreto, útil para equipos que quieran adaptar Pi0.5 a su propio hardware.
- Investigación en aprendizaje por imitación de manipulación diestra: el contrato de 30 canales (brazo más dos manos de 8 servos) es un ejemplo documentado de cómo mapear estado y acciones de un sistema bimanual con dedos en LeRobot.
- Vertido de líquidos en simulación: el modelo está entrenado para la tarea de verter agua desde un vaso (beaker100-water-wide); puede usarse como política de partida en entornos simulados que repliquen el mismo setup de cámaras y articulaciones.
- Base para ajuste fino adicional: al ser un fine-tune de `lerobot/pi05_base`, puede servir como punto de partida para otras tareas sobre el mismo hardware OpenArm + Amazing Hand, siempre que se respete el contrato de 30 dimensiones.
- Validación de contratos de datos y normalización: el repositorio incluye `openarm_conversion.json` con el contrato de tarea, articulaciones y cámaras, y `training_summary.json` con revisiones fijadas, lo que facilita auditar la reproducibilidad del pipeline.
- Docencia y demos de robótica con LeRobot: útil para mostrar el flujo completo desde dataset hasta política desplegable en un framework estándar (LeRobot), con advertencias explícitas sobre lo que no se ha medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el éxito de la tarea en bucle cerrado y en robot real no se ha medido, y que las comprobaciones de recarga del modelo guardado no constituyen una evaluación de éxito del vertido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.143.404.816 parámetros en fp32, los pesos ocupan aproximadamente 16,6 GB; en fp16 serían unos 8,3 GB y en int8 unos 4,1 GB, sin contar activaciones ni el tokenizador PaliGemma.
- GPU recomendadas: el autor entrenó en 4x A100 80 GB en fp32. Para inferencia no se especifican requisitos; una GPU con al menos 16-24 GB de VRAM sería el punto de partida razonable en fp16, aunque no está confirmado.
- ¿Cabe en GPU de consumo? No confirmado. En fp16 los pesos rondan los 8,3 GB, lo que en teoría cabría en una RTX 4090 (24 GB) o similar, pero no hay datos publicados de latencia ni de memoria total necesaria.
- Opciones de despliegue: LeRobot (librería nativa del modelo). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles. El modelo opera a 30 Hz con chunks de 50 acciones y 16 pasos ejecutados, pero no se publican cifras de latencia por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| queeenb-hf/openarm-pi05-amazing-hand-beaker100-water-wide-fp32-a100x4-20261117 | 4.143.404.816 | no disponible | Vertido de agua con OpenArm + Amazing Hand | no disponible | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la información | no disponible | Política visomotora general (base) | no disponible | Hugging Face (modelo base) |
| Otras políticas de LeRobot (p. ej. familias ACT, Diffusion Policy) | no disponible | no disponible | Manipulación por imitación | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No se ha medido el éxito de la tarea en bucle cerrado ni en robot real; las comprobaciones de recarga del modelo no equivalen a una evaluación de vertido exitoso.
- El modelo es específico de una tarea (verter agua) y de un hardware concreto (OpenArm + Amazing Hand); no generaliza a otras tareas ni a otras configuraciones sin nuevo ajuste fino.
- Contrato rígido de 30 dimensiones: no debe usarse el antiguo runner de 16 dimensiones para pinza; el modelo espera 14 articulaciones de brazo más 16 servos de mano.
- Dependencia del tokenizador PaliGemma: requiere acceso a `google/paligemma-3b-pt-224` o un tokenizador local alternativo; sin él, el pipeline no funciona.
- Solo dos cámaras de cabeza, sin cámaras de muñeca; el rendimiento depende de que el setup de cámaras coincida con el del entrenamiento.
- Entrenado únicamente con datos de simulación (208 episodios, 166 de entrenamiento); existe brecha simulación-real no cuantificada.
- Dataset "expert-only": no se ha entrenado con demostraciones de otros niveles de pericia, lo que puede limitar la robustez ante variaciones.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación en el sentido de acciones no válidas o fuera de rango: no se documentan mecanismos de seguridad ni límites articulares en la información disponible.
- Repositorio sin descargas ni likes y con fecha de creación reciente; no hay evidencia de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/queeenb-hf/openarm-pi05-amazing-hand-beaker100-water-wide-fp32-a100x4-20261117
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/karisora/openarm-amazing-hand-beaker100-water-wide-lerobot-20261113
- Tokenizador requerido: https://huggingface.co/google/paligemma-3b-pt-224
- LeRobot (librería): https://github.com/huggingface/lerobot
