# mh131105/qwen2.5-3b-text-to-sql-lora-exp-f

## Resumen

El modelo `mh131105/qwen2.5-3b-text-to-sql-lora-exp-f` es un adaptador LoRA/PEFT sobre el modelo base Qwen2.5-3B-Instruct, especializado en la tarea de text-to-SQL. Lo desarrolla el autor identificado como mh131105 en el marco de un trabajo de la asignatura de Procesamiento de Lenguaje Natural de la UFAM (ICC220 / PPGINF528, 2026/01), y su propósito es investigar cuánto mejora el fine-tuning sobre el conjunto Spider la generación de consultas SQL y cómo afecta a una medida auxiliar de capacidad general. Se trata, por tanto, de un artefacto de investigación y no de un modelo de producción.

El adaptador se publica sin fusionar con el modelo base: requiere cargar `Qwen/Qwen2.5-3B-Instruct` para funcionar. Los 288 tensores LoRA suman 7.372.800 parámetros y se entrenaron sobre 7.000 pares del split de entrenamiento de Spider en inglés, con un contexto máximo de 2.048 tokens y dos épocas sobre una NVIDIA A100-SXM4-40GB.

Su relevancia es doble: por un lado, documenta de forma reproducible el efecto del fine-tuning LoRA en una tarea estructurada concreta, con un incremento de 8,61 puntos porcentuales en la métrica de ejecución local del Spider dev respecto a la base; por otro, mantiene la puntuación de la base en una muestra reducida de MMLU, lo que el autor interpreta como un compromiso razonable entre especialización y capacidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5-3B-Instruct) |
| Parametros totales | 7.372.800 parámetros del adaptador (288 tensores LoRA); el modelo base no se incluye |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud máxima de entrenamiento del adaptador); contexto del base Qwen2.5-3B-Instruct no indicado en la información proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se guarda en float32; el entrenamiento se realizó en BF16 sin cuantización) |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-research (license_name: qwen-research, license: other) |
| Formato de pesos | safetensors (adapter_model.safetensors), librería PEFT |

## Arquitectura y entrenamiento

El adaptador aplica LoRA sin cuantización sobre los módulos de atención `q_proj`, `k_proj`, `v_proj` y `o_proj` del transformer Qwen2.5-3B-Instruct. La configuración de LoRA es rank 16, alpha 32 y dropout 0,05. El entrenamiento usó learning rate 2e-4 durante 2 épocas, microbatch de 2 con acumulación de 8 (batch efectivo 16), longitud máxima de 2.048 tokens, optimizador `adamw_torch_fused`, warmup de 0,03, weight decay 0, precisión BF16 y semilla 42. La pérdida se calcula únicamente sobre la completion SQL, con el token EOS `<|im_end|>`. La train loss final fue de 0,168494 y el tiempo de entrenamiento de 1.656,37 segundos.

Los datos provienen de 7.000 pares del split de entrenamiento de Spider, obtenidos de los archivos en inglés de la fuente `dreamerdeo/multispider`; el preparado registró 166 esquemas y 1.034 ejemplos de dev. El formato de entrada es texto plano con esquema y pregunta, sin chat template ni ejemplos few-shot. El entorno registrado incluye Python 3.12.13, PyTorch 2.11.0+cu128, Transformers 4.57.6, PEFT 0.19.1, TRL 0.29.1, Datasets 4.8.5, DeepEval 3.9.9 y bitsandbytes 0.49.2 (instalado pero no usado, al no tratarse de QLoRA). Los pesos publicados corresponden al checkpoint final 876 (dos épocas) y son idénticos a los del artefacto `exp_f-20260612T032941Z-3-001.zip`; los archivos de tokenizer provienen del checkpoint 438 del mismo entrenamiento porque el directorio final estaba vacío, y el pipeline no altera el vocabulario. No se registra SHA inmutable del modelo base ni de los datasets, por lo que no se garantiza reproducción bit a bit.

## Capacidades

- Generación de consultas SQL a partir de un esquema de base de datos y una pregunta en lenguaje natural, en inglés.
- Especialización en el dominio del conjunto Spider (consultas SELECT/WITH sobre esquemas relacionales).
- Generación de texto general heredada del modelo base Qwen2.5-3B-Instruct, aunque no evaluada de forma específica más allá de la muestra de MMLU.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico en la información proporcionada.
- No se documenta modo de razonamiento explícito (thinking mode), visión ni audio.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma declarada.

## Casos de uso

- Evaluación académica de fine-tuning LoRA: el adaptador sirve como referencia reproducible para comparar el efecto de la especialización en text-to-SQL frente al modelo base, con métricas de ejecución documentadas.
- Generación de SQL en asistentes de análisis de datos internos: dado un esquema y una pregunta en inglés, el modelo produce una consulta ejecutable, útil en herramientas de BI para usuarios no técnicos.
- Prototipado de pipelines text-to-SQL: al ser un adaptador ligero de 7,3 millones de parámetros, permite iterar sobre el modelo base sin duplicar los pesos completos.
- Investigación sobre olvido catastrófico: el par de métricas Spider/MMLU permite estudiar si la especialización degrada la capacidad general del modelo base.
- Docencia y reproducción de experimentos: el repositorio incluye informe, código, configuración y hashes, lo que facilita replicar el entrenamiento en entornos con una sola GPU.
- Generación de consultas en entornos de solo lectura: el protocolo de evaluación ejecuta las predicciones contra SQLite en modo lectura con timeout de cinco segundos, un patrón reutilizable para validar SQL generado antes de exponerlo a producción.

