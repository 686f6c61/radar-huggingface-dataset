# kimy0420/smolvla_v10

## Resumen

El modelo `kimy0420/smolvla_v10` es una política de robótica basada en el modelo VLA (Vision-Language-Action) SmolVLA de Hugging Face, concretamente sobre la base `lerobot/smolvla_base` (SmolVLM2-500M + Action Expert). Ha sido desarrollado por el usuario kimy0420 y está orientado a una tarea específica: recoger una píldora de un color determinado entre un conjunto mezclado y depositarla en un pastillero. La particularidad de este modelo es que, en lugar de usar una instrucción en lenguaje natural para especificar el objetivo, se inyecta la coordenada del color objetivo en el estado de observación del robot, lo que evita la dependencia del camino lingüístico del modelo base.

El modelo cuenta con aproximadamente 452,8 millones de parámetros y ha sido entrenado mediante aprendizaje por imitación (imitation learning) con 224 episodios recopilados en un brazo robótico OpenManipulator-X. Se entrenó durante 80.000 pasos con un batch de 24, alcanzando 7,8 épocas. La licencia es Apache-2.0, lo que permite uso comercial y modificación. Es relevante porque demuestra una alternativa práctica para condicionar políticas VLA sin depender de instrucciones de lenguaje, que en este caso no funcionaban de forma fiable. La arquitectura utiliza flow matching y genera bloques de acciones (chunk de 50 pasos).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLM2-500M (visión-lenguaje) + Action Expert (flow matching) |
| Parámetros totales | 452.815.778 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base SmolVLA soporta contexto multimodal, pero no se especifica en la información) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors sin cuantización explícita) |
| Idiomas soportados | no disponible (el modelo base SmolVLM2 soporta múltiples idiomas, pero este ajuste no lo documenta) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `lerobot/smolvla_base`, que combina un modelo de visión-lenguaje compacto (SmolVLM2-500M) con un "Action Expert" que genera acciones mediante flow matching. La política produce un bloque de 50 acciones (chunk de 50) condicionado por imágenes de dos cámaras (vista superior y cámara de muñeca) y un vector de estado que incluye las 6 articulaciones del robot más un objetivo espacial.

La innovación clave de este ajuste fino es que se reemplaza la instrucción de lenguaje por coordenadas objetivo en el estado. El estado se compone de `[6 articulaciones] + [goal_u, goal_v] × 13`, es decir, se rellenan las 26 dimensiones libres del vector de estado (el modelo espera 32 dimensiones y solo usa 6 para las articulaciones) con las coordenadas de píxeles (u,v) del objeto objetivo repetidas 13 veces. Esta información pasa por una capa lineal entrenable (`train_state_proj=True`). Según el autor, el camino de lenguaje del SmolVLA base tiene señales muy débiles (embedding de lenguaje 86 veces menor que el de imagen) y no es efectivo para esta tarea con tan pocos datos. Por tanto, se opta por este camino alternativo.

El entrenamiento se realizó con 224 episodios, 80.000 pasos, batch de 24 y 7,8 épocas, durante unas 22 horas. Se seleccionó el checkpoint 080000 tras validación en el robot físico, no solo con métricas offline. Se observó que el modelo no mejora significativamente el seguimiento del objetivo al aumentar las épocas (correlación de +0.310 a +0.314 entre 2.0 y 9.8 épocas), mientras que una política ACT (también de la familia Lerobot) alcanzaba +0.484 con el mismo régimen de entrenamiento. Esto sugiere una diferencia estructural, no de falta de entrenamiento.

## Capacidades

- Generación de acciones de control para un brazo robótico de 6 grados de libertad (OpenManipulator-X) en tareas de manipulación.
- Seguimiento de un objetivo visual especificado por coordenadas de píxel (u,v) en el estado, sin necesidad de instrucción de lenguaje.
- Manejo de observaciones multimodales: imágenes de dos cámaras (vista superior y muñeca) y estado propioceptivo.
- Generación de bloques de acciones de 50 pasos temporales (chunked prediction).
- Aprendizaje por imitación a partir de demostraciones humanas (224 episodios).
- Capacidad de distinguir colores en la práctica, aunque la detección del color se realiza externamente mediante un detector HSV, no por el modelo.

## Casos de uso

- **Manipulación robótica de precisión en entornos controlados**: el modelo puede ejecutar tareas de recogida y colocación de objetos pequeños (píldoras) en un escenario de laboratorio, donde se conoce la posición del objetivo en el espacio de imagen.
- **Prototipado de políticas VLA en hardware asequible**: al tener solo 452,8 millones de parámetros, se puede desplegar en GPUs de consumo (p.ej. RTX 3060 o superior) sin necesidad de servidores especializados, lo que facilita experimentos de investigación en robótica.
- **Investigación sobre condicionamiento de objetivos**: el modelo sirve como caso de estudio para comparar el uso de coordenadas de estado frente a instrucciones de lenguaje en VLA, útil para grupos que estudian cómo mejorar la robustez de las políticas.
- **Sistemas de clasificación y manipulación con detección externa**: en combinación con un detector de color (HSV), el modelo puede integrarse en un sistema completo que clasifique objetos por color y los manipule, sin necesidad de que el VLA interprete lenguaje.
- **Evaluación de métodos de entrenamiento de políticas**: al ser un modelo abierto y reproducible (224 episodios, 22 horas de entrenamiento), puede utilizarse como punto de partida para comparar arquitecturas de acción (flow matching vs ACT) en tareas de manipulación fina.
- **Integración en frameworks de robótica basados en Lerobot**: al estar desarrollado con la librería `lerobot`, se puede cargar directamente con `SmolVLAPolicy.from_pretrained()` y usarse en pipelines de despliegue existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo, ya que se trata de una política robótica y no de un modelo de lenguaje general. La model card del autor proporciona métricas de seguimiento de objetivo y comparaciones con ACT:

