# Acapellas/AudioSeparatorONNX

## Resumen

AudioSeparatorONNX es una coleccion de modelos populares de separacion de fuentes de audio (UVR5, MDX-Net, VR Architecture y BSRoformer) convertidos al formato ONNX y empaquetados como archivos unicos autocontenidos. El repositorio lo publica el usuario Acapellas bajo licencia MIT y esta orientado al pipeline `audio-to-audio` de Hugging Face. Su proposito es eliminar la dependencia de Python y PyTorch que arrastran las herramientas habituales (`audio-separator` y Ultimate Vocal Remover), de modo que la separacion de pistas pueda integrarse en aplicaciones nativas, dispositivos moviles, sistemas embebidos o servicios de servidor.

La innovacion principal no esta en los modelos en si (que son conversiones de arquitecturas ya conocidas), sino en el empaquetado: cada archivo `.onnx` lleva embebidos dos blobs de metadatos JSON dentro del campo `metadata_props`. La clave `sep_meta` contiene todos los parametros de inferencia (arquitectura, stems, configuracion STFT, tamano de chunk, solapamiento y, para Roformer, los arrays `freq_indices` y `num_bands_per_freq`). La clave `model_config` reconstruye la configuracion original de entrenamiento, permitiendo recuperar un YAML valido para `audio-separator` sin necesidad del sidecar original.

