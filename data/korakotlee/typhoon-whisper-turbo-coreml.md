# korakotlee/typhoon-whisper-turbo-coreml

## Resumen

Typhoon Whisper Turbo es un modelo de reconocimiento automático del habla (ASR) especializado en tailandés, desarrollado por el equipo Typhoon de SCB 10X. Se trata de un fine-tuning del modelo OpenAI Whisper Large v3 Turbo, diseñado para ofrecer un equilibrio entre precisión y baja latencia en la transcripción offline de audio en tailandés. El modelo se presentó en el artículo técnico "Typhoon ASR Real-time: FastConformer-Transducer for Thai Automatic Speech Recognition" (arXiv:2601.13044).

La relevancia de este modelo radica en que aborda un problema específico: el tailandés es un idioma con recursos limitados en ASR y con características fonéticas complejas (tonos, ausencia de espacios entre palabras). El modelo reduce la arquitectura del decodificador de 32 capas del Whisper Large v3 original a solo 4 capas, lo que disminuye significativamente la huella de memoria y mejora el rendimiento de inferencia, manteniendo una precisión competitiva. Se entrenó con aproximadamente 11 000 horas de audio tailandés normalizado.

Esta ficha se basa en la información pública disponible del repositorio de HuggingFace y la model card del autor. El identificador específico `korakotlee/typhoon-whisper-turbo-coreml` parece ser una variante de conversión a CoreML del modelo original `scb10x/typhoon-whisper-turbo`, aunque la documentación disponible no detalla diferencias específicas de esta variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Large v3 Turbo (encoder + decoder, 4 capas de decoder) |
| Parametros totales | no disponible (el modelo base Whisper Large v3 Turbo tiene aproximadamente 809 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 448 tokens (herencia de Whisper Large v3 Turbo) |
| Tipos de cuantizacion | no disponible (el repo usa safetensors; la variante CoreML puede tener formatos adicionales) |
| Idiomas soportados | Tailandés (th) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers); la variante CoreML añade formato .mlmodel |

## Arquitectura y entrenamiento

Typhoon Whisper Turbo se basa en la arquitectura encoder-decoder de Whisper Large v3 Turbo. La principal modificación frente al Whisper Large v3 estándar es la reducción del decodificador de 32 a 4 capas, lo que reduce el coste computacional y la memoria necesaria durante la inferencia. El encoder se mantiene intacto. Esta arquitectura compacta permite un mayor throughput sin sacrificar de forma significativa la precisión en tailandés.

El entrenamiento se realizó sobre aproximadamente 11 000 horas de audio tailandés, combinando Gigaspeech2 (habla limpia y académica), CommonVoice (muestras diversas de habla crowdsourced) y datos de medios públicos curados internamente por SCB 10X. Todos los datos se normalizaron mediante el pipeline de datos de Typhoon, que garantiza un tratamiento consistente de números tailandeses, marcadores de repetición y ambigüedades dependientes del contexto. No se menciona el uso de RLHF o DPO en la documentación disponible.

## Capacidades

- Transcripción de audio en tailandés a texto con alta precisión.
- Generación de marcas de tiempo (timestamps) en la transcripción.
- Manejo de audio con chunking de 30 segundos y procesamiento por lotes (batch_size 16).
- Inferencia eficiente gracias a la arquitectura reducida (4 capas de decoder).
- Soporte de transcripción offline (no streaming).
- Integración con el pipeline `automatic-speech-recognition` de HuggingFace Transformers.
- Compatible con aceleración por GPU (CUDA) y CPU.
- La variante CoreML permite despliegue en entornos Apple (iOS/macOS).

## Casos de uso

- Transcripción de reuniones y entrevistas en tailandés: el modelo puede procesar grabaciones de audio largas dividiéndolas en chunks de 30 segundos, lo que permite transcribir reuniones completas con marcas de tiempo para su posterior revisión.
- Subtitulado automático de vídeo en tailandés: la generación de timestamps y la precisión en tailandés hacen adecuado este modelo para generar subtítulos de contenido audiovisual, tanto para plataformas de streaming como para creadores de contenido.
- Análisis de llamadas de atención al cliente: las empresas tailandesas pueden transcribir llamadas de soporte para analizar sentimiento, calidad del servicio y detectar problemas recurrentes, aprovechando la baja latencia del modelo.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos de noticias, podcasts o material de archivo en tailandés para hacerlos buscables por texto.
- Asistentes de voz y dictado en tailandés: la eficiencia del modelo permite su integración en aplicaciones de dictado o asistentes personales que requieren respuesta rápida y bajo consumo de recursos.
- Investigación lingüística y procesamiento de corpus: los investigadores pueden utilizar el modelo para transcribir grandes volúmenes de audio tailandés, creando corpus anotados para estudios fonéticos o entrenamiento de otros modelos de NLP.

