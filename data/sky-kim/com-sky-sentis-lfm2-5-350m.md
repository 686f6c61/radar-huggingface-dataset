# Sky-Kim/com.sky.sentis.lfm2.5-350m

## Resumen

`com.sky.sentis.lfm2.5-350m` es un paquete de despliegue para Unity del modelo LFM2.5-350M de LiquidAI, convertido al motor de inferencia Unity Inference Engine (Sentis). No se trata de un modelo nuevo entrenado desde cero, sino de una exportación del modelo base a un formato consumible desde Unity (un grafo ONNX con pesos FP16 y tokenizador BPE), empaquetado como paquete UPM instalable por URL de Git. El autor del paquete es Sky-Kim y el modelo subyacente pertenece a LiquidAI.

El modelo base LFM2.5-350M es un transformer híbrido de 350 millones de parámetros que combina 10 bloques de convolución corta con compuertas y 6 bloques de atención con grouped-query attention. La exportación expone tanto el estado de convolución como la caché KV como entradas y salidas explícitas del grafo, lo que permite decodificación token a token sin bucles internos. El paquete pesa aproximadamente 0,7 GB e incluye pesos FP16 de unos 709 MB.

Su relevancia radica en que habilita inferencia en dispositivo dentro de Unity (CPU y GPUCompute) con generación de texto multilingüe y extracción de estados ocultos para clasificadores, cabezas de intención y embeddings de frases. Está pensado para aplicaciones interactivas, agentes locales y prototipos de IA en el motor de videojuegos, no para servidores de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 10 bloques de convolución corta con compuertas (kernel 3, depthwise causal) + 6 bloques de atención con grouped-query attention (16 cabezas Q, 8 cabezas KV de 64, QK-norm, RoPE θ = 1e6) |
| Parametros totales | 350M (modelo base LFM2.5-350M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; el paquete limita lotes a 512 filas × columnas (`BatchTokens`) |
| Tipos de cuantizacion | Pesos FP16 en el paquete exportado; no se documentan otras cuantizaciones |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt |
| Licencia | LFM Open License v1.0 (lfm1.0), etiquetada como "other" en Hugging Face |
| Formato de pesos | Grafo `.sentis` (exportado desde ONNX) con pesos FP16; tokenizador `tokenizer.json` (BPE byte-level, 65.536 tokens) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que alterna bloques de convolución corta y bloques de atención. Cada bloque convolucional aplica `in_proj` que genera las compuertas B, C y la señal x, seguido de una convolución causal depthwise de kernel 3 sobre la concatenación del estado previo y la señal, y finaliza con `out_proj`. Los bloques de atención usan 16 cabezas de consulta y 8 cabezas KV de dimensión 64, con normalización QK y RoPE de theta 1e6. La cabeza LM está atada a los embeddings y se almacena una sola vez, aplicando `Gemm(transB=1)`.

La exportación a Sentis expone explícitamente las cachés: `past_conv.{i}` con forma [B, 1024, 2] para los bloques convolucionales y `past_key_values.{i}.key/value` con forma [B, 8, P, 64] para los de atención. Las salidas incluyen `hidden` [B, T, 1024] tras la normalización final, `layer.{1..16}` con el flujo residual tras cada bloque, y `logits` [B, 1, 65536] solo para la última posición. El script `export_lfm2.py` verifica paridad exacta con transformers (diferencia máxima 0) y con ONNX Runtime en estados ocultos, codificación por lotes con padding derecho y generación greedy en coreano, inglés y francés, tanto en FP32 como en FP16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. El paquete no incluye modo de razonamiento (thinking mode).

## Capacidades

- Generación de texto multilingüe en 9 idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano, español y portugués).
- Decodificación greedy token a token con caché de convolución y caché KV, transmitida por callback en streaming.
- Extracción de estados ocultos de 1024 dimensiones tras la normalización final o tras cualquiera de los 16 bloques, para clasificadores, cabezas de intención y embeddings de frases en dispositivo.
- Codificación por lotes con padding derecho (`EncodeBatch`), con hasta 512 filas × columnas, manteniendo causalidad en atención y convoluciones.
- Cálculo de similitud entre embeddings (`EmbedBatch` y `Similarity`).
- Plantilla de chat ChatML con rol de sistema (`SystemPrompt`), token de inicio `<|startoftext|>`.
- API compatible con `com.sky.sentis.gemma3-270m-it` y `com.sky.sentis.qwen3-0.6b`.
- No dispone de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento.

## Casos de uso

