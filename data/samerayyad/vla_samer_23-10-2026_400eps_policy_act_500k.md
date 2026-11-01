# SamerAyyad/VLA_Samer_23.10.2026_400eps_policy_ACT_500k

## Resumen

El modelo `SamerAyyad/VLA_Samer_23.10.2026_400eps_policy_ACT_500k` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), publicada por SamerAyyad y entrenada con el framework LeRobot de Hugging Face. ACT predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación aprendidas a partir de datos de teleoperación.

El modelo cuenta con 51.670.663 parámetros en formato safetensors y un repositorio de 0,2 GB, lo que lo sitúa en la gama ligera y permite su despliegue en hardware de consumo. Está entrenado sobre el dataset propio `SamerAyyad/VLA_Samer_23.10.2026_400eps`, compuesto por 400 episodios de demostraciones teleoperadas, y se distribuye con licencia Apache 2.0.

Su relevancia radica en que ejemplifica el flujo actual de entrenamiento y publicación de políticas robóticas de código abierto con LeRobot: un pipeline reproducible que va del dataset a la política desplegable en robots tipo SO-100/SO-101, con inferencia directa mediante `lerobot-record`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT, paper arXiv:2304.13705) |
| Parámetros totales | 51.670.663 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, sin ventana de contexto textual) |
| Tipos de cuantización | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (típicamente ResNet preentrenado) con un transformer que procesa observaciones multimodales (imágenes de cámaras y estado de las articulaciones) y genera chunks de acciones de longitud fija. La predicción por chunks, junto con el mecanismo de temporal ensembling en inferencia, suaviza la trayectoria y mitiga el compounding error típico de las políticas paso a paso.

El entrenamiento se realizó con `lerobot-train` sobre el dataset `SamerAyyad/VLA_Samer_23.10.2026_400eps` (400 episodios de teleoperación). No se dispone de información sobre el número exacto de pasos de entrenamiento, la composición detallada del dataset, la resolución de las cámaras ni si se aplicaron técnicas adicionales de aumento de datos. El nombre del repositorio sugiere 500k pasos de entrenamiento, pero este dato no está confirmado en la model card.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (posiciones articulares) a partir de observaciones visuales y propioceptivas.
- Predicción por action chunks: emite bloques de acciones de horizonte corto, lo que mejora la suavidad y la robustez frente a perturbaciones.
- Ejecución en robots de bajo coste del ecosistema LeRobot, como SO-100/SO-101 en configuración follower.
- Integración nativa con el pipeline de LeRobot: entrenamiento (`lerobot-train`), evaluación e inferencia (`lerobot-record`).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades lingüísticas: es una política motora, no un modelo de lenguaje.
- Multilingüismo: no aplica.

## Casos de uso

- Manipulación de objetos con brazo robótico de sobremesa: la política se ejecuta en un SO-100 follower para tareas de pick-and-place aprendidas de las 400 demostraciones, aprovechando la predicción por chunks para trayectorias suaves.
- Investigación en aprendizaje por imitación: sirve como línea base reproducible para comparar variantes de ACT (horizonte de chunk, ensembling, arquitectura visual) sobre el mismo dataset.
- Prototipado rápido de tareas nuevas: al ser un modelo ligero (0,2 GB), se puede reentrenar con `lerobot-train` en una GPU de consumo para adaptarlo a una tarea concreta en horas.
- Evaluación automatizada de políticas: el flujo `lerobot-record` con prefijo `eval_` permite generar episodios de evaluación estandarizados y medir tasas de éxito.
- Educación y divulgación en robótica: el tamaño reducido y la licencia Apache 2.0 facilitan su uso en cursos y talleres sin restricciones de distribución.
- Despliegue en laboratorios con hardware limitado: la inferencia cabe en GPUs de gama media o incluso en CPU para pruebas de baja frecuencia, al no requerir modelos de lenguaje asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 51,7 M de parámetros, más el codificador visual y los buffers de imágenes; en la práctica, 2-4 GB de VRAM son suficientes para ejecutar el pipeline completo de LeRobot.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM para inferencia (GTX 1650, RTX 3050, RTX 4090); para reentrenamiento se recomienda RTX 3090/4090, A100 o H100.
- Cabe en GPU de consumo: sí, en prácticamente toda la gama RTX y en muchas GTX.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con backend PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles; dependen de la frecuencia de control del robot y del hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamerAyyad/VLA_Samer_23.10.2026_400eps_policy_ACT_500k | 51,7 M | ACT (imitación) | no aplica | Apache 2.0 | Hugging Face (lerobot) |
| Políticas ACT de referencia en LeRobot | no disponible | ACT (imitación) | no aplica | Apache 2.0 | Hugging Face (lerobot) |
| Diffusion Policy (LeRobot) | no disponible | Difusión (imitación) | no aplica | Apache 2.0 | Hugging Face (lerobot) |
| SmolVLA (Hugging Face) | no disponible en la información | VLA | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para una tarea y un robot concretos; su rendimiento fuera de la distribución del dataset de entrenamiento (nuevos objetos, iluminación o posiciones) no está garantizado.
- Sin datos de evaluación publicados: no hay tasas de éxito ni métricas de robustez en la model card, por lo que no se puede avalar su fiabilidad en producción.
- Riesgo de sobreajuste a las demostraciones: con 400 episodios, la diversidad puede ser limitada y el modelo puede fallar ante variaciones no vistas.
- Sin capacidades lingüísticas ni de razonamiento simbólico: no debe confundirse con un VLA de instrucciones en lenguaje natural.
- Sesgos: no documentados; en robótica, los sesgos se manifiestan como preferencias por posiciones, objetos o condiciones de iluminación presentes en los datos de teleoperación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Caveat de producción: requiere validación exhaustiva en el robot objetivo antes de cualquier despliegue real, incluyendo protocolos de parada segura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_23.10.2026_400eps_policy_ACT_500k
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_23.10.2026_400eps
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
