# mlboydaisuke/MODNet-OpenVINO

## Resumen

MODNet-OpenVINO es una conversión del modelo de segmentación de imagen MODNet (Matting Objective Decomposition Network) al formato OpenVINO IR, ONNX y blob precompilado para la NPU de Intel. El autor, mlboydaisuke, parte de la versión LiteRT publicada por litert-community (MODNet-LiteRT) y la transforma mediante tf2onnx 1.17.0 (opset 17) para que pueda ejecutarse en NPUs, GPUs y CPUs de Intel. MODNet es una arquitectura especializada en *image matting* (extracción de primer plano con canal alfa), no en segmentación semántica genérica, y este repositorio empaqueta los pesos con cuantización fp32 junto con los artefactos necesarios para desplegarlo.

El interés del modelo reside en su rendimiento en hardware de borde: el blob precompilado para la NPU Intel AI Boost ejecuta una inferencia en 16,60 ms, y la misma red vía ONNX Runtime con el Execution Provider de OpenVINO alcanza 15,80 ms. En la iGPU Intel se sitúa en 32,06 ms y en CPU en 68,72 ms. En una RTX 5080 Laptop con límite de 95 W baja a 8,59 ms usando una copia fp16 del ONNX (no incluida en el repositorio). El tamaño del repositorio es de 0,1 GB y los pesos ocupan unos 26,5 MB, lo que lo hace apto para despliegues ligeros en portátiles con Core Ultra.

El modelo no es un modelo de lenguaje ni un transformer generativo: es una red convolucional de matting pensada para producir una máscara alfa de alta calidad a partir de una imagen RGB. Su relevancia actual está en la integración con el ecosistema OpenVINO 2026.4.1 y en la posibilidad de ejecutarlo en NPUs de Intel sin recompilación, algo poco habitual en modelos de visión publicados en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MODNet (red convolucional para image matting; no disponible el detalle exacto de capas en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp32 (pesos OpenVINO IR); fp16 solo en la copia ONNX usada para la medicion en RTX 5080, no incluida en el repo |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17), OpenVINO IR (`.xml` + `.bin`), blob precompilado para NPU Intel |
| Tamano del repositorio | 0,1 GB |
| Tamano de los pesos | `modnet.onnx` 26.503.485 bytes; `modnet.xml` 1.442.411 bytes; `modnet.bin` 25.848.312 bytes; `modnet.blob` 19.796.097 bytes |
| Pipeline | image-segmentation |
| Libreria | openvino |
| Modelo base | litert-community/MODNet-LiteRT (relacion: quantized) |

## Arquitectura y entrenamiento

MODNet es una red neuronal convolucional disenada especificamente para *image matting*, es decir, para separar el primer plano del fondo y estimar un canal alfa con bordes suaves. La informacion proporcionada no detalla la composicion interna de la red (numero de capas, bloques o mecanismos de atencion), por lo que no se puede confirmar si se trata de una variante concreta de MODNet o de una version lite. El modelo base es la version LiteRT publicada por litert-community, y este repositorio aplica una conversion de TensorFlow Lite a ONNX con tf2onnx 1.17.0 y opset 17, seguida de la generacion del IR de OpenVINO con pesos fp32 y de la compilacion de un blob para la NPU Intel.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens (no aplica), el uso de RLHF/DPO (no aplica) ni innovaciones tecnicas mas alla de la propia conversion. La validacion de la conversion se realizo comparando la salida del ONNX contra la del `.tflite` original con el interprete LiteRT en CPU, obteniendo un coseno >= 0,9999 en todas las salidas. Tambien se valido cada salida contra la salida de referencia en CPU con el Execution Provider de CPU de ONNX Runtime, con criterios de PASS: coseno >= 0,99, ausencia de NaN/Inf y acuerdo top-1 >= 0,99 para las puntuaciones de clase.

## Capacidades

