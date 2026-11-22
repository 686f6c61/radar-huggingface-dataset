# eyes-ml/Ripple-65B-Base-Preview_jacobian_lens

## Resumen

Ripple-65B-Base-Preview_jacobian_lens no es un modelo generativo al uso, sino un artefacto de interpretabilidad mecánica: una "lente jacobiana" ajustada sobre el modelo base `ricursiveAI/Ripple-65B-Base-Preview`, un transformer denso de 65.000 millones de parámetros con 80 bloques y un flujo residual de dimensión 5120. La lente consiste en una matriz de 5120 × 5120 por capa que transporta el estado residual tras el bloque ℓ hasta el estado residual tras el último bloque (capa 79), de modo que un estado intermedio pueda leerse como distribución de tokens a través del `lm_head`. El autor es el usuario `eyes-ml`, y el artefacto se publica bajo licencia Apache 2.0.

El problema que resuelve es la opacidad de las representaciones internas de un modelo grande: con la lente se puede inspeccionar qué "piensa" el modelo en capas intermedias sin necesidad de entrenar sondas específicas por tarea. La innovación práctica es el modo de lectura anclado (*anchored*): en lugar de aplicar la matriz al estado bruto, se aplica a la desviación del estado respecto a la media de su capa y se aterriza sobre la media de la capa de salida, lo que mejora sustancialmente la coincidencia con el token predicho por el modelo en las capas 48 a 64.

Es relevante ahora porque acompaña a un modelo base de 65B poco documentado y porque publica una metodología reproducible (digests, hashes de prompts, ruido por capa, journals de convergencia) que permite auditar el ajuste. No obstante, sus garantías son limitadas: solo es fiable en la mitad superior de la red y depende fuertemente del registro lingüístico de las medias de anclaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente jacobiana lineal por capa (matriz 5120 × 5120) sobre un transformer denso de 80 bloques (modelo base Ripple-65B-Base-Preview) |
| Parametros totales | No disponible para el modelo base; la lente contiene 79 matrices float32 de 5120 × 5120 (aprox. 8,3 GB en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (la lente se distribuye en float32; el modelo base se usa en bfloat16 en los ejemplos) |
| Idiomas soportados | Medias de anclaje para inglés (prosa), chino (prosa) y Python; el modelo base es de solo preentrenamiento |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch, float32) para la lente y las medias; `.json` / `.jsonl` / `.csv` para metadatos y journals |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso con 80 bloques y un flujo residual de anchura 5120; la lente se ajusta para cada capa ℓ = 0…78 con destino en la capa 79. Cada matriz `J[layer]` es una aproximación lineal del jacobiano que lleva el estado residual tras el bloque ℓ al estado residual tras el bloque final, estimada sobre texto enciclopédico en inglés en la tokenización de wikitext-103 (espacios alrededor de la puntuación, `@-@` para guiones) y con `<|endoftext|>` como prefijo. El artefacto incluye además `anchor_means.pt` con la media de salida de cada bloque para tres registros (prosa inglesa, prosa china y Python), el manifiesto de procedencia con digests de modelo, tokenizador y código, hashes de cada prompt, ruido por capa, y journals por prompt (`layers.jsonl`, `convergence.csv`, `timings.jsonl`).

No se documenta en la información disponible el proceso de preentrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO). La innovación técnica destacable es el esquema de lectura anclado: se transporta `(h - μ_layer) @ J[layer].T` y se suma `μ_79`, es decir, se preserva la desviación respecto a la media de la capa y se ancla en la media de la salida. El autor señala que la media supone entre el 41 % y el 68 % de la longitud del residual en esta estirpe de modelos, lo que explica por qué el anclaje importa. El ajuste reporta ruido de partición mitad-mitad de 0,74 de la matriz en la capa 0, 0,47 en la 10, 0,32 en la 20, 0,11 en la 30, 0,037 en la 40, 0,024 en la 48, 0,019 en la 56, 0,014 en la 64, 0,008 en la 72 y 0,003 en la 78.

## Capacidades

