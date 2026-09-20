# BrianSG26/scut-kokoro-vi

## Resumen

scut-kokoro-vi es una redistribución del modelo de síntesis de voz contextboxai/Kokoro-Vietnamese, publicada por el usuario BrianSG26, cuyo único cambio respecto al original es la inserción de 13 claves de metadatos en el fichero ONNX para que sherpa-onnx reconozca el modelo como un Kokoro válido. Los pesos, el grafo de computación y las entradas/salidas son idénticos a los del modelo base, de modo que la calidad de audio es la misma que la del original. El repositorio ocupa 0,3 GB e incluye un ONNX en fp32 de 311 MB, un fichero voices.bin de 7,3 MB con 14 voicepacks y un tokens.txt generado a partir del vocabulario del modelo base.

Se trata de un sistema TTS específico para vietnamita (vi), con salida a 24 000 Hz y 14 voces identificadas por índice de 0 a 13. Su relevancia práctica es de ingeniería de despliegue: convierte un modelo PyTorch del ecosistema Kokoro en un artefacto cargable directamente por sherpa-onnx, lo que permite ejecutarlo en dispositivos Android sin GPU y sin conexión. El autor reporta una prueba en un Samsung S20 FE con sherpa-onnx 1.13.8 en la que, tras generar cuatro frases y volver a transcribirlas con un reconocedor Zipformer-vi, se obtienen 64 de 65 palabras correctas (98,5 %).

La limitación más importante documentada por el autor es que el modelo fue entrenado con las representaciones fonéticas de vig2p y no con espeak-ng. sherpa-onnx envía por defecto todo el texto latino a espeak-ng (la clave `voice` tiene valor por defecto `en-us` y nunca queda vacía, por lo que la rama de diccionario para texto latino es código muerto), así que usar el modelo sin una capa de fonemización propia produce pronunciaciones incorrectas en vietnamita.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; familia Kokoro. La model card solo especifica que el generador de forma de onda es istftnet (Conv + LSTM), donde se concentra el 71 % de los pesos |
| Parámetros totales | No disponible (el checkpoint ONNX en fp32 ocupa 311 MB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de texto a voz; no se documenta límite de caracteres de entrada) |
| Tipos de cuantización | Solo fp32 en el repositorio. El autor probó int8 (véase la sección de rendimiento) y desaconseja su uso |
| Idiomas soportados | Vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (scut-kokoro-vi.onnx, 311 MB), voices.bin (float32 continuo, 7,3 MB) y tokens.txt (801 B) |
| Frecuencia de muestreo | 24 000 Hz |
| Número de voces | 14 |
| Entradas del ONNX | input_ids, ref_s, speed |
| Salidas del ONNX | waveform, duration |
| Dimensión del vector de estilo | style_dim = 510,1,256 |
| Metadatos añadidos | model_type, n_speakers, sample_rate, version, has_espeak, voice (vacío), style_dim, id2speaker, speaker2id, speaker_names, language, maintainer, comment |
| Tamaño del repositorio | 0,3 GB |
| Modelo base | contextboxai/Kokoro-Vietnamese |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento: la model card de esta redistribución no documenta el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. Lo único verificable es que los pesos proceden íntegros de contextboxai/Kokoro-Vietnamese y que esta versión no los modifica. El código de entrenamiento e inferencia del modelo original está publicado en el repositorio iamdinhthuan/Kokoro-Vietnamese.

A nivel de arquitectura, el autor indica que el decodificador de forma de onda es istftnet (convoluciones más LSTM) y que ahí se concentra el 71 % de los pesos, razón por la cual la cuantización int8 degrada la calidad y penaliza gravemente la latencia. La innovación técnica de esta redistribución no está en el modelo sino en el empaquetado: se añaden 13 claves al ONNX (entre ellas `model_type: kokoro`, `n_speakers: 14`, `sample_rate: 24000`, `version: 2`, `has_espeak: 0` y `style_dim: 510,1,256`) y se fusionan los 14 voicepacks `.pt` en un único voices.bin en float32, ordenado según `id2speaker`, que es el formato que espera sherpa-onnx. Adicionalmente, la clave `voice` se deja vacía de forma deliberada para intentar sortear el enrutado automático a espeak-ng.

## Capacidades

