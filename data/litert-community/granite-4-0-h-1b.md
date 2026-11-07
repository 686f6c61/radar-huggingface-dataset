# litert-community/granite-4.0-h-1b

## Resumen

`litert-community/granite-4.0-h-1b` es la conversión al formato LiteRT-LM (`.litertlm`) del modelo `ibm-granite/granite-4.0-h-1b` de IBM, publicada por la comunidad LiteRT (la organización que agrupa los modelos listos para el runtime on-device de Google, antes conocido como TensorFlow Lite). El objetivo no es ofrecer un modelo nuevo, sino empaquetar los pesos originales de IBM en un grafo ejecutable por LiteRT-LM en dispositivos móviles y de borde, con delegación completa a GPU en Android (OpenCL sobre Mali) y en Apple (Metal).

La relevancia técnica del artefacto está en que, según el autor, es el primer LLM híbrido Mamba2 servido por el runtime LiteRT-LM publicado y, desde la actualización del 2026-08-13, el primero que ejecuta su selective scan en una GPU móvil. La arquitectura de IBM combina 36 capas Mamba2 con 4 capas de atención con grouped-query attention, de modo que solo esas 4 capas mantienen KV cache (con un presupuesto de 4096 tokens) y el resto usa estado recurrente de tamaño constante.

El fichero publicado es una única variante `int8` de 1,68 GB, con cuantización dinámica en capas lineales y embedding mientras convoluciones y selective scan permanecen en coma flotante. Requiere litert-lm ≥ 0.15 y está pensado para inferencia local en teléfonos, no para servidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2 (selective scan) + atención GQA; 36 capas Mamba2 y 4 capas de atención |
| Parametros totales | clase 1B/1.5B (cifra exacta no disponible en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens de presupuesto KV en las 4 capas de atención; el resto del estado es constante |
| Tipos de cuantizacion | int8 dinámica en lineales y embedding; convs y selective scan en float |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors en `ibm-granite/granite-4.0-h-1b` |

## Arquitectura y entrenamiento

El modelo base de IBM emplea una arquitectura híbrida en la que los bloques Mamba2 (selective-scan) se intercalan con un número reducido de bloques de atención con grouped-query attention. En esta variante de clase 1B/1.5B la proporción es de 36 capas Mamba2 frente a 4 de atención. La consecuencia práctica es que las capas Mamba2 mantienen un estado recurrente de convolución y SSM de tamaño constante por capa en lugar de una KV cache que crece con el contexto, por lo que el consumo de memoria se mantiene casi plano respecto a la longitud de la secuencia; solo las 4 capas de atención acumulan KV, con un presupuesto declarado de 4096 tokens.

La conversión a LiteRT-LM se rehizo el 2026-08-13 reexpresando el selective scan como productos matriciales por lotes, con todos los tensores de rango ≤ 4 y sin intermedios de broadcast gigantes. Según el autor, esto produjo dos efectos medidos con el mismo protocolo y máquina: la decodificación en CPU pasó de 11,4 a 39,2 tok/s (aproximadamente 3,5×) y el grafo pasó a delegarse por completo a la GPU, verificado en macOS (Metal), iPhone 17 Pro (Metal) y Pixel 8a (Arm Mali, OpenCL). La ejecución en GPU exige activaciones en fp32, que el bundle declara. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni las etapas de RLHF o DPO del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto autoregresiva en formato de chat, con plantilla de chat incluida en el bundle.
- Razonamiento aritmético básico y respuesta a preguntas de cultura general, verificado en una puerta de sanidad de 8 preguntas.
- Tool calling / function calling: desde el reempaquetado del 2026-10-14 (solo metadatos, con `llm_model_type qwen2p5`) el runtime analiza la llamada a herramienta y la plantilla de chat renderiza los resultados de herramienta.
- Ejecución on-device con delegación completa a GPU en Android (OpenCL) y Apple (Metal), y ejecución en CPU.
- Estado recurrente de tamaño constante, lo que permite conversaciones largas con memoria casi plana.
- Capacidades multilingües: no disponible en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistentes de texto embebidos en aplicaciones Android: el bundle se integra mediante `com.google.ai.edge.litert:litert` y se ejecuta con delegación OpenCL completa en un Pixel 8a, sin conexión de red ni coste por token de API.
- Funciones de resumen y reescritura dentro de una app iOS: con el grafo delegado a Metal en iPhone 17 Pro, el modelo procesa prompts cortos localmente y evita enviar texto del usuario a servidores externos.
- Agentes locales con tool calling: la plantilla de chat renderiza resultados de herramienta y el runtime parsea la llamada, lo que permite encadenar consultas a APIs locales (calendario, contactos, ficheros) en un flujo de varios pasos sobre el dispositivo.
- Respuesta a preguntas sobre documentos de hasta 4096 tokens: el presupuesto KV de las 4 capas de atención acota el contexto útil, adecuado para correos, notas o fichas técnicas de longitud media.
- Clasificación y extracción de información en pipelines de borde: al mantener memoria casi plana con la longitud, se pueden procesar muchos textos cortos en un mismo dispositivo sin que la huella crezca por petición, reiniciando el Engine entre conversaciones.
- Prototipado e investigación de arquitecturas híbridas Mamba2: al ser, según el autor, el primer LLM híbrido Mamba2 servido por LiteRT-LM, sirve como banco de pruebas para medir latencia y delegación de operadores en hardware móvil real.
- Aplicaciones de privacidad estricta (sanidad, finanzas personales): la inferencia ocurre íntegramente en el dispositivo con pesos Apache 2.0, sin dependencia de un proveedor cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K completos) en la información disponible. Los únicos datos medidos que aporta el autor son los siguientes:

| Metrica | Valor | Contexto |
|---|---|---|
| Puerta de sanidad (8 preguntas) | 7/8 en CPU y GPU | Mac, litert-lm 0.15.0 y 0.16.0, tras el fix de metadatos del 2026-08-28; el fallo es `17 + 25` respondido como `43` |
| Puerta de sanidad, fichero previo al fix | 8/8 | respondía `42` a `17 + 25` |
| GSM8K (50 preguntas, comparación de dos ficheros) | coinciden en 40, discrepan en 10 (6 a favor del fichero antiguo) | el autor lo califica de ruido con ese tamaño de muestra |
| Decodificación en CPU | 11,4 → 39,2 tok/s | tras la reconversión del 2026-08-13, misma máquina y protocolo |
| Fidelidad del export float frente a PyTorch | max\|diff logits\| ≤ 1,1e-4 por posición, correlación 1.000000, top-1 y top-5 idénticos | decodificación teacher-forced de 8 pasos |
| Delegación de operadores en Pixel 8a | 0 operadores rechazados, todos los subgrafos delegados a OpenCL | verificado end-to-end |

## Requisitos de hardware

- Tamaño del fichero publicado: 1,68 GB (`granite-4.0-h-1b_int8.litertlm`); el repositorio completo ocupa 6,7 GB.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; el autor advierte que la ejecución en GPU requiere activaciones fp32 y que ello tiene un coste de memoria que no cuantifica en la información disponible.
- GPU validadas: Arm Mali con OpenCL (Pixel 8a), Apple Metal (macOS e iPhone 17 Pro).
- CPU: soportada y validada; 39,2 tok/s de decodificación en Mac tras la reconversión.
- No cabe plantearse A100, H100 o RTX 4090: el bundle está orientado a dispositivos de borde y el runtime es LiteRT-LM, no vLLM ni TGI.
- Opciones de despliegue: exclusivamente LiteRT-LM ≥ 0.15 (validado en 0.15.0 y 0.16.0; las notas de comportamiento se refieren a 0.18.0 y 0.19.1). No hay soporte documentado para llama.cpp, Ollama, vLLM ni TGI con este fichero.
- Latencia y throughput: 39,2 tok/s en decodificación CPU en Mac; no se publican cifras de throughput en GPU móvil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| `litert-community/granite-4.0-h-1b` | clase 1B/1.5B | 4096 tokens KV (4 capas de atención) | `.litertlm`, LiteRT-LM | Apache 2.0 | Híbrido Mamba2 + GQA, int8, 1,68 GB, delegación GPU móvil |
| `ibm-granite/granite-4.0-h-1b` | clase 1B/1.5B | no disponible | safetensors, PyTorch | Apache 2.0 | Modelo base de referencia; requiere stack de servidor o GPU de escritorio |
| `litert-community/Qwen3-4B` | 4B | no disponible | `.litertlm`, LiteRT-LM | no disponible en la información | Alternativa del mismo catálogo LiteRT, mayor tamaño y presumiblemente mayor huella |
| Modelos Gemma de la familia LiteRT | no disponible | no disponible | `.litertlm`, LiteRT-LM | no disponible en la información | Mismo runtime y mismo público objetivo on-device |

## Limitaciones y advertencias

- La puerta de sanidad del fichero publicado es 7/8, no 8/8: falla `17 + 25` respondiendo `43`. Es un fallo aritmético elemental y debe tenerse en cuenta en cualquier uso que dependa de cálculo exacto.
- El autor reconoce que el fix de metadatos del 2026-08-28 alteró la decodificación greedy: eliminar el `start_token` que anteponía `<|end_of_text|>` cambió respuestas en empates cercanos. Las puntuaciones medidas sobre el fichero anterior no se trasladan automáticamente.
- Bug de runtime documentado: en litert-lm 0.18.0, crear una nueva Conversation sobre un Engine que ya ejecutó otra reutiliza el estado recurrente de la conversación previa y no lo reinicia (issue #3165). La recomendación es crear un Engine nuevo por conversación. El fix existe en main desde el 2026-11-03 (commit e1f86b05, continuación del PR #3945) pero ninguna release lo incorpora, incluida v0.19.1.
- La prueba de este bug no pudo completarse sobre el fichero `_int8`: en el Engine nuevo la pregunta sobre la capital devolvió una respuesta vacía en ambas ejecuciones, por lo que la comparación no se realizó.
- Presupuesto de contexto limitado a 4096 tokens en las 4 capas de atención; más allá de ese límite el modelo no mantiene KV de esas capas.
- La ejecución en GPU exige activaciones fp32, con coste de memoria no cuantificado en la documentación.
- Idiomas soportados no documentados; no se puede asumir calidad en castellano sin evaluación propia.
- Riesgo de alucinación y sesgos: no se publica ninguna evaluación al respecto en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto depende del runtime LiteRT-LM y de sus versiones; fijar la versión del runtime es imprescindible en producción.
- El repositorio pesa 6,7 GB frente a los 1,68 GB del fichero int8: conviene descargar solo el fichero necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/granite-4.0-h-1b
- Árbol de ficheros: https://huggingface.co/litert-community/granite-4.0-h-1b/tree/main
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-4.0-h-1b
- Organización LiteRT Community: https://huggingface.co/litert-community
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue del bug de Conversation/Engine: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Pull request relacionado: https://github.com/google-ai-edge/LiteRT-LM/pull/3945
- Commit del fix en main: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Medición de LiteRT en Android (Galaxy S26): https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
