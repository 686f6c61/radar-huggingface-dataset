# palli23/pallr-wav2vec2-base-is

## Resumen

pallr-wav2vec2-base-is es un modelo de reconocimiento automático del habla (ASR) para islandés, desarrollado por Páll Rúnarsson en el laboratorio HUMI de la Universidad de Reikiavik. Se trata de un ajuste fino de facebook/wav2vec2-base, un transformer convolucional de 94,4 millones de parámetros que emplea una cabeza CTC a nivel de carácter. El modelo resuelve el problema de la transcripción de voz en islandés, un idioma de bajos recursos, con un coste computacional muy reducido en comparación con los modelos multilingües de gran tamaño.

La propuesta del modelo es deliberadamente minimalista: al usar decodificación CTC por caracteres, no puede inventar palabras que no haya oído, y produce texto en minúsculas y sin puntuación. Con aproximadamente 380 MB de pesos, se carga en segundos y puede ejecutarse en la CPU de un portátil o un teléfono móvil, lo que habilita la transcripción offline en el dispositivo. Es relevante ahora porque demuestra que un modelo pequeño entrenado con datos específicos del idioma puede ser una alternativa práctica a los gigantes multilingües cuando el despliegue en hardware modesto es un requisito.

El entrenamiento se realizó sobre los corpus islandeses Samrómur Milljón, Samrómur 21.05 y Spjallrómur, y forma parte de una línea de trabajo más amplia sobre modelos ASR pequeños para lenguas de bajos recursos, publicada por el Language and Voice Lab y HUMI lab.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (transformer convolucional con cabeza CTC a nivel de caracter) |
| Parametros totales | 94.402.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio; se recomienda transcribir en fragmentos de ~20 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | islandés (is) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Wav2Vec2: un extractor de características convolucional que procesa la forma de onda de audio a 16 kHz, seguido de un codificador transformer y una cabeza de clasificación CTC que emite directamente caracteres. Al decodificar por caracteres en lugar de por subpalabras o tokens BPE, el modelo se limita a transcribir lo que realmente detecta en la señal acústica, lo que reduce el riesgo de alucinación léxica. No se ha publicado información detallada sobre el número exacto de tokens de audio, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card solo indica los corpus de entrenamiento: Samrómur Milljón, Samrómur 21.05 y Spjallrómur.

El ajuste fino parte de facebook/wav2vec2-base y se enmarca en el artículo *Scaling Smaller ASR Models Against Multilingual ASR Giants for Low-Resource Languages: A Comprehensive Evaluation for Icelandic*. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla en islandés a partir de audio mono a 16 kHz.
- Transcripción en minúsculas y sin puntuación.
- Decodificación CTC por caracteres: no genera palabras que no estén presentes en la señal acústica.
- Ejecución eficiente en CPU, sin necesidad de GPU.
- Adecuado para transcripción offline en dispositivos móviles y portátiles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de capacidades de visión, audio generativo ni modo de razonamiento.
- Capacidad multilingüe limitada exclusivamente al islandés.

## Casos de uso

- Transcripción offline en dispositivos móviles: con ~380 MB de pesos y ejecución en CPU, el modelo puede integrarse en una aplicación móvil para transcribir notas de voz sin conexión a internet, algo crítico en entornos con conectividad limitada o por privacidad.
- Subtitulado de reuniones y entrevistas en islandés: al procesar fragmentos de unos 20 segundos, puede generar transcripciones de audio grabado en local, con un WER de 17,7 % en el conjunto Samrómur 21.05 para habla leída.
- Herramientas de accesibilidad para personas con discapacidad auditiva: transcripción en tiempo casi real de conversaciones presenciales en islandés sobre hardware de bajo coste.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: el reducido tamaño permite ejecutar múltiples instancias en paralelo en CPU para transcribir grandes volúmenes de grabaciones.
- Investigación lingüística y creación de corpus: transcripción automática de grabaciones de campo en islandés para su posterior anotación y análisis, con la ventaja de que el modelo no inventa palabras.
- Transcripción de llamadas de atención al cliente: integración en sistemas telefónicos para generar registros textuales de conversaciones en islandés, con la advertencia de que el rendimiento cae en audio de radio y habla espontánea (WER de 47,1 % en Fjölmiðlatal).
- Prototipado rápido y demos web: el modelo se puede probar en el navegador en ormal.is sin subir audio, lo que facilita la evaluación previa a una integración en producción.

