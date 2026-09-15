# batmac/gradient-ai-text-detector-4bit

## Resumen

`batmac/gradient-ai-text-detector-4bit` es una cuantización de 4 bits (NF4 de bitsandbytes, solo pesos) del clasificador binario `ShantanuT01/gradient-ai-text-detector`, un modelo DeBERTa (los tags del repositorio indican `deberta-v2`, mientras que la model card describe un DeBERTa-v3-large) con 435.062.785 parámetros que devuelve P(AI), la probabilidad de que un texto haya sido generado por un modelo de lenguaje. El repositorio lo publica el usuario batmac y es estrictamente un derivado de empaquetado: no hay reentrenamiento, ajuste fino ni calibración, y todo el crédito del modelo pertenece a su autor original, Shantanu Thorat.

El problema que resuelve es doble. Por un lado, ofrece detección de texto generado por IA con un consumo de memoria residente de ~648 MB frente a los ~1.660 MB del modelo original en fp32, lo que permite ejecutarlo en máquinas sin GPU dedicada (CPU o Apple Silicon MPS). Por otro, sirve como caso práctico de cuantización selectiva: 145 capas `torch.nn.Linear` se cuantizan, mientras que la cabeza de clasificación, los embeddings y las LayerNorm se mantienen en fp32 para garantizar que un único checkpoint cargue tanto en Linux CPU como en MPS.

Es relevante ahora porque la detección de texto sintético se ha convertido en una necesidad operativa (filtrado de corpus, moderación, verificación de originalidad) y porque este checkpoint demuestra que una pérdida de precisión mínima (cambio absoluto medio de P(AI) de 0,020 y cero cambios de veredicto en el umbral 0,5 sobre 16 prompts) es compatible con una reducción de memoria de aproximadamente un 60 % respecto a fp32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DeBERTa para clasificación de secuencias (los tags indican `deberta-v2`; la model card indica DeBERTa-v3-large) |
| Parámetros totales | 435.062.785 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la familia DeBERTa suele limitarse a 512 tokens) |
| Tipos de cuantización | NF4 de bitsandbytes, solo pesos (weight-only), dtype de cómputo float32, doble cuantización desactivada; 145 capas `Linear` cuantizadas (atención, dense, pooler), cabeza de clasificación, embeddings y LayerNorm en fp32 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT (heredada del modelo original) |
| Formato de pesos | safetensors |
| Pipeline | `text-classification` |
| Modelo base | `ShantanuT01/gradient-ai-text-detector` (relación: `quantized`) |
| Tamaño del checkpoint | ~699 MB (el original fp32: ~1,74 GB) |
| Memoria residente | ~648 MB (el original fp32: ~1.660 MB) |
| Tamaño del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-14 / 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer DeBERTa con cabeza de clasificación binaria sobre la representación del token `[CLS]`; la salida es un único logit que se transforma en P(AI) mediante `torch.sigmoid`. El checkpoint cuantizado conserva 145 capas `Linear` en NF4 weight-only y deja fuera de la cuantización la cabeza de clasificación, los embeddings y las LayerNorm. El motivo es técnico: la cabeza es una matriz `[1, 1024]` y el kernel empaquetado de bitsandbytes para CPU exige que la dimensión de salida de cada capa cuantizada sea divisible por el tamaño de bloque, condición que 1 no cumple; cuantizarla funciona en MPS de Apple Silicon pero lanza `AssertionError: N must be divisible by block_n` en CPU Linux, de modo que se mantiene en fp32 para producir un checkpoint cargable en todas las plataformas.

No se realizó ningún entrenamiento, ajuste fino ni calibración en este repositorio: es una derivación de empaquetado del modelo original, cuya model card sigue siendo la fuente autoritativa sobre datos de entrenamiento y evaluación. La referencia citada por el autor original es Thorat, Shantanu, «Team DACTYL at PAN 2026: Bayesian Data Mixing and Empirical X-risk Minimization for AI-text Detection», *Working Notes of CLEF*, 2026, trabajo del que procede presumiblemente el ajuste del clasificador. El detalle de composición del dataset, número de tokens, uso de RLHF/DPO y cualquier innovación de decodificación no está disponible en la información proporcionada.

## Capacidades

