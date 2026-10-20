# itsmechico/chatterbox-multilingual-pt-br-coreml-ane

## Resumen

Este repositorio es una conversión a Core ML del pack multilingüe pt-BR de Chatterbox, el modelo de síntesis de voz de Resemble AI, realizada por el usuario itsmechico. El paquete incluye los dos componentes principales del pipeline original (T3, que convierte texto en tokens de habla, y S3Gen, que transforma esos tokens en audio pasando por un encoder de flujo, un estimador de F0 y un vocoder HiFT) junto con el tokenizer BPE de Chatterbox. Su particularidad es que todos los grafos están preparados para ejecutarse con `MLComputeUnits.cpuAndNeuralEngine`, es decir, sin GPU, lo que permite mantener la síntesis activa en una app de iOS que sigue reproduciendo audio en segundo plano.

El resultado son cinco modelos Core ML que suman unos 556 MB de pesos, con el backbone T3 cuantizado a 4 bits mediante palettización (263 MB) y el resto de componentes en precisión nativa. Se distribuyen tanto en `.mlpackage` como en `.mlmodelc` compilado para iOS 26, junto con las tablas de embeddings, un `config.json` con las constantes, el ruido inicial de referencia del flujo y dos voces de condicionamiento (`rachel` y `thiago`) construidas a partir de grabaciones de dominio público de LibriVox.

Es relevante ahora porque demuestra que un TTS con control de prosodia y condicionamiento de voz puede caber y ejecutarse íntegramente en el Neural Engine de un dispositivo Apple, con un factor de tiempo real de 0,21 a 0,26 en un M5 Max para una frase de 9,5 segundos en portugués. La licencia MIT, heredada del modelo y del tokenizer originales, elimina la fricción para uso comercial, aunque la conversión renuncia a la marca de agua Perth que el paquete Python de Resemble AI inserta en la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en dos etapas convertido a Core ML: T3 (transformer autorregresivo texto → tokens de habla, con caché KV en un `MLState`) + S3Gen (encoder de flujo, paso Euler de flow matching con guidance en el grafo, estimador de F0 y vocoder HiFT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a un modelo TTS) |
| Tipos de cuantizacion | T3 en 4 bits palettizado; el resto de componentes sin cuantizacion declarada (los grafos operan en fp16, segun la model card) |
| Idiomas soportados | pt (portugues, pack pt-BR) y en |
| Licencia | MIT |
| Formato de pesos | `.mlpackage` y `.mlmodelc` compilado para iOS 26; tablas de embeddings en `tables/`, `config.json`, `flow_noise.f32`, `tokenizer.json` (BPE) |
| Tamano del repositorio | 0,6 GB |
| Desglose de componentes | `t3` 263 MB, `flow_encoder` 98 MB, `flow_step` 153 MB, `f0` 6 MB, `hift` 36 MB |
| Frecuencia de muestreo de salida | 24 kHz |
| Voces incluidas | `rachel` y `thiago` (grabaciones de dominio publico de LibriVox, *Dom Casmurro*) |
| Unidad de computo | `MLComputeUnits.cpuAndNeuralEngine` (sin GPU) |

## Arquitectura y entrenamiento

La model card no documenta el entrenamiento, solo la conversion. El pipeline reproduce la estructura de Chatterbox: T3 genera tokens de habla de forma autorregresiva y expone funciones separadas de prefill (`prefill_{128,256,384}`) y decode (`decode_{256,384,512,768,1024}`) con distintos tamanos de secuencia, compartiendo una unica caché KV implementada como `MLState`. Despues, `flow_encoder` proyecta los tokens de habla a `mu`, `flow_step` aplica un paso Euler de flow matching con el guidance integrado en el grafo (funciones `m{768,…,1536}`), `f0` estima la frecuencia fundamental a partir del mel y `hift` sintetiza audio a 24 kHz en ventanas de 128 frames a partir del mel y la fuente sinusoidal.

