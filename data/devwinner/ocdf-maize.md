# devwinner/ocdf-maize

## Resumen

OCDF maize es un clasificador de imagenes de enfermedades foliares del maiz basado en EfficientNet-B0, convertido a LiteRT (TensorFlow Lite) para ejecutarse de forma totalmente offline en un telefono movil. Lo desarrolla Aniekan Winner Anietie (usuario `devwinner`) como parte del proyecto OCDF, que incluye un modelo companero para la yuca (`devwinner/ocdf-cassava`). El modelo distingue cinco clases: virus del rayado del maiz (M01), tizon norteño (M02), mancha gris de la hoja (M03), roya comun (M04) y maiz sano (M05).

El problema que aborda es la clasificacion de patologias del maiz en entornos con conectividad limitada, tipicos de la agricultura de subsistencia en Africa subsahariana. Al estar empaquetado como archivo TFLite de 7,8 MiB en FP16, cabe en un telefono de gama media y funciona sin conexion. Su relevancia tecnica radica en que se publica con una evaluacion pre-registrada de transferencia entre fuentes de imagen (Tanzania, Ghana), lo que documenta de forma transparente la degradacion de rendimiento fuera del dominio de entrenamiento.

La arquitectura es una CNN EfficientNet-B0 preentrenada en ImageNet y afinada sobre 15.219 imagenes de maiz de campo tanzano y de PlantVillage. No es un modelo generativo ni un LLM: es un clasificador de imagenes de 224x224 píxeles con salida de 5 logits. Su licencia CC BY 4.0 permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN, clasificacion de imagenes) |
| Parametros totales | no disponible (EfficientNet-B0 estandar, del orden de 5,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224x224x3) |
| Tipos de cuantizacion | FP16 (desplegado), INT8 completa (ficheros de comparacion) |
| Idiomas soportados | no aplica (clasificacion de imagenes, sin texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | TFLite / LiteRT (`.tflite`), FP16 e INT8 |
| Entrada | float32 `[1, 224, 224, 3]`, RGB, valores 0-255, redimensionado bilineal con padding centrado (`tf.image.resize_with_pad`) |
| Salida | 5 logits en orden M01-M05 |
| Post-procesado | `softmax(logits / 0.8557)`; absteccion si `max(p) < 0.5` |
| Tamano del fichero desplegado | 7,8 MiB (FP16) |
| Libreria | LiteRT (`ai-edge-litert`) |

## Arquitectura y entrenamiento

EfficientNet-B0 preentrenada en ImageNet y afinada sobre 15.219 imagenes de maiz (tras agrupacion y exclusiones), procedentes de imagenes de campo tanzanas y de PlantVillage, ambas con licencia CC0. Las imagenes casi duplicadas se agruparon para que ningun grupo cruzara entre particiones de entrenamiento y test, evitando fuga de datos. La eleccion de EfficientNet-B0 frente a MobileNetV2 y MobileNetV3-Small se hizo mediante una regla pre-declarada, con semilla 42 fijada de antemano, lo que refuerza la reproducibilidad del diseno experimental.

El proyecto tiene dos fases: la fase 1 entrena el modelo base y la fase 2 introduce aumento de datos por cambio de dominio (shift-augmented), congelado antes del test sellado. El modelo desplegado es el FP16 de fase 1; la version INT8 completa fallo el presupuesto de precision pre-declarado y se conserva solo como comparacion. El pipeline de inferencia incluye temperatura de calibracion (0,8557) y umbral de absteccion (0,5) definidos en `config.json`.

## Capacidades

- Clasificacion de imagenes de hojas de maiz en cinco clases: virus del rayado, tizon norteño, mancha gris, roya comun y sano.
- Inferencia totalmente offline en dispositivo movil mediante LiteRT.
- Calibracion de confianza mediante temperatura y absteccion cuando la probabilidad maxima es inferior a 0,5.
- Ejecucion en CPU de un solo hilo con latencias de decenas de milisegundos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un clasificador de imagenes.
- No tiene capacidades multilingues ni procesamiento de texto.

## Casos de uso

- Diagnostico de campo offline en zonas rurales: un agricultor fotografia una hoja con el movil y obtiene una prediccion local sin conexion, gracias a los 7,8 MiB del modelo y a su latencia de 19,8 ms en un Galaxy S24.
- Aplicaciones moviles de extension agraria: integracion del `.tflite` en apps Android o iOS para triaje inicial de enfermedades antes de derivar a un especialista, usando la absteccion como senal de "consulta a un experto".
- Investigacion en transferencia de dominio: el modelo y sus resultados pre-registrados sirven como linea base para estudiar la degradacion de rendimiento entre fuentes de imagen (macro-F1 de 0,956 interno frente a 0,690 en test sellado de Ghana).
- Filtrado previo en pipelines de teledeteccion o drones: clasificacion rapida de capturas de hojas para priorizar imagenes que requieran analisis experto.
- Educacion y formacion agricola: herramienta de demostracion para ensenar a identificar visualmente sintomas de enfermedades del maiz con retroalimentacion inmediata.
- Despliegue en dispositivos de bajo coste: el modelo corre en CPU de un solo hilo (85,8 ms en un Pixel 3), lo que permite integrarlo en hardware modesto sin GPU.
- Punto de partida para fine-tuning local: el autor documenta que decenas de imagenes etiquetadas por clase recuperan gran parte de la perdida entre fuentes, lo que lo hace util como base para adaptacion a nuevas regiones.

## Benchmarks y rendimiento

Macro-F1 con intervalos bootstrap del 95 % para el fichero desplegado:

| Conjunto de evaluacion | Macro-F1 | Intervalo 95 % |
|---|---|---|
| Test interno | 0,956 | [0,935, 0,975] |
| Ghana CCMT (fuente nueva) | 0,809 | [0,782, 0,832] |
| Ghana KaraAgro (test sellado) | 0,690 | [0,673, 0,707] |
| ECE, interno → CCMT | 0,003 → 0,08 | no disponible |

Latencia con 1 hilo de CPU:

| Dispositivo | Latencia |
|---|---|
| Galaxy S24 | 19,8 ms |
| Pixel 3 | 85,8 ms |
| Portatil | 6,2 ms |

## Requisitos de hardware

- Inferencia en CPU: no requiere GPU; el modelo esta pensado para ejecucion en dispositivo.
- VRAM estimada: no aplica; el fichero FP16 ocupa 7,8 MiB y se ejecuta en memoria RAM del telefono.
- GPU recomendadas: no aplica para el caso de uso previsto; en servidor puede ejecutarse en CPU convencional.
- Cabe en cualquier telefono de gama media o alta (validado en Galaxy S24 y Pixel 3) y en portatiles.
- Opciones de despliegue: LiteRT / TensorFlow Lite (`ai-edge-litert`), con scripts de inferencia en NumPy puro y una herramienta CLI en el repositorio de GitHub.
- Latencia: 19,8 ms (Galaxy S24), 85,8 ms (Pixel 3), 6,2 ms (portatil) con un hilo de CPU. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/Entrada | Licencia | Notas |
|---|---|---|---|---|---|
| OCDF maize (desplegado) | EfficientNet-B0 FP16 | no disponible | 224x224x3 | CC BY 4.0 | Macro-F1 interno 0,956; test sellado 0,690 |
| OCDF maize (INT8) | EfficientNet-B0 INT8 | no disponible | 224x224x3 | CC BY 4.0 | Fallo el presupuesto de precision pre-declarado |
| OCDF maize shift (FP16) | EfficientNet-B0 con aumento de dominio | no disponible | 224x224x3 | CC BY 4.0 | Congelado antes del test sellado |
| OCDF maize shift MobileNetV2 | MobileNetV2 INT8 | no disponible | 224x224x3 | CC BY 4.0 | Comparador mas pequeno del proyecto |
| OCDF cassava | no disponible | no disponible | no disponible | CC BY 4.0 | Modelo companero para yuca |

Los datos de rendimiento de los comparadores internos no se detallan en la informacion disponible; solo se indica su papel en el estudio.

## Limitaciones y advertencias

- La precision cae en imagenes de fuentes nuevas y la confianza del modelo no lo senala: el ECE pasa de 0,003 interno a 0,08 en CCMT.
- Confusion entre fuente y clase: el virus del rayado procede de una unica fuente de desarrollo, y el tizon, la mancha gris y la roya solo de imagenes de laboratorio de PlantVillage.
- La absteccion no detecta de forma fiable entradas desconocidas como otras enfermedades, plagas u otros cultivos.
- Atajo de fondo: en una fuente de test las hojas sanas se fotografiaron mayoritariamente sobre papel, lo que puede sesgar la prediccion; se recomienda fotografiar hojas en su entorno real.
- No habia imagenes de campo de Nigeria ni de otras zonas de Africa Occidental con etiquetas de expertos para entrenamiento ni test.
- Esta pensado para investigacion en clasificacion offline de enfermedades; no es un servicio de diagnostico ni de asesoramiento y no esta validado para ninguna explotacion ni region concreta.
- Antes de usarlo en una region nueva, hay que evaluarlo con un conjunto pequeno de imagenes locales etiquetadas por expertos y afinarlo; en el estudio, decenas de imagenes por clase recuperaron gran parte de la perdida entre fuentes.
- Uso comercial permitido con atribucion (citar el DOI).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devwinner/ocdf-maize
- Modelo companero (yuca): https://huggingface.co/devwinner/ocdf-cassava
- Codigo, registros y documentacion: https://github.com/DevaWinner/ocdf-cassava-maize
- Release archivada (DOI): https://doi.org/10.5281/zenodo.24546864
- Metodos: https://github.com/DevaWinner/ocdf-cassava-maize/blob/v1.0.0/docs/METHODS.md
- Resultados: https://github.com/DevaWinner/ocdf-cassava-maize/blob/v1.0.0/docs/RESULTS.md
- Registro de congelacion de fase 2: https://github.com/DevaWinner/ocdf-cassava-maize/blob/v1.0.0/protocol/frozen_choices_v3.json
- Inferencia en NumPy: https://github.com/DevaWinner/ocdf-cassava-maize/blob/v1.0.0/src/ocdf/inference.py
- Herramienta CLI: https://github.com/DevaWinner/ocdf-cassava-maize/blob/v1.0.0/scripts/predict.py
