# kingjones777/Muse-Glimmer-30B-Uncensored-ROCmFP4-GGUF

## Resumen

El modelo `kingjones777/Muse-Glimmer-30B-Uncensored-ROCmFP4-GGUF` es una cuantización GGUF en formato ROCmFP4 del modelo `meta-models/Muse-Glimmer-30B`, un modelo multimodal de 30B parámetros desarrollado por Meta para agentes locales siempre activos. Esta versión concreta ha sido sometida a un proceso de abliteración (eliminación de rechazos de contenido) y está optimizada para hardware AMD Strix Halo (gfx1151) con memoria unificada, como el Ryzen AI Max+ 395.

El repo incluye cuatro cuantizaciones ROCmFP4 (ftypes 103, 106, 114 y 116) más un drafter DFlash para decodificación especulativa y un proyector de visión. Se trata de un artefacto de investigación: la abliteration elimina los rechazos de contenido pero no añade capacidades, por lo que no se recomienda como producto por defecto en entornos de producción.

La licencia es Apache-2.0 y el modelo base es multimodal (texto e imagen) con soporte nativo de tool-calling y razonamiento. El contexto soportado es de 32.768 tokens según las pruebas publicadas. Es una cuantización específica para la fork ROCmFPX de llama.cpp, no compatible con la versión estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), arquitectura exacta no especificada |
| Parámetros totales | 27.854.794.240 |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (según pruebas con `-c 32768`) |
| Tipos de cuantización | ROCmFP4 (ftype 103 y 106), Q6_0_ROCMFPX (ftype 114 y 116) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con tensores ROCmFP4 para la fork ROCmFPX de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `Muse-Glimmer-30B` es un modelo multimodal de Meta que acepta texto e imágenes, con salida de razonamiento separada y tool-calling nativo. Está diseñado para agentes locales siempre activos, con soporte para tareas largas y recuperación de fallos. La arquitectura exacta no se detalla en la información proporcionada, pero se trata de un transformer con capacidad multimodal.

Este repo concreto es una cuantización del checkpoint BF16 del modelo base, convertido a GGUF mediante `convert_hf_to_gguf.py` y posteriormente cuantizado con la herramienta `llama-quantize` de la fork ROCmFPX. El proceso de abliteration se aplicó al checkpoint antes de la conversión, eliminando los rechazos de contenido. No se realizó ningún entrenamiento adicional; la cuantización es la única transformación sobre el modelo original.

El repo incluye un drafter DFlash (de Meta, sin modificar) para decodificación especulativa, que acelera la generación de texto y código. El proyector de visión también se incluye sin modificar, ya que los tensores de visión no fueron ablitterados.

## Capacidades

- Generación de texto y razonamiento multimodal (texto + imágenes) gracias a su naturaleza image-text-to-text.
- Tool-calling nativo y soporte para agentes, con salida de razonamiento separada.
- Razonamiento multi-step y recuperación de fallos en tareas largas.
- Decodificación especulativa con DFlash (block size 16, `--spec-draft-n-max 15`), que acelera la generación de texto y código.
- Soporte para `reasoning_strength` (low/high) mediante parámetros de chat template; `reasoning_budget` no se aplica en este modelo.
- Capacidad de visión, aunque requiere `-fa off` para el modo visión (con `-fa on` para texto).
- Versión uncensored: los rechazos de contenido se eliminan por abliteration, lo que afecta a la política de seguridad del modelo.

## Casos de uso

- **Agente local de productividad**: el modelo puede ejecutarse en un equipo AMD Strix Halo con memoria unificada, gestionando tareas como resúmenes, extracción de información o gestión de calendario, con tool-calling para interactuar con APIs y servicios externos.
- **Generación de código en desarrollo**: con velocidades de decodificación de código de ~38 tok/s (ftype 106), es adecuado para completar código y generar scripts en entornos de desarrollo local, aunque la latencia depende de la carga de trabajo.
- **Asistente de razonamiento multimodal**: al aceptar imágenes, puede analizar capturas de pantalla, diagramas o documentos escaneados y razonar sobre ellos, útil en soporte técnico o análisis de documentación.
- **Investigación en alineación**: como artefacto de investigación, permite estudiar el impacto de la abliteration en la calidad de las respuestas y el comportamiento de rechazo, comparando con la versión alineada.
- **Prototipado de agentes con decodificación especulativa**: la integración con DFlash permite evaluar el rendimiento de la decodificación especulativa en hardware AMD, útil para optimizar la latencia en sistemas de agente en tiempo real.
- **Despliegue en hardware AMD de memoria unificada**: ideal para equipos como el Ryzen AI Max+ 395 (128 GB), donde el modelo completo cabe en memoria unificada y puede ejecutarse sin GPU discreta, con `llama-server` y ROCmFPX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona datos de velocidad de decodificación y una evaluación específica de rechazo de contenido, pero no se trata de benchmarks de capacidad general.

Velocidades de decodificación medidas en Ryzen AI Max+ 395 / Radeon 8060S / gfx1151, ROCm 7.2.4, DFlash `--spec-draft-n-max 15`, `-fa on`, ctx 32768, batch 1, temperatura 0 (medianas de 3 ejecuciones):