- Lectura de estados intermedios como tokens: convierte la activación del flujo residual tras un bloque en una distribución sobre el vocabulario mediante `lm_head` y `model.norm`.
- Lectura anclada por registro: permite usar medias de inglés, chino o Python según el texto analizado, con degradación drástica si se usa un registro inadecuado.
- Inspección capa a capa: cubre las capas 0 a 78 con una matriz por capa y destino fijo en la 79.
- Extracción de estados por hook: el autor documenta el uso de `register_forward_hook` sobre `model.model.layers[layer]`, advirtiendo de que `output_hidden_states` no sirve porque su última entrada está tras la normalización final.
- Reproducibilidad y auditoría: manifiesto con digests de modelo, tokenizador y código, hashes de prompts, ruido por capa y journals de convergencia y tiempos.
- No es un modelo de chat ni un generador: no incorpora tool calling, agentes, visión, audio ni modo de razonamiento. El propio autor indica que no hay medias para transcripciones de chat y que el modelo base es de solo preentrenamiento.

## Casos de uso

- Auditoría de representaciones en investigación de interpretabilidad: aplicar la lente a las capas 48 a 78 para comprobar en qué punto emerge un concepto (por ejemplo, una entidad nombrada) antes de que el modelo lo emita, usando el hook documentado y las medias del registro correspondiente.
- Detección temprana de sesgos léxicos: leer la distribución de tokens en capas intermedias sobre corpus controlados para identificar cuándo el modelo "inclina" la predicción hacia determinados términos antes de la capa final.
- Depuración de fallos en generación: dado un prompt donde el modelo base produce una continuación incorrecta, inspeccionar la evolución de la lectura anclada capa a capa para localizar en qué profundidad se desvía la representación.
- Validación de implementaciones de serving: el autor midió las tasas de coincidencia a través de una implementación bf16 en sglang, de modo que la lente sirve para comparar si una implementación (vLLM, TGI, sglang) reproduce el mismo estado residual que la referencia en Hugging Face.
- Análisis multilingüe comparado: usar las medias de prosa china frente a las inglesas para cuantificar la degradación de la legibilidad interna en un idioma no inglés (el autor reporta 0,00 / 0,00 / 0,03 / 0,32 con medias inglesas frente a 0,10 / 0,18 / 0,27 / 0,49 con medias chinas en las capas 48/56/64/72).
- Estudio de código: con las medias de Python, inspeccionar cómo representa el modelo fragmentos de código en capas medias, útil para analizar modelos de código derivados de la misma estirpe.
- Docencia y divulgación: demostrar el funcionamiento del *logit lens* y sus límites con un caso real y reproducible, incluida la comparación entre lectura bruta y anclada.

## Benchmarks y rendimiento

Los datos publicados miden la proporción de posiciones en las que el token superior de la lectura coincide con el token superior del propio modelo, sobre texto enciclopédico inglés retenido (64 fragmentos de hasta 128 tokens, posiciones desde la 16, 6.999 posiciones, `<|endoftext|>` al inicio):

| Capa | 40 | 48 | 56 | 64 | 72 | 78 |
|---|---|---|---|---|---|---|
| Logit lens | 0,07 | 0,12 | 0,16 | 0,26 | 0,46 | 0,80 |
| Lente sobre estado bruto | 0,10 | 0,14 | 0,15 | 0,24 | 0,41 | 0,73 |
| Lente anclada (medias inglesas) | 0,17 | 0,28 | 0,36 | 0,44 | 0,59 | 0,86 |

Otros registros (capas 48 / 56 / 64 / 72):

| Registro | Anclaje | 48 | 56 | 64 | 72 |
|---|---|---|---|---|---|
| Prosa china (7.168 posiciones) | Medias chinas | 0,10 | 0,18 | 0,27 | 0,49 |
| Prosa china | Medias inglesas | 0,00 | 0,00 | 0,03 | 0,32 |
| Prosa china | Logit lens | 0,05 | 0,06 | 0,12 | 0,42 |
| Python (4.427 posiciones) | Medias Python | 0,17 | 0,30 | 0,44 | 0,60 |
| Python | Medias inglesas | 0,10 | 0,21 | 0,37 | 0,57 |
| Python | Logit lens | 0,16 | 0,21 | 0,37 | 0,55 |

