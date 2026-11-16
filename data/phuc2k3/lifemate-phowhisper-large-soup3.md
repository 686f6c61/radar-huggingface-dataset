# phuc2k3/lifemate-phowhisper-large-soup3

## Resumen

LifeMate ASR es un modelo de reconocimiento automático del habla (ASR) para vietnamita, desarrollado por el equipo Hephaestus para el Zalo AI Challenge 2026 en la categoría LifeMate. Se trata de un ajuste fino mediante LoRA sobre el modelo base `vinai/PhoWhisper-large`, un Whisper large adaptado previamente al vietnamita. El resultado es un modelo de 1.543.304.960 parámetros que se distribuye en dos formatos: safetensors en bf16 para su uso con la librería `transformers`, y un binario CTranslate2 en float16 pensado para `faster_whisper`, que es el que se empleó en la entrega oficial del concurso.

La propuesta técnica combina tres ejecuciones de entrenamiento con semillas distintas (LoRA con r=32, alpha=64 y dropout 0.05 sobre las proyecciones de atención y las capas fully connected), cuyos pesos se promedian tensor a tensor tras fusionar cada adaptador con el modelo base. Esta técnica de "model soup" busca reducir la varianza del ajuste fino y mejorar la robustez sin incrementar el coste de inferencia. El modelo reporta un WER de 0.0757 en validación interna y 0.0739 en el conjunto de desarrollo reservado, con decodificación beam 3.

