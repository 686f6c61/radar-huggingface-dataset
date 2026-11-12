# bambocher/Qwen3.5-0.8B-heretic-oQ2.5-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ2.5-mtp es una versión "decensored" (ablacionada para reducir rechazos) del modelo Qwen/Qwen3.5-0.8B, publicada por el usuario bambocher en Hugging Face. Sobre el modelo base se ha aplicado Heretic v2.0.0, una herramienta de ablación de rangos arbitrarios (ARA) que modifica los pesos de las capas 1 a 19 para eliminar comportamientos de rechazo, y posteriormente se ha cuantizado con oQ (oMLX v0.7.3) en precisión mixta. El checkpoint conserva la cabeza de predicción multi-token (MTP) del modelo original.

El resultado es un modelo de 873 millones de parámetros totales (0,752B en el modelo de lenguaje, 0,101B en el codificador visual y 0,020B en la cabeza MTP) con un peso efectivo medio de 4,920 bits por parámetro y un almacenamiento total de 0,500 GiB. La cuantización mezcla bloques afines de 2, 3, 4, 5 y 8 bits con grupos de 64 y 128, dejando un 11,8% de los pesos en BF16. El formato es safetensors para la librería MLX, lo que lo orienta a inferencia en hardware Apple Silicon.

La relevancia de esta ficha es doble: por un lado documenta un caso de uso de técnicas de ablación para eliminar rechazos (de 97/100 a 0/100 según el autor) con una divergencia KL de 0,1412 respecto al original; por otro, muestra un pipeline de cuantización agresiva (por debajo de 5 bits efectivos) sobre un modelo multimodal pequeño con cabeza MTP, un formato poco habitual en el ecosistema open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador visual) con cabeza de predicción multi-token (MTP); detalles de capas y atención no disponibles |
| Parametros totales | 873.438.784 (0,873B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta oQ: affine 2-bit grupo 64, 3-bit grupo 128, 3-bit grupo 64, 4-bit grupo 64, 5-bit grupo 64, 8-bit grupo 64 y BF16; media efectiva 4,920 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería MLX) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer multimodal que combina un modelo de lenguaje de 0,752B parámetros con un codificador visual de 0,101B y una cabeza de predicción multi-token de 0,020B. La presencia de la cabeza MTP sugiere que el modelo base está diseñado para decodificación especulativa o predicción de varios tokens por paso, aunque la model card no detalla el mecanismo exacto ni el número de tokens que predice. No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención ni tipo de atención (lineal, completa o híbrida).

El proceso de modificación consta de dos etapas. Primero, Heretic v2.0.0 aplica una ablación de rangos arbitrarios (ARA) sobre las capas 1 a 19 con los parámetros indicados: `start_layer_index=1`, `end_layer_index=19`, `preserve_good_behavior_weight=0.8199`, `steer_bad_behavior_weight=0.0001`, `overcorrect_relative_weight=1.0547` y `neighbor_count=14`. Esta técnica proyecta los pesos fuera de una dirección de comportamiento no deseado preservando al mismo tiempo una dirección de comportamiento deseado. Segundo, oQ (oMLX v0.7.3) cuantiza el checkpoint en precisión mixta, asignando 2 bits a un 4,4% de los pesos lógicos, 3 bits al 77,3%, 4 bits al 2,1%, 5 bits al 4,3%, 8 bits a una fracción insignificante y manteniendo un 11,8% en BF16. No se documentan los datos de entrenamiento originales, el número de tokens vistos ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-0.8B.
- Procesamiento de imágenes: el checkpoint incluye un codificador visual de 0,101B parámetros, por lo que se espera soporte de entrada multimodal (no se detallan resoluciones ni número de tokens visuales).
- Predicción multi-token (MTP): la cabeza MTP se conserva intacta, lo que permite decodificación especulativa o generación de varios tokens por paso si el runtime MLX lo soporta.
- Reducción drástica de rechazos: según el autor, 0/100 rechazos frente a 97/100 del modelo original en su evaluación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre alineación y ablación: el checkpoint permite reproducir y analizar el efecto de Heretic v2.0.0 sobre un modelo pequeño, comparando la divergencia KL (0,1412) y la tasa de rechazos (0/100) con el modelo original. Es adecuado porque el autor publica los parámetros ARA exactos y las métricas de comparación.
- Evaluación de cuantización mixta extrema: sirve para medir la degradación de calidad de una cuantización de 4,920 bits/peso efectivos en un modelo de 0,873B, con desglose por bloques de 2, 3, 4, 5 y 8 bits. Útil para estudiar qué capas toleran 2-3 bits y cuáles requieren BF16.
- Inferencia local en Apple Silicon: con 0,500 GiB de almacenamiento, el modelo cabe holgadamente en la memoria unificada de cualquier Mac con chip M-series, lo que permite desplegarlo en portátiles para pruebas de generación de texto y visión sin GPU dedicada.
- Prototipado de decodificación especulativa: al conservar la cabeza MTP, se puede integrar en pipelines MLX que implementen predicción multi-token para comparar latencia frente a decodificación autoregresiva estándar en modelos sub-1B.
- Pruebas de contenido sin restricciones en entornos controlados: para investigación sobre comportamiento de modelos decensored, análisis de sesgos y estudios de seguridad, dado que el modelo elimina los rechazos del original.
- Docencia y experimentación con modelos multimodales pequeños: su tamaño reducido (0,873B) y su formato safetensors/MLX permiten ejecutarlo en aulas o entornos con recursos limitados para ilustrar arquitecturas multimodales con codificador visual y cabeza MTP.

