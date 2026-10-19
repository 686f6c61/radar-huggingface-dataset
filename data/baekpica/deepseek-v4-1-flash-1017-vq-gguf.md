# Baekpica/DeepSeek-V4.1-Flash-1017-VQ-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-VQ-GGUF es una conversión cuantizada del checkpoint oficial `deepseek-ai/DeepSeek-V4.1-Flash-1017`, la actualización del 17 de octubre de DeepSeek V4.1 Flash. La publica el usuario Baekpica el mismo día del lanzamiento del modelo base y su objetivo es empaquetar un checkpoint oficial de ~510 GB en un GGUF base de 113.556.639.424 bytes (~113,6 GB) que quepa en una única DGX Spark de 128 GB. No es un modelo nuevo: es una distribución de pesos con un recetario de cuantización concreto y un runtime concreto.

La pieza diferencial es el esquema de cuantización. En lugar de un K-quant clásico sobre todos los tensores, aplica cuantización vectorial (VQ) de 8 dimensiones con un codebook E4M3 por capa compartido por los 384 expertos enrutados y las proyecciones gate/up/down, con índices de 13 bits (K=8192) en las capas 0-13 y de 12 bits (K=4096) en las capas 14-39, mientras que atención, expertos compartidos, embedding y cabeza quedan en q4_K. Se conservan el drafter MTP de tres torres DSpark dentro del GGUF base (para decodificación especulativa), la torre de visión en un sidecar aparte y las tablas Engram del checkpoint 1017 sin modificar.

Es relevante ahora por tres motivos: mantiene el contexto nativo de 1.048.576 tokens, incluye visión (pipeline `image-text-to-text`) y permite servir un MoE de esta escala en hardware de una sola máquina de 128 GB mediante `ds4-dfm-rs` o `ds4-server` de YoungAi. La contrapartida es que el artefacto es muy reciente (subido el 2026-10-17), con 537 descargas y 12 likes, y que su rendimiento en DGX Spark aún no se ha medido para esta versión concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE): 384 expertos enrutados, 40 capas (0-39); incluye drafter MTP de tres torres DSpark para decodificación especulativa y torre de visión DeepSeek-ViT con aligner |
| Parametros totales | No disponible para el MoE completo. El recuento de safetensors reportado es 485.283.840, que coincide con el tamaño de la torre de visión en BF16 (971.066.016 bytes); el checkpoint oficial ocupa ~510 GB y el GGUF base 113.556.639.424 bytes |
| Parametros activos | No disponible (el modelo base es MoE, pero la model card no publica el número de parámetros activos por token) |
| Longitud de contexto | 1.048.576 tokens (nativo, según metadatos del modelo) |
| Tipos de cuantizacion | VQ de 8 dimensiones con codebook E4M3 por capa (13 bits/K=8192 en capas 0-13; 12 bits/K=4096 en capas 14-39) para expertos enrutados; q4_K para atención, expertos compartidos, embedding y cabeza; F16 en las ganancias de fila; expertos de las torres MTP en VQ de 12 bits; visión en BF16 original. Sin datos de calibración |
| Idiomas soportados | `en`, `zh` |
| Licencia | MIT (herramientas YoungAi bajo MIT con aviso GGML; pesos DeepSeek bajo MIT) |
| Formato de pesos | GGUF base dividido en 40 partes por rangos de bytes; sidecar GGUF de visión (`DeepSeek-V4.1-Flash.vision.gguf`); tablas Engram en safetensors sin modificar |
| Tamano del repositorio | 317,6 GB |
| Tensores del GGUF base | 1.000 tensores, 113.556.639.424 bytes, mismo inventario y layout que la referencia V4.1 |
| Tablas Engram | 2 shards oficiales del checkpoint 1017: 101.535.150.936 B y 101.537.926.640 B (~203 GB), leídas in situ con `--engram-dir` |
| Sidecar de visión | 306 tensores, 971.066.016 bytes |
| Runtime objetivo | `ds4-dfm-rs` (CUDA, DGX Spark); `ds4-server` de YoungAi lee los mismos ficheros |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento del modelo base (no hay número de tokens, composición del dataset ni detalles de RLHF/DPO); lo que describe es el proceso de conversión. El modelo subyacente es un transformer con mezcla de expertos de 40 capas y 384 expertos enrutados, con atención, expertos compartidos, embedding y cabeza preservados en q4_K, y expertos enrutados comprimidos mediante cuantización vectorial: cada capa tiene un único codebook E4M3 compartido por los 384 expertos y por las tres proyecciones gate/up/down, con ganancias de fila en F16. Las capas 0-13 usan índices de 13 bits (8192 centroides) y las capas 14-39 de 12 bits (4096 centroides), una asignación de bits escalonada que da más resolución a la parte baja de la red. El proceso no usa datos de calibración.

