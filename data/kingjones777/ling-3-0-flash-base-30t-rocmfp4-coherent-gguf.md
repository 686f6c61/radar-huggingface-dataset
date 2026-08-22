# kingjones777/Ling-3.0-flash-base-30T-ROCmFP4-COHERENT-GGUF

## Resumen

El modelo `kingjones777/Ling-3.0-flash-base-30T-ROCmFP4-COHERENT-GGUF` es una cuantización en formato GGUF del checkpoint `inclusionAI/Ling-3.0-flash-base-30T`, desarrollado por inclusionAI como parte de la serie Ling 3.0 Flash. Este checkpoint concreto corresponde a la etapa de preentrenamiento con 30 billones de tokens, anterior a la extensión de contexto largo, por lo que declara una ventana de 8.192 tokens y `rope_theta` de 10.000. El autor del GGUF, kingjones777, ha adaptado el modelo al formato ROCmFP4, un formato de tensor en tiempo de ejecución exclusivo del fork ROCmFPX de llama.cpp, optimizado para la APU AMD Ryzen AI Max+ 395 y su GPU integrada Radeon 8060S (gfx1151). La relevancia de esta publicación radica en que es la primera compilación ROCmFP4 de este checkpoint y en que preserva la capa de predicción múltiple de tokens (MTP), lo que permite una aceleración medida del 13,1 % en la generación.

El modelo original es un MoE (mixture-of-experts) con 127.486.405.600 parámetros totales y 5.1 B activos por token (según inclusionAI; el autor del GGUF indica 512 expertos × 3,9 B con 8 activos). Su arquitectura híbrida combina atención lineal KDA con MLA (multi-head latent attention) para un procesamiento eficiente de contextos largos. Este GGUF es un checkpoint base (pretrained), no un modelo instructivo, por lo que debe usarse para continuación de texto o como base para fine-tuning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `bailing-hybrid` (KDA linear attention + MLA) |
| Parámetros totales | 127.486.405.600 (127,49 B) |
| Parámetros activos | 5,1 B (Non-emb) según inclusionAI; el autor del GGUF reporta 512 expertos × 3,9 B con 8 activos |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | `Q4_0_ROCMFP4_COHERENT` (cabezas de salida y embeddings en `Q6_K`) |
| Idiomas soportados | No disponible (no especificados) |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

El modelo Ling-3.0-flash-base-30T se entrena desde cero con una arquitectura híbrida nativa que intercala dos tipos de atención: capas de atención lineal KDA y capas MLA (multi-head latent attention) con compresión de KV (`kv_lora_rank` de 512). La proporción es de una capa MLA por cada seis capas, según indica la información del GGUF. La atención MLA usa una proyección de consulta ancha sin `q_lora_rank`, y la capa MTP (multi-token-prediction) se conserva íntegramente, incluyendo sus proyecciones auxiliares `nextn.eh_proj`, `nextn.enorm`, `nextn.hnorm` y `nextn.shared_head_norm`, en su forma no fusionada `attn_k_b`/`attn_v_b`. Este checkpoint concreto se pre-entrenó con 30 billones de tokens, lo que lo convierte en la etapa más temprana de las tres públicas de la serie Flash; no ha pasado por la extensión de contexto a 262.144 tokens que sí tienen las variantes `Ling-3.0-flash-base` y `Ling-3.0-flash-base-midtrain`. El entrenamiento incluye una capa MTP integrada, que se usa para decodificación especulativa.

## Capacidades

- Generación de texto por continuación: al ser un checkpoint base, el modelo no está entrenado para diálogo, pero produce texto coherente a partir de un fragmento inicial.
- Razonamiento y matemáticas: el modelo base subyacente muestra capacidades en tareas de razonamiento y matemáticas (según evaluaciones de inclusionAI, no verificadas en esta cuantización).
- Codificación: se espera que el modelo base tenga cierta habilidad en generación de código, aunque no se han publicado resultados específicos para este checkpoint.
- Multilingüismo: el modelo base está entrenado en múltiples idiomas, aunque no se especifican cuáles.
- Decodificación especulativa MTP: la capa MTP permite acelerar la generación en el fork ROCmFPX de llama.cpp, con un incremento medido del 13,1 % en throughput.
- No soporta tool calling ni funciones de agente de forma nativa, al no ser instructivo.
- No dispone de modo de razonamiento extendido (thinking mode), ni visión ni audio.

