# alkove-ai/alkove-timbre-1

## Resumen

alkove-timbre-1 es un modelo de verificación e identificación de hablante (speaker verification / speaker identification) desarrollado por alkove-ai, diseñado para funcionar íntegramente en el dispositivo (on-device), ya sea en navegador vía WebAssembly o en teléfono. Convierte una ventana de voz de 16 kHz en un vector unitario de 192 valores (un "voiceprint" o huella de voz) que permite decidir si dos fragmentos de audio corresponden al mismo hablante mediante el producto escalar de sus embeddings. No genera texto ni transcribe: su tarea es la extracción de características biométricas de voz.

El modelo forma parte del SDK de voz Alkove, que agrupa aislamiento de voz, wake word, voiceprint, detección de actividad de voz, fin de turno y pronunciación, todo sin enviar audio a un servidor. Es relevante por su relación tamaño/calidad: con solo 0,97 MB de pesos (mayoritariamente 4-bit) declara un EER del 2,07 % en 11 idiomas sobre Common Voice, frente a modelos como ECAPA-TDNN 512 (25 MB, 5,52 % EER) o CAM++ (28 MB, 1,72 %). Sustituye a la versión preview de Alkove 0.5, cuyos voiceprints no son compatibles con esta versión.

La arquitectura es una red estilo ECAPA-TDNN de 1,47 M de parámetros, entrenada sin pesos preentrenados, con pooling estadístico atencional y salida normalizada de 192 dimensiones. Está publicada bajo licencia Apache-2.0 y se distribuye en un formato propietario `.alk` para el motor Alkove (Rust, Apache-2.0), ejecutable de forma nativa o en WebAssembly en un solo hilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (red convolucional con SE-Res2 blocks y attentive statistics pooling) |
| Parametros totales | 1,47 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de entrada de 1.400 a 32.000 muestras (88 ms a 2 s), 1,5 s (24.000 muestras) recomendada |
| Tipos de cuantizacion | pesos en 4-bit, primera convolucion en int8 |
| Idiomas soportados | 11 idiomas en los test de Common Voice (sin listado explicito en la informacion disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.alk` (formato propio del motor Alkove) + manifiesto JSON |

## Arquitectura y entrenamiento

La red sigue el esquema ECAPA-TDNN: se calculan 80 bandas log-mel cada 10 ms con ventanas de 25 ms dentro del propio modelo; una convolucion 1D de kernel 5 proyecta a 256 canales; siguen tres bloques SE-Res2 (escala Res2 4, kernel 3, dilataciones 2, 3 y 4) con squeeze-excitation; las salidas de los tres bloques se concatenan, pasan por una convolucion 1x1 a 512 canales, se promedian sobre 40 ms y se reducen a 256; finalmente un pooling estadístico atencional con contexto global y una capa lineal producen los 192 valores normalizados. El modelo se entreno sin pesos preentrenados.

La informacion disponible no detalla el numero de tokens ni la composicion exacta del dataset de entrenamiento, ni si se aplico RLHF/DPO (no procede en esta tarea). Los datos de evaluacion declarados provienen de los conjuntos de test de Common Voice (CC0) en 11 idiomas, con 2.325 hablantes nunca vistos en entrenamiento; para aleman, neerlandes, polaco y sueco se usan hablantes de Common Voice 17 que el modelo nunca aprendio. La innovacion principal es la compresion agresiva a 4-bit/int8 (0,97 MB) manteniendo un EER competitivo, junto con la ejecucion en un solo hilo nativo o en WebAssembly.

## Capacidades

- Extraccion de embeddings de hablante: convierte una ventana de voz de 16 kHz mono en un vector unitario de 192 dimensiones.
- Verificacion de hablante: compara dos voiceprints por producto escalar para decidir si son la misma voz.
- Identificacion de hablante: determina cual de las voces conocidas por la aplicacion esta hablando.
- Enrolamiento incremental: promediar los `id` de varias ventanas de una persona y renormalizar para construir su huella.
- Localizacion de la voz del usuario en un flujo de audio continuo.
- Integracion con alkove-focus-1 para conservar la voz de una persona concreta (aislamiento de voz).
- Ejecucion on-device: nativa o WebAssembly, en un solo hilo, sin envio de audio a servidor.
- Umbrales adaptativos: las funciones `verify()` e `identify()` del SDK ajustan los umbrales segun la cantidad de voz disponible en la huella y en la ventana.
- Soporte multilingue en evaluacion (11 idiomas), sin listado explicito de idiomas.

## Casos de uso

- Autenticacion biometrica local en aplicaciones moviles: el SDK enrola la huella del usuario mientras habla y verifica cada frase contra ella, sin salir del dispositivo, lo que reduce el riesgo de filtracion de datos biometricos.
- Aislamiento de voz en asistentes: combinado con alkove-focus-1, el modelo permite conservar solo la voz del usuario y descartar voces de fondo en llamadas o grabaciones.
- Identificacion de interlocutor en reuniones o transcripciones multiparticipante: comparando el `id` de cada segmento con las huellas enroladas se etiqueta quien habla.
- Wake word personalizada: el SDK comprueba cada wake word contra la huella del usuario para evitar activaciones por voces ajenas.
- Segmentacion de la voz del usuario en un flujo de audio largo: el modelo localiza donde aparece su voz para recortar o procesar solo esos tramos.
- Aplicaciones de accesibilidad y control por voz en navegador: al ejecutarse en WebAssembly, permite verificar al hablante en una web sin instalar nada ni enviar audio.
- Filtrado de ruido de fondo en dispositivos con microfono siempre activo: el SDK lee una ventana de 1,5 s cada 0,5 s y ninguna con microfono silencioso, lo que limita el coste energetico.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Verificacion de hablante | Common Voice, 11 idiomas, 2.325 hablantes | EER, huella de ~12 s contra ventana de 1,5 s (%) | 2,07 |
| Verificacion de hablante | Common Voice, 11 idiomas, 2.325 hablantes | EER, clip contra clip, clips completos (%) | 2,80 |
| Verificacion de hablante | Common Voice, 7 idiomas, modelos abiertos ejecutados igual | EER, huella de ~12 s contra ventana de 1,5 s (%) | 2,26 |

Comparativa de tamano y calidad declarada por el autor (EER huella contra 1,5 s, Common Voice en 7 idiomas):

| Modelo | EER (%) | Tamano de pesos |
|---|---|---|
| alkove-timbre-1 | 2,26 | 0,97 MB |
| ECAPA 512 | 5,52 | 25 MB |
| CAM++ | 1,72 | 28 MB |
| ReDimNet2-B6 | 1,67 | 51 MB |
| w2v-BERT 2.0 | 1,31 | 2,5 GB |

Rendimiento de inferencia (declarado por el autor):

| Plataforma | Latencia |
|---|---|
| CPU nativa, 1 hilo, Galaxy Z Fold8 (Android 17) | 5,9 ms por ventana de 1,5 s |
| CPU nativa, 1 hilo, Apple M1 Max (macOS) | 7,8 ms por ventana de 1,5 s |

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo pesa 0,97 MB y esta pensado para CPU, no requiere GPU.
- GPU recomendadas: no aplica; el motor Alkove ejecuta en CPU en un solo hilo.
- Cabe en cualquier dispositivo: telefonos (Android, iOS), navegador via WebAssembly y equipos de escritorio; el consumo de memoria es inferior a 1 MB para los pesos.
- Opciones de despliegue: motor Alkove (Rust, nativo o WebAssembly), SDK de Alkove para navegador (npm `alkove`), paquete Python `alkove`, SDK de Android, paquete Swift para iOS y React Native (`@alkove/react-native`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia: 5,9 ms por ventana de 1,5 s en Galaxy Z Fold8 y 7,8 ms en Apple M1 Max, en un hilo. El SDK lee una ventana cada 0,5 s mientras hay una huella en uso y ninguna con microfono silencioso.
- Throughput: no disponible de forma explicita; puede estimarse a partir de la latencia por ventana.

## Comparativa con modelos similares

| Modelo | Parametros | EER (%) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alkove-timbre-1 | 1,47 M | 2,26 (7 idiomas) / 2,07 (11 idiomas) | 0,97 MB | Apache-2.0 | Hugging Face, motor Alkove y SDKs |
| ECAPA 512 | no disponible | 5,52 | 25 MB | no disponible | no disponible |
| CAM++ | no disponible | 1,72 | 28 MB | no disponible | no disponible |
| ReDimNet2-B6 | no disponible | 1,67 | 51 MB | no disponible | no disponible |
| w2v-BERT 2.0 | no disponible | 1,31 | 2,5 GB | no disponible | no disponible |

Los datos de EER y tamano de los modelos comparados proceden de la grafica de la model card del autor; no se dispone de informacion adicional sobre sus licencias, parametros o condiciones de ejecucion.

## Limitaciones y advertencias

- La model card no detalla sesgos conocidos por genero, edad, acento o idioma; los resultados se declaran sobre Common Voice y pueden no generalizar a dominios distintos (telefonia, ruido, microfonos lejanos).
- Riesgo de falsos positivos y falsos negativos inherente a la verificacion biometrica; los umbrales deben calibrarse con `verify()` e `identify()` segun la cantidad de voz disponible.
- La ventana de entrada esta limitada a 88 ms-2 s; no procesa audio largo de una vez, sino por ventanas.
- Los voiceprints de la version preview (Alkove 0.5) no son compatibles con esta version y deben regenerarse.
- El listado explicito de idiomas soportados no esta disponible; solo se indica que se evaluo en 11 idiomas de Common Voice.
- Los benchmarks estan declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El formato de pesos `.alk` es propio del motor Alkove; no hay pesos en safetensors ni GGUF, lo que limita su uso fuera del ecosistema Alkove.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar el archivo NOTICE por requisitos de atribucion.
- Al ser un modelo biometrico, su uso en produccion exige cumplir la normativa de proteccion de datos (RGPD) sobre datos biometricos, incluso si el procesamiento es local.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alkove-ai/alkove-timbre-1
- Version preview anterior: https://huggingface.co/alkove-ai/alkove-timbre-1-preview
- Modelo complementario alkove-focus-1: https://huggingface.co/alkove-ai/alkove-focus-1
- Sitio de Alkove: https://alkove.ai
- Repositorio del motor Alkove (Rust): https://github.com/alkove-ai/alkove
- Motor de inferencia: https://github.com/alkove-ai/alkove/tree/main/crates/engine
- Formato `.alk`: https://github.com/alkove-ai/alkove/blob/main/crates/engine/FORMAT.md
- SDK Android: https://github.com/alkove-ai/alkove/tree/main/android
- SDK iOS (Swift package): https://github.com/alkove-ai/alkove/tree/main/ios
- SDK navegador (npm): https://www.npmjs.com/package/alkove
- Paquete Python: https://pypi.org/project/alkove/
- React Native (npm): https://www.npmjs.com/package/@alkove/react-native
