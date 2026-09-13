# azampatti/Qwen3.8-Flash-Next-125B-A5B-INT4-AutoRound

## Resumen

Qwen3.8-Flash-Next-125B-A5B-INT4-AutoRound es una revisión modificada y cuantizada de Qwen3.8-Flash-Next, publicada por el usuario azampatti a partir del checkpoint intermedio de Intel (Intel/Qwen3.8-Flash-Next-W4A16-AutoRound). Se trata de un modelo de mezcla de expertos (MoE) con 123.958.298.771 parámetros totales (unos 124B) y 4,8B activos por token, frente a los 6,0B activos del original. La reducción se consigue recortando el enrutamiento de 10 a 5 expertos por token y aplicando después un proceso de reparación (healing) mediante autodestilación KL.

El problema que aborda es servir un modelo de ~124B en una única máquina con memoria unificada de 128 GB (NVIDIA DGX Spark, GB10) a una velocidad de decodificación utilizable: entre 64 y 70 tokens/s, frente a los ~57 tokens/s del original. Para ello mezcla int4 GPTQ-Marlin (grupo 128) en los expertos enrutados y en el cabezal de salida, fp8 e4m3 por bloques en atención, proyecciones gated-delta y experto compartido, bf16 en embeddings, routers, normas e hiperconexiones, y una tabla n-gram de 51B parámetros en fp8 (49 GB) que se lee desde disco mediante memory map.

Su interés actual es doble: por un lado, demuestra que es posible recortar el enrutamiento a la mitad y recuperar buena parte de la calidad perdida entrenando únicamente el experto compartido (37,75M parámetros) con destilación del propio modelo sin recortar; por otro, documenta con cifras el intercambio entre capacidad (47 frente a 51,8 del original) y velocidad (un 17% más de tokens/s), manteniendo intacto el uso de herramientas (85-89 frente a 86). Los resultados proceden del arnés propio del autor, no de una evaluación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer, con proyecciones gated-delta e hiperconexiones; 48 capas × 512 (expertos enrutados); etiqueta del repositorio qwen4_exp |
| Parámetros totales | 123.958.298.771 (~124B), dato real de safetensors |
| Parámetros activos | ~4,8B por token (el modelo original activa 6,0B; 5 expertos enrutados por token en lugar de 10) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 GPTQ-Marlin grupo 128 (expertos enrutados y lm_head, este último ajustado con AutoRound); fp8 e4m3 por bloques (atención, proyecciones gated-delta, experto compartido); bf16 (embeddings, routers, normas, hiperconexiones); fp8 (tabla n-gram de ple-table/) |
| Idiomas soportados | no disponible |
| Licencia | other (license_name: qwen), sujeta a https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE |
| Formato de pesos | safetensors |
| Autor | azampatti |
| Modelo base | Intel/Qwen3.8-Flash-Next-W4A16-AutoRound (a su vez derivado de Qwen/Qwen3.8-Flash-Next) |
| Librería de inferencia | vllm |
| Tamaño del repositorio | 132,5 GB (49 GB corresponden a la tabla ple-table/) |
| Descargas / likes | 215 / 1 |
| Publicado / actualizado | 2026-09-08 / 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3.8-Flash-Next: un transformer con mezcla de expertos, enrutamiento top-k y componentes híbridos (proyecciones gated-delta, además de hiperconexiones), según la descripción del propio repositorio. La información disponible no detalla la dimensión oculta, el número exacto de expertos por capa ni la composición del dataset original, por lo que esos datos quedan como no disponibles. La modificación principal de este checkpoint es el recorte del enrutamiento de top-10 a top-5 expertos por token, lo que reduce a la mitad la capacidad experta vista por cada token y, con ello, los parámetros activos (de 6,0B a 4,8B).

