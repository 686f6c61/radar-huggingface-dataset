# Sky-Kim/com.sky.sentis.qwen3-0.6b

## Resumen

Sky-Kim/com.sky.sentis.qwen3-0.6b es una conversión del modelo Qwen3-0.6B de Alibaba Qwen al formato del motor de inferencia Unity Sentis (Unity Inference Engine), empaquetada como paquete UPM instalable por Git URL. No se trata de un modelo nuevo ni de un fine-tune con datos adicionales: es una reimplementación del grafo de Qwen3-0.6B como un único grafo FP16 con caché KV explícita, orientada a ejecución on-device dentro de aplicaciones y videojuegos hechos con Unity 6000.0 o superior y `com.unity.ai.inference` 2.6.1.

El modelo resuelve un problema muy concreto: llevar generación de texto multilingüe y extracción de representaciones (hidden states) a dispositivos de consumo sin depender de un servidor. Con 0,6 mil millones de parámetros y pesos FP16, el grafo ocupa aproximadamente 1,19 GB, lo que lo hace viable en GPUs integradas y móviles de gama media-alta. Además de chat, expone los estados ocultos de 1024 dimensiones de cada token tras la normalización final o tras cualquiera de las 28 capas del decodificador, habilitando clasificadores, cabezas de intención y embeddings de frase en el propio dispositivo.

La relevancia actual radica en que cubre dos casos de uso que normalmente requieren dos modelos distintos (generación y embeddings) con una sola descarga y una API compatible con `com.sky.sentis.gemma3-270m-it`, lo que permite intercambiar ambos modelos sin cambiar el código de integración. La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 28 capas, atención causal completa con grouped-query attention (16 cabezas de query, 8 de KV de dimensión 128), QK-norm y RoPE con θ = 1e6 |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-0.6B soporta contexto nativo largo, pero la ficha no lo confirma para este paquete) |
| Tipos de cuantizacion | FP16 en los pesos del grafo exportado; no se documentan otras cuantizaciones en el paquete |
| Idiomas soportados | multilingüe (verificado en coreano, inglés y francés en las pruebas de paridad) |
| Licencia | Apache-2.0 |
| Formato de pesos | Grafo `.sentis` (serialización propietaria de Unity Sentis); el script de exportación parte de ONNX generado desde Hugging Face |
| Vocabulario | 151.669 tokens (tokenizer BPE byte-level de Qwen3) |
| Dimensión de hidden state | 1024 |
| Tamaño del repo | 1,2 GB (grafo FP16 ≈ 1,19 GB) |
| Entorno de ejecución | Unity 6000.0+, `com.unity.ai.inference` 2.6.1, backends CPU y GPUCompute |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen3-0.6B original: un transformer decoder-only denso de 28 capas con atención causal completa en todas ellas, grouped-query attention con 16 cabezas de query y 8 de clave/valor de dimensión 128, QK-norm y RoPE con theta de 1e6. La cabeza LM está atada a los embeddings (`Gemm` con `transB=1`), de modo que la matriz de embedding de 311 MB se almacena una sola vez. El grafo exportado recibe `input_ids`, `position_ids`, una máscara aditiva y las cachés KV (`past_key_values.{0..27}.key/value` con forma [1, 8, P, 128]), y devuelve los estados ocultos tras la normalización final, los estados de cada una de las 28 capas, los logits de la última posición (151.936 dimensiones) y las cachés de salida. El argmax se ejecuta en un `FunctionalGraph` separado sobre el mismo backend para leer un solo entero por token.

No se documenta en la información disponible ningún entrenamiento adicional por parte del autor de la conversión: el paquete es una exportación del modelo base Qwen3-0.6B, cuyo entrenamiento (datos, número de tokens, RLHF/DPO) no se detalla en esta ficha. La innovación técnica del paquete es de ingeniería de despliegue: grafo único FP16 con caché KV explícita, decodificación greedy token a token con streaming por callback, modo thinking híbrido controlado por un booleano (`Think`, por defecto `false`) que reproduce el comportamiento de `enable_thinking=False` de la plantilla oficial, y una ruta de embeddings con `EncodeBatch` que empaqueta varias frases en una secuencia con máscara causal en bloque diagonal y reinicia las posiciones de cada frase a 0, de forma que cada frase obtiene los mismos estados que obtendría por separado. El script `Tools~/export_qwen3.py` reconstruye el grafo ONNX desde Hugging Face con comprobaciones de paridad frente a ONNX Runtime y PyTorch.

## Capacidades

