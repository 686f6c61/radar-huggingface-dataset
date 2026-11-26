# anira-project/stateful-lstm

## Resumen

Stateful LSTM es un modelo de red neuronal recurrente (LSTM) de muy pequeno tamano disenado especificamente para emular un amplificador o efecto de guitarra electrica en tiempo real. Lo desarrolla el proyecto anira, una infraestructura de inferencia de audio de baja latencia, y sigue la arquitectura propuesta por Wright et al. en "Real-Time Guitar Amplifier Emulation with Deep Learning" (2020). No es un modelo de lenguaje: es un procesador de senal de audio que transforma muestras de entrada en muestras de salida aplicando la respuesta no lineal de un amplificador real.

El modelo se distribuye en multiples formatos de exportacion (ONNX, LiteRT/TFLite, LibTorch, ExecuTorch para CPU, Core ML y Vulkan, y Core ML nativo) con el objetivo de servir como ejemplo de referencia de redes con estado en anira. Su innovacion principal es que el estado interno del LSTM (h y c, 20 unidades cada uno) se expone como tensores explicitos de entrada y salida (`state_in [1,40]`, `state_out [1,40]`), lo que permite inferencia por bloques consecutivos sin perder la continuidad temporal entre llamadas, algo critico en procesamiento de audio en streaming.

Es relevante porque demuestra un patron de despliegue de modelos de audio en tiempo real sobre dispositivos muy diversos, desde moviles Apple con Core ML (0,85 ms por bloque de 2048 muestras) hasta GPUs via Vulkan o CPUs con XNNPACK (2,9 ms por bloque). El modelo es extremadamente ligero (el fichero ONNX ocupa 10.501 bytes) y esta pensado para integrarse en cadenas de efectos de guitarra de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (recurrente, 20 unidades ocultas, estado explicito h y c) |
| Parametros totales | no disponible (fichero ONNX de 10.501 bytes; modelo de muy pequeno tamano) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa bloques de 2048 muestras de audio (`audio_in [2048,1,1]`) |
| Tipos de cuantizacion | no disponible (los ficheros exportados son float32; Core ML ejecuta en float32) |
| Idiomas soportados | no aplica (modelo de audio, no de texto) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX, TFLite (LiteRT), LibTorch (.pt), ExecuTorch (.pte), Core ML (.mlpackage) |

## Arquitectura y entrenamiento

El modelo es un LSTM de una sola capa con 20 unidades ocultas que procesa audio muestra a muestra dentro de bloques de 2048 muestras con forma `[time, batch, channel]`. La entrada y la salida son senal de audio mono; el estado recurrente se transporta entre bloques mediante un tensor plano de 40 valores (20 para h y 20 para c). El modelo original de TorchScript mantenia el estado internamente (`self.hidden`), lo que solo funcionaba en LibTorch; las exportaciones a ONNX, LiteRT y ExecuTorch reiniciaban el estado a cero en cada bloque. La version actual reexporta el mismo LSTM con el estado como tensores explicitos, lo que permite alimentar la salida de estado de una llamada como entrada de la siguiente y mantener la continuidad exacta entre bloques consecutivos.

El modelo se entreno sobre una grabacion de un pedal TS9 de GuitarML (licencia GPL-3.0), siguiendo el enfoque de emulacion de amplificadores con redes recurrentes de Wright et al. (2020). No se dispone de informacion sobre el numero de tokens o muestras de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a este dominio). La innovacion tecnica destacable es la estrategia de exportacion: `torch.export` desenrolla el LSTM sobre los 2048 pasos del bloque en miles de operadores pequenos, lo que resulta inviable en ExecuTorch (Core ML tardaba 190 ms por llamada con ese enfoque). Para evitarlo, los programas de ExecuTorch usan `ScanLstm`, que expresa la recurrencia como `torch.scan` y se ejecuta como un bucle sobre un unico paso: el delegado toma la proyeccion de entrada y la capa de salida, y el bucle corre sobre los kernels de CPU de ExecuTorch. El programa de Core ML mantiene el LSTM como un unico operador que se convierte al `lstm` nativo de Core ML.

