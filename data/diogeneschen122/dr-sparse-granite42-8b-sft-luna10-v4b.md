# DiogenesChen122/Dr.Sparse-Granite42-8B-SFT-luna10-v4b

## Resumen

Dr.Sparse-Granite42-8B-SFT-luna10-v4b es un ajuste fino supervisado (SFT) del modelo denso ibm-granite/granite-4.2-8b, publicado por el usuario DiogenesChen122 en Hugging Face. El objetivo del ajuste es muy concreto: generar kernels CUDA de SpGEMM (multiplicación de matrices dispersas por matrices dispersas) para matrices del conjunto SuiteSparse, con la meta de comparar la aceleración obtenida frente a cuSPARSE. No es, por tanto, un modelo de propósito general, sino un experimento vertical sobre generación de código de bajo nivel para álgebra lineal dispersa en GPU.

El entrenamiento se hizo con LoRA (r=64, alpha=128) sobre el subconjunto v4b del dataset KinGeorge/Dr.Sparse-SFT-luna10-v4b, con 3.963 ejemplos de entrenamiento y 71 de validación, una sola época (495 pasos), longitud de secuencia de 65.536 tokens y una pérdida de validación final de 0,0299. Los adaptadores se fusionaron realmente en los pesos de la base, de modo que el repositorio contiene un modelo denso estándar de 8.791.592.960 parámetros (17,6 GB en safetensors de precisión completa) listo para servirse directamente con vLLM. El modelo base Granite 4.2 8B es un transformer decoder-only de IBM con modo de pensamiento conmutable, 128K de contexto y licencia Apache 2.0.

