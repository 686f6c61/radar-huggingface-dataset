# JackLiu0406/meta-SFT-checkpoints

## Resumen

Este repositorio contiene los checkpoints de meta-entrenamiento del modelo PiBehavior (variante de pi0.5) sobre las 100 actividades del conjunto BEHAVIOR-1K 2026. Es un modelo de visión-lenguaje-acción (VLA) desarrollado por Jack Liu, que continúa el entrenamiento del checkpoint `IliaLarchenko/behavior_50t_checkpoint` (50 tareas) para ampliarlo a las 100 tareas completas del desafío. El modelo combina un VLM basado en Gemma 2B con un experto de acción de 300M de parámetros, totalizando aproximadamente 3.83 mil millones de parámetros. Su relevancia radica en ser uno de los primeros intentos de meta-entrenamiento a gran escala en robótica de manipulación, demostrando que una política única puede aprender múltiples tareas con una sola tabla de condicionamiento. El checkpoint final (paso 70,000) está disponible en la carpeta `meta100-1epoch/step69999`, aunque el repositorio es privado y el acceso público se realiza a través de `JackLiu0406/b1k-checkpoints`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PiBehavior / pi0.5 (VLM Gemma 2B + experto de accion Gemma 300M) |
| Parametros totales | ~3.83 mil millones (3.83 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo orientado a robotica, no a procesamiento de lenguaje general) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints de JAX/Orbax (PyTreeCheckpointer) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura pi0.5, compuesta por un VLM Gemma 2B que procesa observaciones RGB (tres cámaras: cabeza, muñeca izquierda y derecha) y un experto de acción Gemma de 300M que genera acciones discretas mediante un tokenizador rápido basado en DCT cuantizado. No incluye rama espacial ni entrada de profundidad. El meta-entrenamiento se realizó sobre las 100 tareas de BEHAVIOR-1K 2026, con datos de demostración en formato LeRobot v3.0, imágenes RGB pre-redimensionadas a 224×224 y codificadas en HEVC/libx265. El entrenamiento se ejecutó en 8 GPUs NVIDIA B300 con un tamaño de lote de 3072 (384 por GPU), durante 70,000 pasos (1.022 épocas sobre 210 millones de muestras). El esquema de aprendizaje usa una tasa inicial de 1e-7 que sube a 1e-4 en 2,000 pasos, decae con coseno a 1e-5 en 10,000 pasos, se mantiene plana hasta el paso 35,000 y finalmente desciende a 5e-6 en el paso 70,000. Las tablas de condicionamiento incluyen `task_embeddings` de dimensión (100, 2048) y `task_stage_embeddings` de (1120, 1024), con un máximo de 15 etapas por tarea. El rendimiento de entrenamiento fue de aproximadamente 9.4 segundos por iteración.

## Capacidades

- Manipulación robótica de 100 tareas domésticas y de laboratorio definidas en BEHAVIOR-1K 2026 (por ejemplo, limpiar, organizar, cocinar, etc.).
- Seguimiento de instrucciones en lenguaje natural a través del VLM Gemma 2B.
- Razonamiento de subtareas: el modelo predice secuencias de etapas (subtask_accuracy ≈ 0.99 al final del entrenamiento).
- Generación de acciones de control de robot (posición y velocidad) mediante el experto de acción.
- Procesamiento de observaciones multimodales: tres flujos de imagen RGB (cabeza, muñecas izquierda y derecha).
- Tokenización rápida de acciones delta basada en DCT cuantizado, con un tokenizador que transfiere sin desbordamiento de alfabeto a nuevas tareas.
- No se reportan capacidades de tool calling, agentes conversacionales ni procesamiento de texto general.

## Casos de uso

- Automatización de tareas domésticas en robots manipuladores: el modelo puede ejecutar secuencias de acciones para tareas como recoger objetos, limpiar superficies o preparar alimentos, gracias a su entrenamiento en 100 actividades de BEHAVIOR-1K.
- Investigación en meta-aprendizaje para robótica: sirve como punto de partida para fine-tuning en tareas específicas, ya que el meta-entrenamiento en 100 tareas proporciona una inicialización robusta.
- Desarrollo de políticas VLA generalistas: permite estudiar cómo una única red puede manejar múltiples tareas con una tabla de condicionamiento amplia (100 filas).
- Evaluación de generalización en entornos simulados: el modelo puede desplegarse en simuladores compatibles con BEHAVIOR-1K para medir su capacidad de transferencia a escenarios no vistos.
- Benchmarking de arquitecturas VLA: al ser de código abierto (Apache-2.0), facilita la comparación con otras políticas como OpenVLA o RT-2 en tareas de manipulación.
- Fine-tuning eficiente para tareas nuevas: gracias a su tokenizador rápido y a las estadísticas de normalización corregidas, se puede adaptar a nuevas tareas con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Sin embargo, la model card reporta métricas de entrenamiento que indican la convergencia del modelo:

