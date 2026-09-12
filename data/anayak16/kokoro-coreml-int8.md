# anayak16/kokoro-coreml-int8

## Resumen

kokoro-coreml-int8 es una version cuantizada a 8 bits del export a Core ML del modelo de sintesis de voz Kokoro-82M, publicada por el usuario anayak16. Se apoya en el export escalonado de mattmireles/kokoro-coreml (float16) del modelo original hexgrad/Kokoro-82M, y aplica cuantizacion post-entrenamiento de los pesos mediante `coremltools` 9.0. El resultado es un paquete Core ML pensado para inferencia local en dispositivos Apple (iPhone, iPad, Mac), con un peso de 110 MB en disco frente a los 205 MB de la version float16.

El modelo hereda la arquitectura StyleTTS 2 de Kokoro-82M, con unos 82 millones de parametros, y se distribuye como una sucesion de etapas (prosodia, decoder, generador) que reciben fonemas en lugar de texto. No incorpora un modulo G2P (grapheme-to-phoneme), de modo que el consumidor debe aportar el suyo, por ejemplo `misaki` o `MisakiSwift`. La salida es audio sintetizado en ingles.

Su relevancia actual esta en el despliegue on-device: al reducir el tamano compilado de 578 MB a 326 MB y mantener una calidad practicamente identica a float16 (coseno >= 0.9999 en las etapas de prosodia y decoder), facilita integrar sintesis de voz neuronal en aplicaciones iOS y macOS sin depender de la nube ni de hardware dedicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (sintesis de voz), exportada a Core ML en etapas |
| Parametros totales | 82 M (heredados de hexgrad/Kokoro-82M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la entrada son fonemas, no una ventana de contexto autorregresiva) |
| Tipos de cuantizacion | int8 (linear_symmetric, per_channel, coremltools 9.0); export base en float16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (.mlpackage; .mlmodelc compilado en dispositivo); `manifest.json` con SHA-256 y tamano en bytes |

## Arquitectura y entrenamiento

El modelo reproduce la arquitectura StyleTTS 2 (autor: yl4579) sobre la que se construye Kokoro-82M, con unos 82 millones de parametros. La exportacion a Core ML divide el modelo en etapas (prosodia, decoder y generador) con un contrato de tensores y un esquema de buckets identicos a los del export float16 de mattmireles/kokoro-coreml. Las etapas consumen fonemas en lugar de texto, por lo que la conversion texto-a-fonema queda fuera del modelo. Esta ficha no aporta informacion adicional sobre el proceso de entrenamiento de Kokoro-82M (numero de tokens, composicion del dataset o uso de RLHF/DPO); lo unico documentado es el origen de los datos de audio: Koniwa `tnc` (menos de 1 hora, CC BY 3.0) y SIWIS (menos de 11 horas, CC BY 4.0), ambos permissivos y no sujetos a copyright.

La innovacion de este repositorio es exclusivamente la cuantizacion de pesos. No hay re-exportacion desde PyTorch: se aplica `coremltools.optimize.coreml.linear_quantize_weights` (mode `linear_symmetric`, `dtype=int8`, `granularity="per_channel"`) sobre los `.mlpackage` en float16, de modo que los grafos son identicos a los originales salvo la codificacion de los pesos. Core ML expande los pesos a float16 al cargar, por lo que la interfaz de llamada no cambia. Tres grupos de pesos se dejan deliberadamente en coma flotante: los dos `conv_transpose` de sobremuestreo del generador, la convolucion final `conv_post` (forma 22×128×7, unos 20 KB, donde otros informes detectan ruido audible al cuantizar) y los pesos LSTM de la etapa de prosodia (los unicos tensores float32 del export original). Las variantes de bucket de una misma etapa siguen compartiendo ficheros de pesos byte a byte identicos tras la cuantizacion.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles a partir de secuencias de fonemas.
- Generacion de audio mediante pipeline por etapas: prosodia, decoder y generador.
- Reutilizacion de las voces de hexgrad (repackadas por onnx-community).
- Ejecucion on-device: los pesos se expanden a float16 al cargar y se ejecutan en Core ML.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio de entrada ni modo de pensamiento.
- No incluye modulo G2P propio; requiere `misaki` (o `MisakiSwift` en plataformas Apple) para pasar de texto a fonemas.
- Soporte multilingue limitado al ingles.

## Casos de uso

