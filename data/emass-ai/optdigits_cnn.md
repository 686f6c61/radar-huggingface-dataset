# emass-ai/optdigits_cnn

## Resumen

`optdigits_cnn` es una red neuronal convolucional (CNN) minima publicada por emass-ai para clasificar digitos manuscritos del dataset UCI Optical Recognition of Handwritten Digits (optdigits). No es un modelo de lenguaje: es un clasificador de imagenes de 8x8 pixeles en escala de grises (valores enteros de 0 a 16) que predice una de las diez clases de digito (0-9). Su interes no reside en la precision bruta sino en su papel como banco de pruebas: el modelo se distribuye como carpeta lista para ECS-Compiler, el pipeline de IA de ECS-Studio, y se ha verificado sobre hardware fisico (ECS-DoT EVB).

La arquitectura es deliberadamente diminuta: dos convoluciones 3x3 con normalizacion por lotes y ReLU, un aplanado y una capa lineal final con softmax. En total, 9.930 parametros y 39,7 KB en coma flotante. El modelo se compila a int8 para el acelerador DLA del ECS-DoT, donde una inferencia tarda 1,48 ms (mediana de 204 ejecuciones a 50 MHz) y la libreria compilada ocupa 34,3 KB.

Es relevante ahora como ejemplo reproducible de despliegue TinyML de extremo a extremo: incluye el ONNX, los conjuntos de calibracion y evaluacion, muestras reales y las huellas del build, de modo que cualquiera con ECS-Studio 1.140.0 puede repetir la compilacion y la validacion en placa. No esta pensado como producto ni como componente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN: Conv3x3 p1 1->16 + BN + ReLU (8x8); Conv3x3 s2 p1 16->32 + BN + ReLU (4x4); Flatten(512); Linear 512->10; Softmax |
| Parametros totales | 9.930 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija [1, 1, 8, 8]) |
| Tipos de cuantizacion | int8 (compilacion para DLA); pesos originales en float32 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 (los datos de entrenamiento conservan su propia licencia, CC BY 4.0) |
| Formato de pesos | ONNX (`optdigits_cnn.onnx`); conjuntos de calibracion y evaluacion en NPZ |

## Arquitectura y entrenamiento

La red es una CNN secuencial de cinco capas: una convolucion 3x3 con padding 1 que pasa de 1 a 16 canales sobre la entrada de 8x8, seguida de normalizacion por lotes y ReLU; una segunda convolucion 3x3 con stride 2 y padding 1 que pasa de 16 a 32 canales, reduciendo la resolucion a 4x4, con normalizacion por lotes y ReLU; un aplanado a 512 elementos; una capa lineal de 512 a 10; y una softmax final. La entrada se normaliza como `x = (count - 4.88) / 6.0`, donde `count` es el valor entero de pixel 0-16 del dataset optdigits, en formato NCHW [1, 1, 8, 8].

El entrenamiento se realizo sobre el dataset UCI Optical Recognition of Handwritten Digits (Alpaydin y Kaynak, 1998), con la particion oficial de 3.823 muestras de entrenamiento (`optdigits.tra`) y 1.797 de test (`optdigits.tes`). La model card no detalla hiperparametros, numero de epocas, funcion de perdida ni si hubo aumento de datos; esa informacion no esta disponible. La innovacion tecnica destacable no esta en el modelo sino en el flujo de despliegue: el repositorio incluye el conjunto de calibracion que usa el compilador para cuantizar a int8 y el conjunto de evaluacion para medir la deriva de precision tras la cuantizacion, ademas de las muestras reales ejecutadas en placa.

## Capacidades

