# Ayaka157/RetNet-0.5B-16k

## Resumen

RetNet-0.5B-16k es un modelo de lenguaje de 504 millones de parámetros desarrollado por Ayaka157 como parte de una línea de investigación de entrenamiento desde cero basada en la arquitectura RetNet (Retentive Network), una alternativa a los transformers clásicos que sustituye la atención por un mecanismo de retención con decaimiento multi-escala. Este checkpoint concreto es una exportación de investigación (v21.2) entrenada específicamente para extender la ventana de contexto hasta 16.384 tokens sobre una base previa (v21.1 C-end), mediante 13.000 pasos adicionales y 0,852 mil millones de tokens.

El modelo resuelve, según sus propias métricas, el modelado de lenguaje sobre documentos largos: mejora sustancialmente la perplejidad en la cola larga dentro de documento a 16k (de 3,2841 a 2,5942). Sin embargo, el autor es explícito al señalar que la recuperación tipo needle en contexto falla (0,0978 frente a 0,10 de azar) y que la "capacidad de 16k" no está acreditada, porque la puerta de validación Tier-2 no se superó.

Es relevante ahora como artefacto de investigación reproducible: incluye código de modelado personalizado, tokenizador BPE propio de 20.000 tokens, hashes de verificación y un registro de entrenamiento público. No es un modelo para producción ni para uso conversacional; el propio autor redirige a su variante v21.3-chat para ese fin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetNet (Retentive Network) con decaimiento por cabeza aprendido (γ), rama GLA presente con `gla_rank=0` |
| Parametros totales | 504.179.896 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens en entrenamiento; capacidad efectiva de 16k no acreditada (fallo en la puerta Tier-2) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en fp32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32, 1,88 GiB), más `modeling_retnet.py`, `retention_fast.py`, `fused_ce.py` y `bpe_tokenizer.json` |

## Arquitectura y entrenamiento

RetNet sustituye la atención cuadrática por un mecanismo de retención que admite tres modos de cómputo (paralelo, recurrente y chunkwise). Este checkpoint usa 20 capas, anchura 1.408 y 22 cabezas, con un decaimiento γ aprendido por cabeza y calibrado en la fase C1 sobre 20 cabezas. La ruta de inferencia soportada es la chunkwise, que requiere compilación para ser viable en secuencias largas. El vocabulario es un BPE ByteLevel de 20.000 tokens, deliberadamente pequeño para el tamaño del modelo.

El entrenamiento consistió en 13.000 pasos a 16.384 tokens sobre 0,852 mil millones de tokens, con una mezcla de 7.000 pasos de documento largo, 4.500 mixtos y 1.500 de chat a 16k, partiendo de la base v21.1 C-end. Se ejecutó en 2×RTX PRO 6000 con learning rate de 2e-5 a 2e-6 y un pico de 83,1 GiB de memoria, alcanzando 1,66 iteraciones por segundo con la ruta compilada. No se documenta RLHF ni DPO; es un modelo base de investigación.

## Capacidades

- Generación de texto autoregresiva sobre documentos largos (hasta 16.384 tokens en entrenamiento).
- Modelado de lenguaje dentro de documento: la perplejidad en cola larga a 16k mejora de 3,2841 a 2,5942.
- Rendimiento estable por posición a 4k y 8k (2,5941 y 2,5967 respectivamente).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en arquitecturas alternativas a la atención: sirve como referencia reproducible para estudiar el comportamiento de RetNet con decaimiento calibrado por cabeza en secuencias de 16k, con código de modelado incluido y hash de verificación.
- Experimentos de modelado de documentos largos: adecuado para medir perplejidad y métricas de lenguaje sobre corpus extensos, que es precisamente lo que el autor valida en su `val_pack` de 4,45 millones de tokens.
- Reproducción de resultados: el registro de entrenamiento público y los scripts permiten replicar el pipeline de calibración γ y la ruta chunkwise compilada.
- Estudio de eficiencia memoria-cómputo en GPUs profesionales: el autor documenta 83,1 GiB de pico y 1,66 it/s en 2×RTX PRO 6000, útil como referencia de planificación de recursos.
- Base para fine-tuning posterior: al estar bajo licencia MIT y en fp32, puede servir de punto de partida para tareas específicas de modelado de lenguaje, siempre que no requieran recuperación en contexto.
- Comparación de tokenizadores de vocabulario reducido: el BPE de 20.000 tokens permite analizar el equilibrio entre tamaño de embedding y calidad en modelos pequeños.
- No es adecuado para RAG, asistentes conversacionales ni recuperación de información, según las propias limitaciones declaradas por el autor.

