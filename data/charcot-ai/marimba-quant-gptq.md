# charcot-ai/marimba-quant-gptq

## Resumen

Marimba-quant-gptq es un conjunto de artefactos de cuantización GPTQ publicados por charcot-ai para el codificador de audio del modelo Marimba. No se trata de un modelo completo, sino de copias cuantizadas a 8 y 4 bits del codificador de audio congelado (el `thinker.audio_tower` de Qwen/Qwen3-ASR-0.6B) que Marimba utiliza para responder preguntas acústicas sobre ventanas de audio de 8 segundos a 16 kHz. El objetivo es reducir el tamaño de descarga de los pesos del codificador (de 373 MB en bf16 a 189-196 MB en 8 bits y 99-131 MB en 4 bits) manteniendo la calidad de las predicciones.

El modelo base, charcot-ai/marimba, es un sistema de comprensión de audio orientado a tareas de diarización y actividad de voz. Estos artefactos cuantizados sirven únicamente a las preguntas respondidas desde las capas 9, 12 y 18 del codificador: actividad de voz, cambio de hablante, número de hablantes, mismo hablante y fin de turno. Las preguntas de idioma y términos requieren el decodificador de texto y quedan fuera del alcance de esta evaluación.

La relevancia de esta publicación es doble: por un lado, demuestra que la cuantización GPTQ a 8 bits introduce desviaciones mínimas (dentro de 0,001 AUROC respecto a la referencia fp32) en tareas de audio; por otro, documenta con transparencia que la cuantización a 4 bits es sensible a la elección de ventanas de calibración, con variaciones notables entre distintas semillas. Es un caso práctico útil para quien evalúe cuantización de codificadores de audio en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio transformer (Qwen3-ASR-0.6B `thinker.audio_tower`): 3 convoluciones, proyección `conv_out` y 18 capas transformer |
| Parametros totales | No disponible (el codificador contiene 109 matrices `nn.Linear` cuantizadas; el checkpoint completo Qwen3-ASR-0.6B es de 1,88 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa ventanas de audio de 8 s, 16 kHz mono) |
| Tipos de cuantizacion | GPTQ W8 por canal simétrico; GPTQ W4 con grupos de 32 (`w4g32`, `w4g32_s1`, `w4g32_s2`, `w4g32_s3`) y una variante mixta; convoluciones, layer norms y sesgos permanecen en bf16 |
| Idiomas soportados | No disponible (las tareas evaluadas son acústicas, no lingüísticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`<variant>/encoder.safetensors`) más `quantize.json` con argumentos y calibración; script de carga `gptq_format.py` |

## Arquitectura y entrenamiento

El codificador es el `thinker.audio_tower` de Qwen/Qwen3-ASR-0.6B en su revisión `5eb144179a02acc5e5ba31e748d22b0cf3e303b0`: tres convoluciones iniciales, una proyección `conv_out` y 18 capas transformer. Las 109 matrices `nn.Linear` (`conv_out` y `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1`, `fc2` de cada capa) se almacenan como enteros con una escala float16 por fila de salida o por grupo de columnas de entrada. Las convoluciones, layer norms y sesgos se mantienen en bf16. En la variante de 4 bits, los enteros se empaquetan dos por byte.

La cuantización se realizó con GPTQ sobre el codificador congelado, usando ventanas de calibración cuyo muestreo se documenta en `quantize.json` junto con los argumentos y el cambio de pesos por capa. No se ha publicado información sobre el entrenamiento original del codificador base ni sobre el proceso de ajuste de Marimba; lo que sí se documenta es que los heads y readouts de Marimba no están incluidos en estos artefactos y provienen del repositorio `charcot-ai/marimba`. Tampoco se incluyen el decodificador de texto de Qwen3-ASR ni la proyección de salida del codificador hacia el decodificador (`ln_post`, `proj1`, `proj2`).

Una limitación técnica relevante: aunque los ficheros son más pequeños, en inferencia los enteros se convierten de vuelta a coma flotante, por lo que la velocidad y el consumo de VRAM son los del codificador en bf16. La cuantización aquí reduce el tamaño de descarga, no acelera la inferencia ni reduce memoria en tiempo de ejecución.

