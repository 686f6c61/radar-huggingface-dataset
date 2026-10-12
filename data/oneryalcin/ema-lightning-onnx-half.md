# oneryalcin/ema-lightning-onnx-half

## Resumen

EMA Lightning ONNX half es una redistribucion en formato ONNX del modelo de sintesis de voz (text-to-speech) en turco EMA Lightning, desarrollado originalmente por canberkkkkkk. La conversion a ONNX fue realizada por ozcancelik y esta copia, publicada por oneryalcin, vuelve a guardar los tres grafos ONNX con los tensores de pesos en float16 en lugar de float32, reduciendo el tamano del artefacto de 35 MB a unos 18 MB. El modelo no ha sido reentrenado: es el mismo modelo, la misma voz y los mismos grafos, solo con los pesos almacenados a la mitad de precision.

El modelo se distribuye como una libreria de inferencia ONNX (opset 17) formada por tres grafos: text.onnx (2,4 MB), sound.onnx (9,4 MB) y decoder.onnx (6,1 MB), mas un fichero meta.json con vocabulario y constantes. La salida es audio mono a 48 kHz. La relevancia de esta version radica en el despliegue ligero: al mantener la aritmetica en float32 (los pesos float16 se castean a float32 al cargar el grafo), el rendimiento y el consumo de memoria son identicos a los grafos float32, pero el tamano que hay que descargar y almacenar es aproximadamente la mitad.

Esta pensado para escenarios de inferencia en el borde y en navegador: según las mediciones del autor, funciona en ONNX Runtime sobre CPU y en onnxruntime-web (WASM) en Chrome, con velocidades de entre 1,5 y 5,7 veces tiempo real segun plataforma, y permite sintesis de voz en turco sin GPU. Es una copia no oficial, hecha para el proyecto Elucify, publicada bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basado en tres grafos ONNX (text, sound, decoder); arquitectura interna del modelo base no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo text-to-speech, no es un modelo de lenguaje) |
| Tipos de cuantizacion | pesos en float16 almacenados, aritmetica en float32 en tiempo de carga (no es un grafo fp16 puro) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17); ficheros text.onnx, sound.onnx, decoder.onnx y meta.json |
| Tamano del repositorio | unos 18 MB (frente a 35 MB de la version float32) |
| Frecuencia de muestreo de salida | 48 kHz mono |
| Modelo base | canberkkkkkk/ema-lightning (version PyTorch 1.0.1) |
| Conversion ONNX origen | ozcancelik/ema-lightning-onnx |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base EMA Lightning ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas). Lo que si se documenta es la estructura de despliegue: el modelo se sirve como tres grafos ONNX independientes (text.onnx para el codigo de entrada de texto, sound.onnx y decoder.onnx para la generacion acustica y la decodificacion a forma de onda), con un fichero meta.json que contiene el vocabulario y las constantes. Las entradas, salidas y el codigo JavaScript de acompanamiento son identicos a los del repositorio de ozcancelik.

La unica modificacion tecnica respecto al ONNX original es el almacenamiento de los tensores grandes de pesos en float16. Al cargar el grafo, esos tensores se castean de vuelta a float32, de modo que el computo sigue siendo float32; no es equivalente a un grafo fp16 que tambien calcularia en 16 bits. No ha habido reentrenamiento ni ajuste fino. El autor declara que la conversion se realizo con un script (to_half.py) incluido en el repositorio, partiendo de los ficheros fuente de ozcancelik/ema-lightning-onnx.

La fidelidad respecto al modelo PyTorch original se midio sobre tres frases en turco (15,3 s de habla), con las mismas letras y la misma semilla de ruido, comparando el modelo PyTorch con estos grafos en ONNX Runtime sobre CPU: distancia log-espectral de 0,13 a 0,15 dB y correlacion de forma de onda de 0,99995 o superior. Como referencia, la misma frase con una semilla de ruido distinta da 8,3-8,8 dB y una correlacion de aproximadamente 0,06. Los recuentos de tramas fueron identicos.

## Capacidades

- Sintesis de voz (text-to-speech) en turco, con salida de audio mono a 48 kHz.
- Generacion de voz a partir de texto con control de semilla de ruido, lo que permite variar la realizacion acustica entre ejecuciones.
- Inferencia en CPU y en navegador mediante ONNX Runtime y onnxruntime-web (WASM, hilos configurables).
- Despliegue en entornos sin GPU, incluido Cloudflare Workers.
- Control de velocidad de sintesis (la validacion se hizo a velocidad 1.0 y batch size 1).
- Integracion en JavaScript mediante el web/tts.js del repositorio de conversion origen.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, vision, audio de entrada ni modo de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Lectura por voz en aplicaciones web en turco: el modelo se ejecuta en el navegador con onnxruntime-web (WASM) y no requiere backend ni GPU, de modo que puede anadir sintesis de voz a una interfaz front-end descargando unos 18 MB de pesos.
- Asistentes de voz en dispositivos moviles con Android: segun las mediciones del autor, Chrome en un telefono Android sintetiza entre 1,5 y 1,7 veces tiempo real, suficiente para respuestas habladas en tiempo casi real sin infraestructura de servidor.
- Servicios edge en Cloudflare Workers: el modelo cabe en un Worker con unos 83 MB de memoria WASM y sintetiza a unas 3,3 veces tiempo real, lo que permite ofrecer TTS bajo demanda desde el borde sin GPU.
- Accesibilidad y lectores de pantalla: al ser un modelo ligero y de licencia Apache-2.0, puede integrarse en herramientas de lectura asistida para contenidos en turco con un coste de descarga minimo.
- Generacion de audiolibros y contenido narrado por lotes: la velocidad de 17 veces tiempo real en cuatro hilos permite procesar grandes volumenes de texto en CPU para producir narraciones pregrabadas.
- Prototipado rapido de productos de voz: al reducir el peso a la mitad y mantener la calidad respecto al PyTorch original (correlacion superior a 0,99995), es adecuado para validar una experiencia de voz en turco antes de invertir en infraestructura.
- Integracion en aplicaciones de mensajeria o notificaciones que requieran convertir texto dinamico a voz localmente, sin enviar el contenido a un servicio externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (el modelo no es un LLM, por lo que no aplican metricas como MMLU, HumanEval o GSM8K). Se dispone de medidas de fidelidad acustica y de velocidad:

