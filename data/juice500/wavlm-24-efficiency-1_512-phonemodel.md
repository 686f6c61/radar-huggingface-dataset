# juice500/wavlm-24-efficiency-1_512-phonemodel

## Resumen

`wavlm-24-efficiency-1_512-phonemodel` es un adaptador ligero, publicado por el usuario `juice500`, que realiza segmentación y reconocimiento de fonemas a partir de las representaciones congeladas de WavLM-large. No es un modelo de lenguaje generativo, sino un cabezal de clasificación fonológica entrenado sobre las activaciones del codificador de voz auto-supervisado de Microsoft. Concretamente, emplea el método SPAM (S3M-based Phonological Activation Mapping), que proyecta cada fotograma del codificador en un vector de 43 activaciones fonológicas interpretables (sonoridad, nasalidad, estridencia, etc.) y, a partir de ahí, infiere los límites y las etiquetas de los fonemas.

El modelo se presenta como una ablación de eficiencia muestral: se ha ajustado únicamente con 1/512 de las emisiones de entrenamiento de TIMIT, lo que lo convierte en un caso de estudio sobre cuánto dato necesita un adaptador fonológico cuando se apoya en un codificador auto-supervisado de gran tamaño. Está pensado para inglés (idioma declarado `en`) y se distribuye con licencia MIT, aunque el vocabulario PHOIBLE que puede descargar en tiempo de ejecución tiene licencia CC BY-SA 3.0 independiente.

