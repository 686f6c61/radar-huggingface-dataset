# audiojs/restore

## Resumen

`audiojs/restore` es un modelo de restauración de voz desarrollado por audiojs que devuelve una grabación degradada (ruido, reverberación, códec, micrófono barato, banda limitada) a una calidad de estudio a 48 kHz de banda completa. Está entrenado para la librería `@audio/neural-restore`, que calcula la STFT, los fragmentos y el nivel en JavaScript y ejecuta el modelo mediante onnxruntime (Node o navegador con onnxruntime-web sobre WebGPU o wasm). El modelo se distribuye como un único archivo ONNX de 35,9 MB con pesos en float16 y cómputo en float32.

La arquitectura es una pila ConvNeXt de Vocos sobre tramas STFT (dimensión 512, 8 bloques) con dos capas de autoatención para modelar la cola de reverberación de la sala. Lee la magnitud logarítmica y la fase de cada trama y escribe un cambio de magnitud logarítmica (sin límite) y una rotación de la fase de entrada. Tiene 17,9 millones de parámetros y la STFT queda fuera del grafo.

Es relevante para pipelines de audio en producción que necesitan una restauración de una sola pasada, con pesos ligeros, ejecutable en el navegador o en Node sin GPU dedicada, y con soporte declarado para inglés, francés y ruso. El modelo se entrenó desde cero en 300.000 pasos sobre una Apple M4 Max GPU y se publicaron métricas de validación frente a baselines como DeepFilterNet3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (Vocos) sobre tramas STFT, dim 512, 8 bloques, 2 capas de autoatención |
| Parametros totales | 17,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (T dinámico en la dimensión STFT; inferencia en tramas de 10 s con solape de 1 s) |
| Tipos de cuantizacion | float16 (pesos) con cómputo float32; export float32 de 71,7 MB como origen |
| Idiomas soportados | en, fr, ru |
| Licencia | openrail |
| Formato de pesos | ONNX (opset 17), archivo `restore.fp16.onnx` |
| Entrada | `spec` [1, 2, 1025, T] float32 (STFT a 48 kHz, n_fft 2048, hop 512, Hann periódica, centrada con reflect padding, sin normalizar; re, im) |
| Salida | `spec_out` [1, 2, 1025, T] float32 (STFT restaurada, mismo layout) |
| Frecuencia de muestreo | 48 kHz (otras tasas se remuestrean a 48 kHz y de vuelta) |
| Nivel de entrada | −20 dBFS RMS |
| Tamano del archivo | 35.929.213 bytes (35,9 MB) |
| SHA-256 | `46eb6ebb05cc50bb6c3b1af87e3c4542bf30cedbcc356e2c68646d3bbf9a65f1` |

## Arquitectura y entrenamiento

El modelo es un regresor en el dominio STFT: recibe la parte real e imaginaria de la STFT de un canal a 48 kHz y produce la STFT restaurada con el mismo layout. La red es la pila ConvNeXt de Vocos (dimensión 512, 8 bloques) con dos capas de autoatención que modelan la cola de reverberación de la sala. La salida es un cambio de magnitud logarítmica sin acotar (una banda puede atenuarse 60 dB o elevarse desde cero) y una rotación de la fase de entrada que en la inicialización es la identidad. La STFT se calcula fuera del grafo, en JavaScript, mediante `@audio/neural-restore`.

El entrenamiento se hizo desde cero: 300.000 pasos en una Apple M4 Max GPU (PyTorch 2.14 sobre MPS, lote de 8 × 4 s) entre el 15 y el 22 de octubre de 2026. Se publican los pesos del paso 290.000, elegidos por mejor SI-SDR y distancia mel en el conjunto de validación. El proceso fue primero regresivo (STFT multirresolución, log-mel, L1 compleja comprimida sobre la rejilla del modelo para la fase y características de WavLM Base+, siguiendo la receta de FINALLY) y después adversario contra los discriminadores multiperiodo de HiFi-GAN y multirresolución de UnivNet con feature matching. Cada función de pérdida ve objetivo y estimación a través de un paso bajo en el ancho de banda medido del objetivo, de modo que corpus de 24 kHz entrenan junto a los de banda completa. Las entradas se generan al vuelo a partir de voces limpias: sala (respuesta medida o sintética), ruido, micrófono barato, compresor, clipping, límite de banda, MP3/AAC/Opus y palabras de 8 a 16 bits.

