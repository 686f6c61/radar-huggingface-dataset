# allensung1226/townpass-assistant-models

## Resumen

TownPass on-device assistant models es un repositorio de artefactos de inferencia (no un modelo unico) publicado por el desarrollador allensung1226 para la aplicacion movil "台北一點就通！微服務入口整合助理", una bifurcacion de la app Taipei/TownPass. El repositorio agrupa conversiones a GGUF/ggml, una cuantizacion propia y un pequeno clasificador entrenado por el autor, todos destinados a ejecutarse localmente en el telefono sin enviar audio ni texto a ningun servidor.

El contenido principal incluye una version GGUF cuantizada a q8_0 de intfloat/multilingual-e5-small (modelo de embeddings de Microsoft, 117.506.305 parametros en safetensors), un cross-encoder derivado del anterior y afinado por el proyecto para decidir a que pantalla de la app corresponde una peticion del usuario, un indice RAG con 8.121 entradas de preguntas frecuentes del Ayuntamiento de Taipei, y dos familias de reconocimiento de voz convertidas a whisper.cpp: PhoWhisper-base (vietnamita) y Breeze-ASR-26 (chino mandarin y taiwanes). El repo ocupa 3,9 GB.

Su relevancia es practica: ilustra un patron de despliegue de asistentes completamente on-device en dispositivos moviles, combinando recuperacion semantica, clasificacion de intencion y ASR con modelos pequenos y cuantizados. No obstante, la licencia es mixta ("mixed-see-table"), cada fichero tiene su propia procedencia y el autor advierte que las conversiones no estan avaladas por los autores originales, lo que limita su reutilizacion directa en produccion ajena al proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder) para e5-small y el clasificador cross-encoder; encoder-decoder tipo Whisper para los modelos ASR |
| Parametros totales | 117.506.305 (multilingual-e5-small, dato safetensors); el resto de artefactos no publica recuento |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0 (e5-small, clasificador, PhoWhisper-base, Breeze-ASR-26); q4_K y q4_0 (Breeze-ASR-26) |
| Idiomas soportados | zh (mandarin), nan (taiwanes/min nan), vi (vietnamita) |
| Licencia | mixed-see-table: MIT (e5-small y clasificador derivado), BSD-3-Clause (PhoWhisper), Apache-2.0 (Breeze-ASR-26), Open Government Data License v1.0 (datos FAQ de Taipei) |
| Formato de pesos | GGUF (llama.cpp) y ggml bin (whisper.cpp); embeddings.bin en float32 row-major |

## Arquitectura y entrenamiento

El repositorio no entrena un LLM generativo: ensambla piezas de inferencia. Por un lado, multilingual-e5-small de Microsoft, un encoder transformer de 117,5 millones de parametros orientado a embeddings de frases multilingues, convertido a GGUF y cuantizado a q8_0 para `llama-server --embedding`. Sobre esa base, el autor entrena un cross-encoder (`townpass-decision-e5-ce-v1`) que puntua una peticion del usuario contra cada pantalla de la app; el entrenamiento usa peticiones sinteticas generadas para el proyecto mas los nombres de pantalla, palabras clave y ejemplos propios de la app, excluyendo las frases de evaluacion. Es el unico fichero entrenado por el proyecto.

Para voz, se incluyen conversiones a ggml de PhoWhisper-base de VinAI (vietnamita, BSD-3-Clause) y de Breeze-ASR-26 de MediaTek Research (Apache-2.0, paper citado como Lan et al., 2026, arXiv:2603.19259), esta ultima en tres cuantizaciones: q8_0, q4_K (usada por builds anteriores al 13 de noviembre de 2026) y q4_0 (iPhone y Android con 8 GB, descrita por el autor como igual de precisa que q8_0 en su evaluacion). El indice RAG contiene 8.121 entradas de preguntas frecuentes municipales vectorizadas con e5 (384 dimensiones, float32 normalizado). La app verifica tamano y SHA-256 de cada fichero contra un manifiesto interno antes de cargarlo.

## Capacidades

- Generacion de embeddings de frases multilingues (zh, nan, vi) con e5-small cuantizado.
- Clasificacion de intencion/routing: puntua una peticion contra cada pantalla de la app para decidir la navegacion.
- Recuperacion aumentada (RAG) sobre un corpus cerrado de 8.121 FAQ del Ayuntamiento de Taipei.
- Reconocimiento automatico de voz en vietnamita (PhoWhisper-base) y en mandarin/taiwanes (Breeze-ASR-26).
- Ejecucion completamente on-device: sin envio de audio ni texto a servidores externos.
- Verificacion de integridad de los pesos mediante SHA-256 en el manifiesto de la app.
- No soporta generacion de texto libre, tool calling, agentes ni razonamiento multi-paso: la generacion la aportan modelos de terceros (Whisper tiny/small, Ministral 3B, Gemma 4 E2B) descargados de sus repositorios originales.

## Casos de uso

