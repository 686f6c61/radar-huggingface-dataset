# lucazanett/pi05-plug_adaptive_3

## Resumen

π₀.₅ (pi05) es un modelo Vision-Language-Action (VLA) desarrollado originalmente por Physical Intelligence para abordar la generalización en mundo abierto en robótica. El checkpoint `lucazanett/pi05-plug_adaptive_3` es una política entrenada y publicada con LeRobot, adaptada del repositorio OpenPI, y orientada a una tarea concreta de inserción de enchufe adaptativa sobre el dataset `lucazanett/plug_adaptive_3`.

El modelo contiene 4.143.404.816 parámetros y se distribuye en formato safetensors con licencia Apache 2.0. Su relevancia radica en que permite reproducir el flujo de entrenamiento y evaluación de una política VLA con herramientas de LeRobot, aunque la información publicada no incluye benchmarks, detalles completos de arquitectura ni especificaciones de contexto o cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅; implementación LeRobot adaptada de OpenPI |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; no se documenta una ventana de contexto textual para esta política VLA |
| Tipos de cuantización | No disponible; pesos en safetensors sin precisión especificada |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Biblioteca | LeRobot |
| Pipeline | Robótica (`robotics`) |
| Tarea | Inserción de enchufe adaptativa (`plug_adaptive_3`) |
| Dataset de entrenamiento | `lucazanett/plug_adaptive_3` |
| Autor del checkpoint | `lucazanett` |
| Tamaño del repositorio | 9,4 GB |
| Descargas / likes | 16 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La información disponible describe π₀.₅ como una política VLA con generalización en mundo abierto, diseñada para operar en entornos y situaciones no vistas durante el entrenamiento. El checkpoint concreto se ha entrenado y publicado con LeRobot sobre el dataset `lucazanett/plug_adaptive_3`, lo que lo especializa en una tarea de manipulación relacionada con la inserción adaptativa de un enchufe. La implementación de LeRobot se presenta como una adaptación del repositorio OpenPI de Physical Intelligence.

No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF/DPO, la arquitectura interna del backbone visual o del experto de acciones, ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card únicamente documenta el flujo de entrenamiento y evaluación mediante `lerobot-train` y `lerobot-record`, además de la licencia Apache 2.0.

## Capacidades

- Control robótico a partir de observaciones visuales y consignas de tarea: el modelo genera acciones para manipulación física, no texto conversacional.
- Generalización en mundo abierto, según la model card de π₀.₅, orientada a entornos y situaciones no vistas durante el entrenamiento.
- Especialización en la tarea `plug_adaptive_3`, centrada en la inserción adaptativa de un enchufe.
- Integración con LeRobot para entrenamiento, evaluación y registro de episodios mediante `lerobot-train` y `lerobot-record`.
- Ejecución en robots tipo `so100_follower`, según el ejemplo de evaluación incluido en la model card.
- No se documentan capacidades de generación de texto, tool calling, function calling, agentes multi-paso, matemáticas, visión general, audio ni modo thinking.
- No se documentan capacidades multilingües ni un conjunto de idiomas soportados.

## Casos de uso

- Inserción de conectores en fabricación: la política se usaría para alinear y insertar un enchufe a partir de observaciones visuales; es adecuada porque el checkpoint está entrenado específicamente sobre la tarea `plug_adaptive_3`.
- Automatización de ensamblaje con tolerancias variables: el modelo puede adaptar la trayectoria a pequeñas variaciones de posición; la model card destaca la generalización en mundo abierto como objetivo de π₀.₅.
- Validación de políticas VLA en laboratorio: se puede entrenar o evaluar con LeRobot y comparar checkpoints sobre episodios registrados; encaja en flujos de investigación reproducibles.
- Robótica de bajo coste con SO100: el ejemplo de evaluación usa `so100_follower`, por lo que el checkpoint puede probarse en plataformas económicas compatibles con LeRobot.
- Generación de datos de evaluación: mediante `lerobot-record` se pueden grabar episodios con prefijo `eval_` y medir la tasa de éxito de la política en condiciones controladas.
- Manipulación en entornos no estructurados: se usaría para probar la capacidad de generalización a nuevas posiciones, iluminación u objetos; requiere validación adicional porque no hay benchmarks publicados.
- Sustitución de operarios en tareas repetitivas de inserción: puede reducir la exposición a movimientos repetitivos, siempre que se implante con límites de fuerza, parada de emergencia y supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El checkpoint tiene 4.143.404.816 parámetros. Las siguientes cifras son estimaciones teóricas a partir del número de parámetros, no datos confirmados por el autor.

