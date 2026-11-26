# BH-Language-AI/bh-speech-1-2b

## Resumen

BH-Speech-1-2B es un modelo de reconocimiento automático del habla (ASR) para bosnio (ijekavica, alfabeto latino) publicado por BH-Language-AI. Se plantea como un ajuste fino de `openai/whisper-large-v3`, un transformer encoder-decoder de aproximadamente 1.550 millones de parámetros, y su objetivo declarado es la transcripción de reuniones, subtitulado, agentes de voz y accesibilidad. El identificador del repositorio sugiere 2B parámetros, pero la base real es Whisper large-v3 (1,55B); el nombre comercial no se corresponde con un tamaño verificado en la información disponible.

El dato crítico es que el modelo **no está entrenado**: la model card lo indica de forma explícita ("NIJE TRENIRAN", "težine ne postoje"). El repositorio contiene únicamente la tarjeta de proyecto, sin pesos, sin configuración de tokenizer y sin artefactos de inferencia. Cualquier llamada a `pipeline()` o clonación del repositorio devuelve solo documentación, no un modelo funcional.

Su relevancia es, por tanto, documental y de planificación: fija la base (Whisper large-v3, revisión `06f233f`), el conjunto de datos (FLEURS `bs_ba`, aproximadamente 12 horas, 4.416 filas con particiones 3.091/400/925), la métrica de evaluación (WER/CER sobre el test congelado de 925 muestras) y el baseline externo de referencia (BuzzASR/bosnian, WER 13,46, CER 3,59). No debe evaluarse como un modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3, ajuste fino planificado) |
| Parámetros totales | 1.550 millones (heredados de Whisper large-v3; no verificados en este repositorio, que no contiene pesos) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (límite arquitectónico de Whisper; no confirmado explícitamente en la información disponible) |
| Tipos de cuantización | no disponible (no se publican pesos) |
| Idiomas soportados | bosnio (`bs`); el ajuste fino se limita a bosnio |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio no contiene pesos; se planifica safetensors vía `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: encoder de audio con espectrograma log-Mel y decoder autorregresivo con atención cruzada, entrenado originalmente por OpenAI sobre 680.000 horas de audio débilmente supervisado y 5 millones de horas de datos pseudoetiquetados (cifras del modelo base, no del ajuste). El ajuste fino planificado sobre `google/fleurs` config `bs_ba` cubriría aproximadamente 12 horas de audio a 16 kHz, con 3.091 filas de entrenamiento, 400 de validación y 925 de test reservado y nunca visto durante el entrenamiento.

El plan de entrenamiento contempla una evaluación de baseline previa, una decisión entre LoRA y ajuste fino completo, y una evaluación congelada sobre el test de FLEURS `bs_ba`. No se ha ejecutado ninguno de estos pasos según la información disponible, y no se documentan hiperparámetros, número de épocas, composición exacta del dataset más allá de FLEURS ni uso de RLHF o DPO. El autor declara una política explícita de no fabricar métricas: toda cifra debe provenir de una ejecución real.

## Capacidades

- Reconocimiento de voz a texto en bosnio (ijekavica, alfabeto latino), una vez existan pesos.
- Transcripción de audio de 16 kHz mediante el pipeline estándar de `transformers` (`automatic-speech-recognition`) con `language="bosnian"` y `task="transcribe"`.
- Traducción de voz a texto, en teoría heredada de Whisper large-v3, aunque la model card solo documenta la tarea de transcripción.
- Detección de idioma y marcas temporales de segmentos: capacidades del modelo base no declaradas para este ajuste.
- Diarización de hablantes y TTS: anunciadas como líneas futuras de la serie BH-Speech, fuera de este repositorio.
- Tool calling, modo de razonamiento, visión, audio generativo y agentes multi-paso: no disponibles; es un modelo ASR puro.
- Multilingüismo: no disponible; el alcance declarado es exclusivamente bosnio.

## Casos de uso

- Transcripción de reuniones en bosnio: una vez publicados los pesos, el pipeline de `transformers` procesaría audio de 16 kHz en ventanas de 30 segundos para generar actas o resúmenes posteriores. La utilidad real depende de que el ajuste fino supere el baseline de WER 13,46.
- Subtitulado automático de vídeo: la salida de texto por segmentos permitiría generar subtítulos en bosnio para contenido educativo o institucional, con revisión humana obligatoria dado el WER esperado.
- Agentes de voz para atención ciudadana: la transcripción podría alimentar un LLM posterior en un pipeline de voz a texto más razonamiento, en escenarios de administración pública en Bosnia y Herzegovina.
- Accesibilidad: transcripción en tiempo casi real de clases y eventos para personas con discapacidad auditiva, usando el modelo como componente ASR de un sistema mayor.
- Archivística y documentación histórica: digitalización de entrevistas y archivos orales en bosnio, donde un WER en el rango del 13 % exige corrección humana pero reduce el coste de transcripción manual.
- Evaluación comparativa de ASR de bajo recurso: el repositorio sirve como referencia metodológica (test congelado FLEURS `bs_ba`, 925 muestras) para comparar futuros ajustes de Whisper en bosnio.
- Generación de datos de entrenamiento: transcripciones pseudoetiquetadas de audio bosnio para alimentar otros modelos de la serie (diarización, TTS).

Ninguno de estos casos es ejecutable hoy: el repositorio no contiene pesos.

## Benchmarks y rendimiento

La model card solo publica el baseline externo de referencia sobre el test congelado FLEURS `bs_ba` (925 muestras). No hay resultados propios porque el modelo no está entrenado.

| Modelo | CER ↓ | WER ↓ | Estado |
|---|---|---|---|
| BuzzASR/bosnian (MIT, ajuste de whisper-large-v3) | 3,59 | 13,46 | Referencia externa |
| BH-Speech-1-2B | — | — | No entrenado, sin pesos |

No se han publicado resultados de benchmarks propios en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no existir pesos. Como referencia del modelo base Whisper large-v3, la inferencia en fp16 requiere aproximadamente 3-4 GB de VRAM; en int8, alrededor de 2 GB.
- GPU recomendadas: no disponible para este modelo. Para el equivalente Whisper large-v3: cualquier GPU con 4 GB o más de VRAM en fp16 (RTX 3060, RTX 4060, RTX 4090) y A100/H100 para procesamiento por lotes de alto volumen.
- GPU de consumo: sí cabría en tarjetas de 8 GB o más en fp16, y en 4 GB con cuantización int8, asumiendo que los pesos finales mantengan el tamaño de Whisper large-v3.
- Opciones de despliegue: `transformers` (documentado en la model card), y por compatibilidad con Whisper large-v3, potencialmente faster-whisper, vLLM y WhisperX; ninguna de estas integraciones está verificada para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | WER (FLEURS bs_ba) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-Speech-1-2B | 1,55B (base Whisper large-v3) | 30 s | — (no entrenado) | Apache-2.0 | Sin pesos |
| BuzzASR/bosnian | 1,55B (Whisper large-v3 FT) | 30 s | 13,46 | MIT | Pesos publicados |
| openai/whisper-large-v3 | 1,55B | 30 s | no disponible para bs_ba | Apache-2.0 | Pesos publicados |

La comparación directa es desfavorable en disponibilidad: el único modelo bosnio con métricas verificadas en la información proporcionada es BuzzASR/bosnian, que sirve además como baseline del proyecto. Whisper large-v3 sin ajuste no tiene cifra publicada para este test en la documentación disponible.

## Limitaciones y advertencias

- El modelo no está entrenado y no contiene pesos: cualquier intento de uso devuelve solo la tarjeta del repositorio. No es desplegable en producción.
- El nombre "2B" no coincide con el tamaño de Whisper large-v3 (1,55B); no se documenta una ampliación de parámetros.
- El WER de referencia (13,46) corresponde a un modelo externo, no a este; no debe citarse como rendimiento propio.
- El conjunto de datos de entrenamiento planificado (FLEURS `bs_ba`) es de dominio y temática limitados, lo que puede reducir la generalización a audio espontáneo, ruidoso o con acentos regionales.
- El autor descarta explícitamente `shunyalabs/bosnian-speech-dataset` por licencia no confirmada y posible repackaging de FLEURS, y señala que el subconjunto bosnio de Common Voice no está verificado.
- Licencia Apache-2.0 permite uso comercial, pero al no existir pesos la licencia es teórica hasta la publicación.
- Riesgo de alucinación: inherente a los modelos Whisper en segmentos silenciosos o con ruido; no evaluado para este ajuste.
- Sesgos: no documentados; la evaluación sobre un único test de FLEURS no cubre variación dialectal, género ni edad de los hablantes.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (26 de noviembre de 2026), lo que refuerza su carácter de anuncio y no de artefacto estable.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bh-speech-1-2b
- Repositorio del proyecto: https://github.com/BH-Language-AI/bh-speech
- Colección BH-Speech: https://huggingface.co/collections/BH-Language-AI/bh-speech
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Baseline de referencia: https://huggingface.co/BuzzASR/bosnian
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Paper de Whisper: https://arxiv.org/abs/2212.04356
