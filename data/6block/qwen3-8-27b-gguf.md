# 6block/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal denso de 27B parámetros (27.8B incluyendo la torre de visión) desarrollado por el equipo Qwen de Alibaba y publicado en agosto de 2026. Este repositorio contiene cuantizaciones GGUF realizadas por 6block con llama.cpp, calibradas mediante imatrix. El modelo combina una arquitectura híbrida: 16 de sus 64 capas usan atención completa grouped-query (GQA) y las otras 48 usan atención lineal Gated DeltaNet, lo que reduce drásticamente el coste de la KV cache en contextos largos. Acepta entrada de texto, imagen y vídeo, y genera texto. Su contexto nativo es de 262144 tokens, extensible con YaRN. La licencia Apache 2.0 permite uso comercial sin restricciones.

La cuantización GGUF se distribuye en 18 niveles (desde Q8_0 hasta IQ2_XXS), con un archivo separado de proyector de visión (`mmproj-*.gguf`) obligatorio para entrada de imagen o vídeo, y un head MTP opcional para decodificación especulativa. La model card incluye mediciones de perplejidad (PPL) para cada nivel, lo que permite elegir el punto óptimo entre tamaño y calidad. El repositorio publica también la matriz de calibración (`imatrix.gguf`) para auditar el proceso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas decoder, 16 de atención completa GQA (cada 4ª capa) y 48 de atención lineal Gated DeltaNet |
| Parametros totales | 27B (backbone de texto) / 27.8B (incluyendo torre de visión) |
| Parametros activos | No aplica (modelo denso, todos los parámetros activos) |
| Longitud de contexto | 262144 tokens nativo, extensible con YaRN |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, Q3_K_M, IQ3_M, Q3_K_S, IQ3_XXS, Q2_K, IQ2_M, IQ2_XS, IQ2_XXS |
| Idiomas soportados | Inglés y chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Nota: el campo de parámetros de safetensors del repositorio indica 3.391.984, un valor que no coincide con la descripción del modelo (27B). Se ha tomado como referencia la cifra de la model card.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un LLM multimodal denso con una arquitectura híbrida de atención. De sus 64 capas decoder, 16 utilizan atención completa grouped-query (con `full_attention_interval=4`, es decir, cada cuarta capa) y las 48 restantes emplean atención lineal Gated DeltaNet, una variante de atención lineal con estado recurrente de tamaño fijo que no crece con la longitud del contexto. El vocabulario es de 248320 tokens con embeddings no atados. El modelo acepta texto, imagen y vídeo como entrada, y produce texto como salida.

Los detalles específicos del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se han publicado en la información disponible. La cuantización GGUF fue realizada por 6block con llama.cpp, calibrada con imatrix usando `n_ctx=512` y una mezcla de código, inglés y chino. Se aplicaron protecciones selectivas: los tensores `ssm_alpha` y `ssm_beta` (puertas del estado de atención lineal) se mantienen en F32; las proyecciones `attn_q`, `attn_k`, `attn_v` y `attn_output` de las 16 capas de atención completa se fijan en Q8_0; y `token_embd` y `output` se fijan en Q6_K (o Q4_K por debajo de 4 bits). El autor documenta que intentar proteger adicionalmente `ssm_out`, `attn_qkv` y `attn_gate` no aporta mejora medible de PPL y aumenta el tamaño en más de 6 GiB.

## Capacidades

- Generación de texto y razonamiento multilingüe (inglés y chino).
- Comprensión multimodal: acepta imágenes y vídeo como entrada, además de texto, y produce respuestas textuales.
- Generación de código y soporte para tareas de programación (el modelo base destaca en coding según el repositorio oficial de Alibaba).
- Capacidades agénticas: diseñado para flujos de trabajo con agentes y tareas multi-paso de larga duración.
- Automatización de oficina: procesamiento de documentos, hojas de cálculo y tareas de productividad.
- Soporte de decodificación especulativa mediante el head MTP incluido en el repositorio (`mtp-*.gguf`), que acelera la inferencia.
- Contexto largo nativo de 262144 tokens, adecuado para razonamiento sobre documentos extensos o conversaciones multi-turno.
- No se documenta explícitamente soporte de tool calling / function calling en la información disponible, aunque las capacidades agénticas del modelo base sugieren que puede integrarse en pipelines de herramientas.

