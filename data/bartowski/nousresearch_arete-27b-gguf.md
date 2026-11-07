# bartowski/NousResearch_Arete-27B-GGUF

## Resumen

Arete-27B es un modelo de lenguaje de 27.000 millones de parámetros desarrollado por Nous Research mediante post-entrenamiento (supervised fine-tuning orientado a alineación de valores) sobre una base Qwen. Su objetivo declarado es reducir la tasa de propaganda medida en las respuestas del modelo base, que según el autor pasa del 22% al 1%, manteniendo el rendimiento general. La arquitectura subyacente es de tipo transformer con identificador `qwen3_5` en el repositorio original, y el checkpoint cuenta con 26.895.998.464 parámetros reales según safetensors.

La ficha que nos ocupa corresponde a la cuantización GGUF realizada por bartowski con llama.cpp (release b12174) e imatrix, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados. El pipeline declarado es `image-text-to-text`, es decir, soporta entrada de texto e imagen cuando se acompaña del fichero `mmproj` correspondiente.

Es relevante ahora porque aborda un problema concreto y medible —el sesgo ideológico y la propaganda en las respuestas generadas— mediante un dataset propio de pares (`NousResearch/arete-data-pairs`), y porque su licencia Apache 2.0 y su disponibilidad en GGUF lo hacen desplegable tanto en entornos de investigación como en producción local.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (identificador `qwen3_5` en el modelo base); multimodal texto-imagen con fichero `mmproj` |
| Parámetros totales | 26.895.998.464 (≈26,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S (y otras variantes de menor tamaño en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |
| Tamaño del repo | 440,0 GB |
| Decodificación especulativa | no |
| Imatrix | sí |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 27.000 millones de parámetros, identificado internamente como `qwen3_5`, lo que sugiere una arquitectura derivada de la familia Qwen. El post-entrenamiento de Nous Research se basa en *supervised fine-tuning* con un dataset propio de pares (`NousResearch/arete-data-pairs`) orientado a alineación de valores (*value-alignment*). La model card del autor menciona explícitamente la medición del problema de propaganda y una metodología de entrenamiento con profesor y dataset, aunque los detalles cuantitativos sobre número de tokens, composición exacta del corpus y uso de RLHF o DPO no están disponibles en la información proporcionada.

La innovación destacable no es arquitectónica sino de alineación: el modelo reporta una reducción de la tasa de propaganda del 22% al 1% respecto al modelo base, manteniendo el rendimiento general. Esta cuantización GGUF emplea imatrix (matriz de importancia) para preservar la calidad de los pesos más sensibles en cuantizaciones bajas, y no implementa decodificación especulativa. El prompt format utiliza tokens estilo ChatML (`<|im_start|>`, `<|im_end|>`) con un bloque `<think>` para razonamiento, y dispone de una plantilla específica para definición de herramientas y llamadas a funciones.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito mediante modo *thinking*: el prompt format fuerza la apertura de `<think>` y admite un nivel de esfuerzo de razonamiento configurable (`xhigh` en el ejemplo).
- Soporte de *tool calling* / *function calling* con un formato XML estructurado (`<tool_call>`, `<function=...>`, `<parameter=...>`) y definición de herramientas en el system prompt.
- Capacidad multimodal de entrada: texto e imagen, siempre que se cargue el fichero `mmproj` junto con los pesos.
- Alineación de valores orientada a reducir propaganda y sesgo ideológico en las respuestas.
- Capacidades multilingües: no disponibles en la información proporcionada (los idiomas no están listados).
- Razonamiento multi-paso y uso en flujos de agente, derivado del soporte de tool calling y del modo de razonamiento.

## Casos de uso

- Asistentes conversacionales con control de sesgo ideológico: el modelo está entrenado específicamente para reducir propaganda (del 22% al 1% reportado), por lo que encaja en productos donde la neutralidad de las respuestas es un requisito editorial o regulatorio.
- Agentes con acceso a herramientas: la plantilla de tool calling en XML permite integrar el modelo en orquestadores que necesiten consultar APIs (precios, bases de datos, servicios externos) y razonar antes de invocar la función.
- Análisis de documentos con imágenes: al soportar entrada texto-imagen con `mmproj`, puede emplearse para extraer y razonar sobre contenido de capturas, diagramas o documentos escaneados en local.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M (17,20 GB) y Q4_K_S (16,12 GB) permiten ejecución en GPUs de 24 GB o en configuraciones con offload a CPU, útil para prototipado y demos sin infraestructura cloud.
- Investigación en alineación: el par modelo base / modelo post-entrenado y el dataset `arete-data-pairs` permiten estudiar el efecto del SFT en la mitigación de sesgos medibles.
- Razonamiento asistido con trazas: el modo `<think>` con esfuerzo `xhigh` es adecuado para tareas de validación de supuestos y análisis de alternativas donde se quiere auditar el razonamiento intermedio.
- Procesamiento por lotes en local con llama.cpp: para pipelines de generación de texto a gran escala sin dependencia de proveedores externos, usando las variantes Q5/Q6 cuando la calidad prima sobre el tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la tasa de propaganda, que según el autor pasa del 22% (modelo base) al 1% (Arete-27B). No se dispone de datos de MMLU, HumanEval, GSM8K ni de comparativas numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada según cuantización: Q8_0 ≈ 28,67 GB; Q6_K ≈ 23,62 GB; Q5_K_M ≈ 20,68 GB; Q4_K_M ≈ 17,20 GB; Q4_K_S ≈ 16,12 GB; bf16 ≈ 53,81 GB.
- GPU recomendadas: para bf16 o Q8_0, A100 80 GB o H100; para Q6_K y Q5_K_M, A100 40 GB o RTX 6000 Ada; para Q4_K_M, RTX 4090 (24 GB) o RTX 3090.
- Cabe en GPU de consumo: sí, con Q4_K_M o inferiores en RTX 4090/3090 (24 GB); las variantes Q4_K_S y Q4_1 también son viables con margen. En GPUs de 16 GB requiere offload parcial a CPU.
- Opciones de despliegue: llama.cpp (release b12174 o superior), Ollama, y servidores compatibles con endpoints GGUF; el repo está marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B (esta ficha, GGUF) | ≈26,9B | no disponible | Apache 2.0 | GGUF | Post-entrenado para reducir propaganda (22% → 1%) |
| NousResearch/Arete-27B (base) | ≈26,9B | no disponible | Apache 2.0 | safetensors | Checkpoint original sin cuantizar |
| Modelo base Qwen subyacente (`qwen3_5`) | no disponible | no disponible | no disponible | no disponible | Referencia de arquitectura; sin datos de rendimiento en la información disponible |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por lo que no es posible verificar el mantenimiento del rendimiento general más allá de la afirmación del autor.
- La métrica de propaganda (22% → 1%) es una medición propia de Nous Research; no se detalla la metodología ni el conjunto de evaluación en la información disponible.
- Riesgo de alucinación inherente a los modelos de 27B, no cuantificado en la documentación.
- Idiomas soportados no especificados; el comportamiento multilingüe no está garantizado.
- Longitud de contexto no documentada; no se debe asumir una ventana concreta sin verificarla en el modelo base.
- Las cuantizaciones de 4 bits y menores pueden degradar la calidad respecto a bf16, especialmente en tareas de razonamiento y tool calling; se recomienda Q5_K_M o superior cuando la precisión sea crítica.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen subyacente, ya que la información disponible no detalla su licencia original.
- El modo multimodal requiere cargar el fichero `mmproj`; sin él, el modelo solo procesa texto.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/bartowski/NousResearch_Arete-27B-GGUF
- Modelo base en Hugging Face: https://huggingface.co/NousResearch/Arete-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- Release de llama.cpp utilizada: https://github.com/ggml-org/llama.cpp/releases/tag/b12174
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Noticia sobre el lanzamiento: https://aiunderstanding.org/news/nous-research-releases-arete-27b-to-reduce-chinese-ai-propaganda
