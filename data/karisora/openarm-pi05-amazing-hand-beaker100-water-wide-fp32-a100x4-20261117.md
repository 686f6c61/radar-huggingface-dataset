# karisora/openarm-pi05-amazing-hand-beaker100-water-wide-fp32-a100x4-20261117

## Resumen

OpenArm + Amazing Hands: Pi0.5 beaker-water pouring es un modelo de política robótica (vision-language-action) obtenido por fine-tuning del modelo base `lerobot/pi05_base` de LeRobot. Lo desarrolla el usuario karisora y está especializado en una única tarea de manipulación: el vertido de agua desde un vaso (beaker) con un brazo OpenArm equipado con manos Amazing Hand. El modelo resuelve el problema de generar acciones de control de 30 canales (14 articulaciones del brazo más 8 servos por mano) a partir de dos cámaras de cabeza, dentro de un pipeline de imitation learning.

Técnicamente es un fine-tuning completo en fp32 sobre cuatro A100 de 80 GB, con un total de 4.143.404.816 parámetros y un repositorio de 16,6 GB. Emplea la arquitectura Pi0.5 (basada en un backbone PaliGemma) con chunking de acciones de tamaño 50 a 30 Hz y 16 pasos de acción por inferencia. Su relevancia es acotada: es una publicación de un checkpoint final tras 20.000 actualizaciones, liberado a petición del propietario, sin evaluación de éxito en bucle cerrado ni en robot real.

No debe confundirse con un modelo de propósito general: es un artefacto de investigación muy específico, con contrato de entrada/salida propio (30 dimensiones, sin cámaras de muñeca) y dependiente del tokenizer de PaliGemma. Cualquier uso requiere respetar ese contrato y los procesadores guardados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (vision-language-action, backbone PaliGemma) sobre LeRobot |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, un modelo vision-language-action de la familia Pi0.5 que combina un backbone de visión-lenguaje PaliGemma con una cabeza de predicción de acciones. La política consume dos imágenes de cámara de cabeza (`base_0_rgb` y `base_1_rgb`, sin cámaras de muñeca) y el estado del robot, y produce acciones objetivo absolutas de articulaciones en radianes. El espacio de acción y estado tiene 30 canales: 14 articulaciones del brazo seguidas de 8 servos de la mano izquierda y 8 de la mano derecha, en orden de bus-ID.

El entrenamiento consistió en un fine-tuning completo en fp32 durante 20.000 actualizaciones, sobre cuatro GPU A100 de 80 GB, con batch de 32 por GPU (128 global) y semilla 1000. Los datos provienen del dataset `karisora/openarm-amazing-hand-beaker100-water-wide-lerobot-20261113`, con 208 episodios de simulación divididos por episodio y estratos espaciales en 166 de entrenamiento, 21 de validación y 21 de test sin tocar. Las estadísticas de normalización numérica se calcularon solo con los episodios de entrenamiento. Se aplicó ruido gaussiano de sigma 0,01 rad sobre el estado del brazo, sin afectar a los servos de la mano ni a las acciones del profesor. El chunking es de 50 pasos a 30 Hz con `n_action_steps` de 16. No se incluyen estados del optimizador, checkpoints intermedios, datos de simulación ni ficheros del tokenizer.

## Capacidades

- Generación de acciones de control robótico de 30 canales (14 articulaciones de brazo y 16 servos de mano) en radianes.
- Percepción visual a partir de dos cámaras de cabeza (`base_0_rgb`, `base_1_rgb`).
- Ejecución de una tarea de manipulación concreta: vertido de agua desde un beaker en el entorno OpenArm con Amazing Hand.
- Política de imitación condicionada por estado y observaciones visuales, con predicción por chunks de 50 acciones y ejecución de 16 pasos.
- Integración nativa con el ecosistema LeRobot (configs, preprocesador y postprocesador guardados).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni multimodalidad de audio.
- Capacidades multilingües: no aplicables (no es un modelo de lenguaje conversacional).

## Casos de uso

