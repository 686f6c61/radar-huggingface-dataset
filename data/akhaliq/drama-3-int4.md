# akhaliq/drama-3-int4

## Resumen

Drama 3 es un modelo de sintesis de voz (text-to-speech) de Fish Audio orientado a escenas con multiples personajes y contenido de formato largo. La ficha que se analiza aqui, `akhaliq/drama-3-int4`, es una reproduccion cuantizada a 4 bits del modelo original `fishaudio/drama-3`, publicada por el usuario akhaliq. El modelo resuelve la generacion de audio con varias voces simultaneas dentro de una misma pieza de texto, clonacion de voz a partir de una referencia y edicion de audio tratada como continuacion de una secuencia previa.

Tecnicamente es un modelo MoE con una columna vertebral de texto de 35.000 millones de parametros totales y 3.000 millones activos por token, atencion hibrida (completa mas lineal) y un decodificador de audio con 10 codebooks decodificados de forma causal sobre toda la secuencia. Los expertos MoE van en FP8 y el resto de pesos en bf16 en el modelo original; esta copia concreta distribuye pesos en formato safetensors cuantizados a 4 bits, con un recuento declarado de 6.749.004.928 parametros en el repositorio, cifra que no coincide con los 35B del modelo original y que se detalla mas abajo.

Su relevancia actual es doble: por un lado, cubre un nicho poco atendido como es el dialogo multi-hablante con etiquetas de locutor explicitas (`<|speaker:0|>` a `<|speaker:15|>`), control por lenguaje natural de eventos paralinguisticos y edicion por continuacion; por otro, es desplegable desde el primer dia en SGLang-Omni, con soporte de streaming por fragmentos y latencias medidas en GPU H200. La licencia es de investigacion (`fish-audio-research-license`), lo que condiciona su uso en produccion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con columna vertebral de texto y atencion hibrida (completa + lineal); decodificador de audio Codebook-MTP con 10 codebooks decodificados causalmente |
| Parametros totales | 35.000 millones (segun model card del modelo original); 6.749.004.928 en los safetensors de este repositorio cuantizado |
| Parametros activos | 3.000 millones por token (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (INT4) en este repositorio; el modelo original usa expertos MoE en FP8 y el resto en bf16 |
| Idiomas soportados | Aproximadamente 83 idiomas, entre ellos zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | fish-audio-research-license (etiquetada como `license:other` en HuggingFace) |
| Formato de pesos | safetensors (repositorio de 23,8 GB) |
| Pipeline declarado | text-to-speech |
| Autoria del modelo original | Fish Audio |
| Autoria de esta reproduccion | akhaliq |

## Arquitectura y entrenamiento

La columna vertebral de texto es un transformer de mezcla de expertos (MoE) con 35.000 millones de parametros totales y 3.000 millones activos por token, y combina atencion completa con atencion lineal en un esquema hibrido. El decodificador de audio es un Codebook-MTP que decodifica 10 codebooks de forma causal a lo largo de toda la secuencia, lo que permite generar audio en streaming por fragmentos y mantener coherencia entre fragmentos largos. Los expertos MoE se almacenan en FP8 y el resto de pesos en bf16 en la version original.

El control del habla se ejerce mediante etiquetas de locutor en el propio texto (`<|speaker:0|>` hasta `<|speaker:15|>`), con un maximo de 16 personajes por pieza, y mediante etiquetas puntuales de eventos paralinguisticos insertadas en la posicion donde debe ocurrir el evento (por ejemplo `[sighs]` o `[laughs]`). El texto largo se trocea automaticamente y puede emitirse en streaming fragmento a fragmento. La edicion de audio se implementa como continuacion: se envian los tokens VQ de tomas anteriores mediante el parametro `previous_takes` y el modelo genera la nueva version condicionada por ese contexto, permitiendo encadenar varias ediciones sucesivas sobre el mismo material. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de voz a partir de texto (text-to-speech) con sintesis de alta calidad.
- Generacion multi-hablante: hasta 16 locutores distintos en un mismo texto mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`.
- Clonacion de voz zero-shot a partir de un clip de referencia y su transcripcion.
- Generacion de habla emocional y control por lenguaje natural de eventos no verbales mediante etiquetas puntuales (`[sighs]`, `[laughs]`) colocadas en el punto exacto del texto donde deben ocurrir.
- Edicion de audio como continuacion: modificacion de palabras o frases concretas enviando las tomas previas en `previous_takes`, con encadenamiento de varias ediciones.
- Gestion automatica de texto largo: troceado automatico y streaming de audio por fragmentos.
- Soporte multilingue amplio, con aproximadamente 83 idiomas declarados entre los que se incluyen chino, ingles, japones, coreano, castellano, portugues, arabe, ruso, frances, aleman, hindi, tailandes y vietnamita, entre muchos otros.
- Servicio en streaming con latencias de primer audio por debajo de 100 ms en una unica secuencia sobre H200.
- No se declaran capacidades de tool calling, function calling, agentes ni razonamiento multi-paso; el modelo es exclusivamente de sintesis y edicion de voz. Tampoco se declaran capacidades de vision, audio de entrada libre ni transcripcion.

## Casos de uso

- Audiolibros y ficcion con varios personajes: el modelo permite asignar hasta 16 locutores distintos dentro del mismo texto mediante etiquetas de hablante, de modo que un capitulo con dialogo entre protagonista, narrador y secundarios se genera en una sola pasada y con coherencia de voz por personaje.
- Doblaje y localizacion multiidioma: con aproximadamente 83 idiomas declarados y clonacion de voz, se puede reutilizar la voz de un actor original y producir versiones en otros idiomas manteniendo el timbre, siempre que la licencia de investigacion lo permita.
- Edicion de locuciones para publicidad o podcast: gracias al modo de continuacion con `previous_takes`, se corrige una palabra o una fecha concreta sin regenerar toda la toma, encadenando varias correcciones sucesivas sobre el mismo contexto.
- Produccion de audiodescripciones y contenido accesible: generacion de narraciones largas con tono controlado, insertando marcas de eventos como suspiros o risas para que el resultado no suene plano.
- Prototipado de asistentes de voz conversacionales: el streaming por fragmentos y la latencia de primer audio inferior a 100 ms en una unica secuencia permiten construir interfaces de voz con respuesta percibida como inmediata.
- Generacion de voces sinteticas para videojuegos y prototipos: multiples personajes con voces clonadas de referencias cortas y control de emociones puntuales, util en fases de preproduccion donde aun no se ha grabado a los actores.
- Investigacion en sintesis de voz: el modelo sirve como referencia para estudiar decodificadores Codebook-MTP, atencion hibrida en MoE y edicion de audio como continuacion autorregresiva.
- Postproduccion de material ya grabado: sustitucion de frases enteras o ajuste de entonacion sobre tomas existentes aprovechando que el modelo acepta las tomas previas como contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (tipo MMLU, HumanEval o GSM8K) en la informacion disponible; estos benchmarks no son aplicables a un modelo de sintesis de voz. Lo que si se publica es una tabla de rendimiento de servicio en streaming medida sobre GPU NVIDIA H200 con peticiones en streaming sobre prompts en ingles de Seed-TTS, clonando una voz a partir de una referencia pre-codificada (`vq_codes` con su transcripcion), con `temperature` 1.0, `top_p` 0.9, `top_k` 30 y `max_new_tokens` 500. La capacidad se mide en tramas acusticas generadas por segundo, TTFA es el tiempo hasta el primer audio y RTF es el tiempo desde el envio de la peticion hasta el ultimo fragmento de audio dividido por la duracion del audio devuelto.

| Concurrencia | Throughput (tramas/s) | TTFA p50 | TTFA p95 | RTF (media) |
|---:|---:|---:|---:|---:|
| 1 | 166,7 | 88,9 ms | 90,8 ms | 0,131 |
| 2 | 287,0 | 96,2 ms | 130,1 ms | 0,152 |
| 4 | 467,6 | 108,2 ms | 156,4 ms | 0,186 |
| 8 | 678,1 | 153,2 ms | 210,9 ms | 0,256 |
| 16 | 927,6 | 210,1 ms | 287,2 ms | 0,373 |
| 32 | 1.244,7 | 304,6 ms | 396,1 ms | 0,551 |
| 64 | 1.687,3 | 450,9 ms | 1.020,1 ms | 0,801 |

Cada celda es la media de cuatro ejecuciones. Una unica secuencia obtiene el primer audio en menos de 100 ms; con concurrencia 16 el audio se genera aproximadamente 2,7 veces mas rapido de lo que se reproduce, y con concurrencia 64 el RTF medio se mantiene en 0,80. La model card menciona ademas una segunda tabla (Tabla 2) que compara dos ubicaciones del vocoder a mayor concurrencia, con 1.088 peticiones por nivel y media de seis ejecuciones, pero su contenido no esta disponible en la informacion proporcionada. Los datos estan medidos sobre el modelo original de Fish Audio, no necesariamente sobre esta reproduccion cuantizada a 4 bits.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, el repositorio cuantizado a 4 bits ocupa 23,8 GB en disco, por lo que los pesos requieren del orden de esa cifra y hay que anadir el coste de cache KV, decodificador de audio y vocoder; cualquier cifra concreta por encima de eso es una estimacion y no un dato publicado.
- GPU utilizadas en las mediciones oficiales: NVIDIA H200. Los datos de throughput, TTFA y RTF de la tabla anterior corresponden a una unica H200.
- GPU recomendadas: no disponible. Por el tamano del repositorio (23,8 GB) y la necesidad de margen para cache y vocoder, se necesitan aceleradores con al menos 24-48 GB de memoria; no se ha confirmado compatibilidad con GPUs de consumo.
- Cabe en GPU de consumo: no confirmado. El modelo original declara 35.000 millones de parametros totales, de modo que incluso en 4 bits el conjunto completo es ajustado para GPUs de consumo de 24 GB, y no hay datos publicados de pruebas en RTX 4090, 3090 u otras.
- Opciones de despliegue: SGLang-Omni, con instalacion mediante `uv pip install --prerelease=allow -v -e ".[fishaudio]"` y arranque con `sgl-omni serve --model-path fishaudio/drama-3 --port 8000`. En SGLang-Omni la agrupacion de etapas del pipeline en procesos y su colocacion en GPUs es configuracion de despliegue, no codigo especifico del modelo. No se documentan en la informacion disponible otros runners como llama.cpp, Ollama, TGI o vLLM.
- Latencia y throughput estimados: con concurrencia 1, TTFA p50 de 88,9 ms y RTF de 0,131; con concurrencia 64, TTFA p50 de 450,9 ms, TTFA p95 de 1.020,1 ms y RTF medio de 0,801, con 1.687,3 tramas por segundo. Son cifras de una H200 y del modelo original.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de comunidad sobre su comportamiento real en despliegue.

## Comparativa con modelos similares

Los valores de los modelos alternativos se basan en informacion publica general y pueden variar; se marcan como aproximados cuando no se dispone de confirmacion en la informacion proporcionada.

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Fish Audio Drama 3 (este modelo) | 35.000 M totales / 3.000 M activos (MoE) | Aproximadamente 83 | fish-audio-research-license (solo investigacion, `license:other`) | HuggingFace, despliegue con SGLang-Omni | Multi-hablante hasta 16 locutores, edicion por continuacion, clonacion de voz, streaming |
| OpenAudio S1-mini (Fish Audio, generacion anterior) | Aproximadamente 500 M | Decenas de idiomas | No disponible en esta busqueda | HuggingFace | Modelo previo de la misma casa; sin arquitectura MoE ni decodificador de 10 codebooks |
| XTTS-v2 (Coqui) | Aproximadamente 470 M | Aproximadamente 17 | CPML (no comercial) | Repositorio Coqui | Clonacion de voz, sin soporte nativo de multiples hablantes por etiquetas |
| CosyVoice 2 | Aproximadamente 500 M | No disponible con precision | Apache 2.0 | HuggingFace | Uso comercial permitido, sin las capacidades de edicion por continuacion descritas aqui |

## Limitaciones y advertencias

- Licencia de investigacion: `fish-audio-research-license` implica que el uso comercial no esta permitido sin autorizacion expresa; cualquier integracion en producto requiere revisar el texto completo de la licencia.
- Cuantizacion a 4 bits: esta reproduccion comprime los pesos respecto al original en FP8/bf16; no hay datos publicados que cuantifiquen la posible perdida de calidad de audio, estabilidad de la voz o fidelidad de la clonacion.
- Discrepancia en el recuento de parametros: los safetensors del repositorio declaran 6.749.004.928 parametros, mientras que la model card del modelo original declara 35.000 millones totales y 3.000 millones activos. Es necesario verificar que estructura de pesos contiene realmente este repositorio antes de usarlo.
- Riesgo de artefactos en la sintesis: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, prosodia extrana, ruido, cortes o inestabilidad en voces clonadas, especialmente en idiomas con pocos recursos y en textos largos.
- Clonacion de voz y consentimiento: la capacidad de clonar voces a partir de unos pocos segundos de audio plantea riesgos de suplantacion, fraude y uso no consentido de la identidad vocal de terceros; es imprescindible disponer de consentimiento explicito y cumplir la normativa aplicable.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 0 likes, y se creo y actualizo en fechas muy recientes (13 de octubre de 2026), por lo que no existe retroalimentacion independiente sobre su funcionamiento.
- Cobertura idiomatica desigual: aunque se declaran unos 83 idiomas, no se especifica el volumen de datos de entrenamiento por idioma ni la calidad esperada en cada uno.
- Dependencia de infraestructura: el despliegue documentado se apoya en SGLang-Omni y en GPU H200; no hay datos de funcionamiento en otras pilas de inferencia ni en hardware mas modesto.
- Longitud de contexto no publicada: se desconoce el limite exacto de tokens de texto o de audio que el modelo puede manejar en una sola secuencia, mas alla del troceado automatico de texto largo.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos eran contenido no relacionado y se han descartado por completo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/akhaliq/drama-3-int4
- Modelo original de Fish Audio: https://huggingface.co/fishaudio/drama-3
- Documentacion de SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Cookbook de Drama 3 en SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio de SGLang-Omni en GitHub: https://github.com/sgl-project/sglang-omni
- Licencia del modelo (LICENSE.md): https://huggingface.co/akhaliq/drama-3-int4/blob/main/LICENSE.md
- Dataset de referencia usado en los ejemplos (Seed-TTS eval mini): https://huggingface.co/datasets/zhaochenyang20/seed-tts-eval-mini
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada.
