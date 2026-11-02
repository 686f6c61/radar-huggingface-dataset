# JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-6

## Resumen

CIRF-Qwen3-8B-Instruct-Backward-Greedy-6 es un ajuste fino del modelo Qwen3-8B de Alibaba, publicado por el usuario JhCIFT en HuggingFace. El modelo implementa el esquema CIRF (functional-token reasoning), una variante de razonamiento explicito en la que el modelo genera una traza de tokens funcionales (`[f_0]` a `[f_511]`) entre marcadores `[sof]` y `[eof]`, seguida de la respuesta final. La variante "Backward-Greedy-6" se obtiene tras una seleccion backward-greedy de resultados con un presupuesto maximo de 6 tokens de resultado explicitos por ejemplo de entrenamiento.

El modelo parte de Qwen3-8B (8.192.758.784 parametros, transformer denso) y aplica una actualizacion LoRA que se fusiona en los pesos BF16, anadiendo 514 tokens nuevos al vocabulario con sus filas de embedding y de salida entrenadas. El checkpoint resultante se carga con Transformers estandar, sin necesidad de PEFT ni del codigo CIRF. El repositorio ocupa 16,4 GB en safetensors.

Su relevancia es experimental: explora una forma alternativa de razonamiento estructurado basada en tokens funcionales discretos en lugar de cadenas de texto libre, y publica resultados por dataset (GSM8K, MultiArith, SVAMP, CommonsenseQA, Coin Flip) junto con artefactos de reproducibilidad (`test_results.json`, `training_config.json`, `provenance.json`, `export_verification.json`). No obstante, el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y su rendimiento en GSM8K (52,62%) esta muy por debajo de lo esperable en Qwen3-8B con razonamiento convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con vocabulario extendido de tokens funcionales CIRF |
| Parametros totales | 8.192.758.784 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer denso Qwen3-8B. Sobre la base se anaden 514 tokens especiales: `[sof]` (start of function trace), `[eof]` (end of function trace) y `[f_0]` a `[f_511]` (tokens funcionales). Estos tokens disponen de filas de embedding de entrada y de proyeccion de salida entrenadas. La adaptacion se realizo mediante LoRA, cuyo delta se fusiono posteriormente en los pesos BF16 del checkpoint base, de modo que el modelo final es un checkpoint denso estandar cargable con `AutoModelForCausalLM`.

El entrenamiento parte del modelo "Full" (CIRF-Qwen3-8B-Instruct-Full) y aplica una seleccion backward-greedy de resultados con un presupuesto de como maximo 6 tokens de resultado explicitos por ejemplo. El formato de prompt es `QUESTION[sof]`, sin plantilla de chat: el modelo emite una traza de tokens funcionales con valores de resultado opcionales, termina con `[eof]` y a continuacion la respuesta final, deteniendose en el token EOS del tokenizer. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento estructurado mediante trazas de tokens funcionales discretos entre `[sof]` y `[eof]`.
- Resolucion de problemas aritmeticos y de sentido comun evaluados en GSM8K, MultiArith, SVAMP, CommonsenseQA y Coin Flip.
- Razonamiento con presupuesto acotado: la evaluacion limita cada traza a 32 tokens funcionales, forzando `[eof]` al alcanzar el limite.
- Decodificacion greedy determinista (el ejemplo de inferencia usa `do_sample=False`).
- Carga directa con Transformers sin PEFT, sin checkpoint base adicional y sin codigo CIRF.
- Capacidades multilingues: solo ingles declarado (`language: en`).
- No se documentan tool calling, function calling, soporte de agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion sobre razonamiento con tokens funcionales: el modelo sirve como punto de comparacion frente a las variantes Full, Zero-Results y Backward-Greedy-3/12/18/24 del mismo autor para estudiar el efecto del presupuesto de tokens de resultado en la precision.
- Experimentos de interpretabilidad: la traza explicita de tokens `[f_0]`-`[f_511]` permite analizar que funciones activa el modelo antes de responder, algo mas dificil con cadenas de texto libre.
- Evaluacion de aritmetica basica en entornos controlados: con 100,00% en MultiArith (178 preguntas) y 84,00% en SVAMP (300 preguntas), es util para validar pipelines de evaluacion con exact-match.
- Reproduccion de resultados: el repositorio incluye `inference.py`, `test_results.json` y `training_config.json`, lo que permite replicar el protocolo (greedy, maximo 384 tokens nuevos, 32 tokens funcionales) en laboratorio.
- Estudio de la degradacion por presupuesto: comparar este checkpoint (6 tokens de resultado) con las variantes 3, 12, 18 y 24 permite medir el compromiso entre coste de razonamiento y precision.
- Pruebas de integracion con Transformers y text-generation-inference: el modelo declara `endpoints_compatible` y `text-generation-inference`, por lo que puede desplegarse en infraestructura TGI para pruebas de latencia batch-1 (reportadas en `test_results.json`).

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, maximo 384 tokens nuevos y 32 tokens funcionales, exact-match):

