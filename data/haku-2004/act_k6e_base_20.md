# Haku-2004/act_k6e_base_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `Haku-2004/act_k6e_base_20`, es una política ACT entrenada y publicada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica.

El modelo resuelve el problema de control motor fino en robots manipuladores a partir de datos de teleoperación. Con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware modesto. Está pensado para tareas específicas de un robot concreto (probablemente un seguidor tipo SO-100, dado el ejemplo de la model card) y un entorno determinado, no como modelo generalista.

Su relevancia radica en que ejemplifica el flujo actual de robótica open source: entrenamiento reproducible con LeRobot, pesos en safetensors y licencia Apache 2.0, lo que permite reutilizar la política, inspeccionarla y desplegarla sin restricciones comerciales. No obstante, al ser un modelo entrenado sobre un dataset privado concreto (`Haku-2004/k6_20_20261113_173939`), su generalización fuera de ese entorno es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer encoder-decoder con CVAE |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ventana de observación definida por la política) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT se basa en un transformer con un componente de autoencoder condicional variacional (CVAE) que modela la variabilidad de las trayectorias humanas. La política recibe observaciones (imágenes de cámaras y estado de las articulaciones) y predice un chunk de acciones futuras, lo que mitiga el problema de compounding error típico de las políticas paso a paso. La arquitectura incluye un encoder de observaciones y un decoder que genera la secuencia de acciones.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939`, compuesto por episodios de teleoperación. No se dispone de información sobre el número de episodios, la composición exacta del dataset, la resolución de las cámaras ni si se aplicaron técnicas de aumento de datos. Tampoco se documenta el uso de RLHF o DPO, algo esperable en un método de imitación supervisada como ACT.

## Capacidades

- Control de robots manipuladores mediante predicción de chunks de acciones a partir de observaciones visuales y propioceptivas.
- Aprendizaje por imitación a partir de datos de teleoperación.
- Ejecución de tareas de manipulación específicas para las que fue entrenado (no generaliza a tareas no vistas).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la percepción visual para control.

## Casos de uso

- Manipulación robótica de precisión en laboratorio: la política puede ejecutar secuencias de agarre y colocación aprendidas de demostraciones humanas, adecuada porque ACT predice chunks que suavizan la trayectoria y reducen el jitter.
- Automatización de tareas repetitivas en línea de montaje: con 51,7 M de parámetros, la inferencia es ligera y puede ejecutarse en una GPU de gama media, permitiendo ciclos de control en tiempo real.
- Investigación en aprendizaje por imitación: sirve como baseline reproducible para comparar variantes de ACT, gracias a la integración con LeRobot y a los pesos en safetensors.
- Prototipado rápido de políticas para robots SO-100: la model card incluye comandos `lerobot-record` con `so100_follower`, lo que facilita la evaluación directa en ese hardware.
- Evaluación de robustez ante variaciones de iluminación o posición de objetos: al ser un modelo pequeño, se puede reentrenar o hacer fine-tuning con pocos datos adicionales.
- Docencia y formación en robótica: el tamaño reducido del repositorio (0,2 GB) y la licencia Apache 2.0 permiten su uso en cursos y talleres sin coste ni restricciones.
- Despliegue en entornos con recursos limitados: al no requerir GPUs de gran VRAM, puede ejecutarse en estaciones de trabajo con una RTX 3060 o similar, según la cuantización y el backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 M de parámetros, en FP32 ocupa aproximadamente 207 MB; en FP16, unos 103 MB. La VRAM adicional depende del tamaño de las imágenes de entrada y del batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se sugiere RTX 3060, RTX 4060, RTX 4090, A100 o H100 para entrenamiento o evaluación a mayor escala.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante, aunque se recomienda RTX 3060 o superior para entrenamiento).
- Opciones de despliegue: LeRobot (comandos `lerobot-record` y `lerobot-train`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependen del hardware, la resolución de las cámaras y la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k6e_base_20 (ACT) | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face |
| Diffusion Policy (Chi et al.) | variable, típicamente 10-100 M | no aplica | no disponible en esta ficha | MIT (implementaciones de referencia) | Repositorios académicos |
| RT-1 (Google) | 35 M | no aplica | no disponible en esta ficha | no comercial (investigación) | No público en su totalidad |
| Octo (small) | 27 M | no aplica | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparación cuantitativa de rendimiento no es posible con la información disponible; los datos de parámetros y licencia se han tomado de las fuentes públicas de cada proyecto, pero no se dispone de métricas de éxito en tareas comparables.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un dataset concreto de teleoperación, la política hereda los sesgos de las demostraciones (posiciones, velocidades, estilos de agarre) y puede fallar ante configuraciones no representadas.
- Riesgo de alucinación: en robótica, se traduce en acciones incorrectas o inseguras cuando la observación se sale de la distribución de entrenamiento; no hay mecanismo de verificación semántica.
- Limitaciones de contexto o idioma: no procesa lenguaje; la ventana de observación está fijada por la arquitectura y no se documenta su longitud.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (`Haku-2004/k6_20_20261113_173939`) puede tener sus propias restricciones no indicadas en la model card.
- Caveat para producción: no se han publicado métricas de éxito, robustez ni seguridad; antes de desplegar en un robot real es imprescindible validar en el entorno objetivo y establecer límites de seguridad físicos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_k6e_base_20
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
