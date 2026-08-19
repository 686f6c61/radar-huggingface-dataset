# Luis23333/Qwen3.8-27B-SSMFIX-UD-Q3_K_XL-GGUF

## Resumen

El modelo `Qwen3.8-27B-SSMFIX-UD-Q3_K_XL-GGUF` es una conversión comunitaria en formato GGUF del modelo Qwen3.8-27B, un modelo denso de 27.000 millones de parámetros desarrollado por Alibaba Qwen. Esta variante concreta, publicada por el usuario Luis23333, aplica un "SSMFIX" documentado por la comunidad que corrige un comportamiento anómalo en los tensores `ssm_conv1d.weight` de ocho capas, mediante un reescalado por capa con factores alfa específicos. El resultado es un artefacto de inferencia de texto puro, sin componente de visión, pensado para ejecutarse con llama.cpp y runtimes compatibles con GGUF.

La relevancia de este modelo radica en que ofrece una versión cuantizada de alta calidad de un modelo de 27B con una ventana de contexto heredada de 262.144 tokens, lo que permite ejecutarlo en hardware de consumo con una huella de memoria de aproximadamente 12,52 GiB. La cuantización es mixta y personalizada, con una importance matrix, y preserva los tensores corregidos en F32 para no degradar la reparación. Es un artefacto experimental, no un lanzamiento oficial de Qwen, y debe tratarse como tal.

El archivo GGUF se deriva del modelo BF16 reparado `redashes/Qwen3.8-27B-BF16-SSMFIX`, que a su vez proviene del oficial `Qwen/Qwen3.8-27B`. La licencia es Apache-2.0 y los idiomas declarados son inglés y chino. No incluye proyector de visión (`mmproj`), por lo que su uso se limita a generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con capas SSM/conv1d (Qwen3.8) |
| Parametros totales | 27B (denso) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (heredada del upstream; capacidad practica limitada por hardware) |
| Tipos de cuantizacion | IQ3_S, Q3_K, Q5_K, IQ4_XS, F32 (mezcla personalizada UD-Q3_K_XL) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF V3 |

## Arquitectura y entrenamiento

La arquitectura base es la de Qwen3.8-27B, un modelo denso de 27.000 millones de parámetros con capas que combinan atención tradicional y componentes SSM con `conv1d`. El "SSMFIX" aplicado por la comunidad reescala ocho tensores `ssm_conv1d.weight` con factores alfa que van desde 0.48136 hasta 0.65327, corrigiendo un comportamiento anómalo detectado en la discusión #76 del repositorio oficial. En la conversión a GGUF, estos tensores se mantienen en F32 para no cuantizar la reparación.

El entrenamiento original del modelo upstream incluye una fase de razonamiento con modos "thinking" y "non-thinking", y el modelo base soporta visión, aunque este artefacto GGUF solo contiene el módulo de lenguaje. La cuantización se realizó con llama.cpp build `9222 (9a532ae4b)` usando una importance matrix denominada `imatrix_unsloth.gguf_file`. La receta exacta de cuantización está documentada en el archivo `quantization_recipe.txt` del repositorio.

## Capacidades

- Generación de texto en inglés y chino, con soporte de razonamiento paso a paso (modo thinking) activable mediante `--reasoning on` en llama.cpp.
- Conversación multi-turno con plantilla Jinja, compatible con `llama-cli` y `llama-server`.
- Soporte de contexto largo de hasta 262.144 tokens en metadatos, aunque la capacidad real depende de la VRAM disponible.
- Sin capacidades de visión en este artefacto concreto (no incluye `mmproj`).
- No se documenta soporte explícito de tool calling o function calling en esta conversión, aunque el modelo upstream Qwen3.8 sí lo tiene; la disponibilidad depende del runtime.
- Compatible con runtimes GGUF como llama.cpp, Ollama, LM Studio y otros que soporten la arquitectura Qwen3.8/Qwen3.5.

## Casos de uso

- Asistente de programación local: el modelo puede generar y revisar código en inglés o chino, aprovechando su modo de razonamiento para tareas de depuración. Con una GPU de 16 GiB y contexto reducido (por ejemplo 16.384 tokens), es viable para uso interactivo en un IDE.
- Chat conversacional privado: al ejecutarse en local, permite mantener conversaciones multi-turno sin enviar datos a servidores externos, útil para entornos con requisitos de confidencialidad.
- Análisis de documentos largos: su contexto de 262.144 tokens permite procesar documentos extensos (manuales, contratos, artículos) en una sola pasada, siempre que el hardware pueda asignar la memoria necesaria.
- Generación de contenido bilingüe: redacción de textos en inglés y chino, con control de estilo mediante los parámetros de temperatura y top-p recomendados por Qwen.
- Razonamiento matemático y lógico: el modelo upstream muestra un GSM8K strict de 0.9644 en la fuente BF16, lo que lo hace adecuado para problemas de matemáticas y lógica en entornos educativos o de investigación.
- Prototipado de agentes de texto: aunque esta conversión no documenta tool calling explícito, puede integrarse en pipelines de texto con frameworks como LangChain o llamacpp-agent para tareas de extracción y resumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este artefacto GGUF. Los datos siguientes pertenecen al modelo BF16 fuente (`redashes/Qwen3.8-27B-BF16-SSMFIX`) y se incluyen solo como contexto de procedencia, no como medida de calidad del GGUF.

