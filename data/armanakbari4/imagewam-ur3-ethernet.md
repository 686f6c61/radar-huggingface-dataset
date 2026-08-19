# armanakbari4/imagewam-ur3-ethernet

## Resumen

ImageWAM-FLUX.2-4B es un ajuste fino (fine-tune) sobre el modelo base ImageWAM, desarrollado por Arman Akbari (usuario `armanakbari4`), orientado a una tarea robótica concreta: la inserción de un cable ethernet en una ranura mediante un robot bimanual UR3. El modelo se basa en la arquitectura ImageWAM, que combina un DiT de edición de imágenes (FLUX.2 klein, 4B parámetros) con un experto de acción (ActionDiT) para generar acciones de control a partir de observaciones visuales, en lugar de recurrir a generación de video completa. Este enfoque reduce coste computacional y mejora la eficiencia en tareas de manipulación.

El ajuste fino se realizó sobre el dataset EmbodyX/UR3 (subconjunto `ethernet_2.0_lerobot`), con 103 episodios y casi 60 000 frames, utilizando una receta de entrenamiento estándar de ImageWAM (lr 2.5e-5, batch 192, 7000 pasos, ~14 h en 2×H100). El checkpoint final (paso 7000) alcanza un error de acción `action_l1` de 0.0106 en el conjunto de validación, mejorando progresivamente durante todo el entrenamiento. El modelo está publicado bajo licencia MIT y los pesos se distribuyen en formato PyTorch (`.pt`), con un tamaño de repositorio de 27.1 GB.

