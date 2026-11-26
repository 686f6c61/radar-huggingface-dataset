# Lumonopolis/lipsync-2d

## Resumen

lipsync-2d es un modelo compacto de predicción de visemas y curvas de boca para animación 2D en tiempo real, desarrollado por Lumonopolis. Con solo 3,41 M de parámetros y un peso ONNX de 6,55 MB en FP16 (3,57 MB en INT8), resuelve el problema de sincronización labial causal y en streaming sobre audio de 16 kHz, sin operaciones recurrentes ni GRU que penalicen la ejecución en WebGPU o WASM. Su relevancia radica en que ofrece una alternativa ligera y de licencia permisiva (Apache-2.0) a herramientas clásicas como Rhubarb Lip Sync, con mejoras sustanciales en métricas de F1 sobre fonemas anotados manualmente.

La arquitectura es una ConvNeXt-TCN puramente causal de 10 bloques con 288 canales, kernel de 5 y dilataciones (1, 2, 4, 8, 16, 1, 2, 4, 8, 16), lo que le da un campo receptivo de 5,0 s y un lookahead acotado de 2 fotogramas (40 ms). Genera tres salidas a 50 Hz: logits de 15 visemas canónicos de Oculus, logits de 9 formas de boca de Rhubarb y tres curvas continuas (jawOpen, lipRound, lipClose). Está pensado para integrarse en pipelines de VTuber, Live2D, Godot, Unity, Blender y sincronización labial en navegador del lado del cliente.

El modelo se entrenó exclusivamente con corpus comercialmente permisivos (LibriSpeech, FLEURS, Common Voice 19 y Zeroth-Korean) y se evaluó en un conjunto de test disjunto por hablante de 3.600 enunciados en siete idiomas, además de una evaluación zero-shot sobre fonemas TIMIT anotados a mano. Los resultados publicados lo sitúan claramente por encima de Rhubarb v1.14.0 y de una línea base MFCC estilo uLipSync en las métricas reportadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-TCN puramente causal, 10 bloques, channels=288, kernel_size=5, dilations=(1,2,4,8,16,1,2,4,8,16) |
| Parametros totales | 3,41 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Campo receptivo de 5,0 s; lookahead acotado de 2 fotogramas (40 ms) |
| Tipos de cuantizacion | FP32, FP16, INT8 (variantes offline y streaming) |
| Idiomas soportados | en, es, fr, de, ko, zh, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (offline y streaming, en FP32, FP16 e INT8) |

## Arquitectura y entrenamiento

El modelo es una red ConvNeXt-TCN causal de 10 bloques con 288 canales, kernel de 5 y un patrón de dilataciones (1, 2, 4, 8, 16, 1, 2, 4, 8, 16) que produce un campo receptivo de 5,0 s. No emplea operaciones recurrentes ni GRU, decisión explícita para maximizar el rendimiento en WebGPU y WASM. La entrada es audio mono a 16 kHz que pasa por una normalización RMS con compuerta de voz (objetivo -18 dBFS por encima de una compuerta de -46 dBFS, con tope de +20 dB) y por un espectrograma Log-Mel Slaney causal de 80 bins (ventana Hann periódica de 25 ms, salto de 10 ms, FFT de 512, rango 64-7800 Hz, escalado fijo `(logMel + 6.0) / 4.0`). La salida se emite a 50 Hz (paso de 20 ms) con tres cabeceras: 15 visemas Oculus (`sil, PP, FF, TH, DD, kk, CH, SS, nn, RR, aa, E, ih, oh, ou`), 9 formas de boca Rhubarb (`X, A, B, C, D, E, F, G, H`, con la lateral /l/ mapeada directamente a H) y tres curvas sigmoideas continuas en [0, 1] (`jawOpen, lipRound, lipClose`).

