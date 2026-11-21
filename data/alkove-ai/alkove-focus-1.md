# alkove-ai/alkove-focus-1

## Resumen

alkove-focus-1 es un modelo de aislamiento de voz (voice isolation) y supresion de ruido desarrollado por alkove-ai, disenado para funcionar en tiempo real sobre audio de 16 kHz mono. Su funcion principal es separar la voz de un hablante objetivo del resto de fuentes sonoras (otras voces, television, musica, ruido de fondo), partiendo de una huella de voz (voiceprint) generada por su modelo hermano alkove-timbre-1 o, en su defecto, conservando la voz mas proxima al microfono.

El modelo se distribuye como un artefacto de 2,3 MB con pesos en int8 y 4-bit, empaquetado en el formato propio `.alk` para el motor Alkove, y esta pensado para ejecutarse en navegador (WebAssembly) o en dispositivos moviles sin enviar audio a un servidor. Forma parte del SDK de voz on-device Alkove, que agrupa aislamiento, wake word, voiceprint, deteccion de actividad de voz y deteccion de fin de turno.

La relevancia actual del modelo radica en su relacion tamano-calidad: con solo 2,3 MB de pesos declara atenuar una segunda voz hablando sola hasta -33,45 dB en escenarios de Common Voice en 11 idiomas, con una latencia de 16 ms por bloque de 256 muestras. Sustituye a la version preview (alkove-focus-1-preview) a partir de Alkove 0.5 y se publica bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de audio-to-audio para aislamiento de voz; el autor menciona herencia de GTCRN en el NOTICE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa bloques de 256 muestras (16 ms a 16 kHz) con estado persistente entre llamadas |
| Tipos de cuantizacion | int8 y 4-bit (incluidos en el artefacto `.alk`) |
| Idiomas soportados | no disponibles como lista oficial; los benchmarks cubren Common Voice en 11 idiomas y escenas en 7 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | `.alk` (formato propietario del motor Alkove) + manifest `.json` con sha256, tamanos y planes |
| Frecuencia de muestreo | 16 kHz mono, float32 en rango -1 a 1 |
| Tamano del artefacto | 2,3 MB |
| Latencia declarada | 16 ms (un bloque de 256 muestras) |
| Entrada de voiceprint | vector float32 `[1, 192]` (embedding de alkove-timbre-1) o ceros para conservar la voz mas cercana |
| Planes de inferencia | `main` (aislamiento por print o proximidad), `sample` (extraccion de key/value de una muestra de voz) y `split` (aislamiento por muestra) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que opera como un modelo audio-to-audio con estado recurrente entre bloques de 256 muestras a 16 kHz. El NOTICE del repositorio incluye la licencia MIT de GTCRN, lo que sugiere que el modelo parte o reutiliza componentes de esa arquitectura de mejora de voz, aunque el autor no lo confirma explicitamente como base. El modelo mantiene tres planes de inferencia sobre los mismos pesos: `main` para aislamiento directo mediante voiceprint o proximidad al microfono, `sample` para calcular representaciones clave-valor (key/value) a partir de una muestra de voz del usuario, y `split` para ejecutar el aislamiento usando esas representaciones en lugar del print.

No se han publicado datos sobre el numero de tokens de audio, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o ajuste fino supervisado. Los benchmarks declarados emplean el corpus AMI (CC BY 4.0) para escenas de reunion con microfono de diadema, Common Voice (CC0) para escenas de 10 segundos con una segunda voz al mismo nivel, VoiceBank+DEMAND para mejora de voz y el conjunto ciego del DNS Challenge 3. La innovacion tecnica mas destacable es la compresion extrema (2,3 MB en int8 y 4-bit) manteniendo aislamiento de hablante objetivo en tiempo real, junto con el diseno de tres planes que permite cambiar entre aislamiento por huella y por muestra sin reiniciar el estado.

## Capacidades

