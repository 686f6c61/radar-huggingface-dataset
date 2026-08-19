# AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_ppl_b1000_s0

## Resumen

El modelo `capsd-qwen35-numina-Qwen3.5-4B-Base-math_ppl_b1000_s0` es un ajuste fino (fine-tuning completo) del modelo base `Qwen/Qwen3.5-4B-Base`, desarrollado por el usuario AmberYifan. Está especializado en tareas matemáticas, como sugiere el nombre del dataset de entrenamiento (`capsd_Qwen3.5-4B-Base-n80000-numina__mix_math_ppl_b1000_s0`), aunque no se han publicado resultados de evaluación que lo confirmen. Con aproximadamente 4,54 mil millones de parámetros, se trata de un modelo de tamaño medio que puede ejecutarse en hardware de consumo con cuantización.

La relevancia de este modelo radica en su especialización matemática sobre una base reciente de la familia Qwen 3.5, lo que podría ofrecer mejoras en razonamiento numérico y resolución de problemas frente al modelo base. Sin embargo, al carecer de documentación detallada y benchmarks publicados, su utilidad práctica queda sujeta a verificación empírica. El entrenamiento se realizó con la librería `llama-factory` y el pipeline declarado es `image-text-to-text`, aunque no hay evidencia de capacidades multimodales reales en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B-Base, sin detalles adicionales) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo con pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar términos concretos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) del modelo base `Qwen/Qwen3.5-4B-Base`, realizado con la herramienta `llama-factory`. La arquitectura subyacente corresponde a la del modelo base, un transformer decoder-only de 4,54 mil millones de parámetros, aunque no se proporcionan detalles sobre número de capas, dimensiones ocultas o mecanismos de atención específicos. El entrenamiento se llevó a cabo sobre un dataset denominado `capsd_Qwen3.5-4B-Base-n80000-numina__mix_math_ppl_b1000_s0`, del que no se ofrece composición ni tamaño exacto, aunque el nombre sugiere una mezcla de datos matemáticos con un subconjunto de 80.000 ejemplos y un criterio de selección basado en perplexidad (`ppl_b1000_s0`).

Los hiperparámetros de entrenamiento son: learning rate de 1e-5, batch size de entrenamiento de 2 (con acumulación de gradientes de 8 pasos, resultando en un batch efectivo de 64), batch size de evaluación de 8, optimizador AdamW con betas (0.9, 0.999), scheduler de learning rate coseno con warmup del 3% de los pasos, y una sola época. El entrenamiento se realizó en 4 GPUs en paralelo. No se mencionan innovaciones técnicas como decodificación especulativa, atención lineal o técnicas de alineación (RLHF/DPO).

## Capacidades