- Investigación en imitation learning para manipulación bimanual: sirve como checkpoint de referencia para reproducir el pipeline de fine-tuning de Pi0.5 sobre OpenArm y comparar recetas de entrenamiento (fp32, 4xA100, batch global 128).
- Vertido de líquidos en simulación: el modelo está entrenado específicamente para la tarea de beaker-water pouring y puede emplearse como política base en entornos simulados que respeten el contrato de 30 canales y las dos cámaras de cabeza.
- Evaluación de contratos de acción en LeRobot: útil para validar runners de 30 dimensiones y descartar el runner antiguo de 16 dimensiones con gripper, tal como advierte el autor.
- Estudio de robustez frente a ruido de estado: el entrenamiento con sigma 0,01 rad sobre el estado del brazo permite analizar la sensibilidad de la política a perturbaciones en las articulaciones.
- Reproducción de experimentos con particiones estratificadas: la división 166/21/21 por episodio y estrato espacial facilita replicar protocolos de validación y test limpios.
- Base para fine-tuning posterior en tareas relacionadas: al ser un checkpoint final sobre `pi05_base`, puede servir de punto de partida para otras tareas de manipulación con el mismo hardware OpenArm + Amazing Hand.
- Docencia y demostraciones de VLA en robótica: ejemplo concreto de integración de PaliGemma como backbone de percepción en una política de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el éxito en bucle cerrado y en robot real no se ha medido, y que las comprobaciones de recarga del modelo guardado no constituyen una evaluación de éxito del vertido.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 suman aproximadamente 16,6 GB (4.143 M de parámetros × 4 bytes), por lo que se necesita al menos esa cantidad más overhead de activaciones y del backbone PaliGemma.
- GPU recomendadas: A100 80 GB (configuración usada en entrenamiento, cuatro unidades); para inferencia una sola A100 80 GB es holgada. H100 80 GB también es adecuada.
- GPU de consumo: una RTX 4090 de 24 GB podría alojar los pesos fp32 en el límite, pero el margen para activaciones y el tokenizer es muy ajustado; no hay datos publicados de inferencia en consumer GPU.
- Opciones de despliegue: LeRobot (librería nativa del modelo), con el preprocesador y postprocesador guardados. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo VLA de este tipo.
- Latencia y throughput: no disponibles. El modelo opera a 30 Hz con chunks de 50 acciones y 16 pasos de ejecución, pero no se han publicado mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| karisora/openarm-pi05-amazing-hand-beaker100-water-wide-fp32-a100x4-20261117 | 4.143 M | no disponible | Vertido beaker-water con OpenArm + Amazing Hand | no disponible | Hugging Face (0 descargas) |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista base | no disponible | Hugging Face (modelo base) |
| Otros fine-tunes de Pi0.5 en LeRobot | no disponible | no disponible | Manipulación genérica | variable | Hugging Face |

La información disponible no permite comparar rendimiento numérico con alternativas, ya que no se han publicado benchmarks ni métricas de éxito para este checkpoint.

## Limitaciones y advertencias

- No se ha medido el éxito de la tarea en bucle cerrado ni en robot real; las comprobaciones de recarga no equivalen a una evaluación de vertido.
- El modelo está entrenado exclusivamente con datos de simulación; la transferencia a robot real es incierta.
- Contrato de entrada/salida estricto: 30 canales (14 brazo + 8 mano izquierda + 8 mano derecha) en radianes y orden de bus-ID. Usar el runner antiguo de 16 dimensiones con gripper produce resultados incorrectos.
- Solo dos cámaras de cabeza (`base_0_rgb`, `base_1_rgb`); no hay cámaras de muñeca, lo que limita la percepción de la zona de manipulación.
- Dependencia del tokenizer de PaliGemma: requiere acceso a `google/paligemma-3b-pt-224` o un override local del tokenizer.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Sesgos conocidos: no documentados, pero al entrenarse solo con 166 episodios simulados de una tarea, la política puede sobreajustarse a las condiciones espaciales y de iluminación de la simulación.
- Riesgo de alucinación de acciones: como toda política de imitación, puede generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento.
- Idiomas: no aplicable; el modelo no procesa lenguaje natural de forma conversacional.
- El repositorio no incluye estados del optimizador, checkpoints intermedios ni datos de simulación, lo que dificulta la reproducción exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/karisora/openarm-pi05-amazing-hand-beaker100-water-wide-fp32-a100x4-20261117
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/karisora/openarm-amazing-hand-beaker100-water-wide-lerobot-20261113
- Tokenizer PaliGemma: https://huggingface.co/google/paligemma-3b-pt-224
- LeRobot (librería): https://github.com/huggingface/lerobot
