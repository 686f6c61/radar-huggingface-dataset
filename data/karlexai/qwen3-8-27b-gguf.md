# KarLexAI/Qwen3.8-27B-GGUF

## Resumen

KarLexAI/Qwen3.8-27B-GGUF es una colección de cuantizaciones GGUF del modelo denso Qwen3.8-27B de Qwen (Alibaba), publicada por KarLex AI. El repositorio no es un modelo nuevo: es una conversión post-entrenamiento a formato llama.cpp del checkpoint original en BF16, sin fine-tuning, manteniendo arquitectura, tokenizer y plantilla de chat intactos. Su propuesta de valor es la preservación de la capacidad de razonamiento en cuantizaciones extremas: según la model card, el archivo IQ1_S de 6,19 GB resuelve un 53,8 % de AIME 2025+2026 frente al 1,3 % de la cuantización equivalente de Unsloth, gracias a una mezcla de tipos de tensor estándar más cuidadosa.

El modelo base es un transformer híbrido de 26.895.998.464 parámetros (unos 26,9 mil millones) con 48 capas de atención lineal Gated-DeltaNet y 16 capas de atención completa, capacidad nativa visión-lenguaje y una ventana de contexto de 262.144 tokens. Incorpora modo de razonamiento (thinking) activado por defecto y una cabeza de predicción multi-token (MTP) que, según el autor de esta conversión, no se incluye en los archivos GGUF.

La relevancia práctica es inmediata para quien quiera ejecutar un razonador de ~27B en hardware de consumo: el rango de archivos va de 6,19 GB a 14,25 GB, lo que permite desplegarlo en GPUs de 8-16 GB de VRAM con llama.cpp estándar y sin parches ni forks. La licencia Apache-2.0 del modelo base se hereda, lo que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 48 capas de atención lineal Gated-DeltaNet + 16 capas de atención completa; multimodal (visión-lenguaje) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | IQ1_S, IQ2_XXS, IQ2_XS, IQ3_XXS, IQ4_XS (mezcla de tipos de tensor estándar de llama.cpp) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original en safetensors/BF16 (~54 GB) |
| Tamano del repo | 46,6 GB |
| Tamano por archivo | 6,19 GB (IQ1_S), 7,21 GB (IQ2_XXS), 8,00 GB (IQ2_XS), 10,93 GB (IQ3_XXS), 14,25 GB (IQ4_XS) |
| Runtime | llama.cpp estándar (sin fork ni parches) |

## Arquitectura y entrenamiento

El checkpoint base Qwen3.8-27B es un transformer denso con una arquitectura híbrida poco habitual: 48 capas usan atención lineal Gated-DeltaNet (coste lineal en longitud de secuencia) y 16 capas mantienen atención completa, lo que permite sostener un contexto de 262K tokens con un coste de memoria y cómputo contenido. Es nativamente visión-lenguaje, con torre visual integrada, e incluye una cabeza de predicción multi-token (MTP) para decodificación especulativa en el checkpoint original; esta cabeza no está incluida en los GGUF de KarLexAI.

Sobre el entrenamiento del modelo base no se aporta información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO): no disponible. Lo que sí está documentado es el proceso de esta conversión: cuantización post-entrenamiento sin fine-tuning, con mezclas de tipos de tensor estándar de llama.cpp elegidas para maximizar la retención de calidad en cada clase de tamaño. El autor reporta que el archivo IQ1_S conserva razonamiento funcional (53,8 % en AIME) donde otras cuantizaciones de 1 bit colapsan en bucles y agotamiento de tokens. Los ajustes de muestreo recomendados por Qwen (temperatura 1,0, top-k 20, top-p 0,95) están embebidos en los metadatos del archivo.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262K tokens.
- Razonamiento explícito en modo thinking, activado por defecto; el modelo produce cadenas de razonamiento antes de la respuesta final.
- Razonamiento matemático y resolución de problemas de competición (resultados reportados en AIME 2025+2026 y MATH-500).
- Seguimiento de instrucciones verificable (IFEval reportado en la model card).
- Capacidades de visión-lenguaje nativas en el modelo base; la model card de esta conversión no detalla el estado de la torre visual tras la cuantización (no disponible).
- Capacidad de predicción multi-token (MTP) presente en el modelo base, pero no incluida en los archivos GGUF de este repositorio.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: implícito en el modo thinking, sin evaluación específica publicada en esta ficha.
- Multilingüismo: no disponible (no se listan idiomas en el repositorio).

