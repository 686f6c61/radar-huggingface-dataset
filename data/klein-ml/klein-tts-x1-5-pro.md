# klein-ml/Klein-TTS-X1.5-Pro

## Resumen

Klein-TTS-X1.5-Pro es un modelo de síntesis de voz (text-to-speech) multilingüe de 13,12 millones de parámetros desarrollado por klein-ml. Forma parte de la familia Klein-TTS X1.5, que se presenta en tres tamaños (Flash Lite con 0,4M, Flash con 1,7M y Pro con 13M); esta ficha corresponde al modelo Pro. El modelo convierte fonemas IPA en audio mono a 24 kHz en inglés (americano y británico), castellano, francés e italiano, con 17 voces que pueden combinarse dentro de un mismo idioma.

El problema que resuelve es la síntesis de voz de calidad en dispositivos con recursos limitados: según el autor, alcanza un factor de tiempo real de 0,002 en GPU y funciona más rápido que el tiempo real en CPU convencional, lo que lo hace adecuado para despliegue en local y en el borde. Se entrenó por destilación sobre habla sintética, con una GAN y una pérdida de características WavLM.

Es relevante por su relación entre tamaño y calidad: con 13M parámetros obtiene 4,44 UTMOS, 4,70 SCOREQ y un 2,51% de tasa de error de palabras (Whisper small) en 300 frases web reservadas, según los datos del autor. Se distribuye con licencia Apache-2.0 y pesos en safetensors, ONNX y PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador estilo StyleTTS 2 / ISTFTNet: encoder de texto con bloque transformer compartido, predictor de duraciones, cabezas de F0 y energía, decoder AdaIN con fuente armónica y cabeza iSTFT |
| Parametros totales | 13.122.196 (13,12M, solo generador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo trabaja por unidades de 1 a 3 frases, sin ventana de contexto declarada) |
| Tipos de cuantizacion | Versión ternaria (1,58 bits) + FP4 publicada por el autor para el modelo Pro; no se detallan otros formatos |
| Idiomas soportados | Inglés (americano y británico), castellano, francés e italiano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX y PyTorch (custom_code) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema de StyleTTS 2 / ISTFTNet. Un encoder de texto de pesos compartidos (un bloque transformer de dimensión 256, 4 cabeceras, FFN de 1536 y RoPE, aplicado 6 veces, más 3 capas convolucionales) predice primero las duraciones mediante 3 bloques transformer condicionados por estilo, donde la duración resulta de la suma de 50 compuertas sigmoideas dividida por el valor de velocidad. A continuación, cabezas a nivel de trama predicen F0 y log-energía condicionadas por la voz, y un decoder con bloques residuales AdaIN, fuente armónica y de ruido (8 armónicos), sobremuestreo de 10x y 6x y cabeza iSTFT genera la forma de onda. La salida es mono a 24 kHz con 300 muestras (12,5 ms) por trama.

El entrenamiento se hizo por destilación sobre habla sintética de las 17 voces de la versión (voces individuales, sin clips combinados) a velocidades de habla de 0,9, 1,0 y 1,1. El texto proviene de FineWeb (inglés) y FineWeb-2 (castellano, francés e italiano), en unidades de 1 a 3 frases. La función de pérdida combina L1 sobre log-mel, STFT multirresolución, LSGAN con feature matching (discriminadores multiperiodo y multirresolución, desde el paso 10.000), feature matching con WavLM, L1 de duración, tono y energía, y un término de silencio. Se optimizó con AdamW, LR 2e-4 con decaimiento coseno, en bf16. Durante el entrenamiento temprano el decoder recibe tono y energía de referencia y pasa a sus propias predicciones entre los pasos 5.000 y 30.000. El checkpoint publicado corresponde al paso 100.000 de una ejecución de 150.000 pasos.

El front-end de texto usa una vocabulario de 178 símbolos IPA: inglés mediante misaki y castellano, francés e italiano mediante espeak-ng. La ruta de Transformers incluye su propio código y diccionarios compactos de inglés a fonemas (sin spaCy), que según el autor coincide con el front-end completo en el 97% de 400 frases de prueba en inglés; el paquete `kleintts` ofrece el front-end exacto usado en el entrenamiento.

## Capacidades

- Síntesis de voz multilingüe en inglés (americano y británico), castellano, francés e italiano a partir de texto.
- 17 voces seleccionables y combinables dentro de un mismo idioma: Sarah, Lyra, Maya, Ivy, Bella, Owen, Caleb, Isabella, Harriet, Edmund, Arthur, Lucia, Mateo, Diego, Camille, Giulia y Marco.
- Control de velocidad mediante un valor que divide las duraciones predichas; el modelo se entrenó en el rango de 0,9 a 1,1.
- Modelado de prosodia a nivel de trama mediante predicción de F0 y energía condicionadas por la voz.
- Salida de audio mono a 24 kHz con 12,5 ms por trama.
- Inferencia en CPU y GPU, con factor de tiempo real declarado de 0,002 en GPU.
- Integración con Transformers mediante `trust_remote_code=True` y paquete propio `kleintts`.
- Disponibilidad de pesos en safetensors, ONNX y PyTorch, además de una versión ternaria (1,58 bits) + FP4.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Lectura de artículos y documentos en local: el modelo convierte texto en voz a 24 kHz en cuatro idiomas y funciona más rápido que el tiempo real en CPU, por lo que puede integrarse en aplicaciones de lectura sin depender de servicios en la nube.
- Asistentes de voz para dispositivos con recursos limitados: con 13M parámetros y una versión ternaria de 1,58 bits, puede desplegarse en equipos de borde y sistemas empotrados donde un modelo de decenas de millones de parámetros no cabría.
- Generación de audiolibros y contenido editorial: las 17 voces combinables y el control de velocidad (entrenado de 0,9 a 1,1) permiten narrar con distintos perfiles y ritmos sin grabar locuciones.
- Dooblaje y localización de contenido: al cubrir inglés, castellano, francés e italiano con el mismo checkpoint, se puede generar pista de voz para vídeos y materiales formativos en los cuatro idiomas desde una única tubería.
- Sistemas de respuesta por voz en atención al cliente: la síntesis rápida en GPU (factor de tiempo real de 0,002) permite respuestas habladas con baja latencia en flujos conversacionales.
- Prototipado de interfaces accesibles: conversión de texto a voz para lectores de pantalla y ayudas de accesibilidad en aplicaciones de escritorio y web, con licencia Apache-2.0 que permite uso comercial.
- Pruebas de pronunciación y lingüística: el vocabulario IPA de 178 símbolos y la separación entre front-end y generador facilitan experimentos con transcripciones fonéticas y variantes de pronunciación.