Las modificaciones para el Neural Engine son el punto tecnicamente interesante. En T3 se pliegan las filas de guidance en el eje de cabezas, la entrada de RMSNorm se escala por 1/32 porque una activacion de attention sink cercana a 1270 desborda fp16, y RoPE y la mascara se calculan en el host. En el encoder de flujo se reescribe la atencion de posicion relativa sin `rel_shift` de forma exacta. En HiFT las convoluciones dilatadas y transpuestas pasan a convoluciones polifasicas, Snake usa su limite α·x² para α pequenos, STFT e iSTFT se expresan como convoluciones y la fuente sinusoidal se calcula en el host en float64. Las mediciones indican que el Neural Engine absorbe el 100 % del coste en todas las funciones salvo el encoder de flujo (99,2 %).

## Capacidades

- Sintesis de voz a partir de texto en portugues de Brasil e ingles, con salida a 24 kHz.
- Condicionamiento de voz: incluye dos voces (`rachel`, `thiago`) generadas con el propio `prepare_conditionals` del pack original a partir de grabaciones de dominio publico, con URL, rango temporal y transcripcion registrados en cada `voice.json`.
- Control del compromiso calidad/velocidad mediante el numero de pasos de flujo (4, 6, 8 o 10 en las mediciones publicadas).
- Ejecucion en el Neural Engine sin GPU, compatible con reproduccion de audio en segundo plano en iOS.
- Ejecucion con CPU + ANE: no requiere Metal ni GPU dedicada.
- No incluye marca de agua Perth, a diferencia del paquete Python de Resemble AI.
- No se documentan capacidades de clonacion zero-shot, tool calling, agentes ni otros modos (thinking, vision, audio de entrada) en la informacion disponible.

## Casos de uso

- Audiolibros y narracion en portugues de Brasil: el paquete incluye condiciones de voz derivadas de lecturas de *Dom Casmurro*, de modo que se puede generar narracion con una voz consistente y prosodia estable en fragmentos largos, encadenando ventanas de 128 frames del vocoder.
- Lectura de noticias o articulos en apps iOS: al ejecutarse en `cpuAndNeuralEngine`, la sintesis sigue funcionando con la app en segundo plano, lo que encaja con reproductores de audio que deben continuar mientras el usuario cambia de aplicacion.
- Accesibilidad (lectores de pantalla y asistencia por voz): con un factor de tiempo real de 0,21-0,26 en M5 Max, una frase de 9,5 s se sintetiza en aproximadamente 2,0-2,5 s, suficiente para lectura por frases sin bloquear la interfaz.
- Asistentes conversacionales locales en iOS: el condicionamiento de voz permite fijar una identidad sonora de marca y generar respuestas en portugues o ingles sin enviar texto a un servicio externo, util para escenarios con requisitos de privacidad.
- Prototipado y evaluacion de TTS en dispositivo: los `.mlpackage` permiten integrar el pipeline en Xcode y medir el coste por componente (T3, flujo, F0, HiFT) antes de decidir que cuantizar o donde recortar pasos de flujo.
- Generacion de voces para contenido multimedia en portugues: la licencia MIT del modelo y del tokenizer, junto con grabaciones de voz de dominio publico, simplifica la publicacion de audio sintetico en productos comerciales.
- Investigacion sobre despliegue de modelos generativos en ANE: las modificaciones documentadas (plegado de guidance, escalado de RMSNorm, convoluciones polifasicas, STFT como convolucion) sirven como referencia reproducible para portar otros pipelines de audio a Core ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta mediciones de latencia y una comprobacion cualitativa de inteligibilidad:

| Metrica | Entorno | Resultado |
|---|---|---|
| Factor de tiempo real (RTF), 4 pasos de flujo | Apple M5 Max, macOS 27, `.cpuAndNeuralEngine`, frase de 9,5 s en portugues | 0,21 |
| Factor de tiempo real (RTF), 6 pasos de flujo | mismo entorno | 0,22 |
| Factor de tiempo real (RTF), 8 pasos de flujo | mismo entorno | 0,24 |
| Factor de tiempo real (RTF), 10 pasos de flujo | mismo entorno | 0,26 |
| Uso del Neural Engine | mismo entorno | 100 % del coste en todas las funciones, 99,2 % en el encoder de flujo |
| Inteligibilidad | Whisper large-v3-turbo sobre las muestras de `samples/` | como maximo un error de palabra |

