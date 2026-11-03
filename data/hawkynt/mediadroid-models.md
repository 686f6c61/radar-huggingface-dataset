# Hawkynt/mediadroid-models

## Resumen

MediaDroid Models es un repositorio de modelos preconvertidos para MediaDroid, un reproductor multimedia para Android que reproduce peliculas y series desde almacenamiento local y recursos de red compartidos. El repositorio no contiene un modelo de lenguaje ni un sistema de IA generativa: aloja una red neuronal de interpolacion de fotogramas (RIFE 4.25 lite) exportada a TensorFlow Lite y ONNX, pensada para ejecutarse en el propio dispositivo movil durante la reproduccion de video.

El modelo subyacente es RIFE (Real-time Intermediate Flow Estimation), desarrollado por hzwer en el proyecto Practical-RIFE, una red que estima el flujo optico entre dos fotogramas consecutivos y sintetiza el fotograma intermedio en t = 0.5. La version incluida aqui es la variante "lite" de la release 4.25, con una resolucion de entrada de 768 x 640 (576p con padding a multiplo de 128) y salida float32.

La relevancia de este repositorio es acotada y practica: ofrece artefactos listos para produccion (TFLite y ONNX) con una verificacion numerica documentada frente a PyTorch (diferencia media de 0.00008 en un par de prueba), lo que facilita integrar interpolacion de fotogramas en aplicaciones Android sin tener que reproducir el pipeline de conversion. No es un modelo de proposito general ni compite en la categoria de LLM o modelos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RIFE 4.25 lite (red de estimacion de flujo optico e interpolacion de fotogramas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision por fotograma, sin contexto textual) |
| Tipos de cuantizacion | float32 unicamente; la conversion a float16 "salio mal" y no se ofrece |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT (Copyright (c) 2021 hzwer) |
| Formato de pesos | TFLite (~29 MB) y ONNX opset 17 (~23 MB) |

## Arquitectura y entrenamiento

La red es RIFE 4.25 lite, una arquitectura de interpolacion de fotogramas basada en estimacion de flujo optico intermedio. Recibe dos fotogramas consecutivos (`img0`, `img1`) y produce el fotograma intermedio correspondiente a t = 0.5. En la version TFLite la entrada es NHWC de 1x640x768x3 en float32 con rango [0,1]; en la version ONNX la entrada es NCHW de 1x3x640x768 en float32. La salida replica la forma de la entrada.

El proceso de conversion esta documentado en el repositorio: los pesos de la release 4.25.lite (`flownet.pkl`) se cargaron como tensores en una implementacion de la arquitectura publicada (`tools/rife_net.py`), se exportaron a ONNX y se convirtieron con onnx2tf. Para la conversion se sustituyeron los factores de escala por tamanos, se fijaron como constantes la rejilla de identidad y el plano temporal, y se ajusto el padding del warp a coordenadas clampadas con padding cero. La validacion frente a PyTorch en un par de prueba arroja una diferencia media de 0.00008, con un 0.08 % de valores que difieren en mas de 1/255. No se detalla el dataset de entrenamiento original de RIFE en la informacion disponible.

## Capacidades

- Interpolacion de fotogramas de video: genera el fotograma intermedio entre dos consecutivos, lo que permite aumentar la tasa de fotogramas aparente (por ejemplo, de 24 a 48 o 60 fps) en reproduccion.
- Ejecucion en dispositivo movil: los artefactos TFLite estan pensados para Android y pueden desplegarse en CPU, GPU o NPU segun el hardware.
- Entrada de resolucion fija 768 x 640 (576p con padding a multiplo de 128); otras resoluciones requieren remuestreo previo.
- Exportacion dual: TFLite para inferencia en movil y ONNX para validacion o despliegue en servidor/escritorio.
- No soporta tool calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision semantica, audio ni modo thinking. Es exclusivamente un modelo de interpolacion de fotogramas.

## Casos de uso