El repositorio ocupa 0,9 GB, no tiene descargas ni likes en el momento de la consulta y fue creado en noviembre de 2026. No se dispone de informacion sobre el numero de parametros, la longitud de contexto (no aplica, es un modelo de audio) ni los idiomas soportados, ya que se trata de una tarea de procesamiento de senal, no de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiples: MDX-Net, VR Architecture, BSRoformer (Roformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; usa chunks con solapamiento configurables via `sep_meta`) |
| Tipos de cuantizacion | no disponible (pesos en ONNX, sin variantes cuantizadas documentadas) |
| Idiomas soportados | no disponible (no aplica: separacion de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx` autocontenido con metadatos `sep_meta` y `model_config` embebidos) |

## Arquitectura y entrenamiento

El repositorio agrupa varias familias de arquitecturas de separacion de fuentes ampliamente usadas en la comunidad UVR. Los modelos MDX-Net y VR Architecture son redes convolutionales orientadas a la separacion de stems (voz, instrumental, bateria, bajo, etc.) mediante representaciones espectrales con STFT. Los modelos BSRoformer emplean una arquitectura transformer con atencion sobre bandas de frecuencia (`freq_indices`, `num_bands_per_freq`), lo que permite modelar dependencias espectrales de forma mas eficiente que las CNN clasicas. No se proporcionan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de ajuste fino con RLHF o DPO, ya que no aplica a este dominio.

La innovacion tecnica destacable es el empaquetado: los parametros de inferencia y la configuracion de entrenamiento se incrustan directamente en el protobuf ONNX, eliminando la necesidad de archivos JSON, YAML o `download_checks.json` auxiliares. Esto permite que un pipeline nativo en C, C++, Rust, Swift o .NET lea la configuracion escaneando los ultimos 64 KB del archivo (ampliable a 512 KB para Roformer) sin cargar los pesos ni disponer de un runtime ONNX. Los modelos MDX y VR son compatibles con `audio-separator` y UVR apuntando `model_file_dir` a la carpeta de `.onnx`; los Roformer estan pensados exclusivamente para inferencia con ONNX Runtime, ya que `audio-separator` y UVR ejecutan Roformer desde el `.ckpt` original en PyTorch.

## Capacidades

- Separacion de fuentes de audio en stems (voz, instrumental, bateria, bajo, reverberacion, eco, etc., segun el modelo concreto).
- Eliminacion de voz (vocal remover) y separacion de pistas instrumentales.
- Eliminacion de reverb y eco (modelos tipo DeEcho-DeReverb).
- Inferencia sin dependencia de Python ni PyTorch mediante ONNX Runtime.
- Ejecucion en aceleradores hardware: CoreML, TensorRT, DirectML y CPU via los execution providers de ONNX Runtime.
- Lectura de metadatos de inferencia embebidos (`sep_meta`) y de configuracion de entrenamiento (`model_config`) en tiempo de ejecucion.
- Compatibilidad con `audio-separator` y UVR para los modelos MDX y VR.
- Uso en pipelines nativos en C, C++, Rust, Swift, .NET y cualquier lenguaje con binding de ONNX Runtime.

## Casos de uso

- Aplicaciones de escritorio nativas de edicion de audio: integrar la separacion de stems en una app en C++ o Rust sin empaquetar un runtime de Python, leyendo `sep_meta` para configurar la inferencia directamente desde el `.onnx`.
- Procesamiento en movil o dispositivos embebidos: desplegar la separacion de voz en una app iOS o Android usando el execution provider CoreML o NNAPI, aprovechando que el modelo es un unico archivo autocontenido.
- Pipelines de servidor de alto rendimiento: sustituir el arranque de PyTorch por peticion por una sesion ONNX Runtime persistente, reduciendo el coste de inicializacion en servicios de separacion de audio bajo demanda.
- Karaoke y remixes automatizados: generar pistas instrumentales limpias a partir de canciones para plataformas de karaoke o herramientas de remix, usando los modelos de vocal removal incluidos.
- Postproduccion de podcast y video: aplicar modelos DeEcho-DeReverb para limpiar grabaciones con reverberacion o eco antes de la mezcla final.
- Investigacion en separacion de fuentes: recuperar la configuracion original de entrenamiento desde `model_config` para reproducir o adaptar pipelines en PyTorch sin disponer del YAML original.
- Integracion en DAWs y plugins de audio: cargar el `.onnx` desde un plugin VST/AU escrito en C++ que use ONNX Runtime, evitando dependencias de Python en el host de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo concreto (MDX, VR o BSRoformer) y del tamano de chunk configurado en `sep_meta`.
- GPU recomendadas: no disponible. Al ejecutarse via ONNX Runtime, es compatible con los execution providers CUDA (NVIDIA), TensorRT, CoreML (Apple), DirectML (Windows) y CPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; la viabilidad dependera del modelo y del chunk. El repositorio completo ocupa 0,9 GB, lo que sugiere que los modelos individuales son manejables en memoria, pero no se especifica el consumo por modelo.
- Opciones de despliegue: ONNX Runtime (Python, C, C++, Rust, Swift, .NET), `audio-separator` y UVR para MDX y VR; pipelines nativos propios para Roformer.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Dependencias | Licencia | Contexto / dominio |
|---|---|---|---|---|
| AudioSeparatorONNX | ONNX autocontenido | ONNX Runtime | MIT | Separacion de audio |
| Modelos originales UVR5 / MDX-Net / BSRoformer (`.ckpt`) | PyTorch checkpoint | PyTorch + `audio-separator`/UVR | Segun modelo original (no disponible) | Separacion de audio |
| Demucs (Meta) | PyTorch | PyTorch | MIT (segun version) | Separacion de audio |
| Spleeter (Deezer) | TensorFlow | TensorFlow | MIT | Separacion de audio |

No se dispone de datos de rendimiento comparativo (SDR, SI-SDR u otras metricas) en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Los modelos Roformer (BSRoformer) en ONNX estan pensados solo para inferencia con ONNX Runtime; no funcionan con `audio-separator` ni UVR, que requieren el `.ckpt` original en PyTorch.
- La deteccion automatica de modelos en `audio-separator` se basa en el MD5 de los ultimos 10 MB; como los metadatos se anaden al final, el hash difiere del original en la base de datos UVR. Si falla la autodeteccion, hay que pasar los parametros explicitamente via `mdx_params` o `vr_params`.
- El repositorio no documenta el numero de parametros, la calidad de separacion ni metricas objetivas, lo que dificulta evaluar su rendimiento frente a los originales.
- No se especifican sesgos ni riesgos de alucinacion (no aplica a un modelo de audio), pero la calidad de separacion puede degradarse en mezclas densas o con instrumentos solapados en frecuencia.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia de los modelos originales de los que se derivan las conversiones, ya que no se detalla en la informacion.
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso ni validacion por parte de la comunidad; tratar como material reciente y no probado en produccion.
- El tamano de escaneo de metadatos en C (64 KB por defecto) puede ser insuficiente para Roformer grandes; el propio autor recomienda ampliarlo a 512 KB.

## Enlaces

- Hugging Face: https://huggingface.co/Acapellas/AudioSeparatorONNX
- `audio-separator`: https://github.com/nomadkaraoke/python-audio-separator
- Ultimate Vocal Remover (UVR): https://github.com/Anjok07/ultimatevocalremovergui
