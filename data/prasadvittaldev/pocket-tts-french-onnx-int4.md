# prasadvittaldev/pocket-tts-french-onnx-int4

## Resumen

Pocket TTS French es una conversión a ONNX del modelo de síntesis de voz Pocket TTS de Kyutai, cuantizado a int4 y empaquetado para ejecutarse íntegramente en el navegador mediante WebAssembly, sin necesidad de servidor, GPU ni clave de API. El paquete completo ocupa 222 MB e incluye el modelo de lenguaje, el codec neural Mimi, el acondicionador de texto y las voces precomputadas. Está pensado para desarrolladores que quieran integrar síntesis de voz en francés en aplicaciones web o de escritorio con requisitos mínimos de hardware.

El modelo base original, desarrollado por Kyutai, es un modelo de lenguaje de flow-matching de 24 capas con 316 millones de parámetros que opera sobre el codec Mimi a 24 kHz. Esta versión cuantizada reduce el modelo de lenguaje de 302,7 MB a 40,8 MB mediante cuantización int4 (MatMulNBits, bloque 128, simétrico), manteniendo el acondicionador de texto en float32 para preservar la pronunciación. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

La relevancia de esta ficha radica en que resuelve el problema de desplegar un TTS de calidad en entornos con restricciones de recursos, como aplicaciones web progresivas o dispositivos de bajo consumo, manteniendo la privacidad al procesar todo localmente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de flow-matching de 24 capas (316,0 M parámetros) sobre codec neural Mimi a 24 kHz |
| Parametros totales | 316,0 M (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no LLM; la ventana de tokens depende del texto de entrada) |
| Tipos de cuantizacion | int4 (modelo de lenguaje, MatMulNBits bloque 128 simétrico), int8 dinámico (flow head y codec Mimi encoder/decoder), float32 (text conditioner) |
| Idiomas soportados | Francés (fr) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (archivos .onnx, incluye tokenizer SentencePiece y manifiesto bundle.json) |

## Arquitectura y entrenamiento

El modelo base kyutai/pocket-tts es un modelo de lenguaje autorregresivo de flow-matching con 24 capas y 316 millones de parámetros. Genera representaciones de audio a través del codec neural Mimi, que opera a 24 kHz. El proceso de generación consiste en un modelo de lenguaje principal que predice los tokens del codec, seguido de un "flow head" que decodifica esos tokens en el espacio de audio. La presente conversión mantiene la arquitectura original, pero sustituye los pesos del modelo de lenguaje por versiones cuantizadas a int4 con bloques de 128 y simetría, mientras que el flow head y el codec se cuantizan a int8 dinámico. El acondicionador de texto se conserva en float32, ya que está compuesto casi enteramente por búsquedas en tablas de embeddings y su cuantización no supondría un ahorro significativo (aproximadamente 40 bytes) a cambio de un riesgo de degradación en la pronunciación.

El entrenamiento original del modelo base no se detalla en la información proporcionada, pero se sabe que Kyutai publicó los pesos bajo CC-BY-4.0. La presente conversión no añade entrenamiento adicional, solo cambia el formato numérico y el empaquetado. Se incluyen voces precomputadas (KV-cache) para cuatro hablantes: charles (73 Hz), vera (106 Hz), alba (126 Hz) y azelma (213 Hz), lo que evita cargar el encoder de Mimi en el navegador para la síntesis estándar. Para clonar una voz nueva, se incluye el encoder Mimi en int8.

## Capacidades

- Síntesis de voz en francés de alta calidad a partir de texto, con cuatro voces predefinidas (dos masculinas y dos femeninas) con diferentes tonos.
- Ejecución completamente local en navegador (WebAssembly) o en Python, sin necesidad de GPU ni conexión a servidores.
- Generación de audio a 24 kHz mediante el codec Mimi.
- Clonación de voz opcional: el encoder Mimi incluido permite crear nuevas voces a partir de una muestra de audio, aunque requiere cargar el encoder adicionalmente.
- Integración sencilla con ONNX Runtime Web (JavaScript) y ONNX Runtime Python.
- Compatible con el runtime de referencia de KevinAHM/pocket-tts-onnx-export, que permite ajustar la precisión (int4) y el directorio de modelos.
- Almacenamiento en caché del modelo en el navegador tras la primera descarga, lo que facilita el uso offline posterior.

## Casos de uso

