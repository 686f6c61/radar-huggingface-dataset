# loom-ai-org/citrinet-256-ls-loom

## Resumen

Citrinet-256 LibriSpeech es un modelo de reconocimiento automático del habla (ASR) en inglés basado en la arquitectura Citrinet de NVIDIA NeMo, con 9.758.306 parámetros y entrenado sobre LibriSpeech. Esta ficha describe la exportación publicada por loom-ai-org, que convierte el modelo original `nvidia/stt_en_citrinet_256_ls` al formato GGUF propio de loom.cpp, un único fichero autodescriptivo que incluye las topologías del grafo, el tokenizer y el script de control necesarios para ejecutarlo.

El modelo resuelve transcripción de audio mono a 16 kHz a texto mediante decodificación CTC (no autoregresiva), lo que elimina la latencia de generación token a token y permite ejecutarlo en hardware muy limitado: el autor documenta inferencia funcional en una Raspberry Pi Zero. Se distribuye en dos precisiones, F32 (40 MB) y Q8_0 (13 MB), con licencia CC-BY-4.0 heredada del modelo base.

Su relevancia práctica es la de un componente ASR de bajo coste y huella mínima para inglés: la cuantización Q8_0 mantiene el mismo WER que F32 (9,39 %) sobre el conjunto de 73 clips de prueba reportado, con un 70/73 de transcripciones idénticas a nivel de token. No es un modelo conversacional ni multilingüe: solo transcribe inglés y no incorpora puntuación ni mayúsculas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Citrinet (convolucional, CTC, no autoregresiva), familia NVIDIA NeMo |
| Parametros totales | 9.758.306 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo CTC; el pipeline aplica ventanas de audio internamente, sin cifra publicada) |
| Tipos de cuantizacion | F32 y Q8_0 |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | CC-BY-4.0 (heredada del modelo base) |
| Formato de pesos | GGUF (formato de loom.cpp; el modelo original de NeMo se exporta con loom-exporter) |

## Arquitectura y entrenamiento

Citrinet es una red convolucional (no transformer) con decodificación CTC y tokenizacion WordPiece (el tokenizer `wpe` de NeMo). El modelo base fue entrenado por NVIDIA sobre LibriSpeech, un corpus de audiolibros en inglés, y esta exportación conserva sin modificar los mismos parámetros: el fichero F32 es token por token idéntico a la salida CTC de NeMo en los 73 clips de prueba indicados por el autor. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo CTC de ASR).

La innovación técnica de esta distribución no está en el modelo, sino en el formato: loom.cpp empaqueta en un solo GGUF el grafo, el tokenizer y el driver de inferencia, de modo que el modelo es autodescriptivo y no requiere código específico por arquitectura. La exportación cuantizada empaqueta únicamente los pesos de convolución y proyección (`loom-export --quantize <tipo>`). El fichero usa el operador `STFT` del motor, introducido en loom-py-rt 1.0.0rc18, y el decodificado del vocabulario WordPiece está soportado desde rc17.

## Capacidades

- Reconocimiento automático del habla en inglés: transcripción de audio mono float a 16 kHz a texto plano mediante CTC.
- Decodificación no autoregresiva: una sola pasada, sin generación secuencial de tokens.
- Salida en minúsculas y sin puntuación, acorde con el tokenizer WordPiece del modelo original.
- Inferencia en CPU y en dispositivos de muy baja potencia (validado en Raspberry Pi Zero).
- Dos precisiones intercambiables (F32 y Q8_0) con el mismo grafo y driver.
- API de alto nivel `model.speech2text.infer(audio)` y acceso de bajo nivel `model.infer(...)` para argumentos del driver.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: solo inglés, y no acepta el argumento `language=` (se ignora con aviso).
- No dispone de modo thinking, visión ni audio de salida.

## Casos de uso

- Transcripción de audiolibros y contenido leído en voz alta: es el dominio exacto de LibriSpeech (lectura de libros), donde el modelo presenta su menor tasa de error; encaja en la digitalizacion de archivos de audio narrados en ingles.
- Subtitulado offline en dispositivos embebidos: con 13 MB en Q8_0 y 71 MB de memoria pico en Raspberry Pi Zero, se puede integrar en un pipeline local de generacion de subtitulos sin conexion ni GPU.
- Notas de voz y dictado en inglés en aplicaciones de escritorio: la ventana de audio se procesa en una sola pasada CTC, sin la latencia de un decodificador autoregresivo, adecuado para interfaces de dictado con respuesta casi inmediata en hardware modesto.
- Preprocesado de corpus de investigación: transcripcion masiva de grabaciones en ingles para construir datasets de texto, aprovechando que el coste por hora de audio es muy bajo al no requerir GPU.
- Comandos de voz y activación por palabra en inglés: al ser un modelo de 10 M de parametros, puede ejecutarse de forma continua en el mismo dispositivo que captura el audio, sin enviar datos a la nube.
- Evaluación y línea base de ASR: sirve como referencia reproducible (WER 9,39 % en 73 clips) para comparar motores de inferencia, estrategias de cuantización o pipelines de audio en un entorno controlado.
- Pruebas de integración de loom.cpp: al ser un GGUF autodescriptivo con driver embebido, es un caso de prueba pequeño y rápido para validar el runtime y el exportador en CI.
- Transcripción con requisitos de privacidad: al ejecutarse íntegramente en local, el audio no abandona el dispositivo, lo que facilita el cumplimiento en entornos con datos sensibles.

