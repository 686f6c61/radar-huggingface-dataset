# LiquidAI/d1-Omni-2B

## Resumen

d1-Omni-2B es un modelo de decisión multimodal desarrollado por Liquid AI, construido sobre el backbone LFM3-Omni-2B. A diferencia de un modelo generativo convencional, no produce tokens: recibe un estado (texto o JSON), imágenes, vídeo, clips de audio y un conjunto de preguntas con nombre —escritas o habladas— y devuelve en un único forward pass respuestas tipadas acompañadas de sus probabilidades calibradas. Cubre clasificación, extracción de texto, números y fechas con sus spans, localización de objetos en imágenes y estimación de cantidades con intervalo.

La arquitectura es un transformer híbrido de 24 capas con 13 convoluciones cortas con compuerta (gated short convolutions), 5 capas de atención de ventana deslizante y 6 capas de atención global, con 2.166.928.384 parámetros totales y una ventana de contexto de 128.000 tokens. El audio es nativo: las preguntas habladas pasan por el mismo forward pass que el texto y las imágenes, y según el autor puntúan dentro de 0,5 puntos de las escritas en tareas no vistas.

Su relevancia actual está en la latencia y el coste: al eliminar la decodificación autorregresiva, el coste por consulta cae a milisegundos (5,8 ms por decisión en una NVIDIA H100 y 3,7 ms en una AMD MI325X; 12,4 ms y 8,2 ms respectivamente con un clip de 10 segundos), lo que lo hace apto para enrutado, monitorización y extracción estructurada a gran escala en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 híbrida, 24 capas: 13 gated short convolutions, 5 sliding-window attention, 6 global attention |
| Parametros totales | 2.166.928.384 (2,17B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | Texto: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl. Voz: los mismos excepto hindi, tailandés, vietnamita e indonesio |
| Licencia | LFM Open License v1.0 (license: other) |
| Formato de pesos | safetensors (repo de 4,4 GB, requiere custom_code / trust_remote_code) |
| Vocabulario | 128.000 tokens |
| Entrada | Estado (texto o JSON), imágenes, vídeo, clips de audio y cualquier número de preguntas con nombre, escritas o habladas |
| Salida | Respuestas tipadas con sus probabilidades (sin generación de tokens ni de voz) |
| Pipeline | audio-text-to-text |

## Arquitectura y entrenamiento

El modelo parte del backbone LFM3-Omni-2B, una arquitectura híbrida que alterna convoluciones cortas con compuerta y atención. De las 24 capas, 13 son gated short convolutions, 5 usan atención de ventana deslizante y 6 aplican atención global; esta combinación reduce el coste de cómputo y memoria frente a un transformer puramente atencional, lo que permite sostener los 128K tokens de contexto con 2,17B de parámetros. El vocabulario es de 128.000 tokens y el modelo procesa audio de forma nativa, sin un pipeline separado de ASR: las preguntas habladas entran en el mismo forward pass que texto e imágenes.

d1-Omni-2B es un checkpoint post-entrenado sobre esa base, convertido en modelo de decisión: en lugar de decodificar texto, agrega las preguntas con nombre y emite salidas tipadas con probabilidad calibrada. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO, por lo que esos datos no están disponibles. La innovación principal es la eliminación de la decodificación autorregresiva ("system-one"), que traslada el coste de la generación a un solo paso de inferencia y habilita latencias de milisegundos por decisión.

## Capacidades

- Decisión sobre texto, JSON, imágenes, vídeo y audio en un único forward pass, sin generar tokens.
- Clasificación con probabilidades calibradas, orientada a enrutado y umbralización fiable.
- Extracción de entidades: texto, números y fechas con sus spans exactos.
- Localización de objetos en imágenes y estimación de cantidades con intervalo de confianza.
- Audio nativo: preguntas habladas y clips de audio procesados en el mismo pass que el resto de modalidades, con degradación declarada de 0,5 puntos frente a preguntas escritas.
- Múltiples preguntas con nombre en una sola llamada, devolviendo una respuesta tipada por pregunta.
- Cobertura multilingüe de 16 idiomas en texto y 12 en voz.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación libre de texto: no es un modelo conversacional ni de agentes.

## Casos de uso

- Enrutado de tickets de soporte: clasificar cada mensaje entrante en una categoría con probabilidad asociada y umbralizar para derivar a un humano cuando la confianza sea baja, con latencia de milisegundos por ticket.
- Extracción estructurada de documentos: obtener importes, fechas y nombres junto con sus spans para poblar bases de datos o validar facturas, aprovechando la salida tipada en lugar de parsear texto generado.
- Monitorización de audio en contact center: procesar clips de llamadas y formular preguntas de cumplimiento o calidad directamente sobre el audio, sin transcripción intermedia, en los 12 idiomas de voz soportados.
- Verificación visual en control de calidad: localizar objetos en imágenes de línea de producción y responder preguntas binarias o de conteo con intervalo, integrable en un pipeline de inspección.
- Filtrado y moderación a escala: clasificar grandes volúmenes de contenido multimodal descartando la mayoría de casos con un único pass, y escalar solo los dudosos a un modelo generativo mayor.
- Enrutado de consultas en sistemas RAG o de agentes: decidir qué herramienta o índice corresponde a una consulta escrita o hablada antes de invocar el modelo generativo, recortando coste y latencia del pipeline.
- Extracción de datos en dispositivos de borde: al ser un modelo de 2,17B y una sola pasada, puede ejecutarse en GPUs de consumo para tareas de clasificación y extracción en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos cuantitativos aportados por el autor son de latencia: 5,8 ms por decisión en NVIDIA H100 y 3,7 ms en AMD MI325X; 12,4 ms y 8,2 ms respectivamente cuando la entrada incluye un clip de 10 segundos. También se indica que las preguntas habladas puntúan dentro de 0,5 puntos de las escritas en tareas no vistas, sin especificar la métrica ni el conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 4,3 GB solo para pesos (2,17B parámetros), con un margen práctico de 6-8 GB contando activaciones y procesadores de audio/visión. Estimación propia a partir del número de parámetros, no publicada por el autor.
- En cuantización INT8 el peso rondaría los 2,2 GB y en INT4 aproximadamente 1,1-1,5 GB; no se publican ficheros cuantizados, por lo que habría que generarlos.
- GPU de centro de datos: H100 y MI325X son las referenciadas por el autor para las cifras de latencia.
- GPU de consumo: con 2,17B de parámetros cabe en RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB) e incluso en tarjetas de 8 GB en BF16 con contexto moderado; para los 128K tokens de contexto completo el coste de KV cache crece y conviene reducir la ventana.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía soportada, dado el tag `custom_code` y el pipeline `audio-text-to-text`. No se confirma soporte de vLLM, TGI, llama.cpp ni Ollama, y no hay GGUF disponible en el repositorio.
- Latencia: 5,8 ms/decisión en H100 y 3,7 ms en MI325X según el autor; el throughput escala de forma casi lineal con el tamaño de lote al no haber decodificación autorregresiva, aunque el autor no publica cifras de batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Salida | Licencia |
|---|---|---|---|---|---|
| d1-Omni-2B | 2,17B | 128K | Texto, imagen, vídeo, audio | Respuestas tipadas con probabilidad, sin generación | LFM Open License v1.0 |
| d1-2B (LiquidAI) | No disponible en la informacion | No disponible | Texto, imagen (sin audio) | Respuestas tipadas con probabilidad | LFM Open License v1.0 |
| LFM3-Omni-2B (LiquidAI) | 2,17B (misma base) | 128K | Texto, imagen, vídeo, audio | Generación autorregresiva | LFM Open License v1.0 |