- Accesibilidad web: integrar lectura de texto en francés para personas con discapacidad visual o dificultades de lectura, directamente en el navegador, sin enviar datos a servidores externos.
- Asistentes de voz en aplicaciones de escritorio: dotar de respuestas habladas a asistentes locales que gestionan tareas como calendario, recordatorios o búsqueda de información, con privacidad total al procesar todo en el dispositivo.
- Audiolibros y narración automática: generar versiones en audio de artículos, publicaciones de blog o documentos largos en francés, con control sobre la voz y el tono mediante las voces predefinidas.
- Prototipado rápido de interfaces de voz: desarrolladores que necesitan probar interacciones de voz en francés sin depender de APIs externas, en entornos de desarrollo o demostraciones.
- Aplicaciones educativas: herramientas de aprendizaje de idiomas que necesitan pronunciar palabras o frases en francés de forma local, por ejemplo en aplicaciones móviles o web sin conexión.
- Widgets de lectura en voz alta para sitios web: añadir un botón de "escuchar" a contenido en francés, con un coste de infraestructura nulo y sin necesidad de backend, ya que el modelo se descarga una vez y se ejecuta en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score) ni comparaciones con otros sistemas TTS. Se menciona una medición interna de RMS (0,0026 frente a 0,176) relacionada con un error de configuración del paso por capa, pero no constituye un benchmark de calidad de voz. Por tanto, no es posible presentar una tabla comparativa con datos numéricos verificados.

## Requisitos de hardware

- No requiere GPU: el modelo está diseñado para ejecutarse en CPU, tanto en navegador (WebAssembly) como en Python con ONNX Runtime.
- Almacenamiento: el paquete completo ocupa 222 MB (el archivo principal del modelo de lenguaje int4 es de 155,3 MB, aunque el peso cuantizado es de 40,8 MB; el resto corresponde a los componentes adicionales).
- Memoria RAM: no se especifica un valor mínimo, pero al tratarse de un modelo de 316 M de parámetros cuantizados a int4, se estima que el consumo de memoria durante la inferencia es inferior a 500 MB en CPU.
- Dispositivos compatibles: cualquier ordenador de sobremesa o portátil moderno, así como dispositivos móviles con soporte de WebAssembly (Android, iOS).
- Opciones de despliegue: ONNX Runtime Web (JavaScript/TypeScript), ONNX Runtime Python, o el runtime de referencia de KevinAHM/pocket-tts-onnx-export.
- Latencia y throughput: no se proporcionan datos medidos. Al ser un modelo de flow-matching con 24 capas, la latencia dependerá del hardware, pero se espera que sea adecuada para interacción en tiempo real en CPUs de gama media.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuantización | Idioma | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| kyutai/pocket-tts (base) | 316 M | PyTorch | FP32 | Multilingüe (incluye fr) | CC-BY-4.0 | Python, GPU/CPU |
| prasadvittaldev/pocket-tts-french-onnx-int4 (este) | 316 M | ONNX | int4 + int8 | Francés | CC-BY-4.0 | Navegador (WASM), Python CPU |
| Piper (TTS ligero de Rhasspy) | ~100 M | ONNX | int8 | Multilingüe | MIT | CPU, navegador |

La comparación con Piper es orientativa, ya que no se dispone de datos de calidad comparables. La principal diferencia frente al modelo base es la cuantización agresiva (int4) que reduce drásticamente el tamaño y habilita el despliegue en navegador, a costa de una posible pérdida de fidelidad en la voz. Frente a Piper, Pocket TTS ofrece una arquitectura de flow-matching más moderna y voces preentrenadas de mayor naturalidad (según la descripción del autor), aunque Piper tiene una comunidad más amplia y más idiomas.

## Limitaciones y advertencias

- Solo soporta francés; no se incluyen otros idiomas en esta conversión.
- Las voces disponibles son cuatro y están fijadas por defecto. Para crear una voz nueva es necesario cargar el encoder Mimi y procesar una muestra, lo que aumenta el tiempo de carga y el consumo de memoria.
- La cuantización int4 puede introducir artefactos de audio en comparación con el modelo original en float32, aunque el autor indica que la calidad se mantiene en niveles aceptables.
- El acondicionador de texto se mantiene en float32 deliberadamente; cuantizarlo a int8 degradaría la pronunciación.
- Existe un requisito técnico importante: el estado de voz precomputado (KV-cache) incluye un parámetro `step` por capa que debe coincidir con la longitud de la caché. Si se configura a cero, el modelo produce silencio (RMS 0,0026 frente a 0,176 correcto). Los desarrolladores deben respetar este valor al integrar el modelo.
- Licencia CC-BY-4.0: permite uso comercial y modificación, pero exige atribución al autor original (Kyutai y Prasad Vittaldev). No se aplican restricciones de uso militar ni de privacidad de datos, pero es recomendable revisar los términos completos.
- No se proporcionan garantías de rendimiento ni soporte técnico oficial; el proyecto es una contribución independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/prasadvittaldev/pocket-tts-french-onnx-int4
- Demo en navegador: https://prasadtts.vercel.app
- Modelo base de Kyutai: https://huggingface.co/kyutai/pocket-tts
- Runtime de referencia para ONNX: https://github.com/KevinAHM/pocket-tts-onnx-export
- Perfil de LinkedIn del autor: https://in.linkedin.com/in/prasadvittaldev
