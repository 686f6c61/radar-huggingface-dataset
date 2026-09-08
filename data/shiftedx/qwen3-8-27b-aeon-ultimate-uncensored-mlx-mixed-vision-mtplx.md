# Shiftedx/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-MLX-MIXED-VISION-MTPLX

## Resumen

El modelo `Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-MLX-MIXED-VISION-MTPLX` es una conversión comunitaria a MLX del modelo base `AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, creada por el usuario Shiftedx. Se trata de un modelo de 27.000 millones de parámetros (27B) con arquitectura híbrida densa que combina atención clásica y capas recurrentes Gated DeltaNet, además de un módulo de visión y una cabeza de predicción multi-token (MTP) para decodificación especulativa. El modelo base fue sometido a un proceso de abliteración para eliminar la capa de rechazo y ofrecer respuestas sin censura, manteniendo la coherencia general. Esta conversión está pensada específicamente para Apple Silicon, empaquetando el modelo en formato MLX con cuantización mixta (affine 4-bit, affine 8-bit y BF16) y un peso total de descarga de 23,84 GB. No se dispone de la longitud de contexto en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso con atención clásica y capas recurrentes Gated DeltaNet (hybrid-attention / Gated DeltaNet) |
| Parametros totales | 27.356.728.560 (27B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit (group size 32), MLX affine 8-bit (group size 64), BF16 sin cuantizar (mixto) |
| Idiomas soportados | inglés, chino, multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (affine 4-bit + affine 8-bit + BF16) |

Nota: No es un modelo MoE, por lo que no se indica parámetros activos.

## Arquitectura y entrenamiento

La arquitectura del modelo es un transformer denso híbrido de 27B parámetros que alterna capas de atención convencional con capas recurrentes de tipo Gated DeltaNet. Estas capas recurrentes mantienen un estado interno que se propaga a lo largo de la secuencia, y son especialmente sensibles a la cuantización; por ello, en esta conversión se han dejado todas las proyecciones recurrentes (`linear_attn.in_proj_a` e `in_proj_b`, 96 en total) en BF16 sin cuantizar para evitar que el error de cuantización se acumule. La torre de visión también se conserva intacta en BF16 (333 tensores), así como la cabeza nativa de predicción multi-token (MTP) de 15 tensores, que permite decodificación especulativa a profundidad 3. El modelo base, publicado por AEON-7, fue sometido a un proceso de abliteración para eliminar la capa de rechazo, manteniendo la coherencia. No se han proporcionado detalles sobre el dataset de entrenamiento ni sobre procesos de RLHF/DPO. La cuantización mixta es una conversión personalizada con MLX affine, no MXFP4, GGUF, AWQ ni GPTQ.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (`--reasoning on`, `--reasoning-effort medium`).
- Comprensión de imágenes (pipeline `image-text-to-text`) mediante una torre de visión BF16 intacta.
- Tool calling y function calling: MTPLX acepta herramientas OpenAI y partes de imagen estándar, con un modo nativo de plantilla de herramientas (`--tool-prompt-mode native`).
- Soporte para agentes y razonamiento multi-paso gracias a la combinación de tool calling y razonamiento.
- Capacidades multilingües: inglés, chino y otros idiomas, aunque la documentación destaca principalmente estos dos.
- Modelo sin censura: la capa de rechazo ha sido eliminada, por lo que puede responder preguntas difíciles o controvertidas sin negarse.
- Predicción multi-token (MTP) nativa para acelerar la decodificación especulativa (profundidad 3, perfil turbo).
- Disponible como CLI interactiva o endpoint compatible con OpenAI mediante `mtplx serve`.

## Casos de uso

- Asistente local en Apple Silicon para razonamiento general: el modelo se ejecuta en Mac con 64 GB o más de memoria unificada, permitiendo un asistente de 27B sin depender de la nube y con modo de pensamiento activado.
- Análisis de imágenes y preguntas visuales: gracias a la torre de visión BF16, puede recibir imágenes y responder preguntas sobre su contenido, integrándose en aplicaciones de documentación o soporte visual.
- Agentes con tool calling en entornos de desarrollo: el soporte de herramientas OpenAI permite construir agentes que llaman a funciones externas, consultan APIs o ejecutan código, con decodificación especulativa para reducir latencia.
- Investigación y análisis sin filtros de censura: al carecer de capa de rechazo, es útil para explorar temas donde otros modelos se niegan a responder, siempre con supervisión humana y respetando la legalidad.
- Generación de código y asistencia en programación: su capacidad de razonamiento y tool calling permite integrarlo en pipelines de CI/CD o en IDEs como asistente de código, aprovechando el endpoint OpenAI-compatible.
- Procesamiento multilingüe chino-inglés: el modelo está optimizado para inglés y chino, lo que lo hace adecuado para traducción, análisis de documentos bilingües o aplicaciones con usuarios de ambos idiomas.
- Prototipado rápido de aplicaciones de IA en Mac: con `mtplx serve` se puede levantar un servidor local compatible con OpenAI en cuestión de minutos, ideal para desarrollo y pruebas sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Memoria unificada recomendada: 64 GB o más en Apple Silicon (referencia: Apple M4 Max con 64 GiB).
- Tamaño de descarga: 23,84 GB (22,20 GiB).
- GPU: no aplica a GPUs NVIDIA; está diseñado exclusivamente para Apple Silicon.
- No cabe en GPU de consumo típicas (RTX 4090, etc.) por ser una conversión MLX y requerir memoria unificada.
- Opciones de despliegue: MTPLX 2.11.2 o superior, con perfil turbo. Comandos disponibles: `mtplx pull`, `mtplx inspect`, `mtplx start cli`, `mtplx serve`.
- Parámetros recomendados: profundidad MTP 3, razonamiento activado con esfuerzo medio, temperatura 1.0, top-p 0.95, top-k 20, y `--paged-kv-quantization off`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tamaño | Precisión | Hardware objetivo | Licencia |
|---|---|---|---|---|
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 | ~54 GB | BF16 completo | H200 / multi-GPU / RTX PRO 6000 | Apache-2.0 |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED | ~23 GB | NVFP4 + FP8 + BF16 | DGX Spark, RTX 5090, RTX PRO 6000 | Apache-2.0 |
| Shiftedx/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-MLX-MIXED-VISION-MTPLX | 23,84 GB | MLX affine 4/8 + BF16 | Apple Silicon 64 GB+ | Apache-2.0 |

Los tres comparten la misma arquitectura y capacidades, pero se diferencian en el formato de cuantización y el hardware de destino. Esta conversión MLX es la única orientada a Apple Silicon y mantiene la torre de visión y la cabeza MTP en BF16.

## Limitaciones y advertencias

- Es un Early Access Draft (borrador de acceso anticipado), no una versión GA. La cuantización no promueve el borrador a producción.
- En generaciones muy largas, pueden aparecer bucles, repeticiones o fallos de razonamiento debido a pequeños huecos en los pesos abliteados. El propio autor advierte que esto es inherente al borrador, no a la cuantización.
- Al ser un modelo sin censura, puede generar contenido inapropiado, ilegal o dañino sin filtros. Debe usarse con supervisión humana y en contextos que cumplan la legislación vigente.
- Es una conversión comunitaria independiente, no un lanzamiento oficial de AEON-7, Qwen, Apple, MLX ni MTPLX.
- La cuantización es un formato MLX affine personalizado; no es compatible con MXFP4, GGUF, AWQ ni GPTQ, por lo que requiere MTPLX y no puede cargarse con otras librerías estándar.
- La longitud de contexto no está documentada en la información disponible, por lo que no se puede garantizar un comportamiento óptimo en secuencias muy largas.
- El soporte multilingüe se centra en inglés y chino; la calidad en otros idiomas puede ser inferior.
- Requiere Apple Silicon con al menos 64 GB de memoria unificada, lo que limita su despliegue a equipos Mac de gama alta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Shiftedx/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-MLX-MIXED-VISION-MTPLX
- Modelo base BF16: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Variante NVFP4 de despliegue: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-NVFP4-MIXED
- Librería MTPLX: https://pypi.org/project/mtplx/
- Repo relacionado (variante MXFP8): https://huggingface.co/Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp8-vision-mtplx
