# shavvimal/pi05_wall_v3_rel

## Resumen

`shavvimal/pi05_wall_v3_rel` es un modelo de robótica de tipo Vision-Language-Action (VLA) desarrollado por Shav Vimalendiran, que parte del modelo base `lerobot/pi05_base`, una implementación en LeRobot del modelo π₀.₅ (Pi05) de Physical Intelligence. Este modelo está diseñado para controlar un robot manipulador (tipo `so_follower`) mediante imitación, aprendiendo a realizar la tarea de recoger un bloque de una pila y colocarlo sobre una pared de piezas (tipo Jenga). El problema que resuelve es el de la generalización en entornos nuevos, ya que π₀.₅ evoluciona el modelo π₀ para adaptarse a situaciones no vistas durante el entrenamiento.

El modelo se ha fine-tuneado sobre un dataset propio (`shavvimal/jenga_wall_v3_rel`) con 264 episodios y más de 118 000 frames, y se distribuye bajo licencia Apache 2.0. Con aproximadamente 4 140 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en GPUs de consumo con cuantización adecuada. Su relevancia actual radica en que demuestra cómo un VLA preentrenado a gran escala puede adaptarse a tareas robóticas específicas con relativamente pocos datos, un enfoque cada vez más común en la comunidad de robótica open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) |
| Parametros totales | 4 143 404 816 (~4,14 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de control robótico, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 9,4 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅ de Physical Intelligence, un VLA que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones. La implementación en LeRobot adapta el repositorio OpenPI de Physical Intelligence. El modelo procesa tres imágenes RGB (cámara base y dos muñecas) de 224×224 píxeles junto con un vector de estado de 32 dimensiones, y produce una acción de 6 dimensiones (posición y orientación del efector final).

El entrenamiento se realizó mediante fine-tuning del modelo base `lerobot/pi05_base` sobre el dataset `shavvimal/jenga_wall_v3_rel`, que contiene 264 episodios grabados a 30 FPS (118 322 frames en total) de la tarea "pick up a block from the pile and place it on the wall". Se usaron 20 000 pasos de entrenamiento con batch size 4, optimizador AdamW y learning rate de 2,5e-5, con semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; es un entrenamiento de imitación supervisada estándar.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad (posición y orientación) a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa tres cámaras RGB simultáneamente (base, muñeca izquierda y muñeca derecha) a 224×224.
- Generalización a entornos nuevos: hereda la capacidad de π₀.₅ de adaptarse a situaciones no vistas durante el entrenamiento.
- Aprendizaje por imitación: puede fine-tunearse sobre datasets propios con LeRobot.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo entrenamiento, evaluación y despliegue.
- Tarea específica: recoger bloques de una pila y colocarlos sobre una pared, demostrando razonamiento espacial y manipulación precisa.

## Casos de uso

- Manipulación de objetos en entornos estructurados: el modelo puede controlar un brazo robótico para apilar bloques o piezas, útil en líneas de montaje o laboratorios de automatización.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo fine-tunear VLA preentrenados con pocos datos.
- Desarrollo de robots de asistencia en entornos domésticos: la capacidad de generalizar a nuevas disposiciones de objetos permite aplicarlo en tareas de recogida y colocación de objetos cotidianos.
- Benchmarking de VLA en robótica: puede usarse como referencia para comparar el rendimiento de distintos modelos de control robótico en tareas de manipulación.
- Prototipado rápido de políticas robóticas: gracias a LeRobot, se puede entrenar y desplegar en un robot real con pocas líneas de código, ideal para pruebas de concepto.
- Educación y formación en robótica: permite a estudiantes e investigadores experimentar con VLA sin necesidad de entrenar desde cero, usando el modelo base y el dataset público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito en la tarea de apilado ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 B de parámetros en precisión FP32, el modelo ocupa unos 16,6 GB; en FP16 o BF16, unos 8,3 GB. Con cuantización a 8 bits, cabría en unos 4,5 GB, y a 4 bits, en unos 2,5 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060, RTX 4070, RTX 4090) para inferencia en FP16. Para entrenamiento, se recomienda una GPU con 24 GB o más (RTX 3090, RTX 4090, A100).
- Compatibilidad con GPU de consumo: sí, es viable en GPUs de gama media-alta si se usa FP16 o cuantización.
- Opciones de despliegue: LeRobot (oficial), con soporte para `lerobot-rollout` y `lerobot-train`. También puede integrarse con frameworks de inferencia como vLLM o TGI si se adapta, aunque no es el flujo estándar para modelos robóticos.
- Latencia y throughput: no disponible. Depende de la GPU, la cuantización y el número de cámaras procesadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shavvimal/pi05_wall_v3_rel | 4,14 B | no disponible | Manipulación robótica (apilado) | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | 4,14 B (estimado) | no disponible | VLA preentrenado para fine-tuning | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | 7 B | no disponible | Manipulación robótica general | MIT (investigación) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparación se basa en parámetros y licencia. `pi05_wall_v3_rel` es un fine-tune específico de `pi05_base`, por lo que su rendimiento en la tarea de apilado debería ser superior al del modelo base sin fine-tuning, aunque no hay métricas publicadas que lo confirmen.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento real en la tarea es desconocido.
- El modelo está entrenado para una tarea muy específica (apilar bloques) y puede no generalizar a otras tareas de manipulación sin fine-tuning adicional.
- Depende de la configuración de cámaras y del robot `so_follower`; cambios en la disposición de cámaras o en el robot pueden degradar el rendimiento.
- El dataset de entrenamiento es relativamente pequeño (264 episodios), lo que puede limitar la robustez frente a variaciones de iluminación, posición de objetos o distracciones.
- No se han documentado sesgos específicos, pero como modelo de imitación, puede heredar sesgos del comportamiento demostrado en los datos de entrenamiento.
- Riesgo de alucinación en acciones: en situaciones fuera de la distribución de entrenamiento, el modelo puede generar acciones incorrectas o inseguras; se recomienda supervisión humana en despliegues reales.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base `lerobot/pi05_base` y del dataset, que pueden tener restricciones adicionales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/shavvimal/pi05_wall_v3_rel
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/shavvimal/jenga_wall_v3_rel
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://www.openpi.net/english.html
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
