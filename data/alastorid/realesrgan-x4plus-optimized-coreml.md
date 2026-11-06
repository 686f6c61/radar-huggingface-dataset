# alastorid/RealESRGAN-x4plus-Optimized-CoreML

## Resumen

RealESRGAN-x4plus-Optimized-CoreML es la conversion a Core ML del modelo Real-ESRGAN x4plus, una red de superresolucion de imagenes de un solo paso que reconstruye una imagen de entrada multiplicando por cuatro su ancho y alto. El modelo original fue desarrollado por Xintao Wang, Liangbin Xie, Chao Dong e Ying Shan (proyecto Real-ESRGAN, arquitectura RRDBNet de BasicSR); esta version concreta la publica el autor alastorid como parte de la aplicacion WaifuFinder, aportando la conversion, la optimizacion y la validacion nativa para Apple Silicon.

Tecnicamente se trata de la variante oficial de 23 bloques RRDB, con 64 caracteristicas y factor de crecimiento 32, en la que pesos, tensores de activacion y tensores de entrada/salida se almacenan en FP16. No emplea cuantizacion INT8/INT4, palettizacion ni compresion de pesos. El paquete `RealESRGANValidated.mlpackage` es un ML Program portable para macOS 15 o superior, con un unico proposito: inferencia de superresolucion 4x en hardware Apple.

Su relevancia actual es practica: permite ejecutar un modelo clasico de restauracion de imagen en el Neural Engine (ANE) de los chips M-series sin dependencia de Python ni de PyTorch en tiempo de inferencia, con un manifiesto que fija por SHA-256 cada fichero del modelo y los materiales de reproduccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RRDBNet (Real-ESRGAN), 23 bloques RRDB, 64 features, growth 32 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 1x3x128x128, 1x3x256x256 o 1x3x384x384) |
| Tipos de cuantizacion | FP16 en pesos y activaciones; sin INT8/INT4 ni palettizacion |
| Idiomas soportados | no aplica |
| Licencia | BSD-3-Clause (pesos); Apache-2.0 (arquitectura BasicSR); MIT (extractos de WaifuFinder) |
| Formato de pesos | Core ML ML Program (`.mlpackage`); checkpoint original `.pth` como referencia |

## Arquitectura y entrenamiento

La red es una RRDBNet de Real-ESRGAN con 23 bloques residuales densos (RRDB), 64 canales de caracteristica y factor de crecimiento 32, que realiza reconstruccion nativa 4x en un unico paso. No es el modelo anime 6B, ni RealESRNet, ni una cascada x2. La entrada y la salida son tensores RGB en formato NCHW normalizados a 0...1; la salida debe recortarse al rango 0...1 al codificar pixeles. El modelo no incluye gestion de color, orientacion, padding, canal alfa ni tiling: todo ello corresponde al consumidor.

Los pesos provienen del checkpoint oficial `RealESRGAN_x4plus.pth` (SHA256 `4fa0d38905f75ac06eb49a7951b426670021be3018265fd191d2125df9d682f1`), correspondiente a la revision `4c05b20cb30aded73ed3731848a9fbbf70c7c0ac` del repositorio Real-ESRGAN y a la revision `8d56e3a045f9fb3e1d8872f92ee4a4f07f886b0a` de BasicSR. La conversion se realizo con PyTorch 2.7.0, NumPy 2.5.4 y Core ML Tools 9.0 en un entorno Python auditado y offline. No se documenta en la informacion disponible el dataset de entrenamiento original ni si hubo etapas de RLHF/DPO (no aplicables a un modelo de superresolucion).

La innovacion destacable es la optimizacion para Apple Silicon: el plan de computo del M3 prefiere el ANE para las 1.024 operaciones ejecutables, y una traza de Core ML Instruments registro 100 intervalos de prediccion en ANE. La especializacion por defecto `.all` resulto mas rapida que CPU+GPU forzado y comparable a CPU+ANE en los fixtures registrados; la especializacion `fastPrediction` explicita se descarto por ser mas lenta.

## Capacidades

- Superresolucion de imagen 4x en un solo paso sobre tensores RGB normalizados.
- Tres formas de entrada soportadas: 128x128, 256x256 y 384x384 (esta ultima por defecto), con salida de 512, 1024 y 1536 pixeles por lado respectivamente.
- Inferencia nativa en Apple Silicon con ejecucion en ANE; no requiere Python, descarga de checkpoints ni ejecutables multimedia una vez instalado.
- Verificacion de integridad: `manifest.json` fija por SHA-256 los 9 ficheros del modelo, la licencia, la atribucion y los ficheros de validacion antes de la instalacion.
- Validacion numerica incluida: error maximo frente a referencia FP32 de 0,006221 y error medio maximo de 0,000348 sobre RGB normalizado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, vision semantica, audio ni capacidades multilingues: es exclusivamente un modelo de restauracion de imagen.

## Casos de uso

