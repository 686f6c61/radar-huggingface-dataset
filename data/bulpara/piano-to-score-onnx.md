# bulpara/piano-to-score-onnx

## Resumen

`bulpara/piano-to-score-onnx` no es un modelo único, sino un paquete de ocho modelos ONNX que componen una cadena completa de transcripción musical: entra una grabación de piano y sale la información necesaria para reconstruir una partitura (notas con velocidad, tiempos de ataque y liberación, pulso, compás, reparto de manos y armadura). Lo publica Bulpara, un estudio de aplicaciones iOS/Android centrado en procesamiento local, y es la conversión a ONNX del motor que hay detrás de su herramienta web de audio a partitura, pensada para ejecutarse en el navegador con `onnxruntime-web` sobre WebGPU y WebAssembly.

El bundle ensambla tres trabajos previos: el modelo de transcripción de piano de alta resolución de Kong et al. (TASLP 2021), los modelos PM2S de conversión de MIDI de interpretación a partitura de Liu et al. (ISMIR 2022) y el etiquetador de audio EfficientAT (`mn10_as`) de Schmid et al. (ICASSP 2023), usado aquí como comprobación de que el audio contiene piano. La aportación propia es la ingeniería de exportación: grafos sin el preprocesado de espectrograma (que se calcula fuera), división del CRNN en una mitad convolucional y otra recurrente, pesos almacenados en fp16 con `Cast` a fp32 para reducir la descarga a la mitad y una variante con aritmética float16 real para GPUs con `shader-f16`.

