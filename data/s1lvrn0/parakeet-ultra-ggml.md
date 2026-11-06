# s1lvrn0/parakeet-ultra-ggml

## Resumen

Parakeet Ultra es un modelo de reconocimiento automático del habla (ASR) desarrollado por Moondream, obtenido mediante post-entrenamiento sobre el modelo NVIDIA parakeet-tdt-0.6b-v3. Mantiene la misma arquitectura TDT (Token-and-Duration Transducer), el mismo tokenizador y el mismo conjunto de 25 idiomas europeos, pero con tasas de error inferiores según su autor. Esta ficha describe concretamente la conversión a formato ggml publicada por el usuario s1lvrn0, pensada para ejecutarse con el runtime Parakeet de whisper.cpp en CPU y dispositivos móviles sin dependencias de Python.

El artefacto es un único fichero de 668.757.119 bytes (aproximadamente 0,7 GB) con cuantización q8_0 en las matrices grandes y float32 en el resto. Está diseñado como reemplazo directo del fichero `ggml-parakeet-tdt-0.6b-v3-q8_0.bin` de ggml-org/parakeet-GGUF: mismo diseño de tensores, mismo tamano y misma velocidad. Requiere whisper.cpp v1.9.5 o posterior y se invoca mediante el binario `parakeet-cli`.