Los datos de entrenamiento incluyen VCTK 0.92 (44 h, 48 kHz, inglés, con los hablantes p232 y p257 reservados), LibriTTS-R train-clean-100 (54 h, 24 kHz), SIWIS (10 h, 44,1 kHz, francés), Dialogs (17,4 h, 44,1 kHz, ruso, con licencia OpenRAIL cuyas restricciones se propagan a modelos derivados), Supertonic 3 (ru 12 h, fr 8 h, en 4 h, 44,1 kHz), Pocket TTS (fr 6 h, en 3 h, 24 kHz), VocalSet (1,8 h, canto, 44,1 kHz), MIT IR Survey (135 salas, 32 kHz, solo entrenamiento) y MUSAN (6 h, ruido, 16 kHz). La validación usa el conjunto de test limpio de VoiceBank (p232, p257), nunca visto en entrenamiento.

## Capacidades

- Restauración de voz hablada y canto: elimina ruido, reverberación, artefactos de códec y limitación de banda, devolviendo audio a 48 kHz de banda completa.
- Extensión de ancho de banda: reconstruye contenido por encima del límite de banda de la entrada (por ejemplo, de 12 kHz a 24 kHz).
- Desreverberación: modela la cola de la sala mediante dos capas de autoatención.
- Corrección de fase: aplica una rotación de fase sobre la entrada, con la identidad como inicialización.
- Procesamiento de una sola pasada en el dominio STFT, con T dinámico.
- Soporte multilingüe declarado para inglés, francés y ruso.
- Ejecución en Node y en navegador mediante onnxruntime-web sobre WebGPU o wasm.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada distinto de voz ni modo de razonamiento.

## Casos de uso

- Restauración de grabaciones de voz en producción: el modelo procesa audio mono a 48 kHz en tramas de 10 s con solape de 1 s y crossfade de coseno alzado, lo que permite integrarlo en pipelines de postproducción para limpiar entrevistas, podcasts o notas de voz.
- Limpieza de audio de llamadas y VoIP: al entrenarse con cadenas que incluyen MP3, AAC, Opus, compresión y clipping, es adecuado para recuperar inteligibilidad en grabaciones telefónicas o de reuniones.
- Preprocesado para ASR: la mejora de SI-SDR (+6,0 frente a −5,2 de la entrada) y de PESQ (2,40 frente a 1,77) lo hace útil como etapa previa a sistemas de reconocimiento de voz que se degradan con ruido y reverberación.
- Restauración de canto: el conjunto VocalSet (1,8 h) aporta ejemplos de voz cantada, por lo que puede emplearse en la recuperación de grabaciones musicales de baja calidad.
- Procesamiento en el navegador: al ejecutarse con onnxruntime-web sobre WebGPU o wasm, permite restaurar audio en el cliente sin enviar los datos a un servidor, útil en aplicaciones de edición o mensajería.
- Extensión de banda en archivos históricos: reconstruye frecuencias altas en grabaciones limitadas a 12 kHz (por ejemplo, procedentes de LibriTTS-R o Pocket TTS) hasta 24 kHz.
- Normalización de niveles en pipelines de audio: la implementación de referencia lleva la entrada a −20 dBFS RMS, procesa y deshace la ganancia, lo que facilita integrarlo en cadenas con control de nivel.

## Benchmarks y rendimiento

24 pares de validación: hablantes de test de VoiceBank a través de la cadena (salas, ruido, micrófonos, códecs, límites de banda), cada salida al nivel de la referencia y puntuada a través del límite de banda del par. Los baselines son operaciones de `audio` sobre las mismas entradas (DeepFilterNet3 mediante `deepfilter()`; `auto('speech')`).

