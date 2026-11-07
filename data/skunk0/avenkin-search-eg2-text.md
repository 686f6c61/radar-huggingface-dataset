# Skunk0/avenkin-search-eg2-text

## Resumen

avenkin-search-eg2-text es la conversión a Core ML del codificador de texto de EmbeddingGemma 2, el modelo de embeddings de Google basado en la familia Gemma 2. Lo publica el desarrollador Skunk0 como componente de infraestructura para la aplicación iOS Avenkin, un asistente de IA privado que ejecuta parte de su procesamiento en el dispositivo. No se trata de un modelo generativo: es un encoder que transforma texto en vectores densos de 768 dimensiones para búsqueda semántica y similitud de frases.

El interés técnico del artefacto está en su empaquetado: pesos cuantizados a int8, formato ML Program de Core ML, entradas de longitud variable hasta 512 tokens y una salida ya agregada (mean pooling sobre tokens y normalización L2), de modo que el consumidor no necesita implementar esas operaciones. El autor documenta verificaciones de fidelidad frente al encoder de referencia en float32, con una similitud coseno mínima de 0,99977 sobre 329 frases de prueba.

Es relevante para quien necesite búsqueda semántica local en iOS sin depender de la nube: el modelo ocupa 0,3 GB en el repositorio y, cargado en un iPhone Air, consume unos 167 MB de memoria con una latencia de aproximadamente 40 ms por consulta corta en CPU. La licencia Apache 2.0 y la disponibilidad del tokenizador original facilitan su reutilización fuera de la app para la que fue creado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (EmbeddingGemma 2, base google/embeddinggemma-2), convertido a Core ML ML Program |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (L de 1 a 512 en las entradas del modelo) |
| Tipos de cuantización | int8 en pesos; ejecución recomendada en float32 (float16 degrada los vectores) |
| Idiomas soportados | no disponible (las pruebas incluyen ocho frases en otros idiomas y escrituras, sin listado oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` (ML Program); tokenizador en `tokenizer.json` y `tokenizer_config.json` |
| Dimensión de salida | 768 (con truncado admitido a 512, 256 o 128 y renormalización) |
| Entradas | `input_ids` (int32, 1 × L) y `attention_mask` (float32, 1 × L, 1 = token) |
| Salida | `embedding` (float32, 1 × 768), mean-pooled y normalizada L2 |
| Tamaño del repositorio | 0,3 GB |
| Librería | coreml |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento nuevo. La arquitectura subyacente es el codificador de texto de EmbeddingGemma 2 de Google, un transformer encoder orientado a producir representaciones densas de frases y pasajes. La conversión a Core ML aplica cuantización int8 a los pesos y expone una interfaz simplificada: el consumidor entrega identificadores de token y máscara de atención, y recibe directamente el vector agregado y normalizado, sin necesidad de replicar el pooling ni la normalización.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del corpus ni si el modelo base empleó RLHF o DPO; esos datos corresponden a la model card de google/embeddinggemma-2 y no se incluyen en la información proporcionada. La innovación destacable de este artefacto es la ingeniería de despliegue: pesos int8 con pérdida de fidelidad mínima respecto a la referencia float32 (coseno mínimo 0,99977, mediana 0,99987, sin NaN en 329 frases), tokenizador verificado con `swift-transformers` sobre el mismo conjunto, y una advertencia explícita contra ejecutar en float16, que en el Neural Engine desplaza todos los vectores (coseno mediano de 0,978 frente a la referencia).

## Capacidades

- Generación de embeddings de texto para similitud de frases y búsqueda semántica (pipeline `sentence-similarity`).
- Codificación de consultas y pasajes con prefijos específicos: `task: search result | query: ` para preguntas y `title: none | text: ` para pasajes.
- Salida de 768 dimensiones con soporte de truncado a 512, 256 o 128 dimensiones previa renormalización, útil para reducir coste de almacenamiento e índice.
- Procesamiento de secuencias de 1 a 512 tokens con máscara de atención.
- Ejecución en dispositivo en iOS mediante Core ML, en CPU.
- Tokenización compatible con el modelo base, incluyendo tokens especiales `<bos>` y `<eos>`.
- No soporta tool calling, razonamiento multi-paso, agentes, visión ni audio: es exclusivamente un encoder de texto.

## Casos de uso

- Búsqueda semántica local en aplicaciones iOS: el modelo indexa notas, documentos o mensajes del usuario y responde a consultas en lenguaje natural sin enviar datos a un servidor, con unos 40 ms por consulta en un iPhone Air.
- Asistente personal con memoria en el dispositivo: Avenkin puede recuperar fragmentos relevantes del historial del usuario mediante similitud coseno sobre embeddings de 768 dimensiones generados localmente.
- Deduplicación y agrupación de contenido: calcular embeddings de pasajes y agrupar por similitud para eliminar entradas repetidas en bases de conocimiento personales.
- Filtrado previo en pipelines RAG híbridos: usar el encoder en el dispositivo para descartar candidatos antes de consultar un índice remoto, reduciendo tráfico y coste.
- Clasificación zero-shot por prototipos: comparar el embedding de un texto con embeddings de etiquetas descriptivas para categorizar correos, tickets o notas sin entrenamiento adicional.
- Detección de similitud entre idiomas o escrituras: las pruebas del autor incluyen frases en otros idiomas y alfabetos, lo que permite explorar recuperación cross-lingüe, aunque sin garantías documentadas de cobertura.
- Indexación de bajo consumo en wearables y auriculares: el reducido uso de memoria (unos 167 MB con el modelo cargado) y la ejecución en CPU lo hacen viable en dispositivos con Neural Engine limitado o con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, MTEB u otros) en la información disponible. El autor sí documenta verificaciones de fidelidad y rendimiento en dispositivo:

| Métrica | Resultado |
|---|---|
| Similitud coseno mínima frente a referencia float32 (329 frases) | 0,99977 |
| Similitud coseno mediana frente a referencia float32 | 0,99987 |
| Valores NaN en las pruebas | ninguno |
| Similitud coseno mediana en float16 (Neural Engine) | 0,978 |
| Latencia de consulta corta en iPhone Air (iOS 27.2, CPU) | ~40 ms en caliente |
| Memoria con el modelo cargado | ~167 MB |
| Coincidencia del tokenizador con la referencia | 329 de 329 frases |

## Requisitos de hardware

- VRAM estimada: no aplica directamente; el modelo está pensado para ejecución en dispositivo. En un iPhone Air el consumo reportado es de aproximadamente 167 MB con el modelo cargado.
- GPU recomendadas: no se documentan; el autor indica ejecución en CPU. El Neural Engine (float16) no es recomendable por la degradación de los embeddings.
- Cabe en hardware de consumo: sí, en iPhone y previsiblemente en Mac con Apple Silicon mediante Core ML; no hay datos publicados para GPU NVIDIA.
- Opciones de despliegue: Core ML (formato nativo del artefacto) y `swift-transformers` para el tokenizador. No se proporcionan conversiones a GGUF, ONNX ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~40 ms por consulta corta en caliente en iPhone Air; no se publica throughput para lotes ni para otras plataformas.

## Comparativa con modelos similares

| Modelo | Tipo | Dimensión de salida | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| avenkin-search-eg2-text | Encoder de texto (Core ML, int8) | 768 (truncable a 512/256/128) | 512 tokens | `.mlpackage` | Apache 2.0 | Optimizado para iOS en CPU; fidelidad verificada frente a float32 |
| google/embeddinggemma-2 | Encoder de texto (modelo base) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Referencia float32 de la que deriva este artefacto |
| Alternativas de embeddings para búsqueda semántica | no disponible | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de otros modelos comparables |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona, no ejecuta herramientas ni procesa imágenes o audio.
- La ejecución en float16, que es la que usa el Neural Engine, degrada los embeddings (coseno mediano de 0,978 frente a la referencia); el autor recomienda CPU en float32.
- El truncado de dimensiones a 512, 256 o 128 exige renormalizar los vectores; omitirlo altera las distancias coseno.
- Los prefijos de consulta y pasaje son obligatorios para el uso previsto; usarlos de forma inconsistente puede degradar la recuperación.
- No hay listado oficial de idiomas soportados ni evaluación multilingüe publicada; las pruebas incluyen solo ocho frases en otros idiomas y escrituras.
- No se han publicado benchmarks de calidad de recuperación (MTEB u otros), por lo que el rendimiento semántico debe validarse en el dominio de uso.
- Riesgo de sesgo y alucinación heredado del modelo base: no se documentan evaluaciones de sesgo en la información disponible.
- Licencia Apache 2.0, que permite uso comercial; el repositorio incluye un fichero `NOTICE` que detalla los cambios respecto al original y debe conservarse.
- El artefacto está atado al ecosistema Apple (Core ML); su uso fuera de iOS o macOS requiere conversión adicional no incluida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Skunk0/avenkin-search-eg2-text
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Sitio de Avenkin: https://avenkin.com/
