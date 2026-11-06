# IndrasMirror/Qwen3.8-Flash-Next-Swift-1.5-XQ-Uncensored

## Resumen

Qwen3.8-Flash-Next-Swift-1.5-XQ-Uncensored es una cuantización GGUF de precisión mixta del modelo Swift 1.5 de UkisAI, a su vez un fine-tune de razonamiento eficiente sobre Qwen3.8-Flash-Next. Lo publica IndrasMirror y su objetivo es hacer viable un modelo de mezcla de expertos (MoE) de 176.943.899.520 parámetros totales en hardware de consumo: según la model card, se sirve en una RTX 4090 de 24 GB más 90 GB de RAM DDR4 y almacenamiento NVMe, alcanzando 199 tok/s de decodificación y 3.204 tok/s de prefill con un prompt de 16.000 tokens y contexto de 256K.

La particularidad del artefacto es su estrategia de cuantización: los expertos enrutados ocupan 39,4 GB con una media de 2,61 bits por peso, la columna densa se mantiene en 5,5 GB idéntica en bits al padre Q8_0, y una tabla PLE de n-gramas de 28,8 GB se lee desde disco con `O_DIRECT`. El resultado pesa 73,7 GB en total, o 44,9 GB sin la tabla PLE. Sobre los pesos de precisión completa se aplicó una edición de dirección de rechazo (abliteration) antes de cuantizar.

Es relevante porque demuestra que un MoE de esta escala puede ejecutarse en un solo equipo con GPU de consumo, a costa de depender de un motor específico, Xolotl (construido sobre Strata), y de un pipeline de cuantización XQ privado. La licencia es Apache 2.0 y los idiomas declarados son inglés, chino y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre arquitectura `qwen4exp`, 1224 tensores |
| Parametros totales | 176.943.899.520 |
| Parametros activos | 125B totales con 6B activos (según model card) |
| Longitud de contexto | 256K (configuración de servicio con KV en int8) |
| Tipos de cuantizacion | GGUF de precisión mixta: Q2_0 (12,7 GB), IQ4_XS (10,7 GB), IQ1_M (9,9 GB), IQ4_NL (5,2 GB), Q8_0 (0,9 GB); media de 2,61 bits por peso en expertos |
| Idiomas soportados | en, zh, code |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF dividido en 2 shards (`-00001-of-00002`, `-00002-of-00002`), pack de motor `pack-qfn45/` |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos de tipo `qwen4exp`, con 176.943.899.520 parámetros totales y 6B activos por token según la model card. La estructura de pesos se reparte en tres bloques: expertos enrutados (39,4 GB a 2,61 bits por peso de media), columna densa (5,5 GB, bit-idéntica al padre Q8_0) y una tabla PLE de n-gramas de 28,8 GB que se lee desde disco mediante `O_DIRECT`, lo que explica que el fichero completo ocupe 73,7 GB frente a los 44,9 GB sin PLE.

El entrenamiento original corresponde a Qwen3.8-Flash-Next, sobre el que UkisAI aplicó el fine-tune Swift 1.5 orientado a eficiencia de razonamiento. IndrasMirror aplicó después una edición de dirección de rechazo sobre los pesos de precisión completa y cuantizó con su pipeline XQ, que es privado y no está documentado públicamente. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO. El autor declara decodificación especulativa con un drafter MTP (`--spec 4`) en la configuración de servicio.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento con modo thinking activable, empleado en las pruebas agénticas del autor.
- Generación y edición de código, con buen comportamiento medido en texto de código (perplejidad 2,044 y 84,4% de acierto next-token).
- Soporte de tool calling y uso de herramientas en sandbox, verificado en tareas agénticas de 10 turnos.
- Razonamiento multi-paso y agentes: el benchmark Gauntlet v2 mide resolución de tareas con tests ocultos evaluados tras cada turno.
- Multilingüe limitado a inglés y chino, más código.
- Sin censura por edición de dirección de rechazo: 0 de 100 rechazos en prompts dañinos JBB y 0 de 30 en controles seguros.
- No se declaran capacidades de visión ni audio.

## Casos de uso

