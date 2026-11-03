# KyraLeeChunWei/Paracetamol_e150_20K_ACT

## Resumen

Paracetamol_e150_20K_ACT es una política de imitación para robótica entrenada con ACT (Action Chunking with Transformers), el método presentado en el paper arXiv:2304.13705. Lo publica el usuario KyraLeeChunWei en HuggingFace mediante la librería LeRobot de HuggingFace, y está asociado al dataset de demostraciones teleoperadas KyraLeeChunWei/Paracetamol_e150. No es un modelo de lenguaje: es un controlador visuomotor que mapea observaciones (imágenes de cámara y estado de las articulaciones) a secuencias cortas de acciones para un brazo robótico.

El modelo resuelve el problema del control fino en tareas de manipulación aprendidas por imitación. En lugar de predecir una acción por paso, ACT predice un "chunk" de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad del bucle de control. Con 51.678.855 parámetros y un repositorio de 0,2 GB, es un modelo compacto que puede ejecutarse en hardware modesto.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento, la evaluación y el despliegue de políticas robóticas open source. El nombre sugiere un entrenamiento de 20.000 pasos sobre el dataset Paracetamol_e150, aunque la model card no documenta hiperparámetros ni resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.678.855 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo visuomotor, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación en robótica. Combina un codificador visual (típicamente ResNet preentrenado) que procesa las imágenes de las cámaras con un codificador de estado que integra las lecturas de las articulaciones, y un decodificador transformer que genera un chunk de acciones de longitud fija. La predicción por chunks mitiga el problema de la varianza en el bucle de control y permite movimientos más suaves y coherentes que los métodos paso a paso.

El entrenamiento es de tipo behavioral cloning sobre el dataset KyraLeeChunWei/Paracetamol_e150, compuesto por episodios teleoperados. El sufijo "20K" del nombre sugiere 20.000 pasos de entrenamiento, y "e150" podría referirse a 150 episodios, aunque ninguno de estos datos está confirmado en la model card. No se documentan número de tokens, composición del dataset, ni uso de RLHF o DPO, que no aplican a este tipo de modelo. Una innovación clave de ACT es la agregación de acciones temporales (temporal ensembling) durante la inferencia, que suaviza las transiciones entre chunks.

## Capacidades

- Control visuomotor de un brazo robótico a partir de imágenes de cámara y estado de articulaciones.
- Predicción de chunks de acciones, lo que produce trayectorias más estables que la predicción paso a paso.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Compatible con el pipeline de LeRobot: entrenamiento con `lerobot-train`, evaluación y grabación con `lerobot-record`.
- Integración con robots tipo SO-100/SO-101 follower en los ejemplos de la model card.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Manipulación de objetos pequeños en laboratorio: el modelo aprende a coger y colocar piezas a partir de demostraciones teleoperadas, adecuado por su tamaño compacto y su entrenamiento específico sobre el dataset Paracetamol_e150.
- Automatización de tareas repetitivas de pick-and-place: con chunks de acciones, el brazo ejecuta secuencias estables sin correcciones paso a paso, reduciendo el jitter en el efector final.
- Prototipado rápido en robótica de bajo coste: al ser un modelo de 51,7 M de parámetros, puede desplegarse en una GPU de consumo o incluso en CPU para pruebas iniciales.
- Investigación en imitación: sirve como línea base reproducible para comparar variantes de ACT, datasets o hiperparámetros dentro del ecosistema LeRobot.
- Evaluación de datasets de teleoperación: permite validar la calidad de un dataset comprobando si la política entrenada converge en el robot real.
- Formación y docencia: su licencia Apache 2.0 y su integración con LeRobot lo hacen útil para enseñar behavioral cloning en cursos de robótica.
- Despliegue en entornos controlados de laboratorio donde el robot opera sobre un banco de trabajo fijo con iluminación estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, curvas de entrenamiento ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,7 M de parámetros; en la práctica, el consumo lo domina el codificador visual y los buffers de imágenes.
- GPU recomendadas: cualquier GPU con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo no requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch y safetensors; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen de la frecuencia de control del robot, del número de cámaras y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Paracetamol_e150_20K_ACT | 51,7 M | ACT (imitación) | no disponible | Apache 2.0 | HuggingFace |
| Diffusion Policy | no disponible | Política por difusión | no disponible | MIT (implementación de referencia) | Repositorio público |
| VQ-BeT | no disponible | Transformer con cuantización vectorial | no disponible | MIT (implementación de referencia) | Repositorio público |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está entrenado sobre un dataset concreto (Paracetamol_e150) y un robot concreto; su generalización a otras tareas, objetos o morfologías no está documentada.
- Riesgo de sobreajuste a las condiciones de iluminación, posiciones de cámara y fondo del dataset de entrenamiento.
- No hay evaluación publicada: se desconoce la tasa de éxito real en el robot.
- La model card no documenta hiperparámetros, número de episodios ni configuración de entrenamiento; el sufijo "20K" y "e150" son inferencias no confirmadas.
- No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- En despliegues reales es necesario un bucle de seguridad a nivel de controlador (límites de par, parada de emergencia) independiente del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KyraLeeChunWei/Paracetamol_e150_20K_ACT
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset asociado: https://huggingface.co/datasets/KyraLeeChunWei/Paracetamol_e150
