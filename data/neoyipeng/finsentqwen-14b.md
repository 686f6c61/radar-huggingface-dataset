# neoyipeng/FinSentQwen-14B

## Resumen

FinSentQwen-14B es un adaptador LoRA con una cabeza de clasificación de 3 clases entrenado sobre el modelo base Qwen/Qwen3-14B. Lo desarrolla el usuario de HuggingFace neoyipeng y su función es analizar sentimiento financiero en noticias en inglés: recibe un pasaje de noticia junto con el nombre de una empresa y etiqueta cómo afecta ese pasaje a dicha compañía en cinco aspectos distintos (rendimiento financiero, tracción comercial, operaciones y suministro, perspectivas y expectativas, y sentimiento general). Cada aspecto se clasifica como positivo, negativo o sin señal, todo en un único forward pass.

El modelo no es un LLM generativo autónomo: conserva el modelo base Qwen3-14B congelado en cuantización 4-bit NF4 y añade un adaptador QLoRA (r=16, alpha=32) más una cabeza de puntuación de 3 clases que lee el último token de cada línea de aspecto. Está pensado para pipelines de análisis de noticias financieras y clasificación estructurada a bajo coste (4,3 horas de entrenamiento en 2×T4, inferencia a unos 843 segundos de T4 por cada 1.000 pasajes).

Su relevancia radica en que demuestra que un adaptador pequeño sobre un modelo abierto de 14B puede superar en sentimiento general (macro-F1 0,835) al propio modelo profesor GPT-6.1 que generó las etiquetas (0,803), aunque en los cuatro aspectos específicos queda por debajo (0,734 frente a 0,851). La licencia Apache-2.0 y la publicación de los datos de entrenamiento facilitan su reproducibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3-14B (transformer decoder-only) con adaptador LoRA y cabeza de clasificación de 3 clases |
| Parámetros totales | Adaptador LoRA sobre Qwen/Qwen3-14B (parámetros del adaptador no disponibles; repo de 0,3 GB) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrada limitada a 1.024 tokens (solo se recorta el pasaje) |
| Tipos de cuantización | Base en 4-bit NF4 (bitsandbytes); adaptador en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) + thresholds.json; base Qwen3-14B en 4-bit NF4 |
| Pipeline | text-classification |
| Librería | peft (con transformers, bitsandbytes, accelerate) |
| Revisión del base model | 40c069824f4251a91eefaf281ebe4c544efd3e18 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B congelado en cuantización 4-bit NF4 y le superpone un adaptador QLoRA con r=16, alpha=32 y dropout de 0,05 aplicado a todas las proyecciones de atención y MLP, junto con una cabeza de puntuación de 3 clases. La entrada sigue el formato `Company: {company}\n\nPassage:\n{text}` seguido de `\n\nAspect: {aspect}\nSignal:` para cada uno de los cinco aspectos; la cabeza lee el último token de cada línea de aspecto, de modo que los cinco juicios se producen en un único forward pass.

El entrenamiento utilizó 5.134 pasajes de noticias en inglés con una empresa nombrada y 25.670 etiquetas (5 por pasaje) generadas por GPT-6.1 (gpt-6.1-sol vía Codex). No se emplearon filings de la SEC ni comunicados de prensa. La receta fue QLoRA con learning rate 1e-4, warmup lineal, 2 épocas, batch efectivo de 16 pasajes, precisión fp16 y 2×T4. La elección del tamaño (14B frente a 0.6B y 4B) y de las épocas se hizo mediante una rejilla de escalado con tres semillas sobre un holdout de desarrollo de 1.000 pasajes, con una regla fijada antes de ejecutar la rejilla; 14B superó a 4B por 0,013 en aspectos y 0,007 en sentimiento general. Se publica una única semilla, la evaluada. El dataset de entrenamiento está disponible en neoyipeng/FinSentQwen-data con atribución por pasaje (autor, título, URL, licencia).

## Capacidades

