# raymondchins/whisper-large-v3-turbo-decoder-ane-int8

## Resumen

whisper-large-v3-turbo-decoder-ane-int8 es una conversion del decodificador de texto del modelo de reconocimiento automatico del habla openai/whisper-large-v3-turbo a un unico modelo Core ML con estado, disenado para ejecutarse en la Apple Neural Engine. Lo publica el desarrollador raymondchins como componente del motor de dictado Speakey para macOS. Los pesos son los originales de OpenAI, cuantizados a int8 y sin reentrenamiento; no se trata de un modelo nuevo, sino de una reimplementacion del decodificador optimizada para hardware Apple.

El problema que resuelve es de latencia: el decodificador de WhisperKit procesa un token por llamada, de modo que un prompt de vocabulario completo requiere tantas invocaciones como tokens contenga. Esta version mantiene la cache KV dentro del estado de Core ML y lee hasta 64 tokens por llamada, lo que reduce el coste por token de 6,1 ms a 2,5 ms en un M5 Max en caliente.

Solo sustituye el decodificador. El codificador de audio, el espectrograma mel y el tokenizador siguen siendo los de la build de WhisperKit de Argmax (`openai_whisper-large-v3-v20240930_547MB`, la variante pequena), y el modelo se integra en WhisperKit como su componente `TextDecoding`. Esta pensado para escenarios on-device en macOS 15 o superior sobre Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de Whisper (4 capas) convertido a Core ML stateful; proyecciones como convoluciones 1x1 channels-first |
| Parametros totales | no disponible (el repo ocupa 0,3 GB; decodificador de 185 MB en int8, embeddings de 133 MB + 1,1 MB en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 224 tokens por toma, prompt incluido; lectura de hasta 64 tokens por llamada |
| Tipos de cuantizacion | int8 para los pesos del decodificador; fp16 para los embeddings de tokens y de posicion |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados de Whisper large-v3-turbo; el autor menciona pruebas con indonesio e ingles) |
| Licencia | MIT (procedente de OpenAI) |
| Formato de pesos | Core ML (`decoder.mlmodelc`), embeddings en float16 crudo (`.f16`), metadatos en `speakey.json` |
| Vocabulario | 51.866 tokens (dimension de logits y de `embed_tokens`) |
| Dimension del modelo | 1.280 canales; salida del codificador (1, 1280, 1, 1500) |
| Requisitos de plataforma | macOS 15 o superior sobre Apple silicon (necesario para el estado de Core ML) |

## Arquitectura y entrenamiento

El modelo es el decodificador de Whisper large-v3-turbo, un transformer de 4 capas con atencion cruzada sobre la salida del codificador. La conversion agrupa tres funciones (`cross`, `main` y `step`) que comparten un unico `MLState`: `cross` recibe la salida del codificador (1, 1280, 1, 1500), escribe las claves y valores de atencion cruzada de cada capa en el estado y limpia la cache de autoatencion, y se invoca una vez por toma. `main` procesa 64 filas de tokens a la vez y `step` hace lo mismo para un unico token, devolviendo los logits completos (1, 51866).

La innovacion tecnica esta en la gestion de la cache: en lugar de un slice dinamico (que en Core ML recaia en la CPU), las escrituras en la cache se hacen mediante matrices one-hot (`place`, `placeT`), con una mascara aditiva (`mask`, valores 0 o -1e4) y un selector de fila (`sel`) que devuelve los logits de la fila elegida. Las filas de relleno reciben una columna `place` a cero, por lo que no escriben nada. Todas las proyecciones se implementan como convoluciones 1x1 sobre tensores channels-first, el layout nativo de la Neural Engine.

No hay entrenamiento ni ajuste fino: los pesos son los de OpenAI cuantizados a int8. La model card no detalla la composicion del dataset de entrenamiento original ni si hubo RLHF o DPO, por lo que esos datos deben consultarse en la ficha de openai/whisper-large-v3-turbo.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) dentro de un pipeline WhisperKit, actuando como decodificador de texto.
- Procesamiento de hasta 224 tokens por toma, prompt incluido, con lectura de 64 tokens por llamada.
- Transcripcion multilingue y con cambio de idioma, heredada de Whisper large-v3-turbo (el autor cita pruebas con tomas en indonesio e ingles).
- Decodificacion por lotes de 64 filas con relleno seguro (las filas de relleno no escriben en la cache).
- Integracion como `TextDecoding` en WhisperKit, junto con el codificador, mel y tokenizador de Argmax.
- Ejecucion on-device en la Apple Neural Engine mediante `computeUnits = .cpuAndNeuralEngine`.
- No soporta tool calling, function calling, agentes, vision ni audio de forma nativa; es exclusivamente un decodificador de texto para ASR.

## Casos de uso