## Capacidades

- Emulacion de amplificador o efecto de guitarra en tiempo real: transforma audio de entrada en audio procesado con la respuesta no lineal del amplificador emulado.
- Procesamiento de audio en streaming por bloques: mantiene el estado recurrente entre llamadas consecutivas mediante `state_in`/`state_out`, sin discontinuidades.
- Inferencia multi-plataforma: un mismo modelo exportado a ONNX Runtime, LiteRT/TFLite, LibTorch, ExecuTorch (CPU con XNNPACK, Core ML y Vulkan) y Core ML nativo.
- Ejecucion en CPU, GPU y aceleradores Apple: el programa de ExecuTorch con Core ML corre en float32 a 0,85 ms por bloque; el de CPU con XNNPACK y bucle de scan a 2,9 ms por bloque; LiteRT a 1,9 ms por bloque.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de audio, no de lenguaje.
- No dispone de modo thinking, vision ni audio de entrada en sentido generativo; su unica tarea es el procesado de senal.

## Casos de uso

- Pedal de distorsion o overdrive en software: el modelo emula la respuesta de un TS9 sobre la senal de guitarra, procesando bloques de 2048 muestras con estado continuo; es adecuado por su tamano minimo y su latencia de milisegundos en Core ML y LiteRT.
- Plugin de DAW en tiempo real: integrado mediante ONNX Runtime o LibTorch, permite aplicar el efecto sobre la pista de guitarra con latencia inferior a 3 ms por bloque en CPU, compatible con cadenas de efectos en directo.
- Aplicacion movil de efectos de guitarra: la exportacion a Core ML (0,85 ms por bloque) y a ExecuTorch CPU permite ejecutar el modelo en iPhone o iPad sin GPU dedicada, manteniendo el estado entre bloques para evitar clics.
- Prototipado de cadenas de efectos en anira: sirve como ejemplo de referencia de red con estado en la infraestructura anira, util para validar el patron `state_in`/`state_out` antes de portar modelos de mayor tamano.
- Emulacion de amplificadores en dispositivos embebidos: la exportacion a LiteRT/TFLite (5,5 MB) y a ExecuTorch Vulkan permite desplegar el efecto en hardware con Android o GPUs integradas, con verificacion de continuidad sobre doce bloques consecutivos.
- Investigacion en emulacion de audio con deep learning: el modelo y sus scripts de exportacion y verificacion (`check.py`, `check_streaming.py`) permiten reproducir y comparar tecnicas de exportacion de LSTMs con estado en distintos runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido de metricas de calidad (MMLU, HumanEval, etc.), que no aplican a este modelo. La model card si proporciona mediciones de latencia y desviacion numerica respecto a ONNX Runtime:

| Formato | Ficheros | Desviacion maxima respecto a ONNX Runtime | Latencia por bloque de 2048 muestras |
|---|---|---|---|
| ONNX Runtime (frente al TorchScript original, 20 bloques) | `onnx/stateful_lstm.onnx` | 5,7e-7 | no disponible |
| LibTorch (trazado, estado explicito) | `libtorch/stateful_lstm.pt` | 0 (frente al original) | no disponible |
| LiteRT, TensorFlow Lite | `litert/stateful_lstm.tflite` | 7,3e-7 | 1,9 ms |
| ExecuTorch, CPU (XNNPACK y bucle de scan) | `executorch/stateful_lstm.pte` | 6,7e-7 | 2,9 ms |
| ExecuTorch, Core ML (Apple, float32) | `executorch/stateful_lstm_coreml.pte` | 5,2e-7 | 0,85 ms |
| ExecuTorch, Vulkan (GPUs) | `executorch/stateful_lstm_vulkan.pte` | exportado; no ejecutado (sin runtime Vulkan) | no disponible |
| Core ML ML program (motor nativo de anira, previsto para v3) | `coreml/stateful_lstm.mlpackage` | 5,2e-7 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable; el fichero ONNX ocupa 10.501 bytes y el TFLite 5,5 MB. Cabe en cualquier GPU consumer y en memoria de un movil.
- GPU recomendadas: cualquiera; el programa Vulkan de ExecuTorch esta pensado para GPUs integradas o dedicadas, aunque el paso de 20 unidades es demasiado pequeno para aprovechar una GPU de forma eficiente (la model card indica que un paso de 20 unidades es demasiado pequeno para una GPU).
- Cabe en GPU consumer: si, en cualquier GPU consumer (RTX 4090, RTX 3060, integradas) y tambien en CPU y aceleradores Apple.
- Opciones de despliegue: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch 1.3.1 (CPU con XNNPACK, Core ML y Vulkan), Core ML nativo y el runtime de anira (`anira-project/backends` v2.4.0).
- Latencia y throughput: 0,85 ms por bloque de 2048 muestras en Core ML, 1,9 ms en LiteRT y 2,9 ms en ExecuTorch CPU; el throughput no se especifica, pero a 48 kHz un bloque de 2048 muestras dura unos 42,7 ms, por lo que la latencia de computo queda muy por debajo del tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / bloque | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| anira-project/stateful-lstm | no disponible (ONNX 10.501 bytes) | 2048 muestras | GPL-3.0 | Hugging Face, multiples formatos | LSTM con estado explicito, emulacion de amplificador |
| Wright et al. (2020), arquitectura de referencia | no disponible | no disponible | no disponible | paper | Arquitectura original en la que se basa este modelo |
| GuitarML TS9 (grabacion de entrenamiento) | no aplica | no aplica | GPL-3.0 | dataset de audio | Fuente de entrenamiento citada en la model card |

No se dispone de informacion sobre otros modelos comparables de emulacion de amplificadores con estado explicito en la informacion proporcionada; los datos de la tabla se limitan a lo documentado en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser un modelo de audio, no aplican sesgos linguisticos, pero su comportamiento esta limitado al amplificador emulado (TS9) y a la distribucion de la grabacion de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo es de artefactos o respuestas no realistas ante senales fuera de la distribucion de entrenamiento (por ejemplo, instrumentos distintos de la guitarra o niveles de entrada muy distintos).
- Limitaciones de contexto o idioma: no procesa texto ni idiomas; su "contexto" es el estado recurrente de 40 valores, que se reinicia a cero al inicio de cada stream.
- Restricciones de licencia: GPL-3.0; el modelo se entreno sobre la grabacion TS9 de GuitarML, tambien GPL-3.0. El software que distribuya estos pesos puede tener que cumplir los terminos de la GPL; conviene verificarlo antes de usarlo en produccion.
- Caveat de produccion: las exportaciones antiguas en `upstream/` (ONNX, LiteRT y ExecuTorch originales) pierden el estado entre llamadas; deben usarse las exportaciones actuales con `state_in`/`state_out`. El programa Vulkan se exporto pero no se ejecuto por falta de runtime Vulkan en el entorno de verificacion. El Core ML nativo de anira llegara con la version v3. Se recomienda fijar una revision y comprobar el SHA256 de cada fichero al descargar.

## Enlaces

- Hugging Face: https://huggingface.co/anira-project/stateful-lstm
- Repositorio fuente (vackva/stateful-lstm): https://github.com/vackva/stateful-lstm
- Script de exportacion: https://github.com/anira-project/models/blob/main/models/stateful-lstm/export/lstm.py
- Script de verificacion: https://github.com/anira-project/models/blob/main/models/stateful-lstm/export/check.py
- Modelos de anira: https://github.com/anira-project/models
- Paper de referencia: Wright et al., "Real-Time Guitar Amplifier Emulation with Deep Learning", 2020 (no se proporciona URL en la informacion disponible)
- GuitarML (grabacion TS9, GPL-3.0): no se proporciona URL en la informacion disponible
- Runtime de backends de anira: anira-project/backends v2.4.0 (no se proporciona URL en la informacion disponible)
