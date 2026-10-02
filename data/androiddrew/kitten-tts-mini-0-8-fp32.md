# androiddrew/kitten-tts-mini-0.8-fp32

## Resumen

Kitten TTS Mini 0.8 fp32 es una conversion del modelo de sintesis de voz KittenML/kitten-tts-mini-0.8, publicada por el usuario androiddrew. El modelo original se distribuye cuantizado a int8 mediante la cuantizacion dinamica de ONNX Runtime; con el proveedor CUDA, ONNX Runtime mantiene esas capas cuantizadas en la CPU, de modo que en una GPU el modelo int8 apenas acelera. Esta version deshace esa cuantizacion y devuelve todas las capas a coma flotante de 32 bits para que la red completa se ejecute en la GPU.

No se ha reentrenado ni ajustado nada: los pesos, las voces y el contrato de entrada/salida son identicos a los del modelo base, y el unico cambio esta en el grafo ONNX. El modelo base procede de KittenML, tiene alrededor de 80 millones de parametros, sigue la arquitectura StyleTTS 2 y se distribuye bajo licencia Apache-2.0.

La relevancia de este repositorio es de rendimiento en inferencia: en una RTX 4090 reduce el factor de tiempo real (RTF) de 0,392 a 0,051 en la mediana y el tiempo hasta el primer audio de 1,43 s a 0,22 s respecto al int8 original. Es, por tanto, una pieza de infraestructura para desplegar TTS de bajos parametros en GPU, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (modelo base), exportado a grafo ONNX |
| Parametros totales | ~80 millones (heredados del modelo base KittenML/kitten-tts-mini-0.8) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo TTS; recibe texto completo, no una ventana de contexto autoregresiva) |
| Tipos de cuantizacion | fp32 (este repositorio); fp16 en repo hermano; int8 en el modelo original |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fichero .onnx, repo de 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es StyleTTS 2, segun la documentacion del modelo base de KittenML. El repositorio que nos ocupa no modifica ni reentrena esa arquitectura: el script convert.py reescribe el grafo ONNX con el paquete onnx, sustituyendo cada capa cuantizada por su equivalente en coma flotante. Los patrones reemplazados son DynamicQuantizeLinear -> MatMulInteger -> Cast -> Mul (135 instancias, reemplazadas por MatMul), DynamicQuantizeLinear -> ConvInteger -> Cast -> Mul (74 instancias, reemplazadas por Conv) y DynamicQuantizeLSTM del dominio com.microsoft (6 instancias, reemplazadas por LSTM). Cada peso se desquantiza con la formula W = (W_int8 - zero_point) x scale, usando las escalas y los puntos cero almacenados en el grafo original; los pesos del LSTM se transponen al formato estandar de ONNX. Despues se eliminan los cuantizadores y los pesos int8, y todo lo demas queda intacto, incluidas las entradas y salidas (input_ids, style y speed a la entrada; waveform y duration a la salida) y las operaciones de ruido aleatorio.

Es importante subir que esta conversion no puede recuperar el modelo original en coma flotante: el redondeo a int8 de los pesos esta incrustado y es irreversible. Lo unico que elimina es la cuantizacion de las activaciones en tiempo de ejecucion, de modo que la salida debe sonar como la del modelo int8, no mejor. La conversion se hizo a partir de la revision c02725660cea441db4c383af69f1f26f5cd00947 del original, con onnx 1.19.0, numpy y onnxruntime 1.29.0 como dependencias fijadas. No hay informacion disponible sobre el dataset, el numero de tokens ni el proceso de alineacion o RLHF del entrenamiento original en la informacion proporcionada.

## Capacidades

- Sintesis de texto a voz (text-to-speech) con salida de forma de onda de audio y una salida adicional de duracion.
- Ocho voces predefinidas: Bella, Jasper, Luna, Bruno, Rosie, Hugo, Kiki y Leo.
- Control de estilo mediante la entrada style y control de velocidad mediante la entrada speed.
- Ejecucion en GPU mediante ONNX Runtime con el proveedor CUDA, o en CPU con cualquier runtime ONNX que ejecute el modelo original.
- Compatibilidad como sustituto directo del original: mismo formato de config.json, mismas entradas, mismas salidas y mismas voces.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision ni audio de entrada. Es exclusivamente un modelo de sintesis de voz.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Narracion por voz en aplicaciones interactivas: el modelo sintetiza frases con las ocho voces incluidas y permite ajustar la velocidad, lo que resulta util para asistentes leidos en tiempo real donde el tiempo hasta el primer audio importa.
- Generacion de audiolibros o podcasts automatizados por lotes: el RTF mediano de 0,051 en una RTX 4090 permite producir minutos de audio en una fraccion del tiempo real, adecuado para procesar volumenes grandes de texto.
- Lectura de notificaciones y avisos en aplicaciones de escritorio o moviles con GPU: al ser un grafo ONNX de unos 0,3 GB, se puede desplegar localmente sin servicio en la nube.
- Accesibilidad: conversion de texto a voz para lectores de pantalla o interfaces para personas con discapacidad visual, con seleccion de voz y velocidad.
- Locucion de respuestas en asistentes conversacionales: la baja latencia de arranque (0,22 s de mediana hasta el primer audio) reduce la sensacion de espera en dialogos por turnos.
- Generacion de voces para prototipado de videojuegos o demos: las voces fijas y la entrada de estilo permiten producir muestras rapidas sin depender de servicios externos.
- Preproduccion de contenido en pipelines de CI: al ser un modelo pequeno y determinista en su contrato, se puede integrar en un flujo automatizado de generacion de assets de audio.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados corresponden a las mediciones del autor con gokittentts bench (ONNX Runtime 1.29.1 con CUDA 12, 19 peticiones de estilo conversacional x 5 ejecuciones, voz Bruno, en una RTX 4090). No se han publicado resultados de benchmarks de calidad (MOS, similitud espectral frente al original) en la informacion disponible.

