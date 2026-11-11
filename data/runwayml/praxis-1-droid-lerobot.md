# runwayml/praxis-1-droid-lerobot

## Resumen

Praxis-1 DROID (LeRobot) es un modelo de política robótica publicado por RunwayML bajo licencia Apache 2.0. Se trata de una política de difusión de vídeo con arquitectura Mixture of Experts (MoE) de 27.202.371.288 parámetros totales, compuesta por un tronco causal por fragmentos (chunk-causal trunk) y un experto de acción de 0,3B de parámetros. El modelo está especializado en el robot de un solo brazo DROID (plataforma Franka) y se distribuye en el formato de política `praxis` de la librería LeRobot.

El problema que resuelve es la generación de trayectorias de acción para control robótico a partir de observaciones visuales. Concretamente, consume dos cámaras (`observation.images.exterior` y `observation.images.wrist`) y produce fragmentos de acción (action chunks) de 24 pasos a una frecuencia de control de 15 Hz. Esta variante LeRobot contiene exactamente los mismos pesos que `runwayml/praxis-1-droid` (17 shards safetensors, byte a byte), pero añade el `config.json` con la `PraxisConfig` y los pre/post-procesadores serializados que espera el pipeline de LeRobot.

Su relevancia actual radica en que permite integrar un modelo de política de gran escala (27,2B parámetros) directamente en el ecosistema LeRobot mediante `lerobot-eval` o la clase `PraxisPolicy`, sin necesidad de adaptar manualmente el checkpoint. El repositorio ocupa 54,4 GB en bf16 y requiere una GPU de 80 GB para inferencia, lo que lo sitúa en el segmento de investigación y despliegue en servidor más que en robótica de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de difusion de video: tronco chunk-causal + experto de accion de 0,3B |
| Parametros totales | 27.202.371.288 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (17 shards, indice `model.safetensors.index.json`) |

## Arquitectura y entrenamiento

La arquitectura combina un tronco transformer de tipo chunk-causal con un experto de acción de 0,3B de parámetros, organizado como Mixture of Experts. El modelo se enmarca en la familia de políticas de difusión de vídeo: genera acciones mediante un proceso de difusión sobre representaciones de vídeo, lo que permite modelar distribuciones multimodales de trayectorias. El control se realiza mediante action chunking de 24 pasos a 15 Hz, es decir, el modelo predice bloques de 24 acciones consecutivas en cada inferencia.

El modelo depende de dos componentes congelados que no se incluyen en el repositorio y se descargan del Hub: el VAE de Wan2.2 y el codificador de texto `Qwen/Qwen3.5-2B`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo base es `runwayml/praxis-1-droid`, y esta variante únicamente reorganiza el checkpoint en el formato de política LeRobot mediante el script `examples/praxis/convert_checkpoint.py`. No se han documentado innovaciones adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de trayectorias de acción para robots de un solo brazo (embodiment DROID, plataforma Franka).
- Procesamiento multimodal de entrada: dos cámaras (`observation.images.exterior` y `observation.images.wrist`).
- Action chunking: predicción de bloques de 24 acciones a 15 Hz.
- Política de difusión de vídeo para modelado de distribuciones multimodales de movimiento.
- Integración nativa con el ecosistema LeRobot (`PraxisPolicy`, `lerobot-eval`).
- Soporte de pre y post-procesadores serializados incluidos en el repositorio.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, por tratarse de un modelo de robótica y no de lenguaje.

## Casos de uso