- Clasificación binaria de texto: devuelve P(AI) como probabilidad de que el texto sea generado por un modelo de lenguaje.
- Detección de texto sintético en inglés, con especial sensibilidad a registros «de manual» (el ejemplo de la model card usa una frase típica de texto corporativo generado).
- Ejecución en tres backends: CUDA (bitsandbytes), CPU y Apple Silicon MPS.
- Carga directa con `AutoModelForSequenceClassification` y `AutoTokenizer` de transformers, sin necesidad de pasar un `BitsAndBytesConfig` porque los ajustes de cuantización están en `config.json`.
- Compatibilidad declarada con `text-embeddings-inference` y con endpoints (`endpoints_compatible` según los tags).
- No genera texto, no razona de forma multi-paso, no soporta tool calling ni function calling, no tiene modo «thinking», ni capacidades de visión o audio.
- No dispone de soporte multilingüe: está etiquetado únicamente como inglés.

## Casos de uso

- Filtrado de corpus de entrenamiento: antes de incorporar un dataset a un pipeline de preentrenamiento o ajuste fino, se puntúa cada documento con P(AI) y se descartan o marcan los que superan un umbral, reduciendo la contaminación por texto sintético. La inferencia en CPU a ~648 MB permite ejecutarlo en el mismo nodo de preprocesado, sin reservar GPU.
- Moderación de contenido en plataformas de publicación: integrado como señal auxiliar en el flujo de revisión de artículos, comentarios o envíos, marcando textos para revisión humana en lugar de aplicar sanciones automáticas.
- Señal auxiliar en flujos editoriales y periodísticos: verificación de originalidad de colaboraciones externas, donde el detector aporta una probabilidad que el editor pondera junto a otras pruebas.
- Aplicaciones de escritorio y herramientas locales sin GPU: al requerir ~648 MB de memoria residente y funcionar en CPU y MPS, cabe en portátiles convencionales y en entornos de escritorio donde no hay acelerador dedicado.
- Auditoría de datasets ya publicados: analizar la proporción de texto sintético en un corpus existente para documentar su procedencia o detectar cambios de distribución.
- Control de calidad de salidas de un LLM: en un pipeline que debe producir texto humano revisado, usar el detector como comprobación de que no se ha colado contenido generado sin marcar.
- Investigación sobre detección y cuantización: el repositorio incluye `scripts/quantize.py`, `scripts/bench_quant.py` y `scripts/eval_quant.py` para reproducir el checkpoint y medir deriva de puntuaciones y estabilidad de veredicto frente a fp32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos son las mediciones de impacto de la cuantización y de velocidad/memoria realizadas por el autor del repositorio.

Impacto en la precisión, medido contra los pesos fp32 del modelo original sobre 16 prompts que van de texto claramente humano a claramente generado por IA:

| Métrica | Valor |
|---|---|
| Cambio absoluto medio en P(AI) | 0,020 |
| Cambio absoluto máximo en P(AI) | 0,076 |
| Cambios de veredicto con umbral de decisión 0,5 | 0 |

Velocidad y memoria en un Apple M4 con 32 GB de memoria unificada (torch 2.14, bitsandbytes 0.50.2), 8 secuencias de ~150 tokens:

| Configuración | Memoria residente | Tiempo por lote |
|---|---|---|
| fp32, MPS | 1.660 MB | 0,40 s |
| bf16, MPS | 830 MB | 0,61 s |
| NF4 4-bit, MPS | 648 MB | 0,15 s |
| NF4 4-bit, CPU | 648 MB | 0,68 s |

Throughput derivado de esas mismas medidas (1.200 tokens por lote): aproximadamente 8.000 tokens/s en NF4 sobre MPS, 1.765 tokens/s en NF4 sobre CPU, 3.000 tokens/s en fp32 sobre MPS y 1.967 tokens/s en bf16 sobre MPS. El autor señala explícitamente que la ventaja es de memoria más que de latencia, y que en entradas cortas el throughput de 4 bits es comparable al de fp32.

## Requisitos de hardware

