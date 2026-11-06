# sanjaimurugan/py-alpha-29m

## Resumen

py-alpha-29m es un modelo de lenguaje encoder-decoder de 29,5 millones de parámetros entrenado desde cero por el usuario sanjaimurugan sobre código Python. Se trata de un experimento de investigación más que de un modelo de producción: el autor construye su propio tokenizador BPE byte-level, su propio corpus, su esquema de preentrenamiento por corrupción de spans al estilo T5 y su propio harness de evaluación, todo ello en un único Apple M4 Pro. El objetivo declarado no es competir con modelos comerciales, sino medir con rigor hasta dónde llega un modelo de este tamaño en generación de código.

El modelo se distribuye en dos checkpoints: `stage1.pt`, preentrenado con corrupción de spans, y `stage2aug.pt`, afinado para generar el cuerpo de una función a partir de una petición en lenguaje natural y su firma. La model card es explícitamente honesta sobre los resultados: el modelo produce Python sintácticamente válido en la mayoría de los casos (88-97% de parse rate según el benchmark), pero casi nunca correcto. En MBPP obtiene 0,0% de pass@1 y en HumanEval 1,7% (un único acierto, `strlen`).

Su relevancia es metodológica: documenta con detalle qué intervenciones mejoran el formato y cuáles no mueven la corrección, y aporta evidencia de que el muestreo best-of-n no supera a la decodificación greedy en este régimen de tamaño. Es un caso de estudio útil para investigadores interesados en el escalado de modelos de código y en la evaluación honesta de modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (4 capas de encoder, 12 de decoder, cross-attention en cada capa) |
| Parámetros totales | 29.521.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens en encoder, 1024 tokens en decoder |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (peticiones) y Python (código) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`.pt`), requiere `model.py` y `config.py` del repo; no compatible con `AutoModel` |

Otros detalles arquitectónicos: `d_model` 320, 10 cabezas de atención (`head_dim` 32), `d_ffn` 832, vocabulario de 8.192 tokens BPE byte-level más 100 sentinelas, LayerNorm pre-norm, SwiGLU, posiciones sinusoidales, MHA, proyección de salida atada al embedding del decoder y embeddings separados para encoder y decoder.

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder clásico con normalización pre-norm, activación SwiGLU y embeddings posicionales sinusoidales. El preentrenamiento sigue el esquema de corrupción de spans de T5 sobre 600.001.082 tokens de Python deduplicado y decontaminado, extraídos del dataset `codeparrot/codeparrot-clean`. La etapa 1 se entrenó durante 16.000 pasos (5 horas) y alcanzó una pérdida de validación de 1,2153, perplejidad 3,31 y una precisión de token del 74,6% exacta y 89,0% en top-5.

La etapa 2 consistió en un ajuste fino sobre 500.000 pares (petición, código) minados a partir de docstrings, con una duración de 1 hora y 20 minutos y una pérdida de validación de 1,8659 (perplejidad 6,5). El autor señala explícitamente que el reparto encoder-decoder se eligió para aprender cross-attention, no por eficiencia: el 42% de los parámetros (embedding del encoder, capas del encoder y cross-attention) existe para leer peticiones que promedian 18 tokens. Para la tarea petición-corta-a-código-largo, un modelo decoder-only habría dedicado esos parámetros a la generación.

El pipeline de entrenamiento incluye utilidades con autotest: `corruption.py` verifica que el enmascaramiento es exactamente invertible y `model.py` comprueba que la pérdida inicial se sitúa en `ln(vocab_size)`, que el decoder no ve tokens futuros y que el padding del encoder es invisible para la cross-attention.

## Capacidades

- Generación de código Python sintácticamente válido en la mayoría de los casos: 88,3% de parse rate en HumanEval y 90,0% en MBPP (97,0% si se proporciona la firma).
- Generación del cuerpo de una función a partir de una petición en lenguaje natural y una firma (checkpoint `stage2aug.pt`).
- Denoising de código mediante corrupción de spans (checkpoint `stage1.pt`, modo `denoise` de `sample.py`).
- Comprensión de peticiones cortas en inglés (media de 18 tokens en la etapa 2).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés para peticiones y a Python para código.

## Casos de uso

