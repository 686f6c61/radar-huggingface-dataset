# SceneWorks/yue-s1-7b-anneal-zh-icl-candle

## Resumen

SceneWorks/yue-s1-7b-anneal-zh-icl-candle es un espejo (rehost) no oficial de m-a-p/YuE-s1-7B-anneal-zh-icl, fijado a la revisión `e631706ec784e48ba646f0fdfc3d4d7fc1fa6d72`. Se trata del modelo de etapa 1 (stage-1) de YuE, la familia de modelos fundacionales de código abierto para generación musical de M-A-P y HKUST, orientada especificamente a la tarea lyrics2song: convertir una letra en la secuencia del codebook 0 de un códec de audio. No es un modelo de chat ni un LLM de propósito general, sino un modelo de lenguaje (LM) de 7.000 millones de parámetros que produce tokens de audio que un códec externo debe convertir en waveform.

Lo publica SceneWorks para que los pesos se resuelvan mediante un SHA de commit inmutable dentro de su motor YuE sobre candle (SceneWorks Inference). El repositorio incluye tres niveles autocontenidos: `bf16/` (snapshot upstream sin modificar, unos 12,45 GB), `q8/` (7,26 GB) y `q4/` (4,49 GB), cada uno con su `config.json`, tokenizer y pesos. El repo completo ocupa 24,2 GB y declara vocabulario de 83.968 entradas y contexto de 16.384 tokens.

