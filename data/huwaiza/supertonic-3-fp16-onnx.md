# huwaiza/supertonic-3-fp16-onnx

## Resumen

Supertonic 3 fp16 ONNX es una compilación en media precisión (fp16) del modelo de síntesis de voz Supertonic 3, publicada por el usuario huwaiza para ejecutar text-to-speech directamente en el navegador mediante ONNX Runtime Web con aceleración WebGPU. El modelo original procede de Supertone (repositorio `supertone-oss-archive/supertonic-3`, archivado el 9 de septiembre de 2026) y esta build concreta se preparó para Timbre, un lector de texto a voz offline que funciona en el navegador.

El problema que resuelve es de distribución: la versión upstream en fp32 ocupa 398 MB repartidos en cuatro grafos ONNX, un peso inasumible para pedir a un visitante web que descargue antes de escuchar un párrafo. Esta conversión reduce el total a 201 MB manteniendo, según el autor, la misma calidad de audio percibida. La arquitectura es un pipeline de difusión para TTS compuesto por cuatro componentes: codificador de texto, predictor de duración, estimador de campo vectorial (vector estimator) y vocoder.

La relevancia actual radica en que demuestra un flujo de conversión fp16 funcional para TTS en el navegador con WebGPU, con mediciones reales de velocidad (24,7× tiempo real en un MacBook con M3 Pro y 12,0× en un iPhone 17) y documenta un fallo concreto de la conversión automática de tipos que otros desarrolladores pueden encontrarse. No se dispone de información sobre el número de parámetros ni la longitud de contexto del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS de difusión con cuatro grafos ONNX (text encoder, duration predictor, vector estimator, vocoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 (todos los grafos salvo el duration predictor, que se mantiene en fp32); se probó int8 y se descartó |
| Idiomas soportados | no disponible |
| Licencia | BigScience Open RAIL-M (pesos); código de ejemplo MIT |
| Formato de pesos | ONNX (entradas y salidas en float32, cómputo interno en float16) |

Desglose de tamaño por componente:

| Componente | fp32 | fp16 |
|---|---|---|
| `vector_estimator.onnx` | 256,5 MB | 128,4 MB |
| `vocoder.onnx` | 101,4 MB | 50,7 MB |
| `text_encoder.onnx` | 36,4 MB | 18,4 MB |
| `duration_predictor.onnx` | 3,7 MB | 3,7 MB (fp32 deliberado) |
| **Total** | **398,1 MB** | **201,2 MB** |

## Arquitectura y entrenamiento

El modelo es un sistema de síntesis de voz por difusión organizado en cuatro etapas encadenadas. El `text_encoder` transforma el texto de entrada en representaciones; el `duration_predictor` estima la duración de cada unidad de habla; el `vector_estimator` ejecuta el proceso de difusión iterativo (con un parámetro de pasos de muestreo, 8 en las pruebas reportadas) para generar la representación acústica; y el `vocoder` convierte esa representación en la forma de onda final. Esta build no reentrena el modelo: solo convierte los pesos originales a fp16, por lo que los datos de entrenamiento, el número de tokens y el uso de RLHF/DPO no están disponibles en la información proporcionada.

La innovación técnica documentada es la propia conversión. Una llamada directa a `convert_float_to_float16` genera un `vector_estimator.onnx` que no carga, porque los nodos `Cast` internos del grafo original siguen emitiendo float32 donde el grafo convertido espera float16 (error de tipo en `/vector_estimator/vector_field/main_blocks.3/attn/Cast_output_0`). La solución aplicada consiste en redirigir únicamente los `Cast` del grafo original a FLOAT16, dejando en float32 los `Cast` de frontera que añade el conversor con `keep_io_types`; en la práctica, dos nodos. El predictor de duración se mantiene en fp32 porque un intento previo en int8 produjo 3,29 s de audio donde fp32 generaba 7,65 s (el 43 % de la duración necesaria), con resultado ininteligible que ningún paso de muestreo adicional corregía.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto plano, ejecutable en el navegador.
- Inferencia en cliente mediante ONNX Runtime Web con backend WebGPU.
- Ejecución offline una vez descargados los pesos, sin llamadas a servidor.
- Interfaz de entrada y salida en float32, lo que permite integrarla sin cambios en código que ya usara la versión fp32.
- Control del número de pasos de muestreo de la difusión (8 pasos en las pruebas publicadas).
- No se documenta soporte de clonación de voz, control de emociones, tool calling, agentes ni capacidades multimodales.
- Idiomas soportados: no disponible.

## Casos de uso

- Lectores de texto a voz en el navegador: es el caso para el que se construyó esta versión (Timbre, en timbrereads.com). El modelo descarga 201 MB una vez y sintetiza localmente, de modo que el audio no sale del dispositivo del usuario.
- Lectura de artículos o documentos largos: con 24,7× tiempo real en un MacBook M3 Pro, 5.000 palabras se generan con margen de 7,0 s y sin bloqueos, lo que permite precargar y reproducir de forma continua.
- Aplicaciones de accesibilidad: conversión de texto a voz en el propio navegador para usuarios con dificultades de lectura, sin depender de servicios cloud ni de conectividad tras la primera descarga.
- Herramientas educativas o de estudio: narración de apuntes y materiales en páginas web estáticas, aprovechando que el modelo cabe en 201 MB y no requiere backend.
- Prototipado de interfaces de voz: integración de TTS en demos web con WebGPU sin infraestructura de servidor ni coste por petición.
- Distribución de contenido editorial: sitios que quieran ofrecer versión audio de sus textos sin exponer el contenido a APIs de terceros, ya que la síntesis ocurre en el cliente.
- Aplicaciones móviles web: en un iPhone 17 con Safari 27 el modelo alcanza 12,0× tiempo real, suficiente para lectura en movilidad; conviene descartar dispositivos Android de gama de entrada, donde la descarga no llegó a completarse en las pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de voz (MOS, WER, similitud) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia en navegador, con ONNX Runtime Web 1.31.1, backend WebGPU y 8 pasos de muestreo:

| Dispositivo | Carga | Velocidad en caliente | 5.000 palabras |
|---|---|---|---|
| MacBook (M3 Pro), Chrome 157 | 88 s | 24,7× tiempo real | sin bloqueos, margen de 7,0 s |
| iPhone 17, Safari 27 | 88 s | 12,0× tiempo real | no disponible |
| Android de gama de entrada (Snapdragon 685) | no completó la descarga | no disponible | no disponible |

## Requisitos de hardware

- Tamaño de descarga: 201,2 MB en fp16 (frente a 398,1 MB en fp32). El modelo completo debe residir en memoria o en almacenamiento del navegador durante la inferencia.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; el total de pesos fp16 es de 201,2 MB, a lo que hay que sumar las activaciones y los búferes de WebGPU, no cuantificados en la información proporcionada.
- GPU recomendadas: Apple M3 Pro (verificado), GPU integrada de iPhone 17 (verificado). No hay datos para GPUs de escritorio discretas (RTX 4090, A100, H100).
- Cabe en hardware de consumo: sí, al menos en Apple Silicon y en iPhone recientes. En un Android con Snapdragon 685 la descarga no llegó a completarse en ningún formato de precisión.
- Opciones de despliegue: ONNX Runtime Web con WebGPU (verificado); ONNX Runtime nativo u otros runtimes ONNX no están documentados en la información disponible. No hay soporte GGUF, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: tiempo de carga de 88 s en M3 Pro y en iPhone 17; 24,7× y 12,0× tiempo real respectivamente en régimen estable. El tiempo de carga de 88 s es un coste de arranque relevante para la experiencia de usuario.

## Comparativa con modelos similares

No se dispone de datos de otros modelos TTS en la información proporcionada para establecer una comparativa con cifras verificables. La única comparación disponible es la del propio modelo consigo mismo en distintas precisiones:

| Versión | Tamaño total | Calidad reportada | Notas |
|---|---|---|---|
| Supertonic 3 fp32 (upstream) | 398,1 MB | referencia | Cuatro grafos a precisión completa |
| Supertonic 3 fp16 (esta build) | 201,2 MB | equivalente según el autor | Duration predictor en fp32 |
| Supertonic 3 int8 (intento descartado) | no disponible | ininteligible | Duración predicha al 43 % de la necesaria |

## Limitaciones y advertencias

- Licencia Open RAIL-M: permite uso comercial y redistribución, pero impone condiciones. Las restricciones de uso de la Attachment A deben transmitirse a los usuarios finales como términos exigibles. Una auditoría automática que lea un único fichero LICENSE por archivo puede clasificar mal el modelo, porque los pesos son Open RAIL-M y el código de ejemplo es MIT.
- El modelo upstream está archivado desde el 9 de septiembre de 2026; no cabe esperar mantenimiento ni actualizaciones de la fuente original.
- El predictor de duración no admite cuantización a int8 sin degradar gravemente la salida; cualquier intento de reducir más el tamaño debe preservar ese componente en fp32.
- La conversión fp16 requiere retargetear los `Cast` internos del grafo; una conversión automática estándar produce un modelo que no carga.
- El tiempo de carga medido es de 88 s, lo que puede ser inaceptable en conexiones lentas o para visitantes puntuales.
- En Android de gama de entrada (Snapdragon 685) la descarga no se completó en ninguna precisión; el soporte en ese segmento es dudoso.
- Idiomas soportados: no disponible, lo que impide confirmar cobertura multilingüe o su calidad por idioma.
- No hay datos publicados de sesgos, tasa de alucinación (pronunciación incorrecta o inventada) ni evaluación subjetiva de naturalidad; el autor afirma que el audio «suena igual» que en fp32, pero no aporta métricas.
- El rendimiento solo está verificado en Chrome 157 sobre macOS y Safari 27 sobre iOS; otros navegadores con WebGPU no están documentados.

## Enlaces

- Repositorio de esta build: https://huggingface.co/huwaiza/supertonic-3-fp16-onnx
- Modelo base: https://huggingface.co/supertone-oss-archive/supertonic-3
- Documentación de ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- Sitio que motivó la conversión (Timbre): https://timbrereads.com
