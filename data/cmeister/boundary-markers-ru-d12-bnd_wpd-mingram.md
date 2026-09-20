# cmeister/boundary-markers-ru-d12-bnd_wpd-mingram

## Resumen

Este repositorio contiene tres modelos de lenguaje en ruso (semillas 0, 1 y 2) entrenados específicamente para comparar vocabularios de subpalabras que marcan explícitamente las fronteras de palabra. Forman parte del trabajo "Explicit Boundary Markers for Subword Vocabularies" (Sander Land y Clara Meister, arXiv:2608.08847), que en el artículo original solo reporta resultados en inglés; estos son los brazos rusos, entrenados en septiembre de 2026 con la misma metodología. El tokenizador de esta variante, denominado `bnd_wpd`, añade a los marcadores de frontera de palabra el marcado de secuencias de puntuación y de dígitos en el lado donde se eliminó un espacio.

Técnicamente son transformadores decoder-only de 12 capas, ancho 768 y 6 cabezas de atención, con una ventana de contexto de 2.048 tokens, entrenados desde cero con nanochat sobre 1.340 millones de tokens de un subconjunto de Russian FineWeb-2. Dentro de cada semilla, los tres modelos comparados solo se diferencian en el tokenizador, de modo que la comparación es controlada: misma inicialización de pesos y mismo orden de shards.

Su relevancia es fundamentalmente metodológica, no de producto. No es un modelo de chat ni un modelo instruido: no hay ajuste por instrucciones, RLHF ni DPO, y no se publican benchmarks de tareas. Lo que aporta es una medición de bits por byte (bpB) de validación en ruso que cuantifica cuánto ayuda (o no) el marcado explícito de fronteras al preentrenamiento, con tres semillas que dan una dirección del efecto en lugar de una estimación precisa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat, commit `92d63d4`); 12 capas, ancho 768, 6 cabezas de atención |
| Parámetros totales | no disponible (no se publica el recuento en la model card) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible; solo se distribuyen pesos sin cuantizar en estado PyTorch. No hay versiones GGUF, AWQ, GPTQ ni FP8 publicadas |
| Idiomas soportados | ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`.pt`) en `seed<n>/model_002553.pt`, cargable con `torch.load(..., weights_only=True)` |
| Tokenizador | MinGram con marcadores explícitos de frontera (`bnd_wpd`), vocabulario de 34.685 entradas más token de inicio de secuencia (34.686 en total); archivo `tokenizer/fineweb_ru_5gb_quick_bnd_wpd_mingram_v34685.json.gz`, sha256 `b3802d00ca30885ef78d40050eee6a23a48c810f3f386c938850397573f6aeac` |
| Semillas publicadas | 3 (0, 1, 2) |
| Pasos de entrenamiento | 2.553 pasos de 524.288 tokens (1.340 millones de tokens) |
| Tamaño del repositorio | 2,5 GB (tres semillas; aproximadamente 830 MB por semilla incluyendo pesos, registros y metadatos) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso generado con nanochat en su configuración de 12 capas, ancho 768 y 6 cabezas de atención (dimensión de cabeza 128), con contexto de 2.048 tokens. No hay mezcla de expertos, estado recurrente ni mecanismos híbridos. El entrenamiento se lanzó con el script `paper_utils/boundary/downstream/run_arms.sh` del repositorio script_tok: 2.553 pasos de 524.288 tokens cada uno, lo que suma 1.340 millones de tokens, con una GPU por modelo. El texto de entrenamiento son 10 shards de Russian FineWeb-2 (release `fineweb-2_0_1-quality_10-filterrobots`), 2.920 millones de caracteres leídos aproximadamente 3,35 veces. La semilla fija la inicialización de pesos y el orden de los shards, y ese orden es idéntico para todos los tokenizadores, de modo que los modelos con la misma semilla son directamente comparables.

La innovación que se estudia no está en el modelo sino en el tokenizador. El vocabulario `bnd_wpd` se entrenó con MinGram sobre una muestra de 5 GB de Russian FineWeb y, además de marcar las fronteras de palabra, marca también las secuencias de puntuación y de dígitos en el lado donde se eliminó un espacio. La comparación es entre esquemas de tokenización dentro de un mismo entrenamiento, no entre arquitecturas. No hay fase de ajuste por instrucciones, RLHF ni DPO: son modelos de preentrenamiento puro. Como referencia de escala, los valores declarados implican una matriz de embeddings de 34.686 × 768, es decir, unos 26,6 millones de parámetros solo en la tabla de embeddings (cálculo derivado de los datos publicados, no una cifra oficial del autor).

