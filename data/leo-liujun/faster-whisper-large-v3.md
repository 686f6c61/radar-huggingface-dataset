# leo-liujun/faster-whisper-large-v3

## Resumen

faster-whisper-large-v3 es la conversion del modelo de reconocimiento automatico del habla (ASR) openai/whisper-large-v3 al formato de CTranslate2, publicada por el usuario leo-liujun. Se trata de un repositorio de redistribucion, no de un modelo entrenado desde cero: los pesos son identicos a los de Whisper large-v3 de OpenAI, pero reempaquetados para su uso con CTranslate2 y librerias derivadas como faster-whisper. El objetivo es ofrecer inferencia mas rapida y con menor huella de memoria que la implementacion original en PyTorch, manteniendo la calidad de transcripcion.

Whisper large-v3 es un transformer encoder-decoder de unos 1.550 millones de parametros, entrenado sobre 680.000 horas de audio etiquetado y 5 millones de horas pseudoetiquetadas, con capacidad de transcripcion multilingue y traduccion al ingles. Esta conversion concreta se distribuye en FP16 y ocupa 3,1 GB en el repositorio, lo que la hace desplegable en GPU de consumo medio y ejecutable en CPU con cuantizacion entera.

Es relevante porque faster-whisper se ha convertido en el estandar de facto para desplegar Whisper en produccion (subtitulado, transcripcion de reuniones, asistentes de voz), y CTranslate2 permite reducir el uso de VRAM y aumentar el throughput entre 2x y 4x respecto al pipeline original de transformers. No obstante, al ser un repositorio con 0 descargas y 0 likes en el momento de la consulta, conviene verificar la integridad de los pesos o usar la conversion canonica de Systran.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | Aproximadamente 1.550 millones (1,55B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica contexto textual; ventana de audio de 30 segundos por segmento |
| Tipos de cuantizacion | FP16 por defecto en el repo; CTranslate2 permite float32, int8, int8_float16, int8_float32 |
| Idiomas soportados | 99 idiomas, entre ellos es, en, zh, de, fr, pt, it, ru, ja, ko, ar, hi, nl, sv, pl, tr, ca, etc. |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (model.bin en FP16) mas tokenizer.json y preprocessor_config.json |
| Tamano del repositorio | 3,1 GB |
| Libreria | ctranslate2 |
| Autoria de la conversion | leo-liujun (redistribucion de openai/whisper-large-v3) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un encoder-decoder transformer con atencion completa, entrada de espectrograma mel de 128 canales y decodificacion autoregresiva de tokens de texto con marcas de tiempo. El modelo procesa audio en ventanas de 30 segundos; los audios mas largos requieren segmentacion y solapamiento externo (el pipeline de faster-whisper lo gestiona automaticamente). No es un modelo MoE ni un SSM: es un transformer denso convencional.

Los pesos provienen del entrenamiento original de OpenAI, que combino 680.000 horas de audio supervisado con 5 millones de horas de audio pseudoetiquetado, con tecnicas de aumento de datos y un esquema de decodificacion multilingue y multitarea. Esta conversion no introduce entrenamiento adicional, RLHF ni DPO: es exclusivamente un cambio de formato. La unica transformacion aplicada es la conversion mediante `ct2-transformers-converter` con `--quantization float16` y la copia de `tokenizer.json` y `preprocessor_config.json`. Las innovaciones destacables son las de CTranslate2 (cuantizacion, kernels optimizados, ejecucion en CPU y GPU) y las de faster-whisper (batching, VAD opcional, decodificacion eficiente), no del modelo en si.

## Capacidades

- Transcripcion de voz a texto multilingue en 99 idiomas, con deteccion automatica del idioma de entrada.
- Traduccion directa de audio en idiomas distintos del ingles al ingles.
- Generacion de marcas de tiempo a nivel de segmento y de palabra (esta ultima requiere configuracion adicional y un modelo de alineacion).
- Robustez ante ruido de fondo, musica, acentos y terminologia tecnica, heredada del entrenamiento a gran escala de Whisper.
- Salida de texto plano sin puntuacion perfecta garantizada; el modelo genera puntuacion y mayusculas de forma implicita.
- No soporta tool calling ni function calling; no es un modelo de agentes ni de razonamiento multi-paso.
- No tiene modo de pensamiento (thinking), vision, audio comprensivo ni capacidades multimodales mas alla del ASR y la traduccion al ingles.
- Funciona sobre segmentos de audio; no mantiene estado conversacional entre llamadas.

## Casos de uso

- Subtitulado automatico de video: el modelo genera transcripciones con marcas de tiempo que se pueden exportar a SRT o VTT; su soporte de 99 idiomas permite subtitular contenido internacional sin cambiar de modelo.
- Transcripcion de reuniones y notas de voz: con faster-whisper y VAD se pueden procesar audios largos dividiendolos en segmentos de 30 segundos y reconstruyendo la salida, con una huella de VRAM reducida gracias a CTranslate2.
- Asistentes de voz y comandos por voz: la baja latencia en GPU permite integrar transcripcion en tiempo real en aplicaciones de dictado o control por voz.
- Indexacion y busqueda de archivos de audio: convertir grandes volumenes de podcasts, llamadas o clases grabadas a texto para alimentar motores de busqueda o sistemas RAG.
- Traduccion de contenido audiovisual al ingles: uso de la tarea de traduccion para generar subtitulos en ingles a partir de audio en otros idiomas.
- Accesibilidad para personas con discapacidad auditiva: generacion de transcripciones en directo o diferido en entornos educativos y de conferencias.
- Analisis de calidad y cumplimiento en centros de llamadas: transcripcion masiva en CPU con cuantizacion int8 para auditar conversaciones sin depender de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a documentar el comando de conversion y un ejemplo de uso; no incluye tablas de WER, MMLU, HumanEval ni metricas equivalentes. Cualquier cifra de WER para Whisper large-v3 deberia consultarse en la model card original de OpenAI o en la documentacion de faster-whisper.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4-5 GB en FP16 (pesos de 3,1 GB mas activaciones y cache), y alrededor de 2-3 GB con cuantizacion int8_float16.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 4090, A100 o H100. En A100 y H100 el throughput es mayor por el ancho de banda de memoria.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de gama media como RTX 3060 o superiores; tambien se puede ejecutar solo en CPU con cuantizacion int8 (uso de RAM en torno a 1,5-2 GB).
- Opciones de despliegue: faster-whisper (recomendado), CTranslate2 directo, WhisperX, y servidores propios basados en CTranslate2. No es compatible con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponible en la informacion proporcionada; dependen del hardware, la cuantizacion y el uso de batching.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| faster-whisper-large-v3 (esta conversion) | ~1,55B | 99 | CTranslate2 FP16 | MIT | Conversion no oficial de leo-liujun; 0 descargas |
| openai/whisper-large-v3 | ~1,55B | 99 | PyTorch safetensors | MIT | Modelo original; requiere transformers para inferencia |
| whisper-medium | ~769M | 99 | PyTorch, CTranslate2, GGML | MIT | Menor precision, menor consumo de VRAM |
| distil-whisper-large-v3 | ~756M | Ingles principalmente | PyTorch, CTranslate2 | MIT | Version destilada; mucho mas rapida, menor WER solo en ingles |

Los datos de parametros de whisper-medium y distil-whisper-large-v3 son valores de referencia publicos; no se han verificado contra la informacion del repositorio consultado. Para comparaciones de WER entre estos modelos, consultar las model cards oficiales correspondientes.

## Limitaciones y advertencias

- Repositorio no oficial: se trata de una redistribucion subida por un tercero con 0 descargas y 0 likes. Para produccion se recomienda usar `systran/faster-whisper-large-v3`, la conversion mantenida por el equipo de faster-whisper, o generar la conversion uno mismo con `ct2-transformers-converter`.
- Alucinacion en audio problematico: Whisper puede inventar texto en silencios, ruido o musica, y repetir frases en bucles. El uso de VAD y ajustes de `condition_on_previous_text` mitiga parte del problema.
- Variabilidad por idioma: el WER es notablemente peor en idiomas con pocos recursos que en ingles; la calidad en espanol es buena pero no equiparable al ingles.
- Sin diarizacion de hablantes: el modelo no identifica quien habla; se necesita un componente externo (por ejemplo, pyannote) para ello.
- Sin contexto conversacional: no mantiene estado; cada llamada es independiente y procesa ventanas de 30 segundos.
- Marcas de tiempo de palabra no fiables de serie: requieren un modelo de alineacion adicional o heuristicas.
- Licencia MIT: permite uso comercial, pero al derivar de Whisper conviene revisar los terminos del modelo original de OpenAI.
- Riesgo de datos incorrectos: al no haber benchmarks publicados en esta ficha, no se puede confirmar que los pesos del repositorio coincidan exactamente con los originales sin verificacion manual.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/leo-liujun/faster-whisper-large-v3
- Modelo original: https://huggingface.co/openai/whisper-large-v3
- Conversion canonica de referencia: https://huggingface.co/systran/faster-whisper-large-v3
- Proyecto faster-whisper: https://github.com/SYSTRAN/faster-whisper
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Documentacion de cuantizacion de CTranslate2: https://opennmt.net/CTranslate2/quantization.html
