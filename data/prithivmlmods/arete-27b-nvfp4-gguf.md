# prithivMLmods/Arete-27B-NVFP4-GGUF

## Resumen

Arete-27B-NVFP4-GGUF es la cuantización en formato GGUF con precisión NVFP4 (FP4 de 4 bits nativo de NVIDIA) del modelo NousResearch/Arete-27B, publicada por el usuario prithivMLmods. Arete-27B es un ajuste fino supervisado (SFT) de Qwen3.8-27B realizado por Nous Research con el objetivo explícito de modificar el comportamiento del modelo en temas políticamente sensibles, reforzando lo que la model card denomina "valores occidentales" frente a los rechazos, evasivas y respuestas con encuadre del Partido Comunista Chino que, según Nous, producía el modelo base.

El modelo conserva la arquitectura multimodal del Qwen3.8-27B original (pipeline image-text-to-text, con codificador visual congelado durante el entrenamiento) y cuenta con 26.895.999.266 parámetros totales. El ajuste se realizó sobre aproximadamente 20.000 prompts generados en siete categorías temáticas, con 1.202 pasos, dos épocas y unos 52,8 millones de tokens a contexto de 64k, sin RL ni optimización de preferencias.

La relevancia de esta publicación concreta es doble: por un lado, distribuye un modelo de 27B en un único archivo de 20,2 GB que aprovecha los Tensor Cores FP4 de las GPU NVIDIA Blackwell (RTX PRO 6000, serie RTX 50, B200, B300); por otro, lo hace bajo licencia Apache 2.0, lo que facilita su uso comercial. El repositorio incluye además el proyector multimodal `mmproj` de 931 MB necesario para las capacidades de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.8-27B; codificador visual congelado en el ajuste |
| Parametros totales | 26.895.999.266 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 64k tokens durante el entrenamiento; la prueba de rendimiento se ejecutó a 16.384 tokens |
| Tipos de cuantizacion | NVFP4 (4 bits, formato NVIDIA); archivo GGUF único de 20,2 GB |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Arete-27B-NVFP4.gguf` + `Arete-27B.mmproj.gguf`) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal con torre visual y modelo de lenguaje. Nous Research aplicó un ajuste fino supervisado sobre todos los pesos del modelo de lenguaje, manteniendo congelado el codificador de visión. No hubo RL ni optimización de preferencias (DPO o similar). El entrenamiento usó aproximadamente 20.000 prompts generados, repartidos en siete categorías: libertad de expresión, ideología estatal, Estado frente a mercado libre, educación, privacidad de datos y vigilancia, democracia y política medioambiental. El profesor utilizado para generar las respuestas fue Inkling, un modelo abierto elegido para evitar problemas de términos de uso asociados a la destilación de modelos propietarios.

El ajuste se ejecutó durante dos épocas (1.202 pasos, ~52,8M tokens) con contexto de 64k. La model card indica explícitamente que no se emplea decodificación especulativa (MTP — Speculative Decoding: No). La cuantización NVFP4 la realizó prithivMLmods con llama.cpp, y el resultado se orienta a la aceleración por hardware FP4 de las GPU Blackwell (SM120, GB202, B200, B300). El repositorio incluye el proyector multimodal separado, requisito habitual en los GGUF multimodales de llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y resolución de problemas matemáticos y lógicos: las pruebas publicadas incluyen listas enlazadas, problemas de cinemática, llenado de depósitos, combinatoria y edades.
- Generación de código: la prueba 1 del autor consiste en insertar un nodo al final de una lista enlazada simple en C.
- Comprensión de imágenes (image-text-to-text) mediante el archivo `mmproj`; el pipeline declarado es image-text-to-text.
- Modo conversacional (`conversational`) y compatibilidad con endpoints de text-generation-inference.
- Comportamiento ajustado en temas políticos sensibles: reducción de respuestas con propaganda según la evaluación del autor.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes o modo thinking explícito.

## Casos de uso

- Asistente conversacional autoalojado en inglés: el modelo puede desplegarse con llama.cpp en una única GPU Blackwell y mantener conversaciones multi-turno con contexto de hasta 64k tokens, suficiente para documentos largos o historiales extensos.
- Análisis de documentos con imágenes: gracias al proyector multimodal, puede procesar capturas, diagramas o páginas escaneadas junto a texto, útil en tareas de extracción y resumen de documentación técnica.
- Evaluación de sesgos y encuadres políticos: investigadores pueden comparar las respuestas de Arete-27B frente a Qwen3.8-27B en las siete categorías del ajuste para estudiar cómo el SFT modifica el comportamiento en temas sensibles.
- Generación de código en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp, el código y los prompts no salen de la infraestructura; adecuado para prototipado de algoritmos y estructuras de datos.
- Resolución de problemas matemáticos paso a paso: el modelo ha sido probado con problemas de álgebra y cinemática, por lo que sirve como tutora o generadora de explicaciones en inglés.
- Inferencia de alto rendimiento en servidores Blackwell: con 65,22 tokens/s de generación y 319,51 tokens/s de procesamiento de prompt medidos en una RTX PRO 6000, encaja en pipelines de generación masiva por lotes donde el throughput importa.
- Despliegue en estaciones de trabajo con RTX 50-series: el formato NVFP4 permite ejecutar un modelo de 27B en GPU de consumo de gama alta con aceleración FP4 nativa.

## Benchmarks y rendimiento

Resultados publicados por Nous Research en su propia evaluación Propaganda_Eval (803 prompts, juez Grok 4.7):

| Metrica | Qwen3.8-27B (base) | Arete-27B | Inkling (profesor) |
|---|---|---|---|
| Fact score (sobre 5) | 2,32 | 2,98 | 3,96 |
| Respuestas con propaganda | 22% | 0,9% | 0,3% |
| Fact score en libertad de expresión | 0,89 | 2,44 | no disponible |
| Propaganda en libertad de expresión | 60% | 1% | no disponible |

Capacidad general reportada por el autor:

| Benchmark | Qwen3.8-27B | Arete-27B |
|---|---|---|
| Hermes Bench (interno) | 65,60% | 65,77% |
| Terminal-Bench-2.1 | 70% | 67% |

Rendimiento de inferencia medido por el cuantizador (RTX PRO 6000 Blackwell Server Edition, 96 GB VRAM, llama-cli, `-ngl 99`, contexto 16.384, KV cache `q8_0`, 5 ejecuciones):

| Metrica | Valor |
|---|---|
| Procesamiento de prompt | 319,51 tokens/s |
| Generación | 65,22 tokens/s |
| Tiempo total | 76,2 s |
| VRAM pico | 18,28 GiB |
| Uso de GPU pico | 97% |

Advertencia: la evaluación es del propio autor del modelo, con ajustes no idénticos entre los modelos comparados, y no hay benchmarks independientes publicados en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el archivo NVFP4 pesa 20,2 GB; la ejecución de referencia con 99 capas en GPU y contexto de 16.384 consumió 18,28 GiB de VRAM pico. El proyector `mmproj` añade 931 MB.
- GPU recomendadas: NVIDIA Blackwell con soporte FP4 nativo, es decir, RTX PRO 6000 (incluida la Server Edition), serie RTX 50, B200 y B300. El autor cita explícitamente SM120 y GB202.
- GPU de consumo: sí, en tarjetas RTX 50-series con VRAM suficiente (el modelo completo en FP4 requiere ~20 GB más overhead de contexto). No se garantiza aceleración FP4 en generaciones anteriores (Ampere, Ada), donde el formato se decodifica por software.
- Opciones de despliegue: llama.cpp (`llama-cli`, y por extensión `llama-server`), Ollama y otras herramientas compatibles con GGUF. La model card menciona además text-generation-inference como tag, aunque el archivo es GGUF.
- Latencia y throughput: 319,51 tokens/s de prompt y 65,22 tokens/s de generación en RTX PRO 6000 con la configuración indicada. Sin decodificación especulativa.
- Contexto práctico: 16.384 tokens probados con KV cache `q8_0`; el entrenamiento usó 64k, pero no se publican mediciones a esa longitud.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B-NVFP4-GGUF | 26,9B | 64k (entrenamiento); 16k probado | Apache 2.0 | GGUF NVFP4 | Cuantización FP4 para Blackwell; multimodal |
| NousResearch/Arete-27B | 26,9B | 64k | Apache 2.0 | safetensors | Modelo base sin cuantizar; requiere más VRAM (BF16) |
| Qwen3.8-27B | 27B (aprox.) | no disponible en la información | no disponible en la información | no disponible | Modelo original; comportamiento político sin ajustar |
| Inkling | no disponible | no disponible | no disponible | no disponible | Profesor usado en el SFT; supera a Arete en fact score (3,96 frente a 2,98) |

No se dispone de datos suficientes en la información proporcionada para comparar con otras alternativas de 27B en benchmarks estándar (MMLU, HumanEval, GSM8K).

## Limitaciones y advertencias

- El ajuste modifica deliberadamente el comportamiento en temas políticos; esto puede introducir sesgos ideológicos en las respuestas y debe tenerse en cuenta en aplicaciones informativas o educativas.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad general más allá del fact score interno de Propaganda_Eval, que se sitúa en 2,98 sobre 5.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- La evaluación es del propio autor, con un juez automático (Grok 4.7) y configuraciones no idénticas entre modelos; los resultados deben interpretarse con cautela.
- Terminal-Bench-2.1 baja de 70% a 67% tras el ajuste, lo que sugiere una posible regresión leve en tareas de terminal.
- El formato NVFP4 está optimizado para Blackwell; en hardware anterior puede perder la ventaja de velocidad o requerir decodificación por software.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B y sus términos deben verificarse de forma independiente.
- No se documenta soporte de tool calling ni de agentes; no asumir su disponibilidad en producción sin validación.
- El repositorio tiene 0 descargas en el momento de la consulta y fue creado en noviembre de 2026; se trata de una publicación reciente sin validación comunitaria.

## Enlaces

- Hugging Face (cuantización): https://huggingface.co/prithivMLmods/Arete-27B-NVFP4-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Dataset de evaluación: https://huggingface.co/datasets/NousResearch/arete-data-pairs
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Archivo NVFP4: https://huggingface.co/prithivMLmods/Arete-27B-NVFP4-GGUF/blob/main/Arete-27B-NVFP4.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/Arete-27B-NVFP4-GGUF/blob/main/Arete-27B.mmproj.gguf
- Perfil del cuantizador: https://huggingface.co/prithivMLmods
