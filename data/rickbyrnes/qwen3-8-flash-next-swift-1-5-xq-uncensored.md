# rickbyrnes/Qwen3.8-Flash-Next-Swift-1.5-XQ-Uncensored

## Resumen

Qwen3.8-Flash-Next-Swift-1.5-XQ-Uncensored es una cuantización mixta de precisión extrema (XQ) del fine-tune Swift 1.5 de UkisAI sobre el modelo base Qwen3.8-Flash-Next. Lo publica el usuario rickbyrnes en Hugging Face y su objetivo es hacer viable la inferencia de un modelo de mezcla de expertos (MoE) de 176.943.899.520 parámetros totales en hardware de consumo: una única GPU RTX 4090 de 24 GB combinada con 90 GB de RAM DDR4 y almacenamiento NVMe. El autor reporta 199 tok/s de decodificación y 3.204 tok/s de prefill con un prompt de 16.000 tokens, sirviendo a 256K de contexto.

La pieza técnica central es la separación entre un backbone denso de 5,5 GB, bit-idéntico al padre en Q8_0, y una tabla PLE (n-gram) de 28,8 GB que se lee desde disco con `O_DIRECT`, junto con 39,4 GB de expertos enrutados cuantizados a una media de 2,61 bits por peso. El resultado es un archivo de 73,7 GB (44,9 GB sin la tabla PLE) que mantiene un 83,5% de acuerdo top-1 con el padre en Q8_0 y un KL de 0,243 sobre los 64 tokens más probables.

El modelo incorpora una edición de dirección de rechazo (abliteration) aplicada sobre los pesos de precisión completa antes de la cuantización, de modo que la variante "uncensored" rechaza 0 de 100 prompts dañinos del conjunto JBB y 0 de 30 controles seguros. Está pensado para ejecutarse exclusivamente con el motor Xolotl del mismo autor, sobre la infraestructura Strata, y no se ha probado en otros runtimes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, arquetipo `qwen4exp`, 1224 tensores |
| Parámetros totales | 176.943.899.520 (dato de safetensors); el autor describe "125B" en la model card |
| Parámetros activos | 6B (según la model card) |
| Longitud de contexto | 256K (configuración servida); mediciones de prefill a 16K y 8K |
| Tipos de cuantización | XQ mixta: Q2_0 (12,7 GB), IQ4_XS (10,7 GB), IQ1_M (9,9 GB), IQ4_NL (5,2 GB), Q8_0 (0,9 GB) en expertos; backbone denso en Q8_0; media de 2,61 bits por peso en expertos enrutados |
| Idiomas soportados | en, zh, code |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF dividido en dos shards (`-00001-of-00002.gguf`, `-00002-of-00002.gguf`) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos con 176.943.899.520 parámetros totales y aproximadamente 6B activos por token, construida sobre el arquetipo `qwen4exp` con 1224 tensores. La distribución de pesos es heterogénea por diseño: el backbone denso ocupa 5,5 GB y es bit-idéntico al padre en Q8_0, mientras que los expertos enrutados suman 39,4 GB repartidos entre cinco formatos de cuantización (Q2_0, IQ4_XS, IQ1_M, IQ4_NL y Q8_0) con una media de 2,61 bits por peso. La tabla PLE de n-gramas, de 28,8 GB, se lee desde disco mediante `O_DIRECT`, lo que permite mantenerla fuera de la VRAM y de la RAM caliente.

El pipeline de cuantización XQ es privado, propiedad de Indra's Mirror, y no se documenta su funcionamiento interno. Antes de cuantizar se aplicó una edición de dirección de rechazo sobre los pesos de precisión completa del fine-tune Swift 1.5 de UkisAI, que a su vez es un ajuste de Qwen3.8-Flash-Next orientado a eficiencia de razonamiento. El autor indica que la abliteración sobrevive a la cuantización: 0 de 100 rechazos en JBB y 0 de 30 en controles seguros, igual que el padre Q8. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el fine-tune original.

La innovación operativa es el motor Xolotl, construido sobre Strata, que combina decodificación especulativa con `--spec 4` y un drafter MTP, KV cache en int8 y gestión de la arena de expertos en RAM. El autor señala que la decodificación está limitada por el ancho de banda de memoria una vez la arena de expertos está caliente, por lo que escala más con la velocidad de la RAM que con la GPU.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de hasta 256K tokens.
- Razonamiento con modo "thinking" activado, usado en las evaluaciones de la Gauntlet v2.
- Generación y edición de código en tareas agénticas con herramientas en sandbox.
- Soporte de tool calling y function calling dentro de entornos agénticos de múltiples turnos.
- Capacidad de agente autónomo con razonamiento multi-paso y tests ocultos evaluados tras cada turno.
- Multilingüe limitado a inglés, chino y código.
- Variante sin censura (abliterated): no rechaza prompts dañinos según la evaluación JBB del autor.
- Compatible con endpoints (`endpoints_compatible` en los tags del repo).