- Asistente de código en local: con 256K de contexto y buen rendimiento en texto de código, puede mantener un repositorio mediano en ventana y responder sobre él sin salir del equipo del desarrollador.
- Agente de resolución de tareas con herramientas: el benchmark Gauntlet v2 (7 tareas, 10 turnos, herramientas en sandbox) muestra 5/7 resueltas con 4,6 turnos de media, adecuado para pipelines de parcheo automático con verificación por tests.
- Atención al cliente multi-turno: la ventana de 256K permite arrastrar historial largo y documentación de producto en la misma sesión, con 199 tok/s de decodificación a 16K de prompt.
- Procesamiento de documentación técnica y código en lote: prefill de 3.204 tok/s a 16.000 tokens permite ingerir documentos largos con latencia de primer token contenida.
- Investigación sobre alineación y abliteration: al estar publicado el efecto de la edición de rechazo antes y después de cuantizar (0/100 en JBB), sirve como caso de estudio reproducible de cómo sobrevive la abliteration a la cuantización agresiva.
- Despliegue en estación de trabajo con una sola GPU de consumo: el perfil objetivo (RTX 4090 + 90 GB de RAM + NVMe) permite servir el modelo a 256K de contexto sin infraestructura de centro de datos.
- Evaluación comparativa de cuantizaciones: las tablas de acuerdo top-1 y KL frente al padre Q8_0 permiten usar el artefacto como referencia en estudios de degradación por cuantización.

## Benchmarks y rendimiento

Gauntlet v2 (codificación agéntica, 7 tareas, 10 turnos, herramientas en sandbox, thinking activado):

| Modelo | Resueltas | SCORE | Turno medio de resolución | Tiempo total | Decodificación durante la ejecución |
|---|---|---|---|---|---|
| Este (45 GB) | 5/7 | 6,68 | 4,6 | 449 s | 164 tok/s |
| V1 xol-qfn (55,8 GB) | 6/7 | 6,50 | 5,8 | 856 s | 131 tok/s |
| Qwen API `qwen/qwen3.8-flash` | 5/7 | 5,50 | 6,6 | 2.021 s | no aplica |

Texto con teacher forcing (5 segmentos × 999 posiciones):

| Segmento | Perplejidad V1 | Perplejidad 45 GB | Acierto next-token V1 | Acierto next-token 45 GB |
|---|---|---|---|---|
| Código | 2,072 | 2,044 | 83,4% | 84,4% |
| Transcripción agéntica | 4,630 | 4,457 | 72,5% | 74,1% |
| Multilingüe | 2,746 | 2,767 | 76,3% | 76,4% |
| Documentación | 10,585 | 11,026 | 48,5% | 47,9% |
| Prosa en inglés | 4,437 | 5,070 | 58,9% | 56,7% |
| Global | 4,154 | 4,264 (+2,6%) | 67,9% | 67,9% |

Frente al padre de precisión completa (Swift 1.5 abliterado Q8_0, perplejidad 4,080):

| Fichero | Tamano sin PLE | Acuerdo top-1 | KL | Perplejidad |
|---|---|---|---|---|
| Este (XQ 45 GB) | 44,9 GB | 83,5% | 0,243 | 4,264 (+4,5%) |
| SC117 GSQ-RCO IQ3_XXS abliterado | 47,0 GB | 81,8% | 0,287 | 4,208 (+3,1%) |
| V1 xol-qfn (base Qwen3.8-Flash-Next, RTN) | 55,8 GB | 86,3% | 0,163 | 4,154 (+1,8%) |

Velocidad medida en Linux, RTX 4090 24 GB, Ryzen 7 5700X, 90 GB DDR4-3200, modelo en NVMe, contexto 256K, KV int8, `--spec 4` con drafter MTP, 1.024 tokens generados:

| Prompt | Prefill (este) | Decodificación (este) | Prefill (V1) | Decodificación (V1) |
|---|---|---|---|---|
| 16.000 | 3.204 tok/s | 199 tok/s | 3.231 tok/s | 124 tok/s |
| 8.000 | 2.819 tok/s | 160 tok/s | 2.740 tok/s | 128 tok/s |

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM: el perfil medido usa una RTX 4090 de 24 GB; la columna densa ocupa 5,5 GB y el resto se reparte entre RAM y disco.
- RAM: 90 GB DDR4-3200 en la configuración de referencia; la decodificación está limitada por ancho de banda de memoria una vez caliente la arena de expertos.
- Almacenamiento: NVMe obligatorio en la práctica, ya que la tabla PLE de 28,8 GB se lee desde disco con `O_DIRECT`.
- GPU recomendadas: RTX 4090 (medida); no hay datos publicados para A100, H100 ni otras GPU.
- Cabe en GPU de consumo solo con el esquema híbrido GPU + RAM + NVMe descrito; no cabe íntegramente en 24 GB de VRAM.
- Despliegue: exclusivamente Xolotl (sobre Strata), con el pack `pack-qfn45/` y la configuración `xolotl-qfn45.json` en el puerto 8099. El autor indica que otros runtimes no han sido probados con este fichero, por lo que vLLM, llama.cpp, Ollama y TGI no están validados.
- Latencia y throughput: 3.204 tok/s de prefill y 199 tok/s de decodificación a 16K de prompt; 2.819 tok/s y 160 tok/s a 8K, con 1.024 tokens generados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento medido | Disponibilidad |
|---|---|---|---|---|---|---|
| Este (XQ 45 GB) | 176,9B totales, 6B activos | 256K | Apache 2.0 | GGUF + pack Xolotl | Gauntlet v2 6,68; perplejidad 4,264 | Hugging Face, requiere Xolotl |
| V1 xol-qfn | Base Qwen3.8-Flash-Next | 256K (config del autor) | Apache 2.0 (presumible, no confirmado) | GGUF | Gauntlet v2 6,50; perplejidad 4,154 | Referencia interna del autor |
| SC117 Swift-1.5 GSQ-RCO IQ3_XXS abliterado | Mismo base Swift 1.5 | no disponible | Apache 2.0 (presumible, no confirmado) | GGUF | Acuerdo top-1 81,8%; KL 0,287; perplejidad 4,208 | Hugging Face |
| Qwen API `qwen/qwen3.8-flash` | no disponible | no disponible | servicio propietario | API | Gauntlet v2 5,50 | API de Qwen |

## Limitaciones y advertencias

- Dependencia total del motor Xolotl: no hay validación con llama.cpp, Ollama, vLLM ni TGI, lo que limita la portabilidad y ata el despliegue a un repositorio de GitHub concreto.
- El pipeline de cuantización XQ es privado, por lo que la reproducibilidad del artefacto es nula fuera del autor.
- La decodificación está limitada por ancho de banda de RAM; bajar de DDR4-3200 o usar menos de 90 GB degradará el rendimiento de forma directa.
- La tabla PLE exige NVMe y lectura `O_DIRECT`; un disco lento hará inviable el servicio.
- La abliteration elimina los rechazos (0/100 en JBB) y también podría reducir salvaguardas en dominios sensibles: no es apto para despliegues públicos sin capas de moderación externas.
- La prosa en inglés empeora un 14% en perplejidad respecto a V1 y es el segmento más débil (acuerdo top-1 del 76,0% frente al padre Q8_0), junto con documentación (73,4%).
- Idiomas limitados a inglés, chino y código; no se declara soporte de castellano.
- El resultado de Gauntlet v2 (5/7 frente a 6/7 de V1) procede de una sola ejecución por modelo, por lo que está dentro de la varianza según el propio autor.
- El repositorio tiene 797 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-Flash-Next y del fine-tune Swift 1.5 antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndrasMirror/Qwen3.8-Flash-Next-Swift-1.5-XQ-Uncensored
- Modelo base (fine-tune): https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Modelo base declarado en la model card: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- Cuantización alternativa SC117: https://huggingface.co/SC117/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Motor Xolotl: https://github.com/Indras-Mirror/Xolotl
- Motor Strata: https://github.com/Niko1221/Strata
- Mediciones completas: `GATES.md` dentro del repositorio del modelo
