# klein-ml/Klein-TTS-X1.5-Flash-Lite

## Resumen

Klein-TTS-X1.5-Flash-Lite es un modelo de síntesis de voz (text-to-speech) desarrollado por klein-ml. Es el miembro más pequeno de la familia Klein-TTS X1.5: un generador de 400.856 parametros (0,40M) que convierte fonemas en audio mono a 24 kHz en ingles americano, frances e italiano, con tres voces disponibles (Sarah, Camille y Giulia). Los pesos ocupan 1,6 MB en float32, lo que lo situa en la categoria de modelos pensados para inferencia en dispositivo (on-device) y en CPU.

El modelo sigue la estirpe arquitectonica de StyleTTS 2 / ISTFTNet, escalada a la baja: un encoder de texto con pesos compartidos que predice duraciones, cabezas de tono (F0) y energia a nivel de trama, y un decodificador AdaIN con fuente armonica y salida iSTFT. Se entreno por destilacion sobre voz sintetica, con perdida GAN y perdida de caracteristicas WavLM, sobre texto web de FineWeb (ingles) y FineWeb-2 (frances e italiano).

Su relevancia practica esta en la relacion calidad/tamano: con solo 0,40M de parametros reporta 4,28 UTMOS y un 2,86% de WER (Whisper small) sobre 300 frases web no vistas, y un factor de tiempo real de 0,0066 en CPU (unas 150 veces mas rapido que tiempo real). La licencia es Apache-2.0, lo que facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 / ISTFTNet: encoder de texto transformer con pesos compartidos, predictor de duracion, cabezas de F0 y energia, decodificador AdaIN con fuente armonica y cabeza iSTFT |
| Parametros totales | 400.856 (0,40M), de los cuales aproximadamente 245K en el decodificador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; entrada en unidades de 1 a 3 frases) |
| Tipos de cuantizacion | no disponible (pesos en float32 y exportacion ONNX para CPU) |
| Idiomas soportados | Ingles americano (en-us), frances (fr), italiano (it) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, PyTorch (custom_code) y ONNX |

Otros datos tecnicos: salida de audio 24 kHz mono, 300 muestras (12,5 ms) por trama del modelo; vocabulario de 178 simbolos IPA; encoder de texto con 1 bloque transformer aplicado 4 veces (d=48, 4 cabezas, FFN 128, RoPE) mas 3 capas convolucionales; predictor de duracion con 1 bloque transformer condicionado por estilo (suma de 50 puertas sigmoideas dividida por la velocidad); decodificador con bloques residuales AdaIN de 56 canales y sobremuestreo 10x y 6x; checkpoint final en el paso 150.000.

## Arquitectura y entrenamiento

La arquitectura es un generador TTS del tipo StyleTTS 2 / ISTFTNet reducido. El encoder de texto es un unico bloque transformer con pesos compartidos aplicado cuatro veces (dimension 48, 4 cabezas, FFN de 128, RoPE) seguido de tres capas convolucionales. Sobre esa representacion, un predictor de duracion condicionado por estilo calcula la longitud de cada fonema mediante 50 puertas sigmoideas divididas por el valor de velocidad, y cabezas a nivel de trama predicen F0 y log-energia. El decodificador usa bloques residuales AdaIN de 56 canales con una fuente armonica mas ruido, sobremuestreo de 10x y 6x, y una cabeza iSTFT que genera la forma de onda a 24 kHz.

El entrenamiento se hizo por destilacion sobre voz sintetica de las tres voces de la release, a velocidades de habla de 0,9, 1,0 y 1,1, con texto web de FineWeb (ingles) y FineWeb-2 (frances e italiano) en unidades de una a tres frases. La funcion de perdida combina L1 sobre log-mel, STFT multirresolucion, LSGAN con feature matching (discriminadores multiperiodo y multirresolucion introducidos en el paso 10.000), feature matching con WavLM, L1 de duracion, tono y energia, y un termino de silencio. Se optimizo con AdamW, tasa de aprendizaje 4e-4 con decaimiento coseno, precision bf16 y 150.000 pasos. El front-end de texto usa misaki para ingles y espeak-ng para frances e italiano; el checkpoint incluye un front-end compacto propio para Transformers que evita spaCy.

## Capacidades

