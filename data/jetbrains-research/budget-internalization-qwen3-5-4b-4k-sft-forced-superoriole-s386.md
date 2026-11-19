# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-sft-forced-superoriole-s386

## Resumen

El modelo `budget-internalization-qwen3.5-4b-4k-sft-forced-superoriole-s386` es un ajuste fino supervisado (SFT) desarrollado por JetBrains-Research sobre el modelo base Qwen/Qwen3.5-4B. Se trata de un modelo multimodal de tipo image-text-to-text orientado al razonamiento matemático, entrenado específicamente para internalizar un presupuesto fijo de tokens de razonamiento (4.000 tokens) en lugar de depender del escalado en tiempo de inferencia. El modelo forma parte de la investigación presentada en el artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

La relevancia de este modelo radica en su enfoque metodológico: en lugar de generar cadenas de razonamiento de longitud variable y potencialmente muy larga, el ajuste enseña al modelo a producir respuestas correctas dentro de un presupuesto acotado de tokens, lo que reduce costes de inferencia y latencia. El entrenamiento se realizó mediante rejection-sampling finetuning (RFT) sobre soluciones autogeneradas y filtradas por corrección del propio Qwen3.5-4B al conjunto de problemas matemáticos DeepScaleR.

Con 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones) y pesos en BF16, el modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial e investigación. El checkpoint publicado corresponde al paso 386 de entrenamiento del run denominado `superoriole`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-4B; detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como ventana de inferencia; longitud máxima de secuencia en entrenamiento: 18.432 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal capaz de procesar entradas de imagen y texto (pipeline image-text-to-text). Sobre esta base se aplicó un ajuste fino supervisado con pérdida de next-token sobre las respuestas, sin que la model card detalle innovaciones arquitectónicas adicionales más allá de las heredadas del modelo base.

Los datos de entrenamiento son autogenerados por el propio Qwen3.5-4B: soluciones a problemas del dataset `agentica-org/DeepScaleR-Preview-Dataset`, filtradas por corrección y restringidas al subconjunto `4k-forced`, es decir, respuestas generadas con un presupuesto de 4.000 tokens cuya respuesta final se produjo mediante answering forzado. Se aceptaron varias soluciones por problema. La configuración de entrenamiento incluye longitud máxima de secuencia de 18.432 tokens, lotes de 32 secuencias, optimizador Adam con schedule coseno y LR pico de 5e-06, una época y 386 pasos. El prompt de entrenamiento pide razonar paso a paso y emitir la respuesta dentro de etiquetas `\boxed{}`.

## Capacidades

- Generación de texto y razonamiento paso a paso orientado a problemas matemáticos.
- Resolución de problemas de matemáticas con respuesta final formateada en `\boxed{}`.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text heredado del modelo base).
- Razonamiento con presupuesto de tokens internalizado: el modelo está entrenado para producir respuestas dentro de un límite de aproximadamente 4.000 tokens.
- Conversacional: soporta el template de chat del modelo base Qwen3.5-4B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Resolución automatizada de problemas matemáticos con coste acotado: el modelo genera cadenas de razonamiento dentro de un presupuesto de 4.000 tokens, lo que permite estimar con precisión el coste por consulta en pipelines de evaluación o tutoría matemática.
- Evaluación de investigación sobre budget internalization: sirve como checkpoint de referencia para reproducir y comparar los resultados del artículo sobre presupuestos fijos de razonamiento frente a escalado en test-time.
- Generación de datos sintéticos de matemáticas: al producir soluciones paso a paso con respuesta en `\boxed{}`, puede emplearse para crear datasets de razonamiento verificables por respuesta final.
- Tutoría educativa con latencia controlada: la cota de tokens reduce la latencia máxima de respuesta, adecuada para interfaces interactivas de resolución de ejercicios.
- Integración en pipelines de transformers: al publicarse en safetensors y con `library_name: transformers`, se puede cargar directamente con la API de Hugging Face para experimentos de investigación.
- Benchmarking de razonamiento matemático: útil para medir la degradación o mejora de precisión al restringir el presupuesto de razonamiento en modelos de ~4B parámetros.
- Experimentos multimodales: al heredar el pipeline image-text-to-text del modelo base, puede emplearse en tareas que combinen imágenes y problemas textuales, aunque no se documenta un ajuste específico para ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4,54B parámetros × 2 bytes), más memoria para activaciones y KV cache; en la práctica se recomienda al menos 16-24 GB para contextos largos.
- Cuantización a 8 bits: pesos en torno a 4,5 GB; a 4 bits: en torno a 2,3 GB, aunque no se documentan cuantizaciones oficiales publicadas.
- GPU recomendadas: A100 (40/80 GB) o H100 para contextos largos y lotes grandes; RTX 4090 (24 GB) viable en BF16 para inferencia con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 y en GPUs con 16 GB si se recurre a cuantización; en GPUs de 8-12 GB requeriría cuantización agresiva.
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-4k-sft-forced-superoriole-s386 | 4,54B | Entrenamiento hasta 18.432 tokens; ventana de inferencia no disponible | SFT con presupuesto fijo de 4k tokens para matemáticas | Apache 2.0 | Hugging Face (JetBrains-Research) |
| Qwen/Qwen3.5-4B (base) | ~4B | No disponible en la información proporcionada | Modelo multimodal base sin ajuste de presupuesto | Según modelo base (no confirmada aquí) | Hugging Face (Qwen) |
| Alternativas de razonamiento matemático de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento numérico con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint de un run experimental (paso 386, una época) sin benchmarks publicados; su rendimiento real en producción no está validado.
- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B, puede heredar los sesgos del modelo base y de los datos autogenerados.
- Riesgo de alucinación: presente como en cualquier modelo generativo; el filtrado por corrección en entrenamiento reduce pero no elimina respuestas incorrectas.
- Limitación de presupuesto: está entrenado para responder dentro de ~4.000 tokens; forzar presupuestos muy distintos puede degradar la precisión.
- Idiomas: no se documentan los idiomas soportados; el prompt de entrenamiento está en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se hereda la licencia del modelo base Qwen/Qwen3.5-4B, que debe verificarse.
- Caveat de producción: la model card incluye una sección de citación marcada como "TODO" y no documenta tool calling, agentes ni cuantizaciones oficiales; conviene validar el comportamiento antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-sft-forced-superoriole-s386
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Artículo referenciado: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (enlace no disponible en la información proporcionada)
