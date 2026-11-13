# 96kevinli29/Qwen3-4B-SFT-Math-fr-10k

## Resumen
Qwen3-4B-SFT-Math-fr-10k es un ajuste fino supervisado (SFT) de Qwen3-4B desarrollado por Hongyang Li, Xiao Li, Caesar Wu, Grégoire Danoy y Pascal Bouvry, y mantenido por la comunidad Sea-Fill. El modelo parte de los pesos de Qwen3-4B y se entrena con 9.400 trazas largas de razonamiento matemático (chain-of-thought) escritas en francés, traducidas automáticamente desde el dataset OpenR1-Math en inglés. Se publica como checkpoint de la época 1.

Su propósito no es ser un modelo de producción, sino un control experimental del artículo "What Does Post-Training Change in Multilingual Reasoning?" (arXiv:2609.37104). La pregunta que responde es si entrenar en seis idiomas a la vez degrada el rendimiento respecto a entrenar en uno solo; por eso existe junto a variantes equivalentes en inglés, chino, español, árabe y ruso, y frente al modelo multilingüe de seis idiomas.

Arquitectura transformer causal de tipo Qwen3 con 4.411.424.256 parámetros, licencia Apache 2.0 y plantilla de chat con modo thinking. Su interés actual es metodológico: permite aislar el efecto del idioma de entrenamiento en el razonamiento matemático de modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia Qwen3) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens en entrenamiento; 24.576 tokens de presupuesto de generación en evaluación |
| Tipos de cuantizacion | no disponible (el repo publica safetensors en bfloat16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | fr (entrenamiento y evaluación); evaluado también en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un ajuste fino de parámetro completo sobre Qwen3-4B, un transformer causal decoder-only con plantilla de chat que activa el razonamiento dentro de las etiquetas ``. El objetivo es entropía cruzada a nivel de token sobre la respuesta completa, incluyendo la traza de razonamiento. Se usa AdamW con learning rate 2e-5, decaimiento coseno hasta 0,1×, warmup ratio 0,01, weight decay 0,1, precisión bfloat16 y gradient clipping de 1,0. El batch es de 4 trazas con hasta 32.768 tokens de contexto.

El entrenamiento se ejecutó con el trainer SFT de verl sobre FSDP y parámetro completo, en 4 × A100-40GB en un nodo de MeluXina (LuxProvide). Se configuraron 3 épocas y se publica únicamente la época 1. Los datos son 9.400 soluciones matemáticas de cadena de pensamiento larga en francés, traducidas automáticamente desde OpenR1-Math (220k trazas en inglés). No se documenta RLHF ni DPO; es SFT puro sobre datos traducidos por máquina, un detalle relevante para interpretar sus resultados.

## Capacidades
- Generación de texto y razonamiento matemático con cadena de pensamiento larga en francés, con salida de la traza dentro de `<think> ... </think>`.
- Resolución de problemas de competición (AIME, AMC) con presupuestos de generación de hasta 24.576 tokens.
- Razonamiento multilingüe limitado: entrenado en francés, evaluado en francés e inglés; no se documenta soporte fiable de otros idiomas.
- Conversación multi-turno mediante la plantilla de chat de Qwen3.
- Compatible con text-generation-inference y endpoints compatibles según los tags del repo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso
- Reproducción de experimentos de investigación: sirve como control de un solo idioma para medir el coste de entrenar en seis idiomas a la vez frente a uno solo, comparando las métricas J@1 y J@16 sobre el mismo conjunto de problemas.
- Evaluación de razonamiento matemático en francés: permite medir si un modelo pequeño mantiene la traza de razonamiento en el idioma solicitado (99,6% en francés según la model card) y termina la respuesta.
- Estudio de transferencia entre idiomas: al existir variantes en inglés, chino, español, árabe y ruso con el mismo pipeline, se puede comparar cómo el idioma de entrenamiento afecta al rendimiento en inglés (70,9% de acierto en este checkpoint).
- Generación de soluciones paso a paso para datasets educativos en francés: con temperatura 0,7 y 16 muestras por problema se obtienen soluciones diversas que pueden filtrarse por corrección.
- Análisis de fallos por bucles de repetición: el 13,6% de respuestas no terminadas en francés lo convierte en un caso de estudio útil para detectar y mitigar degeneración en generaciones largas.
- Punto de partida para ajustes posteriores en francés: al ser Apache 2.0 y safetensors, se puede cargar con transformers 4.x y 5.x y continuar el entrenamiento con datos propios.
- Docencia y divulgación: ejemplo reproducible de SFT de parámetro completo con verl y FSDP sobre 4 × A100-40GB.

## Benchmarks y rendimiento

| Idioma | Correct | In language | Did not finish | J@1 | J@16 | J@1, Qwen3-4B publicado | J@1, SFT multilingüe |
|---|---|---|---|---|---|---|---|
| Inglés | 70,9% | 100,0% | 6,2% | 70,7% | 91,4% | 80,4% | 71,7% |
| Francés | 63,4% | 99,6% | 13,6% | 62,9% | 84,3% | 0,0% | 64,6% |

Evaluación sobre 70 problemas de competición (30 de AIME-2026 y 40 de AMC-2023) por idioma, del dataset Multilingual-Math-Reasoning-Eval, con 16 muestras por problema a temperatura 0,7 y presupuesto de 24.576 tokens. Una respuesta se considera "entregada" (J = C ∧ L ∧ T) cuando es correcta, la traza visible está en el idioma solicitado y la generación termina. El modelo se evaluó solo en francés e inglés. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware
- Inferencia en bfloat16: aproximadamente 8,8 GB de pesos, más caché KV; con 24.576 tokens de generación el consumo de memoria crece de forma notable, por lo que se recomienda al menos 24 GB de VRAM para contextos largos.
- GPU recomendadas: A100-40GB o H100 para el presupuesto completo de 24.576 tokens; RTX 4090 (24 GB) puede servir con contextos reducidos o cuantización.
- Cabe en GPU de consumo con cuantización de 4-8 bits, aunque no se publican pesos GGUF/AWQ/GPTQ en el repo.
- Despliegue: transformers 4.x y 5.x (soporte documentado), text-generation-inference y endpoints compatibles según los tags; vLLM, llama.cpp, Ollama y TGI no se documentan explícitamente para este checkpoint.
- Entrenamiento de referencia: 4 × A100-40GB en un nodo, batch de 4 trazas de hasta 32.768 tokens, bfloat16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | J@1 francés | J@1 inglés | Licencia |
|---|---|---|---|---|---|
| Qwen3-4B-SFT-Math-fr-10k (este) | 4,41B | 32.768 (entrenamiento) | 62,9% | 70,7% | Apache 2.0 |
| Qwen3-4B-SFT-Math-Multilingual | no disponible | no disponible | 64,6% | 71,7% | Apache 2.0 |
| Qwen3-4B publicado | 4,41B (aprox.) | no disponible en la información | 0,0% | 80,4% | Apache 2.0 |
| Qwen3-4B-SFT-Math-en-10k | no disponible | no disponible | no disponible | no disponible | Apache 2.0 |

El modelo base publicado obtiene 0,0% en J@1 francés porque no entrega la traza en el idioma solicitado, no porque no sepa resolver los problemas. El SFT multilingüe supera ligeramente a este control en ambos idiomas, lo que sugiere que entrenar en seis idiomas no penaliza de forma apreciable en este régimen.

## Limitaciones y advertencias
- Checkpoint de control: una sola semilla, un solo idioma, solo matemáticas y datos de entrenamiento traducidos por máquina.
- Bucles de repetición en problemas largos: 13,6% de respuestas no terminadas en francés y 6,2% en inglés.
- Pérdida de rendimiento en inglés respecto al Qwen3-4B publicado (70,7% frente a 80,4% en J@1), efecto del ajuste fino monolingüe.
- Solo se evaluó en francés e inglés; el comportamiento en otros idiomas no está documentado y no debe asumirse.
- Riesgo de alucinación en pasos intermedios de la cadena de pensamiento, habitual en SFT sobre trazas traducidas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción y carece de garantías de robustez.
- No se documentan sesgos específicos ni evaluaciones de seguridad.
- El repo ocupa 8,8 GB y publica solo safetensors; no hay pesos cuantizados listos para usar.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-fr-10k
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Artículo: https://arxiv.org/abs/2609.37104
- Dataset de entrenamiento: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de evaluación: https://huggingface.co/datasets/96kevinli29/Multilingual-Math-Reasoning-Eval
- Variante multilingüe: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-Multilingual
- Variante inglesa: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-en-10k
- Variante china: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-zh-10k
- Variante española: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-es-10k
- Variante árabe: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-ar-10k
- Variante rusa: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-ru-10k
- Variante inglesa a 43K: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-en-43k
- Framework de entrenamiento verl: https://github.com/volcengine/verl
- Comunidad mantenedora: https://huggingface.co/SeaFill2025
