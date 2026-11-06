# OpenOneRec/KSA-V2-1.9B-base

## Resumen

KSA V2 1.9B base es un modelo de lenguaje de tipo transformer con una arquitectura de atención híbrida denominada Kwai Summary Attention (KSA), desarrollado por el equipo OpenOneRec de Kuaishou. Se trata de un modelo base (no ajustado a instrucciones) de 1.900 millones de parámetros, entrenado desde cero sobre un backbone Hybrid KSA, y diseñado específicamente para modelado de contexto largo. Su innovación central es el uso de tokens Summary aprendibles en los límites de chunk, que actúan simultáneamente como memoria comprimida de largo alcance y como índices dispersos para el enrutamiento por bloques.

La versión V2 introduce dos roles complementarios para estos Summary tokens: C-KSA (Compressed KSA), que agrega los KV de Summary en Meta KV compactos para una memoria de largo alcance más eficiente, y S-KSA (Sparse KSA), que emplea los Summary para construir claves de enrutamiento a nivel de bloque, seleccionando los bloques relevantes cuya KV original lee directamente la atención principal. Mantiene el layout híbrido 3:1 de Hybrid KSA, sustituyendo las capas KSA por C-KSA y las capas Full por S-KSA.

El modelo soporta hasta 131.072 tokens de contexto, está publicado bajo licencia Apache 2.0 y se distribuye en formato safetensors con pesos en FP32 que se cargan en BF16. Es relevante ahora porque ofrece una alternativa eficiente en cómputo y memoria para tareas de contexto largo, con un informe técnico reciente (arXiv:2610.18654) y código de entrenamiento disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida KSA V2 (C-KSA + S-KSA, ratio 3:1) |
| Parámetros totales | 2.097.886.720 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens de texto |
| Tipos de cuantización | No disponible (pesos publicados en FP32, carga en BF16) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code), FP32 almacenado, BF16 en carga |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer de 24 capas con hidden size de 2048, intermediate size de 6144, 16 cabezas de atención Q y 16 KV (MHA) con dimensión de cabeza 128, y embeddings no atados. La columna vertebral es un backbone Hybrid KSA entrenado desde cero, con un layout de capas 3:1 entre C-KSA y S-KSA. En C-KSA, un pooling aprendible por dimensión comprime grupos de KV de Summary en Meta KV dentro de cada capa de atención, mientras que los Summary tokens continúan por el backbone con su granularidad de chunk original (chunk size 8). En S-KSA, una query de Summary agrega cada bloque de texto en una representación de baja dimensión para enrutamiento; un Indexer ligero (8 cabezas × 128 dimensiones, rango de query 512, dimensión RoPE 64) selecciona los bloques relevantes y la atención principal lee la KV original de dichos bloques junto con sinks y contexto local.

La adaptación se realiza en tres etapas: warmup del módulo de compresión, CPT completo de C-KSA, y warmup de agregación S-KSA e Indexer. La etapa final congela los parámetros heredados y exporta el checkpoint directamente para inferencia dispersa. El presupuesto remoto de S-KSA es de 4096 tokens (incluyendo 8 tokens sink) y la ventana local es de 1024 tokens adicionales. El Indexer se supervisa con un profesor de atención densa con pooling max por bloques. No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF o DPO (el modelo es base, no instruction-tuned).

## Capacidades

- Generación de texto autoregresiva en inglés y chino.
- Modelado de contexto largo de hasta 131.072 tokens, con recuperación de información a larga distancia mediante memoria comprimida (C-KSA) y enrutamiento disperso (S-KSA).
- Razonamiento y modelado de lenguaje general como modelo base (no ajustado a instrucciones).
- Capacidad de servir como base para fine-tuning posterior (instruction tuning, tareas específicas).
- No se documenta soporte nativo de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni multi-step reasoning explícito (al ser un modelo base, no está optimizado para ello).
- No se documenta capacidad de visión ni audio.
- No se documenta modo thinking.

## Casos de uso