En la capa 78 el logit lens iguala a la lente anclada en Python (0,92 frente a 0,91). Las mediciones se realizaron el 2026-11-22 sobre una implementación bf16 en sglang; un forward en bf16 se aleja entre un 1 % y un 2 % del cálculo en float32 en el flujo residual, y el token superior difiere del de float32 en un 0 % a un 4 % de las posiciones en estas capas. No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- La lente en sí ocupa aproximadamente 8,3 GB en float32 (79 matrices de 5120 × 5120), más las medias de anclaje (3 registros × 80 × 5120 en float32).
- Para usarla hay que cargar además el modelo base Ripple-65B-Base-Preview en bfloat16: a 65.000 millones de parámetros, son del orden de 130 GB de pesos, lo que exige múltiples GPU o memoria unificada; no cabe en una GPU de consumo.
- GPU recomendadas para el modelo base: configuraciones multi-GPU tipo A100 80 GB, H100 80 GB o superiores; una sola RTX 4090 (24 GB) no es viable para el modelo completo en bf16.
- La lente puede aplicarse en una GPU de consumo una vez extraídos los estados, ya que cada matriz es de 5120 × 5120 en float32 (unos 105 MB por capa) y solo se necesita la capa que se esté inspeccionando.
- Despliegue del modelo base: el ejemplo del autor usa `transformers` con `trust_remote_code=True` y `device_map="cuda"`; las mediciones de referencia se hicieron con sglang. No se documentan opciones GGUF, llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponibles. Los journals de tiempos del ajuste (`…_timings.jsonl`) contienen datos de la fase de ajuste, no de inferencia.

## Comparativa con modelos similares

| Herramienta | Tipo | Coste de ajuste | Cobertura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Base-Preview_jacobian_lens | Lente jacobiana lineal por capa, con anclaje por registro | Ajuste supervisado sobre wikitext-103; matrices de 5120 × 5120 por capa | Capas 48 a 78 fiables; por debajo de 40 no debe leerse | Apache 2.0 | Hugging Face, 0 descargas |
| Logit lens clásico | Proyección directa del estado con `lm_head` y `norm` | Ninguno | Todas las capas, pero con baja coincidencia en capas medias (0,12 en la 48) | Depende de la implementación | Ampliamente implementado en librerías de interpretabilidad |
| Sondas lineales supervisadas por tarea | Clasificador lineal entrenado por concepto | Requiere etiquetas por concepto | Específico de la tarea y el concepto | Depende del usuario | No disponible como artefacto empaquetado |
| Tuned lens (afín por capa) | Transformación afín entrenada por capa | Entrenamiento por capa con corpus | Habitualmente todas las capas | Depende de la implementación | No disponible en la información proporcionada para esta estirpe de modelos |

No se dispone de datos comparativos publicados frente a lentes ajustadas sobre otros modelos de 65B en la información proporcionada.

## Limitaciones y advertencias

- Solo es fiable en la mitad superior de la red: el autor indica explícitamente que por debajo de la capa 40 no debe leerse nada, y el ruido de partición mitad-mitad alcanza 0,74 de la matriz en la capa 0.
- El anclaje es imprescindible: sobre el estado bruto la lente no supera al logit lens (0,14 frente a 0,12 en la capa 48) y sin anclaje el resultado es prácticamente inútil.
- El registro de las medias debe coincidir con el texto: usar medias inglesas sobre prosa china da 0,00 en las capas 48 y 56, muy por debajo del logit lens (0,05 y 0,06). No hay medias para transcripciones de chat.
- Debilidad en tokens raros: en nombres y terminaciones de palabra, el logit lens simple leyó mejor el checkpoint base que la lente anclada en las capas 40 a 72.
- La coincidencia en el token superior no informa sobre el resto de la distribución, por lo que no debe interpretarse como calibración.
- Dependencia de la implementación: el forward en bf16 se aleja un 1-2 % de float32 en el flujo residual y el token superior cambia en un 0-4 % de las posiciones; en capas bajas el jacobiano por prompt depende de la implementación (compilada o no).
- El tokenizador debe cargarse desde `tokenizer.json` con `PreTrainedTokenizerFast` y no con `AutoTokenizer`, y no añade BOS: la lente y las medias se ajustaron detrás de `<|endoftext|>`.
- El modelo base es de solo preentrenamiento, sin alineación; no debe usarse como asistente conversacional.
- No se documentan sesgos del modelo base ni evaluación de alucinación en la información disponible.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base subyacente puede tener condiciones propias no detalladas aquí.
- Artefacto con 0 descargas y 0 likes: no hay validación independiente de las tasas reportadas.

## Enlaces

- Hugging Face: https://huggingface.co/eyes-ml/Ripple-65B-Base-Preview_jacobian_lens
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Corpus de ajuste (wikitext-103): no disponible como enlace en la información proporcionada
- Paper o blog del método: no disponible
- Repositorio de código del ajuste: no disponible (el manifiesto incluye digests de código, pero no URL)
