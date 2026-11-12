# craigfubara/kirike-listen-web

## Resumen

Kirike-Listen v0.2 (browser edition) es un modelo de reconocimiento automatico del habla (ASR) desarrollado por IjawConnect para las lenguas ijaw orientales, concretamente okrika, kalabari e ibani. Se distribuye como un modelo wav2vec2 con cabecera CTC exportado a ONNX y cuantizado a 8 bits, pensado para ejecutarse integramente en el navegador mediante transformers.js y onnxruntime-web, de modo que el audio se procesa en el dispositivo del usuario y nunca se sube a un servidor.

El modelo parte del encoder wav2vec 2.0 de Meta Omnilingual ASR de 300 millones de parametros (`ylacombe/omniASR_W2V_300M_SSL`, Apache 2.0) y se ha afinado sobre la porcion kalabari del Omnilingual ASR Corpus. La salida se escribe con la ortografia okrika (punto inferior en ị ẹ ọ ụ ḅ ḍ) pero sin tonos. Es relevante por su enfoque de privacidad y despliegue en el borde para lenguas con muy pocos recursos, aunque sus propios autores advierten de que la calidad es todavia experimental.

El repositorio ocupa 0,4 GB y el fichero ONNX cuantizado ronda los 340 MB. La licencia es Apache 2.0 y la libreria declarada es transformers.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 con cabecera CTC (encoder transformer convolucional + self-attention) |
| Parametros totales | 300M (modelo base); fichero ONNX cuantizado de ~340 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; clips de prueba cortados a 30 s) |
| Tipos de cuantizacion | int8 por canal en los pesos matriciales (`model_quantized.onnx`) |
| Idiomas soportados | ijn (kalabari), okr (okrika); menciona tambien ibani en la descripcion |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), con runtime WASM de onnxruntime-web 1.31.1 |

## Arquitectura y entrenamiento

El modelo es un wav2vec 2.0 de Meta (variante Omnilingual ASR de 300M) con una cabeza de clasificacion CTC de 33 simbolos. La entrada son muestras de audio a 16 kHz mono normalizadas a media cero y varianza unitaria en el tensor `input_values` de forma `[1, samples]`; la salida son `logits` de forma `[1, frames, 33]`. La decodificacion es greedy: se toma la mejor letra por frame, se colapsan repeticiones, se descartan los ids 29-32 (`[UNK]`, `[PAD]` como blank CTC, `<s>`, `</s>`) y se convierte `|` en espacio.

El ajuste fino se realizo sobre la parte kalabari (`ijn_Latn`) del Omnilingual ASR Corpus de Meta (CC BY 4.0), con las transcripciones reescritas a ortografia okrika (linea inferior convertida a punto inferior, tonos eliminados). Se entrenaron 12 epocas en una unica GPU T4, sobre aproximadamente 11 horas de audio kalabari. No se menciona RLHF ni DPO. La edicion publica se exporto a ONNX (opset 17) y se cuantizo a 8 bits por canal; segun el autor, en 60 clips de test kalabari retenidos el CER es identico al del modelo completo (0,686 frente a 0,686, clips cortados a 30 s) y la inferencia es aproximadamente el doble de rapida. El modelo maestro se conserva en privado por IjawConnect.

## Capacidades

- Transcripcion de voz a texto para kalabari y, por extension de ortografia, okrika (sin entrenamiento especifico en okrika).
- Salida en ortografia okrika con vocales y consonantes de punto inferior (ị ẹ ọ ụ ḅ ḍ), sin tonos ni puntuacion.
- Ejecucion local en navegador mediante transformers.js y onnxruntime-web (WASM SIMD multihilo con JSEP).
- Procesamiento en el dispositivo: el audio no se sube a ningun servidor.
- Decodificacion CTC greedy integrada en el pipeline de ASR.
- No soporta tool calling, function calling, agentes, vision, audio de salida ni modo thinking.

## Casos de uso