| Test set | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 52,62% |
| MultiArith | 178 | 100,00% |
| SVAMP | 300 | 84,00% |
| CommonsenseQA | 1.221 | 81,33% |
| Coin Flip (corregido por paridad) | 3.333 | 83,68% |

La model card indica que los resultados completos por dataset, incluidos MATH-500, StrategyQA y latencia batch-1, estan en `test_results.json`. Coin Flip se puntua contra la paridad de los lanzamientos indicados en la pregunta porque aproximadamente el 20% de las etiquetas del dataset no coinciden con ella. No se proporcionan resultados de benchmarks para modelos comparables en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos, mas cache KV y activaciones; en la practica se recomienda 24 GB o mas.
- En cuantizacion de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits: alrededor de 4-5 GB, aunque no se publican checkpoints cuantizados oficiales.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16 con margen ajustado, y en GPUs de 16 GB solo con cuantizacion.
- Opciones de despliegue: Transformers (probado por el autor), text-generation-inference (declarado en los tags) y, en principio, vLLM o llama.cpp tras conversion a GGUF, aunque no se documenta soporte verificado.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a `test_results.json` para la latencia batch-1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIRF-Qwen3-8B-Instruct-Backward-Greedy-6 | 8,19 B | no disponible | 52,62% | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3-8B (base) | 8,19 B | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 | HuggingFace (modelo base) |
| CIRF-Qwen3-8B-Instruct-Full | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace (variante del mismo autor) |
| CIRF-Qwen3-8B-Instruct-Backward-Greedy-3 / 12 / 18 / 24 | no disponible | no disponible | no disponible | Apache 2.0 | HuggingFace (variantes del mismo autor) |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con alternativas de otros autores.

## Limitaciones y advertencias

- Precision limitada en GSM8K (52,62%), muy inferior a la de modelos de 8B con razonamiento convencional; no es adecuado para produccion en tareas aritmeticas de varios pasos.
- Formato de prompt no estandar: requiere `QUESTION[sof]` sin plantilla de chat y decodificacion con `skip_special_tokens=False`; un uso incorrecto rompe la traza y la extraccion de la respuesta.
- El limite de 32 tokens funcionales en la evaluacion puede truncar razonamientos largos y afectar a la precision reportada.
- Solo soporta ingles (`language: en`); no se declara soporte de castellano.
- No se documentan capacidades de tool calling, agentes, vision ni audio.
- Riesgo de alucinacion no cuantificado; no se publican evaluaciones de robustez ni de sesgos.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo es un experimento de investigacion con 0 descargas y 0 likes, sin validacion externa.
- La correccion por paridad en Coin Flip indica que el dataset original tiene etiquetas ruidosas (aproximadamente el 20%), lo que complica la comparacion con resultados publicados por terceros.
- No se dispone de informacion sobre la longitud de contexto efectiva ni sobre el volumen y composicion de los datos de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-6
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Variante Full: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Full
- Variante Zero-Results: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Zero-Results
- Variante Backward-Greedy-3: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-3
- Variante Backward-Greedy-12: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-12
- Variante Backward-Greedy-18: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-18
- Variante Backward-Greedy-24: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-24
