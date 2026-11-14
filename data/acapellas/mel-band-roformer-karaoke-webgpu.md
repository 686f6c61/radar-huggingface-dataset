# Acapellas/mel-band-roformer-karaoke-webgpu

## Resumen

Mel-Band RoFormer Karaoke (aufr33/viperx) es un modelo de separacion de fuentes de audio especializado en extraer la voz principal (lead vocal) de una mezcla musical, pensado para producir pistas de karaoke. El checkpoint original procede del trabajo de aufr33 y viperx, y esta version es una re-exportacion a ONNX realizada por el usuario Acapellas a partir de `bdsqlsz/mel_band_roformer_karaoke_aufr33-ONNX`, con modificaciones en el grafo computacional para que sea compatible con el backend WebGPU de `onnxruntime-web`.

La contribucion concreta de este repositorio no es un nuevo entrenamiento, sino una cirugia de grafo: se sustituyen las 26 operaciones `Einsum` por subgrafos equivalentes de `MatMul`, `Mul` y `Transpose`, y se reconstruyen dos operaciones `Split` de 60 salidas (la division en bandas mel) como arboles binarios de splits de 2 salidas. El motivo es tecnico: la exportacion estandar genera shaders que requieren mas de 11 almacenamientos en buffer y superan el limite `maxStorageBuffersPerShaderStage = 10` de WebGPU.

