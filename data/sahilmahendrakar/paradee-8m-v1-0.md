# sahilmahendrakar/Paradee-8M-v1.0

## Resumen

Paradee-8M v1.0 es un modelo de sintesis de voz (text-to-speech) en ingles, mono-voz y de tamano muy reducido, desarrollado por Sahil Mahendrakar y publicado bajo licencia Apache 2.0. Se trata de un modelo destilado de Kokoro-82M: conserva la arquitectura del profesor pero con anchuras mucho menores, dividida en dos mitades (un lado de texto de 4,23 M de parametros y un decodificador de 3,85 M), lo que da un total de 8,07 M de parametros. Su problema objetivo es claro: ofrecer una voz neural de calidad cercana a la del profesor en dispositivos sin GPU, con un archivo ONNX int8 de 9 MB frente a los 325 MB de Kokoro.

La relevancia del modelo esta en su relacion calidad/tamano/velocidad. Alcanza un UTMOS de 4,41 frente al 4,52 de su profesor y mantiene su misma tasa de error de palabra (5,7%) medido con Whisper base, pero ocupa 38 veces menos y corre aproximadamente 18 veces mas rapido que el tiempo real en un solo hilo de CPU con onnxruntime. Esto lo situa en el segmento de TTS embebido, navegador y telefono, donde Kokoro-82M resulta caro en memoria o latencia.

El modelo habla una unica voz, `af_heart`, la misma del profesor, con pronunciacion de ingles americano. El grafo ONNX va directamente de identificadores de fonemas a forma de onda a 24 kHz e incorpora un filtro sin parametros que corrige la fase de los sonidos sonoros entre 2 y 8 kHz para eliminar un zumbido residual del decodificador pequeno. No es un modelo de lenguaje: no genera texto, razona ni llama a herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS no autorregresiva derivada de Kokoro-82M (lado de texto + decodificador), exportada como grafo ONNX unico |
| Parametros totales | 8,07 M (4,23 M lado de texto + 3,85 M decodificador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 identificadores de fonemas como maximo, con un token de relleno `0` en cada extremo |
| Tipos de cuantizacion | int8 (archivo ONNX, 9,0 MB) y fp32 (archivo ONNX, 37 MB) |
| Idiomas soportados | en (ingles, pronunciacion americana) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`paradee_int8.onnx`, `paradee.onnx`), PyTorch (`text_side.pt`, `decoder.pt`), `config.json`, `tokenizer.json` |
| Frecuencia de muestreo | 24 kHz |
| Entradas | `input_ids` (int64, `[1, T]`, ids de fonemas) y `speed` (float32, `[1]`, 1.0 = velocidad normal) |
| Salida | `waveform` (float32, `[1, samples]`) |
| Voces | una sola (`af_heart`, de Kokoro) |
| Modelo base | hexgrad/Kokoro-82M |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Paradee reutiliza el codigo de Kokoro-82M reduciendo las anchuras de la red. La mitad de texto se entrena para predecir las duraciones de fonema, el tono, el volumen y las caracteristicas de fonema del profesor congelado; la mitad decodificadora aprende a convertir esos valores guardados del profesor en el audio del profesor, primero con perdidas de espectrograma y despues con entrenamiento adversario. Las dos mitades se unen sin entrenamiento adicional. El entrenamiento se hizo con 12.000 frases de WikiText-103 (23,9 horas de audio) leidas por Kokoro, y todo el proceso corrio en un unico MacBook Pro. No se menciona uso de RLHF ni DPO, algo que no aplica a un modelo de sintesis.

La innovacion tecnica destacable es un filtro sin parametros que corrige la fase del sonido sonoro entre 2 y 8 kHz (la fase es el desfase temporal de la onda de cada frecuencia). Sin el, el decodificador pequeno deja un zumbido perceptible en algunos sonidos sonoros. El grafo ONNX exportado incluye ya ese filtro, de modo que la salida es directamente la forma de onda final. Ademas, los fonemas deben escribirse tal y como los genera misaki, la libreria de grafema-a-fonema de Kokoro, porque es lo unico que vio el modelo durante el entrenamiento; en navegador, `web/misaki.js` traduce la notacion de eSpeak NG a la de misaki (sin esa conversion Whisper transcribe mal alrededor del 31% de las palabras, y con ella alrededor del 2%).

## Capacidades

