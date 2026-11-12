# bambocher/Qwen3.5-0.8B-heretic-oQ2-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ2-mtp es una versión "decensored" (ablacionada para eliminar rechazos) del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario bambocher. Sobre el checkpoint original se aplicó Heretic v2.0.0, una herramienta de ablación por rangos arbitrarios (ARA) que modifica los pesos de las capas 1 a 19 para reducir la tasa de rechazos, y posteriormente se cuantizó con oQ (oMLX v0.7.3) en precisión mixta. El resultado es un checkpoint de 873.438.784 parámetros (0,873B) con un promedio efectivo de 4,685 bits por peso.

El modelo conserva la cabeza de predicción multi-token (MTP) del original, lo que permite decodificación especulativa nativa, y mantiene el módulo de visión (0,101B parámetros). El almacenamiento total del repo es de 1,0 GB, con pesos lógicos que ocupan 0,476 GiB tras la cuantización. La arquitectura subyacente es la de Qwen3.5, un transformer con capacidades multimodales, aunque la model card no detalla la composición exacta del bloque de atención ni la longitud de contexto.

La relevancia de esta ficha es doble: por un lado, documenta un caso de cuantización extrema (2-5 bits mixtos) sobre un modelo sub-1B para despliegue en Apple Silicon vía MLX; por otro, ilustra el ecosistema de derivados "heretic" orientados a eliminar comportamientos de rechazo, con implicaciones éticas y de licencia que conviene evaluar antes de usarlo en producción. La información pública disponible es limitada: no hay benchmarks, licencia declarada ni idiomas especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (multimodal, con cabeza MTP); detalles de atención no disponibles |
| Parametros totales | 873.438.784 (0,873B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 2-bit g64, 3-bit g128, 3-bit g64, 4-bit g64, 5-bit g64 y BF16; promedio 4,685 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería MLX) |

Desglose de la cuantización por componente (según model card):

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 0,752B | 0,296 GB / 0,275 GiB |
| Visión | 0,101B | 0,201 GB / 0,187 GiB |
| Cabeza MTP | 0,020B | 0,015 GB / 0,014 GiB |
| Total | 0,873B | 0,512 GB / 0,476 GiB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5 con un módulo de visión de 0,101B parámetros y una cabeza de predicción multi-token (MTP) de 0,020B parámetros. La presencia de MTP indica que el modelo original está diseñado para decodificación especulativa: la cabeza predice varios tokens por paso, lo que puede acelerar la inferencia en hardware compatible. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La modificación principal es la ablación ARA aplicada con Heretic v2.0.0 sobre las capas 1 a 19 (start_layer_index=1, end_layer_index=19). Los hiperparámetros publicados son: preserve_good_behavior_weight=0,8199, steer_bad_behavior_weight=0,0001, overcorrect_relative_weight=1,0547 y neighbor_count=14. El efecto reportado es una reducción de rechazos de 97/100 en el original a 0/100 en este derivado, con una divergencia KL de 0,1412 respecto al modelo base. Esa KL mide cuánto se ha desviado la distribución de salida, y un valor de 0,14 no es trivial: implica cambios medibles en el comportamiento generativo más allá de la simple supresión de rechazos.

