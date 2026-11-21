# alkove-ai/alkove-timbre-1

## Resumen

alkove-timbre-1 es un modelo de verificación e identificación de hablante (speaker verification e identificación biométrica por voz) desarrollado por alkove-ai como parte del SDK de voz on-device Alkove. Convierte una ventana de audio de 16 kHz en un vector unitario de 192 dimensiones (voiceprint) que permite decidir si dos fragmentos de voz pertenecen a la misma persona comparando su producto escalar. El modelo está pensado para ejecutarse íntegramente en el dispositivo (móvil o navegador), sin enviar audio a ningún servidor.

El modelo es notable por su relación tamaño/calidad: pesa 0,97 MB con pesos mayoritariamente de 4 bits y declara una tasa de igual error (EER) del 2,07 % en verificación con voiceprints de unos 12 s contra ventanas de 1,5 s sobre 11 idiomas de Common Voice, con 2.325 hablantes nunca vistos en entrenamiento. Frente a alternativas open source como CAM++ (28 MB), ReDimNet2-B6 (51 MB) o w2v-BERT 2.0 (2,5 GB), ofrece un tamaño dos órdenes de magnitud menor.

Se distribuye en el formato propietario `.alk` para el motor Alkove (Rust, Apache-2.0), con ejecución nativa o vía WebAssembly en un solo hilo, y SDKs para navegador, Python, Android, iOS y React Native. Sustituye a la versión preview `alkove-timbre-1-preview`, cuyos voiceprints no son compatibles y deben regenerarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings de hablante; salida de 192 dimensiones) |
| Parametros totales | no disponible (peso del fichero: 0,97 MB, mayoritariamente 4-bit) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 1.400 a 32.000 muestras (88 ms a 2 s), 1,5 s (24.000 muestras) recomendada |
| Tipos de cuantizacion | 4-bit e int8 (pesos del fichero `.alk`) |
| Idiomas soportados | 11 idiomas evaluados en Common Voice: frances, ingles, espanol, italiano, portugues, catalan, rumano, aleman, neerlandes, polaco y sueco |
| Licencia | Apache-2.0 |
| Formato de pesos | `.alk` (formato propietario del motor Alkove, documentado); manifiesto JSON con sha256 y tamanos |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de red, capas, funcion de perdida ni composicion del dataset de entrenamiento). Lo que si se documenta es la interfaz: recibe audio float32 mono a 16 kHz en el rango -1 a 1, con ventanas de entre 1.400 y 32.000 muestras, y produce dos salidas, `embedding` e `id`, ambas vectores float32 `[1, 192]` de norma unitaria. En esta version `embedding` e `id` son el mismo vector.

El proceso de enrolamiento consiste en promediar el vector `id` de varias ventanas de la voz del usuario y renormalizar el resultado. La comparacion entre dos voces se hace por producto escalar de sus vectores. El modelo se ejecuta sobre el motor Alkove (Rust, Apache-2.0) en un solo hilo, de forma nativa o compilado a WebAssembly, con pesos cuantizados a 4 bits e int8. No se especifican datos sobre tokens de entrenamiento, uso de RLHF/DPO ni innovaciones de atencion; la innovacion principal declarada es la compresion extrema a 0,97 MB manteniendo EER competitivos.

## Capacidades

- Extraccion de embeddings de hablante (voiceprint) de 192 dimensiones a partir de ventanas de 88 ms a 2 s de audio a 16 kHz.
- Verificacion de hablante: decidir si una ventana de voz corresponde al mismo hablante que un voiceprint enrolado, mediante producto escalar.
- Identificacion de hablante: determinar cual de las voces conocidas por la aplicacion esta hablando.
- Localizacion del hablante objetivo dentro de un flujo de audio continuo (deteccion de donde aparece la voz del usuario).
- Enrolamiento incremental: aprendizaje del voiceprint del usuario mientras habla, promediando y renormalizando vectores.
- Umbrales adaptativos: las funciones `verify()` e `identify()` del SDK ajustan los umbrales segun la cantidad de voz disponible en el voiceprint y en la ventana.
- Ejecucion on-device en un solo hilo: nativa (Rust), WebAssembly en navegador, Android, iOS, React Native y Python.
- Integracion con alkove-focus-1 para aislar la voz del usuario en la senal.
- No soporta generacion de texto, codigo, vision ni tool calling; es un modelo exclusivamente de audio.

## Casos de uso

- Autenticacion biometrica local en aplicaciones moviles: el SDK enrola el voiceprint del usuario mientras habla y verifica cada frase contra el, sin enviar audio al servidor; adecuado por su tamano de 0,97 MB y su latencia de 5,9 ms por ventana de 1,5 s en un Galaxy Z Fold8.
- Desbloqueo por voz y verificacion continua en el navegador: al ejecutarse en WebAssembly, permite verificar la identidad del hablante en aplicaciones web sin infraestructura de servidor ni coste de inferencia en la nube.
- Aislamiento de la voz del usuario en llamadas o grabaciones: combinado con alkove-focus-1, el voiceprint indica que voz conservar, util para cancelacion de ruido selectiva o diarizacion centrada en el usuario.
- Deteccion de wake word personalizada por hablante: el SDK comprueba cada frase o wake word contra el voiceprint, de modo que solo el propietario active el asistente.
- Identificacion de participantes en reuniones o transcripciones: con varios voiceprints enrolados, el modelo determina cual de las voces conocidas habla en cada ventana de 1,5 s.
- Control de acceso fisico o de dispositivos IoT con recursos limitados: el modelo cabe en microcontroladores o telefonos de gama baja y funciona sin conexion, con un coste de 0,97 MB de almacenamiento.
- Investigacion en biometria de voz: su EER declarado en 11 idiomas de Common Voice con 2.325 hablantes no vistos lo hace util como referencia de modelos ultracompactos en experimentos de verificacion de hablante.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente):

