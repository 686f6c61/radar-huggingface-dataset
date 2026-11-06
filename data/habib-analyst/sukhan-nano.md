# habib-analyst/sukhan-nano

## Resumen

Sukhan-Nano es un modelo de lenguaje de tipo decoder-only Transformer desarrollado por el usuario habib-analyst y publicado en Hugging Face bajo licencia MIT. Con tan solo 5,57 millones de parámetros, se trata de un artefacto educativo y de demostración que ilustra un proceso de entrenamiento completo y reproducible desde cero para un idioma de bajos recursos como el urdu: tokenizador propio, código de arquitectura y pesos entrenados íntegramente por el autor. No pretende competir con ningún modelo de lenguaje en producción para urdu.

El modelo emplea una arquitectura GPT estándar con 6 capas, dimensión de modelo 256, embeddings atados y una longitud de contexto de 256 tokens. El tokenizador es un BPE a nivel de carácter con vocabulario de 3.000 unidades, implementado también desde cero en el repositorio. El entrenamiento se realizó exclusivamente en CPU sobre un corpus de 3.977.932 caracteres (2.090.702 tokens) extraído de Wikipedia en urdu y Wikisource en urdu, con licencias documentadas (CC BY-SA y dominio público).

Su relevancia actual es metodológica más que funcional: demuestra de forma transparente y auditable todo el pipeline de entrenamiento de un modelo de lenguaje para un idioma de bajos recursos, incluyendo la card del corpus, el log de entrenamiento, la evaluación sobre datos no vistos y muestras de generación literales que incluyen los fallos del modelo. La perplejidad en validación es de 48,48 sobre 207.943 tokens nunca entrenados, lo que indica que ha aprendido ortografía y vocabulario reales del urdu, pero no que genere prosa fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT estándar, pre-norm, 6 capas, d_model 256, embeddings atados) |
| Parametros totales | 5.572.608 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | urdu (ur) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un GPT deliberadamente convencional: bloques Transformer con pre-norm, embeddings posicionales aprendidos, MLP con activación GELU, self-attention causal implementada mediante `scaled_dot_product_attention`, LayerNorm final y una cabeza de modelado de lenguaje atada a los embeddings de tokens. El contexto es de 256 tokens. El autor declara explícitamente que la novedad no reside en la arquitectura, sino en la transparencia del pipeline completo.

El corpus procede únicamente de dos fuentes de Wikimedia descargadas el 28 de octubre de 2026: Wikipedia en urdu (CC BY-SA 4.0, 2.600 artículos en el pool limpio) y Wikisource en urdu (texto del sitio CC BY-SA 4.0, obras subyacentes en dominio público, 10.859 artículos). El pool limpio de 13.459 artículos y 38,3 millones de caracteres se submuestreó por artículos completos mediante un shuffle con semilla hasta los topes empaquetados de 4,0 millones de caracteres de entrenamiento y 0,4 millones de validación; el split es a nivel de artículo, de modo que el texto de validación nunca se usó en entrenamiento. El entrenamiento se ejecutó en PyTorch sobre CPU (2 núcleos), con batch de 16 × 256 tokens, AdamW (β 0,9/0,95, weight decay 0,1), schedule coseno con 50 pasos de warmup, clipping de gradiente 1,0 y semilla fija 20261028. Fueron 700 pasos (unas 1,4 épocas, aproximadamente 2,9 millones de tokens vistos), con un tiempo total de unas 80 minutos de reloj en una VM compartida y con contención (37 minutos para los pasos 0-500 y 42 minutos para los pasos 500-700). No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva en urdu a nivel de carácter/token BPE, limitada a continuaciones cortas.
- Aprendizaje de ortografía, vocabulario y fragmentos de sintaxis local del urdu, según la perplejidad de validación de 48,48.
- Tokenizador BPE propio con vocabulario de 3.000 unidades y una ratio de 1,90 caracteres por token sobre el corpus.
- Evaluación de perplejidad integrada (`lm.perplexity(...)`) sobre texto en urdu.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso.
- No dispone de capacidades multilingües: solo urdu.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- No dispone de capacidades de código ni de matemáticas.

## Casos de uso