Su relevancia es práctica: demuestra que una cadena de transcripción musical de investigación puede ejecutarse íntegramente en el cliente, sin subir audio a un servidor, con un repo de solo 0,1 GB y con verificación numérica frente a los originales en PyTorch (acuerdo de ~1e-6 en fp32). Es un artefacto de despliegue, no un modelo con benchmarks propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cadena de tres familias: CRNN convolucional + recurrente (transcripción), PM2S (cabezas sobre secuencia de notas codificada) y EfficientAT (CNN con destilación transformer-to-CNN) |
| Parámetros totales | No disponible (el repo completo, con los 8 ficheros y el manifiesto, ocupa 0,1 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; la entrada es una secuencia de tramas de audio (transcripción) o de notas (PM2S), sin ventana de contexto declarada |
| Tipos de cuantización | Pesos almacenados en fp16 con `Cast` a fp32 en el grafo (`transcribe-cnn.onnx`, `transcribe-rnn.onnx` y los cuatro PM2S); `transcribe-cnn.f16.onnx` usa aritmética float16 para GPUs con `shader-f16`. No se publican variantes INT8, GGUF ni Q4 |
| Idiomas soportados | No aplica (audio musical instrumental; sin idioma natural) |
| Licencia | CC BY 4.0 para siete ficheros; `piano-check.onnx` es MIT (EfficientAT). Los trabajos de origen son CC BY 4.0 en pesos y MIT en código |
| Formato de pesos | ONNX (`.onnx`) con pesos a media precisión; `manifest.json` con tamaño y SHA-256 de cada fichero; ejecutable con `onnxruntime` / `onnxruntime-web` |

Detalle de los ficheros y sus contratos de entrada/salida:

| Fichero | Función | Entrada → salida | Licencia |
|---|---|---|---|
| `transcribe-cnn.onnx` | Transcripción, mitad convolucional | log-mel (batch, frames, 229) → cuatro secuencias de rasgos de 768 | CC BY 4.0 |
| `transcribe-cnn.f16.onnx` | Ídem, aritmética float16 | igual | CC BY 4.0 |
| `transcribe-rnn.onnx` | Transcripción, mitad recurrente | cuatro secuencias de rasgos → onset, offset, frame, velocity (batch, frames, 88) | CC BY 4.0 |
| `pm2s-beat.onnx` | Pulso y compás | notas codificadas (batch, notes, 531) → beat, downbeat | CC BY 4.0 |
| `pm2s-hand.onnx` | Reparto de manos | notas codificadas → hand (batch, notes, 1) | CC BY 4.0 |
| `pm2s-key.onnx` | Armadura | notas codificadas → key (batch, notes, 12) | CC BY 4.0 |
| `pm2s-timesig.onnx` | Compás | notas codificadas → timesig (batch, notes, 1) | CC BY 4.0 |
| `piano-check.onnx` | Etiquetado AudioSet (¿hay piano?) | mel (batch, 128, frames) → 527 probabilidades | MIT |

## Arquitectura y entrenamiento

La transcripción usa el CRNN de Kong, Li, Song, Wan y Wang ("High-resolution Piano Transcription with Pedals by Regressing Onset and Offset Times", IEEE/ACM TASLP 2021), a partir del checkpoint `CRNN_note_F1=0.9677_pedal_F1=0.9186` publicado en Zenodo (4034264). El export descarta el modelo de pedal y prescinde del front-end de espectrograma: el log-mel se calcula fuera del grafo (STFT de 2048 con hop 160 a 16 kHz, 229 bandas mel Slaney de 30 Hz a 8 kHz, y 10·log10). El CRNN se corta donde terminan las convoluciones, de modo que `transcribe-cnn` produce cuatro secuencias de 768 rasgos y `transcribe-rnn` las convierte en las cuatro salidas por trama sobre 88 teclas: onset, offset, frame y velocidad. La resolución temporal queda, por tanto, ligada al hop de 160 muestras a 16 kHz (10 ms por trama).

Los cuatro modelos PM2S provienen de Liu, Kong, Morfi y Benetos ("Performance MIDI-to-score conversion by neural beat tracking", ISMIR 2022), con checkpoints en Zenodo (10520196) y código en `cheriell/PM2S`. Se exportan tomando como entrada la secuencia de notas ya codificada (`encode_note_sequence`, calculada también fuera del grafo) y se elimina la salida de tempo del modelo de pulso, que la cadena no utiliza. `piano-check.onnx` es EfficientAT `mn10_as` (Schmid, Koutini y Widmer, ICASSP 2023), un CNN destilado de un transformer para etiquetado de audio a gran escala, exportado desde su log-mel de 128 bandas con sigmoide en la salida. No hay información sobre volúmenes de datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información disponible; los pesos proceden tal cual de los checkpoints de origen, entrenados por sus autores.

La innovación del paquete es de despliegue: división del grafo en dos mitades para poder encadenar sesiones, eliminación de los front-ends de espectrograma, almacenamiento a media precisión con `Cast` explícito a fp32 que onnxruntime pliega al cargar la sesión, y una variante float16 pura para GPUs con `shader-f16`. El autor documenta scripts de reproducción en `scripts/` (`export_split.py`, `export_pm2s.py`, `export_presence.py`, `to_fp16.py`, `build_models.py`).

## Capacidades

- Transcripción de piano polifónico a nivel de nota: 88 teclas con onset, offset, activación por trama y velocidad.
- Detección de pulsos y de tiempos fuertes (beat y downbeat) sobre la secuencia de notas transcrita.
- Asignación automática de mano (izquierda/derecha) por nota.
- Estimación de armadura con 12 clases de salida y de compás como etiqueta por nota.
- Etiquetado de audio sobre 527 clases de AudioSet mediante `piano-check.onnx`, útil como filtro de presencia de piano o como comprobación de dominio.
- Ejecución en navegador: WebGPU y WebAssembly vía `onnxruntime-web`, sin dependencia de servidor ni de Python.
- Ejecución nativa con `onnxruntime` en CPU, GPU o aceleradores compatibles, al ser grafos ONNX estándar.
- No soporta generación de texto, tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio general más allá del etiquetado AudioSet.

## Casos de uso

- Transcripción en el navegador con privacidad: una web puede cargar los `.onnx` y convertir una grabación de piano en notas, pulsos y compases sin que el audio salga del dispositivo; el tamaño del repo (0,1 GB) permite incluso cachearlo en el cliente.
- Digitalización de archivo sonoro: procesar grabaciones de piano históricas o de estudio para obtener una representación simbólica (notas, tiempos, compás) que alimente un editor de partituras o un archivo MIDI, con la ventaja de que la cadena completa corre offline.
- Herramienta educativa de práctica pianística: comparar la interpretación del alumno con la partitura de referencia usando onset/offset y velocidad por nota, y señalar errores de pulso gracias a `pm2s-beat`.
- Filtrado previo en un pipeline de ingesta: ejecutar `piano-check.onnx` (EfficientAT, 527 clases) como clasificador barato para descartar audios que no contengan piano antes de gastar cómputo en la transcripción completa.
- Edición asistida en DAW o aplicación de notación: usar las salidas de `pm2s-hand`, `pm2s-key` y `pm2s-timesig` para autocompletar la disposición de manos, la armadura y el compás al importar una interpretación MIDI.
- Aplicación móvil offline (perfil habitual de Bulpara en iOS/Android): empaquetar los grafos con onnxruntime móvil para ofrecer transcripción sin conexión y sin cuenta de usuario.
- Investigación en MIR y reproducibilidad: emplear el bundle como referencia ONNX de los modelos de Kong et al. y Liu et al. para comparar implementaciones, ya que el autor documenta verificaciones numéricas frente a PyTorch y los scripts de exportación.
- Generación de datos anotados: producir automáticamente alineaciones nota-a-trama, pulsos y compases sobre corpus de piano para preentrenar o evaluar otros sistemas.

## Benchmarks y rendimiento

Los datos disponibles son los de los checkpoints originales y las comprobaciones de equivalencia del propio autor; no hay una evaluación independiente del bundle ONNX.

| Métrica | Valor | Origen |
|---|---|---|
| F1 de nota (transcripción de piano) | 0,9677 | Identificador del checkpoint original `CRNN_note_F1=0.9677_pedal_F1=0.9186` (Kong et al.; el modelo de pedal no se incluye en este repo) |
| F1 de pedal | 0,9186 | Ídem (referencia del checkpoint original, no reproducible con estos ficheros) |
| mAP AudioSet (`mn10_as`) | 47,1 | Nombre de los pesos de EfficientAT `mn10_as_mAP_471` |
| Equivalencia ONNX vs. PyTorch, fp32 | ~1e-6 de diferencia en las salidas | Verificación del autor sobre grabaciones reales |
| Equivalencia fp16 vs. original, notas | 0 notas alteradas en 2 de 3 piezas; 2 notas de 2.703 en la tercera | Verificación del autor |
| Equivalencia fp16 vs. original, estructura | 0 cambios en beat, downbeat, hand y key sobre 4.578 notas | Verificación del autor |
| Resultados de PM2S (beat, hand, key, timesig) | No disponible en la información proporcionada | — |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repo completo (ocho grafos más manifiesto) ocupa 0,1 GB, por lo que la huella en memoria de cada sesión es del orden de decenas de MB o pocos cientos, no verificada.
- GPU recomendadas: ninguna en particular; el diseño apunta a ejecución en cliente. Una RTX 4090, A100 o H100 están muy por encima de lo necesario. `transcribe-cnn.f16.onnx` requiere una GPU con soporte de `shader-f16` en WebGPU para aprovechar la aritmética float16.
- GPU de consumo: sí cabe con holgura en cualquier GPU de consumo reciente, y también en GPU integradas; la ruta WebAssembly permite además ejecución en CPU pura dentro del navegador.
- Opciones de despliegue: `onnxruntime-web` (WebGPU y WebAssembly), `onnxruntime` nativo en Python/C++/C#/Java, y `onnxruntime-mobile` para iOS y Android. Al ser ONNX estándar, también es posible servirlo con un runtime compatible con ONNX, aunque no es el objetivo declarado del paquete.
- Latencia y throughput: no disponibles. Dependen del backend (WebGPU frente a WASM), del número de tramas y de si se ejecutan las dos mitades del CRNN en sesiones separadas; el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Formato | Función | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `bulpara/piano-to-score-onnx` | ONNX (fp16 con Cast a fp32; variante f16) | Transcripción de piano + beat, compás, mano, armadura y filtro AudioSet | No disponible (repo de 0,1 GB) | No aplica | CC BY 4.0 (MIT en `piano-check`) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `piano_transcription_inference` (Kong et al., original) | PyTorch (`.pth`) | Transcripción de piano con pedal | No disponible en la información | No aplica | Código MIT, pesos CC BY 4.0 | Repo de GitHub + Zenodo 4034264 |
| PM2S (Liu et al., original) | PyTorch | MIDI de interpretación a partitura (beat, compás, mano, armadura) | No disponible en la información | No aplica | Código MIT, pesos CC BY 4.0 | GitHub + Zenodo 10520196 |
| EfficientAT `mn10_as` | PyTorch | Etiquetado AudioSet (527 clases) | No disponible en la información | No aplica | MIT | GitHub `fschmid56/EfficientAT` |

Frente a los originales, la ventaja del bundle es el formato (ONNX ejecutable en navegador y en móvil), la ausencia de dependencias de Python y el recorte a la mitad del peso de descarga por el almacenamiento en fp16; la contrapartida es la pérdida del modelo de pedal, la necesidad de replicar fuera del grafo el log-mel y el `encode_note_sequence`, y la ausencia de evaluación independiente. Otras alternativas del espacio (Basic Pitch de Spotify, MT3 de Magenta) no están cubiertas por la información disponible, por lo que no se comparan numéricamente aquí.

## Limitaciones y advertencias

- Dominio restringido a piano. No transcribe otros instrumentos ni mezclas; para audio polifónico general el resultado será incorrecto.
- El modelo de pedal está deliberadamente excluido, así que no se captura el uso de sostenido, lo que afecta a la duración efectiva de las notas en pasajes pedaleados.
- Dependencia de preprocesado externo: hay que implementar el log-mel (STFT 2048, hop 160, 16 kHz, 229 bandas Slaney de 30 Hz a 8 kHz, 10·log10) y el `encode_note_sequence` de PM2S fuera de los grafos; un desajuste en cualquiera de los dos invalida las salidas sin aviso.
- División en dos sesiones: `transcribe-cnn` y `transcribe-rnn` deben encadenarse en el orden correcto y con el mismo número de tramas; no es un grafo único autocontenido.
- Precisión: la variante fp16 de pesos alteró 2 notas de 2.703 en una de las tres piezas de prueba; en producción conviene validar con material propio, y `transcribe-cnn.f16.onnx` exige hardware con `shader-f16`.
- Salida de armadura con 12 clases y de compás como etiqueta por nota: es una estimación, no una lectura simbólica garantizada; la información no detalla el tratamiento de modo mayor/menor.
- Alucinación en sentido musical: falsos positivos de nota en pasajes con ruido, reverberación o pedal, y errores de octava o de fusión de notas rápidas; el propio autor reporta que el bundle no se ha evaluado de forma independiente.
- Licencia: CC BY 4.0 en siete de los ocho ficheros exige atribución a los autores originales (Kong et al., Liu et al.) y a Bulpara por la conversión; `piano-check.onnx` es MIT. Conviene revisar la cadena de atribución antes de uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el 2026-10-26 con 48 segundos de diferencia entre ambas marcas; no hay histórico deissues, versionado semántico ni garantía de mantenimiento.
- Idiomas: no aplica, pero implica que la herramienta no procesa letras, voz ni texto asociado a la grabación.
- Sin datos publicados de latencia, throughput ni consumo en dispositivos móviles, lo que impide dimensionar un despliegue en producción sin medir previamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bulpara/piano-to-score-onnx
- Herramienta de audio a partitura de AudioRinse: https://audiorinse.com/audio-to-sheet-music
- `onnxruntime` y `onnxruntime-web`: https://github.com/microsoft/onnxruntime
- Checkpoint de transcripción de piano (Kong et al.): https://zenodo.org/records/4034264
- Código `piano_transcription_inference`: https://github.com/qiuqiangkong/piano_transcription_inference
- Checkpoints PM2S (Liu et al.): https://zenodo.org/records/10520196
- Código PM2S: https://github.com/cheriell/PM2S
- Pesos y código EfficientAT: https://github.com/fschmid56/EfficientAT
- Sitio del autor (Bulpara): https://www.bulpara.com/
- Página de privacidad/enfoque del autor: https://www.bulpara.com/about
