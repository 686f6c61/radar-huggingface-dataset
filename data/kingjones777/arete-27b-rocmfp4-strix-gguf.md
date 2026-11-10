# kingjones777/Arete-27B-ROCmFP4-STRIX-GGUF

## Resumen

Arete-27B-ROCmFP4-STRIX-GGUF es una cuantización de 4 bits del modelo NousResearch/Arete-27B, un fine-tune del Qwen3.8-27B con arquitectura híbrida densa de atención y SSM (etiquetada como `qwen35`). La publica el usuario kingjones777 con licencia Apache-2.0 y está específicamente optimizada para el hardware AMD Strix Halo (gfx1151, Ryzen AI Max+ 395 con memoria unificada de 128 GB), usando un formato propietario de pesos ROCmFP4 (tipos ggml 100-106) que el llama.cpp estándar rechaza.

El modelo resuelve el problema de ejecutar un modelo de 27B en un APU de AMD con memoria unificada, algo que las cuantizaciones GGUF convencionales no aprovechan de forma óptima en esa plataforma. Para ello emplea cuantización ponderada por matriz de importancia (imatrix) con cabezal de salida y embeddings en Q6_K, alcanzando 4,50 BPW (14.416 MiB frente a los 51.305 MiB del BF16 original). Incluye además dos ficheros de "ruta" (route) de prefill Super ROC en 4 bits que aceleran el procesamiento del prompt.

La relevancia actual radica en que es una de las pocas publicaciones que documenta con mediciones concretas el rendimiento de un modelo de 27B en hardware Strix Halo, incluyendo perplejidad frente a referencia Q8_0, velocidad de prefill y generación, y tasa de aceptación de decodificación especulativa con un drafter DFlash2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso con atención + SSM (`qwen35`), 64 capas |
| Parámetros totales | 26.895.998.464 (26,9B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos en el GGUF; 131.072 en el comando de servicio recomendado |
| Tipos de cuantización | Q4_0_ROCMFP4_STRIX (tipo ggml 105), 4,50 BPW; cabezal de salida y token embedding en Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con tipos ROCmFP4 propietarios) + ficheros de ruta `.a4w` y `.a4r` |

## Arquitectura y entrenamiento

El modelo base es NousResearch/Arete-27B, un fine-tune de Qwen3.8-27B con arquitectura densa híbrida de atención y SSM: 64 capas, dimensión oculta de 5120, FFN de 17408, dimensión interna del SSM de 6144 y vocabulario de 248.320 tokens. No incluye tensores nextn ni MTP en el fichero, por lo que la decodificación especulativa debe hacerse con un drafter externo (DFlash2 del modelo base Qwen3.8-27B).

La cuantización se construyó a partir de los safetensors BF16 de Arete-27B convertidos a un GGUF único (`qwen35`, 851 tensores). La matriz de importancia se calculó sobre 531 fragmentos de 512 tokens de texto de calibración agéntico (el mismo usado para el fichero STRIX de Qwen3.8-27B), con 497 entradas de imatrix sobre un Q8_0 de Arete. La cuantización se realizó con `llama-quantize` usando `--output-tensor-type q6_K` y `--token-embedding-type q6_K`, con un tiempo de ejecución de 191,9 segundos. Los dos ficheros de ruta Super ROC (`int4_weights`) se derivaron de los pesos BF16 del propio modelo, con escalas de columna volcadas sobre este fichero STRIX y escalas rotadas para `ffn_down` con bloque 256.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredadas del fine-tune Arete-27B sobre Qwen3.8-27B.
- Soporte de tool calling / function calling: la model card documenta una prueba con `get_weather({"city":"Paris"})` devolviendo `finish_reason=tool_calls`; validación de 8/8 con `tool_choice` required y 7/8 con auto.
- Modo de razonamiento desactivable (`--think off` en el comando de servicio recomendado).
- Reutilización de caché de prefijo: se documenta la reutilización de 1.513/1.513 y 1.572/1.592 tokens en turnos consecutivos.
- Decodificación especulativa compatible con drafter DFlash2 externo (tasa de aceptación medida entre el 32% y el 65% según el prompt).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional local en estación de trabajo con APU AMD Strix Halo: el modelo cabe en 128 GB de memoria unificada con 4,50 BPW y ofrece generación a 21-35 tok/s según la longitud del contexto, suficiente para uso interactivo individual.
- Automatización de tool calling en flujos agénticos: la validación de 8/8 con `tool_choice` required y la respuesta correcta de `get_weather` lo hacen apto para pipelines que requieren invocación fiable de funciones.
- Procesamiento de documentos largos: con contexto nativo de 262.144 tokens y prefill de 775-840 tok/s en prompts de 13K-27K tokens, es viable analizar contratos, informes o bases de código extensas en una sola pasada.
- Generación de código asistida: la model card reporta 56,87 tok/s de media en generación de código (rango 38,9-64,9) con una tasa de aceptación de borradores de 2.386/3.646, adecuado para autocompletado en IDE sobre hardware AMD.
- Servicio de inferencia local con API compatible con endpoints: el comando `superroc serve llm` expone el modelo con `--served-model-name arete-27b`, lo que permite integrarlo en aplicaciones existentes sin depender de la nube.
- Evaluación de cuantizaciones en hardware AMD: los ficheros de ruta y las mediciones de perplejidad (1,0167× a 1,0222× frente a Q8_0) sirven como referencia para comparar recetas de cuantización en gfx1151.
- Investigación sobre decodificación especulativa: la documentación de aceptación de borradores con drafter DFlash2 en distintos tipos de prompt (texto general, código, contexto largo) permite estudiar el comportamiento del speculative decoding en este hardware.

