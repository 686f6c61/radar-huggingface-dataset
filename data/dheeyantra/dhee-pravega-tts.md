# dheeyantra/dhee-pravega-tts

## Resumen

Pravega-TTS v5 es un modelo de síntesis de voz (text-to-speech) desarrollado por Dheeyantra Research Labs y publicado en HuggingFace con el identificador `dheeyantra/dhee-pravega-tts`. Es un ajuste fino del modelo `FunAudioLLM/Fun-CosyVoice3-0.5B-2512`, de aproximadamente 500 millones de parámetros, que añade soporte para 11 lenguas indias más el inglés indio, incorpora árabe y conserva las lenguas europeas que el modelo base ya hablaba (alemán, español, francés y ruso), hasta un total de 17 idiomas. La arquitectura es la de CosyVoice 3: un modelo de lenguaje texto-a-token, un decodificador de flow matching y un vocoder, con salida en mono a 24 kHz.

El modelo funciona en modo zero-shot: la voz no es un identificador de hablante fijo, sino un clip de referencia de 4 a 12 segundos acompañado de su transcripción exacta. Resuelve un problema concreto y medible: la escasez de voces de calidad en lenguas indias dentro de los sistemas TTS multilingües, sin degradar los idiomas que el modelo base ya cubría. Según la model card, el error de carácter (CER) medio en las 7 lenguas indias con línea base comparable baja de 0,940 a 0,382, mientras que la media en las lenguas europeas preexistentes pasa de 0,030 a 0,038.

Su relevancia actual radica en que el ajuste fino se limita al LM de texto a token (`llm.pt`) y al decodificador (`flow.pt`), dejando intactos vocoder, tokenizador de voz, encoder de hablante y encoder de texto. Esto demuestra que es posible ampliar la cobertura idiomática de un TTS sin olvido catastrófico apreciable. La principal restricción es la licencia: Dhee Research-Only Licence v1.0, exclusiva para investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CosyVoice 3: modelo de lenguaje texto-a-token + decodificador de flow matching + vocoder |
| Parámetros totales | 0,5 B aproximadamente (heredados de Fun-CosyVoice3-0.5B-2512) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los tags del repositorio mencionan ONNX y safetensors, pero no se detallan esquemas de cuantización concretos |
| Idiomas soportados | 17: as, bn, en (incluido inglés indio), gu, hi, kn, ml, mr, or, pa, ta, te, ar, de, es, fr, ru |
| Licencia | Dhee Research-Only Licence v1.0 (solo investigación, prohibido el uso comercial) |
| Formato de pesos | safetensors y ONNX, más checkpoints `.pt` (`llm.pt`, `flow.pt`) |
| Tamaño del repositorio | 5,4 GB |
| Frecuencia de muestreo de salida | 24 kHz mono |
| Librería de inferencia | `cosyvoice` (runtime propio de FunAudioLLM) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de CosyVoice 3, un sistema en cascada con cinco componentes: encoder de texto, tokenizador de voz, modelo de lenguaje que convierte texto en tokens de habla, decodificador de flow matching que transforma esos tokens en mel-espectrogramas y vocoder que genera la forma de onda final. El ajuste fino solo modificó el LM texto-a-token y el decodificador de flow matching; el vocoder, el tokenizador de voz, el encoder de hablante y el encoder de texto se mantienen idénticos al modelo base. La condición de voz se inyecta como prompt: un prefijo fijo (`"You are a helpful assistant.<|endofprompt|>"`) seguido de la transcripción literal del clip de referencia.

No se especifica en la información disponible el número de tokens de entrenamiento ni la composición completa del dataset. Sí se indica que parte de los datos de entrenamiento en lenguas indias procede de la base de datos Indic TTS del IIT de Madrás, cuyos términos son no comerciales, y que el repositorio incluye un fichero `NOTICE` con la procedencia de las voces. No hay mención a RLHF, DPO ni a técnicas de decodificación especulativa en la documentación consultada. La innovación destacable es metodológica: ampliar de forma selectiva la cobertura idiomática preservando el rendimiento en las lenguas originales, con un coste de 0,009 CER en la media europea.

## Capacidades