La comparación con modelos de decisión de otros fabricantes no está disponible: no se han proporcionado datos de benchmarks ni referencias a alternativas equivalentes. Frente a un LLM generativo del mismo tamaño, la diferencia operativa es el coste por consulta (una pasada frente a decenas o cientos de pasos de decodificación) y la contrapartida de no poder producir texto libre.

## Limitaciones y advertencias

- No es un modelo generativo: no redacta respuestas, no mantiene conversaciones y no emite voz. Solo responde a preguntas predefinidas con salidas tipadas.
- No soporta tool calling, function calling ni razonamiento multi-paso, por lo que no sirve como núcleo de un agente.
- La calibración de probabilidades es una promesa del autor; no se han publicado métricas de calibración (ECE, Brier) en la información disponible, así que conviene validarla en el dominio propio antes de umbralizar en producción.
- Cobertura de voz desigual: hindi, tailandés, vietnamita e indonesio están soportados en texto pero no en habla.
- No se detalla la composición del dataset de entrenamiento ni los procesos de alineación, lo que dificulta evaluar sesgos. No hay información publicada sobre sesgos conocidos.
- Riesgo de alucinación presente en las extracciones y en las estimaciones de cantidad, especialmente con audio degradado o imágenes de baja resolución; el intervalo de confianza declarado debe usarse como filtro.
- Licencia LFM Open License v1.0: es una licencia propia con condiciones, no una licencia de código abierto estándar. Es imprescindible revisar el fichero LICENSE antes de un uso comercial, ya que puede incluir umbrales de facturación o restricciones de despliegue.
- Requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del repositorio; conviene fijar una revisión concreta del modelo.
- El contexto de 128K es amplio, pero el modelo está pensado para preguntas acotadas sobre un estado; no se ha documentado su comportamiento en ventanas extremas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LiquidAI/d1-Omni-2B
- Modelo base LFM3-Omni-2B: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Versión sin audio d1-2B: https://huggingface.co/LiquidAI/d1-2B
- Blog de presentación de open d1: https://www.liquid.ai/blog/open-d1
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola / API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Colección de la familia LFM3: https://huggingface.co/collections/LiquidAI/lfm3
- Licencia: https://huggingface.co/LiquidAI/d1-Omni-2B/blob/main/LICENSE

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos no guardaban relación con el contenido de la ficha y se han descartado.