| Sistema | LSD ↓ | SI-SDR ↑ | PESQ ↑ | DNSMOS SIG | BAK | OVRL | banda, Hz |
|---|---|---|---|---|---|---|---|
| input | 3,30 | −5,2 | 1,77 | 2,50 | 2,41 | 1,97 | 16 947 |
| `deepfilter()` | 2,85 | −2,1 | 2,13 | 2,93 | 3,75 | 2,59 | 17 104 |
| `deepfilter(0)` | 2,71 | −2,1 | 2,07 | 2,91 | 3,90 | 2,63 | 16 366 |
| `auto('speech')` | 2,91 | −4,0 | 1,88 | 2,91 | 3,29 | 2,45 | 16 265 |
| estos pesos (paso 290k) | 0,79 | +6,0 | 2,40 | 3,21 | 3,91 | 2,89 | 24 000 |
| referencia | 0 | no disponible | 4,64 | 3,29 | 3,89 | 2,95 | 24 000 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el archivo ONNX pesa 35,9 MB, por lo que la huella de pesos es mínima y el consumo dominante será el de las activaciones de la STFT y del grafo.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una Apple M4 Max GPU.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del modelo es plausible que quepa en GPU de consumo, pero no se confirma en la información proporcionada.
- Opciones de despliegue: onnxruntime en Node y onnxruntime-web en navegador sobre WebGPU o wasm; la librería `@audio/neural-restore` gestiona la STFT, los fragmentos y el nivel, y `audio`'s `restore()` lo ejecuta.
- Latencia y throughput: no disponibles; la inferencia se hace en tramas de 10 s con solape de 1 s y crossfade de coseno alzado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `audiojs/restore` | 17,9 M | tramas de 10 s con solape de 1 s | openrail | ONNX (fp16) | Restauración de voz a 48 kHz, en/fr/ru |
| DeepFilterNet3 (vía `deepfilter()`) | no disponible | no disponible | no disponible | no disponible | Baseline de la model card; LSD 2,85, SI-SDR −2,1, PESQ 2,13 |
| `auto('speech')` | no disponible | no disponible | no disponible | no disponible | Baseline de la model card; LSD 2,91, SI-SDR −4,0, PESQ 1,88 |

No se dispone de datos de otros modelos comparables (parámetros, contexto o licencia) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no documentado; al ser un modelo de restauración de audio, el riesgo se traduce en artefactos o contenido espectral inventado, no evaluado en la model card.
- Limitaciones de idioma: solo se declaran inglés, francés y ruso; no hay datos para otros idiomas.
- Restricciones de licencia: la licencia es OpenRAIL; el conjunto Dialogs tiene restricciones de uso que se propagan a modelos derivados, aunque la model card indica que su manifiesto es separado y permite una variante limpia con un flag.
- El modelo espera entrada a 48 kHz y nivel −20 dBFS RMS; otras tasas se remuestrean y la implementación de referencia gestiona el nivel, por lo que un uso directo del ONNX sin ese preprocesado puede degradar los resultados.
- La STFT no está incluida en el grafo: hay que calcularla con los parámetros exactos (n_fft 2048, hop 512, Hann periódica, centrada con reflect padding, sin normalizar) para que la entrada sea válida.
- El modelo se entrenó con datos de salas y ruido de 16 y 32 kHz continuados sintéticamente a 24 kHz, lo que puede introducir sesgos en la respuesta de sala reconstruida.
- No se han publicado métricas de latencia ni de throughput, lo que dificulta estimar su comportamiento en producción en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/audiojs/restore
- Repositorio `@audio/neural-restore`: https://github.com/audiojs/neural/tree/main/packages/neural-restore
- Librería `audio`: https://github.com/audiojs/audio
- Scripts de entrenamiento e inferencia: `scripts/` en `@audio/neural-restore` (referenciados en la model card)
- No se han encontrado otros enlaces (papers, blogs, demos) en la información proporcionada.