## Capacidades

- Generación de texto en ruso mediante continuación de secuencia (modelo de lenguaje base, sin plantilla de chat).
- Modelado de lenguaje a nivel de subpalabra con marcadores explícitos de frontera de palabra, puntuación y dígitos.
- Procesamiento de contextos de hasta 2.048 tokens en una sola pasada.
- Capacidad de servir como brazo experimental controlado frente a los tokenizadores `plain` y `bnd_w` del mismo estudio.
- Soporte de tool calling / function calling: no disponible (no se ha entrenado para ello ni se documenta plantilla alguna).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el entrenamiento y el vocabulario son monolingües en ruso.
- Capacidades especiales (modo de pensamiento, visión, audio): ninguna documentada.
- Fine-tuning sobre tareas rusas: es posible técnicamente al ser pesos densos estándar con licencia Apache 2.0, aunque no está validado por el autor.

## Casos de uso

- Replicación y auditoría del estudio de tokenización: cargar los tres puntos de control por semilla y recalcular los bits por byte sobre un shard reservado de Russian FineWeb-2 para verificar la diferencia de +0,00657 bpB de media frente al esquema `plain`.
- Control experimental en nuevos estudios de tokenización: al compartir inicialización y orden de shards con los demás brazos de la misma semilla, sirve como referencia fija cuando se prueba un vocabulario nuevo (por ejemplo, un MinGram con otro conjunto de marcadores) sobre exactamente los mismos datos.
- Análisis de morfología rusa: los marcadores explícitos de frontera permiten estudiar cómo se segmentan palabras, puntuación y números en ruso, y correlacionar esa segmentación con la pérdida por byte obtenida.
- Transferencia metodológica a otras lenguas: este brazo ruso, junto con el original en inglés, permite extender el protocolo (tokenizador MinGram con marcadores + entrenamiento nanochat de 12 capas) a un tercer idioma comparando contra un resultado ya publicado.
- Prototipos de generación de texto ruso de bajo coste: con menos de 1 GB de pesos por semilla y contexto de 2.048 tokens, se puede desplegar en una estación de trabajo con GPU consumer para demos de continuación de texto, sin esperar calidad de asistente.
- Experimentos de ajuste fino con presupuesto reducido: partir de estos pesos para tareas rusas acotadas (clasificación de texto, etiquetado de secuencias, resumen extractivo de documentos cortos) donde no se necesite contexto largo ni seguimiento de instrucciones complejas.
- Docencia y formación técnica: el pipeline completo (nanochat en un commit concreto, 1.340 millones de tokens, una GPU por modelo, registros de entrenamiento y auditoría con sha256 por archivo) es un caso reproducible para enseñar preentrenamiento de LLM de principio a fin.
- Evaluación de la interacción entre tokenizador y arquitectura en ventanas cortas: al fijar el contexto en 2.048 tokens, es un banco útil para medir cuánto del efecto del tokenizador se debe a la longitud efectiva de secuencia y no a la arquitectura.

## Benchmarks y rendimiento

La única métrica publicada es la pérdida de validación en bits por byte (bpB): pérdida sumada sobre un shard reservado de Russian FineWeb-2 dividida por la longitud UTF-8 real del texto evaluado. Menos es mejor y los valores solo son comparables dentro de un mismo idioma y configuración.

| Semilla | bpB de este modelo (`bnd_wpd`) | Diferencia `plain` menos este modelo |
|---|---|---|
| 0 | 0,54273 | +0,00627 |
| 1 | 0,54269 | +0,00658 |
| 2 | 0,54259 | +0,00685 |

