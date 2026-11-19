# kalli992/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP es un ajuste fino (fine-tune) multi-etapa del modelo Qwen3.5-9B, desarrollado por kalli992 a partir del trabajo original de DavidAU y Nightmedia. Se distribuye como una colección de cuantizaciones GGUF (tanto "regulares" como "MTP" de predicción multi-token) generadas con la técnica NEO Imatrix del autor. El modelo está orientado a usos sin censura ("heretic"/"abliterated"), razonamiento con modo thinking, escritura creativa, ficción, roleplay y código, y conserva la ventana multimodal image-text-to-text del modelo base.

La relevancia de esta ficha reside en que empaqueta en ~8.950 millones de parámetros un modelo que, según los datos del autor, supera a Qwen3.5-27B en 7 de 7 benchmarks internos (ARC-C, ARC-E, BoolQ, HellaSwag, OpenBookQA, PIQA, WinoGrande) y se acerca a Qwen3.6-27B en algunos casos, manteniendo la huella de un modelo de 9B. El repositorio ocupa 204,9 GB e incluye múltiples niveles de cuantización, lo que permite desplegarlo desde GPUs de consumo hasta servidores con A100/H100.

La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque conviene revisar las condiciones del modelo base y la naturaleza "uncensored" del ajuste antes de integrarlo en productos orientados al público.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B); soporte de predicción multi-token (MTP) en las cuantizaciones marcadas como MTP |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF regulares y GGUF MTP; niveles citados: Q4_K_S, Q6, Q8, mxfp8, mxfp4; tensores MTP en Q8_0 y tensor de salida en 16 bits |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (regulares y MTP); el modelo base se distribuye en bfloat16 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3.5-9B, ajustado mediante un pipeline multi-etapa y multi-modelo (fine-tune y merge) ejecutado en hardware local por DavidAU y Nightmedia. El objetivo declarado del ajuste fue elevar la inteligencia general y el seguimiento de instrucciones, no solo especializar en una tarea. El proceso incluyó una fase de "hereticación" (abliteration) previa al entrenamiento final, de modo que el modelo resultante responde sin rechazos ni advertencias morales. También se compactó el bloque de razonamiento (thinking block), que según el autor resulta más fuerte en muchos casos.

Las cuantizaciones GGUF se generan con la técnica NEO Imatrix del autor, que según la model card mejora la precisión entre un 2% y un 4% respecto a GGUF convencionales y ayuda en contexto largo. Además, el tensor de salida (10-20% de la salida) se mantiene en 16 bits en todas las cuantizaciones, y los tensores MTP se fijan a Q8_0. Las variantes "MTP" implementan predicción multi-token para acelerar la decodificación, con recomendaciones de temperatura ≤ 1 y repetition penalty = 1 para no degradar la tasa de aceptación.

## Capacidades

- Generación de texto general con modo instruct y modo thinking/razonamiento conmutable.
- Razonamiento multi-paso y matemáticas (hereda las capacidades de Qwen3.5-9B).
- Generación de código y tareas de programación (etiqueta "coder").
- Escritura creativa, ficción y roleplay sin restricciones de contenido.
- Capacidad multimodal image-text-to-text (pipeline declarado en Hugging Face).
- Soporte multilingüe en 16 idiomas (árabe, chino, inglés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, polaco, portugués, ruso, español, tailandés y vietnamita).
- Modo "uncensored"/"abliterated": responde a peticiones que modelos alineados rechazarían.
- Variantes MTP con decodificación multi-token para mayor throughput.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- Escritura de ficción y narrativa larga: el modelo está ajustado específicamente para ficción y roleplay, con un bloque de razonamiento compactado que reduce la latencia en generaciones creativas extensas.
- Roleplay conversacional multi-turno: la naturaleza "uncensored" permite personajes y tramas sin filtros moralizantes, útil en plataformas de entretenimiento interactivo.
- Generación de código en local: con ~9B parámetros y cuantización Q4_K_S cabe en GPUs de consumo; puede integrarse en asistentes de programación autoalojados.
- Razonamiento asistido con modo thinking: tareas de análisis, matemáticas y planificación donde se necesita una cadena de razonamiento explícita antes de la respuesta final.
- Atención al cliente en dominios sensibles: sectores donde los filtros estándar bloquean consultas legítimas (salud, legal, seguridad) y se requiere una respuesta directa sin evasivas.
- Investigación sobre alineación y seguridad: útil como modelo de referencia "abliterated" para estudiar diferencias de comportamiento frente a modelos alineados.
- Despliegue en hardware modesto: las cuantizaciones Q4 permiten servir el modelo en una sola RTX 4090 o incluso en GPUs de 16 GB con contexto reducido.
- Traducción multilingüe entre los 16 idiomas soportados, especialmente en pares que no incluyen el inglés.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (modo instruct, harness de evaluación del autor). No se han verificado de forma independiente.