Es relevante ahora porque demuestra un flujo de trabajo reproducible y de bajo coste para adaptar un ASR grande a un dominio concreto (audio de conversaciones del reto LifeMate) con tan solo 3.637 clips de entrenamiento, y porque publica artefactos listos para producción tanto en `transformers` como en CTranslate2, lo que facilita su despliegue en pipelines de transcripción de baja latencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large) |
| Parametros totales | 1.543.304.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper large: 30 s por segmento) |
| Tipos de cuantizacion | bf16 (safetensors), float16 (CTranslate2) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (bf16), CTranslate2 `model.bin` (float16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura completa de Whisper large: un transformer encoder-decoder con atención estándar, orientado a la transcripción de segmentos de audio de hasta 30 segundos. Sobre esta base se aplicó un ajuste fino con LoRA de rango 32 y alpha 64, con dropout 0.05, sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1` y `fc2`. El entrenamiento usó AdamW con learning rate 3e-4, weight decay 0.01, 15 pasos de warmup seguidos de decaimiento lineal, batch de 8, 3 épocas y precisión bf16, sin prompt de contexto.

Los datos de entrenamiento se limitaron al audio `train` y a las transcripciones `audio_text` del reto LifeMate: 3.637 clips correspondientes a 1.114 identificadores, con 309 identificadores de desarrollo agrupados y reservados para evaluación. No se empleó audio externo. La aumentación incluyó variación de velocidad (0.9, 1.0 y 1.1), ruido blanco sintético con probabilidad 0.3 y relación señal-ruido entre 10 y 30 dB, además de SpecAugment. Se entrenaron tres semillas (0, 1 y 2) y los modelos resultantes tras la época 3 se promediaron tensor a tensor para producir el modelo final ("soup"). La decodificación usada en la entrega fue beam 3, idioma `vi`, sin VAD ni timestamps, con fallback de temperatura de 0.0 a 1.0 y umbrales de compression-ratio 2.4 y log-prob −1.0.

## Capacidades

- Transcripción de voz a texto en vietnamita para segmentos de audio de hasta 30 segundos.
- Reconocimiento robusto ante ruido blanco y variaciones de velocidad, gracias a la aumentación aplicada durante el entrenamiento.
- Decodificación con beam search y fallback de temperatura para mitigar repeticiones y alucinaciones en pasajes difíciles.
- Inferencia eficiente mediante CTranslate2 (`faster_whisper`) con pesos en float16.
- Integración directa con `transformers` mediante `WhisperForConditionalGeneration`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No dispone de capacidades de visión, audio comprensivo (más allá de la transcripción) ni generación de texto libre.
- Soporte multilingüe limitado al vietnamita según la model card.

## Casos de uso

- Transcripción de conversaciones de atención al cliente: el modelo puede procesar audio de llamadas o chats de voz en vietnamita y generar transcripciones con un WER en torno al 7,4 % en el dominio del reto, adecuado para generar actas y analítica posterior.
- Subtitulado automático de contenido audiovisual en vietnamita: con `faster_whisper` y pesos float16 se puede desplegar en servidores con GPU modesta para generar subtítulos por segmentos de 30 segundos.
- Indexación y búsqueda de archivos de audio: la transcripción permite construir índices de texto sobre grabaciones de reuniones o soporte, facilitando búsqueda semántica y recuperación de información.
- Asistentes de voz embebidos (LifeMate y similares): al ser un modelo de 1,5 mil millones de parámetros en float16, puede ejecutarse en GPUs de gama media para transcripción en tiempo casi real en aplicaciones de asistencia personal.
- Análisis de calidad y cumplimiento en centros de llamadas: la transcripción permite aplicar reglas de negocio, detección de palabras clave y auditoría de conversaciones en vietnamita.
- Generación de datos etiquetados para otros modelos: las transcripciones de alta calidad sirven para crear corpus de texto alineado con audio que alimenten pipelines de TTS o de modelos de lenguaje en vietnamita.
- Evaluación de sistemas ASR en producción: al publicar el WER de validación interna y de desarrollo reservado, el modelo sirve como referencia para comparar variantes de despliegue (CTranslate2 frente a transformers) en términos de precisión y latencia.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| WER (beam 3) | 0.0757 | Validación interna |
| WER (beam 3) | 0.0739 | Desarrollo reservado (309 IDs) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo ASR y la model card solo reporta WER en los conjuntos del reto.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos, más memoria para activaciones y caché de atención; en la práctica se recomienda al menos 6-8 GB de VRAM.
- VRAM estimada en float16 con CTranslate2: similar a bf16, en torno a 3,1 GB de pesos; `faster_whisper` reduce el overhead y permite lotes pequeños en GPUs de 8 GB.
- GPU recomendadas: NVIDIA A100 o H100 para despliegues de alto throughput; RTX 4090, RTX 3090, RTX A5000 o L4 para producción de volumen medio; RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB para desarrollo y pruebas.
- Cabe en GPUs de consumo: sí, en modelos con 8 GB o más de VRAM en float16 o bf16; en cuantizaciones más agresivas (int8) podría caber en 6 GB, aunque no se documentan cuantizaciones int8 en la model card.
- Opciones de despliegue: `transformers` con `WhisperForConditionalGeneration` (safetensors bf16), `faster_whisper` con CTranslate2 float16 (formato recomendado por el autor), y servidores compatibles con la API de Hugging Face (`endpoints_compatible` según los tags).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware, del tamaño del lote y de la duración del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| phuc2k3/lifemate-phowhisper-large-soup3 | 1.543.304.960 | Segmentos de 30 s (Whisper large) | vi | BSD-3-Clause | safetensors, CTranslate2 |
| vinai/PhoWhisper-large (modelo base) | no disponible en la información | Segmentos de 30 s (Whisper large) | vi | no disponible en la información | safetensors |
| openai/whisper-large-v3 | no disponible en la información | Segmentos de 30 s | multilingüe | no disponible en la información | safetensors, CTranslate2 |
| VinAI PhoWhisper (variantes small/medium) | no disponible en la información | Segmentos de 30 s | vi | no disponible en la información | safetensors |

La comparación cuantitativa de WER frente a estos modelos no está disponible en la información proporcionada; el único dato reportado es el WER del modelo frente a sus propios conjuntos de validación y desarrollo del reto.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en vietnamita; no debe usarse para otros idiomas sin un ajuste adicional.
- El ajuste fino se realizó sobre un conjunto reducido (3.637 clips de 1.114 identificadores), por lo que puede generalizar peor fuera del dominio del reto LifeMate (por ejemplo, audio médico, legal o con acentos muy marcados).
- Riesgo de alucinación y repeticiones en pasajes con ruido extremo o silencios largos; la decodificación con fallback de temperatura y umbrales de compression-ratio mitiga parcialmente este problema, pero no lo elimina.
- No se documentan sesgos específicos de género, edad o dialecto; al entrenarse solo con el corpus del reto, es probable que herede los sesgos de ese corpus.
- La licencia BSD-3-Clause permite uso comercial con atribución y sin garantías; conviene revisar las condiciones del modelo base `vinai/PhoWhisper-large` antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación independiente.
- No se proporcionan métricas de latencia ni de throughput, lo que dificulta estimar costes operativos sin pruebas propias.
- El modelo no incluye VAD ni timestamps en la configuración de decodificación de la entrega; para aplicaciones que requieran marcas temporales habrá que añadir un componente externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/phuc2k3/lifemate-phowhisper-large-soup3
- Modelo base: https://huggingface.co/vinai/PhoWhisper-large
- Repositorio del modelo base en GitHub (VinAI PhoWhisper): no disponible en la información proporcionada
- Paper de Whisper (Radford et al.): no disponible en la información proporcionada
- Documentación de faster-whisper / CTranslate2: no disponible en la información proporcionada
- Zalo AI Challenge 2026: no disponible en la información proporcionada