Su relevancia actual es doble: por un lado, demuestra que es posible obtener segmentación y reconocimiento fonético con muy pocos datos supervisados si se reutilizan representaciones S3M; por otro lado, ofrece una representación fonológica interpretable y de bajo coste, útil para investigación en fonética computacional, evaluación de sistemas ASR y tareas de alineamiento forzado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador sobre WavLM-large (transformer convolucional auto-supervisado, capa 24) con cabezales de segmentación y reconocimiento fonológico vía SPAM |
| Parámetros totales | No disponible (el adaptador es ligero; el codificador base WavLM-large tiene ~317 M de parámetros, dato no confirmado en la información proporcionada) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio a 16 kHz por fotogramas; longitud de utterance no especificada) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`); admite restricción a inventarios PHOIBLE de otros idiomas mediante `vocab_for_language` |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 descargado en runtime es CC BY-SA 3.0) |
| Formato de pesos | No disponible (repo de 0.0 GB; probablemente pesos del adaptador en formato propio de la librería `phonespam`) |

## Arquitectura y entrenamiento

El modelo no entrena el codificador: WavLM-large permanece congelado y se usa como extractor de características a 16 kHz. Sobre la capa 24 de WavLM se aplica SPAM, que mapea cada fotograma a un vector de 43 activaciones fonológicas en el rango [0, 1] con nombres como `silence+`, `syl+`, `son+`, etc. A partir de esa representación interpretable, dos cabezales derivan la segmentación (límites entre fonemas) y la etiqueta fonética de cada segmento. La innovación principal es precisamente esa intermediación fonológica: en lugar de clasificar fonemas directamente desde representaciones opacas, el modelo fuerza una capa intermedia con significado fonético, lo que facilita la inspección y el análisis.

El entrenamiento se realizó sobre TIMIT (`timit-asr/timit_asr`) y, en esta variante concreta, con una ablación de eficiencia muestral: solo 1/512 de las emisiones de entrenamiento, correspondiente a la Figura 3 del artículo. No se especifican en la información disponible el número exacto de utterances, la composición completa del dataset ni si hubo etapas de ajuste fino adicionales más allá del adaptador. El artículo asociado es "Phone Segmentation and Recognition through Phonological Activation Mapping" (SLT 2026).

## Capacidades

- Segmentación fonética: devuelve segmentos contiguos con tiempos de inicio y fin en segundos.
- Reconocimiento de fonemas: etiqueta cada segmento con un símbolo fonético.
- Representación fonológica interpretable: expone un vector de 43 activaciones (sonoridad, nasalidad, estridencia, etc.) por fotograma mediante `model.spam(...)`.
- Restricción de vocabulario por idioma: `vocab_for_language("deu")` limita la decodificación al inventario PHOIBLE de un idioma concreto.
- Procesamiento de audio a 16 kHz con WavLM-large como codificador congelado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-turno (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Alineamiento forzado en investigación fonética: obtener límites y etiquetas de fonemas sobre corpus de habla inglesa para estudios de duración, coarticulación o variación alofónica, aprovechando la representación SPAM interpretable.
- Evaluación de sistemas ASR: comparar la salida fonética del modelo con transcripciones de referencia para medir errores a nivel de fonema en lugar de palabra.
- Análisis de pronunciación: identificar qué fonemas produce un hablante y en qué intervalos, útil en herramientas de apoyo a la enseñanza de inglés como segunda lengua.
- Anotación semiautomática de corpus: preetiquetar fonemas en grabaciones para que anotadores humanos solo revisen, reduciendo el coste de creación de datasets fonéticos.
- Extracción de características para modelos posteriores: usar los vectores de 43 activaciones como entrada de clasificadores de acento, disartria o trastornos del habla.
- Experimentos de eficiencia muestral: servir de línea base para estudiar cuánto dato supervisado necesita un adaptador fonológico sobre WavLM, dado que esta variante usa 1/512 del conjunto de entrenamiento.
- Multilingüe exploratorio: con `vocab_for_language`, probar la decodificación restringida a inventarios PHOIBLE de otras lenguas, aunque el modelo solo declara inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; al tratarse de un adaptador sobre WavLM-large congelado, la inferencia requiere cargar el codificador completo, lo que típicamente implica varios GB en fp32/fp16, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles; el código admite `device="cuda"` para GPU y ejecución en CPU por defecto.
- Cabe en GPU de consumo: no confirmado; el tamaño del repo es 0.0 GB, lo que sugiere que los pesos del adaptador son muy pequeños y el coste recae en el codificador base.
- Opciones de despliegue: librería `phonespam` (`pip install phonespam`), demo en Streamlit (`phonespam.streamlit.app`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wavlm-24-efficiency-1_512-phonemodel | Adaptador fonológico sobre WavLM-large | No disponible (adaptador ligero + WavLM-large congelado) | No disponible | MIT | Hugging Face, librería `phonespam` |
| WavLM-large (base) | Codificador S3M | ~317 M (dato no confirmado en la información) | No disponible | No disponible en esta ficha | Hugging Face |
| Modelos ASR fonéticos tipo wav2vec2 + CTC | Reconocimiento fonético | Variable | Variable | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado solo con 1/512 de TIMIT: la cobertura de variedades, hablantes y condiciones acústicas es muy reducida, lo que puede degradar el rendimiento fuera del dominio de entrenamiento.
- Idioma declarado únicamente inglés; el uso con otros inventarios PHOIBLE es experimental y no está validado.
- Riesgo de errores en los límites de segmentación y en las etiquetas fonéticas, especialmente en habla espontánea o con ruido.
- No es un modelo generativo ni un ASR de palabras: no produce transcripciones ortográficas ni texto libre.
- La licencia MIT cubre el modelo, pero `vocab_for_language` descarga PHOIBLE 2.0, que es CC BY-SA 3.0 y tiene condiciones propias para uso comercial y redistribución.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del rendimiento en producción.
- No se dispone de información sobre sesgos demográficos, acentos o robustez ante ruido; deben evaluarse antes de cualquier despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/wavlm-24-efficiency-1_512-phonemodel
- Modelo base WavLM-large: https://huggingface.co/microsoft/wavlm-large
- Artículo (arXiv): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset TIMIT ASR: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE 2.0: https://phoible.org
