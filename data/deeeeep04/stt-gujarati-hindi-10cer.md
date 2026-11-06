# deeeeep04/stt-gujarati-hindi-10cer

## Resumen

El modelo `deeeeep04/stt-gujarati-hindi-10cer` es un sistema de reconocimiento automático del habla (ASR) trilingüe especializado en gujarati, hindi e inglés, desarrollado por el usuario de Hugging Face `deeeeep04`. Se trata de un ajuste fino de la arquitectura Wav2Vec2, concretamente sobre la base de MMS-300M (Massively Multilingual Speech de Meta), orientado a transcripción de audio en un contexto lingüístico mixto propio de la India, donde es habitual alternar entre gujarati, hindi e inglés en una misma conversación.

El modelo se distribuye con licencia MIT, un tamaño de repositorio de 1,4 GB en formato safetensors y un pipeline de `automatic-speech-recognition`. Según la model card, se ha entrenado sobre 41,77 horas de audio trilingüe e incorpora un modelo de lenguaje KenLM de 3 gramos para el post-procesado de las hipótesis de transcripción, lo que permite reducir la tasa de error a nivel de carácter.

La relevancia de este modelo radica en su enfoque específico: no compite en cobertura multilingüe generalista, sino que optimiza el rendimiento en un dominio lingüístico concreto (gujarati-hindi-inglés) reportando un CER crudo del 10,30 % y un WER del 34,88 %. Es un checkpoint de nicho, con cero descargas y cero likes en el momento de la consulta, lo que sugiere un uso experimental o de investigación más que de producción masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (fine-tune sobre MMS-300M) |
| Parametros totales | no disponible (la base MMS-300M implica ~300M, dato no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | gujarati (gu), hindi (hi), ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Wav2Vec2, un transformer de reconocimiento de voz que opera directamente sobre la forma de onda de audio mediante un extractor de características convolucional seguido de un codificador transformer. El checkpoint parte de MMS-300M, la familia de modelos multilingües de Meta diseñada para cubrir más de 1.100 idiomas, y se ha ajustado finamente sobre 41,77 horas de audio trilingüe (gujarati, hindi, inglés).

El entrenamiento incorpora un modelo de lenguaje KenLM de 3 gramos, empleado habitualmente en la decodificación de modelos Wav2Vec2 para corregir y puntuar las hipótesis generadas por el acoustic model. No se especifican en la información disponible detalles sobre la composición exacta del dataset, la proporción de cada idioma, el uso de aumentación de datos, ni si se aplicaron técnicas de regularización o decodificación especulativa. Tampoco se documenta el proceso de tokenización ni el vocabulario resultante.

## Capacidades

- Transcripción de voz a texto en gujarati, hindi e inglés, incluyendo posibles escenarios de code-switching entre estos idiomas.
- Reconocimiento automático del habla (ASR) de audio en formato de onda, orientado a aplicaciones de dictado y subtitulado.
- Integración de un modelo de lenguaje KenLM de 3 gramos para mejorar la coherencia de las transcripciones durante la decodificación.
- Soporte trilingüe declarado en la model card, con resultados agregados de CER y WER sobre el conjunto de evaluación.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de salida ni modo de pensamiento (thinking mode).

## Casos de uso

- Subtitulado automático de contenido audiovisual en gujarati, hindi e inglés: el modelo puede transcribir vídeos o podcasts que mezclen estos idiomas, aprovechando su entrenamiento trilingüe y el KenLM para mejorar la legibilidad de las hipótesis.
- Transcripción de reuniones y llamadas en entornos empresariales indios: útil en compañías donde los equipos alternan entre gujarati, hindi e inglés, permitiendo generar actas o resúmenes a partir del audio.
- Atención al cliente y centros de contacto: el modelo puede alimentar sistemas de análisis de llamadas, clasificación de motivos de consulta o generación de transcripciones para control de calidad, aunque su WER del 34,88 % exige revisión humana en producción.
- Investigación lingüística y corpus orales: adecuado para proyectos académicos que necesiten transcribir grabaciones de campo en gujarati o hindi con una base MMS ya preentrenada en multitud de idiomas.
- Accesibilidad y dictado por voz: puede servir como motor ASR en aplicaciones de dictado para usuarios que hablen gujarati o hindi, integrado en entornos de escritorio o móvil mediante librerías de inferencia de Hugging Face.
- Prototipado rápido de pipelines ASR: al estar en formato safetensors y con licencia MIT, es sencillo de integrar en pruebas de concepto con `transformers` y el pipeline `automatic-speech-recognition` antes de optar por soluciones comerciales.
- Análisis de contenido en redes sociales o medios: transcripción de clips cortos en los tres idiomas para moderación, búsqueda o indexación.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Metrica | Valor | Verificado |
|---|---|---|
| Character Error Rate (CER) | 10,30 % | No |
| Word Error Rate (WER) | 34,88 % | No |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks de ASR) ni desgloses por idioma.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un modelo Wav2Vec2 de ~300M parámetros en precisión FP32 requiere del orden de 1,2 GB de VRAM, y en FP16 aproximadamente 0,6 GB, aunque esta estimación no está confirmada en la información proporcionada.
- GPU recomendadas: no disponible en la información. Por tamaño, cabría esperar que funcione en GPU consumer (RTX 3060, RTX 4090) y en GPUs de datacenter (A100, H100), pero no se documenta.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio (1,4 GB) y la arquitectura MMS-300M, aunque no se confirma.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Hugging Face `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a modelos de lenguaje, no a ASR Wav2Vec2).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | CER reportado |
|---|---|---|---|---|---|
| deeeeep04/stt-gujarati-hindi-10cer | ~300M (base MMS-300M) | gu, hi, en | no disponible | MIT | 10,30 % |
| facebook/mms-300m | ~300M | 1.100+ idiomas | no disponible | CC-BY-NC 4.0 | no disponible en esta ficha |
| openai/whisper-small | ~244M | multilingüe (99 idiomas) | 30 s de audio | MIT | no disponible en esta ficha |
| openai/whisper-medium | ~769M | multilingüe (99 idiomas) | 30 s de audio | MIT | no disponible en esta ficha |

La comparación con MMS-300M y Whisper es orientativa por categoría (ASR de tamaño pequeño-medio), pero no se dispone de datos de rendimiento de esos modelos en la información proporcionada para establecer una comparación cuantitativa fiable. El modelo aquí descrito se distingue por su especialización trilingüe y su licencia MIT, frente a la licencia no comercial de MMS-300M.

## Limitaciones y advertencias

- Los resultados de CER y WER están declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- El WER del 34,88 % es elevado para uso en producción sin revisión humana; puede ser aceptable en tareas de indexación o búsqueda, pero no en transcripción legal o médica.
- No se documenta el desglose de rendimiento por idioma, por lo que se desconoce si el modelo rinde igual en gujarati, hindi e inglés o si hay un idioma dominante.
- El entrenamiento se realizó sobre 41,77 horas de audio, un volumen relativamente pequeño para ASR, lo que puede limitar la generalización a dominios, acentos o ruidos no vistos.
- No se especifica la composición del dataset ni posibles sesgos de género, edad, acento o registro.
- Riesgo de alucinación inherente a los modelos ASR: el KenLM de 3 gramos puede introducir palabras plausibles que no se dijeron en el audio, especialmente en pasajes ruidosos.
- La licencia MIT permite uso comercial, pero al derivar de MMS-300M conviene revisar las condiciones de la licencia original de Meta para la base, no documentadas en esta ficha.
- No se documentan limitaciones de longitud de audio; los modelos Wav2Vec2 suelen requerir segmentación de audios largos.
- El modelo tiene cero descargas y cero likes, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/deeeeep04/stt-gujarati-hindi-10cer
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
