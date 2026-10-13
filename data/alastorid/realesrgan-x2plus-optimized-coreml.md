# alastorid/RealESRGAN-x2plus-Optimized-CoreML

## Resumen

RealESRGAN-x2plus-Optimized-CoreML es una conversion a Core ML del modelo de superresolucion de imagen Real-ESRGAN x2plus, publicada por el autor alastorid en el contexto del proyecto WaifuFinder. Se trata de un escalador 2x fotograma a fotograma concebido para ejecutarse de forma autocontenida en Apple Silicon, sin dependencia de Python, del checkpoint original ni de un paso de conversion en tiempo de ejecucion. El repositorio no contiene pesos en el sentido habitual (safetensors o GGUF), sino un paquete `.mlpackage` que la aplicacion compila localmente durante la instalacion.

La aportacion principal no es un modelo nuevo, sino una optimizacion del grafo original: la primera convolucion se fusiona con la etapa siguiente y las entradas de 256, 384 y 522 pixeles se expresan como formas enumeradas de Core ML, de modo que un mosaico pequeno se escala a su propio tamano en lugar de rellenarse hasta 522. La red subyacente es la version sin modificar de Real-ESRGAN x2plus, con pesos procedentes de `RealESRGAN_x2plus.pth`.

El interes de esta ficha es acotado y muy especifico: es un recurso para desarrolladores que quieran integrar superresolucion 2x nativa en aplicaciones macOS o iOS con verificacion criptografica de integridad y paridad medida frente al modelo original de PyTorch. No es un modelo de lenguaje ni un modelo multimodal de proposito general, y su licencia BSD 3-Clause facilita el uso comercial siempre que se respeten las condiciones de atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional de superresolucion 2x; referencia de arquitectura BasicSR (revision `8d56e3a`), pesos originales `RealESRGAN_x2plus.pth` |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de vision sobre imagen, no secuencial) |
| Tipos de cuantizacion | no disponible; empaquetado Core ML (`.mlpackage`) con formas enumeradas de 256, 384 y 522 pixeles |
| Idiomas soportados | no aplica |
| Licencia | BSD 3-Clause (pesos); Apache-2.0 (arquitectura de referencia BasicSR) |
| Formato de pesos | Core ML (`.mlpackage`), compilado en la maquina de destino durante la instalacion |

Otros datos del repositorio: tamano del repo 0,0 GB; 11 descargas; 0 likes; creado y actualizado el 13 de octubre de 2026; pipeline no disponible.

## Arquitectura y entrenamiento

La red es la Real-ESRGAN x2plus sin modificaciones. La conversion a Core ML aplica dos cambios estructurales: fusiona la primera convolucion en la etapa siguiente y declara tres formas de entrada enumeradas (256, 384 y 522 pixeles). Este ultimo punto evita el relleno de mosaicos pequenos hasta el tamano maximo, lo que reduce computo desperdiciado cuando se procesa por teselas. La arquitectura de referencia es BasicSR en la revision `8d56e3a`, y los pesos derivan del checkpoint `RealESRGAN_x2plus.pth` del repositorio `xinntao/Real-ESRGAN`.

No se proporciona informacion sobre el dataset de entrenamiento original, el numero de tokens o imagenes, ni sobre si hubo fases de refinamiento adversario (el modelo original de Real-ESRGAN emplea una red discriminadora, pero la model card no lo detalla). El paquete incluye `manifest.json` con huellas del modelo original y SHA-256 de cada fichero, y `validation.json` con las comprobaciones de paridad. La aplicacion verifica los tres ficheros de modelo, la licencia, la atribucion y los ficheros de validacion antes de instalar; se rechaza cualquier paquete que no coincida con el validado. La validacion registra un error absoluto maximo frente a la red original de PyTorch igual o inferior a 0,0069 en todos los tamanos de entrada soportados, contra un limite de aceptacion de 0,01.

## Capacidades

- Superresolucion de imagen 2x (escalado exacto al doble de resolucion) fotograma a fotograma.
- Procesamiento por teselas de 256, 384 y 522 pixeles, con escalado independiente del tamano de cada mosaico.
- Inferencia totalmente local en Apple Silicon, sin conexion a red y sin paso de conversion en el dispositivo.
- Verificacion de integridad criptografica (SHA-256) de los pesos y los ficheros auxiliares antes de la instalacion.
- Paridad medida frente al modelo original de PyTorch (error absoluto maximo 0,0069).
- Integracion directa con la aplicacion WaifuFinder; el autor indica que no se requiere Python ni el checkpoint de origen.
- No dispone de tool calling, agentes, modo de razonamiento, vision de alto nivel, audio ni capacidad multilingue, por tratarse de un modelo de vision de proposito especifico.

## Casos de uso

- Escalado 2x de ilustracion y anime en WaifuFinder: es el proposito declarado del paquete, que la aplicacion descarga e instala directamente para mejorar imagenes de baja resolucion de forma local.
- Restauracion de fotos antiguas o de baja resolucion en macOS: el modelo se ejecuta sobre el Neural Engine o la GPU integrada, sin enviar la imagen a servidores externos.
- Preprocesado de datasets de vision por computador: permite generar versiones 2x de imagenes de entrenamiento antes de tareas de deteccion o segmentacion, elevando el detalle de entrada.
- Aplicaciones iOS y macOS offline: al ser un `.mlpackage` autocontenido y verificable, encaja en apps distribuidas que necesitan superresolucion sin backend.
- Procesado de video fotograma a fotograma: al operar sobre imagenes individuales con formas fijas, puede encadenarse en un pipeline de reescalado de video, asumiendo el coste por fotograma.
- Preparacion de assets para arte digital o juegos: escalado de sprites e ilustraciones a resoluciones mayores manteniendo la nitidez antes de un retoque manual.
- Canalizacion hacia impresion o gran formato: obtener una version 2x de una imagen antes de aplicar tecnicas adicionales de interpolacion para salida impresa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K y similares no aplican a un modelo de superresolucion). El unico dato cuantitativo aportado es la validacion de paridad frente al modelo original:

