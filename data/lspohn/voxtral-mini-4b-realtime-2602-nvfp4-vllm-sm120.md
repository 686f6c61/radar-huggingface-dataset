# lspohn/Voxtral-Mini-4B-Realtime-2602-NVFP4-vLLM-SM120

## Resumen

Voxtral Mini 4B Realtime 2602 NVFP4 para vLLM es un checkpoint de servicio completo del modelo de reconocimiento de voz en tiempo real de Mistral AI, cuantizado en formato NVFP4 y empaquetado con un plugin de vLLM para GPUs Blackwell (SM120). Lo publica el Dr. Lucas Spohn (Idana AG, Friburgo, Alemania) como una alternativa lista para producción que reduce el consumo de VRAM durante la carga del modelo y aumenta el rendimiento de transcripción en tarjetas consumer de la generación RTX 50.

El modelo base es Voxtral Mini 4B Realtime 2602, un modelo de unos 4.000 millones de parámetros orientado a ASR en streaming con latencia baja. La cuantización afecta exclusivamente a 78 proyecciones MLP del decodificador (gate, up y down en las 26 capas), mientras que el encoder, las proyecciones de atención, los embeddings, las normalizaciones y la cabeza de salida conservan pesos BF16. El resultado es una inferencia W4A16 con caché KV en FP8 E4M3.

La relevancia práctica es que permite servir flujos de audio concurrentes en una única RTX 5070 Ti de 16 GiB: según las mediciones del autor, la asignación de GPU durante la carga baja de 8,43 GiB a 5,52 GiB (un 35 % menos) y el throughput de transcripción mejora entre un 31 % y un 43 % según el número de clientes. El soporte se limita a una sola GPU SM120 y a los idiomas alemán e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR en streaming (Voxtral Realtime); decodificador con MLP cuantizadas en NVFP4 |
| Parametros totales | aproximadamente 4.000 millones (modelo base Voxtral Mini 4B Realtime 2602) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 posiciones (configuración del lanzador) |
| Tipos de cuantizacion | NVFP4 en pesos MLP del decodificador (W4A16, activaciones BF16); caché KV en FP8 E4M3; resto de componentes en BF16 |
| Idiomas soportados | alemán (de), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con repacking en tiempo de ejecución para Marlin; plugin de cuantización propio (`idana_voxtral_vllm_nvfp4-0.2.0`) |
| Tamano del repo | 5,8 GB |
| Libreria de inferencia | vLLM 0.33.0 (plugin específico) |
| GPU objetivo | SM120 (Blackwell), probado en RTX 5070 Ti |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo base es Voxtral Mini 4B Realtime 2602 de Mistral AI, un sistema de reconocimiento automático del habla diseñado para transcripción en streaming con finalización de hipótesis en tiempos del orden de un segundo. Esta variante no reentrena el modelo: aplica cuantización post-entrenamiento NVFP4 sobre 78 proyecciones MLP del decodificador (gate, up y down en las 26 capas) y conserva los códigos FP4 y escalas originales, con repacking en tiempo de ejecución para el kernel Marlin de vLLM. Se preservan escalas globales separadas para gate y up.

La calibración utilizó estadísticas de activación de 64 clips públicos de FLEURS de carácter general. Las activaciones permanecen en BF16 en todas las posiciones de token, incluido el prefill, por lo que se trata de W4A16 y no de una inferencia W4A4 extremo a extremo. La ruta de atención Triton seleccionada computa con valores BF16, mientras que el almacenamiento de la caché KV usa FP8 E4M3. El lanzador configura Marlin, contexto de 8.192 posiciones, límite de 128 tokens por lote y grafos `FULL_DECODE_ONLY`. No se dispone de información sobre el volumen de tokens de entrenamiento ni sobre fases de RLHF o DPO en la documentación proporcionada.

## Capacidades

- Reconocimiento automático del habla en streaming con entrada de audio PCM16 mono a 16 kHz.
- Transcripción en tiempo real con finalización de hipótesis medida respecto al inicio del flujo más la duración del audio.
- Soporte bilingüe alemán e inglés.
- Servicio concurrente de múltiples flujos de audio mediante endpoint WebSocket (`/v1/realtime`).
- Procesamiento por lotes de ficheros WAV con conexiones concurrentes independientes.
- Modo `--unpaced` para enviar audio tan rápido como sea posible, útil en evaluación offline.
- Gestión térmica integrada: pausa a 80 °C durante al menos 15 minutos y reanudación a 75 °C o menos.
- Registro de CPU, RAM y VRAM de los procesos propios durante el servicio.
- No se documentan capacidades de tool calling, agentes, visión ni matemáticas; el pipeline es exclusivamente ASR.

