# JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-24

## Resumen

CIRF-Qwen3-8B-Instruct-Backward-Greedy-24 es un ajuste fino del modelo Qwen3-8B de Alibaba, desarrollado por el autor independiente JhCIFT dentro de la familia experimental CIRF (functional-token reasoning). El modelo parte del checkpoint completo de resultados de CIRF y aplica una seleccion de resultados "backward-greedy" con un presupuesto maximo de 24 tokens de resultado explicito por ejemplo de entrenamiento. Su objetivo es inducir un razonamiento explicito basado en tokens funcionales (`[sof]`, `[f_0]` a `[f_511]`, `[eof]`) en lugar de cadenas de texto libre, lo que permite separar la traza de razonamiento de la respuesta final.

Tecnicamente es un transformer denso de 8.192.758.784 parametros (8,19 mil millones) con pesos en BF16. La actualizacion LoRA se ha fusionado en los pesos densos y se han incorporado 514 tokens nuevos con sus filas de embedding y de salida ya entrenadas, de modo que el modelo carga con Transformers estandar sin necesidad de PEFT ni del codigo original de CIRF. El repositorio ocupa 16,4 GB.

Su relevancia es acotada pero concreta: es el mejor diseno evaluado por el autor con este presupuesto de tokens, aunque el propio autor advierte que no se situa en la frontera de precision/latencia del conjunto de pruebas. Resulta util como referencia para investigacion sobre razonamiento estructurado con vocabulario funcional y para experimentar con protocolos de decodificacion determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) con vocabulario funcional CIRF anadido |
| Parametros totales | 8.192.758.784 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8,19 mil millones de parametros construido sobre Qwen3-8B. La modificacion principal es la ampliacion del vocabulario con 514 tokens nuevos: `[sof]` (start of function), `[eof]` (end of function) y 512 tokens funcionales `[f_0]` a `[f_511]`. Estos tokens cuentan con filas de embedding y de salida propias, entrenadas durante el ajuste. La actualizacion LoRA se ha fusionado en los pesos BF16, por lo que el checkpoint resultante es autocontenido y no requiere PEFT, el checkpoint base ni el codigo de CIRF para inferencia.

El entrenamiento parte del modelo CIRF-Qwen3-8B-Instruct-Full y aplica una seleccion "backward-greedy" de resultados con un presupuesto de como maximo 24 tokens de resultado explicito por ejemplo. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon RLHF o DPO. La innovacion destacable es el protocolo de razonamiento: el modelo genera una traza de tokens funcionales con valores de resultado opcionales, termina con `[eof]` y a continuacion emite la respuesta final, deteniendose en el token EOS del tokenizer. No se usa plantilla de chat; el formato de prompt es `QUESTION[sof]`.

## Capacidades

- Generacion de texto y razonamiento explicito mediante trazas de tokens funcionales.
- Razonamiento aritmetico y de sentido comun (evaluado en GSM8K, MultiArith, SVAMP, CommonsenseQA y Coin Flip).
- Razonamiento multi-paso estructurado: la traza funcional actua como cadena intermedia antes de la respuesta final.
- Decodificacion determinista con greedy decoding, reproducible con el script `inference.py` incluido.
- Carga directa en Transformers sin dependencias adicionales (sin PEFT ni codigo CIRF).
- Compatibilidad declarada con text-generation-inference y endpoints compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues: limitadas al ingles segun los metadatos del modelo.

## Casos de uso

