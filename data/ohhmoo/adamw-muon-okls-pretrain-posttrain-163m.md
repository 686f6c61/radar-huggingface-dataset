# OhhMoo/adamw-muon-okls-pretrain-posttrain-163m

## Resumen

`adamw-muon-okls-pretrain-posttrain-163m` es una colección de checkpoints de investigación publicada por el usuario OhhMoo en Hugging Face, no un modelo de propósito general listo para producción. Contiene una matriz de 3 × 3 modelos de 163M parámetros (sin contar embeddings) entrenados desde cero con tres optimizadores distintos —AdamW, Muon y OKLS (Online KL Shampoo)— tanto en la fase de preentrenamiento como en la de post-entrenamiento, con el objetivo de responder a una pregunta concreta: ¿el optimizador usado en el preentrenamiento cambia cuál es el mejor optimizador para el post-entrenamiento?

El modelo base es un transformer decoder-only de 24 capas, anchura 768, atención con grouped-query attention (12 cabezas de consulta, 3 de clave/valor), QK-norm, RoPE, puerta sigmoide en la atención, MLP SwiGLU de anchura 2.048, RMSNorm y cabeza de salida no atada. Suma 240,1M parámetros totales, de los cuales 162,8M están fuera de embeddings y cabeza. El tokenizador es GPT-2 BPE con vocabulario ampliado a 50.304 y la longitud de contexto es de solo 1.024 tokens.

La relevancia es metodológica: el estudio mide el olvido catastrófico a aprendizaje igualado y concluye que usar el mismo optimizador en ambas fases reduce el olvido, un efecto de 0,0145 nats en chat SFT y 0,0045 nats en matemáticas. Los checkpoints se distribuyen como material reproducible para investigadores interesados en dinámica de optimizadores, no como base para aplicaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, QK-norm, RoPE, puerta sigmoide en atención, SwiGLU, RMSNorm |
| Parametros totales | 240,1M (162,8M sin embeddings ni cabeza) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (solo pesos float32 y bfloat16 publicados) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 24 capas con anchura 768. La atención usa 12 cabezas de consulta de dimensión 64 y 3 cabezas de clave/valor (grouped-query attention), con QK-norm, embeddings rotatorios (RoPE) y una puerta sigmoide sobre la salida de atención. El MLP es SwiGLU con anchura 2.048, normalización RMSNorm y cabeza de salida no atada a los embeddings. El código del modelo vive en `modeling.py` y se verificó que produce salidas bit-idénticas a las del script de entrenamiento.

El preentrenamiento usó 3,30B tokens de FineWeb (6.300 pasos × 524.288 tokens), aproximadamente 20 tokens por parámetro no-embedding, con un 5% de warmup, fase constante y decaimiento lineal a cero en el 73% final. Las matrices ocultas usan el optimizador fuente con tasas elegidas por barrido: AdamW 0,0015, Muon 0,02404 y OKLS 0,04717; embeddings, cabeza y normas usan siempre AdamW a 0,003. La pérdida de validación final en FineWeb (media de 3 semillas) fue OKLS 3,180, Muon 3,220 y AdamW 3,235. El post-entrenamiento se hizo sobre dos tareas —chat SFT con `allenai/tulu-3-sft-mixture` (pérdida solo en tokens de asistente) y preentrenamiento continuado en texto matemático de `open-web-math/open-web-math`— durante 400 pasos × 65.536 tokens (26M tokens), con estado de optimizador fresco y una escalera de tasas de aprendizaje de rung −6 a 0 (más +1 para Muon y OKLS). Solo se publica el checkpoint del mejor rung de cada celda.

## Capacidades

- Generación de texto en inglés con un modelo base pequeño (163M parámetros no-embedding).
- Chat multi-turno en los checkpoints SFT, con formato `<|role|>\n` + contenido + `<|endoftext|>` para los roles `system`, `user` y `assistant`.
- Razonamiento matemático básico en los checkpoints post-entrenados con texto matemático.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No hay capacidades de visión ni audio.
- No hay modo "thinking" ni decodificación especulativa documentada.
- Multilingüismo limitado al inglés.

## Casos de uso

