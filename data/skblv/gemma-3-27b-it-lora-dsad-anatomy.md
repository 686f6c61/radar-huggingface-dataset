# skblv/gemma-3-27b-it-lora-dsad-anatomy

## Resumen

El modelo `skblv/gemma-3-27b-it-lora-dsad-anatomy` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario skblv sobre el modelo base multimodal `google/gemma-3-27b-it`. Su propósito es realizar reconocimiento de estructuras anatómicas en imágenes laparoscópicas, concretamente clasificación multi-etiqueta sobre un vocabulario fijo de 12 estructuras abdominales (órganos y vasos) procedentes del dataset Dresden Surgical Anatomy Dataset (DSAD). El adaptador se entrenó como línea base para un leaderboard de comprensión de video quirúrgico promovido por SDSC y Chicago Booth.

El modelo resuelve el problema de identificar qué estructuras anatómicas son visibles en un fotograma quirúrgico, devolviendo una salida JSON estructurada. Su relevancia reside en que sirve como punto de referencia para comparar modelos de visión-lenguaje en el dominio quirúrgico, aunque el propio autor advierte de que se trata de un baseline de investigación, no de un dispositivo médico. La arquitectura hereda la del modelo base: un transformer multimodal con codificador de visión SigLIP y una ventana de contexto de 128K tokens, aunque el adaptador LoRA se aplica únicamente a las proyecciones de atención y MLP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base: Gemma 3 27B-it) con adaptador LoRA |
| Parámetros totales | Modelo base: 27B; adaptador LoRA: no especificado (tamaño del repositorio 0.5 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (modelo base) |
| Tipos de cuantizacion | No especificado (pesos en safetensors, probablemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (license gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `google/gemma-3-27b-it`, que es un transformer multimodal de 27.000 millones de parámetros con capacidad de procesar texto e imágenes mediante un codificador de visión SigLIP y una ventana de contexto de 128K tokens. El adaptador se aplica a todas las proyecciones de atención y MLP (`q/k/v/o_proj`, `gate/up/down_proj`), con un rango r=16, alpha=32 y dropout de 0.05.

El entrenamiento se realizó sobre 7.495 fotogramas quirúrgicos del dataset DSAD, con una división de validación de 394 fotogramas a nivel de video para monitorizar la pérdida. Se usaron 3 épocas, un learning rate de 1e-4, tamaño de lote efectivo de 8 (con acumulación de gradientes de 8) y semilla 42. La supervisión consistió en completar JSON con el formato de salida de evaluación, es decir, el modelo debe generar una lista de estructuras visibles.

## Capacidades

- Clasificación multi-etiqueta de estructuras anatómicas en imágenes laparoscópicas, devolviendo un objeto JSON con la lista de estructuras visibles.
- Entrada multimodal: acepta imágenes (fotogramas quirúrgicos) y texto (instrucciones de prompt).
- Salida estructurada en formato JSON, compatible con sistemas de evaluación automática.
- Capacidad de razonamiento visual básico heredada del modelo base, aunque limitada al dominio de entrenamiento.
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso específico más allá de la tarea de clasificación.
- El adaptador no modifica las capacidades lingüísticas del modelo base, que soporta múltiples idiomas, pero no se especifica cuáles.

## Casos de uso

- Investigación en visión quirúrgica: el modelo sirve como línea base para comparar nuevas técnicas de reconocimiento anatómico en el leaderboard de comprensión de video quirúrgico.
- Desarrollo de asistentes de documentación quirúrgica: puede emplearse para anotar automáticamente fotogramas de cirugía robótica, aunque solo en entornos de investigación.
- Evaluación de modelos de visión-lenguaje en dominios médicos: permite comparar el rendimiento de un modelo multimodal preentrenado con adaptadores LoRA frente a modelos supervisados clásicos.
- Entrenamiento de modelos de clasificación anatómica: como referencia para futuras iteraciones que mejoren la precisión exacta del conjunto (10.8%).
- Análisis de video quirúrgico offline: procesar secuencias completas para generar etiquetas de estructuras por fotograma, siempre que se acepte la baja precisión.
- Benchmarking de eficiencia de adaptadores LoRA en tareas médicas: comparar el coste de entrenamiento y la ganancia de rendimiento frente a ajuste fino completo.

## Benchmarks y rendimiento

El model card reporta resultados en la división de validación de 1.978 fotogramas, con un prompt de salida JSON. Se muestran los siguientes métricas:

| Métrica | Valor (95% bootstrap CI) |
|---|---|
| Exact match (predicted set == ground-truth set) | 10.8% (9.5–12.2) |
| Micro-F1 | 41.6% (40.1–43.1) |

Como comparación, el modelo base zero-shot Gemma 3 27B-it no se reporta en el model card, pero sí se indica que el adaptador mejora sobre el zero-shot del modelo base. Un ResNet-50 supervisado alcanza un 30.6% de exact match y un 71.6% de micro-F1, superando claramente al adaptador LoRA en esta tarea.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.5 GB), pero requiere cargar el modelo base completo de 27B parámetros en memoria.
- Para inferencia en bf16 se estiman al menos 54 GB de VRAM, por lo que se recomienda una GPU de alta gama como A100 (80GB) o H100 (80GB).
- Con cuantización a 4-bit, es posible ejecutar en GPUs con 24 GB de VRAM, como RTX 4090, aunque el rendimiento puede degradar ligeramente.
- No se han publicado mediciones de latencia ni throughput específicas para este adaptador.
- Opciones de despliegue: la librería `peft` permite cargar el adaptador con Transformers. No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI, aunque podrían ser compatibles si se exportan los pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exact match | Micro-F1 | Licencia |
|---|---|---|---|---|---|
| skblv/gemma-3-27b-it-lora-dsad-anatomy | 27B base + LoRA | 128K | 10.8% | 41.6% | gemma |
| google/gemma-3-27b-it (zero-shot) | 27B | 128K | no disponible | no disponible | gemma |
| ResNet-50 supervisado | 25M | no aplica | 30.6% | 71.6% | no disponible |

La comparación muestra que el adaptador LoRA mejora el rendimiento del modelo base zero-shot, pero queda muy por debajo de un clasificador convolucional supervisado clásico, lo que indica la dificultad de la tarea y la limitación del enfoque de adaptación ligera.

## Limitaciones y advertencias

- El modelo es un baseline de investigación, no es un dispositivo médico y no debe utilizarse para decisiones clínicas.
- Entrenado y evaluado únicamente sobre el dataset DSAD, que corresponde a resección rectal robótica; el rendimiento puede degradarse en otros procedimientos, ópticas o instituciones.
- La exact match es muy baja (10.8%), lo que indica que el modelo raramente acierta el conjunto completo de estructuras visibles.
- Riesgo de alucinación: el modelo puede generar estructuras no presentes en la imagen, especialmente en entornos fuera de la distribución de entrenamiento.
- No se han documentado sesgos específicos, pero al ser un dataset de un solo dominio, es probable que no generalice a otras modalidades quirúrgicas.
- Licencia gemma restringe el uso comercial? La licencia Gemma permite uso comercial con condiciones, pero es recomendable revisar los términos exactos.
- El adaptador no incluye cuantización nativa; para despliegue en producción se requiere integración con el modelo base y posible cuantización adicional.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/skblv/gemma-3-27b-it-lora-dsad-anatomy)
- [HuggingFace del modelo base](https://huggingface.co/google/gemma-3-27b-it)
- [Dataset DSAD (Nature Scientific Data)](https://www.nature.com/articles/s41597-022-01719-2)
- [Leaderboard de comprensión de video quirúrgico](https://github.com/skblv/neurosurgery-video-eval-website)
- [Technical Report de Gemma 3 (arXiv)](https://arxiv.org/html/2503.19786v1)
