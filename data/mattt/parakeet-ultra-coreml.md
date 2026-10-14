# mattt/parakeet-ultra-coreml

## Resumen

Parakeet Ultra for Core ML es la conversión a Core ML del modelo de reconocimiento automático de voz `moondream/parakeet-ultra`, publicada por el desarrollador mattt para su proyecto AnySpeechRecognizer. El modelo original de Moondream es a su vez una versión post-entrenada de Parakeet TDT 0.6B v3 de NVIDIA, un sistema de transcripción basado en arquitectura FastConformer con decodificador TDT (Token-and-Duration Transducer). Este repositorio no contiene los pesos originales en safetensors, sino los tres componentes ya compilados y cuantizados que se ejecutan sobre Apple Silicon mediante Core ML.

El problema que resuelve es la ejecución local y privada de transcripción de voz en dispositivos Apple. Al dividir el modelo en encoder, red de predicción y red conjunta, y al cuantizar el encoder a int8 con precisión de cómputo float16, el resultado ocupa 0,6 GB en total y puede desplegarse en el Neural Engine, la GPU o la CPU del dispositivo sin depender de servicios en la nube. Cubre 25 idiomas europeos, entre ellos el castellano, el catalán no figura y sí lo hacen la mayoría de lenguas de la Unión Europea.

Es relevante porque muestra un patrón de despliegue reproducible (traza TorchScript, ML Program con objetivo iOS 17 y macOS 14, herramientas documentadas con versiones exactas y digests SHA-256) que sirve de referencia para quien quiera portar modelos ASR de NVIDIA NeMo al ecosistema Core ML. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que debe considerarse un artefacto recién publicado y poco validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) con decodificador TDT (Token-and-Duration Transducer): red de prediccion LSTM de dos capas y red conjunta con decision greedy TDT sobre los 64 tokens mas probables |
| Parametros totales | 0,6 mil millones, segun el nombre del modelo base parakeet-tdt-0.6b-v3; la ficha no lo declara explicitamente |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 15 segundos por inferencia: 1.501 tramas de entrada de 128 bins log-mel que producen 188 tramas de encoder de 80 ms cada una |
| Tipos de cuantizacion | Encoder: cuantizacion lineal simetrica int8 por canal (una escala por canal de salida, solo para pesos de 2.048 elementos o mas). Resto de componentes: float16. Precision de computo: float16 |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML ML Program compilado (`.mlmodelc`), pesos en float16 con encoder en int8; el repositorio tambien incluye `parakeet_vocab.json` y `conversion.json` |
| Tamano del repositorio | 0,6 GB |
| Objetivo de despliegue | iOS 17 y macOS 14 o superiores |
| Preprocesador | No incluido; requiere caracteristicas log-mel de 128 bins compatibles con NeMo |
| Fecha de publicacion | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura procede integramente de `nvidia/parakeet-tdt-0.6b-v3` en la revision `541d1f99c6b0c3cd0b11a95167540bb8edefd82b`, de la que se toman la arquitectura, el tokenizer y el preprocesador. El encoder es un FastConformer que consume 1.501 tramas de caracteristicas log-mel de 128 bins, correspondientes a una ventana de 15 segundos, y produce 188 tramas de 80 ms. El decodificador es una red de prediccion LSTM de dos capas que opera paso a paso con estado explicito. La red conjunta implementa la decision greedy del esquema TDT, que predice simultaneamente el token y su duracion, restringiendo la busqueda a los 64 tokens mas probables por trama de encoder.

Los pesos provienen de `moondream/parakeet-ultra` en la revision `73175eb7aeb0d82f1e2a6b53b3aabc10a90bcd0b`, que aporta el fichero `model.safetensors` con los pesos post-entrenados sobre la base de NVIDIA. La model card no describe la composicion del dataset de post-entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO; unicamente indica que se trata de una version post-entrenada de Parakeet TDT 0.6B v3. Tampoco se documenta ninguna innovacion de decodificacion propia mas alla del esquema TDT heredado.

La innovacion de este repositorio esta en la conversion, no en el entrenamiento. Se realizo una traza TorchScript a un ML Program con objetivos iOS 17 y macOS 14, siguiendo el trabajo de FluidInference en el repositorio `mobius` (Apache-2.0, commit `26f5fa8059d5ab3d34449adce6ff6ed86734e522`). La interfaz tensorial es compatible con los artefactos `Encoder_v2.mlmodelc`, `Decoder.mlmodelc` y `JointDecisionv3.mlmodelc` de FluidInference, lo que facilita sustituir unos componentes por otros. Las herramientas empleadas fueron Python 3.12.12, PyTorch 2.7.0, NeMo 2.3.1, coremltools 9.0 y coremlcompiler 3600.25.1 sobre macOS 27.0.1, y todos los ficheros generados incluyen su digest SHA-256 en `conversion.json`.

