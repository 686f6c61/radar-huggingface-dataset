# prasadvittaldev/pocket-tts-hindi-onnx-int4

## Resumen

Pocket TTS Hindi (int4 ONNX) es un modelo de síntesis de voz (text-to-speech) para hindi diseñado para ejecutarse íntegramente en el navegador, sin servidor, sin GPU y sin necesidad de clave API. Es una versión cuantizada y empaquetada del modelo `saryps-labs/pocket-tts-hindi`, que a su vez es un estudiante destilado en profundidad del modelo Pocket TTS de Kyutai, entrenado sobre el corpus IndicVoices de AI4Bharat. El paquete completo ocupa 106 MB.

La relevancia de este modelo radica en que resuelve dos problemas prácticos: por un lado, ejecutar síntesis de voz en hindi de calidad en dispositivos de bajos recursos (CPU), y por otro, hacerlo dentro de un navegador web mediante WebAssembly y ONNX Runtime Web. La cuantización int4 del modelo de lenguaje reduce el peso de 302,7 MB a 40,8 MB en un único archivo `.onnx`, un formato que ONNX Runtime Web puede cargar sin errores. Además, conserva la capacidad de clonación de voz del modelo original, algo poco habitual en estudiantes destilados de un solo hablante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching language model de 6 capas (89,4 M parámetros) + codec Mimi a 24 kHz |
| Parametros totales | 89,4 millones (modelo de lenguaje); el paquete completo incluye codec y text conditioner |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (MatMulNBits, block 128, simétrico) para el LM; int8 dinámico para flow head y codec; float32 para text conditioner |
| Idiomas soportados | Hindi (hi) |
| Licencia | other (hereda la licencia de `saryps-labs/pocket-tts-hindi`; requiere revisar términos upstream antes de redistribuir) |
| Formato de pesos | ONNX (`.onnx`), tokenizer SentencePiece |

## Arquitectura y entrenamiento

El modelo base `saryps-labs/pocket-tts-hindi` es un estudiante destilado en profundidad (depth-distilled) del Pocket TTS de Kyutai, entrenado sobre el corpus de habla hindi de AI4Bharat IndicVoices. La arquitectura subyacente es un modelo de lenguaje de 6 capas con flujo matching (flow-matching) de 89,4 millones de parámetros, que opera sobre los tokens del codec neuronal Mimi a 24 kHz. A diferencia de la mayoría de estudiantes destilados de un solo hablante, este modelo conserva la capacidad de clonación de voz, lo que permite generar habla con distintas voces a partir de una muestra de referencia.

La contribución principal de este paquete es la cuantización y el empaquetado para navegador. El modelo de lenguaje se cuantiza a int4 con MatMulNBits (block 128, simétrico), reduciendo el peso de 302,7 MB a 40,8 MB. El text conditioner se mantiene en float32 porque está compuesto casi íntegramente por búsquedas en tablas de embeddings, donde la cuantización apenas ahorra espacio y añade riesgo de degradar la pronunciación. El estado de voz se precomputa como prefijo de KV-cache, lo que evita cargar el encoder de Mimi en el navegador. Un detalle técnico crítico documentado por el autor: el estado de voz contiene un campo `step` por capa que debe coincidir con la longitud de la caché; si se pone a cero, el modelo ignora la voz y emite casi silencio (rms 0,0026 frente a 0,176 correcto).

## Capacidades

- Síntesis de voz en hindi a partir de texto, con dos voces predefinidas (masculina y femenina) que se pueden seleccionar.
- Clonación de voz: el modelo conserva la capacidad de clonar una voz a partir de una muestra de referencia, algo inusual en modelos destilados de un solo hablante.
- Ejecución en CPU: funciona completamente en CPU, sin necesidad de GPU.
- Ejecución en navegador: compatible con ONNX Runtime Web y WebAssembly, lo que permite TTS en páginas web sin servidor.
- Los archivos de voz se precomputan como prefijos de KV-cache, lo que evita cargar el encoder de Mimi en el navegador.
- El paquete incluye el encoder de Mimi en int8 para quienes quieran clonar voces nuevas fuera del navegador.

## Casos de uso

- **Aplicaciones web de accesibilidad**: convertir texto en hindi a voz directamente en el navegador para usuarios con discapacidad visual o dificultades de lectura, sin necesidad de servidores de síntesis externos.
- **Aplicaciones educativas offline**: generar audio de pronunciación en hindi para aplicaciones de aprendizaje de idiomas que funcionen sin conexión, en dispositivos de gama baja.
- **Asistentes de voz en el navegador**: dotar de salida de voz a asistentes conversacionales o chatbots web en hindi, con la ventaja de que el audio se genera localmente y no hay latencia de red.
- **Generación de contenido para redes sociales**: crear locuciones en hindi para vídeos cortos o podcasts directamente desde una herramienta web, sin depender de servicios de TTS comerciales.
- **Sistemas de lectura de pantalla para quioscos o señalización digital**: integrar el modelo en dispositivos embebidos o Raspberry Pi que ejecutan un navegador, para leer noticias o anuncios en hindi en lugares públicos.
- **Prototipado rápido de productos de voz**: los desarrolladores pueden integrar TTS en hindi en un prototipo web en minutos, sin configurar infraestructura de servidor ni gestionar claves API.
- **Aplicaciones de mensajería**: convertir mensajes de texto en hindi a audio dentro de aplicaciones web de mensajería, útil para usuarios que prefieren escuchar en lugar de leer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de TTS (como MOS, WER o SIM-o) en la información disponible. El autor reporta mediciones de frecuencia fundamental (F0) para verificar que la separación de voces se mantiene tras la cuantización:

| Medición | Voz masculina | Voz femenina |
|---|---|---|
| F0 antes de cuantizar | 112 Hz | 206 Hz |
| F0 tras cuantización int4 | 112,6 Hz | 208,9 Hz |

La cuantización preserva la separación entre voces, lo que indica que la clonación de voz sigue funcionando correctamente.

## Requisitos de hardware

- **CPU**: el modelo está diseñado para ejecutarse en CPU, incluida la de un portátil o dispositivo móvil de gama media.
- **Memoria**: el paquete completo pesa 106 MB, por lo que cabe en la memoria de prácticamente cualquier dispositivo moderno.
- **GPU**: no es necesaria.
- **RAM**: no especificada, pero el tamaño del modelo sugiere que 1-2 GB de RAM libre son suficientes para la inferencia.
- **Opciones de despliegue**: navegador web mediante ONNX Runtime Web y WebAssembly (demo en https://prasadtts.vercel.app), o Python con ONNX Runtime (usando el runtime de referencia de KevinAHM/pocket-tts-onnx-export).
- **Latencia**: no se han publicado mediciones de latencia. Al ejecutarse en CPU, la generación será más lenta que en GPU, pero es aceptable para TTS de frases cortas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Ejecución en navegador | Licencia |
|---|---|---|---|---|---|
| **pocket-tts-hindi-onnx-int4** (este) | 89,4 M (LM) | no disponible | int4 + int8 + float32 | Sí (ONNX Runtime Web) | other |
| **saryps-labs/pocket-tts-hindi** (base) | 89,4 M (LM) | no disponible | no cuantizado | No | other |
| **Kyutai Pocket TTS** | 300 M aprox. | no disponible | no cuantizado | No | CC-BY-4.0 |

La comparativa con el modelo base de saryps-labs es directa: misma arquitectura y calidad de voz, pero con cuantización int4 que reduce el tamaño de 302,7 MB a 40,8 MB para el LM y habilita la ejecución en navegador. Frente al Pocket TTS original de Kyutai, es un modelo mucho más pequeño (89,4 M frente a ~300 M) y especializado en hindi, a costa de perder la cobertura multilingüe.

## Limitaciones y advertencias

- **Un solo idioma**: el modelo solo genera voz en hindi. No sirve para otros idiomas.
- **Dos voces predefinidas**: aunque conserva la clonación de voz, el paquete solo incluye dos voces precomputadas. Para clonar una voz nueva es necesario cargar el encoder de Mimi y generar el estado de voz fuera del navegador.
- **Licencia restrictiva**: la licencia es `other` y el modelo base incluye un NOTICE que pide revisar los términos upstream antes de redistribuir. Cualquier uso comercial debe verificar las condiciones de la licencia de `saryps-labs/pocket-tts-hindi`, de Kyutai (CC-BY-4.0) y de AI4Bharat IndicVoices (CC BY 4.0).
- **Calidad de voz**: al ser un modelo destilado y cuantizado, la calidad de audio puede ser inferior a la de modelos TTS comerciales grandes como ElevenLabs o Azure TTS.
- **Riesgo de errores en la pronunciación**: el text conditioner se mantiene en float32 para mitigar este riesgo, pero la cuantización int4 del LM podría degradar la pronunciación en casos límite.
- **Dependencia de ONNX Runtime Web**: la ejecución en navegador depende de la compatibilidad de ONNX Runtime Web con el navegador del usuario; no todos los navegadores antiguos son compatibles.
- **Problema conocido con el campo `step`**: si se manipula el estado de voz precomputado y el campo `step` no coincide con la longitud de la caché, el modelo emite casi silencio. Esto es un riesgo en integraciones personalizadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prasadvittaldev/pocket-tts-hindi-onnx-int4
- Modelo base: https://huggingface.co/saryps-labs/pocket-tts-hindi
- Pocket TTS de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Corpus AI4Bharat IndicVoices: https://ai4bharat.iitm.ac.in/
- Runtime de referencia (ONNX export): https://github.com/KevinAHM/pocket-tts-onnx-export
- Demo en navegador: https://prasadtts.vercel.app
- Autor (LinkedIn): https://in.linkedin.com/in/prasadvittaldev