## Casos de uso

- Transcripción en directo de reuniones y videoconferencias: el modelo procesa audio en streaming con finalización en torno a un segundo y permite hasta ocho flujos simultáneos como configuración de partida probada para entradas largas, adecuado para salas con varios hablantes o pistas separadas.
- Subtitulado casi en tiempo real de contenido en alemán e inglés: la ventana de contexto de 8.192 posiciones y el modo de streaming permiten generar subtítulos con latencia baja en emisiones o grabaciones de hasta 150-165 segundos por flujo, el rango validado por el autor.
- Servicio de dictado para aplicaciones internas: una única RTX 5070 Ti puede atender varios usuarios concurrentes con p95 de finalización de 0,599 s en cohortes cortas de 10-16 segundos, suficiente para interfaces de voz interactivas.
- Pipeline de transcripción por lotes en investigación: el comando `voxtral-nvfp4-transcribe` acepta múltiples ficheros WAV y abre conexiones concurrentes independientes, lo que simplifica la generación de transcripciones de corpus en alemán e inglés.
- Evaluación comparativa de cuantización: al incluir tanto el checkpoint NVFP4 como una alternativa nativa en Transformers, sirve para medir el impacto de la cuantización parcial en WER sobre el mismo conjunto de grabaciones FLEURS.
- Despliegue en estaciones de trabajo con GPU consumer: el consumo de aproximadamente 13,4 GiB de los 16 GiB de la tarjeta en el servidor probado, con una reserva por defecto de 2 GiB para otros servicios, encaja en equipos de sobremesa sin GPU de centro de datos.
- Archivado y búsqueda de audio corporativo: la transcripción de grabaciones de 150-165 segundos con hasta ocho flujos simultáneos permite indexar audio de forma económica en una sola tarjeta.

## Benchmarks y rendimiento

Mediciones del autor sobre una RTX 5070 Ti (SM120) con ajustes de vLLM/Triton equivalentes y el mismo presupuesto de GPU:

| Medicion | BF16 pesos + BF16 KV | NVFP4 pesos + FP8 KV |
|---|---:|---:|
| Asignación de GPU al cargar el modelo | 8,43 GiB | 5,52 GiB (aproximadamente 35 % menos) |
| Throughput con 1 / 2 / 4 / 8 clientes | 1,00x | 1,312x / 1,348x / 1,418x / 1,426x |
| WER alemán, 1.000 grabaciones | 4,987 % | 5,143 % (+0,156 puntos porcentuales) |
| WER inglés, 1.000 grabaciones | 5,165 % | 5,006 % (−0,158 puntos porcentuales) |

Pruebas de concurrencia con NVFP4 + FP8 KV:

| Carga de trabajo | Resultado |
|---|---|
| 8 flujos simultáneos de 150-165 s | Todos completan; retardo máximo de finalización 1,058 s |
| 32 flujos simultáneos de 10-16 s, tres cohortes | 96/96 completan; p95 0,599 s, máximo 0,612 s |
| Throughput fijo sin pacing a 32 clientes, seis ejecuciones | Mediana 48,56 segundos de audio por segundo de reloj |
| Ganancia de FP8 KV sobre NVFP4 + BF16 KV a 32 clientes | 5,3 % (intervalo de confianza pareado del 95 %: 2,9-7,6 %) |

La evaluación de calidad emplea 2.000 grabaciones FLEURS previamente evaluadas y 42.648 palabras de referencia por variante; el autor advierte que no constituye una confirmación independiente de calidad y que 19 de los 34 errores ingleses evitados provienen de una salida BF16 previamente vacía. Los niveles de concurrencia 9-15 no se han medido, y las pruebas con 16 flujos largos finalizaron muy por encima del umbral de dos segundos, mientras que las de 24 y 32 flujos largos agotaron el tiempo.

## Requisitos de hardware

