# nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer

## Resumen

Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO es un modelo de lenguaje de 27.320 millones de parámetros desarrollado por el usuario nerkyor sobre la base oficial Qwen3.8-27B de Qwen. El modelo ha pasado por varias rondas de post-entrenamiento: SFT y SimPO sobre la base original, y posteriormente SFT y RLOO (REINFORCE Leave-One-Out) en esta iteración. Su objetivo declarado es corregir un fallo concreto del modelo original: la tendencia a seguir re-derivando una respuesta ya obtenida hasta agotar el límite de 94.000 tokens sin emitir una respuesta final.

Este repositorio concreto es la distribución GGUF independiente, con ocho paquetes bajo `GGUF/` (Q2, Q3 y Q4 LynnStyle con cabezas MTP Q4_0 integradas; las mismas tres en variante -Q8MTP; Q6_K; y Q8_0) y los paquetes NInfer correspondientes con visión integrada. El modelo es multimodal (pipeline `image-text-to-text`), soporta decodificación especulativa mediante cabezas MTP y se distribuye bajo licencia Apache 2.0. Los idiomas declarados son inglés y chino.

La relevancia actual del modelo reside en su enfoque en la eficiencia del razonamiento: los datos publicados muestran reducciones drásticas en la longitud de cadena de pensamiento respecto al baseline (por ejemplo, en GPQA el P90 baja de 50.577 a 27.156 tokens en Q2 LynnStyle) manteniendo puntuaciones competitivas en GPQA, MMLU y LiveCodeBench.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.8-27B) con cabezas MTP para decodificación especulativa; torre de visión multimodal |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 100K en las evaluaciones publicadas; límite de razonamiento de 94.208 tokens (max_tokens) |
| Tipos de cuantizacion | GGUF: Q2 LynnStyle, Q3 LynnStyle-16G (IQ3_XXS + corrección imatrix + GSQ-RCO), Q3 LynnStyle, Q4 LynnStyle, Q6_K, Q8_0, variantes -Q8MTP; NInfer; en el repo principal también BF16, FP8 estático, NVFP4, W4A4, INT8 W8A8, INT4 W4A16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), paquetes NInfer (.ninfer), safetensors BF16 (torre de visión); repo de 540,3 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27.320 millones de parámetros. Sobre esa base se aplicó primero SFT y SimPO (en la iteración anterior, Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2) y después, en esta versión, varias rondas adicionales de SFT y RLOO. El objetivo del post-entrenamiento es corregir el comportamiento de "no parar" del modelo original, que seguía re-derivando respuestas ya obtenidas hasta el tope de contexto sin concluir.

La arquitectura incorpora cabezas MTP (Multi-Token Prediction) integradas en los GGUF para decodificación especulativa, con aceptación medida entre 0,488 y 0,597 según configuración. La cuantización Q3 LynnStyle-16G emplea corrección con importance matrix y refinamientos GSQ-RCO limitados a mismo byte para no alterar el tamaño. Los paquetes NInfer incluyen la torre de visión Q8 integrada; para llama.cpp multimodal se usa un mmproj Q8_0 separado. No se dispone de datos sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento eficiente (efficient-thinking), con longitudes de razonamiento acortadas respecto al baseline.
- Programación y resolución de problemas de código (evaluado en LiveCodeBench).
- Matemáticas y razonamiento científico (evaluado en GPQA y MMLU).
- Multimodal: entrada de imagen y texto (pipeline `image-text-to-text`), con torre de visión en paquetes NInfer o mmproj en llama.cpp.
- Decodificación especulativa mediante cabezas MTP integradas en los GGUF.
- Modelo "uncensored" según los tags del autor (sin filtrado declarado en el post-entrenamiento).
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento científico con presupuesto de tokens acotado: el modelo reduce la longitud de razonamiento en GPQA (P90 de 27.156 tokens en Q2 frente a 50.577 del baseline), lo que permite desplegarlo en pipelines con límites de latencia y coste donde el original agotaba el contexto.
- Generación de código en producción: las puntuaciones de LiveCodeBench (89-92/100 en las variantes Q2-Q4) lo hacen adecuado para autocompletado, revisión y generación de tests en entornos de CI/CD con llama.cpp o NInfer.
- Despliegue en GPU de consumo de 16 GB: la variante Q3 LynnStyle-16G (unos 12,4 GiB, BPW 3,89) está recomendada explícitamente para 16 GB de VRAM, permitiendo inferencia local de un modelo de 27B.
- Servicio de alto throughput con decodificación especulativa: con MTP integrado y NInfer se alcanzan 521,0 tok/s agregados a C8 (Q2, límite de 512 tokens) y 191,8 tok/s a C4 en llama.cpp (Q3, límite de 4096 tokens), adecuado para endpoints concurrentes.
- Procesamiento de documentos con imágenes: al ser image-text-to-text, puede extraer y razonar sobre contenido de capturas, diagramas o documentos escaneados usando el mmproj o los paquetes NInfer con visión integrada.
- Asistente conversacional multirretorno en inglés o chino con contexto largo (hasta 100K tokens), útil para análisis de repositorios completos o conversaciones extensas.
- Investigación sobre eficiencia de razonamiento: sirve como caso de estudio de cómo SFT + RLOO modifican la distribución de longitud de cadena de pensamiento manteniendo precisión.

## Benchmarks y rendimiento

