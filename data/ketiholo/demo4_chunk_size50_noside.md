# ketiholo/demo4_chunk_size50_noside

## Resumen

`ketiholo/demo4_chunk_size50_noside` es una política de robótica entrenada con ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos de acciones en lugar de pasos individuales. El modelo lo publica el usuario ketiholo en Hugging Face Hub y se ha generado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. No es un modelo de lenguaje: es un checkpoint de control motor que traduce observaciones (típicamente imágenes de cámara y estado del robot) en comandos de acción para un brazo robótico.

El checkpoint tiene 51.619.463 parámetros (unos 51,6 millones) y un tamaño de repositorio de 0,2 GB en formato safetensors, lo que lo sitúa en el rango de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware modesto. El nombre sugiere un entrenamiento con `chunk_size=50` y sin componente "side" (probablemente sin cámara lateral), sobre el dataset `ketiholo/demo4`. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de LeRobot (entrenamiento con `lerobot-train`, evaluación con `lerobot-record`) y como política candidata para tareas de manipulación aprendidas de demostraciones teleoperadas. Al tener solo 18 descargas y 0 likes, es un artefacto de investigación personal más que un modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parametros totales | 51.619.463 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no LLM) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de imitación basado en transformer con codificador visual y decodificador de acciones. En lugar de predecir una acción por paso de tiempo, el modelo predice un chunk de acciones futuras (en este caso, presumiblemente de tamaño 50 según el nombre del checkpoint), lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación de precisión. La arquitectura combina un backbone visual (típicamente ResNet) para procesar las imágenes de las cámaras con un transformer que modela la secuencia de observaciones y genera las acciones.

El entrenamiento se realiza sobre el dataset `ketiholo/demo4`, compuesto por demostraciones teleoperadas. No se dispone de información sobre el número de episodios, la composición exacta del dataset, el número de tokens de entrenamiento (concepto que no aplica aquí) ni si se aplicaron técnicas de regularización adicionales. El sufijo `noside` sugiere que el entrenamiento excluyó una vista lateral, usando solo la cámara frontal o superior. No hay datos publicados sobre aumentación de datos, RLHF ni DPO, que no son habituales en este tipo de políticas.

## Capacidades

- Control de robots manipuladores mediante imitación: genera comandos de acción a partir de observaciones visuales y de estado del robot.
- Predicción de chunks de acciones (chunking), lo que permite ejecutar secuencias cortas de movimiento de forma coherente.
- Aprendizaje de tareas específicas a partir de demostraciones teleoperadas; no generaliza a tareas no vistas.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa texto, audio ni lenguaje natural; su entrada es sensorial (imágenes y estado proprioceptivo).

## Casos de uso

- Manipulación robótica de precisión en laboratorio: el modelo puede ejecutar tareas de pick-and-place aprendidas de demostraciones, usando el chunk de 50 acciones para mantener trayectorias suaves y reducir el jitter típico de políticas paso a paso.
- Reproducción de un pipeline de LeRobot: sirve como ejemplo de referencia para validar el flujo `lerobot-train` → `lerobot-record` antes de entrenar políticas propias con datasets mayores.
- Prototipado rápido en brazos tipo SO-100: al ser un checkpoint ligero (0,2 GB, ~51,6 M de parámetros), puede desplegarse en una GPU de consumo para pruebas de inferencia en tiempo real.
- Investigación en aprendizaje por imitación: útil como baseline para comparar variantes de chunk size, configuración de cámaras o datasets en experimentos académicos.
- Automatización de tareas repetitivas en entornos controlados: con la licencia Apache 2.0, puede integrarse en flujos comerciales internos sin obligación de publicar modificaciones.
- Docencia y formación: permite ilustrar de forma práctica cómo se entrena y evalúa una política ACT con datos teleoperados reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB en FP32 para los 51,6 M de parámetros, más el overhead del backbone visual y los buffers de inferencia; no hay datos oficiales de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia; para entrenamiento se recomienda una GPU con 16 GB o más (RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte para dispositivos CUDA; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del hardware, del número de cámaras y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ketiholo/demo4_chunk_size50_noside | 51,6 M | no aplica | ACT para manipulación | Apache 2.0 | Hugging Face (18 descargas) |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Manipulación por imitación | Apache 2.0 (habitual) | Hugging Face Hub |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación por imitación | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse solo con demostraciones de un operador y un entorno concretos, la política puede reproducir sesgos de la trayectoria humana y fallar ante variaciones de iluminación, posición de objetos o fondo.
- Riesgo de alucinación: en robótica se traduce en acciones erráticas o inseguras cuando la observación se sale de la distribución de entrenamiento; no hay mecanismo de verificación semántica.
- Limitaciones de contexto o idioma: no aplica el concepto de contexto lingüístico; el modelo no procesa texto ni instrucciones verbales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no hay restricciones adicionales documentadas.
- Caveats para producción: no se han publicado métricas de éxito, número de episodios de entrenamiento ni protocolo de evaluación; el nombre sugiere una configuración concreta de chunk size y sin cámara lateral, por lo que no debe asumirse que funcione con otras configuraciones de sensores.
- El modelo es específico del dataset `ketiholo/demo4` y del robot usado en la teleoperación; no es un modelo generalista.

## Enlaces

- [Hugging Face: ketiholo/demo4_chunk_size50_noside](https://huggingface.co/ketiholo/demo4_chunk_size50_noside)
- [Paper ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de entrenamiento de políticas en LeRobot](https://huggingface.co/docs/lerobot/il_robots#train-a-policy)
- [Dataset ketiholo/demo4](https://huggingface.co/datasets/ketiholo/demo4)
