# NadavSalem/Titanius-1.1-88m-base-fp16

## Resumen

Titanius-1.1-88m-base-fp16 es un modelo de lenguaje causal de tipo decoder-only, desarrollado por Nadav Salem como artefacto de investigación experimental. Se trata de un checkpoint final de un entrenamiento base de 2.000 millones de tokens, guardado en precisión FP16. El modelo está diseñado para investigación y experimentación con modelos pequeños, no para uso en producción ni como asistente conversacional.

Con 88 millones de parámetros únicos y una ventana de contexto de 2.048 tokens, emplea una arquitectura Transformer con atención causal por grupos (GQA), embeddings rotatorios (RoPE), normalización RMS y activación Squared ReLU. Su relevancia radica en ser un ejemplo de arquitectura personalizada con técnicas modernas (QK normalization, residual scaling, backout residual) aplicadas a un tamaño reducido, lo que permite estudiar el comportamiento de estos componentes sin necesidad de grandes recursos computacionales.

El modelo se distribuye únicamente en inglés y no ha sido afinado para instrucciones. Su licencia no está especificada, y su uso requiere el código personalizado incluido en el repositorio, ya que no es compatible con la arquitectura estándar de Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal con GQA, RoPE, RMS norm, QK norm, residual scaling y backout residual |
| Parametros totales | 88.080.405 (únicos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | FP16 (nativo); no se publican cuantizaciones adicionales |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | PyTorch FP16 (checkpoint .pt) |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only con 10 capas, tamaño oculto de 768, 12 cabezas de consulta y 4 cabezas de clave/valor (GQA), dimensión de cabeza de 64 y MLP de ancho 3.072. El vocabulario es de 32.768 tokens, con un tokenizer BPE byte-level que pre-tokeniza números en grupos de hasta tres dígitos. Se emplean embeddings de entrada y salida compartidos (tied), normalización RMS en el forward, QK normalization, escalado residual por capa, un residual de embedding de entrada y un residual "backout" en capas intermedias. El logit de salida tiene un soft cap de 15.

El entrenamiento se realizó sobre el dataset `karpathy/climbmix-400b-shuffle`, con 2.000.027.648 tokens en 30.518 pasos de optimizador, usando AdamW con learning rate pico de 4e-4, decaimiento coseno hasta 4e-5, warmup del 2% y gradiente clipping de 1.0. La pérdida final suavizada fue de 3.0181 y la pérdida de validación de 3.1133. No se registraron evaluaciones de benchmarks estandarizados.

## Capacidades

- Generación de texto autocompletado en inglés, basada en el contexto dado.
- Modelo base: no está afinado para instrucciones, por lo que no sigue prompts de forma fiable.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multimodales (solo texto).
- El tokenizer incluye tokens de conversación (`<|user_start|>`, `<|assistant_start|>`, etc.), pero no han sido utilizados en entrenamiento supervisado.
- Adecuado para tareas de modelado del lenguaje y extracción de representaciones internas.

## Casos de uso

- Investigación académica sobre arquitecturas Transformer pequeñas: permite estudiar el efecto de GQA, QK normalization y residual scaling en un modelo de 88M parámetros, con coste computacional bajo.
- Fine-tuning supervisado para tareas específicas de NLP en inglés: al ser un modelo base, puede adaptarse mediante SFT a dominios concretos como clasificación de texto o generación controlada.
- Experimentos de continued pretraining: su tamaño reducido facilita probar estrategias de entrenamiento (datasets, schedulers, regularización) antes de escalar a modelos mayores.
- Análisis de representaciones internas: útil para investigar cómo se organizan los conceptos en un Transformer pequeño entrenado con datos diversos.
- Pruebas de eficiencia de inferencia en hardware limitado: al ocupar menos de 200 MB en FP16, puede ejecutarse en CPUs o GPUs de gama baja, sirviendo como banco de pruebas para optimizaciones.
- Comparación de arquitecturas: sirve como baseline para evaluar el impacto de modificaciones arquitectónicas frente a modelos de tamaño similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se registró ninguna evaluación estandarizada, por lo que las pérdidas de entrenamiento y validación no deben interpretarse como puntuaciones de tareas downstream.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware.
- Por su tamaño (88M parámetros en FP16, ~176 MB de pesos), se estima que la inferencia básica cabe en GPUs con 2 GB de VRAM o menos, e incluso en CPU con suficiente RAM.
- GPUs recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2060, o superiores). También puede ejecutarse en Apple Silicon o CPUs x86.
- Opciones de despliegue: al requerir código personalizado, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Se debe usar el script de inferencia incluido en el repositorio.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera una generación rápida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. No se han publicado benchmarks ni evaluaciones que permitan una comparación objetiva con alternativas como GPT-2 (124M) o Pythia-70M. La model card no menciona ningún modelo de referencia.

## Limitaciones y advertencias

- No está afinado para instrucciones: puede generar texto incoherente, incorrecto o que no sigue el prompt.
- No se han realizado evaluaciones de seguridad, sesgos, memorización o alucinación.
- El corpus de entrenamiento puede contener material problemático, con derechos de autor, personal o de baja calidad, heredado de sus fuentes upstream.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial o redistribución.
- Requiere el código personalizado del repositorio; no es un modelo drop-in compatible con la API estándar de Transformers.
- Solo soporta inglés; no hay capacidades multilingües.
- La ventana de contexto es limitada (2.048 tokens), lo que restringe tareas que requieren contexto largo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/NadavSalem/Titanius-1.1-88m-base-fp16
- Dataset de entrenamiento: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Colección Titanius 1 Carbon: https://huggingface.co/collections/NadavSalem/titanius-1-carbon-collection
- Preview SFT del modelo base (Titanius-1-115m-sft-fp16-preview): https://huggingface.co/NadavSalem/Titanius-1-115m-sft-fp16-preview