- Segmentacion de imagen y *matting*: genera una mascara alfa de primer plano a partir de una imagen RGB, adecuada para recorte de sujetos y composicion.
- Inferencia en NPU Intel: el blob precompilado se importa con `core.import_model` sin recompilacion en el equipo destino (siempre que coincidan version de OpenVINO y driver de NPU).
- Inferencia en GPU Intel integrada y en CPU: el mismo ONNX funciona con ONNX Runtime y el OpenVINO Execution Provider.
- Inferencia en GPU NVIDIA: el ONNX se ejecuta con el CUDA Execution Provider (fp32 en 10,79 ms; fp16 en 8,59 ms en RTX 5080 Laptop a 95 W).
- Compatibilidad con Qualcomm AI Hub: los mismos archivos ONNX se han perfilado en NPUs Snapdragon X2 Elite y Galaxy S26.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.
- No dispone de modo *thinking*, vision multimodal, audio ni generacion de texto.

## Casos de uso

- Videollamadas y videoconferencia con fondo virtual: el modelo produce la mascara alfa por fotograma; a 16,60 ms por inferencia en NPU Intel permite superar los 30 FPS en un portatil Core Ultra sin cargar la CPU ni la GPU dedicada.
- Edicion fotografica y recorte automatico de sujetos: integrado en un pipeline de retoque, genera la mascara alfa para separar personas u objetos del fondo y componer sobre nuevas capas.
- Procesamiento por lotes en servidores sin GPU: con 68,72 ms por imagen en CPU (Core Ultra 9 386H) y un modelo de 26,5 MB, se pueden procesar catalogos de imagenes en maquinas sin acelerador dedicado.
- Previsualizacion en tiempo real en aplicaciones de escritorio: el blob precompilado se importa en 0,01 s, lo que permite cargar el modelo al arrancar la aplicacion y mantener latencias bajas en la NPU.
- Filtros y efectos en aplicaciones moviles o de borde: los perfiles en NPU Snapdragon X2 Elite (8,30 ms con QNN precompilado) y Galaxy S26 (8,86 ms) lo hacen viable para captura de camara en dispositivos con esos SoC.
- Automatizacion de *background removal* en herramientas de diseno: el ONNX se puede integrar en un servicio que reciba imagenes y devuelva la mascara alfa, usando ONNX Runtime con el EP de OpenVINO en infraestructura Intel existente.
- Segmentacion en pipelines de vision por computador: como etapa previa a la deteccion o al reencuadre automatico, la mascara alfa permite aislar el sujeto antes de pasarlo a otro modelo.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de latencia y comprobaciones de salida, no benchmarks de calidad de segmentacion (IoU, MSE, etc.). Se presentan a continuacion.

| Procesador | Runtime | Archivo | Latencia (ms) | Carga (s) | Comprobacion de salida |
|---|---|---|---|---|---|
| Intel AI Boost NPU | OpenVINO 2026.4.1 | blob (`import_model`) | 16,60 | 0,01 | PASS (cos >= 0,9999) |
| Intel AI Boost NPU | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` (compila al cargar) | 15,80 | 15,41 | PASS (cos >= 0,9999) |
| Intel Graphics (iGPU) | ONNX Runtime 1.31.1 + OpenVINO EP 1.8.1 | `.onnx` | 32,06 | 2,31 | PASS (cos >= 0,9985) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | copia fp16 del `.onnx` (no en el repo) | 8,59 | 1,17 | PASS (cos >= 0,9997) |
| RTX 5080 Laptop (95 W) | ONNX Runtime 1.31.1, CUDA EP | `.onnx` | 10,79 | 1,20 | PASS (cos >= 0,9999) |
| Core Ultra 9 386H CPU | ONNX Runtime 1.31.1, CPU EP | `.onnx` | 68,72 | 0,15 | referencia |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` compilado por AI Hub | 8,30 | 0,35 | no comparado |
| Snapdragon X2 Elite NPU | Qualcomm AI Hub, ONNX Runtime QNN EP | `.onnx` (compila al cargar) | 9,76 | 6,63 | no comparado |
| Galaxy S26 NPU | Qualcomm AI Hub, QNN ONNX precompilado | `.onnx` compilado por AI Hub | 8,86 | 0,21 | no comparado |

