# Ghostfury73/ai-models

## Resumen

Ghostfury73/ai-models no es un modelo único, sino un repositorio agregador de modelos de terceros en formato GGUF. El autor, Ghostfury73, publica en un solo espacio tres ficheros cuantizados de modelos ajenos, cada uno sujeto a la licencia de su modelo original. El repositorio declara una licencia agregada `other` (`mixed-see-readme`) precisamente porque conviven ficheros con licencias distintas: Apache-2.0 para el modelo de lenguaje y CC BY 4.0 para los dos modelos de reconocimiento de voz.

El contenido es heterogéneo. Por un lado incluye `kip-lm-q4.gguf`, una cuantización Q4_0 de Granite 3.0 3B-A800M Instruct de IBM, un transformer MoE de 3.374.295.552 parámetros totales con unos 800 millones activos por token. Por otro incluye dos cuantizaciones de modelos de voz derivados de NVIDIA parakeet-tdt-0.6b-v3, republicados por Moondream como Parakeet Ultra y Parakeet Redux, ambos de aproximadamente 0,6 mil millones de parámetros.

Su relevancia es práctica más que investigadora: sirve como punto de descarga de pesos ya cuantizados listos para llama.cpp u otros runtimes GGUF, con 231 descargas y ningún "like" en el momento de la consulta. No hay model card técnica propia, ni benchmarks, ni información sobre datos de entrenamiento o idiomas más allá de lo que declaran los modelos de origen.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible como conjunto; el fichero de lenguaje es un transformer MoE (Granite 3.0 3B-A800M); los de voz son modelos ASR basados en NVIDIA parakeet-tdt-0.6b-v3 |
| Parametros totales | 3.374.295.552 (dato safetensors del repo, correspondiente al modelo de lenguaje); los ficheros de voz rondan los 0,6 mil millones |
| Parametros activos | Aproximadamente 800 millones en el modelo MoE de lenguaje (según el nombre 3B-A800M); no aplica a los modelos de voz |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (`kip-lm-q4.gguf`), Q4_K_M (`parakeet-ultra-0.6b-Q4_K_M.gguf`), TQ1_Q8_0 (`parakeet-redux-0.6b-TQ1_Q8_0.gguf`) |
| Idiomas soportados | No disponibles |
| Licencia | Mixta: Apache-2.0 (fichero de lenguaje), CC BY 4.0 (ficheros de voz); el repo declara `other` / `mixed-see-readme` |
| Formato de pesos | GGUF exclusivamente |

## Arquitectura y entrenamiento

El repositorio no entrena nada: solo redistribuye pesos ya entrenados en formato GGUF. El fichero de lenguaje corresponde a Granite 3.0 3B-A800M Instruct de IBM, un transformer con mezcla de expertos (MoE) de 3B parámetros totales y aproximadamente 800M activos por token, cuantizado a Q4_0 por bartowski. Los dos ficheros de voz derivan de NVIDIA parakeet-tdt-0.6b-v3, un modelo ASR con arquitectura TDT (token-and-duration transducer), reprocesado por Moondream como Parakeet Ultra y Parakeet Redux y cuantizado por Nairod785.

No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset, fases de RLHF/DPO ni innovaciones técnicas específicas dentro de este repositorio. Cualquier dato de ese tipo habría que consultarlo en las model cards de los modelos originales (IBM Granite, NVIDIA Parakeet, Moondream Parakeet Ultra/Redux), no en esta ficha.

## Capacidades

- Generación de texto conversacional e instrucciones en el fichero de lenguaje (Granite 3.0 3B-A800M Instruct), incluyendo razonamiento básico y respuesta a prompts de tipo chat.
- Reconocimiento automático de voz (ASR) en los dos ficheros Parakeet, orientados a transcripción de audio a texto.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso a través de infraestructura de inferencia compatible con GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Capacidades especiales (thinking mode, visión, audio): audio vía los modelos Parakeet; visión y thinking mode no disponibles.

## Casos de uso