## Casos de uso

- Razonamiento matemático en local con hardware modesto: el archivo IQ1_S de 6,19 GB permite resolver problemas tipo AIME en una GPU de 8 GB; útil para prototipos de tutores matemáticos o validación de pipelines de evaluación sin depender de APIs.
- Asistente de análisis con documentos largos: con 262K tokens de contexto, se puede cargar un repositorio de código, un expediente o varios papers y hacer preguntas cruzadas manteniendo el hilo completo en una sola ventana.
- Despliegue en estaciones de trabajo sin GPU dedicada de gama alta: los archivos IQ2_XXS (7,21 GB) e IQ2_XS (8,00 GB) caben en GPUs consumer de 8-12 GB y ofrecen un salto grande de calidad respecto al de 1 bit, adecuados para entornos de desarrollo y demos internas.
- Servicio de chat autoalojado con llama-server: el par de comandos documentado (`llama-server -ngl 99 -c 32768 --jinja`) levanta una API compatible con OpenAI en localhost, útil para integrar el modelo en aplicaciones existentes sin reescribir clientes.
- Evaluación comparativa de cuantizaciones: investigadores que estudien la degradación de razonamiento bajo compresión pueden usar la tabla de la model card y BENCHMARKS.md como referencia reproducible con hashes de archivo.
- Generación de código asistida en local: el modelo base es un LLM generalista con modo thinking; para tareas de programación en producción conviene validar previamente la calidad del archivo elegido, ya que la model card no publica resultados específicos de código.
- Procesamiento multimodal en local (si la torre visual funciona tras la cuantización): descripción de imágenes, extracción de información de capturas o diagramas; requiere verificación empírica porque el repositorio no documenta el estado de la visión.

## Benchmarks y rendimiento

Resultados publicados en la model card, obtenidos con un único harness sobre llama.cpp estándar, en modo thinking y con el sampler de Qwen:

| Archivo | Tamano | AIME 2025+2026 | IFEval | MATH-500 |
|---|---|---|---|---|
| IQ1_S | 6,19 GB | 53,8 | 50,5 | 87,8 |
| IQ2_XXS | 7,21 GB | 82,7 | 88,5 | 98,4 |
| IQ2_XS | 8,00 GB | 89,4 | 93,5 | 97,8 |
| IQ3_XXS | 10,93 GB | 94,2 | 94,3 | 99,0 |
| IQ4_XS | 14,25 GB | 95,2 | 94,3 | 98,8 |
| BF16 (referencia) | ~54 GB | 96,0 | 93,4 | 99,2 |

Comparativa directa publicada (diferencias pareadas en puntos, ± 1 error estándar):

| Tamano | KLX | Rival | AIME 2025+2026 | IFEval | MATH-500 |
|---|---|---|---|---|---|
| 6,2 GB | IQ1_S | Unsloth UD-IQ1_S (6,19 GB) | +52,5 ± 4,9 | +28,8 ± 2,6 | +55,2 ± 2,5 |
| 7,2 GB | IQ2_XXS | Unsloth UD-IQ2_XXS (7,27 GB) | +8,75 ± 2,6 | +8,3 ± 1,9 | +1,8 ± 0,9 |
| 8 GB | IQ2_XS | ISTA GSQ-RCO IQ2_XS (8,42 GB) | +0,2 ± 1,5 | -1,1 ± 1,1 | +0,2 ± 0,8 |
| 8 GB | IQ2_XS | Unsloth UD-IQ2_S (8,37 GB) | +1,0 ± 1,4 | +2,8 ± 1,3 | -0,8 ± 0,8 |
| 10,9 GB | IQ3_XXS | Unsloth UD-IQ3_XXS (10,93 GB) | +1,0 ± 1,2 | -0,4 ± 0,8 | +0,2 ± 0,4 |
| 14,3 GB | IQ4_XS | Unsloth UD-IQ4_XS (14,25 GB) | -0,6 ± 0,9 | -1,1 ± 0,8 | +0,2 ± 0,5 |