## Capacidades

- Reconocimiento automatico de voz (ASR) sobre ventanas de 15 segundos de audio, con salida de texto tokenizado en SentencePiece.
- Transcripcion multilingue en 25 idiomas europeos, con indicacion de frontera de palabra codificada como espacio en el vocabulario.
- Ejecucion completamente local sobre Apple Silicon mediante Core ML, sin llamadas de red.
- Decodificacion incremental con estado explicito en el decodificador, apta para procesar audio en streaming por ventanas sucesivas.
- Aceleracion por hardware a traves de Core ML, con posibilidad de ejecutar el encoder int8 en Neural Engine, GPU o CPU.
- Integracion con la interfaz de tensores de FluidInference, lo que permite reutilizar pipelines existentes para esos artefactos.
- Carga de vocabulario mediante `parakeet_vocab.json`, que mapea identificadores de token a piezas SentencePiece.
- No dispone de soporte documentado de tool calling, function calling ni razonamiento multi-paso; no es un modelo de lenguaje generativo.
- No se documentan capacidades de vision, audio comprensivo, diarizacion de hablantes, deteccion de idioma automatica ni puntuacion restaurada.

## Casos de uso

- Dictado y notas de voz en aplicaciones iOS y macOS: el modelo transcribe fragmentos de hasta 15 segundos, que se pueden encadenar con solapamiento desde la app para cubrir grabaciones largas. Al ejecutarse en el Neural Engine, no requiere conexion ni envio de audio a servidores externos.
- Subtitulado en directo para accesibilidad: con ventanas consecutivas de 15 segundos y 188 tramas de salida de 80 ms, se puede generar texto con una granularidad temporal suficiente para subtitulos de video en tiempo casi real. La licencia CC BY 4.0 permite integrarlo en aplicaciones distribuidas.
- Transcripcion de reuniones corporativas: la ejecucion local evita exponer conversaciones confidenciales a APIs de terceros, un requisito habitual en entornos legales, sanitarios o financieros. El repositorio ocupa 0,6 GB, por lo que cabe en el disco de un portatil Apple.
- Procesado por lotes de archivos de audio en macOS: los tres componentes se pueden invocar en bucle sobre una cola de ficheros, generando transcripciones sin coste por minuto y sin limites de cuota, con la red de prediccion reutilizando estado entre ventanas.
- Transcripcion de podcasts y contenido editorial en varios idiomas: al cubrir 25 lenguas europeas, un mismo pipeline puede procesar episodios en castellano, aleman, frances, italiano o polaco sin cambiar de modelo, con la salvedad de que haran falta distintos ajustes de vocabulario.
- Asistentes de voz embebidos en aplicaciones nativas: el modelo puede actuar como capa de reconocimiento de comandos cortos, entregando texto al motor de intenciones de la app. La ventana de 15 segundos es suficiente para la mayoria de ordenes habladas.
- Historias clinicas y documentacion medica dictada: la ausencia de envio de datos a la nube simplifica el cumplimiento de normativas de proteccion de datos, siempre que se valide la tasa de error en terminologia especializada, que la model card no cuantifica.
- Herramienta de comparacion y validacion de conversiones Core ML: dado que la interfaz de tensores coincide con los artefactos de FluidInference, el repositorio sirve como referencia para verificar conversiones propias de modelos NeMo, comparando digests y versiones de herramientas declarados en `conversion.json`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye valores de WER, CER, MMLU, HumanEval ni de ningun otro conjunto de evaluacion, ni para el modelo convertido ni para los modelos base `moondream/parakeet-ultra` y `nvidia/parakeet-tdt-0.6b-v3`. Tampoco se proporcionan mediciones de latencia, throughput ni consumo energetico en Neural Engine.

## Requisitos de hardware