## Benchmarks y rendimiento

Datos publicados por el autor de la exportación sobre 73 clips de prueba. No se dispone de resultados en MMLU, HumanEval, GSM8K ni otros benchmarks de texto, por no ser aplicables a un modelo ASR.

| Metrica | F32 | Q8_0 |
|---|---|---|
| Word error rate (73 clips) | 9,39 % | 9,39 % |
| Transcripciones identicas a token con la salida CTC de NeMo | 73/73 | No disponible |
| Transcripciones identicas a token respecto a F32 | Referencia | 70/73 |
| Latencia en Raspberry Pi Zero (jfk.wav, 11 s de audio) | 64 s | 37 s (aprox. 1,7x mas rapido) |
| Memoria pico en Raspberry Pi Zero | 96 MB | 71 MB |
| Tamano del fichero | 40 MB | 13 MB |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier precision; el modelo puede ejecutarse en CPU sin GPU.
- Memoria: 96 MB de pico en F32 y 71 MB en Q8_0 medidos en Raspberry Pi Zero; en equipos de escritorio la cifra real depende del runtime y del búfer de audio.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) excede ampliamente las necesidades; el cuello de botella sería el preprocesado STFT y la transferencia de audio, no el modelo.
- Cabe en cualquier GPU consumer e integrada, y en placas SBC tipo Raspberry Pi Zero.
- Opciones de despliegue: `loom-py-rt` (paquete de PyPI, con extra `[hub]`), que requiere la version 1.0.0rc18 o superior por el operador `STFT`; el decodificado del tokenizer WordPiece necesita rc17 o superior. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Throughput y latencia: en Raspberry Pi Zero, 11 s de audio en 37 s (Q8_0), es decir, aproximadamente 0,3x tiempo real en ese hardware; no se publican cifras para CPU de escritorio ni GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| citrinet-256-ls-loom (esta ficha) | 9.758.306 | Audio 16 kHz, ventanas internas no documentadas | WER 9,39 % en 73 clips; salida identica a NeMo en F32 | CC-BY-4.0 | GGUF para loom.cpp; 59 descargas en HuggingFace |
| nvidia/stt_en_citrinet_256_ls (modelo base) | No disponible en la informacion proporcionada | No disponible | Referencia de la que deriva la exportacion (F32 identico token a token) | No disponible en la informacion proporcionada | Formato NeMo original |
| citrinet-1024-loom (mencionado por el autor) | No disponible | No disponible | Segun el autor, menos errores en habla conversacional, con acento o con ruido por haber sido entrenado con mas datos | No disponible | GGUF para loom.cpp |

No se han identificado en la busqueda web modelos comparables adicionales; los resultados obtenidos corresponden a servicios y marcas homonimas sin relacion con el modelo.

## Limitaciones y advertencias

- Entrenado exclusivamente con LibriSpeech: el dominio es lectura de audiolibros en inglés. Cabe esperar más errores en habla conversacional, con acento o con ruido que en un modelo entrenado con más datos, como el citrinet-1024 del mismo autor.
- La transcripción sale en minúsculas y sin puntuación; cualquier salida legible requiere un postprocesado de capitalización y puntuación.
- El tokenizer separa el apóstrofo de la palabra (`frederick ' s`), lo que afecta a la limpieza posterior del texto y a las métricas de evaluación.
- Solo inglés: no acepta el argumento `language=` (se emite un aviso y se ignora), por lo que no sirve para audio multilingüe ni para otros idiomas.
- Dependencia estricta del runtime: el fichero usa el operador `STFT` y exige loom-py-rt 1.0.0rc18 o superior; versiones anteriores fallan con `unknown op 'STFT'`. El decodificado WordPiece requiere rc17 o superior.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir la autoría (NVIDIA como modelo base y loom-ai-org como exportación) y a indicar cambios, si los hay.
- Riesgo de alucinación y de transcripciones plausibles pero incorrectas: al ser CTC con vocabulario cerrado no genera texto libre, pero puede producir palabras del vocabulario que no corresponden al audio en segmentos ruidosos o silencios.
- Validación comunitaria muy baja: 59 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción a escala.
- No se documentan sesgos especificos ni evaluaciones de robustez por acento o género en la informacion disponible; la composición de LibriSpeech condiciona el comportamiento esperado.
- No se documentan cifras de rendimiento en GPU ni de latencia en CPU de escritorio, por lo que las estimaciones de producción deben medirse en el hardware objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/citrinet-256-ls-loom
- Modelo base: https://huggingface.co/nvidia/stt_en_citrinet_256_ls
- Repositorio del motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- API de Python loom-py: https://github.com/loom-ai-org/loom-py
- Paquete en PyPI: `loom-py-rt` (con extra `[hub]`)
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada; la busqueda web no devolvio resultados relacionados con este modelo.
