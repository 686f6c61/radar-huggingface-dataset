# loom-ai-org/sanotts-loom

## Resumen

sanoTTS-loom es la exportacion a GGUF del modelo de sintesis de voz (text-to-speech) ampixa/sanoTTS, publicada por loom-ai-org dentro del ecosistema loom.cpp. Se trata de una coleccion de voces TTS destiladas de tamano muy reducido: entre 0,29M y 2,27M de parametros por voz, distribuidas en 14 idiomas y agrupadas en dos lineas tecnologicas (piperlite, destilada de voces Piper a 22,05 kHz, y nano, destilada de la voz af_heart de Kokoro mediante un decodificador estilo Vocos a 24 kHz). El repositorio contiene varias voces, cada una como un fichero GGUF independiente que lleva embebidos su propia topologia de grafo, su tokenizador (si lo requiere) y su script controlador.

El modelo resuelve el problema de la sintesis de voz en dispositivos con recursos muy limitados: el objetivo declarado es funcionar incluso en una Raspberry Pi Zero W (un nucleo ARMv6 a 1 GHz sin SIMD), donde la voz heart-nano sintetiza a 1,1 veces la duracion del audio consumiendo 34 MB de memoria. La relevancia actual esta en la combinacion de tamano minimo, pesos autocontenidos en formato GGUF y un runtime especifico (loom-py / loom.cpp) que evita dependencias pesadas de frameworks de deep learning. El numero de parametros registrado en safetensors para el artefacto principal es de 1.084.963, coherente con la voz amy-en-1p1m.

El proyecto es un export, no un entrenamiento nuevo: los pesos proceden del modelo base ampixa/sanoTTS y heredan su licencia GPL-3.0. La libreria indicada es loom-py-rt (paquete PyPI), y el repositorio ocupa aproximadamente 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal destilado; linea piperlite (destilada de voces Piper, 22,05 kHz) y linea nano (destilada de Kokoro af_heart con decodificador estilo Vocos, 24 kHz). El GGUF es autodescriptivo e incluye topologia de grafo, tokenizador y driver |
| Parametros totales | Rango por voz: 0,29M a 2,27M. El artefacto principal registra 1.084.963 parametros (safetensors) |
| Longitud de contexto | No aplica como ventana de contexto de texto. Limite operativo: heart y heart-nano aceptan como maximo 207 simbolos foneticos por llamada |
| Tipos de cuantizacion | GGUF; los pesos de upstream estaban en int8 y se han dequantizado en este export |
| Idiomas soportados | en, ar, cs, de, es, fr, id, it, pt, ro, ru, tr, vi, zh (14 idiomas) |
| Licencia | GPL-3.0 (heredada del modelo base) |
| Formato de pesos | GGUF (un fichero por voz) |

## Arquitectura y entrenamiento

No se dispone de detalle de la arquitectura interna mas alla de lo declarado: son voces TTS destiladas de modelos previos. La linea piperlite se destila a partir de voces Piper (por ejemplo, en_US-amy-medium, en_US-hfc_female-medium, en_US-kristin-medium) y opera a 22,05 kHz. La linea nano se destila de la voz af_heart de Kokoro a traves de un decodificador estilo Vocos y opera a 24 kHz; su decodificador es alimentado por ruido, de modo que el parametro `seed` altera ligeramente la voz y el valor por defecto reproduce la renderizacion por defecto de upstream. El rango de parametros va de 0,29M a 2,27M por voz.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; estos datos corresponderian al modelo base ampixa/sanoTTS. La innovacion tecnica destacable es el formato de export: un unico GGUF autodescriptivo que transporta sus propias topologias de grafo, tokenizador y script controlador, generado por loom-exporter. La exportacion importa los scripts de entrenamiento de upstream desde un clon fijado (pinned clone) en lugar de vendorizarlos, de modo que loom.cpp, loom-exporter y loom-py no contienen codigo GPL.

## Capacidades

