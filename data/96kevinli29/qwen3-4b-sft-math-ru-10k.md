# 96kevinli29/Qwen3-4B-SFT-Math-ru-10k

## Resumen

Qwen3-4B-SFT-Math-ru-10k es un ajuste fino de parámetros completos (SFT) del modelo Qwen3-4B de Alibaba, entrenado exclusivamente sobre trazas de razonamiento matemático en ruso. Lo desarrolla un equipo académico (Hongyang Li, Xiao Li, Caesar Wu, Grégoire Danoy y Pascal Bouvry) en colaboración con la comunidad Sea-Fill, y su propósito no es ser un modelo de producción, sino un **checkpoint de control** dentro del artículo *What Does Post-Training Change in Multilingual Reasoning?* (arXiv:2609.37104). La pregunta que responde es concreta: si entrenar en seis idiomas a la vez degrada el rendimiento frente a entrenar en uno solo.

El modelo parte de la arquitectura transformer densa de Qwen3-4B (4.411 millones de parámetros, contexto nativo de 32.768 tokens) y se entrena sobre 9.179 soluciones matemáticas de cadena de pensamiento larga, traducidas automáticamente del inglés a partir del dataset OpenR1-Math-220k. Se libera el checkpoint de la época 1 de las 3 configuradas, con licencia Apache 2.0.

Su relevancia es metodológica más que práctica: permite aislar el efecto del multilingüismo en el post-entrenamiento y comparar directamente contra el modelo multilingüe de seis idiomas del mismo autor. Para cualquier uso real se recomienda ese checkpoint multilingüe en lugar de este.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (familia Qwen3) |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (presupuesto de entrenamiento); 24.576 tokens en evaluación |
| Tipos de cuantización | No disponible en la información proporcionada (pesos en safetensors, compatibles con cuantización estándar de transformers) |
| Idiomas soportados | Ruso (entrenamiento); evaluado en ruso e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 8,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer causal densa de Qwen3-4B, con plantilla de chat propia de Qwen3 y modo *thinking* activado, de forma que el razonamiento se emite dentro de las etiquetas `<think> … </think>`. El ajuste fino es de parámetros completos, no LoRA: se entrena toda la red con el *trainer* SFT de verl sobre FSDP, en 4 × A100-40GB en un nodo del clúster MeluXina (LuxProvide).

Los detalles de entrenamiento son: objetivo de entropía cruzada a nivel de token sobre la respuesta completa (incluido el razonamiento), optimizador AdamW con lr 2e-5 y decaimiento coseno hasta 0,1×, warmup ratio 0,01, weight decay 0,1, batch de 4 trazas con contexto de hasta 32.768 tokens, precisión bfloat16 y recorte de gradiente 1,0. Se configuraron 3 épocas y se publica la época 1. El corpus son 9.179 trazas largas de matemáticas en ruso, traducidas automáticamente desde las trazas en inglés de OpenR1-Math-220k; no se documenta RLHF ni DPO, solo SFT supervisado.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen3.
- Razonamiento matemático de competición con cadena de pensamiento larga (hasta 24.576 tokens de generación en la evaluación publicada).
- Modo *thinking* nativo, con la traza de razonamiento visible entre `<think>` y `</think>`.
- Razonamiento y respuesta en ruso; también evaluado en inglés.
- Generación de muestras múltiples (evaluado con 16 muestras por problema a temperatura 0,7).
- No se documenta soporte de *tool calling*, agentes, visión ni audio en la información disponible.
- Capacidades multilingües limitadas al ruso como idioma de entrenamiento (el resto de idiomas no se ha evaluado).

## Casos de uso

- **Control experimental en investigación sobre multilingüismo:** usar este checkpoint como referencia monolingüe frente al modelo de seis idiomas del mismo autor para medir si el entrenamiento multilingüe conjunto degrada el razonamiento en ruso. Es su propósito declarado y el uso para el que fue diseñado.
- **Estudio de transferencia de idioma en SFT:** comparar las trazas en ruso de este modelo con las de los checkpoints en inglés, chino, español, francés y árabe del mismo autor para analizar cómo cambia la fidelidad del idioma y la tasa de finalización según el idioma de entrenamiento.
- **Evaluación de traducción automática de datos de razonamiento:** al entrenarse sobre trazas traducidas del inglés, sirve para medir el coste de usar datos sintéticos traducidos en lugar de datos nativos en tareas de matemáticas.
- **Reproducción de resultados académicos:** el artículo y el dataset de evaluación Multilingual-Math-Reasoning-Eval están publicados, de modo que el checkpoint permite reproducir la columna rusa de la tabla de resultados con el mismo protocolo (70 problemas, 16 muestras, temperatura 0,7).
- **Análisis de fallos por bucles de repetición:** con un 27,9% de respuestas no finalizadas en ruso, es un caso útil para estudiar bucles degenerados en generaciones largas y probar estrategias de mitigación (recorte de contexto, penalizaciones, parada temprana).
- **Docencia y demostración de SFT supervisado:** el repositorio documenta hiperparámetros, hardware y framework completos, lo que lo convierte en un ejemplo reproducible de ajuste fino de parámetros completos con verl y FSDP sobre un modelo de 4B.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 70 problemas de competición (30 de AIME-2026 y 40 de AMC-2023) por idioma, 16 muestras por problema a temperatura 0,7 y presupuesto de 24.576 tokens. Una respuesta se considera entregada (J) cuando es correcta (C), está en el idioma solicitado (L) y termina (T).

