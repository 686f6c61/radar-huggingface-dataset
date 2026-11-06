# BigFlubba/Qwen3.8-27B-Coder390-EfficientThink

## Resumen

Qwen3.8-27B-Coder390-EfficientThink es un modelo derivado de la familia Qwen3.8 de 27.000 millones de parametros, publicado por el usuario BigFlubba en Hugging Face. Se trata de un ajuste fino (post-entrenamiento) construido sobre nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2, que a su vez parte del Qwen3.8-27B oficial. El objetivo declarado es corregir el problema del modelo original de no detenerse: el modelo ya tiene una respuesta, pero sigue re-derivando hasta alcanzar el limite de 94K tokens sin dar una respuesta final.

El repositorio distribuido es una compilacion GGUF (y paquetes NInfer) con ocho variantes de cuantizacion, incluyendo cabezas MTP (multi-token prediction) integradas para decodificacion especulativa. El modelo es multimodal (pipeline image-text-to-text), soporta vision mediante mmproj en llama.cpp y dispone de licencia Apache 2.0. Esta pensado para despliegue local en llama.cpp y NInfer, con enfasis en eficiencia de razonamiento y generacion de codigo.

El modelo tiene 27.320.697.856 parametros totales, contexto de hasta 100K tokens en las evaluaciones reportadas, y esta entrenado con rondas de SFT y RLOO. Los idiomas declarados son ingles y chino. El repositorio ocupa 340,6 GB en total por incluir todas las variantes y el tower de vision en BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8), con cabeza MTP para decodificacion especulativa y tower de vision multimodal |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 100K tokens en evaluaciones (limite de razonamiento reportado: 94.208 tokens) |
| Tipos de cuantizacion | Q2 LynnStyle, Q3 LynnStyle-16G (IQ3_XXS + correccion imatrix), Q3 LynnStyle, Q4 LynnStyle, Q6_K, Q8_0, variantes -Q8MTP, BF16, FP8 estatico, NVFP4, NInfer W4A4, INT8 W8A8, INT4 W4A16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF, NInfer (.ninfer), safetensors (BF16 vision tower), BF16/FP8/NVFP4/INT8/INT4 en repositorio principal |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y ha sido post-entrenado en varias rondas: primero SFT y SimPO sobre el modelo oficial, y despues rondas adicionales de SFT y RLOO (REINFORCE Leave-One-Out) en esta variante Coder390. El objetivo del ajuste es corregir el comportamiento de sobre-razonamiento del modelo base, reduciendo la longitud de las cadenas de pensamiento sin perder precision en tareas de razonamiento y codigo. Los datos concretos de entrenamiento (numero de tokens, composicion del dataset) no estan disponibles en la informacion proporcionada.

La innovacion tecnica principal es la integracion de cabezas MTP (multi-token prediction) dentro de los ficheros GGUF, lo que habilita decodificacion especulativa sin necesidad de un draft model externo. Las cuantizaciones Q2/Q3/Q4 LynnStyle incorporan cabezas MTP Q4_0 o Q4_K con normas en F32, y las variantes -Q8MTP usan cabezas Q8_0. La cuantizacion Q3 LynnStyle-16G emplea IQ3_XXS con correccion por importance matrix y refinamientos GSQ-RCO del mismo tamano de byte. El modelo incluye ademas un tower de vision multimodal, empaquetado como mmproj Q8_0 para llama.cpp o integrado en los paquetes NInfer V3.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo de pensamiento (efficient-thinking), disenado para reducir la longitud de razonamiento respecto al modelo base.
- Generacion de codigo, con resultados destacados en LiveCodeBench (hasta 92/100 en la variante Q3 LynnStyle).
- Razonamiento cientifico y de conocimiento general (GPQA, MMLU).
- Capacidades multimodales de vision: pipeline image-text-to-text, soporte de imagenes via mmproj en llama.cpp y tower de vision integrado en NInfer.
- Decodificacion especulativa mediante cabezas MTP integradas, sin draft model externo.
- Soporte multilingue limitado a ingles y chino.
- Modelo "uncensored" segun la nomenclatura del autor, lo que implica menor filtrado de contenido.
- Compatibilidad con endpoints (tag endpoints_compatible) y uso conversacional.

