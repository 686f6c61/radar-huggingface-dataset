# cloud0day3/antalia-mini

## Resumen

Antalia-2 Mini es un modelo de síntesis de voz (text-to-speech) en turco, de un solo hablante y tamano reducido, desarrollado por el autor cloud0day3. Cuenta con 7,62 millones de parametros en total, repartidos entre un modelo acustico de 3,69 M y un vocoder de 3,93 M, y genera audio a 48 kHz. Su rasgo mas destacado es la eficiencia: esta disenado para funcionar claramente por encima de tiempo real en una CPU convencional, sin necesidad de GPU.

El modelo toma texto turco en bruto y aplica un normalizador propio que convierte numeros, fechas, horas, importes, siglas, direcciones web y palabras en ingles o marcas a la forma en que un hablante turco las pronunciaria. La voz resultante es sintetica (masculina, la de Antalia-2) y no corresponde a ninguna persona real; el autor indica que los datos de entrenamiento no contienen grabaciones de hablantes reales.

Es relevante por su propuesta de TTS ligero, local y con licencia permisiva: el codigo y los pesos son Apache-2.0, el paquete se instala con `pip install antalia-mini` y existe una demo web que se ejecuta integramente en el dispositivo mediante ONNX Runtime Web. Es el sucesor de Antalia-1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS con flow-matching (modelo acustico + vocoder) |
| Parametros totales | 7,62 M (acustico 3,69 M + vocoder 3,93 M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo TTS; procesa texto por frases y soporta streaming para textos largos) |
| Tipos de cuantizacion | fp32 por defecto; variante fp16 disponible (se reconvierte a fp32 al cargar) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Antalia-2 Mini es un modelo de sintesis de voz basado en flow-matching, compuesto por dos modulos: un modelo acustico (3,69 M de parametros) y un vocoder (3,93 M de parametros), que en conjunto suman 7,62 M. Genera audio a 48 kHz y puede remuestrear la salida a 24000, 16000 u 8000 Hz para telefonía o pipelines de ASR. El modelo se ejecuta en fp32; existe una variante con pesos en fp16 que ocupa la mitad y se convierte de nuevo a fp32 al cargarse, con audio practicamente identico.

La inferencia esta controlada por parametros de flow-matching, entre ellos el numero de pasos (`steps`, por defecto 8; con 4 es mas rapido pero medidamente menos preciso segun el autor) y el classifier-free guidance (`cfg`, por defecto 2,0). El autor indica que los datos de entrenamiento no contienen grabaciones de hablantes reales, de modo que la voz es completamente sintetica. No se detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. Entre las innovaciones practicas destacan un normalizador de texto integrado, correcciones de lectura para palabras que empiezan por "ö" o "ı" y el alargamiento de sonidos dobles, ademas de una cadena de procesado de salida con shelf de graves (+6 dB a 210 Hz), shelf de agudos (-9 dB a 4 kHz) y un limitador de picos suave.

## Capacidades

- Generacion de voz sintetica en turco a 48 kHz con un unico hablante masculino sintetico.
- Normalizacion de texto integrada: numeros, fechas, horas, importes, siglas, direcciones web y palabras en ingles o marcas.
- Salida remuestreable a 24000, 16000 y 8000 Hz para telefonía y pipelines de ASR.
- Sintesis por lotes (varios textos a la vez, batcheados en GPU).
- Streaming: sintetiza la primera frase y continua por fragmentos, con estado del filtro preservado entre ellos.
- Control de la generacion mediante semilla (`seed`), velocidad (`speed`, por defecto 0,95), pasos de flow-matching (`steps`) y guidance (`cfg`).
- Ejecucion en CPU, GPU CUDA o GPU Apple Silicon (MPS).
- Interfaz de linea de comandos (`antalia-mini "texto" -o salida.wav`).
- Ejecucion en navegador sin servidor mediante ONNX Runtime Web (demo en HuggingFace Spaces).
- No es un modelo de lenguaje: no realiza razonamiento, codigo, matematicas, vision ni tool calling.

## Casos de uso

