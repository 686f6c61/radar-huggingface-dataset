# Enntity/Sage-S2.1-Flash-NVFP4

## Resumen

Sage-S2.1-Flash-NVFP4 es una cuantización calibrada de 4 bits del modelo internlm/Sage-S2.1-Flash, publicada por Enntity. El modelo base es un transformer multimodal de tipo image-text-to-text con arquitectura híbrida de atención (capas de atención lineal, capas de atención indexada y una torre de visión), diseñado para el ecosistema SparkGLM sobre hardware NVIDIA DGX Spark. Esta versión reduce el peso de 643 GB en BF16 a 179 GB, manteniendo una fidelidad medida frente al original (KL de 0,0531 y 94,5 % de acuerdo top-1).

El interés de esta ficha reside en que no es un modelo nuevo, sino un checkpoint cuantizado con un esquema mixto muy específico (NVFP4 para expertos enrutados, MXFP8 y FP8 para proyecciones de atención y MLP denso, BF16 para visión, embeddings, normas y routers). El autor documenta el proceso de calibración con GPTQ por experto y publica métricas de fidelidad por categoría, algo poco habitual en checkpoints cuantizados.

El modelo está pensado para servirse en dos o cuatro NVIDIA DGX Spark mediante SparkGLM, con soporte de texto, imagen y vídeo, tool calling y razonamiento multi-paso. La licencia es MIT, igual que la del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal híbrido: 34 capas de atención lineal, 11 capas de atención indexada, 42 capas de expertos enrutados (288 expertos por capa), torre de visión, capa MTP (multi-token prediction) |
| Parámetros totales | 342.798.954.914 (≈342,8 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (expertos enrutados, capas 3-44), MXFP8 con bloques 1×32 (proyecciones de atención lineal, MLP denso de capas 0-2, `lm_head`), FP8 con bloques 128×128 (proyecciones de atención indexada excepto `kv_b_proj`, expertos compartidos), BF16 (torre de visión, embeddings, normas, routers, `kv_b_proj`) |
| Idiomas soportados | no disponible (la calibración incluye prosa en inglés y multilingüe, y prosa japonesa en la evaluación) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 178,7 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal con una mezcla de mecanismos de atención: 34 capas de atención lineal, 11 capas de atención indexada y 42 capas con mezcla de expertos (288 expertos enrutados por capa). Incorpora además una torre de visión para entrada de imagen y vídeo, y una capa de multi-token prediction (MTP). Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada.

Esta versión cuantizada se generó con GPTQ para los expertos enrutados, usando una matriz de Hessian por experto calculada a partir de las entradas propias de ese experto, con 600.000 tokens de calibración. Las matrices de 8 bits (MXFP8 y FP8) se recalibraron contra las entradas de capa con 200.000 tokens de calibración, recuperando precisión frente al redondeo simple (KL de 0,0625 a 0,0531). La calibración usó 2.229 secuencias (2,4 millones de tokens disponibles, 600.000 usados para los expertos) de datasets públicos: chat de razonamiento, chat plano, tool calling, código, prosa en inglés y multilingüe, ciencia y matemáticas. No se partió de ningún otro checkpoint cuantizado.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo razona antes de responder incluso cuando se desactiva el modo thinking en la petición.
- Entrada multimodal: texto, imágenes y vídeo (pipeline image-text-to-text). Los proyectores de entrada científica del modelo base no están incluidos en esta cuantización.
- Tool calling / function calling: soporta elección automática de herramienta y elección forzada (`tool_choice` con nombre de herramienta, `required` o `any`), aunque la elección forzada requiere SparkGLM 0.3.6 o superior.
- Tareas agénticas: la suite de cualificación de SparkGLM reporta 20 de 20 tareas agénticas superadas y 21 de 21 llamadas a herramientas.
- Generación de código y salida estructurada: decodificación de código a 67,9 tok/s y de salida estructurada a 90,0 tok/s en dos DGX Spark.
- Capacidades multilingües: la evaluación incluye prosa en inglés y japonés; el conjunto exacto de idiomas soportados no está disponible.
- Recuperación en contexto largo: 12 de 12 en la prueba de retrieval de contexto largo de SparkGLM.
- Aritmética y matemáticas: 39 de 40 en la prueba aritmética de SparkGLM.

## Casos de uso

- Asistente conversacional multimodal: el modelo acepta texto, imagen y vídeo en la misma petición, por lo que puede gestionar conversaciones multi-turno donde el usuario adjunta capturas, diagramas o clips. Es adecuado porque la torre de visión se mantiene en BF16, sin pérdida de precisión por cuantización.
- Automatización de soporte técnico con tool calling: con elección automática de herramienta puede decidir cuándo consultar una API, un CRM o una base de conocimiento. La fidelidad en tool calling es la categoría donde esta cuantización mejora más frente a la alternativa (KL 0,2772 frente a 0,4176; 85,93 % frente a 81,53 % de acuerdo top-1).
- Pipelines de generación de código: la decodificación de código alcanza 67,9 tok/s en dos DGX Spark, con una fidelidad en código de KL 0,0276 y 96,84 % de acuerdo top-1, adecuada para autocompletado y revisión en CI/CD.
- Agentes multi-paso sobre documentos largos: la suite de cualificación reporta 12 de 12 en retrieval de contexto largo y 20 de 20 en tareas agénticas, lo que lo hace apto para flujos de investigación que encadenan búsqueda, lectura y síntesis.
- Análisis de documentación científica y matemática: la fidelidad en ciencia (KL 0,0159) y matemáticas (KL 0,0199) es de las más altas del checkpoint, y la prueba aritmética supera 39 de 40, por lo que sirve para extracción y razonamiento sobre papers y tablas.
- Despliegue en infraestructura de borde con DGX Spark: el checkpoint está empaquetado para cargarse en dos o cuatro DGX Spark con SparkGLM, con un pool de caché de prompt de 2,22 millones de tokens, lo que permite servir varias sesiones concurrentes en hardware compacto.
- Salida estructurada y extracción de datos: la decodificación de salida estructurada a 90,0 tok/s y la fidelidad en tool calling lo hacen adecuado para generar JSON validado en pipelines de ingestión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados son de fidelidad frente al modelo BF16 y de velocidad en DGX Spark.

Fidelidad frente a BF16 (224 documentos reservados, 239.711 posiciones evaluadas, intervalos bootstrap del 95 %):

| Métrica | Este checkpoint | Bizuayeu/Sage-S2.1-Flash-Mixed-NVFP4 |
|---|---|---|
| KL | 0,0531 [0,0441; 0,0631] | 0,0676 [0,0548; 0,0819] |
| Acuerdo top-1 | 94,50 % [94,10; 94,88] | 93,89 % |
| Incremento de NLL | +0,64 % | +0,66 % |

Fidelidad por categoría (32 documentos por categoría, KL y acuerdo top-1):

| Categoría | Este checkpoint | Bizuayeu Mixed-NVFP4 |
|---|---|---|
| Chat de razonamiento | 0,0573; 95,35 % | 0,0679; 94,35 % |
| Código | 0,0276; 96,84 % | 0,0263; 96,92 % |
| Matemáticas | 0,0199; 96,35 % | 0,0234; 96,11 % |
| Prosa en inglés | 0,0424; 94,25 % | 0,0415; 94,40 % |
| Prosa en japonés | 0,0265; 94,04 % | 0,0280; 93,64 % |
| Ciencia | 0,0159; 95,18 % | 0,0163; 95,11 % |
| Tool calling | 0,2772; 85,93 % | 0,4176; 81,53 % |

Velocidad en dos DGX Spark (tensor parallel 2, modo Spark, medianas de tres ejecuciones):

| Métrica | Sage S2.1 Flash NVFP4 | GLM-5.3-Flash FP4-Local |
|---|---|---|
| Decodificación de prosa | 38,6 tok/s | 37,7 tok/s |
| Decodificación de código | 67,9 tok/s | 66,1 tok/s |
| Decodificación de salida estructurada | 90,0 tok/s | 88,8 tok/s |
| Pool de caché de prompt | 2,22 M tokens | 2,38 M tokens |

Pruebas de cualificación de SparkGLM: 109 de 109 en SparkGLM 0.3.6 (97 de 109 en 0.3.5); preguntas de imagen 3 de 3; preguntas de vídeo 2 de 2; aritmética 39 de 40; retrieval de contexto largo 12 de 12; tool calls 21 de 21; tareas agénticas 20 de 20.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 179 GB en disco; en inferencia necesita al menos ese espacio en memoria agregada de las GPU, más overhead de activaciones y caché KV.
- GPU recomendadas: NVIDIA DGX Spark, en configuraciones de dos (tensor parallel 2) o cuatro unidades. El autor no documenta otros aceleradores.
- GPU de consumo: no disponible; el tamaño del checkpoint (179 GB) y el requisito de SparkGLM lo sitúan fuera del alcance de una GPU de consumo individual.
- Opciones de despliegue: SparkGLM 0.3.6 (o superior) sobre DGX Spark, instalado mediante LLooM. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 38,6 tok/s en prosa, 67,9 tok/s en código y 90,0 tok/s en salida estructurada con dos DGX Spark; pool de caché de prompt de 2,22 millones de tokens.
- Modo de servicio: se recomienda el modo Spark (por defecto en `start.sh` de SparkGLM y en la receta de LLooM), que limita el razonamiento previo. En modo Strict la suite de cualificación baja a 97 de 109.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Enntity/Sage-S2.1-Flash-NVFP4 | 342,8 mil millones | no disponible | safetensors NVFP4/MXFP8/FP8/BF16 | MIT | Hugging Face, 209 descargas |
| Bizuayeu/Sage-S2.1-Flash-Mixed-NVFP4 | mismo modelo base | no disponible | safetensors mixto (mantiene proyecciones de atención lineal y `lm_head` en BF16) | no disponible | Hugging Face |
| GLM-5.3-Flash FP4-Local | no disponible | no disponible | FP4 | no disponible | citado en la model card como referencia de velocidad |
| internlm/Sage-S2.1-Flash (BF16) | 342,8 mil millones | no disponible | safetensors BF16 (643 GB) | MIT | Hugging Face |

Frente a Bizuayeu/Sage-S2.1-Flash-Mixed-NVFP4, este checkpoint tiene menor KL (0,0531 frente a 0,0676) y mayor acuerdo top-1 (94,50 % frente a 93,89 %), con la mayor diferencia en tool calling. Frente al modelo BF16, ocupa 179 GB en lugar de 643 GB con un incremento de NLL de +0,64 %.

## Limitaciones y advertencias

- La cuantización introduce una degradación medible: KL de 0,0531 y 94,50 % de acuerdo top-1 frente al BF16, con un incremento de NLL de +0,64 %. La categoría más afectada es tool calling (KL 0,2772, 85,93 % de acuerdo top-1).
- Los proyectores de entrada científica del modelo base no están incluidos, por lo que las capacidades de entrada científica del original no están disponibles en este checkpoint.
- La elección forzada de herramienta (`tool_choice` con nombre, `required` o `any`) puede devolver la llamada como texto en SparkGLM 0.3.5; requiere SparkGLM 0.3.6 o superior.
- El modelo razona antes de responder incluso con el thinking desactivado; en modo Strict esto provoca fallos en 12 de 109 pruebas de la suite de cualificación. Se recomienda el modo Spark.
- Solo se documenta despliegue en DGX Spark con SparkGLM; no hay soporte verificado para vLLM, llama.cpp, Ollama o TGI.
- El conjunto exacto de idiomas soportados no está disponible; la evaluación cubre inglés y japonés, y la calibración incluye prosa multilingüe sin especificar idiomas.
- Riesgo de alucinación y sesgos: no hay información publicada en la documentación proporcionada sobre evaluación de sesgos o tasas de alucinación del modelo base ni de esta cuantización.
- La licencia MIT permite uso comercial, pero se heredan las condiciones y limitaciones del modelo base internlm/Sage-S2.1-Flash.
- El pool de caché de prompt (2,22 millones de tokens) varía unos pocos por ciento entre arranques, según el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Enntity/Sage-S2.1-Flash-NVFP4
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Checkpoint alternativo citado: https://huggingface.co/Bizuayeu/Sage-S2.1-Flash-Mixed-NVFP4
- Repositorio SparkGLM: https://github.com/Enntity/sparkglm
- Release SparkGLM 0.3.6: https://github.com/Enntity/sparkglm/releases/tag/v0.3.6
- Resultados de la suite 0.3.6: https://github.com/Enntity/sparkglm/blob/v0.3.6/results/2026-11-18-0.3.6/RESULT.md
- Repositorio LLooM: https://github.com/Enntity/lloom
- Pull request del fix de tool choice forzado: https://github.com/Enntity/atlas/pull/33
