# jaipkapoor99/ultron-113m

## Resumen

Ultron-113M es un modelo de lenguaje autoregresivo (decoder-only) preentrenado desde cero por Jai Kapoor (jaipkapoor99) sobre 10.000 millones de tokens del corpus HuggingFaceFW/fineweb-edu (muestra de 10B). Con 113 millones de parámetros, está diseñado como un transformer moderno que incorpora técnicas posteriores a GPT-2: atención por grupos de consulta (GQA), MLP SwiGLU, embeddings rotatorios (RoPE), normalización RMS por cabeza y soft-capping de logits. Su objetivo es ofrecer una base compacta y eficiente para generación de texto en inglés, entrenable en una sola GPU de consumo (una RTX 5090) en unas 15 horas.

El modelo resulta relevante porque demuestra que es posible obtener un rendimiento razonable en tareas de razonamiento de sentido común con un presupuesto de cómputo muy reducido, aplicando innovaciones de entrenamiento como el optimizador Muon combinado con AdamW y un horario de aprendizaje Warmup-Stable-Decay. Su licencia MIT permite uso comercial sin restricciones, aunque su ventana de contexto es limitada (1024 tokens) y solo soporta inglés.

Se distribuye en formato safetensors y está pensado como modelo base; el autor publica además una versión instruct (`ultron-113m-instruct`) y los shards de datos pre-tokenizados para reproducir el entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (pre-RMSNorm, post-GPT-2) |
| Parametros totales | 113.266.944 (según safetensors; 113.303.808 según la model card, con weight tying) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión mixta BF16 durante entrenamiento; no se publican versiones cuantizadas) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (también PyTorch) |

## Arquitectura y entrenamiento

Ultron-113M sigue una arquitectura transformer decoder-only con 12 capas y dimensión oculta de 768. El mecanismo de atención es Grouped-Query Attention (GQA) con 12 cabezas de consulta y 4 de clave/valor (compresión 3:1), lo que reduce el coste de memoria y acelera la inferencia. La red feed-forward usa activación SwiGLU con dimensión intermedia de 2048, alineada a múltiplos de 64 para aprovechar las Tensor Cores de NVIDIA. La codificación posicional emplea RoPE con frecuencia base 10.000. Para estabilidad numérica, se aplica normalización RMS por cabeza (QK-Head RMSNorm) antes del escalado y un soft-capping de logits con `15.0 * tanh(logits / 15.0)`. Los embeddings y la cabeza de salida están atados (weight tying), reduciendo parámetros.

El entrenamiento se realizó sobre 10.000 millones de tokens de FineWeb-Edu (sample-10BT) en una única NVIDIA RTX 5090 con PyTorch 2.13 y Accelerate, usando precisión mixta bfloat16 y compilación completa del grafo (`torch.compile`). Se empleó un optimizador híbrido: Muon para las matrices 2D internas (proyecciones de atención, puertas SwiGLU) con tasa de aprendizaje 0.04 y momento 0.95, y AdamW fusionado para vectores 1D, ganancias de RMSNorm y tablas de embeddings con tasa 1.2e-3. El horario de aprendizaje fue Warmup-Stable-Decay (200 pasos de calentamiento, 80% de meseta estable, 20% de decaimiento coseno). El throughput pico alcanzó 189.475 tokens/segundo y el entrenamiento completo duró 15 horas y 18 minutos (152.587 pasos). La validación sobre un shard completo de 499.998.720 tokens arrojó una pérdida de 2.964989 y una perplejidad de 19.3945.

## Capacidades

- Generación de texto en inglés con coherencia básica y completado de frases.
- Razonamiento de sentido común y respuesta a preguntas de conocimiento general (según benchmarks de PIQA, ARC, HellaSwag).
- Capacidad limitada para tareas de elección múltiple y clasificación de texto.
- No se documenta soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No es multimodal: solo procesa texto.
- No dispone de modo "thinking" ni generación razonada explícita.
- Al ser un modelo base, requiere fine-tuning para tareas específicas (el autor ofrece una versión instruct separada).

## Casos de uso

- Prototipado rápido de aplicaciones NLP: por su pequeño tamaño y licencia permisiva, es adecuado para validar pipelines de generación de texto o clasificación antes de escalar a modelos mayores.
- Fine-tuning para clasificación de texto: se puede ajustar sobre conjuntos de datos etiquetados (análisis de sentimiento, detección de spam) con recursos modestos, gracias a sus 113M de parámetros.
- Generación de texto en entornos con restricciones de hardware: corre en GPUs de consumo e incluso en CPU, lo que permite desplegar asistentes de escritura o completado de texto en dispositivos edge.
- Educación e investigación en LLMs: sirve como banco de pruebas para estudiar técnicas de entrenamiento (Muon, WSD, GQA) sin necesidad de infraestructura costosa.
- Chatbots simples con contexto corto: su ventana de 1024 tokens es suficiente para conversaciones breves de pocos turnos, siempre que el dominio sea acotado.
- Generación de código simple: aunque no hay benchmarks específicos, al estar entrenado en texto educativo puede completar fragmentos cortos de código si se le proporciona contexto adecuado, aunque no es su fortaleza.

