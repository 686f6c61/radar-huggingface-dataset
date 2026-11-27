# litert-community/decider-2b-vision-LiteRT

## Resumen

decider-2b-vision es un modelo de decisión multimodal desarrollado originalmente por Mapika y convertido a formato LiteRT por la comunidad litert-community. A diferencia de un modelo generativo convencional, no produce texto libre: recibe una imagen y una serie de preguntas con opciones etiquetadas con letras, y devuelve una distribución de probabilidad sobre cada opción. Esta conversión es de terceros y solo cambia el formato de los pesos; el entrenamiento, los resultados y las limitaciones se documentan en la model card del modelo original.

El modelo parte de Qwen3.5-2B vision-language, al que se le injertan los pesos de texto de decider-2b v5. El decodificador consta de 24 capas, de las cuales 18 son de atención lineal gated-delta y 6 son de atención completa, lo que configura una arquitectura híbrida. El codificador visual tiene 24 bloques con un merger 2×2, de modo que una imagen de 256×256 se comprime a 64 tokens. El contexto declarado es de 4096 tokens.

La relevancia de esta ficha radica en que el modelo se distribuye en tres variantes LiteRT optimizadas para distintos entornos (escritorio, GPU de escritorio y móvil), con resultados verificados en un Galaxy S26. Es un caso poco habitual de modelo de decisión estructurada empaquetado para inferencia en dispositivo, con licencia Apache 2.0 y solo inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas de decodificador (18 gated-delta linear-attention + 6 full-attention) con codificador visual de 24 bloques y merger 2×2 |
| Parametros totales | 2B (según denominación del modelo base Qwen3.5-2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (cache declarada en los tres ficheros) |
| Tipos de cuantizacion | fp16; fp16 con cabeza de salida int8 dinámica y embedding int8 por canal; int8 dinámico con embedding int8 por canal; codificador visual y adaptador en fp16 en todas las variantes |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El decodificador combina atención lineal gated-delta (18 capas) con atención completa (6 capas), un patrón híbrido pensado para reducir el coste de atención en contextos largos manteniendo capacidad expresiva. El codificador visual procesa una única imagen de 256×256 y la proyecta a 64 tokens mediante un merger 2×2. La lectura de salida no es generativa: se extraen los logits de las letras en una posición de respuesta por pregunta y se normalizan en probabilidades sobre las opciones.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada; la model card de esta conversión remite a la del modelo original Mapika/decider-2b-vision. La conversión a LiteRT fija un tokenizador y metadatos de prompt comunes: plantilla de identidad sin marcadores de rol, sin token de inicio, token de parada 248044, una imagen de 256×256, caché de 4096 tokens y metadatos de ejecución para 48 buffers de estado, con preferencia de activaciones fp32 en el decodificador.

## Capacidades

- Decisión estructurada sobre imagen: devuelve una probabilidad por cada opción etiquetada con letras, en lugar de texto generado.
- Comprensión de imagen-texto: pipeline `image-text-to-text` con entrada de una imagen de 256×256.
- Salida de confianza calibrada: distribución de probabilidad normalizada por pregunta, apta para umbrales y políticas de decisión.
- Soporte de múltiples preguntas por imagen: la interfaz de referencia acepta una lista de objetos con pregunta y opciones.
- Ejecución en dispositivo: variantes para CPU y GPU en escritorio y en móvil (probado en Galaxy S26).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de agentes generativos; la salida es una elección entre opciones.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Agentes de juego por refuerzo con percepción visual: dado un fotograma de Pong a 256×256, el modelo devuelve la probabilidad de "subir pala", "bajar pala" o "quedarse"; el ejemplo publicado da 0.99986 a "move paddle up" en fp32, lo que permite usarlo como política de decisión de baja latencia.
- Control de robots o simuladores con acciones discretas: se formula cada acción como una opción y se selecciona la de mayor probabilidad, con umbral de confianza para derivar a un controlador clásico si la distribución es ambigua.
- Clasificación visual con etiquetas en lenguaje natural: en lugar de entrenar un cabezal de clasificación, se enumeran las categorías como opciones y se lee la probabilidad, lo que facilita cambiar el conjunto de clases sin reentrenar.
- Triaje en dispositivos móviles: la variante int8 (3,17 GB) está probada en un Galaxy S26 con CPU y GPU, adecuada para decisiones locales sin enviar imágenes a la nube.
- Validación de pipelines de percepción: la coincidencia de 51/53 respuestas con el modelo original en CPU y 52/53 en GPU de Mac permite usarlo como referencia rápida en pruebas de regresión de sistemas de visión.
- Investigación en evaluación de modelos de decisión: la lectura de logits por posición de respuesta permite estudiar calibración y sensibilidad al troceado del prompt (se documenta una variación de max |Δp| 0.233 según el chunking de prefill).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos cuantitativos son de fidelidad frente al modelo original y de consumo de recursos:

| Metrica | Resultado |
|---|---|
| Coincidencia de respuestas, fp16-int8vocab en CPU (Mac) | Mismo valor que upstream a cinco dígitos en la imagen publicada |
| Coincidencia de respuestas, int8 en CPU (Mac) | 51/53 respuestas; max \|Δp\| 0.429; p95 0.164 |
| Coincidencia de respuestas, int8 en GPU (Metal, Mac) | 52/53 respuestas; max \|Δp\| 0.032; p95 0.011 |
| Coincidencia de respuestas, fp16-int8vocab en GPU (Mac) | Dentro de 0.0085 del original en las filas publicadas |
| Primer token correcto, int8 en Galaxy S26 (CPU y GPU) | 6/6 filas |
| Memoria pico GPU (Mac), fp16-int8vocab | 7,0 GB frente a 15,6 GB de fp16 |
| Tamano de fichero | 5,51 GB (fp16); 4,50 GB (fp16-int8vocab); 3,17 GB (int8) |

## Requisitos de hardware

- VRAM/RAM estimada: fp16 requiere expansión de pesos a 7,5 GB en XNNPACK (CPU), por lo que no es apta para teléfonos; fp16-int8vocab necesita unos 7,0 GB de pico en GPU de Mac; int8 es la única variante probada en móvil.
- GPU recomendadas: Apple M4 Max (CPU y GPU) para las tres variantes; Galaxy S26 (CPU y GPU) para int8; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, la variante int8 en un Galaxy S26; fp16-int8vocab en GPU de escritorio con al menos 8 GB de memoria efectiva.
- Despliegue: LiteRT-LM 0.17.1 en Mac y LiteRT-LM v0.16.0 en el Galaxy S26; la lectura de referencia usa `ai-edge-litert` 2.2.0, numpy, Pillow y tokenizers, sin torch ni transformers. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento en caché de LiteRT-LM: 7,54 GB (decodificador fp16), 6,02 GB (fp16-int8vocab) o 1,90 GB (int8), más 1,31 GB de codificador visual y adaptador; con backend GPU se añade una caché de programa de decodificador de 270,7 MB por creación de motor y 508,6 MB de caché de pesos para la cabeza int8.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-2b-vision-LiteRT | 2B | 4096 | Probabilidades por opción | Apache 2.0 | LiteRT-LM en este repositorio |
| Mapika/decider-2b-vision (original) | 2B | No disponible | Probabilidades por opción | No disponible en la información | Hugging Face, pesos originales |
| Qwen3.5-2B-Base (base) | 2B | No disponible | Texto generativo | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre opciones predefinidas; no sirve para diálogo abierto ni generación libre.
- Solo admite inglés; no hay soporte multilingüe declarado.
- Una única imagen de 256×256 por inferencia; no se documenta entrada de vídeo ni múltiples imágenes.
- En CPU, la variante int8 cuantiza activaciones en vuelo y sus probabilidades se desvían del original (max |Δp| 0.429, p95 0.164) y dependen del troceado del prompt (max |Δp| 0.233 con un chunk rellenado).
- En el Galaxy S26 no se midieron probabilidades porque el runtime devuelve solo texto; la validación se limita al primer token.
- La variante fp16 no es apta para móviles por la expansión de pesos a 7,5 GB en XNNPACK.
- Es una conversión de terceros: los sesgos, la calibración y las limitaciones del entrenamiento original no se documentan aquí y deben consultarse en la model card de Mapika.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-2B y del original, no disponibles en la información proporcionada.
- Riesgo de alucinación no evaluado en esta conversión; al tratarse de una salida acotada a opciones, el riesgo se traslada a una elección incorrecta con confianza alta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/decider-2b-vision-LiteRT
- Modelo original: https://huggingface.co/Mapika/decider-2b-vision
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Sumas de verificación: https://huggingface.co/litert-community/decider-2b-vision-LiteRT/blob/main/SHA256SUMS
- Ejemplo de petición de referencia: `reference/example_request.json` (en el repositorio)
- Script de lectura de referencia: `reference/decider_litert.py` (en el repositorio)