- Transcripción de reuniones y notas de voz: los ficheros Parakeet Ultra y Redux, en cuantizaciones Q4_K_M y TQ1_Q8_0, permiten ejecutar ASR en local sin depender de servicios en la nube, útil para equipos con requisitos de privacidad.
- Subtitulado automático de vídeo: el modelo ASR puede alimentar un pipeline que genere pistas de subtítulos a partir de la banda de audio, con la ventaja de que los pesos GGUF se integran en herramientas tipo llama.cpp.
- Prototipado de asistentes conversacionales: `kip-lm-q4.gguf` permite levantar un chat de instrucciones en una máquina modesta gracias a su cuantización Q4_0 y a sus aproximadamente 800M parámetros activos.
- Evaluación comparativa de cuantizaciones: el repositorio reúne tres esquemas distintos (Q4_0, Q4_K_M, TQ1_Q8_0), lo que facilita medir el impacto de la precisión en calidad y velocidad sobre el mismo hardware.
- Despliegue en entornos con recursos limitados: al ser GGUF y con un modelo de lenguaje MoE de 3B, cabe en equipos de consumo, lo que sirve para demos y pruebas offline.
- Integración en pipelines de voz a texto con post-procesado por LLM: combinar el ASR Parakeet con el modelo de lenguaje Granite para resumir o estructurar transcripciones dentro de una misma infraestructura de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el repo ocupa 2,6 GB en total, por lo que el fichero de lenguaje Q4_0 de un modelo de 3B debería manejarse con unos pocos gigabytes de memoria, y los ficheros de voz de 0,6B en cuantización baja, con menos.
- GPU recomendadas: no disponibles; por tamaño, el modelo de lenguaje MoE de 3B es apto para GPU de consumo tipo RTX 3060/4060 en adelante, y los modelos ASR de 0,6B para GPUs aún más modestas.
- Cabe en GPU de consumo: sí, presumiblemente, dado el tamaño de los pesos; no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: llama.cpp y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere soporte en plataformas de endpoints de inferencia. vLLM, TGI u Ollama no se mencionan explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ghostfury73/ai-models (este repo) | 3,37B (lenguaje) + 0,6B (voz) | No disponible | GGUF | Mixta (Apache-2.0 / CC BY 4.0) | Agregador de terceros, sin benchmarks propios |
| ibm-granite/granite-3.0-3b-a800m-instruct | 3B totales, ~800M activos | No disponible en esta ficha | Safetensors y GGUF | Apache-2.0 | Modelo original del fichero de lenguaje |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6B | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Modelo ASR base de los ficheros de voz |
| moondream/parakeet-ultra y parakeet-redux | ~0,6B | No disponible en esta ficha | No disponible en esta ficha | CC BY 4.0 | Post-entrenamientos de Parakeet usados aquí |

## Limitaciones y advertencias

- No es un modelo entrenado por el autor: es un repositorio de redistribución; la calidad y el comportamiento dependen íntegramente de los modelos de origen.
- Licencia mixta: el uso comercial exige revisar fichero a fichero (Apache-2.0 para el de lenguaje, CC BY 4.0 con atribución para los de voz).
- Ausencia de model card técnica: no hay información sobre contexto, idiomas, sesgos ni datos de entrenamiento en este repositorio.
- Riesgo de alucinación inherente al modelo de lenguaje Granite 3.0 3B, agravado por la cuantización Q4_0, que puede degradar la calidad frente a los pesos originales.
- Los ficheros de voz están cuantizados en precisiones bajas (Q4_K_M y TQ1_Q8_0), lo que puede afectar a la precisión de transcripción en audio ruidoso o con acentos marcados.
- Sin garantías de mantenimiento: el repositorio no declara soporte, versionado ni actualizaciones más allá de las fechas de creación y actualización registradas.
- No se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingüe sin verificar los modelos originales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Ghostfury73/ai-models
- Modelo original de lenguaje (IBM Granite 3.0 3B-A800M Instruct): https://huggingface.co/ibm-granite/granite-3.0-3b-a800m-instruct
- Cuantización GGUF de referencia de Granite (bartowski): https://huggingface.co/bartowski/granite-3.0-3b-a800m-instruct-GGUF
- Modelo ASR base (NVIDIA parakeet-tdt-0.6b-v3): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Parakeet Ultra (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Parakeet Redux (Moondream): https://huggingface.co/moondream/parakeet-redux
- Cuantizaciones GGUF de Parakeet Ultra (Nairod785): https://huggingface.co/Nairod785/parakeet-ultra-gguf
- Cuantizaciones GGUF de Parakeet Redux (Nairod785): https://huggingface.co/Nairod785/parakeet-redux-gguf
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