| Metrica | Dataset | Valor |
|---|---|---|
| EER, voiceprint de ~12 s contra ventana de 1,5 s (%) | Common Voice, 11 idiomas, 2.325 hablantes | 2,07 |
| EER, clip contra clip, clips completos (%) | Common Voice, 11 idiomas, 2.325 hablantes | 2,80 |
| EER, voiceprint de ~12 s contra ventana de 1,5 s (%) | Common Voice, 7 idiomas, mismos trials que modelos abiertos | 2,26 |

Comparativa de EER (voiceprint contra ventana de 1,5 s, Common Voice en 7 idiomas) y tamano, segun la model card:

| Modelo | EER (%) | Tamano |
|---|---|---|
| alkove-timbre-1 | 2,26 | 0,97 MB |
| ECAPA 512 | 5,52 | 25 MB |
| CAM++ | 1,72 | 28 MB |
| ReDimNet2-B6 | 1,67 | 51 MB |
| w2v-BERT 2.0 | 1,31 | 2,5 GB |

Rendimiento de inferencia declarado:

| Plataforma | Latencia por ventana de 1,5 s |
|---|---|
| CPU nativa, 1 hilo, Galaxy Z Fold8 (Android 17) | 5,9 ms |
| CPU nativa, 1 hilo, Apple M1 Max (macOS) | 7,8 ms |

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para CPU. El fichero de pesos ocupa 0,97 MB, por lo que la huella de memoria es minima.
- GPU recomendadas: no necesarias. El modelo se ejecuta en CPU de un solo hilo.
- Cabe en cualquier GPU consumer e incluso en telefonos moviles y navegadores; no requiere GPU dedicada.
- Opciones de despliegue: motor Alkove (Rust, nativo o WebAssembly), SDK de navegador (`alkove` en npm), paquete Python (`alkove` en PyPI), SDK de Android, Swift package para iOS y React Native (`@alkove/react-native`).
- Latencia: 5,9 ms por ventana de 1,5 s en Galaxy Z Fold8 y 7,8 ms en Apple M1 Max, en un solo hilo. El SDK procesa una ventana de 1,5 s cada 0,5 s mientras hay un voiceprint en uso, y ninguna con microfono silencioso.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el modelo no usa esos runtimes.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | EER (%) | Contexto / ventana | Licencia | Formato |
|---|---|---|---|---|---|
| alkove-timbre-1 | 0,97 MB, mayoritariamente 4-bit | 2,26 (7 idiomas) / 2,07 (11 idiomas) | ventana de 88 ms a 2 s | Apache-2.0 | `.alk` (motor Alkove) |
| CAM++ (`speech_campplus_sv_zh_en_16k-common_advanced`) | 28 MB | 1,72 | no disponible | Apache-2.0 | no disponible |
| ReDimNet2-B6 | 51 MB | 1,67 | no disponible | no disponible | no disponible |
| w2v-BERT 2.0 | 2,5 GB | 1,31 | no disponible | no disponible | no disponible |
| ECAPA 512 | 25 MB | 5,52 | no disponible | no disponible | no disponible |

La ventaja de alkove-timbre-1 es el tamano (entre 25 y 2.500 veces menor que las alternativas) a costa de un EER algo superior al de CAM++, ReDimNet2-B6 y w2v-BERT 2.0, pero claramente mejor que ECAPA 512. La comparativa de EER la proporciona el propio autor ejecutando los modelos abiertos en los mismos trials.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- La model card no detalla la arquitectura interna, los datos de entrenamiento ni la composicion del dataset, lo que dificulta evaluar sesgos y generalizacion.
- El EER se mide sobre Common Voice (audio de lectura, CC0); el rendimiento puede degradarse en condiciones de ruido, microfonos lejanos o audio telefonico.
- La cobertura linguistica declarada se limita a 11 idiomas; el rendimiento en otras lenguas no esta documentado.
- Los voiceprints generados por la version preview (`alkove-timbre-1-preview`) no son compatibles con esta version y deben regenerarse.
- El formato `.alk` es propietario del motor Alkove; aunque el formato esta documentado y el motor es Apache-2.0, no hay soporte para runtimes estandar de inferencia.
- El modelo no genera texto ni realiza tareas de razonamiento; su uso esta acotado a biometria de voz.
- Riesgo de suplantacion de voz (deepfakes, audio sintetico) no abordado en la informacion disponible; en produccion conviene combinar la verificacion con otros factores.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar el fichero NOTICE de copyright incluido en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alkove-ai/alkove-timbre-1
- Version preview sustituida: https://huggingface.co/alkove-ai/alkove-timbre-1-preview
- Modelo complementario alkove-focus-1: https://huggingface.co/alkove-ai/alkove-focus-1
- Sitio de Alkove: https://alkove.ai
- Repositorio del motor Alkove (Rust): https://github.com/alkove-ai/alkove
- Documentacion del formato `.alk`: https://github.com/alkove-ai/alkove/blob/main/crates/engine/FORMAT.md
- SDK Android: https://github.com/alkove-ai/alkove/tree/main/android
- SDK iOS (Swift package): https://github.com/alkove-ai/alkove/tree/main/ios
- Paquete npm del SDK: https://www.npmjs.com/package/alkove
- Paquete npm de React Native: https://www.npmjs.com/package/@alkove/react-native
- Paquete Python: https://pypi.org/project/alkove/
