# AILogDev/sbv2-coreml-common

## Resumen

sbv2-coreml-common es un paquete de recursos para Apple que combina dos componentes: un encoder BERT convertido a Core ML y un diccionario de Open JTalk 1.11 en UTF-8. No es un modelo generativo de texto ni un LLM: es la pieza de extraccion de caracteristicas linguisticas del sistema Style-Bert-VITS2 (SBV2), es decir, el componente que convierte texto japones en representaciones que despues consume un modelo de voz independiente. Lo publica el usuario AILogDev dentro del proyecto sbv2-coreml, orientado a sintesis de voz en local sobre iPhone y Mac con Apple Silicon.

El encoder deriva de ku-nlp/deberta-v2-large-japanese-char-wwm, un modelo de la variante large de DeBERTa-v2 entrenado por el grupo de procesamiento de lenguaje natural de la Universidad de Kioto sobre caracteres japoneses con enmascaramiento de palabras completas. La conversion a Core ML mantiene el calculo y la entrada/salida en FP32, pero almacena los pesos en 8 bits con cuantizacion por bloques de 32 elementos, sin reentrenamiento posterior. Segun el autor, esto reduce el paquete comun de aproximadamente 1,52 GB a unos 503 MB, y el conjunto con la voz JVNV de 1,81 GB a unos 797 MB, alrededor de un 56 por ciento menos.

Su relevancia es acotada pero clara: permite ejecutar sintesis de voz japonesa completamente offline en dispositivos Apple, con un coste de calidad medido muy bajo respecto a la version FP32 (RTF mediana de 0,071 frente a 0,067 en iPhone 17 Pro). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la propia model card lo declara como conversion no oficial, sin aprobacion del autor original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (DeBERTa-v2-large japones por caracteres, con whole word masking), convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Entradas de 64, 128 y 256 tokens (variantes incluidas en el paquete Core ML) |
| Tipos de cuantizacion | Pesos en 8 bits con cuantizacion por bloques de 32 elementos; calculo e input/output en FP32. Rama `fp32-v1` con pesos FP32 y posibilidad de generar variantes FP16 |
| Idiomas soportados | Japones (ja) |
| Licencia | CC BY-SA 4.0 para el BERT; licencia tipo BSD para el diccionario Open JTalk; AGPL-3.0 para el SDK, los ejemplos y las herramientas de conversion |
| Formato de pesos | Core ML (`.mlpackage`) dentro de una estructura de carpetas `bert/` y `dictionary/`, acompanado de `download.json`, `checksums.json` y `provenance.json` |

## Arquitectura y entrenamiento

El componente principal es un encoder DeBERTa-v2 en su variante large, preentrenado sobre texto japones a nivel de caracter con enmascaramiento de palabras completas (whole word masking). El commit del modelo original referenciado en la model card es `547b0e8b044fba3f9b84d0ab9f990440bd130c8b`. Sobre ese checkpoint no se ha realizado ningun ajuste adicional ni reentrenamiento: la aportacion del autor es exclusivamente la conversion a Core ML y la compresion de pesos. El segundo componente es el diccionario Open JTalk 1.11 en UTF-8, que aporta la normalizacion de texto y la informacion fonetica necesaria en la cadena de sintesis.

La innovacion tecnica se limita a la cuantizacion: los pesos del encoder se guardan en 8 bits agrupados en bloques de 32 elementos, mientras que las operaciones y los tensores de entrada y salida se mantienen en FP32. El autor advierte explicitamente de que no ha habido reentrenamiento y que el redondeo altera las caracteristicas extraidas, las pausas y la forma de onda resultante, por lo que el modelo no es identico a la version FP32. El paquete expone ademas tres longitudes de entrada distintas (64, 128 y 256 tokens), lo que permite al SDK elegir la variante segun la longitud del texto a sintetizar. Se distribuye aparte una rama `fp32-v1` con los pesos originales sin comprimir.

## Capacidades

