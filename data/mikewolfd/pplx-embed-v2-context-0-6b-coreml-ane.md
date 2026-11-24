# mikewolfd/pplx-embed-v2-context-0.6b-coreml-ane

## Resumen

pplx-embed-v2-context-0.6b-coreml-ane es una conversión precompilada del modelo de embeddings `perplexity-ai/pplx-embed-v2-context-0.6b` de Perplexity AI, empaquetada por el usuario mikewolfd para su ejecución nativa en el Neural Engine (ANE) de los chips Apple Silicon. El paquete incluye cuatro bundles Core ML multifunción en cuantización `W8A16` (pesos a 8 bits, activaciones a 16 bits) correspondientes a cuatro longitudes de secuencia (`pplx_s64`, `pplx_s128`, `pplx_s256`, `pplx_s512`), junto con pesos FP16 y el tokenizador original. No se trata de un modelo nuevo, sino de una distribución optimizada del modelo base de 0,6 mil millones de parámetros orientado a la generación de embeddings con contexto largo.

El problema que resuelve es el coste de inferencia de modelos de embeddings de contexto largo en hardware de consumo Apple: frente a la ejecución estándar con MLX, el autor reporta una mejora de hasta 4,41× en tiempo extremo a extremo (EOT) sobre una prueba de 325 consultas (NanoBEIR + LegalBench-RAG 4K), con un throughput de hasta 28.415 tokens por segundo a `S=512` en un M5 base. Es relevante para desarrolladores que despliegan pipelines RAG o búsqueda semántica en local sobre Mac, ya que permite ejecutar el modelo en el ANE sin GPU dedicada y con un consumo de memoria de aproximadamente 2 GB.

