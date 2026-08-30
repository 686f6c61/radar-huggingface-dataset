# enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-gap01-f-top10-bottom10-lambda04-10240

## Resumen

El modelo `enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-gap01-f-top10-bottom10-lambda04-10240` es un adaptador LoRA entrenado sobre el modelo multimodal `Qwen/Qwen2.5-VL-7B-Instruct`. Lo desarrolla el autor `enmingzhangzz` con el objetivo de reducir la carga computacional de los modelos de visión-lenguaje mediante la poda selectiva de tokens visuales. Combina dos técnicas: VisionZip, un método de compresión de tokens visuales publicado en CVPR 2025, y OPSD (Online Pruning with Self-Distillation, presumiblemente), que utiliza un profesor EMA para guiar el entrenamiento sin acceso a etiquetas reales.

El adaptador está diseñado para mantener la capacidad de razonamiento del modelo base mientras reduce drásticamente el número de tokens visuales procesados (ratio de retención del 10%). Esto permite acelerar la inferencia y reducir el uso de memoria en tareas de comprensión de imágenes y vídeo. Su relevancia radica en la creciente demanda de despliegue eficiente de modelos multimodales en entornos con recursos limitados.

La arquitectura subyacente es un transformer multimodal de 7 mil millones de parámetros con ventana de contexto amplia (heredada del modelo base), pero este adaptador solo modifica las proyecciones del decoder de lenguaje mediante LoRA de rango 16. El repositorio incluye el adaptador final, el estado de entrenamiento reanudable y metadatos de configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-VL-7B-Instruct (transformer multimodal) |
| Parametros totales | No disponible (adaptador LoRA de ~0,6 GB; el modelo base tiene 7B) |
| Parametros activos | No disponible (solo se modifican las proyecciones del decoder) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (el adaptador se entrega en BF16; el modelo base puede cuantizarse aparte) |
| Idiomas soportados | No disponibles (dependen del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (PEFT adapter) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen2.5-VL-7B-Instruct`, un modelo de lenguaje multimodal con arquitectura transformer que procesa texto e imágenes. La innovación principal reside en el método de poda de tokens visuales: se retiene solo el 10% de los tokens visuales generados por el codificador de visión, agrupándolos en dos conjuntos (top 10% y bottom 10% según una puntuación F) y combinándolos con pesos 0,4 y 0,6 respectivamente. Esto reduce la secuencia de entrada al decoder de lenguaje de forma significativa.

El entrenamiento utiliza un profesor EMA (decay 0,9999) que no tiene acceso a las etiquetas reales, una técnica de auto-destilación para estabilizar el aprendizaje. El dataset empleado son los primeros 10.240 ejemplos de OpenMMReasoner `llava_cot`, con una resolución de imagen fija de 846.720 píxeles. La configuración de LoRA es de rango 16 y alpha 32, aplicada únicamente a las proyecciones del decoder de lenguaje, con precisión BF16 y FlashAttention 2. El lote efectivo es de 32 muestras repartidas en 4 GPUs, con una tasa de aprendizaje de 2e-5 y sin weight decay.

El adaptador no incluye los parches de runtime de VisionZip/OPSD; estos deben proporcionarse desde el código de entrenamiento/evaluación correspondiente.

## Capacidades

- Comprensión de imágenes y texto: hereda las capacidades del modelo base Qwen2.5-VL-7B-Instruct, incluyendo respuesta a preguntas visuales, OCR y razonamiento sobre contenido gráfico.
- Razonamiento de cadena de pensamiento (CoT): entrenado sobre ejemplos de `llava_cot`, por lo que está optimizado para generar explicaciones paso a paso.
- Eficiencia computacional: reduce el número de tokens visuales al 10%, lo que acelera la inferencia y reduce el consumo de memoria.
- Compatibilidad con FlashAttention 2: aprovecha kernels optimizados para atención.
- Adaptabilidad: al ser un adaptador LoRA, puede combinarse con cuantizaciones del modelo base para despliegue en hardware limitado.
- No se especifican capacidades de tool calling, agentes o audio; estas dependen del modelo base y no están garantizadas por el adaptador.

## Casos de uso

- Análisis de imágenes médicas en dispositivos con recursos limitados: el adaptador reduce la carga de tokens visuales, permitiendo ejecutar el modelo en GPUs de gama media para clasificar radiografías o informes de patología.
- Automatización de documentos escaneados: puede extraer y razonar sobre texto e imágenes en facturas o formularios, manteniendo precisión mientras se reduce el coste de inferencia en entornos de producción.
- Asistentes de accesibilidad para personas con discapacidad visual: al ser más ligero, puede desplegarse en aplicaciones móviles o edge para describir escenas en tiempo real.
- Moderación de contenido visual: análisis de imágenes en redes sociales o plataformas de vídeo con alta frecuencia de peticiones, donde la reducción de tokens visuales mejora el throughput.
- Investigación en eficiencia de modelos multimodales: sirve como banco de pruebas para comparar estrategias de poda de tokens y destilación con profesor EMA.
- Generación de descripciones de vídeo: aunque no se especifica soporte de vídeo, la reducción de tokens visuales permite procesar más fotogramas por segundo en tareas de resumen de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o tareas de visión-lenguaje específicas. Se recomienda evaluar el adaptador frente al modelo base en tareas como VQAv2 o TextVQA para medir la pérdida de precisión debida a la poda.

## Requisitos de hardware

- VRAM estimada: el adaptador requiere cargar el modelo base Qwen2.5-VL-7B-Instruct. En BF16, el modelo base ocupa aproximadamente 14 GB de VRAM; con el adaptador LoRA, el incremento es marginal (~0,6 GB). Con cuantización a 4 bits (por ejemplo, bitsandbytes), la VRAM puede reducirse a unos 6-8 GB.
- GPU recomendadas: para inferencia en BF16 se necesitan GPUs con al menos 16 GB de VRAM (RTX 4090, A100 40GB, L4). Con cuantización 4 bits, una RTX 3060 de 12 GB o RTX 4070 pueden ser suficientes.
- Compatibilidad con consumer GPU: sí, si se aplica cuantización al modelo base y se usa el adaptador con PEFT.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte el modelo base a GGUF y se integra el adaptador), o Hugging Face Transformers con PEFT. El adaptador requiere los parches de VisionZip/OPSD del código de entrenamiento, por lo que el despliegue no es trivial sin ese runtime.
- Latencia y throughput: no se han publicado datos. La poda al 10% de tokens visuales debería reducir el tiempo de prefill significativamente en tareas con imágenes grandes, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores comparables dentro del mismo proyecto. Se puede comparar con el modelo base `Qwen2.5-VL-7B-Instruct` sin poda, que ofrece mayor precisión pero mayor coste computacional. También existe una variante del mismo autor con configuración diferente (`kl50-f20` en lugar de `f-top10-bottom10`), pero no se proporcionan resultados comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador no es autocontenido: requiere el modelo base Qwen2.5-VL-7B-Instruct y los parches de runtime de VisionZip/OPSD, que no se incluyen en el repositorio.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- No se han publicado benchmarks, por lo que se desconoce la pérdida exacta de precisión respecto al modelo base.
- El entrenamiento se realizó sobre un subconjunto fijo de 10.240 ejemplos de un solo dataset (OpenMMReasoner `llava_cot`), lo que puede limitar la generalización a otros dominios.
- El ratio de retención del 10% es agresivo; puede degradar el rendimiento en tareas que requieren detalles visuales finos (por ejemplo, OCR de texto pequeño).
- La configuración de agrupación top/bottom sin prefiltro KL puede introducir sesgos en la selección de tokens visuales.
- No se garantiza soporte para tool calling, agentes o funciones avanzadas del modelo base; el adaptador solo modifica las proyecciones del decoder.
- La fecha de creación (2026-08-29) sugiere que es un modelo reciente, pero no hay evidencia de validación externa.

## Enlaces

- [HuggingFace: enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-gap01-f-top10-bottom10-lambda04-10240](https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-gap01-f-top10-bottom10-lambda04-10240)
- [Variante con configuración KL50/F20 en HuggingFace](https://huggingface.co/enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-gap01-kl50-f20-lambda04-10240)
- [FriendliAI: despliegue del modelo](https://friendli.ai/models/enmingzhangzz/Qwen2.5-VL-7B-OPSD-official-VisionZip-r010-gap01-kl50-f20-lambda04-10240)
- [GitHub de VisionZip (JIA-Lab-research)](https://github.com/JIA-Lab-research/VisionZip/tree/main/Qwen2_5_VL)
- [GitHub de Qwen-VL (oficial)](https://github.com/QwenLM/Qwen-VL)
- [Modelo base Qwen/Qwen2.5-VL-7B-Instruct en HuggingFace](https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct)
