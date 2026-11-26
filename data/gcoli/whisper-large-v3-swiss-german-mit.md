# gcoli/whisper-large-v3-swiss-german-mit

## Resumen

Whisper Large-v3 Swiss German MIT es un modelo de reconocimiento automático del habla (ASR) especializado en dialectos del alemán suizo. Se trata de un fine-tune mediante LoRA del modelo `openai/whisper-large-v3` de OpenAI, desarrollado por el usuario gcoli, en el que los adaptadores se han fusionado en los pesos finales. El modelo transcribe audio en alemán suizo (`gsw`) y lo devuelve en alemán estándar (`de`), no en grafía dialectal.

Su relevancia principal es la cadena de licencias: parte de un modelo base Apache-2.0 y se entrena únicamente con material bajo licencia MIT (Swiss Parliaments Corpus v2 de FHNW/i4ds y el corpus de audio del Gemeinderat de Zúrich), produciendo un checkpoint MIT utilizable comercialmente. La mayoría de los modelos públicos de alemán suizo heredan licencias CC BY-NC de SwissDial y no admiten uso comercial, por lo que este checkpoint cubre un hueco real.

Con 1.543 millones de parámetros, arquitectura transformer encoder-decoder de Whisper y una ventana de contexto de audio de 30 segundos por segmento, el modelo mejora en 1,9 puntos de WER al base sin fine-tune a velocidad idéntica, y en grabaciones largas queda a la par de la mejor referencia no comercial (25,45 % frente a 25,25 % de WER).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), fine-tune LoRA fusionado |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por segmento (arquitectura Whisper) |
| Tipos de cuantizacion | float16 (safetensors y CTranslate2), int8_float16 (CTranslate2), conversion a MLX para Apple Silicon |
| Idiomas soportados | gsw (alemán suizo), de (alemán estándar como salida) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp16) en la raíz del repo; CTranslate2 float16 en `ct2/` |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `openai/whisper-large-v3`, un transformer encoder-decoder con atención estándar diseñado para ASR. El ajuste se realizó con LoRA de rango 32 y alpha 64 sobre las proyecciones `q_proj` y `v_proj`, con dropout de 0,05, y los adaptadores se fusionaron en los pesos tras el entrenamiento. La optimización usó learning rate 3e-4 con decaimiento lineal, 500 pasos de warmup, una época, batch de 8 con acumulación de 2, bf16 y gradient checkpointing, sobre una única RTX 3080 Ti de 12 GB en aproximadamente 2,2 horas.

Los datos de entrenamiento suman 100 horas: 20 h del Swiss Parliaments Corpus v2 de FHNW/i4ds (Bern) y 80 h del corpus del Gemeinderat de Zúrich. El corpus de Zúrich es solo audio; sus transcripciones se generaron con `openai/whisper-large-v3` y se filtraron por confianza (`avg_logprob > -0.45`, `no_speech_prob < 0.3`, ratio de compresión < 2,2 y rechazo de bucles de repetición). Entre los hallazgos del autor destacan que el learning rate domina el resultado (1e-3 no aportó nada; 3e-4 ganó 1,8 puntos de inmediato) y que la mezcla de fuentes importa más que el volumen: duplicar las pseudo-etiquetas de Zúrich a 160 h no cambió nada.

## Capacidades

- Transcripción de voz a texto en dialectos del alemán suizo, con salida en alemán estándar.
- Reconocimiento robusto en 17 dialectos suizos distintos según el conjunto de evaluación del autor.
- Procesamiento de grabaciones largas (se han medido ficheros de ~15 minutos) con la configuración adecuada de decodificación.
- Funcionamiento en dos runtimes: transformers (pipeline `automatic-speech-recognition`) y faster-whisper/CTranslate2.
- Cuantización a int8_float16 para entornos con VRAM limitada, con un coste aproximado de 0,3 puntos de WER.
- Conversión a MLX para ejecución en Apple Silicon.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- Sin capacidades de visión, audio generativo ni thinking mode.

## Casos de uso

- Transcripción de sesiones parlamentarias y plenos municipales: el modelo se entrenó con corpus de parlamentos suizos y ayuntamientos, por lo que encaja directamente en la digitalización de actas de Berna y Zúrich con salida en alemán estándar.
- Subtitulado de contenido audiovisual en dialecto suizo: permite generar subtítulos en alemán estándar para vídeos, entrevistas o programas regionales que de otro modo requerirían transcripción manual.
- Atención al cliente con voz en Suiza germanófona: transcripción de llamadas o mensajes de voz en dialecto para su posterior procesamiento por un LLM o un sistema de ticketing, usando faster-whisper en GPU para baja latencia.
- Actas de reuniones de empresa: grabaciones de varios minutos se transcriben con `condition_on_previous_text=False` y sin VAD, configuración que el autor midió como la más estable en audio largo (25,45 % de WER en ficheros de ~15 min).
- Investigación lingüística y dialectología: generación de transcripciones normalizadas a alemán estándar de corpus dialectales, con licencia MIT que permite publicar derivados y compartir resultados sin restricciones no comerciales.
- Archivística y preservación digital: transcripción masiva de fondos de audio histórico en alemán suizo en pipelines por lotes con CTranslate2, donde el RTF de 0,080 sobre RTX 3080 Ti permite procesar horas de audio en minutos.
- Integración en aplicaciones de accesibilidad: dictado y transcripción en tiempo real para usuarios de dialecto suizo, desplegable en servidores con una sola GPU consumer.

