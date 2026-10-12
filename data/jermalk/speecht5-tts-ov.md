# jermalk/speecht5-tts-ov

## Resumen

jermalk/speecht5-tts-ov es una conversión a formato OpenVINO IR del sistema de síntesis de voz Microsoft SpeechT5, compuesto por el modelo texto-a-espectrograma microsoft/speecht5_tts y el vocoder microsoft/speecht5_hifigan. No se trata de un modelo nuevo ni de un ajuste fino: el repositorio contiene únicamente la exportación de los pesos originales a OpenVINO IR en fp32, sin cuantización, junto con los ficheros de tokenizador generados para openvino-tokenizers. El autor es jermalk, responsable también del runtime RustedVINO, y todo el crédito del modelo subyacente corresponde a Microsoft (Ao et al., 2022).

El objetivo es práctico: ofrecer la voz inglesa más ligera del conjunto inicial de RustedVINO, pensada para ejecutarse en CPU y para ser consumida desde la clase `Text2SpeechPipeline` de OpenVINO GenAI o desde el servidor de RustedVINO mediante un endpoint compatible con la API de OpenAI (`/v1/audio/speech`). El repositorio ocupa 0,6 GB y la síntesis consume alrededor de 2,5 GB de RAM.

La salida es audio mono a 16 kHz y la calidad de voz es descrita por el propio autor como plana y algo robótica, adecuada para prototipos, pruebas de integración y aplicaciones donde prime el coste computacional sobre la naturalidad. Está licenciado bajo MIT, heredado de ambos modelos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechT5: transformer encoder-decoder preentrenado multimodal, con vocoder HiFi-GAN (microsoft/speecht5_hifigan) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de texto a voz; la entrada es texto y la salida es audio) |
| Tipos de cuantizacion | fp32 sin cuantizacion en este repositorio; no se distribuyen variantes int8 u otras |
| Idiomas soportados | ingles (en) |
| Licencia | MIT (heredada de microsoft/speecht5_tts y microsoft/speecht5_hifigan) |
| Formato de pesos | OpenVINO IR (XML + BIN) con tokenizador para openvino-tokenizers |

Datos adicionales de la ficha: tamano del repositorio 0,6 GB; frecuencia de muestreo de salida 16 kHz mono; pipeline declarado text-to-speech; descargas registradas 0; likes 1; creado y actualizado el 12 de octubre de 2026.

## Arquitectura y entrenamiento

La arquitectura es la del modelo SpeechT5 original: un transformer encoder-decoder de preentrenamiento unificado multimodal que comparte representaciones entre habla y texto. En esta conversión se emplea la variante texto-a-espectrograma (microsoft/speecht5_tts), que genera un espectrograma mel a partir del texto tokenizado, y se acopla a un vocoder HiFi-GAN (microsoft/speecht5_hifigan) que convierte ese espectrograma en forma de onda. El resultado se entrega como audio mono a 16 kHz.

No se ha realizado ningun entrenamiento ni ajuste fino en este repositorio. El proceso documentado por el autor es puramente de conversión: exportación con `optimum-cli export openvino --model microsoft/speecht5_tts --model-kwargs '{"vocoder": "microsoft/speecht5_hifigan"}' --weight-format fp32` y posterior conversión del tokenizador con `convert_tokenizer --with-detokenizer`. El entorno empleado fue Python 3.12 con optimum-intel 2.0.0, optimum 2.2.0, transformers 4.57.6, OpenVINO 2026.2.1 y openvino-tokenizers 2026.2.1.0.