Su relevancia actual es doble: por un lado, ofrece cuantizaciones GGML listas para usar (Q8_0 y Q4_K) que reducen el coste de inferencia de un modelo musical de 7B; por otro, garantiza reproducibilidad exacta de artefactos mediante la fijación por commit y el registro de hashes sha256, algo poco habitual en modelos de generación de audio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje (LM) de etapa 1 de YuE; la model card no detalla la arquitectura interna más allá de su función (letra → codebook 0) |
| Parametros totales | 7.000 millones (7B, según el nombre del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | bf16; GGML Q8_0 (nivel `q8`); GGML Q4_K (nivel `q4`) |
| Idiomas soportados | no disponible (el sufijo `zh` del nombre sugiere ajuste para chino, no confirmado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; las proyecciones cuantizadas se almacenan como tensores `U8` con bloques GGML dentro del propio safetensors |
| Vocabulario | 83.968 entradas |
| Repositorio | 24,2 GB en total (bf16 + q8 + q4) |
| Revision fijada | `e631706ec784e48ba646f0fdfc3d4d7fc1fa6d72` |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Lo único confirmable es su posición en el sistema: es el modelo de etapa 1 del pipeline YuE, cuyo cometido es mapear letras (texto) a la secuencia del codebook 0 de un códec de audio. El segmento `anneal` del nombre apunta a una fase de annealing del entrenamiento, `zh` a un ajuste orientado a chino e `icl` a aprendizaje en contexto, pero estos extremos no se detallan en la información disponible y se señalan aquí únicamente como lectura del nombre del modelo.

La innovación técnica documentada está en el empaquetado, no en el entrenamiento. Los niveles `q8` y `q4` se generan desde `bf16/` con el preparador de snapshots de candle-llm (`prepare_snapshot`): cada proyección de atención y MLP se cuantiza una sola vez y se almacena como bloques GGML en crudo, en un tensor `U8` con forma `[rows, blocks_per_row, block_bytes]`, donde el tipo de bloque viene dado por `block_bytes` (18 = Q4_0, 34 = Q8_0, 144 = Q4_K). El cargador de candle reconstruye los pesos directamente, sin desquantizar ni requerir posterior. Los embeddings, la cabeza LM (LM head) y las normas permanecen en bf16 en todos los niveles. El códec xcodec y los decodificadores Vocos no están incluidos en los niveles y se sirven aparte mediante `SceneWorks/xcodec-mini-infer`. `config.json` incluye `quantization: {bits, storage: "ggml"}`. El tokenizer parte del `tokenizer.model` SentencePiece original de upstream y el `tokenizer.json` derivado (BPE con byte-fallback y tokens especiales mm en sus ids) se verificó id a id contra el tokenizer upstream `_MMSentencePieceTokenizer` sobre 3.010 casos, con 0 discrepancias.

## Capacidades

- Generación de tokens de audio del codebook 0 a partir de una letra de canción, como primera etapa de un pipeline lyrics2song.
- Aprendizaje en contexto (ICL, por el sufijo del nombre) para condicionar la generación con ejemplos.
- Ventana de contexto de 16.384 tokens, adecuada para letras largas y condicionamiento extenso.
- Vocabulario de 83.968 entradas, derivado de un tokenizer SentencePiece con tokens especiales mm.
- Cuantización de todas las proyecciones de atención y MLP a Q8_0 o Q4_K, manteniendo en bf16 embeddings, LM head y normas.
- Integración con el códec externo `SceneWorks/xcodec-mini-infer` (xcodec más decodificadores Vocos) para obtener la forma de onda final.
- Soporte de tool calling / function calling: no disponible; el modelo no está diseñado para ello.
- Soporte de agentes y razonamiento multi-paso: no aplicable; no es un modelo de propósito general.
- Capacidades multilingües: no disponibles; el nombre sugiere orientación a chino, sin confirmación en la model card.
- Capacidades de visión o audio directo: no; el modelo trabaja sobre tokens del códec, no sobre waveform.

## Casos de uso

- Generación de canciones completas a partir de letras en local: el modelo cubre la etapa 1 (letra → codebook 0) y, combinado con el códec `SceneWorks/xcodec-mini-infer` y el resto del pipeline YuE, permite obtener audio sin depender de servicios en la nube, algo viable en GPUs de consumo gracias al nivel `q4` de 4,49 GB.
- Maquetas para compositores: un letrista puede pasar un borrador de letra y obtener rápidamente una propuesta melódica y armónica sobre la que iterar antes de entrar en un estudio o DAW.
- Prototipado por lotes en producción de contenidos: el nivel `q8` (7,26 GB) permite generar muchas variantes de una misma letra en una sola GPU, útil para elegir la mejor toma antes de refinar.
- Investigación en generación musical: los tres niveles (bf16, Q8_0, Q4_K) permiten medir el impacto de la cuantización en la calidad musical manteniendo idéntico el resto del pipeline, con la ventaja de que los pesos están fijados por SHA y sus hashes registrados.
- Reproducibilidad de pipelines en entornos regulados: al resolver los pesos por commit inmutable (`e631706…`) y registrar `SOURCE_REVISION.json` con el SHA-256 de cada fichero, es adecuado para experimentos que exigen trazabilidad exacta del artefacto.
- Herramientas creativas offline integradas en aplicaciones de escritorio: el nivel `q4` (menos de 5 GB de pesos) cabe en portátiles con GPU de gama media, lo que habilita asistentes de composición sin conexión.
- Generación de música para vídeo, juegos o pódcast: sirve como generador de pistas base a partir de letras propias, siempre que se revisen los derechos del material generado antes de su explotación.
- Experimentación y ajuste fino sobre la etapa 1: el nivel `bf16` sirve como punto de partida para reentrenamientos o investigaciones sobre el mapeo letra → codebook 0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del rehost no incluye métricas (MMLU, HumanEval, GSM8K ni equivalentes musicales), y los resultados de búsqueda no aportan cifras de evaluación para esta variante concreta.

## Requisitos de hardware

- Tamano de pesos por nivel: bf16 ≈ 12,45 GB; q8 = 7,26 GB; q4 = 4,49 GB. Cifras tomadas del tamaño del repositorio y de la model card.
- VRAM estimada para inferencia (cálculo orientativo a partir del tamaño de los pesos, no confirmado por el autor): q4 ≈ 5,5–6,5 GB; q8 ≈ 8–9 GB; bf16 ≈ 13–15 GB, en todos los casos sumando espacio para caché KV y activaciones.
- GPU de consumo: el nivel `q4` entra en GPUs de 8 GB (RTX 3060 Ti, RTX 4060); el nivel `q8` en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070); el nivel `bf16` requiere 16 GB o más (RTX 4080, RTX 4090) o 24 GB para trabajar con holgura.
- GPU de datacenter: A100, H100 o similares para servir bf16 con margen y procesar lotes grandes.
- Nota: a la VRAM del modelo hay que sumar la del códec y decodificadores de `SceneWorks/xcodec-mini-infer`, que no están incluidos en los niveles cuantizados.
- Opciones de despliegue: motor YuE de SceneWorks Inference sobre candle (runtime previsto por el autor). El layout de cuantización es propio (tensores `U8` con bloques GGML dentro de safetensors), por lo que otros runtimes basados en GGML necesitarían el cargador específico de candle.
- Latencia y throughput: no disponibles.
- Referencia de un modelo hermano: la variante `m-a-p/YuE-s1-7B-anneal-zh-cot` aparece listada con 12,4 GB de VRAM y contexto de 16K en llm-explorer, dato que no aplica directamente a este rehost pero sirve como orden de magnitud.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| SceneWorks/yue-s1-7b-anneal-zh-icl-candle (este) | 7B | 16.384 | bf16, Q8_0, Q4_K | Apache-2.0 | Rehost no oficial, pesos fijados por SHA, 3 niveles |
| m-a-p/YuE-s1-7B-anneal-zh-icl | 7B | 16.384 | bf16 | Apache-2.0 | Distribución upstream del mismo modelo |
| HKUSTAudio/YuE-s1-7B-anneal-zh-icl | 7B | no disponible | bf16 | Apache-2.0 | Espejo institucional (HKUST) |
| m-a-p/YuE-s1-7B-anneal-zh-cot | 7B | 16K (según llm-explorer) | bf16 | Apache-2.0 | Variante con cadena de pensamiento; VRAM listada de 12,4 GB |

## Limitaciones y advertencias

- Es un rehost no oficial: el propio autor indica que no es una distribución oficial de M-A-P, por lo que la responsabilidad de mantenimiento y soporte recae en SceneWorks.
- No genera audio por sí solo: necesita el códec `SceneWorks/xcodec-mini-infer` (xcodec más decodificadores Vocos) para producir waveform.
- Cubre únicamente la etapa 1 del pipeline YuE; para obtener una canción completa se requiere el resto del sistema.
- Sesgos conocidos: no documentados en la información disponible. No hay análisis de sesgo de género, idioma o estilo musical.
- Idiomas: no confirmados; el nombre sugiere orientación a chino, por lo que el rendimiento en otras lenguas es incierto.
- Riesgo de salidas incoherentes: al ser un modelo generativo de tokens de audio, puede producir secuencias musicalmente incoherentes, mal alineadas con la letra o con estructura impredecible.
- La cuantización Q4_K puede degradar la calidad frente a Q8_0 o bf16; el autor no publica comparativas de calidad entre niveles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero obliga a conservar los ficheros `LICENSE` y `NOTICE` (atribución a Ruibin Yuan y colaboradores de M-A-P y HKUST, retenida conforme a la sección 4(d)).
- Derechos sobre el contenido generado: la licencia cubre el software, no exime de revisar los derechos de las obras musicales resultantes ni de posibles similitudes con material protegido.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad sobre los niveles cuantizados.
- Dependencia de ecosistema: el layout de cuantización es específico del motor candle de SceneWorks Inference; portarlo a otros runtimes exige trabajo adicional.
- Metadatos anómalos: las fechas del repositorio indican creación el 2026-09-24, lo que puede deberse a un error de registro y dificulta situar la publicación en el tiempo.
- Para producción, conviene verificar la revisión `e631706ec784e48ba646f0fdfc3d4d7fc1fa6d72` y los hashes de `SOURCE_REVISION.json` antes de desplegar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SceneWorks/yue-s1-7b-anneal-zh-icl-candle
- Modelo upstream: https://huggingface.co/m-a-p/YuE-s1-7B-anneal-zh-icl
- Espejo de HKUST: https://huggingface.co/HKUSTAudio/YuE-s1-7B-anneal-zh-icl
- Variante cot en ModelScope: https://www.modelscope.cn/models/AI-ModelScope/YuE-s1-7B-anneal-zh-cot
- Códec asociado: https://huggingface.co/SceneWorks/xcodec-mini-infer
- Proyecto upstream YuE (M-A-P): https://github.com/multimodal-art-projection/YuE
- Réplica del repositorio YuE: https://github.com/seshakiran/yue
- Ficha comparativa en llm-explorer: https://llm-explorer.com/model/m-a-p%2FYuE-s1-7B-anneal-zh-cot,Ny3DXXVi4jpsjA16JzawB
