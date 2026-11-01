# jonpark0/TinyLlama-1.1B-Chat-v1.0-isa-lm

## Resumen

TinyLlama-1.1B-Chat-v1.0-isa-lm es un conjunto de conversiones cuantizadas del modelo TinyLlama/TinyLlama-1.1B-Chat-v1.0, publicadas por el desarrollador jonpark0 para su uso con isa-lm, un runtime en C11 sin dependencias externas que ejecuta modelos de lenguaje en CPU sin GPU. El repositorio no contiene un modelo nuevo, sino pesos del TinyLlama original convertidos a formatos propietarios `.mlb` en precisión INT4 (Q4_0 y una variante mixta Q4_0/Q8_0) e INT8 (Q8_0), acompañados de un tokenizador en formato `.mlt`.

El interés de esta publicación es fundamentalmente de despliegue: demuestra cómo ejecutar un transformer de 1.100 millones de parámetros en hardware x86-64 (desde SSE2 hasta AVX-512 VNNI) y ARM (desde ARMv7 NEON hasta i8mm y SVE) sin CUDA ni librerías de terceros. El autor reporta métricas concretas de perplejidad en wikitext-2 y de velocidad de prefill y decode medidas en un AMD EPYC 7763 con 4 hilos y compilación AVX2.

TinyLlama es un transformer decoder-only de 1,1B parámetros entrenado por el proyecto TinyLlama sobre 3 billones de tokens, con una ventana de contexto de 2048 posiciones nativas (aquí extendida a 4096 en la conversión) y licencia Apache 2.0. Esta conversión hereda esas características y añade la posibilidad de inferencia puramente en CPU con huellas de memoria de entre 590 MiB y 1115 MiB según la cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de TinyLlama-1.1B-Chat-v1.0); runtime isa-lm en C11 |
| Parametros totales | 1.100 millones (1,1B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 posiciones (configurada en la conversión con `--max-seq 4096`); el modelo base tiene 2048 nativas |
| Tipos de cuantizacion | INT4 Q4_0 (4,5 bits/peso), INT4 Q4_0 mixta con `v,o,down` en Q8_0, INT8 Q8_0 (8,5 bits/peso); escalas f16 por bloque de 32 pesos |
| Idiomas soportados | No disponible (el modelo base está entrenado mayoritariamente en inglés, pero la model card no lo declara) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | `.mlb` (formato propietario de isa-lm) y tokenizador `.mlt`; no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

La arquitectura es la del TinyLlama-1.1B-Chat-v1.0 original: un transformer decoder-only denso de 1,1B parámetros con atención multi-cabeza estándar, normalización RMSNorm, activación SwiGLU y RoPE. El modelo base fue entrenado por el proyecto TinyLlama sobre aproximadamente 3 billones de tokens (principalmente inglés, con la trilogía de datasets de SlimPajama y una mezcla de instrucciones para la variante Chat), seguido de un ajuste fino supervisado y optimización de preferencias para la versión conversacional. Esta publicación no reentrena ni modifica los pesos más allá de la cuantización.

La innovación técnica de este repositorio no está en el modelo sino en el proceso de conversión: `tools/convert.py` toma los safetensors del modelo original y genera matrices cuantizadas con una escala f16 cada 32 pesos, en formatos Q4_0 y Q8_0. La variante mixta mantiene las proyecciones `v`, `o` y `down` en Q8_0 para reducir la pérdida de calidad, mientras que el resto de matrices quedan en Q4_0. El runtime isa-lm selecciona en tiempo de ejecución el kernel más rápido disponible según las extensiones SIMD del procesador (SSE2, AVX2, AVX-512 VNNI, NEON, i8mm, SVE) y soporta el modo chat con plantilla `zephyr`.

## Capacidades

- Generación de texto conversacional multi-turno mediante la plantilla de chat Zephyr (`--chat zephyr`).
- Razonamiento básico y respuesta a preguntas factuales simples (el ejemplo de la model card responde correctamente a la capital de Francia).
- Generación de código y texto técnico dentro de las capacidades del TinyLlama base, limitadas por su tamaño de 1,1B.
- Ejecución íntegra en CPU sin GPU, con soporte para x86-64 (SSE2 a AVX-512 VNNI), AArch64, ARMv7 y Windows x86-64.
- Inferencia con cuantización INT4 e INT8 seleccionable según el equilibrio deseado entre memoria y calidad.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Despliegue en dispositivos edge sin GPU: el archivo Q4_0 de 590 MiB cabe en una Raspberry Pi o en un mini-PC ARM y permite generar texto con isa-lm sin dependencias externas, lo que simplifica el empaquetado en firmware o appliances.
- Prototipado rápido en CI: al ser un binario C11 sin dependencias, se puede integrar en pipelines de integración continua para pruebas de generación de texto con tiempos de arranque mínimos y sin necesidad de drivers CUDA.
- Servicio de chat de bajo coste en CPU: con 58,4 tok/s de decode en un EPYC 7763 de 4 hilos, un solo servidor puede atender varias instancias concurrentes para asistentes de texto con contexto de 4096 tokens.
- Evaluación de cuantizaciones: el repositorio ofrece tres variantes (Q4_0, Q4_0 mixta y Q8_0) con perplejidades medidas (10,56, 10,37 y 10,31), lo que permite comparar el compromiso calidad/memoria en un mismo hardware.
- Educación y experimentación: sirve para estudiar el funcionamiento interno de la inferencia de transformers cuantizados en CPU, ya que el runtime es código C legible y el proceso de conversión está documentado con comandos reproducibles.
- Generación de texto offline en entornos air-gapped: al no requerir conexión ni frameworks pesados, se puede desplegar en sistemas aislados para tareas de resumen o redacción asistida.
- Benchmarking de kernels SIMD: las métricas de prefill y decode por arquitectura permiten comparar el rendimiento de SSE2, AVX2, AVX-512, NEON, i8mm y SVE en un mismo modelo.

## Benchmarks y rendimiento

Métricas reportadas por el autor para los tres archivos, medidas en un GitHub runner con AMD EPYC 7763 (4 hilos) y build AVX2 de isa-lm. Perplejidad sobre wikitext-2 test, 4 chunks de 512 tokens; velocidad con `ml_bench -n 128` (128 tokens de prompt y 128 decodificados).

| Archivo | Pesos | Tamano | Perplejidad (wikitext-2) | Prefill (tok/s) | Decode (tok/s) |
|---|---|---|---|---|---|
| Q4_0 | INT4 en todas las matrices | 590 MiB | 10,56 | 169 | 58,4 |
| Q4_0-mixed | INT4 con `v,o,down` en Q8_0 | 761 MiB | 10,37 | 140 | 46,4 |
| Q8_0 | INT8 en todas las matrices | 1115 MiB | 10,31 | 108 | 33,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU. La memoria RAM necesaria ronda los 590 MiB (Q4_0), 761 MiB (Q4_0 mixta) o 1115 MiB (Q8_0) para los pesos, más overhead del runtime y de la caché KV para 4096 posiciones.
- CPU recomendadas: cualquier x86-64 con SSE2 o superior; se obtiene mejor rendimiento con AVX2 y AVX-512 VNNI. En ARM, desde ARMv7 NEON hasta AArch64 con i8mm o SVE.
- Cabe en hardware consumer: sí, en cualquier PC, mini-PC o SBC con al menos 1-2 GB de RAM libre; no requiere GPU.
- Opciones de despliegue: únicamente el runtime isa-lm (versión 0.5.0 o superior), con binarios para Linux x86-64, AArch64, ARMv7 y Windows x86-64. No hay soporte para vLLM, llama.cpp, Ollama ni TGI con estos archivos `.mlb`.
- Latencia y throughput: 58,4 tok/s de decode y 169 tok/s de prefill con Q4_0 en un EPYC 7763 de 4 hilos; el rendimiento escala con el número de hilos y con las extensiones SIMD disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| TinyLlama-1.1B-Chat-v1.0-isa-lm (este) | 1,1B | 4096 | `.mlb` / isa-lm (CPU) | Apache 2.0 | Cuantizado INT4/INT8, sin GPU, sin dependencias |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2048 | safetensors / transformers, llama.cpp | Apache 2.0 | Modelo original en FP16/BF16; ecosistema amplio (GGUF, Ollama, vLLM) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32768 | safetensors, GGUF / transformers, llama.cpp, vLLM | Apache 2.0 | Más parámetros, contexto mucho mayor y mejor multilingüismo; requiere runtime estándar |
| SmolLM2-1.7B-Instruct | 1,7B | 8192 | safetensors, GGUF / transformers, llama.cpp | Apache 2.0 | Alternativa moderna de tamaño similar con mejor rendimiento reportado en benchmarks |

La comparación directa de rendimiento en benchmarks estándar no está disponible en la información proporcionada; las diferencias principales frente a las alternativas son el formato propietario y la orientación exclusiva a CPU de este repositorio.

## Limitaciones y advertencias

- El modelo base TinyLlama-1.1B tiene capacidad limitada de razonamiento, matemáticas y código; no es adecuado para tareas que requieran precisión factual alta sin verificación.
- Riesgo de alucinación inherente a un modelo de 1,1B entrenado principalmente en inglés; las respuestas pueden ser plausibles pero incorrectas.
- El soporte multilingüe es débil y no está declarado en la model card; se espera un rendimiento notablemente inferior en castellano que en inglés.
- El formato `.mlb` es propietario de isa-lm y no es compatible con llama.cpp, Ollama, vLLM, TGI ni transformers; migrar a otro runtime requiere reconvertir desde los safetensors originales.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las limitaciones y sesgos del modelo base, incluidos los derivados de sus datos de entrenamiento.
- La ventana de 4096 posiciones se configuró en la conversión, pero el modelo base fue entrenado con 2048; el rendimiento más allá de 2048 tokens puede degradarse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de las métricas reportadas.
- El proyecto isa-lm es joven (versión 0.5.0 en el momento de la publicación) y su ecosistema, documentación y soporte son limitados en comparación con llama.cpp.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jonpark0/TinyLlama-1.1B-Chat-v1.0-isa-lm
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Repositorio isa-lm en GitHub: https://github.com/JonPark0/isa-lm
- Releases de isa-lm: https://github.com/JonPark0/isa-lm/releases
- Guía de usuario de isa-lm (formatos Q8, Q4 y mixto): https://github.com/JonPark0/isa-lm/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/isa-lm/blob/main/docs/benchmarks.md
- Commit de conversión: https://github.com/JonPark0/isa-lm/commit/622b7f41f392f8a2ef64837b641e62ba09cf1e4d
