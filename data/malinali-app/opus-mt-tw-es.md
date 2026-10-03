# malinali-app/opus-mt-tw-es

## Resumen

`malinali-app/opus-mt-tw-es` es un paquete de pesos para traducción automática del par tw → es, publicado por el proyecto Malinali. No es un modelo entrenado desde cero: se trata de una redistribución de los pesos de `Helsinki-NLP/opus-mt-tw-es` en formato safetensors, junto con los tokenizadores rápidos convertidos desde SentencePiece al formato JSON que consume Candle a través de `marian_flutter`. La autoría del entrenamiento corresponde a Helsinki-NLP (proyecto OPUS-MT); Malinali solo empaqueta y convierte artefactos para inferencia en dispositivo.

Técnicamente es un modelo Marian de tipo encoder-decoder orientado a `text2text-generation`, con 75.459.713 parámetros totales y un repositorio de 0,3 GB. Su interés no está en una innovación arquitectónica, sino en el formato de distribución: al incluir tokenizadores rápidos separados para entrada y salida y pesos en safetensors, está pensado para ejecutarse embebido en aplicaciones Flutter mediante Candle, sin depender de Python ni de servicios en la nube.

La relevancia es acotada pero clara: cubre un par lingüístico de bajos recursos (tw → es) con un modelo lo bastante pequeño para caber en un móvil o en una Raspberry Pi. El repositorio no registra descargas ni likes, no declara licencia propia y no publica métricas de calidad, por lo que debe evaluarse como artefacto de despliegue más que como contribución de modelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder para traducción automática, `text2text-generation`) |
| Parametros totales | 75.459.713 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el autor no la especifica; condicionada por el `config.json` de Marian) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | tw, es (según los tags del repositorio; dirección única tw → es) |
| Licencia | no disponible en la ficha; el autor remite a la licencia del modelo upstream, típicamente CC-BY 4.0 para OPUS-MT |
| Formato de pesos | safetensors (`model.safetensors`) |

Ficheros declarados en el repositorio: `config.json` (configuración Marian), `model.safetensors` (pesos), `tokenizer-enc.json` (tokenizador rápido de origen) y `tokenizer-dec.json` (tokenizador rápido de destino).

## Arquitectura y entrenamiento

La arquitectura es Marian, la implementación de traducción automática neuronal de código abierto desarrollada en el marco del proyecto OPUS-MT de Helsinki-NLP. Se trata de un transformer encoder-decoder clásico con atención completa, especializado en una única dirección de traducción (tw → es). La información proporcionada no detalla el número de capas, la dimensión del modelo, el número de cabezas de atención ni los hiperparámetros de entrenamiento, por lo que esos datos deben consultarse en el `config.json` del repositorio o en la ficha del modelo upstream.

Respecto al entrenamiento, Malinali declara explícitamente que no reclama la propiedad del modelo entrenado y que su trabajo se limita a reempaquetar los pesos y convertir los tokenizadores de SentencePiece a JSON de tokenizador rápido de Hugging Face. Por tanto, el corpus de entrenamiento, el número de tokens, la composición del dataset y el uso de técnicas de alineación como RLHF o DPO corresponden al modelo original de Helsinki-NLP y no se documentan en esta ficha. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras): el valor del paquete está en el formato de distribución para inferencia en dispositivo.

## Capacidades

- Traducción automática de texto en la dirección tw → es, expuesta con el pipeline `translation`.
- Generación texto a texto (`text2text-generation`) mediante la librería `transformers`, con pesos en safetensors.
- Tokenización rápida separada para origen y destino (`tokenizer-enc.json` y `tokenizer-dec.json`), pensada para el runtime Candle y el binding `marian_flutter`.
- Inferencia en dispositivo: el paquete está publicado como "on-device pack" para la aplicación Malinali.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags de HuggingFace).
- No hay soporte de tool calling ni de function calling.
- No hay capacidades de agente, razonamiento multi-paso ni planificación.
- No hay modo de razonamiento explícito (thinking mode).
- No hay capacidades multimodales: ni visión, ni audio, ni voz.
- El alcance multilingüe se limita al par declarado; no es un modelo multilingüe general.
- No se documentan capacidades de generación de código, matemáticas ni resumen.

## Casos de uso

