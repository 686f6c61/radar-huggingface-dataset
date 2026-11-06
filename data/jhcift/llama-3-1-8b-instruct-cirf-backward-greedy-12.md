# JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12

## Resumen

Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12 es un ajuste fino del modelo Meta Llama 3.1 8B Instruct desarrollado por el usuario JhCIFT, que implementa la metodología CIRF (functional tokens para razonamiento explícito). El modelo sustituye el razonamiento en lenguaje natural por una traza de tokens funcionales dedicados (`[sof]`, `[eof]`, `[f_0]` a `[f_511]`) que codifican operaciones intermedias, con un presupuesto máximo de 12 tokens de resultado explícitos por ejemplo de entrenamiento.

El modelo parte del checkpoint completo de la familia CIRF y aplica una selección backward-greedy de resultados con presupuesto de 12 tokens. El autor lo describe como el mejor diseño evaluado con ese presupuesto, aunque no se sitúa en la frontera de precisión/latencia del conjunto de pruebas. La actualización LoRA está fusionada en los pesos densos BF16 y los 514 tokens nuevos incluyen sus filas de embedding y de salida entrenadas, por lo que el modelo carga con Transformers estándar sin necesidad de PEFT ni del código CIRF.

Es relevante para investigadores interesados en razonamiento eficiente con tokens funcionales, en la comparación entre trazas de razonamiento explícitas y latentes, y en el estudio del compromiso entre precisión y latencia en modelos de 8B parámetros. El modelo solo soporta inglés y no incluye chat template.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1), con vocabulario extendido de 514 tokens funcionales CIRF |
| Parametros totales | 8.034.471.936 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct: 128k tokens, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (BF16, LoRA fusionada) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 8.034 millones de parametros basado en Llama 3.1 8B Instruct. La innovacion principal es la incorporacion de un vocabulario funcional de 514 tokens nuevos: `[sof]` (start of function trace), `[eof]` (end of function trace) y `[f_0]` a `[f_511]`, que actúan como operaciones atómicas de razonamiento. El modelo genera una traza de estos tokens funcionales, opcionalmente con valores de resultado asociados, seguida de `[eof]` y la respuesta final.

El entrenamiento parte del modelo CIRF completo y aplica una selección backward-greedy de resultados con un presupuesto de como máximo 12 tokens de resultado explícitos por ejemplo. La actualización LoRA resultante se fusiona en los pesos densos BF16, y las filas de embedding y de salida de los 514 tokens nuevos se incluyen entrenadas en el checkpoint exportado. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO más allá del ajuste supervisado. El repositorio incluye archivos de procedencia (`training_config.json`, `provenance.json`, `export_verification.json`) que registran la configuración de entrenamiento, los hashes del checkpoint origen y las comprobaciones de exportación.

## Capacidades

- Generacion de texto y razonamiento explicito mediante trazas de tokens funcionales CIRF.
- Razonamiento aritmetico y matematico de varios pasos (GSM8K, MultiArith, SVAMP, MATH-500).
- Razonamiento de sentido comun (CommonsenseQA, StrategyQA).
- Razonamiento logico y de paridad (Coin Flip).
- Generacion con decodificacion greedy determinista (el protocolo de evaluacion usa `do_sample=False`).
- Formato de prompt especifico sin chat template: `<|begin_of_text|>QUESTION[sof]`.
- Parada en el token EOS del tokenizer (no en `[eof]`), con decodificacion `skip_special_tokens=False` para preservar los limites de la traza.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Investigacion en razonamiento eficiente: el modelo permite estudiar como un presupuesto acotado de tokens funcionales (12 resultados explicitos) afecta a la precision frente a trazas en lenguaje natural, comparandolo con las variantes Full, Zero-Results y Backward-Greedy-3/6/18 de la misma familia.
- Evaluacion de metodologias CIRF: sirve como punto de referencia para reproducir los resultados publicados en GSM8K, MultiArith, SVAMP, CommonsenseQA y Coin Flip con el protocolo de `inference.py`.
- Razonamiento aritmetico de un solo paso o de pocos pasos: con 100% en MultiArith y 80% en SVAMP, es adecuado para tareas de aritmetica sencilla donde la latencia importa y la traza funcional acota la generacion.
- Analisis de latencia y precision: el autor lo situa fuera de la frontera precision/latencia, por lo que es util como caso de estudio del compromiso entre ambas métricas en modelos de 8B.
- Experimentos de vocabulario extendido: permite investigar el efecto de 514 tokens funcionales entrenados sobre el comportamiento del modelo base en tareas de razonamiento.
- Docencia y divulgacion: ilustra de forma concreta como se sustituye una cadena de pensamiento en lenguaje natural por una secuencia de operaciones simbolicas discretas.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, maximo 384 tokens nuevos y 32 tokens funcionales, puntuacion por exact-match):