- Investigación sobre escalado de modelos de código: el modelo sirve como punto de referencia de 29,5M de parámetros para estudiar la relación entre tamaño, tokens de entrenamiento y pass@1 en generación de código, con la ventaja de que el pipeline completo es reproducible en hardware de consumo.
- Estudio de esquemas de preentrenamiento: la separación entre etapa 1 (corrupción de spans) y etapa 2 (petición a código) permite analizar qué aprende cada fase y cómo se transfiere el conocimiento sintáctico a la generación condicionada.
- Docencia sobre arquitecturas encoder-decoder: el código incluye autotests que verifican causalidad del decoder, aislamiento del padding y pérdida inicial teórica, lo que lo convierte en material didáctico para explicar el funcionamiento interno de un transformer.
- Reproducción de experimentos de evaluación: el harness `eval.py` implementa MBPP y HumanEval con ejecución en sandbox y best-of-n, reutilizable para comparar otros modelos pequeños bajo el mismo protocolo.
- Generación de esqueletos de código: dado que el parse rate es alto (hasta 97% con firma), el modelo puede emplearse para producir estructuras sintácticamente válidas que un humano complete, nunca como generador autónomo de código funcional.
- Análisis de calidad de datos: el hallazgo de que el 86,6% de los pares de entrenamiento referencian nombres no importados, junto con el script `filter_pairs.py`, sirve como caso práctico para estudiar el impacto de la minería de docstrings en la calidad del corpus.
- Estudio de estrategias de decodificación: la evidencia de que best-of-n nunca supera a greedy y de que el parse rate cae del 88% al 2% al subir la temperatura de 0 a 0,8 es un resultado empírico útil para diseñar políticas de muestreo en modelos pequeños.

## Benchmarks y rendimiento

| Benchmark | pass@1 | Parse rate |
|---|---|---|
| MBPP (100) | 0,0% | 90,0% |
| MBPP (100), con firma | 0,0% | 97,0% |
| HumanEval (60) | 1,7% | 88,3% |

| Métrica de entrenamiento | Valor |
|---|---|
| Etapa 1: val loss | 1,2153 |
| Etapa 1: perplejidad | 3,31 |
| Etapa 1: precisión de token | 74,6% exacta, 89,0% top-5 |
| Etapa 2: val loss | 1,8659 |
| Etapa 2: perplejidad | 6,5 |

El único acierto en HumanEval corresponde a `strlen` (`return len(string)`). Como referencia, el autor cita que Qwen2.5-Coder-0.5B obtiene 28,0 en HumanEval y 52,9 en MBPP con 16,7 veces más parámetros y 9.167 veces más tokens de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (29,5M de parámetros ocupan aproximadamente 118 MB en pesos); el repo pesa 0,2 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el autor entrenó en un Apple M4 Pro mediante MPS.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4060 y superiores; también en CPU.
- Opciones de despliegue: no es compatible con vLLM, TGI ni Ollama por ser una arquitectura personalizada; requiere cargar `model.py` y `config.py` del repo junto con el checkpoint mediante PyTorch.
- Throughput de entrenamiento reportado: aproximadamente 30.000 tokens por segundo en el M4 Pro.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval pass@1 | MBPP pass@1 | Licencia |
|---|---|---|---|---|---|
| py-alpha-29m | 29,5M | 512/1024 | 1,7% | 0,0% | MIT |
| Qwen2.5-Coder-0.5B | ~494M | 32.768 | 28,0% | 52,9% | Apache 2.0 |
| Otros modelos pequeños de código | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con Qwen2.5-Coder-0.5B es la única aportada por el autor y debe interpretarse con cautela: la diferencia en parámetros (16,7×) y en tokens de entrenamiento (9.167×) hace que no sean directamente comparables como alternativas de producción. No se dispone de datos de otros modelos de tamaño similar para una comparación más ajustada.

## Limitaciones y advertencias

- Corrección funcional prácticamente nula: 0,0% de pass@1 en MBPP y 1,7% en HumanEval. El modelo no debe usarse para generar código que vaya a ejecutarse sin revisión humana.
- El problema no es de condicionamiento: incluso recibiendo el nombre de la función y la lista de parámetros, el modelo sigue fallando en la composición lógica del cuerpo.
- El muestreo best-of-n no mejora los resultados: en ningún caso superó a la decodificación greedy, y el parse rate cae del 88% al 2% al aumentar la temperatura de 0 a 0,8.
- Sesgo de registro en los datos: los pares minados de docstrings son código de infraestructura de librerías, no ejemplos de estilo tutorial, lo que limita la diversidad de los patrones aprendidos.
- El 86,6% de los pares de entrenamiento referencian nombres nunca importados ni definidos; aunque el modelo solo emite referencias indefinidas el 3,3% de las veces en MBPP, el sesgo está presente en el corpus.
- Contexto limitado: 512 tokens en el encoder y 1024 en el decoder, insuficiente para archivos completos o conversaciones multi-turno.
- Solo admite inglés en las peticiones y Python como lenguaje de código.
- Licencia MIT, que permite uso comercial, pero el estado del modelo hace inviable cualquier aplicación en producción más allá de la investigación o la docencia.
- Arquitectura personalizada: no funciona con `AutoModel`, `vLLM`, `TGI` ni `Ollama`, lo que complica su integración en infraestructura estándar.
- Riesgo de alucinación alto en la lógica del código: el modelo genera cuerpos plausibles sintácticamente pero sin relación con la tarea solicitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanjaimurugan/py-alpha-29m
- Dataset utilizado: https://huggingface.co/datasets/codeparrot/codeparrot-clean
