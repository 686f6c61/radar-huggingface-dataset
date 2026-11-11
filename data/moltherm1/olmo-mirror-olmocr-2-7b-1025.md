# moltherm1/olmo-mirror-olmocr-2-7b-1025

## Resumen

olmOCR-2-7B-1025 es un modelo vision-lenguaje especializado en la extraccion de texto estructurado a partir de imagenes de documentos (PDF renderizados), desarrollado por el Allen Institute for AI (AI2) y distribuido en este repositorio como un espejo en BF16 por el usuario `moltherm1`. Se trata de un fine-tuning de Qwen2.5-VL-7B-Instruct sobre el dataset `olmOCR-mix-1025`, con una fase adicional de entrenamiento por refuerzo con GRPO orientada a mejorar la transcripcion de ecuaciones matematicas, tablas y casos OCR dificiles.

El modelo resuelve un problema concreto y costoso: convertir documentos escaneados o PDFs complejos (columnas multiples, tablas, notacion matematica, cabeceras y pies de pagina) en Markdown limpio y estructurado. Frente a pipelines OCR clasicos basados en deteccion de cajas y reglas heuristicas, emplea un VLM que razona sobre la pagina completa y devuelve una representacion semantica lista para alimentar pipelines de datos.

Es relevante porque el ecosistema olmOCR esta disenado para procesar millones de documentos a escala mediante vLLM, y este checkpoint concreto (1025) incorpora mejoras de RL sobre la version anterior. La version recomendada para uso practico es la FP8 publicada por AI2; este repositorio ofrece los pesos completos en BF16, utiles para reentrenamiento o evaluacion sin perdida de precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen2.5-VL), con encoder visual y decoder autoregresivo |
| Parametros totales | 8.292.166.656 (~8,29 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 (este repositorio); FP8 (version oficial de AI2); no se documentan otras |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,6 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-VL-7B-Instruct: un transformer con encoder visual que procesa la imagen de la pagina y un decoder de lenguaje que genera la transcripcion. La entrada esperada es una unica imagen de documento renderizada de modo que su dimension mayor sea de 1288 pixeles, acompanada de un prompt que incluye metadatos del documento construidos por el toolkit olmOCR (bloques de texto extraidos, metadatos de imagen, indicaciones de rotacion y de presencia de tablas o diagramas).

El entrenamiento consta de dos fases documentadas: un fine-tuning supervisado (SFT) sobre `olmOCR-mix-1025` y una fase posterior de aprendizaje por refuerzo con GRPO sobre `olmOCR-synthmix-1025`, cuyo objetivo declarado es mejorar el rendimiento en ecuaciones matematicas, tablas y otros casos OCR particularmente dificiles. No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de los enlaces a los mismos. La innovacion principal no es arquitectonica sino de pipeline: el toolkit olmOCR renderiza, rota y reintenta paginas automaticamente, lo que eleva la puntuacion final respecto al uso del modelo aislado.

## Capacidades

- Extraccion de texto de imagenes de documentos y conversion a Markdown estructurado.
- Transcripcion de formulas matematicas y notacion cientifica (mejorada mediante RL con GRPO).
- Reconstruccion de tablas en formato estructurado.
- Deteccion implicita de metadatos de pagina: idioma primario, validez de rotacion, correccion de rotacion aplicada, presencia de tabla y presencia de diagrama.
- Manejo de documentos con multiples columnas, cabeceras y pies de pagina, y texto pequeno en paginas densas.
- Procesamiento de documentos escaneados antiguos (Old Scans), aunque con rendimiento notablemente inferior al de documentos nativos.
- Capacidad conversacional multimodal heredada de Qwen2.5-VL, aunque el modelo esta especializado y no optimizado para dialogo general.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el reintento y la orquestacion los aporta el toolkit externo, no el modelo.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Digitalizacion masiva de archivos PDF: el modelo, orquestado con el toolkit olmOCR y vLLM, puede procesar millones de documentos por lotes y producir Markdown listo para indexacion, con reintentos automaticos en paginas problematicas.
- Construccion de corpus para entrenamiento de LLM: extraccion de texto de papers y documentacion tecnica preservando formulas y tablas, lo que evita la perdida de informacion tipica de los OCR basados en reglas.
- Procesamiento de literatura cientifica: la puntuacion de 82,9 en ArXiv y 82,1 en Old Scans Math en olmOCR-Bench lo hace adecuado para convertir preprints con notacion matematica densa.
- Extraccion de tablas financieras o tecnicas: con 84,3 en la categoria Tables, sirve para convertir informes y balances en estructuras tabulares parseables.
- Limpieza de documentos escaneados historicos: util para corpus con escaneos antiguos, aunque con la advertencia de que la categoria Old Scans baja a 48,3 y conviene combinarlo con revision humana o reintentos.
- Alimentacion de pipelines RAG sobre documentacion corporativa: la salida en Markdown con cabeceras y estructura semantica facilita el chunking y la recuperacion posterior.
- Normalizacion de documentos con maquetacion compleja: deteccion de rotacion y de columnas multiples (84,3 en Multi column) para digitalizar revistas, boletines y actas.

## Benchmarks y rendimiento

Resultados en olmOCR-Bench, medidos con el pipeline olmOCR v0.4.0 (que incluye renderizado, rotacion y reintentos automaticos):

| Modelo | ArXiv | Old Scans Math | Tables | Old Scans | Headers and Footers | Multi column | Long tiny text | Base | Overall |
|---|---|---|---|---|---|---|---|---|---|
| olmOCR-2-7B-1025 (BF16) | 82,9 | 82,1 | 84,3 | 48,3 | 95,7 | 84,3 | 81,4 | 99,7 | 82,3 ± 1,1 |
| olmOCR-2-7B-1025-FP8 | 83,0 | 82,3 | 84,9 | 47,7 | 96,1 | 83,7 | 81,9 | 99,7 | 82,4 ± 1,1 |

No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K) ni comparativas numericas con otros modelos OCR en esta model card.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda una GPU de 24 GB o superior.
- VRAM estimada en FP8: alrededor de 8-9 GB para pesos, lo que permite ejecucion en GPUs consumer de gama alta.
- GPUs recomendadas: A100 (40/80 GB) o H100 para procesamiento por lotes a gran escala con vLLM; RTX 4090 (24 GB) viable en BF16 para uso individual; RTX 3090 o similar para FP8.
- Cabe en GPU consumer: si, en FP8 con holgura en tarjetas de 12-16 GB; en BF16 requiere al menos 24 GB.
- Opciones de despliegue: vLLM es la via recomendada por AI2 a traves del toolkit olmOCR; tambien es compatible con transformers (clase `Qwen2_5_VLForConditionalGeneration`) y con text-generation-inference segun los tags del repositorio. No se documenta soporte de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del pipeline de renderizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmOCR-2-7B-1025 | ~8,29 B | no disponible | VLM especializado en OCR de documentos | Apache 2.0 | Hugging Face (BF16 y FP8) |
| Qwen2.5-VL-7B-Instruct (modelo base) | ~8,29 B | no disponible | VLM generalista | Apache 2.0 | Hugging Face |
| olmOCR-2-7B-1025-FP8 | ~8,29 B | no disponible | Misma especializacion, cuantizado | Apache 2.0 | Hugging Face (AI2) |