No se han publicado resultados de benchmarks de calidad de segmentacion (por ejemplo, IoU o SAD sobre datasets de matting) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el ONNX ocupa 26,5 MB y el blob 19,8 MB, por lo que la huella es minima en cualquier acelerador.
- GPU recomendadas: Intel AI Boost NPU (integrada en Core Ultra), iGPU Intel, RTX 5080 Laptop (medida a 95 W) y NPUs Qualcomm Snapdragon X2 Elite y Galaxy S26.
- Cabe en GPU de consumo: si, con un modelo de 26,5 MB es viable en cualquier GPU consumer; la medicion disponible es en una RTX 5080 Laptop.
- Opciones de despliegue: OpenVINO 2026.4.1 (nativo, con `import_model` del blob o `compile_model` del IR), ONNX Runtime 1.31.1 con OpenVINO EP 1.8.1, ONNX Runtime con CUDA EP, Qualcomm AI Hub para Snapdragon.
- Latencia y throughput estimados: 16,60 ms en NPU Intel (aproximadamente 60 inferencias por segundo en el mejor caso), 15,80 ms via ONNX Runtime + OpenVINO EP, 32,06 ms en iGPU, 68,72 ms en CPU, 8,59 ms en RTX 5080 Laptop con fp16.
- Nota de compatibilidad: el blob de NPU se compilo con OpenVINO 2026.4.1 y driver Intel NPU 32.0.100.4841 (NPU_DRIVER_VERSION 1004841, NPU_COMPILER_VERSION 524292); si `import_model` rechaza el blob en otra version o driver, hay que compilar el IR en la maquina destino.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de matting comparables en la informacion proporcionada. La unica alternativa documentada es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mlboydaisuke/MODNet-OpenVINO | no disponible | no aplica | ONNX, OpenVINO IR, blob NPU | Apache-2.0 | Conversion desde LiteRT; latencias medidas en NPU Intel, iGPU, CPU y RTX 5080 |
| litert-community/MODNet-LiteRT | no disponible | no aplica | TFLite (LiteRT) | Apache-2.0 | Modelo base; validado contra el ONNX con coseno >= 0,9999 |
| mlboydaisuke/MODNet-ExecuTorch | no disponible | no aplica | ExecuTorch | no disponible | Otra conversion del mismo autor, orientada a ExecuTorch |

## Limitaciones y advertencias

- Es un modelo de matting/segmentacion binaria de primer plano, no un modelo de segmentacion semantica por clases ni un modelo generativo; no responde a prompts de texto.
- No se han publicado metricas de calidad de segmentacion (IoU, SAD, MSE) en la informacion disponible; la validacion se limita a la equivalencia numerica con el modelo base.
- El blob de NPU esta atado a OpenVINO 2026.4.1 y al driver Intel NPU 32.0.100.4841; en otras versiones puede fallar `import_model` y hay que recompilar el IR, lo que anade tiempo de carga (15,41 s medidos con ONNX Runtime + OpenVINO EP).
- La medicion en RTX 5080 usa una copia fp16 del ONNX que no esta incluida en el repositorio; para reproducirla hay que generarla.
- Las filas de Snapdragon y Galaxy S26 son trabajos de perfilado de Qualcomm AI Hub con su propio temporizador y no se compararon contra la salida de referencia en CPU.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion (no aplica a un modelo de vision) ni limitaciones de idioma.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base LiteRT y de los datos de entrenamiento originales de MODNet antes de un despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 2026-11-07) sin validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mlboydaisuke/MODNet-OpenVINO
- Modelo base: https://huggingface.co/litert-community/MODNet-LiteRT/tree/4d5bd22bde15c8ae5e215ca4799513844979a431
- Conversion a ExecuTorch del mismo autor: https://huggingface.co/mlboydaisuke/MODNet-ExecuTorch
- Repositorio con scripts y mediciones de los 52 grafos de LiteRT-Models: https://github.com/john-rocky/windows-zoo
- Documentacion de modelos verificados para OpenVINO: https://docs.openvino.ai/2025/documentation/compatibility-and-support/supported-models.html
