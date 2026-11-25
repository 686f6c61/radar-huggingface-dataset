# JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6

## Resumen

Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6 es un ajuste fino (fine-tuning) del modelo Meta Llama 3.1 8B Instruct desarrollado por el usuario JhCIFT. Se enmarca en la familia CIRF (un esquema de razonamiento basado en "tokens funcionales"), y esta variante concreta parte del modelo de resultado completo tras aplicar una seleccion de resultados "backward-greedy" con un presupuesto maximo de 6 tokens de resultado explicitos por ejemplo de entrenamiento. El modelo conserva la arquitectura transformer densa original de Llama 3.1 8B, con 8.034.471.936 parametros.

El modelo incorpora 514 tokens nuevos en el vocabulario (`[sof]`, `[eof]` y `[f_0]` a `[f_511]`), junto con sus filas de embedding y de salida ya entrenadas. La actualizacion LoRA se ha fusionado en los pesos densos en BF16, de modo que el checkpoint se carga con Transformers estandar sin necesidad de PEFT, del checkpoint base ni de codigo CIRF adicional. El formato de prompt no usa plantilla de chat: se concatena la pregunta con el token `[sof]` y el modelo genera una traza de tokens funcionales con valores de resultado opcionales, seguida de `[eof]` y la respuesta final.

Su relevancia es acotada pero especifica: explora una via alternativa de razonamiento explicito (trazas de tokens funcionales en lugar de cadenas de pensamiento en lenguaje natural) sobre un modelo pequeno de 8B, con evaluacion publicada en varios conjuntos de matematicas y sentido comun. Es un modelo de investigacion, con solo 314 descargas y 1 like en el momento de la consulta, orientado a estudiar el paradigma CIRF mas que a un uso productivo general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), con vocabulario extendido de tokens funcionales CIRF |
| Parametros totales | 8.034.471.936 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del base Llama 3.1 8B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (BF16, LoRA fusionada) |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only de la familia Llama 3.1, con 8.034.471.936 parametros, fine-tuneado desde meta-llama/Llama-3.1-8B-Instruct. La innovacion principal es la incorporacion de un vocabulario de 514 tokens funcionales: `[sof]` (start of function/trace), `[eof]` (end of trace) y 512 tokens `[f_0]`..`[f_511]` que codifican operaciones o pasos de razonamiento. Estos tokens se anaden con sus filas de embedding y de salida entrenadas, de modo que el modelo puede emitir trazas estructuradas de tokens funcionales con valores de resultado opcionales antes de la respuesta final.

El entrenamiento parte del modelo CIRF de resultado completo y aplica una seleccion de resultados "backward-greedy" con un presupuesto de como maximo 6 tokens de resultado explicitos por ejemplo. La actualizacion LoRA resultante se fusiona en los pesos densos en BF16. La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO; solo indica que es una adaptacion supervisada. El repositorio incluye ficheros de trazabilidad (`training_config.json`, `provenance.json`, `export_verification.json`) con los ajustes de entrenamiento, hashes del checkpoint de origen y comprobaciones de exportacion.

## Capacidades

- Generacion de texto y razonamiento estructurado mediante trazas de tokens funcionales CIRF, seguidas de una respuesta final.
- Razonamiento aritmetico y matematico de varios pasos (evaluado en GSM8K, MultiArith, SVAMP, MATH-500).
- Razonamiento de sentido comun (evaluado en CommonsenseQA, StrategyQA, Coin Flip).
- Emision de valores de resultado intermedios explicitos dentro de la traza (hasta 6 tokens de resultado por ejemplo en el entrenamiento).
- Carga directa con Transformers estandar (sin PEFT, sin checkpoint base, sin codigo CIRF adicional).
- Compatibilidad con text-generation-inference y endpoints compatibles (segun tags del repositorio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning en el sentido de agentes autonomos: no disponible; el multi-step se limita a la traza CIRF.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: modo de razonamiento por tokens funcionales; sin vision ni audio.

## Casos de uso

- Investigacion sobre paradigmas de razonamiento: sirve para estudiar si las trazas de tokens funcionales CIRF superan o igualan a las cadenas de pensamiento en lenguaje natural en tareas aritmeticas, gracias a su traza estructurada y reproducible con decodificacion greedy.
- Evaluacion comparativa de variantes CIRF: al existir variantes con presupuestos de 0, 3, 6, 12, 18 y 24 tokens de resultado, permite analizar el compromiso entre numero de tokens de resultado y precision en tareas como GSM8K o SVAMP.
- Prototipado de razonamiento aritmetico controlado: el formato `QUESTION[sof]` con parada en `[eof]` facilita extraer la respuesta final de forma programatica, util en pipelines de evaluacion automatizada con exact-match.
- Analisis de robustez en sentido comun: los resultados en CommonsenseQA (79,69 %) y Coin Flip (84,58 %, con correccion de paridad) permiten usarlo como banco de pruebas de sesgos y errores en razonamiento de sentido comun.
- Reproduccion de experimentos academicos: el repositorio incluye `inference.py` y ficheros de configuracion y procedencia, lo que permite replicar el protocolo de evaluacion (greedy, maximo 384 tokens nuevos y 32 tokens funcionales) con solo Torch y Transformers.
- Fine-tuning posterior o destilacion: al cargarse como modelo Transformers estandar con pesos BF16 fusionados, puede servir como punto de partida para nuevos ajustes sobre el vocabulario CIRF extendido.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, maximo 384 tokens nuevos y 32 tokens funcionales, puntuacion exact-match):