La diferencia media es de +0,00657 con una desviación estándar entre semillas de 0,00029. Un valor positivo significa que el esquema `bnd_wpd` obtiene una pérdida menor que el tokenizador `plain`. El autor advierte que tres semillas dan una dirección del efecto, no una estimación precisa. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de evaluación en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia derivada, el repositorio completo ocupa 2,5 GB para tres semillas (unos 830 MB por semilla, incluidos registros y metadatos), por lo que los pesos de una sola semilla ocupan del orden de cientos de megabytes y la inferencia en fp32 debería caber holgadamente por debajo de 2 GB.
- GPU recomendadas: cualquier GPU consumer reciente con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente por tamaño; no se han publicado requisitos oficiales.
- ¿Cabe en GPU consumer? Sí, con amplio margen, dado el tamaño del artefacto y el contexto de 2.048 tokens. También es viable la inferencia en CPU.
- Entrenamiento: el autor indica una GPU por modelo para 2.553 pasos sobre 1.340 millones de tokens; el modelo concreto usado no se especifica.
- Opciones de despliegue: no hay soporte oficial para vLLM, llama.cpp, Ollama, TGI ni servidores compatibles con la API de OpenAI. La vía documentada es cargar el estado PyTorch con `torch.load(..., weights_only=True)` y usar el código de nanochat en el commit `92d63d4`, más el cargador de tokenizador del repositorio script_tok. Cualquier conversión a GGUF u otro formato requeriría trabajo adicional no documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La información proporcionada solo permite comparar dentro de la propia familia experimental, que es precisamente el diseño del estudio: mismo número de parámetros, mismo contexto y mismo entrenamiento, variando únicamente el tokenizador.

| Modelo | Parámetros | Contexto | bpB de validación (ruso) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`bnd_wpd`, semillas 0/1/2) | no disponible | 2.048 | 0,54273 / 0,54269 / 0,54259 | Apache 2.0 | HuggingFace |
| Variante `plain` (mismo entrenamiento, tokenizador sin marcadores) | idénticos al anterior | 2.048 | 0,54900 / 0,54927 / 0,54944 (derivado de la diferencia publicada) | Apache 2.0 | Repositorio script_tok |
| Esquema `bnd_w` (marca fronteras de palabra, sin puntuación ni dígitos) | idénticos | 2.048 | no disponible en esta ficha; consultar el repositorio script_tok | Apache 2.0 | Repositorio script_tok |
| Otros esquemas, entrenadores e idiomas del mismo estudio | idénticos dentro de cada comparación | 2.048 | no disponible | Apache 2.0 | Repositorio script_tok |
| Modelos rusos de terceros de tamaño similar | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un artefacto de investigación, no un producto: sin ajuste por instrucciones, sin RLHF/DPO y sin plantilla de chat. No debe usarse como asistente conversacional.
- Ventana de contexto muy corta (2.048 tokens) para los estándares actuales; no admite documentos largos ni conversaciones multi-turno extensas.
- Entrenamiento limitado: 1.340 millones de tokens, con los datos leídos unas 3,35 veces, lo que sitúa la calidad de generación muy por debajo de modelos rusos preentrenados a mayor escala.
- Riesgo elevado de alucinación y de texto incoherente fuera de dominios parecidos a Russian FineWeb-2; no hay filtrado de seguridad ni alineación.
- Sesgos: el corpus de entrenamiento es Russian FineWeb-2 con el filtro `quality_10-filterrobots`; no se documenta ningún análisis de sesgos, toxicidad ni representación demográfica. Cabe esperar los sesgos presentes en texto web ruso.
- Monolingüe en ruso: no hay capacidades multilingües y el vocabulario está entrenado solo sobre texto ruso.
- Los resultados publicados son de pérdida de validación (bpB) y solo son comparables dentro del mismo idioma y configuración. No hay métricas de tareas, por lo que no se puede inferir rendimiento en aplicaciones concretas.
- Limitación estadística: solo tres semillas y una desviación estándar de 0,00029 en la diferencia, lo que da una dirección del efecto, no una estimación precisa.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al ser pesos derivados de un corpus web conviene revisar las condiciones de la release de FineWeb-2 antes de un uso en producción.
- No hay cuantizaciones ni integraciones con motores de inferencia habituales; el despliegue en producción exigiría trabajo de conversión y validación no documentado.
- El repositorio incluye solo los pesos finales (`model_002553.pt`), no puntos de control intermedios ni el estado del optimizador, por lo que reanudar el entrenamiento desde el punto final no es trivial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ru-d12-bnd_wpd-mingram
- Artículo: Explicit Boundary Markers for Subword Vocabularies (Sander Land y Clara Meister), https://arxiv.org/abs/2608.08847
- Repositorio script_tok (tokenizadores, scripts de entrenamiento y comparación completa entre esquemas, entrenadores e idiomas): https://github.com/sanderland/script_tok
- nanochat (Karpathy), usado en el commit `92d63d4`: https://github.com/karpathy/nanochat
- Russian FineWeb-2, release `fineweb-2_0_1-quality_10-filterrobots`: no se ha encontrado un enlace directo en la información proporcionada.
- Paper, blog o demo adicionales: no disponibles. La búsqueda web asociada no devolvió resultados relevantes para este modelo.