- Investigacion sobre razonamiento estructurado: el modelo permite estudiar como un vocabulario funcional discreto sustituye a las cadenas de razonamiento en texto libre, comparando variantes con presupuestos de 3, 6, 12, 18 y 24 tokens dentro de la misma familia CIRF.
- Evaluacion de protocolos de decodificacion: al ser determinista con greedy decoding y tener un limite de 32 tokens funcionales, sirve para reproducir experimentos de latencia y precision de forma controlada.
- Benchmarking de aritmetica basica: util como linea base en tareas de GSM8K, MultiArith y SVAMP para comparar metodos de razonamiento explicito frente a modelos sin traza funcional.
- Analisis de robustez de etiquetas: el caso de Coin Flip, con correccion de paridad por etiquetas inconsistentes en cerca del 20% del dataset, es un ejemplo practico para estudiar calidad de datos de evaluacion.
- Prototipado de pipelines de razonamiento con salida parseable: la separacion entre traza (`[sof]`...`[eof]`) y respuesta final facilita el parseo programatico en entornos de investigacion.
- Experimentacion con vocabularios extendidos: los 514 tokens nuevos permiten estudiar el impacto de ampliar el vocabulario del tokenizer en el rendimiento y en el coste de inferencia.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificacion greedy, maximo de 384 tokens nuevos y 32 tokens funcionales, con puntuacion por coincidencia exacta de respuesta:

| Conjunto de prueba | Preguntas | Precision |
|---|---:|---:|
| GSM8K | 1.319 | 70,43% |
| MultiArith | 178 | 99,44% |
| SVAMP | 300 | 84,33% |
| CommonsenseQA | 1.221 | 83,29% |
| Coin Flip (corregido por paridad) | 3.333 | 95,14% |

El autor indica que los resultados completos por dataset, incluidos MATH-500, StrategyQA y latencia con batch 1, estan en `test_results.json` del repositorio, pero esos valores no se incluyen en la informacion proporcionada. No se dispone de comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 20-24 GB.
- GPU recomendadas para BF16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, justo para el modelo con contexto corto).
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) con contexto limitado; en GPUs de 16 GB requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: Transformers con `device_map="auto"` (soporte oficial), text-generation-inference segun los tags, y endpoints compatibles. No se documentan pesos GGUF, por lo que llama.cpp u Ollama no estan soportados de forma nativa sin conversion propia.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor referencia metricas de latencia batch 1 en `test_results.json`, no incluidas aqui.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CIRF-Qwen3-8B-Instruct-Backward-Greedy-24 | 8,19 B | no disponible | Apache 2.0 | Hugging Face | Este modelo; mejor diseno evaluado con presupuesto de 24 tokens |
| CIRF-Qwen3-8B-Instruct-Full | no disponible | no disponible | Apache 2.0 | Hugging Face | Checkpoint de origen con resultados completos |
| CIRF-Qwen3-8B-Instruct-Zero-Results | no disponible | no disponible | Apache 2.0 | Hugging Face | Variante sin valores de resultado |
| Qwen/Qwen3-8B | 8,19 B (aprox.) | no disponible | Apache 2.0 | Hugging Face | Modelo base sin ajuste CIRF |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no esta en la frontera de precision/latencia del conjunto de pruebas, pese a ser el mejor diseno con presupuesto de 24 tokens.
- Modelo orientado a investigacion: solo soporta ingles y no emplea plantilla de chat, lo que limita su uso directo en aplicaciones conversacionales.
- El protocolo de inferencia es estricto: hay que detenerse en EOS (no en `[eof]`) y decodificar con `skip_special_tokens=False` para preservar los limites de la traza; un uso incorrecto produce salidas mal formadas.
- La evaluacion impone un limite de 32 tokens funcionales forzando `[eof]`; sin ese limite el comportamiento puede diferir del reportado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un ajuste supervisado sobre un modelo base, hereda los sesgos y errores de Qwen3-8B.
- Sesgos conocidos: no documentados por el autor.
- La correccion de paridad en Coin Flip sugiere que las etiquetas originales del dataset contienen ruido (cerca del 20% inconsistentes), lo que debe tenerse en cuenta al comparar con otras publicaciones.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad y de soporte del autor desaconseja su despliegue en produccion sin validacion adicional.
- El modelo tiene solo 360 descargas y 1 like en el momento de la consulta, lo que indica una validacion externa muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-24
- Modelo de origen (Full): https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Full
- Variante Zero-Results: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Zero-Results
- Variante Backward-Greedy-3: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-3
- Variante Backward-Greedy-6: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-6
- Variante Backward-Greedy-12: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-12
- Variante Backward-Greedy-18: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-18
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