| Conjunto de prueba | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 51,40 % |
| MultiArith | 178 | 99,44 % |
| SVAMP | 300 | 79,33 % |
| CommonsenseQA | 1.221 | 79,69 % |
| Coin Flip (corregido por paridad) | 3.333 | 84,58 % |

La model card indica que los resultados completos por dataset, incluidos MATH-500, StrategyQA y la latencia con batch 1, estan en `test_results.json`. No se proporcionan en la informacion disponible los valores de MATH-500 ni de StrategyQA, ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo denso de 8B en BF16 se requiere aproximadamente 16 GB de VRAM solo para pesos, mas memoria para KV cache y activaciones.
- GPU recomendadas: no especificadas en la model card. Por tamano, cabe en GPUs con 24 GB o mas (por ejemplo RTX 4090, A100 40 GB, H100) en BF16.
- Cabe en GPU de consumo: si, en GPUs con al menos 24 GB de VRAM en BF16; no se documentan versiones cuantizadas que permitan GPUs de menor memoria.
- Opciones de despliegue: Transformers (con `device_map="auto"`), text-generation-inference y endpoints compatibles (segun tags). No se documentan vLLM, llama.cpp ni Ollama, y no se publican pesos GGUF.
- Latencia y throughput: la model card menciona latencia con batch 1 en `test_results.json`, pero los valores no estan incluidos en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6 | 8,03 B | no disponible | 51,40 % | llama3.1 | Hugging Face (314 descargas) |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8,03 B | 128 K (segun Llama 3.1) | no disponible en esta informacion | llama3.1 | Hugging Face (ampliamente usado) |
| Otras variantes CIRF del mismo autor (Full, Zero-Results, Backward-Greedy-3/12/18/24) | 8,03 B | no disponible | no disponible en esta informacion | llama3.1 | Hugging Face |

No se dispone de resultados de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion de rendimiento no puede completarse con datos verificables.

## Limitaciones y advertencias

- Modelo de investigacion con adopcion muy baja (314 descargas, 1 like); no hay evidencia de uso en produccion.
- Solo soporta ingles; no se declaran capacidades multilingues.
- El formato de prompt es no estandar: requiere `[sof]` y decodificacion con `skip_special_tokens=False`, y la parada debe hacerse en EOS, no en `[eof]`. Un uso incorrecto del template produce salidas invalidas.
- La evaluacion limita las trazas a 32 tokens funcionales forzando `[eof]`; el comportamiento sin ese limite no esta documentado.
- Precision en GSM8K moderada (51,40 %), lo que sugiere limitaciones en razonamiento aritmetico complejo pese al esquema CIRF.
- La puntuacion de Coin Flip se corrige por paridad porque aproximadamente el 20 % de las etiquetas del dataset discrepan con la paridad indicada en la pregunta; conviene tenerlo en cuenta al comparar con otros modelos.
- Riesgo de alucinacion y sesgos: no documentados en la model card; hereda los del base Llama 3.1 8B Instruct.
- Licencia Llama 3.1 Community License: el uso comercial esta sujeto a los terminos de Meta (incluida la politica de uso aceptable); debe revisarse `LICENSE` y `USE_POLICY.md` antes de cualquier despliegue comercial.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo con menos de 24 GB de VRAM.
- Longitud de contexto no confirmada para este fine-tune; no debe asumirse la del base sin verificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante CIRF-Full: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full
- Variante CIRF-Zero-Results: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results
- Variante CIRF-Backward-Greedy-3: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3
- Variante CIRF-Backward-Greedy-12: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12
- Variante CIRF-Backward-Greedy-18: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18
- Variante CIRF-Backward-Greedy-24: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-24