## Benchmarks y rendimiento

Resultados medidos sobre `val_pack` (5 archivos, 4.454.400 tokens, excluyendo skypile), según la model card:

| Metrica | Base (C-end) | Este export | Delta | Veredicto |
|---|---:|---:|---:|---|
| Criterio 2k | 2,4885 | 2,5524 | +0,0639 | T2 pasa (≤ +0,10), T1 falla (≤ +0,05) |
| Cola larga dentro de documento a 16k | 3,2841 | 2,5942 | −0,690 | pasa (T1/T2) |
| Por posición 4k / 8k | 3,2124 / 3,2300 | 2,5941 / 2,5967 | −0,62 / −0,63 | — |
| Needle@16k (120/profundidad, agrupado) | 0,1000 (azar) | 0,0978 | −0,002 | falla (requiere Δ ≥ +0,10 y absoluto ≥ 0,18) |
| `Δ_marginal_long`@16k de dos brazos | +0,0418 | +0,0407 | −0,001 | pasa en absoluto, sin ganancia |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan 1,88 GiB; el entrenamiento a 16k requirió 83,1 GiB de pico en 2×RTX PRO 6000, por lo que la inferencia en contexto largo necesita margen adicional sobre los pesos.
- GPU recomendadas: el autor documenta RTX PRO 6000 para el entrenamiento; para inferencia en contexto largo se recomienda GPU profesional con memoria amplia.
- GPU de consumo: los pesos caben en cualquier GPU con más de 2 GiB, pero la ruta chunkwise sin compilación es "mucho más lenta y hambrienta de memoria", según el autor, lo que desaconseja GPUs de consumo para secuencias de 16k.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y la ruta chunkwise (`RETNET_FAST_CHUNKWISE=1`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,66 iteraciones por segundo durante el entrenamiento en 2×RTX PRO 6000 con la ruta compilada; no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Estado |
|---|---:|---|---|---|---|
| RetNet-0.5B-16k | 504 M | 16.384 (entrenamiento; efectivo no acreditado) | RetNet | MIT | Export de investigación |
| RetNet-0.5B-v21.3-chat | no disponible | no disponible | RetNet | no disponible | Checkpoint conversacional recomendado por el autor |
| RetNet-0.5B v21.1 C-end | no disponible | no disponible | RetNet | no disponible | Base previa de este export |

No se dispone de datos de benchmarks comparables con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- La recuperación needle a 16k está en el nivel del azar (0,0978 frente a 0,10): no debe usarse para recuperación, RAG ni como asistente de contexto largo.
- El criterio de 2k regresó +0,0639; el autor recomienda usar v21.3-chat para uso conversacional.
- La "capacidad de 16k" no está reclamada: la puerta Tier-2 registrada no se superó.
- La métrica de dos brazos `Δ_marginal_long` no mejoró respecto a la semilla, por lo que el modelo demuestra modelado de lenguaje en documentos largos, no uso efectivo del contexto.
- Idiomas soportados no declarados: riesgo de comportamiento deficiente fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado; al ser un modelo base sin alineación, es esperable en generación abierta.
- Licencia MIT: permite uso comercial, pero el estado de investigación y los fallos de validación desaconsejan su uso en producción.
- Requiere `trust_remote_code=True` y ejecución de código personalizado del repositorio, lo que implica revisar `modeling_retnet.py`, `retention_fast.py` y `fused_ce.py` antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ayaka157/RetNet-0.5B-16k
- Checkpoint conversacional v21.3-chat: https://huggingface.co/Ayaka157/RetNet-0.5B-v21.3-chat
- Colección RetNet-0.5B: https://huggingface.co/collections/Ayaka157/retnet-05b-from-scratch-training-line-6afc5fe4007c9acacd1cb52f
- Repositorio con registro de entrenamiento y figuras: https://github.com/Ayaka157/RetNet
