# iatagun/DizgeTTS-Antalia

## Resumen

DizgeTTS-Antalia es un modelo experimental de sintesis de voz (text-to-speech) en turco desarrollado por el usuario iatagun, publicado bajo licencia CC-BY-4.0. Se trata de un modelo acustico basado en la arquitectura Matcha-TTS, que emplea flow matching de tipo no autorregresivo para generar mel-espectrogramas a partir de una secuencia de sesbirim (fonemas) enriquecida con informacion de acentuacion y pausas. La sintesis final del audio la realiza un vocoder HiFi-GAN a 22,05 kHz, con un unico hablante (el locutor del corpus Antalia).

El modelo no funciona de forma autonoma: requiere un front-end llamado DizgeBERT-G2PTTS, que se encarga de la normalizacion del texto (numeros, fechas, horas, moneda, abreviaturas), la conversion a sesbirim, la prediccion de la vocal acentuada y del nivel de pausa tras cada palabra. A diferencia de otras aproximaciones, no usa espeak. Tanto el entrenamiento como la inferencia esperan exactamente la misma representacion de entrada, y el paquete rechaza ejecutarse si detecta divergencias sistematicas entre la version del front-end y la usada en entrenamiento.

Su relevancia es acotada y de caracter investigador: se entreno sobre solo 4,2 horas de un unico corpus de lectura en una GPU de portatil de 4 GB, y el propio autor lo califica explicitamente como version de investigacion y no como voz de calidad comercial. La ficha resulta util para desarrolladores que necesiten un TTS turco ligero, de bajo coste computacional y con control explicito de prosodia, siempre asumiendo sus limitaciones de naturalidad y su condicion experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha-TTS (flow matching no autorregresivo) para el modelo acustico + vocoder HiFi-GAN; front-end DizgeBERT-G2PTTS |
| Parametros totales | no disponible (el repositorio del modelo ocupa 0,1 GB; el front-end suma aproximadamente 440 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el texto se procesa frase a frase |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (libreria declarada: PyTorch) |

## Arquitectura y entrenamiento

El componente acustico es Matcha-TTS, un modelo de flow matching condicionado por texto que genera mel-espectrogramas de forma no autorregresiva; el vocoder asociado es HiFi-GAN, que convierte el mel-espectrograma en audio a 22,05 kHz. La entrada al modelo acustico no es texto plano, sino la salida del front-end DizgeBERT-G2PTTS: una secuencia de sesbirim con la marca de acento (`ˈ`) insertada antes de la vocal acentuada, mas un atributo de nivel de pausa por palabra que se pasa unicamente al estimador de duracion del modelo. El autor documenta dos decisiones de diseno: anadir un marcador de frontera explicito (`|`) rompia la alineacion, y eliminar el separador de palabras volvia el habla ininteligible.

El entrenamiento se realizo con 4,2 horas de audio de un unico locutor procedente del corpus «antalia-voice-corpus», sobre una GPU de portatil de 4 GB. En el front-end, la conversion a sesbirim es en parte basada en reglas (paquete `dizge==0.1.6`, mas diccionario de pronunciacion y reglas de vocal larga para «ğ» e «y»), mientras que la prediccion de acento y de pausa combina un diccionario prioritario con cabezas basadas en ELECTRA. En pruebas ciegas, el front-end alcanzo un 96,7 % de acierto en sesbirim (120 palabras), un 92,8 % en acento (97 palabras) y un F1 de 0,50 en la prediccion de pausa respecto a la duracion medida. No se menciona uso de RLHF ni DPO, algo esperable en un sistema TTS de este tipo.

## Capacidades

- Sintesis de voz en turco de un unico hablante, con salida de audio a 22,05 kHz.
- Normalizacion de texto previa a la sintesis: expansion de numeros, fechas, horas, cantidades monetarias, abreviaturas y codigos (por ejemplo, `15:30` se lee como «on beş otuz» y `3,5 TL` como «üç lira elli kuruş»).
- Prediccion automatica de prosodia: el front-end infiere la vocal acentuada de cada palabra y el nivel de pausa posterior (sin pausa, pausa intermedia o frontera entonativa).
- Conversion texto-a-sesbir mediante reglas mas diccionario de pronunciacion, sin depender de espeak.
- Procesamiento por frases: el texto se divide en oraciones y se sintetiza secuencialmente.
- Control de inferencia mediante parametros: `steps` (pasos de flow matching, 10 suficientes), `temperature` (por defecto 0,667) y `length_scale` (valores mayores de 1 ralentizan el habla).
- No dispone de tool calling, function calling, razonamiento multi-paso, vision, audio de entrada ni capacidades multimodales: es exclusivamente un sistema de sintesis de voz.

## Casos de uso

- Lectura de textos largos en turco: dividiendo un parrafo en frases y sintetizandolas en orden, el modelo puede generar audiolibros o articulos narrados con una sola voz consistente, aprovechando la normalizacion automatica de numeros y fechas.
- Accesibilidad para personas con discapacidad visual: conversion de documentos turcos a voz en entornos de bajos recursos, dado que la inferencia es viable en CPU y no requiere GPU dedicada.
- Avisos y anuncios por voz en aplicaciones: generacion de mensajes hablados para interfaces, sistemas de transporte o domotica, donde el control de pausas ayuda a que las frases suenen segmentadas de forma natural.
- Aprendizaje de turco como lengua extranjera: produccion de audio de apoyo con pronunciacion y acentuacion inferidas, util para practicar la lectura de palabras con acento irregular.
- Prototipado de investigacion en prosodia: al exponer la prediccion explicita de acento y pausa como atributos, sirve como banco de pruebas para estudiar como estas variables afectan a la naturalidad percibida.
- Generacion de voces sinteticas para doblaje experimental o maquetas de bajo presupuesto, asumiendo que la calidad no es apta para produccion comercial.
- Integracion en pipelines de generacion de contenido turco (por ejemplo, narracion de resumenes o noticias) mediante el paquete `matcha-tts` en Python.

## Benchmarks y rendimiento

Las metricas se midieron sobre 484 frases: 84 clips de test del corpus Antalia (no usados en entrenamiento ni en seleccion de modelo) mas 400 frases del Turkish UD. La inteligibilidad es automatica (sintesis transcrita con Whisper-small y calculo de CER/WER) y la naturalidad usa UTMOS, cuya escala absoluta no es fiable en turco por estar entrenado mayoritariamente en ingles; solo las diferencias relativas entre sistemas son interpretables. Los corchetes indican intervalo de confianza bootstrap del 95 %.

| Sistema | CER % | WER % | UTMOS |
|---|---|---|---|
| Grabacion real (solo 84 clips; base Whisper) | 3,1 | 9,9 | — |
| Candidato anterior (v8) | 3,2 [2,9–3,5] | 14,0 [12,8–15,1] | 3,14 |
| Este modelo (v9a) | 3,1 [2,8–3,4] | 14,1 [12,9–15,3] | 3,16 |

El autor indica que esta version es equivalente a la anterior (las diferencias emparejadas no son significativas: CER −0,03 [−0,29, +0,22]; WER +0,09 [−0,84, +0,98]; UTMOS +0,02 [−0,00, +0,04]) y que el motivo de publicacion es la compatibilidad con el front-end actual, no una mejora de calidad. En pruebas de escucha ciega (30 pares, un unico oyente), el reentrenamiento del estimador de duracion fue preferido 19-0 (11 empates), senalado como la mayor ganancia audible del proyecto; el cambio a los sesbirim de G2PTTS v1 resulto indeterminado (12 / 8 / 10).

## Requisitos de hardware

- El repositorio del modelo acustico ocupa 0,1 GB; el front-end DizgeBERT-G2PTTS anade aproximadamente 440 MB de descarga.
- La inferencia es viable en CPU (el autor indica unos pocos segundos por frase).
- El modelo se entreno en una GPU de portatil de 4 GB, por lo que cabe con holgura en cualquier GPU de consumo (por ejemplo, gamas RTX con 4 GB o mas) y en "cuda" o "cpu" indistintamente.
- No se proporcionan datos de latencia ni de throughput mas alla de la referencia de CPU por frase.
- Opciones de despliegue: paquete Python `matcha-tts==0.0.7.2` (instalado sin dependencias, requiere compilador de C) junto con el paquete de reglas `git+https://github.com/iatagun/lemma-rule-based`; tambien existe una demo en Hugging Face Spaces.
- No es desplegable en motores de inferencia para LLM como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de terceros en la informacion proporcionada, por lo que solo se comparan caracteristicas estructurales conocidas. Los datos de rendimiento de las alternativas figuran como "no disponible".

| Modelo | Tipo | Idioma | Voces | Licencia | Rendimiento |
|---|---|---|---|---|---|
| DizgeTTS-Antalia | Matcha-TTS + HiFi-GAN, con front-end propio | Turco | Una | CC-BY-4.0 | CER 3,1 % / WER 14,1 % / UTMOS 3,16 |
| Matcha-TTS (implementacion de referencia) | Matcha-TTS | Multilingue (segun configuracion) | Segun dataset | Codigo abierto (ver repositorio) | no disponible |
| Piper | VITS | Multilingue | Multiples | MIT (ver repositorio) | no disponible |
| Coqui TTS | VITS / otros | Multilingue | Multiples | MPL-2.0 (ver repositorio) | no disponible |

## Limitaciones y advertencias

- Version de investigacion experimental: el propio autor advierte de que no es una voz de calidad comercial y que se entreno con solo 4,2 horas de un unico locutor.
- El audio generado es sintetico y no debe presentarse como una grabacion real de persona (recomendacion de uso responsable incluida en la model card).
- WER de 14,1 % en la evaluacion automatica, muy por encima del 9,9 % que obtiene una grabacion real sobre el mismo conjunto, lo que refleja errores de inteligibilidad no despreciables.
- La escala absoluta de UTMOS no es fiable en turco; solo permite comparaciones relativas entre sistemas.
- Dependencia estricta del front-end DizgeBERT-G2PTTS: el modelo solo reconoce las secuencias que produce la version con la que se entreno, y el paquete puede negarse a ejecutarse si detecta diferencias sistematicas.
- Cobertura limitada a un unico hablante y a turco; no hay soporte multilingue ni cambio de voz.
- Procesamiento frase a frase: los parrafos largos deben dividirse y sintetizarse secuencialmente.
- Instalacion fragil: `matcha-tts` fija versiones antiguas de dependencias y se recomienda instalar sin dependencias, con compilador de C disponible.
- Licencia CC-BY-4.0: permite uso comercial siempre que se atribuya la autoria, pero no exime de cumplir la normativa aplicable sobre voces sinteticas y consentimiento.
- Riesgo de sesgos derivados de un corpus de un solo locutor y registro de lectura, que puede no representar acentos, dialectos o estilos del turco hablado real.
- Posibles alucinaciones acusticas o pronunciaciones incorrectas en palabras fuera de dominio (prestamos, nombres propios, terminologia tecnica) por depender de reglas y diccionario.
- No se dispone de informacion sobre sesgos demograficos ni sobre auditorias de seguridad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iatagun/DizgeTTS-Antalia
- Front-end DizgeBERT-G2PTTS: https://huggingface.co/iatagun/DizgeBERT-G2PTTS
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/iatagun/dizge-demo
- Repositorio de reglas y paquete de instalacion: https://github.com/iatagun/lemma-rule-based
- Implementacion de referencia de Matcha-TTS: https://github.com/shivammehta25/Matcha-TTS
- Corpus de voz utilizado: https://huggingface.co/datasets/cloud0day3/antalia-voice-corpus
- Muestras de audio del modelo: https://huggingface.co/iatagun/DizgeTTS-Antalia/resolve/main/samples/00.wav (y 01.wav, 02.wav, 03.wav en la misma ruta)
