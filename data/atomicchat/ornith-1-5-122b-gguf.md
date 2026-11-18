# AtomicChat/Ornith-1.5-122B-GGUF

## Resumen
Ornith-1.5-122B es un modelo multimodal de tipo image-text-to-text desarrollado por ornith-ai, distribuido en formato GGUF por AtomicChat para su uso con llama.cpp. Con 124.635.206.144 parámetros totales (aproximadamente 124,6 mil millones), se posiciona en la gama alta de modelos abiertos con capacidad de procesamiento de imágenes y texto. La versión aquí descrita es una cuantización comunitaria con licencia MIT, pensada para despliegue local en hardware de gama alta.

AtomicChat publica doce variantes de cuantización con un esquema propio denominado Atomic Dynamic (AD), que asigna tipos de cuantización distintos a los grupos de tensores más grandes (`ffn_down` y `ffn_up`). Cada archivo incluye una matriz de importancia (imatrix) generada a partir de un corpus de calibración público, y el autor reporta métricas medidas de divergencia KL y coincidencia top-1 frente a los pesos originales, lo que permite elegir el compromiso tamaño-fidelidad con datos verificables.

El modelo incluye una cabeza de predicción multi-token (MTP) integrada en los propios archivos, lo que habilita decodificación especulativa sin descarga adicional, y un cabezal de pensamiento (thinking mode) activado por defecto. Su relevancia actual radica en que ofrece capacidades multimodales y de razonamiento en un paquete ejecutable localmente con llama.cpp, con cuantizaciones que van desde 132,6 GB hasta 35,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer multimodal image-text-to-text; familia referida como `qwen35moe` en llama.cpp) |
| Parametros totales | 124.635.206.144 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como cifra oficial; la model card cita ejemplos de hasta contexto completo con 192 GiB o más, y estimaciones de 112k a 344k según memoria disponible |
| Tipos de cuantizacion | Q8_0, AD-Q6_K, AD-Q6_K-Q5_K, AD-Q5_K-Q4_K, AD-Q5_K-IQ4_XS, AD-Q4_K-IQ4_XS, AD-IQ4_XS-IQ3_S, AD-IQ3_S-IQ3_XXS, AD-IQ3_XXS-IQ2_S, AD-IQ2_S-IQ2_XS, AD-IQ2_XS-IQ2_XXS, AD-IQ2_XXS-IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); proyector visual separado en F16 y BF16 |

## Arquitectura y entrenamiento
La información disponible no detalla la arquitectura interna más allá de su naturaleza multimodal (pipeline image-text-to-text) y de la referencia en la documentación de llama.cpp al tipo `qwen35moe`, lo que sugiere una arquitectura de mezcla de expertos (MoE). No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se documenta el contexto máximo nativo del modelo original.

La innovación técnica más destacable en esta distribución es la inclusión de una cabeza de predicción multi-token (MTP) dentro de cada archivo GGUF, que permite decodificación especulativa con `--spec-type draft-mtp` en llama.cpp. El autor reporta que, en el modelo hermano Ornith 1.5 35B-A3B, esta técnica aumentó la velocidad de generación entre un 18 % y un 35 %, con una tasa de aceptación de tokens especulados del 59 % al 62 %; no se han medido aún estos valores en el 122B. La cabeza se almacena en q8_0 en los archivos grandes, q5_k en los intermedios y q4_k en los pequeños. Adicionalmente, las cuantizaciones AD emplean una matriz de importancia propia sobre un corpus de calibración público, con métricas de divergencia KL y top-1 publicadas por archivo.