## Capacidades

- Predicción de actividad de voz (voice activity) sobre ventanas de audio de 8 s a 16 kHz.
- Detección de cambio de hablante (speaker change).
- Estimación del número de hablantes (speaker count).
- Verificación de mismo hablante (same speaker).
- Detección de fin de turno (turn end), útil en sistemas de diálogo por voz.
- Extracción de representaciones internas de las capas 9, 12 y 18 del codificador (forma `(batch, 104, 896)` para lotes de ventanas).
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades multilingües evaluadas.
- No incluye decodificación de texto ni reconocimiento de voz: las preguntas de idioma y términos quedan fuera del alcance de estos artefactos.

## Casos de uso

- Detección de actividad de voz en pipelines de transcripción: el codificador cuantizado a 8 bits mantiene 0,9970 AUROC en voice activity, por lo que puede sustituir al codificador bf16 en la fase de segmentación previa a ASR reduciendo el tamaño de descarga del artefacto.
- Diarización ligera en reuniones: con 0,9555 AUROC en speaker change y 0,9927 en same speaker, el codificador puede alimentar un módulo de segmentación por hablante en grabaciones de tipo AMI o VoxConverse.
- Gestión de turnos en asistentes de voz: la predicción de turn end con 0,9313 AUROC permite cerrar el turno del usuario en sistemas de conversación por voz con latencia controlada.
- Conteo de participantes en llamadas: la precisión de 0,7874 en speaker count es suficiente para estimaciones aproximadas en herramientas de análisis de reuniones, aunque no para aplicaciones que exijan exactitud alta.
- Despliegue en entornos con ancho de banda limitado: las variantes de 8 bits (189-196 MB) y 4 bits (99-131 MB) reducen el coste de distribución frente a los 373 MB del codificador bf16, útil en contenedores o dispositivos edge donde el tamaño del artefacto importa.
- Investigación sobre cuantización de codificadores de audio: el repositorio incluye `quantize.json` con el cambio de pesos por capa y varias semillas de calibración (`w4g32`, `w4g32_s1`, `w4g32_s2`, `w4g32_s3`), lo que permite reproducir y comparar el efecto de la calibración en 4 bits.
- Integración en pipelines de análisis de audio con `marimba-audio`: la API `engine.encode_batch(windows, questions)` devuelve las representaciones de las capas 9, 12 y 18, lo que facilita incorporar estas cabezas a un servicio existente.

## Benchmarks y rendimiento

Evaluación sobre 1.170 ventanas públicas de 8 s a 16 kHz mono (Smart Turn v3.2 test para turn end; VoxConverse y AMI `ihm` test para las preguntas de hablante y actividad de voz; ESC-50 sin clases de sonidos humanos y FLEURS `pt_br` validation para voice activity). La referencia fp32 corre en CPU ventana a ventana; el resto en una NVIDIA A40 con la ruta por lotes del paquete, en bf16 salvo que el esquema indique float32. Los mismos ficheros re-evaluados en una NVIDIA L4 difieren como máximo 0,0012 AUROC y 0,0023 en precisión de speaker count.

| Variante | Esquema | Tamano (MB) | turn_end AUROC | voice_activity AUROC | same_speaker AUROC | speaker_change AUROC | speaker_count accuracy | turn_end flips | speaker_count flips |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| referencia fp32 | float32, CPU, una ventana a la vez | - | 0,9310 | 0,9969 | 0,9926 | 0,9557 | 0,7862 | 0 | 0 |
| torch_bf16_cuda | bfloat16 | - | 0,9304 (-0,0006) | 0,9969 (-0,0001) | 0,9929 (+0,0003) | 0,9557 (+0,0000) | 0,7874 (+0,0011) | 5 | 1 |
| torch_fp32_cuda | float32 | - | 0,9309 (-0,0000) | 0,9969 (+0,0000) | 0,9926 (+0,0000) | 0,9558 (+0,0000) | 0,7862 (+0,0000) | 1 | 0 |
| `w8ch/` | W8, por canal, simétrico, GPTQ | 189,4 | 0,9313 (+0,0004) | 0,9970 (+0,0001) | 0,9927 (+0,0001) | 0,9555 (-0,0002) | 0,7874 (+0,0011) | 16 | 3 |