| Metrica | Valor | Limite |
|---|---|---|
| Error absoluto maximo frente a PyTorch (todas las formas de entrada) | <= 0,0069 | 0,01 |
| Formas de entrada enumeradas | 256, 384, 522 px | no disponible |
| Escala de superresolucion | 2x | no disponible |

## Requisitos de hardware

- Entorno objetivo: Apple Silicon (familia M de Apple). El modelo esta empaquetado para Core ML y no esta pensado para GPUs NVIDIA.
- Memoria: no se especifica VRAM ni memoria unificada necesaria; al emplear memoria unificada, el requisito depende del tamano del mosaico y del modelo de chip, no de una cifra dedicada publicada.
- Sin datos de latencia ni throughput publicados para este paquete concreto.
- Aceleracion: Core ML puede repartir la carga entre Neural Engine, GPU y CPU segun el chip.
- Compilacion: el `.mlpackage` se compila una sola vez en la maquina de destino, dado que el binario compilado de Core ML depende del compilador local y de la version de macOS.
- Opciones de despliegue: aplicacion nativa (WaifuFinder), `coremltools` para inspeccion o reempaquetado y ejecucion directa via Core ML. No aplican vLLM, llama.cpp, Ollama ni TGI.
- No cabe ni esta destinado a GPUs de consumo NVIDIA; no es un modelo desplegable en ese ecosistema.

## Comparativa con modelos similares

| Modelo | Enfoque | Escala | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| alastorid/RealESRGAN-x2plus-Optimized-CoreML | Real-ESRGAN x2plus optimizado | 2x | Core ML (`.mlpackage`) | BSD 3-Clause | Formas enumeradas 256/384/522; paridad medida <=0,0069; integrado en WaifuFinder |
| marshiyar/RealESRGAN_x2_CoreML | Real-ESRGAN x2 en Core ML | 2x | Core ML | no disponible en la informacion recogida | Alternativa directa en Core ML |
| hanxiao/real-esrgan-coreml | Real-ESRGAN en Apple Silicon | hasta 4x | Core ML | no disponible en la informacion recogida | El autor reporta ser 1,6x mas rapido que MLX y soportar las 5 variantes oficiales con tiling automatico |
| xinntao/Real-ESRGAN (original) | Implementacion de referencia | 2x y 4x | PyTorch (`.pth`) | BSD 3-Clause (pesos) | Incluye `RealESRGAN_x4plus`, `RealESRGAN_x4plus_anime_6B` y modelos para video de anime |

Los datos de parametros, contexto y rendimiento de los modelos comparados no estan disponibles en la informacion recogida mas alla de lo indicado.

## Limitaciones y advertencias

- Es un modelo de vision especializado en superresolucion 2x; no genera texto, no razona y no soporta tool calling ni agentes.
- El escalado es fijo a 2x. No realiza 4x ni factores arbitrarios.
- La paridad con el original tiene un margen: el error absoluto maximo llega a 0,0069, por debajo del limite de 0,01, pero no es una reproduccion exacta bit a bit.
- Dependencia estricta de plataforma: requiere Core ML y Apple Silicon; no es utilizable en GPUs NVIDIA, AMD o en servidores Linux convencionales.
- El paquete compilado queda ligado al compilador local y a la version de macOS, de modo que la compilacion debe repetirse en cada maquina.
- La integridad esta ligada a `manifest.json`: si la verificacion SHA-256 o de licencia falla, la aplicacion rechaza el paquete.
- Riesgo de sobresuavizado o artefactos propios de los modelos de superresolucion generativa en rostros, texto pequeno o patrones repetitivos; no se documentan sesgos especificos.
- Licencia BSD 3-Clause en los pesos, lo que permite uso comercial con atribucion; la arquitectura de referencia BasicSR esta bajo Apache-2.0. Conviene revisar `NOTICE` y los ficheros de licencia incluidos.
- Repositorio con actividad minima (11 descargas, 0 likes) y sin informacion de mantenimiento; tratarlo como recurso acotado a su aplicacion original.
- No se especifican cuantizaciones soportadas ni presupuesto de memoria, por lo que el rendimiento real depende del hardware y queda sin cifras publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alastorid/RealESRGAN-x2plus-Optimized-CoreML
- Repositorio de la aplicacion WaifuFinder: https://github.com/alastorid/WaifuFinder
- Real-ESRGAN original (xinntao): https://github.com/xinntao/Real-ESRGAN
- Arquitectura de referencia BasicSR (XPixelGroup): https://github.com/XPixelGroup/BasicSR
- Alternativa Core ML: https://huggingface.co/marshiyar/RealESRGAN_x2_CoreML
- Implementacion Core ML en Apple Silicon: https://github.com/hanxiao/real-esrgan-coreml
- Guia de uso de Real-ESRGAN (x2, x4 y modelos anime): https://upres.ai/blog/how-to-use-real-esrgan
