# cmeister/boundary-markers-ko-d12-plain-bpe

## Resumen

`cmeister/boundary-markers-ko-d12-plain-bpe` es un artefacto de investigación publicado en HuggingFace: un modelo de lenguaje de 12 capas entrenado en coreano con nanochat para servir de referencia (baseline) en un estudio sobre vocabularios de subpalabras. Forma parte del material asociado al artículo «Explicit Boundary Markers for Subword Vocabularies», de Sander Land y Clara Meister, que compara esquemas de tokenización que marcan explícitamente las fronteras de palabra. Este repositorio concreto contiene la variante `plain`, es decir, la que no introduce ningún marcador de frontera: pre-tokenización por codificación de script y BPE convencional.

El modelo resuelve un problema metodológico, no de producto: proporciona el punto de comparación frente al que se miden los demás esquemas de vocabulario en coreano, con la misma arquitectura, los mismos datos y el mismo orden de entrenamiento, de modo que la única diferencia entre variantes es el tokenizador. Se publican tres semillas (0, 1 y 2) que cubren dos órdenes de datos distintos, ya que con solo tres shards las semillas 1 y 2 coincidieron en el orden de los shards.

Es relevante ahora porque los estudios de tokenización se publican mayoritariamente en inglés, y esta es una reproducción controlada en coreano (septiembre de 2026) sobre 1,34 mil millones de tokens de entrenamiento, contexto de 2.048 tokens y un vocabulario de 34.686 entradas. No es un modelo de chat ni un modelo ajustado por instrucciones: es un modelo base pequeño pensado para medir bits por byte en validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat, commit `92d63d4`); 12 capas, anchura 768, 6 cabezas de atención |
| Parámetros totales | no disponible (la configuración exacta está en `seed<n>/meta_002553.json`; la estimación derivada de 12 capas y anchura 768 es del orden de 10^8 parámetros, valor no confirmado por el autor) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (solo se publican pesos en precisión de entrenamiento dentro de un state dict de PyTorch; no hay GGUF ni versiones cuantizadas) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`), cargable con `torch.load(..., weights_only=True)` |
| Vocabulario | 34.685 entradas BPE más un token de inicio de secuencia (34.686 en total) |
| Tokenizador | BPE con pre-tokenización por codificación de script y sin marcadores de frontera (`plain`); fichero `fineweb_ko_5gb_quick_plain_bpe_v34685.json.gz`, sha256 `3dbf1e06e409e362be5bc29fd059df3470df124512e7a41e2d3011006893a59c` |
| Tokens de entrenamiento | 2.553 pasos × 524.288 tokens = 1,34 mil millones de tokens |
| Tamaño del repositorio | 2,5 GB (tres semillas más tokenizador) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only del proyecto nanochat: 12 capas, anchura de 768, 6 cabezas de atención y contexto de 2.048 tokens. El entrenamiento se lanzó con `paper_utils/boundary/downstream/run_arms.sh` del repositorio script_tok, sobre el commit `92d63d4` de nanochat, con una GPU por modelo. El vocabulario se entrenó con BPE sobre una muestra de 5 GB de Korean FineWeb y da 34.685 entradas; los modelos usan 34.686 al añadir el token de comienzo de secuencia.

Los datos de entrenamiento son 3 shards de Korean FineWeb-2, de la release `fineweb-2_0_1-quality_10-filterrobots`: 1,22 mil millones de caracteres leídos aproximadamente 3,1 veces. La semilla fija la inicialización de pesos y el orden de los shards, y ese orden es idéntico para todas las variantes de tokenizador con la misma semilla, lo que permite comparaciones directas entre esquemas. Con solo 3 shards, las semillas 1 y 2 sortearon el mismo orden de shards, por lo que las tres semillas cubren dos órdenes de datos y no tres. No hay innovaciones de inferencia (ni decodificación especulativa, ni atención lineal) ni fases de RLHF, DPO o ajuste por instrucciones: es un preentrenamiento puro orientado a medir pérdida.

## Capacidades

- Modelado de lenguaje y generación de texto en coreano: es una LM base autoregresiva, sin ajuste por instrucciones ni plantilla de chat.
- Evaluación de tokenizadores: sirve para medir bits por byte en validación sobre un shard reservado de Korean FineWeb-2.
- Comparación controlada de vocabularios: al compartir arquitectura, datos y orden con las demás variantes del estudio, aísla el efecto del esquema de tokenización.
- Cálculo de métricas de compresión lingüística: la métrica reportada es la suma de la pérdida dividida por la longitud real en UTF-8 del texto evaluado.
- Reproducibilidad de un experimento: se incluyen `train.log`, `archive.json` con los sha256 y el fichero de configuración de cada semilla.
- No soporta tool calling ni function calling: no hay evidencia de ello en la información disponible.
- No está diseñado para agentes ni razonamiento multi-paso: no hay entrenamiento ni evaluación en ese sentido.
- Multilingüismo: únicamente coreano; no se ha entrenado ni evaluado en otros idiomas.
- No tiene modo de razonamiento (thinking), visión, audio ni ninguna otra modalidad.

## Casos de uso

- Baseline en investigación de tokenización: usar los tres checkpoints como referencia frente a los esquemas con marcadores de frontera, calculando la diferencia de bits por byte con la misma partición de validación y las mismas semillas.
- Reproducción del artículo en coreano: permite repetir el experimento del paper (que solo reporta inglés) sobre 1,34 mil millones de tokens de Korean FineWeb-2 sin reentrenar la arquitectura desde cero.
- Ablación de orden de datos: las semillas 1 y 2 comparten orden de shards y solo difieren en la inicialización, de modo que su diferencia (0,85500 frente a 0,85395 bits por byte) acota la varianza atribuible a los pesos iniciales.
- Estudio de escalado de vocabularios: comparar un vocabulario BPE de 34.685 entradas en coreano frente a otros tamaños o esquemas manteniendo el resto de hiperparámetros fijos.
- Pruebas de integración de tokenizadores: el pipeline de carga con `script_tok` y `huggingface_hub` documentado en la model card sirve como caso de prueba para verificar el entorno antes de lanzar entrenamientos más costosos.
- Docencia y estudio de dinámicas de entrenamiento: al ser un modelo pequeño con log completo de entrenamiento y configuración publicada, resulta adecuado para analizar curvas de pérdida y estabilidad con recursos limitados.
- Punto de partida para ajuste fino en coreano: al ser un modelo base pequeño con licencia Apache-2.0, puede usarse como inicialización para tareas posteriores, asumiendo que no incorpora ninguna alineación de seguridad.

## Benchmarks y rendimiento

El único resultado publicado en la información disponible es la pérdida en bits por byte en validación (suma de la pérdida sobre un shard reservado de Korean FineWeb-2 dividida por la longitud real en UTF-8 del texto evaluado; menor es mejor; los valores solo son comparables dentro de un mismo idioma).

| Semilla | Bits por byte (validación) |
|---|---|
| 0 | 0,85387 |
| 1 | 0,85500 |
| 2 | 0,85395 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor advierte además que tres semillas dan una dirección, no una estimación precisa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia del orden de magnitud, el repositorio completo (tres semillas más el tokenizador) ocupa 2,5 GB, de modo que cada checkpoint individual pesa unos cientos de megabytes.
- GPU recomendadas: no hay recomendación publicada para inferencia. Para entrenamiento se usó una GPU por modelo, lo que indica que la configuración cabe en una sola GPU.
- GPU de consumo: por el tamaño de la configuración (12 capas, anchura 768, contexto 2.048) el modelo es pequeño y debería caber en GPU de consumo tipo RTX 3060, RTX 4070 o RTX 4090; esta afirmación es una inferencia a partir de la configuración, no un dato confirmado por el autor.
- Opciones de despliegue: no hay soporte oficial en vLLM, llama.cpp, Ollama o TGI, ni pesos en GGUF. La carga debe hacerse con PyTorch (`torch.load(..., weights_only=True)`) y el tokenizador con `script_tok`.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento y red: el tokenizador se descarga por separado con `huggingface_hub`; los checkpoints están en `.pt`, por lo que no se benefician de la carga indexada de safetensors.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La comparación natural es interna al propio estudio, entre las variantes de tokenizador del paper, cuyos identificadores y resultados no se detallan aquí.

| Modelo | Parámetros | Contexto | Bits por byte (validación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (semilla 0) | no disponible | 2.048 | 0,85387 | Apache-2.0 | HuggingFace |
| Variante de semilla 1 | no disponible | 2.048 | 0,85500 | Apache-2.0 | Mismo repositorio |
| Variante de semilla 2 | no disponible | 2.048 | 0,85395 | Apache-2.0 | Mismo repositorio |
| Otros esquemas de vocabulario del estudio | no disponible | 2.048 | no disponible | no disponible | Repositorio script_tok |
| nanochat de referencia | no disponible | no disponible | no disponible | no disponible en la información proporcionada | Repositorio en GitHub |

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineación: no debe desplegarse directamente en aplicaciones de cara al usuario sin un ajuste posterior.
- Riesgo de alucinación: al ser un modelo de lenguaje generativo sin filtros, puede producir contenido factualmente falso o inapropiado.
- Sesgos: no hay ninguna evaluación de sesgos ni de seguridad en la información disponible; el corpus es una muestra de Korean FineWeb-2 con filtrado automático de calidad y robots.
- Limitación de idioma: solo coreano; el rendimiento en otros idiomas no está caracterizado y previsiblemente será malo con un vocabulario construido sobre coreano.
- Ventana de contexto corta: 2.048 tokens, insuficiente para conversaciones largas, documentos extensos o tareas de agente con historial.
- Datos de entrenamiento limitados: solo 3 shards (1,22 mil millones de caracteres) y 1,34 mil millones de tokens vistos, muy lejos de los regímenes de entrenamiento de modelos de producción.
- Cobertura estadística incompleta: con tres shards, dos de las tres semillas comparten orden de datos, por lo que la variabilidad estimada es optimista.
- Métrica restringida: los valores de bits por byte solo son comparables dentro del mismo idioma y esquema de evaluación; no son comparables con perplejidades publicadas por otros modelos.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación y no se ofrece ninguna garantía de idoneidad.
- Dependencia de código externo: el tokenizador requiere clonar `script_tok` y respetar las rutas de importación indicadas; no se integra con las clases estándar de `transformers`.
- Formato: los pesos son state dicts de PyTorch, lo que obliga a reconstruir la arquitectura de nanochat para poder cargarlos.
- Adopción nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay comunidad ni soporte.
- Advertencia de fechas: el repositorio está fechado en septiembre de 2026 y el artículo referenciado tiene el identificador arXiv 2608.08847; conviene verificar su disponibilidad antes de citarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ko-d12-plain-bpe
- Artículo «Explicit Boundary Markers for Subword Vocabularies» (Sander Land y Clara Meister): https://arxiv.org/abs/2608.08847
- Repositorio script_tok (tokenizador y scripts de entrenamiento): https://github.com/sanderland/script_tok
- nanochat (arquitectura base, commit `92d63d4`): https://github.com/karpathy/nanochat
- Dataset utilizado (Korean FineWeb-2, release `fineweb-2_0_1-quality_10-filterrobots`): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Tokenizador dentro del repositorio: `tokenizer/fineweb_ko_5gb_quick_plain_bpe_v34685.json.gz`
- Búsquedas web: no se encontraron enlaces relevantes al modelo; los resultados devueltos correspondían a una consultora de selección de personal y no guardan relación con este artefacto.
