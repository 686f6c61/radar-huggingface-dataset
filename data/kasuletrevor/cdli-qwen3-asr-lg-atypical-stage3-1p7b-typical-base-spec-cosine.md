# KasuleTrevor/cdli-qwen3-asr-lg-atypical-stage3-1p7b-typical-base-spec-cosine

## Resumen

El modelo `cdli-qwen3-asr-lg-atypical-stage3-1p7b-typical-base-spec-cosine` es un checkpoint de reconocimiento automático de voz (ASR) fine-tuneado para la transcripción de habla atípica o no estándar en luganda, una lengua bantú hablada principalmente en Uganda. Ha sido desarrollado por KasuleTrevor a partir del modelo base `cdli-qwen3-asr-lg-typical-1p7b-base-finetune`, que a su vez se apoya en la arquitectura Qwen3-ASR. El fine-tuning se realizó sobre el dataset `cdli/ugandan_luganda_nonstandard_speech_v1.0`, que recoge muestras de habla con variaciones dialectales, acentos regionales y otras desviaciones respecto al luganda estándar.

Con 2.038.052.480 parámetros (aproximadamente 2.000 millones), el modelo ofrece una ventana de contexto no especificada en la documentación disponible. Su relevancia radica en abordar un nicho lingüístico con escasos recursos de ASR: la mayoría de los sistemas comerciales no cubren lenguas africanas de bajo recurso, y mucho menos sus variantes no estándar. El checkpoint seleccionado (etapa 3) incorpora SpecAugment y un programador de tasa de aprendizaje coseno, lo que busca mejorar la robustez frente a variaciones acústicas.

Los resultados reportados en la model card muestran un WER (Word Error Rate) de 0,5157 y un CER (Character Error Rate) de 0,2352 en el conjunto de test, lo que indica que el modelo aún tiene margen de mejora, pero constituye un avance para una tarea con pocos datos. No se especifica la licencia, lo que condiciona su uso en entornos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (variante fine-tuneada) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | Luganda (lg) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-ASR, de la cual no se proporcionan detalles técnicos específicos en la documentación del repositorio. Qwen3-ASR es una familia de modelos de reconocimiento de voz desarrollada por Alibaba, que combina un codificador acústico con un decodificador de lenguaje, pero no se confirma si la variante utilizada emplea atención estándar, mecanismos híbridos u otras innovaciones. El checkpoint parte del modelo `cdli-qwen3-asr-lg-typical-1p7b-base-finetune`, previamente ajustado para habla típica en luganda, y se fine-tunea con el dataset `cdli/ugandan_luganda_nonstandard_speech_v1.0`.

El entrenamiento se realizó con una tasa de aprendizaje de 5e-5, programador coseno, 5 épocas, tamaño de batch 8 y acumulación de gradientes de 4, guardando checkpoints cada 250 pasos. Se habilitó SpecAugment, una técnica de aumento de datos que enmascara franjas de tiempo y frecuencia en el espectrograma para mejorar la robustez. El checkpoint seleccionado (`checkpoint-500`) fue elegido por su menor WER normalizado en validación. No se menciona el uso de RLHF, DPO u otras técnicas de alineación; el proceso es exclusivamente de fine-tuning supervisado.

## Capacidades

- Transcripción de voz en luganda, con especial enfoque en habla no estándar (acentos regionales, variaciones dialectales, disfluencias).
- Generación de texto a partir de audio, devolviendo transcripciones en caracteres latinos.
- Manejo de entradas de audio de duración variable, aunque no se especifica el límite máximo.
- Procesamiento de señales de voz con ruido de fondo o características acústicas atípicas gracias al uso de SpecAugment.
- No se documentan capacidades adicionales como tool calling, razonamiento multimodal, ni soporte para otros idiomas.

## Casos de uso