- Síntesis de voz en vietnamita a 24 000 Hz, con control de velocidad mediante la entrada `speed`.
- Catorce voces seleccionables por índice: `diem_trinh`, `hung_thinh`, `mai_linh`, `mai_loan`, `manh_dung`, `my_yen`, `ngoc_huyen`, `phat_tai`, `thanh_dat`, `thuc_trinh`, `tuan_ngoc`, `storyvert`, `duc_an`, `duc_duy` (índices 0 a 13).
- Inferencia en CPU sobre Android mediante sherpa-onnx 1.13.8, sin necesidad de GPU ni de conexión de red.
- Devolución de la duración del audio generado junto con la forma de onda (`duration` como salida del grafo).
- Fonemización basada en vig2p, siempre que la aplicación proporcione la capa de conversión correspondiente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni entrada multimodal: es exclusivamente un modelo de texto a voz de un solo idioma.
- No se documenta capacidad de clonación de voz a partir de muestras del usuario; las voces son fijas.

## Casos de uso

- Lectura por voz offline en aplicaciones Android: el modelo cabe en 311 MB en fp32 y se ejecuta en CPU, por lo que puede integrarse en apps de noticias o lectura que funcionen sin conexión, usando las 14 voces como opciones configurables.
- Audiolibros y contenido largo en vietnamita: la entrada `speed` permite ajustar la cadencia; el autor observa que la voz `storyvert` lee a 6,45 s por frase frente a los ~5,2 s de las demás para el mismo texto, lo que la hace adecuada para narración.
- Sistemas de atención al cliente e IVR en vietnamita: generación de respuestas habladas predefinidas o dinámicas en centralitas telefónicas, con el modelo desplegado en el servidor mediante ONNX Runtime.
- Accesibilidad para usuarios con discapacidad visual: lectura de interfaces, mensajes y documentos en vietnamita dentro de aplicaciones móviles, apoyándose en la inferencia local para evitar enviar texto del usuario a servicios externos.
- Enseñanza de vietnamita como lengua extranjera: generación de ejemplos de pronunciación con distintas voces para practicar la distinción de tonos, siempre que la capa de fonemización vig2p esté correctamente implementada.
- Aumento de datos para entrenar sistemas de reconocimiento de voz: el propio autor empleó un Zipformer-vi para re-transcribir la salida del modelo como método de evaluación, lo que demuestra la viabilidad del bucle texto→audio→texto.
- Doblaje y locución de vídeo corto: producción de pistas de audio en vietnamita para contenidos formativos o corporativos, con la precaución de verificar la licencia Apache-2.0 y los derechos asociados a las voces.
- Kioscos interactivos y señalización hablada en comercios o transporte, donde interesa una latencia baja sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no son aplicables a un modelo de texto a voz. El autor sí reporta mediciones propias de latencia y de inteligibilidad mediante transcripción de ida y vuelta con un Zipformer-vi:

| Prueba | Configuración | Resultado |
|---|---|---|
| Generación de 4,4 s de audio | fp32, Samsung S20 FE (Android), sherpa-onnx 1.13.8 | 3,6 s (RTF ≈ 0,82) |
| Generación de 4,4 s de audio | int8 en todos los pesos, 93 MB | 40,2 s (unas 10 veces más lento) |
| Generación de 4,4 s de audio | int8 solo en MatMul y Gemm, 275 MB | 5,4 s, calidad inferior |
| Inteligibilidad | 4 frases generadas y re-transcritas con Zipformer-vi | 64/65 palabras correctas (98,5 %); 3 de 4 frases perfectas |
| Pronunciación según ruta de fonemización | "Xin chào quý khách đến với tiệm bánh mì Cô Ba" con vig2p | Transcripción correcta del fragmento final |
| Pronunciación según ruta de fonemización | Misma frase dejando actuar a espeak-ng en sherpa-onnx | Transcripción errónea ("TIM BẾN MAIKOBA") |

## Requisitos de hardware

