# mkurman/neuroblast-v46-150m-v41tok-50b

## Resumen

NeuroBLAST v46 150M (50B tokens) es un modelo de lenguaje de tipo base, en desarrollo activo, publicado por el desarrollador independiente mkurman bajo licencia Apache 2.0. Se trata de la continuación del checkpoint previo a la fase de decaimiento del modelo `mkurman/neuroblast-v46-150m-v41tok`, ampliando el presupuesto de entrenamiento desde los 6.500 millones de tokens vistos hasta un objetivo de 50.000 millones de tokens sobre una mezcla de datos más amplia, con una etapa final de contexto de 32.768 tokens. El entrenamiento se realiza en una única GPU NVIDIA A100 de 80 GB en Colab, documentado públicamente en la model card ("training in public").

El modelo es un transformer decoder-only de aproximadamente 150 millones de parámetros, entrenado exclusivamente con texto en inglés y orientado a generación de texto autoregresiva. No es un asistente conversacional: es un modelo base que continúa texto y sirve como punto de partida para fine-tuning posterior. Su relevancia actual radica en que documenta de forma transparente un pipeline completo de preentrenamiento de un modelo pequeño con datos abiertos (FineWeb-Edu, DCLM, FinePDFs-Edu, Dolma3, StackV2-Edu, FineMath, Gutenberg y libros anteriores a 1929), incluyendo curvas de evaluación, mezcla de datos consumida y planificación de fases de learning rate.

En el momento de la última actualización de la model card (11 de noviembre de 2026, 15:17 UTC), el entrenamiento se encontraba en el paso 120.000 de 992.274 (12,1 % del total), dentro de la etapa 1 con contexto de 2.048 tokens, con aproximadamente 7.980 millones de tokens vistos y una pérdida de entrenamiento de 2,950. Los checkpoints publicados son estados intermedios de entrenamiento (modelo, optimizador y scheduler), no un modelo finalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (según la model card; detalles de capas y dimensiones no disponibles) |
| Parametros totales | ~150M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens en etapa 1; 32.768 tokens planificados en etapa 2 (no alcanzada en la información disponible) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La model card describe un transformer decoder-only entrenado con un schedule de learning rate warmup-stable-decay (WSD). La continuación parte del checkpoint `checkpoint-90000` del primer run (etiqueta `pre-decay-step-90000`), que conserva pesos, estado del optimizador y scheduler con el learning rate aún en su pico (2e-3). El schedule mantiene ese pico hasta el paso 811.820 y después aplica un decaimiento lineal hasta 0 en el paso 992.274 (el último 20 % de los pasos de este run). El optimizador es Muon sobre matrices de pesos 2-D y AdamW para el resto de parámetros, sin weight decay.

El presupuesto total es de 50.000 millones de tokens (6.500 millones del primer run más 43.500 millones en este), aproximadamente 330 tokens por parámetro. La etapa 1 usa contexto de 2.048 tokens con 48 filas por paso (pasos 90.000–946.419, unos 41.000 millones de tokens). La etapa 2 planificada usa contexto de 32.768 con 3 filas por paso (pasos 946.419–992.274, unos 2.500 millones de tokens de documentos largos) dentro de la fase de decaimiento. La mezcla de datos en la fase `stable` es: FineWeb-Edu 36 %, DCLM 28 %, StackV2-Edu 12 %, FinePDFs-Edu 9 %, PDFs científicos 6 %, FineMath 4+ 4 %, FineMath 3-only 3 %, Gutenberg 1 % y libros anteriores a 1929 1 %. En la fase de decaimiento la mezcla cambia (FineWeb-Edu 31 %, DCLM 13 %, FinePDFs-Edu 14 %) y en la fase de 32k dominan los PDFs educativos (35 %). El primer run usó solo FineWeb-Edu con contexto de 512 tokens hasta el paso 70.424 y después 2.048. No se documenta RLHF, DPO ni ninguna fase de alineación.

## Capacidades

- Generación de texto autoregresiva en inglés: continuación de documentos, párrafos y frases.
- Modelado de lenguaje base: útil para perplejidad, scoring y experimentos de investigación.
- Capacidad incipiente de código y matemáticas por la inclusión de StackV2-Edu y FineMath en la mezcla (12 % y 7 % de la fase stable respectivamente), aunque sin evaluación publicada.
- Contexto largo planificado de hasta 32.768 tokens en la etapa 2 (no completada según la información disponible).
- No dispone de tool calling, function calling, modo thinking, visión, audio ni capacidades de agente.
- No es un modelo de chat ni de instrucciones: no hay fine-tuning supervisado ni alineación documentada.

## Casos de uso