A partir de 10,9 GB las diferencias entre fabricantes quedan dentro del error de medida. No se publican resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo más el contexto y los buffers de cómputo. IQ1_S (6,19 GB) corre en 8 GB; IQ2_XXS (7,21 GB) e IQ2_XS (8,00 GB) en 8-12 GB; IQ3_XXS (10,93 GB) en 12-16 GB; IQ4_XS (14,25 GB) en 16-24 GB. Con contexto largo (32K-262K) la caché KV crece y conviene reservar margen adicional.
- GPUs recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 (24 GB) para IQ4_XS con contexto amplio; A100/H100 solo necesarias para servir muchas peticiones concurrentes o el BF16 completo.
- Cabe en GPU consumer: sí, desde una RTX 3060 de 12 GB o incluso GPUs de 8 GB con los archivos de 1-2 bits; también en Apple Silicon con Metal.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli) es el runtime de referencia documentado; Ollama es viable importando el GGUF; vLLM y TGI no están documentados para este repositorio (vLLM requiere formatos distintos de GGUF o soporte parcial de cuantizaciones GGUF).
- Latencia y throughput: no disponibles. El modelo base incluye MTP para decodificación especulativa, pero esta cabeza no está en los GGUF, por lo que no se puede aprovechar esa aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| KarLexAI Qwen3.8-27B-GGUF | ~26,9 B | 262K | GGUF 6,19-14,25 GB | Apache-2.0 | Foco en retener razonamiento a 1-2 bits |
| Frosty40 Qwen3.8-27B-GGUF | ~26,9 B | 262K | GGUF Q6_K + Q8_0 | Apache-2.0 (heredada) | Incluye visión; validado en Intel Arc Pro B70 vía SYCL |
| Unsloth UD-Qwen3.8-27B | ~26,9 B | 262K | GGUF dinámico (UD-IQ1_S a IQ4_XS) | Apache-2.0 | Referencia de comparación del autor; peor rendimiento a 1-2 bits según sus datos |
| ISTA GSQ-RCO Qwen3.8-27B IQ2_XS | ~26,9 B | 262K | GGUF 8,42 GB | Apache-2.0 | Rendimiento prácticamente idéntico a KLX IQ2_XS |

La comparativa se limita a otras cuantizaciones del mismo modelo base, que es el universo relevante para este repositorio. Frente a modelos de tamaño similar de otros fabricantes no hay datos en la información disponible.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: hereda todos los sesgos y limitaciones del Qwen3.8-27B base, sobre los que no se aporta documentación en este repositorio.
- Riesgo de alucinación: el modo thinking por defecto aumenta la longitud de las respuestas y el consumo de tokens; en cuantizaciones de 1-2 bits el riesgo de bucles y de razonamiento truncado es real, aunque el autor reporta mitigarlo parcialmente.
- La cuantización a 1 bit (IQ1_S) degrada el seguimiento de instrucciones (IFEval 50,5 frente a 93,4 del BF16) mucho más que las matemáticas; no es adecuada para tareas de formato estricto o salidas estructuradas.
- La torre visual del modelo base no está documentada en esta conversión; asumir visión funcional sin verificarla es arriesgado.
- La cabeza MTP no está incluida, por lo que se pierde la decodificación especulativa del modelo original y el throughput será menor que en el checkpoint completo.
- Idiomas soportados no declarados: no se puede garantizar calidad en castellano sin evaluación propia.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar el archivo NOTICE del repositorio y las condiciones del modelo base de Qwen.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados publicados; los benchmarks provienen del propio autor.
- Los resultados de benchmarks se obtuvieron con un único harness y sampler concretos; no son directamente comparables con evaluaciones de terceros que usen otra configuración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KarLexAI/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Benchmarks detallados y hashes: https://huggingface.co/KarLexAI/Qwen3.8-27B-GGUF/blob/main/BENCHMARKS.md
- Aviso legal del repositorio: https://huggingface.co/KarLexAI/Qwen3.8-27B-GGUF/blob/main/NOTICE
- Autor: https://karlex.ai
- Cuantización alternativa con visión (Frosty40): https://huggingface.co/Frosty40/Qwen3.8-27B-GGUF/blob/main/README.md
- Guía de despliegue en hardware consumer: https://aiindigo.com/tutorials/getting-started-with-qwen3-8-27b-gguf-run-a-27b-model-locally
