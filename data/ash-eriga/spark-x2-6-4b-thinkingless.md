# Ash-Eriga/Spark-X2.6-4B-Thinkingless

## Resumen

Spark-X2.6-4B-Thinkingless es una variante editada del modelo Spark-X2.6-4B (XHToken), un modelo de lenguaje de 4.112 millones de parámetros orientado a generación de texto y razonamiento. La edición, publicada por Ash-Eriga, aplica una modificación de pesos de rango 1 sin entrenamiento (weight editing) para reducir el número de tokens de razonamiento que el modelo genera antes de comprometerse con una conclusión, sin degradar de forma medible la precisión en los benchmarks evaluados. El autor reporta una reducción del 43% en tokens de razonamiento en GSM8K y del 13% en GPQA-Diamond en el nivel de esfuerzo `high`, con variaciones de precisión cuyos intervalos de confianza al 95% incluyen cero.

La relevancia del modelo es metodológica: demuestra que una intervención quirúrgica sobre los pesos (sin gradient training, sin adaptadores LoRA, sin hooks de inferencia) puede alterar el comportamiento de razonamiento de un modelo conservando arquitectura, tokenizador y layout del checkpoint. El modelo base mantiene una arquitectura de transformer con modo de pensamiento explícito delimitado por `` y un parámetro `reasoning_effort` (`high`/`low`). La edición se aplica sobre `mlp.down_proj.weight` en 7 capas concretas.

La licencia es Apache 2.0, los pesos se distribuyen en safetensors con código personalizado (`trust_remote_code=True`), y el modelo solo declara soporte para inglés. Es un modelo de nicho, con cero descargas y cero likes en el momento de la ficha, y con una advertencia importante: la reducción de tokens no sobrevive a cuantización de 4 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Spark-X2.6-4B); edición de pesos de rango 1 sobre `mlp.down_proj.weight` en 7 capas |
| Parámetros totales | 4.112.079.360 |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (las evaluaciones usaron un tope de 16.384 tokens) |
| Tipos de cuantización | bf16 y fp16 recomendados; se probó IQ4_XS en llama.cpp pero degrada el ahorro de tokens |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-4B es un transformer de 4.112 millones de parámetros con un modo de razonamiento explícito: el modelo genera tokens de pensamiento antes de cerrar el bloque con `` y emitir la respuesta. El autor expone un parámetro `reasoning_effort` con valores `high` y `low`, y un flag `enable_thinking`. No se detalla en la información disponible la composición del dataset de entrenamiento del modelo base, el número de tokens vistos ni si hubo fases de RLHF o DPO.

La innovación de esta variante es la edición de pesos sin entrenamiento. Se deriva una dirección de "compromiso con la conclusión" (`cc`) a partir de 140 trazas correctas: para cada traza se calcula la media del residual sobre los últimos 48 tokens antes de `` menos la media sobre el resto de la traza, y se promedian las direcciones. La actualización se aplica como `W_l <- bf16(W_l + alpha * n_l * d_l u_l^T / ||u_l||^2)`, donde `d_l` es la dirección `cc` unitaria, `u_l` es la media de la entrada de `down_proj` sobre los tokens de pensamiento, y `n_l` es la norma media de la salida de `down_proj`. Se aplica con `alpha = 0.075` en 7 capas (18, 20, 21, 22, 25, 26, 28), cambiando aproximadamente entre el 0,24% y el 0,3% de la norma de esa matriz. Un control ortogonal con la misma norma, capas y alpha deja la longitud de razonamiento dentro del ruido, lo que respalda que el efecto lo produce la dirección y no la magnitud del cambio.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso con modo de pensamiento explícito delimitado por ``.
- Razonamiento matemático: evaluado en GSM8K con precisión del 93,6% en `high` effort tras la edición.
- Razonamiento científico de nivel avanzado: evaluado en GPQA-Diamond con precisión del 58,1% en `high` effort tras la edición.
- Control del esfuerzo de razonamiento mediante `reasoning_effort` (`high`/`low`), que ajusta la longitud del bloque de pensamiento.
- Reducción de tokens de razonamiento respecto al modelo base en el mismo nivel de esfuerzo.
- No se han publicado capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo en la información disponible; el modelo declara únicamente inglés.