- Manipulación robótica con DROID en laboratorio: el modelo consume las cámaras exterior y de muñeca y emite fragmentos de 24 acciones a 15 Hz, adecuado para tareas de pick-and-place y manipulación fina sobre una plataforma Franka.
- Evaluación estandarizada de políticas: mediante `lerobot-eval` con `--policy.path=runwayml/praxis-1-droid-lerobot` se puede ejecutar el modelo sobre los conjuntos de evaluación publicados en `runwayml/praxis-1-eval` para comparar con otras políticas.
- Punto de partida para fine-tuning en un nuevo robot: al compartir pesos con `praxis-1-droid` y existir `praxis-1-base` sin cabezas de acción, sirve como referencia para adaptar la política a otros brazos o configuraciones de cámara.
- Investigación en políticas de difusión de vídeo: la separación entre tronco chunk-causal y experto de acción de 0,3B facilita estudiar el efecto del experto de acción frente al tronco en el rendimiento de manipulación.
- Integración en pipelines de LeRobot: el `config.json` y los procesadores serializados permiten cargar la política con `PraxisPolicy.from_pretrained` sin conversión manual, útil para prototipado rápido en entornos de investigación.
- Reproducción de resultados: al ser los mismos 17 shards que `praxis-1-droid`, permite verificar que la conversión al formato LeRobot no altera el comportamiento del modelo en evaluaciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: una GPU de 80 GB (indicado explícitamente en la model card).
- GPU recomendadas: A100 80 GB, H100 80 GB u otras GPU con 80 GB de memoria; no se especifican modelos concretos más allá del requisito de 80 GB.
- No cabe en GPU de consumo (RTX 4090 con 24 GB, RTX 3090 con 24 GB) en bf16 sin cuantización, y no se documentan opciones de cuantización.
- Opciones de despliegue: LeRobot con el extra `praxis` (`pip install "lerobot[praxis]"`), `lerobot-eval` y la clase `PraxisPolicy`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, por tratarse de una política robótica y no de un modelo de lenguaje.
- Latencia y throughput: no disponibles.
- Dependencias adicionales descargadas del Hub: VAE de Wan2.2 y codificador de texto `Qwen/Qwen3.5-2B`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| runwayml/praxis-1-droid-lerobot | 27,2B (MoE) | no disponible | no disponible | Apache 2.0 | Hugging Face, formato LeRobot |
| runwayml/praxis-1-droid | 27,2B (MoE) | no disponible | no disponible | Apache 2.0 | Hugging Face, formato original praxis |
| runwayml/praxis-1-base | no disponible | no disponible | no disponible | no disponible | Hugging Face, sin cabezas de acción |
| runwayml/praxis-1-yam | no disponible | no disponible | no disponible | no disponible | Hugging Face, política bimanual YAM |

Las alternativas listadas pertenecen a la misma familia Praxis-1 de RunwayML y comparten arquitectura y licencia, diferenciándose en el embodiment (DROID de un brazo frente a YAM bimanual) y en el formato de distribución (LeRobot frente al layout original). No se dispone de datos de benchmarks que permitan comparar el rendimiento entre ellas.

## Limitaciones y advertencias

- Modelo especializado en un único embodiment: robot DROID de un solo brazo con configuración de cámaras fija (exterior y muñeca); no es directamente transferible a otras plataformas sin fine-tuning.
- Requiere una GPU de 80 GB para inferencia en bf16; no se documentan opciones de cuantización que reduzcan este requisito.
- Depende de componentes externos con licencias propias (VAE de Wan2.2 y `Qwen/Qwen3.5-2B`), que deben revisarse por separado antes de un uso comercial.
- No se dispone de información sobre sesgos, tasa de alucinación o robustez frente a distribuciones de entrada fuera del dominio de entrenamiento.
- No se documentan datos de entrenamiento, composición del dataset ni proceso de alineación, lo que limita la evaluación de riesgos en producción.
- La licencia Apache 2.0 permite uso comercial, pero las dependencias congeladas pueden imponer restricciones adicionales.
- El repositorio tiene 42 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y escasa validación comunitaria.
- No se dispone de información sobre latencia, throughput ni estabilidad en despliegues de larga duración.

## Enlaces

- Hugging Face: https://huggingface.co/runwayml/praxis-1-droid-lerobot
- Modelo base: https://huggingface.co/runwayml/praxis-1-droid
- Modelo base sin cabezas de acción: https://huggingface.co/runwayml/praxis-1-base
- Política bimanual YAM: https://huggingface.co/runwayml/praxis-1-yam
- Conjuntos de evaluación: https://huggingface.co/datasets/runwayml/praxis-1-eval
- Código de referencia (inferencia, serving, fine-tuning): https://github.com/runwayml/praxis-1-oss