- Procesamiento de documentos largos: el modelo puede ingerir hasta 131.072 tokens en una sola pasada, lo que permite resumir o extraer información de contratos, informes o expedientes completos sin truncamiento, aprovechando la memoria comprimida de C-KSA.
- Recuperación de información en contexto largo: con S-KSA y su enrutamiento por bloques, es adecuado para tareas de question answering sobre corpus extensos donde la respuesta depende de fragmentos distribuidos a lo largo de decenas de miles de tokens.
- Base para fine-tuning de asistentes conversacionales: al ser un modelo base de 1.9B, sirve como punto de partida para instruction tuning en dominios verticales (legal, financiero, sanitario) con requisitos de contexto largo.
- Análisis de código en repositorios: puede procesar archivos y contextos de código extensos para tareas de completado o detección de dependencias, aunque su soporte de tool calling no está documentado.
- Investigación en arquitecturas de atención eficiente: el modelo es un artefacto de referencia para reproducir y comparar los resultados de KSA V2 frente a atención densa en regímenes de contexto largo.
- Generación de texto bilingüe en/zh: adecuado para pipelines de generación o traducción asistida entre inglés y chino, aunque sin garantías de calidad conversacional al no estar instruido.
- Despliegue en entornos con restricciones de memoria: gracias a la compresión de KV de C-KSA y al presupuesto remoto acotado de S-KSA, el modelo reduce el coste de caché KV frente a atención densa a igual contexto, lo que facilita servir contextos largos en hardware más modesto.

## Benchmarks y rendimiento

La model card incluye una tabla de recuperación en contexto largo para el modelo de 1.9B (C-KSA group128, S-KSA block4, comparado con Hybrid KSA como modelo padre), con columnas para 4K, 8K, 16K, 32K, 64K, 128K y media. Sin embargo, los valores numéricos de dicha tabla no están disponibles en la información proporcionada (la tabla aparece truncada). No se han publicado en la información disponible los resultados numéricos de benchmarks como MMLU, HumanEval o GSM8K.

| Benchmark | Resultado |
|---|---|
| Recuperación en contexto largo (4K–128K) | Valores no disponibles en la información proporcionada |
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,2 GB solo para pesos (2.097.886.720 parámetros × 2 bytes), más el coste de la caché KV y activaciones, que depende de la longitud de contexto.
- En FP32 (formato de almacenamiento), los pesos ocupan aproximadamente 8,4 GB, coincidiendo con el tamaño del repositorio.
- GPU recomendadas: para contexto corto, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para BF16. Para contextos de 128K, se recomienda A100 (40/80 GB) o H100 (80 GB) por el coste de caché KV y activaciones, aunque la compresión de C-KSA y el presupuesto remoto acotado de S-KSA reducen dicho coste frente a atención densa.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para contexto corto en BF16; para contextos largos se requiere más memoria.
- Opciones de despliegue: transformers (librería indicada), text-generation-inference (tag endpoints_compatible). No se documenta soporte explícito de vLLM, llama.cpp u Ollama en la información disponible; el uso de custom_code puede requerir confiar en código remoto.
- Latencia y throughput: no disponibles en la información proporcionada. La model card menciona gráficas de FLOPs teóricos por token y tamaño de caché KV, pero sin cifras concretas en el texto disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| KSA V2 1.9B base | 2,1B | 131.072 | Apache 2.0 | Atención híbrida C-KSA/S-KSA, base no instruido |
| KSA-4B-base (OpenOneRec) | 4B (no confirmado en detalle) | No disponible | No disponible | Modelo de la misma familia, publicado en 2026-05-08 |
| KSA-v2-4B (OpenOneRec) | 4B | 131.072 | No disponible | 36 capas, GQA 32/8, CPT desde Qwen3-4B |
| Qwen3-4B | 4B | No disponible | No disponible | Base del KSA-v2-4B según la model card |

No se dispone de datos de rendimiento comparativo numérico en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base, no ajustado a instrucciones: no sigue instrucciones de forma fiable ni está alineado para uso conversacional directo.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin alineación RLHF/DPO documentada.
- Sesgos potenciales derivados de los datos de entrenamiento, cuya composición no se detalla.
- Soporte limitado a inglés y chino; no se documentan otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el uso de custom_code implica ejecutar código remoto del repositorio, lo que requiere revisión de seguridad en producción.
- El rendimiento en contextos muy largos depende de la configuración de C-KSA (group size 128) y S-KSA (block size 4, presupuesto remoto 4096 tokens); configuraciones distintas a las publicadas pueden degradar la calidad.
- No se documentan garantías de tool calling, agentes ni multi-step reasoning, por lo que no debe asumirse su funcionamiento en esos escenarios sin validación empírica.
- Los pesos se almacenan en FP32 (8,4 GB), lo que incrementa los requisitos de almacenamiento y transferencia frente a versiones cuantizadas.

## Enlaces

- Hugging Face: https://huggingface.co/OpenOneRec/KSA-V2-1.9B-base
- Informe técnico KSA V2: https://arxiv.org/abs/2610.18654
- Informe técnico KSA: https://arxiv.org/abs/2604.24432
- Repositorio GitHub: https://github.com/Kuaishou-OneRec/KSA
- Modelo KSA-4B-base: https://huggingface.co/OpenOneRec/KSA-4B-base
- README en chino: README_zh.md (en el repositorio)
