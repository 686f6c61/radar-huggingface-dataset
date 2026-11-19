# Baekpica/Hy4-flash-Mixed-Quant-GGUF

## Resumen

Hy4-flash Mixed-Quant GGUF es una conversión de cuantización mixta, publicada por el usuario independiente Baekpica, del modelo multimodal `tencent/Hy4-flash` (variante instruct) de Tencent. No se trata de un modelo nuevo, sino de un artefacto derivado cuyo objetivo es hacer viable la inferencia del modelo original en una única máquina NVIDIA DGX Spark con 128 GB de memoria unificada, manteniendo el contexto nativo de 1.048.576 tokens.

El modelo base es un transformer multimodal de tipo LatentMoE con 42 capas, hidden de 3.072 y cuatro flujos residuales iHC. De sus 155,21B parámetros en el tronco, 148,58B corresponden a matrices de expertos enrutados (512 expertos, top-16, espacio latente de 1.536), mientras que los 6,63B restantes se ejecutan en cada token. Incluye además una torre de visión SigLIP2-So400m, un drafter DFly2 de 5 capas para decodificación especulativa y cuatro memorias Engram de n-gramas.

La relevancia de esta ficha es doble: por un lado documenta una técnica de cuantización mixta guiada por jerarquía de memoria (tronco residente de 98,79 GiB a 5,47 BPW efectivos, tablas Engram en SSD, embeddings leídos por filas); por otro, advierte de que el artefacto es un borrador: los pesos aún no estaban publicados en el repositorio en el momento de la creación de la model card y requiere un runtime dedicado (ds4-dfm-rs) que todavía no soporta la familia Hy4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal LatentMoE con atención MLA (gated), 42 capas, 4 flujos residuales iHC, torre de visión SigLIP2 y drafter DFly2 |
| Parametros totales | 155,21B en el tronco (148,58B en expertos enrutados) |
| Parametros activos | 6,63B por token fuera de expertos; los expertos activan top-16 de 512 por capa |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | Mixta: Q8_0 (proyecciones de atención y drafter), Q5_K / Q4_K (expertos enrutados), BF16 (torre de visión, capa 0 y tensores que Tencent mantiene en BF16), FP8 para tablas Engram en SSD; 5,47 BPW efectivos |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (license: other) |
| Formato de pesos | GGUF (layout propio, requiere loader dedicado Hy4) |

## Arquitectura y entrenamiento

El tronco consta de 42 capas con hidden 3.072: la capa 0 es un FFN denso y las capas 1-41 son LatentMoE con 512 expertos enrutados, top-16, routing sigmoide y un experto compartido; los expertos operan en un espacio latente de 1.536 dimensiones entre dos proyecciones compartidas. La atención es MLA con compuerta, combinando 12 capas dispersas (IndexPool selecciona hasta 512 grupos de cuatro tokens) y 30 capas de ventana deslizante de 512 tokens. Cuatro memorias Engram (bigramas y trigramas) en las capas 1, 11, 21 y 31 aportan 16 cabezas hash de 96 dimensiones por capa, con 660.006.416 filas en total. La torre de visión deriva de SigLIP2-So400m (27 capas, patch 16, merge 2×2, M-RoPE intercalado) y el drafter DFly2 de 5 capas comparte caché KV y selección de índice con las capas 25, 29, 33, 37 y 41.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo base en la información proporcionada. La contribución técnica de este artefacto es la receta de cuantización: sigue el mapa de precisión de la release FP8 de Tencent (todo tensor que Tencent mantiene en BF16 permanece sin cuantizar; los tensores E4M3 se almacenan en Q8_0 o Q5_K/Q4_K según el presupuesto), sin matriz de importancia y de forma determinista desde el checkpoint BF16 fijado en la revisión `d88c9dfd`. Las tablas Engram (118 GiB en BF16) se mueven a SSD en los valores FP8 exactos a los que redondea el forward de referencia (61,4 GiB), el embedding de tokens se lee fila a fila desde disco y la torre de visión solo se mapea al recibir una imagen.

## Capacidades