El entrenamiento usó exclusivamente las particiones oficiales `train` (27.427 enunciados de entrenamiento y 3.481 de validación, con muestreo equilibrado por idioma mediante raíz inversa) y se evaluó en particiones `test` oficiales estrictamente disjuntas por hablante (3.600 enunciados: 1.500 de LibriSpeech `test-clean` y 2.100 de FLEURS `test`). Las fuentes son 100 % permisivas para uso comercial: LibriSpeech `train-clean-100`/`dev-clean`/`test-clean` (CC-BY-4.0), Google FLEURS en `en_us, es_419, cmn_hans_cn, ko_kr, fr_fr, de_de, ja_jp` (CC-BY-4.0), Mozilla Common Voice 19 en `ja, fr, de, es, zh-CN` (CC0-1.0) y Zeroth-Korean (CC-BY-4.0). La supervisión del profesor se extrajo con `facebook/wav2vec2-xlsr-53-espeak-cv-ft`, con un mapeo auditado al 100 % de 392 tokens IPA a los 15 visemas y 9 formas Rhubarb, expansión de blancos CTC por punto medio de span con VAD de energía, pitch-warping Mel de ±4,5 semitonos, perturbaciones de ganancia, ruido y SpecAugment, y un 12 % de segmentos negativos sintéticos de silencio y ruido de sala.

## Capacidades

- Predicción de visemas a partir de audio: 15 visemas canónicos de Oculus y 9 formas de boca de Rhubarb, emitidos a 50 Hz.
- Generación de curvas continuas de mandíbula y labios (`jawOpen`, `lipRound`, `lipClose`) en el rango [0, 1] para rigs 2D.
- Inferencia causal en streaming con estado (`h_in=[1,1,1]`, `conv_cache_in=[1,288,248]`) y lookahead acotado de 40 ms.
- Soporte multilingüe en siete idiomas: inglés, español, francés, alemán, coreano, chino y japonés.
- Robustez frente a silencio y ruido de sala: tasa de falsos positivos dedicada del 0,00 % en el conjunto de test.
- Ejecución en navegador mediante ONNX Runtime Web con WebGPU o WASM, sin dependencias de servidor.
- No es un modelo de generación de texto, código, matemáticas ni visión; su única tarea es la sincronización labial y la predicción de formas de boca.

## Casos de uso

- VTubers y rigs Live2D: el modelo recibe el audio del micrófono en streaming y emite visemas y curvas de boca a 50 Hz con 40 ms de lookahead, suficiente para que el rig reaccione sin latencia perceptible en la animación facial.
- Sincronización labial en navegador: al ser un ONNX de 3,57 MB en INT8 y no usar operaciones recurrentes, puede ejecutarse del lado del cliente con WebGPU o WASM, evitando enviar audio a un servidor y reduciendo costes de infraestructura.
- Pipelines de animación en Godot, Unity y Blender: el modelo exporta formas Rhubarb directamente compatibles con flujos existentes de estas herramientas, lo que permite sustituir Rhubarb v1.14.0 por una alternativa con mayor F1 macro en las métricas publicadas.
- Doblaje y localización de contenido: con soporte para siete idiomas y un F1 macro por idioma entre 0,611 (japonés) y 0,791 (español), se puede usar para previsualizar o generar animación labial en versiones dobladas sin regrabar el rig.
- Personajes virtuales interactivos de baja latencia: la variante streaming (1,82 ms por fotograma, 11,0× tiempo real en WASM a 48 kHz) encaja en asistentes conversacionales con avatar donde el coste por fotograma debe ser mínimo.
- Herramientas de accesibilidad y avatares en tiempo real: la baja tasa de falsos positivos en silencio (1,93 % global, 0,00 % dedicada) evita el "flap" de mandíbula en pausas, algo crítico en avatares que hablan de forma intermitente.
- Preprocesado por lotes para animación pregrabada: la variante offline procesa audio completo y puede integrarse en scripts de render para generar pistas de visemas y curvas antes de la fase de animación.

## Benchmarks y rendimiento

Evaluación zero-shot sobre fonemas TIMIT anotados a mano (90 hablantes balanceados, 45 M / 45 F, una locución por hablante) frente a Rhubarb v1.14.0 con `-r phonetic`:

| Metrica | lipsync-2d (raw / Viterbi) | Rhubarb v1.14.0 |
|---|---|---|
| Macro-F1 9 Rhubarb | 0,615 / 0,616 | 0,432 |
| F1 bilabial `A` (p/b/m) | 0,557 / 0,555 | 0,323 |
| F1 labiodental `G` (f/v) | 0,565 / 0,568 | 0,583 |
| F1 lateral `H` (l) | 0,589 / 0,615 | 0,283 |
| MAE de inicio de frontera | 19,07 ms / 25,22 ms | 44,55 ms |
| Falsos positivos en silencio | 5,36 % / 5,70 % | 32,53 % |
| Macro-F1 femenino / masculino (0 st) | 0,611 / 0,619 | 0,427 / 0,438 |
| Macro-F1 con pitch +4 semitonos | 0,496 | 0,344 |