## Benchmarks y rendimiento

Datos publicados por el autor sobre 300 frases web reservadas (no vistas en entrenamiento):

| Metrica | Klein-TTS-X1.5-Pro (13M) | Phonon (31M) | Kitten TTS Nano 0.8 (14M) | Kokoro (82M) |
|---|---|---|---|---|
| UTMOS | 4,44 | igualado según el autor | por debajo según el autor | 4,52 |
| SCOREQ | 4,70 | superado por Pro según el autor | por debajo según el autor | 4,87 |
| Tasa de error de palabras (Whisper small) | 2,51% | superado por Pro según el autor | por debajo según el autor | no disponible |
| DNSMOS | no disponible (el autor indica que supera a Phonon) | no disponible | no disponible | no disponible |
| Factor de tiempo real (GPU) | 0,002 | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que el modelo no es de lenguaje sino de síntesis de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 13,12M parámetros en precisión nativa, los pesos ocuparían del orden de decenas de MB, y la versión ternaria (1,58 bits) + FP4 reduce aún más esa huella.
- GPU recomendadas: no se especifican modelos concretos; el autor declara un factor de tiempo real de 0,002 en GPU, sin detallar la unidad empleada.
- CPU: el autor afirma que el modelo funciona más rápido que el tiempo real en CPU convencional, lo que permite prescindir de GPU.
- GPU de consumo: no disponible; por tamaño, el modelo cabe con holgura en cualquier GPU de consumo, pero no se aportan mediciones específicas.
- Opciones de despliegue: Transformers con `trust_remote_code=True`, paquete `kleintts`, y pesos en ONNX y PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: factor de tiempo real de 0,002 en GPU según el autor; no se aportan cifras de latencia por petición ni de throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | UTMOS | SCOREQ | Licencia | Formatos |
|---|---|---|---|---|---|---|
| Klein-TTS-X1.5-Pro | 13,12M | en, es, fr, it | 4,44 | 4,70 | Apache-2.0 | safetensors, ONNX, PyTorch |
| Phonon | 31M | no disponible | igualado según el autor | inferior según el autor | no disponible | no disponible |
| Kitten TTS Nano 0.8 | 14M | no disponible | inferior según el autor | inferior según el autor | no disponible | no disponible |
| Kokoro | 82M | no disponible | 4,52 | 4,87 | no disponible | no disponible |

Según el autor, X1.5-Pro iguala a Phonon (31M) en UTMOS y lo supera en SCOREQ, DNSMOS y precisión de palabras con el 42% de su tamaño, y queda por delante de Kitten TTS Nano 0.8 (14M). Kokoro (82M), unas seis veces mayor, sigue por delante en UTMOS y SCOREQ. Los datos de licencia, idiomas y formatos de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; el entrenamiento usa habla sintética de 17 voces y texto web de FineWeb y FineWeb-2, cuya composición puede introducir sesgos de dominio y de registro lingüístico.
- Riesgo de alucinación: en TTS se manifiesta como pronunciaciones erróneas o prosodia incorrecta; el front-end compacto de Transformers coincide con el completo en el 97% de las frases de prueba en inglés, y el 3% restante difiere en la pronunciación de una sola palabra (casos como "read" o "use", cuyo sonido depende de la categoría gramatical).
- Limitaciones de idioma: solo cubre inglés, castellano, francés e italiano; no se declara soporte para otras lenguas.
- Limitaciones de contexto: el modelo se entrenó con unidades de 1 a 3 frases, por lo que textos largos deben segmentarse; no se declara una ventana de contexto formal.
- Control de velocidad: el rango entrenado es de 0,9 a 1,1; fuera de ese intervalo la calidad puede degradarse.
- Voces: solo se pueden combinar voces dentro de un mismo idioma.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar el fichero `LICENSE` del repositorio y las licencias de las dependencias (misaki, espeak-ng, spaCy) antes de producción.
- Dependencias en tiempo de ejecución: la ruta de Transformers instala automáticamente `regex`, `phonemizer-fork` y `espeakng-loader` al recibir texto por primera vez, salvo que se defina `KLEINTTS_NO_AUTO_INSTALL=1`; en entornos sin red o con instalación controlada hay que preinstalar esas dependencias.
- Checkpoint: los pesos publicados son el paso 100.000 de una ejecución de 150.000 pasos, no el modelo final de la ejecución.
- Madurez: el repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que no hay validación independiente de las cifras declaradas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/klein-ml/Klein-TTS-X1.5-Pro
- Sitio web de Klein ML: https://kleinml.com
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Paquete `kleintts`: instalación mediante `pip install kleintts` (no se proporciona URL del repositorio en la información disponible)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada; la búsqueda web realizada no devolvió resultados relacionados con este modelo.
