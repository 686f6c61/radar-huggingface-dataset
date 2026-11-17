# Ayaka157/RetNet-0.5B-8k-gla-s

## Resumen

RetNet-0.5B-8k-gla-s es un artefacto de investigación de 504,4 millones de parámetros construido sobre la línea de entrenamiento desde cero RetNet-0.5B del autor Ayaka157. Se trata de un modelo de lenguaje con arquitectura RetNet (retention en lugar de atención estándar) al que se le han añadido compuertas de decaimiento escalar dependientes de la entrada (GLA-S, rank 8) en las 20 capas, con el objetivo de adaptarlo a documentos largos de hasta 8.192 tokens. El modelo parte de un checkpoint base ya calibrado para 8k y se somete a un entrenamiento adicional de 12.000 pasos a 8.192 tokens más una pasada de reparación de 1.000 pasos a 2.048 tokens.

La relevancia de esta ficha es doble. Por un lado, documenta un experimento técnico concreto sobre decaimiento selectivo en arquitecturas lineales. Por otro, y de forma explícita, el propio autor declara que el artefacto no supera el criterio de evaluación de contexto efectivo a 8k: la métrica de dos brazos `Δ_marginal_long` queda en +0,045053, por debajo del umbral requerido, y la recuperación tipo needle@8k no mejora (0,1117 frente a 0,1161 del modelo semilla). El modelo se publica como artefacto de investigación, no como modelo recomendado para producción; el modelo de chat servido por el autor sigue siendo RetNet-0.5B-v21.3-chat.

El interés práctico, por tanto, está en la reproducibilidad del pipeline (código de modelado, kernel GLA y función de pérdida incluidos en el repositorio) y en la documentación honesta de un resultado negativo, más que en el rendimiento del checkpoint en sí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RetNet (retención multi-escala) con compuertas de decaimiento escalar GLA-S dependientes de la entrada |
| Parametros totales | 504.179.896 (modelo base) + 229.240 (compuertas GLA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrenamiento (+ pasada de reparación a 2.048) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16, 0,94 GiB) + código de modelado propio |

Otros datos técnicos: 20 capas, dimensión de modelo 1408, 22 cabezas, vocabulario de 20.000 tokens con tokenizador ByteLevel BPE. SHA256 de `model.safetensors`: `90b655b2c063d1bb314d9598d22b192582ede8cb41fca3c43c871ef89f086236`.

## Arquitectura y entrenamiento

El modelo emplea RetNet, una familia de arquitecturas que sustituye la atención cuadrática por un mecanismo de retención con decaimiento, lo que permite formulaciones recurrentes y paralelas. Sobre esa base, este checkpoint introduce GLA-S: compuertas de decaimiento escalar dependientes de la entrada con la forma `g = min(W2(W1x)+b, 0)`, donde `b = log γ` y `W1`/`W2` operan con rango 8 en un único grupo. Las compuertas se aplican en las 20 capas (20/20) y añaden 229.240 parámetros al modelo base. El repositorio incluye `modeling_retnet.py`, `gla_kernel.py`, `objective_loss.py`, `retention_fast.py` y `fused_ce.py`, y requiere `trust_remote_code=True`; para secuencias largas se indica la ruta chunkwise con la variable de entorno `RETNET_FAST_CHUNKWISE=1`.

El entrenamiento consta de 12.000 pasos a 8.192 tokens sobre una mezcla denominada 8k/mix8k (70 % documentos largos intra-documento, 20 % pretrain, 10 % chat), seguida de una pasada de reparación de 1.000 pasos a 2.048 tokens. En total se procesaron 0,852 B tokens sobre 2×RTX PRO 6000. No se documenta en la información disponible el uso de RLHF o DPO; la evaluación se realiza sobre `val_pack` (5 ficheros, 4.454.400 tokens, excluyendo skypile).

## Capacidades

