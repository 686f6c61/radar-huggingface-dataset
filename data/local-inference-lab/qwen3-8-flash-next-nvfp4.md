# local-inference-lab/Qwen3.8-Flash-Next-NVFP4

## Resumen

Qwen3.8-Flash-Next-NVFP4 es una versión cuantizada en precisión mixta del modelo multimodal Qwen3.8-Flash-Next de Qwen, publicada por el laboratorio independiente local-inference-lab. No se trata de una cuantización convencional de posentrenamiento (PTQ), sino de una destilación consciente de la cuantización (QAD): el estudiante se entrena contra el profesor original en BF16 con pesos ya cuantizados en su paso hacia delante, aprendiendo a compensar el error de cuantización en lugar de sufrirlo. El resultado es un checkpoint de aproximadamente 98 GiB en disco con 92.743.589.779 parámetros que conserva íntegra la arquitectura del modelo base.

La arquitectura no se ha reducido: mantiene 48 capas de decoder, 512 expertos enrutados por capa con 10 activos por token, atención híbrida Gated DeltaNet/Qwen Sparse Attention (QSA) y tablas de embeddings n-gram (PLE). La compresión proviene exclusivamente de la menor precisión de los pesos, con una mezcla de NVFP4 (4 bits E2M1 con escalas de bloque FP8 cada 16 elementos) para expertos enrutados y tablas PLE, y MXFP8 (8 bits E4M3 con escalas de bloque en potencias de dos cada 32 elementos) para expertos compartidos y proyecciones de atención.

Su relevancia práctica es notable: está diseñado para ejecutarse en una única GPU RTX 6000 con offload de PLE, o en un DGX Spark con o sin dicho offload, lo que sitúa un modelo multimodal de casi 93.000 millones de parámetros en hardware de estación de trabajo. Según la model card, supera a la cuantización NVFP4 publicada por NVIDIA en las evaluaciones reportadas (AA-LCR, GPQA Diamond, IFBench y Tool Eval).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido Gated DeltaNet/Qwen Sparse Attention (QSA), 48 capas de decoder, 512 expertos enrutados por capa con 10 activos por token, tablas de embeddings n-gram (PLE) |
| Parametros totales | 92.743.589.779 |
| Parametros activos | 10 expertos enrutados por token (número total de parámetros activos no disponible) |
| Longitud de contexto | no disponible (las secuencias de entrenamiento llegan a 8.192 tokens) |
| Tipos de cuantizacion | NVFP4 (4 bits E2M1, escalas FP8 por bloque de 16 elementos y escala global FP32), MXFP8 (8 bits E4M3, escalas de bloque en potencias de dos cada 32 elementos), BF16 y FP32 en parámetros residuales |
| Idiomas soportados | no disponible (el corpus de destilación incluye conversaciones multilingües) |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | safetensors (layout ModelOpt mixto NVFP4/MXFP8), librería transformers |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base: un transformer con mezcla de expertos (MoE) de 48 capas, 512 expertos enrutados por capa y 10 activos por token, combinado con atención híbrida Gated DeltaNet/QSA e indexadores de atención dispersa. La cuantización se distribuye de forma granular: los expertos enrutados de texto (proyecciones gate, up y down) y las tablas de embeddings n-gram (PLE) usan NVFP4 con destilación; los expertos compartidos usan MXFP8 con destilación; las proyecciones de atención, incluidos los indexadores QSA, usan MXFP8 congelado; los routers, el mezclado de residuales y las proyecciones/convolución de PLE permanecen en BF16 entrenado; y los embeddings de tokens, la LM head, las normas de atención y los parámetros recurrentes quedan en BF16 congelado. El encoder de visión usa MXFP8 en atención/FC1/merger y NVFP4 en FC2, con el resto en BF16, y el módulo de predicción multi-token (MTP) usa NVFP4 en expertos enrutados.