- Sintesis de voz a partir de texto en ingles americano, frances e italiano, con salida mono a 24 kHz.
- Tres voces integradas: Sarah (ingles), Camille (frances) y Giulia (italiano), seleccionables por nombre y consultables por idioma (`model.voices("en-us")`).
- Control de velocidad de habla mediante un parametro que divide las duraciones predichas; el rango entrenado es 0,9 a 1,1.
- Conversion de texto a fonemas IPA con vocabulario de 178 simbolos; front-end completo (misaki + spaCy) en el paquete `kleintts` y front-end compacto integrado en la ruta Transformers.
- Modelado de prosodia a nivel de trama (F0 y energia condicionados por voz) y control de silencios.
- Inferencia en CPU con factor de tiempo real de 0,0066 (unas 150 veces mas rapido que tiempo real).
- Exportacion ONNX para Node.js mediante el paquete `@kleinml/kleintts`.
- No soporta tool calling, agentes, vision, audio de entrada ni modo de razonamiento; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de articulos y contenido web en el navegador: el modelo puede sintetizar parrafos de una a tres frases con latencia muy baja en CPU, lo que permite reproducir texto a demanda sin servidor GPU ni coste por token.
- Asistentes de voz en dispositivos empotrados: con 1,6 MB de pesos en float32 y salida ONNX, cabe en entornos con memoria limitada (Raspberry Pi, moviles, navegador) y ofrece tres idiomas europeos con una sola descarga.
- Accesibilidad para personas con discapacidad visual: lectura de interfaces, notificaciones y documentos en ingles, frances e italiano con velocidad ajustable entre 0,9 y 1,1 para adaptarse al usuario.
- Generacion de avisos y locuciones en aplicaciones moviles: el paquete Node.js con ONNX permite integrar la sintesis en el backend o en el cliente sin depender de servicios de terceros, con licencia Apache-2.0 para uso comercial.
- Prototipado rapido de productos de voz: al ser el modelo mas pequeno de la familia X1.5, sirve para validar pipelines de texto a fonema, duraciones y prosodia antes de escalar a los modelos Flash o Pro con la misma API.
- Sistemas de anuncios en transporte o comercio: locuciones cortas y repetitivas (paradas, turnos, precios) en varios idiomas, donde el bajo coste computacional y la velocidad en CPU son determinantes.
- Generacion de audiolibros o podcasts de bajo coste con las tres voces disponibles, para contenido no critico donde prima el throughput sobre la naturalidad maxima.

## Benchmarks y rendimiento

Datos reportados por el autor sobre 300 frases web no vistas:

| Metrica | Klein-TTS-X1.5-Flash-Lite | Kitten TTS Nano 0.8 (14M) | SupraTTS 1.0 Preview (1,0M) | Piper (lessac medium, 15,7M) |
|---|---|---|---|---|
| Parametros | 0,40M | 14M | 1,0M | 15,7M |
| UTMOS | 4,28 | inferior (no se detalla) | inferior (no se detalla) | no disponible |
| SCOREQ | 4,32 | no disponible | no disponible | no disponible |
| WER (Whisper small) | 2,86% | no disponible | no disponible | no disponible |
| Factor de tiempo real (CPU) | 0,0066 | no disponible | no disponible | no disponible |

El autor indica que el modelo supera a Kitten TTS Nano 0.8 y a SupraTTS 1.0 Preview en UTMOS, y que esta a la par de Piper (lessac medium) en el TTS Index. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; los pesos ocupan 1,6 MB en float32, por lo que el modelo cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU. Funciona en CPU con un factor de tiempo real de 0,0066; cualquier GPU (RTX 4090, A100, H100) aceleraria aun mas la inferencia, pero no es necesaria.
- Cabe en GPU consumer: si, en todas; tambien en dispositivos sin GPU dedicada.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, paquete `kleintts` (con front-end misaki + spaCy), CLI `kleintts`, y ONNX en CPU mediante el paquete Node.js `@kleinml/kleintts`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: unas 150 veces mas rapido que tiempo real en CPU (RTF 0,0066); no se detallan cifras absolutas de latencia por frase ni throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Calidad reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Klein-TTS-X1.5-Flash-Lite | 0,40M | en, fr, it | 4,28 UTMOS, 4,32 SCOREQ, 2,86% WER | Apache-2.0 | HuggingFace, npm (`@kleinml/kleintts`), paquete `kleintts` |
| Kitten TTS Nano 0.8 | 14M | no disponible | inferior en UTMOS segun el autor | no disponible | no disponible en la informacion proporcionada |
| SupraTTS 1.0 Preview | 1,0M | no disponible | inferior en UTMOS segun el autor | no disponible | no disponible en la informacion proporcionada |
| Piper (lessac medium) | 15,7M | no disponible | a la par en TTS Index segun el autor | no disponible | no disponible en la informacion proporcionada |

La comparativa se limita a los datos que el autor menciona en la model card; no se dispone de especificaciones completas (contexto, licencia, formatos) de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo cubre tres idiomas (ingles americano, frances e italiano) y tres voces fijas; no admite clonacion de voz ni voces adicionales.
- El rango de velocidad entrenado es estrecho (0,9 a 1,1); valores fuera de ese intervalo pueden degradar la prosodia y la inteligibilidad.
- El front-end compacto de la ruta Transformers coincide con el completo en el 97% de 400 frases de prueba; el 3% restante difiere en la pronunciacion de una palabra, tipicamente homografos como "read" o "use". Para la fonemizacion exacta de entrenamiento hay que usar el paquete `kleintts`.
- Al entrenarse por destilacion sobre voz sintetica, puede heredar artefactos de las voces docentes y mostrar menor naturalidad que modelos mayores en textos complejos, dominios especializados o puntuacion atipica.
- Riesgo de errores de pronunciacion en nombres propios, siglas, numeros y prestamos no cubiertos por los diccionarios o por espeak-ng.
- No se han publicado analisis de sesgos por genero, acento o variedad dialectal; las tres voces son sinteticas y no representan la diversidad de los idiomas cubiertos.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el archivo `LICENSE` del repositorio y las dependencias externas (espeak-ng, misaki, spaCy) por sus propias condiciones.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; se trata de un lanzamiento reciente sin validacion independiente de terceros.
- No es un modelo de lenguaje: no realiza razonamiento, tool calling ni generacion de texto; cualquier uso en ese sentido queda fuera de su alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/klein-ml/Klein-TTS-X1.5-Flash-Lite
- Sitio web de Klein ML: https://kleinml.com
- Paquete Node.js `@kleinml/kleintts`: https://www.npmjs.com/package/@kleinml/kleintts
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