| Idioma | Correctas | En idioma | No finalizadas | J@1 | J@16 | J@1 Qwen3-4B publicado | J@1 SFT multilingüe |
|---|---|---|---|---|---|---|---|
| Inglés | 68,1% | 99,7% | 8,1% | 67,9% | 88,6% | 80,4% | 71,7% |
| Ruso | 61,4% | 99,7% | 27,9% | 59,1% | 84,3% | 69,1% | 61,2% |

El dato más relevante es que este checkpoint monolingüe queda por debajo tanto del Qwen3-4B original como del SFT multilingüe en J@1, en ambos idiomas. El autor no publica MMLU, HumanEval ni GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 9 GB solo para pesos (4,41B parámetros), más caché KV para contextos de hasta 24.576–32.768 tokens, lo que eleva el consumo real muy por encima de esa cifra en generaciones largas.
- GPU recomendadas: A100-40GB o H100 para contexto completo sin cuantizar; el entrenamiento se hizo con 4 × A100-40GB.
- GPU de consumo: cabe en RTX 4090 (24 GB) y en GPUs de 16 GB si se cuantiza a 8 bits o 4 bits; en 12 GB solo con cuantización agresiva y contextos reducidos.
- Despliegue: transformers 4.x y 5.x (soporte declarado), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio), y previsiblemente llama.cpp/Ollama/vLLM mediante conversión a GGUF, aunque el autor no publica artefactos GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | J@1 ruso | J@1 inglés | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-4B-SFT-Math-ru-10k (este) | 4,41B | 32.768 | 59,1% | 67,9% | Apache 2.0 | Hugging Face |
| Qwen3-4B-SFT-Math-Multilingual | No disponible | No disponible | 61,2% | 71,7% | Apache 2.0 | Hugging Face |
| Qwen3-4B (publicado) | 4,41B (aprox.) | 32.768 (Qwen3) | 69,1% | 80,4% | Apache 2.0 | Hugging Face |

La comparación es directa porque los tres se evalúan con el mismo protocolo y el mismo conjunto de problemas. El modelo base supera a ambos ajustes finos en J@1, y el multilingüe supera al monolingüe en los dos idiomas medidos.

## Limitaciones y advertencias

- Es un checkpoint de control: una semilla, un idioma, solo matemáticas y datos de entrenamiento traducidos automáticamente. No está pensado para uso en producción.
- Rendimiento inferior al modelo base Qwen3-4B en J@1 tanto en ruso (59,1% frente a 69,1%) como en inglés (67,9% frente a 80,4%).
- Tasa alta de respuestas no finalizadas en ruso (27,9%), con tendencia documentada a entrar en bucles de repetición en problemas largos.
- Solo se ha evaluado en ruso e inglés; el comportamiento en otros idiomas es desconocido.
- El entrenamiento se limita a matemáticas; no hay evidencia de conservación de capacidades generales, código o instrucciones fuera de ese dominio.
- Riesgo de alucinación y de razonamiento plausible pero incorrecto inherente a los modelos de cadena de pensamiento, agravado por datos traducidos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B arrastra sus propias condiciones; conviene revisarlas antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-ru-10k
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Artículo: https://arxiv.org/abs/2609.37104
- Dataset de entrenamiento: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de evaluación: https://huggingface.co/datasets/96kevinli29/Multilingual-Math-Reasoning-Eval
- Modelo multilingüe recomendado: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-Multilingual
- Checkpoints de control: [inglés](https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-en-10k), [chino](https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-zh-10k), [español](https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-es-10k), [francés](https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-fr-10k), [árabe](https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-ar-10k), [inglés a 43K](https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-en-43k)
- Framework de entrenamiento: https://github.com/volcengine/verl
- Comunidad mantenedora: https://huggingface.co/SeaFill2025