- Lectura en voz alta on-device: una app iOS puede sintetizar texto sin conexion con un paquete de 326 MB compilado, adecuado para uso offline y sin coste de inferencia en servidor.
- Accesibilidad: integracion con lectores de pantalla y funciones de VoiceOver en macOS/iOS, donde la latencia baja y la ausencia de red son requisitos habituales.
- Asistentes conversacionales locales: combinado con un modelo de lenguaje y un motor G2P, permite respuestas habladas en ingles dentro del propio dispositivo.
- Audiolibros y podcasts generados: la reduccion de peso a 110 MB facilita empaquetar la voz junto a la aplicacion y generar narracion en lote.
- Aplicaciones de aprendizaje de ingles: sintesis de pronunciacion de referencia con voces de hexgrad, util para practicar listening y repeticion.
- Notificaciones y avisos por voz: lectura de alertas, correos o mensajes en segundo plano gracias al bajo consumo de memoria del modelo cuantizado.
- Terminales y kioscos sin conectividad: despliegue en equipos Apple aislados de la red que necesiten locucion sintetizada de forma autonoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente aporta metricas de calidad comparadas contra el export float16 del que se parte:

| Metrica | Resultado |
|---|---|
| Coseno en etapas de prosodia y decoder (vs. float16) | >= 0.9999 |
| Desviacion del modelo de duracion | ~1 % de fonemas desplazados un frame de 12,5 ms; 0,025 s sobre 13,1 s de habla |
| Prueba A/B a ciegas | El oyente no identifico las renderizaciones cuantizadas como peores; una fue elegida como "mas viva" |
| Bytes de pesos distintos | 110 MB (int8) frente a 205 MB (float16) |
| Tamano compilado en dispositivo | 326 MB (int8) frente a 578 MB (float16) |

Las salidas no son identicas muestra a muestra respecto a float16 y no pretenden serlo: el timing se desplaza decenas de milisegundos en algunos fonemas.

## Requisitos de hardware

- Huella de memoria: 326 MB compilados en dispositivo (110 MB de pesos distintos en disco); no requiere GPU dedicada.
- Aceleracion: Core ML sobre Apple Neural Engine, GPU o CPU segun el dispositivo; pensado para iPhone, iPad y Mac.
- Cabe en cualquier dispositivo Apple moderno con Core ML; no aplica la nocion de VRAM de GPU de escritorio.
- Opciones de despliegue: Core ML / `.mlpackage` o `.mlmodelc`; pipeline de referencia `KokoroPipeline` de mattmireles/kokoro-coreml. No esta pensado para vLLM, llama.cpp, Ollama ni TGI, que son entornos de modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Huella de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anayak16/kokoro-coreml-int8 | 82 M | Core ML, int8 per_channel | 110 MB (326 MB compilado) | Apache-2.0 | HuggingFace |
| mattmireles/kokoro-coreml | 82 M | Core ML, float16 | 205 MB (578 MB compilado) | Apache-2.0 | HuggingFace y GitHub |
| hexgrad/Kokoro-82M | 82 M | PyTorch, float (original) | no disponible | Apache-2.0 | HuggingFace |

La comparativa se limita a la huella de pesos y al formato, porque la informacion disponible no incluye datos de rendimiento equiparables entre estas variantes. El "contexto" no es una dimension aplicable a un modelo de sintesis de voz.

## Limitaciones y advertencias

- Solo soporta ingles (en); no hay soporte multilingue documentado.
- No incluye G2P: sin un modulo externo (`misaki` / `MisakiSwift`) el modelo no procesa texto directamente, solo fonemas.
- Riesgo de deriva temporal: la cuantizacion desplaza el timing en torno al 1 % de los fonemas (un frame de 12,5 ms), lo que puede importar en aplicaciones de sincronizacion labial o doblaje.
- La evaluacion de calidad se ha hecho contra el export float16, no contra PyTorch; no hay comparacion directa con el modelo original en esta ficha.
- Las salidas no son identicas a float16 y no deben tratarse como deterministas.
- Licencia Apache-2.0 heredada, apta para uso comercial, pero sujeta a las condiciones de los materiales heredados (arquitectura StyleTTS 2, voces de hexgrad repackadas por onnx-community y datos de audio con licencias CC BY).
- El repositorio no esta afiliado ni respaldado por hexgrad, mattmireles, yl4579, onnx-community ni Apple.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad documentada.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anayak16/kokoro-coreml-int8
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- Export float16 de referencia: https://huggingface.co/mattmireles/kokoro-coreml
- Repositorio del pipeline Core ML: https://github.com/mattmireles/kokoro-coreml
- Arquitectura StyleTTS 2: https://github.com/yl4579
- Perfil de hexgrad (autor de Kokoro-82M): https://huggingface.co/hexgrad
- Organizacion onnx-community (voces repackadas): https://huggingface.co/onnx-community
- Koniwa (fuente de audio, CC BY 3.0): https://github.com/koniwa/koniwa
- SIWIS (fuente de audio, CC BY 4.0): https://datashare.ed.ac.uk/handle/10283/2353

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; las unicas entradas obtenidas correspondian a paginas de descarga de Roblox y no guardan relacion con la ficha.