## Benchmarks y rendimiento

Word error rate (WER, %, menor es mejor), texto en minúsculas y sin puntuación, tal como escribe el modelo:

| Conjunto de prueba | WER |
|---|---|
| Samrómur 21.05 test | 17,7 |
| Fjölmiðlatal 22.02 (radio RÚV) | 47,1 |
| Samrómur Milljón test | 5,2 |

El conjunto de prueba de Samrómur Milljón contiene frases que también aparecen en las indicaciones de entrenamiento de Milljón, por lo que su puntuación es en dominio.

Comparación con modelos islandeses de mayor tamaño:

| Modelo | Parámetros | Pesos | Samrómur 21.05 | Fjölmiðlatal |
|---|---|---|---|---|
| pallr-wav2vec2-base-is | 95M | ~380 MB | 17,7 | 47,1 |
| whisper-large-icelandic-62640-steps-967h | 1.550M | ~6,2 GB | 6,9 | 38,1 |
| wav2vec2-large-xlsr-53-icelandic-ep30-967h | 315M | ~1,3 GB | 7,0 | 45,4 |

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo puede ejecutarse en CPU. En GPU, los pesos en precisión completa ocupan aproximadamente 380 MB.
- GPU recomendadas: no es necesario; cualquier GPU con al menos ~1 GB de memoria libre puede alojarlo, pero su diseño está orientado a CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, RTX 3060, RTX 4090) e incluso en hardware integrado.
- Opciones de despliegue: transformers (Wav2Vec2ForCTC y Wav2Vec2Processor), endpoints compatibles según los tags de Hugging Face. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no se han publicado cifras concretas; la model card indica que se carga en segundos y se ejecuta en la CPU de un teléfono o portátil corriente.

## Comparativa con modelos similares

| Modelo | Parámetros | Pesos | Samrómur 21.05 (WER) | Fjölmiðlatal (WER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pallr-wav2vec2-base-is | 95M | ~380 MB | 17,7 | 47,1 | CC BY-SA 4.0 | Hugging Face |
| whisper-large-icelandic-62640-steps-967h | 1.550M | ~6,2 GB | 6,9 | 38,1 | no disponible | Hugging Face |
| wav2vec2-large-xlsr-53-icelandic-ep30-967h | 315M | ~1,3 GB | 7,0 | 45,4 | no disponible | Hugging Face |

Los modelos grandes son más precisos en habla leída, pero requieren mucho más hardware. Este modelo es una fracción de su tamaño y habilita la transcripción en dispositivo.

## Limitaciones y advertencias

- Solo soporta islandés; no es multilingüe.
- Escribe en minúsculas y sin puntuación, lo que limita su uso directo en productos que requieran texto formateado.
- El rendimiento cae notablemente en audio de radio y habla espontánea: WER de 47,1 % en Fjölmiðlatal frente a 17,7 % en Samrómur 21.05.
- La puntuación de 5,2 en Samrómur Milljón es en dominio y no representa el rendimiento en audio fuera de ese corpus.
- No se han documentado sesgos específicos, pero al estar entrenado con corpus islandeses concretos puede presentar peor rendimiento en acentos, edades o condiciones acústicas poco representadas.
- Riesgo de alucinación léxica reducido por la decodificación CTC por caracteres, pero persisten errores de sustitución, omisión e inserción propios de ASR.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribución y compartir las obras derivadas bajo la misma licencia.
- Para grabaciones largas se recomienda transcribir en fragmentos de unos 20 segundos; no se especifica la longitud máxima de audio soportada.
- No dispone de tool calling, agentes ni capacidades generativas más allá de la transcripción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/palli23/pallr-wav2vec2-base-is
- Colección del proyecto: https://huggingface.co/collections/palli23/scaling-smaller-asr-models-vs-multilingual-giants-6aa9aabd202fee0610231065
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Comparativa whisper-large-icelandic-62640-steps-967h: https://huggingface.co/language-and-voice-lab/whisper-large-icelandic-62640-steps-967h
- Comparativa wav2vec2-large-xlsr-53-icelandic-ep30-967h: https://huggingface.co/language-and-voice-lab/wav2vec2-large-xlsr-53-icelandic-ep30-967h
- Demo en navegador: https://ormal.is
