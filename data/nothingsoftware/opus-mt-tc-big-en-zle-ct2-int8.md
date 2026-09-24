# NothingSoftware/opus-mt-tc-big-en-zle-ct2-int8

## Resumen

`NothingSoftware/opus-mt-tc-big-en-zle-ct2-int8` es una conversion de formato del modelo de traduccion automatica neural `Helsinki-NLP/opus-mt-tc-big-en-zle` al motor de inferencia CTranslate2, con pesos cuantizados a int8. El modelo original lo desarrollo el Language Technology Research Group de la Universidad de Helsinki (OPUS-MT, grupo de Jörg Tiedemann) y se publico el 13 de marzo de 2022. La conversion no implica reentrenamiento ni ajuste fino alguno: unicamente transforma los pesos a un formato optimizado para produccion.

La tarea del modelo es la traduccion de ingles a lenguas eslavas orientales, con el ruso como destino principal y soporte tambien para ucraniano y bielorruso mediante tokens de destino explicitos. El repositorio ocupa 0.2 GB y el fichero de pesos `model.bin` pesa 242.630.403 bytes, lo que lo situa en la categoria de modelos compactos que pueden ejecutarse en CPU sin GPU dedicada.

Su relevancia practica radica en el binomio tamano/velocidad: el autor reporta que la version int8 obtiene la misma puntuacion BLEU que la version float32 (BLEU 28.0 en las primeras 500 frases de WMT20 en-ru) ocupando la mitad de espacio y siendo aproximadamente el doble de rapida en CPU. Es el modelo que descarga la aplicacion NTranscript para traduccion sin conexion, lo que ilustra el caso de uso tipico: traduccion local, privada y de bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq de traduccion automatica (familia OPUS-MT, formato Marian) |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (unica incluida en este repositorio) |
| Idiomas soportados | Origen: en (ingles). Destino: ru (ruso), ukr (ucraniano), bel (bielorruso) mediante tokens `>>rus<<`, `>>ukr<<`, `>>bel<<` |
| Licencia | CC-BY 4.0 |
| Formato de pesos | CTranslate2 (`model.bin`), tokenizadores SentencePiece (`source.spm`, `target.spm`) y vocabulario compartido (`shared_vocabulary.json`) |
| Modelo base | Helsinki-NLP/opus-mt-tc-big-en-zle |
| Libreria | ctranslate2 |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder de traduccion automatica de la familia OPUS-MT. El modelo base `opus-mt-tc-big-en-zle` pertenece a la variante "big" del proyecto OPUS-MT, orientada a pares de idiomas con volumen de datos suficiente para justificar un modelo de mayor capacidad que las variantes estandar. El preprocesado es a nivel de subpalabra con SentencePiece: cada frase de origen se tokeniza con `source.spm` y se decodifica con `target.spm`, compartiendo vocabulario mediante `shared_vocabulary.json`. Para fijar el idioma de destino, la secuencia de entrada debe comenzar con un token de idioma (`>>rus<<` para ruso, `>>ukr<<` para ucraniano, `>>bel<<` para bielorruso).

La conversion a CTranslate2 se realizo con `ct2-transformers-converter` usando `--quantization int8` y copiando explicitamente los ficheros `source.spm` y `target.spm`. Las versiones empleadas fueron CTranslate2 4.8.2 y transformers 5.17.0. No hubo reentrenamiento ni ajuste fino: la model card afirma explicitamente que "nada fue reentrenado ni ajustado". El autor declara que la cuantizacion int8 puntua igual que float32 en la prueba realizada (WMT20 en-ru, primeras 500 frases: BLEU 28.0 en ambos casos), con la mitad de tamano y aproximadamente el doble de velocidad en CPU. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Traduccion automatica de texto de ingles a ruso, con soporte adicional de destino a ucraniano y bielorruso mediante tokens de idioma.
- Traduccion a nivel de frase con beam search configurable (el ejemplo de la model card usa `beam_size=2`).
- Ejecucion en CPU con cuantizacion int8, con aproximadamente el doble de velocidad que la version float32.
- Tokenizacion subpalabra SentencePiece, lo que permite manejar vocabulario abierto y morfologia rica sin tokens fuera de vocabulario.
- Traduccion por lotes (`translate_batch`), adecuada para procesar grandes volumenes de frases en pipelines.
- Integracion en aplicaciones de escritorio y moviles mediante la libreria CTranslate2.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento: es un modelo puramente de traduccion.

