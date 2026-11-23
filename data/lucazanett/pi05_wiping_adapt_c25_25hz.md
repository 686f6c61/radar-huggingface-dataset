# lucazanett/pi05_wiping_adapt_c25_25hz

## Resumen

π₀.₅ (Pi05) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, orientado a la generalización en entornos abiertos para tareas de robótica. El repositorio `lucazanett/pi05_wiping_adapt_c25_25hz` es un *fine-tuning* de esa política, entrenado con LeRobot sobre el dataset `lucazanett/new_setup_wiping_adaptive_01_25hz`, que corresponde a una tarea concreta de limpieza o frotado ("wiping") con un setup adaptativo y una frecuencia de captura de 25 Hz. El autor es el usuario de Hugging Face `lucazanett`, no Physical Intelligence.

El modelo resuelve un problema muy específico: mapear observaciones visuales y estado del robot a acciones de control continuas para ejecutar una tarea de wiping sobre un robot tipo SO-100/SO-101 (el ejemplo de la model card usa `so100_follower`). No es un modelo de lenguaje generalista, sino una política entrenada para un dataset y un hardware concretos; su utilidad fuera de ese contexto es limitada.

Con 4.143.404.816 parámetros (~4,14 mil millones) y un tamaño de repositorio de 9,4 GB en safetensors, se enmarca en la categoría de políticas VLA de tamaño medio. La licencia Apache 2.0 permite uso comercial, pero la ausencia de métricas de rendimiento publicadas y el carácter de *fine-tuning* sobre un único dataset condicionan seriamente su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementación LeRobot adaptada de OpenPI (Physical Intelligence) |
| Parámetros totales | 4.143.404.816 (~4,14 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La model card describe π₀.₅ como una evolución de π₀ orientada a la generalización en entornos abiertos, con implementación en LeRobot derivada del repositorio OpenPI de Physical Intelligence. Se trata de una política VLA que combina un codificador visual, un componente de lenguaje y una cabeza de acción que produce comandos motores continuos. El repositorio concreto es un *fine-tuning* sobre el dataset `lucazanett/new_setup_wiping_adaptive_01_25hz`, capturado a 25 Hz, lo que sugiere un control de alta frecuencia para una tarea de frotado adaptativo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas de esta variante. La model card solo aporta el flujo de entrenamiento y evaluación con LeRobot (`lerobot-train` y `lerobot-record`), sin detallar hiperparámetros, aumentos de datos ni estrategia de adaptación. La referencia a "adaptive" en el nombre del dataset apunta a un setup de recogida adaptativo, pero no se especifica en qué consiste.

## Capacidades

- Generación de acciones motoras continuas a partir de observaciones visuales y estado del robot para la tarea de wiping.
- Control a 25 Hz, adecuado para tareas de contacto que requieren corrección frecuente.
- Integración nativa con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante `lerobot-train` y `lerobot-record`.
- Compatible con robots tipo SO-100 (`so100_follower` en los ejemplos de la model card).
- Capacidades de visión-lenguaje-acción heredadas de la arquitectura π₀.₅ de Physical Intelligence (generalización en entornos abiertos según la documentación del modelo base).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni capacidades multilingües en el repositorio.

## Casos de uso

- Automatización de limpieza de superficies en laboratorio: el modelo ejecuta la política de wiping sobre un robot SO-100 entrenado con el dataset del autor, útil para reproducir experimentos de manipulación de contacto.
- Investigación en aprendizaje por imitación: sirve como punto de partida para comparar variantes de π₀.₅ fine-tuneadas sobre tareas de frotado con distintas frecuencias de control.
- Prototipado de pipelines LeRobot: permite validar el flujo completo de `lerobot-train` y `lerobot-record` con un checkpoint real de ~4,14 mil millones de parámetros.
- Benchmarking de políticas VLA en tareas de contacto: al estar entrenado a 25 Hz, es adecuado para medir latencia y estabilidad en control de alta frecuencia.
- Base para *fine-tuning* adicional: con licencia Apache 2.0, puede adaptarse a setups similares de wiping con otros objetos o superficies, siempre que se disponga de datos propios.
- Docencia y demostraciones: ejemplo reproducible de entrenamiento de una política VLA con LeRobot sobre hardware de bajo coste tipo SO-100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8,3 GB solo para pesos (4,14 mil millones de parámetros × 2 bytes), más overhead de activaciones y del codificador visual; en la práctica se recomienda al menos 12-16 GB.
- En cuantización de 8 bits: ~4,1 GB de pesos; en 4 bits: ~2,1 GB, aunque no se documentan formatos de cuantización soportados para esta política.
- GPU recomendadas: A100, H100 o L40S para entrenamiento y evaluación a 25 Hz; RTX 4090 (24 GB) para inferencia y *fine-tuning* ligero.
- Cabe en GPU de consumo: sí, en RTX 4090 y potencialmente en RTX 3090 (24 GB); en GPUs de 8-12 GB requeriría cuantización no documentada.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de acción.
- Latencia y throughput: no disponibles; la frecuencia de entrenamiento de 25 Hz implica un objetivo de 40 ms por paso de control, pero no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lucazanett/pi05_wiping_adapt_c25_25hz` | ~4,14 mil millones | no disponible | Wiping con SO-100 (fine-tuning) | Apache 2.0 | Hugging Face, 0 descargas |
| π₀.₅ base (Physical Intelligence) | no disponible | no disponible | VLA generalista | no disponible en la información | OpenPI (referencia en la model card) |
| Políticas ACT de LeRobot | no disponible | no disponible | Manipulación por imitación | Apache 2.0 (LeRobot) | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado para un único dataset y una tarea concreta (wiping adaptativo a 25 Hz); la generalización fuera de ese setup no está demostrada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de éxito, robustez ni tasas de fallo.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se documentan sesgos, pero al ser una política visual puede heredar sesgos de las condiciones de iluminación, objetos y superficies del dataset de entrenamiento.
- Riesgo de sobreajuste al hardware concreto (SO-100) y al entorno de captura; el comportamiento en otros robots o cámaras es incierto.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentación sobre el dataset subyacente impide verificar la procedencia y los derechos de los datos de entrenamiento.
- No se especifican requisitos de seguridad para operación física; cualquier despliegue en un robot real debe incluir límites de par, paradas de emergencia y supervisión.
- El ejemplo de la model card usa `--policy.type=act`, lo que puede inducir a error: para cargar este checkpoint debe usarse `--policy.path` apuntando al repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/lucazanett/pi05_wiping_adapt_c25_25hz
- Dataset de entrenamiento: https://huggingface.co/datasets/lucazanett/new_setup_wiping_adaptive_01_25hz
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
