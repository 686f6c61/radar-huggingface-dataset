# kelsey1337/Inkling-2-Mini-heretic-GGUF

## Resumen

Inkling-2-Mini-heretic-GGUF es una colección de cuantizaciones GGUF del modelo yanauto/Inkling-2-Mini-heretic, una versión "decensored" (abliterated) del modelo base Inkling-2-Mini de Thinking Machines. El trabajo de abliteración es de yanauto, que aplicó la técnica Heretic ARA únicamente sobre las proyecciones de salida de atención; este repositorio de kelsey1337 añade los cuantizados de bits bajos e intermedios que el repositorio original no distribuye (Q4_K_M, Q8_0 y BF16).

El modelo cuenta con 26.070.385.152 parámetros totales y arquitectura MoE (mezcla de expertos), según las etiquetas del repositorio. Está pensado para ejecutarse en llama.cpp en una única GPU de 24 GB, con un rango de cuantizaciones que va desde 8,6 GB (IQ1_S) hasta 27,8 GB (Q8_0), e incluye un proyector de visión y un drafter de decodificación especulativa DSpark.

La relevancia actual radica en que permite ejecutar un modelo MoE de ~26B con capacidades multimodales y tool calling en hardware de consumo, manteniendo una perplexity cercana a la del modelo sin cuantizar (6,85 en Q4_K_M frente a 6,88 del original de yanauto) y con un rendimiento medido de hasta 105 t/s en una RTX 4090 con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), transformer; layout `inkling2_loop` |
| Parametros totales | 26.070.385.152 (~26B) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de `llama-server`; máximo no confirmado) |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, UD-Q4_K_XL |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini de Thinking Machines emplea una arquitectura MoE con layout interno `inkling2_loop`, con 24 capas en las que las proyecciones de salida de atención son las modificadas por la abliteración. El repositorio incluye además un drafter DSpark de 3 capas (`mtp.safetensors`) para decodificación especulativa y un proyector de visión F16 (`mmproj`) que habilita la entrada de imágenes.