## Benchmarks y rendimiento

Perplejidad medida con `qwen35_ppl` sobre texto retenido, contexto 4096, 5 fragmentos, 10.235 tokens puntuados (menor es mejor):

| Configuración | PPL | Relación vs Q8_0 |
|---|---:|---:|
| Q8_0 de referencia (no distribuido) | 4,79726 | 1,000 |
| STRIX, ruta desactivada | 4,87744 | 1,0167 |
| STRIX, ruta de cinco tensores activada | 4,88189 | 1,0176 |
| STRIX, ruta de cinco tensores + down rotado + attention VW plegada | 4,90393 | 1,0222 |

Velocidad en AMD Ryzen AI Max+ 395 (Radeon 8060S, gfx1151), 128 GB unificados, ROCm 7.2.4, temperatura 0, caché de prompt fría, media de dos ejecuciones:

| Medición | Resultado |
|---|---:|
| Prefill, prompt de 1.566 tokens | 457,0 tok/s |
| Generación tras ese prompt (hasta 256 tokens) | 35,0 tok/s |
| Borradores aceptados en ese prompt | 286 / 646 |
| Prefill, prompt de 13.384 tokens | 840,05 tok/s |
| Generación tras ese prompt | 26,1 tok/s |
| Borradores aceptados en ese prompt | 230 / 638 |
| Prefill, prompt de 26.821 tokens | 775,8 tok/s |
| Generación tras ese prompt | 21,4 tok/s |
| Borradores aceptados en ese prompt | 220 / 676 |
| Generación de código, 6 prompts, hasta 256 tokens | 56,87 tok/s (38,9-64,9) |
| Borradores aceptados en prompts de código | 2.386 / 3.646 |
| Tool calls válidos, `tool_choice` required / auto | 8/8 / 7/8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero GGUF principal ocupa 15.127.583.872 bytes (unos 14,1 GiB) a 4,50 BPW; sumando los ficheros de ruta (8.638.237.208 y 2.878.866.208 bytes) el conjunto ronda los 26,6 GB del repositorio completo.
- Hardware objetivo: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151) y 128 GB de memoria unificada; es el único hardware con mediciones publicadas.
- GPU recomendadas: no disponibles para otras plataformas; el formato ROCmFP4 requiere runtime específico y no está validado en NVIDIA.
- ¿Cabe en GPU de consumo? No hay datos para GPUs de consumo convencionales; el modelo está diseñado para APUs AMD con memoria unificada, no para GPUs discretas con VRAM limitada.
- Opciones de despliegue: runtime Super ROC (`superroc serve llm`) con ROCm 7.2.4. El llama.cpp estándar rechaza los tipos de tensor ROCmFP4 (100-106), por lo que no es desplegable con llama.cpp, Ollama ni vLLM sin soporte específico.
- Latencia y throughput: prefill de 457-840 tok/s y generación de 21-35 tok/s según longitud de contexto en el hardware objetivo; generación de código a 56,87 tok/s de media.
- Decodificación especulativa: requiere el drafter `Qwen3.8-27B-DFlash2-Q4_K_M.gguf` de z-lab, no incluido en el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B-ROCmFP4-STRIX-GGUF | 26,9B | 262.144 | Apache-2.0 | GGUF ROCmFP4 | Optimizado para Strix Halo; requiere runtime Super ROC |
| NousResearch/Arete-27B (base) | 26,9B | no disponible | Apache-2.0 | safetensors BF16 | Modelo original sin cuantizar; requiere ~54 GB en BF16 |
| Qwen3.8-27B (modelo de origen) | 27B (aprox.) | no disponible | no disponible | no disponible | Base del fine-tune Arete; el drafter DFlash2 se distribuye para este modelo |
| Qwen3.8-27B-DFlash2-GGUF (z-lab) | 27B (aprox.) | no disponible | no disponible | GGUF Q4_K_M | Drafter de decodificación especulativa, no modelo completo |

## Limitaciones y advertencias

- Requiere un runtime que cargue los tipos ggml ROCmFP4 (100-106); llama.cpp estándar, Ollama y vLLM no los soportan, lo que limita la portabilidad.
- Los ficheros de ruta `.a4w` y `.a4r` solo son válidos para este GGUF concreto; usarlos con otro fichero de 27B carga pero produce respuestas incorrectas, ya que el motor solo verifica número de capas y anchura.
- La decodificación especulativa requiere un drafter externo no incluido; un fine-tune puede aceptar menos borradores que el modelo base, con tasas medidas del 32-65%.
- La perplejidad con la pila completa (1,0222× frente a Q8_0) supera ligeramente el umbral de referencia de 1,02×, aunque las configuraciones con ruta desactivada o ruta de cinco tensores quedan por debajo.
- Solo hay mediciones publicadas para AMD Ryzen AI Max+ 395 con ROCm 7.2.4; el rendimiento en otras plataformas es desconocido.
- Idiomas soportados no documentados; no hay garantías sobre cobertura multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada, pero aplicables por herencia del fine-tune y del modelo base.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base NousResearch/Arete-27B y del Qwen3.8-27B subyacente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/kingjones777/Arete-27B-ROCmFP4-STRIX-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2-GGUF
