# sekkit/InterpTok-Models

## Resumen

InterpTok es un tokenizador de imagenes (autoencoder) desarrollado por Ole Beißwenger, Jan-Niklas Dihlmann y Hendrik Lensch, del grupo de graficos por computador de la Universidad de Tubinga. Su propuesta consiste en afinar el tokenizador MAETok para que aprenda a decodificar mezclas de los codigos de dos imagenes distintas y producir imagenes naturales, en lugar de limitarse a reconstruir una unica entrada. El resultado es que el espacio latente queda mejor estructurado: la interpolacion entre codigos de dos imagenes genera transiciones coherentes.

El modelo parte del encoder de MAETok-B-128 y anade un decoder de 18 bloques, con un total de 217 millones de parametros almacenados en float32. Cada imagen de 256 x 256 pixeles se codifica en 128 tokens de 32 valores cada uno. El repositorio publicado incluye dos checkpoints del tokenizador (41.000 y 82.000 pasos), un decoder aislado y dos carpetas con sendos modelos de difusion SiT-B entrenados sobre los codigos, uno con los codigos de InterpTok y otro con los de MAETok como linea base.

La relevancia practica esta en la mejora de las metricas en ImageNet a 256 x 256: mantiene la calidad de reconstruccion de MAETok y reduce el FID de interpolacion de 14,42 a 4,30, mientras que un SiT-B entrenado sobre sus codigos baja el FID de generacion sin guidance de 11,61 a 8,48. Es, por tanto, una pieza util para cualquiera que construya generadores latentes de imagenes y quiera un tokenizador con latentes mas regulares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder de tokenizacion de imagenes; encoder derivado de MAETok-B-128 y decoder de 18 bloques |
| Parametros totales | 217 M (float32) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; procesa imagenes de 256 x 256 px, que se codifican en 128 tokens de 32 valores cada uno) |
| Tipos de cuantizacion | No disponible (los pesos se publican en float32; no se documentan versiones cuantizadas) |
| Idiomas soportados | No disponible (modelo de vision, no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors para los tokenizadores; los experimentos SiT-B se distribuyen como `args.json`, punto de control `.pt` y configuracion del tokenizador; `SHA256SUMS.txt` con checksums |

## Arquitectura y entrenamiento

InterpTok es un autoencoder de imagenes, no un transformer de lenguaje. Reutiliza el encoder de MAETok-B-128 y lo combina con un decoder de 18 bloques, sumando 217 millones de parametros en float32. La entrada de 256 x 256 pixeles se comprime a una secuencia de 128 tokens, cada uno con 32 valores, que actua como representacion latente discreta o cuasicontinua sobre la que despues se entrena un generador de difusion.

La innovacion del trabajo esta en el regimen de entrenamiento: en lugar de optimizar unicamente la reconstruccion de una imagen, se entrena al tokenizador para decodificar mezclas de los codigos de dos imagenes en imagenes naturales. Esto convierte el espacio latente en un espacio con estructura interpolable, lo que reduce de forma notable el FID de interpolacion. El repositorio publica dos puntos de control del tokenizador (41.000 y 82.000 pasos), un decoder especifico que opera sobre el encoder congelado de MAETok y dos experimentos de generacion basados en SiT-B entrenados durante 400.000 pasos, uno sobre los codigos de InterpTok y otro sobre los de MAETok como referencia. No se detalla en la informacion disponible el volumen total de tokens de entrenamiento, la composicion exacta del dataset mas alla de ImageNet-1k, ni si se emplearon tecnicas de RLHF o DPO, que en este tipo de modelo no resultan aplicables.

## Capacidades

- Codificacion de imagenes de 256 x 256 px en representaciones latentes de 128 tokens con 32 valores cada uno.
- Decodificacion de dichos codigos a imagenes naturales manteniendo la calidad de reconstruccion de MAETok.
- Interpolacion entre dos imagenes: a partir de los codigos de dos entradas genera transiciones coherentes, con un FID de interpolacion de 4,30 frente a 14,42 de la linea base.
- Produccion de latentes adecuados para entrenar generadores de difusion: un SiT-B entrenado sobre sus codigos alcanza un FID de generacion sin guidance de 8,48.
- Decodificacion de los codigos de MAETok y de las muestras de generadores entrenados sobre ellos mediante el checkpoint `interptok_decoder_41k`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplicable (modelo de vision).
- Capacidades especiales: no se documentan modos de pensamiento, vision adicional ni audio.

## Casos de uso

- Investigacion en tokenizacion latente: usar `interptok_41k` o `interptok_82k` como tokenizador de referencia para estudiar como la estructura del espacio latente afecta a la calidad de interpolacion, comparando con MAETok sobre el mismo conjunto de ImageNet.
- Entrenamiento de generadores de difusion latente: los codigos de InterpTok sirven como representacion de entrada para modelos tipo SiT-B, con la ventaja de que el FID sin guidance baja de 11,61 a 8,48 respecto a la linea base MAETok.
- Interpolacion y morfing de imagenes: el script `src/interpolate.py` permite pasar de una imagen A a una imagen B produciendo transiciones naturales, util en edicion fotografica, animacion o generacion de variaciones visuales.
- Audicion de generadores existentes: el checkpoint `interptok_decoder_41k` decodifica los codigos de MAETok y las muestras de generadores entrenados sobre ellos, lo que permite evaluar modelos previos sin reentrenar el tokenizador.
- Reproduccion de experimentos academicos: las carpetas `sit-b_interptok-41k/` y `sit-b_maetok/` incluyen la configuracion y los pesos necesarios para replicar los resultados del articulo en ImageNet a 256 x 256.
- Desarrollo de pipelines de vision por computador que necesiten comprimir imagenes a una secuencia corta de tokens (128 por imagen) antes de alimentar un transformer o un modelo de difusion, por ejemplo en busqueda visual o indexacion de imagenes.
- Generacion condicionada con pocos recursos: al operar en el espacio latente de 128 x 32 valores por imagen, el coste de entrenar y muestrear generadores aguas abajo es inferior al de trabajar en pixel space.

## Benchmarks y rendimiento

| Metrica | MAETok (linea base) | InterpTok | Notas |
|---|---|---|---|
| FID de interpolacion (ImageNet 256 x 256) | 14,42 | 4,30 | InterpTok 41k |
| FID de generacion sin guidance (SiT-B) | 11,61 | 8,48 | SiT-B entrenado 400.000 pasos sobre los codigos respectivos |
| Calidad de reconstruccion | Referencia | Se mantiene | Sin valor numerico publicado en la informacion disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No disponible | No disponible | No aplicables a un tokenizador de imagenes |

No se han publicado en la informacion disponible resultados adicionales de benchmarks mas alla de los FID indicados.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 0,87 GB (217 M de parametros); con activaciones para una imagen de 256 x 256 el consumo se situa en el rango de 2 a 4 GB, aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de memoria, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100. No se documentan requisitos especificos por modelo.
- Compatibilidad con GPU de consumo: si, cabe con holgura en tarjetas consumer de gama media y alta, dado el tamano del modelo.
- Opciones de despliegue: el flujo oficial es clonar el repositorio `cgtuebingen/InterpTok` y ejecutar `python src/interpolate.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Almacenamiento: el repositorio completo ocupa 3,7 GB, ya que incluye los dos tokenizadores, el decoder y las dos carpetas de experimentos SiT-B.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FID interpolacion | FID generacion (SiT-B, sin guidance) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| InterpTok 41k | 217 M | 128 tokens x 32 valores por imagen de 256 x 256 | 4,30 | 8,48 | Apache-2.0 | HuggingFace (repo `sekkit/InterpTok-Models`) |
| MAETok-B-128 | No disponible en la informacion proporcionada (mismo encoder, decoder distinto) | 128 tokens por imagen de 256 x 256 | 14,42 | 11,61 | No disponible en la informacion proporcionada | HuggingFace (`MAETok/maetok-b-128`) |
| Otros tokenizadores de imagenes (VQGAN, SD-VAE, TiTok, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

Los unicos datos comparativos disponibles son los de MAETok, que actua como linea base del articulo. No se dispone de cifras comparables con otros tokenizadores de imagenes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo no es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso, y las filas correspondientes de la ficha se marcan como no disponibles.
- No se documentan sesgos especificos, pero al entrenarse sobre ILSVRC/imagenet-1k hereda las limitaciones de cobertura y las desviaciones de ese conjunto de datos en cuanto a clases representadas y contextos visuales.
- Riesgo de alucinacion no aplicable en el sentido habitual de los modelos generativos de texto; en cambio, el decoder puede producir imagenes plausibles que no correspondan exactamente a los codigos de entrada, especialmente fuera de la distribucion de ImageNet.
- La resolucion documentada es 256 x 256; no se indica soporte para otras resoluciones o relaciones de aspecto.
- El modelo esta especializado en ImageNet-1k; su comportamiento en dominios visuales muy distintos (imagen medica, satelital, ilustracion) no esta documentado.
- No se documentan versiones cuantizadas ni formatos alternativos a safetensors y `.pt`, lo que limita la integracion con runtimes de inferencia que esperan GGUF u otros formatos.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribucion correspondiente; conviene revisar tambien la licencia del modelo base MAETok.
- El identificador del repositorio presenta una discrepancia: la ficha de HuggingFace consultada apunta a `sekkit/InterpTok-Models`, mientras que la model card indica `CGTuebingen/InterpTok-Models` en el comando de descarga. Conviene verificar cual es el repositorio canonico antes de automatizar descargas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad fuera del articulo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sekkit/InterpTok-Models
- Repositorio alternativo citado en la model card: https://huggingface.co/CGTuebingen/InterpTok-Models
- Paper: https://arxiv.org/abs/2610.16759
- Codigo: https://github.com/cgtuebingen/InterpTok
- Pagina del proyecto: https://graphics.cs.uni-tuebingen.de/papers/interptok/
- Modelo base MAETok: https://huggingface.co/MAETok/maetok-b-128
- Codigo de referencia de los experimentos SiT-B: https://github.com/tongdaxu/Making-rFID-Predictive-of-Diffusion-gFID
- Dataset: https://huggingface.co/datasets/ILSVRC/imagenet-1k
