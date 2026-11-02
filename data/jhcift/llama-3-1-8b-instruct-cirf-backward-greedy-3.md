# JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3

## Resumen

Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3 es un ajuste fino supervisado del modelo meta-llama/Llama-3.1-8B-Instruct desarrollado por el usuario JhCIFT. Introduce la metodología CIRF (functional tokens), que amplía el vocabulario del modelo con 514 tokens nuevos (`[sof]`, `[eof]` y `[f_0]` a `[f_511]`) para que el modelo emita trazas de razonamiento estructuradas mediante tokens funcionales con valores de resultado opcionales, antes de producir la respuesta final.

La variante "Backward-Greedy-3" se construye a partir del modelo de resultado completo tras una selección de resultados backward-greedy con un presupuesto de como máximo 3 tokens de resultado explícitos por ejemplo de entrenamiento. La actualización LoRA se fusiona en los pesos densos BF16 y los 514 tokens nuevos se incluyen con sus filas de embedding y salida entrenadas, de modo que el modelo se carga con Transformers estándar sin necesidad de PEFT, checkpoint base ni código CIRF.

El modelo mantiene la arquitectura transformer densa de Llama 3.1 8B, con 8.034.471.936 parámetros y un contexto heredado de la familia Llama 3.1. Es relevante por su enfoque poco habitual de razonamiento estructurado mediante tokens funcionales y por publicar resultados de evaluación reproducibles en tareas aritméticas y de sentido común.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), ajuste fino con LoRA fusionado |
| Parametros totales | 8.034.471.936 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Llama 3.1 8B Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | en |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer densa de Llama 3.1 8B Instruct. El ajuste fino se realiza mediante LoRA, que posteriormente se fusiona en los pesos densos en BF16. La innovación principal es la incorporación de 514 tokens funcionales nuevos (`[sof]` como inicio de traza, `[eof]` como fin de traza y `[f_0]` a `[f_511]` como tokens funcionales intermedios) con sus filas de embedding y salida entrenadas. El modelo emite una traza de tokens funcionales con valores de resultado opcionales, seguida de `[eof]` y la respuesta final.

El entrenamiento se realiza en dos fases según la model card: primero un modelo de resultado completo, y después una selección de resultados backward-greedy con un presupuesto máximo de 3 tokens de resultado explícitos por ejemplo. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El prompt no usa plantilla de chat: el formato es `<|begin_of_text|>QUESTION[sof]`, y la decodificación debe hacerse con `skip_special_tokens=False` para preservar los límites de la traza.

## Capacidades

- Generación de texto y razonamiento estructurado mediante trazas de tokens funcionales.
- Razonamiento aritmético y matemático (evaluado en GSM8K, MultiArith, SVAMP).
- Razonamiento de sentido común (evaluado en CommonsenseQA).
- Razonamiento sobre estados y paridad (evaluado en Coin Flip).
- Emisión de trazas intermedias con valores de resultado opcionales antes de la respuesta final.
- Carga directa con Transformers estándar, sin PEFT ni código CIRF adicional.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking separado.

## Casos de uso

- Evaluación de razonamiento aritmético: el modelo puede resolver problemas de matemáticas elementales (GSM8K, MultiArith, SVAMP) emitiendo trazas funcionales intermedias que permiten inspeccionar el proceso de razonamiento, útil para investigación sobre interpretabilidad.
- Investigación en razonamiento estructurado: sirve como banco de pruebas para comparar metodologías de tokens funcionales frente a cadenas de pensamiento en lenguaje natural, dado que publica variantes con distintos presupuestos de tokens de resultado (3, 6, 12, 18).
- Reproducción de experimentos: al incluir `inference.py`, `test_results.json`, `training_config.json`, `provenance.json` y `export_verification.json`, permite reproducir el protocolo de evaluación con solo Torch y Transformers.
- Análisis de paridad y estados: adecuado para tareas de seguimiento de estado (Coin Flip) donde el modelo debe rastrear transformaciones paso a paso.
- Punto de partida para ajustes posteriores: al estar los pesos LoRA fusionados y los tokens nuevos incluidos, puede usarse como checkpoint base para nuevos experimentos sin gestionar adaptadores PEFT.
- Docencia y divulgación: útil para explicar cómo funcionan los tokens especiales y las trazas de razonamiento en modelos de lenguaje, gracias a su formato de prompt simple y sin plantilla de chat.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificación greedy, máximo 384 tokens nuevos y 32 tokens funcionales, evaluación por exact-match):

| Test set | Preguntas | Precisión |
|---|---:|---:|
| GSM8K | 1.319 | 46,47% |
| MultiArith | 178 | 99,44% |
| SVAMP | 300 | 76,00% |
| CommonsenseQA | 1.221 | 79,77% |
| Coin Flip (corregido por paridad) | 3.333 | 75,61% |

La model card indica que los resultados completos por dataset, incluidos MATH-500, StrategyQA y latencia batch-1, están en `test_results.json`. Coin Flip se puntúa contra la paridad de los lanzamientos indicados en la pregunta, porque aproximadamente el 20% de las etiquetas del dataset no coinciden con ella. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 20-24 GB.
- Cuantización: no se documentan tipos de cuantización publicados; sería necesario generar GGUF/AWQ/GPTQ a partir de los safetensors.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para BF16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) en BF16; en GPUs de 16 GB requeriría cuantización no publicada.
- Opciones de despliegue: Transformers (protocolo oficial con `inference.py`), text-generation-inference (tag `text-generation-inference`), y endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte verificado de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a `test_results.json` para latencia batch-1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3 | 8.034.471.936 | no disponible | llama3.1 | HuggingFace (repo propio) |
| meta-llama/Llama-3.1-8B-Instruct | 8.030.000.000 aprox. | 128.000 tokens (familia Llama 3.1) | llama3.1 | HuggingFace (oficial Meta) |
| JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full | no disponible | no disponible | llama3.1 | HuggingFace (repo propio) |
| JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results | no disponible | no disponible | llama3.1 | HuggingFace (repo propio) |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada. Las variantes CIRF comparten base y licencia, diferenciándose en el presupuesto de tokens de resultado y en la estrategia de selección.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- La precisión en GSM8K es moderada (46,47%), lo que sugiere limitaciones en razonamiento matemático complejo pese al buen resultado en MultiArith.
- Requiere un protocolo de inferencia específico: sin plantilla de chat, prompt `<|begin_of_text|>QUESTION[sof]`, decodificación con `skip_special_tokens=False` y parada en EOS (no en `[eof]`). Usar una plantilla de chat estándar degradará la salida.
- Riesgo de alucinación inherente a los modelos de 8B; no se documentan evaluaciones de factualidad.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial y obligaciones de atribución; debe revisarse `LICENSE` y `USE_POLICY.md`.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validación comunitaria independiente.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- El contexto máximo efectivo no está confirmado en la model card; no debe asumirse el contexto completo de Llama 3.1 sin verificación.
- El límite de 32 tokens funcionales durante la evaluación puede truncar trazas largas y forzar `[eof]`, lo que afecta a la reproducibilidad de resultados en problemas complejos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-3
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante Full: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Full
- Variante Zero-Results: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Zero-Results
- Variante Backward-Greedy-6: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-6
- Variante Backward-Greedy-12: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-12
- Variante Backward-Greedy-18: https://huggingface.co/JhCIFT/Llama-3.1-8B-Instruct-CIRF-Backward-Greedy-18
