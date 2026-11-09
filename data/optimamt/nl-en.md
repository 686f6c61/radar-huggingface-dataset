# OptimaMT/nl-en

## Resumen

OptimaMT/nl-en es un modelo de traduccion automatica neerlandes-ingles publicado por OptimaMT, un proyecto que redistribuye pares de traduccion en formato ONNX optimizado para su ejecucion en el navegador y en entornos con recursos limitados. Se trata de una copia directa de Xenova/opus-mt-nl-en (revision `82c42d95d150`), que a su vez es una exportacion ONNX del modelo OPUS-MT de la Universidad de Helsinki, con una unica modificacion: el decodificador fusionado (`decoder_model_merged_quantized.onnx`) se reconstruye con una proyeccion de salida reubicada fuera de sus dos ramas, lo que reduce el consumo de memoria sin alterar los pesos ni la tokenizacion.

El modelo mantiene la arquitectura Marian de OPUS-MT, con un vocabulario de 67.028 tokens y soporte exclusivo para el par neerlandes-ingles. Su relevancia radica en la reduccion de memoria reportada por el autor: entre un 47 y un 49 por ciento menos de memoria tras la carga en Linux y Windows cuando se desactiva la cuantizacion QDQ, y un 15 por ciento menos con los valores por defecto de ONNX Runtime, manteniendo tokens de salida identicos.

El modelo esta pensado para inferencia ligera en CPU mediante transformers.js y ONNX Runtime, lo que lo hace adecuado para aplicaciones web, extensiones de navegador o servicios de traduccion de bajo coste donde no se dispone de GPU. El repositorio ocupa 0,1 GB y la licencia es CC BY 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX quantized (q8 en el ejemplo de uso); el autor menciona `disable_quant_qdq` como opcion de sesion |
| Idiomas soportados | neerlandes (nl) como origen, ingles (en) como destino |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); el unico archivo reconstruido es `onnx/decoder_model_merged_quantized.onnx` |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder de tipo Marian, la arquitectura empleada por la familia OPUS-MT de la Universidad de Helsinki para traduccion automatica neuronal. El vocabulario consta de 67.028 tokens y el modelo esta especializado en un unico par de idiomas (neerlandes a ingles). No se dispone de informacion sobre el numero de parametros totales, la composicion del corpus de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden al modelo original OPUS-MT y no se detallan en la informacion disponible.

La innovacion tecnica de esta version es exclusivamente de grafo: la proyeccion de salida del decodificador se ha movido fuera de sus dos ramas en el archivo ONNX fusionado, lo que permite un grafo mas eficiente en memoria. Segun el autor, los pesos y los tokens son identicos a los del modelo base. El resto de archivos del repositorio son copias byte a byte del original. El modelo se distribuye con soporte para transformers.js y se ejecuta sobre ONNX Runtime 1.31.1 en CPU con 4 hilos en las mediciones reportadas.

## Capacidades

- Traduccion de texto de neerlandes a ingles, unico par soportado.
- Generacion de texto secuencial token a token mediante decodificacion autorregresiva.
- Ejecucion en navegador y en Node.js a traves de transformers.js con el pipeline `translation`.
- Ejecucion en Python mediante ONNX Runtime, sentencepiece y numpy (script `translate.py` del repositorio).
- Inferencia en CPU con consumo de memoria reducido respecto al modelo base.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- Capacidad multilingue limitada al par nl-en; no traduce a otros idiomas ni desde otros idiomas.

## Casos de uso

