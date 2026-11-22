# erayyapagci/balbal-v1

## Resumen

balbal-v1 es un modelo de reconocimiento automatico del habla (ASR) para turco, desarrollado por erayyapagci y publicado en Hugging Face. Se trata de un ajuste fino (finetune) del modelo `nvidia/stt_en_conformer_ctc_small`, reconstruido con una arquitectura Conformer-CTC compacta de 45,4 millones de parametros almacenados y 15,4 millones activos por trama de audio. Incorpora un refinador en bucle de 2 capas y una memoria acustica de product-key, y se decodifica con un modelo de lenguaje KenLM de 6-gramas sobre tokens SentencePiece.

El modelo esta optimizado para eficiencia en CPU: segun la model card, procesa audio a 96 veces el tiempo real con 8 hilos y 30 veces con un solo hilo, transcribiendo un turno de llamada telefonica de hasta 3 segundos en unos 80 ms. Su objetivo declarado es el reconocimiento de voz en llamadas telefonicas en turco, ambito en el que reporta un WER del 11,93 % en el benchmark Mu-Bench turco, por delante de sistemas comerciales como GPT-4o-mini-transcribe, Deepgram Nova-3 o Microsoft Azure Speech en la tabla publicada por el autor.

La relevancia del modelo radica en su relacion precision/eficiencia: con un orden de magnitud menos parametros que Whisper large-v3-turbo, obtiene mejores resultados en el dominio telefonico, aunque queda por detras en el benchmark generico FLEURS. La licencia es propia (balbal-community-license-1.1), lo que condiciona su uso comercial, y el codigo de inferencia y entrenamiento se distribuye por separado bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (NeMo `EncDecCTCModelBPE`), 16 capas, d_model 176, 80 mel, subsampling 4x (tramas de 40 ms); refinador Transformer de 2 capas con 3 pasadas; memoria acustica product-key (500x500 subclaves, 4 cabezas, top-16, dim de valor 120, contexto de 3 tramas) |
| Parametros totales | 45,4 millones almacenados |
| Parametros activos | 15,4 millones activos por trama de audio |
| Longitud de contexto | Audio procesado en fragmentos fijos de 30 segundos, sin VAD; cada fragmento se decodifica por separado |
| Tipos de cuantizacion | No disponible (la model card cita ejecucion fp32 para las mediciones de velocidad; no se documentan releases cuantizados) |
| Idiomas soportados | Turco (tr) |
| Licencia | balbal-community-license-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | No disponible (libreria NeMo; el repositorio incluye runtime ONNX segun los tags `onnx` y el script `inference/runtime_onnx.py`) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/stt_en_conformer_ctc_small` y lo ajusta para turco. La arquitectura es un Conformer-CTC de 16 capas con dimension de modelo 176, 80 filtros mel y subsampling 4x, lo que produce tramas de 40 ms. Sobre la salida del codificador se aplica un refinador Transformer de 2 capas que se ejecuta en 3 pasadas, alimentando cada pasada la distribucion CTC anterior como entrada. Ademas, se incorpora una memoria acustica de product-key con 500x500 subclaves, 4 cabezas, seleccion top-16 y dimension de valor 120 sobre un contexto de 3 tramas; la mayor parte de esa tabla no se lee en cada trama, de ahi la diferencia entre parametros almacenados y activos.

El vocabulario es SentencePiece de 1024 piezas mas el token blank de CTC (1025 clases). La decodificacion combina un KenLM de 6-gramas sobre tokens con busqueda por haces sin lexico mediante flashlight-text (alpha 0,75, beta 1,5, temperatura 1,2, beam 64, top-12 tokens, umbral 8). La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada. La salida es turco con mayusculas y puntuacion, pero sin normalizacion inversa de texto: numeros, codigos y direcciones de correo se escriben como palabras.

## Capacidades

- Reconocimiento automatico del habla en turco, con salida en minusculas/mayusculas y puntuacion.
- Transcripcion de audio telefonico de banda estrecha, dominio para el que esta optimizado.
- Procesamiento de audio largo mediante fragmentacion fija en bloques de 30 segundos (sin VAD).
- Decodificacion con modelo de lenguaje KenLM de 6-gramas sobre tokens, que corrige hipotesis acusticas ambiguas.
- Inferencia eficiente en CPU: 96x tiempo real con 8 hilos y 30x con un solo hilo, segun el autor.
- Ejecucion en fp32 con runtime ONNX documentado en el repositorio de codigo.
- No dispone de tool calling, function calling, agentes, vision, audio multimodal ni modo de razonamiento; es un modelo puramente ASR.

## Casos de uso

- Transcripcion de llamadas telefonicas: el modelo esta entrenado y evaluado especificamente en el dominio telefonico (Mu-Bench), donde supera a varios sistemas comerciales; se usaria como motor ASR en plataformas de atencion al cliente o centros de contacto.
- Analitica de contact center: transcripcion masiva de grabaciones para busqueda, scoring de calidad y deteccion de motivos de llamada, aprovechando el rendimiento de 96x tiempo real en CPU para procesar volumenes grandes sin GPU.
- Subtitulado y actas de reuniones en turco: con fragmentacion en bloques de 30 segundos, puede transcribir audio de forma secuencial; adecuado para reuniones y notas de voz donde la precision telefonica es suficiente.
- Asistentes de voz embebidos: el bajo coste computacional (80 ms por turno de 3 segundos en un hilo) permite integrarlo en servicios de IVR o aplicaciones locales sin infraestructura GPU.
- Procesamiento por lotes en servidores sin acelerador: al ejecutarse en CPU con fp32 y ONNX, encaja en pipelines de backend convencionales donde el coste de GPU es prohibitivo.
- Investigacion en ASR de lenguas de bajos recursos: sirve como punto de partida (finetune de un Conformer pequeno) para experimentos con turco y otras lenguas turquicas, dado que el codigo de entrenamiento es abierto bajo Apache 2.0.
- Preprocesado de datos para otros sistemas: transcripcion de corpus de audio turco para alimentar modelos de lenguaje o sistemas de recuperacion de informacion.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (FLEURS tr, 743 clips; Mu-Bench tr-TR, 846 clips; WER en %):

| Modelo | Parametros (almacenados / activos) | FLEURS tr WER | Mu-Bench WER oficial | Mu-Bench sigWER | Velocidad CPU (RTTF) |
|---|---|---|---|---|---|
| balbal-v1 | 45,4M / 15,4M | 6,54 | 11,93 | 25,18 | 96x |
| Duyu-small | 49,3M / 19,3M | 6,62 | 15,70 | 35,22 | 27x |
| MihuAI turkish-stt | 66M | 8,16 | 24,59* | 49,53* | 15x |
| MihuAI turkish-stt-v2 | 66M | 5,26 | 10,91* | 21,16* | 15x |
| omniASR LLM 7B | 7B | 5,31 | 21,10 | 44,68 | no medido |
| Whisper large-v3-turbo | 809M | 4,07 | 24,65† | 47,04† | 1,6x |
| Whisper base | 74M | 25,99 | 40,88† | 68,68† | 9,9x |

Notas del autor: los asteriscos indican que MihuAI uso sus releases INT8; las dagas indican clips de Whisper con bucles de repeticion contados como totalmente erroneos. RTTF = segundos de audio por segundo de procesamiento, batch 1, 8 hilos de un AMD Ryzen AI Max+ 395, fp32. El analisis de significancia con bootstrap pareado (10.000 remuestreos) indica que balbal-v1 supera de forma significativa a Duyu-small, MihuAI turkish-stt, omniASR LLM 7B y Whisper large-v3-turbo en Mu-Bench, empata con Duyu-small en FLEURS y queda por detras de MihuAI turkish-stt-v2 y Whisper large-v3-turbo en FLEURS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta disenado para ejecucion en CPU en fp32 y el repositorio pesa 0,4 GB, por lo que el consumo de memoria es muy bajo (los pesos completos caben holgadamente en RAM convencional).
- GPU recomendadas: no se documentan; el autor reporta mediciones en CPU (AMD Ryzen AI Max+ 395). Cualquier GPU consumer moderna (por ejemplo RTX 4090) seria sobredimensionada para este modelo.
- Cabe en GPU consumer: si, con amplio margen; tambien funciona enteramente en CPU, que es su escenario objetivo.
- Opciones de despliegue: NeMo (libreria declarada), runtime ONNX incluido en el repositorio (`inference/runtime_onnx.py`) y decodificacion KenLM con flashlight-text; el paquete `pip install balbal` se anuncia en la model card. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo ASR CTC de este tipo).
- Latencia y throughput: 96x tiempo real con 8 hilos y 30x con un solo hilo; aproximadamente 80 ms para un turno de llamada de hasta 3 segundos en un hilo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / procesamiento | Rendimiento (Mu-Bench WER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| balbal-v1 | 45,4M / 15,4M activos | Fragmentos de 30 s | 11,93 | balbal-community-license-1.1 | Hugging Face, codigo Apache 2.0 |
| Duyu-small | 49,3M / 19,3M activos | No disponible | 15,70 | No disponible | Hugging Face |
| MihuAI turkish-stt-v2 | 66M | No disponible | 10,91 (INT8) | No disponible | Hugging Face |
| Whisper large-v3-turbo | 809M | 30 s por ventana | 24,65 | MIT (modelo de OpenAI) | Hugging Face |
| omniASR LLM 7B | 7B | No disponible | 21,10 | No disponible | GitHub (Meta) |

balbal-v1 destaca por ser el mas pequeno del grupo en parametros activos y el mas rapido en CPU, con precision telefonica superior a Duyu-small, Whisper large-v3-turbo y omniASR LLM 7B, pero inferior a MihuAI turkish-stt-v2 en Mu-Bench y a Whisper en FLEURS (dominio generico).

## Limitaciones y advertencias

- Solo soporta turco; no es multilingue.
- Sin normalizacion inversa de texto: numeros, codigos y correos se transcriben como palabras ("yuz yirmi uc"), lo que exige postprocesado para muchos flujos de produccion.
- Segmentacion fija en bloques de 30 segundos sin VAD: puede cortar palabras en los limites de fragmento y no gestiona silencios de forma inteligente.
- Riesgo de errores en audio fuera del dominio telefonico; el rendimiento en FLEURS (6,54 % WER) es bueno pero inferior a Whisper large-v3-turbo (4,07 %).
- Riesgo de alucinacion o bucles de repeticion en audio ruidoso o silencioso, fenomeno documentado en modelos ASR comparables (Whisper); no se documenta mitigacion especifica en la model card.
- Sesgos: no se documentan sesgos demograficos, dialectales o de acento; al entrenarse sobre datos no descritos, la cobertura de acentos regionales turcos es incierta.
- Licencia restrictiva: balbal-community-license-1.1 (no es Apache 2.0 ni MIT); el uso comercial requiere revisar los terminos del archivo LICENSE. El codigo de inferencia y entrenamiento si es Apache 2.0.
- El modelo se apoya en un KenLM externo y un runtime ONNX especifico; la reproducibilidad de los resultados depende de esa configuracion de decodificacion (alpha 0,75, beta 1,5, beam 64, etc.).
- La model card recomienda ya balbal-v2 y balbal-v2-manas por ser "mas rapidos y precisos"; balbal-v1 queda como version anterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/erayyapagci/balbal-v1
- Demo en el navegador: https://huggingface.co/spaces/erayyapagci/balbal-v1-demo
- Blog tecnico (arquitectura, entrenamiento, evaluacion): https://erayy.com/balbal-blog
- Pagina del proyecto: https://erayy.com/balbal
- Codigo de inferencia y entrenamiento (Apache 2.0): https://github.com/erayyap/balbal
- Dataset de evaluacion (transcripciones, puntuaciones, pruebas de velocidad): https://huggingface.co/datasets/erayyapagci/balbal-evals
- Version posterior balbal-v2: https://huggingface.co/erayyapagci/balbal-v2
- Version posterior balbal-v2-manas: https://huggingface.co/erayyapagci/balbal-v2-manas
- Modelo base: https://huggingface.co/nvidia/stt_en_conformer_ctc_small
