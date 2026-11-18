# fbmacagba/bytestts-es-css10

## Resumen

BytesTTS voice es-css10 es un modelo de sintesis de voz (text-to-speech) en espanol para el motor BytesTTS, distribuido en formato ONNX. No es un modelo entrenado desde cero: es la conversion de los pesos de Coqui TTS `tts_models/es/css10/vits` (una voz VITS de un solo hablante) a ONNX, realizada por el usuario fbmacagba. El modelo original fue contribuido por Neongecko.com Inc. y entrenado sobre el corpus CSS10 Spanish.

La relevancia practica del modelo esta en su formato: al ser ONNX puro, se puede ejecutar sin la pila de Coqui TTS ni dependencias de espeak-ng, ya que la voz opera a nivel de caracteres en lugar de fonemas. Con un unico fichero `model.onnx` de unos 70,9 MB y una frecuencia de muestreo de 22.050 Hz en mono, es un candidato ligero para sintesis de voz embebida o en servidor sin GPU.

La arquitectura subyacente es VITS (Conditional Variational Autoencoder with Adversarial Learning for End-to-End Text-to-Speech, Kim et al., 2021), un modelo generativo end-to-end que combina un encoder de texto, un prior variacional, un decoder basado en flujo normalizador y un discriminador adversarial durante el entrenamiento. El resultado es una voz femenina de un solo hablante, identificada como `tux`, derivada de audiolibros de LibriVox.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con VAE condicional, flujo normalizador y decoder HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS a nivel de caracter, sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX en precision original) |
| Idiomas soportados | espanol (es) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (`model.onnx`, 70.926.577 bytes) + `config.json`, `speakers.json`, `voice.json` |

## Arquitectura y entrenamiento

El modelo es una voz VITS de Coqui TTS entrenada sobre CSS10 Spanish, un corpus de un solo hablante compuesto por audiolibros de LibriVox leidos por Tux, en dominio publico y con licencia CC0-1.0 (Park y Mulc, Interspeech 2019). VITS combina un encoder de texto, un prior variacional condicionado por duraciones, un flujo normalizador que transforma el prior en la distribucion posterior y un decoder generativo tipo HiFi-GAN, todo entrenado de forma adversarial. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplica en TTS).

La innovacion tecnica de esta distribucion concreta no esta en el entrenamiento, sino en la conversion: el checkpoint original de Coqui TTS (`tts_models--es--css10--vits.zip`, SHA-256 `3b15b180...`) se abrio en un sandbox aislado sin red, tras un escaneo de pickle, con `torch.load(weights_only=True)`. Cada peso se verifico contra el port en PyTorch de VITS de BytesTTS y se exporto a ONNX desde safetensors. El autor reporta que el port coincide con la salida de Coqui TTS con duraciones identicas y una relacion senal-error de al menos 60 dB, y que este ONNX coincide con el port con duraciones identicas y al menos 50 dB. La voz opera a nivel de caracteres, prescindiendo de espeak-ng.

## Capacidades

- Sintesis de voz en espanol para un unico hablante (`tux`, valor por defecto).
- Generacion de audio a 22.050 Hz en mono.
- Procesamiento a nivel de caracter, sin necesidad de espeak-ng ni fonemizador externo.
- Verificacion de integridad SHA-256 de todos los ficheros contra `voice.json` al cargar.
- Carga desde directorio local mediante `BytesTTS.load_path(directory)`.
- Integracion via CLI (`bytestts say ... --voice es-css10 -o out.wav`) y via API Python (`BytesTTS.load("es-css10")`).
- No soporta lectura de digitos: el alfabeto no los incluye y se omiten; los numeros deben escribirse como palabras.
- Las apostrofes tipograficas (’) se leen como `'`.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.

## Casos de uso

- **Locucion automatizada de articulos y noticias**: dado que el modelo lee caracteres y no fonemas, se puede integrar en un pipeline de publicacion que convierta texto a audio sin dependencias del sistema (espeak-ng). Requiere preprocesar numeros y simbolos a palabras antes de la sintesis.
- **Sistemas de accesibilidad en aplicaciones web o moviles**: el fichero ONNX de 70,9 MB y la ausencia de GPU obligatoria permiten empaquetar la voz en un cliente ligero para lectura de contenido en espanol.
- **Asistentes de voz embebidos en dispositivos sin conectividad**: al ser un modelo ONNX autocontenido y verificado por SHA-256, encaja en entornos con recursos limitados donde no se quiere depender de servicios en la nube.
- **Generacion de audiolibros o podcast a partir de texto**: la voz deriva de audiolibros de LibriVox, por lo que el timbre resulta adecuado para narracion larga; conviene trocear el texto y concatenar los WAV resultantes.
- **Prototipado rapido de interfaces conversacionales en espanol**: la API de BytesTTS (`tts.synthesize(...).save(...)`) permite generar muestras en pocas lineas para validar flujos de UX antes de invertir en una voz comercial.
- **Testing de pipelines de audio**: al ser determinista en duraciones y verificado contra Coqui TTS, sirve como referencia en pruebas de regresion de sistemas TTS o de postprocesado de audio.
- **Generacion de avisos y mensajes pregrabados en aplicaciones**: util para mensajes cortos institucionales o de accesibilidad, siempre que se redacten los numeros como palabras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta metricas de fidelidad de la conversion: relacion senal-error de al menos 60 dB entre el port de BytesTTS y Coqui TTS, y de al menos 50 dB entre este ONNX y el port, con duraciones identicas en ambos casos.

