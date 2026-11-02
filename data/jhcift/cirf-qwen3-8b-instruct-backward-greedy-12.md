# JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-12

## Resumen

CIRF-Qwen3-8B-Instruct-Backward-Greedy-12 es un ajuste fino del modelo Qwen3-8B de Alibaba, desarrollado por el usuario JhCIFT dentro de la familia experimental CIRF (siglas no expandidas en la model card). El modelo introduce un mecanismo de "tokens funcionales" que obliga al modelo a emitir una traza explícita de razonamiento delimitada por los tokens especiales `[sof]` (start of function) y `[eof]` (end of function), seguida de la respuesta final. Esta variante concreta se ha entrenado con una selección "backward-greedy" que limita a un máximo de 12 tokens de resultado explícitos por ejemplo de entrenamiento, lo que reduce la longitud de las trazas y debería contener el coste de inferencia.

El modelo parte de la arquitectura transformer densa de Qwen3-8B, con 8.192.758.784 parámetros totales, y mantiene los pesos en BF16 con la actualización LoRA fusionada en los pesos densos. Incorpora 514 tokens nuevos (`[sof]`, `[eof]` y `[f_0]` a `[f_511]`) con sus embeddings y filas de salida entrenadas, de modo que se carga con Transformers estándar sin necesidad de PEFT ni del código CIRF original. El repositorio ocupa 16,4 GB.

Su relevancia es acotada pero interesante para investigación: explora una forma alternativa de razonamiento estructurado (trazas de tokens funcionales en lugar de lenguaje natural libre) y publica resultados en varios conjuntos de matemáticas y sentido común. Es un modelo de nicho, con cero descargas y cero likes en el momento de redactar esta ficha, sin benchmarks comparativos frente a modelos de referencia y con soporte declarado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) con vocabulario extendido de tokens funcionales CIRF |
| Parametros totales | 8.192.758.784 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-8B, no confirmada en la model card) |
| Tipos de cuantizacion | No se publican pesos cuantizados; los pesos se distribuyen en BF16 (safetensors) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, Transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado de Qwen3-8B, un transformer denso de 8B parámetros. La modificación principal es la incorporación de 514 tokens especiales al vocabulario: `[sof]` y `[eof]` como delimitadores de la traza de razonamiento, y `[f_0]` a `[f_511]` como tokens funcionales que el modelo emite durante dicha traza, opcionalmente acompañados de valores de resultado. El prompt de entrada tiene el formato `QUESTION[sof]` y no se utiliza plantilla de chat: el modelo genera la traza, emite `[eof]` y a continuación la respuesta final, deteniéndose en el token EOS del tokenizador.

El entrenamiento parte del modelo "full-result" de la misma familia y aplica una selección backward-greedy de resultados con un presupuesto máximo de 12 tokens de resultado explícitos por ejemplo. La actualización LoRA resultante se fusiona en los pesos densos BF16, incluyendo los embeddings y filas de salida de los nuevos tokens, de forma que el checkpoint es autocontenido. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; únicamente se documentan los artefactos `training_config.json`, `provenance.json` y `export_verification.json`, que no se reproducen en la información disponible.

## Capacidades

- Generación de texto con razonamiento estructurado mediante trazas de tokens funcionales delimitadas por `[sof]` y `[eof]`.
- Razonamiento aritmético y matemático de varios pasos (evaluado en GSM8K, MultiArith, SVAMP y MATH-500 según la model card).
- Razonamiento de sentido común (CommonsenseQA, StrategyQA).
- Tareas de seguimiento de estado y paridad (Coin Flip).
- Emisión de valores de resultado intermedios dentro de la traza, con un presupuesto controlado de tokens de resultado (12 en esta variante).
- Carga directa con Transformers sin PEFT ni código adicional; compatible con text-generation-inference y endpoints compatibles según los tags del repositorio.
- Soporte multilingüe: no disponible; la model card declara únicamente inglés.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no documentadas; el mecanismo de tokens funcionales es un razonamiento interno, no un protocolo de herramientas.
- Visión o audio: no disponible.

## Casos de uso