## Casos de uso

- Asistencia de código agéntica en local: el modelo resuelve tareas de programación de varios turnos con herramientas en sandbox, como demuestra la Gauntlet v2 (5 de 7 tareas resueltas en 4,6 turnos de media), adecuado para equipos que quieren un agente de código sin enviar datos a APIs externas.
- Servicio de chat con contexto largo: con 256K de ventana servida y KV en int8, puede mantener conversaciones o documentos extensos en una sola sesión sin truncar, útil para análisis de repositorios o expedientes completos.
- Sustitución local de API en flujos de razonamiento: el autor compara su rendimiento con `qwen/qwen3.8-flash` en la nube (6,68 de score frente a 5,50, y 449 s frente a 2.021 s de wall time), lo que lo hace viable como reemplazo on-premise para cargas de agente.
- Generación de documentación técnica y código: la perplejidad en el segmento de código es de 2,044 y el acuerdo top-1 con el padre en ese segmento es del 92,0%, el más alto de todos los evaluados.
- Procesamiento de transcripciones de agente: la perplejidad en transcripciones agénticas es de 4,457 con 74,1% de precisión next-token, lo que lo hace apto para modelar y continuar trazas de herramientas.
- Investigación sobre alineación y abliteración: al publicarse con la edición de rechazo aplicada y con métricas de rechazo (0/100 JBB, 0/30 controles), sirve como artefacto reproducible para estudiar cómo sobrevive la abliteración a una cuantización agresiva a 2,61 bits por peso.
- Despliegue en estación de trabajo única: con una RTX 4090, 90 GB de RAM y NVMe se obtienen 199 tok/s de decodificación a 16K de prompt, suficiente para prototipado e inferencia interactiva sin clúster.

## Benchmarks y rendimiento

Gauntlet v2 (codificación agéntica, 7 tareas, 10 turnos, herramientas en sandbox, thinking activado):

| Modelo | Resueltas | Score | Turno medio de resolución | Wall time | Decodificación durante la ejecución |
|---|---|---|---|---|---|
| Este (45 GB) | 5/7 | 6,68 | 4,6 | 449 s | 164 tok/s |
| V1 xol-qfn (55,8 GB) | 6/7 | 6,50 | 5,8 | 856 s | 131 tok/s |
| Qwen API `qwen/qwen3.8-flash` | 5/7 | 5,50 | 6,6 | 2.021 s | no disponible |

Texto con teacher forcing (5 segmentos × 999 posiciones):

| Segmento | Perplejidad V1 | Perplejidad 45 | Precisión next-token V1 | Precisión next-token 45 |
|---|---|---|---|---|
| Código | 2,072 | 2,044 | 83,4% | 84,4% |
| Transcripción de agente | 4,630 | 4,457 | 72,5% | 74,1% |
| Multilingüe | 2,746 | 2,767 | 76,3% | 76,4% |
| Documentación | 10,585 | 11,026 | 48,5% | 47,9% |
| Prosa en inglés | 4,437 | 5,070 | 58,9% | 56,7% |
| Global | 4,154 | 4,264 (+2,6%) | 67,9% | 67,9% |

Frente al padre en precisión completa (Swift 1.5 Q8_0 abliterado, perplejidad 4,080):

| Archivo | Tamaño sin PLE | Acuerdo top-1 | KL (menor es mejor) | Perplejidad |
|---|---|---|---|---|
| Este (XQ 45 GB) | 44,9 GB | 83,5% | 0,243 | 4,264 (+4,5%) |
| SC117 GSQ-RCO IQ3_XXS abliterado | 47,0 GB | 81,8% | 0,287 | 4,208 (+3,1%) |
| V1 xol-qfn (base Qwen3.8-Flash-Next, RTN) | 55,8 GB | 86,3% | 0,163 | 4,154 (+1,8%) |

Acuerdo top-1 por segmento: código 92,0%, multilingüe 92,0%, transcripción de agente 84,2%, prosa en inglés 76,0%, documentación 73,4%.

Velocidad (Linux, RTX 4090 24 GB, Ryzen 7 5700X, 90 GB DDR4-3200, modelo en NVMe, 256K de contexto, KV int8, `--spec 4` con drafter MTP, 1.024 tokens generados):

