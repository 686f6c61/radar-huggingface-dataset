# nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B

## Resumen

NVIDIA Nemotron-3.5-Transcribe-30B-A4B es un modelo abierto de voz y audio de tipo Speech-Augmented Language Model (SALM) desarrollado por NVIDIA. Convierte grabaciones de audio, junto con instrucciones de texto y contexto opcional, en respuestas de texto: transcripción multilingüe en 40 idiomas, traducción de voz, transcripción con atribución de hablante, predicción de marcas temporales, identificación de idioma y respuesta a preguntas sobre audio. Está pensado para procesamiento offline de grabaciones de hasta una hora de duración.

El modelo parte de `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` y le añade un codificador paralelo de expertos (un codificador ASR Transformer y un codificador de hablante). La arquitectura del modelo de lenguaje es un híbrido Mamba-2–Transformer con mezcla de expertos: 33.697.781.029 parámetros totales según los pesos en safetensors (NVIDIA redondea a 34B, incluido el codificador de audio), de los cuales se activan aproximadamente 4,3B por token. La longitud de contexto es de 65.536 tokens.

Su relevancia práctica está en que un único modelo cubre tareas que normalmente requieren un pipeline compuesto por ASR, diarización, alineamiento forzado, detección de idioma y traducción. Se publica en BF16, FP8 y NVFP4, con licencia OpenMDW-1.1, y admite uso comercial según la model card. El repositorio ocupa 67,5 GB e incluye variantes cuantizadas en repositorios separados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrido Mamba-2–Transformer con mezcla de expertos (MoE) y codificador paralelo de expertos (codificador ASR Transformer + codificador de hablante) |
| Parámetros totales | 33.697.781.029 (34B según la model card, incluido el codificador de audio) |
| Parámetros activos | ~4,3B por token (incluido el codificador de audio) |
| Longitud de contexto | 65.536 tokens; grabaciones de hasta 1 hora |
| Tipos de cuantización | BF16 (referencia), FP8 y NVFP4 (variantes publicadas en repositorios aparte) |
| Idiomas soportados | 40: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido según la model card) |
| Formato de pesos | safetensors, librería `nemo` (`nemo_speechlm`), PyTorch |
| Entradas / salidas | Audio y texto / texto, con marcas temporales a nivel de palabra opcionales |
| Modelo base | `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` |
| Dataset de entrenamiento | `nvidia/Granary-v2` (mezcla descrita en el informe técnico) |
| Tamaño del repositorio | 67,5 GB |

## Arquitectura y entrenamiento

El modelo es un SALM construido sobre un modelo de lenguaje híbrido Mamba-2–Transformer con mezcla de expertos, al que se acopla un codificador paralelo de expertos formado por un codificador ASR de tipo Transformer y un codificador de hablante. El audio se codifica y se inyecta en el modelo de lenguaje, que procesa conjuntamente la señal de audio, la instrucción de texto y el contexto opcional para producir la respuesta textual. Esta combinación es la que permite que una sola pasada resuelva tareas que requieren conocer simultáneamente el contenido lingüístico y la identidad de los hablantes.

El entrenamiento se apoya en el dataset `nvidia/Granary-v2`, e incluye tareas de transcripción multilingüe, traducción de voz, transcripción contextual, transcripción con atribución de hablante, transcripción enriquecida, predicción de marcas temporales, identificación de idioma y respuesta a preguntas sobre audio. La mezcla incorpora además una cantidad pequeña de instrucciones de texto y de tareas de etiquetado y redacción de PII. La model card no especifica el número total de tokens de entrenamiento, la composición exacta de la mezcla ni si se aplicaron fases de RLHF o DPO; esa información corresponde al informe técnico, no incluido en la información disponible.

## Capacidades

- Transcripción multilingüe en 40 idiomas, con dos estilos de salida seleccionables por instrucción: verbatim (literal) y escrito (con normalización de formato).
- Traducción de voz a texto (speech translation) dentro del mismo modelo, sin pipeline separado de ASR más traducción.
- Transcripción con atribución de hablante (diarización) mediante el codificador de hablante dedicado.
- Transcripción enriquecida (rich transcription): además del texto, marcas temporales y anotaciones de eventos.
- Predicción de marcas temporales a nivel de palabra.
- Identificación de idioma (language identification) sobre el audio.
- Manejo de code-switching, es decir, cambios de idioma dentro de una misma grabación.
- Audio question answering: responder preguntas en lenguaje natural sobre el contenido de una grabación.
- Transcripción contextual: admite contexto de texto opcional (por ejemplo, vocabulario o nombres propios) para mejorar el reconocimiento.
- Seguimiento de instrucciones de texto (instruccion following) y etiquetado y redacción de PII.
- Procesamiento de audio de formato largo: grabaciones de hasta una hora con 65.536 tokens de contexto.

## Casos de uso