- Traducción integrada en aplicación móvil: al ser un modelo de 75 millones de parámetros en safetensors y con tokenizadores rápidos, puede empaquetarse dentro de una app Flutter y ejecutarse con Candle en el propio dispositivo, sin conexión y sin enviar texto del usuario a un servidor.
- Traducción sin conexión en entornos con conectividad limitada: escenarios de campo, zonas rurales o desplazamientos donde no hay red, donde un modelo de unos 300 MB en fp32 (o la mitad en fp16) es viable frente a alternativas de cientos de millones o miles de millones de parámetros.
- Preprocesado y normalización de corpus: uso del traductor como paso previo en pipelines de curación de datos, alineación de corpus o generación de pares sintéticos para experimentos con el par tw-es.
- Traducción de documentación administrativa o sanitaria para consulta rápida: formularios, prospectos, avisos o guías breves donde el texto se divide en segmentos cortos y la latencia importa más que la fluidez literaria.
- Prototipado e investigación en traducción de bajos recursos: como punto de partida reproducible para comparar con modelos mayores (NLLB, M2M-100) en el par tw-es, aprovechando su tamaño reducido para experimentar en una sola GPU o en CPU.
- Despliegue en hardware de borde: Raspberry Pi, dispositivos Android de gama media o portátiles sin GPU dedicada, donde un modelo de 75 millones de parámetros cabe en memoria y puede servirse con transformers o con Candle.
- Servicio de traducción autoalojado de bajo coste: con un footprint de repositorio de 0,3 GB, es viable replicar la instancia en varios nodos ligeros o en contenedores pequeños sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de calidad de traducción (BLEU, chrF, COMET ni evaluaciones humanas), ni comparaciones con el modelo upstream, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 300 MB para los pesos en fp32 y unos 150 MB en fp16. Los cálculos son derivados del recuento real de parámetros (75.459.713); el autor no publica cifras oficiales.
- GPU recomendadas: cualquier GPU con más de 1 GB de memoria es suficiente. No se requiere A100, H100 ni tarjetas de datacenter.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso gamas antiguas), GTX, o en gráficas integradas con memoria compartida suficiente.
- Cabe en CPU: sí, es un escenario realista; el modelo es lo bastante pequeño para inferencia en CPU convencional y en dispositivos móviles.
- Opciones de despliegue documentadas por el autor: Candle mediante `marian_flutter` (inferencia en dispositivo) y `transformers` en Python. No se documentan otras rutas.
- Otras opciones de despliegue (vLLM, TGI, llama.cpp, Ollama, CTranslate2) no están documentadas en la información disponible; su uso requeriría conversiones no incluidas en el repositorio.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: el repositorio ocupa 0,3 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-tw-es | 75,46 M | no disponible | no disponible (sin benchmarks publicados) | no disponible en la ficha; remite a la del upstream (típicamente CC-BY 4.0) | safetensors, tokenizadores rápidos para Candle |
| Helsinki-NLP/opus-mt-tw-es (upstream) | 75,46 M (mismos pesos) | no disponible | no disponible en esta información | la del proyecto OPUS-MT (habitualmente CC-BY 4.0) | transformers, safetensors, tokenizador SentencePiece |
| NLLB-200-distilled-600M | 600 M | no disponible en esta información | no disponible en esta información | publicada habitualmente como CC-BY-NC 4.0 | transformers |
| M2M-100 418M | 418 M | no disponible en esta información | no disponible en esta información | publicada habitualmente como MIT | transformers |

Nota: las licencias y recuentos de los modelos alternativos se indican tal como se documentan habitualmente en sus fichas públicas; no se han verificado en el contexto de esta búsqueda y deben confirmarse antes de cualquier uso comercial. Los datos de rendimiento son "no disponible" porque no se han proporcionado métricas para ninguno de ellos.

## Limitaciones y advertencias

- No es un modelo nuevo: es un reempaquetado de `Helsinki-NLP/opus-mt-tw-es`. Cualquier limitación del modelo original se hereda sin cambios.
- Dirección única: solo traduce tw → es. No soporta la dirección inversa es → tw dentro de este repositorio.
- No hay licencia explícita en la ficha del repositorio. El autor remite a la licencia del upstream, lo que introduce incertidumbre legal si se pretende uso comercial. Hay que verificar la licencia real del modelo de Helsinki-NLP antes de desplegarlo en producción.
- Riesgo de alucinación y de errores de traducción: es un modelo de traducción neuronal sin documentación de evaluación; no se conocen sus tasas de error, su comportamiento en frases largas ni su robustez ante dominios especializados.
- Sin datos de sesgo: no se documenta ningún análisis de sesgos lingüísticos, de género ni culturales.
- Idiomas de bajos recursos: el par tw-es suele tener corpus paralelos limitados, de modo que la calidad esperable es inferior a la de pares con muchos más datos. No hay métricas en la información disponible que lo confirmen o cuantifiquen.
- Ambigüedad del código de idioma: los tags indican `tw`, pero el repositorio no aclara a qué variedad o norma lingüística corresponde exactamente ni qué ortografía se emplea. Conviene validarlo con hablantes nativos.
- Longitud de contexto no documentada: no se especifica el máximo de tokens por segmento. Textos largos deben dividirse manualmente en fragmentos.
- Sin datos de latencia ni throughput: no se puede planificar capacidad con cifras publicadas por el autor.
- Métricas de adopción nulas: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que respalde su fiabilidad.
- Compatibilidad limitada a los runtimes documentados (transformers y Candle/`marian_flutter`). No se incluyen ficheros GGUF ni conversiones para otros motores.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/malinali-app/opus-mt-tw-es
- Modelo base upstream: https://huggingface.co/Helsinki-NLP/opus-mt-tw-es
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicación Malinali: https://malinali.app

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos no guardan relación con el tema), por lo que no se incluyen enlaces adicionales de papers, blogs o demos. No se dispone de más fuentes verificables en la información proporcionada.
