# Hansda/tiny-dictation-en

## Resumen

Tiny Dictation English es un sistema de reconocimiento automático del habla (ASR) en inglés distribuido por el usuario Hansda en Hugging Face. Se trata de un ensemble offline de dos codificadores acústicos CTC —Citrinet-256 gamma 0.25 y Conformer-CTC Small, ambos de NVIDIA— combinados mediante un selector de palabras aprendido de 24.353 parámetros. El archivo completo del modelo ocupa 17,91 MB, lo que lo sitúa en la categoría de modelos ultraligeros aptos para ejecución en CPU.

El modelo resuelve el problema de la transcripción local de grabaciones WAV y FLAC en inglés sin dependencia de servicios en la nube, empleando cuantización mixta (4 bits agrupados para Citrinet, 8 bits agrupados para Conformer, con algunos tensores y escalas en FP16) y ejecución mediante onnxruntime. Su relevancia actual radica en que ofrece un pipeline de dictado completamente offline con un tamaño de archivo inferior a 20 MB, algo poco habitual en sistemas con dos ramas acústicas independientes.

La propuesta técnica se apoya en la combinación de dos decodificadores CTC que generan propuestas a tres velocidades de reproducción (original y dos cercanas) y en un selector que cruza puntuaciones acústicas, contexto local de palabras y acuerdo entre fuentes para emitir la secuencia final. Los resultados declarados por el autor son un WER del 9,97 % en FLEURS English (US) test y del 3,41 % en LibriSpeech test-clean.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos codificadores CTC: Citrinet-256 gamma 0.25 (cuantizado a 4 bits agrupados) y Conformer-CTC Small (cuantizado a 8 bits agrupados), con selector de palabras aprendido de 24.353 parámetros |
| Parametros totales | no disponible (el autor no publica el recuento; el archivo completo pesa 17.913.319 bytes, 17,91 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio en chunks; sin ventana de tokens declarada) |
| Tipos de cuantizacion | 4 bits agrupados (Citrinet), 8 bits agrupados (Conformer), FP16 para algunos tensores y escalas de cuantización |
| Idiomas soportados | inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (ejecución con onnxruntime); el repositorio incluye los dos codificadores, sus tokenizers, los prioris de lenguaje y el selector de palabras |

## Arquitectura y entrenamiento

El sistema es un ensemble híbrido de dos ramas CTC. La primera parte de NVIDIA Citrinet-256 gamma 0.25, exportada a ONNX por OpenVoiceOS, e incorpora una proyección de características aprendida y un residual temporal; sus pesos se almacenan en 4 bits agrupados. La segunda parte de NVIDIA Conformer-CTC Small, con pesos en 8 bits agrupados. Ambas ramas comparten un paso de ganancia de pico limitada que facilita el procesamiento de grabaciones de bajo nivel por parte de los dos frontends. Cada decodificador CTC propone transcripciones a la velocidad de reproducción original y a dos velocidades cercanas, y las dos ramas cruzan sus puntuaciones en sus respectivos vocabularios de tokens.

La selección final la realiza un selector de 24.353 parámetros que combina contexto local de palabras, puntuaciones acústicas y acuerdo entre fuentes para elegir la secuencia de palabras definitiva. El selector se entrenó con 1.536 grabaciones del split de entrenamiento de FLEURS English (US) y 1.024 grabaciones de entrenamiento de LibriSpeech, y la release utiliza su checkpoint de la época ocho. La adaptación acústica previa empleó datos de FLEURS, LibriSpeech, LoquaciousSet y VoxPopuli. Las modificaciones respecto a los modelos base incluyen cuantización, fine-tuning, prioris de decodificador compactos, el selector de palabras aprendido y el ajuste de ganancia de entrada.

## Capacidades