## Benchmarks y rendimiento

La model card menciona que el modelo alcanza un rendimiento competitivo frente a modelos offline a gran escala en tareas de reconocimiento de habla tailandesa. Se hace referencia a una gráfica de frontera de Pareto que compara precisión (CER) frente a velocidad de inferencia en los conjuntos de prueba Gigaspeech2 (Clean/Academic), TVSpeech (Noisy/In-the-wild) y Google Fleurs (tailandés). Sin embargo, la documentación disponible no incluye los valores numéricos concretos de CER para cada conjunto de prueba.

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 1,6 GB, lo que sugiere que el modelo en precisión completa (fp32) ocupa aproximadamente 3,2 GB en memoria (809 M parámetros × 4 bytes).
- Con cuantización a bf16, la memoria necesaria se reduce a aproximadamente 1,6 GB, lo que permite su ejecución en GPUs de consumo como la RTX 3060 (12 GB) o superiores.
- La variante CoreML está diseñada para dispositivos Apple (Apple Silicon), pudiendo ejecutarse en CPU/GPU unificada de Macs y iPhones.
- Para inferencia en producción, se recomienda al menos una GPU con 8 GB de VRAM para trabajar con lotes de tamaño razonable.
- Opciones de despliegue: HuggingFace Transformers, pipeline de ASR, y para la variante CoreML, Core ML framework de Apple.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Typhoon Whisper Turbo (este modelo) | ~809 M (estimado) | 448 tokens | Tailandés | MIT | 4 capas de decoder, optimizado para tailandés |
| OpenAI Whisper Large v3 Turbo | ~809 M | 448 tokens | Multilingüe (99 idiomas) | MIT | Modelo base, mayor latencia en tailandés |
| OpenAI Whisper Large v3 | ~1550 M | 448 tokens | Multilingüe (99 idiomas) | MIT | 32 capas de decoder, mayor precisión pero más lento |
| Typhoon Whisper (versión no Turbo) | no disponible | no disponible | Tailandés | MIT | Versión completa, mayor precisión pero menor velocidad |

La comparativa se basa en la información disponible. El modelo compite directamente con los Whisper multilingües para la tarea específica de ASR en tailandés, ofreciendo un mejor equilibrio entre velocidad y precisión para este idioma.

## Limitaciones y advertencias

- El modelo está optimizado exclusivamente para tailandés; su rendimiento en otros idiomas no está garantizado.
- El rendimiento puede degradarse con dialectos o acentos no representados adecuadamente en los datos de entrenamiento.
- No está diseñado para transcripción en streaming en tiempo real; es adecuado para transcripción offline.
- La documentación no detalla el comportamiento en audio con ruido extremo, música de fondo o múltiples hablantes simultáneos.
- Aunque la licencia es MIT, el uso del modelo está sujeto a los Términos y Condiciones de OpenTyphoon (https://opentyphoon.ai/tac) y a su Política de Privacidad (https://opentyphoon.ai/privacy).
- La variante CoreML puede tener limitaciones específicas de plataforma (iOS/macOS) que no están documentadas en la model card.
- No se proporcionan datos sobre posibles sesgos en el reconocimiento de diferentes variedades del tailandés o grupos demográficos.

## Enlaces

- Repositorio HuggingFace (variante CoreML): https://huggingface.co/korakotlee/typhoon-whisper-turbo-coreml
- Repositorio HuggingFace (modelo original): https://huggingface.co/scb10x/typhoon-whisper-turbo
- Paper arXiv: https://arxiv.org/abs/2601.13044
- Página del proyecto: https://opentyphoon.ai/model/typhoon-asr-realtime
- Repositorio GitHub: https://github.com/scb-10x/typhoon-asr
- Términos y condiciones: https://opentyphoon.ai/tac
- Política de privacidad: https://opentyphoon.ai/privacy
