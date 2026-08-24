# LoftLiuping/llmagogyv4

## Resumen

LLMagogyV4 es un proyecto de investigación experimental desarrollado por Dmitri Lyubimkov (alias LoftLiuping) que explora métodos de intervención en el pre-entrenamiento de modelos de lenguaje para lograr una mejor generalización con menor pérdida de validación. Es la cuarta iteración de la serie LLMagogy, que investiga técnicas como entrenamiento por etapas, regularización, orden de datos y evolución de hiperparámetros. El modelo base es un NanoGPT de 7,62 millones de parámetros entrenado sobre el 3% del dataset TinyStories.

El resultado principal del proyecto es una síntesis de tres técnicas efectivas —Stochastic Depth, Gradient Noise y reducción de learning rate— que logran una pérdida de validación de 2,1270, un 3,5% de mejora sobre la línea base (2,2026) en solo 2 épocas en lugar de 5. El proyecto incluye scripts de entrenamiento, documentación y datos de experimentos, pero no publica pesos de modelo listos para inferencia. Es relevante para investigadores interesados en metodologías de pre-entrenamiento eficiente, no como modelo desplegable en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NanoGPT (GPT-2, tokenizer GPT-2, vocab_size=50257) |
| Parametros totales | 7,62 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (block_size) |
| Tipos de cuantizacion | no disponible (entrenado en bfloat16, sin pesos publicados) |
| Idiomas soportados | no disponible (dataset TinyStories en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos; solo scripts y documentación) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura NanoGPT, una implementación minimalista de GPT-2. La configuración concreta es de 6 capas, dimensión de embedding 128, 4 cabezas de atención y un contexto de 256 tokens. El optimizador es AdamW con betas 0.9/0.95, weight decay 0.1 y grad clip 1.0. Todo el entrenamiento se realiza en precisión bfloat16 con batch size 48 y learning rate inicial 0.001.

El proyecto investiga intervenciones sobre el entrenamiento estándar. Los métodos que resultaron efectivos son: Stochastic Depth aplicado antes del entrenamiento (probabilidad 0.2, una época, mejora ~0.8%), Gradient Noise aplicado después de la línea base (std=0.00005, una época, mejora ~1.4%), y reducción del learning rate a 0.0002 (mejora ~0.6%). La síntesis de los tres métodos logra una pérdida de validación de 2.1270 en aproximadamente 2 épocas, frente a los 2.2026 de la línea base en 5 épocas. Métodos que no funcionaron: evolución de precisión, crecimiento del tamaño del modelo, evolución de hiperparámetros (excepto LR), modificación de la función de pérdida, aprendizaje curricular y warmup durante la expansión del modelo.

## Capacidades

- Generación de texto en inglés básico (dataset TinyStories, historias cortas de nivel infantil).
- No se publican pesos del modelo entrenado, por lo que no se puede usar para inferencia directamente.
- El proyecto no incluye soporte para tool calling, agentes, visión, audio ni capacidades multilingües.
- La única capacidad demostrada es la reducción de pérdida de validación en un entorno de investigación controlado.
- El código fuente permite reproducir los experimentos y entrenar modelos desde cero.

## Casos de uso

- Investigación en metodologías de pre-entrenamiento: el proyecto sirve como referencia para estudiar el impacto de Stochastic Depth, Gradient Noise y reducción de LR en modelos pequeños. Un investigador puede reproducir los scripts de entrenamiento para validar las conclusiones.
- Benchmark de técnicas de regularización: los resultados comparativos de métodos efectivos e inefectivos son útiles para diseñar experimentos propios en modelos más grandes.
- Educación en entrenamiento de LLMs: el código y la documentación son un recurso didáctico para entender el pipeline completo de pre-entrenamiento de un modelo GPT-2 pequeño.
- Experimentación con TinyStories: el dataset procesado y los scripts de tokenización permiten preparar TinyStories para entrenamiento con NanoGPT.
- Estudio de eficiencia de entrenamiento: la reducción de épocas necesarias (de 5 a 2) con la misma pérdida puede servir de inspiración para optimizar costes de entrenamiento en entornos académicos con recursos limitados.
- Reproducción de resultados: el repositorio incluye los 11 scripts de entrenamiento secuenciales, lo que permite replicar cada paso del experimento de manera aislada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son las métricas de pérdida de validación en TinyStories, que no son comparables con benchmarks estándar de la industria:

