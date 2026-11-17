# Gyseop/omx_real2

## Resumen

`Gyseop/omx_real2` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el paper arXiv:2304.13705. El modelo lo ha subido el usuario Gyseop mediante la librería LeRobot de Hugging Face y está pensado para control de brazos robóticos a partir de demostraciones teleoperadas. En lugar de predecir una acción por paso, ACT predice fragmentos cortos de acciones (action chunks), lo que reduce el error de acumulación y suele elevar la tasa de éxito en tareas de manipulación.

El checkpoint contiene 51.668.614 parámetros en formato safetensors y ocupa aproximadamente 0,2 GB, lo que lo sitúa en la gama de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware de consumo. La arquitectura es un transformer con codificador visual y decodificador de acciones, condicionado por observaciones de cámara y estado del robot. Se entrenó sobre el dataset `Gyseop/record-real1`, también alojado en el Hub.

Su relevancia es doble: por un lado, demuestra el flujo completo de LeRobot para entrenar y desplegar políticas de imitación; por otro, al ser un modelo de nicho con cero descargas y cero likes en el momento de la consulta, conviene tratarlo como un experimento reproducible más que como un componente listo para producción. La licencia Apache 2.0 facilita su reutilización, pero la información pública sobre su entrenamiento y evaluación es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones oficiales para este checkpoint) |
| Idiomas soportados | no disponible (modelo de robótica, sin interfaz de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un mecanismo de chunking de acciones. El modelo recibe observaciones (típicamente imágenes de una o varias cámaras y el estado de las articulaciones) y emite una secuencia de acciones de longitud fija en lugar de un único paso. Esta predicción por bloques mitiga el problema de cambio de distribución en el aprendizaje por imitación y permite un control más suave. El paper original introduce además una técnica de temporal ensembling para promediar predicciones solapadas entre chunks consecutivos.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; en robótica por imitación estos mecanismos no son habituales. El dataset de entrenamiento declarado es `Gyseop/record-real1`, y la model card indica que el entrenamiento se realizó con `lerobot-train` sobre una política de tipo `act`. No se documentan innovaciones adicionales más allá de las propias del método ACT original.

## Capacidades

- Control robótico por imitación: genera comandos de acción para brazos manipuladores a partir de observaciones visuales y de estado.
- Predicción de action chunks: emite secuencias cortas de acciones, lo que reduce el jitter y mejora la estabilidad del movimiento.
- Condicionamiento multimodal: integra imágenes de cámara y estado de las articulaciones como entrada.
- Compatibilidad con LeRobot: entrenamiento, evaluación e inferencia mediante `lerobot-train` y `lerobot-record`.
- Integración con robots tipo SO-100/SO-101: la model card muestra ejemplos con `so100_follower`.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto ni capacidades multilingües; es una política motora, no un modelo de lenguaje.

## Casos de uso

- Manipulación de objetos con brazo SO-100: el modelo puede ejecutar tareas de pick-and-place entrenadas sobre el dataset `record-real1`, usando `lerobot-record` con `--policy.path` apuntando al checkpoint.
- Reproducción de experimentos de imitación: sirve como referencia para comparar el flujo de entrenamiento ACT de LeRobot frente a otras políticas (Diffusion Policy, VQ-BeT) sobre el mismo dataset.
- Prototipado rápido en laboratorio: con 51,7 M de parámetros y 0,2 GB de pesos, se puede desplegar en una estación de trabajo con GPU de consumo para pruebas de concepto.
- Evaluación de generalización visual: al condicionarse por cámara, permite estudiar cómo varía la tasa de éxito ante cambios de iluminación o posición de objetos.
- Base para fine-tuning: al estar en Apache 2.0 y en safetensors, puede reentrenarse con nuevos datasets de teleoperación para tareas específicas.
- Docencia y formación en robótica: ejemplo completo y ligero de pipeline entrenamiento-evaluación con LeRobot, útil en cursos de aprendizaje por imitación.
- Integración en bancos de pruebas de simulación a real: el checkpoint puede evaluarse primero en simuladores compatibles con LeRobot antes de transferirlo al robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros en fp32 ≈ 207 MB de pesos); en fp16 ≈ 103 MB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para el modelo; se recomienda NVIDIA RTX 3060 o superior para ejecutar junto con el pipeline de visión en tiempo real.
- Cabe en GPU de consumo: sí, en GTX 1650, RTX 3050, RTX 4060 y superiores; también puede ejecutarse en CPU para pruebas no críticas.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), integración con robots SO-100/SO-101; no se documenta soporte oficial para vLLM, llama.cpp, Ollama o TGI, que no están orientados a políticas robóticas.
- Latencia y throughput: no disponibles; dependen del robot, la frecuencia de control y el hardware de visión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gyseop/omx_real2 (ACT) | 51,7 M | no disponible | Imitación con action chunks | Apache 2.0 | Hugging Face (LeRobot) |
| Diffusion Policy | no disponible | no disponible | Imitación generativa por difusión | MIT (implementación de referencia) | Repositorios académicos y LeRobot |
| VQ-BeT | no disponible | no disponible | Imitación con tokenización de acciones | MIT (implementación de referencia) | Repositorios académicos y LeRobot |
| RT-2 / OpenVLA | miles de millones | no disponible | VLA basado en LLM | varía | Principalmente investigación |

No se dispone de datos de rendimiento comparativo para este checkpoint concreto; la comparación se limita a enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta: no hay evidencia pública de validación externa.
- Entrenado sobre un único dataset (`Gyseop/record-real1`); la generalización a otras tareas, objetos o entornos no está documentada.
- Riesgo de sobreajuste al entorno de captura (iluminación, fondo, posición de cámara) y de fallo ante cambios de distribución.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural ni razonamiento simbólico.
- No se documentan sesgos, pero al ser un modelo visual puede heredar sesgos del dataset de demostración (posiciones, objetos y entornos limitados).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere validación propia.
- No se especifican cuantizaciones oficiales ni requisitos de versión de LeRobot; conviene fijar la versión de la librería para reproducibilidad.
- La fecha de creación del repositorio (2026-11-17) es posterior a la fecha habitual de consulta; verificar la integridad del checkpoint antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Gyseop/omx_real2
- Dataset de entrenamiento: https://huggingface.co/datasets/Gyseop/record-real1
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