- Reproduccion de video con interpolacion en Android: MediaDroid activa el modelo solo cuando un autotest en Ajustes determina que el dispositivo es lo bastante rapido; en caso contrario desactiva la opcion e informa del tiempo medido. El modelo se usa para duplicar la tasa de fotogramas en tiempo de reproduccion.
- Postprocesado offline de video en movil: dado que un fotograma intermedio tarda unos 1,7 s en CPU en un Snapdragon 865, el modelo es viable para procesar clips cortos por lotes en el dispositivo, no para tiempo real en hardware antiguo.
- Prototipado en escritorio con ONNX: la version ONNX opset 17 permite validar el pipeline de interpolacion en Python antes de empaquetar la app o de comparar contra la implementacion PyTorch original.
- Investigacion en interpolacion de fotogramas: sirve como referencia de conversion fiel de RIFE a TFLite, con metricas de divergencia documentadas, para quienes necesiten portar modelos de vision a movil.
- Integracion en reproductores de terceros: cualquier app Android que quiera ofrecer interpolacion puede reutilizar los artefactos bajo licencia MIT, siempre que respete la atribucion a hzwer.
- Benchmark de hardware movil: el modelo puede usarse como carga de prueba para medir el rendimiento de CPU, GPU y NPU de un dispositivo en tareas de vision densa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no se trata de un modelo de lenguaje. El unico dato de rendimiento documentado es el siguiente:

| Metrica | Valor |
|---|---|
| Diferencia media TFLite vs PyTorch (par de prueba) | 0.00008 |
| Valores con diferencia > 1/255 | 0.08 % |
| Latencia por fotograma intermedio en Galaxy S20 (Snapdragon 865, CPU) | ~1,7 s |
| Latencia en GPU/NPU de dispositivos mas recientes | no disponible |

## Requisitos de hardware

- VRAM/RAM estimada: el modelo TFLite ocupa ~29 MB y el ONNX ~23 MB; el consumo en ejecucion depende del runtime y del hardware, pero es del orden de decenas a pocos cientos de MB.
- GPU recomendadas: no se especifican. En movil se apunta a NPU y GPU de dispositivos recientes; en escritorio, cualquier GPU con soporte ONNX Runtime o TensorFlow Lite GPU delegate.
- Cabe en GPU de consumo: si, cualquier GPU moderna puede ejecutar la version ONNX; en movil depende del delegado disponible.
- Opciones de despliegue: TensorFlow Lite (Android, con delegados CPU/GPU/NPU) y ONNX Runtime (opset 17).
- Latencia y throughput: ~1,7 s por fotograma en CPU de Snapdragon 865; no se documentan cifras para GPU o NPU. No es apto para tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RIFE 4.25 lite (este repo) | Interpolacion de fotogramas | no disponible | 768 x 640 fijo | MIT | TFLite + ONNX |
| Real-ESRGAN General x4v3 (qualcomm) | Superresolucion 4x | no disponible | variable | BSD-3-Clause | TFLite 8-bit |
| Practical-RIFE (original) | Interpolacion de fotogramas | no disponible | variable | MIT | PyTorch |

La comparacion con modelos de lenguaje no procede. Frente a Practical-RIFE original, este repositorio ofrece artefactos ya convertidos y validados para movil, a costa de fijar la resolucion de entrada y limitarse a float32. Frente a Real-ESRGAN, la tarea es distinta (interpolacion temporal frente a superresolucion espacial), aunque ambos se usan en pipelines de mejora de video en Android.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso en ese sentido es invalido.
- Resolucion de entrada fija de 768 x 640; otras resoluciones deben remuestrearse, lo que puede introducir artefactos.
- Solo se ofrece float32; la conversion a float16 resulto incorrecta y no esta disponible.
- Latencia alta en hardware antiguo (~1,7 s por fotograma en Snapdragon 865), lo que limita su uso a reproduccion asistida o procesado por lotes, no a tiempo real en esos dispositivos.
- Riesgo de artefactos visuales en escenas con oclusiones, movimiento rapido o patrones repetitivos, inherente a la interpolacion de flujo optico.
- No se documentan sesgos, ya que no procesa texto ni datos semanticos, pero hereda los del dataset de entrenamiento original de RIFE, no detallado aqui.
- Licencia MIT permite uso comercial con atribucion a hzwer (Copyright (c) 2021 hzwer); debe conservarse el aviso de licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-03; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Hawkynt/mediadroid-models
- Proyecto MediaDroid: https://github.com/Hawkynt/MediaDroid
- Practical-RIFE (hzwer): https://github.com/hzwer/Practical-RIFE
- Real-ESRGAN General x4v3 (qualcomm): https://huggingface.co/qualcomm/Real-ESRGAN-General-x4v3
- Real-ESRGAN (xinntao): https://github.com/xinntao/Real-ESRGAN
