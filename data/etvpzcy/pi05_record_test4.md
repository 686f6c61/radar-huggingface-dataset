# etvpzcy/pi05_record_test4

## Resumen

El modelo `etvpzcy/pi05_record_test4` es una implementación de la política π₀.₅ (Pi05), un modelo Visión-Lenguaje-Acción (VLA) desarrollado originalmente por Physical Intelligence y adaptado al ecosistema LeRobot de Hugging Face. Pi05 está diseñado para abordar la generalización en robótica: a diferencia de modelos anteriores que funcionan bien en entornos controlados, este modelo pretende generalizar a entornos y situaciones completamente nuevos no vistos durante el entrenamiento. La versión alojada en este repositorio ha sido entrenada sobre el dataset `etvpzcy/record-test4` y publicada bajo licencia Apache-2.0, lo que permite su uso y modificación sin restricciones comerciales.

El modelo cuenta con 3.616.757.520 parámetros (aproximadamente 3,6 mil millones), almacenados en formato safetensors, y se integra en el pipeline de robótica de LeRobot. Aunque la información pública disponible es limitada, su origen en la línea π₀.₅ sugiere una arquitectura multimodal que combina procesamiento de visión, lenguaje y acciones motoras. La fecha de creación (agosto de 2026) indica que se trata de un desarrollo reciente, probablemente orientado a investigación y experimentación en manipulación robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Visión-Lenguaje-Acción (VLA), basada en π₀.₅ de Physical Intelligence |
| Parametros totales | 3.616.757.520 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo robótico, probablemente sin soporte lingüístico directo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta de este modelo no está documentada en la información proporcionada. Sin embargo, por su referencia a π₀.₅ de Physical Intelligence, se trata de un modelo VLA que integra un codificador de visión, un modelo de lenguaje y un decodificador de acciones motoras. La implementación en LeRobot sugiere que sigue el patrón de políticas de imitación (behavior cloning) con posible entrenamiento mediante demostraciones. El dataset de entrenamiento es `etvpzcy/record-test4`, del cual no se detalla composición ni número de episodios. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales. La innovación principal de π₀.₅ reside en su capacidad de generalización open-world, lograda mediante un entrenamiento a gran escala con datos heterogéneos, aunque los detalles específicos de este checkpoint no están disponibles.

## Capacidades

- Generación de acciones motoras para robótica: el modelo produce comandos de actuación (por ejemplo, posiciones de articulaciones) a partir de observaciones visuales y, potencialmente, instrucciones en lenguaje.
- Percepción visual: procesa imágenes o secuencias de vídeo para comprender el estado del entorno.
- Generalización a entornos no vistos: según la descripción de π₀.₅, está diseñado para operar en escenarios nuevos, más allá de los datos de entrenamiento.
- Integración con LeRobot: compatible con el framework de Hugging Face para entrenamiento, evaluación y despliegue de políticas robóticas.
- Soporte de tool calling / function calling: no disponible (no se menciona).
- Soporte de agentes y multi-step reasoning: no disponible (enfoque en control motor directo).
- Capacidades multilingües: no aplicable (modelo de acción, no de lenguaje).

## Casos de uso

- Manipulación robótica en entornos industriales: el modelo puede controlar brazos robóticos para tareas de recogida y colocación (pick-and-place) en líneas de montaje, aprovechando su capacidad de generalización a nuevas disposiciones de objetos.
- Robótica doméstica: aplicable a asistentes domésticos que deben operar en cocinas o salones cambiantes, donde los objetos y su ubicación varían entre sesiones.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la generalización en políticas VLA, dado su origen en π₀.₅ y su disponibilidad en LeRobot.
- Evaluación de políticas robóticas en simulación: puede desplegarse en entornos simulados (por ejemplo, MuJoCo) para validar su comportamiento antes de transferirlo a hardware real.
- Teleoperación asistida: combinado con un sistema de captura de demostraciones, el modelo puede aprender de nuevas demostraciones y mejorar su rendimiento en tareas específicas.
- Benchmarking de modelos VLA: permite comparar el rendimiento de π₀.₅ con otras políticas de código abierto en tareas estándar de robótica, gracias a su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como éxito en tareas, precisión de acciones o comparativas con otros modelos. Se recomienda consultar el blog de Physical Intelligence para obtener referencias generales sobre π₀.₅, aunque no se garantiza que este checkpoint específico reproduzca esos resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 3,6 mil millones de parámetros en precisión fp32, se requerirían aproximadamente 14,5 GB de VRAM solo para los pesos (3,6e9 × 4 bytes). Con cuantización a fp16 se reduciría a ~7,2 GB, y a int8 a ~3,6 GB, pero no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: no disponible. Para una inferencia fluida en fp16 se necesitaría al menos una GPU con 12-16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A10, A100). Para fp32, se requerirían GPUs con 20+ GB (A100, H100).
- Si cabe en consumer GPU: probablemente sí con cuantización (por ejemplo, int8 o int4) en GPUs de 8-12 GB, pero no hay confirmación oficial.
- Opciones de despliegue: LeRobot ofrece scripts de inferencia y evaluación; también se puede exportar a formatos compatibles con vLLM o llama.cpp si se adapta, aunque no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo pertenece a la categoría de políticas VLA para robótica, donde existen alternativas como OpenVLA (7B parámetros), RT-2 (55B) o π₀ (la versión anterior de Physical Intelligence). Sin embargo, no se conocen los resultados de este checkpoint en tareas estándar, por lo que no es posible comparar rendimiento. Se recomienda consultar la literatura de π₀.₅ para obtener referencias cualitativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al ser un modelo entrenado sobre un dataset específico (`record-test4`), puede presentar sesgos derivados de los datos de demostración (por ejemplo, entornos particulares, tipos de robots o estilos de teleoperación).
- Riesgo de alucinación: en el contexto robótico, el riesgo se traduce en acciones incorrectas o no seguras cuando el modelo se enfrenta a situaciones fuera de su distribución de entrenamiento. Aunque π₀.₅ busca generalizar, no hay garantías de seguridad en entornos reales sin validación exhaustiva.
- Limitaciones de contexto o idioma: el modelo no está diseñado para procesar lenguaje natural de forma general; su entrada principal son observaciones visuales y posiblemente instrucciones de alto nivel, pero no se documenta soporte multilingüe.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia y se indiquen los cambios. No hay restricciones de uso en producción.
- Caveats para producción: no se han publicado evaluaciones de seguridad ni certificaciones. Antes de desplegar en robots físicos, es imprescindible realizar pruebas en simulación y con supervisión humana. La ausencia de cuantizaciones oficiales y de documentación sobre latencia dificulta la planificación de despliegue en tiempo real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/etvpzcy/pi05_record_test4
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