## Benchmarks y rendimiento

El autor publica dos métricas comparativas frente al modelo original:

| Métrica | Este modelo | Qwen/Qwen3.5-0.8B |
|---|---|---|
| Rechazos | 0/100 | 97/100 |
| Divergencia KL | 0,1412 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 0,500 GiB en disco; en memoria, el runtime MLX necesita además buffers de activaciones y caché KV, por lo que se estima un consumo de aproximadamente 1-2 GB en total, aunque no se dispone de cifras oficiales.
- GPU recomendadas: al ser un formato MLX, está orientado a Apple Silicon (chips M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se documenta soporte para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en cualquier Mac con chip M-series; en el ecosistema NVIDIA no hay soporte nativo por el formato MLX.
- Opciones de despliegue: MLX (librería `mlx`), oMLX para carga de cuantizaciones oQ. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-0.8B-heretic-oQ2.5-mtp | 0,873B | no disponible | no disponible | safetensors (MLX) | Decensored, cuantización mixta 4,920 bits/peso, cabeza MTP |
| Qwen/Qwen3.5-0.8B | 0,8B (aprox.) | no disponible | no disponible | no disponible | Modelo base original, 97/100 rechazos |
| Alternativas sub-1B de la familia Qwen3.5 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de otros autores (Llama, Gemma, Phi, etc.) en esta categoría.

## Limitaciones y advertencias

- El modelo ha sido modificado deliberadamente para eliminar rechazos (0/100 frente a 97/100 del original). Esto implica que puede generar contenido que el modelo base rechazaría, con implicaciones de seguridad y cumplimiento normativo.
- La divergencia KL de 0,1412 respecto al original indica una alteración medible de la distribución de salida; puede degradar capacidades no evaluadas por el autor.
- La cuantización mixta con bloques de 2 y 3 bits en más del 80% de los pesos lógicos puede introducir pérdida de calidad adicional, especialmente en razonamiento y tareas de precisión.
- No se especifica la licencia, lo que impide determinar si el uso comercial está permitido; tampoco se hereda explícitamente la licencia del modelo base Qwen.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que limita la planificación de despliegues multi-turno o multilingües.
- El formato MLX restringe el despliegue a hardware Apple Silicon; no hay pesos GGUF ni safetensors estándar para PyTorch.
- Riesgo de alucinación: no cuantificado por el autor; en modelos sub-1B es habitualmente elevado.
- Sesgos conocidos: no documentados; la ablación ARA puede alterar comportamientos más allá de los rechazos.
- El repositorio tiene 46 descargas y 0 likes, con una única revisión (2026-11-12); no hay validación independiente de las métricas declaradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ2.5-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Heretic (proyecto de ablación): https://heretic-project.org
- oQ / oMLX (cuantización): https://github.com/jundot/omlx