## Casos de uso

- **Fine-tuning específico de dominio**: al ser un checkpoint base, se puede adaptar mediante fine-tuning a tareas como resumen médico, análisis jurídico o generación de informes técnicos. Su arquitectura MoE permite ajustar los 8 expertos activos por token sin modificar el resto.
- **Continuación de texto para investigación**: en entornos de investigación de PLN, se puede usar para estudiar la generación de texto largo o para experimentos de prompting de continuación, aprovechando su capacidad de contexto de 8.192 tokens.
- **Adaptación a hardware AMD con memoria unificada**: la cuantización ROCmFP4 está pensada para ejecutarse en AMD Ryzen AI Max+ 395 con 128 GB de memoria unificada, lo que permite desplegar un modelo de 127 B parámetros en una APU de consumo sin necesidad de múltiples GPUs.
- **Entrenamiento de modelos instructivos**: el checkpoint base puede servir como punto de partida para un fine-tuning con instrucciones (SFT) y posterior RLHF, dado su licencia MIT y su disponibilidad en formato GGUF para pruebas rápidas.
- **Evaluación de arquitecturas híbridas**: investigadores pueden analizar el comportamiento de la atención lineal KDA frente a la MLA en tareas de largo alcance, usando el modelo como referencia.
- **Generación de contenido en entornos sin acceso a GPUs dedicadas**: gracias a la APU Strix Halo, se puede ejecutar el modelo en un portátil o mini-PC con memoria unificada, permitiendo generación de texto en local sin depender de servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) para esta cuantización GGUF en la información disponible. El autor no reporta evaluaciones de exactitud, solo mediciones de throughput en hardware específico. A continuación se muestran los datos de rendimiento medidos por el autor en un AMD Ryzen AI Max+ 395 con ROCm 7.2.4 y 128 GB de memoria unificada, con `llama-cli -dio -ngl 999 -st -c 2048 -n 512` y 3 repeticiones por configuración:

| Configuración | Flags | Generación (mediana) | Repeticiones |
|---|---|---|---|
| Sin drafter | `--spec-type none` | 36,6 t/s | 36,6 / 36,5 / 36,6 |
| MTP n-max 3 | `--spec-type draft-mtp --spec-draft-ngl 999 --spec-draft-n-max 3` | 41,4 t/s | 41,4 / 41,3 / 41,4 |

La ganancia del MTP es del +13,1 % con respecto a la línea base sin drafter. El autor también compara los tres checkpoints de la familia Ling-3.0-flash-base en las mismas condiciones:

| Checkpoint | Sin drafter | MTP n-max 3 | Efecto |
|---|---|---|---|
| Ling-3.0-flash-base | 36,6 t/s | 42,3 t/s | +15,6 % |
| Ling-3.0-flash-base-30T (este) | 36,6 t/s | 41,4 t/s | +13,1 % |
| Ling-3.0-flash-base-midtrain | 36,6 t/s | 43,0 t/s | +17,5 % |

## Requisitos de hardware

