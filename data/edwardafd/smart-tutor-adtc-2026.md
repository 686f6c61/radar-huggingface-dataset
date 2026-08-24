# edwardafd/smart-tutor-adtc-2026

## Resumen

SMART TUTOR es un modelo de lenguaje especializado en tutoría de matemáticas y ciencias a nivel de secundaria, diseñado para funcionar completamente en local en un ordenador portátil con CPU y sin conexión a internet. Fue desarrollado por edwardafd y presentado al Africa Deep Tech Challenge 2026 (Laptop LLM Challenge) en la categoría de razonamiento matemático y científico. El modelo parte de Qwen2.5-Math-1.5B-Instruct, al que se le aplicó un fine-tuning con QLoRA para cumplir un formato de salida estricto (pasos numerados, verificación explícita y línea final "FINAL ANSWER: <respuesta>") que facilita la evaluación automática y la accesibilidad con lectores de pantalla. Posteriormente se cuantizó a GGUF Q4_K_M para su ejecución eficiente en CPU mediante llama.cpp, con un tamaño de archivo de 940 MiB y un consumo de memoria de aproximadamente 1,1 GB en inferencia.

El modelo tiene 1.543.714.304 parámetros, una ventana de contexto configurada de 2048 tokens (soporta hasta 4096) y está licenciado bajo Apache-2.0. Su propósito principal es ofrecer un tutor offline para escuelas y centros comunitarios con hardware modesto y conectividad intermitente, incluyendo soporte para usuarios con discapacidades visuales mediante integración con lectores de pantalla. La evaluación interna reporta un cumplimiento de formato del 100% y una corrección del 100% en un conjunto de validación de 30 problemas, aunque el autor advierte que el tamaño de la evaluación es limitado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Grouped-Query Attention (28 capas, 12 cabezas de consulta, 2 cabezas de clave/valor, dimensión de cabeza 128) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens configurado; 4096 soportado |
| Tipos de cuantizacion | GGUF Q4_K_M (5.08 bits por peso) |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors del modelo base disponible en Qwen/Qwen2.5-Math-1.5B-Instruct) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen2.5-Math-1.5B-Instruct, que emplea Grouped-Query Attention (GQA) con 12 cabezas de consulta y 2 cabezas de clave/valor, lo que reduce el tamaño del cache KV a 28 KB por token en lugar de los 224 KB que requeriría una configuración multi-head equivalente. El entrenamiento se realizó mediante QLoRA sobre el modelo base, con r=32, alpha=64, dropout 0.05 y módulos objetivo en todas las proyecciones (q, k, v, o, gate, up, down). Se entrenaron 36.929.536 parámetros (2.34% del total) durante 150 pasos con un batch efectivo de 16 y secuencias de 512 tokens, con tasa de aprendizaje 2e-4 y schedule cosine con 3% de warmup. La pérdida final fue de 0.392 (validación 0.437).

Los datos de entrenamiento provienen de GSM8K y Orca-Math, con 18.429 filas. El autor descartó ejemplos cuya respuesta no pudiera parsearse automáticamente, para evitar entrenar sobre objetivos ilegibles. El objetivo del fine-tuning no era mejorar la capacidad matemática (el modelo base ya alcanzaba 30/30 en la evaluación previa), sino garantizar el cumplimiento del formato de salida: pasos numerados en lenguaje natural, operaciones aritméticas explícitas, paso de verificación y línea final `FINAL ANSWER: <respuesta>`. La cuantización a GGUF Q4_K_M se realizó para permitir inferencia en CPU, con un tamaño de 940 MiB y un rendimiento medido de 14.3–14.6 tok/s en generación y 29.2 tok/s en procesamiento de prompt en un CPU Intel i7-3770 sin AVX2.

## Capacidades

- Generación de texto con razonamiento matemático paso a paso: aritmética, álgebra, geometría, probabilidad, estadística, cálculo introductorio, física y problemas de palabras cuantitativos.
- Formato de salida estructurado y parseable: pasos numerados, verificación explícita y línea final `FINAL ANSWER: <respuesta>`.
- Ejecución en CPU sin GPU ni conexión a internet, con un consumo de memoria de aproximadamente 1,1 GB.
- Compatible con la integración de lectores de pantalla y salida en texto plano, facilitando la accesibilidad para usuarios con discapacidad visual.
- No soporta tool calling, ni funciones de agente, ni visión, ni audio. Es exclusivamente texto.

## Casos de uso

- **Tutor de matemáticas offline en escuelas rurales**: el modelo se ejecuta en portátiles de gama baja (por ejemplo, 8 GB de RAM) sin conexión a internet, permitiendo que estudiantes practiquen problemas de álgebra, geometría o estadística sin depender de servicios en la nube.
- **Evaluación automática de ejercicios**: la línea `FINAL ANSWER: <respuesta>` permite a un sistema externo extraer la respuesta y compararla con la correcta, habilitando la corrección automática de exámenes o deberes.
- **Accesibilidad para usuarios con discapacidad visual**: al integrarse con lectores de pantalla (como NVDA u Orca), el modelo genera explicaciones en texto plano y una respuesta final clara, facilitando el acceso a contenido matemático que normalmente es difícil de leer en pantalla.
- **Aprendizaje autónomo en centros comunitarios**: el modelo puede desplegarse en ordenadores sin conexión, permitiendo que estudiantes repasen conceptos y resuelvan problemas a su propio ritmo, con explicaciones detalladas.
- **Asistencia a profesores en la preparación de clases**: los docentes pueden usar el modelo para generar ejemplos resueltos paso a paso, o para verificar sus propias soluciones antes de presentarlas en el aula.
- **Entrenamiento en razonamiento matemático para secundaria**: el modelo cubre un rango de temas (aritmética, álgebra, geometría, probabilidad, estadística, cálculo introductorio) y puede servir como refuerzo educativo fuera del horario escolar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones de rendimiento en hardware específico y una evaluación de formato en un conjunto pequeño:

| Métrica | Valor |
|---|---|
| Generación (tok/s) en CPU Intel i7-3770 (sin AVX2) | 14.3 – 14.6 |
| Procesamiento de prompt (tok/s) | 29.2 |
| Memoria pico (RSS) | 1104 MB |
| Cumplimiento de formato (4/4) | 100% |
| Corrección en conjunto held-out (4/4) | 100% |

Estas mediciones se realizaron con `llama-bench -p 512 -n 128 -ngl 0 -t 4` sobre un CPU Ivy Bridge de 2012, que carece de AVX2; por tanto, se consideran límites inferiores. La evaluación de formato y corrección se realizó sobre un conjunto de 30 problemas escritos a mano, aunque el autor advierte que el tamaño es insuficiente para afirmar una precisión absoluta.

## Requisitos de hardware

- **VRAM**: no requiere GPU; funciona en CPU. El consumo de memoria (RSS) es de aproximadamente 1,1 GB, por lo que cabe en un sistema con 8 GB de RAM.
- **GPU**: no necesaria, pero si se dispone de una GPU (incluso integrada) se puede acelerar la inferencia mediante llama.cpp con `-ngl` para descargar capas en GPU.
- **CPU recomendada**: cualquier CPU moderna con soporte AVX2 para aprovechar las optimizaciones de llama.cpp; el rendimiento medido en un CPU sin AVX2 (i7-3770) es de 14.3–14.6 tok/s, que ya es utilizable para tutoría interactiva.
- **Opciones de despliegue**: llama.cpp (cliente CLI), Ollama, o cualquier runtime compatible con GGUF. También se puede usar vLLM o TGI si se convierte a safetensors, aunque no es el flujo principal.
- **Latencia**: en el hardware de desarrollo, se generan aproximadamente 14.5 tokens por segundo, lo que permite respuestas de 128 tokens en menos de 9 segundos. En CPUs modernas con AVX2 se espera un rendimiento mayor.

## Comparativa con modelos similares

El modelo es un fine-tune del Qwen2.5-Math-1.5B-Instruct, por lo que su capacidad matemática es idéntica a la del base. La principal diferencia es el formato de salida y la cuantización para CPU. A continuación se compara con el modelo base y con otros modelos pequeños de matemáticas, aunque no se dispone de datos de rendimiento de estos últimos.

| Modelo | Parámetros | Contexto | Licencia | Formato de salida | Rendimiento matemático |
|---|---|---|---|---|---|
| SMART TUTOR (este modelo) | 1.5B | 2048 (4096 soportado) | Apache-2.0 | Estructurado con `FINAL ANSWER` | Igual al base (saturación en 30/30) |
| Qwen2.5-Math-1.5B-Instruct | 1.5B | 4096 | Apache-2.0 | Libre (puede emitir `\boxed{}`) | Igual (30/30) |
| Llama-3.2-1B-Instruct | 1B | 128k | Llama 3.2 License | Libre | No evaluado en este contexto |
| Qwen2.5-1.5B-Instruct | 1.5B | 32768 | Apache-2.0 | Libre | No evaluado en este contexto |

Nota: no hay datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación se basa en las especificaciones declaradas.

## Limitaciones y advertencias

- **Solo inglés**: el modelo no ha sido evaluado en otros idiomas, como kiswahili u otros idiomas africanos.
- **Alcance limitado a nivel de secundaria**: no se ha evaluado en matemáticas universitarias, pruebas simbólicas o problemas de investigación.
- **Conjunto de evaluación pequeño**: la validación de 30 problemas es suficiente para pruebas de regresión, pero no para afirmar una precisión absoluta. El modelo base ya alcanzaba 30/30, por lo que el fine-tuning no mejoró la capacidad.
- **El fine-tuning solo cambia el formato, no la capacidad**: la calidad del razonamiento es la misma que la del modelo base; cualquier error de razonamiento del base se mantiene.
- **No probado con tecnología de asistencia real**: la integración con lectores de pantalla se basa en pautas establecidas, pero no se ha realizado una sesión con NVDA, Orca u otros.
- **Impacto de la cuantización no medido**: no se ha evaluado la pérdida de calidad de Q4_K_M en este fine-tuning.
- **Riesgo de alucinaciones**: como cualquier modelo de lenguaje, puede estar seguro de una respuesta incorrecta. Las explicaciones paso a paso permiten verificación manual, pero no garantizan exactitud.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edwardafd/smart-tutor-adtc-2026
- Repositorio de código y documentación: https://github.com/afdroiddev-oss/smart-tutor-adtc-2026
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B-Instruct
- Página del Africa Deep Tech Challenge 2026: https://africadeeptech.org/challenge-2026/
- Devpost del desafío: https://adtc-2026.devpost.com/
- (Otros repositorios del desafío: https://github.com/notomodo/adtc-2026 y https://github.com/jrcity/adtc-2026)