- Docencia y formación en NLP: el modelo sirve como ejemplo completo y reproducible de entrenamiento desde cero de un LM para un idioma de bajos recursos, con corpus, tokenizador, log de entrenamiento y evaluación incluidos, adecuado para asignaturas de aprendizaje profundo y procesamiento de lenguaje natural.
- Estudio de tokenizadores de bajos recursos: el BPE a nivel de carácter con vocabulario 3.000 y ratio de 1,90 caracteres/token permite analizar empíricamente el compromiso entre tamaño de vocabulario y cobertura en urdu, comparándolo con tokenizadores multilingües de mayor vocabulario.
- Reproducción de experimentos: el script `scripts/train.py` y la semilla fija 20261028 permiten replicar el entrenamiento en CPU en torno a 80 minutos, útil para verificar resultados y para prácticas de reproducibilidad.
- Evaluación de perplejidad sobre corpus urdu: la función `lm.perplexity(...)` permite medir la adecuación de un modelo pequeño a dominios concretos (por ejemplo, prosa clásica frente a prosa moderna) como línea base de referencia.
- Demostración de sesgos de corpus: al estar sesgado hacia Wikisource y poesía clásica, el modelo sirve para ilustrar en clase cómo la composición del corpus condiciona el estilo y el vocabulario generado.
- Pruebas de integración de pipelines de inferencia: al ser un modelo de 5,57 M de parámetros y 0,0 GB de repositorio, se puede cargar y ejecutar en cualquier entorno de CI o portátil para validar código de carga de safetensors, tokenización y generación sin coste de GPU.
- Prototipado de interfaces de demostración: el CLI `examples/predict_demo.py` permite montar demos interactivas mínimas para mostrar generación de texto en urdu con propósitos divulgativos.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Perplejidad en validación | 48,48 | Sobre 394.756 caracteres / 207.943 tokens nunca entrenados, split a nivel de artículo |
| Perplejidad de referencia (azar) | 3.000 | Adivinación aleatoria sobre vocabulario de 3.000 tokens |
| Caracteres por token | 1,90 | Tokenizador BPE propio sobre el corpus |
| Tokens vistos en entrenamiento | ~2,9 M | 700 pasos × 4.096 tokens, ~1,4 épocas |
| Tiempo de entrenamiento | ~80 min | CPU de 2 núcleos en VM compartida (cota superior) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 (5,57 M de parámetros), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; el modelo se entrenó y evaluó en CPU. Cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en Raspberry Pi o entornos embebidos con suficiente RAM.
- Opciones de despliegue: PyTorch nativo mediante el módulo `sukhan_nano.infer.SukhanNano` incluido en el repositorio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma medida; el entrenamiento completo en CPU de 2 núcleos tomó unos 80 minutos para 700 pasos, lo que da una idea del orden de magnitud, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Sukhan-Nano | 5,57 M | 256 | urdu | MIT | Educativo, desde cero, corpus documentado |
| Modelos Urdu LM de produccion | no disponible | no disponible | urdu | no disponible | No se dispone de datos comparables en la informacion proporcionada |
| Tiny LM educativos genericos | no disponible | no disponible | varios | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de información sobre modelos comparables de la misma categoría (LMs educativos para urdu de tamaño similar) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo es muy pequeño y se entrenó brevemente: unos 2,9 millones de tokens vistos, aproximadamente 1,4 épocas. La salida es texto con sabor a urdu, con palabras reales y fragmentos de sintaxis, pero deriva, repite e inventa palabras, como muestran las muestras literales de la model card.
- El corpus está sesgado hacia lo clásico: Wikisource domina el recuento de artículos, por lo que el urdu del modelo es literario, poético y anticuado; el urdu moderno informal, el roman urdu y el urdu con code-mixing están prácticamente ausentes.
- Sesgo poético en la generación: la distribución de entrenamiento favorece registros clásicos, lo que condiciona el estilo de las continuaciones.
- Riesgo elevado de alucinación y de repetición degenerada: en decodificación greedy, varias muestras colapsan en la repetición del token "کے".
- Ventana de contexto muy limitada (256 tokens), insuficiente para conversaciones multi-turno o documentos largos.
- Monolingüe: solo urdu; no comprende ni genera otros idiomas.
- No apto para producción: el propio autor lo describe como artefacto educativo y de exhibición, no como competidor de ningún LM de urdu en producción.
- Licencia MIT: permite uso comercial, pero las fuentes del corpus (Wikipedia y Wikisource en urdu) están bajo CC BY-SA 4.0, lo que exige atribución a los contribuyentes de Wikipedia en urdu y puede imponer obligaciones de compartir igual sobre obras derivadas del corpus; conviene revisar `DATA.md` antes de cualquier uso comercial.
- No se documentan evaluaciones de sesgos sociales, toxicidad ni seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/habib-analyst/sukhan-nano
- Corpus y documentación de datos: `DATA.md` en el repositorio del modelo
- Log de entrenamiento: `training_log.txt` en el repositorio del modelo
- Resultados de evaluación: `assets/eval_results.json` en el repositorio del modelo
- Script de construcción del corpus: `scripts/build_corpus.py`
- Script de entrenamiento: `scripts/train.py`
- Script de evaluación: `scripts/evaluate.py`
- Demo CLI: `examples/predict_demo.py`
- Wikipedia en urdu: https://ur.wikipedia.org
- Wikisource en urdu: https://ur.wikisource.org
