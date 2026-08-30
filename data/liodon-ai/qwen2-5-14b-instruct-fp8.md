# liodon-ai/Qwen2.5-14B-Instruct-FP8

## Resumen

El modelo `liodon-ai/Qwen2.5-14B-Instruct-FP8` es una cuantización en precisión FP8 (punto flotante de 8 bits) del modelo original `Qwen/Qwen2.5-14B-Instruct`, publicada por Liodon AI. El objetivo es reducir el tamaño en memoria y acelerar la inferencia en GPUs modernas que soportan FP8 de forma nativa, manteniendo una calidad cercana a la del modelo original. El esquema empleado es `FP8_DYNAMIC`: los pesos se convierten a FP8 (E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente por token en tiempo de inferencia, sin necesidad de dataset de calibración. Esto evita sesgos de calibración y simplifica el proceso de cuantización.

El modelo resultante ocupa 16,3 GB (frente a los 29,5 GB del original) y conserva los 14.770 millones de parámetros y la ventana de contexto de 128K tokens del modelo base. Está pensado para su despliegue en entornos de producción con vLLM, TGI o SGLang, y requiere hardware NVIDIA con compute capability ≥ 8.9 (arquitecturas Ada, Hopper o Blackwell) para aprovechar la aceleración FP8. Es una opción relevante para equipos que necesitan ejecutar un LLM de 14B en una sola GPU con memoria limitada sin sacrificar demasiada precisión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) con atención por ventanas deslizantes y RoPE (modelo base Qwen2.5) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128K tokens (según modelo base) |
| Tipos de cuantizacion | FP8 (E4M3) dinámico, pesos cuantizados por canal, activaciones dinámicas por token |
| Idiomas soportados | No especificado en la model card; el modelo base Qwen2.5 soporta multilingüe (inglés, chino, español, francés, alemán, etc.) |
| Licencia | other (consultar licencia del modelo base Qwen/Qwen2.5-14B-Instruct) |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

Este modelo no ha sido entrenado desde cero, sino que es una cuantización post-entrenamiento del modelo `Qwen/Qwen2.5-14B-Instruct`. El modelo base es un transformer decoder-only con 14.770 millones de parámetros, entrenado por Alibaba sobre un corpus de hasta 18 billones de tokens. Incorpora mecanismos como atención con ventanas deslizantes (de 128K tokens) y embeddings rotatorios (RoPE), y ha sido ajustado con instrucciones y preferencias humanas.

La cuantización FP8 se realizó con la librería `llm-compressor` del proyecto vLLM, usando el esquema `FP8_DYNAMIC`. Los pesos se convierten a FP8 (E4M3) por canal de forma estática, mientras que las activaciones se cuantizan dinámicamente en cada token durante la inferencia. Este esquema no requiere dataset de calibración, lo que evita cualquier sesgo introducido por los datos de calibración. La capa `lm_head` se deja sin cuantizar, práctica habitual por su pequeño tamaño y su impacto desproporcionado en la calidad si se cuantizara.

## Capacidades

- Generación de texto conversacional y de larga forma, con instrucciones complejas.
- Razonamiento lógico y matemático de nivel medio-alto (heredado del modelo base).
- Generación de código en múltiples lenguajes (Python, Java, C++, etc.) y comprensión de snippets.
- Soporte de tool calling / function calling (el modelo base soporta invocación de herramientas).
- Capacidades multilingües: el modelo base maneja más de 29 idiomas, incluyendo español, inglés, chino, francés, alemán, etc.
- Manejo de contexto largo de hasta 128K tokens, útil para documentos extensos o conversaciones multi-turno.
- No incluye capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- **Despliegue en producción con vLLM**: gracias a su formato FP8, el modelo puede servirse con `vllm serve liodon-ai/Qwen2.5-14B-Instruct-FP8`, reduciendo el uso de VRAM y aumentando el throughput en GPUs como H100 o RTX 4090.
- **Asistentes conversacionales**: su capacidad de seguir instrucciones y mantener contexto largo (128K tokens) lo hace adecuado para chatbots con historiales extensos.
- **Generación de código en entornos CI/CD**: soporta tool calling, por lo que puede integrarse en pipelines de revisión de código, generación de tests o autocompletado en IDEs.
- **Análisis de documentos largos**: la ventana de 128K permite procesar libros, informes o contratos completos en una sola pasada, sin necesidad de chunking complejo.
- **Traducción y procesamiento multilingüe**: al heredar las capacidades multilingües de Qwen2.5, puede usarse para traducción automática, resumen o generación de contenido en varios idiomas.
- **Razonamiento y resolución de problemas**: para aplicaciones de asistencia técnica, tutoría o análisis de datos, donde se requiere razonamiento paso a paso y salida estructurada.
- **Fine-tuning posterior**: aunque es una cuantización, los pesos FP8 pueden servir como punto de partida para fine-tuning con técnicas como LoRA, reduciendo costes de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización FP8 en la información disponible. El modelo base `Qwen2.5-14B-Instruct` reporta, según la documentación oficial de Qwen, puntuaciones destacadas en MMLU (≈80), HumanEval (≈84,2) y GSM8K (≈86,5), pero estos datos corresponden al modelo original sin cuantizar y no se han verificado para esta versión FP8. Se recomienda evaluar el modelo cuantizado en las tareas objetivo antes de su uso en producción.