Evaluación en el test oficial disjunto por hablante de siete idiomas (3.600 enunciados):

| Metrica | lipsync-2d | Baseline MFCC estilo uLipSync |
|---|---|---|
| Macro-F1 9 Rhubarb | 0,736 | 0,271 |
| Weighted-F1 9 Rhubarb | 0,859 | 0,542 |
| Macro-F1 15 Oculus | 0,718 | no disponible |
| Weighted-F1 15 Oculus | 0,829 | no disponible |
| F1 bilabial `A` (p/b/m) | 0,733 | 0,131 |
| F1 labiodental `G` (f/v) | 0,656 | 0,054 |
| F1 lateral `H` (l) | 0,685 | 0,064 |
| MAE de inicio de frontera | 11,49 ms | 21,63 ms |
| Caída relativa de Macro-F1 con pitch +4 st | 4,59 % | no disponible |
| Falsos positivos en silencio (global) | 1,93 % | 8,25 % |
| Falsos positivos en silencio (dedicado) | 0,00 % | no disponible |

Macro-F1 por idioma en el test oficial: es=0,791, en=0,756, fr=0,702, de=0,683, zh=0,672, ko=0,668, ja=0,611.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en cualquiera de las variantes (pesos de 3,55 MB a 13,05 MB más buffers de estado de streaming y caché de convolución).
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte WebGPU; el modelo está diseñado para ejecutarse también en CPU vía WASM.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna, dado el reducido tamaño del modelo.
- Opciones de despliegue: ONNX Runtime (Web, Python, C++), ONNX Runtime Web con WebGPU o WASM, y cualquier runtime compatible con ONNX. No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 1,82 ms por fotograma en la variante streaming FP16, equivalente a 11,0× tiempo real en WASM a 48 kHz según el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Macro-F1 9 Rhubarb | Licencia | Formato |
|---|---|---|---|---|---|
| lipsync-2d (Lumonopolis) | 3,41 M | 5,0 s de campo receptivo, 40 ms de lookahead | 0,615 (TIMIT) / 0,736 (test 7 idiomas) | Apache-2.0 | ONNX FP32/FP16/INT8 |
| Rhubarb Lip Sync v1.14.0 | no disponible | offline | 0,432 (TIMIT) | no disponible en la información | herramienta CLI |
| Baseline MFCC estilo uLipSync | no disponible | no disponible | 0,271 (test 7 idiomas) | no disponible | no disponible |

No se dispone de datos de otros modelos de sincronización labial neuronal (por ejemplo, variantes basadas en wav2vec2 o modelos comerciales) en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento es más bajo en japonés (Macro-F1 0,611) y en audio con solapamiento de voces o contenido musical, según el propio autor.
- La evaluación zero-shot sobre TIMIT muestra una caída de Macro-F1 del 19,36 % relativo con pitch +4 semitonos (0,496 frente a 0,615 en condiciones base), lo que indica sensibilidad a voces agudas.
- Los falsos positivos en silencio en TIMIT son del 5,36-5,70 %, superiores al 0,00 % del conjunto dedicado de silencio/ruido del test oficial; el comportamiento puede variar según el dominio de audio.
- El modelo solo predice formas de boca y curvas; no genera animación completa ni resuelve el rigging, que debe aportarlo la herramienta de destino.
- No se han publicado análisis de sesgos demográficos más allá del balance masculino/femenino en TIMIT; el rendimiento por acento o variedad dialectal no está documentado.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las licencias de los corpus de entrenamiento (CC-BY-4.0 y CC0-1.0) si se redistribuyen derivados.
- No hay información sobre latencia en GPU de sobremesa ni sobre throughput en servidores; los datos de rendimiento se limitan a WASM a 48 kHz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lumonopolis/lipsync-2d
- Modelo profesor citado: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Dataset TIMIT usado en evaluación: https://huggingface.co/datasets/kylelovesllms/timit_asr
- Corpus LibriSpeech: https://www.openslr.org/12
- Corpus Google FLEURS: https://huggingface.co/datasets/google/fleurs
- Corpus Mozilla Common Voice 19: https://commonvoice.mozilla.org/datasets
- Corpus Zeroth-Korean: https://www.openslr.org/40
- Rhubarb Lip Sync: https://github.com/DanielSWolf/rhubarb-lip-sync
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
