# ArtShtorm/Shtorm_PocketTTS_RU

## Resumen

Shtorm_PocketTTS_RU es un modelo de síntesis de voz (text-to-speech) en ruso desarrollado por el usuario ArtShtorm, publicado en HuggingFace bajo licencia CC-BY-4.0. Se trata de un finetune del modelo kyutai/pocket-tts de Kyutai Labs, especializado en la lectura de libros: busca una locución "de audiolibro", con entonación natural y capacidad de clonar una voz a partir de una referencia corta. El modelo cuenta con 109.502.146 parámetros (~109,5 M) y un repositorio de 0,4 GB en formato safetensors.

Arquitectónicamente sigue el diseño compacto de pocket-tts: 6 capas y aproximadamente 100 M de parámetros, pensado para funcionar con rapidez incluso en CPU. El autor indica que el entrenamiento partió de un modelo profesor de 24 capas (derivado de una versión inglesa de 24 capas de Kyutai) y aplicó destilación hacia 6 capas con el guidance "horneado" (integrado), evitando el doble paso en generación. El tokenizador es SentencePiece entrenado sobre un corpus ruso de 4000 tokens.

Es relevante porque demuestra que es posible adaptar un modelo TTS pequeño y ligero a un idioma concreto (ruso) y a un dominio específico (lectura de libros) manteniendo un coste computacional bajo, algo útil para despliegues en hardware modesto o sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer compacto de 6 capas (arquitectura pocket-tts de Kyutai) |
| Parametros totales | 109.502.146 (~109,5 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el autor recomienda fragmentos de texto de hasta ~180 caracteres |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se publican cuantizaciones) |
| Idiomas soportados | Ruso (ru) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors |
| Modelo base | kyutai/pocket-tts (relacion: finetune) |
| Libreria | pocket-tts |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura pocket-tts de Kyutai, descrita por el autor como un transformer de 6 capas y unos 100 M de parámetros. El proceso de entrenamiento indicado en la model card consiste en tomar un modelo profesor de 24 capas (procedente de una versión inglesa de 24 capas de Kyutai) y destilarlo en la variante de 6 capas con el guidance integrado, de modo que la generación no requiere doble pasada. El tokenizador es un SentencePiece entrenado sobre un corpus en ruso con un vocabulario de 4000 tokens.

La especialización es explícitamente hacia la lectura de libros: el modelo fue ajustado para lograr una locución uniforme, con entonación viva y soporte de clonación de voz a partir de una referencia de audio corta (el autor recomienda 5 segundos de habla limpia y una frase completa). También se entrenó con texto acentuado mediante el signo acuto (U+0301), lo que permite controlar la posición de las sílabas tónicas en la síntesis.

## Capacidades

- Sintesis de voz (text-to-speech) en ruso a partir de texto escrito.
- Lectura de libros y textos largos con estilo de audiolibro.
- Clonacion de voz por referencia: el modelo copia el timbre, el tempo y la banda de frecuencia a partir de un audio de referencia corto (~5 s recomendados).
- Control de acentuacion mediante el signo acuto (U+0301) en el texto de entrada.
- Soporte de dialogos y parrafos, con metricas diferenciadas para ambos tipos de contenido.
- Salida de audio a la frecuencia de muestreo definida por el modelo (`model.sample_rate`).
- No dispone de tool calling ni function calling.
- No dispone de modo agente ni razonamiento multi-paso.
- No dispone de capacidades de vision ni de audio de entrada mas alla de la referencia de voz para clonacion.

## Casos de uso

- Produccion de audiolibros: el modelo esta ajustado especificamente para lectura de libros con entonacion uniforme, y permite generar horas de narracion en lote a partir de un unico texto, con clonacion de una voz consistente para todo el titulo.
- Accesibilidad para personas con discapacidad visual: conversion de articulos, documentos o libros electronicos a audio en ruso con una voz natural y comprensible (CER del 1,6 % en parrafos de libro).
- Doblaje y locucion de contenido editorial: narracion de noticias, boletines o revistas con una voz clonada que mantenga el estilo de una marca o locutor concreto.
- Asistentes de voz embebidos en ruso: al ser un modelo de ~109,5 M de parametros y ejecutable en CPU, puede integrarse en dispositivos con recursos limitados que necesiten sintesis de voz local.
- Generacion de podcasts o contenido educativo: lectura de guiones y dialogos con control de acentuacion para asegurar la pronunciacion correcta de terminos tecnicos o nombres propios.
- Prototipado rapido de interfaces de voz: gracias a su tamano reducido y a la libreria pocket-tts, permite iterar en la generacion de audio sin depender de GPUs de gama alta.
- Personalizacion de voces para contenidos multimedia: clonacion de la voz de un narrador autorizado para series de audio o materiales corporativos, siempre con consentimiento explicito del propietario de la voz.
- Postproduccion de audio para videojuegos o e-learning: generacion por lotes de lineas de dialogo con una voz consistente y controlable en velocidad y entonacion mediante la referencia.

