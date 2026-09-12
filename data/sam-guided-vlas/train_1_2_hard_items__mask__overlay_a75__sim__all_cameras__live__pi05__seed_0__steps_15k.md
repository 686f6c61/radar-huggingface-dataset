# sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_15k

## Resumen

El modelo `train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_15k` es una política robótica de tipo Vision-Language-Action (VLA) desarrollada por el grupo `sam-guided-vlas`, obtenida mediante *fine-tuning* del modelo base `lerobot/pi05_base`. Resuelve el problema de mapear observaciones multimodales (estado del robot y tres cámaras) a comandos de acción de un brazo robótico, siguiendo el paradigma de π₀.₅ de Physical Intelligence para generalización en entornos abiertos. Cuenta con aproximadamente 4.143 millones de parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo se ha entrenado sobre un conjunto de datos propio de robótica compuesto por 199 episodios y 31.073 fotogramas a 20 FPS, con tareas centradas en la manipulación de objetos geométricos complejos ("hard items"). La nomenclatura del repositorio sugiere el uso de aumentación guiada por máscaras (tipo SAM) con superposición a alpha 0,75, entrenamiento en simulación, uso de todas las cámaras y 15.000 pasos de entrenamiento con semilla 0.

Es relevante ahora porque explora técnicas de aumento de datos guiadas por segmentación para mejorar la robustez de políticas VLA, un área activa de investigación en robótica de manipulación. No obstante, el modelo tiene 0 descargas y 0 *likes*, no publica benchmarks y su ámbito de aplicación es específico (robot Panda en simulación).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en pi05 (evolución de π₀ de Physical Intelligence); implementación LeRobot adaptada del repositorio OpenPI |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es π₀.₅ (pi05), un modelo Vision-Language-Action de Physical Intelligence que evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación disponible proviene de LeRobot y está adaptada del repositorio OpenPI del propio fabricante. La política consume `observation.state` con forma `(9,)` y tres entradas visuales de `(3, 224, 224)` procedentes de `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`, y produce una acción de forma `(7,)` correspondiente al control del robot. El modelo está configurado para el robot `Panda`.

El *fine-tuning* se realizó sobre el dataset `train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live`, compuesto por 199 episodios, 31.073 fotogramas capturados a 20 FPS. Las tareas descritas giran en torno a formas tridimensionales complejas (esferas con brazos curvos, cuerpos con lóbulos, anillos, copas con bordes perlados, etc.). A partir del nombre del repositorio se deduce el uso de *mask overlay* a alpha 0,75, datos de simulación, uso de todas las cámaras y 15.000 pasos de entrenamiento con semilla 0. No se especifica en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de acciones de control robótico de 7 grados de libertad a partir de observaciones multimodales.
- Fusión de tres flujos visuales simultáneos (vista externa `agentview` y dos cámaras en la muñeca) con el estado propioceptivo del robot.
- Manipulación de geometrías complejas: objetos con lóbulos, cavidades, protuberancias, aberturas y formas no convexas.
- Ejecución de tareas de *picking*, agarre y manipulación guiadas por las descripciones textuales de las tareas del dataset.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Comprensión de instrucciones en lenguaje natural heredada del backbone vision-language del modelo base pi05 (no documentada de forma explícita para este *fine-tune*).
- No se documenta soporte de *tool calling*, razonamiento multi-paso en sentido software ni modos de pensamiento (*thinking mode*).

## Casos de uso

- Manipulación robótica en simulación: el modelo opera sobre el robot Panda en entornos simulados y ejecuta tareas de agarre y colocación de objetos con geometrías complejas, apoyándose en las tres cámaras y el estado de 9 dimensiones.
- Investigación en aumento de datos guiado por máscaras: sirve como referencia para estudiar cómo la superposición de máscaras (tipo SAM) a alpha 0,75 afecta a la robustez de una política VLA.
- Evaluación comparativa de políticas VLA: al derivar de `lerobot/pi05_base`, permite medir el efecto del *fine-tuning* específico frente al modelo base en tareas de manipulación.
- Estudio del *sim-to-real*: aunque el entrenamiento es en simulación, el modelo es un punto de partida para experimentos de transferencia a hardware real con un brazo Panda equivalente.
- *Fine-tuning* en dominios específicos: sirve como base para adaptar la política a nuevas tareas o configuraciones de cámara dentro del ecosistema LeRobot.
- Investigación en aprendizaje por imitación: sus 199 episodios y 31.073 fotogramas permiten estudiar el rendimiento en regímenes de datos reducidos.
- Reproducción de experimentos de seed fija: la semilla 0 y los 15.000 pasos permiten replicar el entrenamiento y analizar la variabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según 4.143 millones de parámetros, sin contar el *overhead* de activaciones y codificadores de imagen): en FP32 ~16,6 GB; en FP16/BF16 ~8,3 GB; en INT8 ~4,1 GB; en INT4 ~2,1 GB.
- GPU recomendadas: A100, H100 o L40S para entrenamiento e inferencia en FP32/BF16 sin restricciones; RTX 4090 o RTX 3090 (24 GB) para inferencia en BF16.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas de 16-24 GB (RTX 4090, RTX 3090, RTX 4080), y en INT8/INT4 en tarjetas de 8-12 GB.
- Opciones de despliegue: LeRobot (librería principal del modelo), PyTorch y el ecosistema de HuggingFace. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput estimados: no disponibles.
- Requiere, además de la GPU, un robot físico compatible (Panda) o un simulador con la misma configuración de cámaras y el mismo espacio de estados/acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sam-guided-vlas/...pi05...steps_15k` (este modelo) | ~4,14 mil millones | No disponible | Sin benchmarks publicados | apache-2.0 | Repositorio HuggingFace, 0 descargas |
| `lerobot/pi05_base` (modelo base) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| Otros VLA abiertos (p. ej. OpenVLA) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de rendimiento entre este modelo y alternativas de su categoría. La comparación se limita a la relación de *fine-tuning* con `lerobot/pi05_base`.

## Limitaciones y advertencias

- El entrenamiento se ha realizado en simulación (según la nomenclatura "sim"), por lo que existe riesgo de brecha *sim-to-real* al desplegar en hardware físico.
- El dataset es reducido (199 episodios, 31.073 fotogramas), lo que puede limitar la generalización a tareas o configuraciones distintas.
- El modelo está especializado en un robot concreto (Panda) y en una configuración fija de tres cámaras; no se garantiza su funcionamiento con otras disposiciones.
- Las tareas del dataset son muy específicas (formas geométricas concretas), lo que restringe su aplicación directa fuera de ese dominio.
- No hay benchmarks publicados que permitan estimar su rendimiento real.
- El repositorio registra 0 descargas y 0 *likes*, por lo que no existe validación externa conocida.
- No se documentan sesgos ni limitaciones idiomáticas; la capacidad multilingüe heredada del backbone pi05 no está confirmada para este *fine-tune*.
- El riesgo de "alucinación" en el sentido de modelos de lenguaje no aplica directamente, pero sí existe riesgo de generar trayectorias de acción incorrectas o inseguras.
- Licencia apache-2.0: permite uso comercial con atribución, pero conviene verificar las condiciones del modelo base y del dataset originales antes de un despliegue en producción.
- Antes de usarlo en un robot real, es imprescindible validar las políticas de seguridad y los límites de movimiento del hardware.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_15k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__mask__overlay_a75__sim__all_cameras__live
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index

La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos correspondian a contenidos no relacionados (una serie de television y una empresa de herramientas).