## Casos de uso

- Automatización de oficina: el modelo puede procesar documentos, correos electrónicos y hojas de cálculo, extrayendo información, resumiendo contenido y generando borradores de respuestas. Su contexto de 262k tokens permite manejar documentos completos sin truncamiento.
- Asistente de programación en producción: con su capacidad de generación de código y razonamiento multi-paso, puede integrarse en IDE o pipelines de CI/CD para revisión de código, generación de tests y autocompletado. La decodificación especulativa con el head MTP reduce la latencia en entornos interactivos.
- Análisis de documentos con visión: al aceptar imágenes y vídeo, puede extraer texto de capturas de pantalla, diagramas o vídeos de demostración, y responder preguntas sobre su contenido. El proyector de visión (`mmproj`) es necesario para esta función.
- Chatbot multilingüe para atención al cliente: soporta inglés y chino, con contexto largo para mantener conversaciones extensas y recordar detalles previos. La cuantización Q4_K_M (16.53 GiB) ofrece un equilibrio razonable entre calidad y requisitos de memoria.
- Razonamiento sobre documentos legales o técnicos extensos: gracias a su contexto de 262k tokens, puede analizar contratos, informes o papers completos, resumiendo cláusulas, identificando riesgos o respondiendo preguntas específicas.
- Agentes autónomos multi-paso: el modelo está diseñado para tareas agénticas de larga duración, como planificación de viajes, investigación web o gestión de proyectos, donde debe ejecutar varias acciones secuenciales y mantener estado a lo largo de la conversación.
- Generación de contenido bilingüe: puede redactar artículos, traducciones o resúmenes en inglés y chino, aprovechando su entrenamiento multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card del repositorio sí incluye mediciones de perplejidad (PPL) para cada nivel de cuantización, que se muestran a continuación como referencia de calidad relativa:

| Tier | Tamaño (GiB) | BPW | PPL |
|---|---|---|---|
| master (BF16, no incluido) | 50.11 | 16.00 | 6.7856 ± 0.07388 |
| Q8_0 | 26.12 | 8.34 | 6.7900 ± 0.07391 |
| Q6_K | 21.01 | 6.71 | 6.7951 ± 0.07403 |
| Q5_K_M | 18.70 | 5.97 | 6.8010 ± 0.07406 |
| Q5_K_S | 18.21 | 5.82 | 6.7973 ± 0.07396 |
| Q4_1 | 16.89 | 5.40 | 6.8105 ± 0.07411 |
| Q4_K_M | 16.53 | 5.28 | 6.8103 ± 0.07414 |
| IQ4_NL | 15.87 | 5.07 | 6.8491 ± 0.07484 |
| Q4_K_S | 15.68 | 5.01 | 6.8291 ± 0.07440 |
| Q4_0 | 15.62 | 4.99 | 6.8749 ± 0.07520 |
| IQ4_XS | 15.28 | 4.88 | 6.8529 ± 0.07487 |
| Q3_K_M | 13.23 | 4.23 | 7.1020 ± 0.07902 |
| IQ3_M | 12.56 | 4.01 | 7.0306 ± 0.07531 |
| Q3_K_S | 12.16 | 3.88 | 7.2176 ± 0.08074 |
| IQ3_XXS | 11.60 | 3.70 | 7.1994 ± 0.07848 |
| Q2_K | 11.11 | 3.55 | 7.4700 ± 0.08388 |
| IQ2_M | 10.50 | 3.35 | 7.5101 ± 0.08176 |
| IQ2_XS | 9.86 | 3.15 | 7.9668 ± 0.08803 |
| IQ2_XXS | 9.30 | 2.97 | 8.5638 ± 0.09560 |

