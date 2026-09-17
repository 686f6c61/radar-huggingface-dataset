# devendradhakad/autodroid-coreai-community-Kokoro-82M-CoreAI

## Resumen

Kokoro-82M-CoreAI es una conversion del modelo de sintesis de voz (TTS) hexgrad/Kokoro-82M al formato Core AI de Apple (`.aimodel`, iOS 27 y macOS 27). El modelo original es un TTS de 82M de parametros y 24 kHz construido sobre StyleTTS2 e iSTFTNet, no autoregresivo: a partir de fonemas y un vector de voz/estilo genera la forma de onda en una sola pasada. Esta ficha corresponde al repositorio devendradhakad/autodroid-coreai-community-Kokoro-82M-CoreAI, que es un espejo de mlboydaisuke/Kokoro-82M-CoreAI, el repositorio canonico alojado en el CoreAI Model Zoo de john-rocky.

La relevancia de esta version es que traslada un modelo TTS pequeno y de alta calidad al ecosistema on-device de Apple, permitiendo sintesis de voz completamente local, sin dependencias de red ni servicios en la nube. El grafo acustico se divide en tres bundles `.aimodel` (predictor, prosody y vocoder) con dos pasos auxiliares ejecutados en el host, y se ejecuta sobre la unidad de computo CPU de Core AI. El texto a fonemas se resuelve en el host mediante los lexicos de misaki (aproximadamente 180.000 palabras para ingles).

Se trata de un modelo orientado fundamentalmente al ingles, con 28 paquetes de voz incluidos en la descarga y un consumo de unos 335 MB en fp32. No es un modelo de lenguaje: no genera texto, no soporta tool calling y no tiene ventana de contexto conversacional en el sentido habitual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 + iSTFTNet, no autoregresiva (una pasada fonemas + estilo -> waveform) |
| Parametros totales | 82M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica a TTS; buckets fijos de 128 tokens de entrada y 512 frames |
| Tipos de cuantizacion | fp32 (exportacion documentada); no se documentan otras precisiones |
| Idiomas soportados | ingles (en), con G2P de misaki (~180.000 palabras en lexico) |
| Licencia | Apache-2.0 (pesos y las 28 voces en ingles) |
| Formato de pesos | `.aimodel` (bundles Core AI) + `voices/*.pt` (PyTorch) |
| Frecuencia de muestreo | 24 kHz, mono, PCM en [-1, 1] |
| Tamano de la exportacion | ~335 MB en fp32 (descarga inicial de 0.3 GB) |
| Voces incluidas | 28 paquetes de voz en ingles; `af_heart` es la predeterminada |
| Runtime | Core AI, unidad de computo CPU; iOS 27 / macOS 27 |
| Libreria declarada | coreai |

## Arquitectura y entrenamiento

La arquitectura del modelo base es StyleTTS2 combinada con un vocoder iSTFTNet. El pipeline es no autoregresivo y consta de predictor de duraciones, modulo de prosodia y vocoder. En la conversion a Core AI, el grafo acustico se corta en tres bundles independientes de la voz, ya que la expansion duracion -> alineamiento introduce una longitud dependiente de los datos. Los bundles son `kokoro_predictor.aimodel` (entradas `input_ids[1,128]`, `ref_s[1,256]`, `attn_mask[1,128]`; salidas `duration`, `d`, `t_en`), `kokoro_prosody.aimodel` (entradas `d`, `t_en`, `aln[1,128,512]`, `ref_s`, `frame_mask[1,512]`; salidas `asr`, `F0`, `N`) y `kokoro_vocoder.aimodel` (entradas `asr`, `F0`, `N`, `har`, `ref_s`, `frame_mask`; salida `audio[1, L·600]`).

Entre bundles se ejecutan dos pasos en el host: la construccion del alineamiento a partir de las duraciones y el calculo de `har`, que es la STFT de una fuente senoidal (`STFT(SineGen(f0_upsamp(F0)))`). Este ultimo paso debe permanecer fuera del motor porque el desfase de fase 2π de `atan2` en el limite de relleno F0 -> 0 se comporta de forma inestable en fp32. Las longitudes de token (T) y de frame (L) son buckets fijos de 128 y 512: el host rellena por la izquierda hasta el bucket y recorta la salida, y los textos mas largos se dividen en frases en el host. La voz se introduce como el vector `ref_s`, calculado como `pack[len(ids) - 1]`. El modelo base fue publicado por hexgrad bajo licencia Apache-2.0; la informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. El codigo de exportacion a Core AI deriva de `coreai_models` de Apple, con licencia BSD-3-Clause.

