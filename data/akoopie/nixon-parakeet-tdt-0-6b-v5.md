# akoopie/nixon-parakeet-tdt-0.6b-v5

## Resumen

Nixon Parakeet TDT 0.6B v5 es un modelo de reconocimiento automático del habla (ASR) especializado en las grabaciones del Despacho Oval y otras dependencias de la Casa Blanca durante la administración Nixon (1971-1973). Lo desarrolla Arvin Akoopie como parte de The Nixon Corpus, un proyecto que publica transcripciones con marcas de tiempo por palabra y etiquetado de hablante para las 19.426 conversaciones liberadas como grabaciones individuales. El modelo parte de nvidia/parakeet-tdt-0.6b-v3, un FastConformer de 600 millones de parámetros con decodificador transducer token-and-duration (TDT), y se ha ajustado finamente sobre audio histórico analógico procedente de micrófonos ocultos y escuchas telefónicas.

La relevancia del modelo es doble. Por un lado, demuestra que un ajuste fino ligero (24,3 horas de audio etiquetado o alineado) sobre un ASR generalista de última generación mejora de forma sustancial la transcripción de un dominio tan específico como el audio histórico de los años setenta: recupera el 72,3% de las palabras de referencia en salas frente al 63,8% del modelo base, y el 64,9% de las palabras de Nixon frente al 49,3%. Por otro, sirve como pieza central de un corpus documental de interés histórico, combinado con Whisper y un paso de corrección archivística que eleva la cobertura al 76,1% en conversaciones de referencia.

