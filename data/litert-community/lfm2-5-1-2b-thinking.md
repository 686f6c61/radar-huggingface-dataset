# litert-community/LFM2.5-1.2B-Thinking

## Resumen

LFM2.5-1.2B-Thinking es la variante de razonamiento del modelo insigne de Liquid AI, una arquitectura híbrida de convolución y atención de 1.200 millones de parámetros. El modelo resuelve problemas dentro de un bloque `` antes de emitir la respuesta final, lo que lo hace adecuado para tareas que requieren cadena de pensamiento explícita en dispositivos con recursos limitados. La ficha que nos ocupa corresponde a la conversión realizada por la comunidad `litert-community` al formato LiteRT-LM (`.litertlm`) de Google, pensada para inferencia on-device con el runtime LiteRT-LM.

La relevancia de esta conversión radica en que empaqueta un modelo de razonamiento en ficheros de 736 MB (int4) y 1,24 GB (int8) que se ejecutan en CPU de teléfonos Android, Raspberry Pi 5 y portátiles Apple Silicon, con dos variantes que además aprovechan la GPU vía OpenCL y Metal. El contexto máximo de la caché KV es de 4096 tokens y el modelo declara el canal de pensamiento en sus metadatos, de modo que LiteRT-LM ≥ 0.14 lo transmite por un canal `thought` separado que la aplicación puede mostrar u ocultar.