| Variante | RTF p50 | RTF p95 | Tiempo hasta el primer audio p50 | Tiempo hasta el primer audio p95 |
|---|---|---|---|---|
| int8 (original) | 0,392 | 0,522 | 1,43 s | 2,61 s |
| fp32 (este repositorio) | 0,051 | 0,108 | 0,22 s | 0,28 s |
| fp16 (repo hermano) | 0,068 | 0,146 | 0,30 s | 0,40 s |

El factor de tiempo real (RTF) es el tiempo de sintesis por segundo de audio, de modo que valores mas bajos indican mayor velocidad. En esta GPU, fp32 resulta mas rapido que fp16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB solo para los pesos en fp32 (unos 80 millones de parametros), mas el espacio de activaciones y buffers del grafo. En la practica cabe con holgura en cualquier GPU con 2 GB o mas. La variante fp16 reduce el peso de los pesos a la mitad.
- GPU recomendadas: RTX 4090 (validada por el autor), cualquier GPU NVIDIA con soporte CUDA 12 para onnxruntime-gpu. No se han publicado mediciones en A100, H100 u otras GPU.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna e incluso en graficos integrados, dado el tamano del modelo.
- Ejecucion en CPU: si, funciona en cualquier ONNX Runtime que ejecute el modelo original, aunque sin la aceleracion medida en GPU.
- Opciones de despliegue: onnxruntime-gpu (con proveedor CUDA) y onnxruntime en CPU; la libreria KittenTTS (backend="cuda" disponible en la rama main, no en las versiones 0.8 ni 0.8.1); y gokittentts, que permite declarar el modelo en config.yaml. Para otras plataformas existen conversiones independientes, como la de mlx-community para MLX.
- Latencia y throughput: con la voz Bruno y el corpus de 19 peticiones en una RTX 4090, RTF mediano de 0,051 (p95 de 0,108) y 0,22 s de mediana hasta el primer audio (p95 de 0,28 s). No se dispone de cifras de throughput agregado ni de latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | RTF p50 (RTX 4090) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| androiddrew/kitten-tts-mini-0.8-fp32 (este) | ~80 M | ONNX fp32 | 0,051 | Apache-2.0 | HuggingFace, 0 descargas |
| KittenML/kitten-tts-mini-0.8 (original) | ~80 M | ONNX int8 | 0,392 | Apache-2.0 | HuggingFace y ModelScope |
| androiddrew/kitten-tts-mini-0.8-fp16 | ~80 M | ONNX fp16 | 0,068 | Apache-2.0 | HuggingFace |
| mlx-community/kitten-tts-mini-0.8 | ~80 M | MLX | no disponible | no disponible | HuggingFace |
| KittenML/kitten-tts-micro-0.8 | ~40 M | ONNX | no disponible | Apache-2.0 | HuggingFace |

Todas las variantes comparten los pesos y las voces del modelo base de KittenML; la diferencia entre la variante fp32 y la fp16 es de velocidad y de huella en disco y memoria, no de calidad esperada del audio.

## Limitaciones y advertencias

- La calidad del audio no esta verificada frente al original: el autor indica que aun no se ha ejecutado una comparacion lado a lado con el int8 original con ruido con semilla, duraciones coincidentes y distancia espectral. Hasta que se ejecute validate.py, el audio debe tratarse como no verificado.
- El redondeo a int8 de los pesos es irreversible, por lo que esta conversion no mejora la calidad respecto al modelo original; solo elimina la cuantizacion de activaciones en tiempo de ejecucion.
- El modelo esta pensado para GPU: en CPU funciona, pero sin la ganancia de rendimiento documentada.
- No se dispone de informacion sobre idiomas soportados, sesgos de las voces ni cobertura linguistica; el catalogo de voces no implica soporte multilingue.
- No hay datos de sesgo, de alucinacion ni de robustez ante entradas anomalas, porque se trata de un modelo de sintesis y no de generacion de texto.
- Licencia Apache-2.0, que permite uso comercial, pero los pesos, las voces (voices.npz) y la autoria intelectual del modelo pertenecen a KittenML; Kitten TTS se apoya en la arquitectura StyleTTS 2.
- Repositorio de terceros con 0 descargas y 0 likes en el momento de la consulta; config.json difiere del original unicamente en model_file y name. Se recomienda fijar una revision concreta en lugar de depender de main.
- El autor recomienda usar el repositorio fp16 si se busca reducir a la mitad la descarga y el uso de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/androiddrew/kitten-tts-mini-0.8-fp32
- Variante fp16 del mismo autor: https://huggingface.co/androiddrew/kitten-tts-mini-0.8-fp16
- Modelo base: https://huggingface.co/KittenML/kitten-tts-mini-0.8
- Modelo base en ModelScope: https://www.modelscope.cn/models/KittenML/kitten-tts-mini-0.8
- Modelo micro de la misma familia: https://huggingface.co/KittenML/kitten-tts-micro-0.8/blob/main/README.md
- Repositorio KittenTTS: https://github.com/KittenML/KittenTTS
- Herramienta de benchmark y servidor gokittentts: https://github.com/androiddrew/gokittentts
- Conversion a MLX de la comunidad: https://huggingface.co/mlx-community/kitten-tts-mini-0.8/blob/main/README.md
