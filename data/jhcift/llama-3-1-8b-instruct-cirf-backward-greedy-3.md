# JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3

## Resumen

Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3 es un ajuste fino (finetune) del modelo meta-llama/Llama-3.1-8B-Instruct desarrollado por el usuario JhCIFT. Se enmarca en la familia CIRF (presumiblemente un marco de razonamiento basado en "tokens funcionales"), de la que existen varias variantes publicadas por el mismo autor. En concreto, esta versión parte del modelo de resultado completo (CIRF-Full) y aplica una selección de resultados "backward-greedy" con un presupuesto de como máximo 3 tokens de resultado explícitos por ejemplo de entrenamiento.

El modelo mantiene la arquitectura transformer densa de Llama 3.1 8B (8.034.471.936 parámetros reales según safetensors) y añade 514 tokens nuevos al vocabulario: `[sof]`, `[eof]` y `[f_0]` a `[f_511]`, que actúan como tokens funcionales para trazar el razonamiento. La actualización LoRA se ha fusionado en los pesos BF16 densos, de modo que el modelo se carga con Transformers estándar sin necesidad de PEFT ni del código CIRF.

Su relevancia es acotada pero específica: explora una forma alternativa de inducir razonamiento multi-paso mediante tokens funcionales explícitos en lugar de cadenas de pensamiento en lenguaje natural, y publica resultados de evaluación en varios conjuntos de matemáticas y sentido común. El modelo es de investigación, con licencia Llama 3.1 y soporte únicamente en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), con vocabulario extendido de tokens funcionales CIRF |
| Parametros totales | 8.034.471.936 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.1 8B Instruct, 128.000 tokens, aunque no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (BF16, LoRA fusionada) |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only de la familia Llama 3.1, con 8.034 millones de parámetros, fine-tuneado desde Llama-3.1-8B-Instruct. La innovación principal es la incorporación de 514 tokens especiales al vocabulario (`[sof]`, `[eof]`, `[f_0]`…`[f_511]`) con sus filas de embedding y de salida entrenadas. El modelo genera una traza de tokens funcionales con valores de resultado opcionales, termina con `[eof]` y a continuación emite la respuesta final, deteniéndose en el token EOS del tokenizer.

El entrenamiento parte del checkpoint CIRF-Full y aplica una selección "backward-greedy" de resultados con un presupuesto máximo de 3 tokens de resultado explícitos por ejemplo. La actualización LoRA resultante se fusiona en los pesos BF16 densos. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El prompt no usa chat template: el formato es `<|begin_of_text|>QUESTION[sof]`.

## Capacidades

