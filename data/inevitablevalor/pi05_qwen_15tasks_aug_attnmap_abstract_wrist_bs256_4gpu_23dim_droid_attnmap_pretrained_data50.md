# Inevitablevalor/pi05_qwen_15tasks_aug_attnmap_abstract_wrist_bs256_4gpu_23dim_droid_attnmap_pretrained_data50

## Resumen

Este repositorio contiene un checkpoint intermedio de un modelo de visión-lenguaje-acción (VLA) basado en la arquitectura π₀.₅, desarrollado por el usuario Inevitablevalor. El modelo está diseñado para control robótico y se enmarca en un experimento de escalado de datos: utiliza el 50% de los episodios de entrenamiento de un run padre completo, manteniendo idénticos el resto de hiperparámetros. El objetivo es estudiar el impacto de la reducción de datos en el rendimiento final del modelo.

El checkpoint cubre los pasos de entrenamiento 90.000 a 120.000 de un plan total de 140.000, y se detuvo por límite de tiempo de partición (48 horas en 4 GPU H100 SXM). El modelo incorpora mapas de atención (attn-map), prompts abstractos e información de muñeca (wrist IR) como entradas adicionales, y parte de un warm start desde un modelo preentrenado en el dataset DROID. El repositorio contiene los pesos en formato safetensors (bf16) junto con el optimizador y metadatos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π₀.₅ (vision-language-action, flow-based) con backbone Qwen |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | max_token_len = 448 |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors), optimizer.pt, metadata.pt |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅, un VLA de flujo (flow-based) que combina un codificador de visión con un modelo de lenguaje (Qwen) para generar acciones de control. La configuración específica incluye 15 tareas del dataset `behavior_15tasks_aug`, con aumentación de datos, mapas de atención (attn-map) como entrada adicional, prompts abstractos y señales de muñeca con infrarrojos (wrist IR). El entrenamiento utiliza un esquema de 140.000 pasos con un warm start desde un checkpoint preentrenado en DROID (paso 100.000).

La innovación clave de este run es el uso de un subconjunto de datos del 50% (`episode_subset_50.json`), que reduce los episodios de 5.532 a 2.766 y enmascara aproximadamente 1,25 millones de frames. El entrenamiento se realizó con un batch size de 256 distribuido en 4 GPU H100 SXM, con una velocidad medida de 1,59 segundos por iteración. Se utilizó la librería `openpi-spatialvla` en el commit `ed44632`, que incluye la corrección del consumo real del subconjunto de datos.

## Capacidades

- Control robótico end-to-end: genera acciones directamente desde observaciones visuales y lingüísticas.
- Integración de mapas de atención: utiliza mapas de atención como entrada adicional para mejorar la percepción espacial.
- Prompts abstractos: soporta instrucciones de alto nivel para tareas de manipulación.
- Información de muñeca con infrarrojos: procesa señales de cámara infrarroja de la muñeca del robot.
- Multitarea: entrenado en 15 tareas de manipulación diferentes.
- Preentrenamiento en DROID: aprovecha representaciones aprendidas en el dataset DROID para mejor generalización.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar brazos robóticos en tareas de pick-and-place, apilado y ensamblaje, aprovechando los mapas de atención para una localización precisa de objetos.
- Investigación en escalado de datos: este checkpoint es útil para estudiar cómo afecta la reducción de datos al rendimiento de modelos VLA, comparando con el run padre completo.
- Desarrollo de políticas de control con poca data: el entrenamiento con 50% de datos permite evaluar si es viable entrenar modelos robóticos con menos recursos.
- Benchmarking de generalización: al estar preentrenado en DROID y fine-tuneado en 15 tareas, sirve para evaluar la transferencia entre datasets.
- Integración en pipelines de simulación: puede usarse en entornos simulados (por ejemplo, MuJoCo o Isaac Sim) para validar políticas antes del despliegue físico.
- Estudio de sobreajuste: el run a 50% de datos con el mismo número de épocas que el run completo permite analizar el punto de sobreajuste y la selección de checkpoints mediante SIM-EVAL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que la selección de checkpoints debe hacerse mediante SIM-EVAL sobre una escalera de 10k pasos, pero no se proporcionan métricas concretas.

## Requisitos de hardware

- Entrenamiento: 4 GPU H100 SXM con 90 CPUs por nodo (aunque se usaron 56) y lectura directa del sistema de archivos paralelo.
- Inferencia: no se especifican requisitos, pero al ser un modelo VLA con backbone Qwen, se estima que necesita al menos 40-80 GB de VRAM en bf16 (el repositorio pesa 44,8 GB).
- GPU recomendadas: H100, A100 (80 GB) o similar para inferencia en bf16.
- Despliegue: requiere el servidor con `WITH_WRIST_IR=1` tanto en servidor como en cliente; el cliente calcula los centros y el servidor los renderiza.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp u otras herramientas; el modelo está pensado para usarse con el código `openpi-spatialvla`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Este modelo (50% data) | no disponible | 448 tokens | 15 tareas, 50% datos, warm start DROID | no disponible |
| Run padre (100% data) | no disponible | 448 tokens | 15 tareas, 100% datos, warm start DROID | no disponible |
| π₀.₅ base (Physical Intelligence) | no disponible | no disponible | Co-entrenamiento en multiples datasets | no disponible |

La comparativa directa con el run padre (mismo config pero 100% de datos) es el punto clave de este experimento, pero no se proporcionan métricas comparativas en la información disponible.

## Limitaciones y advertencias

- Sobreajuste potencial: al usar 50% de datos con el mismo esquema de 140k pasos, el número de épocas se duplica, lo que eleva el riesgo de sobreajuste. El autor recomienda seleccionar checkpoints por SIM-EVAL y no confiar en el paso del run padre.
- Checkpoint incompleto: el entrenamiento se detuvo en el paso 120.452, faltando los últimos 20k pasos del plan de 140k. Aunque el autor sugiere que el checkpoint útil está dentro del rango 90k-120k, no hay garantía.
- Dependencia de `WITH_WRIST_IR`: si se sirve el modelo sin esta variable activada en ambos lados (servidor y cliente), se produce un KeyError en la primera llamada y los clientes se cuelgan.
- Datos no disponibles: no se especifican licencia, idiomas soportados, ni detalles de cuantización, lo que limita su uso en producción sin verificación previa.
- Tamaño del repositorio: 44,8 GB, lo que requiere almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Inevitablevalor/pi05_qwen_15tasks_aug_attnmap_abstract_wrist_bs256_4gpu_23dim_droid_attnmap_pretrained_data50
- Run padre (100% data): https://huggingface.co/Inevitablevalor/pi05_qwen_behavior_15tasks_aug_attnmap_abstract_wrist_bs256_4gpu_23dim_droid_attnmap_pretrained
- Run similar con IR: https://huggingface.co/arielchen07/pi05_qwen_behavior_15tasks_aug_with_ir_train_bs256_4gpu_23dim
- Código openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Código openpi-spatialvla (fork): https://github.com/zgmaguoqing/openpi
- Paper π₀.₅: https://arxiv.org/html/2504.16054v1
