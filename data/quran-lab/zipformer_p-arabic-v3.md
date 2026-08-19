# Quran-Lab/zipformer_p-arabic-v3

## Resumen

zipformer_p-arabic-v3 es un modelo de reconocimiento automático del habla (ASR) de streaming desarrollado por Quran-Lab, diseñado específicamente para la transcripción fonética de la recitación del Corán según la transmisión de Hafs 'an 'Asim. Con 65,5 millones de parámetros, está construido sobre la arquitectura Zipformer2 con una cabeza CTC, y transcribe la recitación directamente a un alfabeto fonético coránico de 251 símbolos que codifica distinciones relevantes para el tajweed: longitud de madd, geminación, ghunna, ikhfaa, qalqalah y las consonantes enfáticas.

El modelo resuelve un problema muy específico: la transcripción fonética de alta precisión de la recitación coránica, que va más allá de la mera transcripción de palabras árabes. Al trabajar a nivel de fonemas, permite aplicaciones como la corrección automática de tajweed, la evaluación de la pronunciación y el análisis de la recitación. Su arquitectura de streaming lo hace adecuado para aplicaciones en tiempo real, como asistentes de aprendizaje interactivos.

La relevancia de este modelo radica en su especialización: mientras que los modelos ASR generales como Whisper pueden transcribir árabe, no capturan las sutilezas fonéticas del tajweed que son esenciales para la correcta recitación coránica. Este modelo llena ese vacío con una precisión notable en datos de estudio y una degradación controlada en condiciones más realistas. El acceso es restringido (gated) y requiere aceptar los términos de la licencia NPL-1.1 en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 con cabeza CTC |
| Parametros totales | 65,5 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio incluye formatos ONNX y CoreML) |
| Idiomas soportados | Arabe (recitacion coranica, Hafs 'an 'Asim) |
| Licencia | NPL-1.1 (licencia no comercial) |
| Formato de pesos | Safetensors (inferencia), ONNX, CoreML |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Zipformer2, una evolución del Zipformer original desarrollado por el equipo de K2-FSA, que combina bloques de atención con mecanismos de downsampling/upsampling para reducir el coste computacional manteniendo la calidad. La cabeza de decodificación es CTC (Connectionist Temporal Classification), lo que permite un entrenamiento eficiente y una inferencia rápida sin necesidad de un decodificador autoregresivo.

La salida del modelo es un alfabeto fonético de 251 símbolos específicamente diseñado para el Corán, que captura distinciones fonéticas que el árabe estándar no representa. Esto incluye la duración de las vocales largas (madd), la geminación (shaddah), la nasalización (ghunna), la asimilación (ikhfaa), la pronunciación de la letra qaf (qalqalah) y las consonantes enfáticas. Los detalles exactos del conjunto de datos de entrenamiento (número de tokens, composición, uso de RLHF o DPO) no están disponibles en la información proporcionada, pero el modelo está diseñado para recitación de estudio y audio telefónico real.

## Capacidades

- Transcripción fonética de recitación coránica en tiempo real (streaming) gracias a la arquitectura Zipformer2 con CTC.
- Codificación de distinciones de tajweed: madd (alargamiento vocálico), geminación, ghunna (nasalización), ikhfaa (asimilación), qalqalah (vibración de ciertas consonantes) y consonantes enfáticas.
- Soporte para inferencia en múltiples formatos: safetensors, ONNX y CoreML, lo que facilita el despliegue en diferentes entornos.
- Capacidad de procesamiento de audio en streaming, adecuado para aplicaciones en tiempo real.
- No tiene capacidades de tool calling, agentes, visión ni generación de texto: es un modelo ASR puro.
- Multilingüe: no, está especializado exclusivamente en árabe coránico.

## Casos de uso

- Aplicaciones de aprendizaje de tajweed: el modelo puede analizar la recitación de un estudiante en tiempo real y señalar errores fonéticos específicos (madd demasiado corto, ghunna insuficiente, etc.) gracias a su alfabeto fonético de 251 símbolos.
- Corrección automática de recitación para certificación: plataformas que evalúan la recitación de alumnos y emiten certificados de competencia pueden usar este modelo como primer filtro automático, reduciendo el trabajo de los evaluadores humanos.
- Asistentes de memorización del Corán: integrado en una app, el modelo puede escuchar la recitación del usuario, detectar errores de pronunciación y proporcionar retroalimentación inmediata, lo que facilita la memorización autónoma con corrección de tajweed.
- Análisis de recitación para investigación: investigadores en estudios coránicos o lingüística árabe pueden usar el modelo para transcribir grandes corpus de recitaciones a un alfabeto fonético estándar, facilitando el análisis computacional de variantes de pronunciación.
- Búsqueda fonética en bibliotecas de audio: el modelo permite indexar recitaciones por fonemas, posibilitando búsquedas del tipo "encuentra todas las ocurrencias de qalqalah en la sura X" en grandes colecciones de audio.
- Aplicaciones de streaming para entornos con recursos limitados: gracias a su tamaño compacto (65,5 M de parámetros) y soporte ONNX, puede ejecutarse en dispositivos móviles o edge para retroalimentación en tiempo real sin conexión a servidores.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor del modelo en el model-index de HuggingFace, evaluados sobre el dataset Quran-Lab/quranic-asr-benchmark (v1.1):