## Benchmarks y rendimiento

Los resultados proceden del protocolo local del autor, no de la Test Suite Accuracy oficial del Spider. La métrica de Spider dev se calcula por ejecución sobre una instancia del banco, con generación greedy (`do_sample=false`), semilla 42, hasta 256 tokens y batch de evaluación 16; se aceptan SELECT/WITH tras filtro y se compara el resultado de tuplas. La muestra de MMLU consta de 150 preguntas (50 de `college_computer_science`, 50 de `philosophy` y 50 de `econometrics`) y no equivale al benchmark MMLU completo.

| Modelo | Spider aciertos | Spider EX local | Delta Spider | MMLU 150 |
|---|---:|---:|---:|---:|
| Base Qwen2.5-3B-Instruct | 616/1034 | 59,57% | — | 86/150 (57,33%) |
| Exp F (este adaptador) | 705/1034 | 68,18% | +8,61 p.p. | 86/150 (57,33%) |
| Exp G (mayor Spider) | 711/1034 | 68,76% | +9,19 p.p. | 85/150 (56,67%) |

El autor señala que la puntuación MMLU igual a la base incluye intercambios de preguntas acertadas, por lo que no demuestra la preservación de todos los aciertos previos.

## Requisitos de hardware

- El adaptador en sí ocupa un tamaño de repositorio de 0,0 GB (7.372.800 parámetros en float32), por lo que el requisito real lo determina el modelo base Qwen2.5-3B-Instruct.
- El entrenamiento se realizó en una NVIDIA A100-SXM4-40GB en Colab; no se documentan requisitos de VRAM para inferencia.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el autor solo documenta la A100-SXM4-40GB usada para el entrenamiento.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante `peft` y `transformers` (versiones mínimas indicadas: torch 2.11.0, transformers 4.57.6, peft 0.19.1, accelerate 1.13.0, huggingface_hub 0.36.2, safetensors 0.7.0). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Spider dev (EX local) | MMLU 150 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Exp F (este adaptador) | 7,37 M en adaptador + base 3B | 2.048 tokens de entrenamiento | 68,18% | 86/150 | qwen-research | Hugging Face (adaptador PEFT) |
| Base Qwen2.5-3B-Instruct | 3B | no indicado en la información | 59,57% | 86/150 | qwen-research (según la model card) | Hugging Face |
| Exp G (mismo proyecto) | adaptador LoRA sobre el mismo base | no indicado | 68,76% | 85/150 | qwen-research | No publicado en este repositorio (solo se referencia como comparación) |

No se dispone de datos de otros modelos text-to-SQL comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación: no se ha validado para uso en producción y no se documentan pruebas de robustez fuera del conjunto Spider.
- La métrica de Spider es un protocolo local por ejecución, no la Test Suite Accuracy oficial, por lo que los resultados no son directamente comparables con la literatura que usa el protocolo estándar.
- La muestra de MMLU de 150 preguntas no es el benchmark completo; cada pregunta equivale a 0,67 p.p. y la igualdad con la base oculta intercambios de aciertos.
- El modelo está entrenado y evaluado únicamente en inglés; no se documenta comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación en la generación de SQL: el propio protocolo de evaluación penaliza con cero las consultas que fallan al extraerse o ejecutarse, lo que indica que el modelo puede producir SQL no válido.
- La licencia `qwen-research` impone restricciones; debe revisarse el archivo LICENSE antes de cualquier uso comercial, y el autor no aclara condiciones adicionales.
- No hay SHA inmutable del modelo base ni de los datasets, y los archivos de tokenizer provienen de un checkpoint distinto (438) al de los pesos (876), aunque del mismo entrenamiento y sin cambios de vocabulario.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5-3B-Instruct hereda los del modelo base, no evaluados en esta ficha.
- El adaptador debe cargarse junto con `Qwen/Qwen2.5-3B-Instruct`; no es un modelo autónomo y no se ha fusionado con la base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mh131105/qwen2.5-3b-text-to-sql-lora-exp-f
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset utilizado: https://huggingface.co/datasets/dreamerdeo/multispider
- Informe final: https://github.com/mh131105/Fine-tuning-de-LLM-para-Text-to-SQL/blob/pipeline/reports/relatorio_final.pdf
- Código y reproducción: https://github.com/mh131105/Fine-tuning-de-LLM-para-Text-to-SQL
- Auditoría técnica: https://github.com/mh131105/Fine-tuning-de-LLM-para-Text-to-SQL/blob/pipeline/docs/revisao-tecnica.md