- Transcripción de voz a texto en inglés para grabaciones WAV y FLAC, con remuestreo y mezcla a 16 kHz mono en el runner incluido.
- Ejecución completamente offline una vez instalados el archivo y las dependencias.
- Decodificación CTC con propuestas a tres velocidades de reproducción y cruce de puntuaciones entre dos vocabularios.
- Selección de palabras basada en contexto local, puntuaciones acústicas y acuerdo entre fuentes.
- Procesamiento de grabaciones largas mediante chunking, emitiendo texto tras decodificar cada fragmento.
- Salida en minúsculas y sin puntuación.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio de entrada más allá del propio ASR ni modo thinking.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Dictado local en escritorio: el runner `transcribe.py` permite transcribir un archivo WAV con un único comando tras instalar dependencias, sin enviar audio a ningún servicio externo; adecuado para entornos con requisitos de privacidad.
- Subtitulado preliminar de material en inglés: dado su WER del 3,41 % en LibriSpeech test-clean, puede generar borradores de transcripción para revisión humana en contenido de habla leída.
- Prototipado de asistentes de voz offline: el tamaño de 17,91 MB y la ejecución con onnxruntime facilitan su integración en aplicaciones de escritorio o dispositivos con recursos limitados donde no se dispone de GPU.
- Indexación y búsqueda de archivos de audio: la transcripción por chunks permite procesar grabaciones largas y generar texto indexable para motores de búsqueda locales.
- Evaluación comparativa de pipelines ASR: al publicar predicciones y referencias en `benchmarks/fleurs.jsonl` y `benchmarks/libri_clean.jsonl`, sirve como referencia reproducible para comparar otros sistemas ligeros con el mismo normalizador Whisper English.
- Investigación en ensembles CTC: la combinación de dos codificadores con cuantización mixta y un selector aprendido constituye un caso de estudio reproducible para experimentos de fusión de decodificadores.
- Transcripción en entornos sin conectividad: al funcionar íntegramente offline tras la instalación, es aplicable en escenarios de campo o sistemas air-gapped.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Test split | Grabaciones | Errores de palabra | Palabras de referencia | WER |
|---|---:|---:|---:|---:|
| FLEURS English (US), `en_us/test` | 647 | 1.452 | 14.557 | 9,97 % |
| LibriSpeech `test-clean` | 2.620 | 1.807 | 53.027 | 3,41 % |

El WER se calcula como la suma de sustituciones, deleciones e inserciones dividida entre el total de palabras de referencia normalizadas. El script de puntuación aplica el normalizador Whisper English con un mapa de ortografía vacío a referencias y predicciones. El checkpoint y el ajuste de ganancia se fijaron con grabaciones de desarrollo antes de la evaluación sobre los dos splits de test completos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está diseñado para ejecución en CPU mediante onnxruntime.
- GPU recomendadas: no aplica; el runner incluido es de CPU.
- Cabe en GPU consumer: sí, por tamaño (17,91 MB de archivo), aunque la ruta de ejecución documentada es CPU.
- Opciones de despliegue: onnxruntime a través del runner `transcribe.py` incluido en el repositorio; requiere Python 3.11 o superior. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El entorno Python y los tensores descomprimidos en tiempo de ejecución ocupan espacio adicional más allá de los 17,91 MB del archivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiny Dictation English | no disponible (archivo de 17,91 MB) | no disponible | 9,97 % FLEURS en_us; 3,41 % LibriSpeech test-clean | CC BY 4.0 | Hugging Face, ONNX |
| NVIDIA Citrinet-256 gamma 0.25 (base) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face (OpenVoiceOS ONNX) |
| NVIDIA Conformer-CTC Small (base) | no disponible en la información proporcionada | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face (nvidia) |

No se dispone de datos de benchmarks de los modelos base en la información proporcionada, por lo que no es posible una comparación cuantitativa directa de WER entre el ensemble y sus componentes.

## Limitaciones y advertencias

- Los tests cubren únicamente habla leída en inglés; la precisión en conversación, voces solapadas y ruido de micrófono no está medida.
- El runner publicado genera texto en minúsculas y sin puntuación.
- El resultado en FLEURS supera el 5 % de WER (9,97 %), lo que limita su uso en aplicaciones que exijan alta fidelidad sin revisión humana.
- El procesamiento de grabaciones largas es por chunks, con emisión de texto tras cada fragmento, sin contexto entre chunks.
- Solo soporta inglés; no hay capacidades multilingües.
- No se documentan sesgos específicos ni tasas de alucinación medidas; al ser un modelo CTC, el riesgo principal es de errores de sustitución, deleción e inserción más que de generación libre.
- La licencia CC BY 4.0 permite uso comercial con atribución; el archivo contiene los avisos de los componentes originales y debe conservarse la atribución a NVIDIA y OpenVoiceOS.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo se lista como 0.0 GB, lo que puede indicar que los archivos aún no están completamente subidos o indexados; conviene verificar la integridad del archivo antes de usarlo en producción.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hansda/tiny-dictation-en
- Modelo base Citrinet ONNX (OpenVoiceOS): https://huggingface.co/OpenVoiceOS/stt_en_citrinet_256_gamma_0_25_onnx/tree/3362d8d46028
- Modelo base Conformer-CTC Small (NVIDIA): https://huggingface.co/nvidia/stt_en_conformer_ctc_small
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset LibriSpeech: https://www.openslr.org/12
- Dataset LoquaciousSet: https://huggingface.co/datasets/speechbrain/LoquaciousSet
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
