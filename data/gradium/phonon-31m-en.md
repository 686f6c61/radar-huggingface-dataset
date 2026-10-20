# gradium/phonon-31m-en

## Resumen

phonon-31m-en es un modelo de texto a voz (TTS) de la familia Phonon, desarrollado por Gradium, que convierte texto en inglés en audio mono a 24 kHz con una calidad que el autor describe como alta. Su rasgo diferencial es el tamano: 31 millones de parametros (sin contar el tokenizador de audio) y un fichero de pesos cuantizado a 8 bits de solo 64,5 MB, lo que permite ejecutarlo en el navegador, en un telefono o en la CPU de un portatil sin GPU dedicada. La relevancia actual esta en que cubre el nicho de TTS neuronal de calidad con inferencia totalmente local y emision en streaming.

Arquitectonicamente es un transformer de flow matching que predice latentes de audio trama a trama (una cada 80 ms) y los convierte en onda mediante el decodificador del codec Mimi de Kyutai; el modelo se apoya en el trabajo previo Pocket TTS del mismo equipo. La generacion es incremental: el audio empieza a reproducirse mientras el resto de la frase aun se esta sintetizando, algo critico para asistentes conversacionales.

El modelo se publica bajo licencia Apache 2.0, lo que lo hace directamente utilizable en producto comercial, y viene acompanado de un ecosistema de runtimes poco habitual: Python (PyPI), WebAssembly para navegador (npm), Core ML para iOS y macOS, Android con aceleracion en NPU Snapdragon, servidor con API compatible con OpenAI, WebSocket y bindings en Rust y C/C++. Incluye un catalogo de aproximadamente 100 voces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flow matching que predice latentes de audio por tramas de 80 ms + decodificador del codec Mimi (Kyutai); base: Pocket TTS |
| Parametros totales | 31M segun el autor (excluyendo el tokenizador de audio); 41.096.035 en los pesos safetensors publicados (incluye el tokenizador) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (generacion autorregresiva trama a trama, sin ventana de contexto declarada) |
| Tipos de cuantizacion | q8 (8 bits) en GGUF, fichero `model.q8.gguf` de 64,5 MB; pesos originales en safetensors; otros niveles de cuantizacion no documentados |
| Idiomas soportados | ingles (`en`) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (q8) |
| Frecuencia de muestreo de salida | 24 kHz, mono |
| Voces | catalogo de ~100 voces en `gradium/phonon-voices` |
| Repo | 0,2 GB; 15 descargas y 13 likes en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo es un transformer de flow matching que opera sobre latentes de audio del codec Mimi. En lugar de generar la onda directamente, predice el latente correspondiente a cada trama de 80 ms condicionado por el texto, y delega la sintesis final en el decodificador de Mimi. Esta separacion es la que explica el reducido numero de parametros del modelo generativo: el coste de reconstruccion de la onda vive en el codec, no en el transformer. El pipeline declarado en la model card es `text-to-speech` y sigue el linaje de Pocket TTS, el proyecto de Kyutai en el que se basa explicitamente.

La model card no publica informacion sobre el corpus de entrenamiento: no se indica el numero de tokens ni de horas de audio, la composicion del dataset, el proceso de anotacion ni si hubo etapas de ajuste por preferencias humanas (RLHF/DPO). Tampoco se documentan innovaciones adicionales mas alla del esquema de flow matching con prediccion por tramas y la emision en streaming. Cualquier afirmacion sobre datos de entrenamiento seria especulativa y no se incluye aqui.

## Capacidades

