# LibertAIDAI/Hy4-flash-EXL3-3.5bpw

## Resumen

Hy4-flash-EXL3-3.5bpw es una cuantización EXL3 del modelo base `tencent/Hy4-flash`, publicada por el usuario LibertAIDAI. El modelo base es un transformer de tipo mixture-of-experts (MoE) con arquitectura híbrida que combina atención MLA con compresión latente (sparse/sliding), proyecciones LatentMoE, iHC y un componente denominado Engram de 63,5 mil millones de parámetros. El resultado es un modelo de 220 B de parámetros totales con 12 B activos por token, orientado a generación de texto.

Esta build concreta reduce los expertos enrutados (routed experts) a 3,5 bits por peso con el codebook `mul1` de EXL3, mientras mantiene en BF16 y byte-idénticos al checkpoint original todos los demás tensores: atención, indexador comprimido, experto compartido, proyecciones LatentMoE, router, capa densa 0, iHC y las cuatro tablas Engram. El objetivo es hacer viable el despliegue en una única GPU de 96 GB, algo imposible con el checkpoint en BF16.

La relevancia práctica es doble: por un lado, demuestra que es posible servir un MoE de 220 B en hardware de una sola tarjeta mediante cuantización selectiva de expertos y streaming de tablas de embedding desde disco; por otro, establece un formato de empaquetado específico para la arquitectura `hy_v4_flash` que requiere un fork de exllamav3. La licencia es la Tencent Hy License 1.0, derivada de Apache-2.0 con cláusulas específicas para MaaS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención MLA sparse/sliding, LatentMoE, iHC y Engram |
| Parametros totales | 220 B (104.367.364.006 según safetensors del repo) |
| Parametros activos | 12 B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 3,5 bpw (`mul1`) en expertos enrutados; BF16 en el resto de tensores |
| Idiomas soportados | en, zh |
| Licencia | Tencent Hy License 1.0 (derivada de Apache-2.0 con términos MaaS en §10) |
| Formato de pesos | safetensors (26 shards), librería exllamav3 |

## Arquitectura y entrenamiento

El modelo base `tencent/Hy4-flash` emplea una arquitectura MoE con 42 capas. Los expertos enrutados se organizan en 41 expertos × 512 módulos de gate/up/down, sumando 62.976 módulos de experto en esta build. La atención es de tipo MLA (multi-head latent attention) con un indexador comprimido y un esquema híbrido sparse/sliding. Además de los expertos enrutados y el experto compartido, el modelo incorpora proyecciones LatentMoE, un router, una capa densa 0 y un componente iHC. La pieza más singular es Engram: cuatro tablas de embedding de aproximadamente 164-165 millones de filas × 96 dimensiones cada una, que en total ocupan 118 GiB en disco y se consultan mediante streaming de filas en tiempo de ejecución, sin necesidad de residir en VRAM.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otros ajustes de alineamiento en el modelo base. La model card de esta cuantización no documenta detalles de entrenamiento, solo el proceso de cuantización y verificación. La innovación técnica destacable de esta build es la cuantización selectiva: solo los expertos enrutados se comprimen a 3,5 bpw, mientras el resto de tensores se mantiene en BF16 byte-idéntico al original, lo que preserva la fidelidad de las partes sensibles del modelo. La verificación reportada incluye una comparación de un slice de 3 capas contra el equivalente BF16, con correlación 0,999948 y 100 % de acuerdo en argmax.

## Capacidades

- Generación de texto en inglés y chino, con modo de razonamiento configurable mediante `reasoning_effort` (modo directo `no_think` o modo de pensamiento de alto esfuerzo por defecto).
- Razonamiento multi-paso gracias al modo thinking integrado en la plantilla de chat.
- Procesamiento de contexto largo mediante atención MLA con indexador comprimido (la longitud exacta de contexto no está documentada en la información disponible).
- Capacidad de código y matemáticas: no documentada explícitamente en la model card, aunque el modelo base está orientado a uso general.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes: no documentado en la información disponible.
- Capacidades multimodales: la build incluye los tensores de la torre de visión y DFly2, pero el runtime actual no los conecta; esta build es solo texto.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.

## Casos de uso