| Métrica | smolvla_v10 (checkpoint 080000) | ACT (checkpoint 8.1 épocas) |
|---|---|---|
| Correlación de seguimiento de objetivo (offline) | +0.310 | +0.484 |
| Desempeño en robot físico | "Mejor" (según el autor) | no disponible |

Además, el autor reporta que en pruebas con instrucciones de lenguaje (por ejemplo, "pick red pill") el modelo fallaba sistemáticamente (valores de contraste entre 0.89 y 2.02, con línea base de 1.02), por lo que se abandonó el camino de lenguaje. No hay datos de benchmarks públicos adicionales.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene ~452,8 millones de parámetros. En precisión fp32 ocuparía ~1,8 GB, en fp16 ~0,9 GB, y en cuantización de 8 bits ~0,5 GB. Aunque no se han publicado requisitos oficiales, el modelo base SmolVLA está diseñado para ejecutarse en hardware de consumo.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (p.ej. RTX 3050, GTX 1650, incluso en CPU con cuantización). Para entrenamiento adicional, se recomienda una GPU con 8-12 GB (p.ej. RTX 3060, RTX 4070).
- **Compatibilidad**: cabe en GPUs consumer de gama baja y media. No requiere GPU de centro de datos.
- **Opciones de despliegue**: al ser un modelo de la librería Lerobot, se puede cargar con `SmolVLAPolicy.from_pretrained()`. También se puede exportar a formato GGUF o usar con herramientas como llama.cpp si se convierte, pero no es el flujo típico para políticas robóticas. La inferencia se puede realizar en tiempo real (no se especifica latencia exacta).
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método de control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **kimy0420/smolvla_v10** | 452,8 M | no disponible | Flow matching (chunk 50) | Apache-2.0 | Hugging Face |
| **lerobot/smolvla_base** | ~450 M (SmolVLM2-500M) | no disponible | Flow matching (chunk 50) | Apache-2.0 | Hugging Face |
| **act_film_224** (del mismo autor) | no disponible | no disponible | ACT (transformer) | Apache-2.0 | Hugging Face |

No se dispone de comparaciones directas con otros VLA como OpenVLA (7B) o RT-2, que son mucho más grandes y no están diseñados para hardware de consumo. La comparación principal que se hace en la model card es contra ACT: SmolVLA tiene una correlación de seguimiento de objetivo menor (+0.31 vs +0.484), pero ACT no puede distinguir colores sin un detector externo. En cuanto a licencia, ambos son Apache-2.0.

## Limitaciones y advertencias

- **Dependencia de detección de color externa**: el modelo no entiende el color por sí mismo; la detección se realiza mediante un detector HSV externo que introduce las coordenadas del objetivo en el estado. Sin ese detector, el modelo no puede seleccionar la píldora correcta.
- **Seguimiento de objetivo menos preciso que ACT**: el autor reporta una correlación de seguimiento de +0.31 frente a +0.484 de ACT, lo que indica mayor variabilidad en la trayectoria.
- **No soporta temporal ensembling**: la técnica de ensamblaje temporal (temporal ensembling) no está disponible, ya que es una configuración específica de ACT.
- **Sesgos y alucinación**: como política robótica, no genera texto, por lo que no se aplican los riesgos de alucinación de lenguaje. Sin embargo, puede fallar en condiciones de iluminación o variaciones de color no vistas en el entrenamiento.
- **Limitación de contexto**: el modelo no usa instrucciones de lenguaje, por lo que no puede generalizar a tareas nuevas que requieran comprensión lingüística.
- **Escalabilidad**: el entrenamiento se realizó con solo 224 episodios, lo que limita la generalización a otros objetos o entornos.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo depende de la librería Lerobot y de componentes de SmolVLA, que también son de código abierto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kimy0420/smolvla_v10)
- [Dataset asociado: pill_v3_uvstate](https://huggingface.co/datasets/kimy0420/pill_v3_uvstate)
- [Modelo base SmolVLA (Lerobot)](https://huggingface.co/lerobot/smolvla_base)
- [Blog de SmolVLA en Hugging Face](https://huggingface.co/blog/smolvla)
- [Paper SmolVLA en arXiv](https://arxiv.org/abs/2506.01844)
- [Web oficial de SmolVLA](https://smolvla.net/index_en)
- [Modelo ACT con FiLM (del mismo autor)](https://huggingface.co/kimy0420/act_film_224)
