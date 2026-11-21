# alkove-ai/alkove-timbre-1-preview

## Resumen

alkove-timbre-1-preview es un modelo de extraccion de embeddings de locutor (voiceprint) desarrollado por alkove-ai, pensado para funcionar integramente en dispositivo (navegador o movil) dentro del SDK de voz Alkove. A partir de ventanas de audio de 16 kHz mono, el modelo produce dos vectores unitarios de 192 dimensiones: `embedding`, que alimenta al modelo companero alkove-focus-1-preview para seguir la voz de una persona concreta, e `id`, que sirve para determinar si dos ventanas corresponden al mismo locutor mediante producto escalar.

El modelo es extremadamente compacto: los pesos en int8 ocupan 0,74 MB y se ejecutan en un unico hilo sobre el motor Alkove (Rust, Apache-2.0), de forma nativa o compilado a WebAssembly. Esta orientacion a despliegue local sin servidor lo diferencia de los sistemas de verificacion de locutor clasicos, que suelen requerir GPUs y arquitecturas mas pesadas.

La version es una preview: tanto los pesos como la interfaz pueden cambiar antes de la version 1.0. Su relevancia actual radica en que demuestra que tareas de speaker verification con EER competitivo (2,95 % en el protocolo de print contra ventana corta) caben en menos de un megabyte y con latencias de 2-3 ms por ventana en hardware movil y de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de extraccion de embeddings de locutor, pesos int8) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 280 a 24.000 muestras (1,5 s recomendado) |
| Tipos de cuantizacion | int8 (unico formato publicado) |
| Idiomas soportados | no especificado como lista; evaluado en frances, ingles, espanol, italiano, portugues, catalan y rumano |
| Licencia | Apache-2.0 |
| Formato de pesos | `.alk` (formato propio del motor Alkove, documentado) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo (tipo de red, capas, atencion, funcion de perdida) ni sobre el volumen o composicion del dataset de entrenamiento. La model card solo indica que el modelo esta disenado para operar sobre audio de 16 kHz mono en el rango -1..1 y que genera dos salidas normalizadas de 192 dimensiones (`embedding` e `id`), ambas con norma unitaria.

La innovacion tecnica principal no reside en la arquitectura sino en el empaquetado y el motor de inferencia: los pesos se distribuyen en el formato `.alk` (con manifiesto JSON que incluye sha256, tamanos y firmas de entradas/salidas) y se ejecutan sobre el motor Alkove escrito en Rust, con soporte nativo y WebAssembly en un solo hilo. El modelo esta pensado para trabajar junto a alkove-focus-1-preview: el `embedding` es la representacion que Focus usa para aislar a un locutor, mientras que `id` es la representacion optimizada para comparacion directa entre ventanas. Para enrolar a una persona se promedian los `embedding` (o `id`) de varias ventanas y se renormaliza el resultado.

## Capacidades

- Extraccion de embeddings de locutor (voiceprint) de 192 dimensiones a partir de ventanas de audio de 16 kHz mono.
- Generacion de dos representaciones especializadas: `embedding` para el seguimiento de voz con alkove-focus-1-preview e `id` para comparacion de identidad por producto escalar.
- Verificacion de locutor (misma voz o no) en ventanas de 1,5 s, con degradacion controlada en ventanas de 1 s.
- Enrolamiento incremental: permite construir el print de un usuario promediando ventanas durante el uso, sin pantalla de registro dedicada.
- Ejecucion en dispositivo: nativa (Rust) o WebAssembly, en un solo hilo, sin envio de audio a servidor.
- Integracion con SDKs oficiales: JavaScript (npm `alkove`), Python (`alkove` en PyPI), Android y Swift.
- Soporte multilingue evaluado en siete idiomas (frances, ingles, espanol, italiano, portugues, catalan y rumano).
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente.

## Casos de uso

- Despertador por voz restringido al propietario: el modelo calcula el `id` de la ventana de activacion y lo compara con el print enrolado del usuario, de modo que solo la voz del dueno active o interrumpa al asistente. Es adecuado por su latencia de 2-3 ms y su tamano de 0,74 MB, que permite mantenerlo cargado permanentemente en el navegador o el movil.
- Enrolamiento implicito sin pantalla de registro: durante las primeras interacciones se acumulan `embedding` de ventanas de 1,5 s y se promedian para construir el print del usuario, eliminando el flujo de grabacion guiada.
- Seguimiento de locutor en llamadas o reuniones: el `embedding` se pasa a alkove-focus-1-preview para aislar la voz objetivo en escenas con ruido, musica u otras voces, con EER de 10,1 % en el protocolo de escenas dificiles con print.
- Filtro de conveniencia en asistentes de movil: decidir si la voz que habla corresponde al usuario habitual antes de ejecutar acciones personales, aceptando que no es un control de acceso de seguridad.
- Procesamiento de audio en el navegador sin backend: al compilarse a WebAssembly, permite verificacion de locutor en aplicaciones web con privacidad por diseno, sin subir audio a servidores.
- Diarizacion ligera en dispositivos de borde: comparar los `id` de ventanas consecutivas para agrupar segmentos por locutor en grabaciones de baja duracion o en dispositivos con recursos limitados.
- Deteccion de intrusos acusticos en dispositivos de hogar: comprobar si la voz que da una orden coincide con la del propietario enrolado antes de ejecutar comandos sensibles.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). EER sobre los conjuntos de test de Common Voice en 7 idiomas, 2.029 locutores no vistos en entrenamiento, 4 clips por locutor (8.057 clips). Comparacion con 3D-Speaker CAM++ (`speech_campplus_sv_zh_en_16k-common_advanced`, Apache-2.0, 28 MB) en las mismas pruebas.

