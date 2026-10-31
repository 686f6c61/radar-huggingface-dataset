# diablomike20/LFM3-VL-2B-Heretic-GGUF

## Resumen

LFM3-VL-2B-Heretic-GGUF es una versión "abliterated" (sin comportamiento de rechazo) del modelo multimodal LFM3-VL-2B de LiquidAI, publicada por el usuario diablomike20 en Hugging Face. La modificación se realizó con la herramienta Heretic mediante ablación direccional sobre los pesos, sin necesidad de fine-tuning, eliminando la conducta de negativa del modelo manteniendo intactos el encoder de visión y el proyector.

El modelo base pertenece a la familia LFM (Liquid Foundation Models) de LiquidAI, con aproximadamente 1,73 mil millones de parámetros y capacidades de imagen-texto a texto (image-text-to-text). La versión original incorpora un modo de razonamiento ("thinking") que genera respuestas más elaboradas a costa de consumir tokens adicionales, por lo que se recomienda una ventana de contexto de al menos 8K tokens.

Esta variante es relevante porque demuestra que la ablación direccional puede reducir la tasa de rechazo del 96% al 7% (con thinking activado) y del 93% al 0% (sin thinking) en JailbreakBench, con una divergencia KL muy baja respecto al modelo original (0,037 en el primer token y 0,015 en respuestas completas). Se distribuye en formato GGUF, lo que permite su ejecución local con llama.cpp en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LFM3-VL) con encoder de visión y proyector; detalles internos no disponibles |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | No es MoE; todos los parámetros están activos |
| Longitud de contexto | No disponible (se recomienda al menos 8K tokens por el modo de razonamiento) |
| Tipos de cuantizacion | Q6_K (con imatrix y embeddings de tokens en Q8_0) y BF16 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (lfm1.0, tipo "other") |
| Formato de pesos | GGUF (también existe el modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo es una derivada directa de LiquidAI/LFM3-VL-2B, un modelo multimodal de la familia LFM3-VL que combina un modelo de lenguaje con un encoder de visión y un proyector para tareas de imagen-texto a texto. En esta versión abliterated, el encoder de visión y el proyector se mantienen sin modificar; solo se alteraron 31 de los 424 tensores del modelo de lenguaje: las proyecciones de salida de atención y convolución en las capas 5-23, y las proyecciones down de los MLP en las capas 12-23.

La técnica empleada no es un fine-tuning sino ablación direccional, ejecutada con Heretic 1.4.0 durante 300 trials (seed 42). El trial final se seleccionó entre 10 candidatos Pareto-óptimos tras una evaluación en datos reservados (held-out). El GGUF se construyó a partir de la conversión BF16 oficial de LiquidAI, sustituyendo únicamente los tensores modificados. No hay datos publicados sobre el entrenamiento original del modelo base (número de tokens, composición del dataset o uso de RLHF/DPO).

La cuantización Q6_K incluida en el repositorio es de alta calidad: utiliza una importance matrix calculada sobre 661.000 tokens de datos mixtos (texto, código y chat), con los embeddings de tokens mantenidos en Q8_0. Según el autor, esta receta reduce la KLD media un 24% respecto a la receta Q6_K por defecto, con una concordancia de token superior del 97,9% frente a BF16 y un cambio de perplejidad de solo +0,2%.

## Capacidades

- Generación de texto conversacional con razonamiento previo a la respuesta (modo "thinking"), que puede activarse o desactivarse.
- Comprensión de imágenes y generación de texto a partir de entrada visual (pipeline image-text-to-text), gracias al encoder de visión y proyector originales sin modificar.
- Respuesta sin rechazos: el comportamiento de negativa fue eliminado mediante ablación direccional, generando contenido que el modelo original se negaría a producir.
- Ejecución local mediante llama.cpp (llama-server) con soporte de plantillas Jinja (`--jinja`).
- Soporte de tool calling y capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Chatbot local sin filtros para investigación en alineación: permite estudiar cómo se comporta un modelo sin mecanismos de rechazo, útil para red-teaming y análisis de seguridad, dado que la tasa de rechazo en prompts benignos baja del 18% al 2%.
- Descripción y análisis de imágenes en local: al conservar intactos el encoder de visión y el proyector, puede usarse para tareas de VQA (preguntas y respuestas sobre imágenes) en estaciones de trabajo sin GPU de gama alta.
- Prototipado de aplicaciones multimodales en edge: con solo 1,49 GB en Q6_K, cabe en portátiles y mini-PC, permitiendo desarrollar aplicaciones de visión y lenguaje sin depender de APIs externas.
- Investigación sobre técnicas de ablación: el repositorio documenta con detalle qué tensores se modificaron y las métricas de divergencia, lo que lo hace útil como referencia reproducible (Heretic 1.4.0, 300 trials, seed 42) para estudios de modificación de pesos.
- Servidor de inferencia local multiusuario: mediante `llama-server` con el mmproj separado, se puede montar un endpoint OpenAI-compatible en hardware modesto para pruebas internas.
- Evaluación comparativa de cuantizaciones: la inclusión de archivos BF16 y Q6_K con métricas de KLD publicadas permite verificar el impacto real de la cuantización en un modelo pequeño multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica evaluaciones propias de tasa de rechazo y de divergencia:

### Tasa de rechazo

| Prompt set | Original | Este modelo |
|---|---|---|
| Harmful, thinking activado (JailbreakBench, n=100) | 96% | 7% |
| Harmful, thinking desactivado (JailbreakBench + LLM-LAT, n=200) | 93% | 0% |
| Harmless (JailbreakBench benign, n=100) | 18% | 2% |

### Divergencia respecto al original

| Metrica | Valor |
|---|---|
| KL divergence, primer token (métrica Heretic) | 0,037 |
| KL divergence, respuestas completas | 0,015 |

### Calidad de la cuantizacion Q6_K frente a BF16

| Metrica | Valor |
|---|---|
| KLD media | 0,0026 |
| Concordancia de token superior | 97,9% |
| Cambio de perplejidad | +0,2% |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,5-2 GB para la versión Q6_K (1,49 GB de pesos más el proyector de visión de 379 MB y la KV cache) y unos 3,5-4,5 GB para la versión BF16 (3,47 GB de pesos). Conviene reservar al menos 8K tokens de contexto por el modo de razonamiento.
- GPU recomendadas: cualquier GPU moderna con 4 GB de VRAM o más (RTX 3060, RTX 4060 o superiores) ejecuta la versión Q6_K con holgura. También es viable la ejecución solo en CPU dada la cuantización.
- Consumer GPUs: sí, cabe con facilidad en GPUs de consumo de gama media e incluso en portátiles; la variante BF16 también cabe en la mayoría de GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp (llama-server con `--mmproj` y `--jinja`, método documentado por el autor). Ollama, LM Studio y vLLM no se mencionan en la model card; al ser GGUF, es razonable esperar compatibilidad con herramientas basadas en llama.cpp, aunque no está confirmado.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Caracteristica distintiva |
|---|---|---|---|---|---|
| LFM3-VL-2B-Heretic-GGUF | ~1,73 B | No disponible (recomendado >=8K) | GGUF (Q6_K, BF16) | LFM Open License v1.0 | Multimodal sin rechazos (abliterated) |
| LiquidAI/LFM3-VL-2B (base) | ~1,73 B | No disponible | Safetensors | LFM Open License v1.0 | Multimodal original con comportamiento de seguridad |
| Qwen2.5-VL-3B-Instruct | ~3 B | Hasta 128K (según version) | Safetensors, GGUF comunitarios | Apache 2.0 (con restricciones Qwen) | Multimodal con amplio ecosistema |

Nota: no hay datos de benchmarks estandarizados que permitan comparar rendimiento numérico entre estos modelos en la información disponible.

## Limitaciones y advertencias

- El modelo genera contenido que el modelo original rechaza; el usuario es responsable del uso que haga de él, tal como advierte explícitamente el autor.
- Con thinking activado, el modelo aún declina un pequeño porcentaje de peticiones harmful (7% en JailbreakBench).
- Riesgo de alucinación: no hay datos publicados; al tratarse de un modelo de ~1,7 B de parámetros, debe asumirse un riesgo elevado frente a modelos mayores, especialmente en tareas de razonamiento y conocimiento factual.
- La ablación elimina el comportamiento de rechazo pero no añade capacidades: la calidad base es la del modelo original de 2B.
- Restricción de licencia: la LFM Open License v1.0 solo permite uso comercial a entidades con ingresos anuales inferiores a 10 millones de USD; por encima de ese umbral, se requiere acuerdo con LiquidAI.
- Longitud de contexto no especificada en el repositorio; se recomienda al menos 8K tokens porque el modelo razona antes de responder.
- La model card no documenta idiomas soportados, soporte de tool calling ni benchmarks estandarizados, lo que dificulta evaluar su idoneidad para producción sin pruebas propias.
- Al tratarse de un repositorio comunitario con pocas descargas (315) y un solo like, no ha recibido auditoría comunitaria amplia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/diablomike20/LFM3-VL-2B-Heretic-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Herramienta Heretic (GitHub): https://github.com/p-e-w/heretic
- Licencia LFM Open License v1.0: disponible en el repositorio (LICENSE)
