# ikimyaii/GatedDeltaNet-1.3B-unstructured-ELSA-70pct

## Resumen

GatedDeltaNet-1.3B-unstructured-ELSA-70pct es un checkpoint de investigación publicado por el usuario ikimyaii en HuggingFace: una versión podada al 70 % de dispersión no estructurada del modelo base m-a-p/1.3B-100B-GatedDeltaNet-pure, un modelo de atención lineal de la familia Gated DeltaNet con 1.466.343.808 parámetros totales. La poda se ha realizado con el código oficial de ELSA (arXiv:2510.01650), un método basado en ADMM, y el autor lo presenta explícitamente como baseline de los modelos EHWS de su cuenta.

No es un modelo entrenado desde cero ni afinado para una tarea concreta: su interés es metodológico. Sirve para medir cuánto degrada la poda no estructurada a un modelo de atención lineal pequeño y para reproducir el pipeline de ELSA (4096 pasos ADMM, 32.768 secuencias de C4 de 2.048 tokens, 7,33 horas en una A100 de 40 GB). El resultado publicado es una perplejidad de 17,60 en WikiText-2 y 20,07 en C4, sin benchmarks downstream ni comparación numérica con el modelo denso de partida.

El checkpoint acumula 0 descargas y no declara licencia ni idiomas. Sus pesos ocupan 5,9 GB, un tamaño coherente con un almacenamiento denso en fp32: la dispersión no se traduce en ahorro de memoria ni en aceleración sin kernels específicos. Por tanto, es una pieza útil para investigación en compresión y en arquitecturas de atención lineal, no un candidato para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (atención lineal con compuerta y regla delta), según los tags del repositorio; sin más detalles publicados |
| Parametros totales | 1.466.343.808 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible: no se publican versiones GGUF, AWQ ni GPTQ; el autor poda en bf16 y evalúa en fp16 |
| Idiomas soportados | no disponible (la evaluación se realiza sobre WikiText-2 y C4, corpus predominantemente en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 5,9 GB, consistente con pesos en fp32) |
| Dispersión | 70 % no estructurada, con un umbral de magnitud por capa |
| Capas podadas | 240 capas lineales internas de los bloques; embeddings y lm_head permanecen densos |
| Modelo base | m-a-p/1.3B-100B-GatedDeltaNet-pure |
| Dataset de calibración de la poda | C4 (32.768 secuencias de 2.048 tokens) |
| Dependencias de carga | `flash-linear-attention` (`import fla`) y `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base m-a-p/1.3B-100B-GatedDeltaNet-pure, que los tags identifican como Gated DeltaNet: un esquema de atención lineal con compuerta y regla delta en lugar de atención softmax completa. El nombre del repositorio base sugiere un entrenamiento sobre 100.000 millones de tokens y un tamaño de 1.300 millones de parámetros, aunque la model card de esta ficha no documenta ni la composición del corpus, ni la longitud de contexto, ni si hubo fases de RLHF o DPO. Estos datos deben considerarse no disponibles.

Lo que sí está documentado es el proceso de poda, ejecutado con el `main.py` oficial de ELSA y con los mismos hiperparámetros del experimento HGRN-1.3B al 80 % del propio paper: 4096 pasos ADMM, un paso z cada 32 pasos, batch de 1 con 8 acumulaciones, learning rate 2e-4, lambda 0.01, precisión bf16, 32.768 secuencias de C4 de 2.048 tokens y semilla 0. El run completo consumió 7,33 horas en una A100 de 40 GB. La dispersión es no estructurada: se aplica un único umbral de magnitud por capa, de modo que las filas acaban con distinto número de ceros. La dispersión medida sobre estos pesos es exactamente 0,7000 y las filas no están equilibradas: en las 240 capas podadas, la fila más densa tiene de media 1,77 veces los no-ceros de la fila media, con un peor caso de 2,98 veces.

## Capacidades

- Modelado de lenguaje autoregresivo y generación de texto en el mismo dominio que el modelo base.
- Evaluación de calidad mediante perplejidad: es la única métrica publicada (WikiText-2 y C4).
- Reproducción de experimentos de poda ADMM con el código de ELSA y comparación frente a variantes estructuradas o semiestructuradas.
- Serve como baseline de referencia para los modelos EHWS del mismo autor.
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia publicada de capacidades multilingües, de visión, audio ni de modo de razonamiento explícito (thinking mode).
- La carga requiere el paquete `flash-linear-attention` y ejecución con `trust_remote_code=True`.

## Casos de uso

- Investigación en compresión de modelos: permite reproducir el pipeline de ELSA sobre una arquitectura de atención lineal y comparar la curva perplejidad-dispersión con otros métodos de poda.
- Baseline en estudios de sparsity no estructurada: al estar publicado con hiperparámetros fijos y semilla 0, sirve como punto de referencia controlado frente a técnicas estructuradas (2:4, heads, canales) que el mismo grupo evalúe.
- Reproducción académica del paper arXiv:2510.01650: el autor documenta pasos ADMM, learning rate, lambda y presupuesto de datos, lo que permite repetir el experimento completo en menos de 8 horas de A100.
- Estudio de la distribución de no-ceros por fila: el desequilibrio documentado (1,77x de media, 2,98x en el peor caso) es un caso práctico para investigar el impacto de la poda no uniforme en kernels dispersos.
- Experimentos de destilación o recuperación (pruning-aware fine-tuning): el checkpoint podado puede actuar como inicialización para evaluar si un ajuste posterior recupera la perplejidad del modelo denso.
- Docencia y divulgación técnica: ejemplo reproducible de cómo la dispersión no estructurada no reduce el tamaño del checkpoint ni acelera la inferencia en GPUs convencionales, útil para explicar la diferencia entre sparsity nominal y sparsity efectiva.
- Tests de integración de `flash-linear-attention`: el modelo ejercita la ruta de carga de Gated DeltaNet con `trust_remote_code=True` en entornos de CI de la librería.

## Benchmarks y rendimiento

| Modelo | Tipo de dispersión | WikiText-2 (perplejidad) | C4 (perplejidad) |
|---|---|---|---|
| GatedDeltaNet-1.3B-unstructured-ELSA-70pct | no estructurada, 70 % | 17,60 | 20,07 |

Datos de una única ejecución, en fp16 y con el script de evaluación del propio código de ELSA. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark downstream, ni la perplejidad del modelo base denso con la misma evaluación, por lo que no es posible cuantificar la degradación introducida por la poda.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 5,9 GB solo de pesos (1.466.343.808 parámetros × 4 bytes), más activaciones y caché.
- VRAM en bf16/fp16: aproximadamente 2,9 GB de pesos; requiere convertir manualmente, ya que el repositorio no publica una versión en media precisión.
- VRAM en int8: aproximadamente 1,5 GB; en int4, aproximadamente 0,75 GB, siempre mediante cuantización propia, no disponible en el repositorio.
- La dispersión no estructurada no reduce la huella de memoria: el checkpoint se almacena denso y solo un kernel disperso específico aprovecharía los ceros.
- Cabe en GPUs de consumo: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) e incluso tarjetas de 8 GB si se convierte a fp16 o int8.
- GPU de referencia del entrenamiento de poda: una A100 de 40 GB, con un tiempo de 7,33 horas para el run completo de ADMM.
- Opciones de despliegue: `transformers` con `flash-linear-attention` instalado y `trust_remote_code=True`. Soporte en vLLM, TGI, llama.cpp, Ollama o MLX: no confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dispersión | Perplejidad publicada | Licencia |
|---|---|---|---|---|---|
| Este modelo (ELSA, no estructurada 70 %) | 1,47 B | no disponible | 70 % no estructurada | WikiText-2 17,60 / C4 20,07 | no disponible |
| m-a-p/1.3B-100B-GatedDeltaNet-pure (base denso) | ~1,3 B según el nombre | no disponible | 0 % | no disponible | no disponible |
| HGRN-1.3B con ELSA al 80 % (referencia del paper) | ~1,3 B | no disponible | 80 % | no disponible en esta ficha | no disponible |
| Otros checkpoints EHWS de la misma cuenta | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas no es posible con los datos públicos de este repositorio: falta la perplejidad del modelo denso y la de los demás checkpoints de la serie. La única referencia metodológica es el experimento HGRN-1.3B al 80 % del paper de ELSA, cuyos resultados no se incluyen aquí.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial ni redistribución; hay que contactar con el autor o consultar la licencia del modelo base, que tampoco figura en esta ficha.
- La poda no estructurada rompe el equilibro por filas: con un umbral único por capa, la fila más densa concentra 1,77 veces la media de no-ceros (2,98 en el peor caso), lo que complica cualquier implementación con kernels dispersos.
- No hay ahorro real de memoria ni de cómputo en hardware denso: el repositorio pesa 5,9 GB, coherente con pesos fp32 completos.
- Solo se publica perplejidad, de una única ejecución y sin intervalo de confianza; no hay evidencia de comportamiento en tareas downstream.
- Riesgo de alucinación y de degradación cualitativa no medido: la poda al 70 % en todas las capas lineales internas puede afectar de forma desigual a capacidades que no se han evaluado (código, matemáticas, instrucciones).
- Idiomas no declarados: la calibración y la evaluación usan C4 y WikiText-2, corpus predominantemente en inglés, por lo que el rendimiento en castellano es desconocido.
- Longitud de contexto no documentada; las secuencias de calibración son de 2.048 tokens y no hay garantía de comportamiento más allá de esa longitud.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio: hay que auditar los ficheros de modelado antes de cargarlo en entornos sensibles.
- Dependencia obligatoria de `flash-linear-attention`; sin esa librería la carga falla.
- No apto para producción: 0 descargas, 0 likes, sin pipeline declarado y sin garantías de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ikimyaii/GatedDeltaNet-1.3B-unstructured-ELSA-70pct
- Modelo base: https://huggingface.co/m-a-p/1.3B-100B-GatedDeltaNet-pure
- Paper del método de poda (ELSA): https://arxiv.org/abs/2510.01650
- Repositorio de `flash-linear-attention`: no disponible en la información proporcionada
