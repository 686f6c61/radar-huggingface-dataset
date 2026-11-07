# litert-community/LFM2.5-1.2B-Thinking

## Resumen

LFM2.5-1.2B-Thinking es un modelo de lenguaje de 1.200 millones de parámetros desarrollado por Liquid AI, distribuido en este repositorio por la comunidad LiteRT en formato `.litertlm` para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM de Google. Se trata de la variante de razonamiento del modelo insignia híbrido conv-attention de Liquid AI: el modelo elabora su cadena de pensamiento dentro de etiquetas `<think>…</think>` antes de emitir la respuesta final.

El modelo base emplea una arquitectura híbrida que combina capas convolucionales y de atención, optimizada para eficiencia en hardware limitado. Esta conversión cuantizada (int8 e int4) reduce el peso a entre 736 MB y 1,24 GB, lo que permite ejecutarlo en teléfonos Android, Apple Silicon y placas como Raspberry Pi 5, con soporte de aceleración GPU vía OpenCL y Metal.

Su relevancia actual radica en que demuestra que un modelo con capacidad de razonamiento explícito puede desplegarse en el borde sin conexión, con velocidades de decodificación de hasta 35,5 tok/s en CPU de smartphone y 317,9 tok/s en GPU de Apple M4 Max, manteniendo un 77% de precisión en GSM8K con cuantización int8 frente al 81% del modelo de referencia en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido conv-attention (LFM2.5, "hybrid conv/attention") |
| Parametros totales | 1.200 millones (1.2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (KV cache máximo declarado en el bundle LiteRT-LM) |
| Tipos de cuantizacion | int8 dinámica (lineales + embedding, convoluciones en float); int4 blockwise-32 con OCTAV en lineales, embedding int8, convoluciones en float; variantes `_gpu` reexportadas para GPU |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (`lfm-open-license-v1.0`) |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base original en safetensors en LiquidAI/LFM2.5-1.2B-Thinking |

## Arquitectura y entrenamiento

El modelo base LFM2.5-1.2B-Thinking de Liquid AI emplea una arquitectura híbrida que intercala capas convolucionales con capas de atención, un diseño orientado a reducir el coste computacional y de memoria frente a un transformer denso convencional del mismo tamaño. Esta conversión de LiteRT preserva el grafo y los pesos del modelo original, añadiendo metadatos de ejecutor (`ExecutorMetadata`) necesarios para enlazar los buffers de estado híbridos conv/attention en litert-lm ≥ 0.15. La variante Thinking incorpora un canal de pensamiento declarado en los metadatos del bundle, de modo que el runtime separa el razonamiento (`thought`) de la respuesta final.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card documenta únicamente el proceso de conversión y cuantización: la receta int8 usa cuantización dinámica en capas lineales y embedding manteniendo las convoluciones en float, mientras que la receta int4 aplica cuantización blockwise de bloque 32 con OCTAV en lineales, embedding int8 y convoluciones en float. Los ficheros `_gpu` son reexportaciones de las mismas recetas y pesos para ejecución en GPU.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo elabora una cadena de pensamiento dentro de `<think>…</think>` antes de responder.
- Razonamiento matemático y resolución de problemas aritméticos de varios pasos (evaluado en GSM8K con CoT 0-shot).
- Canal de pensamiento separado: LiteRT-LM ≥ 0.14 transmite el razonamiento por un canal `thought` independiente, lo que permite mostrarlo u ocultarlo a nivel de aplicación.
- Gestión automática del contexto multi-turno: el pensamiento pasado se elimina del contexto en conversaciones sucesivas.
- Plantilla de chat incluida en el bundle, con soporte de la forma de content-parts de litert-lm 0.18.
- Ejecución on-device en CPU para todos los ficheros y en GPU (Android OpenCL, macOS, iOS Metal para `_int4_gpu`) con litert-lm ≥ 0.16.0.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües en la información disponible.

## Casos de uso

- Tutor de matemáticas sin conexión: el modelo resuelve problemas aritméticos paso a paso en el dispositivo, con el razonamiento visible en el canal `thought` y la respuesta final tras `</think>`, adecuado para aplicaciones educativas en entornos sin red.
- Asistente de razonamiento en smartphone: con 35,5 tok/s de decodificación en CPU de Galaxy S26 (int8) y TTFT de 600 ms, permite interacción conversacional fluida en aplicaciones Android nativas vía LiteRT-LM.
- Procesamiento en dispositivos IoT y SBC: en Raspberry Pi 5 con 4 hilos CPU alcanza 9,2 tok/s (int4) y 7,1 tok/s (int8), suficiente para tareas de razonamiento por lotes o asistentes locales de bajo consumo.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en el dispositivo, los datos del usuario nunca abandonan el terminal, lo que lo hace apto para dominios sanitarios, financieros o legales donde no se permite el envío a la nube.
- Aceleración de prompts largos en móvil: la GPU OpenCL ofrece prefill de 189–192 tok/s frente a 31,3–31,7 tok/s en CPU en Pixel 8a, idóneo para aplicaciones que procesan documentos o contextos extensos antes de responder.
- Prototipado y evaluación de modelos de razonamiento en el borde: el formato `.litertlm` con presupuesto de tokens configurable (≥2048 recomendado) facilita experimentar con decodificación de cadenas de pensamiento en hardware de consumo.
- Despliegue en Apple Silicon: en M4 Max la GPU alcanza 3.734 tok/s de prefill y 317,9 tok/s de decodificación, útil para demos locales, herramientas de desarrollador y prototipos de escritorio.

## Benchmarks y rendimiento

GSM8K (greedy, 0-shot CoT, max-tokens 2048, n=100, mismo harness para todas las filas):

| Variante | GSM8K | Tamaño |
|---|---|---|
| PyTorch bf16 (referencia) | 81% | no disponible |
| LiteRT int8 | 77% (−4 pt) | 1,24 GB |
| LiteRT int4 | 72% (−9 pt) | 736 MB |
| LiteRT int8_gpu | 77% (= int8, medición head to head) | 1,24 GB |

Rendimiento en dispositivo:

| Dispositivo | Backend | Prefill | Decode | TTFT |
|---|---|---|---|---|
| Galaxy S26 (int8) | CPU | 357 tok/s | 35,5 tok/s | 600 ms |
| Galaxy S26 (int8) | GPU | no ejecutado (`engine_create_failed`) | — | — |
| Galaxy S26 (int4) | GPU | no ejecutado (`engine_create_failed`) | — | — |
| Raspberry Pi 5, 4 hilos (int8) | CPU | 75 tok/s | 7,1 tok/s | 3,56 s |
| Raspberry Pi 5, 4 hilos (int4) | CPU | 55 tok/s | 9,2 tok/s | 4,78 s |
| Pixel 8a, Tensor G3 (int4_gpu, prompt 263 tok, 256 generados) | GPU OpenCL | 189–192 tok/s | 21,8–22,4 tok/s | 1,41–1,44 s |
| Pixel 8a, Tensor G3 (int4_gpu) | CPU | 31,3–31,7 tok/s | 16,3–16,7 tok/s | 8,4–8,5 s |
| Apple M4 Max (int4_gpu, `-p 256 -d 256 --runs 3`) | GPU | 3.734 tok/s | 317,9 tok/s | no disponible |

## Requisitos de hardware

- VRAM/memoria: el fichero int4 ocupa 736 MB y el int8 1,24 GB; la inferencia se ejecuta en CPU o GPU integrada, sin necesidad de VRAM dedicada.
- GPU recomendadas: no requiere GPU dedicada; las variantes `_gpu` funcionan en Android OpenCL (Pixel 8a verificado), macOS y iOS Metal (`_int4_gpu`), y macOS para `_int8_gpu`.
- Cabe en GPU de consumo: sí, en teléfonos Android de gama media-alta, Apple Silicon (M4 Max verificado) y placas SBC como Raspberry Pi 5.
- Opciones de despliegue: runtime LiteRT-LM (≥0.15, ≥0.16.0 para GPU) mediante el binario `litert-lm` o AI Edge Gallery reciente; no se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: decodificación de 7,1–35,5 tok/s en CPU según dispositivo y cuantización; 21,8–22,4 tok/s en GPU móvil y 317,9 tok/s en GPU de M4 Max. En móvil la GPU aporta ganancias de 3–6× en prefill y TTFT, mientras que la decodificación está limitada por ancho de banda y resulta similar.
- En iOS es necesario fijar `maxNumTokens` a 1024; un valor distinto rompe la creación del motor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Thinking (LiteRT int8) | 1,2B | 4096 | 77% | LFM Open License v1.0 | `.litertlm` |
| LFM2.5-1.2B-Thinking (LiteRT int4) | 1,2B | 4096 | 72% | LFM Open License v1.0 | `.litertlm` |
| LiquidAI/LFM2.5-1.2B-Thinking (bf16) | 1,2B | no disponible | 81% | LFM Open License v1.0 | safetensors |
| litert-community/LFM2.5-1.2B-Instruct | 1,2B | no disponible | no disponible | no disponible | `.litertlm` |

No se dispone de datos de benchmarks de los modelos comparables alternativos en la información proporcionada; la comparación se limita a las variantes del mismo modelo base y a su hermano Instruct dentro de la comunidad LiteRT.

## Limitaciones y advertencias

- Riesgo de truncamiento del razonamiento: si se limita el presupuesto de tokens por debajo de 2048, el modelo puede quedarse a mitad del pensamiento y no emitir respuesta final.
- Pérdida de precisión por cuantización: int4 pierde 9 puntos en GSM8K respecto a bf16 (72% frente a 81%) e int8 pierde 4 puntos (77%).
- Contexto limitado a 4096 tokens de KV cache, insuficiente para documentos largos o conversaciones muy extensas.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe más allá de lo que ofrezca el modelo base.
- Fallo conocido en GPU de Galaxy S26 con litert-lm 0.16.0 (`engine_create_failed`), sin resolución documentada en la información disponible.
- Requiere litert-lm ≥ 0.15 por los metadatos del ejecutor; versiones anteriores fallan con `missing some output TensorBuffers`.
- En iOS, `maxNumTokens` debe fijarse a 1024 exactamente para evitar fallos de creación del motor.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia OSI estándar y la model card solo enlaza al fichero LICENSE.
- No se documentan capacidades de tool calling ni de agentes, por lo que no debe asumirse su disponibilidad en producción.
- Riesgo de sesgos y alucinaciones inherente al modelo base; no se aporta información específica sobre evaluación de sesgos en la documentación disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/LFM2.5-1.2B-Thinking
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Thinking
- Hermano Instruct en LiteRT: https://huggingface.co/litert-community/LFM2.5-1.2B-Instruct
- Organización LiteRT Community: https://huggingface.co/litert-community
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha edge-compat int4: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-thinking-int4/CARD.md
- Ficha edge-compat int8: https://github.com/john-rocky/edge-compat/blob/main/cards/lfm2.5-1.2b-thinking-int8/CARD.md
- Benchmark Apple Silicon LLM: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