No se dispone en la informacion proporcionada de datos de benchmarks comparativos con otros sistemas OCR (por ejemplo, pipelines clasicos tipo Tesseract o modelos OCR especializados de terceros), por lo que la comparativa cuantitativa se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado unicamente en ingles; el rendimiento en otros idiomas no esta garantizado.
- La puntuacion en documentos escaneados antiguos es notablemente baja (48,3 en Old Scans), lo que indica fragilidad ante ruido, artefactos de escaneo y degradacion de imagen.
- El rendimiento reportado depende del pipeline olmOCR: usar el modelo de forma aislada, sin renderizado a 1288 px ni reintentos, probablemente arroje resultados inferiores.
- La salida sigue un formato YAML con metadatos y Markdown; desviaciones del prompt esperado pueden degradar la calidad o romper el parseo posterior.
- Riesgo de alucinacion en paginas con contenido grafico ambiguo, diagramas o texto muy degradado; se recomienda validacion o revision en dominios criticos.
- El repositorio es un espejo de terceros (`moltherm1`) del modelo de AI2; para produccion conviene usar los pesos oficiales y verificar la integridad.
- Aunque la licencia es Apache 2.0, la model card original indica que el modelo esta destinado a un uso concreto (OCR de documentos); conviene revisar los terminos completos antes de usos derivados.
- No se documentan sesgos especificos, pero al ser un fine-tuning de un VLM generalista puede heredar sesgos del modelo base en la interpretacion de contenido visual.

## Enlaces

- Repositorio Hugging Face (espejo BF16): https://huggingface.co/moltherm1/olmo-mirror-olmocr-2-7b-1025
- Version oficial FP8: https://huggingface.co/allenai/olmOCR-2-7B-1025-FP8
- Paper: https://olmocr.allenai.org/papers/olmocr.pdf
- Dataset SFT: https://huggingface.co/datasets/allenai/olmOCR-mix-1025
- Dataset RL: https://huggingface.co/datasets/allenai/olmOCR-synthmix-1025
- Benchmark: https://huggingface.co/datasets/allenai/olmOCR-bench
- Codigo y toolkit: https://github.com/allenai/olmocr
- Demo: https://olmocr.allenai.org/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
