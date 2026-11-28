# keptn/nemotron-3.5-bolt-e4b-a4

## Resumen

Nemotron 3.5 Bolt E4B A4 es una cuantizacion de 4 bits del modelo NVIDIA Nemotron 3.5 Bolt E4B, publicada por el usuario keptn para el motor de inferencia radiance sobre GPUs AMD RDNA4. El modelo empaqueta los pesos en un unico fichero de 11,52 GiB en formato propietario `.rad`, combinando cuantizacion GPTQ int4 en las capas feed-forward con el drafter DFlash de NVIDIA para decodificacion especulativa, ademas del torre de vision y el codificador de audio del checkpoint original.

El modelo base es un transformer multimodal de la familia Nemotron de NVIDIA (etiquetado internamente como gemma4 en los tags), con capacidad de procesar texto, imagen y audio, y con un modo de razonamiento ("thinking") desactivable por peticion. La longitud de contexto es de 65.536 tokens, la longitud con la que NVIDIA entreno el checkpoint.

La relevancia de esta ficha es doble: por un lado, documenta una ruta de despliegue eficiente de un modelo multimodal grande en hardware AMD de consumo profesional (Radeon AI PRO R9700 de 32 GB); por otro, el repositorio esta archivado desde el 26 de noviembre de 2026 y el propio autor recomienda migrar a `keptn/nemotron-3.5-bolt-e4b-exl3`, con ficheros mas pequenos y compatible con radiance 2.3.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen, audio) con decodificacion especulativa DFlash; etiquetado como gemma4 en los tags del autor |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el sufijo E4B sugiere un modelo eficiente de ~4B, sin confirmar) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | Feed-forward int4 GPTQ (zero point, una escala f16 por cada 128 pesos); capas 19 a 23 en int8; atencion int8 (una escala bf16 por 128 pesos); activaciones int8 (una escala por token y 128 valores); lm_head int8; drafter int8 (una escala f16 por 128 pesos) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | `.rad` (formato propietario del motor radiance); repo de 36,4 GB; fichero principal de 11,52 GiB |

## Arquitectura y entrenamiento

El checkpoint base es un transformer multimodal de NVIDIA que acepta texto, imagen y audio. La version publicada por keptn no reentrena el modelo: aplica cuantizacion GPTQ int4 a las capas feed-forward (con capas 19 a 23 en int8), cuantiza la atencion y el `lm_head` a int8 con escalas bf16 por bloque de 128 pesos, y mantiene las activaciones en int8 con una escala por token. En decodificacion se materializa una copia f16 de las capas int4 para preservar calidad.

La innovacion principal es la integracion del drafter DFlash de NVIDIA (5 capas, int8, 7 tokens de borrador) para decodificacion especulativa; el drafter fue entrenado con bloques de 8, por lo que 7 tokens es el maximo recomendado. El muestreo por defecto es el de NVIDIA (temperatura 1.0, top_p 0.95) con top_k 64 del checkpoint, y el modo thinking viene desactivado por defecto, como en la plantilla de NVIDIA. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el checkpoint original.

## Capacidades

- Generacion de texto y razonamiento, con modo "thinking" activable por peticion mediante `chat_template_kwargs`.
- Entrada de imagen: el torre de vision del checkpoint procesa imagenes (evaluado sobre DocVQA y AI2D en la model card).
- Entrada de audio: el codificador de audio transcribe voz (evaluado sobre LibriSpeech test-clean, con WER del 6,37 %).
- Procesamiento multimodal conjunto texto-imagen-audio en el pipeline `image-text-to-text`.
- Decodificacion especulativa con drafter DFlash para acelerar la generacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (el modo thinking sugiere capacidad de razonamiento, sin detalle).

## Casos de uso

- Despliegue local en GPUs AMD RDNA4: el fichero `.rad` esta pensado para el motor radiance sobre una Radeon AI PRO R9700 de 32 GB, lo que permite ejecutar un modelo multimodal de 4 bits en hardware AMD profesional sin depender de CUDA.
- Document AI y extraccion de informacion: con el torre de vision y 65.536 tokens de contexto se pueden procesar documentos largos (facturas, contratos, formularios) y hacer preguntas sobre su contenido; la model card reporta 19/20 respuestas identicas al bf16 en DocVQA y AI2D.
- Transcripcion y analisis de audio: el codificador de audio permite transcribir clips de voz (WER 6,37 % en LibriSpeech) e integrarlo en pipelines de actas, subtitulado o analisis de llamadas.
- Asistentes conversacionales multi-turno: con 8 secuencias concurrentes y hasta 524.304 tokens de contexto agregados en una sola tarjeta, es viable atender varias conversaciones largas en paralelo con baja latencia.
- Generacion acelerada en produccion: el drafter DFlash con 7 tokens especulativos ofrece 323,8 tokens/s en decodificacion de un solo stream y 687 tokens/s con 4 streams en una R9700, adecuado para servicios interactivos.
- Prototipado e investigacion multimodal: al ser un unico fichero de 11,52 GiB con calidad cercana al bf16 (KL medio 0,0537 en MT-Bench), sirve para experimentar con modelos multimodales en estaciones de trabajo AMD sin infraestructura de datacenter.
- Evaluacion comparativa de tecnicas de cuantizacion: util para investigadores que quieran medir el impacto de GPTQ int4 + decodificacion especulativa frente al bf16 original usando `--kld-ref` de radiance.

