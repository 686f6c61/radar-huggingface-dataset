# defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-NVFP4

## Resumen

PseudoBrain-MiniMax-M3.1-Flash-NVFP4 es una conversión experimental del modelo MiniMax-M3.1-Flash (en su variante abliterada DeRisked de Blackfrost-Research) publicada por el usuario defnoteatin bajo la etiqueta PseudoBrain PB-27. El objetivo declarado es extender la ventana de contexto efectiva hasta 1.056.768 tokens mediante una hibridación de capas: las 15 capas densas de atención completa del modelo original (de un total de 60) se sustituyen por capas "Windowed-Hybrid" que combinan atención ventaneada de 16K tokens con recuperación exacta de bloques KV desde un archivo de largo contexto.

El modelo conserva las 45 capas de atención block-sparse con lightning-indexer, los routers y expertos MoE (cuantizados en NVFP4 y MXFP8) y la torre de visión del checkpoint base. Con 221.437.892.576 parámetros totales según los safetensors y un repositorio de 252 GB, se distribuye en formato safetensors de 8 bits para su uso con vLLM mediante un plugin propio (`pb27_vllm`).

Es relevante porque propone una arquitectura híbrida (atención ventaneada + estado recurrente Gated DeltaNet + memoria de páginas KV) para llevar modelos MoE multimodales de gran tamaño a contextos de un millón de tokens sin reentrenar el modelo completo. La licencia es Apache 2.0 y el pipeline declarado es image-text-to-text.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con 60 capas: 45 block-sparse con lightning-indexer + 15 densas convertidas a PB-27 Windowed-Hybrid (atención ventaneada + Gated DeltaNet recurrente + memoria KV por páginas) |
| Parámetros totales | 221.437.892.576 |
| Parámetros activos | no disponible (el modelo base es MoE de 128 expertos, pero no se indica el número de expertos activos por token) |
| Longitud de contexto | 1.056.768 tokens (ventana de atención de 16.384 tokens con 4 attention sinks y recuperación exacta top-k desde archivo de largo contexto) |
| Tipos de cuantización | NVFP4 y MXFP8 (pesos en 8 bits en el repo; `kv-cache-dtype fp8_e4m3` recomendado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, requiere `--trust-remote-code`) |

## Arquitectura y entrenamiento

El checkpoint base MiniMax-M3.1-Flash consta de 60 capas: 45 capas de atención block-sparse con lightning-indexer y 15 capas densas de atención completa (índices 3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47, 51, 55, 59). La conversión PB-27 sustituye esas 15 capas densas por capas híbridas con tres componentes: atención ventaneada de 16.384 tokens con 4 attention sinks y recuperación exacta de bloques KV a nivel de página (`pb27_vllm.memory`) hasta más de 1M de tokens; una rama recurrente paralela Gated DeltaNet (`QwenGatedDeltaNetAttention`) inicializada desde las proyecciones `self_attn` del profesor con proyección de salida a cero (`out_proj = 0`), de modo que la divergencia KL en contexto corto es 0.000000; y las 45 capas block-sparse, routers/expertos MoE y torre de visión sin modificar.