## Casos de uso

- Razonamiento matemático con coste controlado: el modelo resuelve problemas tipo GSM8K con una precisión del 93,6% gastando un 43% menos de tokens de razonamiento que el base en `high` effort, lo que abarata la inferencia en pipelines de resolución de problemas aritméticos donde no se puede modificar el prompt de esfuerzo.
- Razonamiento científico en entornos con presupuesto de tokens: para preguntas de nivel GPQA-Diamond, la edición reduce un 13% los tokens de pensamiento con una precisión estadísticamente indistinguible del base, adecuado para sistemas de apoyo a la investigación que pagan por token generado.
- Evaluación de métodos de edición de pesos: sirve como caso de estudio reproducible para investigadores que quieran validar la técnica de edición de rango 1 sobre un modelo de 4B y comparar contra el control ortogonal.
- Despliegue en fp16/bf16 con vLLM: el autor valida el modelo con vLLM 0.32.0 en fp16, por lo que encaja en servicios de inferencia que ya usan ese stack y no pueden permitirse adaptadores ni hooks adicionales.
- Sustitución directa del modelo base: al conservar arquitectura, tokenizador y layout del checkpoint, se puede intercambiar por Spark-X2.6-4B en una aplicación existente cambiando solo el repositorio, sin tocar el código de integración.
- Investigación sobre "thinking budget": útil para estudiar la relación entre longitud de razonamiento y precisión en modelos con modo de pensamiento, ya que el autor publica intervalos de confianza bootstrap y comparaciones pareadas por pregunta.
- Base para experimentos de cuantización robusta: dado que el ahorro no sobrevive a IQ4_XS, el modelo sirve como punto de partida para desarrollar versiones de la edición tolerantes a cuantización.

## Benchmarks y rendimiento

Resultados publicados por el autor (fp16, vLLM 0.32.0, 1 semilla = 1234, T=1.0, top_p=0.95, tope de 16.384 tokens):

| Benchmark | Arm | Precisión (IC 95%) | Tokens de razonamiento, media (IC 95%) | Sin `` |
|---|---|---|---|---|
| GSM8K (1.319) | Base, high effort | 92,9% [91,5; 94,2] | 724 [613; 842] | 0,8% |
| GSM8K | Base, low effort | 93,4% [92,0; 94,7] | 331 [292; 375] | 0,0% |
| GSM8K | Edit B, high effort | 93,6% [92,3; 94,9] | 411 [359; 470] | 0,1% |
| GPQA-Diamond (198) | Base, high effort | 57,1% [50,0; 64,1] | 7.997 [7.071; 8.945] | 30,8% |
| GPQA-Diamond | Base, low effort | 61,1% [54,0; 67,7] | 6.196 [5.352; 7.046] | 18,2% |
| GPQA-Diamond | Edit B, high effort | 58,1% [51,0; 64,7] | 6.943 [6.029; 7.866] | 26,8% |

Comparaciones pareadas:

| Benchmark | Comparación | Δ precisión, pp (IC) | Δ tokens de razonamiento (IC) | Mejor / peor |
|---|---|---|---|---|
| GSM8K | Edit B vs base, high | +0,7 [−0,5; +2,0] | −43,3% [−50,4; −35,2] | 41 / 32 |
| GSM8K | Base low vs base high | +0,5 [−0,7; +1,6] | −54,2% [−60,4; −46,5] | 33 / 27 |
| GSM8K | Edit B (high) vs base low | +0,2 [−1,0; +1,4] | +24,0% [+8,0; +42,0] | 35 / 32 |
| GPQA-Diamond | Edit B vs base, high | +1,0 [−5,6; +7,6] | −13,2% [−20,9; −5,0] | 23 / 21 |
| GPQA-Diamond | Base low vs base high | +4,0 [−3,0; +11,1] | −22,5% [−29,8; −15,0] | 31 / 23 |
| GPQA-Diamond | Edit B (high) vs base low | −3,0 [−9,6; +3,5] | +12,1% [+1,5; +24,2] | 20 / 26 |

