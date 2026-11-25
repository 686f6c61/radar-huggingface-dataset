# movoiceai/movoice-santali-listener

## Resumen

Movoice Santali Listener es un modelo de reconocimiento automático del habla (ASR) especializado en santali (ᱥᱟᱱᱛᱟᱲᱤ), una lengua austroasiática hablada por unos siete millones de personas principalmente en India, Bangladés y Nepal. El modelo transcribe audio en santali y devuelve el texto en escritura Ol Chiki. Lo desarrolla Movoice (Sai Safalya Tudu, METAWAVEAI TECHNOLOGIES PRIVATE LIMITED, Bhubaneswar, Odisha), partiendo del modelo IndicConformer Santali de AI4Bharat.

Técnicamente es un fine-tuning del IndicConformer large de AI4Bharat, una arquitectura híbrida RNNT/CTC orientada a lenguas indias, sobre el que se han añadido 371 horas de habla santali cotidiana procedente del corpus IndicVoices. El resultado se distribuye como checkpoint NeMo (`.nemo`, 0,7 GB) acompañado de un modelo de lenguaje de 4-gramas opcional (`sat_4gram.arpa`) construido a partir de texto de la Wikipedia en santali, que mejora la decodificación CTC con beam search.

Su relevancia radica en cubrir una lengua de bajos recursos con un modelo abierto y licencia permisiva (CC-BY-4.0), algo poco habitual. Los resultados publicados por el autor sitúan el WER en 28,9 sobre las grabaciones de test Rasa Santali y en 29,9 sobre el conjunto reservado de IndicVoices, con CER de 5,8 y 9,0 respectivamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IndicConformer large (Conformer híbrido RNNT/CTC) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana dependiente del chunking de inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | santali (sat) |
| Licencia | CC-BY-4.0 (modelo); CC BY-SA 4.0 (modelo de lenguaje `sat_4gram.arpa`) |
| Formato de pesos | NeMo (`.nemo`); modelo de lenguaje ARPA (`sat_4gram.arpa`) |

## Arquitectura y entrenamiento

El modelo se basa en IndicConformer, un Conformer híbrido que combina bloques de autoatención y convoluciones, con cabeceras de salida simultáneas RNNT y CTC. Movoice parte de la variante "large" de IndicConformer para santali publicada por AI4Bharat y la somete a un entrenamiento adicional con 371 horas de habla santali cotidiana extraídas de IndicVoices (CC-BY-4.0). No se documentan en la información disponible detalles sobre hiperparámetros, número total de tokens de audio vistos, ni si se aplicaron técnicas de aumento de datos o regularización específicas.

Como complemento de decodificación, el autor publica un modelo de lenguaje de 4-gramas entrenado con 5,5 millones de palabras de la Wikipedia en santali, del que se han eliminado las frases de los conjuntos de evaluación para evitar contaminación. La decodificación recomendada es CTC beam search con beam 64 y el modelo de 4-gramas (alpha 0,1, beta -0,5), lo que reduce el WER frente a la decodificación sin modelo de lenguaje (28,9 frente a 30,2 en Rasa; 29,9 frente a 30,6 en IndicVoices).

## Capacidades

- Transcripción de voz a texto en santali, con salida en escritura Ol Chiki.
- Reconocimiento de habla leída y habla cotidiana, según los conjuntos de evaluación del autor.
- Decodificación híbrida RNNT/CTC; se recomienda el uso de la salida CTC con beam search y modelo de 4-gramas para maximizar la precisión.
- Integración con la librería NeMo (`nemo.collections.asr`), incluyendo `restore_from` y `transcribe`.
- Soporte de entrada de audio en WAV mono a 16 kHz.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio multimodal ni modo "thinking"; es un modelo puramente ASR.
- Capacidad multilingüe: no; está especializado exclusivamente en santali.

## Casos de uso

- Subtitulado y transcripción de contenido audiovisual en santali: el modelo convierte entrevistas, programas de radio o vídeos en texto Ol Chiki, lo que facilita la accesibilidad y el archivo de contenido en una lengua con escasa representación digital.
- Digitalización de patrimonio oral: grabaciones de tradición oral, canciones o testimonios comunitarios pueden transcribirse para su conservación y estudio lingüístico, aprovechando que el modelo se ha entrenado con habla cotidiana de IndicVoices.
- Atención ciudadana y servicios públicos en zonas santalífonas: transcripción de llamadas o mensajes de voz para su posterior procesado por sistemas de gestión, siempre que el audio no proceda de líneas telefónicas muy ruidosas (limitación declarada por el autor).
- Herramientas educativas y de alfabetización en Ol Chiki: conversión de dictados o lecciones orales en texto para materiales didácticos, con la ventaja de que la salida ya está en la escritura nativa.
- Investigación lingüística y corpus: generación de transcripciones a gran escala para construir corpus anotados de santali, con la posibilidad de aplicar el modelo de 4-gramas para mejorar la coherencia léxica.
- Asistentes de voz y aplicaciones de dictado: integración en aplicaciones móviles o de escritorio mediante NeMo para dictado en santali, con decodificación CTC y `pyctcdecode` usando `sat_4gram.arpa`.
- Búsqueda y recuperación de información en audio: indexación de archivos de audio en santali para permitir búsquedas por texto una vez transcritos.

