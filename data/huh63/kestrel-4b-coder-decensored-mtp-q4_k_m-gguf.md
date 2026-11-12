# hUh63/Kestrel-4B-Coder-Decensored-MTP-Q4_K_M-GGUF

## Resumen

Kestrel-4B-Coder-Decensored-MTP-Q4_K_M-GGUF es una cuantización comunitaria en formato GGUF del modelo Kestrel-4B-Coder de Jackrong, que a su vez es un fine-tune de Qwen3.5-4B del equipo Qwen. El autor de esta derivación es hUh63, que publica un único fichero Q4_K_M con tres modificaciones respecto al original: una ablación a nivel de pesos para reducir el comportamiento de rechazo (decensoring), la integración de la cabeza MTP (multi-token prediction) dentro del mismo GGUF como capa 33 para decodificación especulativa, y una cuantización Q4_K_M guiada por importance matrix con la capa MTP mantenida en Q6_K. El modelo tiene 4.326.350.848 parámetros y una ventana de contexto que no se especifica en la información disponible.

El interés técnico de esta ficha reside en dos aspectos poco habituales. Primero, la arquitectura híbrida de Qwen3.5, con 24 capas de atención lineal Gated DeltaNet y 8 capas de self-attention completa, que el autor documenta explícitamente al adaptar la técnica de ablación. Segundo, el empaquetado de la cabeza MTP en el mismo fichero GGUF, lo que permite usar decodificación especulativa con `--spec-type draft-mtp` sin necesidad de un segundo modelo draft. El pipeline declarado es image-text-to-text y el repo incluye un proyector visual separado en F16.

La licencia es Apache-2.0, heredada del modelo fuente. El modelo está etiquetado como decensored/abliterated, lo que implica que se ha reducido deliberadamente la tendencia a rechazar peticiones; esto tiene implicaciones directas para su uso en producción que se detallan en la sección de limitaciones. El repo ocupa 3,5 GB y el fichero principal del modelo pesa 2.807.777.984 bytes (2,61 GiB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 24 capas de atención lineal Gated DeltaNet + 8 capas de self-attention completa |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (file_type 15, MOSTLY_Q4_K_M); capa MTP/NextN en Q6_K; proyector visual en F16 |
| Idiomas soportados | en, zh, ko, ja, ru, es, fr |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero principal) + mmproj-F16.gguf para visión |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-4B, un transformer híbrido que combina 24 capas de atención lineal Gated DeltaNet con 8 capas de self-attention completa. Sobre esa base, Jackrong produjo el fine-tune Kestrel-4B-Coder, orientado a generación de código, tool use y function calling. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el fine-tune original.

La derivación de hUh63 aplica tres transformaciones documentadas. La primera es una ablación rank-1 de la dirección de rechazo siguiendo el método de Arditi et al. (2024) y la implementación de Heretic, adaptada a la arquitectura híbrida: se calculan direcciones de rechazo por capa a partir de 48 prompts benignos de `mlabonne/harmless_alpaca` y 48 prompts dañinos de `mlabonne/harmful_behaviors`, se ortogonalizan contra la dirección benigna y se aplica la ablación solo en las matrices que escriben en el residual stream (`self_attn.o_proj`, `linear_attn.out_proj` y `mlp.down_proj`), con preservación de magnitud de fila. La configuración seleccionada es `strength=1.2, attn_w=1.0, mlp_w=0.5`, con una reducción de separabilidad dañino-benigno del 89,3% y un coseno de representaciones benignas de 0,9950 respecto al original; dos candidatos más agresivos se descartaron por incumplir el umbral de 0,995. La segunda transformación es la integración de los tensores `mtp.*` como capa 33 (`blk.32.nextn.*`) para decodificación especulativa. La tercera es la cuantización Q4_K_M con importance matrix calculada sobre unos 760 KiB de texto multilingüe, matemáticas, código, razonamiento y agentes, manteniendo la capa MTP completa en Q6_K. No se tocaron los tensores `mtp.*`, `model.visual.*`, la matriz de embeddings ni las normalizaciones.

## Capacidades

- Generación de texto y código: el modelo está orientado explícitamente a code-generation según sus etiquetas y su linaje de fine-tune.
- Tool calling y function calling: etiquetado como `tool-use` y `function-calling`.
- Uso como agente: etiquetado como `agent`, con soporte de razonamiento multi-paso según la model card.
- Capacidades multimodales: pipeline `image-text-to-text`, con torre visual incluida y proyector separado `mmproj-F16.gguf`; la visión es opcional para uso solo de texto.
- Decodificación especulativa integrada: cabeza MTP empaquetada en el mismo GGUF, usable con `--spec-type draft-mtp` en llama.cpp sin modelo draft adicional.
- Multilingüe: soporte declarado de inglés, chino, coreano, japonés, ruso, español y francés.
- Comportamiento decensored: reducción medida de la dirección de rechazo, con los números de ablación documentados en `ablation_report.json`.

## Casos de uso