En cuantización IQ4_XS (llama.cpp, imatrix v6, `low` effort, semilla 1234), los tokens de razonamiento suben un 18% en MATH-500 y un 26% en MMLU-Pro respecto a bf16, con precisión dentro del ruido (91,3 vs 92,0 y 63,5 vs 67,0).

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, los 4.112 millones de parámetros ocupan aproximadamente 8,2 GB solo en pesos; con caché KV y overhead de runtime, se recomienda un mínimo de 10-12 GB de VRAM para contextos cortos y bastante más para contextos cercanos a 16.384 tokens.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con vLLM en fp16/bf16; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso local en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB) en bf16/fp16 con contextos moderados. En GPUs de 8-12 GB habría que recurrir a cuantización, pero el autor advierte que el ahorro de tokens no sobrevive a IQ4_XS.
- Opciones de despliegue: transformers con `trust_remote_code=True`; vLLM 0.32.0 validado por el autor en fp16; llama.cpp probado solo en IQ4_XS con degradación del efecto. No se mencionan TGI, Ollama ni SGLang en la información disponible.
- Latencia y throughput: no disponibles. El autor no publica métricas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-4B-Thinkingless | 4,11B | No disponible | Apache 2.0 | Edición de pesos; reduce tokens de razonamiento un 43% en GSM8K a `high` |
| XHToken/Spark-X2.6-4B (base) | 4,11B | No disponible | No disponible en la información | Modelo original; misma precisión con más tokens de razonamiento a `high` |
| Qwen3.8-27B (referencia metodológica) | 27B (según el nombre) | No disponible | No disponible en la información | Modelo al que Concept Country aplicó originalmente la edición de pesos; no es comparable en tamaño |

No se dispone de datos de benchmarks de modelos de terceros de la misma categoría en la información proporcionada, por lo que no se puede establecer una comparativa de rendimiento frente a alternativas de 4B.

## Limitaciones y advertencias

- El ahorro de tokens es menor que el que se obtiene simplemente bajando `reasoning_effort` a `low`: contra base `high`, `low` recorta un 54% en GSM8K y un 22,5% en GPQA-Diamond, frente al 43% y 13% de la edición. Thinkingless `high` gasta un 24% más de tokens en GSM8K y un 12% más en GPQA-Diamond que base `low`. La edición solo tiene sentido cuando no se puede cambiar el prompt de esfuerzo.
- Los intervalos de confianza de GPQA-Diamond son anchos (±7 puntos con 198 preguntas), así que "sin cambio medible de precisión" significa que el intervalo incluye cero, no que el cambio real sea nulo. Contra base `low`, Thinkingless puntúa 3,0 puntos por debajo (IC [−9,6; +3,5]).
- Solo se usó una semilla por brazo en GSM8K y GPQA-Diamond; la precisión del base deriva unos 2 puntos entre ejecuciones previas, por lo que diferencias menores son ruido.
- El ahorro no sobrevive a cuantización de 4 bits: en IQ4_XS los tokens de razonamiento suben un 18% en MATH-500 y un 26% en MMLU-Pro respecto a bf16. Usar bf16 o fp16.
- No se evaluaron instruction following, código, uso de herramientas, contexto largo ni topes por encima de 16.384 tokens.
- Riesgo de alucinación: no cuantificado en la información disponible; es un modelo de razonamiento con modo de pensamiento y no se reportan tasas de alucinación.
- Sesgos: no se documentan sesgos conocidos en la model card.
- Idioma: solo inglés declarado; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base podría tener condiciones adicionales no detalladas en esta información; conviene verificar la licencia de XHToken/Spark-X2.6-4B antes de producción.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; revisar antes de desplegar.
- Modelo con cero descargas y cero likes en el momento de la ficha: sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Ash-Eriga/Spark-X2.6-4B-Thinkingless
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Metodología original (Concept Country, edición de pesos para Qwen3.8-27B): https://concept.country/research/weight-space-programming
