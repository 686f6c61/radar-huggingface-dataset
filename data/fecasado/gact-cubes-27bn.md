# fecasado/gact-cubes-27bN

## Resumen

El modelo `fecasado/gact-cubes-27bN` es una política de control robótico para manipulación, entrenada con el framework LeRobot de Hugging Face. Desarrollado por el usuario fecasado, resuelve la tarea de trasladar cubos a cestas (Ncubes-to-Nbaskets) mediante aprendizaje por imitación. Utiliza una arquitectura de tipo `gaze_act`, una variante de ACT (Action Chunking with Transformers) que incorpora información de mirada (gaze) para mejorar la precisión del control. El modelo tiene 51,6 millones de parámetros y se distribuye bajo licencia Apache-2.0. Su relevancia radica en ser un ejemplo de política robótica entrenable y reproducible en el ecosistema LeRobot, orientada a la investigación en robótica de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gaze_act (variante de ACT con atención de mirada) |
| Parametros totales | 51.618.650 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (modelo robótico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (0.2 GB) |

## Arquitectura y entrenamiento

La arquitectura `gaze_act` es una variante de ACT (Action Chunking with Transformers) que integra información de mirada (gaze) en el proceso de decisión. ACT es un modelo de aprendizaje por imitación basado en transformadores que genera secuencias de acciones (chunks) a partir de observaciones visuales. El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, que contiene demostraciones de manipulación de cubos en cestas. No se especifican el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO, ya que es un modelo de control robótico y no un modelo de lenguaje. La innovación principal es la incorporación de la atención de mirada para mejorar la precisión en tareas de manipulación.

## Capacidades

- Control robótico para tareas de manipulación (mover cubos a cestas).
- Aprendizaje por imitación: reproduce acciones aprendidas de demostraciones.
- Soporte de visión: procesa imágenes de resolución 320x240 para percibir el entorno.
- Generación de secuencias de acciones (action chunks) para control en tiempo real.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta funciones lingüísticas, tool calling ni agentes conversacionales.

## Casos de uso

- Automatización de tareas de picking y placing: el modelo puede controlar un brazo robótico para recoger cubos de una posición y colocarlos en una cesta, adecuado para entornos de laboratorio o manufactura.
- Investigación en aprendizaje por imitación: sirve como base para estudiar cómo la información de mirada (gaze) influye en la eficiencia del control robótico, comparando con modelos ACT sin esa característica.
- Desarrollo de robots de bajo coste: al ser un modelo ligero (51.6M parámetros), puede ejecutarse en hardware modesto, facilitando su uso en proyectos de robótica educativa o DIY.
- Evaluación de políticas robóticas: permite reproducir experimentos de evaluación con el robot SO-100 (follower) usando LeRobot, útil para validar algoritmos de control.
- Benchmark de manipulación: se puede usar como referencia para comparar nuevas políticas de aprendizaje por imitación en la tarea Ncubes-to-Nbaskets.
- Entrenamiento de políticas personalizadas: con LeRobot se puede reentrenar el modelo con nuevos datos para adaptarlo a otras tareas de manipulación similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de éxito, precisión o comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tener solo 51.6M parámetros, la inferencia requiere aproximadamente 200 MB de VRAM en float32 (0.2 GB). Con cuantización podría ser menor, pero no se especifican cuantizaciones.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM sería suficiente (ej. NVIDIA Jetson, GTX 1050, RTX 2060). No requiere GPU de gama alta.
- Cabe en GPU de consumo: sí, incluso en placas de desarrollo como Raspberry Pi con acelerador o NVIDIA Jetson.
- Opciones de despliegue: LeRobot ofrece scripts para entrenamiento y evaluación; también se puede usar con librerías de inferencia de PyTorch.
- Latencia y throughput: no disponible; depende del hardware y del tamaño de las imágenes.

## Comparativa con modelos similares

No se dispone de información de modelos comparables en la misma categoría (políticas robóticas ACT o gaze_act). No disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado sesgos, al ser un modelo de control no lingüístico.
- Riesgo de alucinación: no aplica, ya que no genera texto.
- Limitaciones de contexto o idioma: no aplica.
- Restricciones de licencia: licencia Apache-2.0, permite uso comercial con atribución.
- Caveat de producción: el modelo está entrenado específicamente para la tarea Ncubes-to-Nbaskets; su generalización a otras tareas o entornos es limitada sin reentrenamiento.
- No se han publicado datos sobre robustez ante variaciones de iluminación, oclusiones o cambios en la disposición de objetos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gact-cubes-27bN
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Modelo relacionado (gact-cubes-27b2): https://huggingface.co/fecasado/gact-cubes-27b2
- Modelo relacionado (baseline): https://huggingface.co/fecasado/gact-cubes-baseline## Resumen

El modelo `fecasado/gact-cubes-27bN` es una política de control robótico para manipulación, entrenada con el framework LeRobot de Hugging Face. Desarrollado por el usuario fecasado, resuelve la tarea de trasladar cubos a cestas (Ncubes-to-Nbaskets) mediante aprendizaje por imitación. Utiliza una arquitectura denominada `gaze_act`, una variante de ACT (Action Chunking with Transformers) que incorpora información de mirada (gaze) para mejorar la toma de decisiones en el control del robot. El modelo tiene 51,6 millones de parámetros y se distribuye bajo licencia Apache-2.0. Su relevancia radica en ser un ejemplo reproducible de política robótica entrenada y publicada en el ecosistema LeRobot, orientada a la investigación en aprendizaje por imitación y manipulación de bajo coste.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gaze_act (variante de ACT con atención de mirada) |
| Parametros totales | 51.618.650 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no aplica (modelo robótico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura `gaze_act` es una variante de ACT (Action Chunking with Transformers) que integra la mirada del robot como entrada adicional en el proceso de decisión. ACT es un modelo de aprendizaje por imitación basado en transformadores que genera secuencias de acciones a partir de observaciones visuales. El entrenamiento se realizó con LeRobot sobre el dataset `fecasado/Ncubes-to-Nbaskets-320x240`, que contiene demostraciones de manipulación de cubos en cestas. No se especifican el número de tokens de entrenamiento ni el uso de RLHF o DPO, ya que es un modelo de control y no de lenguaje. La innovación técnica destacable es el uso de la mirada como señal auxiliar para mejorar la precisión en tareas de manipulación, algo poco común en políticas ACT estándar.

## Capacidades

- Control robótico de manipulación: ejecuta acciones para recoger y colocar objetos en cestas.
- Percepción visual: procesa imágenes de resolución 320x240 para percibir el entorno.
- Aprendizaje por imitación: reproduce comportamientos observados en demostraciones humanas o teleoperadas.
- Generación de chunks de acción: produce secuencias de acciones para control en tiempo real.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante scripts estandarizados.
- No soporta funciones lingüísticas, tool calling ni agentes de razonamiento simbólico.

## Casos de uso

- Automatización de tareas de picking y placing: el modelo puede mover un brazo robótico para recoger objetos de una zona y colocarlos en una cesta, útil en entornos de laboratorio o manufactura ligera.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar el impacto de la información de mirada en la eficacia de políticas ACT, comparando con versiones sin gaze.
- Desarrollo de robots de bajo coste: al tener solo 51,6 M de parámetros, es viable en hardware modesto (Raspberry Pi con acelerador o GPUs de gama baja), facilitando proyectos educativos.
- Evaluación de políticas robóticas: permite reproducir experimentos con el robot SO-100 (follower) usando el comando `lerobot-record`, para validar algoritmos de control en tareas estándar.
- Reentrenamiento para nuevas tareas: se puede partir de este modelo y ajustarlo con nuevos datasets de manipulación, acelerando la convergencia en tareas similares.
- Benchmark de manipulación: sirve como baseline en la tarea Ncubes-to-Nbaskets para comparar futuras políticas de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de tasa de éxito, precisión de manipulación ni comparativas con otras políticas.

## Requisitos de hardware

- VRAM estimada: al tener 51.618.650 parámetros en fp32, el peso ocupa unos 206 MB. La inferencia con imágenes 320x240 requerirá VRAM adicional para activaciones y buffers, estimándose entre 1 y 2 GB según el framework.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2060, Jetson Nano) es suficiente. No se requiere GPU de centro de datos.
- Compatibilidad con consumer GPU: sí, el modelo cabe en GPUs de consumo típicas, incluso en tarjetas integradas con poca memoria.
- Opciones de despliegue: LeRobot ofrece scripts para entrenamiento y evaluación; también se puede usar PyTorch directamente para inferencia personalizada. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de control no lingüístico.
- Latencia y throughput: no se han publicado. Dependerá del hardware y de la resolución de las imágenes (320x240), pero es previsible una latencia de pocos milisegundos en GPUs modernas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT o gaze_act para la misma tarea). El autor ha publicado variantes relacionadas (gact-cubes-27b2, gact-cubes-baseline) que podrían servir como comparación, pero no se han detallado sus características en la información disponible. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado sesgos; al ser un modelo de control robótico, los sesgos se limitan a la distribución de demostraciones del dataset (posiblemente limitada a un entorno específico).
- Riesgo de alucinación: no aplica, ya que no genera texto ni contenido simbólico.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje natural.
- Restricciones de licencia: Apache-2.0 permite uso comercial con atribución, sin restricciones de uso en producción.
- Caveat de producción: el modelo está entrenado específicamente para la tarea Ncubes-to-Nbaskets con imágenes de 320x240; su generalización a otras tareas, entornos o resoluciones es limitada y requiere reentrenamiento.
- No se han publicado datos sobre robustez ante variaciones de iluminación, oclusiones o cambios en la disposición de objetos, lo que limita la confianza para despliegues en entornos no controlados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gact-cubes-27bN
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset: https://huggingface.co/datasets/fecasado/Ncubes-to-Nbaskets-320x240
- Modelo relacionado (gact-cubes-27b2): https://huggingface.co/fecasado/gact-cubes-27b2
- Modelo relacionado (gact-cubes-baseline): https://huggingface.co/fecasado/gact-cubes-baseline
