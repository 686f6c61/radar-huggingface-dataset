# BravoRobots/so101_fuse_act

## Resumen

so101_fuse_act es una política de control robótico (policy) publicada por BravoRobots en Hugging Face, entrenada dentro del ecosistema LeRobot. No se trata de un modelo de lenguaje: es un modelo de aprendizaje por imitación (imitation learning) que mapea observaciones de sensores y cámaras a acciones de control para un brazo robótico. Con 51.668.614 parámetros y un peso de repositorio de 0,2 GB en formato safetensors, es un modelo compacto, pensado para ejecutarse en hardware modesto junto al robot.

La nomenclatura del repositorio sugiere un enfoque ACT (Action Chunking with Transformers), una arquitectura habitual en LeRobot para imitación de tareas manipulativas, aunque el autor no lo confirma explícitamente en la model card, que es mínima y solo declara la licencia MIT y la etiqueta lerobot. El sufijo "fuse" podría indicar fusión de modalidades o de checkpoints, pero no hay documentación que lo aclare.

Su relevancia es acotada pero concreta: ofrece un checkpoint listo para usar en tareas de manipulación con el brazo SO-101 (variante del SO-100 de The Robot Company), con licencia permisiva MIT y una huella de memoria pequeña, lo que facilita su despliegue en estaciones de trabajo con GPU de consumo. La información pública disponible es muy limitada (42 descargas, 0 likes, sin paper ni demo), por lo que esta ficha se limita a lo verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la etiqueta `lerobot` y el nombre sugieren ACT, sin confirmar por el autor) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; LeRobot suele soportar carga en fp32/fp16) |
| Idiomas soportados | No disponible (modelo de control robótico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna, el número de tokens o episodios de entrenamiento, la composición del dataset ni si se aplicaron técnicas de refinamiento como RLHF o DPO. El autor no incluye model card descriptiva más allá de los metadatos de licencia y la etiqueta `lerobot`.

Por convención del ecosistema LeRobot, los modelos con nombre `*_act` corresponden a políticas ACT (Action Chunking with Transformers), que predicen secuencias de acciones (chunks) a partir de observaciones visuales y propioceptivas, con un transformer que codifica la observación y un decodificador que emite las acciones. El término "fuse" podría referirse a la fusión de múltiples cámaras o de estados del robot en la entrada, pero es una inferencia no confirmada. No se dispone de detalles sobre aumentos de datos, resolución de imagen, frecuencia de control ni horizonte de predicción.

## Capacidades

- Control robótico por imitación: genera comandos de acción a partir de observaciones del entorno, orientado a manipulación con el brazo SO-101.
- Entrada multimodal probable (cámaras y estado de articulaciones), aunque la composición exacta no está documentada.
- Integración con LeRobot: el checkpoint está etiquetado como `lerobot`, por lo que se espera compatibilidad con las utilidades de entrenamiento e inferencia de esa librería.
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se han documentado capacidades de visión general, audio ni modos de "thinking".

## Casos de uso

- Manipulación de laboratorio con SO-101: cargar el checkpoint en LeRobot y ejecutar la política sobre el brazo para reproducir la tarea demostrada durante el entrenamiento; su tamaño (51,7 M de parámetros) permite inferencia en tiempo real en una GPU de consumo.
- Prototipado rápido de tareas pick-and-place: al ser un checkpoint ya entrenado, sirve como punto de partida para evaluar la viabilidad de una tarea antes de invertir en recolección de datos propia.
- Investigación en imitation learning: usar el modelo como baseline reproducible con licencia MIT para comparar variantes de ACT o de fusión de sensores.
- Docencia y formación: desplegar el modelo en un banco de pruebas con SO-101 para ilustrar el ciclo completo de teleoperación, entrenamiento e inferencia en LeRobot.
- Integración en pipelines de robótica de bajo coste: al ocupar 0,2 GB, puede convivir con otros procesos en una estación con RTX 3060 o superior, reduciendo la necesidad de hardware dedicado.
- Evaluación de robustez en entornos controlados: comparar el comportamiento del checkpoint frente a variaciones de iluminación o posición de objetos para medir la generalización del entrenamiento original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay tasas de éxito, métricas de error de posición ni comparaciones con otras políticas en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (51,7 M de parámetros, ~207 MB de pesos) y alrededor de 100-150 MB en fp16; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (librería nativa del checkpoint); no hay evidencia de soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Al ser una política de control, la latencia relevante es la del bucle de control del robot, que depende de la frecuencia de inferencia y del hardware; no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BravoRobots/so101_fuse_act | 51,7 M | No disponible | Control robótico (SO-101) | MIT | Hugging Face, 42 descargas |
| Políticas ACT de referencia en LeRobot | No disponible | No disponible | Imitación manipulativa | Apache 2.0 (repo LeRobot) | Hugging Face / GitHub |
| Políticas Diffusion Policy | No disponible | No disponible | Imitación manipulativa | MIT (implementación de referencia) | GitHub |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a licencia, disponibilidad y naturaleza de la tarea.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe arquitectura, datos de entrenamiento, tarea objetivo ni métricas, lo que dificulta evaluar su idoneidad sin probarlo.
- Especialización estrecha: es una política entrenada para una tarea y un robot concretos (SO-101); no generaliza a otros brazos ni a tareas no vistas sin reentrenamiento.
- Riesgo de sobreajuste al entorno de entrenamiento: sin datos de validación publicados, no puede descartarse una generalización pobre ante cambios de iluminación, fondo u objetos.
- Sin garantías de seguridad física: un modelo de control robótico puede generar acciones erráticas; es imprescindible operar con límites de par, paradas de emergencia y supervisión humana.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia de los datos de entrenamiento antes de un despliegue comercial.
- Sin soporte lingüístico ni de agentes: no debe confundirse con un modelo de lenguaje; no responde a prompts de texto.
- Idiomas: no aplica; no hay información sobre el idioma de la documentación asociada más allá del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/BravoRobots/so101_fuse_act
- LeRobot (librería): https://github.com/huggingface/lerobot
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
