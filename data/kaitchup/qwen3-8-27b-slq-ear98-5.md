# kaitchup/Qwen3.8-27B-SLQ-EAR98.5

## Resumen

Qwen3.8-27B-SLQ-EAR98.5 es una versión cuantizada del modelo Qwen/Qwen3.8-27B, publicada por el divulgador técnico conocido como Kaitchup (The Kaitchup). Se trata de una compresión mediante una versión personalizada de SLQ (Statistically-Lossless Quantization), una técnica de cuantización de precisión mixta que asigna distintos anchos de bits a cada proyección del decodificador, incluyendo cabezas de atención seleccionadas, y que empaqueta el resultado para el runtime Humming integrado en vLLM.

El objetivo declarado es alcanzar una tasa de aceptación esperada (EAR, Expected Acceptance Rate) del 98,5 % respecto al modelo original en BF16, manteniendo el tamaño de los ficheros de pesos en 25,609 GB frente a los 55,563 GB del BF16 original. La métrica EAR mide la superposición entre las distribuciones de probabilidad del siguiente token del modelo de referencia y del cuantizado, renormalizadas sobre los diez tokens más probables del modelo BF16; no equivale a una precisión de benchmark ni a salidas idénticas.

La relevancia de esta ficha radica en que ofrece un punto intermedio en la curva tamaño-fidelidad: es más fiel que la FP8 oficial (97,71 % de EAR) y que el GGUF Q4_K_XL de Unsloth (97,44 %), con un tamaño de fichero menor que el BF16, aunque mayor que otras alternativas de 3 bits. El modelo base conserva la licencia Apache 2.0 y los pesos se distribuyen en formato safetensors empaquetado para Humming.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B, tag `qwen3_5`); cuantización de precisión mixta SLQ con pesos BF16 seleccionados |
| Parámetros totales | 7.978.947.312 (según safetensors del repo); el nombre comercial indica 27B, dato no verificado en la información disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (valor usado en el comando de ejemplo de vLLM; no se especifica si es el máximo del modelo base) |
| Tipos de cuantización | Precisión mixta entera (INT2–INT8 según fuentes candidatas) con pesos BF16 originales seleccionados; activaciones en BF16; pesos MTP originales en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors empaquetado para Humming (vLLM); no se ofrece GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantización del transformer Qwen/Qwen3.8-27B. La técnica SLQ, descrita en el paper arXiv:2605.02404 y con repositorio en IST-DASLab/SLQ, formula la compresión como un problema de búsqueda de precisión por capa: en lugar de aplicar un único esquema de bits a todo el modelo, selecciona el ancho de bits de cada proyección del decodificador (y de cabezas de atención concretas) combinando varias fuentes de pesos candidatos. En este release las fuentes son pesos GPTQ de INT2 a INT8 generados localmente desde el modelo base, el checkpoint kaitchup/Qwen3.8-27B-hum-high-MTP-17.7GB cuantizado con AutoRound, el checkpoint ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ y los pesos BF16 originales.

El resultado es un modelo de precisión mixta con activaciones en BF16 y pesos MTP (multi-token prediction) conservados sin cambios en BF16. El autor indica que la validación se realizó para carga de texto, generación y medición de EAR con vLLM 0.31.0, humming-kernels 0.1.16 y una RTX PRO 6000 Blackwell; la inferencia de imagen y vídeo y la decodificación especulativa no se incluyeron en esa validación, aunque los pesos y procesadores de visión originales se conservan en el repo. No se detalla en la información disponible el volumen de tokens de entrenamiento del modelo base ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional y razonamiento, heredadas del modelo base Qwen3.8-27B.
- Soporte de modo de razonamiento con parser dedicado en vLLM (`--reasoning-parser qwen3`).
- Tool calling automático mediante `--enable-auto-tool-choice` y parser `qwen3_coder`, lo que habilita flujos de agentes y razonamiento multi-paso.
- Capacidades multimodales de imagen y vídeo potencialmente presentes en los pesos originales, pero no validadas en este release y desactivadas en el ejemplo de servidor (`--limit-mm-per-prompt '{"image":0,"video":0}'`).
- Predicción multi-token (MTP) conservada en BF16, lo que permite decodificación especulativa si el runtime la soporta, aunque el autor no la validó.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de chat compatible con OpenAI: el modelo se puede desplegar con `vllm serve` y exponer un endpoint `/v1/chat/completions`, lo que permite sustituir una API propietaria por inferencia local con 262.144 tokens de contexto.
- Agentes con tool calling: gracias a los parsers `qwen3_coder` y `qwen3`, se puede integrar en orquestadores de agentes que necesiten llamadas a funciones y razonamiento encadenado sin escribir lógica de parseo propia.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite resumir, extraer entidades o responder preguntas sobre contratos, informes o bases de código extensas en una sola pasada.
- Asistencia a la programación: el modelo base está orientado a código y el parser `qwen3_coder` facilita integrarlo en asistentes de IDE o pipelines de revisión que emitan llamadas a herramientas.
- Inferencia en hardware profesional con menor huella que BF16: con 25,609 GB de pesos, cabe en GPUs de 48 GB o 80 GB dejando espacio para caché KV y buffers, lo que reduce el coste frente a servir el BF16 de 55,563 GB.
- Evaluación de técnicas de cuantización: el repo publica mapas de bits por capa y comparativas de EAR, por lo que sirve como referencia para investigadores que estudien el compromiso entre tamaño y fidelidad estadística.
- Prototipado de razonamiento con modo thinking: el parser de razonamiento de vLLM permite separar la traza de pensamiento de la respuesta final en aplicaciones de análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor proporciona únicamente la métrica EAR (Expected Acceptance Rate) frente al modelo BF16 de referencia:

| Modelo | EAR ↑ | Ficheros de pesos (GB) | Ejecución medida |
|---|---:|---:|---|
| Qwen3.8-27B original BF16 | 100,000000 % | 55,563 | Referencia BF16 |
| Qwen3.8-27B-FP8 oficial | 97,705903 % | 30,867 | Pesos y activaciones FP8 nativos |
| Qwen3.8-27B-FP8 oficial (solo pesos) | 98,101249 % | 30,867 | Pesos dequantizados, ejecución BF16 |
| GSQ 3-bit (ISTA-DASLab) | 89,425738 % | 11,828 | Pesos dequantizados, ejecución BF16 |
| Kaitchup hum-high 17,7 GB | 94,335032 % | 17,695 | Pesos dequantizados, ejecución BF16 |
| Unsloth UD-Q4_K_XL GGUF | 97,444147 % | 17,559 | Pesos GGUF remapeados a BF16, Transformers |
| SLQ EAR>98 | 98,000775 % | 23,732 | vLLM / Humming empaquetado |
| **SLQ EAR98.5 (este modelo)** | **98,502656 %** | **25,609** | vLLM / Humming empaquetado |
| SLQ EAR99 | 99,002514 % | 30,518 | vLLM / Humming empaquetado |

El autor advierte que el objetivo "statistically lossless" de SLQ se refiere a fidelidad aproximada, no a salidas numéricamente idénticas, y que no se ha establecido equivalencia estadística en tareas downstream para estos releases.

## Requisitos de hardware

- Pesos: 25,609 GB en disco (25.609.379.336 bytes); el consumo en servicio es mayor al incluir buffers del runtime y caché KV.
- VRAM estimada: no se publica una cifra exacta; con 25,6 GB de pesos, un despliegue con contexto largo requiere GPUs de 48 GB (p. ej. RTX PRO 6000, L40S) o 80 GB (A100, H100) para dejar margen a la caché KV de 262.144 tokens.
- GPU validadas: RTX PRO 6000 Blackwell (según el autor). No se confirma soporte en A100, H100 ni RTX 4090 en la información disponible.
- GPU de consumo: no se confirma que quepa en RTX 4090 (24 GB) con los pesos completos; requeriría reducir contexto o usar una variante más agresiva (por ejemplo, el release de 17,7 GB o el GGUF Q4 de Unsloth).
- Despliegue: vLLM 0.31.0 con soporte Humming (`--quantization humming`, `--dtype bfloat16`) y humming-kernels 0.1.16. No se mencionan llama.cpp, Ollama ni TGI para este formato empaquetado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EAR / fidelidad | Licencia | Formato |
|---|---|---|---|---|---|
| SLQ EAR98.5 (este) | 27B (nominal) | 262.144 | 98,50 % EAR | Apache 2.0 | safetensors Humming |
| Qwen3.8-27B-FP8 oficial | 27B (nominal) | no disponible | 97,71 % EAR | Apache 2.0 | FP8 |
| Kaitchup hum-high 17,7 GB | 27B (nominal) | no disponible | 94,34 % EAR | Apache 2.0 | AutoRound |
| Unsloth UD-Q4_K_XL GGUF | 27B (nominal) | no disponible | 97,44 % EAR | Apache 2.0 | GGUF |
| ISTA-DASLab 3Bit-GSQ | 27B (nominal) | no disponible | 89,43 % EAR | no disponible | safetensors |

Frente a la FP8 oficial, este release ofrece mayor fidelidad estadística (98,50 % vs 97,71 %) con un tamaño de fichero menor (25,609 GB vs 30,867 GB). Frente al GGUF Q4 de Unsloth, mejora la EAR (98,50 % vs 97,44 %) pero a costa de un formato menos portable y un tamaño mayor. Frente a las variantes de 3 bits, la ganancia en fidelidad es sustancial (más de 9 puntos sobre GSQ), con el correspondiente aumento de tamaño.

## Limitaciones y advertencias

- La EAR mide solapamiento de distribuciones sobre los diez tokens más probables del modelo BF16; no garantiza precisión en benchmarks ni respuestas idénticas.
- El autor declara explícitamente que no se ha establecido equivalencia estadística en tareas downstream para este release.
- La inferencia multimodal (imagen y vídeo) no fue validada; el ejemplo de servidor desactiva ambas modalidades.
- La decodificación especulativa con los pesos MTP no se validó, aunque los pesos se conservan.
- El formato empaquetado para Humming limita el despliegue a vLLM con esa extensión; no hay GGUF ni soporte documentado en llama.cpp, Ollama o TGI.
- El número de parámetros reportado por safetensors (7.978.947.312) no coincide con el "27B" del nombre comercial; conviene verificar el modelo base antes de dimensionar infraestructura.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen/Qwen3.8-27B por si imponen restricciones adicionales.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación específicas de este release.
- El autor no publica latencia ni throughput medidos; el rendimiento real dependerá de la GPU, el contexto y la versión de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR98.5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Release SLQ EAR>98: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR98
- Release SLQ EAR99: https://huggingface.co/kaitchup/Qwen3.8-27B-SLQ-EAR99
- Checkpoint hum-high MTP 17,7 GB: https://huggingface.co/kaitchup/Qwen3.8-27B-hum-high-MTP-17.7GB
- Checkpoint GSQ 3-bit: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-3Bit-GSQ
- GGUF de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Paper SLQ: https://arxiv.org/abs/2605.02404
- Repositorio SLQ: https://github.com/IST-DASLab/SLQ
- Repositorio AutoRound: https://github.com/intel/auto-round
- Newsletter del autor: https://kaitchup.substack.com/subscribe
- Apoyo al autor: https://buymeacoffee.com/kaitchup
