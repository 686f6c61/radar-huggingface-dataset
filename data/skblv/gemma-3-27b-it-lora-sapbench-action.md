# skblv/gemma-3-27b-it-lora-sapbench-action

## Resumen

El modelo `skblv/gemma-3-27b-it-lora-sapbench-action` es un adaptador LoRA desarrollado por el autor `skblv` como baseline para la predicción de la siguiente acción del cirujano en vídeo de colecistectomía, utilizando el dataset SAP-Bench. Se construye sobre el modelo multimodal `google/gemma-3-27b-it`, que procesa imágenes y texto, y se ajusta para generar una clasificación de una sola etiqueta sobre un vocabulario de cinco acciones: disección, clipaje de vasos, retracción de tejido, coagulación y aspiración. El adaptador, de solo 0.5 GB, se entrena sobre 660 fotogramas de entrenamiento y se evalúa en 353 fotogramas de validación.

La relevancia de este modelo radica en su función como referencia reproducible para la comprensión de vídeo quirúrgico, un campo donde los modelos generativos multimodales aún no superan a los clasificadores supervisados clásicos. Su exactitud exacta de coincidencia (exact-match) es del 32.3 %, inferior al baseline de mayoría (~40 %) y al clasificador YOLO11m-cls (45.6 %), lo que lo posiciona como un límite inferior para modelos con contexto de vídeo. No es un dispositivo médico y su uso se limita a investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3 27B-it) con adaptador LoRA |
| Parametros totales | Modelo base: 27B; adaptador LoRA: no disponible (0.5 GB de pesos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (del modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones GGUF (Q4_K_M, Q5_K_M, etc.) y FP16/BF16 |
| Idiomas soportados | No disponible (el modelo base soporta más de 140 idiomas) |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre todas las proyecciones de atención (`q/k/v/o_proj`) y las proyecciones del MLP (`gate/up/down_proj`) del modelo base `google/gemma-3-27b-it`. La configuración del adaptador es `r=16`, `alpha=32`, `dropout=0.05`, con una tasa de aprendizaje de `1e-4`, tamaño de lote efectivo de 8 (acumulación de gradientes de 8), 4 épocas y semilla 42. El entrenamiento se realizó con 660 fotogramas de referencia y una split de monitorización de 139 fotogramas para la pérdida de validación. La supervisión consiste en completar JSON con el formato esperado en la evaluación: `{"next_action": "..."}` con los nombres exactos de las acciones.

El modelo base Gemma 3 es un transformer multimodal que procesa texto e imágenes, con atención global sobre el contexto y soporte de múltiples imágenes. El adaptador no modifica la arquitectura del base, sino que añade matrices de bajo rango en las capas de atención y MLP, lo que permite un ajuste eficiente con un coste de almacenamiento reducido (0.5 GB).

## Capacidades

- Predicción de la siguiente acción quirúrgica en un solo fotograma de vídeo de colecistectomía.
- Clasificación de imagen en un vocabulario cerrado de cinco acciones: Dissection, Vessel Clipping, Tissue Retraction, Coagulation y Aspiration.
- Generación de salida estructurada en JSON, compatible con pipelines de evaluación automática.
- Al estar basado en Gemma 3, hereda capacidades generales de comprensión de imagen y texto del modelo base (aunque no se evaluaron específicamente).
- Sin soporte de tool calling, agentes ni razonamiento multi-paso en el contexto del adaptador.

## Casos de uso

- Investigación en cirugía asistida por computador: el adaptador sirve como baseline para comparar modelos con contexto de vídeo, como se documenta en el leaderboard de SAP-Bench.
- Desarrollo de sistemas de asistencia quirúrgica: puede integrarse en pipelines de investigación para evaluar la viabilidad de modelos de lenguaje multimodales en la predicción de acciones en tiempo real.
- Evaluación de benchmarks de vídeo quirúrgico: su salida JSON estructurada facilita la comparación con otros sistemas de clasificación.
- Análisis de errores de modelos generativos: al ser un baseline con rendimiento bajo, permite estudiar las limitaciones de los modelos de lenguaje para tareas de visión especializada.
- Formación de modelos más complejos: puede usarse como punto de partida para añadir contexto temporal (múltiples fotogramas) o información de trayectoria del instrumento.
- Documentación y reproducibilidad: como ejemplo de ajuste LoRA para una tarea médica específica, sirve de plantilla para otros dominios con vocabulario de acciones limitado.

## Benchmarks y rendimiento

El modelo se evaluó en la split de validación completa de 353 fotogramas con una prompt que requiere salida JSON. La métrica principal es exact-match accuracy (precisión de coincidencia exacta), con intervalos de confianza bootstrap del 95 %.

| Modelo | Exact-match accuracy (%) |
|---|---|
| Gemma 3 27B-it LoRA (este adaptador) | 32.3 (27.5–37.1) |
| Baseline de mayoría | ~40 |
| YOLO11m-cls (supervisado) | 45.6 |

Los resultados son inferiores a ambos baselines, lo que indica que la predicción de una sola imagen es inherentemente ambigua y que el modelo no aprovecha el contexto temporal del vídeo.

## Requisitos de hardware

- El modelo base Gemma 3 27B en bf16 requiere aproximadamente 54 GB de VRAM para inferencia en GPU (solo pesos).
- Con cuantización a 4 bits (por ejemplo, Q4_K_M en llama.cpp), los pesos caben en una GPU de 24 GB como la RTX 4090 o A5000, pero el adaptador LoRA debe fusionarse con el modelo base.
- Para inferencia con el adaptador, se necesita cargar el modelo base completo y el adaptador; el adaptador añade un uso de VRAM marginal (menos de 1 GB).
- GPU recomendadas para una inferencia cómoda en BF16: A100 (80 GB), H100 (80 GB) o RTX 4090 con cuantización.
- Opciones de despliegue: Transformers (con PEFT), vLLM, llama.cpp, Ollama (para el base) y TGI (con soporte de adaptadores LoRA).
- Latencia y throughput no disponibles en la documentación del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud (SAP-Bench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 3 27B-it LoRA (skblv) | 27B + LoRA | 128K | 32.3 % | Gemma | Abierto (HF) |
| YOLO11m-cls (supervisado) | ~20M | — | 45.6 % | GPL-3.0 | Abierto (Ultralytics) |
| Majority baseline (clase mayoritaria) | — | — | ~40 % | — | — |

El adaptador es notablemente inferior a los clasificadores supervisados clásicos para esta tarea, lo que subraya la dificultad de aplicar LLM multimodales a problemas de visión de precisión sin contexto temporal.

## Limitaciones y advertencias

- Modelo de investigación, no es un dispositivo médico ni está aprobado para uso clínico; no debe utilizarse para la toma de decisiones médicas.
- La predicción de una sola acción a partir de un único fotograma es inherentemente ambigua; los autores lo consideran un límite inferior para modelos con contexto de vídeo.
- El rendimiento es inferior al baseline de mayoría, lo que indica que el modelo no aprende un patrón útil en esta tarea específica.
- El adaptador se entrenó solo con 660 fotogramas, un conjunto de datos muy reducido que limita la generalización.
- No se evaluó la robustez ante variaciones de iluminación, ángulos de cámara o instrumentos quirúrgicos distintos a los del dataset.
- La licencia Gemma impone términos de uso específicos de Google, que pueden restringir ciertos usos comerciales o de alto riesgo.
- No hay información sobre sesgos o alucinaciones; el modelo podría generar salidas JSON inválidas fuera de las cinco acciones del vocabulario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skblv/gemma-3-27b-it-lora-sapbench-action
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Paper SAP-Bench: https://arxiv.org/abs/2506.07196
- Leaderboard de vídeo quirúrgico (GitHub): https://github.com/skblv/neurosurgery-video-eval-website
- Página de Gemma 3 (Google DeepMind): https://deepmind.google/models/gemma/gemma-3/
- Gemma 3 27B en Ollama: https://ollama.com/library/gemma3:27b