- Sintesis de voz (text-to-speech) en 14 idiomas: en, ar, cs, de, es, fr, id, it, pt, ro, ru, tr, vi, zh.
- Dos lineas de voces con frecuencias de muestreo distintas: piperlite a 22,05 kHz y nano a 24 kHz.
- Conversion de texto a fonemas integrada mediante orthography2ipa, con soporte opcional de lexico de pronunciacion (se incluye en_US-misaki.tsv, de hexgrad/misaki, Apache-2.0) para ingles.
- Entrada directa de fonemas mediante el argumento `phonemes`, lo que permite usar cualquier G2P externo (por ejemplo, estilo espeak) para maxima calidad.
- Ajuste de la voz mediante el parametro `seed` en las voces nano (heart, heart-nano).
- Inferencia autocontenida: el GGUF embebe su driver y los argumentos que acepta (consultables con `model.driver_source`).
- No se mencionan capacidades de tool calling, agentes, vision ni audio de entrada; es exclusivamente un modelo de sintesis.

## Casos de uso

- Sintesis de voz en dispositivos embebidos: heart-nano sintetiza a 1,1 veces la duracion del audio en una Raspberry Pi Zero W con 34 MB de memoria, lo que permite integrar voz en hardware sin GPU ni aceleracion SIMD.
- Lectura por voz en aplicaciones de accesibilidad: las voces caben en 34-42 MB y cubren 14 idiomas, de modo que un lector de pantalla puede funcionar sin conexion y sin servidor externo.
- Interfaces de voz para domotica y robots de bajo coste: el modelo se ejecuta en un solo nucleo ARMv6, lo que lo hace adecuado para asistentes locales en placas tipo Raspberry Pi.
- Generacion de audio para prototipado rapido de aplicaciones: la API de dos lineas (`loom.Model.from_pretrained` + `text2speech.infer`) permite obtener un WAV en pocos pasos durante el desarrollo.
- Doblaje y previsualizacion multilingue: al soportar 14 idiomas y varias voces por idioma, se puede generar una primera version de audio en varios idiomas antes de recurrir a grabaciones humanas.
- Pipelines de sintesis con G2P propio: pasar fonemas precalculados con un motor externo (estilo espeak) permite obtener la calidad maxima para idiomas con ortografia profunda como el ingles.
- Procesamiento por lotes en CPU x86: en un portatil de 2 nucleos, amy-1.46M tarda una catorceava parte del tiempo que en la Pi Zero W, lo que permite generar lotes de audio sin GPU.

## Benchmarks y rendimiento

Los datos disponibles son metricas de calidad y latencia publicadas en la model card. No se han publicado resultados de benchmarks comparativos estandar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS.

| Metrica | Valor |
|---|---|
| WER heart-nano, puerta de texto con lexico en_US-misaki (30 frases LibriSpeech, Whisper) | 11,9% |
| WER heart-nano, front-end original de upstream | 8,1% |
| WER amy-1.46M, puerta de texto con lexico (30 frases LibriSpeech) | 12,3% |
| WER amy-1.46M, front-end original de upstream | 8,5% |
| SCOREQ amy-1.46M (mejor voz inglesa de upstream) | 4,13 |
| Latencia heart-nano en Raspberry Pi Zero W | 1,1x la duracion del audio, 34 MB |
| Latencia heart en Raspberry Pi Zero W | 2,5x la duracion del audio, 42 MB |
| Latencia voces piperlite de 0,51M en Raspberry Pi Zero W | 2,3x la duracion del audio |
| Latencia amy-1.46M en Raspberry Pi Zero W | 8,4x la duracion del audio |
| Latencia amy-1.46M en portatil x86 de 2 nucleos | Una catorceava parte de la de la Pi Zero W |

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para CPU y no requiere GPU.
- Memoria: 34 MB para heart-nano, 42 MB para heart, en el caso de la Raspberry Pi Zero W.
- GPU recomendadas: no se especifican; el diseno objetivo son CPU de muy baja potencia (ARMv6 a 1 GHz sin SIMD).
- Cabe en cualquier GPU de consumo por su tamano (0,1 GB de repositorio completo), aunque no es el escenario previsto.
- Despliegue: runtime loom-py (`pip install -U "loom-py-rt[hub,phonemes]"`) sobre el motor loom.cpp. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput conocidos: Pi Zero W con heart-nano a 1,1x tiempo real; amy-1.46M a 8,4x. En un portatil x86 de 2 nucleos, amy-1.46M tarda catorce veces menos.
- Limitacion de memoria asociada: heart y heart-nano admiten como maximo 207 simbolos foneticos por llamada, por lo que el texto largo debe trocearse por frases.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sanoTTS-loom | 0,29M - 2,27M por voz | 14 | GPL-3.0 | GGUF | Export para loom.cpp; 28 voces |
| Piper (voces originales) | No disponible | No disponible | No disponible | No disponible | Fuente de destilacion de la linea piperlite, 22,05 kHz |
| Kokoro (voz af_heart) | No disponible | No disponible | No disponible | No disponible | Fuente de destilacion de la linea nano, decodificador estilo Vocos, 24 kHz |
| ampixa/sanoTTS | No disponible | 14 | GPL-3.0 | No disponible | Modelo base original del que se exporta este repositorio |

