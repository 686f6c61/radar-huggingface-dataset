# hugging-mac/zipformer-kws-zh-en-3m-coreml

## Resumen

Zipformer KWS zh-en 3M Core ML es un modelo de deteccion de palabras clave (keyword spotting) en streaming para frases configuradas en mandarin y en ingles. Lo publica el usuario `hugging-mac` como un bundle de Core ML derivado del modelo original `MigoXV/icefall-kws-zipformer-zh-en-3M-2025-12-20`, entrenado con la infraestructura icefall de k2-fsa. El bundle contiene tres programas ML nativos de Core ML (encoder, decoder y joiner) portados desde los pesos Zipformer originales con ejecucion FP32 y tamano de lote uno.

El modelo resuelve el problema de la deteccion de wake words o frases de activacion en dispositivos Apple, sin depender de frameworks de inferencia externos: los grafos se ejecutan de forma nativa en Apple Silicon, con objetivos de despliegue iOS 17 y macOS 14. Con aproximadamente 3 millones de parametros, es un modelo muy ligero pensado para ejecucion local y de baja latencia.

Su relevancia actual radica en que permite integrar deteccion de palabras clave en aplicaciones iOS y macOS con un coste computacional minimo, manteniendo la logica de streaming, beam search contextual y politica de activacion en el host. La validacion incluida comprueba la paridad numerica de los grafos FP32 frente a los grafos oficiales de Sherpa-ONNX (chunk-8).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer (encoder, decoder y joiner como tres ML Programs de Core ML) |
| Parametros totales | aproximadamente 3M (segun el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (streaming por chunks: 29 frames de entrada, avance de 16 frames por llamada al encoder) |
| Tipos de cuantizacion | FP32 (unico tipo documentado en el bundle) |
| Idiomas soportados | chino (mandarin) e ingles (zh, en) |
| Licencia | apache-2.0 |
| Formato de pesos | Core ML ML Programs (bundle con `manifest.json`); modelo base en formato icefall |
| Entrada de audio | filterbanks Kaldi de 80 bins, 16 kHz mono 16-bit PCM |
| Objetivos de despliegue | iOS 17 y macOS 14 |
| Hardware validado | Apple Silicon (macOS) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Zipformer, un encoder de tipo transformer con atencion eficiente y modulos de convolucion, disenado originalmente para reconocimiento de voz en streaming dentro del ecosistema icefall/k2-fsa. En este bundle, el modelo se descompone en tres grafos Core ML: encoder, decoder y joiner. El encoder consume 29 frames de filterbanks Kaldi de 80 bins y avanza 16 frames por llamada; mantiene 38 salidas de cache que deben realimentarse en orden en cada paso, empezando por caches a cero. El decoder consume los dos ultimos tokens de la hipotesis y el joiner combina las proyecciones de encoder y decoder para devolver logits no normalizados del vocabulario.

El bundle se ha portado desde los pesos originales con ejecucion FP32 y tamano de lote uno. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, algo poco habitual en un modelo de keyword spotting. La validacion incluida (`evaluation.json`) mide la paridad FP32 de los grafos frente a los grafos oficiales Sherpa-ONNX chunk-8, comprueba las etiquetas detectadas y las marcas temporales de tokens sobre los audios de prueba oficiales y silencio, y reporta la P95 de latencia por llamada de prediccion tras el calentamiento.

## Capacidades

- Deteccion de palabras clave y wake words en streaming para frases configuradas en mandarin e ingles.
- Procesamiento de audio en tiempo real por paquetes cortos mediante `Stream.accept()`, con un stream independiente por sesion.
- Configuracion de frases mediante fichero de texto: cada linea contiene tokens separados por espacios de `tokens.txt`, con etiqueta opcional `@label`, ajuste `:boost` y umbral `#threshold` por frase.
- Emision de coincidencias de palabras clave y marcas temporales de tokens como lineas JSON.
- Soporte de beam search contextual en el host para la decodificacion.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente.

## Casos de uso

- Activacion por voz en aplicaciones iOS: integracion de una wake word personalizada en una app nativa usando los grafos Core ML, con la politica de activacion e interrupcion implementada en el host.
- Asistentes de voz en macOS: deteccion local de frases de activacion antes de enviar audio a un motor de reconocimiento o a un servicio remoto, reduciendo consumo y preservando privacidad.
- Domotica y control por voz: deteccion de comandos cortos configurados (por ejemplo, encender o apagar) en dispositivos Apple sin conexion a red.
- Aplicaciones bilingues zh-en: soporte de frases en mandarin y en ingles en un mismo bundle, util para productos dirigidos a usuarios bilingues.
- Prototipado e investigacion: banco de pruebas para evaluar latencia y precision de Zipformer en Core ML frente a Sherpa-ONNX, gracias a `evaluation.json` y a la paridad de grafos documentada.
- Sistemas de dictado o notas de voz: deteccion de palabras de control para iniciar, pausar o finalizar la grabacion en aplicaciones de productividad.
- Kioscos o interfaces embebidas en macOS: activacion manos libres en entornos con recursos limitados gracias al reducido tamano del modelo (aproximadamente 3M de parametros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (por ejemplo, tasas de falsos positivos o falsos negativos) en la informacion disponible. El bundle incluye `evaluation.json`, que documenta paridad FP32 frente a Sherpa-ONNX chunk-8, etiquetas y marcas temporales detectadas sobre los audios oficiales y silencio, y la P95 de latencia por llamada de prediccion tras el calentamiento, pero los valores concretos no se proporcionan en la informacion disponible.

## Requisitos de hardware

- Ejecucion nativa en Apple Silicon (validado en macOS); objetivos de despliegue iOS 17 y macOS 14.
- VRAM o memoria unificada estimada: no disponible; por el tamano del modelo (aproximadamente 3M de parametros en FP32) la huella es muy reducida.
- GPU recomendadas: no aplica en el sentido convencional; el modelo esta pensado para la Neural Engine y la GPU integrada de los chips Apple (serie M y A).
- Cabe en hardware consumer Apple: si, en iPhone y Mac con Apple Silicon compatibles con iOS 17 o macOS 14.
- Opciones de despliegue: Core ML de forma nativa; el ejemplo incluido usa `coremltools==9.0` y `kaldi-native-fbank==1.23.3` con un host Python de streaming.
- Latencia y throughput: no se proporcionan cifras concretas; la model card indica que la latencia depende de las frases, el audio y la configuracion de streaming, y remite a la P95 de `evaluation.json`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Zipformer KWS zh-en 3M Core ML (este) | aprox. 3M | streaming por chunks (29 frames, avance 16) | zh, en | apache-2.0 | Core ML |
| MigoXV/icefall-kws-zipformer-zh-en-3M-2025-12-20 (modelo base) | aprox. 3M | streaming (icefall) | zh, en | no disponible | icefall |
| Grafos oficiales Sherpa-ONNX chunk-8 (referencia de validacion) | no disponible | streaming chunk-8 | zh, en | no disponible | ONNX |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo detecta frases configuradas previamente; no transcribe audio ni comprende lenguaje libre.
- La calidad de deteccion y el retardo entre audio y deteccion dependen de las frases, el audio y la configuracion de streaming; no hay metricas publicas de precision en la informacion disponible.
- El bundle solo documenta ejecucion FP32; no se indican variantes cuantizadas.
- La logica de temporizacion, estado de streaming y emparejamiento de frases es responsabilidad del host, no del modelo.
- El ejemplo de Python requiere un WAV de 16 kHz mono 16-bit PCM; el audio con otras caracteristicas debe preprocesarse.
- Uso comercial permitido por la licencia apache-2.0, pero deben revisarse `NOTICE` y `manifest.json` para la procedencia y licencias de los componentes derivados.
- Riesgo de sesgos y de alucinacion no documentado; al ser un clasificador de frases, el riesgo principal es de falsos positivos o negativos en la deteccion.
- Sin datos publicados sobre cobertura de acentos, ruido de fondo o variedades dialectales del mandarin o del ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugging-mac/zipformer-kws-zh-en-3m-coreml
- Modelo base: https://huggingface.co/MigoXV/icefall-kws-zipformer-zh-en-3M-2025-12-20
- icefall (k2-fsa): https://github.com/k2-fsa/icefall
- Sherpa-ONNX: https://github.com/k2-fsa/sherpa-onnx
- Core ML Tools: https://github.com/apple/coremltools
- kaldi-native-fbank: https://github.com/csukuangfj/kaldi-native-fbank
