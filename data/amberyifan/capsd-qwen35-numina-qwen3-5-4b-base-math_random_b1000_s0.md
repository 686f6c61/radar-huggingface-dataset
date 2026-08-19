# AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_random_b1000_s0

## Resumen

Este modelo es un ajuste fino (fine-tune) completo de la base multimodal Qwen/Qwen3.5-4B-Base, realizado por el usuario AmberYifan con el framework LlamaFactory. El entrenamiento se ha llevado a cabo sobre un dataset denominado `capsd_Qwen3.5-4B-Base-n80000-numina__mix_math_random_b1000_s0`, lo que sugiere una orientación hacia tareas matemáticas y de razonamiento numérico. El modelo resultante conserva la arquitectura del base, un transformer multimodal de 4.539 millones de parámetros, y se distribuye en formato safetensors.

La relevancia de esta publicación radica en que Qwen3.5 es la nueva generación de modelos nativos de visión-lenguaje de Alibaba, con mejoras en razonamiento, codificación y capacidades de agente. Sin embargo, la ficha oficial es extremadamente escasa: no se proporcionan detalles sobre el dataset, los objetivos de entrenamiento, ni resultados de evaluación. El modelo parece ser un experimento de investigación más que un producto listo para producción, y su licencia genérica "other" añade incertidumbre sobre su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje), basado en Qwen3.5-4B-Base |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en FP32/FP16) |
| Idiomas soportados | No disponible (heredados del base, presumiblemente multilingüe) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tuning) de Qwen3.5-4B-Base, que a su vez es un modelo nativo de visión-lenguaje con fusión temprana de tokens multimodales. El entrenamiento se realizó con LlamaFactory, usando una tasa de aprendizaje de 1e-5, batch total de 64, optimizador AdamW y scheduler coseno con un warmup del 3% de los pasos. Se emplearon 4 GPUs en paralelo y una sola época. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, aunque el nombre sugiere una mezcla de datos matemáticos aleatorios con un subconjunto de 80.000 muestras. Tampoco se indica si se aplicaron técnicas como RLHF o DPO; el proceso parece ser un fine-tuning supervisado estándar.

## Capacidades

- Generación de texto y razonamiento: al derivar de Qwen3.5-4B-Base, conserva las capacidades lingüísticas y de razonamiento del modelo original, aunque no hay evidencia de que el fine-tuning las haya mejorado específicamente.
- Comprensión de imágenes: el modelo base es multimodal (image-text-to-text), por lo que puede procesar entradas visuales junto con texto, aunque no se ha verificado que el fine-tuning mantenga esta capacidad.
- Razonamiento matemático: el nombre del dataset sugiere un enfoque en problemas matemáticos, pero no se han publicado resultados que lo confirmen.
- Tool calling y agentes: no hay información disponible sobre si el fine-tuning ha preservado o mejorado estas capacidades del base.
- Multilingüismo: no se documenta, aunque el base Qwen3.5 suele ser multilingüe.
- Modo thinking: no se menciona.

## Casos de uso

- Investigación académica en fine-tuning: sirve como ejemplo de cómo ajustar Qwen3.5-4B-Base con LlamaFactory para experimentos controlados, dado que se documentan los hiperparámetros.
- Prototipado de asistentes matemáticos: podría emplearse como punto de partida para un sistema de resolución de problemas numéricos, aunque requiere validación adicional.
- Evaluación de la transferencia de capacidades: útil para estudiar cómo el fine-tuning en datos matemáticos afecta al rendimiento general del modelo base.
- Generación de datos sintéticos: podría usarse para crear ejemplos de razonamiento matemático, siempre que se verifique su calidad.
- Integración en pipelines de RAG: al ser un modelo pequeño (4B), puede desplegarse en entornos con recursos limitados para tareas de recuperación aumentada con contexto matemático.
- Fine-tuning posterior: al estar disponible en safetensors, puede servir como base para nuevos ajustes con datasets específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección `model-index` de la model card está vacía, y no hay datos de MMLU, HumanEval, GSM8K u otras pruebas estándar. Por tanto, no es posible comparar su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539 millones de parámetros, en FP16 se necesitan aproximadamente 9 GB de VRAM. Con cuantización de 4 bits (por ejemplo, GPTQ o AWQ) se puede reducir a unos 2,5-3 GB, y con 8 bits a unos 5 GB.
- GPU recomendadas: una RTX 3090, RTX 4090 o A10G (24 GB) es suficiente para FP16; GPUs con 8-12 GB (RTX 3080, RTX 4070) pueden usar cuantización.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de gama media-alta con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, así como Transformers con `device_map="auto"`.
- Latencia y throughput: no hay datos publicados; para un modelo de 4B en una RTX 4090 se puede esperar una latencia de decodificación de 20-40 ms/token y un throughput de 50-100 tokens/s, pero son estimaciones generales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tune) | 4.54B | No disponible | other | Sí (base) | HuggingFace |
| Qwen3-4B (base) | 4.02B | 32K (típico) | Apache 2.0 | No (solo texto) | HuggingFace, Ollama |
| Qwen3.5-397B-A17B | 397B (17B activos) | No disponible | Apache 2.0 (presumible) | Sí | HuggingFace, Qwen.ai |

La comparación es limitada porque no hay datos de rendimiento del fine-tune. El modelo base Qwen3.5-4B-Base no está aún en el catálogo público de HuggingFace (solo se referencia en el blog), por lo que no se puede comparar directamente. La principal diferencia con Qwen3-4B es la naturaleza multimodal y la posible mejora en razonamiento y agentes de la serie 3.5.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe el dataset, los objetivos de entrenamiento ni los resultados, lo que dificulta evaluar su idoneidad para cualquier tarea.
- Licencia "other": no se especifican los términos exactos; el uso comercial puede estar restringido o requerir permisos adicionales.
- Riesgo de alucinación: al ser un modelo pequeño y sin evaluación publicada, es probable que presente alucinaciones en tareas complejas, especialmente en matemáticas.
- Sesgos desconocidos: no se ha realizado ningún análisis de sesgos; el dataset de entrenamiento podría introducir sesgos no documentados.
- Capacidades multimodales no verificadas: aunque el base es multimodal, no se ha confirmado que el fine-tuning preserve la calidad de procesamiento de imágenes.
- Sin garantías de producción: al ser un experimento de investigación, no se recomienda su uso en entornos críticos sin una validación exhaustiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmberYifan/capsd-qwen35-numina-Qwen3.5-4B-Base-math_random_b1000_s0
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub de Qwen3.5 (no oficial): https://github.com/ABDtmx/Qwen3.5
- Página de Qwen3.5:4b en Ollama: https://ollama.com/library/qwen3.5:4b
- Modelo base Qwen3-4B en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B