## Requisitos de hardware

- **VRAM estimada**: los pesos ocupan 16,3 GB en FP8. Con overhead de activaciones y KV cache, se recomienda al menos 20 GB de VRAM para inferencia con contexto moderado. Para contexto de 128K, se necesitará más memoria.
- **GPUs compatibles**: NVIDIA con compute capability ≥ 8.9 (RTX 40-series, L4/L40S, H100/H200, B100/B200, GB10). En GPUs más antiguas (por ejemplo, RTX 30-series), el modelo se dequantizará y no se obtendrá beneficio de velocidad ni memoria.
- **Opciones de despliegue**: vLLM (recomendado), Text Generation Inference (TGI) mediante Docker, y SGLang. También puede cargarse con Transformers, aunque sin las optimizaciones de FP8.
- **Latencia y throughput**: no hay datos publicados. En vLLM con una H100, un modelo de 14B en FP8 suele alcanzar decenas de tokens por segundo, pero depende del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Tamaño |
|---|---|---|---|---|---|
| Qwen2.5-14B-Instruct (original) | 14,77B | 128K | BF16 | other | ~29,5 GB |
| liodon-ai/Qwen2.5-14B-Instruct-FP8 (este) | 14,77B | 128K | FP8 dinámico | other | 16,3 GB |
| liodon-ai/Qwen2.5-14B-Instruct-imatrix-GGUF | 14,77B | 128K | GGUF (varias) | other | variable según cuantización (típicamente 8-16 GB) |

La principal diferencia entre el modelo original y esta versión FP8 es el tamaño y la velocidad: FP8 reduce la huella de memoria en un 45% y puede acelerar la inferencia en hardware compatible. Frente a una cuantización GGUF (como la publicada por el mismo autor), FP8 ofrece mejor calidad y soporte nativo en vLLM/TGI, mientras que GGUF es más adecuado para ejecución en CPU o GPUs antiguas mediante llama.cpp/Ollama.

## Limitaciones y advertencias

- **Requisito de hardware**: sin una GPU con soporte FP8 nativo (compute capability ≥ 8.9), el modelo se ejecuta dequantizado, perdiendo las ventajas de memoria y velocidad.
- **Degradación potencial**: aunque la cuantización FP8 dinámica suele causar pérdidas mínimas, puede haber ligeras variaciones en tareas de alta precisión (matemáticas, código complejo) respecto al modelo original.
- **Licencia**: la licencia "other" corresponde a la del modelo base Qwen2.5, que permite uso comercial pero con restricciones (consultar términos de Qwen). No se debe asumir que es Apache 2.0.
- **Sesgos y alucinaciones**: como cualquier LLM, puede generar contenido falso o sesgado. No se han realizado evaluaciones específicas de sesgo para esta cuantización.
- **Sin benchmarks publicados**: no hay evidencia independiente del rendimiento de esta versión cuantizada; se recomienda validar en casos de uso concretos.
- **Contexto largo**: aunque soporta 128K tokens, el uso de ventanas muy largas incrementa el consumo de memoria y puede degradar la calidad si no se gestiona adecuadamente.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/liodon-ai/Qwen2.5-14B-Instruct-FP8)
- [Modelo base Qwen2.5-14B-Instruct](https://huggingface.co/Qwen/Qwen2.5-14B-Instruct)
- [Web de Liodon AI](https://liodon.ai/)
- [llm-compressor (herramienta de cuantización)](https://github.com/vllm-project/llm-compressor)
- [Página del modelo base en Ollama](https://ollama.com/library/qwen2.5:14b-instruct)
