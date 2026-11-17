# Dongkkka/Task000905-RightHand-ViTacFormer-B512-20261117

## Resumen

ViTacFormer Task000905 es una política robótica multimodal desarrollada por el usuario Dongkkka que combina visión (RGB) y tacto para el control de un brazo robótico de mano derecha. El modelo resuelve una tarea concreta y acotada: recoger una compresa sanitaria blanca con la mano derecha (Task000905) en un entorno de laboratorio con una única mesa de trabajo. Se entrena desde cero como política ViTacFormer, con backbone ResNet18 inicializado con pesos de ImageNet y el resto de parámetros con inicialización aleatoria, sobre 78 episodios de demostración (29.110 fotogramas) y 9 episodios de validación reservados (3.082 fotogramas).

La relevancia del modelo es fundamentalmente metodológica: documenta de forma exhaustiva el contrato de inferencia (dimensiones, orden de articulaciones, offsets temporales, normalización de cada modalidad), el pipeline de entrenamiento (AdamW, BF16, LR 4e-5, cosine wall-clock, checkpoints cada 2000 pasos o 20 minutos) y los mecanismos de publicación y validación (SHA256/LFS, ablaciones de historia y predicción futura). Es un artefacto de investigación reproducible, no un modelo de propósito general.

El repositorio pesa 3,4 GB y contiene pesos en formato PyTorch (`model.pt`), estados de optimizador para reanudar entrenamiento, estadísticas de normalización y configuración de inferencia. La licencia es Apache 2.0. El modelo solo soporta `task_id=0` y no autoriza ejecución en robot real con alimentación; se presenta explícitamente como candidato offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViTacFormer (política viso-táctil; backbone ResNet18 para visión) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como contexto de texto; ventana temporal de observación: estado 6x54 en offsets [-15,-12,-9,-6,-3,0] y tacto 18x90 en offsets [-17..0] |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | en, ko (etiquetas de la model card; no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`), más `training_state.pt`, `normalization_stats.pt`, `SHA256SUMS.json` |

## Arquitectura y entrenamiento

La política es un ViTacFormer: un transformer que fusiona observaciones visuales y táctiles con el estado propioceptivo del robot para predecir acciones. La entrada visual es `observation.images.rgb.cam_left_head` en uint8 RGB 720x1280, redimensionada con OpenCV INTER_LINEAR a 188x336 y normalizada con estadísticas de ImageNet. El estado se representa como 6x54 (seis pasos temporales de 54 articulaciones) y el tacto como 18x90 (tacto crudo izquierdo 45 + derecho 45), transformado a 180 canales crudos más delta intra-ventana. La salida son 100x54 objetivos absolutos de articulación en radianes y 18x180 valores táctiles predichos.

El entrenamiento se hizo desde cero con AdamW, sin reutilizar pesos de políticas previas ni estado de optimizador o RNG. Solo el backbone ResNet18 parte de pesos de ImageNet. Configuración: batch 512, acumulación 1, forward en BF16 y pérdida en FP32, LR 4e-5 con backbone a 4e-6, warmup de 1000 pasos, cosine wall-clock hasta el 10 %, weight decay 1e-4, gradient clip 1 y dos workers. No hay early stopping por meseta de validación; prevalece una fecha límite absoluta sobre el techo de seguridad de un millón de pasos. Los checkpoints se guardan cada 2000 pasos o 20 minutos (el primero en el paso 100) con validación completa, y `best.json` se selecciona por el compuesto de validación de mano derecha, no por pérdida de entrenamiento.

Como innovaciones destacables, el autor incorpora ablaciones explícitas: comparación de la predicción táctil contra persistencia, y ablaciones de barajado de historia y de futuro predicho para verificar si las acciones usan realmente información táctil. La publicación es asíncrona y verifica tamaño y SHA256/LFS de cada fichero en un commit público fijado antes de borrar el checkpoint local; un fallo de subida conserva el checkpoint local y un fallo de proceso permite hasta tres reinicios automáticos restaurando optimizador, modelo y RNG.

## Capacidades

- Predicción de trayectorias de articulación: genera 100x54 objetivos absolutos en radianes para el brazo derecho.
- Predicción táctil: estima 18x180 valores táctiles futuros a partir de la historia de sensores.
- Fusión multimodal visión-tacto-estado: integra cámara RGB, estado propioceptivo de 54 articulaciones y tacto crudo de 45+45 canales.
- Control de una única tarea: solo soporta `task_id=0` (recoger una compresa sanitaria blanca con la mano derecha).
- Historial temporal: usa ventanas de estado (6 pasos) y tacto (18 pasos) con offsets definidos, lo que permite reaccionar a la dinámica reciente.
- Reproducibilidad: incluye configuración de inferencia, estadísticas de normalización, hashes de procedencia y estado de entrenamiento para reanudar.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto; no es un modelo de lenguaje.

## Casos de uso

- Investigación en manipulación viso-táctil: sirve como política de referencia para estudiar cómo se combinan visión y tacto en tareas de agarre; el contrato de inferencia y las ablaciones documentadas permiten reproducir experimentos y comparar variantes.
- Recolección de objetos blandos o deformables: la tarea de recoger una compresa sanitaria blanca es representativa de objetos poco rígidos; el modelo usa tacto para ajustar el agarre y la predicción táctil futura para anticipar el contacto.
- Evaluación de contratos de inferencia en robótica: el paquete documenta offsets, orden de articulaciones, normalización por modalidad y decodificación, lo que lo convierte en un caso de estudio para validar pipelines de despliegue antes de pasar a hardware real.
- Benchmark de ablaciones táctiles: los scripts de comparación contra persistencia y las ablaciones de historia/futuro permiten medir si una política realmente explota el tacto, útil para metodología de evaluación.
- Formación y docencia: el repositorio incluye `source/`, `env.sh`, `inference_config.json` y `normalization_stats.pt`, lo que facilita montar un ejercicio práctico de inferencia offline con `runtime.predict(...)` en una GPU.
- Reanudación de entrenamiento: al conservar `training_state.pt` con optimizador y RNG, se puede retomar el entrenamiento desde un checkpoint verificado, útil para experimentos de ajuste fino o de curriculum sobre la misma tarea.
- Prototipado de políticas de mano derecha con lado izquierdo estacionario: el orden de 54 articulaciones mantiene la compatibilidad con el montaje demostrado, lo que permite reutilizar el modelo en configuraciones con la mano izquierda fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la pérdida de entrenamiento no es una medida de éxito de la tarea y que la predicción táctil se compara con persistencia, pero no se proporcionan cifras numéricas de éxito, MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 3,4 GB e incluye pesos, estado de optimizador y estadísticas; el checkpoint de inferencia (`model.pt`) es un subconjunto, pero no se documenta su tamaño exacto ni el pico de VRAM.
- GPU recomendadas: no disponible. El ejemplo de la model card usa `device='cuda'` sin especificar modelo de GPU.
- ¿Cabe en GPU de consumo? No disponible; no se indica.
- Opciones de despliegue: runtime propio del paquete (`from runtime import Runtime`, `runtime.predict(...)`), con checkpoint `checkpoints/step_XXXXXXXX/model.pt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponible. La model card advierte que la edad del tacto de origen puede llegar a unos 346 ms y que los tiempos del robot y la latencia del Jetson requieren validación separada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos ViTacFormer ni políticas viso-táctiles comparables con parámetros, contexto, rendimiento o licencia documentados.

## Limitaciones y advertencias

- Una sola tarea: solo soporta `task_id=0`; Task000943 está excluida del entrenamiento y no debe usarse.
- Sin autorización para robot real: el paquete es un candidato offline y no autoriza ejecución en robot con alimentación; la ejecución en hardware requiere validación independiente de tiempos y latencia.
- Dependencia del montaje: el orden de 54 articulaciones conserva el lado izquierdo estacionario demostrado; la ejecución en robot debe mantener la mano izquierda como se solicita.
- Edad del tacto: la fuente táctil puede tener hasta ~346 ms de antigüedad, lo que limita la reactividad en contactos rápidos.
- Frecuencia y frames repetidos: la cámara original es de ~15 Hz con frames repetidos sobre una rejilla de datos de 30 Hz, lo que introduce información redundante.
- Sin datos de sesgo ni alucinación en el sentido de modelos de lenguaje: al ser una política robótica, el riesgo principal es fallo de agarre o trayectoria, no alucinación textual; no se documentan sesgos demográficos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y el modelo no está validado para producción.
- Datos no incluidos: las demostraciones crudas y los vídeos no están en el repositorio, lo que dificulta la auditoría independiente del dataset.
- Métricas incompletas: no hay cifras de éxito de tarea publicadas; la pérdida de entrenamiento no debe interpretarse como rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Dongkkka/Task000905-RightHand-ViTacFormer-B512-20261117
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.
