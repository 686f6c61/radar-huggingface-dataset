# Samisaliveagain/smolvla-agilex-piper-hex-bolt-insertion-batch64-step20000

## Resumen

SmolVLA es una política robótica de tipo vision-language-action (VLA) entrenada mediante aprendizaje por imitación. Este checkpoint concreto, publicado por el usuario Samisaliveagain, está especializado en una única tarea de manipulación: recoger un tornillo hexagonal y colocarlo en la abertura correspondiente. El modelo se ha entrenado sobre un dataset propio de 100 demostraciones teleoperadas con un brazo robótico AgileX Piper y se distribuye en formato LeRobot, la librería de referencia para políticas robóticas de Hugging Face.

El modelo parte de la arquitectura SmolVLA, un transformer compacto que combina un codificador visual con un decodificador de acciones condicionado por el estado del robot. Con 450 millones de parámetros, está diseñado para ejecutarse en hardware modesto y para ser ajustado con pocos datos, lo que lo hace accesible para laboratorios con recursos limitados. La entrada consiste en siete valores de articulaciones y pinza más dos cámaras RGB (cenital y angulada); la salida son siete objetivos absolutos de las articulaciones, con chunks de 50 acciones.

La relevancia de este checkpoint es acotada pero clara: es un ejemplo reproducible de ajuste fino de SmolVLA para una tarea de inserción de precisión, con procedencia de entrenamiento verificada (paso 20.000, batch 64, hashes SHA-256 de los pesos). No obstante, se trata de un artefacto de investigación con 15 descargas, sin licencia declarada y sin evaluación física de éxito publicada, por lo que no debe confundirse con un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin interfaz lingüística) |
| Licencia | no disponible (el autor indica que esta subida no asigna licencia nueva) |
| Formato de pesos | safetensors (model.safetensors) + configuraciones JSON de LeRobot |

## Arquitectura y entrenamiento

SmolVLA es una política VLA que procesa observaciones multimodales (imágenes de dos cámaras RGB más el estado propioceptivo del robot) y genera secuencias de acciones motoras. En este checkpoint, la entrada son siete valores de articulación/pinza más las imágenes de las cámaras cenital y angulada, y la salida son siete objetivos absolutos del seguidor AgileX Piper: articulaciones en grados y pinza en milímetros. El modelo emite chunks de 50 acciones, lo que reduce la frecuencia de inferencia necesaria durante la ejecución.

El entrenamiento se realizó por imitación sobre el dataset `Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1` (revisión `1ec623d82a1f70c70f1d769c38334799d122db77`), con 100 demostraciones teleoperadas, batch size 64, un único proceso y un objetivo de 20.000 actualizaciones del optimizador. El checkpoint exportado corresponde al paso 20.000, verificado mediante `training_state/training_step.json` y hashes SHA-256 de los siete archivos de política y procesadores. El `pretrained_path` de la configuración apunta a `000050/pretrained_model`, que refleja el origen de inicialización/reanudación y no el paso guardado. No se documenta el uso de RLHF, DPO ni datos adicionales; el dataset de 80 demostraciones sin posición inicial (zero-home) no se utilizó en este entrenamiento.

## Capacidades

- Generación de acciones robóticas de manipulación: inserción de un tornillo hexagonal en su abertura correspondiente.
- Procesamiento multimodal: dos cámaras RGB (cenital y angulada) más estado propioceptivo de siete dimensiones.
- Salida de chunks de 50 acciones con objetivos absolutos de articulación (grados) y pinza (milímetros).
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Ejecución sobre el brazo AgileX Piper con bloqueo de la articulación 4 y límites de robot documentados.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades lingüísticas o de agente.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera del pipeline robótico.

## Casos de uso

- Automatización de inserción de precisión en líneas de montaje: el modelo ejecuta la política de recogida y colocación de tornillos hexagonales sobre el Piper, adecuado para tareas repetitivas donde se dispone de demostraciones teleoperadas y un entorno controlado.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de ajuste fino de SmolVLA con 100 demostraciones y 20.000 pasos, útil para comparar hiperparámetros (batch 64 frente a otras configuraciones) en experimentos académicos.
- Prototipado de pipelines LeRobot: al cargarse con `SmolVLAPolicy.from_pretrained`, permite validar integraciones de pre/postprocesadores y normalización de tensores antes de desplegar en un robot real.
- Benchmarking de políticas VLA compactas: con 450 millones de parámetros, es un punto de comparación para medir coste de inferencia y calidad de imitación frente a políticas más grandes en tareas de ensamblaje.
- Formación y docencia en robótica: el checkpoint y su dataset asociado permiten ilustrar el flujo completo de teleoperación, entrenamiento y despliegue en un brazo de bajo coste.
- Base para ajuste fino en tareas de inserción similares: al conservar configuración y pesos originales, puede reentrenarse con nuevos datasets de tornillos o aberturas distintas partiendo de este paso 20.000.
- Validación de procedencia y auditoría de modelos: los hashes SHA-256 y los manifiestos (`model_identity.json`, `publication_manifest.json`) permiten verificar la integridad de los pesos en flujos de investigación reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la publicación no establece éxito físico de inserción ni robustez, por lo que no existen métricas de tasa de éxito, latencia o precisión que puedan citarse.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 450 millones de parámetros en safetensors (1,2 GB de repositorio), la huella en FP32 ronda los 1,8 GB y en FP16 los 0,9 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs consumer con al menos 4-8 GB de VRAM, pero el autor no especifica modelos concretos.
- ¿Cabe en GPU consumer? Por número de parámetros, sí es plausible en tarjetas como RTX 3060/4060 o superiores, pero no hay confirmación oficial ni requisitos publicados.
- Opciones de despliegue: LeRobot (`lerobot.policies.smolvla.modeling_smolvla.SmolVLAPolicy`), que es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA AgileX Piper hex-bolt (este checkpoint) | 450 M | no disponible | Inserción de tornillo hexagonal | no disponible | Hugging Face, 15 descargas |
| SmolVLA base | no disponible en la información | no disponible | Política VLA generalista | no disponible | Hugging Face (referencia de inicialización) |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulación por imitación | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse con 100 demostraciones de un único operador y entorno, la política puede sobreajustarse a esa configuración de cámaras, iluminación y posiciones iniciales.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erráticas fuera de la distribución de entrenamiento, sin métricas de robustez publicadas.
- Limitaciones de contexto e idioma: el modelo no procesa lenguaje; no hay información sobre ventana de contexto visual o temporal más allá del chunk de 50 acciones.
- Restricciones de licencia: no se asigna licencia nueva en esta subida; el uso comercial queda sin autorización explícita y requiere consultar al autor y a la licencia del SmolVLA original.
- Caveat de producción: el autor advierte que la verificación cubre el paso de entrenamiento y la integridad de archivos, no el éxito físico de la inserción; debe usarse con la configuración de cámaras, unidades, bloqueo de articulación 4 y límites de robot registrados.
- El dataset de 80 demostraciones zero-home no se utilizó, por lo que el modelo no está validado para posiciones iniciales arbitrarias.
- Repositorio con 15 descargas y 0 likes: sin validación comunitaria ni reportes independientes de funcionamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Samisaliveagain/smolvla-agilex-piper-hex-bolt-insertion-batch64-step20000
- Dataset: https://huggingface.co/datasets/Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1
- LeRobot (librería): https://github.com/huggingface/lerobot
- SmolVLA (modelo base, referencia): https://huggingface.co/lerobot/smolvla_base
- Archivos de procedencia en el repo: `model_identity.json`, `training_step.json`, `checkpoint_info.json`, `publication_manifest.json`, `train_config.json`
