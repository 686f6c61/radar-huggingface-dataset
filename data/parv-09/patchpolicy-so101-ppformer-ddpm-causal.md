# Parv-09/patchpolicy-so101-ppformer-ddpm-causal

## Resumen

El modelo `patchpolicy-so101-ppformer-ddpm-causal` es una política visuomotora para el brazo robótico SO-101, desarrollada por Parv-09. Forma parte de una ablación controlada de ocho configuraciones que comparan distintos cabezales de acción y patrones de atención, todos compartiendo el mismo trunk visual, dataset, semilla y optimizador. Esta variante concreta utiliza un trunk DINOv2 ViT-S/14 congelado que extrae tokens de parche densos (Patch Policy), seguido de un transformer de acción entrenado con el objetivo DDPM de predicción de epsilon y atención causal entre los tokens de acción.

El modelo resuelve el problema del aprendizaje por imitación para control robótico: a partir de observaciones de tres cámaras (muñeca, frontal y superior) durante dos pasos temporales, genera un chunk de 24 acciones de articulación en grados. Su relevancia radica en que es una de las primeras comparaciones sistemáticas entre atención causal y bidireccional en cabezales de acción para políticas de manipulación, y en que emplea un trunk visual preentrenado congelado, lo que reduce drásticamente los parámetros entrenables (9,5 millones). El checkpoint está alojado en HuggingFace bajo licencia Apache 2.0 y utiliza la librería LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Patch Policy: trunk DINOv2 ViT-S/14 congelado + transformer de acción con atención causal |
| Parametros totales | 31.588.614 (22.056.576 del trunk congelado + 9.532.038 entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2 timesteps x 3 cámaras, 901 tokens por frame (900 patch + 1 estado), 1.802 tokens en memoria |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pickle de `nn.Module` (torch.save) |

## Arquitectura y entrenamiento

La arquitectura combina un extractor visual congelado y un cabezal de acción entrenable. El trunk DINOv2 ViT-S/14 procesa imágenes de 210x280 píxeles (recorte de las originales de 240x320) y produce 300 tokens por cámara (rejilla de 15x20 con parches de 14x14). Con tres cámaras y un token de estado de articulación, cada frame genera 901 tokens de dimensión 384. La memoria del modelo acumula dos frames, resultando en una secuencia de 1.802 tokens que alimenta al transformer de acción. Este transformer predice un chunk de 48 pasos de acción, de los cuales se ejecutan los primeros 24 (6 articulaciones en grados).

El entrenamiento utiliza el dataset `phi_so101_cubes_cylinder_recovery_v1`, compuesto por 143 episodios (120 de teleoperación y 23 de recuperación de fallos), con 81.943 frames a 30 fps. La partición es de 113 episodios para entrenamiento y 30 para validación. El objetivo es DDPM epsilon-prediction, un enfoque de difusión aplicado a acciones. Se empleó una semilla fija (1000), batch de 64, 29 épocas (29.493 pasos), optimizador Adam (0.9, 0.95), tasa de aprendizaje 1e-4 con decaimiento coseno y 500 pasos de calentamiento, weight decay 1e-6, grad clip 10.0 y media móvil exponencial (EMA). Durante el entrenamiento se aplica recorte aleatorio; en evaluación, recorte central.

## Capacidades

- Control visuomotor para el brazo SO-101: genera comandos de 6 articulaciones en grados a partir de observaciones visuales.
- Aprendizaje por imitación: aprende de demostraciones teleoperadas y de episodios de recuperación de fallos.
- Procesamiento multi-cámara: integra tres cámaras (muñeca, frontal y superior) con tokens independientes por cámara en la memoria.
- Predicción de chunks de acción: anticipa 48 pasos y ejecuta los primeros 24, lo que permite planificación a corto plazo.
- Atención causal en acciones: en esta variante, cada token de acción solo atiende a los anteriores, restringiendo el flujo de información durante la generación.
- Compatibilidad con LeRobot: el checkpoint se carga como un módulo de PyTorch completo y requiere que las clases del modelo sean importables.

## Casos de uso

- Manipulación robótica de objetos: el modelo puede controlar un brazo SO-101 para tareas de recogida y recuperación de cubos y cilindros, como las del dataset de entrenamiento.
- Aprendizaje por demostración en entornos reales: permite entrenar políticas a partir de teleoperación humana sin necesidad de un simulador, útil para robots de bajo coste.
- Investigación en arquitecturas de acción: sirve como referencia para comparar patrones de atención (causal vs. bidireccional) y objetivos de entrenamiento (DDPM vs. flow-matching) en políticas visuomotoras.
- Recuperación ante fallos: los episodios de recovery incluidos en el dataset capacitan al modelo para corregir errores durante la ejecución de tareas.
- Evaluación de políticas en hardware real: al no existir simulador para SO-101, este checkpoint permite realizar rollouts físicos para medir éxito real de tarea.
- Desarrollo de sistemas de control basados en difusión: el uso de DDPM epsilon-prediction sobre acciones demuestra la viabilidad de este enfoque para control robótico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un modelo robótico, no lingüístico. La model card reporta la pérdida held-out (validación) para las cuatro configuraciones de la ablación, que se muestran a continuación. Es importante señalar que la pérdida held-out no equivale a éxito de tarea y que los valores de DDPM y flow-matching no son comparables entre sí por minimizar objetivos distintos.

| Configuracion (head + objetivo + atencion) | Perdida held-out |
|---|---|
| ppformer + DDPM + causal | 0.037980 |
| ppformer + DDPM + bidireccional | 0.016703 |
| ppformer + flow + causal | 0.067604 |
| ppformer + flow + bidireccional | 0.042783 |
| expert8w288 + flow + causal | 0.079359 |
| expert8w288 + flow + bidireccional | 0.051919 |
| expert16w216 + flow + causal | 0.081903 |
| expert16w216 + flow + bidireccional | 0.052711 |

La atención bidireccional superó a la causal en todos los pares comparados. Entre las tres configuraciones con flow-matching (mismo objetivo), el transformer Patch Policy supera a las configuraciones expert, y duplicar la profundidad del experto no mejoró los resultados.

## Requisitos de hardware

- El checkpoint ocupa 0.1 GB en disco, lo que indica un modelo ligero.
- Parámetros totales ~31,6 millones, de los cuales solo 9,5 millones son entrenables; el trunk congelado no requiere gradientes.
- Inferencia factible en GPUs de consumo como RTX 3060 o superiores, aunque no se especifican requisitos oficiales.
- Al ser un `nn.Module` de PyTorch empaquetado, el despliegue requiere un entorno con las clases del modelo importables; no se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Para entrenamiento o fine-tuning, se necesitaría una GPU con al menos 8-12 GB de VRAM, dado el batch de 64 usado en el estudio (aunque el batch se puede reducir).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

La model card no compara este modelo con otros externos, pero sí con las otras siete configuraciones de la misma ablación. Todas comparten trunk, dataset, split, semilla y optimizador, diferenciándose solo en el cabezal de acción y el patrón de atención. La siguiente tabla resume las diferencias clave:

| Modelo | Head de accion | Objetivo | Atencion | Params entrenables | Perdida held-out |
|---|---|---|---|---|---|
| patchpolicy-so101-ppformer-ddpm-causal | Patch Policy transformer | DDPM epsilon | causal | 9.532.038 | 0.037980 |
| patchpolicy-so101-ppformer-ddpm-bidirectional | Patch Policy transformer | DDPM epsilon | bidireccional | 9.532.038 | 0.016703 |
| patchpolicy-so101-ppformer-flow-causal | Patch Policy transformer | flow-matching | causal | 9.532.038 | 0.067604 |
| patchpolicy-so101-ppformer-flow-bidirectional | Patch Policy transformer | flow-matching | bidireccional | 9.532.038 | 0.042783 |
| patchpolicy-so101-expert8w288-flow-causal | Expert transformer (8 capas, 288 dim) | flow-matching | causal | no disponible | 0.079359 |
| patchpolicy-so101-expert16w216-flow-causal | Expert transformer (16 capas, 216 dim) | flow-matching | causal | no disponible | 0.081903 |

No se dispone de comparaciones con modelos de otros autores o repositorios.

## Limitaciones y advertencias

- Resultados basados en una única semilla (1000), sin barras de error ni análisis de robustez.
- La pérdida held-out no mide el éxito de la tarea; para validar la política se requieren rollouts físicos en el brazo SO-101, que no dispone de simulador.
- No se deben comparar directamente los valores de pérdida entre objetivos DDPM y flow-matching, ya que minimizan funciones distintas.
- El checkpoint es un objeto pickle de Python; cargarlo de fuentes no confiables puede suponer un riesgo de ejecución de código arbitrario.
- El orden de las cámaras es fijo (muñeca, frontal, superior); intercambiarlas alimenta al modelo con slices incorrectos de la memoria.
- El modelo está entrenado exclusivamente para el brazo SO-101 y el dataset específico de cubos y cilindros; no generaliza a otros robots o tareas sin reentrenamiento.
- No es un modelo de lenguaje: no soporta instrucciones textuales ni interacción conversacional.
- El repositorio no incluye documentación sobre cuantización ni formatos optimizados para despliegue en producción.

## Enlaces

- HuggingFace: https://huggingface.co/Parv-09/patchpolicy-so101-ppformer-ddpm-causal
- Repositorio compañero con código y `infer.py`: mencionado en la model card, pero no se proporciona URL en la información disponible.