- Generación de texto y razonamiento multi-paso mediante trazas de tokens funcionales explícitos.
- Razonamiento aritmético y matemático de varios pasos (evaluado en GSM8K, MultiArith, SVAMP).
- Razonamiento de sentido común (CommonsenseQA).
- Razonamiento sobre estados y paridad (Coin Flip).
- Salida estructurada con delimitadores `[sof]`/`[eof]` que separan la traza de razonamiento de la respuesta final.
- Decodificación greedy determinista (el protocolo de evaluación usa `do_sample=False`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo "thinking" explícito más allá de la traza CIRF.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Investigación en razonamiento simbólico: el modelo sirve como banco de pruebas para estudiar si los tokens funcionales explícitos mejoran el razonamiento frente a cadenas de pensamiento en lenguaje natural, gracias a su traza delimitada y reproducible.
- Evaluación comparativa de variantes CIRF: al existir versiones con presupuestos de 0, 3, 6, 12, 18 y 24 tokens de resultado, permite analizar el compromiso entre número de tokens de resultado y precisión en tareas aritméticas.
- Generación de trazas auditables: la separación `[sof]`/`[eof]` facilita extraer y verificar el razonamiento intermedio de forma programática en pipelines de análisis.
- Prototipado de asistentes matemáticos acotados: con un 99,44% en MultiArith y 76,00% en SVAMP, es adecuado para demos de resolución de problemas aritméticos simples en inglés.
- Reproducción de experimentos: el repositorio incluye `inference.py`, `test_results.json`, `training_config.json` y `provenance.json`, lo que permite replicar el protocolo de evaluación con solo Torch y Transformers.
- Fine-tuning posterior: al cargarse con Transformers estándar sin PEFT, sirve como punto de partida para ajustes adicionales sobre el vocabulario extendido.

## Benchmarks y rendimiento

| Conjunto de test | Preguntas | Precisión |
|---|---:|---:|
| GSM8K | 1.319 | 46,47% |
| MultiArith | 178 | 99,44% |
| SVAMP | 300 | 76,00% |
| CommonsenseQA | 1.221 | 79,77% |
| Coin Flip (corregido por paridad) | 3.333 | 75,61% |

Protocolo: decodificación greedy, máximo 384 tokens nuevos y 32 tokens funcionales, puntuación por coincidencia exacta. Coin Flip se puntúa contra la paridad de los lanzamientos indicados en la pregunta porque aproximadamente el 20% de las etiquetas del dataset no coinciden con ella. La model card indica que los resultados completos por dataset, incluidos MATH-500, StrategyQA y latencia con batch 1, están en `test_results.json`, pero esos valores no se han incluido en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 20-24 GB.
- En cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4-5 GB (no se publican cuantizaciones oficiales, serían conversiones propias).
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para BF16 en una sola tarjeta.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16; en RTX 3090 (24 GB) también; en tarjetas de 12-16 GB requeriría cuantización.
- Opciones de despliegue: Transformers (probado por el autor), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), y potencialmente vLLM o llama.cpp si se generan pesos compatibles, aunque no se documentan.
- Latencia y throughput: no disponible en la información proporcionada (la model card remite a `test_results.json` para latencia con batch 1).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CIRF-Backward-Greedy-3 (este) | 8,03 B | no disponible | 46,47% | Llama 3.1 | Hugging Face |
| Llama-3.1-8B-Instruct (base) | 8,03 B | 128.000 | no disponible en esta ficha | Llama 3.1 | Hugging Face |
| CIRF-Full (misma familia) | 8,03 B | no disponible | no disponible | Llama 3.1 | Hugging Face |
| CIRF-Zero-Results (misma familia) | 8,03 B | no disponible | no disponible | Llama 3.1 | Hugging Face |

No se dispone de resultados de benchmarks del modelo base ni de las otras variantes CIRF en la información proporcionada, por lo que no es posible una comparación cuantitativa directa. La comparación con modelos de razonamiento de otros autores (por ejemplo, Qwen o DeepSeek en el rango de 7-8 B) no está disponible con datos verificables en esta ficha.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- El GSM8K de 46,47% es notablemente bajo para un modelo de 8 B orientado a razonamiento; su uso en producción matemática general no está justificado por estos números.
- Requiere un formato de prompt específico (`<|begin_of_text|>QUESTION[sof]`) y decodificación con `skip_special_tokens=False`; un uso incorrecto rompe la traza y la extracción de la respuesta.
- No usa chat template, por lo que no es directamente compatible con pipelines conversacionales estándar.
- Riesgo de alucinación inherente a los modelos de 8 B; la traza de tokens funcionales no garantiza corrección lógica.
- El conjunto Coin Flip presenta etiquetas inconsistentes en aproximadamente el 20% de los casos, lo que complica la comparación con otras publicaciones que usen las etiquetas originales.
- Licencia Llama 3.1 Community License: uso comercial permitido con condiciones (atribución "Built with Llama", política de uso aceptable y restricciones para entidades con más de 700 millones de usuarios mensuales).
- Modelo de investigación con 283 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.
- No se documentan cuantizaciones oficiales ni soporte verificado en vLLM, llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante CIRF-Full: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full
- Variante CIRF-Zero-Results: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results
- Variante CIRF-Backward-Greedy-6: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6
- Variante CIRF-Backward-Greedy-12: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12
- Variante CIRF-Backward-Greedy-18: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18
- Variante CIRF-Backward-Greedy-24: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-24
