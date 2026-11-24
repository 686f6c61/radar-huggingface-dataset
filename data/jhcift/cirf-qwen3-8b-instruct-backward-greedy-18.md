# JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-18

## Resumen

CIRF-Qwen3-8B-Instruct-Backward-Greedy-18 es un ajuste fino del modelo Qwen3-8B de Alibaba, desarrollado por el usuario JhCIFT. Implementa una variante de razonamiento denominada CIRF (un esquema de "functional tokens" que estructura el proceso de razonamiento en una traza explícita de tokens funcionales). El modelo parte del checkpoint CIRF-Qwen3-8B-Instruct-Full y aplica una selección de resultados "backward-greedy" con un presupuesto máximo de 18 tokens de resultado explícitos por ejemplo de entrenamiento.

El modelo conserva la arquitectura transformer densa de Qwen3-8B (8.192.758.784 parámetros) e incorpora 514 tokens nuevos al vocabulario (`[sof]`, `[eof]` y `[f_0]` a `[f_511]`) con sus correspondientes filas de embedding y de salida entrenadas. La actualización LoRA está fusionada en los pesos BF16, de modo que el modelo se carga con Transformers estándar sin necesidad de PEFT ni de código CIRF adicional.

Es relevante para investigadores interesados en esquemas de razonamiento estructurado alternativos a chain-of-thought convencional, y para quienes necesitan un modelo de 8B con licencia Apache 2.0 que se pueda desplegar sin dependencias adicionales. La model card documenta resultados en GSM8K, MultiArith, SVAMP, CommonsenseQA y Coin Flip, además de latencia batch-1 en `test_results.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B) con vocabulario CIRF de tokens funcionales |
| Parametros totales | 8.192.758.784 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Ingles (segun metadatos y model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de Qwen3-8B, con 8.192.758.784 parametros. Sobre esa base se anaden 514 tokens nuevos al vocabulario: `[sof]` (start of function trace), `[eof]` (end of function trace) y `[f_0]` a `[f_511]` (tokens funcionales). Estos tokens cuentan con filas de embedding y de salida entrenadas, y se incluyen en el checkpoint final.

El entrenamiento parte del modelo CIRF-Qwen3-8B-Instruct-Full y aplica una seleccion "backward-greedy" de resultados con un presupuesto de como maximo 18 tokens de resultado explicitos por ejemplo. La actualizacion LoRA resultante se fusiona en los pesos BF16 densos, por lo que no se requiere PEFT para la inferencia. La model card indica que se probaron 91 disenos candidatos y que la seleccion final se hizo el 2026-11-08; los pesos publicados originalmente el 2026-11-02 (diseno `c_qwen_2ef2a48b9a8d`, semilla 1, seleccionado cuando se habian probado 56 de 91 disenos) siguen disponibles en la revision `4df4713`. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

El formato de prompt es `QUESTION[sof]`, sin plantilla de chat. El modelo genera una traza de tokens funcionales con valores de resultado opcionales, seguida de `[eof]` y la respuesta final, y se detiene en el token EOS del tokenizer. La decodificacion debe hacerse con `skip_special_tokens=False` para conservar los limites de la traza.

## Capacidades

- Generacion de texto y razonamiento estructurado mediante trazas de tokens funcionales CIRF.
- Razonamiento aritmetico y resolucion de problemas matematicos de varios pasos (GSM8K, MultiArith, SVAMP).
- Razonamiento de sentido comun (CommonsenseQA) y tareas de seguimiento de estado (Coin Flip).
- Generacion de trazas explicitas con hasta 32 tokens funcionales en el protocolo de evaluacion (y presupuesto de entrenamiento de 18 tokens de resultado).
- Carga directa con Transformers sin PEFT, checkpoint base ni codigo CIRF adicional.
- Compatibilidad con text-generation-inference y endpoints compatibles (segun tags).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking explicito en la informacion proporcionada.
- Capacidad multilingue limitada al ingles segun los metadatos.

## Casos de uso

- Investigacion en esquemas de razonamiento estructurado: el modelo permite estudiar como un presupuesto acotado de tokens de resultado (18) afecta a la precision en tareas aritmeticas, comparandolo con las variantes Full, Zero-Results y Backward-Greedy-3/6/12/24 del mismo autor.
- Evaluacion de tecnicas de seleccion de datos de entrenamiento: la seleccion "backward-greedy" documentada permite reproducir experimentos sobre que ejemplos de razonamiento conservar bajo restricciones de presupuesto.
- Despliegue en entornos con Transformers estandar: al estar la LoRA fusionada y los tokens nuevos incluidos, se puede servir con text-generation-inference o endpoints compatibles sin infraestructura PEFT adicional.
- Benchmarking de modelos de 8B en tareas aritmeticas: los resultados publicados en GSM8K (69,52%), MultiArith (99,44%) y SVAMP (85,00%) sirven como referencia reproducible con el script `inference.py` incluido.
- Analisis de robustez en etiquetas ruidosas: el tratamiento "parity-corrected" de Coin Flip (aproximadamente el 20% de las etiquetas del dataset discrepan con la paridad declarada en la pregunta) es un caso de estudio util para evaluar metodologias de puntuacion.
- Reproducibilidad de experimentos: los ficheros `training_config.json`, `provenance.json` y `export_verification.json` permiten auditar configuracion de entrenamiento, hashes de checkpoints de origen y comprobaciones de exportacion.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, maximo 384 tokens nuevos y 32 tokens funcionales, puntuacion por coincidencia exacta):

| Test set | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 69,52% |
| MultiArith | 178 | 99,44% |
| SVAMP | 300 | 85,00% |
| CommonsenseQA | 1.221 | 81,16% |
| Coin Flip (corregido por paridad) | 3.333 | 96,58% |

La model card indica que los resultados completos por dataset, incluidos MATH-500, StrategyQA y latencia batch-1, estan en `test_results.json`, pero esos valores no se incluyen en la informacion proporcionada. No se dispone de comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos (8.192.758.784 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda al menos 20-24 GB.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16; GPUs con 16 GB requeririan cuantizacion, que no se documenta en la informacion proporcionada.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y modelos equivalentes con 24 GB o mas en BF16.
- Opciones de despliegue: Transformers (con `device_map="auto"`), text-generation-inference y endpoints compatibles segun los tags. No se documentan integraciones con vLLM, llama.cpp u Ollama, ni pesos GGUF.
- Latencia y throughput: la model card menciona latencia batch-1 en `test_results.json`, pero los valores no estan en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CIRF-Qwen3-8B-Instruct-Backward-Greedy-18 | 8.192.758.784 | No disponible | Apache 2.0 | Hugging Face (348 descargas) | Variante con presupuesto de 18 tokens de resultado |
| CIRF-Qwen3-8B-Instruct-Full | No disponible | No disponible | Apache 2.0 | Hugging Face | Checkpoint de partida, sin restriccion de presupuesto |
| CIRF-Qwen3-8B-Instruct-Zero-Results | No disponible | No disponible | Apache 2.0 | Hugging Face | Variante sin resultados explicitos |
| CIRF-Qwen3-8B-Instruct-Backward-Greedy-3/6/12/24 | No disponible | No disponible | Apache 2.0 | Hugging Face | Variantes con otros presupuestos de tokens de resultado |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. Tampoco se documentan comparaciones con Qwen3-8B base ni con otros modelos de 8B.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no se documenta capacidad multilingue.
- No se especifica la longitud de contexto en la informacion proporcionada; el protocolo de evaluacion usa un maximo de 384 tokens nuevos, lo que sugiere trazas acotadas pero no informa sobre la ventana total.
- La decodificacion debe hacerse con `skip_special_tokens=False` y parada en EOS (no en `[eof]`); un uso incorrecto del tokenizer rompe el formato de la traza.
- No usa plantilla de chat: el formato es `QUESTION[sof]`, por lo que no es directamente compatible con pipelines conversacionales estandar.
- Los resultados en Coin Flip se reportan con correccion de paridad porque aproximadamente el 20% de las etiquetas del dataset discrepan con la paridad declarada en la pregunta; las cifras sin correccion serian distintas.
- La seleccion final del checkpoint se hizo tras probar 91 disenos, lo que introduce un riesgo de sobreajuste al conjunto de evaluacion que conviene considerar al interpretar las cifras.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones y avisos de la licencia del modelo base Qwen3-8B.
- El modelo tiene 0 likes y 348 descargas, lo que indica una validacion externa muy limitada; conviene tratarlo como experimental.
- No se documentan pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-18
- Revision original (2026-11-02): https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-18/tree/4df471393e7f332207447c1c8e0fd918154538de
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- CIRF-Qwen3-8B-Instruct-Full: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Full
- CIRF-Qwen3-8B-Instruct-Zero-Results: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Zero-Results
- CIRF-Qwen3-8B-Instruct-Backward-Greedy-3: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-3
- CIRF-Qwen3-8B-Instruct-Backward-Greedy-6: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-6
- CIRF-Qwen3-8B-Instruct-Backward-Greedy-12: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-12
- CIRF-Qwen3-8B-Instruct-Backward-Greedy-24: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-24
