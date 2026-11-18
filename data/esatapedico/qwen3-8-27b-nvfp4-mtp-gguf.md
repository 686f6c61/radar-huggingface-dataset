# esatapedico/Qwen3.8-27B-NVFP4-MTP-GGUF

## Resumen

Qwen3.8-27B-NVFP4-MTP-GGUF es una familia de nueve ficheros GGUF publicada por el usuario esatapedico a partir del checkpoint `unsloth/Qwen3.8-27B-NVFP4`. El modelo subyacente es Qwen3.8-27B, un modelo denso de 27.000 millones de parametros con arquitectura hibrida Gated DeltaNet + Gated Attention, capacidad nativa de vision y video (VLM), contexto nativo de 262.144 tokens y una cabeza MTP (multi-token prediction) para decodificacion especulativa. El repositorio no entrena ni afina el modelo: lo convierte a formato GGUF preservando la densidad nativa NVFP4 para GPUs Blackwell (sm_120).

La relevancia de esta publicacion esta en la escalera de precision: ofrece desde una conversion fiel al checkpoint original (`ORIG`, 33,13 GB) hasta variantes compactas de 14,86 GB que comparten un backbone NVFP4 byte-identico de 448 tensores y difieren solo en los diez tensores de cabecera (LM head, embeddings y cabeza MTP). Eso permite desplegar un VLM de 27B con contexto de 256K en configuraciones de dos GPUs consumer de 16 GB, algo que con cuantizaciones tradicionales Q4/Q5 resulta inviable sin sacrificar el backbone.

El modelo conserva la cabeza MTP integrada en cada fichero, de modo que la decodificacion especulativa funciona sin un drafter separado. La licencia es Apache 2.0 y el pipeline declarado es text-generation, con etiquetas de vision y multimodal. El repo acumula 269.268 descargas y 122 likes desde su creacion en agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Gated DeltaNet + Gated Attention, denso, con cabeza MTP de decodificacion especulativa y proyector visual (VLM) |
| Parametros totales | 460.730.096 (dato reportado en safetensors del repo); la model card describe el modelo base como Qwen3.8-27B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (backbone), BF16, Q8_0, Q6_K, Q5_0, Q4_K, IQ4_XS, Q3_K, Q2_K, F32 (normas y escalas) |
| Idiomas soportados | en, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); checkpoint base en NVFP4 safetensors |

Tamano de los ficheros publicados:

| Fichero | Tamano | lm_head | token_embd | MTP head | Attention |
|---|---|---|---|---|---|
| ORIG | 33,13 GB | BF16 | BF16 | BF16 | BF16 (F8 dequantizado) |
| VERY-LOW | 14,86 GB | Q3_K | Q2_K | Q2_K | NVFP4 |
| COMPACT-LOW | 15,16 GB | Q4_K | Q3_K | Q2_K | NVFP4 |
| LOW | 15,53 GB | Q5_0 | IQ4_XS | IQ4_XS | NVFP4 |
| MEDIUM | 16,38 GB | Q8_0 | Q6_K | IQ4_XS | NVFP4 |
| MID-HIGH | 16,90 GB | Q8_0 | Q8_0 | Q8_0 | NVFP4 |
| HIGH | 17,57 GB | BF16 | Q6_K | IQ4_XS | NVFP4 |
| VERY-HIGH | 19,69 GB | BF16 | BF16 | BF16 | NVFP4 |
| HIGHEST | 23,19 GB | Q8_0 | BF16 | BF16 | Q8_0 |
| mmproj-BF16 | 931 MB | — | — | — | proyector de vision |

## Arquitectura y entrenamiento

La model card describe el modelo base como un transformer denso de 27B con layout hibrido de Gated DeltaNet y Gated Attention, 64 capas de transformer mas un bloque adicional (`blk.64`) que implementa la cabeza MTP. El contexto nativo es de 262.144 tokens. La arquitectura incorpora atencion lineal (linear_attn) junto a self-attention clasica, y un proyector visual que habilita entrada de imagenes y video.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni las etapas de alineacion (RLHF, DPO u otras) en la informacion proporcionada. El repositorio es exclusivamente una conversion de formato: el autor no reporta fine-tuning ni modificacion de pesos mas alla de la re-cuantizacion. La innovacion tecnica destacable es la preservacion de NVFP4 como tipo de tensor nativo en GGML para el backbone (448 tensores byte-identicos en las siete variantes compactas), combinada con la integracion de la cabeza MTP en el mismo fichero para decodificacion especulativa sin drafter externo. La conversion `ORIG` dequantiza la atencion F8 del checkpoint fuente a BF16 porque GGML no dispone de tipo de tensor F8.

## Capacidades

- Generacion de texto y razonamiento en ingles y multilingue.
- Vision nativa: procesamiento de imagenes y video mediante el proyector `mmproj-BF16.gguf` (se carga con `--mmproj` en llama.cpp).
- Decodificacion especulativa mediante cabeza MTP integrada, sin modelo drafter separado.
- Contexto largo de hasta 262.144 tokens para documentos extensos, conversaciones multi-turno y analisis de repositorios completos.
- Capacidad multimodal combinada: texto + imagen + video en la misma ventana de contexto.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modo thinking; debe verificarse contra la model card del modelo base.