- Investigación sobre optimizadores: comparar el olvido catastrófico entre AdamW, Muon y OKLS en un grid controlado de 3 × 3 con tres semillas de preentrenamiento, usando `results/cells.json` e `index.csv` para reproducir el análisis.
- Estudio de dinámica de post-entrenamiento: analizar cómo la elección de optimizador en SFT afecta a la retención de conocimiento del preentrenamiento, con la métrica de subida de pérdida en FineWeb a aprendizaje igualado.
- Reproducción de experimentos a pequeña escala: el tamaño de 163M permite ejecutar el grid completo en hardware modesto, algo inviable con modelos de miles de millones de parámetros.
- Desarrollo de metodología de evaluación: usar las curvas de evaluación incluidas en cada `config.json` como referencia para diseñar protocolos de medición de olvido.
- Fine-tuning educativo: servir como base para demostrar técnicas de SFT con enmascarado de pérdida en tokens de asistente y formato de chat explícito.
- Pruebas de infraestructura de entrenamiento: validar pipelines de entrenamiento distribuido, barridos de tasa de aprendizaje y checkpoints intermedios con un modelo de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos numéricos son las pérdidas de validación del estudio:

| Metrica | AdamW | Muon | OKLS |
|---|---|---|---|
| Pérdida validación FineWeb tras preentrenamiento (media 3 semillas) | 3,235 | 3,220 | 3,180 |
| Olvido chat SFT (nats, menor es mejor) | 0,114 ± 0,003 | 0,161 ± 0,002 | 0,191 ± 0,001 |
| Olvido matemáticas (nats, menor es mejor) | 0,052 ± 0,001 | 0,066 ± 0,000 | 0,059 ± 0,000 |

La tabla de olvido anterior corresponde a la diagonal (mismo optimizador en pre y post-entrenamiento); las celdas completas del grid están en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1 GB para los 240,1M parámetros; en bfloat16, unos 0,5 GB.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1660, RTX 3060, RTX 4060 o superiores.
- GPU recomendadas para entrenamiento del grid completo: A100 o H100 para paralelizar las 9 celdas de preentrenamiento y 54 de post-entrenamiento; una sola RTX 4090 es suficiente para una celda individual.
- Opciones de despliegue: al usar `modeling.py` propio con nombres de parámetros específicos, la integración directa con vLLM, llama.cpp u Ollama no está documentada; el uso previsto es mediante PyTorch y el código incluido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| adamw-muon-okls-pretrain-posttrain-163m | 240,1M totales (162,8M no-embedding) | 1.024 | Apache 2.0 | Investigación de optimizadores |
| Pythia-160M | 160M | 2.048 | Apache 2.0 | Suite de interpretabilidad |
| GPT-2 small | 124M | 1.024 | MIT | Modelo base de referencia |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | Modelo pequeño de propósito general |

La comparación es orientativa por tamaño; este checkpoint no está pensado para competir en calidad de generación con modelos pequeños de propósito general, sino para estudiar el efecto del optimizador en el olvido durante el post-entrenamiento.

## Limitaciones y advertencias

- Modelo de investigación: no está destinado a producción ni a aplicaciones de usuario final.
- Contexto muy corto (1.024 tokens), insuficiente para la mayoría de casos de uso reales.
- Solo inglés; no se ha entrenado ni evaluado en otros idiomas.
- Entrenado con solo 3,30B tokens, muy por debajo de lo habitual en modelos pequeños de propósito general, por lo que su calidad de generación será limitada.
- Riesgo elevado de alucinación y de respuestas incoherentes fuera de los dominios de entrenamiento.
- Sesgos heredados de FineWeb y de `tulu-3-sft-mixture`, no mitigados mediante RLHF ni DPO.
- Los resultados del estudio provienen de un único tamaño de modelo y un único presupuesto de tokens; los autores advierten que pueden no mantenerse a mayor escala.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es adecuado para ello por sus limitaciones técnicas.
- El repositorio ocupa 34,6 GB e incluye 63 checkpoints; descargar solo las carpetas necesarias.
- El efecto de coincidencia de optimizador en matemáticas (0,0045 nats) queda por debajo del umbral de 0,005 fijado de antemano por el estudio, por lo que no debe considerarse concluyente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OhhMoo/adamw-muon-okls-pretrain-posttrain-163m
- Dataset de preentrenamiento: https://huggingface.co/datasets/kjj0/fineweb10B-gpt2
- Dataset de chat SFT: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset de matemáticas: https://huggingface.co/datasets/open-web-math/open-web-math
- FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
