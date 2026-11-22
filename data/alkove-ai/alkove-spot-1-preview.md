# alkove-ai/alkove-spot-1-preview

## Resumen

alkove-spot-1-preview es un modelo de deteccion de palabras clave (keyword spotting) de vocabulario abierto, desarrollado por alkove-ai como parte del SDK de voz on-device Alkove. A diferencia de los wake-word detectors clasicos, que requieren entrenar un modelo especifico por palabra, Spot detecta cualquier palabra escrita por el desarrollador o el usuario (una wake word, un comando, un nombre propio o una palabra en mitad de una frase) sin reentrenamiento, a partir de audio mono a 16 kHz. Forma parte de un ecosistema mas amplio que incluye alkove-lex (fonemizador) y alkove-focus (aislamiento de voz).

El modelo no transcribe: emite log-probabilidades sobre un inventario de 58 fonemas (mas el blank de CTC) y una probabilidad de actividad de voz, y es el SDK quien busca la secuencia fonetica objetivo en ese flujo. Esa separacion entre el modelo acustico y la logica de busqueda es lo que permite el vocabulario abierto. El modelo es extremadamente compacto (2.8 MB en pesos de 4 bits e int8), pensado para ejecutarse en un solo hilo de CPU, de forma nativa o en WebAssembly, en navegador, movil o escritorio, sin enviar audio a ningun servidor.

Se distribuye como preview bajo licencia Apache-2.0, con soporte declarado para frances, ingles, espanol, italiano, portugues, catalan y rumano. Su relevancia actual radica en que cubre un hueco practico: wake words y comandos de voz personalizables en produccion, con latencia de milisegundos y sin dependencia de la nube, sobre un formato de pesos propio (`.alk`) y un motor Rust abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo acustico con salida CTC sobre 58 fonemas + blank; detalles de capas no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (streaming por tramas de 30 ms; estado recurrente de 19672 floats) |
| Tipos de cuantizacion | 4 bits e int8 (incluidos en el fichero `.alk`) |
| Idiomas soportados | fr, en, es, it, pt, ca, ro |
| Licencia | Apache-2.0 |
| Formato de pesos | `.alk` (formato propio del motor Alkove, documentado en el repositorio) |

Otros datos tecnicos: entrada `audio` float32 `[1, 480]` (30 ms a 16 kHz, mono, rango -1..1); salidas `logp` float32 `[1, 1, 59]` (blank + 58 fonemas, con 3 pasos de retardo, 90 ms) y `speech` float32 `[1, 1]` (probabilidad de voz activa, 1 paso de retardo, 30 ms). Tamano del repositorio: 0.0 GB segun Hugging Face; fichero del modelo: 2.8 MB.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (numero de capas, tipo de bloques, atencion o convoluciones). Lo que si se documenta es la interfaz: el modelo procesa tramas de 480 muestras (30 ms) y mantiene estado entre llamadas (19672 floats, inicializados a cero), lo que implica un modelo de tipo streaming con estado recurrente. La cabeza de salida es compatible con CTC: 59 clases correspondientes al blank (indice 0) y 58 fonemas definidos en `phonemes.json`. Adicionalmente produce una salida auxiliar de deteccion de actividad de voz.

No se han publicado datos sobre el volumen de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (no aplica en un modelo acustico de este tipo) ni innovaciones de decodificacion mas alla de la busqueda de secuencias foneticas que realiza el SDK. La evaluacion se hizo sobre MOCKS (fr, en, es, it) y los conjuntos de test de Common Voice (ca, pt), con 40 palabras escritas por idioma fonetizadas por alkove-lex (primera pronunciacion mas variantes con al menos 25 % de probabilidad). El umbral se calibra sobre la mitad de los hablantes y la recall se mide sobre la otra mitad; las falsas alarmas se cuentan sobre todo el habla que no contiene la palabra.

## Capacidades