- Clasificación de sentimiento financiero por aspecto: genera etiquetas positivas, negativas o sin señal para cinco aspectos (rendimiento financiero, demanda y tracción comercial, operaciones y suministro, perspectivas y expectativas, sentimiento general) en un solo forward pass.
- Clasificación multi-aspecto estructurada: cinco salidas simultáneas a partir de un par (empresa, pasaje), en lugar de una única etiqueta global.
- Calibración de probabilidades: corrige el softmax desde el prior de etiquetas de entrenamiento al prior del dev de noticias por aspecto; el ECE classwise es 0,009 en aspectos y 0,056 en bruto / 0,048 con temperatura (T = 1,47) en sentimiento general.
- Regla de decisión configurable: usa thresholds.json con umbral t=0,09 para los cuatro aspectos y t=0,15 para el sentimiento general, reajustable sobre datos propios etiquetados.
- Entrada con empresa nombrada: requiere que el pasaje mencione una compañía concreta; no procesa texto sin entidad asociada.
- Idioma: únicamente inglés.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking expuesto; es un clasificador, no un generador de texto libre.

## Casos de uso

- Análisis de sentimiento de noticias financieras en producción: el modelo procesa lotes de pasajes (input.jsonl a output.jsonl vía predict.py) y devuelve por cada uno las cinco etiquetas con sus probabilidades; es adecuado para ingesta masiva de noticias a bajo coste (≈ 0,08 USD por 1.000 pasajes en T4 a 0,35 USD/hora).
- Monitorización de cobertura mediática por empresa: dado un feed de noticias con empresas nombradas, permite construir un panel de señales (positiva, negativa, neutra) por aspecto para detectar cambios de tono en la cobertura.
- Señales previas a modelos de trading o research: las etiquetas de sentimiento general y de perspectivas pueden alimentar features en pipelines cuantitativos, con la ventaja de que el sentimiento general supera al profesor GPT-6.1 (0,835 macro-F1).
- Enriquecimiento de bases de datos de noticias: asignar automáticamente etiquetas multi-aspecto a corpus de noticias ya archivados (VOA, Global Voices, Common Pile) para búsqueda y filtrado por tipo de señal.
- Investigación en análisis financiero con datos abiertos: al publicarse los datos, el adaptador y el script de inferencia, sirve como baseline reproducible para estudiar clasificación de sentimiento por aspecto.
- Prototipado rápido en entornos con GPU limitada: el modelo base carga en 4-bit NF4 en una única GPU CUDA con unos 12 GB de VRAM, lo que permite desplegarlo en una T4 o en GPUs consumer de gama media-alta para pruebas internas.

## Benchmarks y rendimiento

Evaluación sobre un test sellado de 400 pasajes de noticias (2022–2024) nunca usado en entrenamiento ni ajuste, con etiquetas gold de doble ciego de Claude Opus. Macro-F1 sobre las tres clases:

| Tarea | FinSentQwen-14B | GPT-6.1 (profesor) | Techo Opus |
|---|---:|---:|---:|
| Cuatro aspectos (1.600 celdas) | 0,734 | 0,851 | 0,960 |
| Sentimiento general (400) | 0,835 | 0,803 | 0,936 |

Por fuente:

| Corte | Aspectos | General |
|---|---:|---:|
| VOA (251 pasajes) | 0,715 | 0,855 |
| Editoriales Common Pile (132) | 0,728 | 0,811 |
| Refuerzo 2022 (17) | 0,950 | 0,638 |

