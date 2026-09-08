# Elvinky/pi05-piperx-8h-seed1000-fp32

## Resumen

El modelo PI05 PiperX copper-screw insertion — 8h, seed 1000 (identificador: Elvinky/pi05-piperx-8h-seed1000-fp32) es un modelo de políticas robóticas (robot policy) afinado por Elvinky sobre el modelo base lerobot/pi05_base para la tarea de inserción de tornillos de cobre con un robot PiperX. Se trata de un checkpoint de inferencia final (paso 38513) entrenado con el dataset MINT-SJTU/RW-RL-Dataset, subárbol piperx_insert_copper_screw. El modelo tiene 4.143.404.816 parámetros y se distribuye en FP32 con safetensors. Al ser un modelo de control robótico, no es un modelo de lenguaje: no tiene longitud de contexto ni soporte de texto. Su relevancia radica en servir como artefacto de investigación para estudiar el aprendizaje por imitación, la normalización de estados/acciones y la escalabilidad del entrenamiento en el ecosistema LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada; modelo base lerobot/pi05_base |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | FP32 (sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (LeRobot) |

## Arquitectura y entrenamiento

La arquitectura interna del modelo no se especifica en la información disponible. Se sabe que parte del modelo base lerobot/pi05_base, que a su vez está integrado en el ecosistema LeRobot. Los datos de entrenamiento son 387 episodios completos, 862678 frames a 30 FPS, equivalentes a 7.98775926 horas de grabación. La selección de episodios se realizó ordenando los índices originales por SHA256 de la cadena `piperx-scaling-v1|1000|INDEX` y tomando el prefijo más largo de episodios completos que no excediera 864000 frames. La normalización de acciones y estados se calculó solo sobre ese subconjunto.

El entrenamiento se realizó con 38513 pasos de optimización, un tamaño de lote global de 56 (7 GPUs × 8), 2.5 épocas objetivo y un calentamiento (warmup) de 1284 pasos. Se utilizó una inicialización independiente desde pi05_base, sin partir de checkpoints de 2h o 4h. La configuración técnica incluye LeRobot 0.6.1, PyTorch 2.11.0+cu128, pesos completos en FP32, matmul CUDA con TF32 permitido, gradient checkpointing activado, AdamW sin foreach, y sin AMP, ZeRO ni FSDP. La tasa de aprendizaje decayó de 2.5e-5 a 2.5e-6, con decaimiento de pesos (weight decay) de 0.01 y recorte de gradiente (gradient clipping) de 1.0. No se describen innovaciones técnicas destacables más allá del pipeline de LeRobot y la normalización específica.

## Capacidades

- Generación de acciones de control para un robot manipulador PiperX en la tarea de inserción de tornillos de cobre.
- Aprendizaje por imitación a partir de demostraciones del dataset RW-RL.
- Uso de pipelines de procesamiento de LeRobot para entrada de cámaras y mapeo de renombrado de cámaras.
- Normalización de acciones y estados específica del subconjunto de entrenamiento.
- No soporta generación de texto, tool calling, agentes, razonamiento general ni capacidades multilingües, al no ser un modelo de lenguaje.
- No se describen capacidades de visión en el sentido de modelos multimodales de lenguaje; la entrada visual se procesa a través de los pipelines de LeRobot.

## Casos de uso

- Automatización de ensamblaje industrial: el modelo puede repetir la tarea de inserción de tornillos de cobre en un robot PiperX en un entorno controlado, siempre que se valide previamente la seguridad y el éxito físico.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar el efecto de la duración del entrenamiento (8h frente a 2h o 4h) y la semilla (seed 1000) en el rendimiento de la política.
- Validación de pipelines de LeRobot: permite probar la integración de LeRobot 0.6.1 con PyTorch 2.11 en FP32, incluyendo el guardado y carga de procesadores, mapeo de cámaras y normalización.
- Benchmark de políticas robóticas: en el contexto del dataset RW-RL, se puede utilizar para evaluar métricas de éxito físico y seguridad en la tarea de inserción, aunque la model card advierte que la pérdida de entrenamiento no establece el éxito físico.
- Estudio de técnicas de normalización: el modelo incluye una normalización de acciones/estados calculada sobre un subconjunto específico; puede usarse para investigar cómo afecta esta normalización al comportamiento de la política.
- Análisis de sensibilidad a la semilla y duración: al existir otros checkpoints con diferentes duraciones (2h, 4h) y la misma semilla, este modelo permite estudiar la variabilidad del entrenamiento.
- Transferencia a tareas similares: con precaución y validación en entorno controlado, podría servir como punto de partida para fine-tuning en tareas de inserción ligeramente diferentes, aunque no se ha demostrado su generalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito físico, tasas de acierto ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser pesos FP32, se requieren aproximadamente 16,6 GB solo para los parámetros (4.143.404.816 × 4 bytes). Con overhead de activaciones y buffers, se recomienda al menos 20-24 GB de VRAM.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para cargar el modelo completo en FP32; A100 40 GB o H100 80 GB si se dispone de ellas.
- En consumer GPU: cabe en una RTX 3090 o 4090 con 24 GB de VRAM. No se recomienda en GPUs con menos de 16 GB.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot (librería de robótica). No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Duración entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05-piperx-8h-seed1000-fp32 | 4.143.404.816 | 8h (38513 pasos) | No disponible | HuggingFace |
| pi05-piperx-2h-seed1000-fp32 | No disponible | 2h | No disponible | HuggingFace |
| lerobot/pi05_base | No disponible | No aplica (base) | No disponible | HuggingFace |

Existen otros checkpoints del mismo autor para la misma tarea con diferentes duraciones de entrenamiento, como pi05-piperx-2h-seed1000-fp32. No se dispone de especificaciones detalladas de esos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el éxito físico y la seguridad del robot no están establecidos por la pérdida de entrenamiento. Es imprescindible validar en un entorno controlado antes de cualquier despliegue.
- Especialización extrema: el modelo está entrenado para una única tarea (inserción de tornillos de cobre en PiperX). No generaliza a otras tareas sin fine-tuning.
- Dependencia de la normalización: la política requiere la normalización de acciones/estados específica del subconjunto de entrenamiento. Deben usarse los pipelines y el mapeo de cámaras guardados.
- Licencia no disponible: al no especificarse la licencia, el uso comercial es incierto y debe consultarse con el autor.
- Sesgos del dataset: al entrenarse con demostraciones de un dataset concreto, el modelo puede heredar sesgos del proceso de teleoperación (por ejemplo, preferencias de velocidad, trayectorias o condiciones de iluminación).
- Riesgo de acciones no seguras: si la entrada está fuera de la distribución de entrenamiento, el modelo puede generar acciones no deseadas. No se han publicado análisis de robustez.
- Sin benchmarks: no se han publicado métricas de éxito físico ni comparaciones con otros modelos, por lo que el rendimiento real no está cuantificado.
- No es un modelo de lenguaje: no soporta texto, tool calling ni razonamiento general. Cualquier expectativa en ese sentido es incorrecta.

## Enlaces

- HuggingFace: https://huggingface.co/Elvinky/pi05-piperx-8h-seed1000-fp32
- Mirror (HF): https://hf-mirror.com/Elvinky/pi05-piperx-8h-seed1000-fp32

No se encontraron papers, blogs, demos u otros enlaces relevantes en la búsqueda web.
