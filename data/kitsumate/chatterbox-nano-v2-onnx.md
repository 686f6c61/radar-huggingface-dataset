# KitsuMate/chatterbox-nano-v2-onnx

## Resumen

Chatterbox Nano ONNX v2 es una exportacion a formato ONNX del modelo de sintesis de voz Chatterbox Nano, desarrollada por KitsuMate a partir del checkpoint original en FP32 de ResembleAI/chatterbox-nano. No se trata de un lanzamiento oficial de Resemble AI: es una conversion independiente centrada en ejecucion sobre CPU de telefonos, con un perfil de velocidad especifico para dispositivos moviles. El modelo realiza sintesis de texto a voz (TTS) con capacidad de clonacion de voz, unicamente en ingles y sin soporte de streaming.

Tecnicamente, el sistema combina un modelo de lenguaje de estilo GPT-2 (denominado t3_nano_v1 en el checkpoint base), un codificador de voz (voice encoder, ve) y un decodificador mean-flow (s3gen_meanflow). La exportacion ofrece dos layouts: una referencia en FP32 y un perfil "CPU speed" que reemplaza el modelo de lenguaje y el decodificador por versiones con cuantizacion INT8 mixta, optimizadas para procesadores ARM. El repositorio ocupa 2,4 GB y se distribuye bajo licencia MIT.

