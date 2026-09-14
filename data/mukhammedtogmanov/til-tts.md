# MukhammedTogmanov/Til-TTS

## Resumen

Til-TTS es un modelo de sintesis de voz (text-to-speech) especializado en kazajo, publicado por el usuario MukhammedTogmanov en HuggingFace. Se trata de un ajuste fino completo (full fine-tuning) del modelo base k2-fsa/OmniVoice, del que hereda la arquitectura de sintesis y el interfaz de generacion. El repositorio contiene 612.577.288 parametros (aproximadamente 612,6 millones) en formato safetensors, con un peso total de 7,4 GB.

El problema que resuelve es la falta de voces neuronales de calidad para kazajo con control fino de atributos. A diferencia de un TTS convencional, Til-TTS incorpora dos capacidades poco habituales en modelos de este tamano: diseno de voz mediante el parametro `instruct` (combinaciones de genero, estilo de edad y tono) y emision de reacciones no verbales contextuales dentro del habla continua, como risas, suspiros o expresiones de sorpresa, invocadas con etiquetas entre corchetes en el texto de entrada.

Es relevante ahora porque el corpus kazajo disponible publicamente es limitado y este modelo agrega cinco fuentes con licencia (ISSAI KazakhTTS2, ISSAI KSC2, Google FLEURS y Mozilla Common Voice) hasta alcanzar 546.488 muestras verificadas, e incorpora 18.000 muestras sinteticas generadas con la interfaz de diseno de voz del modelo base. La licencia Apache 2.0 facilita su adopcion en productos comerciales, aunque conviene revisar las condiciones de los corpus de entrenamiento subyacentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS derivado de k2-fsa/OmniVoice; la model card no detalla la arquitectura interna) |
| Parametros totales | 612.577.288 (aprox. 612,6 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los ejemplos oficiales usan float16; no se documentan cuantizaciones GGUF, int8 ni int4) |
| Idiomas soportados | Kazajo (codigo `kk`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo de salida | 24.000 Hz (segun el ejemplo oficial de guardado con soundfile) |
| Modelo base | k2-fsa/OmniVoice |
| Tamano del repositorio | 7,4 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo: solo indica que Til-TTS es un ajuste fino directo de k2-fsa/OmniVoice y que el entrenamiento actualizo todos los parametros (full fine-tuning), no mediante adaptadores tipo LoRA. La configuracion reportada es de 20.000 pasos, tasa de aprendizaje 3e-5 con planificador coseno y precision bf16. No se especifica la arquitectura del backbone (transformer, difusion, codec-based, etc.) ni si emplea decodificacion especulativa u otras optimizaciones de inferencia.

El dato diferencial esta en los datos. El corpus final son 546.488 muestras construidas en siete etapas: agregacion de cinco fuentes con licencia, filtrado por relacion senal-ruido y recorte (clipping), deduplicacion exacta y casi duplicada de transcripciones, verificacion automatica con ASR (GigaAM-Multilingual) descartando pares con alta tasa de error de palabras, normalizacion de texto y restauracion de puntuacion en la porcion de radiodifusion y crowdsourcing, generacion de 18.000 muestras sinteticas de control de voz (30 categorias: 2 generos x 5 estilos de edad x 3 niveles de tono) y 14.421 muestras de habla expresiva con reacciones no verbales contextuales.

| Fuente | Muestras |
|---|---|
| ISSAI KSC2 - crowdsourced | 264.114 |
| ISSAI KSC2 - TV news | 77.346 |
| ISSAI KazakhTTS2 | 69.885 |
| ISSAI KSC2 - talk shows | 30.922 |
| ISSAI KSC2 - podcasts | 28.891 |
| ISSAI KSC2 - parliament | 22.232 |
| Datos sinteticos de control de voz | 18.000 |
| ISSAI KSC2 - radio | 17.330 |
| Datos de habla expresiva | 14.421 |
| FLEURS | 1.863 |
| Common Voice | 1.484 |

## Capacidades

- Sintesis de voz en kazajo a partir de texto, con salida a 24 kHz.
- Diseno de voz controlable mediante el parametro `instruct`, con tres ejes combinables: genero (masculino, femenino), estilo de edad (nino, adolescente, adulto joven, mediana edad, anciano) y tono (bajo, moderado, alto). El autor reporta 30 categorias de voz.
- Clonacion de voz, segun la etiqueta `voice-cloning` del repositorio.
- Habla expresiva: insercion de reacciones no verbales dentro del discurso mediante etiquetas entre corchetes, entre ellas `[laughter]`, `[sigh]`, `[confirmation-en]`, `[question-en]`, `[surprise-ah]`, `[surprise-oh]` y `[dissatisfaction-hnn]`.
- Procesamiento de texto con puntuacion y mayusculas: el corpus de entrenamiento se normalizo especificamente para mejorar prosodia y ritmo, por lo que el modelo aprovecha la puntuacion de entrada.
- Cobertura lexica amplia derivada del corpus: habla cotidiana, terminologia tecnica, numeros, toponimos y oraciones interrogativas.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso: son capacidades ajenas al ambito de un modelo TTS.
- No se documentan capacidades de vision, audio de entrada ni modo de razonamiento explicito.
- Multilingue: no. El modelo esta entrenado exclusivamente para kazajo.

## Casos de uso

- Audiolibros y narracion en kazajo: el control de edad y tono permite asignar voces distintas a narrador y personajes sin necesidad de grabar locutores adicionales; el model card incluye ejemplos de voz femenina adolescente, femenina de mediana edad, masculina adolescente, masculina infantil aguda y masculina anciana grave.
- Locucion automatica para medios de comunicacion: el corpus incluye 77.346 muestras de telediarios y 17.330 de radio, por lo que el registro informativo esta bien representado; se puede usar para generar boletines o resumenes de noticias en kazajo.
- Sistemas de atencion al cliente en kazajo: sintesis de respuestas habladas con una voz corporativa fija definida mediante `instruct` (por ejemplo, "female, young adult, moderate pitch"), evitando depender de grabaciones.
- Accesibilidad y lectores de pantalla: conversion de texto a voz para usuarios con discapacidad visual, con la posibilidad de ajustar el estilo de edad y el tono a la preferencia del usuario.
- Videojuegos y animacion: las reacciones expresivas en linea (`[laughter]`, `[sigh]`, `[surprise-oh]`) permiten dar naturalidad a dialogos de personajes sin edicion manual de audio, siempre que el guion incluya las etiquetas.
- Doctaje o postsincronizacion de contenido divulgativo: generacion de pistas de voz para videos educativos o institucionales en kazajo, con control de voz para mantener coherencia entre episodios.
- Pruebas de concepto en investigacion sobre TTS de bajos recursos: al ser un ajuste fino completo de OmniVoice con licencia Apache 2.0, sirve como punto de partida reproducible para experimentar con otros idiomas turquicos o con tecnicas de control expresivo.
- Prototipado rapido de interfaces de voz: la API de Python permite generar audio en pocas lineas, lo que facilita integrar una capa de voz en demos y asistentes internos antes de invertir en produccion de audio profesional.

## Benchmarks y rendimiento

Evaluacion sobre un conjunto de prueba de 50 frases en kazajo que cubre habla cotidiana, terminologia tecnica, numeros, toponimos y preguntas, con puntuacion objetiva mediante un sistema ASR independiente. El control de diseno de voz y las reacciones expresivas se verificaron mediante escucha directa, sin metrica numerica publicada.

| Metrica | Valor |
|---|---|
| WER (tasa de error de palabras) | 0,0703 |
| CER (tasa de error de caracteres) | 0,0474 |
| UTMOS (naturalidad, escala 1-5) | 3,02 |

No se han publicado resultados comparativos con otros modelos de TTS en kazajo en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 612,6 M de parametros, los pesos en float16 ocupan aproximadamente 1,23 GB y en float32 unos 2,45 GB. Sumando activaciones y buffers de decodificacion de audio, un presupuesto realista de VRAM esta en el rango de 2 a 4 GB en float16, aunque el autor no publica mediciones. El repositorio pesa 7,4 GB, muy por encima del tamano de los pesos, lo que sugiere la presencia de otros artefactos (por ejemplo, estados de optimizador o copias en precision completa).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. El ejemplo oficial usa `device_map="cuda:0"`.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, RTX 4080 y RTX 4090, e incluso en modelos con 6 GB si se usa float16. No hay confirmacion oficial de estos minimos.
- Opciones de despliegue: la ruta documentada es la libreria `omnivoice` (`pip install omnivoice soundfile torch`) con `OmniVoice.from_pretrained()` y `model.generate()`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. No se publican tiempos de generacion, RTF (factor de tiempo real) ni medidas de concurrencia.

## Comparativa con modelos similares

No hay datos comparativos publicados en la informacion disponible. La model card unicamente identifica el modelo base y las fuentes de datos, sin ofrecer cifras de los modelos alternativos. La siguiente tabla recoge lo que se sabe con certeza, dejando el resto como no disponible.

| Modelo | Parametros | Contexto | Licencia | Rendimiento publicado | Disponibilidad |
|---|---|---|---|---|---|
| Til-TTS (MukhammedTogmanov) | 612,6 M | No disponible | Apache 2.0 | WER 0,0703 / CER 0,0474 / UTMOS 3,02 en 50 frases kazajas | HuggingFace, via libreria omnivoice |
| k2-fsa/OmniVoice (modelo base) | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| ISSAI KazakhTTS2 (fuente de datos) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Enunciados muy cortos (una o dos palabras) pueden sintetizarse con fiabilidad reducida, segun reconoce el propio autor.
- No existe control global de emocion por enunciado: no se puede pedir "modo alegre" o "modo triste" para toda una frase. La expresividad se logra solo con reacciones no verbales insertadas en el texto, lo que obliga a editar el guion.
- El caracter acustico de la salida puede variar segun el estilo del texto de entrada, porque el corpus mezcla grabaciones de estudio con audio de radiodifusion y crowdsourcing. Es esperable cierta inconsistencia de timbre entre frases.
- Riesgo de alucinacion acustica: como todo modelo generativo de audio, puede producir artefactos, pronunciaciones incorrectas o prosodia anomala en palabras raras, siglas o nombres propios no vistos en el corpus.
- Sesgo de dominio: la mayor parte del corpus proviene de telediarios, parlamento, podcasts y radio (ISSAI KSC2), lo que puede desplazar el registro hacia un habla formal o periodistica y penalizar registros coloquiales o dialectales.
- Limitacion idiomatica estricta: solo kazajo. No hay evidencia de transferencia a otros idiomas ni de code-switching con ruso, muy comun en el habla real de Kazajistan.
- Advertencia de licencia: los pesos se publican bajo Apache 2.0 y el uso comercial del modelo en si esta permitido, pero el entrenamiento combina corpus de terceros (ISSAI KSC2, ISSAI KazakhTTS2, Google FLEURS y Mozilla Common Voice) con condiciones propias. Conviene verificar los terminos de cada corpus antes de un despliegue comercial, especialmente en el caso de los corpus de ISSAI.
- Clonacion de voz: la capacidad de clonacion abre riesgos de suplantacion y uso fraudulento. Es responsabilidad del integrador aplicar consentimiento explicito y marcas de agua o metadatos de procedencia en el audio generado.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y el autor no publica ni paper ni informe tecnico, por lo que no hay revision independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MukhammedTogmanov/Til-TTS
- Modelo base: https://huggingface.co/k2-fsa/OmniVoice
- Ejemplos de audio incluidos en el repositorio: https://huggingface.co/MukhammedTogmanov/Til-TTS/resolve/main/examples/female_teenager.wav, https://huggingface.co/MukhammedTogmanov/Til-TTS/resolve/main/examples/female_middle_aged.wav, https://huggingface.co/MukhammedTogmanov/Til-TTS/resolve/main/examples/male_teenager.wav, https://huggingface.co/MukhammedTogmanov/Til-TTS/resolve/main/examples/male_child_high.wav
- La busqueda web realizada no devolvio enlaces relevantes al modelo, al paper o a repositorios asociados: los resultados obtenidos correspondian a paginas corporativas de Microsoft sin relacion con Til-TTS. No se dispone por tanto de enlaces a papers, blogs o demos adicionales.