El modelo no es un ASR de propósito general: está afinado para un único archivo sonoro, con un vocabulario y unas condiciones acústicas muy concretas. Su licencia CC BY 4.0 permite uso comercial y derivados con atribución, tanto a NVIDIA como al autor del corpus.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificador transducer token-and-duration (TDT) |
| Parámetros totales | 600 millones (0.6B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (decodificación en ventanas de 5 minutos según la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | NeMo (.nemo); tamaño del repositorio 2,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un FastConformer, variante eficiente del Conformer con atención por bloques que reduce el coste computacional en secuencias largas, acoplada a un decodificador transducer TDT. Este decodificador predice conjuntamente el token y su duración, lo que permite emitir marcas de tiempo por palabra de forma nativa y mejora la alineación en audio con silencios, ruido y solapamientos de hablantes, condiciones frecuentes en las cintas Nixon.

El ajuste fino se realizó sobre 6.830 filas de entrenamiento (24,3 horas en total) con NVIDIA NeMo 3.0.0, AdamW, learning rate 6e-5 y 8 épocas. Los datos combinan 4.790 clips (19,9 horas) de transcripciones del Watergate Special Prosecution Force alineadas forzosamente con el audio (dominio público), 68 clips transcritos manualmente de oído sobre las cintas, 98 fragmentos corregidos de audio de sala de baja confianza y 38 clips de ruido etiquetados para que el modelo no emita texto, cada uno repetido diez veces. La decodificación del corpus se hizo con decodificación greedy en ventanas de 5 minutos.

## Capacidades

- Reconocimiento automático del habla en inglés sobre audio histórico analógico de los años setenta.
- Marcas de tiempo por palabra gracias al decodificador TDT (`timestamps=True`).
- Transcripción de conversaciones multi-hablante en salas con micrófonos ocultos, con calidad variable según la acústica.
- Transcripción de audio telefónico (escuchas), con mejor rendimiento relativo que en salas ruidosas.
- Supresión de salida en fragmentos de ruido: el modelo fue entrenado para no escribir nada en 38 clips de ruido.
- Entrada de audio a 16 kHz mono.
- No soporta tool calling, agentes, visión, audio de salida ni modo de razonamiento; es exclusivamente un ASR.

## Casos de uso

- Investigación histórica y archivística: transcribir las 19.426 conversaciones del corpus Nixon con marcas de tiempo y etiquetado de hablante, combinando el modelo con Whisper y un paso de corrección para alcanzar el 76,1% de cobertura en las conversaciones de referencia.
- Búsqueda y consulta de archivos sonoros: indexar las transcripciones para permitir búsquedas por palabra o frase en nixoncorpus.org y localizar el instante exacto del audio.
- Edición documental y periodismo de datos: verificar citas textuales contra el audio original, usando las marcas de tiempo por palabra para acotar la escucha.
- Digitalización de fondos de audio histórico similares (ruido analógico, micrófonos ocultos, cintas de carrete): el modelo sirve como punto de partida para ajustes finos en otros archivos con condiciones acústicas parecidas.
- Análisis de conversaciones telefónicas grabadas: con un 87,3% de recuperación de palabras en el conjunto de teléfono, es adecuado para transcribir escuchas y llamadas de baja calidad.
- Docencia y humanidades digitales: generar transcripciones de trabajo para seminarios de historia contemporánea, con la advertencia de que deben contrastarse con el audio.
- Evaluación comparativa de ASR en dominios históricos: sirve como referencia de ajuste fino ligero sobre FastConformer para experimentos de adaptación de dominio.

## Benchmarks y rendimiento

Recuperación de palabras de referencia (porcentaje de palabras transcritas correctamente) en seis grabaciones de sala no incluidas en el ajuste fino:

| Modelo | Palabras de sala | Palabras de Nixon | Respuestas cortas | Teléfono |
|---|---|---|---|---|
| nvidia/parakeet-tdt-0.6b-v3 | 63,8% | 49,3% | 32,2% | 82,0% |
| este modelo (v5) | 72,3% | 64,9% | 46,7% | 87,3% |

En 165 conversaciones reservadas transcritas por historiadores del Departamento de Estado para *Foreign Relations of the United States*, este modelo recupera por sí solo el 73,7% de las palabras de referencia, frente al 69,2% de Whisper large-v3. En el corpus completo se combina con Whisper y una corrección archivística que alcanza el 76,1%.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 0,6B parámetros en precisión nativa (fp16/bf16) el peso ronda 1,2-1,3 GB, más overhead del runtime NeMo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para fp16; A100 o H100 para procesar lotes grandes de audio en paralelo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, 4060, 4090 y similares, aunque el dato exacto no está publicado.
- Opciones de despliegue: NVIDIA NeMo (`nemo.collections.asr.models.ASRModel.restore_from`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| este modelo (v5) | 0,6B | ventanas de 5 min | 72,3% sala / 64,9% Nixon / 87,3% teléfono | CC BY 4.0 | HuggingFace (akoopie) |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B | no disponible | 63,8% sala / 49,3% Nixon / 82,0% teléfono | CC BY 4.0 | HuggingFace (NVIDIA) |
| Whisper large-v3 | 1,55B | 30 s por ventana | 69,2% en conversaciones FRUS | MIT | HuggingFace (OpenAI) |

## Limitaciones y advertencias

- Ajustado a un único archivo: grabaciones analógicas de los años setenta de micrófonos ocultos y escuchas telefónicas. El rendimiento fuera de ese dominio no está evaluado.
- Peor precisión en salas ruidosas con muchos hablantes, especialmente en el Executive Office Building.
- La salida es una transcripción automática: las citas deben verificarse contra el audio antes de publicarse.
- Solo inglés; no se ha evaluado en otros idiomas.
- No hay datos publicados sobre sesgos demográficos o acústicos más allá de las condiciones del corpus.
- Riesgo de alucinación y de omisiones en pasajes ininteligibles, pese al entrenamiento con clips de ruido para suprimir salida.
- Licencia CC BY 4.0: permite uso comercial y obras derivadas con atribución a NVIDIA (modelo base) y al autor del corpus; se recomienda citar el dataset Nixon Corpus.
- El formato .nemo requiere NeMo para su carga; no es directamente compatible con runtimes de inferencia genéricos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akoopie/nixon-parakeet-tdt-0.6b-v5
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Web del corpus (búsqueda, lectura y escucha): https://nixoncorpus.org
- Corpus (release 1.2): https://doi.org/10.5281/zenodo.23657174
- Código y fuente del paper: https://github.com/akoopie/nixon-corpus