No se documentan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO). La variante DeRisked sugiere un proceso de "abliteration" o eliminación de rechazos sobre el checkpoint oficial, pero no se detallan los métodos. La innovación técnica principal es la hibridación sin reentrenamiento: la rama Gated DeltaNet mantiene estado recurrente de tiempo lineal en contextos largos mientras la atención ventaneada y la memoria por páginas conservan acceso exacto a tokens lejanos.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text, torre de visión conservada del base).
- Razonamiento y generación de código heredados del checkpoint MiniMax-M3.1-Flash (no se detallan evaluaciones específicas).
- Contexto largo de hasta 1.056.768 tokens mediante ventana deslizante más recuperación exacta de bloques KV.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible en la model card.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Análisis de repositorios de código completos: con más de un millón de tokens de contexto, el modelo puede ingerir un monorepo de tamaño medio y responder preguntas sobre dependencias, patrones o errores entre archivos, usando la memoria KV por páginas para recuperar fragmentos exactos.
- Procesamiento de expedientes legales o contractuales extensos: permite cargar contratos, anexos y correspondencia en una sola sesión y extraer cláusulas o contradicciones sin trocear el documento.
- Revisión de documentación técnica multimodal: al conservar la torre de visión, puede analizar diagramas de arquitectura junto con el texto de especificaciones en un mismo contexto largo.
- Asistencia en investigación sobre corpus científicos: ingesta de decenas de papers o transcripciones para síntesis comparativa, apoyándose en la recuperación exacta de bloques KV para citar pasajes concretos.
- Auditoría de conversaciones y logs de soporte: análisis de historiales multi-turno muy largos para detectar patrones de incidencia o incumplimientos, con la ventana de 16K y los sinks manteniendo coherencia local.
- Experimentación en investigación sobre contextos largos: el modelo sirve como banco de pruebas para evaluar arquitecturas híbridas (atención ventaneada + Gated DeltaNet + memoria por páginas) frente a atención completa, al mantener paridad de contexto corto con el base.
- Despliegue en pipelines de generación aumentada por recuperación (RAG) de gran escala: la memoria por páginas permite sustituir o complementar un índice vectorial externo con recuperación KV exacta dentro del propio modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma paridad de generación y razonamiento en contexto corto con el checkpoint base (divergencia KL de 0.000000 en la rama Gated DeltaNet), sin cifras de MMLU, HumanEval, GSM8K ni evaluaciones de contexto largo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 252 GB en safetensors de 8 bits; la inferencia requiere al menos ~250 GB de memoria de GPU para pesos, más KV cache. Con KV cache en `fp8_e4m3` y ventana de 16K por capa densa, el consumo adicional depende del número de secuencias concurrentes.
- GPU recomendadas: no cabe en ninguna GPU consumer. Se requiere un nodo multi-GPU, por ejemplo 4x H100 80 GB (320 GB) o 8x A100 80 GB (640 GB) para dejar margen a KV cache y activaciones.
- GPU consumer: no es viable en RTX 4090 (24 GB) ni en configuraciones de 2-4 GPUs consumer; el tamaño de pesos lo impide.
- Opciones de despliegue: vLLM con el plugin `pb27_vllm` (`pip install -e ./pb27_vllm_plugin`) y `vllm serve ... --trust-remote-code --max-model-len 1056768 --kv-cache-dtype fp8_e4m3`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| PseudoBrain-MiniMax-M3.1-Flash-NVFP4 | 221,4 B (MoE 128 expertos) | 1.056.768 tokens | Apache 2.0 | safetensors NVFP4/MXFP8, vLLM con plugin | Conversión híbrida PB-27 sobre base abliterada |
| MiniMax-M3.1-Flash (oficial) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible | Checkpoint base sin hibridación |
| PseudoBrain-MiniMax-M3.1-Flash-E32-NVFP4 | 32 expertos (68,9 GB) | 1.056.768 tokens (misma conversión) | Apache 2.0 | safetensors NVFP4/MXFP8, vLLM | Variante compacta de la misma familia |
| PseudoBrain-MiniMax-M3.1-Flash-285B-NVFP4 | 96 expertos (285 B) | 1.056.768 tokens (misma conversión) | Apache 2.0 | safetensors NVFP4/MXFP8, vLLM | Variante podada de la misma familia |

No se dispone de datos de benchmarks ni de especificaciones del checkpoint oficial MiniMax-M3.1-Flash en la información proporcionada para una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo derivado de un checkpoint "abliterated" (DeRisked): se ha eliminado o reducido el comportamiento de rechazo, lo que aumenta el riesgo de generar contenido dañino, sesgado o inapropiado sin filtros propios.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; la recuperación exacta de bloques KV no garantiza corrección factual.
- Idiomas soportados no documentados; no se puede asegurar calidad multilingüe.
- El contexto de 1M depende de un plugin de vLLM específico (`pb27_vllm`) y de `--trust-remote-code`; la compatibilidad con otras herramientas de inferencia no está garantizada.
- La paridad con el base solo se afirma para contexto corto; el comportamiento en contextos largos no está validado con benchmarks públicos.
- Requiere hardware multi-GPU de gama alta (250 GB+ de pesos); no apto para despliegue en consumer.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del checkpoint base y del proceso de abliteración, así como las obligaciones de atribución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de robustez en producción.
- Soporte de tool calling y agentes no documentado; no asumir su disponibilidad sin pruebas.

## Enlaces

- HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-NVFP4
- Modelo base: https://huggingface.co/Blackfrost-Research/MiniMax-M3.1-Flash-DeRisked
- Variante E32: https://huggingface.co/defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-E32-NVFP4
- Variante 285B: https://huggingface.co/defnoteatin/PseudoBrain-MiniMax-M3.1-Flash-285B-NVFP4
- Checkpoint oficial MiniMax-M3.1-Flash: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Checkpoint E32 sin curar: https://huggingface.co/Sm0r3s/MiniMax-M3.1-Flash-E32-unhealed
- Checkpoint podado 285B: https://huggingface.co/primitive-ai/MiniMax-M3.1-Flash-pruned-285B-NVFP4