- Generación de texto multilingüe en modo chat, con decodificación greedy y streaming token a token mediante callback.
- Modo thinking híbrido de Qwen3: activable por propiedad (`Think`) o por llamada (`think: true`), con separación del razonamiento (`LastThinking`, `onThinking`) respecto a la respuesta final (`onText`).
- Extracción de hidden states de 1024 dimensiones por token, tras la normalización final o tras cualquiera de las 28 capas del decodificador.
- Embeddings de frase con pooling y cálculo de similitud entre frases (`EmbedBatch`, `Similarity`).
- Codificación por lotes de varias frases en una sola pasada (`EncodeBatch`) con resultados equivalentes a la codificación individual.
- Soporte de system prompt mediante el rol de sistema de la plantilla de Qwen (`SystemPrompt`, `ChatPrompt`).
- Continuación de prompts crudos con plantilla propia (`GenerateFromPromptAsync`).
- Tokenización integrada mediante la API de tokenización de Unity, con el tokenizer BPE de Qwen3.
- Cancelación de generación con devolución de la respuesta parcial generada hasta el momento.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Chat multilingüe embebido en videojuegos y aplicaciones Unity: el paquete permite conversaciones multi-turno con caché KV persistente entre turnos y streaming por callback, sin salir del proceso del juego ni requerir conectividad.
- Clasificación de intención on-device: usando `Encode` sobre la frase del usuario y una cabeza clasificadora entrenada sobre los estados de 1024 dimensiones, se puede enrutar comandos de voz o texto en un asistente doméstico sin enviar datos a la nube.
- Detección de comandos y similitud semántica local: `EmbedBatch` y `Similarity` permiten comparar una frase contra un conjunto de comandos canónicos ("enciende la luz", "play some music") y decidir la acción con umbrales de similitud.
- Asistente de NPC con personalidad fija: el `SystemPrompt` se convierte en mensaje de sistema de la plantilla de Qwen, de modo que cada personaje puede tener instrucciones persistentes y respuestas cortas con `maxNewTokens` bajo.
- Procesamiento de lenguaje natural en el borde para dispositivos sin GPU dedicada: el backend CPU de Sentis permite ejecutar el grafo FP16 en equipos de gama baja, útil para prototipos y validación antes de mover cargas a servidor.
- Sustitución directa de `com.sky.sentis.gemma3-270m-it`: al compartir API, un proyecto puede alternar entre ambos modelos según el presupuesto de memoria del dispositivo objetivo sin reescribir la capa de integración.
- Generación de descripciones y texto de relleno en herramientas de autoría dentro del editor de Unity, usando el modo thinking desactivado para respuestas rápidas y directas.
- Extracción de representaciones para búsqueda semántica local en catálogos pequeños o documentación de proyecto, indexando frases con `Embed` y recuperando por similitud de coseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta verificaciones de paridad: el estado oculto del último token alcanza un coseno de 1.000000 frente a PyTorch, `EncodeBatch` coincide con `Encode`, y las respuestas greedy en coreano, inglés y francés coinciden con PyTorch, tanto en el grafo FP32 como en el de pesos FP16, en los backends CPU y GPUCompute de Sentis 2.6.1. No se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,19 GB solo para los pesos FP16 del grafo, más la caché KV (28 capas × 2 × 8 cabezas × 128 dimensiones × longitud de secuencia × 2 bytes) y el estado de activaciones; el consumo real depende de la longitud de contexto utilizada.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el paquete declara compatibilidad con el backend GPUCompute de Unity Sentis, lo que cubre GPUs de escritorio y móviles compatibles con compute shaders.
- Cabe en GPU de consumo: sí, por tamaño de pesos (por debajo de 2 GB en FP16), aunque no se detallan modelos concretos ni requisitos mínimos de memoria del dispositivo.
- Opciones de despliegue: Unity Sentis 2.6.1 dentro de Unity 6000.0+, con backend CPU o GPUCompute. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.sentis` es específico de Unity.
- En builds de jugador, los ficheros `qwen3_0.6b_fp16.sentis` y `tokenizer.json` deben copiarse a `StreamingAssets/com.sky.sentis.qwen3-0.6b/` y pasarse esa carpeta a `Load`.
- Latencia y throughput: no disponibles. La model card indica decodificación de un token por frame y recomienda `WarmupAsync` para compilar los kernels de GPU una sola vez antes de la primera generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Sky-Kim/com.sky.sentis.qwen3-0.6b | 0,6 B | no disponible | `.sentis` (Unity Sentis) | Apache-2.0 | Chat + hidden states + embeddings en un solo grafo; API compatible con gemma3-270m-it |
| Qwen/Qwen3-0.6B | 0,6 B | no disponible en esta ficha | safetensors (Hugging Face) | Apache-2.0 | Modelo base original; requiere runtime de Python o servidor de inferencia |
| Sky-Kim/com.sky.sentis.gemma3-270m-it | 270 M | no disponible | `.sentis` (Unity Sentis) | no disponible en esta ficha | Alternativa de menor tamaño con API idéntica, intercambiable con este paquete |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas opciones.

## Limitaciones y advertencias

- La decodificación es greedy, no por muestreo. El propio autor advierte de que Qwen recomienda sampling en modo thinking y de que, con decodificación greedy, razonamientos largos pueden repetirse.
- El modo thinking consume cientos de tokens adicionales; con `maxNewTokens` bajo la respuesta puede truncarse antes de cerrar el bloque de razonamiento.
- El contexto máximo efectivo no se documenta en la información disponible; debe validarse empíricamente para cada caso de uso.
- El paquete depende de versiones concretas (Unity 6000.0+ y `com.unity.ai.inference` 2.6.1) y de git-lfs para la instalación por Git URL; no es un artefacto portable a otros runtimes.
- El formato `.sentis` no es compatible con ecosistemas estándar de inferencia (vLLM, llama.cpp, TGI), lo que limita su uso fuera de Unity.
- No se documentan capacidades de tool calling, agentes multi-paso, visión ni audio; no deben asumirse.
- Al ser un modelo de 0,6 B parámetros, la calidad de razonamiento y la fidelidad factual son limitadas en comparación con modelos mayores; el riesgo de alucinación es relevante en producción.
- No se documentan sesgos específicos del paquete; los sesgos del modelo base Qwen3-0.6B no se detallan en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse el fichero `LICENSE-Qwen3.txt` incluido en el paquete.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.

## Enlaces

- [Hugging Face: Sky-Kim/com.sky.sentis.qwen3-0.6b](https://huggingface.co/Sky-Kim/com.sky.sentis.qwen3-0.6b)
- [Modelo base: Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- [git-lfs](https://git-lfs.com)
- Repositorio Git del paquete: `https://huggingface.co/Sky-Kim/com.sky.sentis.qwen3-0.6b.git`
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos distintos de los enlaces anteriores.