- Sistemas de atencion al cliente en turco: el modelo puede leer respuestas de un bot o de un CRM con normalizacion automatica de importes, fechas y horas, algo critico en dominios de facturacion o reservas.
- Avisos automaticos de logistica y envios: leer estados de pedido y fechas estimadas de entrega (por ejemplo "9 Ekim 2026, Persembe") con la pronunciacion correcta de la fecha.
- Confirmaciones telefonicas e IVR: gracias al remuestreo a 8000 Hz, la salida se puede inyectar directamente en centralitas telefonicas o sistemas de telefonia IP.
- Lectura de notificaciones y correos en aplicaciones moviles o de escritorio: el modelo es lo bastante pequeno (pesos de ~31 MB) para empaquetarse en un cliente y ejecutarse localmente en CPU.
- Audiolibros o lectura de articulos largos: el modo streaming permite sintetizar texto extenso por frases sin cargar todo el audio en memoria.
- Generacion de locuciones para e-learning o contenidos de marketing en turco, con la semilla fijada para reproducir exactamente el mismo audio en cada build.
- Accesibilidad: lectura en voz alta de contenido web o de documentos para usuarios con discapacidad visual, totalmente en el dispositivo y sin enviar el texto a un servidor.
- Prototipado y demos en navegador: la demo con ONNX Runtime Web permite integrar TTS turco en una pagina sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion de "Evaluation" y afirma que reducir los pasos de flow-matching de 8 a 4 es "medidamente menos preciso", pero no se incluyen las cifras concretas ni comparaciones numericas con otros modelos. No se deben inventar valores.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable en la practica para el modo CPU; el modelo corre en fp32 y los pesos ocupan ~31 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA (por ejemplo RTX 3060, RTX 4090) o Apple Silicon mediante MPS; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier GPU moderna, incluida gama de entrada, dado el tamano del modelo.
- Opciones de despliegue: paquete Python `antalia-mini` (PyTorch), linea de comandos, y ONNX Runtime Web para ejecucion en navegador. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: el autor afirma que funciona "claramente por encima de tiempo real" en CPU, pero no se proporcionan cifras concretas de latencia ni de factor de tiempo real (RTF).
- Dependencias: Python 3.10 o superior; PyTorch, NumPy, safetensors, soundfile y cmudict.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos TTS, y el autor solo menciona su predecesor, Antalia-1 (cloud0day3/antalia-1), sin ofrecer datos comparativos de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Modelo mono-hablante: solo dispone de una voz masculina sintetica; no permite cambiar de voz sin reentrenar.
- Cobertura limitada a turco: el autor solo declara soporte para `tr`; no se garantiza una pronunciacion correcta en otros idiomas.
- Riesgo de errores de pronunciacion: el propio autor reconoce que la voz tiende a insertar una "l" extra al inicio de palabras que empiezan por "ö" o "ı", lo que se mitiga con una correccion que recorta un "ee," inicial.
- La salida no tiene normalizacion de sonoridad por frase; el tono se aplica con shelves fijos (+6 dB a 210 Hz, -9 dB a 4 kHz) y un limitador de picos.
- Al ser un modelo TTS, no realiza razonamiento, generacion de codigo, matematicas ni tool calling; no debe usarse para esas tareas.
- La calidad con 4 pasos de flow-matching es inferior a la de 8 pasos segun el autor.
- Licencia Apache-2.0: permite uso comercial, pero conviene conservar los avisos de licencia y verificar las dependencias (PyTorch, cmudict, soundfile) por si imponen condiciones adicionales.
- La voz es sintetica y no corresponde a una persona real, lo que reduce riesgos de suplantacion, pero el texto que se le entregue puede contener datos personales; en despliegues locales conviene revisar el tratamiento de esos datos.
- El repositorio es pequeno (0,1 GB) y tiene muy pocas descargas, lo que sugiere un modelo joven con validacion limitada por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cloud0day3/antalia-mini
- Demo en navegador (HuggingFace Spaces): https://huggingface.co/spaces/cloud0day3/antalia-mini
- Predecesor Antalia-1: https://huggingface.co/cloud0day3/antalia-1
- Wheel del paquete: https://huggingface.co/cloud0day3/antalia-mini/resolve/main/antalia_mini-1.0.0-py3-none-any.whl
