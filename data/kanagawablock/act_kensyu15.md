# Kanagawablock/act_kensyu15

## Resumen

`Kanagawablock/act_kensyu15` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un algoritmo de aprendizaje por imitación presentado en el paper arXiv:2304.13705. El modelo ha sido entrenado y publicado en Hugging Face mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Su función no es generar texto, sino predecir secuencias cortas de acciones motoras ("action chunks") a partir de observaciones visuales y del estado del robot, lo que permite controlar brazos robóticos en tareas de manipulación aprendidas a partir de demostraciones teleoperadas.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 millones), un tamaño muy reducido en comparación con los modelos de lenguaje, y un repositorio de solo 0,2 GB en formato safetensors. Está asociado al dataset `Kanagawablock/kensyu15`, que contiene las demostraciones teleoperadas empleadas para el entrenamiento. Por su pipeline (`robotics`) y su librería (`lerobot`), está pensado para ejecutarse con el stack de LeRobot sobre robots tipo SO-100/SO-101, no como un modelo de propósito general.

Su relevancia es acotada: se trata de un checkpoint de entrenamiento (el nombre "kensyu15" sugiere una sesión de práctica o formación número 15) con cero descargas y cero likes en el momento de la consulta, publicado bajo licencia Apache 2.0. Resulta útil como ejemplo reproducible de un pipeline completo de imitación con ACT en LeRobot, pero no constituye un modelo con benchmarks publicados ni con validación externa conocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; el modelo consume observaciones por paso, no secuencias de texto) |
| Tipos de cuantización | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones específicas para este checkpoint) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice bloques de acciones futuras en lugar de un único paso. La arquitectura combina un codificador visual (habitualmente un backbone tipo ResNet preentrenado en ImageNet) que procesa las imágenes de las cámaras del robot, un codificador de estado que integra las articulaciones y variables del robot, y un decodificador transformer que genera el chunk de acciones. Una innovación central del método original es el uso de una CVAE (autoencoder variacional condicional) durante el entrenamiento para modelar la variabilidad de las demostraciones humanas, junto con el "temporal ensembling" en inferencia para suavizar las predicciones entre chunks solapados.

En cuanto a los datos de entrenamiento, la model card solo indica el dataset asociado `Kanagawablock/kensyu15` y que el entrenamiento se realizó con LeRobot mediante `lerobot-train --policy.type=act`. No se especifica el número de episodios, el número de tokens equivalentes, la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en este contexto). Tampoco se documentan detalles sobre el robot concreto, el número de cámaras, la dimensionalidad del espacio de acciones ni la configuración exacta del chunk size.

## Capacidades

- Control robótico por imitación: predice chunks de acciones (posiciones articulares o del efector final) a partir de observaciones visuales y del estado del robot.
- Manipulación visual: integra entradas de cámara para tareas de agarre, colocación y manipulación de objetos.
- Ejecución autónoma de políticas: puede desplegarse en bucle cerrado sobre un robot real mediante `lerobot-record`.
- Aprendizaje a partir de demostraciones teleoperadas: reproduce comportamientos aprendidos de un dataset concreto de teleoperación.
- Compatibilidad con el ecosistema LeRobot: entrenamiento, evaluación y registro de episodios con las herramientas oficiales.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües; no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de un pipeline de imitación con ACT: sirve como referencia práctica para entrenar y evaluar una política ACT sobre un dataset propio, usando los comandos documentados de LeRobot.
- Manipulación robótica de laboratorio: ejecutar la política sobre un robot SO-100 follower para tareas de pick-and-place aprendidas en el dataset `kensyu15`.
- Docencia y formación en robótica: el nombre del checkpoint sugiere un uso de práctica; puede emplearse como ejemplo en cursos de aprendizaje por imitación para ilustrar el flujo completo de teleoperación, entrenamiento y despliegue.
- Evaluación comparativa de configuraciones de ACT: al ser un checkpoint pequeño (51,7 M de parámetros) y con pesos safetensors, permite iterar rápidamente sobre variantes de chunk size, número de cámaras o épocas de entrenamiento.
- Base para fine-tuning en tareas similares: partir de estos pesos y reentrenar con un dataset propio de pocas decenas de episodios, aprovechando que el coste computacional de ACT es bajo.
- Despliegue en hardware de bajo coste: con 51,7 M de parámetros, la inferencia cabe en GPUs de consumo e incluso puede plantearse en CPU para pruebas de latencia, lo que facilita prototipos en laboratorios sin clústeres dedicados.
- Validación de infraestructura LeRobot: usar el checkpoint para verificar que la instalación de LeRobot, los drivers del robot y la grabación de episodios funcionan antes de entrenar políticas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, curvas de aprendizaje ni comparaciones con otras políticas, y el repositorio registra cero descargas y cero likes, sin evidencia externa de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 M de parámetros, los pesos en precisión completa ocupan aproximadamente 0,2 GB; la VRAM efectiva depende sobre todo del backbone visual y del tamaño de las imágenes de entrada, pero en la práctica cabe holgadamente en cualquier GPU con 4-8 GB.
- GPU recomendadas: cualquier GPU NVIDIA moderna (RTX 3060, RTX 4090, A100, H100) es suficiente; el modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 4 GB de VRAM; también es viable la inferencia en CPU para pruebas, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch y safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, del número de cámaras y del chunk size configurado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanagawablock/act_kensyu15 | 51,7 M | no aplica | sin benchmarks publicados | Apache 2.0 | Hugging Face (0 descargas) |
| Políticas ACT de referencia en LeRobot | ~51 M (configuración típica) | no aplica | tasas de éxito variables según dataset, no comparables directamente | Apache 2.0 | Hugging Face / LeRobot |
| Diffusion Policy (visuomotor) | variable, habitualmente decenas de millones | no aplica | alternativa habitual a ACT en manipulación; sin comparación directa disponible | MIT/Apache según implementación | Hugging Face / LeRobot |
| SmolVLA | ~450 M | no aplica | política VLA de Hugging Face para control robótico | Apache 2.0 | Hugging Face / LeRobot |

La comparación cuantitativa con alternativas no está disponible: no existen métricas publicadas para este checkpoint que permitan situarlo frente a otras políticas ACT, Diffusion Policy o SmolVLA en las mismas tareas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un dataset concreto de teleoperación (`kensyu15`), la política hereda los sesgos de las demostraciones (posiciones iniciales, iluminación, objetos y configuración del robot), y generalizará mal fuera de esa distribución.
- Riesgo de alucinación: en robótica se traduce en acciones erráticas o inseguras cuando la observación se aleja de lo visto en entrenamiento; requiere supervisión y paradas de seguridad.
- Limitaciones de contexto e idioma: no procesa texto ni lenguaje natural; no tiene ventana de contexto lingüística y no soporta instrucciones verbales.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías; el uso en entornos físicos con personas exige evaluaciones de seguridad independientes.
- Caveats para producción: cero descargas y nula validación externa; ausencia de benchmarks, de documentación sobre el robot objetivo y de detalles del dataset; el nombre del checkpoint sugiere un entrenamiento de práctica, no un modelo listo para producción.
- Dependencia del stack LeRobot: el despliegue requiere versiones compatibles de LeRobot, PyTorch y los drivers del robot; cambios de versión pueden romper la carga del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kanagawablock/act_kensyu15
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset asociado: https://huggingface.co/datasets/Kanagawablock/kensyu15
