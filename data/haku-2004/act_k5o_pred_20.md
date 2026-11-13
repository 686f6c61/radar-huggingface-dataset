# Haku-2004/act_k5o_pred_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. El modelo `act_k5o_pred_20` es una política concreta entrenada con la librería LeRobot de Hugging Face sobre el dataset `Haku-2004/k5_4seg`, orientada a control robótico de tipo seguidor (follower) en configuraciones SO-100.

La política tiene 51.672.714 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB, lo que la hace muy ligera para despliegue en hardware de borde o GPUs de consumo. Emplea arquitectura transformer con codificador visual y decodificador de acciones, y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Es relevante ahora porque forma parte del ecosistema LeRobot, que está estandarizando el entrenamiento y despliegue de políticas robóticas open source, y porque ACT sigue siendo una referencia práctica para tareas de manipulación con datos de teleoperación de pocas horas. No obstante, se trata de un checkpoint de un autor individual, sin benchmarks publicados ni documentación de evaluación más allá de la model card genérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (ACT: Action Chunking with Transformers) con codificador visual y decodificador de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformer que combina un codificador visual (típicamente ResNet preentrenado) con un codificador de estado y un decodificador transformer que genera chunks de acciones de longitud fija. La predicción por chunks, junto con el ensamblado temporal (temporal ensembling), mitiga el error compounding típico de las políticas que predicen un paso por vez. El modelo sigue el paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k5_4seg`, compuesto por episodios de teleoperación. No se dispone de información sobre el número de episodios, horas de datos, composición del dataset, aumentos de datos ni si se aplicó regularización adicional. Tampoco se documenta el proceso de entrenamiento (hiperparámetros, número de pasos, hardware utilizado). La model card es la plantilla estándar de LeRobot y no aporta detalles específicos del checkpoint.

## Capacidades

- Control robótico por imitación: genera chunks de acciones a partir de observaciones visuales y de estado del robot.
- Manipulación de objetos en entornos de laboratorio o mesa de trabajo, condicionada al dataset de entrenamiento.
- Compatibilidad con el ecosistema LeRobot para entrenamiento, evaluación y despliegue (`lerobot-train`, `lerobot-record`).
- Integración con robots tipo SO-100 follower (según el ejemplo de evaluación de la model card).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la percepción visual para control.

## Casos de uso

- Manipulación pick-and-place en laboratorio: la política puede ejecutar secuencias de agarre y colocación aprendidas del dataset `k5_4seg`, adecuada para tareas repetitivas con objetos similares a los de entrenamiento.
- Evaluación de pipelines de imitación con LeRobot: sirve como checkpoint de referencia para comparar configuraciones de entrenamiento (`--policy.type=act`) y protocolos de evaluación con `lerobot-record`.
- Prototipado rápido en robot SO-100: al ser un modelo de 51,7 M de parámetros y 0,2 GB, se puede desplegar en una GPU de consumo o incluso en CPU para pruebas de latencia.
- Investigación en aprendizaje por imitación: base para experimentos de ablación sobre chunking de acciones, ensamblado temporal y aumentos de datos.
- Automatización de tareas de mesa en entornos controlados: clasificación, apilado o inserción de piezas donde la variabilidad visual es baja y el dataset cubre las condiciones de operación.
- Docencia y formación en robótica open source: ejemplo completo y ligero del flujo LeRobot, desde el dataset hasta la evaluación en robot real.
- Despliegue en robots de bajo coste: al no requerir GPUs de datacenter, encaja en estaciones con RTX 3060/4060 o similares para inferencia en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (51,7 M de parámetros, ~207 MB de pesos) y menos de 0,5 GB en FP16; el cuello de botella real es el codificador visual y el preprocesado de imagen.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque las de gama alta están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles; dependen del robot, de la frecuencia de control y del hardware de inferencia. El chunking de acciones reduce la frecuencia de inferencia necesaria respecto a políticas paso a paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k5o_pred_20 (este) | 51,7 M | no aplica | sin benchmarks publicados | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | no aplica | éxito alto en tareas de manipulación según paper | código de referencia en el repositorio del paper | paper y código |
| Diffusion Policy | no disponible | no aplica | referencia habitual en imitación robótica | según implementación | múltiples implementaciones open source |
| Políticas LeRobot ACT genéricas | variable | no aplica | dependen del dataset | Apache 2.0 | Hugging Face |

La comparación cuantitativa con alternativas no está disponible porque este checkpoint no publica métricas de éxito ni comparaciones controladas.

## Limitaciones y advertencias

- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito, robustez ni generalización fuera del dataset `k5_4seg`.
- Sobreajuste al dominio: al entrenarse con un dataset concreto de teleoperación, el rendimiento caerá ante cambios de iluminación, fondo, objetos o posición de cámara no representados.
- Sin información sobre sesgos: no se documentan sesgos, pero el comportamiento queda determinado por las demostraciones humanas del dataset.
- Riesgo de fallo silencioso: como toda política de imitación, puede ejecutar acciones incorrectas con alta confianza; se recomienda supervisión y paradas de seguridad en producción.
- Limitaciones de idioma: no aplica, pero tampoco hay soporte de instrucciones en lenguaje natural; el control es puramente por observación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Checkpoint de autor individual con 0 descargas y 0 likes en el momento de la consulta: baja validación comunitaria y ausencia de mantenimiento documentado.
- Fecha de creación futura (2026-11-13) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5o_pred_20
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