- Extraccion de caracteristicas linguisticas de texto japones para la cadena de sintesis de voz Style-Bert-VITS2.
- Normalizacion y analisis morfologico/fonetico de japones mediante el diccionario Open JTalk 1.11 incluido.
- Procesamiento de secuencias de 64, 128 o 256 tokens segun la variante seleccionada.
- Ejecucion completamente offline una vez descargado el paquete y compilado el modelo.
- Compatibilidad con el SDK sbv2-coreml y con modelos de voz intercambiables: la voz se carga por separado y puede anadirse o cambiarse sin tocar este paquete.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (ni vision ni audio como entrada): el audio es la salida del sistema completo, no de este componente.
- No dispone de modo de pensamiento (thinking mode) ni de capacidades multilingues mas alla del japones.

## Casos de uso

- Sintesis de voz japonesa offline en aplicaciones iOS: el paquete aporta el encoder y el diccionario que el SDK necesita para convertir texto en las caracteristicas que consume el modelo de voz, sin llamadas a red ni servicios externos.
- Funciones de accesibilidad y lectura en voz alta: una app puede integrar el SDK con este paquete para leer texto japones en pantalla, aprovechando que la inferencia corre en el dispositivo y no expone el contenido del usuario a terceros.
- Aprendizaje de japones con pronunciacion sintetizada: util para generar ejemplos de audio a partir de vocabulario o frases introducidas por el usuario, con la ventaja de que la normalizacion de lectura la resuelve el diccionario Open JTalk.
- Generacion por lotes de narracion en un Mac con Apple Silicon: dado que se ejecuta de forma nativa con macOS 15 o superior, se puede usar para producir audio de forma masiva desde un script sin depender de GPU externas.
- Doblaje y prototipado de contenido en japones: al mantener la voz como paquete independiente, se puede cambiar de voz sin volver a descargar el encoder ni el diccionario, lo que simplifica las pruebas de distintas voces sobre un mismo texto.
- Integracion en herramientas de estudio o lectura de documentacion tecnica en japones: el sistema puede leer documentos largos por fragmentos, seleccionando la variante de 256 tokens para los fragmentos mas largos y la de 64 para frases cortas.
- Base para experimentos de compresion en Core ML: el repositorio documenta el procedimiento de cuantizacion y expone la rama FP32, lo que permite reproducir la comparacion 8 bits frente a FP32 y generar variantes FP16 propias.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son medidas de tiempo real de factor (RTF) sobre iPhone 17 Pro con la voz JVNV Neutral y tres frases:

| Metrica | FP32 (rama `fp32-v1`) | 8 bits (rama principal) |
|---|---|---|
| RTF mediana (3 frases, iPhone 17 Pro, JVNV Neutral) | 0,067 | 0,071 |
| Tiempo de `load` + `warmUp` tras recarga | aproximadamente 6 s | aproximadamente 18 s |
| Tamano del modelo comun | aproximadamente 1,52 GB | aproximadamente 503 MB |
| Tamano del modelo comun mas la voz JVNV | aproximadamente 1,81 GB | aproximadamente 797 MB |

No se han publicado resultados de benchmarks en la informacion disponible para tareas de comprension del lenguaje (MMLU, HumanEval, GSM8K u otros), ni comparaciones objetivas de calidad de audio mas alla de una prueba de escucha con la voz JVNV Neutral en la que, segun el autor, no se reportaron diferencias apreciables. El propio autor advierte de que no es una evaluacion que garantice la calidad en todas las voces ni en todos los textos.

## Requisitos de hardware