- Aislamiento de voz objetivo a partir de un voiceprint de 192 dimensiones generado por alkove-timbre-1.
- Aislamiento por muestra de voz: extrae representaciones key/value de 3 segundos de habla del usuario y aisla esa voz en llamadas posteriores.
- Modo sin voiceprint: conserva la voz mas proxima al microfono y descarta el resto.
- Supresion de ruido y musica en ambos modos (con y sin print).
- Separacion de voces que hablan simultaneamente, a la misma distancia o con mayor volumen que el hablante objetivo.
- Procesamiento en tiempo real con 16 ms de latencia por bloque de 256 muestras y estado persistente entre llamadas.
- Ejecucion on-device en navegador (WebAssembly) y en telefono, sin envio de audio a servidor.
- Integracion con el resto del SDK Alkove: wake word, voice activity detection, end of turn y pronunciacion.
- Soporte multilingue implicito: los benchmarks cubren 11 idiomas en Common Voice y 7 en el grafico de calidad-tamano, aunque no se publica una lista oficial de idiomas.

## Casos de uso

- Reuniones y transcripcion selectiva: en una sala con varias personas hablando, Focus aisla la voz del usuario objetivo antes de pasarla a un motor ASR como Whisper, reduciendo las palabras de otras voces en la transcripcion de 17 por minuto en un microfono de diadema crudo a 2,3 por minuto, segun los datos del autor sobre AMI.
- Llamadas y videoconferencias en entornos ruidosos: el modelo elimina television, musica y conversaciones de fondo en tiempo real con 16 ms de latencia, adecuado para integrarse en clientes de videollamada que necesiten limpiar la senal antes de codificar.
- Asistentes de voz on-device: combinado con alkove-timbre-1 y el wake word del SDK, permite que el asistente responda solo a la voz de su propietario aunque haya otras personas hablando, sin enviar audio a la nube.
- Captura de notas de voz en movil: el aislamiento por muestra permite grabar 3 segundos de la voz del usuario y aplicar despues ese perfil a grabaciones largas en entornos con ruido, todo en el dispositivo con 2,3 MB de pesos.
- Transcripcion de reuniones con microfono de diadema: el modo `main` con print reduce el error de palabra (WER) medido con Whisper large-v3 turbo a 16,83 en las ventanas de AMI evaluadas, lo que lo hace util como preprocesado en pipelines de actas automaticas.
- Herramientas de accesibilidad y comunicacion asistida: al aislar la voz del hablante objetivo en tiempo real en el navegador via WebAssembly, puede integrarse en aplicaciones web de subtitulado o comunicacion aumentativa sin infraestructura de servidor.
- Preprocesado para pipelines ASR en produccion: al ser un artefacto pequeno y con estado, se puede desplegar en el borde (edge) antes de cualquier modelo de reconocimiento de voz, reduciendo costes de ancho de banda y mejorando la relacion senal-ruido de la entrada.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Aislamiento de voz | Common Voice, otra voz en la sala, 11 idiomas | SI-SDR del objetivo con print (dB) | 10,64 |
| Aislamiento de voz | Common Voice, otra voz en la sala, 11 idiomas | Nivel de la otra voz hablando sola con print (dB) | -33,45 |
| Aislamiento de voz | AMI meetings, microfono de diadema, 134 ventanas (protocolo VoxLock) | WER con print (Whisper large-v3 turbo) | 16,83 |
| Aislamiento de voz | AMI meetings, microfono de diadema, 134 ventanas (protocolo VoxLock) | Palabras de otras voces por minuto con print | 2,26 |
| Mejora de voz | VoiceBank+DEMAND test set, 824 clips | STOI | 0,892 |
| Mejora de voz | VoiceBank+DEMAND test set, 824 clips | SI-SDR (dB) | 13,26 |
| Mejora de voz | VoiceBank+DEMAND test set, 824 clips | DNSMOS P.835 overall | 3,07 |
| Mejora de voz | VoiceBank+DEMAND test set, 824 clips | DNSMOS P.808 | 3,42 |
| Mejora de voz | DNS Challenge 3 blind test set, 600 clips | DNSMOS P.808 | 3,31 |
| Mejora de voz | DNS Challenge 3 blind test set, 600 clips | DNSMOS P.835 overall | 2,70 |