El proceso de "decensoring" (Heretic ARA, attention output only) fue realizado por yanauto: según sus datos, redujo los rechazos de 100/100 a 6/100, con un descenso de MMLU de 78,7% a 78,0% y una divergencia KL de 0,049. Los cuantizados de este repositorio se generaron a partir del GGUF BF16 de yanauto usando su imatrix (wikitext-2 train, 200 chunks) con llama.cpp `19bc41d`. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset del modelo original.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`).
- Razonamiento y respuesta a instrucciones (MMLU 78,0% reportado por yanauto).
- Capacidades multimodales de visión mediante el proyector `mmproj-Inkling-2-Mini-heretic-attn-F16.gguf`.
- Tool calling y function calling (etiqueta `endpoints_compatible` y uso de `--jinja` en llama-server).
- Decodificación especulativa con drafter DSpark, con aceleración en generación de código corto (136 t/s frente a 105 t/s base en RTX 4090).
- Comportamiento "uncensored"/abliterated: rechazos reducidos a 6/100 según yanauto.
- Compatibilidad con el motor Maya mediante un graft específico en otro repositorio.

## Casos de uso

- Asistencia conversacional local: el modelo puede gestionar diálogos multi-turno con 32K tokens de contexto en una única RTX 4090, usando el cuantizado IQ4_XS (14,4 GB) y `--jinja` para plantillas de chat.
- Generación de código en estación de trabajo: con el drafter DSpark se alcanzan 136 t/s en código corto, lo que lo hace viable para autocompletado e integración en editores sobre hardware de consumo.
- Análisis de imágenes en local: el proyector de visión F16 (0,64 GB) permite pasar imágenes al modelo junto con el GGUF cuantizado, útil para tareas de descripción o extracción de información de capturas y documentos.
- Investigación sobre alineación y abliteración: al ser una versión decensored con métricas publicadas (rechazos, MMLU, KL), sirve para estudiar el impacto de la edición de proyecciones de atención en el comportamiento del modelo.
- Despliegue en pipelines con tool calling: la compatibilidad con endpoints y `--jinja` permite integrarlo en servidores llama.cpp que expongan una API compatible con OpenAI para agentes y automatizaciones.
- Evaluación de cuantizaciones: el repositorio ofrece 24 variantes con perplexity medida en algunas de ellas, lo que permite comparar el compromiso calidad/tamaño en un mismo modelo (de 8,6 GB a 27,8 GB).
- Prototipado con el motor Maya: el graft UD-Q4_K_XL permite alcanzar 197-244 t/s en RTX 4090 para cargas de inferencia de alta velocidad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| MMLU (modelo base) | 78,7% |
| MMLU (heretic) | 78,0% |
| Rechazos (base → heretic) | 100/100 → 6/100 |
| Divergencia KL | 0,049 |
| Perplexity Q4_K_M (wikitext-2, 40 chunks) | 6,8547 |
| Perplexity Q5_K_M | 6,8072 |
| Perplexity IQ4_XS | 6,8781 |
| Perplexity IQ3_M | 6,9970 |
| Perplexity IQ2_M | 7,2156 |
| Perplexity UD-Q4_K_XL (corpus técnico local) | 4,9321 ± 0,129 (stock 4,9017) |
| Throughput llama.cpp (RTX 4090) | 105 t/s estable; 136 t/s en código corto con drafter |
| Throughput motor Maya (RTX 4090) | 197-244 t/s |

## Requisitos de hardware

- VRAM estimada: desde ~9 GB (IQ1_S, 8,6 GB) hasta ~28 GB (Q8_0, 27,8 GB); el rango práctico para 24 GB es IQ4_XS (14,4 GB) a Q5_K_M (19,9 GB).
- GPU recomendadas: RTX 4090 (24 GB) es el objetivo declarado; cabe en GPUs de 24 GB como RTX 3090/4090. Para Q8_0 se necesita una GPU de 32 GB o más (A100 40 GB, H100).
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones IQ4_XS a Q5_K_M; Q6_K (23,5 GB) y Q8_0 quedan al límite o fuera.
- Opciones de despliegue: llama.cpp mainline b12600 o superior (layout `inkling2_loop`); para UD-Q4_K_XL se requiere b12611+ con el PR #32704; el motor Maya con el graft específico.
- Latencia y throughput: 105 t/s estables en RTX 4090 con llama.cpp e IQ4_XS; 136 t/s en código corto con el drafter DSpark; 197-244 t/s con el motor Maya.
- El drafter DSpark (0,40 GB) requiere llama.cpp con el PR #32218 en `e4b1cb5` o posterior.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, el propio repositorio menciona el modelo base Inkling-2-Mini de Thinking Machines y las cuantizaciones de unsloth/Inkling-2-Mini-GGUF, que comparten arquitectura y tamaño pero no incorporan la edición heretic.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini-heretic (este) | ~26B | 32K (usado) | Apache 2.0 | Abliterated, GGUF con visión y drafter |
| Inkling-2-Mini (Thinking Machines) | ~26B | no disponible | no disponible | Base sin decensoring |
| unsloth/Inkling-2-Mini-GGUF | ~26B | no disponible | no disponible | Cuantizaciones UD mainline sin edición heretic |

## Limitaciones y advertencias

- Modelo abliterated: la eliminación de rechazos (de 100/100 a 6/100) implica que puede generar contenido que el modelo base rechazaría; requiere filtros y políticas de uso en producción.
- Riesgo de alucinación inherente a modelos de ~26B; no se han publicado evaluaciones específicas de factualidad.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado.
- La longitud máxima de contexto no está confirmada; el ejemplo usa 32.768 tokens, pero el máximo real puede diferir.
- Requiere versiones muy concretas de llama.cpp (b12600+, b12611+ para UD-Q4_K_XL); los binarios precompilados del fork de Unsloth y las builds con el PR #32695 no cargan estos ficheros.
- El drafter DSpark depende de un PR no fusionado (#32218); su formato cambió respecto a versiones anteriores.
- Perplexity medida solo en un subconjunto de cuantizaciones y en muestras limitadas (40 chunks de wikitext-2 o corpus local), por lo que no es una evaluación exhaustiva.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado por la variante decensored recae en el desplegador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kelsey1337/Inkling-2-Mini-heretic-GGUF
- Modelo base heretic: https://huggingface.co/yanauto/Inkling-2-Mini-heretic
- GGUF de yanauto: https://huggingface.co/yanauto/Inkling-2-Mini-heretic-GGUF
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones de unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Graft para motor Maya: https://huggingface.co/kelsey1337/Inkling-2-Mini-heretic-UD-Q4_K_XL-Maya-GGUF
- Repositorio del motor Maya: https://github.com/alesha-pro/maya-inkling-mini
- PR de llama.cpp para layout inkling2_loop: https://github.com/ggml-org/llama.cpp/pull/32694
- PR de llama.cpp para UD-Q4_K_XL: https://github.com/ggml-org/llama.cpp/pull/32704
- PR de llama.cpp para drafter DSpark: https://github.com/ggml-org/llama.cpp/pull/32218
