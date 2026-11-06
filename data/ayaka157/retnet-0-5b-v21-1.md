# Ayaka157/RetNet-0.5B-v21.1

## Resumen

RetNet-0.5B-v21.1 es un modelo de lenguaje de tipo base desarrollado por el usuario independiente Ayaka157, publicado en Hugging Face bajo licencia MIT. Implementa la arquitectura RetNet (Retentive Network), una alternativa a los transformers clásicos que sustituye la atención por un mecanismo de retención con decaimiento por cabeza, lo que permite formulaciones paralelas, recurrentes y por bloques. El checkpoint cuenta con 504.179.896 parámetros y una ventana de contexto de entrenamiento de 2048 tokens.

La versión v21.1 se presenta como una reparación de la v21.0, que según el autor sufría olvido catastrófico y tenía un 41,18 % de parámetros declarados como cero. En esta revisión se afirma que todos los parámetros están activos y que la métrica de titularidad (criterio de 5 ficheros) mejora de 3,5027 a 2,4885. Es relevante como pieza de investigación sobre arquitecturas alternativas a la atención, no como modelo de producción.

Se trata de un modelo base sin ajuste por instrucciones: no ha pasado por RLHF ni DPO, y sus capacidades de chat, aritmética y código se sitúan, según el propio autor, en el suelo esperable para 0,5B parámetros. Los pesos se almacenan en fp32 (1,92 GB) y el repositorio ocupa 2,0 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RetNet (retention), 20 capas, ancho 1408, 22 cabezas, dimensión de valor/FFN 2816 |
| Parámetros totales | 504.179.896 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (contexto de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en fp32; se sugiere cargar en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32), con código de modelado personalizado (`modeling_retnet.py`, `retention_fast.py`) |

## Arquitectura y entrenamiento

RetNet sustituye la auto-atención por un mecanismo de retención con un factor de decaimiento gamma aprendido por cabeza. Esto permite tres modos de cómputo equivalentes: forma paralela para prefill/serving, forma por bloques (chunkwise) para entrenamiento y forma recurrente para decodificación, con coste lineal en la longitud de secuencia durante la generación. El modelo incluye una rama GLA (Gated Linear Attention) implementada pero desactivada (`gla_rank=0`). El vocabulario es de 20.000 tokens con tokenizador ByteLevel BPE.

No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de alineación (RLHF/DPO). El autor indica que la v21.1 corrige el olvido catastrófico de la v21.0 (+0,655 nat) y que todos los parámetros son funcionales, tras haber detectado en la versión anterior un 41,18 % de parámetros declarados a cero. La decodificación puede acelerarse con `RETNET_FAST_CHUNKWISE=1` para chunkwise por lotes.

## Capacidades

- Generación de texto autoregresiva como modelo base (no instruido).
- Razonamiento, aritmética y código a nivel de suelo para 0,5B, según el autor.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; el tokenizador ByteLevel BPE es genérico pero no se especifican idiomas.
- Sin modo thinking, visión ni audio.
- Inferencia en tres modos (paralelo, chunkwise, recurrente) gracias al diseño RetNet.

## Casos de uso

- Investigación sobre arquitecturas alternativas a la atención: sirve para reproducir y comparar el comportamiento de RetNet frente a transformers de tamaño similar en tareas de modelado de lenguaje.
- Experimentos de eficiencia en decodificación: la forma recurrente permite generación con coste lineal en la longitud de secuencia, útil para estudiar throughput frente a atención cuadrática.
- Fine-tuning como base para tareas concretas: al ser un modelo base de 0,5B con licencia MIT, puede ajustarse para clasificación, extracción o generación de dominio específico en entornos con recursos limitados.
- Pruebas de pipelines de serving: el checkpoint permite validar integraciones con `trust_remote_code=True` y modos chunkwise por lotes en frameworks compatibles con transformers.
- Docencia y divulgación: ilustra el funcionamiento de la retención y el decaimiento por cabeza con un modelo pequeño y código accesible.
- Evaluación de técnicas de reparación de checkpoints: la comparación v21.0 frente a v21.1 documentada por el autor es un caso de estudio sobre olvido catastrófico y parámetros muertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico reportado por el autor es la métrica interna de titularidad (criterio de 5 ficheros): 2,4885 en v21.1 frente a 3,5027 en v21.0, sin definición pública detallada en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: los pesos en fp32 ocupan 1,92 GB; en bfloat16, aproximadamente 1,0 GB. Con overhead de activaciones y caché, cabe holgadamente en GPUs consumer de 8 GB o más.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en bfloat16; A100/H100 no son necesarias por tamaño, aunque pueden usarse para entrenamiento o fine-tuning.
- Cabe en GPUs consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, entre otras.
- Opciones de despliegue: transformers con `trust_remote_code=True`; el código personalizado (`modeling_retnet.py`, `retention_fast.py`) condiciona la compatibilidad con vLLM, llama.cpp, Ollama o TGI, para los que no hay soporte documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetNet-0.5B-v21.1 | 504.179.896 | 2048 | RetNet (retention) | MIT | Hugging Face, código custom |
| Alternativas de ~0,5B tipo transformer | no disponible | no disponible | transformer | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables evaluados en la misma información, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no es adecuado como asistente conversacional sin fine-tuning previo.
- Capacidades de chat, aritmética y código limitadas al suelo de 0,5B, según el propio autor.
- Idiomas soportados no documentados; riesgo de comportamiento deficiente fuera del inglés o de los idiomas presentes en el corpus de entrenamiento (no especificado).
- Riesgo de alucinación inherente a un modelo base de este tamaño.
- Sesgos no evaluados ni documentados.
- Requiere `trust_remote_code=True` y ejecuta código de modelado personalizado; conviene auditar `modeling_retnet.py` y `retention_fast.py` antes de usarlo en producción.
- Pesos almacenados en fp32; para inferencia se recomienda cargar en bfloat16, lo que puede introducir diferencias numéricas respecto al checkpoint original.
- Licencia MIT permite uso comercial, pero no hay garantías ni evaluación de seguridad por parte del autor.
- La métrica de titularidad empleada por el autor no está definida públicamente en la información disponible, lo que dificulta la comparación con otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ayaka157/RetNet-0.5B-v21.1
- Repositorio de código, datos y evaluación: https://github.com/Ayaka157/RetNet
- Informe técnico (2026-10-29, PDF en inglés/chino): https://github.com/Ayaka157/RetNet/blob/main/docs/latex/en/RetNet-0.5B-Technical-Report.pdf
- Demo: https://retnet.ayaka157.icu/play/
