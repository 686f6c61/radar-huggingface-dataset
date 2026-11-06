# sanjaimurugan/py-alpha-01

## Resumen

py-alpha-01 (también referido como py-alpha-29m en su model card) es un modelo encoder-decoder de tipo transformer entrenado desde cero por el autor independiente sanjaimurugan sobre código Python. Con 29.521.920 parámetros, arquitectura de 4 bloques de encoder y 12 de decoder con cross-attention en cada capa, fue preentrenado con 600.001.082 tokens de Python deduplicado y descontaminado, y posteriormente afinado con 500.000 pares (petición, código) extraídos de docstrings. Todo el pipeline se ejecutó en un único Apple M4 Pro (MPS) a unos 30.000 tokens/segundo.

El modelo es relevante no por su rendimiento —que es deliberadamente modesto y el autor lo reporta sin adornos— sino como experimento reproducible de extremo a extremo: tokenizador BPE propio, corrupción de spans estilo T5, arnés de evaluación y análisis de intervenciones. La model card documenta con honestidad que el modelo genera Python sintácticamente válido pero casi nunca correcto: 0,0% de pass@1 en MBPP y 1,7% en HumanEval.

La conclusión técnica central del autor es que el cuello de botella no es el condicionamiento (dar la firma de la función no mejora el pass@1) ni la distribución (best-of-n nunca supera a greedy en ninguna temperatura), sino la composición de lógica. Es, por tanto, una pieza útil para estudiar límites de escala y metodología de evaluación más que para uso productivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder, pre-norm LayerNorm, SwiGLU, posiciones sinusoidales, MHA, output projection atada al embedding del decoder |
| Parámetros totales | 29.521.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | encoder 512 tokens; decoder 1024 tokens |
| Tipos de cuantización | no disponible (pesos en checkpoint PyTorch `.pt`, sin variantes GGUF/quantizadas publicadas) |
| Idiomas soportados | solo Python (código); no disponible para lenguaje natural |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch `.pt` (`stage1.pt`, `stage2aug.pt`) con `config.py` y `model.py` |

Detalles adicionales de arquitectura: `d_model` 320, `n_head` 10 (`head_dim` 32), `d_ffn` 832, vocabulario de 8.192 tokens BPE byte-level más 100 sentinelas. Tamaño del repositorio: 0,2 GB.

## Arquitectura y entrenamiento

El modelo sigue un diseño encoder-decoder clásico con pre-norm LayerNorm, activación SwiGLU, posiciones sinusoidales, atención multi-cabeza y proyección de salida atada al embedding del decoder (con embeddings de encoder y decoder separados). El encoder tiene 4 bloques y el decoder 12, con cross-attention en todas las capas del decoder. El vocabulario es un BPE byte-level propio de 8.192 tokens más 100 tokens centinela para la corrupción de spans.

El entrenamiento se dividió en dos etapas. La primera consistió en preentrenamiento con corrupción de spans estilo T5 sobre 600.001.082 tokens de Python deduplicado y descontaminado (16.000 pasos, batch 32, grad accum 2), con 5 horas de duración. La segunda etapa afinó el modelo sobre 500.000 pares (petición, código) minados de docstrings (1 hora y 20 minutos, batch 16, `dec_seq_len` 384). El autor señala que el 42% de los parámetros (embedding del encoder 2,62M, capas del encoder 4,83M y cross-attention 4,92M) existe para leer la petición, aunque las peticiones de la etapa 2 promedian 18 tokens; la división encoder-decoder se eligió para aprender cross-attention, no por eficiencia, y reconoce que un decoder-only habría asignado esos parámetros a la generación.

El pipeline incluye scripts con autotests: `corruption.py` verifica que el enmascaramiento es exactamente invertible, y `model.py` comprueba que la pérdida inicial se sitúa en `ln(vocab_size)`, que el decoder no ve tokens futuros y que el padding del encoder es invisible a la cross-attention.

## Capacidades

- Generación de código Python sintácticamente válido y con apariencia idiomática, a partir de una petición en lenguaje natural y opcionalmente una firma de función.
- Denoising de spans (etapa 1): reconstrucción de fragmentos enmascarados en código Python.
- Condicionamiento por firma: acepta el nombre de la función y la lista de parámetros como entrada adicional.
- Generación greedy y muestreo con temperatura (aunque el muestreo degrada severamente la tasa de parseo).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso como agente.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Multilingüismo: únicamente Python como lenguaje de código; no se reporta soporte de lenguaje natural más allá de peticiones cortas en inglés derivadas de docstrings.

## Casos de uso

