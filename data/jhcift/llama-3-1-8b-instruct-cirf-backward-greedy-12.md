# JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12

## Resumen

Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12 es un fine-tune del modelo meta-llama/Llama-3.1-8B-Instruct desarrollado por el usuario JhCIFT. El modelo aplica la técnica CIRF (functional tokens para razonamiento explícito), en la que el modelo genera una traza de tokens funcionales (`[f_0]` a `[f_511]`) delimitada por `[sof]` y `[eof]` antes de emitir la respuesta final. Esta variante concreta, "Backward-Greedy-12", se construye a partir del modelo de resultado completo tras una selección backward-greedy de resultados con un presupuesto máximo de 12 tokens de resultado explícitos por ejemplo de entrenamiento.

El modelo mantiene la arquitectura transformer densa de Llama 3.1 8B (8.034.471.936 parámetros), pero incorpora 514 tokens nuevos en el vocabulario (`[sof]`, `[eof]` y `[f_0]`…`[f_511]`) con sus filas de embedding y de salida entrenadas. La actualización LoRA se ha fusionado en los pesos BF16 densos, de modo que el modelo se carga con Transformers estándar sin necesidad de PEFT, del checkpoint base ni de código CIRF adicional.

Es relevante porque propone un mecanismo de razonamiento estructurado alternativo al chain-of-thought en lenguaje natural: la traza se compone de tokens funcionales discretos, lo que permite un control explícito del presupuesto de razonamiento y un parseo determinista de la salida. El modelo está orientado exclusivamente a inglés y su licencia es la Llama 3.1 Community License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1 8B) con vocabulario extendido de tokens funcionales CIRF |
| Parametros totales | 8.034.471.936 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del base Llama 3.1 8B, no confirmada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.1 8B Instruct, un transformer decoder-only denso, y le añade 514 tokens especiales: `[sof]` (start of function trace), `[eof]` (end of function trace) y 512 tokens funcionales `[f_0]` a `[f_511]`. El entrenamiento se realiza mediante una adaptación supervisada con LoRA que posteriormente se fusiona en los pesos BF16 densos, incluyendo las filas de embedding y de salida correspondientes a los tokens nuevos. El resultado es un checkpoint autónomo que carga con `AutoModelForCausalLM` sin dependencias adicionales.

La variante "Backward-Greedy-12" se obtiene tras una selección backward-greedy de resultados sobre el modelo de resultado completo, con un presupuesto de como máximo 12 tokens de resultado explícitos por ejemplo de entrenamiento. Según la model card, la selección final se realizó después de evaluar 91 diseños candidatos; los pesos publicados inicialmente (diseño `c_llama_1d3c7342176a`, semilla 2, seleccionado cuando se habían probado 56 de 91 diseños) siguen disponibles en la revisión `118894b`. No se detalla en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en inglés con traza de razonamiento estructurada mediante tokens funcionales (`[sof]` … `[eof]`).
- Razonamiento aritmético y de sentido común: evaluación en GSM8K, MultiArith, SVAMP, CommonsenseQA y Coin Flip.
- Emisión de valores de resultado intermedios opcionales dentro de la traza funcional (hasta 12 tokens de resultado por ejemplo en esta variante).
- Control explícito del presupuesto de razonamiento: la evaluación limita cada traza a 32 tokens funcionales, forzando `[eof]` al alcanzar el límite.
- Decodificación greedy determinista con parada en el token EOS del tokenizer.
- Parseo determinista de la salida: la respuesta final se extrae como el texto posterior a `[eof]`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito en la información proporcionada.
- Capacidad multilingüe: limitada a inglés según el campo `language` de la model card.

## Casos de uso

- Evaluación de razonamiento aritmético controlado: el modelo permite fijar un presupuesto máximo de tokens funcionales (por ejemplo, 12 o 32), lo que facilita experimentos reproducibles sobre el efecto de la longitud del razonamiento en la precisión.
- Investigación en mecanismos de razonamiento discreto: sirve como banco de pruebas para comparar trazas de tokens funcionales frente a chain-of-thought en lenguaje natural, con parseo determinista de la traza.
- Extracción estructurada de trazas para análisis: al delimitar la traza con `[sof]` y `[eof]`, se puede separar programáticamente el razonamiento de la respuesta final en pipelines de evaluación automática.
- Reproducción de benchmarks: el repositorio incluye `inference.py` y `test_results.json`, lo que permite replicar las métricas publicadas (GSM8K, MultiArith, SVAMP, CommonsenseQA, Coin Flip) con solo Torch y Transformers.
- Estudio comparativo de variantes CIRF: la familia incluye versiones Full, Zero-Results y Backward-Greedy con presupuestos 3, 6, 12, 18 y 24, lo que permite analizar el compromiso entre presupuesto de resultado y precisión.
- Despliegue en entornos con Transformers estándar: al estar la LoRA fusionada y los tokens incluidos en el checkpoint, se puede servir con `text-generation-inference` (tag `endpoints_compatible`) sin código CIRF adicional.
- Base para fine-tuning posterior: al ser un checkpoint denso BF16 estándar, puede servir como punto de partida para adaptaciones adicionales con PEFT o entrenamiento completo.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificación greedy, máximo 384 tokens nuevos y 32 tokens funcionales, exact-match):

