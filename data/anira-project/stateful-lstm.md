# anira-project/stateful-lstm

## Resumen

Stateful LSTM es un modelo de red neuronal recurrente (LSTM con estado explícito) disenado para emular un amplificador de guitarra en tiempo real. Lo desarrolla el proyecto anira y sigue la arquitectura descrita por Wright et al. en "Real-Time Guitar Amplifier Emulation with Deep Learning" (2020). El modelo procesa audio por bloques de 2048 muestras manteniendo un estado interno de 20 unidades ocultas y 20 de celda (40 valores en total) que se realimenta entre llamadas consecutivas, lo que permite una respuesta continua sin artefactos en los bordes de bloque.

Su relevancia radica en la portabilidad: se distribuye en ocho formatos de inferencia distintos (ONNX Runtime, LiteRT/TFLite, LibTorch, ExecuTorch con backends CPU XNNPACK, Core ML y Vulkan, y Core ML nativo), todos verificados numéricamente contra ONNX Runtime con desviaciones del orden de 5e-7 a 7e-7. Esto lo convierte en un ejemplo de referencia para despliegue de efectos de audio en plataformas muy dispares, desde moviles Apple hasta GPUs con Vulkan, con latencias medidas de 0,85 ms (Core ML) a 2,9 ms (ExecuTorch CPU) por bloque.

