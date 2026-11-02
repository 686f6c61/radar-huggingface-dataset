# JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-24

## Resumen

CIRF-Qwen3-8B-Instruct-Backward-Greedy-24 es un ajuste fino del modelo Qwen3-8B desarrollado por el usuario JhCIFT dentro de la línea experimental CIRF (siglas que el autor no expande en la model card). El modelo parte de los pesos densos de Qwen3-8B en BF16 y aplica una adaptación supervisada mediante LoRA que posteriormente se fusiona en los pesos, incorporando además un vocabulario nuevo de 514 tokens funcionales (`[sof]`, `[eof]` y `[f_0]` a `[f_511]`) con sus filas de embedding y de salida ya entrenadas. El resultado es un checkpoint autónomo que se carga con Transformers estándar, sin necesidad de PEFT, del checkpoint base ni de código auxiliar.

El modelo está diseñado para generar trazas de razonamiento compuestas por tokens funcionales, con valores de resultado opcionales, antes de emitir la respuesta final. La variante "Backward-Greedy-24" se obtiene tras un proceso de selección de resultados con un presupuesto máximo de 24 tokens de resultado explícitos por ejemplo de entrenamiento, partiendo del modelo Full. Resuelve, por tanto, el problema de estructurar el razonamiento en un espacio de tokens discreto y acotado, en lugar de dejar que el modelo genere texto libre de cadena de pensamiento.

Con 8.192.758.784 parámetros y un repositorio de 16,4 GB en safetensors, se posiciona como un modelo de 8B manejable en hardware de consumo con cuantización. Su relevancia es acotada: se trata de un experimento de investigación con cero descargas y cero likes en el momento de la consulta, orientado a estudiar dinámicas de razonamiento con tokens funcionales más que a un uso productivo general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B), sin mezcla de expertos |
| Parametros totales | 8.192.758.784 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-8B, valor no confirmado en la model card) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; al ser pesos safetensors BF16 es convertible a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer denso de 8.192 millones de parámetros. Sobre esa base, el autor introduce dos modificaciones: un vocabulario extendido de 514 tokens funcionales con embeddings y filas de salida entrenados, y una actualización LoRA fusionada en los pesos densos BF16. El prompt de entrada sigue el formato `QUESTION[sof]`, sin plantilla de chat, y el modelo emite una traza de tokens funcionales con valores de resultado opcionales, seguida de `[eof]` y la respuesta final, deteniéndose en el token EOS del tokenizador.

El entrenamiento parte del modelo CIRF-Qwen3-8B-Instruct-Full y aplica una selección "backward-greedy" de resultados con un presupuesto máximo de 24 tokens de resultado explícitos por ejemplo. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card remite a `training_config.json` y `provenance.json` para los ajustes de entrenamiento y los hashes del checkpoint de origen. La innovación principal es el uso de un espacio discreto de tokens funcionales para estructurar el razonamiento, con control explícito del presupuesto de resultados.

## Capacidades

- Generación de texto y razonamiento estructurado mediante trazas de tokens funcionales (`[f_0]` a `[f_511]`) delimitadas por `[sof]` y `[eof]`.
- Razonamiento aritmético y de sentido común, evaluado en GSM8K, MultiArith, SVAMP, CommonsenseQA y Coin Flip.
- Control del presupuesto de resultados: la variante 24 limita los tokens de resultado explícitos por ejemplo, lo que permite trazas más compactas que la variante Full.
- Decodificación greedy determinista, adecuada para reproducibilidad en evaluación.
- Capacidad de cargarse con Transformers estándar sin PEFT ni código CIRF, gracias a la fusión de la LoRA y a la inclusión de las filas de embedding y salida.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el formato de traza funcional es afín a razonamiento multi-paso, pero no se declara soporte de agentes.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: modo de razonamiento con tokens funcionales; sin visión ni audio.

## Casos de uso

