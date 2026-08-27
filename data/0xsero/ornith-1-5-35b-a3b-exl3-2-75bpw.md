# 0xSero/Ornith-1.5-35B-A3B-EXL3-2.75bpw

## Resumen

Ornith-1.5-35B-A3B-EXL3-2.75bpw es una cuantización comunitaria en formato EXL3 (ExLlamaV3) del modelo base ornith-ai/Ornith-1.5-35B-A3B, desarrollada por 0xSero. No es un lanzamiento oficial del equipo de Ornith, sino una adaptación pensada para reducir el peso del modelo (~17 GB frente a ~70 GB en BF16) manteniendo la calidad mediante una asignación de bits selectiva: los expertos enrutados se comprimen a 2.75 bpw, mientras que el backbone de atención (GatedDeltaNet y full attention) se conserva íntegro en BF16.

El modelo base es un MoE de ~35 mil millones de parámetros totales con ~3 mil millones activos por token, que combina atención lineal GatedDeltaNet en 30 de sus 40 capas con atención completa en las 10 restantes. Soporta contexto nativo de 256K tokens, entrada multimodal (imagen y texto) y decodificación especulativa MTP. Esta cuantización está orientada a despliegues en hardware consumer de gama alta, como 4× RTX 3090, y es compatible con TabbyAPI y vLLM.

La relevancia de esta ficha radica en que demuestra una estrategia de cuantización alternativa a los métodos estándar (como el switch `-hq` de EXL3), que prioriza la integridad de las proyecciones de atención lineal por encima de los expertos redundantes. Los resultados de la model card muestran una divergencia KL de 0.1005 frente al base BF16, con una perplejidad dentro del ruido estadístico, lo que la convierte en una opción viable para producción en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) con 256 expertos enrutados (top-8), atención lineal GatedDeltaNet en 30/40 capas, full attention en 10/40, MTP draft layer, torre de visión |
| Parametros totales | ~35 mil millones (modelo base); archivo safetensors cuantizado: 8.696.061.808 (~8.7 mil millones) |
| Parametros activos | ~3 mil millones por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | EXL3: expertos enrutados a 2.75 bpw (MCG codebook), backbone BF16, MTP a 4 bpw, torre de visión BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura MoE con 256 expertos y enrutamiento top-8, lo que activa aproximadamente 3 mil millones de parámetros por token. Su innovación principal es el uso de GatedDeltaNet, una variante de atención lineal recurrente, en 30 de las 40 capas del transformer; las 10 capas restantes usan atención completa (full attention). Esta combinación reduce el coste computacional del contexto largo manteniendo la capacidad de modelado de dependencias a corto plazo. El modelo incluye además una capa MTP (multi-token prediction) para decodificación especulativa y una torre de visión que permite entrada multimodal.

La cuantización EXL3 aquí descrita aplica una capa de mapa de bits no estándar: los expertos enrutados (que representan ~90% de los parámetros) se comprimen a 2.75 bpw con codebook MCG, mientras que las proyecciones de GatedDeltaNet, las de atención completa, los expertos compartidos, embeddings, lm_head, normas y router se mantienen en BF16. Esta decisión se justifica porque las proyecciones de atención lineal son el único canal de información en 30 de 40 capas y son muy sensibles a la cuantización, mientras que los expertos enrutados son redundantes y toleran mayor compresión. La conversión se realizó con exllamav3 1.4.2, calibración estándar de 250 filas × 2048 tokens, y requiere un parche en el runtime 1.4.3 para cargar las proyecciones GatedDeltaNet sin cuantizar en modo tensor-parallel.

## Capacidades

- Generación de texto y conversación multi-turno con contexto de hasta 256K tokens.
- Razonamiento complejo y resolución de problemas matemáticos y lógicos (capacidad heredada del modelo base, no verificada en esta cuantización).
- Generación de código y asistencia en programación (soporte esperado, no confirmado en la documentación del quant).
- Entrada multimodal: procesamiento de imágenes junto con texto (image-text-to-text), gracias a la torre de visión en BF16.
- Decodificación especulativa MTP: la capa draft a 4 bpw permite acelerar la generación en runtime compatible.
- Soporte de agentes y multi-step reasoning: el contexto largo y la capacidad de razonamiento permiten encadenar múltiples pasos, aunque no se documenta tool calling explícito.
- Capacidades multilingües: no disponibles en la documentación.

## Casos de uso

- Asistente de análisis de documentos extensos: con 256K tokens de contexto, el modelo puede procesar libros técnicos completos, informes anuales o expedientes legales en una sola pasada, resumiendo y extrayendo información relevante sin necesidad de chunking.
- Generación de código en entornos de desarrollo integrado: el modelo puede autocompletar funciones, generar tests y refactorizar código en repositorios grandes, aprovechando el contexto largo para mantener coherencia con el estilo del proyecto.
- Chatbot de atención al cliente con historial prolongado: la ventana de 256K permite mantener conversaciones de cientos de turnos sin perder el hilo, ideal para soporte técnico especializado.
- Análisis de imágenes médicas o técnicas con descripción textual: la torre de visión en BF16 permite combinar entrada de imagen y texto para generar informes descriptivos o responder preguntas sobre la imagen.
- Motor de razonamiento para pipelines de agentes autónomos: el modelo puede planificar y ejecutar tareas multi-paso (búsqueda, extracción, síntesis) gracias a su capacidad de razonamiento y contexto largo, integrándose con frameworks como LangChain o LlamaIndex.
- Servicio de inferencia self-hosted con hardware consumer: la cuantización a 17 GB permite desplegar un modelo de 35B en 4× RTX 3090 (24 GB) o en una sola GPU de 48 GB, ofreciendo una alternativa a APIs propietarias con licencia MIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para esta cuantización en la información disponible. La model card incluye una comparación de calidad frente al base BF16 mediante divergencia KL y acuerdo top-1, medida con 100 rondas × 2048 tokens de wikitext:

| Checkpoint | KL(A→B) | Acuerdo top-1 |
|---|---|---|
| **Ornith-1.5-35B-A3B-EXL3-2.75bpw** | **0.1005** | 87.1% |
| EXL3 3 bpw | 0.0732 | 88.9% |
| EXL3 3.5 bpw | 0.0540 | 90.5% |
| Referencia: EXL3 3 bpw con switch `-hq` | 0.2509 | 79.9% |

La perplejidad del base BF16 en los mismos datos es 8.717; las tres variantes sin poda (2.75, 3 y 3.5 bpw) se mantienen dentro del ruido estadístico (8.698 / 8.711 / 8.719). Esto indica que la cuantización a 2.75 bpw con esta capa de mapa preserva la calidad del modelo original mejor que el método `-hq` estándar a 3 bpw.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan ~4.5-5.5 GB por GPU en configuración TP4 con 4× RTX 3090 (24 GB cada una). En una sola GPU de 48 GB (p. ej., RTX PRO 4000) es viable con TP1, según la receta de local-ai-registry.
- GPUs recomendadas: 4× RTX 3090/4090 (24 GB) para TP4, o una GPU con 48 GB o más (A6000, RTX PRO 4000, A100 40/80 GB) para TP1.
- Cabe en GPUs consumer: sí, en configuraciones multi-GPU con 4× 24 GB o en una sola GPU de 48 GB (aunque esta última es de gama prosumer).
- Opciones de despliegue: TabbyAPI con backend exllamav3 (validado), vLLM con `--quantization exl3` (también funcional), y posiblemente llama.cpp si soporta EXL3 (no confirmado).
- Latencia y throughput: ~50 tokens/s en stream único y ~180 tokens/s agregados con concurrencia 4 en 4× RTX 3090 TP4, según la model card. Con cache Q4 y `max_batch_size` ajustado a la concurrencia esperada.
- Nota: se requiere un parche en exllamav3 1.4.3 para cargar las proyecciones GatedDeltaNet sin cuantizar en modo tensor-parallel (cambiar `id_w = exported["suh"]` por `id_w = exported["weight"]` en `exllamav3/modules/quant/fp16.py`).

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| **Ornith-1.5-35B-A3B (base BF16)** | ~35B | ~3B | 256K | MIT | BF16 (~70 GB) |
| **Ornith-1.5-35B-A3B-EXL3-2.75bpw (este quant)** | ~35B (base) | ~3B | 256K | MIT | EXL3 (~17 GB) |
| **Ornith-1.5-35B-A3B-FP8** | ~35B | ~3B | 256K | MIT | FP8 (~35 GB) |
| **Ornith-1.5-35B-A3B NVFP4 (DGX Spark)** | ~35B | ~3B | 256K | MIT | NVFP4 (tamaño no especificado) |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de modelos MoE similares (p. ej., Qwen3-30B-A3B o DeepSeek-V3-Lite) en la información proporcionada. La ventaja principal de esta cuantización EXL3 frente a FP8 o NVFP4 es el menor tamaño (17 GB vs ~35 GB) con una degradación de calidad mínima, a costa de requerir un runtime específico (exllamav3) y un parche manual.

## Limitaciones y advertencias

- Cuantización comunitaria no oficial: no está respaldada por el equipo de Ornith; puede haber diferencias de comportamiento no documentadas frente al base.
- Requiere parche manual en exllamav3 1.4.3 para tensor-parallel; sin él, la carga falla con `KeyError: 'suh'`. El parche no está incluido en el repositorio.
- Bug conocido en Triton 3.6.0 durante la conversión: las kernels GatedDeltaNet pueden provocar un fallo de reentrada en el autotuner; si se reproduce, hay que capturar `nargs` en una variable local antes del closure `benchmark()`.
- `max_batch_size` debe cubrir la concurrencia esperada: las capas GatedDeltaNet mantienen estado recurrente por secuencia; el valor por defecto de 4 slots se agota rápidamente con peticiones paralelas.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir contenido falso o inventado, especialmente en tareas de razonamiento multi-paso. No se han evaluado sesgos específicos en esta cuantización.
- Limitaciones de idioma: no se documentan los idiomas soportados; el modelo base probablemente esté entrenado principalmente en inglés, con capacidades multilingües limitadas.
- Licencia MIT: permite uso comercial sin restricciones, pero el usuario asume la responsabilidad del despliegue y el mantenimiento de los parches necesarios.
- Sin benchmarks estándar publicados: la calidad se infiere de la comparación KL/perplejidad, no de evaluaciones como MMLU o HumanEval.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/0xSero/Ornith-1.5-35B-A3B-EXL3-2.75bpw
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante FP8 del base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8
- Blog oficial de Ornith sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Receta de despliegue en DGX Spark (NVFP4): https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark
- Receta de despliegue con TabbyAPI en RTX PRO 4000: https://github.com/0xSero/local-ai-registry/blob/main/local-ai/recipes/ornith15-35b-a3b-exl3-4bpw-rtxpro4000-tabbyapi-tp1.json
