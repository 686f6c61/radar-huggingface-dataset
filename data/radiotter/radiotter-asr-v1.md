# RadiOtter/RadiOtter-ASR-v1

## Resumen

RadiOtter ASR v1 es un modelo de reconocimiento automático del habla (ASR) en inglés especializado en dictado radiológico. Lo desarrolla RadiOtter y se distribuye como un ajuste fino (*fine-tuning*) del modelo `openai/whisper-large-v3-turbo`, empaquetado en formato CTranslate2 para su uso con la librería Faster Whisper. Su propósito es transcribir dictados médicos de radiología con una tasa de error de palabra (WER) muy baja en dominios especializados.

El modelo cubre las modalidades de imagen CT, MR, XR, US y MG, y las subespecialidades de abdomen, neuro, mama, MSK, vascular, medicina nuclear, obstetricia y ginecología, columna y tórax. Según la model card, se emplearon datos sintéticos durante su preparación, un detalle relevante para evaluar su comportamiento en entornos reales. El repositorio ocupa 1,6 GB y la versión publicada está optimizada para inferencia en CPU mediante cuantización int8.

Es relevante ahora porque los flujos de dictado clínico exigen transcripciones precisas en terminología anatómica, lateralidad y medidas, donde los modelos ASR generalistas cometen errores críticos. RadiOtter declara un WER normalizado del 2,47 %, muy por debajo de alternativas como Qwen3-ASR 1.7B o Google MedASR en la comparación publicada por el autor, aunque dicha comparación no constituye validación clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a CTranslate2 |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo tiene 809 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, heredada de Whisper) |
| Tipos de cuantizacion | int8 (ejemplo de uso con `compute_type="int8"`); otras variantes de CTranslate2 no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | CTranslate2 (modelo convertido para Faster Whisper) |

## Arquitectura y entrenamiento

RadiOtter ASR v1 se basa en la arquitectura Whisper large-v3-turbo de OpenAI, un transformer encoder-decoder con atención estándar diseñado para transcripción de audio. El autor ha realizado un ajuste fino sobre este modelo base y ha convertido los pesos al formato CTranslate2, lo que permite ejecutar la inferencia con Faster Whisper y aprovechar optimizaciones de CPU y GPU, incluida la cuantización int8.

La model card indica que se utilizaron datos sintéticos en la preparación del modelo, pero no detalla el volumen de datos, la composición exacta del corpus, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá del ajuste fino y la conversión a CTranslate2. No hay información publicada sobre el proceso de entrenamiento, la duración ni la metodología de evaluación interna.

## Capacidades

- Transcripción de voz a texto en inglés para dictado radiológico.
- Cobertura de modalidades de imagen: CT, MR, XR, US y MG.
- Cobertura de subespecialidades: abdomen, neuro, mama, MSK, vascular, medicina nuclear, obstetricia y ginecología, columna y tórax.
- Inferencia eficiente en CPU mediante CTranslate2 con cuantización int8.
- Integración con Faster Whisper para decodificación con `beam_size` configurable.
- Soporte de segmentación de audio con marcas de tiempo por segmento.
- No se documenta soporte de tool calling, agentes, visión, audio adicional ni modo de razonamiento.

## Casos de uso