Sobre el checkpoint ablacionado se aplicó cuantización mixta con oQ (oMLX v0.7.3), asignando precisión según la sensibilidad de cada tensor: el 35,7% de los pesos lógicos quedan en 2 bits (grupo 64), el 46,1% en 3 bits (grupos 64 y 128), el 6,4% en 4-5 bits y el 11,8% en BF16. Esta distribución busca preservar en BF16 las capas o tensores más sensibles (probablemente embeddings, normas y cabeza de salida) mientras comprime agresivamente el resto.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-0.8B.
- Procesamiento de visión: el checkpoint conserva el módulo visual de 0,101B parámetros, por lo que mantiene capacidad de entrada de imágenes (el alcance exacto no está documentado en la model card).
- Decodificación especulativa mediante la cabeza MTP intacta, que permite predecir múltiples tokens por paso en runtimes que la soporten.
- Comportamiento "decensored": tasa de rechazos reportada de 0/100 frente a 97/100 del original, orientado a evitar negativas ante prompts que el modelo base rechazaría.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo sirve como caso de estudio controlado para medir cómo una ablación ARA (KL=0,1412) afecta a la distribución de salidas y a la tasa de negativas, comparándolo con el Qwen3.5-0.8B original en el mismo benchmark de 100 prompts.
- Prototipado local en Apple Silicon: con 0,476 GiB de pesos en formato MLX, cabe holgadamente en la memoria unificada de cualquier Mac con chip M-series, lo que permite iterar en local sin GPU dedicada.
- Evaluación de cuantización extrema: útil para estudiar la degradación de calidad de esquemas mixtos de 2-5 bits sobre un modelo pequeño, midiendo perplejidad y coherencia frente al checkpoint en BF16.
- Generación de texto sin filtros en entornos de investigación creativa: escritura de ficción o guiones donde los rechazos del modelo base interrumpen el flujo, asumiendo la responsabilidad de revisar las salidas.
- Pruebas de decodificación especulativa: la cabeza MTP intacta permite experimentar con técnicas de speculative decoding en MLX y medir la aceleración frente a decodificación autoregresiva estándar.
- Pipeline de visión ligero en el borde: el módulo visual de 0,101B parámetros posibilita tareas de descripción de imágenes o VQA de baja latencia en dispositivos con poca memoria, siempre que se valide la calidad tras la cuantización.

## Benchmarks y rendimiento

La model card solo publica métricas del proceso de ablación, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Qwen/Qwen3.5-0.8B original |
|---|---|---|
| Rechazos (sobre 100 prompts) | 0/100 | 97/100 |
| Divergencia KL | 0,1412 | 0 (por definición) |

No se han publicado resultados de benchmarks de calidad (razonamiento, código, matemáticas, visión) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 0,476 GiB (0,512 GB) según la model card; el repo completo pesa 1,0 GB, probablemente por duplicación de tensores o metadatos. En inferencia hay que sumar KV cache y activaciones, no cuantificadas en la documentación.
- GPU recomendadas: el formato es MLX, por lo que el objetivo natural son chips Apple M1/M2/M3/M4 con memoria unificada. No hay indicación de soporte para CUDA (A100, H100, RTX 4090) en la información disponible.
- Consumer GPU: cabe en cualquier Mac con chip M-series; en el ecosistema NVIDIA requeriría conversión previa a otro formato (no documentada).
- Opciones de despliegue: MLX y oMLX (el runtime usado para cuantizar). No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-0.8B-heretic-oQ2-mtp | 0,873B | No disponible | oQ mixta 2-5 bits + BF16 (4,685 bits/peso) | No disponible | Derivado decensored con MTP intacta, formato MLX |
| Qwen/Qwen3.5-0.8B | 0,873B (aprox.) | No disponible | BF16 original | No disponible | Modelo base; 97/100 rechazos |
| Otros derivados Heretic de Qwen3.5-0.8B | No disponible | No disponible | Variable | No disponible | No se han identificado en la información proporcionada |

No se dispone de datos suficientes para comparar rendimiento (benchmarks) con alternativas de la misma categoría.

## Limitaciones y advertencias

- La ablación ARA reduce los rechazos a 0/100, lo que implica que el modelo puede generar contenido que el original bloqueaba; requiere filtrado y supervisión en cualquier despliegue público.
- La divergencia KL de 0,1412 respecto al base indica cambios de comportamiento más amplios que la mera supresión de negativas; la calidad en tareas estándar puede haberse degradado y no hay benchmarks que lo cuantifiquen.
- La cuantización agresiva (35,7% de pesos en 2 bits) puede introducir artefactos en generación larga, matemáticas y código; no se han publicado evaluaciones de perplejidad.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; además, al ser un derivado de Qwen, habría que verificar la licencia del modelo base.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe equivalente al del original.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos largos.
- El formato MLX limita el despliegue a hardware Apple; no hay ruta documentada a CUDA.
- Riesgo de alucinación inherente a un modelo de 0,8B, agravado por la cuantización y la ablación; no apto para tareas de alta precisión sin verificación.
- Sesgos: no documentados, pero heredados del corpus de entrenamiento del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ2-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic (herramienta de ablación): https://heretic-project.org
- oQ / oMLX (cuantización): https://github.com/jundot/omlx