- Pesos en fp32 de 311 MB; en la práctica se recomienda reservar entre 0,5 y 1 GB de RAM para el proceso de inferencia, incluyendo el fichero voices.bin (7,3 MB) y el runtime.
- No requiere GPU: la ejecución validada por el autor es en CPU ARM sobre un Samsung S20 FE con Android.
- Cabe en cualquier GPU de consumo con 1 GB o más de VRAM, aunque no aporta ventajas frente a CPU en este tamaño; no se han publicado cifras de VRAM ni de aceleración por GPU.
- Opciones de despliegue: sherpa-onnx 1.13.8 (Android, iOS, C++, Python, C#, Go y otros enlaces), ONNX Runtime directo, o el stack original de Kokoro-Vietnamese en PyTorch. No es compatible con vLLM, llama.cpp ni TGI, que están orientados a modelos de lenguaje.
- Latencia medida: 3,6 s para generar 4,4 s de audio en el dispositivo citado (RTF ≈ 0,82, es decir, ligeramente más rápido que tiempo real). No hay datos de throughput en servidor.
- La cuantización int8 multiplica por diez el tiempo de generación y empeora la calidad, por lo que el autor recomienda explícitamente no comprimir el modelo.
- Se necesita una capa adicional en la aplicación: conversión de cada sílaba vietnamita a un carácter del rango U+4E00..U+9FFF como código, más un `lexicon` que asocie ese código a la secuencia de fonemas vig2p. Los códigos deben ir concatenados sin espacios.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Voces | Compatibilidad directa con sherpa-onnx | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| scut-kokoro-vi | No disponible (ONNX fp32 de 311 MB) | Vietnamita | 14 | Sí (metadatos `kokoro` insertados) | Apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| contextboxai/Kokoro-Vietnamese (base) | No disponible (mismos pesos) | Vietnamita | 14 | No de forma directa; requiere la conversión y el etiquetado de metadatos que aplica esta versión | Apache-2.0 | HuggingFace y repositorio iamdinhthuan/Kokoro-Vietnamese |
| Otras alternativas de TTS en vietnamita (por ejemplo, sistemas basados en XTTS o VITS) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible |

La búsqueda web realizada no devolvió resultados técnicos relacionados con el modelo ni con sistemas comparables, por lo que no es posible establecer una comparación cuantitativa con alternativas fuera del propio modelo base.

## Limitaciones y advertencias

- La redistribución no modifica los pesos: cualquier sesgo, limitación o defecto de pronunciación heredado de contextboxai/Kokoro-Vietnamese se mantiene intacto.
- El modelo no lee texto latino vietnamita de forma correcta con la configuración por defecto de sherpa-onnx, porque este enruta el texto latino a espeak-ng y el modelo fue entrenado con fonemas vig2p. Sin la capa de conversión a códigos y el `lexicon` asociado, la pronunciación es incorrecta (el autor documenta el ejemplo "TIM BẾN MAIKOBA").
- La solución de fonemización es un rodeo frágil: exige mantener los códigos concatenados sin espacios, restringirse al rango U+4E00..U+9FFF (el bloque de extensión A, U+3400, no se reconoce como chino y acaba leyéndose como nombres de carácter Unicode) y depende del comportamiento interno de sherpa-onnx, que puede cambiar entre versiones.
- La cuantización int8 degrada la calidad y multiplica por diez la latencia (40,2 s para 4,4 s de audio), por lo que el despliegue debe asumir el coste de los 311 MB en fp32.
- Solo soporta vietnamita, sin capacidades multilingües ni de cambio de idioma.
- No se documentan los estilos, registros ni la procedencia de cada una de las 14 voces; los nombres corresponden a identificadores del modelo base y no se aporta información sobre consentimiento o derechos de imagen y voz, aspecto que conviene verificar antes de un uso comercial o de difusión pública.
- El autor original no describe el matiz de cada voz; la única observación disponible es que `storyvert` lee más despacio (6,45 s frente a ~5,2 s para la misma frase), por lo que se infiere un uso narrativo sin confirmación oficial.
- El modelo tiene 0 descargas y 0 likes en HuggingFace y no ha pasado por una validación de la comunidad; se trata de un artefacto recién publicado y sin mantenimiento demostrado.
- Riesgo de alucinación en el sentido de TTS: el modelo no genera contenido semánticamente, pero puede producir pronunciaciones incorrectas o prosodia defectuosa en textos con números, siglas, palabras extranjeras o puntuación ambigua, sin que exista un mecanismo de verificación interno.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar los avisos de copyright y el fichero de licencia, y no concede derechos sobre marcas ni sobre las voces en sí.
- No se han publicado evaluaciones objetivas de calidad de audio (MOS, CMOS) ni comparaciones con otros sistemas vietnamitas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrianSG26/scut-kokoro-vi
- Modelo base: https://huggingface.co/contextboxai/Kokoro-Vietnamese
- Código de entrenamiento e inferencia del modelo original: https://github.com/iamdinhthuan/Kokoro-Vietnamese
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- vig2p (fonemizador usado en el entrenamiento del modelo base): https://pypi.org/project/vig2p/
- No se han encontrado papers, blogs técnicos ni demos adicionales en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el modelo.