- Investigación sobre razonamiento con tokens discretos: el modelo permite estudiar cómo un espacio acotado de tokens funcionales estructura el razonamiento frente a la cadena de pensamiento en texto libre, comparando las variantes 3, 6, 12, 18 y 24 del presupuesto de resultados.
- Evaluación reproducible de aritmética: con decodificación greedy y presupuesto fijo de tokens funcionales, sirve como banco de pruebas determinista en GSM8K, MultiArith y SVAMP para comparar protocolos de evaluación.
- Análisis de eficiencia de trazas: la variante 24 permite medir el compromiso entre precisión y longitud de traza frente a la variante Full, útil para estudiar latencia y coste de inferencia.
- Prototipado de pipelines de razonamiento acotado: en entornos donde se quiere limitar el número de pasos intermedios explícitos, el formato `[sof]`/`[eof]` con presupuesto fijo facilita el control del coste por consulta.
- Docencia y experimentación con vocabularios extendidos: el checkpoint autocontenido permite reproducir el flujo de carga y decodificación con `skip_special_tokens=False` sin dependencias adicionales, adecuado para prácticas sobre tokenizadores y embeddings personalizados.
- Estudio de sesgos en datasets de razonamiento: la corrección de paridad en Coin Flip (aproximadamente el 20% de las etiquetas discrepan de la paridad declarada) convierte al modelo en una herramienta para analizar la calidad de las etiquetas en benchmarks de razonamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificación greedy, máximo de 384 tokens nuevos y 32 tokens funcionales, con puntuación de coincidencia exacta de respuesta:

| Test set | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 70,43% |
| MultiArith | 178 | 99,44% |
| SVAMP | 300 | 84,33% |
| CommonsenseQA | 1.221 | 83,29% |
| Coin Flip (corregido por paridad) | 3.333 | 95,14% |

El autor indica que los resultados completos por dataset, incluidos MATH-500, StrategyQA y la latencia con batch 1, están en `test_results.json`. No se proporcionan en la información disponible resultados comparativos con otros modelos en esos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB; en 4 bits: en torno a 5-6 GB (estimaciones a partir del tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para BF16 sin compromisos; RTX 4090 (24 GB) para BF16 ajustado; RTX 3090 (24 GB) y RTX 4080 (16 GB) viables con cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en BF16 con margen limitado, y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: Transformers (soporte declarado, con `text-generation-inference` y `endpoints_compatible` en los tags); vLLM, llama.cpp, Ollama y TGI no están confirmados explícitamente, aunque al ser pesos safetensors estándar son convertibles.
- Latencia y throughput: no disponibles en la información proporcionada; el autor remite a `test_results.json` para la latencia con batch 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIRF-Qwen3-8B-Instruct-Backward-Greedy-24 | 8,19 B (denso) | No disponible | GSM8K 70,43%; MultiArith 99,44%; SVAMP 84,33%; CommonsenseQA 83,29%; Coin Flip 95,14% | Apache 2.0 | HuggingFace (0 descargas) |
| CIRF-Qwen3-8B-Instruct-Full | 8,19 B (denso) | No disponible | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace (variante del mismo autor) |
| CIRF-Qwen3-8B-Instruct-Zero-Results | 8,19 B (denso) | No disponible | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace (variante del mismo autor) |
| Qwen/Qwen3-8B (base) | 8,19 B (denso) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache 2.0 | HuggingFace |

Las alternativas de la misma categoría (otros modelos de 8B de razonamiento) no se detallan en la información proporcionada; la comparación se limita a las variantes CIRF del mismo autor y al modelo base.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.
- El formato de prompt no usa plantilla de chat: es obligatorio el sufijo `[sof]` y decodificar con `skip_special_tokens=False`; detenerse en `[eof]` en lugar de en EOS produce trazas incompletas.
- La evaluación impone un límite de 32 tokens funcionales forzando `[eof]` al alcanzarlo; sin ese límite el comportamiento puede diferir del reportado.
- Solo se declara inglés; no hay soporte multilingüe documentado.
- La corrección por paridad en Coin Flip indica que aproximadamente el 20% de las etiquetas del dataset discrepan de la paridad declarada en la pregunta; los resultados sobre ese dataset deben interpretarse con cautela.
- Riesgo de alucinación en razonamiento aritmético y de sentido común no cuantificado en la información disponible; GSM8K al 70,43% deja un margen de error considerable.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; sin embargo, el carácter experimental y la ausencia de validación desaconsejan su uso en producción sin evaluación propia.
- No se publican cuantizaciones oficiales; cualquier conversión a GGUF, AWQ o GPTQ corre a cargo del usuario y puede degradar el comportamiento de los tokens funcionales.
- No hay información sobre sesgos demográficos, de género o culturales del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-24
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Variante Full: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Full
- Variante Zero-Results: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Zero-Results
- Variante Backward-Greedy-3: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-3
- Variante Backward-Greedy-6: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-6
- Variante Backward-Greedy-12: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-12
- Variante Backward-Greedy-18: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-18
