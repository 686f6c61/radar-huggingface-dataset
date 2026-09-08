# enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-TIP-Top20-ReverseKL-original10240

## Resumen

Qwen2.5-VL-7B-OPSD-VisionZip-r010-TIP-Top20-ReverseKL-original10240 es un adaptador PEFT/LoRA experimental desarrollado por enmingzhangzz sobre el modelo multimodal Qwen/Qwen2.5-VL-7B-Instruct. El repositorio publica únicamente un adaptador LoRA de 0.2 GB, no el modelo completo, y forma parte de una serie de experimentos OPSD orientados a la destilación de modelos de lenguaje visual. El objetivo declarado es combinar la poda de tokens visuales con VisionZip, que retiene un 10% de los tokens, con una estrategia de selección de tokens de respuesta denominada TIP Soft-OR Top-K, que retiene un 20% de los tokens válidos.

El entrenamiento utiliza una función de pérdida de divergencia Kullback-Leibler inversa (KL(student || teacher)) sobre un teacher EMA con decaimiento 0.9999. Se empleó un subconjunto de 10.240 muestras del dataset OpenMMReasoner-SFT-874K, con un lote global de 32 y un tamaño de imagen fijado a 846.720 píxeles. El modelo es relevante por su enfoque en la eficiencia de la inferencia multimodal y como banco de pruebas para técnicas de destilación y selección de tokens, aunque no se han publicado evaluaciones de rendimiento ni datos de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT/LoRA sobre Qwen2.5-VL-7B-Instruct (transformador multimodal vision-language) |
| Parametros totales | no disponible (el adaptador LoRA ocupa 0.2 GB) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) + adapter_config.json (PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-VL-7B-Instruct, un modelo multimodal basado en transformador que procesa imágenes y texto. El entrenamiento se realizó mediante un procedimiento de destilación denominado OPSD, del que no se ofrece una descripción formal en la información disponible. La pérdida utilizada es la divergencia KL del estudiante respecto al teacher, es decir, KL(student || teacher), calculada sobre un subconjunto de tokens de respuesta seleccionados. El teacher se mantiene mediante una media móvil exponencial (EMA) con factor de decaimiento 0.9999.

La selección de tokens de respuesta se realiza con un modo de poda de importancia de tokens (TIP) llamado token_tip_soft_or_topk, que retiene de forma determinista un 20% de los tokens de respuesta válidos. Se aplica además VisionZip como poda de tokens visuales, conservando únicamente un 10% de ellos. El entrenamiento se llevó a cabo sobre 10.240 muestras del dataset OpenMMReasoner-SFT-874K, con un lote global de 32 (4 GPUs, micro-batch 8), una tasa de aprendizaje de 2e-5, y rollouts generados de forma greedy con un máximo de 512 tokens nuevos. La resolución de imagen se fijó a 846.720 píxeles. El adaptador final se publica junto con metadatos de auditoría y un hash SHA-256 del adaptador.

## Capacidades

- Procesamiento multimodal de imagen y texto: el adaptador se carga sobre Qwen2.5-VL-7B-Instruct, un modelo para tareas de lenguaje visual.
- Razonamiento con cadena de pensamiento: el dataset de entrenamiento, OpenMMReasoner-SFT-874K, sugiere una orientación a tareas de razonamiento, aunque no se aportan métricas de validación.
- Inferencia eficiente con poda visual: VisionZip reduce los tokens visuales al 10%, lo que puede reducir la carga computacional en la entrada de imágenes.
- Compatibilidad con PEFT: el adaptador se carga con la librería PEFT sobre el modelo base mediante adapter_config.json y adapter_model.safetensors.
- Sin soporte documentado de tool calling o function calling: no se menciona en la información proporcionada.
- Sin soporte documentado de agentes o razonamiento multi-paso: no se menciona.
- Capacidades multilingües: no se especifican.

## Casos de uso

- Investigación en destilación multimodal: el adaptador sirve para comparar el objetivo de pérdida KL inversa frente a otras variantes de OPSD (por ejemplo, KL directa o JSD) dentro de la misma configuración.
- Compresión de tokens visuales en pipelines de visión: al retener solo el 10% de los tokens visuales con VisionZip, puede reducir el coste de inferencia en tareas que procesan imágenes de alta resolución, como OCR o descripción de imágenes.
- Razonamiento visual con cadena de pensamiento: al entrenarse sobre OpenMMReasoner-SFT-874K, resulta adecuado para experimentos que deseen inducir razonamiento explícito en preguntas visuales.
- Análisis de importancia de tokens (TIP): el adaptador ofrece un caso de uso para investigar cómo la selección del 20% de los tokens de respuesta afecta a la destilación y a la alineación del estudiante con el teacher.
- Verificación y reproducibilidad de experimentos: la publicación incluye metadatos de auditoría, hash SHA-256 y un registro de entrenamiento con métricas escalares, útil para la comunidad que desee verificar el proceso.
- Prototipado de ajuste fino eficiente con LoRA: se puede cargar el adaptador sobre Qwen2.5-VL-7B-Instruct con PEFT, lo que permite experimentar con un coste de almacenamiento reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se aportan puntuaciones de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información del repositorio. El adaptador no incluye los pesos del modelo base; como referencia orientativa, un modelo de 7B en FP16 requiere aproximadamente 14-16 GB de VRAM.
- GPU recomendadas: no disponible específicamente. Para el modelo base Qwen2.5-VL-7B-Instruct se recomiendan GPUs como A100, H100 o RTX 4090.
- Compatibilidad con GPU consumer: no hay datos del autor. Con cuantización a 4 bits u 8 bits es posible ejecutar el modelo base en GPUs de 8-12 GB, pero no se ha verificado en este adaptador.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI son compatibles con el modelo base, pero para usar este adaptador es necesario cargarlo con PEFT y aplicar el parche de VisionZip en tiempo de ejecución.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Objetivo de pérdida | Selección de tokens de respuesta | Retención visual | Muestras | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-VL-7B-OPSD-VisionZip-r010-TIP-Top20-ReverseKL-original10240 (este) | Reverse KL (KL(student || teacher)) | TIP Soft-OR Top-K, retiene 20% | VisionZip 10% | 10240 | no disponible |
| Qwen2.5-VL-7B-OPSD-VisionZip-r010-TIP-SoftOR-top20-forwardKL-balanced-10240 | Forward KL | TIP Soft-OR Top-K | VisionZip 10% | 10240 | no disponible |
| Qwen2.5-VL-7B-OPSD-VisionZip-r010-BudgetJSD-top20-original10240 | Budget JSD | Top-K 20% | VisionZip 10% | 10240 | no disponible |

Los tres modelos pertenecen a la misma familia de experimentos OPSD del mismo autor y comparten el modelo base, la retención visual y el número de muestras. No se dispone de resultados de benchmarks que permitan comparar su rendimiento.

## Limitaciones y advertencias

- No se han publicado evaluaciones de rendimiento ni benchmarks, por lo que se desconocen las capacidades reales del adaptador.
- El adaptador no incluye los pesos del modelo base; es necesario cargar Qwen2.5-VL-7B-Instruct por separado y utilizar la librería PEFT.
- La inferencia podada requiere el parche de VisionZip en tiempo de ejecución; sin él, el comportamiento del modelo puede diferir del esperado.
- No contiene estados de optimizador ni de EMA para reanudar el entrenamiento de forma exacta; solo se publica el adaptador final.
- La licencia no está especificada, lo que genera incertidumbre para cualquier uso comercial.
- El entrenamiento se realizó sobre un subconjunto de 10.240 muestras del dataset original, no sobre el conjunto completo, lo que puede limitar la generalización.
- No se han documentado sesgos, riesgos de alucinación ni limitaciones idiomáticas.
- La resolución de imagen fijada en 846.720 píxeles puede no ser compatible con otros tamaños de entrada, lo que afecta a la reproducibilidad si se cambia la configuración.

## Enlaces

- https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-TIP-Top20-ReverseKL-original10240
- https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-TIP-SoftOR-top20-forwardKL-balanced-10240
- https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-VisionZip-r010-BudgetJSD-top20-original10240
- https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct (modelo base)
