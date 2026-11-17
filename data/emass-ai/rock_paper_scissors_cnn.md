# emass-ai/rock_paper_scissors_cnn

## Resumen

`rock_paper_scissors_cnn` es una red neuronal convolucional minima desarrollada por emass-ai para clasificar imagenes de 32x32 en escala de grises que muestran una mano con piedra, papel o tijera. No es un modelo de lenguaje ni un sistema multimodal: es un clasificador de imagenes de 13.459 parametros (53,5 KB en float) disenado especificamente como caso de validacion del compilador ECS-Compiler y de la placa ECS-DoT EVB, el flujo de herramientas de emass-ai para despliegue de TinyML en microcontroladores.

Su relevancia no esta en la capacidad predictiva bruta (la tarea es trivial: manos generadas por ordenador sobre fondo blanco), sino en servir como referencia reproducible de un pipeline completo de cuantizacion int8, compilacion a biblioteca estatica (`libdla.a`) y ejecucion en hardware con acelerador DLA. El modelo alcanza 4,44 ms de latencia por inferencia en la ECS-DoT a 50 MHz y 100,00% de top-1 en el split de test oficial del dataset de Laurence Moroney (372 imagenes).

La arquitectura es deliberadamente simple: dos convoluciones con stride 2, BatchNorm plegada en los pesos, activaciones ReLU y una capa lineal final. Esto lo convierte en un ejemplo didactico de CNN para vision embebida, no en una herramienta para produccion real con camaras o fondos complejos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN: Conv 9x9 s2 (1->16, 32->12) + BN + ReLU; Conv 3x3 s2 p1 (16->48, 12->6) + BN + ReLU; Flatten(1728); Linear 1728->3; Softmax |
| Parametros totales | 13.459 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes) |
| Tipos de cuantizacion | int8 (calibracion incluida en `rock_paper_scissors_cnn_train.npz`); pesos originales en float32 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 (dataset de entrenamiento bajo CC BY 2.0) |
| Formato de pesos | ONNX (`rock_paper_scissors_cnn.onnx`); sets de calibracion y evaluacion en `.npz` |
| Entrada | `input` [1, 1, 32, 32] float32, NCHW, escala de grises |
| Salida | `output` [1, 3] float32 con etiquetas `paper`, `rock`, `scissors` |
| Preprocesado | RGB 300x300 -> luma (PIL convert L) -> downscale box a 32x32 -> normalizacion x = (pixel/255 - 0.4441) / 0.2421 |
| Tamano del modelo | 53,5 KB (float); 37,9 KB de biblioteca compilada int8 |
| Hardware verificado | ECS-DoT EVB (DLA + CPU, 50 MHz) |

## Arquitectura y entrenamiento

La red es una CNN secuencial muy compacta. La primera convolucion usa kernel 9x9 con stride 2 y reduce el mapa de 32x32 a 12x12 con 16 canales. La segunda, de 3x3 con stride 2 y padding 1, pasa a 6x6 con 48 canales. Tras el aplanado (1728 elementos) hay una unica capa lineal a 3 clases y una softmax. Las BatchNorm estan plegadas en los pesos de convolucion (zero-mean weights) y solo se usan activaciones ReLU, lo que simplifica la implementacion en el acelerador. De las 6 capas, 5 se ejecutan en la DLA y 1 en la CPU.

El entrenamiento se realizo sobre el dataset Rock Paper Scissors de Laurence Moroney (2020), compuesto por imagenes generadas por ordenador de manos sobre fondo blanco. El split de test oficial tiene 372 imagenes. No se documenta en la model card el numero de tokens ni el proceso de optimizacion (no hay RLHF ni DPO porque no es un modelo generativo); tampoco se detalla el numero exacto de imagenes de entrenamiento ni la funcion de perdida. La innovacion tecnica destacable no esta en el modelo sino en el flujo de compilacion: ECS-Compiler (engine 0.6.0) genera una biblioteca estatica con cuantizacion int8 calibrada sobre un conjunto de 200 muestras (`rock_paper_scissors_cnn_test.npz`), con verificacion bit a bit contra ONNX Runtime.

## Capacidades

