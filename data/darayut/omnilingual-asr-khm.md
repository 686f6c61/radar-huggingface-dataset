# Darayut/Omnilingual-ASR-Khm

## Resumen

Omnilingual-ASR-Khm es un modelo de reconocimiento automático del habla (ASR) para el idioma jemer (khmer), desarrollado por Nhem Darayut. Se construye sobre el encoder de 300 millones de parámetros del sistema Omnilingual ASR de Meta, al que se añade una cabeza CTC autocondicionada y un vocabulario personalizado a nivel de clúster. El modelo está diseñado para transcribir audio en jemer, incluyendo escenarios de alternancia de código entre jemer e inglés, y se publica bajo licencia MIT con pesos en formato safetensors.

La relevancia de este modelo radica en que el jemer es una lengua con escasos recursos en el ámbito del ASR, y esta propuesta ofrece una solución open-source con resultados competitivos en conjuntos de validación y pruebas. Su arquitectura parte del checkpoint público `omniASR_CTC_300M` y se entrena en dos fases: primero un preentrenamiento sobre un corpus de habla jemer y después un ajuste fino con datos de code-switching jemer-inglés. Con 320 millones de parámetros totales, es un modelo compacto que puede ejecutarse en GPUs de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder CTC basado en Omnilingual ASR 300M, con vocabulario de clúster y cabeza CTC autocondicionada |
| Parametros totales | 320.014.139 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de audio, no procesa texto de entrada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | km (jemer) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de reconocimiento de voz basada en CTC (Connectionist Temporal Classification). El encoder proviene del checkpoint `omniASR_CTC_300M` de Meta, que forma parte de la familia Omnilingual ASR, un sistema de preentrenamiento autosupervisado a gran escala para representaciones del habla. Sobre este encoder se añade una cabeza CTC autocondicionada, que permite al modelo condicionar la decodificación en pasos anteriores, mejorando la coherencia de la transcripción.

El entrenamiento se desarrolla en dos fases diferenciadas:

1. **Preentrenamiento**: se entrena desde cero la cabeza CTC y se ajusta el encoder (inicializado con el checkpoint público) sobre un corpus de habla jemer. No se especifican el número de tokens ni la composición exacta del dataset, pero se indica que es un corpus dedicado al jemer.
2. **Ajuste fino**: el checkpoint preentrenado se entrena adicionalmente con datos de code-switching jemer-inglés, lo que permite al modelo manejar transcripciones que mezclan ambos idiomas.

Los detalles de configuración y los scripts de entrenamiento están disponibles en el repositorio fuente del modelo. No se menciona el uso de técnicas como RLHF o DPO, ya que es un modelo de ASR y no de generación de texto.

## Capacidades

- Transcripción de audio en jemer (km) a texto, con decodificación CTC.
- Soporte para alternancia de código jemer-inglés, gracias al ajuste fino con datos bilingües.
- Inferencia sobre audio de entrada directamente, sin necesidad de un módulo separado de detección de actividad de voz.
- Compatible con la integración de un modelo de lenguaje externo (por ejemplo, KenLM) para mejorar la precisión, como se demuestra en el Space asociado, que fusiona un KenLM 6-gram a nivel de carácter en la búsqueda de haz CTC.
- Publicado con licencia MIT, lo que permite uso comercial y modificación sin restricciones.

## Casos de uso

- Transcripción de reuniones y entrevistas en jemer: el modelo puede procesar grabaciones de audio y generar transcripciones textuales, útil para actas, análisis cualitativo o archivado. Su tamaño moderado permite ejecutarlo en entornos locales sin infraestructura especializada.
- Subtitulado automático de vídeos: al transcribir la pista de audio, se pueden generar subtítulos en jemer para contenido educativo, noticias o entretenimiento. La baja tasa de error en dominio (CER 2,24% en validación) lo hace adecuado para producción.
- Accesibilidad para personas con discapacidad auditiva: convierte contenido hablado en texto, facilitando el acceso a conferencias, clases o eventos en jemer. El modelo puede desplegarse en tiempo real con baja latencia.
- Asistentes de voz en jemer: aunque el modelo no incluye un componente de comprensión del lenguaje, puede servir como entrada para sistemas de diálogo que requieran transcripción previa del habla del usuario.
- Análisis de llamadas de servicio al cliente: las empresas pueden transcribir llamadas en jemer para extraer métricas de calidad, detectar problemas recurrentes o entrenar modelos de clasificación de intenciones.
- Transcripción de contenido educativo y académico: el modelo puede convertir clases grabadas o seminarios en texto, facilitando la búsqueda de contenido y la creación de materiales de estudio accesibles.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre conjuntos de evaluación reservados:

| Split | CER | WER |
|---|---|---|
| val | 2,24% | 7,62% |
| test_fleurs | 12,03% | 25,66% |
| test_slr42 | 14,82% | 48,62% |

Además, el Space asociado (`Darayut/omni-asr-kh`) muestra resultados con decodificación mejorada mediante KenLM: CER de 3,49% en dominio y 14,13% en el conjunto fuera de dominio FLEURS. No se han publicado comparativas con otros modelos ASR para jemer en la información disponible.

## Requisitos de hardware

- El modelo tiene 320 millones de parámetros y un tamaño de pesos de aproximadamente 1,3 GB en safetensors. La VRAM estimada para inferencia en precisión FP32 ronda los 1,3 GB, y en FP16 o cuantización a 8 bits podría reducirse a unos 700 MB.
- Es ejecutable en GPUs de consumo como una NVIDIA RTX 3060 (8 GB), RTX 4060 (8 GB) o superiores. También puede funcionar en CPU con un rendimiento aceptable para transcripción por lotes.
- Para despliegue en producción, se recomienda usar el script `transcribe.py` del repositorio fuente o integrar el modelo con librerías de ASR como Hugging Face Transformers (si se adapta a la interfaz `Wav2Vec2ForCTC` o similar). No se menciona compatibilidad con vLLM, llama.cpp o TGI, que son específicos para modelos de lenguaje.
- La latencia depende del hardware y la longitud del audio; en una GPU moderna, la transcripción en tiempo real suele ser factible, aunque no se ofrecen cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para ASR en jemer. La familia Omnilingual ASR de Meta incluye modelos multilingües que cubren más de 1.600 idiomas, pero no se han publicado resultados detallados para jemer en las fuentes consultadas. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para jemer, por lo que no puede transcribir otros idiomas sin reentrenamiento.
- La tasa de error en conjuntos fuera de dominio (FLEURS, SLR42) es significativamente mayor que en el conjunto de validación, lo que indica sensibilidad a variaciones en el acento, la calidad de audio o el dominio temático.
- El ajuste fino con code-switching jemer-inglés puede no cubrir todas las combinaciones posibles de alternancia de código; en escenarios con mezcla intensiva, la precisión puede degradarse.
- No se han documentado sesgos específicos, pero como cualquier modelo de ASR, puede presentar errores en habla con ruido de fondo, múltiples hablantes o dialectos regionales del jemer.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar que los datos de entrenamiento utilizados por el autor cumplen con los derechos de propiedad intelectual aplicables; el repositorio no detalla la procedencia del corpus.

## Enlaces

- Modelo en Hugging Face: [Darayut/Omnilingual-ASR-Khm](https://huggingface.co/Darayut/Omnilingual-ASR-Khm)
- Space de demostración: [Darayut/omni-asr-kh](https://huggingface.co/spaces/Darayut/omni-asr-kh)
- Repositorio de Omnilingual ASR (Meta): [facebookresearch/omnilingual-asr](https://github.com/facebookresearch/omnilingual-asr)
- Publicación de Meta AI sobre Omnilingual ASR: [Omnilingual ASR: Open-Source Multilingual Speech Recognition for 1600 Languages](https://ai.meta.com/research/publications/omnilingual-asr-open-source-multilingual-speech-recognition-for-1600-languages/)
- Paper en arXiv: [2511.09690](https://arxiv.org/abs/2511.09690)