- Dictado radiológico en informes de CT y MR: el modelo transcribe dictados con terminología anatómica y hallazgos estructurados, aprovechando su ajuste específico en subespecialidades como abdomen y neuro para reducir errores en lateralidad y medidas.
- Transcripción de informes de ecografía (US) y mamografía (MG): su cobertura declarada de estas modalidades permite integrarlo en flujos de dictado de estudios de mama y obstetricia, con revisión posterior por un profesional cualificado.
- Asistencia a radiólogos en entornos con recursos limitados: al ejecutarse en CPU con int8 mediante Faster Whisper, puede desplegarse en estaciones de trabajo sin GPU dedicada, lo que facilita su adopción en hospitales con infraestructura modesta.
- Generación de borradores de informes para revisión: el modelo produce transcripciones que un profesional revisa antes de incorporarlas al sistema de información radiológica (RIS), reduciendo el tiempo de tecleo en dictados largos.
- Investigación en ASR médico: sirve como base para estudiar el rendimiento de modelos ajustados en dominios especializados, comparando WER en distintas modalidades y subespecialidades.
- Preprocesado de audio para pipelines de NLP clínico: las transcripciones pueden alimentar sistemas de extracción de entidades o codificación de hallazgos, siempre con validación humana dada la sensibilidad del dominio.
- Evaluación de robustez ante acentos y condiciones de grabación: útil para equipos que necesiten medir la degradación del WER en escenarios reales antes de un despliegue clínico.

## Benchmarks y rendimiento

La model card publica una comparación de WER normalizado. El autor advierte que la cifra de RadiOtter proviene de una evaluación separada y que el resto procede de su propia ejecución, por lo que los resultados no son directamente comparables sin igualar los detalles de evaluación. No constituye validación clínica.

| Modelo | WER normalizado ↓ |
|---|---:|
| RadiOtter ASR v1 | 2,47 % |
| Qwen3-ASR 1.7B | 6,66 % |
| Google MedASR | 7,95 % |
| Cohere Transcribe | 10,90 % |
| IBM Granite Speech 5.0 Turbo CTC | 13,61 % |
| NVIDIA Nemotron 3.5 ASR Streaming | 22,77 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,6 GB y el ejemplo de uso emplea CPU con `compute_type="int8"`, lo que sugiere un consumo de memoria del orden de 1-2 GB en esa configuración.
- GPU recomendadas: no disponible; al derivar de Whisper large-v3-turbo, cabría esperar compatibilidad con GPU consumer, pero no se documenta.
- Cabe en GPU consumer: no confirmado en la información proporcionada; el ejemplo oficial usa CPU.
- Opciones de despliegue: Faster Whisper con CTranslate2 (documentado); otras opciones como vLLM, llama.cpp, Ollama o TGI no están soportadas para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER normalizado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RadiOtter ASR v1 | no disponible (base 809 M) | no disponible (segmentos de 30 s) | 2,47 % | no disponible | Hugging Face, formato CTranslate2 |
| Qwen3-ASR 1.7B | 1,7 B | no disponible | 6,66 % | no disponible | no disponible |
| Google MedASR | no disponible | no disponible | 7,95 % | no disponible | no disponible |
| Cohere Transcribe | no disponible | no disponible | 10,90 % | no disponible | no disponible |

La comparación se limita a los datos de WER publicados por el autor; no se dispone de información sobre parámetros, contexto o licencia de los modelos alternativos en la documentación proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- Entrenado con datos sintéticos, lo que puede introducir un sesgo de dominio y limitar la generalización a dictados reales.
- Riesgo de errores en negación, lateralidad, anatomía, números y medidas, según advierte la propia model card.
- No es una herramienta validada clínicamente; todo output debe ser revisado por un profesional cualificado antes de su uso en flujos clínicos.
- El rendimiento en distintas modalidades, subespecialidades, acentos y condiciones de grabación requiere validación adicional.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido.
- La comparación de WER publicada no es directamente comparable entre modelos y no constituye evidencia de superioridad clínica.
- El formato CTranslate2 limita las opciones de despliegue a Faster Whisper y ecosistemas compatibles.

## Enlaces

- [Hugging Face: RadiOtter/RadiOtter-ASR-v1](https://huggingface.co/RadiOtter/RadiOtter-ASR-v1)
- [Modelo base: openai/whisper-large-v3-turbo](https://huggingface.co/openai/whisper-large-v3-turbo)
- [Faster Whisper (documentación)](https://github.com/SYSTRAN/faster-whisper)
- [CTranslate2](https://github.com/OpenNMT/CTranslate2)
