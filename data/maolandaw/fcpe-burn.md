# maolandaw/FCPE-burn

## Resumen

FCPE-burn es un artefacto de pesos en formato Burn (archivo `.bpk`) para el modelo FCPE (Fast Context-based Pitch Estimation), un estimador neuronal de frecuencia fundamental (F0) orientado a voz cantada. No se trata de un modelo de lenguaje ni de un modelo generativo de audio: es un detector de pitch que recibe espectrogramas mel y produce, para cada fotograma temporal, una distribución de probabilidad sobre el eje de frecuencias, decodificada posteriormente con `local_argmax`. El autor de este repositorio es maolandaw y los pesos derivan del modelo base niobures/FCPE, a su vez espejo del proyecto original CNChTu/FCPE (paquete `torchfcpe`).

La relevancia de esta publicacion es fundamentalmente de ecosistema: traslada un modelo que tradicionalmente se ejecuta con Python y PyTorch al framework Rust Burn, lo que permite integrar deteccion de pitch en aplicaciones nativas, pipelines sin dependencias de Python y potencialmente entornos embebidos o compilados a WebAssembly. El repositorio incluye tanto el archivo empaquetado `fcpe.bpk` (43.317.528 bytes, es decir, unos 41,3 MiB) como las herramientas Rust necesarias para regenerarlo desde el checkpoint ONNX original.

La arquitectura, segun la model card del autor, es un encoder de estilo Conformer/ConvNeXt que opera sobre espectrogramas mel. Los pesos exportados estan en FP32 y el manifiesto contiene 76 tensores: 65 en `float32` y 11 en `int64` (formas y constantes). El repositorio no publica el numero total de parametros, el contexto temporal soportado ni resultados de benchmarks, por lo que esos datos se marcan como no disponibles mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de estilo Conformer/ConvNeXt sobre espectrogramas mel (modelo de estimacion de F0) |
| Parametros totales | No publicado por el autor. El archivo FP32 de 43.317.528 bytes sugeriria un orden de magnitud cercano a 10-11 millones de parametros, pero es una estimacion derivada del tamano del fichero, no un dato confirmado |
| Parametros activos | No aplica (no es un modelo Mixture of Experts) |
| Longitud de contexto | No aplica en el sentido de contexto textual. El modelo opera por fotogramas sobre audio; la ventana temporal efectiva depende del front-end mel y del pipeline de inferencia, y no se documenta en la informacion disponible |
| Tipos de cuantizacion | No disponible. Los pesos publicados estan unicamente en FP32; no se ofrecen variantes cuantizadas |
| Idiomas soportados | `en` (etiqueta declarada en el repositorio). Al tratarse de un modelo de pitch sobre audio, la etiqueta de idioma no describe capacidad linguistica real |
| Licencia | MIT (coincide con la licencia upstream de CNChTu/FCPE; copyright upstream (c) 2023 CN_ChiTu) |
| Formato de pesos | Burn Pack (`.bpk`), generado a partir de un export FP32 del checkpoint ONNX `fcpe.onnx` |

## Arquitectura y entrenamiento

El modelo subyacente, FCPE, es un estimador de F0 basado en un encoder de contexto rapido de estilo Conformer/ConvNeXt que consume representaciones mel y emite distribuciones de probabilidad de pitch por fotograma. La decodificacion se realiza con `local_argmax`, un esquema de seleccion del maximo local sobre la distribucion, en lugar de una regresion directa del valor de frecuencia. Esta publicacion concreta no entrena ningun modelo: es una conversion de pesos. El proceso parte del checkpoint ONNX (`fcpe.onnx`) presente en el espejo niobures/FCPE, que a su vez replica el grafo de los pesos empaquetados en `torchfcpe/assets/fcpe_c_v001.pt` (un pickle de PyTorch no parseable directamente desde Rust).

