# ndaly/Nemotron-3.5-Super-VL-120B-A12B-BF16

## Resumen

Nemotron-3.5-Super-VL-120B-A12B-BF16 es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por NVIDIA, con 120.000 millones de parámetros totales y 12.000 millones activos por token. Combina 40 capas Mamba-2, 40 capas MoE (512 expertos, de los cuales 22 más uno compartido se activan por token) y 8 capas de atención, con una longitud de contexto de 1.048.576 tokens. Esta ficha corresponde al paquete publicado por el usuario `ndaly`, que redistribuye los pesos originales de NVIDIA sin modificarlos para su despliegue sobre hardware Tenstorrent p300x2 mediante vLLM.

El paquete está pensado para servir únicamente la parte textual del modelo multimodal original: no acepta entrada de imagen ni de audio. Ofrece una API compatible con OpenAI (chat completions, completions y `/v1/models`) y dos perfiles de servicio: uno por defecto con el modo de razonamiento desactivado y otro (`reasoning`) que lo activa y separa el texto de pensamiento del contenido de respuesta.

Su relevancia actual radica en dos aspectos: por un lado, la arquitectura híbrida Mamba-2/MoE/atención con contexto de un millón de tokens y solo 12.000 millones de parámetros activos; por otro, la disponibilidad de un paquete de despliegue reproducible sobre aceleradores Tenstorrent, una alternativa no-NVIDIA para inferencia de modelos de gran tamano. La licencia es OpenMDW 1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 40 capas Mamba-2 + 40 capas MoE + 8 capas de atención |
| Parametros totales | 120B |
| Parametros activos | 12B por token (22 expertos + 1 compartido de 512) |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | BF16 (pesos del checkpoint); no se documentan otras cuantizaciones en la información disponible |
| Idiomas soportados | Multilingüe (evaluado en MMLU-ProX con 29 idiomas y MMMLU con 14 idiomas); lista completa no disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | Checkpoint original de NVIDIA (safetensors) descargado desde el repositorio base; el paquete genera una caché de pesos convertidos para la malla p300x2 |
| Hardware objetivo | Tenstorrent p300x2 (malla P300x2) |
| Servidor de inferencia | vLLM con plugin de Tenstorrent, API compatible con OpenAI en el puerto 20000 |
| Concurrencia máxima | 32 secuencias (`max_num_seqs`) |
| Tamano del repo | 1,4 GB (el checkpoint completo se descarga aparte: 249 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer híbrido que intercala 40 capas Mamba-2 (modelo de espacio de estados) con 40 capas de mezcla de expertos y 8 capas de atención clásica. La capa MoE dispone de 512 expertos, de los que se activan 22 más un experto compartido por token, lo que da lugar a 12.000 millones de parámetros activos sobre un total de 120.000 millones. Esta combinación busca reducir el coste de inferencia frente a un modelo denso del mismo tamano, manteniendo la capacidad de representación, y permite sostener un contexto de 1.048.576 tokens.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; la model card del paquete remite explícitamente a la model card original de NVIDIA para los detalles de entrenamiento y evaluación. El paquete de `ndaly` no modifica los pesos: fija el snapshot `fb0ee0bc6b3f70342afd8d84cb80dbadbaa8a1fe` del repositorio `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16` y añade un manifiesto (esquema 5.1) generado con `tt-model-manager` 0.1.0, junto con la compilación de kernels y la conversión de pesos para la malla P300x2. La innovación técnica destacable en este paquete es el soporte de un modo de razonamiento con parser `deepseek_r1` que separa el texto de pensamiento (`reasoning`) de la respuesta (`content`).

## Capacidades

- Generación de texto y razonamiento de propósito general, con modo de razonamiento opcional para matemáticas, código y problemas de formato largo.
- Respuesta a preguntas multilingüe: evaluado en MMLU-ProX (29 idiomas) y MMMLU (14 idiomas).
- Generación de código, con resultados publicados en LiveCodeBench v6 (pass@1).
- Razonamiento matemático, con resultados en AIME 2024 y AIME 2025.
- Contexto muy largo: hasta 1.048.576 tokens, adecuado para documentos extensos o conversaciones de muchas vueltas.
- API compatible con OpenAI: chat completions, completions y `/v1/models`.
- Streaming de respuestas, `logprobs` / `top_logprobs`, `seed`, `min_tokens`, `ignore_eos` y penalizaciones de repetición, presencia y frecuencia.
- Modo de razonamiento con dos perfiles: `default` (pensamiento desactivado, activable por petición con `chat_template_kwargs`) y `reasoning` (pensamiento activado por defecto y separado en `message.reasoning`).
- Sin soporte de tool calling ni function calling en este paquete: no hay parser de llamadas a herramientas configurado y las definiciones se renderizan por plantilla, pero la respuesta es texto plano.
- Sin entrada de imagen ni de audio: este paquete sirve únicamente el backbone textual del modelo multimodal original.

## Casos de uso

- Asistente conversacional de contexto largo: con 1.048.576 tokens de ventana, el modelo puede mantener conversaciones multi-turno con historiales extensos o incorporar documentos completos sin truncar, lo que resulta adecuado para atención al cliente con base de conocimiento adjunta.
- Análisis de documentación técnica extensa: contratos, normativa o manuales de cientos de miles de tokens pueden procesarse en una sola petición, evitando pipelines de troceado y recuperación.
- Generación de código en pipelines internos: el modelo obtiene 65,79 de pass@1 en LiveCodeBench v6 (muestra del 25 % de los problemas) y puede integrarse como servicio OpenAI-compatible para autocompletado, revisión o generación de tests, siempre que el orquestador gestione las llamadas a herramientas fuera del modelo.
- Resolución de problemas matemáticos y de razonamiento formal: con el perfil `reasoning` y presupuestos de generación de 65.536 tokens, alcanza 83,33 de exact match en AIME 2025 y 70,00 en AIME 2024, útil en entornos educativos o de verificación de cálculos.
- Atención multilingüe: al estar evaluado en 29 idiomas (MMLU-ProX) y 14 idiomas (MMMLU), puede desplegarse como servicio de preguntas y respuestas para usuarios de distintas lenguas, con la advertencia de que el extractor por idioma puede infravalorar respuestas formuladas en inglés.
- Despliegue sobre hardware no-NVIDIA: el paquete está empaquetado para Tenstorrent p300x2 con vLLM, lo que permite servir un modelo de 120B en infraestructura alternativa a GPU, con hasta 32 usuarios concurrentes.
- Evaluación y benchmarking reproducible: el manifiesto fija el snapshot de pesos y los perfiles de servicio, lo que facilita replicar mediciones internas sobre el mismo checkpoint.

## Benchmarks y rendimiento

| Evaluación | Este paquete | Model card original | Prompts | Notas |
|---|---|---|---|---|
| MMLU-ProX (29 idiomas) | 57,48 | 76,91 | 3.422 | Razonamiento activado, presupuesto 8.192 tokens, muestra del 1 % con semilla; 141 respuestas vacías por agotar presupuesto; el extractor por idioma falla en 984 respuestas (29 %) formuladas en inglés; con la frase inglesa aceptada: 72,68 |
| LiveCodeBench v6, pass@1 | 65,79 | 88,22 | 114 | Razonamiento activado, presupuesto 65.536 tokens, muestra del 25 % de los problemas de 2024-08 a 2025-04; 13 respuestas vacías |
| AIME 2025, exact match | 83,33 | no disponible | 30 | Razonamiento activado, presupuesto 65.536 tokens |
| AIME 2024, exact match | 70,00 | no disponible | 30 | Razonamiento activado, presupuesto 65.536 tokens; 6 respuestas vacías |
| MMMLU (14 idiomas) | 75,22 | no disponible | 2.954 | Razonamiento activado, presupuesto 8.192 tokens, muestra del 1,5 % por idioma con semilla; 178 de 2.954 respuestas vacías (dato truncado en la información disponible) |

Las diferencias frente a la model card original se explican en parte por el uso de muestras reducidas, el agotamiento del presupuesto de generación en algunas respuestas y las limitaciones del extractor automático, no necesariamente por una degradación del modelo.

## Requisitos de hardware

- Hardware objetivo: Tenstorrent p300x2 (malla P300x2); no se documenta despliegue en GPU en este paquete.
- VRAM estimada: no aplica directamente; el checkpoint completo ocupa 249 GB en la caché de Hugging Face y la caché de pesos convertidos añade unos 180 GB en el primer arranque.
- RAM de host: 64 GB o más, ya que el primer arranque transmite todos los shards del checkpoint por memoria de host.
- Almacenamiento: 249 GB para el checkpoint más unos 180 GB para la caché de conversión.
- GPU recomendadas: no disponibles para este paquete; el despliegue documentado es sobre Tenstorrent p300x2.
- ¿Cabe en GPU de consumo? No hay información que lo respalde; el tamano del checkpoint (249 GB en BF16) descarta GPUs de consumo convencionales sin cuantización, y no se documentan cuantizaciones alternativas.
- Opciones de despliegue: `tt serve ndaly/Nemotron-3.5-Super-VL-120B-A12B-BF16` (con Tenstorrent CLI) o `tt-model serve` sin CLI; servidor vLLM con plugin de Tenstorrent en el puerto 20000.
- Latencia y throughput: no disponibles. El primer arranque compila kernels para el dispositivo y tarda varios minutos; los arranques posteriores reutilizan la caché.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Despliegue documentado |
|---|---|---|---|---|---|
| Nemotron-3.5-Super-VL-120B-A12B-BF16 (este paquete) | 120B | 12B | 1.048.576 | OpenMDW 1.1 | Tenstorrent p300x2 con vLLM |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 (original) | 120B | 12B | 1.048.576 | OpenMDW 1.1 | No disponible en la información proporcionada |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada; no se aportan cifras de rendimiento de terceros para evitar datos no verificados.

## Limitaciones y advertencias

- El paquete sirve solo el backbone textual: no procesa imágenes ni audio, pese a que el modelo original es multimodal.
- No soporta tool calling ni function calling: las definiciones de herramientas se renderizan por plantilla, pero la respuesta es texto plano, lo que limita su uso en agentes que dependan de llamadas estructuradas.
- En el perfil `default` el razonamiento está desactivado y, si se activa por petición, el pensamiento llega inline en `content` cerrado por `</think>`, sin separación estructurada.
- Riesgo de agotamiento del presupuesto de generación: en las evaluaciones publicadas hay respuestas vacías (141 de 3.422 en MMLU-ProX, 13 de 114 en LiveCodeBench v6, 6 de 30 en AIME 2024), lo que puede traducirse en respuestas incompletas en producción si el presupuesto es ajustado.
- El extractor por idioma de MMLU-ProX infravalora el rendimiento cuando el modelo responde en inglés; conviene validar con extractores propios antes de sacar conclusiones sobre calidad multilingüe.
- Los resultados publicados proceden de muestras reducidas con semilla, no del conjunto completo, por lo que no son directamente comparables con las cifras de la model card original.
- No se documentan sesgos conocidos, datos de entrenamiento ni composición del dataset en la información disponible; la evaluación de sesgos queda pendiente.
- Licencia OpenMDW 1.1: deben revisarse sus términos antes de un uso comercial; la información proporcionada no detalla restricciones adicionales.
- Requisitos de infraestructura elevados: hardware Tenstorrent p300x2, 249 GB de checkpoint, 180 GB de caché de conversión y 64 GB de RAM de host como mínimo.
- El primer arranque tarda varios minutos por la compilación de kernels; hay que planificar el arranque en frío en despliegues con requisitos de disponibilidad estrictos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el paquete está generado con una versión temprana de `tt-model-manager` (0.1.0, esquema 5.1); conviene verificar la reproducibilidad del manifiesto.

## Enlaces

- Repositorio del paquete: https://huggingface.co/ndaly/Nemotron-3.5-Super-VL-120B-A12B-BF16
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Herramienta de empaquetado tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Requisitos previos de Tenstorrent CLI: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Snapshot de pesos fijado: `fb0ee0bc6b3f70342afd8d84cb80dbadbaa8a1fe`