- Asistente municipal en movilidad: la app encadena ASR (Breeze-ASR-26 o PhoWhisper) con el clasificador de decision para llevar al usuario a la pantalla correcta del Ayuntamiento de Taipei sin salir del dispositivo.
- Preguntas frecuentes offline: el indice `faq_rag` permite responder consultas sobre tramites municipales recuperando las entradas mas proximas por similitud coseno sobre embeddings de 384 dimensiones.
- Atencion en vietnamita para residentes extranjeros: PhoWhisper-base q8_0 (81,7 MB) transcribe voz en vietnamita en telefonos de gama media.
- Despliegue en iPhone y Android de 8 GB: la cuantizacion q4_0 de Breeze-ASR-26 (888,9 MB) reduce memoria manteniendo, segun el autor, la precision de q8_0.
- Routing de bajo coste en produccion: el cross-encoder de 132 MB puede sustituir a un LLM en la tarea de decidir que modulo de la app atiende una peticion, con latencia muy inferior.
- Base para prototipos de asistentes on-device en otras administraciones: el patron (e5 + cross-encoder + RAG + whisper.cpp) es replicable con datos publicos bajo licencias abiertas.
- Auditoria de privacidad: al no salir datos del dispositivo, encaja en escenarios con requisitos de residencia de datos o normativa de proteccion de datos estricta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una evaluacion interna cualitativa segun la cual la cuantizacion q4_0 de Breeze-ASR-26 es "tan precisa como q8_0", sin cifras.

## Requisitos de hardware

- VRAM/RAM estimada: e5-small q8_0 y clasificador, unos 132 MB cada uno; PhoWhisper-base q8_0, 81,8 MB; Breeze-ASR-26 entre 888,9 MB (q4_0/q4_K) y 1.656,1 MB (q8_0); indice FAQ, 12,5 MB.
- GPU recomendadas: no aplica; el objetivo es CPU/GPU integrada de telefono. En escritorio, cualquier GPU consumer moderna (RTX 3060 o superior) ejecuta estos modelos con holgura.
- Cabe en GPU consumer: si, en cualquier RTX o equivalente, e incluso en CPU.
- Opciones de despliegue: whisper.cpp (`whisper-server`) para voz, llama.cpp (`llama-server --embedding` y `--reranking --pooling rank`) para e5 y el clasificador; los tags indican compatibilidad con endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (e5-small q8_0 + clasificador + ASR) | 117,5 M (e5) | no disponible | Embeddings, routing, ASR | Mixta (MIT/BSD-3/Apache-2.0) | Hugging Face, 193 descargas |
| intfloat/multilingual-e5-small (original) | 117,5 M | no disponible | Embeddings multilingues | MIT | Hugging Face, ampliamente usado |
| vinai/PhoWhisper-base (original) | no disponible | no disponible | ASR vietnamita | BSD-3-Clause | Hugging Face |
| MediaTek-Research/Breeze-ASR-26 (original) | no disponible | no disponible | ASR mandarin/taiwanes | Apache-2.0 | Hugging Face |

La diferencia frente a los originales es el formato (GGUF/ggml cuantizado para llama.cpp y whisper.cpp) y, en el caso del clasificador, un afinado especifico del proyecto. Los originales ofrecen pesos sin cuantizar y documentacion mas completa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce respuestas de texto libre; requiere un LLM adicional para esa funcion.
- El clasificador de decision esta entrenado solo con peticiones sinteticas y vocabulario de la app de Taipei; su generalizacion fuera de ese dominio es dudosa.
- El indice RAG cubre exclusivamente 8.121 FAQ del Ayuntamiento de Taipei; cualquier consulta fuera de ese corpus no tiene cobertura.
- Idiomas limitados a zh, nan y vi; no hay soporte documentado de castellano.
- Licencia mixta: es obligatorio respetar la licencia de cada fichero por separado, incluida la Open Government Data License v1.0 de los datos de Taipei, que impide reclamar derechos exclusivos sobre el dato derivado.
- El autor declara explicitamente que las conversiones no estan avaladas por los autores originales; no hay garantia de soporte.
- Riesgo de alucinacion en la capa generativa delegada a Ministral 3B y Gemma 4 E2B, fuera del control de este repositorio.
- Sin benchmarks publicos: no hay evidencia cuantitativa de calidad frente a alternativas.
- Proyecto con 0 likes y 193 descargas; madurez y mantenimiento no verificables.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/allensung1226/townpass-assistant-models
- App TownPass (fork): https://github.com/goodmorning1226/TownPass
- intfloat/multilingual-e5-small: https://huggingface.co/intfloat/multilingual-e5-small
- vinai/PhoWhisper-base: https://huggingface.co/vinai/PhoWhisper-base
- MediaTek-Research/Breeze-ASR-26: https://huggingface.co/MediaTek-Research/Breeze-ASR-26
- Paper citado (Lan et al., 2026): arXiv:2603.19259
- Datos FAQ de Taipei: https://data.taipei/dataset/detail?id=203f1657-bb4a-45a7-b25f-279b63136645