El recetario es `vq8sh14-q4k-mtpnative` de YoungAi, aplicado sin cambios y con las herramientas fijadas a commits concretos; solo cambian los pesos de entrada, que son los del checkpoint 1017 verificados por SHA-256 en los 48 shards. Dos innovaciones destacan sobre una cuantización al uso: primero, el drafter MTP de tres torres DSpark va embebido en el propio GGUF base (expertos de las torres en VQ de 12 bits, resto en precisión nativa), lo que habilita decodificación especulativa sin ficheros adicionales; segundo, las tablas Engram de n-gramas se distribuyen como copia literal de los dos shards oficiales del 1017 y se leen en su sitio, de modo que no se recuantizan ni se alteran.

## Capacidades

- Generación de texto y razonamiento en inglés y chino, con contexto nativo de 1.048.576 tokens.
- Procesamiento de imagen y texto (`image-text-to-text`): torre DeepSeek-ViT, aligner y sesgos de router `bias_vl` por capa, cargados desde un sidecar GGUF independiente mediante `--vision-gguf`.
- Decodificación especulativa integrada: el GGUF base incluye las tres torres del drafter MTP DSpark, por lo que no requiere un modelo borrador externo.
- Recuperación léxica mediante tablas Engram de n-gramas del checkpoint 1017, montadas desde `deepseek-engram/` con `--engram-dir`.
- Mezcla de expertos con 384 expertos enrutados y codebooks VQ por capa, lo que permite ejecutar el modelo con un presupuesto de memoria muy inferior al del checkpoint BF16.
- Compatibilidad directa con el ecosistema de serving de YoungAi (`ds4-server`) y con el runtime `ds4-dfm-rs` en CUDA sobre DGX Spark.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes o modo de razonamiento explícito para esta conversión concreta.

## Casos de uso

- Despliegue en una única DGX Spark de 128 GB: el GGUF base de ~113,6 GB más el sidecar de visión de ~971 MB caben en la memoria de una máquina GB10, lo que permite servir un MoE de escala frontier sin clúster multi-GPU.
- Análisis de documentos e imágenes de gran extensión: con 1.048.576 tokens de contexto y torre de visión, se puede ingerir un corpus documental completo con figuras y hacer preguntas transversales sin troceado.
- Investigación sobre cuantización vectorial: el artefacto es un caso reproducible de la receta `vq8sh14-q4k-mtpnative` con comandos, flags y commits fijados en `RECIPE.md`, útil para comparar VQ de 12/13 bits frente a K-quants sobre los mismos pesos.
- Evaluación de decodificación especulativa MTP: al llevar el drafter embebido, sirve para medir la ganancia de throughput de las torres DSpark frente a decodificación autoregresiva estándar en el mismo hardware.
- Desarrollo de pipelines multimodales bilingües (en/zh): atención al cliente o moderación de contenido en escenarios donde el corpus es mayoritariamente inglés y chino.
- Prototipado de aplicaciones de contexto largo con presupuesto de memoria ajustado: la caché KV completa de 1M tokens se mide en 0,89 GB según YoungAi, por lo que el coste dominante es el peso de los expertos y las tablas Engram, no el estado de atención.
- Reproducibilidad y auditoría de pesos: los `SHA256SUMS`, `SOURCE.md` y la verificación de los 48 shards de entrada permiten reconstruir el artefacto y comprobar que se corresponde con el checkpoint 1017 oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica de calidad para el modelo base ni para esta conversión, y tampoco publica cifras numéricas de latencia o throughput: solo referencia una gráfica de throughput de `ds4-dfm-rs` en DGX Spark (en `docs/img/`) correspondiente a V4.1 Flash con la misma receta, no medida sobre este artefacto. El autor indica explícitamente que el serving en DGX Spark para esta versión aún no se ha medido y que las cifras de velocidad y fidelidad citadas son las de V4.1 Flash.

## Requisitos de hardware