- Asistencia de código en local: el modelo cabe en un fichero de 2,61 GiB y puede ejecutarse en llama.cpp sobre CPU o GPU de gama media; es adecuado para autocompletado y generación de funciones en entornos sin acceso a la nube.
- Agentes de edición de código con tool calling: las etiquetas `agent`, `tool-use` y `function-calling` indican soporte para invocar herramientas; se puede integrar en un bucle de agente que lea ficheros, aplique parches y ejecute tests.
- Despliegue con decodificación especulativa: la cabeza MTP integrada permite activar `--spec-type draft-mtp` con un solo fichero, lo que reduce la latencia de generación sin gestionar un segundo modelo draft.
- Procesamiento de capturas y diagramas: con el proyector `mmproj-F16.gguf`, el modelo puede recibir imágenes junto a texto, útil para explicar diagramas de arquitectura o transcribir capturas de errores a código.
- Atención multilingüe en siete idiomas: con soporte declarado de en, zh, ko, ja, ru, es y fr, puede emplearse en revisión de código o documentación técnica para equipos distribuidos.
- Entornos de investigación sobre alineación y rechazo: el repo incluye `ablation_report.json`, `calibration.txt` y `tensor_types.txt`, lo que permite reproducir y auditar el efecto de la ablación sobre el comportamiento del modelo.
- Prototipado de pipelines multimodales en hardware modesto: al ser un modelo de 4B en Q4_K_M, sirve para validar flujos image-text-to-text antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo aporta métricas internas de la ablación de rechazo, medidas sobre 12 prompts retenidos por clase en las capas 12 a 27:

| Metrica | Baseline | Final |
|---|---|---|
| Proyección dañina sobre la dirección de rechazo | 7,3356 | 0,7373 |
| Proyección benigna | -0,0011 | -0,0446 |
| Separabilidad (dañino − benigno) | 7,3367 | 0,7819 (−89,3%) |
| Coseno de representaciones benignas vs. original | 1,0000 | 0,9950 |

No hay datos de MMLU, HumanEval, GSM8K ni de aceptación de la decodificación especulativa en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero principal pesa 2,61 GiB en Q4_K_M; con overhead de contexto y caché KV, un presupuesto de 4 a 6 GiB de VRAM o RAM es razonable, aunque la cifra exacta no está publicada.
- Proyector visual: `mmproj-F16.gguf` añade 672.423.776 bytes (unos 641 MiB) si se usa visión.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU consumer con 8 GiB o más debería poder alojar el modelo en Q4_K_M, pero no hay validación publicada.
- CPU: la cuantización se reprodujo en un entorno de 8 núcleos y 16 GiB de RAM sin GPU, lo que sugiere viabilidad en CPU para inferencia básica.
- Opciones de despliegue: llama.cpp (formato nativo GGUF, con soporte de `--spec-type draft-mtp`), y por extensión los runners compatibles con GGUF; la librería declarada es transformers pero el artefacto es GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kestrel-4B-Coder-Decensored-MTP-Q4_K_M (este) | 4,33B | no disponible | Apache-2.0 | GGUF Q4_K_M + mmproj F16 | Decensored, MTP integrada, visión |
| Jackrong/Kestrel-4B-Coder | 4,33B (mismo base) | no disponible | Apache-2.0 | safetensors (presumible) | Modelo fuente sin decensoring ni cuantización |
| Qwen/Qwen3.5-4B | 4B | no disponible | no disponible en la información | no disponible | Base original de Qwen |
| unsloth/Qwen3.5-4B | 4B | no disponible | no disponible en la información | no disponible | Preparación de Unsloth usada como punto de partida |

La información disponible no permite comparar rendimiento con alternativas de la misma categoría; no se han publicado benchmarks.

## Limitaciones y advertencias

- Modelo decensored: la ablación reduce la dirección de rechazo en un 89,3% de separabilidad; esto implica que el modelo puede generar contenido que el original rechazaría. No es adecuado para aplicaciones con requisitos de moderación estrictos sin una capa adicional de filtrado.
- Derivado no oficial: el autor declara explícitamente que no está afiliado ni validado por Jackrong, Qwen, Alibaba ni Unsloth; no hay garantía de soporte ni de mantenimiento.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo de 4B, es esperable una tasa de alucinación superior a la de modelos mayores, pero no hay medición publicada.
- Contexto: la longitud de contexto no se especifica en la información disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Idiomas: aunque se declaran siete idiomas, no hay evaluación publicada de calidad por idioma; el rendimiento en español, francés o ruso no está verificado.
- Licencia: Apache-2.0 permite uso comercial, pero el decensoring puede chocar con políticas de contenido de plataformas de despliegue; conviene revisar los términos de cada proveedor.
- Cuantización Q4_K_M: implica pérdida de precisión respecto al modelo en punto flotante; no hay comparación publicada de degradación en benchmarks.
- Capa MTP en Q6_K: el autor la mantiene en mayor precisión para preservar la tasa de aceptación de la decodificación especulativa, pero no se publican cifras de aceptación ni de ganancia de velocidad.
- Visión opcional: el proyector es un fichero separado; sin él, el modelo funciona solo con texto.

## Enlaces

- Hugging Face: https://huggingface.co/hUh63/Kestrel-4B-Coder-Decensored-MTP-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Jackrong/Kestrel-4B-Coder
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Preparación de Unsloth: https://huggingface.co/unsloth/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Jackrong/Kestrel-4B-Coder/blob/main/LICENSE
- Heretic (método de ablación): https://github.com/p-e-w/heretic
- Paper de referencia sobre la dirección de rechazo (Arditi et al., 2024): no disponible como enlace en la información proporcionada
- Repositorio llama.cpp: no disponible como enlace en la información proporcionada
