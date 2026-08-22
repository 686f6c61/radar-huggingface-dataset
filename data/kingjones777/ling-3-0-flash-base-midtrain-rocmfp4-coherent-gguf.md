# kingjones777/Ling-3.0-flash-base-midtrain-ROCmFP4-COHERENT-GGUF

## Resumen

Ling-3.0-flash-base-midtrain es un checkpoint de modelo base de la familia Ling de InclusionAI, y este repositorio concreto contiene una cuantizacion ROCmFP4 de 4 bits para hardware AMD Strix Halo (Ryzen AI Max+ 395 / Radeon 8060S, gfx1151). Se trata de un modelo MoE (mixture of experts) con 127.49 mil millones de parámetros totales, de los cuales se activan 8 expertos por token. Su arquitectura es híbrida, combinando atención lineal KDA con atención MLA (Multi-head Latent Attention), una configuración que permite procesar contextos de hasta 262.144 tokens.

Este checkpoint es la versión *midtrain*, es decir, el resultado después de la etapa de pretraining de 30 billones de tokens y de la extensión de contexto a 256K, pero antes de cualquier ajuste por instrucciones. Es un modelo base, no instructivo, diseñado para continuar el pretraining, adaptación de dominio o fine-tuning. La relevancia de esta versión cuantizada radica en que es la primera compilación ROCmFP4 de este checkpoint, que preserva el head de predicción multi-token (MTP) para acelerar la generación mediante decodificación especulativa. La licencia es MIT, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailing-hybrid (atención lineal KDA + MLA, 1 capa MLA por cada 6) |
| Parametros totales | 127.486.405.600 (127,49 B) |
| Parametros activos | no disponible (8 expertos activos de 512) |
| Longitud de contexto | 262.144 tokens (rope_theta = 6.000.000) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (heads de salida y embeddings en Q6_K) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (ROCmFP4, requiere fork ROCmFPX de llama.cpp) |

## Arquitectura y entrenamiento

Ling-3.0-flash-base-midtrain es un modelo de arquitectura híbrida que intercala dos tipos de atención: capas de atención lineal KDA (Key-Data-Attention) y capas de atención MLA (Multi-head Latent Attention). La distribución es de 1 capa MLA por cada 6 capas, es decir, aproximadamente una de cada seis capas usa MLA con una ruta de KV comprimida (`kv_lora_rank` de 512) y proyección de query amplia sin `q_lora_rank`. Esta combinación permite un equilibrio entre eficiencia computacional y capacidad de modelado de dependencias de largo alcance.

El checkpoint se denomina `midtrain` porque corresponde a la fase intermedia del entrenamiento: tras el pretraining de 30 billones de tokens y tras la extensión de contexto a 262.144 tokens, pero antes del ajuste por instrucciones. El modelo declara `tie_word_embeddings: false`, lo que permite cuantizar los embeddings y la capa de salida de forma independiente. El head MTP (multi-token prediction) se conserva integro en el archivo, incluyendo las proyecciones `nextn.eh_proj`, `nextn.enorm`, `nextn.hnorm` y `nextn.shared_head_norm`, con la forma no fusionada `attn_k_b`/`attn_v_b` que requiere el camino MTP.

## Capacidades

- Generación de texto por continuación: al ser un modelo base, su uso principal es la continuación de texto natural, sin capacidad de seguir instrucciones ni mantener diálogos.
- Decodificación especulativa multi-token: el head MTP (multi-token prediction) permite predecir varios tokens futuros a la vez, acelerando la generación un 17,5% en el hardware de prueba con `--spec-type draft-mtp`.
- Contexto largo nativo: ventana de 262.144 tokens, apta para procesar documentos extensos, libros completos o conjuntos de datos grandes en una sola pasada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modelo base: no soporta tool calling, agentes ni razonamiento multi-step por si mismo; esas capacidades requerirían un fine-tuning posterior.

## Casos de uso

- Continuación de texto de largo alcance: el modelo puede continuar documentos extensos (por ejemplo, libros técnicos, manuales o informes) de forma coherente gracias a su ventana de 262K tokens, manteniendo el contexto completo de la entrada.
- Adaptación de dominio: al ser un checkpoint base, puede someterse a fine-tuning o adaptación de dominio para tareas específicas como generación de código, resúmenes de documentos legales o análisis de literatura científica.
- Pretraining continuado: organizaciones con recursos de cómputo pueden continuar el pretraining sobre este checkpoint para especializarlo en corpus propios, sin partir de cero.
- Generación de texto con decodificación especulativa en AMD: en sistemas con ROCm y hardware Strix Halo, el formato ROCmFP4 y el head MTP permiten generar hasta 43 tokens por segundo, útil para aplicaciones de generación en tiempo real.
- Investigación de arquitecturas híbridas: sirve como base para estudiar el comportamiento de la atención lineal KDA combinada con MLA en modelos MoE a gran escala.
- Evaluación de modelos base: permite comparar el rendimiento de la etapa midtrain frente a los checkpoints base y 30T de la misma familia en tareas de modelado de lenguaje.

