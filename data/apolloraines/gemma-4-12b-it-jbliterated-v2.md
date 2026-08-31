# ApolloRaines/Gemma-4-12B-it-Jbliterated-v2

## Resumen

Gemma-4-12B-it-Jbliterated-v2 es un modelo de lenguaje de 12 000 millones de parámetros desarrollado por ApolloRaines, derivado de Gemma-4-12B-it de Google mediante un proceso de ablación de rechazos (abliteration) y un ajuste fino supervisado posterior. El modelo base ya había sido sometido a una ablación SVD multi-direccional para eliminar los comportamientos de rechazo de los pesos, y esta versión v2 añade una capa de reparación mediante LoRA que corrige un defecto residual: cuando el canal de razonamiento está activado, el modelo tendía a realizar revisiones de seguridad encubiertas en su cadena de pensamiento y, en una fracción de los casos, entraba en bucles que impedían generar respuesta alguna.

La relevancia de este modelo radica en que ofrece una alternativa "sin censura" de un modelo de la familia Gemma 4, manteniendo la mayor parte de la capacidad del original. Según las mediciones del autor, la tasa de clasificación de seguridad en el razonamiento se reduce del 81,2 % al 35,0 %, y la tasa de respuestas completas aumenta del 61,2 % al 78,8 %, con una caída de solo 0,88 puntos en MMLU. El modelo se distribuye en formato safetensors (bf16) y en cuantizaciones GGUF listas para usar, con una licencia Gemma que permite uso comercial bajo los términos de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención por grupos de consultas (GQA), 48 capas, tamaño oculto 3840, 16 cabezas de consulta y 8 cabezas clave/valor |
| Parametros totales | 11 959 730 224 (aprox. 12B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 (11,8 GB) y Q4_K_M (6,9 GB, con imatrix) |
| Idiomas soportados | Inglés |
| Licencia | Gemma Terms of Use (Google) |
| Formato de pesos | Safetensors (bf16) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4-12B-it, al que se le aplicó una ablación SVD multi-direccional para eliminar los vectores de rechazo de los pesos (versión v1). Sobre esa base, v2 incorpora un ajuste fino supervisado con una LoRA de rango 32 y alpha 64, aplicada a todas las proyecciones de atención y MLP, con pérdida solo sobre la finalización (el prompt queda enmascarado). El entrenamiento se realizó sobre 320 prompts propios, con objetivos reparados: en los casos donde v1 respondía correctamente, se eliminaban las líneas de clasificación de seguridad del razonamiento; en los casos donde v1 entraba en bucle, se sustituía el trace completo por uno limpio. Se usaron 3 épocas, tasa de aprendizaje 1e-4 con decaimiento coseno, y posteriormente la LoRA se fusionó en los pesos base (merge_and_unload) en bf16.

El resultado es un modelo autocontenido que carga igual que v1, pero con una cadena de pensamiento significativamente menos propensa a realizar revisiones de seguridad y a auto-sabotearse. El autor reporta que en el conjunto de evaluación (80 prompts no vistos) la tasa de espirales sin respuesta baja del 35,0 % al 21,2 %, y la tasa de respuestas completas sube al 78,8 %.

## Capacidades

- Generación de texto y conversación multi-turno en inglés, con seguimiento directo de instrucciones.
- Razonamiento con cadena de pensamiento (thinking channel) activable, con menor tendencia a clasificaciones de seguridad internas.
- Comportamiento "sin censura" (uncensored) gracias a la ablación de rechazos: responde directamente a peticiones que el modelo base rechazaría.
- Compatible con el pipeline de transformers (text-generation) y con cargas mediante trust_remote_code.
- Disponible en cuantizaciones GGUF para ejecución eficiente con llama.cpp.
- No se documentan capacidades de tool calling, visión, audio ni multilingüismo más allá del inglés.

## Casos de uso

- Asistente conversacional sin restricciones temáticas: el modelo puede mantener diálogos sobre temas que otros modelos rechazan, útil para investigación en seguridad de IA o análisis de contenido controvertido, siempre con supervisión humana.
- Generación de texto creativo y narrativo: su capacidad de seguir instrucciones directas permite redactar historias, guiones o contenido literario sin interrupciones por políticas de seguridad.
- Análisis de documentos y extracción de información: con su ventana de contexto (no especificada, pero típica de Gemma 4) puede procesar textos largos y resumir o extraer datos relevantes.
- Prototipado de chatbots para entornos controlados: en laboratorios de investigación donde se necesita un modelo que no filtre contenido por defecto, puede servir como base para experimentos de alineación.
- Evaluación de técnicas de ablación y ajuste fino: al ser un modelo abliterado y reparado, es útil como caso de estudio para comparar metodologías de eliminación de rechazos.
- Despliegue en hardware modesto: con la cuantización Q4_K_M (6,9 GB) puede ejecutarse en GPUs de 8-12 GB, lo que lo hace accesible para desarrolladores independientes que necesiten un modelo de 12B sin censura.

## Benchmarks y rendimiento

El autor proporciona resultados de evaluación propios sobre 80 prompts held-out y una submuestra estratificada de MMLU (570 ítems). No se han publicado resultados en benchmarks estándar adicionales (HumanEval, GSM8K, etc.) en la información disponible.

| Metrica | v1 (jbliterated) | v2 (+SFT) |
|---|---|---|
| Tasa de clasificación de seguridad en CoT | 81,2 % | 35,0 % |
| Tasa de auto-sabotaje (espirales sin respuesta) | 35,0 % | 21,2 % |
| Tasa de respuesta completa | 61,2 % | 78,8 % |
| Marcadores de seguridad promedio por trace | 1,65 | 0,49 |
| MMLU (570 ítems, accuracy) | 78,60 % | 77,72 % |

La caída de MMLU es de -0,88 puntos, dentro del margen de tolerancia del programa de ablación (< 1,05 puntos).

## Requisitos de hardware

- VRAM estimada: 7,4 GB para la cuantización Q4_K_M (según LLM Explorer), ~12 GB para Q8_0, y ~24 GB para los pesos bf16 completos.
- GPU recomendadas: tarjetas con 8-12 GB de VRAM (p. ej., RTX 3080, RTX 4080, RTX 4070 Ti) para la versión Q4_K_M; para bf16 se requieren GPUs de 24 GB como A100, RTX 4090 o A6000.
- El modelo cabe en GPUs de consumo con cuantización Q4_K_M, y el autor recomienda esta versión para tarjetas de 8-12 GB.
- Opciones de despliegue: llama.cpp (con builds recientes de master, ya que la arquitectura Gemma 4 Unified es nueva), transformers con device_map="auto", y la herramienta DeepswapLLM que permite ejecutar el modelo en GPUs más pequeñas de lo necesario mediante streaming de capas.
- Latencia y throughput: no se proporcionan datos específicos; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Gemma-4-12B-it (base) | ~12B | No disponible | Gemma | Modelo original con rechazos de seguridad |
| Gemma-4-12B-it-Jbliterated (v1) | ~12B | No disponible | Gemma | Ablación SVD, sin reparación del razonamiento |
| Gemma-4-12B-it-Jbliterated-v2 (este) | ~12B | No disponible | Gemma | Ablación + SFT, razonamiento reparado |

No se dispone de datos comparativos con otros modelos de 12B como Llama 3.1 8B o Mistral 7B en la información proporcionada.

## Limitaciones y advertencias

- El modelo aún presenta espirales sin respuesta en aproximadamente el 21 % de los prompts más difíciles, según el autor.
- La evaluación del razonamiento se realizó con un juez determinista basado en expresiones regulares, que puede no detectar clasificaciones de seguridad parafraseadas.
- El entrenamiento se realizó con una única semilla; la reducción de fugas de seguridad no se ha confirmado con múltiples inicializaciones.
- Al ser un modelo "uncensored", puede generar contenido inapropiado, ofensivo o peligroso. Su uso debe limitarse a entornos de investigación controlados y con supervisión humana.
- Solo soporta inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia Gemma permite uso comercial, pero está sujeta a los términos de uso de Google, que incluyen restricciones sobre usos de alto riesgo y generación de contenido dañino.
- La arquitectura Gemma 4 Unified es reciente; se requiere software actualizado (llama.cpp desde master) para cargar los GGUF correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApolloRaines/Gemma-4-12B-it-Jbliterated-v2
- Modelo base v1: https://huggingface.co/ApolloRaines/Gemma-4-12B-it-Jbliterated
- Herramienta DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Ficha en LLM Explorer: https://llm-explorer.com/model/ApolloRaines%2FGemma-4-12B-it-Jbliterated,67Qomprts2H1ISoT5kdk23
- Análisis de arquitectura (hfviewer): https://hfviewer.com/ApolloRaines/Gemma-4-12B-it-Jbliterated
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
