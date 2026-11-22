# salgr/salgrai_v2

## Resumen

SalgrAI-v2 es un modelo de lenguaje conversacional en ruso derivado de google/gemma-3-270m-it mediante fine-tuning completo y una poda posterior del vocabulario del tokenizer. Lo desarrolla Salgr, un autor individual que lo entrenó en una única RTX 3060. El resultado es un modelo de 130.754.176 parámetros (frente a los 268,1M del Gemma 3 270M-it original) que conserva el comportamiento del fine-tuning completo pero elimina la mayor parte de la tabla de embeddings multilingüe.

La relevancia técnica del modelo no está en su calidad, sino en la demostración del proceso de poda de vocabulario: de los 262.144 tokens del vocabulario original de Gemma 3 se conservan 47.544, suficientes para ruso, ASCII, puntuación tipográfica, emoji y los 256 tokens de byte. Las capas del transformer no se modifican ni se reentrenan, por lo que el modelo pierde la capacidad de emitir caracteres de otros alfabetos (chino, árabe, etc.) pero mantiene la misma distribución de salida en ruso.

El modelo está pensado explícitamente para experimentos, demos y aprendizaje, no para uso serio en producción. Su conocimiento factual es débil, no incorpora filtro de seguridad más allá del propio de Gemma y las respuestas por muestreo contienen ocasionalmente no-palabras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 3 decoder-only; 18 capas, hidden 640, 4 cabezas de atención (1 KV head), FFN 2048, atención sliding-window + global |
| Parámetros totales | 130.754.176 (100.326.016 en capas + 30.428.160 en embeddings) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | bfloat16 (safetensors), float16 (GGUF F16), Q8_0 (8 bits), Q4_K_M (4 bits) |
| Idiomas soportados | ruso (inglés solo en fragmentos, débil) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | safetensors, PyTorch state dict (.bin), GGUF (F16, Q8_0, Q4_K_M) |
| Vocabulario | 47.544 tokens (original: 262.144) |
| Modelo base | google/gemma-3-270m-it |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 3 270M-it: transformer decoder-only de 18 capas con dimensión oculta 640, 4 cabezas de atención con una sola KV head (GQA) y FFN de 2048, combinando atención de ventana deslizante con atención global. El fine-tuning se realizó en bf16 sobre el modelo base completo, con la tabla de embeddings congelada, optimizador AdamW con learning rate 2e-5, batch de 16 y 3 épocas, calculando la pérdida únicamente sobre los tokens del asistente.

La innovación principal es la poda del vocabulario. Se contó la frecuencia de cada token sobre aproximadamente 150M de caracteres de Wikipedia en ruso, 100M de caracteres de OpenSubtitles en ruso y todos los diálogos del fine-tuning. Se conservaron los tokens con al menos 10 apariciones en el corpus o presentes en los diálogos, los tokens puramente ASCII entre los primeros 20.000 ids originales, los 256 tokens de byte, los primeros 108 ids (especiales y de control) y, para cada token conservado, los tokens necesarios por merges BPE. Se descartaron los tokens con letras de otros alfabetos. El nuevo tokenizer.json se reconstruyó con el orden de merge original y se recortaron las filas correspondientes de la tabla de embeddings (que también actúa como capa de salida). Sobre texto no visto en el conteo (1.600 artículos de Wikipedia rusa), el tokenizer podado requiere un 0,57% más de tokens y el 67% de los textos se tokeniza exactamente igual que antes.

## Capacidades

- Generación de texto conversacional en ruso coloquial, orientado a un registro informal de Telegram (minúsculas, frases cortas, tono de amigo).
- Diálogo multi-turno con plantilla de chat de Gemma (`<start_of_turn>user ... <end_of_turn><start_of_turn>model ...`).
- Generación de fragmentos en inglés y manejo de dígitos y símbolos ASCII, aunque de forma débil.
- Emisión de emoji y puntuación tipográfica, conservados en el vocabulario podado.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni razonamiento multi-paso documentadas.
- No dispone de visión ni audio.
- No dispone de modo thinking.
- Capacidad multilingüe limitada al ruso; otros alfabetos llegan al modelo como bytes y no puede producirlos.

