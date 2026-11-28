# keptn/nemotron-3.5-bolt-e4b-i8g

## Resumen

Nemotron 3.5 Bolt E4B i8g es una conversión cuantizada a int8 del modelo multimodal NVIDIA Nemotron 3.5 Bolt E4B, publicada por el usuario keptn para el motor de inferencia radiance sobre GPUs AMD RDNA4. El modelo original lo desarrolla NVIDIA y se distribuye bajo licencia OpenMDW-1.1. Esta variante empaqueta el tronco del transformer en int8 (W8A8) junto con el drafter DFlash de NVIDIA para decodificación especulativa, la torre de visión en bf16 y el codificador de audio, todo en un único fichero de 12,85 GiB.

La relevancia de esta ficha es doble. Por un lado, demuestra que es posible ejecutar un modelo multimodal con visión, audio y razonamiento en una sola GPU de consumo profesional AMD (probado en una Radeon AI PRO R9700 de 32 GB) con velocidades de decodificación de 289,5 tokens por segundo en un solo stream. Por otro, documenta con métricas de divergencia KL frente al original en bf16 (KL media de 0,00275 sobre 42.283 tokens de respuesta en MT-Bench), lo que permite evaluar la pérdida de calidad de la cuantización con rigor.

El repositorio está **archivado desde el 26 de noviembre de 2026** y el propio autor recomienda migrar a `keptn/nemotron-3.5-bolt-e4b-exl3`, con ficheros más pequeños y misma calidad, para radiance 2.3.0 o superior. La arquitectura subyacente es un transformer con mezcla de expertos (el sufijo E4B sugiere expertos activos de 4B, aunque el dato exacto de parámetros totales no está disponible en la información proporcionada), contexto de 65.536 tokens y soporte de entradas de texto, imagen y audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tronco cuantizado int8; incluye torre de visión bf16, codificador de audio y drafter DFlash |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el nombre E4B sugiere ~4B activos, sin confirmar) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | int8 W8A8 en el tronco (escala bf16 por cada 128 pesos); lm_head int8; drafter int8 con escala f16 por 128 pesos; activaciones bf16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.rad` (formato propietario del motor radiance), fichero único de 12,85 GiB |
| Entradas | Texto, imagen, audio |
| Motor de inferencia | radiance 2.0.0 o superior (Docker `stilldeadcode/radiance:2.0.0`) |
| Hardware probado | Radeon AI PRO R9700 (32 GB), 1 y 2 tarjetas |
| Decodificación especulativa | Drafter DFlash de NVIDIA, 5 capas, 7 tokens de borrador (entrenado con bloques de 8) |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Nemotron 3.5 Bolt E4B, un transformer con mezcla de expertos post-entrenado por NVIDIA a partir de un modelo de la familia Gemma (la model card cita "post-trained from Goog..." truncado, y las etiquetas incluyen `gemma4`). La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El contexto de 65.536 tokens corresponde, según la model card, a la longitud con la que NVIDIA entrenó el modelo.

La innovación técnica principal de esta variante es la integración de decodificación especulativa mediante el drafter DFlash de NVIDIA, un modelo auxiliar de 5 capas que propone 7 tokens por paso y que se ejecuta en int8 con escalas f16. El tronco usa cuantización W8A8 con una escala bf16 por cada 128 pesos en todas las capas lineales, mientras que las activaciones se cuantizan con una escala por token y por cada 128 valores. La torre de visión y el codificador de audio se mantienen en bf16 para preservar la calidad multimodal. El motor radiance gestiona la caché KV en bf16 y permite despliegue con paralelismo tensorial (`tp: 1`, `tp: 2`, `tp: 4`).

## Capacidades

- Generación de texto y razonamiento, con modo "thinking" desactivable por petición mediante `chat_template_kwargs` (`enable_thinking: true`).
- Procesamiento de imágenes (pipeline `image-text-to-text`): respuesta a preguntas sobre documentos y diagramas, con torre de visión bf16.
- Procesamiento de audio: transcripción y comprensión de clips de voz (evaluado en LibriSpeech test-clean con un WER del 6,37 %).
- Razonamiento multimodal combinado: texto, imagen y audio en la misma petición.
- Decodificación especulativa con drafter DFlash para acelerar la generación.
- Soporte de conversaciones multi-turno con hasta 65.536 tokens de contexto y 8 secuencias concurrentes.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo thinking sugiere capacidad de razonamiento extendido.

## Casos de uso

- **Atención al cliente multimodal**: el modelo puede gestionar conversaciones multi-turno con capturas de pantalla o documentos adjuntos gracias a sus 65.536 tokens de contexto y a la torre de visión, manteniendo hasta 8 sesiones concurrentes por instancia.
- **Transcripción y análisis de audio**: con un WER del 6,37 % en LibriSpeech test-clean, es adecuado para pipelines de transcripción de reuniones o notas de voz integrados en aplicaciones de productividad.
- **Procesamiento de documentos escaneados**: la evaluación en DocVQA y AI2D (19 de 20 respuestas idénticas al original bf16) respalda su uso en extracción de información de formularios, facturas y diagramas técnicos.
- **Asistente de razonamiento con modo thinking**: activando `enable_thinking` por petición, se puede usar para tareas de análisis que requieren cadena de razonamiento, desactivándolo en consultas simples para reducir latencia.
- **Despliegue en infraestructura AMD**: organizaciones con GPUs RDNA4 (por ejemplo, estaciones de trabajo con Radeon AI PRO R9700) pueden servir el modelo en local sin depender de CUDA, con 289,5 tokens/s en decodificación de un stream.
- **Servicio de alto throughput**: con 4 streams concurrentes alcanza 732 tokens/s totales en una tarjeta y 828 en dos, adecuado para APIs internas de generación con varios usuarios simultáneos.
- **Prototipado e investigación multimodal**: el formato de fichero único y la configuración YAML simplificada facilitan experimentos reproducibles con métricas de divergencia KL frente al original.

## Benchmarks y rendimiento

Rendimiento de velocidad (Radeon AI PRO R9700 a 215 W, radiance 2.0.0, KV bf16, 7 tokens de borrador, thinking desactivado, BetterBench 0.6.1, temperatura 0,7, mediana de tokens por segundo):

| Metrica | 1 tarjeta | 2 tarjetas |
|---|---|---|
| Decodificación, un stream | 289,5 tok/s | 411,0 tok/s |
| Prefill a 24k tokens | 9.004 tok/s | 5.355 tok/s |
| 4 streams, total | 732 tok/s | 828 tok/s |

Calidad frente al original bf16 (80 preguntas MT-Bench, ambos turnos, 42.283 tokens de respuesta, thinking desactivado):

| Modelo | KL media | KL percentil 99 | Token top idéntico | Ratio de perplejidad |
|---|---|---|---|---|
| Este fichero (i8g) | 0,00275 | 0,036 | 98,4 % | ×1,000 |
| keptn/nemotron-3.5-bolt-e4b-a4 | 0,0537 | 0,705 | 93,6 % | ×0,994 |
| keptn/nemotron-3.5-bolt-e4b-bf16 | 0,00028 | 0,0035 | 99,5 % | ×1,001 |

Calidad multimodal (greedy, thinking desactivado, 2 tarjetas, radiance 1.15.1):

| Entrada | Casos | Respuesta idéntica | KL media | Token top idéntico |
|---|---|---|---|---|
| Imágenes (DocVQA y AI2D) | 20 | 19/20 | 0,00761 | 69/70 |
| Audio (LibriSpeech test-clean) | 12 | 12/12 | 0,00034 | 347/347 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM**: el fichero de pesos ocupa 12,85 GiB. Con contexto completo de 65.536 tokens y 8 secuencias, la caché KV consume 18,24 GiB en una tarjeta o 9,12 GiB por tarjeta en configuración de 2 GPUs. Se necesita una tarjeta de 32 GB (probado en Radeon AI PRO R9700) y 8 GiB de memoria de host libre.
- **GPU recomendadas**: Radeon AI PRO R9700 (RDNA4) es la única validada explícitamente. El motor radiance está orientado a AMD ROCm/RDNA4; no se documenta soporte para NVIDIA A100, H100 o RTX 4090 en esta ficha.
- **Consumer GPU**: no hay datos que confirmen su funcionamiento en GPUs de consumo convencionales; los 32 GB de VRAM y la dependencia de radiance limitan el despliegue a hardware AMD RDNA4 de gama profesional.
- **Opciones de despliegue**: exclusivamente el motor radiance (imagen Docker `stilldeadcode/radiance:2.0.0` o superior). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato `.rad` es propietario.
- **Latencia y throughput**: 289,5 tok/s de decodificación en un stream con una tarjeta; 9.004 tok/s de prefill a 24k tokens; 732 tok/s agregados con 4 streams. El paralelismo tensorial a 2 tarjetas mejora la decodificación (411 tok/s) pero reduce el prefill (5.355 tok/s).
- **Configuración**: `tp: 1` por defecto; `tp: 2` o `tp: 4` con `p2p: on` para múltiples tarjetas. Cuatro tarjetas no se midieron en radiance 2.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Calidad (KL media vs bf16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| keptn/nemotron-3.5-bolt-e4b-i8g (este) | no disponible | 65.536 | `.rad` int8, 12,85 GiB | 0,00275 | OpenMDW-1.1 | Archivado; sustituido por exl3 |
| keptn/nemotron-3.5-bolt-e4b-bf16 | no disponible | 65.536 | `.rad` bf16 | 0,00028 (referencia) | OpenMDW-1.1 | Disponible |
| keptn/nemotron-3.5-bolt-e4b-a4 | no disponible | 65.536 | `.rad` (cuantización a4) | 0,0537 | OpenMDW-1.1 | Disponible |
| keptn/nemotron-3.5-bolt-e4b-exl3 | no disponible | 65.536 | `.rad` EXL3 | no disponible | OpenMDW-1.1 | Recomendado por el autor |

La comparativa se limita a las variantes del mismo modelo base publicadas por el mismo autor, ya que la información disponible no incluye datos de modelos de otros desarrolladores con los que contrastar.

## Limitaciones y advertencias

- **Repositorio archivado**: no recibirá más actualizaciones desde el 26 de noviembre de 2026. El autor recomienda migrar a `keptn/nemotron-3.5-bolt-e4b-exl3`, con ficheros más pequeños y misma calidad, para radiance 2.3.0 o superior.
- **Dependencia de un motor específico**: el formato `.rad` solo se ejecuta en radiance sobre AMD RDNA4; no es portable a vLLM, llama.cpp, Ollama ni TGI, lo que limita la integración en infraestructuras existentes.
- **Pérdida de calidad por cuantización**: aunque pequeña, la KL media de 0,00275 implica que el 1,6 % de los tokens top difieren del original bf16; en tareas de alta precisión conviene validar contra el modelo bf16.
- **Contexto limitado a 65.536 tokens**: es la longitud de entrenamiento de NVIDIA; no se documenta extrapolación más allá.
- **Idiomas no documentados**: no hay información sobre cobertura multilingüe, lo que impide garantizar calidad fuera del inglés sin evaluación previa.
- **Sesgos y alucinaciones**: no se documentan análisis de sesgo ni tasas de alucinación en la información proporcionada; como todo modelo generativo, requiere validación en producción.
- **Licencia OpenMDW-1.1**: es necesario revisar los términos del fichero LICENSE del repositorio antes de uso comercial, ya que la model card solo enlaza al texto sin resumir restricciones.
- **Soporte multimodal heredado**: NVIDIA lista solo texto como entrada del modelo; la torre de visión y el codificador de audio provienen del checkpoint y su comportamiento en producción no está avalado explícitamente por el autor original.
- **Cuatro tarjetas sin medir**: la configuración `tp: 4` no se validó en radiance 2.0, por lo que su rendimiento y estabilidad son desconocidos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-i8g
- Modelo base bf16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo base con DFlash: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Variante recomendada (EXL3): https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-exl3
- Variante bf16 de keptn: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-bf16
- Variante a4 de keptn: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-a4
- Motor radiance (repositorio): https://codeberg.org/StillDeadcode/radiance
- Guía Docker de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it
