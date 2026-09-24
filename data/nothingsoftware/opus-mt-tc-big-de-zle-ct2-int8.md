# NothingSoftware/opus-mt-tc-big-de-zle-ct2-int8

## Resumen

El modelo `NothingSoftware/opus-mt-tc-big-de-zle-ct2-int8` es una conversion de formato a CTranslate2 con cuantizacion int8 del modelo de traduccion automatica neuronal `Helsinki-NLP/opus-mt-tc-big-de-zle`, desarrollado por el Grupo de Investigacion en Tecnologia del Lenguaje de la Universidad de Helsinki dentro del proyecto OPUS-MT (Jörg Tiedemann y colaboradores), publicado originalmente el 23 de marzo de 2022. La conversion la firma NothingSoftware y no implica reentrenamiento ni ajuste fino: los pesos son los del modelo original, unicamente transformados al formato de inferencia de CTranslate2.

El modelo realiza traduccion de aleman (`de`) hacia lenguas eslavas orientales, principalmente ruso (`rus`), aunque tambien admite ucraniano (`ukr`) y bielorruso (`bel`) mediante el token de idioma destino al inicio de cada frase. Esta basado en la arquitectura transformer-big y emplea tokenizacion SentencePiece con modelos separados para origen y destino. Su proposito practico es ofrecer traduccion offline de alta velocidad en CPU: el autor lo utiliza como motor de traduccion en la aplicacion NTranscript.