Como innovaciones técnicas destacables, la única aportación del autor es el formato de despliegue: pesos en IR de OpenVINO y tokenizador convertido, lo que permite inferencia en CPU optimizada y su integración directa en el servidor RustedVINO. No se documentan mecanismos adicionales como decodificación especulativa ni atención lineal, y no hay información sobre el dataset de entrenamiento original ni sobre si hubo RLHF o DPO en la información disponible.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con salida WAV mono a 16 kHz.
- Generacion de audio lista para reproducir o almacenar, sin pasos intermedios de postprocesado documentados.
- Ejecucion sobre la clase `Text2SpeechPipeline` de OpenVINO GenAI.
- Integracion en el servidor RustedVINO mediante `rv add speecht5-tts-ov --kind tts` y consumo por HTTP con el endpoint `/v1/audio/speech` (compatible con el esquema de la API de OpenAI).
- Inferencia en CPU sin necesidad de GPU.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta razonamiento multi-paso, matemáticas, código ni visión: el modelo es exclusivamente de texto a voz.
- Capacidades multilingues: no. Solo ingles, segun los metadatos del repositorio.
- No se documenta en esta conversion el uso de embeddings de hablante (x-vectors) ni la seleccion de voces alternativas.

## Casos de uso

- Lectura automatica de articulos y documentos: el pipeline recibe texto y devuelve audio en un unico paso, con lo que se puede encadenar un extractor de contenido (RSS, PDF, correo) a la API `/v1/audio/speech` para generar versiones habladas de boletines o resumenes.
- Accesibilidad para personas con discapacidad visual: al funcionar en CPU y no requerir GPU, se puede empaquetar dentro de un lector de pantalla local que sintetice el texto seleccionado sin enviar datos a servicios en la nube.
- Asistentes de voz embebidos y dispositivos IoT: el modelo cabe en un equipo de gama consumer y consume unos 2,5 GB de RAM durante la sintesis, lo que permite integrarlo en un mini-PC o portatil que emita avisos hablados por altavoz.
- Sistemas de respuesta de voz interactiva simples: el endpoint HTTP compatible con la API de OpenAI facilita conectar una centralita o un bot telefonico que genere mensajes pregrabados de forma dinamica (horarios, estados de pedido, confirmaciones).
- Generacion de locuciones para prototipos y demos: al ser la voz mas ligera del conjunto inicial de RustedVINO, sirve para validar interfaces de usuario, flujos conversacionales y pruebas de integracion antes de invertir en una voz de mayor calidad.
- Pruebas automatizadas de pipelines de audio: se pueden generar muestr as de voz deterministas en CI para verificar codificacion, remuestreo, duracion y entrega de ficheros WAV sin depender de servicios externos.
- Generacion de datos sinteticos de audio para entrenar o evaluar otros sistemas (clasificadores de audio, VAD, diarizacion) en ingles.
- Notificaciones por voz en aplicaciones de escritorio o herramientas de linea de comandos, aprovechando que el modelo se ejecuta sin GPU y con una huella de disco de 0,6 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es una medida de velocidad en inferencia, no un benchmark de calidad:

| Medicion | Valor |
|---|---|
| Velocidad de sintesis (Intel Core Ultra 7, solo CPU) | ~0,76x tiempo real (una frase de 5 segundos tarda unos 4 segundos) |
| Memoria RAM durante la sintesis | ~2,5 GB |
| Tamano del repositorio | 0,6 GB |

No hay datos de MMLU, HumanEval, GSM8K ni de metricas de calidad de voz (MOS, MCD, WER) en la informacion proporcionada.

## Requisitos de hardware

