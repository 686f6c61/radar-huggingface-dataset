# caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0

## Resumen

MiniMind-Dense-64M-Mixed-SFT-v1.0 es un modelo de lenguaje experimental en inglés de solo 63,9 millones de parámetros, desarrollado por el usuario caspar y publicado en Hugging Face en octubre de 2026 bajo licencia Apache-2.0. Se trata de un transformer denso (no MoE) basado en la arquitectura MiniMind, preentrenado durante 2 épocas sobre FineWeb-Edu y ajustado posteriormente con una mezcla de datos de instrucción (UltraChat, SmolTalk y GSM8K) en un único proceso de SFT mixto.

El problema que aborda es principalmente educativo y experimental: demostrar un pipeline completo de preentrenamiento y SFT a escala mínima, con decontaminación verificable y métricas publicadas. No es un modelo de producción: su propio autor advierte que no es un asistente de razonamiento fiable, y sus resultados en GSM8K (1,14 % en cero-shot) lo confirman. Su relevancia está en la reproducibilidad y transparencia del entrenamiento, no en el rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (MiniMind Dense) |
| Parámetros totales | 63.912.192 (63,9 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 340 tokens en entrenamiento (el buffer arquitectónico permite más, pero sin validar) |
| Tipos de cuantización | No disponible (pesos en FP16 safetensors; se recomienda cargar en FP32) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 (aplicable al modelo y código, no a los datasets de origen) |
| Formato de pesos | safetensors (FP16), con código de modelo personalizado (custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso con 8 capas, tamaño oculto de 768 y un vocabulario muy reducido de 6.400 tokens, con embeddings atados (tied embeddings). El código de arquitectura deriva del repositorio MiniMind de jingyaogong (Apache-2.0) y requiere `trust_remote_code=True` en transformers.

El preentrenamiento se realizó sobre el subconjunto sample/10BT de FineWeb-Edu filtrado por puntuación >= 3,5, durante 2 épocas, con ventanas de 340 tokens y paso 339, descartando la última ventana incompleta por documento. El SFT mixto combinó UltraChat train_sft (207.865 conversaciones), SmolTalk all/train (1.020.912) y GSM8K main/train (6.851), tras deduplicación y exclusión de prompts retenidos: 1.235.628 conversaciones y 5.396.469 ventanas por época, sin sobremuestreo. El entrenamiento usó pérdida solo del asistente (assistant-only loss), 2 épocas, 84.320 actualizaciones de optimizador, BF16, batch efectivo de 128 y LR pico de 5e-5. Se aplicaron comprobaciones exactas de substrings sobre prompts retenidos y preguntas de GSM8K, aunque no se garantiza decontaminación a nivel de paráfrasis o de preentrenamiento.

## Capacidades

- Generación de texto conversacional en inglés mediante chat template, con pérdida entrenada solo en turnos del asistente
- Respuestas a preguntas generales de conocimiento (calidad limitada por el tamaño del modelo)
- Intento de resolución de problemas matemáticos elementales (entrenado con GSM8K), con resultados muy pobres: 1,14 % de acierto estricto
- Generación greedy determinista documentada (el ejemplo oficial usa `do_sample=False`)
- No hay soporte documentado de tool calling, function calling, agentes, visión ni audio
- No es multilingüe: entrenado exclusivamente en inglés

## Casos de uso

- **Docencia y aprendizaje de LLMs desde cero**: ideal para estudiar un pipeline completo de preentrenamiento + SFT con hiperparámetros, decontaminación y métricas publicadas; su tamaño de 0,1 GB permite entrenar, inspeccionar y modificar el modelo en una GPU doméstica.
- **Investigación en interpretabilidad**: al tener solo 8 capas y 768 de dimensión oculta, es manejable para análisis de activaciones, sondas y visualización de atención sin hardware especializado.
- **Experimentación con tokenizadores de vocabulario reducido**: su vocabulario de 6.400 tokens permite estudiar el efecto de vocabularios pequeños en compresión y generación.
- **Pruebas de decontaminación y evaluación de benchmarks**: incluye evaluation.json con métricas antes/después del SFT, útil como referencia para metodologías de evaluación estricta (scoring `#### number` en GSM8K).
- **Prototipado de pipelines de inferencia con código personalizado**: sirve como caso real para probar `trust_remote_code`, chat templates con bloques de thinking y límites de contexto ajustados.
- **Modelo base para fine-tuning educativo**: su licencia Apache-2.0 y su tamaño permiten continuar el entrenamiento o hacer LoRA en hardware muy modesto, con fines de experimentación.
- **Comparación densa vs. MoE a escala mínima**: útil como punto de referencia denso en estudios de eficiencia a tamaños muy pequeños.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| GSM8K main/test (1.319 preguntas, zero-shot greedy, scoring estricto `#### number`) | 15/1319 (1,14 %) |
| GSM8K main/test (fallback de último número) | 23/1319 |
| PPL validación assistant-only (antes → después de SFT, 512 ventanas fijas por fuente) | 11,7068 → 3,7949 |

No se han publicado comparaciones con otros modelos en la información disponible. El propio autor advierte que una PPL baja no demuestra precisión de razonamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (63,9 M de parámetros ≈ 256 MB en FP32, ~128 MB en FP16); cualquier GPU moderna o incluso CPU es suficiente
- GPU recomendadas: no se requiere GPU dedicada; ejecutable en portátiles, CPUs y cualquier GPU de consumo (GTX 1650, RTX 3060, etc.)
- Cabe con holgura en cualquier GPU de consumo; el repo completo ocupa 0,1 GB
- Despliegue: transformers con `trust_remote_code=True` (vía requirements.txt del repo); no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI dado el código de modelo personalizado y el vocabulario propio
- Latencia y throughput: no disponibles; por tamaño, se espera generación rápida incluso en CPU, limitada a 340 tokens de contexto y hasta 256 tokens nuevos

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MiniMind-Dense-64M-Mixed-SFT-v1.0 | 63,9 M | 340 tokens (entrenamiento) | Apache-2.0 | Experimental, GSM8K 1,14 %, vocabulario 6.400 |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens (131.072 con YaRN) | Qwen Research / Apache-2.0 (variantes) | Multilingüe (29+ idiomas), tool calling, rendimiento muy superior |
| SmolLM2-135M-Instruct | 135 M | 8.192 tokens | Apache-2.0 | Entrenado con ~11 billones de tokens, pensado para casos de uso en dispositivo |
| TinyLlama-1.1B-Chat | 1.100 M | 2.048 tokens | Apache-2.0 | Entrenado con 3 billones de tokens, capacidad conversacional real |

La comparación muestra que este modelo se sitúa por debajo de alternativas abiertas de tamaño similar o superior en todas las métricas de capacidad; su valor diferencial es la transparencia del pipeline de entrenamiento, no el rendimiento.

## Limitaciones y advertencias

- Rendimiento de razonamiento muy bajo: 1,14 % en GSM8K zero-shot; el propio autor lo califica de experimental y no fiable como asistente de razonamiento
- Riesgo alto de alucinación, errores aritméticos, repeticiones en la salida y fallos en el seguimiento de instrucciones, documentados explícitamente en la model card
- Contexto efectivo limitado a 340 tokens (lo usado en entrenamiento); contextos más largos no están validados y pueden degradar la calidad
- Solo inglés; no apto para castellano ni otros idiomas
- Requiere `trust_remote_code=True` y revisión previa de `model_minimind.py`, lo que implica ejecutar código personalizado: revisar siempre antes de usar
- El chat template exige eliminar el bloque de thinking vacío para coincidir con el preprocesamiento del SFT; no hacerlo degrada la salida
- Los límites cortos de contexto y salida pueden truncar soluciones (por ejemplo, en GSM8K)
- La decontaminación solo garantiza coincidencias exactas de substrings; no cubre paráfrasis ni contaminación en preentrenamiento
- Apache-2.0 cubre el modelo y el código, no relicencia los datasets de origen, cuyos términos siguen aplicando
- Uso comercial posible por licencia, pero desaconsejable en producción dada la calidad del modelo

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caspar/MiniMind-Dense-64M-Mixed-SFT-v1.0
- Repositorio original de MiniMind (arquitectura derivada): https://github.com/jingyaogong/minimind
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
  - https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
  - https://huggingface.co/datasets/HuggingFaceTB/smoltalk
  - https://huggingface.co/datasets/openai/gsm8k