Los datos de parametros, licencia y formato de Piper, Kokoro y ampixa/sanoTTS no se detallan en la informacion proporcionada mas alla de su papel como origen de la destilacion.

## Limitaciones y advertencias

- Licencia GPL-3.0: los pesos heredan la licencia del modelo base, lo que impone obligaciones de copyleft para uso comercial y redistribucion. Los componentes loom.cpp, loom-exporter y loom-py no contienen codigo GPL, pero los ficheros de pesos si.
- La puerta de texto solo esta medida en ingles. Con el lexico incluido, heart-nano obtiene un 11,9% de WER frente al 8,1% del front-end original; sin lexico, el ingles empeora notablemente.
- El chino no tiene puerta de texto: la salida de orthography2ipa cae casi por completo fuera de la tabla de fonemas de la voz zh (una frase de 13 caracteres se codifico en 3 ids). Es obligatorio pasar fonemas pinyin estilo espeak.
- Para el resto de idiomas, la puerta de texto usa unicamente las reglas de orthography2ipa con correcciones de convencion independientes del idioma; la calidad completa requiere un G2P externo estilo espeak mediante el argumento `phonemes`.
- Limite de 207 simbolos foneticos por llamada en heart y heart-nano (limite de upstream); hay que trocear el texto por frases.
- El decodificador de las voces nano se alimenta de ruido: el parametro `seed` modifica ligeramente la voz. La inyeccion opcional de sibilantes de upstream (aplicada por su dashboard y runtime de Arduino, no por su paquete pip) no se reproduce en este export.
- La sintesis no es en tiempo real en las placas mas pequenas: en la Pi Zero W, heart-nano tarda 1,1x la duracion del audio y amy-1.46M hasta 8,4x.
- Proyecto marcado como trabajo en curso por el autor; el phonemizer elegido (orthography2ipa) es una solucion provisional para evitar conflictos de licencia y minimizar dependencias.
- Riesgo de alucinacion y sesgos: no se documentan sesgos especificos ni tasas de error mas alla del WER en ingles; al ser un modelo TTS, el riesgo relevante es la pronunciacion incorrecta o la ininteligibilidad, no la generacion de contenido factual.
- Cero descargas y cero "likes" en el momento de la consulta, con fecha de creacion y actualizacion del 10 de octubre de 2026: ecosistema y validacion externa practicamente inexistentes.

## Enlaces

- HuggingFace: https://huggingface.co/loom-ai-org/sanotts-loom
- Modelo base: https://huggingface.co/ampixa/sanoTTS
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Paquete PyPI loom-py-rt: https://pypi.org/project/loom-py-rt/
- Lexico en_US-misaki.tsv (hexgrad/misaki, Apache-2.0): https://huggingface.co/loom-ai-org/sanotts-loom/lexicons/en_US-misaki.tsv
- Ficheros de voces en el repositorio: sanotts-heartnano.gguf, sanotts-heart.gguf, sanotts-amy-en-1p46m.gguf, sanotts-amy-en-1p1m.gguf, sanotts-amy-en-1p8m.gguf, sanotts-hfc-en-1p8m.gguf, sanotts-kristin-en-1p4m.gguf, sanotts-ar-kareem-1p57m.gguf (lista truncada en la model card)
