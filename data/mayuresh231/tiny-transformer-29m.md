# Mayuresh231/tiny-transformer-29m

## Resumen

Tiny Transformer 29M es un modelo de lenguaje causal (decoder-only) de 29,5 millones de parámetros, desarrollado por Mayuresh231 y entrenado desde cero sobre el dataset TinyStories, compuesto por 600.000 historias cortas en inglés dirigidas a niños. El modelo está diseñado con fines exclusivamente educativos: sirve para estudiar tokenización, atención, optimización, checkpointing y generación de texto en un entorno pequeño y reproducible.

Su relevancia radica en ser un ejemplo completo de entrenamiento de un transformer desde cero, con un tokenizer propio ByteLevel BPE de 4.096 tokens y una ventana de contexto de 256 tokens. El entrenamiento se realizó en una GPU de consumo (RTX 3050 Laptop con 6 GB de VRAM) en poco más de 3 horas, lo que lo convierte en un punto de partida accesible para investigadores y estudiantes que quieran experimentar con arquitecturas de lenguaje sin necesidad de infraestructura de gran escala.

Aunque no es un modelo asistente ni de conocimiento factual, su simplicidad lo hace útil para análisis de comportamiento, pruebas de generación controlada y comparaciones de arquitecturas. El código está disponible bajo licencia MIT, con pesos en formato safetensors y requiere `trust_remote_code=True` para cargar la implementación personalizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) |
| Parametros totales | 29.545.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas, con un tamaño oculto de 512, 8 cabezas de atención de 64 dimensiones cada una, y una capa feed-forward de 2.048 unidades. Usa dropout de 0.1 y la proyección de salida no está atada a la capa de embedding. La implementación emplea atención causal con scaled dot-product de PyTorch, pero no utiliza caché de KV, por lo que recalcula la ventana de contexto activa para cada token nuevo generado.

El entrenamiento se realizó sobre 600.000 ejemplos únicos de TinyStories, con un tokenizer ByteLevel BPE en minúsculas de 4.096 tokens. Se procesaron 547.749.888 posiciones de token en 4 épocas, con una pérdida de entrenamiento final de 1.4971, pérdida de validación de 1.4977 y perplejidad de 4.47. El proceso completo duró 3 horas, 9 minutos y 25 segundos en una NVIDIA RTX 3050 Laptop con 6 GB de VRAM.

## Capacidades

- Generacion de texto causal en ingles, con soporte para muestreo (temperature, top-k, top-p) y penalizacion de repeticion.
- Tokenizacion ByteLevel BPE personalizada en minusculas (4.096 tokens).
- Generacion compatible con la API de Transformers, aunque sin caché de KV (recomputa el contexto en cada paso).
- No dispone de tool calling, function calling, razonamiento multi-paso, vision ni audio.
- Capacidad multilingue limitada: solo ingles, y con vocabulario reducido orientado a historias infantiles.
- Modo de pensamiento (thinking) no implementado.

## Casos de uso

- Estudio de arquitecturas transformer: el modelo permite inspeccionar capas, atencion y embeddings en un tamano manejable, ideal para cursos de deep learning o experimentos de interpretabilidad.
- Analisis de tokenizacion: el tokenizer ByteLevel BPE propio se puede comparar con otros tokenizers (p. ej., GPT-2) para entender el impacto del vocabulario en la perplejidad.
- Pruebas de generacion controlada: con parametros de muestreo como temperature, top-k y repetition_penalty, se pueden estudiar los efectos de cada hiperparametro en la coherencia del texto.
- Benchmark de eficiencia de entrenamiento: al entrenar en menos de 4 horas en una GPU de consumo, sirve como base para comparar tecnicas de optimizacion, regularizacion o escalado.
- Desarrollo de pipelines de generacion: al ser compatible con la API de Transformers, se puede integrar en prototipos de generacion de texto, aunque sin requisitos de latencia estrictos.
- Experimentos de perplejidad y overfitting: las curvas de entrenamiento (loss y validacion) permiten estudiar el comportamiento de generalizacion en datasets pequenos.
- Educacion en ingenieria de software: el codigo personalizado (custom code) ofrece un ejemplo real de como implementar un modelo causal LM con Transformers, incluyendo el manejo de `trust_remote_code`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento provienen del entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de entrenamiento (epoca 4) | 1.4971 |
| Loss de validacion (epoca 4) | 1.4977 |
| Perplejidad (epoca 4) | 4.47 |
| Tokens procesados | 547.749.888 |
| Duracion del entrenamiento | 3h 9m 25s |

Estos valores indican una convergencia razonable para un modelo de este tamano en TinyStories, pero no son comparables con benchmarks generales de modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en precision fp32 (29,5 M parametros * 4 bytes ≈ 118 MB) y menos de 0,5 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo RTX 3050, RTX 3060 o incluso GPUs integradas de Intel/AMD para inferencia en CPU.
- Cabe en GPU de consumo: si, tanto para entrenamiento (ya demostrado en RTX 3050 Laptop 6 GB) como para inferencia.
- Opciones de despliegue: compatible con la libreria Transformers de HuggingFace (con `trust_remote_code=True`). No hay soporte oficial para vLLM, llama.cpp, Ollama o TGI, aunque podria adaptarse manualmente.
- Latencia y throughput: debido a la ausencia de caché de KV, la generacion es lenta en comparacion con modelos optimizados; se estima que la generacion de 200 tokens puede tardar varios segundos en CPU o GPU de gama baja.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. El modelo se enmarca en la familia de tiny transformers entrenados en TinyStories (p. ej., TinyStories-1M, TinyStories-3M), pero no se han publicado comparaciones directas ni benchmarks comunes con esos modelos. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Modelo exclusivamente educativo: no es un asistente ni un modelo de conocimiento factual; sus respuestas pueden ser repetitivas, contradictorias o incoherentes.
- Sesgos del dataset: TinyStories contiene historias infantiles en ingles, por lo que el modelo puede heredar patrones de lenguaje simples, vocabulario limitado y posibles ruidos de codificacion.
- Ventana de contexto muy corta (256 tokens): no es adecuado para tareas que requieran contexto largo.
- Sin caché de KV: la generacion es ineficiente y no escalable para produccion.
- Solo soporta ingles en minusculas; no maneja mayusculas ni otros idiomas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado no auditado por HuggingFace; se debe revisar el codigo antes de usarlo en entornos de produccion.
- No se han publicado cuantizaciones ni soporte para frameworks de inferencia optimizados (vLLM, llama.cpp, etc.).
- Licencia MIT permite uso comercial, pero el modelo no esta disenado para aplicaciones de alto riesgo; el autor desaconseja su uso en decisiones criticas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Mayuresh231/tiny-transformer-29m)
- [Dataset TinyStories (roneneldan/TinyStories)](https://huggingface.co/datasets/roneneldan/TinyStories)
- [Licencia MIT](https://opensource.org/licenses/MIT)