## Benchmarks y rendimiento

| Conjunto de prueba | Clips | WER (%) | CER (%) | Configuración |
|---|---|---|---|---|
| Rasa Santali test recordings (AI4Bharat) | 100 | 28,9 | 5,8 | CTC beam 64 + 4-gramas (alpha 0,1, beta -0,5) |
| IndicVoices Santali, reservado | 1.818 | 29,9 | 9,0 | CTC beam 64 + 4-gramas (alpha 0,1, beta -0,5) |
| Rasa Santali test recordings | 100 | 30,2 | 6,3 | Sin modelo de lenguaje |
| IndicVoices Santali, reservado | 1.818 | 30,6 | 9,2 | Sin modelo de lenguaje |
| Rasa Santali test recordings | 100 | 31,0 | 6,4 | Modelo de partida (IndicConformer Santali) |

No se han publicado en la información disponible resultados comparativos con otros modelos ASR en santali distintos del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,7 GB, por lo que el checkpoint en precisión original cabe holgadamente en GPUs de consumo, aunque el consumo real depende del backend y del tamaño de lote.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del checkpoint, una GPU consumer con 8 GB o más debería ser suficiente para inferencia en lotes pequeños; para procesamiento por lotes a gran escala se recomiendan GPUs de centro de datos (A100, H100) sin que haya cifras publicadas de throughput.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más, aunque no se documenta una estimación oficial.
- Opciones de despliegue: NeMo (`nemo.collections.asr`), con decodificación CTC mediante `pyctcdecode` y el modelo `sat_4gram.arpa`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | WER publicado (Rasa Santali) |
|---|---|---|---|---|---|
| Movoice Santali Listener | IndicConformer large híbrido RNNT/CTC | Santali | CC-BY-4.0 | NeMo | 28,9 (con 4-gramas) |
| AI4Bharat IndicConformer Santali (base) | IndicConformer large híbrido RNNT/CTC | Santali | CC-BY-4.0 | NeMo | 31,0 |
| Otros ASR multilingües (p. ej. Whisper) | Transformer encoder-decoder | Multilingüe (santali no listado como soportado oficialmente) | MIT / Apache-2.0 según variante | Safetensors, GGUF | no disponible |

La comparación directa con modelos ASR multilingües de propósito general no está disponible en la información proporcionada; el único punto de referencia documentado es el modelo base de AI4Bharat, sobre el que Movoice mejora el WER en 2,1 puntos absolutos en el conjunto Rasa Santali.

## Limitaciones y advertencias

- El autor indica que el modelo se ha probado con habla leída y cotidiana, pero no con audio telefónico ruidoso; el rendimiento en condiciones de línea telefónica puede degradarse.
- Los errores aumentan en nombres poco frecuentes y en palabras prestadas de otras lenguas.
- El modelo de 4-gramas solo contiene palabras vistas en la Wikipedia en santali, por lo que puede penalizar vocabulario coloquial o neologismos ausentes de ese corpus.
- Riesgo de alucinación y de sustituciones léxicas en pasajes ambiguos, habitual en ASR con modelo de lenguaje; conviene revisar transcripciones en contextos críticos.
- Sesgos: no se documentan análisis de sesgo por género, edad, dialecto o región; al entrenarse con IndicVoices, puede reflejar la distribución de ese corpus.
- Limitación de idioma: solo santali; no soporta cambio de código ni otras lenguas indias.
- Licencia: el modelo es CC-BY-4.0 y exige atribución a Movoice (Sai Safalya Tudu) y a AI4Bharat; el modelo de lenguaje `sat_4gram.arpa` es CC BY-SA 4.0, lo que impone condiciones de compartir igual si se redistribuye o se crean obras derivadas.
- Para producción: no hay cifras publicadas de latencia, throughput ni consumo de VRAM; es necesario realizar pruebas propias antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/movoiceai/movoice-santali-listener
- Modelo base: https://huggingface.co/ai4bharat/IndicConformer
- Dataset IndicVoices: https://huggingface.co/datasets/ai4bharat/IndicVoices
- Sitio web de Movoice: https://movoice.ai
- Contacto: admin@metawaveaitechnologies.com
- Documentación de NeMo ASR: https://docs.nvidia.com/nemo-framework/ (no enlazado en la model card; referencia general de la librería)