- Clasificacion de imagenes en escala de grises de 32x32 en tres clases: `paper`, `rock`, `scissors`.
- Inferencia en hardware embebido (ECS-DoT EVB) con acelerador DLA, 4,44 ms por llamada a `dla_infer()`.
- Cuantizacion int8 con calibracion reproducible incluida en el repositorio.
- Ejecucion en ONNX Runtime en float32 con paridad exacta respecto a la salida en placa (similitud coseno 1,0000 o superior en las muestras verificadas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni capacidades multilingues.
- No es un modelo generativo: no produce texto ni codigo.

## Casos de uso

- Validacion de toolchain TinyML: usar el modelo como smoke test del pipeline ECS-Compiler (carga de ONNX, calibracion int8, build y upload a la placa) antes de desplegar modelos propios mas complejos. La reproducibilidad esta garantizada por el fingerprint de build `d39e6394a000`.
- Docencia de vision embebida: ejemplo minimo y completo de CNN con convoluciones, BatchNorm plegada y capa densa para explicar cuantizacion int8 y despliegue en microcontroladores sin la complejidad de modelos mayores.
- Benchmark de aceleradores: medir latencia (4,44 ms) y tamano de biblioteca (37,9 KB) como referencia base al comparar la ECS-DoT con otras placas o configuraciones de reloj.
- Demostracion de interaccion gestual controlada: en un entorno de laboratorio con fondo blanco y manos sinteticas o muy controladas, integrar el clasificador en un juego de piedra-papel-tijera como prueba de concepto de entrada visual.
- Verificacion de paridad numerica: comprobar que la salida int8 en placa coincide con ONNX Runtime en float, usando `sample_input.npz` como conjunto de regresion en CI del propio flujo de compilacion.
- Prototipado de preprocesado: reutilizar la pipeline documentada (luma, downscale box, normalizacion con constantes 0,4441 y 0,2421) como referencia para otros clasificadores de gestos de bajo coste.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Top-1 accuracy (float, ONNX Runtime) | 100,00% | Split de test oficial, 372 imagenes |
| Top-1 accuracy (int8, ECS-DoT EVB) | 100,00% | Conjunto de evaluacion de 200 muestras |
| Acuerdo con ONNX Runtime en placa | 200/200 muestras | Conjunto de evaluacion int8 |
| Similitud coseno en muestras reales | >= 1,0000 | 3 muestras reales en placa |
| Latencia de inferencia | 4,44 ms | Mediana de 204 ejecuciones, ECS-DoT a 50 MHz |
| Tamano de biblioteca compilada | 37,9 KB | `libdla.a`, 5 capas en DLA + 1 en CPU |
| Tamano del modelo float | 53,5 KB | Pesos originales |

No se han publicado comparaciones con otros modelos en la informacion disponible. El propio autor advierte que el 100% es un resultado facil por tratarse de imagenes sinteticas sobre fondo blanco.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para microcontroladores, no para GPU.
- Hardware verificado: ECS-DoT EVB con DLA y CPU a 50 MHz; biblioteca compilada de 37,9 KB.
- GPU recomendadas: no aplica. Para ejecucion en float basta CPU con ONNX Runtime.
- Cabe en cualquier microcontrolador con al menos ~40 KB de flash para la biblioteca int8 y ~54 KB para los pesos float, mas el runtime de ECS-Compiler.
- Opciones de despliegue: ECS-Studio 1.140.0 o superior con ECS-Compiler (flujo oficial verificado); ONNX Runtime para inferencia en float fuera de placa.
- Latencia: 4,44 ms por inferencia en la ECS-DoT EVB (mediana de 204 ejecuciones). No se documenta throughput agregado ni latencia en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| `emass-ai/rock_paper_scissors_cnn` | 13.459 | 32x32 gris | Apache 2.0 | ECS-DoT EVB, ONNX Runtime | Verificado en placa, 4,44 ms, 100% en test sintetico |
| MobileNetV1/V2 (variantes TinyML) | ~0,3-3,5 M | 96x96 a 224x224 RGB | Apache 2.0 | TFLite Micro, ONNX | Mucho mayores; no caben en MCU de gama baja sin recorte agresivo |
| MNIST CNN tipicas (referencia docente) | ~10-50 K | 28x28 gris | variable | TFLite Micro, ONNX | Similares en tamano pero tarea distinta (digitos) |
| no disponible | no disponible | no disponible | no disponible | no disponible | No hay comparaciones publicadas en la informacion disponible |

La comparativa con modelos de la misma categoria (clasificadores TinyML de 3 clases) no esta documentada por el autor; las alternativas citadas son referencias generales de la literatura, no comparaciones medidas en el mismo hardware.

## Limitaciones y advertencias

- El 100% de accuracy se obtuvo sobre imagenes generadas por ordenador con fondo blanco; el propio autor advierte que fotografias reales con fondos complejos requeriran mas datos de entrenamiento.
- Entrada fija de 32x32 en escala de grises: no admite imagenes de mayor resolucion ni color sin preprocesado adicional.
- Solo tres clases y sin capacidad de rechazo: cualquier imagen se clasifica como piedra, papel o tijera, incluidas imagenes sin mano.
- No es un producto: el autor indica explicitamente que se proporciona para evaluar y validar ECS-Compiler y la ECS-DoT, y que no ha sido probado para ningun uso final concreto.
- La licencia Apache 2.0 cubre el modelo, pero el dataset de entrenamiento mantiene su propia licencia CC BY 2.0, que debe respetarse en cualquier redistribucion.
- No hay informacion sobre sesgos demograficos, variedad de tonos de piel ni condiciones de iluminacion en el dataset original; la generalizacion fuera del dominio sintetico es desconocida.
- La latencia de 4,44 ms esta medida unicamente en la ECS-DoT EVB a 50 MHz; no hay datos para otras placas.
- El flujo de compilacion esta atado a ECS-Studio 1.140.0 y ECS-Compiler engine 0.6.0; versiones distintas pueden alterar el resultado y romper la reproducibilidad del fingerprint `d39e6394a000`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emass-ai/rock_paper_scissors_cnn
- ONNX del modelo: https://huggingface.co/emass-ai/rock_paper_scissors_cnn/resolve/main/rock_paper_scissors_cnn.onnx
- Conjunto de calibracion: https://huggingface.co/emass-ai/rock_paper_scissors_cnn/resolve/main/rock_paper_scissors_cnn_train.npz
- Conjunto de evaluacion: https://huggingface.co/emass-ai/rock_paper_scissors_cnn/resolve/main/rock_paper_scissors_cnn_test.npz
- Muestras reales verificadas en placa: https://huggingface.co/emass-ai/rock_paper_scissors_cnn/resolve/main/sample_input.npz
- Dataset Rock Paper Scissors (Laurence Moroney): https://laurencemoroney.com/datasets.html
- No se han encontrado en la informacion disponible enlaces a papers, blogs o repositorios adicionales del autor.