- **VRAM**: el archivo GGUF ocupa 67,17 GiB (72,1 GB). La ejecución requiere un sistema con memoria unificada de al menos 128 GB, ya que el modelo completo se carga en memoria y el uso de `-dio` (direct I/O) evita duplicar los buffers en páginas de archivo y en memoria del dispositivo.
- **GPU recomendada**: AMD Radeon 8060S integrada en la APU Ryzen AI Max+ 395 (gfx1151). No se soporta en GPUs NVIDIA o AMD de generaciones anteriores sin el fork ROCmFPX.
- **Compatibilidad con consumer GPU**: no cabe en ninguna GPU de consumo convencional (p. ej., RTX 4090 con 24 GB) porque el formato ROCmFP4 y la arquitectura `bailing-hybrid` requieren el fork ROCmFPX y la memoria unificada de Strix Halo.
- **Opciones de despliegue**: únicamente el fork [ROCmFPX](https://github.com/charlie12345/ROCmFPX) de llama.cpp. No es compatible con vLLM, Ollama, TGI ni llama.cpp estándar.
- **Latencia y throughput**: en el hardware de referencia se miden 36,6 t/s sin MTP y 41,4 t/s con MTP activado (n-max 3). El autor recomienda `-dio` y `-ngl 999` para evitar la duplicación de memoria.

## Comparativa con modelos similares

Se comparan los tres checkpoints de la familia Ling-3.0‑flash‑base publicados por inclusionAI, así como la única alternativa GGUF disponible para el checkpoint 30T (`avar6/Ling-3.0-flash-base-30T-gguf`):

| Modelo | Parámetros | Contexto | Cuantización | Velocidad (sin drafter) | Licencia |
|---|---|---|---|---|---|
| Ling-3.0-flash-base | 127,5 B | 262.144 | Original (safetensors) | 36,6 t/s (medido en GGUF) | MIT |
| Ling-3.0-flash-base-30T (este) | 127,5 B | 8.192 | Q4_0_ROCMFP4_COHERENT | 36,6 t/s | MIT |
| Ling-3.0-flash-base-midtrain | 127,5 B | 262.144 | Original (safetensors) | 36,6 t/s | MIT |
| avar6/Ling-3.0-flash-base-30T-gguf | 127,5 B | 8.192 | Q5_K_M | no disponible | MIT |

La comparación con modelos de otros fabricantes (p. ej., Qwen3-235B-A22B o DeepSeek-R1-Distill) no está disponible en la información proporcionada. La ventaja principal de esta cuantización es su optimización para el hardware AMD específico y la inclusión de la capa MTP, que no está presente en el otro GGUF.

## Limitaciones y advertencias

- **Checkpoint base, no instructivo**: no está entrenado para diálogo ni para seguir instrucciones; si se usa para chat, producirá continuaciones de texto incoherentes en ese contexto.
- **Contexto corto**: declara 8.192 tokens, no los 262.144 del modelo base completo. No se debe asumir una ventana larga.
- **Dependencia del fork ROCmFPX**: el archivo no se puede cargar en llama.cpp estándar; se requiere una compilación específica que soporte el formato ROCmFP4 y la arquitectura `bailing-hybrid`.
- **Solo hardware AMD Strix Halo**: está optimizado para la APU Ryzen AI Max+ 395 (gfx1151) y su memoria unificada. No es ejecutable en GPUs NVIDIA ni en AMD de generaciones anteriores.
- **Riesgo de alucinación**: al ser un modelo base sin alineación, la generación puede contener afirmaciones falsas o inventadas, especialmente en dominios desconocidos.
- **Sesgos**: el modelo puede reflejar los sesgos del corpus de pre-entrenamiento, aunque no se han publicado evaluaciones de sesgo específicas para este checkpoint.
- **Licencia MIT**: permite uso comercial y modificación, pero no hay garantía de soporte ni de ausencia de riesgos legales derivados del contenido generado.

## Enlaces

- [Repositorio Hugging Face del GGUF](https://huggingface.co/kingjones777/Ling-3.0-flash-base-30T-ROCmFP4-COHERENT-GGUF)
- [Modelo base en Hugging Face (inclusionAI/Ling-3.0-flash-base-30T)](https://huggingface.co/inclusionAI/Ling-3.0-flash-base-30T)
- [Página del modelo en ModelScope](https://www.modelscope.cn/models/inclusionAI/Ling-3.0-flash-base-30T)
- [Fork ROCmFPX de llama.cpp](https://github.com/charlie12345/ROCmFPX)
- [Guía completa de Ling 3.0 Flash (aimadetools)](https://www.aimadetools.com/blog/ling-3-0-flash-complete-guide/)
- [Página en llm-explorer](https://llm-explorer.com/model/inclusionAI%2FLing-3.0-flash-base-30T,6kvYgqY6wPMRM4cAMjKhpB)