- Investigación en preentrenamiento de modelos pequeños: el repositorio publica checkpoints intermedios con estado del optimizador y scheduler, lo que permite reproducir o reanudar experimentos de scaling y schedules WSD en una sola A100.
- Generación de texto de dominio general en inglés: continuación de artículos, descripciones o documentación técnica donde se requiera un modelo ligero y de licencia permisiva.
- Punto de partida para fine-tuning supervisado: al ser un modelo base de 150M con licencia Apache 2.0, es adecuado para adaptarlo a tareas concretas (clasificación, extracción, resumen) con presupuestos de cómputo reducidos.
- Experimentos de mezcla de datos: la model card documenta las proporciones consumidas por fuente, lo que permite estudiar el efecto de mezclas con código, matemáticas y PDFs científicos sobre la pérdida de evaluación.
- Evaluación de técnicas de contexto largo: la etapa 2 planificada con 32k tokens y documentos largos sirve para estudiar la transición de 2k a 32k en modelos pequeños.
- Docencia y formación: ejemplo completo y transparente de un pipeline de preentrenamiento con curvas de pérdida, perplejidad y bits por byte publicadas en cada punto de evaluación.
- Prototipado de pipelines de inferencia con transformers: al publicarse en safetensors y con la librería transformers, se puede integrar en pruebas de latencia y throughput en GPUs de gama baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta métricas de entrenamiento y evaluación de lenguaje:

| Paso | Tokens vistos | Pérdida eval | Bits/byte | Perplejidad |
|---:|---:|---:|---:|---:|
| 2.500 | 202M | 3,807 | - | 45,0 |
| 12.500 | 1,01B | 3,379 | - | 29,3 |
| 30.000 | 2,42B | 3,253 | - | 25,9 |
| 52.500 | 4,24B | 3,212 | - | 24,8 |
| 75.000 | 5,84B | 3,217 | 1,005 | 24,9 |
| 90.000 | 6,49B | 3,199 | 1,001 | 24,5 |
| 120.000 | 7,98B | 3,283 | 1,022 | 26,6 |

La pérdida de evaluación se mide sobre las mismas filas reservadas de FineWeb-Edu (2.048 tokens), por lo que es comparable entre ambos runs. El repunte tras el paso 90.000 se explica en la model card por el cambio de mezcla de datos (dos tercios de la nueva mezcla no son FineWeb-Edu). El modelo decaído del primer run terminó con pérdida de evaluación 2,875.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 300 MB de pesos (150M parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica cabe en cualquier GPU con 2 GB o más.
- En cuantización de 8 bits: en torno a 150 MB de pesos; en 4 bits, unos 75 MB (estimación teórica; no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también CPU para inferencia en lotes pequeños.
- Cabe holgadamente en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: transformers (librería nativa), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF (no publicados); vLLM y TGI son compatibles con transformers, aunque el modelo no está optimizado para ellos.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento se realiza en una A100 80 GB con 48 filas por paso a contexto 2.048 en la etapa 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---:|---|---|---|
| NeuroBLAST v46 150M (50B) | ~150M | 2.048 (32k planificado) | Apache 2.0 | Hugging Face, en desarrollo | Modelo base, solo inglés, entrenamiento público |
| SmolLM2-135M | 135M | 8.192 | Apache 2.0 | Hugging Face | Modelo base e instruct, multilingüe parcial, benchmarks publicados |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | Hugging Face | Base e instruct, multilingüe, benchmarks publicados |
| Pythia-160M | 160M | 2.048 | Apache 2.0 | Hugging Face | Suite de investigación con checkpoints intermedios |

La comparación se basa en características públicas de los modelos citados; no se dispone de evaluaciones cruzadas en la información proporcionada. NeuroBLAST v46 destaca por su transparencia de entrenamiento y sus checkpoints intermedios, pero carece de benchmarks estándar y de alineación, a diferencia de SmolLM2 y Qwen2.5.

## Limitaciones y advertencias

- Modelo en desarrollo: los checkpoints publicados son estados intermedios de entrenamiento (12,1 % del total de pasos según la última actualización), no un modelo finalizado; la calidad puede variar entre checkpoints.
- Modelo base sin alineación: no está entrenado para seguir instrucciones ni para conversar; puede generar contenido incoherente, repetitivo o inapropiado.
- Solo inglés: no se documenta soporte multilingüe; el rendimiento en otros idiomas será previsiblemente muy bajo.
- Riesgo de alucinación: como todo modelo de lenguaje base, puede generar afirmaciones falsas con fluidez; no debe usarse como fuente de verdad sin verificación.
- Sesgos: los datos de entrenamiento (web educativa, PDFs científicos, código, libros de dominio público) pueden contener sesgos de género, culturales y socioeconómicos; no se documentan mitigaciones.
- Contexto limitado en la práctica: la etapa 1 usa 2.048 tokens; la ventana de 32.768 está planificada pero no completada en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías; el modelo se distribuye "tal cual".
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, lo que dificulta comparar su calidad con alternativas.
- Repositorio de 17 GB: incluye checkpoints intermedios con estado del optimizador y scheduler, lo que aumenta el espacio de almacenamiento necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkurman/neuroblast-v46-150m-v41tok-50b
- Modelo base (primer run): https://huggingface.co/mkurman/neuroblast-v46-150m-v41tok
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset DCLM-Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset FinePDFs-Edu: https://huggingface.co/datasets/HuggingFaceFW/finepdfs-edu
- Dataset Dolma3 Pool: https://huggingface.co/datasets/allenai/dolma3_pool
- Dataset StackV2-Edu: https://huggingface.co/datasets/common-pile/stackv2_edu_filtered
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset Project Gutenberg filtrado: https://huggingface.co/datasets/common-pile/project_gutenberg_filtered
- Dataset libros anteriores a 1929 filtrados: https://huggingface.co/datasets/common-pile/pre_1929_books_filtered