El proceso de reparación consistió en entrenar únicamente el experto compartido (37,75M parámetros; el resto congelado) para igualar la salida que habría producido el modelo sin recortar, usando al propio modelo original con top-10 como profesor: destilación pura por divergencia KL sobre 14.667 ejemplos de código, matemáticas, texto general, llamadas a herramientas y contexto largo. Los números reportados por el autor muestran la progresión: 41,8 de capacidad sin healing, 42,8 con ajuste supervisado de texto (que se estancó), y 47,6 con la destilación KL, frente a 51,8 del original. El cabezal lm_head se recuantizó desde los pesos bf16 con AutoRound (1.000 iteraciones, calibración capturada a través del modelo ya reparado) y conserva un 97,2% de concordancia top-1 con el cabezal bf16, frente al 99,6% del cabezal int8 al que sustituye; al leerse cuatro veces por paso de decodificación, el cambio aporta aproximadamente un 8% de velocidad adicional. El repositorio incluye además dos plantillas de chat opcionales (medium y xhigh) y la tabla n-gram en fp8 usada como memoria externa.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, con etiqueta conversational).
- Razonamiento con modo de pensamiento: la plantilla xhigh inyecta la instrucción de esfuerzo de razonamiento "xhigh"; la variante medium elimina esa inyección y reduce el tiempo y los tokens de benchmark en torno a un 25% con la misma puntuación.
- Control del modo de razonamiento mediante el token especial `<|think_off|>` aceptado en el prompt.
- Uso de herramientas / function calling: las dos plantillas opcionales añaden tres reglas de uso de herramientas; la puntuación medida está entre 85 y 89 (frente a 86 del original, en 3 ensayos).
- Razonamiento multi-paso y agentes: el uso de herramientas se mantiene intacto tras el recorte de expertos, según las mediciones del autor.
- Código y matemáticas: presentes en los 14.667 ejemplos del conjunto de destilación, aunque no se publican puntuaciones específicas por tarea.
- Contexto largo: incluido en el conjunto de healing; la longitud máxima de contexto soportada no se documenta.
- Capacidades multilingües: no disponibles (no se declaran idiomas en el repositorio).
- Visión, audio u otras modalidades: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue on-premise en una sola máquina: el modelo está pensado para ejecutarse en un único DGX Spark (GB10, 128 GB de memoria unificada) con un servidor compatible con OpenAI en el puerto 8000, lo que encaja en equipos que no pueden o no quieren montar un clúster multi-GPU y necesitan ~67-70 tokens/s.
- Agentes con llamadas a herramientas: con una puntuación de uso de herramientas de 85-89 y reglas adicionales en las plantillas medium/xhigh, es adecuado para pipelines de agentes que encadenan búsquedas, ejecución de código o consultas a API en varios pasos.
- Asistentes conversacionales con control de coste por token: al activar 4,8B parámetros por token en lugar de 6,0B y generar a mayor velocidad, reduce el coste por token servido manteniendo el uso de herramientas, lo que permite atender más sesiones concurrentes con el mismo hardware.
- Generación y revisión de código en entornos con requisitos de privacidad: al poder ejecutarse íntegramente en local, el código fuente no sale de la infraestructura; el conjunto de destilación incluye ejemplos de código.
- Razonamiento matemático y resolución de problemas paso a paso: el modo de pensamiento con esfuerzo configurable permite elegir entre la plantilla xhigh (más razonamiento) y la medium (un 25% menos de tokens y tiempo con idéntica puntuación) según la criticidad de la tarea.
- Atención al cliente automatizada con contexto largo: los ejemplos de contexto largo del proceso de healing y la tabla n-gram externa apuntan a conversaciones extensas; la longitud de contexto concreta no está documentada.
- Investigación sobre poda de expertos y destilación: el repositorio es un caso reproducible de recorte top-10→top-5 y reparación mediante autodestilación KL entrenando solo el experto compartido (37,75M parámetros), útil para estudiar el equilibrio entre capacidad y coste de inferencia.
- Evaluación comparativa de cuantizaciones: al incluir cabezal int4 e int8 con métricas de concordancia top-1 (97,2% y 99,6%), sirve como banco de pruebas para medir el impacto de la cuantización del cabezal de salida.