## Capacidades

- Sintesis de voz en ingles a 24 kHz, mono, con salida PCM en el rango [-1, 1].
- Generacion no autoregresiva en una sola pasada por utterance, lo que reduce la latencia frente a esquemas autoregresivos.
- 28 voces en ingles incluidas en la descarga, seleccionables mediante etiqueta; `af_heart` es la voz predeterminada y `af_bella`, `af_nicole` y `bf_emma` figuran como las de mayor calidad.
- Conversion de grafema a fonema en el host mediante misaki (`misaki[en]`, sin espeak para ingles) o MisakiSwift, que produce los mismos fonemas en ingles.
- Sintesis en streaming a nivel de frase mediante `synthesizeStreaming(_:onChunk:)`.
- Ejecucion completamente on-device, sin llamadas de red tras la descarga inicial del modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de texto a voz.

## Casos de uso

- Lectura por voz en aplicaciones iOS y macOS: integracion mediante `KitSpeaker(catalog: "kokoro-82m")` y reproduccion de las muestras PCM a 24 kHz, sin necesidad de entitlements ni claves de API.
- Asistentes de accesibilidad: narracion local de contenido escrito para usuarios con discapacidad visual, con la ventaja de que no se envia texto a servidores externos.
- Audiolibros y contenido largo: division del texto en frases en el host, sintesis por utterance y concatenacion de los fragmentos, con seleccion de una de las 28 voces para mantener consistencia de narrador.
- Respuestas habladas en agentes conversacionales locales: el modelo cubre la fase de sintesis dentro de una app que ya gestiona el dialogo con otro modelo de lenguaje, aportando la salida de audio sin dependencia de la nube.
- Notificaciones y avisos por voz en dispositivos Apple: sintesis bajo demanda de mensajes cortos, con una latencia aproximada de 0,75 s por utterance en un M4 Max.
- Traduccion y doblaje asistido en ingles: generacion de pistas de voz para contenido textual en ingles, aprovechando el G2P basado en lexico de misaki para la pronunciacion.
- Pruebas y desarrollo de pipelines TTS: uso del runner `Speak` (GUI y CLI, `swift run speak-cli --model kokoro-82m`) para validar sintesis en local antes de integrar la API en una aplicacion.
- Prototipado de interfaces de voz sin coste de inferencia en servidor: al ejecutarse en la CPU de Core AI, el modelo permite iterar en un Mac o un dispositivo Apple sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta una puerta de calidad espectral frente a la referencia en PyTorch:

| Metrica | Valor |
|---|---|
| Correlacion de espectrograma de magnitud vs referencia PyTorch | 0,999 (voz `af_heart`, varias frases) |
| Correlacion de forma de onda bruta | ~0,98 (efecto acotado e inaudible del limite de relleno de bucket) |
| Latencia por utterance (M4 Max) | ~0,75 s |
| Precision de la exportacion | fp32 |
| Tamano total | ~335 MB |

La fase de la fuente hn-nsf es arbitraria (Kokoro original la aleatoriza), por lo que la comparacion se realiza en el dominio espectral y no en el de la forma de onda. No hay datos de MMLU, HumanEval ni GSM8K porque no aplican a un modelo de sintesis de voz.

## Requisitos de hardware

- No requiere GPU dedicada: el modelo se ejecuta en la unidad de computo CPU de Core AI sobre hardware Apple.
- Tamano en disco: aproximadamente 335 MB en fp32; la primera ejecucion descarga unos 0,3 GB y despues carga desde la cache local en Application Support.
- Plataformas soportadas: iOS 27 y macOS 27, con los bundles `.aimodel` y la libreria coreai.
- Memoria: la informacion disponible no detalla un requisito de memoria minimo mas alla del tamano del modelo.
- Latencia de referencia: ~0,75 s por utterance en un M4 Max. En compilacion Debug el trabajo de host por token es aproximadamente 3 veces mas lento, por lo que las mediciones deben hacerse en Release.
- Despliegue: CoreAIKit via Swift Package Manager (producto `CoreAIKit`), el runner `Examples/Speak` de coreai-kit y el CLI `speak-cli`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- No se documentan requisitos de entitlements ni de Info.plist para la integracion.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta exportacion con su modelo base y con el repositorio canonico del que es espejo, no con modelos TTS de terceros:

| Modelo | Parametros | Formato | Runtime | Licencia | Idiomas | Estado |
|---|---|---|---|---|---|---|
| devendradhakad/autodroid-coreai-community-Kokoro-82M-CoreAI (este repo) | 82M | `.aimodel` + `voices/*.pt` | Core AI (CPU), iOS 27 / macOS 27 | Apache-2.0 | en | Espejo; 0 descargas y 0 likes en el momento de la consulta |
| mlboydaisuke/Kokoro-82M-CoreAI | 82M | `.aimodel` + `voices/*.pt` | Core AI (CPU), iOS 27 / macOS 27 | Apache-2.0 | en | Repositorio canonico; recibe las actualizaciones primero |
| hexgrad/Kokoro-82M | 82M | pesos PyTorch | PyTorch (referencia) | Apache-2.0 | en | Modelo base original |

No se dispone de datos en la informacion proporcionada para comparar con alternativas TTS de otros autores (parametros, contexto, rendimiento o licencia).

## Limitaciones y advertencias

- Cobertura de idioma limitada al ingles; el G2P usa lexicos de misaki y no hay soporte multilingue documentado.
- Las palabras fuera del lexico de aproximadamente 180.000 entradas se deletrean letra a letra, sin respaldo de un G2P neuronal, lo que degrada la pronunciacion de nombres propios, terminos tecnicos y extranjerismos.
- La fase de la fuente hn-nsf es arbitraria y la correlacion de forma de onda bruta frente a PyTorch es de ~0,98; la diferencia es acotada y descrita como inaudible, pero implica que la salida no es bit a bit identica a la referencia.
- El relleno hasta buckets fijos de 128 tokens y 512 frames, con recorte posterior, introduce un efecto en el limite del relleno.
- El paso de calculo de `har` debe permanecer en el host por inestabilidad de la fase `atan2` en fp32; no puede delegarse por completo al motor.
- La salida esta limitada por utterance: los textos largos deben dividirse en frases en el host, y la latencia (~0,75 s por utterance en M4 Max) se acumula.
- Solo se documenta exportacion en fp32; no se ofrecen variantes cuantizadas que reduzcan el tamano de 335 MB.
- Requiere iOS 27 o macOS 27, lo que excluye versiones anteriores del sistema.
- Este repositorio es un espejo: las actualizaciones llegan primero a mlboydaisuke/Kokoro-82M-CoreAI y al CoreAI Model Zoo, por lo que puede quedar desactualizado.
- El repositorio registra 0 descargas y 0 likes, y el autor es un particular, no el equipo del CoreAI Model Zoo; conviene verificar la integridad de los ficheros antes de usarlo en produccion.
- Licencia Apache-2.0 en pesos y voces, apta para uso comercial; el codigo de exportacion deriva de `coreai_models` de Apple bajo BSD-3-Clause, cuyos terminos deben respetarse por separado.
- No se han publicado datos sobre sesgos de las voces ni sobre el dataset de entrenamiento original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devendradhakad/autodroid-coreai-community-Kokoro-82M-CoreAI
- Repositorio canonico (espejo origen): https://huggingface.co/mlboydaisuke/Kokoro-82M-CoreAI
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- CoreAI Model Zoo: https://github.com/john-rocky/coreai-model-zoo
- Ficha completa del port: https://github.com/john-rocky/coreai-model-zoo/blob/main/zoo/kokoro-82m.md
- Script de conversion: https://github.com/john-rocky/coreai-model-zoo/blob/main/conversion/export_kokoro.py
- Runner Speak (GUI y CLI): https://github.com/john-rocky/coreai-kit/tree/main/Examples/Speak
- QuickStart.swift: https://github.com/john-rocky/coreai-kit/blob/main/Examples/Speak/Sources/QuickStart.swift
- misaki (G2P): https://github.com/hexgrad/misaki
- MisakiSwift: https://github.com/mlalma/MisakiSwift