## Casos de uso

- Demo educativa de poda de vocabulario: sirve para ilustrar en un curso o tutorial cómo reducir una tabla de embeddings multilingüe a un subconjunto de un solo idioma sin reentrenar las capas, comparando el tokenizer original y el podado.
- Prototipado de chatbots rusos de bajo coste: con Q8_0 (140 MB) se puede desplegar en un servidor pequeño o en local para validar flujos de conversación antes de invertir en un modelo mayor.
- Experimentos de fine-tuning sobre modelos diminutos: al tener 130M de parámetros y pesos en bf16 de 262 MB, permite iterar ciclos completos de entrenamiento en una sola GPU de consumo.
- Pruebas de integración con llama.cpp: el GGUF incluye la plantilla de chat embebida, útil para verificar pipelines de `llama-server` y la API compatible con OpenAI en entornos de CI.
- Generación de texto informal en ruso para datasets sintéticos de aumento de datos, siempre con revisión humana por la presencia de no-palabras.
- Benchmark de referencia para medir el impacto de la poda de vocabulario en la perplejidad y la calidad de generación sobre ruso, comparando F16, Q8_0 y Q4_K_M contra el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta una evaluación de fidelidad de formatos frente a una referencia en fp32:

| Formato | Primer token correcto (10 prompts) | Respuesta greedy completa correcta (10 prompts) |
|---|---|---|
| F16 (GGUF) | 10/10 | 10/10 |
| Q8_0 (GGUF) | 10/10 | 9/10 |
| Q4_K_M (GGUF) | 8/10 | 3/10 |

Además, `model.safetensors` y `pytorch_model.bin` producen exactamente los mismos logits que el modelo podado del que se guardaron, y los ids de tokens del prompt coinciden entre `transformers` y llama.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en bf16/fp16, 0,14 GB en Q8_0 y 0,1 GB en Q4_K_M, más el espacio de activaciones y KV cache (dependiente del contexto).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el autor lo entrenó en una RTX 3060.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: `transformers` (bf16 o fp32, nunca fp16 por inestabilidad numérica de Gemma 3), llama.cpp con `llama-server` y API compatible con OpenAI, y text-generation-inference según los tags del repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SalgrAI-v2 | 130,8M | no disponible | ruso | Gemma Terms of Use | safetensors, GGUF |
| google/gemma-3-270m-it | 268,1M | no disponible | multilingüe | Gemma Terms of Use | safetensors, GGUF |
| SalgrAI-v2-Full | 268,1M | no disponible | ruso | Gemma Terms of Use | no disponible |

La comparación con alternativas de la misma categoría (modelos conversacionales en ruso de menos de 500M de parámetros) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Conocimiento factual débil: el modelo base es de 270M de parámetros y el fine-tuning se centró en conversación informal, no en conocimiento.
- Sin filtro de seguridad propio más allá del de Gemma; no debe desplegarse en entornos donde se requiera moderación de contenido sin capas adicionales.
- Las respuestas por muestreo contienen ocasionalmente no-palabras.
- No puede generar caracteres de alfabetos distintos del cirílico, ASCII, puntuación tipográfica y emoji; el texto de otros scripts llega como bytes.
- El tokenizer podado cambia los ids de tokens respecto al Gemma original a partir del id 107, lo que rompe la compatibilidad con herramientas que asuman los ids originales.
- El inglés es débil y solo funciona en fragmentos.
- Licencia Gemma Terms of Use: el uso comercial está sujeto a las condiciones de Google, que deben revisarse y adjuntarse según indica el propio autor en el README.
- No debe ejecutarse en float16 por inestabilidad numérica de Gemma 3; usar bfloat16 o float32.
- El autor lo declara explícitamente no apto para uso serio en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/salgr/salgrai_v2
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- README en ruso: README_RU.md (referenciado en el repo)
- Licencia Gemma Terms of Use: no disponible como enlace en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