- Traduccion integrada en aplicaciones web: al ejecutarse con transformers.js en el navegador, permite traducir contenido neerlandes a ingles sin enviar datos a un servidor, lo que resulta util para privacidad y para reducir latencia de red.
- Extensiones de navegador para lectura: el modelo puede traducir articulos o paginas neerlandesas al ingles en el cliente, con una huella de memoria de aproximadamente 199 MiB con los valores por defecto de ONNX Runtime.
- Preprocesamiento de datos en pipelines de NLP: traduccion de corpus neerlandeses a ingles antes de aplicar modelos de analisis de sentimiento, clasificacion o resumen entrenados principalmente en ingles.
- Atencion al cliente en comercio electronico: traduccion de mensajes de clientes neerlandeses a ingles para que agentes o sistemas de ticketing en ingles los procesen, con inferencia en CPU de bajo coste.
- Servicios de traduccion de bajo volumen en entornos sin GPU: el modelo cabe en CPU y en contenedores ligeros, adecuado para funciones serverless o microservicios con presupuesto de memoria ajustado.
- Traduccion de documentacion tecnica y contenido editorial de neerlandes a ingles en flujos de publicacion, donde la reduccion de memoria del 47-49 por ciento permite ejecutar varias instancias en el mismo host.
- Prototipado y evaluacion de sistemas de traduccion: al ser una copia verificada del modelo base con tokens identicos, sirve para comparar el rendimiento en memoria de distintas configuraciones de ONNX Runtime sin cambiar la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traduccion (BLEU, COMET u otras metricas) en la informacion disponible. El autor unicamente reporta mediciones de memoria tras la carga y la identidad de tokens de salida:

| Metrica | Linux | Windows | Tokens identicos |
|---|---:|---:|---|
| Memoria con `disable_quant_qdq = 1` | 558 → 297 MiB (-47 %) | 533 → 271 MiB (-49 %) | si |
| Memoria con valores por defecto de ONNX Runtime | 233 → 199 MiB (-15 %) | 204 → 173 MiB (-15 %) | si |

Mediciones realizadas con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux; Windows en una maquina virtual).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para CPU y no requiere GPU.
- Memoria RAM estimada: entre 173 y 199 MiB con los valores por defecto de ONNX Runtime, y entre 271 y 297 MiB con `disable_quant_qdq = 1`, segun el sistema operativo.
- GPU recomendadas: no disponibles ni necesarias; el modelo se ejecuta en CPU.
- Cabe en cualquier GPU de consumo y en practicamente cualquier CPU moderna; el requisito real es de RAM, no de VRAM.
- Opciones de despliegue: transformers.js (navegador y Node.js) y ONNX Runtime en Python mediante el script `translate.py`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Memoria reportada |
|---|---|---|---|---|---|---|
| OptimaMT/nl-en | no disponible | no disponible | nl → en | CC BY 4.0 | ONNX | 173-297 MiB segun configuracion |
| Xenova/opus-mt-nl-en | no disponible | no disponible | nl → en | CC BY 4.0 | ONNX | 204-558 MiB segun configuracion |
| Helsinki-NLP/opus-mt-nl-en | no disponible | no disponible | nl → en | CC BY 4.0 | safetensors / PyTorch | no disponible |

La diferencia principal frente a Xenova/opus-mt-nl-en es la reduccion de memoria del decodificador fusionado, manteniendo la identidad de tokens. Frente al modelo original de Helsinki-NLP, la ventaja es la disponibilidad en ONNX para ejecucion en navegador y CPU. No se dispone de datos de calidad de traduccion para comparar el rendimiento entre estas variantes.

## Limitaciones y advertencias

- Especializado exclusivamente en el par neerlandes-ingles; no traduce desde o hacia otros idiomas.
- No se dispone de informacion sobre sesgos del modelo; al derivar de OPUS-MT, hereda los sesgos presentes en los corpus de traduccion utilizados por la Universidad de Helsinki.
- Riesgo de alucinacion y de errores de traduccion en textos especializados, terminologia tecnica o dominios poco representados en el corpus original.
- Longitud de contexto no documentada; textos largos pueden requerir segmentacion manual.
- El modelo no incorpora mecanismos de moderacion ni de control de contenido.
- La licencia CC BY 4.0 permite uso comercial con atribucion; es necesario citar a los autores originales (Universidad de Helsinki, OPUS-MT) y a Xenova por la exportacion ONNX, ademas de a OptimaMT por la modificacion del grafo.
- La fecha de creacion indicada (2026-11-09) y el numero de descargas (0) sugieren un modelo muy reciente o de baja adopcion; no hay evidencia de uso en produccion.
- El rendimiento en memoria depende de la version de ONNX Runtime y de la configuracion de sesion; los valores reportados corresponden a ONNX Runtime 1.31.1 con 4 hilos en CPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/nl-en
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodologico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traduccion en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-nl-en
- Modelo OPUS-MT original: https://huggingface.co/Helsinki-NLP/opus-mt-nl-en