| Precisión | VRAM de pesos (estimada) | VRAM total orientativa (estimada) |
|---|---:|---:|
| FP32 | ≈16,6 GB | ≈20-24 GB |
| FP16 / BF16 | ≈8,3 GB | ≈10-16 GB |
| INT8 | ≈4,1 GB | ≈6-10 GB |
| INT4 | ≈2,1 GB | ≈4-6 GB |

- GPU recomendadas para inferencia en FP16/BF16: RTX 4090 o RTX 3090 de 24 GB, A100 40/80 GB, H100 80 GB.
- GPU para entrenamiento: no documentadas; por el tamaño del modelo, se recomiendan A100/H100 de 40-80 GB, aunque el autor no especifica requisitos.
- ¿Cabe en GPU de consumo? Según la estimación, sí en GPUs de 24 GB para FP16/BF16; en GPUs de 16 GB requeriría cuantización o reducción de precisión, opción no documentada.
- Despliegue: LeRobot con `lerobot-record`, PyTorch y, previsiblemente, el flujo OpenPI. vLLM, TGI, llama.cpp y Ollama no están documentados para esta política robótica y no son directamente aplicables.
- Latencia y throughput: no disponibles; dependerán de la GPU, la resolución de las imágenes, la frecuencia de control del robot y la implementación de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---:|---|---|---|
| `pi05-plug_adaptive_3` (este checkpoint) | 4.143.404.816 | No disponible | Apache 2.0 | HuggingFace, LeRobot |
| π₀.₅ base (Physical Intelligence) | No disponible | No disponible | No disponible | Blog de Physical Intelligence y repositorio OpenPI; detalles no incluidos en la información |
| π₀ (predecesor) | No disponible | No disponible | No disponible | No disponible en la información |
| Políticas VLA alternativas, como OpenVLA | No disponible | No disponible | No disponible | No disponible en la información |

La información disponible no permite una comparación cuantitativa de rendimiento con alternativas. Solo se documenta que π₀.₅ evoluciona de π₀ y que este checkpoint es una especialización sobre `plug_adaptive_3`.

## Limitaciones y advertencias

- Especialización estrecha: el checkpoint está entrenado sobre `plug_adaptive_3`; puede fallar en tareas de manipulación distintas o en variaciones no representadas en el dataset.
- Ausencia de benchmarks: no hay resultados publicados de tasa de éxito, robustez o generalización que permitan estimar su rendimiento real.
- Sesgos del dataset: al depender de demostraciones concretas, puede heredar sesgos de posiciones, iluminación, objetos, robot o condiciones de la mesa de trabajo.
- Riesgo de errores de acción: aunque no es un modelo generativo de texto, puede producir trayectorias incorrectas o inseguras; la alucinación no aplica igual que en un LLM, pero el riesgo de acción errónea es relevante.
- Idiomas no documentados: no se especifica qué instrucciones de lenguaje comprende ni en qué idiomas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige cumplir las condiciones de la licencia y no garantiza seguridad física ni ausencia de defectos.
- Validación comunitaria limitada: 16 descargas y 0 likes en el momento de la consulta.
- Tamaño del repositorio: 9,4 GB, lo que requiere almacenamiento y ancho de banda considerables.
- No se documentan cuantizaciones oficiales, latencia, throughput ni requisitos mínimos de hardware.
- Para uso real en robots: validar en entorno controlado, definir límites de fuerza y velocidad, y disponer de parada de emergencia.

## Enlaces

- [HuggingFace: lucazanett/pi05-plug_adaptive_3](https://huggingface.co/lucazanett/pi05-plug_adaptive_3)
- [Dataset: lucazanett/plug_adaptive_3](https://huggingface.co/datasets/lucazanett/plug_adaptive_3)
- [Blog de Physical Intelligence sobre π₀.₅](https://www.physicalintelligence.company/blog/pi05)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Repositorio OpenPI de Physical Intelligence](https://github.com/Physical-Intelligence/openpi)