El modelo es extremadamente pequeno (los pesos ONNX ocupan 10,5 KB; el TFLite 5,5 MB por desplegar el LSTM sin plegar) y no es un modelo de lenguaje: no procesa texto ni tiene capacidades generativas. Es una pieza de infraestructura de audio dentro del ecosistema anira.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM stateful (arquitectura de Wright et al., 2020), 20 unidades ocultas |
| Parametros totales | no disponible (pesos ONNX de 10.501 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa bloques de 2048 muestras de audio |
| Tipos de cuantizacion | no disponible (exportaciones en float32; Core ML float32) |
| Idiomas soportados | no aplica (modelo de audio) |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX, TFLite (LiteRT), TorchScript/LibTorch (.pt), ExecuTorch (.pte), Core ML (.mlpackage) |

## Arquitectura y entrenamiento

El modelo es una LSTM de una sola capa con 20 unidades ocultas que opera sobre muestras de audio individuales dentro de un bloque de 2048. La entrada es `audio_in [2048,1,1]` (tiempo, batch, canal) junto con `state_in [1,40]`; la salida es `audio_out [2048,1,1]` y `state_out [1,40]`. El estado (h y c, 20 cada uno) se inicializa a cero al comenzar un flujo y se realimenta como `state_in` en cada llamada posterior, garantizando continuidad entre bloques.

El entrenamiento se realizo sobre la grabacion TS9 de GuitarML (licencia GPL-3.0), segun se indica en el NOTICE del repositorio. No se detallan en la informacion disponible el numero de tokens (muestras), la composicion exacta del dataset ni si hubo etapas de RLHF/DPO (no aplicables a este dominio). La innovacion tecnica principal no esta en el entrenamiento sino en la exportacion: `torch.export` desenrolla la LSTM sobre los 2048 pasos del bloque, generando miles de operadores pequenos; para evitarlo, los programas de ExecuTorch usan `ScanLstm`, que expresa la recurrencia con `torch.scan` y se ejecuta como un bucle sobre un paso, delegando la proyeccion de entrada y la capa de salida al delegado. Core ML conserva la LSTM como un unico operador nativo `lstm`.

## Capacidades

- Emulacion de amplificador de guitarra en tiempo real sobre bloques de 2048 muestras.
- Procesamiento stateful: mantiene coherencia entre llamadas mediante realimentacion de estado (h, c).
- Inferencia multiplataforma: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch (CPU XNNPACK, Core ML, Vulkan) y Core ML nativo.
- Verificacion numerica entre formatos: desviacion maxima de 5,7e-7 (ONNX frente al TorchScript original) y de 5,2e-7 a 7,3e-7 para el resto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Efectos de guitarra en tiempo real en escritorio: integracion via ONNX Runtime o LibTorch en un host de audio (por ejemplo, un plugin VST/CLAP) que llame al modelo por bloques de 2048 muestras, realimentando el estado entre bloques para evitar discontinuidades.
- Aplicaciones moviles en iOS: uso del paquete Core ML nativo o del programa ExecuTorch Core ML, con 0,85 ms por llamada, adecuado para procesar audio en tiempo real en un iPhone sin agotar la bateria.
- Despliegue en Android y dispositivos embebidos: el formato TFLite (LiteRT) con 1,9 ms por llamada permite ejecutar el efecto en moviles de gama media y placas tipo Raspberry Pi.
- Procesamiento en GPUs mediante Vulkan: el programa ExecuTorch Vulkan esta exportado para GPUs, util en entornos de escritorio Linux con drivers Vulkan donde se quiera descargar la CPU.
- Referencia para desarrolladores de audio: el repositorio incluye scripts de exportacion (`export/export.py`, `export_litert.py`, `export_executorch.py`, `export_coreml.py`) y comprobaciones (`export/check.py`, `tools/check_streaming.py`) que sirven como plantilla para portar otros modelos stateful a multiples runtimes.
- Investigacion en emulacion de amplificadores: permite reproducir y comparar la arquitectura de Wright et al. con variantes propias, ya que los notebooks de entrenamiento estan en el repositorio fuente `vackva/stateful-lstm`.
- Pruebas de integracion en pipelines de CI: los SHA256 publicados por fichero y las verificaciones de streaming permiten validar que una build concreta produce exactamente las mismas salidas que la referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible en el sentido habitual (MMLU, HumanEval, GSM8K). Los datos de rendimiento disponibles son medidas de latencia y desviacion numerica por formato:

| Formato | Motor | Latencia por llamada (2048 muestras) | Desviacion maxima frente a ONNX Runtime |
|---|---|---|---|
| ONNX | ONNX Runtime | no disponible | 5,7e-7 (frente al TorchScript original, 20 bloques) |
| LibTorch | LibTorch (traced, estado explicito) | no disponible | 0 (frente al original) |
| LiteRT | TensorFlow Lite | 1,9 ms | 7,3e-7 |
| ExecuTorch CPU | XNNPACK + bucle scan | 2,9 ms | 6,7e-7 |
| ExecuTorch Core ML | Core ML (Apple, float32) | 0,85 ms | 5,2e-7 |
| ExecuTorch Vulkan | Vulkan (GPUs) | no ejecutado (sin runtime Vulkan en la verificacion) | no disponible |
| Core ML nativo | Core ML ML program | no disponible | 5,2e-7 |

Nota: el export directo con `torch.export` sin la optimizacion `ScanLstm` tardo 190 ms por llamada en Core ML, motivo por el que se introdujo el bucle scan.

## Requisitos de hardware

- VRAM/RAM: el modelo es minimo; los pesos ONNX ocupan 10,5 KB y el `.pte` de ExecuTorch CPU 17,7 KB. Cabe holgadamente en cualquier dispositivo.
- GPU recomendadas: no requiere GPU. En GPU solo tiene sentido el backend Vulkan de ExecuTorch; el paso de 20 unidades es demasiado pequeno para aprovechar una GPU, segun indica el propio autor.
- GPU consumer: cabe en cualquier GPU consumer e integrada, pero no se recomienda su uso por el bajo paralelismo del paso recurrente.
- Opciones de despliegue: ONNX Runtime, LiteRT/TensorFlow Lite, LibTorch, ExecuTorch 1.3.1 (CPU XNNPACK, Core ML, Vulkan), Core ML nativo y el runtime de anira (backends v2.4.0).
- Latencia: 0,85 ms por bloque en Core ML, 1,9 ms en LiteRT, 2,9 ms en ExecuTorch CPU. Para audio a 48 kHz, un bloque de 2048 muestras equivale a 42,7 ms, por lo que estas latencias dejan margen amplio en tiempo real.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de otros modelos comparables (parametros, contexto, rendimiento, licencia) para establecer una tabla rigurosa. Como referencia cualitativa, la arquitectura sigue a Wright et al. (2020) para emulacion de amplificadores con LSTM, y el repositorio fuente es `vackva/stateful-lstm`; no se aportan cifras de modelos alternativos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anira-project/stateful-lstm | no disponible | bloques de 2048 muestras | 0,85-2,9 ms por bloque segun backend | GPL-3.0 | Hugging Face + GitHub |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso fuera del procesamiento de audio carece de sentido.
- Licencia GPL-3.0: el software que distribuya estos pesos puede quedar sujeto a los terminos de la GPL; es necesario revisarlo antes de un uso comercial o de integrarlo en productos propietarios.
- Los pesos se entrenaron sobre la grabacion TS9 de GuitarML, tambien GPL-3.0; ver NOTICE.md para las obligaciones de atribucion.
- El estado debe realimentarse correctamente entre llamadas; los ficheros originales en `upstream/` pierden el estado entre bloques y no deben usarse para streaming.
- El backend Vulkan esta exportado pero no se ha ejecutado en la verificacion del autor (sin runtime Vulkan disponible); su correccion numerica no esta confirmada en ese entorno.
- El modelo emula un amplificador concreto (TS9); no es un emulador generico de amplificadores ni admite condicionamiento por parametros.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma porque no aplican a este dominio; no hay informacion sobre robustez frente a entradas fuera de distribucion (audio no guitarristico).

## Enlaces

- Hugging Face: https://huggingface.co/anira-project/stateful-lstm
- Repositorio fuente: https://github.com/vackva/stateful-lstm (commit `3ce7bec`, carpeta `models/model_0/`)
- Referencia arquitectonica: Wright et al., "Real-Time Guitar Amplifier Emulation with Deep Learning" (2020)
- Dataset de entrenamiento: grabacion TS9 de GuitarML (GPL-3.0)
- Runtime de anira: anira-project/backends v2.4.0
- Descarga con revision fijada: https://huggingface.co/anira-project/stateful-lstm/resolve/<revision>/onnx/stateful_lstm.onnx