No hay datos de MOS, similitud de hablante, WER sobre un corpus completo ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para CPU + Neural Engine, no para GPU. No se declara huella de memoria en ejecucion.
- Pesos: aproximadamente 556 MB sumando los cinco modelos (263 + 98 + 153 + 6 + 36 MB), mas las tablas de embeddings de T3 y el tokenizer; el repositorio completo ocupa 0,6 GB.
- GPU recomendadas: ninguna; la conversion esta disenada explicitamente para `MLComputeUnits.cpuAndNeuralEngine` sin GPU.
- Hardware Apple validado: Apple M5 Max con macOS 27. Los `.mlmodelc` estan compilados para iOS 26, por lo que se requiere esa version o superior en dispositivo.
- Despliegue: Core ML dentro de una app iOS o macOS (integracion de los `.mlpackage` en Xcode o carga de los `.mlmodelc`); no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no ejecutan grafos Core ML de TTS.
- Latencia y throughput: RTF de 0,21 a 0,26 segun pasos de flujo en M5 Max, es decir, entre 4 y 5 veces mas rapido que tiempo real en ese hardware; no hay mediciones en iPhone ni en chips anteriores a la serie M5.
- Memoria y rendimiento en dispositivos moviles: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato / runtime | Idiomas | Componentes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`itsmechico/chatterbox-multilingual-pt-br-coreml-ane`) | Core ML, CPU + Neural Engine, `.mlpackage` y `.mlmodelc` iOS 26 | pt, en | T3 4-bit palettizado + flow encoder + flow step + F0 + HiFT | MIT | Hugging Face, 0 descargas, 0 likes |
| `ResembleAI/Chatterbox-Multilingual-pt-br` (upstream) | Pesos originales (no Core ML) | pt, en | T3 + S3Gen completos, con marca de agua Perth en la salida del paquete Python | MIT (segun este repositorio) | Hugging Face, modelo base |
| `ResembleAI/chatterbox` (upstream) | Pesos originales (no Core ML) | en (tokenizer reutilizado aqui) | T3 + S3Gen | MIT (segun este repositorio) | Hugging Face, modelo base |

No se dispone de datos de parametros, contexto ni resultados de benchmarks de los modelos upstream en la informacion proporcionada, ni de terceros comparables (Kokoro, XTTS, Piper u otros) que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Cobertura linguistica reducida: solo portugues (pack pt-BR) e ingles; no se declaran otros idiomas.
- Solo dos voces precondicionadas (`rachel`, `thiago`), ambas derivadas de lecturas de LibriVox; no se documenta clonacion zero-shot en esta conversion.
- Ausencia de marca de agua: la model card indica explicitamente que no se aplica el watermark Perth del paquete Python de Resemble AI, lo que dificulta distinguir audio sintetico del real y puede tener implicaciones legales o de politica de plataforma en algunos contextos.
- Cuantizacion agresiva del backbone: T3 esta palettizado a 4 bits y no se publican mediciones de degradacion respecto al modelo original en fidelidad, prosodia o similitud de hablante.
- Sin datos de evaluacion subjetiva: no hay MOS, comparaciones ciegas ni WER sobre corpus amplios; la unica validacion es una transcripcion con Whisper large-v3-turbo limitada a un error de palabra maximo en las muestras incluidas.
- Dependencia de version de plataforma: los `.mlmodelc` estan compilados para iOS 26 y las mediciones se hicieron en macOS 27; no hay datos de comportamiento en versiones anteriores ni en hardware iPhone.
- Rendimiento medido en un unico equipo de gama alta (M5 Max); se desconoce el RTF en chips A-series o en Macs anteriores.
- Riesgo de alucinacion acustica y artefactos propio de los modelos TTS: no se documentan ni se cuantifican en esta ficha.
- Sesgos: no se documenta la composicion de los datos de entrenamiento del modelo base, por lo que no es posible evaluar sesgos de acento, genero o variedad dialectal del portugues.
- Licencia MIT declarada tanto para el modelo como para el tokenizer y las grabaciones de voz son de dominio publico, por lo que el uso comercial no presenta restricciones conocidas; conviene verificar igualmente los terminos heredados del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/itsmechico/chatterbox-multilingual-pt-br-coreml-ane
- Modelo base (pack multilingue pt-BR): https://huggingface.co/ResembleAI/Chatterbox-Multilingual-pt-br
- Modelo base (tokenizer y modelo original): https://huggingface.co/ResembleAI/chatterbox

No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo.