El autor incluye ademas un grafico comparativo de calidad frente a tamano en escenas de Common Voice en 7 idiomas, con los siguientes valores declarados: alkove-focus-1 a -33,8 dB con 2,3 MB, VoxLock a -28,6 dB con 51 MB, Hush a -11,4 dB con 9,2 MB, DeepFilterNet 3 a -1,0 dB con 8,7 MB y GTCRN a -0,6 dB con 0,26 MB.

## Requisitos de hardware

- VRAM estimada para inferencia: minima; el artefacto pesa 2,3 MB en int8 y 4-bit, por lo que cabe en cualquier GPU consumer e incluso en CPU o en el propio navegador.
- GPU recomendadas: no se especifican; el modelo esta disenado para ejecucion on-device en CPU, movil y WebAssembly, no requiere GPU dedicada.
- Cabe en GPU consumer: si, en cualquier GPU moderna (RTX 3060, RTX 4090, etc.), aunque no es su objetivo principal.
- Opciones de despliegue: motor Alkove (crate Rust `alkove-engine`, disponible en GitHub) y ejecucion en navegador via WebAssembly; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 16 ms por bloque de 256 muestras a 16 kHz, con estado persistente entre llamadas; el autor indica que el modelo funciona igual en telefono y en navegador.

## Comparativa con modelos similares

| Modelo | Tamano | Nivel de otra voz aislada (dB, Common Voice 7 idiomas) | Licencia | Disponibilidad |
|---|---|---|---|---|
| alkove-focus-1 | 2,3 MB | -33,8 | Apache-2.0 | Hugging Face + GitHub |
| VoxLock | 51 MB | -28,6 | no disponible | no disponible en la informacion |
| Hush | 9,2 MB | -11,4 | no disponible | no disponible en la informacion |
| DeepFilterNet 3 | 8,7 MB | -1,0 | no disponible | no disponible en la informacion |
| GTCRN | 0,26 MB | -0,6 | MIT (referenciado en NOTICE) | no disponible en la informacion |

Los datos de comparacion proceden del grafico publicado por el autor; no se dispone de informacion independiente sobre licencias ni disponibilidad de los modelos alternativos.

## Limitaciones y advertencias

- Los resultados de benchmarks estan declarados por el autor y marcados como no verificados; no hay evaluacion independiente publicada.
- El modelo solo procesa audio a 16 kHz mono; no soporta otras frecuencias de muestreo ni audio estereo de forma nativa.
- El aislamiento por voiceprint depende de alkove-timbre-1 para generar el embedding de 192 dimensiones; sin ese modelo, solo funciona el modo de proximidad al microfono.
- No se publica una lista oficial de idiomas soportados; los benchmarks cubren 11 idiomas en Common Voice y 7 en el grafico, pero no se garantiza cobertura mas alla de esos conjuntos.
- El formato de pesos `.alk` es propietario del motor Alkove; no es compatible con ecosistemas estandar como ONNX, GGUF o safetensors sin conversion, y no se documenta un conversor.
- El modelo esta disenado para aislamiento de voz, no para generacion de texto, razonamiento, codigo ni vision; no dispone de tool calling ni capacidades de agente.
- Riesgo de degradacion en escenarios con multiples voces del mismo registro o con voz objetivo muy contaminada; el autor no publica metricas de fallo en esos casos.
- Aunque la licencia es Apache-2.0, el NOTICE incluye la licencia MIT de GTCRN, por lo que conviene revisar las obligaciones de atribucion si se redistribuye el modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alkove-ai/alkove-focus-1
- Modelo de voiceprint alkove-timbre-1: https://huggingface.co/alkove-ai/alkove-timbre-1
- Version anterior alkove-focus-1-preview: https://huggingface.co/alkove-ai/alkove-focus-1-preview
- Demo en navegador (Space): https://huggingface.co/spaces/alkove-ai/alkove
- Repositorio GitHub del motor Alkove: https://github.com/alkove-ai/alkove
- Codigo del plan de aislamiento (focus.rs): https://github.com/alkove-ai/alkove/blob/main/crates/core/src/focus.rs
- Sitio web de Alkove: https://alkove.ai