- Estudio de límites de escala en modelos de código: el modelo sirve como punto de referencia controlado (29,5M de parámetros, 600M de tokens) para investigar qué capacidades emergen y cuáles no en modelos pequeños. Su pipeline reproducible y sus autotests lo hacen adecuado para experimentos académicos.
- Reproducción de pipelines encoder-decoder desde cero: los scripts `prepare.py`, `corruption.py`, `train.py` y `eval.py` permiten replicar tokenización BPE, corrupción de spans, minado de pares y evaluación sandboxed en hardware de consumo.
- Docencia sobre evaluación de código: la comparación entre tasa de parseo (90-97%) y pass@1 (0%) es un caso didáctico concreto sobre por qué la validez sintáctica no implica corrección lógica.
- Investigación sobre estrategias de decodificación: el hallazgo de que best-of-n nunca supera a greedy y que la tasa de parseo cae del 88% al 2% al subir la temperatura de 0 a 0,8 es un resultado empírico reutilizable en estudios de calibración.
- Análisis de calidad de datos: la auditoría de 40.000 pares (86,6% con referencias no importadas) y el experimento controlado sobre su impacto (3,3% de referencias indefinidas en MBPP) sirven como caso de estudio sobre sesgos de minado por docstrings.
- Generación de esqueletos de funciones para revisión humana: dado que produce firmas y cuerpos con estructura plausible y alta tasa de parseo, podría usarse como borrador inicial en un flujo con revisión obligatoria, nunca en producción automática.
- Prototipado de arneses de evaluación: `eval.py` con ejecución sandboxed y best-of-n es reutilizable para otros modelos de código pequeños.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card:

| Etapa | Val loss | Perplexity | Token accuracy |
|---|---|---|---|
| Etapa 1 — span corruption | 1,2153 | 3,31 | 74,6% exact, 89,0% top-5 |
| Etapa 2 — request → code | 1,8659 | 6,5 | no disponible |

| Benchmark | pass@1 | Tasa de parseo |
|---|---|---|
| MBPP (100) | 0,0% | 90,0% |
| MBPP (100), firma dada | 0,0% | 97,0% |
| HumanEval (60) | 1,7% | 88,3% |

El único acierto en HumanEval es `strlen` (`return len(string)`). El autor compara con Qwen2.5-Coder-0.5B, que obtiene 28,0 en HumanEval y 52,9 en MBPP con 16,7 veces más parámetros y 9.167 veces más tokens de entrenamiento.

Intervenciones evaluadas:

| Intervención | Efecto en formato | Efecto en pass@1 |
|---|---|---|
| Filtrar pares por longitud, eliminar funciones de test | parseo 83% → 90% | ninguno |
| Dar la firma de la función | parseo 90% → 97% | ninguno |
| Prompts más ricos (HumanEval vs MBPP) | — | 0 → 1/60 |
| Best-of-10, temperaturas 0,2–0,8 | degrada bruscamente | ninguno |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (29,5M de parámetros ≈ 118 MB de pesos), más overhead de activaciones y contexto; cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en un Apple M4 Pro vía MPS. Una RTX 4090, A100 o H100 están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier tarjeta moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: al ser una arquitectura personalizada, `AutoModel` de Hugging Face no lo carga. Es necesario usar `model.py` y `config.py` del repositorio junto con el checkpoint `.pt`. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor reporta ~30.000 tokens/segundo durante el entrenamiento en M4 Pro (MPS); no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | MBPP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| py-alpha-01 | 29,5M | 512 enc / 1024 dec | 1,7% (60) | 0,0% (100) | no disponible | HF, checkpoint `.pt` con código |
| Qwen2.5-Coder-0.5B | ~494M | no disponible en la información | 28,0 | 52,9 | no disponible en la información | HF |
| Alternativas de <100M para código | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con Qwen2.5-Coder-0.5B es la única que aporta el autor, y la diferencia de escala (16,7× parámetros, 9.167× tokens) hace que no sea una comparación de igual a igual. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es útil para escribir código: produce Python con apariencia plausible pero lógica incorrecta; 0,0% de pass@1 en MBPP y 1,7% en HumanEval.
- El condicionamiento no es el cuello de botella: incluso con firma de función dada, el pass@1 se mantiene en 0%.
- El muestreo no ayuda: best-of-n nunca supera a greedy en ninguna temperatura, y la tasa de parseo cae del 88% al 2% al subir la temperatura de 0 a 0,8. La masa de probabilidad tras el argmax es ruido.
- Solo entrenado en Python; no soporta otros lenguajes de programación ni lenguaje natural general.
- Sesgo de registro en los datos: los pares minados de docstrings son "plumbing" de librería (`cpython_tags()`, `_IsTestMethod()`); el corpus no contiene código estilo tutorial y ningún filtrado lo genera.
- El 86,6% de los pares de entrenamiento referencia nombres nunca importados ni definidos (`os`, `np`, `re`, globales de proyecto); en MBPP el modelo emite referencias indefinidas solo el 3,3% de las veces, pero el sesgo está presente.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse antes de cualquier despliegue.
- Arquitectura personalizada: no carga con `AutoModel`, requiere el código del repositorio; sin soporte en frameworks de serving estándar.
- Benchmarks parciales: MBPP evaluado sobre 100 de 500 problemas y HumanEval sobre 60 de 164, lo que limita la significación estadística de las cifras.
- Riesgo de alucinación lógica: genera cuerpos de función sin relación con la tarea solicitada, lo que en un contexto de producción podría inducir a error si se confía en la validez sintáctica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanjaimurugan/py-alpha-01