- Huella de almacenamiento: 0,6 GB para el conjunto de componentes, el vocabulario y el fichero de conversion.
- Memoria en inferencia: no se publica una cifra de VRAM o memoria unificada necesaria; el limite inferior razonable es el tamano de los pesos almacenados (inferior a 0,6 GB), pero el consumo real depende del runtime de Core ML y no esta documentado.
- Plataforma objetivo: Apple Silicon con iOS 17, macOS 14 o superiores, segun el objetivo de despliegue declarado. El tag `apple-silicon` confirma este enfoque.
- GPU compatibles: no aplica el catalogo CUDA (A100, H100, RTX 4090). La ejecucion se realiza sobre Neural Engine, GPU integrada o CPU de los chips Apple.
- Cabe en hardware de consumo: si, en cualquier Mac o dispositivo iOS compatible con el objetivo de despliegue, dado el tamano de 0,6 GB y la cuantizacion int8 del encoder.
- Opciones de despliegue: Core ML mediante coremltools y coremlcompiler; el consumo previsto es el proyecto AnySpeechRecognizer. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aceptan el formato `.mlmodelc`.
- Componentes necesarios en el pipeline: los tres modelos Core ML mas `parakeet_vocab.json`, y un preprocesador externo que genere caracteristicas log-mel de 128 bins compatibles con NeMo para ventanas de 1.501 tramas.
- Latencia y throughput: no disponibles. La cadencia de salida del encoder esta fijada en 188 tramas de 80 ms por ventana de 15 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| mattt/parakeet-ultra-coreml | 0,6 B (heredados) | Ventana de audio de 15 s | FastConformer + TDT | CC BY 4.0 | Core ML `.mlmodelc` (float16, encoder int8) | Publicado, 0 descargas |
| moondream/parakeet-ultra | No disponible en la informacion proporcionada | No disponible | No disponible (modelo de origen de los pesos) | CC BY 4.0, segun la atribucion de la ficha | safetensors | Modelo base de esta conversion |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B, segun el nombre del modelo | No disponible en la informacion proporcionada | Parakeet TDT | CC BY 4.0, segun la atribucion de la ficha | `.nemo` | Modelo origen de la arquitectura y el tokenizer |

Como alternativas de la misma categoria funcional (ASR multilingue ejecutable en local) se suelen considerar los modelos de la familia Whisper, pero la informacion proporcionada no incluye datos comparativos de parametros, contexto, WER ni licencia para ellos, por lo que no se incluyen cifras. Las unicas comparaciones verificables con los datos disponibles son las de la tabla anterior, todas ellas referidas a los antecesores directos de este artefacto.

## Limitaciones y advertencias

- La ventana de contexto es de exactamente 15 segundos de audio. Las grabaciones mas largas requieren segmentacion y encadenamiento externos, con el riesgo de perder palabras en las fronteras si no se aplica solapamiento.
- El preprocesador no esta incluido en el repositorio. Sin un generador de caracteristicas log-mel de 128 bins compatible con NeMo, los modelos no se pueden ejecutar.
- No es un modelo de lenguaje: no genera respuestas, no sigue instrucciones y no soporta tool calling ni razonamiento multi-paso. Cualquier caso de uso conversacional necesita un componente adicional.
- No se publican mediciones de exactitud (WER/CER) para ningun idioma, ni globales ni desagregadas. El rendimiento real en castellano, griego o maltes es desconocido a partir de la informacion disponible.
- No se documentan sesgos del modelo. En ASR, los sesgos tipicos se manifiestan como mayor tasa de error en acentos no dominantes, habla con ruido de fondo, solapamiento de voces y vocabulario tecnico o dialectal, pero no hay datos especificos para este modelo.
- Riesgo de alucinacion: no cuantificado. Los modelos transducer pueden producir repeticiones o texto espureo en segmentos con silencio o ruido, y la model card no documenta mitigaciones.
- La licencia CC BY 4.0 permite uso comercial, pero obliga a mantener la atribucion a Moondream y a NVIDIA, tal como exige el propio repositorio. Una redistribucion sin esa atribucion incumpliria la licencia.
- El repositorio tiene 0 descargas y 0 likes, y se publico el 13 de octubre de 2026. Es un artefacto sin validacion independiente conocida.
- Dependencia de versiones concretas de macOS y del compilador de Core ML (macOS 27.0.1, coremlcompiler 3600.25.1). Cambios de entorno pueden alterar el comportamiento de la compilacion.
- Requiere iOS 17 o macOS 14 como minimo, lo que excluye dispositivos y versiones de sistema anteriores.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos trataban sobre comics de transformacion de genero y no guardan relacion con el repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mattt/parakeet-ultra-coreml
- Modelo base (pesos post-entrenados): https://huggingface.co/moondream/parakeet-ultra
- Modelo origen de la arquitectura y el tokenizer: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Proyecto de consumo previsto, AnySpeechRecognizer: https://github.com/mattt/AnySpeechRecognizer
- Repositorio de conversion de referencia, FluidInference/mobius (Apache-2.0): https://github.com/FluidInference/mobius
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Ficheros `conversion.json` y `parakeet_vocab.json`, incluidos dentro del propio repositorio de HuggingFace.
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada.