| Modelo / variante | GPQA | MMLU | LCB | P50/P70/P90 GPQA (tokens) |
|---|---|---|---|---|
| Baseline Qwen3.8 27B (FP8) | 177/198 | 444/500 | 83/100 | 5.299 / 12.607 / 50.577 |
| GGUF Q2 LynnStyle | 177/198 | 433/500 | 90/100 | 2.989,5 / 8.923,8 / 27.156,1 |
| GGUF Q3 LynnStyle-16G | 172/198 | 427/500 | 90/100 | 3.811 / 11.404 / 31.418 |
| GGUF Q3 LynnStyle | 173/198 | 449/500 | 92/100 | 3.125,5 / 7.265,2 / 24.343,1 |
| GGUF Q4 LynnStyle | 175/198 | 448/500 | 89/100 | 2.951,0 / 8.159,3 / 25.649,0 |

Velocidad publicada (protocolos no comparables entre sí):

| Variante | Runtime | Config | Throughput |
|---|---|---|---|
| Q2 LynnStyle | NInfer, MTP Q4 | C8, 512 tokens | 521,0 tok/s agregados |
| Q2 LynnStyle | llama.cpp, MTP Q4 | C4, 4096 tokens | 174,8 tok/s agregados |
| Q3 LynnStyle-16G | llama.cpp, MTP fusionado | C1/C2/C4, 4096 tokens | 31,9 / 46,6 / 78,1 tok/s (aceptación 0,597) |
| Q3 LynnStyle-16G | NInfer | C1/C2/C4/C8, 512 tokens | 33,5 / 44,7 / 77,4 / 127,0 tok/s (aceptación 0,488) |
| Q3 LynnStyle | NInfer, MTP Q4 | C8, 512 tokens | 512,3 tok/s agregados |
| Q3 LynnStyle | llama.cpp, MTP Q4 | C4, 4096 tokens | 191,8 tok/s agregados |
| Q4 LynnStyle | NInfer, MTP Q4 | C8, 512 tokens | 436,4 tok/s agregados |
| Q4 LynnStyle | llama.cpp, MTP Q4 | C4, 4096 tokens | 81,1 tok/s agregados |

Tamaños: Q2 LynnStyle 13.276.009.792 bytes (BPW 3,89); Q3 LynnStyle-16G 13.276.009.920 bytes (~12,4 GiB, BPW 3,89); Q3 LynnStyle 17.303.770.432 bytes (BPW 5,07); NInfer con visión añade entre 0,3 y 0,5 GB según variante.

## Requisitos de hardware

- VRAM estimada: Q2 LynnStyle ~13,3 GB; Q3 LynnStyle-16G ~12,4 GiB (pensada para 16 GB de VRAM); Q3 LynnStyle ~17,3 GB; Q4 LynnStyle y superiores, proporcionalmente mayores (Q6_K y Q8_0 no tienen cifras publicadas).
- GPU recomendadas: RTX PRO 6000 Blackwell (usada en las mediciones del autor); para Q3-16G, cualquier GPU con 16 GB o más.
- Cabe en GPU de consumo: sí, Q2 y Q3 LynnStyle-16G en tarjetas de 16 GB; el resto requiere más VRAM o descarga a CPU.
- Opciones de despliegue: llama.cpp (con `--mmproj GGUF/mmproj-Qwen3.8-27B-Q8_0.gguf` para multimodal), NInfer (paquetes .ninfer con visión integrada), y otros runtimes compatibles con GGUF.
- Latencia y throughput: ver tabla de benchmarks; mediciones en una sola RTX PRO 6000 Blackwell, con protocolos corto (512 tokens) y largo (4096 tokens) no comparables entre sí.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GPQA | MMLU | LCB | Licencia |
|---|---|---|---|---|---|---|
| Este modelo (Q4 LynnStyle) | 27,3B | 100K | 175/198 | 448/500 | 89/100 | Apache 2.0 |
| Baseline Qwen3.8-27B (FP8) | 27,3B | 100K | 177/198 | 444/500 | 83/100 | no disponible en la información |
| Qwen3.8-27B-EfficientThink base (SFT+SimPO) | 27,3B | 100K | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de terceros en la información proporcionada; los únicos puntos de comparación publicados son las iteraciones previas del propio autor.

## Limitaciones y advertencias

- El modelo es una modificación no oficial de Qwen3.8-27B realizada por un autor individual (nerkyor); no cuenta con validación independiente.
- Los benchmarks publicados proceden del propio autor y emplean protocolos heterogéneos (corto vs. largo, con y sin MTP externo), por lo que no son directamente comparables entre filas.
- Etiquetado como "uncensored": no se declaran filtros de seguridad, lo que implica riesgo de generar contenido inapropiado o dañino en producción.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado ni declarado.
- Riesgo de alucinación no cuantificado; no se publican evaluaciones de veracidad.
- El fallo original de "no parar" se mitiga pero persiste parcialmente: el P90 de razonamiento en LCB llega a 40.067 tokens en Q2, cerca del límite de 94.208.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones de los datos de entrenamiento del post-entrenamiento no se detallan.
- El repositorio ocupa 540,3 GB; conviene descargar solo el paquete GGUF o NInfer necesario.
- El nombre del modelo agrega referencias a terceros (Opus, GPT, Grok, DeepSeek) que no implican afiliación ni destilación verificada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-GGUF-NInfer
- Repositorio principal (BF16, FP8, NVFP4, NInfer W4A4, INT8, INT4): https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Modelo base del post-entrenamiento: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