- Generación de texto: al ser un fine-tune de un modelo base de lenguaje, puede generar texto coherente en tareas de lenguaje natural.
- Razonamiento matemático: el entrenamiento específico en datos matemáticos sugiere una mejora potencial en resolución de problemas aritméticos, algebraicos y de razonamiento cuantitativo, aunque no hay benchmarks que lo confirmen.
- Conversación: el tag `conversational` indica que puede usarse en diálogos multi-turno, aunque no se especifican detalles de formato.
- Capacidades multimodales: el pipeline declarado es `image-text-to-text`, pero no hay evidencia en la model card de que el modelo procese imágenes; probablemente sea un error de etiquetado o una herencia del modelo base.
- Tool calling / function calling: no se menciona soporte explícito.
- Agentes y multi-step reasoning: no se menciona soporte específico.
- Multilingüismo: no se indica qué idiomas soporta, aunque el modelo base Qwen suele ser multilingüe; sin confirmación, se considera no disponible.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el modelo puede emplearse para generar soluciones paso a paso a ejercicios de álgebra, cálculo o estadística, aprovechando su fine-tuning en datos matemáticos. Su tamaño de 4B permite ejecutarlo en GPUs de consumo, facilitando su integración en plataformas de tutoría.
- Generación de explicaciones didácticas: puede redactar explicaciones claras de conceptos matemáticos para materiales de estudio, adaptando el nivel de detalle según la petición del usuario.
- Asistente de cálculo para ingeniería: en contextos de prototipado rápido, puede ayudar a verificar fórmulas o realizar cálculos simbólicos sencillos, aunque no sustituye a herramientas especializadas.
- Preprocesamiento de datos numéricos: puede extraer información cuantitativa de texto y estructurarla, útil en tareas de minería de datos o análisis de informes.
- Chatbot especializado en STEM: combinado con un framework de agentes, puede responder preguntas de ciencia y tecnología con énfasis en la parte matemática, siempre que se valide su precisión.
- Fine-tuning adicional: al ser un modelo abierto (licencia `other`, aunque sin términos claros), puede servir como punto de partida para ajustes posteriores en dominios específicos que requieran razonamiento numérico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` de la model card contiene una entrada vacía, y no hay datos de MMLU, GSM8K, HumanEval ni otras evaluaciones estándar. Por tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 mil millones de parámetros, en FP16 se requieren aproximadamente 9 GB de VRAM; con cuantización INT8, unos 4,5 GB; con INT4, unos 2,5 GB. Estas cifras son estimaciones orientativas basadas en el tamaño del modelo, no en mediciones oficiales.
- GPU recomendadas: para FP16, una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, A10, L4). Con cuantización INT4, puede ejecutarse en GPUs con 4-6 GB (RTX 3050, RTX 2060, etc.). Para despliegue en servidores, A100/H100 ofrecen margen amplio.
- Compatibilidad con GPU de consumo: sí, especialmente con cuantización. Modelos de 4B son viables en tarjetas como RTX 3090 o RTX 4090 incluso en FP16.
- Opciones de despliegue: al ser un modelo de la familia transformers, es compatible con vLLM, llama.cpp, Ollama, TGI y el pipeline estándar de HuggingFace. No se han probado específicamente, pero la arquitectura base lo permite.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 4B en una GPU moderna, se espera una generación de decenas de tokens por segundo en FP16, y mayor con cuantización, pero estos valores son estimaciones generales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con alternativas. A modo de referencia estructural, se compara con el modelo base y otros modelos de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-4B-Base (base) | 4,54B | no disponible | Apache 2.0 (probablemente) | HuggingFace |
| Este fine-tune | 4,54B | no disponible | other (sin especificar) | HuggingFace |
| Llama-3.2-3B | 3,21B | 128K | Llama 3.2 Community License | HuggingFace |
| Phi-3.5-mini | 3,82B | 128K | MIT | HuggingFace |

La comparación es estructural, no de rendimiento, ya que no hay benchmarks publicados para este modelo. Su ventaja potencial reside en la especialización matemática, pero no puede cuantificarse sin evaluaciones.

## Limitaciones y advertencias

- Falta de documentación: la model card es genérica y no describe capacidades, limitaciones ni datos de entrenamiento en detalle.
- Sin benchmarks publicados: no hay evidencia objetiva de que el fine-tuning mejore el rendimiento matemático respecto al modelo base.
- Licencia incierta: la licencia `other` no especifica términos; podría restringir el uso comercial o la redistribución. Es imprescindible contactar con el autor antes de usarlo en producción.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en cálculos complejos. Se recomienda verificación humana.
- Sesgos potenciales: al no conocer la composición del dataset, no se pueden descartar sesgos en los datos de entrenamiento.
- Capacidades multimodales no confirmadas: el pipeline `image-text-to-text` sugiere soporte de visión, pero no hay evidencia en la documentación; asumir que solo procesa texto.
- Sin soporte de herramientas: no se indica soporte de tool calling, lo que limita su uso en agentes autónomos sin integraciones externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_ppl_b1000_s0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