- Generación de texto y razonamiento en modalidad instruct (el artefacto deriva de la variante instruct del modelo base).
- Procesamiento de imagen y texto (`image-text-to-text`): la torre SigLIP2 y el proyector se conservan en BF16.
- Contexto largo nativo de 1.048.576 tokens, con caché KV latente en FP8 que ocupa 8,28 GiB a plena longitud.
- Decodificación especulativa mediante el drafter DFly2 de 5 capas, conservado en el artefacto (con copia BF16 adicional).
- Memoria de n-gramas Engram (bigramas y trigramas) en cuatro capas, conservada íntegra.
- Soporte de tool calling, function calling y flujos de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia de contexto largo en una sola máquina: el diseño encaja el contexto nativo de 1M tokens en una DGX Spark de 128 GB (tronco 98,79 GiB + KV 8,28 GiB + drafter ≈ 108 GiB), lo que permite analizar documentos o repositorios completos sin fragmentación.
- Análisis de documentos extensos con imágenes: al conservar la torre SigLIP2 en BF16 y el contexto de 1M, el modelo puede procesar informes con figuras, planos o capturas junto al texto completo en una única pasada.
- Investigación en cuantización mixta: el artefacto sirve como referencia reproducible de una receta guiada por jerarquía de memoria (tronco en VRAM, Engram en SSD, embeddings por filas), útil para estudiar el compromiso entre BPW y fidelidad.
- Despliegue en hardware de borde con memoria unificada: pensado para DGX Spark, permite experimentar con un MoE de 155B en un equipo de sobremesa en lugar de un clúster multi-GPU.
- Evaluación de decodificación especulativa: el drafter DFly2 incluido permite medir ganancias de throughput en un runtime que soporte el layout Hy4.
- Validación de fidelidad de cuantización: la model card prevé publicar KL teacher-forced contra el BF16 original y el error de reconstrucción por capa, lo que facilita auditar el impacto de la cuantización antes de adoptarla.
- Desarrollo de runtimes: dado que el layout exige un loader dedicado, el artefacto es material de partida para implementar y probar el soporte de la familia Hy4 en ds4-dfm-rs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las métricas propias (lista de tiers por capa, error de reconstrucción y KL teacher-forced frente al BF16 original) están pendientes de medición en el momento de su redacción.

## Requisitos de hardware

- VRAM/memoria: tronco residente de 98,79 GiB a 5,47 BPW efectivos; caché KV latente FP8 de 8,28 GiB para el contexto completo de 1M; tronco + KV + drafter en torno a 108 GiB.
- Almacenamiento: tablas Engram en SSD con 61,4 GiB en FP8; el embedding de tokens se lee desde disco fila a fila.
- GPU objetivo: NVIDIA DGX Spark con 128 GB de memoria unificada. No se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no disponible; el tamaño del tronco excede la VRAM de cualquier GPU de consumo actual.
- Despliegue: exclusivamente mediante ds4-dfm-rs (runtime Rust, continuación de DwarfStar); la compatibilidad con llama.cpp, vLLM, SGLang u otros runtimes GGUF no está implicada y el layout requiere un loader Hy4 dedicado, que aún no existe.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash Mixed-Quant GGUF (este artefacto) | 155,21B tronco (6,63B activos fuera de expertos) | 1.048.576 | Imagen-texto | tencent-hy-license | Pesos pendientes de publicación; runtime dedicado no disponible |
| tencent/Hy4-flash (base) | 155,21B tronco | 1.048.576 | Imagen-texto | tencent-hy-license | Publicado en BF16 |
| tencent/Hy4-flash-FP8 (base) | 155,21B tronco | 1.048.576 | Imagen-texto | tencent-hy-license | Publicado en FP8 E4M3 con escalas por bloques 128×128 |

No se dispone de datos de benchmarks para establecer una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El artefacto es un borrador: en la fecha de la model card los pesos no estaban en el repositorio y estaban en proceso de conversión y verificación.
- No es servible hoy: ds4-dfm-rs no soporta todavía la familia Hy4 y ese trabajo comenzará tras la publicación de los ficheros.
- No hay compatibilidad implicada con llama.cpp, vLLM, SGLang ni otros runtimes GGUF; el layout exige un loader dedicado.
- Requiere hardware específico (DGX Spark de 128 GB) y almacenamiento SSD para las tablas Engram; no cabe en GPU de consumo.
- La licencia tencent-hy-license es de tipo "other": deben revisarse sus términos antes de cualquier uso comercial.
- Idiomas soportados no documentados en la información disponible.
- Sesgos conocidos y riesgo de alucinación del modelo base: no disponibles en la información proporcionada.
- Las métricas de fidelidad de la cuantización (KL teacher-forced, error de reconstrucción) están pendientes, por lo que no puede cuantificarse aún la degradación frente al BF16 original.
- El repositorio registra 0 descargas y 0 likes, sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face del artefacto: https://huggingface.co/Baekpica/Hy4-flash-Mixed-Quant-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Revisión fijada del modelo base: https://huggingface.co/tencent/Hy4-flash/tree/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959
- Release FP8 del modelo base: https://huggingface.co/tencent/Hy4-flash-FP8
- Revisión FP8 de referencia: https://huggingface.co/tencent/Hy4-flash-FP8/tree/003107fa248f5892064ab1c43af0a7003dd68c9b
- Licencia: https://huggingface.co/tencent/Hy4-flash/blob/d88c9dfd96ba4f2e6b92adba0b8e8f1c8696f959/LICENSE
- Runtime ds4-dfm-rs: https://github.com/Baekpica/ds4-dfm-rs
- Patrocinio del autor: https://github.com/sponsors/Baekpica