- Transcripción de reuniones y actas: una sola pasada sobre la grabación completa (hasta una hora) genera la transcripción con marcas temporales y atribución de hablante, lo que permite construir actas con intervenciones identificadas sin encadenar ASR, diarización y alineamiento por separado.
- Subtitulado y localización: la predicción de marcas temporales a nivel de palabra y la traducción de voz integrada permiten generar subtítulos alineados y, en la misma llamada, una versión traducida del contenido.
- Atención al cliente y análisis de llamadas: transcripción verbatim más etiquetado de PII permite procesar grabaciones de contact center, redactar datos personales antes de almacenarlas y alimentar analítica de calidad sobre el texto resultante.
- Documentación clínica o legal dictada: la transcripción en estilo escrito, con contexto opcional de vocabulario específico (fármacos, terminología jurídica), reduce la necesidad de posprocesado sobre el texto generado.
- Búsqueda y explotación de archivos audiovisuales: la identificación de idioma y el audio question answering permiten indexar y consultar un archivo de grabaciones en varios idiomas sin transcripción manual previa.
- Investigación en lingüística y evaluación de ASR: el soporte de 40 idiomas y de code-switching facilita la evaluación comparativa de grabaciones multilingües reales dentro de un mismo modelo y con la misma configuración.
- Accesibilidad: generación de transcripciones y descripciones de contenido hablado para vídeos y materiales formativos, con marcas temporales que permiten sincronizar la salida con el medio original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye secciones tituladas "Results at a Glance" y "Benchmark Results" y el repositorio está etiquetado con `hf-asr-leaderboard` y `eval-results`, pero los valores numéricos no forman parte del extracto proporcionado. Para cifras de WER, BLEU u otras métricas conviene consultar el informe técnico enlazado más abajo.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del tamaño del repositorio, 67,5 GB, y del recuento de parámetros; no son cifras publicadas por NVIDIA):
  - BF16: ~68 GB solo para pesos, más KV cache y buffers del codificador de audio; en la práctica, 80 GB o más.
  - FP8: ~34 GB para pesos; alrededor de 40-48 GB con overhead.
  - NVFP4: ~17-20 GB para pesos; alrededor de 24 GB con overhead.
- GPU recomendadas: H100 80 GB, H200 o A100 80 GB para BF16; una sola GPU de 48 GB (L40S, RTX 6000 Ada) para FP8; para NVFP4, GPU de 24-32 GB.
- Cabe en GPU de consumo: sí, en el caso de la variante NVFP4 sobre RTX 4090 (24 GB) o RTX 5090 (32 GB), siempre que el runtime utilizado soporte NVFP4. La variante BF16 no cabe en una GPU de consumo individual.
- Opciones de despliegue documentadas: el toolkit NeMo Speech (repositorio `NVIDIA-NeMo/Speech`, con recetas de fine-tuning y serving) y la guía de SGLang-Omni publicada por el equipo. No se ha confirmado en la información disponible el soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. Dado que el modelo es MoE con ~4,3B parámetros activos, el coste de cómputo por token es mucho menor que el de un modelo denso de 34B, pero el requisito de memoria viene determinado por los pesos totales.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de conocimiento público general, no de la información proporcionada en esta ficha; conviene verificarlos antes de citarlos.

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Tareas integradas |
|---|---|---|---|---|---|
| NVIDIA Nemotron-3.5-Transcribe-30B-A4B | 33,7B totales, ~4,3B activos | 65.536 tokens; audio de hasta 1 h | 40 | OpenMDW-1.1 | ASR, traducción de voz, diarización, timestamps, LID, audio QA, PII |
| Whisper large-v3 | 1,55B densos | Ventanas de 30 s, sin contexto largo nativo | ~99 | MIT | ASR y traducción de voz |
| Voxtral Small (Mistral) | ~24B densos | Contexto de audio largo (32k tokens) | Varios (multilingüe) | Apache 2.0 | ASR y comprensión de audio |

La diferencia principal frente a Whisper es el enfoque: Whisper es un modelo ligero de ASR por ventanas, mientras que Nemotron-3.5-Transcribe asume grabaciones largas y tareas múltiples en una sola llamada. Frente a otros modelos de audio de gran tamaño, su ventaja declarada es la combinación de diarización, marcas temporales y traducción en un único modelo, a costa de un requisito de memoria mucho mayor.

## Limitaciones y advertencias

- Es un modelo offline: procesa grabaciones completas, no está diseñado para transcripción en tiempo real ni streaming de baja latencia.
- Límite declarado de una hora de audio por entrada; grabaciones más largas requieren segmentación externa, con el riesgo de cortar turnos de habla.
- Cobertura desigual entre los 40 idiomas: la model card remite a una matriz de soporte lingüístico que no forma parte de la información disponible; no debe asumirse la misma calidad en todos los idiomas.
- Riesgo de alucinación y de errores de normalización en la transcripción, especialmente en audio con ruido, solapamiento de hablantes o code-switching intenso. La salida es texto generado, no un alineamiento garantizado con la señal.
- La atribución de hablante puede fallar en conversaciones con voces similares, solapamientos o cambios de turno rápidos.
- El etiquetado y la redacción de PII se entrenaron con una cantidad pequeña de datos según la model card; no debe tratarse como un sistema de cumplimiento normativo sin verificación humana.
- Licencia OpenMDW-1.1: aunque la model card indica que el modelo está listo para uso comercial y no comercial, las condiciones legalmente vinculantes están en el texto de la licencia y deben revisarse antes de desplegarlo en producción.
- El tamaño del repositorio (67,5 GB) y la necesidad de GPU de gama alta en BF16 suponen una barrera de infraestructura relevante frente a modelos de ASR ligeros.
- Sesgos: la model card incluye una sección de consideraciones éticas, pero el contenido no está disponible en la información proporcionada; es esperable un sesgo derivado de la distribución del dataset Granary-v2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Variante FP8: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Repositorio NeMo Speech: https://github.com/NVIDIA-NeMo/Speech
- Guía de serving con SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/nemotron_transcribe.html
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Paper de referencia (Speech-Augmented Language Model): https://arxiv.org/abs/2310.09424
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