- Transcripcion privada en el navegador: la pagina Listen de ijawconnect.com descarga el modelo una vez y transcribe grabaciones en el propio dispositivo, lo que permite dictar o documentar audio sin conexion a un servicio externo y sin exponer datos personales.
- Documentacion de lengua en campo: investigadores y hablantes pueden grabar entrevistas en kalabari y obtener una transcripcion fonetica aproximada que despues un hablante revisa, reduciendo el trabajo manual de transcripcion en lenguas con pocos recursos.
- Aplicaciones educativas de alfabetizacion: el modelo puede servir de apoyo para practicar la ortografia okrika con punto inferior, mostrando al estudiante una transcripcion de referencia que el docente valida.
- Prototipado web sin infraestructura: al ejecutarse como ONNX en WASM, se puede integrar en una pagina estatica o PWA sin desplegar GPUs ni servicios de inferencia, lo que abarata la experimentacion.
- Archivado y busqueda de audio comunitario: transcripciones aproximadas que permiten indexar grabaciones y localizar fragmentos por palabras clave, siempre con revision humana posterior.
- Investigacion comparativa de ASR de bajos recursos: sirve como punto de partida (fine-tuning de un wav2vec2 de 300M) para otros idiomas ijaw o variantes, ya que el pipeline de exportacion ONNX y cuantizacion esta documentado.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER (test kalabari retenido) | ~0,46 | Segun la model card; clips de test retenidos |
| WER (test kalabari retenido) | ~0,82 | Segun la model card |
| CER modelo cuantizado vs. completo | 0,686 vs. 0,686 | 60 clips de test kalabari, cortados a 30 s |
| Velocidad relativa | ~2x mas rapido | Modelo cuantizado frente al completo |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; los datos anteriores son especificos de ASR en kalabari.

## Requisitos de hardware

- Inferencia en navegador: no requiere VRAM dedicada; usa WebAssembly (WASM SIMD multihilo con JSEP) sobre CPU del dispositivo.
- Tamano en disco/red: descarga unica de ~340 MB para el modelo ONNX cuantizado, mas el runtime WASM de onnxruntime-web 1.31.1.
- GPU: no se requiere GPU; el autor entreno en una unica T4 pero la edicion publica esta pensada para ejecucion en cliente.
- Cabe en cualquier dispositivo consumer con navegador moderno compatible con WASM SIMD; no se especifican requisitos minimos de RAM.
- Opciones de despliegue: transformers.js en navegador; el fichero ONNX podria cargarse con onnxruntime en otros entornos, aunque no se documenta.
- Latencia y throughput: no disponibles de forma numerica; solo se indica que la version cuantizada es aproximadamente el doble de rapida que la completa.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Kirike-Listen v0.2 | 300M | ijn, okr | ONNX int8 | Apache 2.0 | Especializado en ijaw oriental, ejecucion en navegador |
| ylacombe/omniASR_W2V_300M_SSL (base) | 300M | multilingue (Omnilingual) | safetensors | Apache 2.0 | Modelo base sin ajuste a kalabari/okrika |
| Wav2Vec2 base de Hugging Face (p. ej. wav2vec2-base-960h) | ~95M | ingles | safetensors/ONNX | Apache 2.0 | Referencia general de ASR, no cubre lenguas ijaw |

No se dispone de datos de benchmarks comparativos con estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado solo con unas 11 horas de audio kalabari; no se ha entrenado en okrika, por lo que la cobertura de esta lengua es indirecta.
- Calidad baja: aproximadamente una letra de cada dos incorrecta en test kalabari (CER ~0,46, WER ~0,82); la salida debe revisarla un hablante.
- No genera tonos ni puntuacion; las palabras cortas suelen fusionarse o separarse incorrectamente.
- No debe tratarse como transcripcion okrika verificada, sino como transcripcion fonetica aproximada.
- Riesgo de alucinacion y errores sistematicos en vocabulario fuera del dominio de entrenamiento.
- Sesgos derivados del corpus de origen (Omnilingual ASR Corpus) y de la reescritura ortografica automatica de transcripciones.
- Licencia Apache 2.0 permite uso comercial, pero el corpus de entrenamiento es CC BY 4.0 y requiere atribucion a Meta; el runtime WASM es MIT y requiere conservar su NOTICE.
- El modelo maestro no es publico; solo se distribuye esta edicion de navegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/craigfubara/kirike-listen-web
- Modelo base: https://huggingface.co/ylacombe/omniASR_W2V_300M_SSL
- Dataset de entrenamiento: https://huggingface.co/datasets/facebook/omnilingual-asr-corpus
- Demo en produccion: https://ijawconnect.com/language/listen
- onnxruntime-web (runtime MIT): no disponible como enlace en la informacion proporcionada
- Paper de Omnilingual ASR: no disponible en la informacion proporcionada
