# richardr1126/chatterbox-nano-voice-encoder-coreai

## Resumen

Chatterbox Nano voice encoder coreai es un paquete de codificadores de audio publicado por el usuario richardr1126 para el runtime Core AI de Apple. No es un modelo generativo de texto: su pipeline declarado es `feature-extraction` y su funcion es convertir una grabacion corta (10-15 segundos) en una "voz" de Chatterbox Nano lista para usarse en OpenReader y en aplicaciones iOS. El paquete deriva directamente de los pesos oficiales de `ResembleAI/chatterbox-nano` (revision `71ccd1d0081b430592cea481f4307e764e07bc64`) y no incluye ninguna grabacion de audio.

Contiene tres componentes propios de Chatterbox: el tokenizador de voz S3, el codificador de hablante CAM++ y el codificador de voz, todos ellos reempaquetados como un unico fichero `voice_encoder.aimodel` con cinco funciones exportadas. El paquete esta separado del runtime Nano porque solo lo necesita quien va a crear una voz: OpenReader lo ejecuta una vez por voz y guarda el resultado junto a la referencia, de modo que la narracion posterior nunca vuelve a cargarlo.

La relevancia actual es su enfoque de despliegue: pesos en FP16 con computo en FP32 y ejecucion exclusivamente en CPU (el lowering a GPU falla dentro de MPS). El programa FP32 ocupa 517 MB y esta orientado a inferencia en el dispositivo, con verificacion en un iPhone 15 Pro mediante una build Release de OpenReader.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete de codificadores: tokenizador de voz S3, codificador de hablante CAM++ y codificador de voz con LSTM (mas proyeccion propia y proyeccion de hablante de T3) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entradas de audio de 10-15 s a 16 kHz y de 10 s a 24 kHz |
| Tipos de cuantizacion | pesos en FP16 con computo en FP32; tensores host FP32 en `voice-encoder/` |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | `aimodel` (Core AI / Apple) para `voice_encoder.aimodel`; tensores host FP32 en `voice-encoder/` descritos en `voice-encoder.json` |

## Arquitectura y entrenamiento

El paquete reutiliza los encoders originales de Chatterbox Nano y no reentrena nada. Se compone de: el tokenizador de voz S3 (que produce tokens de habla), el codificador de hablante CAM++ (que produce un x-vector de 192 dimensiones) y el codificador de voz. El fichero `voice_encoder.aimodel` expone cinco funciones: `tokenizer_mel` (10-15 s a 16 kHz hacia log-mel del tokenizador S3), `tokenizer` (ese mel, con padding a multiplo de cuatro, mas su longitud valida, hacia tokens de habla S3), `speaker` (10 s a 16 kHz hacia x-vector CAM++ de 192), `prompt_mel` (10 s a 24 kHz hacia caracteristicas de prompt S3 de 500 x 80) y `voice_mel` (habla recortada a 16 kHz hacia mel del codificador de voz de 40 bandas).

Una decision tecnica destacable es que la LSTM del codificador de voz, su proyeccion y la proyeccion de hablante de T3 se mantienen como tensores host en FP32 dentro de `voice-encoder/`, con formas y sumas de verificacion documentadas en `voice-encoder.json`. El motivo indicado es que una capa recurrente desenrollada tarda en especializarse en ambos backends de Core AI y su tamano es lo bastante reducido como para ejecutarse en el host. Los pesos son FP16 y el computo FP32, exclusivamente en CPU: el programa FP32 ocupaba 517 MB y el lowering a GPU falla dentro de MPS. El paquete espera el preprocesado de upstream (una referencia de 24 kHz a -27 LUFS, una copia a 16 kHz y el recorte de silencio de 20 dB de librosa antes de `voice_mel`).

## Capacidades

- Conversion de una grabacion corta (10-15 s) en una voz de Chatterbox Nano utilizable para narracion.
- Extraccion de caracteristicas de voz: log-mel del tokenizador S3, tokens de habla S3, caracteristicas de prompt S3 (500 x 80) y mel de 40 bandas del codificador de voz.
- Extraccion de embeddings de hablante: x-vector CAM++ de 192 dimensiones a partir de 10 s de audio a 16 kHz.
- Ejecucion en el dispositivo en CPU dentro del runtime Core AI de Apple, verificado en iPhone 15 Pro.
- Preprocesado de audio previo al modelado (reduccion a 24 kHz, copia a 16 kHz y recorte de silencio).
- No realiza generacion de texto, razonamiento, codigo ni matematicas.
- No incluye tool calling, ni soporte de agentes, ni capacidades multimodales mas alla del audio.
- Capacidad multilingue: no; el paquete esta declarado unicamente para ingles (`en`).
- No incluye modo "thinking", vision ni audio de salida: solo produce embeddings y caracteristicas.

