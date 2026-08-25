# junn0103/turbovla-so101-pen-basket

## Resumen

El modelo `junn0103/turbovla-so101-pen-basket` es una política de imitación basada en el enfoque TurboVLA, entrenada para controlar un brazo robótico SO-101 en una tarea concreta: coger un bolígrafo y depositarlo en una cesta. Lo desarrolla el usuario `junn0103` y se publica bajo licencia Apache 2.0. Está pensado para entornos de robótica de bajo coste, como el brazo SO-101, y se integra con la librería LeRobot para grabación, entrenamiento y despliegue.

El modelo combina un backbone de visión DINOv2 congelado y un encoder de lenguaje BERT congelado, junto con un módulo de política TurboVLA que genera acciones de posición absoluta de las articulaciones (6 grados de libertad). Con aproximadamente 210 millones de parámetros totales, de los que solo unos 14 millones son entrenables, se ha entrenado en 80.000 pasos con un conjunto de datos de 40 episodios reales (23.960 fotogramas a 30 fps). La licencia Apache 2.0 permite su uso comercial y modificación, aunque el modelo está especializado en una única tarea y no es generalizable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TurboVLA (política de visión-lenguaje-acción) |
| Parámetros totales | 210.221.318 |
| Parámetros activos | ~14 millones (entrenables) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | safetensors (sin cuantización específica) |
| Idiomas soportados | no disponible (tarea en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un backbone de visión `facebook/dinov2-base` congelado, un encoder de lenguaje `google-bert/bert-base-uncased` congelado y una política TurboVLA que produce acciones de posición absoluta de 6 grados de libertad para el brazo SO-101. El modelo se entrena con una función de pérdida L1 sobre las acciones, con optimizador AdamW (LR 5e-5, warmup de 10.000 pasos y decaimiento coseno) durante 80.000 pasos con batch de 64. Los datos provienen de 40 episodios grabados con una cámara de muñeca única a 30 fps, totalizando 23.960 fotogramas. El entrenamiento se realizó en una sola GPU H200 y tomó 2 horas y 11 minutos, alcanzando una pérdida final de 0.022 en el paso 80.000.

## Capacidades

- Control de brazo robótico SO-101 mediante imitación de demostraciones humanas.
- Generación de acciones de posición absoluta de articulaciones (6-DoF) a partir de imágenes de cámara y una instrucción textual.
- Ejecución de tareas de manipulación de precisión (pick and place) en un entorno real.
- Integración con el ecosistema LeRobot para grabación, entrenamiento y despliegue.
- No soporta tool calling, razonamiento conversacional ni capacidades multilingües: es una política puramente robótica.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios de investigación robótica: el modelo puede reproducir la tarea de coger un bolígrafo y depositarlo en una cesta con el brazo SO-101, sirviendo como base para experimentos de aprendizaje por imitación.
- Evaluación de algoritmos de aprendizaje por imitación en hardware real: permite comparar el rendimiento de TurboVLA frente a otras políticas en un brazo de bajo coste.
- Prototipado rápido de habilidades robóticas: al estar entrenado con solo 40 episodios, sirve como ejemplo de cómo entrenar una política con un conjunto de datos pequeño.
- Estudio de la influencia de los backbones de visión y lenguaje congelados en la manipulación robótica: al usar DINOv2 y BERT congelados, se puede analizar la capacidad de generalización de representaciones pre-entrenadas.
- Desarrollo de sistemas de control por lenguaje natural en robótica: aunque el modelo no es generalizable, demuestra el uso de instrucciones textuales para especificar una tarea concreta.
- Formación de estudiantes e investigadores en robótica y aprendizaje por imitación: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para fines educativos y de experimentación en plataformas de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la pérdida final de entrenamiento (0.002) en el paso 80.000, pero no hay métricas de evaluación en tareas de control reales ni comparaciones con otras políticas.

## Requisitos de hardware

- No se han publicado requisitos específicos de VRAM para inferencia. El modelo tiene 210 millones de parámetros, lo que en formato fp32 ocupa aproximadamente 0.84 GB; con cuantización a 8 bits podría ocupar menos de 0.5 GB.
- Es razonable asumir que puede ejecutarse en GPUs de consumo como una RTX 3060 o superior, aunque no hay confirmación oficial.
- El entrenamiento se realizó en una GPU H200 (80 GB), pero la inferencia no requiere esa capacidad.
- El despliegue se realiza mediante el ecosistema LeRobot, que incluye herramientas como `lerobot-record` y `lerobot-train`; no se mencionan integraciones con vLLM, llama.cpp u Ollama porque no es un modelo de lenguaje.
- No hay datos de latencia ni throughput disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de imitación para SO-101 con TurboVLA) en la documentación proporcionada. Por lo tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea específica (recoger bolígrafo y colocarlo en cesta) y con un conjunto de datos muy reducido (40 episodios). No es generalizable a otras tareas ni a otros entornos.
- Puede presentar sobreajuste al dataset de entrenamiento y fallar ante variaciones de iluminación, posición de la cámara o del objeto.
- El uso de backbones congelados (DINOv2 y BERT) puede limitar la adaptación del modelo a dominios muy diferentes del dataset de entrenamiento.
- No hay información sobre sesgos o alucinaciones, ya que no es un modelo de generación de texto; pero puede tener errores de ejecución en el mundo físico.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda validar el comportamiento en el entorno real antes de cualquier despliegue productivo.
- No se proporcionan métricas de evaluación en condiciones de generalización, por lo que el rendimiento en escenarios no vistos es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junn0103/turbovla-so101-pen-basket
- Repositorio de la política TurboVLA para LeRobot: https://github.com/ravediamond/lerobot-policy-turbovla-so101
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/junn0103-seoul-national-university/lerobot/runs/9a2h91tw
- Documentación del brazo SO-ARM100: https://github.com/TheRobotStudio/SO-ARM100