## Benchmarks y rendimiento

Calidad frente al bf16 original (80 preguntas MT-Bench, ambos turnos, thinking off, 42.283 tokens de respuesta):

| Modelo | KL medio | KL percentil 99 | Token top identico | Ratio de perplejidad |
|---|---|---|---|---|
| Este fichero (v2.0) | 0,0537 | 0,705 | 93,6 % | x0,994 |
| Version 1.1 de este fichero | 0,0528 | 0,694 | 93,6 % | x0,992 |
| keptn/nemotron-3.5-bolt-e4b-bf16 | 0,00028 | 0,0035 | 99,5 % | x1,001 |
| keptn/nemotron-3.5-bolt-e4b-i8g | 0,00275 | 0,036 | 98,4 % | x1,000 |

Velocidad en Radeon AI PRO R9700 a 215 W, radiance 2.0.0, KV bf16, 7 tokens de borrador, thinking off (BetterBench 0.6.1, temperatura 0.7, mediana de tokens por segundo):

| Metrica | 1 tarjeta | 2 tarjetas |
|---|---|---|
| Decodificacion, un stream | 323,8 | 374,6 |
| Prefill a 24k tokens | 9.286 | 5.369 |
| 4 streams, total | 687 | 774 |

Fidelidad multimodal (greedy, thinking off, 2 tarjetas):

| Entrada | Casos | Misma respuesta | KL medio | Token top identico |
|---|---|---|---|---|
| Imagenes (DocVQA y AI2D) | 20 | 19/20 | 0,00761 | 69/70 |
| Audio (LibriSpeech test-clean) | 12 | 12/12 | 0,00034 | 347/347 |

WER en audio: HF 6,37 % · radiance 6,37 %.

## Requisitos de hardware

- VRAM: una tarjeta con 32 GB para el fichero de 11,52 GiB mas cache KV; con `max-model-len: 65536` y 8 secuencias la cache KV ocupa 18,24 GiB en una tarjeta o 9,12 GiB por tarjeta en configuracion de 2 GPUs.
- Memoria de host: 8 GiB libres adicionales (el torre de vision puede colocarse en RAM con `vision-tower-placement: ram`).
- GPU probada: Radeon AI PRO R9700 (RDNA4, 32 GB). No hay datos de otras GPU en la informacion disponible.
- Cabe en GPU de consumo: si, en GPUs AMD RDNA4 con 32 GB; no hay datos para GPUs NVIDIA ni para modelos con menos VRAM.
- Despliegue: exclusivamente mediante el motor radiance (imagen Docker `stilldeadcode/radiance:2.0.0` o superior); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Escalado: `tp: 2` o `tp: 4` con `p2p: on`; la configuracion de 4 tarjetas no fue medida en radiance 2.0.
- Latencia y throughput: 323,8 tokens/s en decodificacion de un stream, 9.286 tokens/s de prefill a 24k en una tarjeta y 687 tokens/s agregados con 4 streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| keptn/nemotron-3.5-bolt-e4b-a4 (este) | no disponible | 65.536 | `.rad` int4 GPTQ | openmdw-1.1 | Solo radiance, AMD RDNA4, archivado |
| keptn/nemotron-3.5-bolt-e4b-i8g | no disponible | 65.536 | `.rad` int8 | openmdw-1.1 | Mejor fidelidad (KL 0,00275), mayor tamano |
| keptn/nemotron-3.5-bolt-e4b-bf16 | no disponible | 65.536 | `.rad` bf16 | openmdw-1.1 | Referencia de calidad (KL 0,00028) |
| keptn/nemotron-3.5-bolt-e4b-exl3 | no disponible | no disponible | ExLlama v3 | no disponible | Recomendado por el autor; requiere radiance 2.3.0+ |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio archivado desde el 26 de noviembre de 2026: no recibira actualizaciones; el autor recomienda migrar a `keptn/nemotron-3.5-bolt-e4b-exl3`.
- Calidad degradada frente al bf16: KL medio de 0,0537 y solo el 93,6 % de tokens top coincidentes en MT-Bench; inaceptable para tareas que exijan fidelidad casi exacta al modelo original.
- Dependencia total del motor radiance y del hardware AMD RDNA4: no hay soporte documentado para CUDA, llama.cpp, vLLM ni otras plataformas.
- La configuracion de 4 tarjetas no fue medida en radiance 2.0.
- NVIDIA lista el texto como unica entrada oficial del modelo; el torre de vision y el codificador de audio provienen del checkpoint y su soporte no esta garantizado por el fabricante.
- Contexto limitado a 65.536 tokens, la longitud de entrenamiento; no se debe exceder.
- Idiomas soportados no documentados; riesgo de rendimiento deficiente fuera del ingles.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Licencia openmdw-1.1: es responsabilidad del usuario revisar los terminos para uso comercial; la model card la etiqueta como "other".

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-a4
- Modelo base bf16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo base DFlash: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Version bf16 de keptn: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-bf16
- Version int8 de keptn: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-i8g
- Version recomendada (ExLlama v3): https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-exl3
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Guia Docker de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it