## Casos de uso

- Clonacion de voz en aplicaciones iOS de lectura: OpenReader ejecuta el paquete una vez por voz a partir de una grabacion de 10-15 s y guarda el resultado junto a la referencia, de modo que la narracion posterior no vuelve a cargar los encoders.
- Narracion de textos con la propia voz del usuario: el x-vector CAM++ (192 dimensiones) y las caracteristicas de prompt S3 permiten fijar la identidad de voz de forma persistente y reutilizarla entre sesiones.
- Audiolibros y contenido hablado personalizado: al ejecutarse en CPU en el dispositivo, no requiere conexion a red ni envio de la grabacion a un servidor, lo que facilita el tratamiento local de la voz del usuario.
- Aplicaciones de accesibilidad: usuarios que pierden o degradan su voz pueden conservar una referencia y reutilizarla para sintetizar narracion con su timbre, ejecutando el codificador solo una vez.
- Verificacion o identificacion de hablante: la funcion `speaker` produce directamente un x-vector normalizado de 192 dimensiones utilizable como embedding para comparar hablantes.
- Preprocesado para pipelines de TTS en el dispositivo: `tokenizer_mel` y `tokenizer` generan los tokens de habla S3 que alimentan etapas posteriores del sistema Chatterbox Nano dentro de la app.
- Integracion en apps nativas de Apple mediante Core AI: el fichero `voice_encoder.aimodel` se invoca como cinco funciones independientes, lo que permite llamar solo al codificador necesario en cada flujo.

## Benchmarks y rendimiento

Los unicos datos publicados comparan este paquete con el PyTorch de upstream en CPU de Mac, con entradas identicas en cinco clips:

| Metrica | Resultado (frente a PyTorch upstream en CPU de Mac) |
|---|---|
| Coincidencia de tokens S3 | al menos 99,7% |
| Coseno del x-vector | al menos 0,9999987 |
| Error de mel | como maximo 1,1e-4 |

Ademas, en un iPhone 15 Pro la build Release de OpenReader reprodujo exactamente las condicionales del Mac (segun `clone-results.json`). El paquete indica tambien que el computo en media precision cambio un token S3 de cada 1.875 con mas frecuencia de la que producia el propio ruido FP32 de la CPU. No se han publicado resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM: no aplica; el computo se ejecuta exclusivamente en CPU (el lowering a GPU falla dentro de MPS).
- Memoria: el programa FP32 ocupaba 517 MB; el repositorio completo ocupa 0,3 GB.
- GPU: no soportadas en esta configuracion; el backend MPS falla.
- Cabe en cualquier dispositivo Apple moderno con CPU suficiente; verificado en un iPhone 15 Pro.
- Opciones de despliegue: runtime Core AI de Apple mediante `voice_encoder.aimodel`; los tensores host FP32 de `voice-encoder/` se cargan aparte.
- Latencia y throughput: no disponible (no se publican cifras de tiempo por inferencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| chatterbox-nano-voice-encoder-coreai (este) | no disponible | audio de 10-15 s a 16 kHz; 10 s a 24 kHz | MIT | HuggingFace |
| ResembleAI/chatterbox-nano (upstream) | no disponible | audio de referencia de 24 kHz a -27 LUFS | MIT | HuggingFace |

No se dispone de informacion sobre otros paquetes de codificadores de voz para Core AI comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles (`en`); no esta declarado para otros idiomas.
- No es un modelo de generacion de texto ni de sintesis de voz directa: solo produce embeddings y caracteristicas de audio.
- Restriccion de hardware: no hay soporte de GPU en esta configuracion; el lowering a GPU falla dentro de MPS, por lo que depende de la CPU.
- Precision: el computo en media precision altero un token S3 de cada 1.875 con mas frecuencia que el ruido FP32 de la CPU, lo que puede introducir diferencias respecto al comportamiento de referencia.
- El paquete depende del preprocesado exacto de upstream (24 kHz a -27 LUFS, copia a 16 kHz y recorte de silencio de 20 dB de librosa antes de `voice_mel`); omitirlo degrada los resultados.
- No incluye grabaciones de audio, por lo que no puede evaluarse la calidad de clonacion a partir del repositorio.
- Sesgos conocidos y riesgo de alucinacion: no disponible (no se documentan en la model card).
- Licencia MIT, igual que upstream, segun `LICENSE.txt`; permite uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/richardr1126/chatterbox-nano-voice-encoder-coreai
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-nano
