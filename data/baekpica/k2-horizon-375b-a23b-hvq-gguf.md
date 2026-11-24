# Baekpica/K2-Horizon-375B-A23B-hVQ-GGUF

## Resumen

K2-Horizon-375B-A23B-hVQ-GGUF es una cuantización experimental del modelo K2-Horizon-375B-A23B de IFM, un transformer de mezcla de expertos (MoE) con 379,17B parámetros totales y 23B activos (192 expertos, top-8) y una ventana de contexto nativa de 524.288 tokens. La publica el usuario Baekpica aplicando su método hVQ (vector quantization con corrección de error y calibración por matriz de importancia) sobre los pesos de los expertos enrutados, dejando el backbone en Q8_0. El objetivo declarado es que el modelo completo, con su contexto nativo de 512K y una caché K/V en NVFP4, quepa en una única DGX Spark (GB10) de 128 GB mediante el runtime ds4-dfm-rs.

La relevancia del release es doble. Por un lado, demuestra una receta de compresión que reduce los expertos enrutados a 1,63 bits por peso (13 bits por cada 8 pesos) manteniendo un único kernel de búsqueda en tabla sobre un codebook E4M3 de 64 KiB por capa, lo que sustituye cuatro tipos IQ distintos del release anterior. Por otro lado, ataca el verdadero cuello de botella de este modelo: con atención GQA completa en las 61 capas y sin indexer ni ventana deslizante, la caché K/V en BF16 consumiría 122 GiB a 524.288 tokens, de modo que la receta fija NVFP4 para K/V (70.272 bytes por token) y deja el conjunto en unos 114 GiB.

Conviene subrayar el estado del artefacto: la model card se publica antes de terminar la conversión y los ficheros no cargan todavía en ningún runtime (y explícitamente nunca en llama.cpp, Ollama o Transformers). Es, por tanto, un release de formato y contrato de bytes, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE), atención GQA completa en 61 capas (48 cabezas de consulta / 8 de clave-valor × 128), sin indexer ni ventana deslizante |
| Parametros totales | 379,17B en el modelo base; 6.341.853.184 en el checkpoint safetensors del repo de cuantización |
| Parametros activos | 23B (192 expertos, top-8) |
| Longitud de contexto | 524.288 tokens nativos (512K) |
| Tipos de cuantizacion | Expertos enrutados: GVQ1 13-bit hVQ (1,630 bpw, codebook de 8.192 codewords E4M3 por capa, ganancia F16 por fila); backbone (atención, MLP densos, experto compartido, head, embedding): Q8_0; router y normas: F32; caché K/V: NVFP4 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (partes independientes, no splits numerados) + `release.json`; pesos originales en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 61 capas con atención GQA completa, 192 expertos enrutados por capa con activación top-8 y un experto compartido adicional en cada capa MoE. Las tres primeras capas usan MLP densos en lugar de MoE. La dimensión de las matrices de experto es [1792, 6144] para gate y up y [6144, 1792] para down, con dimensión de entrada divisible por 256 en los tres casos, condición que la receta aprovecha para el kernel de decodificación. El vocabulario del embedding es de 250.624 tokens con dimensión 6.144. No se dispone de información sobre el número de tokens de preentrenamiento, la composición del dataset original ni si hubo RLHF o DPO en el modelo base.

La innovación del release es el método hVQ, evolución de VQ e iVQ usada también en DeepSeek-V4.1-Flash-1017-hVQ-GGUF e Inkling-2-Small-VQ-GGUF. Cada 8 pesos consecutivos del eje de entrada de una fila de experto se codifican como un índice en un codebook por capa de 8.192 codewords E4M3, multiplicado por una ganancia F16 por fila; el codebook es compartido por todos los expertos y proyecciones de la capa. La calibración usó 5.210.112 tokens (10.176 secuencias de 512) con una mezcla de coding y tool use (30%), matemáticas y ciencia (25%), razonamiento general (20%), texto largo y recuperación (15%) y texto general (10%), ejecutada mediante un forward de referencia por capas del modelo BF16 original, verificado bit a bit contra el recolector de MQ87 en las capas 0-3 y contra la clase `K2HorizonDecoderLayer` de Transformers. El límite de 13 bits no es arbitrario: un codebook de 14 bits (128 KiB) no cabe en la memoria compartida por bloque del kernel de decodificación en GB10, mientras que el de 13 bits sí.

## Capacidades

- Generación de texto en inglés con razonamiento multi-paso, herencia del modelo base de 379B parámetros.
- Codificación y uso de herramientas: la mezcla de calibración incluye un 30% de coding y tool use, lo que sugiere soporte del modelo base para function calling, aunque la model card del cuantizado no lo detalla explícitamente.
- Contexto ultralargo: 524.288 tokens nativos sin ventana deslizante ni indexer, adecuado para recuperación sobre corpus extensos.
- Razonamiento matemático y científico, presente en la mezcla de calibración (25%).
- Procesamiento de documentación larga y recuperación de información (15% de la calibración).
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información disponible.
- Multilingüismo limitado al inglés según el campo `language` del repo.

## Casos de uso