- Síntesis de voz a partir de texto con salida en mono a 24 kHz.
- Clonación de voz zero-shot: basta un clip limpio de 4 a 12 segundos y su transcripción exacta, sin necesidad de un clip del repositorio.
- Cobertura multilingüe de 17 idiomas, con especial atención a las lenguas indias (asamés, bengalí, guyaratí, hindi, canarés, malabar, maratí, odia, panyabí, tamil y telugu) más árabe, alemán, español, francés, ruso e inglés.
- Conservación de las capacidades del modelo base en lenguas europeas, verificado mediante una prueba de regresión de CER.
- Generación en streaming opcional: la API `inference_zero_shot` acepta el parámetro `stream`.
- No dispone de tool calling ni function calling: es un modelo puramente de síntesis de voz.
- No dispone de capacidades de agente, razonamiento multi-paso ni modo de pensamiento.
- No procesa visión, audio de entrada (más allá del clip de referencia) ni otras modalidades.
- No se documentan controles de emoción, prosodia o estilo más allá de los que herede implícitamente del modelo base.

## Casos de uso

- Investigación en TTS para lenguas indias: permite evaluar y comparar la calidad de síntesis en idiomas con pocos recursos (asamés, odia, panyabí) usando el protocolo de CER por ida y vuelta con `whisper-large-v3`.
- Generación de datos sintéticos de voz para entrenar reconocedores de habla: se pueden producir corpus de audio etiquetado en hindi, maratí o guyaratí para aumentar datasets de ASR escasos, siempre en un contexto de investigación.
- Doblaje y localización de contenido educativo: el modelo permite sintetizar el mismo guion en varios idiomas indios y en español, francés o árabe reutilizando una misma voz de referencia, lo que mantiene la coherencia de marca en cursos multilingües.
- Accesibilidad y lectores de pantalla: conversión de texto a voz en lenguas indias donde los motores comerciales tienen cobertura limitada, con una ventana de referencia corta que facilita el despliegue en entornos con recursos ajustados.
- Prototipado de asistentes de voz en centros de atención al cliente: el modo zero-shot permite probar distintas voces por idioma sin reentrenar, aunque la licencia restringe el uso a entornos de investigación y no a producción comercial.
- Preservación lingüística y documentación de campo: los investigadores pueden clonar la voz de hablantes nativos a partir de grabaciones de campo y generar material de audio para el estudio de lenguas minoritarias.
- Pruebas de regresión de modelos TTS: el conjunto de métricas de la model card (CER por ida y vuelta) sirve como plantilla reproducible para comparar nuevas variantes de ajuste fino.

## Benchmarks y rendimiento

Evaluación de CER por ida y vuelta: se sintetiza una frase y se transcribe con `openai/whisper-large-v3`; menor es mejor. `n` es el número de clips evaluados.

Lenguas objetivo del ajuste fino:

| Idioma | CER, este modelo | CER, CosyVoice 3 original | n |
|---|---:|---:|---:|
| Tamil | 0,031 | 0,632 | 1 |
| Canarés | 0,114 | 0,712 | 2 |
| Guyaratí | 0,126 | 0,966 | 1 |
| Hindi | 0,143 | sin línea base | 4 |
| Maratí | 0,202 | sin línea base | 4 |
| Bengalí | 0,373 | 0,882 | 4 |
| Panyabí | 0,461 | 1,292 | 2 |
| Malabar | 0,783 | 0,879 | 1 |
| Asamés | 0,786 | 1,216 | 1 |
| Telugu | 1,035 | sin línea base | 4 |
| Odia | no evaluable | no evaluable | — |
| Árabe | 0,134 | 2,918 | 3 |

Media de las 7 lenguas indias con línea base: 0,940 a 0,382.

Prueba de regresión en lenguas ya soportadas por el modelo base:

| Idioma | CER, este modelo | CER, CosyVoice 3 original | n |
|---|---:|---:|---:|
| Español | 0,000 | 0,036 | 4 |
| Francés | 0,011 | 0,015 | 4 |
| Inglés | 0,049 | 0,064 | 4 |
| Ruso | 0,061 | 0,031 | 4 |
| Alemán | 0,070 | 0,004 | 3 |

Media: 0,030 a 0,038. Advertencias declaradas por el autor: el árabe se excluye deliberadamente de la media de regresión porque el modelo base no lo hablaba en absoluto; las puntuaciones altas en telugu, malabar y asamés pueden deberse a debilidades de Whisper large-v3 en esos idiomas; el odia no es puntuable porque Whisper no lo soporta; y el tamaño de muestra (1 a 4 clips por idioma) hace que las filas con un solo clip sean meramente indicativas.

## Requisitos de hardware