## Benchmarks y rendimiento

El autor publica metricas de calidad de sintesis medidas sobre 7 voces por 5 semillas, para parrafo de libro y dialogo:

| Metrica | Parrafo de libro | Dialogo |
|---|---|---|
| CER (inteligibilidad) | 1,6 % | 4,0 % |
| UTMOS (calidad de audio) | 3,64 | 3,52 |
| Obstrucciones / cortes | 0 de 70 | 0 de 70 |

No se han publicado resultados de benchmarks comparativos adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de sintesis de voz.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,44 GB en fp32 y 0,22 GB en fp16, calculado a partir de los 109,5 M de parametros; el autor indica que el modelo esta pensado para funcionar rapido en CPU. Estas cifras son estimaciones basadas en el recuento de parametros, no datos publicados por el autor.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, cualquier GPU moderna con al menos 1-2 GB de memoria libre deberia ser suficiente (por ejemplo, GTX 1650, RTX 3060, RTX 4090, A100, H100), aunque no hay cifras oficiales.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo actual e incluso en CPU, dado el tamano reducido del modelo.
- Opciones de despliegue: la model card muestra el uso mediante la libreria `pocket-tts` (`TTSModel.load_model`) y `scipy.io.wavfile` para guardar la salida. No se mencionan otros motores (vLLM, llama.cpp, Ollama, TGI) en la informacion disponible.
- Latencia y throughput: no disponibles. El autor solo indica que es "rapido y en CPU".

## Comparativa con modelos similares

| Modelo | Idioma | Parametros | Licencia | Notas |
|---|---|---|---|---|
| Shtorm_PocketTTS_RU | Ruso | ~109,5 M | CC-BY-4.0 | Finetune de pocket-tts para audiolibro; clonacion de voz |
| kyutai/pocket-tts | Ingles (base) | ~100 M aprox. | No disponible en la informacion proporcionada | Modelo base del que deriva este finetune |
| Silero TTS | Ruso y otros | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Alternativa conocida de TTS en ruso ligero |
| XTTS-v2 (Coqui) | Multilingue (incluye ruso) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | TTS multilingue con clonacion de voz |

Los datos de parametros, contexto y rendimiento de las alternativas no estan disponibles en la informacion proporcionada, por lo que la comparacion se limita a categoria e idioma.

## Limitaciones y advertencias

- Pausas excesivamente largas en algunos signos de puntuacion, segun reconoce el propio autor.
- Atenuacion de la amplitud en fragmentos largos (la voz se vuelve mas baja hacia el final); el autor propone corregirlo con normalizacion de volumen a la salida.
- Recomendacion de dividir el texto en fragmentos de hasta ~180 caracteres para evitar el problema anterior.
- La clonacion de voz debe realizarse unicamente con el consentimiento explicito del propietario de la voz; el autor prohibe su uso para suplantacion, desinformacion o fines dañinos o ilegales.
- Licencia CC-BY-4.0: requiere atribucion. Es necesario citar al autor del finetune y a Kyutai Labs como autor del modelo base al reutilizar o redistribuir el modelo.
- Idiomas: solo ruso. No hay soporte multilingue declarado.
- Al ser un modelo TTS pequeno, puede producir errores de pronunciacion o acentuacion en palabras poco frecuentes o nombres propios; el uso del signo acuto puede mitigarlo.
- Como todo modelo generativo, puede presentar alucinaciones a nivel acustico (sonidos o palabras no presentes en el texto de entrada), aunque no se cuantifica en la informacion disponible.
- No se documentan sesgos especificos (de genero, acento o dialecto) en la informacion proporcionada.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion externa de la comunidad ni informes de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ArtShtorm/Shtorm_PocketTTS_RU
- Modelo base en HuggingFace: https://huggingface.co/kyutai/pocket-tts
- Repositorio de pocket-tts (Kyutai): https://github.com/kyutai-labs/pocket-tts
