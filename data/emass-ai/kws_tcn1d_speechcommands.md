# emass-ai/kws_tcn1d_speechcommands

## Resumen

`kws_tcn1d_speechcommands` es un modelo de deteccion de palabras clave (keyword spotting) desarrollado por emass-ai para validar su cadena de herramientas ECS-Compiler y la placa ECS-DoT EVB. Se trata de una red convolucional 1-D temporal de apenas 18.516 parametros que clasifica un segundo de audio a 16 kHz en 12 clases: diez palabras clave (`down`, `go`, `left`, `no`, `off`, `on`, `right`, `stop`, `up`, `yes`) mas las clases especiales `_silence_` y `_unknown_`. El modelo no es un LLM ni un sistema de reconocimiento de voz general, sino un clasificador acustico de vocabulario cerrado pensado para microcontroladores y dispositivos de borde.

La arquitectura aplica convoluciones con kernel asimetrico (1xk) y stride a lo largo del eje temporal, tratando los coeficientes MFCC como canales de entrada. El modelo se distribuye como ONNX (73,7 KB en float32) y se compila a int8 con ECS-Compiler para ejecutarse parcialmente en la unidad DLA de la placa ECS-DoT, con un tiempo de inferencia medido de 1,61 ms y un tamano de libreria compilada de 45,3 KB.

Su relevancia es acotada pero concreta: sirve como referencia reproducible para evaluar el pipeline de cuantizacion y despliegue de ECS-Studio, y como ejemplo de diseno TinyML para wake-word en hardware de muy bajos recursos. No esta pensado como producto ni ha sido validado para usos finales especificos, segun indica el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1-D temporal: Conv 1x7/4 10->32 +BN -> ReLU -> Conv 1x3 32->40 +BN -> ReLU -> Conv 1x3/2 40->64 +BN -> ReLU -> Flatten (64x6) -> Linear 12 -> Softmax |
| Parametros totales | 18.516 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 1 segundo de audio (49 frames MFCC x 10 coeficientes) |
| Tipos de cuantizacion | int8 (compilado con ECS-Compiler); float32 (ONNX original) |
| Idiomas soportados | no disponible (clasificador de palabras clave en ingles: down, go, left, no, off, on, right, stop, up, yes) |
| Licencia | Apache 2.0 (modelo); datos de entrenamiento CC-BY-4.0 |
| Formato de pesos | ONNX (`kws_tcn1d.onnx`); artefactos auxiliares en NPZ (calibracion, evaluacion, muestras) |

## Arquitectura y entrenamiento

La red es una CNN 1-D compacta que opera sobre representaciones MFCC. La entrada tiene forma `[1, 10, 1, 49]`: 10 coeficientes MFCC tratados como canales, altura 1 y 49 frames en el eje temporal. Las convoluciones usan kernels de 7, 3 y 3 con strides 4, 1 y 2 respectivamente, seguidas de normalizacion por lotes y ReLU, hasta un aplanado de 64x6 y una capa lineal final de 12 clases con softmax. El preprocesado es fijo y esta documentado con precision: STFT con ventana Hann de 480 muestras (30 ms) y hop de 320 (20 ms), 40 bandas mel entre 20 y 4000 Hz, logaritmo, DCT-II y retencion de los 10 primeros coeficientes, seguido de estandarizacion por coeficiente con media y desviacion tipica calculadas sobre el conjunto de entrenamiento.

El entrenamiento utiliza Speech Commands v0.02 (Pete Warden, arXiv:1804.03209), un corpus de palabras clave en ingles bajo licencia CC-BY-4.0. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste fino como RLHF o DPO; esos datos no estan disponibles. La innovacion tecnica principal no reside en la arquitectura, sino en el flujo de despliegue: compilacion con ECS-Compiler en ECS-Studio 1.140.0, cuantizacion int8 con un conjunto de calibracion propio y ejecucion repartida entre la DLA y la CPU de la placa ECS-DoT (7 capas en DLA, 1 en CPU).

## Capacidades