- Sintesis de voz en ingles a partir de texto, con salida mono a 24 kHz.
- Generacion en streaming: el audio se entrega por fragmentos mientras el modelo sigue generando, lo que reduce el tiempo hasta el primer audio percibido.
- Normalizacion de texto dependiente del idioma mediante el parametro `lang`, que controla el tratamiento de numeros, simbolos y fechas.
- Seleccion de voz entre un catalogo de aproximadamente 100 voces (`gradium/phonon-voices`).
- Salida en float32 por chunks con tasa de muestreo accesible desde la API de streaming.
- Ejecucion on-device en multiples plataformas: navegador (WebAssembly), iOS/iPadOS/macOS (Core ML), Android (incluida NPU Snapdragon en preview) y CPU de escritorio.
- Integracion como motor TTS del sistema en Android, lo que lo hace utilizable por TalkBack y por cualquier aplicacion que use la clase `TextToSpeech`.
- Servidor con API compatible con OpenAI y servidor WebSocket para streaming en red.
- No se documentan capacidades de vision, audio de entrada, tool calling ni razonamiento multi-paso: es un modelo exclusivamente de sintesis de voz.
- Clonacion de voz instantanea y diseno de voz disponibles a traves de Gradium Studio; la model card no especifica que esos pesos sean abiertos.

## Casos de uso

- Lectura de contenido web en el navegador: el paquete `phonon-tts` de npm compila el modelo a WebAssembly, de modo que una web puede ofrecer lectura en voz alta sin enviar el texto a ningun servidor, con el correspondiente beneficio de privacidad y de coste cero por peticion.
- Accesibilidad en Android: al registrarse como motor TTS del sistema, cubre a TalkBack y a cualquier aplicacion que invoque `TextToSpeech`, con inferencia local y sin depender de servicios en la nube.
- Asistentes de voz conversacionales: la generacion por tramas de 80 ms y la API de streaming permiten empezar a reproducir la respuesta antes de que la frase completa este sintetizada, lo que reduce la latencia percibida en dialogos multi-turno.
- Domotica con Home Assistant: la guia de integracion sobre el servidor compatible con OpenAI permite emitir anuncios de voz en altavoces de la casa con un contenedor Docker y sin salida a internet.
- Pregeneracion de audiolibros, audioguias o material de e-learning: la CLI `ptts` procesa texto por lotes y guarda WAV, y el modelo cabe en cualquier maquina de CI, por lo que se puede sintetizar un catalogo completo en un runner modesto.
- Migracion de pipelines existentes: cualquier backend que ya consuma el endpoint de audio de la API de OpenAI puede apuntar al servidor Docker de Phonon cambiando la URL base, manteniendo el mismo contrato de peticion.
- Aplicaciones iOS y macOS offline: la ruta Core ML permite empaquetar el modelo dentro de la app y sintetizar texto sin red, util para lectores de documentos, apps de notas o navegacion por voz.
- Prototipado de personajes en videojuegos: el catalogo de ~100 voces y el cambio de modelo por repo ID permiten asignar timbres distintos a distintos personajes sin reentrenar nada.
- Servicios de atencion al cliente con voz: combinado con un LLM y el servidor WebSocket, se puede construir un canal de voz donde el texto se sintetiza en el mismo proceso que lo genera el modelo de lenguaje.
- Escenarios con NPU: la preview QNN para Snapdragon permite descargar la sintesis de la CPU en dispositivos moviles, liberando el procesador principal en apps de navegacion o mensajeria.

## Benchmarks y rendimiento

La model card describe la metodologia de evaluacion, pero **no incluye los valores numericos** en la informacion disponible (el texto disponible se interrumpe en la frase introductoria de resultados). Los tres ejes declarados son:

| Metrica | Descripcion | Direccion |
|---|---|---|
| Elo | Preferencia humana en pruebas de escucha ciega por pares, agregada por idioma | Mayor es mejor |
| Hard set LLM WER | Tasa de error de palabra en frases dificiles con datos estructurados (numeros, fechas, codigos, unidades), evaluada con comparacion ASR asistida por LLM | Menor es mejor |
| Seed-TTS LLM WER | La misma metrica sobre las frases de evaluacion de Seed-TTS | Menor es mejor |

Segun la model card, Phonon se comparo con otros modelos TTS abiertos en estas tres medidas por idioma, pero no se han publicado los resultados numericos en la informacion proporcionada, por lo que no se reproducen cifras.

