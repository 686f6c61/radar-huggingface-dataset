# Baekpica/Qwen3.8-Flash-Next-GGUF

## Resumen

Qwen3.8-Flash-Next GGUF es una conversión a formato GGUF del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario Baekpica. El modelo original, desarrollado por el equipo Qwen de Alibaba, es un transformer multimodal de tipo mixture-of-experts (MoE) con aproximadamente 180.000 millones de parámetros totales, orientado a tareas de image-text-to-text, razonamiento y decodificación especulativa. Esta conversión concreta está pensada para desplegarse en hardware DGX Spark/GB10 mediante el runtime ds4 del propio autor.

La relevancia de esta ficha radica en que se trata de un artefacto de conversión, no de un lanzamiento listo para producción. El autor indica explícitamente que los ficheros Q8_0 deben tratarse como artefactos de conversión hasta que se complete la validación del runtime, y que no debe asumirse compatibilidad con llama.cpp upstream ni con otros runtimes GGUF sin soporte explícito para la arquitectura `qwen4exp`.

La conversión preserva la topología completa del modelo original: 48 capas de texto, 36 capas gated-delta, 12 capas de atención completa, 512 expertos enrutados con routing top-10, expertos compartidos, cuatro flujos de hiperconexión, una tabla PLE de n-gramas de 51.200 millones de parámetros, torre de visión y capa MTP (multi-token prediction). El repositorio ocupa 192,2 GB y solo ofrece, por ahora, la variante Q8_0 verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con capas gated-delta y atención completa (arquitectura GGUF custom `qwen4exp`) |
| Parametros totales | 179.999.981.459 (aprox. 180B) |
| Parametros activos | no disponible (routing top-10 sobre 512 expertos enrutados, sin cifra oficial de activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (verificada); mezcla mixta anunciada pero no publicada |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`, license_name: other) |
| Formato de pesos | GGUF (7 shards, 1.756 tensores, 192.201.208.384 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo MoE con una topología híbrida: 48 capas de texto, de las cuales 36 son capas gated-delta (atención lineal con estado recurrente) y 12 son capas de atención completa. El bloque MoE emplea 512 expertos enrutados con routing top-10, además de expertos compartidos. Incorpora cuatro flujos de hiperconexión, una tabla PLE de n-gramas de 51.200 millones de parámetros, una torre de visión para entrada de imagen y una capa MTP (multi-token prediction) que habilita decodificación especulativa. El pipeline declarado es image-text-to-text, lo que confirma el carácter multimodal del modelo.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card de la conversión se centra en el proceso de cuantización y verificación: la referencia BF16 retirada contenía 1.756 tensores GGUF en 12 shards (360.011.029.056 bytes) y se comparó contra los 1.658 tensores de la revisión fuente fijada (`f5d08274bafd880402bd16f5e3e6c514136ec06c`), con coincidencia exacta de los 359.999.963.128 bytes de payload y cero discrepancias. Los tensores fusionados gate/up de expertos se separaron semánticamente sin conversión numérica y las proyecciones down de expertos enrutados se dividieron sin pérdida en una región principal de 512 columnas y una cola de 128 columnas. La release Q8_0 contiene 806 tensores Q8_0, 363 BF16, 584 F32 y 3 I64, con checksums SHA-256 por shard en `Q8_0/SHA256SUMS`.

## Capacidades

- Generación de texto conversacional multi-turno (tag `conversational`).
- Entrada multimodal image-text-to-text: procesamiento de imágenes junto con texto mediante la torre de visión integrada.
- Razonamiento y matemáticas: herencia de las capacidades del modelo base Qwen3.8-Flash-Next, aunque sin benchmarks publicados en esta conversión.
- Generación de código: no confirmada explícitamente en la información disponible.
- Decodificación especulativa mediante la capa MTP (multi-token prediction) preservada en la conversión.
- Routing MoE con top-10 sobre 512 expertos, lo que permite activar solo una fracción de los parámetros por token.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (el campo de idiomas no está poblado en el repo).
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integración con infraestructura de serving, pero sin detalles adicionales.

## Casos de uso

- Despliegue en DGX Spark/GB10 para experimentación con modelos de 180B: el autor fija este hardware como objetivo de despliegue y proporciona el runtime ds4 (rama `dfm`), por lo que es el escenario natural para probar la conversión Q8_0.
- Investigación en cuantización de modelos MoE multimodales: la release incluye verificación exhaustiva de tensores, checksums por shard y comparación byte a byte con la fuente, lo que la convierte en material de referencia para estudiar cómo se preservan tensores fusionados y proyecciones de expertos al convertir a GGUF.
- Evaluación de decodificación especulativa: al conservar la capa MTP, el modelo permite medir la ganancia de throughput de la decodificación especulativa en un MoE de 180B cuantizado a Q8_0.
- Procesamiento de documentos con imagen y texto: el pipeline image-text-to-text habilita tareas de extracción y descripción de contenido visual combinado con texto, siempre que el runtime ds4 esté validado.
- Reproducibilidad de artefactos de cuantización: los SHA-256 por shard y la verificación de hashes LFS de Hugging Face permiten a un equipo auditar la integridad de los pesos antes de usarlos en pipelines internos.
- Base para una futura release mixta: el autor anuncia una versión con receta de cuantización mixta tras calibración y validación en H200; los equipos que necesiten menor huella de memoria pueden planificar sobre esa release futura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la release Q8_0 ocupa 192.201.208.384 bytes (unos 192,2 GB) en disco; la VRAM necesaria para inferencia es al menos de ese orden, aunque no se especifica en la información disponible.
- GPU objetivo declarada: DGX Spark/GB10 (plataforma de memoria unificada de NVIDIA).
- GPU recomendadas: el autor menciona H200 para las comprobaciones de calidad de la futura release mixta; no se detallan otras GPU compatibles.
- GPU de consumo: no cabe en GPU de consumo convencionales dado el tamaño de 180B parámetros y 192 GB de pesos en Q8_0.
- Opciones de despliegue: runtime ds4 (rama `dfm` del repositorio Baekpica/ds4). No se garantiza compatibilidad con llama.cpp upstream, Ollama, vLLM ni TGI, ya que la arquitectura `qwen4exp` es custom y su soporte está en implementación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~180B | no disponible | Qwen Community License 1.0 | safetensors (BF16) | Modelo original de referencia |
| Baekpica/Qwen3.8-Flash-Next-GGUF (Q8_0) | ~180B | no disponible | Qwen Community License 1.0 | GGUF (7 shards) | Artefacto de conversión, runtime en validación |
| Alternativas de 180B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos de la misma categoría con la que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- El autor advierte explícitamente de que no debe asumirse compatibilidad con llama.cpp upstream ni con otros runtimes GGUF sin soporte para la arquitectura `qwen4exp` y su esquema de tensores.
- Los ficheros Q8_0 deben tratarse como artefactos de conversión, no como una release lista para uso general, hasta que se complete la validación del runtime ds4.
- La receta de cuantización mixta anunciada no está publicada; solo existe la variante Q8_0 verificada.
- El repositorio tiene 200 descargas y 0 likes, lo que indica una validación comunitaria muy limitada.
- Idiomas soportados no declarados: riesgo de comportamiento inconsistente en idiomas distintos del inglés o chino del modelo base.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base Qwen3.8-Flash-Next, no analizados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Licencia Qwen Community License 1.0: es una licencia "other" con términos comunitarios; es necesario revisar el fichero de licencia upstream antes de cualquier uso comercial.
- Algunos tensores permanecen en BF16, F32 e I64 (363, 584 y 3 tensores respectivamente), por lo que la huella real supera la de una cuantización Q8_0 homogénea.
- La tabla PLE de n-gramas de 51.200 millones de parámetros y la torre de visión incrementan el consumo de memoria más allá de lo que sugiere el recuento de parámetros del transformer de texto.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/Baekpica/Qwen3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Revisión fuente fijada: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/tree/f5d08274bafd880402bd16f5e3e6c514136ec06c
- Licencia upstream: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/f5d08274bafd880402bd16f5e3e6c514136ec06c/LICENSE
- Runtime ds4 (rama dfm): https://github.com/Baekpica/ds4/tree/dfm
- GitHub Sponsors del autor: https://github.com/sponsors/Baekpica
- Buy Me a Coffee del autor: https://www.buymeacoffee.com/baekpica