## Casos de uso

- Generacion de codigo en produccion: el modelo obtiene hasta 92/100 en LiveCodeBench y puede integrarse en pipelines de revision o generacion de parches, con cuantizaciones Q3/Q4 que caben en GPU de 16-24 GB.
- Asistente de razonamiento cientifico: GPQA de 172-177 sobre 198 en las variantes cuantizadas, adecuado para preguntas de nivel experto en dominios tecnicos.
- Despliegue local en estaciones de trabajo: las variantes Q2 (BPW 3.89, ~13,3 GB) y Q3 LynnStyle-16G (~12,4 GiB) permiten ejecucion en GPU consumer de 16 GB de VRAM.
- Servicio de inferencia de alta concurrencia: con NInfer y cabeza MTP integrada se reportan 521 tok/s agregados a C8 en la variante Q2 y 512,3 tok/s en Q3 LynnStyle, lo que lo hace apto para servir multiples sesiones.
- Procesamiento de documentos con imagenes: al ser image-text-to-text, puede extraer y razonar sobre contenido visual, por ejemplo tablas o diagramas tecnicos, usando el mmproj Q8_0.
- Analisis de codigo en contexto largo: la ventana de hasta 100K tokens permite revisar repositorios o ficheros extensos en una sola pasada.
- Razonamiento con control de verbosidad: el ajuste efficient-thinking reduce la longitud de pensamiento (P50 de 148-190 tokens en MMLU frente a 5.299 del base en GPQA), util en entornos con limites de latencia o coste.

## Benchmarks y rendimiento

Resultados reportados por el autor (llama.cpp, C4, conjuntos completos de 100K, sin timeout, reasoning effort xhigh; las cifras de Q2/Q3 LynnStyle y Q4 se puntuaron antes de adjuntar la cabeza MTP integrada, con draft Q8 externo, mismos pesos cuantizados):

| Modelo / variante | GPQA | MMLU | LCB | Razonamiento P50 / P70 / P90 |
|---|---|---|---|---|
| Qwen3.8 27B original (FP8) | 177/198 | 444/500 | 83/100 | GPQA 5.299 / 12.607 / 50.577 |
| GGUF Q2 LynnStyle | 177/198 | 433/500 | 90/100 | GPQA 2.989,5 / 8.923,8 / 27.156,1; MMLU 181 / 326,3 / 1.020,5; LCB 5.656,5 / 17.835,8 / 40.067,3 |
| GGUF Q3 LynnStyle-16G | 172/198 | 427/500 | 90/100 | GPQA 3.811 / 11.404 / 31.418; MMLU 190 / 361 / 1.665; LCB 6.520 / 21.586 / 43.184 |
| GGUF Q3 LynnStyle | 173/198 | 449/500 | 92/100 | GPQA 3.125,5 / 7.265,2 / 24.343,1; MMLU 148 / 279,3 / 923,4; LCB 4.421 / 14.232,2 / 34.946 |
| GGUF Q4 LynnStyle | 175/198 | 448/500 | 89/100 | GPQA 2.951 / 8.159,3 / 25.649; MMLU 164 / 312,9 / 1.077,7; LCB 3.669,5 / 14.810,5 / 38.182,1 |

Rendimiento de velocidad (medido en una RTX PRO 6000 Blackwell; protocolos no comparables entre si):

