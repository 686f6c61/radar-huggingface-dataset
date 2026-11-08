# smdesai/d1-omni-2B-CoreAI

## Resumen

d1-Omni-2B-CoreAI es una conversión del modelo LiquidAI/d1-Omni-2B (checkpoint `4cccbfd5ba3405ee0f973134bd03e0d9d60ef1d8`) al formato Core AI de Apple, orientada a ejecución local en dispositivos iOS 27 o posteriores. El modelo original es un modelo de decisión de 2,17 mil millones de parámetros construido sobre LFM3-Omni-2B que responde preguntas tipadas sobre texto, documentos, imágenes, vídeo y audio en un único forward pass, devolviendo opciones, puntuaciones, probabilidades booleanas y cajas de imagen. No genera chat ni voz.

La relevancia de esta ficha radica en que no se trata de un modelo generativo al uso, sino de un clasificador multimodal calibrado pensado para enrutamiento, verificación y respuesta de elección cerrada. La conversión a Core AI empaqueta los pesos en 57 bundles portables `.aimodel` y 57 bundles compilados `.aimodelc` por arquitectura (h18p y h19p), con inferencia íntegramente en el dispositivo y verificación de checksums SHA-256 durante la descarga.

El repositorio tiene 7,7 GB y se distribuye bajo LFM Open License v1.0 (etiquetada como `other` en Hugging Face). Es un port independiente de smdesai, no un lanzamiento oficial de Liquid AI ni de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de decisión (base LFM3-Omni-2B), convertido a Core AI |
| Parametros totales | 2,17 mil millones |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens de decoder, procesados en chunks de 256 |
| Tipos de cuantizacion | no disponible (pesos en bf16 para embeddings; bundles `.aimodelc` compilados) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | `.aimodel` (portable) y `.aimodelc` (AOT compilado), `embed.bf16`, `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo base es LFM3-Omni-2B, un transformer multimodal de decisión de 2,17B parámetros que procesa texto, imagen y audio en un único forward pass sin decodificación autoregresiva de tokens. La conversión a Core AI segmenta el decoder en siete grafos (`seg0..seg6`), añade un grafo de atención completa (`mix`) y divide la visión en quince segmentos (`vseg0..vseg14`) con convoluciones y atenciones compartidas para 16 longitudes de parche. El audio se procesa mediante un encoder y un downsampler dedicados.

La visión opera con chunks de 512 parches y buckets de mezcla de 512 a 8.192 en pasos de 512; el audio usa chunks de 128 tokens y buckets de downsampling de 32, 64, 128, 256, 512 y 1.024 tokens. La conversión incluye limpieza de rutas personales mediante `conversion/d1_omni/strip_ship.py`, verificación estructural con `coreai-build inspect` y compilación AOT de los programas ya limpiados. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF o DPO en el material proporcionado.

## Capacidades

- Respuesta a preguntas tipadas sobre texto, documentos, imágenes, vídeo y audio en un solo forward pass.
- Salida de opciones (choices), puntuaciones calibradas, probabilidades booleanas y cajas de imagen (image boxes).
- Procesamiento conjunto de clips de vídeo y preguntas habladas en el mismo pass que texto e imágenes.
- Enrutamiento y verificación de peticiones de voz como si fueran texto tipado.
- Clasificación multimodal (tag `classification` en el repo).
- No genera chat, no genera voz, no produce texto libre.
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-step: no disponible (el modelo es de decisión en un único pass).
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutamiento de peticiones de voz en asistentes iOS: el modelo recibe el clip de audio y la pregunta hablada en el mismo pass y devuelve la categoría o el destino, sustituyendo a un clasificador separado de ASR más NLU.
- Verificación de contenido en aplicaciones de cámara: dado un frame o vídeo corto, devuelve probabilidades booleanas y cajas de imagen para decidir si se muestra un aviso o se activa una función.
- Clasificación de documentos escaneados en el dispositivo: preguntas tipadas sobre el contenido de un documento con contexto de 4.096 tokens, sin enviar datos a la nube.
- Moderación local de imágenes y vídeo: puntuaciones calibradas por clase para filtrar contenido antes de subirlo a un servicio.
- Accesibilidad en iOS: responder preguntas booleanas o de elección sobre el entorno capturado por la cámara o el micrófono, con inferencia local y sin latencia de red.
- Control por voz de bajo consumo: al no generar tokens, el coste por inferencia es menor que el de un modelo generativo equivalente, adecuado para disparadores por voz en segundo plano.
- Pre-filtrado antes de un LLM mayor: usar las puntuaciones calibradas para decidir si merece la pena invocar un modelo generativo en el servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Ejecución exclusiva en dispositivos iOS 27 o posteriores con Core AI.
- Bundles AOT específicos por arquitectura: `h18p/` y `h19p/`; es necesario confirmar la arquitectura del dispositivo con la toolchain de Core AI.
- El repositorio ocupa 7,7 GB; la app descarga únicamente los grafos de una arquitectura más los assets de host en Application Support.
- VRAM estimada: no disponible (inferencia en GPU del dispositivo, no en GPU de escritorio).
- GPU recomendadas: no disponible para escritorio; en dispositivo, las integradas en los chips correspondientes a h18p/h19p.
- Despliegue en vLLM, llama.cpp, Ollama o TGI: no soportado; el formato es Core AI (`.aimodel`/`.aimodelc`).
- Latencia y throughput: no disponibles. La selección de arquitectura no garantiza paridad de rendimiento entre dispositivos, según advierte el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| d1-Omni-2B-CoreAI | 2,17B | 4.096 tokens | texto, imagen, vídeo, audio | LFM Open License v1.0 | Core AI (`.aimodelc`) |
| LiquidAI/d1-Omni-2B | 2,17B | no disponible | texto, imagen, audio | LFM Open License v1.0 | safetensors (original) |
| LFM3-Omni-2B | no disponible | no disponible | texto, imagen, audio | no disponible | no disponible |

La comparativa con alternativas de la misma categoría (clasificadores multimodales de decisión) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera chat ni voz; solo devuelve decisiones, puntuaciones, probabilidades y cajas. No es apto para tareas generativas.
- Requiere iOS 27 o posterior y Core AI; no se puede ejecutar en otras plataformas ni en GPU de escritorio con los formatos incluidos.
- La selección de arquitectura (`h18p`/`h19p`) no garantiza paridad de comportamiento entre dispositivos; el autor lo advierte explícitamente.
- El contexto del decoder está limitado a 4.096 tokens en chunks de 256, lo que restringe documentos largos.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe.
- Riesgo de alucinación en las puntuaciones calibradas: no se han publicado métricas de calibración ni benchmarks.
- Licencia LFM Open License v1.0: es necesario revisar los términos para uso comercial; el repo la etiqueta como `other`.
- Es un port independiente, no oficial de Liquid AI ni de Apple; la atribución y los avisos están en `NOTICE` y `provenance.json`.
- Los binarios AOT se compilan a partir de programas limpiados, pero la verificación estructural no constituye una medición de paridad en dispositivo.
- Sesgos conocidos: no disponible.

## Enlaces

- Hugging Face: https://huggingface.co/smdesai/d1-omni-2B-CoreAI
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- Documentación Liquid AI: https://docs.liquid.ai/lfm/models/d1-omni-2b
