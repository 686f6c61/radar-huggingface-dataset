# ankur-mourya-2026/mithi-v1-flash

## Resumen

Mithi v1 Flash es un modelo de síntesis de voz (text-to-speech) de pequeno tamano desarrollado por el usuario de Hugging Face `ankur-mourya-2026` (el repositorio original de referencia aparece bajo la organizacion `Oomni`). Resuelve el problema de generar voz natural en once idiomas de la India —hindi, ingles, bengali, gujarati, kannada, malayalam, marathi, odia, punyabi, tamil y telugu— con un unico modelo ligero de 99,1 millones de parametros y un peso de 197 MB en safetensors bf16. Su relevancia actual radica en que ofrece cobertura multilingue indic amplia con una huella minima, lo que permite desplegarlo en CPU, portatiles o dispositivos de bajos recursos.

El modelo se apoya en componentes de codigo abierto: el codificador de texto y el decodificador de Kokoro-82M, el modelo de representacion de palabras indic-bert, el normalizador de texto de Maya y el sistema G2P misaki. La salida es audio mono a 24 kHz. Ofrece dos voces fijas, Satvik (masculina) y Charvi (femenina), y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

No se han publicado detalles sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del corpus, mas alla de que la voz de entrenamiento se genero con inferencia de Maya2-native. El modelo esta pensado como una alternativa compacta y desplegable en entornos con recursos limitados, no como un sistema de voz expresiva de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS basada en Kokoro-82M (codificador de texto y decodificador), con indic-bert para representacion de palabras |
| Parametros totales | 99,1 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa el texto frase a frase) |
| Tipos de cuantizacion | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | hi, en, bn, gu, kn, ml, mr, or, pa, ta, te (11 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |
| Frecuencia de muestreo de salida | 24 kHz, mono |
| Voces | satvik (masculina), charvi (femenina) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

Mithi v1 Flash es un sistema TTS que reutiliza la arquitectura de Kokoro-82M para el codificador de texto y el decodificador de audio, incorporando indic-bert para la representacion semantica de palabras en los idiomas indic. El pipeline incluye un normalizador de texto propio (derivado de Maya) que expande numeros, horas y divisas a palabras, y un sistema G2P basado en misaki para la conversion grafema-fonema. El modelo opera frase a frase, de modo que el texto largo se procesa de forma automatica por oraciones.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO; la model card solo indica que la voz de entrenamiento se genero mediante inferencia de Maya2-native. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. El modelo se distribuye unicamente en bf16, sin variantes cuantizadas oficiales.

## Capacidades

- Sintesis de voz (text-to-speech) en 11 idiomas: hindi, ingles, bengali, gujarati, kannada, malayalam, marathi, odia, punyabi, tamil y telugu.
- Dos voces predefinidas: Satvik (masculina) y Charvi (femenina).
- Normalizacion de texto integrada: expansion de numeros, horas y divisas a palabras antes de la sintesis.
- Procesamiento automatico de texto largo mediante segmentacion por frases.
- Inferencia en GPU y en CPU, con control del numero de hilos en CPU.
- Conversion grafema-fonema (G2P) para los idiomas soportados mediante misaki.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo thinking; es exclusivamente un modelo de sintesis de voz.

## Casos de uso

- Audiolibros y contenido editorial en idiomas indic: el modelo lee texto largo frase a frase de forma automatica, con lo que se puede generar narracion continua en hindi, tamil o bengali sin segmentacion manual.
- Asistentes de voz para atencion al cliente: con dos voces y salida a 24 kHz, se puede integrar en flujos de IVR o chatbots telefonicos para responder en el idioma del usuario, incluyendo lectura de citas, horarios y cantidades gracias al normalizador de texto.
- Accesibilidad y lectura de pantalla: al ejecutarse en CPU con un consumo de recursos minimo (99,1 M de parametros), es adecuado para aplicaciones de lectoescritura en dispositivos sin GPU, como portatiles o Raspberry Pi.
- Locucion para videos y anuncios en redes: generacion de voces masculina y femenina en once idiomas para doblaje o voice-over de contenido formativo y divulgativo.
- Sistemas de megafonia y avisos en entornos publicos: sintesis de anuncios con numeros, horas y divisas expandidos a palabras, util en estaciones, aeropuertos o comercios de India.
- Prototipado e investigacion en TTS multilingue: al estar bajo Apache 2.0 y construido sobre Kokoro e indic-bert, sirve como base para experimentar con voces y normalizacion en idiomas de bajos recursos.
- Integracion en aplicaciones moviles o embebidas: el peso de 197 MB en bf16 y la inferencia en CPU permiten incluir el modelo en apps sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta mediciones de latencia en CPU para una frase media de 15 palabras (unos 7 s de habla) en un servidor AMD EPYC 9554:

| Hilos de CPU | Tiempo por frase |
|---|---|
| 1 | ~8 s |
| 4 | ~3 s |

No se documentan cifras de MOS, WER, RTF en GPU ni comparaciones objetivas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada: el modelo pesa 197 MB en bf16; la inferencia en GPU requiere muy poca memoria (del orden de menos de 1 GB incluyendo el runtime de PyTorch), aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se especifican modelos concretos. El modelo esta disenado para funcionar tambien sin GPU.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo moderna, dado su tamano inferior a 0,2 GB.
- Despliegue en CPU: soportado oficialmente con `--device cpu` y control de hilos; en un AMD EPYC 9554 tarda unos 3 s por frase de 15 palabras con 4 hilos.
- Opciones de despliegue: el repositorio incluye `inference.py` y el paquete `mithi_tts` para uso desde linea de comandos o Python. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: solo se publican las cifras de CPU anteriores; no hay datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mithi v1 Flash | 99,1 M | 11 (indic + ingles) | 24 kHz mono, procesamiento por frases | Apache 2.0 | Hugging Face |
| Kokoro-82M | 82 M | no disponible en la informacion | no disponible | Apache 2.0 (segun la model card de Mithi) | Hugging Face |
| Maya2-native | no disponible | no disponible | no disponible | Apache 2.0 (segun la model card de Mithi) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. Mithi reutiliza componentes de Kokoro-82M y se entreno con voz generada por Maya2-native, por lo que ambos son referencias directas de su linaje tecnico.

## Limitaciones y advertencias

- Solo dispone de dos voces fijas (Satvik y Charvi); no permite clonacion de voz ni control de estilo o emocion.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con voz sintetica de Maya2-native puede heredar artefactos o sesgos de ese sistema.
- Riesgo de alucinacion no aplicable en el sentido textual, pero si de errores de pronunciacion o entonacion en palabras fuera del dominio de entrenamiento.
- La normalizacion de texto y el G2P pueden fallar con abreviaturas, siglas o numeros complejos no cubiertos por el normalizador.
- No se especifica la longitud maxima de texto por llamada; el procesamiento es frase a frase, lo que puede introducir discontinuidades en la prosodia entre oraciones.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la licencia y los creditos de los componentes (Kokoro-82M, indic-bert, Maya, misaki).
- El repositorio indica 0 descargas y 0 likes en el momento de la consulta, y el ID del autor difiere del de la model card (`Oomni`), lo que conviene verificar antes de usarlo en produccion.
- No hay datos publicados sobre calidad objetiva (MOS, WER) ni sobre rendimiento en GPU.

## Enlaces

- Hugging Face: https://huggingface.co/ankur-mourya-2026/mithi-v1-flash
- Repositorio referenciado en la model card: https://huggingface.co/Oomni/mithi-v1-flash
- Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Maya2-native: https://huggingface.co/maya-research/maya2-native