## Requisitos de hardware

- Pesos q8: 64,5 MB (`model.q8.gguf`). Es el dato objetivo disponible; el consumo total de memoria anadira el decodificador de Mimi y el estado del runtime, para lo que no hay cifras publicadas.
- Inferencia en CPU: el autor afirma explicitamente que el modelo corre en la CPU de un portatil, en un telefono y en una pestana del navegador. No se requiere GPU.
- GPU dedicadas: no se declaran requisitos de VRAM ni modelos recomendados (A100, H100, RTX 4090). Para un modelo de este tamano no serian necesarias, pero no hay datos oficiales de rendimiento en GPU.
- Aceleracion en movil: preview de NPU Qualcomm Snapdragon mediante el runtime QNN.
- Aceleracion en Apple: ruta Core ML para iPhone, iPad y Mac.
- Opciones de despliegue documentadas: CLI `ptts` (via `uvx` o binario de GitHub Releases/Homebrew), paquete Python `ptts` en PyPI, paquete npm `phonon-tts` (WASM), crate `ptts` en crates.io, cabecera C `ptts.h` para C/C++, Core ML, Android (incluido motor TTS del sistema), servidor Docker con API compatible con OpenAI, servidor WebSocket y guia para Home Assistant.
- Aceleradores de LLM: no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI. El GGUF es el formato que consume el runtime propio `ptts`, segun la documentacion disponible.
- Latencia y throughput: no disponibles. Como referencia de granularidad, la generacion avanza en tramas de 80 ms y el streaming entrega chunks mientras sintetiza, pero no se publican cifras de tiempo hasta el primer audio ni de factor de tiempo real.

## Comparativa con modelos similares

Comparativa dentro de la propia familia Phonon, que comparte runtime y estructura de ficheros (cambiar de modelo consiste en cambiar el repo ID):

| Modelo | Parametros | Pesos q8 | Idiomas | Licencia |
|---|---:|---:|---|---|
| phonon-31m-en (este) | 31M | 64,5 MB | Ingles | Apache 2.0 |
| phonon-40m-en | 40M | 74,6 MB | Ingles | CC BY-NC 4.0 |
| phonon-40m-fr | 40M | 74,6 MB | Frances | CC BY-NC 4.0 |
| phonon-40m-de | 40M | 74,6 MB | Aleman | CC BY-NC 4.0 |
| phonon-40m-es | 40M | 74,6 MB | Espanol | CC BY-NC 4.0 |
| phonon-40m-pt | 40M | 74,6 MB | Portugues | CC BY-NC 4.0 |
| phonon-40m-multilingual | 40M | 74,6 MB | Los 5 idiomas | CC BY-NC 4.0 |

La diferencia practica clave es la licencia: phonon-31m-en es el unico de la familia con Apache 2.0, mientras que los modelos de 40M usan CC BY-NC 4.0, que excluye el uso comercial. Para produccion en ingles, por tanto, 31m-en es la opcion de la familia sin friccion legal; para otros idiomas no hay alternativa Apache en el catalogo disponible.

Frente a otros modelos TTS abiertos (Kokoro, Piper, estilo VITS/flow-matching de tamano similar), la model card afirma haber realizado comparaciones de Elo y WER, pero no se dispone de los valores numericos ni de las cifras de parametros, contexto o licencia de esos competidores en la informacion proporcionada, por lo que la comparacion cuantitativa queda como "no disponible".

## Limitaciones y advertencias