- Plataforma: exclusivamente Apple. Requiere iOS 18 o superior en iPhone, o macOS 15 o superior en Mac con Apple Silicon. No hay soporte para CUDA, ROCm ni GPU de otros fabricantes.
- Almacenamiento: unos 503 MB para el paquete comun y unos 797 MB si se incluye la voz JVNV, mas espacio libre adicional para la cache de compilacion de Core ML y para la compilacion inicial del modelo.
- Memoria: no se especifica un minimo de memoria unificada en la informacion disponible.
- GPU recomendadas: no aplica; la ejecucion se realiza sobre los aceleradores de Apple (ANE y GPU integrada) a traves de Core ML.
- Cabe en hardware de consumo: si, en iPhone y en Mac con Apple Silicon; la medicion publicada se hizo en un iPhone 17 Pro.
- Opciones de despliegue: Core ML a traves del SDK sbv2-coreml y su aplicacion de ejemplo; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el RTF mediana medido es 0,071 con pesos de 8 bits y 0,067 con FP32, lo que indica sintesis mas rapida que el tiempo real en ese escenario. La primera ejecucion del BERT tras cargar el modelo es mas lenta que las siguientes, y la preparacion completa (`load` mas `warmUp`) pasa de unos 6 s en FP32 a unos 18 s en 8 bits. No hay datos de throughput en lote ni de ejecucion concurrente con un LLM.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Tamano | RTF (iPhone 17 Pro) | Licencia |
|---|---|---|---|---|---|---|
| sbv2-coreml-common (8 bits) | Encoder BERT Core ML + diccionario Open JTalk | no disponible | 64 / 128 / 256 tokens | aproximadamente 503 MB | 0,071 | CC BY-SA 4.0 (BERT) y BSD (diccionario) |
| sbv2-coreml-common (`fp32-v1`) | Misma conversion, sin comprimir | no disponible | 64 / 128 / 256 tokens | aproximadamente 1,52 GB | 0,067 | CC BY-SA 4.0 (BERT) y BSD (diccionario) |
| ku-nlp/deberta-v2-large-japanese-char-wwm | Modelo original en formato de pesos de PyTorch | no disponible | no disponible | no disponible | no aplica (no es Core ML) | CC BY-SA 4.0 |
| sbv2-coreml-jvnv-f1-jp | Modelo de voz complementario, no comparable en arquitectura | no disponible | no disponible | no disponible en la informacion consultada | no disponible | no disponible en la informacion consultada |

Nota: el modelo de voz JVNV se distribuye por separado y no sustituye a este paquete, sino que lo complementa. No se han encontrado en la informacion disponible otras conversiones Core ML del mismo encoder japones que permitan una comparacion directa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, razonamiento ni codigo. Forma parte de una cadena de sintesis de voz y solo genera caracteristicas para el modelo de voz.
- Alcance idiomatico restringido al japones; no se declara soporte de otros idiomas.
- Dependencia total de la plataforma Apple: sin Core ML y Apple Silicon o iPhone con iOS 18 o superior, el paquete no es utilizable tal cual.
- La cuantizacion a 8 bits no incluye reentrenamiento, por lo que la salida no es identica a la version FP32: cambian las caracteristicas extraidas, las pausas y la forma de onda.
- La evaluacion de calidad se limita a una prueba de escucha con la voz JVNV Neutral, tres frases y un unico dispositivo; el autor no garantiza la calidad en el resto de voces ni de textos.
- El coste de preparacion aumenta con la compresion: `load` mas `warmUp` pasa de unos 6 s a unos 18 s, y se anade el tiempo de compilacion inicial de Core ML.
- La licencia del BERT es CC BY-SA 4.0, con obligacion de compartir igual y de atribucion; conviene revisar las condiciones antes de un uso comercial o de distribuir derivados.
- El SDK, los ejemplos y las herramientas de conversion estan bajo AGPL-3.0, licencia con obligaciones fuertes de copyleft sobre el software que los integre en red.
- El diccionario Open JTalk 1.11 tiene condiciones tipo BSD, recogidas en `dictionary/COPYING`.
- Es una conversion no oficial: el autor declara que no implica aprobacion ni recomendacion por parte del autor del modelo original.
- Riesgo de fidelidad de lectura: depende del diccionario Open JTalk para la normalizacion, por lo que palabras no recogidas, nombres propios o texto no estandar pueden pronunciarse de forma incorrecta.
- No hay datos publicados sobre sesgos, comportamiento con entradas adversarias ni estabilidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AILogDev/sbv2-coreml-common
- Rama con los pesos FP32: https://huggingface.co/AILogDev/sbv2-coreml-common/tree/fp32-v1
- Modelo de voz JVNV: https://huggingface.co/AILogDev/sbv2-coreml-jvnv-f1-jp
- Repositorio del SDK y ejemplos: https://github.com/Corvelis/sbv2-coreml
- Guia de inicio del ejemplo: https://github.com/Corvelis/sbv2-coreml/blob/main/docs/getting-started.ja.md
- Guia de integracion del SDK: https://github.com/Corvelis/sbv2-coreml/blob/main/docs/sdk-guide.ja.md
- Procedimiento de compresion y cuantizacion: https://github.com/Corvelis/sbv2-coreml/blob/main/docs/compression.ja.md
- Modelo base DeBERTa japones: https://huggingface.co/ku-nlp/deberta-v2-large-japanese-char-wwm
- Documentacion de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