- Investigación sobre razonamiento estructurado: comparar trazas de tokens funcionales frente a cadenas de pensamiento en lenguaje natural, usando las variantes de la familia CIRF (Full, Zero-Results, Backward-Greedy-3/6/12/18/24) como ablation controlada del presupuesto de tokens de resultado.
- Evaluación de robustez aritmética: ejecutar el modelo sobre GSM8K, SVAMP o MultiArith con el protocolo incluido (`inference.py`) para reproducir las cifras publicadas y analizar la tasa de acierto con trazas limitadas a 32 tokens funcionales.
- Prototipado de decodificación restringida: el formato `QUESTION[sof]` y la parada en EOS permiten integrar el modelo en pipelines que necesitan separar de forma determinista la traza de razonamiento de la respuesta final, por ejemplo para auditoría o filtrado.
- Análisis de paridad y seguimiento de estado: tareas tipo Coin Flip, donde el modelo muestra un 88,15% de acierto con corrección de paridad, útil para estudiar cómo los modelos pequeños manejan estados discretos.
- Fine-tuning posterior sobre dominios específicos: al ser un checkpoint autocontenido en safetensors con licencia Apache 2.0, sirve como base para experimentos de ajuste con vocabulario funcional ya integrado.
- Docencia y reproducción de experimentos: el repositorio incluye scripts y artefactos de verificación que facilitan reproducir el protocolo de evaluación en un entorno con solo Torch y Transformers.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificación greedy, máximo 384 tokens nuevos y 32 tokens funcionales, puntuación por coincidencia exacta):

| Conjunto de test | Preguntas | Precisión |
|---|---:|---:|
| GSM8K | 1.319 | 62,55% |
| MultiArith | 178 | 100,00% |
| SVAMP | 300 | 81,33% |
| CommonsenseQA | 1.221 | 80,75% |
| Coin Flip (corregido por paridad) | 3.333 | 88,15% |

La model card indica que los resultados completos por dataset, incluyendo MATH-500, StrategyQA y latencia con batch 1, están en `test_results.json`, pero no se reproducen en la información disponible. No se han publicado comparaciones directas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; en GPUs de 16 GB sería necesario cuantizar, pero no se publican pesos GGUF ni cuantizados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) en BF16; en GPUs de 16 GB requiere cuantización no oficial.
- Opciones de despliegue: Transformers (soporte oficial), text-generation-inference y endpoints compatibles según los tags; no se documenta soporte para vLLM, llama.cpp u Ollama, y la ausencia de pesos GGUF limita el despliegue en CPU.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a `test_results.json` para la latencia con batch 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| CIRF-Qwen3-8B-Instruct-Backward-Greedy-12 | 8,19B | No disponible | Apache 2.0 | Fine-tune con tokens funcionales y presupuesto de 12 tokens de resultado |
| Qwen/Qwen3-8B (base) | 8B | No disponible en esta ficha | Apache 2.0 | Modelo original de Alibaba; sin mecanismo CIRF |
| CIRF-Qwen3-8B-Instruct-Full | 8,19B (presumible) | No disponible | Apache 2.0 | Variante sin restricción de tokens de resultado |
| CIRF-Qwen3-8B-Instruct-Zero-Results | 8,19B (presumible) | No disponible | Apache 2.0 | Variante sin valores de resultado explícitos |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la ficha; no hay validación independiente de los resultados publicados.
- Solo se declara soporte para inglés; el rendimiento en castellano u otros idiomas no está documentado.
- El formato de prompt es rígido (`QUESTION[sof]`, sin plantilla de chat) y requiere decodificar con `skip_special_tokens=False` y parar en EOS, no en `[eof]`; un uso incorrecto produce salidas malformadas.
- El protocolo de evaluación limita las trazas a 32 tokens funcionales forzando `[eof]`; los resultados pueden no ser representativos con otros límites.
- La corrección de paridad en Coin Flip indica que aproximadamente el 20% de las etiquetas del dataset discrepan de la paridad real de los lanzamientos, lo que introduce incertidumbre en esa métrica.
- GSM8K al 62,55% está por debajo de lo esperable en modelos de 8B de última generación, lo que sugiere que el mecanismo de tokens funcionales no compensa la pérdida de capacidades del ajuste.
- Riesgo de alucinación: no evaluado ni documentado; la traza de tokens funcionales no garantiza la corrección del resultado final.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo deriva de Qwen3-8B, cuyos términos deben respetarse.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-12
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- CIRF-Qwen3-8B-Instruct-Full: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Full
- CIRF-Qwen3-8B-Instruct-Zero-Results: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Zero-Results
- CIRF-Qwen3-8B-Instruct-Backward-Greedy-3: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-3
- CIRF-Qwen3-8B-Instruct-Backward-Greedy-6: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-6
- CIRF-Qwen3-8B-Instruct-Backward-Greedy-18: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-18
- CIRF-Qwen3-8B-Instruct-Backward-Greedy-24: https://huggingface.co/JhCIFT/CIRF-Qwen3-8B-Instruct-Backward-Greedy-24