- Asistentes conversacionales dentro de aplicaciones Unity: el paquete permite generar respuestas multilingües en dispositivo con streaming por callback, adecuado para NPCs o interfaces de chat sin conexión a servidor.
- Clasificación de intenciones en dispositivo: usando `Encode` o `EmbedBatch` sobre los estados ocultos de 1024 dimensiones, se pueden entrenar cabezas ligeras para detectar comandos como encender luces o reproducir música sin enviar datos a la nube.
- Búsqueda semántica local de frases: `Similarity` sobre embeddings permite emparejar consultas en varios idiomas con un catálogo de acciones o respuestas predefinidas dentro del juego.
- Prototipado rápido de IA en Unity: la instalación por URL de Git y la API unificada con otros paquetes del mismo autor facilitan sustituir modelos (Gemma3-270M, Qwen3-0.6B) sin reescribir la integración.
- Aplicaciones de accesibilidad o domótica simulada: el ejemplo del README (encender luces, reproducir música) muestra el patrón para interfaces de voz o texto en coreano, inglés y otros idiomas.
- Extracción de representaciones para pipelines de etiquetado o moderación local: los estados por bloque permiten entrenar clasificadores específicos sin depender de servicios externos.
- Demos educativas de modelos híbridos convolución-atención: la exposición explícita de cachés conv y KV facilita inspeccionar el comportamiento interno del modelo en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README únicamente reporta mediciones de latencia de decodificación en un Apple M5 Max con Unity 6000.6 y 64 tokens tras el prompt, en caliente, para el backend GPUCompute; el valor numérico concreto no aparece completo en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el paquete FP16 ocupa aproximadamente 709 MB de pesos, por lo que la inferencia requiere del orden de 1 GB o más según el backend y el tamaño de lote.
- GPU recomendadas: no se especifican modelos concretos; el README valida el backend GPUCompute en un Apple M5 Max. No hay datos para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: por tamaño (350M en FP16) es plausible en GPUs de consumo con suficiente memoria, pero no se documentan pruebas específicas.
- Opciones de despliegue: Unity Inference Engine (Sentis) 2.6.1 sobre Unity 6000.0+, con backends CPU y GPUCompute. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reporta una medición de decodificación en Apple M5 Max con GPUCompute; no hay cifras completas ni comparativas con otros backends.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| com.sky.sentis.lfm2.5-350m | 350M | No disponible (lotes de 512) | LFM Open License v1.0 | `.sentis` FP16, Unity Sentis | Híbrido conv + atención, multilingüe, embeddings |
| com.sky.sentis.gemma3-270m-it | 270M (modelo base Gemma 3) | No disponible | No disponible en la información | `.sentis`, Unity Sentis | API compatible según el README |
| com.sky.sentis.qwen3-0.6b | 600M (modelo base Qwen3) | No disponible | No disponible en la información | `.sentis`, Unity Sentis | API compatible según el README |
| LiquidAI/LFM2.5-350M | 350M | No disponible | LFM Open License v1.0 | Pesos Hugging Face (formato no detallado) | Modelo base original |

## Limitaciones y advertencias

- El paquete no es un modelo entrenado por el autor; hereda los sesgos y limitaciones del modelo base LFM2.5-350M, sobre los que no se proporciona información específica.
- Riesgo de alucinación inherente a un modelo de 350M; no se documentan evaluaciones de fidelidad.
- La decodificación es greedy (temperatura 0), más restrictiva que la configuración recomendada por Liquid (temperatura 0.1, top_k 50, repetition_penalty 1.05); esto puede reducir diversidad en las respuestas.
- Las llamadas a `GenerateAsync` se serializan; no hay paralelismo real de generación y la cancelación devuelve solo el texto generado hasta el momento.
- Los lotes están limitados a 512 filas × columnas (`BatchTokens`), lo que restringe el contexto efectivo en codificación por lotes.
- No hay soporte de tool calling, agentes, visión, audio ni modo de razonamiento.
- La licencia LFM Open License v1.0 debe revisarse antes de uso comercial; el paquete la etiqueta como "other" y enlaza al texto completo en el repositorio.
- Para builds de jugador es necesario copiar manualmente `lfm2.5_350m_fp16.sentis` y `tokenizer.json` a `StreamingAssets`; `Models~` no se importa automáticamente en Unity.
- Requiere Unity 6000.0+ y `com.unity.ai.inference` 2.6.1, además de git-lfs para instalar el paquete.
- No se han publicado datos de rendimiento fuera del entorno Apple M5 Max validado.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/Sky-Kim/com.sky.sentis.lfm2.5-350m
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia LFM Open License v1.0: https://huggingface.co/Sky-Kim/com.sky.sentis.lfm2.5-350m/blob/main/Models~/LICENSE-LFM.txt
- git-lfs: https://git-lfs.com