| Modelo | arc/c | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| Defiant-Fable 9B (bf16) | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Defiant-Fable 9B (mxfp8) | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Defiant-Fable 9B (mxfp4) | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (mxfp8) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.8-27B (mxfp8) | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.6-27B-Instruct (mxfp8) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.5-27B-Instruct (mxfp8) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |
| Qwen3.6-35B-A3B-Instruct (mxfp8) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |

Según el autor, el modelo supera a Qwen3.5-27B en los 7 benchmarks y se acerca a Qwen3.6-27B en algunos. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_S: aproximadamente 5,5-6,5 GB de pesos, más overhead de contexto; viable en GPUs de 8-12 GB.
- VRAM estimada en Q8: aproximadamente 10-11 GB de pesos; requiere GPU de 16 GB o superior.
- VRAM estimada en bf16: aproximadamente 18-20 GB; requiere A100 40GB, H100, RTX 4090 24GB (ajustado) o similar.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100 para las variantes de mayor precisión; RTX 4060 Ti 16GB, RTX 4070 Ti Super o superiores para Q4.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 (y Q6 en GPUs de 16 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; las variantes MTP requieren soporte de predicción multi-token en el runtime.
- Latencia y throughput: según el autor, en Q4_K_S las variantes regulares alcanzan ~130 t/s; las MTP con 60% de aceptación (2 tokens) superan esa cifra. No se especifica el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks (arc/c) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Defiant-Fable 9B (este) | ~8,95B | no disponible | 0,649 (bf16) | Apache 2.0 | GGUF en HF |
| Qwen3.5-9B-Instruct | ~9B | no disponible | 0,571 (mxfp8) | Apache 2.0 (según base) | HF oficial |
| Qwen3.5-27B-Instruct | ~27B | no disponible | 0,557 (mxfp8) | Apache 2.0 (según base) | HF oficial |
| Qwen3.6-27B-Instruct | ~27B | no disponible | 0,647 (mxfp8) | Apache 2.0 (según base) | HF oficial |

El modelo se posiciona como alternativa de 9B con rendimiento declarado comparable a modelos de 27B en los benchmarks del autor, a costa de ser un ajuste no oficial y sin verificación independiente.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": no aplica filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o dañino. No apto para productos orientados al público sin moderación externa.
- Riesgo elevado de alucinación, especialmente en modo thinking y en dominios especializados.
- Los benchmarks son internos del autor, en modo instruct y con su propio harness; no han sido verificados de forma independiente.
- La ventana de contexto no se especifica en la información disponible; conviene validarla antes de usos con documentos largos.
- Las variantes MTP requieren temperatura ≤ 1 y repetition penalty = 1; con otros valores el rendimiento se degrada. Si la tasa de aceptación baja del 50%, el autor recomienda usar las variantes regulares.
- El repositorio ocupa 204,9 GB; la descarga completa es costosa y conviene seleccionar solo la cuantización necesaria.
- Aunque la licencia declarada es Apache 2.0, es responsabilidad del usuario verificar las condiciones del modelo base Qwen3.5-9B y del ajuste intermedio de DavidAU.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria.
- El pipeline declarado es image-text-to-text, pero las capacidades multimodales no se detallan en la información disponible.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/kalli992/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Perfil del autor original (DavidAU): https://huggingface.co/DavidAU
- Colecciones de DavidAU: https://huggingface.co/DavidAU/collections
- FAQs y soporte de DavidAU: https://huggingface.co/DavidAU/support
- Modelo relacionado Qwen3.6-27B-Fable-Fusion-711: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