## Casos de uso

- Traduccion sin conexion en aplicaciones de escritorio: es exactamente el caso de NTranscript, que descarga este modelo para traducir localmente sin enviar texto a servicios en la nube. El tamano de 0.2 GB y la ejecucion en CPU lo hacen viable en equipos sin GPU.
- Subtitulado y transcripcion de video: integrado tras un motor de reconocimiento de voz, permite generar subtitulos en ruso a partir de audio en ingles procesando cada segmento de forma independiente con `translate_batch`, sin coste por caracter ni dependencia de API externa.
- Traduccion de documentacion tecnica y manuales de ingles a ruso: el modelo maneja terminologia tecnica razonablemente gracias al entrenamiento sobre corpus OPUS, que incluye datos de dominios variados como noticias, Tatoeba y TICO-19 (este ultimo orientado a contenido sobre COVID-19).
- Preprocesado de corpus para investigacion: traduccion masiva de conjuntos de datos en ingles al ruso para tareas posteriores de entrenamiento, anotacion o evaluacion, aprovechando el procesamiento por lotes y la velocidad de int8 en CPU.
- Localizacion de interfaces y contenidos web al mercado rusohablante: traduccion de cadenas de producto, descripciones de comercio electronico o articulos de blog con un pipeline reproducible y auditable en local.
- Traduccion con requisitos de privacidad o cumplimiento normativo: al ejecutarse en infraestructura propia, evita la transferencia de datos sensibles (sanitarios, legales, internos) a servicios de traduccion de terceros.
- Cobertura multirregional para Ucrania y Bielorrusia: con los tokens de destino `>>ukr<<` y `>>bel<<` se puede reutilizar el mismo binario para traducir simultaneamente al ucraniano y al bielorruso, simplificando el despliegue de una sola aplicacion con varios idiomas de salida.
- Baseline en investigacion sobre traduccion automatica neural: sirve como referencia reproducible en formatos compactos para comparar tecnicas de cuantizacion, destilacion o decodificacion sobre el par en-ru.

## Benchmarks y rendimiento

Evaluacion original del modelo base (eng-rus), publicada en la model card:

| Test set | chr-F | BLEU | Frases | Palabras |
|---|---|---|---|---|
| tatoeba-test-v2021-08-07 | 0.66182 | 45.5 | 19.425 | 134.296 |
| flores101-devtest | 0.59654 | 32.7 | 1.012 | 23.295 |
| newstest2012 | 0.62842 | 36.8 | 3.003 | 64.790 |
| newstest2013 | 0.54627 | 26.9 | 3.000 | 58.560 |
| newstest2014 | 0.68348 | 43.5 | 3.003 | 61.603 |
| newstest2015 | 0.62621 | 34.9 | 2.818 | 55.915 |
| newstest2016 | 0.60595 | 33.1 | 2.998 | 62.014 |
| newstest2017 | 0.64249 | 37.3 | 3.001 | 60.253 |
| newstest2018 | 0.61219 | 32.9 | 3.000 | 61.907 |
| newstest2019 | 0.57902 | 31.8 | 1.997 | 48.147 |
| newstest2020 | 0.52939 | 25.5 | 2.002 | 47.083 |
| tico19-test | 0.59314 | 33.7 | 2.100 | 55.843 |

Comparacion int8 frente a float32 reportada por el autor de la conversion:

| Variante | Test | Frases | BLEU |
|---|---|---|---|
| float32 | WMT20 en-ru (primeras 500) | 500 | 28.0 |
| int8 (este repositorio) | WMT20 en-ru (primeras 500) | 500 | 28.0 |

No se han publicado resultados de benchmarks adicionales para la version cuantizada en la informacion disponible, ni metricas de velocidad medidas en unidades concretas (tokens por segundo o latencia por frase).

## Requisitos de hardware

- VRAM estimada para inferencia: unos 0.25 GB de pesos en int8, mas el overhead de contexto y tokenizador; el modelo cabe holgadamente en cualquier GPU con 1 GB de memoria.
- GPU recomendadas: cualquier GPU NVIDIA compatible con CUDA soportada por CTranslate2. Para este tamano no se necesitan A100 ni H100; una GTX 1050 Ti o superior ya es suficiente, y el modelo esta pensado para funcionar sin GPU.
- Ejecucion en CPU: es el escenario principal. El autor reporta aproximadamente el doble de velocidad que la version float32 en CPU, sin perdida de BLEU en su prueba. Cabe en cualquier portatil moderno con varios nucleos.
- GPU de consumo: si, cabe en cualquier GPU de consumo e incluso en GPUs integradas, dado el reducido tamano del binario.
- Opciones de despliegue: CTranslate2 (API de Python y C++), con `compute_type="int8"`. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos de gran tamano y a formatos GGUF/HF; para este modelo el motor nativo es CTranslate2.
- Latencia y throughput: no disponible en unidades concretas. La unica referencia cuantitativa es la relacion aproximada de 2x en velocidad sobre float32 en CPU.