- VRAM estimada: entre 4 y 8 GB en precisión completa o fp16 para los 0,5 B de parámetros más el decodificador de flow matching y el vocoder. Cálculo aproximado a partir del tamaño del repositorio (5,4 GB); no hay cifras oficiales publicadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 3070, RTX 4060, RTX 4070, RTX 4080 o RTX 4090. En el extremo profesional, A100, H100 o L40S ofrecen margen sobrado y permiten lotes grandes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU modernas con 8 GB o más, incluidas las de gama media.
- Opciones de despliegue: el runtime oficial de CosyVoice (clonado recursivo del repositorio de FunAudioLLM, con `third_party/Matcha-TTS` en el `PYTHONPATH`). La API admite `load_trt=True` para usar TensorRT y `fp16=True`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, dado que no es un modelo de lenguaje estándar.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: el repositorio completo ocupa 5,4 GB y se descarga con `snapshot_download`.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Clonación de voz | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dhee-pravega-tts (este modelo) | 0,5 B | 17 (11 indias, inglés, árabe, de, es, fr, ru) | Sí, zero-shot | Dhee Research-Only v1.0 (no comercial) | HuggingFace, descargas 0 y 0 likes en el momento de la consulta |
| FunAudioLLM/Fun-CosyVoice3-0.5B-2512 (base) | 0,5 B | no disponible con detalle; no cubre lenguas indias según los CER reportados | Sí, zero-shot | Apache-2.0 | HuggingFace |
| Coqui XTTS-v2 | 0,467 B aproximadamente | 17 | Sí, zero-shot | CPML (no comercial) | HuggingFace |
| Modelos TTS específicos para lenguas indias (por ejemplo, la familia IndicTTS o Indic Parler-TTS) | no disponible | centrados en lenguas indias | variable según el modelo | variable | no disponible |

No se dispone de datos verificados de benchmarks comunes entre estos modelos dentro de la información proporcionada; la comparación directa de CER no es posible porque cada sistema usa protocolos de evaluación distintos.

## Limitaciones y advertencias

- Licencia de solo investigación (Dhee Research-Only Licence v1.0): queda prohibido el uso comercial. Cualquier uso comercial requiere una licencia separada de Dheeyantra Research Labs.
- Parte de los datos de entrenamiento en lenguas indias procede de la base Indic TTS del IIT de Madrás, cuyos términos son no comerciales y condicionan la redistribución y el uso.
- Solo se pueden clonar voces para las que se tenga consentimiento explícito; es una obligación legal y ética, no una recomendación.
- El repositorio público solo incluye seis voces de referencia (asamés, odia y panyabí, femeninas y masculinas) porque son las únicas con procedencia redistribuible según el fichero `NOTICE`. Para el resto de idiomas hay que aportar un clip propio.
- La transcripción del clip de referencia debe coincidir palabra por palabra con el audio; un desajuste es la causa habitual de una clonación defectuosa.
- Telugu, malabar y asamés son las lenguas más débiles según la propia model card. En telugu y malabar las pruebas de escucha son mejores que el CER, porque Whisper large-v3 rinde mal en esos idiomas.
- El odia no es evaluable con el protocolo propuesto porque Whisper no lo soporta; no es necesariamente un fallo del modelo.
- Las puntuaciones se basan en 1 a 4 clips por idioma, por lo que la fiabilidad estadística es baja y varias filas proceden de un único clip.
- Riesgo de alucinación en el sentido propio del TTS: el modelo puede generar balbuceo o audio prolongado sin contenido inteligible, como demuestra el CER de 2,918 del modelo base en árabe.
- No se documentan sesgos demográficos, comportamiento en habla espontánea, cambio de código entre idiomas ni rendimiento en audio de más de unos segundos por turno.
- El idioma español aparece con CER 0,000 en la prueba de regresión, pero con solo 4 clips; no debe interpretarse como perfección absoluta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dheeyantra/dhee-pravega-tts
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-CosyVoice3-0.5B-2512
- Repositorio de CosyVoice (runtime de inferencia): https://github.com/FunAudioLLM/CosyVoice
- Licencia del modelo: fichero `LICENSE` del repositorio de HuggingFace
- Procedencia de las voces: fichero `NOTICE` del repositorio de HuggingFace
- Banco de voces de referencia: `voice_bank/voice_bank.jsonl` dentro del repositorio
- Transcripción de evaluación: `openai/whisper-large-v3`, https://huggingface.co/openai/whisper-large-v3
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados obtenidos correspondían a páginas de un servicio de vídeo en streaming y no guardan relación con la ficha.