El entrenamiento emplea destilación consciente de la cuantización: el profesor BF16 genera respuestas y proporciona objetivos de probabilidad a nivel de token y de estados ocultos; los pesos NVFP4 y MXFP8 entrenables se cuantizan y reconstruyen en cada paso hacia delante, de modo que los gradientes actualizan los pesos subyacentes para que su representación de baja precisión se aproxime mejor al profesor. La función de pérdida combina coincidencia de probabilidad del siguiente token mediante variación total, coincidencia de estados ocultos y pérdidas específicas para el fin de respuesta y el fin de razonamiento, dirigidas a las decisiones del profesor de continuar, terminar de razonar y detenerse. Se usa el entrenador Quatrain: 2.500 actualizaciones de tronco seguidas de 1.500 actualizaciones de refinamiento conjunto, que también entrenan las tablas PLE y simulan los pesos MXFP8 de expertos compartidos, manteniendo la atención congelada.

El corpus de destilación contiene 200.004.844 tokens de prompt y respuesta en 53.573 documentos, con secuencias de hasta 8.192 tokens, cubriendo código, razonamiento, seguimiento de instrucciones general y conversaciones multilingües; las respuestas provienen exclusivamente del profesor BF16 de Qwen con su plantilla de chat y modo de razonamiento nativos. Las escalas de activación de los expertos enrutados se calibran sobre ese corpus más 104 millones de tokens de texto crudo (usado solo para calibración). En servicio se aplica cuantización estática NVFP4 de activaciones para expertos enrutados de texto y cuantización dinámica MXFP8 para las proyecciones MXFP8; las tablas PLE, los expertos enrutados del MTP y la FC2 de visión usan NVFP4 solo de pesos.

## Capacidades

- Generación de texto conversacional multimodal (pipeline image-text-to-text): acepta imágenes y texto como entrada.
- Razonamiento con modo de pensamiento nativo (thinking mode), heredado del profesor Qwen y reforzado mediante pérdidas de frontera de fin de razonamiento.
- Razonamiento científico y de nivel avanzado, evaluado en GPQA Diamond.
- Seguimiento de instrucciones complejas, evaluado en IFBench.
- Uso de herramientas y function calling, evaluado en Tool Eval.
- Razonamiento de contexto largo, evaluado en AA-LCR.
- Capacidades multilingües en conversación (el corpus de entrenamiento incluye conversaciones multilingües; el listado exacto de idiomas no está disponible).
- Predicción multi-token (MTP) incluida en el checkpoint, útil para decodificación especulativa.
- Capacidades de código y matemáticas: el corpus de destilación cubre programación y razonamiento, aunque no se publican resultados específicos de HumanEval o GSM8K.

## Casos de uso

- Asistente conversacional multimodal en estación de trabajo: con un checkpoint de ~98 GiB que cabe en una RTX 6000 con offload de PLE, permite desplegar un asistente que procesa imágenes y texto de forma local, sin depender de APIs externas, manteniendo conversaciones multi-turno con el modo de razonamiento activado.
- Razonamiento científico asistido: sus resultados en GPQA Diamond (91,41 según la model card) lo hacen adecuado para responder preguntas de nivel posgrado en física, química y biología, con la salvedad de verificar siempre las respuestas.
- Automatización de agentes con herramientas: el resultado de 95 en Tool Eval indica que puede integrarse en pipelines de agentes que invocan APIs, consultan bases de datos o ejecutan comandos, encadenando varios pasos de razonamiento.
- Análisis de documentos con contexto largo: su rendimiento en AA-LCR (79,4) sugiere capacidad para tareas de razonamiento sobre contextos extensos, como resumir informes técnicos o extraer conclusiones de transcripciones largas.
- Procesamiento de documentación técnica con imágenes: al ser image-text-to-text, puede extraer información de diagramas, capturas de pantalla y figuras dentro de manuales, combinándola con el texto circundante.
- Despliegue en hardware compacto tipo DGX Spark: para laboratorios que necesitan un modelo de casi 93.000 millones de parámetros en un equipo de sobremesa, con o sin offload de PLE, como servidor de inferencia interno para experimentación.
- Generación de código en flujos de desarrollo: el corpus incluye programación y el modelo soporta tool calling, por lo que puede integrarse en asistentes de IDE o pipelines de revisión, aunque no hay benchmarks específicos de código publicados.