| Método | Pérdida de validación | Épocas |
|---|---|---|
| Línea base (NanoGPT, 5 épocas) | 2,2026 | 5 |
| Stochastic Depth (prob=0.2, 1 época) | mejora ~0,8% | 1 |
| Gradient Noise (std=0.00005, 1 época) | mejora ~1,4% | 1 |
| Reducción LR (0.0002) | mejora ~0,6% | 1 |
| Síntesis (SD + GN + LR) | 2,1270 | ~2 |

## Requisitos de hardware

- GPU recomendada: RTX 5070 Ti (16 GB VRAM) o equivalente, según el autor.
- Memoria VRAM estimada: no disponible explícitamente, pero con 7,62 M de parámetros en bfloat16, el entrenamiento cabe en cualquier GPU con al menos 8 GB VRAM.
- Precisión: todos los cálculos en bfloat16.
- Software: Python 3.10+, PyTorch con soporte CUDA, datasets, tiktoken.
- No hay pesos publicados, por lo que no hay requisitos de inferencia ni opciones de despliegue (vLLM, Ollama, etc.).
- El entrenamiento completo de la línea base requiere 5 épocas sobre el 3% de TinyStories; el experimento de síntesis completa en ~2 épocas.

## Comparativa con modelos similares

No hay una comparativa directa posible porque el modelo no se publica con pesos y su propósito es experimental, no de producción. Se puede comparar conceptualmente con:

| Modelo | Parámetros | Contexto | Objetivo | Disponibilidad |
|---|---|---|---|---|
| LLMagogyV4 | 7,62 M | 256 | Investigación de métodos de entrenamiento | Solo scripts y documentación |
| NanoGPT (referencia) | 7,62 M | 256 | Línea base de entrenamiento | Código abierto (GitHub) |
| GPT-2 small | 124 M | 1024 | Modelo de lenguaje de producción | Pesos públicos en HuggingFace |

La comparación con GPT-2 small no es significativa por la diferencia de tamaño y objetivo. No hay modelos comparables en la misma categoría de experimentos metodológicos con TinyStories.

## Limitaciones y advertencias

- No se publican pesos del modelo entrenado; el repositorio contiene únicamente scripts, documentación y datos de experimentos.
- La licencia no está especificada, por lo que el uso comercial del código y la documentación es incierto.
- El modelo está entrenado con el 3% de TinyStories, un dataset de historias infantiles en inglés, lo que limita su generalización a otros dominios.
- La validación se realizó sobre el 50% de TinyStories, lo que puede no reflejar el rendimiento en datos no vistos de otros tipos.
- Los resultados son de un único experimento con un modelo pequeño; no hay evidencia de que las técnicas se escalen a modelos más grandes o a otros dominios.
- No se han evaluado sesgos, alucinaciones ni riesgos de seguridad del modelo.
- La fecha de creación del repositorio (2026-08-23) es futura respecto a la fecha de escritura de esta ficha, lo que sugiere que la información puede estar incompleta o ser hipotética.
- No hay soporte para inferencia en producción: no hay API, ni integraciones, ni formato de pesos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LoftLiuping/llmagogyv4
- Perfil del autor en HuggingFace: https://huggingface.co/LoftLiuping
- Repositorio LLMagogy V1: https://github.com/loftyara/LLMagogy
- Repositorio LLMagogy V2: https://github.com/loftyara/LLMagogyV2
- Repositorio LLMagogy V4: https://github.com/loftyara/LLMagogyV4.git
- Documentación completa (PDF): docs/llmagogyv4.pdf (dentro del repositorio)
- Dataset TinyStories: disponible en Hugging Face (sin enlace directo en la información)