La model card indica que las variantes de 8 bits puntúan dentro de 0,001 AUROC de la referencia fp32 en todas las preguntas binarias, y que las de 4 bits presentan mayor variación dependiendo de las ventanas de calibración empleadas. La tabla completa de variantes (incluyendo `w8ch_convfp/` y las series `w4g32*`) aparece truncada en la información disponible, por lo que no se reproducen aquí los valores de las variantes de 4 bits.

## Requisitos de hardware

- VRAM de inferencia: la model card indica que en inferencia los enteros se convierten a coma flotante, por lo que la memoria de GPU es la del codificador en bf16, no la del tamaño del fichero cuantizado. No se publica una cifra exacta de VRAM.
- GPU recomendadas: la evaluación se realizó en una NVIDIA A40; también se validó en una NVIDIA L4 con diferencias de hasta 0,0012 AUROC.
- GPU de consumo: no se documenta compatibilidad con GPU de consumo. El codificador forma parte de un checkpoint Qwen3-ASR-0.6B de 1,88 GB, lo que sugiere que podría caber en GPU de consumo, pero no hay datos publicados al respecto en la información disponible.
- Despliegue: el paquete `marimba-audio` (commit `f58980a`) con `torch==2.8.0`, `transformers==4.57.6`, `safetensors==0.8.0` y `huggingface_hub==0.36.2`. La carga de solo el codificador cuantizado requiere un loader que el paquete aún no incluye; `Marimba.from_pretrained` descarga el checkpoint completo de Qwen3-ASR-0.6B.
- Latencia y throughput: no disponibles. La model card indica que la velocidad es la del codificador bf16, pero no publica cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros codificadores de audio cuantizados ni con alternativas de diarización o detección de actividad de voz.

## Limitaciones y advertencias

- No es un modelo completo: no incluye los heads y readouts de Marimba, el decodificador de texto de Qwen3-ASR ni las proyecciones `ln_post`, `proj1` y `proj2`. Solo sirve para las preguntas de las capas 9, 12 y 18.
- Las preguntas de idioma y términos requieren el decodificador de texto y no fueron evaluadas en estos artefactos.
- La cuantización no acelera la inferencia ni reduce la VRAM en ejecución: los enteros se convierten a coma flotante en inferencia y el consumo es el del codificador bf16.
- Las variantes de 4 bits son sensibles a la calibración: los resultados varían según las ventanas de calibración muestreadas, como muestran las series `w4g32`, `w4g32_s1`, `w4g32_s2` y `w4g32_s3`.
- La precisión en speaker count (0,7862 en la referencia fp32) es moderada y no apta para aplicaciones que exijan conteo exacto de hablantes.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible.
- Licencia Apache-2.0, que permite uso comercial con las obligaciones habituales de atribución y aviso de licencia.
- Requiere un loader específico no incluido en el paquete para cargar únicamente el codificador cuantizado; de lo contrario, se descarga el checkpoint completo de 1,88 GB.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por parte de terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/charcot-ai/marimba-quant-gptq
- Modelo base Marimba: https://huggingface.co/charcot-ai/marimba
- Codificador original Qwen3-ASR-0.6B (revisión `5eb144179a02acc5e5ba31e748d22b0cf3e303b0`): https://huggingface.co/Qwen/Qwen3-ASR-0.6B/tree/5eb144179a02acc5e5ba31e748d22b0cf3e303b0
- Repositorio `marimba-api` (commit `f58980a`): https://github.com/Charcot-AI/marimba-api/commit/f58980ab80a54943929074aff23159caa026c7cf
- Dataset Smart Turn v3.2 test: https://huggingface.co/datasets/pipecat-ai/smart-turn-data-v3.2-test
- Dataset VoxConverse: https://huggingface.co/datasets/diarizers-community/voxconverse
- Dataset AMI: https://huggingface.co/datasets/diarizers-community/ami
- Dataset ESC-50: https://huggingface.co/datasets/ashraq/esc50
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