Su relevancia actual radica en que combina una licencia permisiva (CC-BY 4.0), un tamano reducido (fichero de pesos de 242 MB en int8) y una velocidad aproximadamente el doble que la version float32 en CPU, sin perdida medible de calidad en la prueba reportada. Esto lo convierte en una pieza adecuada para despliegues en dispositivos sin GPU o con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer-big (seq2seq, encoder-decoder) |
| Parametros totales | no disponible (el fichero `model.bin` int8 ocupa 242.171.023 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (el modelo base original esta en float32) |
| Idiomas soportados | aleman (`de`) como origen; ruso (`rus`), ucraniano (`ukr`) y bielorruso (`bel`) como destino |
| Licencia | CC-BY 4.0 |
| Formato de pesos | CTranslate2 (`model.bin`), mas `shared_vocabulary.json`, `source.spm` y `target.spm` (SentencePiece) |

## Arquitectura y entrenamiento

La arquitectura es un transformer seq2seq de tipo encoder-decoder con configuracion "big", la misma que el modelo original `Helsinki-NLP/opus-mt-tc-big-de-zle`. Este repositorio no entrena ni ajusta nada: aplica una conversion de pesos con `ct2-transformers-converter` usando cuantizacion int8 y copiando los ficheros `source.spm` y `target.spm`. Las herramientas declaradas en la conversion son CTranslate2 4.8.2 y transformers 5.17.0.

El modelo base fue entrenado por OPUS-MT sobre datos del corpus OPUS y cubre la direccion aleman → lenguas eslavas orientales. El control del idioma destino se realiza anteponiendo un token especial (`>>rus<<`, `>>ukr<<` o `>>bel<<`) a la frase de origen, que se tokeniza con `source.spm`; la salida se decodifica con `target.spm`. Como innovacion practica destacable, la cuantizacion int8 reduce el tamano a la mitad y duplica aproximadamente la velocidad en CPU manteniendo la calidad: en la prueba realizada sobre WMT20 en-ru (primeras 500 frases) tanto int8 como float32 obtienen un BLEU de 28.0. No se documenta en la informacion disponible el uso de RLHF ni DPO, algo esperable en un sistema de traduccion neuronal clasico.

## Capacidades

- Traduccion automatica de aleman a ruso, con soporte adicional para ucraniano y bielorruso mediante tokens de idioma destino.
- Generacion de texto traducido en modalidad batch y por frases, con decodificacion por haz (`beam_size` configurable).
- Segmentacion de subpalabras mediante SentencePiece, con vocabulario compartido entre origen y destino.
- Inferencia eficiente en CPU gracias al motor CTranslate2 y a los pesos int8.
- Ejecucion totalmente offline, sin dependencia de servicios en la nube.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento; es un modelo exclusivamente de traduccion.
- No se documentan capacidades multilingues adicionales mas alla de los idiomas indicados.

## Casos de uso

- Traduccion offline en aplicaciones de escritorio o moviles: el modelo es el motor que descarga la aplicacion NTranscript para traducir sin conexion, gracias a sus 242 MB de pesos int8 y a su velocidad en CPU.
- Procesamiento por lotes de documentacion tecnica alemana: se puede integrar en un script con la API Python de CTranslate2 para traducir grandes volumenes de textos de aleman a ruso en servidores sin GPU.
- Traduccion en tiempo real de conversaciones o subtitulos: la decodificacion int8 con `beam_size` bajo permite latencias reducidas en CPU, adecuadas para flujos de subtitulado.
- Traduccion de correspondencia y soporte interno en organizaciones con equipos germanoparlantes y rusohablantes, desplegando el modelo en un endpoint interno.
- Preprocesamiento para pipelines de NLP: traducir corpus alemanes a ruso antes de aplicar analisis posteriores (clasificacion, indexacion, busqueda semantica).
- Generacion de datos sinteticos de entrenamiento: producir pares de traduccion aleman-ruso para aumentar datasets de ajuste de otros sistemas, con la salvedad de revisar la calidad.
- Despliegue en dispositivos de bajos recursos, como una Raspberry Pi o un contenedor con CPU limitada, donde un modelo mayor no cabria.
- Traduccion de resenas, tickets o contenido generado por usuarios en plataformas que operan en ambos mercados linguisticos.

## Benchmarks y rendimiento

Evaluacion original del modelo base en el par deu-rus, tal como figura en la tarjeta del autor:

| Par de idiomas | Conjunto de prueba | chr-F | BLEU | Frases | Palabras |
|---|---:|---:|---:|---:|---:|
| deu-rus | tatoeba-test-v2021-08-07 | 0.67143 | 46.1 | 12.800 | 87.296 |
| deu-rus | flores101-devtest | 0.54152 | 26.3 | 1.012 | 23.295 |
| deu-rus | newstest2012 | 0.49409 | 20.8 | 3.003 | 64.790 |
| deu-rus | newstest2013 | 0.52631 | 24.9 | 3.000 | 58.560 |

Prueba de equivalencia de cuantizacion reportada por el autor sobre WMT20 en-ru (primeras 500 frases):

| Precision | BLEU |
|---|---:|
| int8 | 28.0 |
| float32 | 28.0 |

No se han publicado en la informacion disponible benchmarks comparativos adicionales frente a otros modelos, ni mediciones de throughput o latencia mas alla de la indicacion cualitativa de "aproximadamente el doble de velocidad en CPU" para int8 respecto a float32.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con pesos int8; el fichero `model.bin` ocupa 242 MB, por lo que el modelo cabe holgadamente en cualquier GPU con al menos 1-2 GB de memoria.
- GPU recomendadas: no requiere GPU; funciona en CPU por diseno. En caso de usar GPU, cualquier tarjeta moderna (RTX 3060, RTX 4090, A100, H100) sirve sin limitaciones de memoria.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo, e incluso en hardware integrado y en placas de un solo board.
- Opciones de despliegue: API Python de CTranslate2 (`ctranslate2.Translator`), conversion desde transformers con `ct2-transformers-converter`, e integracion dentro de la aplicacion NTranscript. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son motores aplicables a este formato.
- Latencia y throughput: el autor indica que int8 es aproximadamente el doble de rapido que float32 en CPU; no se proporcionan cifras absolutas de tokens por segundo ni de milisegundos por frase.

## Comparativa con modelos similares

| Modelo | Direccion | Parametros | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| NothingSoftware/opus-mt-tc-big-de-zle-ct2-int8 | de → rus/ukr/bel | no disponible | CTranslate2 int8 | CC-BY 4.0 | Conversion int8, 242 MB, optimizada para CPU |
| Helsinki-NLP/opus-mt-tc-big-de-zle | de → rus/ukr/bel | no disponible | safetensors/PyTorch | CC-BY 4.0 | Modelo original en float32, base de esta conversion |
| luigi000/opus-mt-tc-big-zle-en-ct2-int8 | zle → en | no disponible | CTranslate2 int8 | CC-BY 4.0 | Conversion equivalente pero en la direccion inversa |
| NLLB-200 | Multilingue (200 idiomas) | hasta 54.000 millones (variante densa mayor) | PyTorch | CC-BY-NC 4.0 | Cobertura mucho mayor, pero licencia no comercial y tamano muy superior |

No se dispone de datos comparativos de rendimiento frente a NLLB-200 u otros sistemas en los materiales proporcionados.

## Limitaciones y advertencias

- Riesgo de alusionacion y errores de traduccion: los BLEU en dominios de noticias (20.8 en newstest2012, 24.9 en newstest2013) indican calidad moderada fuera del dominio de frases sencillas; el BLEU de 46.1 en Tatoeba refleja un corpus mucho mas simple.
- Sesgos conocidos: al entrenarse sobre el corpus OPUS, puede heredar sesgos de genero, culturales y de dominio presentes en los datos paralelos; no se documenta ningun proceso de mitigacion.
- Limitaciones de contexto: no se especifica la longitud maxima de secuencia soportada; frases muy largas o parrafos completos pueden degradar la calidad o truncarse.
- Restricciones de licencia: CC-BY 4.0 permite uso comercial, pero exige atribucion tanto a NothingSoftware como a los autores originales (OPUS-MT / Universidad de Helsinki). Conviene conservar la cita bibliografica incluida en la tarjeta.
- Dependencia del token de idioma: es obligatorio anteponer `>>rus<<`, `>>ukr<<` o `>>bel<<` a cada frase de origen; omitirlo puede producir traducciones incorrectas o salidas degeneradas.
- Idioma de origen unico: el modelo solo traduce desde aleman; no admite otras lenguas de entrada aunque el destino sea una lengua eslava.
- Ausencia de mantenimiento y traccion: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, y la fecha de creacion indicada es 2026-09-23; no hay garantia de soporte o actualizaciones.
- Produccion: al ser una conversion de formato, cualquier cambio futuro en el modelo base no se refleja automaticamente; hay que verificar la integridad de los ficheros mediante los SHA-256 publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NothingSoftware/opus-mt-tc-big-de-zle-ct2-int8
- Modelo base original: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-de-zle
- Repositorio OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- Guia de CTranslate2 para modelos OPUS-MT: https://github.com/OpenNMT/CTranslate2/blob/master/docs/guides/opus_mt.md
- Aplicacion NTranscript: https://github.com/Nothing-Software/NTranscript
- Conversion equivalente en la direccion inversa (luigi000): https://huggingface.co/luigi000/opus-mt-tc-big-zle-en-ct2-int8
- Ficha informativa del modelo base: https://model.aibase.com/models/details/1915693733422718978
- Articulo OPUS-MT (Tiedemann y Thottingal, 2020): https://aclanthology.org/2020.eamt-1.61
- Articulo Tatoeba Translation Challenge (Tiedemann, 2020): https://aclanthology.org/2020.wmt-1.139
- Licencia CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/