| Metrica | Paso 0 | Paso 60,000 | Paso 66,880 |
|---|---|---|---|
| action_loss | 0.4620 | 0.0758 | 0.0713 |
| total_loss | 0.7738 | 0.1023 | 0.0978 |
| fast_accuracy | 0.7925 | 0.8378 | 0.8386 |
| subtask_accuracy | 0.6045 | 0.9964 | 0.9966 |

La `action_loss` seguía descendiendo monótonamente al final de la época 1 (ajuste de ley de potencia `2.173·s^-0.305`), mientras que `fast_accuracy` se estabilizó en ~0.838 desde el paso 25,000, lo que sugiere que las predicciones discretas de tokens de acción convergieron antes que la pérdida de regresión.

## Requisitos de hardware

- Entrenamiento: se utilizaron 8× NVIDIA B300 con `fsdp_devices=8` y un lote de 3072 (384 por GPU). No se especifican requisitos mínimos para inferencia.
- Inferencia: dado que el modelo tiene ~3.83 B parámetros, es plausible que quepa en GPUs consumer de gama alta (p. ej., RTX 4090 con 24 GB) si se aplica cuantización, pero no se proporcionan datos oficiales de VRAM ni de latencia.
- Opciones de despliegue: al ser un modelo de JAX/Orbax, se puede servir con frameworks compatibles con JAX (p. ej., vLLM no es directamente aplicable; se requeriría un servidor personalizado). No se mencionan integraciones con llama.cpp, Ollama o TGI.
- Throughput de entrenamiento: ~9.4 s/iteración en el hardware mencionado.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros modelos VLA en la informacion proporcionada. Se puede mencionar que alternativas como OpenVLA (7B) o RT-2 (55B) tienen arquitecturas y tamaños diferentes, pero no hay métricas de rendimiento comparables en BEHAVIOR-1K. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El repositorio es privado; el acceso público se realiza a través de `JackLiu0406/b1k-checkpoints`, que contiene los fine-tunes de tarea única y los runs de 5 tareas, pero no los checkpoints de 100 tareas.
- El checkpoint final está nombrado `step69999` pero contiene el estado del paso 70,000; es importante no confundir el nombre de la carpeta con el número real de pasos.
- Las estadísticas de normalización (`norm_stats.json`) deben ser las versiones corregidas (qvel-fixed); si se cargan las de 2025, la velocidad base del robot se escalará incorrectamente (~10× de error).
- El tokenizador rápido no debe reentrenarse; se transfiere a nuevas tareas sin desbordamiento de alfabeto.
- El código de validación en `b1k/transforms.py` tiene un guard que rechaza `task_index >= 50`; debe modificarse para comparar contra `len(TASK_NUM_STAGES)` o las tareas 50+ se descartarán silenciosamente.
- La carga de checkpoints requiere restaurar a numpy en host y luego re-shardear con JAX; cargar directamente en un mesh con distinto número de GPUs fallará.
- No se reportan sesgos específicos, pero al ser un modelo entrenado en demos de BEHAVIOR-1K, su comportamiento está limitado a las tareas y entornos de ese conjunto.
- Riesgo de alucinación en la generación de acciones si las observaciones difieren de la distribución de entrenamiento.

## Enlaces

- Repositorio HuggingFace (privado): https://huggingface.co/JackLiu0406/meta-SFT-checkpoints
- Repositorio público con fine-tunes y runs de 5 tareas: https://huggingface.co/JackLiu0406/b1k-checkpoints
- Perfil del autor en HuggingFace: https://huggingface.co/JackLiu0406/models
- Repositorio GitHub del pipeline de entrenamiento: https://github.com/JackLiu0406/behaviour-1k-2026-meta
- Modelo base: https://huggingface.co/IliaLarchenko/behavior_50t_checkpoint