## Benchmarks y rendimiento

| Modelo | AA-LCR | GPQA Diamond | IFBench | Tool Eval |
| --- | ---: | ---: | ---: | ---: |
| NVIDIA NVFP4 | 74,1 | 91,5 | 81,0 | — |
| local-inference-lab QAD | 79,4 | 91,41 | 82,31 | 95 |

Los datos provienen de la model card del autor. No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- Tamaño en disco del checkpoint: aproximadamente 98 GiB (el repositorio de Hugging Face ocupa 335,2 GB, incluyendo otros artefactos).
- VRAM estimada para inferencia: no disponible de forma explícita; la model card advierte que el tamaño en disco no es una estimación de memoria en tiempo de ejecución, ya que la caché KV y los buffers adicionales requieren memoria extra.
- GPU recomendadas según el autor: una única RTX 6000 con offload de PLE, o un DGX Spark con o sin offload de PLE.
- Cabe en GPU de consumo: no hay confirmación para GPUs consumer convencionales; el hardware objetivo declarado es de gama profesional (RTX 6000) o sistemas integrados (DGX Spark).
- Opciones de despliegue: se requiere un runtime que soporte Qwen3.8-Flash-Next y el layout mixto NVFP4/MXFP8 de ModelOpt, incluidas las tablas PLE en NVFP4; la librería declarada es transformers. No se especifican vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
| --- | --- | --- | --- | --- | --- |
| local-inference-lab Qwen3.8-Flash-Next-NVFP4 (QAD) | 92.743.589.779 | no disponible | qwen-community-1.0 | safetensors NVFP4/MXFP8 | Destilación consciente de cuantización; AA-LCR 79,4, GPQA 91,41, IFBench 82,31, Tool Eval 95 |
| NVIDIA Qwen3.8-Flash-Next-NVFP4 | no disponible en la información | no disponible | no disponible | NVFP4 | Cuantización NVFP4 de referencia; AA-LCR 74,1, GPQA 91,5, IFBench 81,0 |
| Qwen/Qwen3.8-Flash-Next (base BF16) | no disponible en la información | no disponible | qwen-community-1.0 | safetensors BF16 | Profesor original; sin benchmarks publicados en la información disponible |

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje; los benchmarks de razonamiento no eliminan este riesgo en producción.
- La cuantización NVFP4 de 4 bits en expertos enrutados y tablas PLE introduce error numérico; la destilación lo mitiga, pero no lo elimina, y puede afectar a tareas de precisión numérica o generación de código muy sensible.
- El encoder de visión y el módulo MTP no participaron en la destilación de texto: conservan los pesos cuantizados sin entrenamiento compensatorio, por lo que su calidad relativa al profesor BF16 no está garantizada.
- El listado de idiomas soportados no está disponible; aunque el corpus incluye conversaciones multilingües, no se especifica cobertura ni calidad por idioma.
- La longitud de contexto máxima no se declara en la información disponible; las secuencias de entrenamiento se limitan a 8.192 tokens.
- La licencia qwen-community-1.0 ("other") impone condiciones específicas para uso comercial; es necesario revisar el texto completo de la licencia del modelo base antes de desplegarlo en producción.
- Requiere un runtime con soporte específico para el layout ModelOpt mixto NVFP4/MXFP8 y para las tablas PLE en NVFP4; no funcionará en herramientas de inferencia genéricas sin ese soporte.
- El tamaño en disco (~98 GiB) no incluye caché KV ni buffers; el dimensionado de memoria debe calcularse aparte.
- Los resultados de benchmarks publicados por el autor no han sido verificados de forma independiente en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/de4b8e4d43b917e7706784d8bb445c9af86a3540/LICENSE
- Cuantización NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4#evaluation
- Repositorio de despliegue en DGX Spark: https://github.com/MiaAI-Lab/Qwen3.8-Flash-Next-Single-DGX-Spark
- Pull request con resultados de evaluación: https://github.com/MiaAI-Lab/Qwen3.8-Flash-Next-Single-DGX-Spark/pull/61