Su relevancia actual radica en que permite ejecutar clonacion de voz de forma local en硬件 movil de gama media (validado en un Galaxy A33), con latencias cercanas a 1,5-1,9 veces el tiempo real, sin depender de GPUs ni de servicios en la nube. El propio autor advierte que no incluye voz de referencia, no aplica la marca de agua PerTh del modelo original y que la revision auditiva de la identidad vocal aun no se ha registrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema TTS con modelo de lenguaje tipo GPT-2 + codificador de voz (voice encoder) + decodificador mean-flow (s3gen_meanflow) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; generacion no streaming, sin ventana de contexto tipo LLM |
| Tipos de cuantizacion | FP32 (referencia); INT8 mixta (MatMulNBits weight-only, bloque 32, en modelo de lenguaje; INT8 dinamico per-channel en el decodificador); se menciona una version previa Q4F16 como referencia comparativa |
| Idiomas soportados | en (solo ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (grafos `.onnx` con datos externos `.onnx_data` / `.onnx.data`; incluye `tokenizer.json`, `manifest.json` y `SHA256SUMS`) |
| Tarea (pipeline) | text-to-speech |
| Modelo base | ResembleAI/chatterbox-nano (revision 71ccd1d0081b430592cea481f4307e764e07bc64) |
| Autor | KitsuMate |
| Tamano del repositorio | 2,4 GB |

## Arquitectura y entrenamiento

El sistema integra cuatro grafos ONNX: `speech_encoder.onnx` (codificador de voz que envuelve el voice encoder original, el tokenizador de voz y el front end de mel), `embed_tokens.onnx`, `language_model.onnx` y `conditional_decoder.onnx`. En el layout de referencia los cuatro grafos estan en FP32. En el layout "CPU speed", el modelo de lenguaje se reconstruye con kernels fusionados de ONNX Runtime (GroupQueryAttention, SkipLayerNormalization y FastGelu, reduciendo de 2345 a 122 nodos) manteniendo las capas 0-3 en FP32 y aplicando INT8 weight-only (MatMulNBits, bloque 32) a las capas 4-11 y a la cabeza; el autor indica que las capas iniciales de GPT-2 no toleran INT8. El decodificador INT8 usa MatMuls dinamicas por canal, dejando las convoluciones en FP32.

El modelo de lenguaje parece tener 12 capas (se citan las capas 0 a 11), aunque no se especifica el tamano total de parametros. Los pesos provienen del checkpoint `t3_nano_v1`, `ve` y `s3gen_meanflow`, cargados con el commit de codigo fuente de Chatterbox `5de7a54aa4e5e2baadb0182dde554908b48b85c2`. El grafo del decodificador mean-flow es el decodificador FP32 de `KitsuMate/chatterbox-turbo-onnx` (revision f74a6df4d27dbf84e59b8223a9dc4324e9c73483), ya que Nano y Turbo comparten pesos `s3gen_meanflow` identicos. No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO. La innovacion tecnica destacable es el perfil de velocidad para CPU movil: el pipeline original carga la referencia a 24 kHz y a 16 kHz, mientras que este grafo remuestrea internamente, lo que cambio un 6% de los tokens de prompt en la voz probada (el autor lo describe como una reproduccion cercana, no exacta).

## Capacidades

- Sintesis de texto a voz (TTS): genera audio a partir de texto en ingles.
- Clonacion de voz: soporta condicionamiento por audio de referencia para imitar una voz, aunque no se incluye ninguna voz de referencia en el repositorio.
- Ejecucion en CPU movil: los grafos INT8 estan orientados a procesadores ARM, con perfil de velocidad para telefonos.
- Uso en GPU: posible empleando el decodificador FP32 (el decodificador INT8 esta pensado para CPU).
- Generacion no streaming: el modelo no soporta salida por flujo continuo; procesa por frases o segmentos.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada general ni capacidades multilingues (solo ingles).
- Marca de agua PerTh: no aplicada en esta exportacion (el modelo original si la aplica).

## Casos de uso

- Sintesis de voz embebida en aplicaciones Android: el layout "CPU speed" permite generar voz local en telefonos de gama media (validado en Galaxy A33) sin conexion a red, usando ONNX Runtime con ejecucion en CPU.
- Lectura de pantalla y accesibilidad: integrable en lectores de pantalla o asistentes de accesibilidad que necesiten convertir texto en voz en el propio dispositivo, en ingles.
- Clonacion de voz personal para prototipos: a partir de un audio de referencia, el modelo puede generar locuciones con una identidad vocal concreta para demos o contenidos personalizados, siempre en ingles.
- Generacion de audio para videojuegos o aplicaciones: pre-generacion de locuciones (dialogos, avisos) en pipelines offline, aprovechando la licencia MIT para uso comercial.
- Narracion de contenido en ingles: audiolibros, resumenes hablados o articulos, generados por lotes desde texto.
- Asistentes de voz offline: sistemas de respuesta hablada que deban funcionar sin nube y con baja dependencia de hardware dedicado.
- Evaluacion e investigacion en TTS edge: banco de pruebas para estudiar cuantizacion INT8 y kernels fusionados en modelos TTS sobre CPU ARM.
- Doblaje asistido en ingles: generacion rapida de voces para prototipos de doblaje o previsualizaciones, dado el caracter no optimizado para produccion broadcast.

## Benchmarks y rendimiento

Los datos disponibles corresponden a validacion del autor (no son benchmarks estandar de la comunidad):

| Prueba | Resultado | Notas |
|---|---|---|
| Inteligibilidad (6 frases en ingles x 2 semillas, generacion libre, transcripcion con Whisper-small) | 4 errores de palabra en 152 palabras (todos por escribir "seven thirty" como "7.30"); todas las generaciones finalizaron | Igual en layout FP32 y en layout CPU speed |
| Latencia del modelo de lenguaje en Galaxy A33 | 6,7 s (Q4F16 publico previo) -> 5,0 s en un core grande | ONNX Runtime 1.30 CPU, dos hilos Cortex-A78, benchmark nativo, frase de 9 s con voz cacheada |
| Latencia del decodificador en Galaxy A33 | 15,0 s -> 12,3 s | Mismo entorno |
| Tiempo total en serie | ~1,9 veces el tiempo real | Cortex-A78 |
| Tiempo total con paralelismo | ~1,5 veces el tiempo real | Modelo de lenguaje de la frase siguiente en cores Cortex-A55 mientras los cores grandes decodifican |
| Revision auditiva de identidad vocal | no realizada (no registrada) | El autor indica que aun no se ha grabado |

No se han publicado resultados de benchmarks estandar (por ejemplo MMLU, HumanEval o GSM8K), ya que no son aplicables a un modelo de sintesis de voz.

## Requisitos de hardware

- CPU ARM: disenado para telefonos; validado en Samsung Galaxy A33 con ONNX Runtime CPU Execution Provider y dos hilos Cortex-A78, un core grande para el modelo de lenguaje de una frase de 9 s con voz cacheada y decodificacion en paralelo en Cortex-A55.
- GPU: no hay cifras de VRAM publicadas (no disponible). Si se usa GPU, el autor recomienda emplear el decodificador FP32, ya que los operadores INT8 del decodificador estan orientados a CPU.
- Tamano en disco: el repositorio completo ocupa 2,4 GB (incluye los grafos FP32 y los INT8); conviene mantener cada grafo junto a su archivo `.onnx_data` / `.onnx.data`.
- Caber en hardware de consumo: si, el objetivo es CPU movil de gama media; no requiere GPU dedicada.
- Opciones de despliegue: ONNX Runtime (CPU EP para los grafos INT8, proveedores GPU con el decodificador FP32); la libreria declarada en el repositorio es `chatterbox`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia/throughput: en Galaxy A33, ~1,9 veces el tiempo real en serie y ~1,5 veces el tiempo real con paralelismo big.LITTLE para la frase de 9 s probada. Estas son mediciones nativas, no resultados de un reproductor Unity.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| KitsuMate/chatterbox-nano-v2-onnx (este) | ONNX | FP32 + INT8 mixta | en | MIT | Perfil de velocidad para CPU movil; no es release oficial |
| KitsuMate/chatterbox-nano-onnx | ONNX | Precision mixta (no detallada) | no disponible | no disponible | Conversion independiente; el autor indica que los grafos no son intercambiables con este repositorio |
| ResembleAI/chatterbox-nano | Pesos originales (no ONNX) | FP32 | en | no disponible | Modelo base original; aplica marca de agua PerTh |
| KitsuMate/chatterbox-turbo-onnx | ONNX | no disponible | no disponible | no disponible | Fuente del decodificador mean-flow FP32; Nano y Turbo comparten pesos `s3gen_meanflow` |

Los datos de parametros, contexto y rendimiento de las alternativas no estan disponibles en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa completa.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues.
- No soporta streaming: la generacion es por segmentos completos.
- No es un lanzamiento oficial de Resemble AI; es una conversion de terceros.
- No incluye ninguna voz de referencia, por lo que la clonacion requiere aportar un audio propio.
- La marca de agua PerTh del modelo original no se aplica en esta exportacion, lo que puede afectar a la trazabilidad y al uso etico.
- La reproduccion no es exacta: el remuestreo interno cambio un 6% de los tokens de prompt en la voz probada.
- La revision auditiva de la identidad de la voz aun no se ha registrado; no hay validacion perceptual publicada.
- Los grafos no son intercambiables con `KitsuMate/chatterbox-nano-onnx` (el tokenizador de esta exportacion anade un token de fin de texto).
- Los grafos INT8 del modelo de lenguaje y del decodificador estan orientados a CPU; en GPU debe usarse el decodificador FP32, y las capas 0-3 del modelo de lenguaje no toleran INT8.
- Se observo un error sistematico de transcripcion ("seven thirty" -> "7.30") en la validacion, atribuible al postprocesado de Whisper-small mas que a la sintesis, pero conviene tenerlo en cuenta al evaluar inteligibilidad.
- Riesgo de artefactos o pronunciacion incorrecta en TTS; el modelo no genera contenido factual, por lo que el riesgo de alucinacion se manifiesta como errores de prosodia o segmentacion, no como afirmaciones falsas.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia MIT: permite uso comercial, pero al derivar del modelo base conviene revisar las condiciones de ResembleAI/chatterbox-nano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KitsuMate/chatterbox-nano-v2-onnx
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-nano
- Conversion alternativa del mismo autor: https://huggingface.co/KitsuMate/chatterbox-nano-onnx
- Repositorio fuente del decodificador mean-flow: https://huggingface.co/KitsuMate/chatterbox-turbo-onnx
