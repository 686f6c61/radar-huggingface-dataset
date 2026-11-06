# JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18

## Resumen

Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18 es un ajuste fino del modelo meta-llama/Llama-3.1-8B-Instruct desarrollado por el usuario JhCIFT, orientado a razonamiento explícito mediante un mecanismo denominado CIRF (functional tokens). El modelo parte de la arquitectura transformer densa de Llama 3.1 8B (8.034.471.936 parámetros) y añade 514 tokens nuevos: `[sof]`, `[eof]` y `[f_0]` a `[f_511]`, que actúan como trazas de razonamiento intermedias antes de emitir la respuesta final.

La variante "Backward-Greedy-18" se obtiene a partir del modelo CIRF-Full tras un proceso de selección de resultados backward-greedy con un presupuesto máximo de 18 tokens de resultado explícitos por ejemplo de entrenamiento. La actualización LoRA se fusiona en los pesos densos BF16, de modo que el checkpoint se carga con Transformers estándar, sin necesidad de PEFT ni del código CIRF original.

El modelo es relevante en el contexto de la investigación sobre razonamiento estructurado en modelos pequeños: en lugar de generar cadenas de pensamiento en lenguaje natural, emite una secuencia de tokens funcionales que codifican pasos intermedios, lo que permite controlar el presupuesto de razonamiento y medir su impacto en precisión. Su licencia es la Llama 3.1 Community License y solo declara soporte para inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), con vocabulario extendido de 514 tokens funcionales |
| Parámetros totales | 8.034.471.936 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en BF16/safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

La base es un transformer decoder-only denso de Llama 3.1 8B Instruct, con 8.034.471.936 parámetros. Sobre esa base se añade un vocabulario de 514 tokens funcionales (`[sof]` como marcador de inicio de traza, `[f_0]` a `[f_511]` como pasos intermedios y `[eof]` como fin de traza), con sus correspondientes filas de embedding y de salida entrenadas. El ajuste se realiza mediante LoRA, que posteriormente se fusiona en los pesos densos BF16 para producir un checkpoint autónomo.

El entrenamiento parte del modelo CIRF-Full y aplica una selección de resultados backward-greedy con un presupuesto máximo de 18 tokens de resultado explícitos por ejemplo. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. El formato de prompt es específico: `<|begin_of_text|>QUESTION[sof]`, sin chat template, y el modelo genera una traza de tokens funcionales con valores de resultado opcionales, seguida de `[eof]` y la respuesta final, terminando en el token EOS del tokenizador. La decodificación debe hacerse con `skip_special_tokens=False` y parada en EOS (no en `[eof]`) para preservar los límites de la traza.

## Capacidades

- Generación de texto y razonamiento explícito mediante trazas de tokens funcionales (`[f_0]` a `[f_511]`) antes de la respuesta final.
- Razonamiento aritmético y matemático de varios pasos, evaluado en GSM8K, MultiArith, SVAMP y MATH-500.
- Razonamiento de sentido común (CommonsenseQA, StrategyQA).
- Resolución de problemas de paridad y seguimiento de estado (Coin Flip).
- Control del presupuesto de razonamiento: la traza puede limitarse a un número máximo de tokens funcionales (32 en la evaluación publicada).
- Carga directa con Transformers estándar, sin PEFT ni código CIRF adicional.
- No dispone de chat template; el formato de entrada es fijo y orientado a pregunta-respuesta.
- No se declaran capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Evaluación de razonamiento aritmético controlado: el modelo permite fijar un presupuesto máximo de tokens funcionales y medir cómo varía la precisión, útil para investigación sobre test-time compute en modelos de 8B.
- Investigación sobre razonamiento estructurado: sirve como punto de comparación frente a modelos que generan cadenas de pensamiento en lenguaje natural, al sustituir la traza textual por tokens discretos.
- Clasificación y resolución de problemas de sentido común: con un 79,61% en CommonsenseQA, puede emplearse en pipelines de respuesta a preguntas de conocimiento general en inglés.
- Problemas de paridad y seguimiento de estado: su 82,81% en Coin Flip (corregido por paridad) lo hace adecuado para tareas de simulación de estados discretos.
- Reproducción de experimentos: los ficheros `test_results.json`, `training_config.json`, `provenance.json` y `export_verification.json` permiten replicar el protocolo de evaluación con `inference.py`.
- Generación de trazas auditables: al separar traza (`[sof]`...`[eof]`) y respuesta final, facilita la inspección de los pasos intermedios en entornos de depuración.
- Fine-tuning posterior: al estar fusionado en BF16 y cargarse con Transformers, puede servir como checkpoint base para nuevos ajustes con LoRA.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificación greedy, máximo 384 tokens nuevos y 32 tokens funcionales, exact-match):