## Benchmarks y rendimiento

Medido sobre el All Swiss German Dialects Test Set de FHNW/i4ds (MIT, 5750 clips, 12,7 h, 17 dialectos), decodificado con faster-whisper (CTranslate2, float16, beam 5) en una RTX 3080 Ti. La mitad `dev` (2930 clips) se usó para selección de modelo; la mitad `final` (2820 clips) quedó reservada.

| Modelo | WER dev | WER final | CER | RTF |
|---|---|---|---|---|
| Este checkpoint | 22,1 % | 24,7 % | 12,7 % | 0,080 |
| `openai/whisper-large-v3` sin fine-tune | 24,0 % | 26,3 % | 13,7 % | 0,080 |
| `openai/whisper-large-v3-turbo` sin fine-tune | 26,5 % | 28,5 % | 14,6 % | 0,036 |
| Fine-tune turbo del mismo autor | 23,7 % | 25,9 % | 13,4 % | 0,033 |

En grabaciones largas (26 ficheros de ~15 min construidos concatenando la mitad reservada del test set), este checkpoint alcanza 25,45 % de WER frente a 25,25 % de la mejor referencia no comercial (CC BY-NC) medida por el autor. En frases sueltas la diferencia es de 1,19 puntos; en audio largo se reduce a 0,20 puntos, dentro del ruido de medición. El WER y el CER son medias por clip tras normalización (minúsculas, sin puntuación, `ß` → `ss`).

## Requisitos de hardware

- VRAM estimada: en float16, el checkpoint de 1,54 mil millones de parámetros ocupa aproximadamente 3,1 GB de pesos, más overhead de activaciones y decodificación; en la práctica cabe holgadamente en GPUs de 8-12 GB. En int8_float16 baja a unos 1,6 GB de pesos.
- GPU recomendadas: RTX 3080 Ti (la usada en el entrenamiento y en las mediciones), RTX 4090, A100 y H100 para despliegues de alto throughput. Cualquier GPU consumer con al menos 8 GB de VRAM es suficiente para inferencia en float16.
- Cabe en GPU consumer: sí, en RTX 3060/3070/3080/4060/4070/4080/4090 y equivalentes.
- Opciones de despliegue: transformers (pipeline de ASR), faster-whisper con CTranslate2 (recomendado para producción, carpeta `ct2/`), y conversión a MLX para Apple Silicon.
- Latencia y throughput: RTF de 0,080 con CTranslate2 float16 y beam 5, es decir, aproximadamente 12,5 veces más rápido que tiempo real en una RTX 3080 Ti. La variante turbo del mismo autor ofrece RTF de 0,033 (unas 30 veces tiempo real) a costa de 1,6 puntos de WER.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER final (test del autor) | Licencia | Comentario |
|---|---|---|---|---|---|
| Este checkpoint | 1,54 B | 30 s por segmento | 24,7 % | MIT | Uso comercial permitido |
| `openai/whisper-large-v3` | 1,54 B | 30 s por segmento | 26,3 % | Apache-2.0 | Base sin fine-tune; peor en dialecto suizo |
| Fine-tune turbo del mismo autor | ~0,81 B | 30 s por segmento | 25,9 % | MIT | 2,4 veces más rápido, 1,2 puntos peor |
| Mejor referencia no comercial (CC BY-NC) | no disponible | 30 s por segmento | 25,25 % en audio largo | CC BY-NC | No apto para uso comercial |

## Limitaciones y advertencias

- La salida es siempre alemán estándar, no grafía dialectal; no debe esperarse transcripción fonética del dialecto.
- El WER absoluto sigue siendo alto (24,7 % en el conjunto de test), por lo que la transcripción requiere revisión humana en contextos críticos como actas oficiales o documentación legal.
- En grabaciones largas, `condition_on_previous_text` debe desactivarse: el autor midió un empeoramiento de 11,7 puntos de WER en la familia large con esta opción activa, además de un 14 % de texto de más por invención. El filtro VAD tampoco ayudó.
- Las transcripciones del corpus de Zúrich son pseudo-etiquetas generadas por Whisper large-v3, con el sesgo y los errores que ello implica en el entrenamiento.
- El modelo está especializado en alemán suizo; su rendimiento en otros dialectos del alemán o en alemán estándar no se ha medido en la información disponible.
- Riesgo de alucinación y bucles de repetición en audio con ruido, silencios largos o solapamientos de hablantes, típico de la arquitectura Whisper.
- La licencia MIT permite uso comercial, pero el modelo base Apache-2.0 y los datos MIT imponen sus propias condiciones de atribución; conviene revisar la cadena completa antes de redistribuir.
- No se han publicado mediciones de sesgo demográfico, de género ni de robustez ante acentos no suizos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gcoli/whisper-large-v3-swiss-german-mit
- Variante turbo del mismo autor: https://huggingface.co/gcoli/whisper-large-v3-turbo-swiss-german-mit
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Dataset Swiss Parliaments Corpus: https://huggingface.co/datasets/i4ds/SPC
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- mlx-whisper: https://github.com/ml-explore/mlx-examples/tree/main/whisper
