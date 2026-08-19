# ElizabethMwangi/whisper-large-v3_finetuned_kinyarwanda_nonstandard_speech_v1.0

## Resumen

El modelo `ElizabethMwangi/whisper-large-v3_finetuned_kinyarwanda_nonstandard_speech_v1.0` es un ajuste fino de Whisper Large V3, desarrollado por ElizabethMwangi, especializado en la transcripción de habla no estándar en kinyarwanda (idioma de Ruanda). Se trata de la segunda etapa de un proceso de ajuste: la primera etapa se realizó sobre habla estándar (checkpoint `whisper-large-v3_finetuned_kinyarwanda_standard_speech_v2.0`) y esta segunda etapa se centra en patrones de habla atípicos, como tartamudeo u otras disfluencias.

El modelo resuelve un problema concreto y poco atendido: el reconocimiento automático del habla (ASR) para variedades no estándar de lenguas africanas de bajos recursos. Su relevancia radica en que la mayoría de los sistemas ASR comerciales fallan con estos patrones, y este ajuste fino demuestra que es posible mejorar la transcripción con un entrenamiento dirigido, aunque los resultados aún muestran márgenes de error considerables.

Arquitectónicamente, hereda el diseño de Whisper Large V3: un transformer encoder-decoder con aproximadamente 1.540 millones de parámetros, entrenado originalmente con 680 000 horas de audio etiquetado. El modelo está disponible en formato safetensors y se distribuye bajo licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Large V3 (transformer encoder-decoder) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | N/A (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | rw (kinyarwanda) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Whisper Large V3, un transformer encoder-decoder preentrenado por OpenAI sobre 680 000 horas de audio débilmente supervisado. El ajuste fino se realizó en dos etapas: primero sobre habla estándar en kinyarwanda y después sobre habla no estándar, partiendo del checkpoint de la primera etapa. En esta segunda etapa no se congeló ninguna parte del modelo (encoder, decoder ni proyección), y se aplicó SpecAugment como técnica de regularización.

Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 5e-5 con decaimiento polinomial, 40 pasos de calentamiento y un máximo de 1000 pasos, seleccionando el checkpoint del paso 1000 como el mejor. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento se limita a la optimización supervisada de la transcripción.

## Capacidades

- Transcripción de audio en kinyarwanda, con especial atención a habla no estándar (tartamudeo, patrones atípicos).
- Reconocimiento automático del habla (ASR) mediante la pipeline `automatic-speech-recognition` de Hugging Face Transformers.
- No se documentan capacidades adicionales como tool calling, generación de código o razonamiento multimodal, ya que el modelo está especializado exclusivamente en ASR.
- El modelo es monolingüe: solo procesa kinyarwanda, sin soporte multilingüe adicional.

## Casos de uso

- Transcripción clínica de pacientes con trastornos del habla: el modelo puede transcribir consultas médicas donde el paciente presenta tartamudeo u otras disfluencias, facilitando la documentación clínica y el seguimiento terapéutico.
- Asistentes de voz accesibles: integración en sistemas de control por voz para personas con habla no estándar, permitiendo comandos y dictado en kinyarwanda con mayor precisión que los ASR genéricos.
- Subtitulación automática de vídeos y podcasts: transcripción de contenido audiovisual en kinyarwanda que incluya entrevistas o testimonios con habla atípica, mejorando la accesibilidad.
- Transcripción de reuniones y entrevistas de investigación: útil para trabajos de campo sociolingüístico o antropológico donde los informantes presentan variantes no estándar del idioma.
- Herramientas de comunicación aumentativa y alternativa (CAA): conversión de habla disfluente en texto para apoyar la comunicación de personas con dificultades del habla en entornos educativos o laborales.
- Servicios de atención al cliente por voz: transcripción de llamadas de usuarios con habla no estándar en kinyarwanda, permitiendo análisis de calidad y generación de resúmenes automáticos.
- Desarrollo de corpus lingüísticos: creación de transcripciones anotadas de habla no estándar para investigación en fonética y patologías del habla.

## Benchmarks y rendimiento

Los resultados se reportan sobre un conjunto de prueba de habla no estándar en kinyarwanda. No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| Avg WER | 0.379 |
| Overall WER | 0.769 |
| Avg CER | 0.147 |
| Overall CER | 0.325 |

Resultados por severidad del habla no estándar:

| Severidad | WER (media) | Numero de muestras |
|---|---|---|
| Leve | 0.473 | 138 |
| Moderada | 0.473 | 114 |
| Severa | 0.413 | 137 |

El WER promedio de 0.379 indica que aproximadamente el 38 % de las palabras transcritas contienen errores, mientras que el WER global de 0.769 sugiere que en algunos segmentos la transcripción es muy deficiente. El CER (error a nivel de carácter) es considerablemente menor, lo que apunta a que los errores son principalmente de sustitución o inserción de palabras completas.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Como orientación general, el modelo tiene 1.543 millones de parámetros y el repositorio ocupa 6.2 GB en safetensors, lo que corresponde aproximadamente a pesos en FP32. Para inferencia:

- En FP16, la memoria VRAM estimada es de unos 3.1 GB, lo que permite ejecutarlo en GPUs de consumo como NVIDIA RTX 3060 (12 GB) o superiores.
- Con cuantización a int8, la huella se reduce a aproximadamente 1.6 GB, pudiendo funcionar en GPUs con 4 GB o incluso en CPU con las optimizaciones adecuadas.
- No se mencionan opciones de despliegue específicas, pero al ser un modelo de Hugging Face, es compatible con vLLM, TGI, llama.cpp y Ollama, aunque estas herramientas están más orientadas a modelos de lenguaje que a ASR; para Whisper se recomienda usar la pipeline de Transformers o el repositorio oficial de Whisper.
- La latencia dependerá del hardware y de la longitud del audio; Whisper procesa ventanas de 30 segundos de audio por paso.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. La autora ha publicado otros ajustes de Whisper Large V3 para lenguas africanas (por ejemplo, swahili), pero no se incluyen métricas que permitan una comparación directa con este modelo de kinyarwanda no estándar. Por tanto, no se puede establecer una comparativa cuantitativa en este momento.

## Limitaciones y advertencias

- El WER promedio es alto (0.379), lo que implica que cerca de 4 de cada 10 palabras se transcriben incorrectamente en habla no estándar. No es adecuado para transcripciones que requieran alta fidelidad sin revisión humana.
- El WER global de 0.769 indica que existen segmentos donde la transcripción falla gravemente, posiblemente en audio con ruido o disfluencias extremas.
- El modelo está limitado al kinyarwanda y no soporta otros idiomas ni mezclas de código.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado sobre un conjunto de datos limitado, puede presentar sesgos de género, edad o dialecto dentro del propio kinyarwanda.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero no se especifican restricciones adicionales sobre el uso en aplicaciones médicas o de alto riesgo.
- El modelo no ha sido evaluado en entornos de producción ni se han publicado pruebas de robustez frente a ruido, acentos o condiciones acústicas variables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ElizabethMwangi/whisper-large-v3_finetuned_kinyarwanda_nonstandard_speech_v1.0
- Checkpoint de la etapa 1 (habla estándar): https://huggingface.co/ElizabethMwangi/whisper-large-v3_finetuned_kinyarwanda_standard_speech_v2.0
- Modelo similar para swahili (referencia de la autora): https://huggingface.co/ElizabethMwangi/whisper-large-v3-swahili-afrivoice
- Modelo similar para swahili no estándar: https://huggingface.co/ElizabethMwangi/whisper-large-v3-swahili-nss-afrivoice-cv
- Repositorio de terceros con un modelo relacionado: https://github.com/Damacol/elizabethmwangi-whisper-large-v3-luganda-waxal