| Test set | Preguntas | Precisión |
|---|---:|---:|
| GSM8K | 1.319 | 58,45% |
| MultiArith | 178 | 99,44% |
| SVAMP | 300 | 78,67% |
| CommonsenseQA | 1.221 | 79,61% |
| Coin Flip (corregido por paridad) | 3.333 | 82,81% |

La model card indica que los resultados completos por dataset, incluidos MATH-500, StrategyQA y latencia batch-1, están en `test_results.json`. No se proporcionan en la información disponible los valores concretos de MATH-500 ni StrategyQA, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 24 GB o más.
- En cuantización de 8 bits: en torno a 8-9 GB de VRAM; en 4 bits: en torno a 4-5 GB (estimaciones a partir del número de parámetros; no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16; RTX 3090/4080 (16 GB) viable con cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 en BF16 ajustado y en GPUs de 16 GB con cuantización.
- Opciones de despliegue: Transformers (protocolo oficial con `inference.py`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se confirma soporte de llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponibles en la información proporcionada (la model card remite a `test_results.json` para latencia batch-1).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18 | 8,03B | No disponible | Llama 3.1 Community | Razonamiento con tokens funcionales, presupuesto 18 |
| Llama-3.1-8B-Instruct-CIRF-Full | 8,03B | No disponible | Llama 3.1 Community | CIRF sin selección backward-greedy |
| Llama-3.1-8B-Instruct-CIRF-Zero-Results | 8,03B | No disponible | Llama 3.1 Community | CIRF sin valores de resultado explícitos |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K (modelo base) | Llama 3.1 Community | Instrucción general, sin tokens funcionales |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Solo declara soporte de inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- No usa chat template: el formato de prompt es rígido (`<|begin_of_text|>QUESTION[sof]`) y cualquier desviación puede degradar la salida.
- La decodificación debe hacerse con `skip_special_tokens=False` y parada en EOS; parar en `[eof]` o filtrar tokens especiales rompe el protocolo.
- La precisión en GSM8K es moderada (58,45%), muy inferior a la de modelos de razonamiento más grandes; no es adecuado para producción matemática de alta exigencia.
- La métrica de Coin Flip se corrige por paridad porque aproximadamente el 20% de las etiquetas del dataset discrepan con la paridad enunciada; conviene tenerlo en cuenta al comparar con otras publicaciones.
- Riesgo de alucinación inherente a un modelo de 8B ajustado sobre Llama 3.1; la traza de tokens funcionales no garantiza corrección lógica.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- Licencia Llama 3.1 Community: uso comercial permitido con condiciones (atribución "Built with Llama", política de uso aceptable y restricciones para entidades con más de 700 millones de usuarios mensuales); revisar `LICENSE` y `USE_POLICY.md`.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- No se declaran capacidades de tool calling ni de agentes; no debe asumirse su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- CIRF-Full: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full
- CIRF-Zero-Results: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results
- CIRF-Backward-Greedy-3: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3
- CIRF-Backward-Greedy-6: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6
- CIRF-Backward-Greedy-12: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12