- VRAM: aproximadamente 5,52 GiB de asignación durante la carga del modelo con NVFP4, frente a 8,43 GiB en BF16; el servidor completo probado usó unos 13,4 GiB de 16 GiB, ya que vLLM aprovecha el presupuesto de caché KV disponible.
- GPU recomendadas: RTX 5070 Ti (SM120) es la única validada; otras tarjetas SM120 son objetivos de prueba sin rendimiento establecido. El plugin rechaza arquitecturas de GPU distintas.
- GPU consumer: sí, cabe en una RTX 5070 Ti de 16 GiB con una reserva de 2 GiB para otros servicios y su margen.
- Despliegue: exclusivamente mediante vLLM 0.33.0 con el plugin incluido; requiere Linux, Python 3.12 y CUDA 13. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia: retardo máximo de finalización de 1,058 s con 8 flujos largos; p95 de 0,599 s y máximo de 0,612 s con 32 flujos cortos en tres cohortes.
- Throughput: mediana de 48,56 segundos de audio por segundo de reloj con 32 clientes sin pacing.
- Almacenamiento: repositorio de 5,8 GB; el kernel fijado como dependencia puede descargarse en el primer arranque.
- Configuración del lanzador: Marlin, FP8 E4M3 KV, contexto 8.192, límite de 128 tokens por lote, grafos `FULL_DECODE_ONLY` y `--reserve-gib 2` por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|---|
| lspohn/Voxtral-Mini-4B-Realtime-2602-NVFP4-vLLM-SM120 | aproximadamente 4.000 M | 8.192 | de, en | Apache 2.0 | safetensors + plugin vLLM, solo SM120 | W4A16 con KV FP8; 35 % menos VRAM de carga y 1,31-1,43x throughput |
| mistralai/Voxtral-Mini-4B-Realtime-2602 (base) | aproximadamente 4.000 M | no disponible | de, en | Apache 2.0 | pesos originales BF16 | Referencia de calidad: WER 4,987 % (de) y 5,165 % (en) |
| lspohn/Voxtral-Mini-4B-Realtime-2602-NVFP4-MLP-SM120 | aproximadamente 4.000 M | no disponible | de, en | Apache 2.0 | Transformers nativo | Alternativa con delta MLP NVFP4 y cargador secuencial |

No se dispone de datos de benchmarks de otros modelos ASR comparables en la información proporcionada, por lo que la comparación se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Solo se admiten alemán e inglés; no hay soporte multilingüe adicional documentado.
- El plugin rechaza GPUs que no sean SM120 y no soporta múltiples GPUs; el rendimiento en otras tarjetas Blackwell no está establecido.
- La cuantización introduce regresiones individuales ocasionales en transcripción, aunque el agregado se mantiene próximo a BF16 (+0,156 puntos de WER en alemán, −0,158 en inglés).
- La evaluación de calidad reutiliza 2.000 grabaciones FLEURS ya evaluadas y no constituye una confirmación independiente; parte de la mejora en inglés procede de una salida BF16 previamente vacía.
- La configuración de 8.192 posiciones impone un techo finito de duración de flujo; las pruebas largas cubren 150-165 segundos, no sesiones de duración ilimitada.
- Con entradas largas, ocho flujos es la configuración de partida probada; 16 flujos largos superaron ampliamente el umbral de dos segundos y 24 o 32 flujos largos agotaron el tiempo.
- Los niveles de concurrencia 9-15 no se han medido, y el throughput de cohortes cortas no demuestra capacidad sostenida para 32 conversaciones largas.
- El servidor completo puede consumir VRAM similar al modelo BF16 porque vLLM llena el presupuesto disponible con caché KV; la reducción afecta a la asignación de carga, no necesariamente al total en ejecución.
- La calibración se hizo con 64 clips generales de FLEURS, lo que puede no representar dominios acústicos especializados (ruido industrial, jerga técnica, acentos no cubiertos).
- El lanzador pausa el servicio a 80 °C durante al menos 15 minutos, lo que puede afectar a despliegues con cargas sostenidas en carcasas con refrigeración limitada.
- Riesgo de alucinación en pasajes de audio ambiguo o con ruido, inherente a los modelos ASR; no se documentan sesgos específicos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en hardware distinto al probado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lspohn/Voxtral-Mini-4B-Realtime-2602-NVFP4-vLLM-SM120
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Alternativa nativa en Transformers: https://huggingface.co/lspohn/Voxtral-Mini-4B-Realtime-2602-NVFP4-MLP-SM120
- Perfil del autor: https://huggingface.co/lspohn
- Documento de evaluación: EVALUATION.md dentro del repositorio del modelo
- uv (gestor de entornos): https://docs.astral.sh/uv/