El autor señala que algunos niveles son redundantes: por ejemplo, `Q5_K_M` es ligeramente mayor que `Q5_K_S` con PPL equivalente, y `Q4_1` es mayor que `Q4_K_M` con la misma calidad. Se recomienda elegir la opción más pequeña entre niveles con PPL solapada dentro del margen de error.

## Requisitos de hardware

- La memoria necesaria para inferencia se estima como `tamaño del tier + 0.9 GiB (mmproj) + KV cache`. La KV cache crece aproximadamente 64 KiB por token, por lo que 32k de contexto añade unos 2 GiB.
- Para GPUs de consumo:
  - RTX 4090 (24 GB): puede cargar Q6_K (21.01 GiB) o Q5_K_M (18.70 GiB) con margen para KV cache y mmproj.
  - RTX 4080 / 3090 (16-24 GB): Q4_K_M (16.53 GiB) o Q4_K_S (15.68 GiB) son opciones viables.
  - RTX 4060 Ti 16 GB: IQ4_XS (15.28 GiB) o Q4_K_S caben con KV cache limitada.
  - GPUs de 12 GB (RTX 3060, RTX 4070): niveles IQ3_M (12.56 GiB) o Q3_K_M (13.23 GiB) pueden funcionar con contexto reducido.
  - GPUs de 8-10 GB: solo niveles por debajo de 10 GiB (IQ2_XS, IQ2_XXS), con degradación notable de calidad.
- Para GPUs de datacenter: A100 40/80 GB o H100 pueden ejecutar Q8_0 o incluso el modelo BF16 original sin problemas.
- Opciones de despliegue: llama.cpp (compatible con GGUF), vLLM (si soporta GGUF), Ollama (mediante importación de GGUF), TGI, o Docker Model Runner con Lemonade (mencionado en el repositorio de unsloth).
- La decodificación especulativa con el head MTP puede reducir la latencia, pero requiere un archivo adicional (`mtp-*.gguf`) y soporte en el runtime.

## Comparativa con modelos similares

No se dispone de información suficiente en los datos proporcionados para realizar una comparativa con modelos de la misma categoría (mismo tamaño o misma tarea). El modelo base es Qwen3.8-27B, y este repositorio es una cuantización del mismo. Se puede comparar con otras cuantizaciones del mismo modelo (por ejemplo, las publicadas por unsloth en `unsloth/Qwen3.8-27B-GGUF`), pero no se dispone de métricas de rendimiento de tareas para establecer una comparación objetiva. Se recomienda consultar los benchmarks oficiales del equipo Qwen para el modelo base.

## Limitaciones y advertencias

- Idiomas soportados limitados a inglés y chino; el rendimiento en otros idiomas puede ser significativamente inferior.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- La cuantización degrada la calidad: los niveles por debajo de Q4_K_M (especialmente IQ2_XXS) muestran un aumento notable de PPL (de 6.81 a 8.56), lo que puede afectar a la coherencia y precisión en producción.
- El proyector de visión (`mmproj`) es obligatorio para entrada de imagen o vídeo; sin él, el modelo funciona solo como LLM de texto.
- El contexto largo (262k tokens) puede consumir mucha memoria si se usa al máximo, aunque la KV cache es más eficiente que en modelos totalmente atencionales.
- No se han publicado resultados de benchmarks de tareas estándar en la información disponible, por lo que la calidad relativa frente a otros modelos debe evaluarse empíricamente.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-27B para confirmar cualquier restricción adicional.
- El campo de parámetros de safetensors del repositorio muestra un valor inconsistente (3.391.984) que no coincide con la descripción del modelo; se recomienda verificar los metadatos antes de usar el modelo en entornos críticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/6block/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub oficial de Alibaba: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Cuantizaciones alternativas (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Seguimiento de lanzamiento: https://aireleasetracker.com/model/qwen/qwen3.8-27b
