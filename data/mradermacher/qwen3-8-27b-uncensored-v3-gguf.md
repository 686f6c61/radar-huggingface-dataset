# mradermacher/Qwen3.8-27B-Uncensored-v3-GGUF

## Resumen

Qwen3.8-27B-Uncensored-v3-GGUF es la versión cuantizada en formato GGUF del modelo InterpreticAI/Qwen3.8-27B-Uncensored-v3, un ajuste fino de la familia Qwen3.8 orientado a eliminar el filtrado editorial (etiquetado por el autor como "uncensored" y "political-censorship"). El trabajo de cuantización lo firma mradermacher, un publicador habitual de quants GGUF para llama.cpp, que distribuye tanto quants estáticos (este repositorio) como quants con imatrix en un repositorio hermano.

El modelo base cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), lo que lo sitúa en la gama de 27B que da nombre al modelo. Se distribuye bajo licencia Apache 2.0 y está etiquetado únicamente para inglés, aunque al derivar de Qwen3.8 probablemente conserva parte del multilingüismo del modelo original (no confirmado en la información disponible).

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso de cuantización GGUF de un modelo de gran tamaño con soporte multimodal (el repositorio incluye ficheros mmproj), y por otro, advierte de que se trata de un modelo con los mecanismos de rechazo y alineación reducidos, lo que exige evaluación cuidadosa antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.8; detalles exactos no disponibles) |
| Parametros totales | 26.895.998.464 (≈26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (quants estáticos); el modelo base en safetensors |
| Tamano del repo | 187,9 GB (incluye todas las variantes de cuantización) |
| Cuantizacion con imatrix | disponible en repositorio separado (i1-GGUF) |
| Soporte multimodal | sí, mediante ficheros mmproj (Q8_0 y f16) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen3.8 y de su naturaleza transformer decoder-only. El repositorio documenta únicamente el proceso de cuantización: quants estáticos generados con `quantize_version: 2` y `output_tensor_quantised: 1`, a partir de una conversión de tipo `hf`. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO o ajuste por preferencias en el modelo InterpreticAI original.

El ajuste "Uncensored-v3" implica, por el nombre y las etiquetas, una reducción deliberada de los mecanismos de rechazo y del filtrado editorial del Qwen3.8 original, con especial énfasis en contenido político. Esta modificación se realizó presumiblemente mediante fine-tuning supervisado o preferencias, pero los detalles concretos no están disponibles en la información proporcionada. La presencia de ficheros mmproj sugiere que el modelo conserva la torre visual del Qwen3.8 multimodal, aunque no se confirma qué variante concreta de Qwen3.8 sirve de base.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat multi-turno.
- Razonamiento general y respuesta a instrucciones, heredado del modelo Qwen3.8 base.
- Capacidad multimodal (visión) probable, dado que el repositorio incluye ficheros mmproj; no confirmada explícitamente en la model card.
- Modo "uncensored": menor probabilidad de rechazo ante peticiones sensibles, incluido contenido político.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: la model card solo declara inglés; el multilingüismo del Qwen3.8 original no se confirma.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y censura: el modelo permite estudiar cómo varía el comportamiento de un mismo modelo base cuando se reduce el filtrado editorial, comparando respuestas frente a la versión original de Qwen3.8 en dominios políticos y sensibles.
- Generación creativa sin restricciones editoriales: útil para escritura de ficción, guiones o narrativa que aborde temas controvertidos, donde los modelos alineados suelen rechazar o suavizar el contenido.
- Análisis de discurso político: al no aplicar filtros temáticos, puede procesar y resumir textos políticos sin sesgo de rechazo, siempre que se valide la calidad factual de las salidas.
- Despliegue local en estaciones de trabajo: los quants Q4_K_M (16,6 GB) y Q5_K_M (19,3 GB) permiten ejecutar el modelo en GPUs de consumo de 24 GB (RTX 3090, RTX 4090) mediante llama.cpp u Ollama, sin depender de APIs externas.
- Prototipado de asistentes conversacionales en inglés: con contexto de chat multi-turno y licencia Apache 2.0, sirve para validar productos conversacionales antes de pasar a modelos más grandes o con más garantías de seguridad.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes de quant más dos mmproj, lo que permite medir el impacto de la cuantización en perplejidad y calidad de respuesta sobre un mismo modelo de 27B.
- Procesamiento de documentos con imágenes: si se confirma la capacidad multimodal mediante mmproj, podría usarse para tareas de OCR o descripción de imágenes en local, aunque requeriría verificación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K: ~11-13 GB.
  - Q4_K_M: ~17-20 GB.
  - Q5_K_M: ~20-23 GB.
  - Q8_0: ~29-32 GB.
- GPU recomendadas:
  - Consumo: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 4060 Ti 16 GB solo para Q2_K o Q3_K_S.
  - Profesional: A100 40/80 GB, H100 80 GB o L40S 48 GB para Q6_K y Q8_0 con contexto amplio.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con Q4_K_M o Q5_K_M; en GPUs de 16 GB solo con cuantizaciones Q2/Q3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; para el modelo base en safetensors, vLLM o TGI (no para los GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-v3 (este, GGUF) | 26,9B | no disponible | Apache 2.0 | GGUF | Ajuste sin censura, solo inglés declarado |
| InterpreticAI/Qwen3.8-27B-Uncensored-v3 | 26,9B | no disponible | Apache 2.0 | safetensors | Modelo base del que deriva este quant |
| Qwen3.8-27B (original, si existe) | ~27B | no disponible | no disponible | safetensors | Versión alineada de referencia; datos no confirmados |
| mradermacher/Qwen3.8-27B-Uncensored-v3-i1-GGUF | 26,9B | no disponible | Apache 2.0 | GGUF (imatrix) | Misma base con quants ponderados de mayor calidad |

La comparación con alternativas de la misma categoría (modelos de ~27B sin censura) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": la reducción de filtros implica mayor riesgo de generar contenido ofensivo, ilegal o dañino; no es apto para aplicaciones orientadas al público sin capas adicionales de moderación.
- Riesgo elevado de alucinación: como cualquier modelo de ~27B, puede inventar hechos, especialmente en dominios especializados; la ausencia de benchmarks impide cuantificar su fiabilidad.
- Idiomas: la model card solo declara inglés; el rendimiento en castellano no está verificado y podría degradarse respecto al Qwen3.8 original.
- Contexto: no se especifica la longitud de ventana; no asumir contextos largos sin verificación empírica.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre las salidas generadas, incluido el contenido político o sensible.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- El repositorio ocupa 187,9 GB por incluir todas las variantes; la descarga selectiva de un solo quant es imprescindible.
- Fecha de creación del repositorio (2026-11-07) y nomenclatura "Qwen3.8" no verificables de forma independiente en la información disponible; conviene contrastar con fuentes primarias antes de adoptarlo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v3-GGUF
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.8-27B-Uncensored-v3
- Quants con imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-v3-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-v3-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de quant (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por quant (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
