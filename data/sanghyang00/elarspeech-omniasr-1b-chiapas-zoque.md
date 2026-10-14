# Sanghyang00/ELARSpeech-OmniASR-1B-chiapas-zoque

## Resumen

ELARSpeech-OmniASR-1B-chiapas-zoque es un modelo de reconocimiento automático del habla (ASR) especializado en la variante de zoque de Chiapas, una lengua indígena de México sin código ISO 639-3 asignado según la propia model card. Lo publica el usuario Sanghyang00 en HuggingFace como un ajuste fino (finetune) del checkpoint base aadel4/omniASR-CTC-1B-v2, un modelo de la familia OmniASR/ELARSpeech orientado a lenguas de bajos recursos. El problema que aborda es la ausencia de sistemas ASR funcionales para lenguas minoritarias con pocos hablantes y escasez de corpus transcritos.

Técnicamente es un modelo de tipo Wav2Vec2ForCTC, es decir, una arquitectura transformer convolucional orientada a clasificación temporal (CTC) sobre representaciones de audio sin decodificador autorregresivo. El recuento real de parámetros almacenados en safetensors es de 975.677.617, lo que el autor etiqueta comercialmente como «1B». El repositorio ocupa 3,9 GB y se distribuye en formato safetensors compatible con la librería transformers.

Su relevancia es, por ahora, limitada y muy específica: se trata de un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, creado el 14 de octubre de 2026. No hay datos publicados de benchmarks, licencia declarada ni idiomas soportados más allá del zoque de Chiapas mencionado en la model card. Para un desarrollador o investigador, su interés reside en la documentación de lenguas indígenas y en la reutilización de la familia OmniASR como base para ajustes posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (transformer convolucional con cabeza CTC) |
| Parametros totales | 975.677.617 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | Zoque de Chiapas |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | aadel4/omniASR-CTC-1B-v2 |
| Tamano del repositorio | 3,9 GB |
| Frecuencia de muestreo de entrada | 16 kHz mono |

## Arquitectura y entrenamiento

El modelo emplea `Wav2Vec2ForCTC`, la variante de Wav2Vec2 diseñada para reconocimiento de voz con función de pérdida CTC (Connectionist Temporal Classification). Esta arquitectura combina un extractor de características convolucional sobre la forma de onda cruda con un encoder transformer que produce representaciones contextuales, sobre las que se aplica una cabeza lineal que emite logits por fotograma. La decodificación es greedy (`argmax` sobre logits) tal y como muestra el ejemplo de uso de la model card, lo que implica que no hay decodificación con modelo de lenguaje externo en el flujo por defecto.

No se dispone de información sobre el número de tokens de audio, la composición del dataset de ajuste, ni si se aplicaron técnicas de aumento de datos, RLHF o DPO. La model card indica únicamente que el artefacto exportado fue verificado contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluación, con estado de verificación de transcripción exacta «PASS». Se trata, por tanto, de un proceso de exportación y validación más que de un entrenamiento desde cero documentado.

## Capacidades

- Reconocimiento automático del habla monolingüe para zoque de Chiapas.
- Transcripción de audio de entrada con formato mono a 16 kHz.
- Decodificación CTC greedy mediante `argmax` sobre los logits del modelo.
- Integración con el ecosistema `transformers` (AutoProcessor + Wav2Vec2ForCTC).
- Verificación de transcripción exacta validada sobre un conjunto fijo de evaluación (estado PASS).
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo de pensamiento.

## Casos de uso

- Documentación y revitalización lingüística: transcripción de grabaciones de campo de hablantes de zoque de Chiapas para crear corpus textuales anotados, aprovechando que el modelo está ajustado específicamente a esa lengua.
- Archivo de patrimonio oral: conversión de entrevistas, relatos y material etnográfico en audio a texto para su catalogación y conservación digital.
- Investigación lingüística: generación de transcripciones preliminares que un lingüista pueda revisar, reduciendo el coste de la transcripción manual sobre lenguas sin recursos.
- Subtitulación de material audiovisual en zoque: producción de subtítulos base para vídeos comunitarios o educativos que después se corrigen a mano.
- Aplicaciones educativas bilingües: alimentar herramientas de aprendizaje del zoque con transcripciones de audio de referencia para comparar la pronunciación del alumnado.
- Evaluación comparativa de ASR para lenguas indígenas: uso como punto de referencia frente a otros ajustes de la familia OmniASR o de modelos multilingües.
- Preprocesado para pipelines de traducción: transcripción de audio en zoque como primer paso hacia una cadena ASR + traducción automática, siempre con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una verificación de transcripción exacta («PASS») contra el checkpoint original sobre un conjunto fijo de evaluación, sin cifras de WER, CER ni métricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 3,9 GB solo para los pesos (975,7 millones de parámetros); con activaciones y overhead, se recomienda al menos 6-8 GB.
- VRAM estimada en fp16/bf16: aproximadamente 2 GB para los pesos, con un margen práctico de 4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090); en entornos profesionales, A100 o H100 sobredimensionadas para este tamaño.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo modernas de gama media y alta, e incluso es viable en CPU para audio corto.
- Opciones de despliegue: `transformers` en Python (flujo documentado en la model card con `AutoProcessor` y `Wav2Vec2ForCTC`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son los entornos habituales para Wav2Vec2.
- Latencias y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-OmniASR-1B-chiapas-zoque | 975.677.617 | No disponible | Zoque de Chiapas | no disponible | HuggingFace (0 descargas) |
| aadel4/omniASR-CTC-1B-v2 (modelo base) | ~1B (segun nombre) | No disponible | No disponible | No disponible | HuggingFace |
| Otros ASR multilingues de gran escala (p. ej. Whisper) | No verificado en la informacion disponible | No disponible | Multiples | No disponible | HuggingFace |

Nota: los datos de los modelos comparativos no proceden de la informacion proporcionada en esta ficha, por lo que se indica «no disponible» en las celdas no verificadas.

## Limitaciones y advertencias

- Modelo monolingüe: solo está pensado para zoque de Chiapas; su rendimiento en otras lenguas o incluso en variedades cercanas de zoque no está documentado.
- La precisión «puede variar según las condiciones de grabación, la población de hablantes, la ortografía y el dominio», según la propia model card.
- Es obligatorio remuestrear el audio a 16 kHz mono; entradas con otra frecuencia o multicanal pueden degradar la transcripción.
- La licencia no está declarada en el repositorio, lo que impide determinar si el uso comercial está permitido. Hay que consultar la licencia y las condiciones del modelo base y de la documentación del proyecto ELARSpeech.
- Riesgo de alucinación y errores de transcripción inherente a los modelos CTC sin decodificación con modelo de lenguaje externo.
- Sin benchmarks publicados de WER/CER: no hay base objetiva para juzgar su calidad frente a alternativas.
- Cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.
- Al ser un ajuste fino de un checkpoint base no verificado en esta ficha, las condiciones de entrenamiento y composición del dataset subyacente son desconocidas.
- No se documenta soporte para tool calling, agentes ni otras capacidades más allá de la transcripción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-OmniASR-1B-chiapas-zoque
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-1B-v2
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repositorios o demos del proyecto ELARSpeech.