El resultado es un modelo numericamente identico al original (diferencia absoluta maxima de 0.0 en las entradas de prueba) que puede ejecutarse en el navegador mediante WebGPU. Es relevante para desarrolladores que quieran integrar separacion vocal en aplicaciones web sin backend de servidor, como editores de video karaoke. El repositorio ocupa 1.4 GB y se distribuye con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mel-Band RoFormer (transformer con bandas mel, derivado de RoFormer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de frames STFT; tamano de ventana no especificado) |
| Tipos de cuantizacion | no disponible (pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (compatible con onnxruntime-web y backend WebGPU) |

Parametros adicionales de la interfaz de audio:

| Parametro | Valor |
|---|---|
| Frecuencia de muestreo | 44100 Hz |
| n_fft | 2048 |
| Hop length | 441 |
| Ventana | Hann periodica, centrada |
| Entrada | `stft_features` `[1, frames, 4100]` (empaquetado frames-major) |
| Salida | `mask` `[1, 1, 2050, frames, 2]` (mascara de voz principal) |

## Arquitectura y entrenamiento

El modelo base es un Mel-Band RoFormer, una variante de la familia RoFormer adaptada a separacion de fuentes musicales que opera sobre representaciones STFT organizadas en bandas mel. La arquitectura emplea mecanismos de atencion rotatoria (rotary positional embeddings) propios de RoFormer, aplicados sobre las bandas de frecuencia. El checkpoint de origen es `mel_band_roformer_karaoke_aufr33_viperx_sdr_10.1956`, cuyo nombre sugiere un SDR de referencia de aproximadamente 10.1956 dB en la tarea de separacion vocal, aunque no se dispone de la ficha tecnica de entrenamiento (numero de tokens, composicion del dataset, regimen de aumento de datos) en la informacion proporcionada.

La innovacion tecnica de este repositorio es exclusivamente de despliegue: la conversion de `Einsum` a combinaciones de `MatMul`, `Mul` y `Transpose`, y la reescritura de los `Split` de 60 salidas como arboles binarios. Ambas transformaciones preservan la semantica numerica (maxAbsDiff = 0.0) y reducen el numero de storage buffers por shader por debajo del limite de WebGPU. No se documenta en la informacion disponible si hubo entrenamiento adicional, fine-tuning o RLHF; se trata de una re-exportacion del checkpoint existente.

## Capacidades

- Separacion de voz principal (lead vocal) frente al acompanamiento instrumental en mezclas musicales.
- Generacion de la pista de acompanamiento (backing) por resta: `backing = input - lead`.
- Procesamiento de audio a 44.1 kHz con STFT de n_fft 2048 y hop 441.
- Ejecucion en navegador mediante WebGPU a traves de `onnxruntime-web`.
- Interfaz de host-STFT: el llamador calcula la STFT y empaqueta los coeficientes en el formato `[1, frames, 4100]`; el modelo devuelve la mascara en `[1, 1, 2050, frames, 2]`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni capacidades multilingues de texto: es un modelo puramente de procesamiento de senal de audio.

## Casos de uso

- **Generacion de pistas de karaoke en aplicaciones web**: el modelo devuelve una mascara de voz principal que, restada de la mezcla original, produce el instrumental; al ejecutarse en WebGPU no requiere subir el audio a un servidor, lo que simplifica el cumplimiento de privacidad.
- **Editor de video karaoke**: es el caso documentado por el autor, integrado en KaraokeVideoEditor; permite separar la voz de una cancion y sincronizarla con subtitulos en un flujo de edicion de video en el navegador.
- **Remezcla y practica musical**: un musico puede aislar la voz para estudiar la interpretacion o generar una version instrumental para ensayar, usando la resta de la mascara sobre la mezcla.
- **Procesamiento por lotes en cliente**: al no depender de un backend, se puede procesar una biblioteca local de canciones en el navegador del usuario, evitando costes de inferencia en servidor.
- **Prototipado rapido de pipelines de separacion**: la interfaz ONNX documentada (entrada y salida empaquetadas) permite integrar el modelo en scripts Node.js o en aplicaciones web con `onnxruntime-web` sin reescribir el codigo de inferencia.
- **Aplicaciones de audio interactivas de baja friccion**: al ser un unico modelo ONNX de 1.4 GB con licencia MIT, se puede empaquetar en una PWA o en una aplicacion Electron para edicion de audio offline.
- **Investigacion sobre separacion de fuentes**: el checkpoint con SDR cercano a 10.2 dB en la referencia de su nombre sirve como linea base para comparar tecnicas de separacion vocal en entornos web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento mencionado es el SDR implícito en el nombre del checkpoint de origen (`mel_band_roformer_karaoke_aufr33_viperx_sdr_10.1956`), que no se presenta aqui como resultado verificado de benchmark. No se documentan latencias ni throughput en WebGPU.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explicita; el repositorio pesa 1.4 GB en formato ONNX, por lo que se requiere al menos ese orden de memoria para cargar los pesos, mas el espacio de activaciones del grafo.
- **GPU recomendadas**: cualquier GPU con soporte de WebGPU (navegadores Chromium recientes); no se especifican modelos concretos como A100, H100 o RTX 4090.
- **GPU de consumo**: el objetivo declarado es ejecucion en navegador con WebGPU, lo que incluye GPU integradas y dedicadas de consumo; no se confirma compatibilidad con modelos concretos.
- **Opciones de despliegue**: `onnxruntime-web` con el execution provider WebGPU; tambien puede ejecutarse con otros runtimes ONNX en servidor, aunque la cirugia de grafo esta motivada por las limitaciones de WebGPU.
- **Latencia y throughput**: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mel-Band RoFormer Karaoke (aufr33/viperx) — esta version | no disponible | no disponible | Separacion vocal karaoke, ONNX WebGPU | MIT | Hugging Face |
| `bdsqlsz/mel_band_roformer_karaoke_aufr33-ONNX` | no disponible | no disponible | Separacion vocal karaoke, ONNX estandar | no disponible | Hugging Face |
| Mel-Band RoFormer (checkpoint original aufr33/viperx) | no disponible | no disponible | Separacion vocal karaoke | no disponible | no disponible en la informacion |

La comparativa con alternativas de la misma categoria (por ejemplo, otros modelos de separacion de fuentes como Demucs o Spleeter) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **Alcance limitado a una tarea**: solo separa voz principal; no separa bateria, bajo u otros instrumentos, y la pista de acompanamiento se obtiene por resta, lo que puede arrastrar artefactos de la mascara.
- **Dependencia de la STFT del host**: el modelo no calcula la STFT; el llamador debe implementar exactamente los parametros documentados (44100 Hz, n_fft 2048, hop 441, Hann periodica centrada) y el empaquetado `[1, frames, 4100]`; cualquier desviacion degrada la salida.
- **Compatibilidad WebGPU**: la cirugia de grafo resuelve el limite de storage buffers, pero el rendimiento y la estabilidad dependen del navegador y de la GPU; no se documentan pruebas en todas las plataformas.
- **Riesgo de alucinacion**: no aplica en el sentido de generacion de texto, pero la mascara puede introducir artefactos o filtrar parte de la voz en pasajes con instrumentacion solapada.
- **Sesgos**: no documentados; al ser un modelo de audio, puede comportarse peor en generos musicales poco representados en su entrenamiento original, dato no disponible.
- **Idiomas**: no aplica; no se documenta el rendimiento en voces de distintos idiomas o estilos.
- **Licencia**: MIT, lo que permite uso comercial, pero conviene verificar las condiciones del checkpoint de origen y de los datos de entrenamiento originales, no detalladas en la informacion disponible.
- **Produccion**: no hay benchmarks publicados ni garantias de latencia; el tamano de 1.4 GB implica una descarga inicial considerable para aplicaciones web.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Acapellas/mel-band-roformer-karaoke-webgpu
- Repositorio de origen del checkpoint ONNX: https://huggingface.co/bdsqlsz/mel_band_roformer_karaoke_aufr33-ONNX
- Proyecto que lo utiliza (KaraokeVideoEditor): https://github.com/altimar/karaoke_video_editor
- Script de cirugia del grafo: `eval/fix-karaoke-onnx.mjs` dentro del repositorio de KaraokeVideoEditor