La herramienta de exportacion (`src/bin/export_fcpe_raw.rs`) lee los inicializadores del ONNX directamente, sin requerir Python, PyTorch ni ONNX Runtime, y genera tensores `.npy` junto con un `manifest.json`. Posteriormente, el empaquetador (`src/main.rs`) convierte ese manifiesto en el archivo Burn Pack. El repositorio incluye un script de un solo paso (`convert.sh`) y una utilidad de verificacion (`src/bin/check_fcpe_bpk.rs`) que carga el archivo y reporta el numero de tensores y el total de bytes. No se documentan en la informacion disponible ni el volumen de datos de entrenamiento, ni la composicion del dataset, ni si hubo etapas de RLHF/DPO (poco aplicables a una tarea de estimacion de F0).

## Capacidades

- Deteccion de F0 (pitch) fotograma a fotograma sobre senal de audio, con salida en forma de distribucion de probabilidad por fotograma.
- Orientacion especifica a voz cantada (singing voice), el caso de uso principal del proyecto upstream.
- Procesamiento sobre espectrogramas mel, lo que implica que el pipeline debe incluir un front-end de extraccion mel compatible.
- Decodificacion mediante `local_argmax` para obtener la trayectoria de pitch final.
- Ejecucion en Rust a traves del framework Burn, con posibilidad de compilar a backends nativos sin dependencia de Python.
- Regeneracion reproducible del artefacto desde el checkpoint ONNX mediante las herramientas incluidas en el repositorio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo thinking, vision ni audio generativo.
- Capacidades multilingues: no aplicables; la etiqueta `en` no implica soporte linguistico real.

## Casos de uso