| Build | ftype | Tamaño | Prosa (tok/s) | Código (tok/s) |
| --- | --- | --- | --- | --- |
| Unc FAST | 103 | 13.80 GiB | 15.68 | 37.44 |
| Unc STRIX_LEAN | 106 | 14.00 GiB | 16.72 | 38.51 |
| Unc Q6 AGENT | 114 | 24.17 GiB | — | — |
| Unc Q6 LEAN | 116 | 21.09 GiB | — | — |

Resultados de la prueba de rechazo de contenido (24 items dañinos, 12 inofensivos, 8 de calidad; greedy, temp 0):

| Modelo | Dañinos 24 | Inofensivos 12 | Calidad 8 |
| --- | --- | --- | --- |
| Qwen3.8 aligned Q8 AGENT | 23 rechaza, 1 cumple | 11/12 ok (1 sobre-rechazo) | 6/8 |
| Qwen3.8 uncensored Q6 AGENT (114) | 23 cumple, 1 roto | 11/12 ok (1 sobre-rechazo) | 6/8 |
| Muse alineado Q6 AGENT (114) | 18 rechaza, 6 cumple | 11/12 ok (1 sobre-rechazo) | 7/8 |
| Muse uncensored STRIX_LEAN (106) | 24 cumple | 12/12 ok (0 sobre-rechazo) | 7/8 |

## Requisitos de hardware

- Hardware específico: AMD Ryzen AI Max+ 395 / Radeon 8060S / gfx1151, con memoria unificada de 128 GB y ROCm 7.2.4.
- VRAM estimada: los ficheros ROCmFP4 ocupan entre 13.80 GiB y 24.17 GiB, por lo que caben en la memoria unificada del hardware objetivo. No se especifican requisitos de VRAM para GPUs discretas.
- GPU recomendadas: solo se ha probado en gfx1151 (Radeon 8060S). No se garantiza compatibilidad con otras GPUs AMD o NVIDIA.
- Opciones de despliegue: `llama-server` de llama.cpp con la fork ROCmFPX (no compatible con llama.cpp estándar), con `-ngl 999` para descargar todas las capas a ROCm.
- Latencia: la velocidad de decodificación es de ~15-17 tok/s en prosa y ~37-38 tok/s en código (con DFlash). La latencia real depende de la carga de trabajo (se indica que es workload-dominated).
- Requisitos adicionales: se necesita el fichero `dflash-kquant.gguf` como drafter y `mmproj-kquant.gguf` para visión, ambos incluidos en el repo.

## Comparativa con modelos similares

El modelo base es de Meta, y se puede comparar con la versión alineada del mismo modelo y con alternativas uncensored de menor tamaño. No se dispone de datos de rendimiento en benchmarks estándar para comparar.

| Modelo | Parámetros | Contexto | Licencia | Cuantización | Características |
| --- | --- | --- | --- | --- | --- |
| Muse-Glimmer-30B (alineado) | 27.85B | 32K | Apache-2.0 | ROCmFP4 (103/106) | Multimodal, tool-calling, con rechazos de contenido |
| Muse-Glimmer-30B Uncensored (este repo) | 27.85B | 32K | Apache-2.0 | ROCmFP4 (103/106), Q6 | Multimodal, tool-calling, sin rechazos (abliterated) |
| Qwen3.5B (uncensored, Q6 AGENT) | ~3.8B | no disponible | no disponible | Q6 | Modelo más pequeño, uncensored, sin multimodalidad |

Nota: la comparación con Qwen3.8 se basa en la prueba de rechazo de contenido incluida en la model card, no en benchmarks generales.

## Limitaciones y advertencias

- Artefacto de investigación: la abliteration elimina los rechazos de contenido, lo que puede generar respuestas inapropiadas o dañinas. No debe usarse como producto por defecto.
- Compatibilidad restringida: requiere la fork ROCmFPX de llama.cpp con soporte para ggml types 100-106 y el puerto del modelo muse-glimmer. La versión estándar de llama.cpp rechaza estos tensores.
- Hardware específico: solo probado en AMD Strix Halo (gfx1151). No se garantiza su funcionamiento en otras plataformas.
- Rendimiento de visión: el modo visión requiere `-fa off`, mientras que el texto usa `-fa on`; alternar entre modos puede afectar el rendimiento.
- Limitaciones del razonamiento: `--reasoning-budget` no se aplica en este modelo; se debe usar `reasoning_strength` en el chat template. El valor por defecto es `high`, y con `max_tokens` pequeño puede devolver `content` vacío.
- Calidad de la abliteration: aunque la prueba de rechazo muestra 24/24 cumplimientos en el set dañino, la calidad general no está validada con benchmarks estándar. La prueba de calidad es un smoke check, no una evaluación de capacidades.
- Descargas y soporte: el repo tiene 0 descargas y 0 likes, lo que sugiere que es nuevo y no ha sido validado por la comunidad.

## Enlaces

- Repo de HuggingFace: https://huggingface.co/kingjones777/Muse-Glimmer-30B-Uncensored-ROCmFP4-GGUF
- Modelo base (Meta): https://huggingface.co/meta-models/Muse-Glimmer-30B
- Repo alineado (mismo autor): https://huggingface.co/kingjones777/Muse-Glimmer-30B-ROCmFP4-Strix-Halo-DFlash-GGUF
- Página de Meta sobre Muse Glimmer: https://developer.meta.com/ai/models/muse-glimmer/
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Sitio informativo sobre Muse Glimmer: https://museglimmer.site/