- Sintesis de voz en ingles a partir de texto fonemizado, mono-voz (`af_heart`), a 24 kHz.
- Conversion directa de fonemas a audio en un unico grafo ONNX, sin etapas intermedias de vocoder separadas.
- Control de velocidad de habla mediante la entrada `speed` (1.0 = velocidad normal).
- Inferencia en CPU sin GPU: aproximadamente 18 veces mas rapida que el tiempo real en un hilo con onnxruntime (int8).
- Funcionamiento en navegador mediante `tokenizer.json` y la ruta de kokoro-js o transformers.js, con el conversor de notacion fonetica incluido.
- Entrenamiento reproducible: el repositorio de GitHub incluye el codigo de entrenamiento y los pesos PyTorch de ambas mitades.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni generacion de texto.

## Casos de uso

- Lectores de pantalla y accesibilidad: el modelo ocupa 9 MB y funciona en CPU, por lo que puede integrarse en aplicaciones de escritorio o moviles que necesitan leer texto en voz alta sin depender de la nube ni de una GPU.
- Asistentes de voz en dispositivos embebidos: con 8,07 M de parametros y una sola voz, cabe en Raspberry Pi, moviles o hardware IoT donde Kokoro-82M (325 MB) no es viable.
- Interfaces web con sintesis local: mediante onnxruntime-web o kokoro-js el modelo puede generar voz en el navegador del usuario, evitando enviar texto a un servicio externo y reduciendo coste por peticion a cero.
- Avisos y notificaciones de sistema: al correr 18 veces mas rapido que el tiempo real en un hilo de CPU, la latencia de generacion de frases cortas es lo bastante baja para notificaciones, alarmas y mensajes de estado.
- Audiolibros y contenido largo generado por lotes: el bajo coste computacional permite sintetizar grandes volumenes de texto en servidores sin GPU, aunque la ventana de 512 identificadores de fonemas obliga a trocear el texto por frases.
- Videojuegos y prototipos: una voz pequena y rapida sirve para doblar dialogos dinamicos o pregenerar lineas en pipelines de compilacion de assets sin sumar cientos de megas al paquete.
- Aprendizaje de idiomas y material educativo: la pronunciacion americana del profesor se mantiene, y el control de velocidad (`speed`) permite generar versiones mas lentas para practica de escucha.
- Telefonia e IVR: la sintesis en CPU encaja en centralitas o servicios de voz que necesitan muchas locuciones concurrentes y no disponen de acelerador.

## Benchmarks y rendimiento

Todos los numeros corresponden a 200 frases reservadas. La velocidad esta medida en un hilo de CPU de un Apple M4 Pro y se expresa como multiplo del tiempo real.

| Modelo (voz) | Parametros | Tamano de archivo | Velocidad | UTMOS | WER |
|---|---:|---:|---:|---:|---:|
| Kokoro-82M, profesor (`af_heart`) | 81,8 M | 325 MB | 7,6x | 4,52 | 5,7% |
| Paradee (`af_heart`) | 8,07 M | 8,45 MB | 25,0x | 4,41 | 5,7% |
| Kokoro-7M-Distill (`af_msa`) | 7,48 M | 30,1 MB | 35,5x | 4,18 | 7,4% |
| Piper, en_US-lessac-medium | 15,7 M | 63,2 MB | 15,4x | 4,36 | 8,8% |
| KittenTTS nano 0.8 (Bella) | 14,0 M | 56,8 MB | 10,7x | 4,01 | 5,5% |

UTMOS es una red neuronal entrenada con valoraciones humanas que predice la naturalidad de un fragmento en una escala de 1 a 5. El WER es la proporcion de palabras que Whisper (base) transcribe de forma incorrecta. La tabla procede del articulo y mide PyTorch; el archivo publicado `paradee_int8.onnx` obtiene un UTMOS de 4,41 en las mismas frases y corre aproximadamente 18 veces mas rapido que el tiempo real con onnxruntime en un hilo.

## Requisitos de hardware

