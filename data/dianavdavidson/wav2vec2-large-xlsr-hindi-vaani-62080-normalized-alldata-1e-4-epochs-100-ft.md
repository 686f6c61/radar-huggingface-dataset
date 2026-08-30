# dianavdavidson/wav2vec2-large-xlsr-hindi-vaani-62080-normalized-alldata-1e-4-epochs-100-FT

## Resumen

El modelo `wav2vec2-large-xlsr-hindi-vaani-62080-normalized-alldata-1e-4-epochs-100-FT` es un sistema de reconocimiento automático del habla (ASR) desarrollado por dianavdavidson, especializado en la transcripción de audio en hindi. Se trata de un fine-tuning del modelo base `skylord/wav2vec2-large-xlsr-hindi`, que a su vez deriva de la arquitectura wav2vec2 de Facebook, preentrenada de forma autosupervisada sobre 53 idiomas (XLSR-53). El modelo cuenta con 315,48 millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su enfoque específico para el hindi, un idioma con escasez de sistemas ASR de código abierto de calidad. El nombre del repositorio sugiere que fue entrenado sobre el dataset Vaani (un corpus de habla en hindi), aunque la model card no confirma explícitamente la fuente de datos. El entrenamiento se realizó durante 100 épocas con una tasa de aprendizaje de 1e-4, alcanzando una pérdida de validación de 0,3696 y un WER global de 13,09 % en el conjunto de evaluación. A pesar de que no se han publicado benchmarks comparativos, el modelo ofrece una alternativa ligera y de fácil despliegue para tareas de transcripción en hindi.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (Transformer encoder con módulo de cuantización y cabecera CTC) |
| Parametros totales | 315.480.745 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz, sin ventana de contexto textual especificada) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión completa) |
| Idiomas soportados | hindi (según el nombre del modelo; no confirmado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec2, un encoder Transformer preentrenado de forma autosupervisada sobre audio crudo. La versión base, `facebook/wav2vec2-large-xlsr-53`, fue entrenada con 53 idiomas mediante un objetivo de contraste que predice unidades latentes cuantizadas. Sobre esta base, `skylord/wav2vec2-large-xlsr-hindi` realizó un fine-tuning inicial para hindi, y el modelo aquí descrito continúa ese ajuste con un dataset adicional (probablemente el corpus Vaani, según el nombre del repositorio).

El entrenamiento se llevó a cabo con los siguientes hiperparámetros: tasa de aprendizaje de 0,0001, tamaño de lote de 16 (32 con acumulación de gradientes), optimizador AdamW, scheduler constante con warmup de 500 pasos, y 100 épocas completas. Se utilizó precisión mixta nativa (AMP). La pérdida de entrenamiento descendió de 6,15 en la primera época a 0,0855 en la época 30, mientras que el WER de validación se redujo de 47,10 % a 13,09 %. No se especifica la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de aumento de datos o normalización adicionales, aunque el nombre del modelo sugiere que se usaron datos normalizados.

## Capacidades

- Transcripción de audio en hindi: convierte señales de voz a texto, adecuado para grabaciones de campo, entrevistas o contenido multimedia.
- Reconocimiento de habla continua: maneja frases completas y no solo comandos aislados, gracias a la decodificación CTC.
- Procesamiento de audio a 16 kHz: compatible con la mayoría de los pipelines de ASR estándar.
- No se han documentado capacidades adicionales como tool calling, agentes, razonamiento multi-paso o soporte multilingüe más allá del hindi.

## Casos de uso

- Transcripción de reuniones y entrevistas en hindi: el modelo puede procesar grabaciones de audio y generar actas textuales, con un WER de 13 % en condiciones de evaluación, lo que lo hace útil para entornos controlados.
- Generación de subtítulos para vídeo en hindi: integrable en pipelines de postproducción para crear subtítulos automáticos, reduciendo el coste de transcripción manual.
- Asistente de voz para aplicaciones móviles: al ser ligero (315M parámetros), puede desplegarse en servidores de baja capacidad o en dispositivos con aceleración por CPU para comandos de voz básicos.
- Análisis de llamadas en centros de atención al cliente: transcripción de conversaciones para su posterior análisis de sentimiento o cumplimiento normativo, siempre que el audio sea de calidad razonable.
- Accesibilidad: transcripción en tiempo real para personas con discapacidad auditiva en entornos educativos o laborales, usando herramientas de streaming.
- Archivado de contenido oral: digitalización de archivos de audio históricos o entrevistas en hindi para su búsqueda y recuperación textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta los siguientes valores de evaluación durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida de validación | 0,3696 |
| WER global | 13,0918 % |

Estos datos corresponden al conjunto de evaluación utilizado por el autor, pero no se especifica su composición ni se comparan con otros modelos. No se dispone de resultados en MMLU, HumanEval u otros benchmarks estándar, ya que se trata de un modelo de ASR y no de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32 (tamaño del repositorio), por lo que cabe en GPUs con 2 GB o más. Con cuantización a int8 o fp16, el consumo podría reducirse a ~700 MB, aunque no se ofrecen versiones cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA T4, V100, RTX 2080 o superiores. También es viable en CPU para inferencia por lotes, aunque con mayor latencia.
- Despliegue: compatible con la librería `transformers` mediante el pipeline `automatic-speech-recognition`. Se puede servir con `vLLM` (aunque no es óptimo para wav2vec2), `TGI` o directamente con `torch`. Para entornos ligeros, `llama.cpp` no es aplicable; se recomienda usar `transformers` o `faster-whisper` (aunque este último es específico de Whisper).
- Latencia y throughput: no se han publicado mediciones. En una GPU T4, se espera una latencia de decodificación de unos pocos segundos para audios de 10-30 segundos, dependiendo de la longitud y la implementación.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos ASR para hindi en la información proporcionada. Como referencia, se pueden mencionar alternativas genéricas:

| Modelo | Parametros | Contexto | WER (hindi) | Licencia |
|---|---|---|---|---|
| Este modelo | 315M | no disponible | 13,09 % (evaluación propia) | Apache 2.0 |
| `jonatasgrosman/wav2vec2-large-xlsr-53-hindi` | 315M | no disponible | no disponible | Apache 2.0 |
| `openai/whisper-small` | 244M | 448 tokens de audio | no disponible | MIT |

No se ha verificado el rendimiento de los modelos alternativos en hindi, por lo que esta tabla es orientativa y no constituye una comparativa rigurosa.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado; el nombre sugiere el corpus Vaani, pero no se confirma su composición, tamaño ni licencia, lo que puede afectar a la reproducibilidad y a posibles sesgos.
- El WER de 13 % se obtuvo en un conjunto de evaluación no especificado; en condiciones de ruido, acentos regionales o audio de baja calidad, el rendimiento puede degradarse significativamente.
- El modelo está especializado en hindi y no soporta otros idiomas; no se ha evaluado su comportamiento con habla mezclada (hinglish) u otros dialectos.
- No se han publicado análisis de sesgos ni de alucinaciones; como todo sistema ASR, puede producir transcripciones incorrectas en contextos ambiguos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `skylord/wav2vec2-large-xlsr-hindi` y el dataset subyacente podrían tener restricciones adicionales que no se detallan.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad; se recomienda probar el modelo en casos de uso reales antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dianavdavidson/wav2vec2-large-xlsr-hindi-vaani-62080-normalized-alldata-1e-4-epochs-100-FT
- Modelo base: https://huggingface.co/skylord/wav2vec2-large-xlsr-hindi
- Arquitectura XLSR-53 original: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Referencia a modelos similares (búsqueda web): https://huggingface.co/dianavdavidson/wav2vec2-large-xlsr-53-vaani-62031-normalized-alldata-1e-4-epochs-50-FT