Su relevancia radica en que permite desplegar un modelo ASR multilingüe de calidad en hardware sin GPU, algo poco habitual en la categoría. No obstante, conviene senalar que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que las pruebas publicadas por el autor son informales y de muestra reducida; los benchmarks formales deben consultarse en la model card de Moondream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), heredada de NVIDIA parakeet-tdt-0.6b-v3 |
| Parametros totales | aproximadamente 0,6 mil millones (derivado del nombre del modelo base; no confirmado en la informacion disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; el limite practico lo fija el runtime de whisper.cpp) |
| Tipos de cuantizacion | q8_0 en matrices grandes, float32 en el resto; unico fichero publicado |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt (25 idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ggml (`.bin`) para whisper.cpp; el original esta en safetensors (`ParakeetForTDT`) |
| Tamano del fichero | 668.757.119 bytes |
| SHA-256 | `0ec111f8124874c0ec43fe263ae84043e3ee7b2049fd37539ab55be6e1cf8b7b` |
| Runtime | whisper.cpp v1.9.5 o posterior (binario `parakeet-cli`) |
| Modelo base | moondream/parakeet-ultra (commit `73175eb7aeb0d82f1e2a6b53b3aabc10a90bcd0b`) |

## Arquitectura y entrenamiento

La arquitectura es la TDT de NVIDIA parakeet-tdt-0.6b-v3, sin cambios estructurales: mismo tokenizador (8.192 de 8.192 piezas verificadas como identicas) y mismo conjunto de hiperparametros. Parakeet Ultra es un modelo post-entrenado por Moondream sobre esa base, con tasas de error inferiores segun su model card. No se dispone en la informacion proporcionada de detalles sobre el volumen de datos, la composicion del dataset ni si se empleo RLHF o DPO en ese post-entrenamiento.

La conversion a ggml no implico reentrenamiento alguno. El script `convert_hf_to_ggml.py` (con `ggml_parakeet.py`, solo numpy) usa el fichero v3 convertido como plantilla: conserva su cabecera (hiperparametros, banco de filtros mel, ventana, duraciones TDT, vocabulario) y sustituye cada tensor por el de Parakeet Ultra, emparejado por nombre y verificado por forma. Ademas, las puertas LSTM de la red de prediccion se reordenan de (i, f, g, o) de PyTorch a (i, f, o, g), que es lo que espera whisper.cpp, y se omite la cabeza de actividad de voz (6 tensores) porque el runtime no la utiliza. Como comprobacion, cada tensor del resultado correlaciona con el de v3 en 0,95 o mas (718 de 721 por encima de 0,99).

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 25 idiomas europeos.
- Manejo de audio multilingüe y cambios de idioma dentro de una misma grabación, con mejoras notables frente a v3 en las pruebas del autor.
- Salida con marcas de tiempo y puntuaciones de confianza por palabra (la confianza media reportada sube de 0,84-0,91 en v3 a 0,96-0,98 en Ultra).
- Ejecución en CPU pura y en dispositivos móviles, sin Python ni GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo exclusivamente ASR.
- No dispone de modo thinking, visión ni audio generativo; la entrada es audio y la salida es texto.

## Casos de uso

- Transcripción de notas de voz en movil: el modelo esta pensado para ejecutarse en CPU de telefonos (probado en un Samsung Galaxy S25 con Snapdragon 8 Elite y 6 hilos) y transcribir grabaciones personales sin enviar audio a la nube, lo que reduce latencia y preserva la privacidad.
- Subtitulado de reuniones multilingües: al soportar 25 idiomas y cambios de idioma dentro de una grabación, puede generar subtítulos de sesiones donde los participantes alternan entre ingles, espanol, frances, aleman o italiano.
- Actas y resúmenes de entrevistas: la transcripción con marcas de tiempo y confianza por palabra permite alimentar posteriores pipelines de resumen y segmentación por hablante (diarización externa).
- Atención al cliente con grabaciones: transcripción batch de llamadas para análisis de calidad y cumplimiento, ejecutable en servidores sin GPU gracias a su tamano de 0,7 GB.
- Investigación lingüística en lenguas europeas de bajos recursos: cubre croata, esloveno, letón, lituano, estonio, maltes y otros idiomas poco representados en modelos ASR de gran tamano.
- Despliegue en dispositivos embebidos o edge: el formato ggml y la ejecución sin Python permiten integrarlo en aplicaciones de escritorio, kioscos o sistemas empotrados con requisitos mínimos de memoria.
- Preprocesado de corpus de audio para entrenamiento de otros modelos: transcripción rápida y local de grandes volúmenes de audio antes de anotación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales en la informacion disponible. La model card de este repositorio incluye únicamente pruebas informales del autor sobre un Samsung Galaxy S25 (Snapdragon 8 Elite, CPU, 6 hilos), comparando con el fichero v3:

| Metrica | v3 | Parakeet Ultra |
|---|---|---|
| Tramos escritos en ingles en lugar de portugues (tres notas de 1:43 a 19 min) | 11, 7, 3 | 0, 0, 0 |
| Confianza media por palabra | 0,84-0,91 | 0,96-0,98 |
| Grabaciones multilingües (10, alternando ingles con PT/ES/FR/DE/IT): tramos con 80 % o mas de palabras correctas | 25 de 29 | 29 de 29 |
| Tiempo para 9,5 / 19 min de audio | 46 / 106 s | 50 / 106 s |

El propio autor advierte que son pruebas pequenas e informales y remite a la model card de Moondream para los benchmarks formales.

## Requisitos de hardware

- VRAM: no aplica en el uso previsto; el modelo esta disenado para CPU. El fichero ocupa aproximadamente 0,7 GB en disco y una cantidad similar de RAM al cargarse.
- GPU: no se documenta soporte GPU para este runtime; el caso de uso declarado es CPU y moviles.
- CPU: probado en un Snapdragon 8 Elite con 6 hilos; se espera funcionamiento en CPU x86-64 y ARM modernos, aunque no se publican requisitos mínimos.
- Cabe en cualquier dispositivo consumer con al menos 1 GB de memoria libre para el modelo, incluyendo telefonos de gama alta y mini-PC.
- Despliegue: whisper.cpp v1.9.5 o posterior mediante `./build/bin/parakeet-cli -m ggml-parakeet-ultra-q8_0.bin -f speech.wav`. No se mencionan vLLM, TGI, Ollama ni llama.cpp para este artefacto.
- Latencia y throughput medidos por el autor: 50 s para 9,5 min de audio y 106 s para 19 min en el dispositivo citado, es decir, aproximadamente 10-11x mas rápido que tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Parakeet Ultra ggml (esta ficha) | aprox. 0,6 B | 25 europeos | ggml / whisper.cpp | CC-BY-4.0 | Post-entrenado por Moondream; q8_0; 0,7 GB |
| parakeet-tdt-0.6b-v3 (ggml-org) | aprox. 0,6 B | 25 europeos | ggml / whisper.cpp | CC-BY-4.0 | Base de la que deriva; mismas dimensiones y velocidad; peor confianza y mas cambios de idioma en las pruebas del autor |
| parakeet-tdt-0.6b-v3 (NVIDIA, safetensors) | aprox. 0,6 B | 25 europeos | safetensors / Transformers | CC-BY-4.0 | Requiere Python y `ParakeetForTDT`; sin conversión a ggml |
| Whisper (variantes de OpenAI) | 0,039 B a 1,55 B | decenas | multiples (incl. ggml) | MIT | Alternativa ampliamente soportada en whisper.cpp; no se dispone de comparación de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con Whisper u otros modelos ASR en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente ASR: no genera texto libre, no razona, no usa herramientas y no procesa imágenes.
- Las pruebas de calidad publicadas son informales, con pocas grabaciones y un solo dispositivo; no sustituyen a una evaluación con WER sobre corpus estándar.
- El repositorio tiene 0 descargas y 0 likes, y no está afiliado ni respaldado por Moondream ni por NVIDIA; es una conversión de terceros.
- La cabeza de actividad de voz se ha eliminado en la conversión, por lo que no hay detección de voz integrada en este fichero.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución a Moondream y a NVIDIA y la indicación de los cambios realizados; conviene revisar los términos exactos antes de distribuir derivados.
- Riesgo de alucinación y de traducción espuria en audio ruidoso o con acentos no cubiertos; el autor documenta precisamente ese fallo (tramos en ingles en audio portugues) en la versión v3.
- Cobertura limitada a 25 idiomas europeos; no incluye arabe, chino, japones, coreano ni lenguas no europeas.
- Dependencia de una versión concreta del runtime (whisper.cpp v1.9.5 o posterior); versiones anteriores no reconocerán el formato.
- No se documentan sesgos demográficos ni lingüísticos específicos en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/s1lvrn0/parakeet-ultra-ggml
- Modelo base (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversión oficial de referencia (ggml-org): https://huggingface.co/ggml-org/parakeet-GGUF
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Moondream: https://moondream.ai
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