## Benchmarks y rendimiento

Los datos siguientes proceden del arnés propio del autor sobre un único DGX Spark. El propio repositorio advierte de que deben leerse como comparación y no como una entrada de leaderboard. No se publican resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

| Métrica | Este modelo | Original (10 expertos) |
|---|---|---|
| Capacidad (media recortada, 6 ejecuciones) | 47 | 51,8 |
| Uso de herramientas (3 ensayos) | 85-89 | 86 |
| Velocidad de generación | ~67-70 tok/s | ~57 tok/s |
| Parámetros activos | 4,8B | 6,0B |

Progresión del proceso de reparación y de la cuantización del cabezal:

| Configuración | Puntuación de capacidad | Observaciones |
|---|---|---|
| Recorte sin healing | 41,8 | Recorte top-10→top-5 sin reparación |
| Recorte + SFT de texto | 42,8 | Se estanca |
| Recorte + destilación KL (cabezal int8, 6 ejecuciones) | 47,6 | Objetivo de destilación KL |
| Recorte + destilación KL (cabezal int4 enviado, 3 ejecuciones) | 46,6 | Diferencia dentro del ruido; ~8% más de velocidad |
| Modelo original (10 expertos) | 51,8 | Referencia sin recortar |

| Métrica de cuantización | Valor |
|---|---|
| Concordancia top-1 del lm_head int4 frente al bf16 | 97,2% |
| Concordancia top-1 del lm_head int8 sustituido | 99,6% |
| Iteraciones de AutoRound para el lm_head | 1.000 |
| Ejemplos de destilación | 14.667 |
| Parámetros entrenados en el healing | 37,75M (solo el experto compartido) |

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 132,5 GB, de los cuales 49 GB son la tabla ple-table/ en fp8 que se lee desde disco mediante memory map. Descontando la tabla, el peso de los pesos ronda los 83 GB (estimación propia a partir del tamaño declarado del repositorio, no verificada de forma independiente).
- GPU recomendada y validada: una única NVIDIA DGX Spark (GB10) con 128 GB de memoria unificada, donde el autor reporta ~67-70 tokens/s.
- GPU de consumo: no cabe. Incluso una RTX 4090 (24 GB) o una RTX 5090 (32 GB) quedan muy por debajo del espacio necesario para los pesos, y tampoco se ofrece una variante GGUF que pudiera reducir el requisito.
- Opciones de despliegue: vLLM, pero no la versión estándar: la mezcla int4 + fp8 del checkpoint requiere el fork Saren-Arterius/qwen3.8-Flash-DGX-AutoRound. Es necesario apuntar la variable `VLLM_PLE_MMAP_DIR` al directorio `ple-table/`.
- Puesta en marcha automatizada: `git clone https://github.com/azampatti/Qwen3.8-Flash-Next-Int4-FAST.git && cd Qwen3.8-Flash-Next-Int4-FAST && bash setup.sh` construye la imagen de servicio, descarga el repositorio y arranca un servidor compatible con OpenAI en el puerto 8000.
- Otras opciones (llama.cpp, Ollama, TGI): no disponibles en la información proporcionada; no se publican pesos GGUF.
- Latencia y throughput: ~67-70 tokens/s medidos en un DGX Spark con el cabezal int4, frente a los ~57 tokens/s del original con 10 expertos.
- Almacenamiento: al usar memory map sobre la tabla n-gram, conviene almacenamiento local rápido; el repositorio completo requiere al menos 132,5 GB de disco.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Capacidad | Uso de herramientas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| azampatti/Qwen3.8-Flash-Next-125B-A5B-INT4-AutoRound (este) | ~124B | 4,8B | no disponible | 47 | 85-89 | other (qwen) | HuggingFace + repositorio de servicio propio |
| Qwen3.8-Flash-Next original (10 expertos) | no disponible | 6,0B | no disponible | 51,8 | 86 | qwen | HuggingFace (Qwen) |
| Intel/Qwen3.8-Flash-Next-W4A16-AutoRound | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace (Intel); es el modelo base de este checkpoint |
| Checkpoint híbrido de Saren-Arterius | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace / GitHub |

