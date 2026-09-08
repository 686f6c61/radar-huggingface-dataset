# sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q3_K_M

## Resumen

El modelo `sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q3_K_M` es una cuantización GGUF en formato Q3_K_M del modelo base `Qwen/Qwen2.5-Coder-14B-Instruct`, desarrollada por el autor sigmanih y publicada a través del módulo Model Hub de Sigma Studio. Está pensado para ofrecer una versión ligera del modelo de 14.700 millones de parámetros, optimizada para inferencia local en GPU de consumo y para entornos de producción que requieren alta velocidad de ejecución.

El modelo base Qwen2.5-Coder está diseñado para tareas de generación, razonamiento y corrección de código, además de conversación general. Esta variante en Q3_K_M reduce el peso del modelo a 6.84 GB, lo que permite cargarlo en tarjetas gráficas con 16 GB de VRAM, manteniendo una ventana de contexto de 32.768 tokens. Es una opción relevante para desarrolladores que necesitan ejecutar un modelo de código de nivel medio-alto en máquinas con recursos limitados o en sistemas de inferencia rápida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (Transformer decoder-only) |
| Parámetros totales | 14.770.033.664 (14.7B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | Q3_K_M |
| Idiomas soportados | en, it |
| Licencia | other |
| Formato de pesos | GGUF (Q3_K_M) |
| Número de capas | 48 |
| Dimensión oculta | 5120 |
| Tamaño del fichero | 6.84 GB |
| Tamaño total del repositorio | 7.3 GB |

## Arquitectura y entrenamiento

El modelo es una cuantización en Q3_K_M de `Qwen/Qwen2.5-Coder-14B-Instruct`. La arquitectura base es Qwen2, un transformer decoder-only de 48 capas y una dimensión oculta de 5120. La cuantización reduce la precisión de los pesos para disminuir la memoria necesaria, pasando del formato de 14B completo a un fichero GGUF de 6.84 GB, lo que permite su ejecución en hardware con VRAM limitada.

En la información disponible no se detallan los datos de entrenamiento, número de tokens ni técnicas de alineamiento específicas utilizadas en la generación de esta cuantización. El modelo original Qwen2.5-Coder-14B-Instruct está orientado a tareas de código y razonamiento, pero no se aportan cifras sobre la composición del dataset ni sobre procesos de RLHF o DPO en esta ficha.

## Capacidades

- Generación de código en Python: los benchmarks de la muestra obtienen un 86% en HumanEval y un 100% en MBPP.
- Razonamiento matemático: 100% en GSM8K y 89% en MATH en la muestra evaluada.
- Razonamiento general y de sentido común: 89% en ARC-Challenge y 56% en HellaSwag en la muestra evaluada.
- Conocimiento general y razonamiento avanzado: 43% en MMLU y 33% en MMLU-Pro en la muestra evaluada.
- Factualidad y anti-alucinación: 78% en TruthfulQA en la muestra evaluada.
- Conversación bilingüe en inglés e italiano.
- El autor recomienda su uso para tareas de codificación de alta velocidad, asistentes cotidianos y loops de razonamiento para agentes autónomos.
- No se documenta explícitamente soporte de tool calling o function calling en la información proporcionada.

## Casos de uso

- Autocompletado y generación de código en entornos de desarrollo integrado: puede integrarse en editores como VS Code o JetBrains para sugerir funciones, clases y bloques completos; su velocidad de decodificación de 52,9 tokens/s en RTX 5070 Ti permite una experiencia interactiva fluida.
- Asistente de depuración: el modelo puede analizar mensajes de error, trazas de pila y código problemático para proponer hipótesis y correcciones. Su capacidad de razonamiento multi-paso facilita la identificación de fallos lógicos.
- Tutor de programación bilingüe: con soporte para inglés e italiano, puede explicar conceptos de programación, resolver dudas y generar ejercicios prácticos en plataformas educativas o internas de empresas.
- Revisión y refactorización de código legacy: gracias a la ventana de 32.768 tokens, puede procesar archivos de código extensos, resumir su funcionalidad, detectar deudas técnicas y sugerir refactorizaciones.
- Generación de pruebas unitarias: el modelo es capaz de crear casos de prueba a partir de descripciones o de código existente; los resultados de MBPP (100% en la muestra) indican una buena capacidad para generar pruebas que superan assertions.
- Motor de razonamiento para agentes autónomos: puede usarse como cerebro de un agente que planifica y ejecuta tareas de automatización en varios pasos, aprovechando el contexto largo y la capacidad de seguir instrucciones complejas sin necesidad de herramientas externas.
- Generación de documentación técnica: puede producir comentarios, docstrings, READMEs y documentación de API de forma automática, acelerando el mantenimiento de repositorios.
- Análisis de scripts y logs: útil en tareas de mantenimiento y operaciones para interpretar salidas de logs, detectar patrones y generar explicaciones en lenguaje natural.

## Benchmarks y rendimiento

Los siguientes datos corresponden a una evaluación realizada por el autor sobre una muestra parcial de los datasets, no sobre la suite completa. Por tanto, no son comparables con ejecuciones de referencia a gran escala.

| Dataset / Suite | Dominio | Correcto / Total | Precisión (%) |
|---|---|---|---|
| ARC-Challenge | Razonamiento escolar y científico | 8 / 9 | 89 |
| BIG-Bench Hard | Lógica compleja y simbólica | 5 / 7 | 71 |
| GPQA | Razonamiento académico de posgrado | 3 / 9 | 33 |
| GSM8K | Matemáticas de varios pasos | 9 / 9 | 100 |
| HellaSwag | Razonamiento de sentido común | 5 / 9 | 56 |
| HumanEval | Generación de código Python (pass@1) | 6 / 7 | 86 |
| MATH | Matemáticas de competición | 8 / 9 | 89 |
| MBPP | Programación Python con tests | 9 / 9 | 100 |
| MMLU | Conocimiento general | 6 / 14 | 43 |
| MMLU-Pro | Razonamiento avanzado | 3 / 9 | 33 |
| TruthfulQA | Factualidad y anti-alucinación | 7 / 9 | 78 |
| Total | Todos los datasets evaluados | 69 / 100 | 69 |

Protocolo de evaluación: code_execution, continuation_logprob, cot_generation, letter_logprob. Temperatura 0.0, seed 42. Reproducibilidad: `SHA256-9FB5093BE8146218`.

Velocidad medida en una NVIDIA GeForce RTX 5070 Ti con 15.9 GB de VRAM:

- Decodificación en un solo stream: 52,9 tokens/s.
- Procesamiento de prompt: 23 tokens/s.
- Throughput agregado durante la evaluación: 51,5 tokens/s (varias solicitudes simultáneas).

## Requisitos de hardware

- Tamaño del fichero GGUF: 6.84 GB.
- VRAM recomendada para los pesos: 6.84 GB, más la memoria necesaria para las claves de atención y activaciones. Para contextos cortos, una GPU con al menos 10-12 GB puede ser suficiente; para aprovechar la ventana completa de 32.768 tokens, se recomiendan 16 GB o más.
- GPU verificada: NVIDIA GeForce RTX 5070 Ti con 15.9 GB de VRAM.
- Compatibilidad con GPU de consumo: es viable en tarjetas de 16 GB como RTX 4080, RTX 4090 o RTX 5070 Ti; en GPUs de 12 GB como RTX 3060 funcionará con contextos reducidos o con menor número de solicitudes concurrentes.
- Opciones de despliegue: llama.cpp (`llama-cli`) con la opción `-ngl 99` para la aceleración completa por GPU, y Sigma Studio. Cualquier servidor compatible con formato GGUF (por ejemplo, Ollama o LM Studio) puede cargar el fichero.
- Latencia y throughput: 52,9 tokens/s de decodificación en un solo stream y 23 tokens/s de procesamiento de prompt en la máquina de referencia. Estos valores dependen de la memoria disponible, la cuantización, la longitud del contexto y el driver, por lo que no se deben extrapolar a otros entornos sin mediciones adicionales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Formato | Licencia |
|---|---|---|---|---|---|
| Qwen2.5-Coder-14B-Instruct (base) | 14.7B | 32.768 | Sin cuantizar (BF16) | safetensors | Apache 2.0 (según modelo base) |
| sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q3_K_M (este modelo) | 14.7B | 32.768 | Q3_K_M | GGUF | other |
| Qwen/Qwen2.5-Coder-14B-Instruct-GGUF | 14.7B | 32.768 | Q4_K_M, Q5_K_M, Q8_0, etc. | GGUF | Apache 2.0 (según modelo base) |

No se dispone de resultados de benchmarks para los modelos comparables en la información proporcionada. La comparativa se basa en características técnicas: el modelo base sin cuantizar ofrece mayor precisión a cambio de un mayor consumo de memoria, mientras que las variantes GGUF con cuantizaciones más altas (Q4_K_M, Q5_K_M, Q8_0) mantienen mejor calidad que el Q3_K_M, pero ocupan más espacio en disco y VRAM.

## Limitaciones y advertencias

- Los benchmarks presentados se han medido sobre una muestra parcial de los datasets y no reflejan el rendimiento real sobre la suite completa. No deben utilizarse para comparar con resultados de evaluaciones integrales.
- La cuantización Q3_K_M reduce la precisión del modelo respecto a los pesos originales. Para tareas críticas, como razonamiento matemático avanzado o generación de código de alta complejidad, se recomiendan cuantizaciones superiores (Q5_K_M, Q8_0).
- La licencia del repositorio se indica como "other". Aunque el modelo base se distribuye bajo Apache 2.0, este fichero cuantizado puede tener términos adicionales o restrictivos. Es necesario revisar la licencia antes de utilizarlo en entornos comerciales.
- Solo se documentan los idiomas inglés e italiano en esta cuantización. No se confirma el soporte para otros idiomas, aunque el modelo base puede tener capacidades multilingües adicionales.
- No se documentan sesgos específicos en la información proporcionada, pero el modelo puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Existe riesgo de alucinación. En TruthfulQA la muestra obtiene un 78%, lo que indica que una parte de las respuestas puede ser inexacta. Se recomienda validar las salidas en contextos de producción.
- La ventana de contexto es de 32.768 tokens. En tareas que requieran procesar repositorios completos o documentos muy extensos, el contenido puede truncarse.
- No se menciona soporte de tool calling o function calling en la documentación disponible. Aunque el modelo base Qwen2.5-Coder-Instruct puede ser compatible con estas características, no se debe asumir sin verificar.
- Las velocidades de inferencia reportadas se han medido en una única máquina con RTX 5070 Ti y no deben extrapolarse a otros equipos sin pruebas específicas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sigmanih/Qwen-Qwen2.5-Coder-14B-Instruct-GGUF-Q3_K_M
- Sigma Studio (GitHub): https://github.com/Sigmanih/SigmaStudio
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B
- Cuantizaciones oficiales del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct-GGUF