## Comparativa con modelos similares

| Modelo | Direccion | Formato | Cuantizacion | Tamano | Licencia |
|---|---|---|---|---|---|
| NothingSoftware/opus-mt-tc-big-en-zle-ct2-int8 | en → ru (ukr, bel) | CTranslate2 | int8 | 0.2 GB (repo) | CC-BY 4.0 |
| Helsinki-NLP/opus-mt-tc-big-en-zle | en → ru (ukr, bel) | PyTorch / safetensors (modelo base) | float32 | no disponible | CC-BY 4.0 |
| luigi000/opus-mt-tc-big-zle-en-ct2-int8 | Direccion inversa zle → en | CTranslate2 | int8 | 246 MB | no disponible en la informacion |
| Helsinki-NLP/opus-mt-tc-big-en-tr | en → tr | PyTorch (modelo base) | float32 | no disponible | CC-BY 4.0 |

La comparacion de calidad entre la version int8 y el original float32 no muestra degradacion en la prueba documentada (BLEU 28.0 en ambos casos sobre las primeras 500 frases de WMT20 en-ru). No se dispone de datos comparativos con sistemas alternativos como NLLB-200 o M2M-100 en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion y errores de traduccion: al ser un modelo de traduccion y no un modelo de lenguaje general, no "alucina" en el sentido conversacional, pero si puede producir traducciones incorrectas, omitir contenido o alterar el sentido en frases ambiguas, muy largas o con terminologia especializada.
- Dominio limitado por los datos de entrenamiento: el rendimiento varia notablemente segun el dominio (BLEU 45.5 en Tatoeba frente a 25.5 en newstest2020), por lo que en dominios muy especificos se recomienda evaluacion previa.
- Cobertura de idiomas restringida: origen unicamente en ingles; destino ruso, ucraniano y bielorruso. No traduce desde ruso a ingles (existe un modelo separado en la direccion inversa) ni cubre castellano.
- Token de idioma obligatorio: si no se antepone `>>rus<<`, `>>ukr<<` o `>>bel<<` a la frase de entrada, el resultado puede ser incorrecto o corresponder a otro idioma de destino.
- Requisito de tokenizacion coherente: es imprescindible usar los ficheros `source.spm` y `target.spm` incluidos; usar otro tokenizador invalida las salidas.
- Licencia CC-BY 4.0: permite uso comercial, pero exige atribucion a los autores originales (Universidad de Helsinki, OPUS-MT) y a la conversion. Conviene revisar los terminos completos antes de integrarlo en un producto.
- Sin soporte de funcionalidades generativas: no admite tool calling, agentes, razonamiento multi-paso ni instrucciones en lenguaje natural. Solo traduce.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y no se documenta una politica de actualizaciones o soporte.
- Ausencia de datos tecnicos clave: no se especifican parametros totales, longitud de contexto soportada ni limites de longitud de entrada; conviene validar experimentalmente el comportamiento con frases largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NothingSoftware/opus-mt-tc-big-en-zle-ct2-int8
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-zle
- Repositorio OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Guia de CTranslate2 para modelos OPUS-MT: https://github.com/OpenNMT/CTranslate2/blob/master/docs/guides/opus_mt.md
- Aplicacion NTranscript: https://github.com/Nothing-Software/NTranscript
- Articulo "Democratizing Neural Machine Translation with OPUS-MT": https://arxiv.org/pdf/2212.01936
- Articulo OPUS-MT (EAMT 2020): https://aclanthology.org/2020.eamt-1.61
- Articulo Tatoeba Translation Challenge (WMT 2020): https://aclanthology.org/2020.wmt-1.139
- Conversion en la direccion inversa (zle → en, CT2 int8): https://huggingface.co/luigi000/opus-mt-tc-big-zle-en-ct2-int8
- Modelo relacionado en → tr: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-tr
- Licencia CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/