- Generación de texto autorregresiva con arquitectura RetNet y decodificación chunkwise para secuencias largas.
- Modelado de documentos largos hasta 8.192 tokens en entrenamiento, aunque sin mejora demostrada del uso efectivo del contexto (ver limitaciones).
- Capacidad de chat básica: la compuerta de chat superó el umbral tras la reparación de 1.000 pasos (0 % de aciertos al tope de concisión, 0 % sin cerrar, mediana de 56 tokens).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor advierte de los límites de conocimiento y aritmética propios de la familia de 0,5B.
- Capacidades multilingües: no disponibles; no se declaran idiomas en la model card.
- Capacidades especiales: no se documentan visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación sobre decaimiento selectivo en arquitecturas lineales: el checkpoint sirve como punto de partida reproducible para estudiar compuertas GLA-S de rango 8 sobre RetNet, con código y kernel incluidos en el repositorio.
- Reproducción de experimentos de contexto largo: permite replicar el pipeline de 12.000 pasos a 8k más reparación a 2k y contrastar la métrica de dos brazos `Δ_marginal_long` frente al modelo semilla v21.3-chat.
- Análisis de resultados negativos: útil para documentar por qué una reducción de pérdida en la cola larga (3,243222 → 2,964826) no se traduce en mejor recuperación a 8k, un fenómeno relevante para quien diseñe evaluaciones de contexto.
- Pruebas de integración de código personalizado: el repositorio incluye `modeling_retnet.py`, `gla_kernel.py` y `retention_fast.py`, lo que permite validar flujos de `trust_remote_code=True` y la ruta chunkwise en entornos controlados.
- Experimentos de ajuste fino sobre una base de 0,5B: su tamaño (0,94 GiB en bfloat16) permite iterar en una sola GPU consumer para tareas de investigación acotadas, asumiendo las limitaciones de conocimiento del modelo.
- Docencia y divulgación: adecuado para ilustrar en un aula o blog las diferencias entre atención estándar, retención y decaimiento dependiente de la entrada, con métricas y artefactos verificables.

## Benchmarks y rendimiento

Resultados medidos sobre `val_pack` (5 ficheros, 4.454.400 tokens, skypile excluido), comparando con el modelo semilla v21.3-chat:

| Metrica | Semilla (v21.3-chat) | Este artefacto | Delta | Veredicto |
|---|---:|---:|---:|---|
| Criterio 2k | 2,591362 | 2,559693 | −0,031669 | PASS (T1/T2) |
| Cola larga intra-documento 8k | 3,243222 | 2,964826 | −0,278396 | PASS (T1/T2) |
| `Δ_marginal_long` a 8k (dos brazos) | +0,049144 | +0,045053 | −0,004091 | FAIL (requiere ≥ +0,02 / +0,04) |
| needle@8k | 0,1161 | 0,1117 | −0,004 | Sin mejora |

Veredicto combinado del autor: T1/T2 FAIL, bloqueado en la métrica de dos brazos. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,0-1,2 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 8.192 tokens el consumo adicional depende de la implementación chunkwise.
- GPU recomendadas: cualquier GPU con soporte bfloat16 y al menos 8 GB de VRAM para uso cómodo; el entrenamiento se realizó sobre 2×RTX PRO 6000.
- Compatibilidad con GPU consumer: sí, cabe holgadamente en RTX 3060 12 GB, RTX 4070, RTX 4090 y similares, así como en GPUs de 8 GB con cuantización o contexto reducido.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada; para secuencias largas, activar `RETNET_FAST_CHUNKWISE=1`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Estado |
|---|---:|---|---|---|---|
| RetNet-0.5B-8k-gla-s (este) | 504,4 M + 229.240 | 8.192 | RetNet + GLA-S | MIT | Artefacto de investigación, falla criterio 8k |
| RetNet-0.5B-v21.3-chat | 504,4 M (aprox.) | No disponible | RetNet | MIT | Modelo de chat servido por el autor |
| Alternativas de 0,5B de propósito general | No disponible | No disponible | No disponible | No disponible | No disponible |

La información disponible solo permite comparar contra el checkpoint semilla de la misma colección; no se aportan datos de otros modelos de tamaño comparable.

## Limitaciones y advertencias

- El criterio de contexto efectivo a 8k no se supera: el autor indica explícitamente que no debe usarse como modelo de contexto largo ni de recuperación (retrieval).
- La mejora en pérdida de cola larga (3,243222 → 2,964826) no se traduce en mejor uso del contexto de 8k; la estimación puntual de la compuerta es negativa y no hay intervalo de confianza disponible bajo el test registrado.
- Que la compuerta de chat pase no convierte a este checkpoint en mejor modelo de chat que v21.3-chat.
- Aplica el límite de conocimiento y aritmética propio de la familia de 0,5B.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- Licencia MIT: permite uso comercial, pero el estado experimental y los resultados negativos desaconsejan su despliegue en producción.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, si bien son esperables en un modelo de este tamaño entrenado desde cero.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar `modeling_retnet.py`, `gla_kernel.py` y `objective_loss.py` antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ayaka157/RetNet-0.5B-8k-gla-s
- Modelo de chat recomendado (v21.3-chat): https://huggingface.co/Ayaka157/RetNet-0.5B-v21.3-chat
- Colección RetNet-0.5B: https://huggingface.co/collections/Ayaka157/retnet-05b-from-scratch-training-line-6afc5fe4007c9acacd1cb52f
- Repositorio con log de entrenamiento y figuras: https://github.com/Ayaka157/RetNet