| Metrica | Valor |
|---|---|
| Distancia log-espectral frente a PyTorch (3 frases turcas) | 0,13-0,15 dB |
| Correlacion de forma de onda frente a PyTorch | 0,99995 o superior |
| Referencia: misma frase con otra semilla de ruido | 8,3-8,8 dB; correlacion ~0,06 |
| Velocidad en Chrome sobre MacBook M1 (1 hilo) | 5,7 veces tiempo real |
| Velocidad en Chrome sobre MacBook M1 (4 hilos) | 17 veces tiempo real |
| Velocidad en Chrome sobre Android | 1,5-1,7 veces tiempo real |
| Velocidad en Cloudflare Worker | unas 3,3 veces tiempo real |
| Memoria WASM en Cloudflare Worker | unos 83 MB |

## Requisitos de hardware

- No requiere GPU: el modelo esta disenado para inferencia en CPU (ONNX Runtime) y en navegador (onnxruntime-web sobre WASM).
- Tamano de artefacto a descargar y almacenar: unos 18 MB en total (text.onnx 2,4 MB, sound.onnx 9,4 MB, decoder.onnx 6,1 MB).
- Memoria en tiempo de ejecucion: aproximadamente 83 MB de memoria WASM en un Cloudflare Worker; en otras plataformas no se especifica, aunque los pesos se cargan como float32.
- Cabe en cualquier GPU de consumo y en la mayoria de entornos de CPU, dado su tamano; no se documentan requisitos de VRAM especificos ni comparativas con A100, H100 o RTX 4090, que no serian necesarias para este modelo.
- Opciones de despliegue: ONNX Runtime (CPU), onnxruntime-web (WASM, con configuracion de hilos), Cloudflare Workers, y cualquier entorno JavaScript que use el web/tts.js del repositorio de origen. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS de este tipo.
- Latencia y throughput estimados: entre 1,5 y 17 veces tiempo real segun plataforma e hilos, con los valores detallados en la tabla de rendimiento.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Fidelidad | Velocidad | Licencia |
|---|---|---|---|---|---|
| oneryalcin/ema-lightning-onnx-half (este) | ONNX, pesos float16, computo float32 | ~18 MB | 0,13-0,15 dB frente a PyTorch | 5,7× (M1, 1 hilo); 17× (4 hilos) | Apache-2.0 |
| ozcancelik/ema-lightning-onnx | ONNX, float32 | ~35 MB | referencia de conversion | igual que el anterior | Apache-2.0 |
| canberkkkkkk/ema-lightning 1.0.1 | PyTorch | no disponible | modelo original | no disponible | Apache-2.0 |

No se dispone de datos sobre otros modelos TTS en turco comparables dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos del modelo base; al estar entrenado solo en turco, su comportamiento en otros idiomas no esta caracterizado.
- Riesgo de alucinacion: no aplica en el sentido de los LLM, pero un modelo TTS puede producir pronunciaciones incorrectas o artefactos acusticos en textos fuera del dominio de entrenamiento, y no se documentan evaluaciones fuera de las tres frases de validacion.
- Limitaciones de contexto o idioma: soporta unicamente turco (tr). No hay informacion sobre la longitud maxima de texto de entrada ni sobre el comportamiento con numeros, siglas o puntuacion inusual.
- Restricciones de licencia: Apache-2.0, lo que permite uso comercial; el autor indica que se incluyen los ficheros LICENSE y NOTICE. Al ser una copia no oficial, conviene verificar la trazabilidad de la licencia en el uso en produccion.
- Caveat de validacion: las medidas de fidelidad se tomaron sobre tres frases (15,3 s), a batch size 1 y velocidad 1.0; no se probaron lotes mayores ni otras velocidades.
- Es una copia no oficial creada para Elucify; el credito del modelo corresponde a canberkkkkkk y la conversion ONNX a ozcancelik. El repositorio no registra descargas ni interacciones en el momento de la consulta.
- El repositorio figura con un tamano de 0.0 GB en los metadatos de HuggingFace, aunque los ficheros declarados suman unos 18 MB.
- No se documentan integraciones con aceleracion por GPU (por ejemplo, CUDA o TensorRT); el rendimiento medido corresponde a CPU y WASM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oneryalcin/ema-lightning-onnx-half
- Modelo base (PyTorch): https://huggingface.co/canberkkkkkk/ema-lightning
- Conversion ONNX de origen: https://huggingface.co/ozcancelik/ema-lightning-onnx
- Proyecto Elucify: https://elucify.dev

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo, su arquitectura o su entrenamiento; los resultados obtenidos no guardan relacion con el tema.