- VRAM/memoria: ~648 MB de memoria residente en 4 bits, frente a ~830 MB en bf16 y ~1.660 MB en fp32. El checkpoint ocupa ~699 MB y el repositorio completo 1,4 GB.
- Cabe en GPU de consumo: sí, con margen amplio en cualquier GPU con backend soportado por bitsandbytes (CUDA); también funciona sin GPU en CPU y en Apple Silicon vía MPS.
- Backends de inferencia: transformers con bitsandbytes y accelerate es la vía documentada y probada. Los tags declaran compatibilidad con `text-embeddings-inference` y con endpoints. No hay confirmación en la información proporcionada sobre soporte en vLLM, TGI, Ollama o llama.cpp, ni sobre existencia de pesos GGUF.
- Latencia medida: 0,15 s por lote de 8 secuencias de ~150 tokens en NF4/MPS y 0,68 s en NF4/CPU; fp32/MPS tarda 0,40 s y bf16/MPS 0,61 s en el mismo lote.
- Consideración de despliegue: al mantener la cabeza de clasificación en fp32, el mismo checkpoint carga en Linux CPU y en MPS sin reconfiguración.

## Comparativa con modelos similares

La información proporcionada no incluye resultados de otros detectores de texto generado por IA, de modo que la comparación se limita a las variantes del mismo modelo medidas por el autor del repositorio.

| Modelo | Parámetros | Precisión de pesos | Memoria residente | Tiempo por lote (8 × ~150 tokens) | Licencia |
|---|---|---|---|---|---|
| `batmac/gradient-ai-text-detector-4bit` | 435.062.785 | NF4 4-bit (solo pesos) | 648 MB | 0,15 s (MPS) / 0,68 s (CPU) | MIT |
| `ShantanuT01/gradient-ai-text-detector` (original) | 435.062.785 | fp32 | 1.660 MB | 0,40 s (MPS) | MIT |
| Versión bf16 del mismo modelo | 435.062.785 | bf16 | 830 MB | 0,61 s (MPS) | MIT |

Comparativa con detectores alternativos de terceros: no disponible en la información proporcionada.

## Limitaciones y advertencias

- La model card original advierte contra usar el detector como base única de decisiones de alto impacto, como sanciones académicas o acciones laborales, dadas sus tasas de falsos positivos y falsos negativos.
- Precisión degradada sobre distribuciones de texto distintas a las del entrenamiento; el propio autor original lo señala.
- La cuantización añade un pequeño error adicional: el cambio absoluto medio en P(AI) es 0,020 y el máximo 0,076, con las mayores desviaciones concentradas en textos limítrofes. Las diferencias por debajo de aproximadamente 0,08 deben tratarse como ruido.
- Si se necesita reproducir exactamente la puntuación del modelo original, hay que usar los pesos fp32, no este checkpoint.
- Idioma: solo inglés. Cualquier uso en castellano u otros idiomas queda fuera de las capacidades declaradas.
- Longitud de contexto no documentada en la información disponible; la familia DeBERTa suele limitar la entrada a 512 tokens, lo que restringe el análisis de documentos largos a estrategias de fragmentación.
- Dependencia obligatoria de bitsandbytes y accelerate, y de un backend soportado (CUDA, CPU o Apple Silicon MPS). Cuantizar la cabeza de clasificación provoca un `AssertionError` en CPU Linux, motivo por el que se mantiene en fp32.
- Licencia MIT, heredada del modelo original: permite uso comercial, pero al ser un derivado de empaquetado conviene conservar la atribución al autor original (Shantanu Thorat / ShantanuT01).
- Tracción comunitaria nula hasta la fecha: 0 descargas y 0 likes, sin validación independiente publicada.
- No apto para tareas generativas: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/batmac/gradient-ai-text-detector-4bit
- Modelo base original: https://huggingface.co/ShantanuT01/gradient-ai-text-detector
- Scripts de reproducción del repositorio: https://huggingface.co/batmac/gradient-ai-text-detector-4bit/blob/main/scripts/README.md
- Referencia citada por el autor original: Thorat, Shantanu, «Team DACTYL at PAN 2026: Bayesian Data Mixing and Empirical X-risk Minimization for AI-text Detection», *Working Notes of CLEF*, 2026 (sin URL proporcionada)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a páginas sobre test de velocidad de Internet en Sudáfrica (MyBroadband), sin relación con el modelo.