- Solo habla ingles. El parametro `lang` existe en la API, pero este checkpoint unicamente admite `en`; usar otro valor no convierte al modelo en multilingue. Para espanol habria que recurrir a phonon-40m-es, con licencia CC BY-NC 4.0.
- Riesgo de errores de pronunciacion y de normalizacion: la model card dedica una metrica especifica (Hard set LLM WER) a frases con numeros, fechas, codigos y unidades, lo que sugiere que ese es precisamente el punto debil de la categoria. En dominios con simbologia densa (matriculas, referencias, dosis, codigos postales) conviene validar antes de desplegar.
- Ausencia de datos publicados de benchmarks: no se pueden verificar afirmaciones de calidad frente a alternativas sin ejecutar una evaluacion propia.
- Sin cifras de latencia ni de throughput: el caracter de streaming esta documentado, pero no se puede dimensionar un SLA sin medir en el hardware objetivo.
- Licencia Apache 2.0 sobre los pesos del modelo, pero el sistema depende de componentes de terceros citados en la model card (Pocket TTS de Kyutai y el codec Mimi). Conviene verificar las condiciones de esos componentes antes de distribuir un producto.
- La clonacion de voz y el diseno de voz se ofrecen a traves de Gradium Studio y no se presentan como pesos abiertos; su uso queda sujeto a las condiciones de ese servicio.
- Uso dual y suplantacion: un TTS con ~100 voces y capacidad de clonacion en el ecosistema puede emplearse para generar audio enganoso. En produccion conviene aplicar marcas de agua, consentimiento explicito de la voz y verificacion de la cadena de custodia del audio.
- Dependencia del runtime propio: el GGUF esta pensado para `ptts`; no se documenta compatibilidad con el ecosistema llama.cpp/Ollama. La portabilidad depende del mantenimiento del proyecto `xn-ptts`.
- Sesgos: no se publica informacion sobre el corpus, por lo que no se puede caracterizar el sesgo de acento, genero o variedad dialectal del catalogo de voces.
- El modelo esta recien publicado (octubre de 2026) y con muy poca traccion en el Hub (15 descargas), lo que implica poca validacion independiente y riesgo de cambios en la API del runtime.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gradium/phonon-31m-en
- Demo en el navegador: https://huggingface.co/spaces/gradium/phonon
- Coleccion de la familia Phonon: https://huggingface.co/collections/gradium/phonon
- Catalogo de voces: https://huggingface.co/gradium/phonon-voices
- Runtime en GitHub: https://github.com/gradium-ai/xn-ptts
- Paquete Python (PyPI): https://pypi.org/project/ptts/
- Paquete de navegador (npm): https://www.npmjs.com/package/phonon-tts
- Crate de Rust: https://crates.io/crates/ptts
- Binarios y releases: https://github.com/gradium-ai/xn-ptts/releases
- Guia de Python: https://github.com/gradium-ai/xn-ptts/blob/main/ptts-pyo3/README.md
- Guia de navegador: https://github.com/gradium-ai/xn-ptts/blob/main/ptts-wasm/js/README.md
- Guia de iOS/macOS (Core ML): https://github.com/gradium-ai/xn-ptts/blob/main/ios/PhononTTS/README.md
- Guia de Android: https://github.com/gradium-ai/xn-ptts/blob/main/android/README.md
- Preview NPU Snapdragon (QNN): https://github.com/gradium-ai/xn-ptts/blob/main/qnn/android/README.md
- Motor TTS del sistema en Android: https://github.com/gradium-ai/xn-ptts/blob/main/android/tts-engine/README.md
- Servidor con API compatible con OpenAI: https://github.com/gradium-ai/xn-ptts/blob/main/ptts-openai-server/README.md
- Servidor WebSocket: https://github.com/gradium-ai/xn-ptts/blob/main/ptts-ws-server/README.md
- Guia de Rust: https://github.com/gradium-ai/xn-ptts/blob/main/ptts/README.md
- Cabecera C/C++: https://github.com/gradium-ai/xn-ptts/blob/main/ptts-ffi/include/ptts.h
- Proyecto base Pocket TTS (Kyutai): https://github.com/kyutai-labs/pocket-tts
- Gradium Studio: https://studio.gradium.ai
- Discord: https://discord.gg/T85yt8kD33
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia CC BY-NC 4.0 (modelos de 40M): https://creativecommons.org/licenses/by-nc/4.0/