## Benchmarks y rendimiento

La información disponible no incluye resultados de benchmarks estándar como MMLU, HumanEval o GSM8K. El único dato de rendimiento medido es el throughput de generación en el hardware de prueba:

| Configuración | Flags | Generación (mediana) |
|---|---|---|
| Sin drafter | `--spec-type none` | 36,6 t/s |
| MTP n-max 3 | `--spec-type draft-mtp --spec-draft-ngl 999 --spec-draft-n-max 3` | 43,0 t/s |

Comparación con otros checkpoints de la familia Ling-3.0-flash-base en el mismo hardware (AMD Ryzen AI Max+ 395, Radeon 8060S, ROCm 7.2.4):

| Checkpoint | Sin drafter | MTP n-max 3 | Efecto |
|---|---|---|---|
| Ling-3.0-flash-base | 36,6 t/s | 42,3 t/s | +15,6% |
| Ling-3.0-flash-base-30T | 36,6 t/s | 41,4 t/s | +13,1% |
| Ling-3.0-flash-base-midtrain (este archivo) | 36,6 t/s | 43,0 t/s | +17,5% |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 72,1 GB en disco (67,17 GiB), pero el uso real de VRAM depende de la plataforma. En el hardware de prueba (128 GB de memoria unificada), el modelo se carga completo en GPU con `-ngl 999`.
- GPU recomendada: AMD Ryzen AI Max+ 395 / Radeon 8060S (gfx1151) con 128 GB de memoria unificada. No es compatible con GPUs NVIDIA ni con cualquier GPU AMD sin soporte ROCmFP4.
- Consumer GPU: no cabe en GPUs de consumo habitual (RTX 4090, 3090, etc.) por su tamaño y por requerir el formato ROCmFP4 específico.
- Opciones de despliegue: únicamente con el fork ROCmFPX de llama.cpp (https://github.com/charlie12345/ROCmFPX). Stock llama.cpp no puede cargar este archivo.
- Latencia y throughput: 36,6 t/s sin drafter y 43,0 t/s con MTP activado (medido en el hardware indicado, 3 repeticiones por configuración).
- Recomendación de uso: usar `-dio` (direct I/O) para evitar duplicar el modelo en memoria al hacer offload completo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Arquitectura | Licencia | Formato de pesos |
|---|---|---|---|---|---|---|
| Ling-3.0-flash-base-midtrain (este archivo) | 127,49 B | no disponible (8 expertos activos) | 262.144 | Hybrid KDA + MLA (MoE) | MIT | GGUF (ROCmFP4) |
| Ling-3.0-flash-base (versión original) | 127,49 B | no disponible | 262.144 | Hybrid KDA + MLA (MoE) | MIT | Safetensors |
| Ling-3.0-flash (versión instructiva) | 124 B | 5,1 B | 256K (extendible a 1M) | Hybrid KDA + MLA (MoE) | MIT | Safetensors |

Nota: las versiones base y midtrain comparten arquitectura y tamaño; la diferencia está en la etapa de entrenamiento (base = tras pretraining, midtrain = tras extensión de contexto, antes de instrucciones). La versión instructiva (`Ling-3.0-flash`) es la que se recomienda para chat.

## Limitaciones y advertencias

- Modelo base, no instructivo: no debe usarse para chat ni para seguir instrucciones. Aunque incluye `chat_template.jinja`, es un activo del tokenizador, no convierte los pesos en conversacionales.
- Formato de pesos propietario: el formato ROCmFP4 solo existe en el fork ROCmFPX de llama.cpp. No es compatible con llama.cpp estándar, ni con vLLM, Ollama, TGI u otros frameworks.
- Hardware restringido: requiere AMD Strix Halo (gfx1151) con ROCm 7.2.4 o superior. No funciona en GPUs NVIDIA ni en la mayoría de GPUs AMD.
- Riesgo de alucinación: como todo modelo base de lenguaje, puede generar contenido plausible pero incorrecto. No hay datos sobre sesgos específicos en la información proporcionada.
- Tamaño de archivo: 72,1 GB (67,17 GiB), requiere al menos 128 GB de memoria RAM para cargar con `-dio` y evitar duplicación de páginas.
- Limitaciones de contexto: aunque el modelo declara 262K tokens, el rendimiento con contextos muy largos puede degradarse; se recomienda medir el comportamiento real en el caso de uso.
- Sin garantías de soporte: el autor es un tercero (`kingjones777`), no el equipo de InclusionAI. La cuantización no es oficial y no hay garantías de mantenimiento ni corrección de errores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Ling-3.0-flash-base-midtrain-ROCmFP4-COHERENT-GGUF
- Modelo base original: https://huggingface.co/inclusionAI/Ling-3.0-flash-base-midtrain
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Documentación de la serie Ling: https://developer.ant-ling.com/en/docs/models/ling/
- Repositorio oficial de InclusionAI/Ling: https://github.com/inclusionAI/Ling
- Modelo en ModelScope: https://www.modelscope.cn/models/inclusionAI/Ling-3.0-flash-base-midtrain