## Casos de uso

- Analisis de documentos extensos: con 262.144 tokens de contexto, el modelo puede ingerir contratos, expedientes o bases de codigo completas en una sola pasada sin chunking, manteniendo coherencia entre secciones distantes.
- Procesamiento de video e imagenes en pipelines de inspeccion: el proyector BF16 y la ventana de contexto permiten describir, resumir o extraer informacion de secuencias de fotogramas en tareas de monitorizacion o catalogacion de contenido.
- Despliegue en estaciones de trabajo con dos GPUs de 16 GB: las variantes VERY-LOW a MID-HIGH (14,86-16,90 GB) caben en configuraciones consumer Blackwell, habilitando inferencia local de un VLM de 27B sin depender de la nube.
- Generacion aumentada por recuperacion (RAG) de alta densidad: el contexto de 256K admite insertar decenas de fragmentos recuperados junto con instrucciones e historial, reduciendo la perdida de informacion que sufren modelos con ventanas de 8K-32K.
- Transcripcion y descripcion de contenido audiovisual accesible: generacion de descripciones textuales de video para subtitulado, alt-text o indexacion semantica de archivos multimedia.
- Prototipado de asistentes multimodales en local: la licencia Apache 2.0 y el soporte en llama.cpp permiten iterar sobre productos sin restricciones de uso comercial ni cuotas de API.
- Evaluacion comparativa de cuantizaciones: la escalera de nueve ficheros permite medir el impacto de la precision de cabeceras (Q2_K a BF16) sobre la calidad de salida con un backbone fijo, util para calibrar compromisos tamano/calidad en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el autor publica actualizaciones y benchmarks en su sitio web, pero no incluye cifras de MMLU, HumanEval, GSM8K ni otras metricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: desde ~15 GB para VERY-LOW hasta ~33 GB para ORIG; el proyector de vision anade ~0,93 GB.
- GPUs recomendadas: Blackwell (sm_120) para aprovechar NVFP4 de forma nativa; el autor valida el funcionamiento en una configuracion de dos GPUs de 16 GB.
- Cabe en consumer GPU: si, en GPUs Blackwell de 16 GB o mas (por ejemplo, dos RTX 5060 Ti de 16 GB, o una RTX 5080/5090 para las variantes mayores); las variantes compactas estan disenadas explicitamente para ese perfil.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, carga del proyector con `--mmproj`); no se documenta soporte en vLLM, TGI ni Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles. La decodificacion especulativa via MTP deberia reducir la latencia de decodificacion respecto a un modelo sin drafter, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4-MTP-GGUF (este) | 27B (denso) | 262.144 | Si (imagen + video) | Apache 2.0 | GGUF (NVFP4) | Nueve variantes de precision, MTP integrado |
| unsloth/Qwen3.8-27B-NVFP4 | 27B (denso) | 262.144 | Si | Apache 2.0 | safetensors NVFP4 | Checkpoint fuente, sin conversion GGUF |
| unsloth/Qwen3.8-27B-GGUF | 27B (denso) | 262.144 | Si | Apache 2.0 | GGUF | Proyector identico al incluido aqui; cuantizaciones convencionales |
| esatapedico/Qwen3.8-27B-NVFP4-BUDGET-GGUF | 27B (denso) | 262.144 | Si | Apache 2.0 | GGUF (NVFP4) | Variante recortada sin MTP para 16 GB, cabeceras al minimo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o robustez para esta conversion; hereda los sesgos del checkpoint base Qwen3.8-27B, no documentados aqui.
- Riesgo de alucinacion inherente a los modelos generativos; no se aportan tasas de error ni evaluaciones de fidelidad.
- Las variantes con cabeceras en Q2_K/Q3_K (VERY-LOW, COMPACT-LOW) degradan la calidad del LM head y de los embeddings; el autor las situa como opciones de compromiso para VRAM muy limitada, no como configuracion por defecto.
- NVFP4 requiere soporte de GPU Blackwell (sm_120); en hardware anterior el rendimiento puede degradarse o requerir de-cuantizacion, extremo no detallado en la informacion disponible.
- El contexto nativo es de 262.144 tokens, pero no se documenta el rendimiento efectivo (calidad de recuperacion) en longitudes cercanas al limite.
- La model card solo declara ingles y multilingue sin listado de idiomas; el soporte real por idioma no esta cuantificado.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse en su propia model card.
- El dato de parametros totales del repo safetensors (460.730.096) no concuerda con la denominacion "27B" del modelo; conviene tratar la cifra con cautela hasta confirmacion.
- El repositorio ocupa 290,8 GB; la descarga selectiva de un unico fichero requiere usar el patron de ficheros de Hugging Face.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/esatapedico/Qwen3.8-27B-NVFP4-MTP-GGUF
- Modelo base (checkpoint NVFP4): https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- GGUF de referencia con proyector identico: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Variante recortada para 16 GB: https://huggingface.co/esatapedico/Qwen3.8-27B-NVFP4-BUDGET-GGUF
- Sitio del autor (actualizaciones y benchmarks): https://www.esatapedico.com