- Dictado en macOS: es su proposito original en Speakey; el modelo descarga los pesos y transcribe en local sin enviar audio a la nube, con un p50 de unos 503 ms por toma en un M5 Max.
- Transcripcion de reuniones y notas de voz: la ventana de 224 tokens por toma y la lectura de 64 tokens por llamada permiten transcribir fragmentos de audio de forma interactiva en un Mac.
- Subtitulado local de contenido en indonesio e ingles: el autor valida la paridad de palabras con la build fp16 en 11 de 12 tomas, lo que lo hace adecuado para generar subtitulos sin conexion.
- Aplicaciones de accesibilidad: dictado por voz integrado en herramientas de escritura para usuarios con movilidad reducida, ejecutandose integramente en el dispositivo.
- Procesamiento de audio confidencial: al no requerir red, encaja en flujos con requisitos de privacidad (legal, sanitario) donde el audio no puede salir del equipo.
- Prototipado de pipelines ASR en Apple silicon: sirve para medir el rendimiento de la decodificacion en la Neural Engine antes de desplegar la variante fp16 completa de Turbo.
- Integracion en apps de terceros sobre WhisperKit: cualquier app que use WhisperKit puede sustituir su decodificador por este modelo para reducir la latencia por token.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (M5 Max, en caliente):

| Metrica | WhisperKit decoder | Este decoder |
|---|---|---|
| Tiempo por token | 6,1 ms | 2,5 ms |
| Toma completa con la variante de 547 MB en Speakey (12 tomas indonesio/ingles, p50) | ~557 ms | ~503 ms |

Paridad cualitativa: en 11 de 12 tomas las palabras coinciden con la build fp16 (la restante difiere en una palabra de ruido). En un bench anterior, int8 cambio una vez las mayusculas de una palabra ("agents" a "Agents"), motivo por el que la build completa de Turbo se mantiene en fp16. No se han publicado resultados de benchmarks estandar (WER, MMLU, etc.) en la informacion disponible.

## Requisitos de hardware

- Plataforma: macOS 15 o superior sobre Apple silicon (imprescindible para el estado de Core ML).
- Memoria: el repo ocupa 0,3 GB; el decodificador son 185 MB en int8 y los embeddings 133 MB + 1,1 MB en fp16, por lo que cabe holgadamente en cualquier Mac con Apple silicon.
- GPU/accelerador: se ejecuta en la Apple Neural Engine con `computeUnits = .cpuAndNeuralEngine`; no requiere GPU dedicada.
- No esta pensado para CUDA, A100, H100 ni RTX 4090: es exclusivamente Core ML.
- Despliegue: Core ML cargando `decoder.mlmodelc` tres veces con `MLModelConfiguration.functionName` en `cross`, `main` y `step`, creando un unico estado con `makeState()` de `main` y pasandolo a todas las llamadas; los embeddings se mapean en memoria. Se integra en WhisperKit como `TextDecoding`.
- Latencia: 2,5 ms por token y ~503 ms por toma (p50) en un M5 Max; no hay datos para otros chips en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (decoder ANE int8) | no disponible (4 capas, 185 MB int8) | 224 tokens por toma, 64 por llamada | Core ML stateful | MIT | Solo decodificador; requiere encoder de WhisperKit |
| raymondchins/whisper-large-v3-turbo-decoder-ane (fp16) | no disponible | no disponible | Core ML | MIT | Variante fp16 para la build completa de Turbo; mayor fidelidad, mayor tamano |
| WhisperKit (Argmax) decoder | el de Whisper large-v3-turbo | un token por llamada | Core ML | MIT (pesos OpenAI) | Referencia de latencia: 6,1 ms/token frente a 2,5 ms |
| openai/whisper-large-v3-turbo | no disponible | 448 posiciones (embedding de posicion de 448) | safetensors | MIT | Modelo original completo; no optimizado para Neural Engine |

## Limitaciones y advertencias

- Solo es el decodificador: no funciona de forma autonoma; necesita el codificador, el mel y el tokenizador de WhisperKit (`openai_whisper-large-v3-v20240930_547MB`).
- Exclusivo de Apple silicon con macOS 15 o superior; no hay soporte para CUDA, Linux ni Windows.
- La cuantizacion int8 puede alterar detalles menores: el autor documenta un cambio de mayusculas ("agents" a "Agents") y una palabra de ruido distinta en 1 de 12 tomas.
- Ventana limitada a 224 tokens por toma, prompt incluido; no apto para contextos largos sin trocear el audio.
- Riesgo de alucinacion inherente a Whisper en audio ruidoso o silencios; no se documentan mitigaciones adicionales.
- Idiomas soportados no detallados en la ficha; la validacion publicada se limita a indonesio e ingles.
- Licencia MIT, sin restricciones conocidas para uso comercial, pero conviene verificar las condiciones de los pesos originales de OpenAI.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion fuera de Speakey.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raymondchins/whisper-large-v3-turbo-decoder-ane-int8
- Variante fp16: https://huggingface.co/raymondchins/whisper-large-v3-turbo-decoder-ane
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Build de WhisperKit de Argmax: https://huggingface.co/argmaxinc/whisperkit-coreml
- App Speakey: https://getspeakey.com