- Transcripción de entrevistas y testimonios en dialectos luganda rurales: el modelo puede procesar grabaciones de campo donde los hablantes usan variantes no estándar, facilitando la documentación lingüística y la investigación sociolingüística.
- Accesibilidad audiovisual: subtitulado automático de vídeos, podcasts o programas de radio en luganda con acentos regionales, mejorando el acceso para personas con discapacidad auditiva o hablantes de otras variantes.
- Atención al cliente en entornos rurales: integración en sistemas de transcripción de llamadas para empresas de telecomunicaciones o servicios públicos que operan en Uganda, donde los usuarios pueden hablar con acentos marcados.
- Asistentes de voz para comunidades locales: desarrollo de interfaces de voz en luganda no estándar para aplicaciones móviles de salud, educación o agricultura, permitiendo interacción natural en contextos donde el habla estándar no es la norma.
- Transcripción de reuniones comunitarias y actas: grabaciones de asambleas, consejos locales o sesiones de ONG, donde se mezclan dialectos y registros informales.
- Investigación en procesamiento de lenguas africanas: uso como modelo de referencia para estudiar el rendimiento de ASR en habla atípica y para comparar técnicas de aumento de datos como SpecAugment en lenguas de bajo recurso.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para el checkpoint seleccionado:

| Conjunto | WER | CER | Eval loss |
|---|---:|---:|---:|
| Validación | 0,635647 | 0,321327 | 0,515153 |
| Test | 0,515667 | 0,235181 | no disponible |

Además, se indica un "Avg WER capped" de 0,438203 y un "Avg CER capped" de 0,188558 en el conjunto de test, aunque no se define el criterio de "capped". No se han publicado comparativas con otros modelos ASR para luganda ni con sistemas multilingües de referencia, por lo que no es posible contextualizar estos valores frente a alternativas existentes.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. A partir del tamaño del modelo (2.038.052.480 parámetros) y el formato safetensors, se puede estimar de forma orientativa:

- En precisión FP16, la inferencia requeriría aproximadamente 4 GB de VRAM solo para los pesos, más memoria adicional para activaciones y buffers, lo que podría situarse entre 5 y 8 GB en función de la longitud del audio y el batch.
- Una GPU de consumo como NVIDIA RTX 3060 (12 GB) o RTX 4060 (8 GB) podría ejecutar el modelo, aunque con limitaciones en el tamaño del lote.
- Para despliegue en producción, GPUs de centro de datos como A10G o A100 serían más adecuadas si se necesita baja latencia.
- No se mencionan herramientas de despliegue específicas (vLLM, llama.cpp, TGI, etc.). Dado que es un modelo de ASR, probablemente se usaría con librerías como Transformers o SpeechBrain, pero no hay confirmación.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han encontrado referencias a otros sistemas ASR para luganda atípica ni a variantes de Qwen3-ASR con características similares. Por tanto, no es posible realizar una comparativa objetiva en términos de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El WER en test es elevado (0,5157), lo que implica que aproximadamente una de cada dos palabras se transcribe incorrectamente; el modelo es adecuado para tareas de transcripción asistida, pero no para uso automático sin supervisión.
- Solo soporta luganda (lg); no se ha entrenado para otros idiomas ni para habla estándar, por lo que su uso fuera de este dominio degradaría significativamente el rendimiento.
- El conjunto de datos de entrenamiento se limita a habla no estándar de Uganda, por lo que puede no generalizar a otras regiones o variantes del luganda (por ejemplo, las habladas en Kenia o la diáspora).
- La licencia no está especificada, lo que genera incertidumbre legal para uso comercial o redistribución. Se recomienda contactar al autor antes de utilizarlo en entornos productivos.
- No se documentan sesgos específicos, pero al tratarse de un modelo pequeño entrenado en un dataset limitado, es probable que presente errores sistemáticos en ciertos acentos o condiciones acústicas.
- No se informa sobre la latencia de inferencia ni el throughput, por lo que no es posible evaluar su viabilidad en aplicaciones en tiempo real.
- La ausencia de cuantizaciones disponibles (solo safetensors) limita el despliegue en dispositivos con recursos muy reducidos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/KasuleTrevor/cdli-qwen3-asr-lg-atypical-stage3-1p7b-typical-base-spec-cosine
- Dataset de entrenamiento: https://huggingface.co/datasets/cdli/ugandan_luganda_nonstandard_speech_v1.0
- Modelo base: https://huggingface.co/KasuleTrevor/cdli-qwen3-asr-lg-typical-1p7b-base-finetune