| EER | alkove-timbre `id` (0,74 MB) | CAM++ (28 MB) |
|---|---|---|
| Print de ~12 s (3 clips) contra ventana de 1,5 s | 2,95 % | 1,72 % |
| Igual, solo impostores con tono cercano (±2 semitonos) | 4,11 % | 2,32 % |
| Clip contra clip, clips completos (~4 s) | 4,42 % | 2,61 % |
| Clip contra clip, 3 s | 4,90 % | 3,02 % |
| Clip contra clip, 1,5 s | 7,14 % | 4,75 % |

EER por idioma en el protocolo print contra ventana de 1,5 s: frances 2,68 %, ingles 3,20 %, espanol 2,79 %, italiano 2,57 %, portugues 4,28 %, catalan 2,83 %, rumano 2,30 % (solo 30 locutores).

Protocolo de escenas dificiles (1.424 ventanas con ruido, musica u otra voz; tres condiciones):

| EER | Microfono directo | Tras Focus, con print | Tras Focus, sin print |
|---|---|---|---|
| `id`, ventanas de 1,5 s | 11,9 % | 10,1 % | 11,6 % |
| `id`, ventanas de 1 s | 14,4 % | 14,2 % | 13,4 % |
| `embedding`, ventanas de 1,5 s | 15,7 % | 18,6 % | 19,1 % |

Margen declarado de ±1 punto en este protocolo mas pequeno.

Rendimiento de inferencia declarado:

| Entorno | Latencia por ventana de 1,5 s |
|---|---|
| CPU nativa, 1 hilo, Galaxy Z Fold8 (Android 17) | 2,0 ms |
| CPU nativa, 1 hilo, Apple M1 Max (macOS) | 2,9 ms |

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo (0,74 MB, int8) esta disenado para ejecucion en CPU, no en GPU.
- GPU recomendadas: no aplica; no se documenta soporte de aceleracion por GPU.
- Cabe en cualquier GPU consumer y en cualquier dispositivo con CPU moderna; el requisito real es disponer del motor Alkove (Rust) o de su build WebAssembly.
- Despliegue: motor Alkove nativo (Rust, Apache-2.0), WebAssembly en navegador, SDK de JavaScript (npm `alkove`), paquete Python (`alkove`), SDK de Android y paquete Swift para iOS.
- Latencia declarada: 2,0 ms por ventana de 1,5 s en un Galaxy Z Fold8 y 2,9 ms en un Apple M1 Max, en un solo hilo. No se publica throughput agregado para procesamiento por lotes.
- No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI; el modelo no es un LLM y no usa esos runtimes.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto (ventana de audio) | EER (print ~12 s vs 1,5 s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alkove-timbre-1-preview | 0,74 MB (int8) | 280 a 24.000 muestras (1,5 s recomendado) | 2,95 % | Apache-2.0 | Hugging Face, motor Alkove, SDKs JS/Python/Android/iOS |
| 3D-Speaker CAM++ (`speech_campplus_sv_zh_en_16k-common_advanced`) | 28 MB | no disponible en la informacion proporcionada | 1,72 % | Apache-2.0 | Hugging Face / ModelScope (referencia citada por el autor) |
| Alternativas de verificacion de locutor de mayor tamano (p. ej. ECAPA-TDNN, WavLM-based) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparacion disponible se limita a CAM++, que obtiene mejor EER a costa de un modelo aproximadamente 38 veces mayor y sin el enfoque de ejecucion en WebAssembly ni el formato `.alk` orientado a dispositivo. No se dispone de datos para comparar con otros sistemas de verificacion de locutor en el mismo protocolo.

## Limitaciones y advertencias

- No apto para autenticacion ni control de acceso: con un EER cercano al 3 % es un filtro de conveniencia, no una comprobacion de seguridad.
- No debe usarse para identificar o rastrear personas ni para comparacion forense de locutores.
- Solo admite audio de 16 kHz; otras frecuencias de muestreo no estan soportadas segun la model card.
- Las ventanas de menos de 1 s son menos fiables (EER de 7,14 % en clip contra clip de 1,5 s y 14,4 % en escenas con ruido a 1 s).
- El `embedding` esta optimizado para alkove-focus-1-preview; para comparar voces debe usarse `id`.
- En escenas con ruido, musica u otras voces el EER sube a 10-19 % segun condicion, por lo que el rendimiento en llamadas reales es notablemente peor que en Common Voice.
- El rumano se evaluo con solo 30 locutores, por lo que su cifra (2,30 %) tiene baja fiabilidad estadistica.
- Es una version preview: pesos e interfaz pueden cambiar antes de la version 1.0, lo que implica riesgo de regresiones en produccion.
- No se documentan sesgos demograficos, de acento o de genero; al no haber evaluacion por subgrupos, el riesgo de disparidad no puede descartarse.
- Licencia Apache-2.0 permite uso comercial, pero el copyright corresponde a Eddy Bordi (2026) y se debe conservar el aviso NOTICE.
- Depende del motor Alkove para su ejecucion; no hay pesos en safetensors ni GGUF, lo que limita su uso fuera del ecosistema Alkove.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alkove-ai/alkove-timbre-1-preview
- Modelo companero (Focus): https://huggingface.co/alkove-ai/alkove-focus-1-preview
- Sitio de Alkove: https://alkove.ai
- Repositorio del motor Alkove (Rust): https://github.com/alkove-ai/alkove
- Documentacion del formato `.alk`: https://github.com/alkove-ai/alkove/blob/main/crates/engine/FORMAT.md
- SDK JavaScript (npm): https://www.npmjs.com/package/alkove
- Paquete Python (PyPI): https://pypi.org/project/alkove/
- SDK Android: https://github.com/alkove-ai/alkove/tree/main/android
- Paquete Swift (iOS): https://github.com/alkove-ai/alkove/tree/main/ios