| Test set | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 57,70% |
| MultiArith | 178 | 100,00% |
| SVAMP | 300 | 80,00% |
| CommonsenseQA | 1.221 | 79,77% |
| Coin Flip (corregido por paridad) | 3.333 | 75,46% |

Coin Flip se puntua contra la paridad de los lanzamientos indicados en la pregunta, ya que aproximadamente el 20% de las etiquetas del dataset no coinciden con ella. El autor indica que los resultados completos por dataset, incluyendo MATH-500, StrategyQA y latencia con batch 1, estan en `test_results.json`. No se proporcionan resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos (8.034 millones de parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomiendan 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 8-9 GB para pesos; en 4 bits, aproximadamente 4-5 GB (no se documentan cuantizaciones oficiales, por lo que habria que generarlas).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; GPUs consumer de 16 GB o mas para cuantizacion.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en BF16 y en GPUs de 16 GB con cuantizacion; en 8 GB solo con cuantizacion agresiva.
- Opciones de despliegue: Transformers (protocolo documentado con `AutoModelForCausalLM` y `inference.py`); compatible con text-generation-inference y endpoints compatibles segun los tags del repositorio. No se documenta soporte nativo de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor remite a `test_results.json` para la latencia con batch 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12 | 8.034 M | No disponible | 57,70% | Llama 3.1 Community | Hugging Face (0 descargas) |
| Llama-3.1-8B-Instruct-CIRF-Full | No disponible | No disponible | No disponible | Llama 3.1 Community | Hugging Face |
| Llama-3.1-8B-Instruct-CIRF-Zero-Results | No disponible | No disponible | No disponible | Llama 3.1 Community | Hugging Face |
| Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3/6/18 | No disponible | No disponible | No disponible | Llama 3.1 Community | Hugging Face |

Las variantes de la familia CIRF comparten el mismo modelo base y metodologia, diferenciandose en el presupuesto de tokens de resultado y en la estrategia de seleccion. No se dispone de datos de benchmarks de las variantes hermanas en la informacion proporcionada, por lo que no es posible comparar su rendimiento relativo.

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan capacidades multilingues.
- No utiliza chat template: el prompt debe seguir el formato exacto `<|begin_of_text|>QUESTION[sof]` y la decodificacion debe usar `skip_special_tokens=False`.
- La parada debe hacerse en el token EOS del tokenizer, no en `[eof]`; un manejo incorrecto trunca la respuesta final.
- El autor reconoce que el modelo no esta en la frontera de precision/latencia del conjunto de pruebas, por lo que existen variantes de la familia con mejor compromiso.
- Precision limitada en GSM8K (57,70%) en comparacion con modelos de razonamiento mas grandes o con cadenas de pensamiento en lenguaje natural.
- Coin Flip presenta un 20% de etiquetas del dataset que no coinciden con la paridad de la pregunta, lo que exige una correccion en la evaluacion y complica la comparacion directa con otros trabajos.
- Riesgo de alucinacion y sesgos heredados de Llama 3.1 8B Instruct, no evaluados ni mitigados de forma especifica en la informacion disponible.
- Licencia Llama 3.1 Community: restricciones de uso comercial, requisitos de atribucion y politica de uso aceptable de Meta; revisar `LICENSE` y `USE_POLICY.md`.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.
- No se documentan cuantizaciones oficiales ni soporte en motores de inferencia alternativos (llama.cpp, Ollama).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante CIRF-Full: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full
- Variante CIRF-Zero-Results: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results
- Variante CIRF-Backward-Greedy-3: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3
- Variante CIRF-Backward-Greedy-6: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6
- Variante CIRF-Backward-Greedy-18: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18