| Test set | Preguntas | Precisión |
|---|---:|---:|
| GSM8K | 1.319 | 57,24% |
| MultiArith | 178 | 98,88% |
| SVAMP | 300 | 81,00% |
| CommonsenseQA | 1.221 | 79,85% |
| Coin Flip (corregido por paridad) | 3.333 | 84,37% |

Notas: Coin Flip se puntúa contra la paridad de los lanzamientos indicados en la pregunta, porque aproximadamente el 20% de las etiquetas del dataset no coinciden con ella. La model card indica que los resultados completos por dataset, incluyendo MATH-500, StrategyQA y latencia con batch 1, están en `test_results.json`. No se proporcionan resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos (8.034 millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda al menos 20-24 GB para contextos moderados.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16; GPUs con 16 GB requerirían cuantización, que no se documenta en la información proporcionada.
- Cabe en GPU consumer de gama alta: RTX 4090 (24 GB) en BF16; en GPUs de 16 GB no está confirmado sin cuantización.
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), `text-generation-inference` (tag `endpoints_compatible`); no se documentan variantes GGUF, llama.cpp, Ollama ni vLLM en la información proporcionada.
- Latencia y throughput: la model card menciona latencia con batch 1 en `test_results.json`, pero no se incluyen los valores numéricos en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12 | 8.034 M | no disponible | llama3.1 | Hugging Face (233 descargas) | Fine-tune CIRF con 514 tokens funcionales; solo inglés |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8.030 M | no disponible en la información | llama3.1 | Hugging Face (oficial Meta) | Modelo base sin tokens funcionales; multilingüe |
| Llama-3.1-8B-Instruct-CIRF-Full | no disponible | no disponible | llama3.1 | Hugging Face (JhCIFT) | Variante CIRF de resultado completo |
| Llama-3.1-8B-Instruct-CIRF-Zero-Results | no disponible | no disponible | llama3.1 | Hugging Face (JhCIFT) | Variante CIRF sin tokens de resultado |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés (`language: en`); no se garantiza un rendimiento adecuado en otros idiomas.
- No usa chat template: el formato de prompt es `QUESTION[sof]` precedido del token BOS; un uso incorrecto del formato degrada la salida.
- Es necesario decodificar con `skip_special_tokens=False` y parar en EOS (no en `[eof]`) para preservar los delimitadores de la traza.
- La evaluación limita las trazas a 32 tokens funcionales; sin ese límite, el comportamiento puede diferir del reportado.
- Riesgo de alucinación inherente a los modelos de 8B; no se documentan evaluaciones de factualidad ni de seguridad.
- Sesgos: no se documenta ningún análisis de sesgos en la información proporcionada.
- Licencia Llama 3.1 Community License: impone restricciones de uso (incluida la política de uso aceptable en `USE_POLICY.md`) y obligaciones de atribución; revisar antes de uso comercial.
- El modelo es un fine-tune de un tercero (JhCIFT) con 233 descargas y 0 likes; no hay evidencia de validación independiente.
- Existen múltiples revisiones de pesos (la inicial en `118894b` y la actualizada el 2026-11-08); conviene fijar la revisión en producción para reproducibilidad.
- No se documentan cuantizaciones oficiales, por lo que el despliegue en hardware limitado requiere cuantizar por cuenta propia, con riesgo de degradar la precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12
- Revisión inicial de pesos: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12/tree/118894bc445b988caa5bbb601b0d63bbb5087be0
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante Full: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full
- Variante Zero-Results: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results
- Variante Backward-Greedy-3: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3
- Variante Backward-Greedy-6: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6
- Variante Backward-Greedy-18: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18
- Variante Backward-Greedy-24: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-24