La relevancia de este modelo radica en su demostración práctica de que un world model basado en edición de imágenes puede transferirse a un escenario real de robótica, con un pipeline de inferencia bien definido y métricas de validación cuantitativas. Es un ejemplo de aplicación de modelos de acción-mundo (world action models) a tareas de manipulación bimanual con control de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de edición de imágenes (FLUX.2 klein, 4B) + ActionDiT (experto de acción) + codificador propioceptivo |
| Parametros totales | No disponible (el checkpoint contiene ~8.2B del módulo de acción + encoder propio; el base FLUX.2 klein tiene 4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 17 frames (contexto visual, `num_frames=17`) |
| Tipos de cuantizacion | No disponible (entrenado en bf16; no se especifican cuantizaciones publicadas) |
| Idiomas soportados | No disponible (modelo robótico, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`), con pesos base de FLUX.2 klein y autoencoder preparados por separado |

## Arquitectura y entrenamiento

ImageWAM se basa en la idea de que los world action models pueden prescindir de la generación de video completa y en su lugar emplear edición de imágenes sobre una observación compacta. La arquitectura combina un DiT de edición (FLUX.2 klein, 4B parámetros) con un experto de acción (ActionDiT) que predice acciones de control a partir de las representaciones latentes. En este ajuste fino, se añade un codificador propioceptivo que procesa el estado del robot (posición de articulaciones y estado de las pinzas) y se integra con el flujo visual. El modelo opera sobre un mosaico de 288×256 píxeles que combina tres cámaras (superior, muñeca izquierda y muñeca derecha) en un orden fijo `[top, left, right]`, con normalización de píxeles en el rango (−1, 1).

El entrenamiento se realizó sobre el dataset EmbodyX/UR3 (subconjunto `ethernet_2.0_lerobot`), que contiene 103 episodios y 59 796 frames a 15 fps, con acciones de 14 dimensiones (6 articulaciones + pinza para cada brazo). La receta de ajuste fino sigue el protocolo de ImageWAM: tasa de aprendizaje 2.5e-5 con coseno y 5% de warmup, optimizador AdamW (β=0.9, 0.95), weight decay 1e-2, grad-clip 1.0, precisión bf16 y DeepSpeed ZeRO-1. Se usó un batch global de 192 (12 por GPU × 2 GPUs × 8 acumulación de gradientes) durante 7000 pasos (~22 épocas), completado en ~14 horas en 2×H100. El horizonte de acción es de 16 pasos (`action_video_freq_ratio=1`, `endpoint_frames_only=true`). Se guardaron checkpoints en los pasos 4000, 5000 y 7000, siendo este último el que presenta mejor error de acción en validación.

## Capacidades

- Generación de acciones de control para robots manipuladores bimanuales a partir de observaciones visuales y propioceptivas.
- Ejecución de la tarea específica "insertar el cable ethernet en la ranura" con un robot UR3 de doble brazo.
- Aprendizaje por imitación a partir de demostraciones humanas (LeRobot v2.1).
- Manejo de contexto visual multi-cámara mediante un mosaico compacto de 288×256.
- Predicción de acciones con horizonte de 16 pasos, permitiendo planificación a corto plazo.
- Soporte de normalización/desnormalización de acciones mediante estadísticas del dataset específico (`ur3_ethernet_ee16_dataset_stats.json`).
- No incluye capacidades de lenguaje natural, tool calling ni razonamiento simbólico; está especializado en control motor.

## Casos de uso

- Automatización de ensamblaje de conectores: el modelo puede integrarse en una celda robótica para insertar cables ethernet en dispositivos electrónicos, reduciendo la intervención humana en líneas de producción. Su precisión en `action_l1` (0.0106) sugiere un control fino adecuado para tareas de inserción.
- Control de robots bimanuales en entornos de investigación: laboratorios de robótica pueden utilizar este checkpoint como base para transferir el aprendizaje a otras tareas de manipulación, gracias a su arquitectura modular (DiT de edición + ActionDiT) y su licencia MIT.
- Validación de world models en escenarios reales: sirve como caso de estudio para comparar el enfoque de edición de imágenes frente a generación de video en tareas de control, con métricas objetivas de error de acción.
- Desarrollo de sistemas de aprendizaje por imitación de bajo coste: al estar entrenado sobre un dataset público (EmbodyX/UR3), puede reproducirse o adaptarse con recursos moderados (2×H100 para entrenamiento, menos para inferencia).
- Integración en pipelines de control en tiempo real: con un horizonte de 16 pasos y una entrada compacta de 288×256, el modelo puede ejecutarse a frecuencias adecuadas para control de robots, aunque no se especifica la latencia exacta.
- Benchmarking de modelos de acción-mundo: investigadores pueden evaluar la escalabilidad y robustez de ImageWAM frente a alternativas basadas en video, utilizando los checkpoints y la configuración de entrenamiento publicados como referencia reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un modelo robótico especializado. El autor proporciona métricas de error de acción (`action_l1`) sobre un conjunto de validación retenido, con evaluaciones a lo largo del entrenamiento:

| Checkpoint | action_l1 (validación) |
|---|---|
| Paso 4000 | No reportado (solo se indica la tendencia por tercios: 0.0303 en el primer tercio) |
| Paso 5000 | 0.0122 |
| Paso 5500 | 0.0132 |
| Paso 7000 (final) | 0.0106 |

La evolución por tercios de entrenamiento fue 0.0303 → 0.0209 → 0.0169, con una pendiente de regresión de −0.0027 por 1000 pasos (t = −4.26), indicando una mejora estadísticamente significativa. El ruido por evaluación (sd ≈ 0.0071 sobre 32 clips) es mayor que las diferencias entre checkpoints adyacentes, por lo que la selección se basa en tendencias y no en comparaciones puntuales. No se ha validado el error offline contra la tasa de éxito en el robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada por el autor. Considerando que el checkpoint contiene ~8.2B parámetros del módulo de acción más el codificador propioceptivo, y que el base FLUX.2 klein (4B) y el autoencoder deben cargarse por separado, se estima un uso de memoria superior a 20 GB en bf16. Se recomienda al menos una GPU con 24 GB de VRAM (p. ej., RTX 3090/4090, A10G) para inferencia básica.
- GPU recomendadas: el entrenamiento se realizó en 2×H100 (80 GB cada una). Para inferencia, una sola GPU de gama alta (A100 40/80 GB, H100, RTX 4090) es suficiente, aunque no se han publicado mediciones de latencia.
- ¿Cabe en GPU de consumo? Es probable que sí en una RTX 4090 (24 GB) si se usan cuantizaciones de 8 bits o 4 bits, pero no se proporcionan versiones cuantizadas. En bf16, podría superar los 24 GB al incluir los pesos base y el autoencoder.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp u Ollama. Al ser un modelo PyTorch, se puede servir mediante frameworks de inferencia personalizados o con el propio código de ImageWAM. El autor no indica soporte para TGI u otros servidores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (world action models para robótica con edición de imágenes). El modelo base ImageWAM es relativamente reciente (arXiv 2606.19531) y este checkpoint es un ajuste fino específico, por lo que no hay alternativas públicas equivalentes con las que comparar directamente.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (inserción de cable ethernet) y no generaliza a otras manipulaciones sin un nuevo ajuste fino.
- La métrica de validación (`action_l1`) es offline y no se ha correlacionado con la tasa de éxito en el robot real; puede haber una brecha entre el error numérico y el rendimiento físico.
- El entrenamiento no se había estabilizado en el paso 7000 (la curva seguía mejorando), por lo que un entrenamiento más largo podría producir mejores resultados.
- La inferencia requiere seguir estrictamente el formato de mosaico (288×256, orden de cámaras fijo) y el layout de acciones `ee16` (zero-padding en dimensiones 7 y 15). Errores en estos pasos invalidan las predicciones.
- Las estadísticas de normalización (`ur3_ethernet_ee16_dataset_stats.json`) son obligatorias para la desnormalización; usar las del pretrain daría resultados incorrectos.
- El checkpoint no incluye los pesos base de FLUX.2 klein ni el autoencoder; deben obtenerse por separado, lo que añade complejidad al despliegue.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un entorno controlado, puede fallar ante variaciones de iluminación, fondo o configuración del robot.
- Licencia MIT permite uso comercial, pero el usuario debe verificar que los pesos base de FLUX.2 klein también cumplan con sus propias licencias (no se especifica aquí).

## Enlaces

- Repositorio del modelo: https://huggingface.co/armanakbari4/imagewam-ur3-ethernet
- Proyecto ImageWAM (GitHub): https://github.com/yuyangalin/ImageWAM
- Paper ImageWAM (arXiv): https://arxiv.org/abs/2606.19531
- Dataset EmbodyX/UR3: https://huggingface.co/datasets/EmbodyX/UR3
- Checkpoint base (pretrain): https://huggingface.co/yuyangalin/ImageWAM-FLUX.2-4B-InternData-A1-EE
