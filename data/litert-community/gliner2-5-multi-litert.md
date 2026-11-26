# litert-community/GLiNER2.5-Multi-LiteRT

## Resumen

GLiNER2.5-Multi-LiteRT es la conversión a formato LiteRT (TFLite) del modelo fastino/gliner2.5-multi-v1, un extractor de entidades nombradas (NER) e información estructurada basado en la arquitectura GLiNER2 con encoder mDeBERTa-v3-base. El modelo original lo desarrolla Fastino, y esta versión la mantiene la comunidad litert-community para su despliegue en dispositivos Android mediante la GPU y, opcionalmente, la NPU Hexagon de Qualcomm. Resuelve el problema de la extracción de entidades zero-shot: el usuario define el esquema de etiquetas en el propio prompt y el modelo devuelve los spans correspondientes sin reentrenamiento.

La relevancia de esta conversión es que traslada un modelo de extracción de información de 278M de parámetros a un formato ejecutable en móvil con aceleración GPU, manteniendo equivalencia numérica exacta con la implementación oficial en fp32 en todas las entradas que caben en la ventana del grafo (span F1 1.000 en los conjuntos de prueba reportados). Se distribuyen tres tamaños de ventana (128, 256 y 512 tokens) para ajustar capacidad y latencia.

El modelo está pensado para inglés y japonés, con soporte multilingüe declarado pero sin detector de idioma integrado: el host debe elegir el splitter (whitespace o char) de forma explícita. La licencia es Apache 2.0 y los pesos se distribuyen en ficheros .tflite junto con embeddings y decodificador disperso en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder mDeBERTa-v3-base + boundary encoder + boundary query head + proyecciones por token (parte densa del BoundaryExtractor de GLiNER2) |
| Parametros totales | no disponible (el repositorio ocupa 3.0 GB; el encoder base es mDeBERTa-v3-base, ~278M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de 128, 256 y 512 tokens de entrada; slots de texto procesado de 48, 192 y 384 respectivamente |
| Tipos de cuantizacion | pesos float16 (wfp16) y float32 (fp32); entrada/salida siempre float32; embeddings en fp16 o fp32 |
| Idiomas soportados | multilingüe, inglés, japonés (splitter whitespace para inglés, char para CJK) |
| Licencia | Apache 2.0 |
| Formato de pesos | .tflite (LiteRT), word_embeddings en .bin (fp16/fp32), decodificador en .safetensors |

## Arquitectura y entrenamiento

El grafo LiteRT contiene únicamente la parte densa del BoundaryExtractor original: el encoder mDeBERTa-v3-base, el boundary encoder, la boundary query head y las proyecciones por token. La entrada son filas de word embeddings y la salida es un tensor float32 empaquetado con 17 salidas lógicas. El host se encarga de tokenizar, construir la entrada y, tras la inferencia, ejecutar el decodificador disperso original (16 tensores en safetensors, 860.676 bytes) para producir los spans finales.

La conversión se realizó con LiteRT Torch y se validó contra la implementación oficial gliner2 en fp32. En los tres tamaños de ventana, los spans coinciden exactamente en todas las entradas bilingües que caben (70, 75 y 80 entradas; span F1 1.000). La NPU Hexagon del dispositivo de prueba coincidió en 69/70, 72/75 y 77/80 conjuntos de spans, por lo que no se ofrece como ruta soportada. No se dispone de información sobre el dataset de entrenamiento original, número de tokens ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Extracción de entidades nombradas zero-shot: el esquema de etiquetas se define en el prompt (el ejemplo del autor usa persona, organización, ubicación, producto y fecha).
- Extracción de información estructurada mediante spans sobre texto en inglés y japonés.
- Soporte multilingüe declarado, con elección manual del splitter por petición (whitespace o char); no hay detector de idioma.
- Ejecución en dispositivo con aceleración GPU mediante LiteRT y precisión de cómputo FP32 explícita.
- Tres ventanas de capacidad (128/48, 256/192, 512/384) con rechazo de entradas que exceden la ventana en lugar de truncarlas.
- No se documentan tool calling, function calling, agentes, modo thinking, visión ni audio.

## Casos de uso

- Extracción de entidades en aplicaciones Android offline: el modelo se ejecuta con LiteRT sobre la GPU del teléfono y permite detectar personas, organizaciones y fechas en notas o mensajes sin enviar datos a un servidor, con ventanas de 128 tokens para entradas cortas.
- Procesamiento de formularios y correos en inglés: usando el splitter whitespace y la ventana de 512 tokens (384 slots de texto) se pueden extraer campos como empresa, producto y fecha de documentos de longitud media en un pipeline local.
- Análisis de texto japonés: con el splitter char, cada carácter no espacio ocupa un slot, lo que permite procesar frases CJK y extraer entidades en aplicaciones de mensajería o CRM niponas.
- Enriquecimiento de datos en el borde (edge): integrado en una app de captura de contactos, el modelo etiqueta nombres y organizaciones en el propio dispositivo antes de sincronizar, reduciendo el volumen enviado a la nube.
- Indexación y búsqueda semántica local: la extracción de entidades en el dispositivo permite construir índices por entidad sobre notas personales sin salir del terminal.
- Prototipado de esquemas NER personalizados: al ser zero-shot, se pueden probar distintos conjuntos de etiquetas modificando el prompt, sin reentrenar, para validar un esquema antes de invertir en un modelo supervisado.
- Cumplimiento y privacidad: al ejecutarse en el dispositivo con pesos Apache 2.0, encaja en escenarios donde el texto no puede abandonar el terminal, como datos sanitarios o legales.

## Benchmarks y rendimiento

| Prueba | Ventana 128 (70 entradas) | Ventana 256 (75 entradas) | Ventana 512 (80 entradas) |
|---|---|---|---|
| GPU FP32 (soportado) | span F1 1.000 | span F1 1.000 | span F1 1.000 |
| NPU Hexagon (no soportado) | 69/70 conjuntos de spans | 72/75 conjuntos de spans | 77/80 conjuntos de spans |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos anteriores son de equivalencia numérica frente a la implementación oficial, no de calidad absoluta en un corpus público.

## Requisitos de hardware

- Tamaño de los grafos: 191,9 MB (ventana 128, wfp16), 211,2 MB (256) y 250,2 MB (512); las versiones fp32 ocupan 364,0 MB, 383,3 MB y 422,4 MB respectivamente.
- Embeddings: 384,2 MB en fp16 o 768,3 MB en fp32, más 860.676 bytes del decodificador disperso.
- VRAM/RAM estimada: no disponible de forma oficial; por el tamaño de los ficheros, se necesita al menos ~0,6 GB en fp16 (grafo + tabla de embeddings) y ~1,2 GB en fp32.
- Dispositivo validado: Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16) con LiteRT 2.2.0 y cómputo GPU FP32 explícito.
- GPU de escritorio: el ejemplo de Python se ejecuta en CPU de escritorio con ai_edge_litert; no se documentan requisitos de GPU de escritorio ni modelos concretos (A100, H100, RTX 4090).
- Despliegue: LiteRT (CompiledModel) en Android y Python; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLiNER2.5-Multi-LiteRT | no disponible (repo 3,0 GB) | ventanas 128/256/512 | .tflite + safetensors | Apache 2.0 | Conversión móvil validada contra fp32; solo en/ja con splitter explícito |
| fastino/gliner2.5-multi-v1 | no disponible | no disponible | safetensors (checkpoint original) | Apache 2.0 | Modelo de referencia; requiere entorno PyTorch |
| GLiNER (versión base, familia original) | no disponible | no disponible | safetensors | Apache 2.0 | NER zero-shot; sin datos de comparación en la información disponible |

No se dispone de datos de rendimiento comparativo con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo se soportan inglés y japonés de forma validada; el soporte multilingüe es declarado pero sin detector de idioma, y el texto mixto exige elección manual del splitter.
- Las entradas que exceden la ventana se rechazan, no se truncan; el host debe elegir la ventana adecuada o trocear el texto.
- La precisión de cómputo debe solicitarse explícitamente como FP32 en la GPU; con la precisión por defecto una de cada 70 salidas cambia.
- La ruta NPU Hexagon no está soportada y no coincide en todos los casos con la referencia.
- El texto que termina en `。` consume un slot extra porque el procesador añade un punto final.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un extractor de spans, el riesgo principal es la asignación incorrecta de límites de entidad en textos ambiguos.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- El pipeline requiere componentes de host (tokenizer, embeddings, decodificador disperso) que no están incluidos en el .tflite; un despliegue incompleto produce resultados incorrectos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/GLiNER2.5-Multi-LiteRT
- Modelo base: https://huggingface.co/fastino/gliner2.5-multi-v1
- LiteRT (Google AI Edge): https://github.com/google-ai-edge/litert
- Paper de referencia: arxiv:2507.18546