- VRAM: no requiere GPU. El modelo int8 ocupa 9,0 MB de pesos; la version fp32, 37 MB.
- Memoria de sistema: el consumo es de decenas de megas, apto para dispositivos con RAM limitada y para ejecucion dentro de un navegador.
- GPU recomendadas: ninguna. No se han publicado cifras de aceleracion en GPU para este modelo.
- GPU de consumo: irrelevante, ya que el modelo esta pensado para CPU; cualquier GPU moderna no aportaria una ventaja proporcional.
- CPU validada: Apple M4 Pro, un solo hilo, tanto en PyTorch (25,0x respecto al tiempo real) como en onnxruntime con int8 (18x).
- Opciones de despliegue: onnxruntime (Python y C/C++), onnxruntime-web y transformers.js / kokoro-js en navegador, y el paquete Python propio (`pip install git+https://github.com/sahilmahendrakar/paradee`). vLLM, llama.cpp, Ollama y TGI no son aplicables: no es un modelo de lenguaje.
- Latencia y rendimiento: 18x mas rapido que el tiempo real en un hilo de CPU con el archivo int8; 25,0x en PyTorch sobre el M4 Pro. Al no usar GPU, el rendimiento depende del numero de hilos asignados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrada | Tamano | UTMOS | WER | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---|---|
| Paradee-8M v1.0 | 8,07 M | 512 ids de fonemas | 9,0 MB (int8) | 4,41 | 5,7% | Apache 2.0 | ONNX y PyTorch, en HuggingFace y GitHub |
| Kokoro-82M | 81,8 M | no disponible | 325 MB | 4,52 | 5,7% | Apache 2.0 | ONNX y PyTorch, modelo profesor |
| Kokoro-7M-Distill | 7,48 M | no disponible | 30,1 MB | 4,18 | 7,4% | no disponible en la informacion proporcionada | distilacion alternativa, voz `af_msa` |
| Piper, en_US-lessac-medium | 15,7 M | no disponible | 63,2 MB | 4,36 | 8,8% | no disponible en la informacion proporcionada | ecosistema Piper |
| KittenTTS nano 0.8 (Bella) | 14,0 M | no disponible | 56,8 MB | 4,01 | 5,5% | no disponible en la informacion proporcionada | no disponible |

Frente a Piper y KittenTTS, Paradee consigue mejor UTMOS con menos parametros y un archivo mas pequeno. Frente a Kokoro-7M-Distill, Paradee pierde en velocidad (25,0x frente a 35,5x) pero gana en naturalidad (4,41 frente a 4,18) y en WER (5,7% frente a 7,4%). Su desventaja estructural frente a todos ellos es que solo ofrece una voz y solo ingles.

## Limitaciones y advertencias

- Solo ingles con pronunciacion americana y una unica voz (`af_heart`); no hay seleccion de hablante ni otros idiomas.
- Los numeros, las abreviaturas y las palabras poco frecuentes se pronuncian solo tan bien como los resuelva misaki, la libreria de grafema-a-fonema.
- Puede escucharse un zumbido leve en algunos sonidos sonoros, aunque mucho menor que sin el filtro de correccion de fase.
- La entrada debe fonemizarse con la convencion de misaki; usar la notacion de eSpeak NG sin conversion dispara la tasa de error de transcripcion del 2% al 31%.
- Limite duro de 512 identificadores de fonemas por inferencia, con token de relleno en ambos extremos; el texto largo debe trocearse.
- No hay datos publicados sobre sesgos de la voz ni sobre el tratamiento de nombres propios o terminos tecnicos fuera del vocabulario de misaki.
- Riesgo de artefactos acusticos y de pronunciacion incorrecta en texto fuera de dominio; las cifras de UTMOS y WER corresponden a 200 frases reservadas de WikiText-103, no a un uso general.
- La licencia Apache 2.0 permite uso comercial, la misma que el modelo base, pero conviene verificar las condiciones de las dependencias (misaki, eSpeak NG) antes de desplegar.
- El numero de descargas y de likes registrados es cero, y el repositorio ocupa 0,1 GB; se trata de una publicacion reciente y sin validacion independiente fuera de las cifras del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.0
- Codigo, entrenamiento y paquete Python: https://github.com/sahilmahendrakar/paradee
- Conversor de notacion fonetica para navegador: https://github.com/sahilmahendrakar/paradee/blob/main/web/misaki.js
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Libreria de grafema-a-fonema misaki: https://github.com/hexgrad/misaki
- Perfil del autor en GitHub: https://github.com/sahilmahendrakar
- Cita del autor: Mahendrakar, Sahil (2026), "Paradee: Distilling Kokoro-82M into an 8M-Parameter Single-Voice Text-to-Speech Model", https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.0