El modelo base es LiquidAI/LFM2.5-1.2B-Thinking, distribuido bajo la LFM Open License v1.0. Esta conversión no altera los pesos respecto al original: los ficheros int8 e int4 son recetas de cuantización aplicadas sobre el mismo grafo, y las versiones `_gpu` son reexportaciones de esas mismas recetas para que el runtime pueda ejecutarlas en acelerador gráfico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida conv-attention (familia LFM2.5 de Liquid AI) |
| Parámetros totales | 1.200 millones (1.2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV máxima declarada) |
| Tipos de cuantización | int8 dinámica (linears + embedding, convs en float); int4 blockwise-32 + OCTAV en linears, embedding int8, convs en float; variantes `_gpu` de ambas |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.litertlm` (LiteRT-LM); el modelo base está en safetensors |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que combina capas convolucionales con capas de atención, un diseño característico de la familia LFM2.5 de Liquid AI orientado a reducir el coste computacional y de memoria frente a un transformer puro, manteniendo capacidad de modelado de secuencias. La variante Thinking añade un modo de razonamiento explícito: el modelo genera primero un bloque `` antes de la respuesta.
- Razonamiento matemático y de sentido común: validado con GSM8K en modo 0-shot CoT.
- Separación nativa del canal de pensamiento: LiteRT-LM ≥ 0.14 emite el razonamiento por el canal `thought` y la respuesta por el canal principal.
- Gestión automática del historial: el pensamiento pasado se elimina del contexto multi-turno.
- Inferencia on-device en CPU (Android, Raspberry Pi 5, macOS) y en GPU (OpenCL en Android y macOS, Metal en iOS para la variante int4).
- Plantilla de chat embebida en el fichero, actualizada el 2026-09-21 para aceptar la forma de content-parts de litert-lm 0.18.
- Soporte de tool calling, function calling, agentes o capacidades multimodales: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de razonamiento offline en Android: integrar el fichero int8 (1,24 GB) en una app mediante LiteRT-LM ≥ 0.15 para resolver problemas matemáticos y de lógica sin conexión, aprovechando el canal `thought` para mostrar u ocultar el razonamiento según la preferencia del usuario.
- Tutor educativo en Raspberry Pi 5: desplegar la variante int8 en CPU con 4 hilos (7,1 tok/s de decodificación, 3,56 s de TTFT) para un asistente de resolución de problemas paso a paso en entornos sin GPU.
- Chat de atención al cliente en el dispositivo: usar la variante int4 (736 MB) en teléfonos de gama media para conversaciones multi-turno con contexto de hasta 4096 tokens, donde el historial de pensamiento se descarta automáticamente y se reduce el consumo de memoria.
- Prototipado de agentes con razonamiento en iOS: emplear el fichero `_int4_gpu` con Metal y `maxNumTokens` fijado a 1024 para experimentar con cadenas de pensamiento en apps nativas de iPhone.
- Evaluación de pipelines de cuantización: comparar la precisión GSM8K entre bf16 (81 %), int8 (77 %) e int4 (72 %) para decidir el compromiso entre tamaño y exactitud en un producto embebido.
- Demostraciones de inferencia acelerada por GPU en Android: usar `_int4_gpu` en un Pixel 8a para obtener prefill de 189–192 tok/s y TTFT de 1,41–1,44 s frente a 31 tok/s y 8,4 s en CPU, útil en aplicaciones con prompts largos.
- Benchmarking de hardware edge: reproducir las mediciones de la comunidad con `litert-lm benchmark` en Apple M4 Max o dispositivos Android para caracterizar latencia y throughput antes de un despliegue.

## Benchmarks y rendimiento

Precisión en GSM8K (greedy, 0-shot CoT, max-tokens 2048, n=100, mismo script de evaluación):

| Variante | Tamaño | GSM8K |
|---|---|---|
| PyTorch bf16 (referencia) | — | 81 % |
| LiteRT int8 | 1,24 GB | 77 % (−4 pt) |
| LiteRT int4 | 736 MB | 72 % (−9 pt) |
| LiteRT int8_gpu | 1,24 GB | 77 % (igual que int8) |
| LiteRT int4_gpu | 736 MB | igual que int4 |

Rendimiento en dispositivo:

| Dispositivo | Backend | Prefill | Decode | TTFT |
|---|---|---|---|---|
| Pixel 8a (Tensor G3), int4_gpu, prompt 263 tok | GPU OpenCL | 189–192 tok/s | 21,8–22,4 tok/s | 1,41–1,44 s |
| Pixel 8a (Tensor G3), int4_gpu, prompt 263 tok | CPU | 31,3–31,7 tok/s | 16,3–16,7 tok/s | 8,4–8,5 s |
| Raspberry Pi 5, int8, CPU 4 hilos | CPU | 75 tok/s | 7,1 tok/s | 3,56 s |
| Raspberry Pi 5, int4, CPU 4 hilos | CPU | 55 tok/s | 9,2 tok/s | 4,78 s |
| Galaxy S26, int8, CPU | CPU | 357 tok/s | 35,5 tok/s | 600 ms |
| Galaxy S26, int8, GPU | GPU | — | — | fallo: `engine_create_failed` (litert-lm 0.16.0) |
| Galaxy S26, int4, GPU | GPU | — | — | fallo: `engine_create_failed` (litert-lm 0.16.0) |
| Apple M4 Max, GPU, `-p 256 -d 256` | GPU | 3734 tok/s (dato truncado en la fuente) | no disponible | no disponible |

## Requisitos de hardware

- VRAM/RAM estimada: 736 MB para int4 y 1,24 GB para int8 en disco; el consumo en ejecución depende del backend y de la caché KV de hasta 4096 tokens.
- GPU recomendadas: no se especifican modelos de GPU de escritorio; las variantes `_gpu` están verificadas en Android OpenCL (Pixel 8a, Tensor G3), macOS y, para `_int4_gpu`, Metal en iOS.
- CPU: funciona en todos los ficheros; verificado en Raspberry Pi 5 con 4 hilos y en CPU de Galaxy S26.
- ¿Cabe en GPU de consumo? No disponible; no hay datos para RTX 4090, A100 o H100.
- Opciones de despliegue: runtime LiteRT-LM (≥ 0.15 para los ficheros actuales; ≥ 0.16.0 para las variantes GPU), CLI `litert-lm run` y `litert-lm benchmark`, AI Edge Gallery reciente. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de benchmarks; en Pixel 8a la GPU multiplica por 3–6 el prefill y el TTFT respecto a CPU, mientras que la decodificación queda limitada por ancho de banda y es similar en ambos backends.
- En iOS, fijar `maxNumTokens` a 1024; un valor distinto rompe la creación del motor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| litert-community/LFM2.5-1.2B-Thinking (esta ficha) | 1,2B | 4096 | `.litertlm` | LFM Open License v1.0 | Variante de razonamiento con canal `thought`; int8 77 % y int4 72 % en GSM8K |
| litert-community/LFM2.5-1.2B-Instruct | 1,2B | no disponible | `.litertlm` | LFM Open License v1.0 | Misma familia, variante instruct sin modo de razonamiento explícito |
| LiquidAI/LFM2.5-1.2B-Thinking | 1,2B | no disponible | safetensors | LFM Open License v1.0 | Modelo base en bf16; referencia de 81 % en GSM8K |

No se dispone de datos de benchmarks ni de especificaciones de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo necesita un presupuesto de tokens generoso (≥ 2048): si se trunca a mitad del razonamiento, no produce respuesta final.
- Pérdida de precisión por cuantización: −4 puntos en GSM8K con int8 y −9 puntos con int4 respecto a bf16.
- Contexto limitado a 4096 tokens de caché KV, insuficiente para documentos largos o conversaciones muy extensas.
- Idiomas soportados no declarados; no se puede garantizar un rendimiento multilingüe.
- Requiere litert-lm ≥ 0.15 por la sección `ExecutorMetadata`; versiones anteriores fallan con `missing some output TensorBuffers`.
- Las variantes GPU fallaron en Galaxy S26 con litert-lm 0.16.0 (`engine_create_failed`); el soporte GPU no está garantizado en todos los dispositivos.
- En iOS, `maxNumTokens` debe ser 1024 para `_int4_gpu`; otros valores impiden crear el motor.
- Licencia LFM Open License v1.0: conviene revisar sus términos antes de un uso comercial, ya que no es una licencia OSI estándar.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; aplican las limitaciones habituales de un modelo de 1,2B.
- El repositorio ocupa 18,6 GB, pero los ficheros individuales son de 736 MB o 1,24 GB; descargar solo el necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/LFM2.5-1.2B-Thinking
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Variante Instruct de la misma familia: https://huggingface.co/litert-community/LFM2.5-1.2B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha de compatibilidad edge (int4): https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-thinking-int4/CARD.md
- Ficha de compatibilidad edge (int8): https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-thinking-int8/CARD.md
- Benchmark de runtimes en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