- Análisis de repositorios completos: con 512K tokens de contexto se puede cargar un monorepo mediano y hacer preguntas cruzadas entre módulos sin trocear, aprovechando que el modelo no usa ventana deslizante y mantiene atención completa sobre todo el contexto.
- Atención al cliente con historial largo: conversaciones multi-turno de decenas de miles de tokens con recuperación de políticas y documentación interna en el mismo contexto, sin necesidad de RAG externo para sesiones largas.
- Agentes autónomos de múltiples pasos: el modelo base soporta tool calling según la composición de calibración, y el contexto de 512K permite mantener el rastro completo de acciones, observaciones y resultados intermedios de un agente durante horas.
- Generación de código en pipelines de CI/CD: integrable como servicio de generación y revisión de parches, con la ventaja de que el cuantizado cabe en una sola máquina de 128 GB, lo que abarata el despliegue on-premise frente a clústeres multi-GPU.
- Investigación sobre cuantización extrema: el release sirve como banco de pruebas reproducible para estudiar el impacto de 1,63 bpw en expertos enrutados con codebooks E4M3 y corrección de error, con contrato de bytes documentado en FORMAT.md.
- Inferencia en el borde de datacenter: despliegue en una DGX Spark (GB10) para entornos con restricciones de espacio, consumo o aislamiento de red, donde no es viable un nodo de 8 GPU.
- Procesamiento de expedientes legales o técnicos: ingestión de contratos o manuales de cientos de páginas en una sola pasada para extracción estructurada y comparación entre documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las cifras de fidelidad medidas, los recibos de conversión por capa y las mediciones de prefill y decode se completarán cuando termine la conversión, y que el único registro publicado de ds4-dfm-rs para K2 es un banco de 32K, no la ruta de 512K.

## Requisitos de hardware

- VRAM/RAM estimada: el trunk (partes de expertos más body) ocupa 79,68 GiB; el embedding añade 1,52 GiB si se mantiene en dispositivo. Con caché K/V en NVFP4: 81,8 GiB a 32K, 88,3 GiB a 128K, 96,8 GiB a 256K y 114,0 GiB a 524.288 tokens. Con K/V en BF16 el contexto nativo exigiría 122 GiB solo de caché.
- GPU recomendada: una NVIDIA DGX Spark (GB10) con 128 GB, que es el objetivo de diseño de la receta. No se documentan otras GPU compatibles.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; el tamaño mínimo del trunk supera los 79 GiB.
- Opciones de despliegue: exclusivamente el runtime ds4-dfm-rs del autor. La model card advierte que los ficheros no cargan en llama.cpp, Ollama ni Transformers, y que en el momento de publicación no cargan en ningún sitio.
- Latencia y throughput: no disponibles. La model card remite a mediciones futuras de prefill y decode en DGX Spark; sin indexer, cada paso de decodificación lee toda la caché K/V, lo que limita el rendimiento en contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| K2-Horizon-375B-A23B-hVQ-GGUF (este) | 379,17B | 23B | 524.288 | hVQ 13-bit + Q8_0, NVFP4 K/V, ~81,2 GiB | Apache 2.0 | Experimental, no carga aún |
| K2-Horizon-375B-A23B-MQ87-GGUF | 379,17B | 23B | 524.288 | IQ1_S/IQ1_M/IQ2_XXS/IQ2_XS + Q8_0, 86,70 GiB (1,96 bpw) | Apache 2.0 | Release previo para el mismo runtime |
| K2-Horizon-375B-A23B (base, IFM) | 379,17B | 23B | 524.288 | BF16 | Apache 2.0 | Pesos originales en safetensors |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparación se limita a tamaño, esquema de cuantización y disponibilidad.

## Limitaciones y advertencias

- Estado experimental: la model card se publica antes de terminar la conversión; las partes, `release.json`, los recibos por capa y las cifras de fidelidad llegan después. En el momento de la publicación los ficheros no cargan en ningún runtime.
- Incompatibilidad de runtime: no funciona en llama.cpp, Ollama ni Transformers; requiere ds4-dfm-rs.
- La ruta de 512K con K/V en NVFP4 es trabajo nuevo en ds4-dfm-rs y no está validada; el único registro publicado para K2 es un banco de 32K.
- Idiomas: solo inglés según los metadatos del repo; no se documenta soporte multilingüe.
- Riesgo de alucinación: no cuantificado en la información disponible; la compresión a 1,63 bpw en los expertos puede degradar la fidelidad respecto al BF16, y las mediciones que lo cuantificarían están pendientes.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero la viabilidad práctica del despliegue está limitada por el hardware requerido (DGX Spark o equivalente con 128 GB) y por el estado experimental del runtime.
- Sin indexer ni ventana deslizante, el coste de decodificación crece linealmente con el contexto, lo que puede hacer inviable el uso interactivo a 512K tokens en una sola máquina.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Baekpica/K2-Horizon-375B-A23B-hVQ-GGUF
- Modelo base: https://huggingface.co/IFM/K2-Horizon-375B-A23B
- Release previo MQ87: https://huggingface.co/Baekpica/K2-Horizon-375B-A23B-Mixed-Quant-GGUF
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- Release hVQ de referencia (DeepSeek-V4.1-Flash-1017): https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-hVQ-GGUF
- Release VQ de referencia (Inkling-2-Small): https://huggingface.co/Baekpica/Inkling-2-Small-VQ-GGUF
- Contrato de formato: FORMAT.md dentro del repositorio del modelo