- Deteccion de palabras clave de vocabulario abierto: cualquier palabra introducida por el desarrollador o el usuario, sin entrenamiento especifico.
- Wake words personalizables y comandos de voz (nombres de producto, contactos, acciones).
- Deteccion de palabras en mitad de una frase, no solo al inicio del enunciado.
- Fonemizacion integrada via alkove-lex para convertir texto a la secuencia fonetica buscada.
- Deteccion de actividad de voz (VAD) mediante la salida `speech`.
- Modo "solo tras una pausa": acepta una palabra solo si no habia habla en los 300 ms previos, lo que reduce drasticamente las falsas alarmas en frases continuas.
- Umbral configurable por palabra para una tasa de falsas alarmas objetivo (0.5 o 1 por hora).
- Ejecucion en tiempo real en un solo hilo de CPU, nativa o en WebAssembly.
- Soporte multilingue en 7 idiomas: fr, en, es, it, pt, ca, ro.
- Integracion con alkove-focus para ignorar otras voces.
- No realiza transcripcion ni reconocimiento de habla general.

## Casos de uso

- Wake word en asistentes on-device: el SDK busca la palabra de activacion elegida en el flujo de `logp` con un umbral calibrado a una tasa de falsas alarmas concreta; al ser un modelo de 2.8 MB y ~7.5-13 ms por segundo de audio, puede permanecer siempre activo en segundo plano sin coste apreciable de bateria.
- Comandos de voz en aplicaciones moviles: con la SDK de Android o el paquete Swift se pueden definir comandos como "enviar", "borrar" o "siguiente" sin reentrenar; el modo "solo tras una pausa" evita activaciones accidentales durante conversaciones.
- Navegador sin backend: mediante WebAssembly y el paquete npm `alkove`, una web puede detectar palabras pronunciadas por el usuario sin enviar audio a ningun servidor, util para requisitos de privacidad o RGPD.
- Deteccion de nombres propios o marcas en audio: al aceptar cualquier palabra fonetizada con alkove-lex, sirve para monitorizar menciones de productos o contactos en grabaciones o flujos en directo, contando falsas alarmas por hora.
- Control por voz en dispositivos embebidos o de bajo consumo: el modelo corre en un solo hilo de CPU y en formato int8/4 bits, por lo que es viable en telefonos de gama media (referencia medida: Galaxy Z Fold8) y en hardware sin GPU.
- Segmentacion por VAD en pipelines de audio: la salida `speech` permite trocear audio en tramos de habla antes de pasarlo a un ASR o a un sistema de diarizacion, con solo 30 ms de retardo.
- Accesibilidad: activacion de funciones de una aplicacion mediante palabras clave personalizadas para usuarios con movilidad reducida, con la ventaja de que la palabra puede definirse en tiempo de ejecucion sin reentrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) para deteccion de palabras escritas, con 40 palabras por idioma y umbral calibrado sobre la mitad de los hablantes:

| Recall | fr | en | es | it | ca | pt | media |
|---|---|---|---|---|---|---|---|
| A 1 falsa alarma/hora | 89.9 | 66.9 | 69.9 | 78.8 | 91.3 | 85.3 | **80.4 %** |
| A 0.5 falsas alarmas/hora | 85.3 | 62.2 | 61.9 | 74.0 | 86.8 | 72.2 | **73.7 %** |

Modo "solo tras una pausa" (palabra dicha tras 300 ms sin habla), a 1 falsa alarma/hora: **85.9 %** de media; a 0.5: 81.3 % (media de fr, en, es, it, ca, pt). Rumano queda fuera de la tabla porque su conjunto de test de Common Voice es demasiado corto para calibrar el umbral a esas tasas.

Rendimiento de inferencia declarado:

| Plataforma | Coste |
|---|---|
| CPU nativa, 1 hilo, Galaxy Z Fold8 (Android 17) | ~7.5 ms por segundo de audio |
| CPU nativa, 1 hilo, Apple M1 Max (macOS) | ~13 ms por segundo de audio |

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para CPU. El fichero de pesos ocupa 2.8 MB.
- GPU recomendadas: no aplica; no se documenta soporte de aceleracion por GPU.
- Cabe en cualquier dispositivo con CPU moderna: telefonos Android (medido en Galaxy Z Fold8), Apple Silicon (M1 Max), y por extension cualquier portatil o movil actual; tambien en navegador via WebAssembly.
- Despliegue: motor Alkove en Rust (nativo o WebAssembly), SDK npm `alkove` para navegador, paquete Python `alkove` para uso nativo, SDK de Android y paquete Swift para iOS. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia: salida `logp` con 3 pasos de retardo (90 ms) y `speech` con 1 paso (30 ms). Throughput medido de aproximadamente 7.5-13 ms de CPU por segundo de audio en un solo hilo, es decir, dos ordenes de magnitud por debajo del tiempo real.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos de keyword spotting de vocabulario abierto en la informacion proporcionada. A modo de contexto cualitativo:

| Modelo | Tipo | Vocabulario | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| alkove-spot-1-preview | Keyword spotting de vocabulario abierto + VAD | Cualquier palabra fonetizada | 7 | Apache-2.0 | CPU, nativo y WASM |
| Porcupine (Picovoice) | Wake word por palabra entrenada | Palabras preentrenadas | Multiples | Comercial | On-device |
| openWakeWord | Wake word con modelos entrenados | Frases entrenadas | Principalmente en | Apache-2.0 | On-device |
| Whisper (tiny/base) + busqueda de texto | ASR completo con busqueda | Cualquier palabra | Multiples | MIT | CPU/GPU |

La diferencia principal de Spot frente a los detectores de wake word clasicos es que no requiere entrenamiento por palabra; frente a usar un ASR completo, su huella (2.8 MB) y su coste computacional son mucho menores, a cambio de no transcribir.

## Limitaciones y advertencias

- Es una preview: los pesos y la interfaz pueden cambiar antes de la version 1; no se recomienda congelar una integracion de produccion sobre esta version sin prever migracion.
- No transcribe: solo detecta las palabras que se le indican; no sirve como ASR.
- Solo soporta 7 idiomas (fr, en, es, it, pt, ca, ro); fuera de ellos no hay garantia.
- El rendimiento es desigual por idioma: a 1 falsa alarma/hora, el recall va del 66.9 % en ingles al 91.3 % en catalan, por lo que el ingles y el espanol son los casos mas debiles en la tabla publicada.
- Las falsas alarmas existen a la tasa elegida; el autor desaconseja explicitamente activar acciones criticas para la seguridad o irreversibles con una sola deteccion.
- El rumano esta soportado pero no evaluado con umbrales calibrados por falta de datos de test suficientes.
- Los benchmarks son declarados por el autor y no estan verificados (`verified: false` en el model-index).
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar el fichero NOTICE por si hay atribuciones adicionales.
- Depende del ecosistema Alkove (motor `.alk`, SDK y fonemizador alkove-lex) para el flujo completo; el formato de pesos es propio y no es directamente consumible por otros runtimes.
- No se documentan sesgos especificos; como modelo acustico dependiente de la fonemizacion, puede fallar con acentos, ruido o pronunciaciones alejadas de las variantes cubiertas por alkove-lex.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alkove-ai/alkove-spot-1-preview
- Demo en el navegador (Space): https://huggingface.co/spaces/alkove-ai/alkove
- Fonemizador alkove-lex: https://huggingface.co/alkove-ai/alkove-lex-1-preview
- Web oficial de Alkove: https://alkove.ai
- Motor Alkove (Rust, Apache-2.0): https://github.com/alkove-ai/alkove/tree/main/crates/engine
- Documentacion del formato `.alk`: https://github.com/alkove-ai/alkove/blob/main/crates/engine/FORMAT.md
- SDK npm: https://www.npmjs.com/package/alkove
- Paquete Python: https://pypi.org/project/alkove/
- SDK Android: https://github.com/alkove-ai/alkove/tree/main/android
- Paquete Swift (iOS): https://github.com/alkove-ai/alkove/tree/main/ios