| Metrica | Condicion | Valor |
|---|---|---|
| Phoneme Error Rate (PER) | Recitadores de estudio reservados (held-out) | 1,43 % |
| Phoneme Error Rate (PER) | Audio telefónico real | 3,65 % |
| Phoneme Error Rate (PER) | Recitador no visto (unseen) | 9,1 % |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un modelo de 65,5 M de parámetros, la VRAM necesaria para inferencia es muy reducida: aproximadamente 0,3-0,5 GB en FP32, y menos de 0,2 GB en cuantización INT8 (si se aplicara).
- Puede ejecutarse en cualquier GPU consumer moderna (GTX 1060, RTX 3060, etc.) y también en CPU con razonable rendimiento gracias a su tamaño compacto.
- Los formatos ONNX y CoreML facilitan el despliegue en dispositivos móviles (iOS, Android) y en entornos edge.
- Opciones de despliegue: al ser un modelo ASR con arquitectura Zipformer, no es compatible directamente con vLLM, Ollama o TGI (diseñados para LLM). Se recomienda usar frameworks de inferencia ONNX Runtime, CoreML, o el stack de K2-FSA (icefall) para despliegue en producción.
- La latencia en streaming dependerá del hardware, pero dada la arquitectura eficiente y el tamaño reducido, es adecuada para aplicaciones en tiempo real incluso en CPU modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Enfoque | Licencia |
|---|---|---|---|---|
| zipformer_p-arabic-v3 (Quran-Lab) | 65,5 M | Zipformer2 + CTC | Transcripción fonética coránica (tajweed) | NPL-1.1 (no comercial) |
| whisper-large-v3-turbo-ar-quran (Naazimsnh02) | ~809 M | Whisper (Transformer) | Transcripción de recitación coránica a texto árabe estándar | MIT (depende del fine-tuning) |
| Muno459/zipformer_p-quran | No disponible | Zipformer + CTC | Transcripción fonética coránica (versión anterior) | No disponible |

La comparativa muestra que zipformer_p-arabic-v3 es significativamente más pequeño que alternativas basadas en Whisper, lo que lo hace más adecuado para despliegue en edge y streaming. Sin embargo, su licencia NPL-1.1 restringe el uso comercial, a diferencia de la licencia MIT del fine-tuning de Whisper. El modelo de Muno459 parece ser una versión anterior o similar, pero no se dispone de detalles suficientes para una comparación completa.

## Limitaciones y advertencias

- Licencia NPL-1.1: es una licencia no comercial, por lo que no puede utilizarse en productos o servicios con fines de lucro sin autorización expresa del titular.
- Acceso restringido (gated): requiere aceptar condiciones adicionales en HuggingFace antes de poder descargar el modelo.
- Especialización extrema: el modelo solo transcribe recitación coránica según Hafs 'an 'Asim. No funcionará correctamente con otros estilos de recitación (Warsh, Qalun, etc.) ni con árabe hablado general.
- Riesgo de alucinación: como todo modelo ASR, puede producir transcripciones incorrectas en audio con ruido o recitadores no vistos, como refleja el PER del 9,1 % en la condición de recitador no visto.
- Sin capacidades multilingües: no soporta otros idiomas ni dialectos árabes fuera del contexto coránico.
- Sin información sobre el dataset de entrenamiento: no se han publicado detalles sobre la composición del corpus, lo que dificulta evaluar posibles sesgos hacia ciertos recitadores o estilos.
- Formato de salida especializado: el alfabeto fonético de 251 símbolos requiere un post-procesamiento específico para ser útil en aplicaciones; no produce texto árabe estándar directamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quran-Lab/zipformer_p-arabic-v3
- Repositorio del proyecto Quran Lab (app de aprendizaje): https://github.com/ADANiD-AI/QuranLab
- Modelo alternativo basado en Whisper: https://github.com/Naazimsnh02/whisper-large-v3-turbo-ar-quran
- Incubadora QuranLab: https://digitalquranlab.github.io/