| Metrica | Valor (BF16 source v2) |
|---|---:|
| MT-Bench average | 7.47 |
| IFEval prompt strict | 0.5194 |
| IFEval instruction strict | 0.6343 |
| GSM8K strict | 0.9644 |
| CMMLU | 0.6996 |
| TruthfulQA MC1 / MC2 | 0.3758 / 0.5513 |
| TruthfulQA generation ROUGE-1 / ROUGE-2 / ROUGE-L / BLEU | 0.345 / 0.246 / 0.345 / 0.256 |

El smoke test local del GGUF, realizado con llama.cpp build `9222` en una NVIDIA RTX 5070 Ti con contexto 16.384 y seis prompts, reportó resultados exitosos, aunque el detalle completo no está disponible en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa 12.807,91 MiB (aproximadamente 12,52 GiB). Con contexto de 16.384 tokens, una GPU de 16 GiB es suficiente. Para contexto completo de 262.144 tokens se necesitaría mucha más memoria, probablemente más de 48 GiB.
- GPU recomendadas: NVIDIA RTX 5070 Ti (usada en el smoke test), RTX 4090, A100, H100. También compatible con GPUs AMD Radeon y procesadores Ryzen AI Max según la documentación de AMD.
- Cabe en GPUs de consumo: sí, en tarjetas con 16 GiB o más, siempre que se reduzca el contexto.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, y cualquier runtime GGUF compatible con la arquitectura Qwen3.8.
- Latencia y throughput: no se han publicado mediciones específicas para esta cuantización. En una RTX 5070 Ti, con contexto moderado, se espera un rendimiento aceptable para uso interactivo, pero los valores exactos no están disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (oficial) | 27B | 262.144 | Apache-2.0 | Transformers, BF16 | Modelo base con visión y lenguaje |
| redashes/Qwen3.8-27B-BF16-SSMFIX | 27B | 262.144 | Apache-2.0 | BF16 | Versión reparada con SSMFIX |
| Luis23333/Qwen3.8-27B-SSMFIX-UD-Q3_K_XL-GGUF | 27B | 262.144 (heredado) | Apache-2.0 | GGUF | Cuantización mixta, solo texto |

La comparativa se limita a la cadena de derivación del propio modelo, ya que no se dispone de datos de modelos comparables de otros fabricantes con el mismo tamaño y contexto en la información proporcionada. Frente al BF16 original, esta versión GGUF reduce el tamaño de 54 GB a 12,5 GB, lo que permite su ejecución en hardware de consumo, a costa de una pérdida de precisión inherente a la cuantización.

## Limitaciones y advertencias

- Artefacto experimental: no es un lanzamiento oficial de Qwen. La reparación SSMFIX es una verificación comunitaria y puede no estar validada por el equipo de Qwen.
- Sin visión: este archivo GGUF no incluye el proyector de visión, por lo que no puede procesar imágenes ni vídeo, aunque el modelo upstream sí puede.
- Pérdida de calidad por cuantización: la mezcla IQ3_S/IQ4_XS puede degradar el rendimiento en tareas sensibles a la precisión. Los benchmarks del BF16 no son aplicables directamente al GGUF.
- Contexto largo limitado por hardware: aunque los metadatos indican 262.144 tokens, en una GPU de 16 GiB solo es viable un contexto de 16.384 o menos. Intentar contextos mayores puede provocar errores de memoria.
- Idiomas limitados: solo se declaran inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación y sesgos: como cualquier modelo de lenguaje, puede generar contenido falso o sesgado. No se han documentado evaluaciones específicas de sesgo para esta versión cuantizada.
- Dependencia de la versión de llama.cpp: se requiere una build reciente con soporte de la arquitectura Qwen3.8/Qwen3.5. Versiones antiguas pueden no cargar el modelo correctamente.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Luis23333/Qwen3.8-27B-SSMFIX-UD-Q3_K_XL-GGUF
- Modelo BF16 fuente: https://huggingface.co/redashes/Qwen3.8-27B-BF16-SSMFIX
- Modelo upstream oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Discusión sobre el SSMFIX: https://huggingface.co/Qwen/Qwen3.8-27B/discussions/76
- Guía de ejecución local en yottalabs.ai: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guía de ejecución local en lu-labs.ai: https://lu-labs.ai/blog/how-to-run-qwen-3-8-27b-locally
- Soporte de AMD para Qwen3.8: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