No se han proporcionado datos de otros modelos comparables de la misma categoría (por ejemplo alternativas MoE de ~120B con cuantización int4 para una sola máquina), por lo que la comparativa se limita a los checkpoints de la misma familia.

## Limitaciones y advertencias

- Pérdida de capacidad medible: 47 frente a 51,8 del original con 10 expertos, es decir, alrededor de 4,8 puntos de capacidad general. El recorte a top-5 reduce a la mitad la capacidad experta vista por cada token.
- El uso de herramientas no se degrada según las mediciones (85-89 frente a 86), pero se trata de 3 ensayos: la incertidumbre estadística es alta.
- Los benchmarks son del arnés propio del autor, medidos en un único DGX Spark y con 6 ejecuciones para capacidad y 3 para uso de herramientas. No hay evaluación independiente ni resultados en MMLU, HumanEval o GSM8K.
- Riesgo de alucinación: no documentado en la información disponible; no se han publicado tasas de alucinación ni evaluaciones de veracidad.
- Idiomas soportados y cobertura multilingüe: no disponibles. No se declaran idiomas en el repositorio de HuggingFace.
- Longitud de contexto máxima: no disponible, aunque el proceso de destilación incluyó ejemplos de contexto largo.
- Licencia "other" con license_name "qwen": el uso comercial queda sujeto a los términos de la licencia Qwen, que hay que revisar antes de cualquier despliegue en producción.
- Es un derivado no oficial: el recorte de expertos y el healing los realiza el autor del repositorio (azampatti), no Qwen ni Intel; los checkpoints originales de Qwen, Intel y Saren-Arterius se conservan tal cual en `README_upstream_hybrid.md` y `ple-table/README_upstream_table.md`.
- Dependencia de un fork de vLLM: el vLLM estándar no puede servir el checkpoint por su mezcla int4 + fp8, lo que ata el despliegue al mantenimiento del fork Saren-Arterius/qwen3.8-Flash-DGX-AutoRound y a la variable `VLLM_PLE_MMAP_DIR`.
- Cuantización del cabezal: el lm_head int4 mantiene un 97,2% de concordancia top-1 con el bf16, lo que implica en torno a un 2,8% de discrepancias en el token de salida respecto al cabezal sin cuantizar.
- Memoria externa n-gram: la tabla ple-table/ (49 GB, 51B parámetros en fp8) se lee desde disco por memory map, de modo que el rendimiento depende de la velocidad y el soporte de mmap del almacenamiento.
- Adopción muy baja: 215 descargas y 1 like en el momento de redactar esta ficha, con poca validación por parte de la comunidad.
- Los datos de velocidad y capacidad están medidos específicamente en hardware DGX Spark (GB10, 128 GB); extrapolarlos a otras plataformas no está respaldado por el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/azampatti/Qwen3.8-Flash-Next-125B-A5B-INT4-AutoRound
- Repositorio de servicio y scripts: https://github.com/azampatti/Qwen3.8-Flash-Next-Int4-FAST
- Modelo base en HuggingFace: https://huggingface.co/Intel/Qwen3.8-Flash-Next-W4A16-AutoRound
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen aplicada: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Fork de vLLM para servir el checkpoint híbrido: https://github.com/Saren-Arterius/qwen3.8-Flash-DGX-AutoRound
- Tabla n-gram en fp8: https://huggingface.co/Saren/Qwen3.8-Flash-Next-ple-table-fp8
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente páginas de anuncios sin relación con el contenido técnico.
