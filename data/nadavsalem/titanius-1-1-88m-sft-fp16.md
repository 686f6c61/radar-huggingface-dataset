# NadavSalem/Titanius-1.1-88m-sft-fp16

## Resumen

Titanius-1.1-88m-sft-fp16 es un modelo de lenguaje pequeño (88 millones de parámetros) ajustado por instrucciones (SFT), desarrollado por NadavSalem como continuación experimental del modelo base Titanius-1.1-88m-base-fp16. Se trata de un artefacto de investigación, no de un asistente listo para producción, y su objetivo principal es servir para experimentación con modelos de lenguaje compactos y arquitecturas personalizadas.

El modelo emplea una arquitectura decoder-only causal Transformer con 10 capas, tamaño oculto de 768, atención grouped-query (GQA) y embeddings rotativos (RoPE). Su ventana de contexto es de 2.048 tokens y el vocabulario es de 32.768 tokens con un tokenizador BPE byte-level personalizado. Fue entrenado mediante supervisión fina durante 1.000 pasos de optimización sobre el dataset HuggingFaceTB/smol-smoltalk, con un total de 32,7 millones de tokens de entrada.

La relevancia de este modelo radica en su carácter experimental: documenta un proceso completo de ajuste por instrucciones sobre una arquitectura no estándar, con detalles de entrenamiento reproducibles y un checkpoint público. No obstante, carece de evaluaciones estandarizadas y de garantías de seguridad, por lo que su uso se limita a entornos de investigación y desarrollo no críticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only causal Transformer (GQA, RoPE, RMS norm, QK norm, tied embeddings) |
| Parámetros totales | 88.080.405 (únicos) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (checkpoint FP16) |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | checkpoint FP16 con código PyTorch personalizado (no safetensors estándar) |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only con 10 capas, tamaño oculto de 768, 12 cabezas de consulta y 4 cabezas clave/valor (GQA), dimensión de cabeza de 64 y MLP de ancho 3.072. Usa activación Squared ReLU, normalización RMS en el forward path, normalización QK, embeddings de entrada/salida compartidos (tied), escalado residual por capa, un residual de embedding de entrada y un residual "backout" en capas intermedias. El logit de salida tiene un soft cap de 15. El tokenizador es un BPE byte-level personalizado con pre-tokenización de números en grupos de hasta tres dígitos.

El entrenamiento SFT se realizó sobre el checkpoint `model_step_30518.pt` del modelo base, durante 1.000 iteraciones con 32.768 tokens de entrada por paso (32.768.000 tokens en total). Se usó el optimizador AdamW con learning rate pico de 2e-5, decaimiento coseno hasta 2e-6, warmup del 3%, weight decay de 0.01 y gradient clipping de 1.0. El dataset fue HuggingFaceTB/smol-smoltalk, con 16.157 filas consumidas. La pérdida final suavizada de entrenamiento fue 1.8756 y la de validación 1.8405. El entrenamiento se ejecutó en una NVIDIA GeForce RTX 2060 SUPER con FP16, manteniendo pesos maestros FP32. No se registraron evaluaciones de benchmarks estandarizados.

## Capacidades

- Generación de texto conversacional en inglés, siguiendo instrucciones simples dentro de su ventana de contexto de 2.048 tokens.
- Mantenimiento de diálogos multi-turno con formato de chat definido por tokens especiales (`<|user_start|>`, `<|assistant_start|>`, etc.).
- Aceptación de mensajes de sistema combinados con el primer mensaje de usuario (sin token dedicado de sistema).
- Fine-tuning adicional sobre el checkpoint para tareas específicas, gracias a su tamaño reducido y a la disponibilidad de pesos FP16.
- Inferencia en CPU, MPS o CUDA mediante el script `inference.py` incluido en el repositorio.
- No soporta tool calling, visión, audio ni razonamiento multi-paso explícito.

## Casos de uso