- Servicio de inferencia en una única GPU de 96 GB: esta build está diseñada específicamente para caber en una tarjeta de 96 GB con KV headroom ajustado, lo que permite desplegar un MoE de 220 B sin clúster multi-GPU.
- Investigación sobre cuantización selectiva: el formato permite estudiar el impacto de cuantizar solo expertos enrutados frente a cuantizar el tronco completo, con verificación byte-idéntica del resto de tensores.
- Procesamiento de documentos largos en inglés o chino: la atención MLA con indexador comprimido está pensada para contextos extensos, adecuada para resumen y extracción sobre corpus bilingües.
- Razonamiento asistido con modo thinking: el modo de alto esfuerzo por defecto permite usar el modelo en tareas de análisis que requieren cadenas de razonamiento, activando `reasoning_effort` según la plantilla Jinja incluida.
- Despliegue en entornos con almacenamiento SSD y streaming de Engram: el diseño de streaming de filas de las tablas Engram permite servir el modelo manteniendo solo el tronco en VRAM, útil en nodos con 96-128 GB de GPU y disco NVMe.
- Evaluación comparativa de variantes de cuantización: el ecosistema de builds (4,0 / 3,5 / 3,0 / 2,5 bpw) permite medir la degradación de calidad y el ahorro de memoria en un mismo modelo base.
- Fine-tuning o experimentación con arquitecturas MoE híbridas: el fork de exllamav3 con la arquitectura `hy_v4_flash` sirve como referencia para integrar modelos con Engram en pipelines de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ningún benchmark de throughput ni de calidad. La única métrica reportada es la verificación de fidelidad del slice de 3 capas: correlación 0,999948 y 100 % de acuerdo en argmax frente al equivalente BF16.

## Requisitos de hardware

- VRAM estimada: el tronco (trunk) ocupa 76,22 GiB en esta build de 3,5 bpw; los expertos enrutados suman 60,9 GiB; el total en disco es 194,42 GiB. Las tablas Engram (118 GiB) se transmiten por streaming desde disco y no necesitan residir en VRAM.
- GPU de 128 GB: una GB10 de 128 GB aloja el tronco completo con margen holgado.
- GPU de 96 GB: esta build cabe en una tarjeta de 96 GB, con KV headroom ajustado; las variantes de 3,0 y 2,5 bpw ofrecen más margen para KV.
- Multi-GPU: en dos GPUs se debe usar el layer split de exllamav3 (`-gs`), no tensor parallelism, porque los módulos personalizados de atención y Engram no están shardeados para TP.
- Almacenamiento: se recomienda SSD para el checkpoint, dado el streaming de filas de Engram.
- Opciones de despliegue: exclusivamente exllamav3 (fork con la arquitectura `hy_v4_flash`, commit `1af65c4`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card no reclama cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-EXL3-3.5bpw (esta build) | 220 B / 12 B | no disponible | EXL3 3,5 bpw + BF16 | Tencent Hy 1.0 | Hugging Face, requiere fork de exllamav3 |
| Hy4-flash-EXL3-4bpw | 220 B / 12 B | no disponible | EXL3 4,0 bpw + BF16 | Tencent Hy 1.0 | Hugging Face, 128 GB o 2×96 GB |
| Hy4-flash-EXL3-3bpw | 220 B / 12 B | no disponible | EXL3 3,0 bpw + BF16 | Tencent Hy 1.0 | Hugging Face, más KV headroom |
| Hy4-flash-EXL3-2.5bpw | 220 B / 12 B | no disponible | EXL3 2,5 bpw + BF16 | Tencent Hy 1.0 | Hugging Face, tronco más pequeño |

No se dispone de información sobre modelos de otros autores comparables en la misma categoría (MoE de ~200 B con 12 B activos y soporte de contexto largo) en la documentación proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de visión y los tensores DFly2 están incluidos en el repositorio pero no conectados por el runtime actual; no se puede usar como modelo multimodal con esta build.
- Idiomas limitados a inglés y chino; no hay soporte documentado de castellano ni de otras lenguas.
- La licencia Tencent Hy 1.0 incluye términos específicos para MaaS en la sección 10; es necesario revisar el texto completo antes de un uso comercial, especialmente si se ofrece como servicio.
- Requiere un fork específico de exllamav3 (rama `hy4-flash`); no funciona con instalaciones estándar ni con otros runners, lo que limita la portabilidad y el soporte a largo plazo.
- El KV headroom es ajustado en una GPU de 96 GB con esta build de 3,5 bpw; para contextos largos conviene valorar las variantes de 3,0 o 2,5 bpw.
- El streaming de filas de Engram exige almacenamiento SSD; un disco lento degradará la latencia de forma significativa.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo base sin ficha de alineamiento publicada, deben evaluarse empíricamente antes de usarlo en producción.
- No se han publicado benchmarks de calidad ni de throughput; la única validación es la fidelidad numérica del slice de 3 capas frente a BF16.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente sin validación comunitaria.

## Enlaces

- [Hugging Face: LibertAIDAI/Hy4-flash-EXL3-3.5bpw](https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-3.5bpw)
- [Modelo base: tencent/Hy4-flash](https://huggingface.co/tencent/Hy4-flash)
- [Licencia Tencent Hy 1.0](https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE)
- [Variante 4,0 bpw](https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-4bpw)
- [Variante 3,0 bpw](https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-3bpw)
- [Variante 2,5 bpw](https://huggingface.co/LibertAIDAI/Hy4-flash-EXL3-2.5bpw)
- [Fork de exllamav3 con soporte hy4-flash](https://github.com/moshemalawach/exllamav3)
