# Jingkuan/BWM-Turbo

## Resumen

BWM-Turbo es un modelo de difusión para robótica (visión-lenguaje-acción, VLA) publicado por el usuario Jingkuan en Hugging Face bajo licencia Apache-2.0. El repositorio, de 12,9 GB, no contiene únicamente pesos: es un paquete de inferencia completo que incluye código de ejecución, scripts de conversión de datos, utilidades de normalización y los pesos del modelo principal (`bwm_turbo.safetensors`) junto con el VAE de Wan2.2 (`Wan2.2_VAE.pth`).

El modelo resuelve el problema de generar trayectorias de acción para robots bimanuales a partir de una imagen de primer fotograma y una instrucción en lenguaje natural. La entrada de estado es de 26 dimensiones (13 por brazo: 6 ángulos de articulación, pinza, posición xyz del efector final y ángulos de Euler XYZ), de las cuales la inferencia utiliza 14 (pose del efector final y pinza de ambos brazos). La salida se materializa como secuencias de acción en formato LeRobot (Parquet + JSONL), lo que lo integra directamente en flujos de trabajo de aprendizaje por imitación.

La relevancia del modelo radica en su enfoque práctico: empaqueta todo el pipeline (conversión HDF5→LeRobot, cálculo de estadísticas de normalización, inferencia por segmentos y exportación de vídeo) en un único repositorio reproducible, con dependencias fijadas (PyTorch 2.8.0, CUDA 12.8, Python 3.10). No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión (DiT + codificador de acciones + VAE Wan2.2), según la estructura de `diffsynth/models` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors y `.pth` sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible (las instrucciones de ejemplo están en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | `bwm_turbo.safetensors` (modelo principal y codificador de acciones), `Wan2.2_VAE.pth` (VAE), `stat.json` (estadísticas de normalización) |

## Arquitectura y entrenamiento

La documentación describe una arquitectura de difusión compuesta por un backbone DiT (Diffusion Transformer), un codificador de acciones y el VAE de Wan2.2 para codificación de imágenes y decodificación de vídeo. El pipeline (`diffsynth/pipelines`) combina modelo, condiciones de entrada y proceso de muestreo; el módulo `diffsynth/diffusion` gestiona los schedulers de muestreo y el parseo de parámetros. La inferencia opera por segmentos: `inference_engine.py` carga los datos, genera vídeo por tramos y exporta resultados, con gestión explícita de VRAM (`diffsynth/core/vram`) y soporte de checkpointing de gradientes.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO. Los scripts de conversión (`convert_worldarena_track1_test_to_lerobot.py`, `convert_robotwin_replay_train_to_lerobot.py`) sugieren entrenamiento o evaluación sobre los benchmarks WorldArena Track 1 y RoboTwin, pero no se detalla la composición. La normalización se realiza con estadísticas precalculadas (`stat.json`) que incluyen min, max, p01, p99, mean y std para cuatro grupos: `state_joint`, `action_joint`, `state_pose` y `action_pose`.

## Capacidades

- Generación de trayectorias de acción bimanual a partir de imagen de primer fotograma e instrucción en lenguaje natural.
- Control de robots de dos brazos con 14 dimensiones de acción (pose del efector final y pinza por brazo).
- Generación de vídeo de la ejecución predicha mediante el VAE de Wan2.2.
- Procesamiento de datos en formato LeRobot (Parquet para estados/acciones, JSONL para metadatos de episodios).
- Conversión de datos desde HDF5 crudo (articulaciones, poses, pinzas) a LeRobot con transformación de cuaterniones a ángulos de Euler XYZ.
- Cálculo de estadísticas de normalización sobre datasets completos.
- Inferencia por segmentos con gestión de memoria GPU.
- Soporte de semilla configurable (`INFER_SEED`) y número de pasos de muestreo (`INFER_NUM_INFERENCE_STEPS`).
- No se documenta soporte de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Manipulación robótica bimanual en entornos de laboratorio: el modelo genera acciones coordinadas de ambos brazos a partir de una instrucción como "Move the object to the target position", adecuado para tareas de pick-and-place con dos efectores.
- Evaluación en benchmarks de robótica: los scripts de conversión para WorldArena Track 1 y RoboTwin permiten preparar datasets de evaluación y ejecutar inferencia sobre ellos de forma estandarizada.
- Investigación en aprendizaje por imitación: la conversión HDF5→LeRobot facilita reutilizar datasets propios en el pipeline de inferencia sin reescribir el código de carga.
- Prototipado de políticas VLA: el paquete incluye pesos, configuración y estadísticas listos para ejecutar, lo que reduce el tiempo de puesta en marcha de experimentos.
- Generación de vídeo sintético de ejecuciones: el VAE decodifica las predicciones en vídeo, útil para inspección visual cualitativa de las trayectorias antes de desplegarlas en hardware.
- Integración en pipelines de datos robóticos: los scripts `tools/` y el formato Parquet/JSONL permiten encadenar la inferencia con herramientas de análisis y visualización existentes en el ecosistema LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 12,9 GB (pesos safetensors + VAE), por lo que se requiere al menos esa cantidad en memoria o descarga a disco con carga por segmentos.
- El código incluye gestión de VRAM (`diffsynth/core/vram`) y checkpointing de gradientes, lo que sugiere soporte para GPUs con memoria limitada mediante migración de parámetros.
- GPU recomendadas: no disponible. El entorno fijado usa CUDA 12.8, compatible con arquitecturas Ampere, Ada y Hopper (A100, RTX 4090, H100).
- Cabe en GPU de consumo: no confirmado; el tamaño de 12,9 GB sugiere que una RTX 4090 (24 GB) podría albergarlo, pero no se documenta.
- Opciones de despliegue: el paquete proporciona su propio runner (`bash/infer.sh` → `inference_runner.py`) con PyTorch 2.8.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con otras políticas VLA o modelos de difusión para robótica.

## Limitaciones y advertencias

- No se documentan sesgos conocidos; al ser un modelo de robótica entrenado presumiblemente con datos de laboratorio, su generalización a entornos reales diversos es incierta.
- Riesgo de alucinación de trayectorias: como modelo generativo de acciones, puede producir secuencias no físicamente válidas; no se reportan métricas de éxito.
- La entrada de estado debe respetar el formato exacto de 26 dimensiones descrito; desviaciones en el orden o las unidades (metros, radianes) romperán la inferencia.
- Las estadísticas de normalización (`stat.json`) deben coincidir con los pesos; sustituirlas por estadísticas de datos nuevos invalida las predicciones, según advierte el propio autor.
- El directorio de salida debe ser distinto del directorio de pesos principales.
- No se especifican idiomas soportados para las instrucciones; los ejemplos están en inglés y no hay evidencia de multilingüismo.
- Licencia Apache-2.0 permite uso comercial, pero no se aportan garantías ni evaluación de seguridad para despliegue en robots reales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni resultados de benchmarks publicados.

## Enlaces

- Hugging Face: https://huggingface.co/Jingkuan/BWM-Turbo
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