- Inferencia en CPU: es el escenario medido. Un Intel Core Ultra 7 ejecuta la sintesis a ~0,76x tiempo real, con aproximadamente 2,5 GB de RAM en uso.
- VRAM: no aplica en el escenario documentado (CPU). No se proporcionan cifras de consumo de VRAM en GPU.
- GPU recomendadas: no disponible. OpenVINO admite aceleracion en iGPU Intel y GPUs Intel Arc, pero no se aportan mediciones para este modelo.
- Cabe en hardware consumer: si, en CPU. No se requiere GPU dedicada ni una RTX 4090, A100 o H100 para el caso de uso documentado.
- Espacio en disco: unos 0,6 GB para los pesos en fp32 mas los ficheros de tokenizador.
- Opciones de despliegue: OpenVINO GenAI (`Text2SpeechPipeline`), RustedVINO (descarga con `hf download`, alta con `rv add` y consumo por `/v1/audio/speech`) y runtime de OpenVINO. vLLM, llama.cpp, TGI y Ollama no son aplicables a este modelo, ya que no son motores de sintesis de voz.
- Latencia y throughput estimados: con la medicion disponible, aproximadamente 0,76 segundos de audio generado por segundo de computo en CPU, es decir, una frase de 5 segundos se sintetiza en torno a 4 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jermalk/speecht5-tts-ov | no disponible | no aplica (texto a voz) | ~0,76x tiempo real en CPU (Core Ultra 7) | MIT | OpenVINO IR (XML + BIN), 0,6 GB |
| microsoft/speecht5_tts | no disponible | no aplica (texto a voz) | no disponible | MIT | Pesos originales en formato transformers |
| microsoft/speecht5_hifigan | no disponible | no aplica (vocoder) | no disponible | MIT | Pesos originales en formato transformers |

La comparativa se limita a los dos modelos base citados en la ficha, porque la informacion disponible no incluye datos de otras alternativas de sintesis de voz (parametros, contexto, rendimiento o disponibilidad). La diferencia relevante frente a los originales de Microsoft es el formato de despliegue: la version de jermalk esta lista para OpenVINO y RustedVINO, mientras que los checkpoints originales requieren PyTorch y transformers.

## Limitaciones y advertencias

- Calidad de voz limitada: el propio autor la describe como plana y algo robotica, y la situa como la voz inglesa mas pequena del conjunto inicial de RustedVINO, no como una opcion de alta calidad.
- Idioma: solo ingles. No hay soporte multilingue declarado, por lo que el texto en otros idiomas producira una pronunciacion incorrecta o ininteligible.
- Formato de salida fijo: audio mono a 16 kHz. No se documentan otras frecuencias de muestreo ni salidas estereo.
- Cuantizacion: el repositorio solo contiene pesos fp32 sin cuantizar, por lo que no hay variantes int8 que reduzcan el consumo de RAM.
- Ausencia de validacion comunitaria: el repositorio registra 0 descargas y 1 like, de modo que la estabilidad y la calidad percibida en produccion no estan contrastadas por terceros.
- Origen del artefacto: no es un modelo entrenado ni ajustado por el autor, sino una conversion de formato. Cualquier problema de sesgo o de pronunciacion procede de los modelos originales de Microsoft y no esta caracterizado en esta ficha.
- Riesgo de alucinacion acustica: al ser un modelo de sintesis, los fallos se manifiestan como pronunciaciones incorrectas, silencios anomalos o audio ininteligible, especialmente con numeros, siglas, nombres propios y texto fuera de dominio. No se aportan tasas de error ni evaluaciones al respecto.
- Licencia MIT: permite uso comercial, pero conviene conservar la atribucion a Microsoft y al paper de SpeechT5, tal y como indica el autor.
- Huella de memoria: unos 2,5 GB de RAM durante la sintesis, lo que puede ser un limite en dispositivos muy restringidos de memoria.
- No apto para clonacion de voz ni seleccion de hablante: no se documenta en esta conversion el uso de embeddings de hablante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jermalk/speecht5-tts-ov
- Modelo base (texto a espectrograma): https://huggingface.co/microsoft/speecht5_tts
- Modelo base (vocoder HiFi-GAN): https://huggingface.co/microsoft/speecht5_hifigan
- Runtime RustedVINO: https://github.com/Jermalk/rustedvino-oe
- Paper de SpeechT5 (Ao et al., 2022): https://arxiv.org/abs/2110.07205
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- Optimum Intel: https://github.com/huggingface/optimum-intel