- Investigación académica sobre ajuste por instrucciones en modelos pequeños: permite estudiar el comportamiento de la pérdida, la convergencia y los efectos del SFT en una arquitectura no estándar con 88M de parámetros.
- Experimentación con arquitecturas personalizadas: al usar código PyTorch propio, es útil para probar variantes de normalización, atención GQA o escalado residual sin depender de la implementación estándar de Transformers.
- Fine-tuning para tareas específicas de generación de texto en inglés: por su tamaño, puede ajustarse en una GPU de gama baja (por ejemplo, RTX 2060) y desplegarse en entornos con recursos limitados.
- Generación de texto no crítica en prototipos: por ejemplo, chatbots de demostración o generación de respuestas cortas en aplicaciones de investigación donde la calidad no es un requisito.
- Análisis de alucinaciones y sesgos en modelos pequeños: al carecer de evaluaciones de seguridad, sirve como caso de estudio para identificar fallos de instrucción y coherencia en modelos de baja capacidad.
- Comparación de metodologías de SFT: al estar documentado el proceso completo (hiperparámetros, dataset, pérdidas), puede usarse como referencia para reproducir o variar el pipeline de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se registró ninguna evaluación estandarizada y que las pérdidas de entrenamiento/validación no deben interpretarse como puntuaciones de tareas downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP16 ocupa aproximadamente 176 MB (88M parámetros × 2 bytes), más overhead del modelo y el tokenizador. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 2060, RTX 3060, T4, A10). También funciona en CPU y MPS (Apple Silicon), aunque la generación sin KV cache puede ser lenta en CPU.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo como RTX 3060, RTX 4060, etc., e incluso en integradas si se usa CPU.
- Opciones de despliegue: solo mediante el código personalizado del repositorio (`inference.py`). No es compatible con vLLM, llama.cpp, Ollama ni TGI debido a la arquitectura no estándar.
- Latencia y throughput: no se proporcionan datos. La ausencia de KV cache implica que la generación es O(n²) en longitud de secuencia, por lo que será lenta para contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Titanius-1.1-88m-sft-fp16 | 88M | 2.048 | no disponible | PyTorch personalizado | Experimental, sin benchmarks |
| SmolLM2-135M | 135M | 2.048 | Apache 2.0 | safetensors, Transformers | Modelo pequeño estándar, con benchmarks publicados |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | safetensors, Transformers | Mayor capacidad y contexto, soporte multilingüe |

La comparativa es limitada porque Titanius-1.1 no tiene benchmarks publicados y su formato no es estándar. SmolLM2-135M y Qwen2.5-0.5B son alternativas más maduras y fáciles de desplegar, aunque de mayor tamaño. No se dispone de datos de rendimiento para una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo experimental: no es un asistente listo para producción y puede generar texto incorrecto, incoherente, sesgado, ofensivo o inseguro.
- Sin evaluación de seguridad, sesgos, memorización ni seguimiento de instrucciones: no se reportan métricas estandarizadas.
- Riesgo de alucinación elevado: al ser un modelo de 88M con entrenamiento limitado, es probable que invente hechos o produzca respuestas sin sentido.
- Limitaciones de idioma: solo entrenado en inglés; no soporta otros idiomas.
- Requiere código personalizado: no es compatible con bibliotecas estándar como Transformers, lo que dificulta su integración en pipelines existentes.
- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que impide su uso comercial sin consultar al autor.
- Contexto corto: 2.048 tokens, insuficiente para tareas que requieran memoria a largo plazo.
- Sin KV cache en generación: la inferencia es lenta, especialmente en CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NadavSalem/Titanius-1.1-88m-sft-fp16
- Modelo base: https://huggingface.co/NadavSalem/Titanius-1.1-88m-base-fp16
- Dataset de entrenamiento SFT: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset de preentrenamiento del base: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Colección Titanius 1 Carbon: https://huggingface.co/collections/NadavSalem/titanius-1-carbon-collection