- Clasificacion de audio de vocabulario cerrado: identifica 10 palabras clave en ingles mas `_silence_` y `_unknown_` a partir de 1 segundo de audio a 16 kHz.
- Preprocesado acustico integrado en el pipeline documentado (MFCC con parametros fijos y estandarizacion por coeficiente).
- Inferencia en hardware de borde: compilable a int8 y ejecutable en la placa ECS-DoT EVB con la DLA.
- Reproducibilidad verificada: la salida en placa coincide con la salida esperada del compilador y con ONNX Runtime (similitud coseno >= 1.0000 en las muestras reales probadas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio general ni generacion de texto.
- Capacidades multilingues: no disponibles; el modelo esta entrenado sobre palabras clave en ingles.
- No dispone de modo thinking ni de capacidades generativas de ningun tipo.

## Casos de uso

- Wake-word en dispositivos empotrados: el modelo ocupa 45,3 KB de libreria compilada y ejecuta una inferencia en 1,61 ms en la ECS-DoT a 50 MHz, lo que permite activar un sistema mayor (por ejemplo, un decodificador de voz en la nube) solo cuando se detecta una palabra clave.
- Control por voz de electrodomesticos: las clases `on`, `off`, `up`, `down` y `stop` cubren comandos basicos de encendido, apagado y ajuste, adecuados para mandos de bajo coste sin conexion.
- Robotica de bajo consumo: las clases direccionales `left`, `right`, `go` y `stop` permiten comandos de navegacion simples en robots o vehiculos de juguete con microcontrolador.
- Validacion de pipelines TinyML: sirve como caso de referencia reproducible para evaluar ECS-Compiler, la cuantizacion int8 y la ejecucion en DLA antes de desplegar modelos propios.
- Sistemas de accesibilidad de vocabulario reducido: con 12 clases y alta precision (92,82% top-1 en el split oficial), puede emplearse en interfaces de comandos para usuarios con movilidad reducida, siempre que el vocabulario fijo sea suficiente.
- Filtrado previo en asistentes de voz: al descartar la clase `_unknown_` y `_silence_`, reduce el consumo energetico al evitar activar etapas posteriores de reconocimiento cuando no hay una palabra clave valida.
- Demostraciones y docencia en TinyML: el modelo, sus datos de calibracion y evaluacion y las muestras reales permiten ilustrar el ciclo completo de entrenamiento, cuantizacion y despliegue en hardware.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Precision top-1 (float, ONNX Runtime) | 92,82% | Speech Commands test split oficial (testing_list.txt), 12 clases balanceadas, 4.890 muestras |
| Precision top-1 (int8, placa) | 92,50% | Conjunto de evaluacion de 200 muestras |
| Precision top-1 (float, mismas 200 muestras) | 93,00% | ONNX Runtime |
| Concordancia placa vs ONNX Runtime | 199 de 200 muestras | Conjunto de evaluacion |
| Tiempo de inferencia | 1,61 ms | ECS-DoT EVB a 50 MHz, mediana de 204 ejecuciones de `dla_infer()` |
| Tamano de libreria compilada | 45,3 KB | `libdla.a`, 7 capas en DLA y 1 en CPU |
| Tamano del modelo float | 73,7 KB | ONNX float32 |

No se han publicado resultados comparativos con otros modelos de keyword spotting en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecutarse en microcontroladores, no en GPU.
- GPU recomendadas: no aplica para el caso de uso previsto; la ejecucion de referencia es en la placa ECS-DoT EVB (DLA + CPU a 50 MHz).
- Cabe en hardware de clase MCU: 73,7 KB en float32 y 45,3 KB de libreria compilada int8, muy por debajo de la memoria tipica de un microcontrolador de gama baja.
- Opciones de despliegue: ECS-Compiler dentro de ECS-Studio 1.140.0 o superior (flujo oficial verificado); ONNX Runtime para ejecucion en host (usado para la validacion float).
- Latencia y throughput: 1,61 ms por inferencia en la ECS-DoT EVB (mediana de 204 ejecuciones); no se han publicado datos de throughput para otras plataformas.
- Para ejecucion en GPU o servidor no se proporcionan requisitos ni mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia cualitativa, el modelo se situa en la categoria de clasificadores de keyword spotting de vocabulario cerrado para TinyML, pero no se han publicado comparaciones con alternativas como Google Speech Commands baseline, DS-CNN o modelos similares en la documentacion disponible.

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kws_tcn1d_speechcommands | 18.516 | 1 s de audio (49 frames MFCC) | 92,82% top-1 (float) | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo es una herramienta de validacion de ECS-Compiler y la placa ECS-DoT; el autor indica explicitamente que no es un producto y que no ha sido probado para ningun uso final concreto.
- Vocabulario cerrado de 10 palabras en ingles mas `_silence_` y `_unknown_`; no reconoce lenguaje natural ni palabras fuera de ese conjunto.
- Entrada fija de 1 segundo de audio a 16 kHz con preprocesado MFCC muy especifico; cualquier desviacion en el pipeline de preprocesado degradara la precision.
- La precision cae ligeramente al cuantizar a int8 (92,50% frente a 93,00% en las mismas 200 muestras), con una discrepancia en 1 de cada 200 muestras respecto a ONNX Runtime.
- No hay informacion publicada sobre sesgos acusticos, robustez frente a ruido, acentos o condiciones de grabacion adversas; el dataset Speech Commands tiene una distribucion de hablantes y condiciones limitada.
- Riesgo de falsos positivos y falsos negativos inherente a la clasificacion de audio; no se documentan tasas de error por clase.
- La licencia del modelo es Apache 2.0, pero los datos de entrenamiento (Speech Commands) estan bajo CC-BY-4.0, lo que puede imponer obligaciones de atribucion en determinados usos.
- No se proporcionan garantias de soporte ni mantenimiento; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- El flujo de compilacion depende de ECS-Studio 1.140.0 o superior y de la placa ECS-DoT EVB; no se documenta compatibilidad con otras toolchains.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emass-ai/kws_tcn1d_speechcommands
- Modelo ONNX: https://huggingface.co/emass-ai/kws_tcn1d_speechcommands/resolve/main/kws_tcn1d.onnx?download=true
- Conjunto de calibracion: https://huggingface.co/emass-ai/kws_tcn1d_speechcommands/resolve/main/kws_tcn1d_train.npz?download=true
- Conjunto de evaluacion: https://huggingface.co/emass-ai/kws_tcn1d_speechcommands/resolve/main/kws_tcn1d_test.npz?download=true
- Muestras reales ejecutadas en placa: https://huggingface.co/emass-ai/kws_tcn1d_speechcommands/resolve/main/sample_input.npz?download=true
- Licencia: https://huggingface.co/emass-ai/kws_tcn1d_speechcommands/resolve/main/LICENSE?download=true
- Dataset Speech Commands v0.02: http://download.tensorflow.org/data/speech_commands_v0.02.tar.gz
- Paper de Speech Commands (Warden, 2018): https://arxiv.org/abs/1804.03209