El corte de 2022 es demasiado pequeño para interpretarlo. F1 por clase en aspectos: positiva 0,61, negativa 0,63, sin señal 0,97; el 91% de las celdas de aspecto del test son "sin señal" y el modelo predice positivo y negativo con demasiada rareza (75 predichos frente a 147 en el gold). Calibración: ECE classwise 0,009 en aspectos en bruto; 0,056 en bruto y 0,048 con temperatura en sentimiento general. Datos de ajuste (dev solo de noticias): aspectos 0,844, general 0,825. Coste de entrenamiento: 4,3 h en 2×T4.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB en una única GPU CUDA, con el modelo base en 4-bit NF4 y el adaptador en safetensors.
- GPU recomendadas: T4 (usada en entrenamiento e inferencia de referencia), así como cualquier GPU CUDA con al menos 12 GB de VRAM.
- GPU consumer: cabe en tarjetas con 12 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); no cabe en GPUs de 8 GB sin cuantizaciones adicionales no documentadas.
- Opciones de despliegue: predict.py con torch, transformers, peft, bitsandbytes y accelerate; el modelo base se carga en 4-bit NF4 tal como se entrenó. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: aproximadamente 843 segundos de T4 por cada 1.000 pasajes (≈ 0,84 s por pasaje en T4), con un coste estimado de 0,08 USD por 1.000 pasajes a 0,35 USD por hora de T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Macro-F1 sentimiento general | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| FinSentQwen-14B | LoRA sobre Qwen3-14B | 1.024 tokens | Clasificación de sentimiento financiero multi-aspecto | 0,835 | Apache-2.0 | HuggingFace (neoyipeng/FinSentQwen-14B) |
| GPT-6.1 (profesor de etiquetas) | No disponible | No disponible | Etiquetado de sentimiento financiero | 0,803 | Propietaria | Comercial (API) |
| Claude Opus (etiquetador gold) | No disponible | No disponible | Etiquetado de sentimiento financiero | 0,936 (techo de acuerdo entre etiquetados Opus) | Propietaria | Comercial (API) |
| FinBERT y derivados | No disponible en la información | No disponible | Clasificación de sentimiento financiero | No disponible | No disponible | No disponible |

No se dispone de datos comparativos con FinBERT u otros clasificadores de sentimiento financiero en la información proporcionada. La comparación con GPT-6.1 y Opus es la publicada por el autor y mide acuerdo con etiquetas silver, no rendimiento absoluto frente a verdad humana.

## Limitaciones y advertencias

- Solo inglés y solo noticias con una empresa nombrada en el pasaje; no está probado en filings, redes sociales, transcripciones ni otros idiomas.
- Las etiquetas son silver: GPT-6.1 para entrenamiento y Claude Opus para el test, lo que acota el rendimiento máximo alcanzable al acuerdo entre etiquetadores (0,960 en aspectos, 0,936 en general).
- Los cuatro aspectos son débiles: el modelo predice positivo y negativo con demasiada rareza (75 frente a 147 en el gold), con F1 por clase de 0,61 y 0,63; el macro-F1 de 0,734 está lastrado por el desequilibrio hacia "sin señal".
- El sentimiento general supera al profesor pero se apoya en etiquetas silver; no está validado contra anotación humana.
- La ventana de entrada está limitada a 1.024 tokens y solo se recorta el pasaje, de modo que textos largos pierden información.
- Los umbrales (t=0,09 y t=0,15) están congelados para el dominio de noticias de este proyecto; con fuentes distintas deben reajustarse sobre datos etiquetados propios.
- Se publica una única semilla, sin intervalo de confianza reportado; el corte de 2022 (17 pasajes) no es interpretable.
- Riesgo de sesgo no evaluado: no se documentan análisis de sesgo por empresa, sector o tipo de medio.
- La licencia Apache-2.0 cubre el adaptador y el modelo base Qwen3-14B, pero el uso comercial debe verificar además las licencias de las fuentes de datos (VOA dominio público, Common Pile CC BY) si se redistribuyen textos.
- No es un generador de texto ni un agente: no soporta tool calling, function calling ni razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/neoyipeng/FinSentQwen-14B
- Dataset de entrenamiento: https://huggingface.co/datasets/neoyipeng/FinSentQwen-data
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Voice of America: https://www.voanews.com/p/5338.html
- Multilingual Open Text v1.11 (BLT Lab): https://github.com/bltlab/mot
- Global Voices: https://globalvoices.org
- 360info: https://360info.org
- Factly: https://factly.in
- Freedom of the Press Foundation: https://freedom.press
- Balkan Diskurs: https://www.balkandiskurs.com