La ficha se basa exclusivamente en la información pública disponible en Hugging Face: la model card del autor y los metadatos del repositorio. No se dispone de la model card del modelo base de Perplexity AI en la información proporcionada, por lo que varios datos técnicos del modelo subyacente (arquitectura exacta, datos de entrenamiento, benchmarks propios) se indican como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de embeddings; el paquete es una conversión Core ML para ANE) |
| Parámetros totales | 0,6 mil millones (según el nombre del modelo) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | hasta 512 tokens en los bundles incluidos (`pplx_s64`, `pplx_s128`, `pplx_s256`, `pplx_s512`) |
| Tipos de cuantización | `W8A16` (pesos 8 bits, activaciones 16 bits) en Core ML; pesos FP16 en `weights/pplx_0_6b_f16.npz` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.mlmodelc` (Core ML compilado), `.npz` (FP16), `safetensors` (`embed_tokens.safetensors`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `perplexity-ai/pplx-embed-v2-context-0.6b` (tipo de transformer, capas, dimensiones de embedding, función de pooling o normalización). Lo que sí se documenta es la transformación aplicada: el autor genera cuatro bundles Core ML multifunción con cuantización `W8A16` balanceada, cada uno especializado en una longitud de secuencia fija (64, 128, 256 y 512 tokens), más un fichero de pesos FP16 y una matriz de embeddings de tokens mapeada en memoria (`embed_tokens.safetensors`). El paquete está construido para la librería `fast-silicon` (backend `fast-pplx` `hetero2`), que orquesta la ejecución híbrida entre ANE y GPU/CPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base utilizó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones arquitectónicas del modelo original. La innovación técnica relevante de este repositorio es la propia conversión: la división en cuatro etapas multifunción permite al runtime seleccionar el bundle adecuado según la longitud de entrada, y el uso de `W8A16` equilibra precisión y rendimiento en el ANE. El autor reporta que el pipeline `hetero2` alcanza 22.273 tok/s en modo mixto (1,34× frente a GPU) y 28.415 tok/s a `S=512` (1,46×) en un M5 base, con 5,80 ms por lote de `B=1`.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica, similitud y recuperación densa.
- Soporte de contexto de hasta 512 tokens por secuencia en los bundles incluidos.
- Ejecución nativa en el Neural Engine de Apple Silicon mediante Core ML.
- Ejecución híbrida ANE/GPU/CPU a través de `fast-silicon` (`fast-pplx` `hetero2`).
- Carga de pesos FP16 alternativos (`pplx_0_6b_f16.npz`) para ejecución fuera del ANE.
- Tokenizador incluido en el repositorio (`tokenizer/`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento, al tratarse de un modelo de embeddings.

## Casos de uso

- Búsqueda semántica local en Mac: indexar y consultar un corpus documental con embeddings de 512 tokens de contexto, ejecutando el modelo en el ANE sin GPU dedicada y con un consumo de memoria de aproximadamente 2 GB.
- Pipelines RAG en el portátil del desarrollador: generar embeddings de fragmentos de documentación o código para recuperación aumentada, aprovechando el throughput reportado de hasta 28.415 tok/s a `S=512` en M5 base.
- Clasificación y deduplicación de documentos: calcular similitud coseno entre embeddings de textos legales o técnicos, usando el bundle `pplx_s512` para fragmentos largos y `pplx_s64` para títulos o consultas cortas.
- Búsqueda sobre dominios legales: el autor valida el paquete con LegalBench-RAG 4K, lo que lo hace adecuado para recuperación de cláusulas y referencias normativas en local.
- Prototipado de sistemas de recomendación basados en contenido: generar vectores de ítems y usuarios en un Mac para experimentar con ranking semántico antes de migrar a infraestructura cloud.
- Evaluación de modelos de embeddings en investigación: comparar el rendimiento del modelo base frente a alternativas usando el mismo hardware Apple, con la ventaja de que el paquete Core ML reduce el tiempo de evaluación de 601,5 s a 136,5 s en la prueba de 325 consultas reportada.
- Despliegue en aplicaciones de escritorio macOS: integrar el modelo en una app nativa que necesite búsqueda semántica offline, sin depender de servicios externos ni de conexión a internet.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del autor sobre la conversión Core ML, no sobre el modelo base frente a otros modelos de embeddings. Se presentan a continuación.

| Prueba | Hardware | Métrica | Resultado |
|---|---|---|---|
| NanoBEIR + LegalBench-RAG 4K (325 consultas) | Base M5 | EOT | 0,7244 en 136,5 s, 2,34 GB (4,41× frente a MLX estándar: 601,5 s) |
| NanoBEIR + LegalBench-RAG 4K (325 consultas) | M4 Pro | EOT | 0,7241 en 167,3 s, 1,97 GB (4,33× frente a MLX estándar: 723,1 s) |
| Throughput mixto (`hetero2`) | Base M5 | tok/s | 22.273 (1,34× frente a GPU) |
| Throughput a `S=512` | Base M5 | tok/s | 28.415 (1,46× frente a GPU) |
| Latencia `B=1` | Base M5 | ms | 5,80 |
| Throughput mixto (`hetero2`) | M4 Pro (contenido) | tok/s | 15.212 (1,47×) |
| Throughput a `S=256` | M4 Pro (contenido) | tok/s | 21.345 (1,81×) |

No se han publicado resultados de benchmarks del modelo base (MMLU, MTEB u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 2 GB en ejecución (2,34 GB reportados en M5 base, 1,97 GB en M4 Pro).
- Hardware objetivo: chips Apple Silicon con Neural Engine (M1 en adelante); el autor valida explícitamente M5 base y M4 Pro.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el paquete está diseñado para ANE de Apple Silicon.
- Cabe en hardware de consumo Apple: sí, en cualquier Mac con chip M-series y al menos 8 GB de memoria unificada, aunque se recomienda 16 GB para margen.
- Opciones de despliegue: Core ML con la librería `fast-silicon` (`fast-pplx`); los pesos FP16 en `.npz` permiten otros runtimes, pero no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 5,80 ms por lote de `B=1` en M5 base; hasta 28.415 tok/s a `S=512` en M5 base y 21.345 tok/s a `S=256` en M4 Pro.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparación más directa es con el propio modelo base ejecutado mediante MLX estándar, que el autor usa como referencia:

| Modelo | Parámetros | Contexto | Licencia | Rendimiento relativo |
|---|---|---|---|---|
| pplx-embed-v2-context-0.6b-coreml-ane | 0,6 B | 512 tokens | MIT | 4,41× EOT frente a MLX en M5 base |
| pplx-embed-v2-context-0.6b (MLX estándar) | 0,6 B | no disponible | MIT (según modelo base) | Referencia base (601,5 s en la prueba de 325 consultas) |
| Otros modelos de embeddings de tamaño similar | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El paquete está limitado a Apple Silicon con Neural Engine; no es ejecutable en GPU NVIDIA, AMD ni en CPU x86 sin conversión adicional.
- La longitud de contexto máxima de los bundles incluidos es de 512 tokens; entradas más largas requieren truncado o segmentación.
- La cuantización `W8A16` puede introducir una degradación de precisión en los embeddings frente a FP16; el autor reporta un EOT de 0,7244/0,7241, pero no se documenta la pérdida exacta respecto al modelo base en FP16.
- No se dispone de información sobre sesgos, idiomas soportados ni evaluación de alucinación del modelo base; al ser un modelo de embeddings, el riesgo de alucinación se manifiesta como recuperaciones semánticamente erróneas.
- La licencia MIT aplica al paquete de conversión; debe verificarse la licencia del modelo base de Perplexity AI antes de uso comercial, ya que la información disponible no la detalla.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 24 de noviembre de 2026; se trata de una publicación reciente sin validación comunitaria independiente.
- El rendimiento reportado proviene del propio autor y no ha sido replicado por terceros.
- La librería `fast-pplx` y el proyecto `fast-silicon` son dependencias necesarias para el despliegue previsto; su madurez y soporte no están documentados en la información disponible.

## Enlaces

- [Hugging Face: mikewolfd/pplx-embed-v2-context-0.6b-coreml-ane](https://huggingface.co/mikewolfd/pplx-embed-v2-context-0.6b-coreml-ane)
- [Modelo base: perplexity-ai/pplx-embed-v2-context-0.6b](https://huggingface.co/perplexity-ai/pplx-embed-v2-context-0.6b)
- [Repositorio fast-silicon](https://github.com/mikewolfd/fast-silicon)