## Benchmarks y rendimiento

Los resultados siguientes provienen de la model card oficial (evaluados con EleutherAI lm-evaluation-harness sobre 17.195 ejemplos zero-shot sin truncamiento). Se comparan con la línea base aleatoria.

| Tarea | Precisión (norm.) | Línea base aleatoria |
|---|---|---|
| PIQA | 63.66% | 50.00% |
| ARC Easy | 47.05% | 25.00% |
| HellaSwag | 33.75% | 25.00% |
| OpenBookQA | 32.20% | 25.00% |
| ARC Challenge | 26.54% | 25.00% |
| Winogrande | 49.17% | 50.00% |
| Media macro | 40.41% | — |

Estos valores sitúan al modelo ligeramente por encima del azar en varias tareas, lo que es esperable para un modelo de 113M entrenado con solo 10B tokens. No se han publicado comparaciones con otros modelos de tamaño similar en la información disponible.

## Requisitos de hardware

- Inferencia: con 113M parámetros, el modelo en FP32 ocupa aproximadamente 452 MB, en BF16/FP16 unos 226 MB y en int8 unos 113 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 3050, incluso en CPU con llama.cpp).
- Entrenamiento: el autor reporta un uso medio de VRAM de 17.0 GiB en una RTX 5090, con un 97.7% de utilización de cómputo. Esto sugiere que se puede entrenar en GPUs con 16-24 GB de VRAM (RTX 4090, A100, etc.) ajustando el tamaño de lote.
- Despliegue: al ser un modelo estándar de HuggingFace, es compatible con `transformers`, `vLLM`, `llama.cpp` (si se convierte a GGUF) y `Ollama`. No se proporcionan datos de latencia o throughput en inferencia, pero dado su tamaño, es esperable una generación de cientos de tokens por segundo en GPUs modernas.
- Opciones de cuantización: no se publican versiones cuantizadas, pero se pueden generar con herramientas como `bitsandbytes` o `llama.cpp` a partir de los pesos safetensors.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos publicados para Ultron-113M frente a otros modelos de su categoría. Sin embargo, se pueden señalar diferencias arquitectónicas y de entrenamiento con alternativas comunes:

| Modelo | Parámetros | Contexto | Arquitectura | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| Ultron-113M | 113M | 1024 | GQA, SwiGLU, RoPE, Muon | 10B tokens FineWeb-Edu | MIT |
| GPT-2 (124M) | 124M | 1024 | Attention multi-cabeza clásica, GeLU | 40B tokens WebText | MIT |
| SmolLM2-135M | 135M | 2048 | GQA, RoPE, SwiGLU | 2T tokens (aprox.) | Apache 2.0 |
| Pythia-160M | 160M | 2048 | GPT-NeoX, RoPE | 300B tokens The Pile | Apache 2.0 |

Ultron-113M incorpora técnicas más modernas que GPT-2 (GQA, SwiGLU, optimizador Muon) y un tokenizer más eficiente (SmolLM2 BPE), pero su contexto es más corto que el de SmolLM2 o Pythia. La comparativa de rendimiento no está disponible en los datos proporcionados.

## Limitaciones y advertencias

- Ventana de contexto limitada a 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo soporta inglés; no hay capacidades multilingües.
- Al ser un modelo base sin fine-tuning instructivo, puede generar texto incoherente o repetitivo si no se adapta.
- Entrenado únicamente con FineWeb-Edu, un subconjunto filtrado por calidad educativa; puede presentar sesgos derivados de ese corpus (p. ej., subrepresentación de ciertos temas o estilos).
- Riesgo de alucinaciones y de generar información factualmente incorrecta, como cualquier LLM de este tamaño.
- No se han realizado evaluaciones de seguridad, sesgos o robustez; no debe usarse en producción sin una validación exhaustiva.
- Aunque la licencia MIT permite uso comercial, el autor no ofrece garantías ni soporte.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaipkapoor99/ultron-113m
- Repositorio GitHub: https://github.com/jaipkapoor99/ultron
- Versión instruct: https://huggingface.co/jaipkapoor99/ultron-113m-instruct
- Shards de datos pre-tokenizados: https://huggingface.co/datasets/jaipkapoor99/ultron-fineweb-edu-shards
- Registro de entrenamiento en W&B: https://wandb.ai/jaipkapoor99-rumani-dhaage/ultron-pretraining/runs/jg640nwo