## Capacidades
- Generación de texto conversacional multi-turno, con plantilla de chat incluida en cada archivo GGUF.
- Comprensión de imágenes (image-text-to-text) mediante un proyector visual separado (`mmproj-Ornith-1.5-122B-F16.gguf` o `BF16`).
- Modo de razonamiento (thinking) activado por defecto, desactivable por petición mediante `chat_template_kwargs` con `enable_thinking: false`.
- Decodificación especulativa mediante cabeza MTP integrada, sin descarga adicional.
- Compatibilidad con endpoints estilo OpenAI a través de `llama-server` (`/v1/chat/completions`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso
- Asistente conversacional local con privacidad total: desplegado con `llama-server` en una estación de trabajo con 64-128 GiB de memoria unificada o VRAM, el modelo gestiona conversaciones multi-turno sin enviar datos a servicios externos, gracias a la plantilla de chat integrada y a la licencia MIT.
- Análisis de documentos con imágenes: usando el proyector visual F16 junto con una cuantización AD-Q4_K-IQ4_XS (71,2 GB), se pueden procesar capturas, diagramas o páginas escaneadas y generar descripciones o extracciones en texto dentro del mismo flujo.
- Razonamiento asistido con modo thinking: para tareas que requieren cadenas de razonamiento largas (análisis de código, planificación), se activa el modo thinking por defecto y se ajusta el muestreo recomendado (temperatura 0,6, top-k 20, top-p 0,95) para obtener respuestas más deliberadas.
- Generación acelerada en producción local: activando `--spec-type draft-mtp` se aprovecha la cabeza MTP para reducir la latencia de generación; en el modelo hermano 35B-A3B el autor midió incrementos de velocidad del 18 % al 35 %, lo que lo hace adecuado para servicios de inferencia en una sola máquina.
- Evaluación e investigación de cuantizaciones: los archivos con métricas KL y top-1 publicadas y el repositorio de logs permiten reproducir estudios sobre el impacto de la cuantización en modelos de más de 100B, comparando doce variantes con datos medidos.
- Despliegue en estaciones Mac de gama alta: en un Mac de 128 GB, con `sudo sysctl iogpu.wired_limit_mb=118000`, se puede ejecutar AD-Q6_K (97 GiB) y mantener contexto amplio, lo que sirve para prototipado y demos sin GPU dedicada.
- Chat multimodal en aplicaciones de escritorio: la integración con Atomic Chat y la compatibilidad con la API de llama.cpp facilitan incorporar el modelo a clientes de escritorio que acepten endpoints compatibles con OpenAI.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí publica métricas de fidelidad de cuantización medidas frente a los pesos originales:

| Archivo | Tamano | Divergencia KL | top-1 |
|---|---:|---:|---:|
| Q8_0 | 132,6 GB | 0,00962 | 96,28 % |
| AD-Q6_K | 104,5 GB | 0,01086 | 96,02 % |
| AD-Q6_K-Q5_K | 93,3 GB | 0,01326 | 95,53 % |
| AD-Q5_K-Q4_K | 78,5 GB | 0,02222 | 94,19 % |
| AD-Q5_K-IQ4_XS | 76,0 GB | 0,02323 | 94,05 % |
| AD-Q4_K-IQ4_XS | 71,2 GB | 0,02739 | 93,52 % |
| AD-IQ4_XS-IQ3_S | 62,2 GB | 0,05311 | 90,96 % |
| AD-IQ3_S-IQ3_XXS | 54,3 GB | 0,08212 | 88,84 % |
| AD-IQ3_XXS-IQ2_S | 47,6 GB | 0,13030 | 86,05 % |
| AD-IQ2_S-IQ2_XS | 42,8 GB | 0,18881 | 83,33 % |
| AD-IQ2_XS-IQ2_XXS | 39,2 GB | 0,23616 | 81,23 % |
| AD-IQ2_XXS-IQ1_M | 35,0 GB | 0,35296 | 77,18 % |

## Requisitos de hardware
- VRAM/memoria unificada mínima: 48 GiB para AD-IQ3_XXS-IQ2_S (47,6 GB en disco), con espacio para unos 112k de contexto; 64 GiB para AD-IQ4_XS-IQ3_S (unos 216k de contexto); 80 GiB para AD-Q5_K-Q4_K (unos 248k); 96 GiB para AD-Q6_K-Q5_K (unos 344k); 128 GiB para Q8_0 (unos 144k); 192 GiB o más para Q8_0 con contexto completo.
- Caché de atención: 24 KB por token, es decir, 0,2 GB a 8k de contexto y 0,8 GB a 32k; hay que presupuestarlo aparte del peso del modelo.
- GPUs recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090); los requisitos publicados se expresan en GiB de memoria de GPU o unificada. Una RTX 4090 (24 GB) no puede alojar ninguna de las cuantizaciones publicadas.
- Mac: en 128 GB el máximo práctico es AD-Q6_K (97 GiB) tras elevar el límite con `sudo sysctl iogpu.wired_limit_mb=118000`; en 64 GB se recomienda AD-IQ3_XXS-IQ2_S.
- Despliegue: llama.cpp (`llama-server`), con `-ngl 99` para descargar todas las capas en GPU; se requiere una versión reciente con soporte de MTP para `qwen35moe`, ya que compilaciones sin ese soporte pueden rechazar los archivos que incluyen la cabeza. También se ofrece la aplicación Atomic Chat.
- Proyector visual: archivo `mmproj-Ornith-1.5-122B-F16.gguf` (o BF16), compartido por todas las cuantizaciones.
- Latencia y throughput: no medidos en el 122B; en el 35B-A3B de la misma familia, la cabeza MTP aportó entre un 18 % y un 35 % más de velocidad de generación con un 59-62 % de tokens aceptados.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones de contexto nativo que permitan una comparación rigurosa con alternativas concretas. La información proporcionada solo permite comparar internamente entre el 122B y su hermano de familia:

| Modelo | Parametros | Contexto | MTP | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-122B (esta ficha) | 124.635.206.144 | no disponible | Si, integrada | MIT | GGUF |
| Ornith-1.5-35B-A3B | no disponible (MoE, 3B activos segun nombre) | no disponible | Si, integrada | no disponible | GGUF |

## Limitaciones y advertencias
- La cuantización más pequeña (AD-IQ2_XXS-IQ1_M, 35,0 GB) es un archivo de investigación: solo coincide con la palabra siguiente del modelo original el 77,18 % de las veces, por lo que no es apta para producción.
- Las cuantizaciones por debajo de AD-IQ3_S-IQ3_XXS presentan divergencias KL superiores a 0,05 y top-1 por debajo del 91 %, con degradación notable de la fidelidad.
- No hay información publicada sobre sesgos, tasas de alucinación ni comportamiento en idiomas distintos del inglés; la lista de idiomas soportados no está disponible.
- El contexto máximo nativo no está documentado; las cifras de contexto de la model card son estimaciones de espacio restante según memoria, no límites arquitectónicos confirmados.
- La licencia MIT permite uso comercial, pero se aplica a esta distribución GGUF; conviene verificar la licencia de los pesos originales de ornith-ai/Ornith-1.5-122B, no incluida en la información.
- El modelo requiere hardware de gama muy alta: ninguna cuantización cabe en GPUs de consumo de 24 GB, y el mínimo práctico son 48 GiB de memoria.
- El rendimiento de la decodificación especulativa MTP no se ha medido en el 122B; los porcentajes citados provienen del modelo 35B-A3B y no son extrapolables.
- Es necesario usar una versión reciente de llama.cpp con soporte MTP para `qwen35moe`; versiones antiguas pueden fallar al cargar los archivos.
- El modo thinking está activado por defecto, lo que incrementa el consumo de tokens si no se desactiva explícitamente por petición.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Ornith-1.5-122B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Métricas de cuantización (logs): https://huggingface.co/datasets/AtomicChat/Ornith-1.5-122B-GGUF-metrics
- Corpus de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Atomic Chat: https://atomic.chat/?utm_source=huggingface&utm_medium=referral&utm_campaign=hf_ornith_1_5_122b&utm_content=btn_atomic
- Discord de AtomicChat: https://discord.gg/8wGSsvmg4V
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X (Twitter) de AtomicChat: https://x.com/atomic_chat_hq
