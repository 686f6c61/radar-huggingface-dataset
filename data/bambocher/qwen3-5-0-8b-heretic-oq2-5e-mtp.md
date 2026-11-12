# bambocher/Qwen3.5-0.8B-heretic-oQ2.5e-mtp

## Resumen

Qwen3.5-0.8B-heretic-oQ2.5e-mtp es una versión cuantizada y "descensurada" (decensored) del modelo Qwen3.5-0.8B de Alibaba Qwen, publicada por el usuario bambocher en Hugging Face. El checkpoint combina tres transformaciones sobre el modelo base: un proceso de ablación de comportamiento mediante Heretic v2.0.0 (que elimina las negativas a responder), una cuantización de precisión mixta con oQ de oMLX v0.7.3 (media efectiva de 4,920 bits por peso) y la preservación de la cabeza de predicción multi-token (MTP) del modelo original.

El modelo tiene 873.438.784 parámetros reales según los safetensors, de los cuales 0,752B corresponden al modelo de lenguaje, 0,101B a la torre de visión y 0,020B a la cabeza MTP. El repositorio ocupa 1,1 GB, aunque el almacenamiento efectivo de los pesos es de 0,537 GB. Está empaquetado en formato MLX (safetensors), por lo que su uso está orientado a hardware Apple Silicon.

Su relevancia es doble: por un lado, demuestra un flujo de cuantización mixta agresiva (2-8 bits por tensor según sensibilidad) que reduce un modelo multimodal a medio gigabyte; por otro, ilustra las técnicas de ablación de rechazos (refusals 0/100 frente a 97/100 del original) con una divergencia KL de 0,1412 respecto al modelo base. Es un artefacto experimental, no un modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con cabeza MTP; pesos en MLX |
| Parámetros totales | 873.438.784 (0,873B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ mixta: affine 2-bit g64, 3-bit g128, 3-bit g64, 4-bit g64, 5-bit g64, 8-bit g64 y BF16; media 4,920 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), cuantización oQ |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5 que incorpora una torre de visión (0,101B de parámetros) y una cabeza de predicción multi-token (MTP, 0,020B). La cabeza MTP permite decodificación especulativa nativa: el modelo predice varios tokens por paso, lo que acelera la generación. El checkpoint conserva esta cabeza intacta tras la cuantización.

Sobre el modelo base se aplicó Heretic v2.0.0, una herramienta de ablación de comportamiento que modifica los pesos en las capas 1 a 19 mediante parámetros ARA (Arbitrary-Rank Ablation): `preserve_good_behavior_weight` 0,8199, `steer_bad_behavior_weight` 0,0001, `overcorrect_relative_weight` 1,0547 y `neighbor_count` 14. El resultado reduce los rechazos de 97/100 a 0/100 con una divergencia KL de 0,1412 frente al original. Posteriormente se aplicó cuantización mixta oQ con oMLX v0.7.3, asignando precisión según la sensibilidad de cada tensor: el 48,2% de los pesos lógicos quedan en 3-bit g128, el 29,1% en 3-bit g64, el 11,8% en BF16 y el resto entre 2 y 8 bits. No se dispone de información sobre el dataset de entrenamiento original ni sobre las fases de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-0.8B.
- Procesamiento de visión: incluye torre visual de 0,101B de parámetros, por lo que admite entrada de imágenes.
- Decodificación especulativa mediante la cabeza MTP conservada, que permite generar varios tokens por paso de inferencia.
- Generación de código y matemáticas (capacidad esperada del modelo base; no verificada en esta ficha).
- Multilingüismo: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Comportamiento sin rechazos: el proceso Heretic elimina las negativas a responder (0/100 en la evaluación del autor).

## Casos de uso

- Investigación sobre alineación y seguridad: el checkpoint permite estudiar el efecto de la ablación Heretic comparando respuestas con el modelo original y midiendo la divergencia KL (0,1412) en distintos dominios.
- Inferencia local en Apple Silicon: con 0,537 GB de pesos efectivos, cabe holgadamente en la memoria unificada de cualquier Mac con chip M-series, lo que permite ejecutar un modelo multimodal en portátiles.
- Prototipado rápido de aplicaciones multimodales: la combinación de torre de visión y tamaño reducido facilita iterar sobre pipelines de imagen-texto en local sin GPU dedicada.
- Evaluación de cuantización mixta: sirve como caso de estudio de la distribución de bits de oQ (2 a 8 bits por tensor) y su impacto en la calidad frente al modelo en BF16.
- Generación de texto en entornos con memoria muy limitada: útil para desplegar un LLM pequeño en dispositivos con menos de 1 GB disponible para pesos.
- Pruebas de decodificación especulativa: la cabeza MTP intacta permite medir aceleraciones de throughput en frameworks MLX compatibles.
- Experimentación con modelos descensurados en entornos controlados: para analizar sesgos y comportamientos sin las capas de rechazo del modelo alineado.

## Benchmarks y rendimiento

| Métrica | Este modelo | Modelo original (Qwen/Qwen3.5-0.8B) |
|---|---|---|
| Rechazos (refusals) | 0/100 | 97/100 |
| Divergencia KL | 0,1412 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,5-0,6 GB para los pesos cuantizados, más overhead de activaciones y del runtime MLX; el repositorio completo ocupa 1,1 GB.
- GPU recomendadas: hardware Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada; el formato MLX no está pensado para CUDA.
- Cabe en GPU de consumo: sí, en cualquier Mac con chip M-series; en el ecosistema NVIDIA requeriría conversión previa, no soportada de forma nativa por este checkpoint.
- Opciones de despliegue: MLX (librería `mlx`), oMLX; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la cabeza MTP podría reducirlos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-heretic-oQ2.5e-mtp | 0,873B | no disponible | no disponible | MLX safetensors (oQ) | Descensurado, cuantización mixta, cabeza MTP |
| Qwen/Qwen3.5-0.8B | 0,8B (aprox.) | no disponible | no disponible | safetensors | Modelo base alineado, 97/100 rechazos |
| Alternativas de <1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Modelo descensurado: la ablación Heretic elimina los rechazos, por lo que puede generar contenido que el modelo original declinaría; no es apto para producción sin filtros externos.
- Divergencia KL de 0,1412 respecto al modelo base: la distribución de salida se ha alterado de forma medible, con posible degradación en tareas sensibles a la alineación.
- Licencia no especificada en la model card: no se puede confirmar el uso comercial; hay que remitirse a la licencia del modelo base Qwen3.5-0.8B.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada.
- Formato MLX exclusivo: no se puede ejecutar directamente en CUDA, ROCm ni CPU con llama.cpp sin conversión.
- Cuantización agresiva (media 4,920 bits/peso, con tensores a 2 bits): riesgo de pérdida de calidad frente al BF16, especialmente en razonamiento y código.
- Solo 44 descargas y 0 likes: ecosistema y validación comunitaria mínimos.
- Riesgo de alucinación inherente a un modelo de 0,8B, agravado por la cuantización.
- Sin datos de benchmarks estándar que permitan evaluar la degradación real introducida por la cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-0.8B-heretic-oQ2.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- oQ / oMLX (herramienta de cuantización): https://github.com/jundot/omlx
- Heretic (proyecto de ablación): https://heretic-project.org
