# prasadvittaldev/pocket-tts-italian-onnx-int4

## Resumen

Este paquete es una adaptación del modelo de síntesis de voz Pocket TTS de Kyutai, cuantizado a int4 y exportado a ONNX para ejecutarse íntegramente en el navegador, sin servidor, GPU ni clave de API. El modelo original es un modelo de lenguaje de flow-matching de 6 capas con 89,4 millones de parámetros que opera sobre el codec neural Mimi a 24 kHz. La versión presentada reduce el peso del modelo de lenguaje de 302,7 MB a 40,8 MB mediante cuantización int4 MatMulNBits, manteniendo el text conditioner en float32 para preservar la pronunciación, y empaqueta todos los componentes en un solo archivo `.onnx` compatible con ONNX Runtime Web.

El resultado es un sistema de conversión de texto a voz en italiano de 106 MB que funciona en una página web con CPU, con cuatro voces predefinidas y la posibilidad de clonar una nueva voz si se carga el encoder Mimi. La licencia CC-BY-4.0 permite uso comercial con atribución, lo que lo hace relevante para aplicaciones de accesibilidad, asistentes de voz y prototipos en el frontend.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de flow-matching de 6 capas sobre codec neural Mimi a 24 kHz |
| Parametros totales | 89,4 M (modelo de lenguaje principal); el paquete completo incluye además codec y text conditioner |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de TTS) |
| Tipos de cuantizacion | LM principal: int4 MatMulNBits (bloque 128, simétrico); flow head y decodificador/encoder Mimi: int8 dinámico; text conditioner: float32 |
| Idiomas soportados | Italiano (it) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (archivos `.onnx`, incluye `bundle.json`, `tokenizer.model` y `bos_before_voice.npy`) |

## Arquitectura y entrenamiento

El modelo base es Pocket TTS de Kyutai, un sistema de síntesis de voz basado en un modelo de lenguaje de flow-matching con 6 capas y 89,4 millones de parámetros, que genera tokens de audio a través del codec neural Mimi a 24 kHz. El paquete no modifica la arquitectura ni los pesos originales, solo cambia el formato numérico: el modelo de lenguaje se cuantiza a int4 mediante MatMulNBits con bloque 128 y cuantización simétrica, mientras que el text conditioner se mantiene en float32 porque está compuesto casi exclusivamente por tablas de embedding y su cuantización apenas ahorraría bytes a cambio de arriesgar la pronunciación.

La exportación a ONNX se realizó con los scripts del repositorio KevinAHM/pocket-tts-onnx-export, y el empaquetado en un único archivo `.onnx` para el modelo de lenguaje resuelve un problema práctico: ONNX Runtime Web no puede leer archivos de pesos externos (`.onnx.data`), por lo que la fusión en un solo archivo es imprescindible para la ejecución en navegador. También se incluye un estado de voz precomputado (un prefijo de caché KV) que evita tener que cargar el encoder Mimi para usar las voces predefinidas, con la advertencia de que el parámetro `step` por capa debe coincidir con la longitud de la caché o el modelo genera silencio (RMS 0,0026 frente a 0,176 correcto).

No se dispone de información sobre el dataset de entrenamiento del modelo original ni sobre el proceso de alineamiento (RLHF, DPO, etc.); la model card solo indica que el modelo base es de Kyutai y que esta versión cambia únicamente el formato numérico.

## Capacidades

- Sintetiza voz en italiano a partir de texto, con cuatro voces predefinidas (charles, alba, vera, azelma) con frecuencias fundamentales medidas entre 88 Hz y 202 Hz.
- Se ejecuta completamente en CPU, tanto en navegador (WebAssembly) como en Python mediante ONNX Runtime.
- Permite clonar una nueva voz si se carga el encoder Mimi (`mimi_encoder_int8.onnx`) y se proporciona una muestra de audio.
- No incluye otras capacidades como tool calling, razonamiento multi-paso o procesamiento multimodal; es exclusivamente un modelo de conversión de texto a voz.

## Casos de uso

- Accesibilidad web: lectores de pantalla en italiano integrados directamente en páginas web, sin necesidad de servidores externos ni conexión a APIs de pago.
- Asistentes de voz en el navegador: aplicaciones de tipo chatbot o asistente que necesitan respuesta hablada en italiano, con latencia aceptable al ejecutarse localmente.
- Aplicaciones educativas de idiomas: generación de pronunciación de palabras y frases en italiano para ejercicios de escucha, con la posibilidad de elegir entre varias voces.
- Audiolibros generados localmente: conversión de texto largo a audio en italiano en el cliente, útil para aplicaciones de lectura o para generar contenido sin depender de servicios externos.
- Prototipos rápidos de TTS en frontend: desarrolladores que quieren probar síntesis de voz en italiano sin configurar infraestructura, gracias a la demo en https://prasadtts.vercel.app.
- Integración en aplicaciones de escritorio con Python: mediante ONNX Runtime, se puede usar el mismo modelo en herramientas locales que requieran salida de voz en italiano, aprovechando el paquete descargado con `huggingface-cli`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas de calidad de voz ni comparativas con otros modelos TTS, solo mediciones de frecuencia fundamental de las voces y el tamaño de los archivos.

## Requisitos de hardware

- CPU únicamente; no requiere GPU ni aceleración por hardware específica.
- Tamaño del paquete completo: 106 MB (descarga única, cacheable en el navegador).
- En navegador: requiere un navegador moderno con soporte de ONNX Runtime Web (WebAssembly); la demo funciona en https://prasadtts.vercel.app.
- En Python: se necesitan las librerías `onnxruntime`, `numpy`, `huggingface_hub` y `soundfile`.
- No se especifican requisitos de VRAM ni latencia/throughput estimados; al ser un modelo de 89,4 M de parámetros cuantizado a int4, se espera que funcione en cualquier CPU moderna, pero los tiempos de generación dependerán del hardware concreto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. La única referencia directa es el modelo original kyutai/pocket-tts, del cual esta versión es una adaptación cuantizada y empaquetada para ONNX. Otras alternativas de TTS en italiano como Coqui TTS o Piper no aparecen en la información disponible, por lo que no se puede realizar una comparativa objetiva.

## Limitaciones y advertencias

- Solo está disponible en italiano; no se incluyen otros idiomas en este paquete.
- Las voces predefinidas son únicamente cuatro; la clonación de voz requiere cargar el encoder Mimi, lo que aumenta el tiempo de carga y el uso de memoria.
- La cuantización int4 puede producir una ligera degradación en la calidad del audio en comparación con el modelo original en float32, aunque la model card indica que la calidad se mantiene buena.
- El estado de voz precomputado es sensible al parámetro `step` por capa: si se pone a cero, el modelo genera silencio (RMS 0,0026 frente a 0,176 correcto); esto debe tenerse en cuenta al manipular el `bundle.json`.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor original (Kyutai) y a esta adaptación; es recomendable revisar los términos completos de la licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente con poca validación comunitaria.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/prasadvittaldev/pocket-tts-italian-onnx-int4
- Modelo base (Kyutai): https://huggingface.co/kyutai/pocket-tts
- Demo en navegador: https://prasadtts.vercel.app
- Repositorio de exportación ONNX (KevinAHM): https://github.com/KevinAHM/pocket-tts-onnx-export
- Perfil de LinkedIn del autor: https://in.linkedin.com/in/prasadvittaldev