## Requisitos de hardware

- **VRAM estimada**: no disponible; al ser un modelo ONNX de 70,9 MB, la inferencia puede ejecutarse en CPU sin GPU dedicada.
- **GPU recomendadas**: no se especifican; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es sobradamente suficiente si se opta por ejecucion en GPU via ONNX Runtime.
- **Cabe en GPU consumer**: si, con amplio margen, dado el tamano del fichero.
- **Opciones de despliegue**: BytesTTS (CLI y API Python), ONNX Runtime directamente, o cualquier runtime compatible con ONNX. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BytesTTS es-css10 (este) | no disponible (ONNX de 70,9 MB) | no aplica | no disponible | BSD-3-Clause | Hugging Face, ONNX |
| Coqui TTS `tts_models/es/css10/vits` | no disponible | no aplica | referencia de fidelidad (>=60 dB frente al port) | BSD-3-Clause | Coqui TTS release `v0.8.0_models` |
| neongeckocom/tts-vits-css10-es | no disponible | no aplica | no disponible | BSD-3-Clause | Hugging Face |

La comparativa se limita a las variantes de la misma voz VITS CSS10, ya que no se dispone de datos de otros modelos TTS en espanol en la informacion proporcionada.

## Limitaciones y advertencias

- **Sin lectura de digitos**: el alfabeto del modelo no incluye numeros, por lo que se omiten en la sintesis. Es imprescindible normalizar cifras a palabras antes de inferir.
- **Un solo hablante**: la voz solo reproduce el timbre de `tux`; no hay control de emocion, estilo ni velocidad mas alla de lo que permita el motor.
- **Idioma unico**: solo espanol; no soporta cambio de idioma ni mezcla de lenguas.
- **Riesgo de uso indebido**: el autor advierte explicitamente de no usar la voz para enganar a personas. Al ser una voz sintetica derivada de un hablante real, existe riesgo de suplantacion.
- **Sesgos**: no se documentan sesgos especificos, pero al entrenarse sobre audiolibros de dominio publico, el registro y el estilo pueden estar sesgados hacia el espanol neutro de narracion literaria.
- **Alucinacion**: no aplica en el sentido de generacion de texto, pero si puede producir pronunciaciones incorrectas en palabras fuera del dominio del corpus CSS10.
- **Licencia**: BSD-3-Clause permite uso comercial con condiciones (retener copyright, lista de condiciones y disclaimer; no usar nombres de titulares para promocionar productos derivados). Es obligatorio mantener la atribucion indicada por el autor en la model card.
- **Atribucion requerida**: debe conservarse el texto de atribucion a Coqui TTS, Neongecko.com Inc., CSS10 (Kyubyong Park y Thomas Mulc) y LibriVox (lector Tux) al usar o redistribuir la voz.
- **Fidelidad de la conversion**: aunque el autor reporta >=50 dB frente al port y duraciones identicas, no se aportan pruebas perceptuales (MOS) ni evaluaciones subjetivas.
- **Sin soporte de prosodia avanzada**: no se documentan SSML, control de pitch, pausas ni etiquetas de estilo.

## Enlaces

- Hugging Face: https://huggingface.co/fbmacagba/bytestts-es-css10
- Repositorio BytesTTS: https://github.com/jared0565/bytesTTS
- Paper VITS: https://arxiv.org/abs/2106.06103
- Voz original en Coqui TTS: `tts_models/es/css10/vits` (release `v0.8.0_models`)
- Repositorio de Neongecko: https://huggingface.co/neongeckocom/tts-vits-css10-es
- Dataset CSS10 Spanish: https://www.kaggle.com/datasets/bryanpark/spanish-single-speaker-speech-dataset
- Paper CSS10: Park, K. y Mulc, T. (2019), "CSS10: A Collection of Single Speaker Speech Datasets for 10 Languages", Interspeech.