- VRAM estimada para inferencia: ~113,6 GB para el GGUF base, más ~0,971 GB para el sidecar de visión si se usa multimodalidad, más 0,89 GB de caché KV a longitud completa de 1M tokens (medición de YoungAi para esta arquitectura).
- Almacenamiento adicional: ~203 GB para los dos shards Engram del 1017, que se leen in situ mediante `--engram-dir` en lugar de cargarse íntegramente en VRAM; el repositorio completo ocupa 317,6 GB.
- GPU recomendadas: NVIDIA DGX Spark (GB10, 128 GB) es el objetivo declarado. No se documentan otros perfiles de GPU en la información disponible.
- No cabe en GPU de consumo: 113,6 GB de pesos superan la VRAM de cualquier RTX 4090/5090, incluso con cuantizaciones más agresivas no publicadas para este artefacto.
- Opciones de despliegue: runtime `ds4-dfm-rs` (CUDA) y `ds4-server` de YoungAi, que lee los mismos ficheros. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles para este artefacto. El autor señala que las cifras de la gráfica incluida corresponden a V4.1 Flash con la misma receta y están etiquetadas como tales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-VQ-GGUF (este) | MoE 384 expertos, total no disponible | 1.048.576 | GGUF VQ q4_K, 113.556.639.424 B + sidecar visión 971.066.016 B | MIT | Público, 537 descargas, 12 likes |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | MoE, total no disponible | 1.048.576 | Safetensors BF16, ~510 GB, 48 shards | MIT | Público como checkpoint oficial |
| wenzhouwu/YoungAi-DeepSeek-V4.1-Flash | MoE, total no disponible | 1.048.576 | GGUF con la misma receta `vq8sh14-q4k-mtpnative` (pesos V4.1, no 1017) | MIT (según la model card de esta ficha) | Público; sirve de referencia de layout y receta |

No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes, ni de especificaciones de modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de mezcla silenciosa de artefactos: las tablas Engram del 1017 y las del V4.1 tienen los mismos nombres y tamaños. Un motor apuntado a las tablas antiguas las cargaría sin error y ejecutaría un modelo descuadrado; hay que usar `deepseek-engram/` de este repositorio o los ficheros del propio checkpoint 1017.
- El sidecar de visión también cambió: de los 971.066.016 bytes, 532.623.100 difieren respecto al sidecar de V4.1. Copiar el antiguo en este directorio cargaría sin aviso y procesaría imágenes con la torre equivocada.
- Los sidecars de dominio de YoungAi (zchain / GR-RB) para V4.1 no son compatibles con estos pesos; esta release no incluye ninguno ("None").
- Rendimiento no verificado en este artefacto: el autor confirma que la conversión está subida y pasa el chequeo del loader (`bind: slots=1000 bound=1000 required-missing=0`), pero el serving en DGX Spark no se ha medido para esta versión.
- Cuantización sin calibración: la receta VQ no usa datos de calibración, por lo que la fidelidad depende del codebook por capa; no se publican métricas de degradación frente al BF16.
- Idiomas limitados a inglés y chino según los metadatos; no se declara soporte de castellano ni de otras lenguas.
- No se documentan en la información disponible evaluación de sesgos, tasas de alucinación, comportamiento de rechazo ni resultados de seguridad; al no haber benchmarks publicados, la evaluación de calidad en producción queda en manos del usuario.
- Licencia MIT en pesos y herramientas, lo que en principio permite uso comercial, pero el aviso GGML de las herramientas y la licencia del modelo base deben revisarse antes de redistribuir; consúltese `LICENSE` y `LICENSE-DeepSeek` en el repositorio.
- Repositorio muy reciente (creado y actualizado el 2026-10-17) con adopción baja (537 descargas, 12 likes): no hay evidencia comunitaria de funcionamiento en producción.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces útiles se limitan a los que aparecen en la propia model card.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-VQ-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Modelo base, revisión fijada `1bae0e1088993b9b82de08f59de5be5a34e42170`: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/tree/1bae0e1088993b9b82de08f59de5be5a34e42170
- Artefacto de referencia con la misma receta (V4.1 Flash): https://huggingface.co/wenzhouwu/YoungAi-DeepSeek-V4.1-Flash
- Herramientas de conversión YoungAi: https://github.com/fodelf/YoungAi
- Runtime de serving `ds4-dfm-rs`: https://github.com/Baekpica/ds4-dfm-rs
- `RECIPE.md` (comandos, flags y commits fijados): https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-VQ-GGUF/blob/main/RECIPE.md
- `SOURCE.md` (procedencia y licencias): https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-VQ-GGUF/blob/main/SOURCE.md
- `SHA256SUMS`: https://huggingface.co/Baekpica/DeepSeek-V4.1-Flash-1017-VQ-GGUF/blob/main/SHA256SUMS