- Restauracion de capturas y arte digital en aplicaciones macOS: el modelo se compila con `MLModel.compileModel(at:)` en el Mac destino y se ejecuta con `MLComputeUnits.all`, permitiendo integrar superresolucion 4x en apps nativas sin dependencias de Python.
- Procesado por teselas de imagenes grandes: WaifuFinder usa tensores de 384 px con contexto fuente conservador de 160 px alrededor de nucleos de 64 px, reflejando contra la imagen completa y recortando los pixeles del nucleo al bitmap RGB final; este patron es reutilizable para fotografia de alta resolucion.
- Procesado de imagenes pequenas en una sola pasada: imagenes de hasta 224 px por lado caben en un unico tensor de 384 px, lo que simplifica el pipeline en miniaturas y avatares.
- Automatizacion por lotes con control de recursos: el limite de salida de 256 millones de pixeles (maximo 16.384 px por lado) y la comprobacion de cancelacion entre predicciones permiten encolar trabajos largos de forma segura.
- Preprocesado en pipelines de vision por computador: la salida 4x normalizada sirve como entrada de etapas posteriores de deteccion o segmentacion cuando se necesita mas resolucion espacial.
- Verificacion de integridad en distribucion de modelos: el esquema de manifiesto con SHA-256 y ficheros de validacion es aplicable a cualquier despliegue de modelos Core ML en produccion que requiera cadena de custodia.
- Referencia de reproduccion: los scripts incluidos (`tools/setup-native-realesrgan.sh --variant x4plus --convert-official`) permiten regenerar el paquete desde el checkpoint oficial en un entorno auditado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K y similares no aplican a un modelo de superresolucion). Los unicos datos de rendimiento disponibles son mediciones de latencia en tensor:

| Entrada | Mediana en caliente (M3, ANE) |
|---|---|
| 1x3x128x128 | 46,11 ms |
| 1x3x256x256 | 187,75 ms |
| 1x3x384x384 | 430,14 ms |

Estas cifras son mediciones tempranas de tensor, no tiempos de ejecucion sobre imagenes grandes. La huella de proceso muestreada excluye algunas asignaciones del servicio Core ML/ANE. No se realizo perfilado adicional durante la integracion en la aplicacion.

## Requisitos de hardware

- Plataforma: macOS 15 o superior en Apple Silicon (la validacion se realizo en un M3).
- VRAM: no disponible; el modelo se ejecuta en el ANE y en memoria unificada, y la huella de proceso no esta completamente caracterizada.
- GPU recomendadas: no aplica en el sentido convencional; el plan de computo del M3 prefiere el ANE para las 1.024 operaciones ejecutables.
- Cabe en hardware consumer: si, en cualquier Mac con Apple Silicon y macOS 15 o superior.
- Opciones de despliegue: Core ML nativo (`MLModel.compileModel(at:)` seguido de carga con especializacion por defecto y `MLComputeUnits.all`). No se distribuyen artefactos `.mlmodelc` compilados porque dependen de la maquina y del sistema operativo.
- Latencia: medianas en caliente de 46,11 / 187,75 / 430,14 ms para entradas de 128 / 256 / 384 px en M3.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Factor de escala | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| RealESRGAN-x4plus-Optimized-CoreML (esta ficha) | no disponible (23 bloques RRDB, 64 features) | 4x | Core ML, ANE en Apple Silicon | BSD-3-Clause | FP16, sin cuantizacion; validacion y manifiesto SHA-256 incluidos |
| Real-ESRGAN x4plus original | mismo backbone | 4x | PyTorch `.pth` | BSD-3-Clause | Checkpoint oficial de referencia; requiere PyTorch en inferencia |
| Real-ESRGAN anime 6B | no disponible | 4x | PyTorch | BSD-3-Clause | Variante especializada en ilustracion; explicitamente distinta de este modelo |
| RealESRNet | no disponible | 4x | PyTorch | BSD-3-Clause | Variante sin la etapa adversarial; explicitamente distinta de este modelo |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La reconstruccion por IA sintetiza detalle: la salida no debe tratarse como evidencia fotografica ni forense original. En WaifuFinder, TruFor y SAFIRE siguen analizando y mostrando los pixeles fuente originales.
- El modelo no gestiona color, orientacion, padding, canal alfa ni tiling; un consumidor que omita estos pasos obtendra resultados incorrectos. No debe sustituirse el preprocesado por un pixel-unshuffle x2.
- La configuracion de teselas de WaifuFinder esta validada por correccion, no se presenta como rendimiento optimo para fotografia grande.
- La especializacion `fastPrediction` es mas lenta que la configuracion por defecto en los fixtures registrados.
- Los artefactos `.mlmodelc` no se distribuyen por depender de la maquina y del sistema operativo; es necesario compilar en el destino.
- No hay datos publicados sobre sesgos, tasas de alucinacion visual ni comportamiento en dominios fuera de la restauracion de imagen.
- Restricciones de licencia: BSD-3-Clause para los pesos, Apache-2.0 para la arquitectura de referencia BasicSR y MIT para los extractos de WaifuFinder; es obligatorio preservar `NOTICE` y todos los avisos de copyright en uso comercial.
- El repositorio tiene un tamano de 0,0 GB reportado y 13 descargas, con validacion limitada a los entornos descritos por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alastorid/RealESRGAN-x4plus-Optimized-CoreML
- Repositorio WaifuFinder: https://github.com/alastorid/WaifuFinder
- Proyecto original Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Checkpoint oficial: https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth
- Arquitectura de referencia BasicSR: https://github.com/XPixelGroup/BasicSR
- Paper: *Real-ESRGAN: Training Real-World Blind Super-Resolution with Pure Synthetic Data* (no se proporciona URL en la informacion disponible)