| Prompt | Prefill (este) | Decode (este) | Prefill (V1) | Decode (V1) |
|---|---|---|---|---|
| 16.000 | 3.204 tok/s | 199 tok/s | 3.231 tok/s | 124 tok/s |
| 8.000 | 2.819 tok/s | 160 tok/s | 2.740 tok/s | 128 tok/s |

## Requisitos de hardware

- VRAM: la configuración medida usa 24 GB (RTX 4090); el archivo completo ocupa 73,7 GB en disco y 44,9 GB sin la tabla PLE, que se lee desde NVMe con `O_DIRECT`.
- RAM: 90 GB DDR4-3200 en la máquina de referencia; la decodificación escala con el ancho de banda de memoria más que con la GPU.
- GPU recomendadas: RTX 4090 24 GB es la plataforma validada. No se han publicado mediciones para A100, H100 ni otras GPU.
- Cabe en GPU de consumo: sí, en RTX 4090, pero solo con el esquema híbrido GPU + RAM + NVMe descrito.
- Almacenamiento: NVMe obligatorio para la tabla PLE; el autor no documenta comportamiento en HDD ni SATA.
- Despliegue: exclusivamente con el motor Xolotl (repositorio `Indras-Mirror/Xolotl`), compilado con `-DSTRATA_ENABLE_CUDA=ON -DSTRATA_GGML_CUDA=ON -DSTRATA_MMQ_KQUANTS=ON` y `CMAKE_CUDA_ARCHITECTURES=89`. No se ha probado en vLLM, llama.cpp, Ollama ni TGI.
- Configuración de servicio: `xolotl-qfn45.json`, puerto 8099, 256K de contexto, KV int8, decodificación especulativa `--spec 4` con drafter MTP.
- Latencia y throughput: 199 tok/s de decode y 3.204 tok/s de prefill a 16K; 160 tok/s y 2.819 tok/s a 8K.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este (Qwen3.8-Flash-Next-Swift-1.5-XQ-Uncensored) | 176.943.899.520 totales, 6B activos | 256K | Gauntlet v2 6,68; perplejidad 4,264 | Apache 2.0 | GGUF en Hugging Face, requiere Xolotl |
| V1 xol-qfn | MoE sobre Qwen3.8-Flash-Next base | no disponible | Gauntlet v2 6,50; perplejidad 4,154 | no disponible | GGUF, 55,8 GB sin PLE |
| SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF | mismos pesos Swift 1.5 | no disponible | Acuerdo top-1 81,8%; KL 0,287; perplejidad 4,208 | no disponible | GGUF, 47,0 GB sin PLE |
| Qwen API `qwen/qwen3.8-flash` | no disponible | no disponible | Gauntlet v2 5,50 | servicio propietario | API en la nube |

## Limitaciones y advertencias

- Solo se ha validado con el motor Xolotl; otros runtimes (llama.cpp, vLLM, Ollama, TGI) no se han probado y el autor recomienda explícitamente no usarlos con este archivo.
- La cuantización a 2,61 bits por peso en los expertos degrada la prosa en inglés: la perplejidad sube un 14% respecto a V1 (5,070 frente a 4,437) y el acuerdo top-1 en ese segmento es del 76,0%, el más bajo junto con documentación (73,4%).
- La perplejidad global empeora un 4,5% respecto al padre Q8_0 y un 2,6% respecto a V1; el acuerdo top-1 es del 83,5%, lo que implica divergencias de token en uno de cada seis casos aproximadamente.
- La variante abliterated elimina los rechazos por diseño (0/100 en JBB): no es apta para despliegues públicos sin filtros externos de seguridad ni para aplicaciones sujetas a requisitos de moderación.
- Los resultados de la Gauntlet v2 proceden de una única ejecución por modelo; el propio autor señala que la diferencia 5/7 frente a 6/7 está dentro de la varianza entre ejecuciones.
- Idiomas limitados a inglés, chino y código; no hay soporte declarado de castellano ni de otras lenguas.
- El pipeline XQ es privado y no reproducible; no se puede auditar cómo se asignaron los formatos por tensor.
- El rendimiento depende críticamente del ancho de banda de RAM y de la latencia del NVMe; en hardware inferior las cifras de 199 tok/s no son extrapolables.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La model card describe "125B" parámetros mientras que los safetensors declaran 176.943.899.520; conviene tratar la cifra del autor con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rickbyrnes/Qwen3.8-Flash-Next-Swift-1.5-XQ-Uncensored
- Modelo base (según la model card): https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Modelo base (según metadatos del Hub): https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Cuantización comparable de SC117: https://huggingface.co/SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Motor Xolotl: https://github.com/Indras-Mirror/Xolotl
- Infraestructura Strata: https://github.com/Niko1221/Strata
- Mediciones completas: `GATES.md` dentro del repositorio del modelo