| Variante | Runtime | Config | Throughput | Aceptacion MTP |
|---|---|---|---|---|
| Q2 LynnStyle | NInfer, MTP Q4, cap 512 | C8 | 521,0 tok/s agregado | no disponible |
| Q2 LynnStyle | llama.cpp, MTP Q4, cap 4096 | C4 | 174,8 tok/s agregado | no disponible |
| Q3 LynnStyle-16G | llama.cpp, MTP fusionado, cap 4096 | C1 / C2 / C4 | 31,9 / 46,6 / 78,1 tok/s | 0,597 |
| Q3 LynnStyle-16G | NInfer, cap 512 | C1 / C2 / C4 / C8 | 33,5 / 44,7 / 77,4 / 127,0 tok/s | 0,488 |
| Q3 LynnStyle | NInfer, MTP Q4, cap 512 | C8 | 512,3 tok/s agregado | no disponible |
| Q3 LynnStyle | llama.cpp, MTP Q4, cap 4096 | C4 | 191,8 tok/s agregado | no disponible |
| Q4 LynnStyle | NInfer, MTP Q4, cap 512 | C8 | 436,4 tok/s agregado | no disponible |
| Q4 LynnStyle | llama.cpp, MTP Q4, cap 4096 | C4 | 81,1 tok/s agregado | no disponible |

## Requisitos de hardware

- VRAM estimada: Q2 LynnStyle ~13,3 GB (BPW 3.89); Q3 LynnStyle-16G ~12,4 GiB GGUF / ~12,8 GiB NInfer con vision Q8; Q3 LynnStyle ~16,1 GiB (BPW 5.07); Q4 LynnStyle (tamano no disponible en la informacion); Q6_K y Q8_0 mayores, no cuantificados en la ficha.
- GPU recomendadas: RTX PRO 6000 Blackwell (usada en las mediciones), A100/H100 para despliegues de mayor concurrencia; RTX 4090 (24 GB) para Q3/Q4.
- Cabe en GPU consumer de 16 GB con las variantes Q2 y Q3 LynnStyle-16G; en 24 GB con Q3 LynnStyle y Q4.
- Opciones de despliegue: llama.cpp (con `--mmproj GGUF/mmproj-Qwen3.8-27B-Q8_0.gguf` para vision), NInfer (paquetes .ninfer con vision integrada), y los formatos BF16/FP8/NVFP4/INT8/INT4 del repositorio principal para vLLM/TGI (compatibilidad no verificada en la informacion).
- Latencia/throughput: ver tabla de benchmarks; C1 en Q3 LynnStyle-16G ronda 31,9-33,5 tok/s y C8 en NInfer alcanza 127 tok/s para esa variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GPQA | MMLU | LCB | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3.8-27B original (FP8) | 27B | no disponible | 177/198 | 444/500 | 83/100 | no disponible en la informacion | Hugging Face (Qwen) |
| Este modelo (Q3 LynnStyle) | 27B | 100K | 173/198 | 449/500 | 92/100 | apache-2.0 | GGUF/NInfer + repo principal |
| nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-... (base directo) | 27B | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita a los datos disponibles; no se dispone de cifras de benchmarks del modelo base intermedio nerkyor ni de otros modelos de 27B comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a modelos de razonamiento; el ajuste corrige el exceso de tokens de pensamiento, pero no elimina errores factuales.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta evaluado.
- Etiqueta "uncensored": implica menor filtrado de contenido, con riesgo de generar material inapropiado en produccion sin capas de moderacion adicionales.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8 y del ajuste intermedio de nerkyor.
- Los benchmarks de Q2/Q3 LynnStyle y Q4 se puntuaron antes de adjuntar la cabeza MTP integrada (con draft Q8 externo); los pesos son los mismos, pero el rendimiento final con MTP integrado puede diferir en velocidad, no en calidad.
- Las cifras de velocidad usan protocolos distintos (cap 512 vs 4096 tokens) y no son directamente comparables.
- Contexto maximo de razonamiento reportado en 94.208 tokens; sesiones muy largas pueden agotar presupuesto de computo.
- El repositorio es muy grande (340,6 GB) por incluir todas las variantes; la descarga completa no es necesaria para un unico despliegue.
- Sin descargas ni likes en el momento de la ficha; madurez y soporte comunitario no verificados.

## Enlaces

- Hugging Face: https://huggingface.co/BigFlubba/Qwen3.8-27B-Coder390-EfficientThink
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-EfficientThink-Uncensored-K3-Opus5-Grok4.6-GPT5.6Sol-SFT-SimPO-DFlash2
- Qwen3.8-27B oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio principal con BF16/FP8/NVFP4/INT8/INT4: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