Su relevancia es acotada pero interesante como caso de estudio: documenta con honestidad un problema típico de los SFT especializados en código, en el que el modelo aprende a razonar en lenguaje natural con notación LaTeX antes de emitir el código y sin vallas de código, lo que rompe la compilación con nvcc. En la evaluación OTF-81, 171 de 200 salidas muestreadas presentaron ese formato mixto, y la comparación de capacidad real contra cuSPARSE queda pendiente de repetir con una lógica de extracción corregida. Con cero descargas y cero likes en el momento de redactar esta ficha, se trata de un artefacto de investigación sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (derivada de Granite 4.2 8B, según el modelo base) |
| Parámetros totales | 8.791.592.960 (dato real de safetensors) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens en el entrenamiento SFT; el modelo base Granite 4.2 8B se anuncia con 128K de contexto |
| Tipos de cuantización | No disponible para este fine-tuning; el repositorio solo contiene safetensors. La familia base ofrece variantes FP8, FP4 y GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (LoRA ya fusionada en los pesos de la base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base ibm-granite/granite-4.2-8b: un transformer decoder-only denso de aproximadamente 8B parámetros, con modo de razonamiento encadenado (chain-of-thought) activable y desactivable, y soporte de tool calling aumentado con razonamiento. El fine-tuning no modifica la topología: se aplicó LoRA con rango 64 y alpha 128 sobre ese modelo y después se fusionaron los adaptadores en los pesos base, de forma que el resultado es un checkpoint denso convencional que puede cargarse en cualquier runtime compatible con Granite. El repositorio ocupa 18,0 GB, coherente con pesos en precisión completa (bf16/fp16) más los ficheros auxiliares.

El entrenamiento se realizó sobre el subconjunto v4b del dataset KinGeorge/Dr.Sparse-SFT-luna10-v4b (3.963 ejemplos de entrenamiento y 71 de validación), con tasa de aprendizaje 1e-4, scheduler coseno, 5% de warmup, una única época (495 pasos) y longitud de secuencia de 65.536 tokens. Se ejecutó en 4 GPU NVIDIA B200 durante 7 horas y 6 minutos, y alcanzó una pérdida de validación de 0,0299. No se documentan fases de RLHF, DPO ni RL posterior, ni innovaciones de inferencia como decodificación especulativa o atención lineal. Tampoco se detalla la composición lingüística del dataset ni el filtrado aplicado, más allá de que la tarea es la generación de kernels SpGEMM en CUDA para matrices de SuiteSparse.

## Capacidades

- Generación de código CUDA para kernels de SpGEMM sobre matrices dispersas de SuiteSparse, presumiblemente en formatos como CSR, COO y similares.
- Capacidad de razonamiento previo a la generación de código: el modelo tiende a explicar la estrategia con lenguaje natural y notación matemática antes de escribir el kernel.
- Herencia de las capacidades del base Granite 4.2 8B: razonamiento con modo de pensamiento conmutable, tool calling aumentado con razonamiento y contexto de hasta 128K tokens, aunque no se ha verificado que estas capacidades sobrevivan intactas al SFT especializado.
- Soporte de tool calling y de flujos agénticos: procede del modelo base de IBM, que lo documenta explícitamente; no hay evaluación específica en este fine-tuning.
- Capacidades multilingües: no disponibles como dato declarado. La model card original está redactada en chino y el dataset de entrenamiento no describe su composición idiomática.
- Generación de código con estructura de tres funciones completas: en las muestras analizadas el modelo define las tres funciones requeridas por la tarea, aunque el formato de salida rompa la compilación.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Generación de kernels SpGEMM para autotuning interno: el modelo propone variantes de kernel CUDA a partir de la descripción de una matriz dispersa, y un script de extracción de código las recorta, compila con nvcc y mide frente a cuSPARSE. Es el caso de uso para el que fue entrenado; requiere un extractor robusto que descarte la prosa previa al bloque de código.
- Asistente de investigación en bibliotecas de álgebra lineal dispersa: para explorar estrategias de bloques, reordenaciones y esquemas de particionado en código generado, tomando las salidas como borradores que un ingeniero revisa y reescribe.
- Generación de alternativas de kernel para formatos específicos: dado un formato de almacenamiento disperso concreto (CSR, BSR, COO), pedir al modelo implementaciones base que luego se especializan a mano, con 8B de parámetros y licencia Apache 2.0, lo que permite integrarlo en un repositorio corporativo sin fricción legal.
- Destilación de datos de entrenamiento: usar el modelo como generador de pares (descripción de matriz, kernel CUDA) para construir datasets de mayor tamaño destinados a modelos más pequeños o a posteriores rondas de RL, dado que el pipeline de evaluación del autor ya sigue este patrón.
- Automatización de revisiones de rendimiento: integrarlo en un ciclo generar-compilar-benchmark que se ejecute durante la noche sobre un lote de matrices y produzca un informe de qué kernels compilan y cuáles se acercan al rendimiento de cuSPARSE.
- Docencia y experimentación sobre SFT de código: sirve como ejemplo reproducible de cómo un ajuste LoRA barato (495 pasos, 7 horas en 4 B200) altera el formato de salida de un modelo base y degrada la usabilidad del código generado, un fallo habitual que conviene saber diagnosticar.
- Prototipado de kernel DSL: emplear el modelo para traducir descripciones matemáticas de una operación dispersa a código CUDA de referencia antes de reescribirlo en un lenguaje específico de dominio con mejor soporte de herramientas.

Conviene subrayar que, salvo el primer caso, el resto son aplicaciones plausibles derivadas de la naturaleza del ajuste, no capacidades verificadas en la documentación disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor únicamente reporta la pérdida de validación del entrenamiento y los resultados parciales de una evaluación propia sobre kernels SpGEMM con matrices de SuiteSparse (OTF-81), además del análisis de formato de 200 muestras de salida.

| Métrica | Valor |
|---|---|
| Pérdida de validación (SFT, Luna-10 v4b) | 0,0299 |
| Muestras de salida analizadas | 200 |
| Salidas con prosa y código mezclados, sin vallas de código | 171 |
| Modelo base (granite-4.2-8b) en OTF-81, matrices evaluadas | 79 |
| Modelo base en OTF-81, kernels correctos | 8 |
| Modelo base en OTF-81, matrices donde supera a cuSPARSE | 0 |
| Modelo SFT en OTF-81 | No evaluable: nvcc falla desde la primera línea por caracteres extendidos usados como identificadores, pese a que las tres funciones requeridas están definidas en el texto generado |

El propio autor indica que la comparación real de capacidad del modelo SFT debe repetirse una vez corregida la lógica de extracción de código, por lo que a día de hoy no existe una cifra fiable de aceleración frente a cuSPARSE para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: en bf16/fp16 unos 17,6 GB (el repositorio ocupa 18,0 GB); en cuantización de 8 bits alrededor de 8,8 GB; en 4 bits aproximadamente 4,5-5 GB. Estas cifras son estimaciones a partir del número de parámetros y no incluyen la caché KV.
- Caché KV: no disponible de forma explícita. A 65.536 tokens de contexto y con la arquitectura del base Granite 4.2 8B, la caché KV puede añadir varios gigabytes adicionales según el número de capas y de cabezas, por lo que los requisitos reales superan holgadamente el tamaño de los pesos en despliegues con contexto largo. Se recomienda medir en el hardware objetivo.
- GPU recomendadas: A100 40 GB o 80 GB y H100 80 GB para servir el modelo en bf16 con contexto largo; 4× B200 fue el hardware empleado en el entrenamiento, no un requisito de inferencia.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en bf16 para contextos cortos o moderados, y en tarjetas de 8-12 GB si se convierte a 4 bits. Para bf16 con contexto cercano a los 65K tokens harían falta dos GPU de 24 GB o una única GPU de 48 GB.
- Opciones de despliegue: el autor indica que los pesos pueden servirse directamente con vLLM, ya que el LoRA está fusionado. También son viables TGI y, previa conversión a GGUF por parte del usuario (el repositorio no incluye ficheros GGUF), llama.cpp u Ollama.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia de generación para este checkpoint.
- Coste de entrenamiento como referencia: 495 pasos, secuencia de 65.536 tokens, 4× B200, 7 horas y 6 minutos.

## Comparativa con modelos similares

No se conocen en la información disponible otros modelos abiertos especializados en generación de kernels SpGEMM en CUDA, por lo que la comparación se establece con el modelo base y con el resto de la familia Granite 4.2.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento declarado |
|---|---|---|---|---|---|
| Dr.Sparse-Granite42-8B-SFT-luna10-v4b | 8,79B (denso) | 65.536 tokens en entrenamiento; base con 128K | Apache 2.0 | Hugging Face, 0 descargas y 0 likes | Pérdida de validación 0,0299; sin benchmark fiable por fallo de extracción |
| ibm-granite/granite-4.2-8b | Aproximadamente 8B (denso) | 128K | Apache 2.0 | Hugging Face, con variantes FP8, FP4 y GGUF | 47,67 en SWE-bench Verified; en OTF-81, 8 de 79 kernels correctos y 0 superan a cuSPARSE |
| Granite 4.2 3B | 3B (denso) | No disponible | Apache 2.0 | Hugging Face | No disponible |
| Granite 4.2 30B | 30B (denso) | No disponible | Apache 2.0 | Hugging Face | No disponible |

Los tres modelos de la familia comparten el modo de razonamiento conmutable y el tool calling aumentado con razonamiento descritos por IBM. El valor diferencial de este checkpoint no es el rendimiento, sino su especialización en una tarea concreta y la documentación de sus fallos.

## Limitaciones y advertencias

- Formato de salida roto para compilación: el modelo explica primero la estrategia con lenguaje natural y LaTeX y después escribe el código sin vallas de código. En nvcc esto provoca errores desde la primera línea por caracteres extendidos empleados como identificadores. En la muestra analizada, 171 de 200 salidas presentaron este patrón, aunque las tres funciones requeridas estuvieran definidas.
- Sin evidencia de mejora real sobre la base: el modelo base resolvió correctamente 8 de 79 matrices en OTF-81 y no superó a cuSPARSE en ninguna. La comparación del modelo SFT no pudo completarse, por lo que no hay ninguna cifra que demuestre que el ajuste mejora la tarea objetivo.
- Riesgo de alucinación en código: como cualquier generador de código, puede producir kernels sintácticamente plausibles pero funcionalmente incorrectos, con supuestos erróneos sobre el layout de la matriz dispersa o sobre la API de CUDA. Toda salida debe compilarse y validarse numéricamente antes de usarse.
- Degradación potencial de capacidades generales: no se documenta ninguna evaluación de las capacidades generales del base tras el SFT. Un ajuste de una época sobre 3.963 ejemplos especializados puede reducir el rendimiento en conversación, razonamiento general o tool calling.
- Idiomas: no se declara ninguna lista de idiomas soportados. La model card está redactada en chino y no se especifica en qué idioma responde el modelo ni la composición lingüística del dataset de entrenamiento.
- Longitud de contexto: el entrenamiento usó 65.536 tokens, la mitad de los 128K que anuncia el modelo base. El comportamiento más allá de esa longitud no está validado para este checkpoint.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de licencia y el fichero de cambios. No se declaran restricciones adicionales ni cláusulas de uso aceptable específicas en la información disponible.
- Sin validación comunitaria: cero descargas y cero likes, sin issues ni discusiones públicas. No hay terceros que hayan reproducido el entrenamiento ni verificado los resultados.
- Dependencia del pipeline de extracción: cualquier uso en producción exige desarrollar y mantener un extractor que separe la prosa del código, algo que el autor señala como requisito pendiente y que no se distribuye con el modelo.
- Fecha de creación del repositorio: 1 de octubre de 2026, con última actualización el mismo día, lo que sugiere un artefacto congelado sin mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DiogenesChen122/Dr.Sparse-Granite42-8B-SFT-luna10-v4b
- Dataset de evaluación del modelo (OTF-81, B200, SpGEMM): https://huggingface.co/datasets/DiogenesChen122/Dr.Sparse-Granite42-8B-eval-b200-otf81-spgemm
- Dataset de entrenamiento (Luna-10 v4b): https://huggingface.co/datasets/KinGeorge/Dr.Sparse-SFT-luna10-v4b
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Dataset de evaluación de otra variante del proyecto (GPT-5.6 Luna, SpGEMM sobre 562 matrices): https://huggingface.co/datasets/DiogenesChen122/Dr.Sparse-GPT56Luna-eval-b200-rl562-spgemm
- Documentación de IBM sobre la familia Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Resumen de las características de Granite 4.2 8B: https://ai-tldr.dev/models/granite-4-2-8b/
- Artículo que recoge el post de IBM sobre la construcción de Granite 4.2 (blog de Hugging Face, 25 de agosto de 2026): https://www.square1ai.com/newsroom/2026-08-25-ibm-details-how-granite-42-was-built-dense-3b-8b-and-30b-models-with-agentic-rl