- Conversion de voz cantada (SVC) y sintesis: extraer la curva de F0 de una interpretacion vocal para alimentar sistemas de sintesis como DiffSinger o similares. El modelo es adecuado porque su salida por fotogramas se alinea de forma natural con los pipelines de sintesis que necesitan pitch continuo.
- Afinacion automatica (pitch correction) en produccion musical: usar las trayectorias de F0 extraidas para detectar desviaciones respecto a la nota objetivo y aplicar correccion. La decodificacion por distribucion permite ademas ponderar la confianza del frame.
- Transcripcion melodica y conversion a MIDI: convertir la secuencia de F0 en notas mediante segmentacion y cuantizacion, util en herramientas de transcripcion asistida para cantantes e instrumentos monofonicos.
- Analisis expresivo y musicologico: medir vibrato, portamento, desviaciones microtonales y articulacion en grabaciones vocales, gracias a la resolucion por fotograma del estimador.
- Integracion en aplicaciones nativas Rust: al distribuirse como Burn Pack, puede embeberse en herramientas de escritorio o servicios escritos en Rust sin necesidad de un runtime de Python.
- Evaluacion de calidad vocal en herramientas de entrenamiento: comparar la curva de F0 del usuario con una referencia para dar retroalimentacion sobre afinacion y estabilidad.
- Preprocesado en pipelines de generacion y edicion de audio: servir como etapa de extraccion de pitch antes de modelos de conversion o de re-sintesis, evitando dependencias de Python en el servidor.
- Experimentacion en entornos restringidos o compilados: al ser un artefacto pequeno (41,3 MiB en FP32), permite pruebas en contenedores ligeros, CI e incluso escenarios de computacion en el borde, siempre que exista un backend Burn adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de error de pitch (por ejemplo, MAE en cents, RPA o VUV), comparaciones con otros estimadores ni mediciones de latencia o throughput. Las busquedas web realizadas no devolvieron resultados relacionados con este modelo: los unicos resultados obtenidos corresponden a hilos de soporte sobre el cliente de correo Zimbra y no guardan ninguna relacion con FCPE ni con deteccion de pitch, por lo que se descartan como fuentes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos ocupan unos 41,3 MiB en FP32, por lo que el cuello de botella es el front-end mel y las activaciones, no el modelo en si.
- Memoria en CPU: ejecutable en CPU con holgura; el modelo completo cabe en cache de cualquier procesador moderno.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer reciente (por ejemplo, serie RTX 30/40) es mas que suficiente; incluso GPUs integradas o aceleradores modestos sirven para esta carga.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer actuales, y tambien en CPU. El modelo es de tamano muy reducido.
- Opciones de despliegue: framework Burn con sus backends disponibles (`ndarray`, `wgpu`, `cuda`, `tch`, entre otros). No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Formato y runtime | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| FCPE-burn (este repositorio) | Burn Pack (`.bpk`), Rust/Burn | Estimacion de F0 en voz cantada | MIT | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| FCPE original (CNChTu/FCPE, `torchfcpe`) | PyTorch (`.pt`) y ONNX | Estimacion de F0 en voz cantada | MIT | GitHub y paquete Python `torchfcpe` |
| niobures/FCPE | ONNX (`onnx/fcpe.onnx`) | Espejo del grafo FCPE | No disponible en la informacion proporcionada | HuggingFace |
| RMVPE | Pesos PyTorch dentro de pipelines de SVC | Estimacion de F0 en voz cantada | No disponible en la informacion proporcionada | Ampliamente integrado en ecosistemas de conversion de voz |
| CREPE | TensorFlow/PyTorch | Estimacion de F0 monofonica (voz e instrumentos) | No disponible en la informacion proporcionada | Repositorio academico ampliamente utilizado |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a formato, runtime, tipo de tarea y licencia. La diferencia mas relevante de FCPE-burn frente al resto es el empaquetado nativo para Burn, que habilita su uso en Rust sin Python.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es erronea.
- Alcance monofonico: como estimador de F0, esta disenado para senal con una unica trayectoria de pitch dominante; no es adecuado para polifonia compleja.
- Orientado a voz cantada: su comportamiento en habla, instrumentos o mezclas no esta documentado en este repositorio y puede degradarse.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes, por lo que no existe evidencia publica de uso en produccion ni de verificacion independiente del artefacto.
- Ausencia de benchmarks: no hay metricas publicadas de precision de pitch, robustez al ruido ni comparacion con alternativas, lo que dificulta estimar su calidad real.
- No es una aplicacion completa: el repositorio es un artefacto de modelo y conversion. No incluye codigo de inferencia de extremo a extremo ni el front-end mel necesario para producir las entradas del modelo.
- Sin cuantizaciones: solo se distribuyen pesos FP32, lo que limita optimizaciones de despliegue que si existen en otros formatos.
- Dependencia del ecosistema Burn: el uso requiere familiaridad con Rust y con el framework, cuya madurez y soporte de backends puede variar segun la plataforma objetivo.
- Integridad del artefacto: al derivar de un export ONNX intermedio, conviene ejecutar `check_fcpe_bpk` para verificar que el numero de tensores (76) y el total de bytes coinciden con lo esperado antes de desplegarlo.
- Licencia: MIT, permisiva y compatible con uso comercial. Se mantiene la atribucion de copyright upstream (c) 2023 CN_ChiTu, que debe respetarse al redistribuir.
- Sin garantias: la licencia MIT exime de responsabilidad al autor; no hay SLA ni soporte.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/maolandaw/FCPE-burn
- Modelo base en HuggingFace: https://huggingface.co/niobures/FCPE
- Checkpoint ONNX de origen: https://huggingface.co/niobures/FCPE/resolve/main/onnx/fcpe.onnx
- Proyecto upstream FCPE (CNChTu/FCPE): https://github.com/CNChTu/FCPE
- Framework Burn: https://github.com/tracel-ai/burn

Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre FCPE, `torchfcpe` ni este artefacto. Los unicos resultados obtenidos eran hilos de foro sobre el cliente de correo Zimbra, sin relacion con el modelo, por lo que no se incluyen como fuentes. No se dispone de paper, blog oficial ni demo publicados en la informacion proporcionada.