- Clasificacion de imagenes de digitos manuscritos: recibe un bloque de 8x8 pixeles en escala de grises (valores 0-16) y devuelve un vector de 10 probabilidades, una por digito.
- Inferencia en hardware TinyML: el modelo compila a int8 para el acelerador DLA del ECS-DoT, con 5 capas en el DLA y 1 en la CPU.
- Verificacion reproducible: incluye ONNX, calibracion, evaluacion y muestras, con huella de build documentada (`210279fe53f5`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision general, audio ni otras modalidades fuera de la clasificacion de digitos 8x8.

## Casos de uso

- Validacion de la cadena de compilacion ECS-Compiler: sirve para comprobar que la version de ECS-Studio instala, compila, cuantiza y despliega correctamente en la ECS-DoT EVB antes de abordar modelos propios; el modelo card documenta el resultado esperado (98,50% en int8 sobre 200 muestras) como referencia.
- Prueba de regresion de hardware: al ser un modelo fijo y pequeno con salida determinista, permite detectar fallos en la placa o en el toolchain comparando la salida de la placa con ONNX Runtime (se acordo en 199 de 200 muestras).
- Docencia de TinyML: ejemplo minimo de CNN con convolucion, normalizacion por lotes, aplanado y capa densa, util para explicar cuantizacion int8 y despliegue en microcontroladores sin la complejidad de modelos mayores.
- Prototipado de reconocimiento de digitos en dispositivos de bajo consumo: con 34,3 KB de libreria compilada y 1,48 ms por inferencia, encaja en aplicaciones de digitalizacion de formularios o lectores de codigos postales sobre hardware embebido, siempre que la entrada se preprocese a bloques de 8x8.
- Benchmark de referencia para el acelerador DLA: permite medir latencia y ocupacion de memoria del DLA con una carga conocida y comparar con futuras revisiones del compilador.
- Verificacion de calibracion post-entrenamiento: los conjuntos `optdigits_cnn_train.npz` y `optdigits_cnn_test.npz` permiten estudiar como afecta la cuantizacion int8 a la precision (de 99,00% en float a 98,50% en int8 sobre las mismas 200 muestras).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision top-1 (float, ONNX Runtime, test completo de 1.797 muestras) | 98,78% |
| Precision top-1 (float, subconjunto de 200 muestras) | 99,00% |
| Precision top-1 (int8, placa ECS-DoT, subconjunto de 200 muestras) | 98,50% |
| Coincidencia placa vs. ONNX Runtime | 199 de 200 muestras |
| Tiempo de inferencia (int8, ECS-DoT EVB, mediana de 204 ejecuciones, 50 MHz) | 1,48 ms |
| Tamano de la libreria compilada (`libdla.a`) | 34,3 KB |
| Tamano del modelo en float | 39,7 KB |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido convencional; el modelo en float ocupa 39,7 KB y la libreria compilada int8 34,3 KB, por lo que cabe en la memoria de un microcontrolador.
- GPU recomendadas: no requiere GPU; la ejecucion de referencia es en la ECS-DoT EVB (DLA + CPU a 50 MHz).
- Cabe en GPU de consumo: si, cualquier GPU, aunque es irrelevante para su uso previsto; tambien se ejecuta en CPU con ONNX Runtime.
- Opciones de despliegue: ECS-Compiler (ECS-Studio 1.140.0 o posterior) para la ECS-DoT EVB; ONNX Runtime para la version float; no se documentan otros runtimes en la informacion disponible.
- Latencia y throughput: 1,48 ms por inferencia en la ECS-DoT EVB (mediana de 204 ejecuciones); no se proporcionan cifras de throughput para otras plataformas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia cualitativa, el modelo se situa en la categoria de CNNs minimas para clasificacion de digitos sobre optdigits o MNIST, pero no se han encontrado en la busqueda modelos equivalentes con los que establecer una comparacion numerica fiable.

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| optdigits_cnn | 9.930 | no aplica | 98,78% (float, test completo) | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor indica que el modelo se proporciona para evaluar y validar ECS-Compiler y la ECS-DoT, no como producto, y que no se ha probado para ningun uso final concreto.
- La entrada esta restringida a bloques de 8x8 pixeles con valores enteros 0-16 y un preprocesado especifico; no acepta imagenes de mayor resolucion sin un pipeline de segmentacion y reescalado externo.
- Solo clasifica digitos (10 clases); no reconoce letras, simbolos ni otros caracteres.
- La precision en placa (98,50%) es inferior a la del modelo en float (99,00%) sobre el mismo subconjunto, y la placa discrepa de ONNX Runtime en 1 de cada 200 muestras.
- No hay informacion sobre sesgos del dataset optdigits (por ejemplo, sesgos de escritura o de poblacion de origen) ni sobre su impacto en el rendimiento.
- El dataset de entrenamiento (optdigits, UCI) tiene licencia CC BY 4.0, distinta de la Apache 2.0 del modelo; conviene revisar las obligaciones de atribucion si se redistribuye.
- La reproducibilidad depende de mantener los ajustes por defecto de ECS-Compiler y la version 1.140.0 (motor 0.6.0) documentada; otras versiones pueden producir resultados distintos.
- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones en lenguaje natural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emass-ai/optdigits_cnn
- ONNX del modelo: https://huggingface.co/emass-ai/optdigits_cnn/resolve/main/optdigits_cnn.onnx?download=true
- Conjunto de calibracion: https://huggingface.co/emass-ai/optdigits_cnn/resolve/main/optdigits_cnn_train.npz?download=true
- Conjunto de evaluacion: https://huggingface.co/emass-ai/optdigits_cnn/resolve/main/optdigits_cnn_test.npz?download=true
- Muestras reales ejecutadas en placa: https://huggingface.co/emass-ai/optdigits_cnn/resolve/main/sample_input.npz?download=true
- Licencia: https://huggingface.co/emass-ai/optdigits_cnn/resolve/main/LICENSE?download=true
- Dataset UCI Optical Recognition of Handwritten Digits: https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits
- DOI del dataset: https://doi.org/10.24432/C50P49
